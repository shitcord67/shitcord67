/*
 * App runtime helpers extracted from app.js (XMPP reactions, spaces commands, scheduling/poll helpers).
 * Functions intentionally bind to app globals at call time.
 */

function toggleReaction(message, emoji, userId) {
  if (!message || !emoji || !userId) return false;
  const before = xmppReactionSignature(message.reactions);
  if (emoji) rememberRecentEmoji(emoji);
  message.reactions = normalizeReactions(message.reactions);
  let reaction = message.reactions.find((item) => item.emoji === emoji);
  if (!reaction) {
    reaction = { emoji, userIds: [userId] };
    message.reactions.push(reaction);
    return before !== xmppReactionSignature(message.reactions);
  }
  const idx = reaction.userIds.indexOf(userId);
  if (idx === -1) {
    reaction.userIds.push(userId);
  } else {
    reaction.userIds.splice(idx, 1);
  }
  message.reactions = message.reactions.filter((item) => item.userIds.length > 0);
  return before !== xmppReactionSignature(message.reactions);
}

function toggleMessageReactionForCurrentConversation(conversation, message, emoji, account = getCurrentAccount()) {
  if (!conversation || !message || !emoji || !account?.id) return false;
  const normalizedChanged = normalizeMessageReactionsForConversation(message, conversation);
  const changed = toggleReaction(message, emoji, account.id);
  if (!changed && !normalizedChanged) return false;
  if (changed) {
    const publishResult = publishXmppMessageReaction(conversation, message, account);
    const prefs = getPreferences();
    if (
      prefs.relayMode === "xmpp"
      && publishResult
      && publishResult.ok === false
      && !["not-xmpp-channel", "xmpp-offline"].includes((publishResult.reason || "").toString())
    ) {
      showToast(`Reaction sync issue: ${publishResult.reason || "unknown"}.`, { tone: "error" });
    }
  }
  saveState();
  renderMessages();
  return true;
}

function parsePollFromCommandArg(arg) {
  const parts = (arg || "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 3) return null;
  const [question, ...optionParts] = parts;
  const options = optionParts
    .slice(0, 12)
    .map((label) => ({ id: createId(), label: label.slice(0, 120), voterIds: [] }))
    .filter((option) => option.label);
  if (!question || options.length < 2) return null;
  return {
    question: question.slice(0, 220),
    options,
    allowsMulti: false,
    closed: false
  };
}

function findLatestPollMessage(channel) {
  if (!channel || !Array.isArray(channel.messages)) return null;
  for (let i = channel.messages.length - 1; i >= 0; i -= 1) {
    const message = channel.messages[i];
    if (normalizePoll(message?.poll)) return message;
  }
  return null;
}

function getPollTotalVotes(poll) {
  const normalized = normalizePoll(poll);
  if (!normalized) return 0;
  const voters = new Set();
  normalized.options.forEach((option) => {
    option.voterIds.forEach((voterId) => voters.add(voterId));
  });
  return voters.size;
}

function setPollVotesForUser(message, optionIds, userId) {
  const poll = normalizePoll(message?.poll);
  if (!poll || poll.closed || !poll.allowsMulti || !userId) return false;
  const allowed = new Set(poll.options.map((option) => option.id));
  const requested = [...new Set((Array.isArray(optionIds) ? optionIds : []).filter((id) => allowed.has(id)))];
  const before = poll.options
    .filter((option) => option.voterIds.includes(userId))
    .map((option) => option.id)
    .sort()
    .join(",");
  poll.options.forEach((option) => {
    option.voterIds = option.voterIds.filter((voterId) => voterId !== userId);
    if (requested.includes(option.id)) option.voterIds.push(userId);
  });
  message.poll = poll;
  const after = poll.options
    .filter((option) => option.voterIds.includes(userId))
    .map((option) => option.id)
    .sort()
    .join(",");
  return before !== after;
}

function togglePollVote(message, optionId, userId) {
  const poll = normalizePoll(message?.poll);
  if (!poll || poll.closed || !optionId || !userId) return false;
  const target = poll.options.find((option) => option.id === optionId);
  if (!target) return false;
  if (poll.allowsMulti) {
    const wasSelected = target.voterIds.includes(userId);
    if (wasSelected) {
      target.voterIds = target.voterIds.filter((voterId) => voterId !== userId);
    } else {
      target.voterIds.push(userId);
    }
  } else {
    const wasSelected = target.voterIds.includes(userId);
    poll.options.forEach((option) => {
      option.voterIds = option.voterIds.filter((voterId) => voterId !== userId);
    });
    if (!wasSelected) {
      target.voterIds.push(userId);
    }
  }
  message.poll = poll;
  return true;
}

function closeOrOpenLatestPoll(channel, closed) {
  const pollMessage = findLatestPollMessage(channel);
  if (!pollMessage) return false;
  const poll = normalizePoll(pollMessage.poll);
  if (!poll) return false;
  if (poll.closed === closed) return false;
  pollMessage.poll = { ...poll, closed };
  return true;
}

function formatPollResultsText(message, { includeVoters = false } = {}) {
  const poll = normalizePoll(message?.poll);
  if (!poll) return "No poll.";
  const total = getPollTotalVotes(poll);
  const lines = poll.options.map((option) => {
    const votes = option.voterIds.length;
    const percent = total > 0 ? Math.round((votes / total) * 100) : 0;
    const voterSuffix = includeVoters ? ` [${formatPollOptionVoters(option)}]` : "";
    return `- ${option.label}: ${votes} vote${votes === 1 ? "" : "s"} (${percent}%)${voterSuffix}`;
  });
  return `${poll.question}\n${lines.join("\n")}\nTotal voters: ${total}`;
}

function formatPollOptionVoters(option) {
  const ids = Array.isArray(option?.voterIds) ? option.voterIds : [];
  if (ids.length === 0) return "No votes yet.";
  const labels = ids
    .slice(0, 8)
    .map((id) => {
      const account = getAccountById(id);
      return account ? `@${account.username}` : id.slice(0, 8);
    });
  const suffix = ids.length > labels.length ? ` +${ids.length - labels.length} more` : "";
  return `${labels.join(", ")}${suffix}`;
}

function canManagePollMessage(message, { isDm = false, canManageMessages = false, currentUser = null } = {}) {
  if (!message?.poll || !currentUser) return false;
  if (message.userId && message.userId === currentUser.id) return true;
  return !isDm && canManageMessages;
}

function renderMessagePoll(container, message, { currentUser = null, isDm = false, canManageMessages = false, onChanged = null } = {}) {
  const poll = normalizePoll(message?.poll);
  if (!poll) return;
  const wrap = document.createElement("div");
  wrap.className = "message-poll";
  const question = document.createElement("div");
  question.className = "message-poll__question";
  question.textContent = poll.question;
  wrap.appendChild(question);
  const total = getPollTotalVotes(poll);
  poll.options.forEach((option) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "message-poll__option";
    const votes = option.voterIds.length;
    const percent = total > 0 ? Math.round((votes / total) * 100) : 0;
    const isSelected = currentUser ? option.voterIds.includes(currentUser.id) : false;
    row.classList.toggle("is-selected", isSelected);
    if (poll.closed) row.disabled = true;
    row.style.setProperty("--poll-fill", `${percent}%`);
    row.title = formatPollOptionVoters(option);
    row.innerHTML = `<span>${index + 1}. ${option.label}</span><small>${votes} · ${percent}%</small>`;
    row.addEventListener("click", () => {
      if (!currentUser) return;
      const changed = togglePollVote(message, option.id, currentUser.id);
      if (!changed) return;
      if (typeof onChanged === "function") onChanged();
    });
    wrap.appendChild(row);
  });
  const foot = document.createElement("div");
  foot.className = "message-poll__meta";
  foot.textContent = `${total} voter${total === 1 ? "" : "s"} · ${poll.allowsMulti ? "multi-choice" : "single-choice"}${poll.closed ? " · closed" : ""}`;
  if (canManagePollMessage(message, { isDm, canManageMessages, currentUser })) {
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "message-poll__close";
    closeBtn.textContent = poll.closed ? "Reopen poll" : "Close poll";
    closeBtn.addEventListener("click", () => {
      message.poll = { ...poll, closed: !poll.closed };
      if (typeof onChanged === "function") onChanged();
    });
    foot.appendChild(closeBtn);
  }
  wrap.appendChild(foot);
  container.appendChild(wrap);
}

function addSystemMessage(channel, text) {
  channel.messages.push({
    id: createId(),
    userId: null,
    authorName: "system",
    text,
    ts: new Date().toISOString(),
    reactions: [],
    attachments: []
  });
}

function addSystemDmMessageByPeerJid(peerJid, text) {
  const bare = xmppBareJid(peerJid);
  if (!bare) return false;
  let thread = findXmppDmThreadByPeerJid(bare);
  if (!thread) {
    const current = getCurrentAccount();
    const peer = ensureAccountByXmppJid(bare, bare.split("@")[0] || "xmpp");
    if (!current || !peer) return false;
    thread = getOrCreateDmThread(current, peer);
  }
  if (!thread || !Array.isArray(thread.messages) || !text) return false;
  thread.messages.push({
    id: createId(),
    userId: null,
    authorName: "system",
    text: (text || "").toString().slice(0, 480),
    ts: new Date().toISOString(),
    reactions: [],
    attachments: []
  });
  return true;
}

function refreshDmUiForPeerJid(peerJid) {
  const bare = xmppBareJid(peerJid);
  if (!bare) return;
  renderDmList();
  const activeConversation = getActiveConversation();
  if (activeConversation?.type !== "dm") return;
  const activePeer = xmppPeerJidForDmThread(activeConversation.thread, getCurrentAccount());
  if (xmppBareJid(activePeer) !== bare) return;
  renderMessages();
}

function ensureScheduledMessagesStore() {
  if (!Array.isArray(state.scheduledMessages)) {
    state.scheduledMessages = [];
  }
  state.scheduledMessages = normalizeScheduledMessages(state.scheduledMessages);
  return state.scheduledMessages;
}

function parseScheduleWhen(rawWhen) {
  const cleaned = (rawWhen || "").trim().toLowerCase();
  if (!cleaned) return 0;
  const rel = cleaned.match(/^(\d{1,5})\s*([smhd])$/i);
  if (rel) {
    const amount = Number(rel[1]);
    const unit = rel[2].toLowerCase();
    const factor = unit === "s" ? 1000 : unit === "m" ? 60000 : unit === "h" ? 3600000 : 86400000;
    return Date.now() + (amount * factor);
  }
  const parsed = Date.parse(rawWhen);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatRelativeMs(targetMs) {
  const delta = targetMs - Date.now();
  if (delta <= 0) return "due now";
  const sec = Math.ceil(delta / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.ceil(sec / 60);
  if (min < 60) return `${min}m`;
  const hour = Math.ceil(min / 60);
  if (hour < 48) return `${hour}h`;
  const day = Math.ceil(hour / 24);
  return `${day}d`;
}

function queueScheduledMessage(conversation, account, whenRaw, textBody) {
  const whenMs = parseScheduleWhen(whenRaw);
  if (!whenMs || whenMs < Date.now() + 2000) return { ok: false, error: "Choose a time at least 2s in the future." };
  const messageText = trimTextForConversation((textBody || "").toString().trim(), conversation);
  if (!messageText) return { ok: false, error: "Scheduled message cannot be empty." };
  const queue = ensureScheduledMessagesStore();
  const entry = {
    id: createId(),
    conversationType: conversation.type === "dm" ? "dm" : "channel",
    conversationId: conversation.id,
    guildId: conversation.type === "channel" ? (getActiveGuild()?.id || "") : "",
    authorId: account.id,
    text: messageText,
    createdAt: new Date().toISOString(),
    sendAt: new Date(whenMs).toISOString(),
    replyTo: replyTarget && replyTarget.channelId === conversation.id
      ? {
          messageId: replyTarget.messageId,
          authorName: replyTarget.authorName,
          text: replyTarget.text,
          threadId: replyTarget.threadId || null
        }
      : null
  };
  queue.push(entry);
  queue.sort((a, b) => toTimestampMs(a.sendAt) - toTimestampMs(b.sendAt));
  return { ok: true, entry };
}

function listScheduledMessagesForConversation(conversationId) {
  const queue = ensureScheduledMessagesStore();
  return queue
    .filter((entry) => entry.conversationId === conversationId)
    .sort((a, b) => toTimestampMs(a.sendAt) - toTimestampMs(b.sendAt));
}

function removeScheduledMessageByToken(conversationId, token) {
  const queue = ensureScheduledMessagesStore();
  if (!token) return 0;
  const cleaned = token.toLowerCase();
  if (cleaned === "all") {
    const keep = queue.filter((entry) => entry.conversationId !== conversationId);
    const removed = queue.length - keep.length;
    state.scheduledMessages = keep;
    return removed;
  }
  if (cleaned === "last") {
    for (let i = queue.length - 1; i >= 0; i -= 1) {
      if (queue[i].conversationId !== conversationId) continue;
      queue.splice(i, 1);
      return 1;
    }
    return 0;
  }
  const index = queue.findIndex((entry) => (
    entry.conversationId === conversationId
    && (entry.id === token || entry.id.startsWith(token))
  ));
  if (index < 0) return 0;
  queue.splice(index, 1);
  return 1;
}

function runScheduledDispatch() {
  const queue = ensureScheduledMessagesStore();
  if (queue.length === 0) return false;
  const now = Date.now();
  const due = queue.filter((entry) => toTimestampMs(entry.sendAt) <= now);
  if (due.length === 0) return false;
  let changed = false;
  due.forEach((entry) => {
    const author = getAccountById(entry.authorId);
    if (!author) {
      changed = true;
      return;
    }
    if (entry.conversationType === "dm") {
      const thread = state.dmThreads.find((candidate) => candidate.id === entry.conversationId);
      if (!thread) {
        changed = true;
        return;
      }
      thread.messages.push({
        id: createId(),
        userId: author.id,
        authorName: "",
        text: entry.text,
        ts: new Date().toISOString(),
        reactions: [],
        attachments: [],
        replyTo: entry.replyTo || null
      });
      changed = true;
      return;
    }
    const channel = findChannelById(entry.conversationId);
    if (!channel) {
      changed = true;
      return;
    }
    const nextMessage = {
      id: createId(),
      userId: author.id,
      authorName: "",
      text: entry.text,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: [],
      replyTo: entry.replyTo || null
    };
    if (channel.type === "forum") {
      if (entry.replyTo?.threadId) {
        nextMessage.forumThreadId = entry.replyTo.threadId;
        nextMessage.forumParentId = entry.replyTo.messageId || entry.replyTo.threadId;
      } else {
        const [firstLine, ...rest] = entry.text.split("\n");
        nextMessage.forumTitle = (firstLine || "Untitled Post").trim().slice(0, 100) || "Untitled Post";
        nextMessage.text = rest.join("\n").trim();
      }
    }
    channel.messages.push(nextMessage);
    changed = true;
  });
  state.scheduledMessages = queue.filter((entry) => toTimestampMs(entry.sendAt) > now);
  if (changed) {
    saveState();
    safeRender("scheduled-dispatch");
  }
  return changed;
}

function ensureScheduledDispatchTimer() {
  if (scheduledDispatchTimer) return;
  scheduledDispatchTimer = window.setInterval(() => {
    runScheduledDispatch();
  }, 1000);
}

function parseRollExpression(arg) {
  const cleaned = (arg || "").trim().toLowerCase();
  if (!cleaned) return { count: 1, sides: 6, label: "1d6" };
  const direct = Number(cleaned);
  if (Number.isInteger(direct) && direct >= 2 && direct <= 1000) {
    return { count: 1, sides: direct, label: `1d${direct}` };
  }
  const match = cleaned.match(/^(\d{1,2})d(\d{1,4})$/i);
  if (!match) return null;
  const count = Number(match[1]);
  const sides = Number(match[2]);
  if (!Number.isInteger(count) || !Number.isInteger(sides)) return null;
  if (count < 1 || count > 30 || sides < 2 || sides > 1000) return null;
  return { count, sides, label: `${count}d${sides}` };
}

function parseTimestampArg(arg) {
  const cleaned = (arg || "").trim();
  if (!cleaned || cleaned.toLowerCase() === "now") {
    return Math.floor(Date.now() / 1000);
  }
  if (/^\d{10,13}$/.test(cleaned)) {
    const raw = Number(cleaned);
    if (!Number.isFinite(raw)) return null;
    return cleaned.length === 13 ? Math.floor(raw / 1000) : raw;
  }
  const parsed = Date.parse(cleaned);
  if (!Number.isFinite(parsed)) return null;
  return Math.floor(parsed / 1000);
}
