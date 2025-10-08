const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn, exec } = require('child_process');

app.disableHardwareAcceleration();

let byteProcess = null;

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

app.whenReady().then(() => {
  startByteAssistant();   // ✅ Byte starten
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (byteProcess) {
      console.log('🛑 Beende Byte-Sprachassistent...');
      byteProcess.kill();
    }
    app.quit();
  }
});

// 🖌️ Paint starten bei Button-Klick
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

// 📂 Dateiexplorer öffnen bei Button-Klick
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
