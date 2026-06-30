# Bible Octopus Engine

Version 0.3 — document vivant.

La Bible rassemble la philosophie, l'écologie, les principes d'évolution et la culture d'ingénierie d'Octopus Engine.

Elle n'est pas sacrée. Elle doit être relue, contestée et révisée.

## 1. Pourquoi Octopus

Octopus Engine existe parce que les applications IA partagent des besoins communs : mémoire, orchestration, génération, analyse, connecteurs, sécurité, policies, observation.

Au lieu de réinventer ces briques dans chaque projet, Octopus fournit un socle commun.

Les applications restent spécifiques. Le moteur reste réutilisable.

## 2. Les trois langages

Octopus possède trois langages.

### Langage humain

Il sert à expliquer : poulpe, tentacule, ventouse, organe, nid, mue, digestion, chasse, jardin, serre aquatique.

### Langage d'architecture

Il sert à décider : intent, knowledge garden, resonance, harvest, module, capability, connector, policy, workflow, runtime, tenant, tracing.

### Langage machine

Il sert à coder : interfaces simples, enums, schémas, contrats, tests.

La métaphore ne doit jamais contaminer inutilement le runtime.

## 3. Anatomie d'Octopus

Cette section appartient au langage humain. Elle sert à expliquer le système et ne dicte pas les noms de classes, d'interfaces ou de fichiers. Voir ADR-0003.

### Corps

Le corps représente Octopus Engine dans son ensemble.

Il contient les organes, les flux, les limites, les systèmes de protection et les moyens d'action.

### Bouche

La bouche représente la Gateway.

Tout ce qui entre et sort passe par elle : demandes utilisateur, réponses, fichiers, permissions, accès externes.

### Yeux

Les yeux représentent l'observation.

Ils surveillent l'environnement, repèrent les changements, détectent les opportunités et les menaces.

### Cerveau central visible

Le cerveau central visible représente le Conductor / Persona.

Il comprend la demande, porte le ton de l'application, communique avec l'utilisateur et choisit la bonne mission.

Il peut porter un nœud papillon si l'application le souhaite. Le runtime, lui, ne porte rien.

### Système nerveux central

Le système nerveux central représente le Coordinator Runtime.

Il transmet les signaux, synchronise les étapes, donne les départs et interprète les workflows.

Il n'invente pas la mission et ne décide pas du style.

### Partition / Workflow

Le workflow est la partition complète d'une mission.

Il décrit les étapes, dépendances, conditions, capacités requises, entrées et sorties attendues.

Le Coordinateur lit la partition. Il ne la compose pas.

### Tentacules

Les tentacules représentent les grands domaines de compétence.

Elles peuvent correspondre à des familles comme : création, recherche, mémoire, analyse, communication, publication.

Une tentacule n'est pas automatiquement une classe ou un module dans le code. C'est une représentation pédagogique d'un domaine d'action.

### Ganglions

Les ganglions représentent l'intelligence locale d'une zone spécialisée.

Ils permettent une autonomie d'exécution locale : un module sait accomplir sa tâche sans demander au centre chaque microdécision.

Cette autonomie n'est jamais stratégique : le module ne choisit pas le prochain module à appeler.

### Ventouses

Les ventouses représentent les Capabilities.

Chaque ventouse sait faire une chose précise : résumer, traduire, classer, chercher, générer, publier, analyser.

Les ventouses sont nombreuses, spécialisées, interchangeables et versionnées.

### Organes

Les organes représentent les grands systèmes internes : Memory Engine, Guardian, Scheduler, Tracing, Security, Policy Engine.

Ils maintiennent la vie du moteur sans être des modules métier.

### Estomac

L'estomac représente la digestion des connaissances.

Il transforme la donnée brute en connaissance utile, puis oublie ce qui n'a plus de valeur.

### Peau et capteurs

La peau et les capteurs représentent les Connectors.

Ils touchent le monde extérieur : Notion, GitHub, Gmail, Google, Meta, fichiers, bases de données, API, providers IA.

Ils captent et transmettent. Ils ne décident rien.

### Système immunitaire

Le système immunitaire représente Guardian.

Il observe, alerte, limite, isole, suspend ou bloque lorsqu'un danger l'exige.

Il protège la survie du système, mais ne décide jamais du métier.

## 4. Composants techniques

### Engine

Octopus Engine désigne le code partagé, les contrats, les schémas, les lois, les ADR et les composants réutilisables.

### Runtime

Octopus Runtime désigne une instance d'exécution du moteur dans un contexte donné : application, tenant, policies, credentials, mémoire cloisonnée et workflows disponibles.

### Modules

Les modules sont spécialisés, passifs du point de vue de l'orchestration, et appelés par le Coordinateur.

Ils disposent d'une autonomie d'exécution, jamais d'une autonomie stratégique.

### Capacités

Les capacités décrivent ce qu'il est possible de faire : générer, résumer, publier, chercher, analyser, lire une base, écrire un document.

Elles doivent être versionnées.

### Connecteurs

Les connecteurs donnent accès aux systèmes externes : Notion, GitHub, Gmail, Mistral, Claude, OpenAI, Gemini, Meta, Google, etc.

Ils ne décident rien.

## 5. Écologie d'Octopus

Cette section est métaphorique. Elle appartient au langage humain et doit toujours être lue à la lumière d'ADR-0003.

Chaque jour, Octopus se nourrit et digère.

Il absorbe des données, les trie, les résume, les relie, puis oublie ce qui n'est plus utile.

Quand un utilisateur lui confie une mission, il passe en mode chasse : toutes les ressources utiles convergent vers l'objectif, dans les limites du budget et des permissions.

Pour survivre, il observe son environnement, surveille les risques, protège ses ressources et aménage son nid.

Le nid est son espace de travail : Notion, GitHub, Drive, Obsidian ou tout autre support choisi par l'application.

Sa progéniture n'est pas biologique : ce sont ses productions — textes, campagnes, analyses, livres, workflows, assets — déposées proprement pour pouvoir vivre hors de lui.

## 6. Garden — Serre Aquatique

Le Garden et la Serre Aquatique désignent un seul et même espace vivant.

Dans le langage Core, cet espace est le **Knowledge Garden**.

Le Garden n'est pas Octopus, n'est pas une tentacule, n'est pas un module et n'est pas le runtime. C'est l'environnement dans lequel les intentions, projets, ressources, capacités, routines et traces évoluent.

Octopus ne possède pas le Garden : il le cultive.

Le Poulpe jardine dans le Garden ; il ne devient jamais le Garden.

Cette séparation protège le noyau d'Octopus : l'orchestration reste maigre, tandis que l'écosystème vivant accueille les intentions, les travaux en cours, les capacités, les routines et les traces auditables.

### Cycle Core

Intent → Graines → Resonance → Harvest → Runtime

Le Knowledge Garden incube.

Le Runtime exécute.

Aucune idée n'entre directement en exécution sans Harvest.

Harvest produit une spécification stable.

### Parcelles

Le Knowledge Garden est organisé en parcelles.

Une parcelle représente un domaine, un projet, un client, un produit ou un univers.

Les parcelles sont organisées mais non cloisonnées. Elles préservent leur contexte tout en autorisant les échanges entre domaines.

### Zones du Garden

- Graines : intentions, idées, opportunités et signaux faibles.
- Pousses : travaux en cours, brouillons, prototypes, branches, tickets ouverts, hypothèses et décisions en discussion.
- Arbres : projets stabilisés, applications, livres, jeux, univers, services, workflows ou composants durables.
- Récoltes : livrables prêts à sortir du Garden ; dans le Core, la récolte correspond à Harvest.
- Compost : archives utiles, idées abandonnées, versions obsolètes, erreurs et retours d'expérience.

### Fonctions du Garden

Le registre vivant des capacités appartient au Garden, pas au Poulpe. Il recense ce que les capacités, connecteurs, personas, modules et outils savent faire, ce dont ils ont besoin, ce qu'ils produisent, leur coût, leur disponibilité, leurs limites, leurs permissions et leur niveau de stabilité.

Les routines déclaratives appartiennent au Garden, pas au Coordinator. Elles décrivent les comportements récurrents, conditionnels ou planifiés sans grossir le noyau.

Le journal auditable appartient au Garden. Il conserve les graines plantées, décisions prises, pousses ouvertes, récoltes produites, éléments mis au compost, routines exécutées, capacités utilisées, erreurs et limites rencontrées.

Voir aussi : docs/garden.md.

## 7. Gouvernance

Octopus Engine définit la physique.

Les policies définissent les règles de vie.

Le moteur connaît les états possibles et les transitions. Les applications et la gouvernance décident des seuils, budgets, droits, rythmes, validations et stratégies de routage.

## 8. Cycles de revue

### Conseil des Céphalopodes — tous les 2 mois

Observer ce qui a changé dans le monde de l'IA, des modèles, des API, des usages, des coûts, de la réglementation et des risques.

Question officielle : que devrait apprendre Octopus ?

### La Mue — tous les 6 mois

Simplifier, supprimer, fusionner, archiver, nettoyer.

Question officielle : de quoi Octopus peut-il se passer ?

### Le Grand Conseil — une fois par an

Relire la vision, la Constitution, les ADR et les erreurs.

Question officielle : construirions-nous encore Octopus de cette manière aujourd'hui ?

### Conseil d'Urgence

Convoqué en cas de rupture technologique, réglementaire ou de sécurité.

## 9. Règle du jardin

Un jardin ne devient pas beau parce qu'on y plante toujours plus de fleurs.

Il devient beau parce qu'on désherbe régulièrement.

Toute nouvelle fonctionnalité doit répondre à la question : qu'est-ce que nous supprimons ou simplifions en échange ?

## 10. Évolution des modules

Le runtime ne donne pas une vie biologique aux modules.

Un module est un composant logiciel immuable, versionné, déployé ou retiré par des mécanismes standards.

Ce qui évolue réellement, c'est le routage et la gouvernance : canary, A/B testing, poids, circuit breaker, budgets, policies.

Le vocabulaire de naissance, mue, retraite ou héritage peut exister dans la Bible, mais le code doit rester industriel.

## 11. Devise finale

Le rôle d'Octopus n'est pas d'avoir toujours raison.

Le rôle d'Octopus est de continuer à apprendre sans perdre son identité.
