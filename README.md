# Interactive Workbench

A touch-optimized, unified digital environment built on web technologies — designed to run on Windows, macOS, and Linux without platform-specific adaptations.

The Interactive Workbench consolidates a range of practical tools into a single coherent interface centered on gesture-based input, while remaining fully usable with mouse and keyboard on any standard laptop.

---

## Features

| Application                  | Description                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| **AI Assistant (Byte Chat)** | Local LLM-powered chat and voice assistant via Ollama. Can open external apps on request. |
| **3D Viewer**                | Load, transform, and export GLB, GLTF, STL, and 3MF models using Three.js.                |
| **Text & Code Editor**       | Write and execute Python and JavaScript with syntax highlighting via Monaco Editor.       |
| **Markdown Editor**          | Live dual-pane editor with LaTeX math support and clipboard image paste.                  |
| **Paint**                    | Freehand, line, and circle drawing with undo/redo and PNG export.                         |
| **Music Library**            | MP3 playlist player powered by React H5 Audio Player.                                     |
| **Image Editor**             | Full-featured photo editing via Toast UI Image Editor.                                    |
| **Weather App**              | Current weather via Open-Meteo API.                                                       |
| **Game Collection**          | Byte Invaders, Snake, Minesweeper — all with touch support.                               |
| **Solar System**             | Interactive real-time 3D solar system simulation.                                         |
| **OrcaSlicer**               | Launches OrcaSlicer (Orca for Flashforge) as an external process.                         |
| **FreeCAD**                  | Launches FreeCAD as an external process.                                                  |
| **Bambu Studio**             | Launches Bambu Studio as an external process.                                             |
| **Files**                    | A simple wrapper to start up the local OS file explorer.                                  |
| **Settings**                 | Change the style of your workbench with the click of a button.                            |
| **Calender**                 | Keep track of all your appointments.                                                      |

---

## Tech Stack

**Frontend**

- [React](https://react.dev) + JavaScript
- [Electron](https://www.electronjs.org) — desktop application layer
- [Vite](https://vitejs.dev) — build tooling
- [Three.js](https://threejs.org) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [react-markdown](https://github.com/remarkjs/react-markdown) + [KaTeX](https://katex.org)
- [React H5 Audio Player](https://github.com/lhz516/react-h5-audio-player)
- [Toast UI Image Editor](https://ui.toast.com/tui-image-editor)

**Backend / AI**

- [Python 3.11+](https://www.python.org)
- [FastAPI](https://fastapi.tiangolo.com) + WebSocket
- [Ollama](https://ollama.com) — local LLM runtime
- [PyAudio](https://people.csail.mit.edu/hubert/pyaudio/) — voice input
- [gTTS](https://pypi.org/project/gTTS/) — text-to-speech
- [SpeechRecognition](https://pypi.org/project/SpeechRecognition/)

---

## Requirements

### Software

| Component        | Requirement                                               |
| ---------------- | --------------------------------------------------------- |
| Operating System | Windows 10+, macOS 12+, Linux (web-based)                 |
| Node.js          | v18.0.0 or higher (LTS recommended)                       |
| Python           | 3.11 or higher (3.13.x recommended- used for development) |
| WebGL            | Required for 3D Viewer (supported by all modern GPUs)     |

### Hardware

| Component  | Requirement                                                          |
| ---------- | -------------------------------------------------------------------- |
| Display    | Touch-enabled recommended; 16 in or larger preferred                 |
| Resolution | Minimum 1920 × 1080                                                  |
| CPU        | Intel Core i5 / AMD Ryzen 5 or better                                |
| RAM        | 8 GB minimum — **16 GB recommended** (AI assistant loads up to 5 GB) |
| Storage    | At least 2 GB free                                                   |

> **Note:** The local AI assistant can consume significant RAM. On 8 GB machines, close other applications while using the AI feature.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/noamjam/HolomatUI_Prototype.git
cd HolomatUI_Prototype
```

### 2. Install JavaScript dependencies

```bash
npm install
```

### 3. Set up Python environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 4. Install Python dependencies

```bash
pip install -r requirements.txt
pip install -r requirements_voice.txt   # if present
```

### 5. Build and start

```bash
npm run build
npm start
```

### Windows shortcut

A `.bat` launcher file is included in the repository. Copy it to your Desktop, update the path inside to match your installation directory, and double-click it to launch the workbench without opening a terminal.

### Optional: Touchscreen keyboard (Windows)

Go to **Settings → Accessibility → Keyboard** and enable the on-screen or touch keyboard for full touchscreen support.

---

## External Application Integrations

The workbench can launch the following tools directly from its interface. Install them separately to use these features:

| Application  | Download                                | Notes                                   |
| ------------ | --------------------------------------- | --------------------------------------- |
| OrcaSlicer   | https://github.com/SoftFever/OrcaSlicer | Orca for Flashforge variant recommended |
| FreeCAD      | https://www.freecad.org                 | Parametric 3D CAD                       |
| Bambu Studio | https://github.com/bambulab/BambuStudio | Bambu Lab ecosystem                     |

> **Important:** External applications must be installed to their **default directories**. The workbench uses hard-coded paths for launching — custom installation locations are not yet supported.

---

## AI Assistant Setup

The AI assistant requires [Ollama](https://ollama.com) to be installed and running locally. On first use, Ollama will download the selected language model — a stable internet connection is required for this step only. After the initial download, everything runs fully locally with no data sent to external servers.

---

## Project Structure

```
HolomatUI_Prototype/
├── byte-assistant/         # Python AI backend
│   ├── ByteAssistant.py
│   ├── ChatAssistant.py
│   └── requirements.txt
├── public/                 # Static assets (textures, icons)
├── src/
│   ├── assets/
│   ├── components/         # All React application components
│   ├── App.jsx             # Core routing and IPC orchestration
│   ├── main.jsx
│   ├── style.css
│   └── themes.js
├── main.js                 # Electron main process
├── preload.js              # IPC bridge
├── server.js
├── vite.config.js
└── package.json
```

---

## Adding New Applications

The workbench is designed to be extended. Adding a new application requires:

1. Creating a new React component in `src/components/`
2. Adding an entry to the `apps` array in `App.jsx` with the component, name, and icon
3. Adding a conditional render block in `App.jsx` for the new `currentApp` state

No changes to the core architecture are required. Anyone with basic JavaScript and React knowledge can build and integrate their own applications.

---

## Known Limitations

- External application paths (OrcaSlicer, FreeCAD, Bambu Studio) are hard-coded to default installation locations
- The 3D Viewer exports in GLTF format only, regardless of the original input format
- The Music Library supports MP3 files only
- Theme changes apply to the Home Screen and icons only — not to individual application interiors
- No persistent high-score storage in the game collection
- Linux support for external application launchers has not been explicitly tested

---

## Authors

**Noah Maringer** and **Alexander Stenitzer** — 5BHEL, HTBLuVA Graz-Gösting  
Diploma Thesis 2025/26 — advised by Professor Gerald Senarclens de Grancy


