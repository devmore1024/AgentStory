import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { animalTypes } from "@/lib/animal-personas";
import { PersonaBadge } from "@/components/persona-badge";

afterEach(() => {
  cleanup();
});

describe("PersonaBadge", () => {
  it("keeps a fixed square footprint inside flex layouts", () => {
    const { container } = render(<PersonaBadge animalType="fox" size="sm" variant="paper" />);
    const badge = container.firstElementChild;

    expect(badge).not.toBeNull();
    expect(badge).toHaveClass("shrink-0");
    expect(badge).toHaveClass("overflow-hidden");
    expect(badge).toHaveClass("h-14");
    expect(badge).toHaveClass("w-14");
  });

  it.each(animalTypes)("renders a badge for %s", (animalType) => {
    const { container } = render(<PersonaBadge animalType={animalType} size="sm" variant="paper" />);

    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it.each([
    {
      animalType: "lion" as const,
      features: ["lion-mane", "lion-muzzle", "lion-ears"]
    },
    {
      animalType: "hedgehog" as const,
      features: ["hedgehog-spines", "hedgehog-nose", "hedgehog-body"]
    },
    {
      animalType: "horse" as const,
      features: ["horse-head", "horse-mane", "horse-muzzle"]
    },
    {
      animalType: "elephant" as const,
      features: ["elephant-ears", "elephant-trunk", "elephant-head"]
    },
    {
      animalType: "swan" as const,
      features: ["swan-neck", "swan-body", "swan-beak"]
    },
    {
      animalType: "crane" as const,
      features: ["crane-neck", "crane-beak", "crane-legs"]
    }
  ])("keeps species-defining silhouette cues for $animalType", ({ animalType, features }) => {
    const { container } = render(<PersonaBadge animalType={animalType} size="sm" variant="paper" />);
    const svg = container.querySelector("svg");

    expect(svg).toBeInTheDocument();

    for (const feature of features) {
      expect(svg?.querySelector(`[data-feature="${feature}"]`)).toBeInTheDocument();
    }
  });
});
