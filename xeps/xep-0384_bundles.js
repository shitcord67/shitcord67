(function initXep0384Bundles(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384_BUNDLES) return;

  async function xmppOmemoPublishBundleCore(ownBare, bundle, {
    connection,
    namespaces,
    namespaceNodeSetFn,
    sendIqPromiseFn,
    preferredNamespaceByJid,
    signedPreKeyId,
    debugEventFn
  } = {}) {
    if (!ownBare || !bundle || !connection || typeof connection.sendIQ !== "function" || !globalThis.$iq) return false;
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
        .c("publish", { node: `${nodeSet.bundleNodePrefix}${bundle.deviceId}` })
        .c("item", { id: "current" })
        .c("bundle", { xmlns: nodeSet.namespace });
      iq.c("signedPreKeyPublic", { signedPreKeyId: String(bundle.signedPreKeyId || signedPreKeyId || 1) })
        .t(bundle.signedPreKeyPublic || "")
        .up();
      iq.c("signedPreKeySignature").t(bundle.signedPreKeySignature || "").up();
      iq.c("identityKey").t(bundle.identityKey || "").up();
      iq.c("prekeys");
      (bundle.preKeys || []).forEach((entry) => {
        iq.c("preKeyPublic", { preKeyId: String(entry.id) }).t(entry.key || "").up();
      });
      iq.up();
      try {
        // eslint-disable-next-line no-await-in-loop
        await sendIqPromiseFn(connection, iq, 7000);
        published = true;
        preferredNamespaceByJid.set(ownBare, nodeSet.namespace);
      } catch (error) {
        errors.push(`${nodeSet.namespace}: ${String(error?.message || error)}`);
      }
    }
    if (published) return true;
    if (typeof debugEventFn === "function") {
      debugEventFn("error", "OMEMO bundle publish failed", {
        jid: ownBare,
        error: errors.join(" | ") || "all namespaces failed"
      });
    }
    return false;
  }

  async function xmppOmemoFetchBundleCore(jid, deviceId, {
    toBareJid,
    connection,
    bundleCache,
    namespaceCandidatesFn,
    namespaceNodeSetFn,
    sendIqPromiseFn,
    nodeHasAnyXmlnsFn,
    nodeTextFn,
    omemoNamespaces,
    preferredNamespaceByJid,
    signedPreKeyId,
    debugEventFn
  } = {}) {
    const bare = typeof toBareJid === "function" ? toBareJid(jid || "") : "";
    if (!bare || !deviceId || !connection || typeof connection.sendIQ !== "function" || !globalThis.$iq) return null;
    const cacheKey = `${bare}|${deviceId}`;
    if (bundleCache?.has(cacheKey)) return bundleCache.get(cacheKey) || null;
    const errors = [];
    const namespaceCandidates = typeof namespaceCandidatesFn === "function" ? namespaceCandidatesFn(bare) : [];
    for (const namespace of namespaceCandidates) {
      const nodeSet = namespaceNodeSetFn(namespace);
      const iq = globalThis.$iq({ type: "get", to: bare })
        .c("pubsub", { xmlns: "http://jabber.org/protocol/pubsub" })
        .c("items", { node: `${nodeSet.bundleNodePrefix}${deviceId}` });
      try {
        // eslint-disable-next-line no-await-in-loop
        const stanza = await sendIqPromiseFn(connection, iq, 7000);
        const bundleNode = [...stanza.getElementsByTagName("bundle")]
          .find((node) => nodeHasAnyXmlnsFn(node, omemoNamespaces)) || null;
        if (!bundleNode) continue;
        const signedPreKeyPublicNode = bundleNode.getElementsByTagName("signedPreKeyPublic")[0] || null;
        const signedPreKeySignatureNode = bundleNode.getElementsByTagName("signedPreKeySignature")[0] || null;
        const identityKeyNode = bundleNode.getElementsByTagName("identityKey")[0] || null;
        const prekeysNode = bundleNode.getElementsByTagName("prekeys")[0] || null;
        const preKeyNodes = prekeysNode ? [...prekeysNode.getElementsByTagName("preKeyPublic")] : [];
        const bundle = {
          identityKey: nodeTextFn(identityKeyNode).trim(),
          signedPreKeyId: Number(signedPreKeyPublicNode?.getAttribute("signedPreKeyId") || signedPreKeyId || 1),
          signedPreKeyPublic: nodeTextFn(signedPreKeyPublicNode).trim(),
          signedPreKeySignature: nodeTextFn(signedPreKeySignatureNode).trim(),
          preKeys: preKeyNodes.map((node) => ({
            id: Number(node.getAttribute("preKeyId") || 0),
            key: nodeTextFn(node).trim()
          })).filter((entry) => entry.id && entry.key)
        };
        bundleCache?.set(cacheKey, bundle);
        preferredNamespaceByJid.set(bare, nodeSet.namespace);
        return bundle;
      } catch (error) {
        errors.push(`${nodeSet.namespace}: ${String(error?.message || error)}`);
      }
    }
    if (typeof debugEventFn === "function") {
      debugEventFn("error", "OMEMO bundle fetch failed", {
        jid: bare,
        deviceId,
        error: errors.join(" | ")
      });
    }
    return null;
  }

  globalScope.SHITCORD67_XEP_0384_BUNDLES = Object.freeze({
    xmppOmemoPublishBundleCore,
    xmppOmemoFetchBundleCore
  });
})(typeof window !== "undefined" ? window : globalThis);
