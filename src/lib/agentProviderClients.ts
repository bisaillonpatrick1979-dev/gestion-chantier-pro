export type ExternalAIProvider = 'openai' | 'google_ai_studio' | 'deepseek'

export type SimpleChatMessage = {
  role: 'user' | 'agent'
  content: string
}

export type SimpleAgentImage = {
  mediaType: string
  data: string
  name?: string
}

const enc = new TextEncoder()

export function providerDisplayName(provider: ExternalAIProvider) {
  if (provider === 'openai') return 'OpenAI'
  if (provider === 'google_ai_studio') return 'Google AI Studio / Gemini'
  return 'DeepSeek'
}

export function getExternalProviderKey(provider: ExternalAIProvider) {
  if (provider === 'openai') return process.env.OPENAI_API_KEY
  if (provider === 'google_ai_studio') return process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY
  return process.env.DEEPSEEK_API_KEY
}

export function defaultExternalModel(provider: ExternalAIProvider) {
  if (provider === 'openai') return 'gpt-4.1-mini'
  if (provider === 'google_ai_studio') return 'gemini-1.5-flash'
  return 'deepseek-chat'
}

export function textEventStream(text: string) {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(enc.encode(`data: ${JSON.stringify({ text })}\n\n`))
      controller.enqueue(enc.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      'X-Session-Id': `provider-${Date.now()}`,
    },
  })
}

function buildTextPrompt(systemPrompt: string, history: SimpleChatMessage[], fullMessage: string) {
  const previous = history
    .filter(m => m.content.trim())
    .slice(-12)
    .map(m => `${m.role === 'agent' ? 'Assistant' : 'Utilisateur'}: ${m.content}`)
    .join('\n')
  return `${systemPrompt}\n\nHistorique:\n${previous}\n\nUtilisateur: ${fullMessage}\nAssistant:`
}

function openAICompatibleMessages(systemPrompt: string, history: SimpleChatMessage[], fullMessage: string, image?: SimpleAgentImage, allowImage = true) {
  const safeHistory = history
    .filter(m => m.content.trim())
    .slice(-20)
    .map(m => ({ role: m.role === 'agent' ? 'assistant' : 'user', content: m.content }))

  const userContent = image?.data && allowImage
    ? [
        { type: 'text', text: fullMessage },
        { type: 'image_url', image_url: { url: `data:${image.mediaType};base64,${image.data}` } },
      ]
    : fullMessage

  return [{ role: 'system', content: systemPrompt }, ...safeHistory, { role: 'user', content: userContent }]
}

export async function callOpenAIProvider(apiKey: string, model: string, systemPrompt: string, fullMessage: string, history: SimpleChatMessage[], image?: SimpleAgentImage) {
  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, stream: true, messages: openAICompatibleMessages(systemPrompt, history, fullMessage, image, true) }),
  })
}

export async function callDeepSeekProvider(apiKey: string, model: string, systemPrompt: string, fullMessage: string, history: SimpleChatMessage[]) {
  return fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, stream: true, messages: openAICompatibleMessages(systemPrompt, history, fullMessage, undefined, false) }),
  })
}

export async function callGeminiProvider(apiKey: string, model: string, systemPrompt: string, fullMessage: string, history: SimpleChatMessage[]) {
  const prompt = buildTextPrompt(systemPrompt, history, fullMessage)
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
  })
}

export async function callExternalProvider(provider: ExternalAIProvider, apiKey: string, model: string, systemPrompt: string, fullMessage: string, history: SimpleChatMessage[], image?: SimpleAgentImage) {
  if (provider === 'openai') return callOpenAIProvider(apiKey, model, systemPrompt, fullMessage, history, image)
  if (provider === 'deepseek') return callDeepSeekProvider(apiKey, model, systemPrompt, fullMessage, history)
  return callGeminiProvider(apiKey, model, systemPrompt, fullMessage, history)
}
