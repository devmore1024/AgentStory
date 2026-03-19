import { beforeEach, describe, expect, it, vi } from "vitest";
import { animalPersonas } from "@/lib/animal-personas";

const mocks = vi.hoisted(() => ({
  sql: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  sql: mocks.sql
}));

vi.mock("@/lib/fairy-catalog-expansion", () => ({
  expandedFairyCatalogBySlug: new Map()
}));

vi.mock("@/lib/fairy-source-backed-catalog", () => ({
  getSourceBackedFairyBook: () => null,
  sourceBackedFairyCatalog: [
    {
      slug: "fairy-future-city",
      isVisibleInPrimaryEntry: true
    },
    {
      slug: "fairy-future-core",
      isVisibleInPrimaryEntry: true
    }
  ]
}));

function normalizeSql(query: string) {
  return query.replace(/\s+/g, " ").trim();
}

function createRow(overrides: {
  id: string;
  title: string;
  slug: string;
  summary: string;
  originalSynopsis: string;
  categoryKey: "fairy_tale" | "fable" | "mythology";
  categoryName: string;
  categoryId: string;
  sortOrder: number;
  popularityRank?: number | null;
}) {
  return {
    id: overrides.id,
    title: overrides.title,
    slug: overrides.slug,
    summary: overrides.summary,
    original_synopsis: overrides.originalSynopsis,
    cover_image: null,
    key_scenes: [],
    story_content: null,
    source_site: null,
    source_title: null,
    source_url: null,
    source_license: null,
    popularity_rank: overrides.popularityRank ?? null,
    category_id: overrides.categoryId,
    category_key: overrides.categoryKey,
    category_name: overrides.categoryName,
    sort_order: overrides.sortOrder
  };
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();

  mocks.sql.mockImplementation(async (query: string) => {
    const normalized = normalizeSql(query);

    if (normalized.includes("FROM information_schema.columns")) {
      return {
        rows: [
          { column_name: "story_content" },
          { column_name: "source_site" },
          { column_name: "source_title" },
          { column_name: "source_url" },
          { column_name: "source_license" },
          { column_name: "popularity_rank" }
        ]
      };
    }

    if (normalized.includes("FROM story_categories c")) {
      return {
        rows: [
          createRow({
            id: "book-fairy-future",
            title: "玻璃城系统日志",
            slug: "fairy-future-city",
            summary: "未来城市边缘，主角追逐一封迟来的旧信。",
            originalSynopsis: "一座玻璃城在夜里亮着冷色的灯。",
            categoryKey: "fairy_tale",
            categoryName: "童话",
            categoryId: "category-fairy",
            sortOrder: 2,
            popularityRank: 24
          }),
          createRow({
            id: "book-myth-quiet",
            title: "宙斯的宴席",
            slug: "myth-feast",
            summary: "诸神之间的试探与命令。",
            originalSynopsis: "一场旧神宴席里的试探。",
            categoryKey: "mythology",
            categoryName: "神话",
            categoryId: "category-myth",
            sortOrder: 1,
            popularityRank: 3
          }),
          createRow({
            id: "book-fairy-terminal",
            title: "阿尔法终端",
            slug: "fairy-future-core",
            summary: "未来终端里藏着新的系统权限和时空工程。",
            originalSynopsis: "系统、星图、时空、机械结构和未来装置一同运转。",
            categoryKey: "fairy_tale",
            categoryName: "童话",
            categoryId: "category-fairy",
            sortOrder: 2,
            popularityRank: 35
          }),
          createRow({
            id: "book-myth-terminal",
            title: "贝塔终端",
            slug: "myth-future-core",
            summary: "另一座未来城市也在调试它的引擎和权限。",
            originalSynopsis: "系统、未来、引擎和机械结构进入同一个现场。",
            categoryKey: "mythology",
            categoryName: "神话",
            categoryId: "category-myth",
            sortOrder: 1,
            popularityRank: 35
          })
        ]
      };
    }

    throw new Error(`Unhandled SQL: ${normalized}`);
  });
});

describe("story-data persona recommendations", () => {
  it("can recommend a category-mismatched book when persona cues and text hits are stronger", async () => {
    const { getRecommendedBooksForPersona } = await import("@/lib/story-data");
    const recommended = await getRecommendedBooksForPersona(animalPersonas.owl, 3);

    expect(recommended[0]?.slug).toBe("fairy-future-core");
  });

  it("scores books by cue matches and text affinity instead of persona-category bindings", async () => {
    const { getRecommendedBooksForPersona } = await import("@/lib/story-data");
    const recommended = await getRecommendedBooksForPersona(animalPersonas.owl, 2);

    expect(recommended.map((book) => book.slug)).toEqual(["fairy-future-core", "myth-future-core"]);
  });
});
