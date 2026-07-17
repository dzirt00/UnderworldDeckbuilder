import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { Toast } from '@capacitor/toast'
import { StatusBar, Style } from '@capacitor/status-bar'
import AppComponent from './App.vue'
import router from './router'

// Инициализация обработчика кнопки «Назад»
function setupBackButton() {
  if (Capacitor.isNativePlatform()) {
    App.addListener('backButton', ({ canGoBack }) => {
      nextTick(async () => {
        // Получаем текущий путь во Vue Router
        const currentPath = router.currentRoute.value.path

        // 1. Проверяем, находится ли пользователь на ГЛАВНОМ экране (например, '/')
        if (currentPath === '/') {
          App.exitApp()
          return
        }

        // 2. Если пользователь НЕ на главной, но в истории WebView больше нет страниц
        if (!canGoBack) {
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
      await StatusBar.setOverlaysWebView({ overlay: true })
      await StatusBar.setStyle({ style: Style.Dark })
    } catch (error) {
      console.warn('StatusBar plugin error:', error)
    }
  }
}

// Запускаем настройки перед монтированием приложения
setupBackButton()
setupStatusBar()

// Создаём и монтируем приложение
const app = createApp(AppComponent)
app.use(createPinia())
app.use(router)
app.mount('#app')