module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts}',
    './src/assets/**/*.css'
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