import { createAnimalPersona, type AnimalPersona } from "@/lib/animal-personas";

type SecondMeShade = {
  shadeName?: string;
  shadeDescription?: string;
  shadeContent?: string;
  sourceTopics?: string[];
  confidenceLevel?: string;
  shadeDescriptionThirdView?: string;
  shadeContentThirdView?: string;
  shadeNamePublic?: string;
  shadeDescriptionPublic?: string;
  shadeContentPublic?: string;
  sourceTopicsPublic?: string[];
};

type SecondMeSoftMemory = {
  factObject?: string;
  factContent?: string;
};

type SecondMeUserInfo = {
  userId: string;
  name: string;
  avatar?: string | null;
  bio?: string | null;
  selfIntroduction?: string | null;
};

type AnimalType = AnimalPersona["animalType"];
type MbtiType =
  | "INTJ"
  | "INTP"
  | "ENTJ"
  | "ENTP"
  | "INFJ"
  | "INFP"
  | "ENFJ"
  | "ENFP"
  | "ISTJ"
  | "ISFJ"
  | "ESTJ"
  | "ESFJ"
  | "ISTP"
  | "ISFP"
  | "ESTP"
  | "ESFP";

type MbtiSignalSet = {
  positive: Array<[string, number]>;
  negative: Array<[string, number]>;
};

type MbtiInference = {
  candidate: MbtiType | null;
  confidence: number;
  evidence: string[];
  source: "explicit" | "semantic" | "none";
};

const animalTypes: AnimalType[] = ["bear", "deer", "fox", "owl", "wolf", "cat", "rabbit", "raven"];
const mbtiTypes: MbtiType[] = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP"
];

const animalKeywordWeights: Record<AnimalType, Array<[string, number]>> = {
  bear: [
    ["守护", 3],
    ["稳定", 3],
    ["可靠", 3],
    ["责任", 2],
    ["陪伴", 2],
    ["耐心", 2],
    ["steady", 2],
    ["reliable", 2],
    ["support", 2],
    ["protect", 2]
  ],
  deer: [
    ["温柔", 3],
    ["细腻", 3],
    ["善意", 2],
    ["共情", 3],
    ["治愈", 2],
    ["柔软", 2],
    ["gentle", 2],
    ["empathetic", 2],
    ["kind", 2],
    ["healing", 2]
  ],
  fox: [
    ["观察", 3],
    ["策略", 3],
    ["机敏", 3],
    ["判断", 2],
    ["转圜", 2],
    ["好奇", 2],
    ["strategy", 3],
    ["curious", 2],
    ["adapt", 2],
    ["clever", 2]
  ],
  owl: [
    ["理性", 3],
    ["分析", 3],
    ["洞察", 3],
    ["理解", 2],
    ["抽象", 2],
    ["思考", 2],
    ["rational", 3],
    ["analysis", 3],
    ["insight", 3],
    ["think", 2]
  ],
  wolf: [
    ["行动", 3],
    ["果断", 3],
    ["勇气", 2],
    ["对抗", 2],
    ["边界", 2],
    ["承担", 2],
    ["action", 3],
    ["decisive", 3],
    ["courage", 2],
    ["drive", 2]
  ],
  cat: [
    ["独立", 3],
    ["边界", 2],
    ["审美", 3],
    ["直觉", 2],
    ["自我", 2],
    ["细节", 2],
    ["independent", 3],
    ["aesthetic", 3],
    ["taste", 2],
    ["intuition", 2]
  ],
  rabbit: [
    ["敏感", 3],
    ["想象", 3],
    ["梦", 2],
    ["轻盈", 2],
    ["情绪", 2],
    ["灵气", 2],
    ["sensitive", 3],
    ["imagination", 3],
    ["emotion", 2],
    ["dream", 2]
  ],
  raven: [
    ["冷静", 3],
    ["锋利", 3],
    ["反思", 3],
    ["代价", 2],
    ["距离", 2],
    ["黑色幽默", 2],
    ["sharp", 3],
    ["reflect", 3],
    ["distance", 2],
    ["dark humor", 2]
  ]
};

const mbtiDimensionSignals: Record<"EI" | "SN" | "TF" | "JP", MbtiSignalSet> = {
  EI: {
    positive: [
      ["社交", 3],
      ["表达", 2],
      ["互动", 2],
      ["热闹", 2],
      ["外向", 3],
      ["带动", 2],
      ["主动沟通", 2],
      ["outgoing", 3],
      ["social", 2],
      ["expressive", 2]
    ],
    negative: [
      ["独处", 3],
      ["安静", 2],
      ["观察", 2],
      ["内省", 3],
      ["克制", 2],
      ["深入", 2],
      ["独立", 2],
      ["introvert", 3],
      ["quiet", 2],
      ["introspective", 3]
    ]
  },
  SN: {
    positive: [
      ["具体", 3],
      ["现实", 3],
      ["细节", 2],
      ["经验", 2],
      ["实际", 2],
      ["稳定", 2],
      ["落地", 2],
      ["practical", 3],
      ["detail", 2],
      ["realistic", 3]
    ],
    negative: [
      ["想象", 3],
      ["抽象", 3],
      ["联想", 2],
      ["可能", 2],
      ["未来", 2],
      ["隐喻", 2],
      ["洞察", 2],
      ["imagination", 3],
      ["abstract", 3],
      ["possibility", 2]
    ]
  },
  TF: {
    positive: [
      ["理性", 3],
      ["逻辑", 3],
      ["分析", 3],
      ["判断", 2],
      ["客观", 2],
      ["拆解", 2],
      ["rational", 3],
      ["logical", 3],
      ["analysis", 3],
      ["objective", 2]
    ],
    negative: [
      ["共情", 3],
      ["温柔", 2],
      ["善意", 2],
      ["感受", 3],
      ["理解", 2],
      ["治愈", 2],
      ["empathetic", 3],
      ["gentle", 2],
      ["feeling", 3],
      ["kind", 2]
    ]
  },
  JP: {
    positive: [
      ["计划", 3],
      ["秩序", 3],
      ["责任", 2],
      ["果断", 2],
      ["稳定推进", 2],
      ["收束", 2],
      ["planned", 3],
      ["structured", 3],
      ["decisive", 2],
      ["organized", 3]
    ],
    negative: [
      ["灵活", 3],
      ["探索", 2],
      ["即兴", 3],
      ["转圜", 2],
      ["好奇", 2],
      ["开放", 2],
      ["flexible", 3],
      ["spontaneous", 3],
      ["curious", 2],
      ["open-ended", 2]
    ]
  }
};

const exactMbtiAnimalBoosts: Record<string, Array<[AnimalType, number]>> = {
  NF: [
    ["deer", 14],
    ["rabbit", 12]
  ],
  NT: [
    ["owl", 14],
    ["raven", 12]
  ],
  SJ: [
    ["bear", 14]
  ],
  SP: [
    ["cat", 12],
    ["fox", 10]
  ],
  NJ: [
    ["owl", 12],
    ["wolf", 10]
  ],
  TP: [
    ["fox", 12],
    ["raven", 10]
  ],
  FJ: [
    ["deer", 12],
    ["bear", 10]
  ],
  TJ: [
    ["wolf", 12],
    ["owl", 10]
  ]
};

const letterAnimalBoosts: Record<string, Array<[AnimalType, number]>> = {
  E: [
    ["fox", 3],
    ["wolf", 3]
  ],
  I: [
    ["owl", 3],
    ["cat", 2],
    ["raven", 2]
  ],
  S: [
    ["bear", 3],
    ["cat", 2]
  ],
  N: [
    ["owl", 2],
    ["rabbit", 2],
    ["raven", 2]
  ],
  T: [
    ["owl", 3],
    ["raven", 3],
    ["wolf", 2]
  ],
  F: [
    ["deer", 3],
    ["bear", 2],
    ["rabbit", 3]
  ],
  J: [
    ["bear", 2],
    ["wolf", 3],
    ["owl", 2]
  ],
  P: [
    ["fox", 3],
    ["cat", 2],
    ["rabbit", 2]
  ]
};

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0);
}

function countOccurrences(text: string, keyword: string) {
  if (!keyword || !text) {
    return 0;
  }

  let count = 0;
  let cursor = 0;

  while (cursor < text.length) {
    const foundAt = text.indexOf(keyword, cursor);

    if (foundAt === -1) {
      break;
    }

    count += 1;
    cursor = foundAt + keyword.length;
  }

  return count;
}

function collectText(input: {
  userInfo: SecondMeUserInfo;
  shades: SecondMeShade[];
  softMemory: SecondMeSoftMemory[];
}) {
  return [
    input.userInfo.name,
    input.userInfo.bio,
    input.userInfo.selfIntroduction,
    ...input.shades.flatMap((shade) => [
      shade.shadeName,
      shade.shadeDescription,
      shade.shadeContent,
      shade.shadeDescriptionThirdView,
      shade.shadeContentThirdView,
      shade.shadeNamePublic,
      shade.shadeDescriptionPublic,
      shade.shadeContentPublic,
      ...(shade.sourceTopics ?? []),
      ...(shade.sourceTopicsPublic ?? [])
    ]),
    ...input.softMemory.flatMap((item) => [item.factObject, item.factContent])
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
}

function scoreWeightedKeywords(text: string, pairs: Array<[string, number]>) {
  let score = 0;
  const matched: string[] = [];

  for (const [keyword, weight] of pairs) {
    const occurrences = countOccurrences(text, keyword.toLowerCase());

    if (occurrences > 0) {
      score += weight * occurrences;
      matched.push(keyword);
    }
  }

  return {
    score,
    matched
  };
}

function scoreAnimals(text: string) {
  const scores = new Map<AnimalType, number>();
  const evidence = new Map<AnimalType, string[]>();

  for (const animalType of animalTypes) {
    const result = scoreWeightedKeywords(text, animalKeywordWeights[animalType]);
    scores.set(animalType, result.score);
    evidence.set(animalType, result.matched);
  }

  return { scores, evidence };
}

function detectExplicitMbti(text: string): MbtiInference | null {
  const match = text.match(/\b(intj|intp|entj|entp|infj|infp|enfj|enfp|istj|isfj|estj|esfj|istp|isfp|estp|esfp)\b/i);

  if (!match) {
    return null;
  }

  return {
    candidate: match[1].toUpperCase() as MbtiType,
    confidence: 96,
    evidence: [match[1].toUpperCase()],
    source: "explicit"
  };
}

function inferSemanticMbti(text: string): MbtiInference {
  const dimensions = [
    {
      key: "EI" as const,
      positiveLetter: "E",
      negativeLetter: "I"
    },
    {
      key: "SN" as const,
      positiveLetter: "S",
      negativeLetter: "N"
    },
    {
      key: "TF" as const,
      positiveLetter: "T",
      negativeLetter: "F"
    },
    {
      key: "JP" as const,
      positiveLetter: "J",
      negativeLetter: "P"
    }
  ];

  const letters: string[] = [];
  const evidence: string[] = [];
  let totalSignal = 0;
  let totalMargin = 0;

  for (const dimension of dimensions) {
    const signalSet = mbtiDimensionSignals[dimension.key];
    const positive = scoreWeightedKeywords(text, signalSet.positive);
    const negative = scoreWeightedKeywords(text, signalSet.negative);
    const margin = Math.abs(positive.score - negative.score);

    totalSignal += positive.score + negative.score;
    totalMargin += margin;

    if (positive.score >= negative.score) {
      letters.push(dimension.positiveLetter);
      evidence.push(...positive.matched.slice(0, 2));
    } else {
      letters.push(dimension.negativeLetter);
      evidence.push(...negative.matched.slice(0, 2));
    }
  }

  if (totalSignal <= 0) {
    return {
      candidate: null,
      confidence: 0,
      evidence: [],
      source: "none"
    };
  }

  const candidate = letters.join("") as MbtiType;
  const confidence = Math.max(54, Math.min(88, 50 + totalMargin * 2 + Math.min(totalSignal, 10)));

  return {
    candidate: mbtiTypes.includes(candidate) ? candidate : null,
    confidence,
    evidence: Array.from(new Set(evidence)).slice(0, 6),
    source: "semantic"
  };
}

function inferMbti(text: string) {
  const explicit = detectExplicitMbti(text);

  if (explicit) {
    return explicit;
  }

  return inferSemanticMbti(text);
}

function createScoreMap() {
  return new Map<AnimalType, number>(animalTypes.map((animalType) => [animalType, 0]));
}

function addBoost(boosts: Map<AnimalType, number>, animalType: AnimalType, amount: number) {
  boosts.set(animalType, (boosts.get(animalType) ?? 0) + amount);
}

function getMbtiBoostMultiplier(mbti: MbtiInference) {
  if (mbti.source === "explicit") {
    return 1.35;
  }

  if (mbti.confidence >= 82) {
    return 1.15;
  }

  if (mbti.confidence >= 68) {
    return 0.85;
  }

  return 0.45;
}

function getMbtiAnimalBoosts(mbti: MbtiInference) {
  const boosts = createScoreMap();

  if (!mbti.candidate) {
    return boosts;
  }

  const multiplier = getMbtiBoostMultiplier(mbti);
  const [eOrI, sOrN, tOrF, jOrP] = mbti.candidate.split("");
  const combos = [`${sOrN}${tOrF}`, `${sOrN}${jOrP}`, `${tOrF}${jOrP}`];

  for (const combo of combos) {
    for (const [animalType, base] of exactMbtiAnimalBoosts[combo] ?? []) {
      addBoost(boosts, animalType, Math.round(base * multiplier));
    }
  }

  for (const letter of [eOrI, sOrN, tOrF, jOrP]) {
    for (const [animalType, base] of letterAnimalBoosts[letter] ?? []) {
      addBoost(boosts, animalType, Math.round(base * multiplier));
    }
  }

  return boosts;
}

function combineScores(baseScores: Map<AnimalType, number>, boostScores: Map<AnimalType, number>) {
  const totalScores = createScoreMap();

  for (const animalType of animalTypes) {
    totalScores.set(animalType, (baseScores.get(animalType) ?? 0) + (boostScores.get(animalType) ?? 0));
  }

  return totalScores;
}

function fallbackAnimalType(seed: string): AnimalType {
  return animalTypes[hashString(seed) % animalTypes.length];
}

function pickAnimalType(totalScores: Map<AnimalType, number>, seed: string) {
  const ranking = Array.from(totalScores.entries()).sort((a, b) => b[1] - a[1]);
  const winner = ranking[0];

  if (!winner || winner[1] <= 0) {
    return {
      animalType: fallbackAnimalType(seed),
      ranking,
      usedFallback: true
    };
  }

  return {
    animalType: winner[0],
    ranking,
    usedFallback: false
  };
}

function createMappingReason(params: {
  animalType: AnimalType;
  animalEvidence: string[];
  mbti: MbtiInference;
  usedFallback: boolean;
}) {
  if (params.usedFallback) {
    return `你的 SecondMe 资料里可直接映射的人格线索还不多，当前先根据已有资料的整体气质为你生成了更稳定的「${createAnimalPersona(params.animalType).animalName}」动物人格。`;
  }

  const evidence = Array.from(new Set([...params.animalEvidence.slice(0, 3), ...params.mbti.evidence.slice(0, 3)])).slice(0, 3);

  if (evidence.length > 0) {
    return `系统从你的 SecondMe 资料里识别到「${evidence.join("、")}」等特征，因此当前更接近「${createAnimalPersona(params.animalType).animalName}」动物人格。`;
  }

  return createAnimalPersona(params.animalType).mappingReason;
}

function calculateConfidenceScore(params: {
  ranking: Array<[AnimalType, number]>;
  mbti: MbtiInference;
  usedFallback: boolean;
}) {
  if (params.usedFallback) {
    return 58;
  }

  const winner = params.ranking[0];
  const runnerUp = params.ranking[1];
  const winnerScore = winner?.[1] ?? 0;
  const runnerUpScore = runnerUp?.[1] ?? 0;
  const mbtiBonus = params.mbti.candidate ? Math.min(8, Math.round(params.mbti.confidence / 14)) : 0;
  const gapPenalty = Math.max(0, Math.min(12, runnerUpScore - winnerScore + 6));
  const baseScore = 60 + Math.min(22, winnerScore * 2) + mbtiBonus;

  return Math.max(56, Math.min(95, baseScore - gapPenalty));
}

export function mapSecondMeProfileToPersona(input: {
  userInfo: SecondMeUserInfo;
  shades: SecondMeShade[];
  softMemory: SecondMeSoftMemory[];
}) {
  const text = collectText(input);
  const mbti = inferMbti(text);
  const animalScores = scoreAnimals(text);
  const mbtiBoosts = getMbtiAnimalBoosts(mbti);
  const totalScores = combineScores(animalScores.scores, mbtiBoosts);
  const picked = pickAnimalType(totalScores, [input.userInfo.userId, input.userInfo.name, text].filter(Boolean).join("|"));
  const mappingReason = createMappingReason({
    animalType: picked.animalType,
    animalEvidence: animalScores.evidence.get(picked.animalType) ?? [],
    mbti,
    usedFallback: picked.usedFallback
  });
  const persona = createAnimalPersona(picked.animalType, mappingReason);
  const confidenceScore = calculateConfidenceScore({
    ranking: picked.ranking,
    mbti,
    usedFallback: picked.usedFallback
  });

  return {
    persona,
    confidenceScore,
    mappingVersion: "secondme-v3",
    mappingReason,
    mbtiCandidate: mbti.candidate,
    mbtiConfidence: mbti.confidence,
    mbtiEvidence: mbti.evidence,
    rawSecondMeProfile: {
      ...input,
      _agentstory: {
        mappingVersion: "secondme-v3",
        mbtiCandidate: mbti.candidate,
        mbtiConfidence: mbti.confidence,
        mbtiEvidence: mbti.evidence,
        mbtiSource: mbti.source
      }
    }
  };
}
