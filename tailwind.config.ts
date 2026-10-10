import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        passport: {
          sand: "#f6efe7",
          saffron: "#f7b267",
          berry: "#7b2d26",
          teal: "#1f9d8a",
          gold: "#d4a12a",
        },
      },
      boxShadow: {
        passport: "0 18px 45px rgba(38, 28, 18, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
