/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef6ff",
          100: "#d9eaff",
          200: "#bcd9ff",
          300: "#8ec1ff",
          400: "#599eff",
          500: "#2f7bff",
          600: "#155cf2",
          700: "#1149c7",
          800: "#143f9c",
          900: "#163a7c",
        },
      },
    },
  },
  plugins: [],
};
