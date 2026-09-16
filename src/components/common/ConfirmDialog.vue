<!-- src/components/common/ConfirmDialog.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="confirm-overlay" @click.self="cancel">
        <div class="confirm-container">
          <h3 class="confirm-title">{{ title }}</h3>
          <p class="confirm-message">{{ message }}</p>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="cancel">取消</button>
            <button class="btn-confirm" @click="confirm">删除</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: '确认操作'
  },
  message: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const confirm = () => {
  emit('confirm')
}

const cancel = () => {
  emit('cancel')
}

// 支持 Esc 取消
const onKeydown = (e) => {
  if (e.key === 'Escape' && props.isOpen) cancel()
}
window.addEventListener('keydown', onKeydown)
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 20px;
}

.confirm-container {
  background: #1a2130;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  max-width: 320px;
  width: 100%;
  padding: 14px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.confirm-title {
  font-size: 16px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 6px;
}

.confirm-message {
  font-size: 14px;
  color: #94a3b8;
  margin: 0 0 14px;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-cancel {
  background: transparent;
  border: none;
  color: #94a3b8;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
}

.btn-confirm {
  background: #ef4444;
  border: none;
  color: white;
}

.btn-confirm:hover {
  background: #dc2626;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .confirm-container,
.modal-leave-to .confirm-container {
  transform: scale(0.96);
}

.modal-enter-active .confirm-container,
.modal-leave-active .confirm-container {
  transition: transform 0.2s ease;
}
</style>
