import { describe, expect, it } from "vitest";
import { expandedFairyCatalogBooks } from "@/lib/fairy-catalog-expansion";
import { sourceBackedFairyCatalog } from "@/lib/fairy-source-backed-catalog";

describe("fairy catalog expansion", () => {
  it("keeps 73 runtime fallback fairy tales for direct-link compatibility", () => {
    expect(expandedFairyCatalogBooks).toHaveLength(73);
  });

  it("uses a separate 100-book source-backed catalog for the primary fairy entry", () => {
    expect(sourceBackedFairyCatalog).toHaveLength(100);
  });
});
