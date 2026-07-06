# ADR-0007 — Garden, autonomie du Poulpe et évaluation par Guardian

## Statut

Accepté — à implémenter progressivement.

## Contexte

La relecture de la Constitution, de la Bible et de la documentation Garden/Guardian confirme plusieurs invariants déjà posés :

- Octopus reçoit une intention en langage naturel, la transforme en actions structurées, orchestre les capacités, conserve les décisions importantes et protège la cohérence du système.
- L'utilisateur exprime un objectif, pas une procédure.
- Le Knowledge Garden est organisé en parcelles.
- Une parcelle représente un domaine, un projet, un client, un produit ou un univers.
- Le cycle canonique est : Intent → Graines → Resonance → Harvest → Runtime.
- Le Garden n'est pas Octopus, pas une tentacule, pas un module et pas le Runtime.
- Octopus ne possède pas le Garden : il le cultive.
- Les graines appartiennent au Garden et représentent les intentions, idées, opportunités, signaux faibles et demandes encore non structurées.
- Les récoltes doivent être traçables et correspondre à une Harvest exploitable par le Runtime.
- Le registre vivant des capacités appartient au Garden, pas au Poulpe.
- Guardian est le système immunitaire : il observe, alerte, limite, isole, suspend ou bloque selon les policies et le niveau de risque.
- Guardian protège les coûts, ressources, connecteurs, données, utilisateurs et l'intégrité des missions, mais ne décide jamais du métier.
- Les modules disposent d'une autonomie locale d'exécution, jamais d'une autonomie stratégique.
- Ce qui évolue réellement n'est pas une biologie du code mais le routage, la gouvernance, les poids, les budgets, les policies, les circuits breakers et les traces.

Cette ADR clarifie ce qui manque dans l'implémentation actuelle pour rester fidèle à ces textes, sans créer de nouveau concept concurrent.

## Décision

### 1. Octopus est le jardinier opérationnel

Le rôle actif de culture du Garden appartient à Octopus.

Benoît ou l'utilisateur humain n'est pas le jardinier de micro-décision. Il fixe le cap, fournit l'intention, corrige les valeurs ou tranche seulement quand Octopus atteint un seuil d'incertitude, de risque ou d'ambiguïté défini par policy.

Conséquence : le système ne doit pas demander une validation humaine pour chaque action non sensible. Il doit consulter l'humain seulement lorsque :

- la confiance est insuffisante ;
- plusieurs choix sont corneliens ;
- le coût dépasse un seuil ;
- l'action est sensible ;
- Guardian suspend ou exige une décision ;
- une policy du contexte l'impose.

### 2. Les Seeds restent liées aux parcelles

Les Seeds ne sont pas des tentacules, des prompts système ou des modules techniques.

Une Seed est une entrée de croissance dans une parcelle du Garden : intention, idée, opportunité, signal faible ou demande encore non structurée.

Une Seed peut mûrir, entrer en résonance, générer une pousse, produire une Harvest ou rejoindre le compost.

### 3. Les greffons sont des capacités expérimentales, pas des Seeds

Le terme "greffon" peut être utilisé dans le langage humain pour désigner une capacité, un routage, un connecteur, un module ou une combinaison encore expérimentale.

Dans le langage d'architecture, un greffon doit être représenté comme une entrée du registre vivant des capacités avec :

- id ;
- domaine ;
- capabilities exposées ;
- connecteurs utilisés ;
- niveau de stabilité ;
- coût moyen ;
- taux de succès ;
- limites ;
- permissions ;
- policy associée ;
- traces d'évaluation.

Un greffon ne devient pas "tentacule" par poésie. Il devient capacité stable, routage stable, module stable ou workflow stable après observation et décision documentée.

### 4. Guardian devient l'évaluateur immunitaire, pas le stratège

Guardian peut évaluer :

- coût anormal ;
- hallucination probable ;
- fausse statistique ;
- faux témoignage ;
- sortie trop générique ;
- violation de policy ;
- dérive de style ou de contexte ;
- échec répété d'une capacité ;
- connecteur instable ;
- budget proche du seuil ;
- incohérence avec une Harvest ou une parcelle.

Guardian ne choisit pas la stratégie métier. Il produit un signal immunitaire : observer, alerter, limiter, isoler, suspendre ou bloquer.

### 5. Le Garden doit devenir l'observatoire réel

Le Garden doit afficher et conserver les informations que les adapters clients ne montrent pas :

- parcelles ;
- seeds/graines ;
- pousses ;
- harvests/récoltes ;
- missions ;
- traces ;
- capacités utilisées ;
- coûts ;
- tokens ;
- erreurs ;
- décisions ;
- évaluations Guardian ;
- greffons/capacités expérimentales ;
- niveau de stabilité ;
- routines déclaratives.

Le client final voit le résultat fluide. Le Garden montre la mécanique vivante et auditable.

### 6. Les adapters ne doivent pas devenir le centre

Poulpe Fiction, Clochette, Publisher ou tout autre adapter peuvent exprimer Octopus selon leur vocabulaire et leur persona, mais ne doivent pas contenir la logique métier durable du Core.

La personnalité par défaut visible peut être élégante, calme et courtoise. Une parcelle ou un adapter peut apporter une persona spécifique, mais le Core reste neutre.

## Écarts constatés dans le code actuel

### Déjà présent partiellement

- `GardenStore` conserve des parcelles, missions, événements, récoltes et consommations ressources.
- `/gardener` expose un premier Garden observable.
- `ResourceManager` applique déjà une policy d'autorisation.
- `MistralResource` remonte usage, tokens, durée et coût estimé.
- `EventBus` existe et commence à recevoir des événements de mission.

### Manquant ou incomplet

1. **Seeds / Graines**
   - aucune structure dédiée ;
   - aucune progression Seed → Resonance → Harvest ;
   - aucune zone compost.

2. **Resonance**
   - pas de mécanisme de maturité, cohérence, utilité, persistance ou convergence critique.

3. **Harvest comme frontière stricte**
   - `POST /mission` permet encore une exécution directe depuis une intention ;
   - il faut distinguer mission de test, Harvest stable et Runtime.

4. **Registre vivant des capacités**
   - les ressources/tentacules sont encore codées dans le runtime ;
   - le Garden devrait héberger le registre consultable.

5. **Greffons / capacités expérimentales**
   - pas de statut expérimental ;
   - pas d'évaluation post-mission ;
   - pas de promotion vers capacité stable.

6. **Guardian évaluateur**
   - Guardian existe surtout comme concept et policy simple ;
   - il manque les évaluations post-réponse et les réactions graduées.

7. **Seuils de consultation humaine**
   - la logique actuelle demande autorisation pour Mistral par défaut ;
   - il faut remplacer le modèle "permission systématique" par "consultation si seuil atteint".

8. **Persistance**
   - GardenStore est en mémoire ;
   - les traces disparaissent au redémarrage Render.

9. **Routines déclaratives**
   - absentes du code.

10. **Mémoire cloisonnée par adapter/parcelle**
   - structure encore minimale.

## Conséquences

- Ne pas développer de nouvelles tentacules avant d'avoir stabilisé le registre vivant des capacités.
- Ne pas confondre Seeds et greffons.
- Ne pas transformer Guardian en décideur métier.
- Faire évoluer `/gardener` en cockpit d'observation réel, pas en interface client.
- Remplacer progressivement l'autorisation systématique par des seuils de policy.
- Toute capacité expérimentale doit être mesurée avant d'être officialisée.

## Plan d'implémentation recommandé

1. Ajouter les entités Garden manquantes : Seed, Sprout, CompostEntry, CapabilityRecord, EvaluationRecord.
2. Ajouter un `ResonanceEngine` minimal : score de maturité, cohérence, utilité, coût, confiance.
3. Ajouter un `GuardianEvaluator` post-mission : hallucination, faux chiffres, coût, généricité, policy.
4. Ajouter un registre des capacités dans le Garden.
5. Ajouter un statut expérimental/stable/deprecated aux capacités.
6. Modifier la policy Mistral : demande humaine seulement si coût, risque ou confiance le justifie.
7. Ajouter une persistance simple JSON ou SQLite avant d'accumuler trop de traces.
8. Afficher ces éléments dans `/gardener`.

## Formule courte

Octopus jardine.
Le Garden conserve ce qui pousse.
Les Seeds appartiennent aux parcelles.
Les greffons sont des capacités expérimentales.
Guardian évalue et protège.
L'humain tranche seulement quand le poulpe hésite vraiment.
