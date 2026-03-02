(function initXep0153PresencePhotoHash(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0153_PRESENCE_PHOTO_HASH) return;

  const xml = globalScope.SHITCORD67_XMPP_XML || {};

  function xmppNodeHasXmlns(node, xmlns) {
    if (typeof xml.xmppNodeHasXmlns === "function") return xml.xmppNodeHasXmlns(node, xmlns);
    if (!node || typeof node.getAttribute !== "function") return false;
    const nodeXmlns = ((node.getAttribute("xmlns") || node.namespaceURI || "").toString().trim().toLowerCase());
    return nodeXmlns === (xmlns || "").toString().trim().toLowerCase();
  }

  function xmppNodeText(node) {
    if (typeof xml.xmppNodeText === "function") return xml.xmppNodeText(node);
    return (node?.textContent || "").toString();
  }

  function xmppElementsByLocalName(root, name = "") {
    if (typeof xml.xmppElementsByLocalName === "function") return xml.xmppElementsByLocalName(root, name);
    if (!root || typeof root.getElementsByTagName !== "function") return [];
    const wanted = (name || "").toString().trim().toLowerCase();
    if (!wanted) return [];
    return [...root.getElementsByTagName("*")]
      .filter((node) => ((node?.localName || node?.nodeName || "").toString().trim().toLowerCase() === wanted));
  }

  function xmppPresencePhotoState(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") {
      return { hasUpdate: false, hasPhotoNode: false, hash: "", cleared: false };
    }
    const node = xmppElementsByLocalName(stanza, "x")
      .find((entry) => xmppNodeHasXmlns(entry, "vcard-temp:x:update")) || null;
    if (!node) return { hasUpdate: false, hasPhotoNode: false, hash: "", cleared: false };
    const photoNode = xmppElementsByLocalName(node, "photo")[0] || null;
    if (!photoNode) {
      return { hasUpdate: true, hasPhotoNode: false, hash: "", cleared: false };
    }
    const hash = xmppNodeText(photoNode).trim();
    return {
      hasUpdate: true,
      hasPhotoNode: true,
      hash,
      cleared: hash.length === 0
    };
  }

  function xmppPresencePhotoHash(stanza) {
    return xmppPresencePhotoState(stanza).hash;
  }

  globalScope.SHITCORD67_XEP_0153_PRESENCE_PHOTO_HASH = Object.freeze({
    xmppPresencePhotoState,
    xmppPresencePhotoHash
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0153_presence-photo-hash", globalScope.SHITCORD67_XEP_0153_PRESENCE_PHOTO_HASH);
  }
})(typeof window !== "undefined" ? window : globalThis);
