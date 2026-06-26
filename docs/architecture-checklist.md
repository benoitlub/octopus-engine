# Checklist d'architecture

Avant d'accepter une nouvelle idée, vérifier :

- Respecte-t-elle la Constitution ?
- Nécessite-t-elle une ADR ?
- Appartient-elle au moteur ou à une application ?
- Est-elle une policy plutôt qu'une loi ?
- Peut-elle être retirée proprement ?
- Ajoute-t-elle une complexité justifiée ?
- Supprime-t-elle ou simplifie-t-elle quelque chose ?
- Les modules restent-ils indépendants ?
- Le Coordinateur reste-t-il maigre ?
- Le Guardian reste-t-il protecteur sans devenir juge métier ?
- La métaphore reste-t-elle hors du runtime ?
- Les contrats sont-ils versionnables ?

Si la réponse est floue, on n'implémente pas encore.