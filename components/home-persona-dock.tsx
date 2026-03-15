"use client";

import { useState } from "react";
import Link from "next/link";
import type { AnimalPersona } from "@/lib/animal-personas";
import { PersonaBadge } from "@/components/persona-badge";

type HomePersonaDockProps = {
  persona: AnimalPersona;
  currentBookTitle?: string | null;
  currentEpisodeExcerpt?: string | null;
  statusLabel?: string | null;
};

export function HomePersonaDock({
  persona,
  currentBookTitle,
  currentEpisodeExcerpt,
  statusLabel
}: HomePersonaDockProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed bottom-28 left-4 z-40 sm:left-6 lg:bottom-8 lg:left-8">
      <div className="pointer-events-auto relative">
        {isOpen ? (
          <div className="absolute bottom-[calc(100%+0.9rem)] left-0 w-[min(20rem,calc(100vw-2rem))] rounded-[28px] border border-[var(--border-light)] bg-[rgba(255,250,243,0.96)] p-4 shadow-[var(--shadow-large)] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <PersonaBadge animalType={persona.animalType} size="sm" variant="paper" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">动物人格</p>
                  <h2 className="display-font mt-1 text-2xl text-[var(--text-primary)]">{persona.animalName}</h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{persona.summary}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-default)] bg-[rgba(255,255,255,0.72)] text-sm font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent-moss)] hover:text-[var(--accent-moss)]"
                aria-label="关闭动物人格卡片"
              >
                ×
              </button>
            </div>

            <div className="mt-4 rounded-[20px] bg-[rgba(255,255,255,0.72)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {statusLabel ?? "正在进入"}
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">《{currentBookTitle ?? "新的故事"}》</p>
              {currentEpisodeExcerpt ? (
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{currentEpisodeExcerpt}</p>
              ) : null}
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-moss)]">
                Agent 正在改写这本书
              </p>
            </div>

            <Link
              href="/me"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)] transition hover:bg-[var(--accent-moss-hover)]"
            >
              去我的页查看完整档案
            </Link>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="group relative rounded-[24px] bg-transparent"
          aria-expanded={isOpen}
          aria-label={isOpen ? "收起动物人格卡片" : "打开动物人格卡片"}
        >
          <div className="absolute inset-0 rounded-[24px] bg-[rgba(255,250,243,0.74)] blur-xl transition group-hover:bg-[rgba(255,250,243,0.9)]" />
          <div className="relative flex items-center gap-3 rounded-[24px] border border-[var(--border-light)] bg-[rgba(255,250,243,0.92)] px-2 py-2 pr-4 shadow-[var(--shadow-medium)] backdrop-blur">
            <PersonaBadge animalType={persona.animalType} size="sm" variant="paper" />
            <div className="text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {statusLabel ?? "正在进入"}
              </p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">《{currentBookTitle ?? "新的故事"}》</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
