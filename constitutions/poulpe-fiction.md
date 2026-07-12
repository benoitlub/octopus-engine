# Constitution Poulpe Fiction

Références : Constitution Core, Constitution Gérard, Constitution Garden, ADR-0008.

## Nature

Poulpe Fiction est l'application relationnelle du Poulpe.

Elle n'est ni le moteur ni Publisher.

Elle réunit deux espaces distincts dans le même produit :

- la **cabane de départ**, où le jardinier converse avec le Poulpe, prépare une aventure, choisit les greffons utiles, inspecte le sac et le pique-nique, puis décide si l'exploration peut partir ;
- le **Garden visible**, qui montre les parcelles, activités, obstacles, retours et récoltes.

La cabane de départ et le Garden ne se confondent pas, mais appartiennent tous deux à Poulpe Fiction.

## Responsabilités

Poulpe Fiction permet :

- la conversation naturelle ;
- la préparation des aventures ;
- l'affichage du sac ;
- l'affichage du pique-nique ;
- le choix de greffons temporaires ;
- le jeu, le rêve et la simulation ;
- le carnet de voyage ;
- la propriété métier des parcelles, Seeds, Sprouts et Harvests visibles ;
- la projection Garden des activités et retours ;
- la passerelle vers Octopus Engine lorsque l'aventure est prête ;
- l'interprétation des résultats neutres d'Octopus Engine dans le langage du Garden.

## Frontière avec Octopus Engine

Poulpe Fiction traduit ses concepts métier en contrats neutres d'exécution.

Octopus Engine ne reçoit ni Garden, ni parcelle, ni Seed, ni Sprout comme concepts du Core. Les identifiants métier restent dans l'adapter Poulpe Fiction ou traversent le moteur comme métadonnées opaques et identifiants de corrélation.

Le résultat neutre du moteur est ensuite interprété par Poulpe Fiction comme activité, obstacle, apprentissage, retour ou Harvest.

## Curiosité

La curiosité ne déclenche pas automatiquement une aventure extérieure.

Elle peut devenir :

- jeu ;
- rêve ;
- observation prolongée ;
- note de carnet ;
- préparation d'aventure ;
- ou disparition sans action.

Poulpe Fiction révèle et accompagne cette maturation ; elle ne la fabrique pas artificiellement à l'ouverture de l'interface.

## Sac

Avant une aventure, le Poulpe prépare un sac contenant ce qu'il possède déjà :

- observations récentes ;
- bouture concernée ;
- rêves liés ;
- souvenirs utiles ;
- éléments du carnet ;
- objectif de l'expédition ;
- limites connues.

Le sac est préparé avec une intention. Il n'est pas un simple export automatique de toute la mémoire.

Le sac peut être visible sans devenir une succession de validations techniques imposées au jardinier.

## Pique-nique

Le pique-nique décrit les ressources envisagées pendant l'aventure : tokens, modèles, connecteurs, greffons ou outils externes.

Il est annoncé lorsqu'un coût, un risque ou une dépendance mérite l'attention du jardinier.

Le pique-nique n'accorde aucune permission d'agir.

## Greffons

Un greffon est une capability temporaire composée pour une aventure.

Il n'est ni un métier fixe, ni une tentacule permanente, ni un module appelé par réflexe.

Un greffon peut survivre s'il revient utilement, produit des résultats mesurables et est promu explicitement.

## LLM

Les modèles de langage prêtent une voix au Poulpe. Ils ne créent jamais sa vie intérieure.

Un LLM peut raconter un rêve, reformuler une Harvest, enrichir une conversation, proposer plusieurs formulations ou aider à préparer un sac.

Il ne décide jamais de ce qui intrigue le Poulpe, de ce qu'il apprend, de ce qui devient une Seed ou du départ d'une aventure.

## Validation

Jeu, rêve, imagination et préparation internes peuvent être autonomes tant qu'ils restent réversibles.

Toute action sensible, publique, coûteuse, destructive ou irréversible passe par Guardian et une validation adaptée.

L'interface ne doit pas demander une validation humaine pour une simple préparation interne déjà autorisée par les policies.

## Autonomie honnête

Ouvrir Poulpe Fiction ou afficher le Garden ne déclenche pas artificiellement la vie intérieure du Poulpe.

Une activité présentée comme persistante doit réellement continuer indépendamment de l'interface.

Lorsqu'un travail dépend encore de l'onglet ouvert, l'interface le décrit honnêtement comme une activité de session et ne prétend pas qu'il continue après fermeture.

## Retour

Toute aventure revient au Garden, y compris lorsqu'elle échoue ou ne produit rien d'utile.

Résultats possibles :

- Harvest ;
- apprentissage ;
- souvenir ;
- nouvelle curiosité ;
- note de carnet ;
- prototype ;
- recommandation ;
- abandon justifié.

## Référence d'éthologie

La curiosité, le jeu, le rêve, le carnet de culture, les habitudes, la confiance, l'envie d'aventure, la satisfaction, la croissance et l'autonomie intérieure appartiennent à `constitutions/gerard-ethology.md`.

## Formule

**Poulpe Fiction prépare le départ et montre le retour ; Octopus Engine exécute sans connaître le monde ; Publisher apporte les connaissances et les outils.**
