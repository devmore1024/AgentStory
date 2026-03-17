import { describe, expect, it } from "vitest";
import {
  extractProjectGutenbergImageUrls,
  extractProjectGutenbergParagraphs,
  normalizeProjectGutenbergUrl,
  pickProjectGutenbergCoverTarget
} from "@/lib/project-gutenberg-import";

const sampleHtml = `
  <html>
    <body>
      <div>Project Gutenberg header</div>
      <p>This paragraph is too short.</p>
      <p>The young heroine leaves home, crosses the forest, and arrives at the tower after sunset.</p>
      <img src="/cache/epub/12345/images/plate1.jpg" alt="plate" />
      <div>The witch keeps the key hidden under her cloak and never lets anyone use the front door.</div>
      <img src="https://www.gutenberg.org/cache/epub/12345/images/plate2.jpg" alt="plate" />
    </body>
  </html>
`;

describe("Project Gutenberg import helpers", () => {
  it("normalizes relative gutenberg asset urls", () => {
    expect(normalizeProjectGutenbergUrl("/cache/epub/12345/images/plate1.jpg")).toBe(
      "https://www.gutenberg.org/cache/epub/12345/images/plate1.jpg"
    );
  });

  it("extracts and deduplicates image urls from source html", () => {
    expect(extractProjectGutenbergImageUrls(sampleHtml)).toEqual([
      "https://www.gutenberg.org/cache/epub/12345/images/plate1.jpg",
      "https://www.gutenberg.org/cache/epub/12345/images/plate2.jpg"
    ]);
  });

  it("filters noisy paragraphs and keeps readable story content", () => {
    expect(extractProjectGutenbergParagraphs(sampleHtml)).toEqual([
      "The young heroine leaves home, crosses the forest, and arrives at the tower after sunset.",
      "The witch keeps the key hidden under her cloak and never lets anyone use the front door."
    ]);
  });

  it("picks the first usable image as a cover target", () => {
    expect(pickProjectGutenbergCoverTarget(sampleHtml)).toBe(
      "https://www.gutenberg.org/cache/epub/12345/images/plate1.jpg"
    );
  });
});
