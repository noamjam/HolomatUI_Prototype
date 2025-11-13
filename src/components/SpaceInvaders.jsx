import React, { useRef, useEffect, useState } from "react";

export default function SpaceInvaders({ onBack, onHome }) {
    const canvasRef = useRef(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);

    // Refs (für stabile Werte im Loop)
    const scoreRef = useRef(0);
    const levelRef = useRef(1);
    const player = useRef({ x: 375, y: 560, w: 50, h: 20 });
    const bullets = useRef([]);
    const enemies = useRef([]);
    const enemyDir = useRef(1);
    const enemySpeed = useRef(1);
    const lastShot = useRef(0);
    const animationRef = useRef(null);
    const keys = useRef({ left: false, right: false, shoot: false });

    const bulletSpeed = 8;
    const shootCooldown = 300;

    // === Gegner erstellen ===
    const spawnEnemies = () => {
        const newEnemies = [];
        const rows = 4;
        const cols = 8;
        const spacingX = 70;
        const spacingY = 50;
        const offsetX = 80;
        const offsetY = 60;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                newEnemies.push({
                    x: offsetX + x * spacingX,
                    y: offsetY + y * spacingY,
                    w: 40,
                    h: 20,
                    alive: true,
                });
            }
        }
        enemies.current = newEnemies;
    };

    // === Spiel resetten ===
    const resetGame = () => {
        player.current = { x: 375, y: 560, w: 50, h: 20 };
        bullets.current = [];
        enemyDir.current = 1;
        enemySpeed.current = 1;
        spawnEnemies();
        scoreRef.current = 0;
        levelRef.current = 1;
        setScore(0);
        setLevel(1);
    };

    // === Steuerung ===
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = true;
            if (e.key === "ArrowRight" || e.key === "d") keys.current.right = true;
            if (e.key === " ") keys.current.shoot = true;
        };
        const handleKeyUp = (e) => {
            if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = false;
            if (e.key === "ArrowRight" || e.key === "d") keys.current.right = false;
            if (e.key === " ") keys.current.shoot = false;
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    // === Hauptloop ===
    const gameLoop = (timestamp) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        // Hintergrund
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const p = player.current;
        if (keys.current.left) p.x = Math.max(0, p.x - 6);
        if (keys.current.right) p.x = Math.min(800 - p.w, p.x + 6);

        // Schießen
        if (keys.current.shoot && timestamp - lastShot.current > shootCooldown) {
            bullets.current.push({
                x: p.x + p.w / 2 - 2,
                y: p.y - 10,
                w: 4,
                h: 10,
            });
            lastShot.current = timestamp;
        }

        // Bullets bewegen
        bullets.current = bullets.current
            .map((b) => ({ ...b, y: b.y - bulletSpeed }))
            .filter((b) => b.y > 0);

        // Gegner bewegen
        let shiftDown = false;
        for (let e of enemies.current) {
            if (!e.alive) continue;
            e.x += enemyDir.current * enemySpeed.current;
            if (e.x < 10 || e.x + e.w > 790) shiftDown = true;
        }
        if (shiftDown) {
            enemyDir.current *= -1;
            for (let e of enemies.current) e.y += 20;
        }

        // Bullet-Kollisionen
        for (let b of bullets.current) {
            for (let e of enemies.current) {
                if (!e.alive) continue;
                if (
                    b.x < e.x + e.w &&
                    b.x + b.w > e.x &&
                    b.y < e.y + e.h &&
                    b.y + b.h > e.y
                ) {
                    e.alive = false;
                    b.hit = true;
                    scoreRef.current += 10;
                    setScore(scoreRef.current);
                }
            }
        }
        bullets.current = bullets.current.filter((b) => !b.hit);

        // Spieler tot?
        for (let e of enemies.current) {
            if (!e.alive) continue;
            if (
                e.x < p.x + p.w &&
                e.x + e.w > p.x &&
                e.y < p.y + p.h &&
                e.y + e.h > p.y
            ) {
                setIsGameOver(true);
                cancelAnimationFrame(animationRef.current);
                return;
            }
        }

        // Alle Gegner tot → neues Level
        if (enemies.current.every((e) => !e.alive)) {
            levelRef.current += 1;
            enemySpeed.current += 1;
            setLevel(levelRef.current);
            spawnEnemies();
        }

        // Zeichnen
        ctx.fillStyle = "cyan";
        ctx.fillRect(p.x, p.y, p.w, p.h);

        ctx.fillStyle = "red";
        for (let b of bullets.current) ctx.fillRect(b.x, b.y, b.w, b.h);

        ctx.fillStyle = "lime";
        for (let e of enemies.current) if (e.alive) ctx.fillRect(e.x, e.y, e.w, e.h);

        ctx.fillStyle = "white";
        ctx.font = "16px Orbitron, monospace";
        ctx.fillText(`Score: ${scoreRef.current}`, 680, 30);
        ctx.fillText(`Level: ${levelRef.current}`, 680, 50);

        animationRef.current = requestAnimationFrame(gameLoop);
    };

    const startGame = () => {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = requestAnimationFrame(gameLoop);
    };

    const handleRestart = () => {
        resetGame();
        setIsGameOver(false);
        requestAnimationFrame(() => startGame());
    };

    useEffect(() => {
        resetGame();
        startGame();
        return () => cancelAnimationFrame(animationRef.current);
    }, []);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white">
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
                Steuerung: A / D oder Pfeiltasten · Schuss: Leertaste
            </p>

            {isGameOver && (
                <div className="absolute inset-0 bg-black/90 flex flex-col justify-center items-center text-white">
                    <h1 className="text-4xl font-bold mb-6">GAME OVER</h1>
                    <p className="mb-4 text-lg">Score: {scoreRef.current}</p>
                    <button
                        onClick={handleRestart}
                        className="bg-cyan-600 px-4 py-2 rounded mb-3 hover:bg-cyan-500"
                    >
                        Restart
                    </button>
                    <button
                        onClick={onBack}
                        className="bg-gray-600 px-4 py-2 rounded mb-3 hover:bg-gray-500"
                    >
                        Game Collection
                    </button>
                    <button
                        onClick={onHome}
                        className="bg-red-600 px-4 py-2 rounded hover:bg-red-500"
                    >
                        Home Menu
                    </button>
                </div>
            )}
        </div>
    );
}
