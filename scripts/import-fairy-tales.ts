import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { activeImportedFairyPilotBooks, top50FairySourceCandidates } from "../lib/fairy-import-pilot";
import {
  extractProjectGutenbergImageUrls,
  extractProjectGutenbergParagraphs,
  pickProjectGutenbergCoverTarget
} from "../lib/project-gutenberg-import";

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "AgentStory/0.1 import script"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function main() {
  const outputDir = path.join(process.cwd(), "plans", "generated");

  await mkdir(outputDir, { recursive: true });

  const preview = await Promise.all(
    activeImportedFairyPilotBooks.map(async (book) => {
      const html = await fetchHtml(book.sourceUrl);

      return {
        slug: book.slug,
        title: book.displayTitleZh,
        sourceUrl: book.sourceUrl,
        sourceCoverTarget: book.sourceCoverTarget,
        discoveredCoverTarget: pickProjectGutenbergCoverTarget(html),
        discoveredImageCount: extractProjectGutenbergImageUrls(html).length,
        discoveredParagraphCount: extractProjectGutenbergParagraphs(html).length
      };
    })
  );

  await writeFile(
    path.join(outputDir, "fairy-import-preview.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        activeCount: activeImportedFairyPilotBooks.length,
        candidateCount: top50FairySourceCandidates.length,
        books: preview
      },
      null,
      2
    ),
    "utf8"
  );
}

void main();
