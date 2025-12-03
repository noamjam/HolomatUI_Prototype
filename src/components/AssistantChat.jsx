// AssistantChat.jsx — React Chat Component
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AssistantChat({ isOpen }) {
    const [message, setMessage] = useState("");
    const [history, setHistory] = useState([]);
    const [chatPort, setChatPort] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState("connecting");

    useEffect(() => {
        let didCancel = false;

        const handlePort = (port) => {
            if (!port) return;
            console.log("Chat server port:", port);
            setChatPort(port);
            setTimeout(() => checkHealth(port), 300);
        };

        try {
            if (window.electronAPI?.onChatServerStarted) {
                window.electronAPI.onChatServerStarted((port) => {
                    if (didCancel) return;
                    handlePort(port);
                });
            }

            // fallback: ask for port if event was missed
            (async () => {
                if (window.electronAPI?.getChatPort) {
                    const maybePort = await window.electronAPI.getChatPort();
                    if (!didCancel && maybePort) {
                        console.log("💬 Chat server port (fallback):", maybePort);
                        handlePort(maybePort);
                    }
                }
            })();
        } catch (err) {
            console.error("Electron API init error:", err);
        }

        return () => {
            didCancel = true;
        };
    }, []);

    const checkHealth = (port) => {
        fetch(`http://127.0.0.1:${port}/health`)
            .then((res) => res.json())
            .then((data) => {
                console.log("💚 Healthcheck:", data);
                if (data.status === "ok") {
                    setIsConnected(true);
                    setStatus("online");
                } else {
                    setIsConnected(false);
                    setStatus("offline");
                }
            })
            .catch((err) => {
                console.error("Health check failed:", err);
                setIsConnected(false);
                setStatus("offline");
            });
    };

    const handleSend = async () => {
        if (!message.trim() || !chatPort || !isConnected) return;

        const userMsg = { from: "user", text: message };
        setHistory((prev) => [...prev, userMsg]);
        setMessage("");

        try {
            const res = await fetch(`http://127.0.0.1:${chatPort}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });
            if (!res.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await res.json();
            setHistory((prev) => [...prev, { from: "assistant", text: data.reply || "No response." }]);
        } catch (err) {
            console.error("❌ Connection Error:", err);
            setHistory((prev) => [
                ...prev,
                { from: "assistant", text: "⚠️ Connection Error — server unreachable." },
            ]);
            setIsConnected(false);
            setStatus("offline");
        }
    };

    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            console.log("Copied to clipboard");
        }
        catch (err) {
            console.error("Clipboard copy failed:", err);
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
                    className="fixed bottom-28 left-6 w-80 bg-black/80 backdrop-blur-md rounded-2xl shadow-lg p-4 text-white z-[60]"
                >
                    <div className="flex justify-between items-center mb-2 text-xs text-cyan-300">
                        <span>Byte Chat</span>
                        <span className={isConnected ? "text-green-400" : "text-red-400"}>
                            {isConnected ? "● Online" : `● ${status}`}
                        </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto mb-3 space-y-2 text-sm">
                        {history.map((msg, i) => (
                            <div
                                key={i}
                                className={`p-2 rounded-lg ${
                                    msg.from === "user"
                                        ? "bg-cyan-700/40 text-right"
                                        : "bg-gray-800/40 text-left"
                                }`}
                            >
                                <div>{msg.text}</div>

                                {msg.from === "assistant" && (
                                    <button
                                        onClick={() => handleCopy(msg.text)}
                                        className="mt-2.5 text-[12px] text-cyan-300 hover:text-cyan-100 underline"
                                    >
                                        Copy
                                    </button>
                                )}
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
                            style={{ color: "#000", caretColor: "#000", WebkitTextFillColor: "#000" }}
                            disabled={!isConnected}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!isConnected}
                            className={`px-3 py-2 rounded-lg text-sm text-white ${
                                isConnected ? "bg-cyan-600 hover:bg-cyan-500" : "bg-gray-500 cursor-not-allowed"
                            }`}
                        >
                            Send
                        </button>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
