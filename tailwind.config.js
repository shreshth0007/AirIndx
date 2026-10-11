/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060913',
          900: '#0B0F19',
          850: '#0F1626',
          800: '#131B2E',
          700: '#1A243B',
          600: '#23304D',
        },
        aqi: {
          good: '#10B981',
          moderate: '#F59E0B',
          unhealthy: '#F97316',
          veryUnhealthy: '#EF4444',
          hazardous: '#9333EA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-good': '0 0 20px rgba(16, 185, 129, 0.4)',
        'glow-moderate': '0 0 20px rgba(245, 158, 11, 0.4)',
        'glow-unhealthy': '0 0 20px rgba(249, 115, 22, 0.4)',
        'glow-hazardous': '0 0 20px rgba(147, 51, 234, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 30s linear infinite',
      }
    },
  },
  plugins: [],
}
