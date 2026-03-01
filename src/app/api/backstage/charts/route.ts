import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const svc = await createServiceClient()

  // ── Tipos de pagamento ────────────────────────────────────
  const [{ data: transacoes }, { data: tipos }] = await Promise.all([
    svc.from('fato_transacoes').select('sk_tipo_pagamento').eq('fl_estorno', false),
    svc.from('dim_tipo_pagamento').select('sk_tipo_pagamento, ds_tipo_pagamento, cd_tipo_pagamento'),
  ])

  const tipoCounts: Record<number, number> = {}
  transacoes?.forEach(t => {
    tipoCounts[t.sk_tipo_pagamento] = (tipoCounts[t.sk_tipo_pagamento] || 0) + 1
  })

  const tipoMap: Record<number, { ds: string; cd: string }> = {}
  tipos?.forEach(t => { tipoMap[t.sk_tipo_pagamento] = { ds: t.ds_tipo_pagamento, cd: t.cd_tipo_pagamento } })

  const totalTrans = Object.values(tipoCounts).reduce((a, b) => a + b, 0)
  const tipos_pagamento = Object.entries(tipoCounts).map(([sk, count]) => ({
    tipo: tipoMap[Number(sk)]?.ds ?? tipoMap[Number(sk)]?.cd ?? `Tipo ${sk}`,
    count,
    pct: totalTrans > 0 ? Math.round((count / totalTrans) * 1000) / 10 : 0,
  })).sort((a, b) => b.count - a.count)

  // ── Tutores por estado ────────────────────────────────────
  const { data: tutores } = await svc
    .from('dim_tutor')
    .select('estado, regiao')
    .eq('fl_ativo', true)

  const estadoCounts: Record<string, { count: number; regiao: string }> = {}
  tutores?.forEach(t => {
    const uf = t.estado?.trim()
    if (!uf) return
    if (!estadoCounts[uf]) estadoCounts[uf] = { count: 0, regiao: t.regiao ?? '' }
    estadoCounts[uf].count++
  })

  const tutores_por_estado = Object.entries(estadoCounts)
    .map(([estado, { count, regiao }]) => ({ estado, count, regiao }))
    .sort((a, b) => b.count - a.count)

  // Totais por região
  const regioes: Record<string, number> = {}
  tutores_por_estado.forEach(({ regiao, count }) => {
    const r = regiao || 'Não informado'
    regioes[r] = (regioes[r] || 0) + count
  })

  return NextResponse.json({
    tipos_pagamento,
    tutores_por_estado,
    regioes: Object.entries(regioes)
      .map(([regiao, count]) => ({ regiao, count }))
      .sort((a, b) => b.count - a.count),
    total_transacoes_validas: totalTrans,
    fetched_at: new Date().toISOString(),
  })
}
