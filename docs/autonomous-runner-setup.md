# Autonomous Runner — setup initial

Ce composant réveille les missions déjà décidées sans dépendre d'une interface ouverte.

## Variables

- `OCTOPUS_URL` : URL du serveur Octopus, défaut `http://127.0.0.1:3000`.
- `OCTOPUS_WAKE_STORE` : fichier persistant, défaut `.octopus/wakes.json`.
- `OCTOPUS_RUNNER_INTERVAL_MS` : fréquence de vérification, défaut `60000`.

Le fichier indiqué par `OCTOPUS_WAKE_STORE` doit être placé sur un volume persistant lorsque le runner est déployé.

## Lancement

```bash
npm run dev
npm run octopus:runner
```

Exécution unique, adaptée à un cron externe :

```bash
npm run octopus:runner:once
```

## Format initial du store

```json
{
  "version": 1,
  "wakes": [
    {
      "id": "publisher-radar-default",
      "source": "publisher",
      "status": "scheduled",
      "nextRunAt": "2026-07-20T20:00:00.000Z",
      "intervalMs": 3600000,
      "attempts": 0,
      "maxAttempts": 5,
      "createdAt": "2026-07-20T19:00:00.000Z",
      "updatedAt": "2026-07-20T19:00:00.000Z",
      "mission": {
        "title": "Publisher autonomous curation cycle",
        "objective": "Run the authorized curation cycle and persist its neutral result.",
        "requiredCapabilities": ["publisher.curation.run"],
        "authorizedResources": [],
        "context": {
          "id": "publisher:default",
          "label": "Publisher default curation",
          "metadata": {
            "trigger": "autonomous-wake",
            "cycle": "radar"
          }
        }
      }
    }
  ]
}
```

Le runner réutilise ensuite `POST /mission`. Il ne connaît ni parcelle, ni Seed, ni Harvest. Ces concepts restent opaques dans les métadonnées et sont interprétés par l'adaptateur appelant.

## Garanties de cette tranche

- persistance fichier ;
- reprise après redémarrage ;
- lease temporaire ;
- clé d'idempotence par exécution ;
- retry borné ;
- fonctionnement en processus durable ou par cron.

Pour plusieurs instances concurrentes, le store fichier devra être remplacé par un backend avec verrou atomique réel, sans modifier le contrat du runner.
