import { describe, expect, it } from "vitest";
import { animalPersonas } from "@/lib/animal-personas";
import {
  getEligibleShortStoryStyleKeys,
  getPersonaRecommendedStyleKeys,
  isZhihuStyleBucketUser,
  pickPersistableShortStoryStyleKey,
  pickPersistableThreadPrimaryStyleKey,
  pickRandomShortStoryStyleKey,
  pickThreadPrimaryStyleKey,
  resolvePersistableStyleKey,
  stripStyleDisplayTitleAffixes
} from "@/lib/story-style";
import type { StoryBook } from "@/lib/story-data";

function createBook(overrides: Partial<StoryBook> = {}): StoryBook {
  return {
    id: "book-1",
    title: "测试童话",
    slug: "test-fairy-book",
    summary: "摘要",
    originalSynopsis: "梗概",
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

function findUserByBucketState(expected: boolean) {
  for (let index = 0; index < 5000; index += 1) {
    const candidate = `user-${index}`;

    if (isZhihuStyleBucketUser(candidate) === expected) {
      return candidate;
    }
  }

  throw new Error(`Failed to find user for bucket=${String(expected)}`);
}

describe("story style strategy", () => {
  it("removes zhihu from persona default recommendation keys", () => {
    expect(getPersonaRecommendedStyleKeys(animalPersonas.owl)).toEqual(["fable", "folklore", "suspense"]);
    expect(getPersonaRecommendedStyleKeys(animalPersonas.fox)).not.toContain("zhihu");
  });

  it("keeps zhihu out of the regular short-story candidate pool", () => {
    const mythologyBook = createBook({
      categoryKey: "mythology",
      categoryName: "神话"
    });

    const pool = getEligibleShortStoryStyleKeys(mythologyBook, animalPersonas.owl);

    expect(pool).not.toContain("zhihu");
    expect(pool).toContain("folklore");
    expect(pool).toContain("suspense");
  });

  it("disables the zhihu special branch when bucket percent is zero", () => {
    const fairyBook = createBook();
    const sampledUsers = Array.from({ length: 20 }, (_, index) => `user-${index}`);

    for (const userId of sampledUsers) {
      expect(isZhihuStyleBucketUser(userId)).toBe(false);
      expect(pickThreadPrimaryStyleKey({ userId, persona: animalPersonas.bear, seedBook: fairyBook })).not.toBe("zhihu");
    }
  });

  it("picks a deterministic non-zhihu short-story style for regular users", () => {
    const nonBucketUser = findUserByBucketState(false);
    const fableBook = createBook({
      categoryKey: "fable",
      categoryName: "寓言",
      slug: "test-fable-book"
    });

    const first = pickRandomShortStoryStyleKey(fableBook, animalPersonas.fox, nonBucketUser);
    const second = pickRandomShortStoryStyleKey(fableBook, animalPersonas.fox, nonBucketUser);

    expect(first).toBe(second);
    expect(first).not.toBe("zhihu");
  });

  it("strips newly added style names from display titles", () => {
    expect(stripStyleDisplayTitleAffixes("治愈日常风里的小王子")).toBe("小王子");
    expect(stripStyleDisplayTitleAffixes("海的女儿的黑色幽默风")).toBe("海的女儿");
    expect(stripStyleDisplayTitleAffixes("诗性抒情风里的夜莺")).toBe("夜莺");
  });

  it("falls back to an existing persisted thread style when the selected new style is missing in db", () => {
    const styleIds = new Map([
      ["fairy", "style-fairy"],
      ["light_web", "style-light-web"],
      ["suspense", "style-suspense"]
    ]);

    expect(
      pickPersistableThreadPrimaryStyleKey({
        userId: "b261cd1a-9f53-4ab7-904d-ee50a4a7e3c2",
        persona: animalPersonas.fox,
        seedBook: createBook({ slug: "fairy-sleeping-beauty" }),
        styleIds
      })
    ).toBe("fairy");
  });

  it("falls back to an existing persisted short-story style when db styles lag behind the code pool", () => {
    const styleIds = new Map([
      ["fairy", "style-fairy"],
      ["light_web", "style-light-web"]
    ]);

    expect(
      pickPersistableShortStoryStyleKey({
        book: createBook(),
        persona: animalPersonas.cat,
        seedText: "reader-1",
        styleIds
      })
    ).toBe("light_web");
    expect(resolvePersistableStyleKey(styleIds, ["folklore", "light_web", "fairy"])).toBe("light_web");
  });
});
