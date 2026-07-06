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
    .available,.completed,.healthy { color:#8ee7c8; } .watch,.waiting-authorization { color:#ffd166; } .blocked,.failed,.unavailable { color:#ff6b6b; }
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
    <p class="muted">Ce que Poulpe Fiction ne montre pas au client : parcelles, missions, ressources, policy et journal.</p>
    <button id="refresh">Rafraîchir</button>
  </header>
  <section class="grid">
    <article class="card span3"><div class="muted">Parcelles</div><div class="kpi" id="kpi-parcels">-</div></article>
    <article class="card span3"><div class="muted">Missions</div><div class="kpi" id="kpi-missions">-</div></article>
    <article class="card span3"><div class="muted">Autorisations</div><div class="kpi" id="kpi-auth">-</div></article>
    <article class="card span3"><div class="muted">Ressources</div><div class="kpi" id="kpi-resources">-</div></article>
    <article class="card span8"><h2>Brief du poulpe</h2><pre id="brief">Chargement...</pre></article>
    <article class="card span4"><h2>Ressources</h2><div id="resources"></div></article>
    <article class="card span6"><h2>Parcelles</h2><div id="parcels"></div></article>
    <article class="card span6"><h2>Missions</h2><div id="missions"></div></article>
    <article class="card span12"><h2>Journal</h2><div id="events"></div></article>
  </section>
</main>
<script>
const byId = (id) => document.getElementById(id);
const safe = (value) => String(value ?? '').replace(/[&<>]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const statusClass = (value) => String(value || '').replace(/_/g, '-');
function card(title, body, status) {
  return '<div class="item"><div class="row"><strong>' + safe(title) + '</strong><span class="' + statusClass(status) + '">' + safe(status || '') + '</span></div><div class="muted">' + body + '</div></div>';
}
async function loadGarden() {
  const brief = await fetch('/brief').then((res) => res.json());
  const garden = await fetch('/garden').then((res) => res.json());
  const resources = await fetch('/resources').then((res) => res.json());
  const report = garden.lastReport || {};
  const reports = report.reports || [];
  const auth = report.authorizationQueue || [];
  byId('kpi-parcels').textContent = (garden.parcels || []).length;
  byId('kpi-missions').textContent = (garden.missions || []).length;
  byId('kpi-auth').textContent = auth.length;
  byId('kpi-resources').textContent = (resources.resources || []).length;
  byId('brief').textContent = brief.brief || JSON.stringify(brief, null, 2);
  byId('resources').innerHTML = (resources.resources || []).map((r) => card(r.name, 'id: ' + r.id, r.status)).join('') || '<p class="muted">Aucune ressource.</p>';
  byId('parcels').innerHTML = (garden.parcels || []).map((p) => {
    const r = reports.find((item) => item.parcelId === p.id) || {};
    const body = safe(p.objective) + '<br>' + safe((p.notes || []).join(' · ')) + '<br><b>Décision:</b> ' + safe(r.decision || '-') + '<br><b>Action:</b> ' + safe(r.nextAction || '-');
    return card(p.name, body, p.status);
  }).join('') || '<p class="muted">Aucune parcelle.</p>';
  byId('missions').innerHTML = (garden.missions || []).slice().reverse().map((m) => card(m.title, 'parcelle: ' + m.parcelId + ' · ' + new Date(m.updatedAt).toLocaleString(), m.status)).join('') || '<p class="muted">Aucune mission.</p>';
  byId('events').innerHTML = (garden.events || []).slice().reverse().slice(0,20).map((e) => card(e.type, safe(JSON.stringify(e.payload || {})) + '<br>' + new Date(e.timestamp).toLocaleString(), '')).join('') || '<p class="muted">Aucun événement.</p>';
}
byId('refresh').onclick = loadGarden;
loadGarden().catch((err) => { byId('brief').textContent = err.message; });
</script>
</body>
</html>`;
}
