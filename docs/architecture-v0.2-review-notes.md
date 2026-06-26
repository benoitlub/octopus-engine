# Notes de revue v0.2

Cette version répond aux points principaux de l'audit Claude.

## Guardian

Problème : Guardian était décrit mais non contraint par la Constitution.

Réponse : Loi XIV + ADR-0005 + docs/guardian.md.

## Workflow

Problème : on ne savait pas où vivait le graphe d'exécution.

Réponse : ADR-0004. Le workflow devient objet déclaratif de première classe.

## Runtime

Problème : Runtime était cité mais non défini.

Réponse : docs/architecture.md + docs/runtime.md + glossary.

## Conductor / Coordinator

Problème : confusion possible entre l'interface utilisateur et le runtime.

Réponse : ADR-0006 + docs/conductor.md.

## Anatomie

Problème : la métaphore devait rester claire sans contaminer le code.

Réponse : docs/anatomy.md + rappel dans BIBLE.md.

## Prochaine revue

Porter l'attention sur les schémas minimaux : workflow, module task, capability, policy, trace.