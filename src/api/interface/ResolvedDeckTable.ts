import type {Deck} from "./Deck";
import type {Card} from "./Card";
export interface ResolvedDeckTable extends Omit<Deck, 'objectives' | 'gambits' | 'upgrades'> {
    cards: Card[]
}