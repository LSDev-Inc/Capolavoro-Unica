module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f1115",
        slate: "#171a21",
        mist: "#9aa4b2",
        highlight: "#2ad1a3",
        accent: "#4b7cff",
        glow: "#75ffe4"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"]
      },
      boxShadow: {
        soft: "0 20px 60px rgba(0, 0, 0, 0.35)",
        ring: "0 0 0 1px rgba(255, 255, 255, 0.08)"
      }
    }
  },
  plugins: []
};
