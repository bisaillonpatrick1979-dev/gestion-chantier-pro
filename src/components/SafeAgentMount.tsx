'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const AgentChat = dynamic(() => import('@/components/AgentChat'), {
  ssr: false,
  loading: () => null,
})

export default function SafeAgentMount() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    try {
      setEnabled(localStorage.getItem('disable-agent-ai-v1') !== '1')
    } catch {
      setEnabled(false)
    }
  }, [])

  if (!enabled) return null
  return <AgentChat />
}
