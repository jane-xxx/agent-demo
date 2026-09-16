import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentSelection } from './useAgentSelection'
import { MOCK_TEAMS } from '../utils/mockData'
import { useChat } from './useChat'

// LocalStorage key
const TEAMS_STORAGE_KEY = 'multiagent_teams'
let teamSequence = 0

// 历史数据迁移：智能体名已中文化，把旧英文名映射为中文名（保留用户自建团队）
const AGENT_NAME_MIGRATION = {
  'Chat Agent': '对话智能体',
  'Research Agent': '调研智能体',
  'Writing Agent': '写作智能体',
  'Code Agent': '代码智能体',
  'Data Analyst Agent': '数据分析智能体',
  'Design Agent': '设计智能体',
  'Strategy Agent': '战略智能体',
  'Product Agent': '产品智能体'
}

const migrateTeams = (teams) => {
  teams.forEach(team => {
    (team.agents || []).forEach(agent => {
      if (AGENT_NAME_MIGRATION[agent.name]) {
        agent.name = AGENT_NAME_MIGRATION[agent.name]
      }
    })
    if (team.description) {
      team.description = team.description.replace(/个 Agent 组成/, '个智能体组成')
    }
  })
  return teams
}

// 从 localStorage 加载团队数据
const loadTeamsFromStorage = () => {
  try {
    const stored = localStorage.getItem(TEAMS_STORAGE_KEY)
    console.log('从 localStorage 加载团队数据:', stored ? '找到数据' : '无数据')
    if (stored) {
      const parsed = JSON.parse(stored)
      console.log('解析后的团队数量:', parsed?.length)
      // 如果有存储的数据，使用存储的数据
      if (Array.isArray(parsed)) {
        return migrateTeams(parsed)
      }
    }
  } catch (error) {
    console.error('加载团队数据失败:', error)
  }
  // 默认返回 mock 数据
  console.log('使用默认 mock 数据，数量:', MOCK_TEAMS.length)
  return [...MOCK_TEAMS]
}

// 保存团队数据到 localStorage
const saveTeamsToStorage = (teams) => {
  try {
    const data = JSON.stringify(teams)
    console.log('保存团队数据到 localStorage, 数量:', teams.length)
    localStorage.setItem(TEAMS_STORAGE_KEY, data)
    console.log('保存成功，存储的键:', TEAMS_STORAGE_KEY)
  } catch (error) {
    console.error('保存团队数据失败:', error)
  }
}

// 将 teams 定义在函数外部，确保所有组件共享同一个状态
const teams = ref(loadTeamsFromStorage())
const searchQuery = ref('')

export function useWorkspace() {
  const addTeamAgents = (teamId, members) => {
    const team = teams.value.find(t => String(t.id) === String(teamId))
    if (!team) return
    const seen = new Set((team.agents || []).map(a => a.id))
    team.agents = [...(team.agents || []), ...members.filter(a => {
      if (seen.has(a.id)) return false
      seen.add(a.id)
      return true
    })]
    team.memberCount = team.agents.length
    saveTeamsToStorage(teams.value)
  }
  const router = useRouter()
  const { currentTeam } = useAgentSelection()

  // 过滤后的团队列表
  const filteredTeams = computed(() => {
    if (!searchQuery.value.trim()) {
      // 如果有当前团队且不在列表中，添加到最前
      const result = [...teams.value]
      if (currentTeam.value && !result.find(t => t.id === currentTeam.value.teamId)) {
        result.unshift({
          id: currentTeam.value.teamId,
          name: currentTeam.value.name,
          subtitle: '刚刚创建',
          memberCount: currentTeam.value.agents?.length || 0,
          color: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
          agents: currentTeam.value.agents || []
        })
      }
      return result
    }

    // 搜索过滤
    const query = searchQuery.value.toLowerCase()
    let filtered = teams.value.filter(team =>
      team.name.toLowerCase().includes(query) ||
      team.subtitle.toLowerCase().includes(query)
    )

    // 如果当前团队匹配搜索，添加到列表
    if (currentTeam.value) {
      const currentMatch = currentTeam.value.name?.toLowerCase().includes(query)
      if (currentMatch && !filtered.find(t => t.id === currentTeam.value.teamId)) {
        filtered.unshift({
          id: currentTeam.value.teamId,
          name: currentTeam.value.name,
          subtitle: '刚刚创建',
          memberCount: currentTeam.value.agents?.length || 0,
          color: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
          agents: currentTeam.value.agents || []
        })
      }
    }

    return filtered
  })

  // 添加新团队到列表
  const addTeam = (team) => {
    console.log('添加新团队:', team.name, 'ID:', team.id)
    teams.value.unshift(team)
    console.log('添加后的团队数量:', teams.value.length)
    saveTeamsToStorage(teams.value)
  }

  // 创建团队（统一入口：团队字段构造只写这一份，首页/工作台共用）
  const createTeam = ({ name, agents }) => {
    const teamId = `team-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${++teamSequence}-${Math.random().toString(36).slice(2)}`}`
    const members = (agents || []).map(agent => ({
      ...agent,
      status: agent.status || 'online'
    }))
    const newTeam = {
      id: teamId,
      name,
      subtitle: '刚刚',
      memberCount: members.length,
      color: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
      createdAt: new Date().toISOString(),
      lastActivity: '刚刚',
      description: `由 ${members.length} 个智能体组成的团队`,
      agents: members
    }
    addTeam(newTeam)
    return newTeam
  }

  // 删除团队
  const deleteTeam = (teamId) => {
    if (useChat().isProcessing.value) return false
    console.log('删除团队:', teamId)
    const index = teams.value.findIndex(t => t.id === teamId)
    if (index !== -1) {
      teams.value.splice(index, 1)
      saveTeamsToStorage(teams.value)
      console.log('删除成功，剩余团队数量:', teams.value.length)
      return true
    }
    return false
  }

  // 重命名团队
  const renameTeam = (teamId, newName) => {
    console.log('重命名团队:', teamId, '新名称:', newName)
    const team = teams.value.find(t => t.id === teamId)
    if (team) {
      team.name = newName
      saveTeamsToStorage(teams.value)
      console.log('重命名成功')
      return true
    }
    return false
  }

  // 切换团队
  const switchTeam = (teamId) => {
    if (teamId === currentTeam.value?.teamId) {
      return // 已经是当前团队，不切换
    }
    router.push({ name: 'workspace', params: { teamId } })
  }

  // 更新 Agent 状态
  const updateAgentStatus = (agentId, status) => {
    if (currentTeam.value?.agents) {
      const agent = currentTeam.value.agents.find(a => a.id === agentId)
      if (agent) {
        agent.status = status // 'online' or 'offline'
      }
    }
  }

  // 从团队中移除 Agent
  const removeAgent = (agentId) => {
    if (currentTeam.value?.agents) {
      const index = currentTeam.value.agents.findIndex(a => a.id === agentId)
      if (index !== -1) {
        currentTeam.value.agents.splice(index, 1)
      }
    }
  }

  // 清除所有团队数据（包括 localStorage）
  const clearAllTeams = () => {
    teams.value = [...MOCK_TEAMS]
    localStorage.removeItem(TEAMS_STORAGE_KEY)
    console.log('已清除所有自定义团队，恢复为默认数据')
  }

  // 手动保存到 localStorage
  const forceSave = () => {
    saveTeamsToStorage(teams.value)
    console.log('手动保存完成')
  }

  // 获取存储信息
  const getStorageInfo = () => {
    try {
      const stored = localStorage.getItem(TEAMS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          hasData: true,
          count: parsed.length,
          keys: parsed.map(t => t.id)
        }
      }
      return { hasData: false }
    } catch (error) {
      return { hasData: false, error: error.message }
    }
  }

  return {
    teams,
    searchQuery,
    filteredTeams,
    addTeam,
    createTeam,
    deleteTeam,
    renameTeam,
    switchTeam,
    addTeamAgents,
    updateAgentStatus,
    removeAgent,
    clearAllTeams,
    forceSave,
    getStorageInfo
  }
}
