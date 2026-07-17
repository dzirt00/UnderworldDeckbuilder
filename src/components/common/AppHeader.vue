<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
    <header class="app-header">
        <div class="app-header__container">

            <!-- Логотип -->
            <RouterLink to="/" class="app-header__logo">
                <span class="logo-icon">⚔️</span>
                <span class="logo-text">Underworlds</span>
            </RouterLink>

            <!-- Навигация свайпом для мобильных -->
            <nav class="app-header__nav">
                <RouterLink to="/" class="nav-link">Home</RouterLink>
                <RouterLink to="/decks" class="nav-link">Decks</RouterLink>
                <RouterLink to="/warbands" class="nav-link">WarBands</RouterLink>
                <RouterLink to="/builder" class="nav-link">Builder</RouterLink>
                <RouterLink to="/my-decks" class="nav-link">My Decks</RouterLink>
            </nav>

        </div>
    </header>
</template>

<style scoped>
.app-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    width: 100%;
    max-width: 100vw;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0 16px;
    /* Автоматический учет безопасной зоны челки/выреза */
    padding-top: env(safe-area-inset-top, 0px);
    min-height: calc(56px + env(safe-area-inset-top, 0px));
    display: flex;
    align-items: center;
}

.app-header__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    padding: 8px 0;
    padding-left: env(safe-area-inset-left, 0px);
    padding-right: env(safe-area-inset-right, 0px);
    gap: 24px;
}

.app-header__logo {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: #ffffff;
    font-weight: 700;
    font-size: 1.1rem;
    flex-shrink: 0;
}

.logo-icon {
    font-size: 1.4rem;
    flex-shrink: 0;
}

.logo-text {
    letter-spacing: 0.5px;
    white-space: nowrap;
}

.app-header__nav {
    display: flex;
    gap: 16px;
    align-items: center;
}

.nav-link {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
    padding: 6px 4px;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
}

.nav-link:hover {
    color: #ffffff;
}

.nav-link.router-link-active {
    color: #ffffff;
    border-bottom-color: #a0c4ff;
    text-shadow: 0 0 10px rgba(160, 196, 255, 0.5);
}

/* ========================================================
   МОБИЛЬНЫЕ УСТРОЙСТВА И ПЛАНШЕТЫ (Ширина экрана <= 768px)
   ======================================================== */
@media (max-width: 768px) {
    .app-header {
        padding: 0 12px;
        padding-top: env(safe-area-inset-top, 0px);
        /* Фиксированная комфортная высота для мобильного хедера */
        height: calc(92px + env(safe-area-inset-top, 0px));
    }

    .app-header__container {
        flex-direction: column;
        align-items: flex-start; /* Выравнивание по левому краю смотрится аккуратнее */
        justify-content: center;
        gap: 8px;
        padding: 6px 0;
    }

    .app-header__logo {
        font-size: 1.05rem; /* Текст крупный и читаемый */
        padding-left: 4px;
    }

    .logo-icon {
        font-size: 1.3rem;
    }

    /* Превращаем навигацию в адаптивную горизонтальную ленту со скроллом */
    .app-header__nav {
        width: 100%;
        justify-content: flex-start;
        gap: 14px;
        overflow-x: auto; /* Разрешаем скролл пальцем по горизонтали */
        white-space: nowrap;
        -webkit-overflow-scrolling: touch; /* Плавный скролл на iOS */
        padding-bottom: 4px; /* Отступ для визуального разделения */
        padding-left: 4px;
    }

    /* Прячем некрасивый системный скроллбар внутри навигации хедера */
    .app-header__nav::-webkit-scrollbar {
        display: none;
    }
    .app-header__nav {
        scrollbar-width: none;
    }

    /* Ссылки крупные, по ним легко попадать пальцем */
    .nav-link {
        font-size: 0.9rem;
        padding: 6px 2px;
    }
}
</style>