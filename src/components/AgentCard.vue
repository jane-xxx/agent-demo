<template>
  <div
    :class="['agent-card', { selected: isSelected }]"
    :style="{ '--agent-color': agent.color }"
    @click="handleClick"
  >
    <div class="card-inner">
      <div class="card-header">
        <div class="agent-icon" :style="{ '--icon-color': agent.color }">
          <!-- Chat -->
          <ChatBubbleLeftRightIcon v-if="agent.icon === 'chat'" />

          <!-- Research -->
          <MagnifyingGlassIcon v-else-if="agent.icon === 'search'" />

          <!-- Writing -->
          <DocumentTextIcon v-else-if="agent.icon === 'document'" />

          <!-- Code -->
          <CodeBracketIcon v-else-if="agent.icon === 'code'" />

          <!-- Chart -->
          <ChartBarIcon v-else-if="agent.icon === 'chart'" />

          <!-- Palette -->
          <PaintBrushIcon v-else-if="agent.icon === 'palette'" />

          <!-- Lightbulb -->
          <LightBulbIcon v-else-if="agent.icon === 'lightbulb'" />

          <!-- Rocket -->
          <RocketLaunchIcon v-else-if="agent.icon === 'rocket'" />

          <!-- Default fallback -->
          <CubeIcon v-else />
        </div>
        <button
          :class="['select-indicator', { selected: isSelected }]"
          @click.stop="toggleSelection"
        >
          <CheckIcon v-if="isSelected" />
        </button>
      </div>
      <h3 class="agent-name">{{ agent.name }}</h3>
      <p class="agent-description">{{ agent.description }}</p>
      <div class="agent-tags">
        <span v-for="tag in agent.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
    <div class="card-shine"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAgentSelection } from '../composables/useAgentSelection'
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ChartBarIcon,
  PaintBrushIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  CubeIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  agent: {
    type: Object,
    required: true
  }
})

const { toggleAgent, isAgentSelected } = useAgentSelection()

const isSelected = computed(() => isAgentSelected(props.agent.id))

const handleClick = () => {
  toggleAgent(props.agent.id)
}

const toggleSelection = () => {
  toggleAgent(props.agent.id)
}
</script>

<style scoped>
.agent-card {
  position: relative;
  cursor: pointer;
  min-height: 220px;
  border-radius: 14px;
  /* background: rgba(30, 39, 46, 0.6); */
  background: #080d19;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.agent-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 14px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.card-inner {
  position: relative;
  z-index: 1;
  padding: 18px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.agent-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px color-mix(in srgb, var(--agent-color) 20%, transparent);
}

.agent-card:hover .card-shine {
  opacity: 1;
}

.agent-card.selected {
  background: linear-gradient(135deg, color-mix(in srgb, var(--agent-color) 6%, transparent) 0%, color-mix(in srgb, var(--agent-color) 1%, transparent) 100%);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--agent-color) 20%, transparent), 0 0 0 1px color-mix(in srgb, var(--agent-color) 50%, transparent);
}

.agent-card.selected::before {
  background: linear-gradient(135deg, color-mix(in srgb, var(--agent-color) 50%, transparent), color-mix(in srgb, var(--agent-color) 20%, transparent));
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.agent-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  position: relative;
  background: rgba(255, 255, 255, 0.02);
}

.agent-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--icon-color);
  opacity: 0.15;
  border-radius: 50%;
  transition: opacity 0.3s;
}

.agent-card:hover .agent-icon::before {
  opacity: 0.25;
}

.agent-card.selected .agent-icon::before {
  opacity: 0.3;
}

.agent-icon :deep(svg) {
  width: 26px;
  height: 26px;
  stroke-width: 1.8;
  stroke: var(--icon-color);
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.select-indicator {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--agent-color);
  padding: 0;
  backdrop-filter: blur(4px);
}

.select-indicator:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.select-indicator.selected {
  background: linear-gradient(135deg, #6c5ce7 0%, #a855f7 100%);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);
}

.select-indicator :deep(svg) {
  width: 14px;
  height: 14px;
  stroke-width: 2.5;
}

.agent-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
  letter-spacing: 0.01em;
}

.agent-description {
  font-size: 13px;
  color: #a0aec0;
  line-height: 1.55;
  flex: 1;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.agent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.tag {
  padding: 4px 10px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  font-size: 11px;
  color: #b2bec3;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: all 0.2s;
}

.agent-card:hover .tag {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
}

.agent-card.selected .tag {
  background: color-mix(in srgb, var(--agent-color) 12%, transparent);
  border-color: color-mix(in srgb, var(--agent-color) 20%, transparent);
  color: color-mix(in srgb, var(--agent-color), white 80%);
}
</style>
