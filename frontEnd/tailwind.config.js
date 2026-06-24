/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f5132', // Deep professional dark forest green
        accent: '#198754',  // Clean green accent
        surface: '#ffffff', // Pure white
        sand: '#f4f9f4',    // Very soft mint green-white
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
