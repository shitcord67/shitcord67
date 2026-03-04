/*
 * Relay/XMPP connection flow extracted from app.js.
 * Functions here intentionally bind to app globals at call time.
 */

let xmppCsiSignalBindingsInstalled = false;

function ensureXmppCsiSignalBindings() {
  if (xmppCsiSignalBindingsInstalled) return;
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const sync = (reason = "signal") => {
    try {
      syncXmppClientStateHint({ force: false, reason: `ui-${reason}` });
    } catch {
      // Ignore CSI sync failures from UI events.
    }
  };
  document.addEventListener("visibilitychange", () => sync("visibility"));
  window.addEventListener("focus", () => sync("focus"));
  window.addEventListener("blur", () => sync("blur"));
  xmppCsiSignalBindingsInstalled = true;
}

function recoverXmppMamAfterReconnect({ reason = "reconnect" } = {}) {
  const conversation = getActiveConversation();
  if (!conversation) return;
  if (conversation.type === "channel" && conversation.channel?.xmppRoomJid) {
    const roomJid = xmppBareJid(conversation.channel.xmppRoomJid);
    if (roomJid) {
      requestXmppRoomHistory(roomJid, {
        reason: `${reason}-active-room-gap`,
        force: true,
        prefetchPages: 1
      });
    }
    return;
  }
  if (conversation.type === "dm" && conversation.thread) {
    const peerJid = xmppPeerJidForDmThread(conversation.thread, getCurrentAccount());
    const barePeer = xmppBareJid(peerJid);
    if (barePeer) {
      requestXmppDirectHistory(barePeer, {
        reason: `${reason}-active-dm-gap`,
        force: true,
        prefetchPages: 1
      });
    }
  }
}

function connectRelaySocket({ force = false } = {}) {
  const prefs = getPreferences();
  const current = getCurrentAccount();
  if (!current) {
    disconnectRelaySocket({ manual: true });
    return false;
  }
  if (prefs.relayMode === "local") {
    if (relaySocket || relayEventSource || xmppConnection) {
      disconnectRelaySocket({ manual: false });
    }
    relayManualDisconnect = false;
    const ok = ensureLocalRelayChannel();
    if (!ok) {
      setRelayStatus("error", "Local relay channel unavailable.");
      return false;
    }
    setRelayStatus("connected");
    return true;
  }
  if (prefs.relayMode === "xmpp") {
    const jid = normalizeXmppJid(prefs.xmppJid);
    const wsUrl = resolveXmppServiceUrl(prefs);
    const mucService = resolveXmppMucService(prefs);
    addXmppDebugEvent("connect", "Relay connect requested (XMPP)", { jid, wsUrl, mucService, force });
    if (!jid || !wsUrl || !mucService) {
      addXmppDebugEvent("error", "XMPP connect blocked: missing required fields", {
        jid: Boolean(jid),
        wsUrl: Boolean(wsUrl),
        mucService: Boolean(mucService)
      });
      setRelayStatus("error", "XMPP requires JID, WebSocket URL, and MUC service.");
      return false;
    }
    if (xmppConnection && !force) return true;
    disconnectRelaySocket({ manual: false });
    relayManualDisconnect = false;
    setRelayStatus("connecting");
    loadXmppLibrary().then((ok) => {
      if (!ok) {
        addXmppDebugEvent("error", "Failed to load runtime during XMPP relay connect", { error: xmppRuntimeLastError || "" });
        setRelayStatus("error", `Failed to load Strophe runtime. ${xmppRuntimeLastError || ""}`.trim());
        scheduleRelayReconnect();
        return;
      }
      try {
        xmppConnection = new globalThis.Strophe.Connection(wsUrl, stropheConnectionOptionsForXmpp({
          jid,
          wsUrl
        }));
        addXmppDebugEvent("connect", "Created Strophe connection", { wsUrl });
      } catch (error) {
        addXmppDebugEvent("error", "Failed to construct Strophe connection", { wsUrl, error: String(error) });
        setRelayStatus("error", String(error));
        scheduleRelayReconnect();
        return;
      }
      xmppConnection.rawInput = (raw) => {
        addXmppDebugEvent("raw", "RX", trimXmppRaw(raw));
      };
      xmppConnection.rawOutput = (raw) => {
        addXmppDebugEvent("raw", "TX", trimXmppRaw(raw));
      };
      const originalSend = xmppConnection.send.bind(xmppConnection);
      xmppConnection.send = (stanza) => {
        addXmppDebugEvent("stanza", "send()", trimXmppRaw(xmppSerializePayload(stanza)));
        const result = originalSend(stanza);
        noteXmppSmOutboundStanza(stanza);
        maybeRequestXmppSmAckForBacklog(xmppConnection, {
          reason: "send-backlog",
          minUnacked: 8,
          minIntervalMs: 5000
        });
        return result;
      };
      const originalSendIQ = xmppConnection.sendIQ.bind(xmppConnection);
      xmppConnection.sendIQ = (stanza, success, error, timeout) => {
        addXmppDebugEvent("iq", "sendIQ()", trimXmppRaw(xmppSerializePayload(stanza)));
        const result = originalSendIQ(stanza, success, error, timeout);
        noteXmppSmOutboundStanza(stanza);
        maybeRequestXmppSmAckForBacklog(xmppConnection, {
          reason: "sendiq-backlog",
          minUnacked: 8,
          minIntervalMs: 5000
        });
        return result;
      };
      const applyXmppPhotoStateForJid = (jid, stanza) => {
        const bare = xmppBareJid(jid);
        if (!bare) return;
        const state = xmppPresencePhotoState(stanza);
        if (!state?.hasUpdate) return;
        if (state.hash) xmppAvatarHashByJid.set(bare, state.hash);
        maybeFetchXmppAvatarForJid(bare, {
          photoHash: state.hash || "",
          clearAvatar: Boolean(state.cleared)
        });
      };
      const xmppAvatarMetadataEventPayload = (stanza) => {
        if (!stanza || typeof stanza.getElementsByTagName !== "function") return null;
        const events = xmppElementsByLocalName(stanza, "event")
          .filter((node) => xmppNodeHasXmlns(node, "http://jabber.org/protocol/pubsub#event"));
        if (events.length === 0) return null;
        for (const eventNode of events) {
          const itemsNodes = xmppElementsByLocalName(eventNode, "items")
            .filter((node) => (
              (node?.getAttribute?.("node") || "").toString().trim().toLowerCase() === "urn:xmpp:avatar:metadata"
            ));
          for (const itemsNode of itemsNodes) {
            const itemNodes = xmppElementsByLocalName(itemsNode, "item");
            const retractNode = xmppElementsByLocalName(itemsNode, "retract")[0] || null;
            const purgeNode = xmppElementsByLocalName(itemsNode, "purge")[0] || null;
            let hash = "";
            if (itemNodes.length > 0) {
              for (const itemNode of itemNodes) {
                const itemId = (itemNode?.getAttribute?.("id") || "").toString().trim();
                if (itemId) {
                  hash = itemId;
                  break;
                }
                const metadataNode = xmppElementsByLocalName(itemNode, "metadata")
                  .find((node) => xmppNodeHasXmlns(node, "urn:xmpp:avatar:metadata")) || null;
                if (!metadataNode) continue;
                const infoNode = xmppElementsByLocalName(metadataNode, "info")[0] || null;
                const infoId = (infoNode?.getAttribute?.("id") || "").toString().trim();
                if (infoId) {
                  hash = infoId;
                  break;
                }
              }
            }
            const cleared = Boolean((retractNode && retractNode.getAttribute("id")) || purgeNode || (!hash && itemNodes.length === 0));
            if (!hash && !cleared) continue;
            return { hash, cleared };
          }
        }
        return null;
      };
      const handleXmppIncomingMessage = (stanza, { fallbackTs = "", allowSelf = false, history = false } = {}) => {
      const from = stanza.getAttribute("from") || "";
      const type = (stanza.getAttribute("type") || "").toLowerCase();
      const earlyJingleAction = parseXmppJingleMessageAction(stanza);
      const earlyCallInvite = parseXmppCallInviteAction(stanza);
      if (type && !["groupchat", "chat", "normal", "headline", ""].includes(type) && !(earlyJingleAction || earlyCallInvite)) return;
        const bareFrom = xmppBareJid(from);
        const nick = (from.split("/")[1] || "").toString();
        const ownBare = xmppBareJid(getPreferences().xmppJid || "");
        const knownRoom = isKnownXmppRoomJid(bareFrom);
        const isGroupchat = type === "groupchat";
        const isMucLike = isGroupchat || isXmppMucRoomJid(bareFrom);
        const isDirectLike = (type === "chat" || type === "normal" || type === "headline") && !isMucLike;
        const incomingChatState = xmppChatStateFromStanza(stanza);
        const preferredBodyText = xmppPreferredBodyText(stanza);
        const bodyNode = xmppDirectChildByLocalName(stanza, "body");
        const subjectNode = xmppDirectChildByLocalName(stanza, "subject");
        const bodyText = (preferredBodyText || decodeHtmlEntities(xmppNodeText(bodyNode))).trim();
        const subjectText = decodeHtmlEntities(xmppNodeText(subjectNode)).trim();
        const avatarMetadataEvent = xmppAvatarMetadataEventPayload(stanza);
        if (!history && avatarMetadataEvent && bareFrom && !isMucLike) {
          maybeFetchXmppAvatarForJid(bareFrom, {
            photoHash: avatarMetadataEvent.hash || "",
            clearAvatar: Boolean(avatarMetadataEvent.cleared)
          });
          addXmppDebugEvent("message", "Processed XMPP avatar metadata notification", {
            from: bareFrom,
            hash: avatarMetadataEvent.hash || "",
            cleared: Boolean(avatarMetadataEvent.cleared)
          });
          if (!bodyText && !subjectText && !earlyJingleAction && !earlyCallInvite) return;
        }
        let encryptedInfo = xmppEncryptedPayloadInfo(stanza);
        let encrypted = encryptedInfo.encrypted;
        const attachmentHint = xmppHasOobAttachmentHint(stanza);
        const fallbackAttachmentText = xmppLooksLikeAttachmentFallbackText(bodyText);
        let text = bodyText;
        const otrEncrypted = !encrypted && text.startsWith(XMPP_OTR_PREFIX);
        if (otrEncrypted) {
          encryptedInfo = { encrypted: true, type: "otr", label: "OTR" };
          encrypted = true;
          text = "";
        }
        if (!text && subjectText) {
          text = type === "groupchat" ? `[Room subject] ${subjectText}` : subjectText;
        }
        if (!text && encrypted) {
          text = `[${xmppEncryptedPlaceholderLabel(encryptedInfo)}]`;
        }
        const timestamp = xmppStanzaDelayTimestamp(stanza, fallbackTs);
        let attachmentEntries = xmppExtractOobAttachments(stanza);
        if (attachmentEntries.length === 0) {
          attachmentEntries = xmppInlineBobEntries(stanza);
        }
        if (attachmentEntries.length === 0 && fallbackAttachmentText) {
          attachmentEntries = xmppExtractLooseAttachmentEntries(stanza, {
            hintName: /\b(sticker|aufkleber)\b/i.test(bodyText) ? "sticker" : "",
            hintMime: ""
          });
        }
        const attachments = xmppAttachmentsFromOobEntries(attachmentEntries);
        if (attachments.length > 0 && fallbackAttachmentText) {
          text = "";
        }
        if (!text && !encrypted && attachments.length === 0 && attachmentHint) {
          text = "[XMPP attachment metadata received, but no supported URL payload was found]";
        }
        const receiptRequest = xmppReceiptRequestNode(stanza);
        const receiptReceivedId = xmppReceiptReceivedId(stanza);
        const chatMarker = xmppChatMarkerPayload(stanza);
        const chatMarkable = Boolean(xmppChatMarkableNode(stanza));
        const stanzaMessageId = (stanza.getAttribute("id") || "").toString().trim();
        const stanzaRefs = xmppStanzaReferenceIds(stanza);
        const stanzaDeliveryRefId = stanzaMessageId || (Array.isArray(stanzaRefs) ? stanzaRefs.find((entry) => (entry || "").toString().trim()) : "") || "";
        const correctionTargetId = xmppMessageCorrectionTargetId(stanza);
        const retractionTargetId = xmppMessageRetractionTargetId(stanza);
        const reactionPayload = xmppReactionPayloadFromStanza(stanza);
        const processingHints = xmppProcessingHintsFromStanza(stanza);
        const hasSubjectNode = Boolean(subjectNode);
        if (isDirectLike) {
          const toBare = xmppBareJid(stanza.getAttribute("to") || "");
          const stanzaLooksLocal = [stanzaMessageId, ...stanzaRefs].some((refId) => isXmppLocalSentRefId(refId));
          const ownByDirection = Boolean(allowSelf && ownBare && toBare && toBare !== ownBare);
          const ownAuthor = Boolean(
            (ownBare && bareFrom === ownBare)
            || ownByDirection
            || (allowSelf && ownBare && stanzaLooksLocal)
          );
          const peerBare = ownAuthor
            ? (toBare && toBare !== ownBare ? toBare : "")
            : bareFrom;
          if (!peerBare) return;
          const peerLabel = peerBare.split("@")[0] || nick || "";
          const peer = ensureAccountByXmppJid(peerBare, peerLabel);
          if (!peer || peer.id === current.id) return;
          const dmRoom = relayRoomForDmParticipantAccounts([current, peer]) || "";
          if (!dmRoom) return;
          if (!ownAuthor && from.includes("/")) xmppRememberPeerFullJid(from);
          const jingleAction = earlyJingleAction;
          if (jingleAction && !ownAuthor && !history) {
            addXmppDebugEvent("call", "Incoming Jingle Message", {
              from: bareFrom,
              action: jingleAction.action,
              id: jingleAction.id,
              media: Array.isArray(jingleAction.media) ? jingleAction.media : [],
              raw: trimXmppRaw(xmppSerializePayload(stanza))
            });
            const handledJingle = handleXmppJingleMessageAction(jingleAction, {
              peerJid: stanza.getAttribute("from") || peerBare,
              screenShareFallback: false
            });
            if (handledJingle) return;
          }
          if (jingleAction && ownAuthor && allowSelf && !history && ["reject", "retract"].includes(jingleAction.action)) {
            const localFullJid = normalizeXmppJid(xmppConnection?.jid || getPreferences().xmppJid || "");
            const fromFullJid = normalizeXmppJid(stanza.getAttribute("from") || "");
            const fromOtherOwnResource = Boolean(fromFullJid && localFullJid && fromFullJid !== localFullJid);
            if (fromOtherOwnResource) {
              const stopId = (jingleAction.id || "").toString().trim()
                || latestXmppCallSessionIdForPeer(peerBare, "outgoing")
                || latestXmppCallSessionIdForPeer(peerBare, "incoming");
              if (stopId) {
                stopWebCallRingtone(stopId);
                forgetXmppCallSession(stopId);
              }
              addXmppDebugEvent("call", "Observed own-resource jingle stop action", {
                from: fromFullJid,
                peer: peerBare,
                action: jingleAction.action,
                id: stopId || ""
              });
              const label = jingleAction.action === "reject" ? "rejected" : "cancelled";
              showToast(`Call ${label} from another logged-in XMPP client.`);
              if (addSystemDmMessageByPeerJid(peerBare, `XMPP call proposal ${label} from another logged-in client (${(stopId || "").slice(0, 8)}).`)) {
                refreshDmUiForPeerJid(peerBare);
              }
              return;
            }
          }
          const callInvite = earlyCallInvite;
          if (callInvite && !ownAuthor && !history) {
            const inviteId = callInvite.action === "invite"
              ? (callInvite.id || xmppStanzaStableId(stanza) || stanzaMessageId)
              : callInvite.id || "";
            const inviteUrl = (callInvite.externals || [])
              .map((entry) => normalizeCallInviteUrl(entry))
              .find(Boolean) || "";
            const mappedSessionId = inviteId
              ? (xmppCallSessionIdByInviteId.get(inviteId) || "")
              : "";
            addXmppDebugEvent("call", "Incoming call-invite", {
              from: peerBare,
              action: callInvite.action,
              id: inviteId,
              url: inviteUrl,
              audio: callInvite.audio,
              video: callInvite.video,
              jingleSid: callInvite.jingleSid || "",
              mappedSessionId
            });
            if (callInvite.action === "invite" && inviteUrl) {
              const inferred = parseCallInviteFromText(text);
              const thread = getOrCreateDmThread(current, peer);
              maybeHandleIncomingXmppCallInvite({
                conversation: { type: "dm", id: thread.id, thread },
                peerJid: peerBare,
                invite: {
                  id: inviteId,
                  url: inviteUrl,
                  screenShare: Boolean(inferred?.screenShare)
                },
                history
              });
            } else if (callInvite.action === "invite") {
              const existingIncomingId = latestXmppCallSessionIdForPeer(peerBare, "incoming");
              const existingIncoming = existingIncomingId ? (xmppCallSessionById.get(existingIncomingId) || null) : null;
              let nativeSessionId = (callInvite.jingleSid || "").toString().trim();
              const inviteHasJingleSid = Boolean(nativeSessionId);
              if (!nativeSessionId && existingIncomingId) nativeSessionId = existingIncomingId;
              if (!nativeSessionId) nativeSessionId = `ci-${createId().slice(0, 12)}`;
              const incomingMedia = [
                callInvite.audio ? "audio" : "",
                callInvite.video ? "video" : ""
              ].filter(Boolean);
              const media = incomingMedia.length > 0 ? incomingMedia : XMPP_CALL_DEFAULT_MEDIA;
              const fullFrom = (stanza.getAttribute("from") || "").toString().trim();
              const session = xmppCallSessionById.get(nativeSessionId) || existingIncoming || null;
              const entry = {
                ...(session || {}),
                id: nativeSessionId,
                peerJid: peerBare,
                peerFullJid: fullFrom || session?.peerFullJid || "",
                direction: "incoming",
                localJingleRole: session?.localJingleRole || "responder",
                remoteJingleRole: session?.remoteJingleRole || "initiator",
                inviteSignal: (session?.inviteSignal || "").toString().trim().toLowerCase() === "jmi" ? "jmi" : "call-invite",
                callInviteId: inviteId || (session?.callInviteId || ""),
                callInviteHasJingleSid: inviteHasJingleSid || Boolean(session?.callInviteHasJingleSid),
                state: "proposed",
                createdAt: Number(session?.createdAt) || Date.now(),
                media
              };
              xmppCallSessionById.set(nativeSessionId, entry);
              xmppLatestIncomingCallSessionByPeer.set(peerBare, nativeSessionId);
              if (inviteId) xmppCallSessionIdByInviteId.set(inviteId, nativeSessionId);
              if (entry.peerFullJid) xmppRememberPeerFullJid(entry.peerFullJid);
              startWebCallRingtone(nativeSessionId);
              showIncomingXmppCallPrompt({
                sessionId: nativeSessionId,
                peerLabel: peerBare,
                screenShare: false
              });
              showToast(`Incoming XMPP call from ${peerBare}. Use /callxmpp accept ${nativeSessionId.slice(0, 8)} or /callxmpp reject ${nativeSessionId.slice(0, 8)}.`);
              if (addSystemDmMessageByPeerJid(peerBare, `Incoming XMPP call invite (${nativeSessionId.slice(0, 8)}). Use /callxmpp accept ${nativeSessionId.slice(0, 8)} or /callxmpp reject ${nativeSessionId.slice(0, 8)}.`)) {
                refreshDmUiForPeerJid(peerBare);
              }
            } else if (callInvite.action === "retract" && inviteId) {
              if (mappedSessionId) {
                handleXmppJingleMessageAction({ action: "retract", id: mappedSessionId }, {
                  peerJid: stanza.getAttribute("from") || peerBare,
                  screenShareFallback: false
                });
              }
              const token = xmppCallInviteTokenById.get(inviteId);
              if (token) {
                stopWebCallRingtone(token);
                webCallInvitePendingByToken.delete(token);
                xmppCallInviteTokenById.delete(inviteId);
                closeMediaLightbox();
              }
              xmppCallSessionIdByInviteId.delete(inviteId);
              if (addSystemDmMessageByPeerJid(peerBare, `XMPP call invite retracted (${inviteId.slice(0, 8)}).`)) {
                refreshDmUiForPeerJid(peerBare);
              }
            } else if (["accept", "reject", "left"].includes(callInvite.action)) {
              const targetSessionId = mappedSessionId
                || latestXmppCallSessionIdForPeer(peerBare, "outgoing")
                || latestXmppCallSessionIdForPeer(peerBare, "incoming");
              if (targetSessionId) {
                const mappedAction = callInvite.action === "accept"
                  ? "accept"
                  : (callInvite.action === "left" ? "retract" : callInvite.action);
                handleXmppJingleMessageAction({ action: mappedAction, id: targetSessionId }, {
                  peerJid: stanza.getAttribute("from") || peerBare,
                  screenShareFallback: false
                });
              }
              if (inviteId && ["reject", "left"].includes(callInvite.action)) {
                xmppCallSessionIdByInviteId.delete(inviteId);
              }
              if (addSystemDmMessageByPeerJid(peerBare, `XMPP call invite ${callInvite.action} (${(inviteId || "").slice(0, 8)}).`)) {
                refreshDmUiForPeerJid(peerBare);
              }
            }
          }
          const directMucInvite = parseXmppDirectMucInvite(stanza);
          if (directMucInvite && !ownAuthor && !history) {
            const inviteRef = xmppStanzaStableId(stanza) || stanzaMessageId || directMucInvite.roomJid;
            const inviteKey = `${peerBare}|${directMucInvite.roomJid}|${inviteRef}`;
            if (rememberXmppDirectMucInviteSeen(inviteKey)) {
              const roomToken = `xmpp:${directMucInvite.roomJid}`;
              xmppRoomByJid.set(directMucInvite.roomJid, roomToken);
              const mapped = upsertXmppRoomChannel(directMucInvite.roomJid, {
                roomName: directMucInvite.roomJid.split("@")[0] || "",
                roomToken,
                account: current,
                prefs: getPreferences(),
                persist: false
              });
              if (mapped.changed) {
                saveState();
                renderServers();
                renderChannels();
              }
              const roomLabel = mapped.channel?.xmppRoomName
                || mapped.channel?.name
                || directMucInvite.roomJid.split("@")[0]
                || directMucInvite.roomJid;
              const systemParts = [
                `XMPP room invite to ${directMucInvite.roomJid}.`,
                directMucInvite.reason ? `Reason: ${directMucInvite.reason}.` : "",
                directMucInvite.password ? "Invite includes a room password." : "",
                `Use /joinxmpp ${directMucInvite.roomJid} to join.`
              ].filter(Boolean);
              if (addSystemDmMessageByPeerJid(peerBare, systemParts.join(" "))) {
                refreshDmUiForPeerJid(peerBare);
              }
              showToast(`XMPP room invite from ${peerBare}: ${roomLabel}`);
              addXmppDebugEvent("message", "Incoming direct MUC invite", {
                from: peerBare,
                roomJid: directMucInvite.roomJid,
                reason: directMucInvite.reason || "",
                hasPassword: Boolean(directMucInvite.password),
                thread: directMucInvite.thread || "",
                continueThread: directMucInvite.continueThread
              });
            }
          }
          if (!ownAuthor && receiptRequest && stanzaDeliveryRefId && xmppConnection) {
            const receiptAck = buildXmppReceiptAckStanza(peerBare, stanzaDeliveryRefId, { type: "chat" });
            if (receiptAck) {
              xmppConnection.send(receiptAck);
              addXmppDebugEvent("message", "Sent XMPP delivery receipt", { to: peerBare, id: stanzaDeliveryRefId });
            }
          }
          if (!ownAuthor && chatMarkable && stanzaDeliveryRefId && xmppConnection) {
            const markerAck = buildXmppChatMarkerAckStanza(peerBare, stanzaDeliveryRefId, { type: "chat", marker: "received" });
            if (markerAck) {
              xmppConnection.send(markerAck);
              addXmppDebugEvent("message", "Sent XMPP chat marker", {
                to: peerBare,
                marker: "received",
                id: stanzaDeliveryRefId
              });
            }
            const activeConversation = getActiveConversation();
            const activePeerJid = activeConversation?.type === "dm"
              ? xmppPeerJidForDmThread(activeConversation.thread, current)
              : "";
            const activePeerBare = xmppBareJid(activePeerJid);
            const visibilityVisible = (typeof document === "undefined")
              ? true
              : document.visibilityState === "visible";
            if (activePeerBare && activePeerBare === peerBare && visibilityVisible) {
              sendXmppDisplayedMarkerToPeer(peerBare, stanzaDeliveryRefId, { trigger: "incoming-markable-visible" });
            }
          }
          if (receiptReceivedId) {
            const updated = markXmppMessageDeliveredByReceipt(receiptReceivedId, peerBare);
            if (updated) {
              saveState();
              const activeConversation = getActiveConversation();
              if (activeConversation?.type === "dm") renderMessages();
            }
            addXmppDebugEvent("message", "Received XMPP delivery receipt", {
              from: peerBare,
              id: receiptReceivedId,
              matched: updated
            });
          }
          if (chatMarker?.type && chatMarker.id) {
            let updated = false;
            if (chatMarker.type === "displayed" || chatMarker.type === "acknowledged") {
              updated = markXmppMessageReadByMarker(chatMarker.id, peerBare);
            } else if (chatMarker.type === "received") {
              updated = markXmppMessageDeliveredByReceipt(chatMarker.id, peerBare);
            }
            if (updated) {
              saveState();
              const activeConversation = getActiveConversation();
              if (activeConversation?.type === "dm") renderMessages();
            }
            addXmppDebugEvent("message", "Received XMPP chat marker", {
              from: peerBare,
              marker: chatMarker.type,
              id: chatMarker.id,
              matched: updated
            });
          }
          const dmTypingPayload = xmppRelayTypingPayloadFromChatState(incomingChatState, {
            authorUsername: peer.username,
            authorDisplay: peer.displayName || peer.username
          });
          if (dmTypingPayload) {
            applyRelayIncomingTyping({
              type: "typing",
              room: dmRoom,
              clientId: `xmpp:${from}`,
              username: peer.username,
              typing: dmTypingPayload
            });
          }
          if (reactionPayload) {
            const reactionUpdate = {
              actorUserId: ownAuthor ? current.id : peer.id,
              emojis: reactionPayload.emojis,
              processingHints,
              stanzaId: stanzaMessageId,
              stanzaRefs
            };
            const reactionResult = applyXmppDmReactionUpdate(peerBare, reactionPayload.targetId, reactionUpdate);
            const fallbackResult = reactionResult.handled
              ? reactionResult
              : applyXmppReactionFallback(reactionPayload.targetId, reactionUpdate);
            if (fallbackResult.handled) {
              const targetThreadId = fallbackResult.thread?.id || reactionResult.thread?.id || "";
              if (fallbackResult.changed) {
                saveState();
                renderDmList();
                const activeConversation = getActiveConversation();
                if (activeConversation?.type === "dm" && activeConversation.thread?.id === targetThreadId) {
                  renderMessages();
                }
              }
              addXmppDebugEvent("message", "Applied XMPP message reactions", {
                scope: fallbackResult.scope || "dm",
                from: peerBare,
                targetId: reactionPayload.targetId,
                id: stanzaMessageId || "",
                emojis: reactionPayload.emojis,
                changed: fallbackResult.changed
              });
              if (!ownAuthor) applyXmppPhotoStateForJid(peerBare, stanza);
              return;
            }
            addXmppDebugEvent("message", "Ignored unmatched XMPP message reactions", {
              scope: "dm",
              from: peerBare,
              targetId: reactionPayload.targetId,
              id: stanzaMessageId || ""
            });
            return;
          }
          if (retractionTargetId) {
            const retractionPayload = {
              timestamp,
              editorUserId: ownAuthor ? current.id : peer.id,
              editorName: ownAuthor
                ? (current.displayName || current.username)
                : (peer.displayName || peer.username),
              processingHints,
              stanzaId: stanzaMessageId,
              stanzaRefs
            };
            const retractionResult = applyXmppDmMessageRetraction(peerBare, retractionTargetId, retractionPayload);
            const fallbackResult = retractionResult.handled
              ? retractionResult
              : applyXmppRetractionFallback(retractionTargetId, retractionPayload);
            if (fallbackResult.handled) {
              const targetThreadId = fallbackResult.thread?.id || retractionResult.thread?.id || "";
              if (fallbackResult.changed) {
                saveState();
                if (fallbackResult.contentChanged) renderDmList();
                const activeConversation = getActiveConversation();
                if (activeConversation?.type === "dm" && activeConversation.thread?.id === targetThreadId) {
                  renderMessages();
                }
              }
              addXmppDebugEvent("message", "Applied XMPP message retraction", {
                scope: fallbackResult.scope || "dm",
                from: peerBare,
                targetId: retractionTargetId,
                id: stanzaMessageId || "",
                changed: fallbackResult.changed
              });
              if (!ownAuthor) applyXmppPhotoStateForJid(peerBare, stanza);
              return;
            }
            addXmppDebugEvent("message", "Ignored unmatched XMPP message retraction", {
              scope: "dm",
              from: peerBare,
              targetId: retractionTargetId,
              id: stanzaMessageId || ""
            });
            return;
          }
          if (correctionTargetId) {
            const correctionPayload = {
              text,
              attachments,
              timestamp,
              editorUserId: ownAuthor ? current.id : peer.id,
              editorName: ownAuthor
                ? (current.displayName || current.username)
                : (peer.displayName || peer.username),
              processingHints,
              stanzaId: stanzaMessageId,
              stanzaRefs
            };
            const correctionResult = applyXmppDmMessageCorrection(peerBare, correctionTargetId, correctionPayload);
            const fallbackResult = correctionResult.handled
              ? correctionResult
              : applyXmppCorrectionFallback(correctionTargetId, correctionPayload);
            if (fallbackResult.handled) {
              const resultScope = fallbackResult.scope || "dm";
              const targetThreadId = fallbackResult.thread?.id || correctionResult.thread?.id || "";
              if (fallbackResult.changed) {
                saveState();
                if (fallbackResult.contentChanged) renderDmList();
                const activeConversation = getActiveConversation();
                if (activeConversation?.type === "dm" && activeConversation.thread?.id === targetThreadId) {
                  renderMessages();
                }
              }
              addXmppDebugEvent("message", "Applied XMPP message correction", {
                scope: resultScope,
                from: peerBare,
                replaceId: correctionTargetId,
                id: stanzaMessageId || "",
                changed: fallbackResult.changed
              });
              if (!ownAuthor) applyXmppPhotoStateForJid(peerBare, stanza);
              return;
            }
            addXmppDebugEvent("message", "Ignored unmatched XMPP message correction", {
              scope: "dm",
              from: peerBare,
              replaceId: correctionTargetId,
              id: stanzaMessageId || ""
            });
            return;
          }
          const replyMeta = xmppReplyMetaFromStanza(stanza, "", peerBare);
          if (!text.trim() && attachments.length === 0 && !replyMeta) return;
          const xmppMessageId = xmppStanzaStableId(stanza) || xmppSyntheticMessageId({
            from,
            ts: timestamp,
            text,
            attachments,
            replyId: replyMeta?.stanzaId || ""
          });
          const authorJid = ownAuthor ? ownBare : peerBare;
          const authorUsername = ownAuthor ? current.username : peer.username;
          const authorDisplay = ownAuthor
            ? (current.displayName || current.username)
            : (peer.displayName || peer.username);
          const inserted = applyRelayIncomingMessage({
            type: "chat",
            room: dmRoom,
            clientId: `xmpp:${from}`,
            message: {
              id: xmppMessageId,
              text,
              ts: timestamp,
              authorUsername,
              authorDisplay,
              authorJid,
              xmppRefIds: stanzaRefs,
              xmppEncrypted: encrypted,
              xmppEncryptedType: encryptedInfo.type || "",
              xmppEncryptedLabel: encryptedInfo.label || "",
              xmppProcessingHints: processingHints.hasHints ? { ...processingHints } : null,
              attachments,
              replyTo: replyMeta,
              history,
              allowSelf
            }
          });
          if (inserted) {
            const hydrated = stanzaRefs.some((refId) => {
              rememberXmppDmMessage(peerBare, refId, inserted);
              return hydrateXmppRepliesForDm(peerBare, refId, inserted);
            });
            if (hydrated) {
              saveState();
              const activeConversation = getActiveConversation();
              if (activeConversation?.type === "dm") renderMessages();
            }
            xmppResolveDeferredBobForMessage({
              stanza,
              message: inserted,
              from,
              fallbackAttachmentText,
              onUpdated: () => {
                renderDmList();
                const activeConversation = getActiveConversation();
                if (activeConversation?.type !== "dm") return;
                const activePeer = xmppBareJid(xmppPeerJidForDmThread(activeConversation.thread, getCurrentAccount()));
                if (!activePeer || activePeer !== peerBare) return;
                renderMessages();
              }
            });
            if (encryptedInfo.type === "omemo" || encryptedInfo.type === "omemo2") {
              xmppOmemoTryDecryptIntoMessage({
                stanza,
                message: inserted,
                peerBare,
                ownBare,
                onUpdated: () => {
                  renderDmList();
                  const activeConversation = getActiveConversation();
                  if (activeConversation?.type !== "dm") return;
                  const activePeer = xmppBareJid(xmppPeerJidForDmThread(activeConversation.thread, getCurrentAccount()));
                  if (!activePeer || activePeer !== peerBare) return;
                  renderMessages();
                }
              });
            }
          }
          if (!ownAuthor) applyXmppPhotoStateForJid(peerBare, stanza);
          return;
        }
        if (!isMucLike) return;
        const roomJid = bareFrom;
        const fallbackRoomToken = roomJid ? `xmpp:${roomJid}` : "";
        const roomToken = xmppRoomByJid.get(roomJid) || fallbackRoomToken || `xmpp:${roomJid}`;
        const occupantId = xmppOccupantIdFromStanza(stanza);
        if (roomJid) {
          xmppRoomByJid.set(roomJid, roomToken);
          const synced = upsertXmppRoomChannel(roomJid, {
            roomToken,
            roomName: roomJid.split("@")[0] || "",
            account: current,
            persist: false
          });
          if (synced.created) {
            saveState();
            renderServers();
            renderChannels();
          }
        }
        const roomTypingUser = nick || roomJid.split("@")[0] || "xmpp";
        const roomTypingPayload = xmppRelayTypingPayloadFromChatState(incomingChatState, {
          authorUsername: roomTypingUser,
          authorDisplay: nick || ""
        });
        if (roomTypingPayload) {
          applyRelayIncomingTyping({
            type: "typing",
            room: roomToken,
            clientId: `xmpp:${from}`,
            username: roomTypingUser,
            typing: roomTypingPayload
          });
        }
        const roomCallInvite = earlyCallInvite;
        if (roomCallInvite && !history) {
          const inviteId = roomCallInvite.id || xmppStanzaStableId(stanza) || stanzaMessageId || "";
          const inviteUrl = (roomCallInvite.externals || [])
            .map((entry) => normalizeCallInviteUrl(entry))
            .find(Boolean) || "";
          const inviteRoom = xmppBareJid(roomCallInvite.mujiRoom || "");
          const roomJoinState = xmppMucJoinStateByRoomJid.get(roomJid) || {};
          const ownNick = (roomJoinState.nick || sanitizeChannelName(current?.username || "user", "user")).toLowerCase();
          const ownRoomMessage = Boolean(nick && ownNick && nick.toLowerCase() === ownNick);
          addXmppDebugEvent("call", "Incoming room call-invite", {
            roomJid,
            from,
            action: roomCallInvite.action,
            id: inviteId,
            url: inviteUrl,
            mujiRoom: inviteRoom,
            ownRoomMessage
          });
          const roomLabel = roomJid.split("@")[0] || roomJid;
          const activeConversation = getActiveConversation();
          const roomChannel = findXmppRoomChannelByJid(roomJid);
          if (roomCallInvite.action === "invite") {
            const incomingMedia = [
              roomCallInvite.audio ? "audio" : "",
              roomCallInvite.video ? "video" : ""
            ].filter(Boolean);
            const media = incomingMedia.length > 0 ? incomingMedia : XMPP_CALL_DEFAULT_MEDIA;
            let pendingSessionId = "";
            if (inviteRoom) {
              const inviteRoomToken = `xmpp:${inviteRoom}`;
              xmppRoomByJid.set(inviteRoom, inviteRoomToken);
              const mappedInviteRoom = upsertXmppRoomChannel(inviteRoom, {
                roomToken: inviteRoomToken,
                roomName: inviteRoom.split("@")[0] || "",
                account: current,
                persist: false
              });
              if (mappedInviteRoom.changed) {
                saveState();
                renderServers();
                renderChannels();
              }
            }
            if (!ownRoomMessage && inviteRoom) {
              const existingIncomingId = latestXmppCallSessionIdForPeer(roomJid, "incoming");
              const existingIncoming = existingIncomingId
                ? (xmppCallSessionById.get(existingIncomingId) || null)
                : null;
              pendingSessionId = (inviteId ? (xmppCallSessionIdByInviteId.get(inviteId) || "") : "")
                || (roomCallInvite.jingleSid || "").toString().trim()
                || existingIncomingId
                || `muji-${createId().slice(0, 12)}`;
              const currentSession = xmppCallSessionById.get(pendingSessionId) || existingIncoming || null;
              const entry = {
                ...(currentSession || {}),
                id: pendingSessionId,
                peerJid: roomJid,
                peerFullJid: from || currentSession?.peerFullJid || "",
                direction: "incoming",
                localJingleRole: currentSession?.localJingleRole || "responder",
                remoteJingleRole: currentSession?.remoteJingleRole || "initiator",
                inviteSignal: "muji-call-invite",
                callInviteId: inviteId || currentSession?.callInviteId || "",
                callInviteHasJingleSid: false,
                callInviteRoomJid: roomJid,
                callInviteMessageType: "groupchat",
                mujiRoomJid: inviteRoom,
                state: "proposed",
                createdAt: Number(currentSession?.createdAt) || Date.now(),
                media,
                conversationId: roomChannel?.id || currentSession?.conversationId || "",
                conversationType: "channel"
              };
              xmppCallSessionById.set(pendingSessionId, entry);
              xmppLatestIncomingCallSessionByPeer.set(roomJid, pendingSessionId);
              if (inviteId) xmppCallSessionIdByInviteId.set(inviteId, pendingSessionId);
              if (entry.peerFullJid) xmppRememberPeerFullJid(entry.peerFullJid);
              startWebCallRingtone(pendingSessionId);
              showIncomingXmppCallPrompt({
                sessionId: pendingSessionId,
                peerLabel: roomLabel,
                screenShare: false
              });
            }
            const noteParts = [];
            if (inviteUrl) noteParts.push(`Incoming room call invite in ${roomLabel}: ${inviteUrl}`);
            else if (inviteRoom) noteParts.push(`Incoming room call invite in ${roomLabel} (Muji room: ${inviteRoom}).`);
            else noteParts.push(`Incoming room call invite in ${roomLabel}.`);
            if (inviteRoom) noteParts.push(`Muji room is mapped into XMPP Spaces as ${inviteRoom}.`);
            if (pendingSessionId) {
              noteParts.push(`Use /callxmpp accept ${pendingSessionId.slice(0, 8)} or /callxmpp reject ${pendingSessionId.slice(0, 8)}.`);
            }
            const note = noteParts.join(" ");
            if (roomChannel) {
              if (addSystemMessage(roomChannel, note)) {
                saveState();
                renderChannels();
                if (activeConversation?.type === "channel" && activeConversation.channel?.id === roomChannel.id) {
                  renderMessages();
                } else {
                  renderServers();
                }
              }
              if (inviteUrl) {
                maybeHandleIncomingXmppCallInvite({
                  conversation: { type: "channel", id: roomChannel.id, channel: roomChannel },
                  peerJid: from || roomJid,
                  invite: {
                    id: inviteId,
                    url: inviteUrl,
                    screenShare: false
                  },
                  history
                });
              }
            }
            if (!ownRoomMessage) {
              showToast(`Incoming XMPP room call invite: ${roomLabel}`);
            }
            return;
          }
          if (["accept", "reject", "retract", "left"].includes(roomCallInvite.action)) {
            const targetSessionId = (inviteId ? (xmppCallSessionIdByInviteId.get(inviteId) || "") : "")
              || latestXmppCallSessionIdForPeer(roomJid, "incoming")
              || latestXmppCallSessionIdForPeer(roomJid, "outgoing");
            const targetSession = targetSessionId ? (xmppCallSessionById.get(targetSessionId) || null) : null;
            if (targetSession && roomCallInvite.action === "accept") {
              targetSession.state = "accepted";
              stopWebCallRingtone(targetSessionId);
            } else if (targetSessionId && ["reject", "retract", "left"].includes(roomCallInvite.action)) {
              stopWebCallRingtone(targetSessionId);
              forgetXmppCallSession(targetSessionId);
            }
            if (inviteId && ["retract", "reject", "left"].includes(roomCallInvite.action)) {
              xmppCallSessionIdByInviteId.delete(inviteId);
            }
            const actionNote = `XMPP room call invite ${roomCallInvite.action}${inviteId ? ` (${inviteId.slice(0, 8)})` : ""}.`;
            if (roomChannel && addSystemMessage(roomChannel, actionNote)) {
              saveState();
              renderChannels();
              if (activeConversation?.type === "channel" && activeConversation.channel?.id === roomChannel.id) {
                renderMessages();
              } else {
                renderServers();
              }
            }
            if (!ownRoomMessage) {
              showToast(`XMPP room call ${roomCallInvite.action}: ${roomLabel}`);
            }
            return;
          }
        }
        if (
          hasSubjectNode
          && !bodyText
          && attachments.length === 0
          && !reactionPayload
          && !retractionTargetId
          && !correctionTargetId
        ) {
          const topicResult = applyXmppRoomTopicFromSubject(roomJid, subjectText);
          if (topicResult.changed) {
            saveState();
            renderChannels();
            const activeConversation = getActiveConversation();
            if (activeConversation?.type === "channel" && activeConversation.channel?.id === topicResult.channel?.id) {
              renderMessages();
            } else {
              renderServers();
            }
          }
          addXmppDebugEvent("message", "Applied XMPP room subject update", {
            roomJid,
            changed: topicResult.changed,
            subject: subjectText || ""
          });
          return;
        }
        if (reactionPayload) {
          const fallbackActorId = occupantId
            ? xmppRoomAliasActorIdForOccupant(roomJid, occupantId)
            : (roomJid && nick
              ? `xmpp-room:${roomJid}/${encodeURIComponent(nick.toLowerCase())}`
              : "");
          let actorUserId = resolveXmppRoomActorUserId(roomJid, nick, stanza, occupantId) || "";
          if (!actorUserId) actorUserId = fallbackActorId;
          const reactionUpdate = {
            actorUserId,
            aliasActorId: fallbackActorId && actorUserId !== fallbackActorId ? fallbackActorId : "",
            emojis: reactionPayload.emojis,
            processingHints,
            stanzaId: stanzaMessageId,
            stanzaRefs
          };
          const reactionResult = applyXmppRoomReactionUpdate(roomJid, reactionPayload.targetId, reactionUpdate);
          const fallbackResult = reactionResult.handled
            ? reactionResult
            : applyXmppReactionFallback(reactionPayload.targetId, reactionUpdate);
          if (fallbackResult.handled) {
            const targetChannelId = fallbackResult.channel?.id || reactionResult.channel?.id || "";
            if (fallbackResult.changed) {
              saveState();
              renderChannels();
              const activeConversation = getActiveConversation();
              if (activeConversation?.type === "channel" && activeConversation.channel?.id === targetChannelId) {
                renderMessages();
              } else {
                renderServers();
              }
            }
            addXmppDebugEvent("message", "Applied XMPP message reactions", {
              scope: fallbackResult.scope || "muc",
              from: roomJid,
              targetId: reactionPayload.targetId,
              id: stanzaMessageId || "",
              emojis: reactionPayload.emojis,
              changed: fallbackResult.changed
            });
            if (roomJid && nick) maybeFetchXmppMucAvatar(roomJid, nick, from);
            return;
          }
          addXmppDebugEvent("message", "Ignored unmatched XMPP message reactions", {
            scope: "muc",
            from: roomJid,
            targetId: reactionPayload.targetId,
            id: stanzaMessageId || ""
          });
          return;
        }
        if (retractionTargetId) {
          const retractionPayload = {
            timestamp,
            editorUserId: "",
            editorName: nick || roomJid.split("@")[0] || "xmpp",
            processingHints,
            stanzaId: stanzaMessageId,
            stanzaRefs
          };
          const retractionResult = applyXmppRoomMessageRetraction(roomJid, retractionTargetId, retractionPayload);
          const fallbackResult = retractionResult.handled
            ? retractionResult
            : applyXmppRetractionFallback(retractionTargetId, retractionPayload);
          if (fallbackResult.handled) {
            const targetChannelId = fallbackResult.channel?.id || retractionResult.channel?.id || "";
            if (fallbackResult.changed) {
              saveState();
              renderChannels();
              const activeConversation = getActiveConversation();
              if (activeConversation?.type === "channel" && activeConversation.channel?.id === targetChannelId) {
                renderMessages();
              } else {
                renderServers();
              }
            }
            addXmppDebugEvent("message", "Applied XMPP message retraction", {
              scope: fallbackResult.scope || "muc",
              from: roomJid,
              targetId: retractionTargetId,
              id: stanzaMessageId || "",
              changed: fallbackResult.changed
            });
            if (roomJid && nick) maybeFetchXmppMucAvatar(roomJid, nick, from);
            return;
          }
          addXmppDebugEvent("message", "Ignored unmatched XMPP message retraction", {
            scope: "muc",
            from: roomJid,
            targetId: retractionTargetId,
            id: stanzaMessageId || ""
          });
          return;
        }
        if (correctionTargetId) {
          const correctionPayload = {
            text,
            attachments,
            timestamp,
            editorUserId: "",
            editorName: nick || roomJid.split("@")[0] || "xmpp",
            processingHints,
            stanzaId: stanzaMessageId,
            stanzaRefs
          };
          const correctionResult = applyXmppRoomMessageCorrection(roomJid, correctionTargetId, correctionPayload);
          const fallbackResult = correctionResult.handled
            ? correctionResult
            : applyXmppCorrectionFallback(correctionTargetId, correctionPayload);
          if (fallbackResult.handled) {
            const targetChannelId = fallbackResult.channel?.id || correctionResult.channel?.id || "";
            if (fallbackResult.changed) {
              saveState();
              renderChannels();
              const activeConversation = getActiveConversation();
              if (activeConversation?.type === "channel" && activeConversation.channel?.id === targetChannelId) {
                renderMessages();
              } else {
                renderServers();
              }
            }
            addXmppDebugEvent("message", "Applied XMPP message correction", {
              scope: fallbackResult.scope || "muc",
              from: roomJid,
              replaceId: correctionTargetId,
              id: stanzaMessageId || "",
              changed: fallbackResult.changed
            });
            if (roomJid && nick) maybeFetchXmppMucAvatar(roomJid, nick, from);
            return;
          }
          addXmppDebugEvent("message", "Ignored unmatched XMPP message correction", {
            scope: "muc",
            from: roomJid,
            replaceId: correctionTargetId,
            id: stanzaMessageId || ""
          });
          return;
        }
        const replyMeta = xmppReplyMetaFromStanza(stanza, roomJid);
        if (!text.trim() && attachments.length === 0 && !replyMeta) return;
        const xmppMessageId = xmppStanzaStableId(stanza) || xmppSyntheticMessageId({
          from,
          ts: timestamp,
          text,
          attachments,
          replyId: replyMeta?.stanzaId || ""
        });
        let authorJid = xmppMucMessageAuthorJid(stanza);
        if (!authorJid && roomJid) {
          const occupant = occupantId
            ? xmppMucOccupantById(roomJid, occupantId)
            : null;
          const fallbackOccupant = occupant || (nick ? xmppMucOccupantByNick(roomJid, nick) : null);
          if (fallbackOccupant?.jid) authorJid = xmppBareJid(fallbackOccupant.jid);
          if (!authorJid && fallbackOccupant?.accountId) {
            const account = getAccountById(fallbackOccupant.accountId);
            authorJid = xmppBareJid(account?.xmppJid || "");
          }
          if (!authorJid && nick) maybeFetchXmppMucAvatar(roomJid, nick, from);
        }
        if (!authorJid && roomJid && nick) {
          authorJid = inferXmppAuthorJidFromRoomHistory(roomJid, nick);
        }
        if (authorJid && roomJid && nick) {
          rememberKnownXmppMucOccupantJid(roomJid, nick, authorJid);
        }
        const inserted = applyRelayIncomingMessage({
          type: "chat",
          room: roomToken,
          clientId: `xmpp:${from}`,
          message: {
            id: xmppMessageId,
            text,
            ts: timestamp,
            authorUsername: nick || roomJid.split("@")[0] || "xmpp",
            authorDisplay: nick || "",
            authorJid,
            xmppOccupantId: occupantId || "",
            xmppRefIds: stanzaRefs,
            xmppEncrypted: encrypted,
            xmppEncryptedType: encryptedInfo.type || "",
            xmppEncryptedLabel: encryptedInfo.label || "",
            xmppProcessingHints: processingHints.hasHints ? { ...processingHints } : null,
            attachments,
            replyTo: replyMeta,
            history,
            allowSelf
          }
        });
        if (inserted && roomJid) {
          const refIds = xmppStanzaReferenceIds(stanza);
          let hydrated = false;
          refIds.forEach((refId) => {
            rememberXmppRoomMessage(roomJid, refId, inserted);
            if (hydrateXmppRepliesForRoom(roomToken, roomJid, refId, inserted)) hydrated = true;
          });
          if (hydrated) {
            saveState();
            if (state.activeChannelId === findXmppRoomChannelByJid(roomJid)?.id) renderMessages();
          }
          xmppResolveDeferredBobForMessage({
            stanza,
            message: inserted,
            from,
            fallbackAttachmentText,
            onUpdated: () => {
              renderChannels();
              const activeChannel = getActiveChannel();
              if (activeChannel?.xmppRoomJid && xmppBareJid(activeChannel.xmppRoomJid) === roomJid) {
                renderMessages();
              } else {
                renderServers();
              }
            }
          });
          if ((encryptedInfo.type === "omemo" || encryptedInfo.type === "omemo2") && authorJid) {
            const ownBare = xmppBareJid(getPreferences().xmppJid || "");
            xmppOmemoTryDecryptIntoMessage({
              stanza,
              message: inserted,
              peerBare: xmppBareJid(authorJid),
              ownBare,
              onUpdated: () => {
                renderChannels();
                const activeChannel = getActiveChannel();
                if (activeChannel?.xmppRoomJid && xmppBareJid(activeChannel.xmppRoomJid) === roomJid) {
                  renderMessages();
                } else {
                  renderServers();
                }
              }
            });
          }
        }
        if (authorJid) applyXmppPhotoStateForJid(authorJid, stanza);
      };
      xmppConnection.addHandler((stanza) => {
        try {
          noteXmppSmInboundStanza(stanza);
          addXmppDebugEvent("message", "Incoming stanza", trimXmppRaw(xmppSerializePayload(stanza)));
          if (xmppHandleBookmarksPubsubEvent(stanza, { account: current, prefs: getPreferences() })) {
            return true;
          }
          const forwarded = xmppMamForwardedMessagesFromStanza(stanza);
          if (forwarded.length > 0) {
            forwarded.forEach((entry) => {
              handleXmppIncomingMessage(entry.message, { fallbackTs: entry.ts, allowSelf: true, history: true });
            });
            return true;
          }
          const carbonForwarded = xmppCarbonForwardedMessagesFromStanza(stanza);
          if (carbonForwarded.length > 0) {
            carbonForwarded.forEach((entry) => {
              handleXmppIncomingMessage(entry.message, {
                fallbackTs: entry.ts,
                allowSelf: entry.allowSelf === true,
                history: false
              });
            });
            return true;
          }
          handleXmppIncomingMessage(stanza, { fallbackTs: "", allowSelf: false });
        } catch {
          addXmppDebugEvent("error", "Malformed incoming XMPP stanza");
          // Ignore malformed XMPP messages.
        }
        return true;
      }, null, "message", null, null, null);
      xmppConnection.addHandler((stanza) => {
        try {
          noteXmppSmInboundStanza(stanza);
          const type = (stanza?.getAttribute("type") || "").toLowerCase();
          if (type !== "set") return true;
          const fromFull = (stanza?.getAttribute("from") || "").toString().trim();
          if (fromFull) xmppRememberPeerFullJid(fromFull);
          const fromBare = xmppBareJid(fromFull);
          const jingle = parseXmppJingleIq(stanza);
          if (!jingle || !fromBare || !jingle.sid) return true;
          addXmppDebugEvent("call", "Incoming Jingle IQ", {
            from: fromBare,
            action: jingle.action || "",
            sid: jingle.sid,
            media: Array.isArray(jingle.media) ? jingle.media : [],
            raw: trimXmppRaw(xmppSerializePayload(stanza))
          });
          xmppSendIqResultForIncomingSet(stanza);
          let existing = xmppCallSessionById.get(jingle.sid) || null;
          if (!existing && jingle.action === "session-initiate") {
            const previousIncomingId = latestXmppCallSessionIdForPeer(fromBare, "incoming");
            const previousIncoming = previousIncomingId ? (xmppCallSessionById.get(previousIncomingId) || null) : null;
            if (previousIncoming && previousIncomingId !== jingle.sid && previousIncoming.inviteSignal === "call-invite") {
              if (previousIncoming.callInviteId) xmppCallSessionIdByInviteId.set(previousIncoming.callInviteId, jingle.sid);
              xmppCallSessionById.delete(previousIncomingId);
              existing = {
                ...previousIncoming,
                id: jingle.sid
              };
            }
          }
          const session = existing || {
            id: jingle.sid,
            peerJid: fromBare,
            peerFullJid: fromFull || "",
            direction: "incoming",
            state: "",
            createdAt: Date.now(),
            media: Array.isArray(jingle.media) ? jingle.media : []
          };
          if (session.acceptTimeoutId) {
            clearTimeout(session.acceptTimeoutId);
            session.acceptTimeoutId = null;
          }
          session.peerJid = fromBare;
          session.peerFullJid = fromFull || session.peerFullJid || "";
          session.localJingleRole = xmppResolveLocalJingleRole({ session, jingle });
          session.remoteJingleRole = session.localJingleRole === "initiator" ? "responder" : "initiator";
          if (Array.isArray(jingle.media) && jingle.media.length > 0) session.media = [...jingle.media];
          if (Array.isArray(jingle.contents) && jingle.contents.length > 0) {
            session.remoteContents = jingle.contents;
            const audioContent = jingle.contents.find((entry) => (entry?.media || "").toString().trim().toLowerCase() === "audio");
            const videoContent = jingle.contents.find((entry) => (entry?.media || "").toString().trim().toLowerCase() === "video");
            if (audioContent) {
              session.remoteMuted = !xmppRemoteSendEnabledForSenders(audioContent.senders || "both", session.localJingleRole || "responder");
            }
            if (videoContent) {
              session.remoteVideoMuted = !xmppRemoteSendEnabledForSenders(videoContent.senders || "both", session.localJingleRole || "responder");
            }
          }
          xmppCallSessionById.set(jingle.sid, session);
          xmppLatestIncomingCallSessionByPeer.set(fromBare, jingle.sid);
          if (jingle.action === "session-initiate") {
            session.state = "incoming-session-initiate";
            const remoteTransport = Array.isArray(jingle.transportUpdates) ? (jingle.transportUpdates[0] || null) : null;
            if (remoteTransport?.ufrag || remoteTransport?.pwd) {
              session.remoteTransport = {
                ufrag: remoteTransport.ufrag || "",
                pwd: remoteTransport.pwd || "",
                setup: remoteTransport.setup || "",
                hash: remoteTransport.hash || "sha-256",
                fingerprint: remoteTransport.fingerprint || ""
              };
            }
            xmppEnsureSessionPeerConnection(jingle.sid, {
              peerJid: fromFull || fromBare,
              media: session.media,
              createLocalOffer: false
            });
            void xmppEnqueueSessionJingleTask(jingle.sid, "session-initiate/prime-offer", () => xmppPrimePeerConnectionFromJingle(jingle.sid, {
              peerJid: fromFull || fromBare,
              media: session.media,
              remoteContents: Array.isArray(jingle.contents) ? jingle.contents : [],
              remoteTransport: session.remoteTransport || null,
              remoteType: "offer",
              localRole: session.localJingleRole || "responder"
            }));
            startWebCallRingtone(jingle.sid);
            xmppSendJingleSessionInfo(session.peerFullJid || fromBare, jingle.sid, { info: "ringing" });
            showIncomingXmppCallPrompt({
              sessionId: jingle.sid,
              peerLabel: fromBare,
              screenShare: false
            });
            showToast(`Incoming XMPP media session from ${fromBare}. Use /callxmpp accept ${jingle.sid.slice(0, 8)} or /callxmpp reject ${jingle.sid.slice(0, 8)}.`);
            if (addSystemDmMessageByPeerJid(fromBare, `Incoming XMPP session-initiate (${jingle.sid.slice(0, 8)}). Use /callxmpp accept ${jingle.sid.slice(0, 8)} or /callxmpp reject ${jingle.sid.slice(0, 8)}.`)) {
              refreshDmUiForPeerJid(fromBare);
            }
            addXmppDebugEvent("iq", "Received XMPP jingle session-initiate", {
              from: fromBare,
              sid: jingle.sid,
              media: (session.media || []).join(",")
            });
            return true;
          }
          if (jingle.action === "session-accept") {
            session.state = "session-accepted";
            const remoteTransport = Array.isArray(jingle.transportUpdates) ? (jingle.transportUpdates[0] || null) : null;
            if (remoteTransport?.ufrag || remoteTransport?.pwd) {
              session.remoteTransport = {
                ufrag: remoteTransport.ufrag || "",
                pwd: remoteTransport.pwd || "",
                setup: remoteTransport.setup || "",
                hash: remoteTransport.hash || "sha-256",
                fingerprint: remoteTransport.fingerprint || ""
              };
            }
            if (Array.isArray(jingle.contents) && jingle.contents.length > 0) {
              session.remoteContents = jingle.contents;
              const audioContent = jingle.contents.find((entry) => (entry?.media || "").toString().trim().toLowerCase() === "audio");
              const videoContent = jingle.contents.find((entry) => (entry?.media || "").toString().trim().toLowerCase() === "video");
              if (audioContent) {
                session.remoteMuted = !xmppRemoteSendEnabledForSenders(audioContent.senders || "both", session.localJingleRole || "responder");
              }
              if (videoContent) {
                session.remoteVideoMuted = !xmppRemoteSendEnabledForSenders(videoContent.senders || "both", session.localJingleRole || "responder");
              }
            }
            xmppEnsureSessionPeerConnection(jingle.sid, {
              peerJid: fromFull || fromBare,
              media: session.media,
              createLocalOffer: false
            });
            void xmppEnqueueSessionJingleTask(jingle.sid, "session-accept/prime-answer", () => xmppPrimePeerConnectionFromJingle(jingle.sid, {
              peerJid: fromFull || fromBare,
              media: session.media,
              remoteContents: Array.isArray(jingle.contents) ? jingle.contents : [],
              remoteTransport: session.remoteTransport || null,
              remoteType: "answer",
              localRole: session.localJingleRole || "responder"
            }));
            if (!session.localTransport || typeof session.localTransport !== "object") {
              session.localTransport = xmppBuildJingleTransportCreds();
            }
            xmppQueueTransportInfoGatherAndSend(xmppResolveSessionPeerJid(session, fromBare), jingle.sid);
            openNativeXmppCallSurface(jingle.sid);
            showToast("XMPP peer accepted media session.");
            if (addSystemDmMessageByPeerJid(fromBare, `Peer accepted XMPP media session (${jingle.sid.slice(0, 8)}).`)) {
              refreshDmUiForPeerJid(fromBare);
            }
            addXmppDebugEvent("iq", "Received XMPP jingle session-accept", {
              from: fromBare,
              sid: jingle.sid
            });
            return true;
          }
          if (jingle.action === "content-modify") {
            const incomingContents = Array.isArray(jingle.contents) ? jingle.contents : [];
            if (incomingContents.length > 0) {
              const current = Array.isArray(session.remoteContents) ? session.remoteContents : [];
              const byKey = new Map(current.map((entry) => [`${entry.name || ""}|${entry.media || ""}`, entry]));
              incomingContents.forEach((entry) => {
                const key = `${entry.name || ""}|${entry.media || ""}`;
                byKey.set(key, {
                  ...(byKey.get(key) || {}),
                  ...entry,
                  payloadTypes: entry.payloadTypes?.length ? entry.payloadTypes : (byKey.get(key)?.payloadTypes || [])
                });
              });
              session.remoteContents = [...byKey.values()];
              session.media = session.remoteContents
                .map((entry) => (entry.media || "").toString().trim().toLowerCase())
                .filter((item) => item === "audio" || item === "video");
              const audioContent = session.remoteContents.find((entry) => (entry?.media || "").toString().trim().toLowerCase() === "audio");
              const videoContent = session.remoteContents.find((entry) => (entry?.media || "").toString().trim().toLowerCase() === "video");
              if (audioContent) {
                session.remoteMuted = !xmppRemoteSendEnabledForSenders(audioContent.senders || "both", session.localJingleRole || "responder");
              }
              if (videoContent) {
                session.remoteVideoMuted = !xmppRemoteSendEnabledForSenders(videoContent.senders || "both", session.localJingleRole || "responder");
              }
            }
            session.state = "content-modified";
            xmppRequestSessionReprime(jingle.sid, {
              peerJid: xmppResolveSessionPeerJid(session, fromBare),
              media: session.media,
              remoteContents: Array.isArray(session.remoteContents) ? session.remoteContents : [],
              remoteTransport: session.remoteTransport || null,
              remoteType: "offer",
              localRole: session.localJingleRole || "responder",
              reason: "content-modify"
            });
            showToast("XMPP media content updated.");
            if (addSystemDmMessageByPeerJid(fromBare, `XMPP content-modify (${jingle.sid.slice(0, 8)}).`)) {
              refreshDmUiForPeerJid(fromBare);
            }
            addXmppDebugEvent("iq", "Received XMPP jingle content-modify", {
              from: fromBare,
              sid: jingle.sid,
              contentCount: Array.isArray(jingle.contents) ? jingle.contents.length : 0
            });
            return true;
          }
          if (jingle.action === "content-remove") {
            const removeTargets = Array.isArray(jingle.contents) ? jingle.contents : [];
            const current = Array.isArray(session.remoteContents) ? session.remoteContents : [];
            const removedMedia = new Set(
              removeTargets
                .map((entry) => (entry.media || "").toString().trim().toLowerCase())
                .filter((item) => item === "audio" || item === "video")
            );
            if (removeTargets.length > 0 && current.length > 0) {
              const removeKeys = new Set(removeTargets.map((entry) => `${entry.name || ""}|${entry.media || ""}`));
              session.remoteContents = current.filter((entry) => !removeKeys.has(`${entry.name || ""}|${entry.media || ""}`));
            }
            session.media = (Array.isArray(session.remoteContents) ? session.remoteContents : [])
              .map((entry) => (entry.media || "").toString().trim().toLowerCase())
              .filter((item) => item === "audio" || item === "video");
            const pcEntry = xmppCallPeerConnectionBySessionId.get(jingle.sid) || null;
            if (pcEntry?.pc && removedMedia.size > 0) {
              pcEntry.pc.getTransceivers().forEach((transceiver) => {
                const kind = (transceiver?.receiver?.track?.kind || transceiver?.sender?.track?.kind || "").toLowerCase();
                if (!kind || !removedMedia.has(kind)) return;
                try {
                  transceiver.stop();
                } catch {
                  // Ignore transceiver stop failures.
                }
              });
            }
            session.state = "content-removed";
            xmppRequestSessionReprime(jingle.sid, {
              peerJid: xmppResolveSessionPeerJid(session, fromBare),
              media: session.media,
              remoteContents: Array.isArray(session.remoteContents) ? session.remoteContents : [],
              remoteTransport: session.remoteTransport || null,
              remoteType: "offer",
              localRole: session.localJingleRole || "responder",
              reason: "content-remove"
            });
            showToast("XMPP media content removed.");
            if (addSystemDmMessageByPeerJid(fromBare, `XMPP content-remove (${jingle.sid.slice(0, 8)}).`)) {
              refreshDmUiForPeerJid(fromBare);
            }
            addXmppDebugEvent("iq", "Received XMPP jingle content-remove", {
              from: fromBare,
              sid: jingle.sid,
              removedCount: removeTargets.length
            });
            return true;
          }
          if (jingle.action === "transport-replace") {
            const firstTransport = Array.isArray(jingle.transportUpdates) ? jingle.transportUpdates[0] : null;
            if (firstTransport?.ufrag || firstTransport?.pwd) {
              session.remoteTransport = {
                ufrag: firstTransport.ufrag || "",
                pwd: firstTransport.pwd || "",
                setup: firstTransport.setup || "",
                hash: firstTransport.hash || "sha-256",
                fingerprint: firstTransport.fingerprint || ""
              };
            }
            const replacementCandidates = Array.isArray(jingle.transportUpdates)
              ? jingle.transportUpdates.flatMap((entry) => Array.isArray(entry?.candidates) ? entry.candidates : [])
              : [];
            session.remoteCandidates = replacementCandidates;
            session.state = "transport-replace-received";
            xmppRequestSessionReprime(jingle.sid, {
              peerJid: xmppResolveSessionPeerJid(session, fromBare),
              media: session.media,
              remoteContents: Array.isArray(jingle.contents) && jingle.contents.length > 0
                ? jingle.contents
                : (Array.isArray(session.remoteContents) ? session.remoteContents : []),
              remoteTransport: session.remoteTransport || null,
              remoteType: "offer",
              localRole: session.localJingleRole || "responder",
              applyCandidates: replacementCandidates,
              forceLocalTransportUpdate: true,
              reason: "transport-replace"
            });
            showToast("XMPP transport replaced for active session.");
            if (addSystemDmMessageByPeerJid(fromBare, `XMPP transport-replace (${jingle.sid.slice(0, 8)}).`)) {
              refreshDmUiForPeerJid(fromBare);
            }
            addXmppDebugEvent("iq", "Received XMPP jingle transport-replace", {
              from: fromBare,
              sid: jingle.sid,
              candidateCount: replacementCandidates.length
            });
            return true;
          }
          if (jingle.action === "session-info") {
            const info = (jingle.info || "").toLowerCase();
            if (info) session.state = `session-info-${info}`;
            if (info === "ringing") {
              showToast("XMPP session is ringing.");
            } else if (info === "mute") {
              session.remoteMuted = true;
            } else if (info === "hold") {
              session.remoteHold = true;
              session.remoteHoldRestore = {
                remoteMuted: Boolean(session.remoteMuted),
                remoteVideoMuted: Boolean(session.remoteVideoMuted)
              };
              session.remoteMuted = true;
              session.remoteVideoMuted = true;
              showToast("Peer placed the call on hold.");
            } else if (info === "active") {
              session.remoteHold = false;
              const restore = session.remoteHoldRestore && typeof session.remoteHoldRestore === "object"
                ? session.remoteHoldRestore
                : {};
              if (typeof restore.remoteMuted === "boolean") session.remoteMuted = restore.remoteMuted;
              if (typeof restore.remoteVideoMuted === "boolean") session.remoteVideoMuted = restore.remoteVideoMuted;
              session.remoteHoldRestore = null;
              showToast("Peer resumed the call.");
            } else if (info) {
              showToast(`XMPP session info: ${info}.`);
              if (info === "unmute" && !session.remoteHold) session.remoteMuted = false;
            }
            if (addSystemDmMessageByPeerJid(fromBare, `XMPP session-info (${jingle.sid.slice(0, 8)}): ${info || "unknown"}.`)) {
              refreshDmUiForPeerJid(fromBare);
            }
            addXmppDebugEvent("iq", "Received XMPP jingle session-info", {
              from: fromBare,
              sid: jingle.sid,
              info: info || ""
            });
            return true;
          }
          if (jingle.action === "transport-info") {
            const firstTransport = Array.isArray(jingle.transportUpdates) ? jingle.transportUpdates[0] : null;
            if (firstTransport?.ufrag || firstTransport?.pwd) {
              session.remoteTransport = {
                ufrag: firstTransport.ufrag || "",
                pwd: firstTransport.pwd || "",
                setup: firstTransport.setup || "",
                hash: firstTransport.hash || "sha-256",
                fingerprint: firstTransport.fingerprint || ""
              };
            }
            const candidateCount = Array.isArray(jingle.transportUpdates)
              ? jingle.transportUpdates.reduce((count, entry) => count + (Number(entry?.candidateCount) || 0), 0)
              : 0;
            session.remoteCandidates = Array.isArray(jingle.transportUpdates)
              ? jingle.transportUpdates.flatMap((entry) => Array.isArray(entry?.candidates) ? entry.candidates : [])
              : [];
            const applyCandidates = session.remoteCandidates;
            if (session.pendingLocalRenegotiation) {
              xmppRequestSessionReprime(jingle.sid, {
                peerJid: xmppResolveSessionPeerJid(session, fromBare),
                media: session.media,
                remoteContents: Array.isArray(session.remoteContents) ? session.remoteContents : [],
                remoteTransport: session.remoteTransport || null,
                remoteType: "offer",
                localRole: session.localJingleRole || "responder",
                applyCandidates,
                reason: "transport-info-queued"
              });
            } else {
              void xmppEnqueueSessionJingleTask(jingle.sid, "transport-info/apply-candidates", () => xmppApplyRemoteIceCandidatesForSession(jingle.sid, applyCandidates)).then((result) => {
                addXmppDebugEvent("runtime", "Applied remote ICE candidates for XMPP session", {
                  sid: jingle.sid,
                  attempted: result?.attempted || 0,
                  applied: result?.applied || 0,
                  queued: result?.queued || 0
                });
              });
            }
            session.state = "transport-info-received";
            const transportNotice = xmppTrackTransportInfoNotice(jingle.sid, candidateCount);
            if (transportNotice.shouldAnnounce) {
              const candidateLabel = transportNotice.totalCandidates === 1 ? "candidate" : "candidates";
              const packetLabel = transportNotice.packetCount === 1 ? "update" : "updates";
              showToast(
                `Received XMPP transport-info (${transportNotice.packetCount} ${packetLabel} · ${transportNotice.totalCandidates} ${candidateLabel}).`
              );
              if (addSystemDmMessageByPeerJid(
                fromBare,
                `Received XMPP transport-info (${jingle.sid.slice(0, 8)} · ${transportNotice.packetCount} ${packetLabel} · ${transportNotice.totalCandidates} ${candidateLabel}).`
              )) {
                refreshDmUiForPeerJid(fromBare);
              }
            }
            addXmppDebugEvent("iq", "Received XMPP jingle transport-info", {
              from: fromBare,
              sid: jingle.sid,
              candidateCount
            });
            return true;
          }
          if (jingle.action === "session-terminate") {
            session.state = "terminated";
            stopWebCallRingtone(jingle.sid);
            clearXmppRemoteTrackWaitHint(jingle.sid);
            xmppCallSessionTaskChainBySessionId.delete(jingle.sid);
            const pendingReprime = xmppCallPendingReprimeBySessionId.get(jingle.sid);
            if (pendingReprime?.timerId) clearTimeout(pendingReprime.timerId);
            xmppCallPendingReprimeBySessionId.delete(jingle.sid);
            xmppCallIceGatherInFlightBySessionId.delete(jingle.sid);
            xmppCallTransportInfoNoticeBySessionId.delete(jingle.sid);
            xmppCallRemoteStreamsBySessionId.delete(jingle.sid);
            stopXmppCallSpeakingMonitor(jingle.sid);
            xmppCloseSessionPeerConnection(jingle.sid);
            clearXmppCallSignalTimeout(jingle.sid);
            if (session.acceptTimeoutId) clearTimeout(session.acceptTimeoutId);
            session.acceptTimeoutId = null;
            session.state = "peer-left";
            session.endedAt = Date.now();
            if (xmppActiveNativeCallSessionId === jingle.sid) {
              renderNativeXmppCallSurface(jingle.sid);
            }
            showToast(`XMPP media session ended${jingle.reason ? ` (${jingle.reason})` : ""}.`);
            if (addSystemDmMessageByPeerJid(fromBare, `XMPP media session terminated (${jingle.sid.slice(0, 8)})${jingle.reason ? ` reason: ${jingle.reason}` : ""}.`)) {
              refreshDmUiForPeerJid(fromBare);
            }
            addXmppDebugEvent("iq", "Received XMPP jingle session-terminate", {
              from: fromBare,
              sid: jingle.sid,
              reason: jingle.reason || ""
            });
            return true;
          }
          addXmppDebugEvent("iq", "Received unsupported XMPP jingle action", {
            from: fromBare,
            sid: jingle.sid,
            action: jingle.action || ""
          });
        } catch {
          addXmppDebugEvent("error", "Jingle IQ handling failed");
        }
        return true;
      }, null, "iq", "set", null, null);
      xmppConnection.addHandler((stanza) => {
        try {
          noteXmppSmInboundStanza(stanza);
          const type = (stanza?.getAttribute("type") || "").toLowerCase();
          if (type !== "get") return true;
          const handled = xmppSendDiscoInfoResultForIncomingGet(stanza);
          if (!handled) return true;
          const from = stanza.getAttribute("from") || "";
          const id = stanza.getAttribute("id") || "";
          addXmppDebugEvent("iq", "Handled XMPP disco#info request", { from, id });
        } catch {
          addXmppDebugEvent("error", "XMPP disco#info handler failed");
        }
        return true;
      }, null, "iq", "get", null, null);
      xmppConnection.addHandler((stanza) => {
        try {
          noteXmppSmInboundStanza(stanza);
          const pingPayload = xmppHandleIncomingPingGet(stanza);
          if (!pingPayload) return true;
          addXmppDebugEvent("iq", "Handled XMPP ping", {
            from: pingPayload.from || "",
            id: pingPayload.id || ""
          });
        } catch {
          addXmppDebugEvent("error", "XMPP ping handler failed");
        }
        return true;
      }, null, "iq", "get", null, null);
      xmppConnection.addHandler((stanza) => {
        try {
          noteXmppSmInboundStanza(stanza);
          const rosterPush = xmppRosterPushPayload(stanza);
          if (!rosterPush) return true;
          const resultAttrs = xmppIqResultAttrsFromStanza(stanza);
          if (resultAttrs && globalThis.$iq) {
            xmppConnection.send(globalThis.$iq(resultAttrs));
          }
          const pushItems = parseXmppRosterItems(stanza);
          addXmppDebugEvent("iq", "Roster push received", { count: pushItems.length });
          syncXmppRosterIntoState(pushItems, getPreferences(), current);
          saveState();
          renderDmList();
          renderServers();
          renderChannels();
        } catch {
          addXmppDebugEvent("error", "Roster push handling failed");
        }
        return true;
      }, null, "iq", "set", null, null);
      xmppConnection.addHandler((stanza) => {
        try {
          noteXmppSmInboundStanza(stanza);
          const from = stanza?.getAttribute("from") || "";
          const type = (stanza?.getAttribute("type") || "").toLowerCase();
          const roomJid = xmppBareJid(from);
          const nick = (from.split("/")[1] || "").toString().trim();
          const prefsSnapshot = getPreferences();
          if (!isXmppMucRoomJid(roomJid, prefsSnapshot)) {
            const ownBare = xmppBareJid(prefsSnapshot.xmppJid || "");
            if (!roomJid || (ownBare && roomJid === ownBare)) return true;
            if (type === "unavailable") xmppForgetPeerFullJid(from);
            else xmppRememberPeerFullJid(from);
            if (type === "subscribe") {
              upsertXmppContactRequest("incoming", roomJid, { source: "presence" });
              addXmppDebugEvent("presence", "Incoming contact request", { jid: roomJid });
              showToast(`Contact request from ${roomJid}`);
              renderDmList();
              return true;
            }
            if (type === "subscribed") {
              clearXmppContactRequest("outgoing", roomJid);
              addXmppDebugEvent("presence", "Contact request accepted", { jid: roomJid });
              renderDmList();
              return true;
            }
            if (type === "unsubscribe" || type === "unsubscribed") {
              clearXmppContactRequest("incoming", roomJid);
              clearXmppContactRequest("outgoing", roomJid);
              addXmppDebugEvent("presence", "Contact request cancelled", { jid: roomJid, type });
              renderDmList();
              return true;
            }
            if (["probe", "error"].includes(type)) return true;
            const nickNode = [...stanza.getElementsByTagName("nick")]
              .find((node) => xmppNodeHasXmlns(node, "http://jabber.org/protocol/nick")) || null;
            const account = ensureAccountByXmppJid(
              roomJid,
              xmppNodeText(nickNode).trim() || nick || roomJid.split("@")[0] || ""
            );
            if (!account) return true;
            const showNode = stanza.getElementsByTagName("show")[0] || null;
            const statusNode = xmppDirectChildByLocalName(stanza, "status");
            const statusText = decodeHtmlEntities(xmppNodeText(statusNode)).trim().slice(0, 180);
            const idleSince = xmppPresenceIdleSince(stanza);
            const nextPresence = type === "unavailable" ? "invisible" : xmppPresenceShowToPresence(showNode);
            const previousPresence = normalizePresence(account.presence || "online");
            const previousIdleSince = toTimestampMs(account.xmppIdleSince || "")
              ? new Date(toTimestampMs(account.xmppIdleSince || "")).toISOString()
              : "";
            const previousLastActiveAt = toTimestampMs(account.xmppLastActiveAt || "")
              ? new Date(toTimestampMs(account.xmppLastActiveAt || "")).toISOString()
              : "";
            const nowIso = new Date().toISOString();
            const idleMs = toTimestampMs(idleSince);
            const previousIdleMs = toTimestampMs(previousIdleSince);
            const previousLastActiveMs = toTimestampMs(previousLastActiveAt);
            let nextIdleSince = "";
            let nextLastActiveAt = previousLastActiveAt;
            if (type === "unavailable") {
              nextIdleSince = "";
              if (!nextLastActiveAt) {
                nextLastActiveAt = idleSince || previousIdleSince || nowIso;
              } else if (idleMs > previousLastActiveMs) {
                nextLastActiveAt = idleSince;
              } else if (previousIdleMs > previousLastActiveMs) {
                nextLastActiveAt = previousIdleSince;
              }
            } else if (idleSince) {
              nextIdleSince = idleSince;
              if (!nextLastActiveAt || idleMs > previousLastActiveMs) {
                nextLastActiveAt = idleSince;
              }
            } else {
              nextIdleSince = "";
              const becameAvailable = nextPresence !== "invisible" && previousPresence === "invisible";
              const presenceChanged = nextPresence !== previousPresence;
              if (becameAvailable || !nextLastActiveAt || (previousIdleSince && !idleSince) || presenceChanged) {
                nextLastActiveAt = nowIso;
              }
            }
            const presenceChanged = nextPresence !== previousPresence;
            const idleChanged = nextIdleSince !== previousIdleSince || nextLastActiveAt !== previousLastActiveAt;
            const previousActivity = (account.activityText || "").toString();
            let activityChanged = false;
            if (presenceChanged) {
              account.presence = nextPresence;
            }
            if (idleChanged) {
              account.xmppIdleSince = nextIdleSince;
              account.xmppLastActiveAt = nextLastActiveAt;
            }
            if (type !== "unavailable") {
              const nextActivity = statusText;
              if (nextActivity !== previousActivity) {
                account.activityText = nextActivity;
                activityChanged = true;
              }
            }
            if (presenceChanged || idleChanged || activityChanged) {
              renderDmList();
              renderMemberList();
              renderMessages();
            }
            const photoState = xmppPresencePhotoState(stanza);
            if (photoState.hasUpdate) {
              if (photoState.hash) xmppAvatarHashByJid.set(roomJid, photoState.hash);
              maybeFetchXmppAvatarForJid(roomJid, {
                photoHash: photoState.hash || "",
                clearAvatar: Boolean(photoState.cleared)
              });
            } else if (!account.avatarUrl) {
              maybeFetchXmppAvatarForJid(roomJid, { photoHash: "" });
            }
            addXmppDebugEvent("presence", "Peer presence updated", {
              jid: roomJid,
              type: type || "available",
              presence: nextPresence,
              idleSince,
              activity: account.activityText || "",
              lastActiveAt: account.xmppLastActiveAt || ""
            });
            return true;
          }
          if (!roomJid || !nick) return true;
          if (type === "error") {
            reportXmppMucJoinError(roomJid, nick, stanza);
            return true;
          }
          const roomToken = xmppRoomByJid.get(roomJid) || `xmpp:${roomJid}`;
          xmppRoomByJid.set(roomJid, roomToken);
          const joinState = xmppMucJoinStateByRoomJid.get(roomJid) || {};
          const ownNick = (joinState.nick || sanitizeChannelName(current?.username || "user", "user")).toLowerCase();
          const joiningOwnNick = nick.toLowerCase() === ownNick;
          if (joiningOwnNick && type !== "unavailable") {
            xmppMucJoinStateByRoomJid.set(roomJid, {
              ...joinState,
              roomToken,
              nick,
              pending: false,
              joinedAt: new Date().toISOString(),
              lastErrorAt: "",
              lastErrorCondition: "",
              lastErrorText: ""
            });
            scheduleXmppMucSelfPing(roomJid, { immediate: false, reason: "own-presence" });
          } else if (joiningOwnNick && type === "unavailable") {
            xmppMucJoinStateByRoomJid.set(roomJid, {
              ...joinState,
              roomToken,
              nick,
              pending: true,
              lastErrorAt: new Date().toISOString(),
              lastErrorCondition: "unavailable"
            });
            xmppRoomByJid.delete(roomJid);
            clearXmppMucSelfPing(roomJid);
          } else if (!joinState.roomToken || joinState.roomToken !== roomToken) {
            xmppMucJoinStateByRoomJid.set(roomJid, {
              ...joinState,
              roomToken
            });
          }
          const synced = upsertXmppRoomChannel(roomJid, {
            roomToken,
            roomName: roomJid.split("@")[0] || "",
            account: current,
            persist: false
          });
          if (synced.created) {
            saveState();
            renderServers();
            renderChannels();
          }
          const mucUserNode = [...stanza.getElementsByTagName("x")]
            .find((node) => (node.getAttribute("xmlns") || "").toLowerCase() === "http://jabber.org/protocol/muc#user") || null;
          const itemNode = mucUserNode ? mucUserNode.getElementsByTagName("item")[0] : null;
          const occupantJid = xmppBareJid(itemNode?.getAttribute("jid") || "");
          const occupantId = xmppOccupantIdFromStanza(stanza);
          const role = (itemNode?.getAttribute("role") || "").toString().trim().toLowerCase();
          const affiliation = (itemNode?.getAttribute("affiliation") || "").toString().trim().toLowerCase();
          const photoState = xmppPresencePhotoState(stanza);
          const occupants = xmppOccupantsByRoomJid.get(roomJid) || new Map();
          if (type === "unavailable") {
            if (occupantJid) occupants.delete(occupantJid);
            for (const [key, value] of [...occupants.entries()]) {
              if (occupantId && (value?.occupantId || "").toString().trim() === occupantId) {
                occupants.delete(key);
                continue;
              }
              if ((value?.nick || "").toString().toLowerCase() === nick.toLowerCase()) {
                occupants.delete(key);
              }
            }
            if (occupants.size > 0) {
              xmppOccupantsByRoomJid.set(roomJid, occupants);
            } else {
              xmppOccupantsByRoomJid.delete(roomJid);
            }
            addXmppDebugEvent("presence", "MUC occupant left", {
              roomJid,
              nick,
              occupantId: occupantId || "",
              jid: occupantJid || "",
              role,
              affiliation
            });
          } else {
            const account = occupantJid
              ? ensureAccountByXmppJid(occupantJid, nick || occupantJid.split("@")[0] || "")
              : null;
            if (account && normalizePresence(account.presence || "online") !== "online") {
              account.presence = "online";
            }
            if (occupantJid) {
              for (const [key, value] of [...occupants.entries()]) {
                if (key === occupantJid) continue;
                if ((value?.nick || "").toString().toLowerCase() === nick.toLowerCase()) {
                  occupants.delete(key);
                }
                if (occupantId && (value?.occupantId || "").toString().trim() === occupantId) {
                  occupants.delete(key);
                }
              }
            } else if (occupantId) {
              for (const [key, value] of [...occupants.entries()]) {
                if ((value?.occupantId || "").toString().trim() !== occupantId) continue;
                occupants.delete(key);
              }
            }
            const occupantKey = occupantJid || (occupantId ? `occupant:${occupantId}` : nick.toLowerCase());
            occupants.set(occupantKey, {
              nick,
              jid: occupantJid,
              role,
              affiliation,
              accountId: account?.id || "",
              occupantId
            });
            xmppOccupantsByRoomJid.set(roomJid, occupants);
            addXmppDebugEvent("presence", "MUC occupant updated", {
              roomJid,
              nick,
              occupantId: occupantId || "",
              jid: occupantJid || "",
              role,
              affiliation
            });
            if (occupantJid) {
              rememberKnownXmppMucOccupantJid(roomJid, nick, occupantJid);
              if (photoState.hash) xmppAvatarHashByJid.set(occupantJid, photoState.hash);
              if (photoState.hasUpdate) {
                maybeFetchXmppAvatarForJid(occupantJid, {
                  photoHash: photoState.hash || "",
                  clearAvatar: Boolean(photoState.cleared)
                });
              } else if (!account?.avatarUrl) {
                maybeFetchXmppAvatarForJid(occupantJid, { photoHash: "" });
              }
            } else if (nick) {
              maybeFetchXmppMucAvatar(roomJid, nick, from);
            }
          }
          const activeRoomJid = xmppBareJid(getActiveChannel()?.xmppRoomJid || "");
          if (activeRoomJid && activeRoomJid === roomJid) {
            renderMemberList();
            renderMessages();
          }
        } catch {
          addXmppDebugEvent("error", "XMPP presence handling failed");
        }
        return true;
      }, null, "presence", null, null, null);
      xmppConnection.addHandler((stanza) => {
        const result = handleXmppSmStanza(stanza, xmppConnection);
        return !result || result.handled !== false;
      }, XMPP_STREAM_MANAGEMENT_NAMESPACE, null, null, null, null);
      xmppConnection.connect(jid, prefs.xmppPassword || "", (status) => {
        const S = globalThis.Strophe.Status;
        const statusName = Object.entries(S || {}).find(([, value]) => value === status)?.[0] || String(status);
        addXmppDebugEvent("connect", "Relay status callback", { status: statusName, wsUrl, jid });
        if (status === S.CONNECTING) {
          clearXmppPingLoop();
          setRelayStatus("connecting");
          return;
        }
        if (status === S.AUTHENTICATING) {
          clearXmppPingLoop();
          setRelayStatus("connecting", "Authenticating");
          return;
        }
        if (status === S.CONNECTED) {
          xmppConnectCount = (Number(xmppConnectCount) || 0) + 1;
          const reconnect = xmppConnectCount > 1;
          resetXmppSmRuntime({ keepSupport: false, reason: reconnect ? "reconnected" : "connected" });
          setRelayStatus("connected");
          void ensureXmppCapsHash();
          sendCurrentXmppPresence();
          refreshXmppCsiCapability(xmppConnection);
          maybeEnableXmppStreamManagement(xmppConnection, {
            allowResume: true,
            reason: reconnect ? "reconnected" : "connected"
          });
          if (reconnect) {
            recoverXmppMamAfterReconnect({ reason: "reconnect" });
          }
          syncXmppClientStateHint({ force: true, reason: "connected" });
          ensureXmppCsiSignalBindings();
          enableXmppCarbons(xmppConnection);
          const ownBare = xmppBareJid(getPreferences().xmppJid || "");
          if (ownBare && xmppOmemoRuntimeAvailable()) {
            void xmppOmemoEnsureOwnBundle(ownBare, { force: false });
          }
          startXmppPingLoop(xmppConnection);
          const initialRoom = relayRoomForActiveConversation();
          const directPeerJid = xmppPeerJidForRelayRoom(initialRoom, current);
          if (directPeerJid) {
            relayJoinedRoom = initialRoom;
            addXmppDebugEvent("presence", "Using direct XMPP DM route for initial conversation", {
              room: initialRoom,
              peerJid: directPeerJid
            });
            const dmMamState = ensureXmppDmMamState(directPeerJid);
            if (dmMamState && dmMamState.pagesLoaded === 0 && !dmMamState.loading) {
              requestXmppDirectHistory(directPeerJid, { reason: "connect", prefetchPages: XMPP_MAM_PREFETCH_PAGES });
            }
          }
          Promise.allSettled([
            fetchXmppRoster(xmppConnection),
            fetchXmppBookmarks(xmppConnection),
            discoverXmppMucRooms({
              connection: xmppConnection,
              prefs: getPreferences(),
              force: false
            })
          ]).then((results) => {
            const rosterItems = results[0]?.status === "fulfilled" ? results[0].value : [];
            const bookmarkItems = results[1]?.status === "fulfilled" ? results[1].value : [];
            const discoveredRooms = results[2]?.status === "fulfilled" ? results[2].value : [];
            const spaceRooms = mergeXmppBookmarks(bookmarkItems, discoveredRooms);
            addXmppDebugEvent("connect", "XMPP sync complete", {
              rosterCount: rosterItems.length,
              bookmarkCount: bookmarkItems.length,
              discoveredRoomCount: discoveredRooms.length,
              mergedSpaceRoomCount: spaceRooms.length
            });
            syncXmppRosterIntoState(rosterItems, getPreferences(), current);
            upsertXmppSpaceChannels(spaceRooms, getPreferences(), current);
            saveState();
            renderServers();
            renderDmList();
            renderChannels();
            if (directPeerJid) return;
            let targetRoom = initialRoom || "";
            const hasExplicitXmppRoom = /^xmpp:/i.test(targetRoom);
            if (!hasExplicitXmppRoom) {
              const preferredBookmark = bookmarkItems.find((entry) => entry?.autojoin && normalizeXmppJid(entry?.jid || ""))
                || bookmarkItems.find((entry) => normalizeXmppJid(entry?.jid || "")) || null;
              if (preferredBookmark?.jid) {
                const bookmarkJid = normalizeXmppJid(preferredBookmark.jid).toLowerCase();
                if (bookmarkJid) targetRoom = `xmpp:${bookmarkJid}`;
              }
            }
            if (!targetRoom) targetRoom = "lobby:general";
            const joined = joinXmppRoom(targetRoom, current);
            relayJoinedRoom = targetRoom;
            addXmppDebugEvent(
              "presence",
              joined ? "Joined initial relay room" : "Failed to join initial relay room",
              { room: targetRoom, peerJid: "" }
            );
          }).catch(() => {
            if (!directPeerJid) {
              const fallbackRoom = initialRoom || "lobby:general";
              joinXmppRoom(fallbackRoom, current);
              relayJoinedRoom = fallbackRoom;
              addXmppDebugEvent("presence", "Joined initial relay room (sync fallback)", {
                room: fallbackRoom,
                peerJid: ""
              });
            }
            // Keep transport connected even if roster/bookmark sync fails.
          });
          return;
        }
        if (status === S.DISCONNECTED) {
          clearXmppPingLoop();
          clearAllXmppMucSelfPings();
          resetXmppSmRuntime({ keepSupport: true, reason: "disconnected" });
          xmppConnection = null;
          if (relayManualDisconnect) {
            setRelayStatus("disconnected");
            return;
          }
          setRelayStatus("error", "XMPP disconnected");
          scheduleRelayReconnect();
          return;
        }
        if (status === S.AUTHFAIL) {
          clearXmppPingLoop();
          clearAllXmppMucSelfPings();
          addXmppDebugEvent("error", "Relay auth failed; auto-reconnect suppressed after AUTHFAIL", {
            wsUrl,
            jid
          });
          setRelayStatus("error", "XMPP authentication failed");
          return;
        }
        if (status === S.CONNFAIL || status === S.ERROR) {
          clearXmppPingLoop();
          clearAllXmppMucSelfPings();
          addXmppDebugEvent("error", "Relay connect/auth failed", {
            status: statusName,
            wsUrl,
            jid
          });
          setRelayStatus("error", status === S.AUTHFAIL ? "XMPP authentication failed" : "XMPP connection failed");
          scheduleRelayReconnect();
        }
      });
    }).catch((error) => {
      addXmppDebugEvent("error", "Relay connect promise rejected", { error: String(error) });
      setRelayStatus("error", String(error));
      scheduleRelayReconnect();
    });
    return true;
  }
  if (prefs.relayMode === "http") {
    if (relayEventSource && !force) return true;
    if (relayEventSource) relayEventSource.close();
    relayEventSource = null;
    relayManualDisconnect = false;
    const room = relayRoomForActiveConversation();
    relayJoinedRoom = room;
    const url = new URL(normalizeRelayUrl(prefs.relayUrl).replace(/^ws:/i, "http:").replace(/^wss:/i, "https:"));
    url.pathname = "/events";
    url.searchParams.set("room", room);
    url.searchParams.set("clientId", relayClientId());
    url.searchParams.set("username", current.username);
    setRelayStatus("connecting");
    try {
      relayEventSource = new EventSource(url.toString());
    } catch (error) {
      setRelayStatus("error", String(error));
      scheduleRelayReconnect();
      return false;
    }
    relayEventSource.addEventListener("open", () => {
      setRelayStatus("connected");
    });
    relayEventSource.addEventListener("message", (event) => {
      let data = null;
      try {
        data = JSON.parse(event.data || "{}");
      } catch {
        return;
      }
      if (!data || typeof data !== "object") return;
      if (data.type === "chat") applyRelayIncomingMessage(data);
      if (data.type === "typing") applyRelayIncomingTyping(data);
    });
    relayEventSource.addEventListener("error", () => {
      if (relayManualDisconnect) return;
      setRelayStatus("error", "HTTP relay stream error");
      scheduleRelayReconnect();
    });
    return true;
  }
  if (prefs.relayMode !== "ws") {
    disconnectRelaySocket({ manual: true });
    return false;
  }
  if (relaySocket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(relaySocket.readyState) && !force) {
    return true;
  }
  if (relaySocket) disconnectRelaySocket({ manual: false });
  relayManualDisconnect = false;
  const url = normalizeRelayUrl(prefs.relayUrl);
  try {
    relaySocket = new WebSocket(url);
  } catch (error) {
    setRelayStatus("error", String(error));
    scheduleRelayReconnect();
    return false;
  }
  setRelayStatus("connecting");
  relaySocket.addEventListener("open", () => {
    setRelayStatus("connected");
    const room = relayRoomForActiveConversation();
    joinRelayRoom(room);
  });
  relaySocket.addEventListener("message", (event) => {
    let data = null;
    try {
      data = JSON.parse(event.data || "{}");
    } catch {
      return;
    }
    if (!data || typeof data !== "object") return;
    if (data.type === "chat") applyRelayIncomingMessage(data);
    if (data.type === "typing") applyRelayIncomingTyping(data);
    if (data.type === "joined" && data.room) relayJoinedRoom = data.room.toString();
  });
  relaySocket.addEventListener("error", () => {
    setRelayStatus("error", "WebSocket error");
  });
  relaySocket.addEventListener("close", () => {
    relaySocket = null;
    if (relayManualDisconnect) {
      setRelayStatus("disconnected");
      return;
    }
    setRelayStatus("error", "Connection closed");
    scheduleRelayReconnect();
  });
  return true;
}

function syncRelayRoomForActiveConversation() {
  const prefs = getPreferences();
  if (!["ws", "http", "xmpp"].includes(prefs.relayMode)) return;
  const nextRoom = relayRoomForActiveConversation();
  if (relayLocalTypingState.room && relayLocalTypingState.room !== nextRoom) {
    publishRelayTypingState(false, {
      force: true,
      room: relayLocalTypingState.room,
      chatState: "inactive"
    });
  }
  if (prefs.relayMode === "xmpp") {
    if (!xmppConnection) return;
    if (!nextRoom || nextRoom === relayJoinedRoom) return;
    const directPeerJid = xmppPeerJidForRelayRoom(nextRoom, getCurrentAccount());
    if (directPeerJid) {
      const dmMamState = ensureXmppDmMamState(directPeerJid);
      if (dmMamState && dmMamState.pagesLoaded === 0 && !dmMamState.loading) {
        requestXmppDirectHistory(directPeerJid, { reason: "switch", prefetchPages: XMPP_MAM_PREFETCH_PAGES });
      }
      relayJoinedRoom = nextRoom;
      publishRelayTypingState(false, { force: true, room: nextRoom, chatState: "active" });
      return;
    }
    const ok = joinXmppRoom(nextRoom, getCurrentAccount());
    if (!ok) return;
    relayJoinedRoom = nextRoom;
    publishRelayTypingState(false, { force: true, room: nextRoom, chatState: "active" });
    return;
  }
  if (prefs.relayMode === "http") {
    if (!nextRoom || nextRoom === relayJoinedRoom) return;
    joinRelayRoom(nextRoom);
    return;
  }
  if (!relaySocket || relaySocket.readyState !== WebSocket.OPEN) return;
  if (!nextRoom || nextRoom === relayJoinedRoom) return;
  joinRelayRoom(nextRoom);
}

function maybeLoadOlderXmppHistoryForActiveConversation({ trigger = "scroll", force = false } = {}) {
  const prefs = getPreferences();
  if (prefs.relayMode !== "xmpp") return false;
  const conversation = getActiveConversation();
  if (!conversation) return false;
  if (conversation.type === "channel" && conversation.channel?.xmppRoomJid) {
    const roomJid = xmppBareJid(conversation.channel.xmppRoomJid);
    if (!roomJid) return false;
    const mamState = ensureXmppMamState(roomJid);
    if (!mamState) return false;
    recoverStaleXmppMamLoading(mamState, { scope: "muc", roomJid, reason: `${trigger}-active-conversation` });
    if (mamState.loading) return false;
    if (!force && mamState.complete) return false;
    if (!force && trigger === "scroll" && ui.messageList.scrollTop > 96) return false;
    const started = requestXmppRoomHistory(roomJid, { reason: trigger, force });
    if (started) renderMessages();
    return started;
  }
  if (conversation.type === "dm" && conversation.thread) {
    const peerJid = xmppPeerJidForDmThread(conversation.thread, getCurrentAccount());
    const barePeer = xmppBareJid(peerJid);
    if (!barePeer) return false;
    const mamState = ensureXmppDmMamState(barePeer);
    if (!mamState) return false;
    recoverStaleXmppMamLoading(mamState, { scope: "dm", peerJid: barePeer, reason: `${trigger}-active-conversation` });
    if (mamState.loading) return false;
    if (!force && mamState.complete) return false;
    if (!force && trigger === "scroll" && ui.messageList.scrollTop > 96) return false;
    const started = requestXmppDirectHistory(barePeer, { reason: trigger, force });
    if (started) renderMessages();
    return started;
  }
  return false;
}
