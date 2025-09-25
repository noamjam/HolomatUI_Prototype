import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

const themes = {
  default: {
    name: 'Cyan (Standard)',
    bg: 'from-gray-900 via-gray-800 to-black',
    accent: 'ring-cyan-400',
  },
  red: {
    name: 'Schwarz & Rot',
    bg: 'from-black via-gray-900 to-gray-800',
    accent: 'ring-red-500',
  },
  yellow: {
    name: 'Gelb & Schwarz',
    bg: 'from-black via-gray-900 to-yellow-800',
    accent: 'ring-yellow-400',
  },
  green: {
    name: 'Grün & Schwarz',
    bg: 'from-black via-gray-900 to-green-900',
    accent: 'ring-green-400',
  },
};

export default function SettingsView({ onBack }) {
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'default';
    setTheme(saved);
  }, []);

  const applyTheme = (key) => {
    localStorage.setItem('theme', key);
    setTheme(key);
    window.location.reload(); // optional: neuladen, damit App.jsx neu rendert
  };

  return (
    <div className="min-h-screen bg-black text-white font-orbitron p-4">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="bg-cyan-700 px-4 py-2 rounded hover:bg-cyan-500"
        >
          ⬅ Zurück
        </button>
        <h2 className="text-2xl text-cyan-300">⚙️ Einstellungen</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg text-cyan-400 font-semibold mb-2">🎨 Farbschema</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(themes).map(([key, t]) => (
              <button
                key={key}
                onClick={() => applyTheme(key)}
                className={clsx(
                  'p-4 rounded-lg shadow text-white bg-gradient-to-br hover:scale-105 transition',
                  t.bg,
                  theme === key && 'ring-4',
                  theme === key && t.accent
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
