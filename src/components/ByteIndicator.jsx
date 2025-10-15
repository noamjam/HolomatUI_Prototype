import React, { useState } from "react";
import AssistantChat from "./AssistantChat";

export default function ByteIndicator({ isActive }) {
    const [isChatOpen, setChatOpen] = useState(false);

    // 🔄 Kommunikation mit deinem Backend (z. B. Ollama / Python)
    const handleSendMessage = async (msg, addResponse) => {
        try {
            const res = await fetch("http://localhost:5000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: msg }),
            });
            const data = await res.json();
            addResponse(data.reply || "No response");
        } catch (err) {
            addResponse("⚠️ Connection error.");
            console.error(err);
        }
    };

    return (
        <>
            <div
                onClick={() => setChatOpen((prev) => !prev)}
                className="fixed bottom-4 left-4 z-50 flex items-center justify-center w-20 h-20 cursor-pointer select-none"
            >
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute w-full h-full rounded-full border-2 border-cyan-500 opacity-50 rotate-[30deg]">
                        <div className="w-full h-full rounded-full border-[3px] border-transparent border-t-cyan-500 border-l-cyan-500" />
                    </div>
                    <div
                        className={`w-14 h-14 rounded-full bg-cyan-700/20 border border-cyan-400 flex items-center justify-center text-sm text-cyan-300 font-bold transition-all duration-300 ${
                            isActive ? "animate-pulse-byte shadow-[0_0_15px_#06b6d4]" : ""
                        }`}
                    >
                        Mini
                    </div>
                </div>
            </div>

            <AssistantChat
                isOpen={isChatOpen}
                onClose={() => setChatOpen(false)}
                onSend={handleSendMessage}
            />
        </>
    );
}
