// FreeCAD.jsx — auto-launch FreeCAD when page mounts
import React, { useEffect } from "react";

export default function FreeCAD({ onBack }) {
    useEffect(() => {
        // Starte FreeCAD automatisch beim Laden der Seite
        try {
            if (window.electronAPI?.launchFreeCAD) {
                console.log("Auto-launching FreeCAD...");
                window.electronAPI.launchFreeCAD();
            } else {
                console.error("Electron API not available — FreeCAD not started.");
                alert("Electron bridge not available: cannot start FreeCAD.");
            }
        } catch (err) {
            console.error("Error launching FreeCAD:", err);
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
                <h1 className="text-3xl font-bold text-yellow-400 mt-4 drop-shadow-[0_0_6px_yellow]">
                    FreeCAD Integration
                </h1>
                <p className="text-gray-400 text-sm mt-2">
                    FreeCAD wird automatisch im Hintergrund gestartet...
                </p>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-400 text-xs mb-4">
                © 2025 Interactive Workbench — FreeCAD Integration Module
            </div>
        </div>
    );
}
