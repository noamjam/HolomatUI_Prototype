import React, { useState } from "react";
import { MarkdownEditor } from "./MarkdownEditor";
import { MarkdownPreview } from "./MarkdownPreview";

export function MarkdownEditorShell({ initialValue, onSave, title, onBack , onOpen}) {
    const [value, setValue] = useState(initialValue || "");
    const [mode, setMode] = useState("edit");

    const handleSave = () => {
        if (onSave) onSave(value);
    };

    const handleOpenClick = async () =>
    {
        if(!onOpen) return;
        const newContent = await onOpen();
        if(typeof newContent === "string")
            setValue(newContent);
    }
    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://localhost:3001/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            console.error("Upload failed");
            return "";
        }

        const data = await res.json();
        return data.url; // z.B. "/uploads/<hash>.png"
    };


    return (
        <div className="markdown-editor-shell">
            <div className="markdown-editor-shell-header">
                <button className="markdown-back-button" onClick={onBack}>
                    ← Back
                </button>

                <div className="markdown-title">{title || "Notes.md"}</div>

                <div className="markdown-header-actions">
                    <button onClick={handleOpenClick}>Open</button>
                    <button
                        className={mode === "edit" ? "active" : ""}
                        onClick={() => setMode("edit")}
                    >
                        Edit
                    </button>
                    <button
                        className={mode === "preview" ? "active" : ""}
                        onClick={() => setMode("preview")}
                    >
                        Preview
                    </button>
                    <button onClick={handleSave}>Save</button>
                </div>
            </div>

            <div className="markdown-editor-shell-body">
                {mode === "edit" ? (
                    <MarkdownEditor
                        value={value}
                        onChange={setValue}
                        onImageUpload={handleImageUpload}
                    />
                ) : (
                    <MarkdownPreview value={value} />
                )}
            </div>
        </div>
    );
}
