(function initXep0156XmppLoginDiscoveryRuntime(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME) return;

  function classifyNoWebsocketEndpointHint(failures = []) {
    const list = Array.isArray(failures) ? failures : [];
    if (list.length === 0) return "";
    const connectOnly = list.every((entry) => (entry?.reason || "connect") === "connect");
    if (!connectOnly) return "";
    const signals = list.map((entry) => (entry?.error || "").toString().toLowerCase());
    const hasRedirect = signals.some((text) => text.includes("unexpected server response: 301") || text.includes("unexpected server response: 302"));
    const hasNotFound = signals.some((text) => text.includes("unexpected server response: 404"));
    const hasDns = signals.some((text) => text.includes("enotfound"));
    const hasTimeout = signals.some((text) => text.includes("timeout"));
    if (hasRedirect || hasNotFound || hasDns || hasTimeout) {
      return " Provider likely does not expose a usable XMPP WebSocket endpoint for this client path.";
    }
    return "";
  }

  function looksLikeCompleteJid(jid) {
    const raw = normalizeXmppJid(jid);
    if (!raw || raw.includes(" ")) return false;
    const at = raw.indexOf("@");
    if (at <= 0 || at >= raw.length - 1) return false;
    const local = raw.slice(0, at);
    const domain = raw.slice(at + 1).toLowerCase();
    if (!local || domain.startsWith(".") || domain.endsWith(".")) return false;
    const labels = domain.split(".");
    if (labels.length === 0 || labels.some((label) => !label)) return false;
    try {
      return labels.every((label) => /^[\p{L}\p{N}-]{1,63}$/u.test(label) && !label.startsWith("-") && !label.endsWith("-"));
    } catch {
      return labels.every((label) => /^[a-z0-9-]{1,63}$/i.test(label) && !label.startsWith("-") && !label.endsWith("-"));
    }
  }

  function knownXmppWsForDomain(domain) {
    const normalized = (domain || "").toString().trim().toLowerCase();
    const known = {
      "xmpp.jp": "wss://api.xmpp.jp/ws"
    };
    return known[normalized] || "";
  }

  function resolveXmppWsCandidates(jid, explicitWs = "") {
    const candidates = [];
    const push = (url) => {
      const normalized = normalizeXmppWsUrl(url);
      if (!normalized) return;
      if (!candidates.includes(normalized)) candidates.push(normalized);
    };
    const domain = xmppDomainFromJid(jid);
    const explicit = normalizeXmppWsUrl(explicitWs);
    const explicitMatchesDomain = (() => {
      if (!explicit || !domain) return true;
      try {
        const host = new URL(explicit).hostname.toLowerCase();
        return host === domain || host.endsWith(`.${domain}`);
      } catch {
        return false;
      }
    })();
    if (explicit && explicitMatchesDomain) push(explicit);
    if (!domain || !looksLikeCompleteJid(jid)) {
      if (explicit && !explicitMatchesDomain) push(explicit);
      return candidates;
    }
    const knownWs = knownXmppWsForDomain(domain);
    if (knownWs) {
      push(knownWs);
      if (explicit && !explicitMatchesDomain) push(explicit);
      return candidates;
    }
    push(`wss://api.${domain}/ws`);
    push(`wss://${domain}/ws`);
    push(`wss://${domain}/xmpp-websocket`);
    push(`wss://${domain}/xmpp-websocket/`);
    push(`wss://ws.${domain}/ws`);
    push(`wss://ws.${domain}/xmpp-websocket`);
    push(`wss://ws.${domain}/xmpp-websocket/`);
    push(`wss://xmpp.${domain}/ws`);
    push(`wss://xmpp.${domain}/xmpp-websocket`);
    push(`wss://xmpp.${domain}/xmpp-websocket/`);
    push(`wss://chat.${domain}/ws`);
    push(`wss://chat.${domain}/xmpp-websocket`);
    push(`wss://chat.${domain}/xmpp-websocket/`);
    push(`wss://${domain}:5281/ws`);
    push(`wss://${domain}:5281/xmpp-websocket`);
    if (explicit && !explicitMatchesDomain) push(explicit);
    return candidates.slice(0, 14);
  }

  function inferXmppWsUrlFromJid(jid) {
    const [first] = resolveXmppWsCandidates(jid, "");
    return first || "";
  }

  function hostMetaDiscoverySources(domain = "") {
    const cleanDomain = (domain || "").toString().trim().toLowerCase();
    if (!cleanDomain) return [];
    return [
      `https://${cleanDomain}/.well-known/host-meta.json`,
      `https://${cleanDomain}/.well-known/host-meta`,
      `https://${cleanDomain}/host-meta.json`,
      `https://${cleanDomain}/host-meta`
    ];
  }

  async function discoverXmppWsViaHostMeta(jid, { force = false, timeoutMs = XMPP_HOST_META_TIMEOUT_MS } = {}) {
    const cleanJid = normalizeXmppJid(jid);
    const domain = xmppDomainFromJid(cleanJid);
    if (!domain || !looksLikeCompleteJid(cleanJid)) return [];
    if (XMPP_PLAIN_ONLY_DOMAINS.has(domain)) {
      addXmppDebugEvent("runtime", "Skipping host-meta discovery for known-cert-mismatch domain", { domain });
      return [];
    }
    const cacheKey = domain.toLowerCase();
    const cacheEntry = xmppWsDiscoveryCache.get(cacheKey);
    const now = Date.now();
    if (!force && cacheEntry && (now - cacheEntry.ts) < (15 * 60 * 1000)) return cacheEntry.urls.slice();
    try {
      const gatewayResponse = await fetch(`${XMPP_LOCAL_AUTH_GATEWAY_URL}/discover`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jid: cleanJid,
          timeoutMs: Math.max(2000, Math.min(9000, Number(timeoutMs) || XMPP_HOST_META_TIMEOUT_MS))
        })
      });
      if (gatewayResponse.ok) {
        const payload = await gatewayResponse.json().catch(() => ({}));
        const urls = Array.isArray(payload?.urls)
          ? payload.urls.map((entry) => normalizeXmppWsUrl(entry)).filter(Boolean)
          : [];
        xmppWsDiscoveryCache.set(cacheKey, { ts: now, urls: urls.slice(0, 8) });
        addXmppDebugEvent("runtime", "Host-meta discovery via local gateway", {
          domain,
          found: urls.length,
          source: `${XMPP_LOCAL_AUTH_GATEWAY_URL}/discover`
        });
        if (urls.length === 0) {
          addXmppDebugEvent("runtime", "No WebSocket endpoints found in host-meta (gateway)", { domain });
        }
        return urls.slice(0, 8);
      }
      addXmppDebugEvent("runtime", "Local gateway discovery returned non-OK status", {
        domain,
        status: gatewayResponse.status
      });
      if (!XMPP_ENABLE_BROWSER_HOST_META_FALLBACK) {
        addXmppDebugEvent("runtime", "Skipping browser host-meta fetch to avoid CORS noise", { domain });
        return [];
      }
    } catch (error) {
      addXmppDebugEvent("runtime", "Local gateway discovery unavailable; falling back to browser fetch", {
        domain,
        error: String(error?.message || error)
      });
      if (!XMPP_ENABLE_BROWSER_HOST_META_FALLBACK) {
        addXmppDebugEvent("runtime", "Browser host-meta fallback disabled", { domain });
        return [];
      }
    }
    const endpoints = [];
    const sources = hostMetaDiscoverySources(domain);
    addXmppDebugEvent("runtime", "Discovering XMPP endpoints via host-meta", { domain, sources });
    for (const url of sources) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const response = await fetchWithTimeout(url, timeoutMs);
        if (!response.ok) {
          addXmppDebugEvent("runtime", "Host-meta source returned non-OK status", { url, status: response.status });
          continue;
        }
        const contentType = (response.headers.get("content-type") || "").toLowerCase();
        const isJsonSource = contentType.includes("json") || /\.json($|\?)/i.test(url);
        if (isJsonSource) {
          // eslint-disable-next-line no-await-in-loop
          const payload = await response.json();
          parseXmppHostMetaJson(payload).forEach((candidate) => {
            if (!endpoints.includes(candidate)) endpoints.push(candidate);
          });
        } else {
          // eslint-disable-next-line no-await-in-loop
          const text = await response.text();
          parseXmppHostMetaXml(text).forEach((candidate) => {
            if (!endpoints.includes(candidate)) endpoints.push(candidate);
          });
        }
        addXmppDebugEvent("runtime", "Host-meta source parsed", {
          url,
          contentType,
          found: endpoints.length
        });
      } catch (error) {
        addXmppDebugEvent("runtime", "Host-meta source failed", { url, error: String(error?.message || error) });
      }
    }
    xmppWsDiscoveryCache.set(cacheKey, { ts: now, urls: endpoints.slice(0, 8) });
    if (endpoints.length === 0) {
      addXmppDebugEvent("runtime", "No WebSocket endpoints found in host-meta", { domain });
    } else {
      addXmppDebugEvent("runtime", "Discovered XMPP WebSocket endpoints", { domain, endpoints });
    }
    return endpoints.slice(0, 8);
  }

  async function validateXmppViaLocalGateway({ jid, password, candidates, timeoutMs = 10000 }) {
    const cleanJid = normalizeXmppJid(jid);
    const cleanPass = normalizeXmppPassword(password);
    const wsCandidates = Array.isArray(candidates)
      ? candidates.map((entry) => normalizeXmppWsUrl(entry)).filter(Boolean)
      : [];
    if (!cleanJid || !cleanPass || wsCandidates.length === 0) return null;
    const gatewayUrl = XMPP_LOCAL_AUTH_GATEWAY_URL;
    addXmppDebugEvent("connect", "Attempting local Node XMPP auth gateway", {
      gatewayUrl,
      jid: cleanJid,
      candidates: wsCandidates
    });
    try {
      const response = await fetch(`${gatewayUrl}/auth-check`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jid: cleanJid,
          password: cleanPass,
          candidates: wsCandidates,
          timeoutMs: Math.max(3000, Math.min(15000, Number(timeoutMs) || 10000))
        })
      });
      if (!response.ok) {
        addXmppDebugEvent("runtime", "Local auth gateway returned non-OK status", {
          gatewayUrl,
          status: response.status
        });
        return null;
      }
      const payload = await response.json();
      if (payload?.ok && normalizeXmppWsUrl(payload.wsUrl || "")) {
        addXmppDebugEvent("connect", "Local auth gateway succeeded", {
          gatewayUrl,
          wsUrl: normalizeXmppWsUrl(payload.wsUrl || "")
        });
        return {
          ok: true,
          wsUrl: normalizeXmppWsUrl(payload.wsUrl || "")
        };
      }
      addXmppDebugEvent("runtime", "Local auth gateway rejected credentials", {
        gatewayUrl,
        error: (payload?.error || "").toString().slice(0, 160),
        failures: Array.isArray(payload?.failures) ? payload.failures.slice(0, 4) : []
      });
      const failures = Array.isArray(payload?.failures) ? payload.failures.slice(0, 6) : [];
      const noWsHint = classifyNoWebsocketEndpointHint(failures);
      return {
        ok: false,
        error: [
          (payload?.error || "Local gateway rejected login.").toString(),
          noWsHint.trim(),
          Array.isArray(payload?.failures) && payload.failures.length > 0
            ? `Details: ${payload.failures.map((entry) => `${entry.wsUrl || "?"} ${entry.reason || "connect"}${entry.error ? ` (${entry.error})` : ""}`).join("; ")}`
            : ""
        ].filter(Boolean).join(" ").slice(0, 480)
      };
    } catch (error) {
      addXmppDebugEvent("runtime", "Local auth gateway unavailable", {
        gatewayUrl,
        error: String(error?.message || error)
      });
      return null;
    }
  }

  async function registerXmppViaLocalGateway({ jid, password, wsUrl = "", timeoutMs = 12000 }) {
    const cleanJid = normalizeXmppJid(jid);
    const cleanPass = normalizeXmppPassword(password);
    if (!cleanJid || !cleanPass) {
      return { ok: false, error: "JID and password are required for registration.", wsUrl: "" };
    }
    const explicitWs = normalizeXmppWsUrl(wsUrl);
    const domain = xmppDomainFromJid(cleanJid);
    let candidates = resolveXmppWsCandidates(cleanJid, explicitWs);
    if (candidates.length === 0 && explicitWs) candidates = [explicitWs];
    if (!XMPP_PLAIN_ONLY_DOMAINS.has(domain)) {
      try {
        const discovered = await discoverXmppWsViaHostMeta(cleanJid);
        if (discovered.length > 0) {
          const merged = [];
          const push = (value) => {
            const normalized = normalizeXmppWsUrl(value);
            if (!normalized) return;
            if (!merged.includes(normalized)) merged.push(normalized);
          };
          push(explicitWs);
          discovered.forEach((entry) => push(entry));
          candidates.forEach((entry) => push(entry));
          candidates = merged;
        }
      } catch {
        // Continue with fallback candidates only.
      }
    }
    if (candidates.length === 0) {
      return { ok: false, error: "Could not determine a valid XMPP WebSocket endpoint for registration.", wsUrl: "" };
    }
    addXmppDebugEvent("connect", "Attempting in-client registration via local gateway", {
      jid: cleanJid,
      gatewayUrl: XMPP_LOCAL_AUTH_GATEWAY_URL,
      candidates
    });
    try {
      const response = await fetch(`${XMPP_LOCAL_AUTH_GATEWAY_URL}/register`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jid: cleanJid,
          password: cleanPass,
          candidates,
          timeoutMs: Math.max(5000, Math.min(20000, Number(timeoutMs) || 12000))
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          ok: false,
          wsUrl: normalizeXmppWsUrl(payload?.wsUrl || "") || candidates[0] || "",
          error: (payload?.error || `Registration gateway returned HTTP ${response.status}.`).toString().slice(0, 420)
        };
      }
      return {
        ok: Boolean(payload?.ok),
        wsUrl: normalizeXmppWsUrl(payload?.wsUrl || "") || candidates[0] || "",
        error: [
          (payload?.error || "").toString(),
          classifyNoWebsocketEndpointHint(Array.isArray(payload?.failures) ? payload.failures : []).trim()
        ].filter(Boolean).join(" ").slice(0, 420),
        failures: Array.isArray(payload?.failures) ? payload.failures.slice(0, 5) : []
      };
    } catch (error) {
      return {
        ok: false,
        wsUrl: candidates[0] || "",
        error: `Registration gateway unavailable at ${XMPP_LOCAL_AUTH_GATEWAY_URL}: ${String(error?.message || error)}`
      };
    }
  }

  async function maybeDiscoverLoginXmppWsUrl(jid) {
    const cleanJid = normalizeXmppJid(jid);
    if (!looksLikeCompleteJid(cleanJid)) return;
    const token = ++loginXmppDiscoveryToken;
    const discovered = await discoverXmppWsViaHostMeta(cleanJid);
    if (token !== loginXmppDiscoveryToken) return;
    if (!ui.loginXmppServer) return;
    const currentWs = normalizeXmppWsUrl(ui.loginXmppServer.value || "");
    const first = discovered[0] || "";
    if (!first) return;
    if (!currentWs || ui.loginXmppServer.dataset.autofill === "1") {
      ui.loginXmppServer.value = first;
      ui.loginXmppServer.dataset.autofill = "1";
      addXmppDebugEvent("connect", "Applied discovered login WebSocket endpoint", { jid: cleanJid, wsUrl: first });
    }
  }

  function clearLoginXmppProgressTimer() {
    if (loginXmppProgressTimerId) {
      window.clearInterval(loginXmppProgressTimerId);
      loginXmppProgressTimerId = null;
    }
  }

  function formatElapsedTimer(ms) {
    const total = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
    const minutes = Math.floor(total / 60);
    const seconds = String(total % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function updateLoginXmppProgressTimer() {
    if (!ui.loginXmppProgressTimer || !loginXmppProgressStartedAt) return;
    ui.loginXmppProgressTimer.textContent = formatElapsedTimer(Date.now() - loginXmppProgressStartedAt);
  }

  function setLoginXmppProgress({
    visible = true,
    state = "",
    status = "",
    detail = ""
  } = {}) {
    if (!ui.loginXmppProgress) return;
    ui.loginXmppProgress.hidden = !visible;
    if (!visible) {
      clearLoginXmppProgressTimer();
      return;
    }
    if (state) {
      ui.loginXmppProgress.dataset.state = state;
    } else {
      ui.loginXmppProgress.removeAttribute("data-state");
    }
    if (status && ui.loginXmppProgressStatus) ui.loginXmppProgressStatus.textContent = status;
    if (detail && ui.loginXmppProgressDetail) ui.loginXmppProgressDetail.textContent = detail;
    updateLoginXmppProgressTimer();
  }

  function resetLoginXmppProgress() {
    loginXmppProgressStartedAt = 0;
    clearLoginXmppProgressTimer();
    setLoginXmppProgress({ visible: false });
  }

  function beginLoginXmppProgress() {
    loginXmppProgressStartedAt = Date.now();
    setLoginXmppProgress({
      visible: true,
      state: "",
      status: "Signing in...",
      detail: "First we find the right chat server, then we check your password."
    });
    clearLoginXmppProgressTimer();
    updateLoginXmppProgressTimer();
    loginXmppProgressTimerId = window.setInterval(() => {
      updateLoginXmppProgressTimer();
    }, 500);
  }

  function applyLoginXmppProgressEvent(event) {
    if (!event || typeof event !== "object") return;
    const mode = (event.mode || "").toString();
    if (event.event === "start") {
      const count = Math.max(1, Number(event.candidateCount) || 1);
      setLoginXmppProgress({
        visible: true,
        state: "",
        status: "Looking for the best door...",
        detail: `I will try up to ${count} server doors until one opens.`
      });
      return;
    }
    if (event.event === "runtime-loading") {
      setLoginXmppProgress({
        status: "Waking up chat tools...",
        detail: "Loading the XMPP engine."
      });
      return;
    }
    if (event.event === "gateway-start") {
      const count = Math.max(1, Number(event.candidateCount) || 1);
      setLoginXmppProgress({
        status: "Checking with helper service...",
        detail: mode === "first"
          ? `Trying local helper first (${count} server doors).`
          : "Trying local helper as backup."
      });
      return;
    }
    if (event.event === "candidate-start") {
      const index = Number(event.index) || 1;
      const total = Math.max(index, Number(event.total) || index);
      const hostLabel = (() => {
        try {
          return new URL(event.wsUrl || "").host || event.wsUrl || "server";
        } catch {
          return (event.wsUrl || "server").toString();
        }
      })();
      setLoginXmppProgress({
        status: `Trying door ${index} of ${total}...`,
        detail: `Checking ${hostLabel}`
      });
      return;
    }
    if (event.event === "candidate-timeout") {
      setLoginXmppProgress({
        status: "That door did not answer...",
        detail: "Trying the next one."
      });
      return;
    }
    if (event.event === "candidate-authfail") {
      setLoginXmppProgress({
        state: "error",
        status: "Password check failed.",
        detail: "Please check your JID and password."
      });
      return;
    }
    if (event.event === "gateway-fallback") {
      setLoginXmppProgress({
        status: "Trying another path...",
        detail: "The helper path did not work, trying browser path now."
      });
      return;
    }
    if (event.event === "success") {
      const hostLabel = (() => {
        try {
          return new URL(event.wsUrl || "").host || event.wsUrl || "";
        } catch {
          return (event.wsUrl || "").toString();
        }
      })();
      setLoginXmppProgress({
        state: "ok",
        status: "Connected!",
        detail: hostLabel ? `Signed in through ${hostLabel}.` : "Signed in successfully."
      });
      clearLoginXmppProgressTimer();
      return;
    }
    if (event.event === "failure") {
      setLoginXmppProgress({
        state: "error",
        status: "Could not sign in.",
        detail: "Please check your server and password, then try again."
      });
      clearLoginXmppProgressTimer();
    }
  }

  function parseLoginIdentity(rawUsername, explicitJid = "") {
    const userRaw = (rawUsername || "").toString().trim();
    const jidRaw = (explicitJid || "").toString().trim();
    const effectiveJid = jidRaw || (userRaw.includes("@") ? userRaw : "");
    const baseUsernameRaw = userRaw.includes("@") ? userRaw.split("@")[0] : userRaw;
    const fallbackFromJid = effectiveJid.includes("@") ? effectiveJid.split("@")[0] : "";
    const accountSeed = baseUsernameRaw || fallbackFromJid;
    return {
      accountUsername: normalizeUsername(accountSeed),
      accountDisplay: accountSeed.trim().slice(0, 32),
      xmppJid: normalizeXmppJid(effectiveJid)
    };
  }

  function renderXmppProviderList() {
    if (!ui.xmppProviderList) return;
    ui.xmppProviderList.innerHTML = "";
    XMPP_PROVIDER_CATALOG.forEach((provider) => {
      const row = document.createElement("div");
      row.className = "quick-switch-item";
      const title = document.createElement("strong");
      title.textContent = provider.name;
      const detail = document.createElement("small");
      const wsHint = provider.ws ? `WS: ${provider.ws}` : "WS endpoint depends on provider config.";
      detail.textContent = `${provider.notes} ${wsHint}`;
      const actions = document.createElement("div");
      actions.className = "settings-inline-actions";
      actions.style.marginTop = "0.35rem";
      const openBtn = document.createElement("button");
      openBtn.type = "button";
      openBtn.textContent = "Open Site";
      openBtn.addEventListener("click", () => {
        window.open(provider.site, "_blank", "noopener,noreferrer");
      });
      actions.appendChild(openBtn);
      const registerBtn = document.createElement("button");
      registerBtn.type = "button";
      registerBtn.textContent = "Register";
      registerBtn.addEventListener("click", () => {
        window.open(provider.register || provider.site, "_blank", "noopener,noreferrer");
      });
      actions.appendChild(registerBtn);
      if (provider.ws) {
        const useBtn = document.createElement("button");
        useBtn.type = "button";
        useBtn.textContent = "Use Server";
        useBtn.addEventListener("click", () => {
          if (ui.loginXmppServer) ui.loginXmppServer.value = provider.ws;
          ui.xmppProviderDialog?.close();
          ui.loginUsername?.focus();
        });
        actions.appendChild(useBtn);
      }
      row.append(title, detail, actions);
      ui.xmppProviderList.appendChild(row);
    });
  }

  function syncLoginFieldsFromSessionPrefs() {
    const prefs = getPreferences();
    if (ui.loginRememberInput) {
      ui.loginRememberInput.checked = prefs.rememberLogin === "on" && isSessionPersistenceEnabled();
    }
    if (ui.loginUsername && !ui.loginUsername.value && prefs.xmppJid) {
      ui.loginUsername.value = prefs.xmppJid;
    }
    if (ui.loginXmppServer && !ui.loginXmppServer.value && prefs.xmppWsUrl) {
      ui.loginXmppServer.value = prefs.xmppWsUrl;
    }
  }

  function openXmppRegisterDialog() {
    const jidSeed = normalizeXmppJid(ui.loginUsername?.value || "");
    const wsSeed = normalizeXmppWsUrl(ui.loginXmppServer?.value || "") || inferXmppWsUrlFromJid(jidSeed);
    if (ui.registerJidInput) ui.registerJidInput.value = jidSeed || "";
    if (ui.registerPasswordInput) ui.registerPasswordInput.value = "";
    if (ui.registerXmppServerInput) {
      ui.registerXmppServerInput.value = wsSeed || "";
      ui.registerXmppServerInput.dataset.autofill = wsSeed ? "1" : "0";
    }
    ui.xmppRegisterDialog?.showModal();
    requestAnimationFrame(() => ui.registerJidInput?.focus());
  }

  function normalizeLocalXmppProfiles(raw) {
    return normalizeLocalXmppProfilesViaModule(raw);
  }

  function renderLocalXmppProfileSelect() {
    if (!ui.loginLocalProfileWrap || !ui.loginLocalProfileSelect) return;
    ui.loginLocalProfileSelect.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select profile from .xmpp.local.json";
    ui.loginLocalProfileSelect.appendChild(defaultOption);
    if (!Array.isArray(loginLocalXmppProfiles) || loginLocalXmppProfiles.length === 0) {
      ui.loginLocalProfileWrap.hidden = true;
      return;
    }
    loginLocalXmppProfiles.forEach((profile) => {
      const option = document.createElement("option");
      option.value = profile.id;
      option.textContent = profile.label;
      ui.loginLocalProfileSelect.appendChild(option);
    });
    ui.loginLocalProfileWrap.hidden = false;
  }

  function applyLocalXmppProfileById(profileId) {
    if (!profileId) return false;
    const profile = loginLocalXmppProfiles.find((entry) => entry.id === profileId);
    if (!profile) return false;
    if (ui.loginUsername) ui.loginUsername.value = profile.jid;
    if (ui.loginPassword) ui.loginPassword.value = profile.password || "";
    if (ui.loginXmppServer && profile.ws) {
      ui.loginXmppServer.value = profile.ws;
      ui.loginXmppServer.dataset.autofill = "0";
    }
    return true;
  }

  async function loadLocalXmppProfiles() {
    const electronBridge = globalScope?.s67Electron;
    if (electronBridge && typeof electronBridge.readLocalXmppProfiles === "function") {
      try {
        const payload = await electronBridge.readLocalXmppProfiles();
        const parsed = normalizeLocalXmppProfiles(payload?.data || null);
        if (payload?.ok && parsed.length > 0) {
          loginLocalXmppProfiles = parsed;
          renderLocalXmppProfileSelect();
          return true;
        }
      } catch {
        // Fall through to HTTP fetch fallback.
      }
    }
    const candidates = [".xmpp.local.json", "./.xmpp.local.json"];
    for (const path of candidates) {
      try {
        // Try to load local secret profiles if static server exposes dotfiles.
        // Hidden when unavailable.
        // eslint-disable-next-line no-await-in-loop
        const response = await fetch(path, { cache: "no-store" });
        if (!response.ok) continue;
        // eslint-disable-next-line no-await-in-loop
        const json = await response.json();
        const parsed = normalizeLocalXmppProfiles(json);
        if (parsed.length > 0) {
          loginLocalXmppProfiles = parsed;
          renderLocalXmppProfileSelect();
          return true;
        }
      } catch {
        // Try next fetch path variant.
      }
    }
    loginLocalXmppProfiles = [];
    renderLocalXmppProfileSelect();
    return false;
  }

  globalScope.SHITCORD67_XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME = Object.freeze({
    discoverXmppWsViaHostMeta,
    validateXmppViaLocalGateway,
    registerXmppViaLocalGateway,
    classifyNoWebsocketEndpointHint,
    looksLikeCompleteJid,
    knownXmppWsForDomain,
    resolveXmppWsCandidates,
    inferXmppWsUrlFromJid,
    maybeDiscoverLoginXmppWsUrl,
    clearLoginXmppProgressTimer,
    formatElapsedTimer,
    updateLoginXmppProgressTimer,
    setLoginXmppProgress,
    resetLoginXmppProgress,
    beginLoginXmppProgress,
    applyLoginXmppProgressEvent,
    parseLoginIdentity,
    renderXmppProviderList,
    syncLoginFieldsFromSessionPrefs,
    openXmppRegisterDialog,
    normalizeLocalXmppProfiles,
    renderLocalXmppProfileSelect,
    applyLocalXmppProfileById,
    loadLocalXmppProfiles
  });

  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register(
      "xep-0156_xmpp-login-discovery-runtime",
      globalScope.SHITCORD67_XEP_0156_XMPP_LOGIN_DISCOVERY_RUNTIME
    );
  }
})(typeof window !== "undefined" ? window : globalThis);
