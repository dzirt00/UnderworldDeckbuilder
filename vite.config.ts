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

  build: {
    // Настройки для нового сборщика Rolldown, который используется в Vite
    rolldownOptions: {
      checks: {
        pluginTimings: false // Отключает вывод логов [PLUGIN_TIMINGS]
      }
    }
  }
})