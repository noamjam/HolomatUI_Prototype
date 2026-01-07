// src/ByteIndicator.jsx
import React from "react";

export default function ByteIndicator() {
    const handleClick = () => {
        try {
            window.electronAPI?.openChatWindow?.();
        } catch (err) {
            console.error("Failed to open chat window:", err);
        }
    };

    const buttonStyle = {
        position: "fixed",
        bottom: 0,
        right: 0,
        width: "56px",
        height: "56px",
        background: "linear-gradient(135deg, #06b6d4, #0ea5e9)",
        borderTopLeftRadius: "56px",
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        boxShadow: "0 -4px 18px rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 120,
        userSelect: "none",
    };

    const iconStyle = {
        width: "22px",
        height: "22px",
        borderRadius: "9999px",
        border: "2px solid rgba(240,249,255,0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        color: "#e0f2fe",
        boxShadow: "0 0 8px rgba(125,211,252,0.8)",
    };

    return (
        <div style={buttonStyle} onClick={handleClick}>
            <div style={iconStyle}>B</div>
        </div>
    );
}