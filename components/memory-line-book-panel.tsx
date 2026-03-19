import React from "react";
import Link from "next/link";
import { CoverArtImage } from "@/components/cover-art-image";
import { resolveCoverAsset } from "@/lib/cover-assets";
import type { StoryBook } from "@/lib/story-data";

type MemoryLineBookPanelProps = {
  book: StoryBook;
  variant?: "desktop" | "mobileInline";
};

export function MemoryLineBookPanel({ book, variant = "desktop" }: MemoryLineBookPanelProps) {
  const coverAsset = resolveCoverAsset(book);
  const isMobileInline = variant === "mobileInline";
  const wrapperClass = isMobileInline
    ? "group block w-[44px] shrink-0"
    : "group block w-[92px] shrink-0 sm:w-[112px] lg:w-[148px] xl:w-[168px]";
  const frameClass = isMobileInline
    ? "paper-grain relative aspect-[4/5] overflow-hidden rounded-[12px] border border-[rgba(255,245,236,0.72)] bg-[linear-gradient(180deg,rgba(246,233,216,0.9),rgba(136,70,56,0.36))] shadow-[0_8px_18px_rgba(76,37,30,0.12)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_24px_rgba(76,37,30,0.16)]"
    : "paper-grain relative aspect-[4/5] overflow-hidden rounded-[22px] border border-[rgba(255,245,236,0.75)] bg-[linear-gradient(180deg,rgba(246,233,216,0.92),rgba(136,70,56,0.42))] shadow-[0_14px_34px_rgba(76,37,30,0.14)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_42px_rgba(76,37,30,0.18)]";
  const variantName = isMobileInline ? "memoryLineBookPanelMobileInline" : "memoryLineBookPanel";
  const testId = isMobileInline ? "memory-line-book-panel-mobile-inline" : "memory-line-book-panel";

  return (
    <Link
      href={`/books/${book.slug}`}
      aria-label={`阅读《${book.title}》原故事`}
      className={wrapperClass}
      data-testid={testId}
    >
      <div
        className={frameClass}
        data-cover-source={coverAsset.isExternal ? "external" : "local"}
        data-cover-variant={variantName}
      >
        <CoverArtImage
          src={coverAsset.src}
          fallbackSrc={coverAsset.fallbackSrc}
          alt={`${book.title} 封面`}
          className="absolute inset-0 h-full w-full object-cover"
          objectPosition={coverAsset.objectPosition}
          isExternal={coverAsset.isExternal}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,248,236,0.24),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(67,47,34,0.18))]" />
      </div>
    </Link>
  );
}
