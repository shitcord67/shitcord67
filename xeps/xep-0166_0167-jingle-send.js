(function initXep0166_0167JingleSend(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0166_0167_JINGLE_SEND) return;

  function xmppNormalizeJingleSessionInfoName(info = "") {
    const infoName = (info || "ringing").toString().trim().toLowerCase();
    return ["ringing", "mute", "unmute", "hold", "active"].includes(infoName) ? infoName : "";
  }

  function xmppBuildJingleSessionInfoIq({
    to = "",
    sid = "",
    infoName = "ringing",
    jingleNamespace = "urn:xmpp:jingle:1",
    rtpInfoNamespace = "urn:xmpp:jingle:apps:rtp:info:1"
  } = {}, deps = {}) {
    if (!to || !sid || !infoName || !jingleNamespace || !rtpInfoNamespace) return null;
    const iqFactory = typeof deps.iqFactory === "function" ? deps.iqFactory : null;
    if (!iqFactory) return null;
    return iqFactory({ type: "set", to })
      .c("jingle", {
        xmlns: jingleNamespace,
        action: "session-info",
        sid
      })
      .c(infoName, { xmlns: rtpInfoNamespace })
      .up()
      .up();
  }

  function xmppNormalizeJingleContentModifyContents(contents = []) {
    return (Array.isArray(contents) ? contents : []).map((entry, index) => {
      const media = (entry?.media || "").toString().trim().toLowerCase();
      if (media !== "audio" && media !== "video") return null;
      const name = (entry?.name || `${media}${index}`).toString().trim() || `${media}${index}`;
      const senders = (entry?.senders || "both").toString().trim().toLowerCase() || "both";
      const creator = (entry?.creator || "initiator").toString().trim().toLowerCase() || "initiator";
      return { media, name, senders, creator };
    }).filter(Boolean);
  }

  function xmppBuildJingleContentModifyIq({
    to = "",
    sid = "",
    contents = [],
    jingleNamespace = "urn:xmpp:jingle:1",
    rtpNamespace = "urn:xmpp:jingle:apps:rtp:1"
  } = {}, deps = {}) {
    if (!to || !sid || !jingleNamespace || !rtpNamespace) return null;
    const iqFactory = typeof deps.iqFactory === "function" ? deps.iqFactory : null;
    if (!iqFactory) return null;
    const normalizedContents = xmppNormalizeJingleContentModifyContents(contents);
    if (normalizedContents.length === 0) return null;
    const iq = iqFactory({ type: "set", to })
      .c("jingle", {
        xmlns: jingleNamespace,
        action: "content-modify",
        sid
      });
    normalizedContents.forEach((content) => {
      iq.c("content", { creator: content.creator, name: content.name, senders: content.senders })
        .c("description", { xmlns: rtpNamespace, media: content.media })
        .up()
        .up();
    });
    iq.up();
    return iq;
  }

  function xmppNormalizeJingleTerminateReason(reason = "") {
    const normalized = (reason || "success").toString().trim().toLowerCase();
    const allowed = new Set([
      "alternative-session",
      "busy",
      "cancel",
      "connectivity-error",
      "decline",
      "expired",
      "failed-application",
      "failed-transport",
      "general-error",
      "gone",
      "incompatible-parameters",
      "media-error",
      "security-error",
      "success",
      "timeout",
      "unsupported-applications",
      "unsupported-transports"
    ]);
    return allowed.has(normalized) ? normalized : "success";
  }

  function xmppNormalizeJingleReasonText(text = "", { maxLength = 180 } = {}) {
    const message = (text || "").toString().trim();
    if (!message) return "";
    const cap = Math.max(1, Number(maxLength) || 180);
    return message.slice(0, cap);
  }

  function xmppBuildJingleSessionTerminateIq({
    to = "",
    sid = "",
    reason = "success",
    text = "",
    jingleNamespace = "urn:xmpp:jingle:1"
  } = {}, deps = {}) {
    if (!to || !sid || !jingleNamespace) return null;
    const iqFactory = typeof deps.iqFactory === "function" ? deps.iqFactory : null;
    if (!iqFactory) return null;
    const normalizedReason = xmppNormalizeJingleTerminateReason(reason);
    const message = xmppNormalizeJingleReasonText(text);
    const iq = iqFactory({ type: "set", to })
      .c("jingle", {
        xmlns: jingleNamespace,
        action: "session-terminate",
        sid
      })
      .c("reason")
      .c(normalizedReason)
      .up();
    if (message) iq.c("text").t(message).up();
    iq.up().up();
    return iq;
  }

  globalScope.SHITCORD67_XEP_0166_0167_JINGLE_SEND = Object.freeze({
    xmppNormalizeJingleSessionInfoName,
    xmppBuildJingleSessionInfoIq,
    xmppNormalizeJingleContentModifyContents,
    xmppBuildJingleContentModifyIq,
    xmppNormalizeJingleTerminateReason,
    xmppNormalizeJingleReasonText,
    xmppBuildJingleSessionTerminateIq
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0166_0167-jingle-send", globalScope.SHITCORD67_XEP_0166_0167_JINGLE_SEND);
  }
})(typeof window !== "undefined" ? window : globalThis);
