<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { decodeDeck, encodeDeck, buildDeckLink } from '@/utils/deckCodec'

interface SavedDeck {
    id: string
    name: string
    description: string
    warbandId: string | null
    cardIds: string[]
    createdAt: string
}

const route = useRoute()
const router = useRouter()
const decks = ref<SavedDeck[]>([])
const importError = ref<string | null>(null)

// Toast-уведомление
const toastMessage = ref<string | null>(null)

// Параметр ссылки (если есть)
const deckParam = computed(() => route.query.deck as string | undefined)

function loadDecks() {
    const data = localStorage.getItem('user_decks')
    decks.value = data ? JSON.parse(data) : []
}

function deleteDeck(id: string) {
    decks.value = decks.value.filter(d => d.id !== id)
    localStorage.setItem('user_decks', JSON.stringify(decks.value))
}

function openDeck(id: string) {
    router.push(`/my-decks/${id}`)
}

// === Импорт по ссылке ===

// Попытка открыть приложение через кастомную схему
function tryOpenApp(encoded: string) {
    const appUri = `warband://import?deck=${encodeURIComponent(encoded)}`
    const fallbackUrl = 'https://yourapp.com/download' // Замените на ваш URL загрузки

    // Пытаемся открыть приложение
    window.location.href = appUri

    // Если через 2.5 секунды мы всё ещё на странице — приложение не открылось
    setTimeout(() => {
        if (document.visibilityState !== 'hidden') {
            window.location.href = fallbackUrl
        }
    }, 2500)
}

// Обработка параметра deck при загрузке
onMounted(() => {
    loadDecks()

    const encoded = deckParam.value
    if (!encoded) return

    router.replace({ query: {} })

    const decoded = decodeDeck(encoded)
    if (!decoded) {
        importError.value = 'Invalid deck link'
        return
    }

    const newDeck: SavedDeck = {
        id: `imported_${Date.now()}`,
        name: decoded.name || 'Imported Deck',
        description: 'Imported from link',
        warbandId: decoded.warbandId,
        cardIds: decoded.cardIds,
        createdAt: new Date().toISOString()
    }

    const existing = decks.value.find(d => d.warbandId === decoded.warbandId && d.cardIds.length === decoded.cardIds.length)
    if (existing) {
        if (!confirm(`Deck "${existing.name}" already exists. Replace it?`)) {
            return
        }
        decks.value = decks.value.filter(d => d.id !== existing.id)
    }

    decks.value.push(newDeck)
    localStorage.setItem('user_decks', JSON.stringify(decks.value))

    tryOpenApp(encoded)
})

// === Генерация ссылки для шеринга ===

function shareDeck(deck: SavedDeck) {
    const encoded = encodeDeck(deck.warbandId, deck.cardIds, deck.name)
    const link = buildDeckLink(encoded)

    // Копируем в буфер обмена
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
            toastMessage.value = 'Deck link copied!'
            setTimeout(() => { toastMessage.value = null }, 2500)
        }).catch(() => {
            // fallback
            prompt('Copy this link:', link)
            toastMessage.value = 'Link copied (manual)'
            setTimeout(() => { toastMessage.value = null }, 2500)
        })
    } else {
        prompt('Copy this link:', link)
        toastMessage.value = 'Link copied (manual)'
        setTimeout(() => { toastMessage.value = null }, 2500)
    }
}
</script>

<template>
    <div class="my-decks">
        <!-- Toast-уведомление -->
        <div v-if="toastMessage" class="toast">
            {{ toastMessage }}
        </div>

        <h1 class="my-decks__title">My Decks</h1>

        <!-- Ошибка импорта -->
        <div v-if="importError" class="import-error">
            {{ importError }}
        </div>

        <div v-if="decks.length === 0" class="empty-state">
            <p>You don't have any saved decks yet.</p>
            <RouterLink to="/builder" class="btn-primary">Create deck</RouterLink>
        </div>

        <div v-else class="decks-grid">
            <div
                    v-for="deck in decks"
                    :key="deck.id"
                    class="deck-card"
                    @click="openDeck(deck.id)"
            >
                <h3 class="deck-card__name">{{ deck.name }}</h3>
                <p class="deck-card__warband">{{ deck.warbandId || 'Without WarBand' }}</p>
                <p class="deck-card__date">{{ new Date(deck.createdAt).toLocaleDateString() }}</p>
                <p class="deck-card__count">{{ deck.cardIds.length }} cards</p>

                <div class="deck-card__actions">
                    <button class="btn-share" @click.stop="shareDeck(deck)" title="Share link">
                        📤
                    </button>
                    <button class="btn-delete" @click.stop="deleteDeck(deck.id)">✕</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* добавляем стили для toast */
.toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #2a5a3a;
    color: #e0e0e0;
    padding: 12px 24px;
    border-radius: 8px;
    border: 1px solid #4a8a5a;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    z-index: 1000;
    font-weight: 500;
    animation: slideDown 0.3s ease;
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

.my-decks {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px 16px;
    color: #e0e0e0;
}
.my-decks__title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 24px;
}
.empty-state {
    text-align: center;
    padding: 40px 0;
}
.empty-state p {
    font-size: 1.2rem;
    margin-bottom: 16px;
    color: #a0a0b8;
}
.btn-primary {
    display: inline-block;
    padding: 10px 24px;
    background: #a0c4ff;
    color: #1a1a2e;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
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
    cursor: pointer;
    transition: 0.2s;
    position: relative;
}
.deck-card:hover {
    background: #2a2a4a;
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.deck-card__name {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 4px;
}
.deck-card__warband {
    font-size: 0.9rem;
    color: #a0a0b8;
    margin-bottom: 4px;
}
.deck-card__date {
    font-size: 0.8rem;
    color: #666;
}
.deck-card__count {
    font-size: 0.85rem;
    color: #a0c4ff;
    margin-top: 8px;
}
.deck-card__actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 12px;
}
.btn-delete {
    background: #5a2a2a;
    border: none;
    color: #ff8a8a;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
    transition: 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}
.btn-delete:hover {
    background: #7a3a3a;
    transform: scale(1.05);
}
.btn-share {
    background: #2a4a6a;
    border: none;
    color: #a0c4ff;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
    transition: 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}
.btn-share:hover {
    background: #3a6a8a;
    transform: scale(1.05);
}
.import-error {
    background: #3a1a1a;
    border: 1px solid #6a2a2a;
    border-radius: 8px;
    padding: 12px;
    color: #ff8a8a;
    margin-bottom: 16px;
}
</style>