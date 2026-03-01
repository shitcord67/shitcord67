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
    resolveUiLocale
  });
})(typeof window !== "undefined" ? window : globalThis);
