/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#F5F5F5',
        primary: '#E0E0E0',
        secondary: '#BDBDBD',
        'text-main': '#424242',
        'text-light': '#757575',
        accent: '#8D6E63',
        'link-nav': '#6D4C41',
        'button-highlight-blue': '#A1887F',
        title: '#000000',
      },
      fontFamily: {
        inder: ['"Inder"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
