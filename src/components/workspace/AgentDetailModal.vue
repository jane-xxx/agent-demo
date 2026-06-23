<!-- src/components/workspace/AgentDetailModal.vue -->
<template>
  <BaseModal :is-open="isOpen" title="Agent 详情" @close="close">
    <div v-if="agent" class="agent-detail">
      <div class="agent-header">
        <div class="agent-avatar-large" :style="{ background: agent.color }">
          <component :is="getAgentIcon(agent.icon)" />
        </div>
        <div class="agent-info-header">
          <h4 class="agent-name">{{ agent.name }}</h4>
          <div class="agent-status-badge" :class="agent.status || 'online'">
            {{ agent.status === 'offline' ? '离线' : '在线' }}
          </div>
        </div>
      </div>

      <div class="agent-section">
        <h5 class="section-title">角色</h5>
        <p class="section-text">{{ getAgentRole(agent.category) }}</p>
      </div>

      <div class="agent-section">
        <h5 class="section-title">能力描述</h5>
        <p class="section-text">{{ capabilities?.capability || '暂无描述' }}</p>
      </div>

      <div class="agent-section">
        <h5 class="section-title">最近活动</h5>
        <ul class="activity-list">
          <li v-for="(activity, index) in capabilities?.recentActivities" :key="index">
            {{ activity }}
          </li>
        </ul>
      </div>

      <div class="agent-section">
        <h5 class="section-title">统计</h5>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">已完成任务</span>
            <span class="stat-value">{{ agentTasks?.completed || capabilities?.stats?.tasksCompleted || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">在线时长</span>
            <span class="stat-value">{{ agentTasks?.avgResponseTime || capabilities?.stats?.onlineHours || 0 }}h</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">进行中</span>
            <span class="stat-value">{{ agentTasks?.inProgress || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">响应时间</span>
            <span class="stat-value">{{ agentTasks?.avgResponseTime || '-' }}</span>
          </div>
        </div>
      </div>

      <div class="agent-section" v-if="agentTasks?.tasks?.length">
        <h5 class="section-title">最近任务</h5>
        <ul class="task-list">
          <li v-for="task in agentTasks.tasks.slice(0, 5)" :key="task.id" class="task-item" :class="`task-${task.status}`">
            <span class="task-title">{{ task.title }}</span>
            <span class="task-time">{{ task.time }}</span>
          </li>
        </ul>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from '../common/BaseModal.vue'
import { AGENT_CAPABILITIES } from '../../utils/constants'
import { MOCK_AGENT_TASKS } from '../../utils/mockData'
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ChartBarIcon,
  PaintBrushIcon,
  LightBulbIcon,
  RocketLaunchIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  selectedAgent: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const agent = computed(() => props.selectedAgent)

const capabilities = computed(() => {
  if (!agent.value) return null
  return AGENT_CAPABILITIES[agent.value.id] || null
})

// 获取 Agent 的任务历史
const agentTasks = computed(() => {
  if (!agent.value) return null
  return MOCK_AGENT_TASKS[agent.value.id] || null
})

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

const close = () => {
  emit('close')
}
</script>

<style scoped>
.agent-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.agent-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(26, 33, 48, 0.6);
  border-radius: 10px;
}

.agent-avatar-large {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.agent-avatar-large::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
}

.agent-avatar-large svg {
  width: 28px;
  height: 28px;
  stroke: white;
  position: relative;
  z-index: 1;
}

.agent-info-header {
  flex: 1;
}

.agent-name {
  font-size: 18px;
  font-weight: 600;
  color: #e0e0e0;
  margin: 0 0 8px;
}

.agent-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.agent-status-badge.online {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.agent-status-badge.offline {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
}

.agent-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #8a8a8a;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-text {
  font-size: 14px;
  color: #a0aec0;
  margin: 0;
  line-height: 1.6;
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-list li {
  font-size: 14px;
  color: #a0aec0;
  padding: 6px 0;
  padding-left: 16px;
  position: relative;
}

.activity-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #5b6cff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  padding: 12px;
  background: rgba(26, 33, 48, 0.4);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #e0e0e0;
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(26, 33, 48, 0.4);
  border-radius: 6px;
  border-left: 3px solid;
}

.task-item.task-completed {
  border-left-color: #22c55e;
}

.task-item.task-in_progress {
  border-left-color: #f59e0b;
}

.task-title {
  font-size: 13px;
  color: #e0e0e0;
}

.task-time {
  font-size: 11px;
  color: #6b7280;
}
</style>
