import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/web-app-manifest-192x192.png', 'icons/web-app-manifest-512x512.png'],
      manifest: {
        name: 'Urban-Golf.ch ScoreCard',
        short_name: 'ScoreCard',
        description: 'Die Scorecard für deine Urban-Golf Scores',
        theme_color: '#1f2937',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/new/',
        start_url: '/new/',
        icons: [
          {
            src: '/new/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/new/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/new/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  base: '/new/',
  publicDir: resolve(__dirname, 'public') // ← sorgt dafür, dass .htaccess beim Build nach dist/ kopiert wird
});