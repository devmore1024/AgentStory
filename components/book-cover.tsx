import Link from "next/link";
import { CoverArtImage } from "@/components/cover-art-image";
import { resolveCoverAsset } from "@/lib/cover-assets";
import type { StoryBook } from "@/lib/story-data";

const categoryStyles: Record<StoryBook["categoryKey"], string> = {
  fairy_tale:
    "from-[rgba(124,45,18,0.85)] via-[rgba(185,28,28,0.7)] to-[rgba(254,242,242,0.9)]",
  fable:
    "from-[rgba(202,138,4,0.85)] via-[rgba(169,122,78,0.8)] to-[rgba(254,252,232,0.9)]",
  mythology:
    "from-[rgba(75,85,99,0.85)] via-[rgba(107,114,128,0.8)] to-[rgba(243,244,246,0.9)]"
};

const categoryAccent: Record<StoryBook["categoryKey"], string> = {
  fairy_tale: "bg-[rgba(184,92,92,0.12)] text-[var(--berry)]",
  fable: "bg-[var(--accent-moss-light)] text-[var(--accent-moss)]",
  mythology: "bg-[var(--sky-light)] text-[var(--sky)]"
};

type BookCoverProps = {
  book: StoryBook;
  variant?: "default" | "homeFairy";
};

export function BookCover({ book, variant = "default" }: BookCoverProps) {
  const coverAsset = resolveCoverAsset(book);
  const isHomeFairy = variant === "homeFairy";
  const frameClass = isHomeFairy
    ? "bg-[linear-gradient(180deg,rgba(246,233,216,0.92),rgba(136,70,56,0.42))]"
    : `bg-gradient-to-br ${categoryStyles[book.categoryKey]}`;
  const cardClass = isHomeFairy
    ? "group flex h-full flex-col rounded-[24px] border border-[rgba(202,173,142,0.55)] bg-[rgba(252,248,243,0.92)] p-3 shadow-[0_12px_28px_rgba(76,37,30,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(76,37,30,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-moss)]"
    : "group flex h-full flex-col rounded-[22px] border border-[rgba(255,255,255,0.55)] bg-[var(--background-card)] p-3 shadow-[var(--shadow-shelf)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-large)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-moss)]";

  return (
    <Link href={`/books/${book.slug}`} className={cardClass}>
      <div
        className={`paper-grain relative mb-3 aspect-[4/5] overflow-hidden rounded-[18px] border p-0 ${
          isHomeFairy
            ? "border-[rgba(255,245,236,0.75)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
            : "border-[rgba(255,255,255,0.45)]"
        } ${frameClass}`}
        data-cover-source={coverAsset.isExternal ? "external" : "local"}
        data-cover-variant={variant}
      >
        <CoverArtImage
          src={coverAsset.src}
          fallbackSrc={coverAsset.fallbackSrc}
          alt={`${book.title} 封面`}
          className="absolute inset-0 h-full w-full object-cover"
          objectPosition={coverAsset.objectPosition}
          isExternal={coverAsset.isExternal}
        />
        <div
          className={`absolute inset-0 ${
            isHomeFairy
              ? "bg-[radial-gradient(circle_at_18%_18%,rgba(255,248,236,0.24),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(67,47,34,0.18))]"
              : "bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(67,47,34,0.16))]"
          }`}
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-4">
          {isHomeFairy ? <div className="pointer-events-none h-8 w-8 rounded-full bg-[rgba(255,243,228,0.42)]" /> : null}
          {!isHomeFairy ? (
            <span
              className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] ${categoryAccent[book.categoryKey]}`}
            >
              {book.categoryName}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mb-2 mt-1 px-1">
        <h3 className="display-font text-lg font-bold leading-tight text-[var(--text-primary)]">{book.title}</h3>
      </div>
      <p className={`px-1 text-sm leading-6 text-[var(--text-secondary)] ${isHomeFairy ? "line-clamp-4" : "line-clamp-3"}`}>
        {book.summary}
      </p>
    </Link>
  );
}
