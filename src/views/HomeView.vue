<script setup>
import { ref } from 'vue'
import { getApiKey } from '../services/openai.js'

const hasApiKey = ref(!!getApiKey())

const features = [
  {
    icon: '💬',
    title: '视觉对话',
    desc: '上传图片与AI进行多轮深度对话，像聊天一样探索图片的每个细节',
    path: '/chat',
    color: 'from-blue-500 to-cyan-500',
    tag: '最受欢迎'
  },
  {
    icon: '🔬',
    title: '图像分析',
    desc: '专业级图像分析，一键获取场景、物体、情感、颜色等多维度信息',
    path: '/analyze',
    color: 'from-purple-500 to-pink-500',
    tag: '专业级'
  },
  {
    icon: '✍️',
    title: '创意写作',
    desc: '以图片为灵感，AI为你创作诗歌、故事、歌词、影评等文学作品',
    path: '/creative',
    color: 'from-amber-500 to-orange-500',
    tag: '有创意'
  },
  {
    icon: '🔍',
    title: '图像对比',
    desc: '上传两张图片，AI找出差异、相似之处，支持多种对比模式',
    path: '/compare',
    color: 'from-green-500 to-emerald-500',
    tag: '实用工具'
  },
  {
    icon: '📝',
    title: '文字提取',
    desc: 'OCR智能文字识别，支持印刷体、手写体、表格等多种场景',
    path: '/ocr',
    color: 'from-red-500 to-rose-500',
    tag: 'OCR'
  },
  {
    icon: '♿',
    title: '无障碍描述',
    desc: '自动生成符合WCAG标准的图片无障碍描述，助力信息无障碍',
    path: '/accessibility',
    color: 'from-indigo-500 to-violet-500',
    tag: '公益'
  }
]

const highlights = [
  { icon: '🧠', text: 'GPT-4o 视觉模型' },
  { icon: '🎨', text: '8大功能模块' },
  { icon: '🌙', text: '深色/浅色主题' },
  { icon: '📱', text: '响应式设计' },
  { icon: '⚡', text: '流式输出' },
  { icon: '🔒', text: '本地密钥存储' },
]
</script>

<template>
  <div class="min-h-full">
    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 dark:from-indigo-900/20 dark:via-purple-900/10 dark:to-pink-900/20"></div>
      <div class="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div class="text-center slide-up">
          <div class="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            AI 视觉智能平台
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4">
            <span class="gradient-text">灵眸 AI</span>
            <span class="block text-2xl sm:text-3xl font-normal text-slate-600 dark:text-slate-400 mt-2">
              Vision Studio
            </span>
          </h1>

          <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            基于 OpenAI 视觉模型的智能图像理解平台。上传图片，获得专业分析、创意写作、文字提取等丰富功能体验。
          </p>

          <div class="flex flex-wrap justify-center gap-3 mb-8">
            <div
              v-for="h in highlights"
              :key="h.text"
              class="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm text-slate-600 dark:text-slate-400 shadow-sm"
            >
              <span>{{ h.icon }}</span>
              <span>{{ h.text }}</span>
            </div>
          </div>

          <div class="flex justify-center gap-3">
            <router-link
              to="/chat"
              class="inline-flex items-center gap-2 gradient-bg text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              🚀 开始体验
            </router-link>
            <router-link
              v-if="!hasApiKey"
              to="/settings"
              class="inline-flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-medium border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300"
            >
              ⚙️ 配置 API Key
            </router-link>
          </div>

          <div v-if="!hasApiKey" class="mt-4 text-sm text-amber-600 dark:text-amber-400">
            ⚠️ 检测到尚未配置 API Key，请先前往设置页面进行配置
          </div>
        </div>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="max-w-6xl mx-auto px-4 pb-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="(feature, index) in features"
          :key="feature.path"
          :to="feature.path"
          class="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 fade-in"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <!-- Tag -->
          <div class="absolute top-4 right-4">
            <span class="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {{ feature.tag }}
            </span>
          </div>

          <!-- Icon -->
          <div
            class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 bg-gradient-to-br shadow-lg"
            :class="feature.color"
          >
            <span class="filter drop-shadow-sm">{{ feature.icon }}</span>
          </div>

          <!-- Content -->
          <h3 class="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {{ feature.title }}
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {{ feature.desc }}
          </p>

          <!-- Arrow -->
          <div class="mt-4 flex items-center text-sm text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            开始使用
            <svg class="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </router-link>
      </div>

      <!-- Footer info -->
      <div class="mt-12 text-center">
        <p class="text-sm text-slate-400 dark:text-slate-500">
          🎓 毕业设计项目 · 基于 Vue 3 + Vite + OpenAI Vision API · 灵眸 AI Vision Studio
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
a {
  text-decoration: none;
}
</style>
