'use client'

import { useState, useRef } from 'react'

// ── Tipos ─────────────────────────────────────────────────────
interface SheetResult {
  total: number
  inserted: number
  errors: string[]
}
interface ImportResult {
  ok: boolean
  summary: { total: number; inserted: number }
  sheets: Record<string, SheetResult>
  refresh_error: string | null
  imported_at: string
}
type StepStatus = 'pending' | 'processing' | 'done' | 'error' | 'skipped'
interface StepState {
  table: string
  status: StepStatus
  inserted?: number
  total?: number
  processed?: number  // progresso dentro da tabela (chunks)
  errors?: string[]
}

// ── Constantes ────────────────────────────────────────────────
const IMPORT_ORDER = [
  'dim_tempo', 'dim_tipo_pagamento', 'dim_canal', 'dim_plano',
  'dim_cat_custo', 'dim_status_usuario', 'dim_tutor',
  'fato_transacoes', 'fato_assinaturas', 'fato_financeiro',
  'agg_kpi_mensal', 'config_modelo',
]
const ALL_STEPS = [...IMPORT_ORDER, 'refresh_kpis']

const STEP_LABELS: Record<string, string> = {
  dim_tempo:          'Calendário',
  dim_tipo_pagamento: 'Tipos de Pagamento',
  dim_canal:          'Canais de Aquisição',
  dim_plano:          'Planos',
  dim_cat_custo:      'Categorias de Custo',
  dim_status_usuario: 'Status de Usuário',
  dim_tutor:          'Tutores',
  fato_transacoes:    'Transações',
  fato_assinaturas:   'Assinaturas',
  fato_financeiro:    'Financeiro',
  agg_kpi_mensal:     'KPIs Mensais',
  config_modelo:      'Configurações',
  refresh_kpis:       'Recalcular KPIs',
}

function fmtNum(n?: number) {
  return n?.toLocaleString('pt-BR') ?? '—'
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Componente ────────────────────────────────────────────────
export default function BackstageUpload() {
  const [file, setFile]           = useState<File | null>(null)
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState<ImportResult | null>(null)
  const [apiError, setApiError]   = useState<string | null>(null)
  const [steps, setSteps]         = useState<StepState[]>([])
  const [progress, setProgress]   = useState(0)  // 0–100
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function reset() {
    setResult(null)
    setApiError(null)
    setSteps([])
    setProgress(0)
    setRefreshMsg(null)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null)
    reset()
  }
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f?.name.match(/\.xlsx?$/i)) { setFile(f); reset() }
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    reset()

    // Inicializa lista de steps como "pending"
    setSteps(ALL_STEPS.map(t => ({ table: t, status: 'pending' })))

    try {
      const fd = new FormData()
      fd.append('file', file)

      const res = await fetch('/api/backstage/import', { method: 'POST', body: fd })

      // Erros de auth / arquivo retornam JSON (não stream)
      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => ({}))
        setApiError(json.error ?? `Erro ${res.status}`)
        setLoading(false)
        setSteps([])
        return
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      const TOTAL = ALL_STEPS.length

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })

        // Processa eventos SSE (separados por \n\n)
        const parts = buf.split('\n\n')
        buf = parts.pop() ?? ''

        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data: ')) continue
          let ev: Record<string, unknown>
          try { ev = JSON.parse(line.slice(6)) } catch { continue }

          if (ev.type === 'step_start') {
            const stepIdx = ALL_STEPS.indexOf(ev.table as string)
            setSteps(prev => prev.map(s =>
              s.table === ev.table ? { ...s, status: 'processing' } : s
            ))
            setProgress(Math.round((stepIdx / TOTAL) * 100))

          } else if (ev.type === 'chunk') {
            const stepIdx = ALL_STEPS.indexOf(ev.table as string)
            const fraction = (ev.processed as number) / (ev.total as number)
            setProgress(Math.round(((stepIdx + fraction) / TOTAL) * 100))
            setSteps(prev => prev.map(s =>
              s.table === ev.table
                ? { ...s, processed: ev.processed as number, total: ev.total as number }
                : s
            ))

          } else if (ev.type === 'step_done') {
            const errs = (ev.errors as string[]) ?? []
            setSteps(prev => prev.map(s =>
              s.table === ev.table
                ? {
                    ...s,
                    status: errs.length > 0 ? 'error' : ev.total === 0 ? 'skipped' : 'done',
                    inserted: ev.inserted as number,
                    total: ev.total as number,
                    processed: undefined,
                    errors: errs,
                  }
                : s
            ))
            setProgress(Math.round(((ev.step as number) / TOTAL) * 100))

          } else if (ev.type === 'done') {
            setResult(ev as unknown as ImportResult)
            setProgress(100)
            setLoading(false)
          }
        }
      }
    } catch (e) {
      setApiError((e as Error).message)
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    setRefreshMsg(null)
    try {
      const res = await fetch('/api/backstage/refresh', { method: 'POST' })
      const json = await res.json()
      setRefreshMsg(res.ok
        ? `KPIs recalculados em ${fmtDate(json.refreshed_at)}`
        : `Erro: ${json.error ?? res.status}`)
    } catch (e) {
      setRefreshMsg(`Erro: ${(e as Error).message}`)
    } finally {
      setRefreshing(false)
    }
  }

  const isError = (s: StepStatus) => s === 'error'
  const currentStepLabel = steps.find(s => s.status === 'processing')
    ? STEP_LABELS[steps.find(s => s.status === 'processing')!.table]
    : null

  return (
    <div className="flex flex-col">
      {/* Main */}
      <div className="max-w-2xl w-full mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Title */}
        <div>
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--color-dark)' }}>
            Importar Excel
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-medium)' }}>
            Selecione o arquivo <strong>BPet_ModeloDimensional.xlsx</strong>. Todas as abas serão
            importadas automaticamente na ordem correta e os KPIs recalculados.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => !loading && inputRef.current?.click()}
          className="rounded-xl border-2 border-dashed transition flex flex-col items-center justify-center gap-3 py-10 px-6 text-center select-none"
          style={{
            borderColor: file ? 'var(--color-primary)' : 'var(--color-border)',
            backgroundColor: file
              ? 'color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))'
              : 'var(--color-surface)',
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
          {file ? (
            <>
              <span className="text-3xl">📊</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-dark)' }}>{file.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-light)' }}>
                  {(file.size / 1024).toFixed(0)} KB{loading ? '' : ' — clique para trocar'}
                </p>
              </div>
            </>
          ) : (
            <>
              <span className="text-3xl">📂</span>
              <p className="text-sm" style={{ color: 'var(--color-medium)' }}>
                Arraste o arquivo aqui ou clique para selecionar
              </p>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <SpinnerIcon /> Importando...
              </span>
            ) : 'Importar Excel'}
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="px-5 py-3 rounded-xl font-semibold text-sm transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-medium)' }}
          >
            {refreshing ? <span className="flex items-center gap-2"><SpinnerIcon /> Calculando...</span> : '↻ Recalcular KPIs'}
          </button>
        </div>

        {refreshMsg && (
          <p className="text-sm" style={{ color: refreshMsg.startsWith('Erro') ? '#ef4444' : 'var(--color-primary)' }}>
            {refreshMsg}
          </p>
        )}

        {/* Erro de API (auth/arquivo) */}
        {apiError && (
          <div className="rounded-xl p-4 text-sm"
            style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
            <strong>Erro:</strong> {apiError}
          </div>
        )}

        {/* Progress + Steps */}
        {steps.length > 0 && (
          <div className="flex flex-col gap-4">

            {/* Barra de progresso */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-medium)' }}>
                <span>
                  {loading
                    ? currentStepLabel ? `Importando ${currentStepLabel}...` : 'Preparando...'
                    : result?.ok ? 'Importação concluída' : 'Importação com erros'}
                </span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: steps.some(s => isError(s.status)) ? '#f59e0b' : 'var(--color-primary)',
                  }}
                />
              </div>
            </div>

            {/* Lista de steps */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              {steps.map((s, idx) => {
                const isLast = idx === steps.length - 1
                const isRefresh = s.table === 'refresh_kpis'
                return (
                  <div
                    key={s.table}
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{
                      borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
                      backgroundColor: s.status === 'processing'
                        ? 'color-mix(in srgb, var(--color-primary) 4%, var(--color-surface))'
                        : 'var(--color-surface)',
                      opacity: s.status === 'pending' ? 0.38 : 1,
                      transition: 'opacity 0.2s, background-color 0.2s',
                    }}
                  >
                    {/* Ícone + nome */}
                    <div className="flex items-center gap-2.5">
                      <span className="w-4 text-center text-sm">
                        {s.status === 'pending'    && <span style={{ color: 'var(--color-border)' }}>○</span>}
                        {s.status === 'processing' && <SpinnerIcon />}
                        {s.status === 'done'       && <span style={{ color: 'var(--color-primary)' }}>✓</span>}
                        {s.status === 'skipped'    && <span style={{ color: 'var(--color-light)' }}>–</span>}
                        {s.status === 'error'      && <span style={{ color: '#ef4444' }}>✗</span>}
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: isError(s.status) ? '#b91c1c' : 'var(--color-dark)' }}
                      >
                        {STEP_LABELS[s.table] ?? s.table}
                      </span>
                    </div>

                    {/* Info direita */}
                    <span className="text-xs tabular-nums" style={{ color: 'var(--color-light)' }}>
                      {s.status === 'processing' && s.processed != null
                        ? `${fmtNum(s.processed)} / ${fmtNum(s.total)}`
                        : s.status === 'processing'
                        ? isRefresh ? 'calculando...' : 'processando...'
                        : s.status === 'done' && !isRefresh
                        ? `${fmtNum(s.inserted)} linhas`
                        : s.status === 'done' && isRefresh
                        ? 'OK'
                        : s.status === 'error'
                        ? `${s.errors?.[0]?.slice(0, 50) ?? 'erro'}`
                        : s.status === 'skipped'
                        ? 'sem dados'
                        : null}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Erros detalhados */}
            {steps.some(s => (s.errors?.length ?? 0) > 0) && (
              <details className="rounded-xl overflow-hidden" style={{ border: '1px solid #fecaca' }}>
                <summary
                  className="px-4 py-2.5 text-xs font-semibold cursor-pointer"
                  style={{ backgroundColor: '#fef2f2', color: '#b91c1c' }}
                >
                  Ver detalhes dos erros
                </summary>
                <div className="px-4 py-3 flex flex-col gap-3">
                  {steps.filter(s => (s.errors?.length ?? 0) > 0).map(s => (
                    <div key={s.table}>
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-dark)' }}>
                        {STEP_LABELS[s.table] ?? s.table}
                      </p>
                      {s.errors!.map((err, i) => (
                        <p key={i} className="text-xs font-mono" style={{ color: '#b91c1c' }}>• {err}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* Banner final */}
            {result && (
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: result.ok
                    ? 'color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))'
                    : '#fef2f2',
                  border: `1px solid ${result.ok ? 'var(--color-primary)' : '#fecaca'}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm"
                      style={{ color: result.ok ? 'var(--color-primary)' : '#b91c1c' }}>
                      {result.ok ? '✓ Importação concluída com sucesso' : '⚠ Importação concluída com erros'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-light)' }}>
                      {fmtNum(result.summary.inserted)} de {fmtNum(result.summary.total)} registros —{' '}
                      {fmtDate(result.imported_at)}
                    </p>
                  </div>
                  {result.refresh_error ? (
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#fef2f2', color: '#b91c1c' }}>
                      KPIs falharam
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, white)', color: 'var(--color-primary)' }}>
                      KPIs OK
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin h-3.5 w-3.5 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
