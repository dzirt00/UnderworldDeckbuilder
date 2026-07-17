<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { decodeDeck, encodeDeck } from '@/utils/deckCodec'

interface SavedDeck {
    id: string
    name: string
    description: string
    warbandId: string | null
    cardIds: string[]
    setIds?: string[]
    createdAt: string
}

const route = useRoute()
const router = useRouter()
const decks = ref<SavedDeck[]>([])
const importError = ref<string | null>(null)
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
    showToast('Deck deleted')
}

function openDeck(id: string) {
    router.push(`/my-decks/${id}`)
}

function editDeck(deck: SavedDeck) {
    // Передаем данные колоды через query параметры
    router.push({
        path: '/builder',
        query: {
            edit: deck.id,
            warbandId: deck.warbandId || '',
            cardIds: deck.cardIds.join(','),
            deckName: deck.name,
            setIds: (deck.setIds || []).join(',')
        }
    })
}

// === Toast уведомления ===
function showToast(msg: string) {
    toastMessage.value = msg
    setTimeout(() => { toastMessage.value = null }, 2500)
}

// === Импорт по ссылке (автоматический при открытии) ===

onMounted(() => {
    loadDecks()

    const encoded = deckParam.value
    if (!encoded) return

    // Убираем параметр из URL, чтобы не мешал
    router.replace({ query: {} })

    const decoded = decodeDeck(encoded)
    if (!decoded) {
        importError.value = 'Invalid deck link'
        return
    }

    // Проверяем, существует ли уже такая колода (сравниваем warbandId и cardIds)
    const existing = decks.value.find(d =>
            d.warbandId === decoded.warbandId &&
            d.cardIds.length === decoded.cardIds.length &&
            d.cardIds.every(id => decoded.cardIds.includes(id))
    )

    if (existing) {
        if (!confirm(`Deck "${existing.name}" already exists. Replace it?`)) {
            showToast('Import cancelled')
            return
        }
        // Удаляем старую
        decks.value = decks.value.filter(d => d.id !== existing.id)
    }

    // Создаём новую колоду
    const newDeck: SavedDeck = {
        id: `imported_${Date.now()}`,
        name: decoded.name || 'Imported Deck',
        description: 'Imported from link',
        warbandId: decoded.warbandId,
        cardIds: decoded.cardIds,
        setIds: [],
        createdAt: new Date().toISOString()
    }

    decks.value.push(newDeck)
    localStorage.setItem('user_decks', JSON.stringify(decks.value))
    showToast(`Deck "${newDeck.name}" imported successfully!`)
})

// === Генерация и копирование ссылки для шеринга ===

function shareDeck(deck: SavedDeck) {
    // 1. Кодируем данные
    const encoded = encodeDeck(deck.warbandId, deck.cardIds, deck.name)

    // 2. Формируем ссылку с кастомной схемой (откроет приложение)
    //    Используем ту же схему, что настроена в AndroidManifest.xml / Info.plist
    const link = `underworlddeckbuilder://import?deck=${encoded}`

    // 3. Копируем в буфер обмена
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link)
                .then(() => showToast('Deck link copied!'))
                .catch(() => {
                    // fallback
                    prompt('Copy this link:', link)
                    showToast('Link copied (manual)')
                })
    } else {
        prompt('Copy this link:', link)
        showToast('Link copied (manual)')
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
                    <button class="btn-edit" @click.stop="editDeck(deck)" title="Edit deck">
                        ✏️
                    </button>
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

/* остальные стили (my-decks, deck-card и т.д.) оставляем как были */
.my-decks {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px 20px 16px;
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
.btn-edit {
    background: #4a5a2a;
    border: none;
    color: #c4ffa0;
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
.btn-edit:hover {
    background: #6a8a3a;
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