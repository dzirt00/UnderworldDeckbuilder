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
                // Переходим на страницу импорта, передавая закодированные данные
                router.push({ path: '/import', query: { deck: encoded } })
            }
        }
    } catch (e) {
        console.warn('Invalid deep link:', url)
    }
}

onMounted(() => {
    // Слушаем открытие приложения по ссылке
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
/* Глобальный сброс */
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
    /* Базовые отступы для безопасных зон */
    padding-top: env(safe-area-inset-top, 0px);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    padding-left: env(safe-area-inset-left, 0px);
    padding-right: env(safe-area-inset-right, 0px);
}

#app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    /* Учитываем высоту хедера + безопасную зону сверху */
    padding-top: calc(32px + env(safe-area-inset-top, 0px));
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
    position: relative;
    /* Отступ снизу для системных кнопок */
    padding-bottom: env(safe-area-inset-bottom, 0px);
}

.app-main {
    flex: 1;
    padding: 24px 20px;
    padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    overflow-x: hidden;
}

/* Скрываем скроллбар полностью (если нужно) */
::-webkit-scrollbar {
    width: 0;
    background: transparent;
}

/* Для Firefox */
* {
    scrollbar-width: none;
}

@media (max-width: 768px) {
    .app-main {
        padding: 16px 12px;
        padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    }
}
</style>