export const taskStatusLabel = status => ({
  ready: '待执行', running: '执行中', completed: '已交付', uncovered: '缺少成员',
  blocked: '等待上游', needs_info: '待补充信息', failed: '执行失败', cancelled: '已停止'
}[status] || '待执行')

// 兼容旧历史：仅依据已经记录的交付恢复状态，不改写原始消息。
export function planView(message, messages) {
  if (!message || message.planStatus) return message
  const start = messages.indexOf(message)
  const nextUser = messages.findIndex((item, index) => index > start && item.type === 'user')
  const following = messages.slice(start + 1, nextUser < 0 ? undefined : nextUser)
  const subtasks = message.subtasks.map(s => {
    const result = s.agent && following.find(item => item.agentId === s.agent.id && item.deliveryStatus)
    return result ? { ...s, status: result.deliveryStatus, resultId: result.id } : s
  })
  return { ...message, subtasks, planStatus: subtasks.every(s => s.status === 'completed') ? 'completed' : 'historical' }
}

export function deliveryItems(plan) {
  return (plan?.subtasks || []).map(s => ({
    key: s.key, name: s.name, owner: s.agent?.name,
    status: s.status, resultId: s.resultId
  }))
}
