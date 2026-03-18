import React from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PersonaCard } from "@/components/persona-card";
import { animalPersonas } from "@/lib/animal-personas";

afterEach(() => {
  cleanup();
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

vi.mock("@/components/persona-badge", () => ({
  PersonaBadge: () => <div>badge</div>
}));

vi.mock("@/components/persona-portrait", () => ({
  PersonaPortrait: () => <div>portrait</div>
}));

vi.mock("@/components/persona-radar", () => ({
  PersonaRadar: () => <div>radar</div>
}));

const persona = {
  ...animalPersonas.bear,
  mappingReason: "系统从你的资料里识别到稳定、守护和陪伴感。"
};

describe("PersonaCard", () => {
  it("shows the archive button by default", () => {
    render(<PersonaCard persona={persona} />);

    expect(screen.getByText("打开我的档案馆")).toBeInTheDocument();
  });

  it("hides the archive button when showArchiveButton is false", () => {
    render(<PersonaCard persona={persona} showArchiveButton={false} />);

    expect(screen.queryByText("打开我的档案馆")).not.toBeInTheDocument();
  });
});
