(function initXepXmppCommandRuntime(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_XMPP_COMMAND_RUNTIME) return;

  function handleXmppCommandRuntime({ command = "", arg = "", channel = null, account = null } = {}) {
  if (command === "call" || command === "callscreen" || command === "callweb") {
    const raw = (arg || "").trim();
    const parts = raw ? raw.split(/\s+/) : [];
    const first = (parts[0] || "").toLowerCase();
    const explicitAction = ["join", "start", "screen", "screenshare", "share", "link", "copy"].includes(first) ? first : "";
    const action = command === "callscreen" ? "screen" : (explicitAction || "join");
    const roomOverride = command === "callscreen"
      ? raw
      : (explicitAction ? parts.slice(1).join(" ") : raw);
    if (action === "link" || action === "copy") {
      const url = conversationCallUrl(getActiveConversation(), { roomOverride });
      if (!url) {
        addSystemMessage(channel, "Could not resolve call room URL.");
        return true;
      }
      if (action === "copy") {
        void copyText(url).then((ok) => showToast(ok ? "Call link copied." : "Failed to copy call link.", { tone: ok ? "info" : "error" }));
      } else {
        addSystemMessage(channel, `Call link: ${url}`);
      }
      return true;
    }
    launchConversationCall({
      screenShare: ["screen", "screenshare", "share"].includes(action),
      roomOverride,
      autoPost: true,
      allowNative: command !== "callweb"
    });
    return true;
  }

  if (command === "callxmpp") {
    const raw = (arg || "").trim();
    const [subRaw, tokenRaw] = raw.split(/\s+/, 2);
    const sub = (subRaw || "").toLowerCase();
    const token = (tokenRaw || "").trim().toLowerCase();
    if (sub === "status") {
      const activeConversation = getActiveConversation();
      xmppAssessConversationCallInterop(activeConversation, { force: true }).then((interop) => {
        const snapshots = xmppCallDebugSnapshotForConversation(activeConversation, getCurrentAccount());
        const snapshotText = snapshots.length > 0
          ? ` session: ${xmppFormatCallSnapshotLine(snapshots[0])}${snapshots.length > 1 ? " …" : ""}`
          : "";
        if (interop.ready) {
          addSystemMessage(channel, `XMPP call interop: ready (target ${interop.chosenTarget || "unknown"}).${snapshotText}`);
          return;
        }
        const first = interop.details[0]?.evalResult || {};
        const missing = [
          first.hasCore ? "" : "jingle",
          first.hasMedia ? "" : "rtp-media",
          first.hasTransport ? "" : "ice-udp",
          first.hasInvite ? "" : "invite"
        ].filter(Boolean);
        addSystemMessage(channel, `XMPP call interop: not ready${missing.length > 0 ? ` (missing ${missing.join(", ")})` : ""}.${snapshotText}`);
      }).catch(() => {
        addSystemMessage(channel, "XMPP call interop check failed.");
      });
      return true;
    }
    if (sub === "accept" || sub === "reject" || sub === "cancel" || sub === "ring" || sub === "transport" || sub === "end") {
      const conversation = getActiveConversation();
      const dmPeer = xmppPeerJidForConversation(conversation, getCurrentAccount());
      const roomPeer = conversation?.type === "channel"
        ? xmppBareJid(conversation.channel?.xmppRoomJid || "")
        : "";
      const peerBare = xmppBareJid(dmPeer || roomPeer);
      if (!peerBare) {
        addSystemMessage(channel, "XMPP call controls require an XMPP DM or XMPP room channel.");
        return true;
      }
      const targetId = token
        ? ([...xmppCallSessionById.keys()].find((id) => id.toLowerCase().startsWith(token)) || "")
        : latestXmppCallSessionIdForPeer(peerBare, (sub === "cancel" || sub === "end") ? "outgoing" : "incoming");
      if (!targetId) {
        addSystemMessage(channel, "No matching XMPP call session.");
        return true;
      }
      const session = xmppCallSessionById.get(targetId) || null;
      const peerTarget = xmppResolveSessionPeerJid(session, peerBare, { preferFull: true }) || peerBare;
      if (xmppSessionIsMujiCallInvite(session)) {
        if (sub === "ring" || sub === "transport") {
          addSystemMessage(channel, "Muji room invites do not use /callxmpp ring or /callxmpp transport.");
          return true;
        }
        if (sub === "accept") {
          void acceptIncomingXmppCall(targetId).then((ok) => {
            addSystemMessage(channel, ok
              ? `Accepted Muji room call invite (${targetId.slice(0, 8)}).`
              : "Failed to accept Muji room call invite.");
          });
          return true;
        }
        const sentMuji = declineIncomingXmppCall(targetId);
        addSystemMessage(channel, sentMuji
          ? `Sent Muji ${sub === "end" ? "leave" : "reject"} for ${targetId.slice(0, 8)}.`
          : "Failed to send Muji call action.");
        return true;
      }
      stopWebCallRingtone(targetId);
      const isJinglePhase = (session?.state || "").includes("session");
      const action = sub === "accept" ? "proceed" : (sub === "reject" ? "reject" : "retract");
      let sent = false;
      if (sub === "accept" && isJinglePhase) {
        void (async () => {
          const ok = await xmppSendJingleSessionAccept(peerTarget, targetId, {
            media: Array.isArray(session?.media) && session.media.length > 0 ? session.media : XMPP_CALL_DEFAULT_MEDIA,
            screenShare: Boolean(session?.screenShare)
          });
          if (!ok) {
            addSystemMessage(channel, "Failed to send XMPP call action.");
            return;
          }
          addSystemMessage(channel, `Sent XMPP session-accept for ${targetId.slice(0, 8)}.`);
          if (addSystemDmMessageByPeerJid(peerBare, `Sent XMPP session-accept (${targetId.slice(0, 8)}).`)) {
            refreshDmUiForPeerJid(peerBare);
          }
          openNativeXmppCallSurface(targetId);
        })();
        return true;
      } else if (sub === "end") {
        sent = xmppSendJingleSessionTerminate(peerTarget, targetId, {
          reason: "success",
          text: "Ended by local user"
        });
      } else if (sub === "ring") {
        sent = isJinglePhase
          ? xmppSendJingleSessionInfo(peerTarget, targetId, { info: "ringing" })
          : xmppSendJingleMessageAction(peerTarget, "ringing", { sessionId: targetId });
      } else if (sub === "transport") {
        const localTransport = session?.localTransport && typeof session.localTransport === "object"
          ? session.localTransport
          : xmppBuildJingleTransportCreds();
        if (session) session.localTransport = localTransport;
        sent = xmppQueueTransportInfoGatherAndSend(peerTarget, targetId, { force: true });
      } else {
        sent = xmppSendJingleMessageAction(peerTarget, action, { sessionId: targetId });
      }
      if (!sent) {
        addSystemMessage(channel, "Failed to send XMPP call action.");
        return true;
      }
      const sentLabel = sub === "accept" && isJinglePhase
        ? "session-accept"
        : (sub === "end"
          ? "session-terminate"
          : (sub === "ring"
            ? (isJinglePhase ? "session-info/ringing" : "ringing")
            : (sub === "transport" ? "transport-info (queued)" : action)));
      addSystemMessage(channel, `Sent XMPP ${sentLabel} for ${targetId.slice(0, 8)}.`);
      if (addSystemDmMessageByPeerJid(peerBare, `Sent XMPP ${sentLabel} (${targetId.slice(0, 8)}).`)) {
        refreshDmUiForPeerJid(peerBare);
      }
      if (sub === "accept") {
        if (isJinglePhase) {
          openNativeXmppCallSurface(targetId);
        } else {
          addSystemMessage(channel, "Waiting for XMPP session-initiate...");
        }
      }
      if (["reject", "cancel", "end"].includes(sub)) {
        forgetXmppCallSession(targetId);
      }
      return true;
    }
    const lowerRaw = raw.toLowerCase();
    const screenShare = lowerRaw === "screen" || lowerRaw === "screenshare" || lowerRaw === "share";
    launchNativeXmppConversationCall({ screenShare });
    return true;
  }

  if (command === "joinxmpp" || command === "joinmuc") {
    const result = handleJoinXmppCommand(arg, account, { focus: true });
    addSystemMessage(channel, result.message);
    return true;
  }

  if (command === "leavexmpp" || command === "leavemuc") {
    const result = handleLeaveXmppCommand(arg, account);
    addSystemMessage(channel, result.message);
    if (result.ok) {
      renderServers();
      renderChannels();
    }
    return true;
  }

  if (command === "invitexmpp" || command === "invitemuc") {
    addSystemMessage(
      channel,
      "This command works in XMPP DMs. Use /invitexmpp <room@conference.domain> [| reason [| password [| continue [| thread-id]]]] in a DM."
    );
    return true;
  }

  if (command === "omemo") {
    const conversation = getActiveConversation();
    if (!conversation) {
      addSystemMessage(channel, "Open a conversation first.");
      return true;
    }
    let peerBare = "";
    if (conversation.type === "dm") {
      const peerJid = xmppPeerJidForDmThread(conversation.thread, account);
      peerBare = xmppBareJid(peerJid || "");
      if (!peerBare) {
        addSystemMessage(channel, "OMEMO requires an XMPP DM peer.");
        return true;
      }
    } else if (conversation.type === "channel" && isXmppBackedChannel(conversation.channel)) {
      peerBare = xmppBareJid(conversation.channel?.xmppRoomJid || "");
      if (!peerBare) {
        addSystemMessage(channel, "OMEMO requires an XMPP room.");
        return true;
      }
    } else {
      addSystemMessage(channel, "OMEMO controls only work inside an XMPP DM or XMPP room.");
      return true;
    }
    if (!xmppOmemoRuntimeAvailable()) {
      addSystemMessage(channel, "OMEMO runtime is not available in this build.");
      return true;
    }
    const sub = (arg || "status").trim().toLowerCase();
    const ownBare = xmppBareJid(getPreferences().xmppJid || "");
    if (!ownBare) {
      addSystemMessage(channel, "OMEMO requires a valid XMPP JID for this account.");
      return true;
    }
    if (sub === "on" || sub === "enable") {
      xmppOmemoSetPeerEnabled(peerBare, true);
      addSystemMessage(channel, `OMEMO enabled for ${peerBare}.`);
      void (async () => {
        await xmppOmemoEnsureOwnBundle(ownBare);
        await xmppOmemoFetchDeviceList(peerBare);
        await xmppOmemoEnsurePeerSessions(peerBare, ownBare);
        showToast(`OMEMO sessions ready for ${peerBare}.`, { tone: "info" });
        if (conversation.type === "channel") {
          const occupants = xmppOccupantsByRoomJid.get(peerBare);
          const hasJids = occupants && [...occupants.values()].some((entry) => xmppBareJid(entry?.jid || ""));
          if (!hasJids) {
            addSystemMessage(channel, "OMEMO groupchat requires a non-anonymous room (real JIDs).");
          }
        }
      })();
      return true;
    }
    if (sub === "off" || sub === "disable") {
      xmppOmemoSetPeerEnabled(peerBare, false);
      addSystemMessage(channel, `OMEMO disabled for ${peerBare}.`);
      return true;
    }
    if (sub === "refresh") {
      void (async () => {
        await xmppOmemoEnsureOwnBundle(ownBare, { force: true });
        const devices = await xmppOmemoFetchDeviceList(peerBare);
        await xmppOmemoEnsurePeerSessions(peerBare, ownBare);
        addSystemMessage(channel, `OMEMO refresh complete (${devices.length} device${devices.length === 1 ? "" : "s"}).`);
      })();
      return true;
    }
    if (sub === "devices") {
      void (async () => {
        const devices = await xmppOmemoFetchDeviceList(peerBare);
        addSystemMessage(channel, devices.length > 0
          ? `OMEMO devices for ${peerBare}: ${devices.join(", ")}`
          : `No OMEMO device list for ${peerBare} yet.`);
      })();
      return true;
    }
    if (sub === "status") {
      void (async () => {
        const enabled = xmppOmemoEnabledForPeer(peerBare);
        const store = xmppOmemoStoreForAccount(ownBare);
        const localId = store ? await store.getLocalRegistrationId() : null;
        const devices = xmppOmemoDeviceListByJid.get(peerBare) || [];
        const preferredNamespace = xmppPreferredOmemoNamespaceForPeer(peerBare);
        addSystemMessage(
          channel,
          [
            `OMEMO for ${peerBare}: ${enabled ? "enabled" : "disabled"}`,
            localId ? `Local device ID: ${localId}` : "Local device ID: not set",
            `Known peer devices: ${devices.length}`,
            `Namespace: ${preferredNamespace === XMPP_OMEMO_NAMESPACE_V2 ? "OMEMO 2" : "legacy"}`
          ].join(" · ")
        );
      })();
      return true;
    }
    addSystemMessage(channel, "Usage: /omemo [on|off|status|devices|refresh]");
    return true;
  }

  if (command === "spacesxmpp" || command === "xmppspaces") {
    const raw = (arg || "").trim();
    const [subRaw, ...restParts] = raw.split(/\s+/).filter(Boolean);
    const sub = (subRaw || "list").toLowerCase();
    if (sub === "join") {
      const result = handleJoinXmppCommand(restParts.join(" "), account, { focus: true });
      addSystemMessage(channel, result.message);
      return true;
    }
    if (sub === "leave") {
      const result = handleLeaveXmppCommand(restParts.join(" "), account);
      addSystemMessage(channel, result.message);
      if (result.ok) {
        renderServers();
        renderChannels();
      }
      return true;
    }
    if (sub === "open") {
      const opened = focusXmppSpacesGuild(account, getPreferences());
      addSystemMessage(channel, opened ? "Opened XMPP Spaces." : "Could not open XMPP Spaces.");
      return true;
    }
    if (sub === "sync" || sub === "discover") {
      addSystemMessage(channel, `Syncing XMPP Spaces (${sub === "discover" ? "forced discovery" : "cached discovery"})...`);
      void syncXmppSpacesNow({
        account,
        prefs: getPreferences(),
        forceDiscovery: sub === "discover"
      }).then((result) => {
        addSystemMessage(channel, result.message);
        if (result.ok) {
          renderServers();
          renderChannels();
        }
      }).catch(() => {
        addSystemMessage(channel, "Failed to sync XMPP Spaces.");
      });
      return true;
    }
    if (sub === "list" || sub === "status") {
      const lines = xmppSpacesSummaryLines({ limit: 20, prefs: getPreferences() });
      addSystemMessage(
        channel,
        lines.length > 0
          ? `XMPP Spaces rooms:\n${lines.join("\n")}`
          : "No XMPP Spaces rooms mapped yet. Use /spacesxmpp sync or /joinxmpp <room@conference.domain>."
      );
      return true;
    }
    addSystemMessage(channel, "Usage: /spacesxmpp [list|open|sync|discover|join <room@conference.domain>|leave [room@conference.domain]]");
    return true;
  }

  if (command === "whiteboard") {
    const raw = (arg || "").trim();
    const parts = raw ? raw.split(/\s+/) : [];
    const first = (parts[0] || "").toLowerCase();
    const explicitAction = ["open", "join", "copy", "link", "post", "fallback"].includes(first) ? first : "";
    const action = explicitAction || "open";
    const roomOverride = explicitAction ? parts.slice(1).join(" ") : raw;
    if (action === "copy" || action === "link") {
      const url = conversationWhiteboardUrl(getActiveConversation(), roomOverride);
      if (!url) {
        addSystemMessage(channel, "Could not resolve whiteboard room URL.");
        return true;
      }
      if (action === "copy") {
        void copyText(url).then((ok) => showToast(ok ? "Whiteboard link copied." : "Failed to copy whiteboard link.", { tone: ok ? "info" : "error" }));
      } else {
        addSystemMessage(channel, `Whiteboard link: ${url}`);
      }
      return true;
    }
    const wantsPost = action === "post" || action === "fallback";
    launchConversationWhiteboard({ roomOverride, autoPost: wantsPost });
    return true;
  }

  if (command === "voicewho") {
    if (!(channel.type === "voice" || channel.type === "stage")) {
      addSystemMessage(channel, "This command only works in voice/stage channels.");
      return true;
    }
    const guild = getActiveGuild();
    ensureVoiceStateForChannel(channel);
    const rows = channel.voiceState.connectedIds
      .map((id) => getAccountById(id))
      .filter(Boolean)
      .map((member) => {
        const flags = [];
        if (channel.voiceState.mutedIds.includes(member.id)) flags.push("Muted");
        if (channel.type === "stage" && channel.voiceState.speakerIds.includes(member.id)) flags.push("Speaker");
        if (channel.type === "stage" && channel.voiceState.raisedHandIds.includes(member.id)) flags.push("Hand Raised");
        return `${displayNameForAccount(member, guild?.id || null)}${flags.length > 0 ? ` (${flags.join(", ")})` : ""}`;
      });
    addSystemMessage(channel, rows.length > 0 ? `Connected: ${rows.join(" · ")}` : "Nobody is connected.");
    return true;
  }

  if (command === "voiceactivity") {
    if (!(channel.type === "voice" || channel.type === "stage")) {
      addSystemMessage(channel, "This command only works in voice/stage channels.");
      return true;
    }
    const guild = getActiveGuild();
    ensureVoiceStateForChannel(channel);
    const countRaw = Number(arg.trim());
    const limit = Number.isFinite(countRaw) ? Math.max(1, Math.min(20, Math.floor(countRaw))) : 8;
    const rows = (channel.voiceState.activity || [])
      .slice(-limit)
      .reverse()
      .map((entry) => `${formatTime(entry.ts)} · ${describeVoiceActivity(entry, guild)}`);
    addSystemMessage(channel, rows.length > 0 ? rows.join("\n") : "No voice activity yet.");
    return true;
  }

  if (command === "voicechannels") {
    const guild = getActiveGuild();
    if (!guild) return true;
    const current = getCurrentAccount();
    const rows = (guild.channels || [])
      .filter((entry) => entry.type === "voice" || entry.type === "stage")
      .map((entry) => {
        ensureVoiceStateForChannel(entry);
        const connected = entry.voiceState.connectedIds.length;
        const speakers = entry.type === "stage" ? ` S${entry.voiceState.speakerIds.length}` : "";
        const queue = entry.type === "stage" ? ` Q${entry.voiceState.raisedHandIds.length}` : "";
        const me = current && entry.voiceState.connectedIds.includes(current.id) ? " (joined)" : "";
        return `#${entry.name}: ${connected}${speakers}${queue}${me}`;
      });
    addSystemMessage(channel, rows.length > 0 ? rows.join("\n") : "No voice/stage channels in this guild.");
    return true;
  }

  if (command === "voicegoto") {
    const guild = getActiveGuild();
    if (!guild) return true;
    const targetChannel = resolveVoiceChannelByToken(guild, arg);
    if (!targetChannel) {
      addSystemMessage(channel, "Usage: /voicegoto <channel>");
      return true;
    }
    state.activeChannelId = targetChannel.id;
    const changed = joinVoiceLikeChannel(targetChannel, account.id);
    saveState();
    render();
    addSystemMessage(targetChannel, changed ? "Joined channel." : "Already connected.");
    return true;
  }

  if (command === "vcmove") {
    if (!(channel.type === "voice" || channel.type === "stage")) {
      addSystemMessage(channel, "This command only works in voice/stage channels.");
      return true;
    }
    if (!canModerateVoiceLikeChannel(channel)) {
      addSystemMessage(channel, "Voice moderation permission required.");
      return true;
    }
    const guild = getActiveGuild();
    const parts = arg.split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      addSystemMessage(channel, "Usage: /vcmove <member> <target-channel>");
      return true;
    }
    const memberToken = parts[0];
    const targetToken = parts.slice(1).join(" ");
    const targetMember = resolveVoiceParticipantByToken(channel, memberToken, guild);
    if (!targetMember) {
      addSystemMessage(channel, "Member not found in this call.");
      return true;
    }
    const targetChannel = resolveVoiceChannelByToken(guild, targetToken);
    if (!targetChannel) {
      addSystemMessage(channel, "Target voice/stage channel not found.");
      return true;
    }
    if (targetChannel.id === channel.id) {
      addSystemMessage(channel, "Member is already in that channel.");
      return true;
    }
    const changed = joinVoiceLikeChannel(targetChannel, targetMember.id);
    if (!changed) {
      addSystemMessage(channel, "Could not move member.");
      return true;
    }
    addVoiceActivity(channel, account.id, "disconnected", `${displayNameForAccount(targetMember, guild?.id || null)} -> #${targetChannel.name}`);
    addVoiceActivity(targetChannel, account.id, "promoted", `${displayNameForAccount(targetMember, guild?.id || null)} from #${channel.name}`);
    addSystemMessage(channel, `Moved ${displayNameForAccount(targetMember, guild?.id || null)} to #${targetChannel.name}.`);
    renderMemberList();
    renderChannels();
    renderMessages();
    return true;
  }

  if (command === "voicekick") {
    if (!(channel.type === "voice" || channel.type === "stage")) {
      addSystemMessage(channel, "This command only works in voice/stage channels.");
      return true;
    }
    if (!canModerateVoiceLikeChannel(channel)) {
      addSystemMessage(channel, "Voice moderation permission required.");
      return true;
    }
    const guild = getActiveGuild();
    const target = resolveVoiceParticipantByToken(channel, arg, guild);
    if (!target) {
      addSystemMessage(channel, "Usage: /voicekick <member>");
      return true;
    }
    const changed = leaveVoiceLikeChannel(channel, target.id);
    if (!changed) {
      addSystemMessage(channel, "No change applied.");
      return true;
    }
    addVoiceActivity(channel, account.id, "disconnected", displayNameForAccount(target, guild?.id || null));
    addSystemMessage(channel, `Disconnected ${displayNameForAccount(target, guild?.id || null)}.`);
    renderMemberList();
    renderMessages();
    return true;
  }

  if (command === "hand") {
    if (channel.type !== "stage") {
      addSystemMessage(channel, "This command only works in stage channels.");
      return true;
    }
    ensureVoiceStateForChannel(channel);
    if (!channel.voiceState.connectedIds.includes(account.id)) {
      addSystemMessage(channel, "Join the stage first.");
      return true;
    }
    const action = (arg || "toggle").toLowerCase();
    const changed = action === "raise"
      ? setStageRaisedHandState(channel, account.id, true)
      : action === "lower"
        ? setStageRaisedHandState(channel, account.id, false)
        : action === "toggle"
          ? toggleRaisedHandForSelf(channel, account.id)
          : null;
    if (changed === null) {
      addSystemMessage(channel, "Usage: /hand [raise|lower|toggle]");
      return true;
    }
    if (changed && action !== "toggle") addVoiceActivity(channel, account.id, action === "raise" ? "hand_raise" : "hand_lower");
    addSystemMessage(channel, channel.voiceState.raisedHandIds.includes(account.id) ? "Hand raised." : "Hand lowered.");
    renderMemberList();
    renderMessages();
    return true;
  }

  if (command === "speaker") {
    if (channel.type !== "stage") {
      addSystemMessage(channel, "This command only works in stage channels.");
      return true;
    }
    ensureVoiceStateForChannel(channel);
    if (!channel.voiceState.connectedIds.includes(account.id)) {
      addSystemMessage(channel, "Join the stage first.");
      return true;
    }
    const action = (arg || "toggle").toLowerCase();
    const changed = action === "on"
      ? setStageSpeakerState(channel, account.id, true)
      : action === "off"
        ? setStageSpeakerState(channel, account.id, false)
        : action === "toggle"
          ? toggleStageSpeaker(channel, account.id)
          : null;
    if (changed === null) {
      addSystemMessage(channel, "Usage: /speaker [on|off|toggle]");
      return true;
    }
    if (changed && action !== "toggle") addVoiceActivity(channel, account.id, action === "on" ? "speaker_on" : "speaker_off");
    addSystemMessage(channel, channel.voiceState.speakerIds.includes(account.id) ? "You are now a speaker." : "You are now a listener.");
    renderMemberList();
    renderMessages();
    return true;
  }

  if (command === "stagequeue") {
    if (channel.type !== "stage") {
      addSystemMessage(channel, "This command only works in stage channels.");
      return true;
    }
    const guild = getActiveGuild();
    ensureVoiceStateForChannel(channel);
    const queueRows = channel.voiceState.raisedHandIds
      .map((id) => getAccountById(id))
      .filter(Boolean)
      .map((member, idx) => `${idx + 1}. ${displayNameForAccount(member, guild?.id || null)}`);
    addSystemMessage(channel, queueRows.length > 0 ? `Queue:\n${queueRows.join("\n")}` : "No raised hands.");
    return true;
  }

  if (command === "stageclearqueue") {
    if (channel.type !== "stage") {
      addSystemMessage(channel, "This command only works in stage channels.");
      return true;
    }
    if (!canModerateStageChannel(channel)) {
      addSystemMessage(channel, "Stage Moderation permission required.");
      return true;
    }
    ensureVoiceStateForChannel(channel);
    const removed = channel.voiceState.raisedHandIds.length;
    if (removed <= 0) {
      addSystemMessage(channel, "Queue already empty.");
      return true;
    }
    channel.voiceState.raisedHandIds = [];
    addVoiceActivity(channel, account.id, "dismissed", `${removed} queue item(s) cleared`);
    addSystemMessage(channel, `Cleared ${removed} raised hand${removed === 1 ? "" : "s"}.`);
    renderMemberList();
    renderMessages();
    return true;
  }

  if (command === "stageshush") {
    if (channel.type !== "stage") {
      addSystemMessage(channel, "This command only works in stage channels.");
      return true;
    }
    if (!canModerateStageChannel(channel)) {
      addSystemMessage(channel, "Stage Moderation permission required.");
      return true;
    }
    ensureVoiceStateForChannel(channel);
    const listeners = channel.voiceState.connectedIds.filter((id) => !channel.voiceState.speakerIds.includes(id));
    let changed = 0;
    listeners.forEach((id) => {
      if (setVoiceMuteState(channel, id, true)) changed += 1;
    });
    if (changed > 0) addVoiceActivity(channel, account.id, "mute", `${changed} listener(s)`);
    addSystemMessage(channel, changed > 0 ? `Muted ${changed} listener${changed === 1 ? "" : "s"}.` : "No listeners to mute.");
    renderMemberList();
    renderMessages();
    return true;
  }

  if (command === "stageaudience") {
    if (channel.type !== "stage") {
      addSystemMessage(channel, "This command only works in stage channels.");
      return true;
    }
    if (!canModerateStageChannel(channel)) {
      addSystemMessage(channel, "Stage Moderation permission required.");
      return true;
    }
    const guild = getActiveGuild();
    const keep = arg.trim() ? resolveVoiceParticipantByToken(channel, arg, guild) : null;
    ensureVoiceStateForChannel(channel);
    const originalSpeakers = [...channel.voiceState.speakerIds];
    channel.voiceState.speakerIds = keep ? [keep.id] : [];
    const changed = originalSpeakers.length !== channel.voiceState.speakerIds.length
      || originalSpeakers.some((id) => !channel.voiceState.speakerIds.includes(id));
    if (changed) addVoiceActivity(channel, account.id, "demoted", keep ? `${originalSpeakers.length} -> keep ${displayNameForAccount(keep, guild?.id || null)}` : "all speakers demoted");
    addSystemMessage(channel, changed ? (keep ? `Moved all but ${displayNameForAccount(keep, guild?.id || null)} to audience.` : "Moved all speakers to audience.") : "No change applied.");
    renderMemberList();
    renderMessages();
    return true;
  }

  if (command === "stage") {
    if (channel.type !== "stage") {
      addSystemMessage(channel, "This command only works in stage channels.");
      return true;
    }
    if (!canModerateStageChannel(channel)) {
      addSystemMessage(channel, "Stage Moderation permission required.");
      return true;
    }
    const guild = getActiveGuild();
    const [rawAction, ...restToken] = arg.split(" ");
    const action = (rawAction || "").toLowerCase();
    const token = restToken.join(" ").trim();
    if (!action || !token) {
      addSystemMessage(channel, "Usage: /stage <approve|dismiss|mute|unmute|promote|demote|disconnect> <member>");
      return true;
    }
    const target = resolveVoiceParticipantByToken(channel, token, guild);
    if (!target) {
      addSystemMessage(channel, "Member not found (use username/display name or id prefix).");
      return true;
    }
    let changed = false;
    if (action === "approve" || action === "promote") {
      changed = setStageSpeakerState(channel, target.id, true);
      if (changed) addVoiceActivity(channel, account.id, action === "approve" ? "approved" : "promoted", displayNameForAccount(target, guild?.id || null));
    } else if (action === "dismiss") {
      changed = setStageRaisedHandState(channel, target.id, false);
      if (changed) addVoiceActivity(channel, account.id, "dismissed", displayNameForAccount(target, guild?.id || null));
    } else if (action === "mute") {
      changed = setVoiceMuteState(channel, target.id, true);
      if (changed) addVoiceActivity(channel, account.id, "mute", displayNameForAccount(target, guild?.id || null));
    } else if (action === "unmute") {
      changed = setVoiceMuteState(channel, target.id, false);
      if (changed) addVoiceActivity(channel, account.id, "unmute", displayNameForAccount(target, guild?.id || null));
    } else if (action === "demote") {
      changed = setStageSpeakerState(channel, target.id, false);
      if (changed) addVoiceActivity(channel, account.id, "demoted", displayNameForAccount(target, guild?.id || null));
    } else if (action === "disconnect") {
      changed = leaveVoiceLikeChannel(channel, target.id);
      if (changed) addVoiceActivity(channel, account.id, "disconnected", displayNameForAccount(target, guild?.id || null));
    } else {
      addSystemMessage(channel, "Usage: /stage <approve|dismiss|mute|unmute|promote|demote|disconnect> <member>");
      return true;
    }
    addSystemMessage(channel, changed ? `Updated ${displayNameForAccount(target, guild?.id || null)}.` : "No change applied.");
    renderMemberList();
    renderMessages();
    return true;
  }

  if (command === "forumtag") {
    if (channel.type !== "forum") {
      addSystemMessage(channel, "This command only works in forum channels.");
      return true;
    }
    const [sub, ...restTag] = arg.split(" ");
    const action = (sub || "").toLowerCase();
    const payload = restTag.join(" ").trim();
    channel.forumTags = forumTagsForChannel(channel);
    if (!action || action === "list") {
      if (channel.forumTags.length === 0) {
        addSystemMessage(channel, "No forum tags configured.");
      } else {
        addSystemMessage(channel, `Forum tags: ${channel.forumTags.map((tag) => tag.name).join(", ")}`);
      }
      return true;
    }
    if (!canCurrentUser("manageChannels")) {
      addSystemMessage(channel, "Manage Channels permission required.");
      return true;
    }
    if (action === "add") {
      const colorMatch = payload.match(/\s+(#[0-9a-f]{3,8})$/i);
      const color = colorMatch ? colorMatch[1] : "#5865f2";
      const nameRaw = colorMatch ? payload.slice(0, -colorMatch[0].length) : payload;
      const name = sanitizeForumTagName(nameRaw);
      if (!name) {
        addSystemMessage(channel, "Usage: /forumtag add <name> [#color]");
        return true;
      }
      if (resolveForumTagByName(channel, name)) {
        addSystemMessage(channel, `Forum tag already exists: ${name}`);
        return true;
      }
      channel.forumTags.push({ id: createId(), name, color });
      addSystemMessage(channel, `Added forum tag: ${name}`);
      return true;
    }
    if (action === "remove") {
      const name = sanitizeForumTagName(payload);
      if (!name) {
        addSystemMessage(channel, "Usage: /forumtag remove <name>");
        return true;
      }
      const tag = resolveForumTagByName(channel, name);
      if (!tag) {
        addSystemMessage(channel, `Forum tag not found: ${name}`);
        return true;
      }
      channel.forumTags = channel.forumTags.filter((entry) => entry.id !== tag.id);
      channel.messages.forEach((message) => {
        message.forumTagIds = normalizeThreadTagIds(message.forumTagIds, channel.forumTags);
      });
      setForumThreadTagFilter(channel.id, getForumThreadTagFilter(channel.id).filter((id) => id !== tag.id));
      addSystemMessage(channel, `Removed forum tag: ${name}`);
      renderMessages();
      return true;
    }
    addSystemMessage(channel, "Usage: /forumtag <add|remove|list> ...");
    return true;
  }

  if (command === "tagthread") {
    if (channel.type !== "forum") {
      addSystemMessage(channel, "This command only works in forum channels.");
      return true;
    }
    channel.forumTags = forumTagsForChannel(channel);
    const roots = channel.messages.filter((entry) => !entry.forumThreadId);
    const targetRoot = replyTarget?.threadId
      ? roots.find((entry) => entry.id === replyTarget.threadId)
      : roots[roots.length - 1];
    if (!targetRoot) {
      addSystemMessage(channel, "No forum thread found. Create a post first.");
      return true;
    }
    const raw = arg.trim();
    if (!raw) {
      const currentTags = normalizeThreadTagIds(targetRoot.forumTagIds, channel.forumTags)
        .map((id) => channel.forumTags.find((tag) => tag.id === id)?.name)
        .filter(Boolean);
      addSystemMessage(channel, currentTags.length > 0 ? `Thread tags: ${currentTags.join(", ")}` : "Thread has no tags.");
      return true;
    }
    if (raw.toLowerCase() === "clear") {
      targetRoot.forumTagIds = [];
      addSystemMessage(channel, "Cleared thread tags.");
      return true;
    }
    const names = [...new Set(raw.split(",").map((entry) => sanitizeForumTagName(entry)).filter(Boolean))];
    if (names.length === 0) {
      addSystemMessage(channel, "Usage: /tagthread <tag1,tag2...|clear>");
      return true;
    }
    const resolved = names.map((name) => resolveForumTagByName(channel, name)).filter(Boolean);
    if (resolved.length === 0) {
      addSystemMessage(channel, "No matching forum tags. Use /forumtag add first.");
      return true;
    }
    targetRoot.forumTagIds = normalizeThreadTagIds(resolved.map((tag) => tag.id), channel.forumTags);
    addSystemMessage(channel, `Thread tags set: ${resolved.map((tag) => tag.name).join(", ")}`);
    renderMessages();
    return true;
  }

  if (command === "nick") {
    const rawNick = arg.trim();
    const guild = getActiveGuild();
    if (!rawNick) {
      addSystemMessage(channel, "Usage: /nick <nickname|clear>");
      return true;
    }
    if (guild) {
      if (!account.guildProfiles || typeof account.guildProfiles !== "object") account.guildProfiles = {};
      if (rawNick.toLowerCase() === "clear") {
        if (account.guildProfiles[guild.id]) {
          delete account.guildProfiles[guild.id].nickname;
          if (Object.keys(account.guildProfiles[guild.id]).length === 0) delete account.guildProfiles[guild.id];
        }
        addSystemMessage(channel, "Guild nickname cleared.");
      } else {
        const nextNick = rawNick.slice(0, 32);
        account.guildProfiles[guild.id] = { ...(account.guildProfiles[guild.id] || {}), nickname: nextNick };
        addSystemMessage(channel, `Guild nickname changed to ${nextNick}.`);
      }
    } else if (rawNick.toLowerCase() === "clear") {
      account.displayName = account.username || account.displayName;
      addSystemMessage(channel, `Display name reset to ${account.displayName}.`);
    } else {
      account.displayName = rawNick.slice(0, 32);
      addSystemMessage(channel, `Display name changed to ${account.displayName}.`);
    }
    return true;
  }

  if (command === "status") {
    const statusInput = (arg || "").trim();
    const guild = getActiveGuild();
    if (guild) {
      if (!account.guildProfiles || typeof account.guildProfiles !== "object") account.guildProfiles = {};
      const clearRequested = !statusInput || statusInput.toLowerCase() === "clear";
      const scoped = clearRequested ? "" : statusInput.slice(0, 80);
      if (scoped) {
        account.guildProfiles[guild.id] = {
          ...(account.guildProfiles[guild.id] || {}),
          status: scoped,
          statusEmoji: account.customStatusEmoji || ""
        };
        addSystemMessage(channel, `Guild status set to: ${scoped}`);
      } else if (account.guildProfiles[guild.id]) {
        delete account.guildProfiles[guild.id].status;
        delete account.guildProfiles[guild.id].statusEmoji;
        if (Object.keys(account.guildProfiles[guild.id]).length === 0) delete account.guildProfiles[guild.id];
        addSystemMessage(channel, "Guild status cleared.");
      }
    } else {
      account.customStatus = (!statusInput || statusInput.toLowerCase() === "clear") ? "" : statusInput.slice(0, 80);
      addSystemMessage(channel, account.customStatus ? `Status set to: ${account.customStatus}` : "Status cleared.");
    }
    return true;
  }

  if (["online", "idle", "dnd", "invisible", "away"].includes(command)) {
    const nextPresence = command === "away" ? "idle" : command;
    setCurrentAccountPresence(nextPresence, { persist: true, rerender: true, announceXmpp: true });
    addSystemMessage(channel, `Presence changed to ${presenceLabel(nextPresence)}.`);
    return true;
  }

  if (command === "presence") {
    const token = (arg || "").trim().toLowerCase();
    const next = normalizePresence(token);
    if (!token || token === "status") {
      addSystemMessage(channel, `Presence: ${presenceLabel(account.presence || "online")}.`);
      return true;
    }
    if (!["online", "idle", "dnd", "invisible"].includes(token)) {
      addSystemMessage(channel, "Usage: /presence <online|idle|dnd|invisible|status>");
      return true;
    }
    setCurrentAccountPresence(next, { persist: true, rerender: true, announceXmpp: true });
    addSystemMessage(channel, `Presence changed to ${presenceLabel(next)}.`);
    return true;
  }

  if (command === "quests") {
    addSystemMessage(channel, formatQuestSummaryText(account.id));
    return true;
  }

  if (command === "questprogress") {
    addSystemMessage(channel, formatQuestSummaryText(account.id));
    return true;
  }

  if (command === "questbadges") {
    const badges = resolveQuestBadgesForAccount(account.id);
    addSystemMessage(channel, badges.length > 0 ? `Badges: ${badges.join(", ")}` : "No badges unlocked yet.");
    return true;
  }

  if (command === "profilefx") {
    const nextEffect = normalizeProfileEffect(arg);
    if (!arg) {
      addSystemMessage(channel, `Current profile effect: ${accountProfileEffect(account)}`);
      return true;
    }
    if (!["none", "aurora", "flame", "ocean"].includes(arg.toLowerCase())) {
      addSystemMessage(channel, "Usage: /profilefx <none|aurora|flame|ocean>");
      return true;
    }
    account.profileEffect = nextEffect;
    addSystemMessage(channel, `Profile effect set to: ${nextEffect}`);
    return true;
  }

  if (command === "guildtag") {
    const rawTag = arg.trim();
    if (!rawTag) {
      addSystemMessage(channel, `Current guild tag: ${accountGuildTag(account) || "(none)"}`);
      return true;
    }
    if (rawTag.toLowerCase() === "clear") {
      account.guildTag = "";
      account.guildTagGuildId = "";
      addSystemMessage(channel, "Guild tag cleared.");
      return true;
    }
    account.guildTag = rawTag.slice(0, 8).toUpperCase();
    const activeGuild = getActiveGuild();
    account.guildTagGuildId = activeGuild && activeGuild.memberIds.includes(account.id) ? activeGuild.id : "";
    addSystemMessage(channel, `Guild tag set to: ${account.guildTag}`);
    return true;
  }

  if (command === "decor") {
    const rawDecor = arg.trim();
    if (!rawDecor) {
      addSystemMessage(channel, `Current avatar decoration: ${accountDecorationEmoji(account) || "(none)"}`);
      return true;
    }
    if (rawDecor.toLowerCase() === "clear") {
      account.avatarDecoration = "";
      addSystemMessage(channel, "Avatar decoration cleared.");
      return true;
    }
    account.avatarDecoration = rawDecor.slice(0, 4);
    addSystemMessage(channel, `Avatar decoration set to: ${account.avatarDecoration}`);
    return true;
  }

  if (command === "nameplate") {
    const rawNameplate = arg.trim();
    if (!rawNameplate) {
      addSystemMessage(channel, `Current nameplate: ${accountNameplateSvg(account) || "(none)"}`);
      return true;
    }
    if (rawNameplate.toLowerCase() === "clear") {
      account.profileNameplateSvg = "";
      addSystemMessage(channel, "Nameplate cleared.");
      return true;
    }
    if (!/^https?:\/\//i.test(rawNameplate) && !/^data:image\/svg\+xml/i.test(rawNameplate)) {
      addSystemMessage(channel, "Usage: /nameplate <https://...|data:image/svg+xml...|clear>");
      return true;
    }
    account.profileNameplateSvg = rawNameplate.slice(0, 280);
    addSystemMessage(channel, "Nameplate updated.");
    return true;
  }

  if (command === "whoami") {
    const guildId = getActiveConversation()?.type === "channel" ? getActiveGuild()?.id || null : null;
    addSystemMessage(channel, formatIdentitySummaryText(account, guildId));
    return true;
  }

  if (command === "whois") {
    const query = (arg || "").trim();
    if (!query) {
      addSystemMessage(channel, "Usage: /whois <username-or-jid>");
      return true;
    }
    const target = resolveAccountByIdentityToken(query, { includeSelf: true });
    if (!target) {
      addSystemMessage(channel, "No matching account found.");
      return true;
    }
    const guildId = getActiveConversation()?.type === "channel" ? getActiveGuild()?.id || null : null;
    addSystemMessage(channel, formatIdentitySummaryText(target, guildId));
    return true;
  }

  if (command === "profilecard") {
    const guildId = getActiveConversation()?.type === "channel" ? getActiveGuild()?.id || null : null;
    channel.messages.push({
      id: createId(),
      userId: account.id,
      authorName: "",
      text: `🪪 ${formatIdentitySummaryText(account, guildId)}`,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }

  if (command === "shop") {
    openCosmeticsDialog(arg);
    return true;
  }

  if (command === "inventory") {
    addSystemMessage(channel, formatCosmeticInventorySummary(account.id));
    return true;
  }

  if (command === "mediaprivacy") {
    const mode = arg.toLowerCase();
    state.preferences = getPreferences();
    if (!mode || mode === "status") {
      addSystemMessage(channel, `Media privacy mode: ${state.preferences.mediaPrivacyMode === "off" ? "off" : "safe"}`);
      return true;
    }
    if (mode === "safe" || mode === "off") {
      state.preferences.mediaPrivacyMode = mode;
      saveState();
      addSystemMessage(channel, `Media privacy mode set to: ${mode}`);
      renderMessages();
      return true;
    }
    addSystemMessage(channel, "Usage: /mediaprivacy [status|safe|off]");
    return true;
  }

  if (command === "relay") {
    const [subRaw, ...restRelay] = arg.split(" ");
    const sub = (subRaw || "status").toLowerCase();
    const payload = restRelay.join(" ").trim();
    state.preferences = getPreferences();
    if (sub === "status") {
      const prefs = getPreferences();
      const adapter = getTransportAdapter(prefs.relayMode);
      addSystemMessage(channel, [
        `Mode: ${prefs.relayMode}`,
        `Adapter: ${adapter.label}`,
        `Status: ${relayStatusText()}`,
        `URL: ${prefs.relayMode === "xmpp" ? (resolveXmppServiceUrl(prefs) || "(unset)") : prefs.relayUrl}`,
        prefs.relayMode === "xmpp" ? `MUC: ${resolveXmppMucService(prefs) || "(unset)"}` : "",
        `Auto-connect: ${prefs.relayAutoConnect}`,
        `Room: ${prefs.relayRoom || relayRoomForActiveConversation()}`
      ].join(" · "));
      return true;
    }
    if (sub === "connect") {
      if (/^xmpp$/i.test(payload)) state.preferences.relayMode = "xmpp";
      else state.preferences.relayMode = payload.toLowerCase().startsWith("http") ? "http" : "ws";
      if (payload) state.preferences.relayUrl = normalizeRelayUrl(payload);
      saveState();
      const ok = connectRelaySocket({ force: true });
      addSystemMessage(channel, ok ? "Relay connect requested." : "Relay connection failed to start.");
      return true;
    }
    if (sub === "reconnect") {
      disconnectRelaySocket({ manual: false });
      const ok = connectRelaySocket({ force: true });
      addSystemMessage(channel, ok ? "Relay reconnect requested." : "Relay reconnect failed to start.");
      return true;
    }
    if (sub === "disconnect") {
      disconnectRelaySocket({ manual: true });
      addSystemMessage(channel, "Relay disconnected.");
      return true;
    }
    if (sub === "mode") {
      const mode = normalizeRelayMode(payload);
      state.preferences.relayMode = mode;
      saveState();
      if (mode === "ws" || mode === "http" || mode === "xmpp") connectRelaySocket({ force: true });
      else disconnectRelaySocket({ manual: true });
      addSystemMessage(channel, `Relay mode set to: ${mode}`);
      return true;
    }
    if (sub === "url") {
      if (!payload) {
        addSystemMessage(channel, `Relay URL: ${state.preferences.relayUrl}`);
        return true;
      }
      state.preferences.relayUrl = normalizeRelayUrl(payload);
      saveState();
      addSystemMessage(channel, `Relay URL set to: ${state.preferences.relayUrl}`);
      return true;
    }
    if (sub === "room") {
      if (!payload || payload.toLowerCase() === "clear") {
        state.preferences.relayRoom = "";
        saveState();
        syncRelayRoomForActiveConversation();
        addSystemMessage(channel, "Relay room override cleared.");
        return true;
      }
      state.preferences.relayRoom = normalizeRelayRoom(payload);
      saveState();
      syncRelayRoomForActiveConversation();
      addSystemMessage(channel, `Relay room set to: ${state.preferences.relayRoom}`);
      return true;
    }
    if (sub === "roomsync") {
      syncRelayRoomForActiveConversation();
      addSystemMessage(channel, `Relay room synced: ${relayRoomForActiveConversation()}`);
      return true;
    }
    if (sub === "local") {
      const diag = typeof localRelayDiagnostics === "function" ? localRelayDiagnostics() : null;
      if (!diag) {
        addSystemMessage(channel, "Local relay diagnostics unavailable.");
        return true;
      }
      const supported = diag.supported ? "yes" : "no";
      const open = diag.channelOpen ? "open" : "closed";
      addSystemMessage(channel, `Local relay: supported ${supported}, channel ${open}, mode ${diag.mode}, status ${diag.status}, client ${diag.clientId}`);
      return true;
    }
    if (sub === "diag") {
      const shouldReset = payload.toLowerCase() === "reset";
      if (shouldReset && typeof resetLocalRelayDiagnostics === "function") {
        resetLocalRelayDiagnostics();
      }
      const diag = typeof localRelayDiagnostics === "function" ? localRelayDiagnostics() : null;
      if (!diag) {
        addSystemMessage(channel, "Relay diagnostics unavailable.");
        return true;
      }
      const webxdcState = diag.webxdcRealtimeSupported
        ? (diag.webxdcChannelOpen ? "open" : (diag.webxdcJoinPending ? "pending" : "closed"))
        : "unsupported";
      const errorText = (diag.webxdcLastError || "").trim() ? `, error ${diag.webxdcLastError}` : "";
      addSystemMessage(
        channel,
        `Relay diag: local supported ${diag.supported ? "yes" : "no"}, channel ${diag.channelOpen ? "open" : "closed"}, webxdc ${webxdcState}, joins ${diag.webxdcJoinAttempts}/${diag.webxdcJoinFailures}fail, packets tx ${diag.webxdcPacketsSent} rx ${diag.webxdcPacketsReceived}${errorText}`
      );
      if (diag.webxdcLastErrorAt) {
        addSystemMessage(channel, `Relay diag: last webxdc error at ${diag.webxdcLastErrorAt}`);
      }
      return true;
    }
    if (sub === "autoconnect") {
      const value = payload.toLowerCase();
      if (!value || value === "status") {
        addSystemMessage(channel, `Relay auto-connect: ${state.preferences.relayAutoConnect}`);
        return true;
      }
      if (!["on", "off"].includes(value)) {
        addSystemMessage(channel, "Usage: /relay autoconnect <on|off|status>");
        return true;
      }
      state.preferences.relayAutoConnect = value;
      saveState();
      if (value === "on" && ["local", "ws", "http", "xmpp"].includes(state.preferences.relayMode)) {
        connectRelaySocket({ force: true });
      } else if (value === "off") {
        clearRelayReconnectTimer();
      }
      addSystemMessage(channel, `Relay auto-connect set to: ${value}`);
      return true;
    }
    if (sub === "ping") {
      const prefs = getPreferences();
      if (prefs.relayMode === "xmpp") {
        if (!xmppConnection || relayStatus !== "connected") {
          addSystemMessage(channel, "XMPP relay is not connected.");
          return true;
        }
        const sent = sendXmppPing(xmppConnection);
        addSystemMessage(channel, sent ? "Sent XMPP ping request." : "Could not send XMPP ping request.");
        return true;
      }
      if (!["ws", "http"].includes(prefs.relayMode)) {
        addSystemMessage(channel, "Relay ping is available only for ws/http/xmpp modes.");
        return true;
      }
      const startedAt = Date.now();
      const healthUrl = relayHealthUrlFromRelayUrl(prefs.relayUrl);
      if (!healthUrl) {
        addSystemMessage(channel, "Relay URL is invalid.");
        return true;
      }
      fetch(healthUrl, { cache: "no-store" })
        .then(async (response) => {
          const elapsed = Date.now() - startedAt;
          let body = "";
          try {
            body = (await response.text()).replace(/\s+/g, " ").trim().slice(0, 200);
          } catch {
            body = "";
          }
          const prefix = response.ok ? "Relay ping ok" : "Relay ping failed";
          addSystemMessage(
            channel,
            `${prefix} (${elapsed}ms) · HTTP ${response.status}${body ? ` · ${body}` : ""}`
          );
        })
        .catch((error) => {
          addSystemMessage(channel, `Relay ping failed: ${String(error?.message || error)}`);
        });
      return true;
    }
    addSystemMessage(
      channel,
      "Usage: /relay [status|connect|disconnect|reconnect|mode <local|http|ws|xmpp|off>|url <http://...|ws://...>|room <name|clear>|roomsync|local|diag [reset]|autoconnect <on|off|status>|ping]"
    );
    return true;
  }


    return false;
  }

  globalScope.SHITCORD67_XEP_XMPP_COMMAND_RUNTIME = Object.freeze({
    handleXmppCommandRuntime
  });

  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-xmpp-command-runtime", globalScope.SHITCORD67_XEP_XMPP_COMMAND_RUNTIME);
  }
})(typeof window !== "undefined" ? window : globalThis);
