import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const SITE = process.env.SITE || 'https://watanabe3tipapa.github.io'
const BASE = process.env.BASE || '/txt-crypter-neo'
const START_URL = BASE === '/' ? '/' : BASE + '/'

export default defineConfig({
  site: SITE,
  base: BASE,
  vite: {
    plugins: [
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icon.svg'],
        manifest: {
          name: 'TXT-Crypter-Neo',
          short_name: 'TXT-Crypter',
          description: 'Browser-only text encryption tool',
          theme_color: '#ffd700',
          background_color: '#fffdf5',
          display: 'standalone',
          start_url: START_URL,
          icons: [
            {
              src: 'icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,ico}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'google-fonts' },
            },
          ],
        },
      }),
    ],
  },
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
})
