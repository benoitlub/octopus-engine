# Sécurité

La sécurité d'Octopus Engine repose sur plusieurs couches.

## Gateway

Contrôle les entrées, permissions, tenants et credentials.

## Policies

Définissent les budgets, seuils, validations et restrictions applicables.

## Guardian

Observe, alerte, limite, isole, suspend ou bloque selon les risques.

## Memory isolation

Aucune mémoire ne traverse les frontières d'une application sans décision explicite.

## Connectors

Les connecteurs doivent être bridés par les permissions et ne doivent pas exposer de logique métier.

## Tracing

Les traces doivent permettre le diagnostic sans créer une fuite de données.

## Principe

La sécurité est une propriété du runtime, pas un module optionnel.