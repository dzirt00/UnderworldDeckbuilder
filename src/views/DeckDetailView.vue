<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDeckStore } from '@/store/deckStore'
import type { Card } from '@/api/interface/Card'

import CardTable from '@/components/deck/CardTable.vue'
import FullscreenImage from '@/components/common/FullscreenImage.vue' // Импорт вместо CardPopup

const route = useRoute()
const router = useRouter()
const deckStore = useDeckStore()

const deckId = computed(() => route.params.id as string)

// Состояние полноэкранного изображения
const imageSrc = ref<string | null>(null)

// Загрузка колоды
onMounted(() => {
    if (deckId.value) {
        deckStore.setCurrentDeck(deckId.value)
    }
})

watch(deckId, (newId) => {
    if (newId) {
        deckStore.setCurrentDeck(newId)
    }
})

const currentDeck = computed(() => deckStore.currentDeck)
const filteredCards = computed(() => deckStore.filteredCards)

// Открытие полноэкранного изображения карты
function openPopup(card: Card, event: MouseEvent) {
    // Предполагаем, что у карты есть поле image (или imageUrl)
    imageSrc.value = card.image || null
}

function closePopup() {
    imageSrc.value = null
}

function goBack() {
    router.push('/decks')
}
</script>

<template>
    <div class="deck-detail">
        <div v-if="!currentDeck" class="deck-detail__error">
            <p>Deck not found</p>
            <button @click="goBack" class="btn-back">Вернуться к списку</button>
        </div>

        <template v-else>
            <!-- Заголовок с кнопкой "Назад" -->
            <div class="deck-detail__header">
                <div class="header-row">
                    <button class="btn-back" @click="goBack">Back</button>
                    <div class="deck-detail__title-wrapper">
                        <img
                                v-if="currentDeck.imageDeck"
                                :src="currentDeck.imageDeck"
                                alt="set icon"
                                class="deck-detail__icon"
                        />
                        <h1 class="deck-detail__title">{{ currentDeck.name }}</h1>
                    </div>
                </div>
                <div
                        class="deck-detail__description"
                        v-html="currentDeck.description"
                ></div>
            </div>

            <!-- Фильтры и таблица -->
            <div class="table-controls">
                <div class="filter-group">
                    <label for="filter-type">Type:</label>
                    <select
                            id="filter-type"
                            :value="deckStore.filterType"
                            @change="(e) => deckStore.setFilterType((e.target as HTMLSelectElement).value as any)"
                    >
                        <option value="all">All</option>
                        <option value="objective">Objectives</option>
                        <option value="ploy">Ploys</option>
                        <option value="upgrade">Upgrades</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="search">Search:</label>
                    <input
                            id="search"
                            type="text"
                            :value="deckStore.searchQuery"
                            @input="(e) => deckStore.setSearchQuery((e.target as HTMLInputElement).value)"
                            placeholder="Название или описание..."
                    />
                </div>
            </div>

            <CardTable :cards="filteredCards" @show-card="openPopup" />
        </template>

        <!-- Полноэкранный просмотр изображения вместо попапа -->
        <FullscreenImage
                :src="imageSrc"
                @close="closePopup"
        />
    </div>
</template>

<style scoped>
/* Стили остаются без изменений */
.deck-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px 20px 16px;
    color: #e0e0e0;
}

.deck-detail__error {
    text-align: center;
    padding: 40px 0;
}
.deck-detail__error p {
    font-size: 1.2rem;
    margin-bottom: 16px;
}
.btn-back {
    background: #3a3a5a;
    border: none;
    color: #fff;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: 0.2s;
}
.btn-back:hover {
    background: #4a4a6a;
}

.header-row {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 12px;
}

.deck-detail__title-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
}
.deck-detail__icon {
    width: 40px;
    height: 40px;
    object-fit: contain;
}
.deck-detail__title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
}

.deck-detail__description {
    font-size: 1rem;
    line-height: 1.6;
    color: #c0c0d0;
    white-space: pre-line;
}
.deck-detail__description :deep(b) {
    color: #ffffff;
}

.table-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
    margin-bottom: 20px;
    background: rgba(255,255,255,0.04);
    padding: 12px 16px;
    border-radius: 8px;
}
.filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
}
.filter-group label {
    font-weight: 500;
    color: #b0b0c8;
}
.filter-group select,
.filter-group input {
    background: #1a1a2e;
    border: 1px solid #3a3a5a;
    color: #e0e0e0;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 0.95rem;
}
.filter-group select:focus,
.filter-group input:focus {
    outline: none;
    border-color: #a0c4ff;
}

@media (max-width: 768px) {
    .table-controls {
        flex-direction: column;
        align-items: stretch;
    }
    .filter-group {
        flex-direction: column;
        align-items: stretch;
    }

    .filter-group select,
    .filter-group input {
        width: 100%;
    }
}
</style>