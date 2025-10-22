import React from "react";

export default function GameCollection({ onBack }) {
// Später kannst du hier ein Array mit Spielen hinzufügen:
    const games = [
        { name: "Byte Invaders", description: "Retro Space Shooter", image: "invaders.jpg" },
    ];

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
                    Game Collection
                </h1>
                <p className="text-gray-400 text-sm mt-2">
                    Welcome to the Game Collection — select a game to play.
                </p>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 mt-6 overflow-y-auto">
                {games.map((game, index) => (
                    <div
                        key={index}
                        className="bg-gray-800/50 border border-cyan-600 rounded-xl p-4 shadow-lg hover:bg-gray-700/60 transition cursor-pointer"
                    >
                        <img
                            src={game.image}
                            alt={game.name}
                            className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                        <h2 className="text-xl font-semibold text-cyan-300">{game.name}</h2>
                        <p className="text-gray-400 text-sm">{game.description}</p>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="text-center text-gray-400 text-xs mt-4 mb-2">
                © 2025 Interactive Workbench — Game Collection
            </div>
        </div>
    );


}