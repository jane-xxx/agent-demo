// src/composables/useChat.js
import { ref } from 'vue'

// 全局消息状态（所有组件共享）
const messages = ref([])
const isProcessing = ref(false)

// 生成唯一 ID
const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

export function useChat() {
  // 模拟 Agent 响应
  const simulateAgentResponse = async (agent, userMessage, previousMessages) => {
    // 模拟每个 Agent 的思考时间
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000))

    // 根据 Agent 的类型和角色生成不同的回复
    const responses = {
      'ChatBubbleLeftRightIcon': (msg) => `收到您的消息："${msg}"。我已记录并正在准备协助您。`,
      'MagnifyingGlassIcon': (msg) => `正在搜索关于"${msg}"的相关信息... 我会帮您找到最佳答案。`,
      'DocumentTextIcon': (msg) => `我正在整理关于"${msg}"的文档和参考资料。请稍等...`,
      'CodeBracketIcon': (msg) => `收到任务："${msg}"。我正在分析代码结构和实现方案。`,
      'ChartBarIcon': (msg) => `正在分析"${msg}"的数据模式，准备生成报告。`,
      'PaintBrushIcon': (msg) => `我正在为"${msg}"设计视觉方案，请稍候查看创意建议。`,
      'LightBulbIcon': (msg) => `关于"${msg}"，我有一些创新想法和建议想与您分享。`,
      'RocketLaunchIcon': (msg) => `收到任务！我正在规划"${msg}"的执行策略和实施步骤。`
    }

    const defaultResponse = (msg, agentName) => `我是${agentName}，已收到您的消息："${msg}"，正在为您处理。`

    const responseFunc = responses[agent.icon]
    const content = responseFunc
      ? responseFunc(userMessage)
      : defaultResponse(userMessage, agent.name)

    return {
      id: generateId(),
      type: 'agent',
      agentId: agent.id,
      agentName: agent.name,
      agentColor: agent.color,
      agentIcon: agent.icon,
      content,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
  }

  // 发送消息
  const sendMessage = async (content, agents = []) => {
    if (!content || !content.trim() || isProcessing.value) {
      return null
    }

    isProcessing.value = true

    // 添加用户消息
    const userMessage = {
      id: generateId(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    messages.value.push(userMessage)

    // 如果没有 Agent，返回提示
    if (!agents || agents.length === 0) {
      const noAgentMessage = {
        id: generateId(),
        type: 'agent',
        content: '请先选择 Agent 加入您的团队。',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
      messages.value.push(noAgentMessage)
      isProcessing.value = false
      return noAgentMessage
    }

    // 按顺序让每个 Agent 处理并回复
    const agentMessages = []
    for (const agent of agents) {
      // 添加处理中状态
      const processingId = generateId()
      const processingMessage = {
        id: processingId,
        type: 'agent',
        agentId: agent.id,
        agentName: agent.name,
        agentColor: agent.color,
        content: `${agent.name} 正在思考...`,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isProcessing: true
      }
      messages.value.push(processingMessage)

      // 模拟 Agent 处理
      const agentMessage = await simulateAgentResponse(agent, content, messages.value)

      // 移除处理中消息
      const processingIndex = messages.value.findIndex(m => m.id === processingId)
      if (processingIndex !== -1) {
        messages.value.splice(processingIndex, 1)
      }

      // 添加 Agent 的回复
      messages.value.push(agentMessage)
      agentMessages.push(agentMessage)
    }

    isProcessing.value = false

    // 返回所有 Agent 的消息
    return agentMessages
  }

  // 清空消息
  const clearMessages = () => {
    messages.value = []
  }

  return {
    messages,
    sendMessage,
    clearMessages,
    isProcessing
  }
}
