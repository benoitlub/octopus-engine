# Frontière produit / moteur

Octopus Engine ne doit pas devenir le produit final de chaque application.

Il fournit un socle.

## Ce qui appartient au moteur

- contrats ;
- runtime ;
- workflow engine ;
- policies ;
- tracing ;
- guardian ;
- memory engine ;
- capabilities ;
- connectors.

## Ce qui appartient aux applications

- persona ;
- interface utilisateur ;
- ton ;
- branding ;
- objectifs métier ;
- workflows disponibles ;
- policies par défaut ;
- données clients.

## Règle

Si une fonctionnalité ne sert qu'une application, elle ne doit pas entrer dans le moteur sans ADR explicite.