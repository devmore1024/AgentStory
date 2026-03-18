import { describe, expect, it } from "vitest";
import { getStoryFootprintView } from "@/lib/me-page-presentation";

describe("me-page footprint presentation", () => {
  it("keeps joined counts aligned with only non-owner companion threads", () => {
    const view = getStoryFootprintView({
      personalLineBooks: [
        {
          threadId: "personal-1",
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
          episodeCount: 1,
          todayGenerated: true,
          isCompleted: false
        }
      ],
      adventureThreads: [
        {
          id: "owned-companion-1",
          threadKind: "companion",
          title: "我发起的同行",
          sourceBookTitle: "小红帽",
          sourceBookSlug: "fairy-little-red-riding-hood",
          sourceBookCategoryKey: "fairy_tale",
          lockedStyleName: "童话风",
          episodeCount: 1,
          episodeLimit: 10,
          participantCount: 1,
          participantLimit: 5,
          ownerDisplayName: "迪西",
          latestEpisodeTitle: "第一章",
          latestEpisodeExcerpt: "excerpt",
          latestEpisodeContent: "content",
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
          originPersonalThreadId: "personal-1",
          originEpisodeId: "episode-1"
        },
        {
          id: "joined-companion-1",
          threadKind: "companion",
          title: "我加入过的同行",
          sourceBookTitle: "海的女儿",
          sourceBookSlug: "fairy-the-little-mermaid",
          sourceBookCategoryKey: "fairy_tale",
          lockedStyleName: "童话风",
          episodeCount: 1,
          episodeLimit: 10,
          participantCount: 2,
          participantLimit: 5,
          ownerDisplayName: "拉拉",
          latestEpisodeTitle: "第一章",
          latestEpisodeExcerpt: "excerpt",
          latestEpisodeContent: "content",
          latestEpisodeNo: 1,
          latestEpisodeGeneratedAt: "2026-03-18T10:00:00.000Z",
          latestEpisodeStatus: "published",
          latestEpisodeJobStatus: "succeeded",
          latestEpisodeError: null,
          generationState: "idle",
          isOwner: false,
          isParticipant: true,
          isCompleted: false,
          isFull: false,
          isJoinable: false,
          actionState: "continue",
          actionLabel: "继续同行",
          originPersonalThreadId: "personal-2",
          originEpisodeId: "episode-2"
        }
      ]
    });

    expect(view.ownedCount).toBe(1);
    expect(view.joinedCount).toBe(1);
    expect(view.joinedItems).toEqual([
      {
        id: "joined-companion-1",
        title: "我加入过的同行",
        href: "/adventure/joined-companion-1"
      }
    ]);
  });
});
