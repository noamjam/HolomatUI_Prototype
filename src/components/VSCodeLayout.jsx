// VSCodeLayout.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import TextEditor from "./TextEditor.jsx";

const initialFiles = [
    {
        id: 1,
        name: "main.jsx",
        content: "// main entry file\n",
        language: "javascript",
    },
    {
        id: 2,
        name: "TextEditor.jsx",
        content: "// text editor component\n",
        language: "javascript",
    },
    {
        id: 3,
        name: "styles.css",
        content: "body { margin: 0; }\n",
        language: "plaintext",
    },
];

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
    const [files, setFiles] = useState(initialFiles);
    const [activeFileId, setActiveFileId] = useState(initialFiles[0].id);
    const [nextId, setNextId] = useState(initialFiles.length + 1);
    const [newFileExt, setNewFileExt] = useState("txt");

    const fileInputRef = useRef(null);

    const activeFile = files.find((f) => f.id === activeFileId) || null;

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
            console.log("Run result:", data.output);
        } catch (err) {
            console.error("Run error", err);
        }
    };

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
                file.id === activeFileId ? { ...file, language: langId } : file
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
        fileInputRef.current?.click();
    };

    const handleLoadedFile = (event) => {
        const fileObj = event.target.files?.[0];
        if (!fileObj || !activeFile) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result?.toString() ?? "";
            const ext = (fileObj.name.split(".").pop() || "txt").toLowerCase();
            const lang = languageByExt(ext);

            setFiles((prev) =>
                prev.map((f) =>
                    f.id === activeFileId
                        ? {
                            ...f,
                            name: fileObj.name || f.name,
                            content: text,
                            language: lang,
                        }
                        : f
                )
            );
        };
        reader.readAsText(fileObj, "utf-8");
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

    // ----- keyboard shortcuts (Ctrl/Cmd+O, Ctrl/Cmd+S) -----
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
        </div>
    );
}

export default VSCodeLayout;
