/*
 * App member list runtime extracted from app.js.
 * Functions here intentionally bind to app globals at call time.
 */

function renderMemberList() {
  const filter = memberSearchTerm.trim().toLowerCase();
  const presenceFilter = normalizeMemberPresenceFilter(memberPresenceFilter);
  if (ui.memberSearchInput && ui.memberSearchInput.value !== memberSearchTerm) {
    ui.memberSearchInput.value = memberSearchTerm;
  }
  ui.memberPresenceFilterButtons?.forEach((button) => {
    const active = button.dataset.memberFilter === presenceFilter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  const matchesMemberFilter = (account, guildId = null) => {
    if (!account) return false;
    const presence = normalizePresence(account.presence);
    if (presenceFilter === "online" && presence === "invisible") return false;
    if (presenceFilter === "offline" && presence !== "invisible") return false;
    if (!filter) return true;
    const haystack = [
      account.username,
      account.displayName,
      displayNameForAccount(account, guildId),
      displayStatus(account, guildId),
      presenceLabel(account.presence),
      accountActivitySummary(account)
    ].join(" ").toLowerCase();
    return haystack.includes(filter);
  };
  const activeDm = getActiveDmThread();
  if (activeDm) {
    const current = getCurrentAccount();
    const dmAccounts = activeDm.participantIds
      .map((id) => getAccountById(id))
      .filter((account) => matchesMemberFilter(account, null));
    if (ui.memberPanelTitle) ui.memberPanelTitle.textContent = `Members — ${dmAccounts.length}`;
    ui.memberList.innerHTML = "";
    const title = document.createElement("div");
    title.className = "member-group-title";
    title.textContent = "Direct Message";
    ui.memberList.appendChild(title);
    dmAccounts.forEach((account) => {
        const row = document.createElement("button");
        row.className = "member-item";
        applyNameplatePlateStyle(row, account);
        const avatar = document.createElement("div");
        avatar.className = "member-avatar";
        if (account?.xmppJid) maybeFetchXmppAvatarForJid(account.xmppJid);
        applyAvatarStyle(avatar, account, null);
        applyAvatarDecoration(avatar, account);
        const dot = document.createElement("span");
        dot.className = `presence-dot presence-${normalizePresence(account.presence)}`;
        avatar.appendChild(dot);
        const meta = document.createElement("span");
        meta.className = "member-meta";
        const label = document.createElement("span");
        label.className = "member-meta__name";
        label.textContent = displayNameForAccount(account, null);
        const tag = accountGuildTag(account);
        if (tag) {
          const tagChip = document.createElement("span");
          tagChip.className = "guild-tag-chip";
          tagChip.textContent = tag;
          tagChip.title = "Guild tag";
          tagChip.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            showGuildTagInfo(account);
          });
          label.appendChild(document.createTextNode(" "));
          label.appendChild(tagChip);
        }
        const status = document.createElement("small");
        status.className = "member-meta__status";
        const dmStatus = presenceLabel(account.presence);
        const dmActivity = accountActivitySummary(account);
        status.textContent = dmActivity ? `${dmStatus} · ${dmActivity}` : dmStatus;
        meta.appendChild(label);
        meta.appendChild(status);
        row.appendChild(avatar);
        row.appendChild(meta);
        row.addEventListener("click", () => openUserPopout(account));
        row.addEventListener("dblclick", () => mentionInComposer(account));
        row.addEventListener("contextmenu", (event) => {
          openContextMenu(event, [
            { label: "View Profile", action: () => openUserPopout(account) },
            { label: "Start DM", disabled: account.id === current?.id, action: () => openDmWithAccount(account) },
            { label: "Show Quest Summary", action: () => showToast(formatQuestSummaryText(account.id)) },
            {
              label: "Copy",
              submenu: [
                { label: "Display Name", action: () => copyText(displayNameForAccount(account, null)) },
                { label: "Username", action: () => copyText(`@${account.username}`) },
                { label: "User ID", action: () => copyText(account.id) },
                { label: "Guild Tag", disabled: !accountGuildTag(account), action: () => copyText(accountGuildTag(account)) },
                { label: "Avatar Decoration", disabled: !accountDecorationEmoji(account), action: () => copyText(accountDecorationEmoji(account)) },
                { label: "Nameplate URL", disabled: !accountNameplateSvg(account), action: () => copyText(accountNameplateSvg(account)) }
              ]
            }
          ]);
        });
        ui.memberList.appendChild(row);
      });
    if (dmAccounts.length === 0) {
      const empty = document.createElement("div");
      empty.className = "channel-empty";
      empty.textContent = "No members match your filter.";
      ui.memberList.appendChild(empty);
    }
    return;
  }
  const server = getActiveServer();
  ui.memberList.innerHTML = "";
  if (!server) {
    if (ui.memberPanelTitle) ui.memberPanelTitle.textContent = "Members";
    return;
  }
  const activeChannel = getActiveChannel();
  if (activeChannel && (activeChannel.type === "voice" || activeChannel.type === "stage")) {
    ensureVoiceStateForChannel(activeChannel);
    const current = getCurrentAccount();
    const connectedIds = activeChannel.voiceState.connectedIds.filter((id) => server.memberIds.includes(id));
    const connectedAccounts = connectedIds
      .map((id) => getAccountById(id))
      .filter((account) => account && matchesMemberFilter(account, server.id));
    if (ui.memberPanelTitle) ui.memberPanelTitle.textContent = `In Channel — ${connectedAccounts.length}`;
    const title = document.createElement("div");
    title.className = "member-group-title";
    title.textContent = activeChannel.type === "stage" ? "Audience / Speakers" : "Connected";
    ui.memberList.appendChild(title);
    if (connectedAccounts.length === 0) {
      const empty = document.createElement("div");
      empty.className = "channel-empty";
      empty.textContent = "No one connected.";
      ui.memberList.appendChild(empty);
      return;
    }
    connectedAccounts.forEach((account) => {
      const row = document.createElement("button");
      row.className = "member-item";
      applyNameplatePlateStyle(row, account);
      const avatar = document.createElement("div");
      avatar.className = "member-avatar";
      if (account?.xmppJid) maybeFetchXmppAvatarForJid(account.xmppJid);
      applyAvatarStyle(avatar, account, server.id);
      applyAvatarDecoration(avatar, account);
      const dot = document.createElement("span");
      dot.className = `presence-dot presence-${normalizePresence(account.presence)}`;
      avatar.appendChild(dot);
      const meta = document.createElement("span");
      meta.className = "member-meta";
      const label = document.createElement("span");
      label.className = "member-meta__name";
      label.textContent = displayNameForAccount(account, server.id);
      const roleColor = getMemberTopRoleColor(server, account.id);
      if (roleColor) label.style.color = roleColor;
      const status = document.createElement("small");
      status.className = "member-meta__status";
      const flags = [];
      if (activeChannel.voiceState.mutedIds.includes(account.id)) flags.push("Muted");
      if (activeChannel.type === "stage" && activeChannel.voiceState.speakerIds.includes(account.id)) flags.push("Speaker");
      if (activeChannel.type === "stage" && activeChannel.voiceState.raisedHandIds.includes(account.id)) flags.push("Hand Raised");
      status.textContent = flags.length > 0 ? flags.join(" · ") : "Connected";
      meta.appendChild(label);
      meta.appendChild(status);
      row.appendChild(avatar);
      row.appendChild(meta);
      row.addEventListener("click", () => openUserPopout(account));
      row.addEventListener("dblclick", () => mentionInComposer(account));
      row.addEventListener("contextmenu", (event) => {
        openContextMenu(event, [
          { label: "View Profile", action: () => openUserPopout(account) },
          { label: "Start DM", disabled: account.id === current?.id, action: () => openDmWithAccount(account) },
          { label: "Mention User", action: () => mentionInComposer(account) },
          {
            label: "Copy",
            submenu: [
              { label: "Display Name", action: () => copyText(displayNameForAccount(account, server.id)) },
              { label: "Username", action: () => copyText(`@${account.username}`) },
              { label: "User ID", action: () => copyText(account.id) }
            ]
          }
        ]);
      });
      ui.memberList.appendChild(row);
    });
    return;
  }
  if (activeChannel && activeChannel.xmppRoomJid) {
    const roomJid = xmppBareJid(activeChannel.xmppRoomJid);
    const occupantMap = xmppOccupantsByRoomJid.get(roomJid) || new Map();
    const rawOccupants = [...occupantMap.values()].filter((entry) => entry && typeof entry === "object");
    const seen = new Set();
    const occupants = rawOccupants.filter((entry) => {
      const key = (entry.jid || `nick:${(entry.nick || "").toString().toLowerCase()}`).toString();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).filter((entry) => {
      if (presenceFilter === "offline") return false;
      if (!filter) return true;
      const account = entry.accountId ? getAccountById(entry.accountId) : null;
      const label = account
        ? displayNameForAccount(account, server.id)
        : (entry.nick || entry.jid?.split("@")[0] || "occupant");
      const haystack = [
        label,
        account?.username || "",
        entry.nick || "",
        entry.jid || "",
        entry.role || "",
        entry.affiliation || ""
      ].join(" ").toLowerCase();
      return haystack.includes(filter);
    });
    occupants.sort((a, b) => {
      const aAccount = a.accountId ? getAccountById(a.accountId) : null;
      const bAccount = b.accountId ? getAccountById(b.accountId) : null;
      const aLabel = (aAccount ? displayNameForAccount(aAccount, server.id) : (a.nick || a.jid || "occupant")).toLowerCase();
      const bLabel = (bAccount ? displayNameForAccount(bAccount, server.id) : (b.nick || b.jid || "occupant")).toLowerCase();
      return aLabel.localeCompare(bLabel);
    });
    if (ui.memberPanelTitle) ui.memberPanelTitle.textContent = `In Room — ${occupants.length}`;
    const title = document.createElement("div");
    title.className = "member-group-title";
    title.textContent = `XMPP Occupants — ${roomJid.split("@")[0] || "room"}`;
    ui.memberList.appendChild(title);
    if (occupants.length === 0) {
      const empty = document.createElement("div");
      empty.className = "channel-empty";
      empty.textContent = "No room occupants visible yet.";
      ui.memberList.appendChild(empty);
      return;
    }
    const current = getCurrentAccount();
    occupants.forEach((entry) => {
      let account = entry.accountId ? getAccountById(entry.accountId) : null;
      if (!account && entry.jid) {
        account = ensureAccountByXmppJid(entry.jid, entry.nick || entry.jid?.split("@")[0] || "occupant");
      }
      const row = document.createElement("button");
      row.className = "member-item";
      if (account) applyNameplatePlateStyle(row, account);
      const avatar = document.createElement("div");
      avatar.className = "member-avatar";
      if (account) {
        if (account?.xmppJid) maybeFetchXmppAvatarForJid(account.xmppJid);
        applyAvatarStyle(avatar, account, server.id);
        applyAvatarDecoration(avatar, account);
      } else {
        const mucAvatar = xmppMucAvatarUrlForOccupant(roomJid, entry.nick || "");
        if (isRenderableAvatarUrl(mucAvatar)) {
          avatar.style.backgroundImage = `url(${mucAvatar})`;
          avatar.style.backgroundSize = "cover";
          avatar.style.backgroundPosition = "center";
        } else {
          avatar.textContent = ((entry.nick || entry.jid || "?").toString().trim().charAt(0) || "?").toUpperCase();
        }
      }
      const dot = document.createElement("span");
      dot.className = "presence-dot presence-online";
      avatar.appendChild(dot);
      const meta = document.createElement("span");
      meta.className = "member-meta";
      const label = document.createElement("span");
      label.className = "member-meta__name";
      const fallbackName = account
        ? displayNameForAccount(account, server.id)
        : (entry.nick || entry.jid?.split("@")[0] || "occupant");
      label.textContent = fallbackName;
      const status = document.createElement("small");
      status.className = "member-meta__status";
      status.textContent = [entry.role || "", entry.affiliation || "", entry.jid || ""].filter(Boolean).join(" · ") || "XMPP occupant";
      meta.appendChild(label);
      meta.appendChild(status);
      row.appendChild(avatar);
      row.appendChild(meta);
      row.addEventListener("click", () => openUserPopout(account, fallbackName));
      row.addEventListener("dblclick", () => {
        if (account) mentionInComposer(account);
      });
      row.addEventListener("contextmenu", (event) => {
        const startDm = () => {
          if (account) {
            if (account.id === current?.id) return;
            openDmWithAccount(account);
            return;
          }
          const identity = (entry.jid || entry.nick || "").toString().trim();
          if (!identity) return;
          openDmByIdentity(identity, { displayName: fallbackName });
        };
        openContextMenu(event, [
          {
            label: "View Profile",
            action: () => openUserPopout(account, fallbackName)
          },
          {
            label: "Start DM",
            disabled: account ? account.id === current?.id : !(entry.jid || entry.nick),
            action: startDm
          },
          {
            label: "Mention User",
            disabled: !account,
            action: () => {
              if (account) mentionInComposer(account);
            }
          },
          {
            label: "Copy",
            submenu: [
              { label: "Display Name", action: () => copyText(fallbackName) },
              { label: "XMPP JID", disabled: !entry.jid, action: () => copyText(entry.jid || "") },
              { label: "Role", disabled: !entry.role, action: () => copyText(entry.role || "") },
              { label: "Affiliation", disabled: !entry.affiliation, action: () => copyText(entry.affiliation || "") },
              { label: "Username", disabled: !account, action: () => copyText(account ? `@${account.username}` : "") },
              { label: "User ID", disabled: !account, action: () => copyText(account?.id || "") }
            ]
          }
        ]);
      });
      ui.memberList.appendChild(row);
    });
    return;
  }

  const visibleMembers = [];
  const roleSortOrder = new Map();
  getServerRoles(server).forEach((role, index) => {
    const key = (role?.name || "").toString().trim().toLowerCase();
    if (!key || key === "@everyone") return;
    roleSortOrder.set(key, index);
  });
  const platformHintsForMember = (account) => {
    const out = [];
    const seen = new Set();
    const add = (value) => {
      const token = (value || "").toString().trim().toLowerCase();
      if (!token || seen.has(token)) return;
      seen.add(token);
      out.push(token);
    };
    const addGuess = (value) => {
      const token = (value || "").toString().trim().toLowerCase();
      if (!token) return;
      if (/(android|ios|mobile|iphone|ipad)/.test(token)) add("mobile");
      if (/(web|browser|chrome|firefox|safari|edge)/.test(token)) add("web");
      if (/(desktop|linux|windows|mac|electron|pc)/.test(token)) add("desktop");
    };
    add(account?.clientPlatform);
    if (Array.isArray(account?.clientPlatforms)) {
      account.clientPlatforms.forEach((entry) => add(entry));
    }
    if (account?.mobile) add("mobile");
    if (account?.web) add("web");
    if (account?.desktop) add("desktop");
    addGuess(account?.statusClient);
    addGuess(account?.client);
    const resource = (normalizeXmppJid(account?.xmppJid || "").split("/")[1] || "").toLowerCase();
    if (resource) addGuess(resource);
    return out.filter((entry) => entry === "mobile" || entry === "web" || entry === "desktop");
  };
  const automationTagForMember = (account) => {
    if (!account || typeof account !== "object") return "";
    if (account.isApp || account.app === true || account.type === "app") return "APP";
    if (account.isBot || account.bot === true || account.type === "bot") return "BOT";
    if (/\bbot\b/i.test((account.username || "").toString())) return "BOT";
    return "";
  };
  const appendMemberDecorators = (nameWrap, account) => {
    const decorators = document.createElement("span");
    decorators.className = "member-meta__decorators";
    const automationTag = automationTagForMember(account);
    if (automationTag) {
      const chip = document.createElement("span");
      chip.className = "member-meta__badge";
      chip.textContent = automationTag;
      decorators.appendChild(chip);
    }
    platformHintsForMember(account).forEach((platform) => {
      const icon = document.createElement("span");
      icon.className = "member-meta__platform";
      icon.title = platform;
      if (platform === "mobile") icon.textContent = "📱";
      if (platform === "web") icon.textContent = "🌐";
      if (platform === "desktop") icon.textContent = "🖥";
      decorators.appendChild(icon);
    });
    if (decorators.childElementCount > 0) {
      nameWrap.appendChild(decorators);
    }
  };
  server.memberIds.forEach((memberId) => {
    const account = getAccountById(memberId);
    if (!account) return;
    if (!matchesMemberFilter(account, server.id)) return;
    visibleMembers.push(account);
  });
  const onlineCount = visibleMembers.filter((account) => normalizePresence(account.presence) !== "invisible").length;
  const offlineCount = visibleMembers.length - onlineCount;
  if (ui.memberPanelTitle) ui.memberPanelTitle.textContent = `Members — ${visibleMembers.length}`;
  if (visibleMembers.length > 0) {
    const summary = document.createElement("div");
    summary.className = "member-list-summary";
    summary.innerHTML = [
      `<span class="member-list-summary__item"><strong>${onlineCount}</strong> online</span>`,
      `<span class="member-list-summary__item"><strong>${offlineCount}</strong> offline</span>`
    ].join("");
    ui.memberList.appendChild(summary);
  }

  const groupedMembers = new Map();
  visibleMembers.forEach((account) => {
    const topRoleName = getMemberTopRoleName(server, account.id) || "Members";
    const groupKey = topRoleName.toLowerCase();
    if (!groupedMembers.has(groupKey)) {
      const roleIndex = roleSortOrder.has(groupKey) ? roleSortOrder.get(groupKey) : Number.MAX_SAFE_INTEGER;
      groupedMembers.set(groupKey, { name: topRoleName, items: [], order: roleIndex });
    }
    groupedMembers.get(groupKey).items.push(account);
  });
  const sortedGroups = [...groupedMembers.values()].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.name.localeCompare(b.name);
  });
  sortedGroups.forEach((group) => {
    group.items.sort((a, b) => {
      const aOnline = normalizePresence(a.presence) !== "invisible" ? 1 : 0;
      const bOnline = normalizePresence(b.presence) !== "invisible" ? 1 : 0;
      if (aOnline !== bOnline) return bOnline - aOnline;
      return displayNameForAccount(a, server.id).localeCompare(displayNameForAccount(b, server.id));
    });
    const title = document.createElement("div");
    title.className = "member-group-title";
    title.textContent = `${group.name} — ${group.items.length}`;
    ui.memberList.appendChild(title);
    group.items.forEach((account) => {
      const row = document.createElement("button");
      row.className = "member-item";
      applyNameplatePlateStyle(row, account);

      const avatar = document.createElement("div");
      avatar.className = "member-avatar";
      if (account?.xmppJid) maybeFetchXmppAvatarForJid(account.xmppJid);
      applyAvatarStyle(avatar, account, server.id);
      applyAvatarDecoration(avatar, account);

      const dot = document.createElement("span");
      dot.className = `presence-dot presence-${normalizePresence(account.presence)}`;
      avatar.appendChild(dot);

      const meta = document.createElement("span");
      meta.className = "member-meta";
      const label = document.createElement("span");
      label.className = "member-meta__name";
      label.textContent = displayNameForAccount(account, server.id);
      const roleColor = getMemberTopRoleColor(server, account.id);
      if (roleColor) label.style.color = roleColor;
      appendMemberDecorators(label, account);
      const tag = accountGuildTag(account);
      if (tag) {
        const tagChip = document.createElement("span");
        tagChip.className = "guild-tag-chip";
        tagChip.textContent = tag;
        tagChip.title = "Guild tag";
        tagChip.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          showGuildTagInfo(account);
        });
        label.appendChild(document.createTextNode(" "));
        label.appendChild(tagChip);
      }
      const status = document.createElement("small");
      status.className = "member-meta__status";
      const guildStatus = displayStatus(account, server.id);
      const guildActivity = accountActivitySummary(account);
      status.textContent = guildActivity ? `${guildStatus} · ${guildActivity}` : guildStatus;
      meta.appendChild(label);
      meta.appendChild(status);

      row.appendChild(avatar);
      row.appendChild(meta);
      row.addEventListener("click", () => openUserPopout(account));
      row.addEventListener("dblclick", () => mentionInComposer(account));
      row.addEventListener("contextmenu", (event) => {
        openContextMenu(event, [
          {
            label: "View Profile",
            action: () => openUserPopout(account)
          },
          {
            label: "Start DM",
            disabled: account.id === getCurrentAccount()?.id,
            action: () => openDmWithAccount(account)
          },
          {
            label: "Mention User",
            action: () => mentionInComposer(account)
          },
          {
            label: "Show Quest Summary",
            action: () => showToast(formatQuestSummaryText(account.id))
          },
          {
            label: "Copy",
            submenu: [
              { label: "Display Name", action: () => copyText(displayNameForAccount(account, server.id)) },
              { label: "Username", action: () => copyText(`@${account.username}`) },
              { label: "User ID", action: () => copyText(account.id) },
              { label: "Guild Tag", disabled: !accountGuildTag(account), action: () => copyText(accountGuildTag(account)) },
              { label: "Avatar Decoration", disabled: !accountDecorationEmoji(account), action: () => copyText(accountDecorationEmoji(account)) },
              { label: "Nameplate URL", disabled: !accountNameplateSvg(account), action: () => copyText(accountNameplateSvg(account)) }
            ]
          }
        ]);
      });
      ui.memberList.appendChild(row);
    });
  });
  if (visibleMembers.length === 0) {
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = "No members match your filter.";
    ui.memberList.appendChild(empty);
  }
}
