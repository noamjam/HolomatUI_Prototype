// src/components/ImageEditor.jsx
import React, { useEffect, useRef } from "react";
import ImageEditorLib from "tui-image-editor";
import "tui-image-editor/dist/tui-image-editor.css";

const ImageEditor = ({ onBack }) => {
    const editorRootRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        if (!editorRootRef.current) return;
        if (instanceRef.current) return; // schon initialisiert

        const darkTheme = {
            'common.bi.backgroundColor': 'transparent',
            'common.backgroundColor': 'transparent',
            'common.border': '0px solid transparent',

            'menu.normalIcon.path': '',
            'menu.activeIcon.path': '',
            'menu.normalIcon.name': 'menu-normal-icon',
            'menu.activeIcon.name': 'menu-active-icon',

            'menu.iconSize.width': '24px',
            'menu.iconSize.height': '24px',

            'submenu.backgroundColor': '#020617',
            'submenu.partition.color': '#0f172a',

            'submenu.normalLabel.color': '#e5e7eb',
            'submenu.activeLabel.color': '#22d3ee',

            'downloadButton.backgroundColor': '#22d3ee',
            'downloadButton.borderRadius': '9999px',
            'downloadButton.color': '#000000',};

        instanceRef.current = new ImageEditorLib(editorRootRef.current, {
            includeUI: {
                loadImage: {
                    path: "https://uicdn.toast.com/toastui/img/tui-image-editor-bi.png",
                    name: "SampleImage",
                },
                theme: darkTheme,
                menu: ["crop", "flip", "rotate", "draw", "shape", "icon", "text", "filter"],
                initMenu: "filter",
                uiSize: { width: "100%", height: "800px" },
                menuBarPosition: "bottom",
            },
            cssMaxWidth: 1000,
            cssMaxHeight: 800,
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
        <div className="p-6 h-full flex justify-center items-center">
            <div className="bg-black/70 rounded-xl shadow-2xl border border-cyan-500/40 w-full max-w-5xl">
                <div className="flex justify-between items-center px-4 py-2 border-b border-cyan-500/30">
                    <h2 className="text-lg font-bold">Image Editor</h2>
                    <button
                        className="px-3 py-1 bg-cyan-500 text-black rounded"
                        onClick={onBack}
                    >
                        Zurück
                    </button>
                </div>
                <div ref={editorRootRef} className="h-[600px]" />
            </div>
        </div>
    );
};

export default ImageEditor;
