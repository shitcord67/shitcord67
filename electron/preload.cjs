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

contextBridge.exposeInMainWorld("s67Electron", {
  requestPlatformInfo() {
    ipcRenderer.send("s67-request-platform-info");
  },
  onPlatformInfo,
  toggleDevtools() {
    ipcRenderer.send("s67-toggle-devtools");
  }
});
