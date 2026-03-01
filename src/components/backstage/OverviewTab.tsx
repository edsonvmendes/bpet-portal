'use client'

import dynamic from 'next/dynamic'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Sector,
  type PieLabelRenderProps,
} from 'recharts'
import { useState } from 'react'

const BrasilMap = dynamic(() => import('./BrasilMap'), { ssr: false })

const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const ANO_COLORS: Record<string, string> = {
  '2024': '#4CAF50',
  '2025': '#F5A623',
  '2026': '#2BBFB3',
}

interface KpiRow {
  sk_data: number
  qt_tutores_pagantes: number
  qt_novos_tutores_mes: number
  qt_churn_mes: number
  vl_receita_total: number
  vl_custo_total: number
  vl_lucro_operacional: number
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

interface TipoPagamento {
  tipo: string
  count: number
  pct: number
}

interface StateData { estado: string; count: number; regiao: string }

interface Props {
  kpis: KpiRow[]
  tiposPagamento: TipoPagamento[]
  tutoresPorEstado: StateData[]
  regioes: { regiao: string; count: number }[]
  anoFilter: string
}

// ── Helpers ──────────────────────────────────────────────────
function brl(v?: number | null) {
  if (v == null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}
function brlK(v?: number | null) {
  if (v == null) return '—'
  if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)} Mi`
  if (Math.abs(v) >= 1_000)     return `R$ ${(v / 1_000).toFixed(0)} Mil`
  return `R$ ${v.toFixed(0)}`
}
function fmtNum(v?: number | null) {
  return v?.toLocaleString('pt-BR') ?? '—'
}

function getAno(sk: number) { return Math.floor(sk / 10000) }
function getMes(sk: number) { return Math.floor((sk % 10000) / 100) - 1 } // 0-indexed

// Agrupa dados para bar chart por mês × ano
function buildBarData(kpis: KpiRow[], field: string, anoFilter: string) {
  const result = MESES.map(mes => ({ mes } as Record<string, unknown>))
  const anos = new Set<string>()

  kpis.forEach(k => {
    const ano = String(getAno(k.sk_data))
    if (anoFilter !== 'Todos' && ano !== anoFilter) return
    anos.add(ano)
    const mesIdx = getMes(k.sk_data)
    if (mesIdx >= 0 && mesIdx < 12) {
      result[mesIdx][ano] = Number(k[field]) || 0
    }
  })

  return { data: result, anos: Array.from(anos).sort() }
}

// Tooltip personalizado para gráficos
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg shadow-lg p-3 text-xs"
      style={{ backgroundColor: '#1A2E2E', color: '#fff', border: 'none' }}>
      <p className="font-semibold mb-1" style={{ color: '#2BBFB3' }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.dataKey}: {brlK(p.value)}
        </p>
      ))}
    </div>
  )
}

// Donut label customizado
function renderCustomLabel(props: PieLabelRenderProps) {
  const cx          = Number(props.cx          ?? 0)
  const cy          = Number(props.cy          ?? 0)
  const midAngle    = Number(props.midAngle    ?? 0)
  const innerRadius = Number(props.innerRadius ?? 0)
  const outerRadius = Number(props.outerRadius ?? 0)
  const count       = (props as PieLabelRenderProps & { count?: number }).count ?? 0

  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {count}
    </text>
  )
}

// ── KPI Card ──────────────────────────────────────────────────
function KpiCard({
  label, value, sub, hint, accent = false
}: {
  label: string; value: string; sub?: string; hint?: string; accent?: boolean
}) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-1 relative"
      style={{
        backgroundColor: accent ? 'var(--color-primary)' : 'var(--color-surface)',
        border: `1px solid ${accent ? 'transparent' : 'var(--color-border)'}`,
        color: accent ? '#fff' : 'var(--color-dark)',
      }}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: accent ? 'rgba(255,255,255,0.75)' : 'var(--color-light)' }}>
          {label}
        </p>
        {hint && (
          <div className="group relative cursor-help">
            <span className="text-xs rounded-full w-4 h-4 flex items-center justify-center"
              style={{ border: `1px solid ${accent ? 'rgba(255,255,255,0.4)' : 'var(--color-border)'}`,
                color: accent ? 'rgba(255,255,255,0.6)' : 'var(--color-light)' }}>?</span>
            <div className="absolute right-0 top-5 w-52 z-50 hidden group-hover:block rounded-lg p-3 text-xs shadow-xl"
              style={{ backgroundColor: '#1A2E2E', color: '#D4E4E5' }}>
              {hint}
            </div>
          </div>
        )}
      </div>
      <p className="text-2xl font-extrabold leading-tight">{value}</p>
      {sub && <p className="text-[11px] font-medium" style={{ color: accent ? 'rgba(255,255,255,0.7)' : 'var(--color-medium)' }}>{sub}</p>}
    </div>
  )
}

// ── Seção título ──────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-1.5 rounded-t-lg mb-0 text-xs font-bold tracking-widest uppercase"
      style={{ backgroundColor: 'var(--color-dark)', color: '#fff', letterSpacing: '0.12em' }}>
      {children}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────
export default function OverviewTab({ kpis, tiposPagamento, tutoresPorEstado, regioes, anoFilter }: Props) {
  const [activePieIdx, setActivePieIdx] = useState<number | null>(null)

  // Último mês com dados
  const latest = kpis.reduce<KpiRow | null>((acc, k) => {
    if (!acc || k.sk_data > acc.sk_data) return k
    return acc
  }, null)

  const { data: custoData, anos } = buildBarData(kpis, 'vl_custo_total', anoFilter)
  const { data: lucroData }       = buildBarData(kpis, 'vl_lucro_operacional', anoFilter)

  // Anos presentes no filtro atual
  const anosAtivos = anoFilter === 'Todos' ? anos : [anoFilter]

  // Donut colors
  const PIE_COLORS = ['#2BBFB3', '#F5A623', '#4CAF50', '#6366f1', '#F05252']

  return (
    <div className="flex gap-5 p-5" style={{ minHeight: 'calc(100vh - 120px)' }}>

      {/* ── Coluna esquerda ── */}
      <div className="flex flex-col gap-5" style={{ flex: '1 1 0', minWidth: 0 }}>

        {/* Crescimento — barras */}
        <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--color-border)' }}>
          <SectionTitle>Crescimento</SectionTitle>
          <div className="flex gap-4 p-4" style={{ backgroundColor: 'var(--color-surface)' }}>

            {/* Custo */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-medium)' }}>Custo</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={custoData} barCategoryGap="35%" barGap={2}
                  margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 10, fill: 'var(--color-light)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--color-light)' }} axisLine={false} tickLine={false}
                    tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                  {anosAtivos.map(ano => (
                    <Bar key={ano} dataKey={ano} fill={ANO_COLORS[ano] ?? '#2BBFB3'} radius={[3, 3, 0, 0]} maxBarSize={16} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Lucro Operacional */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-medium)' }}>Lucro Operacional Mensal</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={lucroData} barCategoryGap="35%" barGap={2}
                  margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 10, fill: 'var(--color-light)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--color-light)' }} axisLine={false} tickLine={false}
                    tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                  {anosAtivos.map(ano => (
                    <Bar key={ano} dataKey={ano} fill={ANO_COLORS[ano] ?? '#2BBFB3'} radius={[3, 3, 0, 0]} maxBarSize={16} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Donut + Mapa */}
        <div className="flex gap-5" style={{ flex: 1 }}>

          {/* Tipos de Transações */}
          <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--color-border)', flex: '0 0 240px' }}>
            <SectionTitle>Tipos de Transações</SectionTitle>
            <div className="p-4 flex flex-col items-center gap-1" style={{ backgroundColor: 'var(--color-surface)' }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={tiposPagamento}
                    cx="50%" cy="50%"
                    innerRadius={42} outerRadius={70}
                    paddingAngle={3}
                    dataKey="count"
                    labelLine={false}
                    label={renderCustomLabel}
                    onMouseEnter={(_, idx) => setActivePieIdx(idx)}
                    onMouseLeave={() => setActivePieIdx(null)}
                  >
                    {tiposPagamento.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                        opacity={activePieIdx === null || activePieIdx === i ? 1 : 0.5}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.[0] ? (
                        <div className="rounded-lg p-2 text-xs shadow-lg"
                          style={{ backgroundColor: '#1A2E2E', color: '#fff' }}>
                          <p className="font-semibold">{payload[0].name}</p>
                          <p>{fmtNum(payload[0].value as number)} ({(payload[0].payload as TipoPagamento).pct}%)</p>
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legenda */}
              <div className="w-full flex flex-col gap-1.5 mt-1">
                {tiposPagamento.map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="truncate max-w-[130px]" style={{ color: 'var(--color-dark)' }} title={t.tipo}>
                        {t.tipo}
                      </span>
                    </div>
                    <span className="font-semibold" style={{ color: 'var(--color-medium)' }}>
                      {t.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Distribuição — Mapa */}
          <div className="rounded-xl overflow-hidden shadow-sm flex flex-col" style={{ border: '1px solid var(--color-border)', flex: 1 }}>
            <SectionTitle>Distribuição</SectionTitle>
            <div className="flex gap-4 p-4 flex-1" style={{ backgroundColor: 'var(--color-surface)' }}>
              <div style={{ flex: 1, minHeight: 260 }}>
                <BrasilMap data={tutoresPorEstado} height={260} />
              </div>
              {/* Ranking por região */}
              <div className="flex flex-col gap-2" style={{ minWidth: 130 }}>
                <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-light)' }}>Por região</p>
                {regioes.map((r, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span style={{ color: 'var(--color-dark)' }}>{r.regiao}</span>
                      <span className="font-semibold" style={{ color: 'var(--color-medium)' }}>{fmtNum(r.count)}</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${(r.count / (regioes[0]?.count || 1)) * 100}%`, backgroundColor: 'var(--color-primary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Coluna direita — KPI cards ── */}
      <div className="flex flex-col gap-4" style={{ width: 220, flexShrink: 0 }}>

        <KpiCard
          label="Breakeven"
          value={fmtNum(latest?.qt_breakeven_meta) === '—' ? '41 Mil' : fmtNum(latest?.qt_breakeven_meta)}
          sub={`${fmtNum(latest?.qt_tutores_pagantes)} tutores pagantes`}
          hint="Número mínimo de tutores pagantes para cobrir todos os custos operacionais."
          accent
        />

        <KpiCard
          label="Payback"
          value={`${latest?.vl_payback_meses ?? 18} meses`}
          sub="Tempo para recuperar o CAC"
          hint="Quantos meses leva para recuperar o custo de aquisição de um cliente (CAC ÷ Ticket Médio)."
        />

        <KpiCard
          label="Ticket Médio"
          value={brl(latest?.vl_ticket_medio)}
          sub="Receita média por usuário"
          hint="MRR ÷ Tutores Pagantes. Indica quanto cada tutor paga em média por mês."
        />

        <KpiCard
          label="MRR"
          value={brlK(latest?.vl_mrr)}
          sub="Receita recorrente mensal"
          hint="Monthly Recurring Revenue — soma do valor mensal de todas as assinaturas ativas."
        />

        <KpiCard
          label="Churn Rate"
          value={`${latest?.vl_churn_rate_pct?.toFixed(1) ?? '—'}%`}
          sub={`${fmtNum(latest?.qt_churn_mes)} churns no mês`}
          hint="Percentual de tutores pagantes que cancelaram no período. Meta: < 3% ao mês."
        />

        <KpiCard
          label="LTV / CAC"
          value={latest?.vl_ltv_cac_ratio ? `${latest.vl_ltv_cac_ratio.toFixed(1)}×` : '—'}
          sub="Meta: acima de 3×"
          hint="Lifetime Value dividido pelo Custo de Aquisição. Acima de 3× indica negócio saudável."
        />

      </div>
    </div>
  )
}
