import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { themes } from "../themes";


export default function SettingsView({ onBack }) {
    const [theme, setTheme] = useState('default');

    // 🔹 Lade gespeichertes Theme beim Start
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'default';
        setTheme(savedTheme);
    }, []);

    // 🔹 Theme speichern + Reload (optional)
    const applyTheme = (key) => {
        localStorage.setItem('theme', key);
        setTheme(key);
        window.location.reload(); // Falls du später React Context nutzt, kannst du das entfernen
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
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "32px",
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
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                        e.currentTarget.style.boxShadow =
                            "0 22px 55px rgba(15,23,42,1), inset 0 1px 0 rgba(248,250,252,0.18)";
                        e.currentTarget.style.backgroundColor = "rgba(15,23,42,0.9)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0) scale(1)";
                        e.currentTarget.style.boxShadow =
                            "0 18px 40px rgba(15,23,42,0.95), inset 0 1px 0 rgba(248,250,252,0.14)";
                        e.currentTarget.style.backgroundColor = "rgba(2,6,23,0.6)";
                    }}
                >
                    <span style={{ fontSize: "1rem" }}>⬅</span>
                    <span>Zurück</span>
                </button>

                <div style={{ textAlign: "right" }}>
                    <h2
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            color: "#22d3ee",
                            textShadow: "0 0 6px rgba(34,211,238,0.9)",
                        }}
                    >
                        ⚙️ Einstellungen
                    </h2>
                    <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
            Themes & Farbschemata
          </span>
                </div>
            </div>

            {/* Themes Card */}
            <div
                style={{
                    borderRadius: 24,
                    border: "1px solid rgba(148,163,184,0.7)",
                    backgroundColor: "rgba(15,23,42,0.75)",
                    boxShadow: "0 30px 80px rgba(15,23,42,1)",
                    backdropFilter: "blur(18px)",
                    padding: "20px 24px 24px",
                }}
            >
                <h3
                    style={{
                        fontSize: "1.05rem",
                        fontWeight: 600,
                        color: "#22d3ee",
                        marginBottom: "12px",
                    }}
                >
                    🎨 Farbschema auswählen
                </h3>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "12px",
                    }}
                >
                    {Object.entries(themes).map(([key, t]) => {
                        const isActive = theme === key;

                        // einfache Fallback-Farben falls t.bg/t.accent Klassen enthalten
                        const baseBg =
                            key === "default"
                                ? "linear-gradient(135deg, #0f172a, #020617)"
                                : "linear-gradient(135deg, #0f172a, #1d1b3a)";
                        const accentBorder = isActive ? "rgba(34,211,238,0.8)" : "rgba(71,85,105,0.8)";

                        return (
                            <button
                                key={key}
                                onClick={() => applyTheme(key)}
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    borderRadius: 18,
                                    padding: "14px 12px",
                                    border: `1px solid ${accentBorder}`,
                                    backgroundImage: baseBg,
                                    boxShadow: isActive
                                        ? "0 22px 55px rgba(34,211,238,0.45)"
                                        : "0 18px 40px rgba(15,23,42,0.9)",
                                    color: "#f9fafb",
                                    cursor: "pointer",
                                    transform: isActive ? "translateY(-2px) scale(1.02)" : "translateY(0)",
                                    transition:
                                        "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease, background-color 150ms ease",
                                    overflow: "hidden",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                                    e.currentTarget.style.boxShadow =
                                        "0 26px 70px rgba(15,23,42,1)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = isActive
                                        ? "translateY(-2px) scale(1.02)"
                                        : "translateY(0)";
                                    e.currentTarget.style.boxShadow = isActive
                                        ? "0 22px 55px rgba(34,211,238,0.45)"
                                        : "0 18px 40px rgba(15,23,42,0.9)";
                                }}
                            >
                                {/* leichte Glas-Schicht oben */}
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        background:
                                            "radial-gradient(circle at top left, rgba(255,255,255,0.16), transparent 55%)",
                                        opacity: 0.9,
                                        pointerEvents: "none",
                                    }}
                                />

                                <div
                                    style={{
                                        position: "relative",
                                        textAlign: "center",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 4,
                                    }}
                                >
                  <span
                      style={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          textShadow: "0 0 4px rgba(15,23,42,0.9)",
                      }}
                  >
                    {t.name}
                  </span>
                                    {isActive && (
                                        <span
                                            style={{
                                                fontSize: "0.7rem",
                                                color: "#e5e7eb",
                                            }}
                                        >
                      (Aktiv)
                    </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}