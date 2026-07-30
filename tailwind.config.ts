import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#080809", 2: "#0E0E11", 3: "#151519" },
        line: "rgba(255,255,255,0.10)",
        chalk: { DEFAULT: "#F5F5F7", muted: "#A6A6AE", faint: "#6A6A73" },
        accent: { DEFAULT: "#7C5CFF", 2: "#C74BFF" },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "1.5rem", xl2: "1.75rem", pill: "999px" },
      boxShadow: {
        glass: "0 8px 32px -8px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.08)",
        lift: "0 24px 70px -24px rgba(0,0,0,0.8), inset 0 1px 0 0 rgba(255,255,255,0.10)",
        glow: "0 0 0 1px rgba(124,92,255,0.4), 0 16px 50px -12px rgba(124,92,255,0.5)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
      },
      animation: { "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both" },
    },
  },
  plugins: [],
};
export default config;
