/*
 * App render/runtime helpers extracted from app.js.
 * Functions here intentionally bind to app globals at call time.
 */

function renderMessages() {
  const conversation = getActiveConversation();
  const isDm = conversation?.type === "dm";
  const channel = !isDm ? conversation?.channel : null;
  const dmThread = isDm ? conversation?.thread : null;
  syncRelayRoomForActiveConversation();
  renderMemberList();
  const conversationId = conversation?.id || null;
  const sameConversationAsBefore = Boolean(conversationId && lastRenderedConversationId === conversationId);
  const shouldAutoScrollToBottom = !sameConversationAsBefore || isMessageListNearBottom();
  const preservedScrollAnchor = sameConversationAsBefore && !shouldAutoScrollToBottom
    ? captureMessageListAnchor()
    : null;
  if (!sameConversationAsBefore) lastRenderedMessageSignature = "";
  lastRenderedConversationId = conversationId || null;
  syncComposerDraftConversation(conversationId);
  const messageBucket = isDm ? (dmThread?.messages || []) : (channel?.messages || []);
  setComposerCollapsedState(!conversationId);
  const activeFindId = getFindActiveMessageId();
  const messageSignature = conversationRenderSignature(conversationId, messageBucket, activeFindId || "");
  const hasLiveSwfRuntime = activeConversationHasLiveSwfRuntime(messageBucket);
  if (
    sameConversationAsBefore
    && hasLiveSwfRuntime
    && messageSignature === lastRenderedMessageSignature
    && !pendingFindJumpMessageId
  ) {
    updateJumpToBottomButton();
    renderComposerMeta();
    requestSwfRuntimeLayoutSync();
    return;
  }
  const liveSwfKeys = collectLiveSwfRuntimeKeys();
  const liveVideoKeys = collectLiveVideoPipRuntimeKeys(messageBucket);
  swfRuntimes.forEach((runtime, key) => {
    if (key === currentViewerRuntimeKey) return;
    if (runtime.inPip && (!(runtime.host instanceof HTMLElement) || !runtime.host.isConnected)) {
      const recovered = recoverDetachedSwfPipHost(key);
      if (!recovered) {
        const destroyed = destroySwfRuntime(key, {
          reason: "render-pip-detach",
          removeHost: true,
          liveSwfKeys
        });
        if (!destroyed) addDebugLog("warn", "Keeping SWF runtime after PiP host detach to avoid teardown", { key });
      }
      return;
    }
    if (runtime.inPip || runtime.pipTransitioning) return;
    if (liveSwfKeys.has(key)) return;
    destroySwfRuntime(key, { reason: "render-prune", removeHost: true, liveSwfKeys });
  });
  videoPipRuntimes.forEach((runtime, key) => {
    if (liveVideoKeys.has(key)) return;
    if (runtime?.inPip && key === videoPipActiveKey) return;
    destroyVideoPipRuntime(key, { force: true });
  });
  refreshSwfAudioFocus();
  ui.messageList.innerHTML = "";
  if (getViewMode() === "dm" && !dmThread) {
    renderDmHome();
    return;
  }
  if (isDm && dmThread) {
    const current = getCurrentAccount();
    const peerId = dmThread.participantIds.find((id) => id !== current?.id);
    const peer = peerId ? getAccountById(peerId) : null;
    const peerPrimary = peer ? dmPrimaryLabelForAccount(peer) : "dm";
    const peerSecondary = peer ? dmSecondaryLabelForAccount(peer) : "@dm";
    setActiveChannelHeader(peerPrimary, "@", peerSecondary, peerSecondary);
    updateOmemoHeaderControl(conversation, current);
    const dmRoom = relayRoomForDmThread(dmThread) || relayRoomForActiveConversation();
    const typingSummary = formatTypingSummary(typingNamesForRoom(dmRoom));
    const headerMeta = dmHeaderStatusMeta(dmThread, current?.id, { typingSummary });
    const xmppCallDebug = xmppCallDebugSummaryForConversation(getActiveConversation(), current);
    const topicBits = [headerMeta.text || "Direct Message"];
    if (xmppCallDebug) topicBits.push(xmppCallDebug);
    setActiveChannelTopic(topicBits.join(" · "));
    ui.messageInput.placeholder = peer ? `Message ${peerPrimary}` : "Message DM";
  } else {
    updateOmemoHeaderControl(conversation, getCurrentAccount());
    const guild = getActiveGuild();
    const current = getCurrentAccount();
    if (channel && guild && current && !canAccountViewChannel(guild, channel, current.id)) {
      const fallbackId = getFirstOpenableChannelIdForGuild(guild);
      state.activeChannelId = fallbackId;
      if (fallbackId && fallbackId !== channel.id) {
        saveState();
        renderMessages();
        renderChannels();
        return;
      }
      setActiveChannelHeader("no-access", "#", "No accessible channels", "No accessible channels");
      setActiveChannelTopic("You do not have access to view channels in this guild.");
      ui.messageList.innerHTML = "";
      const empty = document.createElement("div");
      empty.className = "channel-empty";
      empty.textContent = "No accessible channels. Ask an admin to allow View Channel.";
      ui.messageList.appendChild(empty);
      ui.messageInput.placeholder = "No channel access";
      updateJumpToBottomButton();
      renderComposerMeta();
      return;
    }
    const channelHeaderLabel = channel && isXmppBackedChannel(channel)
      ? (xmppChannelDisplayName(channel) || channel.name || "none")
      : (channel ? channel.name : "none");
    const channelHeaderReference = channel
      ? (isXmppBackedChannel(channel)
          ? (xmppBareJid(channel.xmppRoomJid || "") || `#${channel.name}`)
          : `#${channel.name}`)
      : "#none";
    const channelHeaderTopic = channel && isXmppBackedChannel(channel)
      ? (xmppChannelDescription(channel) || channel?.topic?.trim() || "")
      : (channel?.topic?.trim() || "");
    const xmppBacked = Boolean(channel && isXmppBackedChannel(channel));
    setActiveChannelHeader(
      channelHeaderLabel,
      channelHeaderGlyph(channel, "channel"),
      channelHeaderReference,
      xmppBacked ? channelHeaderTopic : ""
    );
    setActiveChannelTopic(xmppBacked ? "" : channelHeaderTopic);
    if (channel?.type === "forum") {
      ui.messageInput.placeholder = channel ? `New post in ${channelTypePrefix(channel)} ${channel.name} (title on first line)` : "No channel selected";
    } else if (channel?.type === "announcement") {
      ui.messageInput.placeholder = channel ? `Announcement ${channelTypePrefix(channel)} ${channel.name}` : "No channel selected";
    } else if (channel?.type === "voice") {
      ui.messageInput.placeholder = channel ? `Voice controls in ${channelTypePrefix(channel)} ${channel.name}` : "No channel selected";
    } else if (channel?.type === "stage") {
      ui.messageInput.placeholder = channel ? `Stage controls in ${channelTypePrefix(channel)} ${channel.name}` : "No channel selected";
    } else {
      ui.messageInput.placeholder = channel ? `Message ${channelTypePrefix(channel)} ${channel.name}` : "No channel selected";
    }
  }
  const headerGuild = getActiveGuild();
  const headerAccount = getCurrentAccount();
  const canManageChannelsHere = Boolean(
    !isDm
    && headerGuild
    && headerAccount
    && hasServerPermission(headerGuild, headerAccount.id, "manageChannels")
  );
  const canManageRolesHere = Boolean(
    !isDm
    && headerGuild
    && headerAccount
    && hasServerPermission(headerGuild, headerAccount.id, "manageRoles")
  );
  if (ui.openChannelSettingsBtn) {
    ui.openChannelSettingsBtn.hidden = isDm || !canManageChannelsHere;
    ui.openChannelSettingsBtn.disabled = !canManageChannelsHere;
    ui.openChannelSettingsBtn.title = canManageChannelsHere ? "Channel settings" : "Manage Channels permission required";
  }
  if (ui.editTopicBtn) {
    ui.editTopicBtn.hidden = isDm || !canManageChannelsHere;
    ui.editTopicBtn.disabled = !canManageChannelsHere;
    ui.editTopicBtn.title = canManageChannelsHere ? "Edit channel topic" : "Manage Channels permission required";
  }
  if (ui.openRolesBtn) {
    ui.openRolesBtn.hidden = isDm || !canManageRolesHere;
    ui.openRolesBtn.disabled = !canManageRolesHere;
    ui.openRolesBtn.title = canManageRolesHere ? "Manage roles" : "Manage Roles permission required";
  }
  if (!conversationId || (replyTarget && replyTarget.channelId !== conversationId)) {
    replyTarget = null;
  }
  renderReplyComposer();
  renderSlashSuggestions();

  if (!conversationId) {
    if (ui.openCallBtn) {
      ui.openCallBtn.hidden = true;
      ui.openCallBtn.disabled = true;
    }
    if (ui.openScreenShareBtn) {
      ui.openScreenShareBtn.hidden = true;
      ui.openScreenShareBtn.disabled = true;
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
    updateJumpToBottomButton();
    return;
  }
  if (ui.openCallBtn) {
    ui.openCallBtn.hidden = false;
    ui.openCallBtn.disabled = false;
    setHeaderActionButtonLabel(ui.openCallBtn, isDm ? "DM Call" : "Call");
  }
  if (ui.openScreenShareBtn) {
    ui.openScreenShareBtn.hidden = false;
    ui.openScreenShareBtn.disabled = false;
    setHeaderActionButtonLabel(ui.openScreenShareBtn, "Screen");
  }
  if (ui.openXmppCallBtn) {
    ui.openXmppCallBtn.hidden = true;
    ui.openXmppCallBtn.disabled = true;
    setHeaderActionButtonLabel(ui.openXmppCallBtn, "Legacy XMPP");
  }
  if (ui.copyCallLinkBtn) {
    ui.copyCallLinkBtn.hidden = false;
    ui.copyCallLinkBtn.disabled = false;
    setHeaderActionButtonLabel(ui.copyCallLinkBtn, "Copy Call");
  }
  if (ui.openWhiteboardBtn) {
    ui.openWhiteboardBtn.hidden = false;
    ui.openWhiteboardBtn.disabled = false;
    setHeaderActionButtonLabel(ui.openWhiteboardBtn, isDm ? "DM Whiteboard" : "Whiteboard");
  }
  if (!isDm && (channel?.type === "voice" || channel?.type === "stage")) {
    renderVoiceStageSurface(channel);
    return;
  }
  if (!isDm && channel?.type === "forum") {
    renderForumThreads(conversationId, channel, messageBucket, getCurrentAccount());
    return;
  }

  const currentAccount = getCurrentAccount();
  const dmPeerAccount = isDm && dmThread && currentAccount
    ? dmPeerAccountForThread(dmThread, currentAccount.id)
    : null;
  const latestReadOwnDmMessageId = isDm && dmThread && currentAccount
    ? latestOwnXmppReadDmMessageId(dmThread, currentAccount.id)
    : "";
  const unreadStats = !isDm ? getChannelUnreadStats(channel, currentAccount) : { unread: 0, mentions: 0 };
  const dmUnreadStats = isDm && dmThread && currentAccount ? getDmUnreadStats(dmThread, currentAccount) : { unread: 0, mentions: 0 };
  const firstUnreadMessageId = !isDm ? findFirstUnreadMessageId(channel, currentAccount) : null;
  const guildUnreadChannels = !isDm ? listUnreadGuildChannels(getActiveGuild(), currentAccount) : [];
  const channelPinnedCount = !isDm ? messageBucket.filter((message) => message.pinned).length : 0;
  if (ui.openPinsBtn) {
    setHeaderActionButtonLabel(
      ui.openPinsBtn,
      channelPinnedCount > 0 ? `Pins (${channelPinnedCount})` : "Pins"
    );
  }
  if (ui.markChannelReadBtn) {
    ui.markChannelReadBtn.hidden = false;
    const canMark = isDm ? dmUnreadStats.unread > 0 : unreadStats.unread > 0;
    ui.markChannelReadBtn.disabled = !currentAccount || !canMark;
    ui.markChannelReadBtn.classList.toggle("chat-topic-edit--active", canMark);
    if (isDm && dmUnreadStats.unread > 0) {
      setHeaderActionButtonLabel(ui.markChannelReadBtn, `Mark DM Read (${dmUnreadStats.unread > 99 ? "99+" : dmUnreadStats.unread})`);
    } else if (!isDm && unreadStats.unread > 0) {
      setHeaderActionButtonLabel(ui.markChannelReadBtn, `Mark Read (${unreadStats.unread > 99 ? "99+" : unreadStats.unread})`);
    } else if (isDm) {
      setHeaderActionButtonLabel(ui.markChannelReadBtn, "Mark DM Read");
    } else {
      setHeaderActionButtonLabel(ui.markChannelReadBtn, "Mark Read");
    }
  }
  if (ui.nextUnreadBtn) {
    ui.nextUnreadBtn.hidden = isDm;
    ui.nextUnreadBtn.disabled = isDm || guildUnreadChannels.length === 0;
    ui.nextUnreadBtn.classList.toggle("chat-topic-edit--active", !isDm && guildUnreadChannels.length > 0);
    setHeaderActionButtonLabel(
      ui.nextUnreadBtn,
      guildUnreadChannels.length > 0
        ? `Next Unread (${guildUnreadChannels.length > 99 ? "99+" : guildUnreadChannels.length})`
        : "Next Unread"
    );
  }
  const channelSlowmode = !isDm ? getChannelSlowmodeSeconds(channel) : 0;
  if (!isDm && channelSlowmode > 0) {
    const baseTopic = channel && isXmppBackedChannel(channel)
      ? (xmppChannelDescription(channel) || channel?.topic?.trim() || "")
      : (channel?.topic?.trim() || "");
    const slowmodeText = baseTopic
      ? `${baseTopic} · ${formatSlowmodeLabel(channelSlowmode)}`
      : `${formatSlowmodeLabel(channelSlowmode)}`;
    if (channel && isXmppBackedChannel(channel)) {
      setActiveChannelDescription(slowmodeText);
      setActiveChannelTopic("");
    } else {
      setActiveChannelTopic(slowmodeText);
    }
  }
  let unreadDividerMessageId = null;
  if (currentAccount && isDm && dmThread) {
    const lastReadMs = toTimestampMs(dmThread.readState?.[currentAccount.id]);
    const unreadMessage = messageBucket.find((message) => (
      toTimestampMs(message.ts) > lastReadMs && message.userId !== currentAccount.id
    ));
    unreadDividerMessageId = unreadMessage?.id || null;
  }
  let unreadDividerEl = null;
  if (isDm) {
    const tools = document.createElement("div");
    tools.className = "dm-thread-tools";
    const jumpNewestBtn = document.createElement("button");
    jumpNewestBtn.type = "button";
    jumpNewestBtn.textContent = "Jump to newest";
    jumpNewestBtn.addEventListener("click", () => {
      ui.messageList.scrollTop = ui.messageList.scrollHeight;
    });
    tools.appendChild(jumpNewestBtn);
    ui.messageList.appendChild(tools);
  } else if (currentAccount && unreadStats.unread > 0 && firstUnreadMessageId) {
    const divider = document.createElement("div");
    divider.className = "channel-unread-banner";
    const mentionPart = unreadStats.mentions > 0 ? `, ${unreadStats.mentions} mention${unreadStats.mentions === 1 ? "" : "s"}` : "";
    divider.textContent = `${unreadStats.unread} new message${unreadStats.unread === 1 ? "" : "s"}${mentionPart}`;
    const markBtn = document.createElement("button");
    markBtn.type = "button";
    markBtn.textContent = "Mark read";
    markBtn.addEventListener("click", () => {
      if (!markChannelRead(channel, currentAccount.id)) return;
      saveState();
      renderServers();
      renderChannels();
      renderMessages();
    });
    const jumpBtn = document.createElement("button");
    jumpBtn.type = "button";
    jumpBtn.textContent = "Jump";
    jumpBtn.addEventListener("click", () => {
      focusMessageById(firstUnreadMessageId);
    });
    divider.appendChild(markBtn);
    divider.appendChild(jumpBtn);
    ui.messageList.appendChild(divider);
  }

  const renderCallBar = () => {
    if (!conversation) return;
    const current = getCurrentAccount();
    const callBar = document.createElement("section");
    callBar.className = "call-grid";
    const header = document.createElement("div");
    header.className = "call-grid__header";
    const headerTitle = document.createElement("strong");
    headerTitle.textContent = "In Call";
    const headerMeta = document.createElement("span");
    headerMeta.className = "call-grid__meta";
    header.appendChild(headerTitle);
    header.appendChild(headerMeta);
    const grid = document.createElement("div");
    grid.className = "call-grid__tiles";

    let sessionId = "";
    let peerBare = "";
    let statusText = "";
    let labelText = "";
    let subtitleText = "";
    let openAction = null;
    let endAction = null;
    let screenShare = false;
    let localSnapshot = null;
    let tiles = [];

    if (conversation.type === "dm" && current) {
      const peerAccount = dmPeerAccountForThread(dmThread, current.id);
      const peerJid = xmppPeerJidForDmThread(dmThread, current);
      peerBare = xmppBareJid(peerJid);
      const session = [...xmppCallSessionById.values()]
        .filter((entry) => xmppBareJid(entry?.peerJid || "") === peerBare)
        .sort((a, b) => (Number(b?.createdAt) || 0) - (Number(a?.createdAt) || 0))[0];
      if (session) {
        sessionId = session.id || "";
        screenShare = Boolean(session.screenShare);
        labelText = screenShare ? "Native screen-share call" : "Native voice/video call";
        statusText = (session.state || "starting").toString();
        const elapsedMs = Math.max(0, Date.now() - (Number(session.createdAt) || Date.now()));
        const minutes = Math.floor(elapsedMs / 60000);
        const seconds = Math.floor((elapsedMs % 60000) / 1000);
        subtitleText = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        openAction = () => openNativeXmppCallSurface(sessionId);
        endAction = () => {
          if (peerBare) {
            xmppSendJingleSessionTerminate(peerBare, sessionId, {
              reason: "success",
              text: "Ended from call bar"
            });
          }
          forgetXmppCallSession(sessionId);
          closeMediaLightbox();
        };
        ensureXmppCallSpeakingMonitor(sessionId);
        localSnapshot = xmppLocalMediaSnapshot(sessionId);
      }
      if (!session && activeWebCallLightbox && activeWebCallLightbox.conversationId === conversation.id) {
        labelText = activeWebCallLightbox.screenShare ? "Web screen-share call" : "Web voice/video call";
        statusText = activeWebCallLightbox.incoming ? "in progress" : "starting";
        openAction = () => openWebCallLightbox(activeWebCallLightbox.url || conversationCallUrl(conversation, {}), {
          conversation,
          screenShare: Boolean(activeWebCallLightbox.screenShare),
          incoming: Boolean(activeWebCallLightbox.incoming),
          fromLabel: activeWebCallLightbox.fromLabel || ""
        });
      }
      if (!labelText) return;
      const localTile = {
        id: "local",
        name: "You",
        account: current,
        muted: localSnapshot ? !localSnapshot.audioEnabled : false,
        videoOff: localSnapshot ? !localSnapshot.videoEnabled : false,
        speakingKey: "local"
      };
      const peerTile = {
        id: peerBare || "peer",
        name: peerAccount ? displayNameForAccount(peerAccount, null) : (peerBare || "Peer"),
        account: peerAccount,
        muted: Boolean(session?.remoteMuted),
        videoOff: Boolean(session?.remoteVideoMuted),
        speakingKey: peerBare || "peer"
      };
      tiles = [localTile, peerTile];
    } else if (activeWebCallLightbox && activeWebCallLightbox.conversationId === conversation.id) {
      labelText = activeWebCallLightbox.screenShare ? "Web screen-share call" : "Web voice/video call";
      statusText = activeWebCallLightbox.incoming ? "in progress" : "starting";
      subtitleText = "External call";
      openAction = () => openWebCallLightbox(activeWebCallLightbox.url || conversationCallUrl(conversation, {}), {
        conversation,
        screenShare: Boolean(activeWebCallLightbox.screenShare),
        incoming: Boolean(activeWebCallLightbox.incoming),
        fromLabel: activeWebCallLightbox.fromLabel || ""
      });
      tiles = [{
        id: "local",
        name: "You",
        account: current,
        muted: false,
        videoOff: false,
        speakingKey: "local"
      }];
    } else {
      return;
    }

    headerMeta.textContent = [labelText, subtitleText].filter(Boolean).join(" · ");
    tiles.forEach((tile) => {
      const tileEl = document.createElement("div");
      tileEl.className = "call-tile";
      tileEl.dataset.callSpeaker = tile.speakingKey;
      const avatar = document.createElement("div");
      avatar.className = `call-tile__avatar ${tile.id === "local" ? "call-tile__avatar--local" : ""}`;
      if (tile.account) {
        applyAvatarStyle(avatar, tile.account, null);
      } else {
        avatar.textContent = (tile.name || "?").charAt(0).toUpperCase();
      }
      const name = document.createElement("div");
      name.className = "call-tile__name";
      name.textContent = tile.name || "User";
      const badges = document.createElement("div");
      badges.className = "call-tile__badges";
      const micBadge = document.createElement("span");
      micBadge.className = `call-tile__badge ${tile.muted ? "is-muted" : ""}`;
      micBadge.textContent = tile.muted ? "Mic off" : "Mic on";
      badges.appendChild(micBadge);
      const camBadge = document.createElement("span");
      camBadge.className = `call-tile__badge ${tile.videoOff ? "is-muted" : ""}`;
      camBadge.textContent = tile.videoOff ? "Cam off" : "Cam on";
      badges.appendChild(camBadge);
      const controls = document.createElement("div");
      controls.className = "call-tile__controls";
      if (tile.id === "local" && sessionId && localSnapshot) {
        const micBtn = document.createElement("button");
        micBtn.type = "button";
        micBtn.textContent = localSnapshot.audioEnabled ? "Mute" : "Unmute";
        micBtn.addEventListener("click", async () => {
          if (xmppLocalMediaSnapshot(sessionId).audioTracks.length === 0) {
            await xmppEnsureLocalMediaAttached(sessionId, { screenShare: localSnapshot.mode === "screen" });
          }
          const nextEnabled = !xmppLocalMediaSnapshot(sessionId).audioEnabled;
          xmppSetLocalTracksEnabled(sessionId, "audio", nextEnabled);
          renderMessages();
        });
        controls.appendChild(micBtn);
        const camBtn = document.createElement("button");
        camBtn.type = "button";
        camBtn.textContent = localSnapshot.videoEnabled ? "Stop Cam" : "Start Cam";
        camBtn.addEventListener("click", async () => {
          if (xmppLocalMediaSnapshot(sessionId).videoTracks.length === 0) {
            await xmppEnsureLocalMediaAttached(sessionId, { screenShare: localSnapshot.mode === "screen" });
          }
          const nextEnabled = !xmppLocalMediaSnapshot(sessionId).videoEnabled;
          xmppSetLocalTracksEnabled(sessionId, "video", nextEnabled);
          renderMessages();
        });
        controls.appendChild(camBtn);
        const screenBtn = document.createElement("button");
        screenBtn.type = "button";
        screenBtn.textContent = localSnapshot.mode === "screen" ? "Stop Share" : "Share";
        const cap = screenShareCapabilitySnapshot();
        if (!cap.ok && localSnapshot.mode !== "screen") {
          screenBtn.disabled = true;
          screenBtn.title = cap.reason || "Screen share unavailable";
        }
        screenBtn.addEventListener("click", async () => {
          if (localSnapshot.mode === "screen") {
            await xmppSwitchLocalMediaMode(sessionId, "camera");
          } else if (typeof openNativeCallScreenSharePicker === "function") {
            await openNativeCallScreenSharePicker(sessionId);
          } else {
            await xmppSwitchLocalMediaMode(sessionId, "screen");
          }
          renderMessages();
        });
        controls.appendChild(screenBtn);
        if (openAction) {
          const openBtn = document.createElement("button");
          openBtn.type = "button";
          openBtn.textContent = "Open";
          openBtn.addEventListener("click", openAction);
          controls.appendChild(openBtn);
        }
        if (endAction) {
          const endBtn = document.createElement("button");
          endBtn.type = "button";
          endBtn.className = "call-tile__end";
          endBtn.textContent = "End";
          endBtn.addEventListener("click", endAction);
          controls.appendChild(endBtn);
        }
      } else if (openAction && tile.id === "local") {
        const openBtn = document.createElement("button");
        openBtn.type = "button";
        openBtn.textContent = "Open";
        openBtn.addEventListener("click", openAction);
        controls.appendChild(openBtn);
      }
      tileEl.appendChild(avatar);
      tileEl.appendChild(name);
      tileEl.appendChild(badges);
      tileEl.appendChild(controls);
      grid.appendChild(tileEl);
    });
    if (sessionId) callBar.dataset.sessionId = sessionId;
    callBar.dataset.tileCount = String(Math.max(1, tiles.length));
    callBar.appendChild(header);
    callBar.appendChild(grid);
    ui.messageList.appendChild(callBar);
  };

  renderCallBar();
  if (getPreferences().relayMode === "xmpp") {
    let mamState = null;
    let mamScope = "";
    let mamTarget = "";
    if (!isDm && channel?.xmppRoomJid) {
      const roomJid = xmppBareJid(channel.xmppRoomJid);
      mamScope = "muc";
      mamTarget = roomJid;
      mamState = roomJid ? ensureXmppMamState(roomJid) : null;
    } else if (isDm && dmThread) {
      const peerJid = xmppPeerJidForDmThread(dmThread, getCurrentAccount());
      mamScope = "dm";
      mamTarget = xmppBareJid(peerJid);
      mamState = peerJid ? ensureXmppDmMamState(peerJid) : null;
    }
    if (mamState) {
      recoverStaleXmppMamLoading(mamState, { scope: mamScope, target: mamTarget || "", reason: "render" });
      const xmppConnected = Boolean(xmppConnection && relayStatus === "connected");
      if (xmppConnected && !mamState.loading && mamState.pagesLoaded === 0 && !mamState.complete) {
        maybeLoadOlderXmppHistoryForActiveConversation({ trigger: "auto" });
      }
      const shouldRenderHistoryControl = Boolean(
        xmppConnected
        && (mamState.loading || (mamState.pagesLoaded === 0 && !mamState.complete))
      );
      if (shouldRenderHistoryControl) {
        const control = document.createElement("div");
        control.className = "xmpp-history-control";
        const statusText = xmppHistoryStatusLabel(mamState, { scope: mamScope, target: mamTarget });
        if (statusText) control.title = statusText;
        if (mamState.loading) {
          control.textContent = statusText || "Loading older messages...";
        } else {
          const status = document.createElement("span");
          status.textContent = statusText || "Recent history not loaded yet.";
          control.appendChild(status);
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = mamState.pagesLoaded > 0
            ? `Load page ${Math.max(1, Number(mamState.pagesLoaded || 0) + 1)}`
            : "Sync now";
          button.addEventListener("click", () => {
            maybeLoadOlderXmppHistoryForActiveConversation({ trigger: "button" });
          });
          control.appendChild(button);
        }
        ui.messageList.appendChild(control);
      }
    }
  }

  let lastDayKey = "";
  let previousThreadMessage = null;
  messageBucket.forEach((message) => {
    const currentUser = getCurrentAccount();
    const dayKey = messageDateKey(message.ts);
    if (dayKey && dayKey !== lastDayKey) {
      ui.messageList.appendChild(createMessageDayDivider(message.ts));
      lastDayKey = dayKey;
      previousThreadMessage = null;
    }
    if (isDm && unreadDividerMessageId && unreadDividerMessageId === message.id) {
      const divider = document.createElement("div");
      divider.className = "dm-unread-divider";
      divider.textContent = "New messages";
      ui.messageList.appendChild(divider);
      unreadDividerEl = divider;
    }
    const messageRow = document.createElement("article");
    messageRow.className = `message ${!isDm && channel?.type === "forum" ? "message--forum" : ""}`;
    if (messageMatchesFindQuery(message, findQuery, isDm ? "dm" : "channel")) {
      messageRow.classList.add("message--find-hit");
    }
    if (activeFindId && message.id === activeFindId) {
      messageRow.classList.add("message--find-active");
    }
    if (isMessageHighlightedForAccount(message, currentAccount)) {
      messageRow.classList.add("message--mentioned");
    }
    const groupedWithPrevious = !(!isDm && channel?.type === "forum") && shouldGroupMessageWithPrevious(message, previousThreadMessage);
    if (groupedWithPrevious) messageRow.classList.add("message--grouped");
    if (groupedWithPrevious) messageRow.title = formatFullTimestamp(message.ts);
    messageRow.dataset.messageId = message.id;
    messageRow.dataset.ts = message.ts;
    if (message.userId) messageRow.dataset.userId = message.userId;
    messageRow.tabIndex = -1;
    messageRow.addEventListener("mousedown", () => {
      messageRow.focus({ preventScroll: true });
    });
    messageRow.addEventListener("dblclick", (event) => {
      if (!(event.target instanceof HTMLElement)) return;
      if (event.target.closest("button, a, input, textarea, iframe, video, audio, .reaction-chip, .message-media-gate, .message-lottie-player")) return;
      setReplyTarget(conversationId, message, message.forumThreadId || null);
    });
    let replyLine = null;

    const avatar = document.createElement("div");
    avatar.className = `message-avatar ${groupedWithPrevious ? "message-avatar--hidden" : ""}`;
    const author = message.userId ? getAccountById(message.userId) : null;
    if (author?.xmppJid) maybeFetchXmppAvatarForJid(author.xmppJid);
    const guildId = !isDm ? getActiveGuild()?.id || null : null;
    const activeRoomJid = xmppBareJid(channel?.xmppRoomJid || "");
    const nickHint = (message.xmppNick || message.authorName || displayNameForMessage(message) || "").toString();
    if (author) {
      applyAvatarStyle(avatar, author, guildId);
      applyAvatarDecoration(avatar, author);
      const appliedAvatar = resolveAccountAvatar(author, guildId);
      if (!isRenderableAvatarUrl(appliedAvatar.url || "")) {
        const mucAvatar = activeRoomJid ? xmppMucAvatarUrlForOccupant(activeRoomJid, nickHint) : "";
        const knownAvatar = !mucAvatar && activeRoomJid ? xmppAvatarUrlForKnownRoomNick(activeRoomJid, nickHint, guildId) : "";
        const fallbackAvatar = mucAvatar || knownAvatar;
        if (isRenderableAvatarUrl(fallbackAvatar)) {
          avatar.style.backgroundImage = `url(${fallbackAvatar})`;
          avatar.style.backgroundSize = "cover";
          avatar.style.backgroundPosition = "center";
        }
      }
    } else {
      const mucAvatar = activeRoomJid ? xmppMucAvatarUrlForOccupant(activeRoomJid, nickHint) : "";
      const knownAvatar = !mucAvatar && activeRoomJid ? xmppAvatarUrlForKnownRoomNick(activeRoomJid, nickHint, guildId) : "";
      const fallbackAvatar = mucAvatar || knownAvatar;
      if (isRenderableAvatarUrl(fallbackAvatar)) {
        avatar.style.backgroundImage = `url(${fallbackAvatar})`;
        avatar.style.backgroundSize = "cover";
        avatar.style.backgroundPosition = "center";
      } else {
        avatar.style.backgroundColor = fallbackAvatarColorForSeed(displayNameForMessage(message));
        applyAvatarInitialGlyph(avatar, displayNameForMessage(message));
      }
    }
    avatar.title = displayNameForMessage(message);
    avatar.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const authorAccount = message.userId ? getAccountById(message.userId) : null;
      openUserPopout(authorAccount, message.authorName || "Unknown", {
        avatarUrlHint: avatarUrlHintFromElement(avatar)
      });
    });
    avatar.addEventListener("dblclick", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    messageRow.appendChild(avatar);

    const head = document.createElement("div");
    head.className = "message-head";

    const userButton = document.createElement("button");
    userButton.className = "message-user";
    userButton.textContent = displayNameForMessage(message);
    if (!isDm && channel && message.userId) {
      const roleColor = getMemberTopRoleColor(getActiveServer(), message.userId);
      if (roleColor) userButton.style.color = roleColor;
    }
    userButton.addEventListener("click", () => {
      const author = message.userId ? getAccountById(message.userId) : null;
      openUserPopout(author, message.authorName || "Unknown");
    });
    userButton.addEventListener("contextmenu", (event) => {
      const author = message.userId ? getAccountById(message.userId) : null;
      openContextMenu(event, [
        {
          label: "View Profile",
          action: () => openUserPopout(author, message.authorName || "Unknown")
        },
        {
          label: "Start DM",
          disabled: !author || author.id === getCurrentAccount()?.id,
          action: () => {
            if (!author) return;
            openDmWithAccount(author);
          }
        },
        {
          label: "Mention User",
          disabled: !author,
          action: () => mentionInComposer(author)
        },
        {
          label: "Show Quest Summary",
          disabled: !author,
          action: () => {
            if (!author) return;
            showToast(formatQuestSummaryText(author.id));
          }
        },
        {
          label: "Copy",
          submenu: [
            {
              label: "Display Name",
              disabled: !author,
              action: () => copyText(author ? displayNameForAccount(author, getActiveGuild()?.id || null) : "")
            },
            {
              label: "Username",
              disabled: !author,
              action: () => copyText(author ? `@${author.username}` : "")
            },
            {
              label: "User ID",
              disabled: !author,
              action: () => copyText(author ? author.id : "")
            },
            {
              label: "Guild Tag",
              disabled: !author || !accountGuildTag(author),
              action: () => copyText(author ? accountGuildTag(author) : "")
            },
            {
              label: "Avatar Decoration",
              disabled: !author || !accountDecorationEmoji(author),
              action: () => copyText(author ? accountDecorationEmoji(author) : "")
            },
            {
              label: "Nameplate URL",
              disabled: !author || !accountNameplateSvg(author),
              action: () => copyText(author ? accountNameplateSvg(author) : "")
            }
          ]
        }
      ]);
    });
    if (author) {
      applyNameplateStyle(userButton, author);
    }
    const messageTag = accountGuildTag(author);
    let userTagButton = null;
    if (messageTag) {
      userTagButton = document.createElement("button");
      userTagButton.type = "button";
      userTagButton.className = "guild-tag-chip";
      userTagButton.textContent = messageTag;
      userTagButton.title = "Guild tag";
      userTagButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        showGuildTagInfo(author);
      });
    }

    const time = document.createElement("span");
    time.className = "message-time";
    time.textContent = formatTime(message.ts);
    time.title = formatFullTimestamp(message.ts);
    time.addEventListener("click", (event) => {
      if (!event.shiftKey) return;
      event.preventDefault();
      void copyText(message.ts || "").then((copied) => {
        showToast(copied ? "Timestamp copied." : "Failed to copy timestamp.", { tone: copied ? "info" : "error" });
      });
    });
    let encryptedBadge = null;
    if (message.xmppEncrypted) {
      const label = (message.xmppEncryptedLabel || "").toString().trim() || "Encrypted";
      encryptedBadge = document.createElement("span");
      encryptedBadge.className = "message-encrypted";
      encryptedBadge.textContent = label;
      encryptedBadge.title = label !== "Encrypted"
        ? `Encrypted XMPP message (${label})`
        : "Encrypted XMPP message";
    }
    let processingHintBadge = null;
    const processingHints = message.xmppProcessingHints && typeof message.xmppProcessingHints === "object"
      ? message.xmppProcessingHints
      : null;
    if (processingHints?.hasHints) {
      const hintLabels = [];
      if (processingHints.noStore) hintLabels.push("no-store");
      if (processingHints.noPermanentStore) hintLabels.push("no-permanent-store");
      if (processingHints.noCopy) hintLabels.push("no-copy");
      if (processingHints.noPermanentCopy) hintLabels.push("no-permanent-copy");
      if (processingHints.store) hintLabels.push("store");
      const label = hintLabels.length > 0 ? `Hints: ${hintLabels.join(", ")}` : "Hints";
      processingHintBadge = document.createElement("span");
      processingHintBadge.className = "message-encrypted";
      processingHintBadge.textContent = "Hints";
      processingHintBadge.title = `XEP-0334 message processing hints (${label})`;
    }
    let deliveryBadge = null;
    if (isDm && currentAccount?.id && message.userId === currentAccount.id) {
      const deliveryState = (message.xmppDeliveryState || "").toString().toLowerCase();
      if (deliveryState === "sent" || deliveryState === "delivered" || deliveryState === "read") {
        deliveryBadge = document.createElement("span");
        deliveryBadge.className = `message-delivery message-delivery--${deliveryState}`;
        if (deliveryState === "read") {
          deliveryBadge.textContent = "✓✓ Read";
          deliveryBadge.title = message.xmppReadAt
            ? `Read at ${formatFullTimestamp(message.xmppReadAt)}`
            : "Read";
        } else if (deliveryState === "delivered") {
          deliveryBadge.textContent = "✓✓";
          deliveryBadge.title = message.xmppDeliveryAt
            ? `Delivered at ${formatFullTimestamp(message.xmppDeliveryAt)}`
            : "Delivered";
        } else {
          deliveryBadge.textContent = "✓";
          deliveryBadge.title = "Sent (waiting for delivery receipt)";
        }
      }
    }
    let editedBadge = null;
    if (message.editedAt) {
      editedBadge = document.createElement("span");
      editedBadge.className = "message-edited";
      editedBadge.textContent = message.editedByStaff ? "(edited by staff)" : "(edited)";
      if (message.editedByName || message.editedByUserId) {
        editedBadge.title = `Last edited by ${message.editedByName || message.editedByUserId} at ${message.editedAt}`;
      }
    }
    let collaborativeBadge = null;
    if (message.collaborative) {
      collaborativeBadge = document.createElement("span");
      collaborativeBadge.className = "message-edited";
      collaborativeBadge.textContent = "✍ shared";
      collaborativeBadge.title = "Collaborative message: members can edit this message";
    }

    let forumTitle = null;
    let renderedText = message.text;
    const attachments = collectRenderableAttachments(message);
    if (!isDm && channel?.type === "forum") {
      const [firstLine, ...rest] = (message.text || "").split("\n");
      forumTitle = document.createElement("div");
      forumTitle.className = "forum-post-title";
      forumTitle.textContent = (firstLine || "Untitled Post").trim().slice(0, 100) || "Untitled Post";
      const body = rest.join("\n").trim();
      renderedText = body || firstLine || "";
    }
    const renderedTextWithoutMediaLinks = stripInlineAttachmentUrlsFromText(renderedText, attachments);
    const text = document.createElement("div");
    text.className = "message-text";
    renderMessageText(text, renderedTextWithoutMediaLinks);

    let pinIndicator = null;
    if (message.pinned) {
      pinIndicator = document.createElement("div");
      pinIndicator.className = "pin-indicator";
      pinIndicator.textContent = "Pinned message";
    }

    if (message.replyTo && typeof message.replyTo === "object") {
      replyLine = document.createElement("div");
      replyLine.className = "message-reply";
      const replyName = document.createElement("strong");
      const replyText = document.createElement("span");
      const targetReplyId = resolveReplyTargetMessageId(message.replyTo, channel);
      const referenced = targetReplyId
        ? messageBucket.find((entry) => entry.id === targetReplyId) || null
        : null;
      const resolvedReplyAuthor = referenced
        ? displayNameForMessage(referenced)
        : decodeHtmlEntities((message.replyTo.authorName || "").toString()).trim() || "Unknown";
      const referencedAttachments = referenced ? collectRenderableAttachments(referenced) : [];
      let resolvedReplyText = referenced
        ? decodeHtmlEntities(stripInlineAttachmentUrlsFromText((referenced.text || "").toString(), referencedAttachments))
        : decodeHtmlEntities((message.replyTo.text || "").toString());
      resolvedReplyText = resolvedReplyText.replace(/\s+/g, " ").trim();
      if (!resolvedReplyText && referenced && referencedAttachments.length > 0) {
        resolvedReplyText = "(attachment)";
      }
      if (!resolvedReplyText || /^xmpp reply$/i.test(resolvedReplyText)) {
        resolvedReplyText = targetReplyId ? "Jump to original message" : "Referenced message unavailable";
      }
      replyName.textContent = resolvedReplyAuthor.slice(0, 60);
      replyText.textContent = resolvedReplyText.slice(0, 90);
      replyLine.appendChild(document.createTextNode("↪ "));
      replyLine.appendChild(replyName);
      replyLine.appendChild(document.createTextNode(": "));
      replyLine.appendChild(replyText);
      if (targetReplyId) {
        replyLine.title = "Jump to referenced message";
        replyLine.classList.add("message-reply--jump");
        replyLine.addEventListener("click", () => {
          const ok = focusMessageByIdWithHistory(targetReplyId, { toastOnLoad: true });
          if (!ok) showToast("Referenced message is not visible in this view.");
        });
      }
    }

    const actionBar = document.createElement("div");
    actionBar.className = "message-actions";
    const canReact = isDm || canCurrentUserReactInChannel(channel, getActiveGuild());
    if (currentUser && canReact) {
      const reactionQuick = document.createElement("div");
      reactionQuick.className = "message-action-reactions";
      quickReactionEmojiChoices(3).forEach((emoji) => {
        const reactionBtn = document.createElement("button");
        reactionBtn.type = "button";
        reactionBtn.className = "message-action-emoji-btn";
        reactionBtn.textContent = emoji;
        reactionBtn.title = `React with ${emoji}`;
        reactionBtn.addEventListener("click", () => {
          const changed = toggleMessageReactionForCurrentConversation(conversation, message, emoji, currentUser);
          if (changed) void triggerHapticFeedback("selection");
        });
        reactionQuick.appendChild(reactionBtn);
      });
      const emojiPickerBtn = document.createElement("button");
      emojiPickerBtn.type = "button";
      emojiPickerBtn.className = "message-action-emoji-btn message-action-emoji-btn--picker";
      emojiPickerBtn.textContent = "☺";
      emojiPickerBtn.title = "Open emoji reaction picker";
      emojiPickerBtn.addEventListener("click", () => {
        openMediaPickerWithTab("emoji", {
          resetQuery: true,
          emojiOnly: true,
          onEmojiSelect: (emoji) => {
            if (!emoji) return;
            const changed = toggleMessageReactionForCurrentConversation(conversation, message, emoji, currentUser);
            if (changed) void triggerHapticFeedback("selection");
          }
        });
      });
      reactionQuick.appendChild(emojiPickerBtn);
      actionBar.appendChild(reactionQuick);
    }

    const replyBtn = document.createElement("button");
    replyBtn.type = "button";
    replyBtn.className = "message-action-btn";
    replyBtn.textContent = "Reply";
    replyBtn.addEventListener("click", () => {
      setReplyTarget(conversationId, message, message.forumThreadId || null);
    });
    actionBar.appendChild(replyBtn);

    const quoteBtn = document.createElement("button");
    quoteBtn.type = "button";
    quoteBtn.className = "message-action-btn";
    quoteBtn.textContent = "Quote";
    quoteBtn.addEventListener("click", () => {
      quoteMessageInComposer(message);
    });
    actionBar.appendChild(quoteBtn);
    const markUnreadBtn = document.createElement("button");
    markUnreadBtn.type = "button";
    markUnreadBtn.className = "message-action-btn";
    markUnreadBtn.textContent = "Mark Unread";
    markUnreadBtn.disabled = !currentAccount?.id;
    markUnreadBtn.addEventListener("click", () => {
      if (!currentAccount?.id) return;
      if (!markConversationUnreadFromMessage(conversation, message.id, currentAccount.id)) return;
      saveState();
      renderDmList();
      renderChannels();
      renderMessages();
    });
    actionBar.appendChild(markUnreadBtn);

    const canPin = !isDm && currentUser && (message.userId === currentUser.id || canCurrentUser("manageMessages"));
    if (canPin) {
      const pinBtn = document.createElement("button");
      pinBtn.type = "button";
      pinBtn.className = "message-action-btn";
      pinBtn.textContent = message.pinned ? "Unpin" : "Pin";
      pinBtn.addEventListener("click", () => {
        const scopedChannel = findChannelById(channel.id);
        const scopedMessage = findMessageInChannel(scopedChannel, message.id);
        if (!scopedChannel || !scopedMessage) return;
        scopedMessage.pinned = !scopedMessage.pinned;
        saveState();
        renderMessages();
      });
      actionBar.appendChild(pinBtn);
    }

    const canManageMessages = isDm ? false : (currentUser ? canCurrentUser("manageMessages") : false);
    const isOwnMessage = currentUser && message.userId === currentUser.id;
    const canEditMessage = canEditMessageEntry(message, { isDm, canManageMessages, currentUser });
    if (canEditMessage) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "message-action-btn";
      editBtn.textContent = message.collaborative ? "Edit Shared" : "Edit";
      editBtn.addEventListener("click", () => openMessageEditor(conversationId, message.id, message.text));
      actionBar.appendChild(editBtn);

    }

    if (isOwnMessage || canManageMessages) {
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "message-action-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        if (isDm && dmThread) {
          dmThread.messages = dmThread.messages.filter((entry) => entry.id !== message.id);
        } else {
          const scopedChannel = findChannelById(channel.id);
          if (!scopedChannel) return;
          scopedChannel.messages = scopedChannel.messages.filter((entry) => entry.id !== message.id);
        }
        saveState();
        renderMessages();
      });
      actionBar.appendChild(deleteBtn);
    }
    bindMessageActionHoverState(messageRow, actionBar);

    const reactions = document.createElement("div");
    reactions.className = "message-reactions";
    const normalizedReactions = normalizeReactionsForConversation(message.reactions, conversation);
    normalizedReactions.forEach((item) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `reaction-chip ${currentUser && item.userIds.includes(currentUser.id) ? "active" : ""}`;
      chip.textContent = `${item.emoji} ${item.userIds.length}`;
      const reactorNames = [...new Set(item.userIds
        .map((actorId) => reactionDisplayNameForActorId(actorId, { conversation, guildId }))
        .filter(Boolean))];
      const shownNames = reactorNames.slice(0, 8);
      chip.title = shownNames.length > 0
        ? `Reacted by: ${shownNames.join(", ")}${reactorNames.length > shownNames.length ? ", …" : ""}`
        : `React with ${item.emoji}`;
      chip.disabled = !canReact;
      if (currentUser && canReact) {
        chip.addEventListener("click", () => {
          const changed = toggleMessageReactionForCurrentConversation(conversation, message, item.emoji, currentUser);
          if (changed) void triggerHapticFeedback("selection");
        });
      }
      reactions.appendChild(chip);
    });

    head.appendChild(userButton);
    if (userTagButton) head.appendChild(userTagButton);
    head.appendChild(time);
    if (encryptedBadge) head.appendChild(encryptedBadge);
    if (processingHintBadge) head.appendChild(processingHintBadge);
    if (deliveryBadge) head.appendChild(deliveryBadge);
    if (collaborativeBadge) head.appendChild(collaborativeBadge);
    if (editedBadge) head.appendChild(editedBadge);
    messageRow.appendChild(head);
    if (replyLine) messageRow.appendChild(replyLine);
    if (pinIndicator) messageRow.appendChild(pinIndicator);
    if (forumTitle) messageRow.appendChild(forumTitle);
    messageRow.appendChild(actionBar);
    if (renderedTextWithoutMediaLinks.trim()) {
      messageRow.appendChild(text);
    }
    renderMessagePoll(messageRow, message, {
      currentUser,
      isDm,
      canManageMessages,
      onChanged: () => {
        saveState();
        renderMessages();
      }
    });
    ui.messageList.appendChild(messageRow);
    attachments.forEach((attachment, index) => {
      renderMessageAttachment(messageRow, attachment, { swfKey: `${message.id}:${index}` });
    });
    if (attachments.length > 0) bindMessageAttachmentControlLock(messageRow);
    if (
      isDm
      && dmPeerAccount
      && latestReadOwnDmMessageId
      && (message.id || "").toString() === latestReadOwnDmMessageId
      && (message.userId || "").toString() === (currentAccount?.id || "").toString()
    ) {
      appendDmSeenIndicator(messageRow, message, dmPeerAccount);
    }
    if (reactions.childElementCount > 0) {
      messageRow.appendChild(reactions);
    }
    previousThreadMessage = message;
    const openMessageContextMenuAt = (event) => {
      const canManageMessages = currentUser ? canCurrentUser("manageMessages") : false;
      const isOwnMessage = currentUser && message.userId === currentUser.id;
      const canEditMessage = canEditMessageEntry(message, { isDm, canManageMessages, currentUser });
      const firstSwfAttachment = attachments.find((attachment) => attachment.type === "swf");
      const firstSwfIndex = attachments.findIndex((attachment) => attachment.type === "swf");
      const poll = normalizePoll(message.poll);
      const pollVoteSubmenu = poll && !poll.closed && currentUser
        ? poll.options.map((option, index) => ({
            label: `${index + 1}. ${option.label}`,
            action: () => {
              const changed = togglePollVote(message, option.id, currentUser.id);
              if (!changed) return;
              saveState();
              renderMessages();
            }
          }))
        : [];
      const menuItems = [
        {
          label: "Reply",
          action: () => {
            setReplyTarget(conversationId, message, message.forumThreadId || null);
          }
        },
        {
          label: "Quote in Composer",
          action: () => quoteMessageInComposer(message)
        },
        {
          label: "Poll",
          disabled: !poll,
          submenu: [
            ...(
              canManagePollMessage(message, { isDm, canManageMessages, currentUser })
                ? [
                  {
                    label: poll?.closed ? "Reopen Poll" : "Close Poll",
                    action: () => {
                      const next = normalizePoll(message.poll);
                      if (!next) return;
                      message.poll = { ...next, closed: !next.closed };
                      saveState();
                      renderMessages();
                    }
                  }
                ]
                : []
            ),
            {
              label: "Copy Poll Results",
              disabled: !poll,
              action: () => copyText(formatPollResultsText(message))
            },
            ...pollVoteSubmenu
          ]
        },
        {
          label: "Copy",
          submenu: [
            { label: "Text", action: () => copyText(message.text || "") },
            { label: "Markdown Quote", action: () => copyText(`> ${(message.text || "").replace(/\n/g, "\n> ")}`) },
            { label: "Author Username", action: () => {
              const author = message.userId ? getAccountById(message.userId) : null;
              copyText(author ? `@${author.username}` : "");
            } },
            { label: "Timestamp", action: () => copyText(message.ts || "") },
            { label: "Timestamp (local)", action: () => copyText(formatFullTimestamp(message.ts || "")) },
            { label: "Message Link", action: () => copyText(buildMessagePermalink(conversationId, message.id)) },
            { label: "Message ID", action: () => copyText(message.id || "") },
            { label: "First Attachment URL", action: () => copyText(attachments[0]?.url ? resolveMediaUrl(attachments[0].url) : "") },
            { label: "Edit History JSON", action: () => copyText(JSON.stringify(messageEditHistory(message), null, 2)) },
            { label: "JSON", action: () => copyText(serializeMessageAsJson(message)) },
            { label: "XML", action: () => copyText(serializeMessageAsXml(message)) }
          ]
        },
        ...(
          isDm || !(currentUser && (message.userId === currentUser.id || canManageMessages))
            ? []
            : [
              {
                label: message.pinned ? "Unpin Message" : "Pin Message",
                action: () => {
                  const scopedChannel = findChannelById(channel.id);
                  const scopedMessage = findMessageInChannel(scopedChannel, message.id);
                  if (!scopedChannel || !scopedMessage) return;
                  scopedMessage.pinned = !scopedMessage.pinned;
                  saveState();
                  renderMessages();
                }
              }
            ]
        ),
        {
          label: "Mark Unread From Here",
          disabled: !currentAccount?.id,
          action: () => {
            if (!currentAccount?.id) return;
            if (!markConversationUnreadFromMessage(conversation, message.id, currentAccount.id)) return;
            saveState();
            renderDmList();
            renderChannels();
            renderMessages();
          }
        },
        ...(
          canEditMessage
            ? [
              {
                label: message.collaborative ? "Edit Shared Message" : "Edit Message",
                action: () => openMessageEditor(conversationId, message.id, message.text)
              }
            ]
            : []
        ),
        {
          label: "View Edit History",
          disabled: messageEditHistory(message).length === 0,
          action: async () => {
            await showInAppAlertDialog({
              title: "Edit history",
              message: formatMessageEditHistory(message)
            });
          }
        },
        ...(
          isOwnMessage || canManageMessages
            ? [
              {
                label: "Delete Message",
                danger: true,
                action: () => {
                  if (isDm && dmThread) {
                    dmThread.messages = dmThread.messages.filter((entry) => entry.id !== message.id);
                  } else {
                    const scopedChannel = findChannelById(channel.id);
                    if (!scopedChannel) return;
                    scopedChannel.messages = scopedChannel.messages.filter((entry) => entry.id !== message.id);
                  }
                  saveState();
                  renderMessages();
                }
              }
            ]
            : []
        )
      ];
      if (firstSwfAttachment) {
        menuItems.splice(2, 0, {
          label: "SWF",
          submenu: [
            {
              label: "Open in Viewer",
              action: () => {
                const runtimeKey = firstSwfIndex >= 0 ? `${message.id}:${firstSwfIndex}` : null;
                openSwfViewer(firstSwfAttachment, runtimeKey);
              }
            },
            {
              label: "FullScreen",
              action: async () => {
                const runtimeKey = firstSwfIndex >= 0 ? `${message.id}:${firstSwfIndex}` : null;
                const runtime = runtimeKey ? swfRuntimes.get(runtimeKey) : null;
                const host = runtime?.host || messageRow.querySelector(".message-attachment--swf .message-swf-player");
                if (!host) return;
                await openSwfFullscreen(runtimeKey, host, firstSwfAttachment);
              }
            },
            {
              label: "Reset",
              action: () => {
                const runtimeKey = firstSwfIndex >= 0 ? `${message.id}:${firstSwfIndex}` : null;
                const runtime = runtimeKey ? swfRuntimes.get(runtimeKey) : null;
                const host = runtime?.host || messageRow.querySelector(".message-attachment--swf .message-swf-player");
                if (!host) return;
                void resetSwfRuntime(runtimeKey, host, firstSwfAttachment);
              }
            },
            {
              label: "Save to Shelf",
              action: () => {
                const saved = saveSwfToShelf(firstSwfAttachment);
                showToast(saved ? "SWF saved to shelf" : "SWF is already in shelf");
              }
            },
            {
              label: "Copy URL",
              action: async () => {
                const copied = await copyText(resolveMediaUrl(firstSwfAttachment.url));
                showToast(copied ? "SWF URL copied" : "Failed to copy SWF URL", { tone: copied ? "info" : "error" });
              }
            },
            {
              label: "Download",
              action: async () => {
                const ok = await downloadAttachmentFile(firstSwfAttachment, "swf");
                showToast(ok ? "SWF download started" : "SWF download failed", { tone: ok ? "info" : "error" });
              }
            }
          ]
        });
      }
      openContextMenu(event, menuItems);
    };
    messageRow.addEventListener("contextmenu", (event) => {
      if (shouldUseNativeContextMenu(event.target)) return;
      if (document.body?.dataset?.mobile === "on") void triggerHapticFeedback("medium");
      openMessageContextMenuAt(event);
    });
    messageRow.addEventListener("keydown", (event) => {
      const wantsContextMenu = event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey);
      if (!wantsContextMenu) return;
      if (shouldUseNativeContextMenu(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      const rect = messageRow.getBoundingClientRect();
      const syntheticEvent = {
        preventDefault() {},
        stopPropagation() {},
        clientX: Math.max(8, Math.min(window.innerWidth - 8, Math.round(rect.left + 24))),
        clientY: Math.max(8, Math.min(window.innerHeight - 8, Math.round(rect.top + Math.min(rect.height, 30))))
      };
      openMessageContextMenuAt(syntheticEvent);
    });
  });

  let didPositionScroll = false;
  if (isDm && unreadDividerEl && !sameConversationAsBefore) {
    unreadDividerEl.scrollIntoView({ block: "center" });
    didPositionScroll = true;
  } else if (!shouldAutoScrollToBottom && preservedScrollAnchor) {
    didPositionScroll = restoreMessageListAnchor(preservedScrollAnchor);
  }
  if (!didPositionScroll && shouldAutoScrollToBottom) {
    ui.messageList.scrollTop = ui.messageList.scrollHeight;
  }
  const hashRef = parseHashMessageReference();
  if (hashRef && hashRef.conversationId === conversationId) {
    focusMessageById(hashRef.messageId);
  }
  if (pendingFindJumpMessageId) {
    if (focusMessageById(pendingFindJumpMessageId)) {
      pendingFindJumpMessageId = "";
      pendingFindJumpAttempts = 0;
    } else {
      const started = maybeLoadOlderXmppHistoryForActiveConversation({ trigger: "find" });
      const historyState = activeConversationHistoryState();
      if (started) {
        pendingFindJumpAttempts = Math.max(0, pendingFindJumpAttempts - 1);
      } else if (historyState?.loading) {
        // Keep waiting while a MAM page is in-flight.
      } else if (historyState?.complete || pendingFindJumpAttempts <= 0) {
        pendingFindJumpMessageId = "";
        pendingFindJumpAttempts = 0;
      } else {
        pendingFindJumpAttempts = Math.max(0, pendingFindJumpAttempts - 1);
      }
    }
  }
  lastRenderedMessageSignature = messageSignature;
  refreshHeaderActionButtonLabels();
  updateJumpToBottomButton();
  const didMarkRead = isDm ? markDmRead(dmThread, currentAccount?.id) : markChannelRead(channel, currentAccount?.id);
  if (currentAccount && didMarkRead) {
    saveState();
    renderServers();
    renderDmList();
    renderChannels();
  }
  requestSwfRuntimeLayoutSync();
}

function appendMessageRowLite(channel, message) {
  if (!channel || !message) return;
  const shouldStickToBottom = isMessageListNearBottom();
  const currentUser = getCurrentAccount();
  const isDm = Boolean(channel.participantIds);
  const dmPeerAccount = isDm && currentUser?.id ? dmPeerAccountForThread(channel, currentUser.id) : null;
  const latestReadOwnDmMessageId = isDm && currentUser?.id ? latestOwnXmppReadDmMessageId(channel, currentUser.id) : "";
  const canManageMessages = !isDm && canCurrentUser("manageMessages");
  const previous = [...ui.messageList.querySelectorAll(".message")].at(-1);
  const previousTs = previous?.dataset?.ts || "";
  const prevKey = previousTs ? messageDateKey(previousTs) : "";
  const nextKey = messageDateKey(message.ts);
  if (nextKey && nextKey !== prevKey) {
    ui.messageList.appendChild(createMessageDayDivider(message.ts));
  }
  const messageRow = document.createElement("article");
  messageRow.className = "message";
  messageRow.dataset.messageId = message.id;
  messageRow.dataset.ts = message.ts;
  const head = document.createElement("div");
  head.className = "message-head";
  const userButton = document.createElement("button");
  userButton.className = "message-user";
  userButton.textContent = displayNameForMessage(message);
  const author = message.userId ? getAccountById(message.userId) : null;
  if (author?.xmppJid) maybeFetchXmppAvatarForJid(author.xmppJid);
  if (author) applyNameplateStyle(userButton, author);
  userButton.addEventListener("click", () => {
    openUserPopout(author, message.authorName || "Unknown");
  });
  const time = document.createElement("span");
  time.className = "message-time";
  time.textContent = formatTime(message.ts);
  time.title = formatFullTimestamp(message.ts);
  time.addEventListener("click", (event) => {
    if (!event.shiftKey) return;
    event.preventDefault();
    void copyText(message.ts || "").then((copied) => {
      showToast(copied ? "Timestamp copied." : "Failed to copy timestamp.", { tone: copied ? "info" : "error" });
    });
  });
  head.appendChild(userButton);
  const tag = accountGuildTag(author);
  if (tag) {
    const tagChip = document.createElement("button");
    tagChip.type = "button";
    tagChip.className = "guild-tag-chip";
    tagChip.textContent = tag;
    tagChip.title = "Guild tag";
    tagChip.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      showGuildTagInfo(author);
    });
    head.appendChild(tagChip);
  }
  head.appendChild(time);
  if (isDm && currentUser?.id && message.userId === currentUser.id) {
    const deliveryState = (message.xmppDeliveryState || "").toString().toLowerCase();
    if (deliveryState === "sent" || deliveryState === "delivered" || deliveryState === "read") {
      const deliveryBadge = document.createElement("span");
      deliveryBadge.className = `message-delivery message-delivery--${deliveryState}`;
      if (deliveryState === "read") {
        deliveryBadge.textContent = "✓✓ Read";
        deliveryBadge.title = message.xmppReadAt
          ? `Read at ${formatFullTimestamp(message.xmppReadAt)}`
          : "Read";
      } else if (deliveryState === "delivered") {
        deliveryBadge.textContent = "✓✓";
        deliveryBadge.title = message.xmppDeliveryAt
          ? `Delivered at ${formatFullTimestamp(message.xmppDeliveryAt)}`
          : "Delivered";
      } else {
        deliveryBadge.textContent = "✓";
        deliveryBadge.title = "Sent (waiting for delivery receipt)";
      }
      head.appendChild(deliveryBadge);
    }
  }
  messageRow.appendChild(head);
  const attachments = collectRenderableAttachments(message);
  const renderedText = stripInlineAttachmentUrlsFromText(message.text, attachments);
  const text = document.createElement("div");
  text.className = "message-text";
  renderMessageText(text, renderedText);
  if (renderedText.trim()) {
    messageRow.appendChild(text);
  }
  renderMessagePoll(messageRow, message, {
    currentUser,
    isDm,
    canManageMessages,
    onChanged: () => {
      saveState();
      renderMessages();
    }
  });
  attachments.forEach((attachment, index) => {
    renderMessageAttachment(messageRow, attachment, { swfKey: `${message.id}:${index}` });
  });
  if (attachments.length > 0) bindMessageAttachmentControlLock(messageRow);
  if (
    isDm
    && dmPeerAccount
    && latestReadOwnDmMessageId
    && (message.id || "").toString() === latestReadOwnDmMessageId
    && (message.userId || "").toString() === (currentUser?.id || "").toString()
  ) {
    appendDmSeenIndicator(messageRow, message, dmPeerAccount);
  }
  ui.messageList.appendChild(messageRow);
  if (shouldStickToBottom) {
    ui.messageList.scrollTop = ui.messageList.scrollHeight;
  }
  updateJumpToBottomButton();
  renderComposerMeta();
  requestSwfRuntimeLayoutSync();
}
