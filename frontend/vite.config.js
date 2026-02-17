import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression2';

export default defineConfig(({ mode }) => ({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    },
    watch: {
      usePolling: true,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'vue-i18n'],
          'vendor-ui': ['@heroicons/vue'],
          'vendor-utils': ['axios', '@vueuse/core', 'pinia'],
        },
      },
    },
  },
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      devOptions: {
        enabled: mode !== 'development',
        type: 'module',
      },
      registerType: 'prompt',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw-custom.ts',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
        globIgnores: ['sw.js', 'workbox-*.js'],
      },
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'img/web-app-manifest-192x192.png',
        'img/web-app-manifest-512x512.png',
      ],
      manifest: {
        name: 'Urban-Golf.ch ScoreCard',
        short_name: 'ScoreCard',
        description: 'Die Scorecard für deine Urban-Golf Scores',
        theme_color: '#1f2937',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/img/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/img/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/img/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
    // Pre-komprimierte .gz und .br Dateien erzeugen (für nginx gzip_static / brotli_static)
    compression({
      algorithms: ['brotliCompress', 'gzip'],
      exclude: [/\.(png|jpe?g|gif|svg|webp|ico|woff|woff2)$/],
      threshold: 1024,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  base: '/',
  publicDir: resolve(__dirname, 'public'),
}));
