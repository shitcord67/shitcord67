(function initXmppLoginNormalizers(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XMPP_LOGIN_NORMALIZERS) return;

  function normalizeXmppJid(value) {
    return (value || "").toString().trim().slice(0, 120);
  }

  function normalizeXmppPassword(value) {
    return (value || "").toString().slice(0, 120);
  }

  function normalizeXmppWsUrl(value) {
    const raw = (value || "").toString().trim().slice(0, 180);
    if (!raw) return "";
    return /^wss?:\/\//i.test(raw) ? raw : "";
  }

  function normalizeXmppMucService(value) {
    return (value || "").toString().trim().toLowerCase().slice(0, 120);
  }

  function normalizeLocalXmppProfiles(raw, {
    normalizeXmppJidFn = (value) => (value || "").toString().trim(),
    normalizeXmppWsUrlFn = (value) => (value || "").toString().trim(),
    normalizeXmppPasswordFn = (value) => (value || "").toString()
  } = {}) {
    const entries = [];
    if (raw?.account && typeof raw.account === "object") entries.push(raw.account);
    if (Array.isArray(raw?.accounts)) entries.push(...raw.accounts);
    const out = [];
    entries.forEach((entry, index) => {
      if (!entry || typeof entry !== "object") return;
      const jid = normalizeXmppJidFn(entry.jid || entry.username || "");
      if (!jid) return;
      const ws = normalizeXmppWsUrlFn(entry.service || entry.ws || entry.xmppWsUrl || "");
      const password = normalizeXmppPasswordFn(entry.password || "");
      const label = (entry.label || entry.name || jid).toString().slice(0, 80);
      out.push({
        id: `${index}:${jid}`,
        label,
        jid,
        password,
        ws
      });
    });
    const seen = new Set();
    return out.filter((entry) => {
      const key = entry.jid.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  globalScope.SHITCORD67_XMPP_LOGIN_NORMALIZERS = Object.freeze({
    normalizeXmppJid,
    normalizeXmppPassword,
    normalizeXmppWsUrl,
    normalizeXmppMucService,
    normalizeLocalXmppProfiles
  });
})(typeof window !== "undefined" ? window : globalThis);
