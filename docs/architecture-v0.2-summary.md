# Architecture v0.2 — Synthèse

Cette version clarifie les points issus de l'audit Claude et des discussions suivantes.

## Décisions intégrées

1. Le Guardian devient une loi constitutionnelle.
2. Le Guardian est un système immunitaire, pas un module.
3. Le Conductor est séparé du Coordinator.
4. Le Conductor porte la personnalité utilisateur.
5. Le Coordinator est un runtime sans style.
6. Le Workflow est une partition déclarative versionnée.
7. Le Workflow ne vit pas dans le Coordinator.
8. Chaque module reçoit seulement une tâche locale.
9. L'anatomie du poulpe devient l'analogie humaine officielle.
10. La métaphore reste interdite dans le runtime technique.

## Prochaines décisions attendues

- Schéma minimal d'un Workflow.
- Schéma minimal d'une Module Task.
- Schéma minimal d'une Capability.
- Schéma minimal d'une Policy.
- Stratégie de versionnement.
- Règles de tracing.
- Tests d'architecture pour garantir que les modules s'ignorent.