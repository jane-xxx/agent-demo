// src/utils/constants.js

// Agent 能力描述映射
export const AGENT_CAPABILITIES = {
  1: {
    capability: '擅长自然语言对话，理解上下文，提供流畅的交互体验',
    recentActivities: ['完成了客户咨询对话', '处理了多轮问答'],
    stats: { tasksCompleted: 8, onlineHours: 2.5 }
  },
  2: {
    capability: '专业的研究分析助手，快速搜索、整理和分析各类信息',
    recentActivities: ['完成了市场调研', '生成了竞品分析报告'],
    stats: { tasksCompleted: 12, onlineHours: 4.2 }
  },
  3: {
    capability: '专业的文案创作助手，支持多种文体和风格的写作',
    recentActivities: ['撰写了产品文案', '生成了营销邮件'],
    stats: { tasksCompleted: 6, onlineHours: 1.8 }
  },
  4: {
    capability: '专业的代码助手，支持多种编程语言和开发任务',
    recentActivities: ['修复了代码bug', '编写了API文档'],
    stats: { tasksCompleted: 15, onlineHours: 5.0 }
  },
  5: {
    capability: '数据分析专家，处理复杂数据集并提供可视化洞察',
    recentActivities: ['分析了销售数据', '生成了可视化报表'],
    stats: { tasksCompleted: 9, onlineHours: 3.1 }
  },
  6: {
    capability: '创意设计助手，提供设计灵感和视觉创意支持',
    recentActivities: ['设计了产品原型', '生成了视觉素材'],
    stats: { tasksCompleted: 7, onlineHours: 2.8 }
  },
  7: {
    capability: '战略规划专家，帮助制定长期策略和决策分析',
    recentActivities: ['制定了产品战略', '分析了市场机会'],
    stats: { tasksCompleted: 5, onlineHours: 2.0 }
  },
  8: {
    capability: '产品管理助手，从需求分析到产品规划全流程支持',
    recentActivities: ['编写了PRD文档', '规划了产品路线图'],
    stats: { tasksCompleted: 10, onlineHours: 3.5 }
  }
}

// 日志模板
export const LOG_TEMPLATES = [
  { agent: 'Research Agent', action: '开始执行任务' },
  { agent: 'Research Agent', action: '正在搜索相关数据...' },
  { agent: 'Research Agent', action: '已收集 15 份行业报告' },
  { agent: 'Writing Agent', action: '开始整理文档结构' },
  { agent: 'Writing Agent', action: '正在生成内容...' },
  { agent: 'Design Agent', action: '分析用户需求' },
  { agent: 'Design Agent', action: '创建设计方案' },
  { agent: 'Code Agent', action: '准备执行代码任务' },
  { agent: 'system', action: '任务分配完成，所有 Agent 已就绪' },
  { agent: 'system', action: '开始协同工作...' }
]

// 空状态配置
export const EMPTY_TEAM_STATE = {
  title: '还没有团队',
  description: '创建您的第一个 AI 团队开始协作',
  buttonText: '去创建团队'
}
