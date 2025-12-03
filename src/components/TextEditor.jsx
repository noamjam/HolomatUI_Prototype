import React, { useState, useEffect, useRef } from "react";

function TextEditor({ onBack }) {
    const [content, setContent] = useState("");
    const getLineCount = () => (content ? content.split("\n").length : 1);
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const saved = localStorage.getItem("editorContent");
        if (saved && editorRef.current) {
            editorRef.current.innerText = saved;
            setContent(saved);
        }
    }, []);

    const handleInput = () => {
        if (!editorRef.current) return;
        const value = editorRef.current.innerText;
        setContent(value);
        localStorage.setItem("editorContent", value);
    };

    const handleKeyDown = (event) => {
        if(event.key  === "Tab")
        {
            event.preventDefault();

            const selection = window.getSelection();
            if(!selection|| selection.rangeCount === 0) return;

            const range =   selection.getRangeAt(0);
            const tabNode = document.createTextNode("  ");
            range.insertNode(tabNode);

            range.setStartAfter(tabNode);
            range.setEndAfter(tabNode);
            selection.removeAllRanges();
            selection.addRange(range);

        }
        handleInput();
    };

    const handleDownload = () => {
        const blob = new Blob([content], {
            type: "text/plain;charset=utf-8",
        }); // TXT-Inhalt[web:125][web:136]
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "texteditor-inhalt.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url); // URL freigeben[web:127][web:139]
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target.result;
            if (editorRef.current) {
                editorRef.current.innerText = text;
            }
            setContent(text);
            localStorage.setItem("editorContent", text);
        };

        reader.readAsText(file, "utf-8"); // TXT lesen[web:221][web:234]
        event.target.value = "";
    };

    const buttonClasses =
        "bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-500 active:scale-95 transition shadow";

    return (
        <div
            className="relative flex flex-col text-white"
            style={{
                minHeight: "100vh", // füllt gesamten Viewport[web:312][web:313]
                background:
                    "radial-gradient(circle at top, #38bdf8 0, #0f172a 30%, #020617 70%, #020617 100%)",
            }}
        >
            {/* Back Button oben links */}
            <button
                onClick={onBack}
                className={`absolute top-4 left-4 m-4 ${buttonClasses}`}
            >
                ⬅ Back
            </button>

            {/* Überschrift mittig */}
            <h2 className="text-xl font-semibold text-center mt-24">
                Einfacher Code-Editor
            </h2>

            {/* Editor-Feld mittig mit Code-Style */}
            <div className="flex justify-center mt-8 px-6">
                <div
                    style={{
                        width: "100%",
                        maxWidth: "1100px",
                        display: "flex",
                        border: "3px solid #4b5563",
                        backgroundColor: "#020617",
                    }}
                >
                    {/* Line numbers column */}
                    <div
                        style={{
                            padding: "8px 8px",      // slightly smaller padding
                            textAlign: "right",
                            userSelect: "none",
                            color: "#9ca3af",
                            borderRight: "1px solid #4b5563",
                            minWidth: "40px",
                            fontSize: "13px",        // smaller numbers
                            lineHeight: "1.4",       // match editor line-height
                        }}
                    >
                        {Array.from({ length: getLineCount() }, (_, i) => (
                            <div key={i}>{i + 1}</div>
                        ))}
                    </div>

                    {/* Editable code area */}
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        style={{
                            flex: 1,
                            minHeight: "320px",
                            padding: "8px 12px",     // same vertical padding as numbers
                            fontFamily: "monospace",
                            fontSize: "14px",
                            lineHeight: "1.35",       // same as numbers
                            whiteSpace: "pre-wrap",
                            color: "#e5e7eb",
                            outline: "none",
                        }}
                    ></div>
                </div>
            </div>

            {/* Buttons unten mittig */}
            <div className="mt-8 mb-8 text-center">
                <button onClick={handleDownload} className={buttonClasses}>
                    Als .txt speichern
                </button>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className={buttonClasses}
                    style={{ marginLeft: "16px" }}
                >
                    .txt laden
                </button>

                <input
                    type="file"
                    accept=".txt,text/plain"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
}

export default TextEditor;
