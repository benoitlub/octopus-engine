# Runtime

Le runtime est Octopus Engine en cours d'exécution dans un contexte précis.

## Contient

- application active ;
- tenant ;
- policies ;
- workflows disponibles ;
- credentials autorisés ;
- mémoire cloisonnée ;
- modules disponibles ;
- capabilities disponibles ;
- connecteurs configurés ;
- tracing ;
- Guardian actif.

## Ne contient pas

- personnalité utilisateur par défaut ;
- logique métier d'une application spécifique ;
- workflows codés en dur ;
- accès mémoire global non cloisonné.

## Différence avec Engine

Engine est le socle.

Runtime est une instance vivante du socle.