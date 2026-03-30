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
          bg:       "#0a0a0c",
          surface:  "#111116",
          rail:     "#0e0e12",
          border:   "#1e1e26",
          muted:    "#3a3a48",
          text:     "#e8e8f0",
          subtext:  "#7a7a90",
          accent:   "#6c63ff",
          pulse:    "#22c55e",
        },
        /* Terminal regime palette — rt prefix, Lab inset only */
        rt: {
          bg:          "var(--rt-bg)",
          surface:     "var(--rt-surface)",
          border:      "var(--rt-border)",
          "border-dash": "var(--rt-border-dash)",
          text:        "var(--rt-text)",
          subtext:     "var(--rt-subtext)",
          dim:         "var(--rt-dim)",
          copper:      "var(--rt-copper)",
          amber:       "var(--rt-amber)",
          "amber-glow": "var(--rt-amber-glow)",
          ok:          "var(--rt-ok)",
          warn:        "var(--rt-warn)",
          err:         "var(--rt-err)",
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
