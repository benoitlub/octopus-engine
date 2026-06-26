# Policies

Les policies définissent comment Octopus doit se comporter dans un contexte donné sans modifier le moteur.

## Principe

Le moteur définit la physique.

Les policies définissent les règles de vie.

## Exemples de policies

- budget maximum par mission ;
- latence maximum ;
- niveau de créativité ;
- validation humaine obligatoire ;
- stratégie de routage ;
- seuils de circuit breaker ;
- permissions ;
- isolation mémoire ;
- règles de promotion ou de désactivation ;
- comportement mobile vs cloud.

## Ce qu'une policy ne doit pas faire

Une policy ne doit pas contenir de logique métier métier profonde.

Elle oriente le moteur, elle ne remplace pas les modules.

## Exemple conceptuel

```yaml
application: blacklace-publisher
budget:
  max_cost_per_mission: 0.20
  max_latency_seconds: 30
routing:
  strategy: weighted-performance
safety:
  human_validation_required_for:
    - publish
    - send_email
memory:
  isolation: tenant
```

## Pourquoi c'est important

Deux applications peuvent utiliser le même moteur avec des comportements très différents.

Clochette privilégiera la latence, l'intimité et la mémoire longue.

Publisher privilégiera la qualité rédactionnelle, la planification et la capacité batch.

Le moteur reste identique.