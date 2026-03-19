import Image from "next/image";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { PrimaryNav } from "@/components/primary-nav";
import { SiteFooter } from "@/components/site-footer";
import { getAuthSession, isAuthSessionExpired } from "@/lib/auth";
import { getCurrentViewerContext } from "@/lib/current-user";
import type { AppTab } from "@/lib/app-navigation";

type AppShellProps = {
  activeTab: AppTab;
  children: React.ReactNode;
};

export async function AppShell({ activeTab, children }: AppShellProps) {
  const [viewer, session] = await Promise.all([getCurrentViewerContext(), getAuthSession()]);
  const isExpiredSession = Boolean(session && isAuthSessionExpired(session) && !viewer);

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-7rem] top-28 h-56 w-56 rounded-full bg-[rgba(124,45,18,0.13)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-7rem] top-24 h-56 w-56 rounded-full bg-[rgba(75,85,99,0.18)] blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-4 pt-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between rounded-[28px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.82)] px-4 py-3 shadow-[var(--shadow-small)] backdrop-blur sm:px-5">
          <div>
            <Link href="/" className="inline-flex">
              <Image
                src="/logo/logo.png"
                alt="AgenTales"
                width={2044}
                height={528}
                priority
                className="h-auto w-[11rem] sm:w-[13rem]"
              />
            </Link>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <PrimaryNav activeTab={activeTab} />
            {viewer ? (
              <div className="flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[rgba(255,255,255,0.62)] px-3 py-2 shadow-[var(--shadow-small)]">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--apricot-light)] text-sm font-semibold text-[var(--apricot)]">
                  {viewer.persona.animalName}
                </div>
                <div className="max-w-[10rem]">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{viewer.displayName}</p>
                  <p className="truncate text-xs text-[var(--text-muted)]">已连接 SecondMe</p>
                </div>
                <a
                  href="/api/auth/logout"
                  className="rounded-full border border-[var(--border-default)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent-moss)] hover:text-[var(--accent-moss)]"
                >
                  退出
                </a>
              </div>
            ) : isExpiredSession ? (
              <Link
                href="/api/auth/refresh"
                className="rounded-full bg-[var(--apricot)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-small)] transition hover:opacity-90"
              >
                恢复 SecondMe 会话
              </Link>
            ) : (
              <Link
                href="/api/auth/login"
                className="rounded-full bg-[var(--accent-moss)] px-4 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)] transition hover:bg-[var(--accent-moss-hover)]"
              >
                连接 SecondMe
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>

      <BottomNav activeTab={activeTab} />
    </div>
  );
}
