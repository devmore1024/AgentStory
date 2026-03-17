import { describe, expect, it } from "vitest";
import { filterPrimaryEntryViewsToFairy } from "@/lib/demo-app";

describe("demo-app primary entry filters", () => {
  it("keeps only fairy tale items for main entry views", () => {
    const filtered = filterPrimaryEntryViewsToFairy([
      { id: "1", bookCategoryKey: "fairy_tale" as const, title: "童话" },
      { id: "2", bookCategoryKey: "fable" as const, title: "寓言" },
      { id: "3", bookCategoryKey: "mythology" as const, title: "神话" },
      { id: "4", bookCategoryKey: null, title: "未知" }
    ]);

    expect(filtered).toEqual([{ id: "1", bookCategoryKey: "fairy_tale", title: "童话" }]);
  });
});
