import { expandedFairyCatalogBooks } from "@/lib/fairy-catalog-expansion";
import { activeImportedFairyPilotBooks, top50FairySourceCandidates } from "@/lib/fairy-import-pilot";
import { curatedFairySourceStorySeeds } from "@/lib/fairy-source-story-seeds";

export type SourceBackedFairyBookSeed = {
  slug: string;
  displayTitleZh: string;
  summary: string;
  originalSynopsis: string;
  storyContentZh: string;
  keyScenes: string[];
  sourceSite: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceLicense: string;
  popularityRank: number;
  isVisibleInPrimaryEntry: boolean;
};

const PROJECT_GUTENBERG = "Project Gutenberg";
const PROJECT_GUTENBERG_LICENSE = "Public domain in the USA via Project Gutenberg.";
const GRIMM_SOURCE_TITLE = "Grimms' Fairy Tales";
const GRIMM_SOURCE_URL = "https://www.gutenberg.org/ebooks/2591";
const PRIMARY_ENTRY_VISIBLE_COUNT = 100;

const top50SummarySeeds = new Map<string, string>([
  ["fairy-the-frog-prince", "任性的公主与一只会说话的青蛙达成约定，隐藏的身份随之浮现。"],
  ["fairy-the-emperors-new-clothes", "整个王国都在配合一场荒唐骗局，直到孩子说出所有人不敢说的话。"],
  ["fairy-thumbelina", "一个拇指大小的女孩被不断带离原地，在陌生世界中寻找归宿。"],
  ["fairy-the-six-swans", "一位公主为了救回被施咒的兄长们，必须在沉默中完成艰难的任务。"],
  ["fairy-ali-baba-and-the-forty-thieves", "樵夫意外发现强盗宝藏，也从此卷入一连串贪婪与机智的较量。"],
  ["fairy-the-valiant-little-tailor", "一个小裁缝因一句夸张口号被卷入巨人、国王与公主的考验。"],
  ["fairy-the-wolf-and-the-seven-kids", "趁母羊不在家时，伪装成善意来访者的狼敲响了门。"],
  ["fairy-the-twelve-brothers", "被命运驱赶的十二个王子与突然到来的妹妹重新连上彼此的人生。"],
  ["fairy-the-fisherman-and-the-goldfish", "一次善意的放生引出无穷无尽的贪欲，海浪也随之越来越高。"],
  ["fairy-the-steadfast-tin-soldier", "只有一条腿的锡兵在风浪与火焰之间守住自己唯一的爱慕。"],
  ["fairy-the-gingerbread-man", "一个会跑会说话的姜饼人一路逃离追赶，却忽略了最后的诱惑。"],
  ["fairy-the-twelve-months", "在雪地里被逼着寻找春天花朵的女孩，遇见了掌管季节的神秘力量。"],
  ["fairy-the-fox-and-the-cat", "自夸有许多办法的狐狸遇见危险时，未必比只有一种办法的猫更从容。"],
  ["fairy-dick-whittington-and-his-cat", "穷孩子带着一只猫闯向城市，希望在陌生世界里为自己挣出一个新开头。"]
]);

function normalizeSourceBackedFairySlug(slug: string) {
  if (slug === "fairy-six-swans") {
    return "fairy-the-six-swans";
  }

  return slug;
}

function normalizeSentence(value: string) {
  const trimmed = value.trim().replace(/[。！？；，、]+$/u, "");

  if (!trimmed) {
    return "";
  }

  return `${trimmed}。`;
}

function splitSummaryClauses(summary: string) {
  return summary
    .replace(/[。！？]/gu, " ")
    .split(/[，；、]/u)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildGeneratedOriginalSynopsis(title: string, summary: string) {
  const clauses = splitSummaryClauses(summary);
  const pivot = clauses[1] ?? clauses[0] ?? `${title}里的命运转折`;

  return `${normalizeSentence(summary)}一路往后，${pivot}会把主角推向更深的试炼、误解或选择，也让这个故事真正显出它想留下的那层意味。`;
}

function buildGeneratedStoryContent(title: string, summary: string, sourceTitle: string) {
  const clauses = splitSummaryClauses(summary);
  const opening = clauses[0] ?? `${title}的命运被轻轻推开`;
  const middle = clauses[1] ?? "人物必须在误解、诱惑或试炼里继续往前走";
  const closing = clauses[2] ?? "故事最终会把真相、团圆或成长落回主角身上";

  return [
    `故事往往就从这样一个开端开始：${normalizeSentence(opening)}`,
    `随后，${normalizeSentence(middle)}主角会在一步步被推着往前走的过程中，看见自己真正要守住的东西，也把原本平静的处境带向更大的转折。`,
    `等到结尾，${normalizeSentence(closing)}这个整理版会保留原作最经典的情绪线，并把原文入口统一指向 ${sourceTitle}。`
  ].join("\n\n");
}

function buildGeneratedKeyScenes(title: string, summary: string) {
  const clauses = splitSummaryClauses(summary);
  const first = clauses[0] ? `${clauses[0]}。` : `《${title}》先把主角推到一个无法回避的开端前。`;
  const second = clauses[1] ? `${clauses[1]}。` : `接着，主角会在误解、诱惑或试炼里被迫做出关键选择。`;
  const thirdSource = clauses[2] ?? clauses[clauses.length - 1] ?? "";
  const third = thirdSource ? `${thirdSource}。` : `最后，故事会把真相、成长或团圆真正落回主角身上。`;

  return [first, second, third].map((item) => item.replace(/。。$/u, "。"));
}

const importedBySlug = new Map(
  activeImportedFairyPilotBooks.map((book) => [normalizeSourceBackedFairySlug(book.slug), book])
);

const expandedBySlug = new Map(expandedFairyCatalogBooks.map((book) => [book.slug, book]));

function buildTop50SourceBackedBook(slug: string) {
  const imported = importedBySlug.get(slug);

  if (imported) {
    return {
      slug,
      displayTitleZh: imported.displayTitleZh,
      summary: imported.summary,
      originalSynopsis: imported.originalSynopsis,
      storyContentZh: imported.storyContent,
      keyScenes: imported.keyScenes,
      sourceSite: imported.sourceSite,
      sourceTitle: imported.sourceTitleEn,
      sourceUrl: imported.sourceUrl,
      sourceLicense: imported.sourceLicense
    };
  }

  const candidate = top50FairySourceCandidates.find((item) => normalizeSourceBackedFairySlug(item.slug) === slug);

  if (!candidate) {
    return null;
  }

  const summary = top50SummarySeeds.get(slug) ?? expandedBySlug.get(slug)?.summary;
  const curated = curatedFairySourceStorySeeds.get(slug);

  if (!summary) {
    return null;
  }

  return {
    slug,
    displayTitleZh: candidate.displayTitleZh,
    summary,
    originalSynopsis: curated?.originalSynopsis ?? buildGeneratedOriginalSynopsis(candidate.displayTitleZh, summary),
    storyContentZh:
      curated?.storyParagraphs.join("\n\n") ?? buildGeneratedStoryContent(candidate.displayTitleZh, summary, candidate.sourceTitleEn),
    keyScenes: curated?.keyScenes ?? buildGeneratedKeyScenes(candidate.displayTitleZh, summary),
    sourceSite: PROJECT_GUTENBERG,
    sourceTitle: candidate.sourceTitleEn,
    sourceUrl: candidate.sourceUrl,
    sourceLicense: candidate.licenseNote
  };
}

const primaryEntryExpansionOnlyBooks = expandedFairyCatalogBooks
  .filter((book) => !top50FairySourceCandidates.some((candidate) => normalizeSourceBackedFairySlug(candidate.slug) === book.slug))
  .slice(0, PRIMARY_ENTRY_VISIBLE_COUNT - top50FairySourceCandidates.length)
  .map((book, index) => ({
    slug: book.slug,
    displayTitleZh: book.title,
    summary: book.summary,
    originalSynopsis: buildGeneratedOriginalSynopsis(book.title, book.summary),
    storyContentZh: buildGeneratedStoryContent(book.title, book.summary, GRIMM_SOURCE_TITLE),
    keyScenes: buildGeneratedKeyScenes(book.title, book.summary),
    sourceSite: PROJECT_GUTENBERG,
    sourceTitle: GRIMM_SOURCE_TITLE,
    sourceUrl: GRIMM_SOURCE_URL,
    sourceLicense: PROJECT_GUTENBERG_LICENSE,
    popularityRank: top50FairySourceCandidates.length + index + 1,
    isVisibleInPrimaryEntry: true
  }));

const top50SourceBackedBooks = top50FairySourceCandidates.flatMap((candidate) => {
  const slug = normalizeSourceBackedFairySlug(candidate.slug);
  const book = buildTop50SourceBackedBook(slug);

  if (!book) {
    return [];
  }

  return [
    {
      ...book,
      popularityRank: candidate.popularityRank,
      isVisibleInPrimaryEntry: true
    } satisfies SourceBackedFairyBookSeed
  ];
});

export const sourceBackedFairyCatalog: SourceBackedFairyBookSeed[] = [
  ...top50SourceBackedBooks,
  ...primaryEntryExpansionOnlyBooks
];

if (sourceBackedFairyCatalog.length !== PRIMARY_ENTRY_VISIBLE_COUNT) {
  throw new Error(
    `Expected ${PRIMARY_ENTRY_VISIBLE_COUNT} source-backed fairy tales, received ${sourceBackedFairyCatalog.length}.`
  );
}

export const sourceBackedFairyCatalogBySlug = new Map(sourceBackedFairyCatalog.map((book) => [book.slug, book]));

export const primaryEntryVisibleFairySlugs = new Set(
  sourceBackedFairyCatalog.filter((book) => book.isVisibleInPrimaryEntry).map((book) => book.slug)
);

export function isSourceBackedPrimaryEntryFairySlug(slug: string | null | undefined) {
  if (!slug) {
    return false;
  }

  return primaryEntryVisibleFairySlugs.has(normalizeSourceBackedFairySlug(slug));
}

export function getSourceBackedFairyBook(slug: string) {
  return sourceBackedFairyCatalogBySlug.get(normalizeSourceBackedFairySlug(slug)) ?? null;
}
