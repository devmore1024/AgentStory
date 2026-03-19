import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { animalPersonas } from "@/lib/animal-personas";
import { PersonaPortrait } from "@/components/persona-portrait";

afterEach(() => {
  cleanup();
});

const portraitCases = Object.values(animalPersonas).map((persona) => ({
  animalType: persona.animalType,
  label: `${persona.animalName}动物人格头像`
}));

describe("PersonaPortrait", () => {
  it.each(portraitCases)("renders a detailed svg portrait for $animalType", ({ animalType, label }) => {
    const { container } = render(<PersonaPortrait animalType={animalType} mood="bright" />);

    expect(screen.getByRole("img", { name: label })).toHaveAttribute("viewBox", "0 0 128 128");
    expect(container.querySelector("linearGradient[id^='persona-portrait-primary-']")).toBeInTheDocument();
    expect(container.querySelector("linearGradient[id^='persona-portrait-secondary-']")).toBeInTheDocument();
  });

  it("includes shared animation styles with reduced-motion fallback", () => {
    const { container } = render(<PersonaPortrait animalType="fox" mood="bright" />);
    const style = container.querySelector("style");

    expect(style).toHaveTextContent("persona-portrait-float");
    expect(style).toHaveTextContent("persona-portrait-blink");
    expect(style).toHaveTextContent("prefers-reduced-motion");
  });
});
