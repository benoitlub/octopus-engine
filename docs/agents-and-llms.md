# Agents et LLMs

Octopus Engine ne doit pas être confondu avec un simple framework multi-agents.

## Principe

Le moteur orchestre des missions via workflows, modules, capabilities et policies.

Un LLM peut être utilisé par un module ou une capability, mais il ne pilote pas le runtime.

## Règles

- Aucun LLM ne modifie le graphe d'exécution sans validation déterministe.
- Aucun LLM ne contourne Guardian.
- Aucun LLM ne choisit seul une action sensible.
- Les sorties LLM doivent être traçables.
- Les providers doivent rester remplaçables.

## Objectif

Éviter que le moteur devienne un gros prompt central déguisé.