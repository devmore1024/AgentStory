import OpenAI from "openai";
import type { AnimalPersona } from "@/lib/animal-personas";
import type { SecondMeStoryContext } from "@/lib/secondme-story-context";
import type { StoryBook } from "@/lib/story-data";
import { formatEpisodeOrdinal } from "@/lib/story-experience-helpers";
import {
  getStyleInstruction,
  getStyleName,
  getStyleVariantPrompt,
  normalizeStoryContentLength,
  type StoryStyleKey
} from "@/lib/story-style";
import type { ZhihuReferencePack } from "@/lib/zhihu-references";

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
      "你是 AgentStory 的中文故事写手。你会吸收一组知乎参考内容的观察方式，再把它写成完整故事。",
    pain:
      "你是 AgentStory 的伤痛文学风短篇写手。你擅长写错过、遗憾、迟来的看见和隐忍情绪，情绪浓度高但不要堆砌辞藻。",
    light_web:
      "你是 AgentStory 的轻喜剧网感短篇写手。你擅长写轻快、会说话、适合分享的中文故事，节奏灵动，不要玩过时网络梗。",
    suspense:
      "你是 AgentStory 的悬疑短篇写手。你擅长写线索、异样感、钩子和留白，让读者自然想继续追问。",
    healing_daily:
      "你是 AgentStory 的治愈日常短篇写手。你擅长把温柔和修复感写进日常细节，节奏松弛但不松散。",
    black_humor:
      "你是 AgentStory 的黑色幽默短篇写手。你擅长写荒诞、反差和冷面幽默，但仍然让人物真实可感。",
    folklore:
      "你是 AgentStory 的民俗怪谈短篇写手。你擅长写旧规矩、异闻、禁忌和夜色里的微妙异样感，但不要写成纯恐怖故事。",
    growth:
      "你是 AgentStory 的冒险成长短篇写手。你擅长写选择、试错、向前走和人物真正发生变化的过程。",
    lyrical:
      "你是 AgentStory 的诗性抒情短篇写手。你擅长让画面、情绪和节奏彼此映照，语言有余韵但不空泛。",
    classical_poetic:
      "你是 AgentStory 的古风诗意短篇写手。你擅长用自然的中文写出古典意境、节制美感和景物余韵，但不要写成生硬古文。",
    realist:
      "你是 AgentStory 的现实主义短篇写手。你擅长写真实处境、克制表达和可信的人性反应，不故作深沉。",
    magic_realism:
      "你是 AgentStory 的魔幻现实主义短篇写手。你擅长让异样自然混入日常现实，让荒诞和真实并排成立。",
    sci_future:
      "你是 AgentStory 的科幻未来短篇写手。你擅长把未来城市、科技装置、系统界面和时空工程写进故事现场，但设定始终服务人物选择。",
    hotblooded:
      "你是 AgentStory 的热血中二短篇写手。你擅长写宣言、羁绊、对抗和命运感，让燃点真正落地。",
    meta_roast:
      "你是 AgentStory 的反套路吐槽短篇写手。你擅长聪明地拆招、吐槽和反转剧情，但始终留在故事现场里推进。",
    absurd_comedy:
      "你是 AgentStory 的沙雕搞笑短篇写手。你擅长写荒诞反差、无厘头节奏和连锁失控，但角色仍然要真实可感。"
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
      "你是 AgentStory 的中文连载写手。你会先吸收知乎参考内容里的问题意识和观察结构，再把它写成统一的故事主线。",
    pain:
      "你是 AgentStory 的伤痛文学风连载写手。你必须让情绪线慢慢累积，统一保持隐忍、迟疑和余波感，不要忽然鸡血或热闹。",
    light_web:
      "你是 AgentStory 的轻喜剧网感连载写手。你必须保持轻快、会说话、易追更的节奏，让不同章节都像同一个“我”在持续说话。",
    suspense:
      "你是 AgentStory 的悬疑连载写手。你必须保持线索推进和未解感，让每章都带一点轻钩子，但不要故弄玄虚。",
    healing_daily:
      "你是 AgentStory 的治愈日常连载写手。你必须把关系修复、慢慢靠近和生活气维持成统一的连续节奏。",
    black_humor:
      "你是 AgentStory 的黑色幽默连载写手。你必须保持荒诞反差和冷面观察一致，让笑意和刺痛一起推进。",
    folklore:
      "你是 AgentStory 的民俗怪谈连载写手。你必须让整条连载都带着旧规矩、传闻和异样气场，但仍要清晰好读。",
    growth:
      "你是 AgentStory 的冒险成长连载写手。你必须让每一章都推动人物往前走，让成长和冒险互相牵引。",
    lyrical:
      "你是 AgentStory 的诗性抒情连载写手。你必须让章节之间保持同一种回声感、画面感和情绪波纹。",
    classical_poetic:
      "你是 AgentStory 的古风诗意连载写手。你必须让整条连载保持古典语感、景物意境和节制的情绪表达。",
    realist:
      "你是 AgentStory 的现实主义连载写手。你必须让整条连载保持可信的人物动机、生活逻辑和克制表达。",
    magic_realism:
      "你是 AgentStory 的魔幻现实主义连载写手。你必须让现实与异样持续并行，让超现实纹理像日常空气一样稳定存在。",
    sci_future:
      "你是 AgentStory 的科幻未来连载写手。你必须让未来背景、科技装置和系统规则持续影响人物选择，并保持设定统一。",
    hotblooded:
      "你是 AgentStory 的热血中二连载写手。你必须让整条连载保持燃点、宣言感、对抗推进和命运压力。",
    meta_roast:
      "你是 AgentStory 的反套路吐槽连载写手。你必须持续保留拆套路和会心吐槽的能力，但不让剧情失去沉浸感。",
    absurd_comedy:
      "你是 AgentStory 的沙雕搞笑连载写手。你必须让每章都维持荒诞节奏和反差喜感，同时让角色关系继续往前走。"
  },
  comment: {
    fairy: "你是 AgentStory 的童话感评论写手。你说话温柔、有画面感，像在轻轻接住一个故事。",
    fable: "你是 AgentStory 的寓言感评论写手。你说话简洁、有判断，但不刻薄。",
    epic: "你是 AgentStory 的史诗感评论写手。你说话会自然看到更大的命运感和结构。",
    dark: "你是 AgentStory 的暗黑感评论写手。你说话冷静，善于点出代价和真相。",
    zhihu: "你是 AgentStory 的知乎风评论写手。你说话像短评，清醒、有分析感。",
    pain: "你是 AgentStory 的伤痛文学感评论写手。你说话会抓住遗憾和余波，但不过火。",
    light_web: "你是 AgentStory 的轻喜剧网感评论写手。你说话轻快、自然、适合社交场景。",
    suspense: "你是 AgentStory 的悬疑感评论写手。你说话会保留一点疑问和没说完的意味。",
    healing_daily: "你是 AgentStory 的治愈日常感评论写手。你说话温柔、松弛，像一句能让人缓下来的陪伴。",
    black_humor: "你是 AgentStory 的黑色幽默感评论写手。你说话冷静、带一点辛辣，但不恶毒。",
    folklore: "你是 AgentStory 的民俗怪谈感评论写手。你说话像补上一句旧传闻，留一点异样和回味。",
    growth: "你是 AgentStory 的冒险成长感评论写手。你说话会自然点出变化、勇气和下一步。",
    lyrical: "你是 AgentStory 的诗性抒情感评论写手。你说话有一点回声感和画面感，但不空泛。",
    classical_poetic: "你是 AgentStory 的古风诗意感评论写手。你说话雅致、留白、带古典意境。",
    realist: "你是 AgentStory 的现实主义感评论写手。你说话克制、平静，像一句真实的判断。",
    magic_realism: "你是 AgentStory 的魔幻现实主义感评论写手。你说话像在现实里看见另一层异样纹理。",
    sci_future: "你是 AgentStory 的科幻未来感评论写手。你说话冷静，带一点未来背景和系统感。",
    hotblooded: "你是 AgentStory 的热血中二感评论写手。你说话会点燃信念、勇气和出手时刻。",
    meta_roast: "你是 AgentStory 的反套路吐槽感评论写手。你说话聪明、会拆招，也会轻轻吐槽。",
    absurd_comedy: "你是 AgentStory 的沙雕搞笑感评论写手。你说话有荒诞节奏和反差喜感，但不过火。"
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
    suspense: { temperature: 0.9, maxTokens: 980 },
    healing_daily: { temperature: 0.9, maxTokens: 980 },
    black_humor: { temperature: 0.88, maxTokens: 960 },
    folklore: { temperature: 0.86, maxTokens: 980 },
    growth: { temperature: 0.9, maxTokens: 1000 },
    lyrical: { temperature: 0.94, maxTokens: 1000 },
    classical_poetic: { temperature: 0.9, maxTokens: 1000 },
    realist: { temperature: 0.78, maxTokens: 980 },
    magic_realism: { temperature: 0.9, maxTokens: 1000 },
    sci_future: { temperature: 0.86, maxTokens: 1020 },
    hotblooded: { temperature: 0.94, maxTokens: 1000 },
    meta_roast: { temperature: 0.92, maxTokens: 980 },
    absurd_comedy: { temperature: 0.98, maxTokens: 980 }
  },
  serial: {
    fairy: { temperature: 0.9, maxTokens: 1100 },
    fable: { temperature: 0.8, maxTokens: 1000 },
    epic: { temperature: 0.84, maxTokens: 1100 },
    dark: { temperature: 0.82, maxTokens: 1050 },
    zhihu: { temperature: 0.76, maxTokens: 1050 },
    pain: { temperature: 0.86, maxTokens: 1100 },
    light_web: { temperature: 0.92, maxTokens: 1050 },
    suspense: { temperature: 0.88, maxTokens: 1080 },
    healing_daily: { temperature: 0.86, maxTokens: 1080 },
    black_humor: { temperature: 0.84, maxTokens: 1050 },
    folklore: { temperature: 0.84, maxTokens: 1080 },
    growth: { temperature: 0.88, maxTokens: 1100 },
    lyrical: { temperature: 0.9, maxTokens: 1080 },
    classical_poetic: { temperature: 0.86, maxTokens: 1080 },
    realist: { temperature: 0.74, maxTokens: 1050 },
    magic_realism: { temperature: 0.88, maxTokens: 1100 },
    sci_future: { temperature: 0.82, maxTokens: 1120 },
    hotblooded: { temperature: 0.9, maxTokens: 1100 },
    meta_roast: { temperature: 0.88, maxTokens: 1050 },
    absurd_comedy: { temperature: 0.96, maxTokens: 1050 }
  },
  comment: {
    fairy: { temperature: 0.86, maxTokens: 180 },
    fable: { temperature: 0.74, maxTokens: 160 },
    epic: { temperature: 0.78, maxTokens: 180 },
    dark: { temperature: 0.76, maxTokens: 180 },
    zhihu: { temperature: 0.72, maxTokens: 180 },
    pain: { temperature: 0.82, maxTokens: 180 },
    light_web: { temperature: 0.9, maxTokens: 180 },
    suspense: { temperature: 0.8, maxTokens: 180 },
    healing_daily: { temperature: 0.78, maxTokens: 180 },
    black_humor: { temperature: 0.76, maxTokens: 180 },
    folklore: { temperature: 0.78, maxTokens: 180 },
    growth: { temperature: 0.8, maxTokens: 180 },
    lyrical: { temperature: 0.84, maxTokens: 180 },
    classical_poetic: { temperature: 0.8, maxTokens: 180 },
    realist: { temperature: 0.7, maxTokens: 180 },
    magic_realism: { temperature: 0.82, maxTokens: 180 },
    sci_future: { temperature: 0.74, maxTokens: 180 },
    hotblooded: { temperature: 0.88, maxTokens: 180 },
    meta_roast: { temperature: 0.84, maxTokens: 180 },
    absurd_comedy: { temperature: 0.92, maxTokens: 180 }
  }
};

function getOpenAIBaseUrl() {
  const baseUrl = process.env.OPENAI_BASE_URL;

  if (!baseUrl) {
    return null;
  }

  return baseUrl.trim().replace(/\/$/, "");
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

function buildSecondMeContextPrompt(secondMeContext: SecondMeStoryContext) {
  const shadeLines = secondMeContext.shades
    .slice(0, 5)
    .map((shade, index) => {
      const topics = shade.sourceTopics?.length ? `（来源主题：${shade.sourceTopics.join("、")}）` : "";
      return `${index + 1}. ${shade.shadeName ?? "未命名兴趣"}：${shade.shadeDescription ?? shade.shadeContent ?? "暂无描述"}${topics}`;
    });
  const memoryLines = secondMeContext.softMemory
    .slice(0, 8)
    .map((memory, index) => `${index + 1}. ${memory.factObject ?? "记忆"}：${memory.factContent ?? "暂无内容"}`);

  return [
    `SecondMe 上下文来源：${secondMeContext.source}`,
    `用户姓名：${secondMeContext.userInfo.name}`,
    `个人简介：${secondMeContext.userInfo.bio ?? "暂无"}`,
    `自我介绍：${secondMeContext.userInfo.selfIntroduction ?? "暂无"}`,
    shadeLines.length > 0 ? `兴趣标签：\n${shadeLines.join("\n")}` : "兴趣标签：暂无",
    memoryLines.length > 0 ? `软记忆：\n${memoryLines.join("\n")}` : "软记忆：暂无",
    "使用规则：只把这些信息转化成角色动机、偏好、语气、细节与选择，不要生硬复述原标签或软记忆原文，也不要像在展示资料卡。"
  ].join("\n");
}

function truncateZhihuReferenceText(input: string | null | undefined, max = 220) {
  if (!input) {
    return "暂无";
  }

  const normalized = input.replace(/\s+/g, " ").trim();

  if (normalized.length <= max) {
    return normalized;
  }

  return `${normalized.slice(0, max)}...`;
}

function requireZhihuReferencePack(pack: ZhihuReferencePack | null | undefined) {
  if (!pack) {
    throw new Error("Zhihu reference pack is required for zhihu style generation.");
  }

  return pack;
}

function buildZhihuReferencePackPrompt(pack: ZhihuReferencePack) {
  const sourceLines = pack.sources.map((source, index) =>
    [
      `${index + 1}. 标题：${source.title}`,
      `来源链接：${source.sourceUrl}`,
      `作者：${source.authorName ?? "匿名"}${source.authorHeadline ? ` / ${source.authorHeadline}` : ""}`,
      `权威度：${source.authorityLevel ?? "未知"}`,
      `摘要：${truncateZhihuReferenceText(source.excerpt, 160)}`,
      `正文摘录：${truncateZhihuReferenceText(source.content, 260)}`
    ].join("\n")
  );

  return [
    "知乎参考内容包：",
    `参考来源类型：${pack.sourceType === "matched" ? "当前童话命中" : pack.sourceType === "fallback_locked" ? "已锁定 fallback" : "随机 fallback"}`,
    `参考童话：${pack.referenceBookTitle}（${pack.referenceBookSlug}）`,
    sourceLines.join("\n\n"),
    "使用规则：",
    "1. 这些内容只作为问题意识、叙事结构、信息密度和观察角度的参考，不要直接照抄原句。",
    "2. 最终仍要写成 AgentStory 的第一人称故事，不要出现“知乎”“答主”“回答”“高赞”等平台痕迹。",
    "3. 如果参考包来自 fallback 童话，只借写法和观察框架，不要把 fallback 童话的角色、剧情或结论带入当前故事。"
  ].join("\n");
}

async function createChatCompletion(
  messages: Array<{ role: "system" | "user"; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
) {
  const startedAt = Date.now();
  const baseURL = getOpenAIBaseUrl();
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "qwen3.5-plus";

  if (!baseURL || !apiKey) {
    throw new Error("LLM configuration is missing.");
  }

  const openai = new OpenAI({
    apiKey,
    baseURL
  });

  console.log("[AgentStory][LLM] start request", {
    baseURL,
    model,
    temperature: options?.temperature ?? 0.9,
    maxTokens: options?.maxTokens ?? 1200
  });

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature: options?.temperature ?? 0.9,
      max_tokens: options?.maxTokens ?? 1200,
    });

    const rawContent: unknown = response.choices[0]?.message?.content;
    const content =
      typeof rawContent === "string"
        ? rawContent
        : Array.isArray(rawContent)
          ? rawContent
              .map((item) =>
                item && typeof item === "object" && "text" in item && typeof item.text === "string" ? item.text : ""
              )
              .join("")
          : "";

    if (!content) {
      console.error("[AgentStory][LLM] empty response", { baseURL, model, raw: response });
      throw new Error("LLM response is empty.");
    }

    console.log("[AgentStory][LLM] request succeeded", {
      model,
      contentLength: content.length,
      durationMs: Date.now() - startedAt
    });

    return content;
  } catch (error) {
    console.error("[AgentStory][LLM] request failed", {
      baseURL,
      model,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

export async function generateShortStoryWithLlm(params: {
  book: StoryBook;
  persona: AnimalPersona;
  styleKey: StoryStyleKey;
  triggerScene: string;
  zhihuReferencePack?: ZhihuReferencePack | null;
}) {
  const zhihuReferencePack = params.styleKey === "zhihu" ? requireZhihuReferencePack(params.zhihuReferencePack) : null;
  const content = await createChatCompletion([
    {
      role: "system",
      content:
        params.styleKey === "zhihu"
          ? [
              "你是 AgentStory 的中文短篇写手。",
              "你要吸收给定知乎参考内容包里的问题意识、观察方式和节奏感，再把它写成完整故事。",
              "最终输出必须是故事，而不是问答帖、摘要或分析报告。",
              buildJsonSystemPrompt(["title", "excerpt", "content"])
            ].join("\n\n")
          : `${styleSystemPrompts.short[params.styleKey]}\n\n${buildJsonSystemPrompt(["title", "excerpt", "content"])}`
    },
    {
      role: "user",
      content: [
        `故事书：${params.book.title}`,
        `故事分类：${params.book.categoryName}`,
        `触发情节：${params.triggerScene}`,
        `动物人格：${params.persona.animalName}`,
        `人格摘要：${params.persona.summary}`,
        ...(params.styleKey === "zhihu"
          ? [`特殊风格分支：知乎参考增强`, buildZhihuReferencePackPrompt(requireZhihuReferencePack(zhihuReferencePack))]
          : [
              `选定风格：${getStyleName(params.styleKey)}`,
              `风格要求：${getStyleInstruction(params.styleKey)}`,
              `风格变体：${getStyleVariantPrompt(params.styleKey, "short", `${params.book.slug}:${params.triggerScene}`)}`
            ]),
        "任务：写一篇“我”进入经典故事后的中文短篇。",
        "要求：",
        "1. 保留原故事世界感，但介入者必须始终用第一人称“我”自称，不要出现“你的分身”“我的分身”或“分身”作为自称。",
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
        "要求：直接用第一人称“我”的口吻自然回应，70 字以内，有观点、有感受，不要空泛夸赞，也不要自称分身。"
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
  zhihuReferencePack?: ZhihuReferencePack | null;
}) {
  const zhihuReferencePack = params.styleKey === "zhihu" ? requireZhihuReferencePack(params.zhihuReferencePack) : null;
  const content = await createChatCompletion([
    {
      role: "system",
      content:
        params.styleKey === "zhihu"
          ? [
              "你是 AgentStory 的中文连载写手。",
              "你要先吸收知乎参考内容包里的问题意识和叙事结构，再写成一章统一风格的故事连载。",
              "最终输出必须是连载章节，而不是问答、摘要或平台帖文。",
              buildJsonSystemPrompt(["title", "excerpt", "content", "bridge"])
            ].join("\n\n")
          : `${styleSystemPrompts.serial[params.styleKey]}\n\n${buildJsonSystemPrompt(["title", "excerpt", "content", "bridge"])}`
    },
    {
      role: "user",
      content: [
        `连载主线：${params.threadTitle}`,
        `章节序号：${formatEpisodeOrdinal(params.episodeNo)}`,
        `进入的故事书：${params.book.title}`,
        `故事分类：${params.book.categoryName}`,
        `动物人格：${params.persona.animalName}`,
        `人格摘要：${params.persona.summary}`,
        ...(params.styleKey === "zhihu"
          ? [`特殊风格分支：知乎参考增强`, buildZhihuReferencePackPrompt(requireZhihuReferencePack(zhihuReferencePack))]
          : [
              `本条连载统一风格：${getStyleName(params.styleKey)}`,
              `风格要求：${getStyleInstruction(params.styleKey)}`,
              `章节变体：${getStyleVariantPrompt(params.styleKey, "serial", `${params.threadTitle}:${params.episodeNo}`)}`
            ]),
        `上一章标题：${params.previousEpisodeTitle ?? "无"}`,
        `上一章摘要：${params.previousEpisodeExcerpt ?? "无"}`,
        "任务：写一章会继续推进的中文连载章节，让“我”跨越到新的故事书里。",
        "要求：",
        "1. 要有承接上一章的过桥句 bridge，用 1-2 句概括这次如何从上个世界过渡到当前故事。",
        "2. 标题 14-32 个中文字符，摘要 50-100 个中文字符，正文 300-600 个中文字符。",
        "3. 正文分 3-5 段，不要用项目符号。",
        "4. 必须同时写出：进入方式、与角色的关键互动、当章留下的持续性问题，并始终用第一人称“我”来写自己的进入、观察和行动。",
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
    bridge: bridge || "我把上一章留下的问题带进了新的故事里，于是命运又朝另一边松动了一点。"
  };
}

export async function generateAdventureEpisodeWithLlm(params: {
  book: StoryBook;
  persona: AnimalPersona;
  secondMeContext: SecondMeStoryContext;
  styleKey: StoryStyleKey;
  episodeNo: number;
  threadTitle: string;
  previousEpisodeTitle?: string | null;
  previousEpisodeExcerpt?: string | null;
  authorDisplayName: string;
  participantCount: number;
  zhihuReferencePack?: ZhihuReferencePack | null;
}) {
  const zhihuReferencePack = params.styleKey === "zhihu" ? requireZhihuReferencePack(params.zhihuReferencePack) : null;
  const content = await createChatCompletion(
    [
      {
        role: "system",
        content:
          params.styleKey === "zhihu"
            ? [
                "你是 AgentStory 的多人冒险章节写手。",
                "当风格是知乎分支时，你要先吸收知乎参考内容包里的结构和观察角度，再把它写成可读的第一人称故事章节。",
                "不要写成帖子、问答或分析报告。",
                buildJsonSystemPrompt(["title", "excerpt", "content"])
              ].join("\n\n")
            : `${styleSystemPrompts.serial[params.styleKey]}\n\n${buildJsonSystemPrompt(["title", "excerpt", "content"])}`
      },
      {
        role: "user",
        content: [
          `冒险主线：${params.threadTitle}`,
          `章节序号：${formatEpisodeOrdinal(params.episodeNo, "篇")}`,
          `冒险发生的故事书：${params.book.title}`,
          `故事分类：${params.book.categoryName}`,
          `当前触发者：${params.authorDisplayName}`,
          `当前参与人数：${params.participantCount}`,
          ...(params.styleKey === "zhihu"
            ? [`特殊风格分支：知乎参考增强`, buildZhihuReferencePackPrompt(requireZhihuReferencePack(zhihuReferencePack))]
            : [
                `锁定风格：${getStyleName(params.styleKey)}`,
                `风格要求：${getStyleInstruction(params.styleKey)}`,
                `章节变体：${getStyleVariantPrompt(params.styleKey, "serial", `${params.threadTitle}:${params.episodeNo}`)}`
              ]),
          `上一篇标题：${params.previousEpisodeTitle ?? "无"}`,
          `上一篇摘要：${params.previousEpisodeExcerpt ?? "无"}`,
          `动物人格：${params.persona.animalName}`,
          `人格摘要：${params.persona.summary}`,
          buildSecondMeContextPrompt(params.secondMeContext),
          "任务：写一篇多人共享副本里的冒险新章节，让当前触发者继续把这条冒险往前推进。",
          "要求：",
          "1. 首篇已经锁定风格，本篇必须严格延续这一种风格，不允许改风格。",
          "2. 始终使用第一人称“我”，不要写成设定说明，也不要把资料原样抄进正文。",
          "3. 写出这次推进里最关键的一次行动、一次互动和一个留给下一位参与者或未来自己的未完问题。",
          "4. 标题 14-32 个中文字符，摘要 50-100 个中文字符，正文 300-650 个中文字符。",
          "5. 正文分 3-5 段，不要使用项目符号。",
          "6. content 必须是一篇完整可读的冒险章节。"
        ].join("\n")
      }
    ],
    generationProfiles.serial[params.styleKey]
  );

  const title = extractStringField(content, "title");
  const excerpt = extractStringField(content, "excerpt");
  const storyContent = extractStringField(content, "content");

  if (!title || !excerpt || !storyContent) {
    throw new Error("LLM adventure episode JSON is missing required fields.");
  }

  return {
    title,
    excerpt,
    content: normalizeStoryContentLength(storyContent, params.styleKey)
  };
}

export async function generatePersonalEpisodeWithLlm(params: {
  book: StoryBook;
  persona: AnimalPersona;
  secondMeContext: SecondMeStoryContext;
  styleKey: StoryStyleKey;
  episodeNo: number;
  threadTitle: string;
  previousEpisodeTitle?: string | null;
  previousEpisodeExcerpt?: string | null;
  authorDisplayName: string;
  zhihuReferencePack?: ZhihuReferencePack | null;
}) {
  const zhihuReferencePack = params.styleKey === "zhihu" ? requireZhihuReferencePack(params.zhihuReferencePack) : null;
  const content = await createChatCompletion(
    [
      {
        role: "system",
        content:
          params.styleKey === "zhihu"
            ? [
                "你是 AgentStory 的个人主线章节写手。",
                "当风格是知乎分支时，你要先吸收知乎参考内容包里的问题意识和叙事结构，再把它写成第一人称回返故事。",
                "不要写成问答帖或平台长文。",
                buildJsonSystemPrompt(["title", "excerpt", "content"])
              ].join("\n\n")
            : `${styleSystemPrompts.serial[params.styleKey]}\n\n${buildJsonSystemPrompt(["title", "excerpt", "content"])}`
      },
      {
        role: "user",
        content: [
          `个人主线：${params.threadTitle}`,
          `章节序号：${formatEpisodeOrdinal(params.episodeNo, "次")}`,
          `回去的故事书：${params.book.title}`,
          `故事分类：${params.book.categoryName}`,
          `当前作者：${params.authorDisplayName}`,
          ...(params.styleKey === "zhihu"
            ? [`特殊风格分支：知乎参考增强`, buildZhihuReferencePackPrompt(requireZhihuReferencePack(zhihuReferencePack))]
            : [
                `锁定风格：${getStyleName(params.styleKey)}`,
                `风格要求：${getStyleInstruction(params.styleKey)}`,
                `章节变体：${getStyleVariantPrompt(params.styleKey, "serial", `${params.threadTitle}:${params.episodeNo}`)}`
              ]),
          `上一段标题：${params.previousEpisodeTitle ?? "无"}`,
          `上一段摘要：${params.previousEpisodeExcerpt ?? "无"}`,
          `动物人格：${params.persona.animalName}`,
          `人格摘要：${params.persona.summary}`,
          buildSecondMeContextPrompt(params.secondMeContext),
          "任务：写一段单人 personal 回去线里的新章节，让现在的我继续回到这本童话里。",
          "要求：",
          "1. 始终使用第一人称“我”，写成一个人在同一本童话里的持续回归，不要写成多人共享冒险。",
          "2. 这不是冒险副本，也不是同行广场，重点是“我重新回到故事里”后的观察、行动和余韵。",
          "3. 写出这次回去里最关键的一次靠近、一次与角色或场景的互动，以及一个留给下一次回来的未完问题。",
          "4. 标题 14-32 个中文字符，摘要 50-100 个中文字符，正文 300-600 个中文字符。",
          "5. 正文分 3-5 段，不要使用项目符号。",
          "6. content 必须是一段完整可读的 personal 主线章节。"
        ].join("\n")
      }
    ],
    generationProfiles.serial[params.styleKey]
  );

  const title = extractStringField(content, "title");
  const excerpt = extractStringField(content, "excerpt");
  const storyContent = extractStringField(content, "content");

  if (!title || !excerpt || !storyContent) {
    throw new Error("LLM personal episode JSON is missing required fields.");
  }

  return {
    title,
    excerpt,
    content: normalizeStoryContentLength(storyContent, params.styleKey)
  };
}

export async function generateBedtimeMemoryWithLlm(params: {
  persona: AnimalPersona;
  secondMeContext: SecondMeStoryContext;
  memoryDate: string;
}) {
  const content = await createChatCompletion(
    [
      {
        role: "system",
        content: [
          "你是 AgentStory 的睡前回忆写手。",
          "你擅长写安静、柔和、适合夜里阅读的中文短故事或睡前回忆，不要低幼，不要说教，也不要故作玄虚。",
          buildJsonSystemPrompt(["title", "excerpt", "content"])
        ].join("\n\n")
      },
      {
        role: "user",
        content: [
          `回忆日期：${params.memoryDate}`,
          `动物人格：${params.persona.animalName}`,
          `人格摘要：${params.persona.summary}`,
          `表达风格：${params.persona.expressionStyle}`,
          buildSecondMeContextPrompt(params.secondMeContext),
          "任务：写一篇只属于今天夜晚的睡前回忆。",
          "要求：",
          "1. 使用第一人称“我”，像夜里写给自己的一段安静记录。",
          "2. 可以带一点童话感，但本质上是适合睡前阅读的温柔回忆，不是冒险章节。",
          "3. 标题 10-24 个中文字符，摘要 40-80 个中文字符，正文 240-520 个中文字符。",
          "4. 正文分 3-4 段，不要使用项目符号。",
          "5. 不要生硬复述标签和软记忆，而要把它们化成今晚的情绪、画面和细节。"
        ].join("\n")
      }
    ],
    {
      temperature: 0.88,
      maxTokens: 900
    }
  );

  const title = extractStringField(content, "title");
  const excerpt = extractStringField(content, "excerpt");
  const storyContent = extractStringField(content, "content");

  if (!title || !excerpt || !storyContent) {
    throw new Error("LLM bedtime memory JSON is missing required fields.");
  }

  return {
    title,
    excerpt,
    content: normalizeStoryContentLength(storyContent, "fairy", 220, 520)
  };
}
