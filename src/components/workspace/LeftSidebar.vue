<template>
  <div class="left-sidebar">
    <div class="sidebar-header">
      <div class="logo" @click="goToHome">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span class="logo-text">MultiAgent</span>
      </div>
      <button class="new-team-btn" @click="openCreateTeamModal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新建团队
      </button>
    </div>

    <div class="search-bar">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <input type="text" placeholder="搜索团队或对话" v-model="searchQuery" />
    </div>

    <div class="team-list">
      <div v-for="team in filteredTeams" :key="team.id" class="team-item" :class="{ active: team.id === currentTeamId, 'more-menu-open': openMenuTeamId === team.id }" @click="handleTeamClick(team.id)">
        <div class="team-icon" :style="{ background: team.color }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="team-info">
          <div v-if="editingTeamId !== team.id" class="team-name">{{ team.name }}</div>
          <input
            v-else
            :ref="el => { if (el) editInput = el }"
            v-model="editingName"
            class="team-name-input"
            @click.stop
            @blur="saveEdit(team)"
            @keydown.enter="saveEdit(team)"
            @keydown.esc="cancelEdit"
          />
          <div class="team-subtitle">{{ team.subtitle }}</div>
        </div>
        <button class="team-more-btn" @click.stop="toggleTeamMenu(team.id, $event)" @mouseenter="cancelClose" @mouseleave="scheduleClose">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="12" cy="5" r="1"/>
            <circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>
      <div v-if="filteredTeams.length === 0" class="no-results">
        没有找到匹配的团队
      </div>
    </div>

    <!-- 下拉菜单（移到team-list外面） -->
    <div v-if="openMenuTeamId" class="team-dropdown" :style="{ top: dropdownPosition.y + 'px', left: dropdownPosition.x + 'px' }" @mouseenter="cancelClose" @mouseleave="scheduleClose" @click.stop>
      <div class="dropdown-item" @click="handleRename(currentDropdownTeam)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        重命名
      </div>
      <div class="dropdown-item delete" @click="handleDelete(currentDropdownTeam)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
        删除
      </div>
    </div>

    <!-- 自定义确认删除弹窗 -->
    <ConfirmDialog
      :is-open="showDeleteConfirm"
      title="确认删除"
      :message="deleteConfirmMessage"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="user-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="user-info">
          <div class="user-name">Kenny</div>
          <div class="user-role">Pro 会员</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAgentSelection } from '../../composables/useAgentSelection'
import { useWorkspace } from '../../composables/useWorkspace'
import { useModal } from '../../composables/useModal'
import ConfirmDialog from '../common/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const { currentTeam } = useAgentSelection()
const { filteredTeams, searchQuery, switchTeam, deleteTeam, renameTeam } = useWorkspace()
const { openCreateTeamModal } = useModal()

// 打开的菜单团队 ID
const openMenuTeamId = ref(null)
// 下拉菜单位置
const dropdownPosition = ref({ x: 0, y: 0 })
// 编辑状态的团队 ID
const editingTeamId = ref(null)
// 编辑中的名称
const editingName = ref('')
// 编辑输入框引用
let editInput = null

// 删除确认弹窗状态
const showDeleteConfirm = ref(false)
const deleteConfirmMessage = ref('')
const pendingDeleteTeam = ref(null)

// 当前下拉菜单对应的团队
const currentDropdownTeam = computed(() => {
  if (!openMenuTeamId.value) return null
  return filteredTeams.value.find(t => t.id === openMenuTeamId.value)
})

// 当前激活团队 ID
const currentTeamId = computed(() => {
  return route.params.teamId || currentTeam.value?.teamId || null
})

// 处理团队点击
const handleTeamClick = (teamId) => {
  if (teamId === currentTeamId.value) {
    return // 已经是当前团队，不切换
  }
  switchTeam(teamId)
}

// 返回首页
const goToHome = () => {
  router.push({ name: 'home' })
}

// 切换团队菜单
const toggleTeamMenu = (teamId, event) => {
  if (openMenuTeamId.value === teamId) {
    openMenuTeamId.value = null
  } else {
    openMenuTeamId.value = teamId
    const btn = event.currentTarget
    if (btn) {
      const rect = btn.getBoundingClientRect()
      // 在按钮右侧显示，调整位置
      dropdownPosition.value = {
        x: rect.right - 18,
        y: rect.top + 23
      }
    }
  }
}

// 关闭菜单
const closeMenu = () => {
  openMenuTeamId.value = null
}

// 延迟关闭
let closeTimer = null
const scheduleClose = () => {
  closeTimer = setTimeout(() => {
    openMenuTeamId.value = null
  }, 200)
}

// 取消关闭
const cancelClose = () => {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

// 开始编辑
const startEdit = (team) => {
  editingTeamId.value = team.id
  editingName.value = team.name
  closeMenu()
  nextTick(() => {
    if (editInput) {
      editInput.focus()
      editInput.select()
    }
  })
}

// 保存编辑
const saveEdit = (team) => {
  if (!editingName.value.trim()) {
    cancelEdit()
    return
  }
  const newName = editingName.value.trim()
  if (newName !== team.name) {
    const success = renameTeam(team.id, newName)
    if (success) {
      console.log('重命名成功')
    }
  }
  cancelEdit()
}

// 取消编辑
const cancelEdit = () => {
  editingTeamId.value = null
  editingName.value = ''
}

// 处理重命名（从下拉菜单触发）
const handleRename = (team) => {
  if (!team) return
  closeMenu()
  startEdit(team)
}

// 处理删除
const handleDelete = (team) => {
  if (!team) return
  // 显示自定义确认弹窗
  pendingDeleteTeam.value = team
  deleteConfirmMessage.value = `确定要删除团队"${team.name}"吗？此操作不可恢复。`
  showDeleteConfirm.value = true
  closeMenu()
}

// 确认删除
const confirmDelete = () => {
  if (pendingDeleteTeam.value) {
    const isCurrentTeam = pendingDeleteTeam.value.id === currentTeamId.value
    const success = deleteTeam(pendingDeleteTeam.value.id)
    if (success) {
      console.log('删除成功')

      // 如果删除的是当前团队，导航到工作台空状态
      if (isCurrentTeam) {
        router.push({ name: 'workspace' })
      }
    }
  }
  // 重置状态
  pendingDeleteTeam.value = null
  showDeleteConfirm.value = false
}

// 取消删除
const cancelDelete = () => {
  pendingDeleteTeam.value = null
  showDeleteConfirm.value = false
}

// 点击其他地方关闭菜单
const handleClickOutside = (e) => {
  if (!e.target.closest('.team-dropdown') && !e.target.closest('.team-more-btn')) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.left-sidebar {
  width: 280px;
  height: 100%;
  background: #0f141f;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.logo:hover {
  opacity: 0.8;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.logo-icon svg {
  width: 18px;
  height: 18px;
  stroke: white;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff, #a5b4fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.new-team-btn {
  width: 100%;
  padding: 11px 16px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.new-team-btn svg {
  width: 16px;
  height: 16px;
}

.new-team-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
}

.search-bar {
  position: relative;
  padding: 16px;
}

.search-icon {
  position: absolute;
  left: 28px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #6b7280;
  pointer-events: none;
}

.search-bar input {
  width: 100%;
  padding: 11px 14px 11px 40px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
}

.search-bar input:focus {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-bar input::placeholder {
  color: #6b7280;
}

.team-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
}

.team-list::-webkit-scrollbar {
  width: 4px;
}

.team-list::-webkit-scrollbar-track {
  background: transparent;
}

.team-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.team-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  margin: 12px 8px 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.team-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-bottom: 4px;
  position: relative;
  border: 1px solid transparent;
}

.team-item:hover,
.team-item.more-menu-open {
  background: rgba(255, 255, 255, 0.04);
}

.team-item.active {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.25);
}

.team-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.team-icon svg {
  width: 20px;
  height: 20px;
  stroke: white;
}

.team-info {
  flex: 1;
  min-width: 0;
}

.team-name {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-name:hover {
  color: #fff;
}

.team-name-input {
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 4px;
  padding: 2px 6px;
  outline: none;
}

.team-name-input:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(99, 102, 241, 0.6);
}

.team-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.team-desc {
  font-size: 11px;
  color: #4b5563;
  margin-top: 2px;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-badge {
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  background: rgba(99, 102, 241, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #a5b4fc;
  font-weight: 600;
  flex-shrink: 0;
}

.team-more-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 0;
  opacity: 0;
  pointer-events: none;
}

.team-item:hover .team-more-btn,
.team-item.more-menu-open .team-more-btn {
  opacity: 1;
  pointer-events: auto;
}

.team-more-btn svg {
  width: 16px;
  height: 16px;
}

.team-more-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #9ca3af;
}

.team-dropdown {
  position: fixed;
  background: rgba(30, 41, 59, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  min-width: 100px;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  color: #e2e8f0;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.dropdown-item:hover {
  background: rgba(99, 102, 241, 0.1);
  color: #a5b4fc;
}

.dropdown-item.delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.no-results {
  text-align: center;
  padding: 32px 16px;
  color: #6b7280;
  font-size: 13px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.2);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.04);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.user-avatar svg {
  width: 22px;
  height: 22px;
  stroke: white;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
}

.user-role {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}
</style>
