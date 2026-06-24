// 响应类型定义
export const RESPONSE_TYPES = {
  TEXT: 'text',
  CODE: 'code',
  TABLE: 'table',
  CHART: 'chart',
  FORMULA: 'formula',
  IMAGE: 'image',
  DOCUMENT: 'document',
  COMPOSITE: 'composite' // 新增：组合类型
}

// Agent 能力映射
export const AGENT_CAPABILITIES = {
  chat: ['text', 'code', 'table', 'chart', 'formula', 'image', 'document'],
  search: ['table', 'document', 'text'],
  document: ['document', 'text'],
  code: ['code', 'text'],
  chart: ['formula', 'table', 'chart', 'text'],
  palette: ['image', 'chart', 'text'],
  lightbulb: ['chart', 'table', 'document', 'text'],
  rocket: ['table', 'chart', 'document', 'text']
}

// 根据 Agent 图标获取支持的响应类型
export const getAgentResponseTypes = (agentIcon) => {
  return AGENT_CAPABILITIES[agentIcon] || ['text']
}
