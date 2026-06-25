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

      <!-- Loading indicator - outside chat-content -->
      <div v-if="isInitialLoading && messages.length > 0" class="loading-container">
        <svg class="loading-spinner" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.3"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2"></path>
        </svg>
        <span>加载消息中...</span>
      </div>

      <div class="chat-content" ref="chatContent" :class="{ 'content-loading': isInitialLoading }">
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
            :class="[
              message.type === 'user' ? 'user-message' : 'agent-message',
              { 'message-with-image': message.responseType === 'image' }
            ]"
          >
            <div
              class="message-avatar"
              :class="{ 'agent-logo': message.type === 'agent', 'user-logo': message.type === 'user' }"
              :style="message.type === 'agent' && message.agentColor ? { background: message.agentColor } : {}"
            >
              <svg v-if="message.type === 'user'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <component v-else-if="message.agentIcon" :is="getAgentIcon(message.agentIcon)" />
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
                <template v-if="message.type === 'agent' && message.agentName">
                  {{ message.agentName }}
                </template>
                <template v-else-if="message.type === 'user'">
                  我
                </template>
              </div>
              <div class="message-text" :class="{ 'processing': message.isProcessing, 'message-text-with-image': message.responseType === 'image' }">
                <ResponseRenderer
                  v-if="!message.isProcessing && message.responseType"
                  :key="message.id"
                  :response-type="message.responseType"
                  :data="message.data"
                  :enable-typewriter="!!message.isNew"
                  :message-id="message.id"
                  @typing-complete="handleTypingComplete(message.id)"
                />
                <span v-else-if="message.isProcessing">{{ message.content }}</span>
                <span v-else-if="message.content">{{ message.content }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 滚动到底部按钮 -->
      <transition name="fade">
        <button
          v-if="showScrollButton"
          @click="handleScrollButtonClick"
          class="scroll-to-bottom-btn"
          :class="{ 'with-badge': scrollButtonBadge }"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
          </svg>
          <span v-if="scrollButtonBadge" class="scroll-badge">{{ scrollButtonBadge }}</span>
        </button>
      </transition>

      <div class="chat-input-bar">
        <div class="input-wrapper">
          <textarea
            ref="chatInput"
            v-model="inputText"
            @keydown="handleKeydown"
            @input="handleInput"
            placeholder="输入你的任务或问题。使用 @ 可指定特定 Agent 回答，不指定则所有 Agent 协作"
            class="chat-input"
            rows="3"
            :disabled="chatProcessing"
          ></textarea>
          <div class="input-actions">
            <button
              ref="atButton"
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
          <div
            v-for="agent in currentTeam?.agents || []"
            :key="agent.id"
            @click="selectMention(agent)"
            class="mention-item"
          >
            <div class="mention-agent-icon" :style="{ background: agent.color }">
              <component :is="getAgentIcon(agent.icon)" />
            </div>
            <div class="mention-agent-info">
              <div class="mention-agent-name">{{ agent.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useChat } from '../../composables/useChat'
import { useAgentSelection } from '../../composables/useAgentSelection'
import { useWorkspace } from '../../composables/useWorkspace'
import { useModal } from '../../composables/useModal'
import ResponseRenderer from '../common/ResponseRenderer.vue'
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

const route = useRoute()
const { currentTeam: createdTeam } = useAgentSelection()
const { teams } = useWorkspace()
const { messages, sendMessage, isProcessing: chatProcessing, setTeam } = useChat()
const { openCreateTeamModal } = useModal()

// 获取当前路由中的团队，如果没有则使用创建的团队
const currentTeam = computed(() => {
  const teamId = route.params.teamId
  if (teamId) {
    // 从团队列表中查找 - 统一使用字符串比较
    const found = teams.value.find(t => String(t.id) === String(teamId))
    if (found) {
      return {
        teamId: found.id,
        name: found.name,
        agents: found.agents || [],
        description: found.description,
        createdAt: found.createdAt || found.lastActivity
      }
    }
  }
  // 回退到创建的团队
  return createdTeam.value
})

const teamId = computed(() => route.params.teamId)

const inputText = ref('')
const chatContent = ref(null)
const chatInput = ref(null) // 聊天输入框引用
const atButton = ref(null) // @ 按钮引用
const mentionFromInput = ref(false) // 标记是否来自输入框的@

// 滚动相关状态
const isNearBottom = ref(true) // 用户是否在底部附近
const showScrollButton = ref(false) // 是否显示滚动按钮
const scrollButtonBadge = ref('') // 按钮上的徽章文字
const userScrolled = ref(false) // 用户是否手动滚动过
// originalPaddingBottom 已移除，新滚动逻辑不再使用 padding
const isInitialLoading = ref(false) // 首次加载消息时的加载状态

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

// 解析输入文本中的 @mentions
const parseMentions = (text) => {
  const mentionRegex = /@(\S+)/g
  const mentions = []
  let match
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1])
  }
  return mentions
}

const handleSend = async () => {
  if (!inputText.value.trim() || chatProcessing.value) return

  try {
    // 获取当前团队的 agents
    const allAgents = currentTeam.value?.agents || []

    // 解析 @mentions
    const mentions = parseMentions(inputText.value)

    // 如果有 @mentions，只让被 @ 的 agent 回答
    let respondingAgents = allAgents
    if (mentions.length > 0) {
      respondingAgents = allAgents.filter(agent =>
        mentions.some(mention => agent.name.includes(mention) || mention.includes(agent.name.replace(' Agent', '')))
      )
    }

    const sendPromise = sendMessage(inputText.value, respondingAgents)

    inputText.value = ''

    // 立即滚动，让用户看到自己的消息
    nextTick(() => {
      scrollAfterUserMessage()
    })

    await sendPromise

    // 回复完成后重置 padding
    resetPadding()
  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
  // ESC 键关闭 mention picker
  if (e.key === 'Escape' && mentionPickerOpen.value) {
    mentionPickerOpen.value = false
    mentionFromInput.value = false
  }
}

// 处理输入，检测 @ 符号
const handleInput = (e) => {
  const value = inputText.value
  const cursorPosition = e.target?.selectionStart || value.length

  // 检查刚输入的字符是否是 @
  const lastChar = value.charAt(cursorPosition - 1)
  if (lastChar === '@') {
    // 打开 mention picker
    mentionFromInput.value = true
    showMentionPickerAtCursor()
  }
}

// 在光标位置显示 mention picker
const showMentionPickerAtCursor = () => {
  if (!chatInput.value) return

  const textarea = chatInput.value
  const rect = textarea.getBoundingClientRect()

  // 计算光标位置（简化计算，基于文本框左侧）
  mentionPosition.value = {
    x: rect.left + 10, // 左侧偏移一点
    y: rect.top - 8 // 在输入框上方
  }

  nextTick(() => {
    mentionPickerOpen.value = true
  })
}

const toggleMentionPicker = () => {
  if (mentionPickerOpen.value) {
    // 关闭
    mentionPickerOpen.value = false
    mentionFromInput.value = false
    return
  }

  // 打开 - 来自按钮点击
  mentionFromInput.value = false
  if (atButton.value) {
    const rect = atButton.value.getBoundingClientRect()
    // 计算位置：在按钮左上方对齐
    mentionPosition.value = {
      x: rect.left,
      y: rect.top - 8  // 按钮上方留一点间距
    }
  }

  nextTick(() => {
    mentionPickerOpen.value = true
  })
}

const selectMention = (agent) => {
  if (mentionFromInput.value) {
    // 来自输入框的@，替换最后一个@符号
    const value = inputText.value
    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex !== -1) {
      inputText.value = value.substring(0, lastAtIndex) + `@${agent.name} ` + value.substring(lastAtIndex + 1).replace(/^[^\s]*/, '')
    }
  } else {
    // 来自按钮点击，追加到末尾
    inputText.value += `@${agent.name} `
  }

  mentionPickerOpen.value = false
  mentionFromInput.value = false

  // 聚焦回输入框
  nextTick(() => {
    if (chatInput.value) {
      chatInput.value.focus()
    }
  })
}

// ==================== 滚动逻辑 ====================

// 距离底部多少像素算作"在底部"
const BOTTOM_THRESHOLD = 100

// 检查用户是否在底部附近
const checkIfNearBottom = () => {
  if (!chatContent.value) return
  const { scrollTop, scrollHeight, clientHeight } = chatContent.value
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight
  isNearBottom.value = distanceFromBottom < BOTTOM_THRESHOLD
  showScrollButton.value = !isNearBottom.value
}

// 滚动到指定元素位置
const scrollToElement = (element, offset = 20) => {
  if (!chatContent.value || !element) return
  const targetScrollTop = element.offsetTop - offset
  chatContent.value.scrollTo({
    top: targetScrollTop,
    behavior: 'smooth'
  })
}

// 首屏滚动到最底部 - 无滚动痕迹
const scrollToBottomOnFirstLoad = () => {
  if (!chatContent.value) return

  const container = chatContent.value

  // 显示 loading 状态，隐藏内容
  isInitialLoading.value = true

  // 等待 DOM 完全渲染并稳定
  let lastScrollHeight = 0
  let stableCount = 0
  const maxAttempts = 50

  const waitForRenderComplete = (attempt = 0) => {
    if (!container) return

    const currentScrollHeight = container.scrollHeight

    // scrollHeight 稳定说明渲染完成
    if (currentScrollHeight === lastScrollHeight) {
      stableCount++
    } else {
      stableCount = 0
      lastScrollHeight = currentScrollHeight
    }

    // 连续 3 次检查 scrollHeight 没变化，说明渲染完成
    if (stableCount >= 3 || attempt >= maxAttempts) {
      // 多次修正滚动位置
      const setScrollPosition = () => {
        const scrollHeight = container.scrollHeight
        const clientHeight = container.clientHeight
        container.scrollTop = scrollHeight - clientHeight
      }

      setScrollPosition()

      // 多次设置确保准确
      requestAnimationFrame(() => {
        setScrollPosition()
        requestAnimationFrame(() => {
          setScrollPosition()
          // 隐藏 loading，显示内容
          requestAnimationFrame(() => {
            if (container) {
              isInitialLoading.value = false
              isNearBottom.value = true
              showScrollButton.value = false
            }
          })
        })
      })
      return
    }

    setTimeout(() => waitForRenderComplete(attempt + 1), 20)
  }

  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        waitForRenderComplete()
      })
    })
  })
}

// 滚动到底部 - 用于用户点击按钮时的平滑滚动
const scrollToBottom = () => {
  if (!chatContent.value) return

  chatContent.value.scrollTo({
    top: chatContent.value.scrollHeight,
    behavior: 'smooth'
  })

  isNearBottom.value = true
  showScrollButton.value = false
}

// 用户发送消息后滚动
const scrollAfterUserMessage = () => {
  nextTick(() => {
    const container = chatContent.value
    if (!container) return

    // 需要等待消息实际渲染到 DOM
    setTimeout(() => {
      // 获取所有消息元素
      const messageElements = container.querySelectorAll('.chat-content > .message')
      const lastMessage = messageElements[messageElements.length - 1]

      if (!lastMessage) {
        console.warn('[scrollAfterUserMessage] No message element found')
        return
      }

      // 获取消息位置和容器尺寸
      const messageTop = lastMessage.offsetTop
      const messageHeight = lastMessage.offsetHeight
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight
      const maxScrollTop = scrollHeight - clientHeight

      console.log('[scrollAfterUserMessage] State:', {
        messageTop,
        messageHeight,
        scrollHeight,
        clientHeight,
        maxScrollTop
      })

      // 计算目标滚动位置：让用户消息出现在视口上方 50% 的位置
      const desiredScrollTop = messageTop - (clientHeight * 0.5)

      // 检查是否需要添加 padding 来实现期望的滚动位置
      if (desiredScrollTop > maxScrollTop) {
        // 需要添加 padding 扩大滚动范围
        const neededPadding = desiredScrollTop - maxScrollTop
        const currentPadding = parseInt(getComputedStyle(container).paddingBottom) || 0

        // 临时添加 padding
        container.style.paddingBottom = (currentPadding + neededPadding + 50) + 'px'

        // 等待 padding 应用后滚动
        setTimeout(() => {
          const newScrollHeight = container.scrollHeight
          const newMaxScrollTop = newScrollHeight - clientHeight

          container.scrollTo({
            top: newMaxScrollTop,
            behavior: 'auto'
          })

          console.log('[scrollAfterUserMessage] With padding:', {
            addedPadding: neededPadding + 50,
            newMaxScrollTop,
            scrollTo: newMaxScrollTop
          })

          // 延迟移除 padding
          setTimeout(() => {
            container.style.paddingBottom = currentPadding + 'px'
          }, 200)
        }, 50)
      } else {
        // 不需要 padding，直接滚动
        container.scrollTo({
          top: Math.max(0, desiredScrollTop),
          behavior: 'auto'
        })

        console.log('[scrollAfterUserMessage] Direct scroll to:', Math.max(0, desiredScrollTop))
      }

      userScrolled.value = false
      isNearBottom.value = false
      showScrollButton.value = true
    }, 50)
  })
}

// 重置 padding 到原始值（保留以防万一）
const resetPadding = () => {
  // 新逻辑不再使用 padding，此函数保留为空函数以保持兼容性
}

// Get agent icon component
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

// 处理滚动事件
const handleScroll = () => {
  checkIfNearBottom()
  if (!isNearBottom.value) {
    userScrolled.value = true
  }
}

// 点击滚动按钮
const handleScrollButtonClick = () => {
  scrollToBottom()
}

// 处理打字完成事件
const handleTypingComplete = (messageId) => {
  console.log('[Typing Complete] Message ID:', messageId)
  // 可以在这里添加打字完成后的处理逻辑
  // 目前暂时不需要额外处理，因为我们在 useChat 中已经添加了延迟
}

// 监听团队变化，加载对应的聊天数据
watch(teamId, (newTeamId, oldTeamId) => {
  console.log('[Team Watch] teamId 变化:', { oldTeamId, newTeamId })

  if (newTeamId && newTeamId !== oldTeamId) {
    console.log('[Team Watch] 开始切换团队:', newTeamId)

    // 设置团队并加载数据
    setTeam(newTeamId.toString())

    console.log('[Team Watch] setTeam 完成，消息数量:', messages.value.length)

    // 每次切换团队都执行滚动
    nextTick(() => {
      console.log('[Team Watch] nextTick 后，消息数量:', messages.value.length)
      if (messages.value.length > 0) {
        console.log('[Team Watch] 调用 scrollToBottomOnFirstLoad')
        scrollToBottomOnFirstLoad()
      } else {
        console.log('[Team Watch] 没有消息，跳过滚动')
      }
    })
  }
}, { immediate: true })

// 监听消息变化
watch(() => messages.value, (newMessages, oldMessages = []) => {
  // Agent 响应时不做任何滚动操作
  // 用户消息的滚动在 handleSend 中处理
}, { deep: true })

// Auto-scroll when messages change
onMounted(() => {
  // 添加滚动监听
  if (chatContent.value) {
    chatContent.value.addEventListener('scroll', handleScroll)
  }

  // 点击外部关闭 picker
  const handleClickOutside = (e) => {
    if (mentionPickerOpen.value) {
      const picker = document.querySelector('.mention-picker')
      const atBtn = atButton.value
      const textarea = chatInput.value

      // 如果点击的不是 picker、@按钮或输入框，关闭 picker
      if (picker && !picker.contains(e.target) &&
          atBtn && !atBtn.contains(e.target) &&
          textarea && !textarea.contains(e.target)) {
        mentionPickerOpen.value = false
        mentionFromInput.value = false
      }
    }
  }

  document.addEventListener('click', handleClickOutside)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    if (chatContent.value) {
      chatContent.value.removeEventListener('scroll', handleScroll)
    }
  })
})
</script>

<style scoped>
.center-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0f141f;
  overflow: hidden;
  position: relative;
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
  width: 96px;
  height: 96px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
}

.empty-icon svg {
  width: 48px;
  height: 48px;
  color: #a5b4fc;
}

.empty-title {
  font-size: 22px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 14px;
}

.empty-text {
  font-size: 15px;
  color: #64748b;
  margin-bottom: 28px;
}

.create-team-btn {
  padding: 13px 26px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
}

.create-team-btn svg {
  width: 18px;
  height: 18px;
}

.create-team-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.15);
}

.team-info {
  flex: 1;
}

.team-title {
  font-size: 20px;
  font-weight: 700;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.dropdown-icon {
  width: 18px;
  height: 18px;
  color: #6b7280;
}

.team-meta {
  display: flex;
  gap: 18px;
  font-size: 13px;
  color: #64748b;
}

.agent-count {
  color: #a5b4fc;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.share-btn {
  padding: 10px 18px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.share-btn svg {
  width: 16px;
  height: 16px;
}

.share-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
}

.more-btn {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.more-btn svg {
  width: 18px;
  height: 18px;
}

.more-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow-anchor: none;
  position: relative;
}

.chat-content.content-loading {
  opacity: 0;
}

.chat-content::-webkit-scrollbar {
  width: 6px;
}

.chat-content::-webkit-scrollbar-track {
  background: transparent;
}

.chat-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
}

.chat-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.12);
}

.welcome-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
}

/* Loading container - outside chat-content */
.loading-container {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #94a3b8;
  z-index: 10;
  font-size: 14px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  color: #6366f1;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  color: #6366f1;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.welcome-icon {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}

.welcome-icon svg {
  width: 36px;
  height: 36px;
  stroke: white;
}

.welcome-title {
  font-size: 22px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 14px;
}

.welcome-text {
  font-size: 15px;
  color: #94a3b8;
  margin-bottom: 10px;
}

.welcome-hint {
  font-size: 14px;
  color: #64748b;
}

.message {
  display: flex;
  gap: 14px;
  max-width: 75%;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.agent-message {
  align-self: flex-start;
}

/* 包含图片的消息可以更宽 */
.message-with-image {
  max-width: 90%;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
  background: #1e293b;
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

.user-logo {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-logo svg {
  width: 18px;
  height: 18px;
  stroke: white;
}

.agent-logo svg {
  width: 18px;
  height: 18px;
  stroke: white;
  position: relative;
  z-index: 1;
}

.agent-initial {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  color: white;
}

.message-body {
  flex: 1;
}

.message-time {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
}

.user-message .message-time {
  text-align: right;
}

.message-text {
  padding: 14px 18px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  color: #e2e8f0;
  font-size: 15px;
  line-height: 1.6;
  border: 1px solid rgba(255, 255, 255, 0.05);
  max-width: 100%;
  overflow-wrap: break-word;
  word-break: break-word;
}

.message-text.processing {
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 包含图片的消息文本容器可以更宽 */
.message-text-with-image {
  /* 移除之前的样式，现在所有消息统一使用 600px 宽度 */
}

.message-text.processing::after {
  content: '';
  width: 14px;
  height: 14px;
  border: 2px solid #6366f1;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.agent-message .message-text {
  max-width: 600px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 14px 18px;
}

.user-message .message-text {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  max-width: 600px;
}

.task-output-card {
  display: flex;
  gap: 18px;
  padding: 22px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  margin: 10px 0;
}

.task-card-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.market-icon {
  background: rgba(99, 102, 241, 0.15);
}

.market-icon svg {
  width: 26px;
  height: 26px;
  stroke: #818cf8;
}

.document-icon {
  background: rgba(139, 92, 246, 0.15);
}

.document-icon svg {
  width: 26px;
  height: 26px;
  stroke: #a78bfa;
}

.task-card-content {
  flex: 1;
}

.task-card-title {
  font-size: 17px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 14px;
}

.task-card-body {
  font-size: 15px;
  color: #94a3b8;
  line-height: 1.8;
}

.task-card-body ul {
  margin: 0;
  padding-left: 22px;
}

.task-card-body li {
  margin-bottom: 10px;
}

.task-card-body p {
  margin: 0;
}

.download-btn {
  margin-top: 18px;
  padding: 12px 18px;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 10px;
  color: #a5b4fc;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-btn svg {
  width: 18px;
  height: 18px;
}

.download-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4);
}

.file-size {
  color: #64748b;
  font-weight: 400;
}

.chat-input-bar {
  padding: 12px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.15);
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.chat-input {
  width: 100%;
  min-height: 80px;
  max-height: 160px;
  padding: 16px 18px;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
  font-size: 15px;
  outline: none;
  resize: none;
  line-height: 1.6;
  font-family: inherit;
}

.chat-input::placeholder {
  color: #64748b;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(15, 20, 31, 0.4);
}

.at-btn {
  width: 40px;
  height: 40px;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 10px;
  color: #a5b4fc;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.at-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4);
}

.send-btn {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.send-btn svg {
  width: 18px;
  height: 18px;
}

.send-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.send-btn:disabled {
  background: #334155;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.at-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.chat-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mention picker */
.mention-picker {
  position: fixed;
  transform: translateY(-100%);  /* 向上偏移完整高度 */
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  width: 200px;
  max-height: 240px;
  overflow-y: auto;
  z-index: 1000;
  padding: 3px;
}

.mention-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
}

.mention-item:hover {
  background: rgba(99, 102, 241, 0.1);
}

.mention-agent-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mention-agent-icon svg {
  width: 14px;
  height: 14px;
  stroke: white;
}

.mention-agent-info {
  flex: 1;
  min-width: 0;
}

.mention-agent-name {
  font-size: 12px;
  font-weight: 500;
  color: #f1f5f9;
}

/* 滚动到底部按钮 */
.scroll-to-bottom-btn {
  position: absolute;
  bottom: 100px;
  right: 30px;
  width: 44px;
  height: 44px;
  background: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: #a5b4fc;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 10;
}

.scroll-to-bottom-btn:hover {
  background: rgba(99, 102, 241, 0.9);
  border-color: rgba(99, 102, 241, 0.3);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.scroll-to-bottom-btn svg {
  width: 20px;
  height: 20px;
}

.scroll-to-bottom-btn.with-badge {
  width: auto;
  min-width: 44px;
  padding: 0 12px;
  gap: 6px;
  border-radius: 22px;
}

.scroll-badge {
  font-size: 12px;
  font-weight: 500;
  color: #a5b4fc;
}

.scroll-to-bottom-btn:hover .scroll-badge {
  color: white;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
