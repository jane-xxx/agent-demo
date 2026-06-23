<template>
  <div class="team-workspace">
    <LeftSidebar />
    <CenterChat />
    <RightSidebar v-if="hasTeamId" />

    <CreateTeamModal
      :is-open="isCreateTeamModalOpen"
      @close="closeCreateTeamModal"
      @create="handleCreateTeam"
    />

    <AgentDetailModal
      :is-open="isAgentDetailModalOpen"
      :selected-agent="selectedAgent"
      @close="closeAgentDetailModal"
    />

    <ConfirmDialog
      :is-open="isConfirmDialogOpen"
      title="确认操作"
      :message="confirmMessage"
      @confirm="handleConfirm"
      @cancel="closeConfirmDialog"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useModal } from '../composables/useModal'
import { useWorkspace } from '../composables/useWorkspace'
import { useAgentSelection } from '../composables/useAgentSelection'
import LeftSidebar from '../components/workspace/LeftSidebar.vue'
import CenterChat from '../components/workspace/CenterChat.vue'
import RightSidebar from '../components/workspace/RightSidebar.vue'
import CreateTeamModal from '../components/workspace/CreateTeamModal.vue'
import AgentDetailModal from '../components/workspace/AgentDetailModal.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'

const route = useRoute()

// 检查是否有 teamId
const hasTeamId = computed(() => {
  return !!route.params.teamId
})

const {
  isCreateTeamModalOpen,
  isAgentDetailModalOpen,
  isConfirmDialogOpen,
  selectedAgent,
  confirmCallback,
  openCreateTeamModal: openCreateModal,
  closeCreateTeamModal,
  closeAgentDetailModal,
  closeConfirmDialog,
  confirmAction
} = useModal()

const { addTeam, updateAgentStatus, switchTeam } = useWorkspace()
const { clearSelection } = useAgentSelection()

const confirmMessage = ref('')

const handleCreateTeam = (teamData) => {
  console.log('=== 开始创建团队 ===')
  console.log('接收到的团队数据:', teamData)

  // 生成团队ID（与mock数据格式一致）
  const teamId = `team-${Date.now().toString().slice(-6)}`

  const newTeam = {
    id: teamId,
    name: teamData.name,
    subtitle: '刚刚',
    memberCount: teamData.agents?.length || 0,
    color: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
    createdAt: new Date().toISOString(),
    lastActivity: '刚刚',
    description: `由 ${teamData.agents?.length || 0} 个 Agent 组成的团队`,
    // 确保 agents 有所有必要的字段
    agents: (teamData.agents || []).map(agent => ({
      ...agent,
      status: agent.status || 'online' // 默认在线
    }))
  }

  console.log('准备添加的团队对象:', newTeam)
  console.log('调用 addTeam 函数...')
  addTeam(newTeam)
  closeCreateTeamModal()

  // 清空选中状态
  clearSelection()

  // 切换到新创建的团队
  console.log('准备切换到新团队:', teamId)
  switchTeam(teamId)
  console.log('=== 团队创建完成 ===')
}

const handleConfirm = () => {
  if (confirmCallback.value) {
    confirmCallback.value()
  }
  confirmAction()
}
</script>

<style scoped>
.team-workspace {
  width: 100%;
  height: 100%;
  display: flex;
  background: #0a0e1a;
  overflow: hidden;
}
</style>
