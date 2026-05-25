/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apex IELTS Design System — from GEMINI.md
        primary: {
          DEFAULT: '#00CC99',   // Mint Green — progress bars, score highlights
          dark: '#005C42',      // Forest Green — main action buttons
        },
        accent: {
          dark: '#1E1E1E',      // Charcoal Black — headings, Done buttons
          badge: '#F97316',     // Amber — PREMIUM badges
        },
        background: {
          DEFAULT: '#F7F9FA',   // Light Grey — page background
          card: '#FFFFFF',      // Pure White — card surfaces
        },
      },
      borderRadius: {
        'card': '32px',         // rounded-3xl for main content cards
        'input': '16px',        // rounded-2xl for input fields
      },
    },
  },
  plugins: [],
}
