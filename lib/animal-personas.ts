export type AnimalPersona = {
  animalType: "bear" | "deer" | "fox" | "owl" | "wolf" | "cat" | "rabbit" | "raven";
  animalName: string;
  displayLabel: string;
  summary: string;
  expressionStyle: string;
  tendencies: string[];
  values: string[];
  recommendedCategories: string[];
  recommendedStyles: string[];
  mappingReason: string;
  dimensionScores: {
    warmth: number;
    action: number;
    thinking: number;
    expression: number;
  };
  badgeAsset: string;
  portraitAsset: string;
  accentColor: string;
  bgStyleKey: "warm_dawn" | "forest_mist" | "moon_glow" | "story_sky";
  badgeStyle: string;
  portraitStyle: string;
  shapeKeywords: string[];
  doNotUse: string[];
};

export const animalPersonas: Record<AnimalPersona["animalType"], Omit<AnimalPersona, "mappingReason">> = {
  bear: {
    animalType: "bear",
    animalName: "熊",
    displayLabel: "动物人格",
    summary: "你的分身更像一个稳稳接住别人情绪的人，进入故事时天然带着守护感。",
    expressionStyle: "温和、安稳、有耐心，不轻易尖锐。",
    tendencies: ["守护", "耐心", "稳定推进"],
    values: ["可靠", "责任感", "陪伴"],
    recommendedCategories: ["童话", "神话"],
    recommendedStyles: ["童话风", "神话史诗风", "轻喜剧网感风"],
    dimensionScores: {
      warmth: 88,
      action: 60,
      thinking: 56,
      expression: 58
    },
    badgeAsset: "persona-badge-bear",
    portraitAsset: "persona-portrait-bear",
    accentColor: "#9a6b52",
    bgStyleKey: "warm_dawn",
    badgeStyle: "厚实圆角、稳稳落住画面中心",
    portraitStyle: "圆润块面、柔和眼神、像能接住情绪的守护者",
    shapeKeywords: ["圆润", "厚实", "安稳", "大块面"],
    doNotUse: ["尖锐獠牙", "凶猛怒吼", "写实毛发"]
  },
  deer: {
    animalType: "deer",
    animalName: "鹿",
    displayLabel: "动物人格",
    summary: "你的分身进入故事的方式更轻、更温柔，先感受关系和情绪，再决定怎么靠近。",
    expressionStyle: "细腻、真诚、愿意倾听，不急着把结论说满。",
    tendencies: ["共情", "细腻", "慢热靠近"],
    values: ["善意", "柔软", "理解"],
    recommendedCategories: ["童话", "神话"],
    recommendedStyles: ["童话风", "伤痛文学风", "神话史诗风"],
    dimensionScores: {
      warmth: 91,
      action: 42,
      thinking: 54,
      expression: 66
    },
    badgeAsset: "persona-badge-deer",
    portraitAsset: "persona-portrait-deer",
    accentColor: "#b98562",
    bgStyleKey: "forest_mist",
    badgeStyle: "细线条与留白，角和耳朵更轻盈",
    portraitStyle: "林间月色感、眼神温柔、轮廓轻而不弱",
    shapeKeywords: ["轻", "细", "优雅", "留白"],
    doNotUse: ["写实鹿角", "硬朗线条", "低幼卡通比例"]
  },
  fox: {
    animalType: "fox",
    animalName: "狐狸",
    displayLabel: "动物人格",
    summary: "你会先观察局势，再决定什么时候进入，因此你的分身像一只聪明而克制的狐狸。",
    expressionStyle: "先观察，再发言；说话有分寸，但总能点到故事关键。",
    tendencies: ["观察局势", "判断时机", "善于转圜"],
    values: ["清醒", "灵活", "不盲从"],
    recommendedCategories: ["寓言", "童话"],
    recommendedStyles: ["知乎风", "寓言风", "轻喜剧网感风"],
    dimensionScores: {
      warmth: 62,
      action: 58,
      thinking: 84,
      expression: 71
    },
    badgeAsset: "persona-badge-fox",
    portraitAsset: "persona-portrait-fox",
    accentColor: "#d17b4c",
    bgStyleKey: "warm_dawn",
    badgeStyle: "略锋利的侧脸轮廓，聪明但克制",
    portraitStyle: "带一点岔路和书页感的机敏观察者",
    shapeKeywords: ["锋利", "灵巧", "侧脸感", "机敏"],
    doNotUse: ["夸张狡黠表情", "攻击性利齿", "网络表情包感"]
  },
  owl: {
    animalType: "owl",
    animalName: "猫头鹰",
    displayLabel: "动物人格",
    summary: "你的分身更像先想明白再进入故事的人，擅长看结构、看动机，也擅长把事情说清楚。",
    expressionStyle: "克制、清醒、有观点，不急着表态但一开口就很准。",
    tendencies: ["分析", "洞察", "追问本质"],
    values: ["理解力", "逻辑", "克制"],
    recommendedCategories: ["寓言", "神话"],
    recommendedStyles: ["知乎风", "寓言风", "悬疑风"],
    dimensionScores: {
      warmth: 48,
      action: 40,
      thinking: 93,
      expression: 68
    },
    badgeAsset: "persona-badge-owl",
    portraitAsset: "persona-portrait-owl",
    accentColor: "#6d8fb0",
    bgStyleKey: "story_sky",
    badgeStyle: "对称结构、圆眼、稳重中带一点夜色",
    portraitStyle: "夜空和书脊之间的洞察者，安静但很有存在感",
    shapeKeywords: ["对称", "圆眼", "结构稳定", "清醒"],
    doNotUse: ["写实猛禽", "惊悚眼神", "过暗的恐怖氛围"]
  },
  wolf: {
    animalType: "wolf",
    animalName: "狼",
    displayLabel: "动物人格",
    summary: "你的分身不是只在旁边看，而更像会直接闯进故事里的人，行动比犹豫更快。",
    expressionStyle: "直接、有力、边界清晰，必要时会替你先开路。",
    tendencies: ["行动", "承担冲突", "闯入故事"],
    values: ["勇气", "边界感", "果断"],
    recommendedCategories: ["神话", "童话"],
    recommendedStyles: ["暗黑风", "神话史诗风", "悬疑风"],
    dimensionScores: {
      warmth: 52,
      action: 92,
      thinking: 58,
      expression: 74
    },
    badgeAsset: "persona-badge-wolf",
    portraitAsset: "persona-portrait-wolf",
    accentColor: "#7a7f95",
    bgStyleKey: "moon_glow",
    badgeStyle: "更直的轮廓和前冲感，力量清晰",
    portraitStyle: "月色下往前迈步的守边界者，线条利落有力量",
    shapeKeywords: ["直线", "前冲", "力量", "边界"],
    doNotUse: ["血腥獠牙", "野兽化怒吼", "暗黑游戏怪物感"]
  },
  cat: {
    animalType: "cat",
    animalName: "猫",
    displayLabel: "动物人格",
    summary: "你的分身会按自己的节奏靠近故事，既有审美和直觉，也很重视边界和舒服的距离。",
    expressionStyle: "有态度但不过度热情，轻盈、挑剔、保留自己的节奏。",
    tendencies: ["按自己节奏", "直觉判断", "保持边界"],
    values: ["自我感", "审美", "自由"],
    recommendedCategories: ["童话", "寓言"],
    recommendedStyles: ["轻喜剧网感风", "知乎风", "童话风"],
    dimensionScores: {
      warmth: 56,
      action: 55,
      thinking: 66,
      expression: 80
    },
    badgeAsset: "persona-badge-cat",
    portraitAsset: "persona-portrait-cat",
    accentColor: "#987d70",
    bgStyleKey: "warm_dawn",
    badgeStyle: "干净轮廓、轻微高冷、线条简洁",
    portraitStyle: "像坐在书页边上的观察者，轻盈而有审美",
    shapeKeywords: ["简洁", "克制", "轻盈", "高冷一点"],
    doNotUse: ["卖萌宠物风", "Q版大头", "表情包式夸张五官"]
  },
  rabbit: {
    animalType: "rabbit",
    animalName: "兔子",
    displayLabel: "动物人格",
    summary: "你的分身会先被故事的氛围和情绪打动，它轻盈、敏感，也很容易在细节里看见新的入口。",
    expressionStyle: "真诚、轻快、带一点情绪波动，容易把细微感受写成句子。",
    tendencies: ["想象力", "代入感", "轻盈进入"],
    values: ["灵气", "梦感", "细微感受"],
    recommendedCategories: ["童话", "寓言"],
    recommendedStyles: ["童话风", "伤痛文学风", "轻喜剧网感风"],
    dimensionScores: {
      warmth: 82,
      action: 38,
      thinking: 49,
      expression: 78
    },
    badgeAsset: "persona-badge-rabbit",
    portraitAsset: "persona-portrait-rabbit",
    accentColor: "#c6939f",
    bgStyleKey: "forest_mist",
    badgeStyle: "耳朵轮廓最鲜明，整体更轻快柔软",
    portraitStyle: "像从故事边缘轻轻跳进来的想象力角色",
    shapeKeywords: ["轻快", "柔软", "耳朵轮廓", "梦感"],
    doNotUse: ["幼儿早教风", "糖果色过饱和", "过度拟人化表情"]
  },
  raven: {
    animalType: "raven",
    animalName: "乌鸦",
    displayLabel: "动物人格",
    summary: "你的分身会看见故事背面的代价和暗线，它并不冷漠，只是更习惯从反面理解事情。",
    expressionStyle: "锋利、冷静、有短评感，常常一语点出问题。",
    tendencies: ["反思", "看见代价", "保持距离"],
    values: ["洞察", "清醒", "黑色幽默"],
    recommendedCategories: ["寓言", "神话"],
    recommendedStyles: ["暗黑风", "知乎风", "悬疑风"],
    dimensionScores: {
      warmth: 38,
      action: 52,
      thinking: 88,
      expression: 82
    },
    badgeAsset: "persona-badge-raven",
    portraitAsset: "persona-portrait-raven",
    accentColor: "#5e6675",
    bgStyleKey: "story_sky",
    badgeStyle: "轮廓最简洁，黑白对比更干净锋利",
    portraitStyle: "冷静、清醒，像停在故事背页边缘的观察者",
    shapeKeywords: ["简洁", "锋利", "黑白对比", "冷静"],
    doNotUse: ["阴森恐怖鸟类", "写实乌鸦羽毛", "哥特惊悚风"]
  }
};

export function createAnimalPersona(
  animalType: AnimalPersona["animalType"],
  mappingReason?: string
) {
  const base = animalPersonas[animalType];

  return {
    ...base,
    mappingReason:
      mappingReason ??
      (animalType === "fox"
        ? "你更擅长先观察局势，再判断什么时候靠近，所以你的分身更像一只狐狸。"
        : animalType === "deer"
          ? "你对情绪和关系变化很敏感，也更愿意温柔地接近别人，所以你的分身更像一只鹿。"
          : animalType === "wolf"
            ? "你更像会替自己闯进故事的人，行动比犹豫更快，所以你的分身更像一只狼。"
            : animalType === "bear"
              ? "你会先想着怎么接住别人、稳住局面，所以你的分身更像一只熊。"
              : animalType === "owl"
                ? "你习惯先想明白再进入情境，所以你的分身更像一只猫头鹰。"
                : animalType === "cat"
                  ? "你更重视按自己的节奏和边界靠近世界，所以你的分身更像一只猫。"
                  : animalType === "rabbit"
                    ? "你更容易被情绪和细节打动，所以你的分身更像一只兔子。"
                    : "你会看见故事背面隐藏的代价和反差，所以你的分身更像一只乌鸦。")
  };
}

export const defaultPersona: AnimalPersona = createAnimalPersona("fox");
