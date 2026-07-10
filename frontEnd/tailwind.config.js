/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary, #0f5132)', // Deep professional dark forest green fallback
        accent: 'var(--color-accent, #198754)',  // Clean green accent fallback
        surface: '#ffffff', // Pure white
        sand: 'var(--color-sand, #f4f9f4)',    // Very soft background fallback
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
