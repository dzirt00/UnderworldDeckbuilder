<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
    <div class="home-view">
        <h1 class="home-view__title">Welcome</h1>
        <p class="home-view__subtitle">Manage your Warhammer Underworlds decks and warbands.</p>

        <div class="home-view__buttons">
            <RouterLink to="/builder" class="home-view__button">
                <span class="button-icon">🛠️</span> Create Deck
            </RouterLink>
            <RouterLink to="/warbands" class="home-view__button">
                <span class="button-icon">⚔️</span> View WarBands
            </RouterLink>
            <RouterLink to="/decks" class="home-view__button">
                <span class="button-icon">📜</span> View Decks
            </RouterLink>
            <RouterLink to="/my-decks" class="home-view__button">
                <span class="button-icon">📂</span> My Decks
            </RouterLink>
            <RouterLink to="/import" class="home-view__button">
                <span class="button-icon">📥</span> Import Deck
            </RouterLink>
            <RouterLink to="/feedback" class="home-view__button">
                <span class="button-icon">✉️</span>Feedback
            </RouterLink>
        </div>
    </div>
</template>

<style scoped>
.home-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 70vh;
    text-align: center;
}

.home-view__title {
    font-size: 2.8rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    color: white;
}

.home-view__subtitle {
    font-size: 1.3rem;
    color: #a0c4ff;
    margin-bottom: 2.5rem;
}

.home-view__buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 400px;
}

.home-view__button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: #ffffff;
    font-size: 1.2rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.3s ease;
}

.home-view__button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.4);
}

.button-icon {
    font-size: 1.6rem;
    line-height: 1;
}
</style>