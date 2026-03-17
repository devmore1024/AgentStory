import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { expandedFairyCatalogBooks } from "@/lib/fairy-catalog-expansion";
import { hasIllustratedCoverForShelf, type StoryBook } from "@/lib/story-data";

function parseSeedFairyBooks() {
  const file = path.join(process.cwd(), "db", "003_seed_story_books.sql");
  const text = readFileSync(file, "utf8");

  return [...text.matchAll(/\('fairy_tale',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'/g)].map((match) => ({
    title: match[1],
    slug: match[2],
    summary: match[3]
  }));
}

function toStoryBook(input: { title: string; slug: string; summary: string }): StoryBook {
  return {
    id: input.slug,
    title: input.title,
    slug: input.slug,
    summary: input.summary,
    originalSynopsis: input.summary,
    coverImage: null,
    categoryKey: "fairy_tale",
    categoryName: "童话",
    keyScenes: [],
    storyContent: null,
    sourceSite: null,
    sourceTitle: null,
    sourceUrl: null,
    sourceLicense: null,
    popularityRank: null
  };
}

describe("fairy catalog expansion", () => {
  it("adds 73 new runtime fairy tales on top of the original 33-book fairy shelf", () => {
    expect(parseSeedFairyBooks()).toHaveLength(33);
    expect(expandedFairyCatalogBooks).toHaveLength(73);
  });

  it("yields exactly 100 visible fairy shelf books after filtering out titles without illustrated covers", () => {
    const combined = [...parseSeedFairyBooks(), ...expandedFairyCatalogBooks].map(toStoryBook);
    const visibleCount = combined.filter((book) => hasIllustratedCoverForShelf(book)).length;

    expect(visibleCount).toBe(100);
  });
});
