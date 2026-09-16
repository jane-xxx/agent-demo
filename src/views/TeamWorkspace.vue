<template>
  <div class="team-workspace">
    <div class="compact-toolbar">
      <button :aria-expanded="leftOpen" @click="leftOpen = !leftOpen; rightOpen = false">团队</button>
      <button v-if="hasTeamId" :aria-expanded="rightOpen" @click="rightOpen = !rightOpen; leftOpen = false">成员与进度</button>
    </div>
    <button v-if="leftOpen || rightOpen" class="sidebar-backdrop" aria-label="关闭侧栏" @click="leftOpen = false; rightOpen = false"></button>
    <LeftSidebar :class="{ 'compact-open': leftOpen }" />
    <CenterChat />
    <RightSidebar v-if="hasTeamId" :class="{ 'compact-open': rightOpen }" />

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
import { ref, computed, watch } from 'vue'
const leftOpen = ref(false)
const rightOpen = ref(false)
import { useRoute, useRouter } from 'vue-router'
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
const router = useRouter()

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

const { createTeam, updateAgentStatus, switchTeam, teams } = useWorkspace()
const { clearSelection } = useAgentSelection()

// 无 teamId 进入且已有团队时，直接落到第一个团队，
// 避免「左侧列表有团队、中间却显示还没有团队」的矛盾。
// 用 watch(immediate) 覆盖：首次进入、直接访问 URL、删除当前团队后的同组件跳转
watch(() => route.params.teamId, () => {
  leftOpen.value = false
  rightOpen.value = false
  if (!route.params.teamId && teams.value.length > 0) {
    router.replace({ name: 'workspace', params: { teamId: teams.value[0].id } })
  }
}, { immediate: true })

const confirmMessage = ref('')

const handleCreateTeam = (teamData) => {
  // 字段构造统一在 useWorkspace.createTeam
  const newTeam = createTeam(teamData)
  closeCreateTeamModal()

  // 清空选中状态
  clearSelection()

  // 切换到新创建的团队
  switchTeam(newTeam.id)
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
.compact-toolbar, .sidebar-backdrop { display: none; }
@media (max-width: 1100px) {
  .team-workspace { position: relative; padding-top: 42px; min-width: 0; }
  .compact-toolbar { display: flex; position: absolute; top: 0; left: 0; right: 0; height: 42px; justify-content: space-between; padding: 6px 12px; background: #0f141f; border-bottom: 1px solid #ffffff0b; }
  .compact-toolbar button { background: #202639; border: 1px solid #ffffff18; color: #ddd; border-radius: 6px; padding: 3px 12px; cursor: pointer; }
  .team-workspace :deep(.left-sidebar), .team-workspace :deep(.right-sidebar) { display: none; position: absolute; top: 42px; bottom: 0; height: auto; z-index: 21; max-width: 85vw; }
  .team-workspace :deep(.left-sidebar) { left: 0; }
  .team-workspace :deep(.right-sidebar) { right: 0; }
  .team-workspace :deep(.compact-open) { display: flex; }
  .sidebar-backdrop { display: block; position: absolute; inset: 42px 0 0; border: 0; background: #0008; z-index: 20; }
  .team-workspace :deep(.chat-header) { padding: 12px; }
  .team-workspace :deep(.message-agent) { max-width: 95%; }
}
</style>
