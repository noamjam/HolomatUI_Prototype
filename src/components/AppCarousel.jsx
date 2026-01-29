import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {themes} from "../themes";

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
    "Bambu Studio",
    "Calender App",
    "Image Editor",
    "BrowserApp",
];

const wrapperStyle = {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "480px",
    overflow: "hidden",
    width: "100%",
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
    zIndex: 0,
};

const bubbleBaseStyle = (theme) => ({
    width: "8rem",
    height: "8rem",
    borderRadius: "9999px",
    backgroundColor: theme
        ? `${theme.textColor}33` // 33 = ~20% Alpha in Hex
        : "rgba(8,145,178,0.3)",
    color: "#ffffff",
    fontSize: "1.25rem",
    fontWeight: 600,
    border: theme ? `1px solid ${theme.textColor}` : "1px solid #22d3ee",
    backdropFilter: "blur(10px)",
    transition: "box-shadow 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    boxShadow: theme
        ? `0 0 20px ${theme.textColor}`
        : "0 0 20px rgba(0,255,255,0.6)",
});

export default function AppCarousel({ onSelect, startInGrid = false, theme }) {
    const [current, setCurrent] = useState(0);
    const [isGrid, setIsGrid] = useState(startInGrid);

    useEffect(() => {
        setIsGrid(startInGrid);
    }, [startInGrid]);

    const rotateLeft = () =>
        setCurrent((prev) => (prev - 1 + apps.length) % apps.length);
    const rotateRight = () =>
        setCurrent((prev) => (prev + 1) % apps.length);

    // Nur horizontal: App wechseln
    const handlePanEndCarousel = (event, info) => {
        const offsetX = info.offset.x;
        const velocityX = info.velocity.x;

        if (Math.abs(offsetX) > 30 || Math.abs(velocityX) > 300) {
            if (offsetX < 0 || velocityX < -300) rotateRight();
            else if (offsetX > 0 || velocityX > 300) rotateLeft();
        }
    };

    // Optional: vertikaler Swipe NUR im Grid → zurück ins Karussell
    const handlePanEndGrid = (event, info) => {
        const offsetY = info.offset.y;
        const velocityY = info.velocity.y;

        if (offsetY > 80 || velocityY > 400) {
            // Swipe nach unten → zurück zum Carousel
            setIsGrid(false);
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
            {/* Toggle-Leiste unten */}
            <div
                style={{
                    position: "fixed",
                    bottom: "0.5rem",
                    left: "50%",
                    transform: "translate(-50%, 4px)",
                    display: "flex",
                    gap: "0.5rem",
                    zIndex: 999,
                }}
            >
                <button
                    onClick={() => setIsGrid(false)}
                    style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "999px",
                        border: "1px solid #22d3ee",
                        background: !isGrid ? "#0f172a" : "transparent",
                        color: "#e5e7eb",
                    }}
                >
                    Carousel
                </button>
                <button
                    onClick={() => setIsGrid(true)}
                    style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "999px",
                        border: "1px solid #22d3ee",
                        background: isGrid ? "#0f172a" : "transparent",
                        color: "#e5e7eb",
                    }}
                >
                    Grid
                </button>
            </div>


            {/* Gestenfläche + Inhalt */}
            <motion.div
                // WICHTIG: touchAction none, damit du volle Kontrolle über Gesten hast
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    touchAction: "none",
                    background: "transparent",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {isGrid ? (
                    // Grid: optionaler Swipe nach unten zum Schließen
                    <motion.div
                        onPanEnd={handlePanEndGrid}
                        style={{ width: "100%", height: "100%" }}
                    >
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
                                                    style={bubbleBaseStyle(theme)}
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
                    </motion.div>
                ) : (
                    // Carousel: nur horizontaler Swipe für App-Wechsel
                    <motion.div
                        onPanEnd={handlePanEndCarousel}
                        style={{ width: "100%", height: "100%" }}
                    >
                        <div style={carouselContainerStyle}>
                            {apps.map((app, i) => {
                                const rel = getRelativeIndex(i);
                                if (rel === null) return null;

                                const translateX = rel * 80;
                                const rotateY = rel * -1;
                                const scale = rel === 0 ? 1.1 : 0.95;
                                const zIndex = rel === 0 ? 10 : 5;

                                return (
                                    <motion.div
                                        key={app}
                                        animate={{ x: translateX, scale, rotateY }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 80,
                                            damping: 30,
                                        }}
                                        style={{
                                            position: "absolute",
                                            pointerEvents: "auto",
                                            zIndex,
                                        }}
                                    >
                                        <motion.button
                                            onClick={() => onSelect(app, false)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={bubbleBaseStyle(theme)}
                                        >
                                            {app}
                                        </motion.button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
