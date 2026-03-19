import os from "node:os";
import path from "node:path";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveCoverAsset } from "@/lib/cover-assets";

const tempDirs: string[] = [];
const originalGeneratedCoversDir = process.env.GENERATED_COVERS_DIR;

beforeEach(() => {
  process.env.GENERATED_COVERS_DIR = undefined;
});

afterEach(async () => {
  process.env.GENERATED_COVERS_DIR = originalGeneratedCoversDir;
  await Promise.all(
    tempDirs.splice(0).map((dir) =>
      rm(dir, {
        recursive: true,
        force: true
      })
    )
  );
});

describe("resolveCoverAsset generated cover preference", () => {
  it("prefers a generated local cover over curated remote artwork", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "generated-cover-asset-"));
    tempDirs.push(dir);
    process.env.GENERATED_COVERS_DIR = dir;

    await writeFile(path.join(dir, "fairy-little-red-riding-hood.jpeg"), "cover");

    const asset = resolveCoverAsset({
      slug: "fairy-little-red-riding-hood",
      coverImage: null,
      title: "小红帽",
      categoryKey: "fairy_tale"
    });

    expect(asset.src).toBe("/generated-covers/fairy-little-red-riding-hood.jpeg");
    expect(asset.isExternal).toBe(false);
    expect(asset.fallbackSrc).toBe("/covers/fairy-little-red-riding-hood");
  });
});
