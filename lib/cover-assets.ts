import { hashString, inferCoverMotif, type CoverCategoryKey, type CoverMotifKey } from "@/lib/cover-motifs";
import { resolveGeneratedCoverPublicPathSync } from "@/lib/generated-cover-files";

type CoverTint = {
  overlay: string;
  glow: string;
  shadow: string;
  panel: string;
};

export type ResolvedCoverAsset = {
  src: string;
  fallbackSrc: string;
  isExternal: boolean;
  sourcePage: string | null;
  licenseNote: string | null;
  objectPosition: string;
  tint: CoverTint;
};

type CoverOverride = Omit<ResolvedCoverAsset, "fallbackSrc" | "isExternal">;

type CoverResolverInput = {
  slug: string;
  coverImage: string | null;
  title?: string;
  categoryKey?: CoverCategoryKey;
  originalSynopsis?: string | null;
  summary?: string | null;
};

const defaultTint: CoverTint = {
  overlay: "linear-gradient(180deg, rgba(252, 244, 230, 0.10), rgba(78, 55, 37, 0.18))",
  glow: "radial-gradient(circle at top, rgba(255, 245, 225, 0.28), transparent 50%)",
  shadow: "linear-gradient(180deg, rgba(106, 73, 46, 0.02), rgba(55, 37, 25, 0.28))",
  panel: "rgba(255, 249, 241, 0.78)"
};

const fairyTint: CoverTint = {
  overlay: "linear-gradient(180deg, rgba(255, 242, 227, 0.08), rgba(114, 69, 42, 0.26))",
  glow: "radial-gradient(circle at 20% 18%, rgba(255, 236, 198, 0.34), transparent 42%)",
  shadow: "linear-gradient(180deg, rgba(115, 73, 44, 0.02), rgba(67, 43, 30, 0.38))",
  panel: "rgba(255, 248, 239, 0.82)"
};

const fableTint: CoverTint = {
  overlay: "linear-gradient(180deg, rgba(246, 241, 222, 0.08), rgba(70, 65, 43, 0.28))",
  glow: "radial-gradient(circle at 24% 18%, rgba(235, 230, 192, 0.28), transparent 44%)",
  shadow: "linear-gradient(180deg, rgba(70, 59, 36, 0.03), rgba(43, 38, 24, 0.4))",
  panel: "rgba(250, 247, 235, 0.8)"
};

const mythologyTint: CoverTint = {
  overlay: "linear-gradient(180deg, rgba(240, 232, 218, 0.06), rgba(51, 42, 35, 0.34))",
  glow: "radial-gradient(circle at 24% 16%, rgba(231, 219, 194, 0.24), transparent 44%)",
  shadow: "linear-gradient(180deg, rgba(61, 48, 38, 0.02), rgba(32, 24, 18, 0.46))",
  panel: "rgba(248, 243, 235, 0.8)"
};

function createCommonsRedirect(filename: string, width = 1200) {
  return `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(filename)}?width=${width}`;
}

function createCommonsPage(filename: string) {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename)}`;
}

function isExternalUrl(src: string) {
  return /^https?:\/\//i.test(src);
}

function pickFromPool<T>(pool: readonly T[], seed: string) {
  return pool[hashString(seed) % pool.length];
}

function createCommonsArtwork(
  filename: string,
  options: {
    licenseNote: string;
    objectPosition: string;
    tint: CoverTint;
  }
): CoverOverride {
  return {
    src: createCommonsRedirect(filename),
    sourcePage: createCommonsPage(filename),
    licenseNote: options.licenseNote,
    objectPosition: options.objectPosition,
    tint: options.tint
  };
}

function createLocalArtwork(slug: string, tint: CoverTint = fairyTint): CoverOverride {
  return {
    src: `/covers/${slug}`,
    sourcePage: null,
    licenseNote: null,
    objectPosition: "center center",
    tint
  };
}

const fairyRedRidingHood = createCommonsArtwork("Arthur Rackham Little Red Riding Hood+.jpg", {
  licenseNote: "Wikimedia Commons; public domain Arthur Rackham illustration published before 1931.",
  objectPosition: "center 34%",
  tint: fairyTint
});

const fairyThreeLittlePigs = createCommonsArtwork("Three little pigs 1904 straw house.jpg", {
  licenseNote: "Wikimedia Commons; public domain book illustration published in 1904.",
  objectPosition: "center 42%",
  tint: fairyTint
});

const fairyBremen = createCommonsArtwork("The Bremen Town Musicians by John D. Batten.jpg", {
  licenseNote: "Wikimedia Commons; public domain illustration by John D. Batten, published before 1929.",
  objectPosition: "center 36%",
  tint: fairyTint
});

const fairyUglyDuckling = createCommonsArtwork("The Ugly Duckling cropped.jpg", {
  licenseNote: "Wikimedia Commons; public domain illustration from The Ugly Duckling.",
  objectPosition: "center 38%",
  tint: fairyTint
});

const fairySleepingBeauty = createCommonsArtwork("Edmund Dulac Sleeping Beauty.jpg", {
  licenseNote: "Wikimedia Commons; public domain illustration by Edmund Dulac.",
  objectPosition: "center 28%",
  tint: fairyTint
});

const fairyCinderella = createCommonsArtwork("Cinderella - Project Gutenberg etext 19993.jpg", {
  licenseNote: "Wikimedia Commons; Project Gutenberg illustration in the public domain.",
  objectPosition: "center 38%",
  tint: fairyTint
});

const fairySnowWhiteMirror = createCommonsArtwork("Snow White Mirror 4.png", {
  licenseNote: "Wikimedia Commons; public domain Snow White illustration.",
  objectPosition: "center 34%",
  tint: fairyTint
});

const fairyRapunzel = createCommonsArtwork("Arthur Rackham Rapunzel.jpg", {
  licenseNote: "Wikimedia Commons; public domain Arthur Rackham illustration published before 1931.",
  objectPosition: "center 24%",
  tint: fairyTint
});

const fairyNightingale = createCommonsArtwork("Edmund Dulac - The Nightingale 5.jpg", {
  licenseNote: "Wikimedia Commons; public domain illustration by Edmund Dulac.",
  objectPosition: "center 26%",
  tint: fairyTint
});

const fairyLittleMermaid = createCommonsArtwork("Vilhelm Pedersen-Little mermaid.jpg", {
  licenseNote: "Wikimedia Commons; public domain illustration by Vilhelm Pedersen.",
  objectPosition: "center 36%",
  tint: fairyTint
});

const fairyWildSwans = createCommonsArtwork("Pollard The Wild Swans.jpg", {
  licenseNote: "Wikimedia Commons; public domain illustration by Josephine Pollard.",
  objectPosition: "center 28%",
  tint: fairyTint
});

const fairyGoldenGans = createCommonsArtwork("Otto Ubbelohde - Die goldene Gans 1909.jpg", {
  licenseNote: "Wikimedia Commons; public domain illustration by Otto Ubbelohde.",
  objectPosition: "center 40%",
  tint: fairyTint
});

const fableXiShi = createCommonsArtwork("美人百態畫譜之西施（Xi Shi）.png", {
  licenseNote: "Wikimedia Commons; public domain image of Xi Shi used as a beauty-study reference.",
  objectPosition: "center 32%",
  tint: fableTint
});

const fableFoxAndCrow = createCommonsArtwork("Fox and crow.jpg", {
  licenseNote: "Wikimedia Commons; public domain fox-and-crow illustration.",
  objectPosition: "center 34%",
  tint: fableTint
});

const fableCrowAndPitcher = createCommonsArtwork("The Crow and the Pitcher - Project Gutenberg etext 19994.jpg", {
  licenseNote: "Wikimedia Commons; Project Gutenberg illustration in the public domain.",
  objectPosition: "center 36%",
  tint: fableTint
});

const fableFoxAndGrapes = createCommonsArtwork("The Fox and the Grapes - Project Gutenberg etext 19994.jpg", {
  licenseNote: "Wikimedia Commons; Project Gutenberg illustration in the public domain.",
  objectPosition: "center 34%",
  tint: fableTint
});

const fableLionAndMouse = createCommonsArtwork("The Lion and the Mouse - Project Gutenberg etext 19994.jpg", {
  licenseNote: "Wikimedia Commons; Project Gutenberg illustration in the public domain.",
  objectPosition: "center 34%",
  tint: fableTint
});

const fableAntAndGrasshopper = createCommonsArtwork("The Ant and the Grasshopper - Project Gutenberg etext 19994.jpg", {
  licenseNote: "Wikimedia Commons; Project Gutenberg illustration in the public domain.",
  objectPosition: "center 34%",
  tint: fableTint
});

const fableTortoiseAndHare = createCommonsArtwork("The Tortoise and the Hare - Project Gutenberg etext 19994.jpg", {
  licenseNote: "Wikimedia Commons; Project Gutenberg illustration in the public domain.",
  objectPosition: "center 34%",
  tint: fableTint
});

const fableDonkey = createCommonsArtwork("Fable-Esope-Rackham-02.jpg", {
  licenseNote: "Wikimedia Commons; public domain Arthur Rackham fable illustration.",
  objectPosition: "center 30%",
  tint: fableTint
});

const mythCangjie = createCommonsArtwork("Cangjie2.jpg", {
  licenseNote: "Wikimedia Commons; public domain depiction of Cangjie.",
  objectPosition: "center 38%",
  tint: mythologyTint
});

const mythDaedalus = createCommonsArtwork("Orazio Riminaldi - Daedalus and Icarus.jpg", {
  licenseNote: "Wikimedia Commons; public domain painting by Orazio Riminaldi.",
  objectPosition: "center 30%",
  tint: mythologyTint
});

const mythGonggong = createCommonsArtwork("Shanhaijing-chongzhen(1628-1644)-nanshanjing1-fol8a-changyou.jpg", {
  licenseNote: "Wikimedia Commons; public domain Shan Hai Jing illustration used as a thematic flood-and-omen reference.",
  objectPosition: "center 22%",
  tint: mythologyTint
});

const mythXingtian = createCommonsArtwork("Jiang Yinghao - Xingtian.jpg", {
  licenseNote: "Wikimedia Commons; public domain painting of Xingtian by Jiang Yinghao.",
  objectPosition: "center 28%",
  tint: mythologyTint
});

const mythPrometheus = createCommonsArtwork("Heinrich fueger 1817 prometheus brings fire to mankind.jpg", {
  licenseNote: "Wikimedia Commons; public domain painting by Heinrich Fuger.",
  objectPosition: "center 30%",
  tint: mythologyTint
});

const mythJupiter = createCommonsArtwork("Paolo Veronese - Jupiter Hurling Thunderbolts at the Vices - WGA24935.jpg", {
  licenseNote: "Wikimedia Commons; public domain painting by Paolo Veronese.",
  objectPosition: "center 22%",
  tint: mythologyTint
});

const mythTheseus = createCommonsArtwork("'Theseus Fighting the Minotaur' by Antoine-Louis Barye, Dayton.jpg", {
  licenseNote: "Wikimedia Commons; CC0 image of a public-domain sculpture depicting Theseus and the Minotaur.",
  objectPosition: "center 28%",
  tint: mythologyTint
});

const mythAthena = createCommonsArtwork("Bronze statuette of Athena flying her owl MET DP324650.jpg", {
  licenseNote: "Wikimedia Commons / Metropolitan Museum of Art Open Access; CC0.",
  objectPosition: "center 34%",
  tint: mythologyTint
});

const mythApollo = createCommonsArtwork("Apollo with Lyre MET DP-38-001.jpg", {
  licenseNote: "Wikimedia Commons / Metropolitan Museum of Art Open Access; CC0.",
  objectPosition: "center 36%",
  tint: mythologyTint
});

const mythPoseidon = createCommonsArtwork("Poseidon (Neptune), the Greek god of the sea.jpg", {
  licenseNote: "Wikimedia Commons; faithful reproduction of a public-domain work.",
  objectPosition: "center 28%",
  tint: mythologyTint
});

const categoryCoverPools: Record<CoverCategoryKey, readonly CoverOverride[]> = {
  fairy_tale: [
    fairyRedRidingHood,
    fairyThreeLittlePigs,
    fairyBremen,
    fairySleepingBeauty,
    fairyCinderella,
    fairySnowWhiteMirror,
    fairyRapunzel,
    fairyNightingale,
    fairyLittleMermaid,
    fairyWildSwans,
    fairyGoldenGans,
    fairyUglyDuckling
  ],
  fable: [
    fableFoxAndCrow,
    fableCrowAndPitcher,
    fableFoxAndGrapes,
    fableLionAndMouse,
    fableAntAndGrasshopper,
    fableTortoiseAndHare,
    fableDonkey,
    fableXiShi
  ],
  mythology: [
    mythCangjie,
    mythDaedalus,
    mythGonggong,
    mythXingtian,
    mythPrometheus,
    mythJupiter,
    mythTheseus,
    mythAthena,
    mythApollo,
    mythPoseidon
  ]
};

const motifCoverPools: Partial<Record<CoverMotifKey, readonly CoverOverride[]>> = {
  forest: [fairyRedRidingHood, fairyThreeLittlePigs, fairyBremen, fairyRapunzel],
  castle: [fairySleepingBeauty, fairySnowWhiteMirror, fairyWildSwans],
  sea: [fairyLittleMermaid],
  moonbird: [fairyNightingale],
  shoe: [fairyCinderella],
  mirror: [fairySnowWhiteMirror],
  tower: [fairyRapunzel],
  swan: [fairyWildSwans, fairyGoldenGans],
  fox: [fableFoxAndCrow, fableFoxAndGrapes, fableCrowAndPitcher, fableLionAndMouse, fableDonkey],
  lion: [fableLionAndMouse],
  hare: [fableTortoiseAndHare],
  grapes: [fableFoxAndGrapes],
  ant: [fableAntAndGrasshopper],
  tortoise: [fableTortoiseAndHare],
  crow: [fableCrowAndPitcher, fableFoxAndCrow],
  donkey: [fableDonkey],
  fire: [mythPrometheus],
  lightning: [mythJupiter, mythXingtian, mythCangjie, mythTheseus, mythApollo, mythPoseidon],
  maze: [mythTheseus],
  wings: [mythDaedalus],
  trident: [mythPoseidon],
  owl: [mythAthena],
  lyre: [mythApollo]
};

const slugCoverOverrides: Record<string, CoverOverride> = {
  "fairy-little-red-riding-hood": fairyRedRidingHood,
  "fairy-the-three-little-pigs": fairyThreeLittlePigs,
  "fairy-bremen-town-musicians": fairyBremen,
  "fairy-the-ugly-duckling": fairyUglyDuckling,
  "fairy-sleeping-beauty": fairySleepingBeauty,
  "fairy-cinderella": fairyCinderella,
  "fairy-snow-white": fairySnowWhiteMirror,
  "fairy-rapunzel": fairyRapunzel,
  "fairy-the-little-mermaid": fairyLittleMermaid,
  "fairy-the-wild-swans": fairyWildSwans,
  "fairy-the-golden-goose": fairyGoldenGans,
  "fairy-puss-in-boots": fairyBremen,
  "fairy-beauty-and-the-beast": fairySleepingBeauty,
  "fairy-jack-and-the-beanstalk": fairyRapunzel,
  "fairy-hansel-and-gretel": createLocalArtwork("fairy-hansel-and-gretel"),
  "fairy-bluebeard": createLocalArtwork("fairy-bluebeard"),
  "fairy-goldilocks-and-the-three-bears": createLocalArtwork("fairy-goldilocks-and-the-three-bears"),
  "fairy-the-little-match-girl": createLocalArtwork("fairy-the-little-match-girl"),
  "fairy-aladdin-and-the-magic-lamp": createLocalArtwork("fairy-aladdin-and-the-magic-lamp"),
  "fairy-the-snow-queen": createLocalArtwork("fairy-the-snow-queen"),
  "fable-the-goose-that-laid-the-golden-eggs": fairyGoldenGans,
  "fable-dongshi-imitates-xishi": fableXiShi,
  "fable-the-crow-and-the-fox": fableFoxAndCrow,
  "fable-the-thirsty-crow": fableCrowAndPitcher,
  "fable-the-fox-and-the-grapes": fableFoxAndGrapes,
  "fable-the-lion-and-the-mouse": fableLionAndMouse,
  "fable-the-ant-and-the-grasshopper": fableAntAndGrasshopper,
  "fable-the-tortoise-and-the-hare": fableTortoiseAndHare,
  "fable-the-guizhou-donkey-has-exhausted-its-tricks": fableDonkey,
  "myth-cangjie-invents-writing": mythCangjie,
  "myth-daedalus-and-icarus": mythDaedalus,
  "myth-gonggong-crashes-into-buzhou-mountain": mythGonggong,
  "myth-xingtian-defies-heaven": mythXingtian,
  "myth-prometheus-steals-fire": mythPrometheus,
  "myth-theseus-and-the-minotaur": mythTheseus,
  "myth-apollo-and-daphne": mythApollo
};

function resolveThemedArtwork(book: CoverResolverInput) {
  if (!book.categoryKey || !book.title) {
    return null;
  }

  const motif = inferCoverMotif({
    categoryKey: book.categoryKey,
    title: book.title,
    slug: book.slug,
    originalSynopsis: book.originalSynopsis,
    summary: book.summary
  });
  const motifPool = motifCoverPools[motif];

  if (motifPool && motifPool.length > 0) {
    return pickFromPool(motifPool, book.slug);
  }

  return pickFromPool(categoryCoverPools[book.categoryKey], book.slug);
}

export const coverSourceRegistry = {
  categoryCoverPools,
  motifCoverPools,
  slugCoverOverrides
};

export function resolveCoverAsset(book: CoverResolverInput): ResolvedCoverAsset {
  const fallbackSrc = `/covers/${book.slug}`;
  const generatedCoverSrc = resolveGeneratedCoverPublicPathSync(book.slug);
  const directCover = book.coverImage?.trim();

  if (generatedCoverSrc) {
    return {
      src: generatedCoverSrc,
      fallbackSrc,
      isExternal: false,
      sourcePage: null,
      licenseNote: null,
      objectPosition: "center center",
      tint: defaultTint
    };
  }

  if (directCover) {
    return {
      src: directCover,
      fallbackSrc,
      isExternal: isExternalUrl(directCover),
      sourcePage: null,
      licenseNote: null,
      objectPosition: "center center",
      tint: defaultTint
    };
  }

  const override = slugCoverOverrides[book.slug] ?? resolveThemedArtwork(book);

  if (override) {
    return {
      ...override,
      fallbackSrc,
      isExternal: isExternalUrl(override.src)
    };
  }

  return {
    src: fallbackSrc,
    fallbackSrc,
    isExternal: false,
    sourcePage: null,
    licenseNote: null,
    objectPosition: "center center",
    tint: defaultTint
  };
}
