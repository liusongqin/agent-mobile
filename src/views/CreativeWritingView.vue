<script setup>
import { ref } from 'vue'
import ImageUploader from '../components/common/ImageUploader.vue'
import MarkdownRenderer from '../components/common/MarkdownRenderer.vue'
import { creativeWriteFromImage, getApiKey } from '../services/openai.js'

const imageBase64 = ref(null)
const loading = ref(false)
const result = ref('')
const error = ref('')
const selectedStyle = ref('poem')

const styles = [
  { id: 'poem', label: '现代诗', icon: '🌸', desc: '优美意境的现代诗歌' },
  { id: 'story', label: '短篇故事', icon: '📚', desc: '有情节的创意短故事' },
  { id: 'haiku', label: '俳句', icon: '🍃', desc: '禅意俳句三行诗' },
  { id: 'lyrics', label: '歌词', icon: '🎵', desc: '有节奏感的歌词' },
  { id: 'review', label: '影评', icon: '🎬', desc: '电影式场景评论' },
  { id: 'letter', label: '书信', icon: '✉️', desc: '温暖感人的信' },
  { id: 'diary', label: '日记', icon: '📔', desc: '第一人称日记体' },
  { id: 'news', label: '新闻稿', icon: '📰', desc: '正式新闻报道风格' },
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
    result.value = await creativeWriteFromImage(imageBase64.value, selectedStyle.value)
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
      <div class="text-4xl mb-2">✍️</div>
      <h2 class="text-2xl font-bold text-slate-800 dark:text-white">创意写作</h2>
      <p class="text-slate-500 dark:text-slate-400 mt-1">以图片为灵感，AI 为你创作文学作品</p>
    </div>

    <!-- Upload -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <ImageUploader
        label="上传一张激发灵感的图片"
        @file-selected="onImageSelected"
        @file-removed="onImageRemoved"
      />
    </div>

    <!-- Style selection -->
    <div v-if="imageBase64" class="fade-in">
      <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">选择创作风格</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          v-for="style in styles"
          :key="style.id"
          @click="selectedStyle = style.id"
          class="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200"
          :class="[
            selectedStyle === style.id
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-md'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
          ]"
        >
          <span class="text-2xl">{{ style.icon }}</span>
          <span class="text-sm font-medium">{{ style.label }}</span>
          <span class="text-xs text-slate-400 dark:text-slate-500">{{ style.desc }}</span>
        </button>
      </div>

      <button
        @click="generate"
        :disabled="loading"
        class="w-full mt-4 py-3 rounded-xl gradient-bg text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-all disabled:opacity-60"
      >
        {{ loading ? '✨ 创作中...' : '✨ 开始创作' }}
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
          <span class="text-lg">{{ styles.find(s => s.id === selectedStyle)?.icon }}</span>
          <h3 class="font-semibold text-slate-800 dark:text-white">
            AI {{ styles.find(s => s.id === selectedStyle)?.label }}创作
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
