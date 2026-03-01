-- ============================================================
-- B3.Pet — Backstage Analytics (POC v2) — SCHEMA COMPLETO
-- Recria do zero seguindo o modelo dimensional do Excel v2.0
-- NÃO altera produto atual (user_profiles, portal_settings, audit_logs)
-- Cole no SQL Editor do Supabase e clique em Run
-- ============================================================

-- 1. DROP das tabelas antigas (estão vazias, sem perda de dados)
DROP TABLE IF EXISTS
  public.fato_financeiro,
  public.fato_transacoes,
  public.fato_assinaturas,
  public.agg_kpi_mensal,
  public.dim_tutor,
  public.dim_tempo,
  public.dim_plano,
  public.dim_canal,
  public.dim_pagamento,
  public.dim_estado,
  public.dim_cat_custo,
  public.dim_status_usuario,
  public.config_modelo
CASCADE;

-- ============================================================
-- 2. DIMENSÕES
-- ============================================================

-- dim_tempo: calendário diário 2024-2030 (2.557 registros no Excel)
CREATE TABLE public.dim_tempo (
  sk_data           integer PRIMARY KEY,  -- formato YYYYMMDD ex: 20240101
  data              date,
  ano               integer,
  semestre          integer,
  trimestre         text,
  mes_num           integer,
  mes_nome          text,
  dia               integer,
  dia_semana_num    integer,
  dia_semana_nome   text,
  ano_mes           text,                 -- ex: "2024-01"
  ano_fiscal        text,                 -- ex: "2023/2024"
  is_fim_semana     boolean DEFAULT false,
  is_ultimo_dia_mes boolean DEFAULT false,
  fl_ativo          boolean DEFAULT true
);

-- dim_tipo_pagamento: PIX, Cartão, Boleto
CREATE TABLE public.dim_tipo_pagamento (
  sk_tipo_pagamento  serial PRIMARY KEY,
  cd_tipo_pagamento  text NOT NULL UNIQUE, -- PIX, CARTAO, BOLETO
  ds_tipo_pagamento  text,
  pct_receita_target numeric,
  fl_ativo           boolean DEFAULT true,
  dt_criacao         date
);

-- dim_canal: canais de aquisição
CREATE TABLE public.dim_canal (
  sk_canal           serial PRIMARY KEY,
  cd_canal           text NOT NULL UNIQUE, -- TUTORES, CLINICA, etc.
  ds_canal           text,
  categoria          text,
  pct_receita_target numeric,
  fl_ativo           boolean DEFAULT true,
  dt_criacao         date
);

-- dim_plano: planos de assinatura
CREATE TABLE public.dim_plano (
  sk_plano          serial PRIMARY KEY,
  cd_plano          text NOT NULL UNIQUE, -- FREE, BASIC, PRO, PREMIUM
  ds_plano          text,
  vl_mensalidade    numeric,
  vl_anual_equiv    numeric,
  qt_meses_contrato integer,
  pct_desconto      numeric,
  fl_pago           boolean DEFAULT false,
  fl_ativo          boolean DEFAULT true,
  dt_criacao        date
);

-- dim_cat_custo: centros de custo OPEX
CREATE TABLE public.dim_cat_custo (
  sk_categoria_custo serial PRIMARY KEY,
  cd_categoria       text NOT NULL UNIQUE, -- INFRA, MKT, PESSOAL, etc.
  ds_categoria       text,
  centro_custo       text,
  tipo_custo         text,
  fl_ativo           boolean DEFAULT true,
  dt_criacao         date
);

-- dim_status_usuario: ciclo de vida do tutor
CREATE TABLE public.dim_status_usuario (
  sk_status  serial PRIMARY KEY,
  cd_status  text NOT NULL UNIQUE, -- ATIVO, INATIVO, CHURN, TRIAL
  ds_status  text,
  fl_pagante boolean DEFAULT false,
  fl_ativo   boolean DEFAULT true
);

-- dim_tutor: tutores (SCD Type 1)
CREATE TABLE public.dim_tutor (
  sk_tutor               serial PRIMARY KEY,
  cd_tutor               text NOT NULL UNIQUE,
  sk_plano               integer REFERENCES public.dim_plano(sk_plano),
  sk_canal_aquisicao     integer REFERENCES public.dim_canal(sk_canal),
  sk_status              integer REFERENCES public.dim_status_usuario(sk_status),
  dt_cadastro            date,
  dt_primeira_assinatura date,
  qt_pets                integer,
  regiao                 text,
  fl_ativo               boolean DEFAULT true,
  pais                   text DEFAULT 'Brasil',
  estado                 text,
  cidade                 text
);

-- ============================================================
-- 3. FATOS
-- ============================================================

-- fato_transacoes: grain = 1 linha / transação
CREATE TABLE public.fato_transacoes (
  sk_transacao      integer PRIMARY KEY,
  sk_data           integer REFERENCES public.dim_tempo(sk_data),
  sk_tutor          integer REFERENCES public.dim_tutor(sk_tutor),
  sk_tipo_pagamento integer REFERENCES public.dim_tipo_pagamento(sk_tipo_pagamento),
  sk_canal          integer REFERENCES public.dim_canal(sk_canal),
  sk_plano          integer REFERENCES public.dim_plano(sk_plano),
  vl_transacao      numeric,
  vl_desconto       numeric DEFAULT 0,
  vl_liquido        numeric,
  qt_parcelas       integer DEFAULT 1,
  fl_estorno        boolean DEFAULT false,
  dt_carga          date
);

-- fato_assinaturas: grain = 1 linha / assinatura / mês
CREATE TABLE public.fato_assinaturas (
  sk_assinatura integer PRIMARY KEY,
  sk_data       integer REFERENCES public.dim_tempo(sk_data),
  sk_tutor      integer REFERENCES public.dim_tutor(sk_tutor),
  sk_plano      integer REFERENCES public.dim_plano(sk_plano),
  sk_canal      integer REFERENCES public.dim_canal(sk_canal),
  vl_mensalidade numeric,
  vl_mrr         numeric,
  vl_arr         numeric,
  fl_renovacao   boolean DEFAULT false,
  fl_upgrade     boolean DEFAULT false,
  fl_downgrade   boolean DEFAULT false,
  fl_churn       boolean DEFAULT false,
  dt_carga       date
);

-- fato_financeiro: grain = 1 linha / mês / categoria de custo
CREATE TABLE public.fato_financeiro (
  sk_data              integer REFERENCES public.dim_tempo(sk_data),
  sk_categoria_custo   integer REFERENCES public.dim_cat_custo(sk_categoria_custo),
  vl_receita_bruta     numeric,
  vl_custo             numeric,
  vl_lucro_operacional numeric,
  vl_margem_pct        numeric,
  qt_transacoes        integer,
  qt_novos_usuarios    integer,
  qt_churn             integer,
  vl_investimento_mkt  numeric,
  dt_carga             date,
  CONSTRAINT fato_financeiro_pk PRIMARY KEY (sk_data, sk_categoria_custo)
);

-- ============================================================
-- 4. AGREGADO (equivalente a agg_kpi_mensal do Supabase anterior)
--    Alimentado pela função refresh_kpis()
-- ============================================================
CREATE TABLE public.agg_kpi_mensal (
  sk_data                    integer PRIMARY KEY REFERENCES public.dim_tempo(sk_data),
  qt_tutores_total           integer,
  qt_tutores_pagantes        integer,
  qt_novos_tutores_mes       integer,
  qt_churn_mes               integer,
  vl_receita_total           numeric,
  vl_custo_total             numeric,
  vl_lucro_operacional       numeric,
  vl_margem_operacional_pct  numeric,
  vl_mrr                     numeric,
  vl_arr                     numeric,
  vl_ticket_medio            numeric,
  vl_cac                     numeric,
  vl_ltv                     numeric,
  vl_ltv_cac_ratio           numeric,
  vl_churn_rate_pct          numeric,
  vl_nps                     numeric,
  qt_breakeven_meta          integer,
  pct_atingimento_breakeven  numeric,
  vl_payback_meses           numeric,
  dt_carga                   date,
  updated_at                 timestamptz DEFAULT now()
);

-- ============================================================
-- 5. CONFIG (parâmetros de negócio centralizados)
-- ============================================================
CREATE TABLE public.config_modelo (
  sk_config      serial PRIMARY KEY,
  parametro      text NOT NULL UNIQUE,
  valor          numeric,
  unidade        text,
  descricao      text,
  dt_atualizacao date,
  responsavel    text
);

-- ============================================================
-- 6. FUNÇÃO refresh_kpis() — corrigida (usa TRUNCATE + cálculo real)
-- ============================================================
CREATE OR REPLACE FUNCTION public.refresh_kpis()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Limpa e recalcula (TRUNCATE é permitido dentro de função)
  TRUNCATE TABLE public.agg_kpi_mensal;

  INSERT INTO public.agg_kpi_mensal (
    sk_data,
    qt_tutores_total,
    qt_tutores_pagantes,
    qt_novos_tutores_mes,
    qt_churn_mes,
    vl_receita_total,
    vl_custo_total,
    vl_lucro_operacional,
    vl_margem_operacional_pct,
    vl_mrr,
    vl_arr,
    vl_ticket_medio,
    vl_cac,
    vl_ltv,
    vl_ltv_cac_ratio,
    vl_churn_rate_pct,
    vl_nps,
    qt_breakeven_meta,
    pct_atingimento_breakeven,
    vl_payback_meses,
    dt_carga,
    updated_at
  )
  SELECT
    fa.sk_data,
    COUNT(DISTINCT fa.sk_tutor)                                                 AS qt_tutores_total,
    COUNT(DISTINCT fa.sk_tutor) FILTER (WHERE NOT fa.fl_churn)                  AS qt_tutores_pagantes,
    COUNT(DISTINCT fa.sk_tutor) FILTER (WHERE NOT fa.fl_renovacao AND NOT fa.fl_churn) AS qt_novos_tutores_mes,
    COUNT(DISTINCT fa.sk_tutor) FILTER (WHERE fa.fl_churn)                      AS qt_churn_mes,
    COALESCE(ff.vl_receita_total, 0)                                            AS vl_receita_total,
    COALESCE(ff.vl_custo_total, 0)                                              AS vl_custo_total,
    COALESCE(ff.vl_lucro_total, 0)                                              AS vl_lucro_operacional,
    CASE WHEN COALESCE(ff.vl_receita_total, 0) > 0
      THEN ROUND((ff.vl_lucro_total / ff.vl_receita_total * 100)::numeric, 2)
      ELSE 0 END                                                                AS vl_margem_operacional_pct,
    COALESCE(SUM(fa.vl_mrr), 0)                                                 AS vl_mrr,
    COALESCE(SUM(fa.vl_arr), 0)                                                 AS vl_arr,
    -- Ticket médio = MRR / tutores pagantes
    CASE WHEN COUNT(DISTINCT fa.sk_tutor) FILTER (WHERE NOT fa.fl_churn) > 0
      THEN ROUND((COALESCE(SUM(fa.vl_mrr), 0) /
           COUNT(DISTINCT fa.sk_tutor) FILTER (WHERE NOT fa.fl_churn))::numeric, 2)
      ELSE 0 END                                                                AS vl_ticket_medio,
    -- CAC = investimento_mkt / novos tutores
    CASE WHEN COUNT(DISTINCT fa.sk_tutor) FILTER (WHERE NOT fa.fl_renovacao AND NOT fa.fl_churn) > 0
      THEN ROUND((COALESCE(ff.vl_mkt_total, 0) /
           COUNT(DISTINCT fa.sk_tutor) FILTER (WHERE NOT fa.fl_renovacao AND NOT fa.fl_churn))::numeric, 2)
      ELSE 0 END                                                                AS vl_cac,
    -- LTV = ticket_medio / churn_rate (churn_rate em decimal)
    CASE WHEN COUNT(DISTINCT fa.sk_tutor) FILTER (WHERE fa.fl_churn) > 0
      AND COUNT(DISTINCT fa.sk_tutor) > 0
      THEN ROUND((
        (COALESCE(SUM(fa.vl_mrr), 0) / NULLIF(COUNT(DISTINCT fa.sk_tutor) FILTER (WHERE NOT fa.fl_churn), 0))
        /
        NULLIF(COUNT(DISTINCT fa.sk_tutor) FILTER (WHERE fa.fl_churn)::numeric
          / NULLIF(COUNT(DISTINCT fa.sk_tutor), 0), 0)
      )::numeric, 2)
      ELSE 0 END                                                                AS vl_ltv,
    0                                                                           AS vl_ltv_cac_ratio,  -- calculado abaixo via UPDATE
    CASE WHEN COUNT(DISTINCT fa.sk_tutor) > 0
      THEN ROUND((COUNT(DISTINCT fa.sk_tutor) FILTER (WHERE fa.fl_churn)::numeric
           / COUNT(DISTINCT fa.sk_tutor) * 100)::numeric, 2)
      ELSE 0 END                                                                AS vl_churn_rate_pct,
    NULL                                                                        AS vl_nps,  -- não há fonte nos fatos
    COALESCE((SELECT valor::integer FROM public.config_modelo WHERE parametro = 'BREAKEVEN_USUARIOS'), 0) AS qt_breakeven_meta,
    0                                                                           AS pct_atingimento_breakeven,  -- calculado abaixo
    COALESCE((SELECT valor FROM public.config_modelo WHERE parametro = 'PAYBACK_MESES'), 0) AS vl_payback_meses,
    CURRENT_DATE                                                                AS dt_carga,
    NOW()                                                                       AS updated_at
  FROM (
    -- Gera meses a partir de QUALQUER tabela com dados (fix: fato_financeiro sem assinaturas)
    SELECT DISTINCT sk_data FROM public.fato_assinaturas
    UNION
    SELECT DISTINCT sk_data FROM public.fato_financeiro
  ) d
  LEFT JOIN public.fato_assinaturas fa ON fa.sk_data = d.sk_data
  LEFT JOIN (
    SELECT
      sk_data,
      SUM(vl_receita_bruta)     AS vl_receita_total,
      SUM(vl_custo)             AS vl_custo_total,
      SUM(vl_lucro_operacional) AS vl_lucro_total,
      SUM(vl_investimento_mkt)  AS vl_mkt_total
    FROM public.fato_financeiro
    GROUP BY sk_data
  ) ff ON ff.sk_data = d.sk_data
  GROUP BY d.sk_data, ff.vl_receita_total, ff.vl_custo_total, ff.vl_lucro_total, ff.vl_mkt_total;

  -- Atualiza LTV/CAC ratio e % breakeven em um segundo passo
  -- WHERE obrigatório — Supabase bloqueia UPDATE sem cláusula WHERE
  UPDATE public.agg_kpi_mensal SET
    vl_ltv_cac_ratio = CASE WHEN vl_cac > 0 THEN ROUND((vl_ltv / vl_cac)::numeric, 2) ELSE 0 END,
    pct_atingimento_breakeven = CASE WHEN qt_breakeven_meta > 0
      THEN ROUND((qt_tutores_pagantes::numeric / qt_breakeven_meta * 100)::numeric, 2)
      ELSE 0 END
  WHERE sk_data IS NOT NULL;
END;
$$;

-- ============================================================
-- 7. Verificação final — lista todas as tabelas e status RLS
-- ============================================================
SELECT
  c.relname AS tabela,
  c.relrowsecurity AS rls_ativo,
  CASE WHEN c.relname IN ('user_profiles','portal_settings','audit_logs')
    THEN 'PRODUTO' ELSE 'backstage' END AS grupo
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relkind = 'r' AND n.nspname = 'public'
ORDER BY grupo DESC, tabela;
