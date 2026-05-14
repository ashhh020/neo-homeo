/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "#0d9488",
          "teal-dark": "#0f766e",
          "teal-light": "#ccfbf1",
          ink: "#134e4a",
          muted: "rgba(19, 78, 74, 0.55)",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(13, 148, 136, 0.12)",
      },
    },
  },
  plugins: [],
};
