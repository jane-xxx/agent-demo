<!-- src/components/common/AgentMentionPicker.vue -->
<template>
  <Teleport to="body">
    <div
      v-if="isOpen && agents.length > 0"
      class="mention-picker"
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
    >
      <div class="mention-header">@ 提及 Agent</div>
      <div class="mention-list">
        <div
          v-for="agent in agents"
          :key="agent.id"
          class="mention-item"
          @click="selectAgent(agent)"
        >
          <div class="mention-agent-icon" :style="{ background: agent.color }">
            <component :is="getAgentIcon(agent.icon)" />
          </div>
          <div class="mention-agent-info">
            <div class="mention-agent-name">{{ agent.name }}</div>
            <div class="mention-agent-role">{{ getAgentRole(agent.category) }}</div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
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

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  agents: {
    type: Array,
    default: () => []
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  }
})

const emit = defineEmits(['select'])

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

const selectAgent = (agent) => {
  emit('select', agent)
}
</script>

<style scoped>
.mention-picker {
  position: fixed;
  background: #1a2130;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  z-index: 100;
  min-width: 240px;
  max-height: 320px;
  overflow: hidden;
}

.mention-header {
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(13, 17, 28, 0.8);
}

.mention-list {
  max-height: 270px;
  overflow-y: auto;
  padding: 6px;
}

.mention-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.mention-item:hover {
  background: rgba(91, 108, 255, 0.12);
}

.mention-agent-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.mention-agent-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

.mention-agent-icon svg {
  width: 16px;
  height: 16px;
  stroke: white;
  position: relative;
  z-index: 1;
}

.mention-agent-info {
  flex: 1;
  min-width: 0;
}

.mention-agent-name {
  font-size: 13px;
  font-weight: 500;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mention-agent-role {
  font-size: 11px;
  color: #8a8a8a;
}
</style>
