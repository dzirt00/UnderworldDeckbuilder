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
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0 20px;
    position: sticky;
    top: 0;
    z-index: 100;
    position: sticky;
}
.app-header__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    height: 64px;
}

.app-header__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: #ffffff;
    font-weight: 700;
    font-size: 1.2rem;
}

.logo-icon {
    font-size: 1.8rem;
}

.logo-text {
    letter-spacing: 0.5px;
}

.app-header__nav {
    display: flex;
    gap: 24px;
    align-items: center;
}

.nav-link {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 1rem;
    font-weight: 500;
    transition: color 0.2s;
    padding: 4px 0;
    border-bottom: 2px solid transparent;
}

.nav-link:hover {
    color: #ffffff;
}

.nav-link.router-link-active {
    color: #ffffff;
    border-bottom-color: #a0c4ff;
}

/* Адаптив для мобильных */
@media (max-width: 768px) {
    .app-header__container {
        flex-wrap: wrap;
        height: auto;
        padding: 12px 0;
    }

    .app-header__logo {
        flex: 1 1 100%;
        justify-content: center;
        margin-bottom: 8px;
    }

    .app-header__nav {
        flex: 1 1 100%;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;
    }

    .nav-link {
        font-size: 0.9rem;
    }
}
</style>