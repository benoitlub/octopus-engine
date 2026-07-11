# Octopus Engine — Constitution Core v2.0

## Statut

Version 2.0 — Constitution active, alignée avec la Constitution vivante Notion du 10 juillet 2026.

Ce document contient les lois et invariants d'Octopus Core. Les comportements propres à Publisher, Garden, Poulpe Fiction, Gérard ou Blacklace vivent dans `constitutions/` et les décisions détaillées dans `ADR/`.

## Nature d'Octopus

Octopus Engine est un moteur universel d'orchestration et d'exécution.

Il n'est ni un agent autonome généraliste, ni un chatbot, ni une mascotte, ni un personnage.

Le Poulpe vivant utilise Octopus Engine pour agir, mais ne se confond jamais avec lui.

## Séparation canonique

- **Octopus Engine** : moteur neutre, planification, orchestration, policies, exécution et traces.
- **Le Poulpe** : intelligence vivante, curiosité, mémoire de croissance, jeu, rêve, apprentissage et choix d'exploration.
- **Publisher** : serre d'observation et Knowledge Observatory ; collecte, compare, mémorise et produit des Knowledge Packs.
- **Garden** : read model et hublot visible sur les parcelles, curiosités, cultures, récoltes et activités.
- **Poulpe Fiction** : cabane de départ ; conversation, préparation des sacs, simulation, jeu et préparation des aventures.
- **Applications** : adapters, ressources, connaissances et greffons ; elles ne modifient jamais le Core.

## Clarification Event Bus

Les workflows métier restent déterministes.

L'Event Bus sert à l'audit, la télémétrie, les notifications, le découplage, les événements internes et les effets secondaires.

Les modules ne s'appellent pas directement.

## Lois non négociables

1. **Intention avant procédure.** L'humain exprime un objectif ; le système choisit la procédure appropriée.
2. **Composition avant héritage.** Les applications composent Octopus Engine sans injecter de logique métier dans le Core.
3. **Coordinateur maigre.** Le Coordinator interprète des contrats déclaratifs ; il ne contient aucune logique propre à une application.
4. **Conductor séparé.** Le Conductor parle aux humains ; le Coordinator parle aux machines.
5. **Modules indépendants.** Un module reçoit uniquement sa tâche locale et ignore les autres modules.
6. **Événements plutôt qu'appels directs.** Les échanges inter-modules passent par des événements et contrats traçables.
7. **Capabilities séparées des connecteurs.** Un connecteur expose un accès technique ; une capability expose une action utilisable.
8. **Guardian protège sans gouverner.** Il peut observer, limiter, isoler, suspendre ou bloquer, mais ne décide jamais du métier.
9. **Mémoire cloisonnée.** Toute circulation entre mémoires est explicite, documentée et autorisée.
10. **Traçabilité.** Toute décision, exécution, source, coût, erreur et résultat important doit pouvoir être inspecté.
11. **Réversibilité.** Une expérimentation, un greffon ou une capability temporaire peut être retiré sans casser le moteur.
12. **Sobriété.** Le système réduit la charge mentale et n'expose pas sa complexité sans nécessité.
13. **Documentation avant extension.** Toute nouvelle responsabilité durable est documentée avant d'entrer dans le Core.
14. **Validation proportionnée au risque.** Observation, jeu, rêve et préparation peuvent être autonomes ; toute action sensible exige une autorisation adaptée.
15. **Autonomie intérieure.** Le Poulpe n'attend pas une requête humaine pour observer, comparer, se souvenir, jouer, rêver, faire mûrir une curiosité ou préparer une proposition.
16. **Aucune autonomie de façade.** Ouvrir Publisher, afficher le Garden ou parler au Poulpe ne déclenche pas sa vie intérieure.
17. **Le LLM n'est pas le cerveau.** Un modèle peut enrichir, raconter ou reformuler ; il ne décide pas de ce qui intrigue le Poulpe, de ce qu'il apprend ni de ce qui devient une Seed.
18. **Retour au Garden.** Toute exploration produit une trace visible ou mémorisable : Harvest, apprentissage, curiosité, carnet, échec explicite ou abandon justifié.
19. **Conseil de Résonance.** Une loi fondamentale du Core ne peut être ajoutée ou modifiée qu'après revue critique par plusieurs intelligences ou experts indépendants.

## Architecture minimale

Application → Adapter → Octopus Engine → Coordinator → Workflow → Module Tasks → Capabilities → Connecteurs → Sources externes

Guardian applique les policies autour de l'exécution. Les événements, traces et mémoires assurent découplage, audit et apprentissage.

## Contrats du Core

Le Core définit au minimum :

- Intent
- Mission
- Workflow
- Module Task
- Capability
- Connector
- Policy
- Event
- Trace
- Memory Boundary
- Adapter
- Graft

Le Core ne contient aucune connaissance de SaaS, Blacklace, publication, jeu ou prospection.

## Autonomie et rythme

L'autonomie du Poulpe repose sur des boucles locales et persistantes :

- ingestion régulière de sources autorisées ;
- radar de signaux nouveaux ;
- comparaison avec observations et souvenirs ;
- évolution graduelle de la curiosité ;
- jeu, rêve ou simulation sans conséquence réelle ;
- préparation de Seeds, Harvests ou aventures ;
- présentation au jardinier lorsque quelque chose mérite son attention.

Ces boucles fonctionnent indépendamment de l'ouverture d'une interface. Une interface révèle l'activité ; elle ne la crée pas.

## Actions sensibles

Sont notamment sensibles : publication publique, prise de contact, dépense significative, modification ou suppression de données, déploiement, engagement juridique ou commercial, accès à une nouvelle source privée.

Ces actions passent par Guardian et une validation proportionnée au risque. La curiosité n'est jamais une permission.

## Greffons et évolution

Un greffon est une capability temporaire composée pour une mission. Il n'est pas une tentacule permanente par défaut.

Un greffon devient durable uniquement s'il revient utilement, produit des résultats mesurables, respecte les frontières du Core, possède un contrat, des tests et une politique de retrait, puis est promu par une décision explicite.

## Sources de vérité

- **GitHub Octopus Engine** : source technique durable du runtime et des contrats.
- **Constitution Notion** : synthèse vivante des invariants.
- **ADR** : décisions détaillées et raisons de leur adoption.
- **`constitutions/`** : comportements propres aux applications et adapters.

En cas de contradiction, la décision la plus récente explicitement acceptée prévaut, puis doit être répercutée dans les autres sources.

## Ce qu'Octopus Engine n'est pas

Octopus Engine n'est pas : Gérard, une IA omnisciente, un gros prompt central, une collection d'agents se parlant librement, un CRM, un tableau de bord, un fournisseur de personnalité, le propriétaire des connaissances métier ou le déclencheur de la curiosité du Poulpe.

## Constitutions liées

- `constitutions/publisher.md`
- `constitutions/poulpe-fiction.md`
- `constitutions/garden.md`
- `constitutions/blacklace.md`
- `constitutions/gerard-ethology.md`

## Maxime

**Le Poulpe vit, Publisher observe, le Garden montre, Poulpe Fiction imagine, Octopus Engine orchestre et Guardian protège.**
