import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import DecksView from '@/views/DecksView.vue'
import DeckDetailView from '@/views/DeckDetailView.vue'
import WarbandsView from '@/views/WarbandsView.vue'
import WarbandDetailView from '@/views/WarbandDetailView.vue'
import BuilderView from '@/views/BuilderView.vue'
import MyDecksView from '@/views/MyDecksView.vue'
import UserDeckDetailView from '@/views/UserDeckDetailView.vue'
import ImportDeckView from '@/views/ImportDeckView.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/decks',
        name: 'decks',
        component: DecksView
    },
    {
        path: '/decks/:id',
        name: 'deck-detail',
        component: DeckDetailView,
        props: true
    },
    {
        path: '/warbands',
        name: 'warbands',
        component: WarbandsView
    },
    {
        path: '/warbands/:id',
        name: 'warband-detail',
        component: WarbandDetailView,
        props: true
    },
    {
        path: '/builder',
        name: 'builder',
        component: BuilderView
    },
    {
        path: '/my-decks',
        name: 'my-decks',
        component: MyDecksView
    },
    {
        path: '/my-decks/:id',
        name: 'user-deck-detail',
        component: UserDeckDetailView,
        props: true
    },
    {
        path: '/import',
        name: 'import',
        component: ImportDeckView
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router