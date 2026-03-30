import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ruberra: {
          bg:      "#f5f4f2",
          surface: "#fafaf8",
          rail:    "#f0efed",
          border:  "#e2e0dc",
          text:    "#1a1916",
          subtext: "#6b6966",
          muted:   "#b0ada8",
          accent:  "#5b52e8",
          pulse:   "#3d9b6e",
          warm:    "#ebe9e5",
          stone:   "#f0eeeb",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
