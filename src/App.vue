<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { App } from '@capacitor/app'
import { Toast } from '@capacitor/toast'
import AppHeader from '@/components/common/AppHeader.vue'

const router = useRouter()
let lastBackPress = 0

const handleBackButton = async () => {
    const currentPath = router.currentRoute.value.path
    // Если не на главной странице — возвращаемся
    if (currentPath !== '/' && currentPath !== '/home') {
        router.back()
        return
    }

    // На главной — двойное нажатие для выхода
    const now = Date.now()
    if (now - lastBackPress > 2000) {
        await Toast.show({
            text: 'Нажмите ещё раз, чтобы выйти',
            duration: 'short',
        })
        lastBackPress = now
    } else {
        App.exitApp()
    }
}

onMounted(() => {
    App.addListener('backButton', handleBackButton)
})

onUnmounted(() => {
    App.removeAllListeners()
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