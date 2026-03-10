import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/chat',
    name: 'VisualChat',
    component: () => import('../views/VisualChatView.vue')
  },
  {
    path: '/analyze',
    name: 'ImageAnalysis',
    component: () => import('../views/ImageAnalysisView.vue')
  },
  {
    path: '/creative',
    name: 'CreativeWriting',
    component: () => import('../views/CreativeWritingView.vue')
  },
  {
    path: '/compare',
    name: 'ImageCompare',
    component: () => import('../views/ImageCompareView.vue')
  },
  {
    path: '/ocr',
    name: 'OCRExtract',
    component: () => import('../views/OCRExtractView.vue')
  },
  {
    path: '/accessibility',
    name: 'Accessibility',
    component: () => import('../views/AccessibilityView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
