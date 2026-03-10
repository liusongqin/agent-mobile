<script setup>
import { ref } from 'vue'
import MarkdownRenderer from '../components/common/MarkdownRenderer.vue'
import { compareImages, getApiKey } from '../services/openai.js'

const image1 = ref(null)
const image2 = ref(null)
const loading = ref(false)
const result = ref('')
const error = ref('')
const selectedMode = ref('differences')

const modes = [
  { id: 'differences', label: '找不同', icon: '🔍', prompt: '请仔细对比这两张图片，详细列出它们之间的所有差异和不同之处。按重要程度排序。' },
  { id: 'similarities', label: '找相同', icon: '🤝', prompt: '请对比这两张图片，找出它们之间的所有共同点和相似之处。' },
  { id: 'full', label: '全面对比', icon: '📊', prompt: '请对这两张图片进行全面的对比分析，包括：\n1. 相似之处\n2. 不同之处\n3. 各自的特点\n4. 哪张图片在某些方面更好\n5. 总结评价' },
  { id: 'timeline', label: '时间线推理', icon: '⏰', prompt: '假设这两张图片记录了某个事物的不同时间点，请推理：\n1. 哪张可能是之前的状态\n2. 哪张可能是之后的状态\n3. 中间可能发生了什么变化\n4. 变化的原因推测' },
  { id: 'style', label: '风格对比', icon: '🎨', prompt: '请从艺术和视觉角度对比这两张图片的风格：色彩、构图、光影、氛围等方面的异同。' },
]

function onImage1Selected(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => { image1.value = ev.target.result }
    reader.readAsDataURL(file)
  }
}

function onImage2Selected(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => { image2.value = ev.target.result }
    reader.readAsDataURL(file)
  }
}

function removeImage(which) {
  if (which === 1) image1.value = null
  else image2.value = null
  result.value = ''
}

async function compare() {
  if (!image1.value || !image2.value) return

  if (!getApiKey()) {
    error.value = '请先前往设置页面配置 API Key'
    return
  }

  loading.value = true
  error.value = ''
  result.value = ''

  try {
    const mode = modes.find(m => m.id === selectedMode.value)
    result.value = await compareImages(image1.value, image2.value, mode.prompt)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 space-y-6">
    <!-- Header -->
    <div class="text-center slide-up">
      <div class="text-4xl mb-2">🔍</div>
      <h2 class="text-2xl font-bold text-slate-800 dark:text-white">图像对比分析</h2>
      <p class="text-slate-500 dark:text-slate-400 mt-1">上传两张图片，AI 智能分析异同</p>
    </div>

    <!-- Image upload areas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Image 1 -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">图片一</span>
        </div>
        <div class="p-4">
          <div v-if="!image1" class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors relative">
            <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" @change="onImage1Selected" />
            <div class="text-3xl mb-2">📸</div>
            <p class="text-sm text-slate-500">点击上传第一张图片</p>
          </div>
          <div v-else class="relative">
            <img :src="image1" alt="Image 1" class="w-full max-h-64 object-contain rounded-xl" />
            <button @click="removeImage(1)" class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg text-xs">✕</button>
          </div>
        </div>
      </div>

      <!-- Image 2 -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 flex items-center justify-center text-xs font-bold">2</span>
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">图片二</span>
        </div>
        <div class="p-4">
          <div v-if="!image2" class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors relative">
            <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" @change="onImage2Selected" />
            <div class="text-3xl mb-2">📸</div>
            <p class="text-sm text-slate-500">点击上传第二张图片</p>
          </div>
          <div v-else class="relative">
            <img :src="image2" alt="Image 2" class="w-full max-h-64 object-contain rounded-xl" />
            <button @click="removeImage(2)" class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg text-xs">✕</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Comparison modes -->
    <div v-if="image1 && image2" class="fade-in">
      <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">选择对比模式</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="mode in modes"
          :key="mode.id"
          @click="selectedMode = mode.id"
          class="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200"
          :class="[
            selectedMode === mode.id
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
          ]"
        >
          <span>{{ mode.icon }}</span>
          <span class="text-sm font-medium">{{ mode.label }}</span>
        </button>
      </div>

      <button
        @click="compare"
        :disabled="loading"
        class="w-full mt-4 py-3 rounded-xl gradient-bg text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-all disabled:opacity-60"
      >
        {{ loading ? '🔄 对比中...' : '🔍 开始对比' }}
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
      ⚠️ {{ error }}
    </div>

    <!-- Result -->
    <div v-if="result || loading" class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 fade-in">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-lg">{{ modes.find(m => m.id === selectedMode)?.icon }}</span>
        <h3 class="font-semibold text-slate-800 dark:text-white">对比分析结果</h3>
      </div>
      <MarkdownRenderer :content="result" :loading="loading" />
    </div>
  </div>
</template>
