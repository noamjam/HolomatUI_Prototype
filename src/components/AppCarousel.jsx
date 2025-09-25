import React, { useState } from "react";
import { motion } from "framer-motion";

const apps = ["Paint", "Files", "Settings", "3D Viewer"];


export default function AppCarousel({ onSelect }) {
  const [current, setCurrent] = useState(0);

  const rotateLeft = () =>
    setCurrent((prev) => (prev - 1 + apps.length) % apps.length);
  const rotateRight = () =>
    setCurrent((prev) => (prev + 1) % apps.length);

  const handleDragEnd = (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -30 || velocity < -300) {
      rotateRight();
    } else if (offset > 30 || velocity > 300) {
      rotateLeft();
    }
  };

  const getRelativeIndex = (i) => {
    const len = apps.length;
    const diff = (i - current + len) % len;
    if (diff === 0) return 0;
    if (diff === 1 || diff === -len + 1) return 1;
    if (diff === len - 1 || diff === -1) return -1;
    return null;
  };

  return (
    <div className="relative flex justify-center items-center h-[320px] overflow-hidden">
      {/* Drag-Fläche ohne sichtbare Bewegung */}
      <motion.div
        className="absolute inset-0 z-0"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      {/* Statische, fixierte Buttons */}
      <div className="relative flex justify-center items-center w-full h-full pointer-events-none">
        {apps.map((app, i) => {
          const rel = getRelativeIndex(i);
          if (rel === null) return null;

          const translateX = rel * 120;
          const translateZ = rel === 0 ? 0 : -60;
          const rotateY = rel * -6;
          const scale = rel === 0 ? 1.25 : 1.0;
          const zIndex = rel === 0 ? 10 : 5;
          const opacity = rel === 0 ? 1 : 0.75;

          return (
            <div
              key={app}
              className="absolute pointer-events-auto"
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                zIndex,
                opacity,
                transition: 'transform 0.3s ease, opacity 0.3s ease',
              }}
            >
              <button
                onClick={() => onSelect(app)}
                className="w-32 h-32 rounded-full bg-cyan-700/30 text-white text-xl font-semibold shadow-xl border border-cyan-500 backdrop-blur-md drop-shadow-[0_0_6px_cyan] hover:scale-105 transition"
              >
                {app}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
