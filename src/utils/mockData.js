// Mock 数据文件 - MultiAgent 应用
// 支持结构化响应类型

import { RESPONSE_TYPES } from './responseTypes'

// Agent 数据定义
const AGENTS = [
  {
    id: 1,
    name: 'Chat Agent',
    description: '擅长自然语言对话，理解上下文，提供流畅的交互体验',
    tags: ['对话', '问答', '通用'],
    category: '全部',
    icon: 'chat',
    color: '#6c5ce7'
  },
  {
    id: 2,
    name: 'Research Agent',
    description: '专业的研究分析助手，快速搜索、整理和分析各类信息',
    tags: ['搜索', '分析', '研究'],
    category: '研究分析',
    icon: 'search',
    color: '#3498db'
  },
  {
    id: 3,
    name: 'Writing Agent',
    description: '专业的文案创作助手，支持多种文体和风格的写作',
    tags: ['写作', '文案', '创作'],
    category: '内容创作',
    icon: 'document',
    color: '#a855f7'
  },
  {
    id: 4,
    name: 'Code Agent',
    description: '专业的代码助手，支持多种编程语言和开发任务',
    tags: ['代码', '开发', '调试'],
    category: '开发工具',
    icon: 'code',
    color: '#00b894'
  },
  {
    id: 5,
    name: 'Data Analyst Agent',
    description: '数据分析专家，处理复杂数据集并提供可视化洞察',
    tags: ['数据', '分析', '可视化'],
    category: '数据分析',
    icon: 'chart',
    color: '#e17055'
  },
  {
    id: 6,
    name: 'Design Agent',
    description: '创意设计助手，提供设计灵感和视觉创意支持',
    tags: ['设计', '创意', '视觉'],
    category: '设计创意',
    icon: 'palette',
    color: '#d63031'
  },
  {
    id: 7,
    name: 'Strategy Agent',
    description: '战略规划专家，帮助制定长期策略和决策分析',
    tags: ['战略', '规划', '决策'],
    category: '研究分析',
    icon: 'lightbulb',
    color: '#f39c12'
  },
  {
    id: 8,
    name: 'Product Agent',
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
    memberCount: 4,
    color: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    createdAt: '2024-06-22T09:30:00.000Z',
    lastActivity: '2小时前',
    description: '负责新产品功能开发和技术实现',
    agents: [
      { ...AGENTS[3], status: 'online', color: '#00b894' },
      { ...AGENTS[1], status: 'online', color: '#3498db' },
      { ...AGENTS[7], status: 'online', color: '#00cec9' },
      { ...AGENTS[4], status: 'online', color: '#e17055' }
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
export const MOCK_MESSAGES = {
  'team-001': [
    {
      id: 'msg-001',
      type: 'user',
      content: '帮我实现一个 React Hook 来管理表单状态，包含验证功能',
      timestamp: '14:30'
    },
    {
      id: 'msg-002',
      type: 'agent',
      agentId: 4,
      agentName: 'Code Agent',
      agentColor: '#00b894',
      agentIcon: 'code',
      responseType: RESPONSE_TYPES.CODE,
      data: {
        language: 'typescript',
        code: `import { useState, useCallback, FormEvent } from 'react'

interface ValidationRule<T> {
  rule: (value: T) => boolean
  message: string
}

interface FieldConfig<T> {
  initialValue: T
  validations?: ValidationRule<T>[]
}

interface UseFormReturn<T> {
  values: T
  errors: Record<keyof T, string | null>
  touched: Record<keyof T, boolean>
  handleChange: (field: keyof T) => (value: T[keyof T]) => void
  handleBlur: (field: keyof T) => () => void
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) =>
    (e: FormEvent) => Promise<void>
  resetForm: () => void
  isValid: boolean
}

export function useForm<T extends Record<string, any>>(
  fields: { [K in keyof T]: FieldConfig<T[K]> }
): UseFormReturn<T> {
  const initialValues = Object.keys(fields).reduce((acc, key) => {
    acc[key] = fields[key].initialValue
    return acc
  }, {} as T)

  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<keyof T, string | null>>({} as Record<keyof T, string | null>)
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)

  const validateField = useCallback(
    (field: keyof T, value: any): string | null => {
      const fieldConfig = fields[field]
      if (!fieldConfig?.validations) return null

      for (const validation of fieldConfig.validations) {
        if (!validation.rule(value)) {
          return validation.message
        }
      }
      return null
    },
    [fields]
  )

  const handleChange = useCallback(
    (field: keyof T) => (value: T[keyof T]) => {
      setValues(prev => ({ ...prev, [field]: value }))
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error }))
    },
    [validateField]
  )

  const isValid = Object.values(errors).every(e => e === null)

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit: async (onSubmit) => (e) => {
      e.preventDefault()
      if (isValid) await onSubmit(values)
    },
    resetForm: () => {
      setValues(initialValues)
      setErrors({} as Record<keyof T, string | null>)
      setTouched({} as Record<keyof T, boolean>)
    },
    isValid
  }
}`,
        explanation: '这是一个完整的表单管理 Hook，支持字段验证、错误处理和触摸状态追踪。你可以这样使用：'
      },
      timestamp: '14:32'
    },
    {
      id: 'msg-003',
      type: 'agent',
      agentId: 4,
      agentName: 'Code Agent',
      agentColor: '#00b894',
      agentIcon: 'code',
      responseType: RESPONSE_TYPES.CODE,
      data: {
        language: 'typescript',
        code: `// 使用示例
const loginForm = useForm<LoginForm>({
  email: {
    initialValue: '',
    validations: [
      {
        rule: (v) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v),
        message: '请输入有效的邮箱地址'
      }
    ]
  },
  password: {
    initialValue: '',
    validations: [
      {
        rule: (v) => v.length >= 8,
        message: '密码至少需要8个字符'
      }
    ]
  }
})`,
        explanation: '登录表单配置示例，包含邮箱格式验证和密码长度验证。'
      },
      timestamp: '14:34'
    },
    {
      id: 'msg-004',
      type: 'user',
      content: '我的组件有个内存泄漏，每次卸载时控制台都报警告',
      timestamp: '15:10'
    },
    {
      id: 'msg-005',
      type: 'agent',
      agentId: 4,
      agentName: 'Code Agent',
      agentColor: '#00b894',
      agentIcon: 'code',
      responseType: RESPONSE_TYPES.TEXT,
      data: {
        content: `**内存泄漏排查思路**

组件卸载时的警告通常是因为：

1. **未清理的副作用**：useEffect 没有返回清理函数
2. **定时器未清除**：setInterval/setTimeout 未 clearTimeout
3. **事件监听器未移除**：addEventListener 后未 removeEventListener

请分享一下你的 useEffect 代码，我帮你定位问题。`
      },
      timestamp: '15:12'
    },
    {
      id: 'msg-006',
      type: 'user',
      content: '按你说的加了依赖数组，但清理函数还是没执行',
      timestamp: '15:15'
    },
    {
      id: 'msg-007',
      type: 'agent',
      agentId: 4,
      agentName: 'Code Agent',
      agentColor: '#00b894',
      agentIcon: 'code',
      responseType: RESPONSE_TYPES.CODE,
      data: {
        language: 'typescript',
        code: `useEffect(() => {
  const timer = setInterval(() => {
    console.log('Polling...')
  }, 1000)

  // ⚠️ 必须返回清理函数
  return () => {
    clearInterval(timer)
    console.log('Cleanup executed')
  }
}, []) // 空依赖数组表示只在挂载时执行`,
        explanation: '关键是返回一个清理函数，组件卸载时会自动执行。如果你加了依赖数组但没用上，用空数组 `[]` 即可。'
      },
      timestamp: '15:18'
    }
  ],
  'team-002': [
    {
      id: 'msg-101',
      type: 'user',
      content: '调研一下 AI 写作工具的市场现状',
      timestamp: '10:15'
    },
    {
      id: 'msg-102',
      type: 'agent',
      agentId: 2,
      agentName: 'Research Agent',
      agentColor: '#3498db',
      agentIcon: 'search',
      responseType: RESPONSE_TYPES.TABLE,
      data: {
        headers: ['产品名称', '公司', '用户数', '核心功能', '定价'],
        rows: [
          ['Jasper', 'Jasper AI', '500万+', '营销文案', '$49/月起'],
          ['Copy.ai', 'Copy.ai', '300万+', '多场景文案', '$36/月起'],
          ['Writesonic', 'Writesonic', '200万+', '文章生成', '$16/月起'],
          ['Notion AI', 'Notion', '1000万+', '文档协作', '$10/月起'],
          ['Claude', 'Anthropic', '400万+', '通用AI', '$20/月起']
        ],
        caption: 'AI 写作工具市场调研数据（2024）'
      },
      timestamp: '10:20'
    },
    {
      id: 'msg-103',
      type: 'agent',
      agentId: 2,
      agentName: 'Research Agent',
      agentColor: '#3498db',
      agentIcon: 'search',
      responseType: RESPONSE_TYPES.DOCUMENT,
      data: {
        sections: [
          {
            title: '市场规模分析',
            content: '全球 AI 写作市场规模预计 2024 年达到 28 亿美元，年增长率 32%。主要增长动力来自企业数字化转型和内容创作需求激增。'
          },
          {
            title: '竞争格局',
            content: '市场呈现寡头竞争格局，头部厂商占据 60% 份额。垂直领域工具仍有机会，特别是针对中文市场和特定行业场景的定制化解决方案。'
          },
          {
            title: '差异化建议',
            content: '建议从三个方向切入：1）专注中文垂直场景 2）深度整合工作流 3）提供企业级定制服务。'
          }
        ]
      },
      timestamp: '10:23'
    },
    {
      id: 'msg-104',
      type: 'user',
      content: '哪些工具对中文支持比较好？',
      timestamp: '10:25'
    },
    {
      id: 'msg-105',
      type: 'agent',
      agentId: 2,
      agentName: 'Research Agent',
      agentColor: '#3498db',
      agentIcon: 'search',
      responseType: RESPONSE_TYPES.TABLE,
      data: {
        headers: ['产品', '中文支持', '评分', '特点'],
        rows: [
          ['产品A', '★★★★★', '9.2/10', '原生中文模型'],
          ['产品B', '★★★★☆', '8.5/10', '经过中文微调'],
          ['产品C', '★★★☆☆', '7.0/10', '通用模型'],
          ['我们的产品', '★★★★★', '待验证', '专注中文场景']
        ],
        caption: '中文市场 AI 工具对比'
      },
      timestamp: '10:28'
    },
    {
      id: 'msg-106',
      type: 'user',
      content: '我们的差异化机会在哪里？',
      timestamp: '10:32'
    },
    {
      id: 'msg-107',
      type: 'agent',
      agentId: 2,
      agentName: 'Research Agent',
      agentColor: '#3498db',
      agentIcon: 'search',
      responseType: RESPONSE_TYPES.DOCUMENT,
      data: {
        sections: [
          {
            title: '差异化机会',
            content: '基于竞品分析，我认为有以下几个机会点：\n\n1. **垂直深耕**：专注特定行业（如法律、医疗、金融）的中文场景\n2. **工作流整合**：深度整合企业现有的 IM、文档、CRM 系统\n3. **私有化部署**：满足企业数据安全需求'
          },
          {
            title: '建议行动',
            content: '建议先选择 1-2 个垂直场景进行深度调研，验证真实需求后再扩展。'
          }
        ]
      },
      timestamp: '10:36'
    }
  ],
  'team-003': [
    {
      id: 'msg-201',
      type: 'user',
      content: '帮我写一封产品发布的营销邮件',
      timestamp: '09:00'
    },
    {
      id: 'msg-202',
      type: 'agent',
      agentId: 3,
      agentName: 'Writing Agent',
      agentColor: '#a855f7',
      agentIcon: 'document',
      responseType: RESPONSE_TYPES.DOCUMENT,
      data: {
        sections: [
          {
            title: '邮件主题',
            content: '🚀 重磅发布：全新产品，重新定义您的工作方式'
          },
          {
            title: '开篇',
            content: '尊敬的用户，经过团队 6 个月的精心打磨，我们非常激动地向您介绍我们最新发布的产品版本。'
          },
          {
            title: '核心亮点',
            content: '• 全新的界面设计，提升 40% 操作效率\n• 智能推荐系统，节省您 50% 的决策时间\n• 企业级安全保障，数据加密传输存储'
          },
          {
            title: '行动召唤',
            content: '点击下方按钮，立即体验全新版本。限时优惠：首月免费试用！'
          }
        ]
      },
      timestamp: '09:08'
    },
    {
      id: 'msg-203',
      type: 'user',
      content: '能不能帮我改得更有吸引力一点？',
      timestamp: '09:12'
    },
    {
      id: 'msg-204',
      type: 'agent',
      agentId: 3,
      agentName: 'Writing Agent',
      agentColor: '#a855f7',
      agentIcon: 'document',
      responseType: RESPONSE_TYPES.DOCUMENT,
      data: {
        sections: [
          {
            title: '优化版本',
            content: '邮件主题：🚀 重磅发布：全新产品，重新定义您的工作方式\n\n尊敬的用户，\n\n经过 6 个月的精心打磨，我们激动地向您介绍全新版本的产品。\n\n**核心亮点**\n✓ 效率提升 40%，让您更快完成工作\n✓ 智能推荐系统，节省 50% 决策时间\n✓ 企业级安全，数据加密传输存储\n\n**限时优惠**\n首月免费试用，立即体验！\n\n点击下方按钮开启高效工作之旅。'
          },
          {
            title: '优化说明',
            content: '主要改进：\n• 增加具体数字（40%、50%）增强说服力\n• 使用列表格式提高可读性\n• 增加"限时优惠"元素提升紧迫感'
          }
        ]
      },
      timestamp: '09:16'
    },
    {
      id: 'msg-205',
      type: 'user',
      content: '再加个用户引用会更好',
      timestamp: '09:20'
    },
    {
      id: 'msg-206',
      type: 'agent',
      agentId: 3,
      agentName: 'Writing Agent',
      agentColor: '#a855f7',
      agentIcon: 'document',
      responseType: RESPONSE_TYPES.DOCUMENT,
      data: {
        sections: [
          {
            title: '最终版本（含用户引用）',
            content: '邮件主题：🚀 重磅发布：全新产品，重新定义您的工作方式\n\n尊敬的用户，\n\n经过 6 个月的精心打磨，我们激动地向您介绍全新版本的产品。\n\n**用户真实反馈**\n\n"使用这款产品后，我的工作效率提升了至少 40%。"\n— 张经理，某互联网公司\n\n"终于有一个工具真正懂我的需求，简单而强大。"\n— 李总监，传统企业\n\n**核心亮点**\n✓ 效率提升 40%，让您更快完成工作\n✓ 智能推荐系统，节省 50% 决策时间\n✓ 企业级安全，数据加密传输存储\n\n**限时优惠**\n首月免费试用，立即体验！\n\n点击下方按钮开启高效工作之旅。'
          }
        ]
      },
      timestamp: '09:25'
    },
    {
      id: 'msg-207',
      type: 'user',
      content: '这个版本不错！能再调整一下，把限时优惠改成更有紧迫感的说法？',
      timestamp: '09:28'
    },
    {
      id: 'msg-208',
      type: 'agent',
      agentId: 3,
      agentName: 'Writing Agent',
      agentColor: '#a855f7',
      agentIcon: 'document',
      responseType: RESPONSE_TYPES.TEXT,
      data: {
        content: `**增加紧迫感的几种方式**

1. **倒计时**："仅剩 48 小时！"
2. **限量**："限前 100 名用户"
3. **涨价预警**："价格即将上调"

我建议结合使用倒计时 + 涨价预警：

> "限时特惠：本周五午夜后恢复原价
> 立即注册立省 30%"

这样既制造了紧迫感，又不会让用户觉得是虚假营销。是否按这个方向修改？`
      },
      timestamp: '09:31'
    }
  ],
  'team-004': [
    {
      id: 'msg-301',
      type: 'user',
      content: '为新功能设计一套 UI 界面，要简洁现代的风格',
      timestamp: '16:20'
    },
    {
      id: 'msg-302',
      type: 'agent',
      agentId: 6,
      agentName: 'Design Agent',
      agentColor: '#d63031',
      agentIcon: 'palette',
      responseType: RESPONSE_TYPES.IMAGE,
      data: {
        url: 'https://picsum.photos/seed/design100/800/600',
        alt: 'UI 设计稿展示'
      },
      timestamp: '16:25'
    },
    {
      id: 'msg-303',
      type: 'agent',
      agentId: 6,
      agentName: 'Design Agent',
      agentColor: '#d63031',
      agentIcon: 'palette',
      responseType: RESPONSE_TYPES.CHART,
      data: {
        diagram: `flowchart TD
    A[首页] --> B[功能列表]
    B --> C[详情页]
    C --> D[操作面板]
    D --> E[确认弹窗]
    E -->|确认| F[完成]
    E -->|取消| C

    style A fill:#6366f1
    style F fill:#10b981`,
        caption: '用户界面交互流程图'
      },
      timestamp: '16:32'
    },
    {
      id: 'msg-304',
      type: 'user',
      content: '这个配色能调整得更现代一点吗？',
      timestamp: '16:40'
    },
    {
      id: 'msg-305',
      type: 'agent',
      agentId: 6,
      agentName: 'Design Agent',
      agentColor: '#d63031',
      agentIcon: 'palette',
      responseType: RESPONSE_TYPES.COMPOSITE,
      data: {
        items: [
          {
            type: RESPONSE_TYPES.TEXT,
            data: {
              content: '**现代配色建议**\n\n当前配色偏传统，我建议采用更现代的渐变配色方案：'
            }
          },
          {
            type: RESPONSE_TYPES.TABLE,
            data: {
              headers: ['用途', '当前配色', '建议配色', '效果'],
              rows: [
                ['主色', '#d63031', 'linear-gradient(135deg, #667eea, #764ba2)', '渐变紫'],
                ['强调', '#fd79a8', 'linear-gradient(135deg, #f093fb, #f5576c)', '粉紫渐变'],
                ['背景', '#ffffff', '#f8fafc with glassmorphism', '毛玻璃效果']
              ],
              caption: '配色方案对比'
            }
          }
        ]
      },
      timestamp: '16:43'
    },
    {
      id: 'msg-306',
      type: 'user',
      content: '能展示一下效果吗？',
      timestamp: '16:46'
    },
    {
      id: 'msg-307',
      type: 'agent',
      agentId: 6,
      agentName: 'Design Agent',
      agentColor: '#d63031',
      agentIcon: 'palette',
      responseType: RESPONSE_TYPES.IMAGE,
      data: {
        url: 'https://picsum.photos/seed/modern-ui/800/600',
        alt: '现代风格 UI 设计稿'
      },
      timestamp: '16:50'
    }
  ],
  'team-005': [
    {
      id: 'msg-401',
      type: 'user',
      content: '分析一下销售数据，找出最畅销的产品',
      timestamp: '11:00'
    },
    {
      id: 'msg-402',
      type: 'agent',
      agentId: 5,
      agentName: 'Data Analyst Agent',
      agentColor: '#e17055',
      agentIcon: 'chart',
      responseType: RESPONSE_TYPES.TABLE,
      data: {
        headers: ['排名', '产品名称', '销售额', '销量', '占比'],
        rows: [
          ['🥇 1', '智能手表 Pro', '¥1,234,567', '3,456', '9.9%'],
          ['🥈 2', '无线降噪耳机', '¥987,654', '4,321', '7.9%'],
          ['🥉 3', '便携充电宝', '¥765,432', '5,678', '6.1%'],
          ['4', '蓝牙音箱', '¥654,321', '2,345', '5.3%'],
          ['5', '智能手环', '¥543,210', '6,789', '4.4%']
        ],
        caption: '最畅销产品 TOP 5 - 2024 Q2'
      },
      timestamp: '11:15'
    },
    {
      id: 'msg-403',
      type: 'agent',
      agentId: 5,
      agentName: 'Data Analyst Agent',
      agentColor: '#e17055',
      agentIcon: 'chart',
      responseType: RESPONSE_TYPES.FORMULA,
      data: {
        formulas: [
          '\\text{增长率} = \\frac{\\text{当前值} - \\text{基准值}}{\\text{基准值}} \\times 100\\%',
          '\\text{复合年增长率} = \\left(\\frac{V_{final}}{V_{initial}}\\right)^{\\frac{1}{n}} - 1'
        ],
        explanation: '根据计算，本季度销售额同比增长 23.5%，复合年增长率约 7.2%。'
      },
      timestamp: '11:25'
    },
    {
      id: 'msg-404',
      type: 'user',
      content: '能帮我预测一下下季度的趋势吗？',
      timestamp: '11:30'
    },
    {
      id: 'msg-405',
      type: 'agent',
      agentId: 5,
      agentName: 'Data Analyst Agent',
      agentColor: '#e17055',
      agentIcon: 'chart',
      responseType: RESPONSE_TYPES.COMPOSITE,
      data: {
        items: [
          {
            type: RESPONSE_TYPES.TEXT,
            data: {
              content: '**下季度趋势预测**\n\n基于历史数据和市场信号，我做出了以下预测：'
            }
          },
          {
            type: RESPONSE_TYPES.CHART,
            data: {
              diagram: `graph LR
    A[Q2数据] --> B[分析模型]
    B --> C{预测结果}
    C --> D[乐观: +25%]
    C --> E[中性: +15%]
    C --> F[保守: +8%]

    style D fill:#10b981
    style E fill:#f59e0b
    style F fill:#ef4444`,
              caption: 'Q3 预测模型'
            }
          },
          {
            type: RESPONSE_TYPES.TABLE,
            data: {
              headers: ['情景', '增长率', '关键假设', '建议'],
              rows: [
                ['乐观', '+25%', '市场热度持续+竞品放缓', '加大投入'],
                ['中性', '+15%', '维持现状', '稳步推进'],
                ['保守', '+8%', '经济放缓+竞争加剧', '控制成本']
              ],
              caption: '情景分析'
            }
          }
        ]
      },
      timestamp: '11:36'
    },
    {
      id: 'msg-406',
      type: 'user',
      content: '哪个情景最可能发生？',
      timestamp: '11:40'
    },
    {
      id: 'msg-407',
      type: 'agent',
      agentId: 5,
      agentName: 'Data Analyst Agent',
      agentColor: '#e17055',
      agentIcon: 'chart',
      responseType: RESPONSE_TYPES.TEXT,
      data: {
        content: `**概率判断**

基于当前信号，我认为：

• **中性情景 (60%)**：最可能，建议按此计划预算
• **乐观情景 (25%)**：有一定可能，准备好扩张预案
• **保守情景 (15%)**：小概率，做好风险对冲

**建议策略**：
按中性情景规划，同时保持灵活性——每月重新评估，根据早期信号调整方向。`
      },
      timestamp: '11:45'
    }
  ]
}

// ============================================
// 执行日志 Mock 数据
// ============================================
export const MOCK_LOGS = {
  'team-001': [
    { time: '15:18:45', content: 'Code Agent: 提供内存泄漏修复方案' },
    { time: '15:15:30', content: '用户: 反馈清理函数未执行' },
    { time: '15:12:15', content: 'Code Agent: 分析内存泄漏原因' },
    { time: '15:10:00', content: '用户: 提出内存泄漏问题' },
    { time: '14:36:15', content: 'Code Agent: 代码生成完成' },
    { time: '14:35:00', content: '用户: 请求实现 React Hook' },
    { time: '14:32:00', content: 'Code Agent: 生成表单管理 Hook' },
    { time: '14:30:30', content: '系统: 任务分配给 Code Agent' },
    { time: '14:30:00', content: '用户: 创建代码实现任务' }
  ],
  'team-002': [
    { time: '10:36:30', content: 'Research Agent: 分析差异化机会' },
    { time: '10:32:15', content: '用户: 询问差异化定位' },
    { time: '10:28:20', content: 'Research Agent: 提供中文市场对比' },
    { time: '10:25:00', content: '用户: 询问中文支持情况' },
    { time: '10:23:45', content: 'Research Agent: 完成市场调研分析' },
    { time: '10:20:00', content: 'Research Agent: 收集竞品信息' },
    { time: '10:15:30', content: '系统: 任务分配给研究团队' },
    { time: '10:15:00', content: '用户: 创建市场调研任务' }
  ],
  'team-003': [
    { time: '09:31:30', content: 'Writing Agent: 提供紧迫感文案建议' },
    { time: '09:28:15', content: '用户: 要求增加紧迫感表达' },
    { time: '09:25:30', content: 'Writing Agent: 添加用户引用' },
    { time: '09:20:15', content: '用户: 要求添加用户引用' },
    { time: '09:16:20', content: 'Writing Agent: 优化文案吸引力' },
    { time: '09:12:00', content: '用户: 要求修改文案' },
    { time: '09:08:45', content: 'Writing Agent: 完成营销邮件撰写' },
    { time: '09:05:15', content: 'Writing Agent: 生成文档结构' },
    { time: '09:02:15', content: 'Writing Agent: 开始撰写营销邮件' },
    { time: '09:00:30', content: '系统: 任务分配给写作团队' },
    { time: '09:00:00', content: '用户: 创建文案撰写任务' }
  ],
  'team-004': [
    { time: '16:50:30', content: 'Design Agent: 生成现代风格设计稿' },
    { time: '16:46:15', content: '用户: 请求查看效果' },
    { time: '16:43:20', content: 'Design Agent: 建议现代配色方案' },
    { time: '16:40:00', content: '用户: 要求调整配色' },
    { time: '16:32:30', content: 'Design Agent: 完成界面设计' },
    { time: '16:25:15', content: 'Design Agent: 生成设计稿' },
    { time: '16:22:00', content: 'Design Agent: 开始设计工作' },
    { time: '16:20:30', content: '系统: 任务分配给设计团队' },
    { time: '16:20:00', content: '用户: 创建 UI 设计任务' }
  ],
  'team-005': [
    { time: '11:45:30', content: 'Data Analyst: 给出情景概率判断' },
    { time: '11:40:15', content: '用户: 询问最可能情景' },
    { time: '11:36:20', content: 'Data Analyst: 完成趋势预测分析' },
    { time: '11:30:00', content: '用户: 请求下季度预测' },
    { time: '11:25:45', content: 'Data Analyst: 完成数据分析' },
    { time: '11:15:20', content: 'Data Analyst: 生成销售表格' },
    { time: '11:05:15', content: 'Data Analyst: 开始数据分析' },
    { time: '11:00:30', content: '系统: 任务分配给数据分析团队' },
    { time: '11:00:00', content: '用户: 创建数据分析任务' }
  ]
}

// ============================================
// Agent 任务历史 Mock 数据
// ============================================
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
    features: ['无限团队', '无限消息', '优先支持', '高级 Agent']
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
    { agent: 'Code Agent', hours: 45.2, percentage: 28 },
    { agent: 'Research Agent', hours: 32.8, percentage: 20 },
    { agent: 'Writing Agent', hours: 28.5, percentage: 18 },
    { agent: 'Data Analyst Agent', hours: 24.3, percentage: 15 },
    { agent: 'Product Agent', hours: 18.7, percentage: 12 },
    { agent: 'Design Agent', hours: 12.4, percentage: 7 }
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
