/*
 * App UI event bindings runtime extracted from app.js.
 * This file is loaded after app.js so it can bind listeners against initialized UI state.
 */

var XEP_XMPP_UI_BINDINGS_RUNTIME_LOCAL = globalThis.SHITCORD67_XEP_XMPP_UI_BINDINGS_RUNTIME || {};
const DM_GENERIC_SLASH_FALLBACK_COMMANDS = new Set([
  "me",
  "shrug",
  "note",
  "spoiler",
  "tableflip",
  "unflip",
  "lenny",
  "roll",
  "timestamp",
  "poll",
  "pollm",
  "closepoll",
  "reopenpoll",
  "pollresults",
  "vote"
]);

const SED_SUB_FLAGS = new Set(["g", "i", "m", "s", "u", "y"]);

function parseSedSubstitution(rawText) {
  const text = (rawText || "").toString();
  if (!text.startsWith("s") || text.length < 3) return null;
  const delimiter = text[1];
  if (!delimiter || /\s/.test(delimiter)) return null;
  let index = 2;
  let part = "";
  let foundPattern = false;
  let foundReplacement = false;
  let pattern = "";
  let replacement = "";
  while (index < text.length) {
    const char = text[index];
    if (char === "\\" && index + 1 < text.length) {
      part += text[index + 1];
      index += 2;
      continue;
    }
    if (char === delimiter) {
      if (!foundPattern) {
        pattern = part;
        part = "";
        foundPattern = true;
        index += 1;
        continue;
      }
      replacement = part;
      foundReplacement = true;
      index += 1;
      break;
    }
    part += char;
    index += 1;
  }
  if (!foundPattern || !foundReplacement || !pattern) return null;
  const flagsRaw = text.slice(index);
  let flags = "";
  flagsRaw.split("").forEach((flag) => {
    if (SED_SUB_FLAGS.has(flag) && !flags.includes(flag)) flags += flag;
  });
  let regex = null;
  try {
    regex = new RegExp(pattern, flags);
  } catch {
    return null;
  }
  return { regex, replacement };
}

function decodeSedReplacement(value = "") {
  return (value || "")
    .toString()
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\\\/g, "\\");
}

function findLastOwnMessage(conversation, account) {
  if (!conversation || !account) return null;
  const bucket = conversation.type === "dm"
    ? conversation.thread?.messages
    : conversation.channel?.messages;
  if (!Array.isArray(bucket)) return null;
  for (let i = bucket.length - 1; i >= 0; i -= 1) {
    const message = bucket[i];
    if (!message || message.userId !== account.id) continue;
    return message;
  }
  return null;
}

function commitMessageEdit(scopedConversation, scopedMessage, editor, nextText) {
  if (!scopedConversation || !scopedMessage || !editor) return { ok: false, reason: "invalid" };
  const isDmConversation = scopedConversation.type === "dm";
  const scopedChannel = isDmConversation ? null : scopedConversation.channel;
  const canManage = !isDmConversation
    && scopedChannel
    && hasServerPermission(getActiveServer(), editor.id, "manageMessages");
  const canEdit = canEditMessageEntry(scopedMessage, {
    isDm: isDmConversation,
    canManageMessages: Boolean(canManage),
    currentUser: editor
  });
  if (!canEdit) return { ok: false, reason: "forbidden" };
  const trimmedNextText = trimTextForConversation(nextText || "", scopedConversation);
  const previousText = (scopedMessage.text || "").toString();
  const textChanged = previousText !== trimmedNextText;
  if (textChanged) {
    if (!Array.isArray(scopedMessage.editHistory)) scopedMessage.editHistory = [];
    scopedMessage.editHistory.unshift({
      editedAt: new Date().toISOString(),
      editorUserId: editor.id,
      editorName: editor.username,
      previousText
    });
    if (scopedMessage.editHistory.length > 25) scopedMessage.editHistory = scopedMessage.editHistory.slice(0, 25);
  }
  scopedMessage.text = trimmedNextText;
  scopedMessage.editedAt = new Date().toISOString();
  scopedMessage.editedByUserId = editor.id;
  scopedMessage.editedByName = editor.username;
  scopedMessage.editedByStaff = Boolean(!isDmConversation && canManage && scopedMessage.userId && scopedMessage.userId !== editor.id);
  if (textChanged && scopedMessage.userId === editor.id) {
    const correction = publishXmppMessageCorrection(scopedConversation, scopedMessage, editor);
    if (!correction.ok && correction.reason === "missing-reference") {
      addXmppDebugEvent("warn", "Skipped XMPP correction sync: missing stanza reference", {
        conversationId: scopedConversation.id,
        messageId: scopedMessage.id
      });
    }
  }
  saveState();
  return { ok: true, changed: textChanged };
}

if (typeof XEP_XMPP_UI_BINDINGS_RUNTIME_LOCAL.bindXmppLoginUiRuntimeBindings === "function") {
  XEP_XMPP_UI_BINDINGS_RUNTIME_LOCAL.bindXmppLoginUiRuntimeBindings();
}

ui.messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  publishRelayTypingState(false, { force: true, chatState: "active" });
  const conversation = getActiveConversation();
  const text = trimTextForConversation((ui.messageInput.value || "").trim(), conversation);
  const account = getCurrentAccount();
  if (!conversation || !account || (!text && composerPendingAttachments.length === 0)) return;
  if (text && composerPendingAttachments.length === 0) {
    const sed = parseSedSubstitution(text);
    if (sed) {
      const target = findLastOwnMessage(conversation, account);
      if (!target) {
        showToast("No recent message to edit.", { tone: "error" });
        return;
      }
      const nextText = (target.text || "").toString().replace(sed.regex, decodeSedReplacement(sed.replacement));
      if (nextText === (target.text || "").toString()) {
        showToast("No match found for substitution.", { tone: "error" });
        return;
      }
      const result = commitMessageEdit(conversation, target, account, nextText);
      if (!result.ok) {
        showToast("You cannot edit that message.", { tone: "error" });
        return;
      }
      ui.messageInput.value = "";
      setComposerDraft(conversation.id, "");
      composerTempLimitConversationId = null;
      composerTempLimitExtra = 0;
      applyComposerInputLimit();
      clearComposerPendingAttachment();
      slashSelectionIndex = 0;
      closeMediaPicker();
      resizeComposerInput();
      renderMessages();
      renderMemberList();
      renderComposerMeta();
      return;
    }
  }
  let handledSlashMessage = null;
  if (conversation.type === "dm" && text.startsWith("/")) {
    const handledDmSlash = typeof XEP_DM_COMMAND_RUNTIME_GLOBAL.handleDmSlashCommandRuntime === "function"
      ? XEP_DM_COMMAND_RUNTIME_GLOBAL.handleDmSlashCommandRuntime({ text, conversation, account })
      : false;
    if (handledDmSlash !== false) return;
    const dmSlashName = (text.slice(1).split(/\s+/, 1)[0] || "").toLowerCase();
    if (DM_GENERIC_SLASH_FALLBACK_COMMANDS.has(dmSlashName)) {
      const beforeCount = Array.isArray(conversation.thread?.messages) ? conversation.thread.messages.length : 0;
      if (handleSlashCommand(text, { id: conversation.id, messages: conversation.thread.messages }, account)) {
        const afterCount = Array.isArray(conversation.thread?.messages) ? conversation.thread.messages.length : 0;
        if (afterCount > beforeCount) {
          handledSlashMessage = conversation.thread.messages[afterCount - 1] || null;
          if (handledSlashMessage) publishRelayDirectMessage(conversation.thread, handledSlashMessage, account);
        }
      }
    }
  }

  if (conversation.type === "channel" && !canCurrentUserPostInChannel(conversation.channel, account)) {
    if (conversation.channel.type === "voice" || conversation.channel.type === "stage") {
      showToast("This channel uses voice controls instead of text messages.", { tone: "error" });
    } else {
      showToast("You do not have permission to send messages in this channel.", { tone: "error" });
    }
    renderComposerMeta();
    return;
  }
  if (conversation.type === "channel") {
    const remainingMs = getChannelSlowmodeRemainingMs(conversation.channel, account.id);
    if (remainingMs > 0) {
      const waitSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
      showToast(`Slowmode active: wait ${waitSeconds}s`, { tone: "error" });
      renderComposerMeta();
      return;
    }
  }

  if (conversation.type === "channel" && text) ensureCurrentUserInActiveServer();
  if (!handledSlashMessage && conversation.type === "channel" && text) {
    const beforeCount = Array.isArray(conversation.channel?.messages) ? conversation.channel.messages.length : 0;
    const handledChannelSlash = handleSlashCommand(text, conversation.channel, account);
    if (handledChannelSlash) {
      const afterCount = Array.isArray(conversation.channel?.messages) ? conversation.channel.messages.length : 0;
      if (afterCount > beforeCount) {
        handledSlashMessage = conversation.channel.messages[afterCount - 1] || null;
        if (handledSlashMessage) publishRelayChannelMessage(conversation.channel, handledSlashMessage, account);
      }
    }
  }

  if (!handledSlashMessage) {
    const nextReply = replyTarget && replyTarget.channelId === conversation.id
      ? {
        messageId: replyTarget.messageId,
        authorName: replyTarget.authorName,
        text: replyTarget.text,
        threadId: replyTarget.threadId || null
      }
      : null;
    const nextMessage = {
      id: createId(),
      userId: account.id,
      authorName: "",
      text,
      ts: new Date().toISOString(),
      reactions: [],
      attachments: composerPendingAttachments.map((entry) => ({
        type: entry.type || "pdf",
        url: entry.url,
        name: entry.name || "file",
        format: entry.format || "image"
      })),
      replyTo: nextReply
    };
    if (conversation.type === "channel" && conversation.channel.type === "forum") {
      if (nextReply?.threadId) {
        nextMessage.forumThreadId = nextReply.threadId;
        nextMessage.forumParentId = nextReply.messageId || nextReply.threadId;
      } else {
        if (!canCurrentUserCreateThreadsInChannel(conversation.channel, getActiveGuild())) {
          showToast("You do not have permission to create forum posts in this channel.", { tone: "error" });
          renderComposerMeta();
          return;
        }
        const [firstLine, ...rest] = text.split("\n");
        nextMessage.forumTitle = (firstLine || "Untitled Post").trim().slice(0, 100) || "Untitled Post";
        nextMessage.text = rest.join("\n").trim();
        const defaultTags = normalizeThreadTagIds(
          getForumThreadTagFilter(conversation.channel.id),
          forumTagsForChannel(conversation.channel)
        );
        if (defaultTags.length > 0) nextMessage.forumTagIds = defaultTags;
      }
    }
    if (conversation.type === "dm") {
      conversation.thread.messages.push(nextMessage);
      publishRelayDirectMessage(conversation.thread, nextMessage, account);
    } else {
      conversation.channel.messages.push(nextMessage);
      recordChannelSlowmodeSend(conversation.channel, account.id);
      publishRelayChannelMessage(conversation.channel, nextMessage, account);
    }
    void triggerHapticFeedback("light");
    replyTarget = null;
    clearComposerPendingAttachment();
    if (swfPipTabs.length > 0 && !(conversation.type === "channel" && conversation.channel.type === "forum")) {
      ui.messageInput.value = "";
      setComposerDraft(conversation.id, "");
      composerTempLimitConversationId = null;
      composerTempLimitExtra = 0;
      applyComposerInputLimit();
      resizeComposerInput();
      slashSelectionIndex = 0;
      closeMediaPicker();
      saveState();
      appendMessageRowLite(conversation.type === "dm" ? conversation.thread : conversation.channel, nextMessage);
      renderChannels();
      renderMemberList();
      return;
    }
  }

  ui.messageInput.value = "";
  setComposerDraft(conversation.id, "");
  composerTempLimitConversationId = null;
  composerTempLimitExtra = 0;
  applyComposerInputLimit();
  clearComposerPendingAttachment();
  slashSelectionIndex = 0;
  closeMediaPicker();
  resizeComposerInput();
  saveState();
  renderMessages();
  renderMemberList();
  renderComposerMeta();
});

ui.messageInput.addEventListener("input", () => {
  const conversation = getActiveConversation();
  const limited = trimTextForConversation(ui.messageInput.value || "", conversation);
  if (limited !== ui.messageInput.value) {
    ui.messageInput.value = limited;
  }
  setComposerDraft(composerDraftConversationId, ui.messageInput.value);
  queueComposerDraftSave();
  resizeComposerInput();
  renderChannels();
  slashSelectionIndex = 0;
  mentionSelectionIndex = 0;
  renderSlashSuggestions();
  updateComposerTypingPublish();
  renderComposerMeta();
});

ui.messageInput.addEventListener("blur", () => {
  publishRelayTypingState(false, { force: true, chatState: "inactive" });
});

ui.messageInput.addEventListener("focus", () => {
  publishRelayTypingState(false, { force: false, chatState: "active" });
});

window.addEventListener("keydown", (event) => {
  if (event.defaultPrevented) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key !== "/") return;
  const conversation = getActiveConversation();
  if (conversation?.id) return;
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
  event.preventDefault();
  setComposerCollapsedState(false);
  ui.messageInput.readOnly = false;
  ui.messageInput.value = "/";
  resizeComposerInput();
  slashSelectionIndex = 0;
  mentionSelectionIndex = 0;
  renderSlashSuggestions();
  renderComposerMeta();
  ui.messageInput.focus();
});

ui.composerCharCount?.addEventListener("click", () => {
  if (composerCharCountClickTimer) {
    clearTimeout(composerCharCountClickTimer);
    composerCharCountClickTimer = null;
  }
  composerCharCountClickTimer = setTimeout(() => {
    composerCharCountClickTimer = null;
    bumpComposerTemporaryLimit();
  }, 220);
});

ui.composerCharCount?.addEventListener("dblclick", async (event) => {
  event.preventDefault();
  if (composerCharCountClickTimer) {
    clearTimeout(composerCharCountClickTimer);
    composerCharCountClickTimer = null;
  }
  await configureDefaultComposerLimit();
});

ui.openMediaPickerBtn.addEventListener("click", () => {
  toggleMediaPicker();
});
ui.openMediaPickerBtn.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  ui.quickAttachInput.click();
});
ui.openMediaPickerBtn.addEventListener("mouseenter", warmMediaPickerRuntimes);
ui.openMediaPickerBtn.addEventListener("focus", warmMediaPickerRuntimes);

ui.openGifPickerBtn?.addEventListener("click", () => {
  openMediaPickerWithTab("gif");
});
ui.openStickerPickerBtn?.addEventListener("click", () => {
  openMediaPickerWithTab("sticker");
});
ui.openEmojiPickerBtn?.addEventListener("click", () => {
  openMediaPickerWithTab("emoji");
});

ui.quickFileAttachBtn.addEventListener("click", () => {
  ui.quickAttachInput.click();
});

ui.quickFileAttachBtn.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  openMediaPickerWithTab("pdf");
});

ui.quickAttachInput.addEventListener("change", async () => {
  const files = [...(ui.quickAttachInput.files || [])];
  if (files.length === 0) return;
  try {
    let attachedCount = 0;
    for (const file of files.slice(0, 6)) {
      const attached = await attachFileToComposer(file);
      if (!attached) continue;
      attachedCount += 1;
    }
    if (attachedCount === 0) {
      showToast("Unsupported attachment type for selected files.", { tone: "error" });
      return;
    }
    showToast(attachedCount > 1 ? `${attachedCount} files attached.` : "Attachment added.");
    ui.messageInput.focus();
  } catch {
    showToast("Failed to attach file.", { tone: "error" });
  } finally {
    ui.quickAttachInput.value = "";
  }
});

ui.clearComposerAttachmentBtn.addEventListener("click", () => {
  clearComposerPendingAttachment();
});

ui.saveComposerAttachmentBtn?.addEventListener("click", () => {
  if (composerPendingAttachments.length === 0) return;
  const ok = saveComposerAttachmentToPicker();
  if (!ok) {
    showToast("Could not save attachment to picker.", { tone: "error" });
    return;
  }
  const tab = pickerTabForAttachmentType(composerPendingAttachments[0]?.type || "pdf");
  showToast(composerPendingAttachments.length > 1 ? "Attachments saved to picker." : "Attachment saved to picker.");
  openMediaPickerWithTab(tab);
});

ui.toggleSwfAudioBtn.addEventListener("click", () => {
  const mode = getPreferences().swfQuickAudioMode;
  if (mode === "off") {
    setSwfQuickAudioMode("click");
    return;
  }
  if (mode === "click") {
    setSwfQuickAudioMode("on");
    return;
  }
  setSwfQuickAudioMode("click");
});

ui.toggleSwfAudioBtn.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  const mode = getPreferences().swfQuickAudioMode;
  if (mode === "off") {
    setSwfQuickAudioMode("click");
    return;
  }
  setSwfQuickAudioMode("off");
});

ui.toggleMediaPrivacyBtn?.addEventListener("click", () => {
  state.preferences = getPreferences();
  const nextMode = state.preferences.mediaPrivacyMode === "off" ? "safe" : "off";
  state.preferences.mediaPrivacyMode = nextMode;
  saveState();
  applyPreferencesToUI();
  if (mediaPickerOpen) renderMediaPicker();
  renderMessages();
  showToast(nextMode === "off" ? "Media privacy gate disabled." : "Media privacy gate enabled.");
});

ui.mediaTabs.forEach((tabBtn) => {
  tabBtn.addEventListener("click", () => {
    const nextTab = tabBtn.dataset.mediaTab;
    if (!MEDIA_TABS.includes(nextTab)) return;
    if (gifPickerQueryDebounceTimer) {
      clearTimeout(gifPickerQueryDebounceTimer);
      gifPickerQueryDebounceTimer = null;
    }
    if (nextTab !== mediaPickerTab) {
      gifPickerVisibleCount = GIF_PICKER_INITIAL_PAGE_SIZE;
      stickerPickerVisibleCount = STICKER_PICKER_INITIAL_PAGE_SIZE;
      emojiPickerVisibleCount = EMOJI_PICKER_INITIAL_PAGE_SIZE;
    }
    mediaPickerTab = nextTab;
    mediaPickerQuery = "";
    renderMediaPicker();
    if (mediaPickerTab === "gif") {
      if (activeGifScope() === "all") maybeLoadMoreGifPickerEntries({ reset: true });
    } else if (mediaPickerTab === "sticker") {
      maybeLoadMoreStickerPickerEntries({ reset: true });
    } else if (mediaPickerTab === "emoji") {
      void ensureEmojiLibraryLoaded();
    }
    ui.mediaSearchInput.focus();
  });
});

ui.mediaSearchInput.addEventListener("input", () => {
  mediaPickerQuery = ui.mediaSearchInput.value.slice(0, 80);
  if (mediaPickerTab === "gif") {
    gifPickerVisibleCount = GIF_PICKER_INITIAL_PAGE_SIZE;
  } else if (mediaPickerTab === "sticker") {
    stickerPickerVisibleCount = STICKER_PICKER_INITIAL_PAGE_SIZE;
  } else if (mediaPickerTab === "emoji") {
    emojiPickerVisibleCount = EMOJI_PICKER_INITIAL_PAGE_SIZE;
  }
  renderMediaPicker();
  if (mediaPickerTab === "gif" || mediaPickerTab === "sticker") {
    if (gifPickerQueryDebounceTimer) clearTimeout(gifPickerQueryDebounceTimer);
    gifPickerQueryDebounceTimer = setTimeout(() => {
      gifPickerQueryDebounceTimer = null;
      if (mediaPickerTab === "gif") {
        if (activeGifScope() === "all") maybeLoadMoreGifPickerEntries({ reset: true });
      } else if (mediaPickerTab === "sticker") {
        maybeLoadMoreStickerPickerEntries({ reset: true });
      }
    }, 220);
  }
});

ui.mediaSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (mediaPickerQuery) {
      event.preventDefault();
      mediaPickerQuery = "";
      if (mediaPickerTab === "gif") gifPickerVisibleCount = GIF_PICKER_INITIAL_PAGE_SIZE;
      if (mediaPickerTab === "sticker") stickerPickerVisibleCount = STICKER_PICKER_INITIAL_PAGE_SIZE;
      if (mediaPickerTab === "emoji") emojiPickerVisibleCount = EMOJI_PICKER_INITIAL_PAGE_SIZE;
      renderMediaPicker();
      if (mediaPickerTab === "gif" && activeGifScope() === "all") maybeLoadMoreGifPickerEntries({ reset: true });
      if (mediaPickerTab === "sticker") maybeLoadMoreStickerPickerEntries({ reset: true });
      if (mediaPickerTab === "emoji") void ensureEmojiLibraryLoaded();
      return;
    }
    closeMediaPicker();
    return;
  }
  if (event.key !== "Enter") return;
  event.preventDefault();
  const [first] = filteredMediaEntries();
  if (!first) return;
  if (mediaPickerTab === "emoji") {
    const value = first.value || "";
    if (value && mediaPickerEmojiOnlyMode && mediaPickerEmojiSelectHandler) {
      mediaPickerEmojiSelectHandler(value, first);
      rememberRecentEmoji(value);
      saveState();
      closeMediaPicker();
      return;
    }
    insertTextAtCursor(value);
    if (value) {
      rememberRecentEmoji(value);
      saveState();
    }
    closeMediaPicker();
    return;
  }
  if (mediaPickerTab === "docs") {
    sendMediaAttachment(first, first.type === "rtf" ? "rtf" : "odf");
    closeMediaPicker();
    return;
  }
  if (mediaPickerTab === "html") {
    sendMediaAttachment(first, "html");
    closeMediaPicker();
    return;
  }
  if (mediaPickerTab === "pdf") {
    sendMediaAttachment(first, "pdf");
    closeMediaPicker();
    return;
  }
  if (mediaPickerTab === "text") {
    sendMediaAttachment(first, "text");
    closeMediaPicker();
    return;
  }
  if (mediaPickerTab === "swf") {
    sendMediaAttachment(first, "swf");
    closeMediaPicker();
    return;
  }
  if (mediaPickerTab === "sticker") {
    sendMediaAttachment(first, "sticker");
    closeMediaPicker();
    return;
  }
  if (mediaPickerTab === "gif") {
    sendMediaAttachment(first, "gif");
    closeMediaPicker();
    return;
  }
  if (mediaPickerTab === "svg") {
    sendMediaAttachment(first, "svg");
    closeMediaPicker();
  }
});

ui.mediaGrid.addEventListener("scroll", () => {
  maybeAutoloadMediaPickerOnScroll();
});

ui.addMediaUrlBtn.addEventListener("click", () => {
  void addMediaFromUrlFlow();
});

ui.addMediaFileBtn.addEventListener("click", () => {
  ui.mediaFileInput.accept = fileAcceptForTab(mediaPickerTab);
  ui.mediaFileInput.click();
});

ui.mediaFileInput.addEventListener("change", async () => {
  const file = ui.mediaFileInput.files?.[0];
  await addMediaFromFileFlow(file);
});

ui.mediaUrlForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const typedName = (ui.mediaUrlNameInput?.value || "").toString();
  const typedUrl = (ui.mediaUrlInput?.value || "").toString().trim();
  if (!typedUrl) {
    showToast("Enter a URL.", { tone: "error" });
    ui.mediaUrlInput?.focus();
    return;
  }
  if (!/^https?:\/\//i.test(typedUrl) && !/^data:/i.test(typedUrl)) {
    showToast("Only http(s) or data URLs are supported.", { tone: "error" });
    ui.mediaUrlInput?.focus();
    return;
  }
  settleMediaUrlDialog({ typedName, typedUrl });
  ui.mediaUrlDialog?.close();
});

ui.mediaUrlCancelBtn?.addEventListener("click", () => {
  settleMediaUrlDialog(null);
  ui.mediaUrlDialog?.close();
});

ui.mediaUrlDialog?.addEventListener("close", () => {
  settleMediaUrlDialog(null);
});

ui.channelFilterInput.addEventListener("input", () => {
  channelFilterTerm = ui.channelFilterInput.value.trim().slice(0, 40);
  renderChannels();
});

ui.channelFilterInput.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  event.preventDefault();
  if (channelFilterTerm) {
    channelFilterTerm = "";
    ui.channelFilterInput.value = "";
    renderChannels();
    return;
  }
  ui.channelFilterInput.blur();
});

ui.dmSearchInput.addEventListener("input", () => {
  dmSearchTerm = ui.dmSearchInput.value.trim().slice(0, 40);
  renderDmList();
});

ui.dmSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && dmSearchTerm) {
    event.preventDefault();
    dmSearchTerm = "";
    ui.dmSearchInput.value = "";
    renderDmList();
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    ui.dmSearchInput.blur();
    return;
  }
  if (event.key !== "Enter") return;
  event.preventDefault();
  const current = getCurrentAccount();
  if (!current) return;
  const rawQuery = dmSearchTerm.trim();
  const query = rawQuery.toLowerCase();
  if (!rawQuery) return;
  const candidate = state.accounts.find((account) => {
    if (!account || account.id === current.id) return false;
    const username = (account.username || "").toLowerCase();
    const display = (account.displayName || "").toLowerCase();
    const xmppJid = normalizeXmppJid(account.xmppJid || "").toLowerCase();
    return username.startsWith(query) || display.startsWith(query) || xmppJid.startsWith(query);
  });
  if (candidate) {
    openDmWithAccount(candidate);
    return;
  }
  if (looksLikeCompleteJid(rawQuery)) {
    const target = openDmByIdentity(rawQuery);
    if (target) return;
  }
  openAddFriendDialog(rawQuery);
});

ui.memberSearchInput?.addEventListener("input", () => {
  memberSearchTerm = ui.memberSearchInput.value.trim().slice(0, 40);
  renderMemberList();
});

ui.memberSearchInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  event.preventDefault();
  if (memberSearchTerm) {
    memberSearchTerm = "";
    ui.memberSearchInput.value = "";
    renderMemberList();
    return;
  }
  ui.memberSearchInput.blur();
});

ui.memberPresenceFilterButtons?.forEach((button) => {
  button.addEventListener("click", () => {
    const next = normalizeMemberPresenceFilter(button.dataset.memberFilter);
    if (memberPresenceFilter === next) return;
    memberPresenceFilter = next;
    renderMemberList();
  });
});

ui.toggleDmSectionBtn?.addEventListener("click", () => {
  toggleDmSectionCollapsed();
});
ui.toggleDmSectionBtn?.addEventListener("contextmenu", (event) => {
  const current = getCurrentAccount();
  const unread = getTotalDmUnreadStats(current);
  openContextMenu(event, [
    {
      label: "New DM",
      action: () => ui.newDmBtn.click()
    },
    {
      label: "Mark All DMs Read",
      disabled: !current || unread.unread === 0,
      action: () => {
        if (!current) return;
        let changed = false;
        state.dmThreads.forEach((thread) => {
          if (!Array.isArray(thread.participantIds) || !thread.participantIds.includes(current.id)) return;
          if (markDmRead(thread, current.id)) changed = true;
        });
        if (!changed) return;
        saveState();
        render();
      }
    }
  ]);
});

ui.toggleGuildSectionBtn?.addEventListener("click", () => {
  toggleGuildSectionCollapsed();
});
ui.toggleGuildSectionBtn?.addEventListener("contextmenu", (event) => {
  const current = getCurrentAccount();
  const guild = getActiveGuild();
  openContextMenu(event, [
    {
      label: "Create Channel",
      disabled: !canCurrentUser("manageChannels"),
      action: () => ui.createChannelBtn.click()
    },
    {
      label: "Mark Guild Read",
      disabled: !guild || !current || getGuildUnreadStats(guild, current).unread === 0,
      action: () => {
        if (!guild || !current) return;
        if (!markGuildRead(guild, current.id)) return;
        saveState();
        renderServers();
        renderChannels();
      }
    }
  ]);
});

ui.messageInput.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" && !ui.messageInput.value.trim()) {
    const last = findLastEditableMessageInActiveConversation();
    if (last) {
      event.preventDefault();
      openMessageEditor(last.conversationId, last.messageId, last.text);
      return;
    }
  }

  if (event.key === "Escape" && !ui.messageInput.value.trim() && composerPendingAttachments.length > 0) {
    event.preventDefault();
    clearComposerPendingAttachment();
    showToast("Attachment cleared.");
    return;
  }

  if (event.ctrlKey && event.shiftKey) {
    if (event.key === "Backspace") {
      event.preventDefault();
      ui.messageInput.value = "";
      clearComposerPendingAttachment();
      replyTarget = null;
      renderReplyComposer();
      setComposerDraft(composerDraftConversationId, "");
      queueComposerDraftSave();
      resizeComposerInput();
      renderComposerMeta();
      renderChannels();
      showToast("Composer cleared.");
      return;
    }
    if (event.key.toLowerCase() === "o") {
      event.preventDefault();
      const start = ui.messageInput.selectionStart ?? 0;
      const end = ui.messageInput.selectionEnd ?? 0;
      const selected = ui.messageInput.value.slice(start, end);
      if (selected) {
        ui.messageInput.setRangeText(`||${selected}||`, start, end, "end");
        return;
      }
      const source = ui.messageInput.value;
      let wordStart = start;
      let wordEnd = end;
      while (wordStart > 0 && !/\s/.test(source[wordStart - 1])) wordStart -= 1;
      while (wordEnd < source.length && !/\s/.test(source[wordEnd])) wordEnd += 1;
      const word = source.slice(wordStart, wordEnd);
      if (word) {
        ui.messageInput.setRangeText(`||${word}||`, wordStart, wordEnd, "end");
      } else {
        ui.messageInput.setRangeText("||||", start, end, "end");
        const caret = start + 2;
        ui.messageInput.setSelectionRange(caret, caret);
      }
      setComposerDraft(composerDraftConversationId, ui.messageInput.value);
      queueComposerDraftSave();
      renderComposerMeta();
      return;
    }
    if (event.key.toLowerCase() === "g") {
      event.preventDefault();
      openMediaPickerWithTab("gif");
      return;
    }
    if (event.key.toLowerCase() === "s") {
      event.preventDefault();
      openMediaPickerWithTab("sticker");
      return;
    }
    if (event.key.toLowerCase() === "e") {
      event.preventDefault();
      openMediaPickerWithTab("emoji");
      return;
    }
  }

  const suggestion = getComposerSuggestionState();
  const popupVisible = suggestion.type !== "none";

  if (event.key === "Escape") {
    if (!ui.messageInput.value.trim() && replyTarget) {
      replyTarget = null;
      renderReplyComposer();
      showToast("Reply canceled.");
      return;
    }
    if (mediaPickerOpen) closeMediaPicker();
    slashSelectionIndex = 0;
    mentionSelectionIndex = 0;
    ui.slashCommandPopup.classList.add("slash-popup--hidden");
    return;
  }
  if (
    event.key === "Enter"
    && (event.ctrlKey || event.metaKey)
    && !event.shiftKey
    && !event.altKey
  ) {
    event.preventDefault();
    ui.messageForm.requestSubmit();
    return;
  }
  if (
    event.key === "Enter"
    && !event.shiftKey
    && !event.ctrlKey
    && !event.metaKey
    && !event.altKey
    && !popupVisible
  ) {
    event.preventDefault();
    ui.messageForm.requestSubmit();
    return;
  }
  if (!popupVisible) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (suggestion.type === "slash") {
      slashSelectionIndex = (slashSelectionIndex + 1) % suggestion.items.length;
    } else {
      mentionSelectionIndex = (mentionSelectionIndex + 1) % suggestion.items.length;
    }
    renderSlashSuggestions();
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (suggestion.type === "slash") {
      slashSelectionIndex = (slashSelectionIndex - 1 + suggestion.items.length) % suggestion.items.length;
    } else {
      mentionSelectionIndex = (mentionSelectionIndex - 1 + suggestion.items.length) % suggestion.items.length;
    }
    renderSlashSuggestions();
    return;
  }
  if (event.key === "Tab" || event.key === "Enter") {
    if (suggestion.type === "slash") {
      const selected = suggestion.items[slashSelectionIndex] || suggestion.items[0];
      const raw = ui.messageInput.value.trim();
      if (
        event.key === "Enter"
        && /^\/[a-z0-9-]+$/i.test(raw)
        && SLASH_COMMANDS.some((entry) => `/${entry.name}` === raw.toLowerCase())
      ) {
        event.preventDefault();
        ui.messageForm.requestSubmit();
        return;
      }
      if (event.key === "Enter" && selected && raw === `/${selected.name}`) {
        event.preventDefault();
        ui.messageForm.requestSubmit();
        return;
      }
      event.preventDefault();
      if (selected && typeof applySlashCompletion === "function") {
        applySlashCompletion(selected.name);
      } else if (selected) {
        ui.messageInput.value = `/${selected.name} `;
        slashSelectionIndex = 0;
        renderSlashSuggestions();
      }
    } else {
      event.preventDefault();
      const selected = suggestion.items[mentionSelectionIndex] || suggestion.items[0];
      if (selected && typeof applyMentionCompletion === "function") {
        applyMentionCompletion(selected);
      }
    }
  }
});

ui.messageInput.addEventListener("paste", (event) => {
  const files = event.clipboardData?.files;
  if (!files || files.length === 0) return;
  event.preventDefault();
  const list = [...files].slice(0, 6);
  void (async () => {
    let attachedCount = 0;
    for (const file of list) {
      const inferred = inferAttachmentTypeFromFile(file);
      const allowed = getComposerAttachAllowedTypes();
      if (!allowed.has(inferred)) continue;
      // eslint-disable-next-line no-await-in-loop
      const attached = await attachFileToComposer(file);
      if (attached) attachedCount += 1;
    }
    if (attachedCount <= 0) return;
    ui.messageInput.focus();
    showToast(attachedCount > 1 ? `${attachedCount} attachments added from clipboard.` : "Attachment added from clipboard.");
  }).catch(() => {
    showToast("Failed to attach clipboard file.", { tone: "error" });
  });
});

ui.messageList.addEventListener("scroll", () => {
  updateJumpToBottomButton();
  maybeLoadOlderXmppHistoryForActiveConversation({ trigger: "scroll" });
});

ui.jumpToBottomBtn?.addEventListener("click", () => {
  ui.messageList.scrollTop = ui.messageList.scrollHeight;
  updateJumpToBottomButton();
});

ui.cancelReplyBtn.addEventListener("click", () => {
  replyTarget = null;
  renderReplyComposer();
  ui.messageInput.focus();
});

ui.createServerBtn.addEventListener("click", () => {
  ui.serverNameInput.value = "";
  if (ui.serverTemplateInput) ui.serverTemplateInput.value = "blank";
  if (ui.serverStarterChannelsInput) ui.serverStarterChannelsInput.checked = true;
  ui.createServerDialog.showModal();
});

ui.serverBrand.addEventListener("click", () => {
  setDmHomeTab("friends");
});

ui.serverBrand.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  const current = getCurrentAccount();
  const dmStats = getTotalDmUnreadStats(current);
  openContextMenu(event, [
    {
      label: "Open DM Home",
      action: () => {
        setDmHomeTab("friends");
      }
    },
    {
      label: "Mark All DMs Read",
      disabled: !current || dmStats.unread === 0,
      action: () => {
        if (!current) return;
        let changed = false;
        state.dmThreads.forEach((thread) => {
          if (!Array.isArray(thread.participantIds) || !thread.participantIds.includes(current.id)) return;
          if (markDmRead(thread, current.id)) changed = true;
        });
        if (!changed) return;
        saveState();
        render();
      }
    }
  ]);
});

ui.dmHomeTabButtons?.forEach((button) => {
  button.addEventListener("click", () => {
    const tab = normalizeDmHomeTab(button.dataset.dmHomeTab || "friends");
    setDmHomeTab(tab);
  });
});

ui.activeChannelName?.addEventListener("click", () => {
  const ref = activeConversationReferenceText();
  if (!ref) return;
  copyText(ref);
  showToast(`Copied ${ref}`);
});

ui.activeServerName.addEventListener("dblclick", () => {
  if (getViewMode() !== "guild") return;
  const guild = getActiveGuild();
  const current = getCurrentAccount();
  if (!guild || !current || !hasServerPermission(guild, current.id, "manageChannels")) return;
  openGuildSettingsDialog(guild);
});

ui.serverCancel.addEventListener("click", () => ui.createServerDialog.close());

ui.createServerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = ui.serverNameInput.value.trim().slice(0, 40);
  const template = (ui.serverTemplateInput?.value || "blank").trim().toLowerCase();
  const withStarterChannels = Boolean(ui.serverStarterChannelsInput?.checked);
  const account = getCurrentAccount();
  if (!name) return;

  const everyoneRole = createRole("@everyone", "#b5bac1", "member");
  const adminRole = createRole("Admin", "#f23f43", "admin");
  const memberRoles = {};
  if (account) memberRoles[account.id] = [everyoneRole.id, adminRole.id];
  const channels = withStarterChannels
    ? buildStarterChannels(template, account?.id || null)
    : buildStarterChannels("blank", account?.id || null);
  const server = {
    id: createId(),
    name,
    description: `${template[0] ? template[0].toUpperCase() + template.slice(1) : "Blank"} guild`,
    accentColor: "#5865f2",
    memberIds: account ? [account.id] : [],
    customEmojis: [],
    customStickers: [],
    customGifs: [],
    customSvgs: [],
    customPdfs: [],
    customTexts: [],
    customDocs: [],
    customSwfs: [],
    customHtmls: [],
    roles: [everyoneRole, adminRole],
    memberRoles,
    channels
  };

  state.guilds.push(server);
  state.activeGuildId = server.id;
  state.activeChannelId = channels[0]?.id || null;
  saveState();
  ui.createServerDialog.close();
  render();
});

ui.createChannelBtn.addEventListener("click", () => {
  if (!canCurrentUser("manageChannels")) {
    notifyPermissionDenied("Manage Channels");
    return;
  }
  ui.channelNameInput.value = "";
  ui.channelTypeInput.value = "text";
  ui.createChannelDialog.showModal();
});

ui.newDmBtn.addEventListener("click", () => {
  openAddFriendDialog(dmSearchTerm || "");
});

ui.addFriendCancelBtn?.addEventListener("click", () => {
  ui.addFriendDialog?.close();
});

ui.addFriendForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const rawIdentity = (ui.addFriendIdentityInput?.value || "").toString().trim();
  const rawDisplay = (ui.addFriendDisplayInput?.value || "").toString().trim();
  if (!rawIdentity) {
    showToast("Enter a username or XMPP JID.", { tone: "error" });
    return;
  }
  const target = openDmByIdentity(rawIdentity, { displayName: rawDisplay });
  if (!target) {
    showToast("Could not add friend or open DM (invalid or self).", { tone: "error" });
    return;
  }
  const wantsXmppRequest = ui.addFriendXmppRequestInput?.checked !== false;
  const hasXmppJid = Boolean(normalizeXmppJid(target.xmppJid || ""));
  let sentXmppRequest = false;
  if (wantsXmppRequest && hasXmppJid) {
    sentXmppRequest = requestXmppRosterSubscription(target, { nameHint: rawDisplay || target.displayName || "" });
  }
  saveState();
  renderDmList();
  renderServers();
  renderChannels();
  ui.addFriendDialog?.close();
  if (hasXmppJid && wantsXmppRequest) {
    showToast(sentXmppRequest
      ? "DM opened and XMPP contact request sent."
      : "DM opened. Connect XMPP relay to send contact request.");
    return;
  }
  showToast("DM opened.");
});

ui.channelCancel.addEventListener("click", () => ui.createChannelDialog.close());

ui.createChannelForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const server = getActiveServer();
  if (!server) return;
  const nextType = ["text", "announcement", "forum", "media", "voice", "stage"].includes(ui.channelTypeInput.value) ? ui.channelTypeInput.value : "text";

  const channel = {
    id: createId(),
    name: sanitizeChannelName(ui.channelNameInput.value, "new-channel"),
    type: nextType,
    topic: "",
    forumTags: nextType === "forum" ? [] : [],
    permissionOverrides: {},
    voiceState: createVoiceState(),
    readState: state.currentAccountId ? { [state.currentAccountId]: new Date().toISOString() } : {},
    slowmodeSec: 0,
    slowmodeState: {},
    messages: []
  };

  server.channels.push(channel);
  state.activeChannelId = channel.id;
  saveState();
  ui.createChannelDialog.close();
  render();
});

ui.editTopicBtn.addEventListener("click", openTopicEditor);
ui.openGuildSettingsBtn?.addEventListener("click", () => {
  const guild = getActiveGuild();
  const current = getCurrentAccount();
  if (!guild || !current || !hasServerPermission(guild, current.id, "manageChannels")) {
    notifyPermissionDenied("Manage Channels");
    return;
  }
  openGuildSettingsDialog(guild);
});
ui.openChannelSettingsBtn.addEventListener("click", openChannelSettings);
ui.openShortcutsBtn?.addEventListener("click", openShortcutsDialog);
ui.openFindBtn?.addEventListener("click", () => {
  if (!state.currentAccountId) return;
  openFindDialog();
});
ui.openCallBtn?.addEventListener("click", () => {
  launchConversationCall({ screenShare: false, autoPost: true });
});
ui.openScreenShareBtn?.addEventListener("click", () => {
  launchConversationCall({ screenShare: true, autoPost: true, allowNative: true });
});
ui.openCallBtn?.addEventListener("contextmenu", (event) => {
  openContextMenu(event, [
    {
      label: "Start Call (Auto)",
      action: () => launchConversationCall({ screenShare: false, autoPost: true, allowNative: true })
    },
    {
      label: "Start Screen Share (Auto)",
      action: () => launchConversationCall({ screenShare: true, autoPost: true, allowNative: true })
    },
    {
      label: "Legacy XMPP",
      disabled: !(getActiveConversation()?.type === "dm"),
      submenu: [
        {
          label: "Start Native Voice/Video",
          action: () => launchNativeXmppConversationCall({ screenShare: false })
        },
        {
          label: "Start Native Screen Share",
          action: () => launchNativeXmppConversationCall({ screenShare: true })
        },
        {
          label: "Check Native Interop",
          action: () => {
            xmppAssessConversationCallInterop(getActiveConversation(), { force: true }).then((interop) => {
              if (interop.ready) {
                showToast(`XMPP call interop ready (${interop.chosenTarget || "target"}).`);
                return;
              }
              const first = interop.details[0]?.evalResult || {};
              const missing = [
                first.hasCore ? "" : "jingle",
                first.hasMedia ? "" : "rtp-media",
                first.hasTransport ? "" : "ice-udp",
                first.hasInvite ? "" : "invite"
              ].filter(Boolean);
              showToast(`XMPP call interop not ready${missing.length > 0 ? ` (${missing.join(", ")})` : ""}.`, { tone: "error", duration: 3000 });
            }).catch(() => {
              showToast("XMPP call interop check failed.", { tone: "error" });
            });
          }
        }
      ]
    },
    {
      label: "Web Fallback",
      submenu: [
        {
          label: "Start Web Voice/Video",
          action: () => launchConversationCall({ screenShare: false, autoPost: true, allowNative: false })
        },
        {
          label: "Start Web Screen Share",
          action: () => launchConversationCall({ screenShare: true, autoPost: true, allowNative: false })
        }
      ]
    },
    {
      label: "Copy Web Call Link",
      action: () => launchConversationCall({ copyOnly: true, autoPost: false, allowNative: false })
    }
  ]);
});
ui.openXmppCallBtn?.addEventListener("click", () => {
  launchNativeXmppConversationCall({ screenShare: false });
});
ui.openXmppCallBtn?.addEventListener("contextmenu", (event) => {
  openContextMenu(event, [
    {
      label: "Start XMPP Voice/Video",
      action: () => launchNativeXmppConversationCall({ screenShare: false })
    },
    {
      label: "Start XMPP Screen Share",
      action: () => launchNativeXmppConversationCall({ screenShare: true })
    },
    {
      label: "Check XMPP Call Interop",
      action: () => {
        xmppAssessConversationCallInterop(getActiveConversation(), { force: true }).then((interop) => {
          if (interop.ready) {
            showToast(`XMPP call interop ready (${interop.chosenTarget || "target"}).`);
            return;
          }
          const first = interop.details[0]?.evalResult || {};
          const missing = [
            first.hasCore ? "" : "jingle",
            first.hasMedia ? "" : "rtp-media",
            first.hasTransport ? "" : "ice-udp",
            first.hasInvite ? "" : "invite"
          ].filter(Boolean);
          showToast(`XMPP call interop not ready${missing.length > 0 ? ` (${missing.join(", ")})` : ""}.`, { tone: "error", duration: 3000 });
        }).catch(() => {
          showToast("XMPP call interop check failed.", { tone: "error" });
        });
      }
    },
    {
      label: "Copy Web Call Link",
      action: () => launchConversationCall({ copyOnly: true, autoPost: false })
    }
  ]);
});
ui.copyCallLinkBtn?.addEventListener("click", () => {
  launchConversationCall({ copyOnly: true, autoPost: false });
});
ui.openWhiteboardBtn?.addEventListener("click", () => {
  launchConversationWhiteboard({ autoPost: false });
});
ui.openWhiteboardBtn?.addEventListener("contextmenu", (event) => {
  openContextMenu(event, [
    {
      label: "Open Whiteboard",
      action: () => launchConversationWhiteboard({ autoPost: false })
    },
    {
      label: "Open Fallback & Post Link",
      action: () => launchConversationWhiteboard({ autoPost: true })
    },
    {
      label: "Copy Whiteboard Link",
      action: () => launchConversationWhiteboard({ copyOnly: true, autoPost: false })
    }
  ]);
});
ui.quickSwitchCancel?.addEventListener("click", () => ui.quickSwitchDialog?.close());
ui.quickSwitchInput?.addEventListener("input", () => {
  quickSwitchQuery = ui.quickSwitchInput.value.slice(0, 80);
  quickSwitchSelectionIndex = 0;
  renderQuickSwitchList();
});
ui.quickSwitchInput?.addEventListener("keydown", (event) => {
  const items = getQuickSwitchItems(quickSwitchQuery);
  if (event.key === "ArrowDown" && items.length > 0) {
    event.preventDefault();
    quickSwitchSelectionIndex = (quickSwitchSelectionIndex + 1) % items.length;
    renderQuickSwitchList();
    return;
  }
  if (event.key === "ArrowUp" && items.length > 0) {
    event.preventDefault();
    quickSwitchSelectionIndex = (quickSwitchSelectionIndex - 1 + items.length) % items.length;
    renderQuickSwitchList();
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    ui.quickSwitchDialog?.close();
  }
});
ui.quickSwitchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const items = getQuickSwitchItems(quickSwitchQuery);
  const selected = items[quickSwitchSelectionIndex] || items[0];
  if (!selected) return;
  if (activateQuickSwitchItem(selected)) {
    ui.quickSwitchDialog?.close();
  }
});
ui.findCancel?.addEventListener("click", () => ui.findDialog?.close());
ui.contextMenu?.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  event.stopPropagation();
});
ui.findInput?.addEventListener("input", () => {
  findQuery = ui.findInput.value.slice(0, 120);
  findSelectionIndex = 0;
  scheduleFindUiRefresh({ rerenderMessages: true, delayMs: 70 });
});
ui.findAuthorInput?.addEventListener("input", () => {
  findAuthorFilter = ui.findAuthorInput.value.slice(0, 32);
  findSelectionIndex = 0;
  scheduleFindUiRefresh({ rerenderMessages: true, delayMs: 70 });
});
ui.findAfterInput?.addEventListener("input", () => {
  findAfterFilter = ui.findAfterInput.value;
  findSelectionIndex = 0;
  scheduleFindUiRefresh({ rerenderMessages: true, delayMs: 70 });
});
ui.findBeforeInput?.addEventListener("input", () => {
  findBeforeFilter = ui.findBeforeInput.value;
  findSelectionIndex = 0;
  scheduleFindUiRefresh({ rerenderMessages: true, delayMs: 70 });
});
ui.findHasLinkInput?.addEventListener("change", () => {
  findHasLinkOnly = Boolean(ui.findHasLinkInput.checked);
  findSelectionIndex = 0;
  scheduleFindUiRefresh({ rerenderMessages: true, delayMs: 0 });
});
ui.findInput?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    moveFindSelection(1);
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    moveFindSelection(-1);
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    ui.findDialog?.close();
  }
});
ui.findPrevBtn?.addEventListener("click", () => moveFindSelection(-1));
ui.findNextBtn?.addEventListener("click", () => moveFindSelection(1));
ui.findForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const conversation = getActiveConversation();
  const matches = getFindMatchesForConversation(conversation, findQuery);
  const selected = matches[findSelectionIndex] || matches[0];
  if (!selected) return;
  findDialogCloseReason = "jump";
  findDialogPendingJumpId = selected.id || "";
  findDialogPendingJumpToast = true;
  ui.findDialog?.close();
});
ui.findDialog?.addEventListener("close", () => {
  const closeReason = findDialogCloseReason;
  const jumpId = findDialogPendingJumpId;
  const jumpToast = findDialogPendingJumpToast;
  findDialogCloseReason = "manual";
  findDialogPendingJumpId = "";
  findDialogPendingJumpToast = false;
  findQuery = "";
  findAuthorFilter = "";
  findAfterFilter = "";
  findBeforeFilter = "";
  findHasLinkOnly = false;
  findSelectionIndex = 0;
  if (ui.findInput) ui.findInput.value = "";
  if (ui.findAuthorInput) ui.findAuthorInput.value = "";
  if (ui.findAfterInput) ui.findAfterInput.value = "";
  if (ui.findBeforeInput) ui.findBeforeInput.value = "";
  if (ui.findHasLinkInput) ui.findHasLinkInput.checked = false;
  if (findRenderTimer) {
    clearTimeout(findRenderTimer);
    findRenderTimer = null;
  }
  resetFindMatchCache();
  renderFindList();
  renderMessages();
  if (closeReason === "jump" && jumpId) {
    focusMessageByIdWithHistory(jumpId, { toastOnLoad: jumpToast });
  }
});
ui.toggleChannelPanelBtn?.addEventListener("click", toggleChannelPanelVisibility);
ui.closeChannelPanelBtn?.addEventListener("click", toggleChannelPanelVisibility);
ui.toggleMemberPanelBtn?.addEventListener("click", toggleMemberPanelVisibility);
ui.toggleSwfShelfBtn.addEventListener("click", () => {
  swfShelfOpen = !swfShelfOpen;
  renderSwfShelf();
});
ui.swfPipCloseBtn.addEventListener("click", () => {
  swfPipManuallyHidden = true;
  renderSwfPipDock();
});
ui.videoPipCloseBtn?.addEventListener("click", () => {
  if (!videoPipActiveKey) return;
  setVideoRuntimePip(videoPipActiveKey, false);
});

/*
 * Additional app-tail UI/runtime bindings extracted from app.js.
 */

function initUiTooltipHints() {
  if (typeof document === "undefined" || !document.body) return;
  if (document.body.dataset.hintsReady === "on") return;
  document.body.dataset.hintsReady = "on";

  const tooltip = document.createElement("div");
  tooltip.className = "ui-tooltip";
  tooltip.hidden = true;
  document.body.appendChild(tooltip);

  const state = {
    target: null,
    showTimer: null,
    hideTimer: null,
    pointerId: null,
    startX: 0,
    startY: 0
  };

  const clearTimers = () => {
    if (state.showTimer) {
      clearTimeout(state.showTimer);
      state.showTimer = null;
    }
    if (state.hideTimer) {
      clearTimeout(state.hideTimer);
      state.hideTimer = null;
    }
  };

  const resolveHintTarget = (node) => {
    if (!(node instanceof Element)) return null;
    return node.closest("[title]");
  };

  const getHintText = (target) => {
    if (!(target instanceof HTMLElement)) return "";
    const direct = (target.getAttribute("title") || "").trim();
    const cached = (target.dataset.hintTitle || "").trim();
    return direct || cached;
  };

  const stashTitle = (target) => {
    if (!(target instanceof HTMLElement)) return;
    const title = target.getAttribute("title");
    if (title && !target.dataset.hintTitle) {
      target.dataset.hintTitle = title;
      target.setAttribute("title", "");
    }
  };

  const restoreTitle = (target) => {
    if (!(target instanceof HTMLElement)) return;
    const cached = target.dataset.hintTitle;
    if (cached && !target.getAttribute("title")) {
      target.setAttribute("title", cached);
    }
  };

  const hideTooltip = () => {
    clearTimers();
    if (state.target) restoreTitle(state.target);
    state.target = null;
    tooltip.classList.remove("ui-tooltip--visible");
    tooltip.hidden = true;
  };

  const showTooltip = (target) => {
    if (!(target instanceof HTMLElement)) return;
    const text = getHintText(target);
    if (!text) return;
    stashTitle(target);
    state.target = target;
    tooltip.textContent = text;
    tooltip.hidden = false;
    tooltip.classList.add("ui-tooltip--visible");
    const rect = target.getBoundingClientRect();
    const tipRect = tooltip.getBoundingClientRect();
    const gutter = 8;
    let left = rect.left + rect.width / 2 - tipRect.width / 2;
    left = Math.max(gutter, Math.min(left, window.innerWidth - tipRect.width - gutter));
    let top = rect.top - tipRect.height - gutter;
    if (top < gutter) {
      top = rect.bottom + gutter;
    }
    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.top = `${Math.round(top)}px`;
  };

  const scheduleShow = (target, delayMs) => {
    clearTimers();
    state.showTimer = setTimeout(() => {
      state.showTimer = null;
      showTooltip(target);
    }, Math.max(0, Number(delayMs) || 0));
  };

  document.addEventListener("pointerover", (event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;
    const target = resolveHintTarget(event.target);
    if (!target) return;
    scheduleShow(target, 420);
  });

  document.addEventListener("pointerout", (event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;
    const related = event.relatedTarget;
    if (state.target && related instanceof Node && state.target.contains(related)) return;
    hideTooltip();
  });

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") return;
    const target = resolveHintTarget(event.target);
    if (!target) return;
    state.pointerId = event.pointerId;
    state.startX = event.clientX;
    state.startY = event.clientY;
    scheduleShow(target, 520);
  });

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "touch") return;
    if (state.pointerId === null || event.pointerId !== state.pointerId) return;
    const moved = Math.hypot(event.clientX - state.startX, event.clientY - state.startY);
    if (moved > 12) hideTooltip();
  }, { passive: true });

  const touchEnd = (event) => {
    if (event.pointerType !== "touch") return;
    if (state.pointerId !== null && event.pointerId !== state.pointerId) return;
    state.pointerId = null;
    if (!tooltip.hidden) {
      clearTimers();
      state.hideTimer = setTimeout(hideTooltip, 1400);
    } else {
      hideTooltip();
    }
  };

  document.addEventListener("pointerup", touchEnd);
  document.addEventListener("pointercancel", touchEnd);
  document.addEventListener("scroll", hideTooltip, true);
  window.addEventListener("resize", hideTooltip, { passive: true });
}

initUiTooltipHints();
ui.swfViewerPauseBtn.addEventListener("click", () => {
  if (!currentViewerRuntimeKey) return;
  setSwfPlayback(currentViewerRuntimeKey, false, "user");
});
ui.swfViewerResumeBtn.addEventListener("click", () => {
  if (!currentViewerRuntimeKey) return;
  setSwfPlayback(currentViewerRuntimeKey, true, "user");
});
ui.swfViewerSaveBtn.addEventListener("click", () => {
  if (!currentViewerSwf) return;
  saveSwfToShelf(currentViewerSwf);
});
ui.swfViewerCloseBtn.addEventListener("click", closeSwfViewerAndRestore);
ui.swfViewerDialog.addEventListener("close", () => {
  if (currentViewerRuntimeKey) {
    closeSwfViewerAndRestore();
  }
});
ui.userPopoutDialog.addEventListener("close", () => {
  selectedUserPopoutId = null;
  userPopoutXmppNeedsRefresh = false;
  userPopoutAvatarHint = "";
  if (ui.userProfileExtendedDialog?.open) ui.userProfileExtendedDialog.close();
  schedulePopoutPresenceRefresh();
});
ui.userProfileExtendedDialog?.addEventListener("close", () => {
  userProfileExtendedAccountId = null;
  userProfileExtendedAvatarHint = "";
  userProfileExtendedTab = "guilds";
});
ui.userPopoutDialog.addEventListener("contextmenu", (event) => {
  const account = selectedUserPopoutId ? getAccountById(selectedUserPopoutId) : null;
  if (!account) return;
  openProfileContextMenu(event, account, { self: false });
});
ui.selfMenuDialog?.addEventListener("contextmenu", (event) => {
  const account = getCurrentAccount();
  if (!account) return;
  openProfileContextMenu(event, account, { self: true });
});
ui.selfMenuDialog?.addEventListener("close", () => {
  selfPopoutXmppNeedsRefresh = false;
  schedulePopoutPresenceRefresh();
});

ui.openRolesBtn.addEventListener("click", () => {
  if (!canCurrentUser("manageRoles")) {
    notifyPermissionDenied("Manage Roles");
    return;
  }
  renderRolesDialog();
  ui.roleNameInput.value = "";
  ui.roleColorInput.value = "";
  if (ui.roleColorPicker) ui.roleColorPicker.value = normalizeColorForPicker("#b5bac1", "#b5bac1");
  ui.rolePermPresetInput.value = "member";
  ui.rolesDialog.showModal();
});

ui.openPinsBtn.addEventListener("click", () => {
  pinsSearchTerm = "";
  pinsSortMode = "latest";
  if (ui.pinsSearchInput) ui.pinsSearchInput.value = "";
  if (ui.pinsSortInput) ui.pinsSortInput.value = "latest";
  renderPinsDialog();
  ui.pinsDialog.showModal();
});
ui.pinsSearchInput?.addEventListener("input", () => {
  pinsSearchTerm = ui.pinsSearchInput.value.slice(0, 80);
  renderPinsDialog();
});
ui.pinsSortInput?.addEventListener("change", () => {
  const next = (ui.pinsSortInput.value || "").toString();
  pinsSortMode = ["latest", "oldest", "author-asc", "author-desc"].includes(next) ? next : "latest";
  renderPinsDialog();
});

ui.markChannelReadBtn?.addEventListener("click", () => {
  const conversation = getActiveConversation();
  const account = getCurrentAccount();
  if (!conversation || !account) return;
  if (conversation.type === "dm") {
    if (!markDmRead(conversation.thread, account.id)) return;
    saveState();
    renderServers();
    renderDmList();
    renderMessages();
    return;
  }
  const channel = getActiveChannel();
  if (!channel || !account) return;
  if (!markChannelRead(channel, account.id)) return;
  saveState();
  renderServers();
  renderChannels();
  renderMessages();
});

ui.markChannelReadBtn?.addEventListener("contextmenu", (event) => {
  const account = getCurrentAccount();
  const guild = getActiveGuild();
  const dm = getActiveDmThread();
  openContextMenu(event, [
    {
      label: "Mark Current Read",
      disabled: !account || (!guild && !dm),
      action: () => {
        if (!account) return;
        if (dm) {
          if (!markDmRead(dm, account.id)) return;
        } else {
          const channel = getActiveChannel();
          if (!channel || !markChannelRead(channel, account.id)) return;
        }
        saveState();
        render();
      }
    },
    {
      label: "Mark Guild Read",
      disabled: !account || !guild,
      action: () => {
        if (!account || !guild) return;
        if (!markGuildRead(guild, account.id)) return;
        saveState();
        render();
      }
    },
    {
      label: "Mark All Read",
      disabled: !account,
      action: () => {
        if (!account) return;
        if (!markAllReadForAccount(account.id)) return;
        saveState();
        render();
      }
    }
  ]);
});

ui.nextUnreadBtn?.addEventListener("click", () => {
  jumpToUnreadGuildChannel(1);
});

ui.topicCancel.addEventListener("click", () => ui.topicDialog.close());

ui.topicForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const channel = getActiveChannel();
  if (!channel) return;
  channel.topic = ui.topicInput.value.trim().slice(0, 140);
  saveState();
  ui.topicDialog.close();
  renderMessages();
});

ui.channelSettingsCancel.addEventListener("click", () => ui.channelSettingsDialog.close());

ui.guildSettingsCancel?.addEventListener("click", () => ui.guildSettingsDialog.close());
ui.guildSettingsAccentInput?.addEventListener("input", () => {
  if (ui.guildSettingsAccentPicker) {
    ui.guildSettingsAccentPicker.value = normalizeColorForPicker(ui.guildSettingsAccentInput.value || "#5865f2", "#5865f2");
  }
});
ui.guildSettingsAccentPicker?.addEventListener("input", () => {
  ui.guildSettingsAccentInput.value = ui.guildSettingsAccentPicker.value;
});
ui.channelPermRoleInput?.addEventListener("change", () => {
  renderChannelPermissionEditor();
});
ui.guildSettingsForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const guild = getActiveGuild();
  if (!guild) return;
  const nextName = ui.guildSettingsNameInput.value.trim().slice(0, 40);
  if (nextName) guild.name = nextName;
  guild.description = ui.guildSettingsDescriptionInput.value.trim().slice(0, 180);
  const rawAccent = ui.guildSettingsAccentInput.value.trim();
  guild.accentColor = /^#[0-9a-f]{3,8}$/i.test(rawAccent) ? rawAccent : "#5865f2";
  saveState();
  ui.guildSettingsDialog.close();
  render();
});
ui.deleteGuildBtn?.addEventListener("click", async () => {
  const guild = getActiveGuild();
  const current = getCurrentAccount();
  if (!guild) return;
  if (!current || !hasServerPermission(guild, current.id, "administrator")) {
    notifyPermissionDenied("Administrator");
    return;
  }
  const guildId = guild.id;
  ui.guildSettingsDialog.close();
  await deleteGuildById(guildId);
});

ui.channelSettingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const server = getActiveServer();
  const channel = getActiveChannel();
  if (!channel || !server) return;
  channel.name = sanitizeChannelName(ui.channelRenameInput.value, channel.name || "general");
  if (ui.channelSlowmodeInput) {
    channel.slowmodeSec = normalizeSlowmodeSeconds(ui.channelSlowmodeInput.value);
    ensureChannelSlowmodeState(channel);
  }
  const roleId = (ui.channelPermRoleInput?.value || "").toString();
  if (roleId) {
    setChannelPermissionOverride(channel, roleId, "viewChannel", ui.channelPermViewInput?.value || "inherit");
    setChannelPermissionOverride(channel, roleId, "sendMessages", ui.channelPermSendInput?.value || "inherit");
    setChannelPermissionOverride(channel, roleId, "addReactions", ui.channelPermReactInput?.value || "inherit");
    setChannelPermissionOverride(channel, roleId, "createThreads", ui.channelPermThreadInput?.value || "inherit");
  }
  saveState();
  ui.channelSettingsDialog.close();
  render();
});

ui.deleteChannelBtn.addEventListener("click", () => {
  const guild = getActiveGuild();
  const channel = getActiveChannel();
  if (!guild || !channel) return;
  if (guild.channels.length <= 1) {
    notifyPermissionDenied("Cannot delete the last channel");
    return;
  }
  guild.channels = guild.channels.filter((entry) => entry.id !== channel.id);
  state.activeChannelId = getFirstOpenableChannelIdForGuild(guild);
  saveState();
  ui.channelSettingsDialog.close();
  render();
});

ui.rolesCloseBtn.addEventListener("click", () => ui.rolesDialog.close());
ui.pinsCloseBtn.addEventListener("click", () => ui.pinsDialog.close());

ui.createRoleNowBtn.addEventListener("click", () => {
  const server = getActiveServer();
  if (!server) return;
  const name = ui.roleNameInput.value.trim().slice(0, 28);
  if (!name) return;
  const color = ui.roleColorInput.value.trim() || "#b5bac1";
  const preset = ui.rolePermPresetInput.value;
  server.roles.push(createRole(name, color, preset));
  saveState();
  renderRolesDialog();
  ui.roleNameInput.value = "";
  ui.roleColorInput.value = "";
  if (ui.roleColorPicker) ui.roleColorPicker.value = normalizeColorForPicker("#b5bac1", "#b5bac1");
});
ui.roleColorInput?.addEventListener("input", () => {
  if (ui.roleColorPicker) {
    ui.roleColorPicker.value = normalizeColorForPicker(ui.roleColorInput.value || "#b5bac1", "#b5bac1");
  }
});
ui.roleColorPicker?.addEventListener("input", () => {
  ui.roleColorInput.value = ui.roleColorPicker.value;
});

ui.assignRoleBtn.addEventListener("click", () => {
  const server = getActiveServer();
  if (!server) return;
  const memberId = ui.assignRoleMemberInput.value;
  const roleId = ui.assignRoleRoleInput.value;
  if (!memberId || !roleId) return;
  if (!server.memberRoles || typeof server.memberRoles !== "object") {
    server.memberRoles = {};
  }
  if (!Array.isArray(server.memberRoles[memberId])) server.memberRoles[memberId] = [];
  if (!server.memberRoles[memberId].includes(roleId)) {
    server.memberRoles[memberId].push(roleId);
  }
  saveState();
});

ui.removeRoleBtn.addEventListener("click", () => {
  const server = getActiveServer();
  if (!server) return;
  const memberId = ui.assignRoleMemberInput.value;
  const roleId = ui.assignRoleRoleInput.value;
  if (!memberId || !roleId) return;
  if (!Array.isArray(server.memberRoles?.[memberId])) return;
  server.memberRoles[memberId] = server.memberRoles[memberId].filter((id) => id !== roleId);
  saveState();
});

ui.messageEditCancel.addEventListener("click", () => {
  messageEditTarget = null;
  ui.messageEditDialog.close();
});

ui.messageEditInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    messageEditTarget = null;
    ui.messageEditDialog.close();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    ui.messageEditForm.requestSubmit();
  }
});

ui.messageEditForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!messageEditTarget) return;
  const editor = getCurrentAccount();
  if (!editor) return;
  let scopedMessage = null;
  let scopedChannel = null;
  let isDmConversation = false;
  let scopedConversation = null;
  const scopedThread = state.dmThreads.find((thread) => thread.id === messageEditTarget.conversationId) || null;
  if (scopedThread) {
    scopedMessage = findMessageInChannel(scopedThread, messageEditTarget.messageId);
    isDmConversation = true;
    scopedConversation = { type: "dm", id: scopedThread.id, thread: scopedThread };
  } else {
    scopedChannel = findChannelById(messageEditTarget.conversationId);
    scopedMessage = findMessageInChannel(scopedChannel, messageEditTarget.messageId);
    if (scopedChannel) scopedConversation = { type: "channel", id: scopedChannel.id, channel: scopedChannel };
  }
  const nextText = trimTextForConversation(ui.messageEditInput.value.trim(), scopedConversation);
  if (!scopedMessage) return;
  const canManage = !isDmConversation && scopedChannel && hasServerPermission(getActiveServer(), editor.id, "manageMessages");
  const canEdit = canEditMessageEntry(scopedMessage, {
    isDm: isDmConversation,
    canManageMessages: Boolean(canManage),
    currentUser: editor
  });
  if (!canEdit) {
    showToast("You cannot edit this message.", { tone: "error" });
    return;
  }
  const previousText = (scopedMessage.text || "").toString();
  const textChanged = previousText !== nextText;
  if (textChanged) {
    if (!Array.isArray(scopedMessage.editHistory)) scopedMessage.editHistory = [];
    scopedMessage.editHistory.unshift({
      editedAt: new Date().toISOString(),
      editorUserId: editor.id,
      editorName: editor.username,
      previousText
    });
    if (scopedMessage.editHistory.length > 25) scopedMessage.editHistory = scopedMessage.editHistory.slice(0, 25);
  }
  scopedMessage.text = nextText;
  scopedMessage.editedAt = new Date().toISOString();
  scopedMessage.editedByUserId = editor.id;
  scopedMessage.editedByName = editor.username;
  scopedMessage.editedByStaff = Boolean(!isDmConversation && canManage && scopedMessage.userId && scopedMessage.userId !== editor.id);
  if (textChanged && scopedConversation && scopedMessage.userId === editor.id) {
    const correction = publishXmppMessageCorrection(scopedConversation, scopedMessage, editor);
    if (!correction.ok && correction.reason === "missing-reference") {
      addXmppDebugEvent("warn", "Skipped XMPP correction sync: missing stanza reference", {
        conversationId: scopedConversation.id,
        messageId: scopedMessage.id
      });
    }
  }
  saveState();
  messageEditTarget = null;
  ui.messageEditDialog.close();
  renderMessages();
});

ui.selfProfileBtn.addEventListener("click", () => {
  renderSelfPopout();
  ui.selfMenuDialog.showModal();
  schedulePopoutPresenceRefresh();
});

ui.selfPresenceSelect?.addEventListener("change", () => {
  const next = normalizePresence(ui.selfPresenceSelect?.value || "online");
  const changed = setCurrentAccountPresence(next, { persist: true, rerender: true, announceXmpp: true });
  if (changed) showToast(`Presence: ${presenceLabel(next)}`);
});

function bindSettingsOpenButton(button) {
  if (!(button instanceof HTMLElement)) return;
  button.addEventListener("click", openSettingsScreen);
  button.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "touch") return;
    event.preventDefault();
    openSettingsScreen();
  });
  button.addEventListener("touchend", (event) => {
    event.preventDefault();
    openSettingsScreen();
  }, { passive: false });
}

bindSettingsOpenButton(ui.openSettingsBtn);
bindSettingsOpenButton(ui.openSettingsBtnMobile);

function initSettingsSwipeNavigation() {
  if (!(ui.settingsScreen instanceof HTMLElement)) return;
  let startX = 0;
  let startY = 0;
  let tracking = false;
  let pointerId = null;
  const minDistance = 60;
  const maxCrossAxis = 42;

  const tabOrder = () => ui.settingsNavItems
    .map((item) => (item.dataset.settingsTab || "").toString())
    .filter(Boolean);

  const moveBy = (delta) => {
    const order = tabOrder();
    if (order.length === 0) return;
    const active = ui.settingsNavItems.find((item) => item.classList.contains("active"));
    const current = active?.dataset?.settingsTab || order[0];
    const index = Math.max(0, order.indexOf(current));
    const nextIndex = Math.max(0, Math.min(order.length - 1, index + delta));
    if (order[nextIndex] && order[nextIndex] !== current) {
      setSettingsTab(order[nextIndex]);
    }
  };

  ui.settingsScreen.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") return;
    if (document.body?.dataset?.mobile !== "on") return;
    if (!(event.target instanceof HTMLElement)) return;
    if (!ui.settingsScreen.classList.contains("settings-screen--active")) return;
    if (!event.target.closest(".settings-content")) return;
    if (event.target.closest("input, textarea, select, button")) return;
    tracking = true;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
  });

  ui.settingsScreen.addEventListener("pointermove", (event) => {
    if (!tracking || event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      event.preventDefault();
    }
  });

  const finish = (event) => {
    if (!tracking || event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    tracking = false;
    pointerId = null;
    if (Math.abs(dx) < minDistance) return;
    if (Math.abs(dy) > maxCrossAxis) return;
    moveBy(dx > 0 ? -1 : 1);
  };

  ui.settingsScreen.addEventListener("pointerup", finish);
  ui.settingsScreen.addEventListener("pointercancel", finish);
}

initSettingsSwipeNavigation();

ui.closeSettingsBtn.addEventListener("click", closeSettingsScreen);

ui.settingsNavItems.forEach((item) => {
  item.addEventListener("click", () => setSettingsTab(item.dataset.settingsTab));
});

ui.settingsEditProfile.addEventListener("click", () => {
  closeSettingsScreen();
  openProfileEditor();
});

ui.settingsOpenProfileEditor.addEventListener("click", () => {
  closeSettingsScreen();
  openProfileEditor();
});

ui.settingsSwitchAccount.addEventListener("click", () => {
  closeSettingsScreen();
  selectedSwitchAccountId = state.currentAccountId;
  renderAccountSwitchList();
  ui.newAccountInput.value = "";
  ui.accountSwitchDialog.showModal();
});

ui.settingsLogout.addEventListener("click", () => {
  disconnectRelaySocket({ manual: true });
  state.currentAccountId = null;
  clearRememberedAccountSession();
  closeSettingsScreen();
  saveState();
  render();
});

if (typeof XEP_XMPP_UI_BINDINGS_RUNTIME_LOCAL.bindXmppSettingsUiRuntimeBindings === "function") {
  XEP_XMPP_UI_BINDINGS_RUNTIME_LOCAL.bindXmppSettingsUiRuntimeBindings();
}

ui.importDataInput.addEventListener("change", async () => {
  const file = ui.importDataInput.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    state = migrateState(parsed);
    saveState();
    render();
    closeSettingsScreen();
  } catch {
    const channel = getActiveChannel();
    if (channel) {
      addSystemMessage(channel, "Import failed: invalid JSON snapshot.");
      saveState();
      renderMessages();
    }
  } finally {
    ui.importDataInput.value = "";
  }
});

ui.importSwfSavesInput.addEventListener("change", async () => {
  const file = ui.importSwfSavesInput.files?.[0];
  if (!file) return;
  try {
    const content = await file.text();
    const parsed = JSON.parse(content);
    const entries = Array.isArray(parsed?.entries) ? parsed.entries : [];
    let imported = 0;
    entries.forEach((entry) => {
      if (!entry || typeof entry.key !== "string" || typeof entry.value !== "string") return;
      localStorage.setItem(entry.key, entry.value);
      imported += 1;
    });
    addDebugLog("info", "Imported SWF save entries", { imported });
    await showInAppAlertDialog({
      title: "SWF saves imported",
      message: `Imported ${imported} SWF save entr${imported === 1 ? "y" : "ies"}.`
    });
  } catch {
    await showInAppAlertDialog({
      title: "SWF import failed",
      message: "Failed to import SWF saves JSON."
    });
  } finally {
    ui.importSwfSavesInput.value = "";
  }
});

ui.dockMuteBtn.addEventListener("click", () => {
  state.preferences = getPreferences();
  state.preferences.mute = state.preferences.mute === "on" ? "off" : "on";
  saveState();
  applyPreferencesToUI();
});

ui.dockHeadphonesBtn.addEventListener("click", () => {
  state.preferences = getPreferences();
  state.preferences.deafen = state.preferences.deafen === "on" ? "off" : "on";
  saveState();
  applyPreferencesToUI();
});

ui.selfEditProfile.addEventListener("click", () => {
  ui.selfMenuDialog.close();
  openProfileEditor();
});

ui.selfCosmeticsShop?.addEventListener("click", () => {
  ui.selfMenuDialog.close();
  openCosmeticsDialog("decor");
});

ui.selfQuestStats?.addEventListener("click", () => {
  const account = getCurrentAccount();
  if (!account) return;
  showToast(formatQuestSummaryText(account.id));
  ui.selfMenuDialog.close();
});

ui.selfSwitchAccount.addEventListener("click", () => {
  ui.selfMenuDialog.close();
  selectedSwitchAccountId = state.currentAccountId;
  renderAccountSwitchList();
  ui.newAccountInput.value = "";
  ui.accountSwitchDialog.showModal();
});

ui.selfLogout.addEventListener("click", () => {
  disconnectRelaySocket({ manual: true });
  state.currentAccountId = null;
  clearRememberedAccountSession();
  ui.selfMenuDialog.close();
  saveState();
  render();
});

ui.userStartDmBtn.addEventListener("click", () => {
  const target = selectedUserPopoutId ? getAccountById(selectedUserPopoutId) : null;
  if (!target) return;
  ui.userPopoutDialog.close();
  openDmWithAccount(target);
});

ui.userSendDmBtn.addEventListener("click", () => {
  const target = selectedUserPopoutId ? getAccountById(selectedUserPopoutId) : null;
  if (!target) return;
  const sent = sendDirectMessageToAccount(target, ui.userDmInput.value);
  if (!sent) return;
  ui.userDmInput.value = "";
  ui.userPopoutDialog.close();
});

ui.userDmInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  ui.userSendDmBtn.click();
});

ui.userPopoutAvatar?.addEventListener("click", () => {
  const account = selectedUserPopoutId ? getAccountById(selectedUserPopoutId) : null;
  if (!account) return;
  openUserProfileExtendedDialog(account, {
    avatarUrlHint: avatarUrlHintFromElement(ui.userPopoutAvatar)
  });
});

ui.userPopoutAvatar?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  ui.userPopoutAvatar?.click();
});

ui.userSaveNoteBtn.addEventListener("click", () => {
  const current = getCurrentAccount();
  if (!current || !selectedUserPopoutId) return;
  setUserNote(current.id, selectedUserPopoutId, ui.userNoteInput.value);
  saveState();
});

ui.userProfileExtendedTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const next = (tab.dataset.profileExtendedTab || "").toString();
    if (!["guilds", "friends"].includes(next)) return;
    userProfileExtendedTab = next;
    renderUserProfileExtendedDialog();
  });
});

ui.userProfileExtendedAvatarBtn?.addEventListener("click", () => {
  openExtendedProfileAvatarLightbox();
});

ui.userProfileExtendedCloseBtn?.addEventListener("click", () => {
  ui.userProfileExtendedDialog?.close();
});

ui.profileCancel.addEventListener("click", () => ui.profileDialog.close());
ui.profileOpenCosmeticsBtn?.addEventListener("click", () => openCosmeticsDialog("decor"));

ui.cosmeticsTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    cosmeticsTab = normalizeCosmeticsTab(tab.dataset.cosmeticsTab);
    renderCosmeticsDialog();
  });
});

ui.cosmeticsCloseBtn?.addEventListener("click", () => ui.cosmeticsDialog?.close());
ui.cosmeticsDialog?.addEventListener("close", () => {
  clearCosmeticsFeaturedRefreshTimer();
});
ui.guildTagInfoCloseBtn?.addEventListener("click", () => ui.guildTagInfoDialog?.close());

ui.profileAvatarUploadBtn.addEventListener("click", () => {
  ui.profileAvatarFileInput.click();
});

ui.profileAvatarClearBtn.addEventListener("click", () => {
  ui.profileAvatarUrlInput.value = "";
  ui.profileAvatarFileInput.value = "";
  setProfileAvatarUploadHint("Avatar image cleared.");
  renderProfileAvatarPreview();
  renderProfileIdentityPreview();
});

ui.profileAvatarInput.addEventListener("input", renderProfileAvatarPreview);
ui.profileAvatarInput.addEventListener("input", () => {
  if (ui.profileAvatarColorPicker) {
    ui.profileAvatarColorPicker.value = normalizeColorForPicker(ui.profileAvatarInput.value || "#57f287", "#57f287");
  }
  renderProfileIdentityPreview();
});
ui.profileAvatarColorPicker?.addEventListener("input", () => {
  ui.profileAvatarInput.value = ui.profileAvatarColorPicker.value;
  renderProfileAvatarPreview();
  renderProfileIdentityPreview();
});
ui.profileGuildAvatarInput?.addEventListener("input", () => {
  if (ui.profileGuildAvatarColorPicker) {
    ui.profileGuildAvatarColorPicker.value = normalizeColorForPicker(ui.profileGuildAvatarInput.value || "#57f287", "#57f287");
  }
});
ui.profileGuildAvatarColorPicker?.addEventListener("input", () => {
  ui.profileGuildAvatarInput.value = ui.profileGuildAvatarColorPicker.value;
});
ui.profileAvatarUrlInput.addEventListener("input", renderProfileAvatarPreview);
ui.profileAvatarUrlInput.addEventListener("input", renderProfileIdentityPreview);
ui.displayNameInput?.addEventListener("input", renderProfileIdentityPreview);
ui.profileStatusInput?.addEventListener("input", renderProfileIdentityPreview);
ui.profileStatusEmojiInput?.addEventListener("input", renderProfileIdentityPreview);
ui.profileBannerInput?.addEventListener("input", renderProfileIdentityPreview);
ui.profileAvatarDecorationInput?.addEventListener("input", renderProfileIdentityPreview);
ui.profileGuildTagInput?.addEventListener("input", renderProfileIdentityPreview);
ui.profileEffectInput?.addEventListener("change", renderProfileIdentityPreview);
ui.profileNameplateSvgInput?.addEventListener("input", renderProfileIdentityPreview);
ui.presenceInput?.addEventListener("change", renderProfileIdentityPreview);
ui.profileIdentityClearBtn?.addEventListener("click", () => {
  if (ui.profileAvatarDecorationInput) ui.profileAvatarDecorationInput.value = "";
  if (ui.profileGuildTagInput) ui.profileGuildTagInput.value = "";
  if (ui.profileEffectInput) ui.profileEffectInput.value = "none";
  if (ui.profileNameplateSvgInput) ui.profileNameplateSvgInput.value = "";
  renderProfileIdentityPreview();
});

ui.profileAvatarFileInput.addEventListener("change", async () => {
  const file = ui.profileAvatarFileInput.files?.[0];
  await applyProfileAvatarFile(file);
  ui.profileAvatarFileInput.value = "";
  renderProfileIdentityPreview();
});

ui.profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const account = getCurrentAccount();
  const guild = getActiveGuild();
  if (!account) return;

  account.displayName = ui.displayNameInput.value.trim().slice(0, 32) || account.username;
  account.bio = ui.profileBioInput.value.trim().slice(0, 180);
  account.customStatus = ui.profileStatusInput.value.trim().slice(0, 80);
  account.customStatusEmoji = ui.profileStatusEmojiInput.value.trim().slice(0, 4);
  account.avatarDecoration = ui.profileAvatarDecorationInput.value.trim().slice(0, 4);
  account.profileEffect = normalizeProfileEffect(ui.profileEffectInput.value);
  account.profileNameplateSvg = ui.profileNameplateSvgInput.value.trim().slice(0, 280);
  account.customStatusExpiresAt = account.customStatus
    ? parseStatusExpiryAt(ui.profileStatusExpiryInput.value)
    : null;
  if (!account.customStatus) account.customStatusEmoji = "";
  account.presence = normalizePresence(ui.presenceInput.value);
  account.banner = ui.profileBannerInput.value.trim();
  account.avatarColor = ui.profileAvatarInput.value.trim() || "#57f287";
  const avatarUrl = ui.profileAvatarUrlInput.value.trim();
  account.avatarUrl = isRenderableAvatarUrl(avatarUrl) ? avatarUrl : "";
  const prevGuildTag = account.guildTag || "";
  const nextGuildTag = ui.profileGuildTagInput.value.trim().slice(0, 8).toUpperCase();
  account.guildTag = nextGuildTag;
  if (!nextGuildTag) {
    account.guildTagGuildId = "";
  } else if (guild && Array.isArray(guild.memberIds) && guild.memberIds.includes(account.id)) {
    account.guildTagGuildId = guild.id;
  } else if (nextGuildTag !== prevGuildTag) {
    account.guildTagGuildId = "";
  }
  if (!account.guildProfiles || typeof account.guildProfiles !== "object") account.guildProfiles = {};
  if (guild) {
    const guildNickname = ui.profileGuildNicknameInput.value.trim().slice(0, 32);
    const guildAvatarColor = ui.profileGuildAvatarInput.value.trim();
    const guildAvatarUrlRaw = ui.profileGuildAvatarUrlInput.value.trim();
    const guildAvatarUrl = isRenderableAvatarUrl(guildAvatarUrlRaw) ? guildAvatarUrlRaw : "";
    const guildBanner = ui.profileGuildBannerInput.value.trim();
    const guildStatus = ui.profileGuildStatusInput.value.trim().slice(0, 80);
    if (guildNickname) {
      account.guildProfiles[guild.id] = { ...(account.guildProfiles[guild.id] || {}), nickname: guildNickname };
    }
    if (guildAvatarColor) {
      account.guildProfiles[guild.id] = { ...(account.guildProfiles[guild.id] || {}), avatarColor: guildAvatarColor };
    }
    if (guildAvatarUrl) {
      account.guildProfiles[guild.id] = { ...(account.guildProfiles[guild.id] || {}), avatarUrl: guildAvatarUrl };
    } else if (account.guildProfiles[guild.id]) {
      delete account.guildProfiles[guild.id].avatarUrl;
    }
    if (guildBanner) {
      account.guildProfiles[guild.id] = { ...(account.guildProfiles[guild.id] || {}), banner: guildBanner };
    } else if (account.guildProfiles[guild.id]) {
      delete account.guildProfiles[guild.id].banner;
    }
    if (guildStatus) {
      account.guildProfiles[guild.id] = {
        ...(account.guildProfiles[guild.id] || {}),
        status: guildStatus,
        statusEmoji: account.customStatusEmoji || ""
      };
    } else if (account.guildProfiles[guild.id]) {
      delete account.guildProfiles[guild.id].status;
      delete account.guildProfiles[guild.id].statusEmoji;
    }
    if (!guildNickname && account.guildProfiles[guild.id]) delete account.guildProfiles[guild.id].nickname;
    if (!guildAvatarColor && account.guildProfiles[guild.id]) delete account.guildProfiles[guild.id].avatarColor;
    if (account.guildProfiles[guild.id] && Object.keys(account.guildProfiles[guild.id]).length === 0) {
      delete account.guildProfiles[guild.id];
    }
  }

  saveState();
  sendCurrentXmppPresence();
  ui.profileDialog.close();
  render();
});

ui.accountCancel.addEventListener("click", () => ui.accountSwitchDialog.close());

ui.accountSwitchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const typed = ui.newAccountInput.value.trim();

  if (typed) {
    createOrSwitchAccount(typed);
  } else if (selectedSwitchAccountId) {
    state.currentAccountId = selectedSwitchAccountId;
    rememberAccountSession(selectedSwitchAccountId);
    const prefs = getPreferences();
    if (["ws", "http", "xmpp"].includes(prefs.relayMode) && prefs.relayAutoConnect === "on") connectRelaySocket({ force: true });
  }

  ensureActiveGuildForCurrentAccount();
  ensureCurrentUserInActiveServer();
  saveState();
  ui.accountSwitchDialog.close();
  render();
});

[
  ui.profileDialog,
  ui.createServerDialog,
  ui.createChannelDialog,
  ui.topicDialog,
  ui.rolesDialog,
  ui.pinsDialog,
  ui.channelSettingsDialog,
  ui.messageEditDialog,
  ui.findDialog,
  ui.shortcutsDialog,
  ui.quickSwitchDialog,
  ui.mediaUrlDialog,
  ui.selfMenuDialog,
  ui.userPopoutDialog,
  ui.userProfileExtendedDialog,
  ui.accountSwitchDialog,
  ui.addFriendDialog,
  ui.xmppProviderDialog,
  ui.xmppRegisterDialog,
  ui.debugDialog,
  ui.xmppConsoleDialog,
  ui.cosmeticsDialog,
  ui.guildTagInfoDialog,
  ui.swfViewerDialog
].forEach(wireDialogBackdropClose);

document.addEventListener("click", (event) => {
  if (contextMenuOpen) {
    if (!ui.contextMenu.contains(event.target)) closeContextMenu();
  }
  if (mediaPickerOpen) {
    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    const pathContains = (node) => {
      if (!(node instanceof Node)) return false;
      if (path.length > 0) return path.includes(node);
      return event.target instanceof Node ? node.contains(event.target) : false;
    };
    const pathContainsEmojiPickerBtn = path.some((node) => (
      node instanceof HTMLElement
      && node.classList.contains("message-action-emoji-btn--picker")
    ));
    const inPicker = pathContains(ui.mediaPicker);
    const onToggle = pathContains(ui.openMediaPickerBtn)
      || pathContains(ui.toggleSwfAudioBtn)
      || pathContains(ui.toggleMediaPrivacyBtn)
      || pathContains(ui.quickFileAttachBtn)
      || pathContains(ui.openGifPickerBtn)
      || pathContains(ui.openStickerPickerBtn)
      || pathContains(ui.openEmojiPickerBtn)
      || pathContainsEmojiPickerBtn
      || (event.target instanceof HTMLElement && Boolean(event.target.closest(".message-action-emoji-btn--picker")));
    if (!inPicker && !onToggle) closeMediaPicker();
  }
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const anchor = target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return;
  if (anchor.hasAttribute("download")) return;
  const href = (anchor.getAttribute("href") || "").trim();
  if (!/^https?:\/\//i.test(href)) return;
  event.preventDefault();
  event.stopPropagation();
  openExternalUrlInClient(href);
}, true);

function maybeHandleComposerDrop(event) {
  if (!state.currentAccountId) return false;
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return false;
  event.preventDefault();
  event.stopPropagation();
  const list = [...files].slice(0, 6);
  void (async () => {
    let attachedCount = 0;
    for (const file of list) {
      const inferred = inferAttachmentTypeFromFile(file);
      const allowed = getComposerAttachAllowedTypes();
      if (!allowed.has(inferred)) continue;
      // eslint-disable-next-line no-await-in-loop
      const attached = await attachFileToComposer(file);
      if (attached) attachedCount += 1;
    }
    if (attachedCount <= 0) return;
    ui.messageInput.focus();
    showToast(attachedCount > 1 ? `${attachedCount} files attached. Press Enter to send.` : "Attachment added. Press Enter to send.");
  }).catch(() => {
    showToast("Failed to attach dropped file.", { tone: "error" });
  });
  return list.length > 0;
}

document.addEventListener("dragover", (event) => {
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;
  const allowed = getComposerAttachAllowedTypes();
  const hasSupported = [...files].some((file) => allowed.has(inferAttachmentTypeFromFile(file)));
  if (!hasSupported) return;
  event.preventDefault();
  ui.messageForm.classList.add("message-form--drop");
});

document.addEventListener("dragleave", () => {
  ui.messageForm.classList.remove("message-form--drop");
});

document.addEventListener("drop", (event) => {
  ui.messageForm.classList.remove("message-form--drop");
  maybeHandleComposerDrop(event);
});

document.addEventListener("contextmenu", (event) => {
  if (event.defaultPrevented) return;
  const target = event.target;
  if (target instanceof HTMLElement && target.closest("#contextMenu, .context-submenu")) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  if (target instanceof HTMLElement) {
    const isEditable = target.closest("input, textarea, [contenteditable='true']");
    const insideApp = Boolean(target.closest("#app"));
    const allowNativeMenu = shouldUseNativeContextMenu(target);
    if (insideApp && !isEditable && !allowNativeMenu) {
      event.preventDefault();
      if (!contextMenuOpen) return;
      if (ui.contextMenu.contains(target)) return;
      closeContextMenu();
      return;
    }
    if (allowNativeMenu && contextMenuOpen && !ui.contextMenu.contains(target)) {
      closeContextMenu();
      return;
    }
  }
  if (!contextMenuOpen) return;
  if (ui.contextMenu.contains(event.target)) return;
  closeContextMenu();
});

document.addEventListener("keydown", (event) => {
  if (!contextMenuOpen) return;
  const activeEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const activeMenu = activeEl?.closest(".context-submenu, #contextMenu");
  const menuRoot = activeMenu instanceof HTMLElement ? activeMenu : ui.contextMenu;
  const buttons = [...menuRoot.querySelectorAll("button:not(:disabled)")];
  let focusIndex = activeEl ? buttons.indexOf(activeEl) : -1;
  if (focusIndex < 0) {
    focusIndex = menuRoot === ui.contextMenu
      ? Math.max(0, Math.min(contextMenuFocusIndex, buttons.length - 1))
      : 0;
  }
  if (buttons.length === 0) {
    if (event.key === "Escape") closeContextMenu();
    return;
  }
  const focusButton = (index) => {
    const nextIndex = Math.max(0, Math.min(index, buttons.length - 1));
    if (menuRoot === ui.contextMenu) contextMenuFocusIndex = nextIndex;
    buttons[nextIndex]?.focus();
  };
  if (event.key === "ArrowDown") {
    event.preventDefault();
    focusButton((focusIndex + 1) % buttons.length);
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    focusButton((focusIndex - 1 + buttons.length) % buttons.length);
    return;
  }
  if (event.key === "ArrowRight") {
    const focused = buttons[focusIndex];
    if (!focused?.classList.contains("context-menu__has-submenu")) return;
    event.preventDefault();
    focused.click();
    const submenuButtons = [...document.querySelectorAll(".context-submenu button:not(:disabled)")];
    if (submenuButtons.length > 0) submenuButtons[0].focus();
    return;
  }
  if (event.key === "ArrowLeft") {
    if (!(menuRoot instanceof HTMLElement) || !menuRoot.classList.contains("context-submenu")) return;
    event.preventDefault();
    document.querySelectorAll(".context-submenu").forEach((node) => node.remove());
    if (contextMenuSubmenuAnchor instanceof HTMLButtonElement) {
      const mainButtons = [...ui.contextMenu.querySelectorAll("button:not(:disabled)")];
      const anchorIndex = mainButtons.indexOf(contextMenuSubmenuAnchor);
      if (anchorIndex >= 0) contextMenuFocusIndex = anchorIndex;
      contextMenuSubmenuAnchor.focus();
    }
    return;
  }
  if (event.key === "Home") {
    event.preventDefault();
    focusButton(0);
    return;
  }
  if (event.key === "End") {
    event.preventDefault();
    focusButton(buttons.length - 1);
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    buttons[focusIndex]?.click();
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    closeContextMenu();
  }
});

window.addEventListener("resize", () => {
  closeContextMenu();
  refreshHeaderActionButtonLabels();
  if (mediaPickerOpen) renderMediaPicker();
  if (currentViewerRuntimeKey) {
    const runtime = swfRuntimes.get(currentViewerRuntimeKey);
    if (runtime?.floating) positionFloatingSwfHost(runtime);
  }
  updateSwfPipDockLayout();
  renderSwfPipDock();
  updateVideoPipDockLayout();
  requestSwfRuntimeLayoutSync();
});
window.addEventListener("hashchange", () => {
  if (!state.currentAccountId) return;
  safeRender("hashchange");
});
window.addEventListener("beforeunload", (event) => {
  if (!hasPendingComposerChanges()) return;
  event.preventDefault();
  event.returnValue = "";
});
document.addEventListener("visibilitychange", () => {
  if (getPreferences().relayMode !== "xmpp") return;
  syncXmppClientStateHint({ reason: "visibilitychange" });
});
window.addEventListener("focus", () => {
  if (getPreferences().relayMode !== "xmpp") return;
  syncXmppClientStateHint({ reason: "window-focus" });
});
window.addEventListener("blur", () => {
  if (getPreferences().relayMode !== "xmpp") return;
  syncXmppClientStateHint({ reason: "window-blur" });
});
const syncSwfRuntimeLayoutForScroll = () => {
  if (typeof positionSwfAnchoredRuntimeHosts === "function") positionSwfAnchoredRuntimeHosts();
  if (typeof positionSwfPipRuntimeHosts === "function") positionSwfPipRuntimeHosts();
  requestSwfRuntimeLayoutSync();
};
document.addEventListener("scroll", closeContextMenu, true);
document.addEventListener("scroll", () => {
  syncSwfRuntimeLayoutForScroll();
}, true);

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    refreshHeaderActionButtonLabels();
    if (mediaPickerOpen) renderMediaPicker();
    updateSwfPipDockLayout();
    renderSwfPipDock();
    updateVideoPipDockLayout();
    requestSwfRuntimeLayoutSync();
  });
  window.visualViewport.addEventListener("scroll", () => {
    updateSwfPipDockLayout();
    renderSwfPipDock();
    updateVideoPipDockLayout();
    syncSwfRuntimeLayoutForScroll();
  });
}

ui.messageList?.addEventListener("scroll", () => {
  syncSwfRuntimeLayoutForScroll();
});
ui.messageList?.addEventListener("load", (event) => {
  if (!(event.target instanceof HTMLElement)) return;
  if (!event.target.closest(".message")) return;
  requestSwfRuntimeLayoutSync();
}, true);
initializeSwfLayoutObservers();
initializePipDockResizeObservers();

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    let foundKey = null;
    swfRuntimes.forEach((runtime, key) => {
      if (runtime.host === document.fullscreenElement) foundKey = key;
    });
    fullscreenRuntimeKey = foundKey;
    if (foundKey) {
      const runtime = swfRuntimes.get(foundKey);
      fullscreenRuntimeWasPlaying = Boolean(runtime?.playing);
      setSwfPlayback(foundKey, true, "user");
    } else {
      fullscreenRuntimeWasPlaying = false;
    }
    return;
  }
  if (!fullscreenRuntimeKey) return;
  setSwfPlayback(fullscreenRuntimeKey, fullscreenRuntimeWasPlaying, "system");
  fullscreenRuntimeKey = null;
  fullscreenRuntimeWasPlaying = false;
});

document.addEventListener("keydown", (event) => {
  const lightbox = document.getElementById("mediaLightbox");
  if (event.key === "Escape" && lightbox && !lightbox.hidden) {
    event.preventDefault();
    closeMediaLightbox();
    return;
  }
  const key = (event.key || "").toLowerCase();
  const wantsDevtools = event.key === "F12"
    || (event.ctrlKey && event.shiftKey && key === "i")
    || (event.metaKey && event.altKey && key === "i");
  if (wantsDevtools) {
    event.preventDefault();
    requestDevtoolsToggle();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key === "/") {
    if (!state.currentAccountId) return;
    event.preventDefault();
    openShortcutsDialog();
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && (event.key === "0" || event.code === "Digit0")) {
    if (!state.currentAccountId) return;
    event.preventDefault();
    openShortcutsDialog();
    return;
  }
  if (event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey) {
    if (!state.currentAccountId) return;
    const key = event.key.toLowerCase();
    if (key === "d") {
      event.preventDefault();
      toggleDmSectionCollapsed();
      return;
    }
    if (key === "c") {
      event.preventDefault();
      toggleGuildSectionCollapsed();
      return;
    }
    if (key === "r") {
      event.preventDefault();
      ui.markChannelReadBtn?.click();
      return;
    }
    if (key === "a") {
      event.preventDefault();
      const account = getCurrentAccount();
      if (!account) return;
      if (!markAllReadForAccount(account.id)) {
        showToast("Everything already read.");
        return;
      }
      saveState();
      render();
      return;
    }
    if (key === "g") {
      event.preventDefault();
      const guild = getActiveGuild();
      if (!guild) return;
      const current = getGuildNotificationMode(guild.id);
      const next = current === "all" ? "mentions" : current === "mentions" ? "mute" : "all";
      setGuildNotificationMode(guild.id, next);
      saveState();
      renderServers();
      renderChannels();
      showToast(`Guild notifications: ${next}`);
      return;
    }
  }
  if (event.altKey && event.ctrlKey && !event.metaKey && !event.shiftKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    if (getViewMode() !== "guild") return;
    event.preventDefault();
    const moved = moveActiveChannelByOffset(event.key === "ArrowUp" ? -1 : 1);
    if (!moved) showToast("Cannot move channel further.");
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
    if (!state.currentAccountId) return;
    const altDigit = (event.code || "").startsWith("Digit")
      ? (event.code || "").slice(5)
      : event.key;
    if (altDigit === "1") {
      event.preventDefault();
      openMediaPickerWithTab("gif");
      return;
    }
    if (altDigit === "2") {
      event.preventDefault();
      openMediaPickerWithTab("sticker");
      return;
    }
    if (altDigit === "3") {
      event.preventDefault();
      openMediaPickerWithTab("emoji");
      return;
    }
    if (altDigit === "4") {
      event.preventDefault();
      openMediaPickerWithTab("pdf");
      return;
    }
    if (altDigit === "5") {
      event.preventDefault();
      openMediaPickerWithTab("text");
      return;
    }
    if (altDigit === "6") {
      event.preventDefault();
      openMediaPickerWithTab("docs");
      return;
    }
    if (altDigit === "7") {
      event.preventDefault();
      openMediaPickerWithTab("html");
      return;
    }
    if (altDigit === "8") {
      event.preventDefault();
      openMediaPickerWithTab("swf");
      return;
    }
    if (altDigit === "9") {
      event.preventDefault();
      openMediaPickerWithTab("svg");
      return;
    }
  }
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "f") {
    if (!state.currentAccountId) return;
    event.preventDefault();
    const target = getViewMode() === "dm" ? ui.dmSearchInput : ui.channelFilterInput;
    target?.focus();
    target?.select?.();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "f") {
    if (!state.currentAccountId) return;
    event.preventDefault();
    openFindDialog();
    return;
  }
  if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key === "F3") {
    if (!state.currentAccountId) return;
    if (!findQuery.trim()) {
      event.preventDefault();
      openFindDialog();
      return;
    }
    event.preventDefault();
    moveFindSelection(event.shiftKey ? -1 : 1);
    return;
  }
  if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "g") {
    if (!state.currentAccountId) return;
    if (!findQuery.trim()) {
      event.preventDefault();
      openFindDialog();
      return;
    }
    event.preventDefault();
    moveFindSelection(event.shiftKey ? -1 : 1);
    return;
  }
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "n") {
    if (!state.currentAccountId) return;
    if (!canCurrentUser("manageChannels")) {
      showToast("Manage Channels required.", { tone: "error" });
      return;
    }
    event.preventDefault();
    ui.channelNameInput.value = "";
    ui.channelTypeInput.value = "text";
    ui.createChannelDialog.showModal();
    return;
  }
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "d") {
    if (!state.currentAccountId) return;
    event.preventDefault();
    ui.newDmBtn.click();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "k") {
    if (!state.currentAccountId) return;
    event.preventDefault();
    openQuickSwitcher();
    return;
  }
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "b") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    toggleChannelPanelVisibility();
    return;
  }
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "m") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    toggleMemberPanelVisibility();
    return;
  }
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "l") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    ui.messageInput.focus();
    return;
  }
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "u") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    ui.memberSearchInput?.focus();
    ui.memberSearchInput?.select?.();
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    const delta = event.key === "ArrowUp" ? -1 : 1;
    navigateGuildChannelByOffset(delta);
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && (event.key === "Home" || event.key === "End")) {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    if (getViewMode() !== "guild") return;
    event.preventDefault();
    const channels = getGuildChannelsForNavigation();
    if (channels.length === 0) return;
    const target = event.key === "Home" ? channels[0] : channels[channels.length - 1];
    if (!target || target.id === state.activeChannelId) return;
    state.viewMode = "guild";
    state.activeDmId = null;
    state.activeChannelId = target.id;
    saveState();
    render();
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "i") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    renderPinsDialog();
    ui.pinsDialog.showModal();
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "r") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    if (getViewMode() === "dm") return;
    event.preventDefault();
    const channel = getActiveChannel();
    const account = getCurrentAccount();
    if (!channel || !account) return;
    if (!markChannelRead(channel, account.id)) return;
    saveState();
    render();
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "q") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    const account = getCurrentAccount();
    if (!account) return;
    showToast(formatQuestSummaryText(account.id));
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "y") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    openProfileEditor();
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "n") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    jumpToUnreadGuildChannel(1);
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "p") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    jumpToUnreadGuildChannel(-1);
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "u") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    ui.quickAttachInput.click();
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "o") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    openMediaPickerWithTab("pdf");
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "v") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    if (getViewMode() !== "guild") return;
    const channel = getActiveChannel();
    const current = getCurrentAccount();
    if (!channel || !current) return;
    if (!(channel.type === "voice" || channel.type === "stage")) return;
    ensureVoiceStateForChannel(channel);
    event.preventDefault();
    const isConnected = channel.voiceState.connectedIds.includes(current.id);
    const changed = isConnected
      ? leaveVoiceLikeChannel(channel, current.id)
      : joinVoiceLikeChannel(channel, current.id);
    if (!changed) return;
    saveState();
    render();
    showToast(isConnected ? "Left channel." : "Joined channel.");
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "j") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    if (getViewMode() !== "guild") return;
    const guild = getActiveGuild();
    const current = getCurrentAccount();
    if (!guild || !current) return;
    const voices = (guild.channels || []).filter((entry) => entry.type === "voice" || entry.type === "stage");
    if (voices.length === 0) return;
    voices.forEach((entry) => ensureVoiceStateForChannel(entry));
    const connected = voices.find((entry) => entry.voiceState.connectedIds.includes(current.id));
    const target = connected || voices
      .slice()
      .sort((a, b) => b.voiceState.connectedIds.length - a.voiceState.connectedIds.length)[0];
    if (!target) return;
    event.preventDefault();
    state.activeChannelId = target.id;
    const changed = connected
      ? leaveVoiceLikeChannel(target, current.id)
      : joinVoiceLikeChannel(target, current.id);
    saveState();
    render();
    showToast(changed
      ? (connected ? `Left #${target.name}.` : `Joined #${target.name}.`)
      : `Already in #${target.name}.`);
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "m") {
    if (!state.currentAccountId) return;
    if (isTypingInputTarget(event.target)) return;
    if (getViewMode() !== "guild") return;
    const channel = getActiveChannel();
    const current = getCurrentAccount();
    if (!channel || !current) return;
    if (!(channel.type === "voice" || channel.type === "stage")) return;
    ensureVoiceStateForChannel(channel);
    if (!channel.voiceState.connectedIds.includes(current.id)) return;
    event.preventDefault();
    const changed = toggleVoiceMuteForSelf(channel, current.id);
    if (!changed) return;
    const isMuted = channel.voiceState.mutedIds.includes(current.id);
    saveState();
    render();
    showToast(isMuted ? "Muted." : "Unmuted.");
    return;
  }
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === "k") {
    if (isTypingInputTarget(event.target)) return;
    event.preventDefault();
    const dmMode = getViewMode() === "dm";
    const focusTarget = dmMode ? ui.dmSearchInput : ui.channelFilterInput;
    focusTarget?.focus();
    focusTarget?.select?.();
    return;
  }
  if (event.ctrlKey && event.key === ",") {
    if (!state.currentAccountId) return;
    event.preventDefault();
    openSettingsScreen();
    return;
  }
  if (event.altKey && event.key.toLowerCase() === "d") {
    if (!state.currentAccountId) return;
    event.preventDefault();
    state.viewMode = getViewMode() === "dm" ? "guild" : "dm";
    if (state.viewMode === "guild") {
      const current = getCurrentAccount();
      const fallbackGuild = listAccessibleGuildsForAccount(current)[0] || null;
      if (!state.activeGuildId && fallbackGuild) {
        state.activeGuildId = fallbackGuild.id;
      }
      ensureActiveGuildForCurrentAccount();
      const activeGuild = getActiveGuild();
      if (activeGuild) {
        state.activeChannelId = getFirstOpenableChannelIdForGuild(activeGuild) || state.activeChannelId;
      }
    }
    saveState();
    render();
    return;
  }
  if (event.key === "Escape" && contextMenuOpen) {
    closeContextMenu();
    return;
  }
  if (event.key === "Escape" && mediaPickerOpen) {
    closeMediaPicker();
    return;
  }
  if (event.key === "Escape" && ui.settingsScreen.classList.contains("settings-screen--active")) {
    closeSettingsScreen();
  }
});

document.addEventListener("focusin", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.id !== "virtual-keyboard") return;
  if (target.getAttribute("aria-hidden") !== "true") return;
  target.blur();
  addDebugLog("info", "Blurred hidden virtual-keyboard input to avoid aria-hidden focus warning");
});

ui.chatScreen?.addEventListener("touchstart", onMobileNavTouchStart, { passive: true });
ui.chatScreen?.addEventListener("touchmove", onMobileNavTouchMove, { passive: false });
ui.chatScreen?.addEventListener("touchend", onMobileNavTouchEnd, { passive: true });
ui.chatScreen?.addEventListener("touchcancel", () => {
  mobileSwipeNavState = null;
}, { passive: true });

function handleMobileLayoutViewportChange() {
  if (!state.currentAccountId) return;
  applyPreferencesToUI();
  renderChannels();
  renderMemberList();
}

if (mobileLayoutMediaQuery) {
  if (typeof mobileLayoutMediaQuery.addEventListener === "function") {
    mobileLayoutMediaQuery.addEventListener("change", handleMobileLayoutViewportChange);
  } else if (typeof mobileLayoutMediaQuery.addListener === "function") {
    mobileLayoutMediaQuery.addListener(handleMobileLayoutViewportChange);
  }
}

if (navigator.mediaDevices?.addEventListener) {
  navigator.mediaDevices.addEventListener("devicechange", () => {
    mediaDeviceSnapshot.ready = false;
    void refreshMediaDeviceSnapshot({ force: true }).then(() => {
      if (xmppActiveNativeCallSessionId) renderNativeXmppCallSurface(xmppActiveNativeCallSessionId);
    });
  });
}

mediaPickerTab = getPreferences().mediaLastTab;
if (dedupeDmThreads()) saveState();
hardenInputAutocompleteNoise();
applyServerBrandEmojiSupport();
initElectronPlatformBridge();
renderPlatformDetectedNote();
renderComposerMediaButtons();
runScheduledDispatch();
ensureScheduledDispatchTimer();
safeRender("startup");
loadSwfLibrary();
ensureMediaRuntimeBootstrapped();
if (state.currentAccountId && ["ws", "http", "xmpp"].includes(getPreferences().relayMode) && getPreferences().relayAutoConnect === "on") {
  connectRelaySocket();
}
