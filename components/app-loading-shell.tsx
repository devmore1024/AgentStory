import React from "react";
import { LoadingNotice } from "@/components/loading-notice";

export function AppLoadingShell() {
  return (
    <div className="relative min-h-screen overflow-x-hidden pb-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-7rem] top-28 h-56 w-56 rounded-full bg-[rgba(124,45,18,0.13)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-7rem] top-24 h-56 w-56 rounded-full bg-[rgba(75,85,99,0.18)] blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-4 pt-5 sm:px-6 lg:px-8">
        <div className="mb-6 h-[76px] animate-pulse rounded-[28px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.82)] shadow-[var(--shadow-small)]" />
        <main className="flex-1">
          <div className="grid gap-6">
            <LoadingNotice
              eyebrow="页面切换中"
              title="下一页正在准备"
              description="你点开的页面正在渲染中，马上就会出现。"
              testId="app-loading-notice"
            />
            <div className="h-64 animate-pulse rounded-[32px] bg-[rgba(255,250,243,0.75)] shadow-[var(--shadow-medium)]" />
            <div className="h-72 animate-pulse rounded-[32px] bg-[rgba(236,215,189,0.62)] shadow-[var(--shadow-medium)]" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[4/5] animate-pulse rounded-[24px] bg-[rgba(255,250,243,0.78)] shadow-[var(--shadow-small)]"
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 px-4 lg:hidden">
        <div className="mx-auto h-[72px] max-w-xl animate-pulse rounded-full border border-[var(--border-default)] bg-[rgba(252,251,250,0.92)] shadow-[var(--shadow-large)]" />
      </div>
    </div>
  );
}
