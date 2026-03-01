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

  function xmppJingleMessageAllowedActions() {
    return ["propose", "proceed", "accept", "retract", "reject", "ringing"];
  }

  function xmppNormalizeJingleMessageAction(action = "") {
    return (action || "").toString().trim().toLowerCase();
  }

  function xmppIsJingleMessageActionSupported(action = "") {
    return xmppJingleMessageAllowedActions().includes(xmppNormalizeJingleMessageAction(action));
  }

  function xmppJingleMessageNamespacesForFeatures(featureSet = new Set(), deps = {}) {
    const v0 = deps.namespaceV0 || "urn:xmpp:jingle-message:0";
    const v1 = deps.namespaceV1 || "urn:xmpp:jingle-message:1";
    const hasV0 = featureSet instanceof Set ? featureSet.has(v0) : false;
    const hasV1 = featureSet instanceof Set ? featureSet.has(v1) : false;
    const primary = hasV0 && !hasV1 ? v0 : v1;
    const list = (!hasV0 && !hasV1) ? [primary, v0] : [primary];
    return [...new Set(list.filter(Boolean))];
  }

  function xmppNormalizeJingleMessageMedia(media = [], deps = {}) {
    const fallback = Array.isArray(deps.defaultMedia) ? deps.defaultMedia : ["audio"];
    const wanted = Array.isArray(media) ? media : fallback;
    const normalized = [...new Set(
      wanted
        .map((item) => (item || "").toString().trim().toLowerCase())
        .filter((item) => item === "audio" || item === "video")
    )];
    return normalized.length > 0 ? normalized : fallback;
  }

  function xmppBuildJingleMessageStanza({
    to = "",
    action = "",
    sessionId = "",
    namespace = "",
    media = []
  } = {}, deps = {}) {
    if (typeof deps.$msg !== "function") return null;
    const target = (to || "").toString().trim();
    const id = (sessionId || "").toString().trim();
    const tag = xmppNormalizeJingleMessageAction(action);
    const xmlns = (namespace || "").toString().trim();
    if (!target || !id || !tag || !xmlns) return null;
    if (!xmppIsJingleMessageActionSupported(tag)) return null;
    const builder = deps.$msg({ to: target, type: "chat" }).c(tag, { xmlns, id });
    if (tag === "propose") {
      const medias = xmppNormalizeJingleMessageMedia(media, { defaultMedia: deps.defaultMedia });
      medias.forEach((mediaType) => {
        builder.c("description", { xmlns: deps.rtpNamespace || XMPP_JINGLE_RTP_NAMESPACE, media: mediaType }).up();
      });
    }
    return builder;
  }

  function xmppBuildJingleMessageStanzas({
    to = "",
    action = "",
    sessionId = "",
    namespaces = [],
    media = []
  } = {}, deps = {}) {
    const list = Array.isArray(namespaces) ? namespaces : [];
    return list
      .map((namespace) => xmppBuildJingleMessageStanza({
        to,
        action,
        sessionId,
        namespace,
        media
      }, deps))
      .filter(Boolean);
  }

  function xmppShouldLogJingleMessageCompatFallback(featureSet = new Set(), namespaceList = [], deps = {}) {
    const v0 = deps.namespaceV0 || "urn:xmpp:jingle-message:0";
    const v1 = deps.namespaceV1 || "urn:xmpp:jingle-message:1";
    const hasV0 = featureSet instanceof Set ? featureSet.has(v0) : false;
    const hasV1 = featureSet instanceof Set ? featureSet.has(v1) : false;
    return !hasV0 && !hasV1 && Array.isArray(namespaceList) && namespaceList.length > 1;
  }

  function xmppBuildJingleMessageSendPlan({
    to = "",
    action = "",
    sessionId = "",
    featureSet = new Set(),
    media = []
  } = {}, deps = {}) {
    const tag = xmppNormalizeJingleMessageAction(action);
    if (!to || !sessionId || !xmppIsJingleMessageActionSupported(tag)) return null;
    const namespaces = xmppJingleMessageNamespacesForFeatures(featureSet, {
      namespaceV0: deps.namespaceV0,
      namespaceV1: deps.namespaceV1
    });
    const normalizedMedia = xmppNormalizeJingleMessageMedia(media, {
      defaultMedia: deps.defaultMedia
    });
    return {
      to: (to || "").toString().trim(),
      action: tag,
      sessionId: (sessionId || "").toString().trim(),
      namespaces,
      media: normalizedMedia
    };
  }

  globalScope.SHITCORD67_XEP_0353_JINGLE_MESSAGE_PARSE = Object.freeze({
    parseXmppJingleMessageAction,
    xmppJingleMessageAllowedActions,
    xmppNormalizeJingleMessageAction,
    xmppIsJingleMessageActionSupported,
    xmppJingleMessageNamespacesForFeatures,
    xmppNormalizeJingleMessageMedia,
    xmppBuildJingleMessageStanza,
    xmppBuildJingleMessageStanzas,
    xmppShouldLogJingleMessageCompatFallback,
    xmppBuildJingleMessageSendPlan
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0353_jingle-message-parse", globalScope.SHITCORD67_XEP_0353_JINGLE_MESSAGE_PARSE);
  }
})(typeof window !== "undefined" ? window : globalThis);
