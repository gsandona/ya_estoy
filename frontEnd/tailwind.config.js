/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2C201C', // Deep warm coffee/espresso (traditional wood parrillada warmth)
        accent: '#801A2D',  // Tannat burgundy red (Uruguayan wine elegance)
        surface: '#FAF6F0', // Soft warm linen cream (classic bistro paper menu)
        sand: '#EFEAE2',    // Warm sand tone for secondary containers
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
