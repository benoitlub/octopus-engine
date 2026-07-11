# Constitution Garden

Références : Constitution Core, Constitution Publisher, Constitution Gérard.

Le Garden conserve et montre.

Le Garden est le territoire de travail.

Une parcelle est un espace client/projet/domaine dans le Garden.

Le Garden n'est pas un organe du Poulpe : c'est son territoire d'action.

Le Garden est un READ MODEL.

Il est alimenté par des événements.

Il n'est jamais la source d'autorité.

Le Garden montre.

Il ne décide jamais.

Il ne pilote jamais.

Il ne possède jamais les règles métier.

## Cycle

Seeds/WIP/Harvest = cycle de culture.

Une Seed ne pousse PAS toute seule.

La croissance appartient au Poulpe.

Le Garden ne fait que conserver son évolution.

Publisher nourrit parfois une Seed avec de nouvelles observations.

Guardian protège sa croissance.

Le jardinier influence l'écosystème.

Le Garden ne possède jamais la croissance.

## GardenProjector

GardenProjector

dont le rôle est :

Events
    ↓
Projection
    ↓
Garden

Le Garden ne modifie jamais directement :

- CapabilityRegistry
- Guardian
- Runtime
- Publisher
- Poulpe

## Vue sur jardin

Vue sur jardin

Cette interface permet :

Observer

et

Envoyer des commandes.

Exemple :

Modifier seuil curiosité
↓

commande

↓

Poulpe

↓

événement

↓

GardenProjector

↓

Garden

Même principe pour Publisher, Guardian et Octopus.

Les boutons envoient des COMMANDES.

Ils ne modifient jamais directement les organes.

## Rapport

Le Garden Worker produit un GardenReport :

```ts
{
  generatedAt,
  parcels: [
    {
      parcel,
      totalMissions,
      seedsCount,
      wipCount,
      harvestReadyCount,
      recommendations: []
    }
  ],
  globalRecommendations: []
}
```

## Règles simples

- si une parcelle a au moins 1 seed et 0 wip : recommander de promouvoir une graine en WIP.
- si une parcelle a au moins 1 wip : recommander de préparer une récolte.
- si une mission contient “Yael” ou parcelle “Yael Bali” : recommander audit Facebook, carte de visite, campagne courte.
- si aucune mission : recommander de créer une première mission.

## Frontière

Publisher AI collecte et affiche.

Octopus mock structure et propose.

Aucun vrai appel réseau.

Pas de nouveau personnage.

Pas de lore Blacklace dans la logique.

## Capability Registry

Le registre vivant des capabilities n'appartient PAS au Garden.

Le Garden peut en afficher une projection.

L'autorité reste dans le Core.

## Guardian

Guardian décide.

Garden affiche.

Ne jamais faire :

GardenStore
↓

isole une capability

Mais :

Guardian
↓

CapabilityRegistry
↓

EventBus
↓

GardenProjector
↓

Garden
