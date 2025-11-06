import React, { useRef, useEffect, useState } from "react";

export default function SpaceInvaders({ onBack }) {
    const canvasRef = useRef(null);
    const [playerX, setPlayerX] = useState(375); // Startposition
    const [playerY] = useState(560); // Fixe Y-Position unten
    const playerWidth = 50;
    const playerHeight = 20;
    const moveStep = 15; // Schrittweite bei jedem Tastendruck

    // Zeichnet das Spiel
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const draw = () => {
            // Hintergrund
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Spieler zeichnen
            ctx.fillStyle = "cyan";
            ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
        };

        draw();
    }, [playerX, playerY]);

    // Tastatursteuerung (step-by-step)
    useEffect(() => {
        const handleKeyDown = (e) => {
            setPlayerX((prevX) => {
                if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
                    return Math.max(prevX - moveStep, 0);
                }
                if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
                    return Math.min(prevX + moveStep, 800 - playerWidth);
                }
                return prevX;
            });
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white z-50">
            <button
                onClick={onBack}
                className="absolute top-4 left-4 bg-cyan-700 px-3 py-2 rounded hover:bg-cyan-500 transition"
            >
                ⬅ Back
            </button>

            <h1 className="text-3xl font-bold text-cyan-400 mb-4 drop-shadow-[0_0_6px_cyan]">
                Byte Invaders
            </h1>

            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border border-cyan-400 rounded bg-black"
            />

            <p className="mt-4 text-gray-400 text-sm">
                Steuerung: Pfeiltasten oder A / D
            </p>
        </div>
    );
}
