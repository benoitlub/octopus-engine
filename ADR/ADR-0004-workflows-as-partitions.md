# ADR-0004 — Les workflows sont des partitions déclaratives

## Statut

Accepté — v0.2.

## Contexte

Les revues d'architecture ont identifié une zone grise : si les modules ne se connaissent jamais et si le flux principal n'est pas piloté par Event Bus, quelqu'un doit tout de même connaître l'ordre d'exécution d'une mission.

Le risque serait que cette connaissance vive implicitement dans le Coordinateur, qui deviendrait progressivement un God Object.

## Décision

Un workflow est un objet de première classe.

Il est déclaratif, versionné, observable et rejouable.

Le Coordinateur ne contient pas la connaissance métier des applications. Il interprète un workflow.

Le workflow global est comparable à une partition complète : il décrit les étapes, dépendances, conditions, entrées, sorties attendues, capacités requises et transitions.

Chaque module ne reçoit jamais la partition complète. Il reçoit uniquement sa tâche locale : la portion de travail qui le concerne.

## Modèle conceptuel

```text
Utilisateur
  ↓
Conductor / Persona
  ↓
Mission
  ↓
Workflow déclaratif
  ↓
Coordinator Runtime
  ↓
Module Task
  ↓
Module
```

## Conséquences

- Le Coordinateur reste maigre.
- Les applications peuvent ajouter de nouveaux workflows sans modifier le runtime.
- Les modules restent indépendants.
- Les missions deviennent rejouables et testables.
- Une même mission peut être exécutée par plusieurs workflows selon les policies : rapide, économique, approfondi, premium, mobile, batch.

## Alternatives rejetées

### Workflow codé dans le Coordinateur

Rejeté : le Coordinateur grossirait à chaque application.

### Modules qui déclenchent d'autres modules

Rejeté : violation de la règle d'indépendance des modules.

### Event Bus comme orchestration principale

Rejeté : trop difficile à rejouer, tester et déboguer avec des systèmes probabilistes.

## Points ouverts

- Définir le schéma minimal d'un workflow.
- Définir le schéma minimal d'une tâche locale de module.
- Définir la stratégie de versionnement des workflows.
- Définir comment une mission choisit un workflow selon les policies disponibles.