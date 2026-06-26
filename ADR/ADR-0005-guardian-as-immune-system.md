# ADR-0005 — Guardian est le système immunitaire du runtime

## Statut

Accepté — v0.2.

## Contexte

Les premières versions de la documentation décrivaient Guardian comme un organe ou un ensemble de contrôles, mais la Constitution ne fixait pas clairement ses limites.

Un composant de sécurité trop libre peut devenir un second Coordinateur caché : il protège sous prétexte de sécurité, mais finit par prendre des décisions métier.

## Décision

Guardian est un système immunitaire intégré au runtime.

Il observe, évalue les risques et protège le moteur, les données, les ressources et les utilisateurs.

Il peut :

- observer ;
- alerter ;
- limiter ;
- isoler ;
- suspendre ;
- bloquer.

Il ne peut jamais :

- définir les objectifs métier ;
- choisir la stratégie produit ;
- décider du contenu final ;
- se substituer au Coordinateur pour conduire une mission.

## Conséquences

- Guardian peut agir en urgence.
- Guardian reste proportionné au niveau de risque.
- Les décisions métier restent dans les workflows, modules et personas appropriés.
- Les policies peuvent configurer son niveau de réaction.

## Alternatives rejetées

### Guardian comme module

Rejeté : il deviendrait une tentacule transversale et créerait des boucles de contrôle.

### Guardian comme juge métier

Rejeté : cela créerait un second centre de décision contraire à la Constitution.

### Guardian uniquement observateur

Rejeté : insuffisant en cas de danger critique, coût incontrôlé, fuite de données ou violation de sécurité.