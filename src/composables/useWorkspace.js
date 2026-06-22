import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentSelection } from './useAgentSelection'

export function useWorkspace() {
  const router = useRouter()
  const { currentTeam } = useAgentSelection()

  // 所有团队列表（包含当前团队和静态示例团队）
  const teams = ref([
    {
      id: 2,
      name: '数据分析团队',
      subtitle: '2小时前',
      memberCount: 4,
      color: 'linear-gradient(135deg, #00b894, #00cec9)',
      agents: []
    },
    {
      id: 3,
      name: '设计创意团队',
      subtitle: '昨天',
      memberCount: 5,
      color: 'linear-gradient(135deg, #d63031, #e17055)',
      agents: []
    }
  ])

  // 搜索关键词
  const searchQuery = ref('')

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
    teams.value.unshift(team)
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

  return {
    teams,
    searchQuery,
    filteredTeams,
    addTeam,
    switchTeam,
    updateAgentStatus,
    removeAgent
  }
}
