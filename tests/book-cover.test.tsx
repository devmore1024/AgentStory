import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookCover } from "@/components/book-cover";

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

type BookFixture = Parameters<typeof BookCover>[0]["book"];

function createBookFixture(overrides: Partial<BookFixture> = {}): BookFixture {
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

describe("BookCover", () => {
  it("renders the curated cover for imported pilot books when no vetted source image is stored", () => {
    render(<BookCover book={createBookFixture()} />);

    const coverImage = screen.getByAltText("三只小猪 封面");

    expect(coverImage).toHaveAttribute("src", expect.stringContaining("commons.wikimedia.org"));
    expect(screen.getByText("童话")).toBeInTheDocument();
    expect(screen.getByText("三只小猪")).toBeInTheDocument();
  });

  it("uses the home fairy variant to hide the category badge and keep the fairy shelf styling focused", () => {
    render(<BookCover book={createBookFixture()} variant="homeFairy" />);

    const coverFrame = screen.getByAltText("三只小猪 封面").closest("[data-cover-variant]");

    expect(coverFrame).toHaveAttribute("data-cover-variant", "homeFairy");
    expect(screen.queryByText("童话")).not.toBeInTheDocument();
    expect(screen.getByText("三只小猪")).toBeInTheDocument();
  });

  it("renders an external themed cover for books outside the exact override list", () => {
    render(
      <BookCover
        book={createBookFixture({
          title: "青蛙王子",
          slug: "fairy-the-frog-prince",
          coverImage: null
        })}
      />
    );

    const coverImage = screen.getByAltText("青蛙王子 封面");

    expect(coverImage).toHaveAttribute("src", expect.stringContaining("commons.wikimedia.org"));
  });

  it("falls back to a local cover when a pilot fairy tale is intentionally pinned to local art", () => {
    render(
      <BookCover
        book={createBookFixture({
          title: "蓝胡子",
          slug: "fairy-bluebeard",
          coverImage: null
        })}
      />
    );

    const coverImage = screen.getByAltText("蓝胡子 封面");

    expect(coverImage).toHaveAttribute("src", "/covers/fairy-bluebeard");
  });

  it("switches back to the fallback svg cover when the remote image fails", async () => {
    render(<BookCover book={createBookFixture()} />);

    const coverImage = screen.getByAltText("三只小猪 封面");

    fireEvent.error(coverImage);

    await waitFor(() => {
      expect(coverImage).toHaveAttribute("src", "/covers/fairy-the-three-little-pigs");
    });
  });
});
