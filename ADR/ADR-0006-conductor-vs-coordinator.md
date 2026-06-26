# ADR-0006 — Séparer Conductor et Coordinator

## Statut

Accepté — v0.2.

## Contexte

Les discussions ont fait apparaître une confusion entre deux rôles :

- l'interface visible qui parle à l'utilisateur ;
- le mécanisme technique qui exécute un workflow.

Si ces rôles sont mélangés, le Coordinateur risque de porter de la personnalité, du style, de la logique produit ou des choix d'application.

## Décision

Octopus Engine distingue :

- **Conductor / Persona** : interface vivante, ton, reformulation, relation utilisateur ;
- **Coordinator Runtime** : exécution technique du workflow.

Le Conductor comprend la demande et présente la réponse.

Le Coordinator interprète un workflow déclaratif et orchestre les modules.

Le Coordinator ne porte aucun style, aucune personnalité et aucune identité utilisateur.

## Conséquences

- Le moteur reste agnostique.
- Les applications peuvent fournir leur propre visage : Clochette, Naturalist, Publisher, Octopus Gentleman ou autre.
- Le Coordinator reste testable, sobre et indépendant de l'expérience utilisateur.
- La personnalité devient une couche injectable par application.

## Alternatives rejetées

### Le Coordinator comme interlocuteur utilisateur

Rejeté : mélange de runtime et d'expérience utilisateur.

### Une persona unique imposée par le moteur

Rejeté : incompatible avec un moteur réutilisable par plusieurs applications.