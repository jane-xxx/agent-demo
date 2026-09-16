import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createServer as createHttpServer } from 'node:http'
const http = createHttpServer()
const server = await createServer({ configFile: false, server: { middlewareMode: true, hmr: { server: http } }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
try {
  const { MOCK_MESSAGES, MOCK_LOGS, MOCK_TEAMS } = await server.ssrLoadModule('/src/utils/mockData.js')
  for (const team of MOCK_TEAMS) {
    const messages = MOCK_MESSAGES[team.id], logs = MOCK_LOGS[team.id]
    assert(messages[0].type !== 'notice')
    assert(messages.filter(m => m.type === 'user').length >= 2)
    assert(messages.some(m => m.type === 'agent' && m.artifact))
    assert(logs.every(l => l.content.includes('预置演示')))
    assert(logs.every((l, i) => !i || l.time >= logs[i - 1].time))
    assert.equal(new Set(messages.map(m => m.id)).size, messages.length)
    assert(messages.filter(m => m.type === 'agent').every(m => team.agents.some(a => a.id === m.agentId)))
    for (const plan of messages.filter(m => m.type === 'decomp')) assert(plan.subtasks.every(s => messages.some(m => m.id === s.resultId)))
    messages.forEach((message, index) => {
      if (message.type !== 'user') return
      const nextUserOffset = messages.slice(index + 1).findIndex(item => item.type === 'user')
      const turn = messages.slice(index + 1, nextUserOffset === -1 ? undefined : index + 1 + nextUserOffset)
      assert(turn.some(item => item.type === 'agent'), `${team.name} 的“${message.content}”缺少成员响应`)
    })
  }
  const history = MOCK_MESSAGES['team-001']
  const replies = history.filter(m => m.artifact)
  assert.deepEqual(replies.slice(0, 4).map(m => m.taskKey), ['analysis', 'requirements', 'design', 'implementation'])
  const latestRequirement = replies.filter(m => m.taskKey === 'requirements').at(-1)
  const latestImplementation = replies.filter(m => m.taskKey === 'implementation').at(-1)
  assert(latestRequirement.artifact.features.includes('预算管理'))
  assert(latestImplementation.artifact.pages.some(p => p.feature === '预算管理'))
  const lastUser = history.findLastIndex(m => m.type === 'user')
  assert.equal(history.slice(lastUser + 1).filter(m => m.type === 'agent').length, 1)
  assert.equal(replies.at(-1).agentIcon, 'code')
  const designReply = MOCK_MESSAGES['team-004'].find(message => message.agentIcon === 'palette')
  assert(designReply.data.items.some(item => item.type === 'image'))
  assert(MOCK_MESSAGES['team-005'].some(m => m.deliveryStatus === 'needs_info'))
  assert(!JSON.stringify(MOCK_MESSAGES).includes('用户真实反馈'))
  console.log('默认示例验证通过：成员匹配、交付引用、预算页面续接、@单成员响应、日志时序与模拟标识。')
} finally {
  await server.close()
  http.close()
}
