import { describe, expect, it } from "vitest";
import {
  getSourceBackedFairyBook,
  isSourceBackedPrimaryEntryFairySlug,
  sourceBackedFairyCatalog
} from "@/lib/fairy-source-backed-catalog";
import { expandedFairyCatalogBooks } from "@/lib/fairy-catalog-expansion";
import { top50FairySourceCandidates } from "@/lib/fairy-import-pilot";
import { getCuratedFairyKeyScenes } from "@/lib/fairy-source-story-seeds";

describe("fairy source-backed catalog", () => {
  it("exposes exactly 100 visible fairy tales for the primary entry", () => {
    expect(sourceBackedFairyCatalog).toHaveLength(100);
    expect(sourceBackedFairyCatalog[0]?.popularityRank).toBe(1);
    expect(sourceBackedFairyCatalog[99]?.popularityRank).toBe(100);
  });

  it("ensures every visible fairy tale has source metadata, content, and key scenes", () => {
    for (const book of sourceBackedFairyCatalog) {
      expect(book.sourceSite.length).toBeGreaterThan(0);
      expect(book.sourceTitle.length).toBeGreaterThan(0);
      expect(book.sourceUrl.startsWith("https://")).toBe(true);
      expect(book.sourceLicense.length).toBeGreaterThan(0);
      expect(book.storyContentZh.length).toBeGreaterThan(120);
      expect(book.keyScenes.length).toBeGreaterThanOrEqual(3);
      expect(book.isVisibleInPrimaryEntry).toBe(true);
    }
  });

  it("keeps original seed fairy tales source-backed while excluding hidden fallback-only titles", () => {
    expect(getSourceBackedFairyBook("fairy-the-frog-prince")?.sourceSite).toBe("Project Gutenberg");
    expect(getSourceBackedFairyBook("fairy-the-six-swans")?.sourceTitle).toBe("The Six Swans");
    expect(isSourceBackedPrimaryEntryFairySlug("fairy-little-red-riding-hood")).toBe(true);
    expect(isSourceBackedPrimaryEntryFairySlug("fairy-maid-maleen")).toBe(false);
  });

  it("uses story-like content for popular non-pilot fairy tales instead of placeholder copy", () => {
    const frogPrince = getSourceBackedFairyBook("fairy-the-frog-prince");
    const gooseGirl = getSourceBackedFairyBook("fairy-the-goose-girl");
    const goldenBird = getSourceBackedFairyBook("fairy-the-golden-bird");
    const cleverGretel = getSourceBackedFairyBook("fairy-clever-gretel");
    const oldSultan = getSourceBackedFairyBook("fairy-old-sultan");

    expect(frogPrince?.storyContentZh).toContain("金球");
    expect(frogPrince?.storyContentZh).not.toContain("中文整理版");
    expect(frogPrince?.keyScenes[0]).toContain("金球");
    expect(gooseGirl?.storyContentZh).toContain("法拉达");
    expect(gooseGirl?.originalSynopsis).toContain("侍女");
    expect(gooseGirl?.keyScenes).toHaveLength(4);
    expect(goldenBird?.storyContentZh).toContain("狐狸");
    expect(goldenBird?.originalSynopsis).toContain("金苹果");
    expect(goldenBird?.keyScenes[3]).toContain("真相");
    expect(cleverGretel?.keyScenes).toHaveLength(4);
    expect(cleverGretel?.keyScenes[0]).toContain("女仆格蕾特");
    expect(cleverGretel?.originalSynopsis).toContain("故事真正往后展开时");
    expect(oldSultan?.keyScenes[0]).toContain("老狗苏丹");
    expect(oldSultan?.keyScenes[2]).toContain("偷羊");
  });

  it("reuses hand-written key scenes for direct-link fairy tales that still fall back to runtime data", () => {
    const moonScenes = getCuratedFairyKeyScenes("fairy-the-moon");

    expect(moonScenes).toHaveLength(4);
    expect(moonScenes?.[0]).toContain("偷回自己的故乡");
    expect(moonScenes?.[3]).toContain("回到了该挂着的位置");
  });

  it("covers every fairy tale slug with hand-written event-chain key scenes or imported source scenes", () => {
    const importedActiveSlugs = top50FairySourceCandidates
      .filter((candidate) => candidate.isPilotActive)
      .map((candidate) => (candidate.slug === "fairy-six-swans" ? "fairy-the-six-swans" : candidate.slug));
    const allFairySlugs = new Set([
      ...top50FairySourceCandidates.map((candidate) =>
        candidate.slug === "fairy-six-swans" ? "fairy-the-six-swans" : candidate.slug
      ),
      ...expandedFairyCatalogBooks.map((book) => book.slug)
    ]);

    const uncovered = Array.from(allFairySlugs).filter((slug) => {
      if (importedActiveSlugs.includes(slug)) {
        return false;
      }

      return getCuratedFairyKeyScenes(slug) === null;
    });

    expect(uncovered).toEqual([]);
  });
});
