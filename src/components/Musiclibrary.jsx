import React, { useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

const tracks = [
    { title: "Running_night", src: "./music/running-night.mp3" },
    { title: "Calm", src: "./music/Calm.mp3" },
];

export default function MusicLibrary({ onBack }) {
    const [currentTrack, setCurrentTrack] = useState(0);
    const [customTrack, setCustomTrack] = useState(null);

    const handleNext = () => {
        if (customTrack) return;
        setCurrentTrack((currentTrack + 1) % tracks.length);
    };

    const handlePrevious = () => {
        if (customTrack) return;
        setCurrentTrack((currentTrack - 1 + tracks.length) % tracks.length);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "audio/mpeg") {
            const url = URL.createObjectURL(file);
            setCustomTrack({ title: file.name, src: url });
        } else {
            alert("Bitte eine MP3-Datei auswählen!");
        }
    };

    const openFileDialog = () => {
        document.getElementById("fileInput").click();
    };

    const activeTrack = customTrack || tracks[currentTrack];

    return (
        <div
            style={{
                height: "100%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "stretch",
                padding: "1.5rem",
                backgroundImage:
                    "radial-gradient(circle at top, #38bdf8 0, #0f172a 55%, #020617 100%)",
                color: "#e2e8f0",
            }}
        >
            <div
                style={{
                    width: 960,
                    maxWidth: "100%",
                    height: 910,
                    borderRadius: 32,
                    backgroundColor: "rgba(15,23,42,0.8)",
                    border: "1px solid rgba(148,163,184,0.6)",
                    boxShadow: "0 30px 80px rgba(15,23,42,0.95)",
                    backdropFilter: "blur(24px)",
                    padding: "24px 32px",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* innerer Rand */}
                <div
                    style={{
                        pointerEvents: "none",
                        position: "absolute",
                        inset: 1,
                        borderRadius: 30,
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "inset 0 0 30px rgba(148,163,184,0.35)",
                    }}
                />

                {/* HEADER */}
                <header
                    style={{
                        position: "relative",
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "1.75rem",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                        }}
                    >
                        <div
                            style={{
                                height: "2.25rem",
                                width: "2.25rem",
                                borderRadius: "9999px",
                                backgroundImage:
                                    "linear-gradient(to bottom right, #22c55e, #a3e635, #22c55e)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.125rem",
                                boxShadow: "0 10px 25px rgba(74,222,128,0.7)",
                            }}
                        >
                            🎧
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                lineHeight: 1.1,
                            }}
                        >
              <span
                  style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.25em",
                      color: "rgba(224,242,254,0.7)",
                  }}
              >
                Interactive
              </span>
                            <span
                                style={{
                                    fontSize: "1.25rem",
                                    fontWeight: 600,
                                }}
                            >
                Music Library
              </span>
                        </div>
                    </div>

                    {/* Zurück-Button im Weather-Stil */}
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
                </header>

                {/* AKTUELLE TRACK‑INFOS + Datei-Auswahl */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "row",
                        gap: "1.5rem",
                        justifyContent: "space-between",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{
                                fontSize: "11px",
                                textTransform: "uppercase",
                                letterSpacing: "0.25em",
                                color: "rgba(226,232,240,0.7)",
                                marginBottom: "0.25rem",
                            }}
                        >
                            Aktueller Track
                        </div>
                        <div
                            style={{
                                fontSize: "1.4rem",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {activeTrack?.title}
                        </div>
                        <div
                            style={{
                                marginTop: "0.25rem",
                                fontSize: "0.75rem",
                                color: "rgba(203,213,225,0.8)",
                            }}
                        >
                            {customTrack ? "Benutzerdefinierte Datei" : "Playlist"}
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "0.5rem",
                        }}
                    >
                        <button
                            type="button"
                            onClick={openFileDialog}
                            style={{
                                backgroundColor: "#38bdf8",
                                padding: "0.5rem 1.4rem",
                                borderRadius: 9999,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "#020617",
                                boxShadow: "0 18px 45px rgba(56,189,248,0.95)",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                cursor: "pointer",
                                transition: "background-color 150ms ease",
                            }}
                            onMouseEnter={e =>
                                (e.currentTarget.style.backgroundColor = "#0ea5e9")
                            }
                            onMouseLeave={e =>
                                (e.currentTarget.style.backgroundColor = "#38bdf8")
                            }
                        >
                            <span>🎵</span>
                            <span>Eigene MP3 auswählen</span>
                        </button>

                        <input
                            type="file"
                            id="music-file-input"
                            accept=".mp3"
                            onChange={handleFileSelect}
                            style={{ display: "none" }}
                        />

                        {customTrack && (
                            <button
                                type="button"
                                onClick={() => setCustomTrack(null)}
                                style={{
                                    marginTop: "0.25rem",
                                    fontSize: "11px",
                                    padding: "0.25rem 0.9rem",
                                    borderRadius: 9999,
                                    backgroundColor: "rgba(15,23,42,0.85)",
                                    border: "1px solid rgba(71,85,105,0.9)",
                                    color: "#e5e7eb",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 10px rgba(15,23,42,0.6)",
                                    transition:
                                        "background-color 150ms ease, box-shadow 150ms ease",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = "rgba(30,64,175,0.9)";
                                    e.currentTarget.style.boxShadow =
                                        "0 6px 16px rgba(15,23,42,0.8)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor =
                                        "rgba(15,23,42,0.85)";
                                    e.currentTarget.style.boxShadow =
                                        "0 4px 10px rgba(15,23,42,0.6)";
                                }}
                            >
                                🔁 Zurück zur Playlist
                            </button>
                        )}
                    </div>
                </div>

                {/* PLAYLIST-LISTE */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        marginBottom: "1rem",
                        maxHeight: 140,
                        overflowY: "auto",
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                            gap: "0.5rem",
                        }}
                    >
                        {tracks.map((track, index) => {
                            const isActive = !customTrack && index === currentTrack;
                            return (
                                <button
                                    key={track.title}
                                    type="button"
                                    onClick={() => {
                                        setCustomTrack(null);
                                        setCurrentTrack(index);
                                    }}
                                    style={{
                                        width: "100%",
                                        textAlign: "left",
                                        padding: "0.5rem 0.75rem",
                                        borderRadius: 16,
                                        fontSize: "0.8rem",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        border: "none",
                                        cursor: "pointer",
                                        transition:
                                            "background-color 150ms ease, color 150ms ease, box-shadow 150ms ease",
                                        backgroundColor: isActive
                                            ? "rgba(56,189,248,0.8)"
                                            : "rgba(255,255,255,0.05)",
                                        color: isActive ? "#020617" : "#f9fafb",
                                        boxShadow: isActive
                                            ? "0 14px 35px rgba(56,189,248,0.9)"
                                            : "none",
                                    }}
                                >
                                    {track.title}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* PLAYER */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        marginTop: "auto",
                    }}
                >
                    <div
                        style={{
                            borderRadius: 20,
                            backgroundColor: "rgba(2,6,23,0.7)",
                            border: "1px solid rgba(71,85,105,0.7)",
                            boxShadow:
                                "0 22px 55px rgba(15,23,42,1), inset 0 1px 0 rgba(248,250,252,0.16)",
                            overflow: "hidden",
                        }}
                    >
                        <AudioPlayer
                            src={activeTrack?.src}
                            onEnded={handleNext}
                            showSkipControls={!customTrack}
                            showJumpControls={false}
                            onClickNext={handleNext}
                            onClickPrevious={handlePrevious}
                            autoPlayAfterSrcChange
                        />
                    </div>
                    <div
                        style={{
                            marginTop: "0.4rem",
                            fontSize: "11px",
                            textAlign: "center",
                            color: "rgba(226,232,240,0.7)",
                        }}
                    >
                        Playlist nutzt die Skip‑Buttons, eigene MP3 wird einzeln
                        abgespielt.
                    </div>
                </div>
            </div>
        </div>
    );
}