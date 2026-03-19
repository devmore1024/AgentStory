import React from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdventureThreadBookThumb } from "@/components/adventure-thread-book-thumb";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  } & Omit<ComponentPropsWithoutRef<"a">, "href" | "children">) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

afterEach(() => {
  cleanup();
});

function createBookFixture() {
  return {
    id: "book-1",
    title: "白雪公主",
    slug: "fairy-snow-white",
    summary: "白雪公主在森林与命运里重新长大。",
    originalSynopsis: null,
    coverImage: null,
    categoryKey: "fairy_tale" as const,
    categoryName: "童话",
    keyScenes: [],
    storyContent: null,
    sourceSite: null,
    sourceTitle: null,
    sourceUrl: null,
    sourceLicense: null,
    popularityRank: null
  };
}

describe("AdventureThreadBookThumb", () => {
  it("renders the linked companion-list cover thumb", () => {
    render(<AdventureThreadBookThumb book={createBookFixture()} href="/books/fairy-snow-white/read" />);

    expect(screen.getByTestId("adventure-thread-book-thumb")).toHaveAttribute("href", "/books/fairy-snow-white/read");
    expect(screen.getByAltText("白雪公主 封面").closest("[data-cover-variant]")).toHaveAttribute(
      "data-cover-variant",
      "adventureThreadBookThumb"
    );
  });

  it("falls back to the local cover when the remote artwork fails to load", async () => {
    render(<AdventureThreadBookThumb book={createBookFixture()} href="/books/fairy-snow-white/read" />);

    const coverImage = screen.getByAltText("白雪公主 封面");

    fireEvent.error(coverImage);

    await waitFor(() => {
      expect(coverImage).toHaveAttribute("src", "/covers/fairy-snow-white");
    });
  });
});
