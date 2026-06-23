<template>
  <div class="filter-bar">
    <div class="category-tabs">
      <button
        v-for="category in CATEGORIES"
        :key="category.id"
        :class="['tab-button', { active: activeCategory === category.id }]"
        @click="setCategory(category.id)"
      >
        {{ category.label }}
      </button>
    </div>
    <div class="search-input-wrapper">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        :value="searchQuery"
        @input="setSearchQuery($event.target.value)"
        placeholder="搜索 Agent..."
        class="search-input"
      />
    </div>
  </div>
</template>

<script setup>
import { useAgentSelection } from '../composables/useAgentSelection'

const { CATEGORIES, activeCategory, searchQuery, setCategory, setSearchQuery } = useAgentSelection()
</script>

<style scoped>
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 20px;
  padding: 0 32px;
}

.category-tabs {
  display: flex;
  gap: 8px;
}

.tab-button {
  padding: 10px 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #b2bec3;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  --category-color: #6c5ce7;
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.tab-button.active {
  background: var(--category-color);
  border-color: var(--category-color);
  color: white;
}

.search-input-wrapper {
  position: relative;
  width: 280px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #b2bec3;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  background: rgba(30, 39, 46, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.search-input::placeholder {
  color: #636e72;
}

.search-input:focus {
  border-color: #6c5ce7;
  background: rgba(30, 39, 46, 1);
}
</style>
