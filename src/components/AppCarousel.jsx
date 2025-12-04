import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const apps = [
    "Paint",
    "Files",
    "Settings",
    "3D Viewer",
    "MusicLibrary",
    "OrcaSlicer",
    "Game Collection",
    "Solar System",
    "FreeCAD",
    "Weather",
    "Text Editor",
];

// Basis-Styles als JS-Objekte
const wrapperStyle = {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "480px",
    overflow: "hidden",
    width: "100%",
};

const dragSurfaceStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    touchAction: "none",
    background: "transparent",
    zIndex: 10, // oberste Ebene, bekommt alle Swipes
};

const gridContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxHeight: "480px",
    paddingTop: "1.5rem",
    paddingBottom: "1.5rem",
    overflowY: "hidden",
    width: "100%",
    pointerEvents: "none", // Container blockiert keine Drags
};

const gridRowStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginBottom: "1rem",
    width: "100%",
};

const carouselContainerStyle = {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    pointerEvents: "none", // wie vorher
    zIndex: 0,
};

const bubbleBaseStyle = {
    width: "8rem",
    height: "8rem",
    borderRadius: "9999px",
    backgroundColor: "rgba(8,145,178,0.3)",
    color: "#ffffff",
    fontSize: "1.25rem",
    fontWeight: 600,
    border: "1px solid #22d3ee",
    backdropFilter: "blur(10px)",
    transition: "box-shadow 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    boxShadow: "0 0 20px rgba(0,255,255,0.6)",
};

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
        } else {
            // Vertikal wischen → Grid öffnen/schließen
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
        <div style={wrapperStyle}>
            {/* kombinierte Drag-Fläche (X & Y gleichzeitig) */}
            <motion.div
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                onDragEnd={handleDragEnd}
                style={dragSurfaceStyle}
            />

            {isGrid ? (
                <div style={gridContainerStyle}>
                    {(() => {
                        const rows = [];
                        const appsPerRow = 5;

                        for (let i = 0; i < apps.length; i += appsPerRow) {
                            const rowApps = apps.slice(i, i + appsPerRow);
                            rows.push(
                                <div key={i} style={gridRowStyle}>
                                    {rowApps.map((app) => (
                                        <motion.button
                                            key={app}
                                            onClick={() => onSelect(app, true)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{ ...bubbleBaseStyle, pointerEvents: "auto" }} // Buttons klickbar
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
                <div style={carouselContainerStyle}>
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
                                style={{ position: "absolute", pointerEvents: "auto", zIndex }}
                            >
                                <motion.button
                                    onClick={() => onSelect(app, false)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ ...bubbleBaseStyle, pointerEvents: "auto" }}
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
