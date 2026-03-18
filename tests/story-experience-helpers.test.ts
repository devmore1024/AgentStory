import { describe, expect, it } from "vitest";
import {
  getAdventureActionState,
  getCompanionActionLabel,
  getCurrentAppDate,
  hasFreshSecondMeCache,
  isVisibleStoryTimelineSource,
  sanitizeCompanionThreadTitle,
  sanitizePersonalAdventureTitle
} from "@/lib/story-experience-helpers";

describe("story-experience helpers", () => {
  it("keeps completed adventures in watch mode for everyone", () => {
    expect(
      getAdventureActionState({
        isOwner: true,
        isParticipant: true,
        isCompleted: true,
        isFull: false
      })
    ).toBe("watch");
  });

  it("returns continue for active owners or participants", () => {
    expect(
      getAdventureActionState({
        isOwner: true,
        isParticipant: false,
        isCompleted: false,
        isFull: false
      })
    ).toBe("continue");

    expect(
      getAdventureActionState({
        isOwner: false,
        isParticipant: true,
        isCompleted: false,
        isFull: false
      })
    ).toBe("continue");
  });

  it("returns join for active adventures with free slots", () => {
    expect(
      getAdventureActionState({
        isOwner: false,
        isParticipant: false,
        isCompleted: false,
        isFull: false
      })
    ).toBe("join");
  });

  it("uses watch for active adventures that are already full", () => {
    expect(
      getAdventureActionState({
        isOwner: false,
        isParticipant: false,
        isCompleted: false,
        isFull: true
      })
    ).toBe("watch");
  });

  it("maps story states to companion labels", () => {
    expect(getCompanionActionLabel("continue")).toBe("继续同行");
    expect(getCompanionActionLabel("join")).toBe("加入同行");
    expect(getCompanionActionLabel("watch")).toBe("阅读");
  });

  it("treats only future expiry timestamps as fresh SecondMe cache", () => {
    const now = new Date("2026-03-17T12:00:00.000Z");

    expect(hasFreshSecondMeCache("2026-03-18T12:00:00.000Z", now)).toBe(true);
    expect(hasFreshSecondMeCache("2026-03-17T11:59:59.999Z", now)).toBe(false);
    expect(hasFreshSecondMeCache(null, now)).toBe(false);
    expect(hasFreshSecondMeCache("invalid", now)).toBe(false);
  });

  it("formats the app date in Asia/Shanghai by default", () => {
    expect(getCurrentAppDate("Asia/Shanghai", new Date("2026-03-17T16:30:00.000Z"))).toBe("2026-03-18");
    expect(getCurrentAppDate("Asia/Shanghai", new Date("2026-03-17T01:00:00.000Z"))).toBe("2026-03-17");
  });

  it("hides bedtime memories from the active story timeline", () => {
    expect(isVisibleStoryTimelineSource("adventure_episode")).toBe(true);
    expect(isVisibleStoryTimelineSource("episode")).toBe(true);
    expect(isVisibleStoryTimelineSource("short_story")).toBe(true);
    expect(isVisibleStoryTimelineSource("bedtime_memory")).toBe(false);
  });

  it("rewrites legacy adventure titles into companion wording", () => {
    expect(sanitizeCompanionThreadTitle("阿宁在《小红帽》里开出的一条冒险线", "小红帽")).toBe("在《小红帽》里重新相遇");
    expect(sanitizeCompanionThreadTitle("新的冒险正在展开")).toBe("新的同行正在展开");
    expect(sanitizeCompanionThreadTitle("陌生人之间的冒险")).toBe("陌生人之间的同行");
  });

  it("rewrites legacy personal titles into adventure wording", () => {
    expect(sanitizePersonalAdventureTitle("新的回去正在展开")).toBe("新的冒险正在展开");
    expect(sanitizePersonalAdventureTitle("第 03 次回去 · 《小红帽》")).toBe("第 03 次冒险 · 《小红帽》");
    expect(sanitizePersonalAdventureTitle("我回到《海的女儿》里", "海的女儿")).toBe("我在《海的女儿》里的冒险");
    expect(sanitizePersonalAdventureTitle("准备回去")).toBe("准备冒险");
  });
});
