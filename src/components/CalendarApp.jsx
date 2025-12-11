import React, { useState, useEffect } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonthMatrix(year, month) {
    // month: 0-11
    const firstDay = new Date(year, month, 1);
    const startWeekday = (firstDay.getDay() + 6) % 7; // Mo=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) {
        cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(d);
    }
    while (cells.length % 7 !== 0) {
        cells.push(null);
    }

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
}

function formatDateKey(year, month, day) {
    // YYYY-MM-DD
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
}

export default function CalendarApp({ onBack }) {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState(today.getDate());

    const [events, setEvents] = useState({}); // { "YYYY-MM-DD": [ { id, title } ] }
    const [newEventTitle, setNewEventTitle] = useState("");

    // Events aus localStorage laden
    useEffect(() => {
        try {
            const stored = localStorage.getItem("workbench-calendar-events");
            if (stored) {
                setEvents(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Calendar events load error", e);
        }
    }, []);

    // Events speichern
    useEffect(() => {
        try {
            localStorage.setItem("workbench-calendar-events", JSON.stringify(events));
        } catch (e) {
            console.error("Calendar events save error", e);
        }
    }, [events]);

    const monthMatrix = getMonthMatrix(currentYear, currentMonth);
    const monthLabel = new Date(currentYear, currentMonth, 1).toLocaleDateString(
        "en-US",
        { month: "long", year: "numeric" }
    );

    const selectedKey = formatDateKey(currentYear, currentMonth, selectedDay);
    const selectedEvents = events[selectedKey] || [];

    const handlePrevMonth = () => {
        setSelectedDay(1);
        setCurrentMonth((prev) => {
            if (prev === 0) {
                setCurrentYear((y) => y - 1);
                return 11;
            }
            return prev - 1;
        });
    };

    const handleNextMonth = () => {
        setSelectedDay(1);
        setCurrentMonth((prev) => {
            if (prev === 11) {
                setCurrentYear((y) => y + 1);
                return 0;
            }
            return prev + 1;
        });
    };

    const handleAddEvent = (e) => {
        e.preventDefault();
        const title = newEventTitle.trim();
        if (!title) return;

        const key = selectedKey;
        setEvents((prev) => {
            const list = prev[key] || [];
            return {
                ...prev,
                [key]: [...list, { id: Date.now(), title }],
            };
        });
        setNewEventTitle("");
    };

    const handleDeleteEvent = (id) => {
        const key = selectedKey;
        setEvents((prev) => {
            const list = prev[key] || [];
            return {
                ...prev,
                [key]: list.filter((ev) => ev.id !== id),
            };
        });
    };

    const hasEventsForDay = (day) => {
        if (!day) return false;
        const key = formatDateKey(currentYear, currentMonth, day);
        return !!(events[key] && events[key].length);
    };

    const isToday = (day) => {
        if (!day) return false;
        return (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        );
    };

    const isSelected = (day) => {
        if (!day) return false;
        return day === selectedDay;
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
                    width: 1100,
                    maxWidth: "100%",
                    height: 905,
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
                                    "linear-gradient(to bottom right, #38bdf8, #a855f7, #38bdf8)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.2rem",
                                boxShadow: "0 10px 25px rgba(129,140,248,0.8)",
                            }}
                        >
                            📅
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
                Calendar
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

                {/* MAIN CONTENT: links Kalender, rechts Events */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        display: "flex",
                        gap: "1.5rem",
                        flex: 1,
                        minHeight: 0,
                    }}
                >
                    {/* Kalender-Grid */}
                    <div
                        style={{
                            flex: 1.4,
                            borderRadius: 26,
                            backgroundColor: "rgba(15,23,42,0.7)",
                            border: "1px solid rgba(71,85,105,0.8)",
                            boxShadow:
                                "0 22px 55px rgba(15,23,42,1), inset 0 1px 0 rgba(148,163,184,0.25)",
                            padding: "1.25rem 1.5rem 1.5rem",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {/* Monat-Header */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "1rem",
                            }}
                        >
                            {/* Prev */}
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                style={{
                                    borderRadius: 9999,
                                    border: "1px solid rgba(148,163,184,0.7)",
                                    backgroundColor: "rgba(15,23,42,0.8)",
                                    color: "#e5e7eb",
                                    width: 32,
                                    height: 32,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                }}
                            >
                                ‹
                            </button>

                            {/* Mitte: Monat + Today */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "1.1rem",
                                        fontWeight: 600,
                                        letterSpacing: "0.05em",
                                    }}
                                >
                                    {monthLabel}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const now = new Date();
                                        setCurrentYear(now.getFullYear());
                                        setCurrentMonth(now.getMonth());
                                        setSelectedDay(now.getDate());
                                    }}
                                    style={{
                                        borderRadius: 9999,
                                        border: "1px solid rgba(148,163,184,0.8)",
                                        backgroundColor: "rgba(15,23,42,0.9)",
                                        color: "#e5e7eb",
                                        fontSize: "0.75rem",
                                        padding: "0.25rem 0.9rem",
                                        cursor: "pointer",
                                    }}
                                >
                                    Today
                                </button>
                            </div>

                            {/* Next */}
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                style={{
                                    borderRadius: 9999,
                                    border: "1px solid rgba(148,163,184,0.7)",
                                    backgroundColor: "rgba(15,23,42,0.8)",
                                    color: "#e5e7eb",
                                    width: 32,
                                    height: 32,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                }}
                            >
                                ›
                            </button>
                        </div>


                        {/* Wochentage */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(7, minmax(0,1fr))",
                                gap: "0.5rem",
                                marginBottom: "0.5rem",
                                fontSize: "0.7rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.16em",
                                color: "rgba(148,163,184,0.9)",
                            }}
                        >
                            {WEEKDAYS.map((d) => (
                                <div
                                    key={d}
                                    style={{
                                        textAlign: "center",
                                    }}
                                >
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Tage */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(7, minmax(0,1fr))",
                                gap: "0.5rem",
                                fontSize: "0.85rem",
                            }}
                        >
                            {monthMatrix.flat().map((day, idx) => {
                                if (!day) {
                                    return (
                                        <div
                                            key={`empty-${idx}`}
                                            style={{
                                                height: 48,
                                                borderRadius: 16,
                                                backgroundColor: "transparent",
                                            }}
                                        />
                                    );
                                }

                                const selected = isSelected(day);
                                const todayMark = isToday(day);
                                const hasEvents = hasEventsForDay(day);

                                let bg = "rgba(15,23,42,0.6)";
                                let border = "1px solid rgba(51,65,85,0.8)";
                                let color = "#e5e7eb";

                                if (selected) {
                                    bg = "rgba(56,189,248,0.9)";
                                    border = "1px solid rgba(125,211,252,1)";
                                    color = "#020617";
                                } else if (todayMark) {
                                    bg = "rgba(15,23,42,0.9)";
                                    border = "1px solid rgba(56,189,248,0.9)";
                                }

                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => setSelectedDay(day)}
                                        style={{
                                            height: 48,
                                            borderRadius: 16,
                                            border,
                                            backgroundColor: bg,
                                            color,
                                            cursor: "pointer",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            boxShadow: selected
                                                ? "0 14px 35px rgba(56,189,248,0.9)"
                                                : "none",
                                            position: "relative",
                                        }}
                                    >
                                        <span>{day}</span>
                                        {hasEvents && (
                                            <span
                                                style={{
                                                    position: "absolute",
                                                    bottom: 6,
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: "9999px",
                                                    backgroundColor: selected ? "#020617" : "#38bdf8",
                                                }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Event-Panel */}
                    <div
                        style={{
                            flex: 1,
                            borderRadius: 26,
                            backgroundColor: "rgba(15,23,42,0.7)",
                            border: "1px solid rgba(71,85,105,0.8)",
                            boxShadow:
                                "0 22px 55px rgba(15,23,42,1), inset 0 1px 0 rgba(148,163,184,0.25)",
                            padding: "1.25rem 1.5rem",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "0.75rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.22em",
                                color: "rgba(203,213,225,0.9)",
                                marginBottom: "0.25rem",
                            }}
                        >
                            Selected date
                        </div>
                        <div
                            style={{
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                marginBottom: "0.75rem",
                            }}
                        >
                            {selectedKey}
                        </div>

                        {/* Event-Liste */}
                        <div
                            style={{
                                flex: 1,
                                minHeight: 0,
                                borderRadius: 18,
                                backgroundColor: "rgba(15,23,42,0.8)",
                                border: "1px solid rgba(51,65,85,0.9)",
                                padding: "0.75rem 0.75rem",
                                overflowY: "auto",
                                marginBottom: "0.75rem",
                            }}
                        >
                            {selectedEvents.length === 0 ? (
                                <div
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "rgba(148,163,184,0.9)",
                                        textAlign: "center",
                                        padding: "0.5rem",
                                    }}
                                >
                                    No events for this day yet.
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.4rem",
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    {selectedEvents.map((ev) => (
                                        <div
                                            key={ev.id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                borderRadius: 14,
                                                padding: "0.45rem 0.6rem",
                                                background:
                                                    "linear-gradient(to right, rgba(15,23,42,0.9), rgba(30,64,175,0.95))",
                                                border: "1px solid rgba(59,130,246,0.7)",
                                            }}
                                        >
                      <span
                          style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                          }}
                      >
                        {ev.title}
                      </span>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteEvent(ev.id)}
                                                style={{
                                                    marginLeft: "0.5rem",
                                                    borderRadius: 9999,
                                                    border: "none",
                                                    backgroundColor: "rgba(239,68,68,0.9)",
                                                    color: "#f9fafb",
                                                    fontSize: "0.7rem",
                                                    padding: "0.2rem 0.6rem",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Neues Event hinzufügen */}
                        <form
                            onSubmit={handleAddEvent}
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: "0.5rem",
                            }}
                        >
                            <input
                                type="text"
                                placeholder="New event..."
                                value={newEventTitle}
                                onChange={(e) => setNewEventTitle(e.target.value)}
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
                                Add
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
