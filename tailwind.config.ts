import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        r: {
          bg:           "var(--r-bg)",
          surface:      "var(--r-surface)",
          "surface-2":  "var(--r-surface-2)",
          rail:         "var(--r-rail)",
          elevated:     "var(--r-elevated)",
          panel:        "var(--r-panel)",
          border:       "var(--r-border)",
          "border-soft":"var(--r-border-soft)",
          divider:      "var(--r-divider)",
          text:         "var(--r-text)",
          "text-2":     "var(--r-text-2)",
          subtext:      "var(--r-subtext)",
          dim:          "var(--r-dim)",
          muted:        "var(--r-muted)",
          accent:       "var(--r-accent)",
          "accent-soft":"var(--r-accent-soft)",
          ok:           "var(--r-ok)",
          warn:         "var(--r-warn)",
          err:          "var(--r-err)",
          pulse:        "var(--r-pulse)",
          "cta-bg":     "var(--r-cta-bg)",
          "cta-text":   "var(--r-cta-text)",
          "pill-bg":    "var(--r-pill-bg)",
          "pill-text":  "var(--r-pill-text)",
          "chip-bg":    "var(--r-chip-bg)",
          "chip-active":"var(--r-chip-active)",
          "chip-text":  "var(--r-chip-text)",
        },
        rt: {
          bg:            "var(--rt-bg)",
          surface:       "var(--rt-surface)",
          border:        "var(--rt-border)",
          "border-dash": "var(--rt-border-dash)",
          text:          "var(--rt-text)",
          subtext:       "var(--rt-subtext)",
          dim:           "var(--rt-dim)",
          copper:        "var(--rt-copper)",
          amber:         "var(--rt-amber)",
          "amber-glow":  "var(--rt-amber-glow)",
          ok:            "var(--rt-ok)",
          warn:          "var(--rt-warn)",
          err:           "var(--rt-err)",
        },
        /* Legacy aliases */
        ruberra: {
          bg:      "var(--r-bg)",
          surface: "var(--r-surface)",
          rail:    "var(--r-rail)",
          border:  "var(--r-border)",
          muted:   "var(--r-muted)",
          text:    "var(--r-text)",
          subtext: "var(--r-subtext)",
          accent:  "var(--r-accent)",
          pulse:   "var(--r-pulse)",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        sm:  "4px",
        md:  "6px",
        lg:  "10px",
        xl:  "14px",
        "2xl": "18px",
      },
    },
  },
  plugins: [],
};

export default config;
