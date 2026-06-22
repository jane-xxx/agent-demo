<!-- src/components/workspace/CreateTeamModal.vue -->
<template>
  <BaseModal :is-open="isOpen" title="新建团队" @close="close">
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
      <div class="form-group">
        <label class="form-label">团队描述（可选）</label>
        <textarea
          v-model="teamDescription"
          class="form-textarea"
          placeholder="请输入团队描述"
          rows="3"
          maxlength="200"
        ></textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="close">取消</button>
        <button type="submit" class="btn-submit" :disabled="!teamName.trim()">创建</button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import BaseModal from '../common/BaseModal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'create'])

const teamName = ref('')
const teamDescription = ref('')

const close = () => {
  emit('close')
  teamName.value = ''
  teamDescription.value = ''
}

const handleSubmit = () => {
  if (!teamName.value.trim()) return

  emit('create', {
    name: teamName.value.trim(),
    description: teamDescription.value.trim()
  })

  teamName.value = ''
  teamDescription.value = ''
}
</script>

<style scoped>
.create-team-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #e0e0e0;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  background: #0d111c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #5b6cff;
  box-shadow: 0 0 0 3px rgba(91, 108, 255, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #6b7280;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn-cancel,
.btn-submit {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
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
