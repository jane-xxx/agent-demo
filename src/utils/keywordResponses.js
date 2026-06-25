// 关键词匹配响应数据
import { RESPONSE_TYPES } from './responseTypes.js'

export const KEYWORD_RESPONSES = {
  code: [
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
  ],
  research: [],
  writing: [],
  data: [],
  design: [],
  strategy: [],
  product: []
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
  research: null,
  writing: null,
  data: null,
  design: null,
  strategy: null,
  product: null
}
