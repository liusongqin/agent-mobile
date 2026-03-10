/**
 * OpenAI Vision API Service
 * Handles all communication with the OpenAI API for vision-related tasks
 */

const DEFAULT_MODEL = 'gpt-4o'

/**
 * Get API key from localStorage
 */
export function getApiKey() {
  return localStorage.getItem('openai_api_key') || ''
}

/**
 * Set API key to localStorage
 */
export function setApiKey(key) {
  localStorage.setItem('openai_api_key', key)
}

/**
 * Get API base URL from localStorage
 */
export function getApiBaseUrl() {
  return localStorage.getItem('openai_api_base') || 'https://api.openai.com/v1'
}

/**
 * Set API base URL to localStorage
 */
export function setApiBaseUrl(url) {
  localStorage.setItem('openai_api_base', url)
}

/**
 * Get selected model from localStorage
 */
export function getModel() {
  return localStorage.getItem('openai_model') || DEFAULT_MODEL
}

/**
 * Set model to localStorage
 */
export function setModel(model) {
  localStorage.setItem('openai_model', model)
}

/**
 * Convert a File object to a base64 data URL
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Build message content with text and optional images
 */
function buildContent(text, imageUrls = []) {
  const content = []

  if (text) {
    content.push({ type: 'text', text })
  }

  for (const url of imageUrls) {
    content.push({
      type: 'image_url',
      image_url: { url, detail: 'high' }
    })
  }

  return content
}

/**
 * Call OpenAI Chat Completions API with vision support
 */
export async function callVisionAPI({
  messages,
  maxTokens = 4096,
  temperature = 0.7,
  stream = false,
  signal
}) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('请先在设置页面配置 API Key')
  }

  const baseUrl = getApiBaseUrl()
  const model = getModel()

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      stream
    }),
    signal
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API 请求失败: ${response.status}`)
  }

  if (stream) {
    return response
  }

  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * Stream response from OpenAI API
 */
export async function streamVisionAPI({
  messages,
  maxTokens = 4096,
  temperature = 0.7,
  onChunk,
  onDone,
  onError,
  signal
}) {
  try {
    const response = await callVisionAPI({
      messages,
      maxTokens,
      temperature,
      stream: true,
      signal
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') {
          onDone?.()
          return
        }
        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            onChunk?.(content)
          }
        } catch {
          // skip malformed JSON
        }
      }
    }

    onDone?.()
  } catch (error) {
    if (error.name === 'AbortError') return
    onError?.(error)
  }
}

/**
 * Analyze a single image with a prompt
 */
export async function analyzeImage(imageBase64, prompt, options = {}) {
  const messages = [
    {
      role: 'system',
      content: '你是一个专业的AI视觉助手，能够精准分析图片内容并提供详细、有见解的回答。请用中文回答。'
    },
    {
      role: 'user',
      content: buildContent(prompt, [imageBase64])
    }
  ]

  return callVisionAPI({ messages, ...options })
}

/**
 * Compare two images
 */
export async function compareImages(image1Base64, image2Base64, prompt, options = {}) {
  const messages = [
    {
      role: 'system',
      content: '你是一个专业的AI视觉助手，擅长对比分析多张图片。请用中文详细回答。'
    },
    {
      role: 'user',
      content: buildContent(
        prompt || '请对比分析这两张图片，找出它们的异同点。',
        [image1Base64, image2Base64]
      )
    }
  ]

  return callVisionAPI({ messages, ...options })
}

/**
 * Multi-turn visual chat
 */
export async function visualChat(chatHistory, options = {}) {
  const systemMessage = {
    role: 'system',
    content: '你是一个友好的AI视觉助手「灵眸」，可以看懂图片并与用户进行多轮对话。你的回答要详细、有趣、有见解。请用中文回答。'
  }

  return callVisionAPI({
    messages: [systemMessage, ...chatHistory],
    ...options
  })
}

/**
 * Creative writing from image
 */
export async function creativeWriteFromImage(imageBase64, style, options = {}) {
  const stylePrompts = {
    poem: '请根据这张图片创作一首优美的现代诗，要有意境和情感。',
    story: '请根据这张图片创作一个有趣的短篇故事（500字左右），要有情节和人物。',
    haiku: '请根据这张图片创作3首俳句（每首三行：5-7-5音节），要有禅意。',
    lyrics: '请根据这张图片创作一首歌词，要有副歌和节奏感。',
    review: '请以专业影评人的角度，为这张图片写一段电影式的场景描述和评论。',
    letter: '请以这张图片为灵感，写一封感人的信。',
    diary: '请以这张图片为场景，写一篇日记。',
    news: '请以这张图片为素材，写一篇新闻报道。'
  }

  const messages = [
    {
      role: 'system',
      content: '你是一位才华横溢的AI创作者，擅长从视觉灵感中创作各种文学作品。你的文字优美、富有创意和感染力。请用中文创作。'
    },
    {
      role: 'user',
      content: buildContent(
        stylePrompts[style] || stylePrompts.poem,
        [imageBase64]
      )
    }
  ]

  return callVisionAPI({ messages, ...options })
}

/**
 * OCR text extraction
 */
export async function extractText(imageBase64, options = {}) {
  const messages = [
    {
      role: 'system',
      content: '你是一个专业的OCR文字识别助手。请准确提取图片中的所有文字内容，保持原始格式和排版。如果有表格，请用Markdown表格格式输出。'
    },
    {
      role: 'user',
      content: buildContent(
        '请提取这张图片中的所有文字内容，保持原始排版格式。如果包含表格请用Markdown格式展示。',
        [imageBase64]
      )
    }
  ]

  return callVisionAPI({ messages, ...options })
}

/**
 * Accessibility description generation
 */
export async function generateAccessibilityDesc(imageBase64, level = 'detailed', options = {}) {
  const levelPrompts = {
    brief: '请为这张图片生成一个简短的无障碍描述（alt text），不超过100字。',
    detailed: '请为这张图片生成详细的无障碍描述，包括：1) 简短的alt text 2) 详细的场景描述 3) 情感氛围 4) 关键视觉元素列表。',
    technical: '请为这张图片生成技术级别的无障碍描述，包括：1) W3C标准alt text 2) 长描述(longdesc) 3) ARIA标签建议 4) 颜色对比信息。'
  }

  const messages = [
    {
      role: 'system',
      content: '你是一个无障碍设计专家，擅长为图片生成符合WCAG标准的无障碍描述。请用中文回答。'
    },
    {
      role: 'user',
      content: buildContent(
        levelPrompts[level] || levelPrompts.detailed,
        [imageBase64]
      )
    }
  ]

  return callVisionAPI({ messages, ...options })
}
