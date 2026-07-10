import type {Deck} from "./Deck";
import type {Card} from "./Card";
export interface ResolvedDeck extends Omit<Deck, 'objectives' | 'gambits' | 'upgrades'> {
    objectives: Card[];
    gambits: Card[];
    upgrades: Card[];
}