"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  kind?: "primary" | "secondary";
};

export function SubmitButton({ idleLabel, pendingLabel, kind = "primary" }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  const className =
    kind === "primary"
      ? "flex min-h-11 items-center justify-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)] transition hover:bg-[var(--accent-moss-hover)] disabled:cursor-not-allowed disabled:opacity-70"
      : "flex min-h-11 items-center justify-center rounded-full border border-[var(--border-default)] bg-[rgba(255,255,255,0.8)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-small)] transition hover:border-[var(--accent-moss)] hover:text-[var(--accent-moss)] disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
