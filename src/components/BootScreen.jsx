import React from "react";
import { motion } from "framer-motion";

export default function BootScreen({ onFinish }) {
    return (
        <motion.div
            initial={{ backgroundPosition: "0% 0%" }}
            animate={{ backgroundPosition: "100% 100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
            onAnimationComplete={onFinish}
            style={{
                backgroundImage:
                    "linear-gradient(to bottom right, #00ffff, #1e3a8a, #6d28d9)",
                backgroundSize: "200% 200%",
                backgroundRepeat: "no-repeat",
            }}
            className="fixed inset-0 flex items-center justify-center h-screen text-white"
        >
            <motion.h1
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0.5, 2.5, 1.5], opacity: 1 }}
                transition={{ duration: 3, ease: "easeOut" }}
                onAnimationComplete={onFinish} // ← ruft App-Start auf
                className="text-6xl font-bold tracking-wide text-cyan-400 drop-shadow-[0_0_20px_#00ffff]"
            >
                Holomat Prototype start
            </motion.h1>
        </motion.div>
    );
}
