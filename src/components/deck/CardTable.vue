<script setup lang="ts">
import { ref } from 'vue'
import type { Card } from '@/api/interface/Card'
import yellowCircle from '@/components/images/yellowCircle.vue'
import GreyCircle from '@/components/images/greyCircle.vue'
import FaqPopup from '@/components/common/FaqPopup.vue'

defineProps<{
    cards: Card[]
}>()

defineEmits<{
    (e: 'show-card', card: Card, event: MouseEvent): void
}>()

const isNull = (val: string | number | boolean | null) => val !== null ? val : '-'

const faqPopup = ref<{
    text: string
    position: { x: number; y: number }
} | null>(null)

function showFaq(card: Card, event: MouseEvent) {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    let x = rect.right + 8
    let y = rect.top

    const popupWidth = 300
    const popupHeight = 150

    if (x + popupWidth > window.innerWidth) {
        x = rect.left - popupWidth - 8
    }
    if (x < 8) x = 8

    if (y + popupHeight > window.innerHeight) {
        y = rect.bottom - popupHeight - 8
    }
    if (y < 8) y = 8

    faqPopup.value = {
        text: card.faq || '',
        position: { x, y },
    }
}

function closeFaq() {
    faqPopup.value = null
}
</script>

<template>
    <div class="card-table">
        <!-- Заголовок (десктоп) -->
        <div class="table-header hide-mobile">
            <div class="col-name">Name</div>
            <div class="col-faction">Faction</div>
            <div class="col-type">Type</div>
            <div class="col-description">Description</div>
            <div class="col-glory">Glory</div>
            <div class="col-restricted">Restricted</div>
            <div class="col-set">Set</div>
            <div class="col-faq">FAQ</div>
        </div>

        <!-- Строки -->
        <div
                v-for="(el, idx) in cards"
                :key="idx"
                class="table-row"
        >
            <!-- Name (с иконкой типа) -->
            <div class="col-name">
                <img
                        class="icon icon-type hide-desktop"
                        :src="el.imageType"
                        :alt="el.type"
                        :title="el.type"
                />
                <button class="name-button" @click="$emit('show-card', el, $event)">
                    {{ el.name }}
                </button>
                <button
                        v-if="el.faq !== null && el.faq !== ''"
                        class="faq-toggle-mobile hide-desktop"
                        @click.stop="showFaq(el, $event)"
                        title="Показать FAQ"
                >
                    ❓
                </button>
            </div>

            <!-- Остальные колонки (скрываются на мобильных) -->
            <div class="col-faction hide-mobile">
                <img class="icon" :src="el.imageFaction" :alt="el.faction" :title="el.faction" />
            </div>
            <div class="col-type hide-mobile">
                <img class="icon" :src="el.imageType" :alt="el.type" :title="el.type" />
            </div>
            <div class="col-description hide-mobile desc-cell">
                {{ el.description }}
            </div>
            <div class="col-glory hide-mobile">
                <div class="flex">
                    {{ isNull(el.glory) }}
                    <yellowCircle v-if="el.type === 'objective' && el.glory !== null" />
                    <grey-circle v-if="el.type === 'upgrade' && el.glory !== null" />
                </div>
            </div>
            <div class="col-restricted hide-mobile">
                <span v-if="el.restricted" class="restricted-icon" title="Restricted">🛑</span>
                <span v-else>–</span>
            </div>
            <div class="col-set hide-mobile">
                <img class="icon" :src="el.imageDeck" :alt="el.setId" :title="el.setId" />
            </div>
            <div class="col-faq hide-mobile">
                <template v-if="el.faq !== null && el.faq !== ''">
                    <button class="faq-toggle" @click.stop="showFaq(el, $event)">
                        <span class="faq-icon">❓</span>
                    </button>
                </template>
                <template v-else>–</template>
            </div>
        </div>

        <!-- Попап FAQ -->
        <FaqPopup
                :text="faqPopup?.text || ''"
                :position="faqPopup?.position || null"
                @close="closeFaq"
        />
    </div>
</template>

<style scoped>
.card-table {
    width: 100%;
}

/* Стили для строк (как таблица) */
.table-header,
.table-row {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #3a3a5a;
    gap: 8px;
}

.table-header {
    background-color: #2a2a3e;
    font-weight: 600;
    color: #e0e0e0;
    border-top: 1px solid #3a3a5a;
}

.table-row {
    background-color: transparent;
    transition: background 0.15s;
}
.table-row:nth-child(even) {
    background-color: #1a1a2a;
}
.table-row:nth-child(odd) {
    background-color: #222233;
}
.table-row:hover {
    background-color: #2a2a4a;
}

/* Колонки – задаём относительную ширину */
.col-name {
    flex: 2;
    min-width: 120px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.col-faction {
    flex: 0 0 48px;
    text-align: center;
}
.col-type {
    flex: 0 0 48px;
    text-align: center;
}
.col-description {
    flex: 3;
    min-width: 100px;
}
.col-glory {
    flex: 0 0 60px;
    text-align: center;
}
.col-restricted {
    flex: 0 0 60px;
    text-align: center;
}
.col-set {
    flex: 0 0 48px;
    text-align: center;
}
.col-faq {
    flex: 0 0 60px;
    text-align: center;
}

.icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
    display: inline-block;
}
.icon-type {
    width: 24px;
    height: 24px;
}

.name-button {
    white-space: nowrap;
    background: #2a2a3e;
    padding: 6px 10px;
    border: none;
    color: #ffffff;
    cursor: pointer;
    font: inherit;
    text-align: left;
    flex: 1;
    border-radius: 6px;
    transition: background 0.15s;
}
.name-button:hover {
    background: #4a4a5e;
}

.flex {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
}

.restricted-icon {
    font-size: 1.2rem;
}

.faq-toggle,
.faq-toggle-mobile {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    font-size: 1.2rem;
    color: #a0c4ff;
    transition: transform 0.2s;
}
.faq-toggle:hover,
.faq-toggle-mobile:hover {
    transform: scale(1.2);
}
.faq-icon {
    display: inline-block;
}

.hide-desktop {
    display: none;
}

/* Адаптив для мобильных */
@media (max-width: 768px) {
    .hide-mobile {
        display: none !important;
    }
    .hide-desktop {
        display: inline-block !important;
    }

    .table-header {
        display: none;
    }

    .table-row {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-areas: "name";
        gap: 4px;
        padding: 10px 16px;
        border: 1px solid #3a3a5a;
        border-radius: 8px;
        margin-bottom: 8px;
        background: #1a1a2a;
    }

    .table-row:nth-child(even),
    .table-row:nth-child(odd) {
        background: #1a1a2a;
    }
    .table-row:hover {
        background: #2a2a4a;
    }

    .col-name {
        grid-area: name;
        flex: none;
        min-width: 0;
        width: 100%;
        gap: 8px;
    }

    .name-button {
        font-size: 1rem;
        padding: 6px 8px;
        width: auto;
    }

    .icon {
        width: 24px;
        height: 24px;
    }
    .icon-type {
        width: 20px;
        height: 20px;
    }

    .faq-toggle-mobile {
        font-size: 1rem;
        padding: 4px;
    }

    /* Теперь обрезаем описание только на мобильных */
    .desc-cell {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

@media (max-width: 480px) {
    .table-row {
        padding: 8px 12px;
    }
    .name-button {
        font-size: 0.9rem;
    }
}
</style>