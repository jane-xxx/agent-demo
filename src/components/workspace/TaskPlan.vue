<template>
  <section class="task-plan" aria-label="协作计划">
    <button class="plan-heading" @click="expanded = !expanded" :aria-expanded="expanded" :aria-controls="'plan-' + message.id">
      <span class="plan-icon">◇</span>
      <span class="plan-heading-text"><strong>协作计划</strong><span>{{ summary }}</span></span>
      <span class="plan-chevron" :class="{ expanded }">⌄</span>
    </button>
    <div v-if="expanded" :id="'plan-' + message.id" class="plan-body">
      <ol class="plan-steps">
        <li v-for="(step, index) in message.subtasks" :key="step.key || index" class="plan-step" :class="'state-' + step.status">
          <span class="step-marker">{{ step.status === 'completed' ? '✓' : index + 1 }}</span>
          <div class="step-content">
            <div class="step-title"><strong>{{ step.name }}</strong><span class="step-status">{{ statusLabel(step.status) }}</span></div>
            <p class="step-owner"><span v-if="step.agent" class="owner-dot" :style="{ background: step.agent.color || '#818cf8' }"></span>{{ step.agent?.name || '待补充：' + (step.capabilityLabel || '专业成员') }}</p>
            <p v-if="step.deliverable" class="step-deliverable">交付：{{ step.deliverable }}</p>
            <p v-if="step.dependencies?.length" class="step-dependency">使用上游：{{ step.dependencies.map(key => message.subtasks.find(s => s.key === key)?.name || key).join('、') }}</p>
            <button v-if="step.resultId" class="result-link" @click="$emit('view-result', step.resultId)">查看交付 ↗</button>
          </div>
        </li>
      </ol>
      <p v-if="message.planStatus === 'awaiting_choice'" class="plan-note">请在下方能力提示中选择补充成员或调整任务。</p>
      <p v-else-if="message.planStatus === 'cancelled'" class="plan-note">这份计划已停止，可修改任务后重新发起。</p>
      <p v-else class="plan-note">按依赖顺序执行，下游使用上游交付。</p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
const props = defineProps({ message: { type: Object, required: true } })
defineEmits(['view-result'])
const expanded = ref(['planned', 'running', 'awaiting_choice'].includes(props.message.planStatus))
const finished = new Set(['completed', 'partial', 'needs_info', 'failed', 'cancelled'])
watch(() => props.message.planStatus, status => { if (finished.has(status)) expanded.value = false })
const statusLabel = status => ({ ready: '待执行', running: '执行中', completed: '已交付', uncovered: '缺少成员', blocked: '等待上游', needs_info: '待补充信息', failed: '执行失败', cancelled: '已停止' }[status] || '待执行')
const summary = computed(() => {
  const steps = props.message.subtasks || []
  const missing = steps.filter(s => s.status === 'uncovered').length
  const labels = { running: '执行中', completed: '已完成', partial: '部分完成', needs_info: '待补充信息', failed: '执行失败', cancelled: '已停止' }
  if (props.message.planStatus === 'awaiting_choice') return steps.length + ' 个步骤 · 缺少 ' + missing + ' 项能力'
  return steps.length + ' 个步骤 · ' + (props.message.planStatus === 'historical' ? '历史计划' : labels[props.message.planStatus] || '分工已安排')
})
</script>

<style scoped>
.task-plan { align-self: stretch; border: 1px solid #30354b; border-radius: 14px; background: linear-gradient(135deg, #171b2b, #131722); flex-shrink: 0; overflow: hidden; }
.plan-heading { display: flex; gap: 12px; align-items: center; width: 100%; padding: 14px 16px; border: 0; background: transparent; text-align: left; color: #e2e8f0; cursor: pointer; }
.plan-heading:hover { background: #ffffff04; }
.plan-heading:focus-visible, .result-link:focus-visible { outline: 2px solid #a5b4fc; outline-offset: -3px; }
.plan-icon { width: 30px; height: 30px; display: grid; place-items: center; background: #6366f11c; color: #a5b4fc; border-radius: 9px; font-size: 24px; flex-shrink: 0; }
.plan-heading-text { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
.plan-heading-text strong { font-size: 14px; }
.plan-heading-text > span { color: #94a3b8; font-size: 12px; line-height: 1.5; }
.plan-chevron { color: #94a3b8; font-size: 22px; transition: transform .2s; }
.plan-chevron.expanded { transform: rotate(180deg); }
.plan-body { padding: 0 16px 12px; }
.plan-steps { list-style: none; padding: 0; margin: 0; }
.plan-step { display: flex; gap: 12px; padding: 12px 0; position: relative; }
.plan-step + .plan-step { border-top: 1px solid #ffffff08; }
.step-marker { margin-top: 1px; width: 24px; height: 24px; display: grid; place-items: center; flex-shrink: 0; border: 1px solid #434963; border-radius: 50%; font-size: 11px; color: #a5b4fc; }
.step-content { flex: 1; min-width: 0; }
.step-title { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.step-title strong { font-size: 13px; color: #e2e8f0; }
.step-status { font-size: 11px; padding: 3px 7px; border-radius: 5px; background: #ffffff06; color: #94a3b8; }
.step-content p { margin: 6px 0 0; font-size: 12px; line-height: 1.6; overflow-wrap: anywhere; }
.step-owner { display: flex; align-items: center; gap: 6px; color: #cbd5e1; }
.owner-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.step-deliverable { color: #94a3b8; }
.step-dependency { color: #73819a; font-size: 11px !important; }
.state-completed .step-marker { background: #34d39914; border-color: #34d39955; color: #6ee7b7; }
.state-completed .step-status { color: #6ee7b7; background: #34d39910; }
.state-running .step-marker { border-color: #818cf8; box-shadow: 0 0 0 3px #818cf812; }
.state-running .step-status { color: #a5b4fc; background: #6366f11c; }
.state-uncovered .step-status, .state-needs_info .step-status { color: #f5ce88; background: #f5ce8810; }
.state-failed .step-status { color: #fda4af; }
.result-link { border: 0; background: transparent; color: #a5b4fc; padding: 5px 0 0; font-size: 12px; cursor: pointer; }
.plan-note { padding-top: 10px; border-top: 1px solid #ffffff08; margin: 4px 0 0; font-size: 11px; line-height: 1.6; color: #73819a; }
</style>
