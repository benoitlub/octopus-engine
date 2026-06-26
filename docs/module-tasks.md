# Module Tasks

Une Module Task est la portion locale d'un workflow remise à un module.

Elle est l'équivalent technique de la partition individuelle d'un instrument dans une œuvre complète.

## Principe

Un module ne reçoit jamais le workflow global.

Il reçoit seulement :

- ce qu'il doit faire ;
- les inputs nécessaires ;
- les contraintes locales ;
- les budgets locaux ;
- le format de sortie attendu ;
- les erreurs qu'il peut déclarer.

## Pourquoi

Cette séparation permet de respecter la loi des modules qui s'ignorent.

Le module n'a pas besoin de savoir :

- qui l'a précédé ;
- qui le suivra ;
- quelle mission globale est en cours ;
- quels autres modules existent.

## Exemple conceptuel

Un workflow global peut contenir une mission de prospection.

Le module Writer ne reçoit pas toute la mission.

Il reçoit seulement une tâche locale : rédiger un message à partir de données validées, avec un ton, une limite de longueur et un format de sortie.

## Points à définir

Le schéma exact d'une Module Task reste à définir dans une future ADR ou spécification technique.