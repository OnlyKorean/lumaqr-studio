/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070B16',
          900: '#0B1020',
          850: '#0F1529',
          800: '#131A33',
          700: '#1B2447',
          600: '#26315C',
        },
        brand: {
          violet: '#7C3AED',
          violetDark: '#6D28D9',
          cyan: '#22D3EE',
          lime: '#A3E635',
          white: '#F8FAFC',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px 0 rgba(124, 58, 237, 0.35)',
        'glow-cyan': '0 0 24px 0 rgba(34, 211, 238, 0.3)',
        card: '0 8px 30px rgba(2, 6, 23, 0.35)',
        'card-light': '0 8px 24px rgba(15, 23, 42, 0.08)',
      },
      keyframes: {
        scanline: {
          '0%': { top: '4%', opacity: '0' },
          '12%': { opacity: '1' },
          '88%': { opacity: '1' },
          '100%': { top: '92%', opacity: '0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.96)', opacity: '0.7' },
          '70%': { transform: 'scale(1.06)', opacity: '0' },
          '100%': { transform: 'scale(1.06)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        scanline: 'scanline 2.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'pulse-ring': 'pulse-ring 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.3s ease-out both',
        'slide-up': 'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-down': 'slide-down 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
        'toast-in': 'toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.4s linear infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
    },
  },
  plugins: [],
};
