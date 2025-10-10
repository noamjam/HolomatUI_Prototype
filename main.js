// main.js — Stable version (Byte + Chat + IPC fixes)
process.on("unhandledRejection", (reason) => {
    console.error("⚠️ Unhandled Promise Rejection:", reason);
});

const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn, exec } = require("child_process");
const net = require("net");

app.disableHardwareAcceleration();

let byteProcess = null;
let chatProcess = null;
let mainWindow = null;
global.chatPort = null; // <--- shared between main and renderer

// ------------------------------------------------------
// 🎤 Byte Sprachassistent
// ------------------------------------------------------
function startByteAssistant() {
    const scriptPath = path.resolve(__dirname, "./byte-assistant/ByteAssistant.py");
    const pythonCmd = path.resolve(__dirname, "./byte-assistant/venv/Scripts/python.exe");

    console.log("🚀 Starting Byte assistant...");
    byteProcess = spawn(pythonCmd, [scriptPath], { cwd: path.dirname(scriptPath) });

    byteProcess.stdout.on("data", (d) => console.log(`[Byte stdout] ${d.toString().trim()}`));
    byteProcess.stderr.on("data", (d) => console.error(`[Byte stderr] ${d.toString().trim()}`));
    byteProcess.on("exit", (code, sig) => console.warn(`⚠️ Byte process exited — code=${code}, signal=${sig}`));
}

// ------------------------------------------------------
// 💬 Chat Assistant (FastAPI/Uvicorn)
// ------------------------------------------------------
async function findFreePort(startPort = 5050) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once("listening", () => {
            const { port } = server.address();
            server.close(() => resolve(port));
        });
        server.once("error", () => resolve(findFreePort(startPort + 1)));
        server.listen(startPort, "127.0.0.1");
    });
}

async function startChatAssistant() {
    try {
        const scriptPath = path.resolve(__dirname, "./byte-assistant/ChatAssistant.py");
        const pythonCmd = path.resolve(__dirname, "./byte-assistant/venv/Scripts/python.exe");
        const freePort = await findFreePort(5050);

        global.chatPort = freePort;
        console.log(`💬 Using free port ${freePort} for ChatAssistant`);

        chatProcess = spawn(
            pythonCmd,
            ["-m", "uvicorn", "ChatAssistant:app", "--host", "127.0.0.1", "--port", `${freePort}`],
            { cwd: path.resolve(__dirname, "./byte-assistant") }
        );

        if (!chatProcess || !chatProcess.stdout) {
            console.error("❌ Chat process did not start correctly!");
            return;
        }

        chatProcess.stdout.on("data", (data) => {
            const line = data.toString().trim();
            console.log(`[Chat stdout] ${line}`);

            if (line.includes("Uvicorn running") || line.includes("Running on")) {
                console.log(`✅ Chat server started on port ${freePort}`);
                if (mainWindow?.webContents) {
                    mainWindow.webContents.send("chat-server-started", freePort);
                }
            }
        });

        chatProcess.stderr.on("data", (data) =>
            console.error(`[Chat stderr] ${data.toString().trim()}`)
        );

        chatProcess.on("exit", (code, sig) =>
            console.warn(`⚠️ Chat process exited — code=${code}, signal=${sig}`)
        );
    } catch (err) {
        console.error("💥 Failed to start Chat Assistant:", err);
    }
}

// ------------------------------------------------------
// 🪟 Electron Window
// ------------------------------------------------------
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
    mainWindow.on("closed", () => (mainWindow = null));
}

// ------------------------------------------------------
// 🚀 App Lifecycle
// ------------------------------------------------------
app.whenReady().then(async () => {
    startByteAssistant();
    createWindow();
    await startChatAssistant();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        console.log("🛑 Cleaning up child processes...");
        if (byteProcess) byteProcess.kill("SIGTERM");
        if (chatProcess) chatProcess.kill("SIGTERM");
        app.quit();
    }
});

// ------------------------------------------------------
// 🧩 IPC Handlers
// ------------------------------------------------------
ipcMain.handle("get-chat-port", () => {
    return global.chatPort || null;
});

ipcMain.on("launch-paint", () => {
    const scriptPath = path.join(__dirname, "paint.py");
    const pythonCmd = "python";
    console.log(`🎨 Starting Paint: ${scriptPath}`);
    exec(`${pythonCmd} "${scriptPath}"`, (err, stdout, stderr) => {
        if (err) console.error(`❌ Paint error: ${err.message}`);
        if (stdout) console.log(`[Paint stdout] ${stdout.trim()}`);
        if (stderr) console.error(`[Paint stderr] ${stderr.trim()}`);
    });
});

ipcMain.on("open-file-explorer", () => {
    let cmd = "xdg-open .";
    if (process.platform === "win32") cmd = "start .";
    if (process.platform === "darwin") cmd = "open .";

    console.log(`📁 Opening File Explorer: ${cmd}`);
    exec(cmd, (err) => {
        if (err) console.error("❌ File Explorer error:", err);
    });
});
