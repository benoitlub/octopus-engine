# Tests de frontières

Les tests les plus importants d'Octopus Engine ne sont pas seulement des tests unitaires.

Ce sont des tests de frontières architecturales.

## Frontières à vérifier

### Modules

Un module ne doit jamais importer, référencer ou appeler un autre module directement.

### Connecteurs

Un module ne doit jamais appeler directement un connecteur.

Il doit passer par une Capability.

### Coordinator

Le Coordinator ne doit contenir aucune logique métier spécifique à une application.

### Guardian

Guardian peut bloquer ou limiter, mais ne doit pas produire de stratégie métier.

### Conductor

Le Conductor peut porter le ton et la relation utilisateur, mais ne doit pas exécuter de workflow.

### Workflow

Le workflow doit rester déclaratif, observable et versionné.

## Objectif

Empêcher les petits raccourcis de devenir une dette structurelle.

Les personnes sont respectées.

Les idées passent au crash-test.