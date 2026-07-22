# GitHub Runtime — source de vérité

## Décision d’architecture

Render est abandonné pour le runtime Blacklace.

Le runtime de référence s’exécute dans GitHub Actions :

- Octopus Engine est lancé localement dans le runner ;
- Blacklace Publisher est lancé localement dans le même runner ;
- PostgreSQL est fourni comme service temporaire du job ;
- le schéma Publisher est initialisé dans le runner ;
- les récoltes sont publiées dans Notion et le Garden Feed est écrit dans GitHub ;
- Poulpe Fiction et Publisher Web sont publiés via GitHub Pages.

## Workflows critiques — ne pas supprimer

Les workflows suivants remplacent l’ancien hébergement Render et constituent le runtime :

- `.github/workflows/poulpe-runtime.yml`
- les workflows GitHub Pages de Poulpe Fiction ;
- les workflows GitHub Pages de Blacklace Publisher.

Supprimer ces workflows revient à supprimer le nouveau runtime.

## Secrets GitHub attendus

- `MISTRAL_API_KEY`
- `COMPOSIO_API_KEY`
- `NOTION_API_KEY` ou ses alias historiques
- `NOTION_PAGE_ID`

Les secrets d’hébergement Render et les URL Render ne font pas partie de l’architecture cible.

## Nettoyage Render

Après validation d’un run GitHub réussi et d’une récolte Notion accessible, les anciennes ressources Render peuvent être supprimées :

- `blacklace-publisher-api`
- `blacklace-publisher-web`
- `blacklace-publisher-db`
- l’ancien service Poulpe Fiction

Aucune nouvelle modification ne doit réintroduire une URL `onrender.com`, un manifeste `render.yaml` ou une dépendance à un service Render.
