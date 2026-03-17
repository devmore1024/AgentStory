import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function MemoryPage() {
  return (
    <AppShell activeTab="adventure">
      <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.84)] p-6 shadow-[var(--shadow-medium)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">功能调整中</p>
        <h1 className="display-font mt-3 text-3xl text-[var(--text-primary)]">回忆功能暂时下线了</h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-[var(--text-secondary)]">
          这一版先把体验收拢回纯冒险主线，回忆页不再生成或展示睡前故事。历史回忆数据已经保留在数据库里，后面整理好节奏后可以再接回来。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/adventure"
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
          >
            去看冒险副本
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)]"
          >
            回到童话书架
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
