'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { saveSettings } from '@/actions/settings'
import { logout } from '@/actions/auth'
import type { PortalSettings, AuditLog } from '@/lib/types'

interface Props {
  settings: PortalSettings | null
  auditLogs: AuditLog[]
  userEmail: string
}

export default function AdminClient({ settings, auditLogs, userEmail }: Props) {
  const [portalTitle, setPortalTitle] = useState(settings?.portal_title ?? 'BPet Analytics')
  const [reportId,    setReportId]    = useState(settings?.report_id    ?? '')
  const [embedUrl,    setEmbedUrl]    = useState(settings?.embed_url    ?? '')
  const [activeMode,  setActiveMode]  = useState<'report_id' | 'embed_url'>(settings?.active_mode ?? 'report_id')
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaveMsg(null)
    const fd = new FormData()
    fd.set('portal_title', portalTitle)
    fd.set('report_id',    reportId)
    fd.set('embed_url',    embedUrl)
    fd.set('active_mode',  activeMode)
    startTransition(async () => {
      const result = await saveSettings(fd)
      if (result?.success) setSaveMsg({ type: 'ok',  text: 'Configurações salvas com sucesso!' })
      else                 setSaveMsg({ type: 'err', text: result?.error ?? 'Erro ao salvar.' })
    })
  }

  const eventLabel: Record<string, string> = {
    login:          '🔑 Login',
    logout:         '🚪 Logout',
    dashboard_view: '📊 Acesso ao dashboard',
    config_change:  '⚙️ Configuração alterada',
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 shadow-sm sticky top-0 z-30"
        style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <Image src="/logo_cor.png" alt="BPet" width={110} height={36} className="object-contain" />
          <span className="text-xs font-semibold px-2 py-0.5 rounded"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-xs" style={{ color: 'var(--color-light)' }}>{userEmail}</span>
          <a href="/dashboard"
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition hover:opacity-80"
            style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-medium)' }}>
            ← Dashboard
          </a>
          <button onClick={() => logout()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition hover:opacity-80"
            style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-medium)' }}>
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full flex flex-col gap-6">
        <h1 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>
          Configurações do Portal
        </h1>

        {/* Settings card */}
        <form onSubmit={handleSave} className="rounded-2xl p-6 flex flex-col gap-5"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>

          <Field label="Título do portal">
            <input value={portalTitle} onChange={(e) => setPortalTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2BBFB3]"
              style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-foreground)' }} />
          </Field>

          <Field label="Modo de embed">
            <div className="flex gap-4">
              {(['report_id', 'embed_url'] as const).map((mode) => (
                <label key={mode} className="flex items-center gap-2 cursor-pointer text-sm"
                  style={{ color: 'var(--color-foreground)' }}>
                  <input type="radio" name="activeMode" value={mode} checked={activeMode === mode}
                    onChange={() => setActiveMode(mode)} className="accent-[#2BBFB3]" />
                  {mode === 'report_id' ? 'Report ID (template)' : 'URL completa'}
                </label>
              ))}
            </div>
          </Field>

          {activeMode === 'report_id' && (
            <Field label="Report ID" hint="Código após ?r= no link Publish to Web do Power BI">
              <input value={reportId} onChange={(e) => setReportId(e.target.value)}
                placeholder="AbCdEf1234..."
                className="w-full px-3 py-2 rounded-lg text-sm outline-none font-mono focus:ring-2 focus:ring-[#2BBFB3]"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-foreground)' }} />
            </Field>
          )}

          {activeMode === 'embed_url' && (
            <Field label="Embed URL completa" hint="Cole a URL completa do Power BI Publish to Web">
              <input value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)}
                placeholder="https://app.powerbi.com/view?r=..."
                className="w-full px-3 py-2 rounded-lg text-sm outline-none font-mono focus:ring-2 focus:ring-[#2BBFB3]"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-foreground)' }} />
            </Field>
          )}

          {saveMsg && (
            <p className="text-sm rounded-lg px-3 py-2" style={{
              backgroundColor: saveMsg.type === 'ok' ? '#DCFCE7' : '#FEE2E2',
              color: saveMsg.type === 'ok' ? 'var(--color-success)' : 'var(--color-danger)',
              border: `1px solid ${saveMsg.type === 'ok' ? '#86EFAC' : '#FECACA'}`,
            }}>{saveMsg.text}</p>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={isPending}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>
              {isPending ? 'Salvando…' : 'Salvar configurações'}
            </button>
          </div>
        </form>

        {/* Audit Logs */}
        <div className="rounded-2xl p-6"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>
            Últimos 20 eventos de auditoria
          </h2>

          {auditLogs.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-light)' }}>Nenhum evento registrado ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ color: 'var(--color-foreground)', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-medium)', fontWeight: 600 }}>
                    <th className="text-left px-3 py-2">Evento</th>
                    <th className="text-left px-3 py-2">Usuário</th>
                    <th className="text-left px-3 py-2">Data/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="px-3 py-2">{eventLabel[log.event_type] ?? log.event_type}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--color-medium)' }}>{log.user_email ?? '—'}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--color-light)' }}>
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium" style={{ color: 'var(--color-medium)' }}>{label}</label>
      {children}
      {hint && <p className="text-xs" style={{ color: 'var(--color-light)' }}>{hint}</p>}
    </div>
  )
}
