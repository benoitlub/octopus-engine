# Octopus Engine

> Une intelligence n'a pas vocation à montrer sa complexité. Elle a vocation à simplifier celle des autres.

Octopus Engine est un moteur universel d'orchestration et d'exécution pour des applications modulaires, composables et durables.

Il n'est ni Gérard, ni un chatbot, ni un système multi-agents généraliste. Le Poulpe vivant utilise le moteur ; il ne se confond pas avec lui.

## Statut

Version 0.3 — runtime minimal présent, documentation Core synchronisée avec la Constitution Notion v2.0.

Le dépôt contient désormais un runtime minimal, Guardian, Coordinator, Garden et leurs tests. La documentation décrit à la fois les invariants actifs et les comportements encore à implémenter ; elle ne doit pas faire passer une intention future pour une fonctionnalité déjà disponible.

## Séparation canonique

- **Octopus Engine** orchestre, applique les policies, exécute et trace.
- **Le Poulpe** observe, apprend, joue, rêve et choisit ses explorations.
- **Publisher** observe les sources et produit des Knowledge Packs.
- **Garden** est le read model et le hublot visible ; il montre sans gouverner.
- **Poulpe Fiction** est la cabane de départ des conversations et aventures.
- **Guardian** protège et limite sans décider du métier.

## Principes rapides

- Le Core reste agnostique : la personnalité et le vocabulaire appartiennent aux applications.
- Le Conductor parle aux humains ; le Coordinator parle aux machines.
- Les applications composent Octopus Engine, elles n'en héritent jamais.
- Le Workflow est une partition déclarative versionnée.
- Le Coordinator interprète le Workflow sans logique métier applicative.
- Les modules ignorent l'existence des autres modules.
- Chaque module reçoit seulement sa tâche locale.
- Les capabilities sont versionnées et indépendantes des connecteurs.
- L'Event Bus sert au découplage, aux traces et aux effets secondaires ; les workflows métier restent déterministes.
- Une interface révèle l'activité autonome ; elle ne la déclenche pas.
- Les actions sensibles exigent une validation proportionnée au risque.

## Documents fondateurs

- [MANIFESTO.md](MANIFESTO.md) — pourquoi Octopus existe.
- [CONSTITUTION.md](CONSTITUTION.md) — les lois actives du Core.
- [constitutions/](constitutions/) — responsabilités de Publisher, Garden, Poulpe Fiction, Gérard et Blacklace.
- [BIBLE.md](BIBLE.md) — synthèse vivante du projet.
- [ADR/](ADR/) — décisions d'architecture.
- [docs/](docs/) — spécifications, état d'implémentation et notes de conception.

## Lire dans le bon ordre

1. [CONSTITUTION.md](CONSTITUTION.md)
2. [docs/readme-map.md](docs/readme-map.md)
3. [docs/architecture-v0.2-summary.md](docs/architecture-v0.2-summary.md)
4. [docs/glossary.md](docs/glossary.md)
5. [constitutions/](constitutions/)

## Discipline documentaire

Une évolution suit le cycle :

Discussion → ADR → Constitution si invariant → documentation technique → code → tests.

GitHub est la source technique durable. Notion est la synthèse vivante. Toute divergence détectée doit être corrigée dans les deux sens.
