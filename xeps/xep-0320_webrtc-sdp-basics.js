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

  function xmppParseSdpFmtpParams(raw = "") {
    const cleaned = (raw || "").toString().trim();
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
  }

  function xmppParseSdpMediaSections(sdp = "") {
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
        entry.parameters = xmppParseSdpFmtpParams(params || "");
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

  function xmppNormalizeJingleSdpPayloadType(payload = {}, media = "audio") {
    return {
      id: String(Number(payload?.id) || 0),
      name: (payload?.name || "").toString().trim(),
      clockrate: String(Number(payload?.clockrate) || (media === "audio" ? 48000 : 90000)),
      channels: String(Math.max(1, Number(payload?.channels) || (media === "audio" ? 2 : 1))),
      rtcpFeedback: Array.isArray(payload?.rtcpFeedback)
        ? payload.rtcpFeedback
          .map((feedback) => ({
            type: (feedback?.type || "").toString().trim().toLowerCase(),
            subtype: (feedback?.subtype || "").toString().trim().toLowerCase()
          }))
          .filter((feedback) => feedback.type)
        : [],
      parameters: Array.isArray(payload?.parameters)
        ? payload.parameters
          .map((param) => ({
            name: (param?.name || "").toString().trim(),
            value: (param?.value || "").toString().trim()
          }))
          .filter((param) => param.name)
        : []
    };
  }

  function xmppNormalizeJingleSdpContent(entry = {}, index = 0) {
    const mediaType = (entry?.media || "").toString().trim().toLowerCase();
    const media = mediaType === "audio" || mediaType === "video" ? mediaType : "";
    if (!media) return null;
    const payloads = (Array.isArray(entry?.payloadTypes) ? entry.payloadTypes : [])
      .map((payload) => xmppNormalizeJingleSdpPayloadType(payload, media))
      .filter((payload) => Number(payload.id) > 0);
    return {
      name: (entry?.name || `${media}${index}`).toString().trim() || `${media}${index}`,
      media,
      senders: (entry?.senders || "both").toString().trim().toLowerCase() || "both",
      rtcpFeedback: Array.isArray(entry?.rtcpFeedback)
        ? entry.rtcpFeedback
          .map((feedback) => ({
            type: (feedback?.type || "").toString().trim().toLowerCase(),
            subtype: (feedback?.subtype || "").toString().trim().toLowerCase()
          }))
          .filter((feedback) => feedback.type)
        : [],
      extmaps: Array.isArray(entry?.extmaps)
        ? entry.extmaps
          .map((extmap) => ({
            id: String(Number(extmap?.id) || 0),
            uri: (extmap?.uri || "").toString().trim(),
            direction: (extmap?.direction || "").toString().trim().toLowerCase(),
            attributes: (extmap?.attributes || "").toString().trim()
          }))
          .filter((extmap) => Number(extmap.id) > 0 && extmap.uri)
        : [],
      sources: Array.isArray(entry?.sources)
        ? entry.sources
          .map((source) => ({
            ssrc: String(Number(source?.ssrc) || 0),
            parameters: Array.isArray(source?.parameters)
              ? source.parameters
                .map((param) => ({
                  name: (param?.name || "").toString().trim(),
                  value: (param?.value || "").toString().trim()
                }))
                .filter((param) => param.name)
              : []
          }))
          .filter((source) => Number(source.ssrc) > 0)
        : [],
      sourceGroups: Array.isArray(entry?.sourceGroups)
        ? entry.sourceGroups
          .map((group) => ({
            semantics: (group?.semantics || "").toString().trim().toUpperCase(),
            sources: Array.isArray(group?.sources)
              ? group.sources.map((ssrc) => String(Number(ssrc) || 0)).filter((ssrc) => Number(ssrc) > 0)
              : []
          }))
          .filter((group) => group.semantics && group.sources.length > 0)
        : [],
      payloadTypes: payloads,
      transport: entry?.transport && typeof entry.transport === "object" ? entry.transport : null
    };
  }

  function xmppBuildSelectedJingleSdpContents({
    media = ["audio", "video"],
    contents = []
  } = {}) {
    const normalizedContents = (Array.isArray(contents) ? contents : [])
      .map((entry, index) => xmppNormalizeJingleSdpContent(entry, index))
      .filter(Boolean);
    const selectedContents = normalizedContents.length > 0
      ? normalizedContents
      : [...new Set(
        (Array.isArray(media) ? media : ["audio", "video"])
          .map((item) => (item || "").toString().trim().toLowerCase())
          .filter((item) => item === "audio" || item === "video")
      )].map((mediaType, index) => ({
        name: `${mediaType}${index}`,
        media: mediaType,
        senders: "both",
        rtcpFeedback: [],
        extmaps: [],
        sources: [],
        sourceGroups: [],
        payloadTypes: [],
        transport: null
      }));
    if (selectedContents.length === 0) {
      selectedContents.push({
        name: "audio0",
        media: "audio",
        senders: "both",
        rtcpFeedback: [],
        extmaps: [],
        sources: [],
        sourceGroups: [],
        payloadTypes: [],
        transport: null
      });
    }
    return selectedContents;
  }

  function xmppResolveJingleSdpTransport(transport = null, { type = "offer" } = {}, deps = {}) {
    const buildJingleTransportCredsFn = typeof deps.buildJingleTransportCredsFn === "function"
      ? deps.buildJingleTransportCredsFn
      : xmppBuildJingleTransportCreds;
    const generatePseudoDtlsFingerprintFn = typeof deps.generatePseudoDtlsFingerprintFn === "function"
      ? deps.generatePseudoDtlsFingerprintFn
      : xmppGeneratePseudoDtlsFingerprint;
    const creds = transport && typeof transport === "object"
      ? {
        ufrag: (transport.ufrag || "").toString().trim(),
        pwd: (transport.pwd || "").toString().trim()
      }
      : buildJingleTransportCredsFn();
    const dtls = transport && typeof transport === "object"
      ? {
        hash: (transport.hash || "sha-256").toString().trim().toLowerCase() || "sha-256",
        value: (transport.fingerprint || transport.value || "").toString().trim(),
        setup: (transport.setup || "").toString().trim().toLowerCase()
      }
      : { hash: "sha-256", value: "", setup: "" };
    const fallbackCreds = (!creds.ufrag || !creds.pwd) ? buildJingleTransportCredsFn() : null;
    const ufrag = creds.ufrag || fallbackCreds?.ufrag || "u0";
    const pwd = creds.pwd || fallbackCreds?.pwd || "p0";
    return {
      ufrag,
      pwd,
      fingerprintValue: dtls.value || generatePseudoDtlsFingerprintFn(),
      fingerprintHash: dtls.hash || "sha-256",
      setup: dtls.setup || ((type || "").toString().trim().toLowerCase() === "offer" ? "actpass" : "passive")
    };
  }

  function xmppBuildJingleSdpContentMids(contents = []) {
    const mids = [];
    const usedMids = new Set();
    (Array.isArray(contents) ? contents : []).forEach((content, index) => {
      let mid = (content?.name || "").toString().trim() || String(index);
      if (usedMids.has(mid)) mid = `${mid}-${index}`;
      usedMids.add(mid);
      mids.push(mid);
    });
    return mids;
  }

  function xmppBuildMinimalJingleSdp({
    media = ["audio", "video"],
    contents = [],
    transport = null,
    type = "offer",
    localRole = "responder"
  } = {}, deps = {}) {
    const sdpDirectionFromJingleSendersFn = typeof deps.sdpDirectionFromJingleSendersFn === "function"
      ? deps.sdpDirectionFromJingleSendersFn
      : xmppSdpDirectionFromJingleSenders;
    const normalizeSdpExtmapDirectionFn = typeof deps.normalizeSdpExtmapDirectionFn === "function"
      ? deps.normalizeSdpExtmapDirectionFn
      : xmppNormalizeSdpExtmapDirection;
    const selectedContents = xmppBuildSelectedJingleSdpContents({ media, contents });
    const resolvedTransport = xmppResolveJingleSdpTransport(transport, { type }, deps);
    const contentMids = xmppBuildJingleSdpContentMids(selectedContents);
    const sessionId = Math.floor((Date.now() % 2147483647) || 1);
    const lines = [
      "v=0",
      `o=- ${sessionId} 2 IN IP4 127.0.0.1`,
      "s=-",
      "t=0 0",
      `a=group:BUNDLE ${contentMids.join(" ")}`,
      "a=msid-semantic: WMS *"
    ];
    selectedContents.forEach((content, index) => {
      const kind = content.media;
      const sdpDirection = sdpDirectionFromJingleSendersFn(content.senders || "both", localRole);
      const contentTransport = content.transport && typeof content.transport === "object"
        ? content.transport
        : null;
      const credsForContent = contentTransport
        ? {
          ufrag: (contentTransport.ufrag || "").toString().trim() || resolvedTransport.ufrag,
          pwd: (contentTransport.pwd || "").toString().trim() || resolvedTransport.pwd
        }
        : { ufrag: resolvedTransport.ufrag, pwd: resolvedTransport.pwd };
      const dtlsForContent = contentTransport
        ? {
          hash: (contentTransport.hash || "sha-256").toString().trim().toLowerCase() || "sha-256",
          value: (contentTransport.fingerprint || contentTransport.value || "").toString().trim() || resolvedTransport.fingerprintValue,
          setup: (contentTransport.setup || "").toString().trim().toLowerCase() || resolvedTransport.setup
        }
        : {
          hash: resolvedTransport.fingerprintHash,
          value: resolvedTransport.fingerprintValue,
          setup: resolvedTransport.setup
        };
      const payloads = content.payloadTypes.length > 0
        ? content.payloadTypes
        : [{
          id: kind === "audio" ? "111" : "96",
          name: kind === "audio" ? "opus" : "VP8",
          clockrate: kind === "audio" ? "48000" : "90000",
          channels: kind === "audio" ? "2" : "1",
          rtcpFeedback: [],
          parameters: []
        }];
      const payloadIds = payloads.map((payload) => payload.id).join(" ");
      lines.push(
        `m=${kind} 9 UDP/TLS/RTP/SAVPF ${payloadIds}`,
        "c=IN IP4 0.0.0.0",
        "a=rtcp:9 IN IP4 0.0.0.0",
        `a=ice-ufrag:${credsForContent.ufrag}`,
        `a=ice-pwd:${credsForContent.pwd}`,
        "a=ice-options:trickle",
        `a=fingerprint:${dtlsForContent.hash} ${dtlsForContent.value}`,
        `a=setup:${dtlsForContent.setup}`,
        `a=mid:${contentMids[index] || String(index)}`,
        `a=${sdpDirection}`,
        "a=rtcp-mux"
      );
      payloads.forEach((payload) => {
        const clockrate = String(Number(payload.clockrate) || (kind === "audio" ? 48000 : 90000));
        const channels = String(Math.max(1, Number(payload.channels) || (kind === "audio" ? 2 : 1)));
        const codecName = (payload.name || (kind === "audio" ? "opus" : "VP8")).toString().trim() || (kind === "audio" ? "opus" : "VP8");
        const codecSpec = kind === "audio" && channels !== "1"
          ? `${codecName}/${clockrate}/${channels}`
          : `${codecName}/${clockrate}`;
        lines.push(`a=rtpmap:${payload.id} ${codecSpec}`);
        const fmtp = payload.parameters
          .filter((param) => param.name)
          .map((param) => param.value ? `${param.name}=${param.value}` : param.name)
          .join(";");
        if (fmtp) lines.push(`a=fmtp:${payload.id} ${fmtp}`);
        const payloadRtcpFeedback = payload.rtcpFeedback
          .filter((feedback) => feedback.type)
          .map((feedback) => `${feedback.type}${feedback.subtype ? ` ${feedback.subtype}` : ""}`);
        payloadRtcpFeedback.forEach((feedbackLine) => {
          lines.push(`a=rtcp-fb:${payload.id} ${feedbackLine}`);
        });
      });
      const commonRtcpFeedback = content.rtcpFeedback
        .filter((feedback) => feedback.type)
        .map((feedback) => `${feedback.type}${feedback.subtype ? ` ${feedback.subtype}` : ""}`);
      commonRtcpFeedback.forEach((feedbackLine) => {
        lines.push(`a=rtcp-fb:* ${feedbackLine}`);
      });
      content.extmaps.forEach((extmap) => {
        const normalizedDirection = normalizeSdpExtmapDirectionFn(extmap.direction, localRole);
        const direction = normalizedDirection ? `/${normalizedDirection}` : "";
        const suffix = extmap.attributes ? ` ${extmap.attributes}` : "";
        lines.push(`a=extmap:${extmap.id}${direction} ${extmap.uri}${suffix}`);
      });
      content.sourceGroups.forEach((group) => {
        lines.push(`a=ssrc-group:${group.semantics} ${group.sources.join(" ")}`);
      });
      content.sources.forEach((source) => {
        source.parameters.forEach((param) => {
          const value = param.value ? `:${param.value}` : "";
          lines.push(`a=ssrc:${source.ssrc} ${param.name}${value}`);
        });
      });
    });
    return lines.join("\r\n") + "\r\n";
  }

  function xmppNormalizeRemoteDescriptionType(remoteType = "offer") {
    return (remoteType || "offer").toString().trim().toLowerCase() === "answer" ? "answer" : "offer";
  }

  function xmppShouldCreateLocalOfferBeforeRemoteAnswer(remoteType = "offer", hasLocalDescription = false) {
    return xmppNormalizeRemoteDescriptionType(remoteType) === "answer" && !hasLocalDescription;
  }

  function xmppSelectEffectiveRemoteContents(remoteType = "offer", remoteContents = [], localOfferSdp = "", deps = {}) {
    if (xmppNormalizeRemoteDescriptionType(remoteType) !== "answer") {
      return Array.isArray(remoteContents) ? remoteContents : [];
    }
    const alignFn = typeof deps.alignRemoteJingleContentsToLocalOfferFn === "function"
      ? deps.alignRemoteJingleContentsToLocalOfferFn
      : xmppAlignRemoteJingleContentsToLocalOffer;
    return alignFn(remoteContents, localOfferSdp || "");
  }

  function xmppResolvePrimeRemoteSdpMedia(media = ["audio", "video"], session = null, deps = {}) {
    const normalized = Array.isArray(media) ? media.filter(Boolean) : [];
    if (normalized.length > 0) return normalized;
    const mediaListFn = typeof deps.callSessionMediaListFn === "function"
      ? deps.callSessionMediaListFn
      : xmppCallSessionMediaList;
    return mediaListFn(session);
  }

  function xmppResolvePrimeRemoteSdpContents(effectiveRemoteContents = [], session = null) {
    const contents = Array.isArray(effectiveRemoteContents) ? effectiveRemoteContents : [];
    if (contents.length > 0) return contents;
    return Array.isArray(session?.remoteContents) ? session.remoteContents : [];
  }

  function xmppBuildPrimeRemoteSdpInput({
    media = ["audio", "video"],
    effectiveRemoteContents = [],
    session = null,
    remoteTransport = null,
    remoteType = "offer",
    localRole = "responder"
  } = {}, deps = {}) {
    return {
      media: xmppResolvePrimeRemoteSdpMedia(media, session, deps),
      contents: xmppResolvePrimeRemoteSdpContents(effectiveRemoteContents, session),
      transport: remoteTransport,
      type: xmppNormalizeRemoteDescriptionType(remoteType),
      localRole
    };
  }

  function xmppShouldRollbackBeforeApplyingRemoteOffer(remoteType = "offer", signalingState = "stable") {
    return xmppNormalizeRemoteDescriptionType(remoteType) === "offer"
      && (signalingState || "").toString().trim().toLowerCase() !== "stable";
  }

  function xmppBuildPeerConnectionRemoteDescriptionInit(remoteType = "offer", sdp = "") {
    return {
      type: xmppNormalizeRemoteDescriptionType(remoteType),
      sdp: (sdp || "").toString()
    };
  }

  function xmppShouldCreateLocalAnswerAfterRemoteOffer(remoteType = "offer", hasLocalDescription = false) {
    return xmppNormalizeRemoteDescriptionType(remoteType) === "offer" && !hasLocalDescription;
  }

  function xmppNormalizeRemoteTransportInfo(remoteTransport = null) {
    if (!remoteTransport || typeof remoteTransport !== "object") return null;
    return {
      ufrag: (remoteTransport.ufrag || "").toString().trim(),
      pwd: (remoteTransport.pwd || "").toString().trim()
    };
  }

  function xmppNormalizeSessionId(sessionId = "") {
    return (sessionId || "").toString().trim();
  }

  function xmppCanCreatePeerConnection(globalScopeRef) {
    return typeof globalScopeRef?.RTCPeerConnection === "function";
  }

  function xmppBuildSessionPeerConnectionEntry({
    sessionId = "",
    peerJid = "",
    pc = null
  } = {}) {
    return {
      sessionId: xmppNormalizeSessionId(sessionId),
      peerJid: (peerJid || "").toString().trim(),
      pc,
      pendingRemoteCandidates: [],
      localCandidateKeys: new Set(),
      closed: false
    };
  }

  function xmppResolveWantedMediaKinds(media = ["audio", "video"], session = null, deps = {}) {
    const callSessionMediaListFn = typeof deps.callSessionMediaListFn === "function"
      ? deps.callSessionMediaListFn
      : xmppCallSessionMediaList;
    return [...new Set(
      (Array.isArray(media) ? media : callSessionMediaListFn(session))
        .map((item) => (item || "").toString().trim().toLowerCase())
        .filter((item) => item === "audio" || item === "video")
    )];
  }

  function xmppBuildIceCandidateDedupeKey(candidate = {}) {
    return `${candidate?.protocol || ""}|${candidate?.ip || ""}|${candidate?.port || ""}|${candidate?.type || ""}|${candidate?.component || ""}`;
  }

  function xmppResolveLocalTransportFromPcSdp(localSdp = "", currentSession = null, deps = {}) {
    const parseIceCredsFromSdpFn = typeof deps.parseIceCredsFromSdpFn === "function"
      ? deps.parseIceCredsFromSdpFn
      : xmppParseIceCredsFromSdp;
    const buildJingleTransportCredsFn = typeof deps.buildJingleTransportCredsFn === "function"
      ? deps.buildJingleTransportCredsFn
      : xmppBuildJingleTransportCreds;
    return parseIceCredsFromSdpFn(localSdp || "")
      || (currentSession?.localTransport && typeof currentSession.localTransport === "object"
        ? currentSession.localTransport
        : buildJingleTransportCredsFn());
  }

  function xmppAppendLocalSessionCandidate(currentSession = null, candidate = null, maxCandidates = 50) {
    if (!currentSession || !candidate) return;
    if (!Array.isArray(currentSession.localCandidates)) currentSession.localCandidates = [];
    currentSession.localCandidates.push(candidate);
    if (currentSession.localCandidates.length > maxCandidates) {
      currentSession.localCandidates = currentSession.localCandidates.slice(-maxCandidates);
    }
  }

  function xmppBuildRemoteStreamId({
    stream = null,
    track = null
  } = {}, deps = {}) {
    const createIdFn = typeof deps.createIdFn === "function"
      ? deps.createIdFn
      : (() => Math.random().toString(16).slice(2));
    return (stream?.id || (track?.id ? `track:${track.id}` : `stream:${createIdFn()}`)).toString();
  }

  function xmppEnsureRemoteStreamBucket(existingBucket = null) {
    return existingBucket instanceof Map ? existingBucket : new Map();
  }

  function xmppShouldRenderActiveCallSurface(activeSessionId = "", sessionId = "") {
    return (activeSessionId || "").toString().trim() === (sessionId || "").toString().trim();
  }

  function xmppFilterValidIceCandidates(candidates = []) {
    return Array.isArray(candidates) ? candidates.filter((entry) => entry && typeof entry === "object") : [];
  }

  function xmppBuildIceApplyResult({
    attempted = 0,
    applied = 0,
    queued = 0
  } = {}) {
    return {
      attempted: Number(attempted) || 0,
      applied: Number(applied) || 0,
      queued: Number(queued) || 0
    };
  }

  function xmppHasPeerRemoteDescription(pc = null) {
    return Boolean(pc?.remoteDescription);
  }

  function xmppQueuePendingRemoteCandidates(entry = null, candidates = []) {
    if (!entry || !Array.isArray(entry.pendingRemoteCandidates)) return 0;
    const list = xmppFilterValidIceCandidates(candidates);
    if (list.length === 0) return 0;
    entry.pendingRemoteCandidates.push(...list);
    return list.length;
  }

  function xmppBuildQueuedOnlyIceApplyResult(candidates = []) {
    const list = xmppFilterValidIceCandidates(candidates);
    return xmppBuildIceApplyResult({
      attempted: list.length,
      applied: 0,
      queued: list.length
    });
  }

  function xmppHasPendingRemoteCandidates(entry = null) {
    return Boolean(entry?.pc && Array.isArray(entry.pendingRemoteCandidates) && entry.pendingRemoteCandidates.length > 0);
  }

  function xmppCanFlushPendingRemoteCandidates(entry = null) {
    return xmppHasPendingRemoteCandidates(entry) && xmppHasPeerRemoteDescription(entry?.pc || null);
  }

  function xmppSnapshotAndClearPendingRemoteCandidates(entry = null) {
    if (!entry || !Array.isArray(entry.pendingRemoteCandidates)) return [];
    const pending = [...entry.pendingRemoteCandidates];
    entry.pendingRemoteCandidates = [];
    return pending;
  }

  function xmppNormalizeIceGatherTimeout(timeoutMs = 4000, fallbackTimeoutMs = 4000) {
    return Math.max(1000, Number(timeoutMs) || Number(fallbackTimeoutMs) || 4000);
  }

  function xmppNormalizeIceGatherCandidateCap(maxCandidates = 50, fallbackCap = 50) {
    return Math.max(1, Number(maxCandidates) || Number(fallbackCap) || 50);
  }

  function xmppBuildEmptyIceGatherResult(deps = {}) {
    const buildJingleTransportCredsFn = typeof deps.buildJingleTransportCredsFn === "function"
      ? deps.buildJingleTransportCredsFn
      : xmppBuildJingleTransportCreds;
    return { transport: buildJingleTransportCredsFn(), candidates: [] };
  }

  function xmppBuildIceProbeChannelLabel() {
    return "shitcord67-ice-probe";
  }

  function xmppNormalizeTransportCreds(transport = null, deps = {}) {
    const buildJingleTransportCredsFn = typeof deps.buildJingleTransportCredsFn === "function"
      ? deps.buildJingleTransportCredsFn
      : xmppBuildJingleTransportCreds;
    if (!transport || typeof transport !== "object") return buildJingleTransportCredsFn();
    const normalized = {
      ufrag: (transport.ufrag || "").toString().trim(),
      pwd: (transport.pwd || "").toString().trim()
    };
    if (normalized.ufrag && normalized.pwd) return normalized;
    return buildJingleTransportCredsFn();
  }

  function xmppResolveGatheredTransport(gathered = null, deps = {}) {
    return xmppNormalizeTransportCreds(gathered?.transport || null, deps);
  }

  function xmppResolveGatheredCandidates(gathered = null, maxCandidates = 50) {
    const cap = xmppNormalizeIceGatherCandidateCap(maxCandidates, 50);
    return Array.isArray(gathered?.candidates)
      ? gathered.candidates.slice(0, cap)
      : [];
  }

  function xmppShouldSkipTransportInfoGather(force = false, hasInFlight = false) {
    return !force && hasInFlight;
  }

  function xmppResolveTransportInfoSessionState(sent = false) {
    return sent ? "transport-info-sent" : "transport-info-failed";
  }

  function xmppBuildTransportInfoDebugPayload({
    to = "",
    sid = "",
    localCandidates = []
  } = {}) {
    return {
      to: (to || "").toString().trim(),
      sid: (sid || "").toString().trim(),
      candidateCount: Array.isArray(localCandidates) ? localCandidates.length : 0
    };
  }

  function xmppBuildIceGatherErrorPayload({
    to = "",
    sid = "",
    error = ""
  } = {}) {
    return {
      to: (to || "").toString().trim(),
      sid: (sid || "").toString().trim(),
      error: String(error?.message || error || "")
    };
  }

  function xmppResolveFallbackTransportForGatherFailure(sessionFallback = null, deps = {}) {
    const buildJingleTransportCredsFn = typeof deps.buildJingleTransportCredsFn === "function"
      ? deps.buildJingleTransportCredsFn
      : xmppBuildJingleTransportCreds;
    if (sessionFallback?.localTransport && typeof sessionFallback.localTransport === "object") {
      return sessionFallback.localTransport;
    }
    return buildJingleTransportCredsFn();
  }

  function xmppNormalizeJingleRtpMediaType(media = "audio") {
    return (media || "").toString().trim().toLowerCase() === "video" ? "video" : "audio";
  }

  function xmppNormalizeJingleContentName(name = "", media = "audio") {
    const mediaType = xmppNormalizeJingleRtpMediaType(media);
    return (name || mediaType).toString().trim() || mediaType;
  }

  function xmppNormalizeJingleSendersValue(senders = "both") {
    return (senders || "both").toString().trim().toLowerCase() || "both";
  }

  function xmppBuildDefaultJinglePayloadType(media = "audio") {
    const mediaType = xmppNormalizeJingleRtpMediaType(media);
    return {
      id: mediaType === "audio" ? "111" : "96",
      name: mediaType === "audio" ? "opus" : "VP8",
      clockrate: mediaType === "audio" ? "48000" : "90000",
      channels: mediaType === "audio" ? "2" : "1",
      rtcpFeedback: [],
      parameters: []
    };
  }

  function xmppResolveJinglePayloadTypes(payloadTypes = [], media = "audio") {
    if (Array.isArray(payloadTypes) && payloadTypes.length > 0) return payloadTypes;
    return [xmppBuildDefaultJinglePayloadType(media)];
  }

  function xmppBuildJingleRtcpFeedbackAttrs(feedback = {}, deps = {}) {
    const rtcpFbNamespace = (deps.rtcpFbNamespace || "").toString().trim();
    if (!feedback?.type || !rtcpFbNamespace) return null;
    const attrs = {
      xmlns: rtcpFbNamespace,
      type: String(feedback.type)
    };
    if (feedback.subtype) attrs.subtype = String(feedback.subtype);
    return attrs;
  }

  function xmppResolveJingleRtpTransportCreds(transport = null, deps = {}) {
    const buildJingleTransportCredsFn = typeof deps.buildJingleTransportCredsFn === "function"
      ? deps.buildJingleTransportCredsFn
      : xmppBuildJingleTransportCreds;
    const normalizedTransport = transport && typeof transport === "object"
      ? {
        ufrag: (transport.ufrag || "").toString().trim(),
        pwd: (transport.pwd || "").toString().trim()
      }
      : buildJingleTransportCredsFn();
    const fallbackCreds = (!normalizedTransport.ufrag || !normalizedTransport.pwd) ? buildJingleTransportCredsFn() : null;
    return {
      ufrag: normalizedTransport.ufrag || fallbackCreds?.ufrag || "",
      pwd: normalizedTransport.pwd || fallbackCreds?.pwd || ""
    };
  }

  function xmppResolveJingleRtpDtlsInfo(dtls = null, deps = {}) {
    const generatePseudoDtlsFingerprintFn = typeof deps.generatePseudoDtlsFingerprintFn === "function"
      ? deps.generatePseudoDtlsFingerprintFn
      : xmppGeneratePseudoDtlsFingerprint;
    if (dtls && typeof dtls === "object") {
      return {
        hash: (dtls.hash || "sha-256").toString().trim().toLowerCase() || "sha-256",
        value: (dtls.value || "").toString().trim() || generatePseudoDtlsFingerprintFn(),
        setup: (dtls.setup || "actpass").toString().trim().toLowerCase() || "actpass"
      };
    }
    return {
      hash: "sha-256",
      value: generatePseudoDtlsFingerprintFn(),
      setup: "actpass"
    };
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
  } = {}, deps = {}) {
    if (!builder || typeof builder.c !== "function") return builder;
    const mediaType = xmppNormalizeJingleRtpMediaType(media);
    const contentName = xmppNormalizeJingleContentName(name, mediaType);
    const sendersValue = xmppNormalizeJingleSendersValue(senders);
    const jingleRtpNamespace = (deps.jingleRtpNamespace || "").toString().trim();
    const rtcpFbNamespace = (deps.rtcpFbNamespace || "").toString().trim();
    const hdrExtNamespace = (deps.hdrExtNamespace || "").toString().trim();
    const ssmaNamespace = (deps.ssmaNamespace || "").toString().trim();
    const rtcpMuxNamespace = (deps.rtcpMuxNamespace || "").toString().trim();
    const iceUdpNamespace = (deps.iceUdpNamespace || "").toString().trim();
    const dtlsNamespace = (deps.dtlsNamespace || "urn:xmpp:jingle:apps:dtls:0").toString().trim();
    if (!jingleRtpNamespace || !iceUdpNamespace || !rtcpFbNamespace || !hdrExtNamespace || !ssmaNamespace || !rtcpMuxNamespace) return builder;
    builder
      .c("content", { creator, name: contentName, senders: sendersValue })
      .c("description", { xmlns: jingleRtpNamespace, media: mediaType });
    const normalizedPayloads = xmppResolveJinglePayloadTypes(payloadTypes, mediaType);
    normalizedPayloads.forEach((payload) => {
      const id = (payload.id || "").toString().trim() || (mediaType === "audio" ? "111" : "96");
      const payloadName = (payload.name || "").toString().trim() || (mediaType === "audio" ? "opus" : "VP8");
      const clockrate = String(Number(payload.clockrate) || (mediaType === "audio" ? 48000 : 90000));
      const channels = String(Math.max(1, Number(payload.channels) || (mediaType === "audio" ? 2 : 1)));
      const attrs = mediaType === "audio"
        ? { id, name: payloadName, clockrate, channels }
        : { id, name: payloadName, clockrate };
      builder.c("payload-type", attrs);
      (Array.isArray(payload.parameters) ? payload.parameters : []).forEach((param) => {
        if (!param?.name) return;
        const paramAttrs = { name: String(param.name) };
        if (param.value) paramAttrs.value = String(param.value);
        builder.c("parameter", paramAttrs).up();
      });
      (Array.isArray(payload.rtcpFeedback) ? payload.rtcpFeedback : []).forEach((feedback) => {
        const fbAttrs = xmppBuildJingleRtcpFeedbackAttrs(feedback, { rtcpFbNamespace });
        if (!fbAttrs) return;
        builder.c("rtcp-fb", fbAttrs).up();
      });
      builder.up();
    });
    (Array.isArray(rtcpFeedback) ? rtcpFeedback : []).forEach((feedback) => {
      const fbAttrs = xmppBuildJingleRtcpFeedbackAttrs(feedback, { rtcpFbNamespace });
      if (!fbAttrs) return;
      builder.c("rtcp-fb", fbAttrs).up();
    });
    (Array.isArray(extmaps) ? extmaps : []).forEach((extmap) => {
      if (!extmap?.id || !extmap?.uri) return;
      const attrs = {
        xmlns: hdrExtNamespace,
        id: String(extmap.id),
        uri: String(extmap.uri)
      };
      if (extmap.direction) attrs.senders = String(extmap.direction);
      if (extmap.attributes) attrs.attributes = String(extmap.attributes);
      builder.c("rtp-hdrext", attrs).up();
    });
    (Array.isArray(sourceGroups) ? sourceGroups : []).forEach((group) => {
      if (!group?.semantics || !Array.isArray(group.sources) || group.sources.length === 0) return;
      builder.c("source-group", { xmlns: ssmaNamespace, semantics: String(group.semantics) });
      group.sources.forEach((ssrc) => {
        if (!ssrc) return;
        builder.c("source", { xmlns: ssmaNamespace, ssrc: String(ssrc) }).up();
      });
      builder.up();
    });
    (Array.isArray(sources) ? sources : []).forEach((source) => {
      if (!source?.ssrc) return;
      builder.c("source", { xmlns: ssmaNamespace, ssrc: String(source.ssrc) });
      (Array.isArray(source.parameters) ? source.parameters : []).forEach((param) => {
        if (!param?.name) return;
        const attrs = { name: String(param.name) };
        if (param.value) attrs.value = String(param.value);
        builder.c("parameter", attrs).up();
      });
      builder.up();
    });
    if (rtcpMux !== false) {
      builder.c("rtcp-mux", { xmlns: rtcpMuxNamespace }).up();
    }
    const creds = xmppResolveJingleRtpTransportCreds(transport, deps);
    const dtlsInfo = xmppResolveJingleRtpDtlsInfo(dtls, deps);
    builder
      .up()
      .c("transport", {
        xmlns: iceUdpNamespace,
        ufrag: creds.ufrag,
        pwd: creds.pwd
      });
    builder.c("fingerprint", {
      xmlns: dtlsNamespace,
      hash: dtlsInfo.hash,
      setup: dtlsInfo.setup
    }).t(dtlsInfo.value).up();
    builder
      .up()
      .up();
    return builder;
  }

  function xmppBuildJingleBundleGroup(builder, contentNames = [], deps = {}) {
    if (!builder || typeof builder.c !== "function") return builder;
    const groupingNamespace = (deps.groupingNamespace || "").toString().trim();
    if (!groupingNamespace) return builder;
    const names = [...new Set(
      (Array.isArray(contentNames) ? contentNames : [])
        .map((entry) => (entry || "").toString().trim())
        .filter(Boolean)
    )];
    if (names.length < 2) return builder;
    builder.c("group", {
      xmlns: groupingNamespace,
      semantics: "BUNDLE"
    });
    names.forEach((name) => {
      builder.c("content", { name }).up();
    });
    builder.up();
    return builder;
  }

  function xmppNormalizeTransportInfoLocalRole(session = null) {
    const normalized = (session?.localJingleRole || "").toString().trim().toLowerCase();
    if (normalized === "responder") return "responder";
    if (normalized === "initiator") return "initiator";
    return (session?.direction || "").toString().trim().toLowerCase() === "incoming" ? "responder" : "initiator";
  }

  function xmppBuildTransportInfoContentCatalog({
    sessionLocalContents = [],
    sessionRemoteContents = [],
    localSdpContents = [],
    sessionMedia = []
  } = {}) {
    const contentCatalog = [];
    const seenContentNames = new Set();
    const pushContent = (name = "", media = "") => {
      const normalizedName = (name || "").toString().trim();
      const normalizedMedia = (media || "").toString().trim().toLowerCase();
      if (!normalizedName || (normalizedMedia !== "audio" && normalizedMedia !== "video")) return;
      if (seenContentNames.has(normalizedName)) return;
      seenContentNames.add(normalizedName);
      contentCatalog.push({ name: normalizedName, media: normalizedMedia });
    };
    const localEntries = (Array.isArray(sessionLocalContents) ? sessionLocalContents : []);
    localEntries.forEach((entry, index) => {
      const media = (entry?.media || "").toString().trim().toLowerCase();
      if (media !== "audio" && media !== "video") return;
      const name = (entry?.name || `${media}${index}`).toString().trim() || `${media}${index}`;
      pushContent(name, media);
    });
    if (contentCatalog.length > 0) {
      return contentCatalog;
    }
    const remoteEntries = (Array.isArray(sessionRemoteContents) ? sessionRemoteContents : []);
    remoteEntries.forEach((entry, index) => {
      const media = (entry?.media || "").toString().trim().toLowerCase();
      if (media !== "audio" && media !== "video") return;
      const name = (entry?.name || `${media}${index}`).toString().trim() || `${media}${index}`;
      pushContent(name, media);
    });
    const hasRemoteCatalog = contentCatalog.length > 0;
    if (hasRemoteCatalog) {
      return contentCatalog;
    }
    (Array.isArray(localSdpContents) ? localSdpContents : []).forEach((entry, index) => {
      const media = (entry?.media || "").toString().trim().toLowerCase();
      if (media !== "audio" && media !== "video") return;
      const name = (entry?.name || `${media}${index}`).toString().trim() || `${media}${index}`;
      pushContent(media, media);
      pushContent(name, media);
    });
    (Array.isArray(sessionMedia) ? sessionMedia : []).forEach((mediaType, index) => {
      const normalizedMediaType = (mediaType || "").toString().trim().toLowerCase();
      if (normalizedMediaType !== "audio" && normalizedMediaType !== "video") return;
      pushContent(normalizedMediaType, normalizedMediaType);
      pushContent(`${normalizedMediaType}${index}`, normalizedMediaType);
    });
    if (contentCatalog.length === 0) {
      contentCatalog.push({ name: "audio", media: "audio" });
    }
    return contentCatalog;
  }

  function xmppResolveTransportInfoContentTargets(contentCatalog = [], preferredMedia = []) {
    const catalog = Array.isArray(contentCatalog) ? contentCatalog.filter(Boolean) : [];
    if (catalog.length === 0) return [{ name: "audio", media: "audio" }];
    const preferred = new Set(
      (Array.isArray(preferredMedia) ? preferredMedia : [])
        .map((entry) => (entry || "").toString().trim().toLowerCase())
        .filter((entry) => entry === "audio" || entry === "video")
    );
    const preferredCatalog = preferred.size > 0
      ? catalog.filter((entry) => preferred.has((entry?.media || "").toString().trim().toLowerCase()))
      : [];
    const ranked = preferredCatalog.length > 0 ? preferredCatalog : catalog;
    const selectedByMedia = new Map();
    ranked.forEach((entry) => {
      const media = (entry?.media || "").toString().trim().toLowerCase();
      const name = (entry?.name || "").toString().trim();
      if ((media !== "audio" && media !== "video") || !name) return;
      const existing = selectedByMedia.get(media);
      if (!existing) {
        selectedByMedia.set(media, entry);
        return;
      }
      const existingName = (existing.name || "").toString().trim().toLowerCase();
      const nextName = name.toLowerCase();
      const existingExact = existingName === media;
      const nextExact = nextName === media;
      if (!existingExact && nextExact) {
        selectedByMedia.set(media, entry);
        return;
      }
      const existingNumeric = /^\d+$/.test(existingName);
      const nextNumeric = /^\d+$/.test(nextName);
      if (existingNumeric && !nextNumeric) {
        selectedByMedia.set(media, entry);
      }
    });
    const selected = [];
    if (selectedByMedia.has("audio")) selected.push(selectedByMedia.get("audio"));
    if (selectedByMedia.has("video")) selected.push(selectedByMedia.get("video"));
    return selected.filter(Boolean);
  }

  function xmppNormalizeTransportInfoCandidate(candidate = null) {
    if (!candidate || typeof candidate !== "object") return null;
    return {
      ...candidate,
      contentName: ((candidate.contentName || candidate.sdpMid || "") + "").toString().trim(),
      media: ((candidate.media || "") + "").toString().trim().toLowerCase(),
      sdpMLineIndex: Number(candidate.sdpMLineIndex)
    };
  }

  function xmppNormalizeTransportInfoCandidates(candidates = []) {
    return (Array.isArray(candidates) ? candidates : [])
      .map((entry) => xmppNormalizeTransportInfoCandidate(entry))
      .filter(Boolean);
  }

  function xmppBuildTransportInfoCandidateTargets(candidate = {}, contentTargets = []) {
    const targets = Array.isArray(contentTargets) ? contentTargets : [];
    const byMedia = candidate.media
      ? targets.filter((content) => content?.media === candidate.media)
      : [];
    const candidateName = (candidate.contentName || "").toString().trim();
    const candidateNameIsNumeric = /^\d+$/.test(candidateName);
    const byName = targets.filter((content) => content?.name === candidateName);
    if (byName.length > 0 && (!candidateNameIsNumeric || byMedia.length === 0)) return byName;
    if (byMedia.length > 0) return byMedia;
    if (byName.length > 0) return byName;
    if (Number.isFinite(candidate.sdpMLineIndex) && candidate.sdpMLineIndex >= 0 && candidate.sdpMLineIndex < targets.length) {
      return [targets[candidate.sdpMLineIndex]];
    }
    return targets.length > 0 ? [targets[0]] : [];
  }

  function xmppBuildTransportInfoCandidatesByContentName(contentTargets = [], normalizedCandidates = []) {
    const map = new Map();
    const pushCandidateForContent = (contentName = "", candidate = null) => {
      if (!contentName || !candidate) return;
      const list = map.get(contentName) || [];
      list.push(candidate);
      map.set(contentName, list);
    };
    (Array.isArray(normalizedCandidates) ? normalizedCandidates : []).forEach((candidate) => {
      const targets = xmppBuildTransportInfoCandidateTargets(candidate, contentTargets);
      targets.forEach((content) => {
        pushCandidateForContent(content?.name || "", candidate);
      });
    });
    return map;
  }

  function xmppBuildJingleTransportCandidateAttrs(candidate = {}, index = 0) {
    return {
      foundation: (candidate.foundation || `${index + 1}`).toString().slice(0, 24),
      component: String(Number(candidate.component) || 1),
      protocol: ((candidate.protocol || "udp").toString().trim().toLowerCase() || "udp").slice(0, 8),
      priority: String(Number(candidate.priority) || (2130706431 - index)),
      ip: (candidate.ip || "0.0.0.0").toString().slice(0, 64),
      port: String(Number(candidate.port) || 9),
      type: ((candidate.type || "host").toString().trim().toLowerCase() || "host").slice(0, 16)
    };
  }

  function xmppBuildTransportInfoPlan({
    session = null,
    transport = null,
    candidates = [],
    sessionLocalContents = [],
    sessionRemoteContents = [],
    localSdpContents = [],
    sessionMedia = []
  } = {}, deps = {}) {
    const preferredMedia = Array.isArray(sessionMedia) ? sessionMedia : [];
    const contentCatalog = xmppBuildTransportInfoContentCatalog({
      sessionLocalContents,
      sessionRemoteContents,
      localSdpContents,
      sessionMedia: preferredMedia
    });
    const contentTargets = xmppResolveTransportInfoContentTargets(contentCatalog, preferredMedia);
    const normalizedCandidates = xmppNormalizeTransportInfoCandidates(candidates);
    const candidatesByContentName = xmppBuildTransportInfoCandidatesByContentName(contentTargets, normalizedCandidates);
    const transportCreds = xmppResolveJingleRtpTransportCreds(transport, deps);
    const localRole = xmppNormalizeTransportInfoLocalRole(session);
    return {
      localRole,
      transportCreds,
      normalizedCandidates,
      contentTargets,
      candidatesByContentName
    };
  }

  function xmppAppendJingleTransportInfoContents(builder, {
    localRole = "initiator",
    contentTargets = [],
    candidatesByContentName = null,
    transportCreds = null
  } = {}, deps = {}) {
    if (!builder || typeof builder.c !== "function") return builder;
    const iceUdpNamespace = (deps.iceUdpNamespace || "").toString().trim();
    if (!iceUdpNamespace) return builder;
    const map = candidatesByContentName instanceof Map ? candidatesByContentName : new Map();
    const targets = Array.isArray(contentTargets) ? contentTargets : [];
    const normalizedCreds = transportCreds && typeof transportCreds === "object"
      ? transportCreds
      : { ufrag: "", pwd: "" };
    const targetsToSend = targets.filter((content) => {
      const contentName = (content?.name || "").toString().trim();
      if (!contentName) return false;
      const contentCandidates = map.get(contentName) || [];
      return contentCandidates.length > 0;
    });
    (targetsToSend.length > 0 ? targetsToSend : targets.slice(0, 1)).forEach((content) => {
      const contentName = (content?.name || "").toString().trim();
      if (!contentName) return;
      const contentCandidates = map.get(contentName) || [];
      builder
        .c("content", { creator: localRole, name: contentName })
        .c("transport", {
          xmlns: iceUdpNamespace,
          ufrag: (normalizedCreds.ufrag || "").toString(),
          pwd: (normalizedCreds.pwd || "").toString()
        });
      contentCandidates.forEach((candidate, index) => {
        builder.c("candidate", xmppBuildJingleTransportCandidateAttrs(candidate, index)).up();
      });
      builder.up().up();
    });
    return builder;
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
    xmppApplyResolvedRolesToSession,
    xmppParseSdpMediaSections,
    xmppBuildJingleContentsFromSdp,
    xmppAlignRemoteJingleContentsToLocalOffer,
    xmppAlignLocalJingleContentsToRemoteSession,
    xmppNormalizeJingleSdpPayloadType,
    xmppNormalizeJingleSdpContent,
    xmppBuildSelectedJingleSdpContents,
    xmppResolveJingleSdpTransport,
    xmppBuildJingleSdpContentMids,
    xmppBuildMinimalJingleSdp,
    xmppNormalizeRemoteDescriptionType,
    xmppShouldCreateLocalOfferBeforeRemoteAnswer,
    xmppSelectEffectiveRemoteContents,
    xmppResolvePrimeRemoteSdpMedia,
    xmppResolvePrimeRemoteSdpContents,
    xmppBuildPrimeRemoteSdpInput,
    xmppShouldRollbackBeforeApplyingRemoteOffer,
    xmppBuildPeerConnectionRemoteDescriptionInit,
    xmppShouldCreateLocalAnswerAfterRemoteOffer,
    xmppNormalizeRemoteTransportInfo,
    xmppNormalizeSessionId,
    xmppCanCreatePeerConnection,
    xmppBuildSessionPeerConnectionEntry,
    xmppResolveWantedMediaKinds,
    xmppBuildIceCandidateDedupeKey,
    xmppResolveLocalTransportFromPcSdp,
    xmppAppendLocalSessionCandidate,
    xmppBuildRemoteStreamId,
    xmppEnsureRemoteStreamBucket,
    xmppShouldRenderActiveCallSurface,
    xmppFilterValidIceCandidates,
    xmppBuildIceApplyResult,
    xmppHasPeerRemoteDescription,
    xmppQueuePendingRemoteCandidates,
    xmppBuildQueuedOnlyIceApplyResult,
    xmppHasPendingRemoteCandidates,
    xmppCanFlushPendingRemoteCandidates,
    xmppSnapshotAndClearPendingRemoteCandidates,
    xmppNormalizeIceGatherTimeout,
    xmppNormalizeIceGatherCandidateCap,
    xmppBuildEmptyIceGatherResult,
    xmppBuildIceProbeChannelLabel,
    xmppNormalizeTransportCreds,
    xmppResolveGatheredTransport,
    xmppResolveGatheredCandidates,
    xmppShouldSkipTransportInfoGather,
    xmppResolveTransportInfoSessionState,
    xmppBuildTransportInfoDebugPayload,
    xmppBuildIceGatherErrorPayload,
    xmppResolveFallbackTransportForGatherFailure,
    xmppNormalizeJingleRtpMediaType,
    xmppNormalizeJingleContentName,
    xmppNormalizeJingleSendersValue,
    xmppBuildDefaultJinglePayloadType,
    xmppResolveJinglePayloadTypes,
    xmppBuildJingleRtcpFeedbackAttrs,
    xmppResolveJingleRtpTransportCreds,
    xmppResolveJingleRtpDtlsInfo,
    xmppBuildJingleRtpContent,
    xmppBuildJingleBundleGroup,
    xmppNormalizeTransportInfoLocalRole,
    xmppBuildTransportInfoContentCatalog,
    xmppResolveTransportInfoContentTargets,
    xmppNormalizeTransportInfoCandidate,
    xmppNormalizeTransportInfoCandidates,
    xmppBuildTransportInfoCandidateTargets,
    xmppBuildTransportInfoCandidatesByContentName,
    xmppBuildJingleTransportCandidateAttrs,
    xmppBuildTransportInfoPlan,
    xmppAppendJingleTransportInfoContents
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0320_webrtc-sdp-basics", globalScope.SHITCORD67_XEP_0320_WEBRTC_SDP_BASICS);
  }
})(typeof window !== "undefined" ? window : globalThis);
