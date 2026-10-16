/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Official Kiva School (kiva.school) Color Palette
        kiva: {
          teal: '#0db29b',
          deepTeal: '#05897a',
          teal2: '#08b89e',
          yellow: '#fac217',
          warmYellow: '#f6c65b',
          orange: '#f68845',
          accentOrange: '#f2793d',
          purple: '#ab75b2',
          violet: '#8f46d9',
          darkBlue: '#082c4b',
          muted: '#5f7576',
          cream: '#fef7e2',
          panel: '#fefaf0',
        },
        // Brand maps to Kiva Teal & Dark Blue
        brand: {
          50: '#f0faf8',
          100: '#d9f3ee',
          200: '#b5e7dd',
          300: '#83d5c6',
          400: '#48bdab',
          500: '#0db29b', // --color-teal
          600: '#08b89e', // --color-teal2
          700: '#05897a', // --color-deep-teal
          800: '#0b665c',
          900: '#082c4b', // --color-dark-blue
          950: '#041729',
        },
        // Standard interactive classes (indigo) map to Kiva Teal / Deep Teal
        indigo: {
          50: '#f0faf8',
          100: '#d9f3ee',
          200: '#b5e7dd',
          300: '#83d5c6',
          400: '#48bdab',
          500: '#0db29b',
          600: '#0db29b', // Kiva Primary Teal
          700: '#05897a', // Kiva Deep Teal
          800: '#082c4b', // Kiva Dark Blue
          900: '#051f36',
          950: '#031322',
        },
        // Kiva Golden Yellow
        amber: {
          50: '#fffdf0',
          100: '#fef9c3',
          200: '#feef8a',
          300: '#fde047',
          400: '#fac217', // --color-yellow
          500: '#f6c65b', // --color-warm-yellow
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        // Kiva Purple / Lilac Accent (e.g. Apply Now button on kiva.school)
        purple: {
          50: '#faf5fb',
          100: '#f3e8f6',
          200: '#e7d2ed',
          300: '#d5b3de',
          400: '#bf8ecb',
          500: '#ab75b2', // --color-purple
          600: '#9a63a1',
          700: '#814f88',
          800: '#6b4370',
          900: '#58395b',
        },
        // Kiva Orange Accent
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f68845', // --color-orange
          600: '#f2793d', // --color-accent-orange
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // School green maps to Kiva teal2
        school: {
          50: '#f0faf8',
          100: '#d9f3ee',
          200: '#b5e7dd',
          500: '#0db29b',
          600: '#08b89e',
          700: '#05897a',
        },
        // Dark surfaces map to Kiva dark blue #082c4b
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#5f7576', // --color-text-muted
          700: '#334155',
          800: '#1e293b',
          900: '#082c4b', // Exact Kiva Dark Blue
          950: '#041729',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
