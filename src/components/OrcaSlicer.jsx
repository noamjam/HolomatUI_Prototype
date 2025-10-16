// OrcaSlicer.jsx — auto-launch Orca when page mounts
import React, { useEffect } from "react";

export default function OrcaSlicer({ onBack }) {
    useEffect(() => {
        // Starte Orca automatisch beim Laden der Seite
        try {
            if (window.electronAPI?.launchOrcaSlicer) {
                console.log("Auto-launching Orca Slicer...");
                window.electronAPI.launchOrcaSlicer();
            } else {
                console.error("Electron API not available — Orca not started.");
                alert("Electron bridge not available: cannot start Orca Slicer.");
            }
        } catch (err) {
            console.error("Error launching Orca Slicer:", err);
        }
    }, []);

    return (
        <div className="relative flex flex-col justify-between h-screen text-white bg-gradient-to-b from-black/70 to-gray-900 backdrop-blur-md p-6">
            {/* Header */}
            <div className="text-center mt-6">
                <button
                    className="bg-cyan-700 px-3 py-2 rounded hover:bg-cyan-500 transition"
                    onClick={onBack}
                >
                    ⬅ Back
                </button>
                <h1 className="text-3xl font-bold text-cyan-400 mt-4 drop-shadow-[0_0_6px_cyan]">
                    Orca Slicer Integration
                </h1>
                <p className="text-gray-400 text-sm mt-2">
                    Orca Slicer is launching automatically in the background...
                </p>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-400 text-xs mb-4">
                © 2025 Interactive Workbench — Orca Slicer Integration Module
            </div>
        </div>
    );
}
