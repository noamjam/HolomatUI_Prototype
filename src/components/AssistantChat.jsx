import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AssistantChat({ isOpen, onClose }) {
    const [message, setMessage] = useState("");
    const [history, setHistory] = useState([]);
    const [chatPort, setChatPort] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // 💬 Hole dynamisch den Port vom Electron-Prozess
    useEffect(() => {
        if (window.electronAPI?.onChatServerStarted) {
            window.electronAPI.onChatServerStarted((port) => {
                console.log("💬 Chat server started on port:", port);
                setChatPort(port);
                checkHealth(port);
            });
        } else {
            console.warn("⚠️ electronAPI not available – running without Electron bridge?");
        }
    }, []);

    // 🔍 Healthcheck, um zu prüfen, ob Server erreichbar ist
    const checkHealth = async (port) => {
        try {
            const res = await fetch(`http://127.0.0.1:${port}/health`);
            if (res.ok) {
                console.log("✅ Chat server is healthy");
                setIsConnected(true);
            } else {
                console.warn("⚠️ Chat server health check failed");
                setIsConnected(false);
            }
        } catch (err) {
            console.error("❌ Cannot reach Chat server:", err);
            setIsConnected(false);
        }
    };

    // 📨 Nachricht senden
    const handleSend = async () => {
        if (!message.trim() || !chatPort) return;

        const userMsg = { from: "user", text: message };
        setHistory((prev) => [...prev, userMsg]);
        setMessage("");

        try {
            const res = await fetch(`http://127.0.0.1:${chatPort}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });

            if (!res.ok) throw new Error("Network response was not ok");
            const data = await res.json();

            setHistory((prev) => [
                ...prev,
                { from: "assistant", text: data.reply || "No response." },
            ]);
        } catch (err) {
            console.error("❌ Connection Error:", err);
            setHistory((prev) => [
                ...prev,
                { from: "assistant", text: "⚠️ Connection Error — server unreachable." },
            ]);
            setIsConnected(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-28 left-6 w-80 bg-black/80 backdrop-blur-md border border-cyan-500 rounded-2xl shadow-lg shadow-cyan-500/30 p-4 text-white z-[60]"
                >
                    <div className="flex justify-between items-center mb-2 text-xs text-cyan-300">
                        <span>Byte Chat</span>
                        <span className={isConnected ? "text-green-400" : "text-red-400"}>
                            {isConnected ? "● Connected" : "● Offline"}
                        </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto mb-3 space-y-2 text-sm">
                        {history.map((msg, i) => (
                            <div
                                key={i}
                                className={`p-2 rounded-lg ${
                                    msg.from === "user"
                                        ? "bg-cyan-700/40 text-right"
                                        : "bg-cyan-900/40 text-left"
                                }`}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 items-end">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder={isConnected ? "Ask Byte..." : "Connecting..."}
                            autoComplete="off"
                            spellCheck={false}
                            className="flex-grow bg-white border border-cyan-500 rounded-lg px-3 py-2 text-sm placeholder-gray-500 outline-none"
                            style={{
                                color: "#000",
                                caretColor: "#000",
                                WebkitTextFillColor: "#000",
                            }}
                            disabled={!isConnected}
                        />

                        <button
                            onClick={handleSend}
                            disabled={!isConnected}
                            className={`px-3 py-2 rounded-lg text-sm text-white ${
                                isConnected
                                    ? "bg-cyan-600 hover:bg-cyan-500"
                                    : "bg-gray-500 cursor-not-allowed"
                            }`}
                        >
                            Send
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-2 right-3 text-cyan-400 hover:text-cyan-200 text-xs"
                    >
                        ✕
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
