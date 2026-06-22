import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Agent data
const AGENTS = [
  {
    id: 1,
    name: 'Chat Agent',
    description: '擅长自然语言对话，理解上下文，提供流畅的交互体验',
    tags: ['对话', '问答', '通用'],
    category: '全部',
    icon: 'chat'
  },
  {
    id: 2,
    name: 'Research Agent',
    description: '专业的研究分析助手，快速搜索、整理和分析各类信息',
    tags: ['搜索', '分析', '研究'],
    category: '研究分析',
    icon: 'search'
  },
  {
    id: 3,
    name: 'Writing Agent',
    description: '专业的文案创作助手，支持多种文体和风格的写作',
    tags: ['写作', '文案', '创作'],
    category: '内容创作',
    icon: 'document'
  },
  {
    id: 4,
    name: 'Code Agent',
    description: '专业的代码助手，支持多种编程语言和开发任务',
    tags: ['代码', '开发', '调试'],
    category: '开发工具',
    icon: 'code'
  },
  {
    id: 5,
    name: 'Data Analyst Agent',
    description: '数据分析专家，处理复杂数据集并提供可视化洞察',
    tags: ['数据', '分析', '可视化'],
    category: '数据分析',
    icon: 'chart'
  },
  {
    id: 6,
    name: 'Design Agent',
    description: '创意设计助手，提供设计灵感和视觉创意支持',
    tags: ['设计', '创意', '视觉'],
    category: '设计创意',
    icon: 'palette'
  },
  {
    id: 7,
    name: 'Strategy Agent',
    description: '战略规划专家，帮助制定长期策略和决策分析',
    tags: ['战略', '规划', '决策'],
    category: '研究分析',
    icon: 'lightbulb'
  },
  {
    id: 8,
    name: 'Product Agent',
    description: '产品管理助手，从需求分析到产品规划全流程支持',
    tags: ['产品', '规划', '需求'],
    category: '效率提升',
    icon: 'rocket'
  }
]

// Categories with colors
const CATEGORIES = [
  { id: '全部', label: '全部', color: '#6c5ce7' },
  { id: '内容创作', label: '内容创作', color: '#a855f7' },
  { id: '数据分析', label: '数据分析', color: '#e17055' },
  { id: '开发工具', label: '开发工具', color: '#00b894' },
  { id: '设计创意', label: '设计创意', color: '#d63031' },
  { id: '研究分析', label: '研究分析', color: '#3498db' },
  { id: '效率提升', label: '效率提升', color: '#00cec9' }
]

// Category color mapping
const getCategoryColor = (categoryId) => {
  const category = CATEGORIES.find(c => c.id === categoryId)
  return category ? category.color : '#6c5ce7'
}

// Shared state (outside function to persist across calls)
const selectedAgents = ref(new Set([1, 2, 3])) // Pre-select first 3 agents
const activeCategory = ref('全部')
const searchQuery = ref('')
const teamName = ref('')
const currentTeam = ref(null) // Store current team data
const teams = ref([]) // Store all teams

export function useAgentSelection() {
  const router = useRouter()

  // Generate unique team ID
  const generateTeamId = () => {
    return 'team-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  }

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

  const createTeam = () => {
    const teamId = generateTeamId()
    const teamData = {
      teamId,
      name: teamName.value,
      agents: [...selectedAgentsArray.value],
      createdAt: new Date().toISOString()
    }
    currentTeam.value = teamData
    console.log('Creating team:', teamData)
    // Navigate to workspace page
    router.push({ name: 'workspace', params: { teamId } })
  }

  return {
    // State
    selectedAgents,
    activeCategory,
    searchQuery,
    teamName,
    currentTeam,
    teams,
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
    createTeam,
    addTeam: (team) => {
      teams.value.push(team)
    },
    getTeamById: (teamId) => {
      return teams.value.find(t => t.id === teamId)
    }
  }
}
