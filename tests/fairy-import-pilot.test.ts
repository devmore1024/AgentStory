import { describe, expect, it } from "vitest";
import {
  activeImportedFairyPilotBooks,
  getImportedFairyPilotBook,
  sortActiveImportedFairyShelfBooks,
  top50FairySourceCandidates
} from "@/lib/fairy-import-pilot";

describe("fairy import pilot data", () => {
  it("keeps a locked top-50 candidate list and exactly 20 active pilot books", () => {
    expect(top50FairySourceCandidates).toHaveLength(50);
    expect(activeImportedFairyPilotBooks).toHaveLength(20);
  });

  it("ensures every active book has imported content, source metadata, and a cover", () => {
    for (const book of activeImportedFairyPilotBooks) {
      expect(book.storyContent.length).toBeGreaterThan(120);
      expect(book.keyScenes.length).toBeGreaterThanOrEqual(3);
      expect(book.sourceUrl).toContain("gutenberg.org");
      expect(book.sourceLicense).toContain("Public domain");
    }
  });

  it("only keeps vetted source images when they are explicitly approved for display", () => {
    const booksWithSourceCover = activeImportedFairyPilotBooks.filter((book) => book.coverImage);

    expect(booksWithSourceCover).toHaveLength(0);
  });

  it("sorts visible pilot books by popularity rank and hides non-pilot fairy tales", () => {
    const books = sortActiveImportedFairyShelfBooks([
      {
        slug: "fairy-the-frog-prince",
        title: "青蛙王子",
        popularityRank: 21
      },
      {
        slug: "fairy-cinderella",
        title: "灰姑娘",
        popularityRank: 2
      },
      {
        slug: "fairy-little-red-riding-hood",
        title: "小红帽",
        popularityRank: 1
      }
    ]);

    expect(books.map((book) => book.slug)).toEqual(["fairy-little-red-riding-hood", "fairy-cinderella"]);
  });

  it("can resolve imported detail data for a pilot fairy tale slug", () => {
    const book = getImportedFairyPilotBook("fairy-the-little-mermaid");

    expect(book?.displayTitleZh).toBe("海的女儿");
    expect(book?.sourceTitleEn).toBe("The Little Mermaid");
    expect(book?.storyContent).toContain("海巫婆");
  });
});
