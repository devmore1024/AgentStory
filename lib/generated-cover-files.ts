import path from "node:path";
import { access } from "node:fs/promises";
import { existsSync } from "node:fs";
import { getStoryCoverCdnUrl } from "@/lib/story-cover-cdn";

const GENERATED_COVER_EXTENSIONS = [".jpeg", ".jpg", ".png", ".webp"] as const;

const CONTENT_TYPE_BY_EXTENSION: Record<(typeof GENERATED_COVER_EXTENSIONS)[number], string> = {
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

export type GeneratedCoverFile = {
  filePath: string;
  contentType: string;
};

function isSafeSlug(slug: string) {
  return /^[a-z0-9-]+$/i.test(slug);
}

function getGeneratedCoverBaseDir(baseDir?: string) {
  return baseDir ?? process.env.GENERATED_COVERS_DIR ?? path.join(process.cwd(), "public/generated-covers");
}

function getPublicCoverPath(slug: string, extension: string) {
  return getStoryCoverCdnUrl(`/generated-covers/${slug}${extension}`);
}

export function resolveGeneratedCoverPublicPathSync(
  slug: string,
  baseDir?: string
): string | null {
  if (!isSafeSlug(slug)) {
    return null;
  }

  const resolvedBaseDir = getGeneratedCoverBaseDir(baseDir);

  for (const extension of GENERATED_COVER_EXTENSIONS) {
    const filePath = path.join(resolvedBaseDir, `${slug}${extension}`);

    if (existsSync(filePath)) {
      return getPublicCoverPath(slug, extension);
    }
  }

  return null;
}

export async function resolveGeneratedCoverFile(
  slug: string,
  baseDir?: string
): Promise<GeneratedCoverFile | null> {
  if (!isSafeSlug(slug)) {
    return null;
  }

  const resolvedBaseDir = getGeneratedCoverBaseDir(baseDir);

  for (const extension of GENERATED_COVER_EXTENSIONS) {
    const filePath = path.join(resolvedBaseDir, `${slug}${extension}`);

    try {
      await access(filePath);
      return {
        filePath,
        contentType: CONTENT_TYPE_BY_EXTENSION[extension]
      };
    } catch {
      continue;
    }
  }

  return null;
}
