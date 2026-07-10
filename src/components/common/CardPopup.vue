<script setup lang="ts">
import type { Card } from '@/api/interface/Card'

defineProps<{
    card: Card | null
    position: { x: number; y: number } | null
}>()

defineEmits<{
    (e: 'close'): void
}>()
</script>

<template>
    <Teleport to="body">
        <div
                v-if="card && position"
                class="popup-image"
                :style="{
        position: 'fixed',
        left: position.x + 'px',
        top: position.y + 'px',
        zIndex: 9999
      }"
                @click.stop
        >
            <img :src="card.image" alt="card preview" />
            <button class="popup-close" @click="$emit('close')">✕</button>
        </div>
    </Teleport>
</template>

<style scoped>
.popup-image {
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    padding: 4px;
}
.popup-image img {
    max-width: 400px;
    max-height: 400px;
    display: block;
}
.popup-close {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 50%;
    background: #333;
    color: white;
    cursor: pointer;
}
</style>