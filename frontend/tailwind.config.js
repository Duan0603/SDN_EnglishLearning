/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        apex: {
          mint: "#00CC99",
          emerald: "#00B386",
          forest: "#005C42",
          dark: "#1E1E1E",
          background: "#F7F9FA",
          muted: "#9CA3AF",
          amber: "#F97316",
        }
      }
    },
  },
  plugins: [],
}
