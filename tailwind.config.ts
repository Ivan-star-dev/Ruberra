import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Mineral shell — primary palette */
        r: {
          bg:           "var(--r-bg)",
          surface:      "var(--r-surface)",
          rail:         "var(--r-rail)",
          elevated:     "var(--r-elevated)",
          border:       "var(--r-border)",
          "border-soft":"var(--r-border-soft)",
          text:         "var(--r-text)",
          subtext:      "var(--r-subtext)",
          dim:          "var(--r-dim)",
          muted:        "var(--r-muted)",
          accent:       "var(--r-accent)",
          "accent-soft":"var(--r-accent-soft)",
          "accent-dim": "var(--r-accent-dim)",
          ok:           "var(--r-ok)",
          warn:         "var(--r-warn)",
          err:          "var(--r-err)",
          pulse:        "var(--r-pulse)",
        },
        /* Terminal regime — rt namespace */
        rt: {
          bg:             "var(--rt-bg)",
          surface:        "var(--rt-surface)",
          border:         "var(--rt-border)",
          "border-dash":  "var(--rt-border-dash)",
          text:           "var(--rt-text)",
          subtext:        "var(--rt-subtext)",
          dim:            "var(--rt-dim)",
          copper:         "var(--rt-copper)",
          amber:          "var(--rt-amber)",
          "amber-glow":   "var(--rt-amber-glow)",
          ok:             "var(--rt-ok)",
          warn:           "var(--rt-warn)",
          err:            "var(--rt-err)",
        },
        /* Legacy aliases — kept so existing classes don't break during migration */
        ruberra: {
          bg:       "var(--r-bg)",
          surface:  "var(--r-surface)",
          rail:     "var(--r-rail)",
          border:   "var(--r-border)",
          muted:    "var(--r-muted)",
          text:     "var(--r-text)",
          subtext:  "var(--r-subtext)",
          accent:   "var(--r-accent)",
          pulse:    "var(--r-pulse)",
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
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.16, 1, 0.3, 1)",
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
