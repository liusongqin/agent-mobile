<script setup>
import { ref } from 'vue'
import ImageUploader from '../components/common/ImageUploader.vue'
import MarkdownRenderer from '../components/common/MarkdownRenderer.vue'
import { analyzeImage, getApiKey } from '../services/openai.js'

const imageBase64 = ref(null)
const loading = ref(false)
const result = ref('')
const error = ref('')
const selectedMode = ref('comprehensive')

const modes = [
  { id: 'comprehensive', label: '综合分析', icon: '🔬', prompt: '请对这张图片进行全面深入的分析，包括：\n1. **场景描述** - 图片展示的整体场景\n2. **主要物体** - 识别的物体及其位置关系\n3. **人物分析** - 如果有人物，分析表情、动作、穿着\n4. **颜色分析** - 主要颜色和色彩搭配\n5. **情感氛围** - 图片传达的情感和氛围\n6. **技术评价** - 构图、光影、清晰度等\n7. **有趣发现** - 任何有趣或值得注意的细节' },
  { id: 'objects', label: '物体识别', icon: '📦', prompt: '请详细列出这张图片中能识别出的所有物体，包括：名称、位置（左上/右下等）、大小比例、颜色、状态。用表格形式呈现。' },
  { id: 'emotions', label: '情感分析', icon: '💭', prompt: '请分析这张图片传达的情感和氛围：\n1. 整体情感基调（积极/消极/中性）\n2. 具体情感词汇描述\n3. 色彩对情感的影响\n4. 如有人物，分析其表情和肢体语言\n5. 图片可能引发观者什么情感反应\n6. 给出情感强度评分（1-10分）' },
  { id: 'colors', label: '色彩分析', icon: '🎨', prompt: '请对这张图片进行专业的色彩分析：\n1. 主色调和辅助色\n2. 色彩搭配方案类型（互补色/类似色/三色等）\n3. 色温（暖色调/冷色调/中性）\n4. 饱和度和明度分析\n5. 色彩带来的视觉感受\n6. 如果用于设计，建议的配色方案\n请给出具体的颜色十六进制代码。' },
  { id: 'story', label: '故事猜测', icon: '📖', prompt: '请根据这张图片想象一个可能的背景故事：\n1. 这张图片可能拍摄于什么场景和时间？\n2. 图中的人物/物体有什么可能的故事？\n3. 拍摄之前可能发生了什么？\n4. 拍摄之后可能发生了什么？\n5. 拍摄者可能的意图是什么？\n发挥想象力，但要基于图片中的视觉线索。' },
  { id: 'technical', label: '技术评价', icon: '📐', prompt: '请对这张图片进行专业的摄影/技术评价：\n1. 构图分析（三分法/对称/引导线等）\n2. 光影效果\n3. 景深和焦点\n4. 色彩运用\n5. 清晰度和噪点\n6. 整体评分（1-10分）及改进建议' },
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

async function analyze() {
  if (!imageBase64.value) return

  if (!getApiKey()) {
    error.value = '请先前往设置页面配置 API Key'
    return
  }

  loading.value = true
  error.value = ''
  result.value = ''

  try {
    const mode = modes.find(m => m.id === selectedMode.value)
    result.value = await analyzeImage(imageBase64.value, mode.prompt)
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
      <div class="text-4xl mb-2">🔬</div>
      <h2 class="text-2xl font-bold text-slate-800 dark:text-white">图像深度分析</h2>
      <p class="text-slate-500 dark:text-slate-400 mt-1">AI 多维度解读图片内容</p>
    </div>

    <!-- Upload -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <ImageUploader
        label="上传需要分析的图片"
        @file-selected="onImageSelected"
        @file-removed="onImageRemoved"
      />
    </div>

    <!-- Analysis modes -->
    <div v-if="imageBase64" class="fade-in">
      <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">选择分析模式</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <button
          v-for="mode in modes"
          :key="mode.id"
          @click="selectedMode = mode.id"
          class="flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200"
          :class="[
            selectedMode === mode.id
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
          ]"
        >
          <span class="text-xl">{{ mode.icon }}</span>
          <span class="text-xs font-medium">{{ mode.label }}</span>
        </button>
      </div>

      <!-- Analyze button -->
      <button
        @click="analyze"
        :disabled="loading"
        class="w-full mt-4 py-3 rounded-xl gradient-bg text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-all disabled:opacity-60"
      >
        {{ loading ? '🔄 分析中...' : '🚀 开始分析' }}
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
      ⚠️ {{ error }}
    </div>

    <!-- Results -->
    <div v-if="result || loading" class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 fade-in">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-lg">{{ modes.find(m => m.id === selectedMode)?.icon }}</span>
        <h3 class="font-semibold text-slate-800 dark:text-white">
          {{ modes.find(m => m.id === selectedMode)?.label }}结果
        </h3>
      </div>
      <MarkdownRenderer :content="result" :loading="loading" />
    </div>
  </div>
</template>
