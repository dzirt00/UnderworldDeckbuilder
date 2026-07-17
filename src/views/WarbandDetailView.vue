<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { useWarbandStore } from '@/store/warbandStore'
import FullscreenImage from '@/components/common/FullscreenImage.vue'

defineOptions({
    inheritAttrs: false
})

const route = useRoute()
const router = useRouter()
const warbandStore = useWarbandStore()

const warbandId = computed(() => route.params.id as string)

// Функция для сброса прокрутки
const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}

onMounted(() => {
    if (warbandId.value) {
        warbandStore.setCurrentWarband(warbandId.value)
    }
    scrollToTop()
})

watch(warbandId, (newId) => {
    if (newId) {
        warbandStore.setCurrentWarband(newId)
        scrollToTop()
    }
})

// Дополнительная защита при обновлении маршрута внутри того же компонента
onBeforeRouteUpdate(() => {
    scrollToTop()
})

const currentWarband = computed(() => warbandStore.currentWarband)
const fighters = computed(() => warbandStore.currentFighters)

const activeTab = ref<'abilities' | 'fighters'>('fighters')
const showInspired = ref<Record<string, boolean>>({})

function toggleSide(fighterId: string) {
    showInspired.value[fighterId] = !showInspired.value[fighterId]
}

function goBack() {
    router.push('/warbands')
}

const fullscreenImage = ref<string | null>(null)

function openFullscreen(img: string) {
    fullscreenImage.value = img
}

function closeFullscreen() {
    fullscreenImage.value = null
}
</script>

<template>
    <div class="warband-detail">
        <div v-if="!currentWarband" class="warband-detail__error">
            <p>WarBand not found</p>
            <button @click="goBack" class="btn-back">Back</button>
        </div>

        <template v-else>
            <!-- Заголовок с кнопкой "Назад" -->
            <div class="warband-detail__header">
                <div class="header-row">
                    <button class="btn-back" @click="goBack">Back</button>
                    <div class="warband-detail__title-wrapper">
                        <img
                                v-if="currentWarband.icon"
                                :src="currentWarband.icon"
                                alt="warband icon"
                                class="warband-detail__icon"
                        />
                        <h1 class="warband-detail__title">{{ currentWarband.name }}</h1>
                    </div>
                </div>
            </div>

            <!-- Вкладки -->
            <div class="warband-detail__tabs">
                <button
                        class="tab-button"
                        :class="{ active: activeTab === 'fighters' }"
                        @click="activeTab = 'fighters'"
                >
                    Fighter
                </button>
                <button
                        class="tab-button"
                        :class="{ active: activeTab === 'abilities' }"
                        @click="activeTab = 'abilities'"
                >
                    War Scroll
                </button>
            </div>

            <!-- Контент вкладок -->
            <div class="warband-detail__content">
                <!-- Вкладка "Юниты" -->
                <div v-if="activeTab === 'fighters'" class="tab-content">
                    <div v-if="fighters.length === 0" class="empty-state">
                        No data on the fighters.
                    </div>
                    <div v-else class="fighters-grid">
                        <div
                                v-for="fighter in fighters"
                                :key="fighter.id"
                                class="fighter-card"
                                @click="toggleSide(fighter.id)"
                        >
                            <img
                                    class="fighter-card__image"
                                    :src="showInspired[fighter.id] ? fighter.imageInspired : fighter.imageDefault"
                                    :alt="fighter.id"
                                    :title="showInspired[fighter.id] ? 'Inspired' : 'Default'"
                            />
                        </div>
                    </div>
                </div>

                <!-- Вкладка "Лист абилок" -->
                <div v-if="activeTab === 'abilities'" class="tab-content">
                    <div
                            v-if="currentWarband.abilitySheetWarBands && currentWarband.abilitySheetWarBands.length > 0"
                            class="ability-sheet-grid"
                    >
                        <img
                                v-for="(img, index) in currentWarband.abilitySheetWarBands"
                                :key="index"
                                :src="img"
                                :alt="`WarScroll ${index + 1}`"
                                class="ability-sheet__image"
                                @click="openFullscreen(img)"
                                style="cursor: pointer;"
                        />
                    </div>
                    <div v-else class="empty-state">
                        WarScroll Unavailable
                    </div>
                </div>
            </div>
        </template>
    </div>
    <FullscreenImage
            :src="fullscreenImage"
            @close="closeFullscreen"
    />
</template>

<style scoped>
/* (стили без изменений) */
.warband-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px 20px 16px;
    color: #e0e0e0;
}
.warband-detail__error {
    text-align: center;
    padding: 40px 0;
}
.warband-detail__error p {
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
.warband-detail__title-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
}
.warband-detail__icon {
    width: 48px;
    height: 48px;
    object-fit: contain;
}
.warband-detail__title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
}
.warband-detail__tabs {
    display: flex;
    gap: 16px;
    border-bottom: 1px solid #2a2a3e;
    margin-bottom: 24px;
}
.tab-button {
    background: transparent;
    border: none;
    padding: 10px 16px;
    font-size: 1.1rem;
    font-weight: 500;
    color: #8888aa;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: color 0.2s, border-color 0.2s;
}
.tab-button:hover {
    color: #ccccdd;
}
.tab-button.active {
    color: #ffffff;
    border-bottom-color: #a0c4ff;
}
.tab-content {
    padding-top: 8px;
}
.empty-state {
    text-align: center;
    color: #8888aa;
    padding: 40px 0;
    font-size: 1.1rem;
}
.fighters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
}
.fighter-card {
    background: #1a1a2e;
    border: 1px solid #2a2a4a;
    border-radius: 12px;
    padding: 16px 12px;
    text-align: center;
    cursor: pointer;
    transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
}
.fighter-card:hover {
    background: #2a2a4a;
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    border-color: #4a4a6a;
}
.fighter-card__image {
    width: 100%;
    max-width: 200px;
    height: auto;
    aspect-ratio: 0.7;
    object-fit: contain;
    background: #0f0f1a;
    border-radius: 8px;
    margin-bottom: 8px;
}
.ability-sheet-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    justify-items: center;
}
.ability-sheet__image {
    max-width: 100%;
    max-height: 85vh;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid #3a3a5a;
    background: #0f0f1a;
}
@media (max-width: 480px) {
    .warband-detail__title {
        font-size: 1.3rem;
    }
    .fighters-grid {
        grid-template-columns: 1fr;
        gap: 10px;
    }
    .fighter-card {
        padding: 12px 8px;
    }
    .fighter-card__image {
        max-width: 100%;
        aspect-ratio: 0.7;
    }
    .ability-sheet__image {
        max-height: none;
        width: 100%;
        height: auto;
        object-fit: contain;
        border-radius: 8px;
        border: 1px solid #3a3a5a;
        background: #0f0f1a;
    }
    .ability-sheet-grid {
        gap: 12px;
    }
}
</style>