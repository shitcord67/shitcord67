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

  globalScope.SHITCORD67_CALL_ROOM_URL_UTILS = Object.freeze({
    normalizeConferenceProviderUrl,
    normalizeConferenceRoomPrefix,
    normalizeConferenceRoomToken,
    normalizeWhiteboardProviderUrl,
    normalizeWhiteboardRoomPrefix
  });
})(typeof window !== "undefined" ? window : globalThis);
