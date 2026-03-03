(function initXepSlashCommandRuntime(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_SLASH_COMMAND_RUNTIME) return;

function handleSlashCommandRuntime(rawText, channel, account) {
  if (!rawText.startsWith("/")) return false;
  const [commandRaw, ...rest] = rawText.slice(1).split(" ");
  const command = (commandRaw || "").toLowerCase();
  const arg = rest.join(" ").trim();
  const conversationId = channel?.id || null;

  if (command === "me") {
    if (!arg) return true;
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: `*${account.displayName || account.username} ${arg}*`,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "shrug") {
    const suffix = arg ? `${arg} ` : "";
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: `${suffix}¯\\_(ツ)_/¯`,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "note") {
    if (!arg) return true;
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: arg,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: [],
      collaborative: true
    });
    return true;
  }

  if (command === "spoiler") {
    if (!arg) {
      addSystemMessage(channel, "Usage: /spoiler <text>");
      return true;
    }
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: `||${arg.slice(0, 340)}||`,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "tableflip") {
    const prefix = arg ? `${arg} ` : "";
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: `${prefix}(ノಠ益ಠ)ノ彡┻━┻`,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "unflip") {
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: "┬─┬ ノ( ゜-゜ノ)",
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "lenny") {
    const suffix = arg ? ` ${arg}` : "";
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: `( ͡° ͜ʖ ͡°)${suffix}`,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "roll") {
    const roll = parseRollExpression(arg);
    if (!roll) {
      addSystemMessage(channel, "Usage: /roll [NdM], e.g. /roll 2d6");
      return true;
    }
    const values = Array.from({ length: roll.count }, () => Math.floor(Math.random() * roll.sides) + 1);
    const total = values.reduce((sum, value) => sum + value, 0);
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: `🎲 rolled ${roll.label}: [${values.join(", ")}] = ${total}`,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "timestamp") {
    const unix = parseTimestampArg(arg);
    if (!unix || unix < 0) {
      addSystemMessage(channel, "Usage: /timestamp [now|unix|date], e.g. /timestamp 2026-02-18 13:30");
      return true;
    }
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: `<t:${unix}:F> (<t:${unix}:R>)`,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "poll") {
    const poll = parsePollFromCommandArg(arg);
    if (!poll) {
      addSystemMessage(channel, "Usage: /poll <question> | <option1> | <option2> [...options]");
      return true;
    }
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: "",
      ts: new Date().toISOString(),
      reactions: [],
      attachments: [],
      poll: {
        ...poll,
        allowsMulti: false,
        createdBy: account.id
      }
    });
    return true;
  }

  if (command === "pollm") {
    const poll = parsePollFromCommandArg(arg);
    if (!poll) {
      addSystemMessage(channel, "Usage: /pollm <question> | <option1> | <option2> [...options]");
      return true;
    }
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: "",
      ts: new Date().toISOString(),
      reactions: [],
      attachments: [],
      poll: {
        ...poll,
        allowsMulti: true,
        createdBy: account.id
      }
    });
    return true;
  }

  if (command === "closepoll") {
    const changed = closeOrOpenLatestPoll(channel, true);
    addSystemMessage(channel, changed ? "Latest poll closed." : "No open poll found.");
    return true;
  }

  if (command === "reopenpoll") {
    const changed = closeOrOpenLatestPoll(channel, false);
    addSystemMessage(channel, changed ? "Latest poll reopened." : "No closed poll found.");
    return true;
  }

  if (command === "pollresults") {
    const pollMessage = findLatestPollMessage(channel);
    if (!pollMessage) {
      addSystemMessage(channel, "No poll found in this channel.");
      return true;
    }
    const includeVoters = arg.toLowerCase() === "voters";
    addSystemMessage(channel, formatPollResultsText(pollMessage, { includeVoters }));
    return true;
  }

  if (command === "vote") {
    const pollMessage = findLatestPollMessage(channel);
    if (!pollMessage) {
      addSystemMessage(channel, "No poll found in this channel.");
      return true;
    }
    const poll = normalizePoll(pollMessage.poll);
    if (!poll || poll.closed) {
      addSystemMessage(channel, "Latest poll is closed.");
      return true;
    }
    const indexes = (arg || "")
      .split(/[,\s]+/)
      .map((part) => Number(part))
      .filter((value) => Number.isInteger(value) && value > 0)
      .map((value) => value - 1);
    const uniqueIndexes = [...new Set(indexes)];
    if (uniqueIndexes.length === 0) {
      addSystemMessage(channel, "Usage: /vote <option-number> (for latest poll)");
      return true;
    }
    if (poll.allowsMulti && uniqueIndexes.length > 1) {
      const optionIds = uniqueIndexes
        .map((index) => poll.options[index]?.id)
        .filter(Boolean);
      if (optionIds.length === 0) {
        addSystemMessage(channel, "Usage: /vote <option-number[,option-number...]>");
        return true;
      }
      const changed = setPollVotesForUser(pollMessage, optionIds, account.id);
      addSystemMessage(channel, changed ? `Voted: ${optionIds.length} option(s).` : "Vote unchanged.");
      return true;
    }
    const option = poll.options[uniqueIndexes[0]];
    if (!option) {
      addSystemMessage(channel, "Usage: /vote <option-number> (for latest poll)");
      return true;
    }
    const changed = togglePollVote(pollMessage, option.id, account.id);
    addSystemMessage(channel, changed ? `Voted: ${option.label}` : "Vote failed.");
    return true;
  }

  if (command === "clear") {
    channel.messages = [];
    addSystemMessage(channel, "Channel history cleared.");
    return true;
  }

  if (command === "markread") {
    const guild = getActiveGuild();
    if (!guild) return true;
    if (arg.toLowerCase() === "all") {
      const changed = markGuildRead(guild, account.id);
      if (changed) addSystemMessage(channel, "Marked all channels in this guild as read.");
    } else {
      const changed = markChannelRead(channel, account.id);
      if (changed) addSystemMessage(channel, "Marked this channel as read.");
    }
    return true;
  }

  if (command === "topic") {
    const topicInput = (arg || "").trim();
    channel.topic = !topicInput || topicInput.toLowerCase() === "clear" ? "" : topicInput.slice(0, 140);
    addSystemMessage(channel, channel.topic ? `Topic updated: ${channel.topic}` : "Topic cleared.");
    return true;
  }

  if (command === "slowmode") {
    if (!canCurrentUser("manageChannels")) {
      addSystemMessage(channel, "You need Manage Channels permission to change slowmode.");
      return true;
    }
    const raw = arg.trim().toLowerCase();
    if (!raw) {
      addSystemMessage(channel, `Current ${formatSlowmodeLabel(getChannelSlowmodeSeconds(channel)).toLowerCase()}.`);
      return true;
    }
    const parsed = raw === "off" ? 0 : normalizeSlowmodeSeconds(raw);
    if (!Number.isFinite(parsed) || (raw !== "off" && !/^\d+$/.test(raw))) {
      addSystemMessage(channel, "Usage: /slowmode <seconds|off>");
      return true;
    }
    channel.slowmodeSec = parsed;
    ensureChannelSlowmodeState(channel);
    addSystemMessage(channel, parsed > 0 ? `Slowmode set to ${parsed}s.` : "Slowmode disabled.");
    return true;
  }

  if (command === "pins") {
    renderPinsDialog();
    ui.pinsDialog.showModal();
    return true;
  }

  if (command === "unpinall") {
    if (!canCurrentUser("manageMessages")) {
      addSystemMessage(channel, "You need Manage Messages permission to unpin all messages.");
      return true;
    }
    let changed = 0;
    channel.messages.forEach((message) => {
      if (!message.pinned) return;
      message.pinned = false;
      changed += 1;
    });
    addSystemMessage(channel, changed > 0 ? `Unpinned ${changed} message${changed === 1 ? "" : "s"}.` : "No pinned messages to unpin.");
    return true;
  }

  if (command === "rename") {
    if (!canCurrentUser("manageChannels")) {
      addSystemMessage(channel, "You need Manage Channels permission to rename channels.");
      return true;
    }
    const nextName = sanitizeChannelName(arg, channel.name || "general");
    if (!nextName) {
      addSystemMessage(channel, "Usage: /rename <channel-name>");
      return true;
    }
    channel.name = nextName;
    addSystemMessage(channel, `Channel renamed to #${nextName}.`);
    return true;
  }

  if (command === "channelinfo") {
    const pinnedCount = channel.messages.filter((message) => message.pinned).length;
    const slowmode = getChannelSlowmodeSeconds(channel);
    const info = [
      `#${channel.name}`,
      `Type: ${channel.type || "text"}`,
      `Topic: ${(channel.topic || "No topic").slice(0, 140)}`,
      `Slowmode: ${slowmode > 0 ? `${slowmode}s` : "off"}`,
      `Messages: ${channel.messages.length}`,
      `Pinned: ${pinnedCount}`
    ];
    addSystemMessage(channel, info.join(" · "));
    return true;
  }

  if (command === "whereami") {
    const guild = getActiveGuild();
    const mode = getViewMode();
    const link = guild ? buildChannelPermalink(guild.id, channel.id) : "";
    addSystemMessage(channel, [
      `Mode: ${mode}`,
      `Guild: ${guild?.name || "n/a"} (${guild?.id || "n/a"})`,
      `Channel: #${channel.name} (${channel.id})`,
      link ? `Link: ${link}` : ""
    ].filter(Boolean).join("\n"));
    return true;
  }

  if (command === "serverinfo") {
    const guild = getActiveGuild();
    if (!guild) {
      addSystemMessage(channel, "No active guild.");
      return true;
    }
    const visibleChannels = (guild.channels || []).filter((entry) => canAccountViewChannel(guild, entry, account.id));
    const totals = getGuildUnreadStats(guild, account);
    const typeCounts = visibleChannels.reduce((acc, entry) => {
      const key = (entry.type || "text").toString();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const typeSummary = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([type, count]) => `${type}:${count}`)
      .join(", ");
    const memberCount = Array.isArray(guild.memberIds) ? guild.memberIds.length : 0;
    addSystemMessage(channel, [
      `${guild.name} (${guild.id})`,
      `Members: ${memberCount} · Roles: ${getServerRoles(guild).length} · Visible Channels: ${visibleChannels.length}`,
      typeSummary ? `Channel Types: ${typeSummary}` : "",
      `Notifications: ${getGuildNotificationMode(guild.id)} · Unread: ${totals.unread} · Mentions: ${totals.mentions}`
    ].filter(Boolean).join("\n"));
    return true;
  }

  if (command === "serverroles") {
    const guild = getActiveGuild();
    if (!guild) {
      addSystemMessage(channel, "No active guild.");
      return true;
    }
    const roles = getServerRoles(guild);
    if (roles.length === 0) {
      addSystemMessage(channel, "No roles configured in this guild.");
      return true;
    }
    const rows = roles.slice(0, 24).map((role, index) => {
      const elevated = Object.entries(role.permissions || {})
        .filter(([, enabled]) => Boolean(enabled))
        .map(([key]) => key);
      const roleColor = (role.color || "#b5bac1").toString();
      const roleId = (role.id || "").toString().slice(0, 8);
      return `${index + 1}. ${role.name || "(unnamed)"}${roleId ? ` [${roleId}]` : ""} · ${roleColor} · ${elevated.length > 0 ? elevated.join(", ") : "no elevated perms"}`;
    });
    if (roles.length > rows.length) rows.push(`…${roles.length - rows.length} more role(s).`);
    addSystemMessage(channel, `Roles (${roles.length}):\n${rows.join("\n")}`);
    return true;
  }

  if (command === "members") {
    const guild = getActiveGuild();
    if (!guild) {
      addSystemMessage(channel, "No active guild.");
      return true;
    }
    const memberIds = [...new Set((guild.memberIds || []).map((id) => (id || "").toString()).filter(Boolean))];
    const members = memberIds
      .map((memberId) => getAccountById(memberId))
      .filter(Boolean)
      .sort((a, b) => (
        displayNameForAccount(a, guild.id).localeCompare(displayNameForAccount(b, guild.id), undefined, { sensitivity: "base" })
      ));
    if (members.length === 0) {
      addSystemMessage(channel, "No members found for this guild.");
      return true;
    }
    const rows = members.slice(0, 24).map((member, index) => {
      const display = displayNameForAccount(member, guild.id);
      const username = `@${member.username || "unknown"}`;
      const showUsername = display.toLowerCase() !== (member.username || "").toLowerCase();
      return `${index + 1}. ${display}${showUsername ? ` (${username})` : ""}`;
    });
    if (members.length > rows.length) rows.push(`…${members.length - rows.length} more member(s).`);
    addSystemMessage(channel, `Members (${members.length}):\n${rows.join("\n")}`);
    return true;
  }

  if (command === "membercount") {
    const guild = getActiveGuild();
    if (!guild) {
      addSystemMessage(channel, "No active guild.");
      return true;
    }
    const memberIds = [...new Set((guild.memberIds || []).map((id) => (id || "").toString()).filter(Boolean))];
    const members = memberIds
      .map((memberId) => getAccountById(memberId))
      .filter(Boolean);
    const online = members.filter((member) => normalizePresence(member.presence || "online") !== "invisible").length;
    const offline = Math.max(0, members.length - online);
    addSystemMessage(channel, `Members: ${members.length} total · ${online} online · ${offline} offline.`);
    return true;
  }

  if (command === "channels") {
    const guild = getActiveGuild();
    if (!guild) {
      addSystemMessage(channel, "No active guild.");
      return true;
    }
    const visibleChannels = (guild.channels || []).filter((entry) => canAccountViewChannel(guild, entry, account.id));
    if (visibleChannels.length === 0) {
      addSystemMessage(channel, "No visible channels in this guild.");
      return true;
    }
    const rows = visibleChannels.slice(0, 30).map((entry, index) => (
      `${index + 1}. ${channelTypePrefix(entry)}${entry.name} · ${(entry.type || "text").toString()}`
    ));
    if (visibleChannels.length > rows.length) rows.push(`…${visibleChannels.length - rows.length} more channel(s).`);
    addSystemMessage(channel, `Channels (${visibleChannels.length}):\n${rows.join("\n")}`);
    return true;
  }

  if (command === "channeltypes") {
    const guild = getActiveGuild();
    if (!guild) {
      addSystemMessage(channel, "No active guild.");
      return true;
    }
    const visibleChannels = (guild.channels || []).filter((entry) => canAccountViewChannel(guild, entry, account.id));
    if (visibleChannels.length === 0) {
      addSystemMessage(channel, "No visible channels in this guild.");
      return true;
    }
    const counts = visibleChannels.reduce((acc, entry) => {
      const key = (entry.type || "text").toString();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const rows = Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([type, count]) => `${type}: ${count}`);
    addSystemMessage(channel, `Channel types (${visibleChannels.length} total): ${rows.join(" · ")}`);
    return true;
  }

  if (command === "jumpunread") {
    const unreadMessageId = findFirstUnreadMessageId(channel, account);
    if (!unreadMessageId) {
      addSystemMessage(channel, "No unread messages in this channel.");
      return true;
    }
    requestAnimationFrame(() => {
      focusMessageById(unreadMessageId);
    });
    return true;
  }

  if (command === "nextunread") {
    const moved = jumpToUnreadGuildChannel(1);
    if (!moved) addSystemMessage(channel, "No other unread channels in this guild.");
    return true;
  }

  if (command === "prevunread") {
    const moved = jumpToUnreadGuildChannel(-1);
    if (!moved) addSystemMessage(channel, "No other unread channels in this guild.");
    return true;
  }

  if (command === "unreadcount") {
    const guild = getActiveGuild();
    if (!guild) return true;
    const totals = getGuildUnreadStats(guild, account);
    addSystemMessage(
      channel,
      `Unread in ${guild.name}: ${totals.unread} message${totals.unread === 1 ? "" : "s"}, ${totals.mentions} mention${totals.mentions === 1 ? "" : "s"}.`
    );
    return true;
  }

  if (command === "mentions") {
    const guild = getActiveGuild();
    const guildMentions = guild ? listMentionGuildChannels(guild, account) : [];
    const guildMentionCount = guildMentions.reduce((sum, entry) => sum + entry.stats.mentions, 0);
    const dmMentionCount = getTotalDmUnreadStats(account).mentions;
    if (guildMentionCount <= 0 && dmMentionCount <= 0) {
      addSystemMessage(channel, "No unread mentions in guild channels or DMs.");
      return true;
    }
    const lines = [];
    if (guild) {
      lines.push(`Guild mentions: ${guildMentionCount} across ${guildMentions.length} channel${guildMentions.length === 1 ? "" : "s"}.`);
      if (guildMentions.length > 0) {
        const top = guildMentions
          .slice(0, 8)
          .map((entry) => `#${entry.channel.name} (${entry.stats.mentions})`);
        lines.push(`Channels: ${top.join(", ")}${guildMentions.length > top.length ? ` +${guildMentions.length - top.length} more` : ""}`);
      }
    }
    lines.push(`DM mentions: ${dmMentionCount}.`);
    addSystemMessage(channel, lines.join("\n"));
    return true;
  }

  if (command === "nextmention") {
    const moved = jumpToMentionGuildChannel(1);
    if (!moved) addSystemMessage(channel, "No other channels with unread mentions.");
    return true;
  }

  if (command === "prevmention") {
    const moved = jumpToMentionGuildChannel(-1);
    if (!moved) addSystemMessage(channel, "No other channels with unread mentions.");
    return true;
  }

  if (command === "drafts") {
    const guild = getActiveGuild();
    const channelDrafts = guild?.channels
      ?.filter((entry) => hasDraftForConversation(entry.id))
      ?.map((entry) => `#${entry.name}`) || [];
    const dmDrafts = state.dmThreads
      .filter((thread) => hasDraftForConversation(thread.id))
      .map((thread) => {
        const peerId = thread.participantIds.find((id) => id !== account.id);
        const peer = peerId ? getAccountById(peerId) : null;
        return peer ? dmPrimaryLabelForAccount(peer) : "(unknown DM)";
      });
    const parts = [];
    if (channelDrafts.length > 0) parts.push(`Channels: ${channelDrafts.join(", ")}`);
    if (dmDrafts.length > 0) parts.push(`DMs: ${dmDrafts.join(", ")}`);
    addSystemMessage(channel, parts.length > 0 ? parts.join("\n") : "No saved drafts.");
    return true;
  }

  if (command === "cleardrafts") {
    const scope = arg.toLowerCase();
    if (scope === "all") {
      state.composerDrafts = {};
      if (conversationId) setComposerDraft(conversationId, "");
      addSystemMessage(channel, "Cleared all saved drafts.");
      renderChannels();
      return true;
    }
    if (conversationId) setComposerDraft(conversationId, "");
    ui.messageInput.value = "";
    resizeComposerInput();
    addSystemMessage(channel, "Cleared draft for this conversation.");
    renderChannels();
    renderComposerMeta();
    return true;
  }

  if (command === "focus") {
    const target = arg.toLowerCase();
    if (!target || target === "search") {
      const input = getViewMode() === "dm" ? ui.dmSearchInput : ui.channelFilterInput;
      input?.focus();
      input?.select?.();
      return true;
    }
    if (target === "composer") {
      ui.messageInput.focus();
      return true;
    }
    addSystemMessage(channel, "Usage: /focus [search|composer]");
    return true;
  }

  if (command === "find") {
    openFindDialogWithQuery(arg);
    return true;
  }

  if (command === "findlinks") {
    openFindDialogWithQuery("has:link");
    return true;
  }

  if (command === "findfrom") {
    const sender = (arg || "").trim();
    if (!sender) {
      addSystemMessage(channel, "Usage: /findfrom <username>");
      return true;
    }
    openFindDialogWithQuery(`from:${sender}`);
    return true;
  }

  if (command === "findtoday") {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    openFindDialogWithQuery(`after:${yyyy}-${mm}-${dd}`);
    return true;
  }

  if (command === "findnext") {
    if (!findQuery.trim()) {
      openFindDialog();
      return true;
    }
    moveFindSelection(1);
    return true;
  }

  if (command === "findprev") {
    if (!findQuery.trim()) {
      openFindDialog();
      return true;
    }
    moveFindSelection(-1);
    return true;
  }

  if (command === "markunread") {
    const conversation = getActiveConversation();
    if (!conversation || !account?.id) return true;
    const bucket = conversation.type === "dm"
      ? (conversation.thread?.messages || [])
      : (conversation.channel?.messages || []);
    if (bucket.length === 0) {
      addSystemMessage(channel, "No messages available to mark unread from.");
      return true;
    }
    const needle = arg.trim().toLowerCase();
    const targetMessage = !needle || needle === "last"
      ? bucket[bucket.length - 1]
      : bucket.find((entry) => (entry.id || "").toLowerCase().startsWith(needle));
    if (!targetMessage) {
      addSystemMessage(channel, "Usage: /markunread [message-id-prefix|last]");
      return true;
    }
    const changed = markConversationUnreadFromMessage(conversation, targetMessage.id, account.id);
    if (!changed) {
      addSystemMessage(channel, "Could not mark unread from that message.");
      return true;
    }
    saveState();
    renderServers();
    renderDmList();
    renderChannels();
    renderMessages();
    showToast(`Marked unread from ${targetMessage.id.slice(0, 8)}.`);
    return true;
  }

  if (command === "newdm") {
    const rawIdentity = (arg || "").toString().trim();
    if (!rawIdentity) {
      addSystemMessage(channel, "Usage: /newdm <username-or-jid>");
      return true;
    }
    const target = openDmByIdentity(rawIdentity);
    if (!target) {
      addSystemMessage(channel, "Could not open DM (invalid username/JID or self).");
      return true;
    }
    return true;
  }

  if (command === "closedm") {
    if (getViewMode() !== "dm" || !state.activeDmId) {
      addSystemMessage(channel, "No active DM to close.");
      return true;
    }
    const closingId = state.activeDmId;
    state.dmThreads = state.dmThreads.filter((entry) => entry.id !== closingId);
    state.activeDmId = null;
    saveState();
    render();
    return true;
  }

  if (command === "listdms") {
    const threads = getSortedDmThreadsForAccount(account);
    if (threads.length === 0) {
      addSystemMessage(channel, "No DM threads yet.");
      return true;
    }
    const rows = threads.slice(0, 20).map((thread, index) => {
      const peer = dmPeerAccountForThread(thread, account.id);
      const label = peer ? dmPrimaryLabelForAccount(peer) : "(unknown DM)";
      const unread = getDmUnreadStats(thread, account);
      const unreadText = unread.unread > 0
        ? `${unread.unread} unread${unread.mentions > 0 ? `, ${unread.mentions} mention${unread.mentions === 1 ? "" : "s"}` : ""}`
        : "read";
      const lastTs = thread.messages?.[thread.messages.length - 1]?.ts || "";
      const active = getViewMode() === "dm" && state.activeDmId === thread.id ? "active" : "";
      return `${index + 1}. ${label} · ${unreadText}${lastTs ? ` · ${formatFullTimestamp(lastTs)}` : ""}${active ? ` · ${active}` : ""}`;
    });
    if (threads.length > rows.length) rows.push(`…${threads.length - rows.length} more DM(s).`);
    addSystemMessage(channel, `DMs (${threads.length}):\n${rows.join("\n")}`);
    return true;
  }

  if (command === "dmnext") {
    const moved = cycleActiveDmThread(1);
    if (!moved) addSystemMessage(channel, "No other DM threads.");
    return true;
  }

  if (command === "dmprev") {
    const moved = cycleActiveDmThread(-1);
    if (!moved) addSystemMessage(channel, "No other DM threads.");
    return true;
  }

  if (command === "leaveguild") {
    if (getViewMode() !== "guild") {
      addSystemMessage(channel, "Switch to a guild channel to use /leaveguild.");
      return true;
    }
    const guild = getActiveGuild();
    if (!guild || state.guilds.length <= 1) {
      addSystemMessage(channel, "You cannot leave the last remaining guild.");
      return true;
    }
    const accountId = account.id;
    guild.memberIds = (guild.memberIds || []).filter((id) => id !== accountId);
    if (guild.memberRoles && typeof guild.memberRoles === "object") delete guild.memberRoles[accountId];
    if (guild.memberIds.length === 0) {
      removeGuildFromFolders(guild.id);
      state.guilds = state.guilds.filter((entry) => entry.id !== guild.id);
    }
    const nextGuild = state.guilds.find((entry) => entry.id !== guild.id) || state.guilds[0] || null;
    state.activeGuildId = nextGuild?.id || null;
    state.activeChannelId = nextGuild?.channels?.[0]?.id || null;
    state.viewMode = "guild";
    state.activeDmId = null;
    saveState();
    render();
    return true;
  }

  if (command === "newchannel") {
    if (!canCurrentUser("manageChannels")) {
      notifyPermissionDenied("Manage Channels");
      return true;
    }
    const guild = getActiveGuild();
    if (!guild) return true;
    const parts = arg.split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      addSystemMessage(channel, "Usage: /newchannel <name> [text|announcement|forum|media|voice|stage]");
      return true;
    }
    const maybeType = (parts[parts.length - 1] || "").toLowerCase();
    const allowedTypes = new Set(["text", "announcement", "forum", "media", "voice", "stage"]);
    const type = allowedTypes.has(maybeType) ? maybeType : "text";
    const namePart = allowedTypes.has(maybeType) ? parts.slice(0, -1).join("-") : parts.join("-");
    const next = {
      id: createId(),
      name: sanitizeChannelName(namePart, "new-channel"),
      type,
      topic: "",
      forumTags: [],
      permissionOverrides: {},
      voiceState: createVoiceState(),
      readState: state.currentAccountId ? { [state.currentAccountId]: new Date().toISOString() } : {},
      slowmodeSec: 0,
      slowmodeState: {},
      messages: []
    };
    guild.channels.push(next);
    state.activeChannelId = next.id;
    saveState();
    render();
    return true;
  }

  if (command === "dupchannel") {
    if (!canCurrentUser("manageChannels")) {
      notifyPermissionDenied("Manage Channels");
      return true;
    }
    const guild = getActiveGuild();
    if (!guild) return true;
    const clone = duplicateChannelInGuild(guild, channel);
    if (!clone) return true;
    state.activeChannelId = clone.id;
    saveState();
    render();
    return true;
  }

  if (command === "movechannel") {
    if (!canCurrentUser("manageChannels")) {
      notifyPermissionDenied("Manage Channels");
      return true;
    }
    const guild = getActiveGuild();
    if (!guild) return true;
    const direction = arg.toLowerCase();
    let moved = false;
    if (direction === "up") moved = moveChannelByOffset(guild, channel.id, -1);
    else if (direction === "down") moved = moveChannelByOffset(guild, channel.id, 1);
    else if (direction === "top") {
      while (moveChannelByOffset(guild, channel.id, -1)) moved = true;
    } else if (direction === "bottom") {
      while (moveChannelByOffset(guild, channel.id, 1)) moved = true;
    } else {
      addSystemMessage(channel, "Usage: /movechannel <up|down|top|bottom>");
      return true;
    }
    if (!moved) {
      addSystemMessage(channel, "Channel already at requested position.");
      return true;
    }
    saveState();
    renderChannels();
    return true;
  }

  if (command === "markdmread") {
    const dm = getActiveDmThread();
    if (!dm) {
      addSystemMessage(channel, "No active DM thread.");
      return true;
    }
    const changed = markDmRead(dm, account.id);
    if (!changed) {
      addSystemMessage(channel, "DM already read.");
      return true;
    }
    saveState();
    render();
    return true;
  }

  if (command === "markallread") {
    const changed = markAllReadForAccount(account.id);
    if (!changed) {
      addSystemMessage(channel, "Everything is already read.");
      return true;
    }
    saveState();
    render();
    return true;
  }

  if (command === "markmentionsread") {
    const guild = getActiveGuild();
    if (!guild) {
      addSystemMessage(channel, "No active guild.");
      return true;
    }
    const mentionChannels = listMentionGuildChannels(guild, account);
    if (mentionChannels.length === 0) {
      addSystemMessage(channel, "No guild channels with unread mentions.");
      return true;
    }
    let changed = 0;
    mentionChannels.forEach((entry) => {
      if (markChannelRead(entry.channel, account.id)) changed += 1;
    });
    if (changed === 0) {
      addSystemMessage(channel, "No guild channels were updated.");
      return true;
    }
    saveState();
    renderServers();
    renderChannels();
    renderMessages();
    addSystemMessage(channel, `Marked ${changed} mention channel${changed === 1 ? "" : "s"} as read.`);
    return true;
  }

  if (command === "markdmmentionsread") {
    let changed = 0;
    state.dmThreads.forEach((thread) => {
      if (!Array.isArray(thread.participantIds) || !thread.participantIds.includes(account.id)) return;
      const stats = getDmUnreadStats(thread, account);
      if (stats.mentions <= 0) return;
      if (markDmRead(thread, account.id)) changed += 1;
    });
    if (changed === 0) {
      addSystemMessage(channel, "No DM threads with unread mentions.");
      return true;
    }
    saveState();
    renderDmList();
    renderServers();
    renderChannels();
    renderMessages();
    addSystemMessage(channel, `Marked ${changed} DM thread${changed === 1 ? "" : "s"} with mentions as read.`);
    return true;
  }

  if (command === "copylink") {
    const conversation = getActiveConversation();
    if (!conversation) return true;
    const link = conversation.type === "channel"
      ? buildChannelPermalink(getActiveGuild()?.id || "", conversation.channel.id)
      : buildMessagePermalink(conversation.thread.id, "");
    void copyText(link).then((ok) => {
      addSystemMessage(channel, ok ? "Copied current link." : "Failed to copy link.");
    });
    return true;
  }

  if (command === "copyid") {
    const conversation = getActiveConversation();
    if (!conversation) return true;
    const id = conversation.type === "channel" ? conversation.channel.id : conversation.thread.id;
    void copyText(id).then((ok) => {
      addSystemMessage(channel, ok ? "Copied current ID." : "Failed to copy ID.");
    });
    return true;
  }

  if (command === "copytopic") {
    const topic = (channel?.topic || "").toString();
    void copyText(topic).then((ok) => {
      addSystemMessage(channel, ok ? "Copied channel topic." : "Failed to copy topic.");
    });
    return true;
  }

  if (command === "copyguildid") {
    copyTextToChannelWithFeedback(channel, getActiveGuild()?.id || "", {
      successText: "Copied guild ID.",
      emptyText: "No active guild ID to copy.",
      failureText: "Failed to copy guild ID."
    });
    return true;
  }

  if (command === "copyguildname") {
    copyTextToChannelWithFeedback(channel, getActiveGuild()?.name || "", {
      successText: "Copied guild name.",
      emptyText: "No active guild name to copy.",
      failureText: "Failed to copy guild name."
    });
    return true;
  }

  if (command === "copychannelname") {
    copyTextToChannelWithFeedback(channel, channel?.name ? `#${channel.name}` : "", {
      successText: "Copied channel name.",
      emptyText: "No active channel name to copy.",
      failureText: "Failed to copy channel name."
    });
    return true;
  }

  if (command === "copyaccountid") {
    copyTextToChannelWithFeedback(channel, account?.id || "", {
      successText: "Copied account ID.",
      emptyText: "No account ID to copy.",
      failureText: "Failed to copy account ID."
    });
    return true;
  }

  if (command === "copyjid") {
    copyTextToChannelWithFeedback(channel, accountBareXmppJid(account), {
      successText: "Copied XMPP JID.",
      emptyText: "No XMPP JID set for this account.",
      failureText: "Failed to copy XMPP JID."
    });
    return true;
  }

  if (command === "copypresence") {
    copyTextToChannelWithFeedback(channel, normalizePresence(account?.presence || "online"), {
      successText: "Copied presence state.",
      emptyText: "No presence state to copy.",
      failureText: "Failed to copy presence state."
    });
    return true;
  }

  if (command === "copydisplayname") {
    copyTextToChannelWithFeedback(channel, displayNameForAccount(account, getActiveGuild()?.id || null), {
      successText: "Copied display name.",
      emptyText: "No display name to copy.",
      failureText: "Failed to copy display name."
    });
    return true;
  }

  if (command === "copyref") {
    copyTextToChannelWithFeedback(channel, activeConversationReferenceText(), {
      successText: "Copied active conversation reference.",
      emptyText: "No active conversation reference to copy.",
      failureText: "Failed to copy conversation reference."
    });
    return true;
  }

  if (command === "copyroom") {
    copyTextToChannelWithFeedback(channel, relayRoomForActiveConversation(), {
      successText: "Copied relay room token.",
      emptyText: "No relay room token available.",
      failureText: "Failed to copy relay room token."
    });
    return true;
  }

  if (command === "notify") {
    const guild = getActiveGuild();
    if (!guild) {
      addSystemMessage(channel, "No active guild.");
      return true;
    }
    const raw = arg.toLowerCase();
    if (!raw || raw === "status") {
      addSystemMessage(channel, `Guild notifications: ${getGuildNotificationMode(guild.id)}`);
      return true;
    }
    if (!["all", "mentions", "mute"].includes(raw)) {
      addSystemMessage(channel, "Usage: /notify [status|all|mentions|mute]");
      return true;
    }
    setGuildNotificationMode(guild.id, raw);
    addSystemMessage(channel, `Guild notifications set to: ${raw}`);
    renderServers();
    renderChannels();
    return true;
  }

  if (command === "schedule") {
    const splitAt = arg.indexOf("|");
    if (splitAt < 0) {
      addSystemMessage(channel, "Usage: /schedule <when> | <text>");
      return true;
    }
    const whenRaw = arg.slice(0, splitAt).trim();
    const textRaw = arg.slice(splitAt + 1).trim();
    const conversation = getActiveConversation();
    if (!conversation) return true;
    const queued = queueScheduledMessage(conversation, account, whenRaw, textRaw);
    if (!queued.ok) {
      addSystemMessage(channel, queued.error || "Could not schedule message.");
      return true;
    }
    const eta = formatRelativeMs(toTimestampMs(queued.entry.sendAt));
    addSystemMessage(channel, `Scheduled ${queued.entry.id.slice(0, 8)} for ${new Date(queued.entry.sendAt).toLocaleString()} (${eta}).`);
    return true;
  }

  if (command === "scheduled") {
    const conversation = getActiveConversation();
    if (!conversation) return true;
    const rows = listScheduledMessagesForConversation(conversation.id);
    if (rows.length === 0) {
      addSystemMessage(channel, "No scheduled messages in this conversation.");
      return true;
    }
    addSystemMessage(channel, rows.slice(0, 12).map((entry) => (
      `${entry.id.slice(0, 8)} · ${new Date(entry.sendAt).toLocaleString()} · ${entry.text.slice(0, 80)}`
    )).join("\n"));
    return true;
  }

  if (command === "unschedule") {
    if (!arg) {
      addSystemMessage(channel, "Usage: /unschedule <id|last|all>");
      return true;
    }
    const conversation = getActiveConversation();
    if (!conversation) return true;
    const removed = removeScheduledMessageByToken(conversation.id, arg.trim());
    addSystemMessage(channel, removed > 0 ? `Removed ${removed} scheduled message${removed === 1 ? "" : "s"}.` : "No scheduled message matched.");
    return true;
  }

  if (command === "vc" || command === "voice") {
    if (!(channel.type === "voice" || channel.type === "stage")) {
      addSystemMessage(channel, "This command only works in voice/stage channels.");
      return true;
    }
    ensureVoiceStateForChannel(channel);
    const action = (arg || "status").toLowerCase();
    const connected = channel.voiceState.connectedIds.includes(account.id);
    if (action === "status") {
      const muted = channel.voiceState.mutedIds.includes(account.id);
      const speakers = channel.type === "stage" ? channel.voiceState.speakerIds.length : 0;
      const raised = channel.type === "stage" ? channel.voiceState.raisedHandIds.length : 0;
      addSystemMessage(
        channel,
        [
          `Connected: ${connected ? "yes" : "no"}`,
          `Muted: ${muted ? "yes" : "no"}`,
          `Listeners: ${channel.voiceState.connectedIds.length}`,
          channel.type === "stage" ? `Speakers: ${speakers}` : "",
          channel.type === "stage" ? `Queue: ${raised}` : ""
        ].filter(Boolean).join(" · ")
      );
      return true;
    }
    if (action === "join") {
      if (connected) {
        addSystemMessage(channel, "Already connected.");
        return true;
      }
      joinVoiceLikeChannel(channel, account.id);
      addSystemMessage(channel, "Joined channel.");
      renderMemberList();
      renderMessages();
      return true;
    }
    if (action === "leave") {
      if (!connected) {
        addSystemMessage(channel, "Not connected.");
        return true;
      }
      leaveVoiceLikeChannel(channel, account.id);
      addSystemMessage(channel, "Left channel.");
      renderMemberList();
      renderMessages();
      return true;
    }
    if (action === "toggle") {
      const changed = connected
        ? leaveVoiceLikeChannel(channel, account.id)
        : joinVoiceLikeChannel(channel, account.id);
      if (changed) addSystemMessage(channel, connected ? "Left channel." : "Joined channel.");
      renderMemberList();
      renderMessages();
      return true;
    }
    if (action === "mute" || action === "unmute") {
      if (!connected) {
        addSystemMessage(channel, "Join first, then use mute controls.");
        return true;
      }
      const changed = setVoiceMuteState(channel, account.id, action === "mute");
      if (changed) {
        addVoiceActivity(channel, account.id, action);
        addSystemMessage(channel, action === "mute" ? "Muted." : "Unmuted.");
      } else {
        addSystemMessage(channel, action === "mute" ? "Already muted." : "Already unmuted.");
      }
      renderMemberList();
      renderMessages();
      return true;
    }
    addSystemMessage(channel, "Usage: /vc <join|leave|mute|unmute|toggle|status>");
    return true;
  }

  if (typeof XEP_XMPP_COMMAND_RUNTIME_GLOBAL.handleXmppCommandRuntime === "function") {
    const handledXmppRuntime = XEP_XMPP_COMMAND_RUNTIME_GLOBAL.handleXmppCommandRuntime({
      command,
      arg,
      channel,
      account
    });
    if (handledXmppRuntime) return true;
  }

  if (command === "trustdomain") {
    const lowered = arg.toLowerCase();
    if (!arg || lowered === "list") {
      const rules = getPreferences().mediaTrustRules;
      const blocked = getPreferences().mediaDenyRules;
      const trustedText = rules.length > 0 ? `Trusted media rules: ${rules.join(", ")}` : "No trusted media rules.";
      const blockedText = blocked.length > 0 ? `Blocked media rules: ${blocked.join(", ")}` : "No blocked media rules.";
      addSystemMessage(channel, `${trustedText} ${blockedText}`);
      return true;
    }
    const added = addMediaTrustRule(arg);
    if (added) {
      saveState();
      addSystemMessage(channel, `Added media trust rule: ${arg}`);
      renderMessages();
    } else {
      addSystemMessage(channel, `Media trust rule already exists or invalid: ${arg}`);
    }
    return true;
  }

  if (command === "untrustdomain") {
    if (!arg) {
      addSystemMessage(channel, "Usage: /untrustdomain <domain|*.domain|/regex/>");
      return true;
    }
    const removed = removeMediaTrustRule(arg);
    if (!removed) {
      addSystemMessage(channel, `Media trust rule not found: ${arg}`);
      return true;
    }
    saveState();
    addSystemMessage(channel, `Removed media trust rule: ${arg}`);
    renderMessages();
    return true;
  }

  if (command === "blockdomain") {
    if (!arg) {
      addSystemMessage(channel, "Usage: /blockdomain <domain|*.domain|/regex/>");
      return true;
    }
    const added = addMediaDenyRule(arg);
    if (!added) {
      addSystemMessage(channel, `Media block rule already exists or invalid: ${arg}`);
      return true;
    }
    saveState();
    addSystemMessage(channel, `Added media block rule: ${arg}`);
    renderMessages();
    return true;
  }

  if (command === "unblockdomain") {
    if (!arg) {
      addSystemMessage(channel, "Usage: /unblockdomain <domain|*.domain|/regex/>");
      return true;
    }
    const removed = removeMediaDenyRule(arg);
    if (!removed) {
      addSystemMessage(channel, `Media block rule not found: ${arg}`);
      return true;
    }
    saveState();
    addSystemMessage(channel, `Removed media block rule: ${arg}`);
    renderMessages();
    return true;
  }

  if (command === "help") {
    const filter = arg.toLowerCase();
    const entries = filter
      ? SLASH_COMMANDS.filter((entry) => entry.name.includes(filter) || entry.description.toLowerCase().includes(filter))
      : SLASH_COMMANDS;
    const summary = entries
      .map((entry) => `/${entry.name}${entry.args ? ` ${entry.args}` : ""}`)
      .join(", ");
    addSystemMessage(channel, entries.length > 0 ? `Commands: ${summary}` : `No commands match "${arg}".`);
    return true;
  }

  if (command === "shortcuts") {
    openShortcutsDialog();
    return true;
  }

  if (command === "xmppconsole" || command === "xmppinspect") {
    const scoped = applyXmppConsoleScopeArg(arg, { type: "channel", channel }, getCurrentAccount());
    openXmppConsoleDialog();
    addSystemMessage(channel, scoped.message);
    return true;
  }

  if (command === "devtools") {
    if (!requestDevtoolsToggle()) {
      addSystemMessage(channel, "DevTools toggle is only available in the Electron app.");
    }
    return true;
  }

  addSystemMessage(channel, `Unknown command: /${command}`);
  return true;
}

function canEditMessageEntry(message, { isDm = false, canManageMessages = false, currentUser = null } = {}) {
  if (!message || !currentUser) return false;
  if (message.collaborative) return true;
  if (message.userId && message.userId === currentUser.id) return true;
  if (!isDm && canManageMessages) return true;
  return false;
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

function openMessageEditor(conversationId, messageId, messageText) {
  messageEditTarget = { conversationId, messageId };
  const scopedThread = state.dmThreads.find((thread) => thread.id === conversationId) || null;
  const scopedChannel = !scopedThread ? findChannelById(conversationId) : null;
  const scopedConversation = scopedThread
    ? { type: "dm", id: scopedThread.id, thread: scopedThread }
    : scopedChannel
      ? { type: "channel", id: scopedChannel.id, channel: scopedChannel }
      : null;
  const limit = hardLimitForConversation(scopedConversation);
  if (ui.messageEditInput instanceof HTMLTextAreaElement) ui.messageEditInput.maxLength = limit;
  ui.messageEditInput.value = trimTextForConversation(messageText || "", scopedConversation);
  ui.messageEditDialog.showModal();
  requestAnimationFrame(() => {
    ui.messageEditInput.focus();
    ui.messageEditInput.select();
  });
}

function openShortcutsDialog() {
  ui.shortcutsDialog?.showModal();
}

function bindMessageActionHoverState(messageRow, actionBar) {
  if (!(messageRow instanceof HTMLElement) || !(actionBar instanceof HTMLElement)) return;
  const setLocked = (locked) => {
    messageRow.classList.toggle("message--actions-hover", Boolean(locked));
  };
  actionBar.addEventListener("pointerenter", () => {
    setLocked(true);
  });
  actionBar.addEventListener("pointerleave", (event) => {
    const next = event.relatedTarget;
    if (next instanceof Node && actionBar.contains(next)) return;
    if (actionBar.matches(":focus-within")) return;
    setLocked(false);
  });
  actionBar.addEventListener("focusin", () => {
    setLocked(true);
  });
  actionBar.addEventListener("focusout", (event) => {
    const next = event.relatedTarget;
    if (next instanceof Node && actionBar.contains(next)) return;
    if (actionBar.matches(":hover")) return;
    setLocked(false);
  });
  messageRow.addEventListener("mouseleave", () => {
    if (actionBar.matches(":hover") || actionBar.matches(":focus-within")) return;
    setLocked(false);
  });
}

function bindMessageAttachmentControlLock(messageRow) {
  if (!(messageRow instanceof HTMLElement)) return;
  if (messageRow.dataset.controlLockBound === "on") return;
  const controls = [...messageRow.querySelectorAll(
    ".message-video-controls, .message-gif-controls, .message-lottie-controls, .message-pdf-controls, .message-swf-top-controls, .message-swf-audio-rail, .message-gif-hover-btn"
  )].filter((node) => node instanceof HTMLElement);
  if (controls.length === 0) return;
  messageRow.dataset.controlLockBound = "on";
  let releaseTimer = null;
  const clearReleaseTimer = () => {
    if (releaseTimer) {
      clearTimeout(releaseTimer);
      releaseTimer = null;
    }
  };
  const keepLocked = () => {
    if (!messageRow.isConnected) return false;
    const activeAttachment = messageRow.querySelector(
      ".message-attachment--video:hover, .message-attachment--video:focus-within, .message-attachment--gif:hover, .message-attachment--gif:focus-within, .message-attachment--sticker:hover, .message-attachment--sticker:focus-within, .message-attachment--swf:hover, .message-attachment--swf:focus-within, .message-pdf-viewer:hover, .message-pdf-viewer:focus-within"
    );
    if (activeAttachment) return true;
    return controls.some((control) => (
      control.matches(":hover") || control.matches(":focus-within") || control.matches(":active")
    ));
  };
  const lock = () => {
    clearReleaseTimer();
    messageRow.classList.add("message--controls-lock");
  };
  const unlockLater = (delayMs = 240) => {
    clearReleaseTimer();
    releaseTimer = setTimeout(() => {
      releaseTimer = null;
      if (keepLocked()) return;
      messageRow.classList.remove("message--controls-lock");
    }, Math.max(0, Number(delayMs) || 0));
  };
  controls.forEach((control) => {
    control.addEventListener("pointerenter", lock);
    control.addEventListener("pointerdown", lock);
    control.addEventListener("focusin", lock);
    control.addEventListener("pointerleave", () => unlockLater(240));
    control.addEventListener("focusout", () => unlockLater(280));
    control.addEventListener("click", () => unlockLater(280));
  });
  messageRow.addEventListener("mouseleave", () => unlockLater(240));
  messageRow.addEventListener("focusout", () => unlockLater(280));
}

function quickSwitchHaystackForItem(item) {
  return [
    item.label || "",
    item.meta || "",
    item.guildName || "",
    item.username || "",
    item.xmppJid || "",
    item.type || ""
  ].join(" ").toLowerCase();
}

function getQuickSwitchItems(rawQuery = "") {
  const query = (rawQuery || "").trim().toLowerCase();
  const current = getCurrentAccount();
  const items = [];
  state.guilds.forEach((guild) => {
    if (current && !canAccountAccessGuild(guild, current)) return;
    items.push({
      id: `guild:${guild.id}`,
      type: "guild",
      label: guild.name,
      meta: "Guild",
      guildId: guild.id,
      guildName: guild.name
    });
    (guild.channels || []).forEach((channel) => {
      if (current && !canAccountViewChannel(guild, channel, current.id)) return;
      items.push({
        id: `channel:${guild.id}:${channel.id}`,
        type: "channel",
        label: `#${channel.name}`,
        meta: guild.name,
        guildId: guild.id,
        guildName: guild.name,
        channelId: channel.id
      });
    });
  });
  if (current) {
    state.dmThreads
      .filter((thread) => Array.isArray(thread.participantIds) && thread.participantIds.includes(current.id))
      .forEach((thread) => {
        const peerId = thread.participantIds.find((id) => id !== current.id);
        const peer = peerId ? getAccountById(peerId) : null;
        const primary = peer ? dmPrimaryLabelForAccount(peer) : "Unknown DM";
        const secondary = peer ? dmSecondaryLabelForAccount(peer) : "";
        items.push({
          id: `dm:${thread.id}`,
          type: "dm",
          label: primary,
          meta: secondary || "Direct Message",
          threadId: thread.id,
          username: peer?.username || "",
          xmppJid: peer?.xmppJid || ""
        });
      });
  }
  const scored = items
    .map((item) => {
      const haystack = quickSwitchHaystackForItem(item);
      if (!query) return { item, score: 10 };
      if (haystack.startsWith(query)) return { item, score: 0 };
      if (item.label.toLowerCase().startsWith(query)) return { item, score: 1 };
      if (haystack.includes(query)) return { item, score: 4 };
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score || a.item.label.localeCompare(b.item.label))
    .slice(0, 40)
    .map((entry) => entry.item);
  return scored;
}

function activateQuickSwitchItem(item) {
  if (!item) return false;
  if (item.type === "dm" && item.threadId) {
    state.viewMode = "dm";
    state.activeDmId = item.threadId;
    saveState();
    render();
    return true;
  }
  if (item.type === "guild" && item.guildId) {
    return openGuildById(item.guildId);
  }
  if (item.type === "channel" && item.guildId && item.channelId) {
    const guild = state.guilds.find((entry) => entry.id === item.guildId);
    const current = getCurrentAccount();
    const channel = guild?.channels?.find((entry) => entry.id === item.channelId);
    if (!guild || !channel || (current && !canAccountViewChannel(guild, channel, current.id))) return false;
    state.viewMode = "guild";
    state.activeGuildId = guild.id;
    state.activeChannelId = item.channelId;
    state.activeDmId = null;
    rememberGuildChannelSelection(guild.id, item.channelId);
    saveState();
    render();
    return true;
  }
  return false;
}

function renderQuickSwitchList() {
  if (!ui.quickSwitchList) return;
  const items = getQuickSwitchItems(quickSwitchQuery);
  quickSwitchSelectionIndex = Math.max(0, Math.min(quickSwitchSelectionIndex, Math.max(0, items.length - 1)));
  ui.quickSwitchList.innerHTML = "";
  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = "No matches.";
    ui.quickSwitchList.appendChild(empty);
    return;
  }
  items.forEach((item, index) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `quick-switch-item ${index === quickSwitchSelectionIndex ? "active" : ""}`;
    const title = document.createElement("strong");
    title.textContent = item.label;
    const meta = document.createElement("small");
    meta.textContent = item.meta;
    row.appendChild(title);
    row.appendChild(meta);
    row.addEventListener("click", (event) => {
      if (event.button !== 0) return;
      const ok = activateQuickSwitchItem(item);
      if (ok) ui.quickSwitchDialog?.close();
    });
    ui.quickSwitchList.appendChild(row);
  });
}

function openQuickSwitcher() {
  quickSwitchQuery = "";
  quickSwitchSelectionIndex = 0;
  if (ui.quickSwitchInput) ui.quickSwitchInput.value = "";
  renderQuickSwitchList();
  ui.quickSwitchDialog?.showModal();
  requestAnimationFrame(() => {
    ui.quickSwitchInput?.focus();
  });
}

function findLastEditableMessageInActiveConversation() {
  const conversation = getActiveConversation();
  const currentUser = getCurrentAccount();
  if (!conversation || !currentUser) return null;
  const isDm = conversation.type === "dm";
  const canManageMessages = !isDm && canCurrentUser("manageMessages");
  const bucket = isDm ? (conversation.thread?.messages || []) : (conversation.channel?.messages || []);
  for (let i = bucket.length - 1; i >= 0; i -= 1) {
    const candidate = bucket[i];
    if (canEditMessageEntry(candidate, { isDm, canManageMessages, currentUser })) {
      return {
        conversationId: conversation.id,
        messageId: candidate.id,
        text: candidate.text || ""
      };
    }
  }
  return null;
}

function getSlashMatches(inputValue) {
  if (!inputValue.startsWith("/")) return [];
  const term = inputValue.slice(1).split(" ")[0].toLowerCase();
  if (!term) return SLASH_COMMANDS;
  return SLASH_COMMANDS.filter((command) => command.name.startsWith(term));
}

function applySlashCompletion(commandName) {
  ui.messageInput.value = `/${commandName} `;
  slashSelectionIndex = 0;
  renderSlashSuggestions();
}

function getMentionContext(inputValue) {
  const caret = ui.messageInput.selectionStart ?? inputValue.length;
  const beforeCaret = inputValue.slice(0, caret);
  const match = beforeCaret.match(/(^|\s)@([a-z0-9._-]*)$/i);
  if (!match) return null;
  return {
    query: match[2].toLowerCase(),
    tokenStart: caret - match[2].length - 1,
    tokenEnd: caret
  };
}

function getMentionMatches(query) {
  const dm = getActiveDmThread();
  if (dm) {
    return dm.participantIds
      .map((memberId) => getAccountById(memberId))
      .filter(Boolean)
      .filter((account) => {
        const username = account.username.toLowerCase();
        const displayName = (account.displayName || "").toLowerCase();
        return !query || username.startsWith(query) || displayName.startsWith(query);
      })
      .slice(0, 8);
  }
  const server = getActiveServer();
  if (!server) return [];
  const accounts = server.memberIds
    .map((memberId) => getAccountById(memberId))
    .filter(Boolean);
  return accounts
    .filter((account) => {
      const username = account.username.toLowerCase();
      const displayName = (account.displayName || "").toLowerCase();
      const nickname = resolveAccountGuildNickname(account, server.id).toLowerCase();
      return !query || username.startsWith(query) || displayName.startsWith(query) || nickname.startsWith(query);
    })
    .slice(0, 8);
}

function applyMentionCompletion(account) {
  const raw = ui.messageInput.value;
  const context = getMentionContext(raw);
  if (!context) return;
  const prefix = raw.slice(0, context.tokenStart);
  const suffix = raw.slice(context.tokenEnd);
  const next = `${prefix}@${account.username} ${suffix}`.replace(/\s{2,}/g, " ");
  ui.messageInput.value = trimTextForConversation(next, getActiveConversation());
  setComposerDraft(composerDraftConversationId, ui.messageInput.value);
  queueComposerDraftSave();
  mentionSelectionIndex = 0;
  renderSlashSuggestions();
  renderComposerMeta();
}

function getComposerSuggestionState() {
  const raw = ui.messageInput.value;
  const trimmedStart = raw.trimStart();
  const slashFirstChunk = trimmedStart.slice(1);
  const slashHasWhitespace = /\s/.test(slashFirstChunk);
  if (trimmedStart.startsWith("/") && !slashHasWhitespace) {
    const slashMatches = getSlashMatches(trimmedStart);
    if (slashMatches.length > 0) {
      return { type: "slash", items: slashMatches };
    }
  }

  const mentionContext = getMentionContext(raw);
  if (mentionContext) {
    const mentionMatches = getMentionMatches(mentionContext.query);
    if (mentionMatches.length > 0) {
      return { type: "mention", items: mentionMatches };
    }
  }
  return { type: "none", items: [] };
}

function renderSlashSuggestions() {
  const suggestion = getComposerSuggestionState();
  const shouldShow = suggestion.type !== "none";
  ui.slashCommandPopup.classList.toggle("slash-popup--hidden", !shouldShow);
  ui.slashCommandList.innerHTML = "";
  if (!shouldShow) return;

  if (suggestion.type === "slash") {
    ui.suggestionHint.textContent = "Commands: use ↑↓ and Enter/Tab";
    slashSelectionIndex = Math.max(0, Math.min(slashSelectionIndex, suggestion.items.length - 1));
    suggestion.items.forEach((command, index) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = `slash-item ${index === slashSelectionIndex ? "active" : ""}`;
      const args = command.args ? ` ${command.args}` : "";
      item.innerHTML = `<strong>/${command.name}${args}</strong><small>${command.description}</small>`;
      item.addEventListener("mouseenter", () => {
        slashSelectionIndex = index;
        renderSlashSuggestions();
      });
      item.addEventListener("mousedown", (event) => {
        event.preventDefault();
        applySlashCompletion(command.name);
      });
      ui.slashCommandList.appendChild(item);
    });
    return;
  }

  ui.suggestionHint.textContent = "Mentions: use ↑↓ and Enter/Tab";
  mentionSelectionIndex = Math.max(0, Math.min(mentionSelectionIndex, suggestion.items.length - 1));
  suggestion.items.forEach((account, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `slash-item ${index === mentionSelectionIndex ? "active" : ""}`;
    const guildId = getActiveConversation()?.type === "channel" ? getActiveGuild()?.id || null : null;
    item.innerHTML = `<strong>@${account.username}</strong><small>${displayNameForAccount(account, guildId)} · ${displayStatus(account, guildId)}</small>`;
    item.addEventListener("mouseenter", () => {
      mentionSelectionIndex = index;
      renderSlashSuggestions();
    });
    item.addEventListener("mousedown", (event) => {
      event.preventDefault();
      applyMentionCompletion(account);
    });
    ui.slashCommandList.appendChild(item);
  });
}


  if (typeof globalScope.openShortcutsDialog !== "function") {
    globalScope.openShortcutsDialog = openShortcutsDialog;
  }
  if (typeof globalScope.getComposerSuggestionState !== "function") {
    globalScope.getComposerSuggestionState = getComposerSuggestionState;
  }
  if (typeof globalScope.renderSlashSuggestions !== "function") {
    globalScope.renderSlashSuggestions = renderSlashSuggestions;
  }
  if (typeof globalScope.applySlashCompletion !== "function") {
    globalScope.applySlashCompletion = applySlashCompletion;
  }
  if (typeof globalScope.applyMentionCompletion !== "function") {
    globalScope.applyMentionCompletion = applyMentionCompletion;
  }
  if (typeof globalScope.canEditMessageEntry !== "function") {
    globalScope.canEditMessageEntry = canEditMessageEntry;
  }
  if (typeof globalScope.openMessageEditor !== "function") {
    globalScope.openMessageEditor = openMessageEditor;
  }
  if (typeof globalScope.findLastEditableMessageInActiveConversation !== "function") {
    globalScope.findLastEditableMessageInActiveConversation = findLastEditableMessageInActiveConversation;
  }
  if (typeof globalScope.bindMessageActionHoverState !== "function") {
    globalScope.bindMessageActionHoverState = bindMessageActionHoverState;
  }
  if (typeof globalScope.bindMessageAttachmentControlLock !== "function") {
    globalScope.bindMessageAttachmentControlLock = bindMessageAttachmentControlLock;
  }

  globalScope.SHITCORD67_XEP_SLASH_COMMAND_RUNTIME = Object.freeze({
    handleSlashCommandRuntime,
    applySlashCompletion,
    applyMentionCompletion,
    canEditMessageEntry,
    openMessageEditor,
    findLastEditableMessageInActiveConversation,
    bindMessageActionHoverState,
    bindMessageAttachmentControlLock
  });

  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-slash-command-runtime", globalScope.SHITCORD67_XEP_SLASH_COMMAND_RUNTIME);
  }
})(typeof window !== "undefined" ? window : globalThis);
