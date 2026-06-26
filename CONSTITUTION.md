# Constitution Octopus Engine

Version 0.1 — fondation.

Cette Constitution définit les lois non négociables du moteur. Les détails d'implémentation appartiennent aux ADR et aux spécifications techniques.

## Loi I — Une seule interface visible

L'utilisateur ne doit jamais être exposé à une collection de modules, de connecteurs ou de workflows.

Chaque application fournit son propre visage : Clochette, Naturalist, Octopus Gentleman, conseiller marketing, ou autre persona.

Octopus Engine n'impose aucune personnalité.

## Loi II — L'intention appartient à l'utilisateur

L'utilisateur exprime un objectif.

Le moteur absorbe la procédure, la coordination, les choix techniques et la complexité.

## Loi III — Le Coordinateur orchestre

Le Coordinateur pilote une mission via un workflow explicite et déterministe.

Il n'exécute jamais la logique métier à la place des modules.

## Loi IV — Les modules s'ignorent

Un module ne connaît jamais directement un autre module.

Il ne référence pas son nom, son état, son implémentation ou sa mémoire.

## Loi V — Le flux principal n'est pas piloté par Event Bus

L'orchestration métier se fait par workflow explicite.

L'Event Bus sert aux logs, à l'audit, à la télémétrie, aux notifications et aux effets secondaires non critiques.

## Loi VI — Les capacités sont indépendantes des connecteurs

Une capacité décrit une action métier ou technique réutilisable.

Un connecteur fournit l'accès à un système externe.

Les modules utilisent des capacités, pas directement des connecteurs.

## Loi VII — Les applications composent Octopus

Aucune application n'hérite du moteur.

Chaque application déclare les modules, capacités, personas, policies et connecteurs dont elle a besoin.

## Loi VIII — Toute mémoire est cloisonnée

Il n'existe pas de mémoire commune ouverte entre applications.

Une mémoire peut partager un mécanisme, jamais un espace de données sans décision explicite, documentée et validée.

## Loi IX — Le moteur définit la physique, pas la politique

Octopus Engine définit les états possibles, les contrats, les transitions et les événements.

Les règles de gouvernance, budgets, promotions, retraits, seuils et rythmes d'évolution appartiennent aux policies.

## Loi X — Tout ajout doit pouvoir être retiré

Un module, une capacité ou un connecteur doit pouvoir être supprimé, désactivé ou remplacé sans casser le reste du système.

Si son retrait casse autre chose que lui-même, l'architecture a déjà failli.

## Loi XI — Le silence est préférable à une fausse réponse

Octopus doit pouvoir dire qu'il ne sait pas, qu'il n'a pas le module nécessaire, ou qu'il lui manque une permission.

Improviser une réponse plausible mais fragile est une faute de conception.

## Loi XII — Toute décision structurante laisse une trace

Toute décision d'architecture importante doit produire un ADR.

Une décision non documentée n'est pas une décision stable.

## Loi XIII — Les métaphores s'arrêtent avant le code

La biologie du poulpe aide à penser le système.

Elle ne doit jamais créer des interfaces anthropomorphiques inutiles dans le runtime.

Dans le code, les composants restent simples, passifs, versionnés et testables.