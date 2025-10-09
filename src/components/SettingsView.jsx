import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { themes } from "../themes";


export default function SettingsView({ onBack }) {
    const [theme, setTheme] = useState('default');

    // 🔹 Lade gespeichertes Theme beim Start
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'default';
        setTheme(savedTheme);
    }, []);

    // 🔹 Theme speichern + Reload (optional)
    const applyTheme = (key) => {
        localStorage.setItem('theme', key);
        setTheme(key);
        window.location.reload(); // Falls du später React Context nutzt, kannst du das entfernen
    };

    return (
        <div className="min-h-screen bg-black text-white font-orbitron p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <button
                    onClick={onBack}
                    className="bg-cyan-700 px-4 py-2 rounded-lg hover:bg-cyan-500 transition"
                >
                    ⬅ Zurück
                </button>
                <h2 className="text-2xl text-cyan-300 font-bold tracking-wide">
                    ⚙️ Einstellungen
                </h2>
            </div>

            {/* Themes */}
            <div>
                <h3 className="text-lg text-cyan-400 font-semibold mb-4">
                    🎨 Farbschema auswählen
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(themes).map(([key, t]) => (
                        <button
                            key={key}
                            onClick={() => applyTheme(key)}
                            className={clsx(
                                'p-4 rounded-lg shadow-lg text-white bg-gradient-to-br transition transform hover:scale-105',
                                t.bg,
                                theme === key && 'ring-4',
                                theme === key && t.accent
                            )}
                        >
                            <div className="text-center">
                                <span className="block text-base font-semibold">{t.name}</span>
                                {theme === key && (
                                    <span className="text-sm text-gray-300">(Aktiv)</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
