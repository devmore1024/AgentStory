import { expandedFairyCatalogBooks } from "@/lib/fairy-catalog-expansion";
import { activeImportedFairyPilotBooks, top50FairySourceCandidates } from "@/lib/fairy-import-pilot";
import { curatedFairySourceStorySeeds, getCuratedFairyKeyScenes } from "@/lib/fairy-source-story-seeds";

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

function inferSynopsisFocus(summary: string) {
  if (/诅咒|变成|魔法|妖|怪|恶魔/u.test(summary)) {
    return "解除诅咒、认清真心或穿过代价";
  }

  if (/王子|公主|身份|婚约|新娘|冒充/u.test(summary)) {
    return "身份被遮蔽后的试探、错认与重新归位";
  }

  if (/兄妹|哥哥|妹妹|父亲|母亲|家人/u.test(summary)) {
    return "亲情在分离、牺牲与守护里的分量";
  }

  if (/贪心|虚荣|夸口|欲望|谎言/u.test(summary)) {
    return "欲望、虚荣或谎言一步步推高后的后果";
  }

  if (/旅途|寻找|追寻|一路|流浪|远方/u.test(summary)) {
    return "旅途中不断出现的选择、帮助与背叛";
  }

  return "命运转弯时必须面对的选择与代价";
}

function buildGeneratedOriginalSynopsis(title: string, summary: string) {
  const focus = inferSynopsisFocus(summary);

  return `${normalizeSentence(summary)}故事真正往后展开时，它关心的往往不只是哪件事发生了，而是主角怎样在 ${focus} 的过程中，看见自己真正要守住的东西。`;
}

function buildGeneratedStoryContent(title: string, summary: string, sourceTitle: string) {
  const clauses = splitSummaryClauses(summary);
  const opening = clauses[0] ?? `${title}的命运被轻轻推开`;
  const turn = clauses[1] ?? "主角很快发现眼前的问题远没有看上去那么简单";
  const pressure = clauses[2] ?? "接下来的试炼会把关系、承诺、欲望或身份的代价一层层逼出来";
  const focus = inferSynopsisFocus(summary);

  return [
    `故事一开始，${normalizeSentence(opening)}`,
    `很快，${normalizeSentence(turn)}主角不再只是应付一个突如其来的麻烦，而是被推向更深的试炼与转弯。`,
    `随着情节继续往前，${normalizeSentence(pressure)}《${title}》真正拧紧的，也正是 ${focus} 这一层意味。`,
    `等走到结尾，故事通常会把真相、团圆、惩罚或成长重新落回人物身上。这里保留的是它最经典的情绪线，并把原文入口统一指向 ${sourceTitle}。`
  ].join("\n\n");
}

function buildGeneratedKeyScenes(title: string, summary: string) {
  const clauses = splitSummaryClauses(summary);
  const first = clauses[0] ? `${clauses[0]}。` : `《${title}》先把主角推到一个无法回避的开端前。`;
  const second = clauses[1] ? `${clauses[1]}。` : "局势很快从表面事件，转向更难回避的选择题。";
  const third = clauses[2]
    ? `${clauses[2]}。`
    : "随着试炼加深，主角开始看见关系、身份或欲望背后的真正代价。";
  const fourth = `走到后段时，《${title}》会把真相、惩罚、成长或重逢真正推到台前。`;

  return [first, second, third, fourth].map((item) => item.replace(/。。$/u, "。"));
}

function resolveFairyNarrativeContent(params: {
  slug: string;
  title: string;
  summary: string;
  sourceTitle: string;
}) {
  const curated = curatedFairySourceStorySeeds.get(params.slug);

  return {
    originalSynopsis: curated?.originalSynopsis ?? buildGeneratedOriginalSynopsis(params.title, params.summary),
    storyContentZh:
      curated?.storyParagraphs.join("\n\n") ?? buildGeneratedStoryContent(params.title, params.summary, params.sourceTitle),
    keyScenes: getCuratedFairyKeyScenes(params.slug) ?? buildGeneratedKeyScenes(params.title, params.summary)
  };
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
  if (!summary) {
    return null;
  }

  const narrative = resolveFairyNarrativeContent({
    slug,
    title: candidate.displayTitleZh,
    summary,
    sourceTitle: candidate.sourceTitleEn
  });

  return {
    slug,
    displayTitleZh: candidate.displayTitleZh,
    summary,
    ...narrative,
    sourceSite: PROJECT_GUTENBERG,
    sourceTitle: candidate.sourceTitleEn,
    sourceUrl: candidate.sourceUrl,
    sourceLicense: candidate.licenseNote
  };
}

const primaryEntryExpansionOnlyBooks = expandedFairyCatalogBooks
  .filter((book) => !top50FairySourceCandidates.some((candidate) => normalizeSourceBackedFairySlug(candidate.slug) === book.slug))
  .slice(0, PRIMARY_ENTRY_VISIBLE_COUNT - top50FairySourceCandidates.length)
  .map((book, index) => {
    const narrative = resolveFairyNarrativeContent({
      slug: book.slug,
      title: book.title,
      summary: book.summary,
      sourceTitle: GRIMM_SOURCE_TITLE
    });

    return {
      slug: book.slug,
      displayTitleZh: book.title,
      summary: book.summary,
      ...narrative,
      sourceSite: PROJECT_GUTENBERG,
      sourceTitle: GRIMM_SOURCE_TITLE,
      sourceUrl: GRIMM_SOURCE_URL,
      sourceLicense: PROJECT_GUTENBERG_LICENSE,
      popularityRank: top50FairySourceCandidates.length + index + 1,
      isVisibleInPrimaryEntry: true
    };
  });

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
