<template>
  <div class="left-sidebar">
    <div class="sidebar-header">
      <div class="logo">
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
      <div v-for="team in filteredTeams" :key="team.id" class="team-item" :class="{ active: team.id === currentTeamId }" @click="handleTeamClick(team.id)">
        <div class="team-icon" :style="{ background: team.color }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="team-info">
          <div class="team-name">{{ team.name }}</div>
          <div class="team-subtitle">{{ team.subtitle }}</div>
        </div>
        <div class="team-badge">{{ team.memberCount }}</div>
      </div>
      <div v-if="filteredTeams.length === 0" class="no-results">
        没有找到匹配的团队
      </div>
    </div>

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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAgentSelection } from '../../composables/useAgentSelection'
import { useWorkspace } from '../../composables/useWorkspace'
import { useModal } from '../../composables/useModal'

const route = useRoute()
const { currentTeam } = useAgentSelection()
const { filteredTeams, searchQuery, switchTeam } = useWorkspace()
const { openCreateTeamModal } = useModal()

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
</script>

<style scoped>
.left-sidebar {
  width: 260px;
  height: 100%;
  background: #0d111c;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.logo-icon {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #5b6cff, #7c3aed);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon svg {
  width: 16px;
  height: 16px;
  stroke: white;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.new-team-btn {
  width: 100%;
  padding: 8px 12px;
  background: #5b6cff;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.new-team-btn svg {
  width: 14px;
  height: 14px;
}

.new-team-btn:hover {
  background: #4a5bf0;
}

.search-bar {
  position: relative;
  padding: 12px 16px;
}

.search-icon {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: #6b7280;
  pointer-events: none;
}

.search-bar input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  background: #1e2532;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: white;
  font-size: 12px;
  outline: none;
  transition: border-color 0.2s;
}

.search-bar input:focus {
  border-color: #5b6cff;
}

.search-bar input::placeholder {
  color: #6b7280;
}

.team-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
}

.section-title {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin: 12px 0 8px;
}

.team-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.team-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.team-item.active {
  background: rgba(91, 108, 255, 0.15);
  border: 1px solid rgba(91, 108, 255, 0.3);
}

.team-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.team-icon svg {
  width: 16px;
  height: 16px;
  stroke: white;
}

.team-info {
  flex: 1;
  min-width: 0;
}

.team-name {
  font-size: 13px;
  font-weight: 500;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-subtitle {
  font-size: 11px;
  color: #8a8a8a;
}

.team-badge {
  width: 20px;
  height: 20px;
  background: rgba(91, 108, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #5b6cff;
  font-weight: 600;
  flex-shrink: 0;
}

.no-results {
  text-align: center;
  padding: 20px;
  color: #6b7280;
  font-size: 13px;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5b6cff, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar svg {
  width: 20px;
  height: 20px;
  stroke: white;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: #e0e0e0;
}

.user-role {
  font-size: 11px;
  color: #8a8a8a;
}
</style>
