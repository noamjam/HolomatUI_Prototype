import React, { useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

const tracks = [
    { title: "Running_night", src: "./music/running-night.mp3" },
    { title: "Calm", src: "./music/Calm.mp3" },
];

export default function MusicLibrary({ onBack }) {
    const [currentTrack, setCurrentTrack] = useState(0);
    const [customTrack, setCustomTrack] = useState(null);

    const handleNext = () => {
        if (customTrack) return;
        setCurrentTrack((currentTrack + 1) % tracks.length);
    };

    const handlePrevious = () => {
        if (customTrack) return;
        setCurrentTrack((currentTrack - 1 + tracks.length) % tracks.length);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "audio/mpeg") {
            const url = URL.createObjectURL(file);
            setCustomTrack({ title: file.name, src: url });
        } else {
            alert("Bitte eine MP3-Datei auswählen!");
        }
    };

    const openFileDialog = () => {
        document.getElementById("fileInput").click();
    };

    const activeTrack = customTrack || tracks[currentTrack];

    return (
        <div className="relative flex flex-col justify-between h-screen text-white bg-gradient-to-b from-black/70 to-gray-900 backdrop-blur-md">
            {/* Header */}
            <div className="text-center mt-6">
                <button
                    className="bg-cyan-700 px-3 py-2 rounded hover:bg-cyan-500"
                    onClick={onBack}
                >
                    ⬅ Back
                </button>
                <h1 className="text-4xl font-bold mb-2">My Music Library</h1>
                <p className="text-lg text-gray-300 italic">
                    {activeTrack?.title}
                </p>
            </div>

            {/* Datei-Auswahl */}
            <div className="flex flex-col items-center mb-4">
                <button
                    onClick={openFileDialog}
                    className="px-6 py-3 bg-blue-600/80 hover:bg-blue-700 rounded-lg shadow-md transition"
                >
                    🎵 Eigene MP3 auswählen
                </button>
                <input
                    type="file"
                    id="fileInput"
                    accept=".mp3"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {customTrack && (
                    <button
                        onClick={() => setCustomTrack(null)}
                        className="mt-3 px-4 py-2 bg-gray-700/70 hover:bg-gray-600 rounded-lg transition"
                    >
                        🔁 Zurück zur Playlist
                    </button>
                )}
                {/* Audio Player unten fixiert */}
                <div className="sticky bottom-0 w-full bg-black/80 shadow-2xl border-t border-gray-700">
                    <AudioPlayer
                        src={activeTrack?.src}
                        onEnded={handleNext}
                        showSkipControls={!customTrack}
                        showJumpControls={false}
                        onClickNext={handleNext}
                        onClickPrevious={handlePrevious}
                        autoPlayAfterSrcChange
                    />
                </div>
            </div>
        </div>
    );
}