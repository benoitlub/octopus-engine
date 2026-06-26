# Versioning

Octopus Engine utilise un versionnement documentaire avant le versionnement logiciel.

## Versions actuelles

- v0.1 : fondations documentaires.
- v0.2 : clarification Conductor / Coordinator, workflows comme partitions, Guardian comme système immunitaire, anatomie officielle.

## Règle future

Quand le runtime existera, Octopus Engine devra adopter un versionnement sémantique :

- MAJOR : rupture de contrat ;
- MINOR : ajout compatible ;
- PATCH : correction sans changement de contrat.

## Contrats à versionner

- Workflows ;
- Module Tasks ;
- Capabilities ;
- Policies ;
- Connectors ;
- Trace Events.

## Principe

On ne modifie jamais silencieusement un contrat consommé par une application.

On crée une nouvelle version, puis on documente la migration.