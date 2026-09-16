<!-- src/components/workspace/CreateTeamModal.vue -->
<template>
  <BaseModal :is-open="isOpen" title="新建团队" custom-class="modal-wide" @close="close">
    <form class="create-team-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label class="form-label">团队名称</label>
        <input
          v-model="teamName"
          type="text"
          class="form-input"
          placeholder="请输入团队名称"
          maxlength="50"
        />
      </div>

      <!-- Agent Selection -->
      <div class="form-group">
        <div class="form-header">
          <label class="form-label">选择智能体</label>
          <div class="selected-count" v-if="selectedCount > 0">
            已选择 {{ selectedCount }} 个智能体
          </div>
          <div class="selected-count empty" v-else>
            请至少选择一个智能体
          </div>
        </div>
      </div>

      <div class="agents-grid">
        <div
          v-for="agent in agents"
          :key="agent.id"
          :class="['agent-option', { selected: isAgentSelected(agent.id) }]"
          :style="{ '--agent-color': agent.color }"
          @click="toggleAgent(agent.id)"
        >
          <div class="agent-icon" :style="{ '--icon-color': agent.color }">
            <!-- Chat -->
            <svg v-if="agent.icon === 'chat'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <!-- Research -->
            <svg v-else-if="agent.icon === 'search'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <!-- Writing -->
            <svg v-else-if="agent.icon === 'document'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <!-- Code -->
            <svg v-else-if="agent.icon === 'code'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            <!-- Chart -->
            <svg v-else-if="agent.icon === 'chart'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <!-- Palette -->
            <svg v-else-if="agent.icon === 'palette'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="13.5" cy="6.5" r=".5"/>
              <circle cx="17.5" cy="10.5" r=".5"/>
              <circle cx="8.5" cy="7.5" r=".5"/>
              <circle cx="6.5" cy="12.5" r=".5"/>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.093 0-.93.746-1.688 1.688-1.688h1.875c2.866 0 5.187-2.308 5.187-5.188C20 6.5 16.358 2 12 2z"/>
            </svg>
            <!-- Lightbulb -->
            <svg v-else-if="agent.icon === 'lightbulb'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18h6"/>
              <path d="M10 22h4"/>
              <path d="M12 2v1"/>
              <path d="M12 7a5 5 0 1 0-4.546 2.916A5.8 5.8 0 0 0 12 7Z"/>
            </svg>
            <!-- Rocket -->
            <svg v-else-if="agent.icon === 'rocket'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
            </svg>
            <!-- Default -->
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
          </div>
          <div class="agent-info">
            <div class="agent-name">{{ agent.name }}</div>
          </div>
          <div :class="['check-indicator', { checked: isAgentSelected(agent.id) }]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="close">取消</button>
        <button type="submit" class="btn-submit" :disabled="!teamName.trim() || selectedCount === 0">创建</button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '../common/BaseModal.vue'
import { useAgentSelection } from '../../composables/useAgentSelection'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'create'])

const { AGENTS, getCategoryColor } = useAgentSelection()

// 本地选中状态（与首页独立）
const localSelectedAgents = ref(new Set())
const teamName = ref('')

// Agents with color
const agents = computed(() => {
  return AGENTS.map(agent => ({
    ...agent,
    color: getCategoryColor(agent.category)
  }))
})

const selectedCount = computed(() => localSelectedAgents.value.size)

// 选中的 Agent 数组
const selectedAgentsArray = computed(() => {
  return AGENTS.filter(agent => localSelectedAgents.value.has(agent.id)).map(agent => ({
    ...agent,
    color: getCategoryColor(agent.category)
  }))
})

// 切换 Agent 选中状态
const toggleAgent = (agentId) => {
  if (localSelectedAgents.value.has(agentId)) {
    localSelectedAgents.value.delete(agentId)
  } else {
    localSelectedAgents.value.add(agentId)
  }
  // 强制响应式更新
  localSelectedAgents.value = new Set(localSelectedAgents.value)
}

// 检查 Agent 是否被选中
const isAgentSelected = (agentId) => localSelectedAgents.value.has(agentId)

// 关闭弹窗时清空状态
const close = () => {
  emit('close')
  teamName.value = ''
  localSelectedAgents.value = new Set()
}

// 监听弹窗关闭，清空选中状态
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    localSelectedAgents.value = new Set()
    teamName.value = ''
  }
})

const handleSubmit = () => {
  if (!teamName.value.trim() || selectedCount.value === 0) return

  emit('create', {
    name: teamName.value.trim(),
    agents: [...selectedAgentsArray.value]
  })

  teamName.value = ''
  localSelectedAgents.value = new Set()
}
</script>

<style scoped>
.create-team-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #e0e0e0;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  background: #0d111c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus {
  border-color: #5b6cff;
  box-shadow: 0 0 0 3px rgba(91, 108, 255, 0.1);
}

.form-input::placeholder {
  color: #6b7280;
}

/* Selected count indicator */
.selected-count {
  font-size: 12px;
  color: #a5b4fc;
  background: rgba(99, 102, 241, 0.1);
  padding: 4px 10px;
  border-radius: 4px;
  white-space: nowrap;
}

.selected-count.empty {
  color: #6b7280;
  background: rgba(255, 255, 255, 0.03);
}

/* Agents Grid */
.agents-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-height: 260px;
  overflow-y: auto;
  padding: 2px;
}

.agents-grid::-webkit-scrollbar {
  display: none;
}

.agents-grid {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.agent-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #0d111c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.agent-option:hover {
  background: #151b2b;
  border-color: rgba(255, 255, 255, 0.12);
}

.agent-option.selected {
  background: linear-gradient(135deg, color-mix(in srgb, var(--agent-color) 8%, transparent) 0%, color-mix(in srgb, var(--agent-color) 3%, transparent) 100%);
  border-color: var(--agent-color);
}

.agent-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  flex-shrink: 0;
  position: relative;
}

.agent-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--icon-color);
  opacity: 0.15;
  border-radius: 50%;
}

.agent-icon svg {
  width: 18px;
  height: 18px;
  stroke: var(--icon-color);
  position: relative;
  z-index: 1;
}

.agent-info {
  flex: 1;
  min-width: 0;
}

.agent-name {
  font-size: 13px;
  font-weight: 500;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.check-indicator {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  background: transparent;
}

.check-indicator svg {
  width: 12px;
  height: 12px;
  color: white;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s;
}

.agent-option.selected .check-indicator {
  background: var(--agent-color);
  border-color: var(--agent-color);
}

.agent-option.selected .check-indicator svg {
  opacity: 1;
  transform: scale(1);
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-submit {
  padding: 6px 22px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #a0aec0;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  color: #e0e0e0;
}

.btn-submit {
  background: #5b6cff;
  border: none;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #4a5bf0;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
