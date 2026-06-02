import type { NextRequest } from 'next/server'
import { fetchAgentContext, buildSystemPrompt } from '@/lib/agentContext'

const ANTHROPIC_API = 'https://api.anthropic.com'
const OPENAI_API = 'https://api.openai.com'

function anthropicHeaders(apiKey: string, json = true) {
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  }
}

function managedHeaders(apiKey: string, json = true) {
  return {
    ...anthropicHeaders(apiKey, json),
    'anthropic-beta': 'managed-agents-2026-04-01',
  }
}

type AIProvider = 'anthropic' | 'openai'

type AIConfig = {
  provider: AIProvider
  apiKey: string
  model: string
}

type UserContext = {
  role: 'employee' | 'admin'
  name?: string
  page?: string
}

type ChatMessage = {
  role: 'user' | 'agent'
  content: string
}

async function createManagedSession(
  apiKey: string,
  agentId: string,
  environmentId?: string,
  vaultId?: string
): Promise<string> {
  const res = await fetch(`${ANTHROPIC_API}/v1/sessions`, {
    method: 'POST',
    headers: managedHeaders(apiKey),
    body: JSON.stringify({
      environment_id: environmentId,
      agent: { type: 'agent', id: agentId },
      vault_ids: vaultId ? [vaultId] : [],
    }),
  })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json() as { id: string }
  return data.id
}

async function streamOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<Response> {
  const stream = await fetch(`${OPENAI_API}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      stream: true,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  })

  if (!stream.ok || !stream.body) {
    const err = await stream.text().catch(() => 'Erreur API OpenAI')
    let detail = err
    try {
      const parsed = JSON.parse(err) as { error?: { message?: string } }
      detail = parsed?.error?.message ?? err
    } catch { /* keep raw */ }
    return Response.json({ error: detail }, { status: stream.status || 500 })
  }

  return new Response(stream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'X-Session-Id': `openai-${Date.now()}`,
    },
  })
}

async function streamAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<Response> {
  const stream = await fetch(`${ANTHROPIC_API}/v1/messages`, {
    method: 'POST',
    headers: anthropicHeaders(apiKey),
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      stream: true,
      system: systemPrompt,
      messages,
    }),
  })

  if (!stream.ok || !stream.body) {
    const err = await stream.text().catch(() => 'Erreur API Claude')
    let detail = err
    try {
      const parsed = JSON.parse(err) as { error?: { message?: string } }
      detail = parsed?.error?.message ?? err
    } catch { /* keep raw */ }
    return Response.json({ error: detail }, { status: stream.status || 500 })
  }

  return new Response(stream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'X-Session-Id': `direct-${Date.now()}`,
    },
  })
}

export async function POST(request: NextRequest) {
  let body: {
    message: string
    sessionId?: string
    userContext?: UserContext
    history?: ChatMessage[]
    aiConfig?: AIConfig
  }

  try {
    body = await request.json() as typeof body
  } catch {
    return Response.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { message, sessionId, userContext, history = [], aiConfig } = body

  // Client-provided config takes priority over environment variables
  const provider: AIProvider = aiConfig?.provider ?? 'anthropic'
  const apiKey =
    aiConfig?.apiKey ||
    (provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : process.env.OPENAI_API_KEY) ||
    ''
  const model = aiConfig?.model || (provider === 'anthropic' ? 'claude-sonnet-4-6' : 'gpt-4o')

  if (!apiKey) {
    const providerLabel = provider === 'anthropic' ? 'Anthropic' : 'OpenAI'
    return Response.json(
      {
        error: `Clé API ${providerLabel} manquante. Configurez-la dans ⚙️ Réglages → 🤖 Agent IA.`,
      },
      { status: 500 }
    )
  }

  if (!message?.trim()) {
    return Response.json({ error: 'Message vide' }, { status: 400 })
  }

  const userCtxPrefix = userContext
    ? `[${userContext.role === 'admin' ? '👑 Admin' : '👷 Employé'}${
        userContext.name ? ` — ${userContext.name}` : ''
      }${userContext.page ? ` — Page: ${userContext.page}` : ''}]\n`
    : ''

  const fullMessage = userCtxPrefix + message.trim()

  // ─────────────────────────────────────────────────────────
  // MODE 1: Anthropic Managed Agents (si ANTHROPIC_AGENT_ID configuré)
  // ─────────────────────────────────────────────────────────
  if (provider === 'anthropic') {
    const agentId = process.env.ANTHROPIC_AGENT_ID
    const environmentId = process.env.ANTHROPIC_ENVIRONMENT_ID
    const vaultId = process.env.ANTHROPIC_VAULT_ID

    if (agentId) {
      try {
        let sid = sessionId
        if (!sid) {
          sid = await createManagedSession(apiKey, agentId, environmentId, vaultId)
        }

        const evtRes = await fetch(`${ANTHROPIC_API}/v1/sessions/${sid}/events`, {
          method: 'POST',
          headers: managedHeaders(apiKey),
          body: JSON.stringify({ events: [{ type: 'user', text: fullMessage }] }),
        })

        if (!evtRes.ok) {
          const err = await evtRes.text()
          if (evtRes.status >= 400 && evtRes.status < 500) {
            console.warn('[agent/chat] Managed Agents error, falling back to direct API:', err)
          } else {
            return Response.json({ error: `Erreur agent: ${err}` }, { status: evtRes.status })
          }
        } else {
          const stream = await fetch(`${ANTHROPIC_API}/v1/sessions/${sid}/events/stream`, {
            headers: { ...managedHeaders(apiKey, false), Accept: 'text/event-stream' },
          })

          if (stream.ok && stream.body) {
            return new Response(stream.body, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no',
                'X-Session-Id': sid,
              },
            })
          }
        }
      } catch (err) {
        console.warn('[agent/chat] Managed Agents failed, falling back to direct API:', err)
      }
    }
  }

  // ─────────────────────────────────────────────────────────
  // MODE 2: Direct API (Anthropic ou OpenAI)
  // ─────────────────────────────────────────────────────────
  try {
    const ctx = await fetchAgentContext()
    const systemPrompt = buildSystemPrompt(ctx)

    const apiMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...history
        .filter((m) => m.content.trim().length > 0)
        .slice(-20)
        .map((m) => ({
          role: (m.role === 'agent' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: m.content,
        })),
      { role: 'user', content: fullMessage },
    ]

    if (provider === 'openai') {
      return streamOpenAI(apiKey, model, systemPrompt, apiMessages)
    }

    return streamAnthropic(apiKey, model, systemPrompt, apiMessages)
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
