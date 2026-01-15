// src/components/ImageEditor.jsx
import React, { useEffect, useRef } from "react";
import ImageEditorLib from "tui-image-editor";
import "tui-image-editor/dist/tui-image-editor.css";

const ImageEditor = ({ onBack }) => {
    const editorRootRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        if (!editorRootRef.current) return;
        if (instanceRef.current) return;

        // Body-Scroll deaktivieren, solange der Editor offen ist
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const darkTheme = {
            "common.bi.backgroundColor": "transparent",
            "common.backgroundColor": "#111827",
            "common.border": "0px solid transparent",

            "menu.normalIcon.path": "",
            "menu.activeIcon.path": "",
            "menu.normalIcon.name": "menu-normal-icon",
            "menu.activeIcon.name": "menu-active-icon",

            "menu.iconSize.width": "24px",
            "menu.iconSize.height": "24px",

            "submenu.backgroundColor": "#020617",
            "submenu.partition.color": "#0f172a",

            "submenu.normalLabel.color": "#e5e7eb",
            "submenu.activeLabel.color": "#22d3ee",

            "downloadButton.backgroundColor": "#22d3ee",
            "downloadButton.borderRadius": "9999px",
            "downloadButton.color": "#000000",
        };

        instanceRef.current = new ImageEditorLib(editorRootRef.current, {
            includeUI: {
                loadImage: {
                    path: "https://uicdn.toast.com/toastui/img/tui-image-editor-bi.png",
                    name: "SampleImage",
                },
                theme: darkTheme,
                menu: [
                    "crop",
                    "flip",
                    "rotate",
                    "draw",
                    "shape",
                    "icon",
                    "text",
                    "filter",
                ],
                initMenu: "filter",
                uiSize: {
                    width: "100%",
                    height: "100%", // nimmt die volle Höhe des Containers
                },
                menuBarPosition: "bottom",
            },
            cssMaxWidth: 4000,
            cssMaxHeight: 4000,
            selectionStyle: {
                cornerSize: 20,
                rotatingPointOffset: 70,
            },
        });

        return () => {
            if (instanceRef.current) {
                instanceRef.current.destroy();
                instanceRef.current = null;
            }
        };
    }, []);

    return (
        <>
            <style>
                {`
        /* Ganze Seite des Editors soll 100vh haben */
        .image-editor-page-full {
          height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          padding: 0;
          margin: 0;
        }

        .image-editor-header-bar {
          flex: 0 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background: linear-gradient(to right, #06b6d4, #3b82f6);
          color: #e5e7eb;
        }

        .image-editor-title {
          font-size: 1rem;
          font-weight: 700;
        }

        .image-editor-back-button {
          padding: 4px 12px;
          background-color: #0f172a;
          color: #e5e7eb;
          border-radius: 9999px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background-color 150ms ease-in-out, transform 150ms ease-in-out;
        }

        .image-editor-back-button:hover {
          background-color: #020617;
          transform: translateY(-1px);
        }

        /* Der Bereich, in dem Toast UI lebt, füllt den Rest komplett */
        .image-editor-main {
          flex: 1 1 auto;
          min-height: 0;
          min-width: 0;
        }

        /* Root-Container für Toast UI: 100% vom verfügbaren Hauptbereich */
        .image-editor-root-full {
          width: 100%;
          height: 100%;
        }
      `}
            </style>

            <div className="image-editor-page-full">
                <div className="image-editor-header-bar">
                    <span className="image-editor-title">Image Editor</span>
                    <button className="image-editor-back-button" onClick={onBack}>
                        Zurück
                    </button>
                </div>

                <div className="image-editor-main">
                    <div ref={editorRootRef} className="image-editor-root-full" />
                </div>
            </div>
        </>
    );
};

export default ImageEditor;
