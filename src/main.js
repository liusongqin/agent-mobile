import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// Apply dark mode from localStorage
if (localStorage.getItem('theme') === 'dark' ||
  (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
}

const app = createApp(App)
app.use(router)
app.mount('#app')
