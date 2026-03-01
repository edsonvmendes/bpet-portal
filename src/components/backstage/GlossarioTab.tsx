'use client'

import { useState } from 'react'

interface GlossaryItem {
  categoria: string
  icon: string
  medida: string
  oQueE: string
  comoCalculada: string
  referenciasSaudaveis: string
}

const GLOSSARIO: GlossaryItem[] = [
  // ── Transações ──
  { categoria: 'Transações', icon: '🔷', medida: '% por Canal',
    oQueE: 'Share de transações por canal de venda (App, Web, Parceiro)',
    comoCalculada: 'Qt Válidas por Canal ÷ Qt Válidas Total × 100',
    referenciasSaudaveis: 'Diversificação saudável entre canais' },
  { categoria: 'Transações', icon: '🔷', medida: '% por Tipo Pagamento',
    oQueE: 'Share de transações por forma de pagamento (PIX, Boleto, Cartão)',
    comoCalculada: 'Qt Válidas por Tipo ÷ Qt Válidas Total × 100',
    referenciasSaudaveis: 'PIX > 50% indica adoção digital' },
  { categoria: 'Transações', icon: '🔷', medida: 'Qt Transações',
    oQueE: 'Total de transações registradas, incluindo estornos',
    comoCalculada: 'Contagem de fato_transacoes',
    referenciasSaudaveis: 'Volume crescente mês a mês' },
  { categoria: 'Transações', icon: '🔷', medida: 'Qt Transações Válidas',
    oQueE: 'Transações sem estorno. Base confiável para cálculos financeiros',
    comoCalculada: 'Contagem onde fl_estorno = false',
    referenciasSaudaveis: 'Próxima a Qt Transações total (estornos < 5%)' },

  // ── KPIs Estratégicos ──
  { categoria: 'KPIs Estratégicos', icon: '📊', medida: 'ARR',
    oQueE: 'Projeção anual da receita recorrente (MRR × 12). Usado em valuation',
    comoCalculada: 'MRR × 12',
    referenciasSaudaveis: 'Crescimento > 100% YoY em early stage' },
  { categoria: 'KPIs Estratégicos', icon: '📊', medida: 'Breakeven (Tutores)',
    oQueE: 'Número mínimo de tutores pagantes para cobrir todos os custos operacionais',
    comoCalculada: 'Custo Total Mensal ÷ Ticket Médio',
    referenciasSaudaveis: 'Quanto menor, melhor. Meta atual: 41.000 tutores' },
  { categoria: 'KPIs Estratégicos', icon: '📊', medida: 'CAC',
    oQueE: 'Custo de Aquisição de Cliente — quanto custa trazer um novo tutor pagante',
    comoCalculada: 'Investimento Mkt ÷ Novos Tutores no período',
    referenciasSaudaveis: 'CAC < 1/3 do LTV para modelo sustentável' },
  { categoria: 'KPIs Estratégicos', icon: '📊', medida: 'LTV',
    oQueE: 'Lifetime Value — receita total esperada durante toda a relação com o tutor',
    comoCalculada: 'Ticket Médio ÷ Churn Rate Mensal',
    referenciasSaudaveis: 'LTV > 3× CAC' },
  { categoria: 'KPIs Estratégicos', icon: '📊', medida: 'LTV/CAC Ratio',
    oQueE: 'Eficiência da aquisição — quantas vezes o LTV supera o CAC',
    comoCalculada: 'LTV ÷ CAC',
    referenciasSaudaveis: 'Acima de 3× = saudável / Acima de 5× = excelente' },
  { categoria: 'KPIs Estratégicos', icon: '📊', medida: 'MRR',
    oQueE: 'Monthly Recurring Revenue — receita previsível gerada pelas assinaturas ativas',
    comoCalculada: 'SOMA de vl_mrr em fato_assinaturas do período',
    referenciasSaudaveis: 'Crescimento constante mês a mês' },
  { categoria: 'KPIs Estratégicos', icon: '📊', medida: 'Payback (Meses)',
    oQueE: 'Tempo para recuperar o investimento feito na aquisição de um cliente',
    comoCalculada: 'CAC ÷ (MRR ÷ Tutores Pagantes)',
    referenciasSaudaveis: '< 12 meses (ideal) / < 18 meses (aceitável)' },

  // ── Financeiro ──
  { categoria: 'Financeiro', icon: '🔥', medida: 'Custo Total',
    oQueE: 'Soma de todos os custos operacionais do período (OPEX)',
    comoCalculada: 'SOMA de vl_custo em fato_financeiro',
    referenciasSaudaveis: 'Crescimento inferior à Receita Bruta' },
  { categoria: 'Financeiro', icon: '🔥', medida: 'Investimento Marketing',
    oQueE: 'Total investido em marketing e aquisição de clientes no período',
    comoCalculada: 'SOMA de vl_investimento_mkt em fato_financeiro',
    referenciasSaudaveis: 'Monitorar junto ao CAC resultante' },
  { categoria: 'Financeiro', icon: '🔥', medida: 'Lucro Operacional',
    oQueE: 'Quanto sobrou após pagar todos os custos operacionais do período',
    comoCalculada: 'Receita Bruta − Custo Total',
    referenciasSaudaveis: 'Positivo e crescente. Margem > 20%' },
  { categoria: 'Financeiro', icon: '🔥', medida: 'Margem Operacional %',
    oQueE: 'Percentual do faturamento que se converte em lucro operacional',
    comoCalculada: 'Lucro Operacional ÷ Receita Bruta × 100',
    referenciasSaudaveis: '> 20% é saudável para SaaS' },
  { categoria: 'Financeiro', icon: '🔥', medida: 'Receita Bruta',
    oQueE: 'Total faturado no período, antes de qualquer dedução ou desconto',
    comoCalculada: 'SOMA de vl_receita_bruta em fato_financeiro',
    referenciasSaudaveis: 'Crescimento > 5% a.m. em fase de tração' },
  { categoria: 'Financeiro', icon: '🔥', medida: 'Ticket Médio',
    oQueE: 'Receita média gerada por cada tutor pagante no período',
    comoCalculada: 'MRR ÷ Tutores Pagantes',
    referenciasSaudaveis: 'Crescimento indica upsell / expansão de plano' },

  // ── Usuários ──
  { categoria: 'Usuários', icon: '👥', medida: 'Churn',
    oQueE: 'Tutores que cancelaram ou não renovaram a assinatura no período',
    comoCalculada: 'Contagem de fato_assinaturas onde fl_churn = true',
    referenciasSaudaveis: 'Churn < Novos Tutores (base crescendo)' },
  { categoria: 'Usuários', icon: '👥', medida: 'Churn Rate %',
    oQueE: 'Percentual da base pagante que saiu no período',
    comoCalculada: 'Churn ÷ Tutores Pagantes × 100',
    referenciasSaudaveis: '< 2% ao mês (excelente) / < 5% (aceitável)' },
  { categoria: 'Usuários', icon: '👥', medida: 'Novos Tutores',
    oQueE: 'Assinaturas novas no período, excluindo renovações de planos já existentes',
    comoCalculada: 'Contagem onde fl_renovacao = false AND fl_churn = false',
    referenciasSaudaveis: 'Maior que Churn para crescimento líquido positivo' },
  { categoria: 'Usuários', icon: '👥', medida: 'Tutores Pagantes',
    oQueE: 'Total de tutores com assinatura ativa e paga no período (sem churn)',
    comoCalculada: 'Contagem de dim_tutor onde sk_status ≠ CHURN e fl_ativo = true',
    referenciasSaudaveis: 'Crescimento constante mês a mês' },
]

const CATEGORIAS = ['Todos', ...Array.from(new Set(GLOSSARIO.map(g => g.categoria)))]

const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  'Transações':       { bg: 'color-mix(in srgb, #6366f1 12%, white)', color: '#6366f1' },
  'KPIs Estratégicos':{ bg: 'color-mix(in srgb, var(--color-primary) 12%, white)', color: 'var(--color-primary)' },
  'Financeiro':       { bg: 'color-mix(in srgb, #F5A623 12%, white)', color: '#c47d10' },
  'Usuários':         { bg: 'color-mix(in srgb, #4CAF50 12%, white)', color: '#2d7a31' },
}

export default function GlossarioTab() {
  const [catFilter, setCatFilter] = useState('Todos')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const items = GLOSSARIO.filter(g => {
    if (catFilter !== 'Todos' && g.categoria !== catFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return g.medida.toLowerCase().includes(q) || g.oQueE.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="p-5 flex flex-col gap-4">

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar métrica..."
          className="px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-dark)', width: 220 }}
        />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIAS.map(c => (
            <button key={c}
              onClick={() => setCatFilter(c)}
              className="px-3 py-1 rounded-full text-xs font-medium transition"
              style={{
                backgroundColor: catFilter === c ? 'var(--color-dark)' : 'var(--color-surface)',
                color:           catFilter === c ? '#fff' : 'var(--color-medium)',
                border: `1px solid ${catFilter === c ? 'var(--color-dark)' : 'var(--color-border)'}`,
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full text-xs" style={{ backgroundColor: 'var(--color-surface)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-dark)', color: '#fff' }}>
              {['Categoria','Medida','O que é?','Como é calculada?','Referência Saudável'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap"
                  style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((g, i) => {
              const catStyle = CAT_COLORS[g.categoria] ?? { bg: '#f5f5f5', color: '#333' }
              const isOpen = expanded === `${g.categoria}-${g.medida}`
              return (
                <tr
                  key={i}
                  onClick={() => setExpanded(isOpen ? null : `${g.categoria}-${g.medida}`)}
                  className="cursor-pointer transition-colors"
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: isOpen
                      ? 'color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))'
                      : i % 2 === 0 ? 'var(--color-surface)' : 'color-mix(in srgb, var(--color-bg) 40%, var(--color-surface))',
                  }}
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{ backgroundColor: catStyle.bg, color: catStyle.color }}>
                      <span>{g.icon}</span> {g.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
                    {g.medida}
                  </td>
                  <td className="px-4 py-3 max-w-xs" style={{ color: 'var(--color-medium)' }}>
                    {isOpen ? g.oQueE : g.oQueE.slice(0, 60) + (g.oQueE.length > 60 ? '…' : '')}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px]" style={{ color: 'var(--color-medium)' }}>
                    {g.comoCalculada}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[11px]"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--color-success) 10%, white)', color: 'var(--color-success)' }}>
                      {g.referenciasSaudaveis}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--color-light)' }}>
            Nenhuma métrica encontrada
          </div>
        )}
      </div>
    </div>
  )
}
