<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBuilderStore } from '@/store/builderStore'
import { useWarbandStore } from '@/store/warbandStore'
import { useDeckStore } from '@/store/deckStore'
import type { Card } from '@/api/interface/Card'
import FullscreenImage from '@/components/common/FullscreenImage.vue'
import greyCircle from '@/components/images/greyCircle.vue'
import yellowCircle from '@/components/images/yellowCircle.vue'

const route = useRoute()
const router = useRouter()
const builderStore = useBuilderStore()
const warbandStore = useWarbandStore()
const deckStore = useDeckStore()

// Все банды и карты
const warbands = warbandStore.warbands
const allCards = deckStore.cards

// Название колоды
const deckName = ref('')

// Режим редактирования
const isEditMode = ref(false)
const editDeckId = ref<string | null>(null)
const isLoadingDeck = ref(false)

// ---- Шаг 1: Поиск по бандам ----
const warbandSearchQuery = ref('')
const filteredWarbands = computed(() => {
    const query = warbandSearchQuery.value.trim().toLowerCase()
    if (!query) return warbands
    return warbands.filter(w => w.name.toLowerCase().includes(query))
})

// ---- Шаг 2: Выбранные деки ----
const selectedDeckIds = computed(() => builderStore.selectedDeckIds)

function toggleDeck(deckId: string) {
    const current = builderStore.selectedDeckIds
    if (current.includes(deckId)) {
        builderStore.setDecks(current.filter(id => id !== deckId))
        return
    }
    if (current.length >= 2) return
    builderStore.setDecks([...current, deckId])
}

// Авто-переход на шаг 3, когда выбрано ровно 2 дека
watch(selectedDeckIds, (val) => {
    if (builderStore.step === 2 && val.length === 2) {
        goToStep(3)
    }
    // Если на шаге 3 убрали дек – возвращаемся на шаг 2
    if (val.length < 2 && builderStore.step === 3) {
        goToStep(2)
    }
})

// Сброс выбранных карт при изменении деков (чтобы не оставались карты из удалённых сетов)
watch(selectedDeckIds, () => {
    if (builderStore.step >= 2 && !isLoadingDeck.value) {
        builderStore.clearSelection()
    }
})

// Автоустановка имени колоды (на шаге 3)
watch(
        () => builderStore.selectedWarbandId,
        (newId) => {
            if (builderStore.step === 3 && newId && !isEditMode.value) {
                const warband = warbands.find(w => w.id === newId)
                if (warband) deckName.value = warband.name
            }
        },
        { immediate: true }
)

watch(
        () => builderStore.step,
        (newStep) => {
            if (newStep === 3 && builderStore.selectedWarbandId && !isEditMode.value) {
                const warband = warbands.find(w => w.id === builderStore.selectedWarbandId)
                if (warband) deckName.value = warband.name
            }
        }
)

// ---- Шаг 3: Выбор карт ----
const filterType = ref<'all' | 'objective' | 'ploy' | 'upgrade'>('all')
const searchQuery = ref('')

// Фильтрация доступных карт ТОЛЬКО по выбранным декам
const filteredAvailableCards = computed(() => {
    let cards = allCards

    // 🔴 главное ограничение – только выбранные деки
    const selectedSet = new Set(selectedDeckIds.value)
    cards = cards.filter(c => selectedSet.has(c.setId))

    // Убрать уже выбранные
    const selectedIds = new Set(builderStore.selectedCardIds)
    cards = cards.filter(c => !selectedIds.has(c.id))

    // Убрать forsaken
    cards = cards.filter(c => !c.forsaken)

    // Фильтр по типу
    if (filterType.value !== 'all') {
        cards = cards.filter(c => c.type === filterType.value)
    }

    // Поиск
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.trim().toLowerCase()
        cards = cards.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q)
        )
    }

    return cards
})

// ---- Выбранные карты ----
const selectedCards = computed<Card[]>(() => {
    return builderStore.selectedCardIds
            .map(id => allCards.find(c => c.id === id))
            .filter((c): c is Card => c !== undefined)
})

const selectedObjectives = computed(() => selectedCards.value.filter(c => c.type === 'objective'))
const selectedPloys = computed(() => selectedCards.value.filter(c => c.type === 'ploy'))
const selectedUpgrades = computed(() => selectedCards.value.filter(c => c.type === 'upgrade'))

// ---- Валидация (без проверки сетов) ----
const duplicateNames = computed(() => {
    const names = selectedCards.value.map(c => c.name)
    const duplicates = new Set<string>()
    const seen = new Set<string>()
    for (const name of names) {
        if (seen.has(name)) duplicates.add(name)
        seen.add(name)
    }
    return duplicates
})

const surgeCount = computed(() => selectedCards.value.filter(c => c.surge).length)
const restrictedCount = computed(() => selectedCards.value.filter(c => c.restricted).length)

const deckNameError = computed(() => {
    const trimmed = deckName.value.trim()
    if (!trimmed) return 'Deck name is required'
    if (trimmed.length > 50) return 'Deck name must be 50 characters or less'
    return null
})

const allValidationErrors = computed(() => {
    const errors: string[] = []
    if (deckNameError.value) errors.push(deckNameError.value)

    const objCount = selectedObjectives.value.length
    const ployCount = selectedPloys.value.length
    const upgCount = selectedUpgrades.value.length

    if (objCount < 12) errors.push(`Objectives: at least 12 must be selected (${objCount})`)
    if (ployCount < 10) errors.push(`Ploys: minimum of 10 selected (${ployCount})`)
    if (upgCount < 10) errors.push(`Upgrades: minimum 10, selected (${upgCount})`)
    if (ployCount !== upgCount) {
        errors.push(`Ploys and Upgrades must be equal: Ploys ${ployCount}, Upgrades ${upgCount}`)
    }
    if (duplicateNames.value.size > 0) {
        errors.push(`Duplicate cards: ${Array.from(duplicateNames.value).join(', ')}`)
    }
    if (surgeCount.value > 6) {
        errors.push(`Too many cards with Surge: ${surgeCount.value} (max 6)`)
    }
    if (restrictedCount.value > 1) {
        errors.push(`Too many "Restricted" cards: ${restrictedCount.value} (max 1)`)
    }
    return errors
})

const isValid = computed(() => allValidationErrors.value.length === 0)

// ---- Действия с картами ----
function addCard(cardId: string) {
    builderStore.addCard(cardId)
}

function removeCard(cardId: string) {
    builderStore.removeCard(cardId)
}

function clearAllCards() {
    if (selectedCards.value.length > 0) builderStore.clearSelection()
}

function goToStep(step: number) {
    builderStore.setStep(step)
}

// Автопереход на шаг 2 после выбора банды
watch(
        () => builderStore.selectedWarbandId,
        (newVal) => {
            if (newVal && builderStore.step === 1) goToStep(2)
        }
)

// ---- Предпросмотр карты ----
const previewImage = ref<string | null>(null)

function showCardPreview(card: Card) {
    previewImage.value = card.image
}

function closePreview() {
    previewImage.value = null
}

// ---- Glory ----
const sumGloryByType = computed(() => {
    const types = ['objective', 'ploy', 'upgrade'] as const
    const result: Record<typeof types[number], number> = { objective: 0, ploy: 0, upgrade: 0 }
    for (const type of types) {
        result[type] = selectedCards.value
                .filter(c => c.type === type)
                .reduce((sum, c) => sum + (c.glory || 0), 0)
    }
    return result
})

const totalGlory = computed(() => {
    return selectedCards.value.reduce((sum, c) => sum + (c.glory || 0), 0)
})

const objectivesWithSurge = computed(() => selectedObjectives.value.filter(c => c.surge))
const objectivesWithoutSurge = computed(() => selectedObjectives.value.filter(c => !c.surge))
const glorySurgeObjectives = computed(() =>
        objectivesWithSurge.value.reduce((sum, c) => sum + (c.glory || 0), 0)
)
const gloryNonSurgeObjectives = computed(() =>
        objectivesWithoutSurge.value.reduce((sum, c) => sum + (c.glory || 0), 0)
)

// ---- Загрузка данных для редактирования ----
function loadDeckForEdit() {
    const editId = route.query.edit as string
    if (!editId) {
        // Если нет параметра edit, сбрасываем состояние для создания новой колоды
        resetToNewDeck()
        return
    }

    isEditMode.value = true
    editDeckId.value = editId
    isLoadingDeck.value = true

    // Сбрасываем состояние билдера перед загрузкой данных
    builderStore.resetBuilder()

    const savedDecks = JSON.parse(localStorage.getItem('user_decks') || '[]')
    const deck = savedDecks.find((d: any) => d.id === editId)

    if (!deck) {
        // Если колода не найдена, просто переходим в режим создания
        resetToNewDeck()
        return
    }

    // Устанавливаем название сразу
    deckName.value = deck.name

    // Применяем данные колоды
    applyDeckData(deck)
}

function resetToNewDeck() {
    isEditMode.value = false
    editDeckId.value = null
    isLoadingDeck.value = false
    deckName.value = ''
    builderStore.resetBuilder()
    goToStep(1)
}

function applyDeckData(deck: any) {
    console.log('Applying deck data:', deck)

    // Устанавливаем банду
    if (deck.warbandId) {
        builderStore.setSelectedWarband(deck.warbandId)
    }

    // Устанавливаем деки (setIds)
    if (deck.setIds && deck.setIds.length > 0) {
        console.log('Setting decks:', deck.setIds)
        builderStore.setDecks(deck.setIds)
    } else {
        // Если setIds нет, пытаемся определить деки по картам
        console.warn('No setIds found, trying to determine from cards')
        const cardSetIds = new Set<string>()
        deck.cardIds.forEach((id: string) => {
            const card = allCards.find(c => c.id === id)
            if (card && card.setId) {
                cardSetIds.add(card.setId)
            }
        })
        if (cardSetIds.size > 0) {
            const setIds = Array.from(cardSetIds)
            console.log('Determined decks from cards:', setIds)
            builderStore.setDecks(setIds)
        }
    }

    // Устанавливаем карты
    if (deck.cardIds && deck.cardIds.length > 0) {
        console.log('Setting cards:', deck.cardIds.length)
        // Проверяем, что все карты есть в store
        const validCardIds = deck.cardIds.filter((id: string) =>
                deckStore.cardMap.has(id)
        )
        console.log('Valid cards:', validCardIds.length)
        if (validCardIds.length > 0) {
            builderStore.setSelectedCards(validCardIds)
        }
    }

    // Переходим на шаг 3
    nextTick(() => {
        if (builderStore.selectedWarbandId) {
            // Всегда переходим на шаг 3 при редактировании
            goToStep(3)
        }
        isLoadingDeck.value = false
    })
}

// ---- Сохранение (создание или обновление) ----
function saveDeck() {
    if (!isValid.value) return

    const deckData = {
        id: isEditMode.value ? editDeckId.value : `user_${Date.now()}`,
        name: deckName.value.trim() || 'Unnamed Deck',
        description: isEditMode.value ? 'Updated in builder' : 'Собрана в конструкторе',
        warbandId: builderStore.selectedWarbandId,
        cardIds: builderStore.selectedCardIds,
        setIds: builderStore.selectedDeckIds,
        createdAt: new Date().toISOString()
    }

    let savedDecks = JSON.parse(localStorage.getItem('user_decks') || '[]')

    if (isEditMode.value) {
        const index = savedDecks.findIndex((d: any) => d.id === editDeckId.value)
        if (index !== -1) {
            const originalDeck = savedDecks[index]
            deckData.createdAt = originalDeck.createdAt || new Date().toISOString()
            savedDecks[index] = deckData
        } else {
            savedDecks.push(deckData)
        }
    } else {
        savedDecks.push(deckData)
    }

    localStorage.setItem('user_decks', JSON.stringify(savedDecks))

    builderStore.resetBuilder()
    router.push('/my-decks')
}

function cancel() {
    builderStore.resetBuilder()
    router.push('/my-decks')
}

// Загружаем данные для редактирования при монтировании
onMounted(() => {
    // Если есть параметр edit, загружаем данные для редактирования
    // Иначе сбрасываем состояние для создания новой колоды
    if (route.query.edit) {
        loadDeckForEdit()
    } else {
        resetToNewDeck()
    }
})

// Следим за изменением маршрута (если пользователь перешел с редактирования на создание)
watch(
        () => route.query.edit,
        (newEdit) => {
            if (newEdit) {
                loadDeckForEdit()
            } else {
                resetToNewDeck()
            }
        }
)
</script>

<template>
    <div class="builder-view">
        <h1 class="builder-view__title">
            {{ isEditMode ? 'Edit Deck' : 'Deck Builder' }}
        </h1>

        <!-- Индикатор шагов (3 шага) -->
        <div class="steps-indicator">
            <div
                    v-for="step in [1, 2, 3]"
                    :key="step"
                    class="step-dot"
                    :class="{ active: builderStore.step === step, done: builderStore.step > step }"
                    @click="builderStore.step >= step && goToStep(step)"
            >
                <span class="step-number">{{ step }}</span>
                <span class="step-label">
          {{ step === 1 ? 'WarBand' : step === 2 ? 'Decks' : 'Cards' }}
        </span>
            </div>
        </div>

        <!-- Индикатор загрузки -->
        <div v-if="isLoadingDeck" class="loading-indicator">
            Loading deck data...
        </div>

        <!-- Шаг 1: Выбор банды -->
        <div v-if="builderStore.step === 1" class="step-content">
            <h2>Select WarBand</h2>
            <div class="warband-search">
                <input
                        type="text"
                        v-model="warbandSearchQuery"
                        placeholder="Search WarBand..."
                        class="search-input"
                />
                <span v-if="filteredWarbands.length === 0" class="no-results">Not found</span>
            </div>
            <div class="warband-grid">
                <div
                        v-for="w in filteredWarbands"
                        :key="w.id"
                        class="warband-card"
                        :class="{ selected: builderStore.selectedWarbandId === w.id }"
                        @click="builderStore.setSelectedWarband(w.id)"
                >
                    <img :src="w.icon" :alt="w.name" class="warband-card__icon" />
                    <span class="warband-card__name">{{ w.name }}</span>
                </div>
            </div>
            <div class="step-actions">
                <button class="btn btn-secondary" @click="cancel">Cancel</button>
            </div>
        </div>

        <!-- Шаг 2: Выбор двух деков -->
        <div v-if="builderStore.step === 2" class="step-content">
            <h2>Select 2 Decks</h2>
            <div class="deck-grid">
                <div
                        v-for="deck in deckStore.decks"
                        :key="deck.setId"
                        class="deck-card"
                        :class="{ selected: selectedDeckIds.includes(deck.setId) }"
                        @click="toggleDeck(deck.setId)"
                >
                    <img v-if="deck.imageDeck" :src="deck.imageDeck" class="deck-card__icon" />
                    <span v-else class="deck-card__placeholder">{{ deck.name.slice(0, 2) }}</span>
                    <span class="deck-card__name">{{ deck.name }}</span>
                </div>
            </div>
            <div class="step-actions">
                <button class="btn btn-secondary" @click="goToStep(1)">Back</button>
                <button class="btn btn-secondary" @click="cancel">Cancel</button>
            </div>
        </div>

        <!-- Шаг 3: Выбор карт (только из выбранных деков) -->
        <div v-if="builderStore.step === 3" class="step-content">
            <h2>Select Cards</h2>

            <!-- Название колоды -->
            <div class="deck-name-input">
                <label for="deckName">Deck Name</label>
                <input
                        id="deckName"
                        v-model="deckName"
                        type="text"
                        placeholder="Enter deck name..."
                        maxlength="50"
                        :class="{ 'input-error': deckNameError }"
                />
                <span v-if="deckNameError" class="input-error-message">{{ deckNameError }}</span>
            </div>

            <!-- Ошибки валидации -->
            <div v-if="allValidationErrors.length > 0" class="validation-errors step2-errors">
                <ul>
                    <li v-for="err in allValidationErrors" :key="err">{{ err }}</li>
                </ul>
            </div>

            <div class="card-builder-layout">
                <!-- Доступные карты -->
                <div class="available-cards">
                    <div class="filters">
                        <select v-model="filterType">
                            <option value="all">All Types</option>
                            <option value="objective">Objectives</option>
                            <option value="ploy">Ploys</option>
                            <option value="upgrade">Upgrades</option>
                        </select>
                        <input
                                type="text"
                                v-model="searchQuery"
                                placeholder="Search..."
                        />
                    </div>
                    <div class="card-list">
                        <div
                                v-for="card in filteredAvailableCards"
                                :key="card.id"
                                class="card-item available"
                        >
                            <div class="card-info">
                                <img :src="card.imageDeck" alt="set" class="card-set-icon" />
                                <span v-if="card.surge" class="badge surge">⚡</span>
                                <span v-if="card.restricted" class="badge restricted">🛑</span>
                                <span v-if="card.glory !== undefined && card.glory !== null" class="card-glory">
                  <greyCircle v-if="card.type === 'upgrade'" />
                  <yellow-circle v-if="card.type === 'objective'" />
                  {{ card.glory }}
                </span>
                                <span class="card-name" @click="showCardPreview(card)">{{ card.name }}</span>
                                <span class="card-type">{{ card.type }}</span>
                            </div>
                            <button class="btn-add" @click="addCard(card.id)">+</button>
                        </div>
                    </div>
                </div>

                <!-- Выбранные карты -->
                <div class="selected-cards">
                    <div class="selected-header">
                        <h3>Selected ({{ selectedCards.length }})</h3>
                        <button class="btn-clear" @click="clearAllCards">Reset</button>
                    </div>

                    <div class="counters">
            <span :class="{ error: selectedObjectives.length < 12 }">
              Objectives: {{ selectedObjectives.length }} (min 12)
            </span>
                        <span :class="{ error: selectedPloys.length < 10 || selectedPloys.length !== selectedUpgrades.length }">
              Ploys: {{ selectedPloys.length }} (min 10)
            </span>
                        <span :class="{ error: selectedUpgrades.length < 10 || selectedPloys.length !== selectedUpgrades.length }">
              Upgrades: {{ selectedUpgrades.length }} (min 10)
            </span>
                    </div>

                    <!-- Objectives -->
                    <div class="type-section">
                        <h4 class="section-title">Objectives</h4>
                        <div v-if="objectivesWithSurge.length > 0" class="subgroup">
                            <h5 class="subgroup-title">⚡ Surge (Glory: {{ glorySurgeObjectives }})</h5>
                            <div class="card-list">
                                <div
                                        v-for="card in objectivesWithSurge"
                                        :key="card.id"
                                        class="card-item selected"
                                        :class="{
                    'error-duplicate': duplicateNames.has(card.name),
                    'error-surge': surgeCount > 6 && card.surge,
                    'error-restricted': restrictedCount > 1 && card.restricted
                  }"
                                >
                                    <div class="card-info">
                                        <img :src="card.imageDeck" alt="set" class="card-set-icon" />
                                        <span class="card-name" @click="showCardPreview(card)">{{ card.name }}</span>
                                        <span class="card-type">{{ card.type }}</span>
                                        <span v-if="card.surge" class="badge surge">⚡</span>
                                        <span v-if="card.restricted" class="badge restricted">🛑</span>
                                        <span v-if="card.glory !== undefined && card.glory !== null" class="card-glory">
                      <yellow-circle v-if="card.type === 'objective'" />
                      <grey-circle v-if="card.type === 'upgrade'" />
                      {{ card.glory }}
                    </span>
                                    </div>
                                    <button class="btn-remove" @click="removeCard(card.id)">✕</button>
                                </div>
                            </div>
                        </div>

                        <div v-if="objectivesWithoutSurge.length > 0" class="subgroup">
                            <h5 class="subgroup-title">⏳ Endphase (Glory: {{ gloryNonSurgeObjectives }})</h5>
                            <div class="card-list">
                                <div
                                        v-for="card in objectivesWithoutSurge"
                                        :key="card.id"
                                        class="card-item selected"
                                        :class="{
                    'error-duplicate': duplicateNames.has(card.name),
                    'error-surge': surgeCount > 6 && card.surge,
                    'error-restricted': restrictedCount > 1 && card.restricted
                  }"
                                >
                                    <div class="card-info">
                                        <img :src="card.imageDeck" alt="set" class="card-set-icon" />
                                        <span class="card-name" @click="showCardPreview(card)">{{ card.name }}</span>
                                        <span class="card-type">{{ card.type }}</span>
                                        <span v-if="card.surge" class="badge surge">⚡</span>
                                        <span v-if="card.restricted" class="badge restricted">🛑</span>
                                        <span v-if="card.glory !== undefined && card.glory !== null" class="card-glory">
                      <yellow-circle v-if="card.type === 'objective'" />
                      <grey-circle v-if="card.type === 'upgrade'" />
                      {{ card.glory }}
                    </span>
                                    </div>
                                    <button class="btn-remove" @click="removeCard(card.id)">✕</button>
                                </div>
                            </div>
                        </div>
                        <div class="type-summary"><yellow-circle /> Glory: {{ glorySurgeObjectives + gloryNonSurgeObjectives }}</div>
                    </div>

                    <!-- Ploys -->
                    <div class="type-section">
                        <h4 class="section-title">Ploys</h4>
                        <div class="card-list">
                            <div
                                    v-for="card in selectedPloys"
                                    :key="card.id"
                                    class="card-item selected"
                                    :class="{
                  'error-duplicate': duplicateNames.has(card.name),
                  'error-surge': surgeCount > 6 && card.surge,
                  'error-restricted': restrictedCount > 1 && card.restricted
                }"
                            >
                                <div class="card-info">
                                    <img :src="card.imageDeck" alt="set" class="card-set-icon" />
                                    <span class="card-name" @click="showCardPreview(card)">{{ card.name }}</span>
                                    <span class="card-type">{{ card.type }}</span>
                                    <span v-if="card.surge" class="badge surge">⚡</span>
                                    <span v-if="card.restricted" class="badge restricted">🛑</span>
                                    <span v-if="card.glory !== undefined && card.glory !== null" class="card-glory">
                    <yellow-circle v-if="card.type === 'objective'" />
                    <grey-circle v-if="card.type === 'upgrade'" />
                    {{ card.glory }}
                  </span>
                                </div>
                                <button class="btn-remove" @click="removeCard(card.id)">✕</button>
                            </div>
                        </div>
                    </div>

                    <!-- Upgrades -->
                    <div class="type-section">
                        <h4 class="section-title">Upgrades</h4>
                        <div class="card-list">
                            <div
                                    v-for="card in selectedUpgrades"
                                    :key="card.id"
                                    class="card-item selected"
                                    :class="{
                  'error-duplicate': duplicateNames.has(card.name),
                  'error-surge': surgeCount > 6 && card.surge,
                  'error-restricted': restrictedCount > 1 && card.restricted
                }"
                            >
                                <div class="card-info">
                                    <img :src="card.imageDeck" alt="set" class="card-set-icon" />
                                    <span class="card-name" @click="showCardPreview(card)">{{ card.name }}</span>
                                    <span class="card-type">{{ card.type }}</span>
                                    <span v-if="card.surge" class="badge surge">⚡</span>
                                    <span v-if="card.restricted" class="badge restricted">🛑</span>
                                    <span v-if="card.glory !== undefined && card.glory !== null" class="card-glory">
                    <yellow-circle v-if="card.type === 'objective'" />
                    <grey-circle v-if="card.type === 'upgrade'" />
                    {{ card.glory }}
                  </span>
                                </div>
                                <button class="btn-remove" @click="removeCard(card.id)">✕</button>
                            </div>
                        </div>
                        <div class="type-summary"><grey-circle /> Glory: {{ sumGloryByType.upgrade }}</div>
                    </div>
                </div>
            </div>

            <div class="step-actions">
                <button class="btn btn-secondary" @click="goToStep(2)">Back</button>
                <button class="btn btn-secondary" @click="cancel">Cancel</button>
                <button class="btn btn-primary" :disabled="!isValid" @click="saveDeck">
                    {{ isEditMode ? 'Update Deck' : 'Save deck' }}
                </button>
            </div>
        </div>

        <!-- Попап предпросмотра -->
        <FullscreenImage :src="previewImage" @close="closePreview" />
    </div>
</template>

<style scoped>
/* Все стили остаются без изменений */
.loading-indicator {
    text-align: center;
    padding: 40px;
    color: #a0c4ff;
    font-size: 1.2rem;
}

.builder-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px 16px;
    color: #e0e0e0;
}
.builder-view__title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 24px;
}

/* ---- Индикатор шагов (3 шага) ---- */
.steps-indicator {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 32px;
    position: relative;
}
.steps-indicator::before {
    content: '';
    position: absolute;
    top: 16px;
    left: 15%;
    right: 15%;
    height: 2px;
    background: #3a3a5a;
    z-index: 0;
}
.step-dot {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
    cursor: pointer;
}
.step-dot .step-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #2a2a3e;
    border: 2px solid #3a3a5a;
    color: #a0a0b8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    transition: 0.2s;
}
.step-dot.active .step-number {
    background: #a0c4ff;
    border-color: #a0c4ff;
    color: #1a1a2e;
}
.step-dot.done .step-number {
    background: #4a6a8a;
    border-color: #4a6a8a;
    color: #fff;
}
.step-dot .step-label {
    font-size: 0.8rem;
    margin-top: 4px;
    color: #a0a0b8;
}
.step-dot.active .step-label {
    color: #fff;
}

/* ---- Шаг 1: Банды ---- */
.warband-search {
    margin-bottom: 16px;
}
.warband-search .search-input {
    width: 100%;
    max-width: 400px;
    background: #0f0f1a;
    border: 1px solid #3a3a5a;
    color: #e0e0e0;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 1rem;
}
.warband-search .search-input:focus {
    outline: none;
    border-color: #a0c4ff;
}
.warband-search .no-results {
    display: block;
    margin-top: 8px;
    color: #ff8a8a;
    font-style: italic;
}
.warband-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}
.warband-card {
    background: #1a1a2e;
    border: 2px solid #2a2a4a;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    cursor: pointer;
    transition: 0.2s;
}
.warband-card:hover {
    background: #2a2a4a;
}
.warband-card.selected {
    border-color: #a0c4ff;
    background: #2a3a5a;
}
.warband-card__icon {
    width: 64px;
    height: 64px;
    object-fit: contain;
    margin-bottom: 8px;
}
.warband-card__name {
    font-weight: 600;
    display: block;
}

/* ---- Шаг 2: Деки ---- */
.deck-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}
.deck-card {
    background: #1a1a2e;
    border: 2px solid #2a2a4a;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    cursor: pointer;
    transition: 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.deck-card:hover {
    background: #2a2a4a;
}
.deck-card.selected {
    border-color: #a0c4ff;
    background: #2a3a5a;
}
.deck-card__icon {
    width: 64px;
    height: 64px;
    object-fit: contain;
    margin-bottom: 8px;
}
.deck-card__placeholder {
    font-size: 2rem;
    font-weight: 700;
    color: #a0a0b8;
    margin-bottom: 8px;
}
.deck-card__name {
    font-weight: 600;
}

.deck-name-input {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.deck-name-input label {
    font-weight: 600;
    font-size: 0.95rem;
    color: #c0c0d8;
}
.deck-name-input input {
    background: #0f0f1a;
    border: 1px solid #3a3a5a;
    color: #e0e0e0;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 1rem;
}
.deck-name-input input:focus {
    outline: none;
    border-color: #a0c4ff;
}
.deck-name-input .input-error {
    border-color: #ff6b6b;
}
.deck-name-input .input-error-message {
    color: #ff6b6b;
    font-size: 0.85rem;
}

.card-builder-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 24px;
}
.available-cards,
.selected-cards {
    background: #1a1a2e;
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #2a2a4a;
}
.filters {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}
.filters select,
.filters input {
    background: #0f0f1a;
    border: 1px solid #3a3a5a;
    color: #e0e0e0;
    padding: 6px 10px;
    border-radius: 4px;
}
.card-list {
    max-height: 400px;
    overflow-y: auto;
}
.card-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 8px;
    border-radius: 4px;
    margin-bottom: 4px;
}
.card-item.available:hover {
    background: #2a2a4a;
}
.card-item.selected:hover {
    background: #2a2a3a;
}
.card-info {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    flex-wrap: wrap;
}
.card-set-icon {
    width: 24px;
    height: 24px;
    object-fit: contain;
}
.card-name {
    cursor: pointer;
    flex: 1;
}
.card-name:hover {
    text-decoration: underline;
    color: #a0c4ff;
}
.card-type {
    font-size: 0.75rem;
    color: #a0a0b8;
    margin-right: 4px;
}
.btn-add,
.btn-remove {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 50%;
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    outline: none;
}
.btn-add {
    background: #2a5a2a;
    color: #8fdf8f;
}
.btn-add:hover {
    background: #3a7a3a;
    transform: scale(1.05);
}
.btn-remove {
    background: #5a2a2a;
    color: #ff8a8a;
}
.btn-remove:hover {
    background: #7a3a3a;
    transform: scale(1.05);
}
.btn-add:focus-visible,
.btn-remove:focus-visible {
    outline: 2px solid #a0c4ff;
    outline-offset: 2px;
}
.btn-add:active,
.btn-remove:active {
    transform: scale(0.92);
}
.selected-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}
.btn-clear {
    background: #4a2a2a;
    border: 1px solid #6a3a3a;
    color: #ff8a8a;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
}
.btn-clear:hover {
    background: #5a3a3a;
}
.counters {
    display: flex;
    gap: 12px;
    font-size: 0.9rem;
    margin-bottom: 8px;
    flex-wrap: wrap;
}
.counters span.error {
    color: #ff6b6b;
}
.badge {
    font-size: 0.75rem;
    padding: 2px 6px;
    border-radius: 4px;
    background: #333;
    color: #fff;
    margin-left: 4px;
    display: inline-block;
    line-height: 1.4;
}
.badge.surge {
    color: #000;
    margin-right: 4px;
}
.badge.restricted {
    background: #d63384;
    color: #fff;
    margin-right: 4px;
}
.validation-errors {
    background: #3a1a1a;
    border: 1px solid #6a2a2a;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
}
.validation-errors ul {
    margin: 4px 0 0 20px;
    color: #ff8a8a;
}
.step2-errors {
    margin-bottom: 12px;
}
.card-item.error-duplicate {
    border-left: 4px solid #ff6b6b;
    background: #3a1a1a;
}
.card-item.error-surge {
    border-left: 4px solid #fcc419;
    background: #3a3a1a;
}
.card-item.error-restricted {
    border-left: 4px solid #d63384;
    background: #3a1a2a;
}
.step-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 16px;
}
.btn {
    padding: 10px 24px;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: 0.2s;
}
.btn-primary {
    background: #a0c4ff;
    color: #1a1a2e;
}
.btn-primary:hover:not(:disabled) {
    background: #8ab4f0;
}
.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.btn-secondary {
    background: #3a3a5a;
    color: #e0e0e0;
}
.btn-secondary:hover {
    background: #4a4a6a;
}
.type-section {
    margin-top: 16px;
    border-top: 1px solid #2a2a4a;
    padding-top: 12px;
}
.type-section:first-of-type {
    border-top: none;
    margin-top: 0;
    padding-top: 0;
}
.section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #c0d0e0;
    margin: 0 0 8px 0;
}
.subgroup {
    margin-left: 8px;
    margin-bottom: 8px;
}
.subgroup-title {
    font-size: 0.95rem;
    font-weight: 500;
    color: #b0c0d0;
    margin: 6px 0 4px 0;
}
.type-summary {
    font-size: 0.95rem;
    color: #ffd700;
    margin-top: 4px;
    padding: 4px 8px;
    background: rgba(255, 215, 0, 0.08);
    border-radius: 4px;
    display: inline-block;
}
.total-glory {
    margin-top: 16px;
    padding: 10px 16px;
    background: rgba(255, 215, 0, 0.12);
    border-radius: 8px;
    text-align: center;
    font-size: 1.2rem;
    color: #ffd700;
    border: 1px solid rgba(255, 215, 0, 0.2);
}

/* ---- Адаптив ---- */
@media (max-width: 768px) {
    .card-builder-layout {
        grid-template-columns: 1fr;
    }
    .steps-indicator {
        gap: 20px;
    }
    .steps-indicator::before {
        left: 10%;
        right: 10%;
    }
    .filters {
        flex-direction: column;
    }
    .counters {
        flex-direction: column;
        gap: 4px;
    }
    .builder-view {
        padding: 2px;
    }
    .available-cards,
    .selected-cards {
        width: 100%;
        box-sizing: border-box;
    }
}
</style>