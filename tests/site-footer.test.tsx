import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/site-footer";

describe("SiteFooter", () => {
  it("renders the lightweight brand footer copy", () => {
    render(<SiteFooter />);

    expect(screen.getByText("AgenTales")).toBeInTheDocument();
    expect(screen.getByText("让你的 AI 分身带着真实的你，回到童话里。")).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} AgenTales\\.`))).toBeInTheDocument();
  });
});
