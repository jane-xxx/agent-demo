<template>
  <div class="right-sidebar">
    <div class="sidebar-section">
      <h3 class="section-title">团队成员 ({{ teamAgents.length }})</h3>
      <div v-if="teamAgents.length > 0" class="member-list">
        <div
          v-for="agent in teamAgents"
          :key="agent.id"
          class="member-card"
          :style="{ '--agent-color': agent.color }"
          @click="handleAgentClick(agent)"
        >
          <div class="member-avatar" :style="{ background: agent.color }">
            <component :is="getAgentIcon(agent.icon)" />
          </div>
          <div class="member-info">
            <div class="member-name">{{ agent.name }}</div>
            <div class="member-role">{{ getAgentRole(agent.category) }}</div>
          </div>
          <div class="member-status" :class="agent.status || 'online'"></div>
          <button class="action-btn status-btn" @click.stop="handleToggleStatus(agent, $event)" :title="agent.status === 'online' ? '设为离线' : '设为在线'">
            <PowerIcon />
          </button>
          <button class="action-btn remove-btn" @click.stop="handleRemoveAgent(agent, $event)" title="移除成员">
            <XMarkIcon />
          </button>
        </div>
      </div>
      <div v-else class="empty-state">
        暂无成员，请先选择 Agent
      </div>
    </div>

    <div class="sidebar-section">
      <div class="section-header">
        <h3 class="section-title">执行日志</h3>
        <button class="clear-btn" @click="handleClearLogs">清空</button>
      </div>
      <div class="execution-log">
        <div v-for="(log, index) in logs" :key="index" class="log-entry">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-content">{{ log.content }}</span>
        </div>
      </div>
      <button class="view-more-btn">查看更多日志 →</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAgentSelection } from '../../composables/useAgentSelection'
import { useWorkspace } from '../../composables/useWorkspace'
import { useModal } from '../../composables/useModal'
import { LOG_TEMPLATES } from '../../utils/constants'
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ChartBarIcon,
  PaintBrushIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  PowerIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const { currentTeam } = useAgentSelection()
const { updateAgentStatus, removeAgent } = useWorkspace()
const { openAgentDetailModal, openConfirmDialog } = useModal()

// Get team agents from current team
const teamAgents = computed(() => {
  return currentTeam.value?.agents || []
})

// Get agent icon component
const getAgentIcon = (iconName) => {
  const iconMap = {
    chat: ChatBubbleLeftRightIcon,
    search: MagnifyingGlassIcon,
    document: DocumentTextIcon,
    code: CodeBracketIcon,
    chart: ChartBarIcon,
    palette: PaintBrushIcon,
    lightbulb: LightBulbIcon,
    rocket: RocketLaunchIcon
  }
  return iconMap[iconName] || ChatBubbleLeftRightIcon
}

// Get agent role/description based on category
const getAgentRole = (category) => {
  const roles = {
    '全部': '通用助手',
    '内容创作': '文案创作',
    '数据分析': '数据分析师',
    '开发工具': '代码助手',
    '设计创意': '创意设计',
    '研究分析': '研究分析',
    '效率提升': '效率专家'
  }
  return roles[category] || '团队成员'
}

// Use LOG_TEMPLATES for logs
const logs = ref(LOG_TEMPLATES.map(log => ({
  time: new Date().toLocaleTimeString('zh-CN'),
  content: `${log.agent}: ${log.action}`
})))

const handleAgentClick = (agent) => {
  openAgentDetailModal(agent)
}

const handleToggleStatus = (agent, event) => {
  event.stopPropagation()
  const newStatus = agent.status === 'online' ? 'offline' : 'online'
  updateAgentStatus(agent.id, newStatus)
}

const handleRemoveAgent = (agent, event) => {
  event.stopPropagation()
  openConfirmDialog(() => {
    removeAgent(agent.id)
  })
}

const handleClearLogs = () => {
  logs.value = []
}
</script>

<style scoped>
.right-sidebar {
  width: 300px;
  height: 100%;
  background: #0d111c;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-section {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #e0e0e0;
  margin: 0 0 12px 0;
}

.clear-btn {
  padding: 4px 10px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #8a8a8a;
  font-size: 11px;
  cursor: pointer;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e0e0e0;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(26, 33, 48, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.member-card:hover {
  background: rgba(26, 33, 48, 0.9);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateX(4px);
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.member-avatar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}

.member-avatar svg {
  width: 20px;
  height: 20px;
  stroke: white;
  position: relative;
  z-index: 1;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-role {
  font-size: 12px;
  color: #8a8a8a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.member-status.online {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.member-status.offline {
  background: #6b7280;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
}

.status-btn:hover {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #6b7280;
  font-size: 13px;
  background: rgba(26, 33, 48, 0.3);
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

.execution-log {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 8px;
}

.log-entry {
  font-size: 11px;
  color: #8a8a8a;
  margin-bottom: 8px;
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
}

.log-time {
  color: #6b7280;
  margin-right: 8px;
}

.log-content {
  color: #a0aec0;
}

.view-more-btn {
  width: 100%;
  padding: 8px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #5b6cff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-more-btn:hover {
  background: rgba(91, 108, 255, 0.1);
  border-color: rgba(91, 108, 255, 0.3);
}
</style>
