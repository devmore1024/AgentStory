import Link from "next/link";
import { CoverArtImage } from "@/components/cover-art-image";
import { resolveCoverAsset } from "@/lib/cover-assets";
import type { StoryBook } from "@/lib/story-data";

const categoryStyles: Record<StoryBook["categoryKey"], string> = {
  fairy_tale:
    "from-[rgba(217,146,91,0.95)] via-[rgba(232,190,138,0.92)] to-[rgba(247,227,225,0.95)]",
  fable:
    "from-[rgba(95,127,98,0.96)] via-[rgba(157,184,150,0.92)] to-[rgba(231,239,230,0.96)]",
  mythology:
    "from-[rgba(134,169,201,0.96)] via-[rgba(172,194,217,0.92)] to-[rgba(233,241,248,0.95)]"
};

const categoryAccent: Record<StoryBook["categoryKey"], string> = {
  fairy_tale: "bg-[rgba(184,92,92,0.12)] text-[var(--berry)]",
  fable: "bg-[var(--accent-moss-light)] text-[var(--accent-moss)]",
  mythology: "bg-[var(--sky-light)] text-[var(--sky)]"
};

export function BookCover({ book }: { book: StoryBook }) {
  const coverAsset = resolveCoverAsset(book);

  return (
    <Link
      href={`/books/${book.slug}`}
      className="group flex h-full flex-col rounded-[22px] border border-[rgba(255,255,255,0.55)] bg-[var(--background-card)] p-3 shadow-[var(--shadow-shelf)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-large)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-moss)]"
    >
      <div
        className={`paper-grain relative mb-3 aspect-[4/5] overflow-hidden rounded-[18px] border border-[rgba(255,255,255,0.45)] bg-gradient-to-br ${categoryStyles[book.categoryKey]} p-4`}
        data-cover-source={coverAsset.isExternal ? "external" : "local"}
      >
        <CoverArtImage
          src={coverAsset.src}
          fallbackSrc={coverAsset.fallbackSrc}
          alt={`${book.title} 封面`}
          className="absolute inset-0 h-full w-full object-cover"
          objectPosition={coverAsset.objectPosition}
          isExternal={coverAsset.isExternal}
        />
        <div className="absolute inset-0" style={{ background: coverAsset.tint.overlay }} />
        <div className="absolute inset-0 mix-blend-screen" style={{ background: coverAsset.tint.glow }} />
        <div className="absolute inset-x-0 bottom-0 h-[56%]" style={{ background: coverAsset.tint.shadow }} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(67,47,34,0.16))]" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <span
            className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] ${categoryAccent[book.categoryKey]}`}
          >
            {book.categoryName}
          </span>
          <div
            className="rounded-[18px] border border-[rgba(255,255,255,0.46)] p-3 shadow-[var(--shadow-small)] backdrop-blur"
            style={{ background: coverAsset.tint.panel }}
          >
            <h3 className="display-font text-lg leading-tight text-[var(--text-primary)]">{book.title}</h3>
          </div>
        </div>
      </div>

      <p className="line-clamp-3 text-sm leading-6 text-[var(--text-secondary)]">{book.summary}</p>
    </Link>
  );
}
