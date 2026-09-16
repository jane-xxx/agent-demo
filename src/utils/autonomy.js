// 自主协作（合同网协议）的规则层：纯函数，无 Vue 依赖
// 决策分布：是否投标由各智能体的能力词表决定，执行顺序由「谁投了标 × 角色依赖」在运行时产生。
// 未来接真实模型时，matchScore / 验收规则即为可替换为模型决策的接口。
import { KEYWORD_RESPONSES } from './keywordResponses.js'
import { RESPONSE_TYPES } from './responseTypes.js'

// ============================================
// 角色依赖：谁消费谁的产出（信息提供 → 内容生产 → 审阅验收）
// ============================================

const ROLE_BY_ICON = {
  search: { key: 'info', rank: 0, name: '信息提供' },
  chart: { key: 'info', rank: 0, name: '信息提供' },
  document: { key: 'produce', rank: 1, name: '内容生产' },
  code: { key: 'produce', rank: 1, name: '内容生产' },
  palette: { key: 'produce', rank: 1, name: '内容生产' },
  chat: { key: 'produce', rank: 1, name: '内容生产' },
  lightbulb: { key: 'synthesize', rank: 2, name: '规划洞察' },
  rocket: { key: 'synthesize', rank: 2, name: '规划洞察' }
}

// 未知 icon 归入内容生产（通用执行层）
const FALLBACK_ROLE = { key: 'produce', rank: 1, name: '内容生产' }

export const roleOfAgent = (icon) => ROLE_BY_ICON[icon] || FALLBACK_ROLE

// 认领轻语文案（按角色的自然表态，出现在聊天流里）
export const claimUtterance = (icon, score = 0) => {
  const role = roleOfAgent(icon)
  if (role.key === 'info') {
    return score >= 3 ? '这正是我的领域，我先收集信息，产出给大家用' : '我先收集信息，产出给大家用'
  }
  return '我来认领这个任务，给出完整产出'
}

// ============================================
// 投标：任务文本 × 能力词表 → 匹配得分
// ============================================

// icon → 关键词响应分组（与 useChat 的 iconToResponseMap 保持一致）
const RESPONSE_KEY_BY_ICON = {
  code: 'code',
  search: 'research',
  document: 'writing',
  chart: 'data',
  palette: 'design',
  lightbulb: 'strategy',
  rocket: 'product',
  chat: 'chat'
}

// 意图词表：表达「要做什么」的动词/领域词，只用于认领判断，不参与回复模板匹配
// （模板词表覆盖的是问题域——bug/接口/性能；没有意图动词时，「如何实现一个记账APP」
//   这类任务会全员弃权，最该认领的代码反而沉默）
const INTENT_KEYWORDS = {
  code: ['实现', '开发', '写一个', '做一个', '构建', '搭建', '编码', '部署', 'app', '应用', '小程序', '网站', '程序', '前端', '后端'],
  research: ['行业', '竞品', '情报', '用户调研', '市场规模', '背景'],
  writing: ['文档', '报告', '总结', '说明', '撰写', '写一份', '写一个'],
  data: ['指标', '报表', '埋点', '看板'],
  design: ['原型', '界面', '页面', '交互', '视觉', '样式'],
  strategy: ['策略', '定位', '打法', '商业模式'],
  product: ['需求', '功能', '落地', '实现', 'prd', 'mvp'],
  chat: ['看法', '建议', '聊聊', '讨论']
}

// 能力词表：模板关键词 ∪ 意图词 ∪ 智能体自身 tags
export const capabilityKeywords = (agent) => {
  const responseKey = RESPONSE_KEY_BY_ICON[agent.icon] || 'chat'
  const responseWords = (KEYWORD_RESPONSES[responseKey] || []).flatMap(item => item.keywords)
  const intentWords = INTENT_KEYWORDS[responseKey] || []
  return [...new Set([...responseWords, ...intentWords, ...(agent.tags || [])])]
}

// ============================================
// 任务拆解：意图识别 → 子任务板（后台步骤，只结构化不指派）
// 边界：展开「隐含的」子需求，不脑补「缺失的」——意图不明时返回空板，走反问兜底
// ============================================

// 意图词表（判断任务类型，多标签打分）
const INTENT_VOCAB = {
  dev: ['实现', '开发', '写一个', '做一个', '构建', '搭建', 'app', '应用', '小程序', '网站', '程序', '功能'],
  research: ['调研', '市场', '竞品', '行业', '趋势', '分析', '数据', '研究', '洞察'],
  content: ['文案', '写一份', '撰写', '公告', '邮件', '文档', '报告', '方案', '总结', '内容', '介绍'],
  design: ['设计', '界面', '原型', '页面', '交互', '视觉', '配色'],
  strategy: ['战略', '规划', '路线图', '商业模式', '定位', '策略', '增长']
}

// 拆解模板：意图 → 按流水线顺序的子任务板（子任务文本用领域语言写，供各智能体认领匹配）
const DECOMPOSITION_TEMPLATES = {
  research: [
    { key: 'info', name: '信息收集', text: '市场与竞品信息收集、数据分析' },
    { key: 'insight', name: '分析产出', text: '分析结论与洞察产出' }
  ],
  dev: [
    { key: 'req', name: '需求梳理', text: '功能与需求梳理，明确核心场景' },
    { key: 'impl', name: '技术实现', text: '技术实现与开发方案' },
    { key: 'ui', name: '界面设计', text: '界面与交互设计' }
  ],
  content: [
    { key: 'produce', name: '内容产出', text: '内容创作与文案产出' }
  ],
  design: [
    { key: 'produce', name: '设计产出', text: '视觉与交互设计产出' }
  ],
  strategy: [
    { key: 'produce', name: '策略产出', text: '策略与规划方案产出' }
  ]
}

// 任务 → 子任务板（无明确意图返回空板，调用方走整句挂板的现状路径）
export const decomposeTask = (task) => {
  const text = String(task || '').toLowerCase()
  const intents = Object.entries(INTENT_VOCAB)
    .map(([key, words]) => ({ key, score: words.filter(w => text.includes(w)).length }))
    .filter(intent => intent.score > 0)
  if (intents.length === 0) {
    return { subtasks: [] }
  }

  const has = key => intents.some(intent => intent.key === key)
  const subtasks = []
  if (has('research')) subtasks.push(...DECOMPOSITION_TEMPLATES.research)
  if (has('dev')) subtasks.push(...DECOMPOSITION_TEMPLATES.dev)
  if (has('content')) subtasks.push(...DECOMPOSITION_TEMPLATES.content)
  // dev 板已含界面设计子任务，纯设计意图才追加设计产出，避免重复
  if (has('design') && !has('dev')) subtasks.push(...DECOMPOSITION_TEMPLATES.design)
  if (has('strategy')) subtasks.push(...DECOMPOSITION_TEMPLATES.strategy)
  return { subtasks }
}

// 匹配得分 = 命中词数（每个词只计一次）
export const matchScore = (agent, task) => {
  const text = String(task || '').toLowerCase()
  return capabilityKeywords(agent).reduce((hits, word) => {
    const w = String(word).toLowerCase()
    return hits + (w && text.includes(w) ? 1 : 0)
  }, 0)
}

// 得分 → 展示匹配度
export const bidPercent = (score) => {
  return Math.min(96, 55 + score * 13)
}

// ============================================
// 内建自检：占位符补全（生成时自动填充，不可见的质量兜底）
// ============================================

// 形如 [产品名称] / [填写产品名] 的未填模板位（1-12 字，非空括号）
const PLACEHOLDER_RE = /\[[^\[\]\n]{1,12}\]/g

// ============================================
// 打回修订：占位符填充字典（按括号内标签匹配，未命中用通用值）
// ============================================

const PLACEHOLDER_FILLS = [
  [/填写产品名|产品名称/, '本产品'],
  [/目标用户/, '目标用户群体'],
  [/核心价值/, '高效完成核心任务'],
  [/传统方案/, '人工流程'],
  [/具体场景|场景/, '日常核心场景'],
  [/痛点|痛点问题/, '当前流程痛点'],
  [/期望结果|结果/, '预期成果'],
  [/用户\/客户|用户|客户|合作伙伴/, '尊敬的合作伙伴'],
  [/事项/, '本次产品发布'],
  [/详细说明|说明|描述/, '具体变更内容'],
  [/具体时间|时间/, '下周五 10:00'],
  [/重要提醒|提醒/, '请及时关注官方通知'],
  [/对接人|联系方式|发送方/, '项目组'],
  [/日期/, '今日'],
  [/用户收益/, '使用体验显著提升'],
  [/链接/, '产品官网首页'],
  [/^X$/, '3'],
  [/X/, '30']
]

const fillPlaceholder = (raw) => {
  const label = raw.slice(1, -1).trim()
  const rule = PLACEHOLDER_FILLS.find(([re]) => re.test(label))
  return rule ? rule[1] : '已补充'
}

// 递归替换响应数据里的所有占位符（跳过 code 字段，不动代码内容）
const fillStringsWithin = (value, isCodeField = false) => {
  if (typeof value === 'string') {
    return isCodeField ? value : value.replace(PLACEHOLDER_RE, m => fillPlaceholder(m))
  }
  if (Array.isArray(value)) {
    return value.map(item => fillStringsWithin(item, isCodeField))
  }
  if (value && typeof value === 'object') {
    const out = {}
    Object.entries(value).forEach(([key, val]) => {
      out[key] = fillStringsWithin(val, key === 'code' || key === 'language')
    })
    return out
  }
  return value
}

// 打回后的修订转换：填充全部占位符，产出可见地补全
export const applyReviewFix = (message) => ({
  ...message,
  data: fillStringsWithin(message.data)
})

// ============================================
// 数据流：上游产出摘要 → 下游承接（依赖排序的真实因果）
// ============================================

// 表格 → 事实短句（维度 + 数据 + 趋势，真实数字就在这里）
const tableFacts = (table) => {
  if (!table?.rows?.length) return ''
  const cap = table.caption ? `${table.caption}：` : ''
  return cap + table.rows.slice(0, 3).map(row => row.slice(0, 3).join(' ')).join('，')
}

const proseFacts = (text) => String(text || '').replace(/\s+/g, ' ').trim().slice(0, 50)

// 汇总已完成的产出为承接摘要（含表格数字），供下游生成时引用
export const buildUpstreamDigest = (outputs = []) => {
  if (!outputs.length) return ''
  return outputs.map(({ agent, message }) => {
    const facts = []
    const data = message?.data
    switch (message?.responseType) {
      case RESPONSE_TYPES.TABLE:
        facts.push(tableFacts(data))
        break
      case RESPONSE_TYPES.TEXT:
        facts.push(proseFacts(data?.content))
        break
      case RESPONSE_TYPES.DOCUMENT:
        facts.push(proseFacts(data?.sections?.[0]?.content))
        break
      case RESPONSE_TYPES.COMPOSITE:
        ;(data?.items || []).forEach(item => {
          if (item.type === RESPONSE_TYPES.TABLE) facts.push(tableFacts(item.data))
          if (item.type === RESPONSE_TYPES.TEXT) facts.push(proseFacts(item.data?.content))
          if (item.type === RESPONSE_TYPES.DOCUMENT) facts.push(proseFacts(item.data?.sections?.[0]?.content))
        })
        break
      default:
        break
    }
    const text = facts.filter(Boolean).join('；').slice(0, 120)
    return `${agent.name}：${text || '已完成结构化产出'}`
  }).join('；')
}

// 把上游摘要作为「承接段」注入下游响应开头（仅 TEXT/DOCUMENT/COMPOSITE；
// 代码/图片等形态原样返回，不硬造引用）
export const withUpstreamContext = (message, digest) => {
  if (!digest) return message
  const label = `**承接上游产出**\n${digest}`
  const data = message?.data

  switch (message?.responseType) {
    case RESPONSE_TYPES.TEXT:
      return { ...message, data: { ...data, content: `${label}\n\n${data.content}` } }
    case RESPONSE_TYPES.DOCUMENT:
      return {
        ...message,
        data: { ...data, sections: [{ title: '承接上游产出', content: digest }, ...(data.sections || [])] }
      }
    case RESPONSE_TYPES.COMPOSITE:
      return {
        ...message,
        data: {
          ...data,
          items: [{ type: RESPONSE_TYPES.TEXT, data: { content: label } }, ...(data.items || [])]
        }
      }
    default:
      return message
  }
}

