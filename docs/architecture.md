# Architecture Octopus Engine

## Vue logique

```text
Application
  ↓
Gateway / Tenant Context
  ↓
Conductor / Persona
  ↓
Mission
  ↓
Workflow déclaratif
  ↓
Coordinator Runtime
  ↓
Module Tasks
  ↓
Modules
  ↓
Capabilities
  ↓
Connectors
  ↓
External Systems
```

## Engine vs Runtime

**Octopus Engine** désigne le code partagé, les contrats, les schémas, les lois, les ADR et les composants réutilisables.

**Octopus Runtime** désigne une instance d'exécution du moteur dans un contexte donné : une application, un tenant, des policies, des credentials, une mémoire cloisonnée et des workflows disponibles.

Le moteur est la mécanique commune. Le runtime est le moteur en train de fonctionner pour un contexte précis.

## Gateway

La Gateway reçoit les demandes, identifie l'application, applique le contexte tenant, les permissions, les budgets et les policies.

Elle contrôle ce qui entre et ce qui sort.

## Conductor / Persona

Le Conductor est l'interface vivante présentée à l'utilisateur.

Il comprend la demande, conserve le ton de l'application, reformule si nécessaire et expose une réponse claire.

Il appartient à l'expérience utilisateur, pas au runtime technique.

## Mission

La mission est l'objectif exprimé par l'utilisateur ou par une policy autorisée.

Une même mission peut être réalisée par plusieurs workflows selon le contexte, le budget, le niveau de détail, les permissions ou les outils disponibles.

## Workflow

Le workflow décrit le graphe d'exécution d'une mission.

Il est un objet déclaratif, versionné, observable et rejouable.

Il ne vit pas dans le Coordinateur. Le Coordinateur sait l'interpréter.

Le workflow global agit comme une partition complète : il décrit les étapes, les dépendances, les conditions, les entrées, les sorties attendues et les modules ou capacités requis.

## Module Tasks

Un module ne reçoit jamais le workflow complet.

Il reçoit une tâche locale : sa portion de partition.

Cette tâche contient uniquement ce dont il a besoin : inputs, contraintes, budget local, capacité attendue et format de sortie.

## Coordinator Runtime

Le Coordinateur orchestre une mission en interprétant un workflow déclaratif.

Il appelle les modules nécessaires, attend leurs résultats, applique le rythme du workflow, gère les transitions et agrège les sorties.

Il ne contient pas de logique métier spécifique à une application.

Il ne choisit pas le style de réponse : cela appartient au Conductor / Persona.

## Modules

Les modules sont spécialisés et passifs du point de vue de l'orchestration.

Ils reçoivent des inputs, produisent des outputs, et ne décident pas du prochain module à appeler.

Ils disposent d'une autonomie d'exécution locale, jamais d'une autonomie stratégique.

## Capabilities

Les capacités sont des contrats versionnés.

Elles décrivent ce qui peut être fait, indépendamment du provider réel.

Une capacité est comparable à une compétence disponible dans l'organisme, pas à un outil concret.

## Connectors

Les connecteurs donnent accès aux systèmes externes.

Ils ne contiennent pas de logique métier.

Ils sont les points de contact avec l'environnement : API, fichiers, bases, services, providers IA.

## Event Bus

L'Event Bus est réservé à l'audit, au tracing, à la télémétrie, aux notifications, aux événements internes, au découplage et aux effets secondaires non critiques.

Il ne pilote pas le flux principal d'une mission utilisateur.

Les workflows métier restent déterministes.

## Guardian

Guardian n'est pas une tentacule.

Il désigne un ensemble de middlewares, policies et contrôles intégrés au runtime : quotas, circuit breakers, coût, sécurité, erreurs, hallucinations, latence.

Il protège, limite, isole ou bloque si nécessaire, mais ne décide jamais des objectifs métier.
