(function initXep0320WebrtcSdpBasics(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0320_WEBRTC_SDP_BASICS) return;

  function xmppParseIceCredsFromSdp(sdp = "") {
    const text = (sdp || "").toString();
    if (!text) return null;
    const ufragMatch = text.match(/^a=ice-ufrag:(.+)$/m);
    const pwdMatch = text.match(/^a=ice-pwd:(.+)$/m);
    const ufrag = (ufragMatch?.[1] || "").toString().trim();
    const pwd = (pwdMatch?.[1] || "").toString().trim();
    if (!ufrag && !pwd) return null;
    return { ufrag, pwd };
  }

  function xmppParseDtlsFingerprintFromSdp(sdp = "") {
    const text = (sdp || "").toString();
    if (!text) return null;
    const fingerprintMatch = text.match(/^a=fingerprint:([^\s]+)\s+(.+)$/m);
    const setupMatch = text.match(/^a=setup:(.+)$/m);
    if (!fingerprintMatch) return null;
    return {
      hash: (fingerprintMatch?.[1] || "sha-256").toString().trim().toLowerCase() || "sha-256",
      value: (fingerprintMatch?.[2] || "").toString().trim(),
      setup: (setupMatch?.[1] || "").toString().trim().toLowerCase()
    };
  }

  function xmppParseRtcIceCandidateForJingle(candidateText = "", {
    sdpMid = "",
    sdpMLineIndex = null
  } = {}) {
    const raw = (candidateText || "").toString().trim();
    if (!raw) return null;
    const tokenized = raw.startsWith("candidate:")
      ? raw.slice("candidate:".length).trim()
      : raw;
    const parts = tokenized.split(/\s+/).filter(Boolean);
    if (parts.length < 8) return null;
    const foundation = parts[0] || "";
    const component = Number(parts[1] || 0) || 1;
    const protocol = (parts[2] || "udp").toString().toLowerCase();
    const priority = Number(parts[3] || 0) || 1;
    const ip = parts[4] || "";
    const port = Number(parts[5] || 0) || 9;
    let type = "host";
    const typeIndex = parts.findIndex((entry) => entry.toLowerCase() === "typ");
    if (typeIndex >= 0 && parts[typeIndex + 1]) type = (parts[typeIndex + 1] || "host").toString().toLowerCase();
    if (!foundation || !protocol || !ip) return null;
    const normalizedMid = (sdpMid || "").toString().trim();
    const parsedLineIndex = Number(sdpMLineIndex);
    const normalizedLineIndex = Number.isFinite(parsedLineIndex) && parsedLineIndex >= 0
      ? parsedLineIndex
      : null;
    const inferredMedia = normalizedMid.toLowerCase().includes("video")
      ? "video"
      : (normalizedMid.toLowerCase().includes("audio") ? "audio" : "");
    return {
      foundation,
      component,
      protocol,
      priority,
      ip,
      port,
      type,
      sdpMid: normalizedMid,
      sdpMLineIndex: normalizedLineIndex,
      contentName: normalizedMid,
      media: inferredMedia
    };
  }

  function xmppBuildJingleTransportCreds(deps = {}) {
    const createIdFn = typeof deps.createIdFn === "function"
      ? deps.createIdFn
      : (() => Math.random().toString(16).slice(2));
    return {
      ufrag: `u${createIdFn().toString().slice(0, 10)}`,
      pwd: `p${createIdFn().toString().replace(/-/g, "").slice(0, 22)}`
    };
  }

  function xmppGeneratePseudoDtlsFingerprint() {
    const chunks = [];
    const hex = "0123456789ABCDEF";
    for (let i = 0; i < 32; i += 1) {
      const byte = `${hex[Math.floor(Math.random() * 16)]}${hex[Math.floor(Math.random() * 16)]}`;
      chunks.push(byte);
    }
    return chunks.join(":");
  }

  function xmppJingleCandidateToRtcInit(candidate = {}, index = 0, { remoteContents = [] } = {}) {
    const foundation = (candidate.foundation || `${index + 1}`).toString().trim();
    const component = Number(candidate.component || 1) || 1;
    const protocol = ((candidate.protocol || "udp").toString().trim().toLowerCase() || "udp");
    const priority = Number(candidate.priority || 1) || 1;
    const ip = (candidate.ip || "0.0.0.0").toString().trim();
    const port = Number(candidate.port || 9) || 9;
    const type = ((candidate.type || "host").toString().trim().toLowerCase() || "host");
    const contentName = (candidate.contentName || "").toString().trim();
    const contentMedia = (candidate.media || "").toString().trim().toLowerCase();
    const normalizedContents = Array.isArray(remoteContents) ? remoteContents : [];
    const contentIndex = contentName
      ? normalizedContents.findIndex((entry) => (entry?.name || "").toString().trim() === contentName)
      : -1;
    const mediaIndex = contentMedia
      ? normalizedContents.findIndex((entry) => (entry?.media || "").toString().trim().toLowerCase() === contentMedia)
      : -1;
    const fallbackIndex = Number(candidate.sdpMLineIndex);
    const resolvedIndex = contentIndex >= 0
      ? contentIndex
      : (mediaIndex >= 0
        ? mediaIndex
        : (Number.isFinite(fallbackIndex) && fallbackIndex >= 0 ? fallbackIndex : 0));
    const resolvedContent = normalizedContents[resolvedIndex] || null;
    const hasMatchedNamedContent = contentIndex >= 0;
    const sdpMid = hasMatchedNamedContent
      ? contentName
      : ((resolvedContent?.name || "").toString().trim() || contentName || String(resolvedIndex));
    return {
      candidate: `candidate:${foundation} ${component} ${protocol} ${priority} ${ip} ${port} typ ${type}`,
      sdpMid,
      sdpMLineIndex: resolvedIndex
    };
  }

  function xmppCallSessionMediaList(session = null, deps = {}) {
    const defaultMedia = Array.isArray(deps.defaultMedia) ? deps.defaultMedia : ["audio"];
    const raw = Array.isArray(session?.media) ? session.media : [];
    const media = [...new Set(
      raw
        .map((item) => (item || "").toString().trim().toLowerCase())
        .filter((item) => item === "audio" || item === "video")
    )];
    return media.length > 0 ? media : defaultMedia;
  }

  function xmppSdpDirectionFromJingleSenders(senders = "", localRole = "responder") {
    const normalizedSenders = (senders || "").toString().trim().toLowerCase();
    const role = (localRole || "").toString().trim().toLowerCase() === "initiator" ? "initiator" : "responder";
    if (normalizedSenders === "none") return "inactive";
    if (normalizedSenders === "initiator") return role === "initiator" ? "sendonly" : "recvonly";
    if (normalizedSenders === "responder") return role === "responder" ? "sendonly" : "recvonly";
    return "sendrecv";
  }

  function xmppNormalizeSdpExtmapDirection(direction = "", localRole = "responder") {
    const normalized = (direction || "").toString().trim().toLowerCase();
    if (["sendrecv", "sendonly", "recvonly", "inactive"].includes(normalized)) return normalized;
    if (["both", "initiator", "responder", "none"].includes(normalized)) {
      return xmppSdpDirectionFromJingleSenders(normalized, localRole);
    }
    return "";
  }

  function xmppJingleSendersFromSdpDirection(direction = "", localRole = "responder") {
    const normalized = (direction || "").toString().trim().toLowerCase();
    const role = (localRole || "").toString().trim().toLowerCase() === "initiator" ? "initiator" : "responder";
    if (normalized === "inactive") return "none";
    if (normalized === "sendrecv") return "both";
    if (normalized === "sendonly") return role === "initiator" ? "initiator" : "responder";
    if (normalized === "recvonly") return role === "initiator" ? "responder" : "initiator";
    return "both";
  }

  function xmppJingleSendersForLocalEnabled(enabled = true, localRole = "initiator") {
    if (enabled) return "both";
    return localRole === "initiator" ? "responder" : "initiator";
  }

  function xmppRemoteSendEnabledForSenders(senders = "both", localRole = "responder") {
    const normalized = (senders || "").toString().trim().toLowerCase();
    const local = (localRole || "").toString().trim().toLowerCase() === "initiator" ? "initiator" : "responder";
    const remote = local === "initiator" ? "responder" : "initiator";
    if (normalized === "none") return false;
    if (normalized === "both") return true;
    return normalized === remote;
  }

  function xmppNormalizeJingleRole(role = "", fallback = "responder") {
    const normalized = (role || "").toString().trim().toLowerCase();
    if (normalized === "initiator" || normalized === "responder") return normalized;
    return (fallback || "").toString().trim().toLowerCase() === "initiator" ? "initiator" : "responder";
  }

  function xmppInferLocalJingleRoleFromDirection(direction = "incoming") {
    return (direction || "").toString().trim().toLowerCase() === "outgoing" ? "initiator" : "responder";
  }

  function xmppInferRemoteJingleRole(localRole = "responder") {
    return xmppNormalizeJingleRole(localRole) === "initiator" ? "responder" : "initiator";
  }

  function xmppResolveLocalJingleRole({ session = null, jingle = null } = {}, deps = {}) {
    const persisted = xmppNormalizeJingleRole(session?.localJingleRole || "", "");
    if (persisted) return persisted;
    const bareJidFn = typeof deps.bareJidFn === "function"
      ? deps.bareJidFn
      : ((value) => (value || "").toString().trim().toLowerCase());
    const ownBare = bareJidFn(deps.ownJid || "");
    const initiator = bareJidFn(jingle?.initiator || "");
    const responder = bareJidFn(jingle?.responder || "");
    if (ownBare && initiator && ownBare === initiator) return "initiator";
    if (ownBare && responder && ownBare === responder) return "responder";
    return xmppInferLocalJingleRoleFromDirection(session?.direction || "incoming");
  }

  function xmppNormalizeDtlsInfo(dtls = null, { fallbackSetup = "actpass" } = {}) {
    if (!dtls || typeof dtls !== "object") return null;
    const value = (dtls.value || "").toString().trim();
    if (!value) return null;
    return {
      hash: (dtls.hash || "sha-256").toString().trim().toLowerCase() || "sha-256",
      value,
      setup: (dtls.setup || fallbackSetup).toString().trim().toLowerCase() || fallbackSetup
    };
  }

  function xmppBuildGeneratedLocalDtls({
    fallbackSetup = "actpass"
  } = {}, deps = {}) {
    const genFn = typeof deps.generatePseudoDtlsFingerprintFn === "function"
      ? deps.generatePseudoDtlsFingerprintFn
      : xmppGeneratePseudoDtlsFingerprint;
    return {
      hash: "sha-256",
      value: genFn(),
      setup: fallbackSetup
    };
  }

  function xmppResolveLocalDtlsFromPcSdp(localSdp = "", {
    fallbackSetup = "actpass"
  } = {}, deps = {}) {
    const parseFn = typeof deps.parseDtlsFingerprintFromSdpFn === "function"
      ? deps.parseDtlsFingerprintFromSdpFn
      : xmppParseDtlsFingerprintFromSdp;
    const parsed = parseFn(localSdp || "");
    return xmppNormalizeDtlsInfo(parsed, { fallbackSetup });
  }

  function xmppResolveLocalDtlsForSession({
    session = null,
    localSdp = "",
    fallbackSetup = "actpass"
  } = {}, deps = {}) {
    const fromPc = xmppResolveLocalDtlsFromPcSdp(localSdp, { fallbackSetup }, deps);
    if (fromPc?.value) {
      if (session && typeof session === "object") session.localDtls = fromPc;
      return fromPc;
    }
    const persisted = xmppNormalizeDtlsInfo(session?.localDtls, { fallbackSetup });
    if (persisted?.value) return persisted;
    const generated = xmppBuildGeneratedLocalDtls({ fallbackSetup }, deps);
    if (session && typeof session === "object") session.localDtls = generated;
    return generated;
  }

  function xmppApplyResolvedRolesToSession(session = null, jingle = null, deps = {}) {
    if (!session || typeof session !== "object") return null;
    const localRole = xmppResolveLocalJingleRole({ session, jingle }, deps);
    const remoteRole = xmppInferRemoteJingleRole(localRole);
    session.localJingleRole = localRole;
    session.remoteJingleRole = remoteRole;
    return { localRole, remoteRole };
  }

  globalScope.SHITCORD67_XEP_0320_WEBRTC_SDP_BASICS = Object.freeze({
    xmppParseIceCredsFromSdp,
    xmppParseDtlsFingerprintFromSdp,
    xmppParseRtcIceCandidateForJingle,
    xmppBuildJingleTransportCreds,
    xmppGeneratePseudoDtlsFingerprint,
    xmppJingleCandidateToRtcInit,
    xmppCallSessionMediaList,
    xmppSdpDirectionFromJingleSenders,
    xmppNormalizeSdpExtmapDirection,
    xmppJingleSendersFromSdpDirection,
    xmppJingleSendersForLocalEnabled,
    xmppRemoteSendEnabledForSenders,
    xmppNormalizeJingleRole,
    xmppInferLocalJingleRoleFromDirection,
    xmppInferRemoteJingleRole,
    xmppResolveLocalJingleRole,
    xmppNormalizeDtlsInfo,
    xmppBuildGeneratedLocalDtls,
    xmppResolveLocalDtlsFromPcSdp,
    xmppResolveLocalDtlsForSession,
    xmppApplyResolvedRolesToSession
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0320_webrtc-sdp-basics", globalScope.SHITCORD67_XEP_0320_WEBRTC_SDP_BASICS);
  }
})(typeof window !== "undefined" ? window : globalThis);
