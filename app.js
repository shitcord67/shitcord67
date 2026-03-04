function applyServerBrandEmojiSupport() {
  if (!ui.serverBrand) return;
  const supported = supportsEmojiGlyph(SHITCORD_BRAND_EMOJI);
  ui.serverBrand.classList.toggle("server-brand--emoji", supported);
}

if (ui.saveComposerAttachmentBtn) ui.saveComposerAttachmentBtn.hidden = true;

const HEADER_ACTION_BUTTONS = [
  { key: "openCallBtn", icon: "📹", fallback: "Call", preferIcon: true },
  { key: "openScreenShareBtn", icon: "🖥", fallback: "Screen", preferIcon: true },
  {
    key: (window.SHITCORD67_APP_ACCOUNT_RUNTIME?.legacyCallButtonKey?.() || "openLegacyCallBtn"),
    icon: "📡",
    fallback: "Legacy Call",
    preferIcon: true
  },
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
  const accountRuntime = window.SHITCORD67_APP_ACCOUNT_RUNTIME || null;
  const snapshot = typeof accountRuntime?.snapshotStateForStorage === "function"
    ? accountRuntime.snapshotStateForStorage(state)
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
  const accountRuntime = window.SHITCORD67_APP_ACCOUNT_RUNTIME || null;
  if (typeof accountRuntime?.canAccountAccessProtocolGuild === "function") {
    const allowed = accountRuntime.canAccountAccessProtocolGuild(guild, account);
    if (!allowed) return false;
  }
  const members = Array.isArray(guild.memberIds) ? guild.memberIds.filter(Boolean) : [];
  if (members.includes(account.id)) return true;
  // Keep legacy local guilds reachable when memberIds was never populated.
  const protocolBacked = typeof accountRuntime?.isProtocolBackedGuild === "function"
    ? accountRuntime.isProtocolBackedGuild(guild)
    : false;
  if (members.length === 0 && !protocolBacked) return true;
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

function appConversationRuntime() {
  const runtime = window.SHITCORD67_APP_CONVERSATION_RUNTIME;
  if (!runtime) throw new Error("Conversation runtime is unavailable.");
  return runtime;
}

function messageMentionsAccount(...args) { return appConversationRuntime().messageMentionsAccount(...args); }
function messageRepliesToAccount(...args) { return appConversationRuntime().messageRepliesToAccount(...args); }
function isMessageHighlightedForAccount(...args) { return appConversationRuntime().isMessageHighlightedForAccount(...args); }
function searchableMessageText(...args) { return appConversationRuntime().searchableMessageText(...args); }
function parseFindDateInput(...args) { return appConversationRuntime().parseFindDateInput(...args); }
function buildFindSpec(...args) { return appConversationRuntime().buildFindSpec(...args); }
function extractFindInlineFilters(...args) { return appConversationRuntime().extractFindInlineFilters(...args); }
function hasActiveFindSpec(...args) { return appConversationRuntime().hasActiveFindSpec(...args); }
function activeConversationFindBucket(...args) { return appConversationRuntime().activeConversationFindBucket(...args); }
function findMatchCacheKey(...args) { return appConversationRuntime().findMatchCacheKey(...args); }
function resetFindMatchCache(...args) { return appConversationRuntime().resetFindMatchCache(...args); }
function activeConversationHistoryState(...args) { return appConversationRuntime().activeConversationHistoryState(...args); }
function messageHasLink(...args) { return appConversationRuntime().messageHasLink(...args); }
function messageMatchesFindSpec(...args) { return appConversationRuntime().messageMatchesFindSpec(...args); }
function messageMatchesFindQuery(...args) { return appConversationRuntime().messageMatchesFindQuery(...args); }
function formatFindSpecSummary(...args) { return appConversationRuntime().formatFindSpecSummary(...args); }
function getFindMatchesForConversation(...args) { return appConversationRuntime().getFindMatchesForConversation(...args); }
function getFindActiveMessageId(...args) { return appConversationRuntime().getFindActiveMessageId(...args); }
function renderFindList(...args) { return appConversationRuntime().renderFindList(...args); }
function scheduleFindUiRefresh(...args) { return appConversationRuntime().scheduleFindUiRefresh(...args); }
function openFindDialog(...args) { return appConversationRuntime().openFindDialog(...args); }
function openFindDialogWithQuery(...args) { return appConversationRuntime().openFindDialogWithQuery(...args); }
function moveFindSelection(...args) { return appConversationRuntime().moveFindSelection(...args); }
function markConversationUnreadFromMessage(...args) { return appConversationRuntime().markConversationUnreadFromMessage(...args); }
function getChannelUnreadStats(...args) { return appConversationRuntime().getChannelUnreadStats(...args); }
function findFirstUnreadMessageId(...args) { return appConversationRuntime().findFirstUnreadMessageId(...args); }
function ensureChannelSlowmodeState(...args) { return appConversationRuntime().ensureChannelSlowmodeState(...args); }
function normalizeSlowmodeSeconds(...args) { return appConversationRuntime().normalizeSlowmodeSeconds(...args); }
function getChannelSlowmodeSeconds(...args) { return appConversationRuntime().getChannelSlowmodeSeconds(...args); }
function canCurrentUserPostInChannel(...args) { return appConversationRuntime().canCurrentUserPostInChannel(...args); }
function canModerateStageChannel(...args) { return appConversationRuntime().canModerateStageChannel(...args); }
function canModerateVoiceLikeChannel(...args) { return appConversationRuntime().canModerateVoiceLikeChannel(...args); }
function ensureVoiceStateForChannel(...args) { return appConversationRuntime().ensureVoiceStateForChannel(...args); }
function addVoiceActivity(...args) { return appConversationRuntime().addVoiceActivity(...args); }
function setVoiceMuteState(...args) { return appConversationRuntime().setVoiceMuteState(...args); }
function setStageRaisedHandState(...args) { return appConversationRuntime().setStageRaisedHandState(...args); }
function setStageSpeakerState(...args) { return appConversationRuntime().setStageSpeakerState(...args); }
function resolveVoiceParticipantByToken(...args) { return appConversationRuntime().resolveVoiceParticipantByToken(...args); }
function resolveVoiceChannelByToken(...args) { return appConversationRuntime().resolveVoiceChannelByToken(...args); }
function leaveAllVoiceChannelsForAccount(...args) { return appConversationRuntime().leaveAllVoiceChannelsForAccount(...args); }
function joinVoiceLikeChannel(...args) { return appConversationRuntime().joinVoiceLikeChannel(...args); }
function leaveVoiceLikeChannel(...args) { return appConversationRuntime().leaveVoiceLikeChannel(...args); }
function toggleVoiceMuteForSelf(...args) { return appConversationRuntime().toggleVoiceMuteForSelf(...args); }
function describeVoiceActivity(...args) { return appConversationRuntime().describeVoiceActivity(...args); }
function toggleRaisedHandForSelf(...args) { return appConversationRuntime().toggleRaisedHandForSelf(...args); }
function toggleStageSpeaker(...args) { return appConversationRuntime().toggleStageSpeaker(...args); }
function getChannelSlowmodeRemainingMs(...args) { return appConversationRuntime().getChannelSlowmodeRemainingMs(...args); }
function recordChannelSlowmodeSend(...args) { return appConversationRuntime().recordChannelSlowmodeSend(...args); }
function formatSlowmodeLabel(...args) { return appConversationRuntime().formatSlowmodeLabel(...args); }
function getGuildUnreadStats(...args) { return appConversationRuntime().getGuildUnreadStats(...args); }
function getGuildChannelsForNavigation(...args) { return appConversationRuntime().getGuildChannelsForNavigation(...args); }
function getFirstOpenableChannelIdForGuild(...args) { return appConversationRuntime().getFirstOpenableChannelIdForGuild(...args); }
function ensureActiveGuildForCurrentAccount(...args) { return appConversationRuntime().ensureActiveGuildForCurrentAccount(...args); }
function openGuildById(...args) { return appConversationRuntime().openGuildById(...args); }
function navigateGuildChannelByOffset(...args) { return appConversationRuntime().navigateGuildChannelByOffset(...args); }
function moveActiveChannelByOffset(...args) { return appConversationRuntime().moveActiveChannelByOffset(...args); }
function listUnreadGuildChannels(...args) { return appConversationRuntime().listUnreadGuildChannels(...args); }
function jumpToUnreadGuildChannel(...args) { return appConversationRuntime().jumpToUnreadGuildChannel(...args); }
function listMentionGuildChannels(...args) { return appConversationRuntime().listMentionGuildChannels(...args); }
function jumpToMentionGuildChannel(...args) { return appConversationRuntime().jumpToMentionGuildChannel(...args); }
function cycleActiveDmThread(...args) { return appConversationRuntime().cycleActiveDmThread(...args); }
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


function appOverlayRuntime() {
  return window.SHITCORD67_APP_OVERLAY_RUNTIME || null;
}

function copyTextToChannelWithFeedback(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.copyTextToChannelWithFeedback) return;
  return runtime.copyTextToChannelWithFeedback(...args);
}

function ensureToastHost(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.ensureToastHost) return null;
  return runtime.ensureToastHost(...args);
}

function showToast(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.showToast) return;
  return runtime.showToast(...args);
}

function ensureMediaLightbox(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.ensureMediaLightbox) return null;
  return runtime.ensureMediaLightbox(...args);
}

function hasPinnedNativeCallLightbox(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.hasPinnedNativeCallLightbox) return false;
  return runtime.hasPinnedNativeCallLightbox(...args);
}

function hasPinnedWebCallLightbox(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.hasPinnedWebCallLightbox) return false;
  return runtime.hasPinnedWebCallLightbox(...args);
}

function isNativeCallAudioTestActive(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.isNativeCallAudioTestActive) return false;
  return runtime.isNativeCallAudioTestActive(...args);
}

function stopNativeCallAudioTest(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.stopNativeCallAudioTest) return;
  return runtime.stopNativeCallAudioTest(...args);
}

async function startNativeCallAudioTest(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.startNativeCallAudioTest) return false;
  return runtime.startNativeCallAudioTest(...args);
}

function closeMediaLightbox(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.closeMediaLightbox) return false;
  return runtime.closeMediaLightbox(...args);
}

function lightboxDownloadNameFromLabel(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.lightboxDownloadNameFromLabel) return "media.bin";
  return runtime.lightboxDownloadNameFromLabel(...args);
}

function triggerMediaDownload(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.triggerMediaDownload) return;
  return runtime.triggerMediaDownload(...args);
}

function bindMediaPreviewContextMenu(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.bindMediaPreviewContextMenu) return;
  return runtime.bindMediaPreviewContextMenu(...args);
}

function showInAppConfirmDialog(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.showInAppConfirmDialog) return Promise.resolve(false);
  return runtime.showInAppConfirmDialog(...args);
}

function showInAppAlertDialog(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.showInAppAlertDialog) return Promise.resolve(false);
  return runtime.showInAppAlertDialog(...args);
}

function showInAppPromptDialog(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.showInAppPromptDialog) return Promise.resolve(null);
  return runtime.showInAppPromptDialog(...args);
}

function showInAppCopyDialog(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.showInAppCopyDialog) return Promise.resolve(false);
  return runtime.showInAppCopyDialog(...args);
}

function openMediaLightbox(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.openMediaLightbox) return;
  return runtime.openMediaLightbox(...args);
}

function showExternalLinkPrompt(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.showExternalLinkPrompt) return;
  return runtime.showExternalLinkPrompt(...args);
}

function openExternalUrlInClient(...args) {
  const runtime = appOverlayRuntime();
  if (!runtime?.openExternalUrlInClient) return;
  return runtime.openExternalUrlInClient(...args);
}


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

function messageEditHistory(message) {
  return Array.isArray(message?.editHistory) ? message.editHistory : [];
}

function formatMessageEditHistory(message) {
  const history = messageEditHistory(message);
  if (history.length === 0) return "No edit history.";
  return history
    .map((entry, index) => {
      const editor = entry?.editorName || "Unknown";
      const when = entry?.editedAt || "";
      const text = (entry?.previousText || "").toString();
      return `${index + 1}. ${when} by ${editor}\n${text}`;
    })
    .join("\n\n");
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
  const accountRuntime = window.SHITCORD67_APP_ACCOUNT_RUNTIME || null;
  const fallbackSeed = [
    typeof accountRuntime?.protocolAccountAddress === "function"
      ? accountRuntime.protocolAccountAddress(account)
      : "",
    (account.username || "").toString(),
    (displayNameForAccount(account, guildId) || "").toString()
  ].find((entry) => (entry || "").toString().trim()) || "avatar";
  return fallbackAvatarColorForSeed(fallbackSeed, currentColor);
}

function shouldUseStrictInitialAvatar(account, guildId = null) {
  if (!account || typeof account !== "object") return false;
  const avatar = resolveAccountAvatar(account, guildId);
  if (isRenderableAvatarUrl(avatar.url || "")) return false;
  const accountRuntime = window.SHITCORD67_APP_ACCOUNT_RUNTIME || null;
  if (typeof accountRuntime?.shouldUseStrictInitialAvatarForProtocol === "function") {
    return accountRuntime.shouldUseStrictInitialAvatarForProtocol(account);
  }
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


function renderScreens() {
  const accountRuntime = window.SHITCORD67_APP_ACCOUNT_RUNTIME || null;
  const loggedIn = Boolean(state.currentAccountId);
  ui.loginScreen.classList.toggle("screen--active", !loggedIn);
  ui.chatScreen.classList.toggle("screen--active", loggedIn);
  if (!loggedIn) {
    syncLoginFieldsFromSessionPrefs();
    if (typeof accountRuntime?.maybeLoadProtocolLoginProfiles === "function") {
      accountRuntime.maybeLoadProtocolLoginProfiles({ loggedIn });
    }
    const uiBindings = window.SHITCORD67_XEP_XMPP_UI_BINDINGS_RUNTIME || null;
    if (typeof uiBindings?.refreshLoginRuntimeUi === "function") {
      uiBindings.refreshLoginRuntimeUi();
    }
    if (typeof uiBindings?.maybeShowLanguageOnboardingPrompt === "function") {
      uiBindings.maybeShowLanguageOnboardingPrompt();
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
    const ensureAccountShape = window.SHITCORD67_APP_ACCOUNT_RUNTIME?.ensureAccountRuntimeShape;
    if (typeof ensureAccountShape === "function") {
      ensureAccountShape(account, { ensureAccountCosmeticsFn: ensureAccountCosmetics });
    } else {
      if (!account.guildProfiles || typeof account.guildProfiles !== "object") account.guildProfiles = {};
      if (typeof account.customStatusEmoji !== "string") account.customStatusEmoji = "";
      if (!("customStatusExpiresAt" in account)) account.customStatusExpiresAt = null;
      if (typeof account.activityText !== "string") account.activityText = "";
      if (!Array.isArray(account.activities)) account.activities = [];
      ensureAccountCosmetics(account);
    }
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
  const nativeCreds = window.SHITCORD67_NATIVE_CREDENTIALS || null;
  const nativeAndroid = Boolean(nativeCreds && typeof nativeCreds.isAndroid === "function" && nativeCreds.isAndroid());
  if (nativeAndroid) {
    state.preferences.rememberLoginStorage = rememberLogin === "on" ? "on" : "off";
  }
  if (requestedRelayMode) {
    state.preferences.relayMode = requestedRelayMode;
    const shouldAutoConnectRequested = window.SHITCORD67_APP_ACCOUNT_RUNTIME?.shouldAutoConnectRelayMode;
    if (typeof shouldAutoConnectRequested === "function" && shouldAutoConnectRequested(requestedRelayMode)) {
      state.preferences.relayAutoConnect = "on";
    }
  }
  state.currentAccountId = account.id;
  rememberAccountSession(account.id, rememberLogin === "on");
  const applyProtocolLoginOptions = window.SHITCORD67_APP_ACCOUNT_RUNTIME?.applyProtocolLoginOptionsToPreferences;
  if (typeof applyProtocolLoginOptions === "function") {
    applyProtocolLoginOptions(options, state.preferences, { requestedRelayMode });
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
  const shouldAutoConnectRelayMode = window.SHITCORD67_APP_ACCOUNT_RUNTIME?.shouldAutoConnectRelayMode;
  if (typeof shouldAutoConnectRelayMode === "function" && shouldAutoConnectRelayMode(prefs.relayMode) && prefs.relayAutoConnect === "on") {
    connectRelaySocket({ force: true });
  }
  if (nativeCreds?.syncFromState) {
    void nativeCreds.syncFromState({ force: nativeAndroid });
  }
  return true;
}
