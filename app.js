function applyServerBrandEmojiSupport() {
  if (!ui.serverBrand) return;
  const supported = supportsEmojiGlyph(SHITCORD_BRAND_EMOJI);
  ui.serverBrand.classList.toggle("server-brand--emoji", supported);
}

if (ui.saveComposerAttachmentBtn) ui.saveComposerAttachmentBtn.hidden = true;

const HEADER_ACTION_BUTTONS = [
  { key: "openCallBtn", icon: "📹", fallback: "Call", preferIcon: true },
  { key: "openScreenShareBtn", icon: "🖥", fallback: "Screen", preferIcon: true },
  { key: "openXmppCallBtn", icon: "📡", fallback: "Legacy XMPP", preferIcon: true },
  { key: "copyCallLinkBtn", icon: "🔗", fallback: "Copy Call", preferIcon: true },
  { key: "openWhiteboardBtn", icon: "📝", fallback: "Whiteboard", preferIcon: true },
  { key: "openFindBtn", icon: "🔍", fallback: "Find", preferIcon: true },
  { key: "markChannelReadBtn", icon: "✓", fallback: "Mark Read" },
  { key: "nextUnreadBtn", icon: "⤓", fallback: "Next Unread" },
  { key: "openChannelSettingsBtn", icon: "⚙", fallback: "Channel" },
  { key: "openPinsBtn", icon: "📌", fallback: "Pins", preferIcon: true },
  { key: "openRolesBtn", icon: "🛡", fallback: "Roles" },
  { key: "openShortcutsBtn", icon: "⌨", fallback: "Shortcuts", preferIcon: true },
  { key: "toggleChannelPanelBtn", icon: "🧭", fallback: "Channels", preferIcon: true },
  { key: "toggleMemberPanelBtn", icon: "👥", fallback: "Members", preferIcon: true },
  { key: "toggleSwfShelfBtn", icon: "📼", fallback: "SWF Shelf", preferIcon: true },
  { key: "editTopicBtn", icon: "✎", fallback: "Edit Topic" }
];

function headerActionsShouldUseIconMode() {
  const compactWidth = window.innerWidth <= 1280;
  const compactHeight = window.innerHeight <= 680 && window.innerWidth <= 1500;
  const denseDesktop = window.innerWidth <= 1480 && window.innerHeight <= 780;
  return compactWidth || compactHeight || denseDesktop;
}

function applyHeaderActionButtonLabels(iconMode = false) {
  HEADER_ACTION_BUTTONS.forEach((entry) => {
    const button = ui[entry.key];
    if (!(button instanceof HTMLButtonElement)) return;
    if (!button.dataset.baseTitle) button.dataset.baseTitle = button.title || "";
    if (!button.dataset.fullLabel) {
      const seed = (button.textContent || "").toString().trim();
      button.dataset.fullLabel = seed || entry.fallback;
    }
    const fullLabel = (button.dataset.fullLabel || entry.fallback).toString();
    const useIcon = iconMode || entry.preferIcon === true;
    if (useIcon) {
      button.textContent = entry.icon;
      button.classList.add("chat-topic-edit--icon");
      button.title = fullLabel;
      button.setAttribute("aria-label", fullLabel);
      return;
    }
    button.textContent = fullLabel;
    button.classList.remove("chat-topic-edit--icon");
    const baseTitle = (button.dataset.baseTitle || "").toString();
    const title = baseTitle || fullLabel;
    button.title = title;
    button.setAttribute("aria-label", title);
  });
}

function setHeaderActionButtonLabel(buttonOrKey, label) {
  const button = typeof buttonOrKey === "string"
    ? ui[buttonOrKey]
    : buttonOrKey;
  if (!(button instanceof HTMLButtonElement)) return;
  const next = (label || "").toString().trim();
  if (next) button.dataset.fullLabel = next;
  if (button.isConnected) refreshHeaderActionButtonLabels();
}

function refreshHeaderActionButtonLabels() {
  let iconMode = headerActionsShouldUseIconMode();
  applyHeaderActionButtonLabels(iconMode);
  if (iconMode || !(ui.chatHeaderRight instanceof HTMLElement)) return;
  const wrapped = ui.chatHeaderRight.scrollHeight > (ui.chatHeaderRight.clientHeight + 4);
  const overflowed = ui.chatHeaderRight.scrollWidth > (ui.chatHeaderRight.clientWidth + 8);
  if (!wrapped && !overflowed) return;
  iconMode = true;
  applyHeaderActionButtonLabels(iconMode);
}

function saveState() {
  const snapshot = typeof xmppSnapshotStateForStorage === "function"
    ? xmppSnapshotStateForStorage(state)
    : state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function isSessionPersistenceEnabled() {
  return localStorage.getItem(SESSION_PERSIST_KEY) !== "off";
}

function rememberAccountSession(accountId, remember = true) {
  if (!accountId) return;
  if (!remember) {
    localStorage.setItem(SESSION_PERSIST_KEY, "off");
    localStorage.removeItem(SESSION_ACCOUNT_KEY);
    return;
  }
  localStorage.setItem(SESSION_PERSIST_KEY, "on");
  localStorage.setItem(SESSION_ACCOUNT_KEY, accountId);
}

function clearRememberedAccountSession() {
  localStorage.removeItem(SESSION_ACCOUNT_KEY);
}

function getCurrentAccount() {
  return state.accounts.find((account) => account.id === state.currentAccountId) || null;
}

function getAccountById(accountId) {
  return state.accounts.find((account) => account.id === accountId) || null;
}

function getAccountByUsername(username) {
  return state.accounts.find((account) => account.username === username) || null;
}

function getActiveGuild() {
  return state.guilds.find((guild) => guild.id === state.activeGuildId) || null;
}

function canAccountAccessGuild(guild, account = getCurrentAccount()) {
  if (!guild || !account) return false;
  const guildId = (guild.id || "").toString().toLowerCase();
  if (guildId.startsWith("xmpp-spaces:")) {
    const guildDomain = guildId.slice("xmpp-spaces:".length);
    const accountDomain = xmppDomainFromJid(account.xmppJid || "");
    if (guildDomain && accountDomain && guildDomain !== accountDomain) return false;
  }
  const members = Array.isArray(guild.memberIds) ? guild.memberIds.filter(Boolean) : [];
  if (members.includes(account.id)) return true;
  // Keep legacy local guilds reachable when memberIds was never populated.
  if (members.length === 0 && !isXmppBackedGuild(guild)) return true;
  return false;
}

function listAccessibleGuildsForAccount(account = getCurrentAccount()) {
  if (!account) return [];
  return state.guilds.filter((guild) => canAccountAccessGuild(guild, account));
}

function getActiveServer() {
  return getActiveGuild();
}

function getActiveChannel() {
  const guild = getActiveGuild();
  if (!guild) return null;
  return guild.channels.find((channel) => channel.id === state.activeChannelId) || null;
}

function getPreferredGuildChannelId(guildId) {
  if (!guildId) return "";
  const prefs = getPreferences();
  return (prefs.lastChannelByGuild?.[guildId] || "").toString();
}

function rememberGuildChannelSelection(guildId, channelId) {
  if (!guildId || !channelId) return;
  state.preferences = getPreferences();
  state.preferences.lastChannelByGuild = {
    ...(state.preferences.lastChannelByGuild || {}),
    [guildId]: channelId
  };
}

function getActiveDmThread() {
  if (!state.activeDmId) return null;
  return state.dmThreads.find((thread) => thread.id === state.activeDmId) || null;
}

function getViewMode() {
  return state.viewMode === "dm" ? "dm" : "guild";
}

function getActiveConversation() {
  if (getViewMode() === "dm") {
    const dm = getActiveDmThread();
    if (dm) return { type: "dm", thread: dm, id: dm.id };
    return null;
  }
  const channel = getActiveChannel();
  if (!channel) return null;
  return { type: "channel", channel, id: channel.id };
}

function hardLimitForConversation(conversation = getActiveConversation()) {
  const prefs = getPreferences();
  let limit = normalizeMessageCharLimit(prefs.messageCharLimit);
  if (conversation?.type === "channel") {
    const serverLimit = Number(conversation.channel?.messageCharLimit || conversation.channel?.messageMaxLength || 0);
    if (Number.isFinite(serverLimit) && serverLimit > 0) {
      limit = Math.max(MESSAGE_CHAR_LIMIT_MIN, Math.min(MESSAGE_CHAR_LIMIT_MAX, Math.floor(serverLimit)));
    }
  }
  return limit;
}

function composerLimitForConversation(conversation = getActiveConversation()) {
  const base = hardLimitForConversation(conversation);
  if (!conversation?.id) return base;
  if (composerTempLimitConversationId !== conversation.id || composerTempLimitExtra <= 0) return base;
  return Math.max(MESSAGE_CHAR_LIMIT_MIN, Math.min(MESSAGE_CHAR_LIMIT_MAX, base + composerTempLimitExtra));
}

function trimTextForConversation(value, conversation = getActiveConversation()) {
  return (value || "").toString().slice(0, composerLimitForConversation(conversation));
}

function trimTextForTransport(value) {
  return clampMessageTextForStorage(value).slice(0, MESSAGE_TEXT_TRANSPORT_MAX);
}

function applyComposerInputLimit() {
  if (!(ui.messageInput instanceof HTMLTextAreaElement)) return;
  const conversation = getActiveConversation();
  const limit = composerLimitForConversation(conversation);
  ui.messageInput.maxLength = limit;
}

function ensureComposerDraftsStore() {
  if (!state.composerDrafts || typeof state.composerDrafts !== "object") {
    state.composerDrafts = {};
  }
  return state.composerDrafts;
}

function setComposerDraft(conversationId, text) {
  if (!conversationId) return;
  const drafts = ensureComposerDraftsStore();
  const next = clampMessageTextForStorage(text);
  if (next.trim()) {
    drafts[conversationId] = next;
    return;
  }
  delete drafts[conversationId];
}

function getComposerDraft(conversationId) {
  if (!conversationId) return "";
  const drafts = ensureComposerDraftsStore();
  return clampMessageTextForStorage(drafts[conversationId] || "");
}

function hasDraftForConversation(conversationId) {
  return Boolean(getComposerDraft(conversationId).trim());
}

function countDraftsForGuildChannels(guild) {
  if (!guild || !Array.isArray(guild.channels)) return 0;
  return guild.channels.reduce((acc, channel) => acc + (hasDraftForConversation(channel.id) ? 1 : 0), 0);
}

function countDraftsForCurrentAccountDms(account) {
  if (!account) return 0;
  return state.dmThreads.reduce((acc, thread) => {
    if (!Array.isArray(thread.participantIds) || !thread.participantIds.includes(account.id)) return acc;
    return acc + (hasDraftForConversation(thread.id) ? 1 : 0);
  }, 0);
}

function queueComposerDraftSave() {
  if (composerDraftSaveTimer) clearTimeout(composerDraftSaveTimer);
  composerDraftSaveTimer = setTimeout(() => {
    composerDraftSaveTimer = null;
    saveState();
  }, 250);
}

function syncComposerDraftConversation(nextConversationId) {
  const previousId = composerDraftConversationId;
  if (previousId && previousId !== nextConversationId) {
    setComposerDraft(previousId, ui.messageInput.value);
  }
  composerDraftConversationId = nextConversationId || null;
  if (composerTempLimitConversationId && composerTempLimitConversationId !== composerDraftConversationId) {
    composerTempLimitConversationId = null;
    composerTempLimitExtra = 0;
  }
  const nextDraft = nextConversationId ? getComposerDraft(nextConversationId) : "";
  if ((ui.messageInput.value || "") !== nextDraft) {
    ui.messageInput.value = trimTextForConversation(nextDraft, getActiveConversation());
  }
  applyComposerInputLimit();
  resizeComposerInput();
}

function getUserNoteKey(ownerId, targetId) {
  return `${ownerId || ""}:${targetId || ""}`;
}

function getUserNote(ownerId, targetId) {
  if (!ownerId || !targetId) return "";
  return (state.userNotes?.[getUserNoteKey(ownerId, targetId)] || "").toString();
}

function setUserNote(ownerId, targetId, text) {
  if (!ownerId || !targetId) return;
  if (!state.userNotes || typeof state.userNotes !== "object") state.userNotes = {};
  state.userNotes[getUserNoteKey(ownerId, targetId)] = (text || "").toString().trim().slice(0, 240);
}

function getDmUnreadStats(thread, account) {
  if (!thread || !account) return { unread: 0, mentions: 0 };
  const lastReadMs = toTimestampMs(thread.readState?.[account.id]);
  let unread = 0;
  let mentions = 0;
  thread.messages.forEach((message) => {
    if (toTimestampMs(message.ts) <= lastReadMs) return;
    if (message.userId && message.userId === account.id) return;
    unread += 1;
    if (messageMentionsAccount(message.text, account)) mentions += 1;
  });
  return { unread, mentions };
}

function getTotalDmUnreadStats(account) {
  if (!account) return { unread: 0, mentions: 0 };
  return state.dmThreads.reduce((acc, thread) => {
    if (!Array.isArray(thread.participantIds) || !thread.participantIds.includes(account.id)) return acc;
    const stats = getDmUnreadStats(thread, account);
    return {
      unread: acc.unread + stats.unread,
      mentions: acc.mentions + stats.mentions
    };
  }, { unread: 0, mentions: 0 });
}

function getSortedDmThreadsForAccount(account) {
  if (!account) return [];
  return state.dmThreads
    .filter((thread) => Array.isArray(thread.participantIds) && thread.participantIds.includes(account.id))
    .slice()
    .sort((a, b) => {
      const aTs = toTimestampMs(a.messages?.[a.messages.length - 1]?.ts || 0);
      const bTs = toTimestampMs(b.messages?.[b.messages.length - 1]?.ts || 0);
      if (bTs !== aTs) return bTs - aTs;
      return (a.id || "").localeCompare(b.id || "");
    });
}

function getServerRoles(server) {
  if (!server) return [];
  return Array.isArray(server.roles) ? server.roles : [];
}

function getMemberRoleIds(server, accountId) {
  if (!server || !accountId) return [];
  if (!server.memberRoles || typeof server.memberRoles !== "object") return [];
  return Array.isArray(server.memberRoles[accountId]) ? server.memberRoles[accountId] : [];
}

function getMemberRoles(server, accountId) {
  const roleIds = getMemberRoleIds(server, accountId);
  const roles = getServerRoles(server);
  return roleIds
    .map((roleId) => roles.find((role) => role.id === roleId))
    .filter(Boolean);
}

function hasServerPermission(server, accountId, permissionKey) {
  const roles = getMemberRoles(server, accountId);
  if (roles.some((role) => role.permissions?.administrator)) return true;
  return roles.some((role) => Boolean(role.permissions?.[permissionKey]));
}

function ensureChannelPermissionOverrides(channel, server = null) {
  if (!channel || typeof channel !== "object") return;
  const roleIds = Array.isArray(server?.roles) ? server.roles.map((role) => role.id) : [];
  channel.permissionOverrides = normalizeChannelPermissionOverrides(channel.permissionOverrides, roleIds);
}

function getChannelPermissionOverride(channel, roleId, permissionKey) {
  if (!channel || !roleId || !permissionKey) return "inherit";
  const value = channel.permissionOverrides?.[roleId]?.[permissionKey];
  return normalizeChannelPermissionValue(value);
}

function setChannelPermissionOverride(channel, roleId, permissionKey, value) {
  if (!channel || !roleId || !permissionKey) return;
  ensureChannelPermissionOverrides(channel, getActiveServer());
  if (!channel.permissionOverrides || typeof channel.permissionOverrides !== "object") {
    channel.permissionOverrides = {};
  }
  const nextValue = normalizeChannelPermissionValue(value);
  if (!channel.permissionOverrides[roleId]) channel.permissionOverrides[roleId] = {};
  if (nextValue === "inherit") {
    delete channel.permissionOverrides[roleId][permissionKey];
  } else {
    channel.permissionOverrides[roleId][permissionKey] = nextValue;
  }
  if (Object.keys(channel.permissionOverrides[roleId]).length === 0) {
    delete channel.permissionOverrides[roleId];
  }
}

function hasChannelPermission(server, channel, accountId, permissionKey) {
  if (!channel || !permissionKey) return false;
  if (!server || !accountId) return true;
  if (hasServerPermission(server, accountId, "administrator")) return true;
  ensureChannelPermissionOverrides(channel, server);
  const roleIds = getMemberRoleIds(server, accountId);
  if (roleIds.length === 0) return false;
  let allow = false;
  for (const roleId of roleIds) {
    const value = getChannelPermissionOverride(channel, roleId, permissionKey);
    if (value === "deny") return false;
    if (value === "allow") allow = true;
  }
  if (allow) return true;
  return true;
}

function canAccountViewChannel(server, channel, accountId) {
  return hasChannelPermission(server, channel, accountId, "viewChannel");
}

function canCurrentUserViewChannel(channel, server = getActiveServer()) {
  const account = getCurrentAccount();
  if (!account) return false;
  return canAccountViewChannel(server, channel, account.id);
}

function canCurrentUserReactInChannel(channel, server = getActiveServer()) {
  const account = getCurrentAccount();
  if (!account) return false;
  if (!canAccountViewChannel(server, channel, account.id)) return false;
  return hasChannelPermission(server, channel, account.id, "addReactions");
}

function canCurrentUserCreateThreadsInChannel(channel, server = getActiveServer()) {
  const account = getCurrentAccount();
  if (!account) return false;
  if (!canAccountViewChannel(server, channel, account.id)) return false;
  return hasChannelPermission(server, channel, account.id, "createThreads");
}

function canCurrentUser(permissionKey) {
  const account = getCurrentAccount();
  const server = getActiveServer();
  if (!account || !server) return false;
  return hasServerPermission(server, account.id, permissionKey);
}

function notifyPermissionDenied(permissionLabel) {
  const channel = getActiveChannel();
  if (!channel) return;
  addSystemMessage(channel, `Missing permission: ${permissionLabel}`);
  saveState();
  renderMessages();
}

function findChannelById(channelId) {
  for (const server of state.guilds) {
    const found = server.channels.find((channel) => channel.id === channelId);
    if (found) return found;
  }
  return null;
}

function findGuildByChannelId(channelId) {
  for (const guild of state.guilds) {
    if (guild.channels.some((channel) => channel.id === channelId)) return guild;
  }
  return null;
}

function applyHashConversationNavigation() {
  const ref = parseHashMessageReference();
  if (!ref) return false;
  const dm = state.dmThreads.find((thread) => thread.id === ref.conversationId);
  if (dm) {
    let changed = false;
    if (state.viewMode !== "dm") {
      state.viewMode = "dm";
      changed = true;
    }
    if (state.activeDmId !== dm.id) {
      state.activeDmId = dm.id;
      changed = true;
    }
    return changed;
  }
  const channel = findChannelById(ref.conversationId);
  if (!channel) return false;
  const guild = findGuildByChannelId(channel.id);
  if (!guild) return false;
  let changed = false;
  if (state.viewMode !== "guild") {
    state.viewMode = "guild";
    changed = true;
  }
  if (state.activeGuildId !== guild.id) {
    state.activeGuildId = guild.id;
    changed = true;
  }
  if (state.activeChannelId !== channel.id) {
    state.activeChannelId = channel.id;
    changed = true;
  }
  if (state.activeDmId) {
    state.activeDmId = null;
    changed = true;
  }
  return changed;
}

function findMessageInChannel(channel, messageId) {
  if (!channel) return null;
  return channel.messages.find((message) => message.id === messageId) || null;
}

function ensureChannelReadState(channel) {
  if (!channel || (channel.readState && typeof channel.readState === "object")) return false;
  channel.readState = {};
  return true;
}

function markChannelRead(channel, accountId) {
  if (!channel || !accountId) return false;
  ensureChannelReadState(channel);
  const newestTs = newestMessageTimestampIso(channel.messages);
  const currentMs = toTimestampMs(channel.readState[accountId]);
  const nextMs = toTimestampMs(newestTs);
  if (nextMs <= currentMs) return false;
  channel.readState[accountId] = newestTs;
  return true;
}

function markGuildRead(guild, accountId) {
  if (!guild || !accountId) return false;
  let changed = false;
  guild.channels.forEach((channel) => {
    if (markChannelRead(channel, accountId)) changed = true;
  });
  return changed;
}

function markAllReadForAccount(accountId) {
  if (!accountId) return false;
  let changed = false;
  state.guilds.forEach((guild) => {
    if (markGuildRead(guild, accountId)) changed = true;
  });
  state.dmThreads.forEach((thread) => {
    if (markDmRead(thread, accountId)) changed = true;
  });
  return changed;
}

function messageMentionsAccount(messageText, account) {
  if (!account || !messageText) return false;
  const raw = (messageText || "").toString();
  const directMentionPattern = new RegExp(`(^|\\s)@${escapeRegExp(account.username)}(?=\\b|\\s|$)`, "i");
  if (directMentionPattern.test(raw)) return true;
  const needles = new Set([
    (account.username || "").toString().trim(),
    (account.displayName || "").toString().trim(),
    normalizeXmppJid(account.xmppJid || "").split("@")[0] || ""
  ]);
  for (const needleRaw of needles) {
    const needle = (needleRaw || "").toString().trim();
    if (!needle || needle.length < 2) continue;
    const pattern = new RegExp(
      `(^|[\\s([{\"'<])${escapeRegExp(needle)}(?=[:;,.!?\\s\\])}\"'>]|$)`,
      "i"
    );
    if (pattern.test(raw)) return true;
  }
  return false;
}

function messageRepliesToAccount(message, account) {
  if (!message || !account || !message.replyTo) return false;
  const replyText = (message.replyTo.authorName || "").toString().trim().toLowerCase();
  if (replyText && replyText === account.username.toLowerCase()) return true;
  if (!message.replyTo.messageId) return false;
  const conversation = getActiveConversation();
  const bucket = conversation?.type === "dm"
    ? (conversation.thread?.messages || [])
    : (conversation?.channel?.messages || []);
  const target = bucket.find((entry) => entry.id === message.replyTo.messageId);
  return Boolean(target?.userId && target.userId === account.id);
}

function isMessageHighlightedForAccount(message, account) {
  if (!message || !account) return false;
  if (message.userId && message.userId === account.id) return false;
  return messageMentionsAccount(message.text, account) || messageRepliesToAccount(message, account);
}

function searchableMessageText(message, channelType = "text") {
  if (!message) return "";
  const raw = (message.text || "").toString();
  if (channelType === "forum" && !message.forumThreadId) {
    const parts = forumMessageParts(message);
    return `${parts.title}\n${parts.body || ""}`.trim();
  }
  return raw;
}

function parseFindDateInput(value, endOfDay = false) {
  const raw = (value || "").toString().trim();
  if (!raw) return 0;
  const parsed = new Date(`${raw}T00:00:00`);
  if (!Number.isFinite(parsed.getTime())) return 0;
  if (endOfDay) parsed.setHours(23, 59, 59, 999);
  return parsed.getTime();
}

function buildFindSpec(query = findQuery) {
  return {
    term: (query || "").trim().toLowerCase(),
    author: (findAuthorFilter || "").trim().replace(/^@/, "").toLowerCase(),
    afterMs: parseFindDateInput(findAfterFilter, false),
    beforeMs: parseFindDateInput(findBeforeFilter, true),
    hasLink: Boolean(findHasLinkOnly)
  };
}

function extractFindInlineFilters(rawQuery) {
  const source = (rawQuery || "").toString().trim();
  if (!source) return { query: "", author: "", after: "", before: "", hasLink: false };
  const authorParts = [];
  const keepParts = [];
  let after = "";
  let before = "";
  let hasLink = false;
  source.split(/\s+/).forEach((part) => {
    const token = part.trim();
    if (!token) return;
    const fromMatch = token.match(/^from:(.+)$/i);
    if (fromMatch) {
      authorParts.push(fromMatch[1].replace(/^@/, ""));
      return;
    }
    const afterMatch = token.match(/^after:(\d{4}-\d{2}-\d{2})$/i);
    if (afterMatch) {
      after = afterMatch[1];
      return;
    }
    const beforeMatch = token.match(/^before:(\d{4}-\d{2}-\d{2})$/i);
    if (beforeMatch) {
      before = beforeMatch[1];
      return;
    }
    if (/^has:link$/i.test(token)) {
      hasLink = true;
      return;
    }
    keepParts.push(token);
  });
  return {
    query: keepParts.join(" "),
    author: authorParts.join(" ").slice(0, 32),
    after,
    before,
    hasLink
  };
}

function hasActiveFindSpec(spec) {
  if (!spec) return false;
  return Boolean(spec.term || spec.author || spec.afterMs || spec.beforeMs || spec.hasLink);
}

function activeConversationFindBucket(conversation) {
  if (!conversation) return [];
  if (conversation.type === "dm") return conversation.thread?.messages || [];
  return conversation.channel?.messages || [];
}

function findMatchCacheKey(conversation, spec, bucket, channelType) {
  const list = Array.isArray(bucket) ? bucket : [];
  const first = list[0] || null;
  const last = list[list.length - 1] || null;
  return [
    conversation?.id || "",
    conversation?.type || "",
    channelType || "",
    spec?.term || "",
    spec?.author || "",
    Number(spec?.afterMs || 0),
    Number(spec?.beforeMs || 0),
    spec?.hasLink ? "1" : "0",
    list.length,
    first?.id || "",
    first?.editedAt || first?.ts || "",
    last?.id || "",
    last?.editedAt || last?.ts || ""
  ].join("|");
}

function resetFindMatchCache() {
  findMatchesCacheKey = "";
  findMatchesCache = [];
}

function activeConversationHistoryState(conversation = getActiveConversation()) {
  if (!conversation || getPreferences().relayMode !== "xmpp") return null;
  if (conversation.type === "dm" && conversation.thread) {
    const peerJid = xmppPeerJidForDmThread(conversation.thread, getCurrentAccount());
    const barePeer = xmppBareJid(peerJid);
    if (!barePeer) return null;
    return ensureXmppDmMamState(barePeer);
  }
  if (conversation.type === "channel" && conversation.channel?.xmppRoomJid) {
    const roomJid = xmppBareJid(conversation.channel.xmppRoomJid);
    if (!roomJid) return null;
    return ensureXmppMamState(roomJid);
  }
  return null;
}

function messageHasLink(message, channelType = "text") {
  if (!message) return false;
  const text = searchableMessageText(message, channelType);
  if (/(https?:\/\/|www\.)/i.test(text)) return true;
  const attachments = normalizeAttachments(message.attachments);
  return attachments.some((attachment) => /^https?:\/\//i.test((attachment?.url || "").toString()));
}

function messageMatchesFindSpec(message, spec, channelType = "text") {
  if (!message || !spec) return false;
  const haystack = searchableMessageText(message, channelType).toLowerCase();
  if (spec.term && !haystack.includes(spec.term)) return false;
  if (spec.author) {
    const authorName = displayNameForMessage(message).toLowerCase();
    const authorAccount = message.userId ? getAccountById(message.userId) : null;
    const authorUsername = (authorAccount?.username || "").toLowerCase();
    if (!authorName.includes(spec.author) && !authorUsername.includes(spec.author)) return false;
  }
  if (spec.hasLink && !messageHasLink(message, channelType)) return false;
  const tsMs = toTimestampMs(message.ts);
  if (spec.afterMs && tsMs < spec.afterMs) return false;
  if (spec.beforeMs && tsMs > spec.beforeMs) return false;
  return true;
}

function messageMatchesFindQuery(message, query, channelType = "text", specOverride = null) {
  const spec = specOverride || buildFindSpec(query);
  if (!hasActiveFindSpec(spec)) return false;
  return messageMatchesFindSpec(message, spec, channelType);
}

function formatFindSpecSummary(spec) {
  const parts = [];
  if (spec.term) parts.push(`text "${spec.term}"`);
  if (spec.author) parts.push(`from @${spec.author}`);
  if (spec.afterMs) parts.push(`after ${new Date(spec.afterMs).toLocaleDateString()}`);
  if (spec.beforeMs) parts.push(`before ${new Date(spec.beforeMs).toLocaleDateString()}`);
  if (spec.hasLink) parts.push("has link");
  return parts.join(" · ");
}

function getFindMatchesForConversation(conversation, query) {
  const spec = buildFindSpec(query);
  if (!conversation || !hasActiveFindSpec(spec)) return [];
  const isDm = conversation.type === "dm";
  const channelType = isDm ? "text" : (conversation.channel?.type || "text");
  const bucket = activeConversationFindBucket(conversation);
  const cacheKey = findMatchCacheKey(conversation, spec, bucket, channelType);
  if (cacheKey === findMatchesCacheKey) return findMatchesCache.slice();
  const out = [];
  for (const message of bucket) {
    if (!messageMatchesFindSpec(message, spec, channelType)) continue;
    out.push({
      id: message.id,
      ts: message.ts,
      author: displayNameForMessage(message),
      preview: searchableMessageText(message, channelType).replace(/\s+/g, " ").trim().slice(0, 120)
    });
    if (out.length >= 900) break;
  }
  findMatchesCacheKey = cacheKey;
  findMatchesCache = out;
  return out.slice();
}

function getFindActiveMessageId() {
  const conversation = getActiveConversation();
  const matches = getFindMatchesForConversation(conversation, findQuery);
  const selected = matches[findSelectionIndex] || matches[0];
  return selected?.id || null;
}

function renderFindList() {
  if (!ui.findList || !ui.findMeta) return;
  const conversation = getActiveConversation();
  const spec = buildFindSpec(findQuery);
  const matches = getFindMatchesForConversation(conversation, findQuery);
  findSelectionIndex = Math.max(0, Math.min(findSelectionIndex, Math.max(0, matches.length - 1)));
  ui.findList.innerHTML = "";
  if (!hasActiveFindSpec(spec)) {
    ui.findMeta.textContent = "Type text or set filters to search this conversation.";
    return;
  }
  if (matches.length === 0) {
    ui.findMeta.textContent = `No results${formatFindSpecSummary(spec) ? ` for ${formatFindSpecSummary(spec)}` : ""}.`;
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = "No matching messages found.";
    ui.findList.appendChild(empty);
    return;
  }
  ui.findMeta.textContent = `${findSelectionIndex + 1} of ${matches.length} results${formatFindSpecSummary(spec) ? ` · ${formatFindSpecSummary(spec)}` : ""}`;
  matches.forEach((entry, index) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `quick-switch-item ${index === findSelectionIndex ? "active" : ""}`;
    const title = document.createElement("strong");
    title.textContent = entry.preview || "(empty message)";
    const meta = document.createElement("small");
    meta.textContent = `${entry.author} · ${formatFullTimestamp(entry.ts || "")}`;
    row.appendChild(title);
    row.appendChild(meta);
    row.addEventListener("click", (event) => {
      if (event.button !== 0) return;
      findSelectionIndex = index;
      renderFindList();
      findDialogCloseReason = "jump";
      findDialogPendingJumpId = entry.id || "";
      findDialogPendingJumpToast = true;
      ui.findDialog?.close();
    });
    ui.findList.appendChild(row);
  });
}

function scheduleFindUiRefresh({ rerenderMessages = true, delayMs = 80 } = {}) {
  if (findRenderTimer) clearTimeout(findRenderTimer);
  findRenderTimer = setTimeout(() => {
    findRenderTimer = null;
    resetFindMatchCache();
    renderFindList();
    if (rerenderMessages) renderMessages();
  }, Math.max(0, Number(delayMs) || 0));
}

function openFindDialog() {
  findDialogCloseReason = "manual";
  findDialogPendingJumpId = "";
  findDialogPendingJumpToast = false;
  findQuery = "";
  findAuthorFilter = "";
  findAfterFilter = "";
  findBeforeFilter = "";
  findHasLinkOnly = false;
  findSelectionIndex = 0;
  if (ui.findInput) ui.findInput.value = "";
  if (ui.findAuthorInput) ui.findAuthorInput.value = "";
  if (ui.findAfterInput) ui.findAfterInput.value = "";
  if (ui.findBeforeInput) ui.findBeforeInput.value = "";
  if (ui.findHasLinkInput) ui.findHasLinkInput.checked = false;
  resetFindMatchCache();
  renderFindList();
  ui.findDialog?.showModal();
  requestAnimationFrame(() => ui.findInput?.focus());
}

function openFindDialogWithQuery(query) {
  const inline = extractFindInlineFilters(query);
  findDialogCloseReason = "manual";
  findDialogPendingJumpId = "";
  findDialogPendingJumpToast = false;
  const safeQuery = inline.query.slice(0, 120);
  findQuery = safeQuery;
  findAuthorFilter = inline.author || "";
  findAfterFilter = inline.after || "";
  findBeforeFilter = inline.before || "";
  findHasLinkOnly = Boolean(inline.hasLink);
  findSelectionIndex = 0;
  if (ui.findInput) ui.findInput.value = safeQuery;
  if (ui.findAuthorInput) ui.findAuthorInput.value = findAuthorFilter;
  if (ui.findAfterInput) ui.findAfterInput.value = findAfterFilter;
  if (ui.findBeforeInput) ui.findBeforeInput.value = findBeforeFilter;
  if (ui.findHasLinkInput) ui.findHasLinkInput.checked = findHasLinkOnly;
  resetFindMatchCache();
  renderFindList();
  ui.findDialog?.showModal();
  renderMessages();
  if (safeQuery) moveFindSelection(0);
  requestAnimationFrame(() => ui.findInput?.focus());
}

function moveFindSelection(delta) {
  const conversation = getActiveConversation();
  const matches = getFindMatchesForConversation(conversation, findQuery);
  if (matches.length === 0) return;
  findSelectionIndex = (findSelectionIndex + delta + matches.length) % matches.length;
  renderFindList();
  renderMessages();
  focusMessageByIdWithHistory(matches[findSelectionIndex].id, { toastOnLoad: false });
}

function markConversationUnreadFromMessage(conversation, messageId, accountId) {
  if (!conversation || !messageId || !accountId) return false;
  const bucket = conversation.type === "dm"
    ? (conversation.thread?.messages || [])
    : (conversation.channel?.messages || []);
  const index = bucket.findIndex((entry) => entry.id === messageId);
  if (index < 0) return false;
  const previousTs = bucket[index - 1]?.ts || "";
  if (conversation.type === "dm") {
    ensureDmReadState(conversation.thread);
    conversation.thread.readState[accountId] = previousTs;
    return true;
  }
  ensureChannelReadState(conversation.channel);
  conversation.channel.readState[accountId] = previousTs;
  return true;
}

function getChannelUnreadStats(channel, account) {
  if (!channel || !account) return { unread: 0, mentions: 0 };
  ensureChannelReadState(channel);
  const lastReadMs = toTimestampMs(channel.readState[account.id]);
  let unread = 0;
  let mentions = 0;
  channel.messages.forEach((message) => {
    if (toTimestampMs(message.ts) <= lastReadMs) return;
    if (message.userId && message.userId === account.id) return;
    unread += 1;
    if (messageMentionsAccount(message.text, account)) mentions += 1;
  });
  return { unread, mentions };
}

function findFirstUnreadMessageId(channel, account) {
  if (!channel || !account) return null;
  ensureChannelReadState(channel);
  const lastReadMs = toTimestampMs(channel.readState[account.id]);
  const unreadMessage = (Array.isArray(channel.messages) ? channel.messages : []).find((message) => (
    toTimestampMs(message.ts) > lastReadMs && message.userId !== account.id
  ));
  return unreadMessage?.id || null;
}

function ensureChannelSlowmodeState(channel) {
  if (!channel || (channel.slowmodeState && typeof channel.slowmodeState === "object")) return false;
  channel.slowmodeState = {};
  return true;
}

function normalizeSlowmodeSeconds(value) {
  return normalizeSlowmodeSecondsViaModule(value);
}

function getChannelSlowmodeSeconds(channel) {
  return normalizeSlowmodeSeconds(channel?.slowmodeSec || 0);
}

function canCurrentUserPostInChannel(channel, account) {
  if (!channel || !account) return false;
  const server = getActiveServer();
  if (!canAccountViewChannel(server, channel, account.id)) return false;
  if (!hasChannelPermission(server, channel, account.id, "sendMessages")) return false;
  if (channel.type === "voice" || channel.type === "stage") return false;
  if (channel.type === "announcement") {
    return canCurrentUser("manageMessages") || canCurrentUser("administrator");
  }
  return true;
}

function canModerateStageChannel(channel = null) {
  if (channel && channel.type !== "stage") return false;
  return canCurrentUser("stageModeration") || canCurrentUser("manageMessages") || canCurrentUser("administrator");
}

function canModerateVoiceLikeChannel(channel = null) {
  if (channel && channel.type !== "voice" && channel.type !== "stage") return false;
  return canCurrentUser("stageModeration") || canCurrentUser("manageMessages") || canCurrentUser("administrator");
}

function ensureVoiceStateForChannel(channel) {
  if (!channel) return;
  channel.voiceState = normalizeVoiceState(channel.voiceState);
}

function addVoiceActivity(channel, accountId, action, detail = "") {
  if (!channel || !accountId || !action) return;
  ensureVoiceStateForChannel(channel);
  if (!Array.isArray(channel.voiceState.activity)) channel.voiceState.activity = [];
  channel.voiceState.activity.push({
    id: createId(),
    accountId,
    action: action.toString().slice(0, 32),
    detail: detail.toString().slice(0, 120),
    ts: new Date().toISOString()
  });
  if (channel.voiceState.activity.length > 30) {
    channel.voiceState.activity = channel.voiceState.activity.slice(-30);
  }
}

function setVoiceMuteState(channel, accountId, muted) {
  if (!channel || !accountId) return false;
  ensureVoiceStateForChannel(channel);
  if (!channel.voiceState.connectedIds.includes(accountId)) return false;
  const hasMuted = channel.voiceState.mutedIds.includes(accountId);
  if (muted && !hasMuted) channel.voiceState.mutedIds.push(accountId);
  if (!muted && hasMuted) channel.voiceState.mutedIds = channel.voiceState.mutedIds.filter((id) => id !== accountId);
  return hasMuted !== muted;
}

function setStageRaisedHandState(channel, accountId, raised) {
  if (!channel || !accountId || channel.type !== "stage") return false;
  ensureVoiceStateForChannel(channel);
  if (!channel.voiceState.connectedIds.includes(accountId)) return false;
  const hasRaised = channel.voiceState.raisedHandIds.includes(accountId);
  if (raised && !hasRaised) channel.voiceState.raisedHandIds.push(accountId);
  if (!raised && hasRaised) channel.voiceState.raisedHandIds = channel.voiceState.raisedHandIds.filter((id) => id !== accountId);
  return hasRaised !== raised;
}

function setStageSpeakerState(channel, accountId, speaker) {
  if (!channel || !accountId || channel.type !== "stage") return false;
  ensureVoiceStateForChannel(channel);
  if (!channel.voiceState.connectedIds.includes(accountId)) return false;
  const isSpeaker = channel.voiceState.speakerIds.includes(accountId);
  if (speaker && !isSpeaker) channel.voiceState.speakerIds.push(accountId);
  if (!speaker && isSpeaker) channel.voiceState.speakerIds = channel.voiceState.speakerIds.filter((id) => id !== accountId);
  if (speaker) {
    channel.voiceState.raisedHandIds = channel.voiceState.raisedHandIds.filter((id) => id !== accountId);
  }
  return isSpeaker !== speaker;
}

function resolveVoiceParticipantByToken(channel, token, guild) {
  if (!channel || !guild) return null;
  ensureVoiceStateForChannel(channel);
  const needle = (token || "").trim().toLowerCase();
  if (!needle) return null;
  const connected = channel.voiceState.connectedIds
    .map((id) => getAccountById(id))
    .filter(Boolean);
  const byId = connected.find((entry) => entry.id.toLowerCase().startsWith(needle));
  if (byId) return byId;
  const exact = connected.filter((entry) => {
    const username = (entry.username || "").toLowerCase();
    const display = displayNameForAccount(entry, guild.id).toLowerCase();
    return username === needle || display === needle;
  });
  if (exact.length === 1) return exact[0];
  const partial = connected.filter((entry) => {
    const username = (entry.username || "").toLowerCase();
    const display = displayNameForAccount(entry, guild.id).toLowerCase();
    return username.includes(needle) || display.includes(needle);
  });
  return partial.length === 1 ? partial[0] : null;
}

function resolveVoiceChannelByToken(guild, token) {
  if (!guild) return null;
  const needle = (token || "").trim().replace(/^#/, "").toLowerCase();
  if (!needle) return null;
  const pool = (guild.channels || []).filter((entry) => entry.type === "voice" || entry.type === "stage");
  const byId = pool.find((entry) => (entry.id || "").toLowerCase().startsWith(needle));
  if (byId) return byId;
  const exact = pool.filter((entry) => (entry.name || "").toLowerCase() === needle);
  if (exact.length === 1) return exact[0];
  const partial = pool.filter((entry) => (entry.name || "").toLowerCase().includes(needle));
  return partial.length === 1 ? partial[0] : null;
}

function leaveAllVoiceChannelsForAccount(guild, accountId) {
  if (!guild || !accountId) return false;
  let changed = false;
  guild.channels.forEach((channel) => {
    if (channel.type !== "voice" && channel.type !== "stage") return;
    ensureVoiceStateForChannel(channel);
    const before = JSON.stringify(channel.voiceState);
    channel.voiceState.connectedIds = channel.voiceState.connectedIds.filter((id) => id !== accountId);
    channel.voiceState.mutedIds = channel.voiceState.mutedIds.filter((id) => id !== accountId);
    channel.voiceState.raisedHandIds = channel.voiceState.raisedHandIds.filter((id) => id !== accountId);
    channel.voiceState.speakerIds = channel.voiceState.speakerIds.filter((id) => id !== accountId);
    if (JSON.stringify(channel.voiceState) !== before) changed = true;
  });
  return changed;
}

function joinVoiceLikeChannel(channel, accountId) {
  const guild = getActiveGuild();
  if (!guild || !channel || !accountId) return false;
  leaveAllVoiceChannelsForAccount(guild, accountId);
  ensureVoiceStateForChannel(channel);
  if (!channel.voiceState.connectedIds.includes(accountId)) channel.voiceState.connectedIds.push(accountId);
  addVoiceActivity(channel, accountId, "join");
  return true;
}

function leaveVoiceLikeChannel(channel, accountId) {
  if (!channel || !accountId) return false;
  ensureVoiceStateForChannel(channel);
  const before = JSON.stringify(channel.voiceState);
  channel.voiceState.connectedIds = channel.voiceState.connectedIds.filter((id) => id !== accountId);
  channel.voiceState.mutedIds = channel.voiceState.mutedIds.filter((id) => id !== accountId);
  channel.voiceState.raisedHandIds = channel.voiceState.raisedHandIds.filter((id) => id !== accountId);
  channel.voiceState.speakerIds = channel.voiceState.speakerIds.filter((id) => id !== accountId);
  const changed = JSON.stringify(channel.voiceState) !== before;
  if (changed) addVoiceActivity(channel, accountId, "leave");
  return changed;
}

function toggleVoiceMuteForSelf(channel, accountId) {
  if (!channel || !accountId) return false;
  ensureVoiceStateForChannel(channel);
  const nextMuted = !channel.voiceState.mutedIds.includes(accountId);
  const changed = setVoiceMuteState(channel, accountId, nextMuted);
  if (changed) addVoiceActivity(channel, accountId, nextMuted ? "mute" : "unmute");
  return changed;
}

function describeVoiceActivity(entry, guild) {
  const account = getAccountById(entry?.accountId || "");
  const who = account ? displayNameForAccount(account, guild?.id || null) : "Unknown";
  const detail = (entry?.detail || "").trim();
  const map = {
    join: "joined",
    leave: "left",
    mute: "muted",
    unmute: "unmuted",
    hand_raise: "raised hand",
    hand_lower: "lowered hand",
    speaker_on: "became speaker",
    speaker_off: "stopped speaking",
    approved: "approved speaker request",
    dismissed: "dismissed hand raise",
    promoted: "promoted to speaker",
    demoted: "demoted from speaker",
    disconnected: "disconnected member"
  };
  const verb = map[entry?.action] || (entry?.action || "updated");
  return detail ? `${who} ${verb} (${detail})` : `${who} ${verb}`;
}

function toggleRaisedHandForSelf(channel, accountId) {
  if (!channel || !accountId || channel.type !== "stage") return false;
  ensureVoiceStateForChannel(channel);
  const nextRaised = !channel.voiceState.raisedHandIds.includes(accountId);
  const changed = setStageRaisedHandState(channel, accountId, nextRaised);
  if (changed) addVoiceActivity(channel, accountId, nextRaised ? "hand_raise" : "hand_lower");
  return changed;
}

function toggleStageSpeaker(channel, accountId) {
  if (!channel || !accountId || channel.type !== "stage") return false;
  ensureVoiceStateForChannel(channel);
  const nextSpeaker = !channel.voiceState.speakerIds.includes(accountId);
  const changed = setStageSpeakerState(channel, accountId, nextSpeaker);
  if (changed) addVoiceActivity(channel, accountId, nextSpeaker ? "speaker_on" : "speaker_off");
  return changed;
}

function getChannelSlowmodeRemainingMs(channel, accountId) {
  const seconds = getChannelSlowmodeSeconds(channel);
  if (!channel || !accountId || seconds <= 0) return 0;
  ensureChannelSlowmodeState(channel);
  const lastIso = channel.slowmodeState?.[accountId];
  const lastMs = toTimestampMs(lastIso);
  if (!lastMs) return 0;
  const elapsed = Date.now() - lastMs;
  const remaining = seconds * 1000 - elapsed;
  return remaining > 0 ? remaining : 0;
}

function recordChannelSlowmodeSend(channel, accountId) {
  if (!channel || !accountId) return;
  if (getChannelSlowmodeSeconds(channel) <= 0) return;
  ensureChannelSlowmodeState(channel);
  channel.slowmodeState[accountId] = new Date().toISOString();
}

function formatSlowmodeLabel(seconds) {
  const sec = normalizeSlowmodeSeconds(seconds);
  if (sec <= 0) return "Slowmode off";
  if (sec < 60) return `Slowmode ${sec}s`;
  const mins = Math.floor(sec / 60);
  const rest = sec % 60;
  return rest === 0 ? `Slowmode ${mins}m` : `Slowmode ${mins}m ${rest}s`;
}

function getGuildUnreadStats(guild, account) {
  if (!guild || !account) return { unread: 0, mentions: 0 };
  if (!canAccountAccessGuild(guild, account)) {
    return { unread: 0, mentions: 0 };
  }
  const totals = guild.channels.reduce((acc, channel) => {
    if (!canAccountViewChannel(guild, channel, account.id)) return acc;
    const stats = getChannelUnreadStats(channel, account);
    return {
      unread: acc.unread + stats.unread,
      mentions: acc.mentions + stats.mentions
    };
  }, { unread: 0, mentions: 0 });
  return applyGuildNotificationModeToStats(totals, getGuildNotificationMode(guild.id));
}

function getGuildChannelsForNavigation() {
  const guild = getActiveGuild();
  const account = getCurrentAccount();
  if (!guild || !Array.isArray(guild.channels) || !account) return [];
  return guild.channels.filter((channel) => canAccountViewChannel(guild, channel, account.id));
}

function getFirstOpenableChannelIdForGuild(guild) {
  if (!guild || !Array.isArray(guild.channels) || guild.channels.length === 0) return null;
  const account = getCurrentAccount();
  const visible = account
    ? guild.channels.filter((channel) => canAccountViewChannel(guild, channel, account.id))
    : guild.channels;
  if (visible.length === 0) return null;
  const preferred = getPreferredGuildChannelId(guild.id);
  if (preferred && visible.some((channel) => channel.id === preferred)) return preferred;
  return visible[0]?.id || null;
}

function ensureActiveGuildForCurrentAccount() {
  const account = getCurrentAccount();
  if (!account) return false;
  const accessibleGuilds = listAccessibleGuildsForAccount(account);
  let changed = false;
  if (accessibleGuilds.length === 0) {
    if (state.viewMode === "guild") {
      state.viewMode = "dm";
      changed = true;
    }
    if (state.activeGuildId) {
      state.activeGuildId = null;
      changed = true;
    }
    if (state.activeChannelId) {
      state.activeChannelId = null;
      changed = true;
    }
    return changed;
  }
  let activeGuild = state.guilds.find((entry) => entry.id === state.activeGuildId) || null;
  if (!activeGuild || !canAccountAccessGuild(activeGuild, account)) {
    [activeGuild] = accessibleGuilds;
    const nextGuildId = activeGuild?.id || null;
    if (state.activeGuildId !== nextGuildId) {
      state.activeGuildId = nextGuildId;
      changed = true;
    }
  }
  if (!activeGuild) return changed;
  const activeChannelStillOpen = activeGuild.channels.some((channel) => (
    channel.id === state.activeChannelId && canAccountViewChannel(activeGuild, channel, account.id)
  ));
  if (!activeChannelStillOpen) {
    const nextChannelId = getFirstOpenableChannelIdForGuild(activeGuild);
    if (state.activeChannelId !== nextChannelId) {
      state.activeChannelId = nextChannelId;
      changed = true;
    }
  }
  return changed;
}

function openGuildById(guildId) {
  const current = getCurrentAccount();
  const guild = state.guilds.find((entry) => entry.id === guildId);
  if (!guild) return false;
  if (current && !canAccountAccessGuild(guild, current)) return false;
  state.viewMode = "guild";
  state.activeGuildId = guild.id;
  state.activeChannelId = getFirstOpenableChannelIdForGuild(guild);
  state.activeDmId = null;
  state.preferences = getPreferences();
  state.preferences.mobilePane = "nav";
  saveState();
  render();
  return true;
}

function navigateGuildChannelByOffset(delta) {
  const channels = getGuildChannelsForNavigation();
  if (channels.length === 0) return false;
  const currentIndex = channels.findIndex((channel) => channel.id === state.activeChannelId);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = Math.max(0, Math.min(channels.length - 1, safeIndex + delta));
  const next = channels[nextIndex];
  if (!next || next.id === state.activeChannelId) return false;
  state.viewMode = "guild";
  state.activeDmId = null;
  state.activeChannelId = next.id;
  saveState();
  render();
  return true;
}

function moveActiveChannelByOffset(delta) {
  const guild = getActiveGuild();
  const channelId = state.activeChannelId;
  if (!guild || !channelId || !canCurrentUser("manageChannels")) return false;
  const moved = moveChannelByOffset(guild, channelId, delta);
  if (!moved) return false;
  saveState();
  renderChannels();
  return true;
}

function listUnreadGuildChannels(guild, account) {
  if (!guild || !account) return [];
  return guild.channels
    .filter((channel) => canAccountViewChannel(guild, channel, account.id))
    .map((channel) => ({ channel, stats: getChannelUnreadStats(channel, account) }))
    .filter((entry) => entry.stats.unread > 0);
}

function jumpToUnreadGuildChannel(direction = 1) {
  const guild = getActiveGuild();
  const account = getCurrentAccount();
  if (!guild || !account) return false;
  const unread = listUnreadGuildChannels(guild, account);
  if (unread.length === 0) return false;
  const unreadIds = unread.map((entry) => entry.channel.id);
  const currentIndex = unreadIds.indexOf(state.activeChannelId);
  const fallback = direction >= 0 ? 0 : unreadIds.length - 1;
  const base = currentIndex >= 0 ? currentIndex : fallback;
  const nextIndex = (base + (direction >= 0 ? 1 : -1) + unreadIds.length) % unreadIds.length;
  const nextId = unreadIds[nextIndex];
  if (!nextId) return false;
  state.viewMode = "guild";
  state.activeDmId = null;
  state.activeChannelId = nextId;
  saveState();
  render();
  return true;
}

function listMentionGuildChannels(guild, account) {
  if (!guild || !account) return [];
  return guild.channels
    .filter((channel) => canAccountViewChannel(guild, channel, account.id))
    .map((channel) => ({ channel, stats: getChannelUnreadStats(channel, account) }))
    .filter((entry) => entry.stats.mentions > 0);
}

function jumpToMentionGuildChannel(direction = 1) {
  const guild = getActiveGuild();
  const account = getCurrentAccount();
  if (!guild || !account) return false;
  const mentionChannels = listMentionGuildChannels(guild, account);
  if (mentionChannels.length === 0) return false;
  const mentionIds = mentionChannels.map((entry) => entry.channel.id);
  const currentIndex = mentionIds.indexOf(state.activeChannelId);
  const fallback = direction >= 0 ? 0 : mentionIds.length - 1;
  const base = currentIndex >= 0 ? currentIndex : fallback;
  const nextIndex = (base + (direction >= 0 ? 1 : -1) + mentionIds.length) % mentionIds.length;
  const nextId = mentionIds[nextIndex];
  if (!nextId) return false;
  state.viewMode = "guild";
  state.activeDmId = null;
  state.activeChannelId = nextId;
  saveState();
  render();
  return true;
}

function cycleActiveDmThread(direction = 1) {
  const account = getCurrentAccount();
  if (!account) return false;
  const threads = getSortedDmThreadsForAccount(account);
  if (threads.length === 0) return false;
  const ids = threads.map((entry) => entry.id);
  const currentIndex = ids.indexOf(state.activeDmId);
  const fallback = direction >= 0 ? 0 : ids.length - 1;
  const base = currentIndex >= 0 ? currentIndex : fallback;
  const nextIndex = currentIndex >= 0
    ? (base + (direction >= 0 ? 1 : -1) + ids.length) % ids.length
    : fallback;
  const nextId = ids[nextIndex];
  if (!nextId) return false;
  if (threads.length === 1 && state.viewMode === "dm" && state.activeDmId === nextId) return false;
  state.viewMode = "dm";
  state.activeDmId = nextId;
  saveState();
  render();
  return true;
}

function moveChannelByOffset(guild, channelId, delta) {
  if (!guild || !Array.isArray(guild.channels) || !channelId || !Number.isFinite(delta) || delta === 0) return false;
  const from = guild.channels.findIndex((entry) => entry.id === channelId);
  if (from < 0) return false;
  const to = Math.max(0, Math.min(guild.channels.length - 1, from + (delta > 0 ? 1 : -1)));
  if (to === from) return false;
  const [entry] = guild.channels.splice(from, 1);
  guild.channels.splice(to, 0, entry);
  return true;
}

function duplicateChannelInGuild(guild, channel) {
  if (!guild || !channel) return null;
  const forumTags = channel.type === "forum" ? forumTagsForChannel(channel).map((tag) => ({ ...tag })) : [];
  const clone = {
    id: createId(),
    name: sanitizeChannelName(`${channel.name || "channel"}-copy`, "channel-copy"),
    type: channel.type || "text",
    topic: (channel.topic || "").toString(),
    forumTags,
    permissionOverrides: normalizeChannelPermissionOverrides(channel.permissionOverrides, getServerRoles(guild).map((role) => role.id)),
    voiceState: createVoiceState(),
    readState: state.currentAccountId ? { [state.currentAccountId]: new Date().toISOString() } : {},
    slowmodeSec: normalizeSlowmodeSeconds(channel.slowmodeSec || 0),
    slowmodeState: {},
    messages: []
  };
  guild.channels.push(clone);
  return clone;
}

async function copyText(value) {
  const text = (value || "").toString();
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below.
  }
  const area = document.createElement("textarea");
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  area.value = text;
  area.setAttribute("readonly", "true");
  area.style.position = "fixed";
  area.style.top = "-9999px";
  area.style.left = "-9999px";
  area.style.opacity = "0";
  area.style.pointerEvents = "none";
  document.body.appendChild(area);
  try {
    area.focus();
    area.select();
    area.setSelectionRange(0, area.value.length);
    const copied = document.execCommand("copy");
    if (copied) return true;
    // Manual fallback for browsers that block clipboard writes on non-secure origins.
    await showInAppCopyDialog(text);
    return false;
  } catch {
    await showInAppCopyDialog(text);
    return false;
  } finally {
    area.remove();
    if (active) {
      try {
        active.focus();
      } catch {
        // Ignore focus restore failures.
      }
    }
  }
}

function copyTextToChannelWithFeedback(channel, value, {
  successText = "Copied.",
  emptyText = "Nothing to copy.",
  failureText = "Failed to copy."
} = {}) {
  const text = (value || "").toString();
  if (!text.trim()) {
    addSystemMessage(channel, emptyText);
    return;
  }
  void copyText(text).then((ok) => {
    addSystemMessage(channel, ok ? successText : failureText);
  });
}

function ensureToastHost() {
  let host = document.getElementById("appToastHost");
  if (host) return host;
  host = document.createElement("div");
  host.id = "appToastHost";
  host.className = "toast-host";
  host.setAttribute("role", "status");
  host.setAttribute("aria-live", "polite");
  document.body.appendChild(host);
  return host;
}

function showToast(message, { tone = "info", duration = 1800 } = {}) {
  if (!message) return;
  const host = ensureToastHost();
  host.textContent = message;
  host.classList.toggle("is-error", tone === "error");
  host.classList.add("is-visible");
  if (toastHideTimer) clearTimeout(toastHideTimer);
  toastHideTimer = setTimeout(() => {
    host.classList.remove("is-visible");
  }, Math.max(500, Number(duration) || 1800));
}

function ensureMediaLightbox() {
  let overlay = document.getElementById("mediaLightbox");
  if (overlay) return overlay;
  overlay = document.createElement("div");
  overlay.id = "mediaLightbox";
  overlay.className = "media-lightbox";
  overlay.tabIndex = -1;
  overlay.hidden = true;
  overlay.innerHTML = [
    "<button type=\"button\" class=\"media-lightbox__close\" data-lightbox-close=\"1\" aria-label=\"Close\">✕</button>",
    "<div class=\"media-lightbox__stage\"></div>",
    "<div class=\"media-lightbox__caption\"></div>"
  ].join("");
  const closeBtn = overlay.querySelector(".media-lightbox__close");
  closeBtn?.addEventListener("click", () => {
    closeMediaLightbox();
  });
  const shouldKeepOpenForTarget = (target) => {
    if (!(target instanceof HTMLElement)) return false;
    if (target.closest("[data-lightbox-close=\"1\"]")) return false;
    if (target.closest(".media-lightbox__media")) return true;
    if (target.closest(".media-lightbox__actions")) return true;
    if (target.closest(".native-call-surface")) return true;
    if (target.closest(".message-swf-link")) return true;
    if (target.closest(".external-link-gate")) return true;
    if (target.closest(".incoming-call-gate")) return true;
    if (target.closest(".in-app-confirm")) return true;
    return false;
  };
  overlay.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target.closest("[data-lightbox-close=\"1\"]")) {
      closeMediaLightbox();
      return;
    }
    if (shouldKeepOpenForTarget(event.target)) return;
    closeMediaLightbox();
  });
  document.body.appendChild(overlay);
  return overlay;
}

function hasPinnedNativeCallLightbox() {
  const sid = (xmppActiveNativeCallSessionId || "").toString().trim();
  if (!sid) return false;
  if (!xmppCallSessionById.has(sid)) return false;
  const overlay = document.getElementById("mediaLightbox");
  if (!overlay || overlay.hidden) return false;
  return Boolean(overlay.querySelector(".native-call-surface"));
}

function hasPinnedWebCallLightbox() {
  if (!activeWebCallLightbox) return false;
  const overlay = document.getElementById("mediaLightbox");
  if (!overlay || overlay.hidden) return false;
  return true;
}

function isNativeCallAudioTestActive(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid || nativeCallAudioTestSessionId !== sid) return false;
  const audio = nativeCallAudioTestElement;
  if (!(audio instanceof HTMLAudioElement)) return false;
  return !audio.paused && !audio.ended;
}

function stopNativeCallAudioTest() {
  const audio = nativeCallAudioTestElement;
  if (audio instanceof HTMLAudioElement) {
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute("src");
      audio.load();
    } catch {
      // Ignore audio cleanup failures.
    }
    audio.onended = null;
    audio.onerror = null;
  }
  nativeCallAudioTestElement = null;
  nativeCallAudioTestSessionId = "";
}

async function startNativeCallAudioTest(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return false;
  const clipUrl = resolveMediaUrl("./rickroll.ogg");
  if (!clipUrl) return false;
  if (nativeCallAudioTestSessionId && nativeCallAudioTestSessionId !== sid) {
    stopNativeCallAudioTest();
  }
  let audio = nativeCallAudioTestElement;
  if (!(audio instanceof HTMLAudioElement)) {
    audio = new Audio();
    audio.preload = "auto";
    nativeCallAudioTestElement = audio;
  }
  nativeCallAudioTestSessionId = sid;
  audio.onended = () => {
    stopNativeCallAudioTest();
    if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
  };
  audio.onerror = () => {
    stopNativeCallAudioTest();
    showToast("Could not play local rickroll.ogg clip.", { tone: "error", duration: 2600 });
    if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
  };
  try {
    audio.pause();
    audio.src = clipUrl;
    audio.currentTime = 0;
    void applyAudioOutputDeviceToElement(audio, getPreferences().callAudioOutputId || "");
    await audio.play();
    if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
    return true;
  } catch {
    stopNativeCallAudioTest();
    showToast("Audio playback was blocked. Click the page and try again.", { tone: "error", duration: 2800 });
    if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
    return false;
  }
}

function closeMediaLightbox({ force = false } = {}) {
  if (!force && (hasPinnedNativeCallLightbox() || hasPinnedWebCallLightbox())) return false;
  const overlay = document.getElementById("mediaLightbox");
  if (!overlay) return false;
  overlay.hidden = true;
  const stage = overlay.querySelector(".media-lightbox__stage");
  if (stage) stage.innerHTML = "";
  xmppActiveNativeCallSessionId = "";
  nativeCallDebugDialogSessionId = "";
  if (activeWebCallLightbox) {
    const { conversationId, conversationType, screenShare, fromLabel, incoming } = activeWebCallLightbox;
    activeWebCallLightbox = null;
    const conversation = resolveConversationById(conversationId, conversationType);
    if (conversation) {
      const endedText = incoming
        ? `Call with ${fromLabel || "peer"} ended.`
        : `Your ${screenShare ? "screen-share" : "voice/video"} call ended.`;
      if (addSystemMessageToConversation(conversation, endedText)) {
        refreshConversationUi(conversation);
        saveState();
      }
    }
  }
  stopWebCallRingtone();
  stopNativeCallAudioTest();
  document.body.style.removeProperty("overflow");
  return true;
}

function lightboxDownloadNameFromLabel(label = "", fallbackExt = "bin") {
  const ext = (fallbackExt || "bin").toString().replace(/^\./, "").toLowerCase() || "bin";
  const base = (label || "media")
    .toString()
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 64)
    || "media";
  if (/\.[a-z0-9]{1,8}$/i.test(base)) return base;
  return `${base}.${ext}`;
}

function triggerMediaDownload(url, filename = "media.bin") {
  const href = resolveMediaUrl((url || "").toString().trim());
  if (!href) return;
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename || "media.bin";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function bindMediaPreviewContextMenu(target, {
  url = "",
  label = "media",
  fallbackExt = "bin"
} = {}) {
  if (!(target instanceof HTMLElement)) return;
  const mediaUrl = resolveMediaUrl(url);
  if (!mediaUrl) return;
  target.addEventListener("contextmenu", (event) => {
    openContextMenu(event, [
      {
        label: "Copy Media URL",
        action: () => copyText(mediaUrl)
      },
      {
        label: "Download Media",
        action: () => {
          triggerMediaDownload(mediaUrl, lightboxDownloadNameFromLabel(label, fallbackExt));
        }
      }
    ]);
  });
}

function showInAppConfirmDialog({
  title = "Confirm action",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  hideCancel = false
} = {}) {
  return new Promise((resolve) => {
    const overlay = ensureMediaLightbox();
    const stage = overlay.querySelector(".media-lightbox__stage");
    const caption = overlay.querySelector(".media-lightbox__caption");
    if (!stage || !caption) {
      resolve(false);
      return;
    }
    stage.innerHTML = "";
    const card = document.createElement("div");
    card.className = "in-app-confirm";
    const heading = document.createElement("strong");
    heading.textContent = title;
    const body = document.createElement("div");
    body.className = "in-app-confirm__body";
    body.textContent = message || "";
    const actions = document.createElement("div");
    actions.className = "in-app-confirm__actions";
    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.textContent = confirmLabel;
    if (danger) confirmBtn.classList.add("is-danger");
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      closeMediaLightbox();
      resolve(Boolean(result));
    };
    confirmBtn.addEventListener("click", () => finish(true));
    actions.appendChild(confirmBtn);
    if (!hideCancel) {
      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.textContent = cancelLabel;
      cancelBtn.addEventListener("click", () => finish(false));
      actions.appendChild(cancelBtn);
    }
    card.appendChild(heading);
    if (message) card.appendChild(body);
    card.appendChild(actions);
    stage.appendChild(card);
    caption.textContent = "Confirmation";
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    overlay.focus({ preventScroll: true });
  });
}

function showInAppAlertDialog({
  title = "Notice",
  message = "",
  confirmLabel = "OK"
} = {}) {
  return showInAppConfirmDialog({
    title,
    message,
    confirmLabel,
    hideCancel: true
  });
}

function showInAppPromptDialog({
  title = "Enter value",
  message = "",
  defaultValue = "",
  placeholder = "",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  multiline = false
} = {}) {
  return new Promise((resolve) => {
    const overlay = ensureMediaLightbox();
    const stage = overlay.querySelector(".media-lightbox__stage");
    const caption = overlay.querySelector(".media-lightbox__caption");
    if (!stage || !caption) {
      resolve(null);
      return;
    }
    stage.innerHTML = "";
    const card = document.createElement("div");
    card.className = "in-app-confirm";
    const heading = document.createElement("strong");
    heading.textContent = title;
    const body = document.createElement("div");
    body.className = "in-app-confirm__body";
    body.textContent = message || "";
    const input = multiline ? document.createElement("textarea") : document.createElement("input");
    input.className = "in-app-confirm__input";
    input.value = (defaultValue ?? "").toString();
    input.placeholder = placeholder || "";
    if (!multiline) input.type = "text";
    const actions = document.createElement("div");
    actions.className = "in-app-confirm__actions";
    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.textContent = confirmLabel;
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = cancelLabel;
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      closeMediaLightbox();
      resolve(value);
    };
    confirmBtn.addEventListener("click", () => finish(input.value));
    cancelBtn.addEventListener("click", () => finish(null));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish(null);
        return;
      }
      if (!multiline && event.key === "Enter") {
        event.preventDefault();
        finish(input.value);
      }
    });
    actions.appendChild(confirmBtn);
    actions.appendChild(cancelBtn);
    card.appendChild(heading);
    if (message) card.appendChild(body);
    card.appendChild(input);
    card.appendChild(actions);
    stage.appendChild(card);
    caption.textContent = "Input";
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    overlay.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      try {
        input.focus();
        input.select?.();
      } catch {
        // Ignore focus failures.
      }
    });
  });
}

function showInAppCopyDialog(text = "") {
  return new Promise((resolve) => {
    const overlay = ensureMediaLightbox();
    const stage = overlay.querySelector(".media-lightbox__stage");
    const caption = overlay.querySelector(".media-lightbox__caption");
    if (!stage || !caption) {
      resolve(false);
      return;
    }
    stage.innerHTML = "";
    const card = document.createElement("div");
    card.className = "in-app-confirm";
    const heading = document.createElement("strong");
    heading.textContent = "Copy text";
    const body = document.createElement("div");
    body.className = "in-app-confirm__body";
    body.textContent = "Select the text below and copy it.";
    const area = document.createElement("textarea");
    area.className = "in-app-confirm__input";
    area.readOnly = true;
    area.value = (text ?? "").toString();
    const actions = document.createElement("div");
    actions.className = "in-app-confirm__actions";
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", () => {
      closeMediaLightbox();
      resolve(true);
    });
    actions.appendChild(closeBtn);
    card.appendChild(heading);
    card.appendChild(body);
    card.appendChild(area);
    card.appendChild(actions);
    stage.appendChild(card);
    caption.textContent = "Manual copy";
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    overlay.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      try {
        area.focus();
        area.select();
      } catch {
        // Ignore focus failures.
      }
    });
  });
}

function openMediaLightbox({ url, label = "", video = false } = {}) {
  if (!url) return;
  const mediaUrl = resolveMediaUrl(url);
  const overlay = ensureMediaLightbox();
  const stage = overlay.querySelector(".media-lightbox__stage");
  const caption = overlay.querySelector(".media-lightbox__caption");
  if (!stage || !caption) return;
  stage.innerHTML = "";
  let media = null;
  const normalizedLabel = (label || "").toString().trim() || "media";
  const fallbackExt = video ? "mp4" : "png";
  if (video) {
    media = createVideoPreviewElement(mediaUrl, label || "Video", stage);
    media.className = "media-lightbox__media";
    bindMediaPreviewContextMenu(media, {
      url: mediaUrl,
      label: normalizedLabel,
      fallbackExt
    });
  } else {
    media = document.createElement("img");
    media.className = "media-lightbox__media";
    media.alt = label || "media preview";
    media.loading = "eager";
    media.src = mediaUrl;
    media.addEventListener("error", () => {
      const note = document.createElement("div");
      note.className = "message-embed-note";
      note.textContent = "Preview unavailable. Open in a new tab.";
      const openLink = document.createElement("a");
      openLink.className = "message-swf-link";
      openLink.href = mediaUrl;
      openLink.target = "_blank";
      openLink.rel = "noopener noreferrer";
      openLink.textContent = "Open media";
      stage.innerHTML = "";
      stage.appendChild(note);
      stage.appendChild(openLink);
    });
    bindMediaPreviewContextMenu(media, {
      url: mediaUrl,
      label: normalizedLabel,
      fallbackExt: /\.svg(\?|#|$)/i.test(mediaUrl) ? "svg" : fallbackExt
    });
  }
  stage.appendChild(media);
  const actions = document.createElement("div");
  actions.className = "media-lightbox__actions";
  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.textContent = "Copy URL";
  copyBtn.addEventListener("click", async () => {
    const copied = await copyText(mediaUrl);
    showToast(copied ? "URL copied." : "Could not copy URL.", { tone: copied ? "info" : "error" });
  });
  const downloadBtn = document.createElement("button");
  downloadBtn.type = "button";
  downloadBtn.textContent = "Download";
  downloadBtn.addEventListener("click", () => {
    const resolvedExt = /\.svg(\?|#|$)/i.test(mediaUrl)
      ? "svg"
      : fallbackExt;
    triggerMediaDownload(mediaUrl, lightboxDownloadNameFromLabel(normalizedLabel, resolvedExt));
  });
  actions.appendChild(copyBtn);
  actions.appendChild(downloadBtn);
  stage.appendChild(actions);
  caption.textContent = label || "";
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  overlay.focus({ preventScroll: true });
}

function showExternalLinkPrompt(targetUrl, { allowEmbed = true } = {}) {
  const overlay = ensureMediaLightbox();
  const stage = overlay.querySelector(".media-lightbox__stage");
  const caption = overlay.querySelector(".media-lightbox__caption");
  if (!stage || !caption) return;
  stage.innerHTML = "";
  const gate = document.createElement("div");
  gate.className = "external-link-gate";
  const title = document.createElement("strong");
  title.textContent = "Open external link?";
  const preview = document.createElement("code");
  preview.className = "external-link-gate__url";
  preview.textContent = targetUrl;
  const actions = document.createElement("div");
  actions.className = "external-link-gate__actions";
  const confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.textContent = "Confirm";
  confirmBtn.addEventListener("click", () => {
    if (!allowEmbed) {
      showToast("External protocols are blocked in-app.", { tone: "warn" });
      closeMediaLightbox();
      return;
    }
    stage.innerHTML = "";
    const frame = document.createElement("iframe");
    frame.className = "media-lightbox__media media-lightbox__media--frame";
    frame.src = targetUrl;
    frame.loading = "eager";
    frame.referrerPolicy = "no-referrer";
    frame.allow = "fullscreen";
    const controls = document.createElement("div");
    controls.className = "external-link-gate__actions";
    const externalBtn = document.createElement("button");
    externalBtn.type = "button";
    externalBtn.textContent = "Open External";
    externalBtn.addEventListener("click", () => {
      if (nativeWindowOpen) {
        nativeWindowOpen(targetUrl, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = targetUrl;
      }
    });
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", () => closeMediaLightbox());
    controls.appendChild(externalBtn);
    controls.appendChild(closeBtn);
    stage.appendChild(frame);
    stage.appendChild(controls);
    caption.textContent = targetUrl;
  });
  const denyBtn = document.createElement("button");
  denyBtn.type = "button";
  denyBtn.textContent = "Deny";
  denyBtn.addEventListener("click", () => closeMediaLightbox());
  actions.appendChild(confirmBtn);
  actions.appendChild(denyBtn);
  gate.appendChild(title);
  gate.appendChild(preview);
  gate.appendChild(actions);
  stage.appendChild(gate);
  caption.textContent = "External link request";
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  overlay.focus({ preventScroll: true });
}

function openExternalUrlInClient(rawUrl) {
  const targetUrl = resolveMediaUrl((rawUrl || "").toString().trim());
  if (!targetUrl) return;
  const allowEmbed = /^https?:\/\//i.test(targetUrl);
  showExternalLinkPrompt(targetUrl, { allowEmbed });
}

if (nativeWindowOpen && window.__s67ExternalOpenProxy !== true) {
  window.__s67ExternalOpenProxy = true;
  window.open = (url) => {
    const targetUrl = (url || "").toString();
    if (/^s67:/i.test(targetUrl)) {
      return nativeWindowOpen(targetUrl, "_blank", "noopener");
    }
    openExternalUrlInClient(targetUrl);
    return null;
  };
}

window.addEventListener("s67-open-external-url", (event) => {
  const requestedUrl = (event?.detail || "").toString();
  if (!requestedUrl) return;
  openExternalUrlInClient(requestedUrl);
});

function formatDebugLogs() {
  const runtime = {
    location: window.location.href,
    ruffleReady: Boolean(window.RufflePlayer?.newest),
    dotLottieReady: typeof customElements !== "undefined" && Boolean(customElements.get("dotlottie-player")),
    activeGuildId: state.activeGuildId || null,
    activeChannelId: state.activeChannelId || null
  };
  return JSON.stringify({ runtime, logs: debugLogs }, null, 2);
}

function renderDebugDialog() {
  ui.debugOutput.textContent = formatDebugLogs();
}

function openDebugDialog() {
  renderDebugDialog();
  ui.debugDialog.showModal();
}

function serializeMessageAsJson(message) {
  return JSON.stringify({
    id: message.id,
    userId: message.userId || null,
    authorName: message.authorName || "",
    text: message.text || "",
    ts: message.ts,
    editedAt: message.editedAt || null,
    editedByUserId: message.editedByUserId || null,
    editedByName: message.editedByName || "",
    editedByStaff: Boolean(message.editedByStaff),
    collaborative: Boolean(message.collaborative),
    editHistory: messageEditHistory(message),
    replyTo: message.replyTo || null,
    pinned: Boolean(message.pinned),
    reactions: normalizeReactions(message.reactions),
    attachments: normalizeAttachments(message.attachments),
    poll: normalizePoll(message.poll)
  }, null, 2);
}

function xmlEscape(value) {
  return (value || "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function serializeMessageAsXml(message) {
  const reactionsXml = normalizeReactions(message.reactions)
    .map((reaction) => `    <reaction emoji="${xmlEscape(reaction.emoji)}" count="${reaction.userIds.length}" />`)
    .join("\n");
  const attachmentsXml = normalizeAttachments(message.attachments)
    .map((attachment) => `    <attachment type="${xmlEscape(attachment.type)}" format="${xmlEscape(attachment.format || "image")}" name="${xmlEscape(attachment.name || "")}" url="${xmlEscape(attachment.url)}" />`)
    .join("\n");
  const poll = normalizePoll(message.poll);
  const pollXml = poll
    ? `  <poll question="${xmlEscape(poll.question)}" closed="${poll.closed ? "true" : "false"}" allowsMulti="${poll.allowsMulti ? "true" : "false"}">\n${poll.options.map((option) => `    <option id="${xmlEscape(option.id)}" votes="${option.voterIds.length}">${xmlEscape(option.label)}</option>`).join("\n")}\n  </poll>`
    : "  <poll />";
  return [
    `<message id="${xmlEscape(message.id)}" ts="${xmlEscape(message.ts)}"${message.editedAt ? ` editedAt="${xmlEscape(message.editedAt)}"` : ""}${message.editedByStaff ? " editedByStaff=\"true\"" : ""}>`,
    `  <author userId="${xmlEscape(message.userId || "")}">${xmlEscape(displayNameForMessage(message))}</author>`,
    `  <text>${xmlEscape(message.text || "")}</text>`,
    `  <pinned>${message.pinned ? "true" : "false"}</pinned>`,
    reactionsXml ? `  <reactions>\n${reactionsXml}\n  </reactions>` : "  <reactions />",
    attachmentsXml ? `  <attachments>\n${attachmentsXml}\n  </attachments>` : "  <attachments />",
    pollXml,
    `</message>`
  ].join("\n");
}


function setComposerTypingNoteText(text = "") {
  if (!ui.composerTypingNote) return;
  const value = (text || "").toString();
  ui.composerTypingNote.textContent = value;
  ui.composerTypingNote.hidden = !value;
}

function renderComposerMeta() {
  if (composerMetaRefreshTimer) {
    clearTimeout(composerMetaRefreshTimer);
    composerMetaRefreshTimer = null;
  }
  const conversation = getActiveConversation();
  applyComposerInputLimit();
  const limit = composerLimitForConversation(conversation);
  const baseLimit = hardLimitForConversation(conversation);
  const rawValue = clampMessageTextForStorage(ui.messageInput.value || "");
  if (rawValue !== (ui.messageInput.value || "")) {
    ui.messageInput.value = rawValue;
  }
  const used = rawValue.length;
  if (ui.composerCharCount) {
    ui.composerCharCount.textContent = `${used}/${limit}`;
    ui.composerCharCount.classList.toggle("is-near-limit", used >= Math.floor(limit * 0.8));
    ui.composerCharCount.classList.toggle("is-at-limit", used >= limit - 1);
    const activeTemp = conversation?.id && composerTempLimitConversationId === conversation.id && composerTempLimitExtra > 0;
    if (activeTemp) {
      ui.composerCharCount.title = `Temporary +${composerTempLimitExtra} chars. Click to add more, double-click to set default limit.`;
    } else {
      ui.composerCharCount.title = `Click to temporarily add ${MESSAGE_CHAR_LIMIT_TEMP_BUMP} chars. Double-click to set default limit (current ${baseLimit}).`;
    }
  }

  const submitBtn = ui.messageForm?.querySelector?.("button[type=\"submit\"]");
  if (!(submitBtn instanceof HTMLButtonElement)) return;
  const account = getCurrentAccount();
  const room = relayRoomForActiveConversation();
  const typingSummary = formatTypingSummary(typingNamesForRoom(room));
  if (!conversation || !account) {
    submitBtn.disabled = true;
    setComposerTypingNoteText("");
    if (ui.composerSystemNotice) ui.composerSystemNotice.hidden = true;
    return;
  }

  if (conversation.type === "dm") {
    const deliverySummary = formatDmDeliverySummaryForComposer(conversation.thread, account.id);
    const dmMetaLine = [typingSummary, deliverySummary].filter(Boolean).join(" · ");
    setComposerTypingNoteText(dmMetaLine);
    const headerMeta = dmHeaderStatusMeta(conversation.thread, account.id, { typingSummary });
    setActiveChannelTopic(headerMeta.text || "Direct Message");
    if (headerMeta.needsRefresh) {
      composerMetaRefreshTimer = setTimeout(() => {
        composerMetaRefreshTimer = null;
        renderComposerMeta();
      }, 30_000);
    }
    submitBtn.disabled = false;
    if (ui.composerSystemNotice) ui.composerSystemNotice.hidden = true;
    return;
  }
  setComposerTypingNoteText(typingSummary);

  const channel = conversation.channel;
  const canPost = canCurrentUserPostInChannel(channel, account);
  const remainingMs = getChannelSlowmodeRemainingMs(channel, account.id);
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  if (ui.composerSystemNotice) {
    let notice = "";
    if (channel.type === "voice") {
      notice = "Voice channels use live call controls. Join voice to participate.";
    } else if (channel.type === "stage") {
      notice = "Stage channels are listen-first. Join stage and request speaking access.";
    } else if (!canPost) {
      notice = "You do not have permission to send messages in this channel.";
    } else if (remainingSeconds > 0) {
      notice = `Slowmode active. Wait ${remainingSeconds}s before sending again.`;
    } else {
      const slow = getChannelSlowmodeSeconds(channel);
      if (slow > 0) notice = `${formatSlowmodeLabel(slow)} is enabled.`;
    }
    ui.composerSystemNotice.textContent = notice;
    ui.composerSystemNotice.hidden = !notice;
  }

  const hasPayload = rawValue.trim().length > 0 || composerPendingAttachments.length > 0;
  submitBtn.disabled = channel.type === "voice" || channel.type === "stage" || !canPost || remainingSeconds > 0 || !hasPayload;
  if (remainingSeconds > 0) {
    composerMetaRefreshTimer = setTimeout(() => {
      composerMetaRefreshTimer = null;
      renderComposerMeta();
    }, 400);
  }
}

function setComposerCollapsedState(collapsed = false) {
  const isCollapsed = Boolean(collapsed);
  if (ui.composerStack instanceof HTMLElement) {
    ui.composerStack.classList.toggle("composer-stack--collapsed", isCollapsed);
  }
  if (!(ui.messageInput instanceof HTMLTextAreaElement)) return;
  if (isCollapsed) {
    closeMediaPicker();
    clearReplyComposer();
    ui.messageInput.readOnly = true;
    ui.messageInput.placeholder = "Select a chat. Press / for commands.";
    if (ui.composerSystemNotice) {
      ui.composerSystemNotice.textContent = "Composer collapsed until a chat is selected.";
      ui.composerSystemNotice.hidden = false;
    }
    setComposerTypingNoteText("");
    return;
  }
  ui.messageInput.readOnly = false;
  if (ui.composerSystemNotice && ui.composerSystemNotice.textContent === "Composer collapsed until a chat is selected.") {
    ui.composerSystemNotice.hidden = true;
  }
}

function bumpComposerTemporaryLimit() {
  const conversation = getActiveConversation();
  if (!conversation?.id) return;
  if (composerTempLimitConversationId !== conversation.id) {
    composerTempLimitConversationId = conversation.id;
    composerTempLimitExtra = 0;
  }
  composerTempLimitExtra = Math.max(
    MESSAGE_CHAR_LIMIT_TEMP_BUMP,
    Math.min(MESSAGE_CHAR_LIMIT_MAX, composerTempLimitExtra + MESSAGE_CHAR_LIMIT_TEMP_BUMP)
  );
  applyComposerInputLimit();
  renderComposerMeta();
  showToast(`Temporary message limit raised to ${composerLimitForConversation(conversation)} chars.`);
}

async function configureDefaultComposerLimit() {
  const prefs = getPreferences();
  const typed = await showInAppPromptDialog({
    title: "Default message limit",
    message: `Set default message limit (${MESSAGE_CHAR_LIMIT_MIN}-${MESSAGE_CHAR_LIMIT_MAX})`,
    defaultValue: String(prefs.messageCharLimit || MESSAGE_CHAR_LIMIT_DEFAULT)
  });
  if (typed === null) return;
  const parsed = Number(typed.trim());
  if (!Number.isFinite(parsed)) {
    showToast("Enter a valid number.", { tone: "error" });
    return;
  }
  const nextLimit = normalizeMessageCharLimit(parsed);
  state.preferences = getPreferences();
  state.preferences.messageCharLimit = nextLimit;
  composerTempLimitConversationId = null;
  composerTempLimitExtra = 0;
  applyComposerInputLimit();
  saveState();
  renderComposerMeta();
  showToast(`Default message limit set to ${nextLimit}.`);
}

function renderReplyComposer() {
  if (!replyTarget) {
    ui.composerReplyBar.classList.add("composer-reply--hidden");
    ui.replyPreviewText.textContent = "";
    return;
  }
  const previewText = replyTarget.text.trim().slice(0, 100);
  const threadHint = replyTarget.threadId ? " in thread" : "";
  ui.replyPreviewText.textContent = `Replying to ${replyTarget.authorName}${threadHint}: ${previewText || "(empty message)"}`;
  ui.composerReplyBar.classList.remove("composer-reply--hidden");
}

function renderRoleChips(container, accountId) {
  const server = getActiveServer();
  container.innerHTML = "";
  if (!server || !accountId) return;
  const roles = getMemberRoles(server, accountId).filter((role) => role.name !== "@everyone");
  roles.forEach((role) => {
    const chip = document.createElement("span");
    chip.className = "role-chip";
    chip.textContent = role.name;
    chip.style.borderColor = role.color || "#4b4f59";
    chip.style.color = role.color || "#e3e6eb";
    container.appendChild(chip);
  });
}

function collectAccountActivityStats(accountId) {
  const stats = {
    sentMessages: 0,
    reactionsGiven: 0,
    pollsCreated: 0
  };
  if (!accountId) return stats;
  state.guilds.forEach((guild) => {
    (guild.channels || []).forEach((channel) => {
      (channel.messages || []).forEach((message) => {
        if (message.userId === accountId) {
          stats.sentMessages += 1;
          if (message.poll) stats.pollsCreated += 1;
        }
        normalizeReactions(message.reactions).forEach((reaction) => {
          if (reaction.userIds.includes(accountId)) stats.reactionsGiven += 1;
        });
      });
    });
  });
  state.dmThreads.forEach((thread) => {
    (thread.messages || []).forEach((message) => {
      if (message.userId === accountId) {
        stats.sentMessages += 1;
        if (message.poll) stats.pollsCreated += 1;
      }
      normalizeReactions(message.reactions).forEach((reaction) => {
        if (reaction.userIds.includes(accountId)) stats.reactionsGiven += 1;
      });
    });
  });
  return stats;
}

function resolveQuestBadgesForAccount(accountId) {
  const stats = collectAccountActivityStats(accountId);
  const badges = [];
  if (stats.sentMessages >= 1) badges.push("First Message");
  if (stats.sentMessages >= 25) badges.push("Regular");
  if (stats.sentMessages >= 100) badges.push("Power Chatter");
  if (stats.reactionsGiven >= 10) badges.push("Reactor");
  if (stats.pollsCreated >= 1) badges.push("Poll Starter");
  return badges.slice(0, 4);
}

function questMilestoneProgress(accountId) {
  const stats = collectAccountActivityStats(accountId);
  const nextMessageGoal = [1, 25, 100, 250].find((value) => stats.sentMessages < value) || null;
  const nextReactionGoal = [10, 50, 200].find((value) => stats.reactionsGiven < value) || null;
  const nextPollGoal = [1, 5, 20].find((value) => stats.pollsCreated < value) || null;
  return {
    stats,
    badges: resolveQuestBadgesForAccount(accountId),
    nextGoals: {
      messages: nextMessageGoal,
      reactions: nextReactionGoal,
      polls: nextPollGoal
    }
  };
}

function formatQuestSummaryText(accountId) {
  const progress = questMilestoneProgress(accountId);
  const { stats, badges, nextGoals } = progress;
  const nextParts = [];
  if (nextGoals.messages) nextParts.push(`next messages: ${stats.sentMessages}/${nextGoals.messages}`);
  if (nextGoals.reactions) nextParts.push(`next reactions: ${stats.reactionsGiven}/${nextGoals.reactions}`);
  if (nextGoals.polls) nextParts.push(`next polls: ${stats.pollsCreated}/${nextGoals.polls}`);
  return [
    `Badges: ${badges.length > 0 ? badges.join(", ") : "none yet"}`,
    `Messages: ${stats.sentMessages}`,
    `Reactions: ${stats.reactionsGiven}`,
    `Polls: ${stats.pollsCreated}`,
    nextParts.length > 0 ? `Progress: ${nextParts.join(" · ")}` : "Progress: all tracked milestones reached"
  ].join(" · ");
}

function formatIdentitySummaryText(account, guildId = null) {
  if (!account) return "Unknown identity.";
  const name = displayNameForAccount(account, guildId);
  const status = displayStatus(account, guildId);
  const tag = accountGuildTag(account) || "(none)";
  const decor = accountDecorationEmoji(account) || "(none)";
  const effect = accountProfileEffect(account);
  const hasNameplate = accountNameplateSvg(account) ? "yes" : "no";
  return `Name: ${name} · Status: ${status} · Tag: ${tag} · Decor: ${decor} · Effect: ${effect} · Nameplate: ${hasNameplate}`;
}

function resolveShardWallet(accountId) {
  const stats = collectAccountActivityStats(accountId);
  const badges = resolveQuestBadgesForAccount(accountId).length;
  const earned = SHARD_ECONOMY.starter
    + Math.floor(stats.sentMessages / SHARD_ECONOMY.messageEvery)
    + Math.floor(stats.reactionsGiven / SHARD_ECONOMY.reactionEvery)
    + (stats.pollsCreated * SHARD_ECONOMY.pollWorth)
    + (badges * SHARD_ECONOMY.badgeWorth);
  const account = getAccountById(accountId);
  ensureAccountCosmetics(account);
  const spent = (account?.cosmeticPurchases || []).reduce((acc, entry) => acc + Math.max(0, Number(entry.cost || 0)), 0);
  return {
    earned,
    spent,
    balance: Math.max(0, earned - spent),
    stats
  };
}

function accountOwnsCosmetic(account, cosmetic) {
  if (!account || !cosmetic) return false;
  ensureAccountCosmetics(account);
  return account.ownedCosmetics[cosmetic.type]?.includes(cosmetic.id) || false;
}

function isCosmeticEquipped(account, cosmetic) {
  if (!account || !cosmetic) return false;
  if (cosmetic.type === "decor") return accountDecorationEmoji(account) === cosmetic.value;
  if (cosmetic.type === "nameplate") return accountNameplateSvg(account) === cosmetic.value;
  if (cosmetic.type === "effect") return accountProfileEffect(account) === cosmetic.value;
  return false;
}

function equipCosmetic(account, cosmetic) {
  if (!account || !cosmetic || !accountOwnsCosmetic(account, cosmetic)) return false;
  if (cosmetic.type === "decor") account.avatarDecoration = cosmetic.value;
  if (cosmetic.type === "nameplate") account.profileNameplateSvg = cosmetic.value;
  if (cosmetic.type === "effect") account.profileEffect = normalizeProfileEffect(cosmetic.value);
  return true;
}

function buyCosmetic(account, cosmetic) {
  if (!account || !cosmetic || cosmetic.cost <= 0) return { ok: false, reason: "Invalid cosmetic." };
  ensureAccountCosmetics(account);
  if (accountOwnsCosmetic(account, cosmetic)) return { ok: false, reason: "You already own this cosmetic." };
  const wallet = resolveShardWallet(account.id);
  if (wallet.balance < cosmetic.cost) return { ok: false, reason: "Not enough shards yet." };
  account.ownedCosmetics[cosmetic.type].push(cosmetic.id);
  account.cosmeticPurchases.push({
    id: cosmetic.id,
    cost: cosmetic.cost,
    ts: new Date().toISOString()
  });
  account.cosmeticPurchases = normalizeCosmeticPurchases(account.cosmeticPurchases);
  equipCosmetic(account, cosmetic);
  return { ok: true };
}

function resolveBundlePricingForAccount(bundle, account) {
  const items = Array.isArray(bundle?.itemIds)
    ? bundle.itemIds.map((id) => cosmeticById(id)).filter(Boolean)
    : [];
  const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
  const missingItems = items.filter((item) => !accountOwnsCosmetic(account, item));
  const missingCost = missingItems.reduce((sum, item) => sum + item.cost, 0);
  let discount = 0;
  if (missingCost > 0 && totalCost > 0) {
    const baseDiscount = Math.max(0, Number(bundle?.discount || 0));
    discount = Math.round(baseDiscount * (missingCost / totalCost));
    if (baseDiscount > 0) discount = Math.max(1, discount);
    discount = Math.min(discount, Math.max(0, missingCost - 1));
  }
  return {
    items,
    missingItems,
    totalCost,
    missingCost,
    discount,
    finalCost: missingCost > 0 ? Math.max(1, missingCost - discount) : 0
  };
}

function buyCosmeticBundle(account, bundle) {
  if (!account || !bundle) return { ok: false, reason: "Invalid bundle." };
  ensureAccountCosmetics(account);
  const pricing = resolveBundlePricingForAccount(bundle, account);
  if (pricing.items.length === 0) return { ok: false, reason: "Bundle has no valid cosmetics." };
  if (pricing.missingItems.length === 0) return { ok: false, reason: "You already own this bundle." };
  const wallet = resolveShardWallet(account.id);
  if (wallet.balance < pricing.finalCost) return { ok: false, reason: "Not enough shards yet." };
  pricing.missingItems.forEach((item) => {
    if (!account.ownedCosmetics[item.type].includes(item.id)) {
      account.ownedCosmetics[item.type].push(item.id);
    }
    equipCosmetic(account, item);
  });
  account.cosmeticPurchases.push({
    id: bundle.id,
    cost: pricing.finalCost,
    ts: new Date().toISOString()
  });
  account.cosmeticPurchases = normalizeCosmeticPurchases(account.cosmeticPurchases);
  return {
    ok: true,
    purchasedCount: pricing.missingItems.length,
    purchasedNames: pricing.missingItems.map((item) => item.name),
    finalCost: pricing.finalCost,
    discount: pricing.discount
  };
}

function formatCosmeticsCountdown(remainingMs) {
  const safeMs = Math.max(0, Math.floor(remainingMs));
  const totalMinutes = Math.floor(safeMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function clearCosmeticsFeaturedRefreshTimer() {
  if (!cosmeticsFeaturedRefreshTimer) return;
  clearTimeout(cosmeticsFeaturedRefreshTimer);
  cosmeticsFeaturedRefreshTimer = null;
}

function scheduleCosmeticsFeaturedRefresh(endsAtMs) {
  clearCosmeticsFeaturedRefreshTimer();
  if (!ui.cosmeticsDialog?.open) return;
  const now = Date.now();
  const remaining = Math.max(0, Math.floor(endsAtMs - now));
  const nextTick = Math.min(60_000, Math.max(1_000, remaining + 250));
  cosmeticsFeaturedRefreshTimer = setTimeout(() => {
    cosmeticsFeaturedRefreshTimer = null;
    renderCosmeticsDialog();
  }, nextTick);
}

function renderFeaturedCosmetics(account, wallet) {
  if (!ui.cosmeticsFeatured || !ui.cosmeticsFeaturedGrid || !ui.cosmeticsFeaturedLabel || !ui.cosmeticsFeaturedCountdown) return;
  const featured = resolveFeaturedCosmeticBundles();
  if (featured.bundles.length === 0) {
    ui.cosmeticsFeatured.hidden = true;
    clearCosmeticsFeaturedRefreshTimer();
    return;
  }
  ui.cosmeticsFeatured.hidden = false;
  ui.cosmeticsFeaturedLabel.textContent = `${featured.season.label} Featured`;
  ui.cosmeticsFeaturedCountdown.textContent = `Rotates in ${formatCosmeticsCountdown(featured.endsAtMs - Date.now())}`;
  ui.cosmeticsFeaturedGrid.innerHTML = "";
  featured.bundles.forEach((bundle) => {
    const card = document.createElement("article");
    card.className = "cosmetic-featured-card";
    const pricing = resolveBundlePricingForAccount(bundle, account);
    const canAfford = wallet.balance >= pricing.finalCost;

    const top = document.createElement("div");
    top.className = "cosmetic-featured-card__head";
    const title = document.createElement("strong");
    title.textContent = bundle.name;
    const price = document.createElement("small");
    if (pricing.missingItems.length === 0) {
      price.textContent = "Owned";
    } else if (pricing.discount > 0) {
      price.textContent = `${pricing.finalCost} shards (${pricing.missingCost} base, -${pricing.discount})`;
    } else {
      price.textContent = `${pricing.finalCost} shards`;
    }
    top.appendChild(title);
    top.appendChild(price);
    card.appendChild(top);

    const note = document.createElement("p");
    note.className = "cosmetic-featured-card__note";
    note.textContent = bundle.note;
    card.appendChild(note);

    const included = document.createElement("small");
    included.className = "cosmetic-featured-card__includes";
    included.textContent = pricing.items.map((item) => item.name).join(" · ");
    card.appendChild(included);

    const action = document.createElement("button");
    action.type = "button";
    action.className = "cosmetic-card__action";
    if (pricing.missingItems.length === 0) {
      action.textContent = "Owned";
      action.disabled = true;
      action.classList.add("is-owned");
    } else {
      action.textContent = canAfford ? "Buy Bundle" : "Locked";
      action.disabled = !canAfford;
      action.addEventListener("click", () => {
        const result = buyCosmeticBundle(account, bundle);
        if (!result.ok) {
          showToast(result.reason, { tone: "error" });
          return;
        }
        saveState();
        render();
        renderCosmeticsDialog();
        showToast(`Purchased ${bundle.name} (${result.purchasedCount} items).`);
      });
    }
    card.appendChild(action);
    ui.cosmeticsFeaturedGrid.appendChild(card);
  });
  scheduleCosmeticsFeaturedRefresh(featured.endsAtMs);
}

function formatCosmeticInventorySummary(accountId) {
  const account = getAccountById(accountId);
  if (!account) return "No active account.";
  ensureAccountCosmetics(account);
  const wallet = resolveShardWallet(accountId);
  const listFor = (type) => {
    const owned = account.ownedCosmetics[type]
      .map((id) => cosmeticById(id))
      .filter(Boolean)
      .map((item) => item.name);
    return owned.length > 0 ? owned.join(", ") : "none";
  };
  return `Shards: ${wallet.balance} (earned ${wallet.earned}, spent ${wallet.spent}) · Decorations: ${listFor("decor")} · Nameplates: ${listFor("nameplate")} · Effects: ${listFor("effect")}`;
}

function normalizeCosmeticsTab(rawTab) {
  return normalizeCosmeticsTabViaModule(rawTab);
}

function renderCosmeticsDialog() {
  const account = getCurrentAccount();
  if (!account || !ui.cosmeticsDialog?.open) {
    clearCosmeticsFeaturedRefreshTimer();
    return;
  }
  clearCosmeticsFeaturedRefreshTimer();
  ensureAccountCosmetics(account);
  const wallet = resolveShardWallet(account.id);
  if (ui.cosmeticsBalance) ui.cosmeticsBalance.textContent = `${wallet.balance} shards`;
  if (ui.cosmeticsProgress) {
    ui.cosmeticsProgress.textContent = `Earned ${wallet.earned} · Spent ${wallet.spent} · Messages ${wallet.stats.sentMessages} · Reactions ${wallet.stats.reactionsGiven} · Polls ${wallet.stats.pollsCreated}`;
  }
  renderFeaturedCosmetics(account, wallet);
  ui.cosmeticsTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.cosmeticsTab === cosmeticsTab);
  });
  if (!ui.cosmeticsGrid) return;
  ui.cosmeticsGrid.innerHTML = "";
  const items = COSMETIC_CATALOG.filter((item) => item.type === cosmeticsTab);
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "cosmetic-card";
    const owned = accountOwnsCosmetic(account, item);
    const equipped = isCosmeticEquipped(account, item);
    const canAfford = wallet.balance >= item.cost;

    const preview = document.createElement("div");
    preview.className = "cosmetic-card__preview";
    if (item.type === "decor") {
      preview.classList.add("cosmetic-card__preview--decor");
      preview.textContent = item.value;
    } else if (item.type === "nameplate") {
      preview.classList.add("cosmetic-card__preview--nameplate");
      preview.style.backgroundImage = `url(${item.value})`;
    } else {
      preview.classList.add("cosmetic-card__preview--effect");
      if (item.value === "flame") preview.classList.add("cosmetic-card__preview--effect-flame");
      if (item.value === "ocean") preview.classList.add("cosmetic-card__preview--effect-ocean");
    }
    card.appendChild(preview);

    const meta = document.createElement("div");
    meta.className = "cosmetic-card__meta";
    const name = document.createElement("strong");
    name.textContent = item.name;
    const info = document.createElement("small");
    info.textContent = `${item.cost} shards · ${item.note}`;
    meta.appendChild(name);
    meta.appendChild(info);
    card.appendChild(meta);

    const action = document.createElement("button");
    action.type = "button";
    action.className = "cosmetic-card__action";
    if (equipped) {
      action.textContent = "Equipped";
      action.disabled = true;
      action.classList.add("is-owned");
    } else if (owned) {
      action.textContent = "Equip";
      action.classList.add("is-owned");
      action.addEventListener("click", () => {
        if (!equipCosmetic(account, item)) return;
        saveState();
        render();
        renderCosmeticsDialog();
      });
    } else {
      action.textContent = canAfford ? "Buy" : "Locked";
      action.disabled = !canAfford;
      action.addEventListener("click", () => {
        const result = buyCosmetic(account, item);
        if (!result.ok) {
          showToast(result.reason, { tone: "error" });
          return;
        }
        saveState();
        render();
        renderCosmeticsDialog();
        showToast(`Purchased ${item.name}.`);
      });
    }
    card.appendChild(action);
    ui.cosmeticsGrid.appendChild(card);
  });
}

function openCosmeticsDialog(tab = "decor") {
  if (!ui.cosmeticsDialog) return;
  cosmeticsTab = normalizeCosmeticsTab(tab);
  if (!ui.cosmeticsDialog.open) ui.cosmeticsDialog.showModal();
  renderCosmeticsDialog();
}

function renderQuestBadges(container, accountId) {
  if (!(container instanceof HTMLElement) || !accountId) return;
  const badges = resolveQuestBadgesForAccount(accountId);
  if (badges.length === 0) return;
  const wrap = document.createElement("div");
  wrap.className = "quest-badges";
  badges.forEach((label) => {
    const chip = document.createElement("span");
    chip.className = "quest-badge";
    chip.textContent = label;
    wrap.appendChild(chip);
  });
  container.appendChild(wrap);
}

function mediaAudioSuppressedByPreferences(prefs = getPreferences()) {
  if (!prefs || typeof prefs !== "object") return false;
  return prefs.mute === "on" || prefs.deafen === "on";
}

function applyMediaElementAudioPreferences(media, prefs = getPreferences()) {
  if (!(media instanceof HTMLMediaElement)) return;
  const suppressed = mediaAudioSuppressedByPreferences(prefs);
  const forceMuted = media instanceof HTMLVideoElement && media.dataset.forceMuted === "1";
  if (suppressed) {
    if (media.dataset.prefSuppressed !== "1") {
      media.dataset.prefPrevMuted = media.muted ? "1" : "0";
    }
    media.dataset.prefSuppressed = "1";
    media.muted = true;
    return;
  }
  if (media.dataset.prefSuppressed === "1") {
    const prevMuted = media.dataset.prefPrevMuted === "1";
    delete media.dataset.prefSuppressed;
    delete media.dataset.prefPrevMuted;
    media.muted = forceMuted ? true : prevMuted;
    return;
  }
  if (forceMuted) media.muted = true;
}

function applyMediaAudioPreferences(prefs = getPreferences()) {
  document.querySelectorAll("video, audio").forEach((node) => {
    if (node instanceof HTMLMediaElement) applyMediaElementAudioPreferences(node, prefs);
  });
  videoPipRuntimes.forEach((runtime) => {
    if (runtime?.video instanceof HTMLVideoElement) applyMediaElementAudioPreferences(runtime.video, prefs);
    if (runtime?.syncControls instanceof Function) runtime.syncControls();
  });
}

function isMobileNarrowLayout() {
  if (typeof document === "undefined" || !document.body) return false;
  if (document.body.dataset.mobile !== "on") return false;
  return mobileLayoutMediaQuery ? mobileLayoutMediaQuery.matches : window.innerWidth <= MOBILE_SIDEBAR_BREAKPOINT_PX;
}

function setMobilePane(pane, { persist = true, rerender = true } = {}) {
  const normalized = normalizeMobilePane(pane);
  state.preferences = getPreferences();
  if (state.preferences.mobilePane === normalized) return false;
  state.preferences.mobilePane = normalized;
  if (persist) saveState();
  if (rerender) {
    applyPreferencesToUI();
    renderChannels();
    renderMemberList();
  }
  return true;
}

function applyPreferencesToUI() {
  const prefs = getPreferences();
  const locale = resolveUiLocale(prefs);
  const narrowMobile = isMobileNarrowLayout();
  document.documentElement.lang = locale;
  document.body.style.setProperty("--ui-scale", `${prefs.uiScale}%`);
  document.body.dataset.locale = locale;
  document.body.dataset.theme = prefs.theme;
  document.body.dataset.compactMembers = prefs.compactMembers;
  document.body.dataset.developerMode = prefs.developerMode;
  document.body.dataset.debugOverlay = prefs.debugOverlay;
  document.body.dataset.hideChannelPanel = prefs.hideChannelPanel;
  document.body.dataset.hideMemberPanel = prefs.hideMemberPanel;
  document.body.dataset.mobilePane = narrowMobile ? prefs.mobilePane : "chat";
  document.body.dataset.collapseDmSection = prefs.collapseDmSection;
  document.body.dataset.collapseGuildSection = prefs.collapseGuildSection;
  ui.dockMuteBtn.style.opacity = prefs.mute === "on" ? "1" : "0.7";
  ui.dockHeadphonesBtn.style.opacity = prefs.deafen === "on" ? "1" : "0.7";
  if (ui.toggleChannelPanelBtn) {
    if (narrowMobile) {
      const navVisible = prefs.mobilePane === "nav";
      ui.toggleChannelPanelBtn.classList.toggle("chat-topic-edit--active", navVisible);
      setHeaderActionButtonLabel(ui.toggleChannelPanelBtn, navVisible ? "Chat" : "Channels");
    } else {
      const hidden = prefs.hideChannelPanel === "on";
      ui.toggleChannelPanelBtn.classList.toggle("chat-topic-edit--active", !hidden);
      setHeaderActionButtonLabel(ui.toggleChannelPanelBtn, hidden ? "Channels Off" : "Channels");
    }
  }
  if (ui.toggleMemberPanelBtn) {
    if (narrowMobile) {
      const membersVisible = prefs.mobilePane === "members";
      ui.toggleMemberPanelBtn.classList.toggle("chat-topic-edit--active", membersVisible);
      setHeaderActionButtonLabel(ui.toggleMemberPanelBtn, membersVisible ? "Chat" : "Members");
    } else {
      const hidden = prefs.hideMemberPanel === "on";
      ui.toggleMemberPanelBtn.classList.toggle("chat-topic-edit--active", !hidden);
      setHeaderActionButtonLabel(ui.toggleMemberPanelBtn, hidden ? "Members Off" : "Members");
    }
  }
  if (ui.toggleDmSectionBtn) {
    const collapsed = prefs.collapseDmSection === "on";
    ui.toggleDmSectionBtn.title = collapsed ? "Expand Direct Messages" : "Collapse Direct Messages";
    ui.toggleDmSectionBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
  }
  if (ui.toggleGuildSectionBtn) {
    const collapsed = prefs.collapseGuildSection === "on";
    ui.toggleGuildSectionBtn.title = collapsed ? "Expand Channels" : "Collapse Channels";
    ui.toggleGuildSectionBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
  }
  if (ui.toggleDmSectionChevron) ui.toggleDmSectionChevron.textContent = prefs.collapseDmSection === "on" ? "▸" : "▾";
  if (ui.toggleGuildSectionChevron) ui.toggleGuildSectionChevron.textContent = prefs.collapseGuildSection === "on" ? "▸" : "▾";
  if (ui.toggleSwfAudioBtn) {
    const mode = prefs.swfQuickAudioMode;
    const icon = mode === "on" ? "🔊" : mode === "click" ? "🔉" : "🔇";
    const title = mode === "on"
      ? "SWF audio auto on. Click: switch to click-to-hear. Right-click: force mute."
      : mode === "click"
        ? "SWF click-to-hear mode. Click a SWF to hear it. Click: switch to auto on. Right-click: force mute."
        : "SWF forced mute. Click: switch to click-to-hear.";
    ui.toggleSwfAudioBtn.textContent = icon;
    ui.toggleSwfAudioBtn.title = title;
    ui.toggleSwfAudioBtn.setAttribute("aria-label", title);
    ui.toggleSwfAudioBtn.classList.toggle("message-form__media-btn--active", mode === "on");
    ui.toggleSwfAudioBtn.classList.toggle("message-form__media-btn--force-muted", mode === "off");
  }
  if (ui.toggleMediaPrivacyBtn) {
    const enabled = prefs.mediaPrivacyMode !== "off";
    const title = enabled
      ? "Media privacy gate ON. Click to disable."
      : "Media privacy gate OFF. Click to enable.";
    ui.toggleMediaPrivacyBtn.textContent = enabled ? "🛡" : "🌐";
    ui.toggleMediaPrivacyBtn.title = title;
    ui.toggleMediaPrivacyBtn.setAttribute("aria-label", title);
    ui.toggleMediaPrivacyBtn.classList.toggle("message-form__media-btn--active", enabled);
    ui.toggleMediaPrivacyBtn.classList.toggle("message-form__media-btn--force-muted", !enabled);
  }
  swfRuntimes.forEach((runtime) => {
    runtime.audioEnabled = prefs.swfQuickAudioMode !== "off";
    if (prefs.swfQuickAudioMode === "on") runtime.audioClickAllowed = true;
  });
  applySwfAudioToAllRuntimes();
  applyMediaAudioPreferences(prefs);
  refreshHeaderActionButtonLabels();
  resizeComposerInput();
}

function toggleChannelPanelVisibility() {
  if (isMobileNarrowLayout()) {
    const prefs = getPreferences();
    setMobilePane(prefs.mobilePane === "nav" ? "chat" : "nav");
    return;
  }
  state.preferences = getPreferences();
  state.preferences.hideChannelPanel = state.preferences.hideChannelPanel === "on" ? "off" : "on";
  saveState();
  applyPreferencesToUI();
}

function toggleMemberPanelVisibility() {
  if (isMobileNarrowLayout()) {
    const prefs = getPreferences();
    setMobilePane(prefs.mobilePane === "members" ? "chat" : "members");
    return;
  }
  state.preferences = getPreferences();
  state.preferences.hideMemberPanel = state.preferences.hideMemberPanel === "on" ? "off" : "on";
  saveState();
  applyPreferencesToUI();
}

function toggleDmSectionCollapsed() {
  state.preferences = getPreferences();
  state.preferences.collapseDmSection = state.preferences.collapseDmSection === "on" ? "off" : "on";
  saveState();
  applyPreferencesToUI();
  renderChannels();
}

function toggleGuildSectionCollapsed() {
  state.preferences = getPreferences();
  state.preferences.collapseGuildSection = state.preferences.collapseGuildSection === "on" ? "off" : "on";
  saveState();
  applyPreferencesToUI();
  renderChannels();
}

function isSwipeNavigationBlockedTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest("input, textarea, select, button, a, [contenteditable='true']")) return true;
  if (target.closest(".swf-pip, .video-pip, .media-picker, dialog[open], .settings-screen--active")) return true;
  return false;
}

function onMobileNavTouchStart(event) {
  if (!isMobileNarrowLayout() || !state.currentAccountId) return;
  if (event.touches.length !== 1) return;
  if (isSwipeNavigationBlockedTarget(event.target)) return;
  const touch = event.touches[0];
  mobileSwipeNavState = {
    id: touch.identifier,
    startX: touch.clientX,
    startY: touch.clientY,
    lastX: touch.clientX,
    lastY: touch.clientY,
    startTs: Date.now(),
    axis: ""
  };
}

function onMobileNavTouchMove(event) {
  if (!mobileSwipeNavState) return;
  const touch = Array.from(event.touches).find((entry) => entry.identifier === mobileSwipeNavState.id);
  if (!touch) return;
  const dx = touch.clientX - mobileSwipeNavState.startX;
  const dy = touch.clientY - mobileSwipeNavState.startY;
  mobileSwipeNavState.lastX = touch.clientX;
  mobileSwipeNavState.lastY = touch.clientY;
  if (!mobileSwipeNavState.axis) {
    if (Math.abs(dx) < 14 && Math.abs(dy) < 14) return;
    mobileSwipeNavState.axis = Math.abs(dx) > Math.abs(dy) * 1.1 ? "x" : "y";
  }
  if (mobileSwipeNavState.axis === "x") event.preventDefault();
}

function onMobileNavTouchEnd(event) {
  if (!mobileSwipeNavState) return;
  const ended = Array.from(event.changedTouches).find((entry) => entry.identifier === mobileSwipeNavState.id);
  if (!ended) return;
  const swipe = mobileSwipeNavState;
  mobileSwipeNavState = null;
  if (!isMobileNarrowLayout() || !state.currentAccountId) return;
  if (swipe.axis && swipe.axis !== "x") return;
  const dx = ended.clientX - swipe.startX;
  const dy = ended.clientY - swipe.startY;
  const dt = Date.now() - swipe.startTs;
  if (dt > 900) return;
  if (Math.abs(dx) < 72) return;
  if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
  const currentPane = normalizeMobilePane(getPreferences().mobilePane);
  if (dx > 0) {
    if (currentPane === "members") {
      setMobilePane("chat");
      return;
    }
    setMobilePane("nav");
    return;
  }
  if (currentPane === "nav") {
    setMobilePane("chat");
    return;
  }
  setMobilePane("members");
}

function setSwfQuickAudioMode(mode) {
  state.preferences = getPreferences();
  state.preferences.swfQuickAudioMode = normalizeSwfQuickAudioMode(mode);
  state.preferences.swfAudio = state.preferences.swfQuickAudioMode === "off" ? "off" : "on";
  if (state.preferences.swfQuickAudioMode === "on") {
    swfRuntimes.forEach((runtime) => {
      runtime.audioClickAllowed = true;
      runtime.audioEnabled = true;
    });
  } else if (state.preferences.swfQuickAudioMode === "click") {
    swfRuntimes.forEach((runtime) => {
      runtime.audioEnabled = true;
    });
  } else {
    swfRuntimes.forEach((runtime) => {
      runtime.audioEnabled = false;
    });
  }
  saveState();
  applyPreferencesToUI();
}

function grantSwfAudioClickFocus(runtimeKey) {
  if (!runtimeKey) return;
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime) return;
  const prefs = getPreferences();
  if (prefs.swfQuickAudioMode !== "click") {
    refreshSwfAudioFocus(runtimeKey);
    return;
  }
  swfRuntimes.forEach((entry) => {
    entry.audioClickAllowed = false;
  });
  runtime.audioClickAllowed = true;
  refreshSwfAudioFocus(runtimeKey);
}

function refreshSwfAudioFocus(preferredKey = null) {
  const prefs = getPreferences();
  const mode = prefs.swfQuickAudioMode;
  const runtimeConnected = (runtime) => runtime?.host instanceof HTMLElement && runtime.host.isConnected;
  if (mode === "off") {
    swfAudioFocusRuntimeKey = null;
    swfRuntimes.forEach((runtime, key) => {
      if (!runtimeConnected(runtime)) {
        runtime.audioSuppressed = true;
        updateSwfAudioUi(key);
        return;
      }
      runtime.audioSuppressed = true;
      applySwfAudioToRuntime(key);
      updateSwfAudioUi(key);
    });
    return;
  }
  const canUse = (key, runtime) => {
    if (!key || !runtime?.playing || !runtime.audioEnabled || runtime.audioPinned) return false;
    if (!runtimeConnected(runtime)) return false;
    if (mode === "click" && !runtime.audioClickAllowed) return false;
    return true;
  };
  if (mode === "click") {
    let hasClickFocus = false;
    swfRuntimes.forEach((runtime) => {
      if (hasClickFocus) return;
      if (!runtimeConnected(runtime)) return;
      if (!runtime?.playing || !runtime.audioEnabled) return;
      if (!runtime.audioClickAllowed) return;
      hasClickFocus = true;
    });
    if (!hasClickFocus) {
      const fallback = pickCenteredRuntimeKey((key, runtime) => (
        Boolean(key)
        && runtimeConnected(runtime)
        && runtime?.playing
        && runtime.audioEnabled
      ), { preferredKey });
      if (fallback) {
        swfRuntimes.forEach((entry) => {
          entry.audioClickAllowed = false;
        });
        const focused = swfRuntimes.get(fallback);
        if (focused) focused.audioClickAllowed = true;
      }
    }
  }
  if (swfSoloRuntimeKey) {
    const soloRuntime = swfRuntimes.get(swfSoloRuntimeKey);
    const allowSolo = canUse(swfSoloRuntimeKey, soloRuntime);
    swfAudioFocusRuntimeKey = allowSolo ? swfSoloRuntimeKey : null;
    swfRuntimes.forEach((runtime, key) => {
      if (!runtimeConnected(runtime)) {
        runtime.audioSuppressed = true;
        updateSwfAudioUi(key);
        return;
      }
      runtime.audioSuppressed = Boolean(
        !runtime.audioPinned
        && allowSolo
        && key !== swfSoloRuntimeKey
        && runtime.playing
        && runtime.audioEnabled
      );
      applySwfAudioToRuntime(key);
      updateSwfAudioUi(key);
    });
    return;
  }
  if (prefs.swfAudioPolicy === "multi") {
    swfAudioFocusRuntimeKey = null;
    swfRuntimes.forEach((runtime, key) => {
      if (!runtimeConnected(runtime)) {
        runtime.audioSuppressed = true;
        updateSwfAudioUi(key);
        return;
      }
      runtime.audioSuppressed = mode === "click" ? !runtime.audioClickAllowed : false;
      applySwfAudioToRuntime(key);
      updateSwfAudioUi(key);
    });
    return;
  }
  if (prefs.swfAudioScope === "guild") {
    const focusByGuild = new Map();
    swfRuntimes.forEach((runtime) => {
      const guildKey = runtime?.guildId || "__ungrouped__";
      if (focusByGuild.has(guildKey)) return;
      const centered = pickCenteredRuntimeKey(canUse, {
        guildId: guildKey,
        preferredKey: preferredKey
      });
      if (centered) focusByGuild.set(guildKey, centered);
    });
    swfAudioFocusRuntimeKey = null;
    swfRuntimes.forEach((runtime, key) => {
      if (!runtimeConnected(runtime)) {
        runtime.audioSuppressed = true;
        updateSwfAudioUi(key);
        return;
      }
      const guildKey = runtime.guildId || "__ungrouped__";
      runtime.audioSuppressed = Boolean(
        !runtime.audioPinned
        && runtime.playing
        && runtime.audioEnabled
        && (mode !== "click" || runtime.audioClickAllowed)
        && focusByGuild.get(guildKey)
        && focusByGuild.get(guildKey) !== key
      );
      if (mode === "click" && !runtime.audioClickAllowed) runtime.audioSuppressed = true;
      applySwfAudioToRuntime(key);
      updateSwfAudioUi(key);
    });
    return;
  }
  const centeredGlobal = pickCenteredRuntimeKey(canUse, { preferredKey });
  swfAudioFocusRuntimeKey = centeredGlobal;
  swfRuntimes.forEach((runtime, key) => {
    if (!runtimeConnected(runtime)) {
      runtime.audioSuppressed = true;
      updateSwfAudioUi(key);
      return;
    }
    runtime.audioSuppressed = Boolean(
      !runtime.audioPinned
      && swfAudioFocusRuntimeKey
      && key !== swfAudioFocusRuntimeKey
      && runtime.playing
      && runtime.audioEnabled
    );
    if (mode === "click" && !runtime.audioClickAllowed) runtime.audioSuppressed = true;
    applySwfAudioToRuntime(key);
    updateSwfAudioUi(key);
  });
}

function displayNameForMessage(message) {
  if (message.userId) {
    const account = getAccountById(message.userId);
    if (account) {
      const conversation = getActiveConversation();
      const guildId = conversation?.type === "channel" ? getActiveGuild()?.id || null : null;
      return displayNameForAccount(account, guildId);
    }
  }
  return decodeHtmlEntities((message.authorName || "Unknown").toString());
}

function initialsForName(name) {
  const cleaned = (name || "").replace(/[^a-z0-9 ]/gi, " ").trim();
  if (!cleaned) return "?";
  const chunks = cleaned.split(/\s+/).filter(Boolean).slice(0, 2);
  return chunks.map((part) => part[0]?.toUpperCase() || "").join("") || cleaned.slice(0, 1).toUpperCase();
}

function firstAvatarInitial(name) {
  const cleaned = (name || "").toString().trim();
  if (!cleaned) return "?";
  const char = [...cleaned][0] || "?";
  return char.toUpperCase();
}

function escapeSvgText(value) {
  return (value || "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function avatarInitialSvgDataUrl(initial) {
  const safeInitial = escapeSvgText(firstAvatarInitial(initial) || "?");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50' y='56' text-anchor='middle' dominant-baseline='middle' font-family='Inter,Arial,sans-serif' font-size='56' font-weight='700' fill='white'>${safeInitial}</text></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function applyAvatarInitialGlyph(element, label) {
  if (!(element instanceof HTMLElement)) return;
  const initial = firstAvatarInitial(label || "?");
  element.textContent = "";
  element.dataset.initial = initial;
  element.setAttribute("aria-label", initial);
  element.style.backgroundImage = avatarInitialSvgDataUrl(initial);
  element.style.backgroundSize = "cover";
  element.style.backgroundPosition = "center";
}

const DEFAULT_AVATAR_COLOR_PALETTE = [
  "#5865f2",
  "#3ba55d",
  "#eb459e",
  "#faa81a",
  "#1abc9c",
  "#ed4245",
  "#57f287",
  "#5d6bf9",
  "#8e5cf6",
  "#2d8cff",
  "#4ecca3",
  "#f47b67"
];

function hashString32(value) {
  const source = (value || "").toString();
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

function isDefaultAvatarColor(color) {
  const token = (color || "").toString().trim().toLowerCase();
  return !token || token === "#57f287";
}

function fallbackAvatarColorForSeed(seed, currentColor = "") {
  const normalizedSeed = (seed || "").toString().trim().toLowerCase() || "avatar";
  if (!normalizedSeed) return currentColor || "#57f287";
  const hash = hashString32(normalizedSeed);
  return DEFAULT_AVATAR_COLOR_PALETTE[hash % DEFAULT_AVATAR_COLOR_PALETTE.length];
}

function fallbackAvatarColorForAccount(account, guildId = null, currentColor = "") {
  if (!account || typeof account !== "object") return currentColor || "#57f287";
  const fallbackSeed = [
    accountBareXmppJid(account),
    (account.username || "").toString(),
    (displayNameForAccount(account, guildId) || "").toString()
  ].find((entry) => (entry || "").toString().trim()) || "avatar";
  return fallbackAvatarColorForSeed(fallbackSeed, currentColor);
}

function shouldUseStrictInitialAvatar(account, guildId = null) {
  if (!account || typeof account !== "object") return false;
  const avatar = resolveAccountAvatar(account, guildId);
  if (isRenderableAvatarUrl(avatar.url || "")) return false;
  const bareJid = accountBareXmppJid(account);
  // For XMPP contacts, only use initials after we explicitly confirmed avatar absence.
  if (bareJid) return xmppAvatarMissingByJid.has(bareJid);
  // Local-only accounts without an avatar URL are considered explicitly avatar-less.
  return true;
}

function shouldGroupMessageWithPrevious(currentMessage, previousMessage) {
  if (!currentMessage || !previousMessage) return false;
  if (!currentMessage.userId || !previousMessage.userId) return false;
  if (currentMessage.userId !== previousMessage.userId) return false;
  if (currentMessage.replyTo || previousMessage.replyTo) return false;
  if (currentMessage.poll || previousMessage.poll) return false;
  const currentTs = toTimestampMs(currentMessage.ts);
  const previousTs = toTimestampMs(previousMessage.ts);
  if (!currentTs || !previousTs) return false;
  return (currentTs - previousTs) <= (10 * 60 * 1000);
}

async function loadSwfLibrary() {
  const manifestCandidates = [
    "/swf/index.json",
    "/swf/swf-index.json",
    "/swf-index.json",
    "./swf/index.json",
    "./swf/swf-index.json",
    "./swf-index.json",
    "swf/index.json",
    "swf/swf-index.json",
    "swf-index.json"
  ];
  try {
    let parsed = null;
    for (const manifestUrl of manifestCandidates) {
      // eslint-disable-next-line no-await-in-loop
      const response = await fetch(manifestUrl, { cache: "no-cache" }).catch(() => null);
      if (!response?.ok) continue;
      // eslint-disable-next-line no-await-in-loop
      const json = await response.json().catch(() => null);
      if (!Array.isArray(json)) continue;
      parsed = json;
      break;
    }
    if (!Array.isArray(parsed)) return;
    swfLibrary = parsed
      .filter((entry) => entry && typeof entry.url === "string" && typeof entry.name === "string")
      .map((entry) => ({ name: entry.name, url: entry.url }))
      .slice(0, 600);
    if (mediaPickerOpen && mediaPickerTab === "swf") {
      renderMediaPicker();
    }
  } catch {
    // SWF picker still works with fallback list only.
  }
}

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

function saveSwfToShelf(entry) {
  if (!entry?.url) return false;
  const exists = state.savedSwfs.find((item) => item.url === entry.url);
  if (exists) return false;
  state.savedSwfs.unshift({
    name: (entry.name || "swf").toString().slice(0, 120),
    url: entry.url
  });
  state.savedSwfs = normalizeSavedSwfs(state.savedSwfs);
  saveState();
  renderSwfShelf();
  return true;
}

async function downloadAttachmentFile(attachment, fallbackExt = "bin") {
  if (!attachment?.url) return false;
  const rawName = (attachment.name || `download.${fallbackExt}`).trim();
  const fileName = rawName.includes(".") ? rawName : `${rawName}.${fallbackExt}`;
  if (isAesgcmUrl(attachment.url)) {
    try {
      const blob = await downloadAndDecryptAesgcmUrl(attachment.url);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(objectUrl);
      return true;
    } catch (error) {
      addDebugLog("warn", "Encrypted attachment download failed", {
        url: attachment.url,
        error: String(error?.message || error)
      });
      return false;
    }
  }
  const sourceUrl = resolveMediaUrl(attachment.url);
  try {
    const response = await fetch(sourceUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch {
    try {
      const link = document.createElement("a");
      link.href = sourceUrl;
      link.download = fileName;
      link.click();
      return true;
    } catch {
      addDebugLog("warn", "Attachment download failed", { url: sourceUrl, name: fileName });
      return false;
    }
  }
}

function renderSwfShelf() {
  ui.swfShelf.classList.toggle("swf-shelf--hidden", !swfShelfOpen);
  ui.swfShelfList.innerHTML = "";
  if (!swfShelfOpen) return;
  if (!Array.isArray(state.savedSwfs) || state.savedSwfs.length === 0) {
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = "No saved SWFs yet.";
    ui.swfShelfList.appendChild(empty);
    return;
  }
  state.savedSwfs.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "swf-shelf-item";
    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.textContent = "FullScreen";
    openBtn.title = entry.name;
    openBtn.addEventListener("click", () => {
      void openSavedSwfFromShelf(entry);
    });
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "✕";
    removeBtn.title = "Remove from shelf";
    removeBtn.addEventListener("click", () => {
      state.savedSwfs = state.savedSwfs.filter((itemEntry) => itemEntry.url !== entry.url);
      saveState();
      renderSwfShelf();
    });
    item.appendChild(openBtn);
    item.appendChild(removeBtn);
    ui.swfShelfList.appendChild(item);
  });
}

function attachmentTypeDisplayLabel(type, mediaUrl = "") {
  const normalized = (inferAttachmentTypeFromUrl(mediaUrl) || type || "file").toLowerCase();
  if (normalized === "gif") {
    if (/\.(gif|apng|webp)(\?|$|#|&)/i.test(mediaUrl)) return "GIF";
    if (/\.(mp4|webm|mov|m4v|ogv|m3u8)(\?|$|#|&)/i.test(mediaUrl)) return "animated media";
    return "image";
  }
  if (normalized === "video") return "video";
  if (normalized === "audio") return "audio";
  if (normalized === "pdf") return "PDF";
  if (normalized === "html") return "HTML";
  if (normalized === "svg") return "SVG";
  if (normalized === "text") return "text file";
  if (normalized === "odf") return "document";
  if (normalized === "rtf") return "RTF";
  if (normalized === "bin") return "binary file";
  if (normalized === "sticker") return "sticker";
  if (normalized === "swf") return "SWF";
  return "file";
}

async function ensurePdfRuntimeLoaded() {
  if (window.pdfjsLib?.getDocument) return window.pdfjsLib;
  if (pdfRuntimeLoadPromise) return pdfRuntimeLoadPromise;
  pdfRuntimeLoadPromise = (async () => {
    const localCandidates = [
      "vendor/pdfjs/pdf.min.js",
      "vendor/pdfjs/build/pdf.min.js"
    ];
    for (const candidate of localCandidates) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const exists = await localRuntimeExists(candidate);
        if (!exists) continue;
        // eslint-disable-next-line no-await-in-loop
        await loadScriptTag(candidate);
        if (window.pdfjsLib?.getDocument) {
          addDebugLog("info", "Loaded local PDF runtime", { src: candidate });
          return window.pdfjsLib;
        }
      } catch (error) {
        addDebugLog("warn", "Local PDF runtime candidate failed", { src: candidate, error: String(error) });
      }
    }
    const remoteCandidates = [
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",
      "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js"
    ];
    for (const candidate of remoteCandidates) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await loadScriptTag(candidate);
        if (window.pdfjsLib?.getDocument) {
          addDebugLog("info", "Loaded CDN PDF runtime", { src: candidate });
          return window.pdfjsLib;
        }
      } catch (error) {
        addDebugLog("warn", "CDN PDF runtime candidate failed", { src: candidate, error: String(error) });
      }
    }
    throw new Error("PDF runtime unavailable");
  })().catch((error) => {
    addDebugLog("warn", "Failed to load custom PDF runtime", { error: String(error) });
    return null;
  }).finally(() => {
    pdfRuntimeLoadPromise = null;
  });
  return pdfRuntimeLoadPromise;
}

function renderScreens() {
  const loggedIn = Boolean(state.currentAccountId);
  ui.loginScreen.classList.toggle("screen--active", !loggedIn);
  ui.chatScreen.classList.toggle("screen--active", loggedIn);
  if (!loggedIn) {
    syncLoginFieldsFromSessionPrefs();
    if (!loginLocalXmppProfilesLoadedOnce) {
      loginLocalXmppProfilesLoadedOnce = true;
      void loadLocalXmppProfiles();
    }
  }
  if (!loggedIn && ui.settingsScreen.classList.contains("settings-screen--active")) {
    closeSettingsScreen();
  }
}

function safeRender(reason = "runtime") {
  try {
    render();
  } catch (error) {
    console.error(`Render failed (${reason})`, error);
    renderScreens();
    showToast("UI refresh failed. Check console for details.", { tone: "error", duration: 2800 });
  }
}


function createOrSwitchAccount(usernameInput, options = {}) {
  const normalized = normalizeUsername(usernameInput);
  if (!normalized) return false;

  let account = getAccountByUsername(normalized);
  if (!account) {
    const displayName = (options.displayName || usernameInput || "").toString().trim().slice(0, 32);
    account = createAccount(normalized, displayName);
    ensureAccountCosmetics(account);
    state.accounts.push(account);
  } else {
    if (!account.guildProfiles || typeof account.guildProfiles !== "object") account.guildProfiles = {};
    if (typeof account.xmppIdleSince !== "string") account.xmppIdleSince = "";
    if (typeof account.xmppLastActiveAt !== "string") account.xmppLastActiveAt = "";
    if (typeof account.customStatusEmoji !== "string") account.customStatusEmoji = "";
    if (!("customStatusExpiresAt" in account)) account.customStatusExpiresAt = null;
    if (typeof account.activityText !== "string") account.activityText = "";
    if (!Array.isArray(account.activities)) account.activities = [];
    ensureAccountCosmetics(account);
  }

  state.preferences = getPreferences();
  const requestedRelayMode = typeof options.relayMode === "string"
    ? normalizeRelayMode(options.relayMode)
    : "";
  const rememberRequested = typeof options.rememberLogin === "boolean"
    ? options.rememberLogin
    : state.preferences.rememberLogin !== "off";
  const rememberLogin = rememberRequested ? "on" : "off";
  state.preferences.rememberLogin = rememberLogin;
  if (requestedRelayMode) {
    state.preferences.relayMode = requestedRelayMode;
    if (["ws", "http", "xmpp"].includes(requestedRelayMode)) {
      state.preferences.relayAutoConnect = "on";
    }
  }
  state.currentAccountId = account.id;
  rememberAccountSession(account.id, rememberLogin === "on");
  const xmpp = options.xmpp && typeof options.xmpp === "object" ? options.xmpp : null;
  if (xmpp) {
    const jid = normalizeXmppJid(xmpp.jid || "");
    const password = normalizeXmppPassword(xmpp.password || "");
    const wsInput = normalizeXmppWsUrl(xmpp.wsUrl || "") || inferXmppWsUrlFromJid(jid);
    if (jid) state.preferences.xmppJid = jid;
    if (typeof xmpp.password === "string") state.preferences.xmppPassword = password;
    if (wsInput) state.preferences.xmppWsUrl = wsInput;
    if (jid && !state.preferences.xmppMucService) {
      const domain = xmppDomainFromJid(jid);
      if (domain) state.preferences.xmppMucService = `conference.${domain}`;
    }
    if (jid && password && (!requestedRelayMode || requestedRelayMode === "xmpp")) {
      state.preferences.relayMode = "xmpp";
      state.preferences.relayAutoConnect = "on";
    }
  }
  if (state.viewMode !== "dm" && state.viewMode !== "guild") state.viewMode = "guild";
  if (!state.activeGuildId && state.guilds[0]) {
    state.activeGuildId = state.guilds[0].id;
  }
  if (!state.activeChannelId && state.guilds[0]) {
    state.activeChannelId = getFirstOpenableChannelIdForGuild(state.guilds[0]) || state.guilds[0]?.channels?.[0]?.id || null;
  }
  ensureActiveGuildForCurrentAccount();
  ensureCurrentUserInActiveServer();
  const prefs = getPreferences();
  if (["ws", "http", "xmpp"].includes(prefs.relayMode) && prefs.relayAutoConnect === "on") connectRelaySocket({ force: true });
  if (window.SHITCORD67_NATIVE_CREDENTIALS?.syncFromState) {
    void window.SHITCORD67_NATIVE_CREDENTIALS.syncFromState();
  }
  return true;
}


const swfPipHeader = ui.swfPipDock.querySelector(".swf-pip__header");
const videoPipHeader = ui.videoPipDock?.querySelector(".video-pip__header");

function beginPipDrag(event, target, dockElement) {
  if (!(dockElement instanceof HTMLElement)) return;
  if (pipResizeState?.resizing) return;
  if (typeof event.button === "number" && event.button !== 0 && event.pointerType !== "touch") return;
  if (event.target instanceof HTMLElement && event.target.closest("button")) return;
  const dockRect = dockElement.getBoundingClientRect();
  const captureTarget = event.currentTarget instanceof HTMLElement ? event.currentTarget : dockElement;
  if (typeof event.pointerId === "number" && typeof captureTarget.setPointerCapture === "function") {
    try {
      captureTarget.setPointerCapture(event.pointerId);
    } catch {
      // Ignore unsupported pointer capture.
    }
  }
  pipDragState = {
    dragging: true,
    target,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: event.clientX - dockRect.left,
    offsetY: event.clientY - dockRect.top,
    moved: false,
    pointerId: typeof event.pointerId === "number" ? event.pointerId : null,
    pointerTarget: captureTarget
  };
  event.preventDefault();
}

function beginPipResize(event, target, dockElement, edge = "") {
  if (!(dockElement instanceof HTMLElement) || !edge) return;
  if (event.button !== 0) return;
  const rect = dockElement.getBoundingClientRect();
  pipResizeState = {
    resizing: true,
    target,
    edge,
    startX: event.clientX,
    startY: event.clientY,
    startLeft: rect.left,
    startTop: rect.top,
    startWidth: rect.width,
    startHeight: rect.height
  };
  pipDragState = null;
  event.preventDefault();
  event.stopPropagation();
}

function ensurePipResizeHandles(target, dockElement) {
  if (!(dockElement instanceof HTMLElement) || dockElement.dataset.resizeHandlesBound === "on") return;
  PIP_RESIZE_EDGES.forEach((edge) => {
    const handle = document.createElement("div");
    handle.className = `pip-resize-handle pip-resize-handle--${edge}`;
    handle.dataset.edge = edge;
    handle.addEventListener("pointerdown", (event) => {
      beginPipResize(event, target, dockElement, edge);
    });
    handle.addEventListener("mousedown", (event) => {
      beginPipResize(event, target, dockElement, edge);
    });
    dockElement.appendChild(handle);
  });
  dockElement.dataset.resizeHandlesBound = "on";
}

function clampPipBoundsForRect(target, left, top, width, height) {
  const minSize = PIP_MIN_SIZE[target] || PIP_MIN_SIZE.swf;
  const nextWidth = Math.max(minSize.width, width);
  const nextHeight = Math.max(minSize.height, height);
  const margins = pipViewportMargins();
  const maxLeft = Math.max(margins.left, window.innerWidth - nextWidth - margins.right);
  const composerRect = ui.messageForm?.getBoundingClientRect?.();
  const maxTop = composerRect
    ? Math.max(margins.top, composerRect.top - nextHeight - margins.bottom)
    : Math.max(margins.top, window.innerHeight - nextHeight - margins.bottom);
  return {
    left: Math.max(margins.left, Math.min(maxLeft, left)),
    top: Math.max(margins.top, Math.min(maxTop, top)),
    width: Math.min(nextWidth, Math.max(180, window.innerWidth - (margins.left + margins.right))),
    height: Math.min(nextHeight, Math.max(120, window.innerHeight - (margins.top + margins.bottom)))
  };
}

if (swfPipHeader) {
  swfPipHeader.addEventListener("mousedown", (event) => {
    beginPipDrag(event, "swf", ui.swfPipDock);
  });
  swfPipHeader.addEventListener("pointerdown", (event) => {
    beginPipDrag(event, "swf", ui.swfPipDock);
  });
  swfPipHeader.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.closest("button")) return;
    if (pipSuppressHeaderToggle) {
      pipSuppressHeaderToggle = false;
      return;
    }
    swfPipCollapsed = !swfPipCollapsed;
    renderSwfPipDock();
  });
}

if (videoPipHeader) {
  videoPipHeader.addEventListener("mousedown", (event) => {
    beginPipDrag(event, "video", ui.videoPipDock);
  });
  videoPipHeader.addEventListener("pointerdown", (event) => {
    beginPipDrag(event, "video", ui.videoPipDock);
  });
  videoPipHeader.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.closest("button")) return;
    if (videoPipSuppressHeaderToggle) {
      videoPipSuppressHeaderToggle = false;
      return;
    }
    videoPipCollapsed = !videoPipCollapsed;
    renderVideoPipDock();
    requestSwfRuntimeLayoutSync();
  });
}

ensurePipResizeHandles("swf", ui.swfPipDock);
ensurePipResizeHandles("video", ui.videoPipDock);

const handlePipDragMove = (event) => {
  if (pipResizeState?.resizing) return;
  if (!pipDragState?.dragging) return;
  if (event.cancelable) event.preventDefault();
  const targetDock = pipDragState.target === "video" ? ui.videoPipDock : ui.swfPipDock;
  if (!(targetDock instanceof HTMLElement)) return;
  const moveDistance = Math.hypot(event.clientX - pipDragState.startX, event.clientY - pipDragState.startY);
  if (moveDistance > 10) pipDragState.moved = true;
  const dockRect = targetDock.getBoundingClientRect();
  const margins = pipViewportMargins();
  const composerRect = ui.messageForm?.getBoundingClientRect?.();
  const maxTop = composerRect
    ? Math.max(margins.top, composerRect.top - dockRect.height - margins.bottom)
    : Math.max(margins.top, window.innerHeight - dockRect.height - margins.bottom);
  const nextLeft = Math.max(
    margins.left,
    Math.min(window.innerWidth - dockRect.width - margins.right, event.clientX - pipDragState.offsetX)
  );
  const nextTop = Math.max(margins.top, Math.min(maxTop, event.clientY - pipDragState.offsetY));
  targetDock.style.left = `${Math.round(nextLeft)}px`;
  targetDock.style.top = `${Math.round(nextTop)}px`;
  targetDock.style.right = "auto";
  targetDock.style.bottom = "auto";
  if (pipDragState.target === "swf") {
    positionSwfPipRuntimeHosts();
    updateVideoPipDockLayout();
  }
};

const handlePipResizeMove = (event) => {
  if (!pipResizeState?.resizing) return;
  event.preventDefault();
  const targetDock = pipResizeState.target === "video" ? ui.videoPipDock : ui.swfPipDock;
  if (!(targetDock instanceof HTMLElement)) return;
  const edge = (pipResizeState.edge || "").toLowerCase();
  const deltaX = event.clientX - pipResizeState.startX;
  const deltaY = event.clientY - pipResizeState.startY;
  const minSize = PIP_MIN_SIZE[pipResizeState.target] || PIP_MIN_SIZE.swf;
  let nextLeft = pipResizeState.startLeft;
  let nextTop = pipResizeState.startTop;
  let nextWidth = pipResizeState.startWidth;
  let nextHeight = pipResizeState.startHeight;

  if (edge.includes("e")) {
    nextWidth = pipResizeState.startWidth + deltaX;
  }
  if (edge.includes("s")) {
    nextHeight = pipResizeState.startHeight + deltaY;
  }
  if (edge.includes("w")) {
    nextWidth = pipResizeState.startWidth - deltaX;
    nextLeft = pipResizeState.startLeft + deltaX;
    if (nextWidth < minSize.width) {
      nextLeft -= (minSize.width - nextWidth);
      nextWidth = minSize.width;
    }
  }
  if (edge.includes("n")) {
    nextHeight = pipResizeState.startHeight - deltaY;
    nextTop = pipResizeState.startTop + deltaY;
    if (nextHeight < minSize.height) {
      nextTop -= (minSize.height - nextHeight);
      nextHeight = minSize.height;
    }
  }

  const clamped = clampPipBoundsForRect(pipResizeState.target, nextLeft, nextTop, nextWidth, nextHeight);
  targetDock.style.left = `${Math.round(clamped.left)}px`;
  targetDock.style.top = `${Math.round(clamped.top)}px`;
  targetDock.style.width = `${Math.round(clamped.width)}px`;
  targetDock.style.height = `${Math.round(clamped.height)}px`;
  targetDock.style.right = "auto";
  targetDock.style.bottom = "auto";
  if (pipResizeState.target === "swf") {
    positionSwfPipRuntimeHosts();
    updateVideoPipDockLayout();
  } else {
    requestSwfRuntimeLayoutSync();
  }
};

const finishPipDrag = () => {
  if (pipResizeState?.resizing) return;
  if (!pipDragState?.dragging) return;
  const dragTarget = pipDragState.target || "swf";
  if (pipDragState.pointerTarget && typeof pipDragState.pointerTarget.releasePointerCapture === "function") {
    try {
      pipDragState.pointerTarget.releasePointerCapture(pipDragState.pointerId);
    } catch {
      // Ignore unsupported pointer capture release.
    }
  }
  if (dragTarget === "swf" && pipDragState.moved) pipSuppressHeaderToggle = true;
  if (dragTarget === "video" && pipDragState.moved) videoPipSuppressHeaderToggle = true;
  pipDragState.dragging = false;
  state.preferences = getPreferences();
  const dock = dragTarget === "video" ? ui.videoPipDock : ui.swfPipDock;
  if (dock instanceof HTMLElement) {
    clampPipDockAboveComposer(dock);
    const rect = dock.getBoundingClientRect();
    if (dragTarget === "video") {
      state.preferences.videoPipPosition = { left: Math.round(rect.left), top: Math.round(rect.top), manual: true };
    } else {
      state.preferences.swfPipPosition = { left: Math.round(rect.left), top: Math.round(rect.top), manual: true };
    }
  }
  saveState();
  pipDragState = null;
};

const finishPipResize = () => {
  if (!pipResizeState?.resizing) return;
  const target = pipResizeState.target || "swf";
  const dock = target === "video" ? ui.videoPipDock : ui.swfPipDock;
  pipResizeState.resizing = false;
  if (dock instanceof HTMLElement) {
    clampPipDockAboveComposer(dock);
    const rect = dock.getBoundingClientRect();
    state.preferences = getPreferences();
    if (target === "video") {
      state.preferences.videoPipPosition = { left: Math.round(rect.left), top: Math.round(rect.top), manual: true };
      state.preferences.videoPipSize = { width: Math.round(rect.width), height: Math.round(rect.height) };
    } else {
      state.preferences.swfPipPosition = { left: Math.round(rect.left), top: Math.round(rect.top), manual: true };
      state.preferences.swfPipSize = { width: Math.round(rect.width), height: Math.round(rect.height) };
    }
    saveState();
  }
  pipResizeState = null;
};

document.addEventListener("mousemove", handlePipDragMove);
document.addEventListener("pointermove", handlePipDragMove);
document.addEventListener("mousemove", handlePipResizeMove);
document.addEventListener("pointermove", handlePipResizeMove);
document.addEventListener("mouseup", finishPipDrag);
document.addEventListener("pointerup", finishPipDrag);
document.addEventListener("pointercancel", finishPipDrag);
document.addEventListener("mouseup", finishPipResize);
document.addEventListener("pointerup", finishPipResize);
document.addEventListener("pointercancel", finishPipResize);
ui.clearSwfShelfBtn.addEventListener("click", () => {
  state.savedSwfs = [];
  saveState();
  renderSwfShelf();
});
ui.swfViewerZoomInput.addEventListener("input", applySwfViewerZoom);
