<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="url(#logoGradient)" />
            <path d="M8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <defs>
              <linearGradient id="logoGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stop-color="#6c5ce7" />
                <stop offset="1" stop-color="#3498db" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span class="logo-text">MultiAgent</span>
      </div>
      <div class="header-actions">
        <button class="search-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span>搜索 Agent</span>
        </button>
        <div class="user-avatar">
          <span>M</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
// Header component - no props needed
</script>

<style scoped>
.app-header {
  padding: 1.5rem 2rem;
  background: rgba(10, 14, 23, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 2.5rem;
  height: 2.5rem;
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgba(108, 92, 231, 0.1);
  border: 1px solid rgba(108, 92, 231, 0.3);
  border-radius: 0.5rem;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.search-btn:hover {
  background: rgba(108, 92, 231, 0.2);
  border-color: rgba(108, 92, 231, 0.5);
}

.search-btn svg {
  width: 1.125rem;
  height: 1.125rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #6c5ce7, #a855f7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.user-avatar:hover {
  transform: scale(1.05);
}

</style>
