<template>
  <div class="markdown-renderer" v-html="renderedHtml"></div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import MarkdownIt from 'markdown-it'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import mermaid from 'mermaid'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const renderedHtml = ref('')

// 初始化 markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    // 简单的语法高亮处理
    if (lang) {
      return `<pre class="hljs language-${lang}"><code class="language-${lang}">${escapeHtml(str)}</code></pre>`
    }
    return `<pre class="hljs"><code>${escapeHtml(str)}</code></pre>`
  }
})

// HTML 转义函数
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

// Mermaid 图表计数器
let mermaidCounter = 0

// 初始化 Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  themeVariables: {
    darkMode: true,
    background: '#1e293b',
    primaryColor: '#6366f1',
    primaryTextColor: '#f1f5f9',
    primaryBorderColor: '#818cf8',
    lineColor: '#94a3b8',
    secondaryColor: '#475569',
    tertiaryColor: '#334155',
    fontSize: '14px'
  }
})

// 渲染 LaTeX 公式
const renderLatex = (text) => {
  // 匹配 $$...$$ (块级公式) 和 $...$ (行内公式)
  return text.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula, { displayMode: true, throwOnError: false })
    } catch (e) {
      return match
    }
  }).replace(/\$([^$]+)\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula, { displayMode: false, throwOnError: false })
    } catch (e) {
      return match
    }
  })
}

// 渲染 Mermaid 图表
const renderMermaid = async (html) => {
  // 查找所有的 mermaid 代码块
  const mermaidRegex = /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g
  const matches = [...html.matchAll(mermaidRegex)]

  if (matches.length === 0) return html

  // 替换每个 mermaid 代码块为渲染后的 SVG
  for (const match of matches) {
    const [fullMatch, code] = match
    const id = `mermaid-${mermaidCounter++}`

    try {
      const { svg } = await mermaid.render(id, code.trim())
      html = html.replace(fullMatch, `<div class="mermaid-container">${svg}</div>`)
    } catch (e) {
      console.error('Mermaid render error:', e)
      // 如果渲染失败，保持原样
    }
  }

  return html
}

// 渲染内容
const renderContent = async (content) => {
  if (!content) {
    renderedHtml.value = ''
    return
  }

  try {
    // 先渲染 markdown
    let html = md.render(content)

    // 渲染 LaTeX 公式
    html = renderLatex(html)

    // 渲染 Mermaid 图表
    html = await renderMermaid(html)

    renderedHtml.value = html
  } catch (error) {
    console.error('Markdown render error:', error)
    renderedHtml.value = content
  }
}

// 监听内容变化
watch(() => props.content, (newContent) => {
  renderContent(newContent)
}, { immediate: true })

onMounted(() => {
  renderContent(props.content)
})

onBeforeUnmount(() => {
  // 清理 mermaid 计数器
  mermaidCounter = 0
})
</script>

<style scoped>
.markdown-renderer {
  line-height: 1.7;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Markdown 元素样式 */
.markdown-renderer :deep(h1),
.markdown-renderer :deep(h2),
.markdown-renderer :deep(h3),
.markdown-renderer :deep(h4),
.markdown-renderer :deep(h5),
.markdown-renderer :deep(h6) {
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-weight: 600;
  color: #f1f5f9;
  line-height: 1.3;
}

.markdown-renderer :deep(h1) {
  font-size: 1.75em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5em;
}

.markdown-renderer :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.4em;
}

.markdown-renderer :deep(h3) {
  font-size: 1.25em;
}

.markdown-renderer :deep(h4) {
  font-size: 1.1em;
}

.markdown-renderer :deep(p) {
  margin: 0.75em 0;
  color: #cbd5e1;
}

.markdown-renderer :deep(a) {
  color: #818cf8;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.markdown-renderer :deep(a:hover) {
  border-bottom-color: #818cf8;
}

.markdown-renderer :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1em 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 代码块样式 */
.markdown-renderer :deep(pre) {
  background: #0d1117;
  border-radius: 8px;
  padding: 14px 16px;
  overflow-x: auto;
  margin: 1em 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
}

.markdown-renderer :deep(pre)[class*="language-"]::before {
  content: attr(class);
  position: absolute;
  top: 6px;
  right: 10px;
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 500;
  opacity: 0.7;
}

.markdown-renderer :deep(pre code) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #c9d1d9;
  background: transparent;
  padding: 0;
}

/* 简单的语法高亮颜色 */
.markdown-renderer :deep(code .keyword) {
  color: #ff7b72;
}
.markdown-renderer :deep(code .string) {
  color: #a5d6ff;
}
.markdown-renderer :deep(code .number) {
  color: #79c0ff;
}
.markdown-renderer :deep(code .comment) {
  color: #8b949e;
  font-style: italic;
}
.markdown-renderer :deep(code .function) {
  color: #d2a8ff;
}
.markdown-renderer :deep(code .operator) {
  color: #ff7b72;
}
.markdown-renderer :deep(code .class) {
  color: #ffa657;
}

.markdown-renderer :deep(code:not(pre code)) {
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
  padding: 3px 7px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9em;
  border: 1px solid rgba(99, 102, 241, 0.25);
}

/* 表格样式 */
.markdown-renderer :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.markdown-renderer :deep(th),
.markdown-renderer :deep(td) {
  padding: 10px 14px;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.markdown-renderer :deep(th) {
  background: rgba(99, 102, 241, 0.15);
  color: #e2e8f0;
  font-weight: 600;
}

.markdown-renderer :deep(td) {
  color: #cbd5e1;
}

.markdown-renderer :deep(tr:hover) {
  background: rgba(255, 255, 255, 0.02);
}

/* 列表样式 */
.markdown-renderer :deep(ul),
.markdown-renderer :deep(ol) {
  margin: 0.75em 0;
  padding-left: 1.75em;
}

.markdown-renderer :deep(li) {
  margin: 0.4em 0;
  color: #cbd5e1;
}

.markdown-renderer :deep(li > ul),
.markdown-renderer :deep(li > ol) {
  margin: 0.4em 0;
}

/* 引用块样式 */
.markdown-renderer :deep(blockquote) {
  margin: 1em 0;
  padding: 12px 18px;
  border-left: 4px solid #6366f1;
  background: rgba(99, 102, 241, 0.08);
  color: #cbd5e1;
  border-radius: 0 8px 8px 0;
}

.markdown-renderer :deep(blockquote p) {
  margin: 0;
}

/* 分隔线样式 */
.markdown-renderer :deep(hr) {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  margin: 2em 0;
}

/* Mermaid 图表容器样式 */
.markdown-renderer :deep(.mermaid-container) {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5em;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  margin: 1.5em 0;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.markdown-renderer :deep(.mermaid-container svg) {
  max-width: 100%;
  height: auto;
}

/* KaTeX 样式覆盖 */
.markdown-renderer :deep(.katex) {
  font-size: 1.05em;
}

.markdown-renderer :deep(.katex-display) {
  margin: 1.25em 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.5em 0;
}

/* 强调文本样式 */
.markdown-renderer :deep(strong) {
  color: #f1f5f9;
  font-weight: 600;
}

.markdown-renderer :deep(em) {
  color: #e2e8f0;
  font-style: italic;
}

/* 删除线样式 */
.markdown-renderer :deep(del) {
  color: #64748b;
  text-decoration: line-through;
}
</style>
