# MultiAgent 团队协作平台

> 一个基于 Vue 3 构建的多智能体团队协作演示应用，展示 AI Agent 协作工作流的 UI/UX 设计

![Vue 3](https://img.shields.io/badge/Vue-3.4-4FC08D?style=flat&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 功能特性

### 🤖 多类型 Agent 支持
平台内置 8 种专业领域的 AI Agent：

| Agent | 领域 | 能力 |
|-------|------|------|
| Chat Agent | 通用对话 | 自然语言交互、上下文理解 |
| Research Agent | 研究分析 | 信息搜索、竞品分析、市场调研 |
| Writing Agent | 内容创作 | 文案撰写、营销邮件、文档生成 |
| Code Agent | 开发工具 | 代码实现、Bug 修复、技术方案 |
| Data Analyst Agent | 数据分析 | 数据可视化、趋势预测、报表生成 |
| Design Agent | 设计创意 | UI 设计、配色方案、流程图设计 |
| Strategy Agent | 战略规划 | 决策分析、增长策略、风险评估 |
| Product Agent | 产品管理 | 需求分析、路线图规划、PRD 撰写 |

### 💬 团队协作对话
- **多 Agent 协同**：通过 `@Agent名称` 提及特定 Agent，实现精准任务分配
- **结构化响应**：支持多种格式的内容呈现
  - 📝 Markdown 文档
  - 💻 代码片段（语法高亮）
  - 📊 数据表格
  - 📈 Mermaid 图表
  - 🧮 KaTeX 数学公式
  - 🖼️ 图片展示
  - 📦 组合响应

### 🎨 精致 UI 设计
- 极光动态背景（Aurora Background）
- 现代深色主题
- 玻璃态（Glassmorphism）设计风格
- 流畅的动画过渡效果
- 响应式布局

---

## 📸 界面预览

### Agent 选择页
展示所有可用 Agent，支持分类筛选和搜索，可多选创建团队。

### 团队工作区
三栏布局设计：
- **左侧**：团队管理与切换
- **中间**：对话与协作主区域
- **右侧**：Agent 详情与执行日志

---

## 🚀 快速开始

### 环境要求
- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

---

## 📁 项目结构

```
src/
├── views/                  # 页面视图
│   ├── AgentSelection.vue     # Agent 选择页
│   └── TeamWorkspace.vue      # 团队工作区
├── components/             # 可复用组件
│   ├── AgentCard.vue           # Agent 卡片
│   ├── AgentGrid.vue           # Agent 网格
│   ├── FilterBar.vue           # 筛选栏
│   ├── SelectionPanel.vue      # 底部选择面板
│   ├── AuroraBackground.vue   # 极光背景
│   ├── HeroSection.vue         # 首页 Hero 区
│   ├── workspace/              # 工作区组件
│   └── common/                 # 通用组件
├── composables/            # 组合式函数（状态管理）
│   ├── useAgentSelection.js    # Agent 选择逻辑
│   ├── useWorkspace.js         # 工作区状态
│   ├── useChat.js              # 聊天功能
│   └── useModal.js             # 弹窗管理
├── utils/                  # 工具函数
│   ├── mockData.js             # Mock 数据
│   ├── responseTypes.js        # 响应类型定义
│   ├── keywordResponses.js     # 关键词响应
│   └── constants.js             # 常量定义
├── router/                 # 路由配置
└── styles/                 # 全局样式
```

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API) |
| 构建工具 | Vite 5 |
| 路由 | Vue Router 4 |
| Markdown | markdown-it |
| 代码高亮 | highlight.js |
| 数学公式 | KaTeX |
| 图表 | Mermaid |
| 图标 | Heroicons |

---

## 💡 核心设计

### 状态管理
使用 Vue 3 Composables 实现轻量级状态管理，无需引入 Vuex/Pinia：

- `useAgentSelection` - Agent 选择与团队创建
- `useWorkspace` - 工作区状态
- `useChat` - 聊天与消息管理
- `useModal` - 弹窗状态管理

### 数据持久化
使用 localStorage 存储用户数据：
- 团队消息历史
- Agent 执行日志
- 支持数据版本控制，版本不匹配时自动清理

### 响应系统
基于关键词匹配的智能响应系统，不同 Agent 根据用户输入关键词返回相应的结构化响应。

---

## 📝 License

MIT

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📧 联系方式

如有问题或建议，欢迎联系项目维护者。
