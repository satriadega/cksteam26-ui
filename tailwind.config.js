/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FAFAFA",
        title: "#000000",
        "button-highlight": {
          blue: "#0D47A1",
          maroon: "#8B0000",
        },
        "text-main": "#6E6E6E",
        "link-nav": "#003366",
      },
      fontFamily: {
        inder: ['"Inder"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
