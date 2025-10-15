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
    <div className="min-h-screen bg-black text-white font-orbitron p-4">
      {/* 🔧 Toolbar */}
      <div className="flex flex-wrap items-center justify-between mb-3 gap-3">
        <div className="flex gap-2 flex-wrap">
          <button onClick={onBack} className="bg-cyan-700 px-3 py-2 rounded hover:bg-cyan-500">
            ⬅ Zurück
          </button>

          <label>
            🎨 Farbe:
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="ml-2 cursor-pointer"
            />
          </label>

          <label>
            🖊️ Strich:
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="ml-2"
            />
          </label>

          <select value={tool} onChange={(e) => setTool(e.target.value)} className="bg-gray-800 px-2 py-1 rounded">
            <option value="draw">✍️ Freihand</option>
            <option value="line">📏 Linie</option>
            <option value="circle">⚪ Kreis</option>
          </select>

          <button onClick={undo} className="bg-gray-700 px-3 py-2 rounded hover:bg-gray-500">↩️ Undo</button>
          <button onClick={redo} className="bg-gray-700 px-3 py-2 rounded hover:bg-gray-500">↪️ Redo</button>
          <button onClick={clearCanvas} className="bg-red-700 px-3 py-2 rounded hover:bg-red-500">🧹 Leeren</button>
          <button onClick={downloadImage} className="bg-green-700 px-3 py-2 rounded hover:bg-green-500">💾 Speichern</button>
        </div>
      </div>

      {/* 📐 Lineal Overlay */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-[80vh] bg-white rounded border border-cyan-500 cursor-crosshair"
          //Maus Input
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          //Touch Input
          onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
          }}
          onTouchMove={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              draw({ clientX: touch.clientX, clientY: touch.clientY });
          }}
          onTouchEnd={(e) => {
              e.preventDefault();
              endDrawing(e.changedTouches[0] || e.touches[0]);
          }}
        />
          {/* Optionales horizontales/vertikales Lineal */}
          {/*<div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 opacity-60 text-xs text-cyan-300 flex justify-between px-2 pointer-events-none">
          {[...Array(10)].map((_, i) => <span key={i}>{i * 100}px</span>)}
        </div>
        <div className="absolute top-0 left-00 w-6 h-full bg-gradient-to-b from-gray-800 via-gray-600 to-gray-800 opacity-60 text-[10px] text-cyan-300 flex flex-col justify-between py-2 pointer-events-none">
          {[...Array(10)].map((_, i) => <span key={i}>{i * 80}</span>)}
        </div>*/}
      </div>
    </div>
  );
}
