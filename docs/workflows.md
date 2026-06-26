# Workflows

Un workflow est une partition déclarative.

Il décrit comment réaliser une mission sans que le Coordinateur porte la connaissance métier dans son propre code.

## Mission

La mission est l'objectif exprimé par l'utilisateur ou déclenché par une policy autorisée.

Exemples :

- trouver des prospects ;
- résumer une base Notion ;
- préparer une publication ;
- analyser des performances ;
- générer un brouillon.

## Workflow global

Le workflow global décrit la mission complète.

Il contient :

- les étapes ;
- les dépendances ;
- les conditions ;
- les capacités requises ;
- les contraintes ;
- les entrées ;
- les sorties attendues ;
- les erreurs possibles.

## Tâches locales

Le workflow global est découpé en tâches locales.

Chaque module ne reçoit que sa tâche locale.

Cela garantit que :

- les modules ne connaissent pas les autres modules ;
- les modules n'ont pas besoin de connaître le workflow complet ;
- le Coordinateur garde le contrôle de l'enchaînement ;
- les tâches restent testables individuellement.

## Coordinateur

Le Coordinateur lit le workflow.

Il donne le départ aux modules concernés, attend les sorties, applique les transitions et respecte les contraintes de la mission.

Il ne compose pas la partition.

## Policies

Les policies peuvent influencer le choix du workflow.

Une même mission peut utiliser plusieurs workflows :

- rapide ;
- économique ;
- approfondi ;
- premium ;
- mobile ;
- batch ;
- sécurisé.

## Points à définir

- schéma minimal d'un workflow ;
- schéma minimal d'une tâche locale ;
- versionnement des workflows ;
- validation des workflows ;
- tracing d'une exécution ;
- stratégie de sélection selon policies.