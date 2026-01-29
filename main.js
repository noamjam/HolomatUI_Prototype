// main.js
// ------------------------------------------------------
// Globale Fehlerhandler
// ------------------------------------------------------
process.on("unhandledRejection", (reason) => {
    console.error("⚠️ Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("💥 Uncaught Exception in main:", err);
});

// ------------------------------------------------------
// Imports
// ------------------------------------------------------
const path = require("path");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { spawn, exec } = require("child_process");
const net = require("net");
const os = require("os");
const fs = require("fs");
const express = require("express");
const cors = require("cors");

// ------------------------------------------------------
// Hilfsfunktionen
// ------------------------------------------------------
function safeSpawn(cmd, args = [], options = {}) {
    try {
        const child = spawn(cmd, args, options);
        child.on("error", (err) => {
            console.error(`❌ Failed to spawn "${cmd}":`, err.message);
        });
        return child;
    } catch (err) {
        console.error(`❌ spawn threw for "${cmd}":`, err);
        return null;
    }
}

function getPythonCommand() {
    const envPython = process.env.PYTHON;
    if (envPython && envPython.trim().length > 0) {
        return envPython.trim();
    }
    if (process.platform === "win32") {
        return "python";
    }
    return "python3";
}

// ------------------------------------------------------
// Express Run-Server (Code Runner)
// ------------------------------------------------------
let runServerApp = null;
let runServerInstance = null;

function startRunServer() {
    if (runServerInstance) {
        console.log("ℹ️ Run server already running.");
        return;
    }

    runServerApp = express();
    runServerApp.use(cors());
    runServerApp.use(express.json());

    runServerApp.post("/api/run", (req, res) => {
        try {
            const { language, code } = req.body || {};
            console.log("💻 /api/run request:", { language });

            if (typeof code !== "string") {
                return res
                    .status(400)
                    .json({ error: "Invalid payload: code must be a string" });
            }

            let cmd;
            let args;

            if (language === "python") {
                cmd = getPythonCommand();
                args = ["-c", code];
            } else if (language === "javascript") {
                cmd = "node";
                args = ["-e", code];
            } else {
                return res
                    .status(400)
                    .json({ error: `Language not supported: ${language}` });
            }

            const child = safeSpawn(cmd, args, {
                windowsHide: process.platform === "win32",
                env: process.env,
            });

            if (!child) {
                return res
                    .status(500)
                    .json({ error: `Failed to start interpreter: ${cmd}` });
            }

            let stdout = "";
            let stderr = "";
            const MAX_OUTPUT = 200_000;
            const TIMEOUT_MS = 3000;

            const killTimer = setTimeout(() => {
                try {
                    child.kill("SIGTERM");
                } catch (e) {
                    console.warn("⚠️ Failed to kill child:", e.message);
                }
            }, TIMEOUT_MS);

            const appendLimited = (target, chunk) => {
                const text = chunk.toString();
                if (target.length >= MAX_OUTPUT) return target;
                const remaining = MAX_OUTPUT - target.length;
                return target + text.slice(0, remaining);
            };

            child.stdout.on("data", (d) => {
                stdout = appendLimited(stdout, d);
            });

            child.stderr.on("data", (d) => {
                stderr = appendLimited(stderr, d);
            });

            child.on("close", (exitCode, signal) => {
                clearTimeout(killTimer);
                const combined = `${stdout}${
                    stderr ? (stdout ? "\n" : "") + stderr : ""
                }`.trim();

                const output = combined
                    ? combined
                    : signal
                        ? `Process killed (${signal})`
                        : `No output (exitCode=${exitCode})`;

                return res.json({ output, exitCode, signal });
            });
        } catch (err) {
            console.error("💥 /api/run handler error:", err);
            return res.status(500).json({ error: "Internal run server error" });
        }
    });

    runServerApp.use((req, res) => {
        res.status(404).json({ error: "Not found" });
    });

    runServerApp.use((err, req, res, next) => {
        console.error("💥 Express error:", err);
        res.status(500).json({ error: "Internal server error" });
    });

    const port = 5000;
    try {
        runServerInstance = runServerApp.listen(port, "127.0.0.1", () => {
            console.log(`✅ Run server listening on http://127.0.0.1:${port}`);
        });

        runServerInstance.on("error", (err) => {
            console.error("💥 Run server error:", err);
        });
    } catch (err) {
        console.error("💥 Failed to start run server:", err);
    }
}

// ------------------------------------------------------
// Upload-Server (Markdown Bild-Uploads)
// ------------------------------------------------------
let uploadServerProcess = null;

function startUploadServer() {
    if (uploadServerProcess) {
        console.log("ℹ️ Upload server already running.");
        return;
    }

    const serverPath = path.join(__dirname, "server.js");

    uploadServerProcess = safeSpawn(process.execPath, [serverPath], {
        cwd: __dirname,
        windowsHide: process.platform === "win32",
    });

    if (!uploadServerProcess) {
        console.error("❌ Failed to start upload server.");
        return;
    }

    uploadServerProcess.stdout?.on("data", (d) =>
        console.log(`[Upload stdout] ${d.toString().trim()}`)
    );
    uploadServerProcess.stderr?.on("data", (d) =>
        console.error(`[Upload stderr] ${d.toString().trim()}`)
    );
    uploadServerProcess.on("exit", (code, sig) => {
        console.warn(`⚠️ Upload server exited — code=${code}, signal=${sig}`);
        uploadServerProcess = null;
    });
}

// ------------------------------------------------------
// Plattform-Handling
// ------------------------------------------------------
const platform = os.platform();
if (platform === "win32") {
    console.log("Running on Windows → Disabling hardware acceleration");
    app.disableHardwareAcceleration();
} else {
    console.log(`Running on ${platform} → Keeping hardware acceleration enabled`);
}

// ------------------------------------------------------
// State
// ------------------------------------------------------
let ollamaProcess = null;
let byteProcess = null;
let chatProcess = null;
let mainWindow = null;
let chatWindow = null;
global.chatPort = null;

// ------------------------------------------------------
// Ollama Autostart
// ------------------------------------------------------
function startOllamaServer() {
    return new Promise((resolve) => {
        console.log("🧩 Starting Ollama background server...");

        let check;
        try {
            check = safeSpawn("curl", ["-s", "http://127.0.0.1:11434/api/tags"]);
        } catch (err) {
            console.warn("⚠️ curl spawn failed, starting ollama directly:", err);
        }

        if (!check) {
            startOllamaBinary(resolve);
            return;
        }

        let output = "";
        check.stdout.on("data", (d) => (output += d.toString()));

        check.on("close", () => {
            if (output.includes("models")) {
                console.log("✅ Ollama is already running.");
                resolve();
                return;
            }
            startOllamaBinary(resolve);
        });

        check.on("error", (err) => {
            console.warn("⚠️ curl not available or check failed:", err.message);
            startOllamaBinary(resolve);
        });
    });
}

function startOllamaBinary(resolve) {
    const OLLAMA_BIN = process.platform === "win32" ? "ollama.exe" : "ollama";

    ollamaProcess = safeSpawn(OLLAMA_BIN, ["serve"], {
        detached: true,
        stdio: "ignore",
    });

    if (!ollamaProcess) {
        console.warn("⚠️ Could not start Ollama binary.");
        resolve();
        return;
    }

    try {
        ollamaProcess.unref();
    } catch (e) {
        console.warn("⚠️ Failed to unref Ollama process:", e.message);
    }

    console.log("🚀 Ollama started in background.");
    setTimeout(resolve, 1500);
}

// ------------------------------------------------------
// Byte Sprachassistent
// ------------------------------------------------------
function startByteAssistant() {
    try {
        const scriptPath = path.resolve(__dirname, "./byte-assistant/ByteAssistant.py");
        const pythonCmd =
            process.platform === "win32"
                ? path.resolve(__dirname, "./byte-assistant/.venv/Scripts/python.exe")
                : path.resolve(__dirname, ".venv1/bin/python");

        console.log("🚀 Starting Byte assistant...");
        byteProcess = safeSpawn(pythonCmd, [scriptPath], {
            cwd: path.dirname(scriptPath),
            env: {
                ...process.env,
                CHAT_PORT: String(global.chatPort || 5050),
            },
        });

        if (!byteProcess) return;

        byteProcess.stdout.on("data", (d) =>
            console.log(`[Byte stdout] ${d.toString().trim()}`)
        );
        byteProcess.stderr.on("data", (d) =>
            console.error(`[Byte stderr] ${d.toString().trim()}`)
        );
        byteProcess.on("exit", (code, sig) =>
            console.warn(`⚠️ Byte process exited — code=${code}, signal=${sig}`)
        );
    } catch (err) {
        console.error("💥 Failed to start Byte Assistant:", err);
    }
}

// ------------------------------------------------------
// Freien Port finden
// ------------------------------------------------------
async function findFreePort(startPort = 5050) {
    return new Promise((resolve) => {
        const server = net.createServer();

        server.once("listening", () => {
            const { port } = server.address();
            server.close(() => resolve(port));
        });

        server.once("error", () => resolve(findFreePort(startPort + 1)));

        try {
            server.listen(startPort, "127.0.0.1");
        } catch (err) {
            console.error("💥 Error while binding test port:", err);
            resolve(findFreePort(startPort + 1));
        }
    });
}

// ------------------------------------------------------
// Chat Assistant (FastAPI/Uvicorn)
// ------------------------------------------------------
async function startChatAssistant() {
    try {
        const scriptPath = path.resolve(
            __dirname,
            "./byte-assistant/ChatAssistant.py"
        );
        const pythonCmd =
            process.platform === "win32"
                ? path.resolve(__dirname, "./byte-assistant/.venv/Scripts/python.exe")
                : path.resolve(__dirname, ".venv1/bin/python");

        const freePort = await findFreePort(5050);
        global.chatPort = freePort;
        console.log(`💬 Using free port ${freePort} for ChatAssistant`);

        chatProcess = safeSpawn(
            pythonCmd,
            ["-m", "uvicorn", "ChatAssistant:app", "--host", "127.0.0.1", "--port", `${freePort}`],
            { cwd: path.resolve(__dirname, "./byte-assistant") }
        );

        if (!chatProcess) return;

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
    try {
        mainWindow = new BrowserWindow({
            width: 1024,
            height: 768,
            frame: true,
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, "preload.js"),
                contextIsolation: true,
                nodeIntegration: false,
            },
        });

        mainWindow.setFullScreen(true);
        mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));

        mainWindow.on("closed", () => {
            mainWindow = null;
        });
    } catch (err) {
        console.error("💥 Failed to create main window:", err);
    }
}

// ------------------------------------------------------
// Lifecycle
// ------------------------------------------------------
app.whenReady().then(async () => {
    try {
        startRunServer();
        startUploadServer();
        await startOllamaServer();
        await startChatAssistant();
        startByteAssistant();
        createWindow();
    } catch (err) {
        console.error("💥 Error during app startup:", err);
    }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        console.log("🛑 Cleaning up processes...");
        try {
            if (byteProcess) byteProcess.kill("SIGTERM");
            if (chatProcess) chatProcess.kill("SIGTERM");
            if (ollamaProcess) ollamaProcess.kill("SIGTERM");
            if (runServerInstance) runServerInstance.close();
            if (uploadServerProcess) uploadServerProcess.kill("SIGTERM");
        } catch (err) {
            console.error("⚠️ Error while cleaning up processes:", err);
        }
        app.quit();
    }
});

app.on("before-quit", () => {
    console.log("🔚 App is quitting...");
});

// ------------------------------------------------------
// IPC
// ------------------------------------------------------
ipcMain.handle("get-chat-port", () => global.chatPort || null);

ipcMain.on("open-chat-window", () => {
    try {
        if (chatWindow && !chatWindow.isDestroyed()) {
            chatWindow.focus();
            return;
        }

        chatWindow = new BrowserWindow({
            width: 420,
            height: 560,
            resizable: true,
            autoHideMenuBar: true,
            alwaysOnTop: true,
            backgroundColor: "#020617",
            webPreferences: {
                preload: path.join(__dirname, "preload.js"),
                contextIsolation: true,
                nodeIntegration: false,
            },
        });

        chatWindow.loadFile(path.join(__dirname, "dist", "chat.html"));

        chatWindow.on("closed", () => {
            chatWindow = null;
        });
    } catch (err) {
        console.error("💥 Failed to open chat window:", err);
    }
});

ipcMain.on("launch-paint", () => {
    try {
        const scriptPath = path.join(__dirname, "paint.py");
        const pythonCmd = getPythonCommand();
        exec(`"${pythonCmd}" "${scriptPath}"`, (err, stdout, stderr) => {
            if (err) console.error(`❌ Paint error: ${err.message}`);
            if (stdout) console.log(`[Paint stdout] ${stdout.trim()}`);
            if (stderr) console.error(`[Paint stderr] ${stderr.trim()}`);
        });
    } catch (err) {
        console.error("💥 launch-paint threw:", err);
    }
});

ipcMain.on("open-file-explorer", () => {
    try {
        let cmd = "xdg-open .";
        if (process.platform === "win32") cmd = "start .";
        if (process.platform === "darwin") cmd = "open .";
        exec(cmd, (err) => {
            if (err) console.error("❌ File Explorer error:", err);
        });
    } catch (err) {
        console.error("💥 open-file-explorer threw:", err);
    }
});

ipcMain.on("launch-orca-slicer", () => {
    if (process.platform !== "win32") {
        console.warn("ℹ️ Orca Slicer only configured for Windows.");
        return;
    }
    try {
        const slicerPath = path.resolve(
            "C:\\Program Files\\FlashForge\\Orca-Flashforge\\orca-flashforge.exe"
        );
        console.log(`Starting Orca Slicer: ${slicerPath}`);
        const child = safeSpawn(slicerPath, [], {
            detached: true,
            stdio: "ignore",
        });
        if (child) {
            try {
                child.unref();
            } catch (e) {
                console.warn("⚠️ Failed to unref Orca Slicer:", e.message);
            }
        }
    } catch (err) {
        console.error("💥 launch-orca-slicer threw:", err);
    }
});

ipcMain.on("launch-bambu-studio", () => {
    try {
        if (process.platform === "win32") {
            const slicerPath = path.resolve(
                "C:\\Program Files\\Bambu Studio\\bambu-studio.exe"
            );
            console.log(`Starting Bambu Studio (Windows): ${slicerPath}`);
            const child = safeSpawn(slicerPath, [], {
                detached: true,
                stdio: "ignore",
            });
            if (child) {
                try {
                    child.unref();
                } catch (e) {
                    console.warn("⚠️ Failed to unref Bambu Studio (Win):", e.message);
                }
            }
        } else if (process.platform === "darwin") {
            const cmd = 'open -a "/Applications/BambuStudio.app"';
            console.log("Starting Bambu Studio (macOS) with:", cmd);
            exec(cmd, (err) => {
                if (err) {
                    console.error("❌ Bambu Studio (macOS) error:", err);
                }
            });
        } else {
            console.warn("ℹ️ Bambu Studio launcher not configured for this platform.");
        }
    } catch (err) {
        console.error("💥 launch-bambu-studio threw:", err);
    }
});

ipcMain.on("launch-freecad", () => {
    try {
        if (process.platform === "win32") {
            const FreeCADpath = path.resolve(
                "C:\\Users\\noahm\\AppData\\Local\\Programs\\FreeCAD 1.0\\bin\\freecad.exe"
            );
            const child = safeSpawn(FreeCADpath, [], {
                detached: true,
                stdio: "ignore",
            });
            if (child) {
                try {
                    child.unref();
                } catch (e) {
                    console.warn("⚠️ Failed to unref FreeCAD:", e.message);
                }
            }
        } else if (process.platform === "darwin") {
            exec('open -a /Applications/FreeCAD.app', (err) => {
                if (err) console.error("❌ FreeCAD (macOS) error:", err);
            });
        } else {
            console.warn("ℹ️ FreeCAD launcher not configured for this platform.");
        }
    } catch (err) {
        console.error("💥 launch-freecad threw:", err);
    }
});

ipcMain.on("assistant-command", async (event, cmd) => {
    if (!cmd || typeof cmd.tool != "string") return;

    const { response } = await dialog.showMessageBox({
        type: "question",
        buttons: ["Allow", "Cancel"],
        defaultId: 0,
        cancelId: 1,
        message: `Assistant wants to run: ${cmd.tool}. Continue?`,
    });

    if (response !== 0) return;

    switch (cmd.tool) {
        case "open_freecad":
            if (process.platform === "win32") {
                const FreeCADpath = path.resolve(
                    "C:\\Users\\noahm\\AppData\\Local\\Programs\\FreeCAD 1.0\\bin\\freecad.exe"
                );
                const child = safeSpawn(FreeCADpath, [], {
                    detached: true,
                    stdio: "ignore",
                });
                if (child) child.unref();
            } else if (process.platform === "darwin") {
                exec('open -a /Applications/FreeCAD.app');
            }
            break;

        case "open_BambuStudio":
            if (process.platform === "win32") {
                const slicerPath = path.resolve(
                    "C:\\Program Files\\Bambu Studio\\bambu-studio.exe"
                );
                console.log(`Starting Bambu Studio (Windows): ${slicerPath}`);
                const child = safeSpawn(slicerPath, [], {
                    detached: true,
                    stdio: "ignore",
                });
                if (child) {
                    try {
                        child.unref();
                    } catch (e) {
                        console.warn("⚠️ Failed to unref Bambu Studio (Win):", e.message);
                    }
                }
            } else if (process.platform === "darwin") {
                const cmd2 = 'open -a "/Applications/BambuStudio.app"';
                console.log("Starting Bambu Studio (macOS) with:", cmd2);
                exec(cmd2, (err) => {
                    if (err) {
                        console.error("❌ Bambu Studio (macOS) error:", err);
                    }
                });
            }
            break;

        case "open_OrcaSlicer":
            if (process.platform === "win32") {
                const slicerPath2 = path.resolve(
                    "C:\\Program Files\\FlashForge\\Orca-Flashforge\\orca-flashforge.exe"
                );
                console.log(`Starting Orca Slicer: ${slicerPath2}`);
                const child2 = safeSpawn(slicerPath2, [], {
                    detached: true,
                    stdio: "ignore",
                });
                if (child2) {
                    try {
                        child2.unref();
                    } catch (e) {
                        console.warn("⚠️ Failed to unref Orca Slicer:", e.message);
                    }
                }
            } else if (process.platform === "darwin") {
                const cmd3 = 'open -a "/Applications/OrcaSlicer.app"';
                console.log("Starting Orca Slicer (macOS) with:", cmd3);
                exec(cmd3, (err) => {
                    if (err) {
                        console.error("❌ OrcaSlicer (macOS) error:", err);
                    }
                });
            }
            break;

        default:
            console.warn("Unknown assistant tool:", cmd.tool);
    }
});

ipcMain.handle("save-markdown-dialog", async (event, content) => {
    try {
        const { canceled, filePath } = await dialog.showSaveDialog({
            title: "Save Markdown",
            defaultPath: "Notes.md",
            filters: [
                { name: "Markdown", extensions: ["md"] },
                { name: "All Files", extensions: ["*"] },
            ],
        });

        if (canceled || !filePath) {
            return { canceled: true };
        }

        fs.writeFileSync(filePath, content || "", "utf8");
        return { canceled: false, filePath };
    } catch (err) {
        console.error("💥 save-markdown-dialog error:", err);
        return { canceled: true, error: err.message };
    }
});

ipcMain.handle("open-markdown-dialog", async () => {
    try {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            title: "Open Markdown",
            filters: [
                { name: "Markdown", extensions: ["md"] },
                { name: "All Files", extensions: ["*"] },
            ],
            properties: ["openFile"],
        });

        if (canceled || !filePaths || filePaths.length === 0) {
            return { canceled: true };
        }

        const filePath = filePaths[0];
        const content = fs.readFileSync(filePath, "utf8");
        return { canceled: false, filePath, content };
    } catch (err) {
        console.error("💥 open-markdown-dialog error:", err);
        return { canceled: true, error: err.message };
    }
});