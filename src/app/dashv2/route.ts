import { NextResponse } from 'next/server'

/**
 * Nota: Mantivemos todo o dashboard como HTML embutido por simplicidade.
 * Si quieres, luego lo separamos en /public + /api para caché y mantenimiento.
 */

const HTML = String.raw`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>B3.Pet · Monitorador de Desempenho</title>

  <!-- Librerías -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js"></script>

  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

  <style>
    :root {
      --bg: #0d1117;
      --bg2: #161b22;
      --bg3: #1c2330;
      --border: #2d3748;
      --border2: #374151;

      --teal: #2dd4bf;
      --teal-dim: #0f766e;
      --teal-glow: rgba(45, 212, 191, 0.15);
      --teal-glow2: rgba(45, 212, 191, 0.06);

      --orange: #fb923c;
      --green: #34d399;

      --text: #e2e8f0;
      --text2: #94a3b8;
      --text3: #64748b;

      --white: #ffffff;
      --font: 'DM Sans', sans-serif;
      --mono: 'DM Mono', monospace;

      --radius: 10px;
      --radius-sm: 6px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; overflow: hidden; background: var(--bg); }
    body {
      font-family: var(--font);
      color: var(--text);
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: var(--bg2); }
    ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

    /* ── Header ── */
    .hdr {
      background: var(--bg2);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      height: 52px;
      flex-shrink: 0;
      position: relative;
    }
    .hdr::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--teal), transparent);
      opacity: .4;
    }
    .logo img { height: 28px; display: block; filter: brightness(0) invert(1); }
    .hdr-center {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
    }
    .hdr-title {
      font-size: .65rem;
      font-weight: 600;
      color: var(--text3);
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    .yr-wrap { display: flex; align-items: center; gap: 10px; }
    .yr-label {
      font-size: .62rem;
      font-weight: 600;
      color: var(--text3);
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .yr-sel {
      background: var(--bg3);
      border: 1px solid var(--border2);
      color: var(--text);
      padding: 5px 28px 5px 12px;
      border-radius: var(--radius-sm);
      font-family: var(--font);
      font-size: .78rem;
      font-weight: 500;
      cursor: pointer;
      outline: none;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2364748b'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      transition: border-color .15s;
    }
    .yr-sel:hover { border-color: var(--teal); }
    .yr-sel option { background: var(--bg3); }

    /* ── Tabs ── */
    .tabs {
      background: var(--bg2);
      border-bottom: 1px solid var(--border);
      display: flex;
      gap: 2px;
      padding: 8px 20px;
      flex-shrink: 0;
    }
    .tab {
      padding: 6px 18px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: .75rem;
      font-weight: 500;
      border: 1px solid transparent;
      background: transparent;
      color: var(--text3);
      transition: all .2s;
      font-family: var(--font);
      display: flex;
      align-items: center;
      gap: 6px;
      letter-spacing: .3px;
    }
    .tab:hover { color: var(--text2); background: var(--bg3); }
    .tab.active { background: var(--teal-glow); color: var(--teal); border-color: var(--teal-dim); }

    /* ── Pages ── */
    .pg { display: none; flex: 1; overflow: hidden; padding: 12px 16px; gap: 10px; }
    .pg.active { display: flex; flex-direction: column; }

    /* ── Section label ── */
    .sec-label {
      font-size: .6rem;
      font-weight: 600;
      color: var(--text3);
      letter-spacing: 3px;
      text-transform: uppercase;
      padding: 0 2px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sec-label::before, .sec-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

    /* ── Cards ── */
    .card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    .card-hdr {
      padding: 8px 14px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-title {
      font-size: .65rem;
      font-weight: 600;
      color: var(--text3);
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .card-body { padding: 10px 14px; }

    /* ── Tooltip ── */
    .tip-btn {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--bg3);
      border: 1px solid var(--border2);
      color: var(--text3);
      font-size: .55rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      flex-shrink: 0;
      font-family: var(--font);
    }
    .tip-btn .tip {
      display: none;
      position: absolute;
      top: 22px;
      right: 0;
      z-index: 500;
      background: var(--bg3);
      color: var(--text2);
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      font-size: .67rem;
      font-weight: 400;
      width: 220px;
      line-height: 1.6;
      letter-spacing: 0;
      text-transform: none;
      box-shadow: 0 8px 32px rgba(0, 0, 0, .5);
      border: 1px solid var(--border2);
      pointer-events: none;
    }
    .tip-btn:hover .tip { display: block; }

    /* ── Overview layout ── */
    .ov-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 200px;
      grid-template-rows: 1fr 1fr;
      gap: 10px;
      flex: 1;
      min-height: 0;
    }
    .kpi-stack { grid-row: 1 / 3; display: flex; flex-direction: column; gap: 10px; }

    /* ── KPI cards ── */
    .kpi-card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 14px 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }
    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--teal), transparent);
    }
    .kpi-label {
      font-size: .6rem;
      font-weight: 600;
      color: var(--text3);
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .kpi-value {
      font-size: 2.2rem;
      font-weight: 700;
      color: var(--teal);
      line-height: 1;
      letter-spacing: -1px;
      font-variant-numeric: tabular-nums;
    }
    .kpi-sub { font-size: .7rem; font-weight: 500; color: var(--text2); margin-top: 2px; }
    .kpi-sub-label {
      font-size: .58rem;
      color: var(--text3);
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-top: 1px;
    }
    .kpi-divider { height: 1px; background: var(--border); margin: 8px 0; }

    /* ── Donut ── */
    .donut-body { display: flex; align-items: center; gap: 12px; height: 100%; }
    .donut-wrap { width: 120px; height: 120px; flex-shrink: 0; position: relative; }
    .donut-center {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      pointer-events: none;
    }
    .donut-center-val { font-size: 1.1rem; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; }
    .donut-center-lbl { font-size: .55rem; color: var(--text3); letter-spacing: 1px; text-transform: uppercase; }
    .donut-legend { display: flex; flex-direction: column; gap: 8px; flex: 1; }
    .dl-item { display: flex; align-items: flex-start; gap: 8px; }
    .dl-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; margin-top: 3px; }
    .dl-pct { font-size: .8rem; font-weight: 700; color: var(--text); }
    .dl-name { font-size: .65rem; color: var(--text3); margin-top: 1px; line-height: 1.3; }

    /* ── Map ── */
    .map-outer { display: flex; height: 100%; gap: 0; }
    #map { flex: 1; border-radius: 0 0 0 var(--radius); min-height: 0; }
    .map-panel {
      width: 120px;
      flex-shrink: 0;
      background: var(--bg2);
      border-left: 1px solid var(--border);
      padding: 10px 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      overflow-y: auto;
      border-radius: 0 0 var(--radius) 0;
    }
    .map-panel-label {
      font-size: .58rem;
      font-weight: 600;
      color: var(--text3);
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 0 2px;
    }
    .reg-btn {
      display: block;
      width: 100%;
      text-align: left;
      padding: 5px 8px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: transparent;
      font-family: var(--font);
      font-size: .68rem;
      cursor: pointer;
      color: var(--text2);
      transition: all .15s;
    }
    .reg-btn:hover { background: var(--bg3); color: var(--text); }
    .reg-btn.active { background: var(--teal-glow); color: var(--teal); border-color: var(--teal-dim); }
    .map-sep { height: 1px; background: var(--border); margin: 2px 0; }
    .est-sel {
      width: 100%;
      padding: 5px 6px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-family: var(--font);
      font-size: .68rem;
      outline: none;
      background: var(--bg3);
      color: var(--text2);
    }
    .est-sel:focus { border-color: var(--teal); }

    /* ── Chart legend ── */
    .chart-legend { display: flex; gap: 12px; flex-wrap: wrap; padding: 6px 14px 8px; border-top: 1px solid var(--border); }
    .cl-item { display: flex; align-items: center; gap: 5px; font-size: .67rem; color: var(--text3); }
    .cl-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }

    /* ── Financeiro ── */
    .fin-layout { display: grid; grid-template-columns: 1fr 320px; gap: 10px; flex: 1; min-height: 0; }
    .fin-table-wrap { overflow: auto; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg2); }
    .ft { border-collapse: collapse; width: 100%; font-size: .67rem; }
    .ft thead th {
      background: var(--bg3);
      color: var(--text3);
      padding: 8px 10px;
      text-align: center;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      white-space: nowrap;
      position: sticky;
      top: 0;
      border-bottom: 1px solid var(--border);
      font-size: .6rem;
    }
    .ft tbody tr { transition: background .1s; }
    .ft tbody tr:hover { background: var(--bg3); }
    .ft td { padding: 6px 10px; border-bottom: 1px solid var(--border); white-space: nowrap; color: var(--text2); }
    .ft tfoot td {
      background: var(--bg3);
      font-weight: 600;
      padding: 7px 10px;
      border-top: 1px solid var(--teal-dim);
      color: var(--text);
    }
    .r { text-align: right; font-family: var(--mono); font-size: .65rem; }
    .num-positive { color: var(--green); }
    .num-pct { color: var(--teal); font-family: var(--mono); }

    /* ── Glossário ── */
    .gl-scroll { overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 8px; padding-right: 2px; }
    .gcat {
      font-size: .58rem;
      font-weight: 600;
      color: var(--teal);
      letter-spacing: 3px;
      text-transform: uppercase;
      padding: 4px 0;
    }
    .gt { border-collapse: collapse; width: 100%; font-size: .67rem; }
    .gt thead th {
      background: var(--bg3);
      color: var(--text3);
      padding: 7px 12px;
      text-align: left;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      position: sticky;
      top: 0;
      border-bottom: 1px solid var(--border);
      font-size: .6rem;
    }
    .gt tbody tr:hover { background: var(--bg3); }
    .gt td { padding: 6px 12px; border-bottom: 1px solid var(--border); color: var(--text2); }
    .med { font-weight: 600; color: var(--text); font-size: .69rem; }
    .fml { font-family: var(--mono); background: var(--bg3); color: var(--teal); padding: 2px 6px; border-radius: 4px; font-size: .62rem; }
    .ref { color: var(--green); font-weight: 500; font-size: .65rem; }

    /* ── Chart containers ── */
    .chart-area { position: relative; flex: 1; min-height: 0; padding: 10px 14px 6px; }
  </style>
</head>

<body>
  <!-- Header -->
  <header class="hdr">
    <div class="logo">
      <img src="/logo_cor.png" alt="B3.Pet" />
    </div>

    <div class="hdr-center">
      <div class="hdr-title">Monitorador de Desempenho</div>
    </div>

    <div class="yr-wrap">
      <span class="yr-label">Ano</span>
      <select class="yr-sel" id="yrSel">
        <option value="all">Todos</option>
        <option value="2024">2024</option>
        <option value="2025">2025</option>
        <option value="2026">2026</option>
      </select>
    </div>
  </header>

  <!-- Tabs -->
  <nav class="tabs">
    <button class="tab active" onclick="showPg('overview', this)">
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7" rx="1"></rect>
        <rect x="14" y="3" width="7" height="7" rx="1"></rect>
        <rect x="3" y="14" width="7" height="7" rx="1"></rect>
        <rect x="14" y="14" width="7" height="7" rx="1"></rect>
      </svg>
      Overview
    </button>

    <button class="tab" onclick="showPg('financeiro', this)">
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
      Financeiro
    </button>

    <button class="tab" onclick="showPg('glossario', this)">
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
      Glossário
    </button>
  </nav>

  <!-- Overview -->
  <div class="pg active" id="pg-overview">
    <div class="sec-label">Crescimento</div>

    <div class="ov-grid">
      <!-- Custo -->
      <div class="card" style="display:flex;flex-direction:column;min-height:0">
        <div class="card-hdr">
          <span class="card-title">Custo Operacional</span>
          <button class="tip-btn">?
            <span class="tip">Custo operacional mensal por ano. Ideal crescer abaixo da receita para manter margem.</span>
          </button>
        </div>
        <div class="chart-area"><canvas id="cC"></canvas></div>
        <div class="chart-legend" id="cL"></div>
      </div>

      <!-- Lucro -->
      <div class="card" style="display:flex;flex-direction:column;min-height:0">
        <div class="card-hdr">
          <span class="card-title">Lucro Operacional</span>
          <button class="tip-btn">?
            <span class="tip">Receita menos custos. Ideal positivo e crescente ao longo dos meses.</span>
          </button>
        </div>
        <div class="chart-area"><canvas id="lC"></canvas></div>
        <div class="chart-legend" id="lL"></div>
      </div>

      <!-- KPI stack -->
      <div class="kpi-stack">
        <div class="kpi-card">
          <div class="kpi-label">Breakeven</div>
          <div class="kpi-value" id="kBK">41K</div>
          <div class="kpi-sub-label">Tutores necessários</div>
          <div class="kpi-divider"></div>
          <div class="kpi-sub" id="kTP">1.561</div>
          <div class="kpi-sub-label">Tutores pagantes</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Payback</div>
          <div class="kpi-value" id="kPB">18</div>
          <div class="kpi-sub-label">Meses</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Ticket Médio</div>
          <div class="kpi-value" id="kTK" style="font-size:1.4rem">R$29,68</div>
          <div class="kpi-sub-label">Receita média / usuário</div>
        </div>
      </div>

      <!-- Transações -->
      <div class="card" style="display:flex;flex-direction:column;min-height:0">
        <div class="card-hdr">
          <span class="card-title">Tipos de Transações</span>
          <button class="tip-btn">?
            <span class="tip">Distribuição por forma de pagamento.</span>
          </button>
        </div>

        <div class="donut-body" style="padding:10px 14px;flex:1">
          <div class="donut-wrap">
            <canvas id="tC"></canvas>
            <div class="donut-center">
              <div class="donut-center-val">529</div>
              <div class="donut-center-lbl">total</div>
            </div>
          </div>
          <div class="donut-legend" id="tL"></div>
        </div>
      </div>

      <!-- Mapa -->
      <div class="card" style="display:flex;flex-direction:column;min-height:0">
        <div class="card-hdr">
          <span class="card-title">Distribuição Geográfica</span>
          <button class="tip-btn">?
            <span class="tip">Tutores por estado. Tamanho do círculo proporcional ao volume.</span>
          </button>
        </div>

        <div class="map-outer" style="flex:1;min-height:0">
          <div id="map"></div>

          <div class="map-panel">
            <div class="map-panel-label">Região</div>
            <button class="reg-btn active" onclick="filterRegiao('todas', this)">Todas</button>
            <button class="reg-btn" onclick="filterRegiao('Centro-Oeste', this)">Centro-Oeste</button>
            <button class="reg-btn" onclick="filterRegiao('Nordeste', this)">Nordeste</button>
            <button class="reg-btn" onclick="filterRegiao('Norte', this)">Norte</button>
            <button class="reg-btn" onclick="filterRegiao('Sudeste', this)">Sudeste</button>
            <button class="reg-btn" onclick="filterRegiao('Sul', this)">Sul</button>

            <div class="map-sep"></div>

            <div class="map-panel-label">Estado</div>
            <select class="est-sel" id="estSel" onchange="filterEstado(this.value)">
              <option value="todos">Todos</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Financeiro -->
  <div class="pg" id="pg-financeiro">
    <div class="fin-layout">
      <div class="fin-table-wrap">
        <table class="ft">
          <thead>
            <tr>
              <th>Ano</th><th>Tri</th><th>Mês</th><th>País</th><th>Churn</th><th>Novos</th><th>Qt Trans</th>
              <th>Custo</th><th>Custo Total</th><th>Invest. Mkt</th><th>Lucro Op.</th><th>Margem %</th><th>Receita</th>
            </tr>
          </thead>
          <tbody id="fB"></tbody>
          <tfoot><tr id="fF"></tr></tfoot>
        </table>
      </div>

      <div class="card" style="display:flex;flex-direction:column;min-height:0">
        <div class="card-hdr"><span class="card-title">Evolução de Custo</span></div>
        <div class="chart-area" style="flex:1"><canvas id="fCC"></canvas></div>
      </div>
    </div>
  </div>

  <!-- Glossário -->
  <div class="pg" id="pg-glossario">
    <div class="gl-scroll">
      <div class="card"><div class="card-body">
        <div class="gcat">Financeiro</div>
        <table class="gt">
          <thead><tr><th>Medida</th><th>O que é?</th><th>Como é calculada?</th><th>Referência Saudável</th></tr></thead>
          <tbody>
            <tr><td class="med">Receita Bruta</td><td>Total faturado antes de qualquer desconto.</td><td><span class="fml">SUM(vl_receita_bruta)</span></td><td><span class="ref">Crescimento constante</span></td></tr>
            <tr><td class="med">MRR</td><td>Receita recorrente mensal das assinaturas ativas.</td><td><span class="fml">SOMA de vl_mrr</span></td><td><span class="ref">Crescimento constante</span></td></tr>
            <tr><td class="med">Custo Total</td><td>Soma de todos os custos operacionais.</td><td><span class="fml">SUM(vl_custo)</span></td><td><span class="ref">Crescer menos que Receita</span></td></tr>
            <tr><td class="med">Lucro Operacional</td><td>Quanto sobrou após pagar todos os custos.</td><td><span class="fml">Receita Bruta - Custo Total</span></td><td><span class="ref">Positivo e crescente</span></td></tr>
            <tr><td class="med">Margem Operacional %</td><td>Percentual do faturamento que vira lucro.</td><td><span class="fml">Lucro Op. / Receita Bruta</span></td><td><span class="ref">&gt; 20%</span></td></tr>
            <tr><td class="med">Ticket Médio</td><td>Receita média por tutor pagante no período.</td><td><span class="fml">Receita Líquida / Tutores Pagantes</span></td><td><span class="ref">Crescimento = upsell</span></td></tr>
            <tr><td class="med">CAC</td><td>Custo para conquistar 1 novo tutor.</td><td><span class="fml">Invest. Mkt / Novos Tutores</span></td><td><span class="ref">&lt; 1/3 do LTV</span></td></tr>
            <tr><td class="med">LTV</td><td>Receita total esperada de um tutor.</td><td><span class="fml">MRR / Churn Rate %</span></td><td><span class="ref">LTV &gt; 3x CAC</span></td></tr>
            <tr><td class="med">LTV/CAC Ratio</td><td>Eficiência da aquisição de clientes.</td><td><span class="fml">LTV / CAC</span></td><td><span class="ref">Acima de 3x = saudável</span></td></tr>
            <tr><td class="med">Payback (Meses)</td><td>Meses para recuperar o custo de aquisição.</td><td><span class="fml">CAC / (MRR / Tutores Pagantes)</span></td><td><span class="ref">&lt; 12 meses</span></td></tr>
            <tr><td class="med">Breakeven (Tutores)</td><td>Mínimo de tutores para cobrir todos os custos.</td><td><span class="fml">Custo Total / Ticket Médio</span></td><td><span class="ref">Quanto menor, melhor</span></td></tr>
          </tbody>
        </table>
      </div></div>

      <div class="card"><div class="card-body">
        <div class="gcat">Usuários</div>
        <table class="gt">
          <thead><tr><th>Medida</th><th>O que é?</th><th>Como é calculada?</th><th>Referência Saudável</th></tr></thead>
          <tbody>
            <tr><td class="med">Total Tutores</td><td>Todos os tutores cadastrados.</td><td><span class="fml">COUNTROWS(dim_tutor)</span></td><td><span class="ref">Base total crescente</span></td></tr>
            <tr><td class="med">Tutores Pagantes</td><td>Tutores com assinatura ativa e paga.</td><td><span class="fml">fl_pagante = 1</span></td><td><span class="ref">Crescimento constante</span></td></tr>
            <tr><td class="med">Novos Tutores</td><td>Assinaturas novas, excluindo renovações.</td><td><span class="fml">fl_renovacao = 0</span></td><td><span class="ref">Crescimento &gt; Churn</span></td></tr>
            <tr><td class="med">Churn</td><td>Tutores que cancelaram a assinatura.</td><td><span class="fml">fl_churn = 1</span></td><td><span class="ref">Menor que Novos Tutores</span></td></tr>
            <tr><td class="med">Churn Rate %</td><td>Percentual da base pagante que saiu.</td><td><span class="fml">Churn / Tutores Pagantes x 100</span></td><td><span class="ref">&lt; 3% ao mês</span></td></tr>
            <tr><td class="med">NPS</td><td>Net Promoter Score — satisfação dos tutores.</td><td><span class="fml">% Promotores - % Detratores</span></td><td><span class="ref">Acima de 50 = excelente</span></td></tr>
          </tbody>
        </table>
      </div></div>

      <div class="card"><div class="card-body">
        <div class="gcat">Transações</div>
        <table class="gt">
          <thead><tr><th>Medida</th><th>O que é?</th><th>Como é calculada?</th><th>Referência Saudável</th></tr></thead>
          <tbody>
            <tr><td class="med">Qt Transações</td><td>Total de transações incluindo estornos.</td><td><span class="fml">Contagem de fato_transacoes</span></td><td><span class="ref">Volume total</span></td></tr>
            <tr><td class="med">Qt Transações Válidas</td><td>Transações sem estorno.</td><td><span class="fml">fl_estorno = 0</span></td><td><span class="ref">Próxima de Qt Transações</span></td></tr>
            <tr><td class="med">% por Canal</td><td>Share por canal de venda.</td><td><span class="fml">Qt Canal / Qt Total</span></td><td><span class="ref">Diversificação saudável</span></td></tr>
            <tr><td class="med">% por Tipo Pagamento</td><td>Share por forma de pagamento.</td><td><span class="fml">Qt Tipo / Qt Total</span></td><td><span class="ref">Diversificação saudável</span></td></tr>
          </tbody>
        </table>
      </div></div>
    </div>
  </div>

  <script>
    // ─────────────────────────────────────────────────────────────────────────────
    // Registro de plugins
    // ─────────────────────────────────────────────────────────────────────────────
    Chart.register(ChartDataLabels);

    // ─────────────────────────────────────────────────────────────────────────────
    // Datos
    // ─────────────────────────────────────────────────────────────────────────────
    const KPI = [
      { pag: 904,  novos: 56,  churn: 24, cus: 18786.22, luc: 3723.38, ticket: 24.9,  pay: 18, mes: "Set", ano: 2024 },
      { pag: 945,  novos: 90,  churn: 15, cus: 20013.4,  luc: 3799.47, ticket: 25.2,  pay: 18, mes: "Out", ano: 2024 },
      { pag: 986,  novos: 105, churn: 17, cus: 21184.89, luc: 3955.74, ticket: 25.5,  pay: 18, mes: "Nov", ano: 2024 },
      { pag: 1027, novos: 65,  churn: 17, cus: 23456.26, luc: 3036.64, ticket: 25.8,  pay: 18, mes: "Dez", ano: 2024 },
      { pag: 1068, novos: 38,  churn: 30, cus: 25015.74, luc: 2853.93, ticket: 26.1,  pay: 18, mes: "Jan", ano: 2025 },
      { pag: 1109, novos: 72,  churn: 36, cus: 24372.54, luc: 4898.41, ticket: 26.39, pay: 18, mes: "Fev", ano: 2025 },
      { pag: 1150, novos: 41,  churn: 23, cus: 27866.3,  luc: 2830.42, ticket: 26.69, pay: 18, mes: "Mar", ano: 2025 },
      { pag: 1191, novos: 74,  churn: 24, cus: 26837.41, luc: 5309.59, ticket: 26.99, pay: 18, mes: "Abr", ano: 2025 },
      { pag: 1233, novos: 52,  churn: 31, cus: 29706.52, luc: 3942.54, ticket: 27.29, pay: 18, mes: "Mai", ano: 2025 },
      { pag: 1274, novos: 85,  churn: 34, cus: 32290.72, luc: 2857.92, ticket: 27.59, pay: 18, mes: "Jun", ano: 2025 },
      { pag: 1315, novos: 119, churn: 11, cus: 31578.3,  luc: 5094.42, ticket: 27.89, pay: 18, mes: "Jul", ano: 2025 },
      { pag: 1356, novos: 60,  churn: 15, cus: 32476.07, luc: 5745.23, ticket: 28.19, pay: 18, mes: "Ago", ano: 2025 },
      { pag: 1397, novos: 67,  churn: 9,  cus: 33180.89, luc: 6613.49, ticket: 28.49, pay: 18, mes: "Set", ano: 2025 },
      { pag: 1438, novos: 57,  churn: 36, cus: 34413.76, luc: 6978.21, ticket: 28.78, pay: 18, mes: "Out", ano: 2025 },
      { pag: 1479, novos: 45,  churn: 28, cus: 36590.63, luc: 6423.42, ticket: 29.08, pay: 18, mes: "Nov", ano: 2025 },
      { pag: 1520, novos: 71,  churn: 31, cus: 39205.22, luc: 5455.42, ticket: 29.38, pay: 18, mes: "Dez", ano: 2025 },
      { pag: 1561, novos: 94,  churn: 7,  cus: 39717.72, luc: 6614.01, ticket: 29.68, pay: 18, mes: "Jan", ano: 2026 }
    ];

    const FIN = [
      { ano: 2024, tri: "T3", mes: "Setembro",  churn: 124, novos: 419, qt: 2199, custo: 38619.40, mkt: 6683.84, lucro: 234115.36, margem: 85.84, receita: 272734.76 },
      { ano: 2024, tri: "T4", mes: "Outubro",   churn: 90,  novos: 346, qt: 2655, custo: 41749.06, mkt: 7743.74, lucro: 237936.15, margem: 85.07, receita: 279685.21 },
      { ano: 2024, tri: "T4", mes: "Novembro",  churn: 123, novos: 341, qt: 1891, custo: 37845.88, mkt: 6721.65, lucro: 247839.67, margem: 86.75, receita: 285685.55 },
      { ano: 2024, tri: "T4", mes: "Dezembro",  churn: 118, novos: 467, qt: 1985, custo: 42210.16, mkt: 7566.54, lucro: 246633.57, margem: 85.39, receita: 288843.73 },
      { ano: 2025, tri: "T1", mes: "Janeiro",   churn: 112, novos: 329, qt: 2398, custo: 40895.97, mkt: 7360.09, lucro: 255633.54, margem: 86.21, receita: 296529.51 },
      { ano: 2025, tri: "T1", mes: "Fevereiro", churn: 112, novos: 325, qt: 2234, custo: 39022.97, mkt: 7333.50, lucro: 261147.67, margem: 87.00, receita: 300170.64 },
      { ano: 2025, tri: "T1", mes: "Marco",     churn: 92,  novos: 355, qt: 2755, custo: 43468.17, mkt: 7889.11, lucro: 261416.01, margem: 85.74, receita: 304884.18 },
      { ano: 2025, tri: "T2", mes: "Abril",     churn: 93,  novos: 280, qt: 2155, custo: 42071.23, mkt: 7322.20, lucro: 259659.56, margem: 86.06, receita: 301730.79 },
      { ano: 2025, tri: "T2", mes: "Maio",      churn: 83,  novos: 284, qt: 2238, custo: 45692.51, mkt: 8435.69, lucro: 261194.84, margem: 85.11, receita: 306887.35 },
      { ano: 2025, tri: "T2", mes: "Junho",     churn: 107, novos: 364, qt: 1819, custo: 44244.63, mkt: 7806.79, lucro: 267570.75, margem: 85.81, receita: 311815.38 },
      { ano: 2025, tri: "T3", mes: "Julho",     churn: 112, novos: 349, qt: 2089, custo: 43375.32, mkt: 7906.86, lucro: 272559.49, margem: 86.27, receita: 315934.81 },
      { ano: 2025, tri: "T3", mes: "Agosto",    churn: 90,  novos: 375, qt: 1820, custo: 44994.28, mkt: 8188.43, lucro: 269875.73, margem: 85.71, receita: 314870.01 },
      { ano: 2025, tri: "T3", mes: "Setembro",  churn: 119, novos: 351, qt: 2065, custo: 45750.82, mkt: 7849.19, lucro: 274138.22, margem: 85.70, receita: 319889.04 },
      { ano: 2025, tri: "T4", mes: "Outubro",   churn: 116, novos: 362, qt: 2246, custo: 46230.93, mkt: 8615.07, lucro: 273388.19, margem: 85.54, receita: 319619.12 },
      { ano: 2025, tri: "T4", mes: "Novembro",  churn: 97,  novos: 270, qt: 1730, custo: 47889.40, mkt: 8557.34, lucro: 285142.04, margem: 85.62, receita: 333031.44 },
      { ano: 2025, tri: "T4", mes: "Dezembro",  churn: 118, novos: 389, qt: 2184, custo: 48651.51, mkt: 8753.24, lucro: 289543.21, margem: 85.60, receita: 338194.72 },
      { ano: 2026, tri: "T1", mes: "Janeiro",   churn: 94,  novos: 401, qt: 2310, custo: 50121.33, mkt: 9023.64, lucro: 295234.18, margem: 85.50, receita: 345355.51 }
    ];

    const TPAY = {
      "Pagamento via PIX": 311,
      "Boleto Bancário": 109,
      "Link de Pagamento": 109
    };

    const ESTADOS = [
      { uf: "SP", nome: "São Paulo",          regiao: "Sudeste",      lat: -23.55, lng: -46.63, tutores: 489 },
      { uf: "RJ", nome: "Rio de Janeiro",     regiao: "Sudeste",      lat: -22.91, lng: -43.17, tutores: 187 },
      { uf: "MG", nome: "Minas Gerais",       regiao: "Sudeste",      lat: -19.92, lng: -43.94, tutores: 142 },
      { uf: "RS", nome: "Rio Grande do Sul",  regiao: "Sul",          lat: -30.03, lng: -51.22, tutores: 98  },
      { uf: "PR", nome: "Paraná",             regiao: "Sul",          lat: -25.43, lng: -49.27, tutores: 87  },
      { uf: "SC", nome: "Santa Catarina",     regiao: "Sul",          lat: -27.59, lng: -48.55, tutores: 76  },
      { uf: "BA", nome: "Bahia",              regiao: "Nordeste",     lat: -12.97, lng: -38.51, tutores: 64  },
      { uf: "PE", nome: "Pernambuco",         regiao: "Nordeste",     lat: -8.05,  lng: -34.88, tutores: 52  },
      { uf: "CE", nome: "Ceará",              regiao: "Nordeste",     lat: -3.72,  lng: -38.54, tutores: 43  },
      { uf: "GO", nome: "Goiás",              regiao: "Centro-Oeste", lat: -16.68, lng: -49.25, tutores: 38  },
      { uf: "DF", nome: "Distrito Federal",   regiao: "Centro-Oeste", lat: -15.78, lng: -47.93, tutores: 34  },
      { uf: "ES", nome: "Espírito Santo",     regiao: "Sudeste",      lat: -20.32, lng: -40.34, tutores: 31  },
      { uf: "PA", nome: "Pará",               regiao: "Norte",        lat: -1.46,  lng: -48.50, tutores: 22  },
      { uf: "MA", nome: "Maranhão",           regiao: "Nordeste",     lat: -2.53,  lng: -44.30, tutores: 19  },
      { uf: "MT", nome: "Mato Grosso",        regiao: "Centro-Oeste", lat: -15.60, lng: -56.10, tutores: 18  },
      { uf: "PB", nome: "Paraíba",            regiao: "Nordeste",     lat: -7.12,  lng: -34.86, tutores: 16  },
      { uf: "MS", nome: "Mato Grosso do Sul", regiao: "Centro-Oeste", lat: -20.44, lng: -54.65, tutores: 15  },
      { uf: "AM", nome: "Amazonas",           regiao: "Norte",        lat: -3.10,  lng: -60.02, tutores: 14  },
      { uf: "RN", nome: "Rio Grande do Norte",regiao: "Nordeste",     lat: -5.79,  lng: -35.21, tutores: 12  }
    ];

    // ─────────────────────────────────────────────────────────────────────────────
    // Config
    // ─────────────────────────────────────────────────────────────────────────────
    const COLORS = {
      teal: '#2dd4bf',
      tealDim: 'rgba(45,212,191,0.7)',
      orange: '#fb923c',
      green: '#34d399',
      navy: '#0d1117',
      text: '#94a3b8',
      grid: 'rgba(45,57,72,0.8)'
    };

    const AC = { 2024: '#2dd4bf', 2025: '#fb923c', 2026: '#34d399' };

    let CH = {};
    let mapObj = null;
    let markers = [];

    let regiaoAtiva = 'todas';
    let estadoAtivo = 'todos';

    // ─────────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────────
    const fR = (v) => 'R$\\u00a0' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fK = (v) => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : String(Math.round(v));
    const fN = (v) => Math.round(v).toLocaleString('pt-BR');

    const getYear = () => document.getElementById('yrSel').value;
    const filterByYear = (arr) => {
      const y = getYear();
      return y === 'all' ? arr : arr.filter(d => d.ano == y);
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // Navegación
    // ─────────────────────────────────────────────────────────────────────────────
    function showPg(name, btn) {
      document.querySelectorAll('.pg').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

      document.getElementById('pg-' + name).classList.add('active');
      btn.classList.add('active');

      if (name === 'financeiro') renderFin();
      if (name === 'overview' && mapObj) setTimeout(() => mapObj.invalidateSize(), 50);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // KPI
    // ─────────────────────────────────────────────────────────────────────────────
    function updKPI() {
      const d = filterByYear(KPI);
      if (!d.length) return;

      const last = d[d.length - 1];

      document.getElementById('kTP').textContent = fN(last.pag);
      document.getElementById('kPB').textContent = last.pay;
      document.getElementById('kTK').textContent =
        'R$\\u00a0' + last.ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Chart helpers
    // ─────────────────────────────────────────────────────────────────────────────
    const baseChartOpts = (yFmt) => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: {
          display: true,
          anchor: 'end',
          align: 'end',
          formatter: (v) => 'R$' + fK(v),
          color: COLORS.text,
          font: { size: 8, weight: '600', family: 'DM Mono' },
          offset: 2
        }
      },
      scales: {
        y: {
          ticks: { callback: v => yFmt(v), font: { size: 9, family: 'DM Mono' }, color: COLORS.text },
          grid: { color: COLORS.grid },
          border: { color: 'transparent' }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 9, family: 'DM Sans' }, color: COLORS.text },
          border: { color: COLORS.grid }
        }
      }
    });

    function byYear(arr, field) {
      const y = getYear();

      if (y !== 'all') {
        const d = filterByYear(arr);
        return {
          labels: d.map(r => r.mes),
          datasets: [{
            label: String(y),
            data: d.map(r => r[field]),
            backgroundColor: AC[Number(y)] || COLORS.teal,
            borderRadius: 4,
            borderSkipped: false
          }]
        };
      }

      const years = [2024, 2025, 2026];
      const datasets = years
        .map(year => {
          const d = arr.filter(r => r.ano === year);
          if (!d.length) return null;
          return {
            label: String(year),
            data: d.map(r => r[field]),
            backgroundColor: AC[year],
            borderRadius: 4,
            borderSkipped: false
          };
        })
        .filter(Boolean);

      const base = arr.filter(r => r.ano === 2024);
      return { labels: base.map(r => r.mes), datasets };
    }

    function mkLegend(containerId, datasets) {
      document.getElementById(containerId).innerHTML = datasets
        .map(ds => (
          '<div class="cl-item">' +
            '<div class="cl-dot" style="background:' + ds.backgroundColor + '"></div>' +
            ds.label +
          '</div>'
        ))
        .join('');
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Charts: Custo / Lucro / Transações
    // ─────────────────────────────────────────────────────────────────────────────
    function bCusto() {
      const { labels, datasets } = byYear(KPI, 'cus');
      if (CH.c) CH.c.destroy();

      CH.c = new Chart(document.getElementById('cC'), {
        type: 'bar',
        data: { labels, datasets },
        options: baseChartOpts(v => 'R$' + fK(v))
      });

      mkLegend('cL', datasets);
    }

    function bLucro() {
      const { labels, datasets } = byYear(KPI, 'luc');
      if (CH.l) CH.l.destroy();

      CH.l = new Chart(document.getElementById('lC'), {
        type: 'bar',
        data: { labels, datasets },
        options: baseChartOpts(v => 'R$' + fK(v))
      });

      mkLegend('lL', datasets);
    }

    function bTrans() {
      const lbls = Object.keys(TPAY);
      const vals = Object.values(TPAY);
      const tot = vals.reduce((a, b) => a + b, 0);

      const cols = [COLORS.teal, COLORS.orange, COLORS.green];

      if (CH.t) CH.t.destroy();

      CH.t = new Chart(document.getElementById('tC'), {
        type: 'doughnut',
        data: { labels: lbls, datasets: [{ data: vals, backgroundColor: cols, borderWidth: 0, hoverOffset: 4 }] },
        options: {
          responsive: true,
          cutout: '68%',
          plugins: { legend: { display: false }, datalabels: { display: false } },
          animation: { animateRotate: true }
        }
      });

      document.querySelector('.donut-center-val').textContent = tot;

      document.getElementById('tL').innerHTML = lbls
        .map((label, i) => {
          const pct = ((vals[i] / tot) * 100).toFixed(1);
          return (
            '<div class="dl-item">' +
              '<div class="dl-dot" style="background:' + cols[i] + '"></div>' +
              '<div>' +
                '<div class="dl-pct">' + pct + '% ' +
                  '<span style="color:var(--text3);font-size:.65rem;font-weight:400">(' + vals[i] + ')</span>' +
                '</div>' +
                '<div class="dl-name">' + label + '</div>' +
              '</div>' +
            '</div>'
          );
        })
        .join('');
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Mapa
    // ─────────────────────────────────────────────────────────────────────────────
    function initMap() {
      if (mapObj) return;

      mapObj = L.map('map', { zoomControl: true, attributionControl: false }).setView([-15.8, -47.9], 4);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 10 }).addTo(mapObj);

      // Poblar selector de estados
      const sel = document.getElementById('estSel');
      [...ESTADOS].sort((a, b) => a.nome.localeCompare(b.nome)).forEach(e => {
        const o = document.createElement('option');
        o.value = e.uf;
        o.textContent = e.uf + ' · ' + e.nome;
        sel.appendChild(o);
      });

      renderMarkers();
    }

    function renderMarkers() {
      markers.forEach(m => m.remove());
      markers = [];

      const maxT = Math.max(...ESTADOS.map(e => e.tutores));

      ESTADOS
        .filter(e => {
          if (regiaoAtiva !== 'todas' && e.regiao !== regiaoAtiva) return false;
          if (estadoAtivo !== 'todos' && e.uf !== estadoAtivo) return false;
          return true;
        })
        .forEach(e => {
          const r = 7 + Math.round((e.tutores / maxT) * 20);
          const m = L.circleMarker([e.lat, e.lng], {
            radius: r,
            fillColor: '#2dd4bf',
            color: '#0f766e',
            weight: 1.5,
            fillOpacity: .6
          })
          .addTo(mapObj)
          .bindPopup(
            '<b style="color:#2dd4bf">' + e.uf + ' — ' + e.nome + '</b><br>' +
            '<span style="color:#94a3b8">' + e.tutores + ' tutores · ' + e.regiao + '</span>'
          );

          markers.push(m);
        });
    }

    function filterRegiao(r, btn) {
      regiaoAtiva = r;
      estadoAtivo = 'todos';

      document.getElementById('estSel').value = 'todos';

      document.querySelectorAll('.reg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      renderMarkers();
    }

    function filterEstado(uf) {
      estadoAtivo = uf;
      renderMarkers();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Financeiro
    // ─────────────────────────────────────────────────────────────────────────────
    function renderFin() {
      const d = filterByYear(FIN);

      let tC = 0, tN = 0, tQ = 0, tCu = 0, tM = 0, tL = 0, tR = 0;

      document.getElementById('fB').innerHTML = d
        .map(r => {
          tC += r.churn; tN += r.novos; tQ += r.qt; tCu += r.custo; tM += r.mkt; tL += r.lucro; tR += r.receita;

          return (
            '<tr>' +
              '<td>' + r.ano + '</td>' +
              '<td>' + r.tri + '</td>' +
              '<td>' + r.mes + '</td>' +
              '<td class="r">1</td>' +
              '<td class="r">' + fN(r.churn) + '</td>' +
              '<td class="r num-positive">' + fN(r.novos) + '</td>' +
              '<td class="r">' + fN(r.qt) + '</td>' +
              '<td class="r">' + r.custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + '</td>' +
              '<td class="r">' + fR(r.custo) + '</td>' +
              '<td class="r">' + fR(r.mkt) + '</td>' +
              '<td class="r num-positive">' + fR(r.lucro) + '</td>' +
              '<td class="r num-pct">' + r.margem.toFixed(2) + '%</td>' +
              '<td class="r num-positive">' + fR(r.receita) + '</td>' +
            '</tr>'
          );
        })
        .join('');

      const avgM = tR ? (tL / tR * 100).toFixed(2) + '%' : '--';

      document.getElementById('fF').innerHTML =
        '<td colspan="3">Total</td>' +
        '<td class="r">—</td>' +
        '<td class="r">' + fN(tC) + '</td>' +
        '<td class="r num-positive">' + fN(tN) + '</td>' +
        '<td class="r">' + fN(tQ) + '</td>' +
        '<td class="r">' + tCu.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + '</td>' +
        '<td class="r">' + fR(tCu) + '</td>' +
        '<td class="r">' + fR(tM) + '</td>' +
        '<td class="r num-positive">' + fR(tL) + '</td>' +
        '<td class="r num-pct">' + avgM + '</td>' +
        '<td class="r num-positive">' + fR(tR) + '</td>';

      const lbls = d.map(r => r.mes.substring(0, 3) + (getYear() === 'all' ? ' ' + r.ano : ''));
      const cs = d.map(r => r.custo);
      const tr = cs.map((_, i) => {
        const slice = cs.slice(0, i + 1);
        return slice.reduce((a, b) => a + b, 0) / slice.length;
      });

      if (CH.fc) CH.fc.destroy();

      CH.fc = new Chart(document.getElementById('fCC'), {
        data: {
          labels: lbls,
          datasets: [
            {
              type: 'line',
              label: 'Custo',
              data: cs,
              borderColor: COLORS.teal,
              backgroundColor: 'rgba(45,212,191,.08)',
              fill: true,
              tension: .4,
              pointRadius: 3,
              pointBackgroundColor: COLORS.teal,
              pointBorderColor: COLORS.navy,
              pointBorderWidth: 2
            },
            {
              type: 'line',
              label: 'Tendência',
              data: tr,
              borderColor: COLORS.text,
              borderDash: [5, 4],
              borderWidth: 1.5,
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { family: 'DM Sans', size: 10 },
                color: COLORS.text,
                boxWidth: 10,
                boxHeight: 10,
                padding: 12
              }
            },
            datalabels: { display: false }
          },
          scales: {
            y: {
              ticks: { callback: v => 'R$' + fK(v), font: { size: 9, family: 'DM Mono' }, color: COLORS.text },
              grid: { color: COLORS.grid },
              border: { color: 'transparent' }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 9 }, color: COLORS.text },
              border: { color: COLORS.grid }
            }
          }
        }
      });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Render principal
    // ─────────────────────────────────────────────────────────────────────────────
    function renderAll() {
      updKPI();
      bCusto();
      bLucro();
      bTrans();

      if (document.getElementById('pg-financeiro').classList.contains('active')) {
        renderFin();
      }
    }

    document.getElementById('yrSel').addEventListener('change', renderAll);

    renderAll();
    setTimeout(initMap, 120);
  </script>
</body>
</html>`

export async function GET(_req: Request) {
  return new NextResponse(HTML, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Si quieres evitar caché en plataformas CDN:
      // 'Cache-Control': 'no-store',
    },
  })
}