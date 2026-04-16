import React, { useState } from "react";

// --------- KONSTANTEN -----------
const ROWS = 10;
const COLS = 10;
const MINES = 15;

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

// --------- LOGIKHILFEN -----------
function createEmptyBoard() {
    return Array.from({ length: ROWS }, () =>
        Array.from({ length: COLS }, () => ({
            revealed: false,
            mine: false,
            flagged: false,
            adjacent: 0,
        }))
    );
}

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

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (!board[r][c].mine) {
                let count = 0;

                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (
                            !(dr === 0 && dc === 0) &&
                            board[r + dr]?.[c + dc]?.mine
                        ) {
                            count++;
                        }
                    }
                }

                board[r][c].adjacent = count;
            }
        }
    }

    return board;
}

// --------- REACT-KOMPONENTE -----------
export default function Minesweeper({
                                        onBack = () => {},
                                        onHome = () => {},
                                    }) {
    const [board, setBoard] = useState(createEmptyBoard());
    const [minesPlanted, setMinesPlanted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [isLightMode, setIsLightMode] = useState(false);

    const theme = isLightMode
        ? {
            appBg: "#ffffff",
            text: "#0f172a",
            mutedText: "#334155",
            accent: "#0891b2",
            accentGlow: "none",
            overlayBg: "rgba(255,255,255,0.92)",
            boardBg: "#dbe4ea",
            boardGap: "#b8c4cf",
            hiddenCell: "#94a3b8",
            hiddenCellBorder: "#64748b",
            revealedCell: "#f1f5f9",
            revealedCellBorder: "#cbd5e1",
            mineCell: "#fecaca",
            flagColor: "#dc2626",
            mineColor: "#991b1b",
            buttonText: "#0f172a",
            buttonBg: "rgba(255,255,255,0.75)",
            buttonBorder: "rgba(15,23,42,0.25)",
            numberColors: {
                1: "#2563eb",
                2: "#15803d",
                3: "#dc2626",
                4: "#7c3aed",
                5: "#b45309",
                6: "#0f766e",
                7: "#111827",
                8: "#475569",
            },
        }
        : {
            appBg: "#000000",
            text: "#ffffff",
            mutedText: "#9ca3af",
            accent: "#22d3ee",
            accentGlow: "0 0 6px #22d3ee",
            overlayBg: "rgba(0,0,0,0.85)",
            boardBg: "#222222",
            boardGap: "#2f2f2f",
            hiddenCell: "#444444",
            hiddenCellBorder: "#3f3f46",
            revealedCell: "#dddddd",
            revealedCellBorder: "#52525b",
            mineCell: "#f87171",
            flagColor: "#f43f5e",
            mineColor: "#ffffff",
            buttonText: "#e5e7eb",
            buttonBg: "rgba(2,6,23,0.6)",
            buttonBorder: "rgba(71,85,105,0.7)",
            numberColors: {
                1: "#60a5fa",
                2: "#4ade80",
                3: "#f87171",
                4: "#a78bfa",
                5: "#f59e0b",
                6: "#2dd4bf",
                7: "#f8fafc",
                8: "#94a3b8",
            },
        };

    function toggleBackground() {
        setIsLightMode((prev) => !prev);
    }

    function reveal(r, c, currBoard) {
        if (
            r < 0 ||
            r >= ROWS ||
            c < 0 ||
            c >= COLS ||
            currBoard[r][c].revealed ||
            currBoard[r][c].flagged
        ) {
            return;
        }

        currBoard[r][c].revealed = true;

        if (currBoard[r][c].adjacent === 0 && !currBoard[r][c].mine) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr !== 0 || dc !== 0) {
                        reveal(r + dr, c + dc, currBoard);
                    }
                }
            }
        }
    }

    function handleCellClick(r, c) {
        if (gameOver || won) return;

        let newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

        if (!minesPlanted) {
            newBoard = plantMines(newBoard, r, c);
            setMinesPlanted(true);
        }

        if (newBoard[r][c].flagged) return;

        if (newBoard[r][c].mine) {
            newBoard[r][c].revealed = true;

            for (let rr = 0; rr < ROWS; rr++) {
                for (let cc = 0; cc < COLS; cc++) {
                    if (newBoard[rr][cc].mine) newBoard[rr][cc].revealed = true;
                }
            }

            setBoard(newBoard);
            setGameOver(true);
            return;
        }

        reveal(r, c, newBoard);
        setBoard(newBoard);

        const allNonMinesRevealed = newBoard
            .flat()
            .filter((cell) => !cell.mine)
            .every((cell) => cell.revealed);

        if (allNonMinesRevealed) setWon(true);
    }

    function handleCellRightClick(e, r, c) {
        e.preventDefault();
        if (gameOver || won) return;

        if (!board[r][c].revealed) {
            const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
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
        board: {
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 32px)`,
            background: theme.boardBg,
            borderRadius: 12,
            gap: 2,
            padding: 6,
            marginBottom: 16,
            boxShadow: isLightMode
                ? "0 16px 40px rgba(15,23,42,0.12)"
                : "0 16px 40px rgba(0,0,0,0.45)",
            transition: "background 180ms ease, box-shadow 180ms ease",
        },
        infoText: {
            color: theme.mutedText,
            fontSize: 13,
            marginBottom: 6,
        },
        overlay: {
            position: "absolute",
            inset: 0,
            backgroundColor: theme.overlayBg,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: theme.text,
            zIndex: 40,
            transition: "background-color 180ms ease, color 180ms ease",
        },
        overlayTitle: {
            fontSize: "36px",
            fontWeight: "bold",
            marginBottom: 16,
        },
        overlayButtons: {
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
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

    function getCellStyle(cell) {
        const color =
            cell.adjacent > 0
                ? theme.numberColors[cell.adjacent] || theme.text
                : "transparent";

        return {
            width: 32,
            height: 32,
            background: cell.revealed
                ? cell.mine
                    ? theme.mineCell
                    : theme.revealedCell
                : theme.hiddenCell,
            border: `1px solid ${
                cell.revealed ? theme.revealedCellBorder : theme.hiddenCellBorder
            }`,
            borderRadius: 4,
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: gameOver || won ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: 18,
            transition:
                "background 120ms ease, color 120ms ease, border-color 120ms ease",
            userSelect: "none",
        };
    }

    return (
        <div style={styles.root}>
            <button onClick={onBack} style={styles.backButton}>
                ⬅ Back
            </button>

            <button onClick={toggleBackground} style={styles.toggleButton}>
                {isLightMode ? "🌙" : "☀️"}
            </button>

            <h1 style={styles.title}>Minesweeper</h1>

            <div style={styles.board}>
                {board.map((row, rIdx) =>
                    row.map((cell, cIdx) => (
                        <div
                            key={`${rIdx}-${cIdx}`}
                            style={getCellStyle(cell)}
                            onClick={() => handleCellClick(rIdx, cIdx)}
                            onContextMenu={(e) => handleCellRightClick(e, rIdx, cIdx)}
                        >
                            {cell.revealed
                                ? cell.mine
                                    ? <span style={{ color: theme.mineColor }}>💣</span>
                                    : cell.adjacent > 0
                                        ? cell.adjacent
                                        : ""
                                : cell.flagged
                                    ? <span style={{ color: theme.flagColor }}>🚩</span>
                                    : ""}
                        </div>
                    ))
                )}
            </div>

            <div style={styles.infoText}>
                Linksklick: aufdecken, Rechtsklick: Flagge setzen
            </div>

            {(gameOver || won) && (
                <div style={styles.overlay}>
                    <h1 style={styles.overlayTitle}>
                        {gameOver ? "GAME OVER" : "DU HAST GEWONNEN!"}
                    </h1>

                    <div style={styles.overlayButtons}>
                        <button onClick={restart} style={styles.overlayButton}>
                            🔁 Restart
                        </button>

                        <button onClick={onBack} style={styles.overlayButtonGray}>
                            🎮 Game Collection
                        </button>

                        <button onClick={onHome} style={styles.overlayButtonRed}>
                            🏠 Home
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}