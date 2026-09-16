// src/composables/useChat.js
import { ref, watch } from 'vue'
import { AGENT_RESPONSE_TEMPLATES, LOG_TEMPLATES } from '../utils/constants'
import { MOCK_MESSAGES, MOCK_LOGS } from '../utils/mockData'
import { RESPONSE_TYPES, getAgentResponseTypes } from '../utils/responseTypes'
import { KEYWORD_RESPONSES, DEFAULT_RESPONSES } from '../utils/keywordResponses.js'
import { planCollaboration, createDemoDelivery, resolveFollowup, identifyTask, latestDeliveries } from '../utils/collaboration.js'
// 等待工具
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 计算打字时间（基于内容长度）
// 打字速度：20-50ms/字符，平均35ms
const estimateTypingTime = (response) => {
  // 获取文本内容
  let textLength = 0

  if (response.responseType === RESPONSE_TYPES.TEXT || response.responseType === RESPONSE_TYPES.DOCUMENT) {
    // TEXT 或 DOCUMENT 类型：计算 data.content 或 sections 内容
    if (response.data?.content) {
      textLength = response.data.content.length
    } else if (response.data?.sections) {
      textLength = response.data.sections.reduce((sum, section) => {
        return sum + (section.title?.length || 0) + (section.content?.length || 0)
      }, 0)
    }
  } else if (response.responseType === RESPONSE_TYPES.CODE) {
    // CODE 类型：计算 code + explanation
    textLength = (response.data?.code?.length || 0) + (response.data?.explanation?.length || 0)
  } else if (response.responseType === RESPONSE_TYPES.COMPOSITE) {
    // COMPOSITE 类型：计算第一个 item（通常是最长的文本）
    if (response.data?.items?.[0]?.data?.content) {
      textLength = response.data.items[0].data.content.length
    } else if (response.data?.items?.[0]?.data?.code) {
      textLength = response.data.items[0].data.code.length
    }
  }

  // 计算打字时间：35ms/字符 + 500ms 基础延迟
  // 但不超过 8 秒（避免过长等待）
  const baseDelay = 500
  const typingSpeed = 35
  const maxDelay = 8000

  const estimatedTime = Math.min(baseDelay + textLength * typingSpeed, maxDelay)

  return estimatedTime
}

// LocalStorage keys
const MESSAGES_STORAGE_KEY = 'multiagent_messages'
const LOGS_STORAGE_KEY = 'multiagent_logs'
const DATA_VERSION_KEY = 'multiagent_data_version'
const PENDING_STORAGE_KEY = 'multiagent_pending_tasks'
const CURRENT_DATA_VERSION = '2026-09-16-v8-complete-mock-responses'
const DEFAULT_MOCK_TEAM_IDS = new Set(['team-001', 'team-002', 'team-003', 'team-004', 'team-005'])
const isMockOnlyHistory = (items) => Array.isArray(items) && items.length > 0 && items.every(item =>
  String(item?.id || '').startsWith('mock-v6-')
)

// 全局消息状态（所有组件共享）
const messages = ref([])
const isProcessing = ref(false)
// 并行执行的多个智能体同时处于活跃状态，用数组支持多高亮
const activeAgent = ref([])
// 当前广播任务的投标状态（agentId → { bidding, percent }），右栏成员徽标消费
const agentBids = ref({})
// 当前广播任务的协议阶段（announce/bid/execute/review/done），输入框上方进度带消费；null=无进行中任务
const protocolPhase = ref(null)
const logs = ref([])
const currentTeamId = ref(null)
const pendingTask = ref(null)
const resultNavigation = ref(null)
const teamPendingTasks = new Map()

// 存储每个团队的消息和日志
const teamMessages = new Map()
const teamLogs = new Map()

// 从 localStorage 加载团队数据
const loadFromStorage = () => {
  try {
    const storedVersion = localStorage.getItem(DATA_VERSION_KEY)
    const shouldRefreshDefaultExamples = storedVersion !== CURRENT_DATA_VERSION
    const refreshableMockTeamIds = new Set()

    // 仅替换完全由预置示例组成的默认团队历史；用户创建或参与过的内容始终保留。
    if (shouldRefreshDefaultExamples) {
      localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION)
    }

    const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY)
    const storedLogs = localStorage.getItem(LOGS_STORAGE_KEY)
    const storedPending = localStorage.getItem(PENDING_STORAGE_KEY)
    if (storedPending) Object.entries(JSON.parse(storedPending)).forEach(([id, task]) => teamPendingTasks.set(id, task))

    if (storedMessages) {
      const parsed = JSON.parse(storedMessages)
      Object.entries(parsed).forEach(([teamId, msgs]) => {
        if (shouldRefreshDefaultExamples && DEFAULT_MOCK_TEAM_IDS.has(teamId) && isMockOnlyHistory(msgs)) {
          refreshableMockTeamIds.add(teamId)
          teamMessages.set(teamId, [...(MOCK_MESSAGES[teamId] || [])])
          return
        }
        teamMessages.set(teamId, msgs)
      })
    }

    if (storedLogs) {
      const parsed = JSON.parse(storedLogs)
      Object.entries(parsed).forEach(([teamId, logEntries]) => {
        if (refreshableMockTeamIds.has(teamId)) {
          teamLogs.set(teamId, [...(MOCK_LOGS[teamId] || [])])
          return
        }
        teamLogs.set(teamId, logEntries)
      })
    }

    // 让升级后的预置示例成为下一次刷新的缓存来源，避免重新读回旧版本。
    if (refreshableMockTeamIds.size) saveToStorage()
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
    localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(Object.fromEntries(teamPendingTasks)))
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
// 静态响应模板
// ============================================

// 静态响应模板库 - 每个类型都有预定义的响应
const STATIC_RESPONSE_TEMPLATES = {
  code: [
    {
      responseType: RESPONSE_TYPES.CODE,
      data: {
        language: 'typescript',
        code: `// Code Agent - 解决方案\n\ninterface Solution {\n  approach: string\n  complexity: string\n  notes: string\n}\n\nconst solution: Solution = {\n  approach: '使用 TypeScript 泛型确保类型安全',\n  complexity: 'O(n log n)',\n  notes: '适用于大规模数据处理场景'\n}\n\nfunction implement<T>(input: T[]): T[] {\n  return input\n    .filter(item => item !== null)\n    .map(item => transform(item))\n}\n\nfunction transform<T>(item: T): T {\n  return { ...item, processed: true }\n}`,
        explanation: '这是一个类型安全的实现方案，使用泛型确保代码的可复用性。'
      }
    },
    {
      responseType: RESPONSE_TYPES.DOCUMENT,
      data: {
        sections: [
          { title: '技术方案', content: '采用模块化架构，确保代码可维护性。主要优势：清晰的职责划分、易于测试和扩展。' },
          { title: '实现要点', content: '1. 使用 TypeScript 类型系统 2. 遵循 SOLID 原则 3. 编写单元测试' },
          { title: '最佳实践', content: '建议配合 ESLint 和 Prettier 使用，确保代码风格一致。' }
        ]
      }
    }
  ],
  search: [
    {
      responseType: RESPONSE_TYPES.TABLE,
      data: {
        headers: ['项目', '现状', '趋势', '建议'],
        rows: [
          ['市场规模', '2024年达50亿美元', '年增长25%', '重点关注'],
          ['竞品格局', '头部占60%份额', '整合加速', '差异化突破'],
          ['用户需求', '追求效率提升', '个性化需求增强', '定制化服务']
        ],
        caption: '市场调研分析结果'
      }
    },
    {
      responseType: RESPONSE_TYPES.DOCUMENT,
      data: {
        sections: [
          { title: '调研结论', content: '市场呈现快速增长态势，头部效应明显。建议聚焦垂直细分市场。' },
          { title: '关键洞察', content: '用户对个性化、智能化功能的需求最为迫切，这是产品差异化的重要机会点。' },
          { title: '行动建议', content: '优先布局高增长潜力的细分领域，同时建立产品竞争壁垒。' }
        ]
      }
    }
  ],
  document: [
    {
      responseType: RESPONSE_TYPES.DOCUMENT,
      data: {
        sections: [
          { title: '文档概述', content: '本文档提供了清晰的结构化内容，帮助用户快速理解核心信息。' },
          { title: '主要内容', content: '包含背景介绍、详细说明、注意事项等关键部分，确保信息传达准确完整。' },
          { title: '使用建议', content: '建议按顺序阅读，特别关注标注的重要提示部分。' }
        ]
      }
    }
  ],
  chart: [
    {
      responseType: RESPONSE_TYPES.FORMULA,
      data: {
        formulas: [
          '\\text{增长率} = \\frac{\\text{当前值} - \\text{基准值}}{\\text{基准值}} \\times 100\\%',
          '\\text{效率} = \\frac{\\text{输出}}{\\text{输入}} \\times 100\\%'
        ],
        explanation: '根据数据分析，整体效率提升约25%，增长率保持稳定。'
      }
    },
    {
      responseType: RESPONSE_TYPES.TABLE,
      data: {
        headers: ['指标', '数值', '目标', '达成率'],
        rows: [
          ['转化率', '18.5%', '20%', '92.5%'],
          ['留存率', '45.2%', '50%', '90.4%'],
          ['满意度', '4.2/5', '4.5/5', '93.3%']
        ],
        caption: '核心指标监控数据'
      }
    }
  ],
  palette: [
    {
      responseType: RESPONSE_TYPES.IMAGE,
      data: {
        url: 'https://picsum.photos/seed/design1/800/500',
        alt: '设计稿展示'
      }
    }
  ],
  lightbulb: [
    {
      responseType: RESPONSE_TYPES.TEXT,
      data: {
        content: `**创意思考**\n\n关于这个需求，我认为关键在于找到突破口：\n\n1. **问题本质**：从用户体验角度重新审视需求\n2. **创新方向**：结合行业最佳实践\n3. **实施路径**：分阶段验证迭代\n\n建议优先从最简单的方案开始，快速验证核心假设。`
      }
    },
    {
      responseType: RESPONSE_TYPES.TABLE,
      data: {
        headers: ['方案', '创新度', '可行性', '预期效果'],
        rows: [
          ['方案A', '高', '中', '显著提升'],
          ['方案B', '中', '高', '稳步改善'],
          ['方案C', '低', '高', '小幅优化']
        ],
        caption: '方案对比分析'
      }
    }
  ],
  rocket: [
    {
      responseType: RESPONSE_TYPES.TABLE,
      data: {
        headers: ['阶段', '时间', '关键里程碑'],
        rows: [
          ['Q1 - 规划', '1-3月', '完成需求分析和方案设计'],
          ['Q2 - 开发', '4-6月', '核心功能上线'],
          ['Q3 - 验证', '7-9月', '完成用户测试和优化'],
          ['Q4 - 推广', '10-12月', '全量发布和运营']
        ],
        caption: '产品路线图'
      }
    },
    {
      responseType: RESPONSE_TYPES.DOCUMENT,
      data: {
        sections: [
          { title: '战略定位', content: '聚焦核心用户群体，打造差异化竞争优势。' },
          { title: '增长策略', content: '通过产品创新和精细化运营实现可持续增长。' },
          { title: '风险控制', content: '建立完善的风险评估和应对机制。' }
        ]
      }
    }
  ],
  chat: [
    {
      responseType: RESPONSE_TYPES.COMPOSITE,
      data: {
        items: [
          {
            type: RESPONSE_TYPES.TEXT,
            data: { content: '我从多个角度为您分析这个问题：' }
          },
          {
            type: RESPONSE_TYPES.TABLE,
            data: {
              headers: ['角度', '分析', '建议'],
              rows: [
                ['技术', '可行性高', '优先实现'],
                ['成本', '投入可控', '分阶段投入'],
                ['时间', '周期适中', '并行推进']
              ],
              caption: '多维度分析'
            }
          },
          {
            type: RESPONSE_TYPES.TEXT,
            data: { content: '\n\n综合来看，建议采用渐进式实施策略，确保风险可控。' }
          }
        ]
      }
    },
    {
      responseType: RESPONSE_TYPES.TEXT,
      data: {
        content: `**综合分析**\n\n这个问题涉及多个层面，我建议：\n\n• **短期**：快速验证核心假设\n• **中期**：优化和完善解决方案\n• **长期**：建立可持续的竞争优势\n\n需要更详细的某个方面分析吗？`
      }
    }
  ]
}

// 根据 Agent 图标从静态模板中随机选择响应
const generateStructuredResponse = (agent, userMessage) => {
  const templates = STATIC_RESPONSE_TEMPLATES[agent.icon] || STATIC_RESPONSE_TEMPLATES.chat

  // 深拷贝模板，避免修改原数据
  const selectedTemplate = JSON.parse(JSON.stringify(randomFrom(templates)))

  return selectedTemplate
}

export function useChat() {
  // 设置当前团队 ID
  const setTeam = (teamId) => {
    if (isProcessing.value && currentTeamId.value !== teamId) return false
    // 先保存当前团队的数据
    if (currentTeamId.value && currentTeamId.value !== teamId) {
      saveTeamData(currentTeamId.value)
    }

    currentTeamId.value = teamId
    loadTeamData(teamId)
    pendingTask.value = teamPendingTasks.get(teamId) || null
    // 切换团队后清空投标徽标（属于上个团队的协作过程）
    agentBids.value = {}
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

  // Agent 图标到关键词响应类型的映射
  const iconToResponseMap = {
    'code': 'code',
    'search': 'research',
    'document': 'writing',
    'chart': 'data',
    'palette': 'design',
    'lightbulb': 'strategy',
    'rocket': 'product',
    'chat': 'chat'
  }

  // 关键词匹配响应函数
  const asTemplateExample = (response) => ({
    templateExample: true,
    responseType: RESPONSE_TYPES.COMPOSITE,
    data: { items: [
      { type: RESPONSE_TYPES.TEXT, data: { content: '前端模板示例：以下内容为预置素材，未调用模型、检索资料或执行代码，不代表针对本轮任务生成的结论。' } },
      { type: response.responseType, data: JSON.parse(JSON.stringify(response.data)) }
    ] }
  })

  const matchResponse = (agent, userMessage) => {
    const responseType = iconToResponseMap[agent.icon] || 'chat'
    if (agent.icon === 'chart') {
      return createDemoDelivery(userMessage, { name: '数据分析', capability: 'analysis' }, [])
    }
    const agentResponses = KEYWORD_RESPONSES[responseType]

    if (!agentResponses) {
      // 如果没有匹配的关键词响应，使用默认响应
      return asTemplateExample(DEFAULT_RESPONSES[responseType] || DEFAULT_RESPONSES.code)
    }

    for (const item of agentResponses) {
      if (item.keywords.some(k => userMessage.toLowerCase().includes(k))) {
        // 深拷贝避免修改原数据
        return asTemplateExample(item.response)
      }
    }

    // 如果没有匹配的关键词，返回默认响应
    return asTemplateExample(DEFAULT_RESPONSES[responseType] || DEFAULT_RESPONSES.code)
  }

  // 计算文本的打字时间估算
  const estimateTypingTime = (response) => {
    // 打字机效果速度约为 20-50ms/字符，平均 35ms
    const avgTypingSpeed = 35

    let totalTextLength = 0

    // 计算各种响应类型的文本长度
    if (response.responseType === RESPONSE_TYPES.COMPOSITE) {
      // 组合响应：遍历所有 items
      if (response.data?.items) {
        for (const item of response.data.items) {
          if (item.type === RESPONSE_TYPES.TEXT && item.data?.content) {
            totalTextLength += item.data.content.length
          }
        }
      }
    } else if (response.responseType === RESPONSE_TYPES.TEXT && response.data?.content) {
      totalTextLength = response.data.content.length
    } else if (response.responseType === RESPONSE_TYPES.CODE && response.data?.code) {
      totalTextLength = response.data.code.length
    }

    // 返回估算的打字时间（毫秒），至少 500ms
    return Math.max(500, totalTextLength * avgTypingSpeed)
  }

  // 模拟 Agent 响应
  const simulateAgentResponse = async (agent, userMessage, execution) => {
    // 模拟每个 Agent 的思考时间
    const thinkTime = 800 + Math.random() * 1500
    await new Promise(resolve => setTimeout(resolve, thinkTime))

    // 添加处理日志
    addLog(agent.name, '开始处理任务...')

    // 使用关键词匹配生成响应
    if (execution?.step.key === 'technical' && /生成代码|实现代码|编写代码/.test(userMessage) && execution.upstream.some(o => o.artifact?.pages?.length)) {
      execution = { ...execution, step: { ...execution.step, key: 'implementation', name: '实现方案' } }
    }
    const response = execution
      ? execution.step.key === 'technical'
        ? { ...matchResponse(agent, userMessage), deliveryStatus: 'needs_info', artifact: { body: '已提供技术参考。请补充具体代码、错误信息与运行环境，尚未验证或执行修复。' } }
        : createDemoDelivery(userMessage, execution.step, execution.upstream)
      : matchResponse(agent, userMessage)

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
      isNew: true,
      timestamp: formatTime()
    }
  }

  // 单个智能体的执行回合：占位 → 思考 → 回复，独立维护自己的活跃状态
  // （并行时每个智能体各自调用，互不阻塞；transform 供打回修订时改写产出）
  const runAgentTurn = async (agent, content, { transform, execution } = {}) => {
    if (!activeAgent.value.includes(agent.id)) {
      activeAgent.value.push(agent.id)
    }

    const processingId = generateId()
    messages.value.push({
      id: processingId,
      type: 'agent',
      agentId: agent.id,
      agentName: agent.name,
      agentColor: agent.color,
      agentIcon: agent.icon,
      content: `${agent.name} 正在思考...`,
      timestamp: formatTime(),
      isProcessing: true
    })

    try {
      let agentMessage = await simulateAgentResponse(agent, content, execution)
      if (transform) {
        agentMessage = transform(agentMessage)
      }

      // 移除处理中消息
      const processingIndex = messages.value.findIndex(m => m.id === processingId)
      if (processingIndex !== -1) {
        messages.value.splice(processingIndex, 1)
      }

      // 添加 Agent 的回复 - 防止重复
      if (!messages.value.find(m => m.id === agentMessage.id)) {
        messages.value.push(agentMessage)
      }
      return agentMessage
    } catch (err) {
      console.error('Agent 处理失败:', agent.name, err)
      const processingIndex = messages.value.findIndex(m => m.id === processingId)
      if (processingIndex !== -1) {
        messages.value.splice(processingIndex, 1)
      }
      return null
    } finally {
      activeAgent.value = activeAgent.value.filter(id => id !== agent.id)
    }
  }

  // 发送消息
  // mode='auto'：规则拆解 → 能力检查 → 依赖接力 → 汇总交付
  // mode='direct'：@指派路径，人类决策权直通，按传入顺序串行直答，不进协作环
  const sendMessage = async (content, agents = [], { mode = 'auto', confirmed = false, resume = false } = {}) => {
    if (!content || !content.trim() || isProcessing.value) {
      return null
    }

    isProcessing.value = true
    const context = resume && pendingTask.value?.context || resolveFollowup(content, messages.value)

    // 添加用户消息
    const userMessageId = generateId()
    const userMessage = {
      id: userMessageId,
      type: 'user',
      content: content.trim(),
      timestamp: formatTime()
    }

    // 防止重复：检查是否已存在相同ID的消息
    if (!resume && !messages.value.find(m => m.id === userMessageId)) {
      messages.value.push(userMessage)
    }

    // 添加用户操作日志
    addLog('用户', resume ? '继续原任务' : `发送消息: "${content.trim()}"`)

    // 如果没有 Agent，返回提示
    if (mode === 'direct' && (!agents || agents.length === 0)) {
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
      saveTeamData(currentTeamId.value)
      return noAgentMessage
    }

    const agentMessages = []

    try {
      if (mode === 'auto') {
        const followupIntent = identifyTask(content)
        const intent = context.followup && followupIntent.needsClarification
          ? context.upstream.map(o => ({ requirements: '需求', design: '设计', implementation: '实现', writing: '整理文档' }[o.key] || '')).join('、')
          : content
        const codeContinuation = context.followup && /生成代码|实现代码|编写代码/.test(content) && context.upstream.some(o => o.artifact?.pages?.length)
        const board = planCollaboration(context.task, agents, codeContinuation ? '代码' : intent)
        if (codeContinuation) board.steps.forEach(s => {
          if (s.key === 'technical') { s.key = 'implementation'; s.name = '实现方案' }
        })
        agentBids.value = {}
        const pushSystem = (text, type = 'endline') => messages.value.push({
          id: generateId(), type, content: text, timestamp: formatTime(), isNew: false
        })
        if (board.needsClarification || context.missingContext) {
          pushSystem(context.missingContext ? '没有可引用的上一轮交付，请说明任务对象和具体要求。' : '待补充信息：请说明希望完成的动作和交付，例如“调研竞品”“设计页面”或“开发应用”。', 'notice')
          addLog('system', '任务意图不明确，等待补充信息')
          return []
        }
        const previousBoard = resume ? [...messages.value].reverse().find(m => m.type === 'decomp') : null
        if (previousBoard) {
          previousBoard.subtasks = board.steps
        } else {
          messages.value.push({ id: generateId(), type: 'decomp', subtasks: board.steps, timestamp: formatTime(), isNew: false })
        }
        const planMessage = previousBoard || messages.value[messages.value.length - 1]
        planMessage.planStatus = 'planned'
        const updateStep = (key, status, resultId) => {
          const item = planMessage.subtasks.find(s => s.key === key)
          if (!item) return
          item.status = status
          if (resultId) item.resultId = resultId
        }
        protocolPhase.value = 'bid'
        for (const agent of agents) {
          const assigned = board.steps.filter(s => s.agent?.id === agent.id)
          agentBids.value[agent.id] = { bidding: assigned.length > 0 }
          addLog(agent.name, assigned.length ? `能力匹配：${assigned.map(s => s.name).join('、')}` : '能力不匹配，未参与')
        }
        if (board.missing.length && !confirmed) {
          planMessage.planStatus = 'awaiting_choice'
          pendingTask.value = { content, context, plan: board, teamId: currentTeamId.value, planId: planMessage.id }
          teamPendingTasks.set(currentTeamId.value, pendingTask.value)
          addLog('system', `执行前能力检查：缺少${board.missing.map(s => s.capabilityLabel).join('、')}，等待用户选择`)
          return []
        }
        pendingTask.value = null
        teamPendingTasks.delete(currentTeamId.value)
        const outputs = [...context.upstream]
        const outcomes = new Map()
        protocolPhase.value = 'execute'
        planMessage.planStatus = 'running'
        for (const s of board.steps) {
          if (!s.agent) { outcomes.set(s.key, 'uncovered'); continue }
          if (s.dependencies.some(key => outcomes.get(key) !== 'completed')) {
            outcomes.set(s.key, 'blocked')
            updateStep(s.key, 'blocked')
            addLog(s.agent.name, `${s.name}等待上游有效交付`)
            continue
          }
          addLog(s.agent.name, `执行「${s.name}」`)
          const upstream = latestDeliveries(outputs.filter(o => s.dependencies.includes(o.key) || context.upstream.includes(o)))
          updateStep(s.key, 'running')
          const result = await runAgentTurn(s.agent, context.task, { execution: { step: s, upstream } })
          if (result) { result.taskKey = s.key; result.taskName = s.name }
          const status = result?.deliveryStatus || 'failed'
          outcomes.set(s.key, status)
          updateStep(s.key, status, result?.id)
          if (result) {
            outputs.push({ key: s.key, agent: s.agent, message: result, artifact: result.artifact, subtask: s.name })
            agentMessages.push(result)
            await sleep(Math.min(estimateTypingTime(result), 8000))
          }
        }
        const remaining = board.steps.filter(s => outcomes.get(s.key) !== 'completed')
        const failed = board.steps.some(s => outcomes.get(s.key) === 'failed')
        const needsInfo = board.steps.some(s => outcomes.get(s.key) === 'needs_info')
        planMessage.planStatus = failed ? 'failed' : needsInfo ? 'needs_info' : remaining.length ? 'partial' : 'completed'
        const status = failed ? '执行失败' : needsInfo ? '待补充信息' : remaining.length ? '部分完成' : '协作完成'
        addLog('system', status)
        protocolPhase.value = 'done'
        await sleep(900)
      } else {
        // ===== @指派：人类决策权直通，不进协作环，保持原有串行行为 =====
        const agentNames = agents.map(a => a.name).join(', ')
        addLog('system', `任务指派给: ${agentNames}`)

        for (let i = 0; i < agents.length; i++) {
          const directedPlan = context.followup ? planCollaboration(context.task, [agents[i]], content) : null
          const ownSteps = directedPlan?.steps.filter(s => s.agent)
          const selected = ownSteps?.at(-1) || (context.followup && identifyTask(content).needsClarification ? planCollaboration(context.task, [agents[i]], { rocket: '需求', palette: '设计', code: '实现', document: '整理文档' }[agents[i].icon] || '').steps.find(s => s.agent) : null)
          if (context.missingContext || (context.followup && !selected)) {
            messages.value.push({ id: generateId(), type: 'notice', content: context.missingContext ? '没有可引用的上一轮交付，请说明具体任务。' : `${agents[i].name}无法匹配本轮要求，请调整指派或补充具体要求。`, timestamp: formatTime() })
            continue
          }
          if (selected?.key === 'technical') { selected.key = 'implementation'; selected.name = '实现方案' }
          const agentMessage = await runAgentTurn(agents[i], context.task, selected ? { execution: { step: selected, upstream: latestDeliveries(context.upstream) } } : {})
          if (agentMessage && selected) { agentMessage.taskKey = selected.key; agentMessage.taskName = selected.name }
          if (agentMessage) {
            agentMessages.push(agentMessage)
          }
          // 多 Agent 场景下：等待打字效果完成后再进行下一个
          if (agentMessage && agents.length > 1 && i < agents.length - 1) {
            const typingTime = estimateTypingTime(agentMessage)
            await new Promise(resolve => setTimeout(resolve, typingTime))
          }
        }
      }
    } finally {
      if (mode === 'direct') {
        // 直通路径没有协议收尾日志，保留这条完成提示
        addLog('system', '指定成员响应结束')
      }

      // 清除活跃状态
      activeAgent.value = []
      protocolPhase.value = null
      isProcessing.value = false

      // 保存更新后的数据
      saveTeamData(currentTeamId.value)
    }

    // 返回所有 Agent 的消息
    return agentMessages
  }

  // 清空消息
  const dismissPendingTask = () => {
    const plan = pendingTask.value && messages.value.find(m => m.id === pendingTask.value.planId)
    if (plan) {
      plan.planStatus = 'cancelled'
      plan.subtasks.forEach(s => { if (s.status === 'ready') s.status = 'cancelled' })
    }
    pendingTask.value = null
    teamPendingTasks.delete(currentTeamId.value)
    saveToStorage()
  }

  const resumePendingTask = (agents, { allowPartial = false } = {}) => {
    const task = pendingTask.value
    if (!task || task.teamId !== currentTeamId.value) return
    return sendMessage(task.content, agents, { mode: 'auto', confirmed: allowPartial, resume: true })
  }

  const clearMessages = () => {
    dismissPendingTask()
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
    agentBids,
    protocolPhase,
    getLogs,
    clearLogs,
    addLog,
    setTeam,
    currentTeamId,
    pendingTask,
    resultNavigation,
    requestResult: id => { resultNavigation.value = { id, time: Date.now() } },
    dismissPendingTask,
    resumePendingTask
  }
}
