<template>
  <aside class="right-sidebar" aria-label="团队与协作">
    <section class="member-section">
      <header class="sidebar-header">
        <h3>团队成员 <span class="section-count">{{ teamAgents.length + 1 }}</span></h3>
      </header>
      <div class="member-list">
        <div class="member-card me-card">
          <div class="member-avatar me-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
          <div class="member-meta"><span class="member-name">我</span><span class="member-stage">任务发起人</span></div>
        </div>
        <button v-for="agent in teamAgents" :key="agent.id" type="button" class="member-card"
          :class="{ 'agent-active': activeAgent.includes(agent.id) }" @click="handleAgentClick(agent)"
          :aria-label="'查看' + agent.name + '详情'" :title="agent.name">
          <div class="member-avatar" :style="{ background: agent.color }"><component :is="getAgentIcon(agent.icon)" /></div>
          <div class="member-meta"><span class="member-name">{{ agent.name }}</span><span class="member-stage">{{ memberBadge(agent) }}</span></div>
        </button>
      </div>
    </section>

    <section class="progress-section" :class="{ 'is-idle': !latestPlan }">
      <header class="sidebar-header">
        <h3>协作进度</h3>
        <button v-if="latestPlan" class="icon-fold-button" @click="progressExpanded = !progressExpanded" :aria-expanded="progressExpanded" aria-controls="sidebar-progress" :title="progressExpanded ? '收起协作进度' : '展开协作进度'" :aria-label="progressExpanded ? '收起协作进度' : '展开协作进度'">{{ progressExpanded ? '⌃' : '⌄' }}</button>
      </header>
      <p class="progress-summary">{{ latestPlan ? progressSummary : '暂无协作任务' }}</p>
      <ol v-show="progressExpanded" id="sidebar-progress" class="sidebar-steps">
        <li v-for="(step, index) in latestPlan?.subtasks || []" :key="step.key || index" :class="'state-' + step.status">
          <span class="step-dot" aria-hidden="true"></span>
          <span class="step-info" :title="step.name + ' · ' + (step.agent?.name || '待补充成员')">
            <span class="step-name">{{ step.name }}</span><span class="step-owner">{{ step.agent?.name.replace('智能体', '') || '待补充' }}</span>
          </span>
          <span class="step-status">{{ taskStatusLabel(step.status) }}</span>
          <button v-if="step.resultId" class="result-button" @click="requestResult(step.resultId)" :aria-label="'查看' + step.name + '交付'" :title="'查看' + step.name + '交付'">↗</button>
        </li>
      </ol>
    </section>

    <section class="logs-section" :class="{ 'is-collapsed': !logsExpanded }">
      <header class="sidebar-header">
        <h3>执行日志 <span class="section-count">{{ logs.length }}</span></h3>
        <div class="header-actions">
          <button v-if="logs.length && logsExpanded" class="clear-button" @click="handleClearLogs">清空</button>
          <button class="fold-button" @click="toggleLogs" :aria-expanded="logsExpanded" aria-controls="sidebar-logs">{{ logsExpanded ? '收起' : '展开' }} <span aria-hidden="true">{{ logsExpanded ? '⌃' : '⌄' }}</span></button>
        </div>
      </header>
      <div v-show="logsExpanded" id="sidebar-logs" class="execution-log" ref="logContainer">
        <p v-if="!logs.length" class="empty-log">任务执行后，过程记录会显示在这里。</p>
        <div v-for="(log, index) in logs" :key="index" class="log-entry">
          <time class="log-time">{{ log.time }}</time><span class="log-content">{{ displayLogContent(log.content) }}</span>
        </div>
      </div>
    </section>
  </aside>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAgentSelection } from '../../composables/useAgentSelection'
import { useWorkspace } from '../../composables/useWorkspace'
import { useModal } from '../../composables/useModal'
import { useChat } from '../../composables/useChat'
import { planView, taskStatusLabel } from '../../utils/taskPresentation.js'
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
const progressExpanded = ref(true)
const logsExpanded = ref(true)
const { currentTeam: createdTeam } = useAgentSelection()
const { teams } = useWorkspace()
const { openAgentDetailModal } = useModal()
const { activeAgent, logs, messages, agentBids, clearLogs: clearChatLogs, requestResult } = useChat()
const latestPlan = computed(() => {
  // 只展示最近一次用户任务的进度，避免 @直答时残留上一任务的计划。
  const lastUser = messages.value.map(m => m.type).lastIndexOf('user')
  const plan = [...messages.value.slice(lastUser + 1)].reverse().find(m => m.type === 'decomp')
  return planView(plan, messages.value)
})
const progressSummary = computed(() => {
  const plan = latestPlan.value
  if (!plan) return ''
  const done = plan.subtasks.filter(s => s.status === 'completed').length
  const label = { planned: '待执行', running: '执行中', awaiting_choice: '等待补充成员', completed: '已完成', partial: '部分完成', needs_info: '待补充信息', failed: '执行失败', cancelled: '已停止', historical: '历史记录' }[plan.planStatus] || '待执行'
  return label + ' · ' + done + '/' + plan.subtasks.length
})
const toggleLogs = () => {
  logsExpanded.value = !logsExpanded.value
  if (logsExpanded.value) scrollLogToBottom()
}

// 成员徽标：广播协作中显示认领状态（认领 · N% / 未认领），平时显示角色职能
const memberBadge = (agent) => {
  if (activeAgent.value.includes(agent.id)) return '处理中'
  const assigned = latestPlan.value?.subtasks.filter(s => s.agent?.id === agent.id) || []
  if (assigned.length) {
    if (assigned.some(s => s.status === 'failed')) return '执行失败'
    if (assigned.some(s => s.status === 'needs_info')) return '待补充信息'
    if (assigned.every(s => s.status === 'completed')) return '已交付'
    if (assigned.some(s => s.status === 'blocked')) return '等待上游'
    return '待执行'
  }
  const bid = agentBids.value[agent.id]
  if (bid) return bid.bidding ? '能力匹配' : '未参与'
  return '团队成员'
}

const badgeClass = (agent) => {
  const bid = agentBids.value[agent.id]
  return bid ? (bid.bidding ? 'bid-joined' : 'bid-abstain') : ''
}

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
    '内容创作': '创作助手',
    '研究分析': '研究分析',
    '开发效率': '开发助手'
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

const displayLogContent = content => String(content || '')
  .replace(/（\d+\/\d+ 个子任务已交付）/g, '')
  .replace(/\s+$/g, '')
</script>

<style scoped>
.right-sidebar { width: 280px; flex-shrink: 0; height: 100%; min-height: 0; background: #0f141f; border-left: 1px solid #ffffff0b; display: flex; flex-direction: column; overflow: hidden; color: #cbd5e1; }
.sidebar-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 14px 8px; flex-shrink: 0; }
.sidebar-header h3 { margin: 0; font-size: 12px; font-weight: 600; color: #cbd5e1; line-height: 1.5; }
.section-count { color: #8896aa; font-size: 11px; font-weight: 400; margin-left: 5px; }
.member-section { flex: 3 1 0; min-height: 0; display: flex; flex-direction: column; border-bottom: 1px solid #ffffff0a; padding-bottom: 12px; }
.member-list { flex: 1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-content: start; align-items: start; gap: 12px 6px; padding: 6px 10px 10px; overflow-y: auto; min-height: 0; overscroll-behavior: contain; }
.member-card { display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 0; padding: 4px; border: 0; border-radius: 8px; background: transparent; color: inherit; text-align: center; cursor: pointer; font-family: inherit; }
.member-card:hover { background: #ffffff06; }
.me-card { cursor: default; }
.member-avatar { width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; transition: filter .2s; }
.member-avatar svg { width: 24px; height: 24px; stroke: white; }
.member-card:hover .member-avatar { filter: brightness(1.15); }
.me-avatar { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
.member-meta { display: flex; flex-direction: column; gap: 3px; min-width: 0; width: 100%; }
.member-name { font-size: 12px; font-weight: 500; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.member-stage { font-size: 10px; color: #8896aa; line-height: 1.4; }
.agent-active { background: #818cf810; }
.agent-active .member-stage { color: #a5b4fc; }
.agent-active .member-avatar { outline: 2px solid #818cf866; outline-offset: 2px; }
.progress-section { flex: 0 0 auto; min-height: 0; max-height: 128px; display: flex; flex-direction: column; padding-bottom: 7px; border-bottom: 1px solid #ffffff0a; background: #0b1019; }
.progress-section.is-idle { max-height: 74px; }
.progress-summary { font-size: 11px; line-height: 1.4; color: #94a3b8; margin: -2px 14px 5px; flex-shrink: 0; }
.sidebar-steps { list-style: none; margin: 0; padding: 0 12px; overflow-y: auto; min-height: 0; max-height: 64px; }
.sidebar-steps li { display: flex; align-items: center; gap: 7px; padding: 3px 2px; min-height: 22px; }
.step-dot { width: 4px; height: 4px; background: #7c8a9e; border-radius: 50%; flex-shrink: 0; }
.step-info { flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; }
.step-name { font-size: 11px; white-space: nowrap; }
.step-owner { font-size: 10px; color: #8896aa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.step-status { font-size: 10px; color: #94a3b8; white-space: nowrap; }
.state-completed .step-dot { background: #79ab9d; }
.state-running .step-dot { background: #a5b4fc; }
.state-running .step-status { color: #a5b4fc; }
.state-uncovered .step-status, .state-needs_info .step-status, .state-blocked .step-status { color: #d9b57a; }
.state-failed .step-status { color: #fda4af; }
.logs-section { flex: 2 1 0; min-height: 0; display: flex; flex-direction: column; }
.logs-section.is-collapsed { flex: 0 0 auto; }
.header-actions { display: flex; align-items: center; gap: 9px; }
.fold-button, .clear-button, .result-button, .icon-fold-button { border: 0; background: none; cursor: pointer; font-family: inherit; color: #94a3b8; font-size: 11px; padding: 4px 0; }
.fold-button { display: flex; align-items: center; gap: 4px; }
.icon-fold-button { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 6px; font-size: 14px; line-height: 1; }
.icon-fold-button:hover { background: #ffffff08; color: #e2e8f0; }
.clear-button { color: #8896aa; }
.result-button { padding: 4px; font-size: 13px; }
.fold-button:hover, .clear-button:hover, .result-button:hover { color: #e2e8f0; }
button:focus-visible { outline: 2px solid #a5b4fc; outline-offset: 2px; border-radius: 4px; }
.execution-log { flex: 1; min-height: 0; overflow-y: auto; padding: 0 14px 14px; }
.log-entry { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 8px; padding: 9px 0; border-bottom: 1px solid #ffffff06; font-size: 11px; line-height: 1.7; }
.log-time { color: #8896aa; font-size: 10px; font-variant-numeric: tabular-nums; }
.log-content { color: #b5c0d0; overflow-wrap: anywhere; }
.empty-log { color: #94a3b8; font-size: 11px; line-height: 1.7; padding: 14px 0; margin: 0; }
.member-list, .sidebar-steps, .execution-log { scrollbar-width: thin; scrollbar-color: #ffffff18 transparent; }
.member-list::-webkit-scrollbar, .sidebar-steps::-webkit-scrollbar, .execution-log::-webkit-scrollbar { width: 3px; }
.member-list::-webkit-scrollbar-thumb, .sidebar-steps::-webkit-scrollbar-thumb, .execution-log::-webkit-scrollbar-thumb { background: #ffffff18; border-radius: 4px; }
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto; } }
</style>
