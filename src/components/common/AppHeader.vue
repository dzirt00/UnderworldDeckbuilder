<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
    <header class="app-header">
        <div class="app-header__container">
            <RouterLink to="/" class="app-header__logo">
                <span class="logo-icon">⚔️</span>
                <span class="logo-text">Warhammer Underworlds</span>
            </RouterLink>

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
    overflow-x: hidden;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0 12px;
    padding-top: env(safe-area-inset-top, 0px);
    min-height: calc(56px + env(safe-area-inset-top, 0px));
    height: auto;
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
    gap: 8px;
    flex-wrap: wrap;
}

.app-header__logo {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: #ffffff;
    font-weight: 700;
    font-size: 1rem;
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
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    flex: 1 1 auto;
    min-width: 0;
}

.nav-link {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 500;
    transition: color 0.2s;
    padding: 4px 6px;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
}

.nav-link:hover {
    color: #ffffff;
}

.nav-link.router-link-active {
    color: #ffffff;
    border-bottom-color: #a0c4ff;
}

/* Планшеты */
@media (max-width: 600px) {
    .app-header__container {
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 6px 0;
    }

    .app-header__logo {
        font-size: 0.95rem;
    }

    .logo-icon {
        font-size: 1.2rem;
    }

    .app-header__nav {
        gap: 6px;
        width: 100%;
        justify-content: center;
    }

    .nav-link {
        font-size: 0.75rem;
        padding: 2px 4px;
    }
}

/* Очень маленькие экраны (≤ 400px) */
@media (max-width: 400px) {
    .app-header {
        padding: 0 6px;
        min-height: calc(48px + env(safe-area-inset-top, 0px));
    }

    .app-header__container {
        padding: 4px 0;
        gap: 2px;
    }

    .app-header__logo {
        font-size: 0.8rem;
        gap: 4px;
    }

    .logo-icon {
        font-size: 1rem;
    }

    .logo-text {
        font-size: 0.7rem;
    }

    .app-header__nav {
        gap: 4px;
    }

    .nav-link {
        font-size: 0.65rem;
        padding: 2px 3px;
        letter-spacing: -0.2px;
    }
}

/* Экстремально маленькие (≤ 320px) */
@media (max-width: 320px) {
    .app-header__nav {
        gap: 2px;
    }

    .nav-link {
        font-size: 0.6rem;
        padding: 1px 2px;
    }

    .logo-text {
        font-size: 0.6rem;
    }
}
</style>