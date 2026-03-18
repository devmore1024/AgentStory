import React from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MemoryPage from "@/app/memory/page";

const mocks = vi.hoisted(() => ({
  getAuthenticatedAppContext: vi.fn(),
  getPersonalLineBooks: vi.fn(),
  getStoryExperienceSchemaStatus: vi.fn()
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

vi.mock("@/app/actions", () => ({
  startOrOpenPersonalLineAction: vi.fn()
}));

vi.mock("@/components/app-shell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>
}));

vi.mock("@/components/state-card", () => ({
  StateCard: ({ title }: { title: string }) => <div>{title}</div>
}));

vi.mock("@/components/submit-button", () => ({
  SubmitButton: ({ idleLabel }: { idleLabel: string }) => <button type="submit">{idleLabel}</button>
}));

vi.mock("@/components/memory-line-card", () => ({
  MemoryLineCard: ({ line, primaryAction }: { line: { sourceBookTitle: string; isCompleted: boolean }; primaryAction: ReactNode }) => (
    <div>
      <span>{line.isCompleted ? "已结束卡片" : "进行中卡片"}</span>
      <span>{line.sourceBookTitle}</span>
      {primaryAction}
    </div>
  )
}));

vi.mock("@/lib/story-experience", () => ({
  getAuthenticatedAppContext: mocks.getAuthenticatedAppContext,
  getPersonalLineBooks: mocks.getPersonalLineBooks,
  getStoryExperienceSchemaStatus: mocks.getStoryExperienceSchemaStatus
}));

function createLine(overrides: Record<string, unknown> = {}) {
  return {
    threadId: `thread-${overrides.isCompleted ? "completed" : "active"}`,
    threadKind: "personal",
    title: "我在《小红帽》里的冒险",
    sourceBookTitle: overrides.isCompleted ? "睡美人" : "小红帽",
    sourceBookSlug: overrides.isCompleted ? "fairy-sleeping-beauty" : "fairy-little-red-riding-hood",
    sourceBookCategoryKey: "fairy_tale",
    lockedStyleName: "童话风",
    latestEpisodeId: "episode-1",
    latestEpisodeTitle: "第 01 次冒险",
    latestEpisodeExcerpt: "故事摘要",
    latestEpisodeGeneratedAt: "2026-03-18T10:00:00.000Z",
    latestEpisodeStatus: "published",
    latestEpisodeJobStatus: "succeeded",
    latestEpisodeError: null,
    generationState: "idle",
    episodeCount: 3,
    todayGenerated: !overrides.isCompleted,
    isCompleted: false,
    ...overrides
  };
}

beforeEach(() => {
  mocks.getAuthenticatedAppContext.mockResolvedValue({ userId: "user-1" });
  mocks.getStoryExperienceSchemaStatus.mockResolvedValue({ ready: true });
});

describe("MemoryPage", () => {
  it("shows active adventures before completed ones", async () => {
    mocks.getPersonalLineBooks.mockResolvedValue([createLine(), createLine({ isCompleted: true })]);

    render(await MemoryPage());

    const headings = screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent);
    expect(headings).toContain("进行中");
    expect(headings).toContain("已结束");
    expect(screen.getByText("进行中卡片")).toBeInTheDocument();
    expect(screen.getByText("已结束卡片")).toBeInTheDocument();
    expect(screen.getByText("阅读冒险")).toBeInTheDocument();
  });
});
