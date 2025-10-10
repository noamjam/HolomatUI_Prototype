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
         bootPop: 'bootPop 1.2s cubic-bezier(0.68,-0.55,0.27,1.55) forwards',
          blink: 'blink 1s step-start infinite',
        'carousel-spin': 'orbit 20s linear infinite',
        'pulse-byte': 'pulseByte 1.5s ease-in-out infinite',
      },
      keyframes: {
          bootPop: {
           '0%':   { transform: 'scale(0.5)', opacity: '0'},
           '50%':  { transform: 'scale(1.2)', opacity: '1'},
           '100%': { transform: 'scale(1)', opacity: '1'},
          },
          blink: {
              '0%, 50%, 100%': { opacity: '1' },
              '25%, 75%': { opacity: '0' },
          },
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
