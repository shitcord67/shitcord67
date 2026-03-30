/*
 * App shell/settings/render helpers extracted from app.js.
 * Functions here intentionally bind to app globals at call time.
 */

function renderDock() {
  const account = getCurrentAccount();
  if (!account) return;
  const conversation = getActiveConversation();
  const guildId = conversation?.type === "channel" ? getActiveGuild()?.id || null : null;
  const dockPlate = ui.selfProfileBtn instanceof HTMLElement
    ? ui.selfProfileBtn.closest(".account-dock")
    : null;
  applyNameplatePlateStyle(dockPlate, account);
  ui.dockName.textContent = displayNameForAccount(account, guildId);
  applyNameplateStyle(ui.dockName, null);
  const dockTag = accountGuildTag(account);
  if (dockTag) {
    ui.dockName.appendChild(document.createTextNode(" "));
    const chip = document.createElement("span");
    chip.className = "guild-tag-chip";
    chip.textContent = dockTag;
    chip.title = "Guild tag";
    chip.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      showGuildTagInfo(account);
    });
    ui.dockName.appendChild(chip);
  }
  ui.dockStatus.textContent = displayStatus(account, guildId);
  applyAvatarStyle(ui.dockAvatar, account, guildId);
  applyAvatarDecoration(ui.dockAvatar, account);
  ui.dockPresenceDot.className = `dock-presence-dot presence-${normalizePresence(account.presence)}`;
}

function renderSelfPopout() {
  const account = getCurrentAccount();
  if (!account) return;
  const guildId = getActiveGuild()?.id || null;
  ui.selfPopoutName.textContent = displayNameForAccount(account, guildId);
  const selfRoleColor = getActiveServer() ? getMemberTopRoleColor(getActiveServer(), account.id) : "";
  ui.selfPopoutName.style.color = selfRoleColor || "";
  applyNameplateStyle(ui.selfPopoutName, account);
  const selfTag = accountGuildTag(account);
  if (selfTag) {
    ui.selfPopoutName.appendChild(document.createTextNode(" "));
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "guild-tag-chip";
    chip.textContent = selfTag;
    chip.title = "Guild tag";
    chip.addEventListener("click", () => showGuildTagInfo(account));
    ui.selfPopoutName.appendChild(chip);
  }
  if (ui.selfPopoutUsername) {
    ui.selfPopoutUsername.textContent = `@${account.username || "user"}`;
  }
  if (ui.selfPopoutCustomStatus) {
    const emoji = (account.customStatusEmoji || "").trim();
    const statusText = (account.customStatus || "").trim();
    const customStatus = [emoji, statusText].filter(Boolean).join(" ");
    ui.selfPopoutCustomStatus.textContent = customStatus;
    ui.selfPopoutCustomStatus.hidden = !customStatus;
    ui.selfPopoutCustomStatus.title = customStatus;
  }
  const selfStatus = displayStatus(account, guildId);
  const selfActivity = accountActivitySummary(account);
  ui.selfPopoutStatus.textContent = selfActivity ? `${selfStatus} · ${selfActivity}` : selfStatus;
  let selfXmppNeedsRefresh = false;
  if (ui.selfPopoutXmppMeta) {
    const xmppMeta = accountXmppPresenceMeta(account, { fallbackLastActive: account?.xmppLastActiveAt || "" });
    ui.selfPopoutXmppMeta.textContent = xmppMeta.text;
    ui.selfPopoutXmppMeta.hidden = !xmppMeta.text;
    ui.selfPopoutXmppMeta.title = xmppMeta.title || "";
    selfXmppNeedsRefresh = Boolean(xmppMeta.needsRefresh);
  }
  selfPopoutXmppNeedsRefresh = selfXmppNeedsRefresh;
  schedulePopoutPresenceRefresh();
  const currentPresence = normalizePresence(account.presence || "online");
  ui.selfMenuDialog.dataset.currentPresence = currentPresence;
  ui.selfMenuDialog.querySelectorAll("[data-self-presence]").forEach((button) => {
    if (!(button instanceof HTMLElement)) return;
    button.classList.toggle("active", normalizePresence(button.dataset.selfPresence || "online") === currentPresence);
  });
  ui.selfPopoutBio.textContent = account.bio?.trim() || "No bio yet.";
  applyAvatarStyle(ui.selfPopoutAvatar, account, guildId);
  applyAvatarDecoration(ui.selfPopoutAvatar, account);
  applyBannerStyle(ui.selfPopoutBanner, resolveAccountBanner(account, guildId));
  ui.selfMenuDialog.classList.remove("profile-effect-aurora", "profile-effect-flame", "profile-effect-ocean");
  const selfEffect = accountProfileEffect(account);
  if (selfEffect !== "none") ui.selfMenuDialog.classList.add(`profile-effect-${selfEffect}`);
  renderRoleChips(ui.selfPopoutRoles, account.id);
  renderQuestBadges(ui.selfPopoutRoles, account.id);
}

function renderAccountSwitchList() {
  ui.accountList.innerHTML = "";
  state.accounts.forEach((account) => {
    const row = document.createElement("div");
    row.className = `account-option ${selectedSwitchAccountId === account.id ? "active" : ""}`;
    const left = document.createElement("button");
    left.type = "button";
    left.className = "account-option__identity";
    const avatar = document.createElement("div");
    avatar.className = "account-option__avatar";
    applyAvatarStyle(avatar, account, null);
    applyAvatarDecoration(avatar, account);
    const body = document.createElement("div");
    body.className = "account-option__meta";
    const label = document.createElement("strong");
    label.textContent = account.displayName || account.username;
    const tag = document.createElement("small");
    tag.textContent = `@${account.username}`;
    body.appendChild(label);
    body.appendChild(tag);
    const status = document.createElement("small");
    status.className = "account-option__status";
    status.textContent = displayStatus(account, null);
    body.appendChild(status);
    left.appendChild(avatar);
    left.appendChild(body);
    left.addEventListener("click", () => {
      selectedSwitchAccountId = account.id;
      renderAccountSwitchList();
    });
    row.appendChild(left);
    const action = document.createElement("button");
    action.type = "button";
    action.className = `account-option__action ${state.currentAccountId === account.id ? "is-current" : ""}`;
    action.textContent = state.currentAccountId === account.id ? "Current" : "Switch";
    action.disabled = state.currentAccountId === account.id;
    action.addEventListener("click", () => {
      selectedSwitchAccountId = account.id;
      state.currentAccountId = account.id;
      rememberAccountSession(account.id);
      const prefs = getPreferences();
      if (["local", "ws", "http", "xmpp"].includes(prefs.relayMode) && prefs.relayAutoConnect === "on") {
        connectRelaySocket({ force: true });
      }
      ensureActiveGuildForCurrentAccount();
      ensureCurrentUserInActiveServer();
      saveState();
      ui.accountSwitchDialog.close();
      render();
    });
    row.appendChild(action);
    ui.accountList.appendChild(row);
  });
}

if (ui.selfMenuDialog && !ui.selfMenuDialog.dataset.presenceClickBound) {
  ui.selfMenuDialog.addEventListener("click", (event) => {
    const button = event.target instanceof Element
      ? event.target.closest("[data-self-presence]")
      : null;
    if (!(button instanceof HTMLElement)) return;
    const next = normalizePresence(button.dataset.selfPresence || "online");
    const changed = setCurrentAccountPresence(next, { persist: true, rerender: true, announceXmpp: true });
    if (changed) showToast(`Presence: ${presenceLabel(next)}`);
  });
  ui.selfMenuDialog.dataset.presenceClickBound = "true";
}

function renderRolesDialog() {
  const server = getActiveServer();
  if (!server) return;

  ui.assignRoleMemberInput.innerHTML = "";
  server.memberIds.forEach((memberId) => {
    const account = getAccountById(memberId);
    if (!account) return;
    const option = document.createElement("option");
    option.value = account.id;
    option.textContent = `${account.displayName || account.username} (@${account.username})`;
    ui.assignRoleMemberInput.appendChild(option);
  });

  ui.assignRoleRoleInput.innerHTML = "";
  getServerRoles(server).forEach((role) => {
    if (role.name === "@everyone") return;
    const option = document.createElement("option");
    option.value = role.id;
    option.textContent = role.name;
    ui.assignRoleRoleInput.appendChild(option);
  });
  if (ui.roleColorPicker) {
    ui.roleColorPicker.value = normalizeColorForPicker(ui.roleColorInput.value || "#b5bac1", "#b5bac1");
  }
}

function renderPinsDialog() {
  const conversation = getActiveConversation();
  const isDm = conversation?.type === "dm";
  const channel = !isDm ? getActiveChannel() : null;
  const dmThread = isDm ? conversation?.thread : null;
  if (ui.pinsSearchInput && ui.pinsSearchInput.value !== pinsSearchTerm) {
    ui.pinsSearchInput.value = pinsSearchTerm;
  }
  if (ui.pinsSortInput && ui.pinsSortInput.value !== pinsSortMode) {
    ui.pinsSortInput.value = pinsSortMode;
  }
  ui.pinsList.innerHTML = "";
  if (!channel && !dmThread) return;
  const messageBucket = isDm ? (dmThread?.messages || []) : (channel?.messages || []);
  let pinned = messageBucket.filter((message) => message.pinned);
  if (ui.pinsClearBtn) ui.pinsClearBtn.disabled = pinned.length === 0;
  const term = (pinsSearchTerm || "").trim().toLowerCase();
  if (term) {
    pinned = pinned.filter((message) => {
      const author = displayNameForMessage(message).toLowerCase();
      const text = (message.text || "").toString().toLowerCase();
      const stamp = formatFullTimestamp(message.ts || "").toLowerCase();
      return author.includes(term) || text.includes(term) || stamp.includes(term);
    });
  }
  pinned.sort((a, b) => {
    if (pinsSortMode === "oldest") return toTimestampMs(a.ts) - toTimestampMs(b.ts);
    if (pinsSortMode === "author-asc") return displayNameForMessage(a).localeCompare(displayNameForMessage(b));
    if (pinsSortMode === "author-desc") return displayNameForMessage(b).localeCompare(displayNameForMessage(a));
    return toTimestampMs(b.ts) - toTimestampMs(a.ts);
  });
  if (pinned.length === 0) {
    const empty = document.createElement("div");
    empty.className = "pin-item";
    empty.textContent = term ? "No pinned messages match your filter." : "No pinned messages yet.";
    ui.pinsList.appendChild(empty);
    return;
  }
  pinned.forEach((message) => {
    const item = document.createElement("article");
    item.className = "pin-item";
    const author = displayNameForMessage(message);
    const attachments = Array.isArray(message.attachments) ? message.attachments : [];
    const heading = document.createElement("div");
    heading.className = "pin-item__head";
    const title = document.createElement("div");
    title.className = "pin-item__title";
    const authorEl = document.createElement("strong");
    authorEl.textContent = author;
    const metaEl = document.createElement("small");
    metaEl.textContent = formatFullTimestamp(message.ts || "");
    title.append(authorEl, metaEl);
    heading.appendChild(title);
    if (attachments.length > 0) {
      const attachmentMeta = document.createElement("span");
      attachmentMeta.className = "pin-item__meta";
      attachmentMeta.textContent = attachments.length === 1 ? "1 attachment" : `${attachments.length} attachments`;
      heading.appendChild(attachmentMeta);
    }
    item.appendChild(heading);
    const text = document.createElement("div");
    text.className = "pin-item__text";
    text.textContent = ((message.text || "").toString().trim() || "(attachment only)").slice(0, 360);
    item.appendChild(text);
    const actions = document.createElement("div");
    actions.className = "pin-item__actions";
    const jumpBtn = document.createElement("button");
    jumpBtn.type = "button";
    jumpBtn.className = "pin-item__action";
    jumpBtn.textContent = "Jump";
    jumpBtn.addEventListener("click", () => {
      ui.pinsDialog.close();
      focusMessageById(message.id);
    });
    actions.appendChild(jumpBtn);
    const copyLinkBtn = document.createElement("button");
    copyLinkBtn.type = "button";
    copyLinkBtn.className = "pin-item__action";
    copyLinkBtn.textContent = "Copy Link";
    copyLinkBtn.addEventListener("click", async () => {
      const ok = await copyText(buildMessagePermalink(conversation?.id || "", message.id || ""));
      showToast(ok ? "Message link copied." : "Failed to copy message link.", { tone: ok ? "info" : "error" });
    });
    actions.appendChild(copyLinkBtn);
    const unpinBtn = document.createElement("button");
    unpinBtn.type = "button";
    unpinBtn.className = "pin-item__action pin-item__action--danger";
    unpinBtn.textContent = "Unpin";
    unpinBtn.addEventListener("click", () => {
      const changed = togglePinnedMessageForConversation({ conversation, message, channel, dmThread });
      if (!changed) return;
      saveState();
      renderPinsDialog();
      renderMessages();
      showToast("Message unpinned.");
    });
    actions.appendChild(unpinBtn);
    item.appendChild(actions);
    ui.pinsList.appendChild(item);
  });
}

function setSettingsTab(tabId) {
  const tabTitles = {
    "my-account": tUi("settings.tab.my-account", "My Account"),
    profiles: tUi("settings.tab.profiles", "Profiles"),
    notifications: tUi("settings.tab.notifications", "Notifications"),
    appearance: tUi("settings.tab.appearance", "Appearance"),
    privacy: tUi("settings.tab.privacy", "Privacy & Safety"),
    "voice-video": tUi("settings.tab.voice-video", "Voice & Video"),
    advanced: tUi("settings.tab.advanced", "Advanced")
  };
  ui.settingsTitle.textContent = tabTitles[tabId] || tUi("settings.nav.title", "User Settings");
  ui.settingsNavItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.settingsTab === tabId);
  });
  if (ui.settingsMobileTabs) {
    [...ui.settingsMobileTabs.querySelectorAll(".settings-tab")].forEach((item) => {
      item.classList.toggle("is-active", item.dataset.settingsTab === tabId);
    });
  }
  ui.settingsPanels.forEach((panel) => {
    panel.classList.toggle("settings-panel--active", panel.dataset.settingsPanel === tabId);
  });
}

function renderMediaRuleItems(container, rules = [], {
  emptyText = "No rules.",
  onRemove = null
} = {}) {
  if (!(container instanceof HTMLElement)) return;
  container.innerHTML = "";
  const list = Array.isArray(rules) ? rules : [];
  if (list.length <= 0) {
    const empty = document.createElement("div");
    empty.className = "settings-media-rule-empty";
    empty.textContent = emptyText;
    container.appendChild(empty);
    return;
  }
  list.forEach((rule) => {
    const row = document.createElement("div");
    row.className = "settings-media-rule-item";
    const label = document.createElement("code");
    label.textContent = rule;
    label.title = rule;
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      if (typeof onRemove === "function") onRemove(rule);
    });
    row.appendChild(label);
    row.appendChild(removeBtn);
    container.appendChild(row);
  });
}

function renderMediaPrivacyRuleEditor() {
  const prefs = getPreferences();
  renderMediaRuleItems(ui.mediaAllowRulesList, prefs.mediaTrustRules, {
    emptyText: "No allow rules configured.",
    onRemove: (rule) => {
      if (!removeMediaTrustRule(rule)) return;
      saveState();
      renderMediaPrivacyRuleEditor();
      if (mediaPickerOpen) renderMediaPicker();
      renderMessages();
      showToast(`Removed allow rule: ${rule}`);
    }
  });
  renderMediaRuleItems(ui.mediaDenyRulesList, prefs.mediaDenyRules, {
    emptyText: "No deny rules configured.",
    onRemove: (rule) => {
      if (!removeMediaDenyRule(rule)) return;
      saveState();
      renderMediaPrivacyRuleEditor();
      if (mediaPickerOpen) renderMediaPicker();
      renderMessages();
      showToast(`Removed deny rule: ${rule}`);
    }
  });
}

function addMediaRuleFromSettingsInput() {
  const rawRule = (ui.mediaRuleInput?.value || "").toString().trim();
  if (!rawRule) {
    showToast("Enter a media rule first.", { tone: "error" });
    return false;
  }
  const kind = (ui.mediaRuleKindInput?.value || "allow").toString().toLowerCase() === "deny"
    ? "deny"
    : "allow";
  const added = kind === "deny"
    ? addMediaDenyRule(rawRule)
    : addMediaTrustRule(rawRule);
  if (!added) {
    showToast(`${kind === "deny" ? "Deny" : "Allow"} rule is invalid or already exists.`, { tone: "error" });
    return false;
  }
  saveState();
  if (ui.mediaRuleInput) ui.mediaRuleInput.value = "";
  renderMediaPrivacyRuleEditor();
  if (mediaPickerOpen) renderMediaPicker();
  renderMessages();
  showToast(`Added ${kind} rule: ${rawRule}`);
  return true;
}

async function updateCredentialStoragePermissionUi() {
  if (!ui.credentialStoragePermissionNote || !ui.credentialStoragePermissionBtn) return;
  const nativeCreds = window.SHITCORD67_NATIVE_CREDENTIALS || null;
  const isAndroid = Boolean(nativeCreds && typeof nativeCreds.isAndroid === "function" && nativeCreds.isAndroid());
  if (!isAndroid) {
    ui.credentialStoragePermissionNote.textContent = "Storage permission is Android-only.";
    ui.credentialStoragePermissionBtn.hidden = true;
    ui.credentialStoragePermissionBtn.disabled = true;
    if (ui.credentialStorageDocsChangeBtn) {
      ui.credentialStorageDocsChangeBtn.hidden = true;
      ui.credentialStorageDocsChangeBtn.disabled = true;
    }
    if (ui.credentialStorageDebugBtn) {
      ui.credentialStorageDebugBtn.hidden = true;
      ui.credentialStorageDebugBtn.disabled = true;
    }
    return;
  }
  ui.credentialStoragePermissionBtn.hidden = false;
  ui.credentialStoragePermissionBtn.disabled = false;
  if (ui.credentialStorageDocsChangeBtn) {
    ui.credentialStorageDocsChangeBtn.hidden = false;
    ui.credentialStorageDocsChangeBtn.disabled = false;
  }
  if (ui.credentialStorageDebugBtn) {
    ui.credentialStorageDebugBtn.hidden = false;
    ui.credentialStorageDebugBtn.disabled = false;
  }
  if (!nativeCreds || typeof nativeCreds.permissionStatus !== "function") {
    ui.credentialStoragePermissionNote.textContent = "Storage permission status unavailable.";
    return;
  }
  const status = await nativeCreds.permissionStatus();
  let docsLabel = "";
  if (nativeCreds.getDocumentsInfo) {
    try {
      const info = await nativeCreds.getDocumentsInfo();
      if (info?.available) {
        const name = (info?.name || "Documents").toString();
        docsLabel = ` (Folder: ${name})`;
      }
    } catch {
      // ignore
    }
  }
  const normalized = (status || "").toString().trim().toLowerCase();
  if (normalized === "granted") {
    ui.credentialStoragePermissionNote.textContent = `Storage permission: granted.${docsLabel}`;
    return;
  }
  if (normalized === "denied") {
    ui.credentialStoragePermissionNote.textContent = "Storage permission: denied. Tap the button to request again.";
    return;
  }
  if (normalized === "prompt") {
    ui.credentialStoragePermissionNote.textContent = "Storage permission: not granted yet. Tap the button to allow Documents access.";
    return;
  }
  ui.credentialStoragePermissionNote.textContent = `Storage permission status: ${normalized || "unknown"}.`;
}

function renderSettingsScreen() {
  const account = getCurrentAccount();
  const guild = getActiveGuild();
  const prefs = getPreferences();
  if (!account) return;
  if (ui.settingsNavTitle) ui.settingsNavTitle.textContent = tUi("settings.nav.title", "User Settings");
  ui.settingsNavItems.forEach((item) => {
    const tab = (item.dataset.settingsTab || "").toString();
    if (!tab) return;
    item.textContent = tUi(`settings.tab.${tab}`, item.textContent || tab);
  });
  if (ui.settingsMobileTabs) {
    ui.settingsMobileTabs.innerHTML = "";
    ui.settingsNavItems.forEach((item) => {
      const tab = (item.dataset.settingsTab || "").toString();
      if (!tab) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "settings-tab";
      button.dataset.settingsTab = tab;
      button.textContent = item.textContent || tab;
      button.addEventListener("click", () => setSettingsTab(tab));
      ui.settingsMobileTabs.appendChild(button);
    });
  }
  const currentTab = ui.settingsNavItems.find((item) => item.classList.contains("active"))?.dataset?.settingsTab || "";
  if (currentTab) setSettingsTab(currentTab);
  ui.settingsDisplayName.textContent = displayNameForAccount(account, guild?.id || null);
  ui.settingsUsername.textContent = `@${account.username}`;
  ui.settingsCurrentStatus.textContent = displayStatus(account, guild?.id || null);
  if (ui.settingsPresenceSelect) {
    ui.settingsPresenceSelect.value = normalizePresence(account.presence || "online");
  }
  ui.uiScaleInput.value = String(prefs.uiScale);
  ui.themeInput.value = prefs.theme;
  const appearancePanel = ui.appearanceForm;
  if (appearancePanel) {
    const title = appearancePanel.querySelector("h3");
    if (title) title.textContent = tUi("settings.appearance.title", "Appearance");
    const uiScaleLabel = appearancePanel.querySelector('label[for="uiScaleInput"]');
    if (uiScaleLabel) uiScaleLabel.textContent = tUi("settings.appearance.uiScale", "UI Scale");
    const themeLabel = appearancePanel.querySelector('label[for="themeInput"]');
    if (themeLabel) themeLabel.textContent = tUi("settings.appearance.theme", "Theme");
    const languageLabel = appearancePanel.querySelector('label[for="languageInput"]');
    if (languageLabel) languageLabel.textContent = tUi("settings.appearance.language", "Language");
    const compactLabel = appearancePanel.querySelector('label[for="compactModeInput"]');
    if (compactLabel) compactLabel.textContent = tUi("settings.appearance.compactMembers", "Compact member list");
    const dmOnlyLabel = appearancePanel.querySelector('label[for="dmOnlySidebarInput"]');
    if (dmOnlyLabel) dmOnlyLabel.textContent = tUi("settings.appearance.dmOnlySidebar", "DM-only server rail");
    const submitBtn = appearancePanel.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = tUi("settings.appearance.save", "Save Appearance");
  }
  if (ui.themeInput) {
    const oled = ui.themeInput.querySelector('option[value="oled"]');
    if (oled) oled.textContent = tUi("settings.theme.oled", "OLED");
    const discord = ui.themeInput.querySelector('option[value="discord"]');
    if (discord) discord.textContent = tUi("settings.theme.discord", "Discord-like");
    const highContrast = ui.themeInput.querySelector('option[value="high-contrast"]');
    if (highContrast) highContrast.textContent = tUi("settings.theme.highContrast", "High Contrast");
  }
  if (ui.uiAccentColorInput) {
    ui.uiAccentColorInput.value = prefs.uiAccentColor || "auto";
  }
  if (ui.uiAccentColorPicker) {
    ui.uiAccentColorPicker.value = normalizeColorForPicker(prefs.uiAccentColor || "#5865f2", "#5865f2");
  }
  if (ui.languageInput) {
    ui.languageInput.value = prefs.language;
    const autoOption = ui.languageInput.querySelector('option[value="auto"]');
    if (autoOption) autoOption.textContent = tUi("settings.language.auto", "Auto detect");
  }
  if (ui.compactModeInput) {
    const off = ui.compactModeInput.querySelector('option[value="off"]');
    if (off) off.textContent = tUi("settings.compact.off", "Off");
    const on = ui.compactModeInput.querySelector('option[value="on"]');
    if (on) on.textContent = tUi("settings.compact.on", "On");
  }
  if (ui.dmOnlySidebarInput) {
    const off = ui.dmOnlySidebarInput.querySelector('option[value="off"]');
    if (off) off.textContent = tUi("settings.dmOnlySidebar.off", "Off");
    const on = ui.dmOnlySidebarInput.querySelector('option[value="on"]');
    if (on) on.textContent = tUi("settings.dmOnlySidebar.on", "On");
  }
  if (ui.enterToSendInput) {
    ui.enterToSendInput.value = prefs.enterToSend === "ctrl-enter" ? "ctrl-enter" : "enter";
  }
  if (ui.quickSwitcherHotkeyInput) {
    ui.quickSwitcherHotkeyInput.value = prefs.quickSwitcherHotkey === "alt-k" ? "alt-k" : "ctrl-k";
  }
  if (ui.reducedMotionInput) {
    ui.reducedMotionInput.value = prefs.reducedMotion === "on" ? "on" : "off";
  }
  if (ui.uiIntensityInput) {
    ui.uiIntensityInput.value = String(Math.min(120, Math.max(80, Number(prefs.uiIntensity) || 100)));
  }
  if (ui.rememberLoginStorageInput) {
    ui.rememberLoginStorageInput.value = prefs.rememberLoginStorage || "off";
    const off = ui.rememberLoginStorageInput.querySelector('option[value="off"]');
    if (off) off.textContent = tUi("settings.advanced.credentialStorage.off", "Off");
    const on = ui.rememberLoginStorageInput.querySelector('option[value="on"]');
    if (on) on.textContent = tUi("settings.advanced.credentialStorage.on", "On (Android)");
  }
  if (ui.mediaPrivacyModeInput) {
    ui.mediaPrivacyModeInput.value = prefs.mediaPrivacyMode === "off" ? "off" : "safe";
  }
  void updateCredentialStoragePermissionUi();
  ui.compactModeInput.value = prefs.compactMembers;
  if (ui.dmOnlySidebarInput) ui.dmOnlySidebarInput.value = prefs.dmOnlySidebar || "off";
  ui.developerModeInput.value = prefs.developerMode;
  ui.debugOverlayInput.value = prefs.debugOverlay;
  ui.swfAudioPolicyInput.value = prefs.swfAudioPolicy;
  ui.swfAudioScopeInput.value = prefs.swfAudioScope;
  ui.swfAutoplayInput.value = prefs.swfAutoplay;
  if (ui.hapticModeInput) ui.hapticModeInput.value = prefs.hapticMode || "full";
  ui.swfPauseOnMuteInput.value = prefs.swfPauseOnMute;
  ui.swfVuMeterInput.value = prefs.swfVuMeter;
  renderTenorCredentialSettings();
  if (ui.relayModeInput) ui.relayModeInput.value = prefs.relayMode;
  if (ui.relayUrlInput) ui.relayUrlInput.value = prefs.relayUrl;
  if (ui.relayRoomInput) ui.relayRoomInput.value = prefs.relayRoom;
  if (ui.relayAutoConnectInput) ui.relayAutoConnectInput.value = prefs.relayAutoConnect;
  if (ui.xmppJidInput) ui.xmppJidInput.value = prefs.xmppJid;
  if (ui.xmppPasswordInput) ui.xmppPasswordInput.value = prefs.xmppPassword;
  if (ui.xmppWsUrlInput) ui.xmppWsUrlInput.value = prefs.xmppWsUrl;
  if (ui.xmppMucServiceInput) ui.xmppMucServiceInput.value = prefs.xmppMucService;
  if (ui.xmppHideNonXmppInput) ui.xmppHideNonXmppInput.value = prefs.xmppHideNonXmpp;
  if (ui.callProviderInput) ui.callProviderInput.value = prefs.callProviderUrl;
  if (ui.callRoomPrefixInput) ui.callRoomPrefixInput.value = prefs.callRoomPrefix;
  if (ui.callAutoPostInput) ui.callAutoPostInput.value = prefs.callAutoPost;
  if (ui.callAudioInputSelect) ui.callAudioInputSelect.value = prefs.callAudioInputId || "";
  if (ui.callVideoInputSelect) ui.callVideoInputSelect.value = prefs.callVideoInputId || "";
  if (ui.callAudioOutputSelect) ui.callAudioOutputSelect.value = prefs.callAudioOutputId || "";
  if (ui.callScreenSystemAudioInput) ui.callScreenSystemAudioInput.value = prefs.callScreenSystemAudio === "off" ? "off" : "on";
  if (ui.callScreenMicMixInput) ui.callScreenMicMixInput.value = prefs.callScreenMicMix === "off" ? "off" : "on";
  if (ui.platformOverrideInput) ui.platformOverrideInput.value = prefs.platformOverride || "auto";
  renderPlatformDetectedNote();
  if (ui.whiteboardProviderInput) ui.whiteboardProviderInput.value = prefs.whiteboardProviderUrl;
  if (ui.whiteboardRoomPrefixInput) ui.whiteboardRoomPrefixInput.value = prefs.whiteboardRoomPrefix;
  if (ui.whiteboardAutoPostInput) ui.whiteboardAutoPostInput.value = prefs.whiteboardAutoPost;
  if (ui.mediaRuleKindInput && !["allow", "deny"].includes(ui.mediaRuleKindInput.value)) {
    ui.mediaRuleKindInput.value = "allow";
  }
  renderMediaPrivacyRuleEditor();
  renderRelayStatusOutput();
  if (ui.guildNotifGuildName) {
    ui.guildNotifGuildName.textContent = guild ? guild.name : "No guild selected";
  }
  if (ui.guildNotifModeInput) {
    ui.guildNotifModeInput.value = guild ? getGuildNotificationMode(guild.id) : "all";
    ui.guildNotifModeInput.disabled = !guild;
  }
  if (ui.dmNotifModeInput) ui.dmNotifModeInput.value = prefs.dmNotificationMode || "all";
  if (ui.unreadBadgeStyleInput) ui.unreadBadgeStyleInput.value = prefs.streamerMode === "on" ? "mentions" : (prefs.unreadBadgeStyle || "all");
  if (ui.titleBadgeModeInput) ui.titleBadgeModeInput.value = prefs.titleBadgeMode || "all";
  if (ui.dmPreviewModeInput) ui.dmPreviewModeInput.value = prefs.streamerMode === "on" ? "off" : (prefs.dmPreviewMode || "full");
  if (ui.streamerModeInput) ui.streamerModeInput.value = prefs.streamerMode || "off";
}

function openSettingsScreen() {
  renderSettingsScreen();
  const uiBindings = window.SHITCORD67_XEP_XMPP_UI_BINDINGS_RUNTIME || null;
  if (typeof uiBindings?.refreshSettingsMediaDeviceOptions === "function") {
    void uiBindings.refreshSettingsMediaDeviceOptions({ force: false });
  }
  setSettingsTab("my-account");
  ui.settingsScreen.classList.add("settings-screen--active");
}

function closeSettingsScreen() {
  ui.settingsScreen.classList.remove("settings-screen--active");
}

function wireDialogBackdropClose(dialog) {
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    const inDialog = (
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom
    );
    if (!inDialog) dialog.close();
  });
}

function showModalDialog(dialog) {
  if (!(dialog instanceof HTMLDialogElement)) return false;
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    return true;
  }
  try {
    if (!dialog.open) dialog.setAttribute("open", "");
  } catch {
    return false;
  }
  return true;
}

function isTypingInputTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest("input, textarea, [contenteditable='true']")) return true;
  return false;
}

function hardenInputAutocompleteNoise() {
  const targets = [
    ui.loginUsername,
    ui.loginPassword,
    ui.loginXmppServer,
    ui.dmSearchInput,
    ui.channelFilterInput,
    ui.memberSearchInput,
    ui.callProviderInput,
    ui.callRoomPrefixInput,
    ui.mediaRuleInput,
    ui.whiteboardProviderInput,
    ui.whiteboardRoomPrefixInput,
    ui.mediaSearchInput,
    ui.findInput,
    ui.findAuthorInput,
    ui.pinsSearchInput,
    ui.quickSwitchInput,
    ui.cosmeticsSearchInput,
    ui.messageInput
  ].filter(Boolean);
  targets.forEach((field) => {
    field.setAttribute("autocomplete", "off");
    field.setAttribute("autocapitalize", "off");
    field.setAttribute("autocorrect", "off");
    field.setAttribute("spellcheck", "false");
  });
}

function render() {
  closeContextMenu();
  if (pruneExpiredStatuses()) saveState();
  renderScreens();
  applyPreferencesToUI();
  if (!state.currentAccountId) {
    closeMediaPicker();
    clearComposerPendingAttachment();
    return;
  }
  ensureMediaRuntimeBootstrapped();
  if (ensureActiveGuildForCurrentAccount()) {
    saveState();
  }
  if (ensureCurrentUserInActiveServer()) {
    saveState();
  }
  if (applyHashConversationNavigation()) {
    saveState();
  }
  if (getViewMode() === "guild" && state.activeGuildId && state.activeChannelId) {
    rememberGuildChannelSelection(state.activeGuildId, state.activeChannelId);
  }
  renderServers();
  renderDmList();
  renderChannels();
  renderMessages();
  renderSwfShelf();
  renderSwfPipDock();
  renderMemberList();
  renderDock();
  renderSettingsScreen();
  renderReplyComposer();
  renderSlashSuggestions();
  renderComposerMeta();
  refreshHeaderActionButtonLabels();
  updateDocumentTitle();
  if (mediaPickerOpen) renderMediaPicker();
  if (ui.cosmeticsDialog?.open) renderCosmeticsDialog();
}

function updateDocumentTitle() {
  const base = "shitcord67";
  const current = getCurrentAccount();
  if (!current) {
    document.title = base;
    return;
  }
  const prefs = getPreferences();
  const dmStats = getTotalDmUnreadStats(current);
  const guildStats = state.guilds.reduce((acc, guild) => {
    const stats = getGuildUnreadStats(guild, current);
    return { unread: acc.unread + stats.unread, mentions: acc.mentions + stats.mentions };
  }, { unread: 0, mentions: 0 });
  const mentions = dmStats.mentions + guildStats.mentions;
  const unread = dmStats.unread + guildStats.unread;
  const badge = prefs.titleBadgeMode === "off"
    ? ""
    : mentions > 0
      ? `@${mentions > 99 ? "99+" : mentions}`
      : (prefs.titleBadgeMode === "all" && unread > 0 ? `${unread > 99 ? "99+" : unread}` : "");
  document.title = badge ? `(${badge}) ${base}` : base;
}

function hasPendingComposerChanges() {
  if (!state.currentAccountId) return false;
  const text = (ui.messageInput?.value || "").trim();
  if (text.length > 0) return true;
  if (composerPendingAttachments.length > 0) return true;
  if (replyTarget) return true;
  return false;
}

function openProfileEditor() {
  const account = getCurrentAccount();
  const guild = getActiveGuild();
  if (!account) return;
  ensureAccountCosmetics(account);
  ui.displayNameInput.value = account.displayName || account.username;
  ui.profileBioInput.value = account.bio || "";
  ui.profileStatusInput.value = account.customStatus || "";
  ui.profileStatusEmojiInput.value = account.customStatusEmoji || "";
  ui.profileAvatarDecorationInput.value = account.avatarDecoration || "";
  ui.profileGuildTagInput.value = account.guildTag || "";
  ui.profileEffectInput.value = accountProfileEffect(account);
  ui.profileNameplateSvgInput.value = account.profileNameplateSvg || "";
  ui.profileStatusExpiryInput.value = statusExpiryPreset(account);
  ui.profileGuildNicknameInput.value = guild ? resolveAccountGuildNickname(account, guild.id) : "";
  const guildAvatar = guild ? resolveAccountAvatar(account, guild.id) : { color: "", url: "" };
  const guildBanner = guild ? resolveAccountBanner(account, guild.id) : "";
  ui.profileGuildAvatarInput.value = guild ? (guildAvatar.color || "") : "";
  if (ui.profileGuildAvatarColorPicker) {
    ui.profileGuildAvatarColorPicker.value = normalizeColorForPicker(ui.profileGuildAvatarInput.value || "#57f287", "#57f287");
    ui.profileGuildAvatarColorPicker.disabled = !guild;
  }
  ui.profileGuildAvatarUrlInput.value = guild ? (guildAvatar.url || "") : "";
  ui.profileGuildBannerInput.value = guild ? guildBanner : "";
  ui.profileGuildStatusInput.value = guild ? ((account.guildProfiles?.[guild.id]?.status || "").toString()) : "";
  ui.profileGuildNicknameInput.disabled = !guild;
  ui.profileGuildAvatarInput.disabled = !guild;
  ui.profileGuildAvatarUrlInput.disabled = !guild;
  ui.profileGuildBannerInput.disabled = !guild;
  ui.profileGuildStatusInput.disabled = !guild;
  ui.presenceInput.value = account.presence || "online";
  ui.profileBannerInput.value = account.banner || "";
  ui.profileAvatarInput.value = account.avatarColor || "#57f287";
  if (ui.profileAvatarColorPicker) {
    ui.profileAvatarColorPicker.value = normalizeColorForPicker(ui.profileAvatarInput.value || "#57f287", "#57f287");
  }
  ui.profileAvatarUrlInput.value = account.avatarUrl || "";
  setProfileAvatarUploadHint("Accepts image files up to 2 MB.");
  renderProfileAvatarPreview();
  renderProfileIdentityPreview();
  ui.profileDialog.showModal();
}

function openTopicEditor() {
  const channel = getActiveChannel();
  if (!channel) return;
  if (!canCurrentUser("manageChannels")) {
    notifyPermissionDenied("Manage Channels");
    return;
  }
  ui.topicInput.value = channel.topic || "";
  ui.topicDialog.showModal();
}

function openChannelSettings() {
  const channel = getActiveChannel();
  const server = getActiveServer();
  if (!channel) return;
  if (!canCurrentUser("manageChannels")) {
    notifyPermissionDenied("Manage Channels");
    return;
  }
  ui.channelRenameInput.value = channel.name || "";
  if (ui.channelSlowmodeInput) {
    ui.channelSlowmodeInput.value = String(getChannelSlowmodeSeconds(channel));
  }
  if (server && ui.channelPermRoleInput) {
    ensureChannelPermissionOverrides(channel, server);
    ui.channelPermRoleInput.innerHTML = "";
    getServerRoles(server).forEach((role) => {
      const option = document.createElement("option");
      option.value = role.id;
      option.textContent = role.name;
      ui.channelPermRoleInput.appendChild(option);
    });
    if (!ui.channelPermRoleInput.value) {
      ui.channelPermRoleInput.value = getServerRoles(server)[0]?.id || "";
    }
    renderChannelPermissionEditor();
  }
  ui.channelSettingsDialog.showModal();
}

function renderChannelPermissionEditor() {
  const channel = getActiveChannel();
  const server = getActiveServer();
  if (!channel || !server) return;
  const roleId = ui.channelPermRoleInput?.value || "";
  if (!roleId) return;
  ensureChannelPermissionOverrides(channel, server);
  if (ui.channelPermViewInput) ui.channelPermViewInput.value = getChannelPermissionOverride(channel, roleId, "viewChannel");
  if (ui.channelPermSendInput) ui.channelPermSendInput.value = getChannelPermissionOverride(channel, roleId, "sendMessages");
  if (ui.channelPermReactInput) ui.channelPermReactInput.value = getChannelPermissionOverride(channel, roleId, "addReactions");
  if (ui.channelPermThreadInput) ui.channelPermThreadInput.value = getChannelPermissionOverride(channel, roleId, "createThreads");
}
