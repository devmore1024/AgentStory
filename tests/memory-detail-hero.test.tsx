import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryDetailHero } from "@/components/memory-detail-hero";
import type { PersonalLineDetailView } from "@/lib/story-experience";

afterEach(() => {
  cleanup();
});

function createLineFixture(overrides: Partial<PersonalLineDetailView> = {}): PersonalLineDetailView {
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
    activeCompanionThreadId: null,
    episodes: [],
    ...overrides
  };
}

describe("MemoryDetailHero", () => {
  it("shows the companion enabled tag in the header when a companion thread exists", () => {
    render(<MemoryDetailHero line={createLineFixture({ activeCompanionThreadId: "companion-1" })} actions={<div>操作区</div>} />);

    expect(screen.getByText("同行已开启")).toBeInTheDocument();
    expect(screen.queryByText("这段冒险已经长出了同行入口")).not.toBeInTheDocument();
  });

  it("does not show the companion enabled tag when no companion thread exists", () => {
    render(<MemoryDetailHero line={createLineFixture()} actions={<div>操作区</div>} />);

    expect(screen.queryByText("同行已开启")).not.toBeInTheDocument();
  });

  it("shows the generated time and daily rule notice when today's chapter already exists", () => {
    render(
      <MemoryDetailHero
        line={createLineFixture()}
        generatedTimeLabel="18:30"
        dailyRuleNotice="今日已更新。冒险线每天只会继续一章，明天再回来，会看到下一章继续长出来。"
        actions={<div>今日故事</div>}
      />
    );

    expect(screen.getByText("今日 18:30 更新")).toBeInTheDocument();
    expect(screen.getByText("共 三 章")).toBeInTheDocument();
    expect(screen.getByText("第 一 次冒险 · 《小红帽》")).toBeInTheDocument();
    expect(screen.getByText("今日已更新。冒险线每天只会继续一章，明天再回来，会看到下一章继续长出来。")).toBeInTheDocument();
    expect(screen.getByText("今日故事")).toBeInTheDocument();
    expect(screen.getByText("童话风")).toHaveClass("text-[#9D6A17]");
  });

  it("shows a generating badge for queued personal chapters", () => {
    render(<MemoryDetailHero line={createLineFixture({ todayGenerated: false, generationState: "queued" })} actions={<div>这一章正在生成中</div>} />);

    expect(screen.getByText("生成中")).toBeInTheDocument();
    expect(screen.getByText("这一章正在生成中")).toBeInTheDocument();
    expect(screen.queryByText("继续冒险")).not.toBeInTheDocument();
  });

  it("shows a failed badge when the latest personal chapter needs a retry", () => {
    render(<MemoryDetailHero line={createLineFixture({ todayGenerated: false, generationState: "failed" })} actions={<div>重新生成这一章</div>} />);

    expect(screen.getByText("生成失败")).toBeInTheDocument();
    expect(screen.getByText("重新生成这一章")).toBeInTheDocument();
  });
});
