/*
 * Conversation/search/unread/voice helpers extracted from app.js.
 * Keeps large XMPP-adjacent message flow logic out of the main app bundle.
 */

(function initAppConversationRuntime(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_APP_CONVERSATION_RUNTIME) return;

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
    hasLink: Boolean(findHasLinkOnly),
    hasMedia: Boolean(findHasMediaOnly),
    hasAttachment: Boolean(findHasAttachmentOnly),
    hasReaction: Boolean(findHasReactionOnly),
    hasPoll: Boolean(findHasPollOnly),
    hasReply: Boolean(findHasReplyOnly),
    hasPin: Boolean(findHasPinOnly),
    hasCode: Boolean(findHasCodeOnly)
  };
}

function extractFindInlineFilters(rawQuery) {
  const source = (rawQuery || "").toString().trim();
  if (!source) {
    return {
      query: "",
      author: "",
      after: "",
      before: "",
      hasLink: false,
      hasMedia: false,
      hasAttachment: false,
      hasReaction: false,
      hasPoll: false,
      hasReply: false,
      hasPin: false,
      hasCode: false
    };
  }
  const authorParts = [];
  const keepParts = [];
  let after = "";
  let before = "";
  let hasLink = false;
  let hasMedia = false;
  let hasAttachment = false;
  let hasReaction = false;
  let hasPoll = false;
  let hasReply = false;
  let hasPin = false;
  let hasCode = false;
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
    if (/^has:media$/i.test(token)) {
      hasMedia = true;
      return;
    }
    if (/^has:attachments?$/i.test(token)) {
      hasAttachment = true;
      return;
    }
    if (/^has:reactions?$/i.test(token)) {
      hasReaction = true;
      return;
    }
    if (/^has:polls?$/i.test(token)) {
      hasPoll = true;
      return;
    }
    if (/^has:repl(y|ies)$/i.test(token)) {
      hasReply = true;
      return;
    }
    if (/^has:pin(ned)?s?$/i.test(token)) {
      hasPin = true;
      return;
    }
    if (/^has:code$/i.test(token)) {
      hasCode = true;
      return;
    }
    keepParts.push(token);
  });
  return {
    query: keepParts.join(" "),
    author: authorParts.join(" ").slice(0, 32),
    after,
    before,
    hasLink,
    hasMedia,
    hasAttachment,
    hasReaction,
    hasPoll,
    hasReply,
    hasPin,
    hasCode
  };
}

function hasActiveFindSpec(spec) {
  if (!spec) return false;
  return Boolean(
    spec.term
    || spec.author
    || spec.afterMs
    || spec.beforeMs
    || spec.hasLink
    || spec.hasMedia
    || spec.hasAttachment
    || spec.hasReaction
    || spec.hasPoll
    || spec.hasReply
    || spec.hasPin
    || spec.hasCode
  );
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
    spec?.hasMedia ? "1" : "0",
    spec?.hasAttachment ? "1" : "0",
    spec?.hasReaction ? "1" : "0",
    spec?.hasPoll ? "1" : "0",
    spec?.hasReply ? "1" : "0",
    spec?.hasPin ? "1" : "0",
    spec?.hasCode ? "1" : "0",
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
  const runtime = window.SHITCORD67_APP_XMPP_HISTORY_RUNTIME;
  if (runtime?.activeConversationHistoryState) {
    return runtime.activeConversationHistoryState(conversation, {
      getPreferencesFn: getPreferences,
      getCurrentAccountFn: getCurrentAccount,
      xmppPeerJidForDmThreadFn: xmppPeerJidForDmThread,
      xmppBareJidFn: xmppBareJid,
      ensureXmppDmMamStateFn: ensureXmppDmMamState,
      ensureXmppMamStateFn: ensureXmppMamState
    });
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

function messageHasAttachments(message) {
  if (!message) return false;
  const attachments = normalizeAttachments(message.attachments);
  return attachments.length > 0;
}

function messageHasReactions(message) {
  if (!message) return false;
  if (typeof normalizeReactions !== "function") return Array.isArray(message.reactions) && message.reactions.length > 0;
  return normalizeReactions(message.reactions).some((reaction) => (reaction?.userIds || []).length > 0);
}

function messageHasPoll(message) {
  if (!message) return false;
  if (typeof normalizePoll === "function") return Boolean(normalizePoll(message.poll));
  return Boolean(message.poll);
}

function messageHasReply(message) {
  if (!message) return false;
  return Boolean(message.replyTo && (message.replyTo.messageId || message.replyTo.stanzaId));
}

function messageHasPin(message) {
  return Boolean(message?.pinned);
}

function messageHasCode(message, channelType = "text") {
  if (!message) return false;
  const text = searchableMessageText(message, channelType);
  return /```|`[^`]+`/.test(text);
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
  if (spec.hasMedia && !messageHasAttachments(message)) return false;
  if (spec.hasAttachment && !messageHasAttachments(message)) return false;
  if (spec.hasReaction && !messageHasReactions(message)) return false;
  if (spec.hasPoll && !messageHasPoll(message)) return false;
  if (spec.hasReply && !messageHasReply(message)) return false;
  if (spec.hasPin && !messageHasPin(message)) return false;
  if (spec.hasCode && !messageHasCode(message, channelType)) return false;
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
  if (spec.hasMedia) parts.push("has media");
  if (spec.hasAttachment) parts.push("has attachment");
  if (spec.hasReaction) parts.push("has reaction");
  if (spec.hasPoll) parts.push("has poll");
  if (spec.hasReply) parts.push("has reply");
  if (spec.hasPin) parts.push("pinned");
  if (spec.hasCode) parts.push("has code");
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
  findHasMediaOnly = false;
  findHasAttachmentOnly = false;
  findHasReactionOnly = false;
  findHasPollOnly = false;
  findHasReplyOnly = false;
  findHasPinOnly = false;
  findHasCodeOnly = false;
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
  findHasMediaOnly = Boolean(inline.hasMedia);
  findHasAttachmentOnly = Boolean(inline.hasAttachment);
  findHasReactionOnly = Boolean(inline.hasReaction);
  findHasPollOnly = Boolean(inline.hasPoll);
  findHasReplyOnly = Boolean(inline.hasReply);
  findHasPinOnly = Boolean(inline.hasPin);
  findHasCodeOnly = Boolean(inline.hasCode);
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
  state.preferences = getPreferences();
  state.preferences.mobilePane = "chat";
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
  state.preferences = getPreferences();
  state.preferences.mobilePane = "chat";
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
  state.preferences = getPreferences();
  state.preferences.mobilePane = "chat";
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
  state.preferences = getPreferences();
  state.preferences.mobilePane = "chat";
  saveState();
  render();
  return true;
}


  globalScope.SHITCORD67_APP_CONVERSATION_RUNTIME = Object.freeze({
    messageMentionsAccount,
    messageRepliesToAccount,
    isMessageHighlightedForAccount,
    searchableMessageText,
    parseFindDateInput,
    buildFindSpec,
    extractFindInlineFilters,
    hasActiveFindSpec,
    activeConversationFindBucket,
    findMatchCacheKey,
    resetFindMatchCache,
    activeConversationHistoryState,
    messageHasLink,
    messageMatchesFindSpec,
    messageMatchesFindQuery,
    formatFindSpecSummary,
    getFindMatchesForConversation,
    getFindActiveMessageId,
    renderFindList,
    scheduleFindUiRefresh,
    openFindDialog,
    openFindDialogWithQuery,
    moveFindSelection,
    markConversationUnreadFromMessage,
    getChannelUnreadStats,
    findFirstUnreadMessageId,
    ensureChannelSlowmodeState,
    normalizeSlowmodeSeconds,
    getChannelSlowmodeSeconds,
    canCurrentUserPostInChannel,
    canModerateStageChannel,
    canModerateVoiceLikeChannel,
    ensureVoiceStateForChannel,
    addVoiceActivity,
    setVoiceMuteState,
    setStageRaisedHandState,
    setStageSpeakerState,
    resolveVoiceParticipantByToken,
    resolveVoiceChannelByToken,
    leaveAllVoiceChannelsForAccount,
    joinVoiceLikeChannel,
    leaveVoiceLikeChannel,
    toggleVoiceMuteForSelf,
    describeVoiceActivity,
    toggleRaisedHandForSelf,
    toggleStageSpeaker,
    getChannelSlowmodeRemainingMs,
    recordChannelSlowmodeSend,
    formatSlowmodeLabel,
    getGuildUnreadStats,
    getGuildChannelsForNavigation,
    getFirstOpenableChannelIdForGuild,
    ensureActiveGuildForCurrentAccount,
    openGuildById,
    navigateGuildChannelByOffset,
    moveActiveChannelByOffset,
    listUnreadGuildChannels,
    jumpToUnreadGuildChannel,
    listMentionGuildChannels,
    jumpToMentionGuildChannel,
    cycleActiveDmThread
  });
})(typeof window !== "undefined" ? window : globalThis);
