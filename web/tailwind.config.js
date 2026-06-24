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
        'card': '32px',
        'input': '16px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        handwriting: ['Caveat', 'cursive'],
      },
      backgroundImage: {
        'notebook-paper': "linear-gradient(to right, transparent 79px, #e0565b 79px, #e0565b 81px, transparent 81px), url('/notebook-line.png')",
        'notebook-card': "url('/notebook-line.png')",
      },
      backgroundSize: {
        'notebook': '100% 100%, auto',
      },
    },
  },
  plugins: [],
}
