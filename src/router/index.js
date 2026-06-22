import { createRouter, createWebHashHistory } from 'vue-router'
import AgentSelection from '../views/AgentSelection.vue'
import TeamWorkspace from '../views/TeamWorkspace.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: AgentSelection
  },
  {
    path: '/workspace/:teamId?',
    name: 'workspace',
    component: TeamWorkspace,
    props: true
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
