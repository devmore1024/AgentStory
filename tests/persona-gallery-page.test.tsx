import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PersonaSvgGalleryPage from "@/app/me/personas/page";
import { animalPersonas } from "@/lib/animal-personas";

afterEach(() => {
  cleanup();
});

vi.mock("@/components/app-shell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>
}));

vi.mock("@/components/page-back-button", () => ({
  PageBackButton: ({ fallbackHref, title }: { fallbackHref: string; title: string }) => (
    <div data-testid="page-back-button">
      {title}:{fallbackHref}
    </div>
  )
}));

describe("PersonaSvgGalleryPage", () => {
  it("shows every animal persona with both summary and detailed svg panels", async () => {
    render(await PersonaSvgGalleryPage());

    expect(screen.getByTestId("page-back-button")).toHaveTextContent("人格图谱:/me");

    for (const persona of Object.values(animalPersonas)) {
      expect(screen.getByTestId(`persona-svg-card-${persona.animalType}`)).toHaveTextContent(persona.animalName);
      expect(screen.getByTestId(`persona-badge-panel-${persona.animalType}`)).toHaveTextContent("简略 SVG");
      expect(screen.getByTestId(`persona-portrait-panel-${persona.animalType}`)).toHaveTextContent("详细 SVG");
      expect(screen.getByRole("img", { name: `${persona.animalName}动物人格头像` })).toBeInTheDocument();
    }
  });
});
