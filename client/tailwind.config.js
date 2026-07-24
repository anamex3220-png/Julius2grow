/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        julius: {
          50: "#f2f6fb",
          100: "#e3ecf7",
          200: "#c1d6ee",
          300: "#8fb4de",
          400: "#578cc9",
          500: "#3570b0",
          600: "#265892",
          700: "#204777",
          800: "#1e3c63",
          900: "#1c3454",
        },
      },
    },
  },
  plugins: [],
};
