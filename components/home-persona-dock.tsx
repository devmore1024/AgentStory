"use client";

import React from "react";
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

const DOCK_COPY = {
  fallbackStatus: "正在冒险",
  footer: "你的分身还在童话里继续冒险",
  actionLabel: "去看这段冒险"
} as const;

function truncateMobileExcerpt(value: string, maxLength = 50) {
  const chars = Array.from(value.trim());

  if (chars.length <= maxLength) {
    return value.trim();
  }

  return `${chars.slice(0, maxLength).join("")}...`;
}

export function HomePersonaDock({
  persona,
  currentBookTitle,
  currentEpisodeExcerpt,
  statusLabel
}: HomePersonaDockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mobileExcerpt = currentEpisodeExcerpt ? truncateMobileExcerpt(currentEpisodeExcerpt) : null;

  return (
    <div className="pointer-events-none fixed bottom-28 left-4 z-40 sm:left-6 lg:bottom-8 lg:left-8">
      <div className="pointer-events-auto relative">
        {isOpen ? (
          <div className="absolute bottom-[calc(100%+0.9rem)] left-0 w-[min(20rem,calc(100vw-2rem))] rounded-[28px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.96)] p-4 shadow-[var(--shadow-large)] backdrop-blur">
            <div className="flex items-start justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-default)] bg-[rgba(255,255,255,0.72)] text-sm font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent-moss)] hover:text-[var(--accent-moss)]"
                aria-label="关闭分身卡片"
              >
                ×
              </button>
            </div>

            <div className="lg:hidden">
              <div data-testid="home-persona-dock-mobile-card" className="rounded-[20px] bg-[rgba(255,255,255,0.72)] p-4">
                <div className="flex items-start gap-3">
                  <PersonaBadge animalType={persona.animalType} size="sm" variant="paper" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      {statusLabel ?? DOCK_COPY.fallbackStatus}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">《{currentBookTitle ?? "新的故事"}》</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                  你的分身会先以动物人格出现。{persona.summary}
                </p>
                {mobileExcerpt ? (
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{mobileExcerpt}</p>
                ) : null}
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-moss)]">
                  {DOCK_COPY.footer}
                </p>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="flex items-start gap-3">
                <PersonaBadge animalType={persona.animalType} size="sm" variant="paper" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">你的分身</p>
                  <h2 className="display-font mt-1 text-2xl text-[var(--text-primary)]">{persona.animalName}</h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    你的分身会先以动物人格出现。{persona.summary}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[20px] bg-[rgba(255,255,255,0.72)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {statusLabel ?? DOCK_COPY.fallbackStatus}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">《{currentBookTitle ?? "新的故事"}》</p>
                {currentEpisodeExcerpt ? (
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{currentEpisodeExcerpt}</p>
                ) : null}
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-moss)]">
                  {DOCK_COPY.footer}
                </p>
              </div>
            </div>

            <Link
              href="/memory"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)] transition hover:bg-[var(--accent-moss-hover)]"
            >
              {DOCK_COPY.actionLabel}
            </Link>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="group relative rounded-[24px] bg-transparent"
          aria-expanded={isOpen}
          aria-label={isOpen ? "收起分身卡片" : "打开分身卡片"}
        >
          <div className="absolute inset-0 rounded-[24px] bg-[rgba(252,251,250,0.74)] blur-xl transition group-hover:bg-[rgba(252,251,250,0.9)]" />
          <div className="relative flex items-center gap-3 rounded-[24px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.92)] px-2 py-2 pr-4 shadow-[var(--shadow-medium)] backdrop-blur">
            <PersonaBadge animalType={persona.animalType} size="sm" variant="paper" />
            <div className="text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {statusLabel ?? DOCK_COPY.fallbackStatus}
              </p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">《{currentBookTitle ?? "新的故事"}》</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
