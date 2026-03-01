(function initXep0384OmemoStore(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384_OMEMO_STORE) return;

  const cryptoUtils = globalScope.SHITCORD67_XEP_0384_CRYPTO_UTILS || {};
  const base64ToArrayBuffer = cryptoUtils.base64ToArrayBuffer || function fallbackBase64ToArrayBuffer(base64) {
    const cleaned = (base64 || "").toString().trim();
    if (!cleaned) return new ArrayBuffer(0);
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };
  const arrayBufferToBase64 = cryptoUtils.arrayBufferToBase64 || function fallbackArrayBufferToBase64(buffer) {
    if (!buffer) return "";
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  class XmppOmemoStore {
    constructor(jid) {
      const bare = (jid || "").toString().split("/")[0] || "";
      this.jid = bare.trim().toLowerCase();
      this.storageVersion = "s67.omemo.v1";
      this.Direction = {
        SENDING: 1,
        RECEIVING: 2
      };
    }

    prefix() {
      return `${this.storageVersion}.${this.jid}.`;
    }

    key(key) {
      return `${this.prefix()}${key}`;
    }

    putString(key, value) {
      if (!key) throw new Error("OMEMO store missing key");
      localStorage.setItem(this.key(key), value == null ? "" : String(value));
    }

    getString(key, fallback) {
      if (!key) throw new Error("OMEMO store missing key");
      const value = localStorage.getItem(this.key(key));
      if (value === null || value === undefined) return fallback;
      return value;
    }

    putJson(key, value) {
      this.putString(key, JSON.stringify(value));
    }

    getJson(key, fallback) {
      const raw = this.getString(key, null);
      if (!raw) return fallback;
      try {
        return JSON.parse(raw);
      } catch {
        return fallback;
      }
    }

    remove(key) {
      if (!key) return;
      localStorage.removeItem(this.key(key));
    }

    filter(prefix) {
      const base = this.key(prefix);
      const keys = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const localKey = localStorage.key(i);
        if (localKey && localKey.startsWith(base)) keys.push(localKey);
      }
      return keys;
    }

    async setIdentityKeyPair(identityKeyPair) {
      this.putJson("identityKey", {
        privKey: arrayBufferToBase64(identityKeyPair.privKey),
        pubKey: arrayBufferToBase64(identityKeyPair.pubKey)
      });
    }

    async getIdentityKeyPair() {
      const data = this.getJson("identityKey", null);
      if (!data) return Promise.reject(new Error("Missing identity key"));
      return {
        privKey: base64ToArrayBuffer(data.privKey || ""),
        pubKey: base64ToArrayBuffer(data.pubKey || "")
      };
    }

    async setLocalRegistrationId(registrationId) {
      this.putString("registrationId", String(registrationId));
    }

    async getLocalRegistrationId() {
      const raw = this.getString("registrationId", "");
      return raw ? Number(raw) : null;
    }

    async isTrustedIdentity(identifier, identityKey) {
      if (!identifier || !(identityKey instanceof ArrayBuffer)) return false;
      const stored = this.getString(`identityKey:${identifier}`, "");
      if (!stored) return true;
      return arrayBufferToBase64(identityKey) === stored;
    }

    async loadIdentityKey(identifier) {
      const stored = this.getString(`identityKey:${identifier}`, "");
      return stored ? base64ToArrayBuffer(stored) : null;
    }

    async saveIdentity(identifier, identityKey) {
      if (!identifier || !(identityKey instanceof ArrayBuffer)) return false;
      const key = arrayBufferToBase64(identityKey);
      const existing = this.getString(`identityKey:${identifier}`, "");
      this.putString(`identityKey:${identifier}`, key);
      return Boolean(existing && existing !== key);
    }

    async loadPreKey(keyId) {
      const data = this.getJson(`preKey:${keyId}`, null);
      if (!data) return null;
      return {
        pubKey: base64ToArrayBuffer(data.pubKey || ""),
        privKey: base64ToArrayBuffer(data.privKey || "")
      };
    }

    async storePreKey(keyId, keyPair) {
      this.putJson(`preKey:${keyId}`, {
        pubKey: arrayBufferToBase64(keyPair.pubKey),
        privKey: arrayBufferToBase64(keyPair.privKey)
      });
    }

    async removePreKey(keyId) {
      this.remove(`preKey:${keyId}`);
    }

    loadCompleteSignedPreKey(keyId) {
      const data = this.getJson(`signedPreKey:${keyId}`, null);
      if (!data) return null;
      return {
        keyId,
        keyPair: {
          pubKey: base64ToArrayBuffer(data.keyPair?.pubKey || ""),
          privKey: base64ToArrayBuffer(data.keyPair?.privKey || "")
        },
        signature: base64ToArrayBuffer(data.signature || "")
      };
    }

    async loadSignedPreKey(keyId) {
      const data = this.loadCompleteSignedPreKey(keyId);
      return data ? data.keyPair : null;
    }

    async storeSignedPreKey(keyId, key) {
      this.putJson(`signedPreKey:${keyId}`, {
        keyPair: {
          pubKey: arrayBufferToBase64(key.keyPair.pubKey),
          privKey: arrayBufferToBase64(key.keyPair.privKey)
        },
        signature: arrayBufferToBase64(key.signature || new ArrayBuffer(0))
      });
    }

    async removeSignedPreKey(keyId) {
      this.remove(`signedPreKey:${keyId}`);
    }

    async loadSession(identifier) {
      return this.getString(`session:${identifier}`, null);
    }

    async storeSession(identifier, record) {
      this.putString(`session:${identifier}`, record);
    }

    async removeSession(identifier) {
      this.remove(`session:${identifier}`);
    }

    async removeAllSessionsForJid(identifier) {
      const keys = this.filter(`session:${identifier}`);
      keys.forEach((key) => localStorage.removeItem(key));
    }

    getSessionsIds(identifier) {
      const keys = this.filter(`session:${identifier}`);
      return keys.map((key) => key.split(".").pop()).filter(Boolean);
    }
  }

  globalScope.SHITCORD67_XEP_0384_OMEMO_STORE = Object.freeze({
    XmppOmemoStore
  });
})(typeof window !== "undefined" ? window : globalThis);
