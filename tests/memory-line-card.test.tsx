import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryLineCard } from "@/components/memory-line-card";
import type { PersonalLineBookView } from "@/lib/story-experience";

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
    ...overrides
  };
}

describe("MemoryLineCard", () => {
  it("shows the daily update notice and view-today action when today's chapter already exists", () => {
    render(
      <MemoryLineCard
        line={createLineFixture()}
        generatedTimeLabel="18:30"
        primaryAction={<button type="button">查看今天这章</button>}
        secondaryAction={<a href="/books/fairy-little-red-riding-hood">阅读原故事</a>}
      />
    );

    expect(screen.getByText("今日已更新")).toBeInTheDocument();
    expect(screen.getByText("今日 18:30 已更新，冒险线每天只会继续一章，明天再来看下一章。")).toBeInTheDocument();
    expect(screen.getByText(今日之章")).toBeInTheDocument();
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
});
