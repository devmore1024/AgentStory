import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { coverSourceRegistry, resolveCoverAsset } from "@/lib/cover-assets";
import { getStoryCoverFallbackSrc } from "@/lib/story-cover-cdn";

const originalGeneratedCoversDir = process.env.GENERATED_COVERS_DIR;

beforeEach(() => {
  process.env.GENERATED_COVERS_DIR = "/tmp/agentstory-cover-assets-no-generated";
});

afterEach(() => {
  process.env.GENERATED_COVERS_DIR = originalGeneratedCoversDir;
});

describe("resolveCoverAsset", () => {
  it("prefers a stored cover image when no generated cover exists for the slug", () => {
    const asset = resolveCoverAsset({
      slug: "custom-book",
      coverImage: "https://www.gutenberg.org/cache/epub/7439/pg7439.cover.medium.jpg",
      title: "自定义故事",
      categoryKey: "fairy_tale"
    });

    expect(asset.src).toBe("https://www.gutenberg.org/cache/epub/7439/pg7439.cover.medium.jpg");
    expect(asset.isExternal).toBe(true);
    expect(asset.fallbackSrc).toBe(getStoryCoverFallbackSrc("custom-book"));
    expect(asset.sourcePage).toBeNull();
  });

  it("uses slug override metadata when a book has an exact curated match and no stored cover image", () => {
    const asset = resolveCoverAsset({
      slug: "fable-the-crow-and-the-fox",
      coverImage: null,
      title: "乌鸦和狐狸",
      categoryKey: "fable"
    });

    expect(asset.src).toBe(coverSourceRegistry.slugCoverOverrides["fable-the-crow-and-the-fox"].src);
    expect(asset.isExternal).toBe(true);
    expect(asset.fallbackSrc).toBe(getStoryCoverFallbackSrc("fable-the-crow-and-the-fox"));
    expect(asset.sourcePage).toContain("commons.wikimedia.org/wiki/File:");
  });

  it("uses a themed external cover pool for books outside the exact override list", () => {
    const asset = resolveCoverAsset({
      slug: "myth-custom-sky-story",
      coverImage: null,
      title: "织天之光",
      categoryKey: "mythology",
      originalSynopsis: "天空被点燃，众人只能跟随一道古老的光踏上旅途。"
    });

    expect(asset.src).toContain("commons.wikimedia.org");
    expect(asset.isExternal).toBe(true);
    expect(asset.fallbackSrc).toBe(getStoryCoverFallbackSrc("myth-custom-sky-story"));
    expect(asset.sourcePage).toContain("commons.wikimedia.org/wiki/File:");
  });

  it("can intentionally pin a specific fairy tale back to its local cover to avoid mismatched remote art", () => {
    const asset = resolveCoverAsset({
      slug: "fairy-bluebeard",
      coverImage: null,
      title: "蓝胡子",
      categoryKey: "fairy_tale"
    });

    expect(asset.src).toBe(getStoryCoverFallbackSrc("fairy-bluebeard"));
    expect(asset.isExternal).toBe(false);
  });

  it("falls back to the stored database cover image when there is no theming context", () => {
    const asset = resolveCoverAsset({
      slug: "custom-book",
      coverImage: "https://example.com/custom-cover.jpg"
    });

    expect(asset.src).toBe("https://example.com/custom-cover.jpg");
    expect(asset.isExternal).toBe(true);
    expect(asset.fallbackSrc).toBe(getStoryCoverFallbackSrc("custom-book"));
    expect(asset.sourcePage).toBeNull();
  });

  it("falls back to the dynamic local cover when neither themed data nor coverImage exists", () => {
    const asset = resolveCoverAsset({
      slug: "missing-book",
      coverImage: null
    });

    expect(asset.src).toBe(getStoryCoverFallbackSrc("missing-book"));
    expect(asset.fallbackSrc).toBe(getStoryCoverFallbackSrc("missing-book"));
    expect(asset.isExternal).toBe(false);
  });
});
