import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeFairyShelfGrid } from "@/components/home-fairy-shelf-grid";

describe("HomeFairyShelfGrid", () => {
  it("uses a single-column mobile layout and five columns on desktop", () => {
    render(
      <HomeFairyShelfGrid>
        <div>book</div>
      </HomeFairyShelfGrid>
    );

    const grid = screen.getByTestId("home-fairy-shelf-grid");

    expect(grid.className).toContain("grid-cols-1");
    expect(grid.className).toContain("sm:grid-cols-2");
    expect(grid.className).toContain("md:grid-cols-3");
    expect(grid.className).toContain("lg:grid-cols-5");
  });
});
