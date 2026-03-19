import React from "react";

type SecondaryPageLoadingLayout = "book" | "story-detail" | "share";

type SecondaryPageLoadingShellProps = {
  activeTab: "home" | "memory" | "adventure" | "me";
  title: string;
  layout: SecondaryPageLoadingLayout;
};

function LoadingBackHeader({ title }: { title: string }) {
  return (
    <div
      className="inline-flex min-h-11 items-center gap-4 rounded-[20px] px-1 py-1 text-left text-[var(--text-primary)]"
      data-testid="secondary-loading-back"
    >
      <span className="inline-flex h-11 w-11 animate-pulse rounded-full bg-[rgba(255,250,243,0.82)]" />
      <span className="display-font text-3xl leading-none text-[var(--text-primary)] sm:text-4xl">{title}</span>
    </div>
  );
}

function BookPageSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]" data-testid="secondary-loading-shell-book">
      <div className="h-[29rem] animate-pulse rounded-[32px] bg-[rgba(255,250,243,0.8)] shadow-[var(--shadow-medium)]" />
      <div className="grid gap-6">
        <div className="h-72 animate-pulse rounded-[32px] bg-[rgba(252,251,250,0.86)] shadow-[var(--shadow-medium)]" />
        <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
          <div className="h-64 animate-pulse rounded-[32px] bg-[rgba(255,250,243,0.78)] shadow-[var(--shadow-medium)]" />
          <div className="h-64 animate-pulse rounded-[32px] bg-[rgba(255,250,243,0.78)] shadow-[var(--shadow-medium)]" />
        </div>
        <div className="h-52 animate-pulse rounded-[32px] bg-[rgba(252,251,250,0.84)] shadow-[var(--shadow-medium)]" />
      </div>
    </div>
  );
}

function StoryDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]" data-testid="secondary-loading-shell-story-detail">
      <div className="h-[24rem] animate-pulse rounded-[32px] bg-[rgba(255,250,243,0.8)] shadow-[var(--shadow-medium)]" />
      <div className="grid gap-6">
        <div className="h-72 animate-pulse rounded-[30px] bg-[rgba(252,251,250,0.86)] shadow-[var(--shadow-medium)]" />
        <div className="h-40 animate-pulse rounded-[28px] bg-[rgba(255,250,243,0.78)] shadow-[var(--shadow-medium)]" />
        <div className="h-64 animate-pulse rounded-[28px] bg-[rgba(252,251,250,0.84)] shadow-[var(--shadow-medium)]" />
        <div className="h-64 animate-pulse rounded-[28px] bg-[rgba(252,251,250,0.84)] shadow-[var(--shadow-medium)]" />
      </div>
    </div>
  );
}

function SharePageSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]" data-testid="secondary-loading-shell-share">
      <div className="h-[32rem] animate-pulse rounded-[32px] bg-[rgba(252,251,250,0.86)] shadow-[var(--shadow-medium)]" />
      <div className="grid gap-6">
        <div className="h-80 animate-pulse rounded-[32px] bg-[rgba(255,250,243,0.8)] shadow-[var(--shadow-medium)]" />
        <div className="h-72 animate-pulse rounded-[32px] bg-[rgba(252,251,250,0.84)] shadow-[var(--shadow-medium)]" />
      </div>
    </div>
  );
}

export function SecondaryPageLoadingShell({
  activeTab,
  title,
  layout
}: SecondaryPageLoadingShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden pb-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-7rem] top-28 h-56 w-56 rounded-full bg-[rgba(124,45,18,0.13)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-7rem] top-24 h-56 w-56 rounded-full bg-[rgba(75,85,99,0.18)] blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-4 pt-5 sm:px-6 lg:px-8">
        <div className="mb-6 h-[76px] animate-pulse rounded-[28px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.82)] shadow-[var(--shadow-small)]" />
        <main className="flex-1">
          <div className="grid gap-6">
            <LoadingBackHeader title={title} />
            {layout === "book" ? <BookPageSkeleton /> : null}
            {layout === "story-detail" ? <StoryDetailSkeleton /> : null}
            {layout === "share" ? <SharePageSkeleton /> : null}
          </div>
        </main>
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 px-4 lg:hidden">
        <div className="mx-auto h-[72px] max-w-xl animate-pulse rounded-full border border-[var(--border-default)] bg-[rgba(252,251,250,0.92)] shadow-[var(--shadow-large)]" />
      </div>
    </div>
  );
}
