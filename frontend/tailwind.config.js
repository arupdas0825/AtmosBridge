/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0E5C63',
          dark: '#093E43',
          light: '#1B828B',
          surface: '#EBF4F5',
        },
        risk: {
          safe: '#1B7A4D',
          watch: '#C98A12',
          high: '#D9622B',
          critical: '#B3251F',
        },
        surface: {
          DEFAULT: '#F5F6F4',
          card: '#FFFFFF',
          muted: '#EAECE9',
        },
        ink: {
          DEFAULT: '#0F172A',
          muted: '#5B6472',
          light: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'sm': '6px',
        'DEFAULT': '6px',
        'md': '8px',
        'card': '12px',
        'pill': '9999px',
        'full': '9999px',
      },
      boxShadow: {
        'flat': 'none',
        'card': '0 1px 3px rgba(0,0,0,0.06)',
        'modal': '0 8px 24px rgba(0,0,0,0.10)',
        'glass': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'glow-teal': '0 0 15px rgba(14, 92, 99, 0.20)',
      },
    },
  },
  plugins: [],
}
