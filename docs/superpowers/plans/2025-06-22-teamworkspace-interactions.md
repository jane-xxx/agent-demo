# TeamWorkspace 交互功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 TeamWorkspace 页面添加完整的交互功能，包括团队切换、聊天、Agent 管理等，采用混合模式为未来 API 集成预留接口。

**Architecture:** 复用现有 useAgentSelection composable，新增 useWorkspace 和 useChat 管理工作区状态，创建可复用的模态框组件，修改现有工作区组件添加交互逻辑。

**Tech Stack:** Vue 3 Composition API, Vue Router 4 (hash 模式), Heroicons

## Global Constraints

- Vue 3 Composition API (script setup)
- Vue Router 4 使用 createWebHashHistory
- 复用现有 useAgentSelection.js 中的 AGENTS 和 currentTeam 状态
- 所有交互使用模拟数据，预留 async 函数接口供未来 API 集成
- 使用现有配色方案 (#5b6cff, #7c3aed 等)
- 组件文件使用 PascalCase, composable 文件使用 camelCase 带 'use' 前缀

---

## 文件结构映射

### 新建文件
| 文件 | 职责 |
|------|------|
| `src/composables/useWorkspace.js` | 工作区团队列表、搜索、Agent 状态管理 |
| `src/composables/useChat.js` | 聊天消息管理、发送逻辑 |
| `src/composables/useModal.js` | 模态框状态管理 |
| `src/utils/constants.js` | 模拟数据、常量配置 |
| `src/components/common/BaseModal.vue` | 模态框容器基类 |
| `src/components/common/ConfirmDialog.vue` | 通用确认对话框 |
| `src/components/common/AgentMentionPicker.vue` | @提及选择器 |
| `src/components/workspace/CreateTeamModal.vue` | 创建团队模态框 |
| `src/components/workspace/AgentDetailModal.vue` | Agent 详情模态框 |

### 修改文件
| 文件 | 修改内容 |
|------|------|
| `src/router/index.js` | 改为 hash 模式，teamId 可选参数 |
| `src/composables/useAgentSelection.js` | 添加 teams 状态管理 |
| `src/views/TeamWorkspace.vue` | 添加空状态，集成模态框 |
| `src/components/workspace/LeftSidebar.vue` | 添加点击切换、搜索过滤、新建按钮 |
| `src/components/workspace/CenterChat.vue` | 添加消息发送、@提及功能 |
| `src/components/workspace/RightSidebar.vue` | 添加 Agent 详情、状态切换、移除、日志操作 |

---

## Task 1: 创建常量和模拟数据

**Files:**
- Create: `src/utils/constants.js`

**Interfaces:**
- Produces: `TEAM_LOGS` (日志模板数据), `AGENT_CAPABILITIES` (Agent 能力描述), `EMPTY_TEAM_STATE` (空状态配置)

- [ ] **Step 1: 创建 constants.js 文件**

```javascript
// src/utils/constants.js

// Agent 能力描述映射
export const AGENT_CAPABILITIES = {
  1: {
    capability: '擅长自然语言对话，理解上下文，提供流畅的交互体验',
    recentActivities: ['完成了客户咨询对话', '处理了多轮问答'],
    stats: { tasksCompleted: 8, onlineHours: 2.5 }
  },
  2: {
    capability: '专业的研究分析助手，快速搜索、整理和分析各类信息',
    recentActivities: ['完成了市场调研', '生成了竞品分析报告'],
    stats: { tasksCompleted: 12, onlineHours: 4.2 }
  },
  3: {
    capability: '专业的文案创作助手，支持多种文体和风格的写作',
    recentActivities: ['撰写了产品文案', '生成了营销邮件'],
    stats: { tasksCompleted: 6, onlineHours: 1.8 }
  },
  4: {
    capability: '专业的代码助手，支持多种编程语言和开发任务',
    recentActivities: ['修复了代码bug', '编写了API文档'],
    stats: { tasksCompleted: 15, onlineHours: 5.0 }
  },
  5: {
    capability: '数据分析专家，处理复杂数据集并提供可视化洞察',
    recentActivities: ['分析了销售数据', '生成了可视化报表'],
    stats: { tasksCompleted: 9, onlineHours: 3.1 }
  },
  6: {
    capability: '创意设计助手，提供设计灵感和视觉创意支持',
    recentActivities: ['设计了产品原型', '生成了视觉素材'],
    stats: { tasksCompleted: 7, onlineHours: 2.8 }
  },
  7: {
    capability: '战略规划专家，帮助制定长期策略和决策分析',
    recentActivities: ['制定了产品战略', '分析了市场机会'],
    stats: { tasksCompleted: 5, onlineHours: 2.0 }
  },
  8: {
    capability: '产品管理助手，从需求分析到产品规划全流程支持',
    recentActivities: ['编写了PRD文档', '规划了产品路线图'],
    stats: { tasksCompleted: 10, onlineHours: 3.5 }
  }
}

// 日志模板
export const LOG_TEMPLATES = [
  { agent: 'Research Agent', action: '开始执行任务' },
  { agent: 'Research Agent', action: '正在搜索相关数据...' },
  { agent: 'Research Agent', action: '已收集 15 份行业报告' },
  { agent: 'Writing Agent', action: '开始整理文档结构' },
  { agent: 'Writing Agent', action: '正在生成内容...' },
  { agent: 'Design Agent', action: '分析用户需求' },
  { agent: 'Design Agent', action: '创建设计方案' },
  { agent: 'Code Agent', action: '准备执行代码任务' },
  { agent: 'system', action: '任务分配完成，所有 Agent 已就绪' },
  { agent: 'system', action: '开始协同工作...' }
]

// 空状态配置
export const EMPTY_TEAM_STATE = {
  title: '还没有团队',
  description: '创建您的第一个 AI 团队开始协作',
  buttonText: '去创建团队'
}
```

- [ ] **Step 2: 提交**

```bash
git add src/utils/constants.js
git commit -m "feat: add constants and mock data for workspace"
```

---

## Task 2: 更新路由配置为 Hash 模式

**Files:**
- Modify: `src/router/index.js`

**Interfaces:**
- Consumes: 无
- Produces: Router 配置使用 hash 模式，teamId 可选参数

- [ ] **Step 1: 修改路由为 hash 模式，teamId 可选**

```javascript
// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import AgentSelection from '../views/AgentSelection.vue'
import TeamWorkspace from '../views/TeamWorkspace.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: AgentSelection
  },
  {
    path: '/workspace/:teamId?',
    name: 'workspace',
    component: TeamWorkspace,
    props: true
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
```

- [ ] **Step 2: 提交**

```bash
git add src/router/index.js
git commit -m "feat: switch router to hash mode with optional teamId"
```

---

## Task 3: 创建 useWorkspace Composable

**Files:**
- Create: `src/composables/useWorkspace.js`

**Interfaces:**
- Consumes: `useAgentSelection().currentTeam` (从现有 composable)
- Produces:
  - `teams` - 团队列表 Ref
  - `searchQuery` - 搜索关键词 Ref
  - `filteredTeams` - 过滤后的团队 Computed
  - `addTeam(team)` - 添加团队到列表
  - `switchTeam(teamId)` - 切换团队
  - `updateAgentStatus(agentId, status)` - 更新 Agent 状态

- [ ] **Step 1: 创建 useWorkspace.js**

```javascript
// src/composables/useWorkspace.js
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentSelection } from './useAgentSelection'

export function useWorkspace() {
  const router = useRouter()
  const { currentTeam } = useAgentSelection()

  // 所有团队列表（包含当前团队和静态示例团队）
  const teams = ref([
    {
      id: 2,
      name: '数据分析团队',
      subtitle: '2小时前',
      memberCount: 4,
      color: 'linear-gradient(135deg, #00b894, #00cec9)',
      agents: []
    },
    {
      id: 3,
      name: '设计创意团队',
      subtitle: '昨天',
      memberCount: 5,
      color: 'linear-gradient(135deg, #d63031, #e17055)',
      agents: []
    }
  ])

  // 搜索关键词
  const searchQuery = ref('')

  // 过滤后的团队列表
  const filteredTeams = computed(() => {
    if (!searchQuery.value.trim()) {
      // 如果有当前团队且不在列表中，添加到最前
      const result = [...teams.value]
      if (currentTeam.value && !result.find(t => t.id === currentTeam.value.teamId)) {
        result.unshift({
          id: currentTeam.value.teamId,
          name: currentTeam.value.name,
          subtitle: '刚刚创建',
          memberCount: currentTeam.value.agents?.length || 0,
          color: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
          agents: currentTeam.value.agents || []
        })
      }
      return result
    }

    // 搜索过滤
    const query = searchQuery.value.toLowerCase()
    let filtered = teams.value.filter(team =>
      team.name.toLowerCase().includes(query) ||
      team.subtitle.toLowerCase().includes(query)
    )

    // 如果当前团队匹配搜索，添加到列表
    if (currentTeam.value) {
      const currentMatch = currentTeam.value.name?.toLowerCase().includes(query)
      if (currentMatch && !filtered.find(t => t.id === currentTeam.value.teamId)) {
        filtered.unshift({
          id: currentTeam.value.teamId,
          name: currentTeam.value.name,
          subtitle: '刚刚创建',
          memberCount: currentTeam.value.agents?.length || 0,
          color: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
          agents: currentTeam.value.agents || []
        })
      }
    }

    return filtered
  })

  // 添加新团队到列表
  const addTeam = (team) => {
    teams.value.unshift(team)
  }

  // 切换团队
  const switchTeam = (teamId) => {
    if (teamId === currentTeam.value?.teamId) {
      return // 已经是当前团队，不切换
    }
    router.push({ name: 'workspace', params: { teamId } })
  }

  // 更新 Agent 状态
  const updateAgentStatus = (agentId, status) => {
    if (currentTeam.value?.agents) {
      const agent = currentTeam.value.agents.find(a => a.id === agentId)
      if (agent) {
        agent.status = status // 'online' or 'offline'
      }
    }
  }

  // 从团队中移除 Agent
  const removeAgent = (agentId) => {
    if (currentTeam.value?.agents) {
      const index = currentTeam.value.agents.findIndex(a => a.id === agentId)
      if (index !== -1) {
        currentTeam.value.agents.splice(index, 1)
      }
    }
  }

  return {
    teams,
    searchQuery,
    filteredTeams,
    addTeam,
    switchTeam,
    updateAgentStatus,
    removeAgent
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/composables/useWorkspace.js
git commit -m "feat: add useWorkspace composable for team management"
```

---

## Task 4: 创建 useChat Composable

**Files:**
- Create: `src/composables/useChat.js`

**Interfaces:**
- Produces:
  - `messages` - 消息列表 Ref
  - `sendMessage(content)` - 发送消息函数
  - `clearMessages()` - 清空消息

- [ ] **Step 1: 创建 useChat.js**

```javascript
// src/composables/useChat.js
import { ref } from 'vue'

export function useChat() {
  const messages = ref([])

  // 发送消息（模拟）
  const sendMessage = async (content) => {
    if (!content || !content.trim()) {
      return null
    }

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    messages.value.push(userMessage)

    // 模拟系统正在处理
    const processingMessage = {
      id: Date.now() + 1,
      type: 'agent',
      content: '正在处理您的请求...',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isProcessing: true
    }
    messages.value.push(processingMessage)

    // 模拟延迟后返回结果（预留 async 接口）
    return new Promise((resolve) => {
      setTimeout(() => {
        // 移除处理中消息
        const processingIndex = messages.value.findIndex(m => m.id === processingMessage.id)
        if (processingIndex !== -1) {
          messages.value.splice(processingIndex, 1)
        }

        // 添加完成消息
        const responseMessage = {
          id: Date.now() + 2,
          type: 'agent',
          content: '任务已完成！您的请求已处理。',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
        messages.value.push(responseMessage)
        resolve(responseMessage)
      }, 1500)
    })
  }

  // 清空消息
  const clearMessages = () => {
    messages.value = []
  }

  return {
    messages,
    sendMessage,
    clearMessages
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/composables/useChat.js
git commit -m "feat: add useChat composable for message management"
```

---

## Task 5: 创建 useModal Composable

**Files:**
- Create: `src/composables/useModal.js`

**Interfaces:**
- Produces:
  - `isCreateTeamModalOpen` - 创建团队模态框状态 Ref
  - `isAgentDetailModalOpen` - Agent 详情模态框状态 Ref
  - `isConfirmDialogOpen` - 确认对话框状态 Ref
  - `selectedAgent` - 选中的 Agent Ref
  - `confirmCallback` - 确认回调 Ref
  - `openCreateTeamModal()` - 打开创建团队模态框
  - `closeCreateTeamModal()` - 关闭创建团队模态框
  - `openAgentDetailModal(agent)` - 打开 Agent 详情模态框
  - `closeAgentDetailModal()` - 关闭 Agent 详情模态框
  - `openConfirmDialog(callback)` - 打开确认对话框
  - `closeConfirmDialog()` - 关闭确认对话框

- [ ] **Step 1: 创建 useModal.js**

```javascript
// src/composables/useModal.js
import { ref } from 'vue'

export function useModal() {
  // 模态框状态
  const isCreateTeamModalOpen = ref(false)
  const isAgentDetailModalOpen = ref(false)
  const isConfirmDialogOpen = ref(false)

  // Agent 详情相关
  const selectedAgent = ref(null)

  // 确认对话框回调
  const confirmCallback = ref(null)

  // 创建团队模态框
  const openCreateTeamModal = () => {
    isCreateTeamModalOpen.value = true
  }

  const closeCreateTeamModal = () => {
    isCreateTeamModalOpen.value = false
  }

  // Agent 详情模态框
  const openAgentDetailModal = (agent) => {
    selectedAgent.value = agent
    isAgentDetailModalOpen.value = true
  }

  const closeAgentDetailModal = () => {
    isAgentDetailModalOpen.value = false
    selectedAgent.value = null
  }

  // 确认对话框
  const openConfirmDialog = (callback) => {
    confirmCallback.value = callback
    isConfirmDialogOpen.value = true
  }

  const closeConfirmDialog = () => {
    isConfirmDialogOpen.value = false
    confirmCallback.value = null
  }

  const confirmAction = () => {
    if (confirmCallback.value) {
      confirmCallback.value()
    }
    closeConfirmDialog()
  }

  return {
    isCreateTeamModalOpen,
    isAgentDetailModalOpen,
    isConfirmDialogOpen,
    selectedAgent,
    confirmCallback,
    openCreateTeamModal,
    closeCreateTeamModal,
    openAgentDetailModal,
    closeAgentDetailModal,
    openConfirmDialog,
    closeConfirmDialog,
    confirmAction
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/composables/useModal.js
git commit -m "feat: add useModal composable for modal state management"
```

---

## Task 6: 创建 BaseModal 组件

**Files:**
- Create: `src/components/common/BaseModal.vue`

**Interfaces:**
- Consumes: `isOpen` (Boolean), `title` (String)
- Produces: 可复用的模态框容器组件

- [ ] **Step 1: 创建 BaseModal.vue**

```vue
<!-- src/components/common/BaseModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="modal-close" @click="close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: #1a2130;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #e0e0e0;
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #8a8a8a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e0e0e0;
}

.modal-close svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 73px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
  opacity: 0;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/common/BaseModal.vue
git commit -m "feat: add BaseModal component"
```

---

## Task 7: 创建 ConfirmDialog 组件

**Files:**
- Create: `src/components/common/ConfirmDialog.vue`

**Interfaces:**
- Consumes: `isOpen` (Boolean), `title` (String), `message` (String)
- Produces: 确认对话框组件，触发 `confirm` 和 `cancel` 事件

- [ ] **Step 1: 创建 ConfirmDialog.vue**

```vue
<!-- src/components/common/ConfirmDialog.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="confirm-overlay" @click.self="cancel">
        <div class="confirm-container">
          <div class="confirm-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3 class="confirm-title">{{ title }}</h3>
          <p class="confirm-message">{{ message }}</p>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="cancel">取消</button>
            <button class="btn-confirm" @click="confirm">确认</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
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
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 20px;
}

.confirm-container {
  background: #1a2130;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 400px;
  width: 100%;
  padding: 24px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.confirm-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  background: rgba(234, 88, 12, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-icon svg {
  width: 24px;
  height: 24px;
  stroke: #ea580c;
}

.confirm-title {
  font-size: 18px;
  font-weight: 600;
  color: #e0e0e0;
  margin: 0 0 12px;
}

.confirm-message {
  font-size: 14px;
  color: #a0aec0;
  margin: 0 0 24px;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-cancel,
.btn-confirm {
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

.btn-confirm {
  background: #ea580c;
  border: none;
  color: white;
}

.btn-confirm:hover {
  background: #c2410c;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .confirm-container,
.modal-leave-to .confirm-container {
  transform: scale(0.95);
  opacity: 0;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/common/ConfirmDialog.vue
git commit -m "feat: add ConfirmDialog component"
```

---

## Task 8: 创建 CreateTeamModal 组件

**Files:**
- Create: `src/components/workspace/CreateTeamModal.vue`

**Interfaces:**
- Consumes: `isOpen` (Boolean), `useWorkspace().addTeam`, `useModal().closeCreateTeamModal`
- Produces: 创建团队模态框，触发 `create` 事件

- [ ] **Step 1: 创建 CreateTeamModal.vue**

```vue
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
  // 重置表单
  teamName.value = ''
  teamDescription.value = ''
}

const handleSubmit = () => {
  if (!teamName.value.trim()) return

  emit('create', {
    name: teamName.value.trim(),
    description: teamDescription.value.trim()
  })

  // 重置表单
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
```

- [ ] **Step 2: 提交**

```bash
git add src/components/workspace/CreateTeamModal.vue
git commit -m "feat: add CreateTeamModal component"
```

---

## Task 9: 创建 AgentDetailModal 组件

**Files:**
- Create: `src/components/workspace/AgentDetailModal.vue`

**Interfaces:**
- Consumes: `isOpen` (Boolean), `selectedAgent` (Object), `AGENT_CAPABILITIES` (from constants)
- Produces: Agent 详情模态框，触发 `toggle-status` 和 `close` 事件

- [ ] **Step 1: 创建 AgentDetailModal.vue**

```vue
<!-- src/components/workspace/AgentDetailModal.vue -->
<template>
  <BaseModal :is-open="isOpen" title="Agent 详情" @close="close">
    <div v-if="agent" class="agent-detail">
      <div class="agent-header">
        <div class="agent-avatar-large" :style="{ background: agent.color }">
          <component :is="getAgentIcon(agent.icon)" />
        </div>
        <div class="agent-info-header">
          <h4 class="agent-name">{{ agent.name }}</h4>
          <div class="agent-status-badge" :class="agent.status || 'online'">
            {{ agent.status === 'offline' ? '离线' : '在线' }}
          </div>
        </div>
        <button class="status-toggle" @click="toggleStatus">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          切换状态
        </button>
      </div>

      <div class="agent-section">
        <h5 class="section-title">角色</h5>
        <p class="section-text">{{ getAgentRole(agent.category) }}</p>
      </div>

      <div class="agent-section">
        <h5 class="section-title">能力描述</h5>
        <p class="section-text">{{ capabilities?.capability || '暂无描述' }}</p>
      </div>

      <div class="agent-section">
        <h5 class="section-title">最近活动</h5>
        <ul class="activity-list">
          <li v-for="(activity, index) in capabilities?.recentActivities" :key="index">
            {{ activity }}
          </li>
        </ul>
      </div>

      <div class="agent-section">
        <h5 class="section-title">统计</h5>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">已完成任务</span>
            <span class="stat-value">{{ capabilities?.stats?.tasksCompleted || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">在线时长</span>
            <span class="stat-value">{{ capabilities?.stats?.onlineHours || 0 }}h</span>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from '../common/BaseModal.vue'
import { AGENT_CAPABILITIES } from '../../utils/constants'
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

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  selectedAgent: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['toggle-status', 'close'])

const agent = computed(() => props.selectedAgent)

const capabilities = computed(() => {
  if (!agent.value) return null
  return AGENT_CAPABILITIES[agent.value.id] || null
})

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

const toggleStatus = () => {
  emit('toggle-status', agent.value?.id)
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.agent-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.agent-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(26, 33, 48, 0.6);
  border-radius: 10px;
}

.agent-avatar-large {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.agent-avatar-large::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
}

.agent-avatar-large svg {
  width: 28px;
  height: 28px;
  stroke: white;
  position: relative;
  z-index: 1;
}

.agent-info-header {
  flex: 1;
}

.agent-name {
  font-size: 18px;
  font-weight: 600;
  color: #e0e0e0;
  margin: 0 0 8px;
}

.agent-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.agent-status-badge.online {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.agent-status-badge.offline {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
}

.status-toggle {
  padding: 8px 16px;
  background: rgba(91, 108, 255, 0.15);
  border: 1px solid rgba(91, 108, 255, 0.3);
  border-radius: 8px;
  color: #5b6cff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.status-toggle:hover {
  background: rgba(91, 108, 255, 0.25);
  border-color: rgba(91, 108, 255, 0.5);
}

.status-toggle svg {
  width: 16px;
  height: 16px;
}

.agent-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #8a8a8a;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-text {
  font-size: 14px;
  color: #a0aec0;
  margin: 0;
  line-height: 1.6;
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-list li {
  font-size: 14px;
  color: #a0aec0;
  padding: 6px 0;
  padding-left: 16px;
  position: relative;
}

.activity-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #5b6cff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  padding: 12px;
  background: rgba(26, 33, 48, 0.4);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #e0e0e0;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/workspace/AgentDetailModal.vue
git commit -m "feat: add AgentDetailModal component"
```

---

## Task 10: 创建 AgentMentionPicker 组件

**Files:**
- Create: `src/components/common/AgentMentionPicker.vue`

**Interfaces:**
- Consumes: `isOpen` (Boolean), `agents` (Array), `position` (Object {x, y})
- Produces: @提及选择器，触发 `select` 事件

- [ ] **Step 1: 创建 AgentMentionPicker.vue**

```vue
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
```

- [ ] **Step 2: 提交**

```bash
git add src/components/common/AgentMentionPicker.vue
git commit -m "feat: add AgentMentionPicker component"
```

---

## Task 11: 更新 LeftSidebar 添加交互

**Files:**
- Modify: `src/components/workspace/LeftSidebar.vue`

**Interfaces:**
- Consumes: `useWorkspace().filteredTeams, searchQuery, switchTeam`, `useModal().openCreateTeamModal`
- Produces: 带交互的左边栏

- [ ] **Step 1: 修改 LeftSidebar.vue 添加交互**

完整替换文件内容：

```vue
<!-- src/components/workspace/LeftSidebar.vue -->
<template>
  <div class="left-sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span class="logo-text">MultiAgent</span>
      </div>
      <button class="new-team-btn" @click="openCreateTeamModal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新建团队
      </button>
    </div>

    <div class="search-bar">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索团队或对话"
      />
    </div>

    <div class="team-list">
      <div v-if="filteredTeams.length === 0" class="no-results">
        无匹配团队
      </div>
      <div
        v-for="team in filteredTeams"
        :key="team.id"
        class="team-item"
        :class="{ active: team.id === currentTeamId }"
        @click="handleTeamClick(team.id)"
      >
        <div class="team-icon" :style="{ background: team.color }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="team-info">
          <div class="team-name">{{ team.name }}</div>
          <div class="team-subtitle">{{ team.subtitle }}</div>
        </div>
        <div class="team-badge">{{ team.memberCount }}</div>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="user-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="user-info">
          <div class="user-name">Kenny</div>
          <div class="user-role">Pro 会员</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAgentSelection } from '../../composables/useAgentSelection'
import { useWorkspace } from '../../composables/useWorkspace'
import { useModal } from '../../composables/useModal'

const route = useRoute()
const { currentTeam } = useAgentSelection()
const { filteredTeams, searchQuery, switchTeam } = useWorkspace()
const { openCreateTeamModal } = useModal()

// 当前激活团队 ID
const currentTeamId = computed(() => {
  return route.params.teamId || currentTeam.value?.teamId || null
})

// 处理团队点击
const handleTeamClick = (teamId) => {
  if (teamId === currentTeamId.value) {
    return // 已经是当前团队，不切换
  }
  switchTeam(teamId)
}
</script>

<style scoped>
.left-sidebar {
  width: 260px;
  height: 100%;
  background: #0d111c;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.logo-icon {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #5b6cff, #7c3aed);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon svg {
  width: 16px;
  height: 16px;
  stroke: white;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.new-team-btn {
  width: 100%;
  padding: 8px 12px;
  background: #5b6cff;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.new-team-btn svg {
  width: 14px;
  height: 14px;
}

.new-team-btn:hover {
  background: #4a5bf0;
}

.search-bar {
  position: relative;
  padding: 12px 16px;
}

.search-icon {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: #6b7280;
  pointer-events: none;
}

.search-bar input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  background: #1e2532;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: white;
  font-size: 12px;
  outline: none;
}

.search-bar input:focus {
  border-color: #5b6cff;
}

.search-bar input::placeholder {
  color: #6b7280;
}

.team-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #6b7280;
  font-size: 13px;
}

.team-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.team-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.team-item.active {
  background: rgba(91, 108, 255, 0.15);
  border: 1px solid rgba(91, 108, 255, 0.3);
}

.team-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.team-icon svg {
  width: 16px;
  height: 16px;
  stroke: white;
}

.team-info {
  flex: 1;
  min-width: 0;
}

.team-name {
  font-size: 13px;
  font-weight: 500;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-subtitle {
  font-size: 11px;
  color: #8a8a8a;
}

.team-badge {
  width: 20px;
  height: 20px;
  background: rgba(91, 108, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #5b6cff;
  font-weight: 600;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5b6cff, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar svg {
  width: 20px;
  height: 20px;
  stroke: white;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: #e0e0e0;
}

.user-role {
  font-size: 11px;
  color: #8a8a8a;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/workspace/LeftSidebar.vue
git commit -m "feat: add interactions to LeftSidebar (team switching, search, create)"
```

---

## Task 12: 更新 CenterChat 添加交互

**Files:**
- Modify: `src/components/workspace/CenterChat.vue`

**Interfaces:**
- Consumes: `useChat().messages, sendMessage`, `useModal().openCreateTeamModal`, `currentTeam`, `teamAgents`
- Produces: 带交互的聊天区

- [ ] **Step 1: 修改 CenterChat.vue 添加交互**

```vue
<!-- src/components/workspace/CenterChat.vue -->
<template>
  <div class="center-chat">
    <div v-if="!teamId" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h3 class="empty-title">还没有团队</h3>
      <p class="empty-description">创建您的第一个 AI 团队开始协作</p>
      <button class="empty-action-btn" @click="openCreateTeamModal">
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
            <span class="agent-count">{{ teamAgents.length }} 个 Agent</span>
            <span class="create-time">创建于 {{ formatDate(currentTeam?.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div class="chat-content" ref="chatContentRef">
        <div v-if="messages.length === 0" class="welcome-state">
          <div class="welcome-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h3 class="welcome-title">欢迎使用 {{ currentTeam?.name || 'MultiAgent' }}</h3>
          <p class="welcome-text">您已成功创建团队，包含 {{ teamAgents.length }} 个 Agent</p>
          <p class="welcome-hint">在下方输入框中输入任务，开始与您的 AI 团队协作</p>
        </div>

        <template v-else>
          <div
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="message.type === 'user' ? 'user-message' : 'agent-message'"
          >
            <div class="message-avatar">
              <svg v-if="message.type === 'user'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div class="message-body">
              <div class="message-time">{{ message.timestamp }}</div>
              <div class="message-text" v-html="message.content"></div>
            </div>
          </div>
        </template>
      </div>

      <div class="chat-input-bar">
        <div class="input-wrapper">
          <textarea
            v-model="inputText"
            placeholder="输入你的任务或问题"
            class="chat-input"
            rows="3"
            @keydown.ctrl.enter="handleSend"
            ref="textareaRef"
          ></textarea>
          <div class="input-actions">
            <button class="at-btn" @click="toggleMentionPicker" :disabled="teamAgents.length === 0">
              @
            </button>
            <button class="send-btn" @click="handleSend" :disabled="!inputText.trim()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AgentMentionPicker
        :is-open="isMentionPickerOpen"
        :agents="teamAgents"
        :position="mentionPosition"
        @select="handleMentionSelect"
        @click="handleMentionClick"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAgentSelection } from '../../composables/useAgentSelection'
import { useChat } from '../../composables/useChat'
import { useModal } from '../../composables/useModal'
import AgentMentionPicker from '../common/AgentMentionPicker.vue'

const props = defineProps({
  teamId: String
})

const route = useRoute()
const { currentTeam } = useAgentSelection()
const { messages, sendMessage } = useChat()
const { openCreateTeamModal } = useModal()

// 状态
const inputText = ref('')
const chatContentRef = ref(null)
const textareaRef = ref(null)
const isMentionPickerOpen = ref(false)
const mentionPosition = ref({ x: 0, y: 0 })

// 当前团队的 Agents
const teamAgents = computed(() => {
  return currentTeam.value?.agents || []
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-')
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContentRef.value) {
      chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
    }
  })
}

// 处理发送消息
const handleSend = async () => {
  if (!inputText.value.trim()) return

  const message = inputText.value
  inputText.value = ''

  await sendMessage(message)
  scrollToBottom()

  // 聚焦回输入框
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

// 切换 @ 提及选择器
const toggleMentionPicker = () => {
  if (teamAgents.value.length === 0) return

  if (isMentionPickerOpen.value) {
    isMentionPickerOpen.value = false
  } else {
    // 获取 @ 按钮位置
    const button = document.querySelector('.at-btn')
    if (button) {
      const rect = button.getBoundingClientRect()
      mentionPosition.value = {
        x: rect.left,
        y: rect.bottom + 4
      }
    }
    isMentionPickerOpen.value = true
  }
}

// 处理提及选择
const handleMentionSelect = (agent) => {
  inputText.value += `@${agent.name} `
  isMentionPickerOpen.value = false
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

// 关闭提及选择器
const handleMentionClick = () => {
  isMentionPickerOpen.value = false
}

// 点击外部关闭提及选择器
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.at-btn') && !e.target.closest('.mention-picker')) {
      isMentionPickerOpen.value = false
    }
  })
})
</script>

<style scoped>
.center-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #121826;
  overflow: hidden;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #5b6cff, #7c3aed);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-icon svg {
  width: 32px;
  height: 32px;
  stroke: white;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0 0 12px;
}

.empty-description {
  font-size: 14px;
  color: #a0aec0;
  margin: 0 0 24px;
}

.empty-action-btn {
  padding: 12px 32px;
  background: #5b6cff;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.empty-action-btn:hover {
  background: #4a5bf0;
}

/* 聊天头部 */
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
  margin-bottom: 6px;
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

/* 聊天内容 */
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
  background: #1a2130;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-message .message-avatar {
  background: linear-gradient(135deg, #5b6cff, #7c3aed);
}

.message-avatar svg {
  width: 18px;
  height: 18px;
  stroke: white;
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

.user-message .message-text {
  background: #5b6cff;
  color: white;
}

/* 输入区域 */
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

.at-btn:hover:not(:disabled) {
  background: rgba(91, 108, 255, 0.25);
  border-color: rgba(91, 108, 255, 0.5);
}

.at-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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

.send-btn:hover:not(:disabled) {
  background: #4a5bf0;
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/workspace/CenterChat.vue
git commit -m "feat: add chat interactions (send, mention, empty state)"
```

---

## Task 13: 更新 RightSidebar 添加交互

**Files:**
- Modify: `src/components/workspace/RightSidebar.vue`

**Interfaces:**
- Consumes: `useWorkspace().updateAgentStatus, removeAgent`, `useModal().openAgentDetailModal, openConfirmDialog, closeConfirmDialog, confirmAction`
- Produces: 带交互的右边栏

- [ ] **Step 1: 修改 RightSidebar.vue 添加交互**

```vue
<!-- src/components/workspace/RightSidebar.vue -->
<template>
  <div class="right-sidebar">
    <div class="sidebar-section">
      <h3 class="section-title">团队成员 ({{ teamAgents.length }})</h3>
      <div v-if="teamAgents.length > 0" class="member-list">
        <div
          v-for="agent in teamAgents"
          :key="agent.id"
          class="member-card"
          :style="{ '--agent-color': agent.color }"
          @click="handleAgentClick(agent)"
          @contextmenu.prevent="handleAgentRightClick(agent)"
        >
          <div class="member-avatar" :style="{ background: agent.color }">
            <component :is="getAgentIcon(agent.icon)" />
          </div>
          <div class="member-info">
            <div class="member-name">{{ agent.name }}</div>
            <div class="member-role">{{ getAgentRole(agent.category) }}</div>
          </div>
          <div
            class="member-status"
            :class="agent.status === 'offline' ? 'offline' : 'online'"
            @click.stop="handleStatusToggle(agent.id)"
          ></div>
        </div>
      </div>
      <div v-else class="empty-state">
        暂无成员，请先选择 Agent
      </div>
    </div>

    <div class="sidebar-section">
      <div class="section-header">
        <h3 class="section-title">执行日志</h3>
        <button class="clear-btn" @click="handleClearLogs">清空</button>
      </div>
      <div class="execution-log" ref="logRef">
        <div v-if="logs.length === 0" class="no-logs">
          暂无执行日志
        </div>
        <div v-for="(log, index) in logs" :key="index" class="log-entry">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-content">{{ log.content }}</span>
        </div>
      </div>
      <button class="view-more-btn" @click="handleLoadMoreLogs">查看更多日志 →</button>
    </div>

    <AgentDetailModal
      :is-open="isAgentDetailModalOpen"
      :selected-agent="selectedAgent"
      @toggle-status="handleStatusToggle"
      @close="closeAgentDetailModal"
    />

    <ConfirmDialog
      :is-open="isConfirmDialogOpen"
      title="确认移除"
      message="确定要将此 Agent 从团队中移除吗？"
      @confirm="confirmRemoveAgent"
      @cancel="closeConfirmDialog"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAgentSelection } from '../../composables/useAgentSelection'
import { useWorkspace } from '../../composables/useWorkspace'
import { useModal } from '../../composables/useModal'
import { LOG_TEMPLATES } from '../../utils/constants'
import AgentDetailModal from './AgentDetailModal.vue'
import ConfirmDialog from '../common/ConfirmDialog.vue'
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

const { currentTeam } = useAgentSelection()
const { updateAgentStatus, removeAgent } = useWorkspace()
const {
  isAgentDetailModalOpen,
  selectedAgent,
  isConfirmDialogOpen,
  openAgentDetailModal,
  closeAgentDetailModal,
  openConfirmDialog,
  closeConfirmDialog,
  confirmAction
} = useModal()

// 待移除的 Agent
const agentToRemove = ref(null)

// 日志
const logs = ref([
  { time: '10:30:15', content: 'Research Agent 开始执行任务' },
  { time: '10:30:18', content: '正在搜索 AI 教育市场数据...' },
  { time: '10:31:05', content: '已收集 15 份行业报告' },
  { time: '10:32:20', content: '竞品分析进行中...' },
  { time: '10:33:45', content: '生成市场机会分析报告' }
])

// 获取团队 Agents
const teamAgents = computed(() => {
  return currentTeam.value?.agents || []
})

// 获取 Agent 图标
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

// 获取 Agent 角色
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

// 点击 Agent 卡片
const handleAgentClick = (agent) => {
  openAgentDetailModal(agent)
}

// 右键点击 Agent 卡片
const handleAgentRightClick = (agent) => {
  // 不允许移除最后一个 Agent
  if (teamAgents.value.length <= 1) {
    alert('至少需要保留一个 Agent')
    return
  }
  agentToRemove.value = agent
  openConfirmDialog(() => {
    removeAgent(agent.id)
  })
}

// 切换状态
const handleStatusToggle = (agentId) => {
  const agent = teamAgents.value.find(a => a.id === agentId)
  if (!agent) return

  const newStatus = agent.status === 'offline' ? 'online' : 'offline'
  updateAgentStatus(agentId, newStatus)

  // 如果模态框打开，关闭它
  if (isAgentDetailModalOpen.value) {
    closeAgentDetailModal()
  }
}

// 确认移除 Agent
const confirmRemoveAgent = () => {
  if (agentToRemove.value) {
    removeAgent(agentToRemove.value.id)
    agentToRemove.value = null
  }
  confirmAction()
}

// 清空日志
const handleClearLogs = () => {
  logs.value = []
}

// 加载更多日志
const handleLoadMoreLogs = () => {
  const now = new Date()
  const newLogs = []
  for (let i = 0; i < 3; i++) {
    const template = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)]
    newLogs.push({
      time: now.toLocaleTimeString('zh-CN', { hour12: false }),
      content: `[${template.agent}] ${template.action}`
    })
    now.setSeconds(now.getSeconds() - 30)
  }
  logs.value = [...newLogs.reverse(), ...logs.value]
}
</script>

<style scoped>
.right-sidebar {
  width: 300px;
  height: 100%;
  background: #0d111c;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-section {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #e0e0e0;
  margin: 0 0 12px 0;
}

.clear-btn {
  padding: 4px 10px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #8a8a8a;
  font-size: 11px;
  cursor: pointer;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e0e0e0;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(26, 33, 48, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.member-card:hover {
  background: rgba(26, 33, 48, 0.9);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateX(4px);
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.member-avatar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}

.member-avatar svg {
  width: 20px;
  height: 20px;
  stroke: white;
  position: relative;
  z-index: 1;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-role {
  font-size: 12px;
  color: #8a8a8a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s;
}

.member-status:hover {
  transform: scale(1.2);
}

.member-status.online {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.member-status.offline {
  background: #94a3b8;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #6b7280;
  font-size: 13px;
  background: rgba(26, 33, 48, 0.3);
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

.execution-log {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 8px;
}

.no-logs {
  padding: 20px;
  text-align: center;
  color: #6b7280;
  font-size: 12px;
}

.log-entry {
  font-size: 11px;
  color: #8a8a8a;
  margin-bottom: 8px;
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
}

.log-time {
  color: #6b7280;
  margin-right: 8px;
}

.log-content {
  color: #a0aec0;
}

.view-more-btn {
  width: 100%;
  padding: 8px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #5b6cff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-more-btn:hover {
  background: rgba(91, 108, 255, 0.1);
  border-color: rgba(91, 108, 255, 0.3);
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/workspace/RightSidebar.vue
git commit -m "feat: add RightSidebar interactions (agent detail, status, remove, logs)"
```

---

## Task 14: 更新 TeamWorkspace 主页面

**Files:**
- Modify: `src/views/TeamWorkspace.vue`

**Interfaces:**
- Consumes: 所有子组件 + `useModal().isCreateTeamModalOpen, closeCreateTeamModal`, `useWorkspace().addTeam`
- Produces: 完整的工作区页面

- [ ] **Step 1: 修改 TeamWorkspace.vue 集成所有功能**

```vue
<!-- src/views/TeamWorkspace.vue -->
<template>
  <div class="team-workspace">
    <LeftSidebar />
    <CenterChat :team-id="teamId" />
    <RightSidebar />

    <CreateTeamModal
      :is-open="isCreateTeamModalOpen"
      @close="closeCreateTeamModal"
      @create="handleCreateTeam"
    />
  </div>
</template>

<script setup>
import { useModal } from '../composables/useModal'
import { useWorkspace } from '../composables/useWorkspace'
import LeftSidebar from '../components/workspace/LeftSidebar.vue'
import CenterChat from '../components/workspace/CenterChat.vue'
import RightSidebar from '../components/workspace/RightSidebar.vue'
import CreateTeamModal from '../components/workspace/CreateTeamModal.vue'

const props = defineProps({
  teamId: String
})

const { isCreateTeamModalOpen, closeCreateTeamModal } = useModal()
const { addTeam } = useWorkspace()

// 处理创建团队
const handleCreateTeam = ({ name, description }) => {
  // 生成新团队 ID
  const newTeamId = 'team-' + Date.now()

  const newTeam = {
    id: newTeamId,
    name,
    subtitle: description || '刚刚创建',
    memberCount: 0,
    color: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
    agents: []
  }

  // 添加到团队列表
  addTeam(newTeam)

  // 关闭模态框
  closeCreateTeamModal()

  // 导航到新团队（可选，如果创建后要立即切换）
  // router.push({ name: 'workspace', params: { teamId: newTeamId } })
}
</script>

<style scoped>
.team-workspace {
  width: 100%;
  height: 100%;
  display: flex;
  background: #0d111c;
  overflow: hidden;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/views/TeamWorkspace.vue
git commit -m "feat: integrate all components in TeamWorkspace"
```

---

## Task 15: 扩展 useAgentSelection 支持 teams 管理

**Files:**
- Modify: `src/composables/useAgentSelection.js`

**Interfaces:**
- Produces: 添加 `teams` 状态和相关方法

- [ ] **Step 1: 扩展 useAgentSelection.js 添加 teams 管理**

在现有文件末尾，return 语句前添加：

```javascript
// 在现有代码中，添加 teams 相关状态和方法

// Teams 管理
const teams = ref([])

const addCreatedTeam = (team) => {
  teams.value.push(team)
}

const getTeamById = (teamId) => {
  return teams.value.find(t => t.id === teamId)
}

// 在 return 语句中添加：
return {
  // ... 现有返回值 ...
  teams,
  addCreatedTeam,
  getTeamById
}
```

完整修改后的文件（关键部分）：

```javascript
// Shared state (outside function to persist across calls)
const selectedAgents = ref(new Set([1, 2, 3]))
const activeCategory = ref('全部')
const searchQuery = ref('')
const teamName = ref('')
const currentTeam = ref(null)
const teams = ref([]) // 新增

export function useAgentSelection() {
  // ... 现有代码保持不变 ...

  // 在 createTeam 函数中，添加到 teams
  const createTeam = () => {
    const teamId = generateTeamId()
    const teamData = {
      teamId,
      name: teamName.value,
      agents: [...selectedAgentsArray.value],
      createdAt: new Date().toISOString()
    }
    currentTeam.value = teamData
    teams.value.push(teamData) // 新增
    console.log('Creating team:', teamData)
    router.push({ name: 'workspace', params: { teamId } })
  }

  // 新增方法
  const addCreatedTeam = (team) => {
    teams.value.push(team)
  }

  const getTeamById = (teamId) => {
    return teams.value.find(t => t.id === teamId || t.teamId === teamId)
  }

  return {
    // ... 现有返回值 ...
    teams,
    addCreatedTeam,
    getTeamById
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/composables/useAgentSelection.js
git commit -m "feat: extend useAgentSelection to support teams management"
```

---

## Task 16: 确保所有依赖已安装

**Files:**
- Check: `package.json`

- [ ] **Step 1: 检查并安装依赖**

```bash
npm install
```

- [ ] **Step 2: 验证 Heroicons 已安装**

```bash
npm list @heroicons/vue
```

如果没有安装：

```bash
npm install @heroicons/vue
```

---

## Task 17: 启动应用测试功能

**Files:**
- Test: 启动开发服务器

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 手动测试所有交互**

测试清单：
- [ ] 首页选择 Agent 后创建团队，能正确导航到工作区
- [ ] 工作区三个边栏正确显示
- [ ] 点击左边栏"新建团队"按钮打开模态框
- [ ] 创建团队后，团队出现在列表中
- [ ] 搜索框能过滤团队列表
- [ ] 点击团队能切换（注意：当前团队是首页创建的，其他团队只是示例）
- [ ] 中间聊天区能发送消息
- [ ] @ 按钮能打开选择器
- [ ] 右边栏 Agent 卡片点击能打开详情
- [ ] Agent 详情模态框能切换状态
- [ ] 右键 Agent 卡片能弹出确认对话框
- [ ] 日志"清空"按钮能清空日志
- [ ] "查看更多"能加载更多日志
- [ ] 无 teamId 时显示空状态页面
- [ ] 空状态"去创建团队"按钮能打开创建模态框

---

## 实施完成检查

- [ ] 所有代码已提交
- [ ] 所有交互功能正常工作
- [ ] 无控制台错误
- [ ] 代码符合现有风格

---

**计划完成。准备好开始实施了。**
