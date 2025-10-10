import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { themes } from "../themes";


export default function BootScreen({ onFinish }) {
    const [theme, setTheme] = useState(themes.default);
    const fullText = "Holomat Prototype start...";
    const [displayedText, setDisplayedText] = useState("");

        useEffect(() => {
        const saved = localStorage.getItem("theme") || "default";
        setTheme(themes[saved] || themes.default);
    }, []);

    // Typing
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setDisplayedText(fullText.slice(0, index + 1));
            index++;
            if (index === fullText.length) clearInterval(interval);
        }, 150); // 🔹 Speed in ms
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div // Background
            className="fixed inset-0 flex flex-col justify-between items-center h-screen text-white py-16"
            initial={{ backgroundPosition: "0% 0%" }}
            animate={{ backgroundPosition: "100% 100%" }}
            transition={{ duration: 4, ease: "easeInOut" }}
            onAnimationComplete={onFinish}
            style={{
                backgroundImage: theme.bgGradient, // 🎨 dynamischer Hintergrund
                backgroundSize: "200% 200%",
                backgroundRepeat: "no-repeat",
            }}
        >
            <motion.img //Logo
                src={"./logo.png"}
                alt="Logo"
                className="w-32 h-32"
                initial={{ y: -10, opacity: 0, scale: 0.8 }}
                animate={{ y: 30, opacity: 1, scale: 2 }}
                transition={{ duration: 4, ease: "easeInOut" }}
            />

            <motion.h1 //Text
                initial={{ y: -10, opacity: 0.5, scale: 0.8 }}
                animate={{ y: -50, opacity: 1, scale: 2 }}
                transition={{ duration: 4, ease: "easeInOut" }}
                onAnimationComplete={onFinish}
                style={{
                    color: theme.textColor, // ✨ Textfarbe an Theme anpassen
                    textShadow: `0 0 20px ${theme.textColor}`,
                }}
                className="text-6xl font-bold tracking-wide"
            >
                {displayedText}
                <span className="animate-blink">|</span> {}
            </motion.h1>
        </motion.div>

    );
}
