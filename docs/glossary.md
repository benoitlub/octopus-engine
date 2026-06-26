# Glossaire Octopus Engine

## Application

Produit qui utilise Octopus Engine : Blacklace Publisher, Clochette Lite, Creature-Sync, Blacklace Echo, etc.

## Capability

Contrat versionné décrivant ce qu'il est possible de faire, indépendamment du connecteur réel.

## Connector

Adaptateur vers un système externe : Notion, GitHub, Gmail, Meta, provider IA, fichier, base de données.

## Conductor

Couche visible par l'utilisateur. Porte la persona, le ton, la reformulation et la relation utilisateur.

## Coordinator

Runtime technique qui interprète un workflow et orchestre les modules.

## Engine

Code partagé, contrats, schémas, lois, ADR et composants réutilisables.

## Guardian

Système immunitaire du runtime. Observe, alerte, limite, isole, suspend ou bloque selon les policies et le niveau de risque.

## Mission

Objectif exprimé par l'utilisateur ou déclenché par une policy autorisée.

## Module

Composant spécialisé qui reçoit une tâche locale et produit une sortie. Il ne connaît jamais les autres modules.

## Module Task

Portion locale d'un workflow remise à un module.

## Policy

Règle de vie appliquée à un contexte : budgets, permissions, seuils, validations, sécurité, routage.

## Runtime

Instance d'exécution du moteur dans un contexte donné : application, tenant, policies, mémoire, credentials et workflows disponibles.

## Workflow

Partition déclarative, versionnée et rejouable décrivant le graphe d'exécution d'une mission.