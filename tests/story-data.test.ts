import { describe, expect, it } from "vitest";
import { getResolvedKeyScenes, getResolvedStoryParagraphs, type StoryBook } from "@/lib/story-data";

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
