<template>
  <div class="right-sidebar">
    <!-- 成员列表 -->
    <div class="member-section">
      <h3 class="section-title">团队成员 ({{ teamAgents.length + 1 }})</h3>
      <div class="member-list">
        <!-- Me (current user) -->
        <div class="member-card me-card" @click="handleMeClick">
          <div class="member-avatar me-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="member-name">我</div>
        </div>
        <!-- Agents -->
        <template v-if="teamAgents.length > 0">
          <div
            v-for="agent in teamAgents"
            :key="agent.id"
            class="member-card"
            :class="{ 'agent-active': activeAgent === agent.id }"
            @click="handleAgentClick(agent)"
          >
            <div class="member-avatar" :style="{ background: agent.color, color: agent.color }">
              <component :is="getAgentIcon(agent.icon)" />
            </div>
            <div class="member-name">{{ agent.name.replace(' Agent', '') }}</div>
          </div>
        </template>
      </div>
    </div>

    <!-- 执行日志 -->
    <div class="log-section">
      <div class="log-header">
        <h3 class="section-title">执行日志</h3>
        <button class="clear-btn" @click="handleClearLogs">清空</button>
      </div>
      <div class="execution-log" ref="logContainer">
        <div v-if="logs.length === 0" class="empty-log">暂无日志</div>
        <div v-for="(log, index) in logs" :key="index" class="log-entry">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-content">{{ log.content }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAgentSelection } from '../../composables/useAgentSelection'
import { useWorkspace } from '../../composables/useWorkspace'
import { useModal } from '../../composables/useModal'
import { useChat } from '../../composables/useChat'
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

const route = useRoute()
const { currentTeam: createdTeam } = useAgentSelection()
const { teams } = useWorkspace()
const { openAgentDetailModal } = useModal()
const { activeAgent, logs, clearLogs: clearChatLogs } = useChat()

// 日志容器引用
const logContainer = ref(null)

// 滚动到底部
const scrollLogToBottom = () => {
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}

// 监听日志变化，自动滚动到底部
watch(logs, () => {
  scrollLogToBottom()
}, { deep: true })

// 初始化时滚动到底部
watch(() => logs.value?.length, () => {
  scrollLogToBottom()
}, { immediate: true })

// 获取当前路由中的团队，如果没有则使用创建的团队
const currentTeam = computed(() => {
  const teamId = route.params.teamId
  if (teamId) {
    // 从团队列表中查找 - 统一使用字符串比较
    const found = teams.value.find(t => String(t.id) === String(teamId))
    if (found) {
      return {
        teamId: found.id,
        name: found.name,
        agents: found.agents || []
      }
    }
  }
  // 回退到创建的团队
  return createdTeam.value
})

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

const handleAgentClick = (agent) => {
  openAgentDetailModal(agent)
}

const handleMeClick = () => {
  // Could open user profile or settings in the future
  console.log('Clicked on me')
}

const handleClearLogs = () => {
  clearChatLogs()
}
</script>

<style scoped>
.right-sidebar {
  width: 280px;
  height: 100%;
  background: #0f141f;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 成员列表区域 */
.member-section {
  height: 45%;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.member-section .section-title {
  padding: 14px 14px 10px;
  font-size: 13px;
  font-weight: 700;
  color: #f1f5f9;
}

.member-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px 12px;
}

.member-list::-webkit-scrollbar {
  width: 4px;
}

.member-list::-webkit-scrollbar-track {
  background: transparent;
}

.member-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

/* 执行日志区域 */
.log-section {
  height: 55%;
  display: flex;
  flex-direction: column;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px 8px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #f1f5f9;
}

.clear-btn {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
}

.execution-log {
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px 12px;
}

.execution-log::-webkit-scrollbar {
  width: 4px;
}

.execution-log::-webkit-scrollbar-track {
  background: transparent;
}

.execution-log::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.empty-log {
  text-align: center;
  padding: 24px 12px;
  color: #64748b;
  font-size: 12px;
}

.log-entry {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 6px;
  padding: 6px 8px;
  background: rgba(30, 41, 59, 0.4);
  border-radius: 6px;
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
  line-height: 1.5;
}

.log-time {
  color: #475569;
  margin-right: 6px;
  font-size: 10px;
}

.log-content {
  color: #94a3b8;
  font-size: 11px;
}

/* 成员列表 */
.member-list {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-content: start;
  align-items: start;
  row-gap: 8px;
  column-gap: 6px;
  padding: 6px 10px 12px;
}

.member-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 4px 4px;
  background: transparent;
  border: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.member-card:hover .member-avatar {
  filter: brightness(1.3) saturate(1.2);
  box-shadow: 0 0 16px rgba(255, 255, 255, 0.4);
}

/* Agent执行中的发光效果 */
.member-card.agent-active .member-avatar {
  animation: runningGlow 1.4s ease-in-out infinite;
}

@keyframes runningGlow {
  0% {
    box-shadow: 0 0 0 0 currentColor;
  }
  50% {
    box-shadow: 0 0 8px 4px currentColor,
                0 0 16px 8px rgba(255, 255, 255, 0.3);
  }
  100% {
    box-shadow: 0 0 0 0 currentColor;
  }
}

.member-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: visible;
  transition: filter 0.2s ease, box-shadow 0.2s ease;
  z-index: 1;
}

.member-avatar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 50%;
}

.member-avatar svg {
  width: 24px;
  height: 24px;
  stroke: white;
  position: relative;
  z-index: 1;
}

.me-avatar {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.member-name {
  font-size: 12px;
  font-weight: 500;
  color: #f1f5f9;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
</style>
