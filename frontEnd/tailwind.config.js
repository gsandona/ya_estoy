/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a', // Dark blue (elegant modern base)
        accent: '#10b981',  // Emerald green (Action accent)
        surface: '#f8fafc'  // Light gray (minimalist background)
      }
    },
  },
  plugins: [],
}
