/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        optometry: {
          900: '#0f172a', // Deep blue background
          800: '#1e293b',
          glass: 'rgba(255, 255, 255, 0.1)', // Glass effect base
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}