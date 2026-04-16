// VSCodeLayout.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import TextEditor from "./TextEditor.jsx";

const STORAGE_KEY = "vscodeLayoutFiles";

const languageByExt = (ext) => {
    switch (ext) {
        case "js":
            return "javascript";
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
                setActiveFileId(parsed.activeFileId ?? parsed.files[0].id);
                setNextId(parsed.nextId ?? parsed.files.length + 1);
            }
        } catch (e) {
            console.error("Failed to load editor state", e);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ files, activeFileId, nextId })
        );
    }, [files, activeFileId, nextId]);

    const runCode = async () => {
        if (!activeFile) return;
        try {
            const res = await fetch("http://127.0.0.1:5000/api/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language: activeFile.language,
                    code: activeFile.content,
                    filename: activeFile.name,
                }),
            });

            const contentType = res.headers.get("content-type") || "";
            if (!res.ok || !contentType.includes("application/json")) {
                const text = await res.text().catch(() => "");
                setRunOutput(
                    `Run failed (status ${res.status})\n${text || "No body / non-JSON response"}`
                );
                setShowRunOutput(true);
                return;
            }

            const data = await res.json();
            setRunOutput(data.output ?? data.error ?? "No output (empty JSON response)");
            setShowRunOutput(true);
        } catch (err) {
            console.error("Run error", err);
            setRunOutput("Run error: " + err.message);
            setShowRunOutput(true);
        }
    };

    const handleFileClick = (id) => setActiveFileId(id);

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

    const languages = [
        { id: "plaintext", label: "Plain text" },
        { id: "javascript", label: "JavaScript" },
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

    const newFileOptions = [
        { ext: "txt", label: "Text (.txt)" },
        { ext: "js", label: "JavaScript (.js)" },
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

    const handleOpenClick = () => fileInputRef.current?.click();

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

    const closeFile = () => {
        if (!activeFile) return;

        setFiles((prev) => {
            const idx = prev.findIndex((f) => f.id === activeFileId);
            if (idx === -1) return prev;

            const newFiles = prev.filter((f) => f.id !== activeFileId);

            if (newFiles.length === 0) {
                setActiveFileId(null);
            } else {
                const next = newFiles[idx - 1] || newFiles[0];
                setActiveFileId(next.id);
            }

            return newFiles;
        });
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

    return (
        <div className="vscode-layout-shell">
            <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.js,.jsx,.ts,.tsx,.py,.css,.json,text/plain"
                style={{ display: "none" }}
                onChange={handleLoadedFile}
            />
            <aside className="vscode-sidebar">
                <div className="vscode-sidebar-header">Explorer</div>

                <div className="vscode-filelist">
                    {files.map((file) => (
                        <button
                            key={file.id}
                            onClick={() => handleFileClick(file.id)}
                            className={`vscode-file-item ${activeFileId === file.id ? "active" : ""}`}
                        >
                            <span className="vscode-file-dot">●</span>
                            <span className="vscode-file-name">{file.name}</span>
                        </button>
                    ))}
                </div>
            </aside>

            <main className="vscode-main-panel">
                <div className="vscode-topbar">
                    <div className="vscode-topbar-left">
                        <button onClick={handleBackClick} className="editor-pill-btn">
                            ← Back
                        </button>
                    </div>

                    <div className="vscode-topbar-center">
        <span className="vscode-active-filename">
          {activeFile?.name || "Untitled.txt"}
        </span>
                    </div>

                    <div className="vscode-topbar-right">
                        <button className="editor-pill-btn" onClick={handleOpenClick}>Open</button>
                        <button className="editor-pill-btn" onClick={() => createNewFile(newFileExt)}>New</button>
                        <button className="editor-pill-btn" onClick={handleSaveActiveFile}>Save</button>
                        <button className="editor-pill-btn" onClick={closeFile}>Close</button>
                        <button className="editor-pill-btn editor-pill-btn-primary" onClick={runCode}>Run</button>
                    </div>
                </div>

                <div className="vscode-toolbar-row">
                    <select
                        value={newFileExt}
                        onChange={(e) => setNewFileExt(e.target.value)}
                        className="editor-pill-select"
                    >
                        {newFileOptions.map((opt) => (
                            <option key={opt.ext} value={opt.ext}>{opt.label}</option>
                        ))}
                    </select>

                    <select
                        value={currentLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="editor-pill-select"
                    >
                        {languages.map((lang) => (
                            <option key={lang.id} value={lang.id}>{lang.label}</option>
                        ))}
                    </select>
                </div>

                <div className="vscode-editor-panel">
                    <TextEditor
                        initialContent={activeFile ? activeFile.content : ""}
                        onChangeContent={handleEditorContentChange}
                        language={activeFile?.language || "plaintext"}
                    />
                </div>
            </main>
            {showRunOutput && (
                <div
                    className="vscode-output-overlay"
                    onClick={() => setShowRunOutput(false)}
                >
                    <div
                        className="vscode-output-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="vscode-output-header">
                            <span>Run output – {activeFile?.name || "untitled"}</span>
                            <button
                                onClick={() => setShowRunOutput(false)}
                                className="editor-pill-btn"
                            >
                                Close
                            </button>
                        </div>

                        <pre className="vscode-output-pre">
            {runOutput}
          </pre>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VSCodeLayout;