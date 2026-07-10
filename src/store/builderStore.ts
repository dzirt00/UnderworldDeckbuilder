import { defineStore } from 'pinia'
import type { Card } from '@/api/interface/Card'

export const useBuilderStore = defineStore('builder', {
    state: () => ({
        step: 1, // 1 – выбор банды, 2 – выбор карт, 3 – проверка/сохранение
        selectedWarbandId: null as string | null,
        selectedCardIds: [] as string[], // список ID выбранных карт
        errors: [] as string[], // массив сообщений об ошибках валидации
        selectedDeckIds: [] as string[],
    }),
    getters: {
        // количество карт по типам
        objectivesCount: (state) => {
            // нужно будет разрешать карты, но пока просто считаем
        },
        // другие геттеры для валидации
    },
    actions: {
        setStep(step: number) {
            this.step = step
        },
        setSelectedWarband(id: string) {
            this.selectedWarbandId = id
        },
        addCard(cardId: string) {
            if (!this.selectedCardIds.includes(cardId)) {
                this.selectedCardIds.push(cardId)
            }
        },
        removeCard(cardId: string) {
            this.selectedCardIds = this.selectedCardIds.filter(id => id !== cardId)
        },
        clearSelection() {
            this.selectedCardIds = []
        },
        setErrors(errors: string[]) {
            this.errors = errors
        },
        setDecks(deckIds: string[]) { this.selectedDeckIds = deckIds },
        resetBuilder() {
            this.step = 1
            this.selectedWarbandId = null
            this.selectedCardIds = []
            this.errors = []
            this.selectedDeckIds = []
        }
    }
})