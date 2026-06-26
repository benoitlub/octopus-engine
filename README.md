# Octopus Engine

> Une intelligence n'a pas vocation à montrer sa complexité. Elle a vocation à simplifier celle des autres.

Octopus Engine est un moteur commun pour construire des assistants IA modulaires, composables et durables.

Ce dépôt commence volontairement par la documentation fondatrice. Aucune ligne de runtime métier ne doit être ajoutée avant validation des principes, des ADR et des contrats d'interface.

## Statut

Version 0.1 — fondations documentaires.

## Principes rapides

- Le moteur reste agnostique : la personnalité appartient aux applications.
- Les applications composent Octopus, elles n'en héritent jamais.
- Le Coordinateur orchestre, il n'exécute pas.
- Les modules ignorent l'existence des autres modules.
- Les capacités sont versionnées et indépendantes des connecteurs.
- Les métaphores aident à penser le système, elles ne dictent jamais le code.

## Documents fondateurs

- [MANIFESTO.md](MANIFESTO.md) — pourquoi Octopus existe.
- [CONSTITUTION.md](CONSTITUTION.md) — les lois non négociables.
- [BIBLE.md](BIBLE.md) — synthèse vivante du projet.
- [ADR/](ADR/) — décisions d'architecture.
- [docs/](docs/) — spécifications et notes de conception.

## Règle de départ

Documentation d'abord. Code ensuite.

Le but n'est pas de créer un framework spectaculaire, mais un socle stable, élégant et réutilisable pour Blacklace Publisher, Clochette Lite, Creature-Sync, Blacklace Echo et les futurs projets.