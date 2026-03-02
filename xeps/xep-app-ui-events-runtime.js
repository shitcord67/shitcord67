/*
 * App UI event bindings runtime extracted from app.js.
 * This file is loaded after app.js so it can bind listeners against initialized UI state.
 */

if (typeof XEP_XMPP_UI_BINDINGS_RUNTIME_GLOBAL.bindXmppLoginUiRuntimeBindings === "function") {
  XEP_XMPP_UI_BINDINGS_RUNTIME_GLOBAL.bindXmppLoginUiRuntimeBindings();
}

ui.messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  publishRelayTypingState(false, { force: true });
  const conversation = getActiveConversation();
  const text = trimTextForConversation((ui.messageInput.value || "").trim(), conversation);
  const account = getCurrentAccount();
  if (!conversation || !account || (!text && composerPendingAttachments.length === 0)) return;
  if (conversation.type === "dm" && text.startsWith("/")) {
    const handledDmSlash = typeof XEP_DM_COMMAND_RUNTIME_GLOBAL.handleDmSlashCommandRuntime === "function"
      ? XEP_DM_COMMAND_RUNTIME_GLOBAL.handleDmSlashCommandRuntime({ text, conversation, account })
      : false;
    if (handledDmSlash !== false) return;
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
  if (!(conversation.type === "channel" && text && handleSlashCommand(text, conversation.channel, account))) {
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
  publishRelayTypingState(false, { force: true });
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
      if (selected) applySlashCompletion(selected.name);
    } else {
      event.preventDefault();
      const selected = suggestion.items[mentionSelectionIndex] || suggestion.items[0];
      if (selected) applyMentionCompletion(selected);
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
