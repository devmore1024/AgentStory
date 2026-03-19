import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import AppLoading from "@/app/loading";

afterEach(() => {
  cleanup();
});

describe("app loading shell", () => {
  it("renders a neutral loading notice instead of highlighting the home tab", () => {
    render(<AppLoading />);

    expect(screen.getByTestId("app-loading-notice")).toHaveTextContent("页面切换中");
    expect(screen.getByTestId("app-loading-notice")).toHaveTextContent("下一页正在准备");
    expect(screen.getByTestId("app-loading-notice")).toHaveTextContent("你点开的页面正在渲染中，马上就会出现。");
    expect(screen.queryByRole("link", { name: "首页" })).not.toBeInTheDocument();
  });
});
