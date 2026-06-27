/**
 * Tests Guardian — Octopus Engine V1
 *
 * Teste le niveau 3 "Limiter" : validation des capabilities.
 * Ces tests sont des tests de frontières architecturales (docs/testing-boundaries.md) :
 * Guardian peut bloquer, mais ne produit jamais de stratégie métier.
 */
import { describe, it, expect } from "vitest";
import { Guardian } from "../guardian.js";
import type { Capability } from "../types.js";

const BASE_CAPS: Capability[] = [
  { id: "text_generation", description: "Génération de texte" },
  { id: "outline_builder", description: "Construction de plans" },
  { id: "text_analysis", description: "Analyse de texte" },
];

describe("Guardian", () => {
  it("laisse passer quand toutes les capabilities requises sont enregistrées", () => {
    const guardian = new Guardian(BASE_CAPS);
    expect(() => guardian.validate(["text_generation", "outline_builder"])).not.toThrow();
  });

  it("laisse passer avec une liste vide", () => {
    const guardian = new Guardian([]);
    expect(() => guardian.validate([])).not.toThrow();
  });

  it("laisse passer avec une seule capability", () => {
    const guardian = new Guardian(BASE_CAPS);
    expect(() => guardian.validate(["text_analysis"])).not.toThrow();
  });

  it("lève 'Capability missing: <id>' pour la première capability absente", () => {
    const guardian = new Guardian(BASE_CAPS);
    expect(() => guardian.validate(["text_generation", "profile_synthesizer"])).toThrow(
      "Capability missing: profile_synthesizer",
    );
  });

  it("court-circuite sur la première capability manquante", () => {
    const guardian = new Guardian([]);
    expect(() => guardian.validate(["text_generation", "outline_builder"])).toThrow(
      "Capability missing: text_generation",
    );
  });

  it("bloque quand le Guardian n'a aucune capability enregistrée", () => {
    const guardian = new Guardian([]);
    expect(() => guardian.validate(["n'importe_quoi"])).toThrow(
      "Capability missing: n'importe_quoi",
    );
  });

  it("has() retourne true pour une capability enregistrée", () => {
    const guardian = new Guardian(BASE_CAPS);
    expect(guardian.has("text_generation")).toBe(true);
  });

  it("has() retourne false pour une capability inconnue", () => {
    const guardian = new Guardian(BASE_CAPS);
    expect(guardian.has("capability_inconnue")).toBe(false);
  });

  it("list() retourne toutes les capabilities enregistrées", () => {
    const guardian = new Guardian(BASE_CAPS);
    const ids = guardian.list().map((c) => c.id);
    expect(ids).toContain("text_generation");
    expect(ids).toContain("outline_builder");
    expect(ids).toHaveLength(3);
  });
});
