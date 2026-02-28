import { NextResponse } from 'next/server'

const HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>B3.Pet · Monitorador de Desempenho</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"><\\/script>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
:root{--teal:#5FC9BF;--teal-d:#3aada2;--teal-bg:#d9f5f3;--teal-light:#eafaf9;--navy:#1a3a3a;--white:#fff;--page:#eef8f7;--text:#1a3a3a;--muted:#6b9090;--border:#c8e8e5;--orange:#f4a261;--font:'Sora',sans-serif;--mono:'JetBrains Mono',monospace}
*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}
body{font-family:var(--font);background:var(--page);color:var(--text);display:flex;flex-direction:column;height:100vh}
.hdr{background:var(--teal);display:flex;align-items:center;justify-content:space-between;padding:8px 24px;flex-shrink:0;box-shadow:0 2px 10px rgba(95,201,191,.3)}
.logo{display:flex;align-items:center;gap:8px;text-decoration:none}
.logo-txt{font-size:1.45rem;font-weight:800;color:white;letter-spacing:-.5px}
.logo-txt span{font-weight:300;opacity:.7}
.hdr-title{font-size:1rem;font-weight:700;color:white;letter-spacing:2px;text-transform:uppercase}
.yr-wrap{display:flex;align-items:center;gap:8px}
.yr-wrap label{color:rgba(255,255,255,.8);font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase}
.yr-sel{background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.4);color:white;padding:5px 30px 5px 12px;border-radius:7px;font-family:var(--font);font-size:.83rem;cursor:pointer;outline:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='white'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center}
.yr-sel option{background:#1a3a3a;color:white}
.tabs{background:white;display:flex;justify-content:center;gap:6px;padding:8px 0;border-bottom:2px solid var(--border);flex-shrink:0}
.tab{padding:6px 20px;border-radius:8px;cursor:pointer;font-size:.81rem;font-weight:600;border:1.5px solid transparent;background:transparent;color:var(--muted);transition:all .15s;display:flex;align-items:center;gap:6px;font-family:var(--font)}
.tab:hover{background:var(--teal-bg);color:var(--teal-d)}
.tab.active{background:var(--teal);color:white;box-shadow:0 2px 10px rgba(95,201,191,.35)}
.pg{display:none;flex:1;overflow-y:auto;padding:14px 18px}.pg.active{display:block}
.st{background:var(--teal);color:white;border-radius:9px;padding:8px 16px;font-size:.82rem;font-weight:700;letter-spacing:1px;text-align:center;margin-bottom:12px;text-transform:uppercase}
.card{background:var(--white);border-radius:11px;border:1px solid var(--border);overflow:hidden;box-shadow:0 1px 5px rgba(26,58,58,.04)}
.ch{background:var(--teal);color:white;padding:6px 12px;font-size:.7rem;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;display:flex;align-items:center;gap:6px}
.cb{padding:12px}
.ib{background:rgba(255,255,255,.22);border:none;color:white;width:19px;height:19px;border-radius:50%;cursor:pointer;font-size:.63rem;font-weight:800;display:inline-flex;align-items:center;justify-content:center;position:relative;font-family:var(--font);flex-shrink:0}
.ib .tip{display:none;position:absolute;top:24px;left:0;z-index:300;background:var(--navy);color:white;padding:9px 12px;border-radius:8px;font-size:.69rem;font-weight:400;width:210px;line-height:1.5;letter-spacing:0;text-transform:none;box-shadow:0 6px 20px rgba(0,0,0,.28);pointer-events:none}
.ib:hover .tip{display:block}
.ov-grid{display:grid;grid-template-columns:1fr 1fr 270px;gap:12px;align-items:start}
.charts-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.kc{background:var(--white);border-radius:11px;border:1px solid var(--border);overflow:hidden;text-align:center;box-shadow:0 1px 5px rgba(26,58,58,.04)}
.kch{background:var(--teal);color:white;padding:6px 10px;font-size:.66rem;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;display:flex;align-items:center;justify-content:space-between}
.kcb{padding:10px 8px 14px}
.kv{font-size:2.6rem;font-weight:800;color:var(--teal-d);line-height:1}
.kl{font-size:.6rem;font-weight:700;color:var(--muted);letter-spacing:1.4px;text-transform:uppercase;margin-top:3px}
.ks{font-size:1.15rem;font-weight:700;color:var(--text);margin-top:8px}
.ksl{font-size:.6rem;color:var(--muted);letter-spacing:1.2px;text-transform:uppercase;margin-top:2px}
.trans-body{display:flex;align-items:center;gap:14px;padding:12px}
.trans-cw{width:185px;height:185px;flex-shrink:0}
.tleg{font-size:.74rem;display:flex;flex-direction:column;gap:10px}
.tli{display:flex;align-items:flex-start;gap:7px}
.tdot{width:10px;height:10px;border-radius:2px;flex-shrink:0;margin-top:2px}
.leg{display:flex;gap:12px;flex-wrap:wrap;padding:6px 12px 8px;font-size:.72rem}
.li{display:flex;align-items:center;gap:5px}.ld{width:11px;height:11px;border-radius:2px}
.fin-wrap{overflow-x:auto;max-height:46vh;overflow-y:auto;border-radius:10px;border:1px solid var(--border);margin-bottom:14px}
table{width:100%;border-collapse:collapse;font-size:.75rem}
thead th{background:var(--teal);color:white;padding:8px 10px;font-weight:700;font-size:.68rem;letter-spacing:.4px;position:sticky;top:0;z-index:2;white-space:nowrap;text-align:left}
thead th.r{text-align:right}
tbody tr{border-bottom:1px solid var(--teal-light);transition:background .1s}
tbody tr:hover{background:var(--teal-bg)}
tbody tr:nth-child(even){background:#f7fcfc}tbody tr:nth-child(even):hover{background:var(--teal-bg)}
tbody td{padding:6px 10px;white-space:nowrap}tbody td.r{text-align:right}
tfoot td{font-weight:700;background:var(--teal-bg);padding:8px 10px;border-top:2px solid var(--teal);white-space:nowrap}
tfoot td.r{text-align:right}
.gloss-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.gcat{font-size:.9rem;font-weight:700;color:var(--teal-d);margin-bottom:8px;padding-bottom:5px;border-bottom:2px solid var(--teal-bg)}
.gt{width:100%;border-collapse:collapse;font-size:.76rem}
.gt thead th{background:var(--teal);color:white;padding:7px 12px;font-weight:700;font-size:.68rem;text-align:left}
.gt tbody td{padding:7px 12px;border-bottom:1px solid var(--border);vertical-align:top;line-height:1.45}
.gt tbody tr:hover{background:var(--teal-bg)}
.med{font-weight:700;color:var(--teal-d);white-space:nowrap}
.fml{font-family:var(--mono);font-size:.68rem;color:#c00;background:#fff3f3;padding:2px 6px;border-radius:4px;display:inline-block}
.ref{background:#e5f7f2;color:#2a9d8f;padding:2px 8px;border-radius:10px;font-size:.66rem;font-weight:700;display:inline-block;white-space:nowrap}
canvas{display:block}
</style>
</head>
<body>

<div class="hdr">
  <a class="logo" href="/dashboard"><span style="font-size:1.7rem">🐾</span><span class="logo-txt">B<span>3.</span>Pet</span></a>
  <div class="hdr-title">Monitorador de Desempenho</div>
  <div class="yr-wrap">
    <label>Ano</label>
    <select class="yr-sel" id="yrSel"><option value="all">All</option><option value="2024">2024</option><option value="2025">2025</option><option value="2026">2026</option></select>
  </div>
</div>
<div class="tabs">
  <button class="tab active" onclick="showPg('overview',this)">&#128202; Overview</button>
  <button class="tab" onclick="showPg('financeiro',this)">&#128293; Financeiro</button>
  <button class="tab" onclick="showPg('glossario',this)">&#128218; Glossario</button>
</div>
<div class="pg active" id="pg-overview">
  <div class="st">Crescimento</div>
  <div class="ov-grid">
    <div style="grid-column:1/3">
      <div class="charts-row">
        <div class="card"><div class="ch"><button class="ib">?<div class="tip">Custos operacionais mensais por ano. Picos indicam campanhas ou expansao.</div></button>Custo</div><div class="cb"><canvas id="cC" height="175"></canvas></div><div class="leg" id="cL"></div></div>
        <div class="card"><div class="ch"><button class="ib">?<div class="tip">Lucro operacional mensal apos todos os custos.</div></button>Lucro Operacional Mensal</div><div class="cb"><canvas id="lC" height="175"></canvas></div><div class="leg" id="lL"></div></div>
      </div>
      <div class="charts-row">
        <div class="card"><div class="ch"><button class="ib">?<div class="tip">Distribuicao das transacoes validas por forma de pagamento.</div></button>Tipos de Transacoes</div><div class="trans-body"><div class="trans-cw"><canvas id="tC"></canvas></div><div class="tleg" id="tL"></div></div></div>
        <div class="card"><div class="ch"><button class="ib">?<div class="tip">Novos tutores vs churn por mes.</div></button>Distribuicao</div><div class="cb"><canvas id="dC" height="175"></canvas></div></div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div class="kc"><div class="kch"><span>Breackeven</span></div><div class="kcb"><div class="kv" id="kBK">41K</div><div style="margin-top:10px"><div class="ks" id="kTP">1.241</div><div class="ksl">Tutores Pagantes</div></div></div></div>
      <div class="kc"><div class="kch"><span>Payback</span></div><div class="kcb"><div class="kv" id="kPB">18</div><div class="kl">Meses</div></div></div>
      <div class="kc"><div class="kch"><span>Ticket Medio</span></div><div class="kcb"><div class="kv" id="kTK" style="font-size:1.8rem">R$ 14,03</div><div class="kl">Receita Media por Usuario</div></div></div>
    </div>
  </div>
</div>
<div class="pg" id="pg-financeiro">
  <div class="st">Financeiro</div>
  <div class="fin-wrap"><table><thead><tr><th>Ano</th><th>Trimestre</th><th>Mes</th><th class="r">Dia</th><th class="r">Churn</th><th class="r">Novos Usuarios</th><th class="r">Qt Transacoes</th><th class="r">Custo Total</th><th class="r">Custo Total</th><th class="r">Investimento Marketing</th><th class="r">Lucro Operacional</th><th class="r">Margem Operacional %</th><th class="r">Receita Bruta</th></tr></thead><tbody id="fB"></tbody><tfoot><tr id="fF"></tr></tfoot></table></div>
  <div class="card"><div class="ch"><button class="ib">?<div class="tip">Evolucao do custo mensal com linha de tendencia.</div></button>Custo</div><div class="cb"><canvas id="fCC" height="155"></canvas></div></div>
</div>
<div class="pg" id="pg-glossario">
  <div class="gloss-grid">
    <div class="card"><div class="cb">
      <div class="gcat">&#128176; Financeiro</div>
      <table class="gt"><thead><tr><th>Medida</th><th>O que e?</th><th>Como e calculada?</th><th>Referencia Saudavel</th></tr></thead><tbody>
        <tr><td class="med">Receita Bruta</td><td>Total faturado antes de qualquer deducao.</td><td><span class="fml">SUM(vl_receita_bruta)</span></td><td><span class="ref">Crescimento &gt; 5% a.m.</span></td></tr>
        <tr><td class="med">Custo Total</td><td>Soma de todos os custos operacionais.</td><td><span class="fml">SUM(vl_custo)</span></td><td><span class="ref">Crescimento inferior a Receita</span></td></tr>
        <tr><td class="med">Lucro Operacional</td><td>Quanto sobrou apos pagar todos os custos.</td><td><span class="fml">Receita Bruta menos Custo Total</span></td><td><span class="ref">Positivo e crescente</span></td></tr>
        <tr><td class="med">Margem Operacional %</td><td>Percentual do faturamento que se converte em lucro.</td><td><span class="fml">Lucro Operacional / Receita Bruta</span></td><td><span class="ref">&gt; 20%</span></td></tr>
        <tr><td class="med">Ticket Medio</td><td>Receita media por tutor pagante no periodo.</td><td><span class="fml">Receita Liquida / Tutores Pagantes</span></td><td><span class="ref">Crescimento = upsell</span></td></tr>
        <tr><td class="med">Investimento Marketing</td><td>Total investido em marketing e aquisicao.</td><td><span class="fml">SUM(vl_investimento_mkt)</span></td><td><span class="ref">Monitorar com CAC</span></td></tr>
        <tr><td class="med">Receita Liquida</td><td>Receita apos abatimento dos descontos.</td><td><span class="fml">Receita Bruta menos Descontos</span></td><td><span class="ref">Proxima da Receita Bruta</span></td></tr>
        <tr><td class="med">Total Descontos</td><td>Soma de todos os descontos concedidos.</td><td><span class="fml">SUM(vl_desconto)</span></td><td><span class="ref">&lt; 10% da Receita Bruta</span></td></tr>
      </tbody></table>
    </div></div>
    <div class="card"><div class="cb">
      <div class="gcat">&#128200; KPIs Estrategicos</div>
      <table class="gt"><thead><tr><th>Medida</th><th>O que e?</th><th>Como e calculada?</th><th>Referencia Saudavel</th></tr></thead><tbody>
        <tr><td class="med">MRR</td><td>Receita recorrente mensal das assinaturas ativas.</td><td><span class="fml">SOMA de vl_mrr</span></td><td><span class="ref">Crescimento constante</span></td></tr>
        <tr><td class="med">ARR</td><td>Projecao anual do MRR (MRR x 12).</td><td><span class="fml">SOMA de vl_arr</span></td><td><span class="ref">Usado em valuation</span></td></tr>
        <tr><td class="med">CAC</td><td>Custo para conquistar 1 novo tutor.</td><td><span class="fml">Invest. Mkt / Novos Tutores</span></td><td><span class="ref">&lt; 1/3 do LTV</span></td></tr>
        <tr><td class="med">LTV</td><td>Receita total esperada de um tutor.</td><td><span class="fml">MRR / Churn Rate %</span></td><td><span class="ref">LTV &gt; 3x CAC</span></td></tr>
        <tr><td class="med">LTV/CAC Ratio</td><td>Eficiencia da aquisicao de clientes.</td><td><span class="fml">LTV / CAC</span></td><td><span class="ref">Acima de 3x = saudavel</span></td></tr>
        <tr><td class="med">Payback (Meses)</td><td>Meses para recuperar o custo de aquisicao.</td><td><span class="fml">CAC / (MRR / Tutores Pagantes)</span></td><td><span class="ref">&lt; 12 meses</span></td></tr>
        <tr><td class="med">Breakeven (Tutores)</td><td>Minimo de tutores para cobrir todos os custos.</td><td><span class="fml">Custo Total / Ticket Medio</span></td><td><span class="ref">Quanto menor, melhor</span></td></tr>
      </tbody></table>
    </div></div>
    <div class="card"><div class="cb">
      <div class="gcat">&#128101; Usuarios</div>
      <table class="gt"><thead><tr><th>Medida</th><th>O que e?</th><th>Como e calculada?</th><th>Referencia Saudavel</th></tr></thead><tbody>
        <tr><td class="med">Total Tutores</td><td>Todos os tutores cadastrados.</td><td><span class="fml">COUNTROWS(dim_tutor)</span></td><td><span class="ref">Base total crescente</span></td></tr>
        <tr><td class="med">Tutores Pagantes</td><td>Tutores com assinatura ativa e paga.</td><td><span class="fml">fl_pagante = 1</span></td><td><span class="ref">Crescimento constante</span></td></tr>
        <tr><td class="med">Novos Tutores</td><td>Assinaturas novas, excluindo renovacoes.</td><td><span class="fml">fl_renovacao = 0</span></td><td><span class="ref">Crescimento &gt; Churn</span></td></tr>
        <tr><td class="med">Churn</td><td>Tutores que cancelaram a assinatura.</td><td><span class="fml">fl_churn = 1</span></td><td><span class="ref">Menor que Novos Tutores</span></td></tr>
        <tr><td class="med">Churn Rate %</td><td>Percentual da base pagante que saiu.</td><td><span class="fml">Churn / Tutores Pagantes x 100</span></td><td><span class="ref">&lt; 3% ao mes</span></td></tr>
        <tr><td class="med">NPS</td><td>Net Promoter Score — satisfacao dos tutores.</td><td><span class="fml">% Promotores - % Detratores</span></td><td><span class="ref">Acima de 50 = excelente</span></td></tr>
      </tbody></table>
    </div></div>
    <div class="card"><div class="cb">
      <div class="gcat">&#128260; Transacoes</div>
      <table class="gt"><thead><tr><th>Medida</th><th>O que e?</th><th>Como e calculada?</th><th>Referencia Saudavel</th></tr></thead><tbody>
        <tr><td class="med">Qt Transacoes</td><td>Total de transacoes incluindo estornos.</td><td><span class="fml">Contagem de fato_transacoes</span></td><td><span class="ref">Volume total</span></td></tr>
        <tr><td class="med">Qt Transacoes Validas</td><td>Transacoes sem estorno.</td><td><span class="fml">fl_estorno = 0</span></td><td><span class="ref">Proxima de Qt Transacoes</span></td></tr>
        <tr><td class="med">% por Canal</td><td>Share por canal de venda.</td><td><span class="fml">Qt Canal / Qt Total</span></td><td><span class="ref">Diversificacao saudavel</span></td></tr>
        <tr><td class="med">% por Tipo Pagamento</td><td>Share por forma de pagamento.</td><td><span class="fml">Qt Tipo / Qt Total</span></td><td><span class="ref">Diversificacao saudavel</span></td></tr>
      </tbody></table>
    </div></div>
  </div>
</div>
<script>

const KPI=[
  {pag:904,novos:56,churn:24,cus:18786.22,luc:3723.38,ticket:24.9,pay:18,mes:"Set",ano:2024},
  {pag:945,novos:90,churn:15,cus:20013.4,luc:3799.47,ticket:25.2,pay:18,mes:"Out",ano:2024},
  {pag:986,novos:105,churn:17,cus:21184.89,luc:3955.74,ticket:25.5,pay:18,mes:"Nov",ano:2024},
  {pag:1027,novos:65,churn:17,cus:23456.26,luc:3036.64,ticket:25.8,pay:18,mes:"Dez",ano:2024},
  {pag:1068,novos:38,churn:30,cus:25015.74,luc:2853.93,ticket:26.1,pay:18,mes:"Jan",ano:2025},
  {pag:1109,novos:72,churn:36,cus:24372.54,luc:4898.41,ticket:26.39,pay:18,mes:"Fev",ano:2025},
  {pag:1150,novos:41,churn:23,cus:27866.3,luc:2830.42,ticket:26.69,pay:18,mes:"Mar",ano:2025},
  {pag:1191,novos:74,churn:24,cus:26837.41,luc:5309.59,ticket:26.99,pay:18,mes:"Abr",ano:2025},
  {pag:1233,novos:52,churn:31,cus:29706.52,luc:3942.54,ticket:27.29,pay:18,mes:"Mai",ano:2025},
  {pag:1274,novos:85,churn:34,cus:32290.72,luc:2857.92,ticket:27.59,pay:18,mes:"Jun",ano:2025},
  {pag:1315,novos:119,churn:11,cus:31578.3,luc:5094.42,ticket:27.89,pay:18,mes:"Jul",ano:2025},
  {pag:1356,novos:60,churn:15,cus:32476.07,luc:5745.23,ticket:28.19,pay:18,mes:"Ago",ano:2025},
  {pag:1397,novos:67,churn:9,cus:33180.89,luc:6613.49,ticket:28.49,pay:18,mes:"Set",ano:2025},
  {pag:1438,novos:57,churn:36,cus:34413.76,luc:6978.21,ticket:28.78,pay:18,mes:"Out",ano:2025},
  {pag:1479,novos:45,churn:28,cus:36590.63,luc:6423.42,ticket:29.08,pay:18,mes:"Nov",ano:2025},
  {pag:1520,novos:71,churn:31,cus:39205.22,luc:5455.42,ticket:29.38,pay:18,mes:"Dez",ano:2025},
  {pag:1561,novos:94,churn:7,cus:39717.72,luc:6614.01,ticket:29.68,pay:18,mes:"Jan",ano:2026}
];
const FIN=[
  {ano:2024,tri:"T3",mes:"Setembro",churn:124,novos:419,qt:2199,custo:38619.40,mkt:6683.84,lucro:234115.36,margem:85.84,receita:272734.76},
  {ano:2024,tri:"T4",mes:"Outubro",churn:90,novos:346,qt:2655,custo:41749.06,mkt:7743.74,lucro:237936.15,margem:85.07,receita:279685.21},
  {ano:2024,tri:"T4",mes:"Novembro",churn:123,novos:341,qt:1891,custo:37845.88,mkt:6721.65,lucro:247839.67,margem:86.75,receita:285685.55},
  {ano:2024,tri:"T4",mes:"Dezembro",churn:118,novos:467,qt:1985,custo:42210.16,mkt:7566.54,lucro:246633.57,margem:85.39,receita:288843.73},
  {ano:2025,tri:"T1",mes:"Janeiro",churn:112,novos:329,qt:2398,custo:40895.97,mkt:7360.09,lucro:255633.54,margem:86.21,receita:296529.51},
  {ano:2025,tri:"T1",mes:"Fevereiro",churn:112,novos:325,qt:2234,custo:39022.97,mkt:7333.50,lucro:261147.67,margem:87.00,receita:300170.64},
  {ano:2025,tri:"T1",mes:"Marco",churn:92,novos:355,qt:2755,custo:43468.17,mkt:7889.11,lucro:261416.01,margem:85.74,receita:304884.18},
  {ano:2025,tri:"T2",mes:"Abril",churn:93,novos:280,qt:2155,custo:42071.23,mkt:7322.20,lucro:259659.56,margem:86.06,receita:301730.79},
  {ano:2025,tri:"T2",mes:"Maio",churn:83,novos:284,qt:2238,custo:45692.51,mkt:8435.69,lucro:261194.84,margem:85.11,receita:306887.35},
  {ano:2025,tri:"T2",mes:"Junho",churn:107,novos:364,qt:1819,custo:44244.63,mkt:7806.79,lucro:267570.75,margem:85.81,receita:311815.38},
  {ano:2025,tri:"T3",mes:"Julho",churn:112,novos:349,qt:2089,custo:43375.32,mkt:7906.86,lucro:272559.49,margem:86.27,receita:315934.81},
  {ano:2025,tri:"T3",mes:"Agosto",churn:90,novos:375,qt:1820,custo:44994.28,mkt:8188.43,lucro:269875.73,margem:85.71,receita:314870.01},
  {ano:2025,tri:"T3",mes:"Setembro",churn:119,novos:351,qt:2065,custo:45750.82,mkt:7849.19,lucro:274138.22,margem:85.70,receita:319889.04},
  {ano:2025,tri:"T4",mes:"Outubro",churn:116,novos:362,qt:2246,custo:46230.93,mkt:8615.07,lucro:273388.19,margem:85.54,receita:319619.12},
  {ano:2025,tri:"T4",mes:"Novembro",churn:97,novos:270,qt:1730,custo:47889.40,mkt:8557.34,lucro:285142.04,margem:85.62,receita:333031.44},
  {ano:2025,tri:"T4",mes:"Dezembro",churn:126,novos:341,qt:1902,custo:48125.85,mkt:8918.70,lucro:279039.07,margem:85.29,receita:327164.92},
  {ano:2026,tri:"T1",mes:"Janeiro",churn:71,novos:344,qt:2494,custo:44822.81,mkt:7714.77,lucro:290502.88,margem:86.63,receita:335325.69}
];
const TPAY={"Pagamento instantaneo via PIX":311,"Boleto bancario":109,"Link de pagamento direto":109};
const C={t:'#5FC9BF',t2:'#3aada2',t3:'#a8e6e2',o:'#f4a261',n:'#1a3a3a'};
const AC={2024:'#5FC9BF',2025:'#f4a261',2026:'#2a9d8f'};
let CH={};
const fR=v=>'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const fK=v=>v>=1000?(v/1000).toFixed(1)+'K':String(Math.round(v));
const fN=v=>Math.round(v).toLocaleString('pt-BR');
const gy=()=>document.getElementById('yrSel').value;
const ft=a=>{const y=gy();return y==='all'?a:a.filter(d=>d.ano==y)};
function showPg(n,b){
  document.querySelectorAll('.pg').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('pg-'+n).classList.add('active');b.classList.add('active');
  if(n==='financeiro')renderFin();
}
function updKPI(){
  const d=ft(KPI);if(!d.length)return;const l=d[d.length-1];
  document.getElementById('kBK').textContent='41K';
  document.getElementById('kTP').textContent=fN(l.pag);
  document.getElementById('kPB').textContent=l.pay;
  document.getElementById('kTK').textContent='R$ '+l.ticket.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function byYear(arr,field){
  const y=gy();
  if(y!=='all'){const d=ft(arr);return{labels:d.map(r=>r.mes),datasets:[{label:String(y),data:d.map(r=>r[field]),backgroundColor:AC[Number(y)]||C.t,borderRadius:5,borderSkipped:false}]};}
  const ds=[2024,2025,2026].map(a=>{const d=arr.filter(r=>r.ano===a);return d.length?{label:String(a),data:d.map(r=>r[field]),backgroundColor:AC[a],borderRadius:5,borderSkipped:false}:null;}).filter(Boolean);
  const base=arr.filter(r=>r.ano===2024);
  return{labels:base.map(r=>r.mes),datasets:ds};
}
const bOpt=cb=>({responsive:true,plugins:{legend:{display:false}},scales:{y:{ticks:{callback:cb,font:{size:10}},grid:{color:'#eef8f7'}},x:{grid:{display:false},ticks:{font:{size:10}}}}});
function bCusto(){
  const{labels,datasets}=byYear(KPI,'cus');
  if(CH.c)CH.c.destroy();
  CH.c=new Chart(document.getElementById('cC'),{type:'bar',data:{labels,datasets},options:bOpt(v=>'R$'+fK(v))});
  document.getElementById('cL').innerHTML=datasets.map(ds=>'<div class="li"><div class="ld" style="background:'+ds.backgroundColor+'"></div>'+ds.label+'</div>').join('');
}
function bLucro(){
  const{labels,datasets}=byYear(KPI,'luc');
  if(CH.l)CH.l.destroy();
  CH.l=new Chart(document.getElementById('lC'),{type:'bar',data:{labels,datasets},options:bOpt(v=>'R$'+fK(v))});
  document.getElementById('lL').innerHTML=datasets.map(ds=>'<div class="li"><div class="ld" style="background:'+ds.backgroundColor+'"></div>'+ds.label+'</div>').join('');
}
function bTrans(){
  const lbls=Object.keys(TPAY),vals=Object.values(TPAY),tot=vals.reduce((a,b)=>a+b,0),cols=[C.t,C.t2,C.t3];
  if(CH.t)CH.t.destroy();
  CH.t=new Chart(document.getElementById('tC'),{type:'doughnut',data:{labels:lbls,datasets:[{data:vals,backgroundColor:cols,borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,cutout:'62%',plugins:{legend:{display:false}}}});
  document.getElementById('tL').innerHTML=lbls.map(function(l,i){return '<div class="tli"><div class="tdot" style="background:'+cols[i]+'"></div><div><div style="font-weight:700">'+vals[i]+' ('+((vals[i]/tot)*100).toFixed(1)+'%)</div><div style="color:var(--muted);font-size:.68rem">'+l+'</div></div></div>';}).join('');
}
function bDistrib(){
  const d=ft(KPI);const lbls=d.map(r=>r.mes+(gy()==='all'?' '+r.ano:''));
  if(CH.d)CH.d.destroy();
  CH.d=new Chart(document.getElementById('dC'),{type:'bar',data:{labels:lbls,datasets:[{label:'Novos Tutores',data:d.map(r=>r.novos),backgroundColor:C.t,borderRadius:4},{label:'Churn',data:d.map(r=>-r.churn),backgroundColor:C.o,borderRadius:4}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{font:{family:'Sora',size:10}}}},scales:{y:{grid:{color:'#eef8f7'},ticks:{font:{size:10}}},x:{grid:{display:false},ticks:{font:{size:10}}}}}});
}
function renderFin(){
  const d=ft(FIN);let tC=0,tN=0,tQ=0,tCu=0,tM=0,tL=0,tR=0;
  document.getElementById('fB').innerHTML=d.map(function(r){
    tC+=r.churn;tN+=r.novos;tQ+=r.qt;tCu+=r.custo;tM+=r.mkt;tL+=r.lucro;tR+=r.receita;
    return '<tr><td>'+r.ano+'</td><td>'+r.tri+'</td><td>'+r.mes+'</td><td class="r">1</td><td class="r">'+fN(r.churn)+'</td><td class="r">'+fN(r.novos)+'</td><td class="r">'+fN(r.qt)+'</td><td class="r">'+r.custo.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'</td><td class="r">'+fR(r.custo)+'</td><td class="r">'+fR(r.mkt)+'</td><td class="r">'+fR(r.lucro)+'</td><td class="r">'+r.margem.toFixed(2)+'%</td><td class="r">'+fR(r.receita)+'</td></tr>';
  }).join('');
  const avgM=tR?(tL/tR*100).toFixed(2)+'%':'--';
  document.getElementById('fF').innerHTML='<td colspan="3">Total</td><td class="r">--</td><td class="r">'+fN(tC)+'</td><td class="r">'+fN(tN)+'</td><td class="r">'+fN(tQ)+'</td><td class="r">'+tCu.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'</td><td class="r">'+fR(tCu)+'</td><td class="r">'+fR(tM)+'</td><td class="r">'+fR(tL)+'</td><td class="r">'+avgM+'</td><td class="r">'+fR(tR)+'</td>';
  const lbls=d.map(r=>r.mes.substring(0,3)+(gy()==='all'?' '+r.ano:''));
  const cs=d.map(r=>r.custo);
  const tr=cs.map(function(_,i){const s=cs.slice(0,i+1);return s.reduce((a,b)=>a+b,0)/s.length;});
  if(CH.fc)CH.fc.destroy();
  CH.fc=new Chart(document.getElementById('fCC'),{data:{labels:lbls,datasets:[{type:'line',label:'Custo',data:cs,borderColor:C.t,backgroundColor:'rgba(95,201,191,.12)',fill:true,tension:.4,pointRadius:4,pointBackgroundColor:C.t,pointBorderColor:'#fff',pointBorderWidth:2},{type:'line',label:'Tendencia',data:tr,borderColor:C.n,borderDash:[6,4],borderWidth:2,pointRadius:0,fill:false}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{font:{family:'Sora',size:10}}}},scales:{y:{ticks:{callback:v=>'R$'+fK(v),font:{size:10}},grid:{color:'#eef8f7'}},x:{grid:{display:false},ticks:{font:{size:10}}}}}});
}
function rAll(){updKPI();bCusto();bLucro();bTrans();bDistrib();if(document.getElementById('pg-financeiro').classList.contains('active'))renderFin();}
document.getElementById('yrSel').addEventListener('change',rAll);
rAll();

</script>
</body>
</html>`

export async function GET() {
  return new NextResponse(HTML, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
