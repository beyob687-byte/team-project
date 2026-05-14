/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'deep':       'rgb(var(--color-deep) / <alpha-value>)',
        'surface':    'rgb(var(--color-surface) / <alpha-value>)',
        'surface-2':  'rgb(var(--color-surface-2) / <alpha-value>)',
        'primary':    'rgb(var(--color-primary) / <alpha-value>)',
        'primary-dim':'rgb(var(--color-primary-dim) / <alpha-value>)',
        'secondary':  'rgb(var(--color-secondary) / <alpha-value>)',
        'secondary-dim':'rgb(var(--color-secondary-dim) / <alpha-value>)',
        'success':    'rgb(var(--color-success) / <alpha-value>)',
        'warning':    'rgb(var(--color-warning) / <alpha-value>)',
        'danger':     'rgb(var(--color-danger) / <alpha-value>)',
        'text-1':     'rgb(var(--color-text-1) / <alpha-value>)',
        'text-2':     'rgb(var(--color-text-2) / <alpha-value>)',
        'border-glow':'var(--color-border-glow)',
        'border-glow-hover':'var(--color-border-glow-hover)',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['Outfit', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'card':   '0 8px 32px var(--shadow-card)',
        'glow':   '0 0 20px var(--shadow-glow)',
        'glow-lg':'0 0 40px var(--shadow-glow-lg)',
      },
      borderRadius: {
        'card': '16px',
        'input': '10px',
        'btn': '10px',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease forwards',
        'slide-up':   'slideUp 0.3s ease forwards',
        'slide-right':'slideRight 0.3s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px var(--shadow-glow)' },
          '50%':      { boxShadow: '0 0 30px var(--shadow-glow-lg)' },
        }
      }
    },
  },
  plugins: [],
};
