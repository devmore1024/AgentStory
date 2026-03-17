"use client";

import Link from "next/link";

type BottomNavProps = {
  activeTab: "home" | "adventure" | "memory" | "me";
};

const items = [
  { href: "/", label: "首页", tab: "home", icon: "书" },
  { href: "/adventure", label: "冒险", tab: "adventure", icon: "险" },
  { href: "/memory", label: "回忆", tab: "memory", icon: "忆" },
  { href: "/me", label: "我的", tab: "me", icon: "我" }
] as const;

export function BottomNav({ activeTab }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-4 z-50 px-4 lg:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-between rounded-full border border-[var(--border-default)] bg-[rgba(252,251,250,0.92)] px-2 py-2 shadow-[var(--shadow-large)] backdrop-blur">
        {items.map((item) => {
          const isActive = item.tab === activeTab;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`flex min-h-11 min-w-11 flex-1 items-center justify-center gap-2 rounded-full px-3 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-[var(--accent-moss)] text-[var(--text-on-accent)]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                  isActive ? "bg-[rgba(255,255,255,0.18)]" : "bg-[var(--accent-moss-light)] text-[var(--accent-moss)]"
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
