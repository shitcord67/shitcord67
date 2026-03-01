(function initCallRoomUrlUtils(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_CALL_ROOM_URL_UTILS) return;

  function normalizeConferenceProviderUrl(value) {
    const raw = (value || "").toString().trim().slice(0, 200);
    if (!raw) return "https://meet.jit.si";
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      const parsed = new URL(candidate);
      if (!/^https?:$/i.test(parsed.protocol)) return "https://meet.jit.si";
      const path = parsed.pathname.replace(/\/+$/, "");
      return `${parsed.origin}${path}`.slice(0, 200);
    } catch {
      return "https://meet.jit.si";
    }
  }

  function normalizeConferenceRoomPrefix(value) {
    const token = (value || "").toString().trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
    return (token || "shitcord67").slice(0, 32);
  }

  function normalizeConferenceRoomToken(value) {
    const token = (value || "").toString().trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
    return token.slice(0, 64);
  }

  function normalizeWhiteboardProviderUrl(value) {
    const raw = (value || "").toString().trim().slice(0, 200);
    if (!raw) return "https://wbo.ophir.dev/boards";
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      const parsed = new URL(candidate);
      if (!/^https?:$/i.test(parsed.protocol)) return "https://wbo.ophir.dev/boards";
      const cleanPath = parsed.pathname.replace(/\/+$/, "");
      return `${parsed.origin}${cleanPath}`.slice(0, 200);
    } catch {
      return "https://wbo.ophir.dev/boards";
    }
  }

  function normalizeWhiteboardRoomPrefix(value, {
    normalizeConferenceRoomTokenFn = normalizeConferenceRoomToken
  } = {}) {
    const token = normalizeConferenceRoomTokenFn((value || "").toString()).slice(0, 32);
    return token || "shitcord67-wb";
  }

  function relayHealthUrlFromRelayUrl(value, {
    normalizeRelayUrlFn = (raw) => (raw || "").toString().trim()
  } = {}) {
    const base = normalizeRelayUrlFn(value)
      .replace(/^ws:/i, "http:")
      .replace(/^wss:/i, "https:");
    try {
      const url = new URL(base);
      url.pathname = "/health";
      url.search = "";
      url.hash = "";
      return url.toString();
    } catch {
      return "";
    }
  }

  function normalizeRelayMode(value) {
    const mode = (value || "").toString().toLowerCase();
    if (mode === "ws" || mode === "http" || mode === "xmpp" || mode === "off") return mode;
    return "local";
  }

  function normalizeRelayUrl(value) {
    const trimmed = (value || "").toString().trim().slice(0, 180);
    if (!trimmed) return "ws://localhost:8787";
    if (!/^(wss?|https?):\/\//i.test(trimmed)) return "ws://localhost:8787";
    return trimmed;
  }

  function normalizeRelayRoom(value) {
    return (value || "").toString().trim().slice(0, 80);
  }

  globalScope.SHITCORD67_CALL_ROOM_URL_UTILS = Object.freeze({
    normalizeConferenceProviderUrl,
    normalizeConferenceRoomPrefix,
    normalizeConferenceRoomToken,
    normalizeWhiteboardProviderUrl,
    normalizeWhiteboardRoomPrefix,
    relayHealthUrlFromRelayUrl,
    normalizeRelayMode,
    normalizeRelayUrl,
    normalizeRelayRoom
  });
})(typeof window !== "undefined" ? window : globalThis);
