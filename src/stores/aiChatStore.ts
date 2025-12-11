import { defineStore } from 'pinia'
import type { ApiResponse } from '@/types/api/response'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface ChatHistory {
  conversationId: number
  channel: string
  externalId: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

interface ChatState {
  history: ChatHistory | null
  isLoading: boolean
  isSending: boolean
  error: string | null
  hasMoreMessages: boolean
}

export const useAIChatStore = defineStore('aiChat', {
  state: (): ChatState => ({
    history: null,
    isLoading: false,
    isSending: false,
    error: null,
    hasMoreMessages: true,
  }),

  getters: {
    messages: state => state.history?.messages || [],
    conversationId: state => state.history?.conversationId,
    hasMessages: state => (state.history?.messages.length || 0) > 0,
    canLoadMore: state => state.history !== null,
  },

  actions: {
    async fetchHistory(limit = 10, beforeId?: number) {
      this.isLoading = true
      this.error = null

      try {
        const params: any = { limit }
        if (beforeId)
          params.beforeId = beforeId

        const response = await $rootAPI<ApiResponse<ChatHistory>>('/ai/web/history', {
          method: 'get',
          params,
        })

        const fetchedHistory = response.data

        if (beforeId && this.history) {
          // Load more: push new messages to the beginning
          const newMessages = fetchedHistory.messages || []
          if (newMessages.length > 0) {
            this.history.messages = [...newMessages, ...this.history.messages]
            this.hasMoreMessages = true
          }
          else {
            // No more messages to load
            this.hasMoreMessages = false
          }
        }
        else {
          // Initial load: replace history
          this.history = fetchedHistory
          this.hasMoreMessages = (fetchedHistory.messages?.length || 0) >= limit
        }

        return fetchedHistory
      }
      catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch chat history'
        console.error('Error fetching chat history:', error)
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async sendMessage(message: string) {
      if (!message.trim())
        return

      this.isSending = true
      this.error = null

      // Optimistically add user message to UI
      const tempUserMessage: Message = {
        id: Date.now(),
        role: 'user',
        content: message,
        createdAt: new Date().toISOString(),
      }

      if (this.history) {
        this.history.messages.push(tempUserMessage)
      }
      else {
        this.history = {
          conversationId: 0,
          channel: 'web',
          externalId: '',
          messages: [tempUserMessage],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }

      try {
        const response = await $rootAPI<ApiResponse<string>>('/ai/web', {
          method: 'post',
          data: { message },
        })

        const assistantMessage: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data,
          createdAt: new Date().toISOString(),
        }

        this.history.messages.push(assistantMessage)

        return response.data
      }
      catch (error: any) {
        // Remove optimistic user message on error
        if (this.history)
          this.history.messages = this.history.messages.filter(m => m.id !== tempUserMessage.id)

        this.error = error.response?.data?.message || 'Failed to send message'
        console.error('Error sending message:', error)
        throw error
      }
      finally {
        this.isSending = false
      }
    },

    async startNewSession() {
      this.isLoading = true
      this.error = null

      try {
        const response = await $rootAPI<ApiResponse<any>>('/ai/web/session', {
          method: 'post',
        })

        // Clear current history
        this.history = null
        this.hasMoreMessages = true

        return response.data.data
      }
      catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to start new session'
        console.error('Error starting new session:', error)
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    clearError() {
      this.error = null
    },

    clearHistory() {
      this.history = null
    },
  },
})
