import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PageBackButton } from "@/components/page-back-button";

const back = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back,
    push
  })
}));

afterEach(() => {
  cleanup();
  back.mockReset();
  push.mockReset();
});

describe("PageBackButton", () => {
  beforeEach(() => {
    Object.defineProperty(window.history, "length", {
      configurable: true,
      value: 1
    });
  });

  it("pushes the fallback href when there is no page history", () => {
    render(<PageBackButton fallbackHref="/memory" title="冒险详情" />);

    fireEvent.click(screen.getByRole("button", { name: "返回上一页" }));

    expect(back).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/memory");
    expect(screen.getByText("冒险详情")).toBeInTheDocument();
  });

  it("uses browser back when page history is available", () => {
    Object.defineProperty(window.history, "length", {
      configurable: true,
      value: 3
    });

    render(<PageBackButton fallbackHref="/memory" title="冒险详情" />);

    fireEvent.click(screen.getByRole("button", { name: "返回上一页" }));

    expect(back).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });
});
