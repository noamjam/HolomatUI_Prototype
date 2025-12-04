import React, { useEffect, useState } from "react";


const initialPresets = [
    { name: "Wien", lat: 48.20849, lon: 16.37208 },
    { name: "Berlin", lat: 52.52, lon: 13.405 },
    { name: "London", lat: 51.509865, lon: -0.118092 },
    { name: "New York", lat: 40.7128, lon: -74.0060 }
];

export default function WeatherApp({ onBack }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [presets, setPresets] = useState(initialPresets);
    const [selectedPreset, setSelectedPreset] = useState(initialPresets[0]);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [searchCity, setSearchCity] = useState("");
    const [searchResult, setSearchResult] = useState(null);


// Wetter vom ausgewählten Ort abrufen
    useEffect(() => {
        if (!selectedPreset) return;
        setLoading(true);
        setError(null);

        const { lat, lon } = selectedPreset;
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto`)
            .then(res => res.json())
            .then(data => {
                setWeather({
                    current: data.current_weather,
                    daily: data.daily
                });
                setLoading(false);
            })
            .catch(err => {
                setError("Fehler beim Abrufen der Wetterdaten!");
                setWeather(null);
                setLoading(false);
            });
    }, [selectedPreset]);

    function getSuggestedCityFromIpLocation(ipData) {
        const { city, country } = ipData;

// Österreich-spezifische Heuristik
        if (country === "Austria") {
// Steiermark
            if (city && /graz|frohnleiten|bruck an der mur|leoben/i.test(city)) {
                return { name: "Graz", lat: 47.0707, lon: 15.4395 };
            }
// Niederösterreich (Beispiele)
            if (city && /st\.? p[oö]lten|krems|tulln|amstetten/i.test(city)) {
                return { name: "St. Pölten", lat: 48.2043, lon: 15.6254 };
            }
// Wien und Umfeld
            if (city && /wien|klosterneuburg|bruck an der leitha/i.test(city)) {
                return { name: "Wien", lat: 48.20849, lon: 16.37208 };
            }
        }
// Fallback: einfach IP-Stadt selbst verwenden
        return null;
    }

    const handleUseMyLocation = async () => {
        if (!window.electronAPI?.getApproxLocation) {
            setError("Standort-Ermittlung ist in dieser Umgebung nicht verfügbar.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const ipData = await window.electronAPI.getApproxLocation(); // {lat, lon, city, country}

            if (!ipData) {
                setError("Konnte ungefähren Standort nicht bestimmen.");
                setLoading(false);
                return;
            }

// Vorschlag
            const suggestedCity = getSuggestedCityFromIpLocation(ipData);

            let finalLocation;

            if (suggestedCity) {
                const useSuggested = window.confirm(
                    `Ihr ungefährer Standort wurde als ${ipData.city || "unbekannt"} erkannt.\n` +
                    `Möchten Sie stattdessen die nächstgrößere Stadt verwenden? (Vorschlag: ${suggestedCity.name})`
                );

                if (useSuggested) {
                    finalLocation = suggestedCity;
                } else {
                    finalLocation = {
                        name: ipData.city
                            ? `${ipData.city} (${ipData.country})`
                            : "Mein Standort (IP)",
                        lat: ipData.lat,
                        lon: ipData.lon,
                    };
                }
            } else {
// Kein spezieller Vorschlag -> IP-Daten direkt nutzen
                finalLocation = {
                    name: ipData.city
                        ? `${ipData.city} (${ipData.country})`
                        : "Mein Standort (IP)",
                    lat: ipData.lat,
                    lon: ipData.lon,
                };
            }

            setSelectedPreset(finalLocation);
// Optional: in Presets aufnehmen
// setPresets(prev => [...prev, finalLocation]);

        } catch (e) {
            console.error(e);
            setError("Fehler beim Ermitteln des ungefähren Standorts.");
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
    return (
        <div
            style={{
                height: "100%",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                overflow: "hidden",
                backgroundImage:
                    "radial-gradient(circle at top, #38bdf8 0, #0f172a 55%, #020617 100%)",
                color: "#e2e8f0",
            }}
        >
            <aside
                style={{
                    flexShrink: 0,
                    overflow: "hidden",
                    transitionProperty: "width",
                    transitionDuration: "300ms",
                    transitionTimingFunction: "ease-in-out",
                    width: isSidebarOpen ? "16rem" : "3rem",
                    backgroundColor: "rgba(2,6,23,0.7)",
                    backdropFilter: "blur(24px)",
                    borderRight: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 25px 80px rgba(15,23,42,0.95)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <button
                    onClick={() => setIsSidebarOpen(o => !o)}
                    style={{
                        margin: "0.75rem",
                        marginBottom: "1rem",
                        display: "inline-flex",
                        height: "2.25rem",
                        width: "2.25rem",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "1rem",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                    }}
                >
                    {isSidebarOpen ? "⟨" : "⟩"}
                </button>

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

                {/* Suche + Hinzufügen in der Sidebar */}
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
                            color: "black",
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
                                ((e.currentTarget.style.backgroundColor = "#0ea5e9"))
                            }
                            onMouseOut={e =>
                                ((e.currentTarget.style.backgroundColor = "#38bdf8"))
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
                                    ((e.currentTarget.style.backgroundColor = "#22c55e"))
                                }
                                onMouseOut={e =>
                                    ((e.currentTarget.style.backgroundColor = "#34d399"))
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

            {/* RECHTE SEITE: WEATHER-CARD */}
            <div
                style={{
                    display: "flex",
                    flex: 1,
                    alignItems: "center",
                    padding: "1.5rem",
                }}
            >
                <div
                    style={{
                        width: 1020,
                        height: 860,
                        marginRight: 40,
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
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                borderRadius: "9999px",
                                backgroundColor: "rgba(15,23,42,0.7)",
                                padding: "0.375rem 1rem",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                border: "1px solid rgba(100,116,139,0.7)",
                                boxShadow:
                                    "0 10px 25px rgba(15,23,42,0.9), inset 0 1px 0 rgba(148,163,184,0.4)",
                                backdropFilter: "blur(16px)",
                                color: "#e5e7eb",
                                cursor: "pointer",
                                transition: "background-color 150ms ease",
                            }}
                            onMouseOver={e =>
                                ((e.currentTarget.style.backgroundColor = "#0f172a"))
                            }
                            onMouseOut={e =>
                                ((e.currentTarget.style.backgroundColor = "rgba(15,23,42,0.7)"))
                            }
                            onClick={onBack}
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
                    {weather && (
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
                                        ((e.currentTarget.style.backgroundColor = "#0ea5e9"))
                                    }
                                    onMouseOut={e =>
                                        ((e.currentTarget.style.backgroundColor = "#38bdf8"))
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