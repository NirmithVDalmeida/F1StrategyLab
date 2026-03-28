/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        f1red:     '#e10600',
        f1blue:    '#00d2ff',
        darkBg:    '#0d0d0f',
        darkCard:  '#16161a',
        darkBorder:'#2a2a2e',
        lightBg:   '#f3f4f8',
        lightCard: '#ffffff',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
