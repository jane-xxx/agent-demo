// Mock 数据文件 - MultiAgent 应用
// 支持结构化响应类型

import { RESPONSE_TYPES } from './responseTypes'
import { createMockExamples } from './mockExamples.js'

// Agent 数据定义
const AGENTS = [
  {
    id: 1,
    name: '对话智能体',
    description: '擅长自然语言对话，理解上下文，提供流畅的交互体验',
    tags: ['对话', '问答', '通用'],
    category: '全部',
    icon: 'chat',
    color: '#6c5ce7'
  },
  {
    id: 2,
    name: '调研智能体',
    description: '专业的研究分析助手，快速搜索、整理和分析各类信息',
    tags: ['搜索', '分析', '研究'],
    category: '研究分析',
    icon: 'search',
    color: '#3498db'
  },
  {
    id: 3,
    name: '写作智能体',
    description: '专业的文案创作助手，支持多种文体和风格的写作',
    tags: ['写作', '文案', '创作'],
    category: '内容创作',
    icon: 'document',
    color: '#a855f7'
  },
  {
    id: 4,
    name: '代码智能体',
    description: '专业的代码助手，支持多种编程语言和开发任务',
    tags: ['代码', '开发', '调试'],
    category: '开发工具',
    icon: 'code',
    color: '#00b894'
  },
  {
    id: 5,
    name: '数据分析智能体',
    description: '数据分析专家，处理复杂数据集并提供可视化洞察',
    tags: ['数据', '分析', '可视化'],
    category: '数据分析',
    icon: 'chart',
    color: '#e17055'
  },
  {
    id: 6,
    name: '设计智能体',
    description: '创意设计助手，提供设计灵感和视觉创意支持',
    tags: ['设计', '创意', '视觉'],
    category: '设计创意',
    icon: 'palette',
    color: '#d63031'
  },
  {
    id: 7,
    name: '战略智能体',
    description: '战略规划专家，帮助制定长期策略和决策分析',
    tags: ['战略', '规划', '决策'],
    category: '研究分析',
    icon: 'lightbulb',
    color: '#f39c12'
  },
  {
    id: 8,
    name: '产品智能体',
    description: '产品管理助手，从需求分析到产品规划全流程支持',
    tags: ['产品', '规划', '需求'],
    category: '效率提升',
    icon: 'rocket',
    color: '#00cec9'
  }
]

// ============================================
// 团队 Mock 数据
// ============================================
export const MOCK_TEAMS = [
  {
    id: 'team-001',
    name: '产品研发团队',
    subtitle: '2小时前',
    memberCount: 5,
    color: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    createdAt: '2024-06-22T09:30:00.000Z',
    lastActivity: '2小时前',
    description: '负责新产品功能开发和技术实现',
    agents: [
      { ...AGENTS[3], status: 'online', color: '#00b894' },
      { ...AGENTS[1], status: 'online', color: '#3498db' },
      { ...AGENTS[4], status: 'online', color: '#e17055' },
      { ...AGENTS[7], status: 'online', color: '#00cec9' },
      { ...AGENTS[5], status: 'online', color: '#d63031' }
    ]
  },
  {
    id: 'team-002',
    name: '市场分析团队',
    subtitle: '昨天',
    memberCount: 3,
    color: 'linear-gradient(135deg, #00b894, #00cec9)',
    createdAt: '2024-06-21T14:20:00.000Z',
    lastActivity: '昨天',
    description: '负责市场调研、竞品分析和数据洞察',
    agents: [
      { ...AGENTS[1], status: 'online', color: '#3498db' },
      { ...AGENTS[4], status: 'online', color: '#e17055' },
      { ...AGENTS[6], status: 'online', color: '#f39c12' }
    ]
  },
  {
    id: 'team-003',
    name: '内容创作团队',
    subtitle: '3天前',
    memberCount: 4,
    color: 'linear-gradient(135deg, #d63031, #e17055)',
    createdAt: '2024-06-19T10:15:00.000Z',
    lastActivity: '3天前',
    description: '负责文案撰写、内容规划和创意输出',
    agents: [
      { ...AGENTS[2], status: 'online', color: '#a855f7' },
      { ...AGENTS[5], status: 'online', color: '#d63031' },
      { ...AGENTS[0], status: 'online', color: '#6c5ce7' },
      { ...AGENTS[7], status: 'online', color: '#00cec9' }
    ]
  },
  {
    id: 'team-004',
    name: 'UI/UX设计团队',
    subtitle: '上周',
    memberCount: 3,
    color: 'linear-gradient(135deg, #d63031, #fd79a8)',
    createdAt: '2024-06-15T16:45:00.000Z',
    lastActivity: '上周',
    description: '负责用户界面设计、用户体验优化',
    agents: [
      { ...AGENTS[5], status: 'online', color: '#d63031' },
      { ...AGENTS[0], status: 'online', color: '#6c5ce7' },
      { ...AGENTS[7], status: 'online', color: '#00cec9' }
    ]
  },
  {
    id: 'team-005',
    name: '数据分析团队',
    subtitle: '上周',
    memberCount: 5,
    color: 'linear-gradient(135deg, #00b894, #55efc4)',
    createdAt: '2024-06-14T11:00:00.000Z',
    lastActivity: '上周',
    description: '负责业务数据分析、报表生成和洞察输出',
    agents: [
      { ...AGENTS[4], status: 'online', color: '#e17055' },
      { ...AGENTS[1], status: 'online', color: '#3498db' },
      { ...AGENTS[6], status: 'online', color: '#f39c12' },
      { ...AGENTS[3], status: 'online', color: '#00b894' },
      { ...AGENTS[2], status: 'online', color: '#a855f7' }
    ]
  }
]

// ============================================
// 聊天消息 Mock 数据 - 结构化响应版本
// ============================================
const examples = createMockExamples(MOCK_TEAMS)
export const MOCK_MESSAGES = examples.messages
export const MOCK_LOGS = examples.logs

export const MOCK_AGENT_TASKS = {
  1: {
    completed: 156,
    inProgress: 3,
    avgResponseTime: '0.8s',
    tasks: [
      { id: 't1', title: '客户咨询接待', status: 'completed', time: '5分钟前' },
      { id: 't2', title: '多轮问答处理', status: 'completed', time: '1小时前' },
      { id: 't3', title: '上下文对话管理', status: 'in_progress', time: '进行中' }
    ]
  },
  2: {
    completed: 243,
    inProgress: 5,
    avgResponseTime: '2.3s',
    tasks: [
      { id: 't4', title: '市场调研报告', status: 'completed', time: '2小时前' },
      { id: 't5', title: '竞品分析', status: 'completed', time: '昨天' },
      { id: 't6', title: '行业数据收集', status: 'in_progress', time: '进行中' }
    ]
  },
  3: {
    completed: 189,
    inProgress: 2,
    avgResponseTime: '1.5s',
    tasks: [
      { id: 't7', title: '产品文案撰写', status: 'completed', time: '3小时前' },
      { id: 't8', title: '营销邮件生成', status: 'completed', time: '昨天' },
      { id: 't9', title: '博客文章创作', status: 'in_progress', time: '进行中' }
    ]
  },
  4: {
    completed: 312,
    inProgress: 4,
    avgResponseTime: '3.2s',
    tasks: [
      { id: 't10', title: 'Bug 修复', status: 'completed', time: '1小时前' },
      { id: 't11', title: 'React Hook 实现', status: 'completed', time: '4小时前' },
      { id: 't12', title: '代码审查', status: 'in_progress', time: '进行中' }
    ]
  },
  5: {
    completed: 178,
    inProgress: 3,
    avgResponseTime: '2.8s',
    tasks: [
      { id: 't13', title: '销售数据分析', status: 'completed', time: '2小时前' },
      { id: 't14', title: '算法数学推导', status: 'completed', time: '5小时前' },
      { id: 't15', title: '用户行为分析', status: 'in_progress', time: '进行中' }
    ]
  },
  6: {
    completed: 145,
    inProgress: 2,
    avgResponseTime: '1.9s',
    tasks: [
      { id: 't16', title: '产品原型设计', status: 'completed', time: '5小时前' },
      { id: 't17', title: '营销图片生成', status: 'completed', time: '2小时前' },
      { id: 't18', title: 'UI 界面优化', status: 'in_progress', time: '进行中' }
    ]
  },
  7: {
    completed: 98,
    inProgress: 2,
    avgResponseTime: '4.5s',
    tasks: [
      { id: 't19', title: '产品战略制定', status: 'completed', time: '昨天' },
      { id: 't20', title: '市场机会分析', status: 'completed', time: '3天前' },
      { id: 't21', title: '增长策略规划', status: 'in_progress', time: '进行中' }
    ]
  },
  8: {
    completed: 167,
    inProgress: 4,
    avgResponseTime: '2.1s',
    tasks: [
      { id: 't22', title: 'PRD 文档编写', status: 'completed', time: '3小时前' },
      { id: 't23', title: '产品路线图规划', status: 'completed', time: '昨天' },
      { id: 't24', title: '需求优先级排序', status: 'in_progress', time: '进行中' }
    ]
  }
}

// ============================================
// 用户 Mock 数据
// ============================================
export const MOCK_USER = {
  id: 'user-001',
  name: 'Kenny',
  email: 'kenny@example.com',
  role: 'Pro 会员',
  avatar: null,
  stats: {
    teamsCreated: 5,
    totalMessages: 1247,
    agentsUsed: 8,
    activeHours: 156
  },
  subscription: {
    plan: 'Pro',
    startDate: '2024-01-15',
    renewalDate: '2025-01-15',
    features: ['无限团队', '无限消息', '优先支持', '高级智能体']
  }
}

// ============================================
// 活动统计 Mock 数据
// ============================================
export const MOCK_ACTIVITY_STATS = {
  daily: [
    { date: '6/16', messages: 45, tasks: 12 },
    { date: '6/17', messages: 62, tasks: 18 },
    { date: '6/18', messages: 38, tasks: 9 },
    { date: '6/19', messages: 75, tasks: 22 },
    { date: '6/20', messages: 55, tasks: 15 },
    { date: '6/21', messages: 89, tasks: 25 },
    { date: '6/22', messages: 47, tasks: 14 }
  ],
  agentUsage: [
    { agent: '代码智能体', hours: 45.2, percentage: 28 },
    { agent: '调研智能体', hours: 32.8, percentage: 20 },
    { agent: '写作智能体', hours: 28.5, percentage: 18 },
    { agent: '数据分析智能体', hours: 24.3, percentage: 15 },
    { agent: '产品智能体', hours: 18.7, percentage: 12 },
    { agent: '设计智能体', hours: 12.4, percentage: 7 }
  ]
}

// ============================================
// 辅助函数
// ============================================

// 获取指定团队的 mock 消息
export const getMockMessages = (teamId) => {
  return MOCK_MESSAGES[teamId] || []
}

// 获取指定团队的 mock 日志
export const getMockLogs = (teamId) => {
  return MOCK_LOGS[teamId] || []
}

// 获取指定 Agent 的任务历史
export const getMockAgentTasks = (agentId) => {
  return MOCK_AGENT_TASKS[agentId] || { completed: 0, inProgress: 0, avgResponseTime: 'N/A', tasks: [] }
}

// 生成随机消息
export const generateMockMessage = (agent, content) => {
  const now = new Date()
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'agent',
    agentId: agent.id,
    agentName: agent.name,
    agentColor: agent.color,
    agentIcon: agent.icon,
    content,
    timestamp: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
}

// 生成随机日志
export const generateMockLog = (agentName, action) => {
  const now = new Date()
  return {
    time: now.toLocaleTimeString('zh-CN'),
    content: `${agentName}: ${action}`
  }
}
