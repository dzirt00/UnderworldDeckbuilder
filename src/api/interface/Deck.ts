export interface Deck {
    id: string;
    name: string;
    description: string;
    slug: string,
    setId: string,
    objectives: string[];
    gambits: string[];
    upgrades: string[];
    imageDeck: string
}