import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const apps = ["Paint", "Files", "Settings", "3D Viewer", "MusicLibrary", "OrcaSlicer",
    "Game Collection", "Solar System", "FreeCAD"];


export default function AppCarousel({ onSelect, startInGrid = false }) {
    const [current, setCurrent] = useState(0);
    const [isGrid, setIsGrid] = useState(startInGrid);

    useEffect(() => {
        setIsGrid(startInGrid);
    }, [startInGrid]);

    const rotateLeft = () =>
        setCurrent((prev) => (prev - 1 + apps.length) % apps.length);
    const rotateRight = () =>
        setCurrent((prev) => (prev + 1) % apps.length);

    const handleDragEnd = (event, info) => {
        const offsetX = info.offset.x;
        const velocityX = info.velocity.x;
        const offsetY = info.offset.y;
        const velocityY = info.velocity.y;

        // Horizontal wischen → App wechseln
        if (Math.abs(offsetX) > Math.abs(offsetY)) {
            if (offsetX < -30 || velocityX < -300) rotateRight();
            else if (offsetX > 30 || velocityX > 300) rotateLeft();
        }
        // Vertikal wischen → Grid öffnen/schließen
        else {
            if (offsetY < -50 || velocityY < -300) {
                console.log("Swipe nach oben → Grid öffnen");
                setIsGrid(true);
            } else if (offsetY > 50 || velocityY > 300) {
                console.log("Swipe nach unten → zurück zum Carousel");
                setIsGrid(false);
            }
        }
    };

    const getRelativeIndex = (i) => {
        const len = apps.length;
        const diff = (i - current + len) % len;
        if (diff === 0) return 0;
        if (diff === 1 || diff === -len + 1) return 1;
        if (diff === len - 1 || diff === -1) return -1;
        return null;
    };

    return (
        <div className="relative flex justify-center items-center h-[320px] overflow-hidden">
            {/* 🔹 Eine kombinierte Drag-Fläche (X & Y gleichzeitig) */}
            <motion.div
                className="absolute inset-0 z-0"
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                onDragEnd={handleDragEnd}
                style={{
                    width: "100%",
                    height: "100%",
                    touchAction: "none",
                    background: "transparent",
                }}
            />

            {isGrid ? (
                <div className="flex flex-col items-center overflow-y-auto max-h-[300px] py-4 z-0">
                    {/* Teile Apps in Gruppen von 5 pro Zeile */}
                    {(() => {
                        const rows = [];
                        const appsPerRow = 5;

                        for (let i = 0; i < apps.length; i += appsPerRow) {
                            const rowApps = apps.slice(i, i + appsPerRow);
                            rows.push(
                                <div key={i} className="flex justify-center gap-4 mb-4">
                                    {rowApps.map((app) => (
                                        <motion.button
                                            key={app}
                                            onClick={() => onSelect(app, true)}
                                            whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(0,255,255,0.8)" }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                boxShadow: "0 0 20px rgba(0,255,255,0.6)"
                                            }}
                                            className="w-32 h-32 rounded-full bg-cyan-700/30 text-white text-xl font-semibold border border-cyan-500 backdrop-blur-md transition-shadow duration-300"
                                        >
                                            {app}
                                        </motion.button>
                                    ))}
                                </div>
                            );
                        }
                        return rows;
                    })()}
                </div>
            ) : (
                <div className="relative flex justify-center items-center w-full h-full pointer-events-none z-0">
                    {apps.map((app, i) => {
                        const rel = getRelativeIndex(i);
                        if (rel === null) return null;
                        const translateX = rel * 120;
                        const rotateY = rel * -6;
                        const scale = rel === 0 ? 1.25 : 1.0;
                        const zIndex = rel === 0 ? 10 : 5;
                        const opacity = rel === 0 ? 1 : 0.75;

                        return (
                            <motion.div
                                key={app}
                                animate={{ x: translateX, scale, opacity, rotateY }}
                                transition={{ type: "spring", stiffness: 120, damping: 15 }}
                                className="absolute pointer-events-auto"
                                style={{ zIndex }}
                            >
                                <motion.button
                                    onClick={() => onSelect(app, false)}
                                    whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(0,255,255,0.8)" }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        boxShadow: "0 0 20px rgba(0,255,255,0.6)"
                                    }}
                                    className="w-32 h-32 rounded-full bg-cyan-700/30 text-white text-xl font-semibold border border-cyan-500 backdrop-blur-md transition-shadow duration-300"
                                >
                                    {app}
                                </motion.button>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}