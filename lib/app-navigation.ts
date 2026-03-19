export type AppTab = "home" | "memory" | "adventure" | "me";

export const primaryNavItems = [
  { href: "/", label: "首页", tab: "home", icon: "书" },
  { href: "/memory", label: "冒险", tab: "memory", icon: "探" },
  { href: "/adventure", label: "同行", tab: "adventure", icon: "伴" },
  { href: "/me", label: "我的", tab: "me", icon: "我" }
] as const;

export function getAppTabForPath(pathname: string): AppTab | null {
  if (pathname === "/" || pathname.startsWith("/books") || pathname.startsWith("/story")) {
    return "home";
  }

  if (pathname.startsWith("/memory")) {
    return "memory";
  }

  if (pathname.startsWith("/adventure") || pathname.startsWith("/discover")) {
    return "adventure";
  }

  if (pathname.startsWith("/me")) {
    return "me";
  }

  return null;
}

export function getNavigationPendingLabel(pathname: string) {
  if (pathname === "/") {
    return "正在打开首页...";
  }

  if (pathname.startsWith("/memory/")) {
    return "正在打开冒险故事...";
  }

  if (pathname === "/memory") {
    return "正在打开冒险页...";
  }

  if (pathname.startsWith("/adventure/")) {
    return "正在打开同行故事...";
  }

  if (pathname === "/adventure" || pathname === "/discover") {
    return "正在打开同行页...";
  }

  if (pathname.startsWith("/me/share")) {
    return "正在打开分享详情...";
  }

  if (pathname.startsWith("/me/personas")) {
    return "正在打开人格图谱...";
  }

  if (pathname.startsWith("/me")) {
    return "正在打开我的页面...";
  }

  if (pathname.startsWith("/books/")) {
    return "正在打开童话故事...";
  }

  return "正在打开页面...";
}
