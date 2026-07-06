export function renderGardenerPage(): string {
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Octopus Garden</title>
  <style>
    body { margin:0; font-family: system-ui, sans-serif; background:#071015; color:#ecf7ff; }
    main { max-width:1100px; margin:0 auto; padding:28px; }
    h1 { margin:0 0 8px; font-size:34px; }
    .muted { color:#8aa3b5; }
    .grid { display:grid; grid-template-columns: repeat(12, 1fr); gap:14px; }
    .card { background:#101b24; border:1px solid #203341; border-radius:18px; padding:18px; }
    .span3 { grid-column: span 3; } .span4 { grid-column: span 4; } .span6 { grid-column: span 6; } .span8 { grid-column: span 8; } .span12 { grid-column: span 12; }
    .kpi { font-size:32px; font-weight:800; }
    .item { padding:12px; border-radius:14px; background:#0b141c; border:1px solid #1d2f3e; margin:8px 0; }
    .row { display:flex; justify-content:space-between; gap:12px; }
    .available,.completed,.healthy,.success { color:#8ee7c8; } .watch,.waiting-authorization { color:#ffd166; } .blocked,.failed,.unavailable,.error { color:#ff6b6b; }
    button { border:0; border-radius:12px; padding:10px 14px; background:#65d8b4; color:#061015; font-weight:800; cursor:pointer; }
    pre { white-space:pre-wrap; word-break:break-word; background:#071015; border:1px solid #203341; border-radius:14px; padding:12px; max-height:360px; overflow:auto; }
    @media(max-width:850px){ .span3,.span4,.span6,.span8{ grid-column:span 12; } }
  </style>
</head>
<body>
<main>
  <header>
    <p class="muted">Console jardinier</p>
    <h1>Octopus Engine Garden</h1>
    <p class="muted">Ce que Poulpe Fiction ne montre pas au client : parcelles, missions, ressources, policy, coûts et journal réel.</p>
    <button id="refresh">Rafraîchir</button>
  </header>
  <section class="grid">
    <article class="card span3"><div class="muted">Parcelles</div><div class="kpi" id="kpi-parcels">-</div></article>
    <article class="card span3"><div class="muted">Missions</div><div class="kpi" id="kpi-missions">-</div></article>
    <article class="card span3"><div class="muted">Tokens</div><div class="kpi" id="kpi-tokens">-</div></article>
    <article class="card span3"><div class="muted">Coût estimé</div><div class="kpi" id="kpi-cost">-</div></article>
    <article class="card span8"><h2>Brief du poulpe</h2><pre id="brief">Chargement...</pre></article>
    <article class="card span4"><h2>Ressources</h2><div id="resources"></div></article>
    <article class="card span6"><h2>Parcelles</h2><div id="parcels"></div></article>
    <article class="card span6"><h2>Missions</h2><div id="missions"></div></article>
    <article class="card span6"><h2>Consommation réelle</h2><div id="usage"></div></article>
    <article class="card span6"><h2>Récoltes</h2><div id="harvests"></div></article>
    <article class="card span12"><h2>Journal</h2><div id="events"></div></article>
  </section>
</main>
<script>
const byId = (id) => document.getElementById(id);
const safe = (value) => String(value ?? '').replace(/[&<>]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const statusClass = (value) => String(value || '').replace(/_/g, '-');
function euro(value) { return typeof value === 'number' ? value.toFixed(4) + ' €' : '-'; }
function card(title, body, status) {
  return '<div class="item"><div class="row"><strong>' + safe(title) + '</strong><span class="' + statusClass(status) + '">' + safe(status || '') + '</span></div><div class="muted">' + body + '</div></div>';
}
async function loadGarden() {
  const brief = await fetch('/brief').then((res) => res.json());
  const garden = await fetch('/garden').then((res) => res.json());
  const resources = await fetch('/resources').then((res) => res.json());
  const report = garden.lastReport || {};
  const reports = report.reports || [];
  const usage = garden.resourceUsage || [];
  const totalTokens = usage.reduce((sum, item) => sum + (item.usage?.totalTokens || 0), 0);
  const totalCost = usage.reduce((sum, item) => sum + (item.usage?.estimatedCostEur || 0), 0);
  byId('kpi-parcels').textContent = (garden.parcels || []).length;
  byId('kpi-missions').textContent = (garden.missions || []).length;
  byId('kpi-tokens').textContent = totalTokens || 0;
  byId('kpi-cost').textContent = euro(totalCost);
  byId('brief').textContent = brief.brief || JSON.stringify(brief, null, 2);
  byId('resources').innerHTML = (resources.resources || []).map((r) => card(r.name, 'id: ' + r.id, r.status)).join('') || '<p class="muted">Aucune ressource.</p>';
  byId('parcels').innerHTML = (garden.parcels || []).map((p) => {
    const r = reports.find((item) => item.parcelId === p.id) || {};
    const body = safe(p.objective) + '<br>' + safe((p.notes || []).join(' · ')) + '<br><b>Décision:</b> ' + safe(r.decision || '-') + '<br><b>Action:</b> ' + safe(r.nextAction || '-');
    return card(p.name, body, p.status);
  }).join('') || '<p class="muted">Aucune parcelle.</p>';
  byId('missions').innerHTML = (garden.missions || []).slice().reverse().map((m) => card(m.title, 'parcelle: ' + m.parcelId + ' · ' + new Date(m.updatedAt).toLocaleString(), m.status)).join('') || '<p class="muted">Aucune mission.</p>';
  byId('usage').innerHTML = usage.slice().reverse().map((u) => {
    const details = 'mission: ' + u.missionId + '<br>modèle: ' + safe(u.usage?.model || '-') + '<br>tokens: ' + safe(u.usage?.totalTokens || 0) + ' · prompt: ' + safe(u.usage?.promptTokens || 0) + ' · réponse: ' + safe(u.usage?.completionTokens || 0) + '<br>durée: ' + safe(u.usage?.durationMs || '-') + ' ms · coût: ' + euro(u.usage?.estimatedCostEur);
    return card(u.resourceId, details, u.status);
  }).join('') || '<p class="muted">Aucune consommation réelle enregistrée.</p>';
  byId('harvests').innerHTML = (garden.harvests || []).slice().reverse().map((h) => card(h.title, safe(h.preview) + '<br>' + new Date(h.createdAt).toLocaleString(), 'completed')).join('') || '<p class="muted">Aucune récolte.</p>';
  byId('events').innerHTML = (garden.events || []).slice().reverse().slice(0,30).map((e) => card(e.type, safe(JSON.stringify(e.payload || {})) + '<br>' + new Date(e.timestamp).toLocaleString(), '')).join('') || '<p class="muted">Aucun événement.</p>';
}
byId('refresh').onclick = loadGarden;
loadGarden().catch((err) => { byId('brief').textContent = err.message; });
</script>
</body>
</html>`;
}
