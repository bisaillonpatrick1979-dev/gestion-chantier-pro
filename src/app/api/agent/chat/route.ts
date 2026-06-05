import type { NextRequest } from 'next/server'
import { fetchAgentContext, buildSystemPrompt, type AgentUserContext } from '@/lib/agentContext'
import { callExternalProvider, defaultExternalModel, getExternalProviderKey, providerDisplayName, textEventStream, type ExternalAIProvider } from '@/lib/agentProviderClients'

const ANTHROPIC_API = 'https://api.anthropic.com'

type AIProvider = 'anthropic' | ExternalAIProvider
type AIMode = 'disabled' | 'app_limited' | 'bring_your_own_key'
type AISettings = { mode?: AIMode; provider?: AIProvider; model?: string; allowPhotoAnalysis?: boolean }
type UserContext = AgentUserContext & { page?: string }
type ChatMessage = { role: 'user' | 'agent'; content: string }
type AgentImage = { mediaType: string; data: string; name?: string }
type ClaudeContentBlock = { type: 'text'; text: string } | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }

const isExternal = (p: AIProvider): p is ExternalAIProvider => p === 'openai' || p === 'google_ai_studio' || p === 'deepseek'

function anthropicHeaders(token: string) {
  return { 'Content-Type': 'application/json', 'x-api-key': token, 'anthropic-version': '2023-06-01' }
}

function imageContent(text: string, image?: AgentImage): string | ClaudeContentBlock[] {
  if (!image?.data || !image.mediaType?.startsWith('image/')) return text
  return [
    { type: 'text', text: `${text}\n\nAnalyse cette photo de chantier extérieur en Alberta: causes probables, risques, solutions, matériaux, outils, étapes sécuritaires et points à vérifier.` },
    { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } },
  ]
}

export async function POST(request: NextRequest) {
  let body: { message: string; image?: AgentImage; userContext?: UserContext; history?: ChatMessage[]; aiSettings?: AISettings }
  try { body = await request.json() as typeof body } catch { return Response.json({ error: 'Corps de requête invalide' }, { status: 400 }) }

  const { message, image, userContext, history = [], aiSettings } = body
  const provider: AIProvider = aiSettings?.provider || 'anthropic'
  const model = aiSettings?.model || (isExternal(provider) ? defaultExternalModel(provider) : 'claude-sonnet-4-6')

  if (aiSettings?.mode === 'disabled') return textEventStream('L’IA est désactivée. L’application fonctionne sans agent IA.')
  if (!message?.trim() && !image?.data) return Response.json({ error: 'Message vide' }, { status: 400 })
  if (image?.data && image.data.length > 7_000_000) return Response.json({ error: 'Image trop lourde. Essaie une photo plus petite.' }, { status: 413 })
  if (image?.data && aiSettings?.allowPhotoAnalysis === false) return textEventStream('Analyse photo désactivée dans les réglages IA.')

  const prefix = userContext ? `[${userContext.role === 'admin' ? 'Admin' : 'Employé'}${userContext.name ? ` — ${userContext.name}` : ''}${userContext.page ? ` — ${userContext.page}` : ''}]\n` : ''
  const fullMessage = prefix + (message?.trim() || 'Analyse cette photo de chantier.')
  const ctx = await fetchAgentContext()
  const uiLang = userContext?.lang ?? 'fr'
  const contextNote = uiLang === 'en'
    ? 'You assist an exterior construction company in Alberta, Canada. Give practical, safe, and verifiable advice. Always use CAD prices.'
    : 'Tu aides une compagnie de construction extérieure en Alberta. Donne des conseils pratiques, sécuritaires et vérifiables. Prix toujours en CAD.'
  const systemPrompt = `${buildSystemPrompt(ctx, userContext ?? undefined)}\n\n${contextNote}`

  if (isExternal(provider)) {
    const token = getExternalProviderKey(provider)
    if (!token) return textEventStream(`Aucune configuration serveur trouvée pour ${providerDisplayName(provider)}.`)
    if (image?.data && provider !== 'openai') return textEventStream(`${providerDisplayName(provider)} est actif pour texte. Pour photo, choisis OpenAI ou Anthropic.`)
    const upstream = await callExternalProvider(provider, token, model, systemPrompt, fullMessage, history, image)
    if (!upstream.ok || !upstream.body) return Response.json({ error: await upstream.text().catch(() => 'Erreur API IA') }, { status: upstream.status || 500 })
    return new Response(upstream.body, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no', 'X-Session-Id': `external-${Date.now()}` } })
  }

  const token = process.env.ANTHROPIC_API_KEY
  if (!token) return textEventStream('Aucune configuration Anthropic côté serveur. L’application peut être utilisée sans IA.')

  const messages: Array<{ role: 'user' | 'assistant'; content: string | ClaudeContentBlock[] }> = [
    ...history.filter(m => m.content.trim()).slice(-20).map(m => ({ role: (m.role === 'agent' ? 'assistant' : 'user') as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: imageContent(fullMessage, image) },
  ]
  const upstream = await fetch(`${ANTHROPIC_API}/v1/messages`, { method: 'POST', headers: anthropicHeaders(token), body: JSON.stringify({ model, max_tokens: 2048, stream: true, system: systemPrompt, messages }) })
  if (!upstream.ok || !upstream.body) return Response.json({ error: await upstream.text().catch(() => 'Erreur API IA') }, { status: upstream.status || 500 })
  return new Response(upstream.body, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no', 'X-Session-Id': `direct-${Date.now()}` } })
}
