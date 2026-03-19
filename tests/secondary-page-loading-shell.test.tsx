import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdventureThreadLoading from "@/app/adventure/[threadId]/loading";
import BookLoading from "@/app/books/[slug]/loading";
import ShareLoading from "@/app/me/share/loading";
import MemoryDetailLoading from "@/app/memory/[slug]/loading";

afterEach(() => {
  cleanup();
});

vi.mock("@/components/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe("secondary page loading shells", () => {
  it("renders the book-page loading layout with a back header skeleton", () => {
    render(<BookLoading />);

    expect(screen.getByTestId("secondary-loading-back")).toHaveTextContent("童话故事");
    expect(screen.getByTestId("secondary-loading-notice")).toHaveTextContent("正在打开童话故事");
    expect(screen.getByTestId("secondary-loading-shell-book")).toBeInTheDocument();
  });

  it("renders the story-detail loading layout for memory and adventure pages", () => {
    const { rerender } = render(<MemoryDetailLoading />);

    expect(screen.getByTestId("secondary-loading-back")).toHaveTextContent("冒险故事");
    expect(screen.getByTestId("secondary-loading-notice")).toHaveTextContent("这一页正在落下来");
    expect(screen.getByTestId("secondary-loading-shell-story-detail")).toBeInTheDocument();

    rerender(<AdventureThreadLoading />);

    expect(screen.getByTestId("secondary-loading-back")).toHaveTextContent("同行故事");
    expect(screen.getByTestId("secondary-loading-notice")).toHaveTextContent("这一页正在落下来");
    expect(screen.getByTestId("secondary-loading-shell-story-detail")).toBeInTheDocument();
  });

  it("renders the share-page loading layout", () => {
    render(<ShareLoading />);

    expect(screen.getByTestId("secondary-loading-back")).toHaveTextContent("分享详情");
    expect(screen.getByTestId("secondary-loading-notice")).toHaveTextContent("分享页正在准备");
    expect(screen.getByTestId("secondary-loading-shell-share")).toBeInTheDocument();
  });
});
