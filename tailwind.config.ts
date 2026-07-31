import type { Config } from "tailwindcss";

/**
 * Colours are driven by CSS variables (see globals.css) so the entire app
 * flips cleanly between light and dark themes. Channels are stored as
 * space-separated RGB (e.g. "15 15 17") so Tailwind's /alpha modifier works.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          2: "rgb(var(--ink-2) / <alpha-value>)",
          3: "rgb(var(--ink-3) / <alpha-value>)",
        },
        line: "var(--line)",
        chalk: {
          DEFAULT: "rgb(var(--chalk) / <alpha-value>)",
          muted: "rgb(var(--chalk-muted) / <alpha-value>)",
          faint: "rgb(var(--chalk-faint) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          2: "rgb(var(--accent-2) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "0.9rem", xl2: "1.25rem", pill: "999px" },
      boxShadow: {
        glass: "0 1px 2px rgba(0,0,0,0.04)",
        lift: "0 12px 40px -12px var(--shadow-lift)",
        glow: "0 0 0 1px rgb(var(--accent) / 0.35)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
      },
      animation: { "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both" },
    },
  },
  plugins: [],
};
export default config;
