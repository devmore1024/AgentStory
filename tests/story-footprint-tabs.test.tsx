import React from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StoryFootprintTabs } from "@/components/story-footprint-tabs";

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

describe("StoryFootprintTabs", () => {
  it("switches the filtered story list when clicking tabs", () => {
    render(
      <StoryFootprintTabs
        ownedCount={1}
        joinedCount={2}
        ownedItems={[{ id: "owned-1", title: "我在《小红帽》里的冒险", href: "/memory/little-red-riding-hood" }]}
        joinedItems={[
          { id: "joined-1", title: "在《海的女儿》里重新相遇", href: "/adventure/joined-1" },
          { id: "joined-2", title: "在《青蛙王子》里重新相遇", href: "/adventure/joined-2" }
        ]}
      />
    );

    expect(screen.getByText("我在《小红帽》里的冒险")).toBeInTheDocument();
    expect(screen.queryByText("在《海的女儿》里重新相遇")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /同行 2/i }));

    expect(screen.getByText("在《海的女儿》里重新相遇")).toBeInTheDocument();
    expect(screen.getByText("在《青蛙王子》里重新相遇")).toBeInTheDocument();
    expect(screen.queryByText("我在《小红帽》里的冒险")).not.toBeInTheDocument();
  });

  it("uses per-item links for personal adventures and companion threads", () => {
    render(
      <StoryFootprintTabs
        ownedCount={1}
        joinedCount={1}
        ownedItems={[{ id: "owned-1", title: "我在《小红帽》里的冒险", href: "/memory/little-red-riding-hood" }]}
        joinedItems={[{ id: "joined-1", title: "在《海的女儿》里重新相遇", href: "/adventure/joined-1" }]}
      />
    );

    expect(screen.getByRole("link", { name: "我在《小红帽》里的冒险" })).toHaveAttribute(
      "href",
      "/memory/little-red-riding-hood"
    );

    fireEvent.click(screen.getByRole("button", { name: /同行 1/i }));

    expect(screen.getAllByRole("link", { name: "在《海的女儿》里重新相遇" }).at(-1)).toHaveAttribute(
      "href",
      "/adventure/joined-1"
    );
  });
});
