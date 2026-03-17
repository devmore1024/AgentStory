const PROJECT_GUTENBERG_ORIGIN = "https://www.gutenberg.org";

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(value: string) {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

export function normalizeProjectGutenbergUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return new URL(pathOrUrl, PROJECT_GUTENBERG_ORIGIN).toString();
}

export function extractProjectGutenbergImageUrls(html: string) {
  const matches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
  const seen = new Set<string>();
  const images: string[] = [];

  for (const match of matches) {
    const normalized = normalizeProjectGutenbergUrl(match[1]);

    if (!seen.has(normalized)) {
      seen.add(normalized);
      images.push(normalized);
    }
  }

  return images;
}

export function extractProjectGutenbergParagraphs(html: string) {
  const content = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");

  const rawParagraphs = Array.from(content.matchAll(/<(p|div)[^>]*>([\s\S]*?)<\/\1>/gi))
    .map((match) => stripTags(match[2]))
    .filter(Boolean);

  return rawParagraphs.filter((paragraph) => {
    const lower = paragraph.toLowerCase();

    return !lower.includes("project gutenberg") && paragraph.length >= 24;
  });
}

export function pickProjectGutenbergCoverTarget(html: string) {
  const images = extractProjectGutenbergImageUrls(html);

  return images.find((image) => /\.(png|jpg|jpeg|webp)$/i.test(image)) ?? null;
}
