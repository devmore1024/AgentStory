"use client";

import React from "react";
import { LoadingNotice } from "@/components/loading-notice";
import { useNavigationTransition } from "@/components/navigation-transition-provider";

function PaperSkeletonLine({
  widthClassName,
  className,
  testId
}: {
  widthClassName: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={`h-3 rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.2),rgba(255,255,255,0.72),rgba(255,255,255,0.2))] opacity-90 ${widthClassName} ${className ?? ""}`}
      data-testid={testId}
    />
  );
}

function PaperSkeletonBlock({
  className,
  titleWidthClassName,
  bodyWidths,
  showCover = false,
  showCornerGlow = true,
  testId
}: {
  className?: string;
  titleWidthClassName: string;
  bodyWidths: string[];
  showCover?: boolean;
  showCornerGlow?: boolean;
  testId?: string;
}) {
  return (
    <div
      className={`paper-grain relative overflow-hidden rounded-[32px] border border-[rgba(95,127,98,0.08)] bg-[linear-gradient(180deg,rgba(252,251,250,0.92),rgba(244,235,227,0.88))] p-6 shadow-[var(--shadow-medium)] ${className ?? ""}`}
      data-testid={testId}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.3),transparent_42%,rgba(124,45,18,0.04)_100%)]" />
      {showCornerGlow ? (
        <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-[rgba(202,138,4,0.1)] blur-2xl" />
      ) : null}
      <div className="relative animate-pulse">
        {showCover ? (
          <div className="mb-6 grid gap-5 sm:grid-cols-[10rem_1fr] sm:items-start">
            <div className="h-44 rounded-[24px] border border-[rgba(169,122,78,0.16)] bg-[linear-gradient(180deg,rgba(248,241,234,0.98),rgba(232,219,206,0.9))] shadow-[var(--shadow-small)]" />
            <div className="space-y-3 pt-2">
              <PaperSkeletonLine widthClassName={titleWidthClassName} className="h-4" testId="app-loading-paper-title" />
              {bodyWidths.map((width, index) => (
                <PaperSkeletonLine key={index} widthClassName={width} testId="app-loading-paper-line" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <PaperSkeletonLine widthClassName={titleWidthClassName} className="h-4" testId="app-loading-paper-title" />
            {bodyWidths.map((width, index) => (
              <PaperSkeletonLine key={index} widthClassName={width} testId="app-loading-paper-line" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PaperSkeletonListRow() {
  return (
    <div
      className="paper-grain relative overflow-hidden rounded-[24px] border border-[rgba(95,127,98,0.08)] bg-[linear-gradient(180deg,rgba(255,252,249,0.96),rgba(245,237,230,0.9))] px-5 py-4 shadow-[var(--shadow-small)]"
      data-testid="app-loading-transition-row"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-[24px] bg-[rgba(124,45,18,0.1)]" />
      <div className="relative space-y-3 animate-pulse">
        <PaperSkeletonLine widthClassName="w-24" className="h-3.5" testId="app-loading-paper-title" />
        <PaperSkeletonLine widthClassName="w-4/5" testId="app-loading-paper-line" />
        <PaperSkeletonLine widthClassName="w-2/3" className="opacity-75" testId="app-loading-paper-line" />
      </div>
    </div>
  );
}

export function AppLoadingContent() {
  const { pendingLabel } = useNavigationTransition();

  return (
    <div className="grid gap-6">
      <LoadingNotice
        eyebrow={pendingLabel ?? "页面切换中"}
        title="下一页正在准备中"
        description="页头只更新栏目状态，下面的内容正在接上。"
        testId="app-loading-notice"
      />

      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <PaperSkeletonBlock
          className="min-h-[18rem]"
          titleWidthClassName="w-36"
          bodyWidths={["w-full", "w-5/6", "w-3/4"]}
          showCover
          testId="app-loading-transition-block"
        />
        <PaperSkeletonBlock
          className="min-h-[18rem]"
          titleWidthClassName="w-28"
          bodyWidths={["w-11/12", "w-full", "w-4/5", "w-2/3"]}
          testId="app-loading-transition-block"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <PaperSkeletonBlock
          className="min-h-[16rem]"
          titleWidthClassName="w-32"
          bodyWidths={["w-full", "w-5/6", "w-3/5"]}
          showCornerGlow={false}
          testId="app-loading-transition-block"
        />
        <div className="grid gap-4 rounded-[32px] border border-[rgba(95,127,98,0.08)] bg-[rgba(252,251,250,0.72)] p-5 shadow-[var(--shadow-small)]">
          {Array.from({ length: 3 }).map((_, index) => (
            <PaperSkeletonListRow key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
