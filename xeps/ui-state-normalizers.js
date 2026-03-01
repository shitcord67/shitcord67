(function initUiStateNormalizers(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_UI_STATE_NORMALIZERS) return;

  function normalizeToggle(value) {
    return value === "on" ? "on" : "off";
  }

  function normalizeMemberPresenceFilter(value) {
    if (value === "online" || value === "offline") return value;
    return "all";
  }

  function normalizeMobilePane(value) {
    return value === "nav" ? "nav" : "chat";
  }

  function normalizeSwfAudioPolicy(value) {
    return value === "multi" ? "multi" : "single";
  }

  function normalizeSwfAudioScope(value) {
    return value === "guild" ? "guild" : "global";
  }

  function normalizeSwfAutoplay(value) {
    return value === "off" ? "off" : "on";
  }

  function normalizeSwfQuickAudioMode(value) {
    if (value === "on" || value === "off" || value === "click") return value;
    return "click";
  }

  function normalizeTheme(value) {
    if (value === "oled" || value === "high-contrast") return value;
    return "discord";
  }

  function normalizeLanguage(value) {
    const token = (value || "").toString().trim().toLowerCase();
    if (token === "en" || token === "de") return token;
    return "auto";
  }

  function normalizeDmHomeTab(value, {
    dmHomeTabs = []
  } = {}) {
    const token = (value || "").toString().trim().toLowerCase();
    return Array.isArray(dmHomeTabs) && dmHomeTabs.includes(token) ? token : "friends";
  }

  function normalizeDmHomeRequestsFilter(value) {
    const token = (value || "").toString().trim().toLowerCase();
    if (token === "incoming" || token === "outgoing") return token;
    return "all";
  }

  function normalizeGuildNotificationMode(value) {
    if (value === "mentions" || value === "mute") return value;
    return "all";
  }

  function normalizeGuildNotificationsMap(value, {
    normalizeGuildNotificationModeFn = normalizeGuildNotificationMode
  } = {}) {
    if (!value || typeof value !== "object") return {};
    return Object.entries(value).reduce((acc, [guildId, mode]) => {
      if (!guildId) return acc;
      acc[guildId] = normalizeGuildNotificationModeFn(mode);
      return acc;
    }, {});
  }

  function normalizeForumCollapsedThreadsMap(value) {
    if (!value || typeof value !== "object") return {};
    return Object.entries(value).reduce((acc, [channelId, threadMap]) => {
      if (!channelId || !threadMap || typeof threadMap !== "object") return acc;
      const normalizedThreadMap = Object.entries(threadMap).reduce((threadAcc, [threadId, collapsed]) => {
        if (!threadId) return threadAcc;
        threadAcc[threadId] = Boolean(collapsed);
        return threadAcc;
      }, {});
      if (Object.keys(normalizedThreadMap).length > 0) acc[channelId] = normalizedThreadMap;
      return acc;
    }, {});
  }

  function normalizeForumThreadReadStateMap(value) {
    if (!value || typeof value !== "object") return {};
    return Object.entries(value).reduce((acc, [channelId, threadMap]) => {
      if (!channelId || !threadMap || typeof threadMap !== "object") return acc;
      const normalizedThreadMap = Object.entries(threadMap).reduce((threadAcc, [threadId, ts]) => {
        if (!threadId) return threadAcc;
        const nextTs = typeof ts === "string" ? ts : "";
        threadAcc[threadId] = nextTs;
        return threadAcc;
      }, {});
      if (Object.keys(normalizedThreadMap).length > 0) acc[channelId] = normalizedThreadMap;
      return acc;
    }, {});
  }

  function normalizeForumThreadSortMap(value) {
    if (!value || typeof value !== "object") return {};
    return Object.entries(value).reduce((acc, [channelId, sortMode]) => {
      if (!channelId) return acc;
      acc[channelId] = sortMode === "created" ? "created" : "latest";
      return acc;
    }, {});
  }

  function normalizeForumThreadTagFilterMap(value) {
    if (!value || typeof value !== "object") return {};
    return Object.entries(value).reduce((acc, [channelId, tagIds]) => {
      if (!channelId || !Array.isArray(tagIds)) return acc;
      const cleaned = [...new Set(tagIds.map((entry) => (entry || "").toString()).filter(Boolean))].slice(0, 8);
      if (cleaned.length > 0) acc[channelId] = cleaned;
      return acc;
    }, {});
  }

  function normalizeLastChannelByGuildMap(value) {
    if (!value || typeof value !== "object") return {};
    return Object.entries(value).reduce((acc, [guildId, channelId]) => {
      if (!guildId || !channelId) return acc;
      acc[guildId] = channelId.toString();
      return acc;
    }, {});
  }

  function normalizeMediaDeviceId(value) {
    return (value || "").toString().trim().slice(0, 180);
  }

  function normalizePlatformOverride(value) {
    const raw = (value || "").toString().trim().toLowerCase();
    if (!raw || raw === "auto") return "auto";
    if (["linux:x11", "linux:wayland", "linux:unknown", "linux"].includes(raw)) return raw;
    if (["windows", "darwin"].includes(raw)) return raw;
    return "auto";
  }

  function normalizePresence(value) {
    if (value === "idle" || value === "dnd" || value === "invisible") return value;
    return "online";
  }

  function detectBrowserUiLocale(languageValue = "") {
    const explicit = (languageValue || "").toString().trim().toLowerCase();
    if (explicit.startsWith("de")) return "de";
    return "en";
  }

  function resolveUiLocale(prefs = {}, {
    normalizeLanguageFn = normalizeLanguage,
    detectBrowserUiLocaleFn = () => "en"
  } = {}) {
    const selected = normalizeLanguageFn(prefs?.language || "auto");
    if (selected === "auto") return detectBrowserUiLocaleFn();
    return selected;
  }

  function normalizeXmppOmemoEnabledByJid(value, {
    bareJidFn = (jid) => (jid || "").toString().trim().toLowerCase(),
    normalizeToggleFn = normalizeToggle
  } = {}) {
    if (!value || typeof value !== "object") return {};
    return Object.entries(value).reduce((acc, [jid, enabled]) => {
      const bare = bareJidFn(jid || "");
      if (!bare) return acc;
      acc[bare] = normalizeToggleFn(enabled);
      return acc;
    }, {});
  }

  function xmppShowValueForPresence(presence, {
    normalizePresenceFn = normalizePresence
  } = {}) {
    const mode = normalizePresenceFn(presence);
    if (mode === "idle") return "away";
    if (mode === "dnd") return "dnd";
    return "";
  }

  function normalizeVoiceState(value, {
    createIdFn = () => `${Date.now()}`,
    nowIsoFn = () => new Date().toISOString()
  } = {}) {
    const safe = value && typeof value === "object" ? value : {};
    const normalizeIds = (arr) => [...new Set((Array.isArray(arr) ? arr : []).map((id) => (id || "").toString()).filter(Boolean))];
    const activity = Array.isArray(safe.activity)
      ? safe.activity
        .map((entry) => ({
          id: (entry?.id || createIdFn()).toString(),
          accountId: (entry?.accountId || "").toString(),
          action: (entry?.action || "").toString().slice(0, 32),
          detail: (entry?.detail || "").toString().slice(0, 120),
          ts: entry?.ts || nowIsoFn()
        }))
        .filter((entry) => entry.accountId && entry.action)
        .slice(-30)
      : [];
    return {
      connectedIds: normalizeIds(safe.connectedIds),
      mutedIds: normalizeIds(safe.mutedIds),
      raisedHandIds: normalizeIds(safe.raisedHandIds),
      speakerIds: normalizeIds(safe.speakerIds),
      activity
    };
  }

  function normalizeChannelPermissionValue(value) {
    const token = (value || "").toString().toLowerCase();
    if (token === "allow" || token === "deny") return token;
    return "inherit";
  }

  function normalizeChannelPermissionOverrides(value, roleIds = [], {
    normalizeChannelPermissionValueFn = normalizeChannelPermissionValue
  } = {}) {
    if (!value || typeof value !== "object") return {};
    const validRoleIds = new Set(Array.isArray(roleIds) ? roleIds.filter(Boolean) : []);
    const validKeys = ["viewChannel", "sendMessages", "addReactions", "createThreads"];
    return Object.entries(value).reduce((acc, [roleId, config]) => {
      if (!roleId || (validRoleIds.size > 0 && !validRoleIds.has(roleId))) return acc;
      if (!config || typeof config !== "object") return acc;
      const next = {};
      validKeys.forEach((key) => {
        const normalized = normalizeChannelPermissionValueFn(config[key]);
        if (normalized !== "inherit") next[key] = normalized;
      });
      if (Object.keys(next).length > 0) acc[roleId] = next;
      return acc;
    }, {});
  }

  function accountActivitySummary(account) {
    if (!account || typeof account !== "object") return "";
    const explicit = (account.activityText || "").toString().trim();
    if (explicit) return explicit.slice(0, 140);
    if (Array.isArray(account.activities)) {
      const first = account.activities.find((entry) => entry && typeof entry === "object");
      if (first) {
        const parts = [
          (first.name || "").toString().trim(),
          (first.details || "").toString().trim(),
          (first.state || "").toString().trim()
        ].filter(Boolean);
        if (parts.length > 0) return parts.join(" · ").slice(0, 160);
      }
    }
    return "";
  }

  function tUi(key, fallback = "", {
    resolveUiLocaleFn = () => "en",
    uiI18n = {}
  } = {}) {
    const locale = resolveUiLocaleFn();
    const table = uiI18n[locale] || uiI18n.en || {};
    const english = uiI18n.en || {};
    return table[key] || english[key] || fallback || key;
  }

  function tUiFmt(key, vars = {}, fallback = "", {
    tUiFn = (lookupKey, lookupFallback = "") => lookupFallback || lookupKey
  } = {}) {
    const template = tUiFn(key, fallback);
    return Object.entries(vars || {}).reduce((acc, [name, value]) => (
      acc.replaceAll(`{${name}}`, String(value))
    ), template);
  }

  globalScope.SHITCORD67_UI_STATE_NORMALIZERS = Object.freeze({
    normalizeToggle,
    normalizeMemberPresenceFilter,
    normalizeMobilePane,
    normalizeSwfAudioPolicy,
    normalizeSwfAudioScope,
    normalizeSwfAutoplay,
    normalizeSwfQuickAudioMode,
    normalizeTheme,
    normalizeLanguage,
    normalizeDmHomeTab,
    normalizeDmHomeRequestsFilter,
    normalizeGuildNotificationMode,
    normalizeGuildNotificationsMap,
    normalizeForumCollapsedThreadsMap,
    normalizeForumThreadReadStateMap,
    normalizeForumThreadSortMap,
    normalizeForumThreadTagFilterMap,
    normalizeLastChannelByGuildMap,
    normalizeMediaDeviceId,
    normalizePlatformOverride,
    normalizePresence,
    detectBrowserUiLocale,
    resolveUiLocale,
    normalizeXmppOmemoEnabledByJid,
    xmppShowValueForPresence,
    normalizeVoiceState,
    normalizeChannelPermissionValue,
    normalizeChannelPermissionOverrides,
    accountActivitySummary,
    tUi,
    tUiFmt
  });
})(typeof window !== "undefined" ? window : globalThis);
