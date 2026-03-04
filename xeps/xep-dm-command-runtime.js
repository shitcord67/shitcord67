(function initXepDmCommandRuntime(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_DM_COMMAND_RUNTIME) return;

  function handleDmSlashCommandRuntime({ text = "", conversation = null, account = null } = {}) {
    if (!conversation || conversation.type !== "dm" || !text.startsWith("/")) return false;

    const [rawCommand, ...rawRest] = text.slice(1).split(" ");
    const dmCommand = rawCommand.toLowerCase();
    const dmArg = rawRest.join(" ").trim();

    const execute = () => {
    if ([
      "serverinfo",
      "serverroles",
      "members",
      "membercount",
      "channels",
      "channeltypes",
      "mentions",
      "nextmention",
      "prevmention",
      "markmentionsread",
      "copyguildid",
      "copyguildname",
      "copychannelname"
    ].includes(dmCommand)) {
      showToast("This command only works in guild channels.", { tone: "error" });
      return;
    }
    if (dmCommand === "closedm") {
      const closingId = state.activeDmId;
      if (closingId) {
        state.dmThreads = state.dmThreads.filter((entry) => entry.id !== closingId);
        state.activeDmId = null;
        ui.messageInput.value = "";
        resizeComposerInput();
        saveState();
        render();
      }
      return;
    }
    if (dmCommand === "newdm") {
      const rawIdentity = (dmArg || "").toString().trim();
      if (!rawIdentity) {
        showToast("Usage: /newdm <username-or-jid>", { tone: "error" });
        return;
      }
      const target = openDmByIdentity(rawIdentity);
      if (!target) {
        showToast("Could not open DM (check username/JID).", { tone: "error" });
        return;
      }
      ui.messageInput.value = "";
      resizeComposerInput();
      return;
    }
    if (dmCommand === "markdmread") {
      if (!markDmRead(conversation.thread, account.id)) return;
      saveState();
      render();
      return;
    }
    if (dmCommand === "markallread") {
      if (!markAllReadForAccount(account.id)) return;
      saveState();
      render();
      return;
    }
    if (dmCommand === "markdmmentionsread") {
      let changed = 0;
      state.dmThreads.forEach((thread) => {
        if (!Array.isArray(thread.participantIds) || !thread.participantIds.includes(account.id)) return;
        const stats = getDmUnreadStats(thread, account);
        if (stats.mentions <= 0) return;
        if (markDmRead(thread, account.id)) changed += 1;
      });
      if (changed <= 0) {
        showToast("No DM threads with unread mentions.", { tone: "error" });
        return;
      }
      saveState();
      render();
      showToast(`Marked ${changed} DM thread${changed === 1 ? "" : "s"} with mentions as read.`);
      return;
    }
    if (dmCommand === "listdms") {
      const threads = getSortedDmThreadsForAccount(account);
      if (threads.length === 0) {
        showToast("No DM threads yet.", { tone: "error" });
        return;
      }
      const labels = threads
        .slice(0, 5)
        .map((thread) => {
          const peer = dmPeerAccountForThread(thread, account.id);
          return peer ? dmPrimaryLabelForAccount(peer) : "(unknown DM)";
        })
        .join(", ");
      showToast(`DMs (${threads.length}): ${labels}${threads.length > 5 ? " ..." : ""}`);
      return;
    }
    if (dmCommand === "dmnext") {
      if (!cycleActiveDmThread(1)) showToast("No other DM threads.", { tone: "error" });
      return;
    }
    if (dmCommand === "dmprev") {
      if (!cycleActiveDmThread(-1)) showToast("No other DM threads.", { tone: "error" });
      return;
    }
    if (dmCommand === "copyid") {
      void copyText(conversation.thread.id).then((ok) => {
        showToast(ok ? "DM ID copied." : "Failed to copy DM ID.", { tone: ok ? "info" : "error" });
      });
      return;
    }
    if (dmCommand === "copylink") {
      const link = `${window.location.href.split("#")[0]}#msg=${conversation.thread.id}:`;
      void copyText(link).then((ok) => {
        showToast(ok ? "DM link copied." : "Failed to copy DM link.", { tone: ok ? "info" : "error" });
      });
      return;
    }
    if (dmCommand === "copyaccountid") {
      void copyText(account.id || "").then((ok) => {
        showToast(ok ? "Account ID copied." : "Failed to copy account ID.", { tone: ok ? "info" : "error" });
      });
      return;
    }
    if (dmCommand === "copyjid") {
      const jid = accountBareXmppJid(account);
      if (!jid) {
        showToast("No XMPP JID set for this account.", { tone: "error" });
        return;
      }
      void copyText(jid).then((ok) => {
        showToast(ok ? "XMPP JID copied." : "Failed to copy XMPP JID.", { tone: ok ? "info" : "error" });
      });
      return;
    }
    if (dmCommand === "copypresence") {
      const presence = normalizePresence(account.presence || "online");
      void copyText(presence).then((ok) => {
        showToast(ok ? "Presence copied." : "Failed to copy presence.", { tone: ok ? "info" : "error" });
      });
      return;
    }
    if (dmCommand === "copydisplayname") {
      const display = displayNameForAccount(account, null);
      void copyText(display).then((ok) => {
        showToast(ok ? "Display name copied." : "Failed to copy display name.", { tone: ok ? "info" : "error" });
      });
      return;
    }
    if (dmCommand === "copyref") {
      const ref = activeConversationReferenceText();
      if (!ref) {
        showToast("No active DM reference to copy.", { tone: "error" });
        return;
      }
      void copyText(ref).then((ok) => {
        showToast(ok ? "Conversation reference copied." : "Failed to copy conversation reference.", { tone: ok ? "info" : "error" });
      });
      return;
    }
    if (dmCommand === "copyroom") {
      const room = relayRoomForActiveConversation();
      if (!room) {
        showToast("No relay room token available.", { tone: "error" });
        return;
      }
      void copyText(room).then((ok) => {
        showToast(ok ? "Relay room token copied." : "Failed to copy relay room token.", { tone: ok ? "info" : "error" });
      });
      return;
    }
    if (dmCommand === "call" || dmCommand === "callscreen" || dmCommand === "callweb") {
      const raw = (dmArg || "").trim();
      const parts = raw ? raw.split(/\s+/) : [];
      const first = (parts[0] || "").toLowerCase();
      const explicitAction = ["join", "start", "screen", "screenshare", "share", "link", "copy"].includes(first) ? first : "";
      const action = dmCommand === "callscreen" ? "screen" : (explicitAction || "join");
      const roomOverride = dmCommand === "callscreen"
        ? raw
        : (explicitAction ? parts.slice(1).join(" ") : raw);
      if (action === "link" || action === "copy") {
        const url = conversationCallUrl(conversation, { roomOverride });
        if (!url) {
          showToast("Could not resolve call room URL.", { tone: "error" });
          return;
        }
        if (action === "copy") {
          void copyText(url).then((ok) => showToast(ok ? "Call link copied." : "Failed to copy call link.", { tone: ok ? "info" : "error" }));
        } else {
          showToast(url, { duration: 2600 });
        }
        return;
      }
      launchConversationCall({
        screenShare: ["screen", "screenshare", "share"].includes(action),
        roomOverride,
        autoPost: true,
        allowNative: dmCommand !== "callweb"
      });
      return;
    }
    if (dmCommand === "callxmpp") {
      const raw = (dmArg || "").trim();
      const [subRaw, tokenRaw] = raw.split(/\s+/, 2);
      const sub = (subRaw || "").toLowerCase();
      const token = (tokenRaw || "").trim().toLowerCase();
      if (sub === "status") {
        xmppAssessConversationCallInterop(conversation, { force: true }).then((interop) => {
          const snapshots = xmppCallDebugSnapshotForConversation(conversation, getCurrentAccount());
          const snapshotText = snapshots.length > 0
            ? ` · ${xmppFormatCallSnapshotLine(snapshots[0])}${snapshots.length > 1 ? " …" : ""}`
            : "";
          if (interop.ready) {
            showToast(`XMPP call interop ready (${interop.chosenTarget || "target"}).${snapshotText}`);
            return;
          }
          const first = interop.details[0]?.evalResult || {};
          const missing = [
            first.hasCore ? "" : "jingle",
            first.hasMedia ? "" : "rtp-media",
            first.hasTransport ? "" : "ice-udp",
            first.hasInvite ? "" : "invite"
          ].filter(Boolean);
          showToast(`XMPP call interop not ready${missing.length > 0 ? ` (${missing.join(", ")})` : ""}.${snapshotText}`, { tone: "error", duration: 3000 });
        }).catch(() => {
          showToast("XMPP call interop check failed.", { tone: "error" });
        });
        return;
      }
      if (sub === "accept" || sub === "reject" || sub === "cancel" || sub === "ring" || sub === "transport" || sub === "end") {
        const peerBare = xmppPeerJidForConversation(conversation, getCurrentAccount());
        if (!peerBare) {
          showToast("XMPP call controls currently work in DMs.", { tone: "error" });
          return;
        }
        const targetId = token
          ? ([...xmppCallSessionById.keys()].find((id) => id.toLowerCase().startsWith(token)) || "")
          : latestXmppCallSessionIdForPeer(peerBare, (sub === "cancel" || sub === "end") ? "outgoing" : "incoming");
        if (!targetId) {
          showToast("No matching XMPP call session.", { tone: "error" });
          return;
        }
        const session = xmppCallSessionById.get(targetId) || null;
        const peerTarget = xmppResolveSessionPeerJid(session, peerBare, { preferFull: true }) || peerBare;
        if (xmppSessionIsMujiCallInvite(session)) {
          if (sub === "ring" || sub === "transport") {
            showToast("Muji room invites do not use /callxmpp ring or /callxmpp transport.", { tone: "error" });
            return;
          }
          if (sub === "accept") {
            void acceptIncomingXmppCall(targetId).then((ok) => {
              showToast(ok
                ? `Accepted Muji room call invite (${targetId.slice(0, 8)}).`
                : "Failed to accept Muji room call invite.", { tone: ok ? "info" : "error" });
            });
            return;
          }
          const sentMuji = declineIncomingXmppCall(targetId);
          showToast(sentMuji
            ? `Sent Muji ${sub === "end" ? "leave" : "reject"} (${targetId.slice(0, 8)}).`
            : "Failed to send Muji call action.", { tone: sentMuji ? "info" : "error" });
          return;
        }
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
              showToast("Failed to send XMPP call action.", { tone: "error" });
              return;
            }
            showToast(`Sent XMPP session-accept (${targetId.slice(0, 8)}).`);
            if (addSystemDmMessageByPeerJid(peerBare, `Sent XMPP session-accept (${targetId.slice(0, 8)}).`)) {
              refreshDmUiForPeerJid(peerBare);
            }
            openNativeXmppCallSurface(targetId);
          })();
          return;
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
          showToast("Failed to send XMPP call action.", { tone: "error" });
          return;
        }
        const sentLabel = sub === "accept" && isJinglePhase
          ? "session-accept"
          : (sub === "end"
            ? "session-terminate"
            : (sub === "ring"
              ? (isJinglePhase ? "session-info/ringing" : "ringing")
              : (sub === "transport" ? "transport-info (queued)" : action)));
        showToast(`Sent XMPP ${sentLabel} (${targetId.slice(0, 8)}).`);
        if (addSystemDmMessageByPeerJid(peerBare, `Sent XMPP ${sentLabel} (${targetId.slice(0, 8)}).`)) {
          refreshDmUiForPeerJid(peerBare);
        }
        if (sub === "accept") {
          if (isJinglePhase) {
            openNativeXmppCallSurface(targetId);
          } else {
            launchConversationCall({ screenShare: false, autoPost: true });
          }
        }
        if (["reject", "cancel", "end"].includes(sub) || (sub === "accept" && !isJinglePhase)) {
          forgetXmppCallSession(targetId);
        }
        return;
      }
      const lowerRaw = raw.toLowerCase();
      const screenShare = lowerRaw === "screen" || lowerRaw === "screenshare" || lowerRaw === "share";
      launchNativeXmppConversationCall({ screenShare });
      return;
    }
    if (dmCommand === "whiteboard") {
      const raw = (dmArg || "").trim();
      const parts = raw ? raw.split(/\s+/) : [];
      const first = (parts[0] || "").toLowerCase();
      const explicitAction = ["open", "join", "copy", "link", "post", "fallback"].includes(first) ? first : "";
      const action = explicitAction || "open";
      const roomOverride = explicitAction ? parts.slice(1).join(" ") : raw;
      if (action === "copy" || action === "link") {
        const url = conversationWhiteboardUrl(conversation, roomOverride);
        if (!url) {
          showToast("Could not resolve whiteboard room URL.", { tone: "error" });
          return;
        }
        if (action === "copy") {
          void copyText(url).then((ok) => showToast(ok ? "Whiteboard link copied." : "Failed to copy whiteboard link.", { tone: ok ? "info" : "error" }));
        } else {
          showToast(url, { duration: 2600 });
        }
        return;
      }
      const wantsPost = action === "post" || action === "fallback";
      launchConversationWhiteboard({ roomOverride, autoPost: wantsPost });
      return;
    }
    if (dmCommand === "joinxmpp" || dmCommand === "joinmuc") {
      const result = handleJoinXmppCommand(dmArg, account, { focus: true });
      showToast(result.message, { tone: result.ok ? "info" : "error", duration: result.ok ? 2200 : 3200 });
      return;
    }
    if (dmCommand === "leavexmpp" || dmCommand === "leavemuc") {
      const result = handleLeaveXmppCommand(dmArg, account);
      showToast(result.message, { tone: result.ok ? "info" : "error", duration: result.ok ? 2200 : 3200 });
      if (result.ok) {
        renderServers();
        renderChannels();
      }
      return;
    }
    if (dmCommand === "invitexmpp" || dmCommand === "invitemuc") {
      const peerBare = xmppBareJid(xmppPeerJidForDmThread(conversation.thread, account));
      if (!peerBare) {
        showToast("Active DM is not XMPP-backed.", { tone: "error" });
        return;
      }
      const inviteArgs = parseXmppDirectMucInviteCommandArg(dmArg);
      if (!inviteArgs.roomJid) {
        showToast("Usage: /invitexmpp <room@conference.example.org> [| reason [| password [| continue [| thread-id]]]]", { tone: "error" });
        return;
      }
      const sent = xmppSendDirectMucInvite(peerBare, inviteArgs.roomJid, {
        reason: inviteArgs.reason,
        password: inviteArgs.password,
        thread: inviteArgs.thread || (conversation.thread?.id || "").toString().trim().slice(0, 120),
        continueThread: Boolean(inviteArgs.continueThread),
        preferFull: true
      });
      if (!sent.ok) {
        const reason = sent.reason === "xmpp-offline"
          ? "XMPP relay is not connected."
          : (sent.reason === "invalid-room"
            ? "Invalid XMPP room JID."
            : "Could not send XMPP room invite.");
        showToast(reason, { tone: "error" });
        return;
      }
      if (addSystemDmMessageByPeerJid(peerBare, `Sent XMPP room invite: ${inviteArgs.roomJid}${inviteArgs.reason ? ` (${inviteArgs.reason})` : ""}.`)) {
        refreshDmUiForPeerJid(peerBare);
      }
      showToast("XMPP room invite sent.");
      return;
    }
    if (dmCommand === "spacesxmpp" || dmCommand === "xmppspaces") {
      const raw = (dmArg || "").trim();
      const [subRaw, ...restParts] = raw.split(/\s+/).filter(Boolean);
      const sub = (subRaw || "list").toLowerCase();
      const dmConversation = { type: "dm", id: conversation.thread?.id || "", thread: conversation.thread };
      if (sub === "join") {
        const result = handleJoinXmppCommand(restParts.join(" "), account, { focus: true });
        if (addSystemMessageToConversation(dmConversation, result.message)) {
          refreshConversationUi(dmConversation);
        }
        showToast(result.message, { tone: result.ok ? "info" : "error", duration: result.ok ? 2200 : 3200 });
        return;
      }
      if (sub === "leave") {
        const result = handleLeaveXmppCommand(restParts.join(" "), account);
        if (addSystemMessageToConversation(dmConversation, result.message)) {
          refreshConversationUi(dmConversation);
        }
        showToast(result.message, { tone: result.ok ? "info" : "error", duration: result.ok ? 2200 : 3200 });
        if (result.ok) {
          renderServers();
          renderChannels();
        }
        return;
      }
      if (sub === "open") {
        const opened = focusXmppSpacesGuild(account, getPreferences());
        showToast(opened ? "Opened XMPP Spaces." : "Could not open XMPP Spaces.", { tone: opened ? "info" : "error" });
        return;
      }
      if (sub === "sync" || sub === "discover") {
        showToast(`Syncing XMPP Spaces (${sub === "discover" ? "forced discovery" : "cached discovery"})...`, { duration: 2400 });
        void syncXmppSpacesNow({
          account,
          prefs: getPreferences(),
          forceDiscovery: sub === "discover"
        }).then((result) => {
          showToast(result.message, { tone: result.ok ? "info" : "error", duration: result.ok ? 3200 : 3600 });
          if (addSystemMessageToConversation(dmConversation, result.message)) {
            refreshConversationUi(dmConversation);
          }
          if (result.ok) {
            renderServers();
            renderChannels();
          }
        }).catch(() => {
          showToast("Failed to sync XMPP Spaces.", { tone: "error" });
        });
        return;
      }
      if (sub === "list" || sub === "status") {
        const lines = xmppSpacesSummaryLines({ limit: 20, prefs: getPreferences() });
        const summaryText = lines.length > 0
          ? `XMPP Spaces rooms:\n${lines.join("\n")}`
          : "No XMPP Spaces rooms mapped yet. Use /spacesxmpp sync or /joinxmpp <room@conference.domain>.";
        if (addSystemMessageToConversation(dmConversation, summaryText)) {
          refreshConversationUi(dmConversation);
        }
        showToast(lines.length > 0 ? `XMPP Spaces: ${lines.length} room(s).` : "No XMPP Spaces rooms mapped.", {
          tone: lines.length > 0 ? "info" : "error",
          duration: 2600
        });
        return;
      }
      showToast("Usage: /spacesxmpp [list|open|sync|discover|join <room@conference.domain>|leave [room@conference.domain]]", {
        tone: "error",
        duration: 3200
      });
      return;
    }
    if (dmCommand === "focus") {
      if (!dmArg || dmArg.toLowerCase() === "search") {
        ui.dmSearchInput?.focus();
        ui.dmSearchInput?.select?.();
      } else {
        ui.messageInput.focus();
      }
      return;
    }
    if (dmCommand === "devtools") {
      if (!requestDevtoolsToggle()) {
        showToast("DevTools toggle is only available in the Electron app.", { tone: "error" });
      }
      return;
    }
    if (dmCommand === "xmppconsole" || dmCommand === "xmppinspect") {
      const scoped = applyXmppConsoleScopeArg(dmArg, { type: "dm", thread: conversation.thread }, getCurrentAccount());
      openXmppConsoleDialog();
      showToast(scoped.message, { tone: scoped.ok ? "info" : "error" });
      return;
    }
    if (dmCommand === "relay") {
      state.preferences = getPreferences();
      const [subRaw, ...restRelay] = dmArg.split(" ");
      const sub = (subRaw || "status").toLowerCase();
      const payload = restRelay.join(" ").trim();
      if (sub === "status") {
        const adapter = getTransportAdapter(state.preferences.relayMode);
        const relayUrl = state.preferences.relayMode === "xmpp"
          ? (resolveXmppServiceUrl(state.preferences) || "(unset)")
          : state.preferences.relayUrl;
        showToast(
          `Relay: ${relayStatusText()} · ${state.preferences.relayMode}/${adapter.label} · ${relayUrl} · auto:${state.preferences.relayAutoConnect}`
        );
        return;
      }
      if (sub === "connect") {
        if (/^xmpp$/i.test(payload)) state.preferences.relayMode = "xmpp";
        else state.preferences.relayMode = payload.toLowerCase().startsWith("http") ? "http" : "ws";
        if (payload) state.preferences.relayUrl = normalizeRelayUrl(payload);
        saveState();
        connectRelaySocket({ force: true });
        showToast("Relay connect requested.");
        return;
      }
      if (sub === "reconnect") {
        disconnectRelaySocket({ manual: false });
        connectRelaySocket({ force: true });
        showToast("Relay reconnect requested.");
        return;
      }
      if (sub === "disconnect") {
        disconnectRelaySocket({ manual: true });
        showToast("Relay disconnected.");
        return;
      }
      if (sub === "mode") {
        state.preferences.relayMode = normalizeRelayMode(payload);
        saveState();
        if (["local", "ws", "http", "xmpp"].includes(state.preferences.relayMode)) connectRelaySocket({ force: true });
        else disconnectRelaySocket({ manual: true });
        showToast(`Relay mode: ${state.preferences.relayMode}`);
        return;
      }
      if (sub === "url") {
        if (!payload) {
          showToast(`Relay URL: ${state.preferences.relayUrl}`);
          return;
        }
        state.preferences.relayUrl = normalizeRelayUrl(payload);
        saveState();
        showToast(`Relay URL set: ${state.preferences.relayUrl}`);
        return;
      }
      if (sub === "room") {
        state.preferences.relayRoom = !payload || payload.toLowerCase() === "clear" ? "" : normalizeRelayRoom(payload);
        saveState();
        syncRelayRoomForActiveConversation();
        showToast(state.preferences.relayRoom ? `Relay room: ${state.preferences.relayRoom}` : "Relay room override cleared.");
        return;
      }
      if (sub === "roomsync") {
        syncRelayRoomForActiveConversation();
        showToast(`Relay room synced: ${relayRoomForActiveConversation()}`);
        return;
      }
      if (sub === "local") {
        const diag = typeof localRelayDiagnostics === "function" ? localRelayDiagnostics() : null;
        if (!diag) {
          showToast("Local relay diagnostics unavailable.", { tone: "error" });
          return;
        }
        const supported = diag.supported ? "yes" : "no";
        const open = diag.channelOpen ? "open" : "closed";
        showToast(`Local relay: supported ${supported}, channel ${open}, mode ${diag.mode}, status ${diag.status}, client ${diag.clientId}`);
        return;
      }
      if (sub === "autoconnect") {
        const value = payload.toLowerCase();
        if (!value || value === "status") {
          showToast(`Relay auto-connect: ${state.preferences.relayAutoConnect}`);
          return;
        }
        if (!["on", "off"].includes(value)) {
          showToast("Usage: /relay autoconnect <on|off|status>", { tone: "error" });
          return;
        }
        state.preferences.relayAutoConnect = value;
        saveState();
        if (value === "on" && ["local", "ws", "http", "xmpp"].includes(state.preferences.relayMode)) {
          connectRelaySocket({ force: true });
        } else if (value === "off") {
          clearRelayReconnectTimer();
        }
        showToast(`Relay auto-connect set to: ${value}`);
        return;
      }
      if (sub === "ping") {
        const prefs = getPreferences();
        if (prefs.relayMode === "xmpp") {
          if (!xmppConnection || relayStatus !== "connected") {
            showToast("XMPP relay is not connected.", { tone: "error" });
            return;
          }
          const sent = sendXmppPing(xmppConnection);
          showToast(sent ? "Sent XMPP ping request." : "Could not send XMPP ping request.", { tone: sent ? "info" : "error" });
          return;
        }
        if (!["ws", "http"].includes(prefs.relayMode)) {
          showToast("Relay ping is available only for ws/http/xmpp modes.", { tone: "error" });
          return;
        }
        const startedAt = Date.now();
        const healthUrl = relayHealthUrlFromRelayUrl(prefs.relayUrl);
        if (!healthUrl) {
          showToast("Relay URL is invalid.", { tone: "error" });
          return;
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
            showToast(`${prefix} (${elapsed}ms) · HTTP ${response.status}${body ? ` · ${body}` : ""}`, {
              tone: response.ok ? "info" : "error",
              duration: 2600
            });
          })
          .catch((error) => {
            showToast(`Relay ping failed: ${String(error?.message || error)}`, { tone: "error" });
          });
        return;
      }
      showToast(
        "Usage: /relay [status|connect|disconnect|reconnect|mode <local|http|ws|xmpp|off>|url|room|roomsync|autoconnect <on|off|status>|ping]",
        { tone: "error" }
      );
      return;
    }
    if (dmCommand === "quests") {
      showToast(formatQuestSummaryText(account.id));
      return;
    }
    if (dmCommand === "questprogress") {
      showToast(formatQuestSummaryText(account.id));
      return;
    }
    if (dmCommand === "questbadges") {
      const badges = resolveQuestBadgesForAccount(account.id);
      showToast(badges.length > 0 ? `Badges: ${badges.join(", ")}` : "No badges unlocked yet.");
      return;
    }
    if (dmCommand === "profilefx") {
      if (!dmArg) {
        showToast(`Current profile effect: ${accountProfileEffect(account)}`);
        return;
      }
      if (!["none", "aurora", "flame", "ocean"].includes(dmArg.toLowerCase())) {
        showToast("Usage: /profilefx <none|aurora|flame|ocean>", { tone: "error" });
        return;
      }
      account.profileEffect = normalizeProfileEffect(dmArg);
      saveState();
      render();
      showToast(`Profile effect set to: ${account.profileEffect}`);
      return;
    }
    if (dmCommand === "guildtag") {
      const rawTag = dmArg.trim();
      if (!rawTag) {
        showToast(`Current guild tag: ${accountGuildTag(account) || "(none)"}`);
        return;
      }
      if (rawTag.toLowerCase() === "clear") {
        account.guildTag = "";
        account.guildTagGuildId = "";
        saveState();
        render();
        showToast("Guild tag cleared.");
        return;
      }
      account.guildTag = rawTag.slice(0, 8).toUpperCase();
      const activeGuild = getActiveGuild();
      account.guildTagGuildId = activeGuild && activeGuild.memberIds.includes(account.id) ? activeGuild.id : "";
      saveState();
      render();
      showToast(`Guild tag set to: ${account.guildTag}`);
      return;
    }
    if (dmCommand === "decor") {
      const rawDecor = dmArg.trim();
      if (!rawDecor) {
        showToast(`Current avatar decoration: ${accountDecorationEmoji(account) || "(none)"}`);
        return;
      }
      if (rawDecor.toLowerCase() === "clear") {
        account.avatarDecoration = "";
        saveState();
        render();
        showToast("Avatar decoration cleared.");
        return;
      }
      account.avatarDecoration = rawDecor.slice(0, 4);
      saveState();
      render();
      showToast(`Avatar decoration set to: ${account.avatarDecoration}`);
      return;
    }
    if (dmCommand === "nameplate") {
      const rawNameplate = dmArg.trim();
      if (!rawNameplate) {
        showToast(`Current nameplate: ${accountNameplateSvg(account) || "(none)"}`);
        return;
      }
      if (rawNameplate.toLowerCase() === "clear") {
        account.profileNameplateSvg = "";
        saveState();
        render();
        showToast("Nameplate cleared.");
        return;
      }
      if (!/^https?:\/\//i.test(rawNameplate) && !/^data:image\/svg\+xml/i.test(rawNameplate)) {
        showToast("Usage: /nameplate <https://...|data:image/svg+xml...|clear>", { tone: "error" });
        return;
      }
      account.profileNameplateSvg = rawNameplate.slice(0, 280);
      saveState();
      render();
      showToast("Nameplate updated.");
      return;
    }
    if (dmCommand === "whoami") {
      showToast(formatIdentitySummaryText(account, null));
      return;
    }
    if (dmCommand === "whois") {
      const query = (dmArg || "").trim();
      if (!query) {
        showToast("Usage: /whois <username-or-jid>", { tone: "error" });
        return;
      }
      const target = resolveAccountByIdentityToken(query, { includeSelf: true });
      if (!target) {
        showToast("No matching account found.", { tone: "error" });
        return;
      }
      showToast(formatIdentitySummaryText(target, null), { duration: 2600 });
      return;
    }
    if (["online", "idle", "dnd", "invisible", "away"].includes(dmCommand)) {
      const nextPresence = dmCommand === "away" ? "idle" : dmCommand;
      setCurrentAccountPresence(nextPresence, { persist: true, rerender: true, announceXmpp: true });
      showToast(`Presence changed to ${presenceLabel(nextPresence)}.`);
      return;
    }
    if (dmCommand === "nick") {
      const rawNick = (dmArg || "").trim();
      if (!rawNick) {
        showToast(`Display name: ${displayNameForAccount(account, null)}`);
        return;
      }
      if (rawNick.toLowerCase() === "clear") {
        account.displayName = account.username || account.displayName;
        saveState();
        render();
        showToast(`Display name reset to ${account.displayName}.`);
        return;
      }
      account.displayName = rawNick.slice(0, 32);
      saveState();
      render();
      showToast(`Display name changed to ${account.displayName}.`);
      return;
    }
    if (dmCommand === "status") {
      const statusInput = (dmArg || "").trim();
      account.customStatus = (!statusInput || statusInput.toLowerCase() === "clear")
        ? ""
        : statusInput.slice(0, 80);
      saveState();
      render();
      showToast(account.customStatus ? `Status set to: ${account.customStatus}` : "Status cleared.");
      return;
    }
    if (dmCommand === "presence") {
      const token = (dmArg || "").trim().toLowerCase();
      if (!token || token === "status") {
        showToast(`Presence: ${presenceLabel(account.presence || "online")}.`);
        return;
      }
      if (!["online", "idle", "dnd", "invisible"].includes(token)) {
        showToast("Usage: /presence <online|idle|dnd|invisible|status>", { tone: "error" });
        return;
      }
      setCurrentAccountPresence(token, { persist: true, rerender: true, announceXmpp: true });
      showToast(`Presence changed to ${presenceLabel(token)}.`);
      return;
    }
    if (dmCommand === "profilecard") {
      conversation.thread.messages.push({
        id: createId(),
        userId: account.id,
        authorName: "",
        text: `🪪 ${formatIdentitySummaryText(account, null)}`,
        ts: new Date().toISOString(),
        reactions: [],
        attachments: []
      });
      saveState();
      renderMessages();
      return;
    }
    if (dmCommand === "shop") {
      openCosmeticsDialog(dmArg);
      return;
    }
    if (dmCommand === "inventory") {
      showToast(formatCosmeticInventorySummary(account.id));
      return;
    }
    if (dmCommand === "find") {
      openFindDialogWithQuery(dmArg);
      return;
    }
    if (dmCommand === "findlinks") {
      openFindDialogWithQuery("has:link");
      return;
    }
    if (dmCommand === "findfrom") {
      const sender = (dmArg || "").trim();
      if (!sender) {
        showToast("Usage: /findfrom <username>", { tone: "error" });
        return;
      }
      openFindDialogWithQuery(`from:${sender}`);
      return;
    }
    if (dmCommand === "findtoday") {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      openFindDialogWithQuery(`after:${yyyy}-${mm}-${dd}`);
      return;
    }
    if (dmCommand === "findnext") {
      if (!findQuery.trim()) {
        openFindDialog();
        return;
      }
      moveFindSelection(1);
      return;
    }
    if (dmCommand === "findprev") {
      if (!findQuery.trim()) {
        openFindDialog();
        return;
      }
      moveFindSelection(-1);
      return;
    }
    if (dmCommand === "markunread") {
      const bucket = conversation.thread?.messages || [];
      if (bucket.length === 0) {
        showToast("No messages to mark unread from.", { tone: "error" });
        return;
      }
      const needle = dmArg.trim().toLowerCase();
      const targetMessage = !needle || needle === "last"
        ? bucket[bucket.length - 1]
        : bucket.find((entry) => (entry.id || "").toLowerCase().startsWith(needle));
      if (!targetMessage) {
        showToast("Usage: /markunread [message-id-prefix|last]", { tone: "error" });
        return;
      }
      if (!markConversationUnreadFromMessage(conversation, targetMessage.id, account.id)) return;
      saveState();
      render();
      showToast(`Marked unread from ${targetMessage.id.slice(0, 8)}.`);
      return;
    }
    if (dmCommand === "schedule") {
      const splitAt = dmArg.indexOf("|");
      if (splitAt < 0) {
        showToast("Usage: /schedule <when> | <text>", { tone: "error" });
        return;
      }
      const queued = queueScheduledMessage(
        conversation,
        account,
        dmArg.slice(0, splitAt).trim(),
        dmArg.slice(splitAt + 1).trim()
      );
      if (!queued.ok) {
        showToast(queued.error || "Could not schedule message.", { tone: "error" });
        return;
      }
      ui.messageInput.value = "";
      resizeComposerInput();
      saveState();
      renderMessages();
      showToast(`Scheduled ${queued.entry.id.slice(0, 8)} for ${new Date(queued.entry.sendAt).toLocaleString()}.`);
      return;
    }
    if (dmCommand === "scheduled") {
      const rows = listScheduledMessagesForConversation(conversation.id);
      showToast(rows.length > 0 ? `${rows.length} scheduled message${rows.length === 1 ? "" : "s"} in this DM.` : "No scheduled messages in this DM.");
      return;
    }
    if (dmCommand === "unschedule") {
      const removed = removeScheduledMessageByToken(conversation.id, dmArg.trim() || "last");
      if (removed > 0) {
        saveState();
        showToast(`Removed ${removed} scheduled message${removed === 1 ? "" : "s"}.`);
      } else {
        showToast("No scheduled message matched.", { tone: "error" });
      }
      return;
    }
    };

    execute();
    return false;
  }

  globalScope.SHITCORD67_XEP_DM_COMMAND_RUNTIME = Object.freeze({
    handleDmSlashCommandRuntime
  });

  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-dm-command-runtime", globalScope.SHITCORD67_XEP_DM_COMMAND_RUNTIME);
  }
})(typeof window !== "undefined" ? window : globalThis);
