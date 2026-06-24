# TeamWorkspace 交互功能设计文档

**日期:** 2025-06-22
**状态:** 待审核

---

## 1. 概述

为 TeamWorkspace 页面添加完整的交互功能，采用混合模式（Hybrid mode）架构 - 先实现模拟交互，为未来 API 集成预留接口。

---

## 2. 路由配置

```javascript
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: AgentSelection },
    { path: '/workspace/:teamId?', name: 'workspace', component: TeamWorkspace, props: true }
  ]
})
```

- 使用 hash 模式
- `teamId` 为可选参数，支持无团队访问

---

## 3. 功能模块

### 3.1 左边栏 (LeftSidebar)

| 功能 | 描述 |
|------|------|
| 团队切换 | 点击团队项导航到 `/workspace/{teamId}` |
| 搜索过滤 | 实时过滤团队列表（匹配名称和副标题） |
| 新建团队 | 打开 CreateTeamModal |

**交互细节：**
- 悬停高亮，激活团队有明显标识
- 点击已激活团队不重复导航
- 空搜索结果显示"无匹配团队"

### 3.2 中间聊天区 (CenterChat)

| 功能 | 描述 |
|------|------|
| 发送消息 | 点击发送或按 Ctrl+Enter |
| 消息显示 | 用户消息右侧，系统回复左侧 |
| 系统回复模拟 | 发送后显示"正在处理..."，延迟后显示完成 |
| @ 提及 | 打开 Agent 下拉选择器，插入 "@AgentName" |
| 文本输入 | 多行支持，高度自适应 |

**数据流：**
```
用户输入 → 添加到消息列表 → 显示用户消息
→ 延迟 1-2 秒 → 显示系统回复 → 清空输入框
```

### 3.3 右边栏 (RightSidebar)

| 功能 | 描述 |
|------|------|
| Agent 卡片点击 | 打开 AgentDetailModal |
| 状态切换 | 点击状态指示器切换在线/离线 |
| 移除操作 | 右键/长按 → 确认对话框 → 移除 |
| 日志清空 | 清除所有日志条目 |
| 查看更多 | 加载更多模拟日志 |

**Agent 详情模态框内容：**
- 基本信息（名称、角色、状态切换）
- 能力描述
- 最近活动
- 简单统计

### 3.4 空状态页面

当无 teamId 时显示：

```
┌─────────────────────────────────────┐
│                                     │
│     [图标]                           │
│                                     │
│    还没有团队                        │
│                                     │
│  创建您的第一个 AI 团队开始协作      │
│                                     │
│        [去创建团队]                  │
│                                     │
└─────────────────────────────────────┘
```

**行为：** 与左边栏"新建团队"按钮相同，打开 CreateTeamModal

---

## 4. 组件结构

```
src/
├── views/
│   ├── AgentSelection.vue          # 现有首页
│   └── TeamWorkspace.vue          # 工作区页面
│
├── components/
│   ├── [现有首页组件]/
│   │   ├── HeroSection.vue
│   │   ├── FilterBar.vue
│   │   ├── AgentGrid.vue
│   │   └── SelectionPanel.vue
│   │
│   ├── workspace/
│   │   ├── LeftSidebar.vue         # 修改
│   │   ├── CenterChat.vue          # 修改
│   │   ├── RightSidebar.vue        # 修改
│   │   ├── CreateTeamModal.vue     # 新建
│   │   └── AgentDetailModal.vue    # 新建
│   │
│   └── common/
│       ├── BaseModal.vue           # 新建
│       ├── ConfirmDialog.vue       # 新建
│       └── AgentMentionPicker.vue  # 新建
│
├── composables/
│   ├── useAgentSelection.js        # 现有（扩展 teams 管理）
│   ├── useChat.js                  # 新建
│   └── useModal.js                 # 新建
│
└── utils/
    └── constants.js                 # 新建
```

---

## 5. 状态管理

### 5.1 复用现有状态 (useAgentSelection.js)

```javascript
// 现有
- AGENTS (所有 Agent 数据)
- currentTeam (当前团队数据)
- selectedAgentsArray (选中的 Agents)
```

### 5.2 新增状态 (useWorkspace.js)

```javascript
export function useWorkspace() {
  return {
    teams: ref([]),           // 所有团队列表
    messages: ref([]),       // 当前聊天消息
    logs: ref([]),           // 执行日志
    searchQuery: ref(''),    // 搜索关键词

    // 方法
    switchTeam(teamId),
    sendMessage(content),
    createTeam(name, description),
    updateAgentStatus(agentId, status),
    removeAgent(agentId),
    clearLogs(),
    loadMoreLogs()
  }
}
```

### 5.3 数据流

```
首页选择 Agent → 创建团队 → currentTeam 更新
                          ↓
                    导航到 /workspace/:teamId
                          ↓
                    TeamWorkspace 读取 currentTeam
                          ↓
                    显示团队信息和成员列表
```

---

## 6. 边界情况处理

| 情况 | 处理 |
|------|------|
| 无团队 | 显示空状态页面 |
| 无 Agent | 显示空状态提示 |
| 无消息 | 显示欢迎界面 |
| 创建团队名称为空 | 禁用提交按钮 |
| 发送空消息 | 禁用发送按钮 |
| 最后一个 Agent | 不允许移除 |
| 无效 teamId | 显示空状态 |

---

## 7. 预留 API 接口

```javascript
// 未来可替换为真实 API 调用
async function sendMessage(message) {
  // 当前：模拟响应
  // 未来：await api.chat.send(message)
}

async function createTeam(name, description) {
  // 当前：前端模拟
  // 未来：await api.teams.create({ name, description })
}
```

---

## 8. 实施检查清单

- [ ] 创建 `useWorkspace.js` composable
- [ ] 创建 `useChat.js` composable
- [ ] 创建 `useModal.js` composable
- [ ] 创建 `constants.js` 工具文件
- [ ] 创建 `BaseModal.vue` 公共组件
- [ ] 创建 `ConfirmDialog.vue` 公共组件
- [ ] 创建 `AgentMentionPicker.vue` 组件
- [ ] 创建 `CreateTeamModal.vue` 组件
- [ ] 创建 `AgentDetailModal.vue` 组件
- [ ] 修改 `LeftSidebar.vue` 添加交互
- [ ] 修改 `CenterChat.vue` 添加交互
- [ ] 修改 `RightSidebar.vue` 添加交互
- [ ] 修改 `TeamWorkspace.vue` 添加空状态
- [ ] 更新路由配置（hash 模式）
- [ ] 扩展 `useAgentSelection.js` 支持 teams 管理
- [ ] 添加搜索过滤逻辑
- [ ] 添加消息发送逻辑
- [ ] 添加日志管理逻辑
- [ ] 添加 Agent 状态管理
- [ ] 测试所有交互流程

---

**设计完成，待用户审核后开始实施。**
