import type { NextRequest } from 'next/server'
import { fetchAgentContext, buildSystemPrompt } from '@/lib/agentContext'

const ANTHROPIC_API = 'https://api.anthropic.com'

function baseHeaders(apiKey: string, json = true) {
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  }
}

function managedHeaders(apiKey: string, json = true) {
  return {
    ...baseHeaders(apiKey, json),
    'anthropic-beta': 'managed-agents-2026-04-01',
  }
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

type AgentImage = {
  mediaType: string
  data: string
  name?: string
}

type ClaudeContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }

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

function buildUserContent(fullMessage: string, image?: AgentImage): string | ClaudeContentBlock[] {
  if (!image?.data || !image.mediaType?.startsWith('image/')) return fullMessage
  return [
    {
      type: 'text',
      text: `${fullMessage}\n\nAnalyse la photo comme un assistant de chantier extérieur en Alberta. Identifie les causes possibles, risques, solutions, matériaux/outils probables, étapes de réparation sécuritaires, et questions à vérifier sur place. Si tu n'es pas certain, dis ce qu'il faut inspecter avant de conclure.`,
    },
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: image.mediaType,
        data: image.data,
      },
    },
  ]
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const agentId = process.env.ANTHROPIC_AGENT_ID
  const environmentId = process.env.ANTHROPIC_ENVIRONMENT_ID
  const vaultId = process.env.ANTHROPIC_VAULT_ID

  if (!apiKey) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY requis dans Vercel → Project Settings → Environment Variables.' },
      { status: 500 }
    )
  }

  let body: {
    message: string
    image?: AgentImage
    sessionId?: string
    userContext?: UserContext
    history?: ChatMessage[]
  }

  try {
    body = await request.json() as typeof body
  } catch {
    return Response.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { message, image, sessionId, userContext, history = [] } = body

  if (!message?.trim() && !image?.data) {
    return Response.json({ error: 'Message vide' }, { status: 400 })
  }

  if (image?.data && image.data.length > 7_000_000) {
    return Response.json({ error: 'Image trop lourde. Essaie une photo plus petite.' }, { status: 413 })
  }

  const userCtxPrefix = userContext
    ? `[${userContext.role === 'admin' ? '👑 Admin' : '👷 Employé'}${
        userContext.name ? ` — ${userContext.name}` : ''
      }${
        userContext.page ? ` — Page: ${userContext.page}` : ''
      }]\n`
    : ''

  const fullMessage = userCtxPrefix + (message?.trim() || 'Analyse cette photo de chantier.')

  // Managed Agents: utilisé seulement sans image. Les photos passent par Claude Messages API avec vision.
  if (agentId && !image?.data) {
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

  try {
    const ctx = await fetchAgentContext()
    const systemPrompt = `${buildSystemPrompt(ctx)}\n\nQuand une photo de chantier est fournie, analyse visuellement le problème et donne une réponse pratique pour travaux extérieurs: causes probables, risques, options de réparation, matériaux/outils, étapes recommandées, et points à vérifier. Pour les prix et disponibilités, recommande de faire une recherche web ou d'utiliser l'agent configuré avec accès Internet si disponible.`

    const apiMessages: Array<{ role: 'user' | 'assistant'; content: string | ClaudeContentBlock[] }> = [
      ...history
        .filter((m) => m.content.trim().length > 0)
        .slice(-20)
        .map((m) => ({
          role: (m.role === 'agent' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: m.content,
        })),
      { role: 'user', content: buildUserContent(fullMessage, image) },
    ]

    const stream = await fetch(`${ANTHROPIC_API}/v1/messages`, {
      method: 'POST',
      headers: baseHeaders(apiKey),
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        stream: true,
        system: systemPrompt,
        messages: apiMessages,
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
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
