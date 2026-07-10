import { defineStore } from 'pinia'
import decksData from '@/shared/data/deck.json'
import cardsData from '@/shared/data/cards.json'
import type { Deck } from '@/api/interface/Deck'
import type { Card } from '@/api/interface/Card'
import type { ResolvedDeck } from '@/api/interface/ResolvedDeck'
import type { ResolvedDeckTable } from '@/api/interface/ResolvedDeckTable'

export const useDeckStore = defineStore('deck', {
    state: () => ({
        decks: decksData as Deck[],
        cards: cardsData as Card[],
        currentDeckId: null as string | null,
        filterType: 'all' as 'all' | 'objective' | 'ploy' | 'upgrade',
        searchQuery: '',
        viewMode: 'overview' as 'overview' | 'table'
    }),
    getters: {
        // карта для быстрого доступа
        cardMap: (state) => {
            return new Map(state.cards.map(c => [c.id, c]))
        },
        // текущая колода (разрешенная)
        currentDeck(): ResolvedDeck | null {
            if (!this.currentDeckId) return null
            const deck = this.decks.find(d => d.id === this.currentDeckId)
            if (!deck) return null
            const map = this.cardMap
            const getCard = (id: string) => {
                const card = map.get(id)
                if (!card) throw new Error(`Card not found: ${id}`)
                return card
            }
            return {
                ...deck,
                objectives: deck.objectives.map(getCard),
                gambits: deck.gambits.map(getCard),
                upgrades: deck.upgrades.map(getCard)
            }
        },
        // табличное представление – все карты в одном массиве
        currentDeckTable(): ResolvedDeckTable | null {
            const deck = this.currentDeck
            if (!deck) return null
            return {
                ...deck,
                cards: [...deck.objectives, ...deck.gambits, ...deck.upgrades]
            }
        },
        // отфильтрованные карты для текущей колоды (с учетом типа и поиска)
        filteredCards(): Card[] {
            const table = this.currentDeckTable
            if (!table) return []
            let cards = table.cards
            if (this.filterType !== 'all') {
                cards = cards.filter(c => c.type === this.filterType)
            }
            if (this.searchQuery.trim()) {
                const query = this.searchQuery.trim().toLowerCase()
                cards = cards.filter(c =>
                    c.name.toLowerCase().includes(query) ||
                    c.description.toLowerCase().includes(query)
                )
            }
            return cards
        }
    },
    actions: {
        setCurrentDeck(id: string) {
            this.currentDeckId = id
        },
        setFilterType(type: 'all' | 'objective' | 'ploy' | 'upgrade') {
            this.filterType = type
        },
        setSearchQuery(query: string) {
            this.searchQuery = query
        },
        setViewMode(mode: 'overview' | 'table') {
            this.viewMode = mode
        }
    }
})