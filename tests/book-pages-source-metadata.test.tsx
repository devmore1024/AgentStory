import React from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import BookDetailPage from "@/app/books/[slug]/page";
import BookReadPage from "@/app/books/[slug]/read/page";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

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

vi.mock("next/navigation", () => ({
  notFound: vi.fn()
}));

vi.mock("@/components/app-shell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>
}));

vi.mock("@/components/book-cover", () => ({
  BookCover: () => <div>cover</div>
}));

vi.mock("@/components/submit-button", () => ({
  SubmitButton: ({ idleLabel }: { idleLabel: string }) => <button type="submit">{idleLabel}</button>
}));

vi.mock("@/lib/story-experience", () => ({
  getAuthenticatedAppContext: vi.fn(async () => null),
  getPersonalLineForBookSlug: vi.fn(async () => null)
}));

vi.mock("@/lib/story-data", () => ({
  getBookBySlug: vi.fn(async () => ({
    id: "book-1",
    title: "睡美人",
    slug: "fairy-sleeping-beauty",
    summary: "一个关于沉睡与重逢的童话。",
    originalSynopsis: "很久以前，公主沉睡在荆棘围起的城堡里。",
    coverImage: null,
    categoryKey: "fairy_tale",
    categoryName: "童话",
    keyScenes: ["被纺锤刺伤", "王子穿过荆棘"],
    storyContent: "第一段\n\n第二段",
    sourceSite: "Project Gutenberg",
    sourceTitle: "The Sleeping Beauty in the Wood",
    sourceUrl: "https://www.gutenberg.org/ebooks/33931",
    sourceLicense: "Public domain in the USA via Project Gutenberg.",
    popularityRank: 4
  })),
  getResolvedKeyScenes: vi.fn(() => ["被纺锤刺伤", "王子穿过荆棘"]),
  getResolvedStoryParagraphs: vi.fn(() => ["很久以前，公主沉睡在荆棘围起的城堡里。", "后来，有人穿过森林来叫醒她。"])
}));

describe("book pages source metadata", () => {
  it("does not render source metadata on the book detail page", async () => {
    render(await BookDetailPage({ params: Promise.resolve({ slug: "fairy-sleeping-beauty" }) }));

    expect(screen.queryByText("来源：Project Gutenberg")).not.toBeInTheDocument();
    expect(screen.queryByText("Public domain in the USA via Project Gutenberg.")).not.toBeInTheDocument();
    expect(screen.queryByText("查看原文来源")).not.toBeInTheDocument();
  });

  it("does not render source metadata on the read page", async () => {
    render(await BookReadPage({ params: Promise.resolve({ slug: "fairy-sleeping-beauty" }) }));

    expect(screen.queryByText("来源：Project Gutenberg")).not.toBeInTheDocument();
    expect(screen.queryByText("The Sleeping Beauty in the Wood")).not.toBeInTheDocument();
    expect(screen.queryByText("Public domain in the USA via Project Gutenberg.")).not.toBeInTheDocument();
    expect(screen.queryByText("查看英文原文")).not.toBeInTheDocument();
  });
});
