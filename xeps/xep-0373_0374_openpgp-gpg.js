(function initXep0373OpenPgpGpg(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0373_0374_OPENPGP_GPG) return;

  function normalizeEmail(value = "") {
    return (value || "").toString().trim().toLowerCase();
  }

  function gpgBridge() {
    const bridge = globalScope.s67Electron;
    if (!bridge || typeof bridge !== "object") return null;
    if (typeof bridge.gpgStatus !== "function") return null;
    return bridge;
  }

  async function xmppOpenPgpBackendStatus() {
    const bridge = gpgBridge();
    if (!bridge) return { ok: false, available: false, error: "Electron GPG bridge unavailable." };
    return bridge.gpgStatus();
  }

  async function xmppOpenPgpListKeys({ secret = false } = {}) {
    const bridge = gpgBridge();
    if (!bridge || typeof bridge.gpgListKeys !== "function") {
      return { ok: false, keys: [], error: "Electron GPG bridge unavailable." };
    }
    return bridge.gpgListKeys({ secret });
  }

  function findBestGpgKeyForJid(keys = [], jid = "") {
    const bare = normalizeEmail(jid);
    if (!bare) return null;
    const list = Array.isArray(keys) ? keys : [];
    return list.find((entry) => Array.isArray(entry?.emails) && entry.emails.map(normalizeEmail).includes(bare)) || null;
  }

  async function xmppOpenPgpExportPublicKey(fingerprint = "") {
    const bridge = gpgBridge();
    if (!bridge || typeof bridge.gpgExportPublicKey !== "function") {
      return { ok: false, dataBase64: "", error: "Electron GPG bridge unavailable." };
    }
    return bridge.gpgExportPublicKey(fingerprint);
  }

  async function xmppOpenPgpImportPublicKey(dataBase64 = "") {
    const bridge = gpgBridge();
    if (!bridge || typeof bridge.gpgImportPublicKey !== "function") {
      return { ok: false, fingerprints: [], error: "Electron GPG bridge unavailable." };
    }
    return bridge.gpgImportPublicKey(dataBase64);
  }

  async function xmppOpenPgpEncryptBinary({ dataBase64 = "", recipients = [], signer = "" } = {}) {
    const bridge = gpgBridge();
    if (!bridge || typeof bridge.gpgEncryptOpenPgp !== "function") {
      return { ok: false, dataBase64: "", error: "Electron GPG bridge unavailable." };
    }
    return bridge.gpgEncryptOpenPgp({ dataBase64, recipients, signer });
  }

  async function xmppOpenPgpEncryptLegacy({ plaintext = "", recipients = [], signer = "" } = {}) {
    const bridge = gpgBridge();
    if (!bridge || typeof bridge.gpgEncryptLegacyPgp !== "function") {
      return { ok: false, armored: "", error: "Electron GPG bridge unavailable." };
    }
    return bridge.gpgEncryptLegacyPgp({ plaintext, recipients, signer });
  }

  async function xmppOpenPgpDecryptPayload({ dataBase64 = "", armored = "" } = {}) {
    const bridge = gpgBridge();
    if (!bridge || typeof bridge.gpgDecrypt !== "function") {
      return { ok: false, plaintext: "", error: "Electron GPG bridge unavailable." };
    }
    return bridge.gpgDecrypt({ dataBase64, armored });
  }

  globalScope.SHITCORD67_XEP_0373_0374_OPENPGP_GPG = Object.freeze({
    xmppOpenPgpBackendStatus,
    xmppOpenPgpListKeys,
    findBestGpgKeyForJid,
    xmppOpenPgpExportPublicKey,
    xmppOpenPgpImportPublicKey,
    xmppOpenPgpEncryptBinary,
    xmppOpenPgpEncryptLegacy,
    xmppOpenPgpDecryptPayload
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0373_0374_openpgp-gpg", globalScope.SHITCORD67_XEP_0373_0374_OPENPGP_GPG);
  }
})(typeof window !== "undefined" ? window : globalThis);
