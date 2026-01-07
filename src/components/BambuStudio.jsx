import React, { useEffect } from "react";

export default function BambuStudio({ onBack }) {
    useEffect(() => {
        try {
            if (window.electronAPI?.launchBambuStudio) {
                console.log("Auto-launching Bambu Studio…");
                window.electronAPI.launchBambuStudio();   // nur hier aufrufen
            } else {
                console.error("Electron API not available — BambuStudio not started.");
                alert("Electron bridge not available: cannot start BambuStudio.");
            }
        } catch (err) {
            console.error("Error launching BambuStudio:", err);
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
                    Bambu Studio Integration
                </h1>
                <p className="text-gray-400 text-sm mt-2">
                    Bambu Studio is launching automatically in the background...
                </p>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-400 text-xs mb-4">
                © 2025 Interactive Workbench — Bambu Studio Integration Module
            </div>
        </div>
    );
}
