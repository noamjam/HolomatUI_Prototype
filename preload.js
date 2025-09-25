// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  launchPaint: () => ipcRenderer.send('launch-paint'),
  openFileExplorer: () => ipcRenderer.send('open-file-explorer') // ➕ Neu
});
