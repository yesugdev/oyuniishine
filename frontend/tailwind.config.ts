import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FFF8F3',
          100: '#FFE9D5',
          200: '#FFD4AF',
          300: '#FFB87A',
          400: '#FF9645',
          500: '#FF7A3D',
          600: '#E85E20',
          700: '#C04718',
          800: '#8B3000',
          900: '#5C1F00',
        },
        sky: {
          50: '#F0F9FF',
          100: '#DAEEFF',
          200: '#B5DCFE',
          300: '#76C3FC',
          400: '#38A9F8',
          500: '#0EA5E9',
          600: '#0286C8',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        mint: {
          50: '#F0FFF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        lavender: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        rose: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
        },
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'Nunito', 'system-ui', 'sans-serif'],
        display: ['var(--font-nunito)', 'Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        'float-delay': 'float 4s ease-in-out 1s infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #FF7A3D 0%, #FFB87A 100%)',
        'gradient-sky': 'linear-gradient(135deg, #0EA5E9 0%, #76C3FC 100%)',
        'gradient-mint': 'linear-gradient(135deg, #22C55E 0%, #86EFAC 100%)',
        'gradient-lavender': 'linear-gradient(135deg, #8B5CF6 0%, #C4B5FD 100%)',
        'gradient-hero': 'linear-gradient(135deg, #FFF8F3 0%, #F0F9FF 50%, #F5F3FF 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
      },
      boxShadow: {
        'warm': '0 8px 32px rgba(255, 122, 61, 0.2)',
        'warm-lg': '0 16px 48px rgba(255, 122, 61, 0.3)',
        'sky': '0 8px 32px rgba(14, 165, 233, 0.2)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 16px 48px rgba(0, 0, 0, 0.12)',
        'glow-warm': '0 0 30px rgba(255, 122, 61, 0.4)',
        'glow-sky': '0 0 30px rgba(14, 165, 233, 0.4)',
      },
    },
  },
  plugins: [],
}

export default config
