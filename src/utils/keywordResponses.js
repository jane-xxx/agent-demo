// 关键词匹配响应数据
import { RESPONSE_TYPES } from './responseTypes.js'

export const KEYWORD_RESPONSES = {
  code: [
    {
      keywords: ['bug', '修复', '错误', 'leak', '泄漏', '警告', 'warning', 'fix', 'error'],
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
  ],
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
  ],
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
  ],
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
  ],
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
                alt: '图片呈现占位示例（随机照片，非 UI 设计稿）',
                caption: '仅用于演示图片加载、预览与下载，不是生成的界面设计。'
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
  ],
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
  ],
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
• 使用场景描述`
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
  ],
  chat: [
    {
      keywords: ['分析', '建议', '如何', '怎么', 'what', 'how', '为什么'],
      response: {
        responseType: RESPONSE_TYPES.COMPOSITE,
        data: {
          items: [
            {
              type: RESPONSE_TYPES.TEXT,
              data: {
                content: '**综合分析**\n\n这个问题涉及多个层面，我建议：\n\n• **短期**：快速验证核心假设\n• **中期**：优化和完善解决方案\n• **长期**：建立可持续的竞争优势\n\n需要更详细的某个方面分析吗？'
              }
            }
          ]
        }
      }
    },
    {
      keywords: ['讨论', '想法', '意见', 'discuss', 'idea', 'opinion'],
      response: {
        responseType: RESPONSE_TYPES.TEXT,
        data: {
          content: `**多角度思考**

从不同角度来看这个问题：

• **用户视角**：关注体验和效率
• **技术视角**：考虑可行性和成本
• **商业视角**：评估价值和收益

你想深入探讨哪个方向？`
        }
      }
    }
  ]
}

// 默认 fallback 响应
export const DEFAULT_RESPONSES = {
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
  },
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
  },
  chat: {
    responseType: RESPONSE_TYPES.TEXT,
    data: {
      content: `我可以从多个角度为你分析和提供建议。

**请告诉我：**
• 你想解决的具体问题
• 需要分析的维度（技术/商业/用户体验）
• 期望的输出形式（建议/方案/对比）

我会给出综合性的分析。`
    }
  }
}
