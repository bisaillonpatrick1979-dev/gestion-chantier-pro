'use client'

import { useEffect, useState } from 'react'
import AgentChat from '@/components/AgentChat'

export default function SafeAgentMount() {
  const [enabled, setEnabled] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    try {
      const disabled = localStorage.getItem('disable-agent-ai-v1') === '1'
      setEnabled(!disabled)
    } catch {
      setEnabled(false)
    }
  }, [])

  if (failed || !enabled) return null

  try {
    return <AgentChat />
  } catch (error) {
    console.error('SafeAgentMount failed', error)
    setFailed(true)
    return null
  }
}
