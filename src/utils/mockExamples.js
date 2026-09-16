import { planCollaboration, createDemoDelivery, latestDeliveries, resolveFollowup } from './collaboration.js'

// 默认示例复用运行时的规则与交付模板，不伪造外部检索、用户评价或统计结论。
export function createMockExamples(teams) {
  const messages = {}, logs = {}
  const scenarios = {
    'team-001': [
      { content: '如何实现一个记账APP，包含收支录入、分类统计和预算提醒' },
      { content: '在刚才的方案中补充预算管理的提醒规则' },
      { content: '@代码智能体 根据刚才的设计生成代码', direct: true }
    ],
    'team-002': [
      { content: '调研记账APP的竞品，并梳理差异化定位' },
      { content: '在刚才的调研框架中补充目标用户访谈维度' }
    ],
    'team-003': [
      { content: '为记账APP撰写产品发布邮件，并梳理核心卖点' },
      { content: '将刚才的邮件改为面向老用户的续费提醒口吻' }
    ],
    'team-004': [
      { content: '设计记账APP的预算管理页面和交互流程' },
      { content: '在刚才的页面方案中补充预算提醒状态' }
    ],
    'team-005': [
      { content: '分析销售数据并制定增长策略' },
      { content: '在刚才的分析框架中补充异常波动的排查维度' }
    ]
  }
  for (const team of teams) {
    const history = messages[team.id] = []
    const entries = logs[team.id] = []
    let serial = 0, tick = 0
    const time = () => `10:${String(Math.floor(tick / 60)).padStart(2, '0')}:${String(tick++ % 60).padStart(2, '0')}`
    const id = () => `mock-v6-${team.id}-${++serial}`
    const log = (actor, text) => entries.push({ time: time(), content: `${actor}: ${text}（预置演示）` })
    const run = (content, direct = false) => {
      const context = resolveFollowup(content, history)
      const previousUserTask = history.findLast(message => message.type === 'user')?.content || ''
      const isFollowup = context.followup || /刚才|上一轮|上面|上述|继续|再完善|再优化|在此基础|增加|添加|补充|改成/.test(content)
      history.push({ id: id(), type: 'user', content, timestamp: time(), isNew: false })
      log('用户', `发送消息: "${content}"`)
      const members = direct ? team.agents.filter(a => a.icon === 'code') : team.agents
      const intent = direct ? '实现' : isFollowup ? `${previousUserTask}。${content}` : content
      const board = planCollaboration(context.task, members, intent)
      const steps = direct ? board.steps.filter(s => s.agent?.icon === 'code') : board.steps
      const plan = direct ? null : { id: id(), type: 'decomp', subtasks: steps, planStatus: 'running', timestamp: time(), isNew: false }
      if (plan) history.push(plan)
      if (direct) log('system', '任务指派给: 代码智能体')
      else for (const agent of members) log(agent.name, steps.some(s => s.agent?.id === agent.id) ? `能力匹配：${steps.filter(s => s.agent?.id === agent.id).map(s => s.name).join('、')}` : '能力不匹配，未参与')
      const outputs = [...context.upstream]
      for (const s of steps) {
        if (!s.agent) throw new Error(`默认示例缺少 ${s.capability} 成员`)
        log(s.agent.name, `开始处理「${s.name}」`)
        const upstream = latestDeliveries(outputs.filter(o => direct || s.dependencies.includes(o.key) || context.upstream.includes(o)))
        const delivery = createDemoDelivery(context.task, s, upstream)
        const reply = { id: id(), type: 'agent', agentId: s.agent.id, agentName: s.agent.name, agentIcon: s.agent.icon, agentColor: s.agent.color, taskKey: s.key, taskName: s.name, ...delivery, timestamp: time(), isNew: false }
        history.push(reply)
        s.status = delivery.deliveryStatus
        s.resultId = reply.id
        outputs.push({ key: s.key, agent: s.agent, artifact: reply.artifact, message: reply, subtask: s.name })
        log(s.agent.name, s.status === 'completed' ? '任务处理完成' : '待补充信息，尚未完成实际任务')
      }
      if (plan) plan.planStatus = steps.every(s => s.status === 'completed') ? 'completed' : 'needs_info'
      log('system', direct ? '指定成员响应结束' : plan.planStatus === 'completed' ? '规则示例交付完成' : '待补充信息')
    }
    for (const scenario of scenarios[team.id] || []) run(scenario.content, scenario.direct)
  }
  return { messages, logs }
}
