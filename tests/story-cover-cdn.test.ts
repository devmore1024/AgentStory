import { afterEach, describe, expect, it } from "vitest";
import {
  getManagedStoryCoverPath,
  getStoryCoverCdnBaseUrl,
  getStoryCoverCdnUrl,
  getStoryCoverFallbackSrc,
  isManagedStoryCoverAsset,
  isStoryCoverFallbackSrc
} from "@/lib/story-cover-cdn";

const originalBaseUrl = process.env.NEXT_PUBLIC_STORY_COVER_CDN_BASE_URL;
const originalServerBaseUrl = process.env.STORY_COVER_CDN_BASE_URL;
const originalAliyunBaseUrl = process.env.ALIYUN_CDN_BASE_URL;
const originalAssetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX;
const originalBucket = process.env.ALIYUN_OSS_BUCKET;
const originalRegion = process.env.ALIYUN_OSS_REGION;

afterEach(() => {
  process.env.NEXT_PUBLIC_ASSET_PREFIX = originalAssetPrefix;
  process.env.NEXT_PUBLIC_STORY_COVER_CDN_BASE_URL = originalBaseUrl;
  process.env.STORY_COVER_CDN_BASE_URL = originalServerBaseUrl;
  process.env.ALIYUN_CDN_BASE_URL = originalAliyunBaseUrl;
  process.env.ALIYUN_OSS_BUCKET = originalBucket;
  process.env.ALIYUN_OSS_REGION = originalRegion;
});

describe("story cover CDN helpers", () => {
  it("prioritizes NEXT_PUBLIC_ASSET_PREFIX for managed cover paths and keeps the remaining path intact", () => {
    process.env.NEXT_PUBLIC_ASSET_PREFIX = "https://assets.example.com/";
    process.env.NEXT_PUBLIC_STORY_COVER_CDN_BASE_URL = "https://cdn.example.com/";

    expect(getStoryCoverCdnBaseUrl()).toBe("https://assets.example.com");
    expect(getStoryCoverCdnUrl("/generated-covers/fairy-cinderella.jpeg")).toBe(
      "https://assets.example.com/story/generated-covers/fairy-cinderella.jpeg"
    );
    expect(getStoryCoverFallbackSrc("fairy-cinderella")).toBe(
      "https://assets.example.com/story/covers/fairy-cinderella"
    );
  });

  it("derives the default base URL from the configured OSS bucket and region", () => {
    process.env.NEXT_PUBLIC_ASSET_PREFIX = "";
    process.env.NEXT_PUBLIC_STORY_COVER_CDN_BASE_URL = "";
    process.env.STORY_COVER_CDN_BASE_URL = "";
    process.env.ALIYUN_CDN_BASE_URL = "";
    process.env.ALIYUN_OSS_BUCKET = "storybook";
    process.env.ALIYUN_OSS_REGION = "oss-cn-shanghai";

    expect(getStoryCoverCdnBaseUrl()).toBe("https://storybook.oss-cn-shanghai.aliyuncs.com");
  });

  it("keeps third-party URLs unchanged and only marks story CDN assets as managed", () => {
    process.env.NEXT_PUBLIC_ASSET_PREFIX = "https://assets.example.com";

    expect(getStoryCoverCdnUrl("https://commons.wikimedia.org/example.jpg")).toBe(
      "https://commons.wikimedia.org/example.jpg"
    );
    expect(isManagedStoryCoverAsset("https://assets.example.com/story/covers/fairy-bluebeard")).toBe(true);
    expect(isManagedStoryCoverAsset("https://commons.wikimedia.org/example.jpg")).toBe(false);
    expect(getManagedStoryCoverPath("https://assets.example.com/story/generated-covers/fairy-bluebeard.jpeg")).toBe(
      "/generated-covers/fairy-bluebeard.jpeg"
    );
    expect(
      isStoryCoverFallbackSrc("https://assets.example.com/story/covers/fairy-bluebeard", "fairy-bluebeard")
    ).toBe(true);
  });
});
