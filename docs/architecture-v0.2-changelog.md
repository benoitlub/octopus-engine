# Changelog Architecture v0.2

## Date

2026-06-26

## Résumé

Cristallisation des décisions issues de l'audit Claude et de la discussion sur l'analogie anatomique.

## Ajouts

- Loi XIV : Guardian comme système immunitaire.
- ADR-0004 : workflows comme partitions déclaratives.
- ADR-0005 : Guardian comme système immunitaire.
- ADR-0006 : séparation Conductor / Coordinator.
- docs/anatomy.md : analogie anatomique officielle.
- docs/workflows.md : modèle de workflow et tâches locales.
- docs/guardian.md : niveaux de réaction du Guardian.
- docs/conductor.md : rôle de la persona visible.
- docs/module-tasks.md : portion locale remise aux modules.
- docs/glossary.md : définitions canoniques.
- docs/testing-boundaries.md : tests de frontières architecturales.
- CODE_OF_CONDUCT.md : culture de revue.
- CONTRIBUTING.md : règle de contribution.
- LICENSE provisoire.

## Clarifications

- Le Coordinateur ne porte aucun style.
- Le Conductor porte la personnalité.
- Le Workflow ne vit pas dans le Coordinateur.
- Les modules ne reçoivent jamais le workflow complet.
- Les métaphores restent dans la Bible et les docs humaines, pas dans le runtime.

## À faire ensuite

- Schéma minimal de Workflow.
- Schéma minimal de Module Task.
- Schéma minimal de Capability.
- Schéma minimal de Policy.
- Tracing minimal.
- Tests de frontières automatisés.