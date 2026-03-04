(function initXepXmppUiBindingsRuntime(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_XMPP_UI_BINDINGS_RUNTIME) return;

  function openXmppConsoleDialogSafe() {
    if (ui.xmppConsoleDialog?.open) {
      if (typeof renderXmppConsoleDialog === "function") renderXmppConsoleDialog();
      ui.xmppConsoleSearchInput?.focus();
      return true;
    }
    if (typeof openXmppConsoleDialog === "function") {
      try {
        openXmppConsoleDialog();
        return true;
      } catch {
        // Fall through to direct dialog open fallback.
      }
    }
    if (ui.xmppConsoleDialog && typeof ui.xmppConsoleDialog.showModal === "function") {
      if (typeof renderXmppConsoleDialog === "function") renderXmppConsoleDialog();
      try {
        ui.xmppConsoleDialog.showModal();
        return true;
      } catch {
        // Continue to debug dialog fallback.
      }
    }
    if (typeof openDebugDialog === "function") {
      openDebugDialog();
      return true;
    }
    return false;
  }

  function markLanguageOnboardingSeen() {
    state.preferences = getPreferences();
    state.preferences.languageOnboardingSeen = "on";
    saveState();
  }

  function shouldShowLanguageOnboardingPrompt() {
    if (!(ui.languageOnboardingDialog instanceof HTMLDialogElement)) return false;
    if (Boolean(state.currentAccountId)) return false;
    const prefs = getPreferences();
    if (normalizeToggle(prefs.languageOnboardingSeen || "off") === "on") return false;
    if (normalizeLanguage(prefs.language || "auto") !== "auto") return false;
    return detectBrowserUiLocale() !== "en";
  }

  function maybeShowLanguageOnboardingPrompt() {
    if (!shouldShowLanguageOnboardingPrompt()) return false;
    if (ui.languageOnboardingDialog.open) return true;
    if (ui.languageOnboardingSelect instanceof HTMLSelectElement) {
      ui.languageOnboardingSelect.value = "en";
    }
    ui.languageOnboardingDialog.showModal();
    return true;
  }

  function languageFlagForToken(token = "") {
    const normalized = normalizeLanguage(token || "auto");
    if (normalized === "de") return "🇩🇪";
    if (normalized === "en") return "🇺🇸";
    const detected = detectBrowserUiLocale();
    return detected === "de" ? "🇩🇪" : "🇺🇸";
  }

  function syncLoginLanguageButton() {
    if (!(ui.loginLanguageBtn instanceof HTMLButtonElement)) return;
    const prefs = getPreferences();
    const selected = normalizeLanguage(prefs.language || "auto");
    const resolved = resolveUiLocale(prefs);
    const flag = languageFlagForToken(selected === "auto" ? resolved : selected);
    ui.loginLanguageBtn.textContent = flag;
    const selectedLabel = selected === "auto" ? `Auto (${resolved.toUpperCase()})` : selected.toUpperCase();
    ui.loginLanguageBtn.title = `Language: ${selectedLabel}. Click to switch.`;
    ui.loginLanguageBtn.setAttribute("aria-label", `Language ${selectedLabel}. Click to switch.`);
  }

  function renderLoginSavedAccountSelect() {
    if (!(ui.loginSavedAccountWrap instanceof HTMLElement) || !(ui.loginSavedAccountSelect instanceof HTMLSelectElement)) return;
    ui.loginSavedAccountSelect.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select saved account";
    ui.loginSavedAccountSelect.appendChild(defaultOption);
    const accounts = Array.isArray(state.accounts)
      ? [...state.accounts].filter(Boolean)
      : [];
    if (accounts.length === 0) {
      ui.loginSavedAccountWrap.hidden = true;
      return;
    }
    accounts
      .sort((a, b) => displayNameForAccount(a, null).localeCompare(displayNameForAccount(b, null)))
      .forEach((account) => {
        const option = document.createElement("option");
        option.value = account.id || "";
        const primary = (account?.xmppJid || account?.username || "").toString().trim();
        const display = displayNameForAccount(account, null);
        option.textContent = primary && display && display !== primary ? `${display} (${primary})` : (display || primary || "account");
        ui.loginSavedAccountSelect.appendChild(option);
      });
    ui.loginSavedAccountWrap.hidden = false;
  }

  function refreshLoginRuntimeUi() {
    renderLoginSavedAccountSelect();
    syncLoginLanguageButton();
  }

  function bindXmppLoginUiRuntimeBindings() {
refreshLoginRuntimeUi();

ui.loginLanguageBtn?.addEventListener("click", () => {
  state.preferences = getPreferences();
  const current = normalizeLanguage(state.preferences.language || "auto");
  const next = current === "auto" ? "en" : current === "en" ? "de" : "auto";
  state.preferences.language = next;
  saveState();
  applyPreferencesToUI();
  syncLoginLanguageButton();
  if (ui.settingsScreen?.classList?.contains("settings-screen--active")) {
    renderSettingsScreen();
  }
});

ui.languageOnboardingKeepAutoBtn?.addEventListener("click", () => {
  markLanguageOnboardingSeen();
  ui.languageOnboardingDialog?.close();
});

ui.languageOnboardingSwitchBtn?.addEventListener("click", () => {
  state.preferences = getPreferences();
  const selected = normalizeLanguage(ui.languageOnboardingSelect?.value || "en");
  state.preferences.language = selected === "auto" ? "en" : selected;
  state.preferences.languageOnboardingSeen = "on";
  saveState();
  render();
  ui.languageOnboardingDialog?.close();
});

ui.languageOnboardingDialog?.addEventListener("cancel", () => {
  markLanguageOnboardingSeen();
});

ui.languageOnboardingDialog?.addEventListener("close", () => {
  const prefs = getPreferences();
  if (normalizeToggle(prefs.languageOnboardingSeen || "off") === "on") return;
  markLanguageOnboardingSeen();
});

ui.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const typed = ui.loginUsername.value;
  const selectedRelayMode = "xmpp";
  const wantsXmpp = true;
  const explicitJid = typed;
  const password = ui.loginPassword?.value || "";
  const wsServer = ui.loginXmppServer?.value || "";
  const rememberLogin = ui.loginRememberInput?.checked !== false;
  const parsed = parseLoginIdentity(typed, explicitJid);
  if (!parsed.accountUsername) {
    showToast("Username must include at least one letter or number.", { tone: "error" });
    return;
  }
  if (wantsXmpp && (!parsed.xmppJid || !password)) {
    showToast("XMPP mode requires a valid JID and password.", { tone: "error" });
    return;
  }
  const submitBtn = ui.loginForm.querySelector("button[type=\"submit\"]");
  if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = true;
  let loginSucceeded = false;
  try {
    let validatedWsUrl = normalizeXmppWsUrl(wsServer);
    if (wantsXmpp) {
      beginLoginXmppProgress();
      const check = await validateXmppLoginCredentials({
        jid: parsed.xmppJid,
        password,
        wsUrl: wsServer,
        onProgress: applyLoginXmppProgressEvent
      });
      validatedWsUrl = check.wsUrl || validatedWsUrl;
      if (!check.ok) {
        applyLoginXmppProgressEvent({ event: "failure", reason: "validation" });
        showToast(check.error || "XMPP login failed.", { tone: "error" });
        return;
      }
    } else {
      resetLoginXmppProgress();
    }
    const xmppConfig = wantsXmpp
      ? {
        jid: parsed.xmppJid,
        password,
        wsUrl: validatedWsUrl || wsServer
      }
      : null;
    if (!createOrSwitchAccount(parsed.accountUsername, {
      displayName: parsed.accountDisplay,
      rememberLogin,
      relayMode: selectedRelayMode,
      xmpp: xmppConfig
    })) {
      showToast("Could not create or switch account.", { tone: "error" });
      return;
    }
    loginSucceeded = true;
    renderScreens();
    ui.loginUsername.value = "";
    if (ui.loginPassword) ui.loginPassword.value = "";
    saveState();
    safeRender("login-submit");
    closeSettingsScreen();
    requestAnimationFrame(() => {
      ui.messageInput.focus();
    });
  } catch (error) {
    const message = String(error?.message || error || "Unknown login error");
    addXmppDebugEvent("error", "Login flow threw an exception", {
      jid: parsed?.xmppJid || "",
      wsUrl: normalizeXmppWsUrl(wsServer),
      error: message
    });
    showToast(`Login failed: ${message}`, { tone: "error", duration: 4200 });
  } finally {
    if (loginSucceeded) resetLoginXmppProgress();
    if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = false;
  }
});

ui.loginForm.addEventListener("invalid", (event) => {
  event.preventDefault();
  showToast("Please fill in the login fields before continuing.", { tone: "error" });
}, true);

ui.loginUsername?.addEventListener("input", () => {
  resetLoginXmppProgress();
  const raw = (ui.loginUsername.value || "").trim();
  if (!looksLikeCompleteJid(raw)) {
    loginXmppDiscoveryToken += 1;
    return;
  }
  if (ui.loginXmppServer && (!ui.loginXmppServer.value.trim() || ui.loginXmppServer.dataset.autofill === "1")) {
    const inferred = inferXmppWsUrlFromJid(raw);
    if (inferred) {
      ui.loginXmppServer.value = inferred;
      ui.loginXmppServer.dataset.autofill = "1";
    }
  }
  void maybeDiscoverLoginXmppWsUrl(raw);
});

ui.loginLocalProfileSelect?.addEventListener("change", () => {
  const selectedId = (ui.loginLocalProfileSelect?.value || "").toString();
  if (!selectedId) return;
  const applied = applyLocalXmppProfileById(selectedId);
  if (!applied) return;
  ui.loginUsername?.focus();
});

ui.loginSavedAccountSelect?.addEventListener("change", () => {
  const selectedId = (ui.loginSavedAccountSelect?.value || "").toString();
  if (!selectedId) return;
  const account = Array.isArray(state.accounts)
    ? state.accounts.find((entry) => entry?.id === selectedId)
    : null;
  if (!account) return;
  const nextIdentity = (account.xmppJid || account.username || "").toString().trim();
  if (ui.loginUsername) ui.loginUsername.value = nextIdentity;
  if (ui.loginPassword) ui.loginPassword.value = "";
  if (ui.loginXmppServer) ui.loginXmppServer.value = "";
  resetLoginXmppProgress();
  ui.loginUsername?.focus();
});

ui.loginXmppServer?.addEventListener("input", () => {
  resetLoginXmppProgress();
  if (!ui.loginXmppServer) return;
  const normalized = normalizeXmppWsUrl(ui.loginXmppServer.value || "");
  const inferred = inferXmppWsUrlFromJid(ui.loginUsername?.value || "");
  ui.loginXmppServer.dataset.autofill = normalized && inferred && normalized === inferred ? "1" : "0";
});

ui.loginPassword?.addEventListener("input", () => {
  resetLoginXmppProgress();
});

ui.loginShowPasswordInput?.addEventListener("change", () => {
  if (!ui.loginPassword) return;
  ui.loginPassword.type = ui.loginShowPasswordInput.checked ? "text" : "password";
});

ui.loginProvidersBtn?.addEventListener("click", () => {
  renderXmppProviderList();
  ui.xmppProviderDialog?.showModal();
});

ui.loginRegisterBtn?.addEventListener("click", () => {
  openXmppRegisterDialog();
});

ui.loginXmppConsoleBtn?.addEventListener("click", () => {
  const opened = openXmppConsoleDialogSafe();
  if (!opened) showToast("XMPP console is unavailable in this runtime.", { tone: "error" });
});

ui.xmppProviderCloseBtn?.addEventListener("click", () => {
  ui.xmppProviderDialog?.close();
});

ui.registerOpenProviderBtn?.addEventListener("click", () => {
  renderXmppProviderList();
  ui.xmppProviderDialog?.showModal();
});

ui.registerCancelBtn?.addEventListener("click", () => {
  ui.xmppRegisterDialog?.close();
});

ui.registerJidInput?.addEventListener("input", () => {
  const raw = normalizeXmppJid(ui.registerJidInput?.value || "");
  if (!looksLikeCompleteJid(raw)) return;
  if (!ui.registerXmppServerInput) return;
  if (!ui.registerXmppServerInput.value.trim() || ui.registerXmppServerInput.dataset.autofill === "1") {
    const inferred = inferXmppWsUrlFromJid(raw);
    if (inferred) {
      ui.registerXmppServerInput.value = inferred;
      ui.registerXmppServerInput.dataset.autofill = "1";
    }
  }
});

ui.registerXmppServerInput?.addEventListener("input", () => {
  if (!ui.registerXmppServerInput) return;
  const normalized = normalizeXmppWsUrl(ui.registerXmppServerInput.value || "");
  const inferred = inferXmppWsUrlFromJid(ui.registerJidInput?.value || "");
  ui.registerXmppServerInput.dataset.autofill = normalized && inferred && normalized === inferred ? "1" : "0";
});

ui.xmppRegisterForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const jid = normalizeXmppJid(ui.registerJidInput?.value || "");
  const password = normalizeXmppPassword(ui.registerPasswordInput?.value || "");
  const wsUrl = normalizeXmppWsUrl(ui.registerXmppServerInput?.value || "");
  if (!looksLikeCompleteJid(jid)) {
    showToast("Enter a valid XMPP JID for registration.", { tone: "error" });
    return;
  }
  if (!password) {
    showToast("Password is required for registration.", { tone: "error" });
    return;
  }
  if (ui.registerSubmitBtn instanceof HTMLButtonElement) ui.registerSubmitBtn.disabled = true;
  try {
    const result = await registerXmppViaLocalGateway({
      jid,
      password,
      wsUrl
    });
    if (!result.ok) {
      addXmppDebugEvent("error", "In-client registration failed", {
        jid,
        wsUrl: result.wsUrl || wsUrl || "",
        error: result.error || "",
        failures: result.failures || []
      });
      showToast(result.error || "Registration failed.", { tone: "error", duration: 3400 });
      return;
    }
    addXmppDebugEvent("connect", "In-client registration succeeded", {
      jid,
      wsUrl: result.wsUrl || wsUrl || ""
    });
    ui.xmppRegisterDialog?.close();
    showToast("Account registered. Enter credentials on login to continue.");
  } finally {
    if (ui.registerSubmitBtn instanceof HTMLButtonElement) ui.registerSubmitBtn.disabled = false;
  }
});

requestAnimationFrame(() => {
  maybeShowLanguageOnboardingPrompt();
});

  }

  function bindXmppSettingsUiRuntimeBindings() {
ui.guildNotifForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const guild = getActiveGuild();
  if (!guild) return;
  setGuildNotificationMode(guild.id, ui.guildNotifModeInput.value);
  saveState();
  renderServers();
  renderChannels();
  renderSettingsScreen();
});

ui.appearanceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.preferences = getPreferences();
  state.preferences.uiScale = Math.min(115, Math.max(90, Number(ui.uiScaleInput.value) || 100));
  state.preferences.theme = normalizeTheme(ui.themeInput.value);
  state.preferences.language = normalizeLanguage(ui.languageInput?.value || "auto");
  state.preferences.compactMembers = normalizeToggle(ui.compactModeInput.value);
  saveState();
  render();
});

ui.advancedForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.preferences = getPreferences();
  state.preferences.developerMode = normalizeToggle(ui.developerModeInput.value);
  state.preferences.debugOverlay = normalizeToggle(ui.debugOverlayInput.value);
  state.preferences.rememberLoginStorage = normalizeToggle(ui.rememberLoginStorageInput?.value || "off");
  state.preferences.swfAudioPolicy = normalizeSwfAudioPolicy(ui.swfAudioPolicyInput.value);
  state.preferences.swfAudioScope = normalizeSwfAudioScope(ui.swfAudioScopeInput.value);
  state.preferences.swfAutoplay = normalizeSwfAutoplay(ui.swfAutoplayInput.value);
  state.preferences.hapticMode = normalizeHapticMode(ui.hapticModeInput?.value || "full");
  state.preferences.swfPauseOnMute = normalizeToggle(ui.swfPauseOnMuteInput.value);
  state.preferences.swfVuMeter = normalizeToggle(ui.swfVuMeterInput.value);
  state.preferences.relayMode = normalizeRelayMode(ui.relayModeInput?.value || "local");
  state.preferences.relayUrl = normalizeRelayUrl(ui.relayUrlInput?.value || "");
  state.preferences.relayRoom = normalizeRelayRoom(ui.relayRoomInput?.value || "");
  state.preferences.relayAutoConnect = normalizeToggle(ui.relayAutoConnectInput?.value || "on");
  if (!state.preferences.relayClientId) state.preferences.relayClientId = createId();
  state.preferences.xmppJid = normalizeXmppJid(ui.xmppJidInput?.value || "");
  state.preferences.xmppPassword = normalizeXmppPassword(ui.xmppPasswordInput?.value || "");
  state.preferences.xmppWsUrl = normalizeXmppWsUrl(ui.xmppWsUrlInput?.value || "");
  state.preferences.xmppMucService = normalizeXmppMucService(ui.xmppMucServiceInput?.value || "");
  state.preferences.xmppHideNonXmpp = normalizeToggle(ui.xmppHideNonXmppInput?.value || "on");
  state.preferences.callProviderUrl = normalizeConferenceProviderUrl(ui.callProviderInput?.value || "");
  state.preferences.callRoomPrefix = normalizeConferenceRoomPrefix(ui.callRoomPrefixInput?.value || "");
  state.preferences.callAutoPost = normalizeToggle(ui.callAutoPostInput?.value || "on");
  state.preferences.platformOverride = normalizePlatformOverride(ui.platformOverrideInput?.value || "auto");
  state.preferences.whiteboardProviderUrl = normalizeWhiteboardProviderUrl(ui.whiteboardProviderInput?.value || "");
  state.preferences.whiteboardRoomPrefix = normalizeWhiteboardRoomPrefix(ui.whiteboardRoomPrefixInput?.value || "");
  state.preferences.whiteboardAutoPost = normalizeToggle(ui.whiteboardAutoPostInput?.value || "on");
  if (!saveTenorCredentialSettings({ refreshGifPicker: true })) {
    showToast("Could not save Tenor credentials.", { tone: "error" });
  }
  saveState();
  if (window.SHITCORD67_NATIVE_CREDENTIALS?.syncFromState) {
    void window.SHITCORD67_NATIVE_CREDENTIALS.syncFromState({ force: true });
  }
  if (["local", "ws", "http", "xmpp"].includes(state.preferences.relayMode) && state.preferences.relayAutoConnect === "on") {
    connectRelaySocket({ force: true });
  } else if (!["local", "ws", "http", "xmpp"].includes(state.preferences.relayMode)) {
    disconnectRelaySocket({ manual: true });
  }
  renderRelayStatusOutput();
  refreshSwfAudioFocus();
  render();
});

ui.credentialStoragePermissionBtn?.addEventListener("click", async () => {
  const nativeCreds = window.SHITCORD67_NATIVE_CREDENTIALS || null;
  if (!nativeCreds || typeof nativeCreds.requestPermission !== "function") {
    showToast("Storage permission request is unavailable in this runtime.", { tone: "error" });
    return;
  }
  ui.credentialStoragePermissionBtn.disabled = true;
  const result = await nativeCreds.requestPermission();
  ui.credentialStoragePermissionBtn.disabled = false;
  if (result?.granted) {
    showToast("Storage permission granted.");
  } else {
    showToast("Storage permission not granted.", { tone: "error" });
  }
  renderSettingsScreen();
});

ui.addMediaRuleBtn?.addEventListener("click", () => {
  addMediaRuleFromSettingsInput();
});

ui.mediaRuleInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addMediaRuleFromSettingsInput();
});

ui.toggleTenorApiKeyBtn?.addEventListener("click", () => {
  setTenorApiKeyVisibility(!tenorApiKeyVisible);
});

ui.clearTenorCredentialsBtn?.addEventListener("click", () => {
  if (ui.tenorApiKeyInput) ui.tenorApiKeyInput.value = "";
  if (ui.tenorClientKeyInput) ui.tenorClientKeyInput.value = "";
  const saved = saveTenorCredentialSettings({ refreshGifPicker: true });
  if (!saved) {
    showToast("Could not clear Tenor credentials.", { tone: "error" });
    return;
  }
  showToast("Tenor credentials cleared.");
});

ui.testTenorCredentialsBtn?.addEventListener("click", async () => {
  const saved = saveTenorCredentialSettings({ refreshGifPicker: false });
  if (!saved) {
    showToast("Could not save Tenor credentials.", { tone: "error" });
    return;
  }
  ui.testTenorCredentialsBtn.disabled = true;
  setTenorCredentialsStatus("Testing Tenor credentials...");
  const result = await fetchTenorGifEntries("cat", "");
  ui.testTenorCredentialsBtn.disabled = false;
  if (result.error) {
    setTenorCredentialsStatus(`Tenor test failed: ${result.error}`, "error");
    showToast("Tenor credentials test failed.", { tone: "error" });
    return;
  }
  const count = Array.isArray(result.entries) ? result.entries.length : 0;
  setTenorCredentialsStatus(`Tenor test succeeded (${count} result${count === 1 ? "" : "s"}).`, "ok");
  showToast("Tenor credentials test passed.");
  if (mediaPickerOpen && mediaPickerTab === "gif") {
    invalidateGifPickerRemoteEntries();
    maybeLoadMoreGifPickerEntries({ reset: true, force: true });
  } else if (mediaPickerOpen && mediaPickerTab === "sticker") {
    invalidateStickerPickerRemoteEntries();
    maybeLoadMoreStickerPickerEntries({ reset: true, force: true });
  }
});

ui.relayConnectBtn?.addEventListener("click", () => {
  state.preferences = getPreferences();
  state.preferences.relayMode = normalizeRelayMode(ui.relayModeInput?.value || "ws");
  state.preferences.relayUrl = normalizeRelayUrl(ui.relayUrlInput?.value || "");
  state.preferences.relayRoom = normalizeRelayRoom(ui.relayRoomInput?.value || "");
  state.preferences.relayAutoConnect = normalizeToggle(ui.relayAutoConnectInput?.value || "on");
  if (!state.preferences.relayClientId) state.preferences.relayClientId = createId();
  state.preferences.xmppJid = normalizeXmppJid(ui.xmppJidInput?.value || "");
  state.preferences.xmppPassword = normalizeXmppPassword(ui.xmppPasswordInput?.value || "");
  state.preferences.xmppWsUrl = normalizeXmppWsUrl(ui.xmppWsUrlInput?.value || "");
  state.preferences.xmppMucService = normalizeXmppMucService(ui.xmppMucServiceInput?.value || "");
  state.preferences.xmppHideNonXmpp = normalizeToggle(ui.xmppHideNonXmppInput?.value || "on");
  saveState();
  connectRelaySocket({ force: true });
});

ui.relayDisconnectBtn?.addEventListener("click", () => {
  disconnectRelaySocket({ manual: true });
});

ui.exportDataBtn.addEventListener("click", () => {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shitcord67-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

ui.importDataBtn.addEventListener("click", () => ui.importDataInput.click());
function triggerImportSwfSaves() {
  ui.importSwfSavesInput.click();
}
ui.importSwfSavesBtn.addEventListener("click", triggerImportSwfSaves);

function collectRuffleSaveEntries() {
  const entries = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (!/(ruffle|sharedobject|flash|\.sol)/i.test(key)) continue;
    const value = localStorage.getItem(key);
    if (value === null) continue;
    entries.push({ key, value });
  }
  return entries;
}

function exportSwfSavesNow() {
  const payload = {
    exportedAt: new Date().toISOString(),
    origin: location.origin,
    entries: collectRuffleSaveEntries()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shitcord67-swf-saves-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

ui.exportSwfSavesBtn.addEventListener("click", exportSwfSavesNow);

ui.openDebugConsoleBtn.addEventListener("click", () => {
  openDebugDialog();
});

ui.openXmppConsoleBtn?.addEventListener("click", () => {
  const opened = openXmppConsoleDialogSafe();
  if (!opened) showToast("XMPP console is unavailable in this runtime.", { tone: "error" });
});

ui.refreshDebugBtn.addEventListener("click", () => {
  renderDebugDialog();
});

ui.copyDebugBtn.addEventListener("click", () => {
  void copyText(formatDebugLogs()).then((ok) => {
    showToast(ok ? "Debug logs copied." : "Clipboard blocked. Manual copy prompt opened.", { tone: ok ? "info" : "error" });
  });
});

ui.clearDebugBtn.addEventListener("click", () => {
  debugLogs.length = 0;
  addDebugLog("info", "Debug log cleared");
  renderDebugDialog();
});

ui.debugCloseBtn.addEventListener("click", () => {
  ui.debugDialog.close();
});

ui.refreshXmppConsoleBtn?.addEventListener("click", () => {
  renderXmppConsoleDialog();
});

ui.omemoHeaderBtn?.addEventListener("click", () => {
  const conversation = getActiveConversation();
  const account = getCurrentAccount();
  const state = resolveOmemoHeaderState(conversation, account);
  if (!state.visible) return;
  if (!state.runtimeReady) {
    showToast("OMEMO runtime is not available in this build.", { tone: "error" });
    return;
  }
  if (!state.peerBare) return;
  const nextEnabled = !state.enabled;
  xmppOmemoSetPeerEnabled(state.peerBare, nextEnabled);
  const label = nextEnabled ? "enabled" : "disabled";
  if (addSystemDmMessageByPeerJid(state.peerBare, `OMEMO ${label} for this DM.`)) {
    refreshDmUiForPeerJid(state.peerBare);
  }
  showToast(`OMEMO ${label}.`, { tone: "info" });
  if (nextEnabled) {
    const ownBare = xmppBareJid(getPreferences().xmppJid || "");
    void (async () => {
      if (!ownBare) return;
      await xmppOmemoEnsureOwnBundle(ownBare);
      await xmppOmemoFetchDeviceList(state.peerBare);
      await xmppOmemoEnsurePeerSessions(state.peerBare, ownBare);
    })();
  }
  updateOmemoHeaderControl(conversation, account);
});

ui.omemoHeaderBtn?.addEventListener("contextmenu", (event) => {
  const conversation = getActiveConversation();
  const account = getCurrentAccount();
  const state = resolveOmemoHeaderState(conversation, account);
  if (!state.visible) return;
  const ownBare = xmppBareJid(getPreferences().xmppJid || "");
  openContextMenu(event, [
    {
      label: state.enabled ? "Disable OMEMO" : "Enable OMEMO",
      disabled: !state.runtimeReady,
      action: () => {
        xmppOmemoSetPeerEnabled(state.peerBare, !state.enabled);
        updateOmemoHeaderControl(conversation, account);
        if (addSystemDmMessageByPeerJid(state.peerBare, `OMEMO ${state.enabled ? "disabled" : "enabled"} for this DM.`)) {
          refreshDmUiForPeerJid(state.peerBare);
        }
      }
    },
    {
      label: "Refresh OMEMO Sessions",
      disabled: !state.runtimeReady || !ownBare,
      action: async () => {
        await xmppOmemoEnsureOwnBundle(ownBare, { force: true });
        await xmppOmemoFetchDeviceList(state.peerBare);
        await xmppOmemoEnsurePeerSessions(state.peerBare, ownBare);
        showToast("OMEMO sessions refreshed.", { tone: "info" });
      }
    },
    {
      label: "Show OMEMO Devices",
      disabled: !state.runtimeReady,
      action: async () => {
        const devices = await xmppOmemoFetchDeviceList(state.peerBare);
        const text = devices.length > 0
          ? `OMEMO devices for ${state.peerBare}: ${devices.join(", ")}`
          : `No OMEMO device list for ${state.peerBare} yet.`;
        if (addSystemDmMessageByPeerJid(state.peerBare, text)) {
          refreshDmUiForPeerJid(state.peerBare);
        }
      }
    }
  ]);
});

ui.copyXmppConsoleBtn?.addEventListener("click", () => {
  void copyText(formatXmppConsoleLogs()).then((ok) => {
    showToast(ok ? "XMPP logs copied." : "Clipboard blocked. Manual copy prompt opened.", { tone: ok ? "info" : "error" });
  });
});

ui.clearXmppConsoleBtn?.addEventListener("click", () => {
  xmppDebugEvents.length = 0;
  addXmppDebugEvent("runtime", "XMPP console log cleared");
  renderXmppConsoleDialog();
});

ui.pauseXmppConsoleBtn?.addEventListener("click", () => {
  xmppDebugPaused = !xmppDebugPaused;
  renderXmppConsoleDialog();
});

ui.xmppConsoleFilterInput?.addEventListener("change", () => {
  xmppDebugFilter = (ui.xmppConsoleFilterInput?.value || "all").toString();
  renderXmppConsoleDialog();
});

ui.xmppConsoleSearchInput?.addEventListener("input", () => {
  xmppDebugSearch = (ui.xmppConsoleSearchInput?.value || "").toString();
  renderXmppConsoleDialog();
});

ui.xmppConsoleCloseBtn?.addEventListener("click", () => {
  ui.xmppConsoleDialog?.close();
});

  }

  globalScope.SHITCORD67_XEP_XMPP_UI_BINDINGS_RUNTIME = Object.freeze({
    bindXmppLoginUiRuntimeBindings,
    bindXmppSettingsUiRuntimeBindings,
    maybeShowLanguageOnboardingPrompt,
    refreshLoginRuntimeUi
  });

  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-xmpp-ui-bindings-runtime", globalScope.SHITCORD67_XEP_XMPP_UI_BINDINGS_RUNTIME);
  }
})(typeof window !== "undefined" ? window : globalThis);
