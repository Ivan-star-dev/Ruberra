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
          bg:           "#f5f4f2",
          surface:      "#fafaf8",
          rail:         "#f0efed",
          border:       "#e2e0dc",
          divider:      "#d6d4cf",
          text:         "#1a1916",
          subtext:      "#8a8780",
          muted:        "#b8b5ae",
          accent:       "#5b52e8",
          "accent-2":   "#8078f0",
          pulse:        "#3d9b6e",
          "user-bubble": "#e8e6e2",
          "asst-bubble": "#ffffff",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        "rail":    "1px 0 0 0 #e2e0dc",
        "topbar":  "0 1px 0 0 #e2e0dc",
        "input":   "0 0 0 1px #e2e0dc",
        "input-focus": "0 0 0 1.5px #5b52e8",
        "bubble":  "0 1px 3px 0 rgba(26,25,22,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
