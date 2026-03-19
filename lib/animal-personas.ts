export const animalTypes = [
  "bear",
  "deer",
  "fox",
  "owl",
  "wolf",
  "cat",
  "rabbit",
  "raven",
  "lion",
  "dog",
  "dolphin",
  "swan",
  "otter",
  "squirrel",
  "horse",
  "hedgehog",
  "elephant",
  "crane",
  "whale",
  "falcon"
] as const;

export type AnimalType = (typeof animalTypes)[number];

export type AnimalPersona = {
  animalType: AnimalType;
  animalName: string;
  displayLabel: string;
  summary: string;
  expressionStyle: string;
  tendencies: string[];
  values: string[];
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

type AnimalPersonaConfig = Omit<AnimalPersona, "mappingReason"> & {
  defaultMappingReason: string;
};

function createConfig(config: AnimalPersonaConfig) {
  return config;
}

export const animalPersonas: Record<AnimalType, AnimalPersonaConfig> = {
  bear: createConfig({
    animalType: "bear",
    animalName: "熊",
    displayLabel: "动物人格",
    summary: "你的分身更像一个稳稳接住别人情绪的人，进入故事时天然带着守护感。",
    expressionStyle: "温和、安稳、有耐心，不轻易尖锐。",
    tendencies: ["守护", "耐心", "稳定推进"],
    values: ["可靠", "责任感", "陪伴"],
    recommendedStyles: ["治愈日常风", "童话风", "现实主义风"],
    defaultMappingReason: "你会先想着怎么接住别人、稳住局面，所以你的分身更像一只熊。",
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
  }),
  deer: createConfig({
    animalType: "deer",
    animalName: "鹿",
    displayLabel: "动物人格",
    summary: "你的分身进入故事的方式更轻、更温柔，先感受关系和情绪，再决定怎么靠近。",
    expressionStyle: "细腻、真诚、愿意倾听，不急着把结论说满。",
    tendencies: ["共情", "细腻", "慢热靠近"],
    values: ["善意", "柔软", "理解"],
    recommendedStyles: ["诗性抒情风", "伤痛文学风", "古风诗意风"],
    defaultMappingReason: "你对情绪和关系变化很敏感，也更愿意温柔地接近别人，所以你的分身更像一只鹿。",
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
  }),
  fox: createConfig({
    animalType: "fox",
    animalName: "狐狸",
    displayLabel: "动物人格",
    summary: "你会先观察局势，再决定什么时候进入，因此你的分身像一只聪明而克制的狐狸。",
    expressionStyle: "先观察，再发言；说话有分寸，但总能点到故事关键。",
    tendencies: ["观察局势", "判断时机", "善于转圜"],
    values: ["清醒", "灵活", "不盲从"],
    recommendedStyles: ["反套路吐槽风", "寓言风", "黑色幽默风"],
    defaultMappingReason: "你更擅长先观察局势，再判断什么时候靠近，所以你的分身更像一只狐狸。",
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
  }),
  owl: createConfig({
    animalType: "owl",
    animalName: "猫头鹰",
    displayLabel: "动物人格",
    summary: "你的分身更像先想明白再进入故事的人，擅长看结构、看动机，也喜欢把未知拆成可理解的设定。",
    expressionStyle: "克制、清醒、有结构感，会用未来感设定把复杂问题说清楚。",
    tendencies: ["分析", "洞察", "拆解结构"],
    values: ["理解力", "逻辑", "秩序感"],
    recommendedStyles: ["科幻未来风", "悬疑风", "现实主义风"],
    defaultMappingReason: "你习惯先想明白再进入情境，也更容易用系统化方式理解世界，所以你的分身更像一只猫头鹰。",
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
    badgeStyle: "对称结构、圆眼、稳重中带一点未来感",
    portraitStyle: "夜空和光屏之间的洞察者，安静但很有存在感",
    shapeKeywords: ["对称", "圆眼", "结构稳定", "理性光感"],
    doNotUse: ["写实猛禽", "惊悚眼神", "过暗的恐怖氛围"]
  }),
  wolf: createConfig({
    animalType: "wolf",
    animalName: "狼",
    displayLabel: "动物人格",
    summary: "你的分身不是只在旁边看，而更像会直接闯进故事里的人，行动比犹豫更快。",
    expressionStyle: "直接、有力、边界清晰，必要时会替你先开路。",
    tendencies: ["行动", "承担冲突", "闯入故事"],
    values: ["勇气", "边界感", "果断"],
    recommendedStyles: ["暗黑风", "热血中二风", "神话史诗风"],
    defaultMappingReason: "你更像会替自己闯进故事的人，行动比犹豫更快，所以你的分身更像一只狼。",
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
  }),
  cat: createConfig({
    animalType: "cat",
    animalName: "猫",
    displayLabel: "动物人格",
    summary: "你的分身会按自己的节奏靠近故事，既有审美和直觉，也很重视边界和舒服的距离。",
    expressionStyle: "有态度但不过度热情，轻盈、挑剔、保留自己的节奏。",
    tendencies: ["按自己节奏", "直觉判断", "保持边界"],
    values: ["自我感", "审美", "自由"],
    recommendedStyles: ["诗性抒情风", "古风诗意风", "轻喜剧网感风"],
    defaultMappingReason: "你更重视按自己的节奏和边界靠近世界，所以你的分身更像一只猫。",
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
  }),
  rabbit: createConfig({
    animalType: "rabbit",
    animalName: "兔子",
    displayLabel: "动物人格",
    summary: "你的分身会先被故事的氛围和情绪打动，它轻盈、敏感，也很容易在细节里看见新的入口。",
    expressionStyle: "真诚、轻快、带一点情绪波动，容易把细微感受写成句子。",
    tendencies: ["想象力", "代入感", "轻盈进入"],
    values: ["灵气", "梦感", "细微感受"],
    recommendedStyles: ["童话风", "伤痛文学风", "古风诗意风"],
    defaultMappingReason: "你更容易被情绪和细节打动，所以你的分身更像一只兔子。",
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
  }),
  raven: createConfig({
    animalType: "raven",
    animalName: "乌鸦",
    displayLabel: "动物人格",
    summary: "你的分身会看见故事背面的代价和暗线，它并不冷漠，只是更习惯从反面理解事情。",
    expressionStyle: "锋利、冷静、有短评感，常常一语点出问题。",
    tendencies: ["反思", "看见代价", "保持距离"],
    values: ["洞察", "清醒", "黑色幽默"],
    recommendedStyles: ["悬疑风", "黑色幽默风", "反套路吐槽风"],
    defaultMappingReason: "你会看见故事背面隐藏的代价和反差，所以你的分身更像一只乌鸦。",
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
  }),
  lion: createConfig({
    animalType: "lion",
    animalName: "狮子",
    displayLabel: "动物人格",
    summary: "你的分身像站在故事中央的主将，既自带威压，也愿意在关键时刻替别人扛起局面。",
    expressionStyle: "昂扬、正面、带号召力，但不会失去分寸。",
    tendencies: ["担当", "正面迎战", "统领局势"],
    values: ["荣耀", "责任", "勇毅"],
    recommendedStyles: ["神话史诗风", "冒险成长风", "古风诗意风"],
    defaultMappingReason: "你更容易在关键时刻站到前面承担压力，也擅长让局面重新聚拢，所以你的分身更像一只狮子。",
    dimensionScores: {
      warmth: 58,
      action: 89,
      thinking: 70,
      expression: 78
    },
    badgeAsset: "persona-badge-lion",
    portraitAsset: "persona-portrait-lion",
    accentColor: "#c78c3b",
    bgStyleKey: "warm_dawn",
    badgeStyle: "鬃毛像太阳边缘，轮廓饱满而有号召感",
    portraitStyle: "像站在拂晓前线的领路者，气场强但不暴烈",
    shapeKeywords: ["鬃毛", "太阳感", "中心感", "稳重力量"],
    doNotUse: ["卡通兽王", "夸张怒吼", "过度拟真野兽感"]
  }),
  dog: createConfig({
    animalType: "dog",
    animalName: "狗",
    displayLabel: "动物人格",
    summary: "你的分身很会把人和人重新连在一起，热情、真诚，也擅长把场子重新暖起来。",
    expressionStyle: "直接、亲近、愿意回应别人，让人很快放下戒心。",
    tendencies: ["主动靠近", "照顾同伴", "把气氛带热"],
    values: ["忠诚", "真诚", "连接"],
    recommendedStyles: ["治愈日常风", "轻喜剧网感风", "沙雕搞笑风"],
    defaultMappingReason: "你更擅长把人和关系重新连起来，也愿意先迈出靠近的一步，所以你的分身更像一只狗。",
    dimensionScores: {
      warmth: 90,
      action: 74,
      thinking: 52,
      expression: 84
    },
    badgeAsset: "persona-badge-dog",
    portraitAsset: "persona-portrait-dog",
    accentColor: "#b17d5a",
    bgStyleKey: "forest_mist",
    badgeStyle: "下垂耳朵和大圆眼，亲和感很强",
    portraitStyle: "像会跑过来陪你一起解决问题的伙伴角色",
    shapeKeywords: ["圆眼", "下垂耳", "亲和", "活力"],
    doNotUse: ["宠物卖萌滤镜", "吐舌头表情包感", "过度写实犬类比例"]
  }),
  dolphin: createConfig({
    animalType: "dolphin",
    animalName: "海豚",
    displayLabel: "动物人格",
    summary: "你的分身像在现实和奇迹之间自由换气的人，敏锐、轻快，也能把场景带出一点不真实的闪光。",
    expressionStyle: "明亮、流动、带灵感跳跃感，擅长把异样写得自然。",
    tendencies: ["灵感跳跃", "感知氛围", "自然越界"],
    values: ["自由", "好奇", "连接感"],
    recommendedStyles: ["魔幻现实主义风", "诗性抒情风", "童话风"],
    defaultMappingReason: "你很擅长在现实表层下感到另一种流动和回响，也常常自然地把想象带进现场，所以你的分身更像一只海豚。",
    dimensionScores: {
      warmth: 86,
      action: 72,
      thinking: 68,
      expression: 82
    },
    badgeAsset: "persona-badge-dolphin",
    portraitAsset: "persona-portrait-dolphin",
    accentColor: "#63a6c4",
    bgStyleKey: "story_sky",
    badgeStyle: "弧线感强，像一笔跃起的水面",
    portraitStyle: "现实与海面反光叠在一起，灵动又不轻浮",
    shapeKeywords: ["弧线", "流动", "海面感", "跃起"],
    doNotUse: ["海洋馆吉祥物", "儿童科普插图", "过度卡通笑脸"]
  }),
  swan: createConfig({
    animalType: "swan",
    animalName: "天鹅",
    displayLabel: "动物人格",
    summary: "你的分身像一段被慢慢写出来的姿态，安静、优雅，也很懂得把情绪收进留白里。",
    expressionStyle: "轻柔、克制、有古典感，容易把场景写出仪式感。",
    tendencies: ["保持姿态", "收束情绪", "追求意境"],
    values: ["体面", "纯净", "审美秩序"],
    recommendedStyles: ["古风诗意风", "诗性抒情风", "伤痛文学风"],
    defaultMappingReason: "你更容易把感受收进姿态和留白里，也很在意一件事呈现出的质地，所以你的分身更像一只天鹅。",
    dimensionScores: {
      warmth: 74,
      action: 48,
      thinking: 64,
      expression: 92
    },
    badgeAsset: "persona-badge-swan",
    portraitAsset: "persona-portrait-swan",
    accentColor: "#c1a1b9",
    bgStyleKey: "moon_glow",
    badgeStyle: "颈线修长、留白多、整体像一笔连写",
    portraitStyle: "像古典长镜头里的主角剪影，优雅但不脆弱",
    shapeKeywords: ["修长", "弧颈", "留白", "古典"],
    doNotUse: ["婚庆装饰感", "过甜粉色滤镜", "低幼童画比例"]
  }),
  otter: createConfig({
    animalType: "otter",
    animalName: "水獭",
    displayLabel: "动物人格",
    summary: "你的分身很会把原本紧绷的故事场面掰松一点，聪明、会接梗，也有一种让人想继续看下去的轻巧活力。",
    expressionStyle: "机灵、顺嘴、会接住尴尬，把好笑写成一种推进力。",
    tendencies: ["会接梗", "缓和尴尬", "轻巧推进"],
    values: ["快乐", "同伴感", "灵活"],
    recommendedStyles: ["沙雕搞笑风", "轻喜剧网感风", "治愈日常风"],
    defaultMappingReason: "你很擅长把紧张和沉闷重新搅活，也常常用聪明的轻巧感把局面带开，所以你的分身更像一只水獭。",
    dimensionScores: {
      warmth: 84,
      action: 68,
      thinking: 56,
      expression: 88
    },
    badgeAsset: "persona-badge-otter",
    portraitAsset: "persona-portrait-otter",
    accentColor: "#8d775f",
    bgStyleKey: "forest_mist",
    badgeStyle: "圆脸短鼻，像正在冒头的笑意",
    portraitStyle: "带一点水纹和灵机一动的生活感，轻松又聪明",
    shapeKeywords: ["圆脸", "水纹", "短鼻", "轻快"],
    doNotUse: ["过度搞怪表情", "幼儿向萌宠风", "动作过于猴戏化"]
  }),
  squirrel: createConfig({
    animalType: "squirrel",
    animalName: "松鼠",
    displayLabel: "动物人格",
    summary: "你的分身像一颗总在路上捡到新点子的脑袋，反应快、好奇心强，也很会把细碎灵感串起来。",
    expressionStyle: "轻快、跳跃、碎片里见机灵，适合有节奏地往前带故事。",
    tendencies: ["收集线索", "多线程好奇", "快速反应"],
    values: ["灵机", "新鲜感", "行动效率"],
    recommendedStyles: ["轻喜剧网感风", "沙雕搞笑风", "冒险成长风"],
    defaultMappingReason: "你很容易从细节里捡到新的入口，也会迅速把灵感串成行动，所以你的分身更像一只松鼠。",
    dimensionScores: {
      warmth: 72,
      action: 76,
      thinking: 71,
      expression: 83
    },
    badgeAsset: "persona-badge-squirrel",
    portraitAsset: "persona-portrait-squirrel",
    accentColor: "#b07a42",
    bgStyleKey: "warm_dawn",
    badgeStyle: "尾巴轮廓醒目，整体有跳点和节奏感",
    portraitStyle: "像在树枝和书页之间快速切换视线的小策士",
    shapeKeywords: ["大尾巴", "跳点", "灵机", "轻巧"],
    doNotUse: ["仓鼠卖萌感", "儿童绘本过饱和色", "过度夸张大牙"]
  }),
  horse: createConfig({
    animalType: "horse",
    animalName: "马",
    displayLabel: "动物人格",
    summary: "你的分身像一直在往前跑的旅伴，重视方向、重视速度，也重视一路上的成长和兑现。",
    expressionStyle: "开阔、直接、有推进力，适合把长路写成真正发生的变化。",
    tendencies: ["向前赶路", "耐力推进", "认准方向"],
    values: ["自由", "成长", "韧性"],
    recommendedStyles: ["冒险成长风", "热血中二风", "神话史诗风"],
    defaultMappingReason: "你很在意方向感，也有把长线目标一步步跑出来的耐力，所以你的分身更像一匹马。",
    dimensionScores: {
      warmth: 64,
      action: 88,
      thinking: 53,
      expression: 76
    },
    badgeAsset: "persona-badge-horse",
    portraitAsset: "persona-portrait-horse",
    accentColor: "#a36c4f",
    bgStyleKey: "warm_dawn",
    badgeStyle: "面部长、轮廓流线、带奔跑感",
    portraitStyle: "像路途刚被风掀开的那一刻，开阔且有速度",
    shapeKeywords: ["流线", "长脸", "奔跑感", "开阔"],
    doNotUse: ["写实战马肌肉", "夸张英雄坐骑感", "低幼农场动物感"]
  }),
  hedgehog: createConfig({
    animalType: "hedgehog",
    animalName: "刺猬",
    displayLabel: "动物人格",
    summary: "你的分身会先把自己收好，再决定要不要靠近；它不外放，却很认真，也很懂得在真实里保护柔软。",
    expressionStyle: "克制、慢热、贴地，不夸大情绪，但能把真实写得很近。",
    tendencies: ["自我保护", "观察后靠近", "认真对待细节"],
    values: ["真实", "边界", "细小诚意"],
    recommendedStyles: ["现实主义风", "寓言风", "伤痛文学风"],
    defaultMappingReason: "你会先保护自己的边界，再决定是否靠近外界，同时又对细节和真实很敏感，所以你的分身更像一只刺猬。",
    dimensionScores: {
      warmth: 61,
      action: 36,
      thinking: 73,
      expression: 42
    },
    badgeAsset: "persona-badge-hedgehog",
    portraitAsset: "persona-portrait-hedgehog",
    accentColor: "#8f7865",
    bgStyleKey: "forest_mist",
    badgeStyle: "背刺轮廓短密，脸部收得更圆",
    portraitStyle: "像把柔软藏在壳里的现实派角色，安静但可信",
    shapeKeywords: ["短刺", "内收", "圆脸", "慢热"],
    doNotUse: ["尖刺攻击感", "过萌刺球", "卡通刺猬头套感"]
  }),
  elephant: createConfig({
    animalType: "elephant",
    animalName: "大象",
    displayLabel: "动物人格",
    summary: "你的分身很会记住真正重要的事，也更擅长把人、事和时间串成完整的脉络。",
    expressionStyle: "沉稳、宽厚、带记忆感，说话不快，但会把重点托住。",
    tendencies: ["记住来路", "稳稳承载", "看长线影响"],
    values: ["厚度", "责任", "耐心"],
    recommendedStyles: ["现实主义风", "治愈日常风", "神话史诗风"],
    defaultMappingReason: "你更擅长在漫长时间里记住真正重要的东西，也很会把复杂处境托稳，所以你的分身更像一头大象。",
    dimensionScores: {
      warmth: 80,
      action: 54,
      thinking: 82,
      expression: 57
    },
    badgeAsset: "persona-badge-elephant",
    portraitAsset: "persona-portrait-elephant",
    accentColor: "#8c96a8",
    bgStyleKey: "story_sky",
    badgeStyle: "大耳朵和额头轮廓明显，整体厚重但柔和",
    portraitStyle: "像记忆本身长出了形状，稳稳站在故事里",
    shapeKeywords: ["大耳", "厚重", "记忆感", "稳固"],
    doNotUse: ["笨重滑稽感", "马戏团视觉", "过于灰暗写实象皮"]
  }),
  crane: createConfig({
    animalType: "crane",
    animalName: "鹤",
    displayLabel: "动物人格",
    summary: "你的分身像从旧传说里走出来的见证者，安静、疏离，却能把风俗、异样和时间感轻轻带出来。",
    expressionStyle: "清冷、留白、带古意，适合把异样写得若隐若现。",
    tendencies: ["保留距离", "感知旧规矩", "把异样留在空气里"],
    values: ["节制", "古意", "长久感"],
    recommendedStyles: ["民俗怪谈风", "古风诗意风", "魔幻现实主义风"],
    defaultMappingReason: "你对旧秩序、时间感和细微异样都很敏锐，也更擅长把它们写成留白，所以你的分身更像一只鹤。",
    dimensionScores: {
      warmth: 63,
      action: 40,
      thinking: 85,
      expression: 70
    },
    badgeAsset: "persona-badge-crane",
    portraitAsset: "persona-portrait-crane",
    accentColor: "#8da0a4",
    bgStyleKey: "moon_glow",
    badgeStyle: "长腿长喙，线条更疏朗，像留白中的一笔",
    portraitStyle: "像立在雾边的旧传闻，安静却带异样气场",
    shapeKeywords: ["长喙", "长颈", "疏朗", "清冷"],
    doNotUse: ["水墨老年表情包感", "过度仙气滤镜", "动物园科普插图感"]
  }),
  whale: createConfig({
    animalType: "whale",
    animalName: "鲸",
    displayLabel: "动物人格",
    summary: "你的分身像深海里缓慢但巨大的情绪体，表面平静，内部却有非常长的回声。",
    expressionStyle: "深缓、沉静、带回声感，适合把现实写出超现实的余震。",
    tendencies: ["深层感受", "慢速消化", "长回声表达"],
    values: ["宽阔", "耐受", "深度"],
    recommendedStyles: ["魔幻现实主义风", "伤痛文学风", "诗性抒情风"],
    defaultMappingReason: "你习惯在很深的地方感受问题，也更擅长把平静表面下的巨大回声写出来，所以你的分身更像一只鲸。",
    dimensionScores: {
      warmth: 78,
      action: 34,
      thinking: 84,
      expression: 61
    },
    badgeAsset: "persona-badge-whale",
    portraitAsset: "persona-portrait-whale",
    accentColor: "#648ba6",
    bgStyleKey: "story_sky",
    badgeStyle: "大弧面与尾鳍轮廓，整体像深海中的一口气",
    portraitStyle: "像海面下缓慢游过的情绪体，巨大但安静",
    shapeKeywords: ["弧面", "深海", "尾鳍", "回声"],
    doNotUse: ["儿童海洋馆风", "过度卡通喷泉", "怪兽化巨物感"]
  }),
  falcon: createConfig({
    animalType: "falcon",
    animalName: "猎鹰",
    displayLabel: "动物人格",
    summary: "你的分身像高处俯冲下来的执行者，判断快、出手准，也能在瞬间看清最该切入的位置。",
    expressionStyle: "利落、集中、目标明确，适合写高压场面和燃点。",
    tendencies: ["快速锁定", "精准切入", "高压执行"],
    values: ["效率", "专注", "胜负感"],
    recommendedStyles: ["热血中二风", "科幻未来风", "悬疑风"],
    defaultMappingReason: "你很会快速锁定关键点，也常常在别人还犹豫时先完成切入，所以你的分身更像一只猎鹰。",
    dimensionScores: {
      warmth: 46,
      action: 71,
      thinking: 90,
      expression: 63
    },
    badgeAsset: "persona-badge-falcon",
    portraitAsset: "persona-portrait-falcon",
    accentColor: "#6f7e9a",
    bgStyleKey: "moon_glow",
    badgeStyle: "喙和翼角更利落，方向感非常明确",
    portraitStyle: "像从高空一眼看清战局的执行者，锐利但不失控",
    shapeKeywords: ["俯冲", "尖喙", "锐角", "目标感"],
    doNotUse: ["军事徽章化", "血腥猛禽感", "过度写实猎隼羽毛"]
  })
};

export function createAnimalPersona(animalType: AnimalType, mappingReason?: string): AnimalPersona {
  const base = animalPersonas[animalType];

  return {
    ...base,
    mappingReason: mappingReason ?? base.defaultMappingReason
  };
}

export const defaultPersona: AnimalPersona = createAnimalPersona("fox");
