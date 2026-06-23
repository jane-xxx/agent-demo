<template>
  <div class="selection-panel">
    <div class="panel-content">
      <span class="selection-title">已选择 <span class="count-number">{{ selectedCount }}</span> 个 Agent：</span>
      <div class="selected-agents" :class="{ expanded: isExpanded }">
        <div
          v-for="agent in (isExpanded ? selectedAgentsArray : displayedAgents)"
          :key="agent.id"
          class="agent-chip"
        >
          <span class="chip-icon" :style="{ '--icon-color': agent.color }">
            <ChatBubbleLeftRightIcon v-if="agent.icon === 'chat'" />
            <MagnifyingGlassIcon v-else-if="agent.icon === 'search'" />
            <DocumentTextIcon v-else-if="agent.icon === 'document'" />
            <CodeBracketIcon v-else-if="agent.icon === 'code'" />
            <ChartBarIcon v-else-if="agent.icon === 'chart'" />
            <PaintBrushIcon v-else-if="agent.icon === 'palette'" />
            <LightBulbIcon v-else-if="agent.icon === 'lightbulb'" />
            <RocketLaunchIcon v-else />
          </span>
          <span class="chip-name">{{ agent.name.replace(' Agent', '') }}</span>
          <button class="remove-btn" @click="removeAgent(agent.id)">
            <XMarkIcon />
          </button>
        </div>
        <div
          v-if="hasMoreAgents && !isExpanded"
          class="more-indicator"
          @click="toggleExpand"
        >
          <ChevronDownIcon />
          <span>+{{ selectedCount - 5 }}</span>
        </div>
        <div
          v-if="isExpanded"
          class="collapse-indicator"
          @click="toggleExpand"
        >
          <ChevronUpIcon />
          <span>收起</span>
        </div>
        <div v-if="selectedAgentsArray.length === 0" class="empty-state">
          请选择至少一个 Agent
        </div>
      </div>
      <div class="divider"></div>
      <div class="team-name-input">
        <div class="input-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
          </svg>
        </div>
        <input
          type="text"
          v-model="teamName"
          placeholder="请输入团队名称"
          class="name-input"
        />
      </div>
      <button
        class="create-btn"
        :disabled="selectedCount === 0 || !teamName"
        @click="createTeam"
      >
        <span>创建团队</span>
        <ArrowRightIcon />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentSelection } from '../composables/useAgentSelection'
import { useWorkspace } from '../composables/useWorkspace'
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ChartBarIcon,
  PaintBrushIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  XMarkIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const {
  selectedCount,
  selectedAgentsArray,
  teamName,
  clearSelection
} = useAgentSelection()

const { addTeam } = useWorkspace()

// 创建团队
const createTeam = () => {
  if (!teamName.value.trim() || selectedCount.value === 0) return

  // 生成团队ID
  const teamId = `team-${Date.now().toString().slice(-6)}`

  const newTeam = {
    id: teamId,
    name: teamName.value.trim(),
    subtitle: '刚刚',
    memberCount: selectedAgentsArray.value.length || 0,
    color: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
    createdAt: new Date().toISOString(),
    lastActivity: '刚刚',
    description: `由 ${selectedAgentsArray.value.length || 0} 个 Agent 组成的团队`,
    agents: selectedAgentsArray.value.map(agent => ({
      ...agent,
      status: agent.status || 'online'
    }))
  }

  console.log('首页创建团队，保存到 localStorage:', newTeam.name)

  // 保存到 teams 数组和 localStorage
  addTeam(newTeam)

  // 清空选中状态
  clearSelection()

  // 导航到工作台
  router.push({ name: 'workspace', params: { teamId } })
}

// Display only first 5 agents
const displayedAgents = computed(() => {
  return selectedAgentsArray.value.slice(0, 5)
})

// Check if there are more than 5 agents
const hasMoreAgents = computed(() => {
  return selectedAgentsArray.value.length > 5
})

// Expanded state
const isExpanded = ref(false)

// Toggle expand/collapse
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.selection-panel {
  position: relative;
  width: calc(100% - 48px);
  margin: 0 24px 24px;
  border-radius: 16px;
  padding: 1px;
  flex-shrink: 0;
  background: linear-gradient(
    150deg,
    #8b5cf6 0%,
    #2a3055 40%,
    #1e7a9f 100%
  );
  overflow: hidden;
}

.selection-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 20% 0%,
      rgba(0, 194, 255, 0.18),
      transparent 25%
    ),
    radial-gradient(
      circle at 80% 0%,
      rgba(139, 92, 246, 0.18),
      transparent 25%
    );
  pointer-events: none;
}

.panel-content {
  position: relative;
  z-index: 1;
  border-radius: 15px;
  padding: 14px 24px;
  background: linear-gradient(180deg, rgba(4, 9, 21, 1), rgba(3, 8, 25, 1));
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  gap: 16px;
}

.selection-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}

.selection-title .count-number {
  color: #6c5ce7;
  font-weight: 700;
}

.selected-agents {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  max-height: 36px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.selected-agents.expanded {
  max-height: 120px;
}

.agent-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(30, 39, 46, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  transition: all 0.2s;
}

.agent-chip:hover {
  background: rgba(30, 39, 46, 0.8);
  border-color: rgba(255, 255, 255, 0.15);
}

.chip-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.chip-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--icon-color);
  opacity: 0.2;
  border-radius: 50%;
}

.chip-icon :deep(svg) {
  width: 14px;
  height: 14px;
  stroke-width: 2;
  stroke: var(--icon-color);
  position: relative;
  z-index: 1;
}

.chip-name {
  font-size: 13px;
  color: white;
  font-weight: 500;
}

.remove-btn {
  width: 16px;
  height: 16px;
  background: transparent;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  color: #636e72;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: rgba(214, 48, 49, 0.2);
  color: #d63031;
}

.remove-btn :deep(svg) {
  width: 10px;
  height: 10px;
}

.more-indicator {
  padding: 6px 10px;
  background: rgba(108, 92, 231, 0.15);
  border: 1px solid rgba(108, 92, 231, 0.3);
  border-radius: 8px;
  font-size: 13px;
  color: #a78bfa;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.more-indicator:hover {
  background: rgba(108, 92, 231, 0.25);
  border-color: rgba(108, 92, 231, 0.5);
}

.more-indicator :deep(svg) {
  width: 14px;
  height: 14px;
}

.collapse-indicator {
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 13px;
  color: #b2bec3;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.collapse-indicator:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.collapse-indicator :deep(svg) {
  width: 14px;
  height: 14px;
}

.empty-state {
  color: #636e72;
  font-size: 13px;
  padding: 6px 0;
}

.divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.team-name-input {
  position: relative;
  width: 220px;
  flex-shrink: 0;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #6c5ce7;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.name-input {
  width: 100%;
  padding: 10px 14px 10px 36px;
  height: 38px;
  background: rgba(30, 39, 46, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: white;
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
}

.name-input::placeholder {
  color: #636e72;
}

.name-input:focus {
  border-color: rgba(108, 92, 231, 0.5);
  background: rgba(30, 39, 46, 0.8);
}

.create-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 24px;
  height: 38px;
  background: linear-gradient(135deg, #6c5ce7 0%, #a855f7 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.create-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a4ad4 0%, #9333ea 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);
}

.create-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.create-btn :deep(svg) {
  width: 14px;
  height: 14px;
}
</style>
