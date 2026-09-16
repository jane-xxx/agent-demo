import { RESPONSE_TYPES } from './responseTypes.js'

export function parseAgentMentions(text) {
  return [...String(text || '').matchAll(/(?:^|[\s，。；：、])@([^\s，。；：、!?！？]+)/g)].map(match => match[1])
}

// 前端规则演示：能力由职能声明，回复模板消费结构化上游交付。
const CAPABILITIES = {
  rocket: ['requirements'], palette: ['design'], code: ['implementation'],
  search: ['research'], chart: ['analysis'], document: ['writing'],
  lightbulb: ['strategy'], chat: ['conversation']
}
const LABELS = { requirements: '产品规划', design: '交互设计', implementation: '软件开发', research: '信息调研', analysis: '数据分析', writing: '内容写作', strategy: '战略规划', conversation: '通用对话' }
const step = (key, name, capability, deliverable, dependencies = []) => ({ key, name, capability, deliverable, dependencies })
const ACCOUNTING_FEATURES = [
  { label: '收支录入', pattern: /收支录入|记一笔|记账|收入|支出/ },
  { label: '账单分类', pattern: /账单分类|分类管理|分类统计|消费分类|类别/ },
  { label: '月度统计', pattern: /月度统计|分类统计|统计|报表|趋势|图表/ },
  { label: '预算管理', pattern: /预算管理|预算提醒|预算|超支提醒/ }
]

// 输入按历史 → 本轮排列；同一子任务只保留最后一份有效交付。
export function latestDeliveries(outputs) {
  const latest = new Map()
  for (const output of outputs) {
    if (!output.artifact || (output.message?.deliveryStatus && output.message.deliveryStatus !== 'completed')) continue
    latest.set(output.key || output.subtask, output)
  }
  return [...latest.values()]
}

export function identifyTask(task) {
  let text = String(task || '').toLowerCase()
  // 明确限制先于主题词；被否定的分句不参与识别。
  text = text.replace(/(?:不要|无需|不需要|别)([^，。；,;]+)/g, '')
  const only = text.match(/(?:只需要|只需|仅需|只要|仅|只)([^。；;]+)/)
  if (only && /写|撰写|开发|实现|设计|调研|分析|整理/.test(only[1])) text = only[1]
  const research = /调研|竞品|研究|市场分析|行业分析/.test(text)
  const development = /实现|开发|构建|搭建|做一个|写一个.*(?:app|应用|网站|程序)|制作.*(?:app|应用|网站|程序)/.test(text)
  const design = /设计|原型|界面|交互|配色/.test(text)
  const writing = /写.*(?:邮件|文案|报告|文档|方案|介绍|公告)|撰写|总结|整理.*(?:报告|文档|方案)/.test(text)
  const subtasks = []
  if (research) subtasks.push(step('research', '信息调研', 'research', '调研问题、对比维度与待验证事实'))
  if (/数据分析|分析.*数据|统计|报表|看板/.test(text)) subtasks.push(step('analysis', '数据分析', 'analysis', '统计维度与分析方法'))
  if (development) subtasks.push(
    step('requirements', '需求梳理', 'requirements', '核心功能、范围与验收要求'),
    step('design', '页面设计', 'design', '页面结构与操作流程', ['requirements']),
    step('implementation', '实现方案', 'implementation', '数据结构与开发步骤', ['requirements', 'design'])
  )
  else if (design) subtasks.push(step('design', '设计方案', 'design', '页面结构与操作流程'))
  if (!development && /代码|编程|bug|修复|接口|hook|性能优化/.test(text)) subtasks.push(step('technical', '技术处理', 'implementation', '问题分析与技术建议'))
  if (!development && /需求|产品规划|功能规划|prd|mvp/.test(text)) subtasks.push(step('requirements', '需求梳理', 'requirements', '核心功能、范围与验收要求'))
  if (/战略|增长策略|商业模式|定位|路线图/.test(text)) subtasks.push(step('strategy', '策略规划', 'strategy', '目标、行动与验证指标'))
  if (writing) subtasks.push(step('writing', '文档整理', 'writing', '整合后的文稿', subtasks.map(s => s.key)))
  if (!subtasks.length && /你好|您好|谢谢|聊聊|看法|建议/.test(text)) subtasks.push(step('conversation', '通用交流', 'conversation', '交流回复'))
  return { task, subtasks, needsClarification: !subtasks.length }
}

export function resolveFollowup(content, messages) {
  const referring = /刚才|上一轮|上面|上述|继续|再完善|再优化|在此基础|增加|添加|补充|改成/.test(content)
  if (!referring) return { task: content, upstream: [] }
  const lastUser = messages.findLastIndex(m => m.type === 'user')
  const replies = messages.slice(lastUser + 1).filter(m => m.artifact && m.deliveryStatus === 'completed')
  if (!replies.length) return { task: content, upstream: [], missingContext: true }
  const upstream = replies.map(m => ({ key: m.taskKey || ({ rocket: 'requirements', palette: 'design', code: 'implementation', document: 'writing' }[m.agentIcon]), agent: { name: m.agentName }, artifact: m.artifact, subtask: m.taskName || m.agentName }))
  const scope = replies.find(m => m.artifact.scope)?.artifact.scope
  return { task: `${scope || messages[lastUser].content}。本轮要求：${content}`, upstream, followup: true }
}

export function planCollaboration(task, agents, intentTask = task) {
  const board = { ...identifyTask(intentTask), task }
  const steps = board.subtasks.map(s => {
    const candidates = agents.filter(a => (a.capabilities || CAPABILITIES[a.icon] || []).includes(s.capability))
    return { ...s, capabilityLabel: LABELS[s.capability], agent: candidates[0] || null }
  })
  for (const s of steps) {
    s.blockedBy = s.dependencies.filter(key => {
      const dependency = steps.find(item => item.key === key)
      return !dependency?.agent || dependency.blockedBy?.length
    })
    s.status = !s.agent ? 'uncovered' : s.blockedBy.length ? 'blocked' : 'ready'
  }
  return { ...board, steps, missing: steps.filter(s => !s.agent), runnable: steps.filter(s => s.status === 'ready') }
}

export function recommendedAgents(plan, agents) {
  return agents.filter(a => plan.missing.some(s => (a.capabilities || CAPABILITIES[a.icon] || []).includes(s.capability)))
}

export function createDemoDelivery(task, subtask, upstream) {
  const accounting = /记账|收支|账单/.test(task)
  const scope = accounting ? '记账 APP' : task.replace(/\n/g, ' ').slice(0, 100)
  const requested = accounting ? ACCOUNTING_FEATURES.filter(f => f.pattern.test(task)).map(f => f.label) : []
  const previousFeatures = upstream.findLast(o => o.artifact?.features)?.artifact.features
  const features = [...new Set([...(previousFeatures || (requested.length ? requested : accounting ? ['收支录入', '账单分类', '月度统计'] : ['核心信息录入', '记录管理', '结果查看'])), ...requested])]
  const budgetReminder = accounting && /预算.*(?:提醒|规则)|提醒规则|超支提醒/.test(task)
  let artifact = { scope, features }
  let body = ''
  switch (subtask.capability) {
    case 'requirements':
      artifact.acceptance = features.map(f => `${f}可操作，结果保存后可重新查看`)
      if (budgetReminder && features.includes('预算管理')) {
        artifact.reminderRules = ['预算使用达到 80% 时提示关注', '预算使用达到 100% 时提示超支', '按分类分别计算预算占用']
      }
      body = `目标：${scope}。\n\n首版功能：${features.join('、')}。\n\n验收要求：\n${artifact.acceptance.map(a => `- ${a}`).join('\n')}\n\n范围假设：先提供单用户版本，账户同步与多人共享待确认。`
      if (artifact.reminderRules) body += `\n\n预算提醒规则：\n${artifact.reminderRules.map(rule => `- ${rule}`).join('\n')}`
      break
    case 'design':
      artifact.pages = features.map(f => ({ name: `${f}页`, feature: f }))
      body = `围绕${features.join('、')}组织页面：\n${artifact.pages.map(p => `- ${p.name}：支持${p.feature}，提供空状态、输入校验和操作反馈。`).join('\n')}\n\n操作流程：进入首页 → 选择功能 → 输入或查看信息 → 保存 → 返回查看结果。`
      if (budgetReminder && features.includes('预算管理')) body += '\n\n预算管理页补充：显示预算剩余额度、使用进度条和超支提示状态。'
      break
    case 'implementation': {
      const pages = upstream.findLast(o => o.key === 'design' && o.artifact?.pages)?.artifact.pages
        || upstream.findLast(o => o.artifact?.pages)?.artifact.pages || []
      const previousFields = upstream.findLast(o => o.artifact?.fields)?.artifact.fields
      artifact.pages = pages
      artifact.fields = previousFields || (accounting ? ['id', 'type', 'amount', 'category', 'date', 'note', ...(budgetReminder ? ['budgetLimit', 'budgetUsed', 'alertLevel'] : [])] : ['id', 'title', 'content', 'createdAt'])
      body = `实现范围：${features.join('、')}。\n\n页面模块：${pages.map(p => p.name).join('、') || '待补充页面方案'}。\n\n记录字段：${artifact.fields.join('、')}。\n\n开发步骤：\n1. 定义记录类型和输入校验。\n2. 建立数据存取模块。\n3. 实现上述页面与操作。\n4. 验证保存、修改、删除及结果统计。\n\n技术栈与部署方式待用户确认。`
      if (budgetReminder && features.includes('预算管理')) body += '\n\n预算提醒逻辑：按分类汇总支出，超过 80% 标记为 approaching，超过 100% 标记为 exceeded。'
      break
    }
    case 'research':
      artifact.dimensions = ['目标用户', '核心功能', '操作成本', '收费方式']
      body = `调研对象：${scope}。\n\n对比维度：${artifact.dimensions.join('、')}。\n\n建议收集官方产品资料与用户反馈，逐项记录来源、时间和差异。当前演示未检索外部资料，不提供未经验证的市场结论。`
      break
    case 'analysis':
      body = `分析对象：${scope}。\n\n先确认数据字段、时间范围和统计口径，再检查缺失与重复记录，按类别和时间聚合。当前未提供数据，因此这里交付分析方法，不生成统计数值。`
      break
    case 'writing':
      body = upstream.length
        ? `目标：${scope}。\n\n${upstream.map(o => `### ${o.subtask}\n${o.artifact.body}`).join('\n\n')}`
        : /邮件/.test(task)
          ? `主题：把每一笔收支，变成清晰可见的生活记录\n\n你好，\n\n记账不应只是保存数字，更应帮助你看清每一笔支出和每一项计划。现在，你可以通过收支录入、分类统计和预算提醒，在一个页面内管理日常账目。\n\n立即开始记录第一笔账，让预算更有把握。\n\n—— ${scope} 团队`
          : `围绕“${scope}”整理文稿。\n\n建议结构：背景 → 核心信息 → 读者需要采取的行动。\n\n请补充目标受众、具体事实与语气要求，以便形成完整正文。`
      break
    case 'strategy': body = `目标：${scope}。\n\n建议先明确目标人群与价值主张，以小范围验证检验需求，再根据反馈规划投入。验证指标与资源预算需要进一步确认。`; break
    default: body = `收到。你希望围绕“${scope}”了解哪一方面？`
  }
  artifact.body = body
  const sections = [
    { title: `${subtask.name} · 前端规则演示`, content: body },
    ...(task.includes('本轮要求：') ? [{ title: '本轮追问', content: task.split('本轮要求：').at(-1) + '\n规则演示仅支持已有模板与功能增补；任意修改要求不代表已实际实现。' }] : []),
    ...(upstream.length ? [{ title: '使用的上游交付', content: upstream.map(o => `${o.agent.name}：${o.subtask}`).join('；') }] : [])
  ]
  const items = [{ type: RESPONSE_TYPES.DOCUMENT, data: { sections } }]
  if (subtask.capability === 'requirements') items.push({
    type: RESPONSE_TYPES.TABLE,
    data: { headers: ['功能', '验收要求'], rows: features.map((f, i) => [f, artifact.acceptance[i]]), caption: '首版功能范围（规则演示）' }
  })
  if (subtask.capability === 'design') items.push({
    type: RESPONSE_TYPES.CHART,
    data: { diagram: 'flowchart TD\n  Home[首页]' + artifact.pages.map((page, i) => `\n  Home --> P${i}[${page.name}]\n  P${i} --> Saved[保存并查看结果]`).join(''), caption: '根据上游功能清单生成的页面流程' }
  })
  if (subtask.capability === 'design') items.push({
    type: RESPONSE_TYPES.IMAGE,
    data: {
      url: '/mock-budget-design-preview.svg',
      alt: `${scope} 页面视觉示例`,
      caption: '预算管理页面视觉示例（预置演示）'
    }
  })
  if (subtask.capability === 'implementation') items.push({
    type: RESPONSE_TYPES.CODE,
    data: {
      language: 'typescript',
      code: '// 根据上游需求和页面方案生成的类型示例\n' +
        'interface AppRecord {\n' + artifact.fields.map(field => `  ${field}: ${field === 'amount' ? 'number' : 'string'}`).join('\n') + '\n}\n\n' +
        'const features = ' + JSON.stringify(features, null, 2) + '\n' +
        'const pages = ' + JSON.stringify(artifact.pages.map(page => page.name), null, 2),
      explanation: '类型与模块清单示例；不代表应用已经开发完成。'
    }
  })
  const incomplete = ['conversation'].includes(subtask.capability) || (subtask.capability === 'writing' && !upstream.length && !/邮件/.test(task)) || subtask.capability === 'analysis'
  return {
    responseType: items.length > 1 ? RESPONSE_TYPES.COMPOSITE : RESPONSE_TYPES.DOCUMENT,
    data: items.length > 1 ? { items } : { sections },
    artifact, deliveryStatus: incomplete ? 'needs_info' : 'completed'
  }
}
