import React, { useRef, useEffect, useState } from "react";

export default function PaintView({ onBack }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#00ffff");
  const [lineWidth, setLineWidth] = useState(4);
  const [lastPos, setLastPos] = useState(null);
  const [tool, setTool] = useState("draw"); // draw | line | circle
  const [startShape, setStartShape] = useState(null);

  // Undo/Redo stacks
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // ⬛ Set canvas dimensions on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    saveHistory(); // initial empty canvas to history
  }, []);

  // 🧠 Update drawing context when color or width changes
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [color, lineWidth]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const saveHistory = () => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL();
    setHistory((prev) => [...prev, image]);
    setRedoStack([]);
  };

  const undo = () => {
    if (history.length < 2) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const newHistory = [...history];
    const last = newHistory.pop();
    setRedoStack((prev) => [last, ...prev]);

    const img = new Image();
    img.src = newHistory[newHistory.length - 1];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setHistory(newHistory);
    };
  };

  const redo = () => {
    if (!redoStack.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const [top, ...rest] = redoStack;

    const img = new Image();
    img.src = top;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setRedoStack(rest);
      setHistory((prev) => [...prev, top]);
    };
  };

  const startDrawing = (e) => {
    const pos = getMousePos(e);

    if (tool === "draw") {
      setDrawing(true);
      setLastPos(pos);

    } else {
      setStartShape(pos);
    }
  };

  const endDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (tool !== "draw" && startShape) {
      const end = getMousePos(e);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      if (tool === "line") {
        ctx.moveTo(startShape.x, startShape.y);
        ctx.lineTo(end.x, end.y);
      } else if (tool === "circle") {
        const radius = Math.hypot(end.x - startShape.x, end.y - startShape.y);
        ctx.arc(startShape.x, startShape.y, radius, 0, Math.PI * 2);
      }

      ctx.stroke();
      setStartShape(null);
      saveHistory();
    }

    if (tool === "draw") {
      setDrawing(false);
      setLastPos(null);
      saveHistory();
    }
  };

  const draw = (e) => {
    if (!drawing || tool !== "draw") return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const current = getMousePos(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();

    setLastPos(current);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "paint.png";
    link.href = dataURL;
    link.click();
  };

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "24px",
                fontFamily: "Orbitron, system-ui, sans-serif",
                color: "white",
                background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(15,23,42,0.95), rgba(15,23,42,1))",
            }}
        >
            {/* Header + Zurück */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "8px 16px",
                        borderRadius: 16,
                        backgroundColor: "rgba(15,23,42,0.75)",
                        border: "1px solid rgba(71,85,105,0.7)",
                        boxShadow: "0 18px 40px rgba(15,23,42,0.95)",
                        backdropFilter: "blur(16px)",
                    }}
                >
                    <button
                        onClick={onBack}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            borderRadius: 16,
                            backgroundColor: "rgba(2,6,23,0.6)",
                            padding: "0.4rem 0.9rem",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            border: "1px solid rgba(71,85,105,0.7)",
                            boxShadow:
                                "0 18px 40px rgba(15,23,42,0.95), inset 0 1px 0 rgba(248,250,252,0.14)",
                            color: "#e5e7eb",
                            cursor: "pointer",
                            transform: "translateY(0)",
                            transition:
                                "transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease",
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                            e.currentTarget.style.boxShadow =
                                "0 22px 55px rgba(15,23,42,1), inset 0 1px 0 rgba(248,250,252,0.18)";
                            e.currentTarget.style.backgroundColor = "rgba(15,23,42,0.9)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = "translateY(0) scale(1)";
                            e.currentTarget.style.boxShadow =
                                "0 18px 40px rgba(15,23,42,0.95), inset 0 1px 0 rgba(248,250,252,0.14)";
                            e.currentTarget.style.backgroundColor = "rgba(2,6,23,0.6)";
                        }}
                    >
                        <span style={{ fontSize: "1rem" }}>⬅</span>
                        <span>Zurück</span>
                    </button>

                    <div
                        style={{
                            width: 1,
                            height: 24,
                            backgroundColor: "rgba(71,85,105,0.9)",
                        }}
                    />

                    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <span
              style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#22d3ee",
                  textShadow: "0 0 6px rgba(34,211,238,0.9)",
              }}
          >
            Neon Paint Studio
          </span>
                        <span style={{ fontSize: "0.65rem", color: "#9ca3af" }}>
            Freihand, Linien & Kreise
          </span>
                    </div>
                </div>
            </div>

            {/* Glas-Toolbar */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 16px",
                        borderRadius: 16,
                        backgroundColor: "rgba(15,23,42,0.75)",
                        border: "1px solid rgba(71,85,105,0.8)",
                        boxShadow: "0 18px 40px rgba(15,23,42,0.95)",
                        backdropFilter: "blur(18px)",
                    }}
                >
                    {/* Farbe */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            borderRadius: 16,
                            backgroundColor: "rgba(2,6,23,0.7)",
                            padding: "0.35rem 0.9rem",
                            fontSize: "0.7rem",
                            fontWeight: 500,
                            border: "1px solid rgba(71,85,105,0.7)",
                            boxShadow:
                                "0 18px 40px rgba(15,23,42,0.95), inset 0 1px 0 rgba(248,250,252,0.14)",
                            color: "#e5e7eb",
                        }}
                    >
                        <span>🎨 Farbe</span>
                        <input
                            type="color"
                            value={color}
                            onChange={e => setColor(e.target.value)}
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: 9999,
                                border: "none",
                                padding: 0,
                                background: "transparent",
                                cursor: "pointer",
                            }}
                        />
                    </div>

                    {/* Strich */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            minWidth: 170,
                            borderRadius: 16,
                            backgroundColor: "rgba(2,6,23,0.7)",
                            padding: "0.35rem 0.9rem",
                            fontSize: "0.7rem",
                            fontWeight: 500,
                            border: "1px solid rgba(71,85,105,0.7)",
                            boxShadow:
                                "0 18px 40px rgba(15,23,42,0.95), inset 0 1px 0 rgba(248,250,252,0.14)",
                            color: "#e5e7eb",
                        }}
                    >
                        <span>🖊️ Strich</span>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={lineWidth}
                            onChange={e => setLineWidth(parseInt(e.target.value))}
                            style={{ flex: 1 }}
                        />
                    </div>

                    {/* Tool-Auswahl */}
                    <select
                        value={tool}
                        onChange={e => setTool(e.target.value)}
                        style={{
                            borderRadius: 16,
                            backgroundColor: "rgba(15,23,42,0.85)",
                            padding: "0.35rem 0.9rem",
                            fontSize: "0.7rem",
                            fontWeight: 500,
                            border: "1px solid rgba(71,85,105,0.7)",
                            boxShadow:
                                "0 18px 40px rgba(15,23,42,0.95), inset 0 1px 0 rgba(248,250,252,0.14)",
                            color: "#e5e7eb",
                            outline: "none",
                        }}
                    >
                        <option value="draw">✍️ Freihand</option>
                        <option value="line">📏 Linie</option>
                        <option value="circle">⚪ Kreis</option>
                    </select>

                    {/* Button-Helper */}
                    {[
                        { label: "↩️ Undo", onClick: undo },
                        { label: "↪️ Redo", onClick: redo },
                        { label: "🧹 Leeren", onClick: clearCanvas, border: "rgba(248,113,113,0.85)", bg: "rgba(127,29,29,0.7)" },
                        { label: "💾 Speichern", onClick: downloadImage, border: "rgba(34,197,94,0.85)", bg: "rgba(22,101,52,0.7)" },
                    ].map((btn, i) => (
                        <button
                            key={i}
                            onClick={btn.onClick}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                borderRadius: 16,
                                backgroundColor: btn.bg || "rgba(2,6,23,0.7)",
                                padding: "0.35rem 0.9rem",
                                fontSize: "0.7rem",
                                fontWeight: 500,
                                border: `1px solid ${btn.border || "rgba(71,85,105,0.7)"}`,
                                boxShadow:
                                    "0 18px 40px rgba(15,23,42,0.95), inset 0 1px 0 rgba(248,250,252,0.14)",
                                color: "#e5e7eb",
                                cursor: "pointer",
                                transform: "translateY(0)",
                                transition:
                                    "transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                                e.currentTarget.style.boxShadow =
                                    "0 22px 55px rgba(15,23,42,1), inset 0 1px 0 rgba(248,250,252,0.18)";
                                e.currentTarget.style.backgroundColor = "rgba(15,23,42,0.9)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = "translateY(0) scale(1)";
                                e.currentTarget.style.boxShadow =
                                    "0 18px 40px rgba(15,23,42,0.95), inset 0 1px 0 rgba(248,250,252,0.14)";
                                e.currentTarget.style.backgroundColor = btn.bg || "rgba(2,6,23,0.7)";
                            }}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Canvas-Card im Glas-Stil */}
            <div style={{ position: "relative" }}>
                <div
                    style={{
                        borderRadius: 24,
                        border: "1px solid rgba(34,211,238,0.6)",
                        backgroundColor: "rgba(15,23,42,0.75)",
                        boxShadow: "0 30px 80px rgba(15,23,42,1)",
                        backdropFilter: "blur(20px)",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 16px",
                            borderBottom: "1px solid rgba(34,211,238,0.5)",
                            background:
                                "linear-gradient(to right, rgba(15,23,42,0.9), rgba(15,23,42,0.7), rgba(8,47,73,0.7))",
                        }}
                    >
          <span
              style={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(103,232,249,0.9)",
              }}
          >
            Canvas
          </span>
                        <span style={{ fontSize: "0.65rem", color: "#9ca3af" }}>
            Zeichnen in Echtzeit
          </span>
                    </div>

                    <canvas
                        ref={canvasRef}
                        style={{
                            width: "100%",
                            height: "72vh",
                            backgroundColor: "rgba(15,23,42,0.98)",
                            cursor: "crosshair",
                        }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={endDrawing}
                        onMouseLeave={endDrawing}
                        onTouchStart={e => {
                            e.preventDefault();
                            const touch = e.touches[0];
                            startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
                        }}
                        onTouchMove={e => {
                            e.preventDefault();
                            const touch = e.touches[0];
                            draw({ clientX: touch.clientX, clientY: touch.clientY });
                        }}
                        onTouchEnd={e => {
                            e.preventDefault();
                            endDrawing(e.changedTouches[0] || e.touches[0]);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
