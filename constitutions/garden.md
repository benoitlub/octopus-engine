# Constitution Garden

Références : Constitution Core, Constitution Publisher, Constitution Gérard, ADR-0008.

## Nature

Le Garden conserve et montre.

Il est le territoire de travail et le **hublot visible** sur les parcelles, curiosités, cultures, récoltes et activités du Poulpe.

Le Garden est un **composant métier et visuel de Poulpe Fiction**.

Il reste conceptuellement distinct de la cabane de départ : Poulpe Fiction prépare et accompagne les aventures ; le Garden montre les parcelles, activités, obstacles et retours.

Le Garden est un **read model** alimenté par des événements.

Il n'est jamais la source d'autorité.

Le Garden :

- montre ;
- conserve des projections ;
- permet d'envoyer des commandes ;
- n'invente pas l'activité ;
- ne décide pas ;
- ne pilote pas ;
- ne possède pas les règles métier ;
- n'appartient ni à Octopus Engine ni à Publisher.

Une interface révèle l'activité déjà produite. L'ouverture du Garden ne déclenche ni Radar, ni Observatoire, ni curiosité, ni croissance.

## Parcelles

Une parcelle représente un projet, un client, un domaine, un produit ou un univers.

Les parcelles préservent leur contexte tout en autorisant des résonances explicites entre domaines.

Leur schéma, leur sens et leur visibilité appartiennent à Poulpe Fiction. Une infrastructure externe peut les persister sans devenir propriétaire du domaine.

## Cycle de culture

Seeds → WIP → Harvest représente le cycle visible de culture.

Une Seed ne pousse pas parce qu'elle est affichée.

La croissance appartient au Poulpe. Publisher peut nourrir une Seed avec de nouvelles observations. Guardian protège le passage vers les actions sensibles.

Le Garden conserve et montre cette évolution sans la posséder.

## GardenProjector

Flux canonique :

Events métier Poulpe Fiction → GardenProjector → Garden

Le GardenProjector appartient à Poulpe Fiction.

Le Garden ne modifie jamais directement :

- CapabilityRegistry ;
- Guardian ;
- Runtime ;
- Publisher ;
- le Poulpe.

## Commandes

Les actions de l'interface envoient des commandes aux organes responsables.

Exemple :

Modifier un seuil de curiosité → commande → Poulpe → événement → GardenProjector → Garden

Les boutons ne modifient jamais directement les organes ou les projections.

## Capability Registry

Le registre vivant des capabilities n'appartient pas au Garden.

Le Garden peut en afficher une projection. L'autorité reste dans le Core.

## Guardian

Guardian protège, limite ou bloque selon les policies et le niveau de risque. Il ne décide jamais du métier.

Le Garden affiche ses décisions et leurs traces.

Flux attendu :

Guardian → CapabilityRegistry / Runtime → Event Bus → adapter Poulpe Fiction → GardenProjector → Garden

Jamais :

GardenStore → modification directe de Guardian ou d'une capability

## Retour des explorations

Toute exploration doit pouvoir revenir au Garden sous une forme visible ou mémorisable :

- Harvest ;
- apprentissage ;
- curiosité ;
- note de carnet ;
- échec explicite ;
- abandon justifié.

## Formule

**Le Garden est le hublot de Poulpe Fiction sur la vie du Poulpe ; il la montre sans la créer.**
