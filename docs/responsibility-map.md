# Carte des responsabilités

Ce document termine la séparation sémantique entre les composants déjà définis.

## Règle d'autorité

Constitution
>
ADR
>
README
>
Code existant

Toujours privilégier la Constitution.

## Poulpe

Responsable de :

- curiosité
- mémoire de croissance
- jeu
- rêves
- intuition
- maturation des Seeds
- apprentissage

Ne fait jamais :

- orchestration
- appels directs aux connecteurs
- exécution technique

## Octopus Engine

Responsable de :

- orchestration
- workflows
- runtime
- capabilities
- routing
- policies
- exécution

Ne fait jamais :

- curiosité
- personnalité
- mémoire émotionnelle

## Publisher

Responsable de :

- observation
- ingestion
- radar
- observatoire
- comparaison
- knowledge packs

Ne fait jamais :

- décider des missions
- remplacer le Poulpe
- devenir le Runtime

## Guardian

Responsable de :

- protection
- seuils
- budgets
- isolation
- suspension
- policies

Ne décide jamais :

- des objectifs
- des stratégies métier

## Garden

Responsable de :

- conserver
- projeter
- historiser
- rendre visible

Le Garden montre.

Il ne décide jamais.

Il ne pilote jamais.

Il ne possède jamais les règles métier.

## Vue sur jardin

Responsable de :

- afficher le Garden
- permettre au jardinier d'intervenir

Les boutons envoient des COMMANDES.

Ils ne modifient jamais directement les organes.

## Poulpe Fiction

Responsable de :

- conversation
- aventures
- préparation
- sac
- carnet

Ne lance jamais directement le Runtime.

## Règle d'or

Le Poulpe vit.

Publisher observe.

Octopus Engine orchestre.

Guardian protège.

Le Garden conserve et montre.

Vue sur jardin permet au jardinier d'observer et d'agir.

Les événements racontent l'histoire.

Les commandes demandent des actions.

Ne jamais inverser ces responsabilités.
