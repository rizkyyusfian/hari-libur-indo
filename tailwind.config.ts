import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "html"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: "#780000",
        darkred: "#c1121f",
        cream: "#fdf0d5",
        darkblue: "#003049",
        lightblue: "#669bbc",
      },
    },
  },
  plugins: [],
};
export default config;
