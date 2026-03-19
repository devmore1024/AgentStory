import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AppLoading from "@/app/loading";
import { AppShell } from "@/components/app-shell";
import { NavigationTransitionProvider, useNavigationTransition } from "@/components/navigation-transition-provider";

let mockPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => <img alt={alt} {...props} />
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    onClick,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: React.ReactNode;
  }) => (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event);
        event.preventDefault();
      }}
      {...props}
    >
      {children}
    </a>
  )
}));

vi.mock("@/lib/auth", () => ({
  getAuthSession: vi.fn().mockResolvedValue(null),
  isAuthSessionExpired: vi.fn().mockReturnValue(false)
}));

vi.mock("@/lib/current-user", () => ({
  getCurrentViewerContext: vi.fn().mockResolvedValue(null)
}));

function BeginNavigationOnMount({ href }: { href: string }) {
  const { beginNavigation } = useNavigationTransition();

  React.useEffect(() => {
    beginNavigation({ href });
  }, [beginNavigation, href]);

  return null;
}

afterEach(() => {
  cleanup();
  mockPathname = "/";
});

describe("app loading shell", () => {
  it("keeps the real header stable, switches only the tab state, and uses paper skeleton placeholders for content", async () => {
    render(
      <NavigationTransitionProvider>
        <BeginNavigationOnMount href="/memory" />
        {await AppShell({ children: <AppLoading /> })}
      </NavigationTransitionProvider>
    );

    expect(screen.getByTestId("app-loading-notice")).toHaveTextContent("正在打开冒险页...");
    expect(screen.getByTestId("app-loading-notice")).toHaveTextContent("下一页正在准备中");
    expect(screen.getByTestId("app-loading-notice")).toHaveTextContent("页头只更新栏目状态，下面的内容正在接上。");
    expect(screen.getAllByAltText("AgenTales").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "连接 SecondMe" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "首页" }).length).toBeGreaterThan(0);
    screen.getAllByRole("link", { name: "冒险" }).forEach((link) => {
      expect(link).toHaveAttribute("aria-current", "page");
    });
    expect(screen.getAllByTestId("app-loading-transition-block")).toHaveLength(3);
    expect(screen.getAllByTestId("app-loading-transition-row")).toHaveLength(3);
    expect(screen.getAllByTestId("app-loading-paper-title").length).toBeGreaterThanOrEqual(6);
    expect(screen.getAllByTestId("app-loading-paper-line").length).toBeGreaterThanOrEqual(15);
    expect(screen.queryByText("...")).not.toBeInTheDocument();
  });
});
