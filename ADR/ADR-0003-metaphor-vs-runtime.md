# ADR-0003 — Les métaphores servent la pensée, pas le runtime

## Statut

Accepté — v0.1.

## Contexte

Octopus Engine utilise une métaphore biologique forte : cerveau, tentacules, nid, digestion, mue, chasse, progéniture.

Cette métaphore aide à communiquer, concevoir et garder une cohérence culturelle.

Mais les revues ont montré un risque : transformer la poésie en interfaces runtime inutiles.

## Décision

La métaphore est réservée au langage humain, à la Bible et à la pédagogie.

Le code doit utiliser des concepts industriels simples :

- Coordinator ;
- Module ;
- Capability ;
- Connector ;
- Policy ;
- Workflow ;
- Runtime ;
- State ;
- Trace.

Aucune interface anthropomorphique ne doit être créée simplement parce qu'elle correspond à la métaphore.

## Conséquences

- La Bible garde une âme.
- Le runtime reste simple.
- Les développeurs tiers ne sont pas forcés d'apprendre une biologie fictive pour coder.
- Les décisions techniques peuvent rester testables et standard.

## Alternatives rejetées

### Métaphore partout

Rejeté : risque de recréer un système d'exploitation anthropomorphique.

### Aucune métaphore

Rejeté : perte de la culture, de la lisibilité et de l'identité du projet.