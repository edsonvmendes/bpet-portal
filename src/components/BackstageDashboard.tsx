'use client'

import { useEffect, useState } from 'react'
import OverviewTab from './backstage/OverviewTab'
import FinanceiroTab from './backstage/FinanceiroTab'
import GlossarioTab from './backstage/GlossarioTab'

type DashTab = 'overview' | 'financeiro' | 'glossario'

interface KpiRow {
  sk_data: number
  qt_tutores_pagantes: number
  qt_novos_tutores_mes: number
  qt_churn_mes: number
  vl_receita_total: number
  vl_custo_total: number
  vl_lucro_operacional: number
  vl_margem_operacional_pct: number
  vl_mrr: number
  vl_arr: number
  vl_ticket_medio: number
  vl_cac: number
  vl_ltv: number
  vl_ltv_cac_ratio: number
  vl_churn_rate_pct: number
  qt_breakeven_meta: number
  pct_atingimento_breakeven: number
  vl_payback_meses: number
  [key: string]: unknown
}

interface TipoPagamento { tipo: string; count: number; pct: number }
interface StateData { estado: string; count: number; regiao: string }

const TABS: { id: DashTab; label: string }[] = [
  { id: 'overview',   label: 'Overview'   },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'glossario',  label: 'Glossário'  },
]

const ANOS = ['Todos', '2024', '2025', '2026']

function getAno(sk: number) { return String(Math.floor(sk / 10000)) }

export default function BackstageDashboard() {
  const [activeTab, setActiveTab]   = useState<DashTab>('overview')
  const [anoFilter, setAnoFilter]   = useState('Todos')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)

  const [kpis, setKpis]                     = useState<KpiRow[]>([])
  const [tiposPagamento, setTiposPagamento] = useState<TipoPagamento[]>([])
  const [tutoresPorEstado, setTutoresPorEstado] = useState<StateData[]>([])
  const [regioes, setRegioes]               = useState<{ regiao: string; count: number }[]>([])

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const [kpisRes, chartsRes] = await Promise.all([
        fetch('/api/backstage/kpis'),
        fetch('/api/backstage/charts'),
      ])
      if (!kpisRes.ok || !chartsRes.ok) throw new Error('Erro ao buscar dados')

      const kpisJson   = await kpisRes.json()
      const chartsJson = await chartsRes.json()

      setKpis(kpisJson.data ?? [])
      setTiposPagamento(chartsJson.tipos_pagamento ?? [])
      setTutoresPorEstado(chartsJson.tutores_por_estado ?? [])
      setRegioes(chartsJson.regioes ?? [])
      setLastRefresh(new Date().toLocaleTimeString('pt-BR'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Anos disponíveis nos dados
  const anosDisponiveis = Array.from(new Set(kpis.map(k => getAno(k.sk_data)))).sort()
  const anosMenu = ['Todos', ...anosDisponiveis]

  // ── Latest KPI values for header stats ──────────────────────
  const latest = kpis.reduce<KpiRow | null>((acc, k) => {
    if (!acc || k.sk_data > acc.sk_data) return k
    return acc
  }, null)

  const filteredKpis = kpis.filter(k =>
    anoFilter === 'Todos' || getAno(k.sk_data) === anoFilter
  )

  const totalTutores  = latest?.qt_tutores_pagantes ?? 0
  const totalMrr      = latest?.vl_mrr ?? 0
  const totalChurn    = latest?.vl_churn_rate_pct ?? 0

  function fmtMrr(v: number) {
    if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}Mi`
    if (v >= 1_000)     return `R$ ${(v / 1_000).toFixed(0)}Mil`
    return `R$ ${v.toFixed(0)}`
  }

  return (
    <div className="flex flex-col" style={{ backgroundColor: 'var(--color-bg)', minHeight: 'calc(100vh - 57px)' }}>

      {/* ── Sub-header: título + filtros ─────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-3 gap-4 flex-wrap"
        style={{
          backgroundColor: 'var(--color-dark)',
          borderBottom: '2px solid var(--color-primary)',
        }}
      >
        {/* Título + quick stats */}
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>
              B3.Pet Analytics
            </p>
            <h1 className="text-sm font-extrabold tracking-widest uppercase" style={{ color: '#fff' }}>
              Monitorador de Desempenho
            </h1>
          </div>
          {!loading && !error && (
            <div className="hidden md:flex items-center gap-5">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>Tutores Pagantes</span>
                <span className="text-base font-bold" style={{ color: '#2BBFB3' }}>
                  {totalTutores.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="w-px h-8" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>MRR</span>
                <span className="text-base font-bold" style={{ color: '#F5A623' }}>{fmtMrr(totalMrr)}</span>
              </div>
              <div className="w-px h-8" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>Churn Rate</span>
                <span className="text-base font-bold" style={{ color: totalChurn > 5 ? '#F05252' : '#17C97E' }}>
                  {totalChurn.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Controles: Ano + Refresh */}
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="hidden md:block text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Atualizado {lastRefresh}
            </span>
          )}
          <select
            value={anoFilter}
            onChange={e => setAnoFilter(e.target.value)}
            className="text-xs font-semibold rounded-lg px-3 py-1.5 outline-none cursor-pointer"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            {anosMenu.map(a => <option key={a} value={a} style={{ backgroundColor: '#1A2E2E' }}>{a}</option>)}
          </select>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80 disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
          >
            {loading ? (
              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
              </svg>
            ) : '↻'} Refresh
          </button>
        </div>
      </div>

      {/* ── Tab nav ──────────────────────────────────────────── */}
      <div
        className="flex items-center px-6 gap-0"
        style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
      >
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="px-5 py-3 text-xs font-semibold transition relative"
            style={{
              color: activeTab === t.id ? 'var(--color-primary)' : 'var(--color-light)',
              borderBottom: activeTab === t.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none"
            style={{ color: 'var(--color-primary)' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--color-light)' }}>Carregando dados...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <p className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>⚠ {error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && kpis.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <p className="text-2xl">📭</p>
          <p className="text-sm font-medium" style={{ color: 'var(--color-medium)' }}>Nenhum dado encontrado</p>
          <p className="text-xs" style={{ color: 'var(--color-light)' }}>
            Faça o upload de um arquivo CSV na aba Upload para começar.
          </p>
        </div>
      )}

      {!loading && !error && kpis.length > 0 && (
        <>
          {activeTab === 'overview'   && (
            <OverviewTab
              kpis={filteredKpis}
              tiposPagamento={tiposPagamento}
              tutoresPorEstado={tutoresPorEstado}
              regioes={regioes}
              anoFilter={anoFilter}
            />
          )}
          {activeTab === 'financeiro' && (
            <FinanceiroTab kpis={filteredKpis} anoFilter={anoFilter} />
          )}
          {activeTab === 'glossario'  && <GlossarioTab />}
        </>
      )}
    </div>
  )
}
