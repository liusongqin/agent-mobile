<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  accept: { type: String, default: 'image/*' },
  maxSize: { type: Number, default: 20 }, // MB
  multiple: { type: Boolean, default: false },
  label: { type: String, default: '上传图片' }
})

const emit = defineEmits(['file-selected', 'file-removed'])

const dragOver = ref(false)
const previewUrl = ref(null)
const fileInput = ref(null)
const fileName = ref('')
const fileSize = ref('')
const error = ref('')

function handleDrop(e) {
  dragOver.value = false
  const files = e.dataTransfer.files
  if (files.length) {
    processFile(files[0])
  }
}

function handleFileInput(e) {
  const files = e.target.files
  if (files.length) {
    processFile(files[0])
  }
}

function processFile(file) {
  error.value = ''

  if (!file.type.startsWith('image/')) {
    error.value = '请选择图片文件'
    return
  }

  if (file.size > props.maxSize * 1024 * 1024) {
    error.value = `文件大小不能超过 ${props.maxSize}MB`
    return
  }

  fileName.value = file.name
  fileSize.value = (file.size / 1024 / 1024).toFixed(2) + ' MB'

  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
    emit('file-selected', { file, base64: e.target.result })
  }
  reader.readAsDataURL(file)
}

function removeFile() {
  previewUrl.value = null
  fileName.value = ''
  fileSize.value = ''
  error.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emit('file-removed')
}

function openFileDialog() {
  fileInput.value?.click()
}

defineExpose({ removeFile, previewUrl })
</script>

<template>
  <div class="w-full">
    <!-- Upload area -->
    <div
      v-if="!previewUrl"
      class="relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300"
      :class="[
        dragOver
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
          : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
      ]"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="handleDrop"
      @click="openFileDialog"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        class="hidden"
        @change="handleFileInput"
      />

      <div class="text-4xl mb-3">📸</div>
      <p class="text-slate-600 dark:text-slate-400 font-medium mb-1">{{ label }}</p>
      <p class="text-sm text-slate-400 dark:text-slate-500">
        拖拽图片到此处，或点击选择
      </p>
      <p class="text-xs text-slate-400 dark:text-slate-500 mt-2">
        支持 JPG、PNG、GIF、WebP 格式，最大 {{ maxSize }}MB
      </p>
    </div>

    <!-- Preview area -->
    <div v-else class="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
      <img
        :src="previewUrl"
        :alt="fileName"
        class="w-full max-h-80 object-contain"
      />
      <div class="absolute top-2 right-2 flex gap-2">
        <button
          @click="removeFile"
          class="p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors"
          title="移除图片"
        >
          ✕
        </button>
      </div>
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
        <p class="text-white text-sm truncate">{{ fileName }}</p>
        <p class="text-white/70 text-xs">{{ fileSize }}</p>
      </div>
    </div>

    <!-- Error -->
    <p v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</p>
  </div>
</template>
