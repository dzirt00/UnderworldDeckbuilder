<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWarbandStore } from '@/store/warbandStore'
import { useDeckStore } from '@/store/deckStore'
import type { Card } from '@/api/interface/Card'
import FullscreenImage from '@/components/common/FullscreenImage.vue'
import { buildDeckLink, encodeDeck } from '@/utils/deckCodec'

const route = useRoute()
const router = useRouter()
const warbandStore = useWarbandStore()
const deckStore = useDeckStore()

const deckId = computed(() => route.params.id as string)
const deckData = ref<any>(null)
const activeTab = ref<'deck' | 'fighters' | 'abilities'>('deck')

// Состояние для уведомления о копировании
const copyMessage = ref<string | null>(null)
let copyTimeout: number | null = null

function showCopyNotification(message: string) {
    copyMessage.value = message
    if (copyTimeout) clearTimeout(copyTimeout)
    copyTimeout = window.setTimeout(() => {
        copyMessage.value = null
        copyTimeout = null
    }, 2500)
}

const previewImage = ref<string | null>(null)
const showInspired = ref<Record<string, boolean>>({})

function toggleSide(fighterId: string) {
    showInspired.value[fighterId] = !showInspired.value[fighterId]
}

function openPreview(image: string) {
    previewImage.value = image
}

function closePreview() {
    previewImage.value = null
}

function loadDeck() {
    const data = localStorage.getItem('user_decks')
    if (!data) {
        router.push('/my-decks')
        return
    }
    const decks = JSON.parse(data)
    const found = decks.find((d: any) => d.id === deckId.value)
    if (!found) {
        router.push('/my-decks')
        return
    }
    deckData.value = found
    if (found.warbandId) {
        warbandStore.setCurrentWarband(found.warbandId)
    }
}

onMounted(loadDeck)
watch(deckId, loadDeck)

const cards = computed<Card[]>(() => {
    if (!deckData.value) return []
    return deckData.value.cardIds
            .map((id: string) => deckStore.cardMap.get(id))
            .filter((c: Card | undefined): c is Card => c !== undefined)
})

const objectives = computed(() => cards.value.filter(c => c.type === 'objective'))
const ploys = computed(() => cards.value.filter(c => c.type === 'ploy'))
const upgrades = computed(() => cards.value.filter(c => c.type === 'upgrade'))

const warband = computed(() => warbandStore.currentWarband)
const fighters = computed(() => warbandStore.currentFighters)
const abilitySheets = computed(() => warband.value?.abilitySheetWarBands || [])

function goBack() {
    router.push('/my-decks')
}

function editDeck() {
    if (!deckData.value) return

    const query: any = {
        edit: deckData.value.id,
        warbandId: deckData.value.warbandId || '',
        cardIds: deckData.value.cardIds.join(','),
        deckName: deckData.value.name
    }

    // Добавляем setIds только если они есть
    if (deckData.value.setIds && deckData.value.setIds.length > 0) {
        query.setIds = deckData.value.setIds.join(',')
    }

    router.push({
        path: '/builder',
        query
    })
}

function shareDeck() {
    if (!deckData.value) return

    const encoded = encodeDeck(
            deckData.value.warbandId,
            deckData.value.cardIds,
            deckData.value.name
    )

    // Ссылка с кастомной схемой (откроет приложение)
    const link = `underworlddeckbuilder://import?deck=${encoded}`

    // Копируем ссылку
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
            showCopyNotification('Deck link copied!')
        }).catch(() => {
            prompt('Copy this link:', link)
        })
    } else {
        prompt('Copy this link:', link)
    }
}
</script>

<template>
    <div class="user-deck-detail">
        <!-- Кастомное уведомление о копировании -->
        <div v-if="copyMessage" class="copy-notification">
            {{ copyMessage }}
        </div>

        <div v-if="!deckData" class="loading">Загрузка...</div>
        <div v-else>
            <div class="header">
                <button class="btn-back" @click="goBack">Back</button>
                <h1 class="title">{{ deckData.name }}</h1>
                <span class="badge">{{ deckData.warbandId || 'Without WarBand' }}</span>
                <button class="btn-edit" @click="editDeck">✏️ Edit</button>
                <button class="btn-share" @click="shareDeck">Share</button>
            </div>

            <!-- Вкладки -->
            <div class="tabs">
                <button class="tab" :class="{ active: activeTab === 'deck' }" @click="activeTab = 'deck'">
                    Deck ({{ cards.length }})
                </button>
                <button class="tab" :class="{ active: activeTab === 'fighters' }" @click="activeTab = 'fighters'">
                    Fighter
                </button>
                <button class="tab" :class="{ active: activeTab === 'abilities' }" @click="activeTab = 'abilities'">
                    WarScroll
                </button>
            </div>

            <!-- Содержимое вкладок -->
            <div class="content">
                <!-- Вкладка "Колода" -->
                <div v-if="activeTab === 'deck'">
                    <div class="deck-section">
                        <h3>Objectives ({{ objectives.length }})</h3>
                        <div class="card-grid">
                            <div
                                    v-for="c in objectives"
                                    :key="c.id"
                                    class="card-grid-item"
                                    @click="openPreview(c.image)"
                            >
                                <img :src="c.image" :alt="c.name" class="card-image-thumb"/>
                                <div class="card-name-overlay">{{ c.name }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="deck-section">
                        <h3>Ploys ({{ ploys.length }})</h3>
                        <div class="card-grid">
                            <div
                                    v-for="c in ploys"
                                    :key="c.id"
                                    class="card-grid-item"
                                    @click="openPreview(c.image)"
                            >
                                <img :src="c.image" :alt="c.name" class="card-image-thumb"/>
                                <div class="card-name-overlay">{{ c.name }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="deck-section">
                        <h3>Upgrades ({{ upgrades.length }})</h3>
                        <div class="card-grid">
                            <div
                                    v-for="c in upgrades"
                                    :key="c.id"
                                    class="card-grid-item"
                                    @click="openPreview(c.image)"
                            >
                                <img :src="c.image" :alt="c.name" class="card-image-thumb"/>
                                <div class="card-name-overlay">{{ c.name }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Вкладка "Юниты" -->
                <div v-if="activeTab === 'fighters'">
                    <div v-if="fighters.length === 0" class="empty-state">
                        There is no data on the fighters for this gang.
                    </div>
                    <div v-else class="fighters-grid">
                        <div
                                v-for="f in fighters"
                                :key="f.id"
                                class="fighter-card"
                                @click="toggleSide(f.id)"
                        >
                            <div class="fighter-image-wrapper">
                                <img
                                        :src="showInspired[f.id] ? f.imageInspired : f.imageDefault"
                                        :alt="f.id"
                                        class="fighter-image"
                                />
                                <button
                                        class="btn-zoom"
                                        @click.stop="openPreview(showInspired[f.id] ? f.imageInspired : f.imageDefault)"
                                        title="Увеличить"
                                >
                                    🔍
                                </button>
                            </div>
                            <span class="fighter-side">
                                {{ showInspired[f.id] ? 'Inspired' : 'Default' }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Вкладка "Абилки" -->
                <div v-if="activeTab === 'abilities'">
                    <div v-if="abilitySheets.length === 0" class="empty-state">
                        WarScroll Unavailable.
                    </div>
                    <div v-else class="ability-grid">
                        <img
                                v-for="(img, idx) in abilitySheets"
                                :key="idx"
                                :src="img"
                                alt="ability sheet"
                                class="ability-image"
                                @click="openPreview(img)"
                        />
                    </div>
                </div>
            </div>
        </div>

        <FullscreenImage
                :src="previewImage"
                @close="closePreview"
        />
    </div>
</template>

<style scoped>
.user-deck-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px 20px 16px;
    color: #e0e0e0;
}

/* Кастомное уведомление */
.copy-notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #2a5a2a;
    color: #e0e0e0;
    padding: 12px 24px;
    border-radius: 8px;
    border: 1px solid #4a8a4a;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    z-index: 1000;
    font-weight: 500;
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
}

.loading {
    text-align: center;
    padding: 40px 0;
}

.header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
}

.btn-back {
    background: #3a3a5a;
    border: none;
    color: #fff;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
}
.btn-back:hover {
    background: #4a4a6a;
}

.btn-edit {
    background: #4a5a2a;
    border: none;
    color: #c4ffa0;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: 0.2s;
}
.btn-edit:hover {
    background: #6a8a3a;
}

.btn-share {
    background: #2a4a6a;
    border: none;
    color: #a0c4ff;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: 0.2s;
}
.btn-share:hover {
    background: #3a6a8a;
}

.title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
}

.badge {
    background: #2a2a4a;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    color: #a0c4ff;
}

.tabs {
    display: flex;
    gap: 12px;
    border-bottom: 1px solid #2a2a3e;
    margin-bottom: 24px;
}

.tab {
    background: transparent;
    border: none;
    padding: 8px 16px;
    font-size: 1rem;
    color: #a0a0b8;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: 0.2s;
}
.tab:hover {
    color: #e0e0e0;
}
.tab.active {
    color: #fff;
    border-bottom-color: #a0c4ff;
}

.content {
    padding-top: 8px;
}

.deck-section {
    margin-bottom: 24px;
}
.deck-section h3 {
    font-size: 1.2rem;
    margin-bottom: 8px;
    color: #a0c4ff;
}

.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 12px;
}
.card-grid-item {
    background: #1a1a2e;
    border: 1px solid #2a2a4a;
    border-radius: 6px;
    padding: 6px;
    cursor: pointer;
    transition: 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.card-grid-item:hover {
    border-color: #a0c4ff;
    transform: scale(1.02);
}
.card-image-thumb {
    width: 100%;
    aspect-ratio: 0.7;
    object-fit: contain;
    background: #0f0f1a;
    border-radius: 4px;
}
.card-name-overlay {
    font-size: 0.75rem;
    text-align: center;
    margin-top: 4px;
    color: #b0b0c8;
    line-height: 1.2;
}

.fighters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
}
.fighter-card {
    background: #1a1a2e;
    border: 1px solid #2a2a4a;
    border-radius: 8px;
    padding: 12px;
    text-align: center;
    cursor: pointer;
    transition: 0.2s;
}
.fighter-card:hover {
    border-color: #4a4a6a;
}
.fighter-image-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 0.7;
    background: #0f0f1a;
    border-radius: 4px;
    overflow: hidden;
}
.fighter-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
.btn-zoom {
    position: absolute;
    bottom: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.6);
    border: none;
    color: #fff;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    font-size: 14px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
}
.fighter-card:hover .btn-zoom {
    opacity: 1;
}
.fighter-side {
    font-size: 0.75rem;
    color: #a0a0b8;
}

.ability-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.ability-image {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
    border: 1px solid #3a3a5a;
    border-radius: 8px;
    background: #0f0f1a;
    cursor: pointer;
    transition: 0.2s;
}
.ability-image:hover {
    border-color: #a0c4ff;
}

.empty-state {
    text-align: center;
    padding: 40px 0;
    color: #a0a0b8;
}

@media (max-width: 600px) {
    .card-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
    .fighters-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
}
</style>