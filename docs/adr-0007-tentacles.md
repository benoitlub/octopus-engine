# ADR-0007 — Tentacles as autonomous capability groups

Status: accepted

## Context

Octopus Engine must not become a pile of direct tool calls. The engine needs a stable way to group tools by theme while keeping the Core independent from any provider.

A tentacle is a thematic capability group. It can contain several resources or modules dedicated to a domain, such as marketing, publishing, development, research, edition, or operations.

## Decision

Octopus Engine treats tentacles as interchangeable, evolutive and measurable capability groups.

A tentacle:

- groups capabilities by theme;
- can act autonomously for basic actions already approved by policy;
- can request authorization for costly, sensitive or uncertain resources;
- can be replaced by another tentacle with the same role;
- should not be overloaded if another tentacle is more appropriate;
- can mutate over time when better modules or resource combinations are discovered;
- keeps effectiveness signals so Octopus can prioritize proven tentacles;
- can be put under observation, paused, or retired when it performs poorly.

## Biological metaphor

Like a real octopus, each tentacle has a degree of local autonomy.

The Core remains sovereign, but the tentacle can handle routine actions inside its theme without forcing every micro-step back into the central planner.

## Rules

1. The Core decides which tentacle is appropriate for a mission.
2. A tentacle never becomes the Core.
3. Resources attached to a tentacle remain replaceable.
4. A tentacle should expose its capabilities, health, and recent effectiveness.
5. A tentacle can mutate: tools may be added, removed, promoted, downgraded, or quarantined.
6. Octopus should prefer already trained and effective tentacles unless exploration is useful.
7. If a tentacle is saturated or not fit for a mission, the planner should select another one or split the work.

## Examples

Marketing tentacle:

- campaign.generate
- social.schedule
- social.publish
- metricool connector
- mistral resource

Edition tentacle:

- manuscript.format
- kdp.metadata
- cover.brief
- amazon keyword helper

Development tentacle:

- github.inspect
- codex.patch
- build.verify
- deploy.prepare

## Consequences

World adapters do not know which tentacle is used.

Clients see outcomes only.

The gardener may inspect tentacle health and authorize mutations or resource use.
