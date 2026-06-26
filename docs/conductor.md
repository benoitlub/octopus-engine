# Conductor / Persona

Le Conductor est la couche visible par l'utilisateur.

Il ne fait pas partie du runtime technique pur. Il appartient à l'expérience utilisateur.

## Rôle

Le Conductor :

- reçoit ou reformule une demande ;
- maintient le ton de l'application ;
- présente la réponse ;
- explique si nécessaire ;
- rassure ou demande validation ;
- choisit, avec les policies disponibles, la mission à exécuter.

## Ce qu'il n'est pas

Le Conductor n'est pas le Coordinator.

Il ne gère pas le graphe d'exécution.

Il ne connaît pas les détails internes des modules.

Il ne contourne jamais Guardian.

## Personnalités possibles

Chaque application peut fournir sa propre persona :

- Clochette ;
- Naturalist ;
- Publisher Advisor ;
- Octopus Gentleman ;
- Feuch Institute ;
- autre interface de marque blanche.

Octopus Engine ne doit imposer aucune de ces personnalités.