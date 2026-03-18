import type { ComponentProps } from "react";
import Link from "next/link";

type StateCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  href?: ComponentProps<typeof Link>["href"];
  actionLabel?: string;
};

export function StateCard({ eyebrow, title, description, href, actionLabel }: StateCardProps) {
  const content = (
    <div className="rounded-[28px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.86)] p-6 shadow-[var(--shadow-medium)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{eyebrow}</p>
      <h2 className="display-font mt-2 text-2xl text-[var(--text-primary)]">{title}</h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">{description}</p>
      {href && actionLabel ? (
        <span className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]">
          {actionLabel}
        </span>
      ) : null}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
