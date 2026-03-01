(function initXep0359_0424MessageRefUtils(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0359_0424_MESSAGE_REF_UTILS) return;

  function normalizeXmppRefIdsList(value) {
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    const out = [];
    value.forEach((entry) => {
      const token = (entry || "").toString().trim();
      if (!token || seen.has(token)) return;
      seen.add(token);
      out.push(token);
    });
    return out.slice(0, 6);
  }

  function messageMatchesXmppReference(message, referenceId) {
    const key = (referenceId || "").toString().trim();
    if (!message || !key) return false;
    if ((message.id || "").toString() === key) return true;
    if ((message.xmppStanzaId || "").toString() === key) return true;
    if (Array.isArray(message.xmppRefIds) && message.xmppRefIds.some((ref) => (ref || "").toString() === key)) return true;
    if ((message.relayId || "").toString().endsWith(`::${key}`)) return true;
    return false;
  }

  function xmppRefIdsOverlap(idsA, idsB) {
    if (!Array.isArray(idsA) || !Array.isArray(idsB) || idsA.length === 0 || idsB.length === 0) return false;
    const setA = new Set(idsA.map((entry) => (entry || "").toString().trim()).filter(Boolean));
    if (setA.size === 0) return false;
    return idsB.some((entry) => setA.has((entry || "").toString().trim()));
  }

  function trimXmppLocalSentRefs(map, {
    now = Date.now(),
    ttlMs = 6 * 60 * 60 * 1000,
    maxEntries = 5000
  } = {}) {
    if (!(map instanceof Map)) return;
    const ttl = Math.max(30_000, Number(ttlMs) || (6 * 60 * 60 * 1000));
    for (const [refId, seenAt] of map.entries()) {
      if (now - seenAt > ttl) map.delete(refId);
    }
    const max = Math.max(100, Number(maxEntries) || 5000);
    while (map.size > max) {
      const oldest = map.keys().next().value;
      if (!oldest) break;
      map.delete(oldest);
    }
  }

  function rememberXmppLocalSentRefs(map, refIds = [], options = {}) {
    if (!(map instanceof Map) || !Array.isArray(refIds) || refIds.length === 0) return;
    const now = Date.now();
    refIds.forEach((rawRefId) => {
      const refId = (rawRefId || "").toString().trim();
      if (!refId) return;
      map.set(refId, now);
    });
    trimXmppLocalSentRefs(map, { ...options, now });
  }

  function isXmppLocalSentRefId(map, refId, {
    ttlMs = 6 * 60 * 60 * 1000,
    now = Date.now()
  } = {}) {
    if (!(map instanceof Map)) return false;
    const key = (refId || "").toString().trim();
    if (!key) return false;
    const seenAt = map.get(key);
    if (!Number.isFinite(seenAt)) return false;
    if (now - seenAt > ttlMs) {
      map.delete(key);
      return false;
    }
    return true;
  }

  globalScope.SHITCORD67_XEP_0359_0424_MESSAGE_REF_UTILS = Object.freeze({
    normalizeXmppRefIdsList,
    messageMatchesXmppReference,
    xmppRefIdsOverlap,
    trimXmppLocalSentRefs,
    rememberXmppLocalSentRefs,
    isXmppLocalSentRefId
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0359_0424-message-ref-utils", globalScope.SHITCORD67_XEP_0359_0424_MESSAGE_REF_UTILS);
  }
})(typeof window !== "undefined" ? window : globalThis);
