// VSCodeLayout.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import TextEditor from "./TextEditor.jsx";

const STORAGE_KEY =  "vscodeLayoutFiles";

const languageByExt = (ext) => {
    switch (ext) {
        case "js":
            return "javascript";
        case "ts":
            return "typescript";
        case "py":
            return "python";
        case "css":
            return "plaintext";
        case "txt":
        default:
            return "plaintext";
    }
};

function VSCodeLayout({ onBack }) {
    const [files, setFiles] = useState([]);
    const [activeFileId, setActiveFileId] = useState(null);
    const [nextId, setNextId] = useState(1);
    const [newFileExt, setNewFileExt] = useState("txt");

    const [runOutput, setRunOutput] = useState("");
    const [showRunOutput, setShowRunOutput] = useState(false);

    const fileInputRef = useRef(null);

    const activeFile = files.find((f) => f.id === activeFileId) || null;

    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.files) && parsed.files.length > 0) {
                setFiles(parsed.files);
                setActiveFileId(
                    parsed.activeFileId ?? parsed.files[0].id
                );
                setNextId(parsed.nextId ?? parsed.files.length + 1);
            }
        } catch (e) {
            console.error("Failed to load editor state", e);
        }
    }, []);

    // ---- persist session whenever files / active change ----
    useEffect(() => {
        const payload = {
            files,
            activeFileId,
            nextId,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }, [files, activeFileId, nextId]);

    // ---- Run code, show popup output ----
    const runCode = async () => {
        if (!activeFile) return;
        try {
            const res = await fetch("http://localhost:5000/api/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language: activeFile.language,
                    code: activeFile.content,
                    filename: activeFile.name,
                }),
            });
            const data = await res.json();
            setRunOutput(data.output ?? "No output");
            setShowRunOutput(true);
        } catch (err) {
            console.error("Run error", err);
            setRunOutput("Run error: " + err.message);
            setShowRunOutput(true);
        }
    };

    const handleFileClick = (id) => {
        setActiveFileId(id);
    };

    const handleEditorContentChange = (newContent) => {
        setFiles((prev) =>
            prev.map((file) =>
                file.id === activeFileId
                    ? { ...file, content: newContent }
                    : file
            )
        );
    };

    const handleBackClick = () => {
        if (onBack) onBack();
    };

    // ----- language handling -----
    const languages = [
        { id: "plaintext", label: "Plain text" },
        { id: "javascript", label: "JavaScript" },
        { id: "typescript", label: "TypeScript" },
        { id: "python", label: "Python" },
    ];

    const currentLanguage = activeFile?.language || "plaintext";

    const handleLanguageChange = (langId) => {
        if (!activeFile) return;
        setFiles((prev) =>
            prev.map((file) =>
                file.id === activeFileId
                    ? { ...file, language: langId }
                    : file
            )
        );
    };

    // ----- new file handling -----
    const newFileOptions = [
        { ext: "txt", label: "Text (.txt)" },
        { ext: "js", label: "JavaScript (.js)" },
        { ext: "ts", label: "TypeScript (.ts)" },
        { ext: "py", label: "Python (.py)" },
    ];

    const createNewFile = (ext) => {
        const id = nextId;
        const defaultName = `file${id}.${ext}`;
        const lang = languageByExt(ext);

        const newFile = {
            id,
            name: defaultName,
            content: "",
            language: lang,
        };

        setFiles((prev) => [...prev, newFile]);
        setActiveFileId(id);
        setNextId(id + 1);
    };

    // ----- open/save handling -----
    const handleOpenClick = () => {
        // Here we use the OS picker – this is for "Open" only
        fileInputRef.current?.click();
    };

    const handleLoadedFile = (event) => {
        const fileObj = event.target.files?.[0];
        if (!fileObj) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result?.toString() ?? "";
            const ext = (fileObj.name.split(".").pop() || "txt").toLowerCase();
            const lang = languageByExt(ext);

            const id = nextId;
            const newFile = {
                id,
                name: fileObj.name,
                content: text,
                language: lang,
            };

            setFiles((prev) => [...prev, newFile]);
            setActiveFileId(id);
            setNextId(id + 1);
        };
        reader.readAsText(fileObj, "utf-8");
        event.target.value = "";
    };


    // "Save" bedeutet hier: aktuelle Version als Datei herunterladen
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

    // ----- keyboard shortcuts (Ctrl/Cmd+O, Ctrl/Cmd+S) -----
    useEffect(() => {
        const handleKey = (e) => {
            const key = e.key.toLowerCase();
            if ((e.ctrlKey || e.metaKey) && key === "s") {
                e.preventDefault();
                handleSaveActiveFile(); // überschreibt direkt die "Datei" unter gleichem Namen
            }
            if ((e.ctrlKey || e.metaKey) && key === "o") {
                e.preventDefault();
                handleOpenClick();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [handleSaveActiveFile]);

    // ----- styles -----
    const buttonSmall = {
        padding: "4px 8px",
        fontSize: "12px",
        borderRadius: "6px",
        border: "1px solid #374151",
        backgroundColor: "#111827",
        color: "#e5e7eb",
        cursor: "pointer",
        whiteSpace: "nowrap",
    };

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
                {/* Run button */}
                <button
                    onClick={runCode}
                    style={{
                        padding: "4px 8px",
                        fontSize: "12px",
                        borderRadius: 0,
                        border: "none",
                        backgroundColor: "#16a34a",
                        color: "#e5e7eb",
                        cursor: "pointer",
                        width: "100%",
                    }}
                >
                    Run
                </button>

                {/* Header + actions */}
                <div
                    style={{
                        padding: "10px 12px 8px",
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

                    {/* Open / Save */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <button
                            style={buttonSmall}
                            onClick={handleOpenClick}
                            title="Ctrl+O"
                        >
                            Open file
                        </button>
                        <button
                            style={buttonSmall}
                            onClick={handleSaveActiveFile}
                            title="Ctrl+S"
                        >
                            Save file
                        </button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.js,.jsx,.ts,.tsx,.py,.css,.json,text/plain"
                        style={{ display: "none" }}
                        onChange={handleLoadedFile}
                    />

                    {/* New file controls */}
                    <div
                        style={{
                            display: "flex",
                            gap: "6px",
                            marginTop: "8px",
                            alignItems: "center",
                        }}
                    >
                        <select
                            value={newFileExt}
                            onChange={(e) => setNewFileExt(e.target.value)}
                            style={{
                                flex: 1,
                                padding: "4px 6px",
                                fontSize: "12px",
                                borderRadius: "6px",
                                backgroundColor: "#020617",
                                color: "#e5e7eb",
                                border: "1px solid #374151",
                            }}
                        >
                            {newFileOptions.map((opt) => (
                                <option key={opt.ext} value={opt.ext}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <button
                            style={buttonSmall}
                            onClick={() => createNewFile(newFileExt)}
                        >
                            New
                        </button>
                    </div>

                    {/* Language selector for active file */}
                    <div style={{ marginTop: "8px" }}>
                        <select
                            value={currentLanguage}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "4px 6px",
                                fontSize: "12px",
                                borderRadius: "6px",
                                backgroundColor: "#020617",
                                color: "#e5e7eb",
                                border: "1px solid #374151",
                            }}
                        >
                            {languages.map((lang) => (
                                <option key={lang.id} value={lang.id}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* File list */}
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

                {/* Back button */}
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

            {/* Editor area on the right */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <TextEditor
                    initialContent={activeFile ? activeFile.content : ""}
                    onChangeContent={handleEditorContentChange}
                    language={activeFile?.language || "plaintext"}
                />
            </div>

            {/* Run output popup */}
            {showRunOutput && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(15,23,42,0.75)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 60,
                    }}
                    onClick={() => setShowRunOutput(false)}
                >
                    <div
                        style={{
                            width: "70%",
                            maxWidth: "800px",
                            maxHeight: "70vh",
                            backgroundColor: "#020617",
                            borderRadius: "12px",
                            border: "1px solid #4b5563",
                            padding: "16px",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
                            display: "flex",
                            flexDirection: "column",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                marginBottom: "8px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
              <span style={{ fontSize: "14px", fontWeight: 600 }}>
                Run output – {activeFile?.name || "untitled"}
              </span>
                            <button
                                onClick={() => setShowRunOutput(false)}
                                style={{
                                    padding: "4px 8px",
                                    fontSize: "12px",
                                    borderRadius: "6px",
                                    border: "1px solid #4b5563",
                                    backgroundColor: "#111827",
                                    color: "#e5e7eb",
                                    cursor: "pointer",
                                }}
                            >
                                Close
                            </button>
                        </div>
                        <pre
                            style={{
                                flex: 1,
                                margin: 0,
                                padding: "8px",
                                borderRadius: "8px",
                                backgroundColor: "#020617",
                                color: "#e5e7eb",
                                fontFamily: "monospace",
                                fontSize: "13px",
                                overflow: "auto",
                                whiteSpace: "pre-wrap",
                            }}
                        >
              {runOutput}
            </pre>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VSCodeLayout;
