/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zypher-bg': '#020617', // Slate 950 - Deep Navy
        'zypher-primary': '#3b82f6', // Blue 500
        'zypher-secondary': '#60a5fa', // Blue 400
        'zypher-accent': '#0ea5e9', // Sky 500
        'zypher-navy': '#0f172a', // Slate 900
      },
      backgroundImage: {
        'blueprint': "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)",
      }
    },
  },
  plugins: [],
}