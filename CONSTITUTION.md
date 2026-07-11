# Octopus Core Constitution v1.0 — Draft épuré

## Préambule

Octopus est conçu comme un écosystème vivant.

À l'image d'une serre aquatique, les ressources ne sont pas consommées puis oubliées ; elles circulent, se transforment et enrichissent continuellement l'ensemble du système.

## Clarification canonique

Le Poulpe n'est pas Octopus Engine.

Octopus Engine n'a aucune vie intérieure.

Toute autonomie appartient aux applications.

Le Core orchestre uniquement.

## Clarification Event Bus

Les workflows métier restent déterministes.

L'Event Bus est réservé à l'audit, la télémétrie, les notifications, les événements internes, le découplage et les effets secondaires.

Ces deux règles coexistent.

## Constitutions liées

- Constitution Core : ce document.
- Constitution Publisher : `constitutions/publisher.md`.
- Constitution Poulpe Fiction : `constitutions/poulpe-fiction.md`.
- Constitution Garden : `constitutions/garden.md`.
- Constitution Blacklace : `constitutions/blacklace.md`.
- Constitution Gérard : `constitutions/gerard-ethology.md`.
- ADR : `ADR/`.

Une idée peut devenir un projet. Un projet produit de l'expérience. L'expérience nourrit de nouvelles idées. Les connaissances se renforcent par leurs interactions plutôt que par leur accumulation.

L'objectif d'Octopus est de favoriser des cycles vertueux où les intentions mûrissent, les réalisations produisent de nouveaux apprentissages et chaque contribution augmente durablement la valeur de l'écosystème.

Le Core définit les mécanismes qui rendent ces cycles possibles. Les Adapters les expriment selon leur propre langage, leur domaine et leur culture.

---

## Statut

Draft v1.0 épuré.

Objectif : définir le Core d'Octopus sans métaphore, sans lore et sans dépendance à Blacklace.

## Vision

Octopus est un moteur d'orchestration d'intentions.

Il reçoit une intention exprimée en langage naturel, la transforme en actions structurées, orchestre les capacités nécessaires, conserve les décisions importantes et protège la cohérence du système.

Octopus doit réduire la charge mentale de l'utilisateur sans masquer les décisions sensibles.

## Principe fondateur

Le Core est universel.

Les Adapters fournissent le vocabulaire, les personas, les métaphores et l'expérience propre à chaque contexte.

Le Core ne contient aucun élément narratif.

## Concepts du Core

### Intent

Expression initiale d'un objectif utilisateur.

Une intention décrit un résultat attendu, pas une procédure.

### Knowledge Garden

Espace d'incubation des idées, hypothèses, opportunités et pistes non encore matérialisées.

Il ne développe pas, ne publie pas et ne déclenche pas d'action sensible.

### Resonance

Mécanisme d'évaluation de la maturité d'une intention ou d'une idée.

La résonance peut inclure : cohérence avec l'écosystème, utilité, faisabilité, persistance dans le temps et convergence de critiques indépendantes.

### Harvest

Frontière unique entre incubation et exécution.

Une idée ne devient projet qu'au moment de sa récolte.

La récolte fige une intention en spécification exploitable par le Runtime.

### Runtime

Couche d'exécution technique.

Elle reçoit des spécifications, orchestre des workflows, appelle des capacités, journalise les traces et produit des livrables.

### Capabilities

Actions réutilisables exposées au Runtime : lire, écrire, générer, publier, rechercher, analyser, transformer.

Les capacités peuvent être fournies par plusieurs connecteurs.

### Policies

Règles configurables qui limitent ou autorisent certaines actions : budget, sécurité, validation humaine, nombre de projets actifs, permissions.

Les seuils opérationnels vivent dans les Policies, pas dans la Constitution.

### Memory

Mécanisme de conservation contextualisée.

La mémoire est cloisonnée par application, client ou adapter.

Toute passerelle mémoire doit être explicite.

### Guardian

Système de protection.

Il observe, alerte, limite, isole, suspend ou bloque selon les policies et le niveau de risque.

Guardian protège le système mais ne décide pas du métier.

### Adapter

Couche de personnalisation.

Un Adapter traduit les concepts du Core vers le vocabulaire, les personas, les interfaces et les usages d'un contexte donné.

## Lois du Core

### Loi 1 — Core sans métaphore

Le Core ne contient aucune métaphore, aucun personnage et aucun élément narratif.

Les métaphores appartiennent aux Adapters.

### Loi 2 — Intention avant procédure

L'utilisateur exprime un objectif.

Octopus déduit les étapes nécessaires, puis demande validation quand l'action est sensible.

### Loi 3 — Incubation séparée de l'exécution

Le Knowledge Garden incube.

Le Runtime exécute.

Aucune idée n'entre directement en exécution sans Harvest.

### Loi 4 — Récolte

Une idée ne devient jamais projet parce qu'elle est née.

Elle devient projet lorsqu'elle est récoltée.

La récolte produit une spécification figée.

Toute évolution ultérieure devient une nouvelle intention ou une nouvelle graine dans le Knowledge Garden.

### Loi 5 — Capacité limitée

Octopus ne matérialise pas toutes les idées mûres immédiatement.

Les Policies limitent le nombre d'exécutions simultanées afin de préserver la capacité de terminer.

### Loi 6 — Séparation des responsabilités

Les modules ne s'appellent pas directement.

Les capacités ne décident pas.

Les connecteurs ne décident pas.

Le Runtime orchestre, les Policies contraignent, Guardian protège.

### Loi 7 — Mémoire cloisonnée

Aucune mémoire commune ouverte n'existe par défaut.

Chaque contexte possède son espace mémoire.

Les passerelles doivent être documentées et validées.

### Loi 8 — Conseil de Résonance

Une loi fondamentale du Core ne peut être ajoutée ou modifiée qu'après revue critique par plusieurs intelligences ou experts indépendants.

Le but n'est pas l'unanimité, mais l'identification des invariants qui résistent aux critiques.

### Loi 9 — Adapters non intrusifs

Un Adapter peut modifier le langage, les personas, les interfaces et les policies d'un contexte.

Il ne modifie pas le Core.

### Loi 10 — Tests des invariants

Toute loi du Core doit pouvoir être vérifiée par revue, test, audit ou policy.

Une loi non vérifiable doit rester dans un ADR ou un Adapter.

## Frontières

### Core → Adapter

Le Core expose des concepts neutres.

L'Adapter fournit le langage naturel, les personas et les conventions d'usage.

### Knowledge Garden → Runtime

Le passage se fait uniquement par Harvest.

Harvest produit une spécification stable.

### Runtime → Knowledge Garden

Les retours, erreurs, apprentissages et idées issues de l'exécution redeviennent de nouvelles entrées d'incubation.

Ils ne modifient jamais rétroactivement une récolte déjà figée.

## Ce qui sort du Core

Tout nom propre, personnage, lieu, symbole ou lore appartient à un Adapter ou au Codex de son univers.

Exemples à exclure du Core : Blacklace, Feuch, Brumeux, Fée Belette, Natasha, SATOR, Natashain, lieux ou personnages narratifs.

## Règle d'évolution

Toute proposition visant à enrichir le Core doit démontrer qu'elle ne peut pas être implémentée comme Adapter, Policy ou Capability.

À défaut, elle est refusée du Core.

## Knowledge Garden — Parcelles

Le Knowledge Garden est organisé en parcelles.

Une parcelle représente un domaine, un projet, un client, un produit ou un univers.

Chaque parcelle suit le même cycle :

Intent → Graines → Resonance → Harvest → Runtime

Une intention peut produire plusieurs graines.

Les graines mûrissent indépendamment. Elles peuvent entrer en résonance avec d'autres parcelles lorsqu'une connexion apporte une valeur réelle.

Les parcelles sont organisées mais non cloisonnées. Elles préservent leur contexte tout en autorisant les échanges entre domaines.

Le Core définit le fonctionnement général du Knowledge Garden. Il ne définit pas l'organisation interne des parcelles.

Chaque Adapter ou application structure librement son propre jardin.
