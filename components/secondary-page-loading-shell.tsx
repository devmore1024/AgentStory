import React from "react";
import { LoadingNotice } from "@/components/loading-notice";

type SecondaryPageLoadingLayout = "book" | "story-detail" | "share";

type SecondaryPageLoadingShellProps = {
  activeTab?: "home" | "memory" | "adventure" | "me";
  title: string;
  layout: SecondaryPageLoadingLayout;
};

const loadingCopyByLayout: Record<
  SecondaryPageLoadingLayout,
  {
    eyebrow: string;
    title: string;
    description: string;
  }
> = {
  book: {
    eyebrow: "正在打开童话故事",
    title: "这一页正在翻开",
    description: "封面、简介和进入方式正在准备中，请稍等一下。"
  },
  "story-detail": {
    eyebrow: "正在打开故事详情",
    title: "这一页正在落下来",
    description: "当前章节、分身信息和操作入口正在准备中，请稍等一下。"
  },
  share: {
    eyebrow: "正在打开分享详情",
    title: "分享页正在准备",
    description: "分享文案和可展示的人格卡正在整理中，请稍等一下。"
  }
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
  activeTab: _activeTab,
  title,
  layout
}: SecondaryPageLoadingShellProps) {
  const loadingCopy = loadingCopyByLayout[layout];

  return (
    <div className="grid gap-6">
      <LoadingBackHeader title={title} />
      <LoadingNotice
        eyebrow={loadingCopy.eyebrow}
        title={loadingCopy.title}
        description={loadingCopy.description}
        testId="secondary-loading-notice"
      />
      {layout === "book" ? <BookPageSkeleton /> : null}
      {layout === "story-detail" ? <StoryDetailSkeleton /> : null}
      {layout === "share" ? <SharePageSkeleton /> : null}
    </div>
  );
}
