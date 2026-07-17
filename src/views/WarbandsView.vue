<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWarbandStore } from '@/store/warbandStore'
import { RouterLink } from 'vue-router'

const warbandStore = useWarbandStore()
const warbands = warbandStore.warbands

// Состояние поискового запроса
const searchTerm = ref('')

// Отфильтрованные банды по названию
const filteredWarbands = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return warbands
    return warbands.filter(w => w.name.toLowerCase().includes(term))
})

// Группировка отфильтрованных бандов по фракциям
const groupedWarbands = computed(() => {
    const groups: Record<string, typeof warbands> = {}
    for (const w of filteredWarbands.value) {
        const key = w.fraction || 'Unknown'
        if (!groups[key]) groups[key] = []
        groups[key].push(w)
    }
    // Желаемый порядок фракций
    const order = ['Order', 'Chaos', 'Destruction', 'Death']
    const sortedGroups: Record<string, typeof warbands> = {}
    for (const key of order) {
        if (groups[key]) sortedGroups[key] = groups[key]
    }
    // Остальные (если есть) добавляем в алфавитном порядке
    for (const key of Object.keys(groups).sort()) {
        if (!sortedGroups[key]) sortedGroups[key] = groups[key]
    }
    return sortedGroups
})
</script>

<template>
    <div class="warbands-view">
        <h1 class="warbands-view__title">WarBand</h1>
        <p class="warbands-view__subtitle">Select a WarBand to view its fighters and their abilities.</p>

        <!-- Поле поиска -->
        <div class="search-container">
            <input
                    v-model="searchTerm"
                    type="text"
                    placeholder="Search by warband name..."
                    class="search-input"
            />
            <button v-if="searchTerm" @click="searchTerm = ''" class="search-clear" title="Clear search">✕</button>
        </div>

        <div
                v-for="(group, faction) in groupedWarbands"
                :key="faction"
                class="faction-group"
        >
            <h2 class="faction-group__title">{{ faction }}</h2>
            <div class="warbands-grid">
                <RouterLink
                        v-for="warband in group"
                        :key="warband.id"
                        :to="`/warbands/${warband.id}`"
                        class="warband-card"
                >
                    <img
                            class="warband-card__icon"
                            :src="warband.icon"
                            :alt="warband.name"
                            :title="warband.name"
                    />
                    <span class="warband-card__name">{{ warband.name }}</span>
                </RouterLink>
            </div>
        </div>

        <!-- Если ничего не найдено -->
        <p v-if="Object.keys(groupedWarbands).length === 0" class="no-results">
            No warbands found for “{{ searchTerm }}”
        </p>
    </div>
</template>

<style scoped>
.warbands-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px 20px 16px;
    color: #e0e0e0;
}

.warbands-view__title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 4px;
}

.warbands-view__subtitle {
    font-size: 1rem;
    color: #a0a0b8;
    margin-bottom: 24px;
}

/* Поиск */
.search-container {
    position: relative;
    margin-bottom: 28px;
}

.search-input {
    width: 100%;
    padding: 10px 40px 10px 16px;
    border: 1px solid #2a2a4a;
    border-radius: 8px;
    background: #12121e;
    color: #e0e0e0;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input::placeholder {
    color: #6a6a8a;
}

.search-input:focus {
    border-color: #6a6aff;
    box-shadow: 0 0 0 3px rgba(106, 106, 255, 0.2);
}

.search-clear {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #a0a0b8;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 4px;
    line-height: 1;
    transition: color 0.2s;
}

.search-clear:hover {
    color: #e0e0e0;
}

.no-results {
    text-align: center;
    padding: 40px 0;
    color: #a0a0b8;
    font-size: 1.1rem;
}

/* Группа фракции */
.faction-group {
    margin-bottom: 32px;
}

.faction-group__title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 2px solid #3a3a5a;
    color: #c0c0d8;
}

/* Сетка карточек */
.warbands-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
}

/* Карточка банды */
.warband-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 12px 16px;
    background: #1a1a2e;
    border: 1px solid #2a2a4a;
    border-radius: 12px;
    text-decoration: none;
    color: #e0e0e0;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    cursor: pointer;
    text-align: center;
}

.warband-card:hover {
    background: #2a2a4a;
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    border-color: #4a4a6a;
}

.warband-card__icon {
    width: 64px;
    height: 64px;
    object-fit: contain;
    margin-bottom: 8px;
}

.warband-card__name {
    font-weight: 600;
    font-size: 1rem;
    line-height: 1.3;
    margin-bottom: 4px;
}

/* Адаптив */
@media (max-width: 768px) {
    .warbands-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
    }
    .warband-card {
        padding: 16px 8px 12px;
    }
    .warband-card__icon {
        width: 48px;
        height: 48px;
    }
    .warband-card__name {
        font-size: 0.9rem;
    }
}

@media (max-width: 480px) {
    .warbands-grid {
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 10px;
    }
    .warband-card {
        padding: 12px 6px 10px;
    }
    .warband-card__icon {
        width: 40px;
        height: 40px;
    }
    .warband-card__name {
        font-size: 0.8rem;
    }
}
</style>