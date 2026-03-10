<script setup>
import { ref } from 'vue'
import ImageUploader from '../components/common/ImageUploader.vue'
import MarkdownRenderer from '../components/common/MarkdownRenderer.vue'
import { generateAccessibilityDesc, getApiKey } from '../services/openai.js'

const imageBase64 = ref(null)
const loading = ref(false)
const result = ref('')
const error = ref('')
const selectedLevel = ref('detailed')

const levels = [
  { id: 'brief', label: '简短描述', icon: '📋', desc: '适合 alt 属性的简短描述' },
  { id: 'detailed', label: '详细描述', icon: '📝', desc: '包含场景、情感、元素的详细描述' },
  { id: 'technical', label: '技术级别', icon: '🔧', desc: '符合 WCAG 标准的专业无障碍描述' },
]

function onImageSelected({ base64 }) {
  imageBase64.value = base64
  result.value = ''
  error.value = ''
}

function onImageRemoved() {
  imageBase64.value = null
  result.value = ''
  error.value = ''
}

async function generate() {
  if (!imageBase64.value) return

  if (!getApiKey()) {
    error.value = '请先前往设置页面配置 API Key'
    return
  }

  loading.value = true
  error.value = ''
  result.value = ''

  try {
    result.value = await generateAccessibilityDesc(imageBase64.value, selectedLevel.value)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function copyResult() {
  navigator.clipboard.writeText(result.value)
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 space-y-6">
    <!-- Header -->
    <div class="text-center slide-up">
      <div class="text-4xl mb-2">♿</div>
      <h2 class="text-2xl font-bold text-slate-800 dark:text-white">无障碍描述生成</h2>
      <p class="text-slate-500 dark:text-slate-400 mt-1">自动生成符合标准的图片无障碍描述</p>
    </div>

    <!-- Info banner -->
    <div class="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 text-sm text-indigo-600 dark:text-indigo-400">
      <p class="font-medium mb-1">🌐 让互联网对每个人都友好</p>
      <p>为图片添加无障碍描述（Alt Text），帮助视觉障碍用户通过屏幕阅读器理解图片内容。</p>
    </div>

    <!-- Upload -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <ImageUploader
        label="上传需要生成无障碍描述的图片"
        @file-selected="onImageSelected"
        @file-removed="onImageRemoved"
      />
    </div>

    <!-- Level selection -->
    <div v-if="imageBase64" class="fade-in">
      <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">选择描述级别</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          v-for="level in levels"
          :key="level.id"
          @click="selectedLevel = level.id"
          class="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 text-center"
          :class="[
            selectedLevel === level.id
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-md'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
          ]"
        >
          <span class="text-2xl">{{ level.icon }}</span>
          <span class="text-sm font-medium">{{ level.label }}</span>
          <span class="text-xs text-slate-400 dark:text-slate-500">{{ level.desc }}</span>
        </button>
      </div>

      <button
        @click="generate"
        :disabled="loading"
        class="w-full mt-4 py-3 rounded-xl gradient-bg text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-all disabled:opacity-60"
      >
        {{ loading ? '🔄 生成中...' : '♿ 生成无障碍描述' }}
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
      ⚠️ {{ error }}
    </div>

    <!-- Result -->
    <div v-if="result || loading" class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 fade-in">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <span class="text-lg">{{ levels.find(l => l.id === selectedLevel)?.icon }}</span>
          <h3 class="font-semibold text-slate-800 dark:text-white">
            {{ levels.find(l => l.id === selectedLevel)?.label }}
          </h3>
        </div>
        <button
          v-if="result"
          @click="copyResult"
          class="text-sm text-slate-500 hover:text-indigo-500 transition-colors flex items-center gap-1"
        >
          📋 复制
        </button>
      </div>

      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
        <MarkdownRenderer :content="result" :loading="loading" />
      </div>
    </div>
  </div>
</template>
