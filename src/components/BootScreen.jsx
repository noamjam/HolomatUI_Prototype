import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { themes } from "../themes";

export default function BootScreen({ onFinish }) {
    const [theme, setTheme] = useState(themes.default);
    const fullText = "Welcome to Holomat !";
    const [displayedText, setDisplayedText] = useState("");
    const [hasPressedOnce, setHasPressedOnce] = useState(false);
    const [skipped, setSkipped] = useState(false);

    // Theme laden
    useEffect(() => {
        const saved = localStorage.getItem("theme") || "default";
        setTheme(themes[saved] || themes.default);
    }, []);

    // Keyboard Handler
    useEffect(() => {
        const handleKeyDown = () => {
            // Wenn schon einmal gedrückt wurde -> skippen
            if (hasPressedOnce) {
                setSkipped(true);
                onFinish && onFinish();
                return;
            }
            // Erstes Mal: Hinweis anzeigen
            setHasPressedOnce(true);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [hasPressedOnce, onFinish]);

    // Typing-Effekt nur, wenn nicht geskippt
    useEffect(() => {
        if (skipped) return;

        let index = 0;
        const interval = setInterval(() => {
            setDisplayedText(fullText.slice(0, index + 1));
            index++;
            if (index === fullText.length) clearInterval(interval);
        }, 150);

        return () => clearInterval(interval);
    }, [skipped]);

    // Wenn geskippt, Animationen sofort „fertig“ darstellen (optional)
    const baseTransition = { duration: skipped ? 0 :4, ease: "easeInOut" };

    const letter = {
        hidden: { x: 30, opacity: 0, filter: "blur(8px)" },
        show: { x: 0, opacity: 1, filter: "blur(0px)" }
    };
    return (
        <motion.div
            className="fixed inset-0 flex flex-col justify-between items-center h-screen text-white py-16"
            initial={{ backgroundPosition: "0% 0%" }}
            animate={{ backgroundPosition: "100% 100%" }}
            transition={baseTransition}
            onAnimationComplete={() => {
                if (!skipped) onFinish && onFinish();
            }}
            style={{
                backgroundImage: theme.bgGradient,
                backgroundSize: "200% 200%",
                backgroundRepeat: "no-repeat",
            }}
        >
            <motion.img
                src={"./logo.png"}
                alt="Logo"
                className="w-32 h-32"
                initial={{ y: 250, opacity: 0, scale: 0.8 }}
                animate={{ y: 100, opacity: 1, scale: 2 }}
                transition={baseTransition}
            />

            <motion.h1
                initial={{ y: -10, opacity: 0.5, scale: 0.8 }}
                animate={{ y: -50, opacity: 1, scale: 2 }}
                transition={baseTransition}
                style={{
                    color: theme.textColor,
                    textShadow: `0 0 20px ${theme.textColor}`,
                }}
                className="text-6xl font-bold tracking-wide"
            >
                {displayedText.split("").map((ch, i) => (
                    <motion.span
                        key={`${ch}-${i}`}
                        variants={letter}
                        initial="hidden"
                        animate="show"
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        style={{ display: "inline-block" }}
                    >
                        {ch === " " ? "\u00A0" : ch}
                    </motion.span>
                ))}
                <span className="animate-blink">|</span>
            </motion.h1>
            {hasPressedOnce && !skipped && (
                <div className="fixed bottom-4 left-4 bg-black/70 text-white text-sm px-4 py-2 rounded shadow-lg">
                    Nochmal drücken, um zu überspringen
                </div>
            )}
        </motion.div>
    );
}
