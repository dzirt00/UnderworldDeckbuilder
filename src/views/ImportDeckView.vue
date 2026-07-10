<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { decodeDeck } from '@/utils/deckCodec'
import { useWarbandStore } from '@/store/warbandStore'

const router = useRouter()
const warbandStore = useWarbandStore()
const code = ref('')
const error = ref('')

function importDeck() {
    if (!code.value.trim()) {
        error.value = 'Введите код колоды'
        return
    }
    const decoded = decodeDeck(code.value.trim())
    if (!decoded) {
        error.value = 'Неверный код'
        return
    }
    // Проверяем, есть ли уже такая колода
    const savedDecks = JSON.parse(localStorage.getItem('user_decks') || '[]')
    const exists = savedDecks.some((d: any) =>
            d.cardIds.length === decoded.cardIds.length &&
            d.cardIds.every((id: string) => decoded.cardIds.includes(id))
    )
    if (exists) {
        error.value = 'Your have this deck'
        return
    }
    // Сохраняем
    const newDeck = {
        id: `user_${Date.now()}`,
        name: decoded.name || 'Import Deck',
        description: 'Imported by code',
        warbandId: decoded.warbandId,
        cardIds: decoded.cardIds,
        createdAt: new Date().toISOString()
    }
    savedDecks.push(newDeck)
    localStorage.setItem('user_decks', JSON.stringify(savedDecks))
    // Загружаем банду, чтобы показывать
    if (decoded.warbandId) {
        warbandStore.setCurrentWarband(decoded.warbandId)
    }
    router.push('/my-decks')
}
</script>

<template>
    <div class="import-deck">
        <h1>Import Deck</h1>
        <p>Enter the deck code received from another player:</p>
        <textarea
                v-model="code"
                placeholder="Insert code here..."
                rows="4"
        ></textarea>
        <p v-if="error" class="error">{{ error }}</p>
        <button class="btn-import" @click="importDeck">Import</button>
        <button class="btn-cancel" @click="router.push('/')">Cancel</button>
    </div>
</template>

<style scoped>
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