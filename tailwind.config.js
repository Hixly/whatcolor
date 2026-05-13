/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          red: '#E63946',
          orange: '#F4A261',
          yellow: '#E9C46A',
          green: '#2A9D8F',
          blue: '#264653',
          purple: '#7B2D8E',
        },
        dark: {
          bg: '#0A0A0A',
          surface: '#141414',
          border: '#2A2A2A',
        },
        light: {
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          border: '#E5E5E5',
        },
      },
    },
  },
  plugins: [],
}
