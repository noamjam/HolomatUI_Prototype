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
        <div
            style={{
                minHeight: "100vh",
                padding: "24px",
                fontFamily: "Orbitron, system-ui, sans-serif",
                color: "white",
                background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(15,23,42,0.95), rgba(15,23,42,1))",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "24px",
                }}
            >
                <button
                    onClick={onBack}
                    style={{
                        display: "flex",
                        alignItems: "center",
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
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                        e.currentTarget.style.boxShadow =
                            "0 22px 55px rgba(15,23,42,1), inset 0 1px 0 rgba(248,250,252,0.18)";
                        e.currentTarget.style.backgroundColor = "rgba(15,23,42,0.9)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = "translateY(0) scale(1)";
                        e.currentTarget.style.boxShadow =
                            "0 18px 40px rgba(15,23,42,0.95), inset 0 1px 0 rgba(248,250,252,0.14)";
                        e.currentTarget.style.backgroundColor = "rgba(2,6,23,0.6)";
                    }}
                >
                    <span style={{ fontSize: "1rem" }}>⬅</span>
                    <span>Zurück</span>
                </button>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 4,
                    }}
                >
                    <h2
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: 600,
                            color: "#22d3ee",
                            textShadow: "0 0 6px rgba(34,211,238,0.9)",
                        }}
                    >
                        📂 Datei-Explorer
                    </h2>
                    <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
            Öffne deinen System-Dateiexplorer
          </span>
                </div>
            </div>

            {/* Card + Text + Button */}
            <div
                style={{
                    maxWidth: 520,
                    margin: "0 auto",
                    borderRadius: 24,
                    border: "1px solid rgba(148,163,184,0.7)",
                    backgroundColor: "rgba(15,23,42,0.75)",
                    boxShadow: "0 30px 80px rgba(15,23,42,1)",
                    backdropFilter: "blur(18px)",
                    padding: "20px 24px 24px",
                }}
            >
                <p
                    style={{
                        marginBottom: "16px",
                        fontSize: "0.85rem",
                        color: "#e5e7eb",
                    }}
                >
                    Klicke auf den Button, um deinen Datei-Explorer zu öffnen.
                </p>

                <button
                    onClick={openExplorer}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        width: "100%",
                        borderRadius: 18,
                        backgroundColor: "rgba(2,6,23,0.75)",
                        padding: "0.75rem 1.5rem",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        border: "1px solid rgba(56,189,248,0.85)",
                        boxShadow:
                            "0 22px 55px rgba(15,23,42,0.95), inset 0 1px 0 rgba(248,250,252,0.16)",
                        color: "#e0f2fe",
                        cursor: "pointer",
                        transform: "translateY(0)",
                        transition:
                            "transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease",
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                        e.currentTarget.style.boxShadow =
                            "0 26px 70px rgba(15,23,42,1), inset 0 1px 0 rgba(248,250,252,0.2)";
                        e.currentTarget.style.backgroundColor = "rgba(15,23,42,0.95)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = "translateY(0) scale(1)";
                        e.currentTarget.style.boxShadow =
                            "0 22px 55px rgba(15,23,42,0.95), inset 0 1px 0 rgba(248,250,252,0.16)";
                        e.currentTarget.style.backgroundColor = "rgba(2,6,23,0.75)";
                    }}
                >
                    <span style={{ fontSize: "1.1rem" }}>📁</span>
                    <span>Explorer öffnen</span>
                </button>
            </div>
        </div>
    );
}
