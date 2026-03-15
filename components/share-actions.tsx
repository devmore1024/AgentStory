"use client";

import { useState } from "react";

type ShareActionsProps = {
  shareUrl: string;
  shareTitle: string;
  shareText: string;
};

export function ShareActions({ shareUrl, shareTitle, shareText }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const resolvedShareUrl =
    typeof window === "undefined" ? shareUrl : new URL(shareUrl, window.location.origin).toString();

  async function handleCopy() {
    await navigator.clipboard.writeText(resolvedShareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: resolvedShareUrl
      });
      return;
    }

    await handleCopy();
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
      >
        分享动物人格卡
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] bg-[rgba(255,255,255,0.74)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)]"
      >
        {copied ? "链接已复制" : "复制链接"}
      </button>
    </div>
  );
}
