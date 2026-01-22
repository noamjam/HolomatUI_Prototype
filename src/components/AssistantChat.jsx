// src/AssistantChat.jsx
import React, { useState, useRef, useEffect } from "react";

const styleButton = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    borderRadius: 16,
    backgroundColor: "rgba(2,6,23,0.6)",
    padding: "0.5rem 1.25rem",
    fontSize: "0.75rem",
    fontWeight: 500,
    border: "1px solid rgba(71,85,105,0.7)",
    boxShadow:
        "0 18px 40px rgba(15,23,42,0.95), inset 0 1px 0 rgba(248,250,252,0.14)",
    color: "#e5e7eb",
    cursor: "pointer",
    transform: "translateY(0)",
    transition:
        "transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease",
};

export default function AssistantChat({ isOpen, onSend }) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const inputRef = useRef(null);
    const messagesRef = useRef(null);

    if (!isOpen) return null;

    // VirtualKeyboard-API: Inhalt über der Tastatur halten (wo unterstützt)
    useEffect(() => {
        if ("virtualKeyboard" in navigator) {
            navigator.virtualKeyboard.overlaysContent = true;
        }
    }, []);

    // Auto-Scroll ans Ende bei neuen Messages
    useEffect(() => {
        const box = messagesRef.current;
        if (box) {
            box.scrollTop = box.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text) return;

        const userMsg = { from: "user", text };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        if (onSend) {
            await onSend(text, (replyText) => {
                const botMsg = { from: "bot", text: replyText };
                setMessages((prev) => [...prev, botMsg]);
            });
        }
    };

    const handleFocus = () => {
        // Browser-eigene Tastatur wird beim Fokus angezeigt.
        // Optional VirtualKeyboard.show, wo verfügbar:
        if ("virtualKeyboard" in navigator) {
            try {
                navigator.virtualKeyboard.show(); // Chrome/Edge Android etc.[web:95][web:96]
            } catch {
                // Ignorieren, falls nicht erlaubt
            }
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background:
                    "radial-gradient(circle at top, #22d3ee 0, #0f172a 40%, #020617 100%)",
                color: "#e5e7eb",
                display: "flex",
                flexDirection: "column",
                padding: "12px",
                boxSizing: "border-box",
                fontFamily:
                    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                zIndex: 60,
            }}
        >
            {/* Header */}
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

            {/* Messages */}
            <div
                ref={messagesRef}
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

            {/* Eingabezeile */}
            <div
                style={{
                    marginTop: "8px",
                    display: "flex",
                    gap: "6px",
                    alignItems: "flex-end",
                }}
            >
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    onFocus={handleFocus}
                    placeholder="Ask Byte…"
                    rows={2}
                    inputMode="text"
                    style={{
                        flex: 1,
                        padding: "6px 10px",
                        borderRadius: 14,
                        border: "1px solid #4b5563",
                        backgroundColor: "#020617",
                        color: "#e5e7eb",
                        fontSize: "13px",
                        outline: "none",
                        resize: "none",
                        maxHeight: 120,
                    }}
                />
                <button
                    onClick={handleSend}
                    style={{
                        ...styleButton,
                        backgroundColor: "#22c55e",
                        border: "1px solid #22c55e",
                        color: "#022c22",
                        whiteSpace: "nowrap",
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
