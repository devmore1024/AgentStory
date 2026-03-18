import { describe, expect, it } from "vitest";
import { generatePersonalEpisodeWithLlm } from "@/lib/llm";

describe("llm exports", () => {
  it("exports the personal episode generator", () => {
    expect(typeof generatePersonalEpisodeWithLlm).toBe("function");
  });
});
