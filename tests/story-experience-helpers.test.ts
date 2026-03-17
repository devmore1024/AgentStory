import { describe, expect, it } from "vitest";
import {
  getAdventureActionState,
  getCurrentAppDate,
  hasFreshSecondMeCache
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
});
