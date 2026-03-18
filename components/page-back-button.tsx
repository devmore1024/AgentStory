"use client";

import React from "react";
import { useRouter } from "next/navigation";

type PageBackButtonProps = {
  fallbackHref: string;
  title: string;
  label?: string;
};

export function PageBackButton({ fallbackHref, title, label = "返回上一页" }: PageBackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref as never);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className="inline-flex min-h-11 items-center gap-4 rounded-[20px] px-1 py-1 text-left text-[var(--text-primary)] transition hover:text-[var(--accent-moss)]"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
      </span>
      <span className="display-font text-3xl leading-none sm:text-4xl">{title}</span>
    </button>
  );
}
