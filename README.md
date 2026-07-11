# Octopus Engine

> Une intelligence n'a pas vocation à montrer sa complexité. Elle a vocation à simplifier celle des autres.

Octopus Engine est un moteur commun pour construire des assistants IA modulaires, composables et durables.

Ce dépôt commence volontairement par la documentation fondatrice. Aucune ligne de runtime métier ne doit être ajoutée avant validation des principes, des ADR et des contrats d'interface.

## Statut

Version 0.2 — architecture documentaire consolidée.

## Principes rapides

- Le moteur reste agnostique : la personnalité appartient aux applications.
- Le Conductor parle aux humains ; le Coordinator parle aux machines.
- Les applications composent Octopus, elles n'en héritent jamais.
- Le Workflow est une partition déclarative versionnée.
- Le Coordinator interprète le Workflow, sans logique métier applicative.
- Les modules ignorent l'existence des autres modules.
- Chaque module reçoit seulement sa tâche locale.
- Les capacités sont versionnées et indépendantes des connecteurs.
- Le Guardian protège, limite ou bloque si nécessaire, mais ne décide jamais du métier.
- Les métaphores aident à penser le système, elles ne dictent jamais le code.

## Documents fondateurs

- [MANIFESTO.md](MANIFESTO.md) — pourquoi Octopus existe.
- [CONSTITUTION.md](CONSTITUTION.md) — les lois non négociables.
- [constitutions/](constitutions/) — séparation des responsabilités documentaires.
- [BIBLE.md](BIBLE.md) — synthèse vivante du projet.
- [ADR/](ADR/) — décisions d'architecture.
- [docs/](docs/) — spécifications et notes de conception.

## Lire dans le bon ordre

- [docs/readme-map.md](docs/readme-map.md) — carte de lecture.
- [docs/architecture-v0.2-summary.md](docs/architecture-v0.2-summary.md) — synthèse de la version actuelle.
- [docs/glossary.md](docs/glossary.md) — définitions canoniques.

## Règle de départ

Documentation d'abord. Code ensuite.

Le but n'est pas de créer un framework spectaculaire, mais un socle stable, élégant et réutilisable pour Blacklace Publisher, Clochette Lite, Creature-Sync, Blacklace Echo et les futurs projets.
