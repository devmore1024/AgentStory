import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BottomNav } from "@/components/bottom-nav";
import { NavigationTransitionProvider, useNavigationTransition } from "@/components/navigation-transition-provider";
import { PrimaryNav } from "@/components/primary-nav";

let mockPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname
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

function NavigationStateProbe() {
  const { pendingLabel, pendingTab } = useNavigationTransition();

  return (
    <div>
      <p data-testid="pending-label">{pendingLabel ?? "none"}</p>
      <p data-testid="pending-tab">{pendingTab ?? "none"}</p>
    </div>
  );
}

afterEach(() => {
  cleanup();
  mockPathname = "/";
});

describe("NavigationTransitionProvider", () => {
  it("shows a route-specific pending toast when an internal link is clicked", () => {
    render(
      <NavigationTransitionProvider>
        <a
          href="/adventure/thread-1"
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          打开同行故事
        </a>
        <NavigationStateProbe />
      </NavigationTransitionProvider>
    );

    fireEvent.click(screen.getByRole("link", { name: "打开同行故事" }));

    expect(screen.getByTestId("pending-label")).toHaveTextContent("正在打开同行故事...");
    expect(screen.getByTestId("pending-tab")).toHaveTextContent("adventure");
    expect(screen.getByTestId("pending-navigation-toast")).toHaveTextContent("正在打开同行故事...");
  });

  it("clears the pending state after the pathname changes", async () => {
    const view = render(
      <NavigationTransitionProvider>
        <a
          href="/memory"
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          打开冒险页
        </a>
        <NavigationStateProbe />
      </NavigationTransitionProvider>
    );

    fireEvent.click(screen.getByRole("link", { name: "打开冒险页" }));
    expect(screen.getByTestId("pending-label")).toHaveTextContent("正在打开冒险页...");

    mockPathname = "/memory";
    view.rerender(
      <NavigationTransitionProvider>
        <a
          href="/memory"
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          打开冒险页
        </a>
        <NavigationStateProbe />
      </NavigationTransitionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("pending-label")).toHaveTextContent("none");
    });
    expect(screen.queryByTestId("pending-navigation-toast")).not.toBeInTheDocument();
  });

  it("optimistically highlights the tapped target tab in the bottom navigation", () => {
    render(
      <NavigationTransitionProvider>
        <BottomNav activeTab="home" />
      </NavigationTransitionProvider>
    );

    const targetLink = screen.getByRole("link", { name: "冒险" });

    expect(targetLink).not.toHaveAttribute("aria-current");

    fireEvent.click(targetLink);

    expect(targetLink).toHaveAttribute("aria-current", "page");
  });

  it("optimistically highlights the clicked target tab in the desktop navigation", () => {
    render(
      <NavigationTransitionProvider>
        <PrimaryNav activeTab="home" />
      </NavigationTransitionProvider>
    );

    const targetLink = screen.getByRole("link", { name: "我的" });

    expect(targetLink).not.toHaveAttribute("aria-current");

    fireEvent.click(targetLink);

    expect(targetLink).toHaveAttribute("aria-current", "page");
  });
});
