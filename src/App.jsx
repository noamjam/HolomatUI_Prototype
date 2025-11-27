import React, { useState, useEffect} from 'react';
import { themes } from './themes';
import PaintView from './components/PaintView';
import FileView from './components/FileView';
import SettingsView from './components/SettingsView';
import AppCarousel from './components/AppCarousel';
import ByteIndicator from './components/ByteIndicator';
import useByteStatus from './components/useByteStatus';
import ThreeViewer from './components/ThreeViewer';
import BootScreen from './components/BootScreen';
import MusicLibrary from './components/Musiclibrary';
import OrcaSlicer from "./components/OrcaSlicer";
import GameCollection from "./components/GameCollection";
import SolarSystem from "./components/SolarSystem";
import SpaceInvaders from "./components/SpaceInvaders.jsx";
import SnakeGame from "./components/SnakeGame.jsx";
import FreeCAD from "./components/FreeCAD";
import Minesweeper from "./components/Minesweeper";
import WeatherApp from "./components/Weather.jsx";
import TextEditor from "./components/TextEditor";

function App() {
    const [bootDone, setBootDone] = useState(false);
    const [currentApp, setCurrentApp] = useState(null);
    const [startInGrid, setStartInGrid] = useState(false);
    const isActive = useByteStatus();
    const [theme, setTheme] = useState(themes.default);
    const [activeGame, setActiveGame] = useState(null);



    useEffect(() => {
        const saved = localStorage.getItem('theme') || 'default';
        setTheme(themes[saved] || themes.default);
    }, []);

    if (!bootDone) {
        return <BootScreen onFinish={() => setBootDone(true)} />;
    }

    return (
        <div
            className="min-h-screen text-white font-orbitron relative overflow-hidden"
            style={{
                backgroundImage: theme.bgGradient, // CSS Gradient aus themes.js
                backgroundSize: "cover",
                backgroundAttachment: "fixed"
            }}
        >
            {/* Anwendungen */}
            {currentApp === 'Paint' && <PaintView onBack={() => setCurrentApp(null)} />}
            {currentApp === 'Files' && <FileView onBack={() => setCurrentApp(null)} />}
            {currentApp === 'Settings' && <SettingsView onBack={() => setCurrentApp(null)} />}
            {currentApp === '3D Viewer' && <ThreeViewer onBack={() => setCurrentApp(null)} />}
            {currentApp === 'MusicLibrary' && <MusicLibrary onBack={() => setCurrentApp(null)} />}
            {currentApp === 'OrcaSlicer' && <OrcaSlicer onBack={() => setCurrentApp(null)} />}
            {currentApp === 'Solar System' && <SolarSystem onBack={() => setCurrentApp(null)} />}
            {currentApp === 'FreeCAD' && <FreeCAD onBack={() => setCurrentApp(null)} />}
            {currentApp === 'Weather' && <WeatherApp onBack={() => setCurrentApp(null)} />}
            {currentApp === 'Text Editor' && <TextEditor onBack={() => setCurrentApp(null)} />}

            {/* === Game Collection === */}
            {currentApp === "Game Collection" && !activeGame && (
                <GameCollection
                    onBack={() => setCurrentApp(null)} // Zurück ins Hauptmenü
                    onStartGame={(gameId) => {
                        // Spiele auswählen
                        if (gameId === "byte-invaders") setActiveGame("byte-invaders");
                        if (gameId === "snake-game") setActiveGame("snake-game");
                        if (gameId === "Minesweeper") setActiveGame("Minesweeper");
                    }}
                />
            )}

            {/* === Space Invaders === */}
            {activeGame === "byte-invaders" && (
                <SpaceInvaders
                    onBack={() => setActiveGame(null)} // Zurück zur Game Collection
                    onHome={() => {
                        setActiveGame(null);
                        setCurrentApp(null); // ins Hauptmenü
                    }}
                />
            )}

            {/* === Snake === */}
            {activeGame === "snake-game" && (
                <SnakeGame
                    onBack={() => setActiveGame(null)} // Zurück zur Game Collection
                    onHome={() => {
                        setActiveGame(null);
                        setCurrentApp(null); // ins Hauptmenü
                    }}
                />
            )}

            {/* === Minesweeper === */}
            {activeGame === "Minesweeper" && (
                <Minesweeper
                    onBack={() => setActiveGame(null)} // Zurück zur Game Collection
                    onHome={() => {
                        setActiveGame(null);
                        setCurrentApp(null); // ins Hauptmenü
                    }}
                />
            )}

            {/* Startansicht */}
            {currentApp === null && (
                <div className="p-8">
                    <h1
                        className="text-4xl font-bold mb-12 text-center drop-shadow-[0_0_8px_cyan]"
                        style={{ color: theme.textColor }} // Textfarbe aus themes.js
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

            {/* Byte-Indikator bleibt immer sichtbar */}
            <ByteIndicator isActive={isActive} />
        </div>
    );
}

export default App;