module.exports = {
  darkMode: 'class', // ← wichtig für manuelle Umschaltung
  content: [
    './index.html',
    './src/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {},
  },
  safelist: [
    {
      pattern: /^(sticky|min-w-max|left|right)-/,
    },
  ],
  plugins: [],
};
