import { NextRequest } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// ── Helpers ──────────────────────────────────────────────────
function num(v: unknown) { return v != null && v !== '' ? Number(v) : null }
function bool(v: unknown) { return v === 1 || v === true || v === '1' || v === 'true' }
function str(v: unknown) { return v != null ? String(v).trim() : null }
function dateStr(v: unknown): string | null {
  if (v == null || v === '' || v === 'None') return null
  if (v instanceof Date) {
    const y = v.getFullYear()
    const m = String(v.getMonth() + 1).padStart(2, '0')
    const d = String(v.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  const s = String(v).trim()
  return s.length >= 10 ? s.slice(0, 10) : null
}

type Row = Record<string, unknown>

// ── Row mappers (Excel row → objeto DB) ──────────────────────
function mapRow(table: string, r: Row): Row {
  switch (table) {
    case 'dim_tempo': return {
      sk_data: num(r['sk_data']), data: dateStr(r['data']), ano: num(r['ano']),
      semestre: num(r['semestre']), trimestre: str(r['trimestre']),
      mes_num: num(r['mes_num']), mes_nome: str(r['mes_nome']), dia: num(r['dia']),
      dia_semana_num: num(r['dia_semana_num']), dia_semana_nome: str(r['dia_semana_nome']),
      ano_mes: str(r['ano_mes']), ano_fiscal: str(r['ano_fiscal']),
      is_fim_semana: bool(r['is_fim_semana']), is_ultimo_dia_mes: bool(r['is_ultimo_dia_mes']),
      fl_ativo: bool(r['fl_ativo']),
    }
    case 'dim_tipo_pagamento': return {
      sk_tipo_pagamento: num(r['sk_tipo_pagamento']),
      cd_tipo_pagamento: str(r['cd_tipo_pagamento']),
      ds_tipo_pagamento: str(r['ds_tipo_pagamento']),
      pct_receita_target: num(r['pct_receita_target']),
      fl_ativo: bool(r['fl_ativo']), dt_criacao: dateStr(r['dt_criacao']),
    }
    case 'dim_canal': return {
      sk_canal: num(r['sk_canal']), cd_canal: str(r['cd_canal']),
      ds_canal: str(r['ds_canal']), categoria: str(r['categoria']),
      pct_receita_target: num(r['pct_receita_target']),
      fl_ativo: bool(r['fl_ativo']), dt_criacao: dateStr(r['dt_criacao']),
    }
    case 'dim_plano': return {
      sk_plano: num(r['sk_plano']), cd_plano: str(r['cd_plano']),
      ds_plano: str(r['ds_plano']), vl_mensalidade: num(r['vl_mensalidade']),
      vl_anual_equiv: num(r['vl_anual_equiv']), qt_meses_contrato: num(r['qt_meses_contrato']),
      pct_desconto: num(r['pct_desconto']), fl_pago: bool(r['fl_pago']),
      fl_ativo: bool(r['fl_ativo']), dt_criacao: dateStr(r['dt_criacao']),
    }
    case 'dim_cat_custo': return {
      sk_categoria_custo: num(r['sk_categoria_custo']), cd_categoria: str(r['cd_categoria']),
      ds_categoria: str(r['ds_categoria']), centro_custo: str(r['centro_custo']),
      tipo_custo: str(r['tipo_custo']), fl_ativo: bool(r['fl_ativo']),
      dt_criacao: dateStr(r['dt_criacao']),
    }
    case 'dim_status_usuario': return {
      sk_status: num(r['sk_status']), cd_status: str(r['cd_status']),
      ds_status: str(r['ds_status']), fl_pagante: bool(r['fl_pagante']),
      fl_ativo: bool(r['fl_ativo']),
    }
    case 'dim_tutor': return {
      sk_tutor: num(r['sk_tutor']), cd_tutor: str(r['cd_tutor']),
      sk_plano: num(r['sk_plano']), sk_canal_aquisicao: num(r['sk_canal_aquisicao']),
      sk_status: num(r['sk_status']), dt_cadastro: dateStr(r['dt_cadastro']),
      dt_primeira_assinatura: dateStr(r['dt_primeira_assinatura']),
      qt_pets: num(r['qt_pets']), regiao: str(r['regiao']),
      fl_ativo: bool(r['fl_ativo']), pais: str(r['pais']),
      estado: str(r['estado']), cidade: str(r['cidade']),
    }
    case 'fato_transacoes': return {
      sk_transacao: num(r['sk_transacao']), sk_data: num(r['sk_data']),
      sk_tutor: num(r['sk_tutor']), sk_tipo_pagamento: num(r['sk_tipo_pagamento']),
      sk_canal: num(r['sk_canal']), sk_plano: num(r['sk_plano']),
      vl_transacao: num(r['vl_transacao']), vl_desconto: num(r['vl_desconto']),
      vl_liquido: num(r['vl_liquido']), qt_parcelas: num(r['qt_parcelas']),
      fl_estorno: bool(r['fl_estorno']), dt_carga: dateStr(r['dt_carga']),
    }
    case 'fato_assinaturas': return {
      sk_assinatura: num(r['sk_assinatura']), sk_data: num(r['sk_data']),
      sk_tutor: num(r['sk_tutor']), sk_plano: num(r['sk_plano']),
      sk_canal: num(r['sk_canal']), vl_mensalidade: num(r['vl_mensalidade']),
      vl_mrr: num(r['vl_mrr']), vl_arr: num(r['vl_arr']),
      fl_renovacao: bool(r['fl_renovacao']), fl_upgrade: bool(r['fl_upgrade']),
      fl_downgrade: bool(r['fl_downgrade']), fl_churn: bool(r['fl_churn']),
      dt_carga: dateStr(r['dt_carga']),
    }
    case 'fato_financeiro': return {
      sk_data: num(r['sk_data']), sk_categoria_custo: num(r['sk_categoria_custo']),
      vl_receita_bruta: num(r['vl_receita_bruta']), vl_custo: num(r['vl_custo']),
      vl_lucro_operacional: num(r['vl_lucro_operacional']),
      vl_margem_pct: num(r['vl_margem_pct']), qt_transacoes: num(r['qt_transacoes']),
      qt_novos_usuarios: num(r['qt_novos_usuarios']), qt_churn: num(r['qt_churn']),
      vl_investimento_mkt: num(r['vl_investimento_mkt']), dt_carga: dateStr(r['dt_carga']),
    }
    case 'agg_kpi_mensal': return {
      sk_data: num(r['sk_data']), qt_tutores_total: num(r['qt_tutores_total']),
      qt_tutores_pagantes: num(r['qt_tutores_pagantes']),
      qt_novos_tutores_mes: num(r['qt_novos_tutores_mes']),
      qt_churn_mes: num(r['qt_churn_mes']), vl_receita_total: num(r['vl_receita_total']),
      vl_custo_total: num(r['vl_custo_total']),
      vl_lucro_operacional: num(r['vl_lucro_operacional']),
      vl_margem_operacional_pct: num(r['vl_margem_operacional_pct']),
      vl_mrr: num(r['vl_mrr']), vl_arr: num(r['vl_arr']),
      vl_ticket_medio: num(r['vl_ticket_medio']), vl_cac: num(r['vl_cac']),
      vl_ltv: num(r['vl_ltv']), vl_ltv_cac_ratio: num(r['vl_ltv_cac_ratio']),
      vl_churn_rate_pct: num(r['vl_churn_rate_pct']), vl_nps: num(r['vl_nps']),
      qt_breakeven_meta: num(r['qt_breakeven_meta']),
      pct_atingimento_breakeven: num(r['pct_atingimento_breakeven']),
      vl_payback_meses: num(r['vl_payback_meses']), dt_carga: dateStr(r['dt_carga']),
    }
    case 'config_modelo': return {
      // sk_config é serial — não incluir no payload; Supabase gera automaticamente
      parametro: str(r['parametro']), valor: num(r['valor']),
      unidade: str(r['unidade']), descricao: str(r['descricao']),
      dt_atualizacao: dateStr(r['dt_atualizacao']), responsavel: str(r['responsavel']),
    }
    default: return r
  }
}

// PKs para filtrar linhas inválidas antes do upsert
const PK_COLS: Record<string, string[]> = {
  dim_tempo:          ['sk_data'],
  dim_tipo_pagamento: ['sk_tipo_pagamento'],
  dim_canal:          ['sk_canal'],
  dim_plano:          ['sk_plano'],
  dim_cat_custo:      ['sk_categoria_custo'],
  dim_status_usuario: ['sk_status'],
  dim_tutor:          ['sk_tutor'],
  fato_transacoes:    ['sk_transacao'],
  fato_assinaturas:   ['sk_assinatura'],
  fato_financeiro:    ['sk_data', 'sk_categoria_custo'],
  agg_kpi_mensal:     ['sk_data'],
  config_modelo:      ['parametro'],
}

// Coluna(s) de conflito para upsert idempotente
const CONFLICT_COLS: Record<string, string> = {
  dim_tempo:          'sk_data',
  dim_tipo_pagamento: 'cd_tipo_pagamento',
  dim_canal:          'cd_canal',
  dim_plano:          'cd_plano',
  dim_cat_custo:      'cd_categoria',
  dim_status_usuario: 'cd_status',
  dim_tutor:          'cd_tutor',
  fato_transacoes:    'sk_transacao',
  fato_assinaturas:   'sk_assinatura',
  fato_financeiro:    'sk_data,sk_categoria_custo',
  agg_kpi_mensal:     'sk_data',
  config_modelo:      'parametro',
}

// Ordem correta de importação (respeita FKs)
const IMPORT_ORDER = [
  'dim_tempo', 'dim_tipo_pagamento', 'dim_canal', 'dim_plano',
  'dim_cat_custo', 'dim_status_usuario', 'dim_tutor',
  'fato_transacoes', 'fato_assinaturas', 'fato_financeiro',
  'agg_kpi_mensal', 'config_modelo',
]

const CHUNK_SIZE = 250

// ── Detecção de cabeçalho real no Excel ──────────────────────
const HEADER_RE = /^(sk_|cd_|fl_|vl_|qt_|dt_|ds_|is_|pct_|ano$|mes$|dia$|data$|semestre|trimestre|parametro|valor|unidade|descricao|responsavel)/i

function resolveTable(sheetName: string): string | null {
  const map: Record<string, string> = {
    '01_dim_tempo': 'dim_tempo', '02_dim_tipo_pagamento': 'dim_tipo_pagamento',
    '03_dim_canal': 'dim_canal', '04_dim_plano': 'dim_plano',
    '05_dim_cat_custo': 'dim_cat_custo', '06_dim_status_usuario': 'dim_status_usuario',
    '07_dim_tutor': 'dim_tutor', '08_fato_transacoes': 'fato_transacoes',
    '09_fato_assinaturas': 'fato_assinaturas', '10_fato_financeiro': 'fato_financeiro',
    '11_fato_kpi_mensal': 'agg_kpi_mensal', '12_config_modelo': 'config_modelo',
    'dim_tempo': 'dim_tempo', 'dim_tipo_pagamento': 'dim_tipo_pagamento',
    'dim_canal': 'dim_canal', 'dim_plano': 'dim_plano',
    'dim_cat_custo': 'dim_cat_custo', 'dim_status_usuario': 'dim_status_usuario',
    'dim_tutor': 'dim_tutor', 'fato_transacoes': 'fato_transacoes',
    'fato_assinaturas': 'fato_assinaturas', 'fato_financeiro': 'fato_financeiro',
    'fato_kpi_mensal': 'agg_kpi_mensal', 'agg_kpi_mensal': 'agg_kpi_mensal',
    'config_modelo': 'config_modelo',
  }
  return map[sheetName] ?? null
}

function parseSheet(ws: XLSX.WorkSheet): Row[] {
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  if (raw.length === 0) return []

  let headerIdx = -1
  for (let i = 0; i < Math.min(raw.length, 15); i++) {
    const row = raw[i] as unknown[]
    if (row.some(cell => typeof cell === 'string' && HEADER_RE.test(cell.trim()))) {
      headerIdx = i; break
    }
  }
  if (headerIdx === -1) return []

  const headers = (raw[headerIdx] as unknown[]).map(h => String(h).trim())
  return (raw.slice(headerIdx + 1) as unknown[][])
    .filter(row => row.some(cell => cell !== '' && cell != null))
    .map(row => {
      const obj: Row = {}
      headers.forEach((h, i) => { if (h) obj[h] = row[i] ?? '' })
      return obj
    })
}

// ── Handler ──────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const jsonErr = (msg: string, status: number) =>
    new Response(JSON.stringify({ error: msg }), {
      status, headers: { 'Content-Type': 'application/json' },
    })

  // Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return jsonErr('Unauthorized', 401)

  const { data: profile } = await supabase
    .from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return jsonErr('Forbidden', 403)

  // Arquivo
  let form: FormData
  try { form = await request.formData() }
  catch { return jsonErr('FormData inválido', 400) }

  const file = form.get('file') as File | null
  if (!file) return jsonErr('Arquivo não enviado', 400)
  if (!file.name.match(/\.xlsx?$/i)) return jsonErr('Envie um arquivo .xlsx', 400)

  // Parseia Excel (antes de abrir o stream — erros de parsing retornam JSON normal)
  let sheetData: Record<string, Row[]>
  try {
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array', cellDates: true })
    sheetData = {}
    for (const sheetName of wb.SheetNames) {
      const table = resolveTable(sheetName)
      if (table) sheetData[table] = parseSheet(wb.Sheets[sheetName])
    }
  } catch (e) {
    return jsonErr(`Erro ao ler Excel: ${(e as Error).message}`, 400)
  }

  const svc = await createServiceClient()
  const encoder = new TextEncoder()
  const TOTAL_STEPS = IMPORT_ORDER.length + 1 // +1 para refresh_kpis

  // Resposta em streaming (SSE)
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

      const results: Record<string, { total: number; inserted: number; errors: string[] }> = {}

      for (let i = 0; i < IMPORT_ORDER.length; i++) {
        const table = IMPORT_ORDER[i]
        const step = i + 1
        const rawRows = sheetData[table] ?? []

        send({ type: 'step_start', step, totalSteps: TOTAL_STEPS, table })

        if (rawRows.length === 0) {
          results[table] = { total: 0, inserted: 0, errors: [] }
          send({ type: 'step_done', step, totalSteps: TOTAL_STEPS, table, total: 0, inserted: 0, errors: [] })
          continue
        }

        // Mapeia e filtra linhas com PK nula
        const pkCols = PK_COLS[table] ?? []
        const mapped = rawRows
          .map(r => mapRow(table, r))
          .filter(r => pkCols.every(pk => r[pk] != null))

        const conflict = CONFLICT_COLS[table]
        let inserted = 0
        const errors: string[] = []

        // Upsert em chunks de 250 linhas
        for (let j = 0; j < mapped.length; j += CHUNK_SIZE) {
          const chunk = mapped.slice(j, j + CHUNK_SIZE)
          const { error } = await svc.from(table).upsert(chunk, { onConflict: conflict })
          if (error) {
            errors.push(`chunk ${Math.floor(j / CHUNK_SIZE) + 1}: ${error.message}`)
            if (errors.length >= 3) { errors.push('...mais erros omitidos'); break }
          } else {
            inserted += chunk.length
          }
          // Progresso dentro da tabela (para tabelas grandes)
          if (mapped.length > CHUNK_SIZE) {
            send({ type: 'chunk', table, processed: Math.min(j + CHUNK_SIZE, mapped.length), total: mapped.length })
          }
        }

        results[table] = { total: rawRows.length, inserted, errors }
        send({ type: 'step_done', step, totalSteps: TOTAL_STEPS, table, total: rawRows.length, inserted, errors })
      }

      // refresh_kpis
      const refreshStep = IMPORT_ORDER.length + 1
      send({ type: 'step_start', step: refreshStep, totalSteps: TOTAL_STEPS, table: 'refresh_kpis' })
      let refreshError: string | null = null
      const { error: rpcErr } = await svc.rpc('refresh_kpis')
      if (rpcErr) refreshError = rpcErr.message
      send({ type: 'step_done', step: refreshStep, totalSteps: TOTAL_STEPS, table: 'refresh_kpis',
        total: 1, inserted: refreshError ? 0 : 1, errors: refreshError ? [refreshError] : [] })

      const totalInserted = Object.values(results).reduce((s, r) => s + r.inserted, 0)
      const totalRows     = Object.values(results).reduce((s, r) => s + r.total, 0)
      const hasErrors     = Object.values(results).some(r => r.errors.length > 0) || !!refreshError

      send({
        type: 'done',
        ok: !hasErrors,
        summary: { total: totalRows, inserted: totalInserted },
        sheets: results,
        refresh_error: refreshError,
        imported_at: new Date().toISOString(),
      })

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
