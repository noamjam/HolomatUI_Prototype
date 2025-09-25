// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00ffff",
        accent: "#00bfff",
        // Optional benannte Farbsets für konsistente Themes
        themeRed: {
          bg: "#1a0000",
          accent: "#ff0000",
        },
        themeYellow: {
          bg: "#1a1a00",
          accent: "#ffcc00",
        },
        themeGreen: {
          bg: "#002d00",
          accent: "#00ff88",
        },
      },
      animation: {
        'glow-cycle': 'glow 4s ease-in-out infinite',
        'carousel-spin': 'orbit 20s linear infinite',
        'pulse-byte': 'pulseByte 1.5s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 8px #00ffff, 0 0 16px #00ffff',
          },
          '50%': {
            boxShadow: '0 0 20px #00ffff, 0 0 40px #00ffff',
          },
        },
        orbit: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' }
        },
        pulseByte: {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '50%': {
            transform: 'scale(1.2)',
            opacity: '0.6',
          },
        },
      },
    },
  },
  plugins: [],
};
