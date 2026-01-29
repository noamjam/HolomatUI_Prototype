// src/components/MarkdownEditor.jsx
import React, { useRef } from "react";

export function MarkdownEditor({ value, onChange, onImageUpload }) {
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    const insertAtCursor = (text) => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart ?? value.length;
        const end = el.selectionEnd ?? value.length;
        const newValue = value.slice(0, start) + text + value.slice(end);
        onChange(newValue);
        requestAnimationFrame(() => {
            const pos = start + text.length;
            el.selectionStart = el.selectionEnd = pos;
            el.focus();
        });
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const uploadAndInsert = async (file, fallbackAlt) => {
        if (!file || !onImageUpload) return;

        const url = await onImageUpload(file);
        if (!url) return;

        const alt = file.name || fallbackAlt || "image";
        const markdown = `![${alt}](${url})`;
        insertAtCursor(markdown);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        await uploadAndInsert(file, "uploaded-image");
        e.target.value = "";
    };

    const handlePaste = async (e) => {
        const items = e.clipboardData?.items || [];
        for (const item of items) {
            if (item.type && item.type.startsWith("image/")) {
                e.preventDefault();
                const file = item.getAsFile();
                await uploadAndInsert(file, "pasted-image");
                break;
            }
        }
    };

    return (
        <div className="markdown-editor">
            <div className="markdown-editor-toolbar">
                <button onClick={() => insertAtCursor("**bold**")}>B</button>
                <button onClick={() => insertAtCursor("_italic_")}>I</button>
                <button onClick={() => insertAtCursor("\n- list item")}>•</button>
                <button onClick={handleImageClick}>Bild</button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
            </div>

            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onPaste={handlePaste}
                className="markdown-editor-textarea"
            />
        </div>
    );
}
