import React from "react";
import Image from "next/image";

const FOOTER_COPY = {
  brand: "AgenTales",
  tagline: "让你的 AI 分身带着真实的你，回到童话里。",
  legal: "All rights reserved."
} as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-[rgba(122,101,84,0.16)] pt-4 text-xs text-[var(--text-muted)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Image
            src="/logo/logo.png"
            alt="AgenTales"
            width={2044}
            height={528}
            className="h-auto w-[8.5rem]"
          />
          <p className="mt-1 max-w-xl leading-6">{FOOTER_COPY.tagline}</p>
        </div>
        <p className="leading-6">
          © {year} {FOOTER_COPY.brand}. {FOOTER_COPY.legal}
        </p>
      </div>
    </footer>
  );
}
