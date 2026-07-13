<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { App } from '@capacitor/app'
import AppHeader from '@/components/common/AppHeader.vue'
import { decodeDeck } from '@/utils/deckCodec'

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

    // Также проверить, не было ли приложение открыто по ссылке при старте
    // (Capacitor иногда передаёт URL через window.location.href)
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
html, body, #app {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    min-height: 100vh;
    background-color: #0f0f1a !important; /* Принудительно задаем фон */
}

body {

    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
}


* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #0f0f1a;
    color: #e0e0e0;
    min-height: 100vh;
}

#app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.app-main {
    flex: 1;
    padding: 24px 20px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

@media (max-width: 768px) {
    .app-main{
        padding: 0;
        margin: 0;
    }
}
</style>