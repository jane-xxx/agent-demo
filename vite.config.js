import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    open: true,
    port: 3000
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vue 核心库
          if (id.includes('node_modules/vue/') || id.includes('node_modules/@vue/') || id.includes('node_modules/vue-router/')) {
            return 'vue-vendor'
          }
          // 数学公式渲染
          if (id.includes('node_modules/katex/')) {
            return 'math-vendor'
          }
          // 图标库
          if (id.includes('node_modules/@heroicons/')) {
            return 'icons-vendor'
          }
          // Markdown 相关
          if (id.includes('node_modules/markdown-it/')) {
            return 'markdown-vendor'
          }
          // mermaid 通过动态导入自动分包，无需手动配置
        }
      }
    },
    // 提高 chunk 大小警告阈值（大型 vendor chunks 正常）
    chunkSizeWarningLimit: 1000
  }
})
