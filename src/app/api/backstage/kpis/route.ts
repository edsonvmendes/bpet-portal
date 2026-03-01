import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// agg_kpi_mensal usa sk_data no formato YYYYMMDD (primeiro dia do mês)
// ex: setembro/2024 = 20240901
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ano = searchParams.get('ano')   // ex: "2025"
  const mes = searchParams.get('mes')   // ex: "9"

  const svc = await createServiceClient()

  let query = svc
    .from('agg_kpi_mensal')
    .select('*')
    .order('sk_data', { ascending: true })

  // Filtro por ano: sk_data entre YYYYMMDD 0101 e 1231
  if (ano && !mes) {
    query = query
      .gte('sk_data', Number(ano) * 10000 + 101)
      .lte('sk_data', Number(ano) * 10000 + 1231)
  }

  // Filtro por ano + mês: sk_data = YYYYMM01
  if (ano && mes) {
    const skData = Number(ano) * 10000 + Number(mes) * 100 + 1
    query = query.eq('sk_data', skData)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    data,
    total: data?.length ?? 0,
    fetched_at: new Date().toISOString(),
  })
}
