import { resolveCoverAsset } from "@/lib/cover-assets";
import { isStoryCoverFallbackSrc } from "@/lib/story-cover-cdn";

export type ImportedFairySource = {
  slug: string;
  displayTitleZh: string;
  sourceTitleEn: string;
  sourceUrl: string;
  sourceCoverTarget: string;
  licenseNote: string;
  popularityRank: number;
  chapterAnchor?: string;
  isPilotActive: boolean;
};

export type ImportedFairyBook = ImportedFairySource & {
  summary: string;
  originalSynopsis: string;
  storyContent: string;
  keyScenes: string[];
  coverImage: string | null;
  sourceSite: string;
  sourceLicense: string;
};

const PROJECT_GUTENBERG = "Project Gutenberg";
const PROJECT_GUTENBERG_LICENSE = "Public domain in the USA via Project Gutenberg.";

function buildStoryContent(paragraphs: string[]) {
  return paragraphs.join("\n\n");
}

function createImportedCover(input: {
  slug: string;
  title: string;
  summary: string;
  originalSynopsis: string;
  coverImage?: string | null;
}) {
  const resolved = resolveCoverAsset({
    slug: input.slug,
    coverImage: null,
    title: input.title,
    categoryKey: "fairy_tale",
    summary: input.summary,
    originalSynopsis: input.originalSynopsis
  });

  return isStoryCoverFallbackSrc(resolved.src, input.slug) ? null : resolved.src;
}

function candidate(source: ImportedFairySource) {
  return source;
}

function createActiveBook(
  source: ImportedFairySource,
  details: {
    summary: string;
    originalSynopsis: string;
    storyParagraphs: string[];
    keyScenes: string[];
    coverImage?: string | null;
  }
): ImportedFairyBook {
  return {
    ...source,
    summary: details.summary,
    originalSynopsis: details.originalSynopsis,
    storyContent: buildStoryContent(details.storyParagraphs),
    keyScenes: details.keyScenes,
    coverImage: createImportedCover({
      slug: source.slug,
      title: source.displayTitleZh,
      summary: details.summary,
      originalSynopsis: details.originalSynopsis,
      coverImage: details.coverImage
    }),
    sourceSite: PROJECT_GUTENBERG,
    sourceLicense: PROJECT_GUTENBERG_LICENSE
  };
}

export const top50FairySourceCandidates: ImportedFairySource[] = [
  candidate({
    slug: "fairy-little-red-riding-hood",
    displayTitleZh: "小红帽",
    sourceTitleEn: "Little Red Riding-Hood",
    sourceUrl: "https://www.gutenberg.org/ebooks/33931",
    sourceCoverTarget: "https://www.gutenberg.org/cache/epub/33931/images/p0593_lg.jpg",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 1,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-cinderella",
    displayTitleZh: "灰姑娘",
    sourceTitleEn: "Cinderella",
    sourceUrl: "https://www.gutenberg.org/ebooks/33931",
    sourceCoverTarget: "https://www.gutenberg.org/cache/epub/33931/images/p0005_lg.jpg",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 2,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-snow-white",
    displayTitleZh: "白雪公主",
    sourceTitleEn: "Snow White",
    sourceUrl: "https://www.gutenberg.org/ebooks/20748",
    sourceCoverTarget: "https://www.gutenberg.org/cache/epub/20748/images/page_005.png",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 3,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-sleeping-beauty",
    displayTitleZh: "睡美人",
    sourceTitleEn: "The Sleeping Beauty in the Wood",
    sourceUrl: "https://www.gutenberg.org/ebooks/33931",
    sourceCoverTarget: "https://www.gutenberg.org/cache/epub/33931/images/ifrontis.jpg",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 4,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-hansel-and-gretel",
    displayTitleZh: "汉塞尔与格蕾特",
    sourceTitleEn: "Hansel and Gretel",
    sourceUrl: "https://www.gutenberg.org/ebooks/20748",
    sourceCoverTarget: "https://www.gutenberg.org/cache/epub/20748/images/page_049.png",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 5,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-puss-in-boots",
    displayTitleZh: "穿靴子的猫",
    sourceTitleEn: "Puss in Boots",
    sourceUrl: "https://www.gutenberg.org/ebooks/33931",
    sourceCoverTarget: "https://www.gutenberg.org/cache/epub/33931/images/p0149_lg.jpg",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 6,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-beauty-and-the-beast",
    displayTitleZh: "美女与野兽",
    sourceTitleEn: "Beauty and the Beast",
    sourceUrl: "https://www.gutenberg.org/ebooks/20748",
    sourceCoverTarget: "https://www.gutenberg.org/cache/epub/20748/images/page_030.png",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 7,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-bluebeard",
    displayTitleZh: "蓝胡子",
    sourceTitleEn: "Blue Beard",
    sourceUrl: "https://www.gutenberg.org/ebooks/33931",
    sourceCoverTarget: "https://www.gutenberg.org/cache/epub/33931/images/p0359_lg.jpg",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 8,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-jack-and-the-beanstalk",
    displayTitleZh: "杰克和魔豆",
    sourceTitleEn: "Jack and the Beanstalk",
    sourceUrl: "https://www.gutenberg.org/ebooks/20748",
    sourceCoverTarget: "https://www.gutenberg.org/cache/epub/20748/images/page_039.png",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 9,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-goldilocks-and-the-three-bears",
    displayTitleZh: "金发姑娘和三只熊",
    sourceTitleEn: "The Three Bears",
    sourceUrl: "https://www.gutenberg.org/ebooks/20748",
    sourceCoverTarget: "https://www.gutenberg.org/cache/epub/20748/images/page_022.png",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 10,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-the-ugly-duckling",
    displayTitleZh: "丑小鸭",
    sourceTitleEn: "The Ugly Duckling",
    sourceUrl: "https://www.gutenberg.org/ebooks/20748",
    sourceCoverTarget: "https://www.gutenberg.org/cache/epub/20748/images/page_008.png",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 11,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-the-little-match-girl",
    displayTitleZh: "卖火柴的小女孩",
    sourceTitleEn: "The Little Match Girl",
    sourceUrl: "https://www.gutenberg.org/ebooks/20748",
    sourceCoverTarget: "https://www.gutenberg.org/cache/epub/20748/images/page_026.png",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 12,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-aladdin-and-the-magic-lamp",
    displayTitleZh: "阿拉丁和神灯",
    sourceTitleEn: "Aladdin and the Wonderful Lamp",
    sourceUrl: "https://www.gutenberg.org/ebooks/20748",
    sourceCoverTarget: "https://www.gutenberg.org/cache/epub/20748/images/page_011.png",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 13,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-the-little-mermaid",
    displayTitleZh: "海的女儿",
    sourceTitleEn: "The Little Mermaid",
    sourceUrl: "https://www.gutenberg.org/ebooks/17860",
    sourceCoverTarget: "https://www.gutenberg.org/cache/epub/17860/images/plate3.jpg",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 14,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-the-wild-swans",
    displayTitleZh: "野天鹅",
    sourceTitleEn: "The Wild Swans",
    sourceUrl: "https://www.gutenberg.org/ebooks/17860",
    sourceCoverTarget: "https://www.gutenberg.org/cache/epub/17860/images/plate32.jpg",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 15,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-the-snow-queen",
    displayTitleZh: "雪女王",
    sourceTitleEn: "The Snow Queen",
    sourceUrl: "https://www.gutenberg.org/ebooks/17860",
    sourceCoverTarget: "https://www.gutenberg.org/cache/epub/17860/images/plate23.jpg",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 16,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-rapunzel",
    displayTitleZh: "莴苣姑娘",
    sourceTitleEn: "Rapunzel",
    sourceUrl: "https://www.gutenberg.org/ebooks/2591",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/2591",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 17,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-bremen-town-musicians",
    displayTitleZh: "不来梅的音乐家",
    sourceTitleEn: "The Bremen Town-Musicians",
    sourceUrl: "https://www.gutenberg.org/ebooks/2591",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/2591",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 18,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-the-three-little-pigs",
    displayTitleZh: "三只小猪",
    sourceTitleEn: "The Story of the Three Little Pigs",
    sourceUrl: "https://www.gutenberg.org/ebooks/7439",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/7439",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 19,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-the-golden-goose",
    displayTitleZh: "金鹅",
    sourceTitleEn: "The Golden Goose",
    sourceUrl: "https://www.gutenberg.org/ebooks/2591",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/2591",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 20,
    isPilotActive: true
  }),
  candidate({
    slug: "fairy-the-frog-prince",
    displayTitleZh: "青蛙王子",
    sourceTitleEn: "The Frog-Prince",
    sourceUrl: "https://www.gutenberg.org/ebooks/2591",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/2591",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 21,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-emperors-new-clothes",
    displayTitleZh: "皇帝的新装",
    sourceTitleEn: "The Emperor's New Clothes",
    sourceUrl: "https://www.gutenberg.org/ebooks/17860",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/17860",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 22,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-thumbelina",
    displayTitleZh: "拇指姑娘",
    sourceTitleEn: "Thumbelina",
    sourceUrl: "https://www.gutenberg.org/ebooks/17860",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/17860",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 23,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-six-swans",
    displayTitleZh: "六只天鹅",
    sourceTitleEn: "The Six Swans",
    sourceUrl: "https://www.gutenberg.org/ebooks/2591",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/2591",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 24,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-ali-baba-and-the-forty-thieves",
    displayTitleZh: "阿里巴巴和四十大盗",
    sourceTitleEn: "Ali Baba and the Forty Thieves",
    sourceUrl: "https://www.gutenberg.org/ebooks/57",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/57",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 25,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-valiant-little-tailor",
    displayTitleZh: "勇敢的小裁缝",
    sourceTitleEn: "The Valiant Little Tailor",
    sourceUrl: "https://www.gutenberg.org/ebooks/2591",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/2591",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 26,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-wolf-and-the-seven-kids",
    displayTitleZh: "狼和七只小山羊",
    sourceTitleEn: "The Wolf and the Seven Little Kids",
    sourceUrl: "https://www.gutenberg.org/ebooks/2591",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/2591",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 27,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-twelve-brothers",
    displayTitleZh: "十二兄弟",
    sourceTitleEn: "The Twelve Brothers",
    sourceUrl: "https://www.gutenberg.org/ebooks/2591",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/2591",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 28,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-fisherman-and-the-goldfish",
    displayTitleZh: "渔夫和金鱼",
    sourceTitleEn: "The Tale of the Fisherman and the Fish",
    sourceUrl: "https://www.gutenberg.org/ebooks/search/?query=fisherman+and+the+goldfish",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/search/?query=fisherman+and+the+goldfish",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 29,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-steadfast-tin-soldier",
    displayTitleZh: "坚定的锡兵",
    sourceTitleEn: "The Steadfast Tin Soldier",
    sourceUrl: "https://www.gutenberg.org/ebooks/17860",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/17860",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 30,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-gingerbread-man",
    displayTitleZh: "姜饼人",
    sourceTitleEn: "The Gingerbread Man",
    sourceUrl: "https://www.gutenberg.org/ebooks/search/?query=gingerbread+man",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/search/?query=gingerbread+man",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 31,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-twelve-months",
    displayTitleZh: "十二个月",
    sourceTitleEn: "The Twelve Months",
    sourceUrl: "https://www.gutenberg.org/ebooks/search/?query=twelve+months+fairy+tale",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/search/?query=twelve+months+fairy+tale",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 32,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-fox-and-the-cat",
    displayTitleZh: "狐狸和猫",
    sourceTitleEn: "The Fox and the Cat",
    sourceUrl: "https://www.gutenberg.org/ebooks/2591",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/2591",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 33,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-goose-girl",
    displayTitleZh: "鹅姑娘",
    sourceTitleEn: "The Goose-Girl",
    sourceUrl: "https://www.gutenberg.org/ebooks/2591",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/2591",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 34,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-rumpelstiltskin",
    displayTitleZh: "侏儒怪",
    sourceTitleEn: "Rumpelstiltskin",
    sourceUrl: "https://www.gutenberg.org/ebooks/2591",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/2591",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 35,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-twelve-dancing-princesses",
    displayTitleZh: "十二个跳舞的公主",
    sourceTitleEn: "The Twelve Dancing Princesses",
    sourceUrl: "https://www.gutenberg.org/ebooks/2591",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/2591",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 36,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-princess-and-the-pea",
    displayTitleZh: "豌豆公主",
    sourceTitleEn: "The Princess and the Pea",
    sourceUrl: "https://www.gutenberg.org/ebooks/17860",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/17860",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 37,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-tinder-box",
    displayTitleZh: "打火匣",
    sourceTitleEn: "The Tinder-Box",
    sourceUrl: "https://www.gutenberg.org/ebooks/17860",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/17860",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 38,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-nightingale",
    displayTitleZh: "夜莺",
    sourceTitleEn: "The Nightingale",
    sourceUrl: "https://www.gutenberg.org/ebooks/17860",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/17860",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 39,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-fir-tree",
    displayTitleZh: "枞树",
    sourceTitleEn: "The Fir Tree",
    sourceUrl: "https://www.gutenberg.org/ebooks/17860",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/17860",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 40,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-swineherd",
    displayTitleZh: "猪倌",
    sourceTitleEn: "The Swineherd",
    sourceUrl: "https://www.gutenberg.org/ebooks/17860",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/17860",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 41,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-jack-the-giant-killer",
    displayTitleZh: "杰克与巨人杀手",
    sourceTitleEn: "Jack the Giant-Killer",
    sourceUrl: "https://www.gutenberg.org/ebooks/search/?query=jack+the+giant+killer",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/search/?query=jack+the+giant+killer",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 42,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-east-of-the-sun-and-west-of-the-moon",
    displayTitleZh: "太阳东升月亮西落之地",
    sourceTitleEn: "East of the Sun and West of the Moon",
    sourceUrl: "https://www.gutenberg.org/ebooks/search/?query=east+of+the+sun+and+west+of+the+moon",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/search/?query=east+of+the+sun+and+west+of+the+moon",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 43,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-seven-ravens",
    displayTitleZh: "七只乌鸦",
    sourceTitleEn: "The Seven Ravens",
    sourceUrl: "https://www.gutenberg.org/ebooks/2591",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/2591",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 44,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-goose-girl-at-the-well",
    displayTitleZh: "井边的鹅姑娘",
    sourceTitleEn: "The Goose-Girl at the Well",
    sourceUrl: "https://www.gutenberg.org/ebooks/2591",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/2591",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 45,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-iron-hans",
    displayTitleZh: "铁汉斯",
    sourceTitleEn: "Iron Hans",
    sourceUrl: "https://www.gutenberg.org/ebooks/2591",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/2591",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 46,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-red-shoes",
    displayTitleZh: "红舞鞋",
    sourceTitleEn: "The Red Shoes",
    sourceUrl: "https://www.gutenberg.org/ebooks/17860",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/17860",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 47,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-dick-whittington-and-his-cat",
    displayTitleZh: "迪克和他的猫",
    sourceTitleEn: "Dick Whittington and His Cat",
    sourceUrl: "https://www.gutenberg.org/ebooks/search/?query=dick+whittington",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/search/?query=dick+whittington",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 48,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-real-princess",
    displayTitleZh: "真正的公主",
    sourceTitleEn: "The Real Princess",
    sourceUrl: "https://www.gutenberg.org/ebooks/17860",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/17860",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 49,
    isPilotActive: false
  }),
  candidate({
    slug: "fairy-the-elves-and-the-shoemaker",
    displayTitleZh: "小精灵和鞋匠",
    sourceTitleEn: "The Elves and the Shoemaker",
    sourceUrl: "https://www.gutenberg.org/ebooks/2591",
    sourceCoverTarget: "https://www.gutenberg.org/ebooks/2591",
    licenseNote: PROJECT_GUTENBERG_LICENSE,
    popularityRank: 50,
    isPilotActive: false
  })
];

const sourceBySlug = new Map(top50FairySourceCandidates.map((item) => [item.slug, item]));

const activePilotBooks = [
  createActiveBook(sourceBySlug.get("fairy-little-red-riding-hood")!, {
    summary: "去看望外婆的小女孩在森林里遇见了狼，一段天真的问答把危险亲手引到了门前。",
    originalSynopsis: "这是一则关于轻信、伪装与脱身的经典童话。小红帽原本只是替妈妈送糕点，却在路上把外婆家的位置告诉了狼。",
    storyParagraphs: [
      "小红帽戴着母亲亲手做的红兜帽，提着面包和点心去森林另一头看望生病的外婆。出门前，母亲叮嘱她不要离开大路，也不要和陌生人讲话。",
      "可她刚走进林子，就碰见了一只会说话的狼。狼装出温和的样子，问她要去哪里。小红帽把去外婆家的路、外婆独自住在树林边的小屋这些事，全都告诉了它。",
      "狼先一步跑到小屋，把外婆吞进肚里，又穿上外婆的衣服躺到床上。小红帽来到床边时，越看越觉得奇怪：耳朵太大、眼睛太亮、嘴巴也太可怕。可等她反应过来，狼已经扑了上去。",
      "后来，一个路过的猎人听见屋里动静不对，冲进来剖开狼肚子，救出了外婆和小红帽。她们把石头塞回狼肚里，等狼醒来想逃时却重重倒地。小红帽这才真正记住，温柔的声音不一定代表善意。 "
    ],
    keyScenes: [
      "小红帽在森林里把外婆家的路线告诉了狼。",
      "狼先到木屋，吞下外婆并假扮成病人躺在床上。",
      "“外婆，你的耳朵怎么这样大？”成了她察觉危险的临界点。",
      "猎人剖开狼肚，把外婆和小红帽从险境里救了出来。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-cinderella")!, {
    summary: "受尽冷待的灰姑娘在仙女教母的帮助下走进舞会，也走到了命运重新开始的门前。",
    originalSynopsis: "灰姑娘长期被继母和姐姐们驱使，却依旧保持温柔。魔法为她打开舞会之门，但真正改变她命运的，既有玻璃鞋，也有她始终没有放弃的自尊。",
    storyParagraphs: [
      "灰姑娘失去母亲后，继母带着两个女儿进了家门。她们让灰姑娘住在炉灰边、做最粗重的活，还把她参加舞会的愿望当成笑话。",
      "王宫宣布举行舞会，邀请全国适龄少女参加。姐姐们忙着打扮，灰姑娘却只能留在家里哭泣。这时，仙女教母出现了，她用南瓜变出马车，把老鼠和蜥蜴变成马和侍从，又把灰姑娘破旧的衣服变成华美礼裙。",
      "舞会上，王子被这位陌生少女深深吸引。可午夜钟声一响，灰姑娘想起魔法会失效，急忙奔下楼梯，慌乱中只落下一只玻璃鞋。回到家时，她又成了炉边满身灰尘的女孩。",
      "王子拿着玻璃鞋挨家寻找主人。继母和姐姐们都试穿失败，轮到灰姑娘时，鞋子正合适，另一只鞋也从她的围裙口袋里拿了出来。王子终于认出她，灰姑娘也从被忽视的角落里走到了属于自己的生活。"
    ],
    keyScenes: [
      "仙女教母把厨房里的旧物变成带她去舞会的马车与礼服。",
      "灰姑娘在午夜钟声响起前匆忙离场，遗落了一只玻璃鞋。",
      "王子挨家试鞋，所有人都以为灰姑娘没有资格靠近。",
      "玻璃鞋在灰姑娘脚上恰好合适，她的身份终于被看见。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-snow-white")!, {
    summary: "被嫉妒追赶的白雪公主逃进森林，在七个小矮人的屋里短暂避难，却仍被王后的执念步步逼近。",
    originalSynopsis: "白雪公主因为“谁是最美的人”这句问话被推向危险。她的故事既关乎美貌引发的嫉妒，也关乎在恶意里仍有人愿意守护她。",
    storyParagraphs: [
      "王后日日对着魔镜发问，最在意的就是自己是否仍是世上最美的人。直到有一天，镜子回答说白雪公主比她更美。王后的嫉妒从那一刻起就再也压不住了。",
      "她命令猎人把公主带到森林里杀掉。猎人不忍心下手，放走了白雪公主，让她独自逃进树林。公主在极度惊惶中走了很久，终于找到一间小小的屋子，屋里住着七个勤劳的小矮人。",
      "小矮人让她留下，可王后并没有停止追杀。她先后伪装成小贩、梳头妇人和老妇，把有毒的束带、毒梳和毒苹果带到门前。前两次公主被救回，第三次却因为咬下苹果而沉沉倒下。",
      "小矮人们把她安放在玻璃棺里。一位路过的王子见到她，不肯让棺木被埋进土中。抬棺的人脚下一绊，那块卡在她喉咙里的苹果碎块被震了出来，白雪公主终于醒来。王后的嫉妒没有赢到最后，公主重新回到了阳光里。"
    ],
    keyScenes: [
      "魔镜第一次说出白雪公主比王后更美。",
      "猎人在森林里放走白雪公主，让她独自奔向未知。",
      "王后第三次伪装上门，递出了那枚毒苹果。",
      "玻璃棺被抬动时，卡住喉咙的苹果碎块掉落，白雪公主醒来。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-sleeping-beauty")!, {
    summary: "公主在诅咒与祝福交织的命运里沉睡百年，整个王国也跟着一同静止。",
    originalSynopsis: "在公主出生的庆典上，少请了一位仙女，灾祸便被带到了摇篮边。睡美人的故事说的是等待，但更说的是时间如何把一个王国封进梦里。",
    storyParagraphs: [
      "国王和王后终于迎来久盼的女儿，便设宴邀请仙女为她赐福。可因为金盘不够，他们只请了七位仙女，忘了第八位脾气古怪的老妇。被冷落的她闯进宴会，当众降下诅咒：公主长大后会被纺锤刺中手指而死。",
      "最后一位还未来得及祝福的仙女赶紧把诅咒减轻成沉睡百年。国王惊惶地下令烧毁全国所有纺车，可命运仍在悄悄等那一天。公主十五岁时，在塔楼深处遇见一位正在纺线的老太婆，出于好奇伸手一碰，立刻倒下。",
      "随着公主闭上眼睛，王宫里的人、马厩里的马、厨房里的火，甚至花园里的风都一起睡去。宫墙外的荆棘越长越密，把整个王国围成一座无人可入的梦境。",
      "百年之后，荆棘在恰当的日子自动让开。一位王子穿过沉睡的宫殿，来到公主身边。就在他靠近的那一刻，沉睡结束了。公主醒来，宫里的人也同时醒来，像一场被时间按住太久的呼吸终于重新流动。"
    ],
    keyScenes: [
      "被遗忘的仙女在宴会上向摇篮里的公主降下诅咒。",
      "公主在塔楼里摸到纺锤，沉睡瞬间降临整个王国。",
      "百年间，荆棘长成一道把王宫与世界隔开的围墙。",
      "王子穿过荆棘来到公主身边时，整座宫殿同时醒来。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-hansel-and-gretel")!, {
    summary: "一对兄妹被逼进森林后闯进糖果屋，真正的危险却来自那位看似慈祥的老太太。",
    originalSynopsis: "饥荒与贫穷把汉塞尔和格蕾特推离家门。兄妹俩一路用机智和彼此照应，才从被诱捕的处境里重新找到归途。",
    storyParagraphs: [
      "木匠家里太穷，继母劝父亲把两个孩子丢到森林里去。第一次出门前，汉塞尔偷偷捡了许多白石子，一路撒在地上，夜里月光照亮石子，兄妹平安回到家。",
      "第二次，继母看得更紧，汉塞尔只能撒面包屑。可鸟儿把面包屑全啄光了，他们彻底迷失在森林深处。又饿又怕的时候，兄妹看见一间用糖饼、果仁和糖霜搭成的小屋，忍不住上前去啃。",
      "屋里住着一个看上去和蔼的老太太。她把兄妹骗进门后，立刻露出真面目：把汉塞尔关进笼里养肥，逼格蕾特生火做饭，打算把他们都吃掉。汉塞尔每次伸出手指给她摸时，都故意伸一根小骨头，好让她以为他还没长胖。",
      "终于，老太太逼格蕾特去看炉火是否够旺时，格蕾特装作不会，等老太太弯腰示范时，一把把她推进火炉。兄妹拿走屋里的珠宝，沿着水路和森林回到家，父亲也已经摆脱了继母。从此，他们靠着带回来的宝石和重新团聚的家过上了安稳日子。"
    ],
    keyScenes: [
      "汉塞尔第一次用白石子为兄妹留下回家的路。",
      "面包屑被鸟吃光后，兄妹真正迷失在森林深处。",
      "老太太把汉塞尔关进笼里，准备把他养肥后吃掉。",
      "格蕾特把女巫推进火炉，带着哥哥一起逃回家。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-puss-in-boots")!, {
    summary: "一只穿上靴子的猫，用计谋和胆量把穷磨坊小儿子一步步送进了王子的生活。",
    originalSynopsis: "穿靴子的猫不是靠魔法，而是靠观察人心和临机应变改写命运。它看清谁爱面子、谁贪功，也知道该在何时替主人把握机会。",
    storyParagraphs: [
      "老磨坊主死后，三个儿子分家。大儿子得了磨坊，二儿子得了驴，最小的儿子只得到一只猫。他原本以为自己注定要挨饿，没想到这只猫竟开口说话，还请求主人给它一双靴子和一个口袋。",
      "猫穿上靴子后，先用口袋和诱饵捉来兔子、鹧鸪，再把猎物送给国王，谎称都是“卡拉巴斯侯爵”献上的礼物。这个根本不存在的头衔，很快就在王宫里变得像真的一样。",
      "等国王带着公主出游时，猫又让主人到河里洗澡，趁马车经过时大喊“卡拉巴斯侯爵落水了”。国王立刻叫人救起他，还拿自己的华服给他换上。接着，猫一路逼迫田地上的农人都说土地属于侯爵，让国王以为眼前尽是这位年轻人的产业。",
      "最后，猫闯进巨人的城堡，用机智骗得巨人把自己变成老鼠，再一口把它吞掉。于是城堡也归了主人。国王见这位“侯爵”年轻体面、产业丰厚，便把公主嫁给了他。最小的儿子原本什么都没有，却因为一只猫看准了时机，真正得到新的生活。"
    ],
    keyScenes: [
      "猫先向主人要来靴子和口袋，决定亲手去替主人闯一条路。",
      "它不断把猎物送进王宫，让“卡拉巴斯侯爵”这个名字变得可信。",
      "猫在河边制造“侯爵落水”的场面，让国王亲自替主人改头换面。",
      "巨人变成老鼠时，猫一口把它吃掉，城堡也落到了主人手里。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-beauty-and-the-beast")!, {
    summary: "为了替父亲还债，少女住进了野兽的城堡，也在相处中慢慢看清了可怕外表下面的孤独和真心。",
    originalSynopsis: "美女与野兽的故事并不靠一见钟情推动，而是靠漫长的陪伴和重新理解。真正打破诅咒的，不是华丽外表，而是她愿意认真看见另一个人的内心。",
    storyParagraphs: [
      "商人破产后带着孩子们住进乡下。一次出门时，他在暴风雪里迷路，误入一座灯火通明却空无一人的城堡。他在花园里折下一枝玫瑰，想带给最小的女儿贝儿，不料这座城堡的主人野兽立刻现身，要求他用性命偿还。",
      "商人回家后把经过告诉家人。贝儿不愿让父亲独自赴死，主动去城堡代替父亲留下。野兽虽然长相可怕，却从不伤害她，只是每天晚餐时都会笨拙地问一句：“贝儿，你愿意嫁给我吗？”而贝儿总是温柔地拒绝。",
      "在城堡里，贝儿拥有舒适的房间，也能看见远方家里的情况。后来她得知父亲病重，野兽答应让她回去探望，但要她按时回来。家人见她回来，劝她多留几天。等贝儿终于想起约定，匆忙赶回城堡时，发现野兽已经因为绝望倒在花园里奄奄一息。",
      "贝儿这才意识到，自己真正舍不得的是它。她扑到野兽身边，说自己愿意陪它一生。话音刚落，野兽身上的诅咒解开，变回了王子。原来只有被真心爱上，他才能重新成为人。贝儿也终于明白，真正决定一个人模样的，从来不是外表。"
    ],
    keyScenes: [
      "商人因折下玫瑰触怒了野兽，必须拿性命抵偿。",
      "贝儿主动代替父亲走进城堡，决定和野兽同住。",
      "野兽每日重复求婚，却始终没有勉强贝儿。",
      "贝儿在花园里向奄奄一息的野兽告白，诅咒当场解除。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-bluebeard")!, {
    summary: "新婚妻子被要求绝不能打开一间小房间，可真正可怕的不是那把钥匙，而是丈夫隐藏的真相。",
    originalSynopsis: "蓝胡子是一则关于禁令与好奇心的故事，也是一则关于暴力婚姻真相被揭开的故事。门后藏着的不只是秘密，更是妻子看清危险的那一刻。",
    storyParagraphs: [
      "蓝胡子拥有许多庄园和财富，却因为那把奇怪得令人发毛的蓝胡子，让所有年轻女孩都害怕他。后来，他终于娶到了一位年轻妻子，并很快把她带到自己的城堡生活。",
      "不久后，蓝胡子要出远门，临行前把一大串钥匙交给妻子，说所有房间都可以进去，唯独最底层那间小门绝不能打开。禁令像一根细刺一样扎进她心里，让她越想越难平静。",
      "等丈夫离开，妻子还是没忍住，打开了那扇门。房间里挂着的，是蓝胡子前几任妻子的尸体。她吓得手一抖，把钥匙掉进血里。无论怎么擦洗，钥匙上的血迹都无法消失。蓝胡子回来后一看便知她违背了命令，立刻宣布要杀了她。",
      "妻子请求多一点时间祈祷，暗中让姐姐到塔上张望，盼望兄弟们赶到。就在蓝胡子举刀逼近时，兄弟们终于冲进城堡，把他杀死。妻子继承了财产，也继承了一次死里逃生后看清真相的勇气。"
    ],
    keyScenes: [
      "蓝胡子把整串钥匙交给新婚妻子，却单独禁止她打开那间小门。",
      "妻子推开门后，发现前几任妻子的尸体都挂在屋里。",
      "染血的钥匙怎么擦都擦不干净，成了她违背禁令的证据。",
      "兄弟们在最后一刻赶到，阻止了蓝胡子的杀人计划。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-jack-and-the-beanstalk")!, {
    summary: "贫穷少年用一把看似荒唐的豆子换来机会，也因此闯进了巨人的天空王国。",
    originalSynopsis: "杰克和魔豆的故事从一场被母亲痛骂的“赔本买卖”开始，却一路把贫穷、冒险与侥幸混在一起。藤蔓长上天空后，杰克真正面对的，是胆量与贪念的边界。",
    storyParagraphs: [
      "杰克和母亲相依为命，家里穷得只剩一头奶牛。母亲让他把奶牛牵去卖掉，好换些粮食回来。谁知路上他遇见一个陌生人，用几颗“神奇豆子”把奶牛换走了。",
      "母亲气得把豆子丢出窗外。第二天清晨，一根粗得惊人的藤蔓已经从地上直长到云里。杰克顺着藤蔓爬上去，来到巨人的城堡，见到一个常常外出吃人的巨人和一个偶尔会同情他的女仆。",
      "第一次，他偷走一袋金子；第二次，他拿走会下金蛋的母鸡；第三次，他想把会自己演奏的金琴也带走。金琴发出叫声惊动了巨人，巨人大吼着追了出来，踩着藤蔓往下爬。",
      "杰克一落地就挥斧砍断藤蔓，巨人从高处摔死，抢来的财富也留在了人间。这个故事一直让人争论杰克究竟是英雄还是小偷，但对他来说，爬上藤蔓那一刻起，贫穷就已经不再只是挨饿那么简单，而成了他必须正面闯过去的门槛。"
    ],
    keyScenes: [
      "杰克用奶牛换回了几颗被母亲认为毫无价值的豆子。",
      "豆子一夜之间长成通天藤蔓，带他爬上云端。",
      "杰克三次潜入巨人城堡，偷走金袋、金蛋母鸡和会唱歌的金琴。",
      "巨人沿藤蔓追下时，杰克挥斧砍断藤蔓，让巨人摔落身亡。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-goldilocks-and-the-three-bears")!, {
    summary: "误闯熊屋的金发姑娘在“刚刚好”的选择里显得任性，也终于在惊醒的一刻看见自己闯进了谁的生活。",
    originalSynopsis: "金发姑娘的故事没有宏大的冒险，却把边界和分寸感讲得很直接。她挑选最适合自己的那一刻，其实也在一步步越过别人家的界线。",
    storyParagraphs: [
      "森林里住着熊爸爸、熊妈妈和小熊。一早，他们把粥盛好晾着，便一起出门散步。就在这段空档里，一个叫金发姑娘的小女孩闯进了他们没锁门的小屋。",
      "她先尝了三碗粥，觉得第一碗太烫，第二碗太凉，第三碗才刚刚好，于是把小熊那碗全吃了。接着她又去试三把椅子，坐坏了小熊那把最合身的小椅子。",
      "后来她上楼试三张床。熊爸爸的太硬，熊妈妈的太软，小熊的床最舒服，她便躺上去睡着了。就在她睡得正香时，三只熊回到了家，一眼就看见有人动过他们的东西。",
      "他们顺着痕迹走上楼，站到床边时，小熊喊出“有人睡在我的床上，而且她还在这里！”金发姑娘猛地惊醒，从窗口跳出去逃走了。故事没有惩罚她太多，却让所有读到这里的人都明白：舒服并不等于属于自己。"
    ],
    keyScenes: [
      "金发姑娘闯进熊屋后，先从三碗粥里挑了小熊那碗吃光。",
      "她坐坏了小熊的椅子，又继续往楼上走。",
      "试过三张床后，她睡在最适合自己的那张小床上。",
      "三只熊围到床边时，她才惊觉自己一直待在别人的家里。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-the-ugly-duckling")!, {
    summary: "被当作异类的小鸭在漫长漂泊中一次次受伤，最后才发现自己本就不是鸭群里的一只。",
    originalSynopsis: "丑小鸭的故事从一场错位的出生开始。真正让它成长的并不是赞美，而是一路承受的排斥、寒冷和孤独，以及最后重新认出自己的那一刻。",
    storyParagraphs: [
      "一只母鸭在芦苇边孵蛋，最后孵出来的一只小家伙又大又灰，跟其他小鸭完全不一样。院子里的动物都说它太丑，小鸭走到哪儿都被推搡、取笑，连家里的兄弟姐妹也不愿与它作伴。",
      "它受不了这样的生活，只好离开。一路上，它去过野鸭群、老妇人的屋子、冰冷的沼泽和雪地，每到一个地方都想找个能留下来的角落，却总因为模样古怪而被赶走。冬天最难熬的时候，它甚至差点在冰面上冻死。",
      "等春天来临，它看见湖上有几只优雅的白天鹅。它知道自己一向羡慕这种生灵，可此时已不再奢望靠近，只想在临死前看看它们。没想到当它俯身看向水面时，映出的不再是灰扑扑的丑小鸭，而是一只年轻的天鹅。",
      "孩子们欢呼“新来的这只最美”，天鹅们也接纳了它。它回想起过去那段被排斥的日子，终于明白自己一直不是坏、不够努力，而只是生在错误的位置上。真正的蜕变不是把自己修成别人喜欢的样子，而是终于长成了自己原本就是的模样。"
    ],
    keyScenes: [
      "灰扑扑的小鸭一出生就因为模样不同而遭到排斥。",
      "它离开鸭群，在冬天的冰面和陌生屋舍间艰难漂泊。",
      "春天到来时，它看见湖上的天鹅，只敢远远仰望。",
      "它在水面上第一次认出自己其实已经长成一只天鹅。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-the-little-match-girl")!, {
    summary: "在一年里最冷的夜晚，小女孩靠一根根火柴撑出短暂暖光，也在火光里看见最想靠近的温暖。",
    originalSynopsis: "卖火柴的小女孩是一则寒冷得几乎不敢细读的童话。她在现实里得不到的热量、食物与爱，只能在燃亮的火柴里短暂出现。",
    storyParagraphs: [
      "除夕夜，街上灯火通明，家家都在准备晚餐，一个小女孩却赤着脚在雪地里卖火柴。她不敢回家，因为一根火柴也没卖掉，父亲一定会打她。寒风把她冻得发抖，她只好蜷在墙角，希望有人能看见她。",
      "她忍不住擦亮第一根火柴，火光像一只小暖炉，让她仿佛坐到了炉边。火柴灭了，温暖也随之消失。她又擦亮第二根，看见丰盛的烤鹅在桌上冒着香气；第三根火柴里，是一棵挂满蜡烛和礼物的圣诞树。",
      "当她擦亮更多火柴时，最想念的外婆出现在光里。外婆是唯一真正疼爱她的人，已经去世很久了。女孩害怕火光熄灭后外婆也会像暖炉、烤鹅和圣诞树一样消失，于是把整把火柴都擦亮了。",
      "第二天清晨，人们在角落里发现她静静地坐着，脸上带着微笑，身边是一堆烧尽的火柴。他们只看见她被冻死，却不知道她在最后一夜，看见了最完整的光明和最想去的地方。"
    ],
    keyScenes: [
      "小女孩在除夕夜赤着脚卖火柴，却一根也没卖出去。",
      "每擦亮一根火柴，她都暂时看见暖炉、烤鹅和圣诞树。",
      "外婆在火光里出现后，她把整把火柴全部点燃。",
      "清晨人们发现她时，她已经带着微笑死在雪地里。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-aladdin-and-the-magic-lamp")!, {
    summary: "贫寒少年偶然得到神灯，人生从地下洞穴开始转向，但灯里的力量也不断放大欲望与谎言。",
    originalSynopsis: "阿拉丁原本只是个游手好闲的少年。神灯让他拥有一切，却也让他不断面对失去、争夺和被人利用的风险。",
    storyParagraphs: [
      "阿拉丁原本是个贪玩又懒散的穷小子。一天，一位自称他叔叔的陌生魔法师找上门，说能带他去见识一笔大财富。魔法师把他带到荒野，用法术打开地面裂缝，让他钻进地底宫殿去取一盏旧灯。",
      "阿拉丁在地下见到满园珠宝和黄金，却被魔法师反复叮嘱，只能先把灯递上来。阿拉丁感觉对方太急，要求先被拉出去。魔法师立刻翻脸，把他困在地底。阿拉丁绝望地摩擦手上的戒指，意外召来戒灵，这才逃出生天。",
      "回家后，母亲擦拭那盏脏兮兮的旧灯，灯神出现了。阿拉丁靠神灯得到华服、宫殿和财富，还娶到了公主。可那位魔法师并没有死心，他骗走神灯，把阿拉丁的宫殿连同公主一起搬到了遥远的国度。",
      "阿拉丁依靠戒指的帮助追到异国，与公主合力设法毒死魔法师，夺回神灯。后来魔法师的兄弟又来寻仇，也同样失败。阿拉丁终于明白，神灯最危险的地方不只是它能满足愿望，而是它会让每个靠近的人都暴露自己真正想要的东西。"
    ],
    keyScenes: [
      "魔法师把阿拉丁骗进地下宫殿，要他取回那盏旧灯。",
      "阿拉丁在绝境中无意摩擦戒指，第一次召出帮助自己的精灵。",
      "神灯让阿拉丁拥有宫殿、公主和突然到来的富贵生活。",
      "宫殿被魔法师搬走后，阿拉丁和公主合作夺回了神灯。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-the-little-mermaid")!, {
    summary: "人鱼公主为靠近陆地上的王子放弃歌喉与鱼尾，却终究无法把爱与代价同时握在手里。",
    originalSynopsis: "海的女儿讲的是愿望、失语和牺牲。小人鱼想要的不只是爱情，还有人类短暂生命背后那种可能通往永恒灵魂的道路。",
    storyParagraphs: [
      "海底王宫里最小的人鱼公主从小就向往海面上的世界。等到十五岁那年，她终于被允许浮上海面，看见夜色、星星和一艘正在庆典中的大船，也第一次见到了自己深深爱上的王子。",
      "可暴风雨很快掀翻了船，人鱼公主救下昏迷的王子，把他送到岸边寺院附近，自己却只能躲在海里看着别人把他带走。王子并不知道是谁救了自己。为了能走到他身边，人鱼公主去找海巫婆，用美妙歌喉换来了把鱼尾变成人腿的药水。",
      "海巫婆告诉她：每走一步都会像踩在刀尖上，而且若王子娶了别人，她将在婚礼后的清晨化成海上的泡沫。人鱼公主仍然喝下药水，来到了王子身边。王子喜欢她的陪伴，却始终把她当作最亲近的朋友，而非想娶的人。",
      "最终，王子与邻国公主成婚。人鱼公主的姐姐们用长发向海巫婆换来一把刀，说只要她在天亮前刺死王子，把血滴到自己脚上，就能重新变回人鱼。她却做不到，只在晨光里把刀扔进海中，自己化成泡沫。可是，她并没有彻底消失，而是被写成升向空中的“空气的女儿”，开始用善行换取自己的灵魂。"
    ],
    keyScenes: [
      "小人鱼在暴风雨后的海面上救起了落水王子。",
      "她用歌喉向海巫婆换来双腿，也换来每一步都刺痛的代价。",
      "王子把她当作最亲近的人，却娶了另一位公主。",
      "她没有杀死王子，选择在天亮时化成海上的泡沫。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-the-wild-swans")!, {
    summary: "公主为了救回被诅咒成天鹅的十一位兄长，在沉默与误解中独自完成几乎不可能的任务。",
    originalSynopsis: "野天鹅是一则关于手足之情和忍耐的故事。妹妹的力量不来自武器，而来自在漫长苦难里也不解释、不放弃的决心。",
    storyParagraphs: [
      "国王有十一位王子和一位小公主艾丽莎。后来国王续娶恶毒继后，继后先把艾丽莎送到乡下，又用法术把十一位王子变成野天鹅，只允许他们白天做人、夜晚仍要化作天鹅远飞。",
      "艾丽莎长大后得知真相，独自踏上寻找兄长的路。她在海边终于认出了夜里回到人形的哥哥们。兄长告诉她，要想解除诅咒，她必须采来墓地里的荨麻，亲手织成十一件披甲般的衬衣，并且在全部织完前一句话都不能说。",
      "艾丽莎忍着荨麻刺痛，在荒野和山洞里日夜编织。后来，一位国王发现了她，把她带回王宫并娶她为妻。可她仍不能开口解释自己的行为，半夜去墓地采荨麻的样子也引来了主教和百姓的猜疑，大家都说王后是女巫。",
      "最终，她在被押往火刑架的路上仍不停编织。就在十一只天鹅飞来那一刻，她把十件半衬衣抛向兄长们，他们立刻恢复人形，只有最小的弟弟因缺了一只袖子而留下一只天鹅翅膀。直到任务完成，艾丽莎才终于能开口，把全部真相说出来。火刑架同时化作一树芬芳的花，曾经的误解也当场崩解。"
    ],
    keyScenes: [
      "继后用魔法把十一位王子变成了白天飞行的野天鹅。",
      "艾丽莎得知必须用荨麻织衬衣，并且在完成前不能说话。",
      "她在王宫里因沉默和夜间行动被误认为女巫，被押上火刑架。",
      "衬衣抛向天鹅兄长的瞬间，诅咒解除，艾丽莎也终于能开口解释。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-the-snow-queen")!, {
    summary: "被魔镜碎片伤到心和眼睛的加伊被雪女王带走，格尔达只靠爱与勇气一路追进冰雪深处。",
    originalSynopsis: "雪女王不是简单的恶龙式反派，她更像冰冷理性和麻木情感的化身。真正把加伊从她那里带回来的，不是武力，而是格尔达一路不肯忘记的爱。",
    storyParagraphs: [
      "恶魔打造过一面镜子，能把世上一切善与美都扭曲成丑陋和可笑。镜子摔碎后，无数碎片落入人间，有的进了人的眼睛，让人只看见世界最坏的一面；有的刺进心里，让心一点点冷硬。",
      "小男孩加伊被碎片伤到后，开始嘲笑一切，也对最亲近的格尔达变得冷淡。冬天里，雪女王乘着白色马车出现，把加伊带去北方冰宫。格尔达不肯接受他就这样消失，独自踏上漫长的寻找之路。",
      "她一路经过河流、花园、乌鸦、王子公主、强盗少女和拉普兰老妇，每个地方都让她停留，却没有人能真正替她走完最后那段雪原。直到最后，她在雪女王空旷寒冷的宫殿里找到正在拼凑“永恒”字样的加伊。",
      "格尔达扑到他身上痛哭，热泪融化了加伊眼里的碎片，也让他胸口里那块冰慢慢化开。两个人终于一起离开冰宫，带着一路经历重新回到家。等他们站回玫瑰旁边，才发现自己已经从孩子长成了懂得坚持的大人。"
    ],
    keyScenes: [
      "恶镜碎片刺进加伊的眼睛和心里，让他突然变得冷酷尖刻。",
      "雪女王把加伊带走后，格尔达独自踏上追寻他的旅程。",
      "格尔达一路跨过多个陌生国度，却始终没有放弃往北走。",
      "她在冰宫里的眼泪融化了碎片，也把加伊从雪女王手里带回。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-rapunzel")!, {
    summary: "因为一把莴苣引来的承诺，女孩被锁进高塔，后来却用自己的长发垂出一条离开囚笼的路。",
    originalSynopsis: "莴苣姑娘的故事从父母的软弱开始，却由女儿承担后果。高塔象征囚禁，也象征她与世界之间唯一的联系。",
    storyParagraphs: [
      "一对夫妻住在女巫花园旁边。怀孕的妻子非常想吃花园里的莴苣，丈夫几次偷摘，最终被女巫抓住。女巫提出条件：可以把莴苣带走，但孩子出生后必须交给她。夫妻只好答应。",
      "女孩出生后被取名为莴苣姑娘，由女巫带走。等她长大，女巫把她关进一座没有门、只有高窗的高塔。每次想上去，女巫就站在塔下喊：“莴苣姑娘，把你的头发垂下来。”姑娘长长的金发便成了唯一的通路。",
      "后来，一位王子路过林间，听见她在塔里歌唱，被声音吸引。他暗中观察女巫如何上塔，之后也来到塔下呼唤。两人相爱，约好让姑娘悄悄准备一架丝线编成的梯子，一起逃走。",
      "可计划被女巫发现了。她剪掉姑娘的头发，把她放逐到荒野，又用剪下的长发引诱王子上塔。王子看见的不是恋人，而是女巫狞笑的脸，一时失足跌下高塔，双眼被刺瞎。多年后，他在荒野里听见莴苣姑娘的歌声，终于与她重逢。姑娘的眼泪落在他眼上，让他重新看见光明，他们也一起离开了那段被囚禁的日子。"
    ],
    keyScenes: [
      "女巫用一园莴苣换走了夫妻尚未出生的女儿。",
      "莴苣姑娘被锁进无门高塔，只能放下长发让人攀爬。",
      "王子偷学女巫的呼唤方式，借歌声与姑娘相认并相爱。",
      "重逢时，姑娘的眼泪让失明已久的王子重新看见世界。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-bremen-town-musicians")!, {
    summary: "四只被主人抛弃的老动物没有真的到达不来梅，却在半路上一起找到了新的生活。",
    originalSynopsis: "不来梅的音乐家并不是关于成功成名，而是关于几个被判定“没用了”的生命，如何在一起后重新变得有力量。",
    storyParagraphs: [
      "一头老驴因为年纪大、驮不动重物，被主人嫌弃。它决定离开农庄，去不来梅当音乐家。路上，它先后遇见同样因为衰老而要被处理掉的老狗、老猫和公鸡，便邀请它们一起同行。",
      "四只动物凑成一个古怪的队伍，天黑时在森林里看见一座亮着灯的小屋。透过窗子，它们发现屋里坐着一群强盗，桌上摆满食物。老驴灵机一动，让大家叠起身子：驴在下、狗在上、猫踩到更高处，公鸡立在最顶端。",
      "等一切准备好后，它们一起发出惊人的叫声。强盗们以为是什么怪物闯来，丢下食物连夜逃跑。四只动物高兴地进屋吃饭休息，决定在这里过夜。",
      "后来，强盗派人回来查看。黑夜里，那人被猫抓脸、被狗咬腿、被驴踢飞，还听见公鸡在屋顶放声大叫，更认定屋里住着可怕的妖怪。强盗再也不敢回来。于是，这四个本来要被抛弃的老家伙，虽然没有真正走到不来梅，却在半路上找到了一座愿意接纳它们的家。"
    ],
    keyScenes: [
      "老驴离家时决定去不来梅当音乐家，并一路召集伙伴。",
      "老狗、老猫和公鸡都因为年老失去价值，却选择一起上路。",
      "四只动物叠成一座会叫会抓会踢的“怪物”，把强盗吓得四散而逃。",
      "强盗再来试探时再次被重创，四只动物终于安定住进小屋。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-the-three-little-pigs")!, {
    summary: "三只小猪各自盖房子，等到狼真的来敲门时，谁的准备足够扎实便一眼分明。",
    originalSynopsis: "三只小猪的故事看起来简单，却把“图快”和“肯下功夫”的差别讲得非常直接。狼的出现让每一间房子都不只是住处，也成了做选择的后果。",
    storyParagraphs: [
      "三只小猪长大后离开家，决定各自盖房子。第一只图省事，用稻草搭了一间；第二只也想快点完工，用木头盖了房；第三只最慢，却愿意一块砖一块砖地把房子垒结实。",
      "大灰狼很快闻到它们的味道，先来到草房前，吹一口气就把房子吹散，第一只小猪连忙逃到木房里。狼再吹，木房也轰然倒下，两只小猪又一起逃进砖房。",
      "狼在砖房前使尽办法，吹不倒、撞不塌，便改用诡计，约小猪们去萝卜地、苹果园和集市，想趁路上抓住它们。可最小的那只小猪每次都提前出门，靠机灵躲过了狼。",
      "最后，狼气急败坏，爬上屋顶想从烟囱钻进去。小猪早已在炉火上架好一锅沸水。狼掉进锅里，再也不能伤害它们。砖房不只是最牢的一间屋子，也成了那只最肯花力气的小猪替大家守住的安全边界。"
    ],
    keyScenes: [
      "三只小猪分别用稻草、木头和砖头盖出了三种完全不同的房子。",
      "大灰狼接连吹倒草房和木房，两只小猪只能逃向砖房。",
      "最小的猪在去萝卜地和苹果园的路上多次抢先一步，躲开狼的埋伏。",
      "狼从烟囱钻入时掉进沸水，砖房最终挡住了危险。"
    ]
  }),
  createActiveBook(sourceBySlug.get("fairy-the-golden-goose")!, {
    summary: "最不起眼的小儿子因为善意得到一只金鹅，也让一路上贪心的人一个接一个黏在了一起。",
    originalSynopsis: "金鹅的故事讲的是好运如何落到并不精明的人身上。关键并非主人公有多聪明，而是他在别人吝啬时仍愿意分出一口食物和一口酒。",
    storyParagraphs: [
      "一家木匠有三个儿子，前两个精明体面，小儿子却总被叫作“傻小子”。前两个去森林砍柴时，都不肯把随身的食物分给一个陌生小老头，结果一个弄伤手，一个砍伤脚。轮到傻小子去时，他大方地把自己粗糙的面包和啤酒分了出去。",
      "老头感谢他，告诉他去砍那棵老树。树根下藏着一只浑身金灿灿的鹅，傻小子便把它抱走，在旅店过夜。旅店老板的三个女儿见金羽毛耀眼，都偷偷想拔下一根，结果一碰就被牢牢黏住，再也甩不开。",
      "第二天，傻小子抱着金鹅继续往前走，三个姑娘连成一串跟在后面。路上神父想拦她们，被黏住；执事来拉神父，也被黏住；后来连农夫和更多路人都一连串粘了上去。傻小子走到哪儿，后面就拖着一长串奇怪队伍。",
      "国王有个从来不笑的公主，说谁能让她笑就能娶她。公主看见这支荒唐队伍，终于笑出了声。傻小子后来又完成国王附加的任务，娶到了公主。那只金鹅带来的不只是财富，更像是一种奖励：谁愿意在没有回报时先伸手，命运往往会在后面悄悄给他留一份意外的好事。"
    ],
    keyScenes: [
      "傻小子在森林里把自己的食物分给了陌生小老头。",
      "树根下那只金鹅被抱走后，旅店老板的女儿们全都被金羽毛黏住。",
      "神父、执事和路人接连伸手相救，结果全被黏成一长串。",
      "公主看见这支队伍第一次笑出声，傻小子因此赢得婚姻与好运。"
    ]
  })
] satisfies ImportedFairyBook[];

export const activeImportedFairyPilotBooks = activePilotBooks;
export const activeImportedFairyPilotSlugs = new Set(activePilotBooks.map((book) => book.slug));
export const activeImportedFairyPilotBySlug = new Map(activePilotBooks.map((book) => [book.slug, book]));

export function sortActiveImportedFairyShelfBooks<T extends { slug: string; title: string; popularityRank: number | null }>(books: T[]) {
  return books
    .filter((book) => activeImportedFairyPilotSlugs.has(book.slug))
    .sort((a, b) => {
      const rankDiff = (a.popularityRank ?? Number.MAX_SAFE_INTEGER) - (b.popularityRank ?? Number.MAX_SAFE_INTEGER);

      if (rankDiff !== 0) {
        return rankDiff;
      }

      return a.title.localeCompare(b.title, "zh-CN");
    });
}

export function getImportedFairyPilotBook(slug: string) {
  return activeImportedFairyPilotBySlug.get(slug) ?? null;
}

export function isImportedFairyPilotSlug(slug: string) {
  return activeImportedFairyPilotSlugs.has(slug);
}
