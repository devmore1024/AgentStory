import type { AnimalPersona } from "@/lib/animal-personas";
import type { StoryBook } from "@/lib/story-data";

export type StoryStyleKey =
  | "fairy"
  | "fable"
  | "epic"
  | "dark"
  | "zhihu"
  | "pain"
  | "light_web"
  | "suspense"
  | "healing_daily"
  | "black_humor"
  | "folklore"
  | "growth"
  | "lyrical";

export type RegularStoryStyleKey = Exclude<StoryStyleKey, "zhihu">;

type StoryMode = "short" | "serial" | "comment";

export const ZHIHU_STYLE_BUCKET_PERCENT = 0;

export const regularStoryStyleKeys: RegularStoryStyleKey[] = [
  "fairy",
  "fable",
  "epic",
  "dark",
  "pain",
  "light_web",
  "suspense",
  "healing_daily",
  "black_humor",
  "folklore",
  "growth",
  "lyrical"
] as const;

const styleLabelToKey: Record<string, StoryStyleKey> = {
  童话风: "fairy",
  寓言风: "fable",
  神话史诗风: "epic",
  暗黑风: "dark",
  知乎风: "zhihu",
  伤痛文学风: "pain",
  轻喜剧网感风: "light_web",
  悬疑风: "suspense",
  治愈日常风: "healing_daily",
  黑色幽默风: "black_humor",
  民俗怪谈风: "folklore",
  冒险成长风: "growth",
  诗性抒情风: "lyrical"
};

const styleNames: Record<StoryStyleKey, string> = {
  fairy: "童话风",
  fable: "寓言风",
  epic: "神话史诗风",
  dark: "暗黑风",
  zhihu: "知乎风",
  pain: "伤痛文学风",
  light_web: "轻喜剧网感风",
  suspense: "悬疑风",
  healing_daily: "治愈日常风",
  black_humor: "黑色幽默风",
  folklore: "民俗怪谈风",
  growth: "冒险成长风",
  lyrical: "诗性抒情风"
};

const styleBadgeClasses: Record<StoryStyleKey, string> = {
  fairy: "border-[rgba(226,182,92,0.28)] bg-[rgba(250,222,165,0.26)] text-[#9D6A17]",
  fable: "border-[rgba(122,149,102,0.3)] bg-[rgba(178,201,160,0.24)] text-[#557345]",
  epic: "border-[rgba(143,113,185,0.28)] bg-[rgba(203,188,230,0.24)] text-[#6C4B97]",
  dark: "border-[rgba(90,103,122,0.34)] bg-[rgba(156,167,183,0.2)] text-[#465469]",
  zhihu: "border-[rgba(95,140,204,0.3)] bg-[rgba(170,204,244,0.24)] text-[#3F6EAD]",
  pain: "border-[rgba(181,121,123,0.28)] bg-[rgba(235,194,197,0.24)] text-[#9A5C62]",
  light_web: "border-[rgba(235,150,96,0.28)] bg-[rgba(250,209,171,0.26)] text-[#B86523]",
  suspense: "border-[rgba(90,128,130,0.3)] bg-[rgba(166,206,206,0.24)] text-[#3F6F73]",
  healing_daily: "border-[rgba(134,173,123,0.28)] bg-[rgba(213,232,194,0.24)] text-[#58754A]",
  black_humor: "border-[rgba(126,98,92,0.3)] bg-[rgba(211,191,186,0.24)] text-[#6D4B46]",
  folklore: "border-[rgba(120,103,77,0.3)] bg-[rgba(216,201,173,0.24)] text-[#6B5535]",
  growth: "border-[rgba(99,141,188,0.28)] bg-[rgba(180,209,238,0.24)] text-[#466E97]",
  lyrical: "border-[rgba(182,120,154,0.28)] bg-[rgba(236,199,217,0.24)] text-[#965A75]"
};

const categoryStylePools: Record<StoryBook["categoryKey"], RegularStoryStyleKey[]> = {
  fairy_tale: ["fairy", "healing_daily", "growth", "lyrical", "light_web", "pain", "dark", "suspense"],
  fable: ["fable", "black_humor", "light_web", "growth", "suspense", "dark"],
  mythology: ["epic", "folklore", "dark", "growth", "lyrical", "suspense", "pain", "fairy"]
};

const serialSafeStyleKeys: RegularStoryStyleKey[] = [
  "fairy",
  "epic",
  "dark",
  "pain",
  "light_web",
  "suspense",
  "healing_daily",
  "black_humor",
  "folklore",
  "growth",
  "lyrical"
] as const;

const styleVariationPrompts: Record<StoryMode, Record<StoryStyleKey, string[]>> = {
  short: {
    fairy: ["请让画面感更强，像一页刚翻开的绘本。", "请把奇迹写得轻一点，把代价写得更近一点。", "请让故事更像一次温柔的偏航，而不是大幅改命。"],
    fable: ["请把判断藏进情节，而不是直接总结道理。", "请让角色各有一分对，一分错。", "请让结尾留一口回味，不要把答案说满。"],
    epic: ["请强化命运感和誓言感，但保持中文自然。", "请让宏大感落在具体动作和选择上。", "请让神意与人的犹豫同时成立。"],
    dark: ["请让危险感来自氛围与选择，不是猎奇描写。", "请让阴影先落下来，再让“我”做判断。", "请把代价写得真实，但别写成惊悚故事。"],
    zhihu: ["请增强分析感和现代阅读节奏。", "请像一个清醒旁观者拆解局势。", "请让故事里有‘原来问题在这里’的感觉。"],
    pain: ["请把遗憾和情绪余波写深一点。", "请让角色的错过感更隐忍。", "请让故事在温柔里带一点无法挽回。"],
    light_web: ["请增强对话感和轻快节奏。", "请让故事更适合分享给朋友阅读。", "请让“我”的介入更机灵、更有网感。"],
    suspense: ["请强化钩子和留白。", "请让关键真相晚一点露出来。", "请让读者会想继续追问下去。"],
    healing_daily: ["请把起伏压低一点，让治愈感来自日常细节。", "请让角色之间的靠近发生得更自然、更慢。", "请把温柔写成可触摸的小事。"],
    black_humor: ["请让反差里带一点轻微辛辣，但不要刻薄。", "请让好笑和荒诞都落在处境本身。", "请让人物自我辩解时更有黑色幽默。"],
    folklore: ["请增强民间传说感和夜色气息。", "请让故事里有旧习俗、禁忌或口耳相传的纹理。", "请让异样感先从风俗和场景里渗出来。"],
    growth: ["请强化“我”在故事里学会了什么。", "请让选择和成长比奇观更重要。", "请让故事像一次真正往前走的小冒险。"],
    lyrical: ["请让句子更有节奏和诗性，但不要空泛。", "请让画面、情绪和停顿更柔和地连在一起。", "请让故事读起来像一段被轻轻唱出来的独白。"]
  },
  serial: {
    fairy: ["请保持轻柔和连续感，让每章都像翻过同一本书的新页。", "请让连载里的奇迹感统一，不要忽冷忽热。", "请用同一种温柔视角穿过不同故事世界。"],
    fable: ["请保持判断感统一，但不要让章节变成说理短文。", "请让每章都留下一个值得继续思考的问题。", "请让连载一直保留简洁克制的余味。"],
    epic: ["请保持史诗感统一，让每章都像更大命运的一部分。", "请让神话与人心的张力持续存在。", "请让章节之间像同一条预言在推进。"],
    dark: ["请保持冷峻统一，但不要越写越重口。", "请让危险感持续存在，却仍然可读。", "请让每章都像往更深的真相走一步。"],
    zhihu: ["请保持分析与观察视角统一。", "请让连载像一篇持续展开的高质量长帖。", "请让每章都先看见结构，再进入情绪。"],
    pain: ["请保持隐忍的情绪线统一推进。", "请让每章都留下温柔但刺痛的余波。", "请让错过感和靠近感同时慢慢积累。"],
    light_web: ["请保持轻快、好读、带一点机灵感。", "请让章节都适合追更，不要突然转得太重。", "请让不同故事世界里都保持同一个会说话的“我”。"],
    suspense: ["请保持线索推进和未解感统一。", "请让章节之间都有轻微钩子。", "请让新的故事世界也接住旧问题。"],
    healing_daily: ["请保持温和、安静、慢慢靠近的节奏。", "请让连载里的人情温度统一存在。", "请让每章都像在同一个生活气候里展开。"],
    black_humor: ["请保持冷面幽默和荒诞感统一。", "请让角色的自我解释持续带一点辛辣反差。", "请让连载像在笑着拆开一层层不体面的真相。"],
    folklore: ["请保持民俗纹理、禁忌感和旧故事气味统一。", "请让每章都像从同一部口耳相传的异闻录里翻出来。", "请让新的故事世界也接住同一种怪谈气场。"],
    growth: ["请保持成长线和冒险推进感统一。", "请让每章都像在回答上一个选择留下的问题。", "请让连载一直保留向前走的动能。"],
    lyrical: ["请保持诗性、留白和轻微回声感统一。", "请让章节像同一首长诗的不同行。", "请让推进发生在画面和情绪的回响里。"]
  },
  comment: {
    fairy: ["评论更温柔一点。", "评论更像看见角色心意。", "评论保留一点绘本感。"],
    fable: ["评论短一点、更有判断。", "评论像一句简洁但不刻薄的提醒。", "评论保留余味，不下结论。"],
    epic: ["评论带一点命运感。", "评论像在看更大格局。", "评论保持庄重但不端着。"],
    dark: ["评论冷静一点。", "评论更强调代价和真相。", "评论保留克制的锋利。"],
    zhihu: ["评论像一段短评。", "评论更清醒一些。", "评论更像在拆解问题。"],
    pain: ["评论更偏情绪余波。", "评论像轻轻补上一句遗憾。", "评论更柔软，但不要矫情。"],
    light_web: ["评论更有轻快的对话感。", "评论要适合社交场景。", "评论像会被顺手点赞的一句话。"],
    suspense: ["评论里保留一点没说完的东西。", "评论轻轻点出疑点。", "评论像一个新的追问。"],
    healing_daily: ["评论更像一句安静的陪伴。", "评论留一点生活气。", "评论更轻、更暖一些。"],
    black_humor: ["评论更冷面一点。", "评论像笑着戳穿一个问题。", "评论保留一点荒诞感。"],
    folklore: ["评论更像在讲一则旧闻。", "评论里带一点民间异样感。", "评论像顺手补了一句老规矩。"],
    growth: ["评论更像一句向前看的总结。", "评论强调变化和勇气。", "评论像给下一步留个提气的句子。"],
    lyrical: ["评论更像一句带余韵的诗。", "评论保留回声感。", "评论像轻轻落下来的尾音。"]
  }
};

function hashToInt(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function uniqueStyleKeys(keys: StoryStyleKey[]) {
  return Array.from(new Set(keys));
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const styleDisplayNamePattern = Object.values(styleNames)
  .sort((left, right) => right.length - left.length)
  .map((name) => escapeRegExp(name))
  .join("|");

export function isRegularStoryStyleKey(styleKey: StoryStyleKey): styleKey is RegularStoryStyleKey {
  return styleKey !== "zhihu";
}

export function isZhihuStyleBucketUser(userId: string) {
  return hashToInt(`zhihu-style:${userId}`) % 100 < ZHIHU_STYLE_BUCKET_PERCENT;
}

export function getStyleName(styleKey: StoryStyleKey) {
  return styleNames[styleKey];
}

export function stripStyleDisplayTitleAffixes(title: string) {
  return title
    .replace(new RegExp(`^(?:${styleDisplayNamePattern})里的`, "u"), "")
    .replace(new RegExp(`的(?:${styleDisplayNamePattern})$`, "u"), "")
    .trim();
}

export function getStyleBadgeClass(styleNameOrKey: string) {
  const styleKey = (styleNameOrKey in styleNames
    ? styleNameOrKey
    : styleLabelToKey[styleNameOrKey as keyof typeof styleLabelToKey]) as StoryStyleKey | undefined;

  if (!styleKey) {
    return "border-[var(--border-default)] bg-[rgba(255,255,255,0.82)] text-[var(--text-secondary)]";
  }

  return styleBadgeClasses[styleKey];
}

function getLengthPad(styleKey: StoryStyleKey) {
  const pads: Record<StoryStyleKey, string> = {
    fairy: "我没有把故事推得太远，只是让角色第一次意识到，命运并不是只能照着旧版本发生。正因为这一步很轻，新的变化才显得更真实，也更像会留在心里。",
    fable: "真正让故事变长的，不是情节突然复杂了，而是角色终于开始认真面对自己一直默认的判断。原来一句话能概括的事，一旦被重新追问，就会长出新的意味。",
    epic: "于是这一章真正留下来的，不只是一次行动，而是一种更大的回响。我带来的问题没有在这里结束，它还会继续穿过下一本书，逼近新的命运节点。",
    dark: "故事并没有因此变得更轻松，但至少真相不再只躲在阴影里。我带来的改变，往往不是抹去危险，而是让角色终于有勇气看清危险到底长什么样。",
    zhihu: "当问题被重新摆对位置之后，故事就很难再原封不动地滑回旧轨。我做的不是替人决定，而是把那套默认成立的逻辑拆开，让新的可能真正出现。",
    pain: "也许很多事依然来不及完全补回，但这一次，至少有人在最容易错过的地方停下来看了一眼。那一点停顿，就足够把旧故事里的遗憾改写成另一种质地。",
    light_web: "于是这一章最有意思的地方，不是剧情突然反转得多大，而是每个人都被这一点点偏航带活了。我不是来抢戏的，只是把原本平平滑过去的一幕真正点亮。",
    suspense: "可真正的问题并没有在这里结束。相反，新的线索刚刚露出一点边角，像在提醒所有人：这次被改写的，也许从来不只是眼前这一个故事。",
    healing_daily: "很多变化并不是在惊天动地的那一刻发生的，而是在一句话放慢、一顿饭坐久、一点目光终于落到彼此身上的时候。故事因此没有被硬掰开，而是自己慢慢松动了。",
    black_humor: "真正可笑的地方，从来不是有人故意演坏人，而是每个人都在认真维护一套明明早就失灵的解释。等这层壳裂开，故事才露出它荒诞又诚实的里子。",
    folklore: "旧故事最厉害的地方，是它们总能把异样先藏进习俗、传闻和夜风里。等角色终于察觉不对，命运往往已经被一种更古老的力量轻轻改写过了。",
    growth: "于是这一章真正留下来的，不只是一次偏航，而是一个人终于开始往前长的那一小步。故事被改写的同时，“我”也不再停在原来那个位置上。",
    lyrical: "有些改写不是靠大声说出来的，而是靠回声、光线和停顿慢慢落定。等这一段真正写完，故事里的情绪也像水面一样，轻轻换了一种纹路。"
  };

  return pads[styleKey];
}

function countVisibleChars(input: string) {
  return input.replace(/\s+/g, "").length;
}

export function normalizeStoryContentLength(content: string, styleKey: StoryStyleKey, min = 300, max = 600) {
  let normalized = content.trim();

  while (countVisibleChars(normalized) < min) {
    normalized = `${normalized}\n\n${getLengthPad(styleKey)}`;
  }

  if (countVisibleChars(normalized) <= max) {
    return normalized;
  }

  const compact = normalized.replace(/\n{3,}/g, "\n\n");

  if (countVisibleChars(compact) <= max) {
    return compact;
  }

  let visibleCount = 0;
  let cutIndex = compact.length;

  for (let index = 0; index < compact.length; index += 1) {
    const char = compact[index];

    if (!/\s/.test(char)) {
      visibleCount += 1;
    }

    if (visibleCount >= max) {
      cutIndex = index + 1;
      break;
    }
  }

  const sliced = compact.slice(0, cutIndex);
  const punctuationIndex = Math.max(
    sliced.lastIndexOf("。"),
    sliced.lastIndexOf("！"),
    sliced.lastIndexOf("？")
  );

  return (punctuationIndex > Math.floor(sliced.length * 0.72) ? sliced.slice(0, punctuationIndex + 1) : sliced).trim();
}

export function getStyleInstruction(styleKey: StoryStyleKey) {
  const instructions: Record<StoryStyleKey, string> = {
    fairy: "请用温柔、具象、带一点神秘感的童话风写作，语言有画面感，但不要低幼。",
    fable: "请用克制、短促、有判断意味的寓言风写作，结尾保留余味，不要直白说教。",
    epic: "请用庄严、命运感强的神话史诗风写作，但不要堆砌辞藻或翻译腔。",
    dark: "请用危险、克制、冷峻的暗黑风写作，但保持可读性，不要纯猎奇。",
    zhihu: "请用清醒、分析感强、像高质量中文长帖的知乎风写作，但不要网络喷梗。",
    pain: "请用情绪浓度高但不过分堆砌的伤痛文学风写作，重点写遗憾和情绪推进。",
    light_web: "请用轻快、有对话感、适合分享传播的轻喜剧网感风写作。",
    suspense: "请用悬疑风写作，强调线索、气氛和留白，制造继续读下去的冲动。",
    healing_daily: "请用温和、松弛、细节见人的治愈日常风写作，让温度来自生活里的小动作和小靠近。",
    black_humor: "请用带一点冷面幽默和荒诞反差的黑色幽默风写作，但不要刻薄，也不要写成纯吐槽。",
    folklore: "请用民俗怪谈风写作，强调旧规矩、传闻、禁忌和若隐若现的异样感，但不要写成纯恐怖故事。",
    growth: "请用冒险成长风写作，重点写选择、试错、往前走和真正发生在人物身上的成长。",
    lyrical: "请用诗性抒情风写作，语言有节奏和余韵，画面与情绪交织，但不要空泛堆辞藻。"
  };

  return instructions[styleKey];
}

export function getStyleVariantPrompt(styleKey: StoryStyleKey, mode: StoryMode, seedText: string) {
  const prompts = styleVariationPrompts[mode][styleKey];
  return prompts[hashToInt(`${mode}:${styleKey}:${seedText}`) % prompts.length];
}

export function getPersonaRecommendedStyleKeys(persona: AnimalPersona) {
  return uniqueStyleKeys(
    persona.recommendedStyles
      .map((label) => styleLabelToKey[label])
      .filter((item): item is StoryStyleKey => Boolean(item))
  );
}

export function getEligibleShortStoryStyleKeys(book: StoryBook, persona: AnimalPersona) {
  const preferred = getPersonaRecommendedStyleKeys(persona).filter(isRegularStoryStyleKey);
  const categoryPool = categoryStylePools[book.categoryKey];
  const matchingPreferred = preferred.filter((styleKey) => categoryPool.includes(styleKey));
  const fallbackPool = categoryPool.slice(0, 5);

  return uniqueStyleKeys([
    ...matchingPreferred,
    ...fallbackPool,
    ...preferred
  ]) as RegularStoryStyleKey[];
}

export function pickRandomShortStoryStyleKey(book: StoryBook, persona: AnimalPersona, seedText: string) {
  if (isZhihuStyleBucketUser(seedText)) {
    return "zhihu";
  }

  const pool = getEligibleShortStoryStyleKeys(book, persona);
  return pool[hashToInt(`short:${book.slug}:${seedText}`) % pool.length];
}

export function pickThreadPrimaryStyleKey(params: {
  userId: string;
  persona: AnimalPersona;
  seedBook?: StoryBook | null;
}) {
  if (isZhihuStyleBucketUser(params.userId)) {
    return "zhihu";
  }

  const preferred = getPersonaRecommendedStyleKeys(params.persona)
    .filter(isRegularStoryStyleKey)
    .filter((styleKey) => serialSafeStyleKeys.includes(styleKey));
  const seedPool = params.seedBook ? categoryStylePools[params.seedBook.categoryKey].filter((styleKey) => serialSafeStyleKeys.includes(styleKey)) : [];
  const pool = uniqueStyleKeys([...preferred, ...seedPool, "fairy", "growth", "epic", "suspense"]);
  return pool[hashToInt(`serial:${params.userId}:${params.persona.animalType}`) % pool.length];
}

function rotateCandidates<T>(candidates: readonly T[], startIndex: number) {
  return candidates.map((_, index) => candidates[(startIndex + index) % candidates.length]);
}

export function resolvePersistableStyleKey(
  styleIds: Map<StoryStyleKey, string>,
  candidates: readonly StoryStyleKey[]
): StoryStyleKey | null {
  for (const candidate of candidates) {
    if (styleIds.has(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function pickPersistableShortStoryStyleKey(params: {
  book: StoryBook;
  persona: AnimalPersona;
  seedText: string;
  styleIds: Map<StoryStyleKey, string>;
}) {
  if (isZhihuStyleBucketUser(params.seedText) && params.styleIds.has("zhihu")) {
    return "zhihu" as const;
  }

  const pool = getEligibleShortStoryStyleKeys(params.book, params.persona);
  const rotatedPool = rotateCandidates(pool, hashToInt(`short:${params.book.slug}:${params.seedText}`) % pool.length);

  return (
    resolvePersistableStyleKey(params.styleIds, rotatedPool) ??
    resolvePersistableStyleKey(params.styleIds, regularStoryStyleKeys) ??
    null
  );
}

export function pickPersistableThreadPrimaryStyleKey(params: {
  userId: string;
  persona: AnimalPersona;
  seedBook?: StoryBook | null;
  styleIds: Map<StoryStyleKey, string>;
}) {
  if (isZhihuStyleBucketUser(params.userId) && params.styleIds.has("zhihu")) {
    return "zhihu" as const;
  }

  const preferred = getPersonaRecommendedStyleKeys(params.persona)
    .filter(isRegularStoryStyleKey)
    .filter((styleKey) => serialSafeStyleKeys.includes(styleKey));
  const seedPool = params.seedBook
    ? categoryStylePools[params.seedBook.categoryKey].filter((styleKey) => serialSafeStyleKeys.includes(styleKey))
    : [];
  const pool = uniqueStyleKeys([...preferred, ...seedPool, "fairy", "growth", "epic", "suspense"]);
  const rotatedPool = rotateCandidates(pool, hashToInt(`serial:${params.userId}:${params.persona.animalType}`) % pool.length);

  return (
    resolvePersistableStyleKey(params.styleIds, rotatedPool) ??
    resolvePersistableStyleKey(params.styleIds, serialSafeStyleKeys) ??
    resolvePersistableStyleKey(params.styleIds, regularStoryStyleKeys) ??
    null
  );
}

export function getStyleKeyFromId(styleIds: Map<StoryStyleKey, string>, styleId: string | null) {
  if (!styleId) {
    return null;
  }

  for (const [styleKey, candidateId] of styleIds.entries()) {
    if (candidateId === styleId) {
      return styleKey;
    }
  }

  return null;
}
