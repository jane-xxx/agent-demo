import { ref } from 'vue'

export function useModal() {
  // 模态框状态
  const isCreateTeamModalOpen = ref(false)
  const isAgentDetailModalOpen = ref(false)
  const isConfirmDialogOpen = ref(false)

  // Agent 详情相关
  const selectedAgent = ref(null)

  // 确认对话框回调
  const confirmCallback = ref(null)

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
