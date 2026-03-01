(function initXep0184_0333MessageMarkers(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0184_0333_MARKERS) return;

  const xml = globalScope.SHITCORD67_XMPP_XML || {};
  const XMPP_CHAT_MARKERS_NAMESPACE = "urn:xmpp:chat-markers:0";
  const XMPP_RECEIPTS_NAMESPACE = "urn:xmpp:receipts";

  function xmppNodeHasXmlns(node, xmlns) {
    if (typeof xml.xmppNodeHasXmlns === "function") return xml.xmppNodeHasXmlns(node, xmlns);
    if (!node || typeof node.getAttribute !== "function") return false;
    const nodeXmlns = ((node.getAttribute("xmlns") || node.namespaceURI || "").toString().trim().toLowerCase());
    return nodeXmlns === (xmlns || "").toString().trim().toLowerCase();
  }

  function xmppReceiptRequestNode(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return null;
    return [...stanza.getElementsByTagName("request")]
      .find((node) => xmppNodeHasXmlns(node, XMPP_RECEIPTS_NAMESPACE)) || null;
  }

  function xmppReceiptReceivedId(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return "";
    const node = [...stanza.getElementsByTagName("received")]
      .find((entry) => xmppNodeHasXmlns(entry, XMPP_RECEIPTS_NAMESPACE)) || null;
    return (node?.getAttribute("id") || "").toString().trim();
  }

  function xmppChatMarkerPayload(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return null;
    const markerKinds = ["received", "displayed", "acknowledged"];
    for (const kind of markerKinds) {
      const node = [...stanza.getElementsByTagName(kind)]
        .find((entry) => xmppNodeHasXmlns(entry, XMPP_CHAT_MARKERS_NAMESPACE)) || null;
      if (!node) continue;
      return {
        type: kind,
        id: (node.getAttribute("id") || "").toString().trim()
      };
    }
    return null;
  }

  function xmppChatMarkableNode(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return null;
    return [...stanza.getElementsByTagName("markable")]
      .find((entry) => xmppNodeHasXmlns(entry, XMPP_CHAT_MARKERS_NAMESPACE)) || null;
  }

  globalScope.SHITCORD67_XEP_0184_0333_MARKERS = Object.freeze({
    XMPP_CHAT_MARKERS_NAMESPACE,
    XMPP_RECEIPTS_NAMESPACE,
    xmppReceiptRequestNode,
    xmppReceiptReceivedId,
    xmppChatMarkerPayload,
    xmppChatMarkableNode
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0184_0333-message-markers", globalScope.SHITCORD67_XEP_0184_0333_MARKERS);
  }
})(typeof window !== "undefined" ? window : globalThis);
