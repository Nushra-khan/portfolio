import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        // "side" layout: panels beside the scene (desktops, landscape tablets & phones)
        side: { raw: '(orientation: landscape) and (min-width: 640px)' },
        short: { raw: '(max-height: 560px)' },
      },
      colors: {
        cream: '#FBF5E9',
        parchment: '#F3E9D4',
        ink: '#2B2A26',
        moss: '#4F6B3A',
        sage: '#A9BF8E',
        terracotta: '#C2683F',
        honey: '#E7B45A',
        lavender: '#9C8AD8',
        dusk: '#1E2742',
      },
      fontFamily: {
        serif: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 60px -20px rgba(43, 42, 38, 0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config;
