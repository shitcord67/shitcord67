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

  globalScope.SHITCORD67_XEP_0384_DEVICES = Object.freeze({
    xmppOmemoFetchDeviceListCore,
    xmppOmemoPublishDeviceListCore
  });
})(typeof window !== "undefined" ? window : globalThis);
