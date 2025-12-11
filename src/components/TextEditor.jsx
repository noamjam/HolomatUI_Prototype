// TextEditor.jsx
import React, { useState, useEffect } from "react";
//npm install @monaco-editor/react # or @monaco-editor/react@next for React v19
import Editor from "@monaco-editor/react";

function TextEditor({ initialContent = "", onChangeContent, language }) {
    const [content, setContent] = useState("");

    useEffect(() => {
        setContent(normalize(initialContent));
    }, [initialContent]);

    const normalize = (value) =>
        (value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    const updateContent = (value) => {
        const normalized = normalize(value || "");
        setContent(normalized);
        localStorage.setItem("editorContent", normalized);
        if (onChangeContent) onChangeContent(normalized);
    };

    const handleChange = (value) => {
        updateContent(value);
    };

    return (
        <div
            style={{
                height: "100vh",
                width: "100%",
                background:
                    "radial-gradient(circle at top, #38bdf8 0, #0f172a 30%, #020617 70%, #020617 100%)",
            }}
        >
            <Editor
                height="100%"
                language={language || "plaintext"}
                value={content}
                onChange={handleChange}
                options={{
                    fontSize: 14,
                    fontFamily: "monospace",
                    minimap: { enabled: false },
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                }}
                theme="vs-dark"
            />
        </div>
    );
}

export default TextEditor;
