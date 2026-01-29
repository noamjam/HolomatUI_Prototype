import React, { useState, useEffect } from "react";

export default function BrowserApp({ onBack }) {
    const [url, setUrl] = useState("https://www.google.com");
    const [isLoading, setIsLoading] = useState(false);
    const [currentTitle, setCurrentTitle] = useState("New Tab");

    useEffect(() => {
        // BrowserView einblenden und Start-URL setzen
        window.electronAPI?.showBrowser?.();
        window.electronAPI?.setBrowserUrl?.("https://www.google.com");
        // Events vom Main-Prozess empfangen (Titel, Ladezustand)
        window.electronAPI?.onBrowserUpdate?.((payload) => {
            if (payload?.title) setCurrentTitle(payload.title);
            if (typeof payload.isLoading === "boolean") setIsLoading(payload.isLoading);
        });
        return () => {
            window.electronAPI?.hideBrowser?.();
            window.electronAPI?.clearBrowserListeners?.();
        };
    }, []);

    const handleGo = (e) => {
        e?.preventDefault?.();
        let target = url.trim();
        if (!target) return;
        // Wenn keine Schema, ein https:// davorhängen
        if (!/^https?:\/\//i.test(target)) {
            target = "https://" + target;
        }
        setUrl(target);
        window.electronAPI?.setBrowserUrl?.(target);
    };

    const handleBackClick = () => {
        window.electronAPI?.browserBack?.();
    };

    const handleForwardClick = () => {
        window.electronAPI?.browserForward?.();
    };

    const handleReload = () => {
        window.electronAPI?.browserReload?.();
    };

    const handleHomeClick = () => {
        // eigene Startseite definieren
        const homeUrl = "https://www.google.com";
        setUrl(homeUrl);
        window.electronAPI?.setBrowserUrl?.(homeUrl);
    };

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
                    width: 1460,
                    maxWidth: "100%",
                    height: 901,
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
                                    "linear-gradient(to bottom right, #38bdf8, #22c55e, #38bdf8)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.2rem",
                                boxShadow: "0 10px 25px rgba(34,197,94,0.8)",
                            }}
                        >
                            🌐
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
                Holomat
              </span>
                            <span
                                style={{
                                    fontSize: "1.25rem",
                                    fontWeight: 600,
                                }}
                            >
                Web Browser
              </span>
                            <span
                                style={{
                                    fontSize: "0.7rem",
                                    color: "rgba(148,163,184,0.9)",
                                    marginTop: "0.2rem",
                                }}
                            >
                {isLoading ? "Loading…" : currentTitle}
              </span>
                        </div>
                    </div>

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
                        <span>Back</span>
                    </button>
                </header>

                {/* MAIN CONTENT */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        minHeight: 0,
                        gap: "0.75rem",
                    }}
                >
                    {/* Adressleiste + Navigation */}
                    <form
                        onSubmit={handleGo}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            borderRadius: 22,
                            backgroundColor: "rgba(15,23,42,0.7)",
                            border: "1px solid rgba(71,85,105,0.8)",
                            padding: "0.4rem 0.75rem",
                        }}
                    >
                        <button
                            type="button"
                            onClick={handleBackClick}
                            style={navBtnStyle}
                        >
                            ◀
                        </button>
                        <button
                            type="button"
                            onClick={handleForwardClick}
                            style={navBtnStyle}
                        >
                            ▶
                        </button>
                        <button
                            type="button"
                            onClick={handleReload}
                            style={navBtnStyle}
                        >
                            ⟳
                        </button>
                        <button
                            type="button"
                            onClick={handleHomeClick}
                            style={navBtnStyle}
                        >
                            ⌂
                        </button>

                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Enter URL..."
                            style={{
                                flex: 1,
                                borderRadius: 9999,
                                border: "1px solid rgba(148,163,184,0.8)",
                                backgroundColor: "rgba(15,23,42,0.9)",
                                color: "#e5e7eb",
                                fontSize: "0.85rem",
                                padding: "0.4rem 0.9rem",
                                outline: "none",
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                borderRadius: 9999,
                                border: "none",
                                backgroundImage:
                                    "linear-gradient(to right, #38bdf8, #22c55e)",
                                color: "#020617",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                padding: "0.4rem 1.1rem",
                                cursor: "pointer",
                                boxShadow: "0 10px 25px rgba(56,189,248,0.9)",
                            }}
                        >
                            Go
                        </button>
                    </form>

                    {/* BrowserView-Bereich */}
                    <div
                        style={{
                            flex: 1,
                            position: "relative",
                            borderRadius: 5,
                            border: "4px solid rgba(56,189,248,0.9)", // cyan border
                            boxShadow: "0 0 25px rgba(56,189,248,0.55)",
                            overflow: "visible", // schneidet Ecken weich ab
                            backgroundColor: "transparent",
                        }}
                    >
                    </div>
                </div>
            </div>
        </div>
    );
}

const navBtnStyle = {
    borderRadius: 9999,
    border: "1px solid rgba(148,163,184,0.6)",
    backgroundColor: "rgba(15,23,42,0.9)",
    color: "#e5e7eb",
    fontSize: "0.75rem",
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
};
