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

export default function SnakeGame({ onBack, onHome }) {
    const canvasRef = useRef(null);

    const [gameOver, setGameOver] = useState(false);
    const [scoreUI, setScoreUI] = useState(0);
    const [isLightMode, setIsLightMode] = useState(false);

    const themeRef = useRef(false);

    const BOX = 20;
    const W = 800;
    const H = 600;
    const COLS = W / BOX;
    const ROWS = H / BOX;

    const snakeRef = useRef([{ x: 10, y: 10 }]);
    const directionRef = useRef({ x: 1, y: 0 });
    const nextDirectionRef = useRef({ x: 1, y: 0 });
    const foodRef = useRef({ x: 15, y: 10 });
    const scoreRef = useRef(0);
    const gameOverRef = useRef(false);

    const baseInterval = 120;
    const minInterval = 40;
    const intervalRef = useRef(baseInterval);
    const lastTimeRef = useRef(0);
    const accumulatorRef = useRef(0);
    const rafRef = useRef(null);

    const touchStartRef = useRef({ x: 0, y: 0 });
    const TOUCH_THRESHOLD = 40;

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
            snake: "#16a34a",
            food: "#dc2626",
            score: "#0f172a",
            buttonText: "#0f172a",
            buttonBg: "rgba(255,255,255,0.75)",
            buttonBorder: "rgba(15,23,42,0.25)",
        }
        : {
            appBg: "#000000",
            canvasBg: "#000000",
            overlayBg: "rgba(0,0,0,0.85)",
            text: "#ffffff",
            mutedText: "#9ca3af",
            accent: "#22d3ee",
            accentGlow: "0 0 6px #22d3ee",
            border: "#22d3ee",
            snake: "#00ff00",
            food: "#ef4444",
            score: "#ffffff",
            buttonText: "#e5e7eb",
            buttonBg: "rgba(2,6,23,0.6)",
            buttonBorder: "rgba(71,85,105,0.7)",
        };

    function toggleBackground() {
        setIsLightMode((prev) => !prev);
    }

    function spawnFood() {
        const snake = snakeRef.current;
        let pos;
        let attempts = 0;

        do {
            pos = {
                x: Math.floor(Math.random() * COLS),
                y: Math.floor(Math.random() * ROWS),
            };
            attempts++;
            if (attempts > 1000) break;
        } while (snake.some((s) => s.x === pos.x && s.y === pos.y));

        foodRef.current = pos;
    }

    function computeInterval() {
        const s = scoreRef.current;
        return Math.max(minInterval, baseInterval - Math.floor(s / 5) * 4);
    }

    useEffect(() => {
        function onKey(e) {
            const k = e.key.toLowerCase();
            let nd = null;

            if (k === "arrowup" || k === "w") nd = { x: 0, y: -1 };
            if (k === "arrowdown" || k === "s") nd = { x: 0, y: 1 };
            if (k === "arrowleft" || k === "a") nd = { x: -1, y: 0 };
            if (k === "arrowright" || k === "d") nd = { x: 1, y: 0 };

            if (!nd) return;

            const cur = directionRef.current;
            if (nd.x === -cur.x && nd.y === -cur.y) return;
            nextDirectionRef.current = nd;
        }

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    function handleSwipeDirection(dx, dy) {
        let nd = null;

        if (Math.abs(dx) > Math.abs(dy)) {
            nd = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
        } else {
            nd = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
        }

        const cur = directionRef.current;
        if (nd && !(nd.x === -cur.x && nd.y === -cur.y)) {
            nextDirectionRef.current = nd;
        }
    }

    function step() {
        const snake = snakeRef.current;
        directionRef.current = nextDirectionRef.current;

        const head = {
            x: snake[0].x + directionRef.current.x,
            y: snake[0].y + directionRef.current.y,
        };

        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
            return true;
        }

        if (snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
            return true;
        }

        snake.unshift(head);

        const f = foodRef.current;
        if (head.x === f.x && head.y === f.y) {
            scoreRef.current += 1;
            setScoreUI(scoreRef.current);
            intervalRef.current = computeInterval();
            spawnFood();
        } else {
            snake.pop();
        }

        return false;
    }

    function draw() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const activeTheme = themeRef.current
            ? {
                canvasBg: "#ffffff",
                snake: "#16a34a",
                food: "#dc2626",
                score: "#0f172a",
            }
            : {
                canvasBg: "#000000",
                snake: "#00ff00",
                food: "#ef4444",
                score: "#ffffff",
            };

        ctx.fillStyle = activeTheme.canvasBg;
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = activeTheme.food;
        ctx.fillRect(
            foodRef.current.x * BOX,
            foodRef.current.y * BOX,
            BOX - 1,
            BOX - 1
        );

        ctx.fillStyle = activeTheme.snake;
        for (const s of snakeRef.current) {
            ctx.fillRect(s.x * BOX, s.y * BOX, BOX - 1, BOX - 1);
        }

        ctx.fillStyle = activeTheme.score;
        ctx.font = "18px Orbitron, monospace";
        ctx.fillText(`Score: ${scoreRef.current}`, W - 150, 24);
    }

    function gameLoop(ts) {
        if (gameOverRef.current) {
            setGameOver(true);
            return;
        }

        if (!lastTimeRef.current) lastTimeRef.current = ts;
        const delta = ts - lastTimeRef.current;
        lastTimeRef.current = ts;

        accumulatorRef.current += delta;
        const moveInterval = intervalRef.current;

        while (accumulatorRef.current >= moveInterval) {
            const died = step();
            accumulatorRef.current -= moveInterval;

            if (died) {
                gameOverRef.current = true;
                setGameOver(true);
                return;
            }
        }

        draw();
        rafRef.current = requestAnimationFrame(gameLoop);
    }

    function startGame() {
        cancelAnimationFrame(rafRef.current);
        lastTimeRef.current = 0;
        accumulatorRef.current = 0;
        gameOverRef.current = false;
        setGameOver(false);
        intervalRef.current = computeInterval();
        rafRef.current = requestAnimationFrame(gameLoop);
    }

    function resetGame() {
        snakeRef.current = [
            { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) },
        ];
        directionRef.current = { x: 1, y: 0 };
        nextDirectionRef.current = { x: 1, y: 0 };
        scoreRef.current = 0;
        setScoreUI(0);
        intervalRef.current = baseInterval;
        spawnFood();
        gameOverRef.current = false;
        setGameOver(false);
        startGame();
    }

    useEffect(() => {
        snakeRef.current = [
            { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) },
        ];
        directionRef.current = { x: 1, y: 0 };
        nextDirectionRef.current = { x: 1, y: 0 };
        scoreRef.current = 0;
        setScoreUI(0);
        intervalRef.current = baseInterval;
        spawnFood();
        startGame();

        return () => {
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    useEffect(() => {
        if (gameOver) {
            gameOverRef.current = true;
            cancelAnimationFrame(rafRef.current);
        }
    }, [gameOver]);

    const styles = {
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
            marginBottom: 16,
        },
        overlayScore: {
            fontSize: "18px",
            marginBottom: 16,
        },
        overlayButtons: {
            display: "flex",
            gap: 12,
        },
        overlayButton: {
            ...styleButton,
            backgroundColor: theme.buttonBg,
            border: `1px solid ${theme.buttonBorder}`,
            color: theme.buttonText,
        },
        overlayButtonGray: {
            ...styleButton,
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
        <div style={styles.root}>
            <button onClick={onBack} style={styles.backButton}>
                ⬅ Back
            </button>

            <button onClick={toggleBackground} style={styles.toggleButton}>
                {isLightMode ? "🌙" : "☀️"}
            </button>

            <h1 style={styles.title}>Byte Snake</h1>

            <canvas
                ref={canvasRef}
                width={W}
                height={H}
                style={styles.canvas}
                onTouchStart={(e) => {
                    const t = e.touches[0];
                    touchStartRef.current = {
                        x: t.clientX,
                        y: t.clientY,
                    };
                }}
                onTouchEnd={(e) => {
                    const t = e.changedTouches[0];
                    const dx = t.clientX - touchStartRef.current.x;
                    const dy = t.clientY - touchStartRef.current.y;

                    if (
                        Math.abs(dx) < TOUCH_THRESHOLD &&
                        Math.abs(dy) < TOUCH_THRESHOLD
                    ) {
                        return;
                    }

                    handleSwipeDirection(dx, dy);
                }}
            />

            <p style={styles.infoText}>
                Steuerung: W / A / S / D oder Pfeiltasten · Auf Touch-Geräten:
                Zum Steuern über das Spielfeld wischen
            </p>

            {gameOver && (
                <div style={styles.overlay}>
                    <h1 style={styles.overlayTitle}>GAME OVER</h1>
                    <p style={styles.overlayScore}>Score: {scoreRef.current}</p>

                    <div style={styles.overlayButtons}>
                        <button onClick={resetGame} style={styles.overlayButton}>
                            🔁 Restart
                        </button>

                        <button
                            onClick={() => {
                                cancelAnimationFrame(rafRef.current);
                                onBack();
                            }}
                            style={styles.overlayButtonGray}
                        >
                            🎮 Game Collection
                        </button>

                        <button
                            onClick={() => {
                                cancelAnimationFrame(rafRef.current);
                                onHome();
                            }}
                            style={styles.overlayButtonRed}
                        >
                            🏠 Home
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}