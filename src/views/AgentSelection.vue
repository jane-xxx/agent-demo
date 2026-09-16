<template>
  <div class="multiagent-app">
    <AuroraBackground />

    <!-- 我的团队按钮 -->
    <button class="my-teams-btn" @click="goToMyTeams">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
      我的团队
    </button>

    <main class="main-content">
      <HeroSection />
      <FilterBar />
      <AgentGrid />
    </main>
    <SelectionPanel />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AuroraBackground from '../components/AuroraBackground.vue'
import HeroSection from '../components/HeroSection.vue'
import FilterBar from '../components/FilterBar.vue'
import AgentGrid from '../components/AgentGrid.vue'
import SelectionPanel from '../components/SelectionPanel.vue'

const router = useRouter()

const goToMyTeams = () => {
  router.push({ name: 'workspace' })
}
</script>

<style scoped>
.multiagent-app {
  height: 100%;
  background: transparent;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 32px 18px 0;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 1;
}

.my-teams-btn {
  position: fixed;
  top: 24px;
  right: 32px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
  z-index: 1000;
}

.my-teams-btn svg {
  width: 18px;
  height: 18px;
}

.my-teams-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.my-teams-btn:active {
  transform: translateY(0);
}
</style>
