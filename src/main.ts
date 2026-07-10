import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import AppComponent from './App.vue'
import router from './router'

let lastBackPress = 0

// Инициализация обработчика кнопки «Назад» (только в нативном приложении)
async function setupBackButton() {
  // Проверяем, что мы в Capacitor-среде
  if (typeof Capacitor !== 'undefined' && Capacitor.isNative) {
    const { App } = await import('@capacitor/app')
    App.addListener('backButton', () => {
      nextTick(() => {
        const currentPath = router.currentRoute.value.path
        if (currentPath !== '/') {
          router.push('/')
        } else {
          const now = Date.now()
          if (now - lastBackPress < 2000) {
            App.exitApp()
          } else {
            lastBackPress = now
            console.log('Нажмите ещё раз для выхода')
          }
        }
      })
    })
  }
}

// Настройка статус-бара (только в нативном приложении)
async function setupStatusBar() {
  if (typeof Capacitor !== 'undefined' && Capacitor.isNative) {
    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar')
      await StatusBar.setOverlaysWebView({ overlay: true })
      await StatusBar.setStyle({ style: Style.Dark })
    } catch (error) {
      console.warn('StatusBar plugin error:', error)
    }
  }
}

// Запускаем настройки
setupBackButton()
setupStatusBar()

// Создаём и монтируем приложение
const app = createApp(AppComponent)
app.use(createPinia())
app.use(router)
app.mount('#app')