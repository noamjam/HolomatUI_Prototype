import React, { useState, useEffect } from "react";
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

function App() {
    const [bootDone, setBootDone] = useState(false);
    const [currentApp, setCurrentApp] = useState(null); // Name der aktuell laufenden App
    const [startInGrid, setStartInGrid] = useState(false);
    const [theme, setTheme] = useState(themes.default);
    const [activeGame, setActiveGame] = useState(null); // einzelnes Spiel innerhalb der Game Collection
    const isActive = useByteStatus();


    useEffect(() => {
        const saved = localStorage.getItem("theme") || "default";
        setTheme(themes[saved] || themes.default);
    }, []);

    // Boot-Screen zuerst anzeigen
    if (!bootDone) {
        return <BootScreen onFinish={() => setBootDone(true)} />;
    }

    // Helper: zurück ins Hauptmenü
    const goHome = () => {
        setActiveGame(null);
        setCurrentApp(null);
    };

    return (
        <div
            className="min-h-screen text-white font-orbitron relative overflow-hidden"
            style={{
                backgroundImage: theme.bgGradient,
                backgroundSize: "cover",
                backgroundAttachment: "fixed",
            }}
        >
            {/* Einzelne Apps */}

            {currentApp === "Paint" && (
                <PaintView onBack={goHome} />
            )}

            {currentApp === "Files" && (
                <FileView onBack={goHome} />
            )}

            {currentApp === "Settings" && (
                <SettingsView onBack={goHome} />
            )}

            {currentApp === "3D Viewer" && (
                <ThreeViewer onBack={goHome} />
            )}

            {currentApp === "MusicLibrary" && (
                <MusicLibrary onBack={goHome} />
            )}

            {currentApp === "OrcaSlicer" && (
                <OrcaSlicer onBack={goHome} />
            )}

            {currentApp === "Solar System" && (
                <SolarSystem onBack={goHome} />
            )}

            {currentApp === "FreeCAD" && (
                <FreeCAD onBack={goHome} />
            )}

            {currentApp === "Weather" && (
                <WeatherApp onBack={goHome} />
            )}

            {/* Neuer VS-Code-ähnlicher Texteditor */}
            {currentApp === "Text Editor" && (
                <VSCodeLayout onBack={goHome} />
            )}

            {/* Bambu Studio */}
            {currentApp === "Bambu Studio" && (
                <BambuStudio onBack={goHome} />
            )}

            {/* ==== Game Collection und Spiele ==== */}

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
                <SpaceInvaders
                    onBack={() => setActiveGame(null)}
                    onHome={goHome}
                />
            )}

            {activeGame === "snake-game" && (
                <SnakeGame
                    onBack={() => setActiveGame(null)}
                    onHome={goHome}
                />
            )}

            {activeGame === "Minesweeper" && (
                <Minesweeper
                    onBack={() => setActiveGame(null)}
                    onHome={goHome}
                />
            )}

            {/* Startansicht, wenn keine App läuft */}
            {currentApp === null && !activeGame && (
                <div className="p-8">
                    <h1
                        className="text-4xl font-bold mb-12 text-center drop-shadow-[0_0_8px_cyan]"
                        style={{ color: theme.textColor }}
                    >
                        Welcome to your futuristic workbench
                    </h1>

                    <AppCarousel
                        onSelect={(app, wasGrid) => {
                            setStartInGrid(wasGrid);
                            setCurrentApp(app);
                        }}
                        startInGrid={startInGrid}
                    />
                </div>
            )}

            {/* Byte-Indikator immer sichtbar */}
            <ByteIndicator isActive={isActive} />
        </div>
    );
}

export default App;
