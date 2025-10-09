// main.js
process.on("unhandledRejection", (reason, promise) => {
    console.error("⚠️ Unhandled Promise Rejection:", reason);
});

const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn, exec } = require('child_process');
const axios = require('axios');
const net = require("net");


app.disableHardwareAcceleration();

let byteProcess = null;
let chatProcess = null; // 🔥 Neuer Prozess für ChatAssistant

// ------------------------------------------------------
// 🚀 BYTE Sprachassistent starten (alter Code)
// ------------------------------------------------------
function startByteAssistant() {
    const scriptPath = path.resolve(__dirname, './byte-assistant/ByteAssistant.py');
    const pythonCmd = path.resolve(__dirname, './byte-assistant/venv/Scripts/python');

    console.log('🚀 Starte Byte-Sprachassistent...');
    console.log(`📄 Python-Skript: ${scriptPath}`);

    byteProcess = spawn(pythonCmd, [scriptPath]);

    byteProcess.stdout.on('data', (data) => {
        console.log(`[Byte stdout] ${data.toString().trim()}`);
    });

    byteProcess.stderr.on('data', (data) => {
        console.error(`[Byte stderr] ${data.toString().trim()}`);
    });

    byteProcess.on('exit', (code, signal) => {
        console.warn(`⚠️ Byte-Prozess beendet. Code: ${code}, Signal: ${signal}`);
    });
}

// ------------------------------------------------------
// 💬 Chat-Server (uvicorn) starten
// ------------------------------------------------------

async function findFreePort(startPort = 5050) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once("listening", () => {
            const port = server.address().port;
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
        console.log(`💬 Using free port ${freePort} for ChatAssistant`);


        const chatProcess = spawn(
            pythonCmd,
            ["-m", "uvicorn", "ChatAssistant:app", "--host", "127.0.0.1", "--port", `${freePort}`],
            {
                cwd: path.resolve(__dirname, "./byte-assistant"), // <--- Wichtig!
            }
        );
        // 👇 Wenn der Server läuft, sende Port an Renderer
        chatProcess.stdout.on("data", (data) => {
            console.log(`[Chat stdout] ${data.toString().trim()}`);
            if (data.toString().includes("Uvicorn running")) {
                console.log(`✅ Chat server started on port ${chatPort}`);
                mainWindow.webContents.send("chat-server-started", chatPort);
            }
        });

        // 🧠 Safety check
        if (!chatProcess || !chatProcess.stdout || !chatProcess.stderr) {
            console.error("❌ Chat process failed to start or is invalid!");
            return;
        }

        // 📢 Logging
        chatProcess.stdout.on("data", (data) => {
            console.log(`[Chat stdout] ${data}`);
        });

        chatProcess.stderr.on("data", (data) => {
            console.error(`[Chat stderr] ${data}`);
        });

        chatProcess.on("exit", (code, signal) => {
            console.warn(`⚠️ Chat process exited. Code: ${code}, Signal: ${signal}`);
        });

        // Optional: send Port to renderer process
        global.chatPort = freePort;
        console.log(`✅ Chat server started on port ${freePort}`);

        return chatProcess;
    } catch (err) {
        console.error("💥 Failed to start Chat Assistant:", err);
    }
}
// ------------------------------------------------------
// 🪟 Electron Fenster
// ------------------------------------------------------
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

// ------------------------------------------------------
// 🧠 App Startup
// ------------------------------------------------------
app.whenReady().then(async () => {
    startByteAssistant();     // 🎤 Sprachassistent starten
    await startChatAssistant(); // 💬 Chat-Server starten
    createWindow();
});

// ------------------------------------------------------
// 🛑 Prozesse sauber beenden
// ------------------------------------------------------
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (byteProcess) {
            console.log('🛑 Beende Byte-Sprachassistent...');
            byteProcess.kill();
        }
        if (chatProcess) {
            console.log('🛑 Beende Chat-Server...');
            chatProcess.kill('SIGTERM');
        }
        app.quit();
    }
});

// ------------------------------------------------------
// 🖌️ Paint starten bei Button-Klick
// ------------------------------------------------------
ipcMain.on('launch-paint', () => {
    const pythonPath = 'python3'; // oder 'python'
    const scriptPath = path.join(__dirname, 'paint.py');

    console.log(`🎨 Starte Paint: ${scriptPath}`);

    exec(`${pythonPath} "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Fehler beim Starten von Paint: ${error.message}`);
            return;
        }
        console.log(`✅ Paint gestartet.`);
        if (stdout) console.log(`[Paint stdout] ${stdout.trim()}`);
        if (stderr) console.error(`[Paint stderr] ${stderr.trim()}`);
    });
});

// ------------------------------------------------------
// 📂 Dateiexplorer öffnen bei Button-Klick
// ------------------------------------------------------
ipcMain.on('open-file-explorer', () => {
    let command = 'xdg-open .'; // Linux

    if (process.platform === 'win32') {
        command = 'start .';
    } else if (process.platform === 'darwin') {
        command = 'open .';
    }

    console.log(`📁 Öffne Datei-Explorer mit Befehl: ${command}`);

    exec(command, (error) => {
        if (error) {
            console.error('❌ Fehler beim Öffnen des Datei-Explorers:', error);
        } else {
            console.log('✅ Datei-Explorer geöffnet.');
        }
    });
});
