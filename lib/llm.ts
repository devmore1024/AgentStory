import type { AnimalPersona } from "@/lib/animal-personas";
import type { StoryBook } from "@/lib/story-data";
import {
  getStyleInstruction,
  getStyleName,
  getStyleVariantPrompt,
  normalizeStoryContentLength,
  type StoryStyleKey
} from "@/lib/story-style";

type GeneratedStoryPayload = {
  title: string;
  excerpt: string;
  content: string;
};

type GeneratedEpisodePayload = GeneratedStoryPayload & {
  bridge?: string;
};

type GenerationMode = "short" | "serial" | "comment";

const styleSystemPrompts: Record<GenerationMode, Record<StoryStyleKey, string>> = {
  short: {
    fairy:
      "你是 AgentStory 的童话短篇写手。你擅长写有画面感、留白感和轻微奇迹感的中文故事。句子要柔和、具体、可感，不要低幼，不要像模板作文。",
    fable:
      "你是 AgentStory 的寓言短篇写手。你擅长把判断和意味藏进情节里，语言克制、短促、有余味，不要直白讲道理。",
    epic:
      "你是 AgentStory 的神话史诗短篇写手。你擅长写命运、誓言、代价和神意，但中文必须自然，不要翻译腔和空洞宏大。",
    dark:
      "你是 AgentStory 的暗黑短篇写手。你擅长写危险感、真相感和代价感，氛围冷峻但可读，不写猎奇恐怖。",
    zhihu:
      "你是 AgentStory 的知乎风短篇写手。你擅长用清醒、现代、拆解问题的方式写故事，像高质量中文长帖，但仍然是故事，不是分析报告。",
    pain:
      "你是 AgentStory 的伤痛文学风短篇写手。你擅长写错过、遗憾、迟来的看见和隐忍情绪，情绪浓度高但不要堆砌辞藻。",
    light_web:
      "你是 AgentStory 的轻喜剧网感短篇写手。你擅长写轻快、会说话、适合分享的中文故事，节奏灵动，不要玩过时网络梗。",
    suspense:
      "你是 AgentStory 的悬疑短篇写手。你擅长写线索、异样感、钩子和留白，让读者自然想继续追问。"
  },
  serial: {
    fairy:
      "你是 AgentStory 的童话连载写手。你必须保持整条连载始终温柔、轻盈、有绘本感，让不同章节像同一本故事书的连续翻页。",
    fable:
      "你是 AgentStory 的寓言连载写手。你必须保持克制判断感，让每一章都像同一条问题链继续推进，不要突然变成抒情文。",
    epic:
      "你是 AgentStory 的神话史诗连载写手。你必须让整条连载维持统一的命运感、预言感和庄重气息，但中文依然自然好读。",
    dark:
      "你是 AgentStory 的暗黑连载写手。你必须让危险和真相缓慢推进，整条连载保持冷峻一致，不要忽然变成爽文或猎奇文。",
    zhihu:
      "你是 AgentStory 的知乎风连载写手。你必须保持整条连载都像一篇持续展开的高质量中文长帖，观察清醒，拆解有力。",
    pain:
      "你是 AgentStory 的伤痛文学风连载写手。你必须让情绪线慢慢累积，统一保持隐忍、迟疑和余波感，不要忽然鸡血或热闹。",
    light_web:
      "你是 AgentStory 的轻喜剧网感连载写手。你必须保持轻快、会说话、易追更的节奏，让不同章节都像同一个分身在持续说话。",
    suspense:
      "你是 AgentStory 的悬疑连载写手。你必须保持线索推进和未解感，让每章都带一点轻钩子，但不要故弄玄虚。"
  },
  comment: {
    fairy: "你是 AgentStory 的童话感评论分身。你说话温柔、有画面感，像在轻轻接住一个故事。",
    fable: "你是 AgentStory 的寓言感评论分身。你说话简洁、有判断，但不刻薄。",
    epic: "你是 AgentStory 的史诗感评论分身。你说话会自然看到更大的命运感和结构。",
    dark: "你是 AgentStory 的暗黑感评论分身。你说话冷静，善于点出代价和真相。",
    zhihu: "你是 AgentStory 的知乎风评论分身。你说话像短评，清醒、有分析感。",
    pain: "你是 AgentStory 的伤痛文学感评论分身。你说话会抓住遗憾和余波，但不过火。",
    light_web: "你是 AgentStory 的轻喜剧网感评论分身。你说话轻快、自然、适合社交场景。",
    suspense: "你是 AgentStory 的悬疑感评论分身。你说话会保留一点疑问和没说完的意味。"
  }
};

const generationProfiles: Record<GenerationMode, Record<StoryStyleKey, { temperature: number; maxTokens: number }>> = {
  short: {
    fairy: { temperature: 0.96, maxTokens: 1000 },
    fable: { temperature: 0.82, maxTokens: 900 },
    epic: { temperature: 0.88, maxTokens: 1000 },
    dark: { temperature: 0.86, maxTokens: 950 },
    zhihu: { temperature: 0.78, maxTokens: 950 },
    pain: { temperature: 0.9, maxTokens: 1000 },
    light_web: { temperature: 1.0, maxTokens: 950 },
    suspense: { temperature: 0.9, maxTokens: 980 }
  },
  serial: {
    fairy: { temperature: 0.9, maxTokens: 1100 },
    fable: { temperature: 0.8, maxTokens: 1000 },
    epic: { temperature: 0.84, maxTokens: 1100 },
    dark: { temperature: 0.82, maxTokens: 1050 },
    zhihu: { temperature: 0.76, maxTokens: 1050 },
    pain: { temperature: 0.86, maxTokens: 1100 },
    light_web: { temperature: 0.92, maxTokens: 1050 },
    suspense: { temperature: 0.88, maxTokens: 1080 }
  },
  comment: {
    fairy: { temperature: 0.86, maxTokens: 180 },
    fable: { temperature: 0.74, maxTokens: 160 },
    epic: { temperature: 0.78, maxTokens: 180 },
    dark: { temperature: 0.76, maxTokens: 180 },
    zhihu: { temperature: 0.72, maxTokens: 180 },
    pain: { temperature: 0.82, maxTokens: 180 },
    light_web: { temperature: 0.9, maxTokens: 180 },
    suspense: { temperature: 0.8, maxTokens: 180 }
  }
};

function getChatCompletionsUrl() {
  const baseUrl = process.env.OPENAI_BASE_URL;

  if (!baseUrl) {
    return null;
  }

  const normalized = baseUrl.trim().replace(/\/$/, "");

  if (/\/chat\/completions$/i.test(normalized)) {
    return normalized;
  }

  // Accept older local env values and normalize them to the official DashScope-compatible endpoint.
  if (/coding\.dashscope\.aliyuncs\.com\/v1$/i.test(normalized)) {
    return "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
  }

  return `${normalized}/chat/completions`;
}

function cleanModelText(raw: string) {
  return raw
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

function extractJsonObject(input: string) {
  const text = cleanModelText(input);

  try {
    JSON.parse(text);
    return text;
  } catch {
    // fall through
  }

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first === -1 || last === -1 || last <= first) {
    throw new Error("No JSON object found in model response.");
  }

  const sliced = text.slice(first, last + 1);

  try {
    JSON.parse(sliced);
    return sliced;
  } catch {
    // Continue with balanced object scan.
  }

  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let index = first; index < text.length; index += 1) {
    const char = text[index];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === "{") {
        depth += 1;
      }

      if (char === "}") {
        depth -= 1;

        if (depth === 0) {
          return text.slice(first, index + 1);
        }
      }
    }
  }

  throw new Error("No complete JSON object found in model response.");
}

function extractStringField(raw: string, field: string) {
  const text = cleanModelText(raw);

  try {
    const parsed = JSON.parse(extractJsonObject(text)) as Record<string, unknown>;
    const direct = parsed[field];

    if (typeof direct === "string" && direct.trim().length > 0) {
      return direct.trim();
    }

    const nested = parsed.data;
    if (nested && typeof nested === "object") {
      const candidate = (nested as Record<string, unknown>)[field];
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        return candidate.trim();
      }
    }
  } catch {
    // continue to regex extraction
  }

  const pattern = new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  const match = pattern.exec(text);

  if (!match?.[1]) {
    return null;
  }

  try {
    return JSON.parse(`"${match[1]}"`) as string;
  } catch {
    return match[1];
  }
}

function buildJsonSystemPrompt(fields: string[]) {
  return [
    "请输出严格的 JSON 格式，不要包含任何额外文字或 markdown 代码块。",
    `格式：{${fields.map((field) => `"${field}": "..."`).join(", ")}}`,
    "重要要求：",
    "1. 必须输出完整内容，不可中途截断或省略。",
    "2. 字段值必须是完整、可直接使用的中文内容。",
    "3. 不要输出解释，不要输出额外前缀，不要输出 markdown。"
  ].join("\n");
}

async function createChatCompletion(
  messages: Array<{ role: "system" | "user"; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
) {
  const url = getChatCompletionsUrl();
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "qwen3.5-plus";

  if (!url || !apiKey) {
    throw new Error("LLM configuration is missing.");
  }

  console.log("[AgentStory][LLM] start request", {
    url,
    model,
    temperature: options?.temperature ?? 0.9,
    maxTokens: options?.maxTokens ?? 1200
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: options?.temperature ?? 0.9,
      max_tokens: options?.maxTokens ?? 1200,
      messages
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    console.error("[AgentStory][LLM] request failed", {
      url,
      model,
      status: response.status,
      body: message
    });
    throw new Error(`LLM request failed: ${response.status} ${message}`);
  }

  const json = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = json.choices?.[0]?.message?.content;

  if (!content) {
    console.error("[AgentStory][LLM] empty response", { url, model, raw: json });
    throw new Error("LLM response is empty.");
  }

  console.log("[AgentStory][LLM] request succeeded", {
    model,
    contentLength: content.length
  });

  return content;
}

export async function generateShortStoryWithLlm(params: {
  book: StoryBook;
  persona: AnimalPersona;
  styleKey: StoryStyleKey;
  triggerScene: string;
}) {
  const content = await createChatCompletion([
    {
      role: "system",
      content: `${styleSystemPrompts.short[params.styleKey]}\n\n${buildJsonSystemPrompt(["title", "excerpt", "content"])}`
    },
    {
      role: "user",
      content: [
        `故事书：${params.book.title}`,
        `故事分类：${params.book.categoryName}`,
        `触发情节：${params.triggerScene}`,
        `动物人格：${params.persona.animalName}`,
        `人格摘要：${params.persona.summary}`,
        `选定风格：${getStyleName(params.styleKey)}`,
        `风格要求：${getStyleInstruction(params.styleKey)}`,
        `风格变体：${getStyleVariantPrompt(params.styleKey, "short", `${params.book.slug}:${params.triggerScene}`)}`,
        "任务：写一篇用户分身进入经典故事后的中文短篇。",
        "要求：",
        "1. 保留原故事世界感，但必须出现“你的分身/分身”的介入。",
        "2. 写出一个清晰的切入点、一次关键互动和一个被轻微改写的结果。",
        "3. 标题 12-28 个中文字符，摘要 50-90 个中文字符，正文 300-600 个中文字符。",
        "4. 正文分 3-5 段，不要使用项目符号。",
        "5. 内容风格贴合给定风格，但仍保持 AgentStory 的温暖、可读、可分享调性。",
        "6. 不要套用固定开场白或固定结尾句，每次都要像一个新的版本。",
        "7. content 必须是一篇完整短篇，要有开头、中段和结尾。"
      ].join("\n")
    }
  ], generationProfiles.short[params.styleKey]);

  const title = extractStringField(content, "title");
  const excerpt = extractStringField(content, "excerpt");
  const storyContent = extractStringField(content, "content");

  if (!title || !excerpt || !storyContent) {
    throw new Error("LLM response JSON is missing required fields.");
  }

  return {
    title,
    excerpt,
    content: normalizeStoryContentLength(storyContent, params.styleKey)
  };
}

export async function generateCommentWithLlm(params: {
  bookTitle: string;
  storyTitle: string;
  storyExcerpt: string;
  persona: AnimalPersona;
  styleKey: StoryStyleKey;
}) {
  const content = await createChatCompletion([
    {
      role: "system",
      content: `${styleSystemPrompts.comment[params.styleKey]} 请只输出一句到两句自然中文评论，不要加引号，不要解释自己是 AI。`
    },
    {
      role: "user",
      content: [
        `故事标题：${params.storyTitle}`,
        `关联故事书：${params.bookTitle}`,
        `故事摘要：${params.storyExcerpt}`,
        `动物人格：${params.persona.animalName}`,
        `人格说明：${params.persona.summary}`,
        `表达风格：${params.persona.expressionStyle}`,
        `评论风格：${getStyleInstruction(params.styleKey)}`,
        `评论变体：${getStyleVariantPrompt(params.styleKey, "comment", `${params.bookTitle}:${params.storyTitle}`)}`,
        "要求：像“来自你的分身”的自然回应，70 字以内，有观点、有感受，不要空泛夸赞。"
      ].join("\n")
    }
  ], generationProfiles.comment[params.styleKey]);

  return content.replace(/```[\s\S]*?```/g, "").trim();
}

export async function generateSerialEpisodeWithLlm(params: {
  book: StoryBook;
  persona: AnimalPersona;
  styleKey: StoryStyleKey;
  episodeNo: number;
  threadTitle: string;
  previousEpisodeTitle?: string | null;
  previousEpisodeExcerpt?: string | null;
}) {
  const content = await createChatCompletion([
    {
      role: "system",
      content: `${styleSystemPrompts.serial[params.styleKey]}\n\n${buildJsonSystemPrompt(["title", "excerpt", "content", "bridge"])}`
    },
    {
      role: "user",
      content: [
        `连载主线：${params.threadTitle}`,
        `章节序号：第 ${params.episodeNo} 章`,
        `进入的故事书：${params.book.title}`,
        `故事分类：${params.book.categoryName}`,
        `动物人格：${params.persona.animalName}`,
        `人格摘要：${params.persona.summary}`,
        `本条连载统一风格：${getStyleName(params.styleKey)}`,
        `风格要求：${getStyleInstruction(params.styleKey)}`,
        `章节变体：${getStyleVariantPrompt(params.styleKey, "serial", `${params.threadTitle}:${params.episodeNo}`)}`,
        `上一章标题：${params.previousEpisodeTitle ?? "无"}`,
        `上一章摘要：${params.previousEpisodeExcerpt ?? "无"}`,
        "任务：写一章会继续推进的中文连载章节，让分身跨越到新的故事书里。",
        "要求：",
        "1. 要有承接上一章的过桥句 bridge，用 1-2 句概括这次如何从上个世界过渡到当前故事。",
        "2. 标题 14-32 个中文字符，摘要 50-100 个中文字符，正文 300-600 个中文字符。",
        "3. 正文分 3-5 段，不要用项目符号。",
        "4. 必须同时写出：进入方式、与角色的关键互动、当章留下的持续性问题。",
        "5. 保持 AgentStory 的温暖、可读和可追更感，不要写成设定说明。",
        "6. 风格必须与本条连载已建立的风格保持统一，不要因为换了故事书就突然换写法。",
        "7. content 必须是一章完整连载，要有承接、推进和当章收束。"
      ].join("\n")
    }
  ], generationProfiles.serial[params.styleKey]);

  const title = extractStringField(content, "title");
  const excerpt = extractStringField(content, "excerpt");
  const storyContent = extractStringField(content, "content");
  const bridge = extractStringField(content, "bridge");

  if (!title || !excerpt || !storyContent) {
    throw new Error("LLM serial episode JSON is missing required fields.");
  }

  return {
    title,
    excerpt,
    content: normalizeStoryContentLength(storyContent, params.styleKey),
    bridge: bridge || "你的分身把上一章留下的问题带进了新的故事里，于是命运又朝另一边松动了一点。"
  };
}
