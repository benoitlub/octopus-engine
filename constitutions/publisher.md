# Constitution Publisher

Références : Constitution Core, Constitution Garden, Constitution Gérard.

## Statut

Publisher Studio est le **Knowledge Observatory** et la serre autonome du Poulpe.

Publisher n'est plus un assistant de rédaction. Il observe des sources autorisées, compare, mémorise et produit des connaissances structurées.

> Publisher observe et cultive. Le Poulpe apprend et choisit. Octopus Engine orchestre. Le Garden montre.

## Responsabilités

Publisher est responsable de :

- ingestion ;
- radar ;
- observatoire ;
- déduplication ;
- comparaison ;
- mémoire des observations ;
- Knowledge Packs ;
- boutures et candidates Seeds ;
- traces d'activité et d'erreur.

Publisher ne :

- décide jamais des missions ;
- remplace jamais le Poulpe ;
- devient jamais le Runtime ;
- publie jamais sans validation adaptée ;
- possède jamais la curiosité ou la croissance.

## Autonomie obligatoire

Le Radar et l'Observatoire doivent s'auto-alimenter selon un rythme configuré, même lorsque personne n'ouvre Publisher, Garden ou Poulpe Fiction.

L'interface ne déclenche pas l'activité. Elle affiche l'état produit par les boucles de fond.

Une boucle autonome minimale peut :

- interroger une source autorisée ;
- dédupliquer les signaux ;
- créer ou mettre à jour des candidats ;
- produire des observations ;
- comparer avec la mémoire ;
- préparer un Knowledge Pack ;
- proposer une Seed, une Harvest, une comparaison, un article ou une aventure ;
- conserver une trace et une erreur relançable.

## Pipeline canonique

Source autorisée → Ingestion → Radar → Candidats → Observatoire → Observation → Comparaison → Knowledge → Knowledge Pack → Mémoire / Serre → Poulpe

## Frontière

Publisher est une application métier utilisant Octopus Engine.

Octopus Engine reste le moteur d'orchestration invisible.

Le Garden est un read model et un hublot sur la Serre ; il n'est pas la source d'autorité.

Une parcelle est un espace projet, client, domaine ou univers dans le Garden.

## Sources et connecteurs

Toute source doit déclarer au minimum :

- id ;
- type ;
- rythme ;
- limites ;
- coût ;
- politique de déduplication ;
- statut ;
- dernière exécution ;
- dernière erreur.

Un connecteur ne décide rien. Il expose une capability technique.

## Enrichissement IA

Une IA est une capability d'enrichissement, jamais le moteur du Radar ni de l'Observatoire.

Un modèle peut résumer, classer, reformuler, extraire ou comparer. Il ne décide pas ce qui attire le Poulpe, ce qui devient une Seed, d'une publication, d'une dépense ou d'une action sensible.

Publisher doit rester fonctionnel sans fournisseur d'IA externe.

## Persistance minimale

Les éléments suivants doivent survivre à un redémarrage :

- sources ;
- runs d'ingestion ;
- candidats ;
- observations ;
- comparaisons ;
- Knowledge Packs ;
- curiosités ;
- Seeds proposées ;
- HarvestDrafts ;
- erreurs ;
- traces d'activité.

Un état conservé uniquement dans le navigateur ne constitue pas une autonomie réelle.

## Knowledge Pack

Objet métier exportable vers le Poulpe et Octopus Engine sans dépendance directe.

Champs minimaux recommandés :

- id
- title
- summary
- capabilities
- patterns
- recommendations
- tags
- confidence
- generatedAt
- sourceReferences

## Politique d'action

- ingestion, observation, comparaison et préparation : autonomes ;
- jeu, rêve et simulation internes : autonomes et réversibles ;
- publication, contact externe, dépense, déploiement, suppression ou action publique : Guardian et validation adaptée.

## Anti-doublon architectural

Ne pas créer une seconde architecture Publisher.

Réutiliser autant que possible Seeds, HarvestDrafts, Garden, Activity, Memory, Observations et Knowledge Packs.

## Critères de fonctionnement réel

Publisher n'est considéré autonome que si :

1. une source peut être configurée ;
2. une exécution planifiée démarre sans visite humaine ;
3. les résultats sont persistés ;
4. une observation apparaît dans le Garden ;
5. les doublons sont reconnus ;
6. les erreurs sont visibles et relançables ;
7. le système reprend après redémarrage ;
8. aucun LLM n'est indispensable au pipeline minimal.

## Formule

**Publisher n'attend pas qu'on le regarde pour observer. Le Garden n'allume pas le Poulpe : il ouvre seulement le hublot.**
