import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomePersonaDock } from "@/components/home-persona-dock";
import { animalPersonas } from "@/lib/animal-personas";

afterEach(() => {
  cleanup();
});

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

vi.mock("@/components/persona-badge", () => ({
  PersonaBadge: () => <div data-testid="persona-badge">badge</div>
}));

describe("HomePersonaDock", () => {
  it("merges persona summary and current adventure copy into the mobile expanded card", () => {
    const longExcerpt =
      "我又一次回到了林间小路，看见风把斗篷边缘吹得轻轻晃动，也看见熟悉的森林好像比上次更安静一点，远处还有微弱的灯光在树影后慢慢摇晃。";

    render(
      <HomePersonaDock
        persona={animalPersonas.fox}
        currentBookTitle="小红帽"
        currentEpisodeExcerpt={longExcerpt}
        statusLabel="正在冒险"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "打开分身卡片" }));

    expect(screen.getByText("去看这段冒险")).toBeInTheDocument();

    const mobileCard = screen.getByTestId("home-persona-dock-mobile-card");
    const excerptNode = within(mobileCard).getByText((content) => content.includes("..."));

    expect(within(mobileCard).getByText("正在冒险")).toBeInTheDocument();
    expect(within(mobileCard).getByText("《小红帽》")).toBeInTheDocument();
    expect(within(mobileCard).getByText(/你的分身会先以动物人格出现/)).toBeInTheDocument();
    expect(excerptNode.textContent).toContain("...");
    expect(excerptNode.textContent).toContain("我又一次回到了林间小路");
    expect(excerptNode.textContent).not.toContain("更安静一点。");
    expect(within(mobileCard).getByTestId("persona-badge")).toBeInTheDocument();
  });
});
