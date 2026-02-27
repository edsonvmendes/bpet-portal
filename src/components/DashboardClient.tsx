'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { logout } from '@/actions/auth'

interface Props {
  userEmail: string
  portalTitle: string
  embedUrl: string | null
  isAdmin: boolean
}

export default function DashboardClient({ userEmail, portalTitle, embedUrl, isAdmin }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [now, setNow] = useState('')

  useEffect(() => {
    const fmt = () => setNow(new Date().toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }))
    fmt()
    const t = setInterval(fmt, 60_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) containerRef.current.requestFullscreen()
    else document.exitFullscreen()
  }, [])

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true)
    await logout()
  }, [])

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 shadow-sm sticky top-0 z-30"
        style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <Image src="/logo_cor.png" alt="BPet" width={110} height={36} className="object-contain" />
          <span className="hidden sm:block text-sm font-medium pl-3"
            style={{ color: 'var(--color-medium)', borderLeft: '1px solid var(--color-border)' }}>
            {portalTitle}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-xs" style={{ color: 'var(--color-light)' }}>{userEmail}</span>
          {isAdmin && (
            <a href="/admin"
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition hover:opacity-80"
              style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-medium)', border: '1px solid var(--color-border)' }}>
              Admin
            </a>
          )}
          <button onClick={handleLogout} disabled={isLoggingOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-medium)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
            </svg>
            {isLoggingOut ? 'Saindo…' : 'Sair'}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-4 md:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: 'var(--color-light)' }}>Relatório em tempo real</p>
          <button onClick={handleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {isFullscreen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4m0 5H4m16 0h-5m5 0V4M9 15v5m0-5H4m16 0h-5m0 5v-5" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              }
            </svg>
            {isFullscreen ? 'Sair tela cheia' : 'Tela cheia'}
          </button>
        </div>

        {/* iFrame container */}
        <div ref={containerRef} className="relative rounded-2xl overflow-hidden flex-1"
          style={{ minHeight: '75vh', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', boxShadow: '0 2px 16px 0 rgba(12,36,38,0.07)' }}>

          {/* Skeleton */}
          {!iframeLoaded && embedUrl && (
            <div className="absolute inset-0 z-20 p-6 flex flex-col gap-4" style={{ backgroundColor: 'var(--color-surface)' }}>
              <div className="skeleton h-8 w-1/3" />
              <div className="skeleton h-48 w-full" />
              <div className="flex gap-4">
                <div className="skeleton h-32 flex-1" />
                <div className="skeleton h-32 flex-1" />
                <div className="skeleton h-32 flex-1" />
              </div>
            </div>
          )}

          {/* Watermark */}
          <div className="watermark">{userEmail} · {now}</div>

          {/* Sem embed */}
          {!embedUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--color-light)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
              </svg>
              <p className="text-sm" style={{ color: 'var(--color-medium)' }}>Nenhum relatório configurado.</p>
              {isAdmin && (
                <a href="/admin" className="text-xs underline" style={{ color: 'var(--color-primary)' }}>
                  Configurar no Admin →
                </a>
              )}
            </div>
          )}

          {/* iFrame */}
          {embedUrl && (
            <iframe src={embedUrl} onLoad={() => setIframeLoaded(true)}
              className="absolute inset-0 w-full h-full border-0"
              title="Relatório Power BI" allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              referrerPolicy="no-referrer-when-downgrade" />
          )}
        </div>
      </main>
    </div>
  )
}
