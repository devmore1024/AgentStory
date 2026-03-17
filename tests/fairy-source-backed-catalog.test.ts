import { describe, expect, it } from "vitest";
import {
  getSourceBackedFairyBook,
  isSourceBackedPrimaryEntryFairySlug,
  sourceBackedFairyCatalog
} from "@/lib/fairy-source-backed-catalog";

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

    expect(frogPrince?.storyContentZh).toContain("金球");
    expect(frogPrince?.storyContentZh).not.toContain("中文整理版");
    expect(frogPrince?.keyScenes[0]).toContain("金球");
  });
});
