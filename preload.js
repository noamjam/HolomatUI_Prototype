// preload.js — Expose safe Electron APIs to renderer
const { contextBridge, ipcRenderer } = require("electron");
let browserUpdateHandler = null;
contextBridge.exposeInMainWorld("electronAPI", {

        showBrowser: () => ipcRenderer.invoke("browser:show"),
        hideBrowser: () => ipcRenderer.invoke("browser:hide"),
        setBrowserUrl: (url) => ipcRenderer.invoke("browser:set-url", url),
        browserBack: () => ipcRenderer.invoke("browser:back"),
        browserForward: () => ipcRenderer.invoke("browser:forward"),
        browserReload: () => ipcRenderer.invoke("browser:reload"),

        onBrowserUpdate: (callback) => {
            browserUpdateHandler = callback;
            ipcRenderer.on("browser:update", (_event, payload) => {
                if (browserUpdateHandler) browserUpdateHandler(payload);
            });
        },

        clearBrowserListeners: () => {
            ipcRenderer.removeAllListeners("browser:update");
            browserUpdateHandler = null;
        },

    //Paint
    launchPaint: () => ipcRenderer.send("launch-paint"),

    //Chat server ready event
    onChatServerStarted: (callback) =>
        ipcRenderer.on("chat-server-started", (_, port) => callback(port)),

    openChatWindow: () => ipcRenderer.send("open-chat-window"),
    //File Explorer
    openFileExplorer: () => ipcRenderer.send("open-file-explorer"),

    //Fallback: ask main for chat port
    getChatPort: async () => {
        return await ipcRenderer.invoke("get-chat-port");
    },


    //Orca Slicer
    launchOrcaSlicer: ()=> ipcRenderer.send("launch-orca-slicer"),

    //Bambu Studio
    launchBambuStudio: () => ipcRenderer.send("launch-bambu-studio"),

    launchFreeCAD: () => ipcRenderer.send('launch-freecad'),
    // 🔄 Optional generic messaging
    sendMessage: (channel, data) => ipcRenderer.send(channel, data),
    onMessage: (channel, func) =>
        ipcRenderer.on(channel, (_, ...args) => func(...args)),

    executeCommand: (cmd) => ipcRenderer.send("assistant-command", cmd),
});
