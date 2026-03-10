<script setup>
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  content: { type: String, default: '' },
  loading: { type: Boolean, default: false }
})

const htmlContent = computed(() => {
  if (!props.content) return ''
  return marked(props.content, { breaks: true })
})
</script>

<template>
  <div class="relative">
    <div
      v-if="loading"
      class="flex items-center gap-2 text-slate-500 dark:text-slate-400"
    >
      <div class="flex gap-1">
        <div class="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
        <div class="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
        <div class="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
      </div>
      <span class="text-sm">AI 正在思考中...</span>
    </div>

    <div
      v-else-if="content"
      class="markdown-content prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed"
      v-html="htmlContent"
    ></div>

    <slot v-else></slot>
  </div>
</template>
