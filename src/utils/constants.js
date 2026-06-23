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

// 日志模板 - 扩展版
export const LOG_TEMPLATES = [
  // Research Agent
  { agent: 'Research Agent', action: '开始执行任务' },
  { agent: 'Research Agent', action: '正在搜索相关数据...' },
  { agent: 'Research Agent', action: '已收集 15 份行业报告' },
  { agent: 'Research Agent', action: '竞品分析完成，发现 3 个关键差异点' },
  { agent: 'Research Agent', action: '数据验证完成，准确率 98.5%' },
  // Writing Agent
  { agent: 'Writing Agent', action: '开始整理文档结构' },
  { agent: 'Writing Agent', action: '正在生成内容...' },
  { agent: 'Writing Agent', action: '文案初稿已完成，字数 1,245' },
  { agent: 'Writing Agent', action: '内容优化完成，阅读流畅度提升' },
  // Design Agent
  { agent: 'Design Agent', action: '分析用户需求' },
  { agent: 'Design Agent', action: '创建设计方案' },
  { agent: 'Design Agent', action: '视觉原型已生成，包含 3 个页面' },
  { agent: 'Design Agent', action: '设计规范文档已导出' },
  // Code Agent
  { agent: 'Code Agent', action: '准备执行代码任务' },
  { agent: 'Code Agent', action: '代码分析完成，发现 2 个优化点' },
  { agent: 'Code Agent', action: 'Bug 修复完成，通过所有测试' },
  { agent: 'Code Agent', action: 'API 文档已生成并更新' },
  // Data Analyst Agent
  { agent: 'Data Analyst Agent', action: '开始分析数据集' },
  { agent: 'Data Analyst Agent', action: '数据清洗完成，处理 50K+ 条记录' },
  { agent: 'Data Analyst Agent', action: '可视化图表已生成' },
  { agent: 'Data Analyst Agent', action: '分析报告已导出为 PDF' },
  // Strategy Agent
  { agent: 'Strategy Agent', action: '开始战略规划分析' },
  { agent: 'Strategy Agent', action: '市场机会评估完成' },
  { agent: 'Strategy Agent', action: '风险评估报告已生成' },
  { agent: 'Strategy Agent', action: '战略路线图已创建' },
  // Product Agent
  { agent: 'Product Agent', action: '开始需求分析' },
  { agent: 'Product Agent', action: 'PRD 文档框架已建立' },
  { agent: 'Product Agent', action: '产品路线图规划完成' },
  { agent: 'Product Agent', action: '功能优先级排序完成' },
  // System
  { agent: 'system', action: '任务分配完成，所有 Agent 已就绪' },
  { agent: 'system', action: '开始协同工作...' },
  { agent: 'system', action: 'Agent 通信已建立' },
  { agent: 'system', action: '任务进度同步中...' }
]

// Agent 响应模板 - 用于模拟不同场景的回复
export const AGENT_RESPONSE_TEMPLATES = {
  greeting: [
    '您好！我是 {name}，很高兴为您服务。',
    '嗨！我是 {name}，有什么可以帮您的吗？',
    '你好！{name} 在线，请告诉我您的需求。'
  ],
  taskReceived: [
    '收到您的任务，正在处理中...',
    '任务已确认，预计 {time} 内完成。',
    '了解！我会尽快处理这个任务。'
  ],
  taskComplete: [
    '任务已完成！结果如下：',
    '处理完毕，请查看结果。',
    '已完成！有什么需要调整的吗？'
  ],
  error: [
    '抱歉，处理过程中遇到了一些问题，请重试。',
    '无法完成该任务，可能需要更多信息。',
    '处理失败，建议检查输入是否正确。'
  ]
}

// 常用任务类型
export const TASK_TYPES = [
  { id: 'research', label: '市场调研', icon: 'search', color: '#3498db' },
  { id: 'writing', label: '内容创作', icon: 'document', color: '#a855f7' },
  { id: 'coding', label: '代码开发', icon: 'code', color: '#00b894' },
  { id: 'analysis', label: '数据分析', icon: 'chart', color: '#e17055' },
  { id: 'design', label: '设计创意', icon: 'palette', color: '#d63031' },
  { id: 'strategy', label: '战略规划', icon: 'lightbulb', color: '#f39c12' },
  { id: 'product', label: '产品管理', icon: 'rocket', color: '#00cec9' }
]

// 团队预设配置
export const TEAM_PRESETS = [
  {
    name: '全能型团队',
    description: '涵盖各个领域的全能团队',
    agents: [1, 2, 3, 4, 5, 6, 7, 8],
    color: 'linear-gradient(135deg, #6c5ce7, #a855f7)'
  },
  {
    name: '研发专攻',
    description: '专注于技术开发和产品实现',
    agents: [1, 4, 5, 8],
    color: 'linear-gradient(135deg, #00b894, #00cec9)'
  },
  {
    name: '营销创意',
    description: '专注于市场营销和内容创作',
    agents: [1, 2, 3, 6, 7],
    color: 'linear-gradient(135deg, #d63031, #e17055)'
  },
  {
    name: '数据决策',
    description: '专注于数据分析和战略规划',
    agents: [2, 5, 7],
    color: 'linear-gradient(135deg, #3498db, #6c5ce7)'
  }
]

// 时间格式化选项
export const TIME_FORMAT_OPTIONS = {
  dateOnly: { year: 'numeric', month: '2-digit', day: '2-digit' },
  timeOnly: { hour: '2-digit', minute: '2-digit' },
  full: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' },
  relative: true // 相对时间，如"2小时前"
}

// 空状态配置
export const EMPTY_TEAM_STATE = {
  title: '还没有团队',
  description: '创建您的第一个 AI 团队开始协作',
  buttonText: '去创建团队'
}
