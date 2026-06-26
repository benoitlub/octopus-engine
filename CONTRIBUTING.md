# Contributing

Octopus Engine commence par la documentation.

Avant toute implémentation, une contribution doit respecter :

- la Constitution ;
- les ADR ;
- la séparation Engine / Runtime / Policies ;
- la séparation Conductor / Coordinator ;
- l'indépendance des modules ;
- l'interdiction des métaphores inutiles dans le code.

## Ajouter une idée

Toute idée structurante doit répondre à deux questions :

1. Quelle complexité supprime-t-elle ou simplifie-t-elle ?
2. Faut-il une ADR ?

## Ajouter du code

Pas de code métier avant validation du schéma minimal de :

- Workflow ;
- Module Task ;
- Capability ;
- Policy ;
- Trace.

## Règle du jardin

Un ajout qui ne peut pas être retiré proprement ne doit pas entrer dans le moteur.