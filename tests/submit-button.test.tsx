import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SubmitButton } from "@/components/submit-button";

describe("SubmitButton", () => {
  it("uses the secondary button styling when kind is secondary", () => {
    render(
      <form action={() => {}}>
        <SubmitButton idleLabel="开始同行" pendingLabel="正在公开..." kind="secondary" />
      </form>
    );

    const button = screen.getByRole("button", { name: "开始同行" });

    expect(button.className).toContain("border");
    expect(button.className).toContain("bg-[rgba(255,255,255,0.8)]");
    expect(button.className).not.toContain("bg-[var(--accent-moss)]");
  });
});
