export type CoverCategoryKey = "fairy_tale" | "fable" | "mythology";

export type CoverMotifKey =
  | "forest"
  | "castle"
  | "sea"
  | "moonbird"
  | "shoe"
  | "mirror"
  | "tower"
  | "swan"
  | "fox"
  | "lion"
  | "hare"
  | "grapes"
  | "ant"
  | "tortoise"
  | "crow"
  | "donkey"
  | "fire"
  | "lightning"
  | "maze"
  | "wings"
  | "trident"
  | "owl"
  | "lyre";

type InferCoverMotifInput = {
  categoryKey: CoverCategoryKey;
  title: string;
  slug: string;
  originalSynopsis?: string | null;
  summary?: string | null;
};

export function hashString(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function inferCoverMotif(book: InferCoverMotifInput): CoverMotifKey {
  const signals = `${book.title} ${book.slug} ${book.originalSynopsis ?? book.summary ?? ""}`.toLowerCase();

  if (book.categoryKey === "fairy_tale") {
    if (/red|hood|wolf|forest|woods|小红帽|狼|森林/.test(signals)) return "forest";
    if (/snow|queen|princess|castle|白雪|公主|王子|城堡/.test(signals)) return "castle";
    if (/mermaid|sea|ocean|海|人鱼|海的女儿|金鱼/.test(signals)) return "sea";
    if (/nightingale|rose|moon|bird|夜莺|玫瑰|月/.test(signals)) return "moonbird";
    if (/cinderella|shoe|灰姑娘|水晶鞋/.test(signals)) return "shoe";
    if (/mirror|queen|镜|魔镜/.test(signals)) return "mirror";
    if (/tower|sleeping|thorn|长发|睡美人|塔/.test(signals)) return "tower";
    if (/swan|goose|天鹅|鹅/.test(signals)) return "swan";
    return "forest";
  }

  if (book.categoryKey === "fable") {
    if (/fox|狐狸/.test(signals)) return "fox";
    if (/lion|狮/.test(signals)) return "lion";
    if (/hare|rabbit|兔/.test(signals)) return "hare";
    if (/grape|葡萄/.test(signals)) return "grapes";
    if (/ant|蚂蚁|grasshopper|蝉/.test(signals)) return "ant";
    if (/tortoise|turtle|龟/.test(signals)) return "tortoise";
    if (/crow|raven|乌鸦/.test(signals)) return "crow";
    if (/donkey|驴/.test(signals)) return "donkey";
    return "fox";
  }

  if (/prometheus|fire|火|普罗米修斯/.test(signals)) return "fire";
  if (/zeus|lightning|宙斯|雷/.test(signals)) return "lightning";
  if (/labyrinth|maze|迷宫|米诺陶/.test(signals)) return "maze";
  if (/icarus|wings|飞翼|伊卡洛斯/.test(signals)) return "wings";
  if (/poseidon|trident|海神|三叉戟/.test(signals)) return "trident";
  if (/athena|owl|雅典娜|猫头鹰/.test(signals)) return "owl";
  if (/apollo|lyre|阿波罗|琴/.test(signals)) return "lyre";

  return "lightning";
}
