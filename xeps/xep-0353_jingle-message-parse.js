(function initXep0353JingleMessageParse(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0353_JINGLE_MESSAGE_PARSE) return;

  const xml = globalScope.SHITCORD67_XMPP_XML || {};
  const XMPP_JINGLE_MESSAGE_INIT_COMPAT_NAMESPACES = ["urn:xmpp:jingle-message:0", "urn:xmpp:jingle-message:1"];
  const XMPP_JINGLE_MESSAGE_INIT_NAMESPACE_PREFIX = "urn:xmpp:jingle-message";
  const XMPP_JINGLE_RTP_NAMESPACE = "urn:xmpp:jingle:apps:rtp:1";
  const XMPP_JINGLE_AUDIO_NAMESPACE = "urn:xmpp:jingle:apps:rtp:audio";
  const XMPP_JINGLE_VIDEO_NAMESPACE = "urn:xmpp:jingle:apps:rtp:video";

  function xmppElementsByLocalName(root, name = "") {
    if (typeof xml.xmppElementsByLocalName === "function") return xml.xmppElementsByLocalName(root, name);
    if (!root || typeof root.getElementsByTagName !== "function") return [];
    const wanted = (name || "").toString().trim().toLowerCase();
    return wanted ? [...root.getElementsByTagName(wanted)] : [];
  }

  function xmppNodeHasXmlns(node, xmlns) {
    if (typeof xml.xmppNodeHasXmlns === "function") return xml.xmppNodeHasXmlns(node, xmlns);
    if (!node || typeof node.getAttribute !== "function") return false;
    const nodeXmlns = ((node.getAttribute("xmlns") || node.namespaceURI || "").toString().trim().toLowerCase());
    return nodeXmlns === (xmlns || "").toString().trim().toLowerCase();
  }

  function xmppNodeHasAnyXmlns(node, xmlnsList = []) {
    if (typeof xml.xmppNodeHasAnyXmlns === "function") return xml.xmppNodeHasAnyXmlns(node, xmlnsList);
    const list = Array.isArray(xmlnsList) ? xmlnsList : [xmlnsList];
    return list.some((xmlns) => xmppNodeHasXmlns(node, xmlns));
  }

  function xmppNodeHasXmlnsPrefix(node, prefix = "") {
    if (typeof xml.xmppNodeHasXmlnsPrefix === "function") return xml.xmppNodeHasXmlnsPrefix(node, prefix);
    if (!node || typeof node.getAttribute !== "function") return false;
    const normalizedPrefix = (prefix || "").toString().trim().toLowerCase();
    if (!normalizedPrefix) return false;
    const nodeXmlns = ((node.getAttribute("xmlns") || node.namespaceURI || "").toString().trim().toLowerCase());
    const scopedPrefix = normalizedPrefix.endsWith(":") ? normalizedPrefix : `${normalizedPrefix}:`;
    return nodeXmlns === normalizedPrefix || nodeXmlns.startsWith(scopedPrefix);
  }

  function xmppNodeXmlns(node) {
    if (typeof xml.xmppNodeXmlns === "function") return xml.xmppNodeXmlns(node);
    if (!node || typeof node.getAttribute !== "function") return "";
    const inline = (node.getAttribute("xmlns") || "").toString().trim().toLowerCase();
    if (inline) return inline;
    return (node.namespaceURI || "").toString().trim().toLowerCase();
  }

  function parseXmppJingleMessageAction(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return null;
    const actions = ["propose", "proceed", "accept", "retract", "reject", "ringing"];
    for (const action of actions) {
      const node = xmppElementsByLocalName(stanza, action)
        .find((entry) => (
          xmppNodeHasAnyXmlns(entry, XMPP_JINGLE_MESSAGE_INIT_COMPAT_NAMESPACES)
          || xmppNodeHasXmlnsPrefix(entry, XMPP_JINGLE_MESSAGE_INIT_NAMESPACE_PREFIX)
        )) || null;
      if (!node) continue;
      const id = (node.getAttribute("id") || stanza.getAttribute("id") || "").toString().trim();
      const media = action === "propose"
        ? xmppElementsByLocalName(node, "description")
          .map((desc) => {
            const mediaAttr = (desc.getAttribute("media") || "").toString().trim().toLowerCase();
            if (mediaAttr === "audio" || mediaAttr === "video") return mediaAttr;
            const xmlns = xmppNodeXmlns(desc);
            if (xmlns === XMPP_JINGLE_AUDIO_NAMESPACE || xmlns.endsWith(":audio")) return "audio";
            if (xmlns === XMPP_JINGLE_VIDEO_NAMESPACE || xmlns.endsWith(":video")) return "video";
            if (xmppNodeHasXmlns(desc, XMPP_JINGLE_RTP_NAMESPACE) && mediaAttr) return mediaAttr;
            return "";
          })
          .filter((value) => value === "audio" || value === "video")
        : [];
      return {
        action,
        id,
        media: [...new Set(media)]
      };
    }
    return null;
  }

  globalScope.SHITCORD67_XEP_0353_JINGLE_MESSAGE_PARSE = Object.freeze({
    parseXmppJingleMessageAction
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0353_jingle-message-parse", globalScope.SHITCORD67_XEP_0353_JINGLE_MESSAGE_PARSE);
  }
})(typeof window !== "undefined" ? window : globalThis);
