<template>
  <transition name="progress-fade">
    <div v-if="phase" class="task-progress">
      <template v-for="(step, i) in steps" :key="step.key">
        <div class="tp-step" :class="{ done: i < currentIndex, current: i === currentIndex }">
          <span class="tp-dot">
            <CheckIcon v-if="i < currentIndex" />
          </span>
          <span class="tp-label">{{ step.label }}</span>
        </div>
        <span v-if="i < steps.length - 1" class="tp-connector" :class="{ done: i < currentIndex }"></span>
      </template>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { CheckIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  // 当前协议阶段：announce / bid / execute / done
  phase: {
    type: String,
    default: null
  }
})

const steps = [
  { key: 'announce', label: '发布' },
  { key: 'bid', label: '能力检查' },
  { key: 'execute', label: '执行' },
  { key: 'done', label: '完成' }
]

const currentIndex = computed(() => {
  const idx = steps.findIndex(s => s.key === props.phase)
  return idx === -1 ? steps.length - 1 : idx
})
</script>

<style scoped>
/* 任务运行时的瞬时进度带：回答「现在到哪一步了」，结束后整体淡出，不留在聊天流里 */
.task-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  margin: 0 14px 8px;
  background: rgba(99, 102, 241, 0.06);
  border: 1px solid rgba(99, 102, 241, 0.18);
  border-radius: 10px;
}

.tp-step {
  display: flex;
  align-items: center;
  gap: 5px;
}

.tp-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.18);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.tp-dot svg {
  width: 10px;
  height: 10px;
  stroke: #0f141f;
}

.tp-step.done .tp-dot {
  background: #34d399;
  border-color: #34d399;
}

.tp-step.current .tp-dot {
  border-color: #818cf8;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.5);
}

.tp-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  transition: color 0.25s ease;
}

.tp-step.current .tp-label {
  color: #a5b4fc;
  font-weight: 600;
}

.tp-step.done .tp-label {
  color: #6ee7b7;
}

.tp-connector {
  width: 22px;
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
}

.tp-connector.done {
  background: rgba(52, 211, 153, 0.6);
}

/* 整条进度带的淡入淡出 */
.progress-fade-enter-active,
.progress-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.progress-fade-enter-from,
.progress-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
