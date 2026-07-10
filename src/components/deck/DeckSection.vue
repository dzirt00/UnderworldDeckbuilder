<script setup lang="ts">
import type { Card } from '@/api/interface/Card'
import Surge from '@/components/images/Surge.vue'

defineProps<{
    title: string
    cards: Card[]
}>()

defineEmits<{
    (e: 'show-card', card: Card, event: MouseEvent): void
}>()
</script>

<template>
    <section class="section">
        <div class="section__header">
            <h2>{{ title }}</h2>
            <span class="count">{{ cards.length }}</span>
        </div>
        <div class="flex" v-for="el in cards">
            <div><img :src="el.imageDeck" :alt="el.name" :title="el.name" /></div>
            <div class="name--card" @click="$emit('show-card', el, $event)">
                {{ el.name }}
            </div>
            <div v-if="el.type !== 'ploy'"> ({{ el.glory }})</div>
            <Surge v-if="el.surge && el.type === 'objective'" class="img" />
        </div>
    </section>
</template>

<style scoped>
.section {
  margin-bottom: 32px;
}

.section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;


  margin-bottom: 12px;
  padding: 0 12px 6px 0;

  border-bottom: 1px solid #1f2937;
}

h2 {
  font-size: 18px;
  font-weight: 500;
}

.count {
  font-size: 12px;
  color: #9ca3af;
}

img, .img {
  padding: 0 5px;
  max-height: 16px;
  max-width: 16px;

}
.flex {
  display: flex;

}
.name--card {
    font-weight: bold;
    font-size: 20px;

}

.name--card:hover,:focus  {
    border-bottom: 1px solid black;
    cursor: pointer;
}
</style>