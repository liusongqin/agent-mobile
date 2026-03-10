<script setup>
import { ref } from 'vue'
import ImageUploader from '../components/common/ImageUploader.vue'
import MarkdownRenderer from '../components/common/MarkdownRenderer.vue'
import { extractText, getApiKey } from '../services/openai.js'

const imageBase64 = ref(null)
const loading = ref(false)
const result = ref('')
const error = ref('')

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

async function extract() {
  if (!imageBase64.value) return

  if (!getApiKey()) {
    error.value = '请先前往设置页面配置 API Key'
    return
  }

  loading.value = true
  error.value = ''
  result.value = ''

  try {
    result.value = await extractText(imageBase64.value)
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
      <div class="text-4xl mb-2">📝</div>
      <h2 class="text-2xl font-bold text-slate-800 dark:text-white">OCR 文字提取</h2>
      <p class="text-slate-500 dark:text-slate-400 mt-1">智能识别图片中的文字内容</p>
    </div>

    <!-- Upload -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <ImageUploader
        label="上传包含文字的图片"
        @file-selected="onImageSelected"
        @file-removed="onImageRemoved"
      />
    </div>

    <!-- Extract button -->
    <div v-if="imageBase64" class="fade-in">
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-600 dark:text-blue-400 mb-4">
        💡 支持识别印刷体、手写体、表格、文档等多种场景。支持中英文混合识别。
      </div>
      <button
        @click="extract"
        :disabled="loading"
        class="w-full py-3 rounded-xl gradient-bg text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-all disabled:opacity-60"
      >
        {{ loading ? '🔄 识别中...' : '📝 开始提取文字' }}
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
          <span class="text-lg">📄</span>
          <h3 class="font-semibold text-slate-800 dark:text-white">提取结果</h3>
        </div>
        <button
          v-if="result"
          @click="copyResult"
          class="text-sm text-slate-500 hover:text-indigo-500 transition-colors flex items-center gap-1"
        >
          📋 复制全部
        </button>
      </div>

      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700 font-mono text-sm">
        <MarkdownRenderer :content="result" :loading="loading" />
      </div>
    </div>
  </div>
</template>
