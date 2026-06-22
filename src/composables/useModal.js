import { ref } from 'vue'

// 共享状态（所有组件调用 useModal 都使用同一份状态）
const isCreateTeamModalOpen = ref(false)
const isAgentDetailModalOpen = ref(false)
const isConfirmDialogOpen = ref(false)
const selectedAgent = ref(null)
const confirmCallback = ref(null)

export function useModal() {

  // 创建团队模态框
  const openCreateTeamModal = () => {
    isCreateTeamModalOpen.value = true
  }

  const closeCreateTeamModal = () => {
    isCreateTeamModalOpen.value = false
  }

  // Agent 详情模态框
  const openAgentDetailModal = (agent) => {
    selectedAgent.value = agent
    isAgentDetailModalOpen.value = true
  }

  const closeAgentDetailModal = () => {
    isAgentDetailModalOpen.value = false
    selectedAgent.value = null
  }

  // 确认对话框
  const openConfirmDialog = (callback) => {
    confirmCallback.value = callback
    isConfirmDialogOpen.value = true
  }

  const closeConfirmDialog = () => {
    isConfirmDialogOpen.value = false
    confirmCallback.value = null
  }

  const confirmAction = () => {
    if (confirmCallback.value) {
      confirmCallback.value()
    }
    closeConfirmDialog()
  }

  return {
    isCreateTeamModalOpen,
    isAgentDetailModalOpen,
    isConfirmDialogOpen,
    selectedAgent,
    confirmCallback,
    openCreateTeamModal,
    closeCreateTeamModal,
    openAgentDetailModal,
    closeAgentDetailModal,
    openConfirmDialog,
    closeConfirmDialog,
    confirmAction
  }
}
