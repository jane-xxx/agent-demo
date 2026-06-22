// src/composables/useChat.js
import { ref } from 'vue'

export function useChat() {
  const messages = ref([])

  // 发送消息（模拟）
  const sendMessage = async (content) => {
    if (!content || !content.trim()) {
      return null
    }

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    messages.value.push(userMessage)

    // 模拟系统正在处理
    const processingMessage = {
      id: Date.now() + 1,
      type: 'agent',
      content: '正在处理您的请求...',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isProcessing: true
    }
    messages.value.push(processingMessage)

    // 模拟延迟后返回结果（预留 async 接口）
    return new Promise((resolve) => {
      setTimeout(() => {
        // 移除处理中消息
        const processingIndex = messages.value.findIndex(m => m.id === processingMessage.id)
        if (processingIndex !== -1) {
          messages.value.splice(processingIndex, 1)
        }

        // 添加完成消息
        const responseMessage = {
          id: Date.now() + 2,
          type: 'agent',
          content: '任务已完成！您的请求已处理。',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
        messages.value.push(responseMessage)
        resolve(responseMessage)
      }, 1500)
    })
  }

  // 清空消息
  const clearMessages = () => {
    messages.value = []
  }

  return {
    messages,
    sendMessage,
    clearMessages
  }
}
