/*
 * Account login helpers extracted from app.js.
 * Keeps XMPP-specific account preference logic outside the main app bundle.
 */

(function initAppAccountRuntime(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_APP_ACCOUNT_RUNTIME) return;
  let protocolLoginProfilesLoadedOnce = false;

  function snapshotStateForStorage(state) {
    const snapshotFn = globalScope.xmppSnapshotStateForStorage;
    if (typeof snapshotFn === "function") {
      return snapshotFn(state);
    }
    return state;
  }

  function applyXmppLoginOptionsToPreferences(options, prefs, {
    requestedRelayMode = "",
    normalizeXmppJidFn = globalScope.normalizeXmppJid || ((value) => (value || "").toString().trim()),
    normalizeXmppPasswordFn = globalScope.normalizeXmppPassword || ((value) => (value || "").toString()),
    normalizeXmppWsUrlFn = globalScope.normalizeXmppWsUrl || ((value) => (value || "").toString().trim()),
    inferXmppWsUrlFromJidFn = globalScope.inferXmppWsUrlFromJid || (() => ""),
    xmppDomainFromJidFn = globalScope.xmppDomainFromJid || (() => "")
  } = {}) {
    const nextPrefs = prefs && typeof prefs === "object" ? prefs : {};
    const xmpp = options && typeof options.xmpp === "object" ? options.xmpp : null;
    if (!xmpp) return false;
    const jid = normalizeXmppJidFn(xmpp.jid || "");
    const password = normalizeXmppPasswordFn(xmpp.password || "");
    const wsInput = normalizeXmppWsUrlFn(xmpp.wsUrl || "") || inferXmppWsUrlFromJidFn(jid);
    if (jid) nextPrefs.xmppJid = jid;
    if (typeof xmpp.password === "string") nextPrefs.xmppPassword = password;
    if (wsInput) nextPrefs.xmppWsUrl = wsInput;
    if (jid && !nextPrefs.xmppMucService) {
      const domain = xmppDomainFromJidFn(jid);
      if (domain) nextPrefs.xmppMucService = `conference.${domain}`;
    }
    if (jid && password && (!requestedRelayMode || requestedRelayMode === "xmpp")) {
      nextPrefs.relayMode = "xmpp";
      nextPrefs.relayAutoConnect = "on";
    }
    return true;
  }

  function applyProtocolLoginOptionsToPreferences(options, prefs, deps = {}) {
    return applyXmppLoginOptionsToPreferences(options, prefs, deps);
  }

  function ensureAccountRuntimeShape(account, {
    ensureAccountCosmeticsFn = () => {}
  } = {}) {
    if (!account || typeof account !== "object") return null;
    if (!account.guildProfiles || typeof account.guildProfiles !== "object") account.guildProfiles = {};
    if (typeof account.xmppIdleSince !== "string") account.xmppIdleSince = "";
    if (typeof account.xmppLastActiveAt !== "string") account.xmppLastActiveAt = "";
    if (typeof account.customStatusEmoji !== "string") account.customStatusEmoji = "";
    if (!("customStatusExpiresAt" in account)) account.customStatusExpiresAt = null;
    if (typeof account.activityText !== "string") account.activityText = "";
    if (!Array.isArray(account.activities)) account.activities = [];
    ensureAccountCosmeticsFn(account);
    return account;
  }

  function canAccountAccessProtocolGuild(guild, account, {
    domainFromJidFn = globalScope.xmppDomainFromJid || (() => ""),
    jidFromAccountFn = (entry) => entry?.xmppJid || "",
    protocolGuildPrefix = "xmpp-spaces:"
  } = {}) {
    if (!guild || !account) return false;
    const guildId = (guild.id || "").toString().toLowerCase();
    if (!protocolGuildPrefix) return true;
    if (!guildId.startsWith(protocolGuildPrefix)) return true;
    const guildDomain = guildId.slice(protocolGuildPrefix.length);
    const accountDomain = domainFromJidFn(jidFromAccountFn(account) || "");
    if (guildDomain && accountDomain && guildDomain !== accountDomain) return false;
    return true;
  }

  function isProtocolBackedGuild(guild, {
    isXmppBackedGuildFn = globalScope.isXmppBackedGuild || null
  } = {}) {
    if (typeof isXmppBackedGuildFn === "function") return Boolean(isXmppBackedGuildFn(guild));
    return false;
  }

  function shouldUseStrictInitialAvatarForProtocol(account, {
    accountProtocolAddressFn = globalScope.accountBareXmppJid || ((entry) => entry?.xmppJid || ""),
    isKnownMissingAvatarForAddressFn = (address) => {
      const knownMissing = globalScope.xmppAvatarMissingByJid;
      return Boolean(knownMissing && typeof knownMissing.has === "function" && knownMissing.has(address));
    }
  } = {}) {
    if (!account || typeof account !== "object") return true;
    const address = (accountProtocolAddressFn(account) || "").toString().trim();
    if (!address) return true;
    return Boolean(isKnownMissingAvatarForAddressFn(address));
  }

  function shouldAutoConnectRelayMode(mode) {
    const token = (mode || "").toString().trim().toLowerCase();
    return token === "ws" || token === "http" || token === "xmpp";
  }

  function maybeLoadProtocolLoginProfiles({
    loggedIn = false,
    loadedOnce = null,
    loadLocalProfilesFn = null,
    loadLocalXmppProfilesFn = null
  } = {}) {
    const alreadyLoaded = typeof loadedOnce === "boolean"
      ? loadedOnce
      : protocolLoginProfilesLoadedOnce;
    if (loggedIn) return Boolean(alreadyLoaded);
    if (alreadyLoaded) return true;
    const loader = typeof loadLocalProfilesFn === "function"
      ? loadLocalProfilesFn
      : typeof loadLocalXmppProfilesFn === "function"
        ? loadLocalXmppProfilesFn
        : typeof globalScope.loadLocalProtocolProfiles === "function"
          ? globalScope.loadLocalProtocolProfiles
          : typeof globalScope.loadLocalXmppProfiles === "function"
            ? globalScope.loadLocalXmppProfiles
        : null;
    if (typeof loader === "function") {
      void loader();
      protocolLoginProfilesLoadedOnce = true;
      return true;
    }
    return false;
  }

  function protocolAccountAddress(account, {
    accountAddressFn = globalScope.accountBareXmppJid || ((entry) => entry?.xmppJid || "")
  } = {}) {
    return (accountAddressFn(account) || "").toString().trim();
  }

  function legacyCallButtonKey() {
    return "openXmppCallBtn";
  }

  globalScope.SHITCORD67_APP_ACCOUNT_RUNTIME = Object.freeze({
    snapshotStateForStorage,
    applyXmppLoginOptionsToPreferences,
    applyProtocolLoginOptionsToPreferences,
    ensureAccountRuntimeShape,
    canAccountAccessProtocolGuild,
    isProtocolBackedGuild,
    shouldUseStrictInitialAvatarForProtocol,
    shouldAutoConnectRelayMode,
    maybeLoadProtocolLoginProfiles,
    protocolAccountAddress,
    legacyCallButtonKey
  });
})(typeof window !== "undefined" ? window : globalThis);
