export function renderGardenerPage(): string {
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Octopus Engine · Diagnostics</title>
  <style>
    body { margin:0; font-family:system-ui,sans-serif; background:#071015; color:#ecf7ff; }
    main { max-width:980px; margin:0 auto; padding:28px; }
    h1 { margin:0 0 8px; font-size:34px; }
    h2 { margin-top:0; }
    .muted { color:#8aa3b5; }
    .grid { display:grid; grid-template-columns:repeat(12,1fr); gap:14px; margin-top:22px; }
    .card { background:#101b24; border:1px solid #203341; border-radius:18px; padding:18px; }
    .span4 { grid-column:span 4; }
    .span6 { grid-column:span 6; }
    .span12 { grid-column:span 12; }
    .kpi { font-size:28px; font-weight:800; }
    .item { padding:12px; border-radius:14px; background:#0b141c; border:1px solid #1d2f3e; margin:8px 0; }
    .row { display:flex; justify-content:space-between; gap:12px; }
    .available,.alive,.success { color:#8ee7c8; }
    .unavailable,.error,.failed { color:#ff6b6b; }
    button { border:0; border-radius:12px; padding:10px 14px; background:#65d8b4; color:#061015; font-weight:800; cursor:pointer; }
    code,pre { font-family:ui-monospace,SFMono-Regular,Consolas,monospace; }
    pre { white-space:pre-wrap; word-break:break-word; background:#071015; border:1px solid #203341; border-radius:14px; padding:12px; overflow:auto; }
    @media(max-width:760px){ .span4,.span6{ grid-column:span 12; } main{padding:20px;} h1{font-size:30px;} }
  </style>
</head>
<body>
<main>
  <header>
    <p class="muted">Console technique en lecture seule</p>
    <h1>Octopus Engine · Diagnostics</h1>
    <p class="muted">État du moteur neutre, de ses ressources et de son contrat d’exécution. Le Garden appartient désormais à Poulpe Fiction.</p>
    <button id="refresh">Rafraîchir</button>
  </header>

  <section class="grid">
    <article class="card span4"><div class="muted">Moteur</div><div class="kpi" id="engine-status">-</div></article>
    <article class="card span4"><div class="muted">Ressources</div><div class="kpi" id="resource-count">-</div></article>
    <article class="card span4"><div class="muted">Contrat</div><div class="kpi">neutral-execution-v1</div></article>

    <article class="card span6">
      <h2>Ressources disponibles</h2>
      <div id="resources">Chargement…</div>
    </article>

    <article class="card span6">
      <h2>Frontière d’architecture</h2>
      <div class="item">
        <strong>Octopus Engine</strong>
        <p class="muted">Exécute des opérations neutres. Il ne possède ni parcelles, ni Seeds, ni récoltes visibles.</p>
      </div>
      <div class="item">
        <strong>Poulpe Fiction</strong>
        <p class="muted">Possède le Garden, Gérard, les parcelles et les récoltes.</p>
      </div>
      <div class="item">
        <strong>Blacklace Publisher</strong>
        <p class="muted">Fournit les Knowledge Packs, Tool Packs, connexions et routes techniques.</p>
      </div>
    </article>

    <article class="card span12">
      <h2>Contrat accepté par <code>POST /mission</code></h2>
      <pre>{
  "operationId": "operation-123",
  "context": { "id": "context-1", "label": "Contexte" },
  "requiredCapabilities": ["campaign.generate"],
  "authorizedResources": ["mistral"],
  "prompt": "…"
}</pre>
    </article>
  </section>
</main>
<script>
const byId = (id) => document.getElementById(id);
const safe = (value) => String(value ?? '').replace(/[&<>]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function card(title, body, status) {
  return '<div class="item"><div class="row"><strong>' + safe(title) + '</strong><span class="' + safe(status || '') + '">' + safe(status || '') + '</span></div><div class="muted">' + body + '</div></div>';
}
async function loadDiagnostics() {
  const health = await fetch('/health').then((res) => res.json());
  const list = health.resources?.resources || [];
  byId('engine-status').textContent = health.status || 'unknown';
  byId('resource-count').textContent = list.length;
  byId('resources').innerHTML = list.map((resource) => card(resource.name, 'id: ' + safe(resource.id), resource.status)).join('') || '<p class="muted">Aucune ressource déclarée.</p>';
}
byId('refresh').onclick = loadDiagnostics;
loadDiagnostics().catch((error) => {
  byId('engine-status').textContent = 'error';
  byId('resources').innerHTML = '<p class="unavailable">' + safe(error.message) + '</p>';
});
</script>
</body>
</html>`;
}
