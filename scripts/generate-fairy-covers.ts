import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const promptTemplatePath = path.join(repoRoot, "docs/封面图提示词.md");
const importPilotPath = path.join(repoRoot, "lib/fairy-import-pilot.ts");
const expansionPath = path.join(repoRoot, "lib/fairy-catalog-expansion.ts");
const generatedCoversDir = path.join(repoRoot, "public/generated-covers");
const minimaxCliPath = path.join(process.env.HOME ?? "", ".codex/skills/minimax-imagegen/scripts/minimax_image_gen.py");
const titlePlaceholder = "【书名，例如：Little Red Riding Hood】";
const defaultCount = 100;
const promptTitleOverrides: Record<string, string> = {
  "fairy-dick-whittington-and-his-cat": "The Story of Whittington and His Cat",
  "fairy-cat-skin": "Catskin"
};

type FairyCoverSeed = {
  slug: string;
  titleZh: string;
  titleEn: string;
  popularityRank: number;
};

type ParsedTopCandidate = FairyCoverSeed;

type ParsedExpansionBook = {
  slug: string;
  titleZh: string;
};

function parseArgs(argv: string[]) {
  const options = {
    count: defaultCount,
    start: 1,
    force: false,
    dryRun: false,
    skipExisting: true
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--count") {
      const raw = argv[index + 1];
      if (!raw) {
        throw new Error("Missing value for --count");
      }
      options.count = Number.parseInt(raw, 10);
      index += 1;
      continue;
    }

    if (arg === "--start") {
      const raw = argv[index + 1];
      if (!raw) {
        throw new Error("Missing value for --start");
      }
      options.start = Number.parseInt(raw, 10);
      index += 1;
      continue;
    }

    if (arg === "--force") {
      options.force = true;
      options.skipExisting = false;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--no-skip-existing") {
      options.skipExisting = false;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isInteger(options.count) || options.count < 1) {
    throw new Error("--count must be a positive integer");
  }

  if (!Number.isInteger(options.start) || options.start < 1) {
    throw new Error("--start must be a positive integer");
  }

  return options;
}

function deriveEnglishTitleFromSlug(slug: string) {
  const words = slug
    .replace(/^fairy-/, "")
    .split("-")
    .filter(Boolean);
  const lowerCaseWords = new Set(["and", "the", "of", "in", "with", "to", "at", "for", "on"]);

  return words
    .map((word, index) => {
      if (index > 0 && lowerCaseWords.has(word)) {
        return word;
      }

      if (word === "mrs") {
        return "Mrs";
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function parseTop50Candidates(source: string) {
  const blockPattern =
    /candidate\(\{\s+slug:\s+"([^"]+)",\s+displayTitleZh:\s+"([^"]+)",\s+sourceTitleEn:\s+"([^"]+)"[\s\S]*?popularityRank:\s+(\d+),/g;
  const results: ParsedTopCandidate[] = [];

  for (const match of source.matchAll(blockPattern)) {
    results.push({
      slug: match[1],
      titleZh: match[2],
      titleEn: match[3],
      popularityRank: Number.parseInt(match[4], 10)
    });
  }

  return results.sort((left, right) => left.popularityRank - right.popularityRank);
}

function parseExpandedCatalog(source: string) {
  const linePattern = /\{\s*title:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*summary:\s*"[^"]*"\s*\}/g;
  const results: ParsedExpansionBook[] = [];

  for (const match of source.matchAll(linePattern)) {
    results.push({
      titleZh: match[1],
      slug: match[2]
    });
  }

  return results;
}

async function loadFairyCoverSeeds(): Promise<FairyCoverSeed[]> {
  const [pilotSource, expansionSource] = await Promise.all([
    readFile(importPilotPath, "utf8"),
    readFile(expansionPath, "utf8")
  ]);

  const top50 = parseTop50Candidates(pilotSource);
  const expanded = parseExpandedCatalog(expansionSource);
  const excludedSlugs = new Set(top50.map((entry) => entry.slug === "fairy-six-swans" ? "fairy-the-six-swans" : entry.slug));
  const expansionOnly = expanded
    .filter((entry) => !excludedSlugs.has(entry.slug))
    .slice(0, defaultCount - top50.length)
    .map((entry, index) => ({
      slug: entry.slug,
      titleZh: entry.titleZh,
      titleEn: deriveEnglishTitleFromSlug(entry.slug),
      popularityRank: top50.length + index + 1
    }));

  const normalizedTop50 = top50.map((entry) => ({
    ...entry,
    slug: entry.slug === "fairy-six-swans" ? "fairy-the-six-swans" : entry.slug
  }));

  const all = [...normalizedTop50, ...expansionOnly];

  if (all.length !== defaultCount) {
    throw new Error(`Expected ${defaultCount} fairy cover seeds, received ${all.length}`);
  }

  return all;
}

function buildPrompt(template: string, titleEn: string) {
  if (!template.includes(titlePlaceholder)) {
    throw new Error(`Prompt template is missing placeholder: ${titlePlaceholder}`);
  }

  return template.replace(titlePlaceholder, titleEn);
}

function getPromptTitle(seed: FairyCoverSeed) {
  return promptTitleOverrides[seed.slug] ?? seed.titleEn;
}

async function generateCover(seed: FairyCoverSeed, template: string, force: boolean) {
  const outputRoot = path.join(generatedCoversDir, seed.slug);
  const args = [
    minimaxCliPath,
    "generate",
    "--prompt",
    buildPrompt(template, getPromptTitle(seed)),
    "--no-augment",
    "--aspect-ratio",
    "3:4",
    "--out",
    outputRoot
  ];

  if (force) {
    args.push("--force");
  }

  await execFileAsync("python3", args, {
    cwd: repoRoot,
    env: process.env,
    maxBuffer: 1024 * 1024 * 20
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const [template, seeds] = await Promise.all([readFile(promptTemplatePath, "utf8"), loadFairyCoverSeeds()]);
  const selected = seeds.slice(options.start - 1, options.start - 1 + options.count);

  await mkdir(generatedCoversDir, { recursive: true });

  if (selected.length === 0) {
    throw new Error("No books selected for generation");
  }

  console.log(`Preparing ${selected.length} fairy covers from rank ${options.start}.`);

  const failures: Array<{ seed: FairyCoverSeed; message: string }> = [];

  for (const [index, seed] of selected.entries()) {
    const targetPath = path.join(generatedCoversDir, `${seed.slug}.jpeg`);
    const promptTitle = getPromptTitle(seed);
    const prompt = buildPrompt(template, promptTitle);
    const prefix = `[${index + 1}/${selected.length}] rank ${seed.popularityRank} ${seed.slug}`;

    if (options.dryRun) {
      console.log(`${prefix} -> ${seed.titleEn}`);
      console.log(prompt);
      continue;
    }

    if (options.skipExisting) {
      try {
        const existing = await readFile(targetPath);
        if (existing.length > 0) {
          console.log(`${prefix} skipped (existing)`);
          continue;
        }
      } catch {
        // Continue to generation when the file is missing.
      }
    }

    console.log(`${prefix} generating -> ${promptTitle}`);

    try {
      await generateCover(seed, template, options.force);
      console.log(`${prefix} done`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ seed, message });
      console.error(`${prefix} failed -> ${message}`);
    }
  }

  if (failures.length > 0) {
    console.error(`Fairy cover generation finished with ${failures.length} failure(s).`);
    for (const failure of failures) {
      console.error(`- rank ${failure.seed.popularityRank} ${failure.seed.slug}: ${failure.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Fairy cover generation finished.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
