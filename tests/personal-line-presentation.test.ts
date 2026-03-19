import { describe, expect, it } from "vitest";
import {
  getPersonalLineDetailPrimaryAction,
  getPersonalLineDetailRuleNotice,
  getPersonalLineListNotice,
  getPersonalLineListPrimaryAction
} from "@/lib/personal-line-presentation";

describe("personal-line presentation helpers", () => {
  it("uses a view-today action once today's chapter is already published", () => {
    expect(
      getPersonalLineListPrimaryAction({
        sourceBookSlug: "little-red-riding-hood",
        latestEpisodeId: "episode-1",
        todayGenerated: true,
        generationState: "idle"
      })
    ).toEqual({
      kind: "link",
      label: "今日故事",
      href: "/memory/little-red-riding-hood#episode-episode-1"
    });
  });

  it("keeps a progress-link action while the current chapter is generating", () => {
    expect(
      getPersonalLineListPrimaryAction({
        sourceBookSlug: "little-red-riding-hood",
        latestEpisodeId: "episode-2",
        todayGenerated: false,
        generationState: "queued"
      })
    ).toEqual({
      kind: "link",
      label: "查看生成进度",
      href: "/memory/little-red-riding-hood"
    });
  });

  it("uses a read-only action for completed adventures", () => {
    expect(
      getPersonalLineListPrimaryAction({
        sourceBookSlug: "little-red-riding-hood",
        latestEpisodeId: "episode-2",
        todayGenerated: false,
        generationState: "idle",
        isCompleted: true
      })
    ).toEqual({
      kind: "link",
      label: "阅读冒险",
      href: "/memory/little-red-riding-hood#episode-episode-2"
    });
  });

  it("switches detail actions between pending, retry, and view-today states", () => {
    expect(
      getPersonalLineDetailPrimaryAction({
        sourceBookSlug: "little-red-riding-hood",
        latestEpisodeId: "episode-2",
        latestPublishedEpisodeId: "episode-1",
        todayGenerated: false,
        generationState: "running"
      })
    ).toEqual({
      kind: "pending",
      label: "这一章正在生成中"
    });

    expect(
      getPersonalLineDetailPrimaryAction({
        sourceBookSlug: "little-red-riding-hood",
        latestEpisodeId: "episode-2",
        latestPublishedEpisodeId: "episode-1",
        todayGenerated: false,
        generationState: "failed"
      })
    ).toEqual({
      kind: "form",
      label: "重新生成这一章",
      pendingLabel: "正在重新生成这一章..."
    });

    expect(
      getPersonalLineDetailPrimaryAction({
        sourceBookSlug: "little-red-riding-hood",
        latestEpisodeId: "episode-2",
        latestPublishedEpisodeId: "episode-1",
        todayGenerated: true,
        generationState: "idle"
      })
    ).toEqual({
      kind: "link",
      label: "今日故事",
      href: "/memory/little-red-riding-hood#episode-episode-1"
    });

    expect(
      getPersonalLineDetailPrimaryAction({
        sourceBookSlug: "little-red-riding-hood",
        latestEpisodeId: "episode-2",
        latestPublishedEpisodeId: "episode-1",
        todayGenerated: false,
        generationState: "idle",
        isCompleted: true
      })
    ).toEqual({
      kind: "link",
      label: "阅读冒险",
      href: "/memory/little-red-riding-hood#episode-episode-1"
    });
  });

  it("formats list and detail notices around the daily-one-chapter rule", () => {
    expect(
      getPersonalLineListNotice({
        todayGenerated: true,
        generationState: "idle",
        generatedTimeLabel: "18:30"
      })
    ).toBe("今日 18:30 已更新，冒险线每天只会继续一章，明天再来看下一章。");

    expect(
      getPersonalLineDetailRuleNotice({
        todayGenerated: true,
        generatedTimeLabel: "18:30"
      })
    ).toBe("今日 18:30 已更新。冒险线每天只会继续一章，明天再回来，会看到下一章继续长出来。");

    expect(
      getPersonalLineListNotice({
        todayGenerated: false,
        generationState: "idle",
        isCompleted: true
      })
    ).toBe("这条冒险已经走到结尾了。你可以回看整段故事，但它不会再继续往前长。");

    expect(
      getPersonalLineDetailRuleNotice({
        todayGenerated: true,
        generatedTimeLabel: "18:30",
        isCompleted: true
      })
    ).toBeNull();
  });
});
