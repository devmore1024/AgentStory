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
    expect(getPersonaRecommendedStyleKeys(animalPersonas.owl)).toEqual(["sci_future", "suspense", "realist"]);
    expect(getPersonaRecommendedStyleKeys(animalPersonas.fox)).not.toContain("zhihu");
  });

  it("keeps zhihu out of the regular short-story candidate pool and ignores book category", () => {
    const fairyBook = createBook({
      slug: "same-book"
    });
    const mythologyBook = createBook({
      slug: "same-book",
      categoryKey: "mythology",
      categoryName: "神话"
    });
    const fairyPool = getEligibleShortStoryStyleKeys(fairyBook, animalPersonas.owl);
    const mythologyPool = getEligibleShortStoryStyleKeys(mythologyBook, animalPersonas.owl);

    expect(fairyPool).toEqual(["sci_future", "suspense", "realist"]);
    expect(mythologyPool).toEqual(fairyPool);
    expect(fairyPool).not.toContain("zhihu");
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

  it("keeps the initial personal-line style stable for the same user and book", () => {
    const book = createBook({
      slug: "fairy-sleeping-beauty"
    });

    const first = pickThreadPrimaryStyleKey({
      userId: "reader-1",
      persona: animalPersonas.fox,
      seedBook: book
    });
    const second = pickThreadPrimaryStyleKey({
      userId: "reader-1",
      persona: animalPersonas.fox,
      seedBook: book
    });

    expect(first).toBe(second);
    expect(first).not.toBe("zhihu");
  });

  it("keeps short-story selections inside persona recommendations when they exist", () => {
    const book = createBook({
      slug: "fairy-sleeping-beauty"
    });
    const personaRecommended = new Set(getPersonaRecommendedStyleKeys(animalPersonas.fox).filter((styleKey) => styleKey !== "zhihu"));
    const selected = new Set<string>();

    for (let index = 0; index < 400; index += 1) {
      const styleKey = pickRandomShortStoryStyleKey(book, animalPersonas.fox, `reader-${index}`);
      selected.add(styleKey);
      expect(personaRecommended.has(styleKey)).toBe(true);
    }

    expect(selected.size).toBeGreaterThan(1);
  });

  it("keeps short-story selection stable even if only the book category changes", () => {
    const fairyBook = createBook({
      slug: "same-book"
    });
    const mythologyBook = createBook({
      slug: "same-book",
      categoryKey: "mythology",
      categoryName: "神话"
    });

    expect(pickRandomShortStoryStyleKey(fairyBook, animalPersonas.owl, "reader-7")).toBe(
      pickRandomShortStoryStyleKey(mythologyBook, animalPersonas.owl, "reader-7")
    );
  });

  it("strips newly added style names from display titles", () => {
    expect(stripStyleDisplayTitleAffixes("治愈日常风里的小王子")).toBe("小王子");
    expect(stripStyleDisplayTitleAffixes("海的女儿的科幻未来风")).toBe("海的女儿");
    expect(stripStyleDisplayTitleAffixes("古风诗意风里的夜莺")).toBe("夜莺");
    expect(stripStyleDisplayTitleAffixes("反套路吐槽风里的狐狸")).toBe("狐狸");
  });

  it("falls back to an existing persisted thread style when the selected new style is missing in db", () => {
    const styleIds = new Map([
      ["fairy", "style-fairy"],
      ["light_web", "style-light-web"],
      ["suspense", "style-suspense"]
    ]);
    const book = createBook({ slug: "fairy-sleeping-beauty" });
    let selectedStyle: ReturnType<typeof pickThreadPrimaryStyleKey> | null = null;
    let fallbackUserId: string | null = null;

    for (let index = 0; index < 500; index += 1) {
      const userId = `thread-user-${index}`;
      const candidate = pickThreadPrimaryStyleKey({
        userId,
        persona: animalPersonas.fox,
        seedBook: book
      });

      if (!styleIds.has(candidate)) {
        selectedStyle = candidate;
        fallbackUserId = userId;
        break;
      }
    }

    expect(selectedStyle).not.toBeNull();
    expect(fallbackUserId).not.toBeNull();

    const persistedStyle = pickPersistableThreadPrimaryStyleKey({
      userId: fallbackUserId ?? "thread-user-fallback",
      persona: animalPersonas.fox,
      seedBook: book,
      styleIds
    });

    expect(persistedStyle).not.toBe(selectedStyle);
    expect(persistedStyle && styleIds.has(persistedStyle)).toBe(true);
  });

  it("falls back to an existing persisted short-story style when db styles lag behind the code pool", () => {
    const styleIds = new Map([
      ["fairy", "style-fairy"],
      ["light_web", "style-light-web"]
    ]);
    const book = createBook();
    let selectedStyle: ReturnType<typeof pickRandomShortStoryStyleKey> | null = null;
    let fallbackSeedText: string | null = null;

    for (let index = 0; index < 500; index += 1) {
      const seedText = `reader-${index}`;
      const candidate = pickRandomShortStoryStyleKey(book, animalPersonas.cat, seedText);

      if (!styleIds.has(candidate)) {
        selectedStyle = candidate;
        fallbackSeedText = seedText;
        break;
      }
    }

    expect(selectedStyle).not.toBeNull();
    expect(fallbackSeedText).not.toBeNull();

    const persistedStyle = pickPersistableShortStoryStyleKey({
      book,
      persona: animalPersonas.cat,
      seedText: fallbackSeedText ?? "reader-fallback",
      styleIds
    });

    expect(persistedStyle).not.toBe(selectedStyle);
    expect(persistedStyle && styleIds.has(persistedStyle)).toBe(true);
    expect(resolvePersistableStyleKey(styleIds, ["folklore", "light_web", "fairy"])).toBe("light_web");
  });
});
