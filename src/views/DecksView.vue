<script setup lang="ts">
import { useDeckStore } from '@/store/deckStore'
import { RouterLink } from 'vue-router'

const deckStore = useDeckStore()
const decks = deckStore.decks
</script>

<template>
    <div class="decks-view">
        <h1 class="decks-view__title">Rivals Decks</h1>
        <p class="decks-view__subtitle">All Decks</p>

        <div class="decks-grid">
            <RouterLink
                    v-for="deck in decks"
                    :key="deck.id"
                    :to="`/decks/${deck.id}`"
                    class="deck-card"
            >
                <img
                        v-if="deck.imageDeck"
                        :src="deck.imageDeck"
                        alt=""
                        class="deck-card__icon"
                />
                <div class="deck-card__name">{{ deck.name }}</div>
                <div class="deck-card__description" v-html="deck.description"></div>
            </RouterLink>
        </div>
    </div>
</template>

<style scoped>
.decks-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px 20px 16px;
    color: #e0e0e0;
}

.decks-view__title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 4px;
}

.decks-view__subtitle {
    font-size: 1rem;
    color: #a0a0b8;
    margin-bottom: 24px;
}

.decks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
}

.deck-card {
    background: #1a1a2e;
    border: 1px solid #2a2a4a;
    border-radius: 12px;
    padding: 16px;
    text-decoration: none;
    color: #e0e0e0;
    transition: 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.deck-card:hover {
    background: #2a2a4a;
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    border-color: #4a4a6a;
}

.deck-card__icon {
    width: 48px;
    height: 48px;
    object-fit: contain;
    margin-bottom: 8px;
}

.deck-card__name {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 4px;
    color: #fff;
}

.deck-card__description {
    font-size: 0.9rem;
    color: #a0a0b8;
    line-height: 1.4;
    /* Обрезаем до 3 строк */
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 600px) {
    .decks-grid {
        grid-template-columns: 1fr;
    }
}
</style>