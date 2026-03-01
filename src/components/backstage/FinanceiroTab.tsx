'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Line, ComposedChart, Legend,
} from 'recharts'

interface KpiRow {
  sk_data: number
  qt_novos_tutores_mes: number
  qt_churn_mes: number
  vl_receita_total: number
  vl_custo_total: number
  vl_lucro_operacional: number
  vl_margem_operacional_pct: number
  [key: string]: unknown
}

interface Props {
  kpis: KpiRow[]
  anoFilter: string
}

const MES_NOME = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const TRIMESTRE = ['Qtr1','Qtr1','Qtr1','Qtr2','Qtr2','Qtr2','Qtr3','Qtr3','Qtr3','Qtr4','Qtr4','Qtr4']

function getAno(sk: number)  { return Math.floor(sk / 10000) }
function getMesIdx(sk: number) { return Math.floor((sk % 10000) / 100) - 1 }

function brlFmt(v?: number | null) {
  if (v == null) return '—'
  if (Math.abs(v) >= 1_000_000) return `R$ ${(v/1_000_000).toFixed(2)} Mi`
  if (Math.abs(v) >= 1_000)     return `R$ ${(v/1_000).toFixed(0)} Mil`
  return `R$ ${v.toFixed(2)}`
}
function pctFmt(v?: number | null) {
  return v != null ? `${v.toFixed(1)}%` : '—'
}
function numFmt(v?: number | null) {
  return v?.toLocaleString('pt-BR') ?? '—'
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg p-3 shadow-xl text-xs" style={{ backgroundColor: '#1A2E2E', color: '#fff' }}>
      {payload.map((p, i) => (
        <p key={i} style={{ color: i === 0 ? '#2BBFB3' : '#F5A623' }}>
          {p.name}: {brlFmt(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function FinanceiroTab({ kpis, anoFilter }: Props) {
  const filtered = kpis.filter(k =>
    anoFilter === 'Todos' || String(getAno(k.sk_data)) === anoFilter
  )

  // Totais
  const totals = filtered.reduce((acc, k) => ({
    novos:   acc.novos   + (k.qt_novos_tutores_mes ?? 0),
    churn:   acc.churn   + (k.qt_churn_mes ?? 0),
    receita: acc.receita + (k.vl_receita_total ?? 0),
    custo:   acc.custo   + (k.vl_custo_total ?? 0),
    lucro:   acc.lucro   + (k.vl_lucro_operacional ?? 0),
  }), { novos: 0, churn: 0, receita: 0, custo: 0, lucro: 0 })

  // Dados para o area chart
  const chartData = filtered.map(k => ({
    label: `${MES_NOME[getMesIdx(k.sk_data)]}/${String(getAno(k.sk_data)).slice(2)}`,
    custo:  k.vl_custo_total ?? 0,
    receita: k.vl_receita_total ?? 0,
  }))

  return (
    <div className="p-5 flex flex-col gap-6">

      {/* Tabela */}
      <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--color-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ backgroundColor: 'var(--color-surface)' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-dark)', color: '#fff' }}>
                {['Ano','Trim.','Mês','Churn','Novos','Qt Trans.','Custo Total','Invest. Mkt','Lucro Op.','Margem %','Receita Bruta'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((k, i) => {
                const mesIdx = getMesIdx(k.sk_data)
                const ano    = getAno(k.sk_data)
                const isPositive = (k.vl_lucro_operacional ?? 0) >= 0
                return (
                  <tr
                    key={k.sk_data}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: i % 2 === 0 ? 'var(--color-surface)' : 'color-mix(in srgb, var(--color-bg) 40%, var(--color-surface))',
                    }}
                  >
                    <td className="px-3 py-2 font-medium" style={{ color: 'var(--color-dark)' }}>{ano}</td>
                    <td className="px-3 py-2" style={{ color: 'var(--color-medium)' }}>{TRIMESTRE[mesIdx]}</td>
                    <td className="px-3 py-2 font-medium" style={{ color: 'var(--color-dark)' }}>{MES_NOME[mesIdx]}</td>
                    <td className="px-3 py-2 text-right"
                      style={{ color: (k.qt_churn_mes ?? 0) > 0 ? 'var(--color-danger)' : 'var(--color-medium)' }}>
                      {numFmt(k.qt_churn_mes)}
                    </td>
                    <td className="px-3 py-2 text-right"
                      style={{ color: (k.qt_novos_tutores_mes ?? 0) > 0 ? 'var(--color-success)' : 'var(--color-medium)' }}>
                      {numFmt(k.qt_novos_tutores_mes)}
                    </td>
                    <td className="px-3 py-2 text-right" style={{ color: 'var(--color-medium)' }}>
                      {numFmt(k['qt_transacoes'] as number)}
                    </td>
                    <td className="px-3 py-2 text-right" style={{ color: 'var(--color-dark)' }}>{brlFmt(k.vl_custo_total)}</td>
                    <td className="px-3 py-2 text-right" style={{ color: 'var(--color-dark)' }}>{brlFmt(k['vl_investimento_mkt'] as number)}</td>
                    <td className="px-3 py-2 text-right font-semibold"
                      style={{ color: isPositive ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {brlFmt(k.vl_lucro_operacional)}
                    </td>
                    <td className="px-3 py-2 text-right"
                      style={{ color: (k.vl_margem_operacional_pct ?? 0) >= 20 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {pctFmt(k.vl_margem_operacional_pct)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium" style={{ color: 'var(--color-dark)' }}>{brlFmt(k.vl_receita_total)}</td>
                  </tr>
                )
              })}
            </tbody>
            {/* Total */}
            <tfoot>
              <tr style={{ backgroundColor: 'var(--color-dark)', color: '#fff', fontWeight: 700 }}>
                <td className="px-3 py-2.5" colSpan={3}>Total</td>
                <td className="px-3 py-2.5 text-right">{numFmt(totals.churn)}</td>
                <td className="px-3 py-2.5 text-right">{numFmt(totals.novos)}</td>
                <td className="px-3 py-2.5 text-right">—</td>
                <td className="px-3 py-2.5 text-right">{brlFmt(totals.custo)}</td>
                <td className="px-3 py-2.5 text-right">—</td>
                <td className="px-3 py-2.5 text-right"
                  style={{ color: totals.lucro >= 0 ? '#4CAF50' : '#F05252' }}>
                  {brlFmt(totals.lucro)}
                </td>
                <td className="px-3 py-2.5 text-right">
                  {totals.receita > 0 ? `${((totals.lucro / totals.receita) * 100).toFixed(1)}%` : '—'}
                </td>
                <td className="px-3 py-2.5 text-right">{brlFmt(totals.receita)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Área chart Custo vs Receita */}
      <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--color-border)' }}>
        <div className="px-3 py-1.5 text-xs font-bold tracking-widest uppercase"
          style={{ backgroundColor: 'var(--color-dark)', color: '#fff' }}>
          Custo × Receita
        </div>
        <div className="p-4" style={{ backgroundColor: 'var(--color-surface)' }}>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCusto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F5A623" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F5A623" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2BBFB3" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2BBFB3" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-light)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-light)' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={0} stroke="var(--color-border)" />
              <Area type="monotone" dataKey="custo"   name="Custo"   stroke="#F5A623" strokeWidth={2} fill="url(#gradCusto)"   dot={false} />
              <Area type="monotone" dataKey="receita" name="Receita" stroke="#2BBFB3" strokeWidth={2} fill="url(#gradReceita)" dot={false} />
              <Line type="monotone" dataKey="custo"   stroke="#F5A623" strokeWidth={2} dot={false} legendType="none" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
