/*
 * Media picker runtime extracted from app.js.
 * Keeps attachment/media UX logic in xeps/.
 */

function mediaEntriesForActiveTab() {
  const guild = getActiveGuild();
  ensureGuildMediaCollections(guild);
  if (mediaPickerTab === "emoji") {
    const prefs = getPreferences();
    const recents = normalizeRecentEmojis(prefs.recentEmojis);
    const builtIn = emojiLibraryEntries
      .map((entry) => {
        const recentIndex = recents.indexOf(entry.value);
        return { ...entry, source: "builtin", recentIndex };
      })
      .sort((a, b) => {
        const aRecent = a.recentIndex >= 0;
        const bRecent = b.recentIndex >= 0;
        if (aRecent && bRecent) return a.recentIndex - b.recentIndex;
        if (aRecent) return -1;
        if (bRecent) return 1;
        return a.name.localeCompare(b.name);
      });
    const custom = (guild?.customEmojis || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return [...custom, ...builtIn];
  }
  if (mediaPickerTab === "gif") {
    const custom = (guild?.customGifs || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return dedupeGifEntries([...custom, ...GIF_LIBRARY, ...gifPickerRemoteEntries]);
  }
  if (mediaPickerTab === "sticker") {
    const custom = (guild?.customStickers || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return dedupeStickerEntries([...custom, ...STICKER_LIBRARY, ...stickerPickerRemoteEntries]);
  }
  if (mediaPickerTab === "svg") {
    const custom = (guild?.customSvgs || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return [...custom, ...SVG_LIBRARY];
  }
  if (mediaPickerTab === "pdf") {
    const custom = (guild?.customPdfs || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return custom;
  }
  if (mediaPickerTab === "text") {
    const custom = (guild?.customTexts || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return custom;
  }
  if (mediaPickerTab === "docs") {
    const custom = (guild?.customDocs || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return custom;
  }
  if (mediaPickerTab === "swf") {
    const custom = (guild?.customSwfs || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return [...custom, ...swfLibrary];
  }
  if (mediaPickerTab === "html") {
    const custom = (guild?.customHtmls || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return custom;
  }
  return [];
}

function gifPickerQueryKey() {
  return (mediaPickerQuery || "").toString().trim().toLowerCase();
}

function stickerPickerQueryKey() {
  return (mediaPickerQuery || "").toString().trim().toLowerCase();
}

function normalizeGifPickerEntry(entry) {
  const value = entry && typeof entry === "object" ? entry : {};
  const name = (value.name || "gif").toString().trim().slice(0, 120) || "gif";
  const url = (value.url || "").toString().trim();
  if (!url) return null;
  const preview = value.preview === "video" ? "video" : "";
  return { name, url, preview, source: "remote" };
}

function appendGifPickerEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return;
  const seen = new Set(gifPickerRemoteEntries.map((entry) => `${entry.url}::${entry.name}`));
  const next = [...gifPickerRemoteEntries];
  entries.forEach((entry) => {
    const normalized = normalizeGifPickerEntry(entry);
    if (!normalized) return;
    const key = `${normalized.url}::${normalized.name}`;
    if (seen.has(key)) return;
    seen.add(key);
    next.push(normalized);
  });
  gifPickerRemoteEntries = next.slice(0, GIF_PICKER_REMOTE_MAX);
}

function normalizeStickerPickerEntry(entry) {
  const value = entry && typeof entry === "object" ? entry : {};
  const name = (value.name || "sticker").toString().trim().slice(0, 120) || "sticker";
  const url = (value.url || "").toString().trim();
  if (!url) return null;
  const format = stickerFormatFromName(name, url);
  return { name, url, format, source: "remote" };
}

function appendStickerPickerEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return;
  const seen = new Set(stickerPickerRemoteEntries.map((entry) => `${entry.url}::${entry.name}`));
  const next = [...stickerPickerRemoteEntries];
  entries.forEach((entry) => {
    const normalized = normalizeStickerPickerEntry(entry);
    if (!normalized) return;
    const key = `${normalized.url}::${normalized.name}`;
    if (seen.has(key)) return;
    seen.add(key);
    next.push(normalized);
  });
  stickerPickerRemoteEntries = next.slice(0, STICKER_PICKER_REMOTE_MAX);
}

function readStoredTenorCredentials() {
  try {
    return {
      key: normalizeTenorApiKey(localStorage.getItem(TENOR_KEY_STORAGE_KEY) || ""),
      clientKey: normalizeTenorClientKey(localStorage.getItem(TENOR_CLIENT_STORAGE_KEY) || ""),
      readable: true
    };
  } catch {
    return { key: "", clientKey: "", readable: false };
  }
}

function writeStoredTenorCredentials(key, clientKey) {
  const nextKey = normalizeTenorApiKey(key);
  const nextClientKey = normalizeTenorClientKey(clientKey);
  try {
    if (nextKey) localStorage.setItem(TENOR_KEY_STORAGE_KEY, nextKey);
    else localStorage.removeItem(TENOR_KEY_STORAGE_KEY);
    if (nextClientKey) localStorage.setItem(TENOR_CLIENT_STORAGE_KEY, nextClientKey);
    else localStorage.removeItem(TENOR_CLIENT_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

function invalidateGifPickerRemoteEntries() {
  gifPickerRemoteRequestToken += 1;
  gifPickerRemoteLoading = false;
  gifPickerRemoteEntries = [];
  gifPickerRemoteNext = "";
  gifPickerRemoteError = "";
  gifPickerVisibleCount = GIF_PICKER_INITIAL_PAGE_SIZE;
}

function invalidateStickerPickerRemoteEntries() {
  stickerPickerRemoteRequestToken += 1;
  stickerPickerRemoteLoading = false;
  stickerPickerRemoteEntries = [];
  stickerPickerRemoteNext = "";
  stickerPickerRemoteError = "";
  stickerPickerVisibleCount = STICKER_PICKER_INITIAL_PAGE_SIZE;
}

function setTenorCredentialsStatus(message, tone = "") {
  if (!ui.tenorCredentialsStatus) return;
  ui.tenorCredentialsStatus.textContent = (message || "").toString().slice(0, 240);
  if (tone === "ok" || tone === "error") ui.tenorCredentialsStatus.dataset.tone = tone;
  else delete ui.tenorCredentialsStatus.dataset.tone;
}

function setTenorApiKeyVisibility(visible) {
  tenorApiKeyVisible = Boolean(visible);
  if (ui.tenorApiKeyInput) ui.tenorApiKeyInput.type = tenorApiKeyVisible ? "text" : "password";
  if (ui.toggleTenorApiKeyBtn) {
    ui.toggleTenorApiKeyBtn.textContent = tenorApiKeyVisible ? "Hide API Key" : "Show API Key";
    ui.toggleTenorApiKeyBtn.setAttribute("aria-pressed", tenorApiKeyVisible ? "true" : "false");
  }
}

function renderTenorCredentialSettings() {
  const stored = readStoredTenorCredentials();
  setTenorApiKeyVisibility(false);
  if (ui.tenorApiKeyInput) ui.tenorApiKeyInput.value = stored.key;
  if (ui.tenorClientKeyInput) ui.tenorClientKeyInput.value = stored.clientKey;
  if (!stored.readable) {
    setTenorCredentialsStatus("Tenor credentials unavailable: browser storage is blocked.", "error");
    return;
  }
  if (stored.key) {
    const activeClientKey = stored.clientKey || TENOR_CLIENT_KEY;
    setTenorCredentialsStatus(`Using custom Tenor credentials (client: ${activeClientKey}).`, "ok");
    return;
  }
  setTenorCredentialsStatus("Using built-in demo Tenor credentials.");
}

function saveTenorCredentialSettings({ refreshGifPicker = false } = {}) {
  if (!ui.tenorApiKeyInput || !ui.tenorClientKeyInput) return true;
  const key = normalizeTenorApiKey(ui.tenorApiKeyInput.value);
  const clientKey = normalizeTenorClientKey(ui.tenorClientKeyInput.value);
  ui.tenorApiKeyInput.value = key;
  ui.tenorClientKeyInput.value = clientKey;
  const saved = writeStoredTenorCredentials(key, clientKey);
  if (!saved) {
    setTenorCredentialsStatus("Could not persist Tenor credentials in browser storage.", "error");
    return false;
  }
  if (key) {
    setTenorCredentialsStatus(`Saved custom Tenor credentials (client: ${clientKey || TENOR_CLIENT_KEY}).`, "ok");
  } else {
    setTenorCredentialsStatus("Tenor credentials cleared. Using built-in demo key.");
  }
  if (refreshGifPicker) {
    invalidateGifPickerRemoteEntries();
    invalidateStickerPickerRemoteEntries();
    if (mediaPickerOpen && mediaPickerTab === "gif") {
      maybeLoadMoreGifPickerEntries({ reset: true, force: true });
    } else if (mediaPickerOpen && mediaPickerTab === "sticker") {
      maybeLoadMoreStickerPickerEntries({ reset: true, force: true });
    }
  }
  return true;
}

function resolveTenorCredentials() {
  let key = TENOR_PUBLIC_API_KEY;
  let clientKey = TENOR_CLIENT_KEY;
  let customKey = false;
  const stored = readStoredTenorCredentials();
  if (stored.key) {
    key = stored.key;
    customKey = true;
  }
  if (stored.clientKey) clientKey = stored.clientKey;
  return { key, clientKey, customKey };
}

function ensureGifUsageState() {
  if (!state.gifUsage || typeof state.gifUsage !== "object") {
    state.gifUsage = { byConversation: {}, byTime: {}, byNetwork: {} };
  }
  if (!state.gifUsage.byConversation || typeof state.gifUsage.byConversation !== "object") state.gifUsage.byConversation = {};
  if (!state.gifUsage.byTime || typeof state.gifUsage.byTime !== "object") state.gifUsage.byTime = {};
  if (!state.gifUsage.byNetwork || typeof state.gifUsage.byNetwork !== "object") state.gifUsage.byNetwork = {};
  return state.gifUsage;
}

function gifTimeScopeKey(date = new Date()) {
  const hour = Number(date?.getHours?.() ?? 0);
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

function gifNetworkScopeKey() {
  const connection = navigator?.connection || navigator?.mozConnection || navigator?.webkitConnection || null;
  const type = (connection?.type || "").toString().toLowerCase();
  const effective = (connection?.effectiveType || "").toString().toLowerCase();
  if (!type && !effective) return "network:default";
  return `network:${type || "unknown"}:${effective || "unknown"}`;
}

function updateGifUsageCounter(store, bucketKey, url) {
  if (!store || typeof store !== "object") return;
  const key = (bucketKey || "").toString().trim();
  const gifUrl = (url || "").toString().trim();
  if (!key || !gifUrl) return;
  const bucket = store[key] && typeof store[key] === "object" ? store[key] : {};
  const current = Number(bucket[gifUrl]) || 0;
  bucket[gifUrl] = Math.min(500000, current + 1);
  store[key] = bucket;
}

function trackGifUsage(url, conversationId = "") {
  const gifUrl = (url || "").toString().trim();
  if (!gifUrl) return;
  const usage = ensureGifUsageState();
  const convoKey = (conversationId || "").toString().trim();
  if (convoKey) updateGifUsageCounter(usage.byConversation, convoKey, gifUrl);
  updateGifUsageCounter(usage.byTime, gifTimeScopeKey(new Date()), gifUrl);
  updateGifUsageCounter(usage.byNetwork, gifNetworkScopeKey(), gifUrl);
}

function gifScopeUsageUrls(scope, conversationId = "") {
  const usage = ensureGifUsageState();
  let bucket = {};
  if (scope === "chat") {
    const convoKey = (conversationId || "").toString().trim();
    bucket = convoKey ? (usage.byConversation[convoKey] || {}) : {};
  } else if (scope === "time") {
    bucket = usage.byTime[gifTimeScopeKey(new Date())] || {};
  } else if (scope === "network") {
    bucket = usage.byNetwork[gifNetworkScopeKey()] || {};
  } else {
    return [];
  }
  return Object.entries(bucket)
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
    .map(([url]) => url)
    .filter(Boolean);
}

function dedupeGifEntries(entries) {
  if (!Array.isArray(entries)) return [];
  const seen = new Set();
  return entries.filter((entry) => {
    const key = (entry?.url || "").toString().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeStickerEntries(entries) {
  if (!Array.isArray(entries)) return [];
  const seen = new Set();
  return entries.filter((entry) => {
    const key = (entry?.url || "").toString().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function activeGifScope() {
  const prefs = getPreferences();
  return normalizeGifScope(prefs.gifScope, prefs.gifGroups);
}

function updateGifScope(scope) {
  state.preferences = getPreferences();
  state.preferences.gifScope = normalizeGifScope(scope, state.preferences.gifGroups);
  saveState();
}

function toggleGifFavorite(url) {
  const gifUrl = (url || "").toString().trim();
  if (!gifUrl) return false;
  state.preferences = getPreferences();
  const favorites = normalizeGifFavorites(state.preferences.gifFavorites);
  const exists = favorites.includes(gifUrl);
  state.preferences.gifFavorites = exists
    ? favorites.filter((entry) => entry !== gifUrl)
    : [gifUrl, ...favorites.filter((entry) => entry !== gifUrl)].slice(0, 1200);
  saveState();
  return !exists;
}

function upsertGifGroup(name) {
  const nextName = (name || "").toString().trim().slice(0, 40);
  if (!nextName) return null;
  state.preferences = getPreferences();
  const groups = normalizeGifGroups(state.preferences.gifGroups);
  const existing = groups.find((entry) => entry.name.toLowerCase() === nextName.toLowerCase());
  if (existing) return existing.id;
  const id = createId();
  groups.push({ id, name: nextName, urls: [] });
  state.preferences.gifGroups = groups;
  state.preferences.gifScope = `group:${id}`;
  saveState();
  return id;
}

function toggleGifGroupMembership(url, groupId) {
  const gifUrl = (url || "").toString().trim();
  const targetGroupId = (groupId || "").toString().trim();
  if (!gifUrl || !targetGroupId) return null;
  state.preferences = getPreferences();
  const groups = normalizeGifGroups(state.preferences.gifGroups);
  const nextGroups = groups.map((group) => {
    if (group.id !== targetGroupId) return group;
    const hasUrl = group.urls.includes(gifUrl);
    return {
      ...group,
      urls: hasUrl
        ? group.urls.filter((entry) => entry !== gifUrl)
        : [gifUrl, ...group.urls.filter((entry) => entry !== gifUrl)].slice(0, 600)
    };
  });
  state.preferences.gifGroups = nextGroups;
  saveState();
  const updated = nextGroups.find((entry) => entry.id === targetGroupId);
  return updated?.urls.includes(gifUrl) || false;
}

async function promptGifGroupForUrl(url) {
  const gifUrl = (url || "").toString().trim();
  if (!gifUrl) return false;
  state.preferences = getPreferences();
  const groups = normalizeGifGroups(state.preferences.gifGroups);
  if (groups.length === 0) {
    const createdName = await showInAppPromptDialog({
      title: "Create GIF group",
      message: "Create GIF group name",
      defaultValue: "Favorites"
    });
    if (typeof createdName !== "string") return false;
    const groupId = upsertGifGroup(createdName);
    if (!groupId) return false;
    const added = toggleGifGroupMembership(gifUrl, groupId);
    state.preferences = getPreferences();
    state.preferences.gifScope = `group:${groupId}`;
    saveState();
    return Boolean(added);
  }
  const defaultName = groups[0].name;
  const selectedName = await showInAppPromptDialog({
    title: "Add GIF to group",
    message: "Add GIF to group (existing or new name)",
    defaultValue: defaultName
  });
  if (typeof selectedName !== "string") return false;
  const groupId = upsertGifGroup(selectedName) || groups.find((entry) => entry.name.toLowerCase() === selectedName.trim().toLowerCase())?.id || "";
  if (!groupId) return false;
  const added = toggleGifGroupMembership(gifUrl, groupId);
  state.preferences = getPreferences();
  state.preferences.gifScope = `group:${groupId}`;
  saveState();
  return Boolean(added);
}

function applyGifScopeToEntries(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const prefs = getPreferences();
  const scope = normalizeGifScope(prefs.gifScope, prefs.gifGroups);
  const currentConversationId = getActiveConversation()?.id || "";
  const byUrl = (entry) => (entry?.url || "").toString().trim();
  if (scope === "all") return list;
  if (scope === "favorites") {
    const favorites = prefs.gifFavorites || [];
    const rank = new Map(favorites.map((url, index) => [url, index]));
    return list
      .filter((entry) => rank.has(byUrl(entry)))
      .sort((a, b) => (rank.get(byUrl(a)) || 0) - (rank.get(byUrl(b)) || 0));
  }
  if (scope.startsWith("group:")) {
    const groupId = scope.slice(6);
    const group = prefs.gifGroups.find((entry) => entry.id === groupId);
    if (!group) return [];
    const rank = new Map(group.urls.map((url, index) => [url, index]));
    return list
      .filter((entry) => rank.has(byUrl(entry)))
      .sort((a, b) => (rank.get(byUrl(a)) || 0) - (rank.get(byUrl(b)) || 0));
  }
  const usageUrls = gifScopeUsageUrls(scope, currentConversationId);
  if (usageUrls.length === 0) return [];
  const rank = new Map(usageUrls.map((url, index) => [url, index]));
  return list
    .filter((entry) => rank.has(byUrl(entry)))
    .sort((a, b) => (rank.get(byUrl(a)) || 0) - (rank.get(byUrl(b)) || 0));
}

function tenorFirstFormatUrl(formats, candidates = []) {
  if (!formats || typeof formats !== "object") return "";
  let fallbackUrl = "";
  let balancedUrl = "";
  for (const [index, key] of candidates.entries()) {
    const formatEntry = formats?.[key];
    const url = (formatEntry?.url || "").toString().trim();
    if (!url) continue;
    if (!fallbackUrl) fallbackUrl = url;
    const dims = Array.isArray(formatEntry?.dims) ? formatEntry.dims : [];
    const width = Number(dims[0]) || 0;
    const height = Number(dims[1]) || 0;
    if (width > 0 && height > 0) {
      const ratio = width / Math.max(1, height);
      const largeEnough = width >= 96 && height >= 96;
      if (largeEnough && ratio >= 0.55 && ratio <= 1.9) return url;
      if (!balancedUrl && largeEnough && ratio >= 0.35 && ratio <= 2.8) balancedUrl = url;
    } else if (index === 0) {
      // No geometry hint from provider: keep first-candidate behavior.
      return url;
    }
  }
  return balancedUrl || fallbackUrl || "";
}

function parseTenorV2Results(results, { kind = "gif" } = {}) {
  if (!Array.isArray(results)) return [];
  const stickerMode = kind === "sticker";
  const imageCandidates = stickerMode
    ? [
        "webp", "gif", "mediumgif",
        "transparentwebp", "webp_transparent", "transparentgif", "gif_transparent",
        "tinywebp", "tinygif", "tinytransparentwebp", "tinywebp_transparent", "tinytransparentgif", "tinygif_transparent",
        "nanowebp", "nanogif", "nanotransparentwebp", "nanowebp_transparent", "nanotransparentgif", "nanogif_transparent"
      ]
    : ["gif", "tinygif", "mediumgif", "nanogif"];
  const videoCandidates = stickerMode
    ? []
    : ["mp4", "tinymp4", "nanomp4", "webm", "tinywebm", "nanowebm"];
  return results
    .map((item) => {
      const formats = item?.media_formats || {};
      const imageUrl = tenorFirstFormatUrl(formats, imageCandidates);
      const videoUrl = tenorFirstFormatUrl(formats, videoCandidates);
      const preferred = imageUrl || videoUrl;
      if (!preferred) return null;
      const isVideo = !stickerMode && !imageUrl && /\.(mp4|webm|mov|m4v)(\?|$|#|&)/i.test(preferred);
      return {
        name: (item?.content_description || item?.title || (stickerMode ? "sticker" : "gif")).toString().trim().slice(0, 120) || (stickerMode ? "sticker" : "gif"),
        url: preferred,
        preview: isVideo ? "video" : "",
        source: "remote"
      };
    })
    .filter(Boolean);
}

function parseTenorV1Results(results, { kind = "gif" } = {}) {
  if (!Array.isArray(results)) return [];
  const stickerMode = kind === "sticker";
  const imageCandidates = stickerMode
    ? [
        "webp", "gif", "mediumgif",
        "transparentwebp", "webp_transparent", "transparentgif", "gif_transparent",
        "tinywebp", "tinygif", "tinytransparentwebp", "tinywebp_transparent", "tinytransparentgif", "tinygif_transparent",
        "nanowebp", "nanogif", "nanotransparentwebp", "nanowebp_transparent", "nanotransparentgif", "nanogif_transparent"
      ]
    : ["gif", "tinygif", "mediumgif", "nanogif"];
  const videoCandidates = stickerMode
    ? []
    : ["mp4", "tinymp4", "nanomp4", "webm", "tinywebm", "nanowebm"];
  return results
    .map((item) => {
      const media = Array.isArray(item?.media) ? item.media[0] : null;
      const formats = media && typeof media === "object" ? media : {};
      const imageUrl = tenorFirstFormatUrl(formats, imageCandidates);
      const videoUrl = tenorFirstFormatUrl(formats, videoCandidates);
      const preferred = imageUrl || videoUrl;
      if (!preferred) return null;
      const isVideo = !stickerMode && !imageUrl && /\.(mp4|webm|mov|m4v)(\?|$|#|&)/i.test(preferred);
      return {
        name: (item?.title || item?.content_description || (stickerMode ? "sticker" : "gif")).toString().trim().slice(0, 120) || (stickerMode ? "sticker" : "gif"),
        url: preferred,
        preview: isVideo ? "video" : "",
        source: "remote"
      };
    })
    .filter(Boolean);
}

async function fetchTenorEntries({
  query = "",
  nextCursor = "",
  kind = "gif"
} = {}) {
  if (typeof fetch !== "function") return { entries: [], next: "", error: "Fetch unavailable" };
  const { key, clientKey, customKey } = resolveTenorCredentials();
  const stickerMode = kind === "sticker";
  const buildV2Endpoint = (mediaFilter = "", searchFilter = "") => {
    const endpoint = new URL(query ? "https://tenor.googleapis.com/v2/search" : "https://tenor.googleapis.com/v2/featured");
    endpoint.searchParams.set("key", key);
    endpoint.searchParams.set("client_key", clientKey);
    endpoint.searchParams.set("limit", String(TENOR_RESULTS_PAGE_SIZE));
    if (mediaFilter) endpoint.searchParams.set("media_filter", mediaFilter);
    if (searchFilter) endpoint.searchParams.set("searchfilter", searchFilter);
    if (query) endpoint.searchParams.set("q", query);
    if (nextCursor) endpoint.searchParams.set("pos", nextCursor);
    return endpoint;
  };
  const mediaFilterCandidates = stickerMode
    ? [
        "webp,gif,mediumgif,tinywebp,tinygif,nanowebp,nanogif,transparentwebp,transparentgif",
        "webp,gif,mediumgif,tinywebp,tinygif,nanowebp,nanogif",
        "gif,tinygif,mediumgif,nanogif",
        "minimal",
        ""
      ]
    : [
        "gif,tinygif,mediumgif,nanogif,mp4,tinymp4,nanomp4",
        "gif,tinygif,mediumgif,nanogif",
        "minimal",
        ""
      ];
  const searchFilterCandidates = stickerMode ? ["sticker", "sticker,-static", ""] : [""];
  let lastError = "";
  const handleHttpError = (status) => {
    lastError = `HTTP ${status}`;
    return status === 400 || status === 401 || status === 403;
  };
  for (const searchFilter of searchFilterCandidates) {
    for (const mediaFilter of mediaFilterCandidates) {
      try {
        const response = await fetch(buildV2Endpoint(mediaFilter, searchFilter).toString(), { cache: "no-store" });
        if (!response.ok) {
          if (handleHttpError(response.status)) continue;
          return { entries: [], next: "", error: lastError };
        }
        const payload = await response.json();
        const entries = parseTenorV2Results(payload?.results, { kind });
        if (entries.length === 0 && !payload?.next && (mediaFilter || searchFilter)) {
          // Continue fallback probes until we get at least one format variant.
          continue;
        }
        return {
          entries,
          next: (payload?.next || "").toString(),
          error: ""
        };
      } catch (error) {
        lastError = String(error || "Request failed");
      }
    }
  }
  try {
    const endpoint = new URL(query ? "https://g.tenor.com/v1/search" : "https://g.tenor.com/v1/trending");
    endpoint.searchParams.set("key", key);
    endpoint.searchParams.set("client_key", clientKey);
    endpoint.searchParams.set("limit", String(TENOR_RESULTS_PAGE_SIZE));
    if (stickerMode) endpoint.searchParams.set("searchfilter", "sticker");
    if (query) endpoint.searchParams.set("q", query);
    if (nextCursor) endpoint.searchParams.set("pos", nextCursor);
    const response = await fetch(endpoint.toString(), { cache: "no-store" });
    if (response.ok) {
      const payload = await response.json();
      const entries = parseTenorV1Results(payload?.results, { kind });
      return {
        entries,
        next: (payload?.next || payload?.next_cursor || "").toString(),
        error: ""
      };
    }
    lastError = `HTTP ${response.status}`;
  } catch (error) {
    lastError = String(error || "Request failed");
  }
  if (/HTTP 400|HTTP 401|HTTP 403/i.test(lastError)) {
    const providerLabel = stickerMode ? "Sticker provider" : "GIF provider";
    return {
      entries: [],
      next: "",
      error: customKey
        ? `${providerLabel} rejected your Tenor API credentials.`
        : `${providerLabel} rejected demo Tenor credentials. Open Settings > Advanced and set your Tenor API key.`
    };
  }
  return { entries: [], next: "", error: lastError || "Request failed" };
}

async function fetchTenorGifEntries(query = "", nextCursor = "") {
  return fetchTenorEntries({ query, nextCursor, kind: "gif" });
}

async function fetchTenorStickerEntries(query = "", nextCursor = "") {
  return fetchTenorEntries({ query, nextCursor, kind: "sticker" });
}

function maybeLoadMoreGifPickerEntries({ reset = false, force = false } = {}) {
  if (mediaPickerTab !== "gif") return;
  const queryKey = gifPickerQueryKey();
  if (reset || gifPickerRemoteQueryKey !== queryKey) {
    gifPickerRemoteEntries = [];
    gifPickerRemoteNext = "";
    gifPickerRemoteError = "";
    gifPickerRemoteQueryKey = queryKey;
    gifPickerVisibleCount = GIF_PICKER_INITIAL_PAGE_SIZE;
    if (gifPickerRemoteLoading) {
      gifPickerRemoteRequestToken += 1;
      gifPickerRemoteLoading = false;
    }
  }
  if (gifPickerRemoteLoading) return;
  if (!force && !reset && gifPickerRemoteError && !gifPickerRemoteNext) return;
  if (!force && !reset && !gifPickerRemoteNext && gifPickerRemoteEntries.length > 0) return;
  const requestToken = ++gifPickerRemoteRequestToken;
  gifPickerRemoteLoading = true;
  if (force) gifPickerRemoteError = "";
  const cursor = reset ? "" : gifPickerRemoteNext;
  fetchTenorGifEntries(queryKey, cursor)
    .then(({ entries, next, error }) => {
      if (requestToken !== gifPickerRemoteRequestToken || queryKey !== gifPickerRemoteQueryKey) return;
      const previousCount = gifPickerRemoteEntries.length;
      appendGifPickerEntries(entries);
      const appendedCount = Math.max(0, gifPickerRemoteEntries.length - previousCount);
      gifPickerRemoteNext = (next || "").toString();
      if (error) {
        gifPickerRemoteError = (error || "").toString().slice(0, 220) || "Could not load remote GIFs right now.";
        return;
      }
      if (appendedCount === 0 && !gifPickerRemoteNext) {
        gifPickerRemoteError = "No more GIFs from provider.";
        return;
      }
      gifPickerRemoteError = "";
    })
    .catch(() => {
      if (requestToken !== gifPickerRemoteRequestToken || queryKey !== gifPickerRemoteQueryKey) return;
      gifPickerRemoteError = "Could not load remote GIFs right now.";
    })
    .finally(() => {
      if (requestToken !== gifPickerRemoteRequestToken || queryKey !== gifPickerRemoteQueryKey) return;
      gifPickerRemoteLoading = false;
      if (mediaPickerOpen && mediaPickerTab === "gif") renderMediaPicker();
    });
}

function maybeLoadMoreStickerPickerEntries({ reset = false, force = false } = {}) {
  if (mediaPickerTab !== "sticker") return;
  const queryKey = stickerPickerQueryKey();
  if (reset || stickerPickerRemoteQueryKey !== queryKey) {
    stickerPickerRemoteEntries = [];
    stickerPickerRemoteNext = "";
    stickerPickerRemoteError = "";
    stickerPickerRemoteQueryKey = queryKey;
    stickerPickerVisibleCount = STICKER_PICKER_INITIAL_PAGE_SIZE;
    if (stickerPickerRemoteLoading) {
      stickerPickerRemoteRequestToken += 1;
      stickerPickerRemoteLoading = false;
    }
  }
  if (stickerPickerRemoteLoading) return;
  if (!force && !reset && stickerPickerRemoteError && !stickerPickerRemoteNext) return;
  if (!force && !reset && !stickerPickerRemoteNext && stickerPickerRemoteEntries.length > 0) return;
  const requestToken = ++stickerPickerRemoteRequestToken;
  stickerPickerRemoteLoading = true;
  if (force) stickerPickerRemoteError = "";
  const cursor = reset ? "" : stickerPickerRemoteNext;
  fetchTenorStickerEntries(queryKey, cursor)
    .then(({ entries, next, error }) => {
      if (requestToken !== stickerPickerRemoteRequestToken || queryKey !== stickerPickerRemoteQueryKey) return;
      const previousCount = stickerPickerRemoteEntries.length;
      appendStickerPickerEntries(entries);
      const appendedCount = Math.max(0, stickerPickerRemoteEntries.length - previousCount);
      stickerPickerRemoteNext = (next || "").toString();
      if (error) {
        stickerPickerRemoteError = (error || "").toString().slice(0, 220) || "Could not load remote stickers right now.";
        return;
      }
      if (appendedCount === 0 && !stickerPickerRemoteNext) {
        stickerPickerRemoteError = "No more stickers from provider.";
        return;
      }
      stickerPickerRemoteError = "";
    })
    .catch(() => {
      if (requestToken !== stickerPickerRemoteRequestToken || queryKey !== stickerPickerRemoteQueryKey) return;
      stickerPickerRemoteError = "Could not load remote stickers right now.";
    })
    .finally(() => {
      if (requestToken !== stickerPickerRemoteRequestToken || queryKey !== stickerPickerRemoteQueryKey) return;
      stickerPickerRemoteLoading = false;
      if (mediaPickerOpen && mediaPickerTab === "sticker") renderMediaPicker();
    });
}

function maybeAutoloadMediaPickerOnScroll() {
  if (!mediaPickerOpen) return;
  if (mediaPickerTab !== "gif" && mediaPickerTab !== "sticker" && mediaPickerTab !== "emoji") return;
  if (mediaPickerScrollLoadRaf) return;
  mediaPickerScrollLoadRaf = requestAnimationFrame(() => {
    mediaPickerScrollLoadRaf = 0;
    const grid = ui.mediaGrid;
    if (!(grid instanceof HTMLElement)) return;
    const nearBottom = grid.scrollTop + grid.clientHeight >= grid.scrollHeight - 220;
    if (!nearBottom) return;
    if (mediaPickerTab === "gif") {
      const entries = filteredMediaEntries();
      const visibleLimit = Math.max(GIF_PICKER_INITIAL_PAGE_SIZE, gifPickerVisibleCount);
      if (entries.length > visibleLimit) {
        gifPickerVisibleCount = Math.min(GIF_PICKER_VISIBLE_MAX, gifPickerVisibleCount + GIF_PICKER_PAGE_STEP);
        renderMediaPicker();
        return;
      }
      if (activeGifScope() !== "all") return;
      if (gifPickerRemoteLoading || gifPickerRemoteError) return;
      maybeLoadMoreGifPickerEntries({ reset: false });
      renderMediaPicker();
      return;
    }
    if (mediaPickerTab === "sticker") {
      const entries = filteredMediaEntries();
      const visibleLimit = Math.max(STICKER_PICKER_INITIAL_PAGE_SIZE, stickerPickerVisibleCount);
      if (entries.length > visibleLimit) {
        stickerPickerVisibleCount = Math.min(STICKER_PICKER_VISIBLE_MAX, stickerPickerVisibleCount + STICKER_PICKER_PAGE_STEP);
        renderMediaPicker();
        return;
      }
      if (stickerPickerRemoteLoading || stickerPickerRemoteError) return;
      maybeLoadMoreStickerPickerEntries({ reset: false });
      renderMediaPicker();
      return;
    }
    const entries = filteredMediaEntries();
    const visibleLimit = Math.max(EMOJI_PICKER_INITIAL_PAGE_SIZE, emojiPickerVisibleCount);
    if (entries.length > visibleLimit) {
      emojiPickerVisibleCount = Math.min(6000, emojiPickerVisibleCount + EMOJI_PICKER_PAGE_STEP);
      renderMediaPicker();
      return;
    }
    if (!emojiLibraryLoaded && !emojiLibraryLoading && !emojiLibraryError) {
      void ensureEmojiLibraryLoaded();
    }
  });
}

function filteredMediaEntries() {
  const term = mediaPickerQuery.trim().toLowerCase();
  const normalizedTerm = term.replace(/^:+|:+$/g, "");
  let entries = mediaEntriesForActiveTab();
  if (mediaPickerTab === "gif") entries = applyGifScopeToEntries(entries);
  if (!term) return entries;
  return entries.filter((entry) => {
    const name = (entry.name || "").toLowerCase();
    if (name.includes(term) || name.includes(normalizedTerm)) return true;
    if (mediaPickerTab === "emoji") {
      const aliases = Array.isArray(entry.aliases) ? entry.aliases.join(" ").toLowerCase() : "";
      const keywords = Array.isArray(entry.keywords) ? entry.keywords.join(" ").toLowerCase() : "";
      const value = (entry.value || "").toString();
      if (aliases.includes(term) || aliases.includes(normalizedTerm)) return true;
      if (keywords.includes(term) || keywords.includes(normalizedTerm)) return true;
      if (value.includes(term) || value.includes(normalizedTerm)) return true;
    }
    return false;
  });
}

function rememberMediaPickerTab(tab) {
  if (!MEDIA_TABS.includes(tab)) return;
  state.preferences = getPreferences();
  state.preferences.mediaLastTab = tab;
}

function renderComposerMediaButtons() {
  ui.openMediaPickerBtn?.classList.toggle("message-form__media-btn--active", mediaPickerOpen);
  ui.openGifPickerBtn?.classList.toggle("message-form__media-btn--active", mediaPickerOpen && mediaPickerTab === "gif");
  ui.openStickerPickerBtn?.classList.toggle("message-form__media-btn--active", mediaPickerOpen && mediaPickerTab === "sticker");
  ui.openEmojiPickerBtn?.classList.toggle("message-form__media-btn--active", mediaPickerOpen && mediaPickerTab === "emoji");
}

function configureMediaPickerEmojiMode(enabled, { onSelect = null } = {}) {
  mediaPickerEmojiOnlyMode = Boolean(enabled);
  mediaPickerEmojiSelectHandler = mediaPickerEmojiOnlyMode && typeof onSelect === "function"
    ? onSelect
    : null;
  if (!(ui.mediaPicker instanceof HTMLElement)) return;
  ui.mediaPicker.classList.toggle("media-picker--emoji-only", mediaPickerEmojiOnlyMode);
  ui.mediaTabs.forEach((tabBtn) => {
    const tab = (tabBtn.dataset.mediaTab || "").toString();
    tabBtn.hidden = mediaPickerEmojiOnlyMode && tab !== "emoji";
  });
  if (ui.addMediaUrlBtn) ui.addMediaUrlBtn.hidden = mediaPickerEmojiOnlyMode;
  if (ui.addMediaFileBtn) ui.addMediaFileBtn.hidden = mediaPickerEmojiOnlyMode;
}

function closeMediaPicker() {
  mediaPickerOpen = false;
  configureMediaPickerEmojiMode(false);
  if (gifPickerQueryDebounceTimer) {
    clearTimeout(gifPickerQueryDebounceTimer);
    gifPickerQueryDebounceTimer = null;
  }
  if (mediaPickerScrollLoadRaf) {
    cancelAnimationFrame(mediaPickerScrollLoadRaf);
    mediaPickerScrollLoadRaf = 0;
  }
  ui.mediaPicker.classList.add("media-picker--hidden");
  renderComposerMediaButtons();
}

function openMediaPicker({ emojiOnly = false, onEmojiSelect = null } = {}) {
  configureMediaPickerEmojiMode(emojiOnly, { onSelect: onEmojiSelect });
  if (mediaPickerEmojiOnlyMode && mediaPickerTab !== "emoji") {
    mediaPickerTab = "emoji";
  }
  mediaPickerOpen = true;
  ui.mediaPicker.classList.remove("media-picker--hidden");
  rememberMediaPickerTab(mediaPickerTab);
  renderMediaPicker();
  if (mediaPickerTab === "gif") {
    if (activeGifScope() === "all") {
      maybeLoadMoreGifPickerEntries({ reset: gifPickerRemoteQueryKey !== gifPickerQueryKey() });
    }
  } else if (mediaPickerTab === "sticker") {
    maybeLoadMoreStickerPickerEntries({ reset: stickerPickerRemoteQueryKey !== stickerPickerQueryKey() });
  } else if (mediaPickerTab === "emoji") {
    void ensureEmojiLibraryLoaded();
  }
  renderComposerMediaButtons();
  ui.mediaSearchInput.focus();
}

function openMediaPickerWithTab(tab, {
  resetQuery = false,
  emojiOnly = false,
  onEmojiSelect = null
} = {}) {
  const targetTab = emojiOnly ? "emoji" : tab;
  if (MEDIA_TABS.includes(targetTab)) {
    if (mediaPickerTab !== targetTab) {
      gifPickerVisibleCount = GIF_PICKER_INITIAL_PAGE_SIZE;
      stickerPickerVisibleCount = STICKER_PICKER_INITIAL_PAGE_SIZE;
      emojiPickerVisibleCount = EMOJI_PICKER_INITIAL_PAGE_SIZE;
    }
    mediaPickerTab = targetTab;
    rememberMediaPickerTab(targetTab);
  }
  if (resetQuery) mediaPickerQuery = "";
  openMediaPicker({ emojiOnly, onEmojiSelect });
}

function toggleMediaPicker() {
  if (mediaPickerOpen) {
    closeMediaPicker();
  } else {
    openMediaPicker();
  }
}

function ensureMediaRuntimeBootstrapped() {
  if (mediaRuntimeBootstrapped) return;
  mediaRuntimeBootstrapped = true;
  void deployMediaRuntimes();
}

function warmMediaPickerRuntimes() {
  if (!mediaRuntimeWarmed) {
    mediaRuntimeWarmed = true;
    ensureMediaRuntimeBootstrapped();
  } else if (!window.RufflePlayer?.newest || !(typeof customElements !== "undefined" && customElements.get("dotlottie-player"))) {
    void deployMediaRuntimes();
  }
  void ensureEmojiLibraryLoaded();
}

function mediaPlaceholderForTab(tab) {
  if (tab === "gif") return "Search GIFs";
  if (tab === "sticker") return "Search stickers";
  if (tab === "emoji") return "Search emojis";
  if (tab === "swf") return "Search SWFs";
  if (tab === "svg") return "Search SVGs";
  if (tab === "pdf") return "Search PDFs";
  if (tab === "text") return "Search text files";
  if (tab === "docs") return "Search documents";
  if (tab === "html") return "Search HTML embeds";
  return "Search media";
}

function insertTextAtCursor(text) {
  const input = ui.messageInput;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const merged = `${input.value.slice(0, start)}${text}${input.value.slice(end)}`;
  input.value = trimTextForConversation(merged, getActiveConversation());
  const cursor = Math.min(start + text.length, input.value.length);
  input.setSelectionRange(cursor, cursor);
  input.focus();
  setComposerDraft(composerDraftConversationId, input.value);
  queueComposerDraftSave();
  renderComposerMeta();
}

function findEmojiEntryByValue(value) {
  return emojiLibraryEntries.find((entry) => entry.value === value) || null;
}

function rememberRecentEmoji(value) {
  const emoji = (value || "").toString().trim();
  if (!emoji) return;
  state.preferences = getPreferences();
  const current = normalizeRecentEmojis(state.preferences.recentEmojis);
  state.preferences.recentEmojis = [emoji, ...current.filter((item) => item !== emoji)].slice(0, 24);
}

function quickReactionEmojiChoices(limit = 3) {
  const max = Math.max(1, Math.min(8, Number(limit) || 3));
  const prefs = getPreferences();
  const recents = normalizeRecentEmojis(prefs.recentEmojis);
  const choices = [];
  const add = (emoji) => {
    const token = (emoji || "").toString().trim();
    if (!token || choices.includes(token)) return;
    choices.push(token);
  };
  recents.forEach(add);
  DEFAULT_REACTIONS.forEach(add);
  return choices.slice(0, max);
}

function stickerFormatFromName(name, url) {
  const value = `${name || ""} ${url || ""}`.toLowerCase();
  if (value.includes(".lottie")) return "dotlottie";
  if (value.includes(".apng")) return "apng";
  return "image";
}

function attachmentTypeForMediaPickerTab(tab, entry = null) {
  if (tab === "gif") return "gif";
  if (tab === "sticker") return "sticker";
  if (tab === "swf") return "swf";
  if (tab === "html") return "html";
  if (tab === "pdf") return "pdf";
  if (tab === "text") return "text";
  if (tab === "docs") return entry?.type === "rtf" ? "rtf" : "odf";
  return "svg";
}

function sendMediaAttachment(entry, type) {
  const conversation = getActiveConversation();
  const account = getCurrentAccount();
  if (!conversation || !account || !entry || !entry.url) return;
  const attachmentUrl = typeof canonicalizeAttachmentUrlForStorage === "function"
    ? canonicalizeAttachmentUrlForStorage(entry.url, { kind: type })
    : entry.url;
  const text = trimTextForConversation((ui.messageInput.value || "").trim(), conversation);
  const nextReply = replyTarget && replyTarget.channelId === conversation.id
    ? { messageId: replyTarget.messageId, authorName: replyTarget.authorName, text: replyTarget.text }
    : null;
  const nextMessage = {
    id: createId(),
    userId: account.id,
    authorName: "",
    text,
    ts: new Date().toISOString(),
    reactions: [],
    attachments: [{
      type,
      url: attachmentUrl,
      name: entry.name || type,
      format: entry.format || (type === "sticker" ? stickerFormatFromName(entry.name, entry.url) : "image")
    }],
    replyTo: nextReply
  };
  if (conversation.type === "channel" && conversation.channel.type === "forum") {
    if (nextReply?.threadId) {
      nextMessage.forumThreadId = nextReply.threadId;
      nextMessage.forumParentId = nextReply.messageId || nextReply.threadId;
    } else {
      if (!canCurrentUserCreateThreadsInChannel(conversation.channel, getActiveGuild())) {
        showToast("You do not have permission to create forum posts in this channel.", { tone: "error" });
        renderComposerMeta();
        return;
      }
      const [firstLine, ...rest] = text.split("\n");
      nextMessage.forumTitle = (firstLine || "Untitled Post").trim().slice(0, 100) || "Untitled Post";
      nextMessage.text = rest.join("\n").trim();
      const defaultTags = normalizeThreadTagIds(
        getForumThreadTagFilter(conversation.channel.id),
        forumTagsForChannel(conversation.channel)
      );
      if (defaultTags.length > 0) nextMessage.forumTagIds = defaultTags;
    }
  }
  if (conversation.type === "dm") {
    conversation.thread.messages.push(nextMessage);
    publishRelayDirectMessage(conversation.thread, nextMessage, account);
  } else {
    conversation.channel.messages.push(nextMessage);
    recordChannelSlowmodeSend(conversation.channel, account.id);
    publishRelayChannelMessage(conversation.channel, nextMessage, account);
  }
  if (type === "gif") {
    trackGifUsage(entry.url, conversation.id);
  }
  if (type === "swf") {
    addDebugLog("info", "Sent SWF attachment message", { url: attachmentUrl, name: entry.name || "" });
  }
  replyTarget = null;
  ui.messageInput.value = "";
  setComposerDraft(conversation.id, "");
  composerTempLimitConversationId = null;
  composerTempLimitExtra = 0;
  applyComposerInputLimit();
  resizeComposerInput();
  saveState();
  closeMediaPicker();
  if (swfPipTabs.length > 0) {
    appendMessageRowLite(conversation.type === "dm" ? conversation.thread : conversation.channel, nextMessage);
    renderChannels();
    renderMemberList();
  } else {
    render();
  }
}

function settleMediaUrlDialog(result = null) {
  if (!(mediaUrlDialogResolver instanceof Function)) return;
  const resolve = mediaUrlDialogResolver;
  mediaUrlDialogResolver = null;
  resolve(result);
}

async function openMediaUrlEntryDialog(tab) {
  const nameLabel = tab === "emoji" ? "emoji short name" : `${tab} name`;
  if (!ui.mediaUrlDialog || !ui.mediaUrlNameInput || !ui.mediaUrlInput) {
    const typedName = await showInAppPromptDialog({
      title: `Add ${tab.toUpperCase()} name`,
      message: `Add ${nameLabel}`,
      defaultValue: ""
    });
    if (typedName === null) return null;
    const typedUrl = await showInAppPromptDialog({
      title: `Add ${tab.toUpperCase()} URL`,
      message: `Add ${tab.toUpperCase()} URL`,
      defaultValue: "https://"
    });
    if (!typedUrl) return null;
    return { typedName, typedUrl };
  }
  if (mediaUrlDialogResolver instanceof Function) settleMediaUrlDialog(null);
  if (ui.mediaUrlDialogTitle) ui.mediaUrlDialogTitle.textContent = `Add ${tab.toUpperCase()} URL`;
  if (ui.mediaUrlNameLabel) ui.mediaUrlNameLabel.textContent = `Name (${nameLabel})`;
  ui.mediaUrlNameInput.value = "";
  ui.mediaUrlInput.value = "https://";
  return new Promise((resolve) => {
    mediaUrlDialogResolver = resolve;
    if (!ui.mediaUrlDialog.open) ui.mediaUrlDialog.showModal();
    requestAnimationFrame(() => {
      ui.mediaUrlNameInput?.focus();
      ui.mediaUrlNameInput?.select();
    });
  });
}

function enforceStickerPreviewSizing(element) {
  if (!(element instanceof HTMLElement)) return;
  element.style.width = "100%";
  element.style.minWidth = "100%";
  element.style.aspectRatio = "16 / 10";
  element.style.minHeight = "156px";
  element.style.height = "156px";
  element.style.maxHeight = "156px";
  element.style.flex = "0 0 156px";
  element.style.display = "block";
  element.style.objectFit = "cover";
  element.style.objectPosition = "center";
}

function mediaPickerEntryIsUserAdded(entry) {
  const source = (entry?.source || "").toString().trim().toLowerCase();
  return source === "guild-custom" || source === "user-custom" || source === "user";
}

function mediaUrlAcceptedByPicker(rawUrl = "") {
  const url = (rawUrl || "").toString().trim();
  if (!url) return false;
  if (/^https?:\/\//i.test(url)) return true;
  if (/^data:/i.test(url)) return true;
  // XEP-0454 encrypted media and xmpp URI links are valid OOB payload targets.
  if (/^aesgcm:\/\//i.test(url)) return true;
  if (/^xmpp:/i.test(url)) return true;
  return false;
}

async function addMediaFromUrlFlow() {
  const tab = mediaPickerTab;
  const details = await openMediaUrlEntryDialog(tab);
  if (!details) return;
  const { typedName = "", typedUrl = "" } = details;
  const name = sanitizeMediaName(typedName, `${tab}-${Date.now().toString().slice(-4)}`);
  const url = typedUrl.trim();
  if (!mediaUrlAcceptedByPicker(url)) {
    showToast("Only http(s), data:, aesgcm://, or xmpp: URLs are supported.", { tone: "error" });
    return;
  }
  const inferredType = inferAttachmentTypeFromUrl(url);
  const resolvedType = tab === "docs"
    ? (inferredType === "rtf" ? "rtf" : "odf")
    : tab === "text"
      ? "text"
      : tab === "pdf"
        ? "pdf"
        : inferredType;
  if (upsertGuildResource(tab, {
    name,
    url,
    format: tab === "sticker" ? stickerFormatFromName(name, url) : "image",
    type: resolvedType || tab
  })) {
    saveState();
    renderMediaPicker();
    showToast("Added media URL.");
  } else {
    showToast("Could not add media URL.", { tone: "error" });
  }
}

function fileAcceptForTab(tab) {
  if (tab === "gif") return "image/gif,image/webp,video/mp4,video/webm";
  if (tab === "sticker") return "image/png,image/apng,image/gif,image/webp,image/svg+xml,.apng,.lottie";
  if (tab === "emoji") return "image/png,image/gif,image/webp,image/svg+xml";
  if (tab === "swf") return ".swf,application/x-shockwave-flash";
  if (tab === "svg") return "image/svg+xml,.svg";
  if (tab === "pdf") return ".pdf,application/pdf";
  if (tab === "text") return ".txt,.md,.log,.json,.js,.ts,.css,.xml,.yml,.yaml,.ini,.toml,text/plain,application/json,text/markdown";
  if (tab === "docs") return ".odt,.ods,.odp,.rtf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,application/vnd.oasis.opendocument.text,application/vnd.oasis.opendocument.spreadsheet,application/vnd.oasis.opendocument.presentation,application/rtf,text/rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (tab === "html") return "text/html,.html,.htm";
  return "*/*";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

async function addMediaFromFileFlow(file) {
  if (!file) return;
  const tab = mediaPickerTab;
  const name = sanitizeMediaName(file.name.replace(/\.[^/.]+$/, ""), `${tab}-${Date.now().toString().slice(-4)}`);
  try {
    const url = await readFileAsDataUrl(file);
    const inferredType = inferAttachmentTypeFromFile(file);
    const inferredTab = inferredType === "odf" || inferredType === "rtf"
      ? "docs"
      : inferredType === "text"
        ? "text"
        : inferredType === "pdf"
          ? "pdf"
          : inferredType;
    const targetTab = tab === "docs" || tab === "text" || tab === "pdf" || inferredTab === tab ? tab : inferredTab;
    const format = targetTab === "sticker" ? stickerFormatFromName(file.name, url) : "image";
    if (upsertGuildResource(targetTab, { name, url, format, type: inferredType })) {
      saveState();
      if (targetTab !== mediaPickerTab) {
        mediaPickerTab = targetTab;
      }
      renderMediaPicker();
    }
  } catch {
    // Ignore failed local resource import.
  } finally {
    ui.mediaFileInput.value = "";
  }
}

function renderSwfPickerPreview(host, entry, index = 0, renderToken = mediaPickerRenderToken) {
  host.innerHTML = "";
  host.style.display = "grid";
  host.style.placeItems = "center";
  host.style.color = "#c4ccd8";
  host.style.fontSize = "0.76rem";
  host.textContent = "SWF";
  if (!window.RufflePlayer?.newest) {
    host.textContent = "Ruffle…";
    if (!swfPreviewBootstrapInFlight) {
      swfPreviewBootstrapInFlight = true;
      void deployMediaRuntimes().finally(() => {
        swfPreviewBootstrapInFlight = false;
        if (mediaPickerOpen && mediaPickerTab === "swf") renderMediaPicker();
      });
    }
    return;
  }
  try {
    const player = window.RufflePlayer.newest().createPlayer();
    player.style.pointerEvents = "none";
    if ("volume" in player) player.volume = 0;
    if ("muted" in player) player.muted = true;
    if (typeof player.set_volume === "function") player.set_volume(0);
    player.style.width = "100%";
    player.style.height = "100%";
    host.innerHTML = "";
    host.appendChild(player);
    if (!host.isConnected || renderToken !== mediaPickerRenderToken) return;
    const mediaUrl = resolveMediaUrl(entry.url);
    Promise.resolve(player.load({
      url: mediaUrl,
      autoplay: "off",
      unmuteOverlay: "hidden",
      scale: "showAll",
      forceScale: true,
      letterbox: "on",
      openUrlMode: "deny"
    })).then(() => {
      if (!host.isConnected || renderToken !== mediaPickerRenderToken) return;
      try {
        if ("volume" in player) player.volume = 0;
        if ("muted" in player) player.muted = true;
        if (typeof player.set_volume === "function") player.set_volume(0);
        if (typeof player.play === "function") player.play();
      } catch {
        // Ignore preview sampling failures.
      }
    }).catch((error) => {
      addDebugLog("warn", "SWF picker preview failed", { name: entry?.name || "", url: mediaUrl, error: String(error) });
      host.innerHTML = "";
      host.textContent = "SWF";
    });
  } catch {
    host.innerHTML = "";
    host.textContent = "SWF";
  }
}

function appendMediaPickerPrivacyBanner({
  hiddenCount = 0,
  hiddenGatedUrls = new Set(),
  hiddenGatedHosts = new Set(),
  hiddenBlockedHosts = new Set()
} = {}) {
  if (!(ui.mediaGrid instanceof HTMLElement)) return false;
  const totalHidden = Math.max(0, Number(hiddenCount) || 0);
  if (totalHidden <= 0) return false;
  const gatedUrls = hiddenGatedUrls instanceof Set ? [...hiddenGatedUrls].filter(Boolean) : [];
  const gatedHosts = hiddenGatedHosts instanceof Set
    ? [...hiddenGatedHosts].filter(Boolean).sort((a, b) => a.localeCompare(b))
    : [];
  const blockedHosts = hiddenBlockedHosts instanceof Set
    ? [...hiddenBlockedHosts].filter(Boolean).sort((a, b) => a.localeCompare(b))
    : [];
  const gate = document.createElement("div");
  gate.className = "media-picker__privacy-banner";
  const heading = document.createElement("strong");
  heading.textContent = `${totalHidden} external item${totalHidden === 1 ? "" : "s"} hidden by privacy rules.`;
  const meta = document.createElement("small");
  const metaBits = [];
  if (gatedHosts.length > 0) {
    const preview = gatedHosts.slice(0, 6).join(", ");
    metaBits.push(`Untrusted hosts: ${preview}${gatedHosts.length > 6 ? " …" : ""}`);
  } else {
    metaBits.push("No untrusted hosts available for one-time allow");
  }
  if (blockedHosts.length > 0) {
    const preview = blockedHosts.slice(0, 6).join(", ");
    metaBits.push(`Deny-listed hosts: ${preview}${blockedHosts.length > 6 ? " …" : ""}`);
  }
  meta.textContent = metaBits.join(" · ");
  const actions = document.createElement("div");
  actions.className = "media-picker__privacy-actions";
  const allowOnceBtn = document.createElement("button");
  allowOnceBtn.type = "button";
  allowOnceBtn.textContent = "Allow Hidden Once";
  allowOnceBtn.disabled = gatedUrls.length <= 0;
  allowOnceBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (gatedUrls.length <= 0) {
      showToast("Hidden media is deny-listed. Remove deny rules to show it.", { tone: "error" });
      return;
    }
    gatedUrls.forEach((url) => allowMediaUrlOnce(url));
    renderMediaPicker();
    showToast("Temporarily allowed hidden media for this session.");
  });
  const trustBtn = document.createElement("button");
  trustBtn.type = "button";
  trustBtn.textContent = "Trust Hidden Hosts";
  trustBtn.disabled = gatedHosts.length <= 0;
  trustBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (gatedHosts.length <= 0) {
      showToast("No untrusted hosts available to trust.");
      return;
    }
    let added = 0;
    gatedHosts.forEach((host) => {
      const rule = suggestSubdomainTrustRule(host) || host;
      if (addMediaTrustRule(rule)) added += 1;
    });
    if (added > 0) {
      saveState();
      renderMediaPrivacyRuleEditor();
      renderMediaPicker();
      showToast(`Added ${added} trust rule${added === 1 ? "" : "s"}.`);
    } else {
      showToast("Hidden hosts are already trusted.");
    }
  });
  const settingsBtn = document.createElement("button");
  settingsBtn.type = "button";
  settingsBtn.textContent = "Advanced Rules";
  settingsBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openSettingsScreen();
    setSettingsTab("advanced");
  });
  actions.appendChild(allowOnceBtn);
  actions.appendChild(trustBtn);
  actions.appendChild(settingsBtn);
  let hostActions = null;
  if (gatedHosts.length > 0) {
    hostActions = document.createElement("div");
    hostActions.className = "media-picker__privacy-hosts";
    const hostLimit = 14;
    gatedHosts.slice(0, hostLimit).forEach((host) => {
      const trustHostBtn = document.createElement("button");
      trustHostBtn.type = "button";
      trustHostBtn.className = "media-picker__privacy-host-btn";
      trustHostBtn.textContent = `Trust ${host}`;
      trustHostBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!addMediaTrustRule(host)) {
          showToast(`${host} is already trusted or invalid.`);
          return;
        }
        saveState();
        renderMediaPrivacyRuleEditor();
        renderMediaPicker();
        showToast(`Trusted ${host}.`);
      });
      hostActions.appendChild(trustHostBtn);
    });
    if (gatedHosts.length > hostLimit) {
      const more = document.createElement("small");
      more.textContent = `${gatedHosts.length - hostLimit} more host${gatedHosts.length - hostLimit === 1 ? "" : "s"} hidden`;
      hostActions.appendChild(more);
    }
  }
  gate.appendChild(heading);
  gate.appendChild(meta);
  gate.appendChild(actions);
  if (hostActions) gate.appendChild(hostActions);
  ui.mediaGrid.appendChild(gate);
  return true;
}

/*
 * Emoji dataset loading + picker rendering extracted from app.js
 * to keep XEP-0066/0071/0231 media UX code in xeps/.
 */

function normalizeEmojiLibraryEntry(entry, source = "builtin") {
  if (!entry || typeof entry !== "object") return null;
  const value = (entry.value || entry.emoji || entry.unicode || "").toString().trim();
  if (!value) return null;
  const rawName = (entry.name || entry.annotation || entry.label || "").toString().trim();
  const fallbackName = [...value].map((ch) => ch.codePointAt(0)?.toString(16).padStart(4, "0")).join("_");
  const normalizedName = sanitizeMediaName(rawName.toLowerCase().replace(/\s+/g, "_"), `emoji_${fallbackName}`);
  const aliases = Array.isArray(entry.aliases)
    ? entry.aliases
    : Array.isArray(entry.shortcodes)
      ? entry.shortcodes
      : typeof entry.shortcode === "string"
        ? [entry.shortcode]
        : [];
  const keywords = Array.isArray(entry.keywords)
    ? entry.keywords
    : Array.isArray(entry.tags)
      ? entry.tags
      : [];
  return {
    name: normalizedName || `emoji_${fallbackName}`,
    value,
    aliases: [...new Set(aliases.map((item) => (item || "").toString().trim().toLowerCase()).filter(Boolean))].slice(0, 24),
    keywords: [...new Set(keywords.map((item) => (item || "").toString().trim().toLowerCase()).filter(Boolean))].slice(0, 32),
    source: (entry.source || source || "builtin").toString()
  };
}

function normalizeEmojiDatasetEntries(rawEntries) {
  if (!Array.isArray(rawEntries)) return [];
  const deduped = new Map();
  const appendEntry = (entry) => {
    const normalized = normalizeEmojiLibraryEntry(entry, "builtin");
    if (!normalized) return;
    if (deduped.has(normalized.value)) return;
    deduped.set(normalized.value, normalized);
  };
  rawEntries.forEach((entry) => {
    appendEntry(entry);
    if (Array.isArray(entry?.skins)) {
      entry.skins.forEach((skin) => {
        appendEntry({
          ...skin,
          name: (entry?.annotation || entry?.name || entry?.label || "").toString() || skin?.annotation || skin?.name || "",
          aliases: Array.isArray(entry?.shortcodes) ? entry.shortcodes : skin?.shortcodes || [],
          keywords: Array.isArray(entry?.tags) ? entry.tags : skin?.tags || []
        });
      });
    }
  });
  return [...deduped.values()];
}

function normalizeEmojiCachedEntries(rawEntries) {
  if (!Array.isArray(rawEntries)) return [];
  const deduped = new Map();
  rawEntries.forEach((entry) => {
    const normalized = normalizeEmojiLibraryEntry(entry, "builtin");
    if (!normalized) return;
    if (deduped.has(normalized.value)) return;
    deduped.set(normalized.value, normalized);
  });
  return [...deduped.values()];
}

function parseEmojiTestDataset(text) {
  if (typeof text !== "string" || !text.trim()) return [];
  const deduped = new Map();
  text.split(/\r?\n/).forEach((line) => {
    const clean = line.trim();
    if (!clean || clean.startsWith("#")) return;
    if (!/;\s*fully-qualified/.test(clean)) return;
    const hashIndex = clean.indexOf("#");
    if (hashIndex <= 0) return;
    const left = clean.slice(0, hashIndex).trim();
    const right = clean.slice(hashIndex + 1).trim();
    const codepointHex = left.split(";")[0].trim();
    if (!codepointHex) return;
    const codepoints = codepointHex.split(/\s+/).map((token) => Number.parseInt(token, 16)).filter(Number.isFinite);
    if (codepoints.length === 0) return;
    let value = "";
    try {
      value = String.fromCodePoint(...codepoints);
    } catch {
      value = "";
    }
    if (!value || deduped.has(value)) return;
    const nameMatch = right.match(/^\S+\s+E[\d.]+\s+(.+)$/);
    const label = (nameMatch?.[1] || "").toString().trim();
    const words = label.toLowerCase().split(/[\s,_-]+/).filter(Boolean);
    const alias = words.slice(0, 4).join("_");
    const normalized = normalizeEmojiLibraryEntry({
      value,
      name: label || value,
      aliases: alias ? [alias] : [],
      keywords: words.slice(0, 12)
    }, "builtin");
    if (!normalized) return;
    deduped.set(value, normalized);
  });
  return [...deduped.values()];
}

function loadCachedEmojiDataset() {
  try {
    const raw = localStorage.getItem(EMOJI_DATASET_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.some((entry) => entry && typeof entry.value === "string")) {
      return normalizeEmojiCachedEntries(parsed);
    }
    return normalizeEmojiDatasetEntries(parsed);
  } catch {
    return [];
  }
}

function cacheEmojiDataset(normalizedEntries) {
  try {
    if (!Array.isArray(normalizedEntries) || normalizedEntries.length === 0) return;
    localStorage.setItem(EMOJI_DATASET_CACHE_KEY, JSON.stringify(normalizedEntries));
  } catch {
    // Ignore quota/storage failures.
  }
}

async function ensureEmojiLibraryLoaded({ force = false } = {}) {
  if (emojiLibraryLoading && emojiLibraryLoadPromise) return emojiLibraryLoadPromise;
  if (!force && emojiLibraryLoaded) return emojiLibraryEntries;
  if (!force) {
    const cached = loadCachedEmojiDataset();
    if (cached.length > 0) {
      emojiLibraryEntries = cached;
      emojiLibraryLoaded = true;
      emojiLibraryError = "";
      return emojiLibraryEntries;
    }
  }
  emojiLibraryLoading = true;
  emojiLibraryError = "";
  emojiLibraryLoadPromise = (async () => {
    let lastError = "";
    for (const source of EMOJI_DATASET_SOURCES) {
      try {
        const response = await fetch(source, { cache: "no-store" });
        if (!response.ok) {
          lastError = `HTTP ${response.status}`;
          continue;
        }
        const isTextDataset = /\.txt(\?|$)/i.test(source);
        const normalized = isTextDataset
          ? parseEmojiTestDataset(await response.text())
          : normalizeEmojiDatasetEntries(await response.json());
        if (normalized.length === 0) {
          lastError = "Dataset was empty";
          continue;
        }
        emojiLibraryEntries = normalized;
        emojiLibraryLoaded = true;
        emojiLibraryError = "";
        cacheEmojiDataset(normalized);
        return emojiLibraryEntries;
      } catch (error) {
        lastError = String(error || "Request failed");
      }
    }
    emojiLibraryLoaded = false;
    emojiLibraryError = lastError ? `Could not load full emoji set (${lastError}).` : "Could not load full emoji set.";
    return emojiLibraryEntries;
  })().finally(() => {
    emojiLibraryLoading = false;
    emojiLibraryLoadPromise = null;
    if (mediaPickerOpen && mediaPickerTab === "emoji") renderMediaPicker();
  });
  return emojiLibraryLoadPromise;
}

function renderMediaPicker() {
  const renderToken = ++mediaPickerRenderToken;
  renderComposerMediaButtons();
  if (ui.mediaGrid) {
    ui.mediaGrid.classList.toggle("media-picker__grid--sticker", mediaPickerTab === "sticker");
  }
  ui.mediaTabs.forEach((tabBtn) => {
    tabBtn.classList.toggle("active", tabBtn.dataset.mediaTab === mediaPickerTab);
  });
  ui.mediaSearchInput.placeholder = mediaPlaceholderForTab(mediaPickerTab);
  if (ui.mediaSearchInput.value !== mediaPickerQuery) {
    ui.mediaSearchInput.value = mediaPickerQuery;
  }
  const header = ui.mediaPicker?.querySelector(".media-picker__header");
  if (header instanceof HTMLElement) {
    header.querySelector(".media-picker__gif-tools")?.remove();
    if (mediaPickerTab === "gif") {
      const prefs = getPreferences();
      const scope = normalizeGifScope(prefs.gifScope, prefs.gifGroups);
      const scopeRow = document.createElement("div");
      scopeRow.className = "media-picker__gif-tools";
      const scopeSelect = document.createElement("select");
      scopeSelect.className = "media-picker__gif-scope";
      const scopeOptions = [
        { value: "all", label: "All GIFs" },
        { value: "favorites", label: "Favorites" },
        { value: "chat", label: "This Chat" },
        { value: "time", label: `This ${gifTimeScopeKey(new Date())}` },
        { value: "network", label: "This Network" }
      ];
      scopeOptions.forEach((entry) => {
        const option = document.createElement("option");
        option.value = entry.value;
        option.textContent = entry.label;
        scopeSelect.appendChild(option);
      });
      prefs.gifGroups.forEach((group) => {
        const option = document.createElement("option");
        option.value = `group:${group.id}`;
        option.textContent = `Group: ${group.name}`;
        scopeSelect.appendChild(option);
      });
      scopeSelect.value = scope;
      scopeSelect.addEventListener("change", () => {
        updateGifScope(scopeSelect.value);
        gifPickerVisibleCount = GIF_PICKER_INITIAL_PAGE_SIZE;
        renderMediaPicker();
      });
      const newGroupBtn = document.createElement("button");
      newGroupBtn.type = "button";
      newGroupBtn.textContent = "New Group";
      newGroupBtn.addEventListener("click", async () => {
        const nextName = await showInAppPromptDialog({
          title: "New GIF group",
          message: "New GIF group name",
          defaultValue: "Favorites"
        });
        if (typeof nextName !== "string") return;
        const groupId = upsertGifGroup(nextName);
        if (!groupId) return;
        updateGifScope(`group:${groupId}`);
        renderMediaPicker();
      });
      const renameGroupBtn = document.createElement("button");
      renameGroupBtn.type = "button";
      renameGroupBtn.textContent = "Rename";
      const deleteGroupBtn = document.createElement("button");
      deleteGroupBtn.type = "button";
      deleteGroupBtn.textContent = "Delete";
      const currentGroupId = scope.startsWith("group:") ? scope.slice(6) : "";
      const currentGroup = currentGroupId
        ? prefs.gifGroups.find((entry) => entry.id === currentGroupId)
        : null;
      renameGroupBtn.disabled = !currentGroup;
      deleteGroupBtn.disabled = !currentGroup;
      renameGroupBtn.addEventListener("click", async () => {
        if (!currentGroup) return;
        const nextName = await showInAppPromptDialog({
          title: "Rename GIF group",
          message: "Rename GIF group",
          defaultValue: currentGroup.name
        });
        if (typeof nextName !== "string") return;
        state.preferences = getPreferences();
        state.preferences.gifGroups = normalizeGifGroups(state.preferences.gifGroups).map((group) => (
          group.id === currentGroup.id
            ? { ...group, name: nextName.toString().trim().slice(0, 40) || group.name }
            : group
        ));
        saveState();
        renderMediaPicker();
      });
      deleteGroupBtn.addEventListener("click", async () => {
        if (!currentGroup) return;
        const confirmed = await showInAppConfirmDialog({
          title: "Delete GIF group?",
          message: `Delete GIF group "${currentGroup.name}"?`,
          confirmLabel: "Delete",
          cancelLabel: "Cancel",
          danger: true
        });
        if (!confirmed) return;
        state.preferences = getPreferences();
        state.preferences.gifGroups = normalizeGifGroups(state.preferences.gifGroups).filter((group) => group.id !== currentGroup.id);
        state.preferences.gifScope = "all";
        saveState();
        renderMediaPicker();
      });
      scopeRow.appendChild(scopeSelect);
      scopeRow.appendChild(newGroupBtn);
      scopeRow.appendChild(renameGroupBtn);
      scopeRow.appendChild(deleteGroupBtn);
      header.appendChild(scopeRow);
    }
  }
  ui.mediaGrid.innerHTML = "";
  const allEntries = filteredMediaEntries();
  const hiddenPrivacyUrls = new Set();
  const hiddenPrivacyGatedUrls = new Set();
  const hiddenPrivacyGatedHosts = new Set();
  const hiddenPrivacyBlockedHosts = new Set();
  const entries = allEntries.filter((entry) => {
    const resolvedEntryUrl = entry?.url ? resolveMediaUrl(entry.url) : "";
    if (!resolvedEntryUrl || mediaPickerEntryIsUserAdded(entry)) return true;
    if (!shouldGateMediaUrl(resolvedEntryUrl)) return true;
    hiddenPrivacyUrls.add(resolvedEntryUrl);
    const blocked = isBlockedMediaUrl(resolvedEntryUrl);
    const host = mediaUrlHost(resolvedEntryUrl);
    if (blocked) {
      if (host) hiddenPrivacyBlockedHosts.add(host);
    } else {
      hiddenPrivacyGatedUrls.add(resolvedEntryUrl);
      if (host) hiddenPrivacyGatedHosts.add(host);
    }
    return false;
  });
  const hiddenPrivacyCount = hiddenPrivacyUrls.size;
  if (entries.length === 0) {
    if (hiddenPrivacyCount > 0) {
      appendMediaPickerPrivacyBanner({
        hiddenCount: hiddenPrivacyCount,
        hiddenGatedUrls: hiddenPrivacyGatedUrls,
        hiddenGatedHosts: hiddenPrivacyGatedHosts,
        hiddenBlockedHosts: hiddenPrivacyBlockedHosts
      });
    }
    const empty = document.createElement("div");
    empty.className = "media-card--empty";
    if (mediaPickerTab === "swf") {
      empty.textContent = "No SWFs found. Run a local server and keep swf-index.json available.";
    } else if (mediaPickerTab === "sticker" && stickerPickerRemoteLoading) {
      empty.textContent = "Loading stickers...";
    } else if (mediaPickerTab === "sticker" && stickerPickerRemoteError) {
      empty.textContent = stickerPickerRemoteError;
    } else if (mediaPickerTab === "emoji" && emojiLibraryLoading) {
      empty.textContent = "Loading full emoji list…";
    } else if (mediaPickerTab === "emoji" && emojiLibraryError) {
      empty.textContent = emojiLibraryError;
    } else if (hiddenPrivacyCount > 0) {
      empty.textContent = "Everything in this view is hidden by privacy rules.";
    } else {
      empty.textContent = "No media found for this query.";
    }
    ui.mediaGrid.appendChild(empty);
    return;
  }

  const maxVisible = mediaPickerTab === "swf"
    ? entries.length
    : mediaPickerTab === "gif"
      ? Math.max(GIF_PICKER_INITIAL_PAGE_SIZE, gifPickerVisibleCount)
      : mediaPickerTab === "sticker"
        ? Math.max(STICKER_PICKER_INITIAL_PAGE_SIZE, stickerPickerVisibleCount)
      : mediaPickerTab === "emoji"
        ? Math.max(EMOJI_PICKER_INITIAL_PAGE_SIZE, emojiPickerVisibleCount)
      : 140;
  const visibleEntries = entries.slice(0, maxVisible);
  if (hiddenPrivacyCount > 0) {
    appendMediaPickerPrivacyBanner({
      hiddenCount: hiddenPrivacyCount,
      hiddenGatedUrls: hiddenPrivacyGatedUrls,
      hiddenGatedHosts: hiddenPrivacyGatedHosts,
      hiddenBlockedHosts: hiddenPrivacyBlockedHosts
    });
  }
  visibleEntries.forEach((entry, index) => {
    const sendType = attachmentTypeForMediaPickerTab(mediaPickerTab, entry);
    const resolvedEntryUrl = entry?.url ? resolveMediaUrl(entry.url) : "";
    const useSwfCard = mediaPickerTab === "swf";
    const useDivCard = useSwfCard || mediaPickerTab === "gif";
    const card = document.createElement(useDivCard ? "div" : "button");
    if (card instanceof HTMLButtonElement) card.type = "button";
    card.className = `media-card${useSwfCard ? " media-card--swf" : ""}`;
    if (mediaPickerTab === "gif") card.classList.add("media-card--gif");
    if (mediaPickerTab === "sticker") card.classList.add("media-card--sticker");
    if (useSwfCard || mediaPickerTab === "gif") {
      card.tabIndex = 0;
      card.setAttribute("role", "button");
    }
    if (mediaPickerTab === "emoji") {
      card.classList.add("media-card--emoji");
      if (entry.recentIndex >= 0) card.classList.add("media-card--emoji-recent");
      if (entry.value) {
        card.textContent = entry.value;
      } else if (entry.url) {
        const emojiImage = document.createElement("img");
        emojiImage.className = "media-card__preview";
        emojiImage.style.height = "80px";
        emojiImage.src = entry.url;
        emojiImage.alt = entry.name || "emoji";
        card.appendChild(emojiImage);
      }
      card.title = `:${entry.name || "emoji"}:`;
      card.addEventListener("click", () => {
        if (entry.value && mediaPickerEmojiOnlyMode && mediaPickerEmojiSelectHandler) {
          mediaPickerEmojiSelectHandler(entry.value, entry);
          rememberRecentEmoji(entry.value);
          saveState();
          closeMediaPicker();
          return;
        }
        if (entry.value) {
          insertTextAtCursor(entry.value);
          rememberRecentEmoji(entry.value);
          saveState();
        } else {
          insertTextAtCursor(`:${sanitizeMediaName(entry.name || "emoji")}:`);
        }
      });
      ui.mediaGrid.appendChild(card);
      return;
    }

    const label = document.createElement("span");
    label.className = "media-card__label";
    label.textContent = entry.name || "media";
    if (entry.source === "guild-custom") {
      const kind = document.createElement("span");
      kind.className = "media-card__kind";
      kind.textContent = "guild";
      label.appendChild(kind);
    }

    if (mediaPickerTab === "swf") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      const previewMedia = document.createElement("div");
      previewMedia.className = "media-card__preview-media";
      const overlay = document.createElement("span");
      overlay.className = "media-card__overlay";
      overlay.textContent = "";
      preview.appendChild(previewMedia);
      preview.appendChild(overlay);
      card.appendChild(preview);
      card.appendChild(label);
      card.addEventListener("click", () => sendMediaAttachment(entry, sendType));
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        sendMediaAttachment(entry, sendType);
      });
      ui.mediaGrid.appendChild(card);
      requestAnimationFrame(() => {
        if (!previewMedia.isConnected) return;
        renderSwfPickerPreview(previewMedia, entry, index, renderToken);
      });
      return;
    }

    if (mediaPickerTab === "html") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      preview.style.display = "grid";
      preview.style.placeItems = "center";
      preview.style.fontWeight = "800";
      preview.style.fontSize = "0.76rem";
      preview.textContent = "HTML";
      card.appendChild(preview);
      card.appendChild(label);
      card.addEventListener("click", () => sendMediaAttachment(entry, sendType));
      ui.mediaGrid.appendChild(card);
      return;
    }

    if (mediaPickerTab === "pdf") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      preview.style.display = "grid";
      preview.style.placeItems = "center";
      preview.style.fontWeight = "800";
      preview.style.fontSize = "0.76rem";
      preview.textContent = "PDF";
      card.appendChild(preview);
      card.appendChild(label);
      card.addEventListener("click", () => sendMediaAttachment(entry, sendType));
      ui.mediaGrid.appendChild(card);
      return;
    }

    if (mediaPickerTab === "text") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      preview.style.display = "grid";
      preview.style.placeItems = "center";
      preview.style.fontWeight = "800";
      preview.style.fontSize = "0.76rem";
      preview.textContent = "TXT";
      card.appendChild(preview);
      card.appendChild(label);
      card.addEventListener("click", () => sendMediaAttachment(entry, sendType));
      ui.mediaGrid.appendChild(card);
      return;
    }

    if (mediaPickerTab === "docs") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      preview.style.display = "grid";
      preview.style.placeItems = "center";
      preview.style.fontWeight = "800";
      preview.style.fontSize = "0.76rem";
      preview.textContent = entry.type === "rtf" ? "RTF" : "DOC";
      card.appendChild(preview);
      card.appendChild(label);
      card.addEventListener("click", () => sendMediaAttachment(entry, sendType));
      ui.mediaGrid.appendChild(card);
      return;
    }

    const entryUrlForPreview = resolvedEntryUrl || entry.url || "";
    const stickerLooksVideo = mediaPickerTab === "sticker" && /\.(mp4|webm|mov|m4v)(\?|$|#|&)/i.test(entryUrlForPreview);
    if ((mediaPickerTab === "gif" && entry.preview === "video") || stickerLooksVideo) {
      const video = document.createElement("video");
      video.className = "media-card__preview";
      video.src = entryUrlForPreview;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      if (mediaPickerTab === "sticker") enforceStickerPreviewSizing(video);
      card.appendChild(video);
    } else if (mediaPickerTab === "sticker" && stickerFormatFromName(entry.name, entry.url) === "dotlottie") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      preview.style.display = "grid";
      preview.style.placeItems = "center";
      preview.style.color = "#c4ccd8";
      preview.style.fontSize = "0.72rem";
      preview.textContent = ".lottie";
      enforceStickerPreviewSizing(preview);
      card.appendChild(preview);
    } else {
      const img = document.createElement("img");
      img.className = "media-card__preview";
      img.loading = "lazy";
      img.src = entryUrlForPreview;
      img.alt = entry.name || "media";
      if (mediaPickerTab === "sticker") enforceStickerPreviewSizing(img);
      card.appendChild(img);
    }
    if (mediaPickerTab === "gif") {
      const prefs = getPreferences();
      const gifUrl = (entry?.url || "").toString().trim();
      const quickActions = document.createElement("div");
      quickActions.className = "media-card__quick-actions";
      const favoriteBtn = document.createElement("button");
      favoriteBtn.type = "button";
      favoriteBtn.className = "media-card__quick-btn";
      const favorited = prefs.gifFavorites.includes(gifUrl);
      favoriteBtn.textContent = favorited ? "★" : "☆";
      favoriteBtn.title = favorited ? "Remove from favorites" : "Add to favorites";
      favoriteBtn.classList.toggle("is-active", favorited);
      favoriteBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const added = toggleGifFavorite(gifUrl);
        renderMediaPicker();
        showToast(added ? "Added GIF to favorites." : "Removed GIF from favorites.");
      });
      const groupBtn = document.createElement("button");
      groupBtn.type = "button";
      groupBtn.className = "media-card__quick-btn";
      const scope = activeGifScope();
      const activeGroupId = scope.startsWith("group:") ? scope.slice(6) : "";
      const activeGroup = activeGroupId
        ? prefs.gifGroups.find((group) => group.id === activeGroupId)
        : null;
      const inActiveGroup = Boolean(activeGroup && activeGroup.urls.includes(gifUrl));
      groupBtn.textContent = inActiveGroup ? "−" : "+";
      groupBtn.title = activeGroup
        ? (inActiveGroup ? `Remove from ${activeGroup.name}` : `Add to ${activeGroup.name}`)
        : "Add to GIF group";
      groupBtn.classList.toggle("is-active", inActiveGroup);
      groupBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (activeGroup) {
          const added = toggleGifGroupMembership(gifUrl, activeGroup.id);
          renderMediaPicker();
          showToast(added ? `Added to ${activeGroup.name}.` : `Removed from ${activeGroup.name}.`);
          return;
        }
        const added = await promptGifGroupForUrl(gifUrl);
        renderMediaPicker();
        if (added) showToast("GIF added to group.");
      });
      quickActions.appendChild(favoriteBtn);
      quickActions.appendChild(groupBtn);
      card.appendChild(quickActions);
    }
    card.appendChild(label);
    card.addEventListener("click", () => {
      sendMediaAttachment(entry, sendType);
    });
    if (mediaPickerTab === "gif") {
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        sendMediaAttachment(entry, sendType);
      });
    }
    ui.mediaGrid.appendChild(card);
  });

  if (mediaPickerTab === "gif") {
    const privacyModeOff = getPreferences().mediaPrivacyMode === "off";
    const scope = activeGifScope();
    const scopedMode = scope !== "all";
    const hasMoreVisible = entries.length > visibleEntries.length;
    const canLoadRemote = Boolean(gifPickerRemoteNext || (gifPickerRemoteEntries.length === 0 && !gifPickerRemoteError));
    const canRetryRemote = Boolean(gifPickerRemoteError && !gifPickerRemoteLoading);
    const footer = document.createElement("div");
    footer.className = "media-card--empty";
    footer.style.display = "grid";
    footer.style.gap = "0.35rem";
    const info = document.createElement("div");
    if (scopedMode) {
      const label = scope.startsWith("group:")
        ? `Group view: ${entries.length} GIF${entries.length === 1 ? "" : "s"}`
        : `${scope.charAt(0).toUpperCase()}${scope.slice(1)} view: ${entries.length} GIF${entries.length === 1 ? "" : "s"}`;
      info.textContent = label;
    } else if (gifPickerRemoteLoading) {
      info.textContent = "Loading more GIFs...";
    } else if (gifPickerRemoteError) {
      info.textContent = gifPickerRemoteError;
    } else {
      info.textContent = `${entries.length} GIFs ready.`;
    }
    const loadBtn = document.createElement("button");
    loadBtn.type = "button";
    loadBtn.className = "message-action-btn";
    loadBtn.disabled = scopedMode || gifPickerRemoteLoading || (!hasMoreVisible && !canLoadRemote && !canRetryRemote);
    if (scopedMode) {
      loadBtn.textContent = "Switch to All to load more";
    } else if (hasMoreVisible) {
      loadBtn.textContent = "Show more GIFs";
    } else if (gifPickerRemoteLoading) {
      loadBtn.textContent = "Loading...";
    } else if (canRetryRemote) {
      loadBtn.textContent = "Retry GIF provider";
    } else {
      loadBtn.textContent = "Load more GIFs";
    }
    loadBtn.addEventListener("click", () => {
      if (scopedMode) return;
      if (hasMoreVisible) {
        gifPickerVisibleCount = Math.min(GIF_PICKER_VISIBLE_MAX, gifPickerVisibleCount + GIF_PICKER_PAGE_STEP);
        renderMediaPicker();
        return;
      }
      maybeLoadMoreGifPickerEntries({ reset: false, force: canRetryRemote });
      renderMediaPicker();
    });
    footer.appendChild(info);
    if (privacyModeOff) {
      const gateHint = document.createElement("small");
      gateHint.textContent = "Privacy gate is disabled for GIFs.";
      footer.appendChild(gateHint);
    }
    footer.appendChild(loadBtn);
    ui.mediaGrid.appendChild(footer);
    if (!scopedMode && !gifPickerRemoteLoading && !gifPickerRemoteError && visibleEntries.length < gifPickerVisibleCount && canLoadRemote) {
      maybeLoadMoreGifPickerEntries({ reset: false });
    }
  }
  if (mediaPickerTab === "sticker") {
    const privacyModeOff = getPreferences().mediaPrivacyMode === "off";
    const hasMoreVisible = entries.length > visibleEntries.length;
    const canLoadRemote = Boolean(
      stickerPickerRemoteNext || (stickerPickerRemoteEntries.length === 0 && !stickerPickerRemoteError)
    );
    const canRetryRemote = Boolean(stickerPickerRemoteError && !stickerPickerRemoteLoading);
    const footer = document.createElement("div");
    footer.className = "media-card--empty";
    footer.style.display = "grid";
    footer.style.gap = "0.35rem";
    const info = document.createElement("div");
    if (stickerPickerRemoteLoading) {
      info.textContent = "Loading stickers...";
    } else if (stickerPickerRemoteError) {
      info.textContent = stickerPickerRemoteError;
    } else {
      const hiddenSuffix = hiddenPrivacyCount > 0 ? ` · ${hiddenPrivacyCount} hidden` : "";
      info.textContent = `${entries.length} stickers ready${hiddenSuffix}.`;
    }
    const loadBtn = document.createElement("button");
    loadBtn.type = "button";
    loadBtn.className = "message-action-btn";
    loadBtn.disabled = stickerPickerRemoteLoading || (!hasMoreVisible && !canLoadRemote && !canRetryRemote);
    if (hasMoreVisible) {
      loadBtn.textContent = "Show more stickers";
    } else if (stickerPickerRemoteLoading) {
      loadBtn.textContent = "Loading...";
    } else if (canRetryRemote) {
      loadBtn.textContent = "Retry sticker provider";
    } else {
      loadBtn.textContent = "Load more stickers";
    }
    loadBtn.addEventListener("click", () => {
      if (hasMoreVisible) {
        stickerPickerVisibleCount = Math.min(
          STICKER_PICKER_VISIBLE_MAX,
          stickerPickerVisibleCount + STICKER_PICKER_PAGE_STEP
        );
        renderMediaPicker();
        return;
      }
      maybeLoadMoreStickerPickerEntries({ reset: false, force: canRetryRemote });
      renderMediaPicker();
    });
    footer.appendChild(info);
    if (privacyModeOff) {
      const gateHint = document.createElement("small");
      gateHint.textContent = "Privacy gate is currently off for stickers.";
      const gateEnableBtn = document.createElement("button");
      gateEnableBtn.type = "button";
      gateEnableBtn.className = "message-action-btn";
      gateEnableBtn.textContent = "Enable Privacy Gate";
      gateEnableBtn.addEventListener("click", () => {
        state.preferences = getPreferences();
        state.preferences.mediaPrivacyMode = "safe";
        saveState();
        applyPreferencesToUI();
        renderMediaPicker();
        showToast("Media privacy gate enabled.");
      });
      footer.appendChild(gateHint);
      footer.appendChild(gateEnableBtn);
    }
    footer.appendChild(loadBtn);
    ui.mediaGrid.appendChild(footer);
    if (!stickerPickerRemoteLoading && !stickerPickerRemoteError && visibleEntries.length < stickerPickerVisibleCount && canLoadRemote) {
      maybeLoadMoreStickerPickerEntries({ reset: false });
    }
  }
  if (mediaPickerTab === "emoji") {
    const hasMoreVisible = entries.length > visibleEntries.length;
    const canRetryEmojiDataset = Boolean(emojiLibraryError && !emojiLibraryLoading);
    const canLoadEmojiDataset = Boolean(!emojiLibraryLoaded && !emojiLibraryLoading && !emojiLibraryError);
    const footer = document.createElement("div");
    footer.className = "media-card--empty";
    footer.style.display = "grid";
    footer.style.gap = "0.35rem";
    const info = document.createElement("div");
    if (emojiLibraryLoading) {
      info.textContent = "Loading full emoji list...";
    } else if (emojiLibraryError) {
      info.textContent = emojiLibraryError;
    } else {
      info.textContent = `${entries.length} emojis ready.`;
    }
    const loadBtn = document.createElement("button");
    loadBtn.type = "button";
    loadBtn.className = "message-action-btn";
    loadBtn.disabled = emojiLibraryLoading || (!hasMoreVisible && !canRetryEmojiDataset && !canLoadEmojiDataset);
    if (hasMoreVisible) {
      loadBtn.textContent = "Show more emojis";
    } else if (emojiLibraryLoading) {
      loadBtn.textContent = "Loading...";
    } else if (canRetryEmojiDataset) {
      loadBtn.textContent = "Retry full emoji list";
    } else if (canLoadEmojiDataset) {
      loadBtn.textContent = "Load full emoji list";
    } else {
      loadBtn.textContent = "All emojis shown";
    }
    loadBtn.addEventListener("click", () => {
      if (hasMoreVisible) {
        emojiPickerVisibleCount = Math.min(6000, emojiPickerVisibleCount + EMOJI_PICKER_PAGE_STEP);
        renderMediaPicker();
        return;
      }
      void ensureEmojiLibraryLoaded({ force: true });
      renderMediaPicker();
    });
    footer.appendChild(info);
    footer.appendChild(loadBtn);
    ui.mediaGrid.appendChild(footer);
  }
}
