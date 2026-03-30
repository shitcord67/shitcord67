(function initXep0378Otr(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0378_OTR) return;

  const STORAGE_KEY = "s67.xmpp.otr.v1";
  const sessionsByKey = new Map();
  let storageCache = null;

  function dispatch(name, detail = {}) {
    if (typeof globalScope.dispatchEvent !== "function" || typeof globalScope.CustomEvent !== "function") return;
    globalScope.dispatchEvent(new globalScope.CustomEvent(name, { detail }));
  }

  function otrCtor() {
    return typeof globalScope.OTR === "function" ? globalScope.OTR : null;
  }

  function dsaCtor() {
    return typeof globalScope.DSA === "function" ? globalScope.DSA : null;
  }

  function normalizeBareJid(value = "") {
    return (value || "").toString().trim().toLowerCase();
  }

  function sessionKey(ownBare = "", peerBare = "") {
    const own = normalizeBareJid(ownBare);
    const peer = normalizeBareJid(peerBare);
    return own && peer ? `${own}|${peer}` : "";
  }

  function loadStorage() {
    if (storageCache) return storageCache;
    let parsed = {};
    try {
      parsed = JSON.parse(globalScope.localStorage?.getItem?.(STORAGE_KEY) || "{}") || {};
    } catch {
      parsed = {};
    }
    storageCache = {
      accounts: parsed.accounts && typeof parsed.accounts === "object" ? parsed.accounts : {}
    };
    return storageCache;
  }

  function saveStorage() {
    try {
      globalScope.localStorage?.setItem?.(STORAGE_KEY, JSON.stringify(loadStorage()));
    } catch {
      // Keep runtime-only sessions when storage is unavailable.
    }
  }

  function ensureAccountRecord(ownBare = "") {
    const bare = normalizeBareJid(ownBare);
    if (!bare) throw new Error("Missing XMPP JID for OTR.");
    const storage = loadStorage();
    if (!storage.accounts[bare] || typeof storage.accounts[bare] !== "object") {
      storage.accounts[bare] = {};
    }
    return storage.accounts[bare];
  }

  function ensureIdentity(ownBare = "") {
    const OTRCtor = otrCtor();
    const DSACtor = dsaCtor();
    if (!OTRCtor || !DSACtor || typeof DSACtor.parsePrivate !== "function") {
      throw new Error("OTR runtime is unavailable.");
    }
    const record = ensureAccountRecord(ownBare);
    if (!record.privateKey) {
      const key = new DSACtor();
      record.privateKey = typeof key.packPrivate === "function" ? key.packPrivate() : "";
    }
    if (!record.instanceTag && typeof OTRCtor.makeInstanceTag === "function") {
      record.instanceTag = OTRCtor.makeInstanceTag();
    }
    saveStorage();
    const priv = DSACtor.parsePrivate(record.privateKey);
    return {
      priv,
      instanceTag: record.instanceTag || ""
    };
  }

  function bindSession(wrapper) {
    const OTRCtor = otrCtor();
    wrapper.session.on("io", (packet, meta) => {
      dispatch("s67:xmpp-otr-io", {
        ownBare: wrapper.ownBare,
        peerBare: wrapper.peerBare,
        packet,
        meta: meta || {}
      });
    });
    wrapper.session.on("ui", (plaintext, encrypted, meta) => {
      dispatch("s67:xmpp-otr-ui", {
        ownBare: wrapper.ownBare,
        peerBare: wrapper.peerBare,
        plaintext,
        encrypted: Boolean(encrypted),
        meta: meta || {}
      });
    });
    wrapper.session.on("status", (status) => {
      dispatch("s67:xmpp-otr-status", {
        ownBare: wrapper.ownBare,
        peerBare: wrapper.peerBare,
        status
      });
      if (status === OTRCtor?.CONST?.STATUS_AKE_SUCCESS) {
        wrapper.ready = true;
      } else if (status === OTRCtor?.CONST?.STATUS_END_OTR) {
        wrapper.ready = false;
      }
    });
    wrapper.session.on("error", (error, severity) => {
      dispatch("s67:xmpp-otr-error", {
        ownBare: wrapper.ownBare,
        peerBare: wrapper.peerBare,
        error: (error || "unknown error").toString(),
        severity: (severity || "error").toString()
      });
    });
  }

  function getOrCreateSession(ownBare = "", peerBare = "") {
    const key = sessionKey(ownBare, peerBare);
    if (!key) throw new Error("Invalid OTR session key.");
    const existing = sessionsByKey.get(key);
    if (existing) return existing;
    const OTRCtor = otrCtor();
    if (!OTRCtor) throw new Error("OTR runtime is unavailable.");
    const identity = ensureIdentity(ownBare);
    const wrapper = {
      ownBare: normalizeBareJid(ownBare),
      peerBare: normalizeBareJid(peerBare),
      ready: false,
      session: new OTRCtor({
        priv: identity.priv,
        instance_tag: identity.instanceTag || undefined,
        send_interval: 80
      })
    };
    wrapper.session.REQUIRE_ENCRYPTION = true;
    wrapper.session.SEND_WHITESPACE_TAG = false;
    wrapper.session.WHITESPACE_START_AKE = true;
    bindSession(wrapper);
    sessionsByKey.set(key, wrapper);
    return wrapper;
  }

  async function xmppOtrSendTextMessage(peerBare = "", plaintext = "", meta = {}) {
    const ownBare = normalizeBareJid(meta?.ownBare || "");
    const peer = normalizeBareJid(peerBare || "");
    if (!ownBare || !peer) throw new Error("Missing OTR session peer.");
    const wrapper = getOrCreateSession(ownBare, peer);
    wrapper.session.sendMsg((plaintext || "").toString(), { ...meta, ownBare, peerBare: peer });
    return true;
  }

  async function xmppOtrReceiveMessage(peerBare = "", packet = "", meta = {}) {
    const ownBare = normalizeBareJid(meta?.ownBare || "");
    const peer = normalizeBareJid(peerBare || "");
    if (!ownBare || !peer || !packet) return false;
    const wrapper = getOrCreateSession(ownBare, peer);
    wrapper.session.receiveMsg((packet || "").toString(), { ...meta, ownBare, peerBare: peer });
    return true;
  }

  function xmppOtrRuntimeAvailable() {
    return Boolean(otrCtor() && dsaCtor());
  }

  globalScope.SHITCORD67_XEP_0378_OTR = Object.freeze({
    xmppOtrRuntimeAvailable,
    xmppOtrEnsureIdentity: ensureIdentity,
    xmppOtrSendTextMessage,
    xmppOtrReceiveMessage
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0378_otr", globalScope.SHITCORD67_XEP_0378_OTR);
  }
})(typeof window !== "undefined" ? window : globalThis);
