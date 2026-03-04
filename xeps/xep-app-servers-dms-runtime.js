/*
 * App server/channel/dm render runtime extracted from app.js.
 * Functions here intentionally bind to app globals at call time.
 */

function renderServers() {
  ui.serverList.innerHTML = "";
  ui.serverBrand.classList.toggle("active", getViewMode() === "dm");
  const currentAccount = getCurrentAccount();
  const prefs = getPreferences();
  const hideNonXmpp = prefs.relayMode === "xmpp" && prefs.xmppHideNonXmpp === "on";
  const showXmppWarning = prefs.relayMode === "xmpp" && !hideNonXmpp;
  const isGuildVisible = (guild) => {
    if (!guild) return false;
    if (currentAccount && !canAccountAccessGuild(guild, currentAccount)) return false;
    return !hideNonXmpp || isXmppBackedGuild(guild);
  };
  const activeGuild = state.guilds.find((guild) => guild.id === state.activeGuildId) || null;
  if (!activeGuild || !isGuildVisible(activeGuild)) {
    const fallbackGuild = state.guilds.find((guild) => isGuildVisible(guild)) || null;
    state.activeGuildId = fallbackGuild?.id || null;
    state.activeChannelId = fallbackGuild ? getFirstOpenableChannelIdForGuild(fallbackGuild) : null;
  }
  const dmStats = getTotalDmUnreadStats(currentAccount);
  if (ui.serverBrandBadge) {
    const mentionCount = Math.max(0, Number(dmStats.mentions) || 0);
    const unreadCount = Math.max(0, Number(dmStats.unread) || 0);
    const count = mentionCount > 0 ? mentionCount : unreadCount;
    if (count > 0) {
      ui.serverBrandBadge.hidden = false;
      ui.serverBrandBadge.classList.toggle("server-brand__badge--mention", mentionCount > 0);
      ui.serverBrandBadge.textContent = count > 99 ? "99+" : String(count);
      ui.serverBrandBadge.title = mentionCount > 0
        ? `${mentionCount} DM mention${mentionCount === 1 ? "" : "s"}`
        : `${unreadCount} unread DM message${unreadCount === 1 ? "" : "s"}`;
    } else {
      ui.serverBrandBadge.hidden = true;
      ui.serverBrandBadge.classList.remove("server-brand__badge--mention");
      ui.serverBrandBadge.textContent = "";
      ui.serverBrandBadge.title = "";
    }
  }
  ensureFolderState();
  const renderGuildButton = (server) => {
    const xmppBackedGuild = isXmppBackedGuild(server);
    const button = document.createElement("button");
    button.className = `server-item ${server.id === state.activeGuildId ? "active" : ""}`;
    if (showXmppWarning && !xmppBackedGuild) button.classList.add("server-item--non-xmpp");
    button.textContent = server.name.slice(0, 2).toUpperCase();
    const accent = (server.accentColor || "").trim();
    if (/^#[0-9a-f]{3,8}$/i.test(accent)) {
      button.style.background = server.id === state.activeGuildId ? accent : "";
    }
    const guildStats = getGuildUnreadStats(server, currentAccount);
    button.title = guildStats.unread > 0
      ? `${server.name} (${guildStats.unread} unread${guildStats.mentions ? `, ${guildStats.mentions} mentions` : ""})`
      : [server.name, (server.description || "").trim()].filter(Boolean).join(" • ");
    if (showXmppWarning && !xmppBackedGuild) {
      button.title = [button.title, "Not mapped from XMPP"].filter(Boolean).join(" • ");
    }
    if (guildStats.mentions > 0) {
      const dot = document.createElement("span");
      dot.className = "server-unread-pill server-unread-pill--mention";
      dot.textContent = guildStats.mentions > 99 ? "99+" : String(guildStats.mentions);
      button.appendChild(dot);
    }
    button.addEventListener("click", () => {
      openGuildById(server.id);
    });
    button.addEventListener("contextmenu", (event) => {
      const currentUser = getCurrentAccount();
      const guildNotifMode = getGuildNotificationMode(server.id);
      const canManageChannels = Boolean(currentUser && hasServerPermission(server, currentUser.id, "manageChannels"));
      const canDeleteGuild = Boolean(currentUser && hasServerPermission(server, currentUser.id, "administrator") && state.guilds.length > 1);
      openContextMenu(event, [
        {
          label: "Open Guild",
          action: () => {
            openGuildById(server.id);
          }
        },
        {
          label: "Copy",
          submenu: [
            { label: "Guild Name", action: () => copyText(server.name || "") },
            { label: "Guild ID", action: () => copyText(server.id) },
            { label: "First Channel ID", action: () => copyText(getFirstOpenableChannelIdForGuild(server) || "") },
            { label: "Guild Link", action: () => copyText(buildChannelPermalink(server.id, getFirstOpenableChannelIdForGuild(server) || "")) }
          ]
        },
        ...(
          canManageChannels
            ? [
              {
                label: "Rename Guild",
                action: () => renameGuildById(server.id)
              },
              {
                label: "Guild Settings",
                action: () => openGuildSettingsDialog(server)
              }
            ]
            : []
        ),
        {
          label: "Create Folder With Guild",
          action: async () => {
            const folderName = await showInAppPromptDialog({
              title: "Create folder",
              message: "Folder name",
              defaultValue: "New Folder"
            });
            if (typeof folderName !== "string") return;
            const cleaned = folderName.trim().slice(0, 24);
            if (!cleaned) return;
            const folder = { id: createId(), name: cleaned, guildIds: [], collapsed: false };
            state.guildFolders.push(folder);
            assignGuildToFolder(server.id, folder.id);
            saveState();
            renderServers();
          }
        },
        {
          label: "Move To Folder…",
          disabled: state.guildFolders.length === 0,
          action: async () => {
            const folderNames = state.guildFolders.map((folder, index) => `${index + 1}. ${folder.name}`).join("\n");
            const pick = await showInAppPromptDialog({
              title: "Move to folder",
              message: `Choose folder number:\n${folderNames}`,
              defaultValue: "1",
              multiline: true
            });
            const index = Math.max(1, Number(pick || 0)) - 1;
            const folder = state.guildFolders[index];
            if (!folder) return;
            assignGuildToFolder(server.id, folder.id);
            saveState();
            renderServers();
          }
        },
        {
          label: "Remove From Folder",
          disabled: !getFolderForGuild(server.id),
          action: () => {
            removeGuildFromFolders(server.id);
            saveState();
            renderServers();
          }
        },
        ...(
          canManageChannels
            ? [
              {
                label: "Create Channel",
                action: () => {
                  state.activeGuildId = server.id;
                  state.activeChannelId = getFirstOpenableChannelIdForGuild(server);
                  ui.channelNameInput.value = "";
                  ui.channelTypeInput.value = "text";
                  ui.createChannelDialog.showModal();
                }
              }
            ]
            : []
        ),
        {
          label: "Mark Guild Read",
          disabled: !currentUser || getGuildUnreadStats(server, currentUser).unread === 0,
          action: () => {
            if (!currentUser) return;
            if (!markGuildRead(server, currentUser.id)) return;
            saveState();
            renderServers();
            renderChannels();
          }
        },
        {
          label: `Notifications: ${guildNotifMode === "mute" ? "Muted" : guildNotifMode === "mentions" ? "Mentions" : "All"}`,
          disabled: true,
          action: () => {}
        },
        {
          label: "Notify: All Messages",
          action: () => {
            setGuildNotificationMode(server.id, "all");
            saveState();
            renderServers();
            renderChannels();
            renderSettingsScreen();
          }
        },
        {
          label: "Notify: Mentions Only",
          action: () => {
            setGuildNotificationMode(server.id, "mentions");
            saveState();
            renderServers();
            renderChannels();
            renderSettingsScreen();
          }
        },
        {
          label: "Notify: Mute Guild",
          action: () => {
            setGuildNotificationMode(server.id, "mute");
            saveState();
            renderServers();
            renderChannels();
            renderSettingsScreen();
          }
        },
        ...(
          canDeleteGuild
            ? [
              {
                label: "Delete Guild",
                danger: true,
                action: async () => {
                  await deleteGuildById(server.id);
                }
              }
            ]
            : []
        )
      ]);
    });
    ui.serverList.appendChild(button);
  };

  state.guildFolders.forEach((folder) => {
    const folderGuilds = folder.guildIds
      .map((guildId) => state.guilds.find((guild) => guild.id === guildId))
      .filter((guild) => guild && isGuildVisible(guild));
    if (folderGuilds.length === 0) return;
    const label = document.createElement("button");
    label.type = "button";
    label.className = "server-folder-label";
    label.textContent = `${folder.collapsed ? "▸" : "▾"} ${folder.name}`;
    label.title = folder.name;
    label.addEventListener("click", () => {
      folder.collapsed = !folder.collapsed;
      saveState();
      renderServers();
    });
    ui.serverList.appendChild(label);
    if (folder.collapsed) return;
    folderGuilds.forEach((guild) => renderGuildButton(guild));
  });

  const folderGuildIds = new Set(state.guildFolders.flatMap((folder) => folder.guildIds));
  state.guilds
    .filter((guild) => !folderGuildIds.has(guild.id) && isGuildVisible(guild))
    .forEach((guild) => renderGuildButton(guild));
}

function currentDmHomeTab() {
  return normalizeDmHomeTab(getPreferences().dmHomeTab);
}

function setDmHomeTab(tab, { persist = true, rerender = true } = {}) {
  const next = normalizeDmHomeTab(tab);
  state.preferences = getPreferences();
  const changed = state.preferences.dmHomeTab !== next || getViewMode() !== "dm" || Boolean(state.activeDmId);
  state.viewMode = "dm";
  state.activeDmId = null;
  state.preferences.mobilePane = "nav";
  state.preferences.dmHomeTab = next;
  if (persist) saveState();
  if (rerender) {
    renderChannels();
    renderMessages();
    renderMemberList();
  }
  return changed;
}

function listDmPeerAccounts(current = getCurrentAccount()) {
  if (!current) return [];
  const seen = new Set();
  const rows = [];
  state.dmThreads.forEach((thread) => {
    if (!Array.isArray(thread?.participantIds) || !thread.participantIds.includes(current.id)) return;
    const peerId = thread.participantIds.find((id) => id && id !== current.id);
    if (!peerId || seen.has(peerId)) return;
    const account = getAccountById(peerId);
    if (!account) return;
    seen.add(peerId);
    const lastMessageTs = toTimestampMs(thread.messages?.[thread.messages.length - 1]?.ts || "");
    rows.push({ account, lastMessageTs });
  });
  return rows
    .sort((a, b) => {
      const aOnline = normalizePresence(a.account?.presence || "online") === "invisible" ? 0 : 1;
      const bOnline = normalizePresence(b.account?.presence || "online") === "invisible" ? 0 : 1;
      if (aOnline !== bOnline) return bOnline - aOnline;
      if (a.lastMessageTs !== b.lastMessageTs) return b.lastMessageTs - a.lastMessageTs;
      return displayNameForAccount(a.account, null).localeCompare(displayNameForAccount(b.account, null));
    })
    .map((entry) => entry.account);
}

function renderDmHomeSidebarNav() {
  if (!Array.isArray(ui.dmHomeTabButtons) || ui.dmHomeTabButtons.length <= 0) return;
  const activeTab = currentDmHomeTab();
  const active = getViewMode() === "dm" && !state.activeDmId ? activeTab : "";
  const incomingRequests = listXmppContactRequests("incoming");
  const current = getCurrentAccount();
  const questBadges = current ? resolveQuestBadgesForAccount(current.id).length : 0;
  ui.dmHomeTabButtons.forEach((button) => {
    const tab = normalizeDmHomeTab(button.dataset.dmHomeTab || "friends");
    let label = tUi(`dm.tab.${tab}`, tab);
    if (tab === "requests" && incomingRequests.length > 0) {
      label = `${label} (${incomingRequests.length})`;
    }
    if (tab === "quests" && questBadges > 0) {
      label = `${label} (${questBadges})`;
    }
    button.textContent = label;
    const selected = tab === active;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
}

function renderDmList() {
  ui.dmList.innerHTML = "";
  const currentAccount = getCurrentAccount();
  if (!currentAccount) return;
  renderDmHomeSidebarNav();
  const incomingRequests = listXmppContactRequests("incoming");
  const outgoingRequests = listXmppContactRequests("outgoing");
  if (ui.toggleDmSectionBtn) {
    const heading = ui.toggleDmSectionBtn.querySelector("span");
    const unreadTotals = getTotalDmUnreadStats(currentAccount);
    const draftCount = countDraftsForCurrentAccountDms(currentAccount);
    const chunks = [tUi("dm.sidebar.directMessages", "Direct Messages")];
    if (unreadTotals.unread > 0) chunks.push(unreadTotals.unread > 99 ? "99+" : String(unreadTotals.unread));
    if (incomingRequests.length > 0) chunks.push(`${incomingRequests.length} requests`);
    if (draftCount > 0) chunks.push(`${draftCount} drafts`);
    if (heading) heading.textContent = chunks.join(" • ");
  }
  const filter = dmSearchTerm.trim().toLowerCase();
  if (ui.dmSearchInput && ui.dmSearchInput.value !== dmSearchTerm) ui.dmSearchInput.value = dmSearchTerm;
  const threads = state.dmThreads
    .filter((thread) => Array.isArray(thread.participantIds) && thread.participantIds.includes(currentAccount.id))
    .filter((thread) => {
      if (!filter) return true;
      const peerId = thread.participantIds.find((id) => id !== currentAccount.id);
      const peer = peerId ? getAccountById(peerId) : null;
      const username = (peer?.username || "").toLowerCase();
      const display = (peer?.displayName || "").toLowerCase();
      const nick = resolveAccountGuildNickname(peer, getActiveGuild()?.id || "").toLowerCase();
      const xmppJid = normalizeXmppJid(peer?.xmppJid || "").toLowerCase();
      return username.includes(filter) || display.includes(filter) || nick.includes(filter) || xmppJid.includes(filter);
    })
    .sort((a, b) => {
      const aTs = toTimestampMs(a.messages?.[a.messages.length - 1]?.ts || 0);
      const bTs = toTimestampMs(b.messages?.[b.messages.length - 1]?.ts || 0);
      return bTs - aTs;
    })
    .slice(0, 80);
  const filteredIncoming = incomingRequests.filter((entry) => {
    if (!filter) return true;
    const account = entry.accountId ? getAccountById(entry.accountId) : null;
    const haystack = [
      entry.jid || "",
      entry.name || "",
      account?.username || "",
      account?.displayName || ""
    ].join(" ").toLowerCase();
    return haystack.includes(filter);
  });
  if (filteredIncoming.length > 0) {
    const title = document.createElement("div");
    title.className = "member-group-title";
    title.textContent = `Contact Requests — ${filteredIncoming.length}`;
    ui.dmList.appendChild(title);
    filteredIncoming.forEach((entry) => {
      const account = entry.accountId ? getAccountById(entry.accountId) : null;
      const row = document.createElement("div");
      row.className = "dm-request-item";
      const left = document.createElement("div");
      left.className = "dm-request-item__meta";
      const avatar = document.createElement("div");
      avatar.className = "channel-dm-avatar";
      if (account) {
        if (account?.xmppJid) maybeFetchXmppAvatarForJid(account.xmppJid);
        applyAvatarStyle(avatar, account, null);
      } else {
        avatar.style.backgroundColor = fallbackAvatarColorForSeed(entry.name || entry.jid || "");
        applyAvatarInitialGlyph(avatar, entry.name || entry.jid || "?");
      }
      left.appendChild(avatar);
      const textWrap = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = account ? dmPrimaryLabelForAccount(account) : (entry.name || entry.jid);
      const jid = document.createElement("small");
      jid.textContent = entry.jid;
      textWrap.appendChild(name);
      textWrap.appendChild(jid);
      left.appendChild(textWrap);
      const actions = document.createElement("div");
      actions.className = "dm-request-item__actions";
      const acceptBtn = document.createElement("button");
      acceptBtn.type = "button";
      acceptBtn.textContent = tUi("common.accept", "Accept");
      acceptBtn.addEventListener("click", () => {
        const ok = acceptXmppContactRequest(entry.jid);
        if (!ok) {
          showToast("Could not accept request.", { tone: "error" });
          return;
        }
        showToast(`Accepted ${entry.jid}`);
        const peer = ensureAccountByXmppJid(entry.jid, entry.name || "");
        if (peer) getOrCreateDmThread(currentAccount, peer);
        saveState();
        renderDmList();
      });
      const declineBtn = document.createElement("button");
      declineBtn.type = "button";
      declineBtn.textContent = tUi("common.decline", "Decline");
      declineBtn.addEventListener("click", () => {
        const ok = declineXmppContactRequest(entry.jid);
        if (!ok) {
          showToast("Could not decline request.", { tone: "error" });
          return;
        }
        showToast(`Declined ${entry.jid}`);
        saveState();
        renderDmList();
      });
      actions.appendChild(acceptBtn);
      actions.appendChild(declineBtn);
      row.appendChild(left);
      row.appendChild(actions);
      ui.dmList.appendChild(row);
    });
  }
  if (outgoingRequests.length > 0 && !filter) {
    const row = document.createElement("div");
    row.className = "channel-empty";
    row.textContent = tUiFmt("dm.requests.pendingOutgoing", { count: outgoingRequests.length }, `Pending outgoing requests: ${outgoingRequests.length}`);
    ui.dmList.appendChild(row);
  }
  if (threads.length === 0 && filteredIncoming.length === 0) {
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = filter
      ? tUi("dm.empty.filtered", "No DMs or contact requests match your search.")
      : tUi("dm.empty.none", "No direct messages yet.");
    ui.dmList.appendChild(empty);
    return;
  }
  threads.forEach((thread) => {
    const peerId = thread.participantIds.find((id) => id !== currentAccount.id);
    const peer = peerId ? getAccountById(peerId) : null;
    const button = document.createElement("button");
    button.className = `channel-item channel-item--dm ${state.activeDmId === thread.id ? "active" : ""}`;
    const peerPresence = normalizePresence(peer?.presence || "online");
    const threadLastIncomingTs = latestIncomingDmMessageTimestamp(thread, currentAccount.id);
    const peerLastActiveTs = accountXmppLastActiveTimestamp(peer, threadLastIncomingTs);
    if (peer && (peerPresence === "idle" || peerPresence === "invisible")) {
      const relative = formatRelativeTimeAgoShort(peerLastActiveTs);
      if (relative) {
        const prefix = peerPresence === "idle" ? "Idle" : "Offline";
        button.title = `${prefix} · Last active ${relative}`;
      }
    }
    const avatar = document.createElement("div");
    avatar.className = "channel-dm-avatar";
    if (peer) {
      applyAvatarStyle(avatar, peer, null);
      const dot = document.createElement("span");
      dot.className = `presence-dot presence-${peerPresence}`;
      avatar.appendChild(dot);
    } else {
      avatar.style.backgroundColor = fallbackAvatarColorForSeed("unknown-dm");
      applyAvatarInitialGlyph(avatar, "Unknown");
    }
    button.appendChild(avatar);
    const label = document.createElement("span");
    label.className = "channel-item__name";
    label.textContent = peer ? dmPrimaryLabelForAccount(peer) : "Unknown DM";
    const content = document.createElement("span");
    content.className = "channel-item__meta";
    content.appendChild(label);
    const lastMessage = thread.messages?.[thread.messages.length - 1] || null;
    const preview = document.createElement("span");
    preview.className = "channel-item__preview";
    if (!lastMessage) {
      preview.textContent = "No messages yet.";
    } else {
      const ownLastMessage = (lastMessage.userId || "").toString() === (currentAccount.id || "").toString();
      const sender = ownLastMessage ? "You" : (peer ? dmPrimaryLabelForAccount(peer) : "Unknown");
      const deliveryMeta = ownLastMessage ? dmDeliveryBadgeMetaForList(lastMessage) : null;
      const senderLabel = deliveryMeta ? `${sender} ${deliveryMeta.prefix}` : sender;
      const text = (lastMessage.text || "").replace(/\s+/g, " ").trim();
      const bodyText = text || "(attachment)";
      const rawPreview = `${senderLabel}: ${bodyText}`;
      const prefix = document.createElement("span");
      prefix.className = "channel-item__preview-prefix";
      prefix.textContent = `${sender}:`;
      preview.appendChild(prefix);
      if (deliveryMeta) {
        const deliveryBadge = document.createElement("span");
        deliveryBadge.className = `dm-delivery-pill dm-delivery-pill--${deliveryMeta.state}`;
        deliveryBadge.textContent = deliveryMeta.label;
        if (deliveryMeta.title) deliveryBadge.title = deliveryMeta.title;
        preview.appendChild(deliveryBadge);
      }
      const body = document.createElement("span");
      body.className = "channel-item__preview-text";
      body.textContent = bodyText;
      preview.appendChild(body);
      if (deliveryMeta?.title) {
        preview.title = `${rawPreview} · ${deliveryMeta.title}`;
      } else if (rawPreview.length > 72) {
        preview.title = rawPreview;
      }
    }
    content.appendChild(preview);
    button.appendChild(content);
    const unread = getDmUnreadStats(thread, currentAccount);
    const hasDraft = hasDraftForConversation(thread.id);
    if (unread.unread > 0) {
      const badge = document.createElement("span");
      badge.className = `channel-badge ${unread.mentions > 0 ? "channel-badge--mention" : ""}`;
      badge.textContent = unread.unread > 99 ? "99+" : String(unread.unread);
      button.appendChild(badge);
    } else if (hasDraft) {
      const draftBadge = document.createElement("span");
      draftBadge.className = "channel-badge channel-badge--draft";
      draftBadge.textContent = "Draft";
      button.appendChild(draftBadge);
      button.classList.add("channel-item--draft");
    }
    if (hasDraft) {
      button.title = `${button.title ? `${button.title} • ` : ""}Has unsent draft`;
    }
    button.addEventListener("click", () => {
      state.viewMode = "dm";
      state.activeDmId = thread.id;
      state.preferences = getPreferences();
      state.preferences.mobilePane = "chat";
      saveState();
      applyPreferencesToUI();
      renderMessages();
      renderChannels();
      renderMemberList();
    });
    button.addEventListener("contextmenu", (event) => {
      openContextMenu(event, [
        {
          label: "Open DM",
          action: () => {
            state.viewMode = "dm";
            state.activeDmId = thread.id;
            state.preferences = getPreferences();
            state.preferences.mobilePane = "chat";
            saveState();
            applyPreferencesToUI();
            renderMessages();
            renderChannels();
          }
        },
        {
          label: "Mark DM Read",
          disabled: unread.unread === 0,
          action: () => {
            if (!markDmRead(thread, currentAccount.id)) return;
            saveState();
            renderDmList();
            renderChannels();
          }
        },
        {
          label: "Copy",
          submenu: [
            { label: "Peer Address", action: () => copyText(peer ? dmSecondaryLabelForAccount(peer) : "") },
            { label: "Peer Username", action: () => copyText(peer ? `@${peer.username}` : "") },
            { label: "Thread ID", action: () => copyText(thread.id) },
            { label: "Peer User ID", action: () => copyText(peer?.id || "") }
          ]
        },
        {
          label: "Close DM",
          danger: true,
          action: () => {
            state.dmThreads = state.dmThreads.filter((entry) => entry.id !== thread.id);
            if (state.activeDmId === thread.id) state.activeDmId = null;
            saveState();
            render();
          }
        }
      ]);
    });
    ui.dmList.appendChild(button);
  });
  updateDocumentTitle();
}

function renderChannels() {
  renderDmList();
  const dmMode = getViewMode() === "dm";
  const prefs = getPreferences();
  const hideNonXmpp = prefs.relayMode === "xmpp" && prefs.xmppHideNonXmpp === "on";
  const showXmppWarning = prefs.relayMode === "xmpp" && !hideNonXmpp;
  ui.dmSection.classList.toggle("panel-section--hidden", !dmMode);
  ui.guildSection.classList.toggle("panel-section--hidden", dmMode);
  if (ui.dmHomeNav) ui.dmHomeNav.hidden = !dmMode;
  if (ui.dmHomeDivider) ui.dmHomeDivider.hidden = !dmMode;
  if (ui.dmSearchInput) ui.dmSearchInput.placeholder = tUi("dm.search.placeholder", "Find or start DM");
  if (ui.newDmBtn) ui.newDmBtn.textContent = tUi("dm.button.addFriend", "+ Add Friend");
  ui.dmSection.classList.toggle("panel-section--collapsed", prefs.collapseDmSection === "on");
  ui.guildSection.classList.toggle("panel-section--collapsed", prefs.collapseGuildSection === "on");
  if (ui.openGuildSettingsBtn) ui.openGuildSettingsBtn.hidden = dmMode;
  if (ui.createChannelBtn) ui.createChannelBtn.hidden = dmMode;
  const server = getActiveServer();
  ui.channelList.innerHTML = "";
  if (dmMode) {
    ui.activeServerName.textContent = "Direct Messages";
    return;
  }
  if (!server) {
    ui.activeServerName.textContent = "No guild";
    return;
  }
  const currentAccount = getCurrentAccount();
  if (currentAccount && !canAccountAccessGuild(server, currentAccount)) {
    if (ensureActiveGuildForCurrentAccount()) {
      saveState();
      renderChannels();
      return;
    }
    ui.activeServerName.textContent = "No accessible guild";
    return;
  }
  if (ui.toggleGuildSectionBtn) {
    const heading = ui.toggleGuildSectionBtn.querySelector("span");
    const guildStats = getGuildUnreadStats(server, currentAccount);
    const draftCount = countDraftsForGuildChannels(server);
    const chunks = ["Channels"];
    if (guildStats.unread > 0) chunks.push(guildStats.unread > 99 ? "99+" : String(guildStats.unread));
    if (draftCount > 0) chunks.push(`${draftCount} drafts`);
    if (heading) heading.textContent = chunks.join(" • ");
  }

  const notificationMode = getGuildNotificationMode(server.id);
  const filter = channelFilterTerm.trim().toLowerCase();
  if (ui.channelFilterInput && ui.channelFilterInput.value !== channelFilterTerm) {
    ui.channelFilterInput.value = channelFilterTerm;
  }
  ui.activeServerName.textContent = server.name;
  ui.activeServerName.title = [server.name, (server.description || "").trim()].filter(Boolean).join(" • ");
  if (ui.openGuildSettingsBtn) {
    const current = getCurrentAccount();
    const canManage = Boolean(current && hasServerPermission(server, current.id, "manageChannels"));
    ui.openGuildSettingsBtn.disabled = !canManage;
    ui.openGuildSettingsBtn.title = canManage ? "Guild settings" : "Manage Channels permission required";
  }
  if (ui.createChannelBtn) {
    const current = getCurrentAccount();
    const canManage = Boolean(current && hasServerPermission(server, current.id, "manageChannels"));
    ui.createChannelBtn.disabled = !canManage;
    ui.createChannelBtn.hidden = !canManage;
    ui.createChannelBtn.title = canManage ? "Create channel" : "Manage Channels permission required";
  }
  if (!currentAccount) return;
  const visibleChannels = server.channels
    .filter((channel) => canAccountViewChannel(server, channel, currentAccount.id))
    .filter((channel) => !hideNonXmpp || isXmppBackedChannel(channel));
  if (!visibleChannels.some((entry) => entry.id === state.activeChannelId)) {
    state.activeChannelId = visibleChannels[0]?.id || null;
  }
  const channelsToRender = visibleChannels.filter((channel) => !filter || channel.name.toLowerCase().includes(filter));
  if (channelsToRender.length === 0) {
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = filter
      ? "No channels match your filter."
      : hideNonXmpp
        ? "No XMPP-backed channels found in this guild."
        : "No accessible channels in this guild.";
    ui.channelList.appendChild(empty);
  }
  channelsToRender.forEach((channel) => {
    const xmppBackedChannel = isXmppBackedChannel(channel);
    const xmppRoomJid = xmppBareJid(channel?.xmppRoomJid || "");
    const xmppJoinState = xmppRoomJid ? (xmppMucJoinStateByRoomJid.get(xmppRoomJid) || null) : null;
    const button = document.createElement("button");
    button.className = `channel-item ${channel.id === state.activeChannelId ? "active" : ""}`;
    if (showXmppWarning && !xmppBackedChannel) button.classList.add("channel-item--non-xmpp");
    const icon = document.createElement("span");
    icon.className = "channel-item__icon";
    icon.textContent = channelTypeSymbol(channel);
    button.appendChild(icon);
    const label = document.createElement("span");
    label.className = "channel-item__name";
    label.textContent = channel.name;
    button.appendChild(label);
    const hasDraft = hasDraftForConversation(channel.id);
    const unreadStats = applyGuildNotificationModeToStats(
      getChannelUnreadStats(channel, currentAccount),
      notificationMode
    );
    if (channel.type === "voice" || channel.type === "stage") {
      ensureVoiceStateForChannel(channel);
      const connectedCount = channel.voiceState.connectedIds.length;
      if (connectedCount > 0) {
        const liveBadge = document.createElement("span");
        liveBadge.className = "channel-badge channel-badge--live";
        if (channel.type === "stage") {
          const speakerCount = channel.voiceState.speakerIds.length;
          const raisedCount = channel.voiceState.raisedHandIds.length;
          liveBadge.textContent = `${connectedCount} · S${speakerCount} Q${raisedCount}`;
        } else {
          liveBadge.textContent = `${connectedCount} live`;
        }
        button.appendChild(liveBadge);
      }
    }
    if (unreadStats.mentions > 0) {
      const mentionBadge = document.createElement("span");
      mentionBadge.className = "channel-badge channel-badge--mention";
      mentionBadge.textContent = unreadStats.mentions > 99 ? "99+" : String(unreadStats.mentions);
      button.appendChild(mentionBadge);
      button.classList.add("channel-item--unread");
    } else if (unreadStats.unread > 0) {
      const unreadBadge = document.createElement("span");
      unreadBadge.className = "channel-badge channel-badge--dot";
      unreadBadge.textContent = "";
      button.appendChild(unreadBadge);
      button.classList.add("channel-item--unread");
    } else if (hasDraft) {
      const draftBadge = document.createElement("span");
      draftBadge.className = "channel-badge channel-badge--draft";
      draftBadge.textContent = "Draft";
      button.appendChild(draftBadge);
      button.classList.add("channel-item--draft");
    }
    if (hasDraft) {
      button.title = `${button.title ? `${button.title} • ` : ""}Has unsent draft`;
    }
    if (showXmppWarning && !xmppBackedChannel) {
      button.title = `${button.title ? `${button.title} • ` : ""}Not mapped from XMPP`;
    }
    if (xmppJoinState?.pending) {
      const syncingBadge = document.createElement("span");
      syncingBadge.className = "channel-badge channel-badge--dot";
      syncingBadge.title = "Joining XMPP room…";
      button.appendChild(syncingBadge);
      button.title = `${button.title ? `${button.title} • ` : ""}Joining room…`;
    } else if (xmppJoinState?.lastErrorCondition) {
      const errorBadge = document.createElement("span");
      errorBadge.className = "channel-badge channel-badge--mention";
      errorBadge.textContent = "!";
      errorBadge.title = `XMPP join failed: ${xmppJoinState.lastErrorCondition}${xmppJoinState.lastErrorText ? ` — ${xmppJoinState.lastErrorText}` : ""}`;
      button.appendChild(errorBadge);
      button.title = `${button.title ? `${button.title} • ` : ""}Join failed: ${xmppJoinState.lastErrorCondition}`;
    }
    button.addEventListener("click", () => {
      state.viewMode = "guild";
      state.activeChannelId = channel.id;
      state.activeDmId = null;
      state.preferences = getPreferences();
      state.preferences.mobilePane = "chat";
      rememberGuildChannelSelection(server.id, channel.id);
      saveState();
      applyPreferencesToUI();
      renderMessages();
      renderChannels();
    });
    button.addEventListener("contextmenu", (event) => {
      const canManageChannels = canCurrentUser("manageChannels");
      const menuItems = [
        {
          label: "Open Channel",
          action: () => {
            state.viewMode = "guild";
            state.activeChannelId = channel.id;
            state.activeDmId = null;
            state.preferences = getPreferences();
            state.preferences.mobilePane = "chat";
            rememberGuildChannelSelection(server.id, channel.id);
            saveState();
            applyPreferencesToUI();
            renderMessages();
            renderChannels();
          }
        },
        ...(channel.type === "voice" || channel.type === "stage"
          ? [
            {
              label: (() => {
                const current = getCurrentAccount();
                ensureVoiceStateForChannel(channel);
                const joined = Boolean(current && channel.voiceState.connectedIds.includes(current.id));
                return joined ? "Leave Call" : "Join Call";
              })(),
              disabled: !getCurrentAccount(),
              action: () => {
                const current = getCurrentAccount();
                if (!current) return;
                ensureVoiceStateForChannel(channel);
                const joined = channel.voiceState.connectedIds.includes(current.id);
                const changed = joined
                  ? leaveVoiceLikeChannel(channel, current.id)
                  : joinVoiceLikeChannel(channel, current.id);
                if (!changed) return;
                state.activeChannelId = channel.id;
                saveState();
                render();
              }
            },
            {
              label: (() => {
                const current = getCurrentAccount();
                ensureVoiceStateForChannel(channel);
                if (!current || !channel.voiceState.connectedIds.includes(current.id)) return "Mute Self";
                return channel.voiceState.mutedIds.includes(current.id) ? "Unmute Self" : "Mute Self";
              })(),
              disabled: (() => {
                const current = getCurrentAccount();
                if (!current) return true;
                ensureVoiceStateForChannel(channel);
                return !channel.voiceState.connectedIds.includes(current.id);
              })(),
              action: () => {
                const current = getCurrentAccount();
                if (!current) return;
                if (!toggleVoiceMuteForSelf(channel, current.id)) return;
                saveState();
                render();
              }
            },
            {
              label: "Voice Status",
              action: () => {
                ensureVoiceStateForChannel(channel);
                const speakers = channel.type === "stage" ? channel.voiceState.speakerIds.length : 0;
                const queue = channel.type === "stage" ? channel.voiceState.raisedHandIds.length : 0;
                showToast([
                  `${channel.voiceState.connectedIds.length} connected`,
                  channel.type === "stage" ? `${speakers} speakers` : "",
                  channel.type === "stage" ? `${queue} queue` : ""
                ].filter(Boolean).join(" · "));
              }
            }
          ]
          : []),
        {
          label: "Copy",
          submenu: [
            { label: "Channel Name", action: () => copyText(`#${channel.name}`) },
            { label: "Channel Topic", action: () => copyText(channel.topic || "") },
            { label: "Channel ID", action: () => copyText(channel.id) },
            { label: "Channel Link", action: () => copyText(buildChannelPermalink(server.id, channel.id)) }
          ]
        },
        {
          label: "Mark Channel Read",
          disabled: !currentAccount || unreadStats.unread === 0,
          action: () => {
            if (!currentAccount) return;
            if (!markChannelRead(channel, currentAccount.id)) return;
            saveState();
            renderServers();
            renderChannels();
          }
        }
      ];
      if (canManageChannels) {
        menuItems.push(
          {
            label: "Slowmode",
            submenu: [
              { label: "Off", action: () => { channel.slowmodeSec = 0; ensureChannelSlowmodeState(channel); saveState(); renderMessages(); } },
              { label: "5s", action: () => { channel.slowmodeSec = 5; ensureChannelSlowmodeState(channel); saveState(); renderMessages(); } },
              { label: "15s", action: () => { channel.slowmodeSec = 15; ensureChannelSlowmodeState(channel); saveState(); renderMessages(); } },
              { label: "30s", action: () => { channel.slowmodeSec = 30; ensureChannelSlowmodeState(channel); saveState(); renderMessages(); } },
              { label: "60s", action: () => { channel.slowmodeSec = 60; ensureChannelSlowmodeState(channel); saveState(); renderMessages(); } }
            ]
          },
          {
            label: "Rename Channel",
            action: () => {
              state.activeChannelId = channel.id;
              openChannelSettings();
            }
          },
          {
            label: "Duplicate Channel",
            action: () => {
              const clone = duplicateChannelInGuild(server, channel);
              if (!clone) return;
              state.activeChannelId = clone.id;
              saveState();
              render();
            }
          },
          {
            label: "Move Up",
            disabled: server.channels[0]?.id === channel.id,
            action: () => {
              if (!moveChannelByOffset(server, channel.id, -1)) return;
              saveState();
              renderChannels();
            }
          },
          {
            label: "Move Down",
            disabled: server.channels[server.channels.length - 1]?.id === channel.id,
            action: () => {
              if (!moveChannelByOffset(server, channel.id, 1)) return;
              saveState();
              renderChannels();
            }
          }
        );
        if (channel.type === "forum") {
          menuItems.push({
            label: "Forum Tags",
            submenu: [
              {
                label: "Add Tag…",
                action: async () => {
                  const raw = await showInAppPromptDialog({
                    title: "Add forum tag",
                    message: "Forum tag name",
                    defaultValue: "discussion"
                  });
                  if (typeof raw !== "string") return;
                  const name = sanitizeForumTagName(raw);
                  if (!name) return;
                  channel.forumTags = forumTagsForChannel(channel);
                  if (resolveForumTagByName(channel, name)) return;
                  channel.forumTags.push({ id: createId(), name, color: "#5865f2" });
                  saveState();
                  renderMessages();
                }
              },
              ...forumTagsForChannel(channel).map((tag) => ({
                label: `Remove ${tag.name}`,
                action: () => {
                  channel.forumTags = forumTagsForChannel(channel).filter((entry) => entry.id !== tag.id);
                  channel.messages.forEach((message) => {
                    message.forumTagIds = normalizeThreadTagIds(message.forumTagIds, channel.forumTags);
                  });
                  saveState();
                  renderMessages();
                }
              }))
            ]
          });
        }
        menuItems.push({
          label: "Delete Channel",
          danger: true,
          disabled: server.channels.length <= 1,
          action: () => {
            state.activeChannelId = channel.id;
            ui.deleteChannelBtn.click();
          }
        });
      }
      openContextMenu(event, menuItems);
    });
    ui.channelList.appendChild(button);
  });
  updateDocumentTitle();
}

function hiddenMessagesBelowCount() {
  const rows = [...ui.messageList.querySelectorAll(".message")];
  if (rows.length === 0) return 0;
  const listRect = ui.messageList.getBoundingClientRect();
  let hidden = 0;
  rows.forEach((row) => {
    const rect = row.getBoundingClientRect();
    if (rect.top > listRect.bottom - 8) hidden += 1;
  });
  return hidden;
}

function updateJumpToBottomButton() {
  if (!ui.jumpToBottomBtn) return;
  const distanceFromBottom = ui.messageList.scrollHeight - ui.messageList.scrollTop - ui.messageList.clientHeight;
  const nearBottom = distanceFromBottom < 36;
  if (nearBottom) {
    ui.jumpToBottomBtn.classList.add("jump-to-bottom--hidden");
    ui.jumpToBottomBtn.textContent = "Jump to present";
    return;
  }
  const hiddenCount = hiddenMessagesBelowCount();
  ui.jumpToBottomBtn.textContent = hiddenCount > 0
    ? `${hiddenCount > 99 ? "99+" : hiddenCount} below`
    : "Jump to present";
  ui.jumpToBottomBtn.classList.remove("jump-to-bottom--hidden");
}

function isMessageListNearBottom(thresholdPx = MESSAGE_LIST_NEAR_BOTTOM_PX) {
  const list = ui.messageList;
  if (!list) return true;
  const threshold = Math.max(0, Number(thresholdPx) || MESSAGE_LIST_NEAR_BOTTOM_PX);
  const distance = list.scrollHeight - list.scrollTop - list.clientHeight;
  return distance <= threshold;
}

function captureMessageListAnchor() {
  const list = ui.messageList;
  if (!list) return null;
  const listRect = list.getBoundingClientRect();
  const rows = [...list.querySelectorAll(".message[data-message-id]")];
  for (const row of rows) {
    if (!(row instanceof HTMLElement)) continue;
    const rect = row.getBoundingClientRect();
    if (rect.bottom < listRect.top + 2) continue;
    return {
      messageId: (row.dataset.messageId || "").toString(),
      offsetTop: rect.top - listRect.top
    };
  }
  return null;
}

function restoreMessageListAnchor(anchor) {
  if (!anchor?.messageId) return false;
  const row = ui.messageList.querySelector(`[data-message-id="${anchor.messageId}"]`);
  if (!(row instanceof HTMLElement)) return false;
  const listRect = ui.messageList.getBoundingClientRect();
  const rect = row.getBoundingClientRect();
  ui.messageList.scrollTop += (rect.top - listRect.top) - (Number(anchor.offsetTop) || 0);
  return true;
}

function renderUserPopout(
  account,
  fallbackName = "Unknown",
  {
    focusQuickDm = false,
    resetQuickDmInput = false,
    refreshPrivateFields = true,
    avatarUrlHint = userPopoutAvatarHint
  } = {}
) {
  userPopoutAvatarHint = normalizeRenderableAvatarUrl(avatarUrlHint);
  const guildId = getActiveConversation()?.type === "channel" ? getActiveGuild()?.id || null : null;
  const displayName = account ? displayNameForAccount(account, guildId) : fallbackName;
  const bio = account?.bio?.trim() || "No bio yet.";
  const current = getCurrentAccount();
  const activity = accountActivitySummary(account);

  ui.userPopoutName.textContent = displayName;
  const activeServer = getActiveConversation()?.type === "channel" ? getActiveServer() : null;
  const userRoleColor = account?.id && activeServer ? getMemberTopRoleColor(activeServer, account.id) : "";
  ui.userPopoutName.style.color = userRoleColor || "";
  applyNameplateStyle(ui.userPopoutName, account);
  const userTag = accountGuildTag(account);
  if (userTag) {
    ui.userPopoutName.appendChild(document.createTextNode(" "));
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "guild-tag-chip";
    chip.textContent = userTag;
    chip.title = "Guild tag";
    chip.addEventListener("click", () => showGuildTagInfo(account));
    ui.userPopoutName.appendChild(chip);
  }
  const popoutStatus = account ? displayStatus(account, guildId) : "Offline";
  ui.userPopoutStatus.textContent = activity ? `${popoutStatus} · ${activity}` : popoutStatus;
  let userXmppNeedsRefresh = false;
  if (ui.userPopoutXmppMeta) {
    const dmThread = account?.id && current?.id
      ? state.dmThreads.find((thread) => (
          Array.isArray(thread?.participantIds)
          && thread.participantIds.includes(account.id)
          && thread.participantIds.includes(current.id)
        )) || null
      : null;
    const fallbackLastActive = dmThread ? latestIncomingDmMessageTimestamp(dmThread, current.id) : "";
    const xmppMeta = accountXmppPresenceMeta(account, { fallbackLastActive });
    ui.userPopoutXmppMeta.textContent = xmppMeta.text;
    ui.userPopoutXmppMeta.hidden = !xmppMeta.text;
    ui.userPopoutXmppMeta.title = xmppMeta.title || "";
    userXmppNeedsRefresh = Boolean(xmppMeta.needsRefresh);
  }
  userPopoutXmppNeedsRefresh = userXmppNeedsRefresh;
  schedulePopoutPresenceRefresh();
  ui.userPopoutBio.textContent = bio;
  if (account?.xmppJid) maybeFetchXmppAvatarForJid(account.xmppJid);
  const activeRoomJid = xmppBareJid(getActiveChannel()?.xmppRoomJid || "");
  const nickHint = displayName || account?.username || fallbackName || "";
  const messageAvatarHint = account?.id
    ? avatarUrlHintFromElement(ui.messageList?.querySelector?.(`.message[data-user-id="${account.id}"] .message-avatar`) || null)
    : "";
  const roomAvatar = activeRoomJid ? xmppMucAvatarUrlForOccupant(activeRoomJid, nickHint) : "";
  const knownNickAvatar = !roomAvatar && activeRoomJid
    ? xmppAvatarUrlForKnownRoomNick(activeRoomJid, nickHint, guildId)
    : "";
  const bestFallbackAvatar = [
    normalizeRenderableAvatarUrl(avatarUrlHint),
    messageAvatarHint,
    roomAvatar,
    knownNickAvatar
  ].find((entry) => isRenderableAvatarUrl(entry));
  applyAvatarStyle(ui.userPopoutAvatar, account, guildId);
  applyAvatarDecoration(ui.userPopoutAvatar, account);
  const resolvedAvatarUrl = account ? resolveAccountAvatar(account, guildId).url : "";
  if (!isRenderableAvatarUrl(resolvedAvatarUrl)) {
    if (bestFallbackAvatar) {
      ui.userPopoutAvatar.style.backgroundImage = `url(${bestFallbackAvatar})`;
      ui.userPopoutAvatar.style.backgroundSize = "cover";
      ui.userPopoutAvatar.style.backgroundPosition = "center";
    } else if (!account) {
      ui.userPopoutAvatar.style.backgroundColor = fallbackAvatarColorForSeed(displayName || fallbackName || "user");
      applyAvatarInitialGlyph(ui.userPopoutAvatar, displayName || fallbackName || account?.username || "?");
    } else {
      applyAvatarInitialGlyph(ui.userPopoutAvatar, displayName || fallbackName || account?.username || "?");
    }
  }
  ui.userPopoutAvatar.classList.add("profile-preview__avatar--interactive");
  ui.userPopoutAvatar.title = account?.id
    ? "Open extended profile (shared guilds/friends)"
    : "No account details available";
  ui.userPopoutAvatar.setAttribute("role", "button");
  ui.userPopoutAvatar.tabIndex = account?.id ? 0 : -1;
  applyBannerStyle(ui.userPopoutBanner, resolveAccountBanner(account, guildId));
  ui.userPopoutDialog.classList.remove("profile-effect-aurora", "profile-effect-flame", "profile-effect-ocean");
  const userEffect = accountProfileEffect(account);
  if (userEffect !== "none") ui.userPopoutDialog.classList.add(`profile-effect-${userEffect}`);
  renderRoleChips(ui.userPopoutRoles, account?.id);
  renderQuestBadges(ui.userPopoutRoles, account?.id);
  if (refreshPrivateFields && ui.userNoteInput) {
    ui.userNoteInput.value = current && selectedUserPopoutId ? getUserNote(current.id, selectedUserPopoutId) : "";
    ui.userNoteInput.disabled = !selectedUserPopoutId;
  }
  if (ui.userStartDmBtn) ui.userStartDmBtn.disabled = !account?.id || account.id === current?.id;
  if (refreshPrivateFields && ui.userSaveNoteBtn) ui.userSaveNoteBtn.disabled = !selectedUserPopoutId || !current;
  if (refreshPrivateFields && ui.userSendDmBtn) ui.userSendDmBtn.disabled = !account?.id || account.id === current?.id || !current;
  if (refreshPrivateFields && ui.userDmInput && resetQuickDmInput) ui.userDmInput.value = "";
  if (refreshPrivateFields && focusQuickDm && account?.id && current && account.id !== current.id && ui.userDmInput) {
    ui.userDmInput.focus();
  }
}

function openUserPopout(account, fallbackName = "Unknown", { avatarUrlHint = "" } = {}) {
  selectedUserPopoutId = account?.id || null;
  userPopoutAvatarHint = normalizeRenderableAvatarUrl(avatarUrlHint);
  renderUserPopout(account, fallbackName, {
    focusQuickDm: true,
    resetQuickDmInput: true,
    avatarUrlHint: userPopoutAvatarHint
  });
  ui.userPopoutDialog.showModal();
  schedulePopoutPresenceRefresh();
}

function sharedGuildsBetweenAccounts(accountAId, accountBId) {
  if (!accountAId || !accountBId) return [];
  return state.guilds.filter((guild) => (
    Array.isArray(guild.memberIds)
    && guild.memberIds.includes(accountAId)
    && guild.memberIds.includes(accountBId)
  ));
}

function dmPeerIdsForAccount(accountId) {
  const peers = new Set();
  if (!accountId) return peers;
  state.dmThreads.forEach((thread) => {
    if (!Array.isArray(thread?.participantIds) || !thread.participantIds.includes(accountId)) return;
    thread.participantIds.forEach((id) => {
      if (id && id !== accountId) peers.add(id);
    });
  });
  return peers;
}

function sharedFriendAccountsBetweenAccounts(accountAId, accountBId) {
  const aPeers = dmPeerIdsForAccount(accountAId);
  const bPeers = dmPeerIdsForAccount(accountBId);
  const shared = [];
  aPeers.forEach((candidateId) => {
    if (!bPeers.has(candidateId)) return;
    if (candidateId === accountAId || candidateId === accountBId) return;
    const account = getAccountById(candidateId);
    if (account) shared.push(account);
  });
  return shared.sort((left, right) => displayNameForAccount(left).localeCompare(displayNameForAccount(right)));
}

function renderUserProfileExtendedDialog() {
  const current = getCurrentAccount();
  const account = userProfileExtendedAccountId ? getAccountById(userProfileExtendedAccountId) : null;
  if (!current || !account || !ui.userProfileExtendedDialog?.open) return;
  const guildId = getActiveConversation()?.type === "channel" ? getActiveGuild()?.id || null : null;
  const displayName = displayNameForAccount(account, guildId);
  const activity = accountActivitySummary(account);
  if (ui.userProfileExtendedName) ui.userProfileExtendedName.textContent = displayName;
  if (ui.userProfileExtendedStatus) {
    const status = displayStatus(account, guildId);
    ui.userProfileExtendedStatus.textContent = activity ? `${status} · ${activity}` : status;
  }
  if (ui.userProfileExtendedAvatar) {
    applyAvatarStyle(ui.userProfileExtendedAvatar, account, guildId);
    applyAvatarDecoration(ui.userProfileExtendedAvatar, account);
    const accountAvatar = resolveAccountAvatar(account, guildId).url;
    if (!isRenderableAvatarUrl(accountAvatar)) {
      const fallbackAvatar = [
        normalizeRenderableAvatarUrl(userProfileExtendedAvatarHint),
        avatarUrlHintFromElement(ui.userPopoutAvatar)
      ].find((entry) => isRenderableAvatarUrl(entry));
      if (fallbackAvatar) {
        ui.userProfileExtendedAvatar.style.backgroundImage = `url(${fallbackAvatar})`;
        ui.userProfileExtendedAvatar.style.backgroundSize = "cover";
        ui.userProfileExtendedAvatar.style.backgroundPosition = "center";
      } else {
        applyAvatarInitialGlyph(ui.userProfileExtendedAvatar, displayName || account.username || "?");
      }
    }
  }
  ui.userProfileExtendedTabs.forEach((button) => {
    const active = button.dataset.profileExtendedTab === userProfileExtendedTab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
  const sharedGuilds = sharedGuildsBetweenAccounts(current.id, account.id);
  const sharedFriends = sharedFriendAccountsBetweenAccounts(current.id, account.id);
  if (ui.userProfileExtendedGuildsPanel) {
    ui.userProfileExtendedGuildsPanel.hidden = userProfileExtendedTab !== "guilds";
    ui.userProfileExtendedGuildsPanel.innerHTML = "";
    if (sharedGuilds.length === 0) {
      const empty = document.createElement("div");
      empty.className = "channel-empty";
      empty.textContent = "No shared guilds.";
      ui.userProfileExtendedGuildsPanel.appendChild(empty);
    } else {
      sharedGuilds.forEach((guild) => {
        const row = document.createElement("div");
        row.className = "profile-extended__row";
        const color = document.createElement("span");
        color.className = "profile-extended__swatch";
        color.style.background = guild.accentColor || "#5865f2";
        const text = document.createElement("div");
        text.className = "profile-extended__row-text";
        const name = document.createElement("strong");
        name.textContent = guild.name || "Guild";
        const meta = document.createElement("small");
        const memberCount = Array.isArray(guild.memberIds) ? guild.memberIds.length : 0;
        meta.textContent = `${memberCount} member${memberCount === 1 ? "" : "s"}`;
        text.appendChild(name);
        text.appendChild(meta);
        row.appendChild(color);
        row.appendChild(text);
        ui.userProfileExtendedGuildsPanel.appendChild(row);
      });
    }
  }
  if (ui.userProfileExtendedFriendsPanel) {
    ui.userProfileExtendedFriendsPanel.hidden = userProfileExtendedTab !== "friends";
    ui.userProfileExtendedFriendsPanel.innerHTML = "";
    if (sharedFriends.length === 0) {
      const empty = document.createElement("div");
      empty.className = "channel-empty";
      empty.textContent = "No shared friends.";
      ui.userProfileExtendedFriendsPanel.appendChild(empty);
    } else {
      sharedFriends.forEach((friend) => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "profile-extended__friend";
        const avatar = document.createElement("div");
        avatar.className = "profile-extended__friend-avatar";
        applyAvatarStyle(avatar, friend, null);
        applyAvatarDecoration(avatar, friend);
        const text = document.createElement("span");
        text.className = "profile-extended__row-text";
        const name = document.createElement("strong");
        name.textContent = displayNameForAccount(friend, null);
        const meta = document.createElement("small");
        const friendStatus = displayStatus(friend, null);
        const friendActivity = accountActivitySummary(friend);
        meta.textContent = friendActivity ? `${friendStatus} · ${friendActivity}` : friendStatus;
        text.appendChild(name);
        text.appendChild(meta);
        row.appendChild(avatar);
        row.appendChild(text);
        row.addEventListener("click", () => {
          if (ui.userProfileExtendedDialog?.open) ui.userProfileExtendedDialog.close();
          openUserPopout(friend);
        });
        ui.userProfileExtendedFriendsPanel.appendChild(row);
      });
    }
  }
}

function openUserProfileExtendedDialog(account, { avatarUrlHint = "" } = {}) {
  if (!account?.id || !ui.userProfileExtendedDialog) return;
  userProfileExtendedAccountId = account.id;
  userProfileExtendedAvatarHint = normalizeRenderableAvatarUrl(avatarUrlHint);
  userProfileExtendedTab = "guilds";
  if (!ui.userProfileExtendedDialog.open) ui.userProfileExtendedDialog.showModal();
  renderUserProfileExtendedDialog();
}

function openExtendedProfileAvatarLightbox() {
  const account = userProfileExtendedAccountId ? getAccountById(userProfileExtendedAccountId) : null;
  if (!account) return;
  const guildId = getActiveConversation()?.type === "channel" ? getActiveGuild()?.id || null : null;
  const displayName = displayNameForAccount(account, guildId);
  const avatarUrl = [
    resolveAccountAvatar(account, guildId).url,
    userProfileExtendedAvatarHint,
    avatarUrlHintFromElement(ui.userProfileExtendedAvatar)
  ].find((entry) => isRenderableAvatarUrl(entry));
  if (!avatarUrl) {
    showToast("No avatar image available for this user.", { tone: "error" });
    return;
  }
  showMediaLightbox(avatarUrl, `${displayName} avatar`, { kind: "image" });
}

function mentionAccountInComposer(account) {
  if (!account?.username || !(ui.messageInput instanceof HTMLTextAreaElement)) return false;
  const conversation = getActiveConversation();
  if (!conversation) return false;
  const prefix = ui.messageInput.value.trim();
  ui.messageInput.value = trimTextForConversation(`${prefix ? `${prefix} ` : ""}@${account.username} `, conversation);
  setComposerDraft(conversation.id, ui.messageInput.value);
  resizeComposerInput();
  ui.messageInput.focus();
  return true;
}

function openProfileContextMenu(event, account, { self = false } = {}) {
  if (!(event instanceof MouseEvent) || !account) return;
  const current = getCurrentAccount();
  const inDm = getViewMode() === "dm";
  const jid = accountBareXmppJid(account);
  openContextMenu(event, [
    { label: "View Profile", action: () => openUserPopout(account) },
    {
      label: "Open DM",
      disabled: !current || account.id === current.id,
      action: () => {
        if (!current || account.id === current.id) return;
        ui.userPopoutDialog?.close?.();
        ui.selfMenuDialog?.close?.();
        openDmWithAccount(account);
      }
    },
    {
      label: inDm || self ? "Insert Username" : "Mention in Composer",
      disabled: !current || account.id === current.id,
      action: () => {
        mentionAccountInComposer(account);
      }
    },
    {
      label: "Copy",
      submenu: [
        { label: "Display Name", action: () => copyText(displayNameForAccount(account, null) || account.username || "") },
        { label: "Username", action: () => copyText(account.username || "") },
        { label: "User ID", action: () => copyText(account.id || "") },
        { label: "XMPP JID", disabled: !jid, action: () => copyText(jid || "") }
      ]
    }
  ]);
}

function forumMessageParts(message) {
  const rawText = typeof message?.text === "string" ? message.text : "";
  if (message?.forumTitle) {
    return { title: message.forumTitle, body: rawText };
  }
  const [firstLine, ...rest] = rawText.split("\n");
  const title = (firstLine || "Untitled Post").trim().slice(0, 100) || "Untitled Post";
  const body = rest.join("\n").trim();
  return { title, body: body || firstLine || "" };
}

function setReplyTarget(conversationId, message, threadId = null) {
  replyTarget = {
    channelId: conversationId,
    messageId: message.id,
    authorName: displayNameForMessage(message),
    text: message.text || "",
    threadId: threadId || null
  };
  renderReplyComposer();
  ui.messageInput.focus();
}

function renderForumThreads(conversationId, channel, messages, currentAccount) {
  const currentUser = currentAccount;
  const activeFindId = getFindActiveMessageId();
  const activeConversation = getActiveConversation();
  channel.forumTags = forumTagsForChannel(channel);
  const forumTags = channel.forumTags;
  const activeTagFilter = getForumThreadTagFilter(channel?.id).filter((id) => forumTags.some((tag) => tag.id === id));
  const topLevel = messages.filter((message) => !message.forumThreadId);
  const repliesByThread = new Map();
  const channelLastReadMs = toTimestampMs(channel?.readState?.[currentAccount?.id]);
  messages.forEach((message) => {
    if (!message.forumThreadId) return;
    if (!repliesByThread.has(message.forumThreadId)) repliesByThread.set(message.forumThreadId, []);
    repliesByThread.get(message.forumThreadId).push(message);
  });

  const threadSortMode = getForumThreadSortMode(channel?.id);
  let threadModels = topLevel.map((post) => {
    const replies = (repliesByThread.get(post.id) || []).slice().sort((a, b) => toTimestampMs(a.ts) - toTimestampMs(b.ts));
    const latestTsMs = replies.reduce((maxTs, replyMessage) => Math.max(maxTs, toTimestampMs(replyMessage.ts)), toTimestampMs(post.ts));
    const postTagIds = normalizeThreadTagIds(post.forumTagIds, forumTags);
    return { post, replies, latestTsMs, postTagIds };
  });
  if (activeTagFilter.length > 0) {
    threadModels = threadModels.filter((entry) => activeTagFilter.some((tagId) => entry.postTagIds.includes(tagId)));
  }
  threadModels.sort((a, b) => {
    if (threadSortMode === "created") return toTimestampMs(b.post.ts) - toTimestampMs(a.post.ts);
    return b.latestTsMs - a.latestTsMs;
  });

  if (threadModels.length > 0) {
    const toolbar = document.createElement("div");
    toolbar.className = "forum-thread-toolbar";

    const sortBtn = document.createElement("button");
    sortBtn.type = "button";
    sortBtn.className = "forum-thread-toolbar__btn";
    sortBtn.textContent = threadSortMode === "created" ? "Sort: Created time" : "Sort: Latest activity";
    sortBtn.addEventListener("click", () => {
      const nextMode = threadSortMode === "created" ? "latest" : "created";
      setForumThreadSortMode(channel?.id, nextMode);
      saveState();
      renderMessages();
    });
    toolbar.appendChild(sortBtn);

    const collapseAllBtn = document.createElement("button");
    collapseAllBtn.type = "button";
    collapseAllBtn.className = "forum-thread-toolbar__btn";
    collapseAllBtn.textContent = "Collapse all";
    collapseAllBtn.addEventListener("click", () => {
      threadModels.forEach(({ post, replies }) => {
        if (replies.length > 0) setForumThreadCollapsed(channel?.id, post.id, true);
      });
      saveState();
      renderMessages();
    });
    toolbar.appendChild(collapseAllBtn);

    const expandAllBtn = document.createElement("button");
    expandAllBtn.type = "button";
    expandAllBtn.className = "forum-thread-toolbar__btn";
    expandAllBtn.textContent = "Expand all";
    expandAllBtn.addEventListener("click", () => {
      threadModels.forEach(({ post, replies }) => {
        if (replies.length > 0) setForumThreadCollapsed(channel?.id, post.id, false);
      });
      saveState();
      renderMessages();
    });
    toolbar.appendChild(expandAllBtn);

    const markAllReadBtn = document.createElement("button");
    markAllReadBtn.type = "button";
    markAllReadBtn.className = "forum-thread-toolbar__btn";
    markAllReadBtn.textContent = "Mark all threads read";
    markAllReadBtn.addEventListener("click", () => {
      threadModels.forEach(({ post, replies }) => {
        const latestThreadTs = replies[replies.length - 1]?.ts || post.ts || new Date().toISOString();
        setForumThreadReadTimestamp(channel?.id, post.id, latestThreadTs);
      });
      saveState();
      renderMessages();
      renderChannels();
    });
    toolbar.appendChild(markAllReadBtn);

    if (forumTags.length > 0) {
      const tagWrap = document.createElement("div");
      tagWrap.className = "forum-tag-filter";
      forumTags.forEach((tag) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = `forum-tag-chip ${activeTagFilter.includes(tag.id) ? "active" : ""}`;
        chip.textContent = tag.name;
        chip.style.setProperty("--tag-color", tag.color || "#5865f2");
        chip.title = `Filter by ${tag.name}`;
        chip.addEventListener("click", () => {
          toggleForumThreadTagFilter(channel?.id, tag.id);
          saveState();
          renderMessages();
        });
        tagWrap.appendChild(chip);
      });
      if (activeTagFilter.length > 0) {
        const clearBtn = document.createElement("button");
        clearBtn.type = "button";
        clearBtn.className = "forum-thread-toolbar__btn";
        clearBtn.textContent = "Clear Tag Filter";
        clearBtn.addEventListener("click", () => {
          setForumThreadTagFilter(channel?.id, []);
          saveState();
          renderMessages();
        });
        tagWrap.appendChild(clearBtn);
      }
      toolbar.appendChild(tagWrap);
    }

    ui.messageList.appendChild(toolbar);
  }

  if (threadModels.length === 0) {
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = activeTagFilter.length > 0
      ? "No threads match selected tags."
      : "No forum posts yet. Start with a post title on the first line.";
    ui.messageList.appendChild(empty);
  }

  threadModels.forEach(({ post, replies, postTagIds }) => {
    const postRow = document.createElement("article");
    postRow.className = "message message--forum message--forum-root";
    if (messageMatchesFindQuery(post, findQuery, "forum")) {
      postRow.classList.add("message--find-hit");
    }
    if (activeFindId && post.id === activeFindId) {
      postRow.classList.add("message--find-active");
    }
    if (isMessageHighlightedForAccount(post, currentAccount)) {
      postRow.classList.add("message--mentioned");
    }
    postRow.dataset.messageId = post.id;

    const head = document.createElement("div");
    head.className = "message-head";

    const userButton = document.createElement("button");
    userButton.className = "message-user";
    userButton.textContent = displayNameForMessage(post);
    if (channel && post.userId) {
      const roleColor = getMemberTopRoleColor(getActiveServer(), post.userId);
      if (roleColor) userButton.style.color = roleColor;
    }
    userButton.addEventListener("click", () => {
      const author = post.userId ? getAccountById(post.userId) : null;
      openUserPopout(author, post.authorName || "Unknown");
    });

    const time = document.createElement("span");
    time.className = "message-time";
    time.textContent = formatTime(post.ts);
    time.title = formatFullTimestamp(post.ts);
    time.addEventListener("click", (event) => {
      if (!event.shiftKey) return;
      event.preventDefault();
      void copyText(post.ts || "").then((copied) => {
        showToast(copied ? "Timestamp copied." : "Failed to copy timestamp.", { tone: copied ? "info" : "error" });
      });
    });
    head.appendChild(userButton);
    head.appendChild(time);
    postRow.appendChild(head);

    const { title, body } = forumMessageParts(post);
    const postAttachments = collectRenderableAttachments(post);
    const postBodyText = stripInlineAttachmentUrlsFromText(body, postAttachments);
    const forumTitle = document.createElement("div");
    forumTitle.className = "forum-post-title";
    forumTitle.textContent = "";
    const collapsed = isForumThreadCollapsed(channel?.id, post.id);
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "forum-thread-toggle";
    toggleBtn.textContent = collapsed ? "▸" : "▾";
    toggleBtn.title = collapsed ? "Expand thread" : "Collapse thread";
    const titleText = document.createElement("span");
    titleText.textContent = title;
    forumTitle.appendChild(toggleBtn);
    forumTitle.appendChild(titleText);
    if (postTagIds.length > 0) {
      const tagInline = document.createElement("span");
      tagInline.className = "forum-thread-tags";
      postTagIds.forEach((tagId) => {
        const tag = forumTags.find((entry) => entry.id === tagId);
        if (!tag) return;
        const chip = document.createElement("span");
        chip.className = "forum-tag-pill";
        chip.textContent = tag.name;
        chip.style.setProperty("--tag-color", tag.color || "#5865f2");
        tagInline.appendChild(chip);
      });
      forumTitle.appendChild(tagInline);
    }
    postRow.appendChild(forumTitle);

    if (postBodyText.trim()) {
      const text = document.createElement("div");
      text.className = "message-text";
      renderMessageText(text, postBodyText);
      postRow.appendChild(text);
    }
    renderMessagePoll(postRow, post, {
      currentUser,
      isDm: false,
      canManageMessages: canCurrentUser("manageMessages"),
      onChanged: () => {
        saveState();
        renderMessages();
      }
    });

    postAttachments.forEach((attachment, index) => {
      renderMessageAttachment(postRow, attachment, { swfKey: `${post.id}:${index}` });
    });
    if (postAttachments.length > 0) bindMessageAttachmentControlLock(postRow);

    const postActions = document.createElement("div");
    postActions.className = "message-actions";
    const replyBtn = document.createElement("button");
    replyBtn.type = "button";
    replyBtn.className = "message-action-btn";
    replyBtn.textContent = "Reply";
    replyBtn.addEventListener("click", () => setReplyTarget(conversationId, post, post.id));
    postActions.appendChild(replyBtn);
    const quoteBtn = document.createElement("button");
    quoteBtn.type = "button";
    quoteBtn.className = "message-action-btn";
    quoteBtn.textContent = "Quote";
    quoteBtn.addEventListener("click", () => quoteMessageInComposer(post));
    postActions.appendChild(quoteBtn);
    const markUnreadBtn = document.createElement("button");
    markUnreadBtn.type = "button";
    markUnreadBtn.className = "message-action-btn";
    markUnreadBtn.textContent = "Mark Unread";
    markUnreadBtn.disabled = !currentAccount?.id;
    markUnreadBtn.addEventListener("click", () => {
      if (!currentAccount?.id) return;
      if (!markConversationUnreadFromMessage(activeConversation, post.id, currentAccount.id)) return;
      saveState();
      renderDmList();
      renderChannels();
      renderMessages();
    });
    postActions.appendChild(markUnreadBtn);
    const markReadBtn = document.createElement("button");
    markReadBtn.type = "button";
    markReadBtn.className = "message-action-btn";
    markReadBtn.textContent = "Mark Thread Read";
    markReadBtn.addEventListener("click", () => {
      const latestThreadTs = replies[replies.length - 1]?.ts || post.ts || new Date().toISOString();
      setForumThreadReadTimestamp(channel?.id, post.id, latestThreadTs);
      saveState();
      renderMessages();
      renderChannels();
    });
    postActions.appendChild(markReadBtn);
    bindMessageActionHoverState(postRow, postActions);
    postRow.appendChild(postActions);

    const threadReadMs = toTimestampMs(getForumThreadReadTimestamp(channel?.id, post.id));
    const effectiveReadMs = Math.max(channelLastReadMs, threadReadMs);
    const unreadReplies = replies.reduce((count, replyMessage) => {
      if (toTimestampMs(replyMessage.ts) <= effectiveReadMs) return count;
      if (replyMessage.userId && replyMessage.userId === currentAccount?.id) return count;
      return count + 1;
    }, 0);
    if (unreadReplies > 0) {
      const unreadBadge = document.createElement("span");
      unreadBadge.className = "forum-thread-unread";
      unreadBadge.textContent = unreadReplies > 99 ? "99+" : `${unreadReplies}`;
      unreadBadge.title = `${unreadReplies} unread replies`;
      forumTitle.appendChild(unreadBadge);
    }
    if (replies.length > 0) {
      const repliesWrap = document.createElement("div");
      repliesWrap.className = "forum-thread-replies";
      repliesWrap.hidden = collapsed;
      replies.forEach((replyMessage) => {
        const replyRow = document.createElement("article");
        replyRow.className = "message message--forum-reply";
        if (messageMatchesFindQuery(replyMessage, findQuery, "forum")) {
          replyRow.classList.add("message--find-hit");
        }
        if (activeFindId && replyMessage.id === activeFindId) {
          replyRow.classList.add("message--find-active");
        }
        if (isMessageHighlightedForAccount(replyMessage, currentAccount)) {
          replyRow.classList.add("message--mentioned");
        }
        replyRow.dataset.messageId = replyMessage.id;

        const replyHead = document.createElement("div");
        replyHead.className = "message-head";

        const replyUserButton = document.createElement("button");
        replyUserButton.className = "message-user";
        replyUserButton.textContent = displayNameForMessage(replyMessage);
        if (channel && replyMessage.userId) {
          const roleColor = getMemberTopRoleColor(getActiveServer(), replyMessage.userId);
          if (roleColor) replyUserButton.style.color = roleColor;
        }
        replyUserButton.addEventListener("click", () => {
          const author = replyMessage.userId ? getAccountById(replyMessage.userId) : null;
          openUserPopout(author, replyMessage.authorName || "Unknown");
        });

        const replyTime = document.createElement("span");
        replyTime.className = "message-time";
        replyTime.textContent = formatTime(replyMessage.ts);
        replyTime.title = formatFullTimestamp(replyMessage.ts);
        replyTime.addEventListener("click", (event) => {
          if (!event.shiftKey) return;
          event.preventDefault();
          void copyText(replyMessage.ts || "").then((copied) => {
            showToast(copied ? "Timestamp copied." : "Failed to copy timestamp.", { tone: copied ? "info" : "error" });
          });
        });
        replyHead.appendChild(replyUserButton);
        replyHead.appendChild(replyTime);
        replyRow.appendChild(replyHead);

        if (replyMessage.replyTo && typeof replyMessage.replyTo === "object") {
          const replyLine = document.createElement("div");
          replyLine.className = "message-reply";
          const replyName = document.createElement("strong");
          replyName.textContent = replyMessage.replyTo.authorName || "Unknown";
          const replyText = document.createElement("span");
          replyText.textContent = replyMessage.replyTo.text?.trim()?.slice(0, 90) || "(empty message)";
          replyLine.appendChild(document.createTextNode("Replying to "));
          replyLine.appendChild(replyName);
          replyLine.appendChild(document.createTextNode(": "));
          replyLine.appendChild(replyText);
          const targetReplyId = resolveReplyTargetMessageId(replyMessage.replyTo, channel);
          if (targetReplyId) {
            replyText.textContent = replyMessage.replyTo.text?.trim()?.slice(0, 90) || replyText.textContent;
          }
          if (targetReplyId) {
            replyLine.title = "Jump to referenced message";
            replyLine.classList.add("message-reply--jump");
            replyLine.addEventListener("click", () => {
              const ok = focusMessageByIdWithHistory(targetReplyId, { toastOnLoad: true });
              if (!ok) showToast("Referenced message is not visible in this view.");
            });
          }
          replyRow.appendChild(replyLine);
        }

        const replyAttachments = collectRenderableAttachments(replyMessage);
        const renderedReplyText = stripInlineAttachmentUrlsFromText(replyMessage.text || "", replyAttachments);
        if (renderedReplyText.trim()) {
          const replyText = document.createElement("div");
          replyText.className = "message-text";
          renderMessageText(replyText, renderedReplyText);
          replyRow.appendChild(replyText);
        }
        renderMessagePoll(replyRow, replyMessage, {
          currentUser,
          isDm: false,
          canManageMessages: canCurrentUser("manageMessages"),
          onChanged: () => {
            saveState();
            renderMessages();
          }
        });

        replyAttachments.forEach((attachment, index) => {
          renderMessageAttachment(replyRow, attachment, { swfKey: `${replyMessage.id}:${index}` });
        });
        if (replyAttachments.length > 0) bindMessageAttachmentControlLock(replyRow);

        const replyActions = document.createElement("div");
        replyActions.className = "message-actions";
        const replyReplyBtn = document.createElement("button");
        replyReplyBtn.type = "button";
        replyReplyBtn.className = "message-action-btn";
        replyReplyBtn.textContent = "Reply";
        replyReplyBtn.addEventListener("click", () => setReplyTarget(conversationId, replyMessage, post.id));
        replyActions.appendChild(replyReplyBtn);
        const replyQuoteBtn = document.createElement("button");
        replyQuoteBtn.type = "button";
        replyQuoteBtn.className = "message-action-btn";
        replyQuoteBtn.textContent = "Quote";
        replyQuoteBtn.addEventListener("click", () => quoteMessageInComposer(replyMessage));
        replyActions.appendChild(replyQuoteBtn);
        const replyUnreadBtn = document.createElement("button");
        replyUnreadBtn.type = "button";
        replyUnreadBtn.className = "message-action-btn";
        replyUnreadBtn.textContent = "Mark Unread";
        replyUnreadBtn.disabled = !currentAccount?.id;
        replyUnreadBtn.addEventListener("click", () => {
          if (!currentAccount?.id) return;
          if (!markConversationUnreadFromMessage(activeConversation, replyMessage.id, currentAccount.id)) return;
          saveState();
          renderDmList();
          renderChannels();
          renderMessages();
        });
        replyActions.appendChild(replyUnreadBtn);
        bindMessageActionHoverState(replyRow, replyActions);
        replyRow.appendChild(replyActions);
        replyRow.addEventListener("contextmenu", (event) => {
          if (document.body?.dataset?.mobile === "on") void triggerHapticFeedback("medium");
          openContextMenu(event, [
            {
              label: "Reply in Thread",
              action: () => setReplyTarget(conversationId, replyMessage, post.id)
            },
            {
              label: "Quote in Composer",
              action: () => quoteMessageInComposer(replyMessage)
            },
            {
              label: "Mark Unread From Here",
              disabled: !currentAccount?.id,
              action: () => {
                if (!currentAccount?.id) return;
                if (!markConversationUnreadFromMessage(activeConversation, replyMessage.id, currentAccount.id)) return;
                saveState();
                renderDmList();
                renderChannels();
                renderMessages();
              }
            },
            {
              label: "Copy Reply ID",
              action: () => copyText(replyMessage.id || "")
            }
          ]);
        });

        repliesWrap.appendChild(replyRow);
      });
      postRow.appendChild(repliesWrap);
      toggleBtn.addEventListener("click", () => {
        const nextCollapsed = !repliesWrap.hidden;
        repliesWrap.hidden = nextCollapsed;
        toggleBtn.textContent = nextCollapsed ? "▸" : "▾";
        toggleBtn.title = nextCollapsed ? "Expand thread" : "Collapse thread";
        setForumThreadCollapsed(channel?.id, post.id, nextCollapsed);
        saveState();
      });
    } else {
      toggleBtn.disabled = true;
      toggleBtn.classList.add("forum-thread-toggle--disabled");
    }
    postRow.addEventListener("contextmenu", (event) => {
      if (document.body?.dataset?.mobile === "on") void triggerHapticFeedback("medium");
      const canManageMessages = currentUser ? canCurrentUser("manageMessages") : false;
      openContextMenu(event, [
        {
          label: "Reply in Thread",
          action: () => setReplyTarget(conversationId, post, post.id)
        },
        {
          label: "Quote in Composer",
          action: () => quoteMessageInComposer(post)
        },
        {
          label: "Mark Thread Read",
          action: () => {
            const latestThreadTs = replies[replies.length - 1]?.ts || post.ts || new Date().toISOString();
            setForumThreadReadTimestamp(channel?.id, post.id, latestThreadTs);
            saveState();
            renderMessages();
            renderChannels();
          }
        },
        {
          label: "Mark Unread From Here",
          disabled: !currentAccount?.id,
          action: () => {
            if (!currentAccount?.id) return;
            if (!markConversationUnreadFromMessage(activeConversation, post.id, currentAccount.id)) return;
            saveState();
            renderDmList();
            renderChannels();
            renderMessages();
          }
        },
        {
          label: replies.length > 0 && !isForumThreadCollapsed(channel?.id, post.id) ? "Collapse Thread" : "Expand Thread",
          disabled: replies.length === 0,
          action: () => {
            if (replies.length === 0) return;
            const nextCollapsed = !isForumThreadCollapsed(channel?.id, post.id);
            setForumThreadCollapsed(channel?.id, post.id, nextCollapsed);
            saveState();
            renderMessages();
          }
        },
        {
          label: "Thread Tags",
          submenu: [
            {
              label: "Clear Tags",
              action: () => {
                post.forumTagIds = [];
                saveState();
                renderMessages();
              }
            },
            ...forumTags.map((tag) => ({
              label: `${postTagIds.includes(tag.id) ? "✓ " : ""}${tag.name}`,
              action: () => {
                const next = postTagIds.includes(tag.id)
                  ? postTagIds.filter((id) => id !== tag.id)
                  : [...postTagIds, tag.id];
                post.forumTagIds = normalizeThreadTagIds(next, forumTags);
                saveState();
                renderMessages();
              }
            }))
          ]
        },
        {
          label: normalizePoll(post.poll)?.closed ? "Reopen Poll" : "Close Poll",
          disabled: !canManagePollMessage(post, { isDm: false, canManageMessages, currentUser }),
          action: () => {
            const next = normalizePoll(post.poll);
            if (!next) return;
            post.poll = { ...next, closed: !next.closed };
            saveState();
            renderMessages();
          }
        },
        {
          label: "Copy Poll Results",
          disabled: !normalizePoll(post.poll),
          action: () => copyText(formatPollResultsText(post))
        },
        {
          label: "Copy",
          submenu: [
            { label: "Thread Post ID", action: () => copyText(post.id || "") },
            { label: "Markdown Quote", action: () => copyText(`> ${(post.text || "").replace(/\n/g, "\n> ")}`) },
            { label: "Post JSON", action: () => copyText(serializeMessageAsJson(post)) }
          ]
        }
      ]);
    });

    ui.messageList.appendChild(postRow);
  });

  ui.messageList.scrollTop = ui.messageList.scrollHeight;
}

function renderDmHome() {
  const current = getCurrentAccount();
  const homeTab = currentDmHomeTab();
  renderDmHomeSidebarNav();
  if (ui.openCallBtn) {
    ui.openCallBtn.hidden = true;
    ui.openCallBtn.disabled = true;
  }
  if (ui.openXmppCallBtn) {
    ui.openXmppCallBtn.hidden = true;
    ui.openXmppCallBtn.disabled = true;
  }
  if (ui.copyCallLinkBtn) {
    ui.copyCallLinkBtn.hidden = true;
    ui.copyCallLinkBtn.disabled = true;
  }
  if (ui.openWhiteboardBtn) {
    ui.openWhiteboardBtn.hidden = true;
    ui.openWhiteboardBtn.disabled = true;
  }
  const headerTitle = tUi(`dm.home.${homeTab}.title`, tUi(`dm.tab.${homeTab}`, "Friends"));
  const headerSubtitle = tUi(`dm.home.${homeTab}.subtitle`, "Direct messages");
  setActiveChannelHeader(headerTitle, "@", headerTitle, "Direct messages");
  setActiveChannelTopic(headerSubtitle);
  ui.messageInput.placeholder = "Pick a DM to start chatting";
  if (ui.markChannelReadBtn) ui.markChannelReadBtn.hidden = true;
  if (ui.nextUnreadBtn) ui.nextUnreadBtn.hidden = true;
  if (ui.openPinsBtn) setHeaderActionButtonLabel(ui.openPinsBtn, "Pins");
  if (ui.openGuildSettingsBtn) ui.openGuildSettingsBtn.hidden = true;
  if (ui.openChannelSettingsBtn) ui.openChannelSettingsBtn.hidden = true;
  if (ui.editTopicBtn) ui.editTopicBtn.hidden = true;
  if (ui.openRolesBtn) ui.openRolesBtn.hidden = true;
  ui.messageList.innerHTML = "";
  const shell = document.createElement("section");
  shell.className = "dm-home";
  const title = document.createElement("h3");
  title.textContent = headerTitle;
  shell.appendChild(title);
  const subtitle = document.createElement("p");
  subtitle.textContent = headerSubtitle;
  shell.appendChild(subtitle);
  const section = document.createElement("section");
  section.className = "dm-home__section";

  const appendPlaceholder = (text) => {
    const empty = document.createElement("div");
    empty.className = "dm-home__placeholder";
    empty.textContent = text;
    section.appendChild(empty);
  };

  const appendStatCard = (value, label) => {
    const card = document.createElement("div");
    card.className = "dm-home__stat-card";
    const strong = document.createElement("strong");
    strong.textContent = String(value);
    const small = document.createElement("small");
    small.textContent = label;
    card.appendChild(strong);
    card.appendChild(small);
    return card;
  };

  if (homeTab === "friends") {
    const list = document.createElement("div");
    list.className = "dm-home__friends";
    const peers = listDmPeerAccounts(current);
    if (peers.length <= 0) {
      appendPlaceholder("No DM friends yet. Use + Add Friend in the sidebar.");
    } else {
      peers.slice(0, 80).forEach((peer) => {
        const thread = state.dmThreads.find((entry) => (
          Array.isArray(entry?.participantIds)
          && entry.participantIds.includes(current?.id || "")
          && entry.participantIds.includes(peer.id)
        )) || null;
        if (!thread) return;
        const last = thread.messages?.[thread.messages.length - 1] || null;
        const card = document.createElement("button");
        card.type = "button";
        card.className = "dm-home__item";
        const avatar = document.createElement("div");
        avatar.className = "dm-home__avatar";
        applyAvatarStyle(avatar, peer, null);
        applyAvatarDecoration(avatar, peer);
        const dot = document.createElement("span");
        dot.className = `presence-dot presence-${normalizePresence(peer.presence)}`;
        avatar.appendChild(dot);
        const body = document.createElement("div");
        body.className = "dm-home__body";
        const top = document.createElement("div");
        top.className = "dm-home__top";
        const name = document.createElement("strong");
        name.textContent = dmPrimaryLabelForAccount(peer);
        const ts = document.createElement("small");
        ts.className = "dm-home__time";
        ts.textContent = last?.ts ? formatTime(last.ts) : "";
        top.appendChild(name);
        top.appendChild(ts);
        const status = document.createElement("small");
        status.className = "dm-home__friend-status";
        status.textContent = displayStatus(peer, null);
        body.appendChild(top);
        body.appendChild(status);
        const activity = accountActivitySummary(peer);
        if (activity) {
          const activityRow = document.createElement("small");
          activityRow.className = "dm-home__friend-activity";
          activityRow.textContent = activity;
          body.appendChild(activityRow);
        } else {
          const preview = document.createElement("small");
          preview.textContent = (last?.text || "(no messages)").slice(0, 80);
          body.appendChild(preview);
        }
        card.appendChild(avatar);
        card.appendChild(body);
        card.addEventListener("click", () => {
          state.viewMode = "dm";
          state.activeDmId = thread.id;
          saveState();
          render();
        });
        list.appendChild(card);
      });
      section.appendChild(list);
    }
  } else if (homeTab === "library") {
    const guilds = listAccessibleGuildsForAccount(current);
    const countFromKey = (key) => guilds.reduce((sum, guild) => sum + (Array.isArray(guild?.[key]) ? guild[key].length : 0), 0);
    const totalMedia = (
      countFromKey("customGifs")
      + countFromKey("customStickers")
      + countFromKey("customSvgs")
      + countFromKey("customPdfs")
      + countFromKey("customTexts")
      + countFromKey("customDocs")
      + countFromKey("customSwfs")
      + countFromKey("customHtmls")
    );
    const stats = document.createElement("div");
    stats.className = "dm-home__stat-grid";
    stats.appendChild(appendStatCard(totalMedia, tUi("dm.home.library.stat.mediaItems", "custom media items")));
    stats.appendChild(appendStatCard(state.savedSwfs.length, tUi("dm.home.library.stat.savedSwfs", "saved SWFs")));
    stats.appendChild(appendStatCard((getPreferences().gifFavorites || []).length, tUi("dm.home.library.stat.gifFavorites", "GIF favorites")));
    stats.appendChild(appendStatCard((getPreferences().gifGroups || []).length, tUi("dm.home.library.stat.gifGroups", "GIF groups")));
    section.appendChild(stats);
    const actions = document.createElement("div");
    actions.className = "dm-home__action-row";
    const mediaBtn = document.createElement("button");
    mediaBtn.type = "button";
    mediaBtn.textContent = tUi("dm.home.library.action.openPicker", "Open Media Picker");
    mediaBtn.addEventListener("click", () => openMediaPickerWithTab("gif"));
    const shelfBtn = document.createElement("button");
    shelfBtn.type = "button";
    shelfBtn.textContent = tUi("dm.home.library.action.toggleShelf", "Toggle SWF Shelf");
    shelfBtn.addEventListener("click", () => {
      if (!ui.toggleSwfShelfBtn) return;
      ui.toggleSwfShelfBtn.click();
    });
    actions.appendChild(mediaBtn);
    actions.appendChild(shelfBtn);
    section.appendChild(actions);
  } else if (homeTab === "requests") {
    const incoming = listXmppContactRequests("incoming");
    const outgoing = listXmppContactRequests("outgoing");
    const stats = document.createElement("div");
    stats.className = "dm-home__stat-grid";
    stats.appendChild(appendStatCard(incoming.length, tUi("dm.home.requests.stat.incoming", "incoming requests")));
    stats.appendChild(appendStatCard(outgoing.length, tUi("dm.home.requests.stat.outgoing", "outgoing requests")));
    section.appendChild(stats);
    const filterWrap = document.createElement("div");
    filterWrap.className = "dm-home__action-row";
    ["all", "incoming", "outgoing"].forEach((mode) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = tUi(`dm.requests.filter.${mode}`, mode);
      if (normalizeDmHomeRequestsFilter(dmHomeRequestsFilter) === mode) btn.classList.add("active");
      btn.addEventListener("click", () => {
        dmHomeRequestsFilter = mode;
        renderMessages();
      });
      filterWrap.appendChild(btn);
    });
    section.appendChild(filterWrap);

    const bulk = document.createElement("div");
    bulk.className = "dm-home__action-row";
    const acceptAllBtn = document.createElement("button");
    acceptAllBtn.type = "button";
    acceptAllBtn.textContent = tUi("dm.requests.bulk.acceptAll", "Accept All");
    acceptAllBtn.addEventListener("click", () => {
      if (incoming.length <= 0) {
        showToast(tUi("dm.home.requests.bulk.noneIncoming", "No incoming requests to accept."), { tone: "error" });
        return;
      }
      let changed = 0;
      incoming.forEach((entry) => {
        if (!acceptXmppContactRequest(entry.jid)) return;
        const peer = ensureAccountByXmppJid(entry.jid, entry.name || "");
        if (peer && current) getOrCreateDmThread(current, peer);
        changed += 1;
      });
      if (changed > 0) {
        saveState();
        render();
      }
    });
    const declineAllBtn = document.createElement("button");
    declineAllBtn.type = "button";
    declineAllBtn.textContent = tUi("dm.requests.bulk.declineAll", "Decline All");
    declineAllBtn.addEventListener("click", () => {
      if (incoming.length <= 0) {
        showToast(tUi("dm.home.requests.bulk.noneIncoming", "No incoming requests to accept."), { tone: "error" });
        return;
      }
      let changed = 0;
      incoming.forEach((entry) => {
        if (!declineXmppContactRequest(entry.jid)) return;
        changed += 1;
      });
      if (changed > 0) {
        saveState();
        render();
      }
    });
    const cancelAllBtn = document.createElement("button");
    cancelAllBtn.type = "button";
    cancelAllBtn.textContent = tUi("dm.requests.bulk.cancelAll", "Cancel All");
    cancelAllBtn.addEventListener("click", () => {
      if (outgoing.length <= 0) {
        showToast(tUi("dm.home.requests.bulk.noneOutgoing", "No outgoing requests to cancel."), { tone: "error" });
        return;
      }
      let changed = 0;
      outgoing.forEach((entry) => {
        if (!cancelXmppOutgoingContactRequest(entry.jid)) return;
        changed += 1;
      });
      if (changed > 0) {
        saveState();
        render();
      }
    });
    bulk.appendChild(acceptAllBtn);
    bulk.appendChild(declineAllBtn);
    bulk.appendChild(cancelAllBtn);
    section.appendChild(bulk);

    const filterMode = normalizeDmHomeRequestsFilter(dmHomeRequestsFilter);
    const incomingVisible = filterMode === "all" || filterMode === "incoming";
    const outgoingVisible = filterMode === "all" || filterMode === "outgoing";
    if (!incomingVisible && !outgoingVisible) dmHomeRequestsFilter = "all";
    let renderedRows = 0;
    if (incomingVisible) {
      incoming.slice(0, 40).forEach((entry) => {
        const row = document.createElement("div");
        row.className = "dm-home__item dm-home__item--wide";
        const body = document.createElement("div");
        body.className = "dm-home__body";
        const top = document.createElement("div");
        top.className = "dm-home__top";
        const name = document.createElement("strong");
        name.textContent = entry.name || entry.jid || tUi("dm.home.requests.entry.unknown", "Unknown");
        const meta = document.createElement("small");
        meta.textContent = tUi("dm.requests.incoming", "Incoming");
        top.appendChild(name);
        top.appendChild(meta);
        const jid = document.createElement("small");
        jid.textContent = entry.jid || "";
        body.appendChild(top);
        body.appendChild(jid);
        const actions = document.createElement("div");
        actions.className = "dm-home__action-row";
        const acceptBtn = document.createElement("button");
        acceptBtn.type = "button";
        acceptBtn.textContent = tUi("common.accept", "Accept");
        acceptBtn.addEventListener("click", () => {
          if (!acceptXmppContactRequest(entry.jid)) {
            showToast("Could not accept request.", { tone: "error" });
            return;
          }
          const peer = ensureAccountByXmppJid(entry.jid, entry.name || "");
          if (peer && current) getOrCreateDmThread(current, peer);
          saveState();
          render();
        });
        const declineBtn = document.createElement("button");
        declineBtn.type = "button";
        declineBtn.textContent = tUi("common.decline", "Decline");
        declineBtn.addEventListener("click", () => {
          if (!declineXmppContactRequest(entry.jid)) {
            showToast("Could not decline request.", { tone: "error" });
            return;
          }
          saveState();
          render();
        });
        actions.appendChild(acceptBtn);
        actions.appendChild(declineBtn);
        row.appendChild(body);
        row.appendChild(actions);
        section.appendChild(row);
        renderedRows += 1;
      });
    }
    if (outgoingVisible) {
      outgoing.slice(0, 40).forEach((entry) => {
        const row = document.createElement("div");
        row.className = "dm-home__item dm-home__item--wide";
        const body = document.createElement("div");
        body.className = "dm-home__body";
        const top = document.createElement("div");
        top.className = "dm-home__top";
        const name = document.createElement("strong");
        name.textContent = entry.name || entry.jid || tUi("dm.home.requests.entry.unknown", "Unknown");
        const meta = document.createElement("small");
        meta.textContent = tUi("dm.requests.outgoing", "Outgoing");
        top.appendChild(name);
        top.appendChild(meta);
        const jid = document.createElement("small");
        jid.textContent = entry.jid || "";
        body.appendChild(top);
        body.appendChild(jid);
        const actions = document.createElement("div");
        actions.className = "dm-home__action-row";
        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.textContent = tUi("common.cancel", "Cancel");
        cancelBtn.addEventListener("click", () => {
          if (!cancelXmppOutgoingContactRequest(entry.jid)) {
            showToast("Could not cancel request.", { tone: "error" });
            return;
          }
          saveState();
          render();
        });
        actions.appendChild(cancelBtn);
        row.appendChild(body);
        row.appendChild(actions);
        section.appendChild(row);
        renderedRows += 1;
      });
    }
    if (renderedRows <= 0) {
      appendPlaceholder(tUi("dm.requests.none", "No message requests right now."));
    }
  } else if (homeTab === "nitro") {
    appendPlaceholder(tUi("dm.home.nitro.placeholder", "Nitro-style perks are available through profile cosmetics and effects in this client."));
    const actions = document.createElement("div");
    actions.className = "dm-home__action-row";
    const profileBtn = document.createElement("button");
    profileBtn.type = "button";
    profileBtn.textContent = tUi("dm.home.nitro.action.editProfile", "Edit Profile");
    profileBtn.addEventListener("click", () => openProfileEditor());
    const cosmeticsBtn = document.createElement("button");
    cosmeticsBtn.type = "button";
    cosmeticsBtn.textContent = tUi("dm.home.nitro.action.openCosmetics", "Open Cosmetics");
    cosmeticsBtn.addEventListener("click", () => openCosmeticsDialog("effect"));
    actions.appendChild(profileBtn);
    actions.appendChild(cosmeticsBtn);
    section.appendChild(actions);
  } else if (homeTab === "shop") {
    appendPlaceholder(tUi("dm.home.shop.placeholder", "Browse and unlock decorations, effects, and seasonal bundles."));
    const actions = document.createElement("div");
    actions.className = "dm-home__action-row";
    const openShopBtn = document.createElement("button");
    openShopBtn.type = "button";
    openShopBtn.textContent = tUi("dm.home.shop.action.open", "Open Shop");
    openShopBtn.addEventListener("click", () => openCosmeticsDialog("decor"));
    actions.appendChild(openShopBtn);
    section.appendChild(actions);
  } else {
    const badgeCount = current ? resolveQuestBadgesForAccount(current.id).length : 0;
    const stats = document.createElement("div");
    stats.className = "dm-home__stat-grid";
    stats.appendChild(appendStatCard(badgeCount, tUi("dm.home.quests.stat.badges", "quest badges")));
    section.appendChild(stats);
    appendPlaceholder(current ? formatQuestSummaryText(current.id) : tUi("dm.home.quests.placeholder.signIn", "Sign in to view quest progress."));
  }

  shell.appendChild(section);
  ui.messageList.appendChild(shell);
  updateJumpToBottomButton();
  renderComposerMeta();
}

function renderVoiceStageSurface(channel) {
  if (!channel) return;
  const guild = getActiveGuild();
  const current = getCurrentAccount();
  if (!guild || !current) return;
  ensureVoiceStateForChannel(channel);
  const isConnected = channel.voiceState.connectedIds.includes(current.id);
  const isMuted = channel.voiceState.mutedIds.includes(current.id);
  const hasRaised = channel.voiceState.raisedHandIds.includes(current.id);
  const isSpeaker = channel.voiceState.speakerIds.includes(current.id);
  const canModerateStage = channel.type === "stage" && canModerateStageChannel(channel);

  const shell = document.createElement("section");
  shell.className = "voice-stage";
  const title = document.createElement("h3");
  title.textContent = channel.type === "stage" ? "Stage Channel" : "Voice Channel";
  const subtitle = document.createElement("p");
  subtitle.textContent = channel.type === "stage"
    ? "Join the stage to listen. Raise your hand to request speaking."
    : "Join voice and use mute controls for this channel.";
  shell.appendChild(title);
  shell.appendChild(subtitle);

  const stats = document.createElement("div");
  stats.className = "voice-stage__stats";
  const listenersChip = document.createElement("span");
  listenersChip.textContent = `${channel.voiceState.connectedIds.length} connected`;
  stats.appendChild(listenersChip);
  if (channel.type === "stage") {
    const speakersChip = document.createElement("span");
    speakersChip.textContent = `${channel.voiceState.speakerIds.length} speakers`;
    stats.appendChild(speakersChip);
    const queueChip = document.createElement("span");
    queueChip.textContent = `${channel.voiceState.raisedHandIds.length} queue`;
    stats.appendChild(queueChip);
  }
  shell.appendChild(stats);

  const controls = document.createElement("div");
  controls.className = "voice-stage__controls";

  const joinBtn = document.createElement("button");
  joinBtn.type = "button";
  joinBtn.textContent = isConnected ? "Leave Channel" : "Join Channel";
  joinBtn.addEventListener("click", () => {
    const changed = isConnected
      ? leaveVoiceLikeChannel(channel, current.id)
      : joinVoiceLikeChannel(channel, current.id);
    if (!changed) return;
    saveState();
    renderMessages();
    renderMemberList();
  });
  controls.appendChild(joinBtn);

  const muteBtn = document.createElement("button");
  muteBtn.type = "button";
  muteBtn.textContent = isMuted ? "Unmute" : "Mute";
  muteBtn.disabled = !isConnected;
  muteBtn.addEventListener("click", () => {
    if (!toggleVoiceMuteForSelf(channel, current.id)) return;
    saveState();
    renderMessages();
    renderMemberList();
  });
  controls.appendChild(muteBtn);

  const copyLinkBtn = document.createElement("button");
  copyLinkBtn.type = "button";
  copyLinkBtn.textContent = "Copy Channel Link";
  copyLinkBtn.addEventListener("click", () => {
    const guild = getActiveGuild();
    if (!guild) return;
    const link = buildChannelPermalink(guild.id, channel.id);
    void copyText(link).then((ok) => {
      showToast(ok ? "Channel link copied." : "Failed to copy channel link.", { tone: ok ? "info" : "error" });
    });
  });
  controls.appendChild(copyLinkBtn);

  const startCallBtn = document.createElement("button");
  startCallBtn.type = "button";
  startCallBtn.textContent = "Start AV Call";
  startCallBtn.addEventListener("click", () => {
    launchConversationCall({ screenShare: false, autoPost: true });
  });
  controls.appendChild(startCallBtn);

  const screenCallBtn = document.createElement("button");
  screenCallBtn.type = "button";
  screenCallBtn.textContent = "Start Screen Share";
  screenCallBtn.addEventListener("click", () => {
    launchConversationCall({ screenShare: true, autoPost: true });
  });
  controls.appendChild(screenCallBtn);

  const xmppCallBtn = document.createElement("button");
  xmppCallBtn.type = "button";
  xmppCallBtn.textContent = "Start XMPP Call";
  xmppCallBtn.addEventListener("click", () => {
    launchNativeXmppConversationCall({ screenShare: false });
  });
  controls.appendChild(xmppCallBtn);

  const xmppScreenBtn = document.createElement("button");
  xmppScreenBtn.type = "button";
  xmppScreenBtn.textContent = "XMPP Screen";
  xmppScreenBtn.addEventListener("click", () => {
    launchNativeXmppConversationCall({ screenShare: true });
  });
  controls.appendChild(xmppScreenBtn);

  const whiteboardBtn = document.createElement("button");
  whiteboardBtn.type = "button";
  whiteboardBtn.textContent = "Open Whiteboard";
  whiteboardBtn.addEventListener("click", () => {
    launchConversationWhiteboard({ autoPost: false });
  });
  controls.appendChild(whiteboardBtn);

  if (channel.type === "stage") {
    const handBtn = document.createElement("button");
    handBtn.type = "button";
    handBtn.textContent = hasRaised ? "Lower Hand" : "Raise Hand";
    handBtn.disabled = !isConnected;
    handBtn.addEventListener("click", () => {
      if (!toggleRaisedHandForSelf(channel, current.id)) return;
      saveState();
      renderMessages();
      renderMemberList();
    });
    controls.appendChild(handBtn);

    if (canModerateStage) {
      const speakerBtn = document.createElement("button");
      speakerBtn.type = "button";
      speakerBtn.textContent = isSpeaker ? "Leave Speaker" : "Become Speaker";
      speakerBtn.disabled = !isConnected;
      speakerBtn.addEventListener("click", () => {
        if (!toggleStageSpeaker(channel, current.id)) return;
        saveState();
        renderMessages();
        renderMemberList();
      });
      controls.appendChild(speakerBtn);
    }
  }
  shell.appendChild(controls);

  const list = document.createElement("div");
  list.className = "voice-stage__list";
  const connected = channel.voiceState.connectedIds
    .map((id) => getAccountById(id))
    .filter(Boolean);
  if (connected.length === 0) {
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = "Nobody is connected yet.";
    list.appendChild(empty);
  } else {
    connected.forEach((account) => {
      const row = document.createElement("div");
      row.className = "voice-stage__member";
      const name = document.createElement("strong");
      name.textContent = displayNameForAccount(account, guild.id);
      const flags = [];
      if (channel.voiceState.mutedIds.includes(account.id)) flags.push("Muted");
      if (channel.type === "stage" && channel.voiceState.speakerIds.includes(account.id)) flags.push("Speaker");
      if (channel.type === "stage" && channel.voiceState.raisedHandIds.includes(account.id)) flags.push("Hand Raised");
      const meta = document.createElement("small");
      meta.textContent = flags.length > 0 ? flags.join(" · ") : "Listening";
      row.appendChild(name);
      row.appendChild(meta);
      list.appendChild(row);
    });
  }
  shell.appendChild(list);

  if (channel.type === "stage" && canModerateStage) {
    const mod = document.createElement("section");
    mod.className = "voice-stage__moderation";
    const modTitle = document.createElement("h4");
    modTitle.textContent = "Stage Moderation";
    mod.appendChild(modTitle);

    const raised = channel.voiceState.raisedHandIds
      .map((id) => getAccountById(id))
      .filter(Boolean);
    const queue = document.createElement("div");
    queue.className = "voice-stage__queue";
    if (raised.length === 0) {
      const empty = document.createElement("small");
      empty.textContent = "No raised hands.";
      queue.appendChild(empty);
    } else {
      raised.forEach((account) => {
        const row = document.createElement("div");
        row.className = "voice-stage__queue-row";
        const label = document.createElement("strong");
        label.textContent = displayNameForAccount(account, guild.id);
        row.appendChild(label);

        const approve = document.createElement("button");
        approve.type = "button";
        approve.textContent = "Approve";
        approve.addEventListener("click", () => {
          ensureVoiceStateForChannel(channel);
          const changed = setStageSpeakerState(channel, account.id, true);
          if (!changed) return;
          addVoiceActivity(channel, current.id, "approved", displayNameForAccount(account, guild.id));
          saveState();
          renderMessages();
          renderMemberList();
        });
        row.appendChild(approve);

        const deny = document.createElement("button");
        deny.type = "button";
        deny.textContent = "Dismiss";
        deny.addEventListener("click", () => {
          ensureVoiceStateForChannel(channel);
          const changed = setStageRaisedHandState(channel, account.id, false);
          if (!changed) return;
          addVoiceActivity(channel, current.id, "dismissed", displayNameForAccount(account, guild.id));
          saveState();
          renderMessages();
          renderMemberList();
        });
        row.appendChild(deny);
        queue.appendChild(row);
      });
    }
    mod.appendChild(queue);

    const participants = connected.filter((account) => account.id !== current.id);
    const people = document.createElement("div");
    people.className = "voice-stage__queue";
    if (participants.length > 0) {
      participants.forEach((account) => {
        const row = document.createElement("div");
        row.className = "voice-stage__queue-row";
        const label = document.createElement("strong");
        label.textContent = displayNameForAccount(account, guild.id);
        row.appendChild(label);

        const memberMuted = channel.voiceState.mutedIds.includes(account.id);
        const memberSpeaker = channel.voiceState.speakerIds.includes(account.id);

        const muteBtnMember = document.createElement("button");
        muteBtnMember.type = "button";
        muteBtnMember.textContent = memberMuted ? "Unmute" : "Mute";
        muteBtnMember.addEventListener("click", () => {
          const changed = setVoiceMuteState(channel, account.id, !memberMuted);
          if (!changed) return;
          addVoiceActivity(channel, current.id, memberMuted ? "unmute" : "mute", displayNameForAccount(account, guild.id));
          saveState();
          renderMessages();
          renderMemberList();
        });
        row.appendChild(muteBtnMember);

        const speakerBtnMember = document.createElement("button");
        speakerBtnMember.type = "button";
        speakerBtnMember.textContent = memberSpeaker ? "Demote" : "Promote";
        speakerBtnMember.addEventListener("click", () => {
          const changed = setStageSpeakerState(channel, account.id, !memberSpeaker);
          if (!changed) return;
          addVoiceActivity(channel, current.id, memberSpeaker ? "demoted" : "promoted", displayNameForAccount(account, guild.id));
          saveState();
          renderMessages();
          renderMemberList();
        });
        row.appendChild(speakerBtnMember);

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.textContent = "Disconnect";
        removeBtn.addEventListener("click", () => {
          if (!leaveVoiceLikeChannel(channel, account.id)) return;
          addVoiceActivity(channel, current.id, "disconnected", displayNameForAccount(account, guild.id));
          saveState();
          renderMessages();
          renderMemberList();
        });
        row.appendChild(removeBtn);
        people.appendChild(row);
      });
    }
    mod.appendChild(people);
    shell.appendChild(mod);
  }

  const activityRows = (channel.voiceState.activity || []).slice(-6).reverse();
  if (activityRows.length > 0) {
    const activity = document.createElement("section");
    activity.className = "voice-stage__activity";
    const activityTitle = document.createElement("h4");
    activityTitle.textContent = "Live Activity";
    activity.appendChild(activityTitle);
    const activityList = document.createElement("div");
    activityList.className = "voice-stage__activity-list";
    activityRows.forEach((entry) => {
      const row = document.createElement("div");
      row.className = "voice-stage__activity-row";
      const label = document.createElement("small");
      label.textContent = describeVoiceActivity(entry, guild);
      const ts = document.createElement("span");
      ts.textContent = formatTime(entry.ts);
      row.appendChild(label);
      row.appendChild(ts);
      activityList.appendChild(row);
    });
    activity.appendChild(activityList);
    shell.appendChild(activity);
  }
  ui.messageList.appendChild(shell);
  updateJumpToBottomButton();
  renderComposerMeta();
}
