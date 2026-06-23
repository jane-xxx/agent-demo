<template>
  <div class="response-renderer">
    <!-- Text 类型 - 支持打字机效果 -->
    <div v-if="responseType === 'text'" class="text-response">
      <span v-if="isTyping" class="typing-text">{{ displayedText }}</span>
      <span v-else v-html="renderedContent"></span>
      <span v-if="isTyping" class="cursor">|</span>
    </div>

    <!-- Code 类型 -->
    <div v-else-if="responseType === 'code'" class="code-response">
      <div class="code-header">
        <span class="language-tag">{{ data?.language || 'text' }}</span>
      </div>
      <pre class="code-block"><code>{{ data?.code || 'No code content' }}</code></pre>
      <p v-if="data?.explanation" class="code-explanation">{{ data.explanation }}</p>
    </div>

    <!-- Table 类型 -->
    <div v-else-if="responseType === 'table'" class="table-response">
      <table>
        <thead>
          <tr>
            <th v-for="(header, i) in data.headers" :key="i">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in data.rows" :key="i">
            <td v-for="(cell, j) in row" :key="j">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="data.caption" class="table-caption">{{ data.caption }}</p>
    </div>

    <!-- Chart 类型 (Mermaid) -->
    <div v-else-if="responseType === 'chart'" class="chart-response">
      <div v-html="renderedChart"></div>
      <p v-if="data.caption" class="chart-caption">{{ data.caption }}</p>
    </div>

    <!-- Formula 类型 (LaTeX) -->
    <div v-else-if="responseType === 'formula'" class="formula-response">
      <div v-for="(formula, i) in data.formulas" :key="i" class="formula-item" v-html="renderFormula(formula)"></div>
      <p v-if="data.explanation" class="formula-explanation">{{ data.explanation }}</p>
    </div>

    <!-- Image 类型 -->
    <div v-else-if="responseType === 'image'" class="image-response">
      <div class="image-wrapper">
        <!-- 图片元素始终存在，用CSS控制显示 -->
        <img
          :src="data?.url"
          :alt="data?.alt || 'Generated image'"
          @load="onImageLoad"
          @error="onImageError"
          :style="{ opacity: imageLoading || imageError ? 0 : 1 }"
          class="generated-image"
        />

        <!-- 操作按钮 - 只在图片加载完成且无错误时显示 -->
        <div v-if="!imageLoading && !imageError" class="image-actions">
          <button @click="viewLargerImage" class="action-btn" title="查看大图">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
          </button>
          <button @click="downloadImage" class="action-btn" title="下载图片">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        </div>

        <!-- 加载中占位 - 覆盖在图片上 -->
        <div v-if="imageLoading" class="image-placeholder">
          <svg class="spinner" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.3"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2"></path>
          </svg>
          <span>生成图片中...</span>
        </div>

        <!-- 加载失败占位 -->
        <div v-else-if="imageError" class="image-placeholder error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span>图片加载失败</span>
        </div>
      </div>

      <p v-if="data?.caption && !imageError" class="image-caption">{{ data.caption }}</p>
    </div>

    <!-- Fallback -->
    <div v-else class="text-response">{{ data.content || 'Empty response' }}</div>
  </div>

  <!-- 查看大图模态框 - 移到外面 -->
  <transition name="modal-fade">
    <div v-if="showLightbox" class="lightbox-modal" @click="closeLightbox">
      <button class="lightbox-close" @click="closeLightbox">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="lightbox-content" @click.stop>
        <img :src="data?.url" :alt="data?.alt || 'Generated image'" class="lightbox-image" />
        <div v-if="data?.caption" class="lightbox-caption">{{ data.caption }}</div>
        <button @click="downloadImage" class="lightbox-download">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          下载图片
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { RESPONSE_TYPES } from '../../utils/responseTypes'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = defineProps({
  responseType: {
    type: String,
    default: RESPONSE_TYPES.TEXT
  },
  data: {
    type: Object,
    default: () => ({})
  },
  // 是否启用打字机效果
  enableTypewriter: {
    type: Boolean,
    default: true
  }
})

// 不再需要 typing 事件，因为我们不再自动滚动

const renderedContent = ref('')
const renderedChart = ref('')
const displayedText = ref('')
const isTyping = ref(false)
const typingTimer = ref(null)
const imageLoading = ref(true)
const imageError = ref(false)
const showLightbox = ref(false)

// 图片加载事件
const onImageLoad = () => {
  imageLoading.value = false
  imageError.value = false
}

const onImageError = (e) => {
  imageLoading.value = false
  imageError.value = true
}

// 查看大图
const viewLargerImage = () => {
  showLightbox.value = true
  document.body.style.overflow = 'hidden'
}

// 关闭大图
const closeLightbox = () => {
  showLightbox.value = false
  document.body.style.overflow = ''
}

// 下载图片
const downloadImage = async () => {
  const imageUrl = props.data?.url
  if (!imageUrl) return

  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const timestamp = Date.now()
    link.download = `generated-image-${timestamp}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载图片失败:', error)
    window.open(imageUrl, '_blank')
  }
}

// 打字机效果
const startTyping = (text) => {
  // 始终先设置渲染后的内容，确保即使打字机效果有问题，内容也能正确显示
  renderedContent.value = renderMarkdown(text)

  if (!props.enableTypewriter) {
    return
  }

  isTyping.value = true
  displayedText.value = ''
  let index = 0

  const typeNextChar = () => {
    if (index < text.length) {
      displayedText.value += text.charAt(index)
      index++
      // 随机打字速度，更自然
      const speed = 20 + Math.random() * 30
      typingTimer.value = setTimeout(typeNextChar, speed)
    } else {
      isTyping.value = false
    }
  }

  typeNextChar()
}

// 清理打字机定时器
const stopTyping = () => {
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
    typingTimer.value = null
  }
  isTyping.value = false
}

// 渲染 Mermaid 图表
const renderChart = async () => {
  if (props.responseType !== RESPONSE_TYPES.CHART || !props.data?.diagram) {
    return
  }

  const { default: mermaid } = await import('mermaid')
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    themeVariables: {
      darkMode: true,
      background: '#1e293b',
      primaryColor: '#6366f1',
      primaryTextColor: '#f1f5f9',
      lineColor: '#94a3b8'
    }
  })

  try {
    const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const { svg } = await mermaid.render(id, props.data.diagram)
    renderedChart.value = `<div class="mermaid-wrapper">${svg}</div>`
  } catch (e) {
    console.error('Mermaid render error:', e)
    renderedChart.value = `<pre class="mermaid-fallback">${props.data.diagram}</pre>`
  }
}

// 渲染 LaTeX 公式
const renderFormula = (formula) => {
  if (!katex) {
    return `<span class="formula-fallback">${formula}</span>`
  }

  try {
    return katex.renderToString(formula, { displayMode: true, throwOnError: false })
  } catch (e) {
    return `<span class="formula-error">${formula}</span>`
  }
}

// 渲染 Markdown 文本
const renderMarkdown = (content) => {
  if (!content) return ''

  // 简单的 Markdown 处理
  return content
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

// 监听变化
watch(() => props.data, (newData) => {
  stopTyping()  // 先停止任何正在进行的打字机效果
  if (props.responseType === RESPONSE_TYPES.TEXT && newData?.content) {
    // 添加防抖，确保内容稳定后再开始打字
    nextTick(() => {
      startTyping(newData.content)
    })
  }
  // 重置图片加载状态
  if (props.responseType === RESPONSE_TYPES.IMAGE && newData?.url) {
    imageLoading.value = true
    imageError.value = false
  }
}, { immediate: true, deep: true })

watch(() => props.responseType, (newType) => {
  if (newType === RESPONSE_TYPES.CHART) {
    renderChart()
  }
}, { immediate: true })

onMounted(() => {
  if (props.responseType === RESPONSE_TYPES.TEXT && props.data.content) {
    startTyping(props.data.content)
  }
  if (props.responseType === RESPONSE_TYPES.CHART) {
    renderChart()
  }
  // 处理图片初始状态
  if (props.responseType === RESPONSE_TYPES.IMAGE && props.data?.url) {
    nextTick(() => {
      nextTick(() => {
        const img = document.querySelector(`img[src="${props.data.url}"]`)
        if (img && img.complete && img.naturalHeight > 0) {
          imageLoading.value = false
          imageError.value = false
        }
      })
    })
  }
})

onBeforeUnmount(() => {
  stopTyping()
  if (showLightbox.value) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.response-renderer {
  width: 100%;
}

/* Text Response */
.text-response {
  color: #cbd5e1;
  line-height: 1.7;
}

.typing-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background: #6366f1;
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

.text-response :deep(strong) {
  color: #f1f5f9;
  font-weight: 600;
}

.text-response :deep(em) {
  color: #e2e8f0;
  font-style: italic;
}

.text-response :deep(code) {
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
}

/* Code Response */
.code-response {
  background: #0d1117;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: rgba(99, 102, 241, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.language-tag {
  font-size: 11px;
  color: #a5b4fc;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.code-block {
  margin: 0;
  padding: 14px 16px;
  overflow-x: auto;
  background: transparent;
  max-width: 100%;
}

.code-block code {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #c9d1d9;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: break-word;
}

.code-explanation {
  margin: 0;
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: #94a3b8;
  font-size: 14px;
}

/* Table Response */
.table-response {
  overflow-x: auto;
}

.table-response table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.table-response th,
.table-response td {
  padding: 10px 14px;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.table-response th {
  background: rgba(99, 102, 241, 0.15);
  color: #e2e8f0;
  font-weight: 600;
  font-size: 13px;
}

.table-response td {
  color: #cbd5e1;
  font-size: 14px;
}

.table-response tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.table-caption {
  margin-top: 10px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
  font-style: italic;
}

/* Chart Response */
.chart-response {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-response :deep(.mermaid-wrapper) {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.chart-response :deep(.mermaid-wrapper svg) {
  max-width: 100%;
  height: auto;
}

.chart-response :deep(.mermaid-fallback) {
  padding: 14px;
  background: #0d1117;
  border-radius: 8px;
  color: #c9d1d9;
  font-size: 13px;
  overflow-x: auto;
}

.chart-caption {
  margin-top: 12px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
  font-style: italic;
}

/* Formula Response */
.formula-response {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.formula-item {
  display: flex;
  justify-content: center;
  padding: 12px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 8px;
  overflow-x: auto;
}

.formula-item :deep(.katex) {
  font-size: 1.1em;
}

.formula-item :deep(.formula-fallback) {
  color: #c9d1d9;
  font-family: 'Monaco', monospace;
}

.formula-item :deep(.formula-error) {
  color: #f87171;
}

.formula-explanation {
  margin: 0;
  padding: 12px 16px;
  background: rgba(99, 102, 241, 0.08);
  border-left: 3px solid #6366f1;
  border-radius: 0 8px 8px 0;
  color: #94a3b8;
  font-size: 14px;
}

/* Image Response */
.image-response {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 100%;
}

.image-wrapper {
  position: relative;
  display: inline-block;
  width: 600px;
  height: 450px;
}

.image-response img {
  width: 600px;
  height: 450px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: opacity 0.3s ease;
  display: block;
  object-fit: cover;
}

.image-response .generated-image {
  opacity: 1;
}

/* 图片操作按钮 */
.image-actions {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.05);
}

/* Lightbox 模态框 */
.lightbox-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.lightbox-close svg {
  width: 24px;
  height: 24px;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.lightbox-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 90vw;
  max-height: 90vh;
}

.lightbox-image {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.lightbox-caption {
  color: #e2e8f0;
  font-size: 15px;
  text-align: center;
  max-width: 600px;
}

.lightbox-download {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
}

.lightbox-download svg {
  width: 18px;
  height: 18px;
}

.lightbox-download:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

/* 模态框动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #94a3b8;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.15);
}

.image-placeholder svg {
  width: 40px;
  height: 40px;
}

.image-placeholder .spinner {
  color: #6366f1;
  animation: spin 1s linear infinite;
}

.image-placeholder span {
  font-size: 14px;
}

.image-placeholder.error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.25);
  color: #f87171;
}

.image-placeholder.error svg {
  color: #f87171;
}

.image-placeholder.error span {
  color: #f87171;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.image-caption {
  margin-top: 10px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
  font-style: italic;
}

/* Document Response */
.document-response {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.document-section {
  padding: 14px 16px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.document-section h3 {
  margin: 0 0 10px 0;
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
}

.document-section p {
  margin: 0;
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.6;
}
</style>
