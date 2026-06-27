# Implementation Freeze

Le gel d'implémentation initial a été levé pour le runtime V1.

## Statut

Runtime V1 autorisé et intégré.

## Contrats couverts par V1

- `WorkflowDefinition` ;
- `WorkflowStep` ;
- `ModuleTask` ;
- `Capability` ;
- `UserIntent` ;
- `MissionDefinition` ;
- `CoordinatorResult` ;
- `PlanResult`.

## Composants couverts par V1

- `Coordinator` ;
- `Guardian` niveau Limiter ;
- `defineModule` ;
- tests de frontières Guardian / Coordinator.

## Ce qui reste gelé

Pas d'implémentation avancée avant ADR ou spécification :

- policies complètes ;
- traces persistantes ;
- replay complet ;
- connecteurs réels ;
- providers IA ;
- mémoire persistante ;
- multi-tenant complet.

## Pourquoi

Le but reste d'éviter qu'une première implémentation accidentelle devienne l'architecture réelle.

Le poulpe sait maintenant où sont ses premiers bras, mais il ne doit pas encore jouer de la batterie avec les huit.
