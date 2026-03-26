(function initXmppCallTargetUtils(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XMPP_CALL_TARGET_UTILS) return;

  function xmppNormalizeFullJidPreserveResource(jid = "", {
    normalizeXmppJidFn = (value) => (value || "").toString().trim()
  } = {}) {
    const raw = (jid || "").toString().trim();
    if (!raw) return "";
    const slashIndex = raw.indexOf("/");
    if (slashIndex < 0) {
      const bareOnly = typeof normalizeXmppJidFn === "function" ? normalizeXmppJidFn(raw) : raw;
      return (bareOnly || "").toString().trim().toLowerCase();
    }
    const bareRaw = raw.slice(0, slashIndex);
    const resourceRaw = raw.slice(slashIndex + 1);
    const bare = (typeof normalizeXmppJidFn === "function" ? normalizeXmppJidFn(bareRaw) : bareRaw).toLowerCase();
    const resource = (resourceRaw || "").toString().trim();
    if (!bare) return "";
    if (!resource) return bare;
    return `${bare}/${resource}`;
  }

  function xmppRememberPeerFullJid(jid = "", {
    seenAt = Date.now(),
    normalizeXmppJidFn = (value) => (value || "").toString().trim(),
    xmppBareJidFn = (value) => (value || "").toString().trim().toLowerCase(),
    poolByBare = null
  } = {}) {
    if (!(poolByBare instanceof Map)) return;
    const normalized = xmppNormalizeFullJidPreserveResource(jid, { normalizeXmppJidFn });
    if (!normalized || !normalized.includes("/")) return;
    const bare = xmppBareJidFn(normalized);
    if (!bare) return;
    const pool = poolByBare.get(bare) || new Map();
    pool.set(normalized, Number(seenAt) || Date.now());
    if (pool.size > 8) {
      const oldest = [...pool.entries()].sort((a, b) => (Number(a[1]) || 0) - (Number(b[1]) || 0))[0]?.[0] || "";
      if (oldest) pool.delete(oldest);
    }
    poolByBare.set(bare, pool);
  }

  function xmppForgetPeerFullJid(jid = "", {
    normalizeXmppJidFn = (value) => (value || "").toString().trim(),
    xmppBareJidFn = (value) => (value || "").toString().trim().toLowerCase(),
    poolByBare = null
  } = {}) {
    if (!(poolByBare instanceof Map)) return;
    const normalized = xmppNormalizeFullJidPreserveResource(jid, { normalizeXmppJidFn });
    if (!normalized) return;
    if (!normalized.includes("/")) {
      poolByBare.delete(xmppBareJidFn(normalized));
      return;
    }
    const bare = xmppBareJidFn(normalized);
    if (!bare) return;
    const pool = poolByBare.get(bare);
    if (!(pool instanceof Map)) return;
    pool.delete(normalized);
    if (pool.size <= 0) {
      poolByBare.delete(bare);
      return;
    }
    poolByBare.set(bare, pool);
  }

  function xmppMostRecentPeerFullJid(jid = "", {
    normalizeXmppJidFn = (value) => (value || "").toString().trim(),
    xmppBareJidFn = (value) => (value || "").toString().trim().toLowerCase(),
    poolByBare = null
  } = {}) {
    if (!(poolByBare instanceof Map)) return "";
    const normalized = xmppNormalizeFullJidPreserveResource(jid, { normalizeXmppJidFn });
    if (!normalized) return "";
    if (normalized.includes("/")) return normalized;
    const bare = xmppBareJidFn(normalized);
    if (!bare) return "";
    const pool = poolByBare.get(bare);
    if (!(pool instanceof Map) || pool.size <= 0) return "";
    return [...pool.entries()].sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0))[0]?.[0] || "";
  }

  function xmppNormalizeCallTargetJid(peerJid, {
    preferFull = false,
    xmppMostRecentPeerFullJidFn = (value) => (value || "").toString().trim(),
    xmppBareJidFn = (value) => (value || "").toString().trim().toLowerCase()
  } = {}) {
    const raw = (peerJid || "").toString().trim();
    if (!raw) return "";
    if (preferFull) {
      if (raw.includes("/")) return raw;
      const recent = xmppMostRecentPeerFullJidFn(raw);
      if (recent) return recent;
    }
    const bare = xmppBareJidFn(raw);
    return bare || raw;
  }

  function xmppCallIqSessionNotFoundError(errorStanza = null, {
    trimXmppRawFn = (value) => (value || "").toString(),
    xmppSerializePayloadFn = () => ""
  } = {}) {
    const payload = trimXmppRawFn(xmppSerializePayloadFn(errorStanza)).toLowerCase();
    if (!payload) return false;
    const hasServiceUnavailable = payload.includes("service-unavailable");
    const hasSessionMissingText = payload.includes("user session not found")
      || payload.includes("session not found")
      || payload.includes("unknown session")
      || payload.includes("unknown-session")
      || payload.includes("item-not-found");
    return hasServiceUnavailable || hasSessionMissingText;
  }

  function xmppResolveRetryCallTargetForSession(sessionId = "", attemptedTo = "", {
    sessionById = null,
    normalizeXmppJidFn = (value) => (value || "").toString().trim(),
    xmppBareJidFn = (value) => (value || "").toString().trim().toLowerCase(),
    xmppMostRecentPeerFullJidFn = (value) => (value || "").toString().trim(),
    xmppRememberPeerFullJidFn = () => {}
  } = {}) {
    if (!(sessionById instanceof Map)) return "";
    const sid = (sessionId || "").toString().trim();
    if (!sid) return "";
    const session = sessionById.get(sid) || null;
    if (!session) return "";
    const attempted = xmppNormalizeFullJidPreserveResource((attemptedTo || "").toString().trim(), { normalizeXmppJidFn });
    const attemptedBare = attempted ? xmppBareJidFn(attempted) : "";
    const sessionBare = xmppBareJidFn(session.peerJid || session.peerFullJid || "");
    if (!sessionBare) return "";
    const recentFull = xmppMostRecentPeerFullJidFn(sessionBare);
    const candidates = [];
    if (recentFull && recentFull !== attempted) candidates.push(recentFull);
    if (sessionBare && sessionBare !== attemptedBare) candidates.push(sessionBare);
    const retryTo = candidates.find(Boolean) || "";
    if (!retryTo) return "";
    if (retryTo.includes("/")) {
      session.peerFullJid = retryTo;
      xmppRememberPeerFullJidFn(retryTo);
    } else {
      session.peerFullJid = "";
    }
    return retryTo;
  }

  function xmppResolveSessionPeerJid(session, fallback = "", {
    preferFull = true,
    xmppMostRecentPeerFullJidFn = (value) => (value || "").toString().trim(),
    xmppBareJidFn = (value) => (value || "").toString().trim().toLowerCase()
  } = {}) {
    const full = (session?.peerFullJid || "").toString().trim();
    if (preferFull && full) return full;
    const raw = (fallback || session?.peerJid || "").toString().trim();
    if (!raw) return "";
    if (preferFull) {
      if (raw.includes("/")) return raw;
      const recent = xmppMostRecentPeerFullJidFn(raw);
      if (recent) return recent;
    }
    const bare = xmppBareJidFn(raw);
    return bare || raw;
  }

  globalScope.SHITCORD67_XMPP_CALL_TARGET_UTILS = Object.freeze({
    xmppRememberPeerFullJid,
    xmppForgetPeerFullJid,
    xmppMostRecentPeerFullJid,
    xmppNormalizeCallTargetJid,
    xmppCallIqSessionNotFoundError,
    xmppResolveRetryCallTargetForSession,
    xmppResolveSessionPeerJid
  });
})(typeof window !== "undefined" ? window : globalThis);
