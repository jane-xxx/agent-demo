<template>
  <div class="agent-grid">
    <AgentCard
      v-for="agent in filteredAgents"
      :key="agent.id"
      :agent="agent"
    />
    <div v-if="filteredAgents.length === 0" class="no-results">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <p>未找到匹配的智能体</p>
    </div>
  </div>
</template>

<script setup>
import AgentCard from './AgentCard.vue'
import { useAgentSelection } from '../composables/useAgentSelection'

const { filteredAgents } = useAgentSelection()
</script>

<style scoped>
.agent-grid {
  display: grid;
  /* 宽屏保持 4 列，窄屏（笔记本/分屏）自动降为 3 列，避免横向滚动 */
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 28px;
  margin-bottom: 32px;
  padding: 0 32px;
}

.no-results {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  color: #9aa5b1;
}

.no-results svg {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-results p {
  font-size: 18px;
}
</style>
