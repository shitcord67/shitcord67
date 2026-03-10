/*
 * XEP-0030/XEP-0166 call core bridge extracted from app.js.
 * Functions here intentionally bind to app globals at call time.
 */

function xmppSendIqResultForIncomingSet(stanza) {
  if (typeof XEP_0030_0166_CALL_DISCO_GLOBAL.xmppSendIqResultForIncomingSet !== "function") {
    const stanzaId = (stanza?.getAttribute?.("id") || "").toString().trim();
    const from = (stanza?.getAttribute?.("from") || "").toString().trim();
    if (!xmppConnection || !globalThis.$iq || !stanzaId) return false;
    xmppConnection.send(globalThis.$iq({ type: "result", id: stanzaId, ...(from ? { to: from } : {}) }));
    return true;
  }
  return XEP_0030_0166_CALL_DISCO_GLOBAL.xmppSendIqResultForIncomingSet(stanza, {
    xmppConnection,
    $iq: globalThis.$iq
  });
}

function xmppSendDiscoInfoResult({ id, to, node = "" } = {}) {
  if (typeof XEP_0030_0166_CALL_DISCO_GLOBAL.xmppSendDiscoInfoResult !== "function") {
    const iqId = (id || "").toString().trim();
    if (!xmppConnection || !globalThis.$iq || !iqId) return false;
    const result = globalThis.$iq({ type: "result", id: iqId, ...(to ? { to } : {}) })
      .c("query", { xmlns: "http://jabber.org/protocol/disco#info" });
    if (node) result.attrs({ node });
    result
      .c("identity", {
        category: "client",
        type: "web",
        name: "shitcord67"
      })
      .up();
    const features = Array.isArray(xmppClientDiscoFeatures?.()) ? xmppClientDiscoFeatures() : [];
    [...new Set(features)].forEach((feature) => {
      const value = (feature || "").toString().trim();
      if (!value) return;
      result.c("feature", { var: value }).up();
    });
    xmppConnection.send(result);
    return true;
  }
  return XEP_0030_0166_CALL_DISCO_GLOBAL.xmppSendDiscoInfoResult({ id, to, node }, {
    xmppConnection,
    $iq: globalThis.$iq,
    identityName: "shitcord67",
    features: xmppClientDiscoFeatures()
  });
}

function xmppSendDiscoInfoError({ id, to, node = "" } = {}) {
  if (typeof XEP_0030_0166_CALL_DISCO_GLOBAL.xmppSendDiscoInfoError !== "function") {
    const iqId = (id || "").toString().trim();
    if (!xmppConnection || !globalThis.$iq || !iqId) return false;
    const errorIq = globalThis.$iq({ type: "error", id: iqId, ...(to ? { to } : {}) })
      .c("query", { xmlns: "http://jabber.org/protocol/disco#info" });
    if (node) errorIq.attrs({ node });
    errorIq
      .up()
      .c("error", { type: "cancel" })
      .c("item-not-found", { xmlns: "urn:ietf:params:xml:ns:xmpp-stanzas" })
      .up()
      .c("text", { xmlns: "urn:ietf:params:xml:ns:xmpp-stanzas" })
      .t("Disco info node not found");
    xmppConnection.send(errorIq);
    return true;
  }
  return XEP_0030_0166_CALL_DISCO_GLOBAL.xmppSendDiscoInfoError({ id, to, node }, {
    xmppConnection,
    $iq: globalThis.$iq
  });
}

function xmppSendDiscoInfoResultForIncomingGet(stanza) {
  if (typeof XEP_0030_0166_CALL_DISCO_GLOBAL.xmppSendDiscoInfoResultForIncomingGet !== "function") {
    const query = stanza?.getElementsByTagName?.("query")?.[0] || null;
    const xmlns = (query?.getAttribute?.("xmlns") || "").toString();
    if (xmlns !== "http://jabber.org/protocol/disco#info") return false;
    const id = (stanza?.getAttribute?.("id") || "").toString().trim();
    const from = (stanza?.getAttribute?.("from") || "").toString().trim();
    const node = (query?.getAttribute?.("node") || "").toString().trim();
    const expectedNode = xmppCapsHash ? `${XMPP_CAPS_NODE}#${xmppCapsHash}` : "";
    if (node && expectedNode && node !== expectedNode) {
      return xmppSendDiscoInfoError({ id, to: from, node });
    }
    return xmppSendDiscoInfoResult({ id, to: from, node });
  }
  return XEP_0030_0166_CALL_DISCO_GLOBAL.xmppSendDiscoInfoResultForIncomingGet(stanza, {
    capsHash: xmppCapsHash,
    capsNode: XMPP_CAPS_NODE
  }, {
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
    ensureXmppCapsHashFn: ensureXmppCapsHash,
    addXmppDebugEventFn: addXmppDebugEvent,
    xmppSendDiscoInfoResultFn: xmppSendDiscoInfoResult,
    xmppConnection,
    $iq: globalThis.$iq,
    identityName: "shitcord67",
    features: xmppClientDiscoFeatures()
  });
}

function xmppBuildJingleTransportCreds() {
  if (typeof XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppBuildJingleTransportCreds === "function") {
    return XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppBuildJingleTransportCreds({
      createIdFn: createId
    });
  }
  return {
    ufrag: `u${createId().slice(0, 10)}`,
    pwd: `p${createId().replace(/-/g, "").slice(0, 22)}`
  };
}

function xmppGeneratePseudoDtlsFingerprint() {
  if (typeof XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppGeneratePseudoDtlsFingerprint === "function") {
    return XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppGeneratePseudoDtlsFingerprint();
  }
  const chunks = [];
  const hex = "0123456789ABCDEF";
  for (let i = 0; i < 32; i += 1) {
    const byte = `${hex[Math.floor(Math.random() * 16)]}${hex[Math.floor(Math.random() * 16)]}`;
    chunks.push(byte);
  }
  return chunks.join(":");
}

function xmppJingleCandidateToRtcInit(candidate = {}, index = 0, { session = null } = {}) {
  if (typeof XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppJingleCandidateToRtcInit === "function") {
    return XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppJingleCandidateToRtcInit(candidate, index, {
      remoteContents: Array.isArray(session?.remoteContents) ? session.remoteContents : []
    });
  }
  const foundation = (candidate.foundation || `${index + 1}`).toString().trim();
  const component = Number(candidate.component || 1) || 1;
  const protocol = ((candidate.protocol || "udp").toString().trim().toLowerCase() || "udp");
  const priority = Number(candidate.priority || 1) || 1;
  const ip = (candidate.ip || "0.0.0.0").toString().trim();
  const port = Number(candidate.port || 9) || 9;
  const type = ((candidate.type || "host").toString().trim().toLowerCase() || "host");
  const contentName = (candidate.contentName || "").toString().trim();
  const contentMedia = (candidate.media || "").toString().trim().toLowerCase();
  const remoteContents = Array.isArray(session?.remoteContents) ? session.remoteContents : [];
  const contentIndex = contentName
    ? remoteContents.findIndex((entry) => (entry?.name || "").toString().trim() === contentName)
    : -1;
  const mediaIndex = contentMedia
    ? remoteContents.findIndex((entry) => (entry?.media || "").toString().trim().toLowerCase() === contentMedia)
    : -1;
  const fallbackIndex = Number(candidate.sdpMLineIndex);
  const resolvedIndex = contentIndex >= 0
    ? contentIndex
    : (mediaIndex >= 0
      ? mediaIndex
      : (Number.isFinite(fallbackIndex) && fallbackIndex >= 0 ? fallbackIndex : 0));
  const resolvedContent = remoteContents[resolvedIndex] || null;
  const candidateMid = (candidate.sdpMid || "").toString().trim();
  const resolvedName = (resolvedContent?.name || "").toString().trim();
  const numericMid = /^\d+$/.test(candidateMid)
    ? candidateMid
    : (/^\d+$/.test(resolvedName) ? resolvedName : "");
  const sdpMid = numericMid || String(resolvedIndex);
  return {
    candidate: `candidate:${foundation} ${component} ${protocol} ${priority} ${ip} ${port} typ ${type}`,
    sdpMid,
    sdpMLineIndex: resolvedIndex
  };
}

function xmppCallSessionMediaList(session = null) {
  if (typeof XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppCallSessionMediaList === "function") {
    return XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppCallSessionMediaList(session, {
      defaultMedia: XMPP_CALL_DEFAULT_MEDIA
    });
  }
  const raw = Array.isArray(session?.media) ? session.media : [];
  const media = [...new Set(
    raw
      .map((item) => (item || "").toString().trim().toLowerCase())
      .filter((item) => item === "audio" || item === "video")
  )];
  return media.length > 0 ? media : XMPP_CALL_DEFAULT_MEDIA;
}

function xmppResolveLocalDtlsForSession(sessionId = "", { fallbackSetup = "actpass" } = {}) {
  if (typeof XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppResolveLocalDtlsForSession === "function") {
    const sid = (sessionId || "").toString().trim();
    const session = xmppCallSessionById.get(sid) || null;
    const pcEntry = xmppCallPeerConnectionBySessionId.get(sid) || null;
    return XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppResolveLocalDtlsForSession({
      session,
      localSdp: pcEntry?.pc?.localDescription?.sdp || "",
      fallbackSetup
    }, {
      parseDtlsFingerprintFromSdpFn: xmppParseDtlsFingerprintFromSdp,
      generatePseudoDtlsFingerprintFn: xmppGeneratePseudoDtlsFingerprint
    });
  }
  const sid = (sessionId || "").toString().trim();
  const session = xmppCallSessionById.get(sid) || null;
  const pcEntry = xmppCallPeerConnectionBySessionId.get(sid) || null;
  const fromPc = xmppParseDtlsFingerprintFromSdp(pcEntry?.pc?.localDescription?.sdp || "");
  if (fromPc?.value) {
    const dtls = {
      hash: fromPc.hash || "sha-256",
      value: fromPc.value,
      setup: fromPc.setup || fallbackSetup
    };
    if (session) session.localDtls = dtls;
    return dtls;
  }
  const persisted = session?.localDtls && typeof session.localDtls === "object" ? session.localDtls : null;
  if (persisted?.value) {
    return {
      hash: (persisted.hash || "sha-256").toString().trim().toLowerCase() || "sha-256",
      value: (persisted.value || "").toString().trim(),
      setup: (persisted.setup || fallbackSetup).toString().trim().toLowerCase() || fallbackSetup
    };
  }
  const generated = {
    hash: "sha-256",
    value: xmppGeneratePseudoDtlsFingerprint(),
    setup: fallbackSetup
  };
  if (session) session.localDtls = generated;
  return generated;
}

function xmppResolveLocalJingleRole({ session = null, jingle = null } = {}) {
  if (typeof XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppResolveLocalJingleRole === "function") {
    return XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppResolveLocalJingleRole({ session, jingle }, {
      ownJid: getPreferences().xmppJid || "",
      bareJidFn: xmppBareJid
    });
  }
  const persisted = (session?.localJingleRole || "").toString().trim().toLowerCase();
  if (persisted === "initiator" || persisted === "responder") return persisted;
  const ownBare = xmppBareJid(getPreferences().xmppJid || "");
  const initiator = xmppBareJid(jingle?.initiator || "");
  const responder = xmppBareJid(jingle?.responder || "");
  if (ownBare && initiator && ownBare === initiator) return "initiator";
  if (ownBare && responder && ownBare === responder) return "responder";
  return session?.direction === "outgoing" ? "initiator" : "responder";
}

function xmppSdpDirectionFromJingleSenders(senders = "", localRole = "responder") {
  if (typeof XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppSdpDirectionFromJingleSenders === "function") {
    return XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppSdpDirectionFromJingleSenders(senders, localRole);
  }
  const normalizedSenders = (senders || "").toString().trim().toLowerCase();
  const role = (localRole || "").toString().trim().toLowerCase() === "initiator" ? "initiator" : "responder";
  if (normalizedSenders === "none") return "inactive";
  if (normalizedSenders === "initiator") return role === "initiator" ? "sendonly" : "recvonly";
  if (normalizedSenders === "responder") return role === "responder" ? "sendonly" : "recvonly";
  return "sendrecv";
}

function xmppNormalizeSdpExtmapDirection(direction = "", localRole = "responder") {
  if (typeof XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppNormalizeSdpExtmapDirection === "function") {
    return XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppNormalizeSdpExtmapDirection(direction, localRole);
  }
  const normalized = (direction || "").toString().trim().toLowerCase();
  if (["sendrecv", "sendonly", "recvonly", "inactive"].includes(normalized)) return normalized;
  if (["both", "initiator", "responder", "none"].includes(normalized)) {
    return xmppSdpDirectionFromJingleSenders(normalized, localRole);
  }
  return "";
}

function xmppJingleSendersFromSdpDirection(direction = "", localRole = "responder") {
  if (typeof XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppJingleSendersFromSdpDirection === "function") {
    return XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppJingleSendersFromSdpDirection(direction, localRole);
  }
  const normalized = (direction || "").toString().trim().toLowerCase();
  const role = (localRole || "").toString().trim().toLowerCase() === "initiator" ? "initiator" : "responder";
  if (normalized === "inactive") return "none";
  if (normalized === "sendrecv") return "both";
  if (normalized === "sendonly") return role === "initiator" ? "initiator" : "responder";
  if (normalized === "recvonly") return role === "initiator" ? "responder" : "initiator";
  return "both";
}

function xmppJingleSendersForLocalEnabled(enabled = true, localRole = "initiator") {
  if (typeof XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppJingleSendersForLocalEnabled === "function") {
    return XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppJingleSendersForLocalEnabled(enabled, localRole);
  }
  if (enabled) return "both";
  return localRole === "initiator" ? "responder" : "initiator";
}

function xmppRemoteSendEnabledForSenders(senders = "both", localRole = "responder") {
  if (typeof XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppRemoteSendEnabledForSenders === "function") {
    return XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppRemoteSendEnabledForSenders(senders, localRole);
  }
  const normalized = (senders || "").toString().trim().toLowerCase();
  const local = (localRole || "").toString().trim().toLowerCase() === "initiator" ? "initiator" : "responder";
  const remote = local === "initiator" ? "responder" : "initiator";
  if (normalized === "none") return false;
  if (normalized === "both") return true;
  return normalized === remote;
}

function xmppParseSdpMediaSections(sdp = "") {
  if (typeof XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppParseSdpMediaSections === "function") {
    return XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppParseSdpMediaSections(sdp);
  }
  const text = (sdp || "").toString();
  if (!text) return [];
  const lines = text.split(/\r\n|\n/).map((line) => line.trim()).filter(Boolean);
  const sessionDefaults = {
    iceUfrag: "",
    icePwd: "",
    fingerprint: "",
    fingerprintHash: "sha-256",
    setup: ""
  };
  const sections = [];
  let current = null;
  const finishCurrent = () => {
    if (!current) return;
    if (!current.iceUfrag) current.iceUfrag = sessionDefaults.iceUfrag;
    if (!current.icePwd) current.icePwd = sessionDefaults.icePwd;
    if (!current.fingerprint) current.fingerprint = sessionDefaults.fingerprint;
    if (!current.fingerprintHash) current.fingerprintHash = sessionDefaults.fingerprintHash || "sha-256";
    if (!current.setup) current.setup = sessionDefaults.setup;
    current.payloadTypes = [...current.payloadTypeMap.values()];
    current.rtcpFeedback = current.rtcpFeedback.filter((entry) => entry.type);
    current.extmaps = current.extmaps.filter((entry) => entry.id && entry.uri);
    current.sources = [...current.sourceMap.values()];
    current.sourceGroups = current.sourceGroups.filter((entry) => entry.semantics && entry.sources.length > 0);
    sections.push(current);
  };
  const parseFmtpParams = (raw = "") => {
    const cleaned = raw.trim();
    if (!cleaned) return [];
    return cleaned.split(";").map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return null;
      const [name, value] = trimmed.split("=");
      return {
        name: (name || "").toString().trim(),
        value: (value || "").toString().trim()
      };
    }).filter((entry) => entry && entry.name);
  };
  lines.forEach((line) => {
    if (line.startsWith("m=")) {
      finishCurrent();
      const parts = line.slice(2).split(/\s+/);
      const kind = (parts[0] || "").toString().trim().toLowerCase();
      current = {
        kind,
        mid: "",
        direction: "sendrecv",
        iceUfrag: "",
        icePwd: "",
        fingerprint: "",
        fingerprintHash: "sha-256",
        setup: "",
        payloadTypeMap: new Map(),
        rtcpFeedback: [],
        extmaps: [],
        sourceMap: new Map(),
        sourceGroups: []
      };
      return;
    }
    const target = current || sessionDefaults;
    if (line.startsWith("a=ice-ufrag:")) {
      target.iceUfrag = line.slice("a=ice-ufrag:".length).trim();
      return;
    }
    if (line.startsWith("a=ice-pwd:")) {
      target.icePwd = line.slice("a=ice-pwd:".length).trim();
      return;
    }
    if (line.startsWith("a=fingerprint:")) {
      const raw = line.slice("a=fingerprint:".length).trim();
      const [hash, ...rest] = raw.split(/\s+/);
      target.fingerprintHash = (hash || "sha-256").toString().trim().toLowerCase() || "sha-256";
      target.fingerprint = rest.join(" ").trim();
      return;
    }
    if (line.startsWith("a=setup:")) {
      target.setup = line.slice("a=setup:".length).trim().toLowerCase();
      return;
    }
    if (!current) return;
    if (line.startsWith("a=mid:")) {
      current.mid = line.slice("a=mid:".length).trim();
      return;
    }
    if (line.startsWith("a=sendrecv") || line.startsWith("a=sendonly") || line.startsWith("a=recvonly") || line.startsWith("a=inactive")) {
      current.direction = line.slice(2).trim();
      return;
    }
    if (line.startsWith("a=rtpmap:")) {
      const raw = line.slice("a=rtpmap:".length).trim();
      const [pt, codecSpec] = raw.split(/\s+/, 2);
      if (!pt || !codecSpec) return;
      const [codec, clock, channels] = codecSpec.split("/");
      const id = Number(pt) || 0;
      if (!id) return;
      current.payloadTypeMap.set(id, {
        id,
        name: (codec || "").toString().trim(),
        clockrate: Number(clock) || 0,
        channels: Number(channels) || 0,
        rtcpFeedback: [],
        parameters: []
      });
      return;
    }
    if (line.startsWith("a=fmtp:")) {
      const raw = line.slice("a=fmtp:".length).trim();
      const [pt, params] = raw.split(/\s+/, 2);
      const id = Number(pt) || 0;
      const entry = current.payloadTypeMap.get(id);
      if (!entry) return;
      entry.parameters = parseFmtpParams(params || "");
      return;
    }
    if (line.startsWith("a=rtcp-fb:")) {
      const raw = line.slice("a=rtcp-fb:".length).trim();
      const [pt, type, subtype] = raw.split(/\s+/, 3);
      if (!pt || !type) return;
      const feedback = {
        type: type.toString().trim().toLowerCase(),
        subtype: (subtype || "").toString().trim().toLowerCase()
      };
      if (pt === "*") {
        current.rtcpFeedback.push(feedback);
        return;
      }
      const id = Number(pt) || 0;
      const payload = current.payloadTypeMap.get(id);
      if (!payload) return;
      payload.rtcpFeedback.push(feedback);
      return;
    }
    if (line.startsWith("a=extmap:")) {
      const raw = line.slice("a=extmap:".length).trim();
      const [idPart, uri, ...rest] = raw.split(/\s+/);
      if (!idPart || !uri) return;
      const [idRaw, dirRaw] = idPart.split("/", 2);
      const id = Number(idRaw) || 0;
      if (!id) return;
      current.extmaps.push({
        id,
        uri: uri.toString().trim(),
        direction: (dirRaw || "").toString().trim().toLowerCase(),
        attributes: rest.join(" ").trim()
      });
      return;
    }
    if (line.startsWith("a=ssrc-group:")) {
      const raw = line.slice("a=ssrc-group:".length).trim();
      const [semantics, ...ssrcs] = raw.split(/\s+/);
      const sources = ssrcs.map((value) => Number(value) || 0).filter((value) => value > 0);
      if (!semantics || sources.length === 0) return;
      current.sourceGroups.push({
        semantics: semantics.toString().trim().toUpperCase(),
        sources
      });
      return;
    }
    if (line.startsWith("a=ssrc:")) {
      const raw = line.slice("a=ssrc:".length).trim();
      const [ssrcToken, param] = raw.split(/\s+/, 2);
      const ssrc = Number(ssrcToken) || 0;
      if (!ssrc || !param) return;
      const [name, value] = param.split(":", 2);
      if (!name) return;
      const entry = current.sourceMap.get(ssrc) || { ssrc, parameters: [] };
      entry.parameters.push({
        name: (name || "").toString().trim(),
        value: (value || "").toString().trim()
      });
      current.sourceMap.set(ssrc, entry);
    }
  });
  finishCurrent();
  return sections;
}

function xmppBuildJingleContentsFromSdp(sdp = "", { localRole = "initiator" } = {}) {
  if (typeof XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppBuildJingleContentsFromSdp === "function") {
    return XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppBuildJingleContentsFromSdp(sdp, { localRole });
  }
  const sections = xmppParseSdpMediaSections(sdp);
  return sections
    .filter((section) => section.kind === "audio" || section.kind === "video")
    .map((section, index) => ({
      name: section.mid || `${section.kind}${index}`,
      media: section.kind,
      senders: xmppJingleSendersFromSdpDirection(section.direction, localRole),
      payloadTypes: section.payloadTypes,
      rtcpFeedback: section.rtcpFeedback,
      extmaps: section.extmaps,
      sources: section.sources,
      sourceGroups: section.sourceGroups,
      transport: {
        ufrag: section.iceUfrag || "",
        pwd: section.icePwd || "",
        hash: section.fingerprintHash || "sha-256",
        fingerprint: section.fingerprint || "",
        setup: section.setup || ""
      }
    }));
}

function xmppAlignRemoteJingleContentsToLocalOffer(contents = [], localOfferSdp = "") {
  if (typeof XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppAlignRemoteJingleContentsToLocalOffer === "function") {
    return XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppAlignRemoteJingleContentsToLocalOffer(contents, localOfferSdp);
  }
  const desiredOrder = xmppParseSdpMediaSections(localOfferSdp)
    .filter((section) => section.kind === "audio" || section.kind === "video")
    .map((section, index) => ({
      name: (section.mid || `${section.kind}${index}`).toString().trim() || `${section.kind}${index}`,
      media: section.kind
    }));
  if (desiredOrder.length === 0) return Array.isArray(contents) ? contents : [];
  const normalized = (Array.isArray(contents) ? contents : [])
    .map((entry, index) => {
      const media = (entry?.media || "").toString().trim().toLowerCase();
      if (media !== "audio" && media !== "video") return null;
      const name = (entry?.name || `${media}${index}`).toString().trim() || `${media}${index}`;
      return { ...entry, name, media };
    })
    .filter(Boolean);
  const used = new Set();
  const aligned = [];
  desiredOrder.forEach((target) => {
    let chosenIndex = normalized.findIndex((entry, index) => !used.has(index) && entry.name === target.name);
    if (chosenIndex < 0) {
      chosenIndex = normalized.findIndex((entry, index) => !used.has(index) && entry.media === target.media);
    }
    if (chosenIndex >= 0) {
      used.add(chosenIndex);
      aligned.push({
        ...normalized[chosenIndex],
        name: target.name,
        media: target.media
      });
      return;
    }
    aligned.push({
      name: target.name,
      media: target.media,
      senders: "both",
      payloadTypes: [],
      rtcpFeedback: [],
      extmaps: [],
      sources: [],
      sourceGroups: [],
      transport: null
    });
  });
  return aligned;
}

function xmppAlignLocalJingleContentsToRemoteSession(localContents = [], remoteContents = []) {
  if (typeof XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppAlignLocalJingleContentsToRemoteSession === "function") {
    return XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppAlignLocalJingleContentsToRemoteSession(localContents, remoteContents);
  }
  const local = (Array.isArray(localContents) ? localContents : [])
    .map((entry, index) => {
      const media = (entry?.media || "").toString().trim().toLowerCase();
      if (media !== "audio" && media !== "video") return null;
      const name = (entry?.name || `${media}${index}`).toString().trim() || `${media}${index}`;
      return { ...entry, name, media };
    })
    .filter(Boolean);
  const remote = (Array.isArray(remoteContents) ? remoteContents : [])
    .map((entry, index) => {
      const media = (entry?.media || "").toString().trim().toLowerCase();
      if (media !== "audio" && media !== "video") return null;
      const name = (entry?.name || `${media}${index}`).toString().trim() || `${media}${index}`;
      return { ...entry, name, media };
    })
    .filter(Boolean);
  if (local.length === 0 || remote.length === 0) return local;
  const used = new Set();
  const aligned = [];
  remote.forEach((target) => {
    let chosenIndex = local.findIndex((entry, index) => !used.has(index) && entry.name === target.name);
    if (chosenIndex < 0) {
      chosenIndex = local.findIndex((entry, index) => !used.has(index) && entry.media === target.media);
    }
    if (chosenIndex < 0) return;
    used.add(chosenIndex);
    aligned.push({
      ...local[chosenIndex],
      name: target.name,
      media: target.media
    });
  });
  local.forEach((entry, index) => {
    if (used.has(index)) return;
    aligned.push(entry);
  });
  return aligned.length > 0 ? aligned : local;
}


function xmppBuildJingleRtpContent(builder, {
  media = "audio",
  name = "",
  creator = "initiator",
  senders = "both",
  transport = null,
  dtls = null,
  rtcpMux = true,
  payloadTypes = [],
  rtcpFeedback = [],
  extmaps = [],
  sources = [],
  sourceGroups = []
} = {}) {
  if (typeof XEP_0166_0167_JINGLE_SEND_GLOBAL.xmppBuildJingleRtpContent === "function") {
    return XEP_0166_0167_JINGLE_SEND_GLOBAL.xmppBuildJingleRtpContent(builder, {
      media,
      name,
      creator,
      senders,
      transport,
      dtls,
      rtcpMux,
      payloadTypes,
      rtcpFeedback,
      extmaps,
      sources,
      sourceGroups
    }, {
      xep0320: XEP_0320_WEBRTC_SDP_BASICS_GLOBAL,
      namespaces: {
        jingleRtpNamespace: XMPP_JINGLE_RTP_NAMESPACE,
        rtcpFbNamespace: XMPP_JINGLE_RTP_RTCP_FB_NAMESPACE,
        hdrExtNamespace: XMPP_JINGLE_RTP_HDR_EXT_NAMESPACE,
        ssmaNamespace: XMPP_JINGLE_RTP_SSMA_NAMESPACE,
        rtcpMuxNamespace: XMPP_JINGLE_RTP_RTCP_MUX_NAMESPACE,
        iceUdpNamespace: XMPP_JINGLE_ICE_UDP_NAMESPACE,
        dtlsNamespace: "urn:xmpp:jingle:apps:dtls:0"
      },
      buildJingleTransportCredsFn: xmppBuildJingleTransportCreds,
      generatePseudoDtlsFingerprintFn: xmppGeneratePseudoDtlsFingerprint
    });
  }
  return builder;
}

function xmppBuildJingleBundleGroup(builder, contentNames = []) {
  if (typeof XEP_0166_0167_JINGLE_SEND_GLOBAL.xmppBuildJingleBundleGroup === "function") {
    return XEP_0166_0167_JINGLE_SEND_GLOBAL.xmppBuildJingleBundleGroup(builder, contentNames, {
      xep0320: XEP_0320_WEBRTC_SDP_BASICS_GLOBAL,
      namespaces: {
        groupingNamespace: XMPP_JINGLE_GROUPING_NAMESPACE
      }
    });
  }
  return builder;
}

function xmppSendJingleSessionInfo(peerJid, sessionId, {
  info = "ringing",
  onSuccess = null,
  onError = null,
  retryOnRetarget = true
} = {}) {
  if (typeof XEP_0166_0167_JINGLE_SEND_GLOBAL.xmppSendJingleSessionInfo !== "function") return false;
  return XEP_0166_0167_JINGLE_SEND_GLOBAL.xmppSendJingleSessionInfo(peerJid, sessionId, {
    info,
    onSuccess,
    onError,
    retryOnRetarget
  }, {
    normalizeCallTargetJidFn: xmppNormalizeCallTargetJid,
    connection: xmppConnection,
    relayStatus,
    iqFactory: globalThis.$iq,
    namespaces: {
      jingleNamespace: XMPP_JINGLE_NAMESPACE,
      rtpInfoNamespace: XMPP_JINGLE_RTP_INFO_NAMESPACE
    },
    addXmppDebugEventFn: addXmppDebugEvent,
    trimXmppRawFn: trimXmppRaw,
    serializePayloadFn: xmppSerializePayload,
    callIqSessionNotFoundErrorFn: xmppCallIqSessionNotFoundError,
    resolveRetryCallTargetForSessionFn: xmppResolveRetryCallTargetForSession
  });
}

function xmppSendJingleContentModify(peerJid, sessionId, contents = [], {
  retryOnRetarget = true
} = {}) {
  if (typeof XEP_0166_0167_JINGLE_SEND_GLOBAL.xmppSendJingleContentModify !== "function") return false;
  return XEP_0166_0167_JINGLE_SEND_GLOBAL.xmppSendJingleContentModify(peerJid, sessionId, contents, {
    retryOnRetarget
  }, {
    normalizeCallTargetJidFn: xmppNormalizeCallTargetJid,
    connection: xmppConnection,
    relayStatus,
    iqFactory: globalThis.$iq,
    namespaces: {
      jingleNamespace: XMPP_JINGLE_NAMESPACE,
      jingleRtpNamespace: XMPP_JINGLE_RTP_NAMESPACE,
      rtcpFbNamespace: XMPP_JINGLE_RTP_RTCP_FB_NAMESPACE,
      iceUdpNamespace: XMPP_JINGLE_ICE_UDP_NAMESPACE,
      dtlsNamespace: "urn:xmpp:jingle:apps:dtls:0"
    },
    addXmppDebugEventFn: addXmppDebugEvent,
    trimXmppRawFn: trimXmppRaw,
    serializePayloadFn: xmppSerializePayload,
    callIqSessionNotFoundErrorFn: xmppCallIqSessionNotFoundError,
    resolveRetryCallTargetForSessionFn: xmppResolveRetryCallTargetForSession,
    callSessionById: xmppCallSessionById
  });
}

function xmppSendJingleTransportInfo(peerJid, sessionId, {
  transport = null,
  candidates = [],
  onSuccess = null,
  onError = null,
  retryOnRetarget = true
} = {}) {
  if (typeof XEP_0166_0167_JINGLE_SEND_GLOBAL.xmppSendJingleTransportInfo !== "function") return false;
  return XEP_0166_0167_JINGLE_SEND_GLOBAL.xmppSendJingleTransportInfo(peerJid, sessionId, {
    transport,
    candidates,
    onSuccess,
    onError,
    retryOnRetarget
  }, {
    normalizeCallTargetJidFn: xmppNormalizeCallTargetJid,
    connection: xmppConnection,
    relayStatus,
    iqFactory: globalThis.$iq,
    namespaces: {
      jingleNamespace: XMPP_JINGLE_NAMESPACE,
      iceUdpNamespace: XMPP_JINGLE_ICE_UDP_NAMESPACE
    },
    addXmppDebugEventFn: addXmppDebugEvent,
    trimXmppRawFn: trimXmppRaw,
    serializePayloadFn: xmppSerializePayload,
    callIqSessionNotFoundErrorFn: xmppCallIqSessionNotFoundError,
    resolveRetryCallTargetForSessionFn: xmppResolveRetryCallTargetForSession,
    callSessionById: xmppCallSessionById,
    callPeerConnectionBySessionId: xmppCallPeerConnectionBySessionId,
    buildJingleContentsFromSdpFn: xmppBuildJingleContentsFromSdp,
    callSessionMediaListFn: xmppCallSessionMediaList,
    buildJingleTransportCredsFn: xmppBuildJingleTransportCreds,
    xep0320: XEP_0320_WEBRTC_SDP_BASICS_GLOBAL
  });
}

async function xmppSendJingleSessionInitiate(peerJid, sessionId, {
  media = XMPP_CALL_DEFAULT_MEDIA,
  screenShare = false,
  onSuccess = null,
  onError = null,
  retryOnRetarget = true
} = {}) {
  if (typeof XEP_0166_0167_JINGLE_SEND_GLOBAL.xmppSendJingleSessionInitiate !== "function") return false;
  return XEP_0166_0167_JINGLE_SEND_GLOBAL.xmppSendJingleSessionInitiate(peerJid, sessionId, {
    media,
    screenShare,
    onSuccess,
    onError,
    retryOnRetarget
  }, {
    normalizeCallTargetJidFn: xmppNormalizeCallTargetJid,
    connection: xmppConnection,
    relayStatus,
    iqFactory: globalThis.$iq,
    bareJidFn: xmppBareJid,
    getPreferencesFn: getPreferences,
    callSessionById: xmppCallSessionById,
    callDefaultMedia: XMPP_CALL_DEFAULT_MEDIA,
    negotiatedCallMediaForPeerFn: xmppNegotiatedCallMediaForPeer,
    shouldUseMinimalRtpForPeerFn: xmppShouldUseMinimalRtpForPeer,
    ensureSessionPeerConnectionFn: xmppEnsureSessionPeerConnection,
    attachLocalMediaToSessionPeerConnectionFn: xmppAttachLocalMediaToSessionPeerConnection,
    parseIceCredsFromSdpFn: xmppParseIceCredsFromSdp,
    buildJingleTransportCredsFn: xmppBuildJingleTransportCreds,
    parseDtlsFingerprintFromSdpFn: xmppParseDtlsFingerprintFromSdp,
    resolveLocalDtlsForSessionFn: xmppResolveLocalDtlsForSession,
    buildJingleContentsFromSdpFn: xmppBuildJingleContentsFromSdp,
    namespaces: {
      jingleNamespace: XMPP_JINGLE_NAMESPACE,
      jingleRtpNamespace: XMPP_JINGLE_RTP_NAMESPACE,
      rtcpFbNamespace: XMPP_JINGLE_RTP_RTCP_FB_NAMESPACE,
      hdrExtNamespace: XMPP_JINGLE_RTP_HDR_EXT_NAMESPACE,
      ssmaNamespace: XMPP_JINGLE_RTP_SSMA_NAMESPACE,
      rtcpMuxNamespace: XMPP_JINGLE_RTP_RTCP_MUX_NAMESPACE,
      iceUdpNamespace: XMPP_JINGLE_ICE_UDP_NAMESPACE,
      dtlsNamespace: "urn:xmpp:jingle:apps:dtls:0",
      groupingNamespace: XMPP_JINGLE_GROUPING_NAMESPACE
    },
    xep0320: XEP_0320_WEBRTC_SDP_BASICS_GLOBAL,
    generatePseudoDtlsFingerprintFn: xmppGeneratePseudoDtlsFingerprint,
    notifyUserFn: (message) => showToast((message || "").toString(), { tone: "error", duration: 3200 }),
    addXmppDebugEventFn: addXmppDebugEvent,
    trimXmppRawFn: trimXmppRaw,
    serializePayloadFn: xmppSerializePayload,
    callIqSessionNotFoundErrorFn: xmppCallIqSessionNotFoundError,
    resolveRetryCallTargetForSessionFn: xmppResolveRetryCallTargetForSession
  });
}

async function xmppSendJingleSessionAccept(peerJid, sessionId, {
  media = XMPP_CALL_DEFAULT_MEDIA,
  screenShare = false,
  onSuccess = null,
  onError = null,
  retryOnRetarget = true
} = {}) {
  if (typeof XEP_0166_0167_JINGLE_SEND_GLOBAL.xmppSendJingleSessionAccept !== "function") return false;
  return XEP_0166_0167_JINGLE_SEND_GLOBAL.xmppSendJingleSessionAccept(peerJid, sessionId, {
    media,
    screenShare,
    onSuccess,
    onError,
    retryOnRetarget
  }, {
    normalizeCallTargetJidFn: xmppNormalizeCallTargetJid,
    connection: xmppConnection,
    relayStatus,
    iqFactory: globalThis.$iq,
    bareJidFn: xmppBareJid,
    getPreferencesFn: getPreferences,
    callSessionById: xmppCallSessionById,
    callDefaultMedia: XMPP_CALL_DEFAULT_MEDIA,
    negotiatedCallMediaForPeerFn: xmppNegotiatedCallMediaForPeer,
    shouldUseMinimalRtpForPeerFn: xmppShouldUseMinimalRtpForPeer,
    ensureSessionPeerConnectionFn: xmppEnsureSessionPeerConnection,
    attachLocalMediaToSessionPeerConnectionFn: xmppAttachLocalMediaToSessionPeerConnection,
    parseIceCredsFromSdpFn: xmppParseIceCredsFromSdp,
    buildJingleTransportCredsFn: xmppBuildJingleTransportCreds,
    parseDtlsFingerprintFromSdpFn: xmppParseDtlsFingerprintFromSdp,
    resolveLocalDtlsForSessionFn: xmppResolveLocalDtlsForSession,
    buildJingleContentsFromSdpFn: xmppBuildJingleContentsFromSdp,
    alignLocalJingleContentsToRemoteSessionFn: xmppAlignLocalJingleContentsToRemoteSession,
    namespaces: {
      jingleNamespace: XMPP_JINGLE_NAMESPACE,
      jingleRtpNamespace: XMPP_JINGLE_RTP_NAMESPACE,
      rtcpFbNamespace: XMPP_JINGLE_RTP_RTCP_FB_NAMESPACE,
      hdrExtNamespace: XMPP_JINGLE_RTP_HDR_EXT_NAMESPACE,
      ssmaNamespace: XMPP_JINGLE_RTP_SSMA_NAMESPACE,
      rtcpMuxNamespace: XMPP_JINGLE_RTP_RTCP_MUX_NAMESPACE,
      iceUdpNamespace: XMPP_JINGLE_ICE_UDP_NAMESPACE,
      dtlsNamespace: "urn:xmpp:jingle:apps:dtls:0",
      groupingNamespace: XMPP_JINGLE_GROUPING_NAMESPACE
    },
    xep0320: XEP_0320_WEBRTC_SDP_BASICS_GLOBAL,
    generatePseudoDtlsFingerprintFn: xmppGeneratePseudoDtlsFingerprint,
    notifyUserFn: (message) => showToast((message || "").toString(), { tone: "error", duration: 3200 }),
    addXmppDebugEventFn: addXmppDebugEvent,
    trimXmppRawFn: trimXmppRaw,
    serializePayloadFn: xmppSerializePayload,
    callIqSessionNotFoundErrorFn: xmppCallIqSessionNotFoundError,
    resolveRetryCallTargetForSessionFn: xmppResolveRetryCallTargetForSession
  });
}

function xmppSendJingleSessionTerminate(peerJid, sessionId, {
  reason = "success",
  text = "",
  onSuccess = null,
  onError = null,
  retryOnRetarget = true
} = {}) {
  if (typeof XEP_0166_0167_JINGLE_SEND_GLOBAL.xmppSendJingleSessionTerminate !== "function") return false;
  return XEP_0166_0167_JINGLE_SEND_GLOBAL.xmppSendJingleSessionTerminate(peerJid, sessionId, {
    reason,
    text,
    onSuccess,
    onError,
    retryOnRetarget
  }, {
    normalizeCallTargetJidFn: xmppNormalizeCallTargetJid,
    connection: xmppConnection,
    relayStatus,
    iqFactory: globalThis.$iq,
    namespaces: {
      jingleNamespace: XMPP_JINGLE_NAMESPACE
    },
    addXmppDebugEventFn: addXmppDebugEvent,
    trimXmppRawFn: trimXmppRaw,
    serializePayloadFn: xmppSerializePayload,
    callIqSessionNotFoundErrorFn: xmppCallIqSessionNotFoundError,
    resolveRetryCallTargetForSessionFn: xmppResolveRetryCallTargetForSession
  });
}

function latestXmppCallSessionIdForPeer(peerJid, direction = "incoming") {
  const peer = xmppBareJid(peerJid);
  if (!peer) return "";
  if (direction === "outgoing") return (xmppLatestOutgoingCallSessionByPeer.get(peer) || "").toString();
  return (xmppLatestIncomingCallSessionByPeer.get(peer) || "").toString();
}

function handleXmppJingleMessageAction(actionPayload, { peerJid = "", screenShareFallback = false } = {}) {
  const peerFull = (peerJid || "").toString().trim();
  const peer = xmppBareJid(peerFull);
  if (peerFull) xmppRememberPeerFullJid(peerFull);
  const replyTarget = xmppNormalizeCallTargetJid(peerFull || peer, { preferFull: true }) || peer;
  const rawAction = (actionPayload?.action || "").toString();
  const action = rawAction === "finish" ? "retract" : rawAction;
  let id = (actionPayload?.id || "").toString().trim();
  if (!id && action === "propose") {
    id = `jmi-${createId().slice(0, 12)}`;
  } else if (!id) {
    const preferredDirection = action === "ringing" || action === "proceed" || action === "accept"
      ? "outgoing"
      : "incoming";
    id = latestXmppCallSessionIdForPeer(peer, preferredDirection)
      || latestXmppCallSessionIdForPeer(peer, preferredDirection === "outgoing" ? "incoming" : "outgoing");
  }
  if (!peer || !action || !id) return false;
  if (action === "propose") {
    const existingIncomingId = latestXmppCallSessionIdForPeer(peer, "incoming");
    if (existingIncomingId && existingIncomingId !== id) forgetXmppCallSession(existingIncomingId);
    const dinoCompat = Boolean(peerFull && /\/dino[./-]/i.test(peerFull));
    xmppCallSessionById.set(id, {
      id,
      peerJid: peer,
      peerFullJid: peerFull || "",
      direction: "incoming",
      localJingleRole: "responder",
      remoteJingleRole: "initiator",
      inviteSignal: "jmi",
      callInviteId: "",
      callInviteHasJingleSid: true,
      sendAcceptCompat: dinoCompat,
      state: "proposed",
      createdAt: Date.now(),
      media: Array.isArray(actionPayload.media) ? actionPayload.media : []
    });
    xmppLatestIncomingCallSessionByPeer.set(peer, id);
    xmppSendJingleMessageAction(replyTarget, "ringing", { sessionId: id, preferFull: true });
    startWebCallRingtone(id);
    showIncomingXmppCallPrompt({
      sessionId: id,
      peerLabel: peer,
      screenShare: false
    });
    refreshCallBarForPeer(peer);
    showToast(`Incoming XMPP call from ${peer}. Use /callxmpp accept ${id.slice(0, 8)} or /callxmpp reject ${id.slice(0, 8)}.`);
    if (addSystemDmMessageByPeerJid(peer, `Incoming XMPP call proposal (${id.slice(0, 8)}). Use /callxmpp accept ${id.slice(0, 8)} or /callxmpp reject ${id.slice(0, 8)}.`)) {
      refreshDmUiForPeerJid(peer);
    }
    addXmppDebugEvent("message", "Received XMPP jingle propose", {
      from: peer,
      id,
      media: (actionPayload.media || []).join(",")
    });
    return true;
  }
  let session = xmppCallSessionById.get(id) || null;
  if (!session) {
    const preferredDirection = action === "ringing" || action === "proceed" || action === "accept"
      ? "outgoing"
      : "incoming";
    const fallbackId = latestXmppCallSessionIdForPeer(peer, preferredDirection)
      || latestXmppCallSessionIdForPeer(peer, preferredDirection === "outgoing" ? "incoming" : "outgoing");
    if (fallbackId && fallbackId !== id) {
      const fallbackSession = xmppCallSessionById.get(fallbackId) || null;
      if (fallbackSession && xmppBareJid(fallbackSession.peerJid || "") === peer) {
        addXmppDebugEvent("call", "Mapped jingle-message id to known session", {
          from: peer,
          action,
          providedId: id,
          mappedId: fallbackId
        });
        id = fallbackId;
        session = fallbackSession;
      }
    }
  }
  if (action === "ringing") {
    if (session?.direction === "outgoing") {
      const previousState = (session.state || "").toString();
      session.state = "ringing";
      const existingFull = (session.peerFullJid || "").toString().trim();
      const incomingFull = (peerFull || "").toString().trim();
      const sameFull = Boolean(existingFull && incomingFull && existingFull === incomingFull);
      if (!existingFull || previousState === "proposed" || sameFull) {
        session.peerFullJid = peerFull || session.peerFullJid || "";
      }
      clearXmppCallSignalTimeout(id);
      session.timeoutId = window.setTimeout(() => {
        const entry = xmppCallSessionById.get(id);
        if (!entry || (entry.state !== "ringing" && entry.state !== "proceeded")) return;
        showToast("XMPP ringing timed out. Opening Web Call fallback.", { tone: "error", duration: 2800 });
        launchConversationCall({
          screenShare: Boolean(session?.screenShare || screenShareFallback),
          autoPost: true,
          allowNative: false
        });
        forgetXmppCallSession(id);
      }, XMPP_CALL_SIGNAL_TIMEOUT_MS);
      showToast("XMPP peer is ringing.");
      if (addSystemDmMessageByPeerJid(peer, `XMPP peer is ringing (${id.slice(0, 8)}).`)) {
        refreshDmUiForPeerJid(peer);
      }
      addXmppDebugEvent("message", "Received XMPP jingle ringing", { from: peer, id });
    }
    return true;
  }
  if (action === "proceed" || action === "accept") {
    if (session?.direction === "outgoing") {
      session.state = "proceeded";
      session.peerFullJid = peerFull || session.peerFullJid || "";
      clearXmppCallSignalTimeout(id);
      addXmppDebugEvent("message", "Received XMPP jingle proceed", { from: peer, id, action });
      showToast("XMPP peer accepted call proposal.");
      if (addSystemDmMessageByPeerJid(peer, `XMPP peer accepted call proposal (${id.slice(0, 8)}).`)) {
        refreshDmUiForPeerJid(peer);
      }
      if (typeof globalThis.startNativeXmppCallSession === "function") {
        try {
          const ok = globalThis.startNativeXmppCallSession({
            room: session.room || "",
            screenShare: Boolean(session.screenShare),
            conversationId: session.conversationId || "",
            conversationType: session.conversationType || "dm",
            interopTarget: session.interopTarget || peer,
            sessionId: id
          });
          if (ok) return true;
        } catch {
          // fallback below
        }
      }
      void (async () => {
        const initiated = await xmppSendJingleSessionInitiate(session.peerFullJid || peer, id, {
          media: Array.isArray(session?.media) && session.media.length > 0 ? session.media : XMPP_CALL_DEFAULT_MEDIA,
          screenShare: Boolean(session?.screenShare),
          onSuccess: () => {
            const current = xmppCallSessionById.get(id);
            if (current) current.state = "session-initiate-sent";
            if (addSystemDmMessageByPeerJid(peer, `Sent XMPP session-initiate (${id.slice(0, 8)}).`)) {
              refreshDmUiForPeerJid(peer);
            }
          },
          onError: () => {
            launchConversationCall({
              screenShare: Boolean(session?.screenShare || screenShareFallback),
              autoPost: true,
              allowNative: false
            });
          }
        });
        if (!initiated) {
          launchConversationCall({
            screenShare: Boolean(session?.screenShare || screenShareFallback),
            autoPost: true,
            allowNative: false
          });
        }
      })();
      return true;
    }
    return true;
  }
  if (action === "reject" || action === "retract") {
    if (session?.direction === "outgoing") {
      const selectedPeerFull = (session.peerFullJid || "").toString().trim();
      const incomingPeerFull = (peerFull || "").toString().trim();
      if (selectedPeerFull && incomingPeerFull && selectedPeerFull !== incomingPeerFull) {
        addXmppDebugEvent("call", "Ignored XMPP jingle stop action from non-selected resource", {
          id,
          action,
          selectedPeerFull,
          from: incomingPeerFull
        });
        return true;
      }
    }
    if (session) session.peerFullJid = peerFull || session.peerFullJid || "";
    stopWebCallRingtone(id);
    closeMediaLightbox();
    addXmppDebugEvent("message", "Received XMPP jingle stop action", { from: peer, id, action });
    showToast(action === "reject" ? "XMPP call proposal rejected." : "XMPP call proposal cancelled.");
    if (addSystemDmMessageByPeerJid(peer, `XMPP call proposal ${action === "reject" ? "rejected" : "cancelled"} (${id.slice(0, 8)}).`)) {
      refreshDmUiForPeerJid(peer);
    }
    forgetXmppCallSession(id);
    return true;
  }
  return false;
}

function xmppStartOutgoingCallProposal({
  peerJid = "",
  peerTargetJid = "",
  media = XMPP_CALL_DEFAULT_MEDIA,
  screenShare = false,
  conversationId = "",
  conversationType = "dm",
  interopTarget = "",
  room = "",
  onNoResponse = null
} = {}) {
  const peerBare = xmppBareJid(peerJid || peerTargetJid || "");
  if (!peerBare) return false;
  const target = xmppNormalizeCallTargetJid(peerTargetJid || peerJid, { preferFull: true }) || peerBare;
  const normalizedMedia = [...new Set(
    (Array.isArray(media) ? media : XMPP_CALL_DEFAULT_MEDIA)
      .map((entry) => (entry || "").toString().trim().toLowerCase())
      .filter((entry) => entry === "audio" || entry === "video")
  )];
  const offeredMedia = normalizedMedia.length > 0 ? normalizedMedia : XMPP_CALL_DEFAULT_MEDIA;
  const sessionId = `jmi-${createId().slice(0, 12)}`;
  const sentJmiPrimary = xmppSendJingleMessageAction(target, "propose", {
    sessionId,
    media: offeredMedia,
    preferFull: true
  });
  const sentCallInvitePrimary = xmppSendCallInviteAction(target, "invite", {
    sessionId,
    audio: offeredMedia.includes("audio"),
    video: offeredMedia.includes("video"),
    preferFull: true,
    fallbackBody: "Incoming XMPP call invite."
  });
  const targetIsFull = target.includes("/");
  const sentJmiBare = targetIsFull && !sentJmiPrimary
    ? xmppSendJingleMessageAction(peerBare, "propose", {
      sessionId,
      media: offeredMedia,
      preferFull: false
    })
    : false;
  const sentCallInviteBare = targetIsFull && !sentCallInvitePrimary
    ? xmppSendCallInviteAction(peerBare, "invite", {
      sessionId,
      audio: offeredMedia.includes("audio"),
      video: offeredMedia.includes("video"),
      preferFull: false,
      fallbackBody: "Incoming XMPP call invite."
    })
    : false;
  const sentJmi = Boolean(sentJmiPrimary || sentJmiBare);
  const sentCallInviteCompat = sentCallInvitePrimary || sentCallInviteBare || "";
  const sent = Boolean(sentJmi || sentCallInviteCompat);
  if (!sent) return false;
  const timeoutId = window.setTimeout(() => {
    const entry = xmppCallSessionById.get(sessionId);
    if (!entry || (entry.state !== "proposed" && entry.state !== "ringing")) return;
    if (typeof onNoResponse === "function") onNoResponse();
    forgetXmppCallSession(sessionId);
  }, XMPP_CALL_SIGNAL_TIMEOUT_MS);
  xmppCallSessionById.set(sessionId, {
    id: sessionId,
    peerJid: peerBare,
    peerFullJid: target.includes("/") ? target : "",
    direction: "outgoing",
    localJingleRole: "initiator",
    remoteJingleRole: "responder",
    state: "proposed",
    createdAt: Date.now(),
    media: offeredMedia,
    screenShare: Boolean(screenShare),
    inviteSignal: sentJmi ? "jmi" : "call-invite",
    callInviteId: sentCallInviteCompat || "",
    callInviteHasJingleSid: true,
    timeoutId,
    room: (room || "").toString(),
    conversationId: (conversationId || "").toString(),
    conversationType: (conversationType || "dm").toString(),
    interopTarget: (interopTarget || peerBare).toString()
  });
  if (sentCallInviteCompat) xmppCallSessionIdByInviteId.set(sentCallInviteCompat, sessionId);
  xmppLatestOutgoingCallSessionByPeer.set(peerBare, sessionId);
  showToast("Sent XMPP call proposal. Waiting for peer response...");
  openNativeXmppCallSurface(sessionId);
  refreshCallBarForPeer(peerBare);
  if (addSystemDmMessageByPeerJid(peerBare, `Sent XMPP call proposal (${sessionId.slice(0, 8)}). Waiting for peer response.`)) {
    refreshDmUiForPeerJid(peerBare);
  }
  return true;
}

async function launchNativeXmppConversationCall({ screenShare = false, allowWebFallback = true } = {}) {
  const conversation = getActiveConversation();
  if (!conversation) {
    showToast("Open a channel or DM first.", { tone: "error" });
    return false;
  }
  if (screenShare) {
    const capability = screenShareCapabilitySnapshot();
    if (!capability.ok) {
      showToast(capability.reason || "Screen sharing is not supported here.", { tone: "error", duration: 3200 });
      screenShare = false;
    } else if (capability.warning) {
      showToast(capability.warning, { tone: "info", duration: 2600 });
    }
  }
  if (!canAttemptNativeXmppCall()) {
    showToast("XMPP relay/WebRTC is not ready for native calling here. Use Web Call meanwhile.", { tone: "error", duration: 2600 });
    return false;
  }
  sendCurrentXmppPresence();
  const interop = await xmppAssessConversationCallInterop(conversation, { force: false });
  addXmppDebugEvent("iq", "XMPP native call interoperability check", {
    conversationId: conversation.id || "",
    conversationType: conversation.type || "",
    ready: interop.ready,
    chosenTarget: interop.chosenTarget || "",
    targetCount: interop.targets.length
  });
  const peerJid = xmppPeerJidForConversation(conversation, getCurrentAccount());
  const peerTargetJid = xmppNormalizeCallTargetJid(peerJid, { preferFull: true }) || peerJid;
  const requestedMedia = screenShare ? ["audio", "video"] : XMPP_CALL_DEFAULT_MEDIA;
  const negotiatedMedia = xmppNegotiatedCallMediaForPeer(peerTargetJid || peerJid, requestedMedia);
  const hasFeatureEvidence = interop.details.some((entry) => Array.isArray(entry?.featureList) && entry.featureList.length > 0);
  const hasDiscoErrors = interop.details.some((entry) => Boolean(entry?.error));
  const allowOptimistic = conversation.type === "dm" && peerJid && (!hasFeatureEvidence || hasDiscoErrors);
  const forceNativeAttempt = conversation.type === "dm" && Boolean(peerJid);
  if (!interop.ready) {
    const missing = interop.details[0]?.evalResult || null;
    const missingParts = [];
    if (!missing?.hasCore) missingParts.push("jingle");
    if (!missing?.hasMedia) missingParts.push("rtp-media");
    if (!missing?.hasTransport) missingParts.push("ice-udp");
    if (!missing?.hasInvite) missingParts.push("invite");
    if (!allowOptimistic && !forceNativeAttempt) {
      const suffix = missingParts.length > 0 ? ` missing: ${missingParts.join(", ")}` : "";
      showToast(`Native XMPP call not interoperable with current target.${suffix} Falling back to Web Call.`, {
        tone: "error",
        duration: 3200
      });
      if (allowWebFallback) {
        launchConversationCall({ screenShare, autoPost: true, allowNative: false });
      }
      return false;
    }
    showToast("Native XMPP call interop could not be verified. Attempting native signaling first.", {
      tone: "info",
      duration: 2800
    });
  }
  if (conversation.type === "dm" && peerJid && (!globalThis.startNativeXmppCallSession || typeof globalThis.startNativeXmppCallSession !== "function")) {
    const started = xmppStartOutgoingCallProposal({
      peerJid,
      peerTargetJid,
      media: negotiatedMedia,
      screenShare: Boolean(screenShare),
      conversationId: conversation.id || "",
      conversationType: conversation.type || "dm",
      interopTarget: interop.chosenTarget || xmppBareJid(peerJid),
      room: conversationCallRoomName(conversation, ""),
      onNoResponse: () => {
        showToast("No XMPP call response. Opening Web Call fallback.", { tone: "error", duration: 2800 });
        if (allowWebFallback) {
          launchConversationCall({ screenShare, autoPost: true, allowNative: false });
        }
      }
    });
    if (!started) {
      showToast("Failed to send XMPP call proposal. Falling back to Web Call.", { tone: "error" });
      if (allowWebFallback) {
        launchConversationCall({ screenShare, autoPost: true, allowNative: false });
      }
      return false;
    }
    return true;
  }
  if (typeof globalThis.startNativeXmppCallSession === "function") {
    try {
      const room = conversationCallRoomName(conversation, "");
      const ok = globalThis.startNativeXmppCallSession({
        room,
        screenShare: Boolean(screenShare),
        conversationId: conversation.id || "",
        conversationType: conversation.type || "",
        interopTarget: interop.chosenTarget || ""
      });
      if (ok) {
        showToast(screenShare ? "Native XMPP screen-share call started." : "Native XMPP call started.");
        return true;
      }
    } catch (error) {
      showToast(`Native XMPP call failed: ${String(error?.message || error)}`, { tone: "error" });
      return false;
    }
  }
  showToast("Native XMPP signaling is not fully wired in-client yet. Opening Web Call fallback.", { tone: "error", duration: 2800 });
  if (allowWebFallback) {
    launchConversationCall({ screenShare, autoPost: true, allowNative: false });
  }
  return false;
}

function conversationWhiteboardRoomName(conversation = getActiveConversation(), roomOverride = "") {
  const override = normalizeConferenceRoomToken(roomOverride);
  if (override) return override;
  if (!conversation) return "";
  const prefs = getPreferences();
  const prefix = normalizeWhiteboardRoomPrefix(prefs.whiteboardRoomPrefix);
  const relayRoom = relayRoomForActiveConversation() || "";
  if (conversation.type === "dm") {
    const threadId = (conversation.thread?.id || "dm").toString();
    const seed = `wb:dm:${threadId}:${relayRoom}`;
    return normalizeConferenceRoomToken(`${prefix}-dm-${shortHashToken(seed).slice(0, 8)}`);
  }
  const guildId = (state.activeGuildId || "").toString();
  const channelId = (conversation.channel?.id || "").toString();
  const channelName = normalizeConferenceRoomToken(conversation.channel?.name || "room");
  const seed = `wb:guild:${guildId}:${channelId}:${relayRoom}:${channelName}`;
  return normalizeConferenceRoomToken(`${prefix}-${channelName || "room"}-${shortHashToken(seed).slice(0, 8)}`);
}

function conversationWhiteboardUrl(conversation = getActiveConversation(), roomOverride = "") {
  const room = conversationWhiteboardRoomName(conversation, roomOverride);
  if (!room) return "";
  const base = normalizeWhiteboardProviderUrl(getPreferences().whiteboardProviderUrl);
  return `${base}/${encodeURIComponent(room)}`;
}

function postWhiteboardInviteToConversation(conversation, account, url) {
  if (!conversation || !account || !url) return false;
  const message = {
    id: createId(),
    userId: account.id,
    authorName: "",
    text: `📝 Whiteboard: ${url}`,
    ts: new Date().toISOString(),
    reactions: [],
    attachments: []
  };
  if (conversation.type === "dm") {
    conversation.thread.messages.push(message);
    publishRelayDirectMessage(conversation.thread, message, account);
    return true;
  }
  if (conversation.channel?.type === "voice" || conversation.channel?.type === "stage") return false;
  conversation.channel.messages.push(message);
  publishRelayChannelMessage(conversation.channel, message, account);
  return true;
}

function launchConversationWhiteboard({ roomOverride = "", copyOnly = false, autoPost = false } = {}) {
  const conversation = getActiveConversation();
  const account = getCurrentAccount();
  if (!conversation) {
    showToast("Open a channel or DM first.", { tone: "error" });
    return "";
  }
  const url = conversationWhiteboardUrl(conversation, roomOverride);
  if (!url) {
    showToast("Could not resolve whiteboard room URL.", { tone: "error" });
    return "";
  }
  if (copyOnly) {
    void copyText(url).then((ok) => showToast(ok ? "Whiteboard link copied." : "Failed to copy whiteboard link.", { tone: ok ? "info" : "error" }));
    return url;
  }
  openConferenceLightbox(url, { title: "Shared Whiteboard" });
  if (autoPost && getPreferences().whiteboardAutoPost === "on" && account) {
    const posted = postWhiteboardInviteToConversation(conversation, account, url);
    if (posted) {
      saveState();
      renderMessages();
      renderChannels();
      renderDmList();
    }
  }
  return url;
}

function mentionInComposer(account) {
  if (!account) return;
  const base = ui.messageInput.value.trim();
  ui.messageInput.value = trimTextForConversation(`${base ? `${base} ` : ""}@${account.username} `, getActiveConversation());
  setComposerDraft(composerDraftConversationId, ui.messageInput.value);
  queueComposerDraftSave();
  ui.messageInput.focus();
  renderSlashSuggestions();
  renderComposerMeta();
}

function normalizeColorForPicker(value, fallback = "#5865f2") {
  return normalizeColorForPickerViaModule(value, fallback);
}

function openGuildSettingsDialog(guild = null) {
  const target = guild || getActiveGuild();
  const current = getCurrentAccount();
  if (!target) return;
  ui.guildSettingsNameInput.value = target.name || "";
  ui.guildSettingsDescriptionInput.value = (target.description || "").toString().slice(0, 180);
  ui.guildSettingsAccentInput.value = (target.accentColor || "#5865f2").toString().slice(0, 24);
  if (ui.guildSettingsAccentPicker) {
    ui.guildSettingsAccentPicker.value = normalizeColorForPicker(ui.guildSettingsAccentInput.value, "#5865f2");
  }
  if (ui.deleteGuildBtn) {
    const canDelete = Boolean(current && hasServerPermission(target, current.id, "administrator") && state.guilds.length > 1);
    ui.deleteGuildBtn.disabled = !canDelete;
  }
  ui.guildSettingsDialog.showModal();
}

function renameGuildById(guildId) {
  const guild = state.guilds.find((entry) => entry.id === guildId);
  if (!guild) return;
  openGuildSettingsDialog(guild);
}

async function deleteGuildById(guildId) {
  if (state.guilds.length <= 1) return;
  const guild = state.guilds.find((entry) => entry.id === guildId);
  if (!guild) return;
  const confirmed = await showInAppConfirmDialog({
    title: "Delete guild?",
    message: `Delete guild "${guild.name}"? This removes all channels and messages in it.`,
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    danger: true
  });
  if (!confirmed) return;
  removeGuildFromFolders(guildId);
  state.guilds = state.guilds.filter((entry) => entry.id !== guildId);
  if (state.activeGuildId === guildId) {
    const nextGuild = state.guilds[0] || null;
    state.activeGuildId = nextGuild?.id || null;
    state.activeChannelId = nextGuild ? getFirstOpenableChannelIdForGuild(nextGuild) : null;
  }
  saveState();
  render();
}

function ensureFolderState() {
  if (!Array.isArray(state.guildFolders)) state.guildFolders = [];
  state.guildFolders = state.guildFolders
    .filter((folder) => folder && typeof folder === "object")
    .map((folder) => ({
      id: folder.id || createId(),
      name: (folder.name || "Folder").toString().slice(0, 24),
      guildIds: Array.isArray(folder.guildIds) ? folder.guildIds.filter(Boolean) : [],
      collapsed: Boolean(folder.collapsed)
    }));
}

function getFolderForGuild(guildId) {
  ensureFolderState();
  return state.guildFolders.find((folder) => folder.guildIds.includes(guildId)) || null;
}

function removeGuildFromFolders(guildId) {
  ensureFolderState();
  state.guildFolders.forEach((folder) => {
    folder.guildIds = folder.guildIds.filter((id) => id !== guildId);
  });
  state.guildFolders = state.guildFolders.filter((folder) => folder.guildIds.length > 0);
}

function assignGuildToFolder(guildId, folderId) {
  ensureFolderState();
  removeGuildFromFolders(guildId);
  const folder = state.guildFolders.find((entry) => entry.id === folderId);
  if (!folder) return;
  folder.guildIds.push(guildId);
}

function closeContextMenu() {
  if (!contextMenuOpen) return;
  contextMenuOpen = false;
  contextMenuFocusIndex = 0;
  contextMenuSubmenuAnchor = null;
  ui.contextMenu.classList.add("context-menu--hidden");
  ui.contextMenu.innerHTML = "";
  document.querySelectorAll(".context-submenu").forEach((node) => node.remove());
}

function shouldUseNativeContextMenu(target) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest(".message-swf-player, ruffle-player, .ruffle-player"));
}

function openContextMenu(event, items) {
  event.preventDefault();
  event.stopPropagation();
  if (!Array.isArray(items) || items.length === 0) return;
  contextMenuSubmenuAnchor = null;
  document.querySelectorAll(".context-submenu").forEach((node) => node.remove());
  ui.contextMenu.innerHTML = "";
  const openSubmenu = (anchor, submenuItems) => {
    document.querySelectorAll(".context-submenu").forEach((node) => node.remove());
    contextMenuSubmenuAnchor = anchor;
    const submenu = document.createElement("div");
    submenu.className = "context-menu context-submenu";
    submenu.addEventListener("contextmenu", (subEvent) => {
      subEvent.preventDefault();
      subEvent.stopPropagation();
    });
    submenuItems.forEach((entry) => {
      const subButton = document.createElement("button");
      subButton.type = "button";
      subButton.textContent = entry.label;
      subButton.disabled = Boolean(entry.disabled);
      if (entry.danger) subButton.classList.add("danger");
      subButton.addEventListener("click", async () => {
        closeContextMenu();
        if (typeof entry.action === "function") await entry.action();
      });
      submenu.appendChild(subButton);
    });
    document.body.appendChild(submenu);
    const anchorRect = anchor.getBoundingClientRect();
    const subRect = submenu.getBoundingClientRect();
    const margin = 8;
    let left = anchorRect.right + 6;
    if (left + subRect.width > window.innerWidth - margin) left = anchorRect.left - subRect.width - 6;
    const top = Math.max(margin, Math.min(anchorRect.top, window.innerHeight - subRect.height - margin));
    submenu.style.left = `${Math.round(left)}px`;
    submenu.style.top = `${Math.round(top)}px`;
  };
  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.label;
    button.disabled = Boolean(item.disabled);
    if (item.danger) button.classList.add("danger");
    if (Array.isArray(item.submenu) && item.submenu.length > 0) {
      button.classList.add("context-menu__has-submenu");
      button.textContent = `${item.label} ▸`;
      button.addEventListener("mouseenter", () => openSubmenu(button, item.submenu));
      button.addEventListener("focus", () => openSubmenu(button, item.submenu));
      button.addEventListener("click", (e) => {
        e.preventDefault();
        openSubmenu(button, item.submenu);
      });
      ui.contextMenu.appendChild(button);
      return;
    }
    button.addEventListener("click", async () => {
      closeContextMenu();
      if (typeof item.action === "function") await item.action();
    });
    ui.contextMenu.appendChild(button);
  });
  ui.contextMenu.classList.remove("context-menu--hidden");
  contextMenuOpen = true;
  contextMenuFocusIndex = 0;

  const margin = 8;
  const menuRect = ui.contextMenu.getBoundingClientRect();
  const maxLeft = window.innerWidth - menuRect.width - margin;
  const maxTop = window.innerHeight - menuRect.height - margin;
  const left = Math.max(margin, Math.min(event.clientX, maxLeft));
  const top = Math.max(margin, Math.min(event.clientY, maxTop));
  ui.contextMenu.style.left = `${left}px`;
  ui.contextMenu.style.top = `${top}px`;
  const buttons = [...ui.contextMenu.querySelectorAll("button:not(:disabled)")];
  if (buttons.length > 0) {
    buttons[0].focus();
  }
}

function ensureServerOwnerRole(server, accountId) {
  if (!server || !accountId) return false;
  if (!Array.isArray(server.roles) || server.roles.length === 0) return false;
  if (!server.memberRoles || typeof server.memberRoles !== "object") server.memberRoles = {};
  const everyoneRoleId = server.roles[0].id;
  if (!Array.isArray(server.memberRoles[accountId])) server.memberRoles[accountId] = [everyoneRoleId];
  const adminRoleIds = server.roles.filter((role) => role.permissions?.administrator).map((role) => role.id);
  const anyMemberHasAdmin = Object.values(server.memberRoles).some((roleIds) => (
    Array.isArray(roleIds) && roleIds.some((id) => adminRoleIds.includes(id))
  ));
  const accountRoleIds = server.memberRoles[accountId];
  const accountHasAdmin = accountRoleIds.some((id) => adminRoleIds.includes(id));
  if (accountHasAdmin || anyMemberHasAdmin) return false;
  const ownerRole = createRole("Owner", "#f23f43", "admin");
  server.roles.push(ownerRole);
  accountRoleIds.push(ownerRole.id);
  return true;
}

function pruneSyntheticOwnerRoles(server) {
  if (!server || !Array.isArray(server.roles) || !server.memberRoles || typeof server.memberRoles !== "object") return false;
  const ownerRoleIds = server.roles
    .filter((role) => (role?.name || "").toString().trim().toLowerCase() === "owner")
    .map((role) => role.id)
    .filter(Boolean);
  if (ownerRoleIds.length === 0) return false;
  const ownerSet = new Set(ownerRoleIds);
  const previousCount = server.roles.length;
  server.roles = server.roles.filter((role) => !ownerSet.has(role?.id));
  Object.keys(server.memberRoles).forEach((memberId) => {
    if (!Array.isArray(server.memberRoles[memberId])) return;
    server.memberRoles[memberId] = server.memberRoles[memberId].filter((roleId) => !ownerSet.has(roleId));
  });
  return server.roles.length !== previousCount;
}

function ensureCurrentUserInActiveServer() {
  const account = getCurrentAccount();
  const server = getActiveServer();
  if (!account || !server) return false;
  const existingMembers = Array.isArray(server.memberIds) ? server.memberIds.filter(Boolean) : [];
  const alreadyMember = existingMembers.includes(account.id);
  if (!alreadyMember && existingMembers.length > 0) {
    // Do not silently join a guild that belongs to another logged-in account.
    return false;
  }
  let changed = false;
  if (!Array.isArray(server.roles) || server.roles.length === 0) {
    server.roles = [createRole("@everyone", "#b5bac1", "member")];
    changed = true;
  }
  if (!server.memberRoles || typeof server.memberRoles !== "object") {
    server.memberRoles = {};
    changed = true;
  }
  const everyoneRoleId = server.roles[0].id;
  if (!Array.isArray(server.memberRoles[account.id])) {
    server.memberRoles[account.id] = [];
    changed = true;
  }
  if (!server.memberRoles[account.id].includes(everyoneRoleId)) {
    server.memberRoles[account.id].push(everyoneRoleId);
    changed = true;
  }
  if (!server.memberIds.includes(account.id)) {
    server.memberIds.push(account.id);
    changed = true;
  }
  if (isXmppBackedGuild(server)) {
    if (pruneSyntheticOwnerRoles(server)) changed = true;
  } else if (ensureServerOwnerRole(server, account.id)) {
    changed = true;
  }
  server.channels.forEach((channel) => {
    const beforeOverrides = JSON.stringify(channel.permissionOverrides || {});
    ensureChannelPermissionOverrides(channel, server);
    if (JSON.stringify(channel.permissionOverrides || {}) !== beforeOverrides) changed = true;
    const beforeVoice = JSON.stringify(channel.voiceState || {});
    channel.voiceState = normalizeVoiceState(channel.voiceState);
    channel.voiceState.connectedIds = channel.voiceState.connectedIds.filter((id) => server.memberIds.includes(id));
    channel.voiceState.mutedIds = channel.voiceState.mutedIds.filter((id) => channel.voiceState.connectedIds.includes(id));
    channel.voiceState.raisedHandIds = channel.voiceState.raisedHandIds.filter((id) => channel.voiceState.connectedIds.includes(id));
    channel.voiceState.speakerIds = channel.voiceState.speakerIds.filter((id) => channel.voiceState.connectedIds.includes(id));
    if (!Array.isArray(channel.voiceState.activity)) channel.voiceState.activity = [];
    channel.voiceState.activity = channel.voiceState.activity
      .filter((entry) => entry && typeof entry === "object" && entry.accountId)
      .slice(-30);
    if (JSON.stringify(channel.voiceState || {}) !== beforeVoice) changed = true;
    channel.forumTags = channel.type === "forum" ? forumTagsForChannel(channel) : [];
    ensureChannelReadState(channel);
    const normalizedSlowmode = getChannelSlowmodeSeconds(channel);
    if (channel.slowmodeSec !== normalizedSlowmode) {
      channel.slowmodeSec = normalizedSlowmode;
      changed = true;
    }
    if (ensureChannelSlowmodeState(channel)) changed = true;
    if (!channel.readState[account.id]) {
      channel.readState[account.id] = new Date().toISOString();
      changed = true;
    }
  });
  return changed;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatFullTimestamp(iso) {
  return new Date(iso).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function resolveMessageIdForFocus(messageId, conversation = getActiveConversation()) {
  const raw = (messageId || "").toString().trim();
  if (!raw || !conversation) return "";
  const bucket = activeConversationFindBucket(conversation);
  const direct = bucket.find((entry) => (entry?.id || "").toString() === raw) || null;
  if (direct?.id) return direct.id;
  const byRef = bucket.find((entry) => messageMatchesXmppReference(entry, raw)) || null;
  if (byRef?.id) return byRef.id;
  return "";
}

function focusMessageById(messageId) {
  if (!messageId) return false;
  const resolvedId = resolveMessageIdForFocus(messageId) || (messageId || "").toString();
  const row = ui.messageList.querySelector(`[data-message-id="${resolvedId}"]`);
  if (!(row instanceof HTMLElement)) return false;
  row.scrollIntoView({ block: "center", behavior: "smooth" });
  row.classList.add("message--flash");
  window.setTimeout(() => {
    row.classList.remove("message--flash");
  }, 1200);
  return true;
}

function focusMessageByIdWithHistory(messageId, { toastOnLoad = false } = {}) {
  if (!messageId) return false;
  if (focusMessageById(messageId)) {
    pendingFindJumpMessageId = "";
    pendingFindJumpAttempts = 0;
    return true;
  }
  pendingFindJumpMessageId = (messageId || "").toString();
  pendingFindJumpAttempts = 32;
  const started = maybeLoadOlderXmppHistoryForActiveConversation({ trigger: "find" });
  if (!started) {
    const historyState = activeConversationHistoryState();
    if (!historyState?.loading) {
      pendingFindJumpMessageId = "";
      pendingFindJumpAttempts = 0;
      return false;
    }
  }
  if (toastOnLoad) showToast("Loading older messages to reach that result...");
  return true;
}

function resolveReplyTargetMessageId(replyTo, channel = null) {
  if (!replyTo || typeof replyTo !== "object") return "";
  const directId = (replyTo.messageId || "").toString().trim();
  if (directId) return directId;
  const stanzaId = (replyTo.stanzaId || "").toString().trim();
  const roomJid = xmppBareJid(channel?.xmppRoomJid || "");
  if (!stanzaId || !roomJid) return "";
  const mapped = findXmppRoomMessageByAnyId(roomJid, stanzaId);
  if (!mapped?.messageId) return "";
  replyTo.messageId = mapped.messageId;
  if (!replyTo.authorName && mapped.authorName) replyTo.authorName = mapped.authorName;
  if ((!replyTo.text || replyTo.text === "XMPP reply") && mapped.text) replyTo.text = mapped.text;
  return mapped.messageId;
}

function buildMessagePermalink(conversationId, messageId) {
  const origin = window.location.origin === "null" ? "" : window.location.origin;
  const base = `${origin}${window.location.pathname}`;
  const conv = encodeURIComponent((conversationId || "").toString());
  const msg = encodeURIComponent((messageId || "").toString());
  return `${base}#msg=${conv}:${msg}`;
}

function buildChannelPermalink(guildId, channelId) {
  const origin = window.location.origin === "null" ? "" : window.location.origin;
  const base = `${origin}${window.location.pathname}`;
  const gid = encodeURIComponent((guildId || "").toString());
  const cid = encodeURIComponent((channelId || "").toString());
  return `${base}#ch=${gid}:${cid}`;
}

function parseHashMessageReference() {
  const hash = (window.location.hash || "").replace(/^#/, "");
  if (!hash.startsWith("msg=")) return null;
  const payload = hash.slice(4);
  const separator = payload.indexOf(":");
  if (separator <= 0) return null;
  try {
    const conversationId = decodeURIComponent(payload.slice(0, separator));
    const messageId = decodeURIComponent(payload.slice(separator + 1));
    if (!conversationId || !messageId) return null;
    return { conversationId, messageId };
  } catch {
    return null;
  }
}

function quoteMessageInComposer(message) {
  if (!message) return;
  const quoted = (message.text || "").trim() || "(empty message)";
  const line = `> ${quoted.replace(/\n/g, "\n> ")}\n`;
  const base = ui.messageInput.value.trim();
  ui.messageInput.value = `${base ? `${base}\n` : ""}${line}`;
  ui.messageInput.focus();
  ui.messageInput.setSelectionRange(ui.messageInput.value.length, ui.messageInput.value.length);
}

function messageDateKey(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatMessageDayLabel(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  const now = new Date();
  const todayKey = messageDateKey(now.toISOString());
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  const yesterdayKey = messageDateKey(y.toISOString());
  const key = messageDateKey(iso);
  if (key === todayKey) return "Today";
  if (key === yesterdayKey) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function createMessageDayDivider(iso) {
  const divider = document.createElement("div");
  divider.className = "message-day-divider";
  const lineLeft = document.createElement("span");
  lineLeft.className = "message-day-divider__line";
  const label = document.createElement("span");
  label.className = "message-day-divider__label";
  label.textContent = formatMessageDayLabel(iso);
  const lineRight = document.createElement("span");
  lineRight.className = "message-day-divider__line";
  divider.appendChild(lineLeft);
  divider.appendChild(label);
  divider.appendChild(lineRight);
  return divider;
}

function presenceLabel(presence) {
  return presenceLabelViaModule(presence);
}

function normalizePresence(value) {
  return normalizePresenceViaModule(value);
}

function normalizeMediaDeviceId(value) {
  return normalizeMediaDeviceIdViaModule(value);
}

function normalizePlatformOverride(value) {
  return normalizePlatformOverrideViaModule(value);
}
