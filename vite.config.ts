import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom'
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // build: {            // <-- удалите или закомментируйте внешние настройки
  //   rolldownOptions: { external: ['@capacitor/app', '@capacitor/status-bar'] },
  //   rollupOptions: { external: ['@capacitor/app', '@capacitor/status-bar'] }
  // }
})