'use client'

import { useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import BackstageUpload from './BackstageUpload'

// Dashboard carregado dinamicamente (evita SSR de recharts/leaflet)
const BackstageDashboard = dynamic(() => import('./BackstageDashboard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 text-sm" style={{ color: 'var(--color-light)' }}>
      Carregando dashboard...
    </div>
  ),
})

type Tab = 'upload' | 'dashboard'

export default function BackstageTabs({ userEmail }: { userEmail: string }) {
  const [tab, setTab] = useState<Tab>('upload')

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-3 shadow-sm sticky top-0 z-30"
        style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-4">
          <Image src="/logo_cor.png" alt="BPet" width={110} height={36} className="object-contain" />
          <span className="text-xs font-semibold px-2 py-0.5 rounded"
            style={{ backgroundColor: '#6366f1', color: '#fff' }}>Backstage</span>

          {/* Tab switcher */}
          <div className="flex rounded-lg overflow-hidden border ml-2"
            style={{ borderColor: 'var(--color-border)' }}>
            {(['upload', 'dashboard'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-1.5 text-xs font-medium transition"
                style={{
                  backgroundColor: tab === t ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: tab === t ? '#fff' : 'var(--color-medium)',
                }}
              >
                {t === 'upload' ? '↑ Upload' : '📊 Dashboard'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:block text-xs" style={{ color: 'var(--color-light)' }}>{userEmail}</span>
          <a href="/admin"
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition hover:opacity-80"
            style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-medium)' }}>
            ← Admin
          </a>
          <a href="/dashboard"
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition hover:opacity-80"
            style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-medium)' }}>
            BI
          </a>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1">
        {tab === 'upload'    && <BackstageUpload />}
        {tab === 'dashboard' && <BackstageDashboard />}
      </div>
    </div>
  )
}
