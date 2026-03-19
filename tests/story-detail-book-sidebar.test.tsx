import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { StoryDetailBookSidebar } from "@/components/story-detail-book-sidebar";
import { getStoryCoverFallbackSrc } from "@/lib/story-cover-cdn";

type StoryDetailSidebarBook = Parameters<typeof StoryDetailBookSidebar>[0]["book"];

function createBookFixture(overrides: Partial<StoryDetailSidebarBook> = {}): StoryDetailSidebarBook {
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
  process.env.GENERATED_COVERS_DIR = "/tmp/agentstory-story-detail-sidebar-no-generated";
});

afterEach(() => {
  process.env.GENERATED_COVERS_DIR = originalGeneratedCoversDir;
  cleanup();
});

describe("StoryDetailBookSidebar", () => {
  it("renders the book cover, title, category, and summary without a self-link", () => {
    render(<StoryDetailBookSidebar book={createBookFixture()} />);

    expect(screen.getByTestId("story-detail-book-sidebar")).toBeInTheDocument();
    expect(screen.getByAltText("三只小猪 封面")).toBeInTheDocument();
    expect(screen.getByText("童话")).toBeInTheDocument();
    expect(screen.getByText("三只小猪")).toBeInTheDocument();
    expect(screen.getByText("三只小猪各自盖房子，而狼的到来很快考验了它们的选择。")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("falls back to the local cover when the remote artwork fails to load", async () => {
    render(<StoryDetailBookSidebar book={createBookFixture()} />);

    const coverImage = screen.getByAltText("三只小猪 封面");

    fireEvent.error(coverImage);

    await waitFor(() => {
      expect(coverImage).toHaveAttribute("src", getStoryCoverFallbackSrc("fairy-the-three-little-pigs"));
    });
  });
});
