import { describe, expect, it } from "vitest";
import { coverSourceRegistry, resolveCoverAsset } from "@/lib/cover-assets";

describe("resolveCoverAsset", () => {
  it("prefers a stored cover image before curated overrides when imported data is present", () => {
    const asset = resolveCoverAsset({
      slug: "fairy-the-three-little-pigs",
      coverImage: "https://www.gutenberg.org/cache/epub/7439/pg7439.cover.medium.jpg",
      title: "三只小猪",
      categoryKey: "fairy_tale"
    });

    expect(asset.src).toBe("https://www.gutenberg.org/cache/epub/7439/pg7439.cover.medium.jpg");
    expect(asset.isExternal).toBe(true);
    expect(asset.fallbackSrc).toBe("/covers/fairy-the-three-little-pigs");
    expect(asset.sourcePage).toBeNull();
  });

  it("uses slug override metadata when a book has an exact curated match and no stored cover image", () => {
    const asset = resolveCoverAsset({
      slug: "fairy-the-three-little-pigs",
      coverImage: null,
      title: "三只小猪",
      categoryKey: "fairy_tale"
    });

    expect(asset.src).toBe(coverSourceRegistry.slugCoverOverrides["fairy-the-three-little-pigs"].src);
    expect(asset.isExternal).toBe(true);
    expect(asset.fallbackSrc).toBe("/covers/fairy-the-three-little-pigs");
    expect(asset.sourcePage).toContain("commons.wikimedia.org/wiki/File:");
  });

  it("uses a themed external cover pool for books outside the exact override list", () => {
    const asset = resolveCoverAsset({
      slug: "fairy-bluebeard",
      coverImage: null,
      title: "蓝胡子",
      categoryKey: "fairy_tale",
      originalSynopsis: "新婚妻子被告诫不要打开某一扇门，而门后的秘密远比她想象得可怕。"
    });

    expect(asset.src).toContain("commons.wikimedia.org");
    expect(asset.isExternal).toBe(true);
    expect(asset.fallbackSrc).toBe("/covers/fairy-bluebeard");
    expect(asset.sourcePage).toContain("commons.wikimedia.org/wiki/File:");
  });

  it("can intentionally pin a specific fairy tale back to its local cover to avoid mismatched remote art", () => {
    const asset = resolveCoverAsset({
      slug: "fairy-bluebeard",
      coverImage: null,
      title: "蓝胡子",
      categoryKey: "fairy_tale"
    });

    expect(asset.src).toBe("/covers/fairy-bluebeard");
    expect(asset.isExternal).toBe(false);
  });

  it("falls back to the stored database cover image when there is no theming context", () => {
    const asset = resolveCoverAsset({
      slug: "custom-book",
      coverImage: "https://example.com/custom-cover.jpg"
    });

    expect(asset.src).toBe("https://example.com/custom-cover.jpg");
    expect(asset.isExternal).toBe(true);
    expect(asset.fallbackSrc).toBe("/covers/custom-book");
    expect(asset.sourcePage).toBeNull();
  });

  it("falls back to the dynamic local cover when neither themed data nor coverImage exists", () => {
    const asset = resolveCoverAsset({
      slug: "missing-book",
      coverImage: null
    });

    expect(asset.src).toBe("/covers/missing-book");
    expect(asset.fallbackSrc).toBe("/covers/missing-book");
    expect(asset.isExternal).toBe(false);
  });
});
