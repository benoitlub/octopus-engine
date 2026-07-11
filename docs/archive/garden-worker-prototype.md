# Garden Worker Prototype

Ce document archive un ancien prototype non canonique.

Il ne définit pas la Constitution Garden.

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
