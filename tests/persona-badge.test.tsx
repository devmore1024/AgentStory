import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { animalTypes } from "@/lib/animal-personas";
import { badgeFeatureIds, PersonaBadge } from "@/components/persona-badge";

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

  it.each(animalTypes)("defines 5-7 structural anchors for %s", (animalType) => {
    expect(badgeFeatureIds[animalType].length).toBeGreaterThanOrEqual(5);
    expect(badgeFeatureIds[animalType].length).toBeLessThanOrEqual(7);
  });

  it.each(animalTypes)("keeps species-defining silhouette cues for %s", (animalType) => {
    const { container } = render(<PersonaBadge animalType={animalType} size="sm" variant="paper" />);
    const svg = container.querySelector("svg");

    expect(svg).toBeInTheDocument();

    for (const feature of badgeFeatureIds[animalType]) {
      expect(svg?.querySelector(`[data-feature="${feature}"]`)).toBeInTheDocument();
    }
  });

  it.each(animalTypes)("uses only same-color filled detail accents for %s", (animalType) => {
    const { container } = render(<PersonaBadge animalType={animalType} size="sm" variant="paper" />);
    const svg = container.querySelector("svg");

    expect(svg?.querySelectorAll('[data-fill="soft"]').length).toBeGreaterThan(0);
    expect(svg?.querySelectorAll('[fill]:not([fill="none"]):not([fill="currentColor"])').length).toBe(0);
  });

  it("keeps lion mane exclusive from bear and dog badges", () => {
    const lion = render(<PersonaBadge animalType="lion" size="sm" variant="paper" />);
    const bear = render(<PersonaBadge animalType="bear" size="sm" variant="paper" />);
    const dog = render(<PersonaBadge animalType="dog" size="sm" variant="paper" />);

    expect(lion.container.querySelector('[data-feature="lion-mane-outer"]')).toBeInTheDocument();
    expect(lion.container.querySelector('[data-feature="lion-mane-inner"]')).toBeInTheDocument();
    expect(bear.container.querySelector('[data-feature="lion-mane-outer"]')).not.toBeInTheDocument();
    expect(dog.container.querySelector('[data-feature="lion-mane-outer"]')).not.toBeInTheDocument();
  });

  it("keeps cat, fox and wolf species accents distinct", () => {
    const cat = render(<PersonaBadge animalType="cat" size="sm" variant="paper" />);
    const fox = render(<PersonaBadge animalType="fox" size="sm" variant="paper" />);
    const wolf = render(<PersonaBadge animalType="wolf" size="sm" variant="paper" />);

    expect(cat.container.querySelector('[data-feature="cat-whiskers"]')).toBeInTheDocument();
    expect(cat.container.querySelector('[data-feature="fox-tail"]')).not.toBeInTheDocument();
    expect(fox.container.querySelector('[data-feature="fox-tail"]')).toBeInTheDocument();
    expect(fox.container.querySelector('[data-feature="wolf-neck-fur"]')).not.toBeInTheDocument();
    expect(wolf.container.querySelector('[data-feature="wolf-neck-fur"]')).toBeInTheDocument();
    expect(wolf.container.querySelector('[data-feature="cat-whiskers"]')).not.toBeInTheDocument();
  });

  it("keeps swan and crane feature sets distinct", () => {
    const swan = render(<PersonaBadge animalType="swan" size="sm" variant="paper" />);
    const crane = render(<PersonaBadge animalType="crane" size="sm" variant="paper" />);

    expect(swan.container.querySelector('[data-feature="swan-neck"]')).toBeInTheDocument();
    expect(swan.container.querySelector('[data-feature="crane-neck"]')).not.toBeInTheDocument();
    expect(crane.container.querySelector('[data-feature="crane-neck"]')).toBeInTheDocument();
    expect(crane.container.querySelector('[data-feature="swan-neck"]')).not.toBeInTheDocument();
  });

  it("keeps raven and falcon feature sets distinct", () => {
    const raven = render(<PersonaBadge animalType="raven" size="sm" variant="paper" />);
    const falcon = render(<PersonaBadge animalType="falcon" size="sm" variant="paper" />);

    expect(raven.container.querySelector('[data-feature="raven-tail"]')).toBeInTheDocument();
    expect(raven.container.querySelector('[data-feature="falcon-brow"]')).not.toBeInTheDocument();
    expect(falcon.container.querySelector('[data-feature="falcon-brow"]')).toBeInTheDocument();
    expect(falcon.container.querySelector('[data-feature="raven-tail"]')).not.toBeInTheDocument();
  });

  it("keeps dolphin and whale body accents distinct", () => {
    const dolphin = render(<PersonaBadge animalType="dolphin" size="sm" variant="paper" />);
    const whale = render(<PersonaBadge animalType="whale" size="sm" variant="paper" />);

    expect(dolphin.container.querySelector('[data-feature="dolphin-dorsal-fin"]')).toBeInTheDocument();
    expect(dolphin.container.querySelector('[data-feature="whale-fin"]')).not.toBeInTheDocument();
    expect(whale.container.querySelector('[data-feature="whale-fin"]')).toBeInTheDocument();
    expect(whale.container.querySelector('[data-feature="dolphin-dorsal-fin"]')).not.toBeInTheDocument();
  });

  it("keeps hedgehog nose and spine cues visible", () => {
    const { container } = render(<PersonaBadge animalType="hedgehog" size="sm" variant="paper" />);

    expect(container.querySelector('[data-feature="hedgehog-nose"]')).toBeInTheDocument();
    expect(container.querySelector('[data-feature="hedgehog-spines"]')).toBeInTheDocument();
  });
});
