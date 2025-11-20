process.on("unhandledRejection", (reason) => {
    console.error("⚠️ Unhandled Promise Rejection:", reason);
});

const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn, exec } = require("child_process");
const net = require("net");
const os = require("os");

// Plattform erkennen
const platform = os.platform(); // 'win32', 'darwin', 'linux'

if (platform === "win32") {
    console.log("Running on Windows → Disabling hardware acceleration");
    app.disableHardwareAcceleration();
} else {
    console.log(`Running on ${platform} → Keeping hardware acceleration enabled`);
}

let ollamaProcess = null;
let byteProcess = null;
let chatProcess = null;
let mainWindow = null;
global.chatPort = null;

// ------------------------------------------------------
// Ollama Autostart
// ------------------------------------------------------
function startOllamaServer() {
    return new Promise((resolve, reject) => {
        console.log("🧩 Starting Ollama background server...");

        // Prüfen ob Ollama schon läuft
        const check = require("child_process").spawn("curl", ["-s", "http://127.0.0.1:11434/api/tags"]);

        let output = "";
        check.stdout.on("data", (d) => (output += d.toString()));
        check.on("close", (code) => {
            if (output.includes("models")) {
                console.log("✅ Ollama is already running.");
                resolve();
                return;
            }

            // Wenn nicht läuft → starten
            ollamaProcess = spawn("ollama", ["serve"], {
                detached: true,
                stdio: "ignore", // läuft still im Hintergrund
            });
            ollamaProcess.unref();

            console.log("🚀 Ollama started in background.");
            setTimeout(resolve, 1500); // gib ihm kurz Zeit zum Starten
        });

        check.on("error", (err) => {
            console.error("💥 Ollama check failed:", err);
            reject(err);
        });
    });
}

// ------------------------------------------------------
// Byte Sprachassistent
// ------------------------------------------------------
function startByteAssistant() {
    const scriptPath = path.resolve(__dirname, "./byte-assistant/ByteAssistant.py");

    const pythonCmd = process.platform === "win32"
        ? path.resolve(__dirname, "./byte-assistant/venv/Scripts/python.exe")
        : path.resolve(__dirname, "./byte-assistant/venv/venv/bin/python");

    console.log("🚀 Starting Byte assistant...");
    byteProcess = spawn(pythonCmd, [scriptPath], { cwd: path.dirname(scriptPath) });

    byteProcess.stdout.on("data", (d) => console.log(`[Byte stdout] ${d.toString().trim()}`));
    byteProcess.stderr.on("data", (d) => console.error(`[Byte stderr] ${d.toString().trim()}`));
    byteProcess.on("exit", (code, sig) => console.warn(`⚠️ Byte process exited — code=${code}, signal=${sig}`));
}

// ------------------------------------------------------
// Chat Assistant
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
        const scriptPath = path.resolve(__dirname, "./byte-assistant/ByteAssistant.py");

        const pythonCmd = process.platform === "win32"
            ? path.resolve(__dirname, "./byte-assistant/venv/Scripts/python.exe")
            : path.resolve(__dirname, "./byte-assistant/venv/venv/bin/python");
        const freePort = await findFreePort(5050);

        global.chatPort = freePort;
        console.log(`💬 Using free port ${freePort} for ChatAssistant`);

        chatProcess = spawn(
            pythonCmd,
            ["-m", "uvicorn", "ChatAssistant:app", "--host", "127.0.0.1", "--port", `${freePort}`],
            { cwd: path.resolve(__dirname, "./byte-assistant") }
        );

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
// Electron Window
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
// Lifecycle
// ------------------------------------------------------
app.whenReady().then(async () => {
    await startOllamaServer();
    startByteAssistant();
    createWindow();
    await startChatAssistant();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        console.log("🛑 Cleaning up processes...");
        if (byteProcess) byteProcess.kill("SIGTERM");
        if (chatProcess) chatProcess.kill("SIGTERM");
        if (ollamaProcess) ollamaProcess.kill("SIGTERM");

        app.quit();
    }
});

// ------------------------------------------------------
// IPC Handlers
// ------------------------------------------------------
ipcMain.handle("get-chat-port", () => global.chatPort || null);

ipcMain.on("launch-paint", () => {
    const scriptPath = path.join(__dirname, "paint.py");
    exec(`python "${scriptPath}"`, (err, stdout, stderr) => {
        if (err) console.error(`❌ Paint error: ${err.message}`);
        if (stdout) console.log(`[Paint stdout] ${stdout.trim()}`);
        if (stderr) console.error(`[Paint stderr] ${stderr.trim()}`);
    });
});

ipcMain.on("open-file-explorer", () => {
    let cmd = "xdg-open .";
    if (process.platform === "win32") cmd = "start .";
    if (process.platform === "darwin") cmd = "open .";
    exec(cmd, (err) => {
        if (err) console.error("❌ File Explorer error:", err);
    });
});

ipcMain.on("launch-orca-slicer", () => {
    const slicerPath = path.resolve(
        "C:\\Program Files\\FlashForge\\Orca-Flashforge\\orca-flashforge.exe"
    );
    console.log(`Starting Orca Slicer: ${slicerPath}`);
    const child = spawn(slicerPath, [], {
        detached: true,
        stdio: "ignore",
    });
    child.on("error", (err) => {
        console.error(`Failed to start Orca Slicer: ${err.message}`);
    });
    // optional: Prozess unabhängig weiterlaufen lassen
    child.unref();
});

ipcMain.on('launch-freecad', () => {
    exec('open -a /Applications/FreeCAD.app'); // macOS-kompatibler Start!
});
