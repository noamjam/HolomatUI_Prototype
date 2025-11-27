import React, { useState, useEffect, useRef } from "react";

function TextEditor({ onBack }) {
    const [content, setContent] = useState("");
    const editorRef = useRef(null);

    // Beim Laden Inhalt aus localStorage holen und EINMAL ins Feld schreiben
    useEffect(() => {
        const saved = localStorage.getItem("editorContent");
        if (saved && editorRef.current) {
            editorRef.current.innerText = saved;
            setContent(saved);
        }
    }, []);

    const handleInput = (event) => {
        const value = event.currentTarget.innerText;
        setContent(value);
        localStorage.setItem("editorContent", value);
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

        URL.revokeObjectURL(url); // URL wieder freigeben[web:127][web:139]
    };

    const buttonClasses =
        "bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-500 active:scale-95 transition shadow";

    return (
        <div className="relative px-6 py-8">
            {/* Back Button: ganz oben links, gleichmäßiger Abstand */}
            <button
                onClick={onBack}
                className={`absolute top-0 left-0 m-4 ${buttonClasses}`}
            >
                ⬅ Back
            </button>

            {/* Überschrift mittig, weiter unten */}
            <h2
                style={{ textAlign: "center", marginTop: "80px" }}
                className="text-xl font-semibold"
            >
                Einfacher Texteditor
            </h2>

            {/* Textfeld: unkontrolliert, nur ref + onInput, dickere Border */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                style={{
                    border: "3px solid #ccc",
                    minHeight: "300px",
                    padding: "10px",
                    marginTop: "40px",
                }}
            ></div>

            {/* Export-Button darunter, gleich gestylt wie Back */}
            <div style={{ marginTop: "30px", textAlign: "center" }}>
                <button onClick={handleDownload} className={buttonClasses}>
                    File speichern
                </button>
            </div>
        </div>
    );
}

export default TextEditor;
