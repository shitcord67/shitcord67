const { contextBridge, ipcRenderer } = require("electron");

const onPlatformInfo = (callback) => {
  if (typeof callback !== "function") return () => {};
  const handler = (_event, payload) => {
    callback(payload || {});
  };
  ipcRenderer.on("s67-platform-info", handler);
  return () => {
    ipcRenderer.removeListener("s67-platform-info", handler);
  };
};

const onDevtoolsUnavailable = (callback) => {
  if (typeof callback !== "function") return () => {};
  const handler = (_event, payload) => {
    callback(payload || {});
  };
  ipcRenderer.on("s67-devtools-unavailable", handler);
  return () => {
    ipcRenderer.removeListener("s67-devtools-unavailable", handler);
  };
};

contextBridge.exposeInMainWorld("s67Electron", {
  requestPlatformInfo() {
    ipcRenderer.send("s67-request-platform-info");
  },
  onPlatformInfo,
  onDevtoolsUnavailable,
  toggleDevtools() {
    ipcRenderer.send("s67-toggle-devtools");
  },
  async listDisplayCaptureSources() {
    try {
      return await ipcRenderer.invoke("s67-list-display-capture-sources");
    } catch (error) {
      return {
        ok: false,
        error: String(error?.message || error || "IPC bridge unavailable"),
        sources: []
      };
    }
  },
  async setDisplayCaptureSource(sourceId = "") {
    try {
      return await ipcRenderer.invoke("s67-set-display-capture-source", { sourceId });
    } catch (error) {
      return {
        ok: false,
        error: String(error?.message || error || "IPC bridge unavailable")
      };
    }
  },
  async readLocalXmppProfiles() {
    try {
      return await ipcRenderer.invoke("s67-read-local-xmpp-profiles");
    } catch (error) {
      return {
        ok: false,
        error: String(error?.message || error || "IPC bridge unavailable")
      };
    }
  },
  async gpgStatus() {
    try {
      return await ipcRenderer.invoke("s67-gpg-status");
    } catch (error) {
      return {
        ok: false,
        available: false,
        error: String(error?.message || error || "IPC bridge unavailable")
      };
    }
  },
  async gpgListKeys({ secret = false } = {}) {
    try {
      return await ipcRenderer.invoke("s67-gpg-list-keys", { secret });
    } catch (error) {
      return {
        ok: false,
        keys: [],
        error: String(error?.message || error || "IPC bridge unavailable")
      };
    }
  },
  async gpgExportPublicKey(fingerprint = "") {
    try {
      return await ipcRenderer.invoke("s67-gpg-export-public-key", { fingerprint });
    } catch (error) {
      return {
        ok: false,
        dataBase64: "",
        error: String(error?.message || error || "IPC bridge unavailable")
      };
    }
  },
  async gpgImportPublicKey(dataBase64 = "") {
    try {
      return await ipcRenderer.invoke("s67-gpg-import-public-key", { dataBase64 });
    } catch (error) {
      return {
        ok: false,
        fingerprints: [],
        error: String(error?.message || error || "IPC bridge unavailable")
      };
    }
  },
  async gpgEncryptOpenPgp({ dataBase64 = "", recipients = [], signer = "" } = {}) {
    try {
      return await ipcRenderer.invoke("s67-gpg-encrypt-openpgp", {
        dataBase64,
        recipients,
        signer
      });
    } catch (error) {
      return {
        ok: false,
        dataBase64: "",
        error: String(error?.message || error || "IPC bridge unavailable")
      };
    }
  },
  async gpgEncryptLegacyPgp({ plaintext = "", recipients = [], signer = "" } = {}) {
    try {
      return await ipcRenderer.invoke("s67-gpg-encrypt-legacy-pgp", {
        plaintext,
        recipients,
        signer
      });
    } catch (error) {
      return {
        ok: false,
        armored: "",
        error: String(error?.message || error || "IPC bridge unavailable")
      };
    }
  },
  async gpgDecrypt({ dataBase64 = "", armored = "" } = {}) {
    try {
      return await ipcRenderer.invoke("s67-gpg-decrypt", {
        dataBase64,
        armored
      });
    } catch (error) {
      return {
        ok: false,
        plaintext: "",
        error: String(error?.message || error || "IPC bridge unavailable")
      };
    }
  },
  async readDroppedFilePath(fileUri = "") {
    try {
      return await ipcRenderer.invoke("s67-read-dropped-file-path", { fileUri });
    } catch (error) {
      return {
        ok: false,
        error: String(error?.message || error || "IPC bridge unavailable")
      };
    }
  },
  emitLogEvent(payload = {}) {
    try {
      ipcRenderer.send("s67-log-event", payload && typeof payload === "object" ? payload : {});
      return true;
    } catch {
      return false;
    }
  },
  async getRuntimeLogDir() {
    try {
      return await ipcRenderer.invoke("s67-get-runtime-log-dir");
    } catch (error) {
      return {
        ok: false,
        dir: "",
        error: String(error?.message || error || "IPC bridge unavailable")
      };
    }
  },
  async getRuntimeLogIndex({ limit = 10, prefix = "" } = {}) {
    try {
      return await ipcRenderer.invoke("s67-get-runtime-log-index", { limit, prefix });
    } catch (error) {
      return {
        ok: false,
        dir: "",
        sessions: [],
        error: String(error?.message || error || "IPC bridge unavailable")
      };
    }
  },
  storageGet(key = "") {
    try {
      const response = ipcRenderer.sendSync("s67-storage-get-sync", { key });
      if (!response?.ok || !response.hasValue) return null;
      return response.value == null ? "" : String(response.value);
    } catch {
      return null;
    }
  },
  storageSet(key = "", value = "") {
    try {
      const response = ipcRenderer.sendSync("s67-storage-set-sync", { key, value });
      return Boolean(response?.ok);
    } catch {
      return false;
    }
  },
  storageRemove(key = "") {
    try {
      const response = ipcRenderer.sendSync("s67-storage-remove-sync", { key });
      return Boolean(response?.ok);
    } catch {
      return false;
    }
  },
  storageList(prefix = "") {
    try {
      const response = ipcRenderer.sendSync("s67-storage-list-sync", { prefix });
      return Array.isArray(response?.keys) ? response.keys : [];
    } catch {
      return [];
    }
  }
});
