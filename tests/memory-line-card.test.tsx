import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryLineCard } from "@/components/memory-line-card";
import type { PersonalLineBookView } from "@/lib/story-experience";
import type { StoryBook } from "@/lib/story-data";

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

afterEach(() => {
  cleanup();
});

function createLineFixture(overrides: Partial<PersonalLineBookView> = {}): PersonalLineBookView {
  return {
    threadId: "thread-1",
    threadKind: "personal",
    title: "我在《小红帽》里的冒险",
    sourceBookTitle: "小红帽",
    sourceBookSlug: "fairy-little-red-riding-hood",
    sourceBookCategoryKey: "fairy_tale",
    lockedStyleName: "童话风",
    latestEpisodeId: "episode-1",
    latestEpisodeTitle: "第 01 次冒险 · 《小红帽》",
    latestEpisodeExcerpt: "我又一次回到了林间小路。",
    latestEpisodeGeneratedAt: "2026-03-18T10:00:00.000Z",
    latestEpisodeStatus: "published",
    latestEpisodeJobStatus: "succeeded",
    latestEpisodeError: null,
    generationState: "idle",
    episodeCount: 3,
    todayGenerated: true,
    isCompleted: false,
    ...overrides
  };
}

function createBookFixture(overrides: Partial<StoryBook> = {}): StoryBook {
  return {
    id: "book-1",
    title: "小红帽",
    slug: "fairy-little-red-riding-hood",
    summary: "一条穿过树林的小路，会在这里重新长出新的分岔。",
    originalSynopsis: null,
    coverImage: null,
    categoryKey: "fairy_tale",
    categoryName: "童话",
    keyScenes: [],
    storyContent: null,
    sourceSite: null,
    sourceTitle: null,
    sourceUrl: null,
    sourceLicense: null,
    popularityRank: null,
    ...overrides
  };
}

describe("MemoryLineCard", () => {
  it("shows the daily update notice and view-today action when today's chapter already exists", () => {
    render(
      <MemoryLineCard
        line={createLineFixture()}
        book={createBookFixture()}
        generatedTimeLabel="18:30"
        primaryAction={<button type="button">查看今天这章</button>}
        secondaryAction={<a href="/books/fairy-little-red-riding-hood">阅读原故事</a>}
      />
    );

    expect(screen.getByText("今日已更新")).toBeInTheDocument();
    expect(screen.getByText("共 三 章")).toBeInTheDocument();
    expect(screen.getByText("第 一 次冒险 · 《小红帽》")).toBeInTheDocument();
    expect(screen.getByText("今日已更新，冒险线每天只会继续一章，明天再来看下一章。")).toBeInTheDocument();
    expect(screen.getByText("查看今天这章")).toBeInTheDocument();
    expect(screen.getByTestId("memory-line-mobile-book-heading")).toHaveTextContent("《小红帽》");
    expect(screen.getByTestId("memory-line-book-panel-mobile-inline")).toHaveAttribute(
      "href",
      "/books/fairy-little-red-riding-hood"
    );
    expect(screen.getByTestId("memory-line-book-panel")).toHaveAttribute("href", "/books/fairy-little-red-riding-hood");
    expect(screen.getByTestId("memory-line-story-title")).toHaveClass(
      "text-[clamp(1.95rem,7vw,2.45rem)]",
      "sm:text-[clamp(2.35rem,2vw,3.15rem)]"
    );
    expect(screen.getByText("童话风")).toHaveClass("text-[#9D6A17]");
  });

  it("shows the continue notice before today's chapter has started", () => {
    render(
      <MemoryLineCard
        line={createLineFixture({ todayGenerated: false, latestEpisodeGeneratedAt: null })}
        primaryAction={<button type="button">继续冒险</button>}
      />
    );

    expect(screen.getByText("等待今天续写")).toBeInTheDocument();
    expect(screen.getByText("今天还没续写，进入后会开始生成下一章。")).toBeInTheDocument();
    expect(screen.getByText("继续冒险")).toBeInTheDocument();
  });

  it("shows the generating badge and notice while a chapter is in progress", () => {
    render(
      <MemoryLineCard
        line={createLineFixture({ todayGenerated: false, generationState: "running", latestEpisodeGeneratedAt: null })}
        primaryAction={<button type="button">查看生成进度</button>}
      />
    );

    expect(screen.getByText("生成中")).toBeInTheDocument();
    expect(screen.getByText("这一章已经开始生成，进入后会自动刷新。")).toBeInTheDocument();
    expect(screen.getByText("查看生成进度")).toBeInTheDocument();
  });

  it("keeps rendering the content card even when the source book cover is unavailable", () => {
    render(
      <MemoryLineCard
        line={createLineFixture({ latestEpisodeExcerpt: null })}
        book={null}
        emptyExcerpt="这本童话还在等你的分身真正走进去。"
        primaryAction={<button type="button">继续冒险</button>}
        secondaryAction={<a href="/books/fairy-little-red-riding-hood">阅读原故事</a>}
      />
    );

    expect(screen.queryByTestId("memory-line-book-panel")).not.toBeInTheDocument();
    expect(screen.queryByTestId("memory-line-book-panel-mobile-inline")).not.toBeInTheDocument();
    expect(screen.queryByTestId("memory-line-mobile-book-heading")).not.toBeInTheDocument();
    expect(screen.getByText("这本童话还在等你的分身真正走进去。")).toBeInTheDocument();
    expect(screen.getByText("继续冒险")).toBeInTheDocument();
    expect(screen.getByText("阅读原故事")).toBeInTheDocument();
  });

  it("shows a completed badge and read-only notice for finished adventures", () => {
    render(
      <MemoryLineCard
        line={createLineFixture({ isCompleted: true, todayGenerated: false, latestEpisodeGeneratedAt: "2026-03-17T10:00:00.000Z" })}
        primaryAction={<a href="/memory/fairy-little-red-riding-hood#episode-episode-1">阅读冒险</a>}
      />
    );

    expect(screen.getByText("已结束")).toBeInTheDocument();
    expect(screen.getByText("这条冒险已经走到结尾了。你可以回看整段故事，但它不会再继续往前长。")).toBeInTheDocument();
    expect(screen.getByText("阅读冒险")).toBeInTheDocument();
  });
});
