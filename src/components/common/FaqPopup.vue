<script setup lang="ts">
defineProps<{
    text: string
    position: { x: number; y: number } | null
}>()

defineEmits<{
    (e: 'close'): void
}>()
</script>

<template>
    <Teleport to="body">
        <div
                v-if="text && position"
                class="faq-popup"
                :style="{
        position: 'fixed',
        left: position.x + 'px',
        top: position.y + 'px',
        zIndex: 9998,
      }"
                @click.stop
        >
            <div class="faq-content">{{ text }}</div>
            <button class="faq-close" @click="$emit('close')">✕</button>
        </div>
    </Teleport>
</template>

<style scoped>
.faq-popup {
    background: #1a1a2e;
    border: 1px solid #3a3a5a;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    padding: 12px 16px;
    max-width: 300px;
    color: #e0e0e0;
    font-size: 0.9rem;
    line-height: 1.4;
    position: relative;
    word-break: break-word;
}

.faq-close {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 50%;
    background: #333;
    color: white;
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
}
.faq-close:hover {
    background: #555;
}
</style>