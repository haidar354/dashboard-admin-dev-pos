<script setup lang="ts">
import { useAIChatStore } from '@/stores/aiChatStore'

const isDialogVisible = ref(false)
const chatStore = useAIChatStore()
const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const isLoadingMore = ref(false)

const { messages, isLoading, isSending, error } = storeToRefs(chatStore)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value)
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  })
}

const loadMoreMessages = async () => {
  if (isLoadingMore.value || !messages.value.length)
    return

  isLoadingMore.value = true

  // Save current scroll position
  const container = messagesContainer.value
  const oldScrollHeight = container?.scrollHeight || 0

  try {
    // Get the oldest message ID
    const oldestMessageId = messages.value[0]?.id

    const result = await chatStore.fetchHistory(20, oldestMessageId)

    // Restore scroll position after new messages loaded
    nextTick(() => {
      if (container) {
        const newScrollHeight = container.scrollHeight

        container.scrollTop = newScrollHeight - oldScrollHeight
      }
    })

    return result
  }
  catch (err) {
    console.error('Failed to load more messages:', err)
  }
  finally {
    isLoadingMore.value = false
  }
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)

  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const formatMessageContent = (content: string) => {
  // Convert markdown-like formatting to HTML
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/\n/g, '<br>') // Line breaks
    .replace(/- (.*?)(<br>|$)/g, '<li>$1</li>') // List items
}

const openChat = async () => {
  isDialogVisible.value = true

  // Load history when opening chat
  if (!chatStore.hasMessages) {
    try {
      await chatStore.fetchHistory()
    }
    catch (err) {
      console.error('Failed to load chat history:', err)
    }
  }

  // Scroll to bottom after opening
  scrollToBottom()
}

const closeChat = () => {
  isDialogVisible.value = false
  chatStore.clearError()
}

const sendMessage = async () => {
  if (!messageInput.value.trim() || isSending.value)
    return

  const message = messageInput.value

  messageInput.value = ''

  try {
    await chatStore.sendMessage(message)
    scrollToBottom()
  }
  catch (err) {
    console.error('Failed to send message:', err)
  }
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const handleInput = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement

  // Auto-resize textarea
  textarea.style.height = 'auto'

  textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
}

const startNewSession = async () => {
  try {
    await chatStore.startNewSession()
    messageInput.value = ''
  }
  catch (err) {
    console.error('Failed to start new session:', err)
  }
}

// Watch for new messages and scroll
watch(() => messages.value.length, () => {
  scrollToBottom()
})
</script>

<template>
  <IconBtn @click="openChat">
    <VIcon
      size="26"
      icon="tabler-message-chatbot"
    />
    <VTooltip
      activator="parent"
      location="bottom"
    >
      Chat with AI
    </VTooltip>
  </IconBtn>

  <!-- Chat Dialog -->
  <VDialog
    v-model="isDialogVisible"
    max-width="700"
    persistent
  >
    <VCard class="chat-dialog">
      <!-- Header -->
      <VCardItem class="chat-header pa-3">
        <template #prepend>
          <VAvatar
            color="primary"
            size="40"
          >
            <VIcon
              icon="tabler-robot"
              size="24"
            />
          </VAvatar>
        </template>

        <VCardTitle class="text-h6">
          AI Assistant
        </VCardTitle>

        <VCardSubtitle class="text-caption">
          {{ chatStore.hasMessages ? `${messages.length} messages` : 'Ready to help' }}
        </VCardSubtitle>

        <template #append>
          <IconBtn
            v-if="chatStore.hasMessages"
            @click="startNewSession"
          >
            <VIcon icon="tabler-refresh" />
            <VTooltip
              activator="parent"
              location="bottom"
            >
              New Session
            </VTooltip>
          </IconBtn>
          <IconBtn @click="closeChat">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </template>
      </VCardItem>

      <VDivider />

      <!-- Messages Area -->
      <div
        ref="messagesContainer"
        class="chat-messages-container"
      >
        <!-- Load More Button -->
        <div
          v-if="chatStore.hasMessages && !isLoading && chatStore.hasMoreMessages"
          class="text-center mb-4"
        >
          <VBtn
            variant="tonal"
            size="small"
            :loading="isLoadingMore"
            @click="loadMoreMessages"
          >
            <VIcon
              start
              icon="tabler-arrow-up"
            />
            Load More Messages
          </VBtn>
        </div>

        <!-- Loading State -->
        <div
          v-if="isLoading && !chatStore.hasMessages"
          class="text-center pa-8"
        >
          <VProgressCircular
            indeterminate
            color="primary"
            size="48"
          />
          <p class="text-disabled mt-4">
            Loading conversation...
          </p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!chatStore.hasMessages"
          class="empty-state text-center pa-8"
        >
          <VIcon
            size="80"
            icon="tabler-message-chatbot"
            color="primary"
            class="mb-4 opacity-50"
          />
          <h3 class="text-h6 mb-2">
            Welcome to AI Assistant!
          </h3>
          <p class="text-body-2 text-disabled mb-6">
            Ask me anything about your business, sales, inventory, or outlets.
          </p>
          <div class="suggested-questions">
            <VChip
              class="ma-1"
              variant="tonal"
              @click="messageInput = 'Berapa omset hari ini?'"
            >
              Berapa omset hari ini?
            </VChip>
            <VChip
              class="ma-1"
              variant="tonal"
              @click="messageInput = 'Stok produk apa yang hampir habis?'"
            >
              Stok produk apa yang hampir habis?
            </VChip>
            <VChip
              class="ma-1"
              variant="tonal"
              @click="messageInput = 'Tampilkan performa outlet'"
            >
              Tampilkan performa outlet
            </VChip>
          </div>
        </div>

        <!-- Messages -->
        <div
          v-else
          class="messages-list"
        >
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-wrapper"
            :class="message.role"
          >
            <div class="message-bubble">
              <div
                v-if="message.role === 'assistant'"
                class="message-avatar"
              >
                <VAvatar
                  color="primary"
                  size="32"
                >
                  <VIcon
                    icon="tabler-robot"
                    size="18"
                  />
                </VAvatar>
              </div>
              <div class="message-content">
                <div
                  class="message-text"
                  v-html="formatMessageContent(message.content)"
                />
                <div class="message-time text-caption text-disabled">
                  {{ formatTime(message.createdAt) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Sending Indicator -->
          <div
            v-if="isSending"
            class="message-wrapper assistant"
          >
            <div class="message-bubble">
              <div class="message-avatar">
                <VAvatar
                  color="primary"
                  size="32"
                >
                  <VIcon
                    icon="tabler-robot"
                    size="18"
                  />
                </VAvatar>
              </div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VDivider />

      <!-- Error Alert -->
      <VAlert
        v-if="error"
        type="error"
        variant="tonal"
        closable
        class="ma-4 mb-0"
        @click:close="chatStore.clearError()"
      >
        {{ error }}
      </VAlert>

      <!-- Input Area -->
      <VCardText class="chat-input-area">
        <div class="chat-input-wrapper">
          <VTextarea
            v-model="messageInput"
            placeholder="Message AI Assistant..."
            variant="solo"
            flat
            auto-grow
            rows="1"
            max-rows="6"
            hide-details
            :disabled="isSending"
            class="chat-textarea"
            @keydown="handleKeyPress"
            @input="handleInput"
          >
            <template #prepend-inner>
              <VIcon
                icon="tabler-message"
                size="20"
                class="text-disabled me-2"
              />
            </template>
          </VTextarea>

          <VBtn
            icon
            size="large"
            color="primary"
            :loading="isSending"
            :disabled="!messageInput.trim() || isSending"
            class="send-button"
            @click="sendMessage"
          >
            <VIcon icon="tabler-send" />
          </VBtn>
        </div>

        <div class="text-caption text-disabled mt-2 px-2">
          <VIcon
            icon="tabler-corner-down-left"
            size="14"
            class="me-1"
          />
          Send message
          <span class="mx-2">•</span>
          <VIcon
            icon="tabler-corner-down-left"
            size="14"
            class="me-1"
          />
          + Shift for new line
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.chat-dialog {
  display: flex;
  flex-direction: column;
  height: 80vh;
  max-height: 700px;
}

.chat-header {
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
  border-block-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.chat-messages-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;

  // Custom scrollbar
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(var(--v-theme-on-surface), 0.05);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--v-theme-on-surface), 0.2);
    border-radius: 4px;

    &:hover {
      background: rgba(var(--v-theme-on-surface), 0.3);
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-block-size: 400px;
}

.suggested-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  max-inline-size: 500px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-wrapper {
  display: flex;

  &.user {
    justify-content: flex-end;

    .message-bubble {
      flex-direction: row-reverse;
    }

    .message-text {
      background: rgb(var(--v-theme-primary));
      color: rgb(var(--v-theme-on-primary));
      border-start-end-radius: 4px;
    }

    .message-time {
      text-align: end;
    }
  }

  &.assistant {
    justify-content: flex-start;

    .message-text {
      background: rgba(var(--v-theme-primary), 0.08);
      color: rgb(var(--v-theme-on-surface));
      border: 1px solid rgba(var(--v-theme-primary), 0.12);
      border-start-start-radius: 4px;
    }
  }
}

.message-bubble {
  display: flex;
  gap: 0.75rem;
  max-inline-size: 85%;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.message-text {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  word-wrap: break-word;
  line-height: 1.5;

  :deep(strong) {
    font-weight: 600;
  }

  :deep(li) {
    margin-inline-start: 1.25rem;
    list-style: disc;
  }
}

.message-time {
  padding-inline: 0.5rem;
  font-size: 0.75rem;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 1rem;
  background: rgba(var(--v-theme-primary), 0.08);
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
  border-radius: 12px;
  border-start-start-radius: 4px;

  span {
    display: inline-block;
    inline-size: 8px;
    block-size: 8px;
    background: rgb(var(--v-theme-primary));
    border-radius: 50%;
    animation: typing 1.4s infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }

  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.chat-input-area {
  flex-shrink: 0;
  padding: 1rem !important;
  background: rgb(var(--v-theme-surface));
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.chat-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgb(var(--v-theme-surface));
  border-radius: 24px;
  border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding: 0.5rem 0.75rem;
  transition: border-color 0.2s ease;
  min-height: 48px;

  &:focus-within {
    border-color: rgb(var(--v-theme-primary));
  }
}

.chat-textarea {
  flex: 1;

  :deep(.v-field) {
    background: transparent !important;
    box-shadow: none !important;
    padding: 0;
    min-height: auto !important;
  }

  :deep(.v-field__field) {
    padding: 0;
    min-height: auto;
  }

  :deep(.v-field__input) {
    padding: 0.5rem 0;
    min-height: auto;
    line-height: 1.5;
    font-size: 0.9375rem;
    opacity: 1 !important;
    color: rgb(var(--v-theme-on-surface)) !important;

    &::placeholder {
      color: rgba(var(--v-theme-on-surface), 0.4) !important;
      opacity: 1 !important;
    }
  }

  :deep(.v-field__prepend-inner) {
    padding-block: 0;
    align-items: center;
  }

  :deep(textarea) {
    resize: none;
    max-height: 200px;
    overflow-y: auto;
    color: rgb(var(--v-theme-on-surface)) !important;
    -webkit-text-fill-color: rgb(var(--v-theme-on-surface)) !important;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(var(--v-theme-on-surface), 0.2);
      border-radius: 2px;
    }
  }
}

.send-button {
  flex-shrink: 0;
  transition: transform 0.2s ease;

  &:not(:disabled):hover {
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.4;
  }
}

// Responsive
@media (max-width: 600px) {
  .chat-dialog {
    height: 100vh;
    max-height: 100vh;
  }

  .message-bubble {
    max-inline-size: 90%;
  }
}
</style>
