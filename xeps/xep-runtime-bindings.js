/*
 * XEP/runtime binding bridge extracted from app.js.
 * Keeps fallback wiring for XEP helpers and normalizer modules.
 */

const RUNTIME_APP_BOOTSTRAP = globalThis.SHITCORD67_XEP_APP_BOOTSTRAP || {};
const XEP_REGISTRY = globalThis.SHITCORD67_XEP_REGISTRY || {};
const xepModule = (name, fallback = null) => (
  (typeof XEP_REGISTRY.get === "function" ? XEP_REGISTRY.get(name) : null)
  || fallback
  || {}
);
const XEP_0334_HINTS_BINDINGS = RUNTIME_APP_BOOTSTRAP.XEP_0334_HINTS_GLOBAL || globalThis.SHITCORD67_XEP_0334_HINTS || {};
const XEP_0184_0333_BINDINGS = RUNTIME_APP_BOOTSTRAP.XEP_0184_0333_GLOBAL || globalThis.SHITCORD67_XEP_0184_0333_MARKERS || {};
const XEP_0249_DIRECT_MUC_INVITE_BINDINGS = RUNTIME_APP_BOOTSTRAP.XEP_0249_DIRECT_MUC_INVITE_GLOBAL || globalThis.SHITCORD67_XEP_0249_DIRECT_MUC_INVITE || {};
const XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS = RUNTIME_APP_BOOTSTRAP.XEP_0045_0402_ROSTER_BOOKMARKS_GLOBAL || globalThis.SHITCORD67_XEP_0045_0402_ROSTER_BOOKMARKS || {};
const XEP_0359_0424_MESSAGE_REF_UTILS_BINDINGS = RUNTIME_APP_BOOTSTRAP.XEP_0359_0424_MESSAGE_REF_UTILS_GLOBAL || globalThis.SHITCORD67_XEP_0359_0424_MESSAGE_REF_UTILS || {};
const XEP_0482_CALL_INVITE_PARSE_BINDINGS = RUNTIME_APP_BOOTSTRAP.XEP_0482_CALL_INVITE_PARSE_GLOBAL || globalThis.SHITCORD67_XEP_0482_CALL_INVITE_PARSE || {};
const XEP_0308_0424_0444_BINDINGS = RUNTIME_APP_BOOTSTRAP.XEP_0308_0424_0444_GLOBAL || globalThis.SHITCORD67_XEP_0308_0424_0444_ACTIONS || {};
const XEP_0353_JINGLE_MESSAGE_PARSE_BINDINGS = RUNTIME_APP_BOOTSTRAP.XEP_0353_JINGLE_MESSAGE_PARSE_GLOBAL || globalThis.SHITCORD67_XEP_0353_JINGLE_MESSAGE_PARSE || {};
const XEP_0166_0167_JINGLE_IQ_PARSE_BINDINGS = RUNTIME_APP_BOOTSTRAP.XEP_0166_0167_JINGLE_IQ_PARSE_GLOBAL || globalThis.SHITCORD67_XEP_0166_0167_JINGLE_IQ_PARSE || {};
const XEP_0320_WEBRTC_SDP_BASICS_BINDINGS = RUNTIME_APP_BOOTSTRAP.XEP_0320_WEBRTC_SDP_BASICS_GLOBAL || globalThis.SHITCORD67_XEP_0320_WEBRTC_SDP_BASICS || {};
const XEP_0203_0319_DELAY_IDLE_BINDINGS = RUNTIME_APP_BOOTSTRAP.XEP_0203_0319_DELAY_IDLE_GLOBAL || globalThis.SHITCORD67_XEP_0203_0319_DELAY_IDLE || {};
const XEP_0421_0045_MUC_OCCUPANT_BINDINGS = RUNTIME_APP_BOOTSTRAP.XEP_0421_0045_MUC_OCCUPANT_GLOBAL || globalThis.SHITCORD67_XEP_0421_0045_MUC_OCCUPANT || {};
const XEP_0153_PRESENCE_PHOTO_HASH_BINDINGS = RUNTIME_APP_BOOTSTRAP.XEP_0153_PRESENCE_PHOTO_HASH_GLOBAL || globalThis.SHITCORD67_XEP_0153_PRESENCE_PHOTO_HASH || {};
const XEP_0156_HOST_META_PARSE_BINDINGS = RUNTIME_APP_BOOTSTRAP.XEP_0156_HOST_META_PARSE_GLOBAL || globalThis.SHITCORD67_XEP_0156_HOST_META_PARSE || {};
const XMPP_XML_BINDINGS = RUNTIME_APP_BOOTSTRAP.XMPP_XML_GLOBAL || globalThis.SHITCORD67_XMPP_XML || {};
const XMPP_ENCRYPTION_PAYLOAD_BINDINGS = RUNTIME_APP_BOOTSTRAP.XMPP_ENCRYPTION_PAYLOAD_GLOBAL || globalThis.SHITCORD67_XMPP_ENCRYPTION_PAYLOAD || {};
const CALL_ROOM_URL_UTILS_BINDINGS = globalThis.SHITCORD67_CALL_ROOM_URL_UTILS || {};

const XMPP_LOGIN_NORMALIZERS_GLOBAL = globalThis.SHITCORD67_XMPP_LOGIN_NORMALIZERS || {};
const MEDIA_PROVIDER_NORMALIZERS_GLOBAL = globalThis.SHITCORD67_MEDIA_PROVIDER_NORMALIZERS || {};
const UI_STATE_NORMALIZERS_GLOBAL = globalThis.SHITCORD67_UI_STATE_NORMALIZERS || {};
const ACCOUNT_PROFILE_NORMALIZERS_GLOBAL = globalThis.SHITCORD67_ACCOUNT_PROFILE_NORMALIZERS || {};
const XMPP_CALL_TARGET_UTILS_GLOBAL = globalThis.SHITCORD67_XMPP_CALL_TARGET_UTILS || {};
const COMMAND_INVOCATION_UTILS_GLOBAL = globalThis.SHITCORD67_COMMAND_INVOCATION_UTILS || {};
const XMPP_MESSAGE_ID_UTILS_GLOBAL = globalThis.SHITCORD67_XMPP_MESSAGE_ID_UTILS || {};
const TEXT_TIME_UTILS_GLOBAL = globalThis.SHITCORD67_TEXT_TIME_UTILS || {};
const NAME_NORMALIZERS_GLOBAL = globalThis.SHITCORD67_NAME_NORMALIZERS || {};
const XEP_0384_GLOBAL = globalThis.SHITCORD67_XEP_0384 || {};
const XEP_0384_CRYPTO_UTILS_GLOBAL = XEP_0384_GLOBAL.cryptoUtils || globalThis.SHITCORD67_XEP_0384_CRYPTO_UTILS || {};
const XEP_0384_NAMESPACE_SELECTION_GLOBAL = XEP_0384_GLOBAL.namespaceSelection || globalThis.SHITCORD67_XEP_0384_NAMESPACE_SELECTION || {};
const XEP_0384_OMEMO_STORE_GLOBAL = XEP_0384_GLOBAL.store || globalThis.SHITCORD67_XEP_0384_OMEMO_STORE || {};
const XEP_0384_RUNTIME_GLOBAL = XEP_0384_GLOBAL.runtime || globalThis.SHITCORD67_XEP_0384_RUNTIME || {};
const XEP_0384_PREFERENCES_GLOBAL = XEP_0384_GLOBAL.preferences || globalThis.SHITCORD67_XEP_0384_PREFERENCES || {};
const XEP_0384_IDENTITY_GLOBAL = XEP_0384_GLOBAL.identity || globalThis.SHITCORD67_XEP_0384_IDENTITY || {};
const XEP_0384_SESSIONS_GLOBAL = XEP_0384_GLOBAL.sessions || globalThis.SHITCORD67_XEP_0384_SESSIONS || {};
const XEP_0384_DEVICES_GLOBAL = XEP_0384_GLOBAL.devices || globalThis.SHITCORD67_XEP_0384_DEVICES || {};
const XEP_0384_BUNDLES_GLOBAL = XEP_0384_GLOBAL.bundles || globalThis.SHITCORD67_XEP_0384_BUNDLES || {};
const XEP_0384_OWN_BUNDLE_GLOBAL = XEP_0384_GLOBAL.ownBundle || globalThis.SHITCORD67_XEP_0384_OWN_BUNDLE || {};
const XEP_0384_TARGETS_GLOBAL = XEP_0384_GLOBAL.targets || globalThis.SHITCORD67_XEP_0384_TARGETS || {};
const XEP_0384_MESSAGE_CRYPTO_GLOBAL = XEP_0384_GLOBAL.messageCrypto || globalThis.SHITCORD67_XEP_0384_MESSAGE_CRYPTO || {};
const XEP_0384_DECRYPT_CONTENT_GLOBAL = XEP_0384_GLOBAL.decryptContent || globalThis.SHITCORD67_XEP_0384_DECRYPT_CONTENT || {};
const XEP_0384_DECRYPT_FLOW_GLOBAL = XEP_0384_GLOBAL.decryptFlow || globalThis.SHITCORD67_XEP_0384_DECRYPT_FLOW || {};
const xmppOmemoBuildNamespaceCandidates = XEP_0384_NAMESPACE_SELECTION_GLOBAL.xmppOmemoBuildNamespaceCandidates || function xmppOmemoBuildNamespaceCandidatesFallback({
  cachedPreferred = "",
  discoFeatures = new Set(),
  includeLegacy = true
} = {}) {
  const supportsV2 = discoFeatures.has(XMPP_OMEMO_NAMESPACE_V2)
    || discoFeatures.has(XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE_V2)
    || discoFeatures.has(XMPP_OMEMO_DEVICELIST_NODE_V2);
  const list = [];
  const append = (namespace) => {
    const value = (namespace || "").toString().trim();
    if (!value || list.includes(value)) return;
    if (!includeLegacy && value === XMPP_OMEMO_NAMESPACE) return;
    list.push(value);
  };
  if (supportsV2) append(XMPP_OMEMO_NAMESPACE_V2);
  append(cachedPreferred);
  XMPP_OMEMO_NAMESPACES.forEach(append);
  if (list.length === 0) append(XMPP_OMEMO_NAMESPACE);
  return list;
};
const xmppOmemoSelectNamespaceForSend = XEP_0384_NAMESPACE_SELECTION_GLOBAL.xmppOmemoSelectNamespaceForSend || function xmppOmemoSelectNamespaceForSendFallback(preferredNamespaces = []) {
  const supported = (Array.isArray(preferredNamespaces) ? preferredNamespaces : [preferredNamespaces])
    .map((entry) => (entry || "").toString().trim())
    .filter(Boolean);
  if (supported.length === 0) return XMPP_OMEMO_NAMESPACE;
  if (supported.every((namespace) => namespace === XMPP_OMEMO_NAMESPACE_V2)) return XMPP_OMEMO_NAMESPACE_V2;
  return XMPP_OMEMO_NAMESPACE;
};
const base64ToArrayBuffer = XEP_0384_CRYPTO_UTILS_GLOBAL.base64ToArrayBuffer || function base64ToArrayBufferFallback(base64) {
  const cleaned = (base64 || "").toString().trim();
  if (!cleaned) return new ArrayBuffer(0);
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};
const arrayBufferToBase64 = XEP_0384_CRYPTO_UTILS_GLOBAL.arrayBufferToBase64 || function arrayBufferToBase64Fallback(buffer) {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};
const concatArrayBuffers = XEP_0384_CRYPTO_UTILS_GLOBAL.concatArrayBuffers || function concatArrayBuffersFallback(first, second) {
  const a = first ? new Uint8Array(first) : new Uint8Array(0);
  const b = second ? new Uint8Array(second) : new Uint8Array(0);
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out.buffer;
};
const XmppOmemoStore = XEP_0384_OMEMO_STORE_GLOBAL.XmppOmemoStore || null;
const xmppOmemoRuntimeAvailable = XEP_0384_RUNTIME_GLOBAL.xmppOmemoRuntimeAvailable || function xmppOmemoRuntimeAvailableFallback() {
  return Boolean(globalThis.libsignal && globalThis.libsignal.KeyHelper && globalThis.crypto?.subtle);
};
const ensureXmppOmemoRuntime = XEP_0384_RUNTIME_GLOBAL.ensureLibsignalLoaded || function ensureXmppOmemoRuntimeFallback() {
  return Promise.resolve(false);
};
const createXmppOmemoStoreRegistry = XEP_0384_RUNTIME_GLOBAL.createXmppOmemoStoreRegistry || function createXmppOmemoStoreRegistryFallback() {
  const storesByBareJid = new Map();
  return Object.freeze({
    getStoreForAccount(jid, {
      toBareJid = (value) => xmppBareJid(value || ""),
      StoreCtor = XmppOmemoStore
    } = {}) {
      const bare = typeof toBareJid === "function" ? toBareJid(jid) : xmppBareJid(jid || "");
      if (!bare || !StoreCtor) return null;
      if (!storesByBareJid.has(bare)) {
        storesByBareJid.set(bare, new StoreCtor(bare));
      }
      return storesByBareJid.get(bare) || null;
    }
  });
};
const xmppOmemoStoreRegistry = createXmppOmemoStoreRegistry();
const xmppOmemoEnabledForPeerFromPrefs = XEP_0384_PREFERENCES_GLOBAL.xmppOmemoEnabledForPeer || function xmppOmemoEnabledForPeerFromPrefsFallback(peerBare, prefs = {}, normalizeToggleFn = (value) => value) {
  const enabled = prefs?.xmppOmemoEnabledByJid?.[peerBare];
  return normalizeToggleFn(enabled) === "on";
};
const xmppOmemoApplyPeerEnabled = XEP_0384_PREFERENCES_GLOBAL.xmppOmemoApplyPeerEnabled || function xmppOmemoApplyPeerEnabledFallback(prefs = {}, peerBare, enabled, normalizeToggleFn = (value) => value) {
  if (!peerBare) return prefs;
  return {
    ...prefs,
    xmppOmemoEnabledByJid: {
      ...(prefs?.xmppOmemoEnabledByJid || {}),
      [peerBare]: normalizeToggleFn(enabled ? "on" : "off")
    }
  };
};
const xmppOmemoEnsureLocalIdentityCore = XEP_0384_IDENTITY_GLOBAL.xmppOmemoEnsureLocalIdentityCore || (async () => null);
const xmppOmemoEnsureSessionCore = XEP_0384_SESSIONS_GLOBAL.xmppOmemoEnsureSessionCore || (async () => false);
const xmppOmemoEnsurePeerSessionsCore = XEP_0384_SESSIONS_GLOBAL.xmppOmemoEnsurePeerSessionsCore || (async () => []);
const xmppOmemoFetchDeviceListCore = XEP_0384_DEVICES_GLOBAL.xmppOmemoFetchDeviceListCore || (async () => []);
const xmppOmemoPublishDeviceListCore = XEP_0384_DEVICES_GLOBAL.xmppOmemoPublishDeviceListCore || (async () => false);
const xmppOmemoHandlePubsubEventCore = XEP_0384_DEVICES_GLOBAL.xmppOmemoHandlePubsubEventCore || (() => ({ handled: false, jid: "", changed: false }));
const xmppOmemoPublishBundleCore = XEP_0384_BUNDLES_GLOBAL.xmppOmemoPublishBundleCore || (async () => false);
const xmppOmemoFetchBundleCore = XEP_0384_BUNDLES_GLOBAL.xmppOmemoFetchBundleCore || (async () => null);
const xmppOmemoEnsureOwnBundleCore = XEP_0384_OWN_BUNDLE_GLOBAL.xmppOmemoEnsureOwnBundleCore || (async () => false);
const xmppOmemoGatherDeviceTargetsCore = XEP_0384_TARGETS_GLOBAL.xmppOmemoGatherDeviceTargetsCore || (async () => []);
const xmppOmemoEncryptPlaintextContentCore = XEP_0384_MESSAGE_CRYPTO_GLOBAL.xmppOmemoEncryptPlaintextContent || (async () => null);
const xmppOmemoDecryptContentFromKeyAndPayloadCore = XEP_0384_DECRYPT_CONTENT_GLOBAL.xmppOmemoDecryptContentFromKeyAndPayload || (async () => null);
const xmppOmemoTryDecryptIntoMessageCore = XEP_0384_DECRYPT_FLOW_GLOBAL.xmppOmemoTryDecryptIntoMessageCore || (() => {});
const appendXmppMessageProcessingHints = typeof XEP_0334_HINTS_BINDINGS.appendXmppMessageProcessingHints === "function"
  ? XEP_0334_HINTS_BINDINGS.appendXmppMessageProcessingHints
  : ((stanza) => stanza);
const xmppProcessingHintsFromStanza = typeof XEP_0334_HINTS_BINDINGS.xmppProcessingHintsFromStanza === "function"
  ? XEP_0334_HINTS_BINDINGS.xmppProcessingHintsFromStanza
  : (() => ({
    store: false,
    noStore: false,
    noPermanentStore: false,
    noCopy: false,
    noPermanentCopy: false,
    hasHints: false
  }));
const normalizeXmppProcessingHintsViaXep = typeof XEP_0334_HINTS_BINDINGS.normalizeXmppProcessingHints === "function"
  ? XEP_0334_HINTS_BINDINGS.normalizeXmppProcessingHints
  : (() => null);
const xmppReceiptRequestNode = typeof XEP_0184_0333_BINDINGS.xmppReceiptRequestNode === "function"
  ? XEP_0184_0333_BINDINGS.xmppReceiptRequestNode
  : (() => null);
const xmppReceiptReceivedId = typeof XEP_0184_0333_BINDINGS.xmppReceiptReceivedId === "function"
  ? XEP_0184_0333_BINDINGS.xmppReceiptReceivedId
  : (() => "");
const xmppChatMarkerPayload = typeof XEP_0184_0333_BINDINGS.xmppChatMarkerPayload === "function"
  ? XEP_0184_0333_BINDINGS.xmppChatMarkerPayload
  : (() => null);
const xmppChatMarkableNode = typeof XEP_0184_0333_BINDINGS.xmppChatMarkableNode === "function"
  ? XEP_0184_0333_BINDINGS.xmppChatMarkableNode
  : (() => null);
const parseXmppDirectMucInvite = typeof XEP_0249_DIRECT_MUC_INVITE_BINDINGS.parseXmppDirectMucInvite === "function"
  ? XEP_0249_DIRECT_MUC_INVITE_BINDINGS.parseXmppDirectMucInvite
  : (() => null);
const normalizeXmppRoomJoinArg = typeof XEP_0249_DIRECT_MUC_INVITE_BINDINGS.normalizeXmppRoomJoinArg === "function"
  ? ((rawArg = "") => XEP_0249_DIRECT_MUC_INVITE_BINDINGS.normalizeXmppRoomJoinArg(rawArg, { bareJidFn: xmppBareJid }))
  : ((rawArg = "") => xmppBareJid((rawArg || "").toString().trim().replace(/^xmpp:/i, "")));
const parseXmppDirectMucInviteCommandArg = typeof XEP_0249_DIRECT_MUC_INVITE_BINDINGS.parseXmppDirectMucInviteCommandArg === "function"
  ? ((rawArg = "") => XEP_0249_DIRECT_MUC_INVITE_BINDINGS.parseXmppDirectMucInviteCommandArg(rawArg, {
    decodeHtmlEntitiesFn: decodeHtmlEntities,
    normalizeRoomJoinArgFn: normalizeXmppRoomJoinArg
  }))
  : ((rawArg = "") => {
    const [roomTokenRaw, reasonRaw = "", passwordRaw = ""] = (rawArg || "").toString().split("|");
    const roomJid = normalizeXmppRoomJoinArg(roomTokenRaw);
    const reason = decodeHtmlEntities((reasonRaw || "").toString()).replace(/\s+/g, " ").trim().slice(0, 280);
    const password = (passwordRaw || "").toString().trim().slice(0, 120);
    return { roomJid, reason, password };
  });
const rememberXmppDirectMucInviteSeenViaXep = typeof XEP_0249_DIRECT_MUC_INVITE_BINDINGS.rememberXmppDirectMucInviteSeen === "function"
  ? ((key = "") => XEP_0249_DIRECT_MUC_INVITE_BINDINGS.rememberXmppDirectMucInviteSeen(key, {
    seenKeys: xmppSeenDirectMucInviteKeys,
    maxEntries: XMPP_DIRECT_MUC_INVITE_SEEN_MAX
  }))
  : (() => true);
const parseXmppCallInviteAction = typeof XEP_0482_CALL_INVITE_PARSE_BINDINGS.parseXmppCallInviteAction === "function"
  ? XEP_0482_CALL_INVITE_PARSE_BINDINGS.parseXmppCallInviteAction
  : (() => null);
const normalizeCallInviteUrlViaXep = typeof XEP_0482_CALL_INVITE_PARSE_BINDINGS.normalizeCallInviteUrl === "function"
  ? ((rawUrl = "") => XEP_0482_CALL_INVITE_PARSE_BINDINGS.normalizeCallInviteUrl(rawUrl, { resolveMediaUrlFn: resolveMediaUrl }))
  : ((rawUrl = "") => {
    const cleaned = resolveMediaUrl((rawUrl || "").toString().trim());
    return /^https?:\/\//i.test(cleaned) ? cleaned : "";
  });
const stripTrailingUrlPunctuationViaXep = typeof XEP_0482_CALL_INVITE_PARSE_BINDINGS.stripTrailingUrlPunctuation === "function"
  ? XEP_0482_CALL_INVITE_PARSE_BINDINGS.stripTrailingUrlPunctuation
  : ((value = "") => (value || "").toString().replace(/[)\].,!?]+$/g, ""));
const looksLikeConferenceCallUrlViaXep = typeof XEP_0482_CALL_INVITE_PARSE_BINDINGS.looksLikeConferenceCallUrl === "function"
  ? ((rawUrl = "") => XEP_0482_CALL_INVITE_PARSE_BINDINGS.looksLikeConferenceCallUrl(rawUrl, {
    normalizeCallInviteUrlFn: normalizeCallInviteUrlViaXep
  }))
  : (() => false);
const parseCallInviteFromTextViaXep = typeof XEP_0482_CALL_INVITE_PARSE_BINDINGS.parseCallInviteFromText === "function"
  ? ((text = "") => XEP_0482_CALL_INVITE_PARSE_BINDINGS.parseCallInviteFromText(text, {
    normalizeCallInviteUrlFn: normalizeCallInviteUrlViaXep,
    stripTrailingUrlPunctuationFn: stripTrailingUrlPunctuationViaXep,
    looksLikeConferenceCallUrlFn: looksLikeConferenceCallUrlViaXep,
    normalizeConferenceProviderUrlFn: normalizeConferenceProviderUrl,
    callProviderUrl: getPreferences().callProviderUrl
  }))
  : (() => null);
const buildWebCallInviteTokenViaXep = typeof XEP_0482_CALL_INVITE_PARSE_BINDINGS.buildWebCallInviteToken === "function"
  ? ((payload = {}) => XEP_0482_CALL_INVITE_PARSE_BINDINGS.buildWebCallInviteToken({
    ...payload,
    shortHashTokenFn: shortHashToken
  }))
  : (() => "");
const markWebCallInviteSeenViaXep = typeof XEP_0482_CALL_INVITE_PARSE_BINDINGS.markWebCallInviteSeen === "function"
  ? ((token) => XEP_0482_CALL_INVITE_PARSE_BINDINGS.markWebCallInviteSeen(token, {
    seenTokens: webCallInviteSeenTokens,
    maxEntries: WEB_CALL_INVITE_SEEN_MAX
  }))
  : (() => {});
const parseXmppRosterItemsViaXep = typeof XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.parseXmppRosterItems === "function"
  ? XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.parseXmppRosterItems
  : (() => []);
const parseXmppBookmarksViaXep = typeof XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.parseXmppBookmarks === "function"
  ? ((stanza) => XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.parseXmppBookmarks(stanza, {
    normalizeXmppJidFn: normalizeXmppJid,
    serializePayloadFn: xmppSerializePayload
  }))
  : (() => []);
const mergeXmppBookmarksViaXep = typeof XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.mergeXmppBookmarks === "function"
  ? ((...lists) => XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.mergeXmppBookmarks(lists, { normalizeXmppJidFn: normalizeXmppJid }))
  : ((...lists) => lists.flat().filter(Boolean));
const xmppBareJidViaXep = typeof XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.xmppBareJid === "function"
  ? ((value) => XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.xmppBareJid(value, { normalizeXmppJidFn: normalizeXmppJid }))
  : ((value = "") => normalizeXmppJid((value || "").toString().split("/")[0] || "").toLowerCase());
const xmppRoomNodeForTokenViaXep = typeof XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.xmppRoomNodeForToken === "function"
  ? ((roomToken) => XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.xmppRoomNodeForToken(roomToken, { sanitizeChannelNameFn: sanitizeChannelName }))
  : ((roomToken) => sanitizeChannelName((roomToken || "").toString().replace(/[:]/g, "-"), "lobby-general"));
const looksLikeXmppMucJidViaXep = typeof XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.looksLikeXmppMucJid === "function"
  ? ((roomJid, prefs = getPreferences()) => XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.looksLikeXmppMucJid(roomJid, {
    bareJidFn: xmppBareJid,
    resolveXmppMucServiceFn: () => resolveXmppMucService(prefs)
  }))
  : (() => false);
const isXmppMucRoomJidViaXep = typeof XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.isXmppMucRoomJid === "function"
  ? ((roomJid, prefs = getPreferences()) => XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.isXmppMucRoomJid(roomJid, {
    bareJidFn: xmppBareJid,
    looksLikeXmppMucJidFn: (value) => looksLikeXmppMucJidViaXep(value, prefs),
    isKnownXmppRoomJidFn: (value) => isKnownXmppRoomJid(value, prefs)
  }))
  : (() => false);
const xmppRoomJidForTokenViaXep = typeof XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.xmppRoomJidForToken === "function"
  ? ((roomToken, prefs = getPreferences()) => XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.xmppRoomJidForToken(roomToken, {
    bareJidFn: xmppBareJid,
    resolveXmppMucServiceFn: () => resolveXmppMucService(prefs),
    roomNodeForTokenFn: (token) => xmppRoomNodeForTokenViaXep(token)
  }))
  : (() => "");
const xmppStanzaErrorDetailsViaXep = typeof XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.xmppStanzaErrorDetails === "function"
  ? ((stanza) => XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.xmppStanzaErrorDetails(stanza, {
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
    xmppNodeTextFn: xmppNodeText
  }))
  : (() => null);
const xmppMucJoinErrorHintViaXep = typeof XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.xmppMucJoinErrorHint === "function"
  ? XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.xmppMucJoinErrorHint
  : (() => "");
const xmppChannelDisplayNameViaXep = typeof XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.xmppChannelDisplayName === "function"
  ? ((channel) => XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.xmppChannelDisplayName(channel, {
    isXmppBackedChannelFn: isXmppBackedChannel,
    decodeHtmlEntitiesFn: decodeHtmlEntities,
    bareJidFn: xmppBareJid
  }))
  : (() => "");
const xmppChannelDescriptionViaXep = typeof XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.xmppChannelDescription === "function"
  ? ((channel) => XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.xmppChannelDescription(channel, {
    isXmppBackedChannelFn: isXmppBackedChannel,
    decodeHtmlEntitiesFn: decodeHtmlEntities
  }))
  : (() => "");
const findXmppRoomChannelByJidViaXep = typeof XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.findXmppRoomChannelByJid === "function"
  ? ((roomJid) => XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.findXmppRoomChannelByJid(roomJid, {
    bareJidFn: xmppBareJid,
    guilds: state.guilds || []
  }))
  : (() => null);
const isKnownXmppRoomJidViaXep = typeof XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.isKnownXmppRoomJid === "function"
  ? ((roomJid, prefs = getPreferences()) => XEP_0045_0402_ROSTER_BOOKMARKS_BINDINGS.isKnownXmppRoomJid(roomJid, {
    bareJidFn: xmppBareJid,
    looksLikeXmppMucJidFn: (value) => looksLikeXmppMucJid(value, prefs),
    xmppRoomByJid,
    findXmppRoomChannelByJidFn: (value) => findXmppRoomChannelByJid(value)
  }))
  : (() => false);
const normalizeXmppRefIdsListViaXep = typeof XEP_0359_0424_MESSAGE_REF_UTILS_BINDINGS.normalizeXmppRefIdsList === "function"
  ? XEP_0359_0424_MESSAGE_REF_UTILS_BINDINGS.normalizeXmppRefIdsList
  : (() => []);
const messageMatchesXmppReferenceViaXep = typeof XEP_0359_0424_MESSAGE_REF_UTILS_BINDINGS.messageMatchesXmppReference === "function"
  ? XEP_0359_0424_MESSAGE_REF_UTILS_BINDINGS.messageMatchesXmppReference
  : (() => false);
const xmppRefIdsOverlapViaXep = typeof XEP_0359_0424_MESSAGE_REF_UTILS_BINDINGS.xmppRefIdsOverlap === "function"
  ? XEP_0359_0424_MESSAGE_REF_UTILS_BINDINGS.xmppRefIdsOverlap
  : (() => false);
const trimXmppLocalSentRefsViaXep = typeof XEP_0359_0424_MESSAGE_REF_UTILS_BINDINGS.trimXmppLocalSentRefs === "function"
  ? XEP_0359_0424_MESSAGE_REF_UTILS_BINDINGS.trimXmppLocalSentRefs
  : (() => {});
const rememberXmppLocalSentRefsViaXep = typeof XEP_0359_0424_MESSAGE_REF_UTILS_BINDINGS.rememberXmppLocalSentRefs === "function"
  ? XEP_0359_0424_MESSAGE_REF_UTILS_BINDINGS.rememberXmppLocalSentRefs
  : (() => {});
const isXmppLocalSentRefIdViaXep = typeof XEP_0359_0424_MESSAGE_REF_UTILS_BINDINGS.isXmppLocalSentRefId === "function"
  ? XEP_0359_0424_MESSAGE_REF_UTILS_BINDINGS.isXmppLocalSentRefId
  : (() => false);
const normalizeConferenceProviderUrlViaModule = typeof CALL_ROOM_URL_UTILS_BINDINGS.normalizeConferenceProviderUrl === "function"
  ? CALL_ROOM_URL_UTILS_BINDINGS.normalizeConferenceProviderUrl
  : ((value) => (value || "").toString().trim());
const normalizeConferenceRoomPrefixViaModule = typeof CALL_ROOM_URL_UTILS_BINDINGS.normalizeConferenceRoomPrefix === "function"
  ? CALL_ROOM_URL_UTILS_BINDINGS.normalizeConferenceRoomPrefix
  : ((value) => (value || "").toString().trim().toLowerCase());
const normalizeConferenceRoomTokenViaModule = typeof CALL_ROOM_URL_UTILS_BINDINGS.normalizeConferenceRoomToken === "function"
  ? CALL_ROOM_URL_UTILS_BINDINGS.normalizeConferenceRoomToken
  : ((value) => (value || "").toString().trim().toLowerCase());
const normalizeWhiteboardProviderUrlViaModule = typeof CALL_ROOM_URL_UTILS_BINDINGS.normalizeWhiteboardProviderUrl === "function"
  ? CALL_ROOM_URL_UTILS_BINDINGS.normalizeWhiteboardProviderUrl
  : ((value) => (value || "").toString().trim());
const normalizeWhiteboardRoomPrefixViaModule = typeof CALL_ROOM_URL_UTILS_BINDINGS.normalizeWhiteboardRoomPrefix === "function"
  ? ((value) => CALL_ROOM_URL_UTILS_BINDINGS.normalizeWhiteboardRoomPrefix(value, {
    normalizeConferenceRoomTokenFn: normalizeConferenceRoomToken
  }))
  : ((value) => (value || "").toString().trim().toLowerCase());
const relayHealthUrlFromRelayUrlViaModule = typeof CALL_ROOM_URL_UTILS_BINDINGS.relayHealthUrlFromRelayUrl === "function"
  ? ((value) => CALL_ROOM_URL_UTILS_BINDINGS.relayHealthUrlFromRelayUrl(value, {
    normalizeRelayUrlFn: normalizeRelayUrl
  }))
  : (() => "");
const normalizeRelayModeViaModule = typeof CALL_ROOM_URL_UTILS_BINDINGS.normalizeRelayMode === "function"
  ? CALL_ROOM_URL_UTILS_BINDINGS.normalizeRelayMode
  : ((value) => (value || "").toString().toLowerCase());
const normalizeRelayUrlViaModule = typeof CALL_ROOM_URL_UTILS_BINDINGS.normalizeRelayUrl === "function"
  ? CALL_ROOM_URL_UTILS_BINDINGS.normalizeRelayUrl
  : ((value) => (value || "").toString().trim());
const normalizeRelayRoomViaModule = typeof CALL_ROOM_URL_UTILS_BINDINGS.normalizeRelayRoom === "function"
  ? CALL_ROOM_URL_UTILS_BINDINGS.normalizeRelayRoom
  : ((value) => (value || "").toString().trim());
const normalizeXmppJidViaModule = typeof XMPP_LOGIN_NORMALIZERS_GLOBAL.normalizeXmppJid === "function"
  ? XMPP_LOGIN_NORMALIZERS_GLOBAL.normalizeXmppJid
  : ((value) => (value || "").toString().trim());
const normalizeXmppPasswordViaModule = typeof XMPP_LOGIN_NORMALIZERS_GLOBAL.normalizeXmppPassword === "function"
  ? XMPP_LOGIN_NORMALIZERS_GLOBAL.normalizeXmppPassword
  : ((value) => (value || "").toString());
const normalizeXmppWsUrlViaModule = typeof XMPP_LOGIN_NORMALIZERS_GLOBAL.normalizeXmppWsUrl === "function"
  ? XMPP_LOGIN_NORMALIZERS_GLOBAL.normalizeXmppWsUrl
  : ((value) => (value || "").toString().trim());
const normalizeXmppMucServiceViaModule = typeof XMPP_LOGIN_NORMALIZERS_GLOBAL.normalizeXmppMucService === "function"
  ? XMPP_LOGIN_NORMALIZERS_GLOBAL.normalizeXmppMucService
  : ((value) => (value || "").toString().trim().toLowerCase());
const normalizeLocalXmppProfilesViaModule = typeof XMPP_LOGIN_NORMALIZERS_GLOBAL.normalizeLocalXmppProfiles === "function"
  ? ((raw) => XMPP_LOGIN_NORMALIZERS_GLOBAL.normalizeLocalXmppProfiles(raw, {
    normalizeXmppJidFn: normalizeXmppJid,
    normalizeXmppWsUrlFn: normalizeXmppWsUrl,
    normalizeXmppPasswordFn: normalizeXmppPassword
  }))
  : (() => []);
const xmppDomainFromJidViaModule = typeof XMPP_LOGIN_NORMALIZERS_GLOBAL.xmppDomainFromJid === "function"
  ? XMPP_LOGIN_NORMALIZERS_GLOBAL.xmppDomainFromJid
  : ((jid) => (jid || "").toString().trim().toLowerCase());
const normalizeTenorApiKeyViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeTenorApiKey === "function"
  ? MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeTenorApiKey
  : ((value) => (value || "").toString().trim());
const normalizeTenorClientKeyViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeTenorClientKey === "function"
  ? MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeTenorClientKey
  : ((value) => (value || "").toString().trim());
const normalizeMediaPrivacyModeViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeMediaPrivacyMode === "function"
  ? MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeMediaPrivacyMode
  : ((value) => (value === "off" ? "off" : "safe"));
const normalizeMediaTrustRulesViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeMediaTrustRules === "function"
  ? MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeMediaTrustRules
  : ((value) => (Array.isArray(value) ? value : []));
const normalizeMediaDenyRulesViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeMediaDenyRules === "function"
  ? ((value) => MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeMediaDenyRules(value, {
    normalizeMediaTrustRulesFn: normalizeMediaTrustRules
  }))
  : ((value) => normalizeMediaTrustRules(value));
const normalizeProfileEffectViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeProfileEffect === "function"
  ? MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeProfileEffect
  : ((value) => (value || "").toString().toLowerCase());
const normalizeMediaTabViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeMediaTab === "function"
  ? ((value) => MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeMediaTab(value, {
    allowedTabs: MEDIA_TABS
  }))
  : ((value) => (value || "").toString().toLowerCase());
const normalizeMessageCharLimitViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeMessageCharLimit === "function"
  ? ((value) => MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeMessageCharLimit(value, {
    defaultValue: MESSAGE_CHAR_LIMIT_DEFAULT,
    minValue: MESSAGE_CHAR_LIMIT_MIN,
    maxValue: MESSAGE_CHAR_LIMIT_MAX
  }))
  : ((value) => Number(value) || MESSAGE_CHAR_LIMIT_DEFAULT);
const normalizeRecentEmojisViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeRecentEmojis === "function"
  ? MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeRecentEmojis
  : ((value) => (Array.isArray(value) ? value : []));
const normalizeGifFavoritesViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeGifFavorites === "function"
  ? MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeGifFavorites
  : ((value) => (Array.isArray(value) ? value : []));
const normalizeGifGroupsViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeGifGroups === "function"
  ? ((value) => MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeGifGroups(value, {
    normalizeGifFavoritesFn: normalizeGifFavorites
  }))
  : ((value) => (Array.isArray(value) ? value : []));
const normalizeGifScopeViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeGifScope === "function"
  ? ((value, groups = []) => MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeGifScope(value, { groups }))
  : ((value, groups = []) => {
    const token = (value || "").toString().trim().toLowerCase();
    if (token === "all" || token === "favorites" || token === "chat" || token === "time" || token === "network") return token;
    if (token.startsWith("group:")) {
      const groupId = token.slice(6);
      if (groups.some((group) => group.id === groupId)) return token;
    }
    return "all";
  });
const normalizeRelayTransportAttachmentUrlViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeRelayTransportAttachmentUrl === "function"
  ? ((rawUrl = "") => MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeRelayTransportAttachmentUrl(rawUrl, {
    resolveMediaUrlFn: resolveMediaUrl
  }))
  : (() => "");
const normalizeMediaRuleTokenViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeMediaRuleToken === "function"
  ? MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeMediaRuleToken
  : ((rule) => (rule || "").toString().trim().toLowerCase());
const normalizeMediaPrivacyUrlViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeMediaPrivacyUrl === "function"
  ? ((url) => MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeMediaPrivacyUrl(url, {
    resolveMediaUrlFn: resolveMediaUrl,
    baseUrl: window.location.href
  }))
  : ((url) => (url || "").toString());
const normalizeRenderableAvatarUrlViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeRenderableAvatarUrl === "function"
  ? ((value) => MEDIA_PROVIDER_NORMALIZERS_GLOBAL.normalizeRenderableAvatarUrl(value, {
    isRenderableAvatarUrlFn: isRenderableAvatarUrl,
    resolveMediaUrlFn: resolveMediaUrl
  }))
  : (() => "");
const isLikelyImageDataUrlViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.isLikelyImageDataUrl === "function"
  ? MEDIA_PROVIDER_NORMALIZERS_GLOBAL.isLikelyImageDataUrl
  : ((value) => /^data:image\/[a-z0-9.+-]+;base64,/i.test((value || "").trim()));
const isRenderableAvatarUrlViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.isRenderableAvatarUrl === "function"
  ? ((value) => MEDIA_PROVIDER_NORMALIZERS_GLOBAL.isRenderableAvatarUrl(value, {
    isLikelyUrlFn: isLikelyUrl,
    isLikelyImageDataUrlFn: isLikelyImageDataUrl
  }))
  : ((value) => isLikelyUrl(value) || isLikelyImageDataUrl(value));
const doesMediaRuleMatchHostViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.doesMediaRuleMatchHost === "function"
  ? MEDIA_PROVIDER_NORMALIZERS_GLOBAL.doesMediaRuleMatchHost
  : (() => false);
const isBuiltInTrustedMediaHostViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.isBuiltInTrustedMediaHost === "function"
  ? ((host = "") => MEDIA_PROVIDER_NORMALIZERS_GLOBAL.isBuiltInTrustedMediaHost(host, {
    doesMediaRuleMatchHostFn: doesMediaRuleMatchHost
  }))
  : (() => false);
const isExternalMediaUrlViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.isExternalMediaUrl === "function"
  ? ((url) => MEDIA_PROVIDER_NORMALIZERS_GLOBAL.isExternalMediaUrl(url, {
    baseUrl: window.location.href
  }))
  : (() => false);
const extractUrlFromBackgroundImageValueViaModule = typeof MEDIA_PROVIDER_NORMALIZERS_GLOBAL.extractUrlFromBackgroundImageValue === "function"
  ? ((value) => MEDIA_PROVIDER_NORMALIZERS_GLOBAL.extractUrlFromBackgroundImageValue(value, {
    decodeHtmlEntitiesFn: decodeHtmlEntities,
    isRenderableAvatarUrlFn: isRenderableAvatarUrl,
    resolveMediaUrlFn: resolveMediaUrl
  }))
  : (() => "");
const normalizeUsernameViaModule = typeof ACCOUNT_PROFILE_NORMALIZERS_GLOBAL.normalizeUsername === "function"
  ? ACCOUNT_PROFILE_NORMALIZERS_GLOBAL.normalizeUsername
  : ((value) => (value || "").toString().trim().toLowerCase());
const normalizeComposerDraftsViaModule = typeof ACCOUNT_PROFILE_NORMALIZERS_GLOBAL.normalizeComposerDrafts === "function"
  ? ((value) => ACCOUNT_PROFILE_NORMALIZERS_GLOBAL.normalizeComposerDrafts(value, {
    maxLength: MESSAGE_TEXT_STORAGE_MAX
  }))
  : ((value) => (value && typeof value === "object" ? value : {}));
const normalizeOwnedCosmeticsViaModule = typeof ACCOUNT_PROFILE_NORMALIZERS_GLOBAL.normalizeOwnedCosmetics === "function"
  ? ACCOUNT_PROFILE_NORMALIZERS_GLOBAL.normalizeOwnedCosmetics
  : ((raw) => (raw && typeof raw === "object" ? raw : {}));
const normalizeGuildTagGuildIdViaModule = typeof ACCOUNT_PROFILE_NORMALIZERS_GLOBAL.normalizeGuildTagGuildId === "function"
  ? ACCOUNT_PROFILE_NORMALIZERS_GLOBAL.normalizeGuildTagGuildId
  : ((raw) => (raw || "").toString().trim());
const normalizeCosmeticPurchasesViaModule = typeof ACCOUNT_PROFILE_NORMALIZERS_GLOBAL.normalizeCosmeticPurchases === "function"
  ? ACCOUNT_PROFILE_NORMALIZERS_GLOBAL.normalizeCosmeticPurchases
  : ((raw) => (Array.isArray(raw) ? raw : []));
const normalizeColorForPickerViaModule = typeof ACCOUNT_PROFILE_NORMALIZERS_GLOBAL.normalizeColorForPicker === "function"
  ? ACCOUNT_PROFILE_NORMALIZERS_GLOBAL.normalizeColorForPicker
  : ((value) => (value || "").toString().trim());
const normalizeNativeAndroidInsetsViaModule = typeof ACCOUNT_PROFILE_NORMALIZERS_GLOBAL.normalizeNativeAndroidInsets === "function"
  ? ACCOUNT_PROFILE_NORMALIZERS_GLOBAL.normalizeNativeAndroidInsets
  : (() => null);
const normalizeCosmeticsTabViaModule = typeof ACCOUNT_PROFILE_NORMALIZERS_GLOBAL.normalizeCosmeticsTab === "function"
  ? ACCOUNT_PROFILE_NORMALIZERS_GLOBAL.normalizeCosmeticsTab
  : ((rawTab) => (rawTab || "").toString().trim().toLowerCase());
const xmppRememberPeerFullJidViaModule = typeof XMPP_CALL_TARGET_UTILS_GLOBAL.xmppRememberPeerFullJid === "function"
  ? ((jid = "", options = {}) => XMPP_CALL_TARGET_UTILS_GLOBAL.xmppRememberPeerFullJid(jid, {
    ...options,
    normalizeXmppJidFn: normalizeXmppJid,
    xmppBareJidFn: xmppBareJid,
    poolByBare: xmppAvailableFullJidsByBare
  }))
  : (() => {});
const xmppForgetPeerFullJidViaModule = typeof XMPP_CALL_TARGET_UTILS_GLOBAL.xmppForgetPeerFullJid === "function"
  ? ((jid = "") => XMPP_CALL_TARGET_UTILS_GLOBAL.xmppForgetPeerFullJid(jid, {
    normalizeXmppJidFn: normalizeXmppJid,
    xmppBareJidFn: xmppBareJid,
    poolByBare: xmppAvailableFullJidsByBare
  }))
  : (() => {});
const xmppMostRecentPeerFullJidViaModule = typeof XMPP_CALL_TARGET_UTILS_GLOBAL.xmppMostRecentPeerFullJid === "function"
  ? ((jid = "") => XMPP_CALL_TARGET_UTILS_GLOBAL.xmppMostRecentPeerFullJid(jid, {
    normalizeXmppJidFn: normalizeXmppJid,
    xmppBareJidFn: xmppBareJid,
    poolByBare: xmppAvailableFullJidsByBare
  }))
  : (() => "");
const xmppNormalizeCallTargetJidViaModule = typeof XMPP_CALL_TARGET_UTILS_GLOBAL.xmppNormalizeCallTargetJid === "function"
  ? ((peerJid, options = {}) => XMPP_CALL_TARGET_UTILS_GLOBAL.xmppNormalizeCallTargetJid(peerJid, {
    ...options,
    xmppMostRecentPeerFullJidFn: xmppMostRecentPeerFullJid,
    xmppBareJidFn: xmppBareJid
  }))
  : (() => "");
const xmppCallIqSessionNotFoundErrorViaModule = typeof XMPP_CALL_TARGET_UTILS_GLOBAL.xmppCallIqSessionNotFoundError === "function"
  ? ((errorStanza = null) => XMPP_CALL_TARGET_UTILS_GLOBAL.xmppCallIqSessionNotFoundError(errorStanza, {
    trimXmppRawFn: trimXmppRaw,
    xmppSerializePayloadFn: xmppSerializePayload
  }))
  : (() => false);
const xmppResolveRetryCallTargetForSessionViaModule = typeof XMPP_CALL_TARGET_UTILS_GLOBAL.xmppResolveRetryCallTargetForSession === "function"
  ? ((sessionId = "", attemptedTo = "") => XMPP_CALL_TARGET_UTILS_GLOBAL.xmppResolveRetryCallTargetForSession(sessionId, attemptedTo, {
    sessionById: xmppCallSessionById,
    normalizeXmppJidFn: normalizeXmppJid,
    xmppBareJidFn: xmppBareJid,
    xmppMostRecentPeerFullJidFn: xmppMostRecentPeerFullJid,
    xmppRememberPeerFullJidFn: xmppRememberPeerFullJid
  }))
  : (() => "");
const xmppResolveSessionPeerJidViaModule = typeof XMPP_CALL_TARGET_UTILS_GLOBAL.xmppResolveSessionPeerJid === "function"
  ? ((session, fallback = "", options = {}) => XMPP_CALL_TARGET_UTILS_GLOBAL.xmppResolveSessionPeerJid(session, fallback, {
    ...options,
    xmppMostRecentPeerFullJidFn: xmppMostRecentPeerFullJid,
    xmppBareJidFn: xmppBareJid
  }))
  : (() => "");
const normalizeToggleViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeToggle === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeToggle
  : ((value) => (value === "on" ? "on" : "off"));
const normalizeMemberPresenceFilterViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeMemberPresenceFilter === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeMemberPresenceFilter
  : ((value) => (value === "online" || value === "offline" ? value : "all"));
const normalizeMobilePaneViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeMobilePane === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeMobilePane
  : ((value) => (value === "nav" ? "nav" : "chat"));
const normalizeSwfAudioPolicyViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeSwfAudioPolicy === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeSwfAudioPolicy
  : ((value) => (value === "multi" ? "multi" : "single"));
const normalizeSwfAudioScopeViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeSwfAudioScope === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeSwfAudioScope
  : ((value) => (value === "guild" ? "guild" : "global"));
const normalizeSwfAutoplayViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeSwfAutoplay === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeSwfAutoplay
  : ((value) => (value === "off" ? "off" : "on"));
const normalizeHapticModeViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeHapticMode === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeHapticMode
  : ((value) => (value === "off" || value === "light" ? value : "full"));
const normalizeSwfQuickAudioModeViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeSwfQuickAudioMode === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeSwfQuickAudioMode
  : ((value) => (value === "on" || value === "off" || value === "click" ? value : "click"));
const normalizeThemeViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeTheme === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeTheme
  : ((value) => (value === "oled" || value === "high-contrast" ? value : "discord"));
const normalizeLanguageViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeLanguage === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeLanguage
  : ((value) => (value || "").toString().trim().toLowerCase());
const normalizeDmHomeTabViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeDmHomeTab === "function"
  ? ((value) => UI_STATE_NORMALIZERS_GLOBAL.normalizeDmHomeTab(value, { dmHomeTabs: DM_HOME_TABS }))
  : ((value) => (value || "").toString().trim().toLowerCase());
const normalizeDmHomeRequestsFilterViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeDmHomeRequestsFilter === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeDmHomeRequestsFilter
  : ((value) => {
    const token = (value || "").toString().trim().toLowerCase();
    return token === "incoming" || token === "outgoing" ? token : "all";
  });
const normalizeGuildNotificationModeViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeGuildNotificationMode === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeGuildNotificationMode
  : ((value) => (value === "mentions" || value === "mute" ? value : "all"));
const normalizeGuildNotificationsMapViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeGuildNotificationsMap === "function"
  ? ((value) => UI_STATE_NORMALIZERS_GLOBAL.normalizeGuildNotificationsMap(value, {
    normalizeGuildNotificationModeFn: normalizeGuildNotificationMode
  }))
  : ((value) => (value && typeof value === "object" ? value : {}));
const normalizeForumCollapsedThreadsMapViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeForumCollapsedThreadsMap === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeForumCollapsedThreadsMap
  : ((value) => (value && typeof value === "object" ? value : {}));
const normalizeForumThreadReadStateMapViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeForumThreadReadStateMap === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeForumThreadReadStateMap
  : ((value) => (value && typeof value === "object" ? value : {}));
const normalizeForumThreadSortMapViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeForumThreadSortMap === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeForumThreadSortMap
  : ((value) => (value && typeof value === "object" ? value : {}));
const normalizeForumThreadTagFilterMapViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeForumThreadTagFilterMap === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeForumThreadTagFilterMap
  : ((value) => (value && typeof value === "object" ? value : {}));
const normalizeForumThreadUnreadOnlyMapViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeForumThreadUnreadOnlyMap === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeForumThreadUnreadOnlyMap
  : ((value) => (value && typeof value === "object" ? value : {}));
const normalizeForumThreadMyOnlyMapViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeForumThreadMyOnlyMap === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeForumThreadMyOnlyMap
  : ((value) => (value && typeof value === "object" ? value : {}));
const normalizeSpaceGroupCollapsedMapViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeSpaceGroupCollapsedMap === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeSpaceGroupCollapsedMap
  : ((value) => (value && typeof value === "object" ? value : {}));
const normalizeLastChannelByGuildMapViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeLastChannelByGuildMap === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeLastChannelByGuildMap
  : ((value) => (value && typeof value === "object" ? value : {}));
const normalizeMediaDeviceIdViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeMediaDeviceId === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeMediaDeviceId
  : ((value) => (value || "").toString().trim());
const normalizePlatformOverrideViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizePlatformOverride === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizePlatformOverride
  : ((value) => (value || "").toString().trim().toLowerCase());
const normalizePresenceViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizePresence === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizePresence
  : ((value) => (value === "idle" || value === "dnd" || value === "invisible" ? value : "online"));
const presenceLabelViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.presenceLabel === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.presenceLabel
  : ((presence) => (presence || "").toString());
const detectBrowserUiLocaleViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.detectBrowserUiLocale === "function"
  ? (() => UI_STATE_NORMALIZERS_GLOBAL.detectBrowserUiLocale(navigator.language || ""))
  : (() => "en");
const resolveUiLocaleViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.resolveUiLocale === "function"
  ? ((prefs = getPreferences()) => UI_STATE_NORMALIZERS_GLOBAL.resolveUiLocale(prefs, {
    normalizeLanguageFn: normalizeLanguage,
    detectBrowserUiLocaleFn: detectBrowserUiLocale
  }))
  : (() => "en");
const normalizeXmppOmemoEnabledByJidViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeXmppOmemoEnabledByJid === "function"
  ? ((value) => UI_STATE_NORMALIZERS_GLOBAL.normalizeXmppOmemoEnabledByJid(value, {
    bareJidFn: xmppBareJid,
    normalizeToggleFn: normalizeToggle
  }))
  : ((value) => (value && typeof value === "object" ? value : {}));
const normalizeXmppIgnoredRoomsByAccountViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeXmppIgnoredRoomsByAccount === "function"
  ? ((value) => UI_STATE_NORMALIZERS_GLOBAL.normalizeXmppIgnoredRoomsByAccount(value, {
    bareJidFn: xmppBareJid
  }))
  : ((value) => (value && typeof value === "object" ? value : {}));
const xmppShowValueForPresenceViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.xmppShowValueForPresence === "function"
  ? ((presence) => UI_STATE_NORMALIZERS_GLOBAL.xmppShowValueForPresence(presence, {
    normalizePresenceFn: normalizePresence
  }))
  : (() => "");
const normalizeVoiceStateViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeVoiceState === "function"
  ? ((value) => UI_STATE_NORMALIZERS_GLOBAL.normalizeVoiceState(value, {
    createIdFn: createId,
    nowIsoFn: () => new Date().toISOString()
  }))
  : ((value) => (value && typeof value === "object" ? value : {}));
const normalizeChannelPermissionValueViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeChannelPermissionValue === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.normalizeChannelPermissionValue
  : ((value) => {
    const token = (value || "").toString().toLowerCase();
    return token === "allow" || token === "deny" ? token : "inherit";
  });
const normalizeChannelPermissionOverridesViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.normalizeChannelPermissionOverrides === "function"
  ? ((value, roleIds = []) => UI_STATE_NORMALIZERS_GLOBAL.normalizeChannelPermissionOverrides(value, roleIds, {
    normalizeChannelPermissionValueFn: normalizeChannelPermissionValue
  }))
  : ((value) => (value && typeof value === "object" ? value : {}));
const accountActivitySummaryViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.accountActivitySummary === "function"
  ? UI_STATE_NORMALIZERS_GLOBAL.accountActivitySummary
  : (() => "");
const tUiViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.tUi === "function"
  ? ((key, fallback = "") => UI_STATE_NORMALIZERS_GLOBAL.tUi(key, fallback, {
    resolveUiLocaleFn: resolveUiLocale,
    uiI18n: UI_I18N
  }))
  : ((key, fallback = "") => fallback || key);
const tUiFmtViaModule = typeof UI_STATE_NORMALIZERS_GLOBAL.tUiFmt === "function"
  ? ((key, vars = {}, fallback = "") => UI_STATE_NORMALIZERS_GLOBAL.tUiFmt(key, vars, fallback, {
    tUiFn: tUi
  }))
  : ((key, vars = {}, fallback = "") => {
    const template = tUi(key, fallback);
    return Object.entries(vars || {}).reduce((acc, [name, value]) => (
      acc.replaceAll(`{${name}}`, String(value))
    ), template);
  });
const normalizeSlashCommandInvocationViaModule = typeof COMMAND_INVOCATION_UTILS_GLOBAL.normalizeSlashCommandInvocation === "function"
  ? ((rawValue) => COMMAND_INVOCATION_UTILS_GLOBAL.normalizeSlashCommandInvocation(rawValue, {
    decodeHtmlEntitiesFn: decodeHtmlEntities,
    isInlineCommandHrefFn: isInlineCommandHref,
    slashCommands: SLASH_COMMANDS
  }))
  : ((rawValue) => (rawValue || "").toString().trim());
const isInlineCommandHrefViaModule = typeof COMMAND_INVOCATION_UTILS_GLOBAL.isInlineCommandHref === "function"
  ? COMMAND_INVOCATION_UTILS_GLOBAL.isInlineCommandHref
  : ((value) => /^s67cmd:/i.test((value || "").toString().trim()));
const sanitizeRichTextHrefViaModule = typeof COMMAND_INVOCATION_UTILS_GLOBAL.sanitizeRichTextHref === "function"
  ? ((value) => COMMAND_INVOCATION_UTILS_GLOBAL.sanitizeRichTextHref(value, {
    isLikelyRichTextLinkFn: isLikelyRichTextLink
  }))
  : ((value) => (value || "").toString().trim());
const xmppSyntheticMessageIdViaModule = typeof XMPP_MESSAGE_ID_UTILS_GLOBAL.xmppSyntheticMessageId === "function"
  ? ((payload = {}) => XMPP_MESSAGE_ID_UTILS_GLOBAL.xmppSyntheticMessageId(payload, {
    normalizeAttachmentsFn: normalizeAttachments
  }))
  : (() => "");
const primaryXmppReferenceIdForMessageViaModule = typeof XMPP_MESSAGE_ID_UTILS_GLOBAL.primaryXmppReferenceIdForMessage === "function"
  ? ((message) => XMPP_MESSAGE_ID_UTILS_GLOBAL.primaryXmppReferenceIdForMessage(message, {
    normalizeXmppRefIdsListFn: normalizeXmppRefIdsList
  }))
  : (() => "");
const preferredXmppDmReferenceIdForMessageViaModule = typeof XMPP_MESSAGE_ID_UTILS_GLOBAL.preferredXmppDmReferenceIdForMessage === "function"
  ? ((message) => XMPP_MESSAGE_ID_UTILS_GLOBAL.preferredXmppDmReferenceIdForMessage(message, {
    normalizeXmppRefIdsListFn: normalizeXmppRefIdsList,
    primaryXmppReferenceIdForMessageFn: primaryXmppReferenceIdForMessage
  }))
  : (() => "");
const xmppStanzaStableIdViaModule = typeof XMPP_MESSAGE_ID_UTILS_GLOBAL.xmppStanzaStableId === "function"
  ? ((stanza) => XMPP_MESSAGE_ID_UTILS_GLOBAL.xmppStanzaStableId(stanza, {
    xmppStanzaReferenceIdsFn: xmppStanzaReferenceIds
  }))
  : (() => "");
const clampMessageTextForStorageViaModule = typeof TEXT_TIME_UTILS_GLOBAL.clampMessageTextForStorage === "function"
  ? ((value) => TEXT_TIME_UTILS_GLOBAL.clampMessageTextForStorage(value, {
    maxLength: MESSAGE_TEXT_STORAGE_MAX
  }))
  : ((value) => (value || "").toString());
const escapeRegExpViaModule = typeof TEXT_TIME_UTILS_GLOBAL.escapeRegExp === "function"
  ? TEXT_TIME_UTILS_GLOBAL.escapeRegExp
  : ((value) => (value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
const toTimestampMsViaModule = typeof TEXT_TIME_UTILS_GLOBAL.toTimestampMs === "function"
  ? TEXT_TIME_UTILS_GLOBAL.toTimestampMs
  : ((value) => Number(Date.parse(value || "")) || 0);
const sanitizeChannelNameViaModule = typeof NAME_NORMALIZERS_GLOBAL.sanitizeChannelName === "function"
  ? NAME_NORMALIZERS_GLOBAL.sanitizeChannelName
  : ((value, fallback = "") => (value || "").toString().trim().toLowerCase() || fallback);
const sanitizeForumTagNameViaModule = typeof NAME_NORMALIZERS_GLOBAL.sanitizeForumTagName === "function"
  ? NAME_NORMALIZERS_GLOBAL.sanitizeForumTagName
  : ((value) => (value || "").toString().trim().toLowerCase());
const normalizeSlowmodeSecondsViaModule = typeof NAME_NORMALIZERS_GLOBAL.normalizeSlowmodeSeconds === "function"
  ? NAME_NORMALIZERS_GLOBAL.normalizeSlowmodeSeconds
  : ((value) => {
    const next = Math.round(Number(value) || 0);
    return Math.max(0, Math.min(3600, next));
  });
const xmppMessageCorrectionTargetId = typeof XEP_0308_0424_0444_BINDINGS.xmppMessageCorrectionTargetId === "function"
  ? XEP_0308_0424_0444_BINDINGS.xmppMessageCorrectionTargetId
  : (() => "");
const xmppMessageRetractionTargetId = typeof XEP_0308_0424_0444_BINDINGS.xmppMessageRetractionTargetId === "function"
  ? XEP_0308_0424_0444_BINDINGS.xmppMessageRetractionTargetId
  : (() => "");
const xmppReactionPayloadFromStanza = typeof XEP_0308_0424_0444_BINDINGS.xmppReactionPayloadFromStanza === "function"
  ? XEP_0308_0424_0444_BINDINGS.xmppReactionPayloadFromStanza
  : (() => null);
const parseXmppJingleMessageAction = typeof XEP_0353_JINGLE_MESSAGE_PARSE_BINDINGS.parseXmppJingleMessageAction === "function"
  ? XEP_0353_JINGLE_MESSAGE_PARSE_BINDINGS.parseXmppJingleMessageAction
  : (() => null);
const xmppStanzaDelayTimestamp = typeof XEP_0203_0319_DELAY_IDLE_BINDINGS.xmppStanzaDelayTimestamp === "function"
  ? XEP_0203_0319_DELAY_IDLE_BINDINGS.xmppStanzaDelayTimestamp
  : ((stanza, fallbackTs = "") => fallbackTs || new Date().toISOString());
const xmppPresenceIdleSince = typeof XEP_0203_0319_DELAY_IDLE_BINDINGS.xmppPresenceIdleSince === "function"
  ? XEP_0203_0319_DELAY_IDLE_BINDINGS.xmppPresenceIdleSince
  : (() => "");
const xmppOccupantIdFromStanza = typeof XEP_0421_0045_MUC_OCCUPANT_BINDINGS.xmppOccupantIdFromStanza === "function"
  ? XEP_0421_0045_MUC_OCCUPANT_BINDINGS.xmppOccupantIdFromStanza
  : (() => "");
const xmppMucMessageAuthorJid = typeof XEP_0421_0045_MUC_OCCUPANT_BINDINGS.xmppMucMessageAuthorJid === "function"
  ? ((stanza) => XEP_0421_0045_MUC_OCCUPANT_BINDINGS.xmppMucMessageAuthorJid(stanza, { bareJidFn: xmppBareJid }))
  : (() => "");
const xmppRoomAliasActorIdForOccupant = typeof XEP_0421_0045_MUC_OCCUPANT_BINDINGS.xmppRoomAliasActorIdForOccupant === "function"
  ? ((roomJid, occupantId = "") => XEP_0421_0045_MUC_OCCUPANT_BINDINGS.xmppRoomAliasActorIdForOccupant(roomJid, occupantId, { bareJidFn: xmppBareJid }))
  : (() => "");
const parseXmppRoomAliasActorId = typeof XEP_0421_0045_MUC_OCCUPANT_BINDINGS.parseXmppRoomAliasActorId === "function"
  ? ((actorUserId = "") => XEP_0421_0045_MUC_OCCUPANT_BINDINGS.parseXmppRoomAliasActorId(actorUserId, { bareJidFn: xmppBareJid }))
  : (() => null);
const parseXmppJingleIq = typeof XEP_0166_0167_JINGLE_IQ_PARSE_BINDINGS.parseXmppJingleIq === "function"
  ? ((stanza) => XEP_0166_0167_JINGLE_IQ_PARSE_BINDINGS.parseXmppJingleIq(stanza, { bareJidFn: xmppBareJid }))
  : (() => null);
const xmppParseIceCredsFromSdp = typeof XEP_0320_WEBRTC_SDP_BASICS_BINDINGS.xmppParseIceCredsFromSdp === "function"
  ? XEP_0320_WEBRTC_SDP_BASICS_BINDINGS.xmppParseIceCredsFromSdp
  : (() => null);
const xmppParseDtlsFingerprintFromSdp = typeof XEP_0320_WEBRTC_SDP_BASICS_BINDINGS.xmppParseDtlsFingerprintFromSdp === "function"
  ? XEP_0320_WEBRTC_SDP_BASICS_BINDINGS.xmppParseDtlsFingerprintFromSdp
  : (() => null);
const xmppParseRtcIceCandidateForJingle = typeof XEP_0320_WEBRTC_SDP_BASICS_BINDINGS.xmppParseRtcIceCandidateForJingle === "function"
  ? XEP_0320_WEBRTC_SDP_BASICS_BINDINGS.xmppParseRtcIceCandidateForJingle
  : (() => null);
const xmppPresencePhotoHash = typeof XEP_0153_PRESENCE_PHOTO_HASH_BINDINGS.xmppPresencePhotoHash === "function"
  ? XEP_0153_PRESENCE_PHOTO_HASH_BINDINGS.xmppPresencePhotoHash
  : (() => "");
const xmppPresencePhotoState = typeof XEP_0153_PRESENCE_PHOTO_HASH_BINDINGS.xmppPresencePhotoState === "function"
  ? XEP_0153_PRESENCE_PHOTO_HASH_BINDINGS.xmppPresencePhotoState
  : ((stanza) => {
    const hash = xmppPresencePhotoHash(stanza);
    return {
      hasUpdate: Boolean(hash),
      hasPhotoNode: Boolean(hash),
      hash,
      cleared: false
    };
  });
const extractXmppAltConnectionUrls = typeof XEP_0156_HOST_META_PARSE_BINDINGS.extractXmppAltConnectionUrls === "function"
  ? XEP_0156_HOST_META_PARSE_BINDINGS.extractXmppAltConnectionUrls
  : (() => []);
const parseXmppHostMetaXml = typeof XEP_0156_HOST_META_PARSE_BINDINGS.parseXmppHostMetaXml === "function"
  ? XEP_0156_HOST_META_PARSE_BINDINGS.parseXmppHostMetaXml
  : (() => []);
const parseXmppHostMetaJson = typeof XEP_0156_HOST_META_PARSE_BINDINGS.parseXmppHostMetaJson === "function"
  ? XEP_0156_HOST_META_PARSE_BINDINGS.parseXmppHostMetaJson
  : ((payload) => extractXmppAltConnectionUrls(Array.isArray(payload?.links) ? payload.links : []));
const xmppNodeXmlns = typeof XMPP_XML_BINDINGS.xmppNodeXmlns === "function"
  ? XMPP_XML_BINDINGS.xmppNodeXmlns
  : (() => "");
const xmppNodeLocalName = typeof XMPP_XML_BINDINGS.xmppNodeLocalName === "function"
  ? XMPP_XML_BINDINGS.xmppNodeLocalName
  : (() => "");
const xmppElementsByLocalName = typeof XMPP_XML_BINDINGS.xmppElementsByLocalName === "function"
  ? XMPP_XML_BINDINGS.xmppElementsByLocalName
  : (() => []);
const xmppDirectChildByLocalName = typeof XMPP_XML_BINDINGS.xmppDirectChildByLocalName === "function"
  ? XMPP_XML_BINDINGS.xmppDirectChildByLocalName
  : (() => null);
const xmppNodeHasXmlns = typeof XMPP_XML_BINDINGS.xmppNodeHasXmlns === "function"
  ? XMPP_XML_BINDINGS.xmppNodeHasXmlns
  : (() => false);
const xmppNodeHasXmlnsPrefix = typeof XMPP_XML_BINDINGS.xmppNodeHasXmlnsPrefix === "function"
  ? XMPP_XML_BINDINGS.xmppNodeHasXmlnsPrefix
  : (() => false);
const xmppNodeHasAnyXmlns = typeof XMPP_XML_BINDINGS.xmppNodeHasAnyXmlns === "function"
  ? XMPP_XML_BINDINGS.xmppNodeHasAnyXmlns
  : (() => false);
const xmppNodeText = typeof XMPP_XML_BINDINGS.xmppNodeText === "function"
  ? XMPP_XML_BINDINGS.xmppNodeText
  : ((node) => {
    if (!node) return "";
    if (typeof globalThis.Strophe?.getText === "function") return (globalThis.Strophe.getText(node) || "").toString();
    return (node.textContent || "").toString();
  });
const xmppEncryptedPayloadInfo = typeof XMPP_ENCRYPTION_PAYLOAD_BINDINGS.xmppEncryptedPayloadInfo === "function"
  ? XMPP_ENCRYPTION_PAYLOAD_BINDINGS.xmppEncryptedPayloadInfo
  : (() => ({ encrypted: false, type: "", label: "" }));
const xmppHasEncryptedPayload = typeof XMPP_ENCRYPTION_PAYLOAD_BINDINGS.xmppHasEncryptedPayload === "function"
  ? XMPP_ENCRYPTION_PAYLOAD_BINDINGS.xmppHasEncryptedPayload
  : ((stanza) => xmppEncryptedPayloadInfo(stanza).encrypted);
const xmppEncryptedPlaceholderLabel = typeof XMPP_ENCRYPTION_PAYLOAD_BINDINGS.xmppEncryptedPlaceholderLabel === "function"
  ? XMPP_ENCRYPTION_PAYLOAD_BINDINGS.xmppEncryptedPlaceholderLabel
  : ((info) => {
    if (!info || !info.encrypted) return "";
    const label = (info.label || "").toString().trim();
    if (!label) return "Encrypted XMPP message — decryption is not available in this client yet";
    return `Encrypted XMPP message (${label}) — decryption is not available in this client yet`;
  });
const XEP_0454_GLOBAL = xepModule("xep-0454", globalThis.SHITCORD67_XEP_0454);
const XEP_0454_UTILS_GLOBAL = XEP_0454_GLOBAL.media || xepModule("xep-0454_omemo-media-sharing-utils", globalThis.SHITCORD67_XEP_0454_UTILS);
const xep0454Fn = (name, fallback) => (typeof XEP_0454_UTILS_GLOBAL[name] === "function" ? XEP_0454_UTILS_GLOBAL[name] : fallback);
const isAesgcmUrl = xep0454Fn("isAesgcmUrl", (value) => /^aesgcm:\/\//i.test((value || "").toString().trim()));
const buildAesgcmUrl = xep0454Fn("buildAesgcmUrl", () => "");
const parseAesgcmUrl = xep0454Fn("parseAesgcmUrl", () => null);
const extractAesgcmUrls = xep0454Fn("extractAesgcmUrls", () => []);
const stripAesgcmUrls = xep0454Fn("stripAesgcmUrls", (text = "") => (text || "").toString());
const encryptBlobForAesgcm = xep0454Fn("encryptBlobForAesgcm", async () => { throw new Error("XEP-0454 utils unavailable"); });
const decryptAesgcmBuffer = xep0454Fn("decryptAesgcmBuffer", async () => { throw new Error("XEP-0454 utils unavailable"); });
const downloadAndDecryptAesgcmUrl = xep0454Fn("downloadAndDecryptAesgcmUrl", async () => { throw new Error("XEP-0454 utils unavailable"); });
const XEP_0384_OMEMO_GLOBAL = xepModule("xep-0384_omemo-stanza", globalThis.SHITCORD67_XEP_0384_OMEMO);
const xmppOmemoNamespaceNodeSet = typeof XEP_0384_OMEMO_GLOBAL.xmppOmemoNamespaceNodeSet === "function"
  ? XEP_0384_OMEMO_GLOBAL.xmppOmemoNamespaceNodeSet
  : ((namespace = XMPP_OMEMO_NAMESPACE) => ({
    namespace,
    devicelistNode: namespace === XMPP_OMEMO_NAMESPACE_V2 ? XMPP_OMEMO_DEVICELIST_NODE_V2 : XMPP_OMEMO_DEVICELIST_NODE,
    bundleNodePrefix: namespace === XMPP_OMEMO_NAMESPACE_V2 ? XMPP_OMEMO_BUNDLE_NODE_PREFIX_V2 : XMPP_OMEMO_BUNDLE_NODE_PREFIX,
    notifyFeature: namespace === XMPP_OMEMO_NAMESPACE_V2 ? XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE_V2 : XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE,
    encryptedType: namespace === XMPP_OMEMO_NAMESPACE_V2 ? "omemo2" : "omemo"
  }));
const xmppOmemoParseEncryptedPayload = typeof XEP_0384_OMEMO_GLOBAL.xmppOmemoParseEncryptedPayload === "function"
  ? XEP_0384_OMEMO_GLOBAL.xmppOmemoParseEncryptedPayload
  : (() => null);
const appendXmppOmemoEncryptedNode = typeof XEP_0384_OMEMO_GLOBAL.appendXmppOmemoEncryptedNode === "function"
  ? XEP_0384_OMEMO_GLOBAL.appendXmppOmemoEncryptedNode
  : ((stanza) => stanza);
const appendXmppEmeNode = typeof XEP_0384_OMEMO_GLOBAL.appendXmppEmeNode === "function"
  ? XEP_0384_OMEMO_GLOBAL.appendXmppEmeNode
  : ((stanza) => stanza);
