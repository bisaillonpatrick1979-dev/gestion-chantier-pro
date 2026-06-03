'use client'

import React from 'react'

type Props = { children: React.ReactNode; label?: string }
type State = { hasError: boolean; message: string }

export default class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' }
  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
  componentDidCatch(error: unknown) {
    console.error('AppErrorBoundary', this.props.label, error)
  }
  resetLocal = () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch {}
    window.location.href = '/'
  }
  render() {
    if (!this.state.hasError) return this.props.children
    return <div style={{ margin: '10px 12px 86px', padding: 12, borderRadius: 16, border: '1px solid rgba(248,113,113,.35)', background: 'rgba(127,29,29,.22)', color: 'white', maxWidth: 'calc(100vw - 24px)', overflow: 'hidden' }}>
      <h2 style={{ fontSize: 20, fontWeight: 950, lineHeight: 1.1 }}>Module bloqué</h2>
      <p style={{ marginTop: 6, color: 'rgba(255,255,255,.78)', fontSize: 14, lineHeight: 1.3 }}>{this.props.label || 'Module'} n’a pas chargé.</p>
      <details style={{ marginTop: 6 }}><summary style={{ color: 'rgba(255,255,255,.65)', fontSize: 13 }}>Voir erreur</summary><p style={{ marginTop: 6, color: 'rgba(255,255,255,.55)', fontSize: 12, lineHeight: 1.25, overflowWrap: 'anywhere' }}>{this.state.message}</p></details>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        <button onClick={() => this.setState({ hasError: false, message: '' })} style={{ flex: '1 1 120px', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.08)', color: 'white', fontWeight: 900, minHeight: 44 }}>Réessayer</button>
        <button onClick={this.resetLocal} style={{ flex: '1 1 150px', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(248,113,113,.4)', background: 'rgba(248,113,113,.18)', color: 'white', fontWeight: 900, minHeight: 44 }}>Effacer cache local</button>
      </div>
    </div>
  }
}
