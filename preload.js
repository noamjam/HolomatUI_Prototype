// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    launchPaint: () => ipcRenderer.send('launch-paint'),
    // Empfängt die Port-Info vom Main-Prozess
    onChatServerStarted: (callback) => ipcRenderer.on("chat-server-started", (_, port) => callback(port)),
    openFileExplorer: () => ipcRenderer.send('open-file-explorer'), // ➕ Neu
    // Optional – für spätere Kommunikation (z. B. Log, Fehler etc.)
    sendMessage: (channel, data) => ipcRenderer.send(channel, data),
    onMessage: (channel, func) =>
        ipcRenderer.on(channel, (_, ...args) => func(...args)),
});