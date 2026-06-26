# Guardian

Guardian est le système immunitaire d'Octopus Runtime.

Il n'est ni un module, ni une tentacule, ni un juge métier.

## Rôle

Guardian protège :

- le moteur ;
- les données ;
- les utilisateurs ;
- les ressources ;
- les connecteurs ;
- les coûts ;
- l'intégrité des missions.

## Niveaux de réaction

### 1. Observer

Surveiller sans intervenir.

### 2. Alerter

Informer le Coordinateur, le Conductor ou l'utilisateur selon le contexte.

### 3. Limiter

Réduire un budget, ralentir un workflow, restreindre une ressource, imposer une validation.

### 4. Isoler

Désactiver temporairement un module, un connecteur, une capacité ou un workflow défaillant.

### 5. Suspendre

Mettre une mission en pause en attendant une décision humaine ou une condition plus sûre.

### 6. Bloquer

Empêcher immédiatement une action en cas de risque critique : fuite de données, coût incontrôlé, violation de policy, action dangereuse ou intégrité compromise.

## Limites

Guardian ne doit jamais :

- choisir l'objectif métier ;
- inventer une stratégie de contenu ;
- décider d'une campagne ;
- rédiger à la place d'un module ;
- publier à la place du Publisher ;
- se substituer au Coordinateur.

## Configuration

Les policies définissent les seuils, niveaux de réaction, budgets et règles de validation.

Guardian applique ces limites, mais ne les invente pas seul.