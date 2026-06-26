# ADR-0001 — Pourquoi Octopus Engine existe

## Statut

Accepté — v0.1.

## Contexte

Les projets Blacklace Publisher, Clochette Lite, Creature-Sync et Blacklace Echo partagent des besoins techniques récurrents : orchestration, mémoire, connecteurs, génération, analyse, observation et gouvernance.

Les réimplémenter dans chaque application créerait une dette technique rapide et une incohérence entre projets.

## Décision

Créer Octopus Engine comme moteur commun, séparé des applications.

Les applications composent Octopus avec leurs propres personas, policies, modules, capacités et connecteurs.

Octopus Engine ne doit pas imposer une identité utilisateur unique.

## Conséquences

- Les briques communes sont documentées et réutilisées.
- Les applications restent libres de leur expérience utilisateur.
- Les choix structurants sont centralisés dans les ADR.
- Le moteur peut évoluer indépendamment des apps.

## Alternatives rejetées

### Un moteur par application

Rejeté : duplication et divergence garanties.

### Un gros moteur qui connaît toutes les applications

Rejeté : couplage, exceptions permanentes et dette cachée.

### Un simple dossier partagé de prompts

Rejeté : insuffisant pour porter mémoire, sécurité, policies, tracing et orchestration.