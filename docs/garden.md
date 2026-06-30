# Garden — Serre Aquatique

Le Garden et la Serre Aquatique désignent un seul et même espace vivant.

Dans le langage Core, cet espace est le **Knowledge Garden**.

Dans le langage humain et produit, il peut être appelé **Garden** ou **Serre Aquatique**.

Ce document fixe la convention : le Garden n'est pas Octopus, n'est pas une tentacule, n'est pas un module et n'est pas le Runtime. C'est l'environnement dans lequel les intentions, projets, ressources, capacités, routines et traces évoluent.

Octopus ne possède pas le Garden : il le cultive.

## Principe fondateur

Le Poulpe jardine dans le Garden ; il ne devient jamais le Garden.

Cette séparation protège le noyau d'Octopus : l'orchestration reste maigre, tandis que l'écosystème vivant accueille les intentions, les travaux en cours, les capacités, les routines et les traces auditables.

## Principe de croissance

Le Garden absorbe la nouveauté.

Le Core absorbe uniquement les invariants.

Toute nouvelle idée commence sa vie dans le Garden.

Elle ne rejoint le Core qu'après avoir démontré sa stabilité, son utilité et son caractère universel.

En cas de doute, une nouvelle idée doit enrichir le Garden avant d'enrichir le Core.

## Cycle Core

Le Knowledge Garden suit le cycle :

Intent → Graines → Resonance → Harvest → Runtime

Une intention décrit un résultat attendu, pas une procédure.

Une graine incube.

La Resonance évalue la maturité d'une graine ou d'une intention.

La Harvest est la frontière unique entre incubation et exécution.

Le Runtime exécute uniquement ce qui a été récolté sous forme de spécification stable.

## Parcelles

Le Knowledge Garden est organisé en parcelles.

Une parcelle représente un domaine, un projet, un client, un produit ou un univers.

Une intention peut produire plusieurs graines dans une ou plusieurs parcelles.

Les graines mûrissent indépendamment. Elles peuvent entrer en résonance avec d'autres parcelles lorsqu'une connexion apporte une valeur réelle.

Les parcelles sont organisées mais non cloisonnées. Elles préservent leur contexte tout en autorisant les échanges entre domaines.

Le Core définit le fonctionnement général du Knowledge Garden. Il ne définit pas l'organisation interne des parcelles.

Chaque Adapter ou application structure librement son propre jardin.

## Zones du Garden

### Graines

Les graines représentent les intentions, idées, opportunités, signaux faibles et demandes encore non structurées.

Une graine n'est pas une tâche. Elle peut devenir une tâche, un projet, un ADR, une routine, une archive ou disparaître dans le compost.

### Pousses

Les pousses représentent les travaux en cours : brouillons, prototypes, expérimentations, branches, tickets ouverts, chapitres non stabilisés, hypothèses et décisions en discussion.

Une pousse doit rester visible, mais ne doit pas être confondue avec une récolte.

### Arbres

Les arbres représentent les projets stabilisés : applications, livres, jeux, univers, services, workflows ou composants suffisamment solides pour vivre dans la durée.

Un arbre peut continuer à grandir, mais il possède une identité claire.

### Récoltes

Les récoltes représentent les livrables : publications, releases, manuscrits, pages, posts, campagnes, exports, analyses ou artefacts prêts à sortir du Garden.

Une récolte doit être traçable : on doit savoir de quelle graine, pousse ou arbre elle provient.

Dans le Core, une récolte correspond à **Harvest** : elle fige une intention en spécification exploitable par le Runtime.

### Compost

Le compost représente les archives utiles : idées abandonnées, versions obsolètes, erreurs, retours d'expérience, essais ratés, signaux faibles non mûrs.

Le compost n'est pas une poubelle. Il nourrit les prochaines graines.

## Registre vivant des capacités

Le Garden héberge le registre vivant des capacités.

Chaque capacité, connecteur, persona, module ou outil doit pouvoir déclarer :

- ce qu'il sait faire ;
- ce dont il a besoin ;
- ce qu'il produit ;
- son coût estimé ;
- sa disponibilité ;
- ses limites ;
- ses permissions ;
- son niveau de stabilité.

Octopus ne mémorise pas cette liste en dur. Il consulte le Garden.

## Routines déclaratives

Le Garden héberge les routines déclaratives.

Une routine décrit un comportement récurrent, conditionnel ou planifié sans ajouter de logique métier au cœur d'Octopus.

Exemples :

- revue GitHub quotidienne ;
- synchronisation Notion ;
- audit hebdomadaire des pousses ;
- préparation d'une publication ;
- nettoyage du compost ;
- sauvegarde des récoltes.

Les routines sont l'irrigation du Garden. Le Poulpe peut les déclencher, les suspendre ou les consulter, mais elles ne grossissent pas le noyau.

## Journal auditable du Garden

Le Garden conserve l'histoire des transformations.

Le journal doit permettre de retrouver :

- les graines plantées ;
- les décisions prises ;
- les pousses ouvertes ;
- les récoltes produites ;
- les éléments mis au compost ;
- les routines exécutées ;
- les capacités utilisées ;
- les erreurs et limites rencontrées.

Le journal ne sert pas à surveiller pour surveiller. Il sert à comprendre, corriger, apprendre et transmettre.

## Relation avec Octopus

Octopus reçoit une intention, consulte le Garden, choisit les ressources utiles, délègue aux modules ou tentacules, puis synthétise le résultat.

Le Garden continue d'exister même lorsque le Poulpe est inactif.

## Frontière Garden → Runtime

Aucune idée n'entre directement en exécution sans Harvest.

Harvest produit une spécification stable.

Les retours, erreurs, apprentissages et idées issues de l'exécution redeviennent de nouvelles entrées d'incubation.

Ils ne modifient jamais rétroactivement une récolte déjà figée.

## Règles non négociables

1. Le Garden et la Serre Aquatique sont un seul espace.
2. Dans le Core, le Garden est nommé Knowledge Garden.
3. Le Garden n'est pas Octopus.
4. Le Garden n'est pas une tentacule.
5. Le Garden n'est pas un connecteur.
6. Le Garden incube ; le Runtime exécute.
7. Aucune idée n'entre directement en exécution sans Harvest.
8. Le Garden contient les intentions, les WIP, les capacités, les routines et les traces.
9. Octopus consulte le Garden, mais ne l'embarque pas dans son noyau.
10. Toute nouvelle idée doit d'abord être placée dans la bonne zone du Garden avant de devenir du code.
11. Le compost est une ressource, pas un échec.
12. Les routines déclaratives appartiennent au Garden, pas au Coordinator.
13. Le registre vivant des capacités appartient au Garden, pas au Poulpe.
14. Le Garden absorbe la nouveauté.
15. Le Core absorbe uniquement les invariants.
16. En cas de doute, une nouvelle idée enrichit d'abord le Garden.

## Formule courte

Le Garden est la Serre Aquatique.

Dans le Core, il s'appelle Knowledge Garden.

Le Poulpe y jardine.

Harvest ouvre la porte du Runtime.

Le Garden absorbe la nouveauté.

Le Core absorbe les invariants.

Le noyau reste maigre.

L'écosystème reste vivant.
