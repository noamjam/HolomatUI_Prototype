import React, { useState, useEffect } from "react";

function TextEditor({ initialContent = "", onChangeContent }) {
    const [content, setContent] = useState("");

    useEffect(() => {
        setContent(normalizeText(initialContent));
    }, [initialContent]);

    const normalizeText = (value) =>
        (value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    const updateContent = (value) => {
        const normalized = normalizeText(value);
        setContent(normalized);
        localStorage.setItem("editorContent", normalized);
        if (onChangeContent) onChangeContent(normalized);
    };

    const getLineCount = () => {
        const value = normalizeText(content);
        return value ? value.split("\n").length : 1;
    };

    const handleChange = (e) => {
        updateContent(e.target.value);
    };

    const handleKeyDown = (e) => {
        // Tab -> zwei Spaces
        if (e.key === "Tab") {
            e.preventDefault();
            const {selectionStart, selectionEnd, value} = e.target;
            const before = value.slice(0, selectionStart);
            const after = value.slice(selectionEnd);
            const updated = `${before}  ${after}`;
            updateContent(updated);
            requestAnimationFrame(() => {
                e.target.selectionStart = e.target.selectionEnd = selectionStart + 2;
            });
        }
    };
    return (
        <div
            style={{
                height: "100vh",
                width: "100%",
                display: "flex",
                background:
                    "radial-gradient(circle at top, #38bdf8 0, #0f172a 30%, #020617 70%, #020617 100%)",
            }}
        >
            {/* Zeilennummern-Spalte */}
            <div
                style={{
                    width: "48px",
                    padding: "8px 8px",
                    textAlign: "right",
                    userSelect: "none",
                    color: "#9ca3af",
                    borderRight: "1px solid #4b5563",
                    fontSize: "13px",
                    lineHeight: "1.4",
                    boxSizing: "border-box",
                }}
            >
                {Array.from({length: getLineCount()}, (_, i) => (
                    <div key={i}>{i + 1}</div>
                ))}
            </div>

            {/* kompletter restlicher Bereich = Editor */}
            <textarea
                value={content}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                style={{
                    flex: 1,
                    height: "100%",
                    padding: "8px 12px",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    lineHeight: "1.35",
                    whiteSpace: "pre",
                    color: "#e5e7eb",
                    backgroundColor: "transparent",
                    border: "none",
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                }}
            />
        </div>
    );
}

export default TextEditor;
