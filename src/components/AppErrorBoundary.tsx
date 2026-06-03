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
    return <div style={{ margin: 16, padding: 16, borderRadius: 18, border: '1px solid rgba(248,113,113,.35)', background: 'rgba(127,29,29,.22)', color: 'white' }}>
      <h2 style={{ fontSize: 22, fontWeight: 950 }}>Module bloqué</h2>
      <p style={{ marginTop: 6, color: 'rgba(255,255,255,.75)' }}>{this.props.label || 'Module'} n’a pas chargé. L’application principale reste accessible.</p>
      <p style={{ marginTop: 6, color: 'rgba(255,255,255,.55)', fontSize: 13 }}>{this.state.message}</p>
      <button onClick={() => this.setState({ hasError: false, message: '' })} style={{ marginTop: 12, marginRight: 8, borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.08)', color: 'white', fontWeight: 900 }}>Réessayer</button>
      <button onClick={this.resetLocal} style={{ marginTop: 12, borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(248,113,113,.4)', background: 'rgba(248,113,113,.18)', color: 'white', fontWeight: 900 }}>Effacer cache local</button>
    </div>
  }
}
