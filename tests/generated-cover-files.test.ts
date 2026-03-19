import os from "node:os";
import path from "node:path";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { afterEach, describe, expect, it } from "vitest";
import { resolveGeneratedCoverFile, resolveGeneratedCoverPublicPathSync } from "@/lib/generated-cover-files";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) =>
      rm(dir, {
        recursive: true,
        force: true
      })
    )
  );
});

describe("resolveGeneratedCoverFile", () => {
  it("returns a generated jpeg cover when one exists for the slug", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "generated-cover-files-"));
    tempDirs.push(dir);

    const expectedPath = path.join(dir, "fairy-the-snow-queen.jpeg");
    await writeFile(expectedPath, "cover");

    const result = await resolveGeneratedCoverFile("fairy-the-snow-queen", dir);

    expect(result).toEqual({
      filePath: expectedPath,
      contentType: "image/jpeg"
    });
    expect(resolveGeneratedCoverPublicPathSync("fairy-the-snow-queen", dir)).toBe(
      "/generated-covers/fairy-the-snow-queen.jpeg"
    );
  });

  it("returns null when no generated cover file exists", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "generated-cover-files-"));
    tempDirs.push(dir);

    await writeFile(path.join(dir, "another-book.png"), "cover");

    await expect(resolveGeneratedCoverFile("fairy-bluebeard", dir)).resolves.toBeNull();
  });

  it("rejects unsafe slug values", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "generated-cover-files-"));
    tempDirs.push(dir);

    await expect(resolveGeneratedCoverFile("../secret", dir)).resolves.toBeNull();
    expect(resolveGeneratedCoverPublicPathSync("../secret", dir)).toBeNull();
  });
});
