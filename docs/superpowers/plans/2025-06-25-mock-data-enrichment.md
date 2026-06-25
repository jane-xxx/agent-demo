# Mock 数据丰富化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 MultiAgent Demo 应用丰富 mock 数据，包括关键词匹配预设响应和扩充团队对话历史

**Architecture:** 创建独立的关键词响应模块，集成到现有的 useChat composable 中，同时扩充静态 mock 数据文件

**Tech Stack:** Vue.js 3, JavaScript (ES modules)

## Global Constraints

- 保持现有的 RESPONSE_TYPES 结构不变
- 不破坏现有的 localStorage 数据存储机制
- 新增文件使用 ES modules 导出语法
- 遵循项目现有的代码风格

---

## Task 1: 创建关键词响应数据模块

**Files:**
- Create: `src/utils/keywordResponses.js`

**Interfaces:**
- Produces: `KEYWORD_RESPONSES` (关键词→响应映射), `DEFAULT_RESPONSES` (默认响应)

- [ ] **Step 1: 创建文件并定义导出结构**

```javascript
// src/utils/keywordResponses.js
import { RESPONSE_TYPES } from './responseTypes.js'

// 关键词匹配响应数据
export const KEYWORD_RESPONSES = {
  // Task 2 会填充具体内容
  code: [],
  research: [],
  writing: [],
  data: [],
  design: [],
  strategy: [],
  product: []
}

// 默认 fallback 响应
export const DEFAULT_RESPONSES = {
  // Task 2 会填充具体内容
  code: null,
  research: null,
  writing: null,
  data: null,
  design: null,
  strategy: null,
  product: null
}
```

- [ ] **Step 2: 运行 lint 检查**

Run: `npm run lint` (如果存在)
Expected: 无语法错误

- [ ] **Step 3: Commit**

```bash
git add src/utils/keywordResponses.js
git commit -m "feat: add keyword responses module structure"
```

---

## Task 2: 填充 Code Agent 关键词响应

**Files:**
- Modify: `src/utils/keywordResponses.js:8-10`

**Interfaces:**
- Consumes: `RESPONSE_TYPES` (从 responseTypes.js)
- Produces: `KEYWORD_RESPONSES.code` 数组, `DEFAULT_RESPONSES.code`

- [ ] **Step 1: 填充 Code Agent 关键词响应**

在 `KEYWORD_RESPONSES.code` 数组中添加以下对象：

```javascript
{
  keywords: ['bug', '修复', '错误', 'leak', '泄漏', '警告', 'warning'],
  response: {
    responseType: RESPONSE_TYPES.COMPOSITE,
    data: {
      items: [
        {
          type: RESPONSE_TYPES.TEXT,
          data: {
            content: `**问题排查思路**

从你描述的情况来看，这可能是以下几种情况之一：

1. **未清理的副作用**：useEffect 没有返回清理函数
2. **定时器未清除**：setInterval/setTimeout 未 clearTimeout
3. **事件监听器未移除**：addEventListener 后未 removeEventListener
4. **状态更新后未清理**：组件卸载后仍在执行异步操作

能否分享一下相关的代码片段？我可以帮你定位具体问题。`
          }
        },
        {
          type: RESPONSE_TYPES.CODE,
          data: {
            language: 'typescript',
            code: `// useEffect 清理函数示例
useEffect(() => {
  // 设置副作用
  const timer = setInterval(() => {
    console.log('Running...')
  }, 1000)

  // 返回清理函数
  return () => {
    clearInterval(timer)
  }
}, []) // 空依赖数组

// 带依赖的清理
useEffect(() => {
  const handler = (e) => console.log(e)

  window.addEventListener('resize', handler)

  return () => {
    window.removeEventListener('resize', handler)
  }
}, [dependency])`,
            explanation: '关键是 useEffect 必须返回一个清理函数。React 会在组件卸载前执行这个函数，让你有机会清理副作用。'
          }
        }
      ]
    }
  }
},
{
  keywords: ['hook', 'react', '状态', 'state', 'useeffect', 'usestate'],
  response: {
    responseType: RESPONSE_TYPES.CODE,
    data: {
      language: 'typescript',
      code: `import { useState, useEffect, useCallback } from 'react'

interface UseAsyncResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
): UseAsyncResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await asyncFunction()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [asyncFunction])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...dependencies])

  return { data, loading, error, refetch: fetchData }
}

// 使用示例
// const { data, loading, error, refetch } = useAsync(() => fetchData(), [id])`,
      explanation: '这是一个完整的异步 Hook 模板，支持 loading、error 状态和重新获取功能。使用 useCallback 确保 fetchData 在依赖变化时正确更新。'
    }
  }
},
{
  keywords: ['api', '接口', '请求', 'endpoint', 'fetch', 'axios'],
  response: {
    responseType: RESPONSE_TYPES.COMPOSITE,
    data: {
      items: [
        {
          type: RESPONSE_TYPES.TEXT,
          data: {
            content: `**API 设计最佳实践**

设计良好的 API 需要考虑以下几个方面：`
          }
        },
        {
          type: RESPONSE_TYPES.TABLE,
          data: {
            headers: ['原则', '说明', '示例'],
            rows: [
              ['RESTful', '使用 HTTP 动词和资源路径', 'GET /users, POST /users'],
              ['版本控制', '在 URL 或 Header 中指定版本', '/api/v1/users'],
              ['统一响应格式', '所有接口返回相同结构', '{ code, data, message }'],
              ['错误处理', '使用标准 HTTP 状态码', '200, 400, 401, 404, 500'],
              ['分页', '使用 limit/offset 或 cursor', '?limit=20&offset=0']
            ],
            caption: 'API 设计原则对照表'
          }
        },
        {
          type: RESPONSE_TYPES.CODE,
          data: {
            language: 'typescript',
            code: `// API 统一响应格式
interface ApiResponse<T> {
  code: number
  data: T
  message: string
  timestamp: number
}

// 分页参数
interface PaginationParams {
  limit: number
  offset: number
}

// 分页响应
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

// 使用示例
async function fetchUsers(
  params: PaginationParams
): Promise<PaginatedResponse<User>> {
  const response = await fetch(\`/api/v1/users?limit=\${params.limit}&offset=\${params.offset}\`)
  return response.json()
}`,
            explanation: '定义清晰的类型可以确保前后端对接的一致性。'
          }
        }
      ]
    }
  }
},
{
  keywords: ['性能', '优化', '慢', 'performance', 'optimize', 'lazy'],
  response: {
    responseType: RESPONSE_TYPES.COMPOSITE,
    data: {
      items: [
        {
          type: RESPONSE_TYPES.TEXT,
          data: {
            content: `**性能优化策略**

根据你的描述，建议从以下几个方向入手：`
          }
        },
        {
          type: RESPONSE_TYPES.CODE,
          data: {
            language: 'typescript',
            code: `// 1. 使用 React.memo 避免不必要的重渲染
const ExpensiveComponent = React.memo(({ data, onAction }) => {
  // 组件实现
}, (prevProps, nextProps) => {
  // 自定义比较逻辑
  return prevProps.data.id === nextProps.data.id
})

// 2. 使用 useMemo 缓存计算结果
const processedData = useMemo(() => {
  return largeDataSet.filter(item => item.active)
                   .map(item => ({ ...item, value: item.value * 2 }))
}, [largeDataSet])

// 3. 使用 useCallback 稳定函数引用
const handleClick = useCallback((id) => {
  dispatch({ type: 'SELECT', payload: id })
}, [dispatch])

// 4. 懒加载组件
const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  )
}`,
            explanation: '性能优化的核心是减少不必要的计算和渲染。React 提供了 memo、useMemo、useCallback 等工具来帮助实现这一目标。'
          }
        },
        {
          type: RESPONSE_TYPES.TABLE,
          data: {
            headers: ['场景', '优化方案', '预期效果'],
            rows: [
              ['大数据列表', '虚拟滚动 (react-window)', '内存减少 80%+'],
              ['频繁更新', '防抖/节流', 'CPU 降低 50%+'],
              ['大量重渲染', 'React.memo + useCallback', '渲染次数减少 70%+'],
              ['大组件加载', 'Code Splitting', '首屏时间减少 40%+']
            ],
            caption: '常见性能问题优化指南'
          }
        }
      ]
    }
  }
},
{
  keywords: ['test', '测试', '用例', 'spec', 'jest', 'vitest'],
  response: {
    responseType: RESPONSE_TYPES.COMPOSITE,
    data: {
      items: [
        {
          type: RESPONSE_TYPES.TEXT,
          data: {
            content: `**测试用例编写指南**

编写测试时应该遵循以下原则：`
          }
        },
        {
          type: RESPONSE_TYPES.CODE,
          data: {
            language: 'typescript',
            code: `import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// 组件测试示例
describe('UserProfile', () => {
  const mockUser = { id: 1, name: 'Test User' }
  const mockUpdate = vi.fn()

  beforeEach(() => {
    mockUpdate.mockClear()
  })

  it('renders user information', () => {
    render(<UserProfile user={mockUser} onUpdate={mockUpdate} />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('calls onUpdate when save button is clicked', async () => {
    render(<UserProfile user={mockUser} onUpdate={mockUpdate} />)

    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(1)
    })
  })

  it('shows loading state during update', async () => {
    mockUpdate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
    render(<UserProfile user={mockUser} onUpdate={mockUpdate} />)

    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(screen.getByText(/saving/i)).toBeInTheDocument()
  })
})

// Hook 测试示例
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current.count).toBe(0)

    act(() => {
      result.current.increment()
    })
    expect(result.current.count).toBe(1)
  })
})`,
            explanation: '测试应该覆盖：正常流程、边界情况、错误处理。使用 beforeEach 保持测试隔离，使用 mock 避免外部依赖。'
          }
        },
        {
          type: RESPONSE_TYPES.TABLE,
          data: {
            headers: ['测试类型', '工具', '覆盖目标'],
            rows: [
              ['单元测试', 'Vitest/Jest', '函数、Hook、工具类'],
              ['组件测试', 'Testing Library', 'UI 组件渲染和交互'],
              ['E2E测试', 'Playwright/Cypress', '完整用户流程'],
              ['类型检查', 'TypeScript', '编译时类型安全']
            ],
            caption: '测试金字塔'
          }
        }
      ]
    }
  }
}
```

- [ ] **Step 2: 填充 Code Agent 默认响应**

在 `DEFAULT_RESPONSES` 中添加：

```javascript
code: {
  responseType: RESPONSE_TYPES.TEXT,
  data: {
    content: `我理解您的技术需求。为了给出更精准的建议，能否提供更多细节？

**请告诉我：**
- 具体的技术栈（React/Vue/原生 JS 等）
- 遇到的具体问题或错误信息
- 期望达到的效果
- 相关代码片段（如果涉及代码问题）

有了这些信息，我可以提供更有针对性的解决方案。`
  }
}
```

- [ ] **Step 3: 运行 lint 检查**

Run: `npm run lint` (如果存在)
Expected: 无语法错误

- [ ] **Step 4: Commit**

```bash
git add src/utils/keywordResponses.js
git commit -m "feat: add Code Agent keyword responses"
```

---

## Task 3: 填充其他 Agent 关键词响应

**Files:**
- Modify: `src/utils/keywordResponses.js:11-22`

**Interfaces:**
- Consumes: `RESPONSE_TYPES`
- Produces: `KEYWORD_RESPONSES.research/writing/data/design/strategy/product`, `DEFAULT_RESPONSES.*`

- [ ] **Step 1: 填充 Research Agent 响应**

```javascript
research: [
  {
    keywords: ['市场', '调研', '分析', 'market', 'research', 'study'],
    response: {
      responseType: RESPONSE_TYPES.COMPOSITE,
      data: {
        items: [
          {
            type: RESPONSE_TYPES.TEXT,
            data: {
              content: `**市场调研分析报告**

根据你的需求，我整理了以下市场调研结果：`
            }
          },
          {
            type: RESPONSE_TYPES.TABLE,
            data: {
              headers: ['维度', '数据', '趋势', '洞察'],
              rows: [
                ['市场规模', '¥280亿 (2024)', '年增32%', '企业数字化转型驱动'],
                ['用户需求', '效率提升首选', '向智能化演进', 'AI+工作流是热点'],
                ['竞争格局', '头部占60%', '整合加速', '垂直领域有机会'],
                ['技术趋势', '大模型落地', '多模态融合', 'Agent 协同是方向']
              ],
              caption: '市场调研核心发现'
            }
          },
          {
            type: RESPONSE_TYPES.DOCUMENT,
            data: {
              sections: [
                {
                  title: '关键洞察',
                  content: '1. 市场处于快速成长期，预计未来3年将保持30%+年增长率\n2. 头部厂商通过并购整合，中小厂商需找准差异化定位\n3. 用户最关心的是产品能真正融入工作流，而非单一功能'
                },
                {
                  title: '差异化建议',
                  content: '建议从以下方向切入：\n• 专注中文垂直场景（如法律、医疗、金融）\n• 深度整合企业现有工作流（IM、文档、CRM）\n• 提供企业级定制服务和私有化部署'
                },
                {
                  title: '下一步行动',
                  content: '建议优先进行用户访谈，验证目标场景的真实痛点。我可以帮你设计访谈提纲。'
                }
              ]
            }
          }
        ]
      }
    }
  },
  {
    keywords: ['竞品', '对比', '竞争对手', 'competitor', 'vs', '比较'],
    response: {
      responseType: RESPONSE_TYPES.COMPOSITE,
      data: {
        items: [
          {
            type: RESPONSE_TYPES.TEXT,
            data: {
              content: `**竞品对比分析**

以下是主要竞品的功能对比：`
            }
          },
          {
            type: RESPONSE_TYPES.TABLE,
            data: {
              headers: ['产品', '核心功能', '优势', '劣势', '定价'],
              rows: [
                ['产品A', '智能问答', '响应快', '功能单一', '¥49/月'],
                ['产品B', '文档协作', '集成好', '价格高', '¥199/月'],
                ['产品C', '全流程支持', '功能全面', '上手复杂', '¥99/月'],
                ['我们的产品', '差异化定位', '垂直深耕', '需要验证', '待定']
              ],
              caption: '竞品功能对比矩阵'
            }
          },
          {
            type: RESPONSE_TYPES.CHART,
            data: {
              diagram: `graph TD
    A[市场需求] --> B{竞争分析}
    B --> C[产品A]
    B --> D[产品B]
    B --> E[产品C]
    B --> F[我们]
    
    C --> C1[功能强但单一]
    D --> D1[集成好但贵]
    E --> E1[全但复杂]
    F --> F1[垂直+易用]
    
    style F1 fill:#10b981`,
              caption: '竞争定位分析'
            }
          }
        ]
      }
    }
  },
  {
    keywords: ['趋势', '方向', '未来', 'trend', 'forecast', '预测'],
    response: {
      responseType: RESPONSE_TYPES.COMPOSITE,
      data: {
        items: [
          {
            type: RESPONSE_TYPES.TEXT,
            data: {
              content: `**行业趋势洞察**

基于当前数据，我对未来1-3年的趋势预测如下：`
            }
          },
          {
            type: RESPONSE_TYPES.DOCUMENT,
            data: {
              sections: [
                {
                  title: '短期趋势 (6-12个月)',
                  content: '• AI Agent 从单一任务向多任务协同发展\n• 企业开始大规模试点，主要在知识密集型岗位\n• 开源模型能力快速追赶闭源'
                },
                {
                  title: '中期趋势 (1-2年)',
                  content: '• Agent 成为企业级应用标配\n• 垂直行业解决方案成熟\n• 监管框架逐步完善'
                },
                {
                  title: '长期趋势 (2-3年)',
                  content: '• 多模态 Agent (文本+图像+语音) 成为主流\n• Agent 经济体系形成 (Agent 之间可以交易)\n• 个人专属 Agent 普及'
                }
              ]
            }
          }
        ]
      }
    }
  }
]
```

- [ ] **Step 2: 填充 Writing Agent 响应**

```javascript
writing: [
  {
    keywords: ['文案', '产品', '介绍', 'copy', 'intro', 'description'],
    response: {
      responseType: RESPONSE_TYPES.COMPOSITE,
      data: {
        items: [
          {
            type: RESPONSE_TYPES.TEXT,
            data: {
              content: `**产品文案生成**

根据你的需求，我为你生成了以下产品文案：`
            }
          },
          {
            type: RESPONSE_TYPES.DOCUMENT,
            data: {
              sections: [
                {
                  title: '版本一：功能导向',
                  content: `**产品名称**：[填写产品名]

**一句话描述**：
让 [目标用户] 能够 [核心价值]，比 [传统方案] 快 [X] 倍。

**核心亮点**：
• **效率提升**：自动化处理 [具体场景]，节省 80% 时间
• **简单易用**：3 步完成操作，无需专业培训
• **可靠稳定**：99.9% 可用性，企业级安全保障`
                },
                {
                  title: '版本二：情感导向',
                  content: `**产品名称**：[填写产品名]

**情感连接**：
终于有一个工具，懂 [目标用户] 的真实需求。

**价值主张**：
不再被 [痛点问题] 困扰，让 [期望结果] 轻松实现。`
                }
              ]
            }
          }
        ]
      }
    }
  },
  {
    keywords: ['邮件', '商务', '通知', 'email', 'mail', '通知'],
    response: {
      responseType: RESPONSE_TYPES.DOCUMENT,
      data: {
        sections: [
          {
            title: '邮件主题',
            content: '📢 重要通知：关于 [事项] 的说明'
          },
          {
            title: '邮件正文',
            content: `尊敬的 [用户/客户/合作伙伴]，

感谢您一直以来的支持与信任。

**事项说明**：
关于 [具体事项]，我们特此通知：[详细说明]

**后续安排**：
• 时间：[具体时间]
• 注意事项：[重要提醒]
• 联系方式：[对接人信息]

如有任何疑问，请随时联系。

祝好！

[发送方]
[日期]`
          }
        ]
      }
    }
  },
  {
    keywords: ['公告', '发布', '更新', 'announcement', 'release', 'update'],
    response: {
      responseType: RESPONSE_TYPES.DOCUMENT,
      data: {
        sections: [
          {
            title: '公告标题',
            content: '🚀 重磅发布：[产品名称] 全新上线'
          },
          {
            title: '开篇',
            content: `亲爱的用户们：

经过团队 [X] 个月的精心打磨，我们非常激动地向您介绍 [产品名称]——一款能够 [核心价值] 的全新产品。`
          },
          {
            title: '核心亮点',
            content: `**✨ 功能一**：[描述]
让你能够 [用户收益]

**⚡ 功能二**：[描述]
效率提升 [X]%

**🔒 功能三**：[描述]
企业级安全保障`
          },
          {
            title: '限时优惠',
            content: `🎁 现在注册，享受首月免费试用！
👉 立即体验：[链接]`
          }
        ]
      }
    }
  }
]
```

- [ ] **Step 3: 填充 Data Analyst Agent 响应**

```javascript
data: [
  {
    keywords: ['数据', '分析', '统计', 'analytics', 'statistics', 'metric'],
    response: {
      responseType: RESPONSE_TYPES.COMPOSITE,
      data: {
        items: [
          {
            type: RESPONSE_TYPES.TEXT,
            data: {
              content: `**数据分析报告**

根据你提供的数据，我完成了以下分析：`
            }
          },
          {
            type: RESPONSE_TYPES.TABLE,
            data: {
              headers: ['指标', '当前值', '环比', '同比', '趋势'],
              rows: [
                ['活跃用户', '12,345', '+15%', '+45%', '↗ 上升'],
                ['转化率', '3.2%', '+0.8%', '+1.2%', '↗ 上升'],
                ['客单价', '¥256', '-5%', '+12%', '→ 稳定'],
                ['留存率', '42%', '+3%', '+8%', '↗ 上升']
              ],
              caption: '核心指标分析'
            }
          },
          {
            type: RESPONSE_TYPES.FORMULA,
            data: {
              formulas: [
                '\\text{增长率} = \\frac{\\text{本期值} - \\text{上期值}}{\\text{上期值}} \\times 100\\%',
                '\\text{转化率} = \\frac{\\text{转化用户数}}{\\text{总用户数}} \\times 100\\%',
                '\\text{留存率} = \\frac{\\text{N日后活跃用户}}{\\text{初始用户}} \\times 100\\%'
              ],
              explanation: '整体来看，核心指标保持健康增长。建议关注客单价的下降趋势，可能需要分析产品组合或定价策略。'
            }
          }
        ]
      }
    }
  },
  {
    keywords: ['报表', '图表', '可视化', 'report', 'chart', 'visualization'],
    response: {
      responseType: RESPONSE_TYPES.CHART,
      data: {
        diagram: `pie title 数据分布
    "产品A" : 35
    "产品B" : 25
    "产品C" : 20
    "产品D" : 15
    "其他" : 5`,
        caption: '业务数据分布图'
      }
    }
  }
]
```

- [ ] **Step 4: 填充 Design Agent 响应**

```javascript
design: [
  {
    keywords: ['设计', 'ui', '界面', 'design', 'interface', 'ux'],
    response: {
      responseType: RESPONSE_TYPES.COMPOSITE,
      data: {
        items: [
          {
            type: RESPONSE_TYPES.TEXT,
            data: {
              content: `**UI 设计方案**

根据你的需求，我提供了以下设计建议：`
            }
          },
          {
            type: RESPONSE_TYPES.IMAGE,
            data: {
              url: 'https://picsum.photos/seed/ui-design/800/600',
              alt: 'UI 设计稿'
            }
          },
          {
            type: RESPONSE_TYPES.DOCUMENT,
            data: {
              sections: [
                {
                  title: '设计原则',
                  content: '• 保持一致性：颜色、字体、间距统一\n• 强调层级：通过大小和颜色引导注意力\n• 简化交互：减少用户操作步骤'
                },
                {
                  title: '配色建议',
                  content: '主色：#6366f1 (紫色)\n辅色：#8b5cf6 (浅紫)\n强调色：#f59e0b (橙色)\n中性色：#64748b (灰蓝)'
                }
              ]
            }
          }
        ]
      }
    }
  },
  {
    keywords: ['配色', '颜色', '风格', 'color', 'palette', 'theme'],
    response: {
      responseType: RESPONSE_TYPES.TABLE,
      data: {
        headers: ['颜色', '色值', '用途', '心理感受'],
        rows: [
          ['主色', '#6366f1', '按钮、链接', '专业、信任'],
          ['辅色', '#8b5cf6', '图标、装饰', '创意、灵感'],
          ['成功', '#10b981', '成功提示', '积极、完成'],
          ['警告', '#f59e0b', '警告提示', '注意、谨慎'],
          ['错误', '#ef4444', '错误提示', '紧急、停止']
        ],
        caption: '配色方案建议'
      }
    }
  }
]
```

- [ ] **Step 5: 填充 Strategy Agent 响应**

```javascript
strategy: [
  {
    keywords: ['战略', '规划', '计划', 'strategy', 'plan', 'roadmap'],
    response: {
      responseType: RESPONSE_TYPES.COMPOSITE,
      data: {
        items: [
          {
            type: RESPONSE_TYPES.TEXT,
            data: {
              content: `**战略规划建议**

基于你的需求，我制定了以下战略规划：`
            }
          },
          {
            type: RESPONSE_TYPES.TABLE,
            data: {
              headers: ['阶段', '时间', '关键任务', '成功指标'],
              rows: [
                ['Phase 1 - 验证', 'Q1', 'MVP开发+用户测试', '100个种子用户'],
                ['Phase 2 - 扩展', 'Q2', '功能完善+市场推广', '1000个活跃用户'],
                ['Phase 3 - 规模化', 'Q3-Q4', '团队扩张+生态建设', '10000个付费用户']
              ],
              caption: '战略路线图'
            }
          },
          {
            type: RESPONSE_TYPES.DOCUMENT,
            data: {
              sections: [
                {
                  title: '核心战略',
                  content: '• 聚焦垂直场景，避免与巨头正面竞争\n• 产品驱动增长，通过口碑传播获客\n• 建立数据飞轮，用数据反哺产品'
                },
                {
                  title: '风险预案',
                  content: '• 技术风险：保持技术栈更新，避免被淘汰\n• 竞争风险：建立核心壁垒（数据、网络效应）\n• 资金风险：控制 burn rate，保持 18 个月跑道'
                }
              ]
            }
          }
        ]
      }
    }
  },
  {
    keywords: ['增长', '推广', '运营', 'growth', 'marketing', 'promotion'],
    response: {
      responseType: RESPONSE_TYPES.DOCUMENT,
      data: {
        sections: [
          {
            title: '增长策略框架',
            content: `**AARRR 模型应用**

• Acquisition（获取）：内容营销+SEO+社区合作
• Activation（激活）：优化 onboarding 流程
• Retention（留存）：定期更新+用户社区
• Revenue（收入）：Freemium 模式+增值服务
• Referral（推荐）：推荐奖励+分享激励`
          },
          {
            title: '短期行动',
            content: '1. 发布 3 篇深度行业文章\n2. 参加 2 个行业会议/活动\n3. 启动用户推荐计划'
          }
        ]
      }
    }
  }
]
```

- [ ] **Step 6: 填充 Product Agent 响应**

```javascript
product: [
  {
    keywords: ['需求', '功能', 'prd', 'requirement', 'feature'],
    response: {
      responseType: RESPONSE_TYPES.DOCUMENT,
      data: {
        sections: [
          {
            title: 'PRD 文档结构',
            content: `**产品需求文档 (PRD)**

**1. 背景**
• 为什么做这个功能？
• 解决什么问题？
• 优先级是什么？

**2. 目标用户**
• 目标用户画像
• 使用场景描述
            }
          },
          {
            title: '功能需求',
            content: `**3. 功能描述**
• 用户故事
• 功能列表
• 交互流程

**4. 非功能需求**
• 性能要求
• 安全要求
• 兼容性要求`
          },
          {
            title: '成功指标',
            content: `**5. 成功指标**
• 使用率：X% 用户使用
• 满意度：X 分以上
• 转化率：X% 以上

**6. 上线计划**
• 开发排期
• 测试计划
• 发布策略`
          }
        ]
      }
    }
  },
  {
    keywords: ['路线图', '规划', '迭代', 'roadmap', 'iteration', 'sprint'],
    response: {
      responseType: RESPONSE_TYPES.COMPOSITE,
      data: {
        items: [
          {
            type: RESPONSE_TYPES.CHART,
            data: {
              diagram: `gantt
    title 产品路线图
    dateFormat YYYY-MM-DD
    section Q1
    MVP开发 :a1, 2025-01-01, 60d
    section Q2
    功能完善 :a2, 2025-04-01, 60d
    section Q3
    市场推广 :a3, 2025-07-01, 60d
    section Q4
    生态建设 :a4, 2025-10-01, 60d`,
              caption: '2025年产品路线图'
            }
          },
          {
            type: RESPONSE_TYPES.TEXT,
            data: {
              content: `**迭代说明**

• 每个季度一个大版本
• 每月一个小版本更新
• 每两周一个 bug 修复版本`
            }
          }
        ]
      }
    }
  }
]
```

- [ ] **Step 7: 填充所有默认响应**

```javascript
research: {
  responseType: RESPONSE_TYPES.TEXT,
  data: {
    content: `关于这个研究主题，我可以从多个维度进行分析。

**请告诉我你关注的重点：**
• 市场规模和增长趋势
• 竞争格局和主要玩家
• 技术发展方向
• 用户需求和痛点

有了明确方向，我可以提供更有深度的分析。`
  }
},
writing: {
  responseType: RESPONSE_TYPES.TEXT,
  data: {
    content: `我可以帮你撰写各类文案。请告诉我：

**文案类型：**
• 产品介绍
• 营销邮件
• 公告通知
• 其他

**关键信息：**
• 目标受众
• 核心卖点
• 期望风格（正式/活泼/专业）

我会根据你的需求生成合适的文案。`
  }
},
data: {
  responseType: RESPONSE_TYPES.TEXT,
  data: {
    content: `我可以帮你进行数据分析和可视化。

**请提供：**
• 数据来源或数据集描述
• 想了解的指标或问题
• 期望的输出形式（报表/图表/洞察）

我会帮你完成分析并给出结论。`
  }
},
design: {
  responseType: RESPONSE_TYPES.TEXT,
  data: {
    content: `我可以提供设计相关的建议。

**请告诉我你的需求：**
• UI/UX 设计
• 配色方案
• 界面优化
• 设计规范

我会给出专业的设计建议。`
  }
},
strategy: {
  responseType: RESPONSE_TYPES.TEXT,
  data: {
    content: `我可以帮你制定战略规划。

**请告诉我：**
• 规划的时间范围
• 当前所处阶段
• 核心目标是什么

我会帮你制定可执行的战略方案。`
  }
},
product: {
  responseType: RESPONSE_TYPES.TEXT,
  data: {
    content: `我可以帮你完成产品相关工作。

**需要协助：**
• PRD 文档编写
• 路线图规划
• 需求优先级排序
• 功能设计

请告诉我具体需求。`
  }
}
```

- [ ] **Step 8: 运行 lint 检查**

Run: `npm run lint` (如果存在)
Expected: 无语法错误

- [ ] **Step 9: Commit**

```bash
git add src/utils/keywordResponses.js
git commit -m "feat: add all Agent keyword responses"
```

---

## Task 4: 集成关键词匹配到 useChat

**Files:**
- Modify: `src/composables/useChat.js:3-4,137-320,383`

**Interfaces:**
- Consumes: `KEYWORD_RESPONSES`, `DEFAULT_RESPONSES` (从 keywordResponses.js)
- Produces: `matchResponse()` 函数

- [ ] **Step 1: 在文件顶部添加导入**

修改 `useChat.js` 第 3-4 行，在现有导入后添加：

```javascript
import { KEYWORD_RESPONSES, DEFAULT_RESPONSES } from '../utils/keywordResponses.js'
```

- [ ] **Step 2: 添加匹配函数**

在 `useChat.js` 中 `estimateTypingTime` 函数之前（约第 346 行）添加：

```javascript
// 关键词匹配响应函数
const matchResponse = (agent, userMessage) => {
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

- [ ] **Step 3: 修改 simulateAgentResponse 使用匹配函数**

修改 `useChat.js` 第 383 行附近的 `simulateAgentResponse` 函数，将：

```javascript
// 生成结构化响应
const response = generateStructuredResponse(agent, userMessage)
```

替换为：

```javascript
// 使用关键词匹配生成响应
const response = matchResponse(agent, userMessage)
```

- [ ] **Step 4: 运行开发服务器测试**

Run: `npm run dev`
Expected: 应用正常启动，无控制台错误

- [ ] **Step 5: 手动测试关键词匹配**

1. 打开应用，进入任意团队
2. 发送包含关键词的消息，如 "帮我修复这个 bug"
3. 观察 Agent 返回的是否为对应的关键词响应
Expected: 返回调试相关的响应内容

- [ ] **Step 6: Commit**

```bash
git add src/composables/useChat.js
git commit -m "feat: integrate keyword matching into chat"
```

---

## Task 5: 扩充 team-001 对话历史

**Files:**
- Modify: `src/utils/mockData.js:171-307`

**Interfaces:**
- Consumes: `RESPONSE_TYPES` (从 responseTypes.js)
- Produces: 扩充后的 `MOCK_MESSAGES['team-001']`, `MOCK_LOGS['team-001']`

- [ ] **Step 1: 扩充 team-001 消息**

在 `MOCK_MESSAGES['team-001']` 数组的第 3 个元素后添加 4 条新消息：

```javascript
{
  id: 'msg-004',
  type: 'user',
  content: '我的组件有个内存泄漏，每次卸载时控制台都报警告',
  timestamp: '15:10'
},
{
  id: 'msg-005',
  type: 'agent',
  agentId: 4,
  agentName: 'Code Agent',
  agentColor: '#00b894',
  agentIcon: 'code',
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
  agentColor: '#00b894',
  agentIcon: 'code',
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

- [ ] **Step 2: 同步更新 team-001 日志**

在 `MOCK_LOGS['team-001']` 数组开头添加 4 条新日志：

```javascript
{ time: '15:18:45', content: 'Code Agent: 提供内存泄漏修复方案' },
{ time: '15:15:30', content: '用户: 反馈清理函数未执行' },
{ time: '15:12:15', content: 'Code Agent: 分析内存泄漏原因' },
{ time: '15:10:00', content: '用户: 提出内存泄漏问题' },
```

- [ ] **Step 3: 运行开发服务器测试**

Run: `npm run dev`
Expected: 应用正常启动

- [ ] **Step 4: 手动测试 team-001**

1. 打开应用，切换到 "产品研发团队"
2. 检查是否显示 7 条历史消息
Expected: 显示 7 条消息，包括新增的内存泄漏调试对话

- [ ] **Step 5: Commit**

```bash
git add src/utils/mockData.js
git commit -m "feat: expand team-001 conversation history"
```

---

## Task 6: 扩充 team-002 对话历史

**Files:**
- Modify: `src/utils/mockData.js:308-362`

**Interfaces:**
- Consumes: `RESPONSE_TYPES`
- Produces: 扩充后的 `MOCK_MESSAGES['team-002']`, `MOCK_LOGS['team-002']`

- [ ] **Step 1: 扩充 team-002 消息**

在 `MOCK_MESSAGES['team-002']` 数组的第 3 个元素后添加 4 条新消息：

```javascript
{
  id: 'msg-104',
  type: 'user',
  content: '哪些工具对中文支持比较好？',
  timestamp: '10:25'
},
{
  id: 'msg-105',
  type: 'agent',
  agentId: 2,
  agentName: 'Research Agent',
  agentColor: '#3498db',
  agentIcon: 'search',
  responseType: RESPONSE_TYPES.TABLE,
  data: {
    headers: ['产品', '中文支持', '评分', '特点'],
    rows: [
      ['产品A', '★★★★★', '9.2/10', '原生中文模型'],
      ['产品B', '★★★★☆', '8.5/10', '经过中文微调'],
      ['产品C', '★★★☆☆', '7.0/10', '通用模型'],
      ['我们的产品', '★★★★★', '待验证', '专注中文场景']
    ],
    caption: '中文市场 AI 工具对比'
  },
  timestamp: '10:28'
},
{
  id: 'msg-106',
  type: 'user',
  content: '我们的差异化机会在哪里？',
  timestamp: '10:32'
},
{
  id: 'msg-107',
  type: 'agent',
  agentId: 2,
  agentName: 'Research Agent',
  agentColor: '#3498db',
  agentIcon: 'search',
  responseType: RESPONSE_TYPES.DOCUMENT,
  data: {
    sections: [
      {
        title: '差异化机会',
        content: '基于竞品分析，我认为有以下几个机会点：\n\n1. **垂直深耕**：专注特定行业（如法律、医疗、金融）的中文场景\n2. **工作流整合**：深度整合企业现有的 IM、文档、CRM 系统\n3. **私有化部署**：满足企业数据安全需求'
      },
      {
        title: '建议行动',
        content: '建议先选择 1-2 个垂直场景进行深度调研，验证真实需求后再扩展。'
      }
    ]
  },
  timestamp: '10:36'
}
```

- [ ] **Step 2: 同步更新 team-002 日志**

在 `MOCK_LOGS['team-002']` 数组开头添加 4 条新日志：

```javascript
{ time: '10:36:30', content: 'Research Agent: 分析差异化机会' },
{ time: '10:32:15', content: '用户: 询问差异化定位' },
{ time: '10:28:20', content: 'Research Agent: 提供中文市场对比' },
{ time: '10:25:00', content: '用户: 询问中文支持情况' },
```

- [ ] **Step 3: 运行开发服务器测试**

Run: `npm run dev`
Expected: 应用正常启动

- [ ] **Step 4: 手动测试 team-002**

1. 打开应用，切换到 "市场分析团队"
2. 检查是否显示 7 条历史消息
Expected: 显示 7 条消息，包括新增的中文市场分析对话

- [ ] **Step 5: Commit**

```bash
git add src/utils/mockData.js
git commit -m "feat: expand team-002 conversation history"
```

---

## Task 7: 扩充 team-003 对话历史

**Files:**
- Modify: `src/utils/mockData.js:363-400`

**Interfaces:**
- Consumes: `RESPONSE_TYPES`
- Produces: 扩充后的 `MOCK_MESSAGES['team-003']`, `MOCK_LOGS['team-003']`

- [ ] **Step 1: 扩充 team-003 消息**

在 `MOCK_MESSAGES['team-003']` 数组的第 1 个元素后添加 4 条新消息：

```javascript
{
  id: 'msg-202',
  type: 'user',
  content: '能不能帮我改得更有吸引力一点？',
  timestamp: '09:12'
},
{
  id: 'msg-203',
  type: 'agent',
  agentId: 3,
  agentName: 'Writing Agent',
  agentColor: '#a855f7',
  agentIcon: 'document',
  responseType: RESPONSE_TYPES.DOCUMENT,
  data: {
    sections: [
      {
        title: '优化版本',
        content: '邮件主题：🚀 重磅发布：全新产品，重新定义您的工作方式\n\n尊敬的用户，\n\n经过 6 个月的精心打磨，我们激动地向您介绍全新版本的产品。\n\n**核心亮点**\n✓ 效率提升 40%，让您更快完成工作\n✓ 智能推荐系统，节省 50% 决策时间\n✓ 企业级安全，数据加密传输存储\n\n**限时优惠**\n首月免费试用，立即体验！\n\n点击下方按钮开启高效工作之旅。'
      },
      {
        title: '优化说明',
        content: '主要改进：\n• 增加具体数字（40%、50%）增强说服力\n• 使用列表格式提高可读性\n• 增加"限时优惠"元素提升紧迫感'
      }
    ]
  },
  timestamp: '09:16'
},
{
  id: 'msg-204',
  type: 'user',
  content: '再加个用户引用会更好',
  timestamp: '09:20'
},
{
  id: 'msg-205',
  type: 'agent',
  agentId: 3,
  agentName: 'Writing Agent',
  agentColor: '#a855f7',
  agentIcon: 'document',
  responseType: RESPONSE_TYPES.DOCUMENT,
  data: {
    sections: [
      {
        title: '最终版本（含用户引用）',
        content: '邮件主题：🚀 重磅发布：全新产品，重新定义您的工作方式\n\n尊敬的用户，\n\n经过 6 个月的精心打磨，我们激动地向您介绍全新版本的产品。\n\n**用户真实反馈**\n\n"使用这款产品后，我的工作效率提升了至少 40%。"\n— 张经理，某互联网公司\n\n"终于有一个工具真正懂我的需求，简单而强大。"\n— 李总监，传统企业\n\n**核心亮点**\n✓ 效率提升 40%，让您更快完成工作\n✓ 智能推荐系统，节省 50% 决策时间\n✓ 企业级安全，数据加密传输存储\n\n**限时优惠**\n首月免费试用，立即体验！\n\n点击下方按钮开启高效工作之旅。'
      }
    ]
  },
  timestamp: '09:25'
}
```

- [ ] **Step 2: 同步更新 team-003 日志**

在 `MOCK_LOGS['team-003']` 数组开头添加 4 条新日志：

```javascript
{ time: '09:25:30', content: 'Writing Agent: 添加用户引用' },
{ time: '09:20:15', content: '用户: 要求添加用户引用' },
{ time: '09:16:20', content: 'Writing Agent: 优化文案吸引力' },
{ time: '09:12:00', content: '用户: 要求修改文案' },
```

- [ ] **Step 3: 运行开发服务器测试**

Run: `npm run dev`
Expected: 应用正常启动

- [ ] **Step 4: 手动测试 team-003**

1. 打开应用，切换到 "内容创作团队"
2. 检查是否显示 7 条历史消息
Expected: 显示 7 条消息，包括新增的文案迭代对话

- [ ] **Step 5: Commit**

```bash
git add src/utils/mockData.js
git commit -m "feat: expand team-003 conversation history"
```

---

## Task 8: 扩充 team-004 对话历史

**Files:**
- Modify: `src/utils/mockData.js:401-445`

**Interfaces:**
- Consumes: `RESPONSE_TYPES`
- Produces: 扩充后的 `MOCK_MESSAGES['team-004']`, `MOCK_LOGS['team-004']`

- [ ] **Step 1: 扩充 team-004 消息**

在 `MOCK_MESSAGES['team-004']` 数组的第 3 个元素后添加 4 条新消息：

```javascript
{
  id: 'msg-304',
  type: 'user',
  content: '这个配色能调整得更现代一点吗？',
  timestamp: '16:40'
},
{
  id: 'msg-305',
  type: 'agent',
  agentId: 6,
  agentName: 'Design Agent',
  agentColor: '#d63031',
  agentIcon: 'palette',
  responseType: RESPONSE_TYPES.COMPOSITE,
  data: {
    items: [
      {
        type: RESPONSE_TYPES.TEXT,
        data: {
          content: '**现代配色建议**\n\n当前配色偏传统，我建议采用更现代的渐变配色方案：'
        }
      },
      {
        type: RESPONSE_TYPES.TABLE,
        data: {
          headers: ['用途', '当前配色', '建议配色', '效果'],
          rows: [
            ['主色', '#d63031', 'linear-gradient(135deg, #667eea, #764ba2)', '渐变紫'],
            ['强调', '#fd79a8', 'linear-gradient(135deg, #f093fb, #f5576c)', '粉紫渐变'],
            ['背景', '#ffffff', '#f8fafc with glassmorphism', '毛玻璃效果']
          ],
          caption: '配色方案对比'
        }
      }
    ]
  },
  timestamp: '16:43'
},
{
  id: 'msg-306',
  type: 'user',
  content: '能展示一下效果吗？',
  timestamp: '16:46'
},
{
  id: 'msg-307',
  type: 'agent',
  agentId: 6,
  agentName: 'Design Agent',
  agentColor: '#d63031',
  agentIcon: 'palette',
  responseType: RESPONSE_TYPES.IMAGE,
  data: {
    url: 'https://picsum.photos/seed/modern-ui/800/600',
    alt: '现代风格 UI 设计稿'
  },
  timestamp: '16:50'
}
```

- [ ] **Step 2: 同步更新 team-004 日志**

在 `MOCK_LOGS['team-004']` 数组开头添加 4 条新日志：

```javascript
{ time: '16:50:30', content: 'Design Agent: 生成现代风格设计稿' },
{ time: '16:46:15', content: '用户: 请求查看效果' },
{ time: '16:43:20', content: 'Design Agent: 建议现代配色方案' },
{ time: '16:40:00', content: '用户: 要求调整配色' },
```

- [ ] **Step 3: 运行开发服务器测试**

Run: `npm run dev`
Expected: 应用正常启动

- [ ] **Step 4: 手动测试 team-004**

1. 打开应用，切换到 "UI/UX设计团队"
2. 检查是否显示 7 条历史消息
Expected: 显示 7 条消息，包括新增的设计评审对话

- [ ] **Step 5: Commit**

```bash
git add src/utils/mockData.js
git commit -m "feat: expand team-004 conversation history"
```

---

## Task 9: 扩充 team-005 对话历史

**Files:**
- Modify: `src/utils/mockData.js:446-492`

**Interfaces:**
- Consumes: `RESPONSE_TYPES`
- Produces: 扩充后的 `MOCK_MESSAGES['team-005']`, `MOCK_LOGS['team-005']`

- [ ] **Step 1: 扩充 team-005 消息**

在 `MOCK_MESSAGES['team-005']` 数组的第 3 个元素后添加 4 条新消息：

```javascript
{
  id: 'msg-404',
  type: 'user',
  content: '能帮我预测一下下季度的趋势吗？',
  timestamp: '11:30'
},
{
  id: 'msg-405',
  type: 'agent',
  agentId: 5,
  agentName: 'Data Analyst Agent',
  agentColor: '#e17055',
  agentIcon: 'chart',
  responseType: RESPONSE_TYPES.COMPOSITE,
  data: {
    items: [
      {
        type: RESPONSE_TYPES.TEXT,
        data: {
          content: '**下季度趋势预测**\n\n基于历史数据和市场信号，我做出了以下预测：'
        }
      },
      {
        type: RESPONSE_TYPES.CHART,
        data: {
          diagram: `graph LR
    A[Q2数据] --> B[分析模型]
    B --> C{预测结果}
    C --> D[乐观: +25%]
    C --> E[中性: +15%]
    C --> F[保守: +8%]
    
    style D fill:#10b981
    style E fill:#f59e0b
    style F fill:#ef4444`,
          caption: 'Q3 预测模型'
        }
      },
      {
        type: RESPONSE_TYPES.TABLE,
        data: {
          headers: ['情景', '增长率', '关键假设', '建议'],
          rows: [
            ['乐观', '+25%', '市场热度持续+竞品放缓', '加大投入'],
            ['中性', '+15%', '维持现状', '稳步推进'],
            ['保守', '+8%', '经济放缓+竞争加剧', '控制成本']
          ],
          caption: '情景分析'
        }
      }
    ]
  },
  timestamp: '11:36'
},
{
  id: 'msg-406',
  type: 'user',
  content: '哪个情景最可能发生？',
  timestamp: '11:40'
},
{
  id: 'msg-407',
  type: 'agent',
  agentId: 5,
  agentName: 'Data Analyst Agent',
  agentColor: '#e17055',
  agentIcon: 'chart',
  responseType: RESPONSE_TYPES.TEXT,
  data: {
    content: `**概率判断**

基于当前信号，我认为：

• **中性情景 (60%)**：最可能，建议按此计划预算
• **乐观情景 (25%)**：有一定可能，准备好扩张预案
• **保守情景 (15%)**：小概率，做好风险对冲

**建议策略**：
按中性情景规划，同时保持灵活性——每月重新评估，根据早期信号调整方向。`
  },
  timestamp: '11:45'
}
```

- [ ] **Step 2: 同步更新 team-005 日志**

在 `MOCK_LOGS['team-005']` 数组开头添加 4 条新日志：

```javascript
{ time: '11:45:30', content: 'Data Analyst: 给出情景概率判断' },
{ time: '11:40:15', content: '用户: 询问最可能情景' },
{ time: '11:36:20', content: 'Data Analyst: 完成趋势预测分析' },
{ time: '11:30:00', content: '用户: 请求下季度预测' },
```

- [ ] **Step 3: 运行开发服务器测试**

Run: `npm run dev`
Expected: 应用正常启动

- [ ] **Step 4: 手动测试 team-005**

1. 打开应用，切换到 "数据分析团队"
2. 检查是否显示 7 条历史消息
Expected: 显示 7 条消息，包括新增的趋势预测对话

- [ ] **Step 5: Commit**

```bash
git add src/utils/mockData.js
git commit -m "feat: expand team-005 conversation history"
```

---

## Task 10: 端到端测试

**Files:**
- Test: 所有修改的文件

**Interfaces:**
- 无

- [ ] **Step 1: 运行开发服务器**

Run: `npm run dev`
Expected: 应用正常启动，访问 http://localhost:5173

- [ ] **Step 2: 测试关键词匹配**

对于每个 Agent 类型，发送包含对应关键词的消息：
1. Code Agent - 发送 "帮我修复 bug"
2. Research Agent - 发送 "做个市场调研"
3. Writing Agent - 发送 "帮我写文案"
4. Data Analyst Agent - 发送 "分析数据"
5. Design Agent - 发送 "设计UI"
6. Strategy Agent - 发送 "制定战略"
7. Product Agent - 发送 "写PRD"

Expected: 每个 Agent 返回对应的关键词响应内容

- [ ] **Step 3: 测试默认响应**

发送不含关键词的消息，如 "你好"
Expected: 返回对应 Agent 的默认响应

- [ ] **Step 4: 测试团队对话历史**

切换到每个团队，检查历史消息：
1. team-001 - 产品研发团队（7条消息）
2. team-002 - 市场分析团队（7条消息）
3. team-003 - 内容创作团队（7条消息）
4. team-004 - UI/UX设计团队（7条消息）
5. team-005 - 数据分析团队（7条消息）

Expected: 每个团队显示 7 条历史消息，包括新增的多轮对话

- [ ] **Step 5: 测试日志显示**

检查每个团队的日志是否与消息对应
Expected: 日志条目与对话流程匹配

- [ ] **Step 6: 测试响应渲染**

检查各种响应类型的渲染：
1. TEXT - 文本响应
2. CODE - 代码响应
3. TABLE - 表格响应
4. DOCUMENT - 文档响应
5. COMPOSITE - 组合响应
6. CHART - 图表响应
7. IMAGE - 图片响应

Expected: 所有类型正确渲染

- [ ] **Step 7: 清理并最终提交**

```bash
git add .
git commit -m "test: complete mock data enrichment"
```

---

## 完成标准

- [ ] 所有 5 个团队的对话历史扩充到 7 条消息
- [ ] 所有 7 个 Agent 类型都有完整的关键词响应定义
- [ ] 关键词匹配在实时对话中正确工作
- [ ] 默认 fallback 响应正常工作
- [ ] 所有响应类型（TEXT, CODE, TABLE, DOCUMENT, COMPOSITE, CHART, IMAGE）正确渲染
- [ ] 日志与消息正确对应
- [ ] 无控制台错误
- [ ] 通过手动端到端测试
