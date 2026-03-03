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

  function xmppElementsByLocalName(root, name = "") {
    if (typeof xml.xmppElementsByLocalName === "function") return xml.xmppElementsByLocalName(root, name);
    if (!root || typeof root.getElementsByTagName !== "function") return [];
    const wanted = (name || "").toString().trim().toLowerCase();
    if (!wanted) return [];
    return [...root.getElementsByTagName("*")].filter((entry) => (
      ((entry?.localName || entry?.nodeName || "").toString().split(":").pop() || "").toLowerCase() === wanted
    ));
  }

  function xmppReceiptRequestNode(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return null;
    return xmppElementsByLocalName(stanza, "request")
      .find((node) => xmppNodeHasXmlns(node, XMPP_RECEIPTS_NAMESPACE)) || null;
  }

  function xmppReceiptReceivedId(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return "";
    const node = xmppElementsByLocalName(stanza, "received")
      .find((entry) => xmppNodeHasXmlns(entry, XMPP_RECEIPTS_NAMESPACE)) || null;
    return (node?.getAttribute("id") || "").toString().trim();
  }

  function xmppChatMarkerPayload(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return null;
    const markerKinds = ["received", "displayed", "acknowledged"];
    for (const kind of markerKinds) {
      const node = xmppElementsByLocalName(stanza, kind)
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
    return xmppElementsByLocalName(stanza, "markable")
      .find((entry) => xmppNodeHasXmlns(entry, XMPP_CHAT_MARKERS_NAMESPACE)) || null;
  }

  function appendXmppReceiptRequestNode(stanza, deps = {}) {
    if (!stanza) return stanza;
    if (xmppReceiptRequestNode(stanza)) return stanza;
    if (typeof deps.xmppEnsureBuilderAtMessageNodeFn === "function") deps.xmppEnsureBuilderAtMessageNodeFn(stanza);
    stanza.c("request", { xmlns: deps.receiptsNamespace || XMPP_RECEIPTS_NAMESPACE }).up();
    return stanza;
  }

  function buildXmppReceiptAckStanza({
    to = "",
    id = "",
    type = "chat"
  } = {}, deps = {}) {
    const target = (to || "").toString().trim();
    const refId = (id || "").toString().trim();
    if (!target || !refId || typeof deps.$msg !== "function") return null;
    return deps.$msg({ to: target, type: (type || "chat").toString().trim() || "chat" })
      .c("received", { xmlns: deps.receiptsNamespace || XMPP_RECEIPTS_NAMESPACE, id: refId });
  }

  function buildXmppChatMarkerAckStanza({
    to = "",
    id = "",
    type = "chat",
    marker = "received"
  } = {}, deps = {}) {
    const target = (to || "").toString().trim();
    const refId = (id || "").toString().trim();
    const markerName = (marker || "received").toString().trim().toLowerCase();
    if (!target || !refId || !["received", "displayed", "acknowledged"].includes(markerName) || typeof deps.$msg !== "function") {
      return null;
    }
    return deps.$msg({ to: target, type: (type || "chat").toString().trim() || "chat" })
      .c(markerName, { xmlns: deps.chatMarkersNamespace || XMPP_CHAT_MARKERS_NAMESPACE, id: refId });
  }

  function buildXmppDisplayedMarkerStanza({
    to = "",
    id = "",
    stanzaId = ""
  } = {}, deps = {}) {
    const target = (to || "").toString().trim();
    const refId = (id || "").toString().trim();
    const stanzaRef = (stanzaId || "").toString().trim();
    if (!target || !refId || typeof deps.$msg !== "function") return null;
    const attrs = { to: target, type: "chat" };
    if (stanzaRef) attrs.id = stanzaRef;
    return deps.$msg(attrs).c("displayed", {
      xmlns: deps.chatMarkersNamespace || XMPP_CHAT_MARKERS_NAMESPACE,
      id: refId
    });
  }

  function shouldSkipXmppDisplayedMarker(peerBare = "", targetId = "", deps = {}) {
    const peer = (peerBare || "").toString().trim();
    const target = (targetId || "").toString().trim();
    if (!peer || !target) return true;
    const previous = deps.lastSentDisplayedMarkerByPeerJid?.get?.(peer) || "";
    return previous === target;
  }

  globalScope.SHITCORD67_XEP_0184_0333_MARKERS = Object.freeze({
    XMPP_CHAT_MARKERS_NAMESPACE,
    XMPP_RECEIPTS_NAMESPACE,
    xmppReceiptRequestNode,
    xmppReceiptReceivedId,
    xmppChatMarkerPayload,
    xmppChatMarkableNode,
    appendXmppReceiptRequestNode,
    buildXmppReceiptAckStanza,
    buildXmppChatMarkerAckStanza,
    buildXmppDisplayedMarkerStanza,
    shouldSkipXmppDisplayedMarker
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0184_0333-message-markers", globalScope.SHITCORD67_XEP_0184_0333_MARKERS);
  }
})(typeof window !== "undefined" ? window : globalThis);
