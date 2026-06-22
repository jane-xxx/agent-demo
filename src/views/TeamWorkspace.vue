<template>
  <div class="team-workspace">
    <LeftSidebar />
    <CenterChat />
    <RightSidebar />

    <CreateTeamModal
      :is-open="isCreateTeamModalOpen"
      @close="closeCreateTeamModal"
      @create="handleCreateTeam"
    />

    <AgentDetailModal
      :is-open="isAgentDetailModalOpen"
      :selected-agent="selectedAgent"
      @toggle-status="handleToggleStatus"
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
import { ref } from 'vue'
import { useModal } from '../composables/useModal'
import { useWorkspace } from '../composables/useWorkspace'
import LeftSidebar from '../components/workspace/LeftSidebar.vue'
import CenterChat from '../components/workspace/CenterChat.vue'
import RightSidebar from '../components/workspace/RightSidebar.vue'
import CreateTeamModal from '../components/workspace/CreateTeamModal.vue'
import AgentDetailModal from '../components/workspace/AgentDetailModal.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'

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

const { addTeam, updateAgentStatus } = useWorkspace()

const confirmMessage = ref('')

const handleCreateTeam = (teamData) => {
  const newTeam = {
    id: Date.now(),
    name: teamData.name,
    subtitle: '刚刚创建',
    memberCount: 0,
    color: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
    agents: []
  }
  addTeam(newTeam)
  closeCreateTeamModal()
}

const handleToggleStatus = (agentId) => {
  const status = selectedAgent.value?.status === 'online' ? 'offline' : 'online'
  updateAgentStatus(agentId, status)
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
  background: #0d111c;
  overflow: hidden;
}
</style>
