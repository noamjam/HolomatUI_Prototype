import React, { useState, useRef, useEffect, useCallback } from "react";
import TextEditor from "./TextEditor.jsx";

const initialFiles = [
    { id: 1, name: "main.jsx", content: "// main entry file\n" },
    { id: 2, name: "TextEditor.jsx", content: "// text editor component\n" },
    { id: 3, name: "styles.css", content: "body { margin: 0; }\n" },
];

function VSCodeLayout({ onBack }) {
    const [files, setFiles] = useState(initialFiles);
    const [activeFileId, setActiveFileId] = useState(initialFiles[0].id);
    const fileInputRef = useRef(null);

    const activeFile = files.find((f) => f.id === activeFileId);

    const handleFileClick = (id) => {
        setActiveFileId(id);
    };

    const handleEditorContentChange = (newContent) => {
        setFiles((prev) =>
            prev.map((file) =>
                file.id === activeFileId ? { ...file, content: newContent } : file
            )
        );
    };

    const handleBackClick = () => {
        if (onBack) onBack();
    };

    const handleOpenClick = () => {
        fileInputRef.current?.click();
    };

    const handleLoadedFile = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result?.toString() ?? "";
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === activeFileId
                        ? { ...f, name: file.name || f.name, content: text }
                        : f
                )
            );
        };
        reader.readAsText(file, "utf-8");
        event.target.value = "";
    };

    const handleSaveActiveFile = useCallback(() => {
        if (!activeFile) return;
        const blob = new Blob([activeFile.content || ""], {
            type: "text/plain;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = activeFile.name || "file.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    }, [activeFile]);

    // Strg+S / Strg+O
    useEffect(() => {
        const handleKey = (e) => {
            const key = e.key.toLowerCase();
            if ((e.ctrlKey || e.metaKey) && key === "s") {
                e.preventDefault();
                handleSaveActiveFile();
            }
            if ((e.ctrlKey || e.metaKey) && key === "o") {
                e.preventDefault();
                handleOpenClick();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [handleSaveActiveFile]);

    const buttonClasses =
        "bg-cyan-700 text-white px-3 py-1.5 rounded hover:bg-cyan-500 active:scale-95 transition shadow text-xs";

    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
                width: "100vw",
                overflow: "hidden",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                fontFamily:
                    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
        >
            {/* Sidebar / Explorer */}
            <div
                style={{
                    width: "260px",
                    backgroundColor: "#0b1120",
                    borderRight: "1px solid #1f2937",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Kopfzeile + Projekt-Buttons */}
                <div
                    style={{
                        padding: "10px 12px 6px",
                        borderBottom: "1px solid #1f2937",
                    }}
                >
                    <div
                        style={{
                            fontSize: "12px",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "#9ca3af",
                            marginBottom: "6px",
                        }}
                    >
                        Explorer
                    </div>

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <button
                            className={buttonClasses}
                            onClick={handleOpenClick}
                            title="Strg+O"
                        >
                            Datei öffnen
                        </button>
                        <button
                            className={buttonClasses}
                            onClick={handleSaveActiveFile}
                            title="Strg+S"
                        >
                            Datei speichern
                        </button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.js,.jsx,.ts,.tsx,.css,.json,text/plain"
                        style={{ display: "none" }}
                        onChange={handleLoadedFile}
                    />
                </div>

                {/* Dateiliste */}
                <div style={{ padding: "8px 0", overflowY: "auto", flex: 1 }}>
                    {files.map((file) => (
                        <button
                            key={file.id}
                            onClick={() => handleFileClick(file.id)}
                            style={{
                                display: "flex",
                                width: "100%",
                                padding: "4px 12px",
                                fontSize: "13px",
                                textAlign: "left",
                                border: "none",
                                backgroundColor:
                                    activeFileId === file.id ? "#111827" : "transparent",
                                color:
                                    activeFileId === file.id ? "#e5e7eb" : "#9ca3af",
                                cursor: "pointer",
                            }}
                        >
              <span
                  style={{
                      marginRight: "6px",
                      color: "#60a5fa",
                      fontSize: "12px",
                  }}
              >
                ●
              </span>
                            {file.name}
                        </button>
                    ))}
                </div>

                {/* Zurück-Button */}
                <button
                    onClick={handleBackClick}
                    style={{
                        margin: "8px 12px 12px",
                        padding: "6px 10px",
                        fontSize: "12px",
                        borderRadius: "8px",
                        border: "1px solid #374151",
                        backgroundColor: "#111827",
                        color: "#e5e7eb",
                        cursor: "pointer",
                    }}
                >
                    Zurück
                </button>
            </div>

            {/* Editor-Bereich: füllt alles rechts */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <TextEditor
                    initialContent={activeFile ? activeFile.content : ""}
                    onChangeContent={handleEditorContentChange}
                />
            </div>
        </div>
    );
}

export default VSCodeLayout;
