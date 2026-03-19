import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("app icon", () => {
  it("ships a story-themed emoji favicon as an SVG asset", () => {
    const iconPath = path.join(process.cwd(), "app", "icon.svg");
    const icon = readFileSync(iconPath, "utf8");

    expect(icon).toContain("<svg");
    expect(icon).toContain("linearGradient");
    expect(icon).toContain("🌲");
  });
});
