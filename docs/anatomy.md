# Anatomie d'Octopus Engine

Ce document présente l'analogie anatomique officielle d'Octopus Engine.

Il appartient au langage humain du projet. Il sert à comprendre, expliquer et transmettre. Il ne dicte pas directement l'implémentation technique.

## Corps — Octopus Engine

Le corps représente l'organisme complet.

Il contient les organes, les systèmes de communication, les capacités d'action, les protections et les interactions avec l'environnement.

## Bouche — Gateway

La bouche est le point d'entrée et de sortie.

Elle reçoit les demandes, filtre les accès, applique le contexte tenant, contrôle les permissions et transmet les réponses.

## Yeux — Observer

Les yeux perçoivent l'environnement.

Ils détectent les changements, surveillent les risques, repèrent les opportunités et alimentent la conscience globale.

## Cerveau central visible — Conductor / Persona

Le cerveau central visible est la couche que l'utilisateur rencontre.

Il comprend, reformule, rassure, maintient le ton et porte le style propre à l'application.

Il appartient à l'expérience utilisateur.

## Système nerveux central — Coordinator Runtime

Le système nerveux central transmet les ordres d'exécution.

Il interprète les workflows, synchronise les étapes, donne les départs, attend les retours et agrège les résultats.

Il ne porte aucune personnalité.

## Workflow — Partition globale

Le workflow est la partition complète d'une mission.

Il décrit quoi faire, dans quel ordre, avec quelles conditions, quelles dépendances, quelles capacités et quels formats de sortie.

## Tâche locale — Partition de zone

Chaque module ne reçoit jamais le workflow complet.

Il reçoit seulement sa tâche locale, adaptée à ce qu'il doit produire.

## Tentacules — Domaines de compétence

Les tentacules représentent les grands domaines d'action : création, recherche, mémoire, analyse, communication, publication.

Elles ne correspondent pas nécessairement à une structure de code unique.

## Ganglions — Intelligence locale

Chaque zone spécialisée peut posséder une autonomie d'exécution locale.

Elle sait résoudre sa propre tâche sans réinterroger le centre pour chaque détail.

Cette autonomie ne devient jamais une autonomie stratégique.

## Ventouses — Capabilities

Les ventouses sont les capacités fines.

Elles savent faire une chose précise : traduire, résumer, publier, envoyer, lire, écrire, extraire, comparer, classer.

## Organes — Systèmes internes

Les organes maintiennent la vie du moteur : Memory Engine, Guardian, Scheduler, Tracing, Security, Policy Engine.

Ils ne sont pas des modules métier.

## Estomac — Memory / Digestion

L'estomac digère l'information.

Il transforme la donnée brute en connaissance utile, classe, relie, retient et oublie.

## Peau et capteurs — Connectors

La peau et les capteurs touchent le monde extérieur.

Ils représentent les connecteurs : Notion, GitHub, Gmail, Google, Meta, providers IA, fichiers, bases et API.

## Système immunitaire — Guardian

Le Guardian protège l'organisme.

Il observe, alerte, limite, isole, suspend ou bloque selon la gravité du risque.

Il protège le moteur, mais ne décide jamais de la mission métier.

## Environnement

L'environnement représente tout ce qui n'appartient pas au moteur : utilisateurs, clients, documents, API, réseaux sociaux, dépôts, fichiers, concurrents, coûts, réglementation et monde réel.

## Règle de lecture

La métaphore doit rester utile.

Si elle rend le code plus complexe, elle doit s'arrêter.