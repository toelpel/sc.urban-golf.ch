import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  base: '/new/',
  publicDir: resolve(__dirname, 'public') // ← sorgt dafür, dass .htaccess beim Build nach dist/ kopiert wird
});