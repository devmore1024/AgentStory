import React from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MePage from "@/app/me/page";
import { animalPersonas } from "@/lib/animal-personas";

const mocks = vi.hoisted(() => ({
  getAuthenticatedAppContext: vi.fn(),
  getStoryExperienceSchemaStatus: vi.fn(),
  getStoryTimelineItems: vi.fn(),
  getPersonalLineBooks: vi.fn(),
  getAdventureThreads: vi.fn(),
  getStoryFootprintView: vi.fn(),
  getStoryTimelineSourceLabel: vi.fn()
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  } & Omit<ComponentPropsWithoutRef<"a">, "href" | "children">) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

vi.mock("@/components/app-shell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>
}));

vi.mock("@/components/persona-card", () => ({
  PersonaCard: () => <div>persona-card</div>
}));

vi.mock("@/components/state-card", () => ({
  StateCard: ({ title }: { title: string }) => <div>{title}</div>
}));

vi.mock("@/components/story-footprint-tabs", () => ({
  StoryFootprintTabs: () => <div>story-footprint-tabs</div>
}));

vi.mock("@/lib/me-page-presentation", () => ({
  getStoryFootprintView: mocks.getStoryFootprintView
}));

vi.mock("@/lib/story-experience", () => ({
  getAuthenticatedAppContext: mocks.getAuthenticatedAppContext,
  getAdventureThreads: mocks.getAdventureThreads,
  getPersonalLineBooks: mocks.getPersonalLineBooks,
  getStoryExperienceSchemaStatus: mocks.getStoryExperienceSchemaStatus,
  getStoryTimelineItems: mocks.getStoryTimelineItems
}));

vi.mock("@/lib/story-experience-helpers", () => ({
  getStoryTimelineSourceLabel: mocks.getStoryTimelineSourceLabel
}));

beforeEach(() => {
  mocks.getAuthenticatedAppContext.mockResolvedValue({
    userId: "user-1",
    displayName: "迪西",
    persona: {
      ...animalPersonas.fox,
      mappingReason: "系统识别到观察、判断和转圜。"
    }
  });
  mocks.getStoryExperienceSchemaStatus.mockResolvedValue({ ready: true });
  mocks.getStoryTimelineItems.mockResolvedValue([]);
  mocks.getPersonalLineBooks.mockResolvedValue([]);
  mocks.getAdventureThreads.mockResolvedValue([]);
  mocks.getStoryFootprintView.mockReturnValue({
    ownedCount: 0,
    joinedCount: 0,
    ownedItems: [],
    joinedItems: []
  });
  mocks.getStoryTimelineSourceLabel.mockReturnValue("冒险记录");
});

describe("MePage", () => {
  it("does not expose the persona svg gallery entry on the main me page", async () => {
    render(await MePage({ searchParams: Promise.resolve({}) }));

    expect(screen.queryByText("人格视觉图谱")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "打开人格图谱页" })).not.toBeInTheDocument();
  });
});
