import React from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdventureThreadPage from "@/app/adventure/[threadId]/page";
import BookDetailPage from "@/app/books/[slug]/page";
import EnterStoryPage from "@/app/books/[slug]/enter/page";
import BookReadPage from "@/app/books/[slug]/read/page";
import PersonaSharePage from "@/app/me/share/page";
import MemoryDetailPage from "@/app/memory/[slug]/page";

const mocks = vi.hoisted(() => ({
  getAuthenticatedAppContext: vi.fn(),
  getPersonalLineForBookSlug: vi.fn(),
  getAdventureThreadDetail: vi.fn(),
  getPersonalLineDetail: vi.fn(),
  getBookBySlug: vi.fn(),
  getResolvedKeyScenes: vi.fn(),
  getResolvedStoryParagraphs: vi.fn(),
  getAuthenticatedDemoContext: vi.fn()
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

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  redirect: vi.fn()
}));

vi.mock("@/app/actions", () => ({
  continueAdventureAction: vi.fn(),
  joinAdventureAction: vi.fn(),
  publishCompanionFromPersonalAction: vi.fn(),
  startOrOpenPersonalLineAction: vi.fn()
}));

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

vi.mock("@/components/book-cover", () => ({
  BookCover: () => <div>cover</div>
}));

vi.mock("@/components/submit-button", () => ({
  SubmitButton: ({ idleLabel }: { idleLabel: string }) => <button type="submit">{idleLabel}</button>
}));

vi.mock("@/components/adventure-thread-badges", () => ({
  AdventureThreadBadges: () => <div>badges</div>
}));

vi.mock("@/components/state-card", () => ({
  StateCard: ({ title }: { title: string }) => <div>{title}</div>
}));

vi.mock("@/components/story-generation-watcher", () => ({
  StoryGenerationWatcher: () => null
}));

vi.mock("@/components/memory-detail-hero", () => ({
  MemoryDetailHero: ({ actions }: { actions?: ReactNode }) => <div>{actions}</div>
}));

vi.mock("@/components/persona-card", () => ({
  PersonaCard: () => <div>persona-card</div>
}));

vi.mock("@/components/persona-share-poster", () => ({
  PersonaSharePoster: () => <div>share-poster</div>
}));

vi.mock("@/components/share-actions", () => ({
  ShareActions: () => <div>share-actions</div>
}));

vi.mock("@/lib/story-experience", () => ({
  getAuthenticatedAppContext: mocks.getAuthenticatedAppContext,
  getPersonalLineForBookSlug: mocks.getPersonalLineForBookSlug,
  getAdventureThreadDetail: mocks.getAdventureThreadDetail,
  getPersonalLineDetail: mocks.getPersonalLineDetail
}));

vi.mock("@/lib/story-data", () => ({
  getBookBySlug: mocks.getBookBySlug,
  getResolvedKeyScenes: mocks.getResolvedKeyScenes,
  getResolvedStoryParagraphs: mocks.getResolvedStoryParagraphs
}));

vi.mock("@/lib/demo-app", () => ({
  getAuthenticatedAppContext: mocks.getAuthenticatedDemoContext
}));

function createBook() {
  return {
    id: "book-1",
    title: "睡美人",
    slug: "fairy-sleeping-beauty",
    summary: "一个关于沉睡与重逢的童话。",
    originalSynopsis: "很久以前，公主沉睡在荆棘围起的城堡里。",
    coverImage: null,
    categoryKey: "fairy_tale",
    categoryName: "童话",
    keyScenes: ["被纺锤刺伤", "王子穿过荆棘"],
    storyContent: "第一段\n\n第二段",
    sourceSite: null,
    sourceTitle: null,
    sourceUrl: null,
    sourceLicense: null,
    popularityRank: 4
  };
}

function createViewerContext() {
  return {
    userId: "user-1",
    displayName: "迪西",
    persona: {
      animalName: "狐狸",
      displayLabel: "狐狸",
      mappingReason: "系统识别到谨慎、聪明和观察力。",
      recommendedStyles: ["童话风"]
    }
  };
}

function createMemoryLine() {
  return {
    threadId: "thread-1",
    threadKind: "personal",
    title: "我在《睡美人》里的冒险",
    sourceBookTitle: "睡美人",
    sourceBookSlug: "fairy-sleeping-beauty",
    sourceBookCategoryKey: "fairy_tale",
    lockedStyleName: "童话风",
    latestEpisodeId: "episode-1",
    latestEpisodeTitle: "第 01 次冒险 · 《睡美人》",
    latestEpisodeExcerpt: "我再次走进荆棘围起的城堡。",
    latestEpisodeGeneratedAt: "2026-03-18T10:00:00.000Z",
    latestEpisodeStatus: "published",
    latestEpisodeJobStatus: "succeeded",
    latestEpisodeError: null,
    generationState: "idle",
    episodeCount: 1,
    todayGenerated: true,
    isCompleted: false,
    activeCompanionThreadId: null,
    episodes: [
      {
        id: "episode-1",
        episodeNo: 1,
        title: "第 01 次冒险 · 《睡美人》",
        excerpt: "我再次走进荆棘围起的城堡。",
        content: "故事内容",
        generatedAt: "2026-03-18T10:00:00.000Z",
        authorDisplayName: "迪西",
        styleName: "童话风"
      }
    ]
  };
}

function createAdventureThread() {
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
    episodes: [
      {
        id: "episode-1",
        episodeNo: 1,
        title: "新的同行已经开始",
        excerpt: "故事从荆棘外慢慢打开。",
        content: "故事内容",
        generatedAt: "2026-03-18T10:00:00.000Z",
        authorDisplayName: "迪西",
        styleName: "童话风"
      }
    ]
  };
}

beforeEach(() => {
  mocks.getBookBySlug.mockResolvedValue(createBook());
  mocks.getResolvedKeyScenes.mockReturnValue(["被纺锤刺伤", "王子穿过荆棘"]);
  mocks.getResolvedStoryParagraphs.mockReturnValue(["很久以前，公主沉睡在荆棘围起的城堡里。"]);
  mocks.getAuthenticatedAppContext.mockResolvedValue(createViewerContext());
  mocks.getPersonalLineForBookSlug.mockResolvedValue(null);
  mocks.getPersonalLineDetail.mockResolvedValue(createMemoryLine());
  mocks.getAdventureThreadDetail.mockResolvedValue(createAdventureThread());
  mocks.getAuthenticatedDemoContext.mockResolvedValue(createViewerContext());
});

describe("secondary pages", () => {
  it("shows a top back button on the book detail page", async () => {
    render(await BookDetailPage({ params: Promise.resolve({ slug: "fairy-sleeping-beauty" }) }));

    expect(screen.getByTestId("page-back-button")).toHaveTextContent("童话故事:/");
  });

  it("shows a top back button on the read page", async () => {
    render(await BookReadPage({ params: Promise.resolve({ slug: "fairy-sleeping-beauty" }) }));

    expect(screen.getByTestId("page-back-button")).toHaveTextContent("原故事:/books/fairy-sleeping-beauty");
  });

  it("shows a top back button on the enter page", async () => {
    render(await EnterStoryPage({ params: Promise.resolve({ slug: "fairy-sleeping-beauty" }) }));

    expect(screen.getByTestId("page-back-button")).toHaveTextContent("走进童话:/books/fairy-sleeping-beauty");
  });

  it("shows a top back button on the memory detail page", async () => {
    render(await MemoryDetailPage({ params: Promise.resolve({ slug: "fairy-sleeping-beauty" }) }));

    expect(screen.getByTestId("page-back-button")).toHaveTextContent("冒险故事:/memory");
  });

  it("uses the direct-publish wording for the companion action on the memory detail page", async () => {
    render(await MemoryDetailPage({ params: Promise.resolve({ slug: "fairy-sleeping-beauty" }) }));

    expect(screen.getByRole("button", { name: "开始同行" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "把这一章公开成同行故事" })).not.toBeInTheDocument();
  });

  it("shows a top back button on the adventure detail page", async () => {
    render(await AdventureThreadPage({ params: Promise.resolve({ threadId: "adventure-1" }) }));

    expect(screen.getByTestId("page-back-button")).toHaveTextContent("同行故事:/adventure");
  });

  it("shows a top back button on the share page", async () => {
    render(await PersonaSharePage());

    expect(screen.getByTestId("page-back-button")).toHaveTextContent("分享详情:/me");
  });

  it("shows only one generating card on the memory detail page before the first chapter is published", async () => {
    mocks.getPersonalLineDetail.mockResolvedValueOnce({
      ...createMemoryLine(),
      latestEpisodeTitle: "第 01 章正在生成",
      latestEpisodeExcerpt: "新的冒险已经被触发，故事正在把这一章慢慢写出来。",
      latestEpisodeGeneratedAt: null,
      latestEpisodeStatus: "queued",
      latestEpisodeJobStatus: "running",
      generationState: "queued",
      episodeCount: 0,
      todayGenerated: false,
      episodes: []
    });

    render(await MemoryDetailPage({ params: Promise.resolve({ slug: "fairy-sleeping-beauty" }) }));

    expect(screen.getByText("第 01 章正在生成")).toBeInTheDocument();
    expect(screen.queryByText("第一章正在路上")).not.toBeInTheDocument();
  });

  it("shows only one generating card on the adventure detail page before the first episode is published", async () => {
    mocks.getAdventureThreadDetail.mockResolvedValueOnce({
      ...createAdventureThread(),
      latestEpisodeTitle: "第一篇同行正在路上",
      latestEpisodeExcerpt: "故事已经入队，正在把第一位参与者写下的这一段慢慢生成出来。",
      latestEpisodeGeneratedAt: null,
      latestEpisodeStatus: "queued",
      latestEpisodeJobStatus: "running",
      generationState: "queued",
      episodeCount: 0,
      episodes: []
    });

    render(await AdventureThreadPage({ params: Promise.resolve({ threadId: "adventure-1" }) }));

    expect(screen.getByText("第一篇同行正在路上")).toBeInTheDocument();
    expect(screen.queryByText("这段同行还没有真正落下第一篇")).not.toBeInTheDocument();
  });
});
