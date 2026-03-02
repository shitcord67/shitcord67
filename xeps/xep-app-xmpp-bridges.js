/*
 * App-level XMPP/XEP bridge helpers extracted from app.js.
 * Functions here intentionally bind to app globals at call time.
 */

function xmppCapsIdentityStrings() {
  if (typeof XEP_0115_CAPS_PRESENCE_GLOBAL.xmppCapsIdentityStrings === "function") {
    return XEP_0115_CAPS_PRESENCE_GLOBAL.xmppCapsIdentityStrings();
  }
  return ["client/web//shitcord67"];
}

function xmppCapsFeatureStrings() {
  if (typeof XEP_0115_CAPS_PRESENCE_GLOBAL.xmppCapsFeatureStrings === "function") {
    return XEP_0115_CAPS_PRESENCE_GLOBAL.xmppCapsFeatureStrings(xmppClientDiscoFeatures());
  }
  return [...new Set(xmppClientDiscoFeatures())].sort();
}

async function computeXmppCapsHash() {
  if (typeof XEP_0115_CAPS_PRESENCE_GLOBAL.computeXmppCapsHash === "function") {
    return XEP_0115_CAPS_PRESENCE_GLOBAL.computeXmppCapsHash({
      identities: xmppCapsIdentityStrings(),
      features: xmppCapsFeatureStrings(),
      cryptoRef: typeof crypto === "undefined" ? null : crypto,
      TextEncoderRef: typeof TextEncoder === "undefined" ? null : TextEncoder
    });
  }
  if (typeof crypto === "undefined" || !crypto.subtle || typeof TextEncoder === "undefined") return "";
  const identities = xmppCapsIdentityStrings().slice().sort();
  const features = xmppCapsFeatureStrings();
  const summary = `${identities.map((id) => `${id}<`).join("")}${features.map((feature) => `${feature}<`).join("")}`;
  const bytes = new TextEncoder().encode(summary);
  const digest = await crypto.subtle.digest("SHA-1", bytes);
  const hashBytes = new Uint8Array(digest);
  let binary = "";
  hashBytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function ensureXmppCapsHash({ force = false } = {}) {
  if (typeof XEP_0115_CAPS_PRESENCE_GLOBAL.ensureXmppCapsHash === "function") {
    return XEP_0115_CAPS_PRESENCE_GLOBAL.ensureXmppCapsHash({ force }, {
      refs: {
        getCapsHash: () => xmppCapsHash,
        setCapsHash: (value) => { xmppCapsHash = (value || "").toString(); },
        getCapsPromise: () => xmppCapsPromise,
        setCapsPromise: (value) => { xmppCapsPromise = value; }
      },
      computeXmppCapsHashFn: computeXmppCapsHash,
      addXmppDebugEventFn: addXmppDebugEvent
    });
  }
  if (!force && xmppCapsHash) return Promise.resolve(xmppCapsHash);
  if (!force && xmppCapsPromise) return xmppCapsPromise;
  xmppCapsPromise = computeXmppCapsHash()
    .then((hash) => {
      xmppCapsHash = hash || "";
      if (xmppCapsHash) {
        addXmppDebugEvent("presence", "Computed XMPP caps hash", { ver: xmppCapsHash });
      } else {
        addXmppDebugEvent("presence", "Failed to compute XMPP caps hash");
      }
      return xmppCapsHash;
    })
    .finally(() => {
      xmppCapsPromise = null;
    });
  return xmppCapsPromise;
}

function xmppHistoryStatusLabel(mamState, { scope = "muc", target = "" } = {}) {
  if (typeof XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.xmppHistoryStatusLabel !== "function") return "";
  return XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.xmppHistoryStatusLabel(mamState, { scope, target });
}

function xmppReactionSignature(reactions) {
  return normalizeReactions(reactions)
    .map((entry) => `${entry.emoji}|${entry.userIds.join(",")}`)
    .join("||");
}

function xmppReactionEmojisForActor(message, actorUserId = "") {
  const actorId = (actorUserId || "").toString().trim();
  if (!actorId || !message) return [];
  return normalizeReactions(message.reactions)
    .filter((entry) => entry.userIds.includes(actorId))
    .map((entry) => (entry.emoji || "").toString().trim())
    .filter(Boolean)
    .slice(0, 8);
}

function handleJoinXmppCommand(rawRoomArg, account = getCurrentAccount(), { focus = false } = {}) {
  if (typeof XEP_0482_0503_SPACES_FLOW_GLOBAL.handleJoinXmppCommand !== "function") {
    return {
      ok: false,
      joined: false,
      roomJid: "",
      message: "Usage: /joinxmpp <room@conference.example.org>"
    };
  }
  return XEP_0482_0503_SPACES_FLOW_GLOBAL.handleJoinXmppCommand(rawRoomArg, account, { focus }, {
    normalizeXmppRoomJoinArgFn: normalizeXmppRoomJoinArg,
    xmppRoomByJid,
    upsertXmppRoomChannelFn: upsertXmppRoomChannel,
    getPreferencesFn: getPreferences,
    findGuildByChannelIdFn: findGuildByChannelId,
    state,
    joinXmppRoomFn: joinXmppRoom,
    relayStatus,
    sanitizeChannelNameFn: sanitizeChannelName,
    xmppPublishBookmarkFn: xmppPublishBookmark,
    saveStateFn: saveState,
    renderFn: render,
    renderChannelsFn: renderChannels
  });
}

function handleLeaveXmppCommand(rawRoomArg, account = getCurrentAccount()) {
  if (typeof XEP_0482_0503_SPACES_FLOW_GLOBAL.handleLeaveXmppCommand !== "function") {
    return {
      ok: false,
      roomJid: "",
      message: "Usage: /leavexmpp [room@conference.example.org]"
    };
  }
  return XEP_0482_0503_SPACES_FLOW_GLOBAL.handleLeaveXmppCommand(rawRoomArg, account, {
    normalizeXmppRoomJoinArgFn: normalizeXmppRoomJoinArg,
    xmppBareJidFn: xmppBareJid,
    getActiveChannelFn: getActiveChannel,
    removeXmppRoomChannelByJidFn: removeXmppRoomChannelByJid,
    getPreferencesFn: getPreferences,
    xmppRetractBookmarkFn: xmppRetractBookmark
  });
}

function xmppCallInviteSignal(session = null) {
  if (typeof XEP_0482_0503_SPACES_FLOW_GLOBAL.xmppCallInviteSignal !== "function") {
    return (session?.inviteSignal || "").toString().trim().toLowerCase();
  }
  return XEP_0482_0503_SPACES_FLOW_GLOBAL.xmppCallInviteSignal(session);
}

function xmppSessionIsMujiCallInvite(session = null) {
  if (typeof XEP_0482_0503_SPACES_FLOW_GLOBAL.xmppSessionIsMujiCallInvite !== "function") {
    return xmppCallInviteSignal(session) === "muji-call-invite";
  }
  return XEP_0482_0503_SPACES_FLOW_GLOBAL.xmppSessionIsMujiCallInvite(session);
}

function xmppSendMujiCallInviteActionForSession(session = null, action = "accept") {
  if (typeof XEP_0482_0503_SPACES_FLOW_GLOBAL.xmppSendMujiCallInviteActionForSession !== "function") return false;
  return XEP_0482_0503_SPACES_FLOW_GLOBAL.xmppSendMujiCallInviteActionForSession(session, action, {
    xmppBareJidFn: xmppBareJid,
    xmppSendCallInviteActionFn: xmppSendCallInviteAction
  });
}

function xmppKnownSpacesRooms(prefs = getPreferences()) {
  if (typeof XEP_0482_0503_SPACES_FLOW_GLOBAL.xmppKnownSpacesRooms !== "function") return [];
  return XEP_0482_0503_SPACES_FLOW_GLOBAL.xmppKnownSpacesRooms(prefs, {
    state,
    xmppBareJidFn: xmppBareJid,
    looksLikeXmppMucJidFn: looksLikeXmppMucJid,
    decodeHtmlEntitiesFn: decodeHtmlEntities,
    xmppRoomByJid
  });
}

function xmppSpacesRoomStateLabel(roomJid = "") {
  if (typeof XEP_0482_0503_SPACES_FLOW_GLOBAL.xmppSpacesRoomStateLabel !== "function") return "unknown";
  return XEP_0482_0503_SPACES_FLOW_GLOBAL.xmppSpacesRoomStateLabel(roomJid, {
    xmppBareJidFn: xmppBareJid,
    xmppMucJoinStateByRoomJid,
    xmppRoomByJid
  });
}

function xmppSpacesSummaryLines({ limit = 12, prefs = getPreferences() } = {}) {
  if (typeof XEP_0482_0503_SPACES_FLOW_GLOBAL.xmppSpacesSummaryLines !== "function") return [];
  return XEP_0482_0503_SPACES_FLOW_GLOBAL.xmppSpacesSummaryLines({ limit, prefs }, {
    state,
    xmppBareJidFn: xmppBareJid,
    looksLikeXmppMucJidFn: looksLikeXmppMucJid,
    decodeHtmlEntitiesFn: decodeHtmlEntities,
    xmppRoomByJid,
    xmppMucJoinStateByRoomJid
  });
}

function focusXmppSpacesGuild(account = getCurrentAccount(), prefs = getPreferences()) {
  if (typeof XEP_0482_0503_SPACES_FLOW_GLOBAL.focusXmppSpacesGuild !== "function") return false;
  return XEP_0482_0503_SPACES_FLOW_GLOBAL.focusXmppSpacesGuild(account, prefs, {
    ensureXmppSpacesGuildFn: ensureXmppSpacesGuild,
    isXmppBackedChannelFn: isXmppBackedChannel,
    state,
    saveStateFn: saveState,
    renderFn: render
  });
}

async function syncXmppSpacesNow({
  account = getCurrentAccount(),
  prefs = getPreferences(),
  forceDiscovery = false
} = {}) {
  if (typeof XEP_0482_0503_SPACES_FLOW_GLOBAL.syncXmppSpacesNow !== "function") {
    return {
      ok: false,
      message: "XMPP Spaces sync module unavailable."
    };
  }
  return XEP_0482_0503_SPACES_FLOW_GLOBAL.syncXmppSpacesNow({ account, prefs, forceDiscovery }, {
    xmppConnection,
    relayStatus,
    fetchXmppBookmarksFn: fetchXmppBookmarks,
    discoverXmppMucRoomsFn: discoverXmppMucRooms,
    mergeXmppBookmarksFn: mergeXmppBookmarks,
    upsertXmppSpaceChannelsFn: upsertXmppSpaceChannels,
    xmppBareJidFn: xmppBareJid,
    joinXmppRoomFn: joinXmppRoom,
    state,
    looksLikeXmppMucJidFn: looksLikeXmppMucJid,
    decodeHtmlEntitiesFn: decodeHtmlEntities,
    xmppRoomByJid,
    xmppMucJoinStateByRoomJid
  });
}

function handleSlashCommand(rawText, channel, account) {
  if (typeof XEP_SLASH_COMMAND_RUNTIME_GLOBAL.handleSlashCommandRuntime !== "function") return false;
  return XEP_SLASH_COMMAND_RUNTIME_GLOBAL.handleSlashCommandRuntime(rawText, channel, account);
}

async function fetchWithTimeout(url, timeoutMs = XMPP_HOST_META_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), Math.max(1200, timeoutMs));
  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

async function discoverXmppWsViaHostMeta(jid, { force = false, timeoutMs = XMPP_HOST_META_TIMEOUT_MS } = {}) {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.discoverXmppWsViaHostMeta !== "function") return [];
  return XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.discoverXmppWsViaHostMeta(jid, { force, timeoutMs });
}

async function validateXmppViaLocalGateway({ jid, password, candidates, timeoutMs = 10000 }) {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.validateXmppViaLocalGateway !== "function") return null;
  return XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.validateXmppViaLocalGateway({ jid, password, candidates, timeoutMs });
}

async function registerXmppViaLocalGateway({ jid, password, wsUrl = "", timeoutMs = 12000 }) {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.registerXmppViaLocalGateway !== "function") {
    return { ok: false, error: "XMPP registration runtime unavailable.", wsUrl: "" };
  }
  return XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.registerXmppViaLocalGateway({ jid, password, wsUrl, timeoutMs });
}

function classifyNoWebsocketEndpointHint(failures = []) {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.classifyNoWebsocketEndpointHint !== "function") return "";
  return XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.classifyNoWebsocketEndpointHint(failures);
}

function looksLikeCompleteJid(jid) {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.looksLikeCompleteJid !== "function") return false;
  return XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.looksLikeCompleteJid(jid);
}

function knownXmppWsForDomain(domain) {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.knownXmppWsForDomain !== "function") return "";
  return XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.knownXmppWsForDomain(domain);
}

function resolveXmppWsCandidates(jid, explicitWs = "") {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.resolveXmppWsCandidates !== "function") return [];
  return XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.resolveXmppWsCandidates(jid, explicitWs);
}

function inferXmppWsUrlFromJid(jid) {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.inferXmppWsUrlFromJid !== "function") return "";
  return XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.inferXmppWsUrlFromJid(jid);
}

async function maybeDiscoverLoginXmppWsUrl(jid) {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.maybeDiscoverLoginXmppWsUrl !== "function") return;
  return XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.maybeDiscoverLoginXmppWsUrl(jid);
}

function clearLoginXmppProgressTimer() {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.clearLoginXmppProgressTimer !== "function") return;
  XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.clearLoginXmppProgressTimer();
}

function formatElapsedTimer(ms) {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.formatElapsedTimer !== "function") return "0:00";
  return XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.formatElapsedTimer(ms);
}

function updateLoginXmppProgressTimer() {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.updateLoginXmppProgressTimer !== "function") return;
  XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.updateLoginXmppProgressTimer();
}

function setLoginXmppProgress({
  visible = true,
  state = "",
  status = "",
  detail = ""
} = {}) {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.setLoginXmppProgress !== "function") return;
  XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.setLoginXmppProgress({ visible, state, status, detail });
}

function resetLoginXmppProgress() {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.resetLoginXmppProgress !== "function") return;
  XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.resetLoginXmppProgress();
}

function beginLoginXmppProgress() {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.beginLoginXmppProgress !== "function") return;
  XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.beginLoginXmppProgress();
}

function applyLoginXmppProgressEvent(event) {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.applyLoginXmppProgressEvent !== "function") return;
  XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.applyLoginXmppProgressEvent(event);
}

function parseLoginIdentity(rawUsername, explicitJid = "") {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.parseLoginIdentity !== "function") {
    return {
      accountUsername: normalizeUsername(rawUsername),
      accountDisplay: (rawUsername || "").toString().trim().slice(0, 32),
      xmppJid: normalizeXmppJid(explicitJid || "")
    };
  }
  return XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.parseLoginIdentity(rawUsername, explicitJid);
}

function renderXmppProviderList() {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.renderXmppProviderList !== "function") return;
  XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.renderXmppProviderList();
}

function syncLoginFieldsFromSessionPrefs() {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.syncLoginFieldsFromSessionPrefs !== "function") return;
  XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.syncLoginFieldsFromSessionPrefs();
}

function openXmppRegisterDialog() {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.openXmppRegisterDialog !== "function") return;
  XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.openXmppRegisterDialog();
}

function normalizeLocalXmppProfiles(raw) {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.normalizeLocalXmppProfiles !== "function") {
    return normalizeLocalXmppProfilesViaModule(raw);
  }
  return XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.normalizeLocalXmppProfiles(raw);
}

function renderLocalXmppProfileSelect() {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.renderLocalXmppProfileSelect !== "function") return;
  XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.renderLocalXmppProfileSelect();
}

function applyLocalXmppProfileById(profileId) {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.applyLocalXmppProfileById !== "function") return false;
  return XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.applyLocalXmppProfileById(profileId);
}

async function loadLocalXmppProfiles() {
  if (typeof XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.loadLocalXmppProfiles !== "function") return false;
  return XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME_GLOBAL.loadLocalXmppProfiles();
}
