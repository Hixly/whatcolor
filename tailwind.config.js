/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Outfit"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'Cambria', 'serif'],
      },
      colors: {
        brand: {
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFD60A',
          green: '#30D158',
          blue: '#0A84FF',
          purple: '#BF5AF2',
        },
        dark: {
          bg: '#0A0A0A',
          surface: '#111111',
          border: '#222222',
        },
        light: {
          bg: '#FFFFFF',
          surface: '#F7F7F7',
          border: '#EBEBEB',
        },
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        floatOrb: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '25%': { transform: 'translate(14px, -36px) scale(1.07)' },
          '50%': { transform: 'translate(-8px, -20px) scale(1.03)' },
          '75%': { transform: 'translate(20px, -44px) scale(1.1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        wave: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '30%': { transform: 'translateY(-14px)' },
          '60%': { transform: 'translateY(4px)' },
        },
        lockPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(1.06)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fadeIn 0.5s ease-out both',
        'float': 'float 4s ease-in-out infinite',
        'scale-in': 'scaleIn 0.45s cubic-bezier(0.16,1,0.3,1) both',
        'spin-slow': 'spinSlow 12s linear infinite',
        'float-orb': 'floatOrb 8s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'wave': 'wave 0.65s cubic-bezier(0.36,0.07,0.19,0.97) both',
        'lock-pulse': 'lockPulse 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
