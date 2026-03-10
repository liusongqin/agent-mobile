<script setup>
import { ref, nextTick } from 'vue'
import ImageUploader from '../components/common/ImageUploader.vue'
import MarkdownRenderer from '../components/common/MarkdownRenderer.vue'
import { visualChat, fileToBase64, streamVisionAPI, getApiKey } from '../services/openai.js'

const messages = ref([])
const inputText = ref('')
const loading = ref(false)
const currentImage = ref(null)
const chatContainer = ref(null)
const uploader = ref(null)
const streamingContent = ref('')
const abortController = ref(null)

function onImageSelected({ base64 }) {
  currentImage.value = base64
}

function onImageRemoved() {
  currentImage.value = null
}

async function sendMessage() {
  if (!inputText.value.trim() && !currentImage.value) return

  if (!getApiKey()) {
    messages.value.push({
      role: 'assistant',
      content: '⚠️ 请先前往 **设置** 页面配置 API Key 后再使用。',
      id: Date.now()
    })
    scrollToBottom()
    return
  }

  // Add user message
  const userMsg = {
    role: 'user',
    content: inputText.value || '请分析这张图片',
    image: currentImage.value,
    id: Date.now()
  }
  messages.value.push(userMsg)

  const text = inputText.value || '请分析这张图片'
  const image = currentImage.value

  inputText.value = ''
  currentImage.value = null
  if (uploader.value) {
    uploader.value.removeFile()
  }

  loading.value = true
  streamingContent.value = ''
  scrollToBottom()

  // Build chat history for API
  const apiMessages = messages.value
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => {
      if (m.role === 'user') {
        const content = []
        if (m.content) content.push({ type: 'text', text: m.content })
        if (m.image) content.push({ type: 'image_url', image_url: { url: m.image, detail: 'high' } })
        return { role: 'user', content }
      }
      return { role: 'assistant', content: m.content }
    })

  // Add assistant placeholder
  const assistantMsg = { role: 'assistant', content: '', id: Date.now() + 1 }
  messages.value.push(assistantMsg)

  abortController.value = new AbortController()

  await streamVisionAPI({
    messages: [
      { role: 'system', content: '你是一个友好的AI视觉助手「灵眸」，可以看懂图片并与用户进行多轮对话。你的回答要详细、有趣、有见解。请用中文回答。使用Markdown格式。' },
      ...apiMessages
    ],
    signal: abortController.value.signal,
    onChunk(chunk) {
      streamingContent.value += chunk
      assistantMsg.content = streamingContent.value
      scrollToBottom()
    },
    onDone() {
      assistantMsg.content = streamingContent.value
      streamingContent.value = ''
      loading.value = false
    },
    onError(err) {
      assistantMsg.content = `❌ 出错了: ${err.message}`
      loading.value = false
    }
  })
}

function stopGeneration() {
  abortController.value?.abort()
  loading.value = false
}

function clearChat() {
  messages.value = []
  streamingContent.value = ''
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

function handleQuickUpload(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      currentImage.value = ev.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-3.5rem)]">
    <!-- Chat messages -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Empty state -->
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center">
        <div class="text-6xl mb-4 float">💬</div>
        <h3 class="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">开始视觉对话</h3>
        <p class="text-slate-500 dark:text-slate-400 max-w-md">
          上传一张图片，或者直接输入问题，与「灵眸」AI进行深度视觉对话。
        </p>
        <div class="flex flex-wrap gap-2 mt-4 justify-center">
          <button
            v-for="prompt in ['这张图片有什么特别之处？', '描述一下你看到了什么', '分析图中的颜色搭配']"
            :key="prompt"
            @click="inputText = prompt"
            class="px-3 py-1.5 bg-white dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
          >
            {{ prompt }}
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="chat-bubble flex gap-3"
        :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
      >
        <!-- Avatar -->
        <div class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
          :class="msg.role === 'user'
            ? 'bg-indigo-100 dark:bg-indigo-900/50'
            : 'bg-emerald-100 dark:bg-emerald-900/50'"
        >
          {{ msg.role === 'user' ? '👤' : '👁' }}
        </div>

        <!-- Content -->
        <div
          class="max-w-[80%] rounded-2xl px-4 py-3"
          :class="msg.role === 'user'
            ? 'bg-indigo-500 text-white rounded-tr-sm'
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700'"
        >
          <!-- User image -->
          <img
            v-if="msg.image"
            :src="msg.image"
            alt="Uploaded"
            class="max-h-48 rounded-lg mb-2"
          />

          <!-- User text -->
          <p v-if="msg.role === 'user'" class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>

          <!-- Assistant text -->
          <MarkdownRenderer
            v-else
            :content="msg.content"
            :loading="loading && msg === messages[messages.length - 1] && !msg.content"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading && !messages.length" class="flex gap-3 chat-bubble">
        <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-sm">👁</div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-200 dark:border-slate-700">
          <MarkdownRenderer loading />
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
      <!-- Image preview mini -->
      <div v-if="currentImage" class="mb-3">
        <div class="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
          <img :src="currentImage" alt="Preview" class="h-12 w-12 object-cover rounded" />
          <span class="text-xs text-slate-500">图片已选择</span>
          <button @click="onImageRemoved(); uploader?.removeFile()" class="text-red-500 hover:text-red-600 text-sm">✕</button>
        </div>
      </div>

      <div class="flex gap-2 items-end">
        <!-- Upload button -->
        <div class="relative">
          <input
            type="file"
            accept="image/*"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            @change="handleQuickUpload"
          />
          <button class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            📷
          </button>
        </div>

        <!-- Text input -->
        <textarea
          v-model="inputText"
          @keydown="handleKeydown"
          placeholder="输入消息或上传图片..."
          rows="1"
          class="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
        ></textarea>

        <!-- Send / Stop button -->
        <button
          v-if="loading"
          @click="stopGeneration"
          class="p-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          ⏹
        </button>
        <button
          v-else
          @click="sendMessage"
          :disabled="!inputText.trim() && !currentImage"
          class="p-3 rounded-xl gradient-bg text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ➤
        </button>

        <!-- Clear button -->
        <button
          v-if="messages.length > 0"
          @click="clearChat"
          class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="清空对话"
        >
          🗑
        </button>
      </div>
    </div>
  </div>
</template>
