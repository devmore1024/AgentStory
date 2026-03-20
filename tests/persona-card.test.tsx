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

  it("shows only style tags in the recommendation section", () => {
    render(<PersonaCard persona={persona} showArchiveButton={false} />);

    expect(screen.getByText("治愈日常风")).toBeInTheDocument();
    expect(screen.getByText("童话风")).toBeInTheDocument();
    expect(screen.getByText("现实主义风")).toBeInTheDocument();
    expect(screen.queryByText("童话")).not.toBeInTheDocument();
    expect(screen.queryByText("寓言")).not.toBeInTheDocument();
    expect(screen.queryByText("神话")).not.toBeInTheDocument();
  });

  it("shows recognition features inside the image language card", () => {
    render(<PersonaCard persona={persona} showArchiveButton={false} />);

    expect(screen.getByText("识别特征")).toBeInTheDocument();
    expect(screen.getByText("短圆耳")).toBeInTheDocument();
    expect(screen.getByText("厚脸轮廓")).toBeInTheDocument();
    expect(screen.getByText("宽鼻吻部")).toBeInTheDocument();
  });

  it("renders style tags for newly added personas as well", () => {
    render(<PersonaCard persona={{ ...animalPersonas.otter, mappingReason: "测试画像" }} showArchiveButton={false} />);

    expect(screen.getByText("沙雕搞笑风")).toBeInTheDocument();
    expect(screen.getByText("轻喜剧网感风")).toBeInTheDocument();
    expect(screen.getByText("治愈日常风")).toBeInTheDocument();
  });

  it("renders recognition features for newly added and confusable animals", () => {
    render(<PersonaCard persona={{ ...animalPersonas.crane, mappingReason: "测试画像" }} showArchiveButton={false} />);

    expect(screen.getByText("细直长颈")).toBeInTheDocument();
    expect(screen.getByText("长直喙")).toBeInTheDocument();
    expect(screen.getByText("清瘦长腿")).toBeInTheDocument();
  });
});
