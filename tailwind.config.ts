import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Mineral shell — primary palette via CSS vars */
        r: {
          bg:             "var(--r-bg)",
          surface:        "var(--r-surface)",
          rail:           "var(--r-rail)",
          elevated:       "var(--r-elevated)",
          border:         "var(--r-border)",
          "border-soft":  "var(--r-border-soft)",
          text:           "var(--r-text)",
          subtext:        "var(--r-subtext)",
          dim:            "var(--r-dim)",
          muted:          "var(--r-muted)",
          accent:         "var(--r-accent)",
          "accent-soft":  "var(--r-accent-soft)",
          "accent-dim":   "var(--r-accent-dim)",
          ok:             "var(--r-ok)",
          warn:           "var(--r-warn)",
          err:            "var(--r-err)",
          pulse:          "var(--r-pulse)",
        },
        /* Terminal regime — rt namespace */
        rt: {
          bg:             "var(--rt-bg)",
          surface:        "var(--rt-surface)",
          border:         "var(--rt-border)",
          text:           "var(--rt-text)",
          subtext:        "var(--rt-subtext)",
          dim:            "var(--rt-dim)",
          amber:          "var(--rt-amber)",
          ok:             "var(--rt-ok)",
          warn:           "var(--rt-warn)",
          err:            "var(--rt-err)",
        },
        /* Legacy aliases — ruberra.* prefix (kept for TabSwitcher, blocks/index, etc.) */
        ruberra: {
          bg:      "var(--r-bg)",
          surface: "var(--r-surface)",
          rail:    "var(--r-rail)",
          border:  "var(--r-border)",
          text:    "var(--r-text)",
          subtext: "var(--r-subtext)",
          muted:   "var(--r-muted)",
          accent:  "var(--r-accent)",
          pulse:   "var(--r-pulse)",
          warm:    "var(--r-rail)",
          stone:   "var(--r-elevated)",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "panel-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
      },
      animation: {
        "panel-in": "panel-in 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in":  "fade-in 0.15s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
