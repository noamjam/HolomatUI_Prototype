import React, { useState } from "react";
import AssistantChat from "./AssistantChat";

export default function ByteIndicator({ isActive }) {
    const [isChatOpen, setChatOpen] = useState(false);

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

    const rootStyle = {
        position: "fixed",
        right: "1rem",          // unten rechts
        bottom: "1rem",
        zIndex: 50,
        width: "5rem",
        height: "5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
    };

    const wrapperStyle = {
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const orbitStyle = {
        position: "absolute",
        width: "100%",
        height: "100%",
        borderRadius: "9999px",
        border: "2px solid rgba(34,211,238,1)", // cyan
        opacity: 0.5,
        transform: "rotate(30deg)",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const orbitInnerStyle = {
        width: "100%",
        height: "100%",
        borderRadius: "9999px",
        borderWidth: "3px",
        borderStyle: "solid",
        borderColor: "transparent",
        borderTopColor: "rgba(34,211,238,1)",
        borderLeftColor: "rgba(34,211,238,1)",
        boxSizing: "border-box",
    };

    const coreBaseStyle = {
        width: "3.5rem",
        height: "3.5rem",
        borderRadius: "9999px",
        backgroundColor: "rgba(8,145,178,0.2)", // cyan-700/20
        border: "1px solid rgba(34,211,238,1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.875rem",
        fontWeight: 700,
        color: "rgba(103,232,249,1)", // cyan-300
        transition: "all 0.3s ease",
    };

    const coreActiveExtra = isActive
        ? {
            animation: "byte-pulse 1.5s ease-in-out infinite",
            boxShadow: "0 0 15px rgba(6,182,212,1)",
        }
        : {};

    return (
        <>
            <style>{`
        @keyframes byte-pulse {
          0%   { transform: scale(1);   opacity: 1; }
          50%  { transform: scale(1.06); opacity: 0.85; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>

            <div
                onClick={() => setChatOpen((prev) => !prev)}
                style={rootStyle}
            >
                <div style={wrapperStyle}>
                    <div style={orbitStyle}>
                        <div style={orbitInnerStyle} />
                    </div>
                    <div style={{ ...coreBaseStyle, ...coreActiveExtra }}>
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
