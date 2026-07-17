<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { App } from '@capacitor/app'
import AppHeader from '@/components/common/AppHeader.vue'

const router = useRouter()

// Обработчик глубоких ссылок
async function handleDeepLink(url: string) {
    try {
        const parsed = new URL(url)
        if (parsed.pathname === '/import') {
            const encoded = parsed.searchParams.get('deck')
            if (encoded) {
                router.push({ path: '/import', query: { deck: encoded } })
            }
        }
    } catch (e) {
        console.warn('Invalid deep link:', url)
    }
}

onMounted(() => {
    App.addListener('appUrlOpen', (data: { url: string }) => {
        handleDeepLink(data.url)
    })

    const initialUrl = window.location.href
    if (initialUrl.includes('import?deck=')) {
        handleDeepLink(initialUrl)
    }
})
</script>

<template>
    <div id="app">
        <AppHeader />
        <main class="app-main">
            <RouterView />
        </main>
    </div>
</template>

<style>
/* Global reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  overflow-x: hidden;
  background-color: #0f0f1a !important;
}

body {
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* ДЕСКТОП: ровно впритык к высоте хедера (56px) + безопасная зона */
  padding-top: calc(48px + env(safe-area-inset-top, 0px));
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  position: relative;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.app-main {
  flex: 1;
  /* Уменьшили верхний внутренний отступ до минимума */
  padding: 12px 20px 24px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  overflow-x: hidden;
}

/* Скрываем скроллбар полностью */
::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

/* Для Firefox */
* {
  scrollbar-width: none;
}

/* === СТИЛИ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ === */
@media (max-width: 768px) {
  #app {
    /* МОБИЛКА: ровно впритык к высоте мобильного хедера (92px) + безопасная зона */
    padding-top: calc(48px + env(safe-area-inset-top, 0px));
  }

  .app-main {
    /* Минимальный верхний отступ контента на мобильных (всего 4px) */
    padding: 4px 12px 16px 12px;
  }
}
</style>