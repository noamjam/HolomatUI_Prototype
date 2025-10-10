// preload.js — Expose safe Electron APIs to renderer
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    // 🎨 Paint
    launchPaint: () => ipcRenderer.send("launch-paint"),

    // 💬 Chat server ready event
    onChatServerStarted: (callback) =>
        ipcRenderer.on("chat-server-started", (_, port) => callback(port)),

    // 📂 File Explorer
    openFileExplorer: () => ipcRenderer.send("open-file-explorer"),

    // 🧠 Fallback: ask main for chat port
    getChatPort: async () => {
        return await ipcRenderer.invoke("get-chat-port");
    },

    // 🔄 Optional generic messaging
    sendMessage: (channel, data) => ipcRenderer.send(channel, data),
    onMessage: (channel, func) =>
        ipcRenderer.on(channel, (_, ...args) => func(...args)),
});
