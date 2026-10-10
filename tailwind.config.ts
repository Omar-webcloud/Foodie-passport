import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        passport: {
          sand: "#f6efe7",
          saffron: "#f7b267",
          berry: "#7b2d26",
          teal: "#1f9d8a",
          gold: "#c9952a",
          "gold-light": "#f5e6c2",
          "gold-muted": "#e8c97a",
          ink: "#0f1923",
          "ink-soft": "#1e2d3d",
          surface: "#ffffff",
          warm: "#fdf8f3",
        },
      },
      boxShadow: {
        passport: "0 20px 60px rgba(15, 25, 35, 0.18), 0 4px 16px rgba(15, 25, 35, 0.08)",
        "passport-sm": "0 8px 24px rgba(15, 25, 35, 0.10)",
        "gold-glow": "0 0 0 1px rgba(201,149,42,0.25), 0 8px 32px rgba(201,149,42,0.12)",
        "inner-warm": "inset 0 1px 0 rgba(255,255,255,0.6)",
      },
      backgroundImage: {
        "app-bg": "linear-gradient(135deg, #0d1117 0%, #111823 50%, #0d1117 100%)",
        "card-shine": "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(253,248,243,0.95) 100%)",
        "gold-gradient": "linear-gradient(135deg, #c9952a 0%, #e8c97a 50%, #c9952a 100%)",
        "passport-card": "linear-gradient(135deg, #fdf4e3 0%, #fff8f4 40%, #f0fdf6 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
