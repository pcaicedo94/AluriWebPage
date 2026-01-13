import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#3be3cf",
        "primary-dark": "#2cc1af",
        "background-light": "#FFFFFF",
        "background-subtle": "#F8FAFC",
        "background-dark": "#0F172A",
        "text-main": "#0f172a",
        "text-muted": "#64748b",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
        full: "9999px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
