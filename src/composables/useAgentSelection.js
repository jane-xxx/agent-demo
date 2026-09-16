import { ref, computed } from 'vue'

// Agent data
const AGENTS = [
  {
    id: 1,
    name: '对话智能体',
    description: '擅长自然语言对话，理解上下文，提供流畅的交互体验',
    tags: ['对话', '问答', '通用'],
    category: '内容创作',
    icon: 'chat'
  },
  {
    id: 2,
    name: '调研智能体',
    description: '专业的研究分析助手，快速搜索、整理和分析各类信息',
    tags: ['搜索', '分析', '研究'],
    category: '研究分析',
    icon: 'search'
  },
  {
    id: 3,
    name: '写作智能体',
    description: '专业的文案创作助手，支持多种文体和风格的写作',
    tags: ['写作', '文案', '创作'],
    category: '内容创作',
    icon: 'document'
  },
  {
    id: 4,
    name: '代码智能体',
    description: '专业的代码助手，支持多种编程语言和开发任务',
    tags: ['代码', '开发', '调试'],
    category: '开发效率',
    icon: 'code'
  },
  {
    id: 5,
    name: '数据分析智能体',
    description: '数据分析专家，处理复杂数据集并提供可视化洞察',
    tags: ['数据', '分析', '可视化'],
    category: '研究分析',
    icon: 'chart'
  },
  {
    id: 6,
    name: '设计智能体',
    description: '创意设计助手，提供设计灵感和视觉创意支持',
    tags: ['设计', '创意', '视觉'],
    category: '内容创作',
    icon: 'palette'
  },
  {
    id: 7,
    name: '战略智能体',
    description: '战略规划专家，帮助制定长期策略和决策分析',
    tags: ['战略', '规划', '决策'],
    category: '研究分析',
    icon: 'lightbulb'
  },
  {
    id: 8,
    name: '产品智能体',
    description: '产品管理助手，从需求分析到产品规划全流程支持',
    tags: ['产品', '规划', '需求'],
    category: '开发效率',
    icon: 'rocket'
  }
]

// Categories with colors（收敛为 3 个分类，保证每类至少 2 个智能体）
const CATEGORIES = [
  { id: '全部', label: '全部', color: '#6c5ce7' },
  { id: '内容创作', label: '内容创作', color: '#a855f7' },
  { id: '研究分析', label: '研究分析', color: '#3498db' },
  { id: '开发效率', label: '开发效率', color: '#00b894' }
]

// Category color mapping
const getCategoryColor = (categoryId) => {
  const category = CATEGORIES.find(c => c.id === categoryId)
  return category ? category.color : '#6c5ce7'
}

// Shared state (outside function to persist across calls)
const selectedAgents = ref(new Set()) // 默认不选中任何 Agent
const activeCategory = ref('全部')
const searchQuery = ref('')
const teamName = ref('')
const currentTeam = ref(null) // Store current team data

export function useAgentSelection() {
  // Computed
  const filteredAgents = computed(() => {
    let agents = AGENTS

    // Filter by category
    if (activeCategory.value !== '全部') {
      agents = agents.filter(agent => agent.category === activeCategory.value)
    }

    // Filter by search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      agents = agents.filter(agent =>
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Add color dynamically based on category
    return agents.map(agent => ({
      ...agent,
      color: getCategoryColor(agent.category)
    }))
  })

  const selectedAgentsArray = computed(() => {
    return AGENTS.filter(agent => selectedAgents.value.has(agent.id)).map(agent => ({
      ...agent,
      color: getCategoryColor(agent.category)
    }))
  })

  const selectedCount = computed(() => selectedAgents.value.size)

  // Methods
  const toggleAgent = (agentId) => {
    if (selectedAgents.value.has(agentId)) {
      selectedAgents.value.delete(agentId)
    } else {
      selectedAgents.value.add(agentId)
    }
    // Force reactivity
    selectedAgents.value = new Set(selectedAgents.value)
  }

  const isAgentSelected = (agentId) => selectedAgents.value.has(agentId)

  const removeAgent = (agentId) => {
    selectedAgents.value.delete(agentId)
    selectedAgents.value = new Set(selectedAgents.value)
  }

  const setCategory = (category) => {
    activeCategory.value = category
  }

  const setSearchQuery = (query) => {
    searchQuery.value = query
  }

  // 清空选中状态
  const clearSelection = () => {
    selectedAgents.value = new Set()
  }

  return {
    // State
    selectedAgents,
    activeCategory,
    searchQuery,
    teamName,
    currentTeam,
    // Computed
    filteredAgents,
    selectedAgentsArray,
    selectedCount,
    // Constants
    AGENTS,
    CATEGORIES,
    // Helpers
    getCategoryColor,
    // Methods
    toggleAgent,
    isAgentSelected,
    removeAgent,
    setCategory,
    setSearchQuery,
    clearSelection
  }
}
