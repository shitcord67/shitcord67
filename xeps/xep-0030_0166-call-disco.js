(function initXep0030_0166CallDisco(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0030_0166_CALL_DISCO) return;

  function xmppSendIqPromise(connection, iqBuilder, timeoutMs = 7000) {
    return new Promise((resolve, reject) => {
      if (!connection || typeof connection.sendIQ !== "function") {
        reject(new Error("XMPP IQ unavailable"));
        return;
      }
      if (!iqBuilder) {
        reject(new Error("XMPP IQ builder unavailable"));
        return;
      }
      connection.sendIQ(
        iqBuilder,
        (stanza) => resolve(stanza),
        (errorStanza) => {
          if (errorStanza instanceof Error) {
            reject(errorStanza);
            return;
          }
          const error = new Error("XMPP IQ failed");
          error.stanza = errorStanza || null;
          reject(error);
        },
        Math.max(2000, Number(timeoutMs) || 7000)
      );
    });
  }

  function xmppParseMaxUploadBytesFromDiscoInfo(stanza, deps = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return 0;
    const xmppNodeTextFn = deps.xmppNodeTextFn || ((node) => (node?.textContent || "").toString());
    const fields = [...stanza.getElementsByTagName("field")]
      .filter((node) => ((node.getAttribute("var") || "").toString().trim().toLowerCase() === "max-file-size"));
    const parseMax = (raw = "") => {
      const clean = (raw || "").toString().trim().toLowerCase();
      if (!clean) return 0;
      const direct = Number(clean);
      if (Number.isFinite(direct) && direct > 0) return Math.floor(direct);
      const match = clean.match(/(\d+(?:\.\d+)?)\s*(bytes?|b|kb|kib|mb|mib|gb|gib)?/i);
      if (!match) return 0;
      const value = Number(match[1]);
      if (!Number.isFinite(value) || value <= 0) return 0;
      const unit = (match[2] || "b").toLowerCase();
      const factor = unit === "gb" || unit === "gib"
        ? 1024 * 1024 * 1024
        : (unit === "mb" || unit === "mib"
          ? 1024 * 1024
          : (unit === "kb" || unit === "kib" ? 1024 : 1));
      return Math.max(0, Math.floor(value * factor));
    };
    for (const field of fields) {
      const valueNode = field.getElementsByTagName("value")[0] || null;
      const parsed = parseMax(xmppNodeTextFn(valueNode));
      if (parsed > 0) return parsed;
    }
    return 0;
  }

  async function xmppFetchDiscoInfo(jid, connection = null, deps = {}) {
    const sendIqPromiseFn = typeof deps.xmppSendIqPromiseFn === "function"
      ? deps.xmppSendIqPromiseFn
      : xmppSendIqPromise;
    if (!jid || !connection || typeof sendIqPromiseFn !== "function" || typeof deps.$iq !== "function") {
      throw new Error("XMPP discovery unavailable");
    }
    const stanza = await sendIqPromiseFn(
      connection,
      deps.$iq({ type: "get", to: jid }).c("query", { xmlns: "http://jabber.org/protocol/disco#info" }),
      7000
    );
    const features = new Set(
      [...stanza.getElementsByTagName("feature")]
        .map((node) => (node.getAttribute("var") || "").toString().trim())
        .filter(Boolean)
    );
    const maxFileSize = xmppParseMaxUploadBytesFromDiscoInfo(stanza, {
      xmppNodeTextFn: deps.xmppNodeTextFn
    });
    return { features, maxFileSize };
  }

  async function xmppFetchDiscoInfoCached(jid, { force = false, connection = null } = {}, deps = {}) {
    const bareJidFn = deps.bareJidFn || ((value) => (value || "").toString().trim().toLowerCase());
    const bare = bareJidFn(jid);
    if (!bare) throw new Error("Invalid discovery target");
    const now = Date.now();
    const cacheByJid = deps.cacheByJid;
    const inFlightByJid = deps.inFlightByJid;
    const ttlMs = Math.max(10_000, Number(deps.ttlMs) || 0);
    const cached = cacheByJid?.get?.(bare);
    if (!force && cached && cached.expiresAt > now) {
      return {
        features: new Set(cached.features || []),
        maxFileSize: Number(cached.maxFileSize || 0)
      };
    }
    if (!force && inFlightByJid?.has?.(bare)) {
      return inFlightByJid.get(bare);
    }
    const task = xmppFetchDiscoInfo(bare, connection, deps)
      .then((result) => {
        cacheByJid?.set?.(bare, {
          features: [...(result?.features || [])],
          maxFileSize: Number(result?.maxFileSize || 0),
          expiresAt: Date.now() + ttlMs
        });
        return result;
      })
      .finally(() => {
        inFlightByJid?.delete?.(bare);
      });
    inFlightByJid?.set?.(bare, task);
    return task;
  }

  function xmppCallCapabilityTargetsForConversation(conversation = null, deps = {}) {
    if (!conversation) return [];
    const targets = new Set();
    const getCurrentAccountFn = deps.getCurrentAccountFn;
    const xmppPeerJidForDmThreadFn = deps.xmppPeerJidForDmThreadFn;
    const bareJidFn = deps.bareJidFn;
    const domainFromJidFn = deps.domainFromJidFn;
    const getPreferencesFn = deps.getPreferencesFn;
    const current = typeof getCurrentAccountFn === "function" ? getCurrentAccountFn() : null;
    if (conversation.type === "dm") {
      const peerJid = typeof xmppPeerJidForDmThreadFn === "function"
        ? xmppPeerJidForDmThreadFn(conversation.thread, current)
        : "";
      const barePeer = typeof bareJidFn === "function" ? bareJidFn(peerJid) : "";
      if (barePeer) targets.add(barePeer);
      const peerDomain = typeof domainFromJidFn === "function" ? domainFromJidFn(barePeer) : "";
      if (peerDomain) targets.add(peerDomain);
      return [...targets];
    }
    const roomJid = typeof bareJidFn === "function" ? bareJidFn(conversation.channel?.xmppRoomJid || "") : "";
    if (roomJid) targets.add(roomJid);
    const mucDomain = roomJid.includes("@") ? roomJid.split("@")[1] : "";
    if (mucDomain) targets.add(mucDomain);
    const prefs = typeof getPreferencesFn === "function" ? getPreferencesFn() : {};
    const accountDomain = typeof domainFromJidFn === "function" ? domainFromJidFn(prefs.xmppJid || "") : "";
    if (accountDomain) targets.add(accountDomain);
    return [...targets];
  }

  function xmppClientDiscoFeatures(deps = {}) {
    const features = [
      deps.XMPP_CAPS_NAMESPACE,
      deps.XMPP_JINGLE_NAMESPACE,
      deps.XMPP_JINGLE_RTP_NAMESPACE,
      deps.XMPP_JINGLE_RTP_INFO_NAMESPACE,
      deps.XMPP_JINGLE_ICE_UDP_NAMESPACE,
      ...(Array.isArray(deps.XMPP_JINGLE_MESSAGE_INIT_COMPAT_NAMESPACES) ? deps.XMPP_JINGLE_MESSAGE_INIT_COMPAT_NAMESPACES : []),
      deps.XMPP_CALL_INVITES_NAMESPACE,
      deps.XMPP_JINGLE_AUDIO_NAMESPACE,
      deps.XMPP_JINGLE_VIDEO_NAMESPACE,
      deps.XMPP_JINGLE_RTP_RTCP_FB_NAMESPACE,
      deps.XMPP_JINGLE_RTP_HDR_EXT_NAMESPACE,
      deps.XMPP_JINGLE_RTP_SSMA_NAMESPACE,
      deps.XMPP_JINGLE_RTP_RTCP_MUX_NAMESPACE,
      deps.XMPP_JINGLE_GROUPING_NAMESPACE,
      "http://jabber.org/protocol/nick",
      "urn:xmpp:jingle:apps:dtls:0",
      "urn:xmpp:reference:0",
      "jabber:x:oob",
      deps.XMPP_BOB_NAMESPACE,
      deps.XMPP_SIMS_NAMESPACE,
      deps.XMPP_FILE_METADATA_NAMESPACE,
      deps.XMPP_REACTIONS_NAMESPACE,
      deps.XMPP_MESSAGE_RETRACT_NAMESPACE,
      deps.XMPP_FASTEN_NAMESPACE,
      deps.XMPP_HINTS_NAMESPACE,
      deps.XMPP_RECEIPTS_NAMESPACE,
      deps.XMPP_CHATSTATES_NAMESPACE,
      deps.XMPP_CHAT_MARKERS_NAMESPACE,
      deps.XMPP_DIRECT_MUC_INVITE_NAMESPACE,
      deps.XMPP_OCCUPANT_ID_NAMESPACE,
      deps.XMPP_BOOKMARKS_NOTIFY_FEATURE,
      deps.XMPP_IDLE_NAMESPACE,
      deps.XMPP_EME_NAMESPACE,
      "urn:xmpp:ping"
    ].filter(Boolean);
    if (typeof deps.xmppOmemoRuntimeAvailableFn === "function" && deps.xmppOmemoRuntimeAvailableFn()) {
      if (deps.XMPP_OMEMO_NAMESPACE) features.push(deps.XMPP_OMEMO_NAMESPACE);
      if (deps.XMPP_OMEMO_NAMESPACE_V2) features.push(deps.XMPP_OMEMO_NAMESPACE_V2);
      if (deps.XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE) features.push(deps.XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE);
      if (deps.XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE_V2) features.push(deps.XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE_V2);
    }
    return [...new Set(features)];
  }

  function xmppRequiredCallFeatureBuckets(deps = {}) {
    return {
      core: [deps.XMPP_JINGLE_NAMESPACE].filter(Boolean),
      media: [deps.XMPP_JINGLE_RTP_NAMESPACE, deps.XMPP_JINGLE_AUDIO_NAMESPACE, deps.XMPP_JINGLE_VIDEO_NAMESPACE].filter(Boolean),
      transport: [deps.XMPP_JINGLE_ICE_UDP_NAMESPACE].filter(Boolean),
      invite: [...(Array.isArray(deps.XMPP_JINGLE_MESSAGE_INIT_COMPAT_NAMESPACES) ? deps.XMPP_JINGLE_MESSAGE_INIT_COMPAT_NAMESPACES : []), deps.XMPP_CALL_INVITES_NAMESPACE].filter(Boolean)
    };
  }

  function normalizeXmppFeatureSet(features = new Set()) {
    const values = [];
    if (features instanceof Set) values.push(...features);
    else if (Array.isArray(features)) values.push(...features);
    else if (typeof features === "string") values.push(features);
    else if (features && typeof features === "object") {
      Object.keys(features).forEach((key) => {
        if (features[key]) values.push(key);
      });
    }
    return new Set(values
      .map((value) => (value || "").toString().trim())
      .filter(Boolean));
  }

  function xmppEvaluateCallFeatures(features = new Set(), deps = {}) {
    const featureSet = normalizeXmppFeatureSet(features);
    const requiredBuckets = typeof deps.xmppRequiredCallFeatureBucketsFn === "function"
      ? deps.xmppRequiredCallFeatureBucketsFn()
      : xmppRequiredCallFeatureBuckets(deps);
    const hasCore = requiredBuckets.core.every((feature) => featureSet.has(feature));
    const hasMedia = requiredBuckets.media.some((feature) => featureSet.has(feature));
    const hasTransport = requiredBuckets.transport.some((feature) => featureSet.has(feature));
    const hasInvite = requiredBuckets.invite.some((feature) => featureSet.has(feature));
    return {
      hasCore,
      hasMedia,
      hasTransport,
      hasInvite,
      ready: hasCore && hasMedia && hasTransport && hasInvite
    };
  }

  function xmppCachedCallFeaturesForPeer(peerJid = "", deps = {}) {
    const bareJidFn = deps.bareJidFn;
    const cacheByJid = deps.cacheByJid;
    const barePeer = typeof bareJidFn === "function" ? bareJidFn(peerJid) : "";
    if (!barePeer) return new Set();
    const cached = cacheByJid?.get?.(barePeer);
    if (!cached || !Array.isArray(cached.features)) return new Set();
    return new Set(cached.features);
  }

  function xmppNegotiatedCallMediaForPeer(peerJid = "", requestedMedia = ["audio", "video"], deps = {}) {
    const defaultMedia = Array.isArray(deps.XMPP_CALL_DEFAULT_MEDIA)
      ? deps.XMPP_CALL_DEFAULT_MEDIA
      : ["audio", "video"];
    const wanted = [...new Set(
      (Array.isArray(requestedMedia) ? requestedMedia : defaultMedia)
        .map((item) => (item || "").toString().trim().toLowerCase())
        .filter((item) => item === "audio" || item === "video")
    )];
    const normalizedWanted = wanted.length > 0 ? wanted : defaultMedia;
    const features = typeof deps.xmppCachedCallFeaturesForPeerFn === "function"
      ? deps.xmppCachedCallFeaturesForPeerFn(peerJid)
      : xmppCachedCallFeaturesForPeer(peerJid, deps);
    if (features.size <= 0) {
      if (normalizedWanted.includes("audio")) return ["audio"];
      return normalizedWanted.slice(0, 1);
    }
    const supportsAudio = features.has(deps.XMPP_JINGLE_AUDIO_NAMESPACE);
    const supportsVideo = features.has(deps.XMPP_JINGLE_VIDEO_NAMESPACE);
    if (!supportsAudio && !supportsVideo) return normalizedWanted;
    const next = normalizedWanted.filter((item) => (
      item === "audio" ? supportsAudio : supportsVideo
    ));
    return next.length > 0 ? next : (supportsAudio ? ["audio"] : ["video"]);
  }

  function xmppShouldUseMinimalRtpForPeer(peerJid = "", media = ["audio", "video"], deps = {}) {
    const normalizedMedia = [...new Set(
      (Array.isArray(media) ? media : ["audio", "video"])
        .map((item) => (item || "").toString().trim().toLowerCase())
        .filter((item) => item === "audio" || item === "video")
    )];
    const features = typeof deps.xmppCachedCallFeaturesForPeerFn === "function"
      ? deps.xmppCachedCallFeaturesForPeerFn(peerJid)
      : xmppCachedCallFeaturesForPeer(peerJid, deps);
    if (features.size <= 0) return true;
    const hasRtpFb = features.has(deps.XMPP_JINGLE_RTP_RTCP_FB_NAMESPACE);
    const hasHdrExt = features.has(deps.XMPP_JINGLE_RTP_HDR_EXT_NAMESPACE);
    const hasSsma = features.has(deps.XMPP_JINGLE_RTP_SSMA_NAMESPACE);
    const supportsAudio = features.has(deps.XMPP_JINGLE_AUDIO_NAMESPACE);
    const supportsVideo = features.has(deps.XMPP_JINGLE_VIDEO_NAMESPACE);
    const mediaMismatch = normalizedMedia.some((item) => (
      (item === "audio" && !supportsAudio) || (item === "video" && !supportsVideo)
    ));
    return mediaMismatch || !hasRtpFb || !hasHdrExt || !hasSsma;
  }

  function xmppIqResultAttrsForIncomingStanza(stanza) {
    if (!stanza || typeof stanza.getAttribute !== "function") return null;
    const id = (stanza.getAttribute("id") || "").toString().trim();
    if (!id) return null;
    const from = (stanza.getAttribute("from") || "").toString().trim();
    const attrs = { type: "result", id };
    if (from) attrs.to = from;
    return attrs;
  }

  function xmppSendIqResultForIncomingSet(stanza, deps = {}) {
    if (!deps.xmppConnection || typeof deps.$iq !== "function") return false;
    const attrs = xmppIqResultAttrsForIncomingStanza(stanza);
    if (!attrs) return false;
    deps.xmppConnection.send(deps.$iq(attrs));
    return true;
  }

  function xmppDiscoInfoQueryNode(stanza, deps = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return null;
    const xmlnsMatcher = typeof deps.xmppNodeHasXmlnsFn === "function"
      ? deps.xmppNodeHasXmlnsFn
      : ((node, xmlns) => ((node?.getAttribute?.("xmlns") || "").toString().toLowerCase() === (xmlns || "").toString().toLowerCase()));
    return [...stanza.getElementsByTagName("query")]
      .find((node) => xmlnsMatcher(node, "http://jabber.org/protocol/disco#info")) || null;
  }

  function xmppIncomingDiscoInfoGetPayload(stanza, deps = {}) {
    if (!stanza || typeof stanza.getAttribute !== "function") return null;
    const type = (stanza.getAttribute("type") || "").toString().toLowerCase();
    if (type !== "get") return null;
    const attrs = xmppIqResultAttrsForIncomingStanza(stanza);
    if (!attrs?.id) return null;
    const query = xmppDiscoInfoQueryNode(stanza, deps);
    if (!query) return null;
    return {
      id: attrs.id,
      to: attrs.to || "",
      node: (query.getAttribute("node") || "").toString().trim()
    };
  }

  function xmppBuildDiscoInfoResultStanza({
    id = "",
    to = "",
    node = "",
    identityName = "shitcord67"
  } = {}, deps = {}) {
    const safeId = (id || "").toString().trim();
    if (!safeId || typeof deps.$iq !== "function") return null;
    const attrs = { type: "result", id: safeId };
    if (to) attrs.to = to;
    const queryAttrs = { xmlns: "http://jabber.org/protocol/disco#info" };
    if (node) queryAttrs.node = node;
    const result = deps.$iq(attrs).c("query", queryAttrs);
    result.c("identity", { category: "client", type: "web", name: identityName }).up();
    const features = Array.isArray(deps.features) ? deps.features : [];
    features.forEach((feature) => {
      const value = (feature || "").toString().trim();
      if (!value) return;
      result.c("feature", { var: value }).up();
    });
    return result;
  }

  function xmppSendDiscoInfoResult(payload = {}, deps = {}) {
    if (!deps.xmppConnection) return false;
    const stanza = xmppBuildDiscoInfoResultStanza(payload, deps);
    if (!stanza) return false;
    deps.xmppConnection.send(stanza);
    return true;
  }

  function xmppBuildDiscoInfoErrorStanza({
    id = "",
    to = "",
    node = ""
  } = {}, deps = {}) {
    const safeId = (id || "").toString().trim();
    if (!safeId || typeof deps.$iq !== "function") return null;
    const attrs = { type: "error", id: safeId };
    if (to) attrs.to = to;
    const queryAttrs = { xmlns: "http://jabber.org/protocol/disco#info" };
    if (node) queryAttrs.node = node;
    return deps.$iq(attrs)
      .c("query", queryAttrs).up()
      .c("error", { type: "cancel" })
      .c("item-not-found", { xmlns: "urn:ietf:params:xml:ns:xmpp-stanzas" });
  }

  function xmppSendDiscoInfoError(payload = {}, deps = {}) {
    if (!deps.xmppConnection) return false;
    const stanza = xmppBuildDiscoInfoErrorStanza(payload, deps);
    if (!stanza) return false;
    deps.xmppConnection.send(stanza);
    return true;
  }

  function xmppExpectedCapsDiscoNode(capsHash = "", capsNode = "urn:shitcord67:caps") {
    const hash = (capsHash || "").toString().trim();
    const node = (capsNode || "").toString().trim();
    if (!hash || !node) return "";
    return `${node}#${hash}`;
  }

  function xmppResolveDiscoInfoReplyForIncomingGet(stanza, {
    capsHash = "",
    capsNode = "urn:shitcord67:caps"
  } = {}, deps = {}) {
    const payload = xmppIncomingDiscoInfoGetPayload(stanza, deps);
    if (!payload) return null;
    const expectedNode = xmppExpectedCapsDiscoNode(capsHash, capsNode);
    if (!payload.node) {
      return {
        id: payload.id,
        to: payload.to,
        node: "",
        requestedNode: "",
        expectedNode,
        warn: false
      };
    }
    const warn = Boolean(expectedNode && payload.node !== expectedNode);
    return {
      id: payload.id,
      to: payload.to,
      node: payload.node,
      requestedNode: payload.node,
      expectedNode,
      warn
    };
  }

  function xmppSendDiscoInfoResultForIncomingGet(stanza, {
    capsHash = "",
    capsNode = "urn:shitcord67:caps"
  } = {}, deps = {}) {
    const resolved = xmppResolveDiscoInfoReplyForIncomingGet(stanza, { capsHash, capsNode }, deps);
    if (!resolved) return false;
    if (!capsHash && typeof deps.ensureXmppCapsHashFn === "function") {
      void deps.ensureXmppCapsHashFn();
    }
    if (resolved.warn && typeof deps.addXmppDebugEventFn === "function") {
      deps.addXmppDebugEventFn("presence", "Answered disco#info request for non-current caps node", {
        requestedNode: resolved.requestedNode || "",
        expectedNode: resolved.expectedNode || ""
      });
    }
    if (typeof deps.xmppSendDiscoInfoResultFn === "function") {
      return deps.xmppSendDiscoInfoResultFn({
        id: resolved.id,
        to: resolved.to,
        node: resolved.node || ""
      });
    }
    return xmppSendDiscoInfoResult({
      id: resolved.id,
      to: resolved.to,
      node: resolved.node || ""
    }, deps);
  }

  globalScope.SHITCORD67_XEP_0030_0166_CALL_DISCO = Object.freeze({
    xmppSendIqPromise,
    xmppParseMaxUploadBytesFromDiscoInfo,
    xmppFetchDiscoInfo,
    xmppFetchDiscoInfoCached,
    xmppCallCapabilityTargetsForConversation,
    xmppClientDiscoFeatures,
    xmppRequiredCallFeatureBuckets,
    normalizeXmppFeatureSet,
    xmppEvaluateCallFeatures,
    xmppCachedCallFeaturesForPeer,
    xmppNegotiatedCallMediaForPeer,
    xmppShouldUseMinimalRtpForPeer,
    xmppIqResultAttrsForIncomingStanza,
    xmppSendIqResultForIncomingSet,
    xmppDiscoInfoQueryNode,
    xmppIncomingDiscoInfoGetPayload,
    xmppBuildDiscoInfoResultStanza,
    xmppSendDiscoInfoResult,
    xmppBuildDiscoInfoErrorStanza,
    xmppSendDiscoInfoError,
    xmppExpectedCapsDiscoNode,
    xmppResolveDiscoInfoReplyForIncomingGet,
    xmppSendDiscoInfoResultForIncomingGet
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0030_0166-call-disco", globalScope.SHITCORD67_XEP_0030_0166_CALL_DISCO);
  }
})(typeof window !== "undefined" ? window : globalThis);
