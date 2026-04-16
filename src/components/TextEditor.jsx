// TextEditor.jsx
import React, { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";

function TextEditor({ initialContent = "", onChangeContent, language = "plaintext" }) {
    const [content, setContent] = useState("");
    const [editorRef, setEditorRef] = useState(null);

    const normalize = (value) =>
        (value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    useEffect(() => {
        setContent(normalize(initialContent));
    }, [initialContent]);

    const updateContent = (value) => {
        const normalized = normalize(value || "");
        setContent(normalized);
        if (onChangeContent) onChangeContent(normalized);
    };

    const beforeMount = (monaco) => {
        monaco.editor.defineTheme("workbench-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
                { token: "", foreground: "e5e7eb" },
                { token: "comment", foreground: "64748b", fontStyle: "italic" },
                { token: "keyword", foreground: "38bdf8" },
                { token: "string", foreground: "facc15" },
                { token: "number", foreground: "60a5fa" },
                { token: "type.identifier", foreground: "c084fc" },
            ],
            colors: {
                "editor.background": "#020617",
                "editor.foreground": "#e5e7eb",
                "editorLineNumber.foreground": "#475569",
                "editorLineNumber.activeForeground": "#e2e8f0",
                "editorCursor.foreground": "#38bdf8",
                "editor.selectionBackground": "#0ea5e955",
                "editor.inactiveSelectionBackground": "#0ea5e933",
                "editor.lineHighlightBackground": "#0f172a",
                "editorIndentGuide.background1": "#1e293b",
                "editorIndentGuide.activeBackground1": "#334155",
                "editorGutter.background": "#020617",
                "editorWidget.background": "#0f172a",
                "editorWidget.border": "#334155",
                "peekView.background": "#0f172a",
                "peekView.border": "#334155",
            },
        });
    };

    const onMount = (editor, monaco) => {
        setEditorRef(editor);
        monaco.editor.setTheme("workbench-dark");
        editor.focus();
    };

    const editorOptions = useMemo(
        () => ({
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 14, bottom: 14 },
            smoothScrolling: true,
            cursorBlinking: "smooth",
            renderLineHighlight: "line",
            lineNumbers: "on",
            roundedSelection: true,
            overviewRulerBorder: false,
            scrollbar: {
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
            },
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: false,
        }),
        []
    );

    return (
        <div className="workbench-editor-shell">
            <div className="workbench-editor-header">
                <div className="workbench-editor-title-group">
                    <div className="workbench-editor-title">Code Editor</div>
                    <div className="workbench-editor-subtitle">
                        Plaintext / JavaScript / Python
                    </div>
                </div>

                <div className="workbench-editor-actions">
                    <span className="workbench-editor-badge">{language}</span>
                </div>
            </div>

            <div className="workbench-editor-body">
                <div className="workbench-editor-surface">
                    <Editor
                        height="100%"
                        language={language || "plaintext"}
                        value={content}
                        beforeMount={beforeMount}
                        onMount={onMount}
                        onChange={(value) => updateContent(value)}
                        options={editorOptions}
                    />
                </div>
            </div>
        </div>
    );
}

export default TextEditor;