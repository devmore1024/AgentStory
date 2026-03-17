import { describe, expect, it } from "vitest";
import {
  getHomepageFairyShelfFromCategories,
  getResolvedKeyScenes,
  getResolvedStoryParagraphs,
  hasIllustratedCoverForShelf,
  sortVisibleFairyShelfBooks,
  type StoryBook,
  type StoryCategory
} from "@/lib/story-data";

function createBook(overrides: Partial<StoryBook> = {}): StoryBook {
  return {
    id: "book-1",
    title: "测试故事",
    slug: "fairy-test-book",
    summary: "这是摘要。",
    originalSynopsis: "这是更长的背景。",
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

describe("story-data helpers", () => {
  it("picks the fairy shelf for the homepage from mixed categories", () => {
    const categories: StoryCategory[] = [
      { id: "c-1", key: "fable", name: "寓言", sortOrder: 1, books: [createBook({ categoryKey: "fable", categoryName: "寓言" })] },
      { id: "c-2", key: "fairy_tale", name: "童话", sortOrder: 2, books: [createBook()] },
      { id: "c-3", key: "mythology", name: "神话", sortOrder: 3, books: [createBook({ categoryKey: "mythology", categoryName: "神话" })] }
    ];

    expect(getHomepageFairyShelfFromCategories(categories)?.key).toBe("fairy_tale");
  });

  it("treats only non-local illustrated covers as shelf eligible", () => {
    expect(
      hasIllustratedCoverForShelf(
        createBook({
          title: "蓝胡子",
          slug: "fairy-bluebeard"
        })
      )
    ).toBe(false);

    expect(
      hasIllustratedCoverForShelf(
        createBook({
          title: "青蛙王子",
          slug: "fairy-frog-prince"
        })
      )
    ).toBe(true);
  });

  it("sorts visible fairy shelf books by popularity and removes titles without illustrated covers", () => {
    const visible = sortVisibleFairyShelfBooks([
      createBook({
        title: "蓝胡子",
        slug: "fairy-bluebeard",
        popularityRank: 8
      }),
      createBook({
        title: "青蛙王子",
        slug: "fairy-frog-prince",
        popularityRank: 21
      }),
      createBook({
        title: "小红帽",
        slug: "fairy-little-red-riding-hood",
        popularityRank: 1
      }),
      createBook({
        title: "狐狸和猫",
        slug: "fairy-the-fox-and-the-cat",
        popularityRank: null
      })
    ]);

    expect(visible.map((book) => book.slug)).toEqual([
      "fairy-little-red-riding-hood",
      "fairy-frog-prince",
      "fairy-the-fox-and-the-cat"
    ]);
  });

  it("splits imported story content into readable paragraphs", () => {
    const paragraphs = getResolvedStoryParagraphs(
      createBook({
        storyContent: "第一段。\n\n第二段。\n\n第三段。"
      })
    );

    expect(paragraphs).toEqual(["第一段。", "第二段。", "第三段。"]);
  });

  it("falls back to synopsis when no imported story content is present", () => {
    expect(getResolvedStoryParagraphs(createBook())).toEqual(["这是更长的背景。"]);
  });

  it("keeps explicit key scenes instead of deriving generic placeholders", () => {
    const book = createBook({
      keyScenes: ["真实情节一", "真实情节二"]
    });

    expect(getResolvedKeyScenes(book)).toEqual(["真实情节一", "真实情节二"]);
  });
});
