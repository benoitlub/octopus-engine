# Architecture Octopus Engine

## Vue logique

```text
Application
  ↓
Gateway / Tenant Context
  ↓
Coordinator
  ↓
Workflow explicite
  ↓
Modules
  ↓
Capabilities
  ↓
Connectors
  ↓
External Systems
```

## Gateway

La Gateway reçoit les demandes, identifie l'application, applique le contexte tenant, les permissions, les budgets et les policies.

## Coordinator

Le Coordinateur orchestre une mission.

Il choisit un workflow, appelle les modules nécessaires, agrège les résultats et produit une réponse exploitable.

Il ne contient pas de logique métier spécifique à une application.

## Workflow

Le workflow décrit le graphe d'exécution d'une mission.

Il doit être explicite, observable et rejouable.

## Modules

Les modules sont spécialisés et passifs du point de vue de l'orchestration.

Ils reçoivent des inputs, produisent des outputs, et ne décident pas du prochain module à appeler.

## Capabilities

Les capacités sont des contrats versionnés.

Elles décrivent ce qui peut être fait, indépendamment du provider réel.

## Connectors

Les connecteurs donnent accès aux systèmes externes.

Ils ne contiennent pas de logique métier.

## Event Bus

L'Event Bus est réservé à l'audit, au tracing, aux notifications et aux effets secondaires non critiques.

Il ne pilote pas le flux principal.

## Guardian

Guardian n'est pas une tentacule.

Il désigne un ensemble de middlewares, policies et contrôles intégrés au runtime : quotas, circuit breakers, coût, sécurité, erreurs, hallucinations, latence.