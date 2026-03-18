import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  sql: vi.fn()
}));

vi.mock("@/lib/current-user", () => ({
  getCurrentViewerContext: vi.fn()
}));

import { filterPrimaryEntryViewsToFairy } from "@/lib/demo-app";

describe("demo-app primary entry filters", () => {
  it("keeps only source-backed fairy tale items for main entry views", () => {
    const filtered = filterPrimaryEntryViewsToFairy([
      {
        id: "1",
        bookCategoryKey: "fairy_tale" as const,
        bookSlug: "fairy-little-red-riding-hood",
        title: "童话"
      },
      {
        id: "2",
        bookCategoryKey: "fairy_tale" as const,
        bookSlug: "fairy-maid-maleen",
        title: "隐藏童话"
      },
      { id: "3", bookCategoryKey: "fable" as const, bookSlug: "fable-the-crow-and-the-fox", title: "寓言" },
      { id: "4", bookCategoryKey: "mythology" as const, bookSlug: "myth-prometheus-steals-fire", title: "神话" },
      { id: "5", bookCategoryKey: null, bookSlug: null, title: "未知" }
    ]);

    expect(filtered).toEqual([
      {
        id: "1",
        bookCategoryKey: "fairy_tale",
        bookSlug: "fairy-little-red-riding-hood",
        title: "童话"
      }
    ]);
  });
});
