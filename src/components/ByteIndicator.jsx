import React from "react";

export default function ByteIndicator({ isActive }) {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center justify-center w-20 h-20">
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute w-full h-full rounded-full border-2 border-cyan-500 opacity-50 rotate-[30deg]">
          <div className="w-full h-full rounded-full border-[3px] border-transparent border-t-cyan-500 border-l-cyan-500" />
        </div>
        <div className={`w-14 h-14 rounded-full bg-cyan-700/20 border border-cyan-400 flex items-center justify-center text-sm text-cyan-300 font-bold transition-all duration-300 ${isActive ? 'animate-pulse-byte' : ''}`}>
          Mini
        </div>
      </div>
    </div>
  );
}
