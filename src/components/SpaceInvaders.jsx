import React, { useRef, useEffect, useState } from "react";

const styleButton = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    borderRadius: 16,
    backgroundColor: "rgba(2,6,23,0.6)",
    padding: "0.5rem 1.25rem",
    fontSize: "0.75rem",
    fontWeight: 500,
    border: "1px solid rgba(71,85,105,0.7)",
    boxShadow:
        "0 18px 40px rgba(15,23,42,0.95), inset 0 1px 0 rgba(248,250,252,0.14)",
    color: "#e5e7eb",
    cursor: "pointer",
    transform: "translateY(0)",
    transition:
        "transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease, color 150ms ease, border-color 150ms ease",
};

export default function SpaceInvaders({ onBack, onHome }) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [isLightMode, setIsLightMode] = useState(false);

    const themeRef = useRef(false);
    const scoreRef = useRef(0);
    const levelRef = useRef(1);
    const player = useRef({ x: 375, y: 560, w: 50, h: 20 });
    const bullets = useRef([]);
    const enemies = useRef([]);
    const enemyDir = useRef(1);
    const enemySpeed = useRef(1);
    const lastShot = useRef(0);
    const keys = useRef({ left: false, right: false, shoot: false });
    const touchInput = useRef({ move: 0, shooting: false });

    const bulletSpeed = 8;
    const shootCooldown = 300;

    useEffect(() => {
        themeRef.current = isLightMode;
    }, [isLightMode]);

    const theme = isLightMode
        ? {
            appBg: "#ffffff",
            canvasBg: "#ffffff",
            overlayBg: "rgba(255,255,255,0.92)",
            text: "#0f172a",
            mutedText: "#334155",
            accent: "#0891b2",
            accentGlow: "none",
            border: "#0891b2",
            player: "#06b6d4",
            bullet: "#dc2626",
            enemy: "#16a34a",
            buttonText: "#0f172a",
            buttonBg: "rgba(255,255,255,0.75)",
            buttonBorder: "rgba(15,23,42,0.25)",
        }
        : {
            appBg: "#000000",
            canvasBg: "#000000",
            overlayBg: "rgba(0,0,0,0.9)",
            text: "#ffffff",
            mutedText: "#9ca3af",
            accent: "#22d3ee",
            accentGlow: "0 0 6px #22d3ee",
            border: "#22d3ee",
            player: "#22d3ee",
            bullet: "#ef4444",
            enemy: "#00ff00",
            buttonText: "#e5e7eb",
            buttonBg: "rgba(2,6,23,0.6)",
            buttonBorder: "rgba(71,85,105,0.7)",
        };

    const toggleBackground = () => {
        setIsLightMode((prev) => !prev);
    };

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
        setIsGameOver(false);
        touchInput.current = { move: 0, shooting: false };
        lastShot.current = 0;
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = true;
            if (e.key === "ArrowRight" || e.key === "d") keys.current.right = true;
            if (e.key === " ") {
                e.preventDefault();
                keys.current.shoot = true;
            }
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

    const gameLoop = (timestamp) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const activeTheme = themeRef.current
            ? {
                canvasBg: "#ffffff",
                text: "#0f172a",
                player: "#06b6d4",
                bullet: "#dc2626",
                enemy: "#16a34a",
            }
            : {
                canvasBg: "#000000",
                text: "#ffffff",
                player: "#22d3ee",
                bullet: "#ef4444",
                enemy: "#00ff00",
            };

        ctx.fillStyle = activeTheme.canvasBg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const p = player.current;

        const moveDir =
            (keys.current.right ? 1 : 0) -
            (keys.current.left ? 1 : 0) +
            touchInput.current.move;

        if (moveDir < 0) {
            p.x = Math.max(0, p.x - 6);
        } else if (moveDir > 0) {
            p.x = Math.min(800 - p.w, p.x + 6);
        }

        const isShooting = keys.current.shoot || touchInput.current.shooting;
        if (isShooting && timestamp - lastShot.current > shootCooldown) {
            bullets.current.push({
                x: p.x + p.w / 2 - 2,
                y: p.y - 10,
                w: 4,
                h: 10,
            });
            lastShot.current = timestamp;
        }

        bullets.current = bullets.current
            .map((b) => ({ ...b, y: b.y - bulletSpeed }))
            .filter((b) => b.y > 0);

        let shiftDown = false;
        for (const e of enemies.current) {
            if (!e.alive) continue;
            e.x += enemyDir.current * enemySpeed.current;
            if (e.x < 10 || e.x + e.w > 790) shiftDown = true;
        }

        if (shiftDown) {
            enemyDir.current *= -1;
            for (const e of enemies.current) e.y += 20;
        }

        for (const b of bullets.current) {
            for (const e of enemies.current) {
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

        for (const e of enemies.current) {
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

        if (enemies.current.every((e) => !e.alive)) {
            levelRef.current += 1;
            enemySpeed.current += 1;
            setLevel(levelRef.current);
            spawnEnemies();
        }

        ctx.fillStyle = activeTheme.player;
        ctx.fillRect(p.x, p.y, p.w, p.h);

        ctx.fillStyle = activeTheme.bullet;
        for (const b of bullets.current) {
            ctx.fillRect(b.x, b.y, b.w, b.h);
        }

        ctx.fillStyle = activeTheme.enemy;
        for (const e of enemies.current) {
            if (e.alive) ctx.fillRect(e.x, e.y, e.w, e.h);
        }

        ctx.fillStyle = activeTheme.text;
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
        requestAnimationFrame(() => startGame());
    };

    useEffect(() => {
        resetGame();
        startGame();
        return () => cancelAnimationFrame(animationRef.current);
    }, []);

    const layoutStyles = {
        root: {
            position: "fixed",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.appBg,
            color: theme.text,
            fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            zIndex: 50,
            transition: "background-color 180ms ease, color 180ms ease",
        },
        backButton: {
            ...styleButton,
            position: "absolute",
            top: 16,
            left: 16,
            backgroundColor: theme.buttonBg,
            border: `1px solid ${theme.buttonBorder}`,
            color: theme.buttonText,
        },
        toggleButton: {
            ...styleButton,
            position: "absolute",
            top: 16,
            right: 16,
            minWidth: 56,
            backgroundColor: theme.buttonBg,
            border: `1px solid ${theme.buttonBorder}`,
            color: theme.buttonText,
        },
        title: {
            fontSize: "28px",
            fontWeight: "bold",
            color: theme.accent,
            marginBottom: 16,
            textShadow: theme.accentGlow,
        },
        canvas: {
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            backgroundColor: theme.canvasBg,
            touchAction: "none",
            transition: "background-color 180ms ease, border-color 180ms ease",
        },
        infoText: {
            marginTop: 24,
            color: theme.mutedText,
            fontSize: "13px",
        },
        touchBarWrapper: {
            marginTop: 32,
            width: 800,
            display: "flex",
            justifyContent: "center",
            userSelect: "none",
        },
        touchBarInner: {
            display: "flex",
            gap: 24,
            width: "100%",
            maxWidth: 820,
        },
        touchButton: {
            ...styleButton,
            flex: 1,
            justifyContent: "center",
            backgroundColor: theme.buttonBg,
            border: `1px solid ${theme.buttonBorder}`,
            color: theme.buttonText,
        },
        touchButtonShoot: {
            ...styleButton,
            flex: 1,
            justifyContent: "center",
            backgroundColor: "#b91c1c",
            border: "1px solid #b91c1c",
            color: "#ffffff",
        },
        overlay: {
            position: "absolute",
            inset: 0,
            backgroundColor: theme.overlayBg,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: theme.text,
            transition: "background-color 180ms ease, color 180ms ease",
        },
        overlayTitle: {
            fontSize: "36px",
            fontWeight: "bold",
            marginBottom: 24,
        },
        overlayScore: {
            fontSize: "18px",
            marginBottom: 16,
        },
        overlayButton: {
            ...styleButton,
            marginBottom: 8,
            backgroundColor: theme.buttonBg,
            border: `1px solid ${theme.buttonBorder}`,
            color: theme.buttonText,
        },
        overlayButtonGray: {
            ...styleButton,
            marginBottom: 8,
            backgroundColor: "#4b5563",
            border: "1px solid #4b5563",
            color: "#ffffff",
        },
        overlayButtonRed: {
            ...styleButton,
            backgroundColor: "#b91c1c",
            border: "1px solid #b91c1c",
            color: "#ffffff",
        },
    };

    return (
        <div style={layoutStyles.root}>
            <button onClick={onBack} style={layoutStyles.backButton}>
                ⬅ Back
            </button>

            <button onClick={toggleBackground} style={layoutStyles.toggleButton}>
                {isLightMode ? "🌙" : "☀️"}
            </button>

            <h1 style={layoutStyles.title}>Byte Invaders</h1>

            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={layoutStyles.canvas}
            />

            <p style={layoutStyles.infoText}>
                Steuerung: A / D oder Pfeiltasten · Schuss: Leertaste ·
                Auf Touch-Geräten: Leiste unten verwenden
            </p>

            <div style={layoutStyles.touchBarWrapper}>
                <div style={layoutStyles.touchBarInner}>
                    <button
                        style={layoutStyles.touchButton}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            touchInput.current.move = -1;
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            touchInput.current.move = 0;
                        }}
                    >
                        ◀ Links
                    </button>

                    <button
                        style={layoutStyles.touchButton}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            touchInput.current.move = 1;
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            touchInput.current.move = 0;
                        }}
                    >
                        Rechts ▶
                    </button>

                    <button
                        style={layoutStyles.touchButtonShoot}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            touchInput.current.shooting = true;
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            touchInput.current.shooting = false;
                        }}
                    >
                        🔫 Schuss
                    </button>
                </div>
            </div>

            {isGameOver && (
                <div style={layoutStyles.overlay}>
                    <h1 style={layoutStyles.overlayTitle}>GAME OVER</h1>
                    <p style={layoutStyles.overlayScore}>
                        Score: {scoreRef.current}
                    </p>

                    <button onClick={handleRestart} style={layoutStyles.overlayButton}>
                        Restart
                    </button>

                    <button onClick={onBack} style={layoutStyles.overlayButtonGray}>
                        Game Collection
                    </button>

                    <button onClick={onHome} style={layoutStyles.overlayButtonRed}>
                        Home Menu
                    </button>
                </div>
            )}
        </div>
    );
}