<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { decodeDeck } from '@/utils/deckCodec'
import { useWarbandStore } from '@/store/warbandStore'

const route = useRoute()
const router = useRouter()
const warbandStore = useWarbandStore()

const code = ref('')
const error = ref('')
const isProcessing = ref(false)

/**
 * Основная логика импорта (используется как для ручного ввода, так и для автоимпорта)
 */
function performImport(encoded: string): boolean {
    const trimmed = encoded.trim()
    if (!trimmed) {
        error.value = 'Введите код колоды'
        return false
    }

    const decoded = decodeDeck(trimmed)
    if (!decoded) {
        error.value = 'Неверный код'
        return false
    }

    // Проверяем, есть ли уже такая колода (сравниваем warbandId и cardIds)
    const savedDecks = JSON.parse(localStorage.getItem('user_decks') || '[]')
    const exists = savedDecks.some((d: any) =>
            d.warbandId === decoded.warbandId &&
            d.cardIds.length === decoded.cardIds.length &&
            d.cardIds.every((id: string) => decoded.cardIds.includes(id))
    )

    if (exists) {
        error.value = 'You already have this deck'
        return false
    }

    // Сохраняем новую колоду
    const newDeck = {
        id: `user_${Date.now()}`,
        name: decoded.name || 'Imported Deck',
        description: 'Imported by code',
        warbandId: decoded.warbandId,
        cardIds: decoded.cardIds,
        createdAt: new Date().toISOString()
    }
    savedDecks.push(newDeck)
    localStorage.setItem('user_decks', JSON.stringify(savedDecks))

    // Загружаем банду для отображения (опционально)
    if (decoded.warbandId) {
        warbandStore.setCurrentWarband(decoded.warbandId)
    }

    return true
}

/**
 * Обработчик кнопки "Import"
 */
function importDeck() {
    if (isProcessing.value) return
    isProcessing.value = true
    error.value = ''

    const success = performImport(code.value)
    if (success) {
        // Перенаправляем на список колод
        router.push('/my-decks')
    }
    isProcessing.value = false
}

/**
 * Автоматический импорт при открытии страницы с параметром ?deck=...
 */
function autoImportFromQuery() {
    const encoded = route.query.deck as string
    if (!encoded) return

    code.value = encoded // заполняем поле для видимости
    error.value = ''

    const success = performImport(encoded)
    if (success) {
        // После успешного импорта можно показать уведомление и перенаправить
        // или оставить пользователя на этой странице с сообщением
        // Для лучшего UX — перенаправляем через секунду
        setTimeout(() => {
            router.push('/my-decks')
        }, 1000)
    } else {
        // Если ошибка (например, уже существует), показываем её, но не перенаправляем
        // Пользователь может исправить вручную
    }
}

onMounted(() => {
    autoImportFromQuery()
})
</script>

<template>
    <div class="import-deck">
        <h1>Import Deck</h1>
        <p>Enter the deck code received from another player:</p>
        <textarea
                v-model="code"
                placeholder="Insert code here..."
                rows="4"
                :disabled="isProcessing"
        ></textarea>
        <p v-if="error" class="error">{{ error }}</p>
        <button class="btn-import" @click="importDeck" :disabled="isProcessing">
            {{ isProcessing ? 'Importing...' : 'Import' }}
        </button>
        <button class="btn-cancel" @click="router.push('/')">Cancel</button>
    </div>
</template>

<style scoped>
/* стили остаются без изменений */
.import-deck {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    color: #e0e0e0;
}
textarea {
    width: 100%;
    padding: 12px;
    background: #1a1a2e;
    border: 1px solid #2a2a4a;
    color: #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    font-family: monospace;
    resize: vertical;
}
.error {
    color: #ff6b6b;
    margin: 8px 0;
}
.btn-import {
    background: #a0c4ff;
    color: #1a1a2e;
    border: none;
    padding: 10px 24px;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    margin-right: 12px;
}
.btn-import:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
.btn-cancel {
    background: #3a3a5a;
    color: #fff;
    border: none;
    padding: 10px 24px;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
}
</style>