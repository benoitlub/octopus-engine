# Prochaines décisions d'architecture

Cette liste prépare les prochaines ADR.

## ADR-0007 — Schéma minimal d'un Workflow

Définir les champs minimaux : id, version, mission_type, steps, transitions, required_capabilities, constraints, inputs, outputs, errors.

## ADR-0008 — Schéma minimal d'une Module Task

Définir ce qu'un module reçoit réellement : task_id, capability, inputs, constraints, local_budget, expected_output, trace_context.

## ADR-0009 — Schéma minimal d'une Capability

Définir les contrats versionnés et leur compatibilité.

## ADR-0010 — Schéma minimal d'une Policy

Définir comment les applications expriment budgets, sécurité, routage, validation humaine, latence et isolation.

## ADR-0011 — Tracing minimal

Définir TraceID, MissionID, WorkflowRunID, ModuleTaskID et liens entre événements.

## ADR-0012 — Tests de frontières

Définir les premiers tests qui empêchent les modules de se connaître ou d'appeler directement les connecteurs.