# ADR-0002 — Workflow explicite plutôt qu'Event Bus central

## Statut

Accepté — v0.1.

## Contexte

Les premières discussions imaginaient un Event Bus au centre de la coordination entre modules.

Les revues Claude et Gemini ont souligné un risque majeur : combiner non-déterminisme des LLM et orchestration asynchrone rend le système difficile à reproduire, tester et déboguer.

## Décision

Le flux principal d'une mission est piloté par un workflow explicite, déterministe et contrôlé par le Coordinateur.

L'Event Bus n'est pas supprimé, mais il est destitué du flux métier principal.

Il sert à :

- logs ;
- audit ;
- télémétrie ;
- notifications ;
- effets secondaires non critiques ;
- observation du système.

## Conséquences

- Les missions sont plus faciles à rejouer.
- Le tracing devient plus fiable.
- Les modules restent indépendants sans créer un chaos pub/sub.
- Le Coordinateur reste responsable du graphe d'exécution.

## Alternatives rejetées

### Event Bus pur

Rejeté : risque d'indéterminisme systémique et de debugging impossible.

### Appels directs entre modules

Rejeté : couplage fort et violation des lois du moteur.

### Workflow hardcodé par application

Rejeté : perte de généricité et multiplication d'exceptions.