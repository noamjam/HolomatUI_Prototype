import React, { useState } from "react";

// --------- KONSTANTEN -----------
const ROWS = 10;
const COLS = 10;
const MINES = 15;

// --------- LOGIKHILFEN -----------

// Leeres Board mit allen Zell-Objekten erstellen
function createEmptyBoard() {
    return Array.from({ length: ROWS }, () =>
        Array.from({ length: COLS }, () => ({
            revealed: false,
            mine: false,
            flagged: false,
            adjacent: 0
        }))
    );
}

// Board mit Minen und angrenzenden Zahlen bestücken
function plantMines(board, startRow, startCol) {
    let mines = 0;
    const safe = (r, c) => startRow === r && startCol === c;
    while (mines < MINES) {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        if (!board[r][c].mine && !safe(r, c)) {
            board[r][c].mine = true;
            mines++;
        }
    }
    // Zahlen berechnen
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (!board[r][c].mine) {
                let count = 0;
                for (let dr = -1; dr <= 1; dr++)
                    for (let dc = -1; dc <= 1; dc++)
                        if (
                            !(dr === 0 && dc === 0) &&
                            board[r + dr]?.[c + dc]?.mine
                        ) count++;
                board[r][c].adjacent = count;
            }
        }
    }
    return board;
}

// --------- REACT-KOMPONENTE -----------
export default function Minesweeper({ onBack = () => {}, onHome = () => {} }) {
    // Spielfeld-State
    const [board, setBoard] = useState(createEmptyBoard());
    const [minesPlanted, setMinesPlanted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);

    // Helfer zum Rekursiven Aufdecken
    function reveal(r, c, currBoard) {
        if (
            r < 0 || r >= ROWS ||
            c < 0 || c >= COLS ||
            currBoard[r][c].revealed ||
            currBoard[r][c].flagged
        ) return;
        currBoard[r][c].revealed = true;
        if (currBoard[r][c].adjacent === 0 && !currBoard[r][c].mine) {
            for (let dr = -1; dr <= 1; dr++)
                for (let dc = -1; dc <= 1; dc++)
                    if (dr !== 0 || dc !== 0) reveal(r + dr, c + dc, currBoard);
        }
    }

    function handleCellClick(r, c) {
        if (gameOver || won) return;
        let newBoard = board.map(row => row.map(cell => ({ ...cell })));
        // Beim ersten Klick Minen setzen!
        if (!minesPlanted) {
            newBoard = plantMines(newBoard, r, c);
            setMinesPlanted(true);
        }
        if (newBoard[r][c].mine) {
            newBoard[r][c].revealed = true;
            setBoard(newBoard);
            setGameOver(true);
            return;
        }
        reveal(r, c, newBoard);
        setBoard(newBoard);
        // Gewinn-Check: alle Nicht-Minen aufgedeckt
        const allNonMinesRevealed = newBoard.flat().filter(cell => !cell.mine).every(cell => cell.revealed);
        if (allNonMinesRevealed) setWon(true);
    }

    function handleCellRightClick(e, r, c) {
        e.preventDefault();
        if (gameOver || won) return;
        if (!board[r][c].revealed) {
            const newBoard = board.map(row => row.map(cell => ({ ...cell })));
            newBoard[r][c].flagged = !newBoard[r][c].flagged;
            setBoard(newBoard);
        }
    }

    function restart() {
        setBoard(createEmptyBoard());
        setMinesPlanted(false);
        setGameOver(false);
        setWon(false);
    }

    // --------- RENDERING -----------
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white z-50">
            {/* BACK-BUTTON OBEN LINKS */}
            <button
                onClick={onBack}
                className="absolute top-4 left-4 bg-cyan-700 px-3 py-2 rounded hover:bg-cyan-500 transition"
            >
                ⬅ Back
            </button>
            {/* HEADLINE */}
            <h1 className="text-3xl font-bold text-cyan-400 mb-4 drop-shadow-[0_0_6px_cyan]">Minesweeper</h1>
            {/* GAME-BOARD */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${COLS}, 32px)`,
                    background: "#222",
                    borderRadius: 8,
                    gap: 2,
                    marginBottom: 16,
                }}
            >
                {board.map((row, rIdx) =>
                    row.map((cell, cIdx) => {
                        return (
                            <div
                                key={`${rIdx}-${cIdx}`}
                                style={{
                                    width: 32,
                                    height: 32,
                                    background: cell.revealed
                                        ? cell.mine
                                            ? "#f66"
                                            : "#ddd"
                                        : "#444",
                                    border: "1px solid #444",
                                    borderRadius: 3,
                                    color:
                                        cell.adjacent === 1
                                            ? "blue"
                                            : cell.adjacent === 2
                                                ? "green"
                                                : cell.adjacent > 2
                                                    ? "red"
                                                    : "black",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: (gameOver || won) ? "not-allowed" : "pointer",
                                    fontWeight: "bold",
                                    fontSize: 18,
                                    transition: "background 0.12s"
                                }}
                                onClick={() => handleCellClick(rIdx, cIdx)}
                                onContextMenu={e => handleCellRightClick(e, rIdx, cIdx)}
                            >
                                {cell.revealed
                                    ? (cell.mine
                                            ? "💣"
                                            : cell.adjacent > 0
                                                ? cell.adjacent
                                                : ""
                                    )
                                    : (cell.flagged ? "🚩" : "")
                                }
                            </div>
                        );
                    })
                )}
            </div>
            <div className="text-gray-400 text-sm mb-2">Linksklick: aufdecken, Rechtsklick: Flagge setzen</div>
            {/* GAME OVER/LAYER-OVERLAY */}
            {(gameOver || won) && (
                <div className="absolute inset-0 bg-black/80 flex flex-col justify-center items-center text-white z-40">
                    <h1 className="text-4xl font-bold mb-4">{gameOver ? "GAME OVER" : "DU HAST GEWONNEN!"}</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={restart}
                            className="bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-500"
                        >
                            🔁 Restart
                        </button>
                        <button
                            onClick={onBack}
                            className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                        >
                            🎮 Game Collection
                        </button>
                        <button
                            onClick={onHome}
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
