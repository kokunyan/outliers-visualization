/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6",
          hover: "#2563EB",
        },
      },
    },
  },
  plugins: [],
};
