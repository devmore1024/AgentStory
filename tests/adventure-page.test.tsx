import React from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdventurePage from "@/app/adventure/page";

const mocks = vi.hoisted(() => ({
  getAdventureThreads: vi.fn(),
  getAuthenticatedAppContext: vi.fn(),
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
  continueAdventureAction: vi.fn(),
  joinAdventureAction: vi.fn()
}));

vi.mock("@/components/app-shell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>
}));

vi.mock("@/components/adventure-thread-badges", () => ({
  AdventureThreadBadges: () => <div>badges</div>
}));

vi.mock("@/components/state-card", () => ({
  StateCard: ({ title }: { title: string }) => <div>{title}</div>
}));

vi.mock("@/lib/story-experience", () => ({
  getAdventureThreads: mocks.getAdventureThreads,
  getAuthenticatedAppContext: mocks.getAuthenticatedAppContext,
  getStoryExperienceSchemaStatus: mocks.getStoryExperienceSchemaStatus
}));

function createThread(overrides: Record<string, unknown> = {}) {
  return {
    id: "adventure-1",
    threadKind: "companion",
    title: "在《睡美人》里重新相遇",
    sourceBookTitle: "睡美人",
    sourceBookSlug: "fairy-sleeping-beauty",
    sourceBookCategoryKey: "fairy_tale",
    lockedStyleName: "童话风",
    episodeCount: 1,
    episodeLimit: 10,
    participantCount: 1,
    participantLimit: 5,
    ownerDisplayName: "迪西",
    latestEpisodeTitle: "新的同行已经开始",
    latestEpisodeExcerpt: "故事从荆棘外慢慢打开。",
    latestEpisodeContent: "故事内容",
    latestEpisodeNo: 1,
    latestEpisodeGeneratedAt: "2026-03-18T10:00:00.000Z",
    latestEpisodeStatus: "published",
    latestEpisodeJobStatus: "succeeded",
    latestEpisodeError: null,
    generationState: "idle",
    isOwner: true,
    isParticipant: true,
    isCompleted: false,
    isFull: false,
    isJoinable: false,
    actionState: "continue",
    actionLabel: "继续同行",
    originPersonalThreadId: null,
    originEpisodeId: null,
    ...overrides
  };
}

beforeEach(() => {
  mocks.getAuthenticatedAppContext.mockResolvedValue({ userId: "user-1" });
  mocks.getStoryExperienceSchemaStatus.mockResolvedValue({ ready: true });
});

describe("AdventurePage", () => {
  it("shows a colored badge for the locked style on thread cards", async () => {
    mocks.getAdventureThreads.mockResolvedValue([createThread()]);

    render(await AdventurePage());

    expect(screen.getByText("童话风")).toHaveClass("text-[#9D6A17]");
    expect(screen.getByText("迪西 发起")).toBeInTheDocument();
  });
});
