(function initXep0384Devices(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384_DEVICES) return;

  async function xmppOmemoFetchDeviceListCore(jid, {
    toBareJid,
    connection,
    namespaceCandidatesFn,
    namespaceNodeSetFn,
    sendIqPromiseFn,
    nodeHasAnyXmlnsFn,
    preferredNamespaceByJid,
    deviceListByJid,
    omemoNamespaces,
    debugEventFn
  } = {}) {
    const bare = typeof toBareJid === "function" ? toBareJid(jid || "") : "";
    if (!bare || !connection || typeof connection.sendIQ !== "function" || !globalThis.$iq) return [];
    const errors = [];
    const namespaceCandidates = typeof namespaceCandidatesFn === "function" ? namespaceCandidatesFn(bare) : [];
    for (const namespace of namespaceCandidates) {
      const nodeSet = namespaceNodeSetFn(namespace);
      const iq = globalThis.$iq({ type: "get", to: bare })
        .c("pubsub", { xmlns: "http://jabber.org/protocol/pubsub" })
        .c("items", { node: nodeSet.devicelistNode });
      try {
        // eslint-disable-next-line no-await-in-loop
        const stanza = await sendIqPromiseFn(connection, iq, 7000);
        const listNode = [...stanza.getElementsByTagName("list")]
          .find((node) => nodeHasAnyXmlnsFn(node, omemoNamespaces)) || null;
        if (!listNode) continue;
        const devices = [...listNode.getElementsByTagName("device")]
          .map((node) => (node.getAttribute("id") || "").toString().trim())
          .filter(Boolean);
        const unique = [...new Set(devices)];
        deviceListByJid.set(bare, unique);
        preferredNamespaceByJid.set(bare, nodeSet.namespace);
        return unique;
      } catch (error) {
        errors.push(`${nodeSet.namespace}: ${String(error?.message || error)}`);
      }
    }
    if (typeof debugEventFn === "function") {
      debugEventFn("error", "OMEMO device list fetch failed", {
        jid: bare,
        error: errors.join(" | ")
      });
    }
    return [];
  }

  async function xmppOmemoPublishDeviceListCore(ownBare, deviceIds, {
    connection,
    namespaces,
    namespaceNodeSetFn,
    sendIqPromiseFn,
    preferredNamespaceByJid,
    deviceListByJid,
    debugEventFn
  } = {}) {
    if (!ownBare || !connection || typeof connection.sendIQ !== "function" || !globalThis.$iq) return false;
    const ids = [...new Set((deviceIds || []).map((id) => String(id)).filter(Boolean))];
    if (ids.length === 0) return false;
    const namespaceList = [...new Set(
      (Array.isArray(namespaces) ? namespaces : [namespaces])
        .map((entry) => (entry || "").toString().trim())
        .filter(Boolean)
    )];
    let published = false;
    const errors = [];
    for (const namespace of namespaceList) {
      const nodeSet = namespaceNodeSetFn(namespace);
      const iq = globalThis.$iq({ type: "set", to: ownBare })
        .c("pubsub", { xmlns: "http://jabber.org/protocol/pubsub" })
        .c("publish", { node: nodeSet.devicelistNode })
        .c("item", { id: "current" })
        .c("list", { xmlns: nodeSet.namespace });
      ids.forEach((id) => {
        iq.c("device", { id }).up();
      });
      try {
        // eslint-disable-next-line no-await-in-loop
        await sendIqPromiseFn(connection, iq, 7000);
        published = true;
        preferredNamespaceByJid.set(ownBare, nodeSet.namespace);
      } catch (error) {
        errors.push(`${nodeSet.namespace}: ${String(error?.message || error)}`);
      }
    }
    if (published) {
      deviceListByJid.set(ownBare, ids);
      return true;
    }
    if (typeof debugEventFn === "function") {
      debugEventFn("error", "OMEMO device list publish failed", {
        jid: ownBare,
        error: errors.join(" | ") || "all namespaces failed"
      });
    }
    return false;
  }

  function xmppOmemoHandlePubsubEventCore(stanza, {
    bareJidFn,
    nodeHasXmlnsFn,
    nodeHasAnyXmlnsFn,
    namespaceNodeSetFn,
    omemoNamespaces,
    deviceListByJid,
    bundleCache,
    preferredNamespaceByJid,
    debugEventFn
  } = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return { handled: false, jid: "", changed: false };
    if (typeof bareJidFn !== "function" || typeof nodeHasXmlnsFn !== "function" || typeof namespaceNodeSetFn !== "function") {
      return { handled: false, jid: "", changed: false };
    }
    const eventNode = [...stanza.getElementsByTagName("event")]
      .find((node) => nodeHasXmlnsFn(node, "http://jabber.org/protocol/pubsub#event")) || null;
    if (!eventNode) return { handled: false, jid: "", changed: false };
    const fromBare = bareJidFn(stanza.getAttribute("from") || "");
    if (!fromBare) return { handled: false, jid: "", changed: false };

    const namespaceEntries = (Array.isArray(omemoNamespaces) ? omemoNamespaces : [omemoNamespaces])
      .map((namespace) => namespaceNodeSetFn(namespace))
      .filter((entry) => entry?.namespace && entry?.devicelistNode && entry?.bundleNodePrefix);
    if (namespaceEntries.length === 0) return { handled: false, jid: fromBare, changed: false };

    let handled = false;
    let changed = false;
    const invalidateBundlesForJid = () => {
      if (!bundleCache || typeof bundleCache.keys !== "function" || typeof bundleCache.delete !== "function") return;
      for (const key of [...bundleCache.keys()]) {
        if ((key || "").toString().startsWith(`${fromBare}|`)) {
          bundleCache.delete(key);
        }
      }
    };

    const itemNodes = [...eventNode.getElementsByTagName("items")];
    itemNodes.forEach((itemsNode) => {
      const node = (itemsNode.getAttribute("node") || "").toString().trim();
      if (!node) return;
      const namespaceEntry = namespaceEntries.find((entry) => node === entry.devicelistNode || node.startsWith(entry.bundleNodePrefix));
      if (!namespaceEntry) return;
      handled = true;
      preferredNamespaceByJid?.set(fromBare, namespaceEntry.namespace);
      if (node === namespaceEntry.devicelistNode) {
        const listNode = [...itemsNode.getElementsByTagName("list")]
          .find((entry) => nodeHasAnyXmlnsFn(entry, omemoNamespaces)) || null;
        const devices = listNode
          ? [...listNode.getElementsByTagName("device")]
            .map((entry) => (entry.getAttribute("id") || "").toString().trim())
            .filter(Boolean)
          : [];
        const unique = [...new Set(devices)];
        const previous = Array.isArray(deviceListByJid?.get(fromBare)) ? deviceListByJid.get(fromBare) : [];
        const nextSignature = unique.join(",");
        const previousSignature = previous.join(",");
        deviceListByJid?.set(fromBare, unique);
        invalidateBundlesForJid();
        changed = changed || nextSignature !== previousSignature;
        if (typeof debugEventFn === "function") {
          debugEventFn("message", "Received OMEMO device list pubsub update", {
            jid: fromBare,
            namespace: namespaceEntry.namespace,
            devices: unique.length
          });
        }
        return;
      }

      const deviceId = node.slice(namespaceEntry.bundleNodePrefix.length).trim();
      if (deviceId) {
        bundleCache?.delete?.(`${fromBare}|${deviceId}`);
        changed = true;
        if (typeof debugEventFn === "function") {
          debugEventFn("message", "Received OMEMO bundle pubsub update", {
            jid: fromBare,
            namespace: namespaceEntry.namespace,
            deviceId
          });
        }
      }
    });

    const deleteNodes = [
      ...eventNode.getElementsByTagName("delete"),
      ...eventNode.getElementsByTagName("purge")
    ];
    deleteNodes.forEach((deleteNode) => {
      const node = (deleteNode.getAttribute("node") || "").toString().trim();
      if (!node) return;
      const namespaceEntry = namespaceEntries.find((entry) => node === entry.devicelistNode || node.startsWith(entry.bundleNodePrefix));
      if (!namespaceEntry) return;
      handled = true;
      preferredNamespaceByJid?.set(fromBare, namespaceEntry.namespace);
      if (node === namespaceEntry.devicelistNode) {
        const previous = Array.isArray(deviceListByJid?.get(fromBare)) ? deviceListByJid.get(fromBare) : [];
        deviceListByJid?.set(fromBare, []);
        invalidateBundlesForJid();
        changed = changed || previous.length > 0;
        return;
      }
      const deviceId = node.slice(namespaceEntry.bundleNodePrefix.length).trim();
      if (deviceId) {
        changed = bundleCache?.delete?.(`${fromBare}|${deviceId}`) || changed;
      }
    });

    return { handled, jid: fromBare, changed };
  }

  globalScope.SHITCORD67_XEP_0384_DEVICES = Object.freeze({
    xmppOmemoFetchDeviceListCore,
    xmppOmemoPublishDeviceListCore,
    xmppOmemoHandlePubsubEventCore
  });
})(typeof window !== "undefined" ? window : globalThis);
