import { join } from 'path';

export default {
  content: [
    join(__dirname, 'index.html'),
    join(__dirname, 'src/**/*.{vue,js,ts}')
  ],
  theme: {
    extend: {
      colors: {
        golfgreen: '#2f855a',
      },
    },
  },
  plugins: [],
};