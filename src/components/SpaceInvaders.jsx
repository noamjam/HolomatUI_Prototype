import React, { useRef, useEffect, useState } from "react";

export default function SpaceInvaders({ onBack }) {
    const canvasRef = useRef(null);
    const [gameOver, setGameOver] = useState(false);

    // Spieler
    const player = useRef({ x: 375, y: 560, w: 50, h: 20 });
    const moveSpeed = 6;

    // Bullets + Gegner
    const bulletsRef = useRef([]);
    const enemiesRef = useRef([]);

    // Gegnerbewegung
    const enemySpeedRef = useRef(1);
    const enemyDirRef = useRef(1);

    // Steuerung
    const keys = useRef({ left: false, right: false, shoot: false });
    const bulletSpeed = 8;
    const bulletW = 4;
    const bulletH = 10;
    const shootCooldown = 200;
    const lastShotRef = useRef(0);

    // === Gegner erstellen ===
    useEffect(() => {
        const enemies = [];
        const cols = 8;
        const rows = 3;
        const spacing = 80;
        const offsetX = 60;
        const offsetY = 60;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                enemies.push({
                    x: offsetX + x * spacing,
                    y: offsetY + y * 50,
                    w: 40,
                    h: 20,
                    alive: true,
                });
            }
        }

        enemiesRef.current = enemies;
    }, []);

    // === Steuerung ===
    useEffect(() => {
        const down = (e) => {
            if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = true;
            if (e.key === "ArrowRight" || e.key === "d") keys.current.right = true;
            if (e.key === " ") keys.current.shoot = true;
        };
        const up = (e) => {
            if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = false;
            if (e.key === "ArrowRight" || e.key === "d") keys.current.right = false;
            if (e.key === " ") keys.current.shoot = false;
        };
        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, []);

    // === Game Loop ===
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const loop = (timestamp) => {
            if (gameOver) return;

            // Hintergrund
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const p = player.current;
            const enemies = enemiesRef.current;
            const bullets = bulletsRef.current;

            // Bewegung
            if (keys.current.left) p.x = Math.max(p.x - moveSpeed, 0);
            if (keys.current.right) p.x = Math.min(p.x + moveSpeed, 800 - p.w);

            // Schießen
            if (keys.current.shoot && timestamp - lastShotRef.current > shootCooldown) {
                bullets.push({
                    x: p.x + p.w / 2 - bulletW / 2,
                    y: p.y - bulletH,
                    w: bulletW,
                    h: bulletH,
                });
                lastShotRef.current = timestamp;
            }

            // Bullets bewegen + filtern
            bulletsRef.current = bullets
                .map((b) => ({ ...b, y: b.y - bulletSpeed }))
                .filter((b) => b.y + b.h > 0);

            // Gegner bewegen
            let shiftDown = false;
            for (let e of enemies) {
                if (!e.alive) continue;
                e.x += enemyDirRef.current * enemySpeedRef.current;
                if (e.x < 10 || e.x + e.w > 790) shiftDown = true;
            }

            if (shiftDown) {
                enemyDirRef.current *= -1;
                for (let e of enemies) {
                    e.y += 20;
                }
            }

            // === Bullet ↔ Gegner Kollision ===
            for (let b of bulletsRef.current) {
                for (let e of enemies) {
                    if (!e.alive) continue;
                    if (
                        b.x < e.x + e.w &&
                        b.x + b.w > e.x &&
                        b.y < e.y + e.h &&
                        b.y + b.h > e.y
                    ) {
                        e.alive = false;
                        b.hit = true;
                    }
                }
            }

            // Getroffene Bullets entfernen
            bulletsRef.current = bulletsRef.current.filter((b) => !b.hit);

            // === Gegner ↔ Spieler Kollision (Game Over) ===
            for (let e of enemies) {
                if (!e.alive) continue;
                if (
                    e.x < p.x + p.w &&
                    e.x + e.w > p.x &&
                    e.y < p.y + p.h &&
                    e.y + e.h > p.y
                ) {
                    setGameOver(true);
                }
            }

            // === Zeichnen ===
            // Spieler
            ctx.fillStyle = "cyan";
            ctx.fillRect(p.x, p.y, p.w, p.h);

            // Bullets
            ctx.fillStyle = "red";
            bulletsRef.current.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));

            // Gegner
            ctx.fillStyle = "lime";
            enemies.forEach((e) => {
                if (e.alive) ctx.fillRect(e.x, e.y, e.w, e.h);
            });

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }, [gameOver]);

    // === Game Over Overlay ===
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
                Steuerung: A / D oder Pfeiltasten · Schuss: Leertaste
            </p>

            {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                    <h2 className="text-4xl text-red-500 font-bold drop-shadow-[0_0_10px_red] mb-4">
                        GAME OVER
                    </h2>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 px-4 py-2 rounded hover:bg-red-400 transition"
                    >
                        Restart
                    </button>
                </div>
            )}
        </div>
    );
}
