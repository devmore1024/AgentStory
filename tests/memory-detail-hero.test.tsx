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
});
