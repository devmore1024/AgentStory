import React from "react";
import type { Route } from "next";
import Link from "next/link";

type HomeAdventurePreviewProps = {
  eyebrow: string;
  bookTitle: string;
  statusLabel: string;
  previewHref: Route;
  actionLabel: string;
  reunionTitle: string;
  reunionBody: string;
  companionBody: string;
};

export function HomeAdventurePreview({
  eyebrow,
  bookTitle,
  statusLabel,
  previewHref,
  actionLabel,
  reunionTitle,
  reunionBody,
  companionBody
}: HomeAdventurePreviewProps) {
  return (
    <div
      data-testid="home-adventure-preview"
      className="hidden rounded-[30px] border border-[rgba(255,247,240,0.72)] bg-[rgba(255,251,247,0.72)] p-5 shadow-[var(--shadow-medium)] backdrop-blur lg:block"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">{eyebrow}</p>
      <h2 className="display-font mt-3 text-2xl leading-tight text-[var(--text-primary)]">《{bookTitle}》</h2>
      <p className="mt-3 text-sm font-semibold text-[var(--accent-moss)]">{statusLabel}</p>
      <div className="mt-5 grid gap-3 text-sm leading-6 text-[var(--text-secondary)] sm:grid-cols-2">
        <div>
          <p className="font-semibold text-[var(--text-primary)]">{reunionTitle}</p>
          <p>{reunionBody}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--text-primary)]">和别人的分身同行</p>
          <p>{companionBody}</p>
        </div>
      </div>
      <div className="mt-5">
        <Link
          href={previewHref}
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent-moss)] hover:text-[var(--accent-moss)]"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}
