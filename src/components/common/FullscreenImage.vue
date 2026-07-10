<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
    src: string | null
    alt?: string
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const startTranslateX = ref(0)
const startTranslateY = ref(0)

// Для pinch-жестов
const initialPinchDistance = ref(0)
const initialScale = ref(1)

watch(() => props.src, () => {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
})

function onWheel(e: WheelEvent) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    scale.value = Math.min(Math.max(scale.value + delta, 0.5), 5)
}

// Обработчики для мыши/пальца (drag)
function onPointerDown(e: PointerEvent) {
    if (scale.value <= 1) return
    isDragging.value = true
    startX.value = e.clientX
    startY.value = e.clientY
    startTranslateX.value = translateX.value
    startTranslateY.value = translateY.value
    const target = e.currentTarget as HTMLElement
    target?.setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
    if (!isDragging.value) return
    const dx = e.clientX - startX.value
    const dy = e.clientY - startY.value
    translateX.value = startTranslateX.value + dx
    translateY.value = startTranslateY.value + dy
}

function onPointerUp(e: PointerEvent) {
    isDragging.value = false
    const target = e.currentTarget as HTMLElement
    target?.releasePointerCapture(e.pointerId)
}

// Обработчики для pinch (мультитач)
function onTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const dx = touch1.clientX - touch2.clientX
        const dy = touch1.clientY - touch2.clientY
        initialPinchDistance.value = Math.sqrt(dx * dx + dy * dy)
        initialScale.value = scale.value
    }
}

function onTouchMove(e: TouchEvent) {
    if (e.touches.length === 2) {
        e.preventDefault()
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const dx = touch1.clientX - touch2.clientX
        const dy = touch1.clientY - touch2.clientY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const scaleFactor = distance / initialPinchDistance.value
        const newScale = Math.min(Math.max(initialScale.value * scaleFactor, 0.5), 5)
        scale.value = newScale
    }
}

function onDoubleClick() {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
}

function close(e?: Event) {
    if (e) e.stopPropagation()
    emit('close')
}

// Обработка клавиши Escape
function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && props.src) {
        close()
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
    <Teleport to="body">
        <div
                v-if="src"
                class="fullscreen-overlay"
                @click="close"
        >
            <div
                    class="fullscreen-content"
                    @click.stop
                    @wheel="onWheel"
                    @pointerdown="onPointerDown"
                    @pointermove="onPointerMove"
                    @pointerup="onPointerUp"
                    @pointercancel="onPointerUp"
                    @touchstart="onTouchStart"
                    @touchmove="onTouchMove"
                    @dblclick="onDoubleClick"
                    style="touch-action: none;"
            >
                <button
                        class="fullscreen-close"
                        @click.stop="close"
                        @touchstart.stop
                        aria-label="Назад"
                >
                    X
                </button>
                <img
                        :src="src"
                        :alt="alt || 'Увеличенное изображение'"
                        :style="{
                        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                        transformOrigin: 'center center',
                        cursor: scale > 1 ? 'grab' : 'default'
                    }"
                        draggable="false"
                />
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.fullscreen-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    cursor: pointer;
}

.fullscreen-content {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    touch-action: none;
    cursor: default;
}

.fullscreen-content img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
    transition: transform 0.05s linear;
    user-select: none;
    -webkit-user-drag: none;
}

.fullscreen-close {
    position: absolute;
    top: 40px;
    left: 20px;
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: background 0.2s;
    padding: 0;
    line-height: 1;
}

.fullscreen-close:hover {
    background: rgba(255, 255, 255, 0.3);
}

.fullscreen-close:active {
    transform: scale(0.9);
}

@media (max-width: 480px) {
    .fullscreen-close {
        top: 32px; /* 12px + 20px */
        left: 12px;
        width: 40px;
        height: 40px;
        font-size: 24px;
    }
}
</style>