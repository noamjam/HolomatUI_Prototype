import React, { useRef, useEffect, useState } from "react";

export default function SnakeGame({ onBack, onHome }) {
    const canvasRef = useRef(null);

    // UI state (causes re-renders for overlay)
    const [gameOver, setGameOver] = useState(false);
    const [scoreUI, setScoreUI] = useState(0);

    // Game config
    const BOX = 20;
    const W = 800;
    const H = 600;
    const COLS = W / BOX;
    const ROWS = H / BOX;

    // Refs for game logic (avoids stale closures)
    const snakeRef = useRef([{ x: 10, y: 10 }]); // head at index 0
    const directionRef = useRef({ x: 1, y: 0 }); // current direction
    const nextDirectionRef = useRef({ x: 1, y: 0 }); // queued direction
    const foodRef = useRef({ x: 15, y: 10 });
    const scoreRef = useRef(0);
    const gameOverRef = useRef(false);

    // timing
    const baseInterval = 120; // starting ms per move
    const minInterval = 40;
    const intervalRef = useRef(baseInterval);
    const lastTimeRef = useRef(0);
    const accumulatorRef = useRef(0);
    const rafRef = useRef(null);

    // Helper: spawn food not on snake
    function spawnFood() {
        const snake = snakeRef.current;
        let pos;
        let attempts = 0;
        do {
            pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
            attempts++;
            if (attempts > 1000) break;
        } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
        foodRef.current = pos;
    }

    // Helper: compute dynamic interval from scoreRef
    function computeInterval() {
        // faster with higher score: every 5 points reduce interval by 4ms
        const s = scoreRef.current;
        return Math.max(minInterval, baseInterval - Math.floor(s / 5) * 4);
    }

    // Input handling: nextDirectionRef queued to avoid immediate reverse
    useEffect(() => {
        function onKey(e) {
            const k = e.key.toLowerCase();
            let nd = null;
            if (k === "arrowup" || k === "w") nd = { x: 0, y: -1 };
            if (k === "arrowdown" || k === "s") nd = { x: 0, y: 1 };
            if (k === "arrowleft" || k === "a") nd = { x: -1, y: 0 };
            if (k === "arrowright" || k === "d") nd = { x: 1, y: 0 };
            if (!nd) return;
            // prevent 180° turn
            const cur = directionRef.current;
            if (nd.x === -cur.x && nd.y === -cur.y) return;
            nextDirectionRef.current = nd;
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // step the game once; returns true if game over
    function step() {
        const snake = snakeRef.current;
        // apply queued direction
        directionRef.current = nextDirectionRef.current;

        const head = { x: snake[0].x + directionRef.current.x, y: snake[0].y + directionRef.current.y };

        // wall collision
        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
            return true;
        }

        // self collision
        if (snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
            return true;
        }

        snake.unshift(head);

        // eat?
        const f = foodRef.current;
        if (head.x === f.x && head.y === f.y) {
            scoreRef.current += 1;
            setScoreUI(scoreRef.current); // update visible UI
            intervalRef.current = computeInterval(); // faster
            spawnFood();
        } else {
            snake.pop();
        }

        return false;
    }

    // draw current state
    function draw() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        // clear
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, W, H);

        // food
        ctx.fillStyle = "red";
        ctx.fillRect(foodRef.current.x * BOX, foodRef.current.y * BOX, BOX - 1, BOX - 1);

        // snake
        ctx.fillStyle = "lime";
        for (const s of snakeRef.current) {
            ctx.fillRect(s.x * BOX, s.y * BOX, BOX - 1, BOX - 1);
        }

        // score
        ctx.fillStyle = "white";
        ctx.font = "18px Orbitron, monospace";
        ctx.fillText(`Score: ${scoreRef.current}`, W - 150, 24);
    }

    // main loop: accumulator-based using requestAnimationFrame
    function gameLoop(ts) {
        if (gameOverRef.current) {
            // make sure overlay shows (update state if needed)
            setGameOver(true);
            return;
        }

        if (!lastTimeRef.current) lastTimeRef.current = ts;
        const delta = ts - lastTimeRef.current;
        lastTimeRef.current = ts;

        accumulatorRef.current += delta;

        // compute current interval (may change when score changes)
        const moveInterval = intervalRef.current;

        // step as many times as needed (usually 0 or 1)
        while (accumulatorRef.current >= moveInterval) {
            const died = step();
            accumulatorRef.current -= moveInterval;
            if (died) {
                gameOverRef.current = true;
                setGameOver(true);
                // don't continue; ensure we stop requesting frames
                return;
            }
        }

        // draw frame
        draw();

        // next frame
        rafRef.current = requestAnimationFrame(gameLoop);
    }

    // start the game loop (also used on restart)
    function startGame() {
        cancelAnimationFrame(rafRef.current);
        // reset timing
        lastTimeRef.current = 0;
        accumulatorRef.current = 0;
        // ensure refs consistent
        gameOverRef.current = false;
        setGameOver(false);
        intervalRef.current = computeInterval();
        rafRef.current = requestAnimationFrame(gameLoop);
    }

    // reset everything and start
    function resetGame() {
        snakeRef.current = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
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

    // initial setup on mount
    useEffect(() => {
        // init refs
        snakeRef.current = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // If React-level gameOver state changes to true externally, mirror ref
    useEffect(() => {
        if (gameOver) {
            gameOverRef.current = true;
            cancelAnimationFrame(rafRef.current);
        }
    }, [gameOver]);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white z-50">
            <button
                onClick={onBack}
                className="absolute top-4 left-4 bg-cyan-700 px-3 py-2 rounded hover:bg-cyan-500 transition"
            >
                ⬅ Back
            </button>

            <h1 className="text-3xl font-bold text-cyan-400 mb-4 drop-shadow-[0_0_6px_cyan]">
                Byte Snake
            </h1>

            <canvas
                ref={canvasRef}
                width={W}
                height={H}
                className="border border-cyan-400 rounded bg-black"
            />

            <p className="mt-4 text-gray-400 text-sm">Steuerung: W/A/S/D oder Pfeiltasten</p>

            {gameOver && (
                <div className="absolute inset-0 bg-black/80 flex flex-col justify-center items-center text-white z-40">
                    <h1 className="text-4xl font-bold mb-4">GAME OVER</h1>
                    <p className="mb-4 text-lg">Score: {scoreRef.current}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                resetGame();
                            }}
                            className="bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-500"
                        >
                            🔁 Restart
                        </button>
                        <button
                            onClick={() => {
                                cancelAnimationFrame(rafRef.current);
                                onBack();
                            }}
                            className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                        >
                            🎮 Game Collection
                        </button>
                        <button
                            onClick={() => {
                                cancelAnimationFrame(rafRef.current);
                                onHome();
                            }}
                            className="bg-red-600 px-4 py-2 rounded hover:bg-red-500"
                        >
                            🏠 Home
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
