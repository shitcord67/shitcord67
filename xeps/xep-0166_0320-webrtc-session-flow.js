/*
 * XEP-0166/XEP-0176 + XEP-0320 session flow helpers extracted from app.js.
 * These functions intentionally reference app-level globals at call time.
 */

function xmppCandidateDedupeKey(xep0320, candidate) {
  if (!candidate || typeof candidate !== "object") return "";
  if (typeof xep0320?.xmppBuildIceCandidateDedupeKey === "function") {
    return (xep0320.xmppBuildIceCandidateDedupeKey(candidate) || "").toString();
  }
  return `${candidate.protocol || ""}|${candidate.ip || ""}|${candidate.port || ""}|${candidate.type || ""}|${candidate.component || ""}`;
}

function xmppEnsureRemoteCandidateTracking(entry = null) {
  if (!entry || typeof entry !== "object") return;
  if (!Array.isArray(entry.pendingRemoteCandidates)) entry.pendingRemoteCandidates = [];
  if (!(entry.remoteCandidateKeys instanceof Set)) entry.remoteCandidateKeys = new Set();
  if (!(entry.pendingRemoteCandidateKeys instanceof Set)) entry.pendingRemoteCandidateKeys = new Set();
}

function xmppBuildOfferReceiveOptions(media = [], session = null) {
  const normalized = [...new Set(
    (Array.isArray(media) ? media : xmppCallSessionMediaList(session))
      .map((item) => (item || "").toString().trim().toLowerCase())
      .filter((item) => item === "audio" || item === "video")
  )];
  const includeAudio = normalized.includes("audio") || normalized.length === 0;
  const includeVideo = normalized.includes("video");
  return {
    offerToReceiveAudio: includeAudio,
    offerToReceiveVideo: includeVideo
  };
}

function xmppBuildMinimalJingleSdp({
  media = ["audio", "video"],
  contents = [],
  transport = null,
  type = "offer",
  localRole = "responder"
} = {}) {
  if (typeof XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppBuildMinimalJingleSdp === "function") {
    return XEP_0320_WEBRTC_SDP_BASICS_GLOBAL.xmppBuildMinimalJingleSdp({
      media,
      contents,
      transport,
      type,
      localRole
    }, {
      buildJingleTransportCredsFn: xmppBuildJingleTransportCreds,
      generatePseudoDtlsFingerprintFn: xmppGeneratePseudoDtlsFingerprint,
      sdpDirectionFromJingleSendersFn: xmppSdpDirectionFromJingleSenders,
      normalizeSdpExtmapDirectionFn: xmppNormalizeSdpExtmapDirection
    });
  }
  const normalizedContents = (Array.isArray(contents) ? contents : [])
    .map((entry, index) => {
      const mediaType = (entry?.media || "").toString().trim().toLowerCase();
      const media = mediaType === "audio" || mediaType === "video" ? mediaType : "";
      if (!media) return null;
      const payloads = (Array.isArray(entry?.payloadTypes) ? entry.payloadTypes : [])
        .map((payload) => ({
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
        }))
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
    })
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
  const creds = transport && typeof transport === "object"
    ? {
      ufrag: (transport.ufrag || "").toString().trim(),
      pwd: (transport.pwd || "").toString().trim()
    }
    : xmppBuildJingleTransportCreds();
  const dtls = transport && typeof transport === "object"
    ? {
      hash: (transport.hash || "sha-256").toString().trim().toLowerCase() || "sha-256",
      value: (transport.fingerprint || transport.value || "").toString().trim(),
      setup: (transport.setup || "").toString().trim().toLowerCase()
    }
    : { hash: "sha-256", value: "", setup: "" };
  const fallbackCreds = (!creds.ufrag || !creds.pwd) ? xmppBuildJingleTransportCreds() : null;
  const ufrag = creds.ufrag || fallbackCreds?.ufrag || "u0";
  const pwd = creds.pwd || fallbackCreds?.pwd || "p0";
  const fingerprintValue = dtls.value || xmppGeneratePseudoDtlsFingerprint();
  const fingerprintHash = dtls.hash || "sha-256";
  const fallbackSetup = type === "offer" ? "actpass" : "passive";
  const sessionId = Math.floor((Date.now() % 2147483647) || 1);
  const contentMids = [];
  const usedMids = new Set();
  selectedContents.forEach((content, index) => {
    let mid = (content?.name || "").toString().trim() || String(index);
    if (usedMids.has(mid)) mid = `${mid}-${index}`;
    usedMids.add(mid);
    contentMids.push(mid);
  });
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
    const sdpDirection = xmppSdpDirectionFromJingleSenders(content.senders || "both", localRole);
    const contentTransport = content.transport && typeof content.transport === "object"
      ? content.transport
      : null;
    const credsForContent = contentTransport
      ? {
        ufrag: (contentTransport.ufrag || "").toString().trim() || ufrag,
        pwd: (contentTransport.pwd || "").toString().trim() || pwd
      }
      : { ufrag, pwd };
    const dtlsForContent = contentTransport
      ? {
        hash: (contentTransport.hash || "sha-256").toString().trim().toLowerCase() || "sha-256",
        value: (contentTransport.fingerprint || contentTransport.value || "").toString().trim() || fingerprintValue,
        setup: (contentTransport.setup || "").toString().trim().toLowerCase() || dtls.setup || fallbackSetup
      }
      : {
        hash: fingerprintHash,
        value: fingerprintValue,
        setup: dtls.setup || fallbackSetup
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
      const normalizedDirection = xmppNormalizeSdpExtmapDirection(extmap.direction, localRole);
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

async function xmppPrimePeerConnectionFromJingle(sessionId, {
  peerJid = "",
  media = ["audio", "video"],
  remoteContents = [],
  remoteTransport = null,
  remoteType = "offer",
  localRole = "responder"
} = {}) {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return false;
  const session = xmppCallSessionById.get(sid) || null;
  let entry = xmppEnsureSessionPeerConnection(sid, {
    peerJid,
    media,
    createLocalOffer: remoteType === "answer"
  });
  if (!entry?.pc) return false;
  let pc = entry.pc;
  const xep0320 = XEP_0320_WEBRTC_SDP_BASICS_GLOBAL;
  const normalizedRemoteType = typeof xep0320.xmppNormalizeRemoteDescriptionType === "function"
    ? xep0320.xmppNormalizeRemoteDescriptionType(remoteType)
    : ((remoteType || "offer").toString().trim().toLowerCase() === "answer" ? "answer" : "offer");
  const needsLocalOfferBeforeAnswer = typeof xep0320.xmppShouldCreateLocalOfferBeforeRemoteAnswer === "function"
    ? xep0320.xmppShouldCreateLocalOfferBeforeRemoteAnswer(normalizedRemoteType, Boolean(pc.localDescription))
    : (normalizedRemoteType === "answer" && !pc.localDescription);
  if (needsLocalOfferBeforeAnswer) {
    try {
      const offer = await pc.createOffer(xmppBuildOfferReceiveOptions(media, session));
      await pc.setLocalDescription(offer);
    } catch {
      // Continue and let remote set attempt fail naturally.
    }
  }
  const effectiveRemoteContents = typeof xep0320.xmppSelectEffectiveRemoteContents === "function"
    ? xep0320.xmppSelectEffectiveRemoteContents(normalizedRemoteType, remoteContents, pc.localDescription?.sdp || "", {
      alignRemoteJingleContentsToLocalOfferFn: xmppAlignRemoteJingleContentsToLocalOffer
    })
    : (normalizedRemoteType === "answer"
      ? xmppAlignRemoteJingleContentsToLocalOffer(remoteContents, pc.localDescription?.sdp || "")
      : remoteContents);
  const remoteSdpInput = typeof xep0320.xmppBuildPrimeRemoteSdpInput === "function"
    ? xep0320.xmppBuildPrimeRemoteSdpInput({
      media,
      effectiveRemoteContents,
      session,
      remoteTransport,
      remoteType: normalizedRemoteType,
      localRole
    }, {
      callSessionMediaListFn: xmppCallSessionMediaList
    })
    : {
      media: Array.isArray(media) && media.length > 0 ? media : xmppCallSessionMediaList(session),
      contents: Array.isArray(effectiveRemoteContents) && effectiveRemoteContents.length > 0
        ? effectiveRemoteContents
        : (Array.isArray(session?.remoteContents) ? session.remoteContents : []),
      transport: remoteTransport,
      type: normalizedRemoteType,
      localRole
    };
  const sdp = xmppBuildMinimalJingleSdp(remoteSdpInput);
  const remoteDescriptionInit = typeof xep0320.xmppBuildPeerConnectionRemoteDescriptionInit === "function"
    ? xep0320.xmppBuildPeerConnectionRemoteDescriptionInit(normalizedRemoteType, sdp)
    : { type: normalizedRemoteType, sdp };
  const applyRemoteDescription = async () => {
    await pc.setRemoteDescription(remoteDescriptionInit);
  };
  try {
    const shouldRollback = typeof xep0320.xmppShouldRollbackBeforeApplyingRemoteOffer === "function"
      ? xep0320.xmppShouldRollbackBeforeApplyingRemoteOffer(normalizedRemoteType, pc.signalingState || "")
      : (normalizedRemoteType === "offer" && pc.signalingState !== "stable");
    if (shouldRollback) {
      try {
        await pc.setLocalDescription({ type: "rollback" });
      } catch {
        // Continue with direct set attempt.
      }
    }
    await applyRemoteDescription();
  } catch (error) {
    const errorMessage = String(error?.message || error);
    const shouldRetryWithLocalOffer = normalizedRemoteType === "answer" && !pc.localDescription;
    if (shouldRetryWithLocalOffer) {
      try {
        const offer = await pc.createOffer(xmppBuildOfferReceiveOptions(media, session));
        await pc.setLocalDescription(offer);
        await applyRemoteDescription();
        addXmppDebugEvent("runtime", "Recovered remote answer by priming local offer", {
          sid,
          peer: xmppBareJid(peerJid || ""),
          remoteType: normalizedRemoteType,
          signalingState: pc.signalingState || ""
        });
        return true;
      } catch (retryError) {
        addXmppDebugEvent("error", "Retrying remote answer after local offer failed", {
          sid,
          peer: xmppBareJid(peerJid || ""),
          remoteType: normalizedRemoteType,
          error: String(retryError?.message || retryError)
        });
      }
    }
    addXmppDebugEvent("error", "Failed to set remote description from jingle mapping", {
      sid,
      peer: xmppBareJid(peerJid || ""),
      remoteType: normalizedRemoteType,
      signalingState: pc.signalingState || "",
      error: errorMessage
    });
    try {
      xmppCloseSessionPeerConnection(sid);
      const retryEntry = xmppEnsureSessionPeerConnection(sid, {
        peerJid,
        media: Array.isArray(media) && media.length > 0 ? media : xmppCallSessionMediaList(session),
        createLocalOffer: normalizedRemoteType === "answer"
      });
      if (!retryEntry?.pc) return false;
      if (normalizedRemoteType === "answer" && !retryEntry.pc.localDescription) {
        try {
          const offer = await retryEntry.pc.createOffer(xmppBuildOfferReceiveOptions(media, session));
          await retryEntry.pc.setLocalDescription(offer);
        } catch {
          // Retry without a local offer if offer creation fails.
        }
      }
      await retryEntry.pc.setRemoteDescription(remoteDescriptionInit);
      entry = retryEntry;
      pc = retryEntry.pc;
    } catch (retryError) {
      addXmppDebugEvent("error", "Retry failed setting remote description from jingle mapping", {
        sid,
        peer: xmppBareJid(peerJid || ""),
        remoteType: normalizedRemoteType,
        error: String(retryError?.message || retryError)
      });
      return false;
    }
  }
  const shouldCreateLocalAnswer = typeof xep0320.xmppShouldCreateLocalAnswerAfterRemoteOffer === "function"
    ? xep0320.xmppShouldCreateLocalAnswerAfterRemoteOffer(normalizedRemoteType, Boolean(pc.localDescription))
    : (normalizedRemoteType === "offer" && !pc.localDescription);
  if (shouldCreateLocalAnswer) {
    try {
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      const localCreds = xmppParseIceCredsFromSdp(pc.localDescription?.sdp || "");
      if (session && localCreds) session.localTransport = localCreds;
    } catch (error) {
      addXmppDebugEvent("error", "Failed to generate local answer after remote offer mapping", {
        sid,
        error: String(error?.message || error)
      });
    }
  }
  const normalizedRemoteTransport = typeof xep0320.xmppNormalizeRemoteTransportInfo === "function"
    ? xep0320.xmppNormalizeRemoteTransportInfo(remoteTransport)
    : (remoteTransport && typeof remoteTransport === "object"
      ? {
        ufrag: (remoteTransport.ufrag || "").toString().trim(),
        pwd: (remoteTransport.pwd || "").toString().trim()
      }
      : null);
  if (session && normalizedRemoteTransport) {
    session.remoteTransport = normalizedRemoteTransport;
  }
  const flushResult = await xmppFlushSessionRemoteIceCandidateQueue(sid);
  addXmppDebugEvent("runtime", "Primed peer connection from jingle mapping", {
    sid,
    remoteType: normalizedRemoteType,
    flushed: flushResult.applied || 0,
    queued: flushResult.queued || 0
  });
  return true;
}

function xmppEnsureSessionPeerConnection(sessionId, {
  peerJid = "",
  media = ["audio", "video"],
  createLocalOffer = false
} = {}) {
  const xep0320 = XEP_0320_WEBRTC_SDP_BASICS_GLOBAL;
  const sid = typeof xep0320.xmppNormalizeSessionId === "function"
    ? xep0320.xmppNormalizeSessionId(sessionId)
    : (sessionId || "").toString().trim();
  const canCreatePc = typeof xep0320.xmppCanCreatePeerConnection === "function"
    ? xep0320.xmppCanCreatePeerConnection(globalThis)
    : (typeof globalThis.RTCPeerConnection === "function");
  if (!sid || !canCreatePc) return null;
  const existing = xmppCallPeerConnectionBySessionId.get(sid) || null;
  if (existing?.pc) return existing;
  const session = xmppCallSessionById.get(sid) || null;
  const pc = new globalThis.RTCPeerConnection();
  const resolvedPeerJid = xmppBareJid(peerJid || session?.peerJid || "");
  const entry = typeof xep0320.xmppBuildSessionPeerConnectionEntry === "function"
    ? xep0320.xmppBuildSessionPeerConnectionEntry({
      sessionId: sid,
      peerJid: resolvedPeerJid,
      pc
    })
    : {
      sessionId: sid,
      peerJid: resolvedPeerJid,
      pc,
      pendingRemoteCandidates: [],
      localCandidateKeys: new Set(),
      closed: false
    };
  xmppEnsureRemoteCandidateTracking(entry);
  const wantedMedia = typeof xep0320.xmppResolveWantedMediaKinds === "function"
    ? xep0320.xmppResolveWantedMediaKinds(media, session, {
      callSessionMediaListFn: xmppCallSessionMediaList
    })
    : [...new Set(
      (Array.isArray(media) ? media : xmppCallSessionMediaList(session))
        .map((item) => (item || "").toString().trim().toLowerCase())
        .filter((item) => item === "audio" || item === "video")
    )];
  wantedMedia.forEach((kind) => {
    try {
      pc.addTransceiver(kind, { direction: "sendrecv" });
    } catch {
      // Ignore unsupported transceiver setup.
    }
  });
  pc.onicecandidate = (event) => {
    const raw = (event?.candidate?.candidate || "").toString().trim();
    if (!raw) return;
    const parsed = xmppParseRtcIceCandidateForJingle(raw, {
      sdpMid: event?.candidate?.sdpMid || "",
      sdpMLineIndex: event?.candidate?.sdpMLineIndex
    });
    if (!parsed) return;
    const key = typeof xep0320.xmppBuildIceCandidateDedupeKey === "function"
      ? xep0320.xmppBuildIceCandidateDedupeKey(parsed)
      : `${parsed.protocol}|${parsed.ip}|${parsed.port}|${parsed.type}|${parsed.component}`;
    if (entry.localCandidateKeys.has(key)) return;
    entry.localCandidateKeys.add(key);
    const currentSession = xmppCallSessionById.get(sid) || null;
    const localTransport = typeof xep0320.xmppResolveLocalTransportFromPcSdp === "function"
      ? xep0320.xmppResolveLocalTransportFromPcSdp(pc.localDescription?.sdp || "", currentSession, {
        parseIceCredsFromSdpFn: xmppParseIceCredsFromSdp,
        buildJingleTransportCredsFn: xmppBuildJingleTransportCreds
      })
      : (xmppParseIceCredsFromSdp(pc.localDescription?.sdp || "")
        || (currentSession?.localTransport && typeof currentSession.localTransport === "object"
          ? currentSession.localTransport
          : xmppBuildJingleTransportCreds()));
    if (currentSession) {
      currentSession.localTransport = localTransport;
      if (typeof xep0320.xmppAppendLocalSessionCandidate === "function") {
        xep0320.xmppAppendLocalSessionCandidate(currentSession, parsed, XMPP_CALL_ICE_MAX_CANDIDATES);
      } else {
        if (!Array.isArray(currentSession.localCandidates)) currentSession.localCandidates = [];
        currentSession.localCandidates.push(parsed);
        if (currentSession.localCandidates.length > XMPP_CALL_ICE_MAX_CANDIDATES) {
          currentSession.localCandidates = currentSession.localCandidates.slice(-XMPP_CALL_ICE_MAX_CANDIDATES);
        }
      }
    }
    if (entry.peerJid) {
      xmppSendJingleTransportInfo(entry.peerJid, sid, {
        transport: localTransport,
        candidates: [parsed]
      });
    }
  };
  pc.ontrack = (event) => {
    clearXmppRemoteTrackWaitHint(sid);
    const stream = event?.streams?.[0] instanceof MediaStream
      ? event.streams[0]
      : new MediaStream(event?.track ? [event.track] : []);
    const streamId = typeof xep0320.xmppBuildRemoteStreamId === "function"
      ? xep0320.xmppBuildRemoteStreamId({ stream, track: event?.track || null }, {
        createIdFn: createId
      })
      : (stream?.id || (event?.track?.id ? `track:${event.track.id}` : `stream:${createId()}`)).toString();
    const existingBucket = xmppCallRemoteStreamsBySessionId.get(sid);
    let bucket = typeof xep0320.xmppEnsureRemoteStreamBucket === "function"
      ? xep0320.xmppEnsureRemoteStreamBucket(existingBucket)
      : (existingBucket instanceof Map ? existingBucket : new Map());
    if (!(existingBucket instanceof Map)) {
      xmppCallRemoteStreamsBySessionId.set(sid, bucket);
    }
    bucket.set(streamId, stream);
    const track = event?.track;
    if (track instanceof MediaStreamTrack) {
      const removeStream = () => {
        const current = xmppCallRemoteStreamsBySessionId.get(sid);
        if (!(current instanceof Map)) return;
        current.delete(streamId);
        if (current.size <= 0) xmppCallRemoteStreamsBySessionId.delete(sid);
        const shouldRender = typeof xep0320.xmppShouldRenderActiveCallSurface === "function"
          ? xep0320.xmppShouldRenderActiveCallSurface(xmppActiveNativeCallSessionId, sid)
          : xmppActiveNativeCallSessionId === sid;
        if (shouldRender) renderNativeXmppCallSurface(sid);
      };
      track.addEventListener("ended", removeStream, { once: true });
      track.addEventListener("mute", () => {
        const shouldRender = typeof xep0320.xmppShouldRenderActiveCallSurface === "function"
          ? xep0320.xmppShouldRenderActiveCallSurface(xmppActiveNativeCallSessionId, sid)
          : xmppActiveNativeCallSessionId === sid;
        if (shouldRender) renderNativeXmppCallSurface(sid);
      });
      track.addEventListener("unmute", () => {
        const shouldRender = typeof xep0320.xmppShouldRenderActiveCallSurface === "function"
          ? xep0320.xmppShouldRenderActiveCallSurface(xmppActiveNativeCallSessionId, sid)
          : xmppActiveNativeCallSessionId === sid;
        if (shouldRender) renderNativeXmppCallSurface(sid);
      });
    }
    const shouldRender = typeof xep0320.xmppShouldRenderActiveCallSurface === "function"
      ? xep0320.xmppShouldRenderActiveCallSurface(xmppActiveNativeCallSessionId, sid)
      : xmppActiveNativeCallSessionId === sid;
    if (shouldRender) renderNativeXmppCallSurface(sid);
    addXmppDebugEvent("runtime", "Received remote media track for XMPP session", {
      sid,
      kind: (event?.track?.kind || "").toString(),
      streamId
    });
  };
  pc.onconnectionstatechange = () => {
    const sessionEntry = xmppCallSessionById.get(sid) || null;
    const peer = sessionEntry?.peerJid || entry.peerJid || "";
    const state = pc.connectionState || "";
    if (["connected", "connecting", "new"].includes(state)) {
      scheduleXmppRemoteTrackWaitHint(sid);
      if (sessionEntry) sessionEntry.lastFailureNotified = "";
    }
    if (["failed", "disconnected"].includes(state) && peer) {
      const lastAttempt = xmppCallReconnectAttemptBySessionId.get(sid) || 0;
      const now = Date.now();
      if (now - lastAttempt > 6000) {
        xmppCallReconnectAttemptBySessionId.set(sid, now);
        if (sessionEntry) sessionEntry.state = "reconnecting";
        xmppQueueTransportInfoGatherAndSend(peer, sid, { force: true });
        showToast("Call connection dropped. Attempting to reconnect...", { tone: "error", duration: 2400 });
      }
    }
    if (state === "failed" && sessionEntry?.lastFailureNotified !== "pc-failed") {
      sessionEntry.lastFailureNotified = "pc-failed";
      showToast("Peer connection failed. Try Refresh or end/restart the call.", { tone: "error", duration: 3400 });
      if (peer && addSystemDmMessageByPeerJid(peer, `XMPP call connection failed (${sid.slice(0, 8)}). Try Refresh or restart call.`)) {
        refreshDmUiForPeerJid(peer);
      }
    }
    addXmppDebugEvent("runtime", "XMPP session peerconnection state", {
      sid,
      state: pc.connectionState || ""
    });
    if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
  };
  pc.oniceconnectionstatechange = () => {
    const sessionEntry = xmppCallSessionById.get(sid) || null;
    const peer = sessionEntry?.peerJid || entry.peerJid || "";
    const iceState = pc.iceConnectionState || "";
    if (["connected", "checking", "new"].includes(iceState)) {
      scheduleXmppRemoteTrackWaitHint(sid);
      if (sessionEntry?.lastFailureNotified === "ice-failed") sessionEntry.lastFailureNotified = "";
    }
    if (["failed", "disconnected"].includes(iceState) && peer) {
      const lastAttempt = xmppCallReconnectAttemptBySessionId.get(sid) || 0;
      const now = Date.now();
      if (now - lastAttempt > 6000) {
        xmppCallReconnectAttemptBySessionId.set(sid, now);
        if (sessionEntry) sessionEntry.state = "reconnecting";
        xmppQueueTransportInfoGatherAndSend(peer, sid, { force: true });
      }
    }
    if (iceState === "failed" && sessionEntry?.lastFailureNotified !== "ice-failed") {
      sessionEntry.lastFailureNotified = "ice-failed";
      showToast("ICE transport failed. Gathering fresh candidates...", { tone: "error", duration: 3000 });
      if (peer && addSystemDmMessageByPeerJid(peer, `ICE transport failed for XMPP call (${sid.slice(0, 8)}). Retrying transport-info.`)) {
        refreshDmUiForPeerJid(peer);
      }
    }
    if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
  };
  xmppCallPeerConnectionBySessionId.set(sid, entry);
  if (createLocalOffer) {
    const offerOptions = xmppBuildOfferReceiveOptions(wantedMedia, session);
    Promise.resolve()
      .then(() => pc.createOffer(offerOptions))
      .then((offer) => pc.setLocalDescription(offer))
      .then(() => {
        addXmppDebugEvent("runtime", "Prepared local WebRTC offer for XMPP session", {
          sid,
          peer: entry.peerJid || ""
        });
      })
      .catch((error) => {
        addXmppDebugEvent("error", "Failed preparing local WebRTC offer", {
          sid,
          error: String(error?.message || error)
        });
      });
  }
  return entry;
}

function xmppCloseSessionPeerConnection(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return;
  const entry = xmppCallPeerConnectionBySessionId.get(sid);
  if (!entry) return;
  entry.closed = true;
  try {
    entry.pc.onicecandidate = null;
    entry.pc.onconnectionstatechange = null;
    entry.pc.close();
  } catch {
    // Ignore close errors.
  }
  xmppCallPeerConnectionBySessionId.delete(sid);
  xmppCallRemoteStreamsBySessionId.delete(sid);
}

async function xmppApplyRemoteIceCandidatesForSession(sessionId, candidates = []) {
  const xep0320 = XEP_0320_WEBRTC_SDP_BASICS_GLOBAL;
  const sid = typeof xep0320.xmppNormalizeSessionId === "function"
    ? xep0320.xmppNormalizeSessionId(sessionId)
    : (sessionId || "").toString().trim();
  const list = typeof xep0320.xmppFilterValidIceCandidates === "function"
    ? xep0320.xmppFilterValidIceCandidates(candidates)
    : (Array.isArray(candidates) ? candidates.filter((entry) => entry && typeof entry === "object") : []);
  const emptyResult = typeof xep0320.xmppBuildIceApplyResult === "function"
    ? xep0320.xmppBuildIceApplyResult()
    : { attempted: 0, applied: 0, queued: 0 };
  if (!sid || list.length === 0) return emptyResult;
  const session = xmppCallSessionById.get(sid) || null;
  const entry = xmppEnsureSessionPeerConnection(sid, {
    peerJid: session?.peerJid || "",
    media: xmppCallSessionMediaList(session),
    createLocalOffer: session?.direction === "outgoing"
  });
  if (!entry?.pc) {
    return typeof xep0320.xmppBuildQueuedOnlyIceApplyResult === "function"
      ? xep0320.xmppBuildQueuedOnlyIceApplyResult(list)
      : { attempted: list.length, applied: 0, queued: list.length };
  }
  xmppEnsureRemoteCandidateTracking(entry);
  const pc = entry.pc;
  const hasRemoteDescription = typeof xep0320.xmppHasPeerRemoteDescription === "function"
    ? xep0320.xmppHasPeerRemoteDescription(pc)
    : Boolean(pc.remoteDescription);
  if (!hasRemoteDescription) {
    const queueable = list.filter((candidate) => {
      const key = xmppCandidateDedupeKey(xep0320, candidate);
      if (!key) return true;
      if (entry.remoteCandidateKeys.has(key) || entry.pendingRemoteCandidateKeys.has(key)) return false;
      entry.pendingRemoteCandidateKeys.add(key);
      return true;
    });
    if (queueable.length > 0) {
      if (typeof xep0320.xmppQueuePendingRemoteCandidates === "function") {
        xep0320.xmppQueuePendingRemoteCandidates(entry, queueable);
      } else {
        entry.pendingRemoteCandidates.push(...queueable);
      }
    }
    return typeof xep0320.xmppBuildQueuedOnlyIceApplyResult === "function"
      ? xep0320.xmppBuildQueuedOnlyIceApplyResult(queueable)
      : { attempted: queueable.length, applied: 0, queued: queueable.length };
  }
  let applied = 0;
  let queued = 0;
  for (let i = 0; i < list.length; i += 1) {
    const candidate = list[i];
    const candidateKey = xmppCandidateDedupeKey(xep0320, candidate);
    if (candidateKey && entry.remoteCandidateKeys.has(candidateKey)) continue;
    const rtcCandidate = xmppJingleCandidateToRtcInit(candidate, i, { session });
    try {
      await pc.addIceCandidate(rtcCandidate);
      if (candidateKey) {
        entry.remoteCandidateKeys.add(candidateKey);
        entry.pendingRemoteCandidateKeys.delete(candidateKey);
      }
      applied += 1;
    } catch {
      if (candidateKey && entry.pendingRemoteCandidateKeys.has(candidateKey)) continue;
      entry.pendingRemoteCandidates.push(candidate);
      if (candidateKey) entry.pendingRemoteCandidateKeys.add(candidateKey);
      queued += 1;
    }
  }
  return typeof xep0320.xmppBuildIceApplyResult === "function"
    ? xep0320.xmppBuildIceApplyResult({ attempted: list.length, applied, queued })
    : { attempted: list.length, applied, queued };
}

async function xmppFlushSessionRemoteIceCandidateQueue(sessionId = "") {
  const xep0320 = XEP_0320_WEBRTC_SDP_BASICS_GLOBAL;
  const sid = typeof xep0320.xmppNormalizeSessionId === "function"
    ? xep0320.xmppNormalizeSessionId(sessionId)
    : (sessionId || "").toString().trim();
  const emptyResult = typeof xep0320.xmppBuildIceApplyResult === "function"
    ? xep0320.xmppBuildIceApplyResult()
    : { attempted: 0, applied: 0, queued: 0 };
  if (!sid) return emptyResult;
  const entry = xmppCallPeerConnectionBySessionId.get(sid) || null;
  xmppEnsureRemoteCandidateTracking(entry);
  const hasPending = typeof xep0320.xmppHasPendingRemoteCandidates === "function"
    ? xep0320.xmppHasPendingRemoteCandidates(entry)
    : Boolean(entry?.pc && Array.isArray(entry.pendingRemoteCandidates) && entry.pendingRemoteCandidates.length > 0);
  if (!hasPending) {
    return emptyResult;
  }
  const canFlush = typeof xep0320.xmppCanFlushPendingRemoteCandidates === "function"
    ? xep0320.xmppCanFlushPendingRemoteCandidates(entry)
    : Boolean(entry?.pc?.remoteDescription);
  if (!canFlush) {
    return typeof xep0320.xmppBuildIceApplyResult === "function"
      ? xep0320.xmppBuildIceApplyResult({
        attempted: entry.pendingRemoteCandidates.length,
        applied: 0,
        queued: entry.pendingRemoteCandidates.length
      })
      : {
      attempted: entry.pendingRemoteCandidates.length,
      applied: 0,
      queued: entry.pendingRemoteCandidates.length
    };
  }
  const pending = typeof xep0320.xmppSnapshotAndClearPendingRemoteCandidates === "function"
    ? xep0320.xmppSnapshotAndClearPendingRemoteCandidates(entry)
    : [...entry.pendingRemoteCandidates];
  if (typeof xep0320.xmppSnapshotAndClearPendingRemoteCandidates !== "function") {
    entry.pendingRemoteCandidates = [];
  }
  entry.pendingRemoteCandidateKeys.clear();
  pending.forEach((candidate) => {
    const key = xmppCandidateDedupeKey(xep0320, candidate);
    if (key) entry.pendingRemoteCandidateKeys.add(key);
  });
  const result = await xmppApplyRemoteIceCandidatesForSession(sid, pending);
  return result;
}

async function xmppGatherLocalIceTransportInfo({
  timeoutMs = XMPP_CALL_ICE_GATHER_TIMEOUT_MS,
  maxCandidates = XMPP_CALL_ICE_MAX_CANDIDATES
} = {}) {
  const xep0320 = XEP_0320_WEBRTC_SDP_BASICS_GLOBAL;
  const canCreatePc = typeof xep0320.xmppCanCreatePeerConnection === "function"
    ? xep0320.xmppCanCreatePeerConnection(globalThis)
    : (typeof globalThis.RTCPeerConnection === "function");
  if (!canCreatePc) {
    return typeof xep0320.xmppBuildEmptyIceGatherResult === "function"
      ? xep0320.xmppBuildEmptyIceGatherResult({
        buildJingleTransportCredsFn: xmppBuildJingleTransportCreds
      })
      : { transport: xmppBuildJingleTransportCreds(), candidates: [] };
  }
  const timeout = typeof xep0320.xmppNormalizeIceGatherTimeout === "function"
    ? xep0320.xmppNormalizeIceGatherTimeout(timeoutMs, XMPP_CALL_ICE_GATHER_TIMEOUT_MS)
    : Math.max(1000, Number(timeoutMs) || XMPP_CALL_ICE_GATHER_TIMEOUT_MS);
  const cap = typeof xep0320.xmppNormalizeIceGatherCandidateCap === "function"
    ? xep0320.xmppNormalizeIceGatherCandidateCap(maxCandidates, XMPP_CALL_ICE_MAX_CANDIDATES)
    : Math.max(1, Number(maxCandidates) || XMPP_CALL_ICE_MAX_CANDIDATES);
  const pc = new globalThis.RTCPeerConnection();
  const candidates = [];
  const seen = new Set();
  return new Promise((resolve) => {
    let settled = false;
    let timerId = 0;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (timerId) clearTimeout(timerId);
      const creds = xmppParseIceCredsFromSdp(pc.localDescription?.sdp || "") || xmppBuildJingleTransportCreds();
      try {
        pc.onicecandidate = null;
        pc.onicegatheringstatechange = null;
        pc.close();
      } catch {
        // Ignore close errors.
      }
      resolve({ transport: creds, candidates });
    };
    pc.onicecandidate = (event) => {
      if (!event?.candidate?.candidate) {
        finish();
        return;
      }
      const parsed = xmppParseRtcIceCandidateForJingle(event.candidate.candidate);
      if (!parsed) return;
      const key = `${parsed.protocol}|${parsed.ip}|${parsed.port}|${parsed.type}|${parsed.component}`;
      if (seen.has(key)) return;
      seen.add(key);
      candidates.push(parsed);
      if (candidates.length >= cap) finish();
    };
    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === "complete") finish();
    };
    timerId = window.setTimeout(finish, timeout);
    try {
      const probeLabel = typeof xep0320.xmppBuildIceProbeChannelLabel === "function"
        ? xep0320.xmppBuildIceProbeChannelLabel()
        : "shitcord67-ice-probe";
      pc.createDataChannel(probeLabel);
      pc.createOffer({ offerToReceiveAudio: false, offerToReceiveVideo: false })
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => finish());
    } catch {
      finish();
    }
  });
}

function xmppQueueTransportInfoGatherAndSend(peerJid, sessionId, { force = false } = {}) {
  const xep0320 = XEP_0320_WEBRTC_SDP_BASICS_GLOBAL;
  const sid = typeof xep0320.xmppNormalizeSessionId === "function"
    ? xep0320.xmppNormalizeSessionId(sessionId)
    : (sessionId || "").toString().trim();
  if (!sid) return false;
  const sessionForTarget = xmppCallSessionById.get(sid) || null;
  const to = xmppNormalizeCallTargetJid(
    sessionForTarget?.peerFullJid || sessionForTarget?.peerJid || peerJid,
    { preferFull: true }
  );
  if (!to) return false;
  const shouldSkip = typeof xep0320.xmppShouldSkipTransportInfoGather === "function"
    ? xep0320.xmppShouldSkipTransportInfoGather(force, xmppCallIceGatherInFlightBySessionId.has(sid))
    : (!force && xmppCallIceGatherInFlightBySessionId.has(sid));
  if (shouldSkip) return true;
  const run = (async () => {
    const session = xmppCallSessionById.get(sid) || null;
    if (session) session.state = "transport-gathering";
    try {
      const gathered = await xmppGatherLocalIceTransportInfo();
      const localTransport = typeof xep0320.xmppResolveGatheredTransport === "function"
        ? xep0320.xmppResolveGatheredTransport(gathered, {
          buildJingleTransportCredsFn: xmppBuildJingleTransportCreds
        })
        : (gathered?.transport && typeof gathered.transport === "object"
          ? {
            ufrag: (gathered.transport.ufrag || "").toString().trim(),
            pwd: (gathered.transport.pwd || "").toString().trim()
          }
          : xmppBuildJingleTransportCreds());
      const localCandidates = typeof xep0320.xmppResolveGatheredCandidates === "function"
        ? xep0320.xmppResolveGatheredCandidates(gathered, XMPP_CALL_ICE_MAX_CANDIDATES)
        : (Array.isArray(gathered?.candidates)
          ? gathered.candidates.slice(0, XMPP_CALL_ICE_MAX_CANDIDATES)
          : []);
      if (session) {
        session.localTransport = localTransport;
        session.localCandidates = localCandidates;
      }
      const sent = xmppSendJingleTransportInfo(to, sid, {
        transport: localTransport,
        candidates: localCandidates
      });
      if (session) {
        session.state = typeof xep0320.xmppResolveTransportInfoSessionState === "function"
          ? xep0320.xmppResolveTransportInfoSessionState(sent)
          : (sent ? "transport-info-sent" : "transport-info-failed");
      }
      if (sent) {
        const debugPayload = typeof xep0320.xmppBuildTransportInfoDebugPayload === "function"
          ? xep0320.xmppBuildTransportInfoDebugPayload({ to, sid, localCandidates })
          : { to, sid, candidateCount: localCandidates.length };
        addXmppDebugEvent("iq", "Queued XMPP transport-info sent", debugPayload);
      }
    } catch (error) {
      const errorPayload = typeof xep0320.xmppBuildIceGatherErrorPayload === "function"
        ? xep0320.xmppBuildIceGatherErrorPayload({ to, sid, error })
        : { to, sid, error: String(error?.message || error) };
      addXmppDebugEvent("error", "XMPP ICE gather failed", errorPayload);
      const sessionFallback = xmppCallSessionById.get(sid) || null;
      const fallbackTransport = typeof xep0320.xmppResolveFallbackTransportForGatherFailure === "function"
        ? xep0320.xmppResolveFallbackTransportForGatherFailure(sessionFallback, {
          buildJingleTransportCredsFn: xmppBuildJingleTransportCreds
        })
        : (sessionFallback?.localTransport && typeof sessionFallback.localTransport === "object"
          ? sessionFallback.localTransport
          : xmppBuildJingleTransportCreds());
      xmppSendJingleTransportInfo(to, sid, {
        transport: fallbackTransport,
        candidates: []
      });
    } finally {
      xmppCallIceGatherInFlightBySessionId.delete(sid);
    }
  })();
  xmppCallIceGatherInFlightBySessionId.set(sid, run);
  return true;
}
