<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const sidebarOpen = ref(false)
const isDark = ref(false)

const navItems = [
  { path: '/', icon: '🏠', label: '首页', desc: '功能总览' },
  { path: '/chat', icon: '💬', label: '视觉对话', desc: '与AI聊图片' },
  { path: '/analyze', icon: '🔬', label: '图像分析', desc: '深度图像理解' },
  { path: '/creative', icon: '✍️', label: '创意写作', desc: '图生文创作' },
  { path: '/compare', icon: '🔍', label: '图像对比', desc: '双图差异分析' },
  { path: '/ocr', icon: '📝', label: '文字提取', desc: 'OCR智能识别' },
  { path: '/accessibility', icon: '♿', label: '无障碍', desc: '无障碍描述生成' },
  { path: '/settings', icon: '⚙️', label: '设置', desc: 'API配置' },
]

const currentTitle = computed(() => {
  const item = navItems.find(n => n.path === route.path)
  return item ? item.label : '灵眸 AI'
})

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="flex h-screen overflow-hidden" :class="{ dark: isDark }">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-30 lg:hidden"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <aside
      class="fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col"
      :class="[
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700'
      ]"
    >
      <!-- Logo -->
      <div class="p-5 border-b border-slate-200 dark:border-slate-700">
        <router-link to="/" class="flex items-center gap-3" @click="closeSidebar">
          <div class="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white text-xl font-bold shadow-lg">
            👁
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800 dark:text-white">灵眸 AI</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">Vision Studio</p>
          </div>
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-3 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group"
          :class="[
            route.path === item.path
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
          @click="closeSidebar"
        >
          <span class="text-xl">{{ item.icon }}</span>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium">{{ item.label }}</div>
            <div class="text-xs text-slate-400 dark:text-slate-500 truncate">{{ item.desc }}</div>
          </div>
          <div
            v-if="route.path === item.path"
            class="w-1.5 h-1.5 rounded-full bg-indigo-500"
          ></div>
        </router-link>
      </nav>

      <!-- Theme toggle -->
      <div class="p-3 border-t border-slate-200 dark:border-slate-700">
        <button
          @click="toggleTheme"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span class="text-xl">{{ isDark ? '🌙' : '☀️' }}</span>
          <span class="text-sm font-medium">{{ isDark ? '深色模式' : '浅色模式' }}</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
      <!-- Top bar -->
      <header class="h-14 flex items-center px-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
        <button
          class="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 mr-3"
          @click="sidebarOpen = !sidebarOpen"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 class="text-base font-semibold text-slate-800 dark:text-white">{{ currentTitle }}</h2>
        <div class="flex-1"></div>
        <div class="text-xs text-slate-400 dark:text-slate-500">Powered by OpenAI Vision</div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <transition name="route" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
a {
  text-decoration: none;
}
</style>

