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

  globalScope.SHITCORD67_CALL_ROOM_URL_UTILS = Object.freeze({
    normalizeConferenceProviderUrl
  });
})(typeof window !== "undefined" ? window : globalThis);
