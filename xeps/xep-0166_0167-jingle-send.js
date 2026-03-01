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
    const namespaces = deps.namespaces || {};
    const xep0320 = deps.xep0320 || globalScope.SHITCORD67_XEP_0320_WEBRTC_SDP_BASICS || {};
    const jingleRtpNamespace = namespaces.jingleRtpNamespace || "urn:xmpp:jingle:apps:rtp:1";
    const rtcpFbNamespace = namespaces.rtcpFbNamespace || "urn:xmpp:jingle:apps:rtp:rtcp-fb:0";
    const hdrExtNamespace = namespaces.hdrExtNamespace || "urn:xmpp:jingle:apps:rtp:rtp-hdrext:0";
    const ssmaNamespace = namespaces.ssmaNamespace || "urn:xmpp:jingle:apps:rtp:ssma:0";
    const rtcpMuxNamespace = namespaces.rtcpMuxNamespace || "urn:xmpp:jingle:apps:rtp:rtcp-mux:0";
    const iceUdpNamespace = namespaces.iceUdpNamespace || "urn:xmpp:jingle:transports:ice-udp:1";
    const dtlsNamespace = namespaces.dtlsNamespace || "urn:xmpp:jingle:apps:dtls:0";
    const buildJingleTransportCredsFn = typeof deps.buildJingleTransportCredsFn === "function"
      ? deps.buildJingleTransportCredsFn
      : (() => ({ ufrag: "", pwd: "" }));
    const generatePseudoDtlsFingerprintFn = typeof deps.generatePseudoDtlsFingerprintFn === "function"
      ? deps.generatePseudoDtlsFingerprintFn
      : (() => "");
    if (typeof xep0320.xmppBuildJingleRtpContent === "function") {
      return xep0320.xmppBuildJingleRtpContent(builder, {
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
        jingleRtpNamespace,
        rtcpFbNamespace,
        hdrExtNamespace,
        ssmaNamespace,
        rtcpMuxNamespace,
        iceUdpNamespace,
        dtlsNamespace,
        buildJingleTransportCredsFn,
        generatePseudoDtlsFingerprintFn
      });
    }
    const mediaType = media === "video" ? "video" : "audio";
    const contentName = (name || mediaType).toString().trim() || mediaType;
    builder
      .c("content", { creator, name: contentName, senders: (senders || "both").toString().trim().toLowerCase() || "both" })
      .c("description", { xmlns: jingleRtpNamespace, media: mediaType });
    const normalizedPayloads = Array.isArray(payloadTypes) && payloadTypes.length > 0
      ? payloadTypes
      : [{
        id: mediaType === "audio" ? "111" : "96",
        name: mediaType === "audio" ? "opus" : "VP8",
        clockrate: mediaType === "audio" ? "48000" : "90000",
        channels: mediaType === "audio" ? "2" : "1",
        rtcpFeedback: [],
        parameters: []
      }];
    normalizedPayloads.forEach((payload) => {
      const payloadId = (payload.id || "").toString().trim() || (mediaType === "audio" ? "111" : "96");
      const payloadName = (payload.name || "").toString().trim() || (mediaType === "audio" ? "opus" : "VP8");
      const clockrate = String(Number(payload.clockrate) || (mediaType === "audio" ? 48000 : 90000));
      const channels = String(Math.max(1, Number(payload.channels) || (mediaType === "audio" ? 2 : 1)));
      const attrs = mediaType === "audio"
        ? { id: payloadId, name: payloadName, clockrate, channels }
        : { id: payloadId, name: payloadName, clockrate };
      builder.c("payload-type", attrs);
      (Array.isArray(payload.parameters) ? payload.parameters : []).forEach((param) => {
        if (!param?.name) return;
        const paramAttrs = { name: String(param.name) };
        if (param.value) paramAttrs.value = String(param.value);
        builder.c("parameter", paramAttrs).up();
      });
      (Array.isArray(payload.rtcpFeedback) ? payload.rtcpFeedback : []).forEach((feedback) => {
        if (!feedback?.type) return;
        const fbAttrs = { xmlns: rtcpFbNamespace, type: String(feedback.type) };
        if (feedback.subtype) fbAttrs.subtype = String(feedback.subtype);
        builder.c("rtcp-fb", fbAttrs).up();
      });
      builder.up();
    });
    (Array.isArray(rtcpFeedback) ? rtcpFeedback : []).forEach((feedback) => {
      if (!feedback?.type) return;
      const fbAttrs = { xmlns: rtcpFbNamespace, type: String(feedback.type) };
      if (feedback.subtype) fbAttrs.subtype = String(feedback.subtype);
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
    const creds = transport && typeof transport === "object"
      ? {
        ufrag: (transport.ufrag || "").toString().trim(),
        pwd: (transport.pwd || "").toString().trim()
      }
      : buildJingleTransportCredsFn();
    const fallbackCreds = (!creds.ufrag || !creds.pwd) ? buildJingleTransportCredsFn() : null;
    const ufrag = creds.ufrag || fallbackCreds?.ufrag || "";
    const pwd = creds.pwd || fallbackCreds?.pwd || "";
    const dtlsInfo = dtls && typeof dtls === "object"
      ? {
        hash: (dtls.hash || "sha-256").toString().trim().toLowerCase() || "sha-256",
        value: (dtls.value || "").toString().trim() || generatePseudoDtlsFingerprintFn(),
        setup: (dtls.setup || "actpass").toString().trim().toLowerCase() || "actpass"
      }
      : {
        hash: "sha-256",
        value: generatePseudoDtlsFingerprintFn(),
        setup: "actpass"
      };
    builder
      .up()
      .c("transport", {
        xmlns: iceUdpNamespace,
        ufrag,
        pwd
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
    const namespaces = deps.namespaces || {};
    const xep0320 = deps.xep0320 || globalScope.SHITCORD67_XEP_0320_WEBRTC_SDP_BASICS || {};
    const groupingNamespace = namespaces.groupingNamespace || "urn:xmpp:jingle:apps:grouping:0";
    if (typeof xep0320.xmppBuildJingleBundleGroup === "function") {
      return xep0320.xmppBuildJingleBundleGroup(builder, contentNames, { groupingNamespace });
    }
    if (!builder || typeof builder.c !== "function") return builder;
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

  function xmppSendJingleSessionInfo(peerJid, sessionId, {
    info = "ringing",
    onSuccess = null,
    onError = null,
    retryOnRetarget = true
  } = {}, deps = {}) {
    const normalizeCallTargetJidFn = deps.normalizeCallTargetJidFn;
    const connection = deps.connection;
    const relayStatus = deps.relayStatus;
    const iqFactory = deps.iqFactory;
    const namespaces = deps.namespaces || {};
    const addXmppDebugEventFn = deps.addXmppDebugEventFn;
    const trimXmppRawFn = deps.trimXmppRawFn;
    const serializePayloadFn = deps.serializePayloadFn;
    const callIqSessionNotFoundErrorFn = deps.callIqSessionNotFoundErrorFn;
    const resolveRetryCallTargetForSessionFn = deps.resolveRetryCallTargetForSessionFn;
    const to = typeof normalizeCallTargetJidFn === "function"
      ? normalizeCallTargetJidFn(peerJid, { preferFull: true })
      : (peerJid || "").toString().trim();
    const sid = (sessionId || "").toString().trim();
    if (!to || !sid || !connection || relayStatus !== "connected" || typeof iqFactory !== "function") return false;
    const infoName = xmppNormalizeJingleSessionInfoName(info);
    if (!infoName) return false;
    const iq = xmppBuildJingleSessionInfoIq({
      to,
      sid,
      infoName,
      jingleNamespace: namespaces.jingleNamespace || "urn:xmpp:jingle:1",
      rtpInfoNamespace: namespaces.rtpInfoNamespace || "urn:xmpp:jingle:apps:rtp:info:1"
    }, {
      iqFactory
    });
    if (!iq) return false;
    connection.sendIQ(
      iq,
      () => {
        if (typeof addXmppDebugEventFn === "function") {
          addXmppDebugEventFn("iq", "Sent XMPP jingle session-info", { to, sid, info: infoName });
        }
        if (typeof onSuccess === "function") onSuccess();
      },
      (errorStanza) => {
        if (retryOnRetarget && typeof callIqSessionNotFoundErrorFn === "function" && callIqSessionNotFoundErrorFn(errorStanza)) {
          const retryTo = typeof resolveRetryCallTargetForSessionFn === "function"
            ? resolveRetryCallTargetForSessionFn(sid, to)
            : "";
          if (retryTo && retryTo !== to) {
            if (typeof addXmppDebugEventFn === "function") {
              addXmppDebugEventFn("call", "Retrying XMPP session-info on alternate target", {
                sid,
                from: to,
                to: retryTo,
                info: infoName
              });
            }
            const retried = xmppSendJingleSessionInfo(retryTo, sid, {
              info: infoName,
              onSuccess,
              onError,
              retryOnRetarget: false
            }, deps);
            if (retried) return;
          }
        }
        if (typeof addXmppDebugEventFn === "function") {
          addXmppDebugEventFn("error", "XMPP jingle session-info failed", {
            to,
            sid,
            info: infoName,
            error: typeof trimXmppRawFn === "function" ? trimXmppRawFn(serializePayloadFn?.(errorStanza)) : String(errorStanza || "")
          });
        }
        if (typeof onError === "function") onError(errorStanza);
      },
      9000
    );
    return true;
  }

  function xmppSendJingleContentModify(peerJid, sessionId, contents = [], {
    retryOnRetarget = true
  } = {}, deps = {}) {
    const normalizeCallTargetJidFn = deps.normalizeCallTargetJidFn;
    const connection = deps.connection;
    const relayStatus = deps.relayStatus;
    const iqFactory = deps.iqFactory;
    const namespaces = deps.namespaces || {};
    const addXmppDebugEventFn = deps.addXmppDebugEventFn;
    const trimXmppRawFn = deps.trimXmppRawFn;
    const serializePayloadFn = deps.serializePayloadFn;
    const callIqSessionNotFoundErrorFn = deps.callIqSessionNotFoundErrorFn;
    const resolveRetryCallTargetForSessionFn = deps.resolveRetryCallTargetForSessionFn;
    const to = typeof normalizeCallTargetJidFn === "function"
      ? normalizeCallTargetJidFn(peerJid, { preferFull: true })
      : (peerJid || "").toString().trim();
    const sid = (sessionId || "").toString().trim();
    if (!to || !sid || !connection || relayStatus !== "connected" || typeof iqFactory !== "function") return false;
    const normalizedContents = xmppNormalizeJingleContentModifyContents(contents);
    if (normalizedContents.length === 0) return false;
    const iq = xmppBuildJingleContentModifyIq({
      to,
      sid,
      contents: normalizedContents,
      jingleNamespace: namespaces.jingleNamespace || "urn:xmpp:jingle:1",
      rtpNamespace: namespaces.jingleRtpNamespace || "urn:xmpp:jingle:apps:rtp:1"
    }, {
      iqFactory
    });
    if (!iq) return false;
    connection.sendIQ(
      iq,
      () => {
        if (typeof addXmppDebugEventFn === "function") {
          addXmppDebugEventFn("iq", "Sent XMPP jingle content-modify", { to, sid, count: normalizedContents.length });
        }
      },
      (errorStanza) => {
        if (retryOnRetarget && typeof callIqSessionNotFoundErrorFn === "function" && callIqSessionNotFoundErrorFn(errorStanza)) {
          const retryTo = typeof resolveRetryCallTargetForSessionFn === "function"
            ? resolveRetryCallTargetForSessionFn(sid, to)
            : "";
          if (retryTo && retryTo !== to) {
            if (typeof addXmppDebugEventFn === "function") {
              addXmppDebugEventFn("call", "Retrying XMPP content-modify on alternate target", {
                sid,
                from: to,
                to: retryTo
              });
            }
            const retried = xmppSendJingleContentModify(retryTo, sid, normalizedContents, {
              retryOnRetarget: false
            }, deps);
            if (retried) return;
          }
        }
        if (typeof addXmppDebugEventFn === "function") {
          addXmppDebugEventFn("error", "XMPP jingle content-modify failed", {
            to,
            sid,
            error: typeof trimXmppRawFn === "function" ? trimXmppRawFn(serializePayloadFn?.(errorStanza)) : String(errorStanza || "")
          });
        }
      },
      9000
    );
    return true;
  }

  function xmppSendJingleTransportInfo(peerJid, sessionId, {
    transport = null,
    candidates = [],
    onSuccess = null,
    onError = null,
    retryOnRetarget = true
  } = {}, deps = {}) {
    const normalizeCallTargetJidFn = deps.normalizeCallTargetJidFn;
    const connection = deps.connection;
    const relayStatus = deps.relayStatus;
    const iqFactory = deps.iqFactory;
    const namespaces = deps.namespaces || {};
    const addXmppDebugEventFn = deps.addXmppDebugEventFn;
    const trimXmppRawFn = deps.trimXmppRawFn;
    const serializePayloadFn = deps.serializePayloadFn;
    const callIqSessionNotFoundErrorFn = deps.callIqSessionNotFoundErrorFn;
    const resolveRetryCallTargetForSessionFn = deps.resolveRetryCallTargetForSessionFn;
    const callSessionById = deps.callSessionById;
    const callPeerConnectionBySessionId = deps.callPeerConnectionBySessionId;
    const buildJingleContentsFromSdpFn = deps.buildJingleContentsFromSdpFn;
    const callSessionMediaListFn = deps.callSessionMediaListFn;
    const buildJingleTransportCredsFn = typeof deps.buildJingleTransportCredsFn === "function"
      ? deps.buildJingleTransportCredsFn
      : (() => ({ ufrag: "", pwd: "" }));
    const xep0320 = deps.xep0320 || globalScope.SHITCORD67_XEP_0320_WEBRTC_SDP_BASICS || {};
    const to = typeof normalizeCallTargetJidFn === "function"
      ? normalizeCallTargetJidFn(peerJid, { preferFull: true })
      : (peerJid || "").toString().trim();
    const sid = (sessionId || "").toString().trim();
    if (!to || !sid || !connection || relayStatus !== "connected" || typeof iqFactory !== "function") return false;
    const session = callSessionById?.get(sid) || null;
    const pcEntry = callPeerConnectionBySessionId?.get(sid) || null;
    const fallbackLocalRole = (session?.localJingleRole || (session?.direction === "incoming" ? "responder" : "initiator"))
      .toString()
      .trim()
      .toLowerCase() === "responder"
      ? "responder"
      : "initiator";
    const fallbackTransport = (typeof xep0320.xmppResolveJingleRtpTransportCreds === "function")
      ? xep0320.xmppResolveJingleRtpTransportCreds(transport, {
        buildJingleTransportCredsFn
      })
      : (transport && typeof transport === "object"
        ? {
          ufrag: (transport.ufrag || "").toString().trim(),
          pwd: (transport.pwd || "").toString().trim()
        }
        : buildJingleTransportCredsFn());
    const fallbackNormalizedCandidates = Array.isArray(candidates)
      ? candidates.filter((entry) => entry && typeof entry === "object").map((entry) => ({
        ...entry,
        contentName: ((entry.contentName || entry.sdpMid || "") + "").toString().trim(),
        media: ((entry.media || "") + "").toString().trim().toLowerCase(),
        sdpMLineIndex: Number(entry.sdpMLineIndex)
      }))
      : [];
    const fallbackCatalog = (() => {
      const catalog = [];
      const seen = new Set();
      const push = (name = "", media = "") => {
        const normalizedName = (name || "").toString().trim();
        const normalizedMedia = (media || "").toString().trim().toLowerCase();
        if (!normalizedName || (normalizedMedia !== "audio" && normalizedMedia !== "video")) return;
        if (seen.has(normalizedName)) return;
        seen.add(normalizedName);
        catalog.push({ name: normalizedName, media: normalizedMedia });
      };
      if (Array.isArray(session?.remoteContents)) {
        session.remoteContents.forEach((entry, index) => {
          const media = (entry?.media || "").toString().trim().toLowerCase();
          if (media !== "audio" && media !== "video") return;
          push((entry?.name || `${media}${index}`).toString().trim() || `${media}${index}`, media);
        });
      }
      if (pcEntry?.pc?.localDescription?.sdp && typeof buildJingleContentsFromSdpFn === "function") {
        buildJingleContentsFromSdpFn(pcEntry.pc.localDescription.sdp, { localRole: fallbackLocalRole }).forEach((entry, index) => {
          const media = (entry?.media || "").toString().trim().toLowerCase();
          if (media !== "audio" && media !== "video") return;
          push((entry?.name || `${media}${index}`).toString().trim() || `${media}${index}`, media);
        });
      }
      if (typeof callSessionMediaListFn === "function") {
        callSessionMediaListFn(session).forEach((mediaType, index) => {
          push(mediaType, mediaType);
          push(`${mediaType}${index}`, mediaType);
        });
      }
      if (catalog.length === 0) catalog.push({ name: "audio", media: "audio" });
      return catalog;
    })();
    const fallbackCandidatesByContentName = new Map();
    fallbackNormalizedCandidates.forEach((candidate) => {
      const targets = fallbackCatalog.filter((content) => content.name === candidate.contentName);
      const resolvedTargets = targets.length > 0 ? targets : fallbackCatalog;
      resolvedTargets.forEach((content) => {
        const list = fallbackCandidatesByContentName.get(content.name) || [];
        list.push(candidate);
        fallbackCandidatesByContentName.set(content.name, list);
      });
    });
    const localSdpContents = (pcEntry?.pc?.localDescription?.sdp && typeof buildJingleContentsFromSdpFn === "function")
      ? buildJingleContentsFromSdpFn(pcEntry.pc.localDescription.sdp, {
        localRole: typeof xep0320.xmppNormalizeTransportInfoLocalRole === "function"
          ? xep0320.xmppNormalizeTransportInfoLocalRole(session)
          : fallbackLocalRole
      })
      : [];
    const plan = typeof xep0320.xmppBuildTransportInfoPlan === "function"
      ? xep0320.xmppBuildTransportInfoPlan({
        session,
        transport,
        candidates,
        sessionRemoteContents: Array.isArray(session?.remoteContents) ? session.remoteContents : [],
        localSdpContents,
        sessionMedia: typeof callSessionMediaListFn === "function" ? callSessionMediaListFn(session) : []
      }, {
        buildJingleTransportCredsFn
      })
      : {
        localRole: fallbackLocalRole,
        transportCreds: fallbackTransport,
        normalizedCandidates: fallbackNormalizedCandidates,
        contentTargets: fallbackCatalog,
        candidatesByContentName: fallbackCandidatesByContentName
      };
    const iq = iqFactory({ type: "set", to })
      .c("jingle", {
        xmlns: namespaces.jingleNamespace || "urn:xmpp:jingle:1",
        action: "transport-info",
        sid
      });
    if (typeof xep0320.xmppAppendJingleTransportInfoContents === "function") {
      xep0320.xmppAppendJingleTransportInfoContents(iq, {
        localRole: plan.localRole,
        contentTargets: plan.contentTargets,
        candidatesByContentName: plan.candidatesByContentName,
        transportCreds: plan.transportCreds
      }, {
        iceUdpNamespace: namespaces.iceUdpNamespace || "urn:xmpp:jingle:transports:ice-udp:1"
      });
    } else {
      plan.contentTargets.forEach((content) => {
        const contentCandidates = plan.candidatesByContentName.get(content.name) || [];
        iq
          .c("content", { creator: plan.localRole, name: content.name })
          .c("transport", {
            xmlns: namespaces.iceUdpNamespace || "urn:xmpp:jingle:transports:ice-udp:1",
            ufrag: plan.transportCreds?.ufrag || "",
            pwd: plan.transportCreds?.pwd || ""
          });
        contentCandidates.forEach((candidate, index) => {
          iq.c("candidate", {
            foundation: (candidate.foundation || `${index + 1}`).toString().slice(0, 24),
            component: String(Number(candidate.component) || 1),
            protocol: ((candidate.protocol || "udp").toString().trim().toLowerCase() || "udp").slice(0, 8),
            priority: String(Number(candidate.priority) || (2130706431 - index)),
            ip: (candidate.ip || "0.0.0.0").toString().slice(0, 64),
            port: String(Number(candidate.port) || 9),
            type: ((candidate.type || "host").toString().trim().toLowerCase() || "host").slice(0, 16)
          }).up();
        });
        iq.up().up();
      });
    }
    iq.up();
    connection.sendIQ(
      iq,
      () => {
        if (typeof addXmppDebugEventFn === "function") {
          addXmppDebugEventFn("iq", "Sent XMPP jingle transport-info", {
            to,
            sid,
            candidateCount: plan.normalizedCandidates.length
          });
        }
        if (typeof onSuccess === "function") onSuccess();
      },
      (errorStanza) => {
        if (retryOnRetarget && typeof callIqSessionNotFoundErrorFn === "function" && callIqSessionNotFoundErrorFn(errorStanza)) {
          const retryTo = typeof resolveRetryCallTargetForSessionFn === "function"
            ? resolveRetryCallTargetForSessionFn(sid, to)
            : "";
          if (retryTo && retryTo !== to) {
            if (typeof addXmppDebugEventFn === "function") {
              addXmppDebugEventFn("call", "Retrying XMPP transport-info on alternate target", {
                sid,
                from: to,
                to: retryTo
              });
            }
            const retried = xmppSendJingleTransportInfo(retryTo, sid, {
              transport: plan.transportCreds,
              candidates: plan.normalizedCandidates,
              onSuccess,
              onError,
              retryOnRetarget: false
            }, deps);
            if (retried) return;
          }
        }
        if (typeof addXmppDebugEventFn === "function") {
          addXmppDebugEventFn("error", "XMPP jingle transport-info failed", {
            to,
            sid,
            candidateCount: plan.normalizedCandidates.length,
            error: typeof trimXmppRawFn === "function" ? trimXmppRawFn(serializePayloadFn?.(errorStanza)) : String(errorStanza || "")
          });
        }
        if (typeof onError === "function") onError(errorStanza);
      },
      9000
    );
    return true;
  }

  async function xmppSendJingleSessionInitiate(peerJid, sessionId, {
    media = [],
    screenShare = false,
    onSuccess = null,
    onError = null,
    retryOnRetarget = true
  } = {}, deps = {}) {
    const normalizeCallTargetJidFn = deps.normalizeCallTargetJidFn;
    const connection = deps.connection;
    const relayStatus = deps.relayStatus;
    const iqFactory = deps.iqFactory;
    const namespaces = deps.namespaces || {};
    const bareJidFn = deps.bareJidFn;
    const getPreferencesFn = deps.getPreferencesFn;
    const callSessionById = deps.callSessionById;
    const callDefaultMedia = Array.isArray(deps.callDefaultMedia) ? deps.callDefaultMedia : ["audio"];
    const negotiatedCallMediaForPeerFn = deps.negotiatedCallMediaForPeerFn;
    const shouldUseMinimalRtpForPeerFn = deps.shouldUseMinimalRtpForPeerFn;
    const ensureSessionPeerConnectionFn = deps.ensureSessionPeerConnectionFn;
    const attachLocalMediaToSessionPeerConnectionFn = deps.attachLocalMediaToSessionPeerConnectionFn;
    const parseIceCredsFromSdpFn = deps.parseIceCredsFromSdpFn;
    const buildJingleTransportCredsFn = typeof deps.buildJingleTransportCredsFn === "function"
      ? deps.buildJingleTransportCredsFn
      : (() => ({ ufrag: "", pwd: "" }));
    const parseDtlsFingerprintFromSdpFn = deps.parseDtlsFingerprintFromSdpFn;
    const resolveLocalDtlsForSessionFn = deps.resolveLocalDtlsForSessionFn;
    const buildJingleContentsFromSdpFn = deps.buildJingleContentsFromSdpFn;
    const addXmppDebugEventFn = deps.addXmppDebugEventFn;
    const trimXmppRawFn = deps.trimXmppRawFn;
    const serializePayloadFn = deps.serializePayloadFn;
    const callIqSessionNotFoundErrorFn = deps.callIqSessionNotFoundErrorFn;
    const resolveRetryCallTargetForSessionFn = deps.resolveRetryCallTargetForSessionFn;
    const to = typeof normalizeCallTargetJidFn === "function"
      ? normalizeCallTargetJidFn(peerJid, { preferFull: true })
      : (peerJid || "").toString().trim();
    const sid = (sessionId || "").toString().trim();
    if (!to || !sid || !connection || relayStatus !== "connected" || typeof iqFactory !== "function") return false;
    const ownBare = typeof bareJidFn === "function"
      ? bareJidFn(getPreferencesFn?.().xmppJid || "")
      : "";
    const iq = iqFactory({ type: "set", to })
      .c("jingle", {
        xmlns: namespaces.jingleNamespace || "urn:xmpp:jingle:1",
        action: "session-initiate",
        sid,
        initiator: ownBare || ""
      });
    const sessionEntry = callSessionById?.get(sid) || null;
    const wanted = Array.isArray(media) ? media : callDefaultMedia;
    const normalizedMedia = [...new Set(
      wanted
        .map((item) => (item || "").toString().trim().toLowerCase())
        .filter((item) => item === "audio" || item === "video")
    )];
    const medias = typeof negotiatedCallMediaForPeerFn === "function"
      ? negotiatedCallMediaForPeerFn(to, normalizedMedia.length > 0 ? normalizedMedia : callDefaultMedia)
      : (normalizedMedia.length > 0 ? normalizedMedia : callDefaultMedia);
    const useMinimalRtp = typeof shouldUseMinimalRtpForPeerFn === "function"
      ? shouldUseMinimalRtpForPeerFn(to, medias)
      : false;
    const entry = typeof ensureSessionPeerConnectionFn === "function"
      ? ensureSessionPeerConnectionFn(sid, { peerJid: to, media: medias, createLocalOffer: false })
      : null;
    const attached = typeof attachLocalMediaToSessionPeerConnectionFn === "function"
      ? await attachLocalMediaToSessionPeerConnectionFn(sid, { screenShare: Boolean(screenShare) })
      : false;
    if (entry?.pc && !entry.pc.localDescription) {
      try {
        const offer = await entry.pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
        await entry.pc.setLocalDescription(offer);
      } catch (error) {
        if (typeof addXmppDebugEventFn === "function") {
          addXmppDebugEventFn("error", "Failed preparing local offer for session-initiate", {
            sid,
            error: String(error?.message || error)
          });
        }
      }
    }
    if (typeof addXmppDebugEventFn === "function") {
      addXmppDebugEventFn("runtime", "Prepared local media for session-initiate", {
        sid,
        screenShare: Boolean(screenShare),
        attached
      });
    }
    const localSdp = entry?.pc?.localDescription?.sdp || "";
    const localTransport = (typeof parseIceCredsFromSdpFn === "function" ? parseIceCredsFromSdpFn(localSdp) : null)
      || (sessionEntry?.localTransport && typeof sessionEntry.localTransport === "object"
        ? sessionEntry.localTransport
        : buildJingleTransportCredsFn());
    if (sessionEntry) sessionEntry.localTransport = localTransport;
    const localDtls = (typeof parseDtlsFingerprintFromSdpFn === "function" ? parseDtlsFingerprintFromSdpFn(localSdp) : null)
      || (typeof resolveLocalDtlsForSessionFn === "function"
        ? resolveLocalDtlsForSessionFn(sid, { fallbackSetup: "actpass" })
        : null);
    const contents = (!useMinimalRtp && localSdp && typeof buildJingleContentsFromSdpFn === "function")
      ? buildJingleContentsFromSdpFn(localSdp, { localRole: "initiator" })
      : [];
    if (sessionEntry) {
      sessionEntry.media = medias;
    }
    if (useMinimalRtp && typeof addXmppDebugEventFn === "function") {
      addXmppDebugEventFn("call", "Using minimal RTP description for session-initiate", {
        sid,
        to,
        media: medias
      });
    }
    if (contents.length > 0) {
      const contentNames = [];
      contents.forEach((content, index) => {
        const contentName = (content.name || `${content.media}${index}`).toString().trim() || `${content.media}${index}`;
        contentNames.push(contentName);
        xmppBuildJingleRtpContent(iq, {
          media: content.media,
          name: contentName,
          creator: "initiator",
          senders: content.senders,
          transport: content.transport || localTransport,
          dtls: content.transport
            ? { hash: content.transport.hash, value: content.transport.fingerprint, setup: content.transport.setup }
            : localDtls,
          payloadTypes: content.payloadTypes,
          rtcpFeedback: content.rtcpFeedback,
          extmaps: content.extmaps,
          sources: content.sources,
          sourceGroups: content.sourceGroups
        }, deps);
      });
      xmppBuildJingleBundleGroup(iq, contentNames, deps);
    } else {
      const contentNames = [];
      medias.forEach((mediaType) => {
        const contentName = mediaType.toString();
        contentNames.push(contentName);
        xmppBuildJingleRtpContent(iq, {
          media: mediaType,
          name: contentName,
          creator: "initiator",
          transport: localTransport,
          dtls: localDtls
        }, deps);
      });
      xmppBuildJingleBundleGroup(iq, contentNames, deps);
    }
    connection.sendIQ(
      iq,
      () => {
        if (typeof addXmppDebugEventFn === "function") {
          addXmppDebugEventFn("iq", "Sent XMPP jingle session-initiate", { to, sid, media: medias.join(",") });
        }
        if (typeof onSuccess === "function") onSuccess();
      },
      (errorStanza) => {
        if (retryOnRetarget && typeof callIqSessionNotFoundErrorFn === "function" && callIqSessionNotFoundErrorFn(errorStanza)) {
          const retryTo = typeof resolveRetryCallTargetForSessionFn === "function"
            ? resolveRetryCallTargetForSessionFn(sid, to)
            : "";
          if (retryTo && retryTo !== to) {
            if (typeof addXmppDebugEventFn === "function") {
              addXmppDebugEventFn("call", "Retrying XMPP session-initiate on alternate target", {
                sid,
                from: to,
                to: retryTo
              });
            }
            void xmppSendJingleSessionInitiate(retryTo, sid, {
              media: medias,
              screenShare: Boolean(screenShare),
              onSuccess,
              onError,
              retryOnRetarget: false
            }, deps);
            return;
          }
        }
        if (typeof addXmppDebugEventFn === "function") {
          addXmppDebugEventFn("error", "XMPP jingle session-initiate failed", {
            to,
            sid,
            error: typeof trimXmppRawFn === "function" ? trimXmppRawFn(serializePayloadFn?.(errorStanza)) : String(errorStanza || "")
          });
        }
        if (typeof onError === "function") onError(errorStanza);
      },
      10000
    );
    return true;
  }

  async function xmppSendJingleSessionAccept(peerJid, sessionId, {
    media = [],
    screenShare = false,
    onSuccess = null,
    onError = null,
    retryOnRetarget = true
  } = {}, deps = {}) {
    const normalizeCallTargetJidFn = deps.normalizeCallTargetJidFn;
    const connection = deps.connection;
    const relayStatus = deps.relayStatus;
    const iqFactory = deps.iqFactory;
    const namespaces = deps.namespaces || {};
    const bareJidFn = deps.bareJidFn;
    const getPreferencesFn = deps.getPreferencesFn;
    const callSessionById = deps.callSessionById;
    const callDefaultMedia = Array.isArray(deps.callDefaultMedia) ? deps.callDefaultMedia : ["audio"];
    const negotiatedCallMediaForPeerFn = deps.negotiatedCallMediaForPeerFn;
    const shouldUseMinimalRtpForPeerFn = deps.shouldUseMinimalRtpForPeerFn;
    const ensureSessionPeerConnectionFn = deps.ensureSessionPeerConnectionFn;
    const attachLocalMediaToSessionPeerConnectionFn = deps.attachLocalMediaToSessionPeerConnectionFn;
    const parseIceCredsFromSdpFn = deps.parseIceCredsFromSdpFn;
    const buildJingleTransportCredsFn = typeof deps.buildJingleTransportCredsFn === "function"
      ? deps.buildJingleTransportCredsFn
      : (() => ({ ufrag: "", pwd: "" }));
    const parseDtlsFingerprintFromSdpFn = deps.parseDtlsFingerprintFromSdpFn;
    const resolveLocalDtlsForSessionFn = deps.resolveLocalDtlsForSessionFn;
    const buildJingleContentsFromSdpFn = deps.buildJingleContentsFromSdpFn;
    const alignLocalJingleContentsToRemoteSessionFn = deps.alignLocalJingleContentsToRemoteSessionFn;
    const addXmppDebugEventFn = deps.addXmppDebugEventFn;
    const trimXmppRawFn = deps.trimXmppRawFn;
    const serializePayloadFn = deps.serializePayloadFn;
    const callIqSessionNotFoundErrorFn = deps.callIqSessionNotFoundErrorFn;
    const resolveRetryCallTargetForSessionFn = deps.resolveRetryCallTargetForSessionFn;
    const to = typeof normalizeCallTargetJidFn === "function"
      ? normalizeCallTargetJidFn(peerJid, { preferFull: true })
      : (peerJid || "").toString().trim();
    const sid = (sessionId || "").toString().trim();
    if (!to || !sid || !connection || relayStatus !== "connected" || typeof iqFactory !== "function") return false;
    const ownBare = typeof bareJidFn === "function"
      ? bareJidFn(getPreferencesFn?.().xmppJid || "")
      : "";
    const iq = iqFactory({ type: "set", to })
      .c("jingle", {
        xmlns: namespaces.jingleNamespace || "urn:xmpp:jingle:1",
        action: "session-accept",
        sid,
        responder: ownBare || ""
      });
    const sessionEntry = callSessionById?.get(sid) || null;
    const wanted = Array.isArray(media) ? media : callDefaultMedia;
    const normalizedMedia = [...new Set(
      wanted
        .map((item) => (item || "").toString().trim().toLowerCase())
        .filter((item) => item === "audio" || item === "video")
    )];
    const medias = typeof negotiatedCallMediaForPeerFn === "function"
      ? negotiatedCallMediaForPeerFn(to, normalizedMedia.length > 0 ? normalizedMedia : callDefaultMedia)
      : (normalizedMedia.length > 0 ? normalizedMedia : callDefaultMedia);
    const useMinimalRtp = typeof shouldUseMinimalRtpForPeerFn === "function"
      ? shouldUseMinimalRtpForPeerFn(to, medias)
      : false;
    const entry = typeof ensureSessionPeerConnectionFn === "function"
      ? ensureSessionPeerConnectionFn(sid, { peerJid: to, media: medias, createLocalOffer: false })
      : null;
    const attached = typeof attachLocalMediaToSessionPeerConnectionFn === "function"
      ? await attachLocalMediaToSessionPeerConnectionFn(sid, { screenShare: Boolean(screenShare) })
      : false;
    if (entry?.pc && !entry.pc.localDescription) {
      try {
        const answer = await entry.pc.createAnswer();
        await entry.pc.setLocalDescription(answer);
      } catch (error) {
        if (typeof addXmppDebugEventFn === "function") {
          addXmppDebugEventFn("error", "Failed preparing local answer for session-accept", {
            sid,
            error: String(error?.message || error)
          });
        }
      }
    }
    if (typeof addXmppDebugEventFn === "function") {
      addXmppDebugEventFn("runtime", "Prepared local media for session-accept", {
        sid,
        screenShare: Boolean(screenShare),
        attached
      });
    }
    const localSdp = entry?.pc?.localDescription?.sdp || "";
    const localTransport = (typeof parseIceCredsFromSdpFn === "function" ? parseIceCredsFromSdpFn(localSdp) : null)
      || (sessionEntry?.localTransport && typeof sessionEntry.localTransport === "object"
        ? sessionEntry.localTransport
        : buildJingleTransportCredsFn());
    if (sessionEntry) sessionEntry.localTransport = localTransport;
    const localDtls = (typeof parseDtlsFingerprintFromSdpFn === "function" ? parseDtlsFingerprintFromSdpFn(localSdp) : null)
      || (typeof resolveLocalDtlsForSessionFn === "function"
        ? resolveLocalDtlsForSessionFn(sid, { fallbackSetup: "active" })
        : null);
    const rawContents = (!useMinimalRtp && localSdp && typeof buildJingleContentsFromSdpFn === "function")
      ? buildJingleContentsFromSdpFn(localSdp, { localRole: "responder" })
      : [];
    const contents = rawContents.length > 0 && typeof alignLocalJingleContentsToRemoteSessionFn === "function"
      ? alignLocalJingleContentsToRemoteSessionFn(rawContents, sessionEntry?.remoteContents || [])
      : rawContents;
    if (sessionEntry) {
      sessionEntry.media = medias;
    }
    if (useMinimalRtp && typeof addXmppDebugEventFn === "function") {
      addXmppDebugEventFn("call", "Using minimal RTP description for session-accept", {
        sid,
        to,
        media: medias
      });
    }
    if (contents.length > 0) {
      const contentNames = [];
      contents.forEach((content, index) => {
        const contentName = (content.name || `${content.media}${index}`).toString().trim() || `${content.media}${index}`;
        contentNames.push(contentName);
        xmppBuildJingleRtpContent(iq, {
          media: content.media,
          name: contentName,
          creator: "responder",
          senders: content.senders,
          transport: content.transport || localTransport,
          dtls: content.transport
            ? { hash: content.transport.hash, value: content.transport.fingerprint, setup: content.transport.setup }
            : localDtls,
          payloadTypes: content.payloadTypes,
          rtcpFeedback: content.rtcpFeedback,
          extmaps: content.extmaps,
          sources: content.sources,
          sourceGroups: content.sourceGroups
        }, deps);
      });
      xmppBuildJingleBundleGroup(iq, contentNames, deps);
    } else {
      const contentNames = [];
      medias.forEach((mediaType) => {
        const contentName = mediaType.toString();
        contentNames.push(contentName);
        xmppBuildJingleRtpContent(iq, {
          media: mediaType,
          name: contentName,
          creator: "responder",
          transport: localTransport,
          dtls: localDtls
        }, deps);
      });
      xmppBuildJingleBundleGroup(iq, contentNames, deps);
    }
    connection.sendIQ(
      iq,
      () => {
        if (typeof addXmppDebugEventFn === "function") {
          addXmppDebugEventFn("iq", "Sent XMPP jingle session-accept", { to, sid, media: medias.join(",") });
        }
        if (typeof onSuccess === "function") onSuccess();
      },
      (errorStanza) => {
        if (retryOnRetarget && typeof callIqSessionNotFoundErrorFn === "function" && callIqSessionNotFoundErrorFn(errorStanza)) {
          const retryTo = typeof resolveRetryCallTargetForSessionFn === "function"
            ? resolveRetryCallTargetForSessionFn(sid, to)
            : "";
          if (retryTo && retryTo !== to) {
            if (typeof addXmppDebugEventFn === "function") {
              addXmppDebugEventFn("call", "Retrying XMPP session-accept on alternate target", {
                sid,
                from: to,
                to: retryTo
              });
            }
            void xmppSendJingleSessionAccept(retryTo, sid, {
              media: medias,
              screenShare: Boolean(screenShare),
              onSuccess,
              onError,
              retryOnRetarget: false
            }, deps);
            return;
          }
        }
        if (typeof addXmppDebugEventFn === "function") {
          addXmppDebugEventFn("error", "XMPP jingle session-accept failed", {
            to,
            sid,
            error: typeof trimXmppRawFn === "function" ? trimXmppRawFn(serializePayloadFn?.(errorStanza)) : String(errorStanza || "")
          });
        }
        if (typeof onError === "function") onError(errorStanza);
      },
      10000
    );
    return true;
  }

  function xmppSendJingleSessionTerminate(peerJid, sessionId, {
    reason = "success",
    text = "",
    onSuccess = null,
    onError = null,
    retryOnRetarget = true
  } = {}, deps = {}) {
    const normalizeCallTargetJidFn = deps.normalizeCallTargetJidFn;
    const connection = deps.connection;
    const relayStatus = deps.relayStatus;
    const iqFactory = deps.iqFactory;
    const namespaces = deps.namespaces || {};
    const addXmppDebugEventFn = deps.addXmppDebugEventFn;
    const trimXmppRawFn = deps.trimXmppRawFn;
    const serializePayloadFn = deps.serializePayloadFn;
    const callIqSessionNotFoundErrorFn = deps.callIqSessionNotFoundErrorFn;
    const resolveRetryCallTargetForSessionFn = deps.resolveRetryCallTargetForSessionFn;
    const to = typeof normalizeCallTargetJidFn === "function"
      ? normalizeCallTargetJidFn(peerJid, { preferFull: true })
      : (peerJid || "").toString().trim();
    const sid = (sessionId || "").toString().trim();
    if (!to || !sid || !connection || relayStatus !== "connected" || typeof iqFactory !== "function") return false;
    const normalizedReason = xmppNormalizeJingleTerminateReason(reason);
    const message = xmppNormalizeJingleReasonText(text, { maxLength: 180 });
    const iq = xmppBuildJingleSessionTerminateIq({
      to,
      sid,
      reason: normalizedReason,
      text: message,
      jingleNamespace: namespaces.jingleNamespace || "urn:xmpp:jingle:1"
    }, {
      iqFactory
    });
    if (!iq) return false;
    connection.sendIQ(
      iq,
      () => {
        if (typeof addXmppDebugEventFn === "function") {
          addXmppDebugEventFn("iq", "Sent XMPP jingle session-terminate", { to, sid, reason: normalizedReason });
        }
        if (typeof onSuccess === "function") onSuccess();
      },
      (errorStanza) => {
        if (retryOnRetarget && typeof callIqSessionNotFoundErrorFn === "function" && callIqSessionNotFoundErrorFn(errorStanza)) {
          const retryTo = typeof resolveRetryCallTargetForSessionFn === "function"
            ? resolveRetryCallTargetForSessionFn(sid, to)
            : "";
          if (retryTo && retryTo !== to) {
            if (typeof addXmppDebugEventFn === "function") {
              addXmppDebugEventFn("call", "Retrying XMPP session-terminate on alternate target", {
                sid,
                from: to,
                to: retryTo
              });
            }
            const retried = xmppSendJingleSessionTerminate(retryTo, sid, {
              reason: normalizedReason,
              text: message,
              onSuccess,
              onError,
              retryOnRetarget: false
            }, deps);
            if (retried) return;
          }
        }
        if (typeof addXmppDebugEventFn === "function") {
          addXmppDebugEventFn("error", "XMPP jingle session-terminate failed", {
            to,
            sid,
            reason: normalizedReason,
            error: typeof trimXmppRawFn === "function" ? trimXmppRawFn(serializePayloadFn?.(errorStanza)) : String(errorStanza || "")
          });
        }
        if (typeof onError === "function") onError(errorStanza);
      },
      9000
    );
    return true;
  }

  globalScope.SHITCORD67_XEP_0166_0167_JINGLE_SEND = Object.freeze({
    xmppNormalizeJingleSessionInfoName,
    xmppBuildJingleSessionInfoIq,
    xmppNormalizeJingleContentModifyContents,
    xmppBuildJingleContentModifyIq,
    xmppNormalizeJingleTerminateReason,
    xmppNormalizeJingleReasonText,
    xmppBuildJingleSessionTerminateIq,
    xmppBuildJingleRtpContent,
    xmppBuildJingleBundleGroup,
    xmppSendJingleSessionInfo,
    xmppSendJingleContentModify,
    xmppSendJingleTransportInfo,
    xmppSendJingleSessionInitiate,
    xmppSendJingleSessionAccept,
    xmppSendJingleSessionTerminate
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0166_0167-jingle-send", globalScope.SHITCORD67_XEP_0166_0167_JINGLE_SEND);
  }
})(typeof window !== "undefined" ? window : globalThis);
