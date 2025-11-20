import React, { useEffect, useState } from "react";


const initialPresets = [
    { name: "Wien", lat: 48.20849, lon: 16.37208 },
    { name: "Berlin", lat: 52.52, lon: 13.405 },
    { name: "London", lat: 51.509865, lon: -0.118092 },
    { name: "New York", lat: 40.7128, lon: -74.0060 }
];

export default function WeatherApp({ onBack }) {
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
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
    .then(res => res.json())
            .then(data => {
                setWeather(data.current_weather);
                setLoading(false);
            })
            .catch(err => {
                setError("Fehler beim Abrufen der Wetterdaten!");
                setWeather(null);
                setLoading(false);
            });
    }, [selectedPreset]);

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
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-blue-700 via-blue-300 to-white text-black p-4">
            <button
                className="bg-cyan-700 px-3 py-2 rounded text-white mb-4"
                onClick={onBack}
            >⬅ Zurück</button>

            <h2 className="text-2xl font-bold mb-6">Wetter</h2>

            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Suche beliebige Stadt..."
                    value={searchCity}
                    onChange={e => setSearchCity(e.target.value)}
                    className="px-3 py-1 rounded border border-gray-400 text-black"
                    style={{ color: 'black', minWidth: 180 }}
                />
                <button
                    type="submit"
                    className="bg-orange-500 px-4 py-1 rounded text-white font-bold"
                >Suchen</button>
                {searchResult && (
                    <button
                        type="button"
                        className="bg-green-600 px-3 py-1 rounded text-white font-bold"
                        onClick={handleAddPreset}
                    >
                        Hinzufügen
                    </button>
                )}
            </form>

            {searchResult && (
                <div className="mb-2 text-green-700 text-sm">
                    Gefunden: {searchResult.name}{searchResult.country ? `, ${searchResult.country} `: ""}
                </div>
            )}
            <label htmlFor="city-select" className="font-bold">
                Ort:
                <br />
                <select
                    id="city-select"
                    value={selectedPreset.name}
                    onChange={e => {
                        const preset = presets.find(p => p.name === e.target.value);
                        setSelectedPreset(preset);
                    }}
                    className="px-2 py-1 rounded border-2 border-orange-400 font-semibold "
                    style={{color: 'black', minWidth: 120 }}
                >
                    {presets.map(preset => (
                        <option key={preset.name} value={preset.name} className={"text-black"}>
                            {preset.name}
                        </option>
                    ))}
                </select>
            </label>

            {loading && <div>Lade Wetterdaten...</div>}
            {error && <div className="text-red-600">{error}</div>}

            {weather && (
                <div className="bg-white/80 rounded-lg p-6 mt-2 shadow-lg">
                    <div className="text-xl font-semibold mb-2">
                        {selectedPreset.name}
                    </div>
                    <div className="text-4xl font-bold mb-1">
                        {weather.temperature}°C
                    </div>
                    <div className="mb-1">
                        Wind: {weather.windspeed} km/h
                    </div>
                    <div className="mb-1">
                        Wetter: {translateWeatherCode(weather.weathercode)}
                    </div>
                    <div className="mb-1">
                        Letztes Update um {weather.time}
                    </div>
                    {/* Footer */}
                    <div className="text-center text-gray-400 text-xs mb-4">
                        © 2025 Interactive Workbench — Credit to Open-Meteo.com Integration
                    </div>
                </div>
            )}

            {/* Für spätere Erweiterung: Suchfeld für Orte */}
        </div>
    );
}

// Hilfsfunktion: Open-Meteo WeatherCode übersetzen
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
}