# Gardener Console

The Gardener Console is the private interface between Benoit and Octopus Engine.

It is not a client-facing world adapter.

## Role

The console lets the gardener:

- take news from parcels: clients, projects, products, worlds;
- see what Octopus thinks each parcel needs;
- know whether a parcel should be optimized, improved, paused, or abandoned;
- authorize costly or sensitive resources such as Mistral, Notion, web search, or connectors;
- keep the garden private.

## Constitutional rule

The client sees outcomes.

The gardener sees decisions.

The garden remains private.

## V0 contract

The engine receives ParcelSnapshot objects and returns a GardenReport.

Each ParcelReport contains:

- summary;
- decision;
- nextAction;
- resourceNeeds;
- authorizationQueue when a resource needs human approval.

## Important boundary

Mistral is not the brain.

Mistral is a resource. Octopus decides whether it is needed and asks the gardener for permission when the resource policy requires it.
