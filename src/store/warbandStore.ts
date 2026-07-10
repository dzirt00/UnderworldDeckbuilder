import { defineStore } from 'pinia'
import warbandsData from '@/shared/data/warBands.json'
import fightersData from '@/shared/data/fighters.json'
import type { WarBands } from '@/api/interface/WarBands'
import type { Fighters } from '@/api/interface/Fighters'

export const useWarbandStore = defineStore('warband', {
    state: () => ({
        warbands: warbandsData as WarBands[],
        fighters: fightersData as Fighters[], // позже заменим на полные данные
        currentWarbandId: null as string | null
    }),
    getters: {
        // текущая банда
        currentWarband(): WarBands | null {
            if (!this.currentWarbandId) return null
            return this.warbands.find(w => w.id === this.currentWarbandId) || null
        },
        // бойцы текущей банды (разрешаем по ID)
        currentFighters(): Fighters[] {
            const warband = this.currentWarband
            if (!warband) return []
            return warband.fighters
                .map(id => this.fighters.find(f => f.id === id))
                .filter((f): f is Fighters => f !== undefined)
        }
    },
    actions: {
        setCurrentWarband(id: string) {
            this.currentWarbandId = id
        }
    }
})