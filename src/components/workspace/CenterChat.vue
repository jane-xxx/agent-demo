<template>
  <div class="center-chat">
    <!-- Empty state when no team -->
    <div v-if="!teamId" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <h3 class="empty-title">还没有团队</h3>
      <p class="empty-text">创建一个团队并选择 Agent，开始协作</p>
      <button @click="openCreateTeamModal" class="create-team-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        去创建团队
      </button>
    </div>

    <template v-else>
      <div class="chat-header">
        <div class="team-info">
          <h2 class="team-title">
            {{ currentTeam?.name || '未命名团队' }}
          </h2>
          <div class="team-meta">
            <span class="agent-count">{{ currentTeam?.agents?.length || 0 }} 个 Agent</span>
            <span class="create-time">创建于 {{ formatDate(currentTeam?.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div class="chat-content" ref="chatContent">
        <!-- Welcome message when no messages -->
        <div v-if="messages.length === 0" class="welcome-state">
          <div class="welcome-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h3 class="welcome-title">欢迎使用 {{ currentTeam?.name || 'MultiAgent' }}</h3>
          <p class="welcome-text">您已成功创建团队，包含 {{ currentTeam?.agents?.length || 0 }} 个 Agent</p>
          <p class="welcome-hint">在下方输入框中输入任务，开始与您的 AI 团队协作</p>
        </div>

        <!-- Message list -->
        <template v-else>
          <div
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="message.type === 'user' ? 'user-message' : 'agent-message'"
          >
            <div
              class="message-avatar"
              :class="{ 'agent-logo': message.type === 'agent' }"
              :style="message.type === 'agent' && message.agentColor ? { background: message.agentColor } : {}"
            >
              <svg v-if="message.type === 'user'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <div v-else-if="message.agentName" class="agent-initial">
                {{ message.agentName.charAt(0) }}
              </div>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div class="message-body">
              <div class="message-time">
                {{ message.agentName || message.timestamp }}
              </div>
              <div class="message-text" :class="{ 'processing': message.isProcessing }">
                {{ message.content }}
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="chat-input-bar">
        <div class="input-wrapper">
          <textarea
            v-model="inputText"
            @keydown="handleKeydown"
            placeholder="输入你的任务或问题，使用 @ 提及特定 Agent"
            class="chat-input"
            rows="3"
            :disabled="chatProcessing"
          ></textarea>
          <div class="input-actions">
            <button
              @click="toggleMentionPicker"
              class="at-btn"
              :disabled="chatProcessing"
            >
              @
            </button>
            <button
              @click="handleSend"
              class="send-btn"
              :disabled="!inputText.trim() || chatProcessing"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mention picker -->
        <div
          v-if="mentionPickerOpen"
          class="mention-picker"
          :style="{ top: mentionPosition.y + 'px', left: mentionPosition.x + 'px' }"
        >
          <div class="mention-header">选择 Agent</div>
          <div
            v-for="agent in currentTeam?.agents || []"
            :key="agent.id"
            @click="selectMention(agent)"
            class="mention-item"
          >
            <div class="mention-agent-icon" :style="{ background: agent.color }">
              {{ agent.name.charAt(0) }}
            </div>
            <div class="mention-agent-info">
              <div class="mention-agent-name">{{ agent.name }}</div>
              <div class="mention-agent-desc">{{ agent.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useChat } from '../../composables/useChat'
import { useAgentSelection } from '../../composables/useAgentSelection'
import { useWorkspace } from '../../composables/useWorkspace'
import { useModal } from '../../composables/useModal'

const route = useRoute()
const { currentTeam: createdTeam } = useAgentSelection()
const { teams } = useWorkspace()
const { messages, sendMessage, isProcessing: chatProcessing } = useChat()
const { openCreateTeamModal } = useModal()

// 获取当前路由中的团队，如果没有则使用创建的团队
const currentTeam = computed(() => {
  const teamId = route.params.teamId
  if (teamId) {
    // 从团队列表中查找
    const found = teams.value.find(t => t.id === parseInt(teamId) || t.id === teamId)
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

const teamId = computed(() => route.params.teamId)
const inputText = ref('')
const chatContent = ref(null)

// Mention picker state
const mentionPickerOpen = ref(false)
const mentionPosition = ref({ x: 0, y: 0 })

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-')
}

const handleSend = async () => {
  if (!inputText.value.trim() || chatProcessing.value) return

  try {
    // 获取当前团队的 agents
    const agents = currentTeam.value?.agents || []
    await sendMessage(inputText.value, agents)
    inputText.value = ''
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

const scrollToBottom = () => {
  if (chatContent.value) {
    chatContent.value.scrollTop = chatContent.value.scrollHeight
  }
}

const toggleMentionPicker = () => {
  mentionPickerOpen.value = !mentionPickerOpen.value
  if (mentionPickerOpen.value) {
    // Position the picker above the input
    mentionPosition.value = {
      x: 100,
      y: -200
    }
  }
}

const selectMention = (agent) => {
  inputText.value += `@${agent.name} `
  mentionPickerOpen.value = false
}

// Auto-scroll when messages change
onMounted(() => {
  scrollToBottom()
})

// Watch for new messages
import { watch } from 'vue'
watch(messages, () => {
  nextTick(() => scrollToBottom())
}, { deep: true })
</script>

<style scoped>
.center-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #121826;
  overflow: hidden;
}

/* Empty state */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: rgba(91, 108, 255, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-icon svg {
  width: 40px;
  height: 40px;
  color: #5b6cff;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #a0aec0;
  margin-bottom: 24px;
}

.create-team-btn {
  padding: 12px 24px;
  background: #5b6cff;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.create-team-btn svg {
  width: 16px;
  height: 16px;
}

.create-team-btn:hover {
  background: #4a5bf0;
  transform: translateY(-1px);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.team-info {
  flex: 1;
}

.team-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.team-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #8a8a8a;
}

.agent-count {
  color: #5b6cff;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.share-btn {
  padding: 8px 16px;
  background: #5b6cff;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.share-btn svg {
  width: 14px;
  height: 14px;
}

.share-btn:hover {
  background: #4a5bf0;
}

.more-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #8a8a8a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-btn svg {
  width: 16px;
  height: 16px;
}

.more-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e0e0e0;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.welcome-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
}

.welcome-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #5b6cff, #7c3aed);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.welcome-icon svg {
  width: 32px;
  height: 32px;
  stroke: white;
}

.welcome-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.welcome-text {
  font-size: 14px;
  color: #a0aec0;
  margin-bottom: 8px;
}

.welcome-hint {
  font-size: 13px;
  color: #6b7280;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.agent-message {
  align-self: flex-start;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
  background: #1a2130;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.agent-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.agent-logo svg {
  width: 18px;
  height: 18px;
  stroke: white;
}

.agent-initial {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.message-body {
  flex: 1;
}

.message-time {
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 4px;
}

.user-message .message-time {
  text-align: right;
}

.message-text {
  padding: 12px 16px;
  background: #1a2130;
  border-radius: 12px;
  color: #e0e0e0;
  font-size: 14px;
  line-height: 1.6;
}

.message-text.processing {
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-text.processing::after {
  content: '';
  width: 12px;
  height: 12px;
  border: 2px solid #5b6cff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.user-message .message-text {
  background: #5b6cff;
  color: white;
}

.task-output-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #1a2130;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin: 8px 0;
}

.task-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.market-icon {
  background: rgba(91, 108, 255, 0.15);
}

.market-icon svg {
  width: 24px;
  height: 24px;
  stroke: #5b6cff;
}

.document-icon {
  background: rgba(124, 58, 237, 0.15);
}

.document-icon svg {
  width: 24px;
  height: 24px;
  stroke: #7c3aed;
}

.task-card-content {
  flex: 1;
}

.task-card-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.task-card-body {
  font-size: 14px;
  color: #a0aec0;
  line-height: 1.8;
}

.task-card-body ul {
  margin: 0;
  padding-left: 20px;
}

.task-card-body li {
  margin-bottom: 8px;
}

.task-card-body p {
  margin: 0;
}

.download-btn {
  margin-top: 16px;
  padding: 10px 16px;
  background: rgba(91, 108, 255, 0.15);
  border: 1px solid rgba(91, 108, 255, 0.3);
  border-radius: 8px;
  color: #5b6cff;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.download-btn svg {
  width: 16px;
  height: 16px;
}

.download-btn:hover {
  background: rgba(91, 108, 255, 0.25);
  border-color: rgba(91, 108, 255, 0.5);
}

.file-size {
  color: #8a8a8a;
  font-weight: 400;
}

.chat-input-bar {
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  background: #1a2130;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.chat-input {
  width: 100%;
  min-height: 72px;
  max-height: 150px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  font-size: 14px;
  outline: none;
  resize: none;
  line-height: 1.5;
  font-family: inherit;
}

.chat-input::placeholder {
  color: #6b7280;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgba(26, 33, 48, 0.5);
}

.at-btn {
  width: 36px;
  height: 36px;
  background: rgba(91, 108, 255, 0.15);
  border: 1px solid rgba(91, 108, 255, 0.3);
  border-radius: 8px;
  color: #5b6cff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.at-btn:hover {
  background: rgba(91, 108, 255, 0.25);
  border-color: rgba(91, 108, 255, 0.5);
}

.send-btn {
  width: 36px;
  height: 36px;
  background: #5b6cff;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn svg {
  width: 16px;
  height: 16px;
}

.send-btn:hover {
  background: #4a5bf0;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #3a4a5f;
  cursor: not-allowed;
  transform: none;
}

.at-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mention picker */
.mention-picker {
  position: absolute;
  background: #1a2130;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  width: 300px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
}

.mention-header {
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mention-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.mention-item:last-child {
  border-bottom: none;
}

.mention-item:hover {
  background: rgba(91, 108, 255, 0.1);
}

.mention-agent-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.mention-agent-info {
  flex: 1;
  min-width: 0;
}

.mention-agent-name {
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin-bottom: 2px;
}

.mention-agent-desc {
  font-size: 12px;
  color: #8a8a8a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
