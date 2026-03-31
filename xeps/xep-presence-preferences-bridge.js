/*
 * Presence/preferences/XMPP bridge extracted from app.js.
 * Functions here intentionally bind to app globals at call time.
 */

function xmppRememberPeerFullJid(jid = "", { seenAt = Date.now() } = {}) {
  xmppRememberPeerFullJidViaModule(jid, { seenAt });
}

function xmppForgetPeerFullJid(jid = "") {
  xmppForgetPeerFullJidViaModule(jid);
}

function xmppMostRecentPeerFullJid(jid = "") {
  return xmppMostRecentPeerFullJidViaModule(jid);
}

function xmppNormalizeCallTargetJid(peerJid, { preferFull = false } = {}) {
  return xmppNormalizeCallTargetJidViaModule(peerJid, { preferFull });
}

function xmppCallIqSessionNotFoundError(errorStanza = null) {
  return xmppCallIqSessionNotFoundErrorViaModule(errorStanza);
}

function xmppResolveRetryCallTargetForSession(sessionId = "", attemptedTo = "") {
  return xmppResolveRetryCallTargetForSessionViaModule(sessionId, attemptedTo);
}

function xmppResolveSessionPeerJid(session, fallback = "", { preferFull = true } = {}) {
  return xmppResolveSessionPeerJidViaModule(session, fallback, { preferFull });
}

function xmppShowValueForPresence(presence) {
  return xmppShowValueForPresenceViaModule(presence);
}

function sendCurrentXmppPresence({ skipCapsRetry = false } = {}) {
  if (!xmppConnection || relayStatus !== "connected" || !globalThis.$pres) return false;
  const account = getCurrentAccount();
  const mode = normalizePresence(account?.presence || "online");
  const show = xmppShowValueForPresence(mode);
  if (!xmppCapsHash && !skipCapsRetry) {
    ensureXmppCapsHash().then((hash) => {
      if (!hash) return;
      sendCurrentXmppPresence({ skipCapsRetry: true });
    });
  }
  const stanza = (typeof XEP_0115_CAPS_PRESENCE_GLOBAL.xmppBuildPresenceStanza === "function")
    ? XEP_0115_CAPS_PRESENCE_GLOBAL.xmppBuildPresenceStanza({
      mode,
      show,
      account,
      capsHash: xmppCapsHash,
      $pres: globalThis.$pres,
      idleNamespace: XMPP_IDLE_NAMESPACE,
      capsNamespace: XMPP_CAPS_NAMESPACE,
      capsNode: XMPP_CAPS_NODE
    }, {
      toTimestampMsFn: toTimestampMs
    })
    : null;
  if (!stanza) {
    if (mode === "invisible") {
      xmppConnection.send(globalThis.$pres({ type: "unavailable" }));
      return true;
    }
    const fallback = globalThis.$pres();
    if (show) fallback.c("show").t(show);
    fallback.c("priority").t("0").up();
    const idleSince = (account?.xmppIdleSince || "").toString().trim();
    if (mode === "idle" && idleSince) {
      fallback.c("idle", { xmlns: XMPP_IDLE_NAMESPACE, since: idleSince }).up();
    }
    if (xmppCapsHash) {
      fallback.c("c", {
        xmlns: XMPP_CAPS_NAMESPACE,
        hash: "sha-1",
        node: XMPP_CAPS_NODE,
        ver: xmppCapsHash
      }).up();
    }
    xmppConnection.send(fallback);
    return true;
  }
  xmppConnection.send(stanza);
  return true;
}

function setCurrentAccountPresence(mode, { persist = true, rerender = true, announceXmpp = true } = {}) {
  const account = getCurrentAccount();
  if (!account) return false;
  const next = normalizePresence(mode);
  const previous = normalizePresence(account.presence || "online");
  if (next === previous) return false;
  account.presence = next;
  if (next === "idle") {
    account.xmppIdleSince = new Date().toISOString();
  } else if (previous === "idle") {
    account.xmppIdleSince = "";
  }
  if (persist) saveState();
  if (announceXmpp) sendCurrentXmppPresence();
  if (ui.selfMenuDialog?.open) renderSelfPopout();
  if (rerender) render();
  return true;
}

function normalizeMemberPresenceFilter(value) {
  return normalizeMemberPresenceFilterViaModule(value);
}

function normalizeToggle(value) {
  return normalizeToggleViaModule(value);
}

function normalizeMobilePane(value) {
  return normalizeMobilePaneViaModule(value);
}

function normalizeSwfAudioPolicy(value) {
  return normalizeSwfAudioPolicyViaModule(value);
}

function normalizeSwfAudioScope(value) {
  return normalizeSwfAudioScopeViaModule(value);
}

function normalizeSwfAutoplay(value) {
  return normalizeSwfAutoplayViaModule(value);
}

function normalizeHapticMode(value) {
  return normalizeHapticModeViaModule(value);
}

function normalizeSwfQuickAudioMode(value) {
  return normalizeSwfQuickAudioModeViaModule(value);
}

function normalizeTheme(value) {
  return normalizeThemeViaModule(value);
}

function normalizeLanguage(value) {
  return normalizeLanguageViaModule(value);
}

function normalizeDmHomeTab(value) {
  return normalizeDmHomeTabViaModule(value);
}

function normalizeDmHomeRequestsFilter(value) {
  return normalizeDmHomeRequestsFilterViaModule(value);
}

function detectBrowserUiLocale() {
  return detectBrowserUiLocaleViaModule();
}

function resolveUiLocale(prefs = getPreferences()) {
  return resolveUiLocaleViaModule(prefs);
}

function tUi(key, fallback = "") {
  return tUiViaModule(key, fallback);
}

function tUiFmt(key, vars = {}, fallback = "") {
  return tUiFmtViaModule(key, vars, fallback);
}

function accountActivitySummary(account) {
  return accountActivitySummaryViaModule(account);
}

function normalizeGuildNotificationMode(value) {
  return normalizeGuildNotificationModeViaModule(value);
}

function normalizeBadgeDisplayMode(value) {
  return normalizeBadgeDisplayModeViaModule(value);
}

function normalizeDmPreviewMode(value) {
  return normalizeDmPreviewModeViaModule(value);
}

function normalizeChannelPanelWidth(value, fallback = 270) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(420, Math.max(196, Math.round(numeric)));
}

function normalizeGuildNotificationsMap(value) {
  return normalizeGuildNotificationsMapViaModule(value);
}

function normalizeForumCollapsedThreadsMap(value) {
  return normalizeForumCollapsedThreadsMapViaModule(value);
}

function normalizeForumThreadReadStateMap(value) {
  return normalizeForumThreadReadStateMapViaModule(value);
}

function normalizeForumThreadSortMap(value) {
  return normalizeForumThreadSortMapViaModule(value);
}

function normalizeForumThreadTagFilterMap(value) {
  return normalizeForumThreadTagFilterMapViaModule(value);
}

function normalizeForumThreadUnreadOnlyMap(value) {
  return normalizeForumThreadUnreadOnlyMapViaModule(value);
}

function normalizeForumThreadMyOnlyMap(value) {
  return normalizeForumThreadMyOnlyMapViaModule(value);
}

function normalizeSpaceGroupCollapsedMap(value) {
  return normalizeSpaceGroupCollapsedMapViaModule(value);
}

function normalizeLastChannelByGuildMap(value) {
  return normalizeLastChannelByGuildMapViaModule(value);
}

function normalizeXmppOmemoEnabledByJid(value) {
  return normalizeXmppOmemoEnabledByJidViaModule(value);
}

function normalizeXmppEncryptionByJid(value) {
  return normalizeXmppEncryptionByJidViaModule(value);
}

function normalizeXmppIgnoredRoomsByAccount(value) {
  return normalizeXmppIgnoredRoomsByAccountViaModule(value);
}

function normalizeMediaPrivacyMode(value) {
  return normalizeMediaPrivacyModeViaModule(value);
}

function normalizeMediaTab(value) {
  return normalizeMediaTabViaModule(value);
}

function normalizeMediaTrustRules(value) {
  return normalizeMediaTrustRulesViaModule(value);
}

function normalizeMediaDenyRules(value) {
  return normalizeMediaDenyRulesViaModule(value);
}

function normalizeMessageCharLimit(value) {
  return normalizeMessageCharLimitViaModule(value);
}

function normalizeProfileEffect(value) {
  return normalizeProfileEffectViaModule(value);
}

function normalizeRelayMode(value) {
  return normalizeRelayModeViaModule(value);
}

function normalizeRelayUrl(value) {
  return normalizeRelayUrlViaModule(value);
}

function normalizeRelayRoom(value) {
  return normalizeRelayRoomViaModule(value);
}

function normalizeConferenceProviderUrl(value) {
  return normalizeConferenceProviderUrlViaModule(value);
}

function normalizeConferenceRoomPrefix(value) {
  return normalizeConferenceRoomPrefixViaModule(value);
}

function normalizeConferenceRoomToken(value) {
  return normalizeConferenceRoomTokenViaModule(value);
}

function normalizeWhiteboardProviderUrl(value) {
  return normalizeWhiteboardProviderUrlViaModule(value);
}

function normalizeWhiteboardRoomPrefix(value) {
  return normalizeWhiteboardRoomPrefixViaModule(value);
}

function relayHealthUrlFromRelayUrl(value) {
  return relayHealthUrlFromRelayUrlViaModule(value);
}

function normalizeTenorApiKey(value) {
  return normalizeTenorApiKeyViaModule(value);
}

function normalizeTenorClientKey(value) {
  return normalizeTenorClientKeyViaModule(value);
}

function normalizeXmppJid(value) {
  return normalizeXmppJidViaModule(value);
}

function normalizeXmppPassword(value) {
  return normalizeXmppPasswordViaModule(value);
}

function normalizeXmppWsUrl(value) {
  return normalizeXmppWsUrlViaModule(value);
}

function normalizeXmppMucService(value) {
  return normalizeXmppMucServiceViaModule(value);
}

function normalizeVoiceState(value) {
  return normalizeVoiceStateViaModule(value);
}

function normalizeChannelPermissionValue(value) {
  return normalizeChannelPermissionValueViaModule(value);
}

function normalizeChannelPermissionOverrides(value, roleIds = []) {
  return normalizeChannelPermissionOverridesViaModule(value, roleIds);
}

function normalizeRecentEmojis(value) {
  return normalizeRecentEmojisViaModule(value);
}

function normalizeGifFavorites(value) {
  return normalizeGifFavoritesViaModule(value);
}

function normalizeGifGroups(value) {
  return normalizeGifGroupsViaModule(value);
}

function normalizeGifScope(value, groups = []) {
  return normalizeGifScopeViaModule(value, groups);
}

function getPreferences() {
  const defaults = buildInitialState().preferences;
  const current = state.preferences || {};
  const gifGroups = normalizeGifGroups(current.gifGroups);
  return {
    uiScale: Number.isFinite(Number(current.uiScale)) ? Math.min(115, Math.max(90, Number(current.uiScale))) : defaults.uiScale,
    theme: normalizeTheme(current.theme),
    uiAccentColor: /^#[0-9a-f]{3,8}$/i.test((current.uiAccentColor || "").toString().trim())
      ? (current.uiAccentColor || "").toString().trim()
      : "",
    language: normalizeLanguage(current.language),
    languageOnboardingSeen: normalizeToggle(current.languageOnboardingSeen ?? "off"),
    dmHomeTab: normalizeDmHomeTab(current.dmHomeTab),
    compactMembers: normalizeToggle(current.compactMembers),
    enterToSend: (current.enterToSend || "").toString() === "ctrl-enter" ? "ctrl-enter" : "enter",
    quickSwitcherHotkey: (current.quickSwitcherHotkey || "").toString() === "alt-k" ? "alt-k" : "ctrl-k",
    reducedMotion: normalizeToggle(current.reducedMotion),
    uiIntensity: Number.isFinite(Number(current.uiIntensity)) ? Math.min(120, Math.max(80, Number(current.uiIntensity))) : (Number(defaults.uiIntensity) || 100),
    developerMode: normalizeToggle(current.developerMode),
    debugOverlay: normalizeToggle(current.debugOverlay),
    mute: normalizeToggle(current.mute),
    deafen: normalizeToggle(current.deafen),
    swfAudio: normalizeToggle(current.swfAudio),
    swfVolume: Number.isFinite(Number(current.swfVolume)) ? Math.min(100, Math.max(0, Number(current.swfVolume))) : defaults.swfVolume,
    swfAudioPolicy: normalizeSwfAudioPolicy(current.swfAudioPolicy),
    swfAudioScope: normalizeSwfAudioScope(current.swfAudioScope),
    swfAutoplay: normalizeSwfAutoplay(current.swfAutoplay),
    hapticMode: normalizeHapticMode(current.hapticMode ?? defaults.hapticMode),
    swfPauseOnMute: normalizeToggle(current.swfPauseOnMute),
    swfVuMeter: normalizeToggle(current.swfVuMeter),
    swfQuickAudioMode: normalizeSwfQuickAudioMode(current.swfQuickAudioMode),
    messageCharLimit: normalizeMessageCharLimit(current.messageCharLimit),
    guildNotifications: normalizeGuildNotificationsMap(current.guildNotifications),
    dmNotificationMode: normalizeGuildNotificationMode(current.dmNotificationMode),
    unreadBadgeStyle: normalizeBadgeDisplayMode(current.unreadBadgeStyle),
    titleBadgeMode: normalizeBadgeDisplayMode(current.titleBadgeMode),
    dmPreviewMode: normalizeDmPreviewMode(current.dmPreviewMode),
    streamerMode: normalizeToggle(current.streamerMode),
    forumCollapsedThreads: normalizeForumCollapsedThreadsMap(current.forumCollapsedThreads),
    forumThreadReadState: normalizeForumThreadReadStateMap(current.forumThreadReadState),
    forumThreadSort: normalizeForumThreadSortMap(current.forumThreadSort),
    forumThreadTagFilter: normalizeForumThreadTagFilterMap(current.forumThreadTagFilter),
    forumThreadUnreadOnly: normalizeForumThreadUnreadOnlyMap(current.forumThreadUnreadOnly),
    forumThreadMyOnly: normalizeForumThreadMyOnlyMap(current.forumThreadMyOnly),
    spaceGroupCollapsed: normalizeSpaceGroupCollapsedMap(current.spaceGroupCollapsed),
    mediaPrivacyMode: normalizeMediaPrivacyMode(current.mediaPrivacyMode),
    mediaTrustRules: normalizeMediaTrustRules(current.mediaTrustRules),
    mediaDenyRules: normalizeMediaDenyRules(current.mediaDenyRules),
    mediaLastTab: normalizeMediaTab(current.mediaLastTab),
    gifFavorites: normalizeGifFavorites(current.gifFavorites),
    gifGroups,
    gifScope: normalizeGifScope(current.gifScope, gifGroups),
    recentEmojis: normalizeRecentEmojis(current.recentEmojis),
    hideChannelPanel: normalizeToggle(current.hideChannelPanel),
    hideMemberPanel: normalizeToggle(current.hideMemberPanel),
    mobilePane: normalizeMobilePane(current.mobilePane),
    channelPanelWidth: normalizeChannelPanelWidth(current.channelPanelWidth, Number(defaults.channelPanelWidth) || 270),
    collapseDmSection: normalizeToggle(current.collapseDmSection),
    collapseGuildSection: normalizeToggle(current.collapseGuildSection),
    lastChannelByGuild: normalizeLastChannelByGuildMap(current.lastChannelByGuild),
    relayMode: normalizeRelayMode(current.relayMode),
    relayUrl: normalizeRelayUrl(current.relayUrl),
    relayRoom: normalizeRelayRoom(current.relayRoom),
    relayAutoConnect: normalizeToggle(current.relayAutoConnect),
    relayClientId: (current.relayClientId || createId()).toString(),
    rememberLogin: normalizeToggle(current.rememberLogin),
    rememberLoginStorage: normalizeToggle(current.rememberLoginStorage),
    xmppJid: normalizeXmppJid(current.xmppJid),
    xmppPassword: normalizeXmppPassword(current.xmppPassword),
    xmppWsUrl: normalizeXmppWsUrl(current.xmppWsUrl),
    xmppMucService: normalizeXmppMucService(current.xmppMucService),
    xmppHideNonXmpp: normalizeToggle(current.xmppHideNonXmpp ?? "on"),
    xmppEncryptionByJid: normalizeXmppEncryptionByJid(current.xmppEncryptionByJid),
    xmppOmemoEnabledByJid: normalizeXmppOmemoEnabledByJid(current.xmppOmemoEnabledByJid),
    xmppIgnoredRoomsByAccount: normalizeXmppIgnoredRoomsByAccount(current.xmppIgnoredRoomsByAccount),
    callProviderUrl: normalizeConferenceProviderUrl(current.callProviderUrl),
    callRoomPrefix: normalizeConferenceRoomPrefix(current.callRoomPrefix),
    callAutoPost: normalizeToggle(current.callAutoPost ?? "on"),
    callAudioInputId: normalizeMediaDeviceId(current.callAudioInputId),
    callVideoInputId: normalizeMediaDeviceId(current.callVideoInputId),
    callAudioOutputId: normalizeMediaDeviceId(current.callAudioOutputId),
    callScreenSystemAudio: normalizeToggle(current.callScreenSystemAudio ?? "on"),
    callScreenMicMix: normalizeToggle(current.callScreenMicMix ?? "on"),
    platformOverride: normalizePlatformOverride(current.platformOverride),
    whiteboardProviderUrl: normalizeWhiteboardProviderUrl(current.whiteboardProviderUrl),
    whiteboardRoomPrefix: normalizeWhiteboardRoomPrefix(current.whiteboardRoomPrefix),
    whiteboardAutoPost: normalizeToggle(current.whiteboardAutoPost ?? "on"),
    swfPipPosition: current.swfPipPosition && typeof current.swfPipPosition === "object"
      ? {
          left: Number.isFinite(Number(current.swfPipPosition.left)) ? Math.max(0, Number(current.swfPipPosition.left)) : null,
          top: Number.isFinite(Number(current.swfPipPosition.top)) ? Math.max(0, Number(current.swfPipPosition.top)) : null,
          manual: Boolean(current.swfPipPosition.manual)
        }
      : null,
    videoPipPosition: current.videoPipPosition && typeof current.videoPipPosition === "object"
      ? {
          left: Number.isFinite(Number(current.videoPipPosition.left)) ? Math.max(0, Number(current.videoPipPosition.left)) : null,
          top: Number.isFinite(Number(current.videoPipPosition.top)) ? Math.max(0, Number(current.videoPipPosition.top)) : null,
          manual: Boolean(current.videoPipPosition.manual)
        }
      : null,
    swfPipSize: current.swfPipSize && typeof current.swfPipSize === "object"
      ? {
          width: Number.isFinite(Number(current.swfPipSize.width)) ? Math.max(180, Number(current.swfPipSize.width)) : null,
          height: Number.isFinite(Number(current.swfPipSize.height)) ? Math.max(120, Number(current.swfPipSize.height)) : null
        }
      : null,
    videoPipSize: current.videoPipSize && typeof current.videoPipSize === "object"
      ? {
          width: Number.isFinite(Number(current.videoPipSize.width)) ? Math.max(180, Number(current.videoPipSize.width)) : null,
          height: Number.isFinite(Number(current.videoPipSize.height)) ? Math.max(120, Number(current.videoPipSize.height)) : null
        }
      : null
  };
}

function relayStatusText() {
  const base = RELAY_STATUS_LABELS[relayStatus] || "Disconnected";
  const detail = relayLastError ? ` (${relayLastError.slice(0, 72)})` : "";
  return `${base}${detail}`;
}

const RELAY_LOCAL_CHANNEL_NAME = "s67-local-relay-v1";
const RELAY_LOCAL_PACKET_SCOPE = "s67-relay";

function webxdcRealtimeSupported() {
  const runtime = globalThis.webxdc;
  return Boolean(runtime && typeof runtime.joinRealtimeChannel === "function");
}

function setWebxdcRelayError(error, { fallback = "webxdc relay error" } = {}) {
  const text = (error && (error.message || error.toString())) || fallback;
  relayWebxdcLastError = String(text || fallback).slice(0, 220);
  relayWebxdcLastErrorAt = Date.now();
}

function localRelaySupported() {
  return typeof BroadcastChannel !== "undefined" || webxdcRealtimeSupported();
}

function ensureLocalRelayClientId() {
  if (relayLocalClientId) return relayLocalClientId;
  const generator = typeof createId === "function"
    ? createId
    : () => `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
  relayLocalClientId = `local:${generator().slice(0, 10)}`;
  return relayLocalClientId;
}

function handleLocalRelayEnvelope(envelope) {
  if (!envelope || typeof envelope !== "object") return;
  if (envelope.scope !== RELAY_LOCAL_PACKET_SCOPE) return;
  const packet = envelope.packet && typeof envelope.packet === "object" ? envelope.packet : null;
  if (!packet) return;
  if ((packet.clientId || "").toString() === relayLocalClientId) return;
  if (getPreferences().relayMode !== "local") return;
  if (packet.type === "chat") applyRelayIncomingMessage(packet);
  if (packet.type === "typing") applyRelayIncomingTyping(packet);
}

function ensureLocalRelayChannel() {
  let opened = false;
  if (!relayLocalChannel && typeof BroadcastChannel !== "undefined") {
    try {
      relayLocalChannel = new BroadcastChannel(RELAY_LOCAL_CHANNEL_NAME);
      relayLocalChannel.addEventListener("message", (event) => {
        handleLocalRelayEnvelope(event?.data || null);
      });
      opened = true;
    } catch {
      relayLocalChannel = null;
    }
  } else if (relayLocalChannel) {
    opened = true;
  }
  if (ensureWebxdcRelayChannel()) opened = true;
  return opened;
}

function closeLocalRelayChannel() {
  if (!relayLocalChannel) return;
  try {
    relayLocalChannel.close();
  } catch {
    // Ignore local relay close failures.
  }
  relayLocalChannel = null;
  closeWebxdcRelayChannel();
}

function sendLocalRelayPacket(packet) {
  if (!packet || typeof packet !== "object") return false;
  if (!ensureLocalRelayChannel()) return false;
  const envelope = {
    scope: RELAY_LOCAL_PACKET_SCOPE,
    packet
  };
  let delivered = false;
  if (relayLocalChannel) {
    try {
      relayLocalChannel.postMessage(envelope);
      delivered = true;
    } catch {
      // Ignore BroadcastChannel post errors.
    }
  }
  if (sendWebxdcRelayPacket(envelope)) {
    delivered = true;
  }
  return delivered;
}

function localRelayDiagnostics() {
  const prefs = getPreferences();
  return {
    supported: localRelaySupported(),
    broadcastChannelSupported: typeof BroadcastChannel !== "undefined",
    webxdcRealtimeSupported: webxdcRealtimeSupported(),
    clientId: ensureLocalRelayClientId(),
    channelName: RELAY_LOCAL_CHANNEL_NAME,
    channelOpen: Boolean(relayLocalChannel),
    webxdcChannelOpen: Boolean(relayWebxdcChannel),
    webxdcJoinPending: Boolean(relayWebxdcJoinInFlight),
    webxdcJoinAttempts: Math.max(0, Number(relayWebxdcJoinAttempts) || 0),
    webxdcJoinFailures: Math.max(0, Number(relayWebxdcJoinFailures) || 0),
    webxdcPacketsSent: Math.max(0, Number(relayWebxdcPacketsSent) || 0),
    webxdcPacketsReceived: Math.max(0, Number(relayWebxdcPacketsReceived) || 0),
    webxdcLastError: (relayWebxdcLastError || "").toString(),
    webxdcLastErrorAt: relayWebxdcLastErrorAt ? new Date(relayWebxdcLastErrorAt).toISOString() : "",
    mode: prefs.relayMode,
    status: relayStatus
  };
}

function resetLocalRelayDiagnostics() {
  relayWebxdcJoinAttempts = 0;
  relayWebxdcJoinFailures = 0;
  relayWebxdcPacketsSent = 0;
  relayWebxdcPacketsReceived = 0;
  relayWebxdcLastError = "";
  relayWebxdcLastErrorAt = 0;
}

function parseWebxdcRelayEnvelope(rawPayload) {
  if (!rawPayload) return null;
  if (typeof rawPayload === "string") {
    try {
      return JSON.parse(rawPayload);
    } catch {
      return null;
    }
  }
  if (typeof rawPayload === "object") return rawPayload;
  return null;
}

function handleWebxdcRelayIncoming(rawPayload) {
  const envelope = parseWebxdcRelayEnvelope(rawPayload);
  if (!envelope || typeof envelope !== "object") return;
  relayWebxdcPacketsReceived = Math.max(0, Number(relayWebxdcPacketsReceived) || 0) + 1;
  handleLocalRelayEnvelope(envelope);
}

function bindWebxdcRelayChannel(channel) {
  if (!channel || typeof channel !== "object") return false;
  relayWebxdcChannel = channel;
  relayWebxdcJoinInFlight = null;
  if (typeof channel.setListener === "function") {
    try {
      channel.setListener((payload) => {
        handleWebxdcRelayIncoming(payload);
      });
    } catch (error) {
      setWebxdcRelayError(error, { fallback: "webxdc listener registration failed" });
    }
  } else if (typeof channel.addEventListener === "function") {
    try {
      channel.addEventListener("message", (event) => {
        const payload = event && typeof event === "object" && "data" in event ? event.data : event;
        handleWebxdcRelayIncoming(payload);
      });
    } catch (error) {
      setWebxdcRelayError(error, { fallback: "webxdc listener registration failed" });
    }
  } else if (typeof channel.onmessage === "function") {
    const previous = channel.onmessage.bind(channel);
    channel.onmessage = (payload) => {
      previous(payload);
      handleWebxdcRelayIncoming(payload);
    };
  } else {
    channel.onmessage = (payload) => {
      handleWebxdcRelayIncoming(payload);
    };
  }
  return true;
}

function ensureWebxdcRelayChannel() {
  if (relayWebxdcChannel) return true;
  if (!webxdcRealtimeSupported()) return false;
  if (relayWebxdcJoinInFlight) return false;
  relayWebxdcJoinAttempts = Math.max(0, Number(relayWebxdcJoinAttempts) || 0) + 1;
  try {
    const maybeChannel = globalThis.webxdc.joinRealtimeChannel();
    if (maybeChannel && typeof maybeChannel.then === "function") {
      relayWebxdcJoinInFlight = maybeChannel
        .then((channel) => {
          bindWebxdcRelayChannel(channel);
        })
        .catch((error) => {
          relayWebxdcJoinFailures = Math.max(0, Number(relayWebxdcJoinFailures) || 0) + 1;
          setWebxdcRelayError(error, { fallback: "webxdc joinRealtimeChannel() rejected" });
          relayWebxdcChannel = null;
        })
        .finally(() => {
          relayWebxdcJoinInFlight = null;
        });
      return true;
    }
    const bound = bindWebxdcRelayChannel(maybeChannel);
    if (!bound) {
      relayWebxdcJoinFailures = Math.max(0, Number(relayWebxdcJoinFailures) || 0) + 1;
      setWebxdcRelayError("invalid channel object", { fallback: "webxdc joinRealtimeChannel() returned invalid channel" });
      return false;
    }
    return true;
  } catch (error) {
    relayWebxdcJoinFailures = Math.max(0, Number(relayWebxdcJoinFailures) || 0) + 1;
    setWebxdcRelayError(error, { fallback: "webxdc joinRealtimeChannel() failed" });
    relayWebxdcChannel = null;
    relayWebxdcJoinInFlight = null;
    return false;
  }
}

function closeWebxdcRelayChannel() {
  if (!relayWebxdcChannel) return;
  try {
    if (typeof relayWebxdcChannel.close === "function") relayWebxdcChannel.close();
  } catch {
    // Ignore webxdc channel close failures.
  }
  relayWebxdcChannel = null;
  relayWebxdcJoinInFlight = null;
}

function sendWebxdcRelayPacket(envelope) {
  if (!envelope || typeof envelope !== "object") return false;
  if (!ensureWebxdcRelayChannel()) return false;
  if (!relayWebxdcChannel || typeof relayWebxdcChannel.send !== "function") return false;
  try {
    relayWebxdcChannel.send(envelope);
    relayWebxdcPacketsSent = Math.max(0, Number(relayWebxdcPacketsSent) || 0) + 1;
    return true;
  } catch (error) {
    setWebxdcRelayError(error, { fallback: "webxdc send failed" });
    return false;
  }
}

function relayHttpEndpoint(pathname = "/chat") {
  const prefs = getPreferences();
  const endpoint = new URL(normalizeRelayUrl(prefs.relayUrl).replace(/^ws:/i, "http:").replace(/^wss:/i, "https:"));
  endpoint.pathname = pathname;
  return endpoint;
}

function sendHttpRelayPacket(packet) {
  if (!packet || typeof packet !== "object") return false;
  try {
    const endpoint = relayHttpEndpoint("/chat");
    fetch(endpoint.toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(packet)
    }).catch(() => {
      setRelayStatus("error", "HTTP relay post failed");
    });
    return true;
  } catch {
    setRelayStatus("error", "HTTP relay post failed");
    return false;
  }
}

function getTransportAdapter(mode = getPreferences().relayMode) {
  const adapters = {
    local: {
      id: "local",
      label: "Local",
      canRealtime: true,
      description: "Local storage + BroadcastChannel across tabs.",
      send: (packet) => sendLocalRelayPacket(packet),
      subscribe: () => true,
      fetchHistory: () => false,
      presence: () => false
    },
    off: {
      id: "off",
      label: "Off",
      canRealtime: false,
      description: "Transport disabled.",
      send: () => false,
      subscribe: () => false,
      fetchHistory: () => false,
      presence: () => false
    },
    http: {
      id: "http",
      label: "HTTP Relay",
      canRealtime: true,
      description: "SSE + POST relay transport.",
      send: (packet) => sendHttpRelayPacket(packet),
      subscribe: (room = "") => {
        relayJoinedRoom = (room || "").toString();
        connectRelaySocket({ force: true });
        return true;
      },
      fetchHistory: () => false,
      presence: () => false
    },
    ws: {
      id: "ws",
      label: "WebSocket Relay",
      canRealtime: true,
      description: "Bidirectional WebSocket relay transport.",
      send: (packet, { room = "" } = {}) => {
        if (!relaySocket || relaySocket.readyState !== WebSocket.OPEN) return false;
        const targetRoom = (room || packet?.room || "").toString();
        if (targetRoom && relayJoinedRoom !== targetRoom) joinRelayRoom(targetRoom);
        return sendRelayPacket(packet);
      },
      subscribe: (room = "") => joinRelayRoom(room),
      fetchHistory: () => false,
      presence: () => false
    },
    xmpp: {
      id: "xmpp",
      label: "XMPP",
      canRealtime: true,
      description: "XMPP over WebSocket with MUC room mapping.",
      send: () => false,
      subscribe: () => false,
      fetchHistory: () => false,
      presence: () => false
    }
  };
  return adapters[mode] || adapters.local;
}

function renderRelayStatusOutput() {
  if (!ui.relayStatusOutput) return;
  ui.relayStatusOutput.textContent = `Relay: ${relayStatusText()}`;
  if (ui.relayHeaderBadge) {
    const prefs = getPreferences();
    const adapter = getTransportAdapter(prefs.relayMode);
    ui.relayHeaderBadge.textContent = `${adapter.label} · ${RELAY_STATUS_LABELS[relayStatus] || "Disconnected"}`;
    ui.relayHeaderBadge.dataset.state = relayStatus;
  }
}

function setRelayStatus(status, errorText = "") {
  relayStatus = status;
  relayLastError = errorText || "";
  if (getPreferences().relayMode === "xmpp") {
    addXmppDebugEvent(status === "error" ? "error" : "connect", "Relay status updated", {
      status,
      error: relayLastError || ""
    });
  }
  renderRelayStatusOutput();
}

function relayClientId() {
  state.preferences = getPreferences();
  if (!state.preferences.relayClientId) state.preferences.relayClientId = createId();
  return state.preferences.relayClientId;
}

function relayTransportClientId(mode = getPreferences().relayMode) {
  return mode === "local" ? ensureLocalRelayClientId() : relayClientId();
}

function sendRelayTransportPacket(packet, { mode = getPreferences().relayMode, room = "" } = {}) {
  const adapter = getTransportAdapter(mode);
  if (!adapter || typeof adapter.send !== "function") return false;
  return adapter.send(packet, { room });
}

function relayRoomForDmParticipantAccounts(accounts = []) {
  const usernames = (Array.isArray(accounts) ? accounts : [])
    .filter(Boolean)
    .map((entry) => normalizeUsername(entry.username || ""))
    .filter(Boolean)
    .sort();
  if (usernames.length < 2) return "";
  return `dm:${usernames.slice(0, 2).join(":")}`;
}

function relayRoomForDmThread(thread) {
  if (!thread || !Array.isArray(thread.participantIds)) return "";
  const participants = thread.participantIds
    .map((id) => getAccountById(id))
    .filter(Boolean);
  return relayRoomForDmParticipantAccounts(participants);
}

function findDmThreadByRelayRoom(roomToken, account = getCurrentAccount()) {
  if (!roomToken || !account) return null;
  const room = roomToken.toString();
  return state.dmThreads.find((thread) => (
    Array.isArray(thread.participantIds)
    && thread.participantIds.includes(account.id)
    && relayRoomForDmThread(thread) === room
  )) || null;
}

function xmppPeerJidForDmThread(thread, account = getCurrentAccount()) {
  if (!thread || !account || !Array.isArray(thread.participantIds)) return "";
  const peerId = thread.participantIds.find((id) => id && id !== account.id);
  if (!peerId) return "";
  const peer = getAccountById(peerId);
  return normalizeXmppJid(peer?.xmppJid || "").toLowerCase();
}

function xmppPeerJidForRelayRoom(roomToken, account = getCurrentAccount()) {
  if (!roomToken || !/^dm:/i.test(roomToken.toString())) return "";
  const thread = findDmThreadByRelayRoom(roomToken, account);
  return xmppPeerJidForDmThread(thread, account);
}

function latestXmppPeerMessageReferenceIdForDmThread(thread, accountId) {
  if (typeof XEP_0184_0333_MARKER_FLOW_GLOBAL.latestXmppPeerMessageReferenceIdForDmThread !== "function") return "";
  return XEP_0184_0333_MARKER_FLOW_GLOBAL.latestXmppPeerMessageReferenceIdForDmThread(thread, accountId, {
    preferredXmppDmReferenceIdForMessageFn: preferredXmppDmReferenceIdForMessage,
    primaryXmppReferenceIdForMessageFn: primaryXmppReferenceIdForMessage
  });
}

function maybePublishXmppDisplayedMarkerForDmThread(thread, accountId, { trigger = "" } = {}) {
  if (typeof XEP_0184_0333_MARKER_FLOW_GLOBAL.maybePublishXmppDisplayedMarkerForDmThread !== "function") return false;
  return XEP_0184_0333_MARKER_FLOW_GLOBAL.maybePublishXmppDisplayedMarkerForDmThread(thread, accountId, { trigger }, {
    relayStatus,
    xmppConnection,
    $msg: globalThis.$msg,
    getPreferencesFn: getPreferences,
    getAccountByIdFn: getAccountById,
    xmppPeerJidForDmThreadFn: xmppPeerJidForDmThread,
    xmppBareJidFn: xmppBareJid,
    latestXmppPeerMessageReferenceIdForDmThreadFn: latestXmppPeerMessageReferenceIdForDmThread,
    sendXmppDisplayedMarkerToPeerFn: sendXmppDisplayedMarkerToPeer
  });
}

function sendXmppDisplayedMarkerToPeer(peerJid, markerTargetId, { trigger = "" } = {}) {
  if (typeof XEP_0184_0333_MARKER_FLOW_GLOBAL.sendXmppDisplayedMarkerToPeer !== "function") return false;
  return XEP_0184_0333_MARKER_FLOW_GLOBAL.sendXmppDisplayedMarkerToPeer(peerJid, markerTargetId, { trigger }, {
    xmppConnection,
    xmppBareJidFn: xmppBareJid,
    shouldSkipXmppDisplayedMarkerFn: shouldSkipXmppDisplayedMarker,
    createIdFn: createId,
    buildXmppDisplayedMarkerStanzaFn: buildXmppDisplayedMarkerStanza,
    rememberXmppLocalSentRefsFn: rememberXmppLocalSentRefs,
    lastSentDisplayedMarkerByPeerJid: xmppLastSentDisplayedMarkerByPeerJid,
    addXmppDebugEventFn: addXmppDebugEvent
  });
}

function relayRoomForActiveConversation() {
  const prefs = getPreferences();
  if (prefs.relayRoom) return prefs.relayRoom;
  const conversation = getActiveConversation();
  if (conversation?.type === "dm" && conversation.thread) {
    const room = relayRoomForDmThread(conversation.thread);
    if (room) return room;
  }
  if (conversation?.type === "channel" && conversation.channel) {
    if (conversation.channel.relayRoomToken) return conversation.channel.relayRoomToken.toString();
    if (conversation.channel.xmppRoomJid) return `xmpp:${normalizeXmppJid(conversation.channel.xmppRoomJid).toLowerCase()}`;
    const guild = getActiveGuild();
    const guildName = sanitizeChannelName(guild?.name || "guild", "guild");
    const channelName = sanitizeChannelName(conversation.channel.name || "general", "general");
    return `${guildName}:${channelName}`;
  }
  return "lobby:general";
}

function findRelayTargetChannelByRoom(roomToken) {
  if (!roomToken) return null;
  const room = roomToken.toString();
  for (const guild of state.guilds) {
    if (!guild || !Array.isArray(guild.channels)) continue;
    for (const channel of guild.channels) {
      if (!channel || (channel.type === "voice" || channel.type === "stage")) continue;
      if (channel.relayRoomToken && channel.relayRoomToken.toString() === room) return channel;
      if (channel.xmppRoomJid && `xmpp:${normalizeXmppJid(channel.xmppRoomJid).toLowerCase()}` === room) return channel;
      const guildName = sanitizeChannelName(guild.name || "guild", "guild");
      const channelName = sanitizeChannelName(channel.name || "general", "general");
      if (`${guildName}:${channelName}` === room) return channel;
    }
  }
  return null;
}

function clearRelayTypingState() {
  relayTypingByRoom.clear();
  if (relayTypingSweepTimer) {
    clearTimeout(relayTypingSweepTimer);
    relayTypingSweepTimer = null;
  }
  if (relayLocalTypingState.active || relayLocalTypingState.room) {
    relayLocalTypingState.active = false;
    relayLocalTypingState.room = "";
    relayLocalTypingState.chatState = "";
    relayLocalTypingState.lastSentAt = 0;
  }
}

function scheduleRelayTypingSweep() {
  if (relayTypingSweepTimer) {
    clearTimeout(relayTypingSweepTimer);
    relayTypingSweepTimer = null;
  }
  const now = Date.now();
  let nextExpiry = Infinity;
  relayTypingByRoom.forEach((entries, room) => {
    entries.forEach((meta, clientId) => {
      if (!meta || !Number.isFinite(meta.expiresAt) || meta.expiresAt <= now) {
        entries.delete(clientId);
        return;
      }
      if (meta.expiresAt < nextExpiry) nextExpiry = meta.expiresAt;
    });
    if (entries.size === 0) relayTypingByRoom.delete(room);
  });
  if (nextExpiry !== Infinity) {
    relayTypingSweepTimer = setTimeout(() => {
      relayTypingSweepTimer = null;
      scheduleRelayTypingSweep();
      renderComposerMeta();
    }, Math.max(100, nextExpiry - now + 20));
  }
}

function clearRelayTypingForClient(room, clientId) {
  if (!room || !clientId) return;
  const entries = relayTypingByRoom.get(room);
  if (!entries) return;
  entries.delete(clientId);
  if (entries.size === 0) relayTypingByRoom.delete(room);
  scheduleRelayTypingSweep();
}

function applyRelayIncomingTyping(packet) {
  const current = getCurrentAccount();
  if (!current || !packet || typeof packet !== "object") return;
  const remoteClientId = (packet.clientId || "").toString();
  if (!remoteClientId || remoteClientId === relayClientId()) return;
  const room = (packet.room || "").toString();
  if (!room) return;
  const typing = packet.typing && typeof packet.typing === "object" ? packet.typing : {};
  const stateText = (typing.state || "").toString().toLowerCase();
  const isTyping = !["paused", "inactive", "gone", "stopped", "false", "0"].includes(stateText) && typing.active !== false;
  if (!isTyping) {
    clearRelayTypingForClient(room, remoteClientId);
    renderComposerMeta();
    return;
  }
  const mine = normalizeUsername(current.username || "");
  const authorUsername = normalizeUsername(typing.authorUsername || packet.username || `relay_${remoteClientId.slice(0, 6)}`) || `relay_${remoteClientId.slice(0, 6)}`;
  if (mine && mine === authorUsername) return;
  const authorDisplay = (typing.authorDisplay || typing.authorUsername || packet.username || authorUsername).toString().slice(0, 32);
  let entries = relayTypingByRoom.get(room);
  if (!entries) {
    entries = new Map();
    relayTypingByRoom.set(room, entries);
  }
  entries.set(remoteClientId, {
    username: authorUsername,
    display: authorDisplay,
    expiresAt: Date.now() + RELAY_TYPING_TTL_MS
  });
  scheduleRelayTypingSweep();
  renderComposerMeta();
}

function typingNamesForRoom(room) {
  if (!room) return [];
  const entries = relayTypingByRoom.get(room);
  if (!entries) return [];
  const now = Date.now();
  const names = [];
  entries.forEach((meta, clientId) => {
    if (!meta || !Number.isFinite(meta.expiresAt) || meta.expiresAt <= now) {
      entries.delete(clientId);
      return;
    }
    const label = (meta.display || meta.username || "").toString().trim().slice(0, 32);
    if (label) names.push(label);
  });
  if (entries.size === 0) relayTypingByRoom.delete(room);
  return [...new Set(names)].slice(0, 4);
}

function formatTypingSummary(names) {
  if (!Array.isArray(names) || names.length === 0) return "";
  if (names.length === 1) return `${names[0]} is typing...`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
  if (names.length === 3) return `${names[0]}, ${names[1]}, and ${names[2]} are typing...`;
  return `${names[0]}, ${names[1]}, and ${names.length - 2} others are typing...`;
}

function xmppChatStateNodeForTypingActive(active) {
  if (typeof XEP_0085_CHATSTATES_GLOBAL.xmppChatStateNodeForTypingActive === "function") {
    return XEP_0085_CHATSTATES_GLOBAL.xmppChatStateNodeForTypingActive(Boolean(active));
  }
  return active ? "composing" : "paused";
}

function xmppBuildChatStateStanza({ to = "", type = "chat", state = "", active = null, id = "" } = {}) {
  if (typeof XEP_0085_CHATSTATES_GLOBAL.xmppBuildChatStateStanza !== "function") {
    const node = (state || xmppChatStateNodeForTypingActive(active === true)).toString().trim().toLowerCase();
    if (!to || !globalThis.$msg || !node) return null;
    return globalThis.$msg({ to, type, ...(id ? { id } : {}) })
      .c(node, { xmlns: "http://jabber.org/protocol/chatstates" });
  }
  return XEP_0085_CHATSTATES_GLOBAL.xmppBuildChatStateStanza({ to, type, state, active, id }, {
    $msg: globalThis.$msg
  });
}

function xmppChatStateFromStanza(stanza) {
  if (typeof XEP_0085_CHATSTATES_GLOBAL.xmppChatStateFromStanza !== "function") {
    return "";
  }
  return XEP_0085_CHATSTATES_GLOBAL.xmppChatStateFromStanza(stanza, {
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns
  });
}

function xmppRelayTypingPayloadFromChatState(chatState = "", { authorUsername = "", authorDisplay = "" } = {}) {
  if (typeof XEP_0085_CHATSTATES_GLOBAL.xmppRelayTypingPayloadFromChatState !== "function") {
    const normalized = (chatState || "").toString().trim().toLowerCase();
    if (!normalized) return null;
    return {
      state: normalized === "composing" ? "composing" : "paused",
      active: normalized === "composing",
      authorUsername: (authorUsername || "").toString(),
      authorDisplay: (authorDisplay || "").toString()
    };
  }
  return XEP_0085_CHATSTATES_GLOBAL.xmppRelayTypingPayloadFromChatState(chatState, { authorUsername, authorDisplay });
}

function normalizeXmppChatStateName(value = "") {
  const normalized = (value || "").toString().trim().toLowerCase();
  if (!normalized) return "";
  return ["composing", "paused", "inactive", "gone", "active"].includes(normalized) ? normalized : "";
}

function publishRelayTypingState(active, { force = false, room: roomOverride = "", chatState = "" } = {}) {
  const prefs = getPreferences();
  if (!["local", "ws", "http", "xmpp"].includes(prefs.relayMode)) return false;
  const current = getCurrentAccount();
  if (!current) return false;
  const room = roomOverride || relayRoomForActiveConversation();
  if (!room) return false;
  const now = Date.now();
  const explicitState = normalizeXmppChatStateName(chatState);
  const chatStateNode = explicitState || xmppChatStateNodeForTypingActive(active);
  const relayTypingStateNode = prefs.relayMode === "xmpp"
    ? chatStateNode
    : (active ? "composing" : "paused");
  if (!force && active && relayLocalTypingState.active && relayLocalTypingState.room === room && (now - relayLocalTypingState.lastSentAt) < RELAY_TYPING_THROTTLE_MS) {
    return true;
  }
  if (!force && !active && !relayLocalTypingState.active && relayLocalTypingState.room === room && relayLocalTypingState.chatState === chatStateNode) {
    return true;
  }
  const typingPayload = {
    state: relayTypingStateNode,
    active: Boolean(active),
    ts: new Date().toISOString(),
    authorUsername: current.username,
    authorDisplay: current.displayName || current.username
  };
  if (prefs.relayMode === "xmpp") {
    if (!xmppConnection) return false;
    if (relayStatus !== "connected") return false;
    if (/^dm:/i.test(room)) {
      const dmThread = findDmThreadByRelayRoom(room, current);
      const peerJid = xmppPeerJidForDmThread(dmThread, current);
      if (peerJid) {
        const stanza = xmppBuildChatStateStanza({ to: peerJid, type: "chat", state: chatStateNode });
        if (!stanza) return false;
        xmppConnection.send(stanza);
        relayLocalTypingState.active = Boolean(active);
        relayLocalTypingState.room = room;
        relayLocalTypingState.chatState = chatStateNode;
        relayLocalTypingState.lastSentAt = now;
        return true;
      }
    }
    const roomJid = xmppRoomJidForToken(room, prefs);
    if (!roomJid) return false;
    const bareRoomJid = xmppBareJid(roomJid);
    if (!bareRoomJid || !xmppRoomByJid.has(bareRoomJid)) {
      joinXmppRoom(room, current);
    }
    const stanza = xmppBuildChatStateStanza({ to: roomJid, type: "groupchat", state: chatStateNode });
    if (!stanza) return false;
    xmppConnection.send(stanza);
    relayLocalTypingState.active = Boolean(active);
    relayLocalTypingState.room = room;
    relayLocalTypingState.chatState = chatStateNode;
    relayLocalTypingState.lastSentAt = now;
    return true;
  }
  const ok = sendRelayTransportPacket({
    type: "typing",
    room,
    clientId: relayTransportClientId(prefs.relayMode),
    username: current.username,
    typing: typingPayload
  }, { mode: prefs.relayMode, room });
  if (ok) {
    relayLocalTypingState.active = Boolean(active);
    relayLocalTypingState.room = room;
    relayLocalTypingState.chatState = chatStateNode;
    relayLocalTypingState.lastSentAt = now;
  }
  return ok;
}

function updateComposerTypingPublish() {
  const text = (ui.messageInput?.value || "").toString();
  const hasContent = text.trim().length > 0;
  if (!hasContent) {
    publishRelayTypingState(false);
    return;
  }
  publishRelayTypingState(true);
}

function resolveXmppServiceUrl(prefs = getPreferences()) {
  if (typeof XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.resolveXmppServiceUrl !== "function") return "";
  return XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.resolveXmppServiceUrl(prefs, {
    normalizeXmppWsUrlFn: normalizeXmppWsUrl,
    xmppDomainFromJidFn: xmppDomainFromJid
  });
}

async function loadXmppLibrary() {
  if (xmppRuntimeReady && globalThis.Strophe && globalThis.$msg && globalThis.$pres) return true;
  if (xmppLoadingPromise) return xmppLoadingPromise;
  xmppRuntimeLastError = "";
  addXmppDebugEvent("runtime", "Loading XMPP runtime", {
    sources: ["./vendor/strophe.umd.min.js", "./node_modules/strophe.js/dist/strophe.umd.min.js", "cdn fallbacks"]
  });
  xmppLoadingPromise = (async () => {
    const errors = [];
    const urls = [
      "./vendor/strophe.umd.min.js",
      "vendor/strophe.umd.min.js",
      "./node_modules/strophe.js/dist/strophe.umd.min.js",
      "node_modules/strophe.js/dist/strophe.umd.min.js",
      "https://cdn.jsdelivr.net/npm/strophe.js@1.6.2/dist/strophe.min.js",
      "https://unpkg.com/strophe.js@1.6.2/dist/strophe.min.js"
    ];
    for (const url of urls) {
      addXmppDebugEvent("runtime", "Trying runtime source", { url });
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = url;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`failed: ${url}`));
          document.head.appendChild(script);
        });
        if (globalThis.Strophe && globalThis.$msg && globalThis.$pres) {
          xmppRuntimeReady = true;
          xmppRuntimeLastError = "";
          xmppLoadingPromise = null;
          addXmppDebugEvent("runtime", "XMPP runtime loaded", { url });
          return true;
        }
      } catch (error) {
        addXmppDebugEvent("runtime", "Runtime source failed", { url, error: String(error?.message || error) });
        errors.push(error?.message || String(error) || `failed: ${url}`);
      }
    }
    xmppRuntimeLastError = errors.length > 0 ? errors.join(" | ") : "Unknown XMPP runtime load failure.";
    xmppLoadingPromise = null;
    addXmppDebugEvent("error", "XMPP runtime load failed", { error: xmppRuntimeLastError });
    return false;
  })();
  return xmppLoadingPromise;
}

function joinXmppRoom(roomToken, account = getCurrentAccount()) {
  if (typeof XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.joinXmppRoom !== "function") return false;
  return XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.joinXmppRoom(roomToken, account, {
    xmppConnection,
    relayStatus,
    getPreferencesFn: getPreferences,
    xmppRoomJidForTokenFn: xmppRoomJidForToken,
    xmppMucJoinStateByRoomJid,
    xmppRoomByJid,
    isXmppRoomIgnoredFn: typeof isXmppRoomIgnored === "function" ? isXmppRoomIgnored : null,
    sanitizeChannelNameFn: sanitizeChannelName,
    ensureXmppMamStateFn: ensureXmppMamState,
    requestXmppRoomHistoryFn: requestXmppRoomHistory,
    XMPP_MAM_PREFETCH_PAGES,
    scheduleXmppMucSelfPingFn: scheduleXmppMucSelfPing,
    clearXmppMucSelfPingFn: clearXmppMucSelfPing,
    $pres: globalThis.$pres,
    upsertXmppRoomChannelFn: upsertXmppRoomChannel,
    renderServersFn: renderServers,
    renderChannelsFn: renderChannels,
    addXmppDebugEventFn: addXmppDebugEvent
  });
}

function leaveXmppRoom(roomJid, account = getCurrentAccount()) {
  if (typeof XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.leaveXmppRoom !== "function") return false;
  return XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.leaveXmppRoom(roomJid, account, {
    xmppBareJidFn: xmppBareJid,
    xmppConnection,
    relayStatus,
    $pres: globalThis.$pres,
    xmppMucJoinStateByRoomJid,
    sanitizeChannelNameFn: sanitizeChannelName,
    xmppRoomByJid,
    clearXmppMucSelfPingFn: clearXmppMucSelfPing,
    addXmppDebugEventFn: addXmppDebugEvent
  });
}

function removeXmppRoomChannelByJid(roomJid, {
  account = getCurrentAccount(),
  prefs = getPreferences(),
  persist = false,
  leave = false
} = {}) {
  if (typeof XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.removeXmppRoomChannelByJid !== "function") {
    return { removed: false, channel: null };
  }
  return XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.removeXmppRoomChannelByJid(roomJid, {
    account,
    prefs,
    persist,
    leave
  }, {
    xmppBareJidFn: xmppBareJid,
    state,
    leaveXmppRoomFn: leaveXmppRoom,
    xmppRoomByJid,
    getFirstOpenableChannelIdForGuildFn: getFirstOpenableChannelIdForGuild,
    saveStateFn: saveState
  });
}

function teardownXmppConnection() {
  addXmppDebugEvent("connect", "Tearing down XMPP connection");
  clearXmppPingLoop();
  clearAllXmppMucSelfPings();
  xmppCsiSupported = false;
  xmppCsiState = "";
  if (xmppConnection) {
    try {
      xmppConnection.disconnect();
    } catch {
      // Ignore disconnect errors.
    }
  }
  xmppConnection = null;
  xmppConnectCount = 0;
  if (typeof resetXmppSmRuntime === "function") {
    resetXmppSmRuntime({ keepSupport: false, reason: "teardown" });
  }
  xmppRoomByJid.clear();
  xmppOccupantsByRoomJid.clear();
  xmppMamStateByRoomJid.clear();
  xmppMamStateByPeerJid.clear();
  xmppRoomMessageIndexByJid.clear();
  xmppDmMessageIndexByPeerJid.clear();
  xmppLastSentDisplayedMarkerByPeerJid.clear();
  xmppAvatarFetchInFlight.clear();
  xmppAvatarHashByJid.clear();
  xmppAvatarMissingByJid.clear();
  xmppMucAvatarByOccupantKey.clear();
  xmppMucAvatarFetchInFlight.clear();
  xmppKnownMucOccupantJidByKey.clear();
  xmppSeenDirectMucInviteKeys.clear();
  xmppIncomingContactRequestsByJid.clear();
  xmppOutgoingContactRequestsByJid.clear();
  xmppMucJoinStateByRoomJid.clear();
  xmppDiscoInfoCacheByJid.clear();
  xmppDiscoInfoInFlightByJid.clear();
  xmppRoomDiscoveryInFlightByService.clear();
  xmppOmemoDeviceListByJid.clear();
  xmppOmemoBundleByJidDevice.clear();
  xmppOmemoPreferredNamespaceByJid.clear();
  xmppOmemoSessionSetupInFlight.clear();
  xmppOmemoDecryptInFlightByMessageId.clear();
  xmppAvailableFullJidsByBare.clear();
  xmppCallSessionIdByInviteId.clear();
  xmppCallSessionById.forEach((entry, sid) => {
    if (entry?.timeoutId) clearTimeout(entry.timeoutId);
    xmppCloseSessionPeerConnection(sid);
    xmppCallSessionById.delete(sid);
  });
  xmppCallIceGatherInFlightBySessionId.clear();
  xmppCallPeerConnectionBySessionId.clear();
  xmppCallSessionTaskChainBySessionId.clear();
  xmppCallLocalMediaStreamBySessionId.forEach((_, sid) => xmppStopLocalMediaStreamForSession(sid));
  xmppCallLocalMediaStreamBySessionId.clear();
  xmppCallLocalAuxStreamsBySessionId.clear();
  xmppCallSpeakingStateBySessionId.forEach((_, sid) => stopXmppCallSpeakingMonitor(sid));
  xmppCallSpeakingStateBySessionId.clear();
  xmppCallRemoteStreamsBySessionId.clear();
  xmppActiveNativeCallSessionId = "";
  nativeCallDebugDialogSessionId = "";
  xmppCallPendingReprimeBySessionId.forEach((entry) => {
    if (entry?.timerId) clearTimeout(entry.timerId);
  });
  xmppCallPendingReprimeBySessionId.clear();
  xmppLatestIncomingCallSessionByPeer.clear();
  xmppLatestOutgoingCallSessionByPeer.clear();
}

function sendRelayPacket(packet) {
  if (!relaySocket || relaySocket.readyState !== WebSocket.OPEN) return false;
  try {
    relaySocket.send(JSON.stringify(packet));
    return true;
  } catch {
    return false;
  }
}

function joinRelayRoom(room) {
  if (!room) return false;
  const current = getCurrentAccount();
  if (!current) return false;
  const prefs = getPreferences();
  if (prefs.relayMode === "http") {
    relayJoinedRoom = room;
    connectRelaySocket({ force: true });
    return true;
  }
  const ok = sendRelayPacket({
    type: "join",
    room,
    clientId: relayClientId(),
    username: current.username
  });
  if (ok) relayJoinedRoom = room;
  return ok;
}

function clearRelayReconnectTimer() {
  if (!relayReconnectTimer) return;
  clearTimeout(relayReconnectTimer);
  relayReconnectTimer = null;
}

function scheduleRelayReconnect() {
  const prefs = getPreferences();
  if (prefs.relayAutoConnect !== "on") return;
  if (!["ws", "http", "xmpp"].includes(prefs.relayMode)) return;
  clearRelayReconnectTimer();
  relayReconnectTimer = setTimeout(() => {
    relayReconnectTimer = null;
    connectRelaySocket();
  }, 1600);
}

function disconnectRelaySocket({ manual = true } = {}) {
  if (relayLocalTypingState.room) {
    publishRelayTypingState(false, {
      force: true,
      room: relayLocalTypingState.room,
      chatState: "inactive"
    });
  }
  relayManualDisconnect = manual;
  clearRelayReconnectTimer();
  relayJoinedRoom = "";
  if (relayEventSource) {
    try {
      relayEventSource.close();
    } catch {
      // Ignore close errors for stale EventSource.
    }
  }
  relayEventSource = null;
  if (relaySocket) {
    try {
      relaySocket.close();
    } catch {
      // Ignore close errors for stale sockets.
    }
  }
  relaySocket = null;
  closeLocalRelayChannel();
  teardownXmppConnection();
  xmppPendingReceiptByStanzaId.clear();
  clearRelayTypingState();
  setRelayStatus("disconnected");
}

function resolveRelayTargetChannel() {
  const conversation = getActiveConversation();
  if (conversation?.type === "channel" && conversation.channel) return conversation.channel;
  const guild = getActiveGuild();
  if (!guild) return null;
  return guild.channels.find((entry) => ["text", "announcement", "forum", "media"].includes(entry.type)) || guild.channels[0] || null;
}

function insertMessageByTimestamp(bucket, message) {
  if (!Array.isArray(bucket) || !message) return;
  const nextTs = toTimestampMs(message.ts);
  if (!Number.isFinite(nextTs) || bucket.length === 0) {
    bucket.push(message);
    return;
  }
  let insertAt = bucket.length;
  for (let i = bucket.length - 1; i >= 0; i -= 1) {
    const existingTs = toTimestampMs(bucket[i]?.ts);
    if (!Number.isFinite(existingTs) || existingTs <= nextTs) {
      insertAt = i + 1;
      break;
    }
    insertAt = i;
  }
  bucket.splice(insertAt, 0, message);
}

function scheduleRelayUiRefresh({
  servers = false,
  channels = false,
  dms = false,
  messages = false,
  delayMs = 0
} = {}) {
  relayUiRefreshNeeds.servers = relayUiRefreshNeeds.servers || servers;
  relayUiRefreshNeeds.channels = relayUiRefreshNeeds.channels || channels;
  relayUiRefreshNeeds.dms = relayUiRefreshNeeds.dms || dms;
  relayUiRefreshNeeds.messages = relayUiRefreshNeeds.messages || messages;
  if (relayUiRefreshTimer) return;
  const waitMs = Math.max(0, Number(delayMs) || 0);
  relayUiRefreshTimer = window.setTimeout(() => {
    relayUiRefreshTimer = null;
    const pending = {
      servers: relayUiRefreshNeeds.servers,
      channels: relayUiRefreshNeeds.channels,
      dms: relayUiRefreshNeeds.dms,
      messages: relayUiRefreshNeeds.messages
    };
    relayUiRefreshNeeds.servers = false;
    relayUiRefreshNeeds.channels = false;
    relayUiRefreshNeeds.dms = false;
    relayUiRefreshNeeds.messages = false;
    if (pending.servers) renderServers();
    if (pending.dms) renderDmList();
    if (pending.channels) renderChannels();
    if (pending.messages) renderMessages();
  }, waitMs);
}

function normalizeXmppRefIdsList(value) {
  return normalizeXmppRefIdsListViaXep(value);
}

function trimXmppLocalSentRefs(now = Date.now()) {
  trimXmppLocalSentRefsViaXep(xmppLocalSentRefIdSeenAt, {
    now,
    ttlMs: XMPP_LOCAL_SENT_REF_TTL_MS,
    maxEntries: XMPP_LOCAL_SENT_REF_MAX
  });
}

function rememberXmppLocalSentRefs(refIds = []) {
  rememberXmppLocalSentRefsViaXep(xmppLocalSentRefIdSeenAt, refIds, {
    ttlMs: XMPP_LOCAL_SENT_REF_TTL_MS,
    maxEntries: XMPP_LOCAL_SENT_REF_MAX
  });
}

function isXmppLocalSentRefId(refId) {
  if (typeof XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.isXmppLocalSentRefId === "function") {
    return XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.isXmppLocalSentRefId(refId, {
      xmppLocalSentRefIdSeenAt,
      XMPP_LOCAL_SENT_REF_TTL_MS
    });
  }
  return isXmppLocalSentRefIdViaXep(xmppLocalSentRefIdSeenAt, refId, {
    ttlMs: XMPP_LOCAL_SENT_REF_TTL_MS
  });
}

function xmppRefIdsOverlap(idsA, idsB) {
  return xmppRefIdsOverlapViaXep(idsA, idsB);
}

function mergeRelayMessageEntry(target, incoming) {
  if (!target || !incoming) return false;
  let changed = false;
  if (!(target.xmppNick || "").toString().trim() && (incoming.xmppNick || "").toString().trim()) {
    target.xmppNick = incoming.xmppNick;
    changed = true;
  }
  const incomingStanzaId = (incoming.xmppStanzaId || "").toString().trim();
  if (incomingStanzaId && incomingStanzaId !== (target.xmppStanzaId || "").toString().trim()) {
    target.xmppStanzaId = incomingStanzaId;
    changed = true;
  }
  const targetRefIds = normalizeXmppRefIdsList(target.xmppRefIds);
  const incomingRefIds = normalizeXmppRefIdsList(incoming.xmppRefIds);
  if (incomingRefIds.length > 0) {
    const mergedRefIds = normalizeXmppRefIdsList([...targetRefIds, ...incomingRefIds]);
    if (mergedRefIds.length !== targetRefIds.length) {
      target.xmppRefIds = mergedRefIds;
      changed = true;
    }
  }
  const incomingText = (incoming.text || "").toString();
  if (!(target.text || "").toString().trim() && incomingText.trim()) {
    target.text = incomingText;
    changed = true;
  }
  if (!target.replyTo && incoming.replyTo) {
    target.replyTo = incoming.replyTo;
    changed = true;
  } else if (target.replyTo && incoming.replyTo) {
    const hadMessageId = Boolean((target.replyTo.messageId || "").toString().trim());
    const incomingMessageId = (incoming.replyTo.messageId || "").toString().trim();
    if (!hadMessageId && incomingMessageId) {
      target.replyTo.messageId = incomingMessageId;
      target.replyTo.authorName = incoming.replyTo.authorName || target.replyTo.authorName || "";
      target.replyTo.text = incoming.replyTo.text || target.replyTo.text || "";
      if (!target.replyTo.stanzaId && incoming.replyTo.stanzaId) target.replyTo.stanzaId = incoming.replyTo.stanzaId;
      changed = true;
    } else {
      if (!target.replyTo.stanzaId && incoming.replyTo.stanzaId) {
        target.replyTo.stanzaId = incoming.replyTo.stanzaId;
        changed = true;
      }
      if (!(target.replyTo.authorName || "").toString().trim() && (incoming.replyTo.authorName || "").toString().trim()) {
        target.replyTo.authorName = incoming.replyTo.authorName;
        changed = true;
      }
      if (!(target.replyTo.text || "").toString().trim() && (incoming.replyTo.text || "").toString().trim()) {
        target.replyTo.text = incoming.replyTo.text;
        changed = true;
      }
      if ((target.replyTo.text || "").toString().trim().toLowerCase() === "xmpp reply" && (incoming.replyTo.text || "").toString().trim()) {
        target.replyTo.text = incoming.replyTo.text;
        changed = true;
      }
    }
    if (!(target.replyTo.text || "").toString().trim()) {
      target.replyTo.text = "XMPP reply";
      changed = true;
    }
  }
  const currentAttachments = normalizeAttachments(target.attachments);
  const mergedAttachments = normalizeAttachments([
    ...currentAttachments,
    ...normalizeAttachments(incoming.attachments)
  ]);
  if (mergedAttachments.length !== currentAttachments.length) {
    target.attachments = mergedAttachments;
    changed = true;
  }
  const targetTs = toTimestampMs(target.ts);
  const incomingTs = toTimestampMs(incoming.ts);
  if (Number.isFinite(incomingTs) && (!Number.isFinite(targetTs) || incomingTs < targetTs)) {
    target.ts = incoming.ts;
    changed = true;
  }
  return changed;
}

function findDuplicateRelayMessage(bucket, candidate, { history = false } = {}) {
  if (!Array.isArray(bucket) || !candidate) return null;
  if (candidate.xmppStanzaId) {
    const byStanzaId = bucket.find((entry) => (entry?.xmppStanzaId || "") === candidate.xmppStanzaId) || null;
    if (byStanzaId) return byStanzaId;
  }
  const candidateRefIds = normalizeXmppRefIdsList(candidate.xmppRefIds);
  if (candidateRefIds.length > 0) {
    const byRef = bucket.find((entry) => xmppRefIdsOverlap(candidateRefIds, normalizeXmppRefIdsList(entry?.xmppRefIds))) || null;
    if (byRef) return byRef;
  }
  if (candidate.relayId) {
    const direct = bucket.find((entry) => (entry?.relayId || "") === candidate.relayId) || null;
    if (direct) return direct;
  }
  if (!history) {
    if (!candidate.xmppStanzaId && candidateRefIds.length === 0) return null;
    const candidateTs = toTimestampMs(candidate.ts);
    const candidateText = (candidate.text || "").toString().trim();
    const candidateAttachment = normalizeAttachments(candidate.attachments)[0]?.url || "";
    for (let i = bucket.length - 1; i >= 0; i -= 1) {
      const entry = bucket[i];
      if (!entry || entry.userId !== candidate.userId) continue;
      if ((entry.text || "").toString().trim() !== candidateText) continue;
      const entryAttachment = normalizeAttachments(entry.attachments)[0]?.url || "";
      if (entryAttachment !== candidateAttachment) continue;
      const entryTs = toTimestampMs(entry.ts);
      if (Number.isFinite(candidateTs) && Number.isFinite(entryTs) && Math.abs(candidateTs - entryTs) > 8000) continue;
      return entry;
    }
    return null;
  }
  const candidateTs = toTimestampMs(candidate.ts);
  const candidateText = (candidate.text || "").toString().trim();
  const candidateReplyId = (
    candidate.replyTo?.messageId
    || candidate.replyTo?.stanzaId
    || ""
  ).toString();
  const candidateAttachment = normalizeAttachments(candidate.attachments)[0]?.url || "";
  for (let i = bucket.length - 1; i >= 0; i -= 1) {
    const entry = bucket[i];
    if (!entry || entry.userId !== candidate.userId) continue;
    const entryTs = toTimestampMs(entry.ts);
    if (Number.isFinite(candidateTs) && Number.isFinite(entryTs) && Math.abs(candidateTs - entryTs) > 5000) continue;
    if ((entry.text || "").toString().trim() !== candidateText) continue;
    const entryReplyId = (
      entry.replyTo?.messageId
      || entry.replyTo?.stanzaId
      || ""
    ).toString();
    if (candidateReplyId && entryReplyId && entryReplyId !== candidateReplyId) continue;
    const entryAttachment = normalizeAttachments(entry.attachments)[0]?.url || "";
    if (entryAttachment !== candidateAttachment) continue;
    return entry;
  }
  return null;
}

function applyRelayIncomingMessage(packet) {
  const current = getCurrentAccount();
  if (!current) return null;
  const remoteClientId = (packet.clientId || "").toString();
  if (!remoteClientId || remoteClientId === relayClientId()) return null;
  const room = (packet.room || "").toString();
  clearRelayTypingForClient(room, remoteClientId);
  const remoteMessage = packet.message;
  if (!remoteMessage || typeof remoteMessage !== "object") return null;
  const remoteMessageId = (remoteMessage.id || "").toString().trim();
  const remoteXmppRefIds = normalizeXmppRefIdsList([
    ...(Array.isArray(remoteMessage.xmppRefIds) ? remoteMessage.xmppRefIds : []),
    remoteMessageId
  ]);
  const remoteAuthorJid = xmppBareJid(remoteMessage.authorJid || "");
  const relayId = `${remoteClientId}:${(remoteMessageId || createId()).toString()}`;
  const xmppStableRelayId = remoteClientId.startsWith("xmpp:") && remoteMessageId
    ? `xmpp-stable:${room}:${(remoteAuthorJid || normalizeUsername(remoteMessage.authorUsername || "") || remoteClientId).toLowerCase()}::${remoteMessageId}`
    : "";
  const xmppRoomStableId = remoteClientId.startsWith("xmpp:") && remoteMessageId && /^xmpp:/i.test(room)
    ? `xmpp-room-stable:${room}::${remoteMessageId}`
    : "";
  if (relaySeenMessageIds.has(relayId)) return null;
  if (xmppStableRelayId && relaySeenMessageIds.has(xmppStableRelayId)) return null;
  if (xmppRoomStableId && relaySeenMessageIds.has(xmppRoomStableId)) return null;
  if (remoteXmppRefIds.some((entry) => relaySeenMessageIds.has(`xmpp-ref:${room}:${entry}`))) return null;
  relaySeenMessageIds.add(relayId);
  if (xmppStableRelayId) relaySeenMessageIds.add(xmppStableRelayId);
  if (xmppRoomStableId) relaySeenMessageIds.add(xmppRoomStableId);
  remoteXmppRefIds.forEach((entry) => {
    relaySeenMessageIds.add(`xmpp-ref:${room}:${entry}`);
  });
  if (relaySeenMessageIds.size > 800) {
    const first = relaySeenMessageIds.values().next().value;
    relaySeenMessageIds.delete(first);
  }
  const username = normalizeUsername(remoteMessage.authorUsername || `relay_${remoteClientId.slice(0, 6)}`) || `relay_${remoteClientId.slice(0, 6)}`;
  let remoteAccount = remoteAuthorJid
    ? ensureAccountByXmppJid(remoteAuthorJid, remoteMessage.authorDisplay || remoteMessage.authorUsername || remoteAuthorJid.split("@")[0] || "")
    : getAccountByUsername(username);
  if (!remoteAccount) {
    remoteAccount = createAccount(username, remoteMessage.authorDisplay || username);
    state.accounts.push(remoteAccount);
  }
  if (remoteMessage.authorDisplay) {
    remoteAccount.displayName = decodeHtmlEntities(remoteMessage.authorDisplay.toString()).slice(0, 32) || remoteAccount.displayName;
  }
  if (remoteAuthorJid) remoteAccount.xmppJid = remoteAuthorJid;
  const historyMessage = remoteMessage.history === true;
  const replyMeta = remoteMessage.replyTo && typeof remoteMessage.replyTo === "object"
    ? {
        stanzaId: (remoteMessage.replyTo.stanzaId || "").toString().slice(0, 96),
        messageId: (remoteMessage.replyTo.messageId || "").toString().slice(0, 64),
        authorName: decodeHtmlEntities((remoteMessage.replyTo.authorName || "").toString()).slice(0, 60) || "message",
        text: (() => {
          const value = decodeHtmlEntities((remoteMessage.replyTo.text || "").toString()).slice(0, 180);
          return value.trim() ? value : "XMPP reply";
        })(),
        threadId: (remoteMessage.replyTo.threadId || "").toString().slice(0, 64) || null
      }
    : null;
  const entry = {
    id: createId(),
    relayId,
    xmppStanzaId: remoteClientId.startsWith("xmpp:") ? remoteMessageId : "",
    xmppRefIds: remoteClientId.startsWith("xmpp:") ? remoteXmppRefIds : [],
    xmppNick: remoteClientId.startsWith("xmpp:") ? (remoteMessage.authorDisplay || remoteMessage.authorUsername || "") : "",
    xmppEncrypted: remoteClientId.startsWith("xmpp:") ? Boolean(remoteMessage.xmppEncrypted) : false,
    xmppEncryptedType: remoteClientId.startsWith("xmpp:") ? (remoteMessage.xmppEncryptedType || "").toString() : "",
    xmppEncryptedLabel: remoteClientId.startsWith("xmpp:") ? (remoteMessage.xmppEncryptedLabel || "").toString() : "",
    xmppProcessingHints: remoteClientId.startsWith("xmpp:") && remoteMessage.xmppProcessingHints && typeof remoteMessage.xmppProcessingHints === "object"
      ? {
          store: Boolean(remoteMessage.xmppProcessingHints.store),
          noStore: Boolean(remoteMessage.xmppProcessingHints.noStore),
          noPermanentStore: Boolean(remoteMessage.xmppProcessingHints.noPermanentStore),
          noCopy: Boolean(remoteMessage.xmppProcessingHints.noCopy),
          noPermanentCopy: Boolean(remoteMessage.xmppProcessingHints.noPermanentCopy),
          hasHints: Boolean(remoteMessage.xmppProcessingHints.hasHints)
        }
      : null,
    userId: remoteAccount.id,
    authorName: "",
    text: clampMessageTextForStorage(decodeHtmlEntities((remoteMessage.text || "").toString())),
    ts: Number.isFinite(Date.parse(remoteMessage.ts || "")) ? new Date(remoteMessage.ts).toISOString() : new Date().toISOString(),
    reactions: [],
    attachments: normalizeAttachments(Array.isArray(remoteMessage.attachments) ? remoteMessage.attachments.slice(0, 6) : []),
    replyTo: replyMeta
  };
  if (room.startsWith("dm:")) {
    let dmPeerAccount = remoteAccount;
    if (dmPeerAccount?.id === current.id) {
      const existingThread = findDmThreadByRelayRoom(room, current);
      const existingPeerId = existingThread?.participantIds?.find((id) => id && id !== current.id) || "";
      const existingPeer = existingPeerId ? getAccountById(existingPeerId) : null;
      if (existingPeer?.id && existingPeer.id !== current.id) {
        dmPeerAccount = existingPeer;
      } else {
        const roomParts = room
          .slice(3)
          .split(":")
          .map((value) => normalizeUsername(value || ""))
          .filter(Boolean);
        const currentName = normalizeUsername(current.username || "");
        const peerName = roomParts.find((value) => value && value !== currentName) || "";
        if (peerName) {
          let peerAccount = getAccountByUsername(peerName);
          if (!peerAccount) {
            peerAccount = createAccount(peerName, peerName);
            state.accounts.push(peerAccount);
          }
          dmPeerAccount = peerAccount;
        }
      }
    }
    const thread = getOrCreateDmThread(current, dmPeerAccount);
    if (!thread) return null;
    const duplicate = findDuplicateRelayMessage(thread.messages, entry, { history: historyMessage });
    if (duplicate) {
      const changed = mergeRelayMessageEntry(duplicate, entry);
      if (changed) saveState();
      scheduleRelayUiRefresh({
        dms: !historyMessage,
        messages: !historyMessage && state.viewMode === "dm" && state.activeDmId === thread.id,
        delayMs: historyMessage ? 0 : RELAY_HISTORY_RENDER_BATCH_MS
      });
      return duplicate;
    }
    if (historyMessage) insertMessageByTimestamp(thread.messages, entry);
    else thread.messages.push(entry);
    ensureDmReadState(thread);
    saveState();
    scheduleRelayUiRefresh({
      dms: !historyMessage,
      messages: !historyMessage && state.viewMode === "dm" && state.activeDmId === thread.id,
      delayMs: historyMessage ? 0 : RELAY_HISTORY_RENDER_BATCH_MS
    });
    maybeHandleIncomingWebCallInvite({
      conversation: { type: "dm", thread, id: thread.id },
      message: entry,
      fromAccount: remoteAccount,
      history: historyMessage
    });
    return entry;
  }
  const targetChannel = findRelayTargetChannelByRoom(room) || resolveRelayTargetChannel();
  if (!targetChannel || targetChannel.type === "voice" || targetChannel.type === "stage") return null;
  ensureChannelReadState(targetChannel);
  const duplicate = findDuplicateRelayMessage(targetChannel.messages, entry, { history: historyMessage });
  if (duplicate) {
    const changed = mergeRelayMessageEntry(duplicate, entry);
    if (changed) saveState();
    scheduleRelayUiRefresh({
      channels: !historyMessage,
      servers: !historyMessage,
      messages: !historyMessage && state.activeChannelId === targetChannel.id,
      delayMs: historyMessage ? 0 : RELAY_HISTORY_RENDER_BATCH_MS
    });
    return duplicate;
  }
  if (historyMessage) insertMessageByTimestamp(targetChannel.messages, entry);
  else targetChannel.messages.push(entry);
  saveState();
  scheduleRelayUiRefresh({
    channels: !historyMessage,
    servers: !historyMessage,
    messages: !historyMessage && state.activeChannelId === targetChannel.id,
    delayMs: historyMessage ? 0 : RELAY_HISTORY_RENDER_BATCH_MS
  });
  maybeHandleIncomingWebCallInvite({
    conversation: { type: "channel", channel: targetChannel, id: targetChannel.id },
    message: entry,
    fromAccount: remoteAccount,
    history: historyMessage
  });
  return entry;
}
