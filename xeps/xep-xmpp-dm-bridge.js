/*
 * XMPP DM/delivery/presence helpers extracted from app.js.
 * Functions here intentionally bind to app globals at call time.
 */

function ensureDmReadState(thread) {
  if (!thread || (thread.readState && typeof thread.readState === "object")) return;
  thread.readState = {};
}

function newestMessageTimestampIso(messages = []) {
  if (!Array.isArray(messages) || messages.length === 0) return new Date().toISOString();
  let newestMs = 0;
  messages.forEach((message) => {
    const ms = toTimestampMs(message?.ts || "");
    if (ms > newestMs) newestMs = ms;
  });
  if (newestMs > 0) return new Date(newestMs).toISOString();
  const fallbackMs = toTimestampMs(messages[messages.length - 1]?.ts || "");
  if (fallbackMs > 0) return new Date(fallbackMs).toISOString();
  return new Date().toISOString();
}

function markDmRead(thread, accountId) {
  if (!thread || !accountId) return false;
  ensureDmReadState(thread);
  const newestTs = newestMessageTimestampIso(thread.messages);
  const currentMs = toTimestampMs(thread.readState[accountId]);
  const nextMs = toTimestampMs(newestTs);
  if (nextMs <= currentMs) return false;
  thread.readState[accountId] = newestTs;
  maybePublishXmppDisplayedMarkerForDmThread(thread, accountId, { trigger: "mark-read" });
  return true;
}

function dmPeerAccountForThread(thread, accountId) {
  if (!thread || !accountId || !Array.isArray(thread.participantIds)) return null;
  const ownId = accountId.toString();
  const peerId = thread.participantIds.find((id) => id && id.toString() !== ownId);
  return peerId ? getAccountById(peerId) : null;
}

function latestOwnXmppDmDeliveryMessage(thread, accountId) {
  if (!thread || !accountId || !Array.isArray(thread.messages)) return null;
  const ownId = accountId.toString();
  for (let i = thread.messages.length - 1; i >= 0; i -= 1) {
    const message = thread.messages[i];
    if (!message) continue;
    if ((message.userId || "").toString() !== ownId) continue;
    const deliveryState = (message.xmppDeliveryState || "").toString().toLowerCase();
    if (!["sent", "delivered", "read"].includes(deliveryState)) continue;
    return message;
  }
  return null;
}

function latestOwnXmppReadDmMessageId(thread, accountId) {
  const message = latestOwnXmppDmDeliveryMessage(thread, accountId);
  if (!message) return "";
  const deliveryState = (message.xmppDeliveryState || "").toString().toLowerCase();
  if (deliveryState !== "read") return "";
  return (message.id || "").toString().trim();
}

function formatDmDeliverySummaryForComposer(thread, accountId) {
  const message = latestOwnXmppDmDeliveryMessage(thread, accountId);
  if (!message) return "";
  const deliveryState = (message.xmppDeliveryState || "").toString().toLowerCase();
  if (deliveryState === "read") {
    const readAt = (message.xmppReadAt || message.xmppDeliveryAt || "").toString().trim();
    if (!readAt) return "Seen";
    return `Seen ${formatTime(readAt)}`;
  }
  if (deliveryState === "delivered") return "Delivered";
  if (deliveryState === "sent") return "Sent";
  return "";
}

function dmDeliveryBadgeMetaForList(message) {
  const deliveryState = (message?.xmppDeliveryState || "").toString().toLowerCase();
  if (deliveryState === "read") {
    const stamp = (message?.xmppReadAt || message?.xmppDeliveryAt || "").toString().trim();
    return {
      state: "read",
      label: "Read",
      prefix: "✓✓ Read",
      title: stamp ? `Read ${formatFullTimestamp(stamp)}` : "Read by peer"
    };
  }
  if (deliveryState === "delivered") {
    const stamp = (message?.xmppDeliveryAt || "").toString().trim();
    return {
      state: "delivered",
      label: "✓✓",
      prefix: "✓✓",
      title: stamp ? `Delivered ${formatFullTimestamp(stamp)}` : "Delivered"
    };
  }
  if (deliveryState === "sent") {
    return {
      state: "sent",
      label: "✓",
      prefix: "✓",
      title: "Sent (waiting for delivery receipt)"
    };
  }
  return null;
}

function latestIncomingDmMessageTimestamp(thread, accountId) {
  if (!thread || !accountId || !Array.isArray(thread.messages)) return "";
  const ownId = accountId.toString();
  for (let i = thread.messages.length - 1; i >= 0; i -= 1) {
    const message = thread.messages[i];
    if (!message) continue;
    if ((message.userId || "").toString() === ownId) continue;
    const stamp = (message.ts || "").toString().trim();
    if (stamp) return stamp;
  }
  return "";
}

function formatRelativeTimeAgoShort(iso) {
  const stampMs = toTimestampMs(iso);
  if (!stampMs) return "";
  const diffMs = Math.max(0, Date.now() - stampMs);
  if (diffMs < 45_000) return "just now";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 30) return `${days}d ago`;
  return formatTime(iso);
}

function accountXmppLastActiveTimestamp(account, fallbackIso = "") {
  const candidates = [
    account?.xmppLastActiveAt || "",
    account?.xmppIdleSince || "",
    fallbackIso || ""
  ]
    .map((value) => {
      const ms = toTimestampMs(value);
      if (!ms) return null;
      return new Date(ms).toISOString();
    })
    .filter(Boolean);
  if (candidates.length === 0) return "";
  let newest = candidates[0];
  let newestMs = toTimestampMs(newest);
  for (let i = 1; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    const candidateMs = toTimestampMs(candidate);
    if (candidateMs > newestMs) {
      newest = candidate;
      newestMs = candidateMs;
    }
  }
  return newest;
}

function accountXmppPresenceMeta(account, { fallbackLastActive = "" } = {}) {
  const bareJid = accountBareXmppJid(account);
  if (!bareJid) {
    return { text: "", title: "", needsRefresh: false };
  }
  const presence = normalizePresence(account?.presence || "online");
  const idleSince = toTimestampMs(account?.xmppIdleSince || "")
    ? new Date(toTimestampMs(account.xmppIdleSince || "")).toISOString()
    : "";
  const lastActive = accountXmppLastActiveTimestamp(account, fallbackLastActive || "");
  const parts = [`XMPP ${bareJid}`];
  const titleParts = [`JID ${bareJid}`];
  let needsRefresh = false;
  if (presence === "idle") {
    const source = idleSince || lastActive;
    const relative = formatRelativeTimeAgoShort(source);
    if (relative) {
      parts.push(`Idle ${relative}`);
      needsRefresh = true;
    } else {
      parts.push("Idle");
    }
    if (source) titleParts.push(`Idle since ${formatFullTimestamp(source)}`);
  } else if (presence === "invisible") {
    const relative = formatRelativeTimeAgoShort(lastActive);
    if (relative) {
      parts.push(`Last active ${relative}`);
      needsRefresh = true;
    } else {
      parts.push("Offline");
    }
    if (lastActive) titleParts.push(`Last active ${formatFullTimestamp(lastActive)}`);
  } else {
    parts.push(presenceLabel(presence));
    if (lastActive) titleParts.push(`Last active ${formatFullTimestamp(lastActive)}`);
  }
  return {
    text: parts.join(" · "),
    title: titleParts.join(" · "),
    needsRefresh
  };
}

function clearPopoutPresenceRefreshTimer() {
  if (popoutPresenceRefreshTimer) {
    clearTimeout(popoutPresenceRefreshTimer);
    popoutPresenceRefreshTimer = null;
  }
}

function schedulePopoutPresenceRefresh() {
  clearPopoutPresenceRefreshTimer();
  const userOpen = Boolean(ui.userPopoutDialog?.open && selectedUserPopoutId);
  const selfOpen = Boolean(ui.selfMenuDialog?.open);
  const shouldRefresh = (userOpen && userPopoutXmppNeedsRefresh) || (selfOpen && selfPopoutXmppNeedsRefresh);
  if (!shouldRefresh) return;
  popoutPresenceRefreshTimer = setTimeout(() => {
    popoutPresenceRefreshTimer = null;
    if (ui.selfMenuDialog?.open) renderSelfPopout();
    if (ui.userPopoutDialog?.open) {
      const selected = selectedUserPopoutId ? getAccountById(selectedUserPopoutId) : null;
      const fallbackName = ui.userPopoutName?.textContent || "Unknown";
      renderUserPopout(selected, fallbackName, {
        focusQuickDm: false,
        resetQuickDmInput: false,
        refreshPrivateFields: false
      });
    }
  }, POPOUT_PRESENCE_REFRESH_MS);
}

function dmHeaderStatusMeta(thread, accountId, { typingSummary = "" } = {}) {
  const summary = (typingSummary || "").toString().trim();
  if (summary) return { text: summary, needsRefresh: false };
  const peer = dmPeerAccountForThread(thread, accountId);
  if (!peer) return { text: "Direct Message", needsRefresh: false };
  const resolvedStatus = resolveAccountStatus(peer, null);
  const hasCustomStatus = Boolean((resolvedStatus.text || "").toString().trim());
  const presence = normalizePresence(peer.presence || "online");
  const parts = [];
  const primaryStatus = displayStatus(peer, null);
  if (primaryStatus) parts.push(primaryStatus);
  if (hasCustomStatus) {
    const presenceText = presenceLabel(peer.presence);
    if (presenceText) parts.push(presenceText);
  }
  let needsRefresh = false;
  if (presence === "idle" || presence === "invisible") {
    const lastIncomingTs = latestIncomingDmMessageTimestamp(thread, accountId);
    const relative = formatRelativeTimeAgoShort(accountXmppLastActiveTimestamp(peer, lastIncomingTs));
    if (relative) {
      parts.push(`Last active ${relative}`);
      needsRefresh = true;
    }
  }
  if (parts.length === 0) parts.push("Direct Message");
  return {
    text: parts.join(" · "),
    needsRefresh
  };
}

function appendDmSeenIndicator(messageRow, message, peerAccount) {
  if (!(messageRow instanceof HTMLElement) || !message || !peerAccount) return;
  const indicator = document.createElement("div");
  indicator.className = "message-seen-indicator";
  const avatar = document.createElement("span");
  avatar.className = "message-seen-avatar";
  if (peerAccount?.xmppJid) maybeFetchXmppAvatarForJid(peerAccount.xmppJid);
  applyAvatarStyle(avatar, peerAccount, null);
  indicator.appendChild(avatar);
  const label = document.createElement("span");
  label.textContent = "Seen";
  indicator.appendChild(label);
  const seenAt = (message.xmppReadAt || message.xmppDeliveryAt || "").toString().trim();
  indicator.title = seenAt
    ? `Seen at ${formatFullTimestamp(seenAt)}`
    : `Seen by ${displayNameForAccount(peerAccount, null)}`;
  messageRow.appendChild(indicator);
}

function dmParticipantIdentityTokenByAccount(account) {
  if (!account || typeof account !== "object") return "";
  const bareJid = xmppBareJid(account.xmppJid || "");
  if (bareJid) return `xmpp:${bareJid}`;
  const username = normalizeUsername(account.username || "");
  if (username) return `user:${username}`;
  const id = (account.id || "").toString().trim();
  return id ? `id:${id}` : "";
}

function dmParticipantIdentityTokenById(accountId) {
  const account = getAccountById(accountId);
  if (account) return dmParticipantIdentityTokenByAccount(account);
  const id = (accountId || "").toString().trim();
  return id ? `id:${id}` : "";
}

function dmThreadIdentityKeyFromParticipantIds(participantIds) {
  if (!Array.isArray(participantIds) || participantIds.length === 0) return "";
  const tokens = participantIds
    .map((id) => dmParticipantIdentityTokenById(id))
    .filter(Boolean)
    .sort();
  if (tokens.length < 2) return "";
  return tokens.join("|");
}

function dmThreadIdentityKeyFromAccounts(accountA, accountB) {
  const tokens = [dmParticipantIdentityTokenByAccount(accountA), dmParticipantIdentityTokenByAccount(accountB)]
    .filter(Boolean)
    .sort();
  if (tokens.length < 2) return "";
  return tokens.join("|");
}

function mergeDmThreads(target, source) {
  if (!target || !source || target === source) return false;
  let changed = false;
  const targetParticipants = Array.isArray(target.participantIds) ? target.participantIds.filter(Boolean) : [];
  const sourceParticipants = Array.isArray(source.participantIds) ? source.participantIds.filter(Boolean) : [];
  const mergedParticipants = [...new Set([...targetParticipants, ...sourceParticipants])].slice(0, 2);
  if (mergedParticipants.length > 0 && mergedParticipants.join("|") !== targetParticipants.join("|")) {
    target.participantIds = mergedParticipants;
    changed = true;
  }
  ensureDmReadState(target);
  ensureDmReadState(source);
  Object.entries(source.readState || {}).forEach(([accountId, ts]) => {
    const currentMs = toTimestampMs(target.readState?.[accountId]);
    const incomingMs = toTimestampMs(ts);
    if (!Number.isFinite(incomingMs)) return;
    if (!Number.isFinite(currentMs) || incomingMs > currentMs) {
      target.readState[accountId] = new Date(incomingMs).toISOString();
      changed = true;
    }
  });
  const targetMessages = Array.isArray(target.messages) ? target.messages : [];
  if (!Array.isArray(target.messages)) {
    target.messages = targetMessages;
    changed = true;
  }
  const sourceMessages = Array.isArray(source.messages) ? source.messages : [];
  sourceMessages.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    const duplicate = findDuplicateRelayMessage(targetMessages, entry, { history: true });
    if (duplicate) {
      if (mergeRelayMessageEntry(duplicate, entry)) changed = true;
      return;
    }
    insertMessageByTimestamp(targetMessages, entry);
    changed = true;
  });
  return changed;
}

function dedupeDmThreads() {
  if (!Array.isArray(state.dmThreads) || state.dmThreads.length <= 1) return false;
  let changed = false;
  let nextActiveDmId = state.activeDmId;
  const byIdentity = new Map();
  const unique = [];
  state.dmThreads.forEach((thread) => {
    if (!thread || typeof thread !== "object") return;
    const key = dmThreadIdentityKeyFromParticipantIds(thread.participantIds) || `id:${thread.id || createId()}`;
    const existing = byIdentity.get(key);
    if (!existing) {
      byIdentity.set(key, thread);
      unique.push(thread);
      return;
    }
    const merged = mergeDmThreads(existing, thread);
    changed = changed || merged || existing !== thread;
    if (nextActiveDmId === thread.id) nextActiveDmId = existing.id;
  });
  if (!changed) return false;
  state.dmThreads = unique;
  if (nextActiveDmId && !state.dmThreads.some((thread) => thread.id === nextActiveDmId)) {
    nextActiveDmId = state.dmThreads[0]?.id || null;
  }
  state.activeDmId = nextActiveDmId || null;
  return true;
}

function getOrCreateDmThread(accountA, accountB) {
  if (!accountA?.id || !accountB?.id || accountA.id === accountB.id) return null;
  const identityKey = dmThreadIdentityKeyFromAccounts(accountA, accountB);
  let thread = state.dmThreads.find((entry) => {
    if (!Array.isArray(entry.participantIds)) return false;
    return entry.participantIds.includes(accountA.id) && entry.participantIds.includes(accountB.id);
  });
  if (!thread && identityKey) {
    thread = state.dmThreads.find((entry) => dmThreadIdentityKeyFromParticipantIds(entry?.participantIds) === identityKey) || null;
    if (thread) {
      const nextParticipants = [accountA.id, accountB.id];
      if (!thread.participantIds.includes(accountA.id) || !thread.participantIds.includes(accountB.id)) {
        thread.participantIds = nextParticipants;
      }
    }
  }
  if (thread) return thread;
  thread = {
    id: createId(),
    participantIds: [accountA.id, accountB.id],
    readState: {
      [accountA.id]: new Date().toISOString(),
      [accountB.id]: new Date().toISOString()
    },
    messages: []
  };
  state.dmThreads.unshift(thread);
  if (dedupeDmThreads()) {
    const existingById = state.dmThreads.find((entry) => entry.id === thread.id) || null;
    if (existingById) return existingById;
    if (identityKey) {
      const existingByIdentity = state.dmThreads.find((entry) => dmThreadIdentityKeyFromParticipantIds(entry?.participantIds) === identityKey) || null;
      if (existingByIdentity) return existingByIdentity;
    }
  }
  return thread;
}

function openDmWithAccount(targetAccount) {
  const current = getCurrentAccount();
  if (!current || !targetAccount || current.id === targetAccount.id) return;
  const thread = getOrCreateDmThread(current, targetAccount);
  if (!thread) return;
  state.viewMode = "dm";
  state.activeDmId = thread.id;
  state.preferences = getPreferences();
  state.preferences.mobilePane = "chat";
  saveState();
  render();
}

function resolveOrCreateDmTarget(identity, { displayName = "" } = {}) {
  const raw = (identity || "").toString().trim();
  if (!raw) return null;
  if (looksLikeCompleteJid(raw)) {
    return ensureAccountByXmppJid(raw, displayName || raw.split("@")[0] || "");
  }
  const normalized = normalizeUsername(raw);
  if (!normalized) return null;
  let target = getAccountByUsername(normalized);
  if (!target) {
    target = createAccount(normalized, displayName || normalized);
    state.accounts.push(target);
    return target;
  }
  if (displayName) {
    target.displayName = displayName.toString().trim().slice(0, 32) || target.displayName;
  }
  return target;
}

function resolveAccountByIdentityToken(identity, { includeSelf = false } = {}) {
  const current = getCurrentAccount();
  const raw = (identity || "").toString().trim();
  if (!raw) return null;
  const token = raw.replace(/^@+/, "");
  if (!token) return null;

  let target = null;
  if (looksLikeCompleteJid(token)) {
    const bare = xmppBareJid(token);
    target = state.accounts.find((entry) => xmppBareJid(entry?.xmppJid || "") === bare) || null;
  } else {
    const normalized = normalizeUsername(token);
    if (normalized) {
      target = state.accounts.find((entry) => normalizeUsername(entry?.username || "") === normalized) || null;
    }
    if (!target) {
      const lowered = token.toLowerCase();
      target = state.accounts.find((entry) => (entry?.displayName || "").toString().toLowerCase() === lowered) || null;
    }
    if (!target) {
      const lowered = token.toLowerCase();
      target = state.accounts.find((entry) => (
        (entry?.displayName || "").toString().toLowerCase().startsWith(lowered)
      )) || null;
    }
  }
  if (!target) return null;
  if (!includeSelf && current?.id && target.id === current.id) return null;
  return target;
}

function openDmByIdentity(identity, { displayName = "" } = {}) {
  const current = getCurrentAccount();
  if (!current) return null;
  const target = resolveOrCreateDmTarget(identity, { displayName });
  if (!target || target.id === current.id) return null;
  openDmWithAccount(target);
  return target;
}

function openAddFriendDialog(initialIdentity = "") {
  if (!ui.addFriendDialog) return;
  const seed = (initialIdentity || "").toString().trim().slice(0, 120);
  if (ui.addFriendIdentityInput) ui.addFriendIdentityInput.value = seed;
  if (ui.addFriendDisplayInput) {
    if (looksLikeCompleteJid(seed)) {
      ui.addFriendDisplayInput.value = seed.split("@")[0] || "";
    } else {
      ui.addFriendDisplayInput.value = "";
    }
  }
  if (ui.addFriendXmppRequestInput) ui.addFriendXmppRequestInput.checked = true;
  if (!ui.addFriendDialog.open) ui.addFriendDialog.showModal();
  requestAnimationFrame(() => {
    ui.addFriendIdentityInput?.focus();
    ui.addFriendIdentityInput?.select?.();
  });
}

function requestXmppRosterSubscription(targetAccount, { nameHint = "" } = {}) {
  const targetJid = normalizeXmppJid(targetAccount?.xmppJid || "").toLowerCase();
  if (!targetJid) return false;
  if (!xmppConnection || relayStatus !== "connected") return false;
  if (!globalThis.$iq || !globalThis.$pres) return false;
  const label = (nameHint || targetAccount?.displayName || targetAccount?.username || targetJid.split("@")[0] || "")
    .toString()
    .trim()
    .slice(0, 64);
  try {
    const iq = globalThis.$iq({ type: "set" })
      .c("query", { xmlns: "jabber:iq:roster" })
      .c("item", { jid: targetJid, name: label });
    xmppConnection.sendIQ(
      iq,
      () => {
        addXmppDebugEvent("iq", "Roster add/update succeeded", { jid: targetJid, name: label });
      },
      () => {
        addXmppDebugEvent("error", "Roster add/update failed", { jid: targetJid, name: label });
      },
      7000
    );
    xmppConnection.send(globalThis.$pres({ to: targetJid, type: "subscribe" }));
    addXmppDebugEvent("presence", "Sent XMPP subscribe request", { jid: targetJid });
    return true;
  } catch (error) {
    addXmppDebugEvent("error", "Failed to send XMPP contact request", {
      jid: targetJid,
      error: String(error?.message || error)
    });
    return false;
  }
}

function sendDirectMessageToAccount(targetAccount, text) {
  const current = getCurrentAccount();
  const body = trimTextForConversation((text || "").trim(), { type: "dm", id: "dm-send" });
  if (!current || !targetAccount || targetAccount.id === current.id || !body) return false;
  const thread = getOrCreateDmThread(current, targetAccount);
  if (!thread) return false;
  thread.messages.push({
    id: createId(),
    userId: current.id,
    authorName: "",
    text: body,
    ts: new Date().toISOString(),
    reactions: [],
    attachments: [],
    replyTo: null
  });
  state.viewMode = "dm";
  state.activeDmId = thread.id;
  state.preferences = getPreferences();
  state.preferences.mobilePane = "chat";
  saveState();
  render();
  return true;
}
