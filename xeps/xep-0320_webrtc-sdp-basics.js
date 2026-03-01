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

  globalScope.SHITCORD67_XEP_0320_WEBRTC_SDP_BASICS = Object.freeze({
    xmppParseIceCredsFromSdp,
    xmppParseDtlsFingerprintFromSdp,
    xmppParseRtcIceCandidateForJingle
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0320_webrtc-sdp-basics", globalScope.SHITCORD67_XEP_0320_WEBRTC_SDP_BASICS);
  }
})(typeof window !== "undefined" ? window : globalThis);
