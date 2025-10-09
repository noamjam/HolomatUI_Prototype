import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { themes } from "../themes";


export default function BootScreen({ onFinish }) {
    const [theme, setTheme] = useState(themes.default);

    useEffect(() => {
        const saved = localStorage.getItem("theme") || "default";
        setTheme(themes[saved] || themes.default);
    }, []);

    return (
        <motion.div
            initial={{ backgroundPosition: "0% 0%" }}
            animate={{ backgroundPosition: "100% 100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
            onAnimationComplete={onFinish}
            style={{
                backgroundImage: theme.bgGradient, // 🎨 dynamischer Hintergrund
                backgroundSize: "200% 200%",
                backgroundRepeat: "no-repeat",
            }}
            className="fixed inset-0 flex items-center justify-center h-screen text-white"
        >
            <motion.h1
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0.5, 2.5, 1.5], opacity: 1 }}
                transition={{ duration: 3, ease: "easeOut" }}
                onAnimationComplete={onFinish}
                style={{
                    color: theme.textColor, // ✨ Textfarbe an Theme anpassen
                    textShadow: `0 0 20px ${theme.textColor}`,
                }}
                className="text-6xl font-bold tracking-wide"
            >
                Holomat Prototype start
            </motion.h1>
        </motion.div>
    );
}
