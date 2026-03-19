"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigationTransition } from "@/components/navigation-transition-provider";
import { getAppTabForPath, primaryNavItems, type AppTab } from "@/lib/app-navigation";

type PrimaryNavProps = {
  activeTab?: AppTab;
};

export function PrimaryNav({ activeTab }: PrimaryNavProps) {
  const pathname = usePathname();
  const { pendingTab } = useNavigationTransition();
  const baseActiveTab = activeTab ?? getAppTabForPath(pathname) ?? "home";
  const visibleActiveTab = pendingTab ?? baseActiveTab;

  return (
    <nav className="flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[rgba(255,255,255,0.5)] p-1">
      {primaryNavItems.map((item) => {
        const isActive = item.tab === visibleActiveTab;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-[var(--accent-moss)] text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
                : "text-[var(--text-secondary)] hover:bg-[rgba(95,127,98,0.08)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
