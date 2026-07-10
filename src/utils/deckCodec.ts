export function encodeDeck(warbandId: string | null, cardIds: string[], name?: string): string {
    const data = { warbandId, cardIds, name: name || 'Shared Deck' }
    return btoa(encodeURIComponent(JSON.stringify(data)))
}

export function decodeDeck(encoded: string): { warbandId: string | null; cardIds: string[]; name: string } | null {
    try {
        if (encoded.length > 10000) return null

        const json = decodeURIComponent(atob(encoded))
        const data = JSON.parse(json)

        if (!data || typeof data !== 'object') return null
        if (!Array.isArray(data.cardIds)) return null
        if (data.cardIds.length > 32) return null
        if (data.cardIds.some((id: any) => typeof id !== 'string')) return null
        if (data.name && typeof data.name !== 'string') return null
        if (data.warbandId && typeof data.warbandId !== 'string') return null

        return {
            warbandId: data.warbandId || null,
            cardIds: data.cardIds,
            name: data.name || 'Shared Deck'
        }
    } catch {
        return null
    }
}

/**
 * Генерирует полную ссылку для импорта колоды
 * @param encoded - закодированная строка из encodeDeck
 * @returns URL вида https://yourapp.com/import?deck=...
 */
export function buildDeckLink(encoded: string): string {
    const baseUrl = import.meta.env.VITE_APP_URL || 'https://play.google.com/store/apps/details?id=com.dzirt00.UnderworldDeckbuilder'
    return `${baseUrl}/import?deck=${encoded}`
}