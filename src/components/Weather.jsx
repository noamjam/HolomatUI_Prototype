import React, { useEffect, useState } from "react";


const initialPresets = [
    { name: "Wien", lat: 48.20849, lon: 16.37208 },
    { name: "Berlin", lat: 52.52, lon: 13.405 },
    { name: "London", lat: 51.509865, lon: -0.118092 },
    { name: "New York", lat: 40.7128, lon: -74.0060 }
];

export default function WeatherApp({ onBack }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [presets, setPresets] = useState(() => {
        const stored = localStorage.getItem("weather-presets");
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                // Falls kaputt: auf Default zurück
                return initialPresets;
            }
        }
        return initialPresets;
    });
    useEffect(() => {
        localStorage.setItem("weather-presets", JSON.stringify(presets));
    }, [presets]);
    const [selectedPreset, setSelectedPreset] = useState(initialPresets[0]);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [searchCity, setSearchCity] = useState("");
    const [searchResult, setSearchResult] = useState(null);


// Wetter vom ausgewählten Ort abrufen
    useEffect(() => {
        if (!selectedPreset) return;

        console.log("selectedPreset =", selectedPreset);

        const { lat, lon } = selectedPreset;
        if (lat == null || lon == null) {
            console.warn("selectedPreset ohne gültige Koordinaten, breche ab.");
            return;
        }

        setLoading(true);
        setError(null);

        fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
            `&current_weather=true` +
            `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode` +
            `&timezone=auto&forecast_days=8`,
        )
            .then(res => res.json())
            .then(data => {
                setWeather({
                    current: data.current_weather,
                    daily: data.daily,
                });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError("Fehler beim Abrufen der Wetterdaten!");
                setWeather(null);
                setLoading(false);
            });
    }, [selectedPreset]);

    const handleUseMyLocation = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("https://ipapi.co/json/");
            if (!res.ok) {
                throw new Error("IP-Location API error: " + res.status);
            }
            const data = await res.json();
            console.log("ipapi data:", data);

            const lat = data.latitude;
            const lon = data.longitude;

            if (lat == null || lon == null) {
                setError("Konnte ungefähren Standort aus IP nicht bestimmen.");
                setLoading(false);
                return;
            }

            const finalLocation = {
                name: data.city
                    ? `${data.city} (${data.country_name || data.country})`
                    : "Mein Standort (IP)",
                lat,
                lon,
            };

            setSelectedPreset(finalLocation);
        } catch (e) {
            console.error("IP-Geo error:", e);
            setError("Fehler beim Ermitteln des ungefähren Standorts über IP.");
        } finally {
            setLoading(false);
        }
    };
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchCity) return;

        setLoading(true);
        setError(null);

// Open-Meteo Geocoding API
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity)}&count=1`;
        const res = await fetch(geoUrl).then(r => r.json());

        if (res.results && res.results.length > 0) {
            const city = res.results[0];
            setSelectedPreset({ name: city.name, lat: city.latitude, lon: city.longitude });
            setSearchResult(city);
        } else {
            setError("Stadt nicht gefunden!");
        }
        setLoading(false);
    };
// add button
    const handleAddPreset = () => {
        if (!searchResult) return;
// Prüfen ob Stadt schon existiert
        const alreadyPreset = presets.some(p =>
            p.name === searchResult.name &&
            Math.abs(p.lat - searchResult.latitude) < 0.0001 &&
            Math.abs(p.lon - searchResult.longitude) < 0.0001
        );
        if (alreadyPreset) {
            alert("Dieser Ort ist bereits in den Presets!");
            return;
        }
        setPresets([...presets, {
            name: searchResult.name,
            lat: searchResult.latitude,
            lon: searchResult.longitude
        }]);
        setSearchResult(null);
        setSearchCity("");
    };
    function getBackgroundStyleForWeather(code) {
        if (code == null) {
            return {
                backgroundImage:
                    "radial-gradient(circle at top, #38bdf8 0, #0f172a 55%, #020617 100%)",
            };
        }

        // Klar / Sonne
        if (code === 0 || code === 1) {
            return {
                backgroundImage:
                    "radial-gradient(circle at top, #fbbf24 0%, #f59e0b 35%, #ea580c 60%, #020617 100%)",
            };
        }

        // Nebel (45, 48)
        if (code === 45 || code === 48) {
            return {
                backgroundImage:
                    "radial-gradient(circle at top, #9ca3af 0, #4b5563 40%, #020617 100%)",
            };
        }

        // Teils bewölkt / bewölkt
        if (code === 2 || code === 3) {
            return {
                backgroundImage:
                    "radial-gradient(circle at top, #64748b 0, #020617 60%, #000000 100%)",
            };
        }

        // Regen / Schauer (51–67, 80–82)
        if (
            (code >= 51 && code <= 67) || // Niesel + Regen
            (code >= 80 && code <= 82)   // Regenschauer
        ) {
            return {
                backgroundImage:
                    "radial-gradient(circle at top, #0ea5e9 0, #1d4ed8 45%, #020617 100%)",
                animation: "rain-pulse 4s infinite",
            };
        }

        // Gewitter
        if (code === 95 || code === 96 || code === 99) {
            return {
                backgroundImage:
                    "radial-gradient(circle at top, #1e293b 0, #020617 60%, #000000 100%)",
            };
        }

        // Standard
        return {
            backgroundImage:
                "radial-gradient(circle at top, #38bdf8 0, #0f172a 55%, #020617 100%)",
        };
    }
    const weatherCode = weather?.current?.weathercode ?? null;
    const isRain =
        (weatherCode >= 51 && weatherCode <= 67) ||
        (weatherCode >= 80 && weatherCode <= 82);

    const raindrops = isRain
        ? Array.from({ length: 40 }, (_, i) => {
            const left = Math.random() * 100;          // % von links
            const delay = Math.random() * 1.5;
            const duration = 1 + Math.random() * 2;
            return { id: i, left, delay, duration };
        })
        : [];
    return (
        <div
            style={{
                height: "100%",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                overflow: "hidden",
                color: "#e2e8f0",
                position: "relative",
                transition: "background-image 500ms ease-in-out",
                ...getBackgroundStyleForWeather(weatherCode),
            }}
        >
            {isRain && (
                <div className="rain-overlay">
                    {raindrops.map((drop) => (
                        <div
                            key={drop.id}
                            className="raindrop"
                            style={{
                                left: `${drop.left}vw`,
                                top: "-40px",
                                animationDuration: `${drop.duration}s`,
                                animationDelay: `${drop.delay}s`,
                            }}
                        />
                    ))}
                </div>
            )}
            {/* Toggle-Button – NICHT in der Sidebar */}
            <button
                onClick={() => setIsSidebarOpen(o => !o)}
                style={{
                    position: "absolute",
                    top: "0.75rem",
                    left: "0.75rem",        // feste Position, NICHT von isSidebarOpen abhängig
                    zIndex: 50,
                    display: "inline-flex",
                    height: "2.25rem",
                    width: "2.25rem",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "1rem",
                    backgroundColor: "rgba(15,23,42,0.9)",
                    border: "1px solid rgba(255,255,255,0.4)",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                }}
            >
                {isSidebarOpen ? "←" : "→"}
            </button>
            {/* SIDEBAR */}
            <aside
                style={{
                    flexShrink: 0,
                    overflow: "hidden",
                    transitionProperty: "width",
                    transitionDuration: "300ms",
                    transitionTimingFunction: "ease-in-out",
                    width: isSidebarOpen ? "16rem" : "0rem",
                    backgroundColor: "rgba(2,6,23,0.7)",
                    backdropFilter: "blur(24px)",
                    borderRight: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 25px 80px rgba(15,23,42,0.95)",
                    display: "flex",
                    flexDirection: "column",
                    paddingTop: "3.5rem"
                }}
            >
                {/* Städte-Liste */}
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        paddingLeft: "0.5rem",
                        paddingRight: "0.5rem",
                        paddingBottom: "1rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                    }}
                >
                    {presets.map(city => {
                        const isActive = selectedPreset?.name === city.name;
                        return (
                            <button
                                key={city.name}
                                onClick={() => setSelectedPreset(city)}
                                style={{
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "0.5rem 0.75rem",
                                    borderRadius: "1rem",
                                    fontSize: "0.875rem",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    transition:
                                        "background-color 150ms ease, color 150ms ease, box-shadow 150ms ease",
                                    backgroundColor: isActive
                                        ? "rgba(56,189,248,0.8)"
                                        : "rgba(255,255,255,0.05)",
                                    color: isActive ? "#020617" : "#f9fafb",
                                    boxShadow: isActive
                                        ? "0 14px 35px rgba(56,189,248,0.9)"
                                        : "none",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                {isSidebarOpen ? city.name : city.name[0]}
                            </button>
                        );
                    })}
                </div>

                {/* Suche + Hinzufügen */}
                <form
                    onSubmit={handleSearch}
                    style={{
                        paddingLeft: "0.75rem",
                        paddingRight: "0.75rem",
                        paddingBottom: "0.75rem",
                        paddingTop: "0.75rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Suche Stadt..."
                        value={searchCity}
                        onChange={e => setSearchCity(e.target.value)}
                        style={{
                            paddingLeft: "0.75rem",
                            paddingRight: "0.75rem",
                            paddingTop: "0.5rem",
                            paddingBottom: "0.5rem",
                            borderRadius: "1rem",
                            border: "1px solid rgba(255,255,255,0.2)",
                            backgroundColor: "rgba(15,23,42,0.8)",
                            fontSize: "0.875rem",
                            color: "white",
                            outline: "none",
                        }}
                    />
                    <div
                        style={{
                            display: "flex",
                            gap: "0.5rem",
                        }}
                    >
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                backgroundColor: "#38bdf8",
                                padding: "0.5rem 0.75rem",
                                borderRadius: "1rem",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "#020617",
                                boxShadow: "0 4px 6px rgba(15,23,42,0.4)",
                                border: "none",
                                cursor: "pointer",
                                transition: "background-color 150ms ease",
                            }}
                            onMouseOver={e =>
                                (e.currentTarget.style.backgroundColor = "#0ea5e9")
                            }
                            onMouseOut={e =>
                                (e.currentTarget.style.backgroundColor = "#38bdf8")
                            }
                        >
                            Suchen
                        </button>
                        {searchResult && (
                            <button
                                type="button"
                                onClick={handleAddPreset}
                                style={{
                                    flex: 1,
                                    backgroundColor: "#34d399",
                                    padding: "0.5rem 0.75rem",
                                    borderRadius: "1rem",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    color: "#020617",
                                    boxShadow: "0 4px 6px rgba(15,23,42,0.4)",
                                    border: "none",
                                    cursor: "pointer",
                                    transition: "background-color 150ms ease",
                                }}
                                onMouseOver={e =>
                                    (e.currentTarget.style.backgroundColor = "#22c55e")
                                }
                                onMouseOut={e =>
                                    (e.currentTarget.style.backgroundColor = "#34d399")
                                }
                            >
                                Hinzufügen
                            </button>
                        )}
                    </div>
                    {searchResult && (
                        <div
                            style={{
                                marginTop: "0.25rem",
                                fontSize: "11px",
                                color: "#a7f3d0",
                                textAlign: "center",
                            }}
                        >
                            Gefunden: {searchResult.name}
                            {searchResult.country ? `, ${searchResult.country}` : ""}
                        </div>
                    )}
                </form>
            </aside>

            {/* RECHTE SEITE: CARD */}
            <div
                style={{
                    display: "flex",
                    flex: 1,
                    alignItems: "center",       // vertikal mittig
                    justifyContent: "center",
                    padding: "1.5rem",
                }}
            >
                <div
                    style={{
                        width: isSidebarOpen ? 1020 : 1200,
                        height: 860,
                        marginRight: isSidebarOpen ? 40 : 0,
                        marginTop: 24,
                        marginBottom: 24,
                        flexShrink: 0,
                        position: "relative",
                        borderRadius: 32,
                        backgroundColor: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        boxShadow: "0 30px 80px rgba(15,23,42,0.95)",
                        backdropFilter: "blur(24px)",
                        padding: "1.5rem 2rem",
                        overflow: "hidden",
                    }}
                >
                    {/* innerer Glas-Rand */}
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

                    {/* HEADERBAR */}
                    <header
                        style={{
                            position: "relative",
                            zIndex: 10,
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "2rem",
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
                                        "linear-gradient(to bottom right, #fbbf24, #facc15, #f97316)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.125rem",
                                    boxShadow: "0 10px 25px rgba(251,191,36,0.7)",
                                }}
                            >
                                ☀️
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
                                        fontSize: "1.125rem",
                                        fontWeight: 600,
                                    }}
                                >
                  Weather
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

                    {/* STATUS */}
                    {loading && (
                        <div
                            style={{
                                position: "relative",
                                zIndex: 10,
                                textAlign: "center",
                                fontSize: "0.875rem",
                                color: "rgba(241,245,249,0.8)",
                                marginBottom: "0.5rem",
                            }}
                        >
                            Lade Wetterdaten...
                        </div>
                    )}
                    {error && (
                        <div
                            style={{
                                position: "relative",
                                zIndex: 10,
                                textAlign: "center",
                                fontSize: "0.875rem",
                                color: "#fecaca",
                                marginBottom: "0.5rem",
                            }}
                        >
                            {error}
                        </div>
                    )}
                    {/* WETTER-INHALT */}
                    {weather && weather.current && (
                        <div
                            style={{
                                position: "relative",
                                zIndex: 10,
                            }}
                        >
                            {/* aktuelle Stadt + Temperatur */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    textAlign: "center",
                                    marginBottom: "1.5rem",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "0.75rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.25em",
                                        color: "rgba(241,245,249,0.8)",
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    {selectedPreset.name}
                                </div>
                                <div
                                    style={{
                                        marginBottom: "0.75rem",
                                        display: "flex",
                                        alignItems: "flex-end",
                                        gap: "0.5rem",
                                        borderRadius: 26,
                                        backgroundColor: "rgba(2,6,23,0.5)",
                                        border: "1px solid rgba(100,116,139,0.6)",
                                        boxShadow:
                                            "0 22px 55px rgba(15,23,42,1), inset 0 1px 0 rgba(248,250,252,0.16)",
                                        padding: "0.75rem 1.5rem",
                                    }}
                                >
                  <span
                      style={{
                          fontSize: "4rem",
                          fontWeight: 600,
                          lineHeight: 1,
                      }}
                  >
                    {weather.current.temperature}°C
                  </span>
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "rgba(241,245,249,0.85)",
                                    }}
                                >
                                    Wind: {weather.current.windspeed} km/h
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "rgba(241,245,249,0.85)",
                                    }}
                                >
                                    Wetter: {translateWeatherCode(weather.current.weathercode)}
                                </div>
                                <div
                                    style={{
                                        marginTop: "0.25rem",
                                        fontSize: "11px",
                                        color: "rgba(226,232,240,0.7)",
                                    }}
                                >
                                    Letztes Update um {weather.current.time}
                                </div>
                            </div>

                            {/* Standort-Button */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    marginBottom: "1rem",
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    Standort
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleUseMyLocation}
                                    style={{
                                        backgroundColor: "#38bdf8",
                                        padding: "0.5rem 1.25rem",
                                        borderRadius: "9999px",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        color: "#020617",
                                        boxShadow: "0 18px 45px rgba(56,189,248,0.95)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        border: "none",
                                        cursor: "pointer",
                                        transition: "background-color 150ms ease",
                                    }}
                                    onMouseOver={e =>
                                        (e.currentTarget.style.backgroundColor = "#0ea5e9")
                                    }
                                    onMouseOut={e =>
                                        (e.currentTarget.style.backgroundColor = "#38bdf8")
                                    }
                                >
                                    <span>📍</span>
                                    <span>Ungefähreren Standort finden</span>
                                </button>
                            </div>

                            {/* Tageswerte-Kacheln */}
                            {weather.daily && (
                                <div
                                    style={{
                                        marginTop: "1rem",
                                        display: "grid",
                                        gridTemplateColumns: "repeat(4, minmax(0,1fr))",
                                        gap: "0.75rem",
                                    }}
                                >
                                    {/* Höchst */}
                                    <div
                                        style={{
                                            backgroundColor: "rgba(2,6,23,0.6)",
                                            borderRadius: "1rem",
                                            padding: "0.75rem 1rem",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                            border: "1px solid rgba(71,85,105,0.7)",
                                            boxShadow:
                                                "0 18px 40px rgba(15,23,42,0.95), inset 0 1px 0 rgba(248,250,252,0.14)",
                                        }}
                                    >
                    <span
                        style={{
                            fontSize: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.22em",
                            color: "rgba(203,213,225,0.8)",
                        }}
                    >
                      Höchst
                    </span>
                                        <span
                                            style={{
                                                marginTop: "0.25rem",
                                                fontSize: "1.25rem",
                                                fontWeight: 600,
                                            }}
                                        >
                      {weather.daily.temperature_2m_max[0]}°C
                    </span>
                                    </div>

                                    {/* Tiefst */}
                                    <div
                                        style={{
                                            backgroundColor: "rgba(2,6,23,0.6)",
                                            borderRadius: "1rem",
                                            padding: "0.75rem 1rem",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                            border: "1px solid rgba(71,85,105,0.7)",
                                            boxShadow:
                                                "0 18px 40px rgba(15,23,42,0.95), inset 0 1px 0 rgba(248,250,252,0.14)",
                                        }}
                                    >
                    <span
                        style={{
                            fontSize: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.22em",
                            color: "rgba(203,213,225,0.8)",
                        }}
                    >
                      Tiefst
                    </span>
                                        <span
                                            style={{
                                                marginTop: "0.25rem",
                                                fontSize: "1.25rem",
                                                fontWeight: 600,
                                            }}
                                        >
                      {weather.daily.temperature_2m_min[0]}°C
                    </span>
                                    </div>
                                    {/* Max. Wind */}
                                    <div
                                        style={{
                                            backgroundColor: "rgba(2,6,23,0.6)",
                                            borderRadius: "1rem",
                                            padding: "0.75rem 1rem",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                            border: "1px solid rgba(71,85,105,0.7)",
                                            boxShadow:
                                                "0 18px 40px rgba(15,23,42,0.95), inset 0 1px 0 rgba(248,250,252,0.14)",
                                        }}
                                    >
                    <span
                        style={{
                            fontSize: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.22em",
                            color: "rgba(203,213,225,0.8)",
                        }}
                    >
                      Max. Wind
                    </span>
                                        <span
                                            style={{
                                                marginTop: "0.25rem",
                                                fontSize: "1.25rem",
                                                fontWeight: 600,
                                            }}
                                        >
                      {weather.daily.windspeed_10m_max[0]} km/h
                    </span>
                                    </div>

                                    {/* Regen heute */}
                                    <div
                                        style={{
                                            backgroundColor: "rgba(2,6,23,0.6)",
                                            borderRadius: "1rem",
                                            padding: "0.75rem 1rem",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                            border: "1px solid rgba(71,85,105,0.7)",
                                            boxShadow:
                                                "0 18px 40px rgba(15,23,42,0.95), inset 0 1px 0 rgba(248,250,252,0.14)",
                                        }}
                                    >
                    <span
                        style={{
                            fontSize: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.22em",
                            color: "rgba(203,213,225,0.8)",
                        }}
                    >
                      Regen heute
                    </span>
                                        <span
                                            style={{
                                                marginTop: "0.25rem",
                                                fontSize: "1.25rem",
                                                fontWeight: 600,
                                            }}
                                        >
                      {weather.daily.precipitation_sum[0]} mm
                    </span>
                                    </div>
                                </div>
                            )}

                            {/* MEHRTAGES-VORHERSAGE */}
                            {weather.daily && (
                                <div
                                    style={{
                                        marginTop: "1.75rem",
                                        padding: "0.75rem 0.5rem",
                                        borderRadius: 24,
                                        backgroundColor: "rgba(15,23,42,0.7)",
                                        border: "1px solid rgba(51,65,85,0.9)",
                                        boxShadow:
                                            "0 18px 40px rgba(15,23,42,0.95), inset 0 1px 0 rgba(148,163,184,0.18)",
                                        overflowX: "auto",
                                        display: "flex",
                                        gap: "0.75rem",
                                    }}
                                >
                                    {weather.daily.time.slice(0, 8).map((dateStr, index) => {
                                        if (index === 0) return null;

                                        const max = weather.daily.temperature_2m_max[index];
                                        const min = weather.daily.temperature_2m_min[index];
                                        const code = weather.daily.weathercode
                                            ? weather.daily.weathercode[index]
                                            : null;

                                        const globalMin = -5;
                                        const globalMax = 35;
                                        const span = globalMax - globalMin;
                                        const startPct = ((min - globalMin) / span) * 100;
                                        const endPct = ((max - globalMin) / span) * 100;

                                        let barColor = "rgba(56,189,248,0.8)";
                                        if (max >= 25) barColor = "rgba(248,113,113,0.9)";
                                        else if (max >= 15) barColor = "rgba(96,165,250,0.9)";

                                        const dayLabel = new Date(dateStr).toLocaleDateString(
                                            "de-DE",
                                            { weekday: "short" },
                                        );

                                        return (
                                            <div
                                                key={dateStr}
                                                style={{
                                                    minWidth: 120,
                                                    borderRadius: 18,
                                                    padding: "0.6rem 0.7rem",
                                                    backgroundColor: "rgba(15,23,42,0.9)",
                                                    border: "1px solid rgba(71,85,105,0.9)",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "0.35rem",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: "11px",
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.16em",
                                                        color: "rgba(148,163,184,0.9)",
                                                    }}
                                                >
                                                    {dayLabel}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "0.78rem",
                                                        color: "rgba(226,232,240,0.9)",
                                                        minHeight: "1.5rem",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "0.35rem",
                                                    }}
                                                >
                                                    {code != null ? (
                                                        <>
                                                            <span>{getWeatherEmoji(code)}</span>
                                                            <span style={{ opacity: 0.85 }}>
                                                            {translateWeatherCode(code)}
                                                          </span>
                                                        </>
                                                    ) : (
                                                        "–"
                                                    )}
                                                </div>

                                                {/* Temp-Balken */}
                                                <div
                                                    style={{
                                                        position: "relative",
                                                        height: 16,
                                                        borderRadius: 9999,
                                                        background:
                                                            "linear-gradient(90deg, rgba(15,23,42,1), rgba(15,23,42,0.6))",
                                                        overflow: "hidden",
                                                        marginTop: "0.2rem",
                                                        marginBottom: "0.1rem",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            inset: 0,
                                                            background:
                                                                "linear-gradient(90deg, #0f172a 0%, #1d4ed8 35%, #f97316 70%, #b91c1c 100%)",
                                                            opacity: 0.18,
                                                        }}
                                                    />
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            top: 0,
                                                            bottom: 0,
                                                            left: `${Math.max(0, startPct)}%`,
                                                            width: `${Math.max(
                                                                5,
                                                                endPct - startPct,
                                                            )}%`,
                                                            backgroundColor: barColor,
                                                            boxShadow:
                                                                "0 0 10px rgba(59,130,246,0.8)",
                                                        }}
                                                    />
                                                </div>

                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        fontSize: "0.75rem",
                                                        color: "rgba(226,232,240,0.9)",
                                                    }}
                                                >
                          <span style={{ opacity: 0.9 }}>
                            {Math.round(min)}°C
                          </span>
                                                    <span style={{ opacity: 0.9 }}>
                            {Math.round(max)}°C
                          </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div
                        style={{
                            position: "relative",
                            zIndex: 10,
                            marginTop: "1.5rem",
                            textAlign: "center",
                            fontSize: "11px",
                            color: "rgba(226,232,240,0.7)",
                        }}
                    >
                        © 2025 Interactive Workbench — Credit to Open-Meteo.com Integration
                    </div>
                </div>
            </div>
        </div>
    );
}

function getWeatherEmoji(code) {
    if (code === 0) return "☀️";                  // klar
    if (code === 1 || code === 2) return "🌤️";    // meist klar / teils bewölkt
    if (code === 3) return "☁️";                  // bewölkt
    if (code === 45 || code === 48) return "🌫️"; // Nebel
    if (code >= 51 && code <= 55) return "🌦️";    // Niesel
    if (code >= 61 && code <= 65) return "🌧️";    // Regen
    if (code >= 71 && code <= 77) return "🌨️";    // Schnee
    if (code >= 80 && code <= 82) return "🌧️";    // Regenschauer
    if (code >= 95) return "⛈️";                 // Gewitter
    return "�";                                  // Fallback
}

function translateWeatherCode(code) {
// Die wichtigsten Codes laut API-Doku
    const weatherCodes = {
        0: "Klar/Sonne",
        1: "Hauptsächlich klar",
        2: "Teilweise bewölkt",
        3: "Bewölkt",
        45: "Nebel",
        48: "Frostiger Nebel",
        51: "Leichter Nieselregen",
        53: "Mäßiger Nieselregen",
        55: "Starker Nieselregen",
        61: "Leichter Regen",
        63: "Mäßiger Regen",
        65: "Starker Regen",
        80: "Regen-Schauer",
        95: "Gewitter",
// ... ergänzbar!
    };
    return weatherCodes[code] || `Code${code}`;
};