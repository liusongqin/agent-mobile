<script setup>
import { ref, onMounted } from 'vue'
import { getApiKey, setApiKey, getApiBaseUrl, setApiBaseUrl, getModel, setModel } from '../services/openai.js'

const apiKey = ref('')
const apiBase = ref('')
const model = ref('')
const saved = ref(false)
const showKey = ref(false)

const models = [
  { id: 'gpt-4o', label: 'GPT-4o (推荐)', desc: '最强视觉模型，效果最好' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: '性价比高，速度更快' },
  { id: 'gpt-4-turbo', label: 'GPT-4 Turbo', desc: '经典模型，稳定可靠' },
]

onMounted(() => {
  apiKey.value = getApiKey()
  apiBase.value = getApiBaseUrl()
  model.value = getModel()
})

function save() {
  setApiKey(apiKey.value.trim())
  setApiBaseUrl(apiBase.value.trim())
  setModel(model.value)
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

function clearAll() {
  apiKey.value = ''
  apiBase.value = 'https://api.openai.com/v1'
  model.value = 'gpt-4o'
  save()
}

const maskedKey = () => {
  if (!apiKey.value) return ''
  if (showKey.value) return apiKey.value
  return apiKey.value.slice(0, 8) + '••••••••' + apiKey.value.slice(-4)
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-4 space-y-6">
    <!-- Header -->
    <div class="text-center slide-up">
      <div class="text-4xl mb-2">⚙️</div>
      <h2 class="text-2xl font-bold text-slate-800 dark:text-white">设置</h2>
      <p class="text-slate-500 dark:text-slate-400 mt-1">配置 OpenAI API 连接参数</p>
    </div>

    <!-- Security note -->
    <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400">
      <p class="font-medium mb-1">🔒 安全说明</p>
      <p>API Key 仅存储在您的浏览器本地 (localStorage)，不会发送到除 OpenAI 之外的任何服务器。</p>
    </div>

    <!-- Settings form -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
      <!-- API Key -->
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          API Key <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            v-model="apiKey"
            :type="showKey ? 'text' : 'password'"
            placeholder="sk-..."
            class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 pr-20"
          />
          <button
            @click="showKey = !showKey"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-indigo-500 transition-colors"
          >
            {{ showKey ? '🙈 隐藏' : '👁 显示' }}
          </button>
        </div>
        <p class="mt-1 text-xs text-slate-400">从 OpenAI 或兼容平台获取的 API 密钥</p>
      </div>

      <!-- API Base URL -->
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          API 地址
        </label>
        <input
          v-model="apiBase"
          type="url"
          placeholder="https://api.openai.com/v1"
          class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
        />
        <p class="mt-1 text-xs text-slate-400">支持自定义 API 代理地址（如 Azure OpenAI、第三方代理等）</p>
      </div>

      <!-- Model selection -->
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          模型选择
        </label>
        <div class="space-y-2">
          <label
            v-for="m in models"
            :key="m.id"
            class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
            :class="[
              model === m.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
            ]"
          >
            <input
              type="radio"
              :value="m.id"
              v-model="model"
              class="text-indigo-600"
            />
            <div>
              <div class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ m.label }}</div>
              <div class="text-xs text-slate-400">{{ m.desc }}</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Custom model -->
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          自定义模型名称
        </label>
        <input
          v-model="model"
          type="text"
          placeholder="输入自定义模型名称..."
          class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
        />
        <p class="mt-1 text-xs text-slate-400">如使用第三方兼容接口，可手动输入模型名称</p>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3">
        <button
          @click="save"
          class="flex-1 py-3 rounded-xl gradient-bg text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-all"
        >
          {{ saved ? '✅ 已保存' : '💾 保存设置' }}
        </button>
        <button
          @click="clearAll"
          class="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          🗑 重置
        </button>
      </div>
    </div>

    <!-- About -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 class="font-semibold text-slate-800 dark:text-white mb-3">关于灵眸 AI</h3>
      <div class="text-sm text-slate-500 dark:text-slate-400 space-y-2">
        <p>🎓 毕业设计项目 — AI 视觉智能平台</p>
        <p>📦 技术栈：Vue 3 + Vite + Tailwind CSS + OpenAI Vision API</p>
        <p>🔧 功能：视觉对话、图像分析、创意写作、图像对比、OCR文字提取、无障碍描述生成</p>
        <p>💡 所有 AI 功能均基于 OpenAI 的 GPT-4 Vision 模型</p>
      </div>
    </div>
  </div>
</template>
