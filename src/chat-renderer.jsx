// src/chat-renderer.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

function AssistantChat({ isOpen, onSend }) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);

    if (!isOpen) return null;

    const handleSend = async () => {
        const text = input.trim();
        if (!text) return;

        const userMsg = { from: "user", text };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        await onSend(text, (replyText) => {
            const botMsg = { from: "bot", text: replyText };
            setMessages((prev) => [...prev, botMsg]);
        });
    };

    return (
        <div
            style={{
                height: "100vh",
                width: "100vw",
                background:
                    "radial-gradient(circle at top, #22d3ee 0, #0f172a 40%, #020617 100%)",
                color: "#e5e7eb",
                display: "flex",
                flexDirection: "column",
                padding: "12px",
                boxSizing: "border-box",
                fontFamily:
                    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
        >
            <div
                style={{
                    marginBottom: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: 600,
                }}
            >
                <span>Byte Chat</span>
                <span style={{ fontSize: "11px", color: "#22c55e" }}>● Online</span>
            </div>

            <div
                style={{
                    flex: 1,
                    borderRadius: "10px",
                    backgroundColor: "rgba(15,23,42,0.9)",
                    padding: "8px",
                    overflowY: "auto",
                    fontSize: "13px",
                }}
            >
                {messages.map((m, i) => (
                    <div
                        key={i}
                        style={{
                            marginBottom: "6px",
                            textAlign: m.from === "user" ? "right" : "left",
                        }}
                    >
            <span
                style={{
                    display: "inline-block",
                    maxWidth: "80%",
                    padding: "6px 8px",
                    borderRadius: "9999px",
                    backgroundColor:
                        m.from === "user" ? "#0ea5e9" : "rgba(15,23,42,0.9)",
                    color: m.from === "user" ? "#0f172a" : "#e5e7eb",
                }}
            >
              {m.text}
            </span>
                    </div>
                ))}
            </div>

            <div
                style={{
                    marginTop: "8px",
                    display: "flex",
                    gap: "6px",
                    alignItems: "center",
                }}
            >
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask Byte…"
                    style={{
                        flex: 1,
                        padding: "6px 8px",
                        borderRadius: "9999px",
                        border: "1px solid #4b5563",
                        backgroundColor: "#020617",
                        color: "#e5e7eb",
                        fontSize: "13px",
                        outline: "none",
                    }}
                />
                <button
                    onClick={handleSend}
                    style={{
                        padding: "6px 12px",
                        borderRadius: "9999px",
                        border: "none",
                        backgroundColor: "#22c55e",
                        color: "#022c22",
                        fontSize: "13px",
                        cursor: "pointer",
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

function ChatWindowRoot() {
    const [chatPort, setChatPort] = useState(null);
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const port = await window.electronAPI?.getChatPort?.();
                if (mounted) setChatPort(port);
            } catch (err) {
                console.error("Failed to get chat port:", err);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const handleSendMessage = async (msg, addResponse) => {
        if (!chatPort) {
            addResponse("⚠️ Chat server not ready.");
            return;
        }
        try {
            const res = await fetch(`http://127.0.0.1:${chatPort}/api/chat`, {
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

    return <AssistantChat isOpen={true} onSend={handleSendMessage} />;
}

ReactDOM.createRoot(document.getElementById("chat-root")).render(
    <ChatWindowRoot />
);
