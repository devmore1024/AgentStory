export type ZhihuImportBook = {
  title: string;
  slug: string;
  sourceTitle?: string | null;
};

export const ZHIHU_IMPORT_USER_AGENT = "AgentStory/0.1 zhihu-import";

export type ZhihuSearchCandidate = {
  queryKeyword: string;
  sourceType: "answer" | "article";
  title: string;
  excerpt: string | null;
  sourceUrl: string;
  authorName: string | null;
  authorHeadline: string | null;
  authorityLevel: number | null;
  qualityScore: number;
};

export type ZhihuSearchRequestOptions = {
  accessToken?: string | null;
  searchQueryParam?: string;
  searchLimitParam?: string;
  searchLimit?: string | number;
  userAgent?: string;
};

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&quot;/g, "\"")
    .replace(/&#34;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#x27;/gi, "'");
}

function cleanText(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return decodeHtmlEntities(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.length > 0)));
}

function normalizeSourceType(value: string | null | undefined, url: string) {
  const normalized = (value ?? "").toLowerCase();

  if (normalized.includes("article") || url.includes("/p/")) {
    return "article" as const;
  }

  return "answer" as const;
}

function readString(candidate: Record<string, unknown>, path: string[]) {
  let current: unknown = candidate;

  for (const key of path) {
    if (!current || typeof current !== "object") {
      return null;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "string" ? current : null;
}

function readNumber(candidate: Record<string, unknown>, path: string[]) {
  let current: unknown = candidate;

  for (const key of path) {
    if (!current || typeof current !== "object") {
      return null;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "number" ? current : null;
}

function inferUrl(candidate: Record<string, unknown>) {
  const direct =
    readString(candidate, ["source_url"]) ??
    readString(candidate, ["url"]) ??
    readString(candidate, ["link"]) ??
    readString(candidate, ["target", "url"]) ??
    readString(candidate, ["target", "link"]) ??
    readString(candidate, ["object", "url"]);

  return direct;
}

export function buildZhihuSearchRequest(
  searchUrl: string,
  queryKeyword: string,
  options: ZhihuSearchRequestOptions = {}
) {
  const url = new URL(searchUrl);
  const accessToken = options.accessToken?.trim() ?? "";

  url.searchParams.set(options.searchQueryParam ?? "keyword", queryKeyword);
  url.searchParams.set(options.searchLimitParam ?? "limit", String(options.searchLimit ?? "10"));

  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": options.userAgent ?? ZHIHU_IMPORT_USER_AGENT
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return {
    url: url.toString(),
    headers
  };
}

export function buildZhihuSearchKeywords(book: ZhihuImportBook) {
  const slugWords = book.slug
    .replace(/^(fairy|fable|myth)-/u, "")
    .split("-")
    .filter((segment) => segment.length > 1)
    .join(" ");
  const sourceTitle = book.sourceTitle?.trim() ?? "";

  return uniqueStrings([book.title.trim(), sourceTitle, slugWords]).slice(0, 3);
}

export function scoreZhihuSearchCandidate(candidate: {
  title: string;
  excerpt?: string | null;
  authorityLevel?: number | null;
  sourceUrl: string;
}) {
  const title = cleanText(candidate.title) ?? "";
  const excerpt = cleanText(candidate.excerpt) ?? "";
  const authorityLevel = candidate.authorityLevel ?? 0;
  const sourceTypeBonus = candidate.sourceUrl.includes("/p/") ? 8 : 4;

  return authorityLevel * 12 + Math.min(title.length, 50) + Math.min(excerpt.length, 180) / 3 + sourceTypeBonus;
}

export function normalizeZhihuSearchCandidates(payload: unknown, queryKeyword: string) {
  if (!payload || typeof payload !== "object") {
    return [] satisfies ZhihuSearchCandidate[];
  }

  const root = payload as Record<string, unknown>;
  const rawItems = [root.data, root.items, root.result].find(Array.isArray) as unknown[] | undefined;

  if (!rawItems) {
    return [] satisfies ZhihuSearchCandidate[];
  }

  return rawItems
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const candidate = item as Record<string, unknown>;
      const title =
        cleanText(
          readString(candidate, ["title"]) ??
            readString(candidate, ["target", "title"]) ??
            readString(candidate, ["object", "title"]) ??
            readString(candidate, ["question", "title"]) ??
            readString(candidate, ["article", "title"])
        ) ?? "";
      const excerpt =
        cleanText(
          readString(candidate, ["excerpt"]) ??
            readString(candidate, ["target", "excerpt"]) ??
            readString(candidate, ["object", "excerpt"]) ??
            readString(candidate, ["answer", "excerpt"]) ??
            readString(candidate, ["article", "excerpt"])
        ) ?? null;
      const sourceUrl = inferUrl(candidate);

      if (!title || !sourceUrl) {
        return null;
      }

      const authorityLevel =
        readNumber(candidate, ["authority_level"]) ??
        readNumber(candidate, ["author", "authority_level"]) ??
        readNumber(candidate, ["target", "author", "authority_level"]) ??
        readNumber(candidate, ["object", "author", "authority_level"]);
      const authorName =
        readString(candidate, ["author", "name"]) ??
        readString(candidate, ["target", "author", "name"]) ??
        readString(candidate, ["object", "author", "name"]);
      const authorHeadline =
        readString(candidate, ["author", "headline"]) ??
        readString(candidate, ["target", "author", "headline"]) ??
        readString(candidate, ["object", "author", "headline"]);
      const sourceType = normalizeSourceType(
        readString(candidate, ["type"]) ??
          readString(candidate, ["target", "type"]) ??
          readString(candidate, ["object", "type"]),
        sourceUrl
      );

      return {
        queryKeyword,
        sourceType,
        title,
        excerpt,
        sourceUrl,
        authorName,
        authorHeadline,
        authorityLevel,
        qualityScore: scoreZhihuSearchCandidate({
          title,
          excerpt,
          authorityLevel,
          sourceUrl
        })
      } satisfies ZhihuSearchCandidate;
    })
    .filter((candidate): candidate is ZhihuSearchCandidate => Boolean(candidate));
}

function stripTags(value: string) {
  return cleanText(value) ?? "";
}

function decodeJsonString(value: string) {
  try {
    return JSON.parse(`"${value}"`) as string;
  } catch {
    return value;
  }
}

export function extractZhihuContentFromHtml(html: string) {
  const candidates: string[] = [];

  for (const match of html.matchAll(/<script[^>]*id="js-initialData"[^>]*>([\s\S]*?)<\/script>/giu)) {
    const jsonText = decodeHtmlEntities(match[1] ?? "");

    for (const contentMatch of jsonText.matchAll(/"content":"((?:[^"\\]|\\.)+)"/gu)) {
      const decoded = cleanText(decodeJsonString(contentMatch[1] ?? ""));

      if (decoded) {
        candidates.push(decoded);
      }
    }
  }

  for (const match of html.matchAll(/<div[^>]*class="[^"]*RichContent-inner[^"]*"[^>]*>([\s\S]*?)<\/div>/giu)) {
    const decoded = stripTags(match[1] ?? "");

    if (decoded) {
      candidates.push(decoded);
    }
  }

  for (const match of html.matchAll(/<article[^>]*>([\s\S]*?)<\/article>/giu)) {
    const decoded = stripTags(match[1] ?? "");

    if (decoded) {
      candidates.push(decoded);
    }
  }

  const longest = candidates
    .map((candidate) => candidate.trim())
    .filter((candidate) => candidate.length >= 120)
    .sort((left, right) => right.length - left.length)[0];

  return longest ?? null;
}

export function dedupeAndSortZhihuCandidates(candidates: ZhihuSearchCandidate[], limit = 5) {
  const byUrl = new Map<string, ZhihuSearchCandidate>();

  for (const candidate of candidates) {
    const existing = byUrl.get(candidate.sourceUrl);

    if (!existing || candidate.qualityScore > existing.qualityScore) {
      byUrl.set(candidate.sourceUrl, candidate);
    }
  }

  return Array.from(byUrl.values())
    .sort((left, right) => right.qualityScore - left.qualityScore)
    .slice(0, limit);
}
