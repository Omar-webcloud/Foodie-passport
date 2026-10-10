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
        sans: ["DM Sans", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        slate: {
          50: "#FFFFFF",
          100: "#F5EBDD",
          200: "#E5DCCE",
          300: "#d6caba",
          400: "#81796D",
          500: "#81796D",
          600: "#81796D",
          700: "#292821",
          800: "#292821",
          900: "#292821",
        },
        emerald: {
          50: "#e8efe9",
          100: "#c8dcd0",
          500: "#477A58",
          600: "#3d684b",
          700: "#477A58",
        },
        amber: {
          50: "#f7eee3",
          100: "#ebd8c2",
          200: "#E5DCCE",
          300: "#d8c2a3",
          400: "#B94F32",
          500: "#B94F32",
          700: "#B94F32",
        },
        rose: {
          50: "#f8ecea",
          100: "#ecd1cc",
          200: "#dfb2ab",
          500: "#B94F32",
          600: "#B94F32",
        },
        passport: {
          sand: "#F5EBDD",
          saffron: "#B94F32",
          berry: "#173F35",
          teal: "#477A58",
          gold: "#C69A48",
          "gold-light": "#e4d0a9",
          "gold-muted": "#d2ad62",
          ink: "#292821",
          "ink-soft": "#81796D",
          surface: "#FFFFFF",
          warm: "#F5EBDD",
        },
      },
      boxShadow: {
        passport: "0 20px 60px rgba(41, 40, 33, 0.15), 0 4px 16px rgba(41, 40, 33, 0.08)",
        "passport-sm": "0 8px 24px rgba(41, 40, 33, 0.10)",
        "gold-glow": "0 0 0 1px rgba(198, 154, 72, 0.25), 0 8px 32px rgba(198, 154, 72, 0.12)",
        "inner-warm": "inset 0 1px 0 rgba(255,255,255,0.6)",
      },
      backgroundImage: {
        "app-bg": "linear-gradient(135deg, #F5EBDD 0%, #E5DCCE 50%, #F5EBDD 100%)",
        "card-shine": "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,235,221,0.95) 100%)",
        "gold-gradient": "linear-gradient(135deg, #C69A48 0%, #d2ad62 50%, #C69A48 100%)",
        "passport-card": "linear-gradient(135deg, #ffffff 0%, #F5EBDD 40%, #e8efe9 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
