<template>
    <div class="feedback-view">
        <h1 class="feedback-view__title">Feedback</h1>
        <p class="feedback-view__subtitle">
            We’d love to hear your thoughts! Leave your message below.
        </p>

        <div class="feedback-view__form">
      <textarea
              v-model="message"
              class="feedback-view__textarea"
              placeholder="Write your feedback here…"
              rows="6"
      />
            <button
                    class="feedback-view__button"
                    :disabled="!message.trim() || isSending"
                    @click="sendFeedback"
            >
                <span class="button-icon">📨</span>
                {{ isSending ? 'Sending...' : 'Send Feedback' }}
            </button>

            <div class="feedback-view__github">
                <span>Or report an issue on </span>
                <a
                        href="https://github.com/dzirt00/UnderworldDeckbuilder"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="feedback-view__github-link"
                >
                    GitHub
                </a>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { EmailComposer } from 'capacitor-email-composer'

const message = ref('')
const isSending = ref(false)

async function sendFeedback(): Promise<void> {
    const trimmed = message.value.trim()
    if (!trimmed) return

    isSending.value = true

    try {

        const { hasAccount } = await EmailComposer.hasAccount()

        if (!hasAccount) {
            alert('No email account found on this device. Please set up an email account.')
            return
        }

        // Открываем окно создания письма
        await EmailComposer.open({
            to: ['dzirt00@gmail.com'],
            subject: 'Warhammer Underworlds Feedback',
            body: trimmed,
            isHtml: false,
        })

        message.value = ''
    } catch (error) {
        console.error('Failed to open email composer:', error)
        alert('Something went wrong. Please try again later.')
    } finally {
        isSending.value = false
    }
}
</script>

<style scoped>

.feedback-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 70vh;
    text-align: center;
    padding: 1rem;
}

.feedback-view__title {
    font-size: 2.8rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.feedback-view__subtitle {
    font-size: 1.3rem;
    color: #a0c4ff;
    margin-bottom: 2.5rem;
}

.feedback-view__form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-width: 500px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.feedback-view__textarea {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
    font-family: inherit;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    color: #ffffff;
    resize: vertical;
    transition: border-color 0.3s ease;
}

.feedback-view__textarea:focus {
    outline: none;
    border-color: #a0c4ff;
    background: rgba(255, 255, 255, 0.1);
}

.feedback-view__textarea::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

.feedback-view__button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.9rem 1.5rem;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: #ffffff;
    font-size: 1.2rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.feedback-view__button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.4);
}

.feedback-view__button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
}

.button-icon {
    font-size: 1.6rem;
    line-height: 1;
}

.feedback-view__github {
    margin-top: 0.5rem;
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.6);
}

.feedback-view__github-link {
    color: #a0c4ff;
    text-decoration: none;
    border-bottom: 1px dotted rgba(160, 196, 255, 0.4);
    transition: color 0.2s;
}

.feedback-view__github-link:hover {
    color: #ffffff;
    border-bottom-color: #ffffff;
}
</style>