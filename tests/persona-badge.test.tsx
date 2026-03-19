import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
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
});
