// src/composables/useChat.js
import { ref, watch } from 'vue'
import { AGENT_RESPONSE_TEMPLATES, LOG_TEMPLATES } from '../utils/constants'
import { MOCK_MESSAGES, MOCK_LOGS } from '../utils/mockData'
import { RESPONSE_TYPES, getAgentResponseTypes } from '../utils/responseTypes'

// LocalStorage keys
const MESSAGES_STORAGE_KEY = 'multiagent_messages'
const LOGS_STORAGE_KEY = 'multiagent_logs'

// 全局消息状态（所有组件共享）
const messages = ref([])
const isProcessing = ref(false)
const activeAgent = ref(null)
const logs = ref([])
const currentTeamId = ref(null)

// 存储每个团队的消息和日志
const teamMessages = new Map()
const teamLogs = new Map()

// 从 localStorage 加载团队数据
const loadFromStorage = () => {
  try {
    const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY)
    const storedLogs = localStorage.getItem(LOGS_STORAGE_KEY)

    if (storedMessages) {
      const parsed = JSON.parse(storedMessages)
      Object.entries(parsed).forEach(([teamId, msgs]) => {
        teamMessages.set(teamId, msgs)
      })
    }

    if (storedLogs) {
      const parsed = JSON.parse(storedLogs)
      Object.entries(parsed).forEach(([teamId, logEntries]) => {
        teamLogs.set(teamId, logEntries)
      })
    }
  } catch (error) {
    console.error('加载聊天数据失败:', error)
  }
}

// 保存团队数据到 localStorage
const saveToStorage = () => {
  try {
    const messagesObj = Object.fromEntries(teamMessages)
    const logsObj = Object.fromEntries(teamLogs)

    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messagesObj))
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logsObj))
  } catch (error) {
    console.error('保存聊天数据失败:', error)
  }
}

// 初始化时加载数据
loadFromStorage()

// 初始化日志（使用 LOG_TEMPLATES）
const initLogs = () => {
  if (logs.value.length === 0) {
    const now = new Date()
    logs.value = LOG_TEMPLATES.slice(0, 8).map((log, index) => ({
      time: new Date(now.getTime() - (7 - index) * 60000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      content: `${log.agent}: ${log.action}`
    }))
  }
}

// 初始化
initLogs()

// 生成唯一 ID
const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

// 格式化时间
const formatTime = () => {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 从模板中随机选择
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]

// 加载团队的消息和日志
const loadTeamData = (teamId) => {
  if (!teamId) {
    messages.value = []
    logs.value = []
    return
  }

  // 如果已经缓存了该团队的数据，使用缓存
  if (teamMessages.has(teamId)) {
    messages.value = [...teamMessages.get(teamId)]
    logs.value = [...teamLogs.get(teamId)]
  } else {
    // 否则尝试加载 mock 数据
    const mockMessages = MOCK_MESSAGES[teamId] || []
    const mockLogs = MOCK_LOGS[teamId] || []

    messages.value = [...mockMessages]
    logs.value = [...mockLogs]

    // 保存到缓存
    teamMessages.set(teamId, messages.value)
    teamLogs.set(teamId, logs.value)
  }

  // 历史消息不需要打字机效果，统一设置 isNew 为 false
  messages.value = messages.value.map(msg => ({
    ...msg,
    isNew: false
  }))
}

// 保存当前团队的数据到缓存
const saveTeamData = (teamId) => {
  if (teamId) {
    // 保存时将 isNew 设为 false，避免历史消息显示打字机效果
    const messagesToSave = messages.value.map(msg => ({
      ...msg,
      isNew: false
    }))
    teamMessages.set(teamId, messagesToSave)
    teamLogs.set(teamId, [...logs.value])
    saveToStorage()
  }
}

// ============================================
// 结构化响应生成器
// ============================================

// 生成文本响应
const generateTextResponse = (content) => ({
  responseType: RESPONSE_TYPES.TEXT,
  data: { content }
})

// 生成代码响应
const generateCodeResponse = (language, code, explanation) => ({
  responseType: RESPONSE_TYPES.CODE,
  data: { language, code, explanation }
})

// 生成表格响应
const generateTableResponse = (headers, rows, caption) => ({
  responseType: RESPONSE_TYPES.TABLE,
  data: { headers, rows, caption }
})

// 生成图表响应
const generateChartResponse = (diagram, caption) => ({
  responseType: RESPONSE_TYPES.CHART,
  data: { diagram, caption }
})

// 生成公式响应
const generateFormulaResponse = (formulas, explanation) => ({
  responseType: RESPONSE_TYPES.FORMULA,
  data: { formulas, explanation }
})

// 生成图片响应
const generateImageResponse = (url, alt, caption) => ({
  responseType: RESPONSE_TYPES.IMAGE,
  data: { url, alt, ...(caption && { caption }) }
})

// 生成文档响应
const generateDocumentResponse = (sections) => ({
  responseType: RESPONSE_TYPES.DOCUMENT,
  data: { sections }
})

// 根据 Agent 和用户消息生成响应
const generateStructuredResponse = (agent, userMessage) => {
  const supportedTypes = getAgentResponseTypes(agent.icon)

  // 为特定 Agent 优先选择特定类型
  let selectedType
  if (agent.icon === 'palette') {
    // Design Agent 优先返回图片
    selectedType = RESPONSE_TYPES.IMAGE
  } else if (agent.icon === 'chart') {
    // Data Analyst 优先返回公式
    selectedType = RESPONSE_TYPES.FORMULA
  } else if (agent.icon === 'code') {
    // Code Agent 优先返回代码
    selectedType = RESPONSE_TYPES.CODE
  } else {
    // 其他 Agent 随机选择
    selectedType = randomFrom(supportedTypes)
  }

  switch (selectedType) {
    case RESPONSE_TYPES.CODE:
      return generateCodeResponse(
        'typescript',
        `// ${agent.name} 为您生成的代码\n\nfunction solve${Date.now()}() {\n  // 实现方案\n  const result = process("${userMessage}")\n  return result\n}\n\n// 这段代码处理了: ${userMessage}`,
        '这是一个基础实现，可根据具体需求进一步优化。'
      )

    case RESPONSE_TYPES.TABLE:
      return generateTableResponse(
        ['项目', '状态', '进度'],
        [
          ['需求分析', '已完成', '100%'],
          ['方案设计', '进行中', '60%'],
          ['开发实现', '待开始', '0%'],
          ['测试验证', '待开始', '0%']
        ],
        `"${userMessage}" 相关项目进度表`
      )

    case RESPONSE_TYPES.CHART:
      return generateChartResponse(
        `flowchart TD\n    A[开始] --> B{判断条件}\n    B -->|是| C[执行方案 A]\n    B -->|否| D[执行方案 B]\n    C --> E[完成]\n    D --> E\n\n    style A fill:#6366f1\n    style E fill:#10b981`,
        `"${userMessage}" 处理流程图`
      )

    case RESPONSE_TYPES.FORMULA:
      return generateFormulaResponse(
        [
          '\\text{效率} = \\frac{\\text{输出}}{\\text{输入}} \\times 100\\%',
          '\\text{优化率} = \\frac{\\text{新值} - \\text{旧值}}{\\text{旧值}} \\times 100\\%'
        ],
        `根据数据分析，针对"${userMessage}"的效率提升了约 23%。`
      )

    case RESPONSE_TYPES.IMAGE:
      const randomId = Math.floor(Math.random() * 1000)
      return generateImageResponse(
        `https://picsum.photos/seed/design${randomId}/800/600`,
        `${agent.name} 生成的图片`
      )

    case RESPONSE_TYPES.DOCUMENT:
      return generateDocumentResponse([
        {
          title: '概述',
          content: `关于"${userMessage}"的分析报告已生成。以下是核心内容摘要。`
        },
        {
          title: '关键发现',
          content: '通过深入分析，我们发现三个关键点需要关注：1）数据质量显著提升；2）流程效率明显改善；3）用户反馈整体积极。'
        },
        {
          title: '建议行动',
          content: '建议下一步重点关注用户反馈收集，并将最佳实践推广到其他业务线。'
        }
      ])

    default:
      return generateTextResponse(
        `收到您的消息："${userMessage}"。\n\n我已理解您的需求，正在为您分析相关内容。请稍等片刻，我会给出详细的处理方案。`
      )
  }
}

export function useChat() {
  // 设置当前团队 ID
  const setTeam = (teamId) => {
    // 先保存当前团队的数据
    if (currentTeamId.value && currentTeamId.value !== teamId) {
      saveTeamData(currentTeamId.value)
    }

    currentTeamId.value = teamId
    loadTeamData(teamId)
  }

  // 添加日志
  const addLog = (agentName, action) => {
    const log = {
      time: formatTime(),
      content: `${agentName}: ${action}`
    }
    logs.value.push(log)
    if (logs.value.length > 50) {
      logs.value.shift()
    }
  }

  // 模拟 Agent 响应
  const simulateAgentResponse = async (agent, userMessage) => {
    // 模拟每个 Agent 的思考时间
    const thinkTime = 800 + Math.random() * 1500
    await new Promise(resolve => setTimeout(resolve, thinkTime))

    // 添加处理日志
    addLog(agent.name, '开始处理任务...')

    // 生成结构化响应
    const response = generateStructuredResponse(agent, userMessage)

    // 添加完成日志
    addLog(agent.name, '任务处理完成')

    return {
      id: generateId(),
      type: 'agent',
      agentId: agent.id,
      agentName: agent.name,
      agentColor: agent.color,
      agentIcon: agent.icon,
      content: `${agent.name} 的响应`,
      ...response,
      isNew: true, // 标记为新消息，启用打字机效果
      timestamp: formatTime()
    }
  }

  // 发送消息
  const sendMessage = async (content, agents = []) => {
    if (!content || !content.trim() || isProcessing.value) {
      return null
    }

    isProcessing.value = true

    // 添加用户消息
    const userMessageId = generateId()
    const userMessage = {
      id: userMessageId,
      type: 'user',
      content: content.trim(),
      timestamp: formatTime()
    }

    // 防止重复：检查是否已存在相同ID的消息
    if (!messages.value.find(m => m.id === userMessageId)) {
      messages.value.push(userMessage)
    }

    // 添加用户操作日志
    addLog('用户', `发送消息: "${content.trim()}"`)

    // 如果没有 Agent，返回提示
    if (!agents || agents.length === 0) {
      addLog('system', '提示：没有匹配的 Agent')
      const noAgentId = generateId()
      const noAgentMessage = {
        id: noAgentId,
        type: 'agent',
        content: '没有找到匹配的 Agent，请检查 @ 提及的名称是否正确。',
        timestamp: formatTime()
      }
      // 防止重复
      if (!messages.value.find(m => m.id === noAgentId)) {
        messages.value.push(noAgentMessage)
      }
      isProcessing.value = false
      return noAgentMessage
    }

    // 添加系统日志
    const agentNames = agents.map(a => a.name).join(', ')
    addLog('system', `任务分配给: ${agentNames}`)

    // 按顺序让每个 Agent 处理并回复
    const agentMessages = []
    for (const agent of agents) {
      // 设置当前活跃 Agent
      activeAgent.value = agent.id

      // 添加处理中状态
      const processingId = generateId()
      const processingMessage = {
        id: processingId,
        type: 'agent',
        agentId: agent.id,
        agentName: agent.name,
        agentColor: agent.color,
        agentIcon: agent.icon,
        content: `${agent.name} 正在思考...`,
        timestamp: formatTime(),
        isProcessing: true
      }
      messages.value.push(processingMessage)

      // 模拟 Agent 处理
      const agentMessage = await simulateAgentResponse(agent, content)

      // 移除处理中消息
      const processingIndex = messages.value.findIndex(m => m.id === processingId)
      if (processingIndex !== -1) {
        messages.value.splice(processingIndex, 1)
      }

      // 添加 Agent 的回复 - 防止重复
      if (!messages.value.find(m => m.id === agentMessage.id)) {
        messages.value.push(agentMessage)
      }
      agentMessages.push(agentMessage)
    }

    // 添加协同完成日志
    addLog('system', '所有 Agent 已完成任务')

    // 清除活跃状态
    activeAgent.value = null
    isProcessing.value = false

    // 保存更新后的数据
    saveTeamData(currentTeamId.value)

    // 返回所有 Agent 的消息
    return agentMessages
  }

  // 清空消息
  const clearMessages = () => {
    messages.value = []
    addLog('system', '清空聊天记录')
    saveTeamData(currentTeamId.value)
  }

  // 获取日志
  const getLogs = () => logs.value

  // 清空日志
  const clearLogs = () => {
    logs.value = []
    saveTeamData(currentTeamId.value)
  }

  return {
    messages,
    logs,
    sendMessage,
    clearMessages,
    isProcessing,
    activeAgent,
    getLogs,
    clearLogs,
    addLog,
    setTeam,
    currentTeamId
  }
}
