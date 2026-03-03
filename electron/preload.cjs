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
  async readLocalXmppProfiles() {
    try {
      return await ipcRenderer.invoke("s67-read-local-xmpp-profiles");
    } catch (error) {
      return {
        ok: false,
        error: String(error?.message || error || "IPC bridge unavailable")
      };
    }
  }
});
