"use client";

import React, { useState } from "react";
import Link from "next/link";

type StoryFootprintTab = "owned" | "joined";

type StoryFootprintItem = {
  id: string;
  title: string;
};

type StoryFootprintTabsProps = {
  ownedCount: number;
  joinedCount: number;
  ownedItems: StoryFootprintItem[];
  joinedItems: StoryFootprintItem[];
};

const TAB_COPY = {
  eyebrow: "我的足迹",
  owned: "冒险",
  joined: "同行",
  ownedTitle: "我先走进去的童话",
  joinedTitle: "我同行过的童话",
  ownedEmpty: "你还没有先走进去过任何一则童话。",
  joinedEmpty: "你还没有加入过别人的同行故事。"
} as const;

export function StoryFootprintTabs({
  ownedCount,
  joinedCount,
  ownedItems,
  joinedItems
}: StoryFootprintTabsProps) {
  const [activeTab, setActiveTab] = useState<StoryFootprintTab>("owned");
  const isOwnedTab = activeTab === "owned";
  const activeItems = isOwnedTab ? ownedItems : joinedItems;

  return (
    <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.84)] p-6 shadow-[var(--shadow-medium)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{TAB_COPY.eyebrow}</p>

      <div className="mt-4 border-b border-[var(--border-light)]">
        <div className="flex items-end gap-8">
          <button
            type="button"
            onClick={() => setActiveTab("owned")}
            className={`inline-flex items-center gap-3 border-b-[3px] px-1 pb-3 text-left transition ${
              isOwnedTab
                ? "border-[var(--apricot)] text-[var(--apricot)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <span className="text-2xl font-semibold">{TAB_COPY.owned}</span>
            <span className="text-sm font-semibold opacity-80">{ownedCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("joined")}
            className={`inline-flex items-center gap-3 border-b-[3px] px-1 pb-3 text-left transition ${
              isOwnedTab
                ? "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                : "border-[var(--apricot)] text-[var(--apricot)]"
            }`}
          >
            <span className="text-2xl font-semibold">{TAB_COPY.joined}</span>
            <span className="text-sm font-semibold opacity-80">{joinedCount}</span>
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-[22px] bg-[rgba(255,255,255,0.68)] p-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {isOwnedTab ? TAB_COPY.ownedTitle : TAB_COPY.joinedTitle}
        </p>

        {activeItems.length > 0 ? (
          <div className="mt-3 space-y-3">
            {activeItems.map((item) => (
              <Link
                key={item.id}
                href={`/adventure/${item.id}`}
                className="block rounded-[16px] px-1 py-1 text-sm leading-6 text-[var(--text-secondary)] transition hover:text-[var(--accent-moss)]"
              >
                {item.title}
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            {isOwnedTab ? TAB_COPY.ownedEmpty : TAB_COPY.joinedEmpty}
          </p>
        )}
      </div>
    </section>
  );
}
