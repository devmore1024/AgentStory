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

  it("renders owned companion threads as current serial entries with a book-detail secondary action", async () => {
    mocks.getAdventureThreads.mockResolvedValue([createThread()]);

    render(await AdventurePage());

    expect(screen.getByRole("link", { name: "当前连载" })).toHaveAttribute("href", "/adventure/adventure-1");
    expect(screen.getByRole("link", { name: "阅读原故事" })).toHaveAttribute("href", "/books/fairy-sleeping-beauty/read");
    expect(screen.queryByRole("button", { name: "继续同行" })).not.toBeInTheDocument();
    expect(screen.getByText(/这是你当前正在推进的同行连载/)).toBeInTheDocument();
  });

  it("renders joined companion threads as joinable square entries instead of current serial entries", async () => {
    mocks.getAdventureThreads.mockResolvedValue([
      createThread({
        id: "adventure-2",
        isOwner: false,
        isParticipant: true,
        ownerDisplayName: "安宁",
        actionState: "join",
        actionLabel: "加入同行"
      })
    ]);

    render(await AdventurePage());

    expect(screen.getByRole("button", { name: "加入同行" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "阅读" })).toHaveAttribute("href", "/adventure/adventure-2");
    expect(screen.queryByRole("link", { name: "当前连载" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "阅读原故事" })).not.toBeInTheDocument();
    expect(screen.queryByText(/这是你当前正在参与的同行连载/)).not.toBeInTheDocument();
  });

  it("keeps joinable square cards with join and read actions", async () => {
    mocks.getAdventureThreads.mockResolvedValue([
      createThread({
        id: "adventure-3",
        isOwner: false,
        isParticipant: false,
        actionState: "join",
        actionLabel: "加入同行"
      })
    ]);

    render(await AdventurePage());

    expect(screen.getByRole("button", { name: "加入同行" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "阅读" })).toHaveAttribute("href", "/adventure/adventure-3");
    expect(screen.queryByRole("link", { name: "当前连载" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "阅读原故事" })).not.toBeInTheDocument();
  });

  it("keeps watch-only cards with just the read action", async () => {
    mocks.getAdventureThreads.mockResolvedValue([
      createThread({
        id: "adventure-4",
        isOwner: false,
        isParticipant: false,
        actionState: "watch",
        actionLabel: "阅读"
      })
    ]);

    render(await AdventurePage());

    expect(screen.getByRole("link", { name: "阅读" })).toHaveAttribute("href", "/adventure/adventure-4");
    expect(screen.queryByRole("button", { name: "加入同行" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "当前连载" })).not.toBeInTheDocument();
  });

  it("hides the book-detail secondary action when a current serial thread has no source book slug", async () => {
    mocks.getAdventureThreads.mockResolvedValue([
      createThread({
        id: "adventure-5",
        sourceBookSlug: null
      })
    ]);

    render(await AdventurePage());

    expect(screen.getByRole("link", { name: "当前连载" })).toHaveAttribute("href", "/adventure/adventure-5");
    expect(screen.queryByRole("link", { name: "阅读原故事" })).not.toBeInTheDocument();
  });
});
