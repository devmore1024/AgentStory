import React from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryLineBookPanel } from "@/components/memory-line-book-panel";
import { getStoryCoverFallbackSrc } from "@/lib/story-cover-cdn";

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

type MemoryLineBook = Parameters<typeof MemoryLineBookPanel>[0]["book"];

function createBookFixture(overrides: Partial<MemoryLineBook> = {}): MemoryLineBook {
  return {
    id: "book-1",
    title: "三只小猪",
    slug: "fairy-the-three-little-pigs",
    summary: "三只小猪各自盖房子，而狼的到来很快考验了它们的选择。",
    originalSynopsis: null,
    coverImage: null,
    categoryKey: "fairy_tale",
    categoryName: "童话",
    keyScenes: [],
    storyContent: null,
    sourceSite: null,
    sourceTitle: null,
    sourceUrl: null,
    sourceLicense: null,
    popularityRank: null,
    ...overrides
  };
}

const originalGeneratedCoversDir = process.env.GENERATED_COVERS_DIR;

beforeEach(() => {
  process.env.GENERATED_COVERS_DIR = "/tmp/agentstory-memory-line-no-generated";
});

afterEach(() => {
  process.env.GENERATED_COVERS_DIR = originalGeneratedCoversDir;
  cleanup();
});

describe("MemoryLineBookPanel", () => {
  it("renders the linked desktop book cover with the list-specific cover styling", () => {
    render(<MemoryLineBookPanel book={createBookFixture()} />);

    expect(screen.getByTestId("memory-line-book-panel")).toHaveAttribute(
      "href",
      "/books/fairy-the-three-little-pigs"
    );
    expect(screen.getByAltText("三只小猪 封面")).toBeInTheDocument();
    expect(screen.getByAltText("三只小猪 封面").closest("[data-cover-variant]")).toHaveAttribute(
      "data-cover-variant",
      "memoryLineBookPanel"
    );
  });

  it("renders the mobile inline variant with the shared cover fallback behavior", () => {
    render(<MemoryLineBookPanel book={createBookFixture()} variant="mobileInline" />);

    expect(screen.getByTestId("memory-line-book-panel-mobile-inline")).toHaveAttribute(
      "href",
      "/books/fairy-the-three-little-pigs"
    );
    expect(screen.getByAltText("三只小猪 封面").closest("[data-cover-variant]")).toHaveAttribute(
      "data-cover-variant",
      "memoryLineBookPanelMobileInline"
    );
  });

  it("falls back to the local cover when the remote artwork fails to load", async () => {
    render(<MemoryLineBookPanel book={createBookFixture()} />);

    const coverImage = screen.getByAltText("三只小猪 封面");

    fireEvent.error(coverImage);

    await waitFor(() => {
      expect(coverImage).toHaveAttribute("src", getStoryCoverFallbackSrc("fairy-the-three-little-pigs"));
    });
  });
});
