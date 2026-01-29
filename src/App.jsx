// src/App.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { themes } from "./themes";

import PaintView from "./components/PaintView";
import FileView from "./components/FileView";
import SettingsView from "./components/SettingsView";
import AppCarousel from "./components/AppCarousel";
import ByteIndicator from "./components/ByteIndicator";
import useByteStatus from "./components/useByteStatus";
import ThreeViewer from "./components/ThreeViewer";
import BootScreen from "./components/BootScreen";
import MusicLibrary from "./components/Musiclibrary";
import OrcaSlicer from "./components/OrcaSlicer";
import GameCollection from "./components/GameCollection";
import SolarSystem from "./components/SolarSystem";
import SpaceInvaders from "./components/SpaceInvaders.jsx";
import SnakeGame from "./components/SnakeGame.jsx";
import FreeCAD from "./components/FreeCAD";
import Minesweeper from "./components/Minesweeper";
import WeatherApp from "./components/Weather.jsx";
import VSCodeLayout from "./components/VSCodeLayout.jsx";
import BambuStudio from "./components/BambuStudio";
import CalendarApp from "./components/CalendarApp.jsx";
import ImageEditor from "./components/ImageEditor.jsx";
import { MarkdownEditorShell } from "./components/MarkdownEditorShell";

function App() {
    const [bootDone, setBootDone] = useState(false);
    const [currentApp, setCurrentApp] = useState(null);
    const [startInGrid, setStartInGrid] = useState(false);
    const [theme, setTheme] = useState(themes.default);
    const [activeGame, setActiveGame] = useState(null);
    const [content, setContent] = useState("# Neues Markdown-Dokument");
    const isActive = useByteStatus();

    useEffect(() => {
        const saved = localStorage.getItem("theme") || "default";
        setTheme(themes[saved] || themes.default);
    }, []);

    if (!bootDone) {
        return <BootScreen onFinish={() => setBootDone(true)} />;
    }

    const goHome = () => {
        setActiveGame(null);
        setCurrentApp(null);
    };


    const handleSave = async (value) => {
        setContent(value);

        try {
            const result = await window.electronAPI?.saveMarkdown(value);
            if (result?.canceled) {
                console.log("Save canceled");
            } else {
                console.log("Saved to", result.filePath);
            }
        } catch (err) {
            console.error("Save failed:", err);
        }
    };

    const handleOpen = async () => {
        try {
            const result = await window.electronAPI?.openMarkdown();
            if (result?.canceled) return null;
            setContent(result.content || "");
            return result.content || "";
        } catch (err) {
            console.error("Open failed:", err);
            return null;
        }
    };


    const scanline = {
        hidden: { clipPath: "inset(0 100% 0 0)" },
        visible: {
            clipPath: ["inset(0 100% 0 0)", "inset(0 0 0 0)"],
            transition: { duration: 3, ease: "linear" },
        },
    };

    const handleOpenChat = () => {
        try {
            window.electronAPI?.openChatWindow?.();
        } catch (err) {
            console.error("Failed to open chat window:", err);
        }
    };

    return (
        <div
            className="min-h-screen text-white font-orbitron relative overflow-hidden animated-gradient-bg"
            style={{
                backgroundImage: theme.bgGradient,
                backgroundAttachment: "fixed",
            }}
        >
            {/* Apps */}
            {currentApp === "Paint" && <PaintView onBack={goHome} />}
            {currentApp === "Image Editor" && <ImageEditor onBack={goHome} />}
            {currentApp === "Files" && <FileView onBack={goHome} />}
            {currentApp === "Settings" && <SettingsView onBack={goHome} />}
            {currentApp === "3D Viewer" && <ThreeViewer onBack={goHome} />}
            {currentApp === "MusicLibrary" && <MusicLibrary onBack={goHome} />}
            {currentApp === "OrcaSlicer" && <OrcaSlicer onBack={goHome} />}
            {currentApp === "Solar System" && <SolarSystem onBack={goHome} />}
            {currentApp === "FreeCAD" && <FreeCAD onBack={goHome} />}
            {currentApp === "Weather" && <WeatherApp onBack={goHome} />}
            {currentApp === "Text Editor" && <VSCodeLayout onBack={goHome} />}
            {currentApp === "Bambu Studio" && <BambuStudio onBack={goHome} />}
            {currentApp === "Calender App" && <CalendarApp onBack={goHome} />}
            {currentApp === "Markdown Editor" && (
                <MarkdownEditorShell
                    initialValue={content}
                    onSave={handleSave}
                    onOpen={handleOpen}   // NEU
                    title="Notes.md"
                    onBack={goHome}
                />
            )}

            {/* Game Collection */}
            {currentApp === "Game Collection" && !activeGame && (
                <GameCollection
                    onBack={goHome}
                    onStartGame={(gameId) => {
                        if (gameId === "byte-invaders") setActiveGame("byte-invaders");
                        if (gameId === "snake-game") setActiveGame("snake-game");
                        if (gameId === "Minesweeper") setActiveGame("Minesweeper");
                    }}
                />
            )}

            {activeGame === "byte-invaders" && (
                <SpaceInvaders onBack={() => setActiveGame(null)} onHome={goHome} />
            )}
            {activeGame === "snake-game" && (
                <SnakeGame onBack={() => setActiveGame(null)} onHome={goHome} />
            )}
            {activeGame === "Minesweeper" && (
                <Minesweeper onBack={() => setActiveGame(null)} onHome={goHome} />
            )}

            {/* Home-Screen */}
            {currentApp === null && !activeGame && (
                <div className="p-8">
                    <h1
                        className="text-4xl font-bold mb-12 text-center overflow-hidden"
                        style={{
                            color: theme.textColor,
                            textShadow: `0 0 8px ${theme.textColor}`,
                        }}
                    >
                        {["Welcome to your futuristic workbench"].map((word, w) => (
                            <motion.span
                                key={w}
                                variants={scanline}
                                initial="hidden"
                                animate="visible"
                                className="inline-block mr-2 last:mr-0"
                            >
                                {word}
                            </motion.span>
                        ))}
                    </h1>

                    <AppCarousel
                        onSelect={(app, wasGrid) => {
                            setStartInGrid(wasGrid);
                            setCurrentApp(app);
                        }}
                        startInGrid={startInGrid}
                        theme={theme}
                    />
                </div>
            )}

            {/* Byte-Indicator / Chat */}
            <ByteIndicator isActive={isActive} onToggleChat={handleOpenChat} />
        </div>
    );
}

export default App;
