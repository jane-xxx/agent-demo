# Mock 数据丰富化设计

**日期**: 2025-06-25
**状态**: 设计中
**作者**: Claude

---

## 1. 概述

为 MultiAgent Demo 应用丰富 mock 数据，解决当前内容简单、不够专业的问题。改进分为两部分：

1. **关键词匹配预设**（实时响应）：用户发消息后 Agent 的响应内容
2. **默认团队对话历史**（静态数据）：已存在团队的初始历史消息

---

## 2. 第一部分：关键词匹配预设

### 2.1 目标

当前 `STATIC_RESPONSE_TEMPLATES` 内容过于简单，每个 Agent 类型只有 2-3 个简短模板。需要：

1. 增加关键词匹配机制，让演示更可控
2. 每个响应内容更丰富、更专业
3. 支持 fallback 机制

### 2.2 数据结构

新建 `src/utils/keywordResponses.js`：

```javascript
export const KEYWORD_RESPONSES = {
  code: [
    {
      keywords: ['bug', '修复', '错误'],
      response: { /* 调试场景响应 */ }
    },
    {
      keywords: ['hook', 'react', '状态'],
      response: { /* React Hook 教程响应 */ }
    },
    {
      keywords: ['api', '接口', '请求'],
      response: { /* API 设计响应 */ }
    },
    {
      keywords: ['性能', '优化', '慢'],
      response: { /* 性能优化响应 */ }
    },
    {
      keywords: ['test', '测试', '用例'],
      response: { /* 测试用例响应 */ }
    },
  ],
  research: [
    { keywords: ['市场', '调研', '分析'], response: { /* ... */ } },
    { keywords: ['竞品', '对比', '竞争对手'], response: { /* ... */ } },
    { keywords: ['趋势', '方向', '未来'], response: { /* ... */ } },
  ],
  writing: [
    { keywords: ['文案', '产品', '介绍'], response: { /* ... */ } },
    { keywords: ['邮件', '商务', '通知'], response: { /* ... */ } },
    { keywords: ['公告', '发布', '更新'], response: { /* ... */ } },
  ],
  data: [
    { keywords: ['数据', '分析', '统计'], response: { /* ... */ } },
    { keywords: ['报表', '图表', '可视化'], response: { /* ... */ } },
  ],
  design: [
    { keywords: ['设计', 'ui', '界面'], response: { /* ... */ } },
    { keywords: ['配色', '颜色', '风格'], response: { /* ... */ } },
  ],
  strategy: [
    { keywords: ['战略', '规划', '计划'], response: { /* ... */ } },
    { keywords: ['增长', '推广', '运营'], response: { /* ... */ } },
  ],
  product: [
    { keywords: ['需求', '功能', 'prd'], response: { /* ... */ } },
    { keywords: ['路线图', '规划', '迭代'], response: { /* ... */ } },
  ],
}

export const DEFAULT_RESPONSES = {
  code: {
    responseType: RESPONSE_TYPES.TEXT,
    data: {
      content: '我理解您的技术需求。为了给出更精准的建议，能否提供更多细节？比如具体的技术栈、错误信息或期望达到的效果。'
    }
  },
  research: {
    responseType: RESPONSE_TYPES.TEXT,
    data: {
      content: '关于这个研究主题，我可以从多个维度进行分析。请告诉我您关注的重点方向，比如市场规模、竞争格局或技术趋势。'
    }
  },
  // 其他 Agent 类型的默认响应...
}
```

### 2.3 响应内容格式

每个响应应该是 `COMPOSITE` 类型，包含多个部分：

```javascript
{
  responseType: RESPONSE_TYPES.COMPOSITE,
  data: {
    items: [
      {
        type: RESPONSE_TYPES.TEXT,
        data: { content: '开头分析...' }
      },
      {
        type: RESPONSE_TYPES.CODE,
        data: {
          language: 'typescript',
          code: '...',
          explanation: '...'
        }
      },
      {
        type: RESPONSE_TYPES.TABLE,
        data: {
          headers: ['项目', '现状', '建议'],
          rows: [...],
          caption: '...'
        }
      }
    ]
  }
}
```

### 2.4 匹配逻辑

```javascript
import { KEYWORD_RESPONSES, DEFAULT_RESPONSES } from './keywordResponses.js'

function matchResponse(agent, userMessage) {
  const agentResponses = KEYWORD_RESPONSES[agent.icon] || KEYWORD_RESPONSES.chat

  for (const item of agentResponses) {
    if (item.keywords.some(k => userMessage.toLowerCase().includes(k))) {
      // 深拷贝避免修改原数据
      return JSON.parse(JSON.stringify(item.response))
    }
  }

  return DEFAULT_RESPONSES[agent.icon] || DEFAULT_RESPONSES.chat
}
```

### 2.5 集成点

修改 `src/composables/useChat.js`：

1. 导入新的匹配函数
2. 将 `simulateAgentResponse` 中的 `generateStructuredResponse` 替换为 `matchResponse`

---

## 3. 第二部分：默认团队对话历史

### 3.1 扩充目标

| 团队 | 当前消息数 | 目标消息数 | 新增内容 |
|------|-----------|-----------|---------|
| team-001 (产品研发) | 3 | 7 | +4 条（Bug 调试多轮对话） |
| team-002 (市场分析) | 3 | 7 | +4 条（市场调研深化） |
| team-003 (内容创作) | 3 | 7 | +4 条（文案迭代场景） |
| team-004 (UI/UX设计) | 3 | 7 | +4 条（设计评审场景） |
| team-005 (数据分析) | 3 | 7 | +4 条（数据分析场景） |

### 3.2 场景设计示例

#### team-001：Bug 调试场景

```javascript
// 在现有的 React Hook 场景后添加
{
  id: 'msg-004',
  type: 'user',
  content: '我的组件有个内存泄漏，每次卸载时控制台报警告',
  timestamp: '15:10'
},
{
  id: 'msg-005',
  type: 'agent',
  agentId: 4,
  agentName: 'Code Agent',
  responseType: RESPONSE_TYPES.TEXT,
  data: {
    content: `**内存泄漏排查思路**

组件卸载时的警告通常是因为：

1. **未清理的副作用**：useEffect 没有返回清理函数
2. **定时器未清除**：setInterval/setTimeout 未 clearTimeout
3. **事件监听器未移除**：addEventListener 后未 removeEventListener

请分享一下你的 useEffect 代码，我帮你定位问题。`
  },
  timestamp: '15:12'
},
{
  id: 'msg-006',
  type: 'user',
  content: '按你说的加了依赖数组，但清理函数还是没执行',
  timestamp: '15:15'
},
{
  id: 'msg-007',
  type: 'agent',
  agentId: 4,
  agentName: 'Code Agent',
  responseType: RESPONSE_TYPES.CODE,
  data: {
    language: 'typescript',
    code: `useEffect(() => {
  const timer = setInterval(() => {
    console.log('Polling...')
  }, 1000)

  // ⚠️ 必须返回清理函数
  return () => {
    clearInterval(timer)
    console.log('Cleanup executed')
  }
}, []) // 空依赖数组表示只在挂载时执行`,
    explanation: '关键是返回一个清理函数，组件卸载时会自动执行。如果你加了依赖数组但没用上，用空数组 `[]` 即可。'
  },
  timestamp: '15:18'
}
```

#### team-002：市场调研深化

```javascript
// 在现有内容后添加中文市场分析和差异化建议
{
  id: 'msg-104',
  type: 'user',
  content: '哪些工具对中文支持比较好？',
  timestamp: '10:25'
},
{
  id: 'msg-105',
  type: 'agent',
  // 中文市场分析响应
}
// ...
```

### 3.3 日志同步更新

`MOCK_LOGS` 需要同步扩充，与新增消息对应：

```javascript
export const MOCK_LOGS = {
  'team-001': [
    // 现有日志...
    { time: '15:18:00', content: 'Code Agent: 提供内存泄漏修复方案' },
    { time: '15:15:30', content: '用户: 反馈清理函数未执行' },
    { time: '15:12:00', content: 'Code Agent: 分析内存泄漏原因' },
    { time: '15:10:00', content: '用户: 提出内存泄漏问题' },
    // ...
  ],
  // ...
}
```

---

## 4. 文件结构

```
src/utils/
├── mockData.js              # 扩充：历史对话 (MOCK_MESSAGES) + 日志 (MOCK_LOGS)
├── keywordResponses.js      # 新增：关键词匹配响应
├── responseTypes.js         # 保持不变
└── constants.js             # 保持不变

src/composables/
└── useChat.js               # 修改：集成关键词匹配
```

---

## 5. 实施步骤

1. 创建 `keywordResponses.js`，定义关键词和响应
2. 修改 `useChat.js`，集成关键词匹配逻辑
3. 扩充 `mockData.js` 中的 `MOCK_MESSAGES`
4. 同步更新 `MOCK_LOGS`
5. 测试验证

---

## 6. 后续扩展方向

- 如果关键词匹配不够用，可以考虑接入 AI API
- 可以增加多轮对话上下文管理
- 可以添加对话场景的配置化管理
