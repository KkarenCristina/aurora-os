import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dawn: {
          bg: "#F5F5FB",
          surface: "#FFFFFF",
          ink: "#1D1B31",
          muted: "#6B6880",
          border: "#E4E1F0",
          indigo: "#4A3F7A",
          rose: "#E85D75",
          gold: "#F2A65A",
          teal: "#4FA695",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        "aurora-gradient": "linear-gradient(120deg, #4A3F7A 0%, #E85D75 65%, #F2A65A 100%)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
