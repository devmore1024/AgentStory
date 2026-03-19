import React from "react";

type LoadingNoticeProps = {
  eyebrow: string;
  title: string;
  description: string;
  testId?: string;
};

export function LoadingNotice({ eyebrow, title, description, testId }: LoadingNoticeProps) {
  return (
    <section
      className="rounded-[28px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.86)] p-5 shadow-[var(--shadow-small)]"
      data-testid={testId}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{eyebrow}</p>
      <h2 className="display-font mt-2 text-2xl text-[var(--text-primary)]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
    </section>
  );
}
