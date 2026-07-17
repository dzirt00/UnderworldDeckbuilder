import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import { Capacitor } from '@capacitor/core' // Надежный импорт для проверки среды
import AppComponent from './App.vue'
import router from './router'

let lastBackPress = 0 // Оставляем только ОДНО объявление переменной

// Инициализация обработчика кнопки «Назад»
async function setupBackButton() {
  if (Capacitor.isNativePlatform()) {
    const { App } = await import('@capacitor/app')
    const { Toast } = await import('@capacitor/toast')

    App.addListener('backButton', ({ canGoBack }) => {
      nextTick(async () => {
        // Получаем текущий путь во Vue Router
        const currentPath = router.currentRoute.value.path

        // 1. Проверяем, находится ли пользователь на ГЛАВНОМ экране (например, '/')
        if (currentPath === '/') {
          // Если на главной — СРАЗУ закрываем приложение без двойных кликов и тостов
          App.exitApp()
          return
        }

        // 2. Если пользователь НЕ на главной, но в истории WebView больше нет страниц
        if (!canGoBack) {
          // Тоже выходим из приложения (на случай, если зашли сразу на другую страницу)
          App.exitApp()
          return
        }

        // 3. Во всех остальных случаях — просто идем назад по истории Vue
        router.back()
      })
    })
  }
}

// Настройка статус-бара
async function setupStatusBar() {
  if (Capacitor.isNativePlatform()) {
    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar')
      await StatusBar.setOverlaysWebView({ overlay: true })
      await StatusBar.setStyle({ style: Style.Dark })
    } catch (error) {
      console.warn('StatusBar plugin error:', error)
    }
  }
}

// Запускаем асинхронные настройки перед монтированием приложения
setupBackButton()
setupStatusBar()

// Создаём и монтируем приложение
const app = createApp(AppComponent)
app.use(createPinia())
app.use(router)
app.mount('#app')