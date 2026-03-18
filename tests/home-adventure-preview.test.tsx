import React from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeAdventurePreview } from "@/components/home-adventure-preview";

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

describe("HomeAdventurePreview", () => {
  it("keeps the preview card hidden on mobile and visible on desktop", () => {
    render(
      <HomeAdventurePreview
        eyebrow="你的分身正在冒险的童话"
        bookTitle="小红帽"
        statusLabel="正在冒险"
        previewHref="/memory/fairy-little-red-riding-hood"
        actionLabel="去看这段冒险"
        reunionTitle="与熟悉的人重逢"
        reunionBody="重逢文案"
        companionBody="同行文案"
      />
    );

    const preview = screen.getByTestId("home-adventure-preview");

    expect(preview.className).toContain("hidden");
    expect(preview.className).toContain("lg:block");
    expect(screen.getByText("你的分身正在冒险的童话")).toBeInTheDocument();
  });
});
