import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
const base = process.env.VITE_BASE_PATH || './';
const builtAt = new Date().toISOString();
const version = `${builtAt.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')}-${process.env.GITHUB_SHA?.slice(0, 7) || 'local'}`;
export default defineConfig({
  base,
  define: { 'import.meta.env.VITE_APP_VERSION': JSON.stringify(version) },
  plugins: [{
    name: 'app-release-info',
    generateBundle() { this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version, builtAt }) }); }
  }, VitePWA({
    registerType: 'prompt',
    includeAssets: ['icon-192.png', 'icon-512.png', 'icon-maskable.png'],
    manifest: { name: '飞刀深渊 · Knife Depths', short_name: '飞刀深渊', description: '底部走位，向上投掷。单机像素地牢 Roguelite。', lang: 'zh-CN', theme_color: '#f6f7ec', background_color: '#f6f7ec', display: 'standalone', orientation: 'any', start_url: './', scope: './', icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }, { src: 'icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }] },
    workbox: { globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'], maximumFileSizeToCacheInBytes: 4000000, cleanupOutdatedCaches: true, navigateFallback: 'index.html', navigateFallbackDenylist: [/^\/api\//] }
  })],
  build: { rollupOptions: { output: { manualChunks: { phaser: ['phaser'] } } }, chunkSizeWarningLimit: 1600 }
});
