# ADR-0008 — Garden ownership and neutral engine boundary

## Status

Accepted.

This decision clarifies the ownership of the Garden before any code migration.

## Context

Octopus Engine currently contains active Garden concepts such as parcels, Seeds, Sprouts, GardenStore, GardenProjector and Seed resonance commands.

This contradicts the Core Constitution, which defines Octopus Engine as a neutral orchestration and execution engine without application-specific business knowledge.

At the same time, Poulpe Fiction already owns the user-facing concepts that give the Garden its meaning: Gérard, parcels, Seeds, adventures, returns, Harvests and Production Packs.

Publisher must remain the curator and technical observatory for Knowledge Packs, Tool Packs, providers, costs, credits, connections and diagnostics.

## Decision

### Octopus Engine

Octopus Engine remains neutral.

It owns generic execution contracts, capabilities, policies, resources, events, traces, diagnostics and authorization handling.

It does not own or expose Garden, Parcel, Seed, Sprout, Compost, Harvest, Gérard, curiosity, cultivation or Blacklace as Core concepts.

Application context may cross the engine boundary only as opaque metadata or correlation identifiers.

### Poulpe Fiction

Poulpe Fiction owns the Garden domain and its visible experience.

Within Poulpe Fiction, the departure cabin and the Garden remain conceptually distinct components:

- the departure cabin handles conversation, preparation, bags, picnics, grafts, games, dreams and adventure departure;
- the Garden shows parcels, Seeds, activities, obstacles, returns and Harvests.

They belong to the same application and repository, but they do not collapse into one responsibility.

The Garden remains a read model and visible projection. It does not create the Poulpe's inner life or replace the authoritative organs that produce events.

### Blacklace Publisher

Publisher remains the curator, Knowledge Observatory and provider broker.

It owns Knowledge Packs, Tool Packs, provider evaluation, costs, credits, alternatives, connections, OAuth, Composio and technical diagnostics.

Its infrastructure and configuration area is named `Local technique` in the user interface.

Publisher may provide generic shared persistence, but it does not become the owner of Poulpe Fiction parcels or Garden business rules.

## Canonical flow

```text
User
  → Poulpe Fiction / departure cabin
  → Poulpe Fiction / Garden domain and adapters
  → Publisher for knowledge, tools and available routes
  → Octopus Engine for neutral execution
  → Poulpe Fiction interprets the neutral result
  → Garden projection shows activity, obstacle, learning or Harvest
```

## Autonomy

Opening Poulpe Fiction or displaying the Garden must not fabricate activity.

Persistent inner activity must exist independently of the interface. When no persistent background execution exists, the interface must describe session-bound work honestly and must not claim that work continues after the tab is closed.

## Migration rule

The migration order is mandatory:

1. Poulpe Fiction receives and tests the Garden domain.
2. Poulpe Fiction adapts Garden operations to neutral Octopus execution contracts.
3. Compatibility adapters are installed where necessary.
4. Octopus Engine removes active Garden concepts and routes.
5. Publisher removes or deprecates any competing Garden business loop and renames infrastructure UI to `Local technique`.

Octopus Engine must not remove the active implementation before Poulpe Fiction has received an equivalent tested implementation.

## Consequences

- Garden-specific code will move out of Octopus Engine.
- The Core Event Bus remains generic; Garden events belong to Poulpe Fiction.
- Publisher's Serre, Radar and Observatoire may remain because they concern tool and knowledge observation, not Gérard's parcels.
- Existing Knowledge Packs, Tool Packs, Connection Broker, Composio integration, Production Plans and Production Packs are preserved.
- No new framework, broker, database or parallel architecture is introduced by this decision.

## Formula

**Poulpe Fiction owns the world and shows the Garden; Publisher knows the resources; Octopus Engine executes without knowing the world; Guardian protects sensitive actions.**
