import React from 'react';

export default function FileView({ onBack }) {
  const openExplorer = () => {
    if (window.electronAPI?.openFileExplorer) {
      window.electronAPI.openFileExplorer();
    } else {
      alert("Dateiexplorer nicht verfügbar");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-orbitron p-4">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="bg-cyan-700 px-4 py-2 rounded hover:bg-cyan-500">
          ⬅ Zurück
        </button>
        <h2 className="text-2xl text-cyan-300">📂 Datei-Explorer</h2>
      </div>

      <p className="mb-4">Klicke auf den Button, um deinen Datei-Explorer zu öffnen.</p>
      <button
        onClick={openExplorer}
        className="bg-blue-700 hover:bg-blue-500 px-6 py-3 rounded-lg shadow"
      >
        📁 Explorer öffnen
      </button>
    </div>
  );
}
