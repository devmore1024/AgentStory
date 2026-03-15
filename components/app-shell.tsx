import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getAuthSession, isAuthSessionExpired } from "@/lib/auth";
import { getCurrentViewerContext } from "@/lib/current-user";

type AppShellProps = {
  activeTab: "home" | "story" | "discover" | "me";
  children: React.ReactNode;
};

const desktopNavItems = [
  { href: "/", label: "首页" },
  { href: "/story", label: "故事" },
  { href: "/discover", label: "发现" },
  { href: "/me", label: "我的" }
] as const;

export async function AppShell({ activeTab, children }: AppShellProps) {
  const [viewer, session] = await Promise.all([getCurrentViewerContext(), getAuthSession()]);
  const isExpiredSession = Boolean(session && isAuthSessionExpired(session) && !viewer);

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_58%)]" />
      <div className="pointer-events-none absolute left-[-7rem] top-28 h-56 w-56 rounded-full bg-[rgba(217,146,91,0.13)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-7rem] top-24 h-56 w-56 rounded-full bg-[rgba(134,169,201,0.18)] blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-4 pt-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between rounded-[28px] border border-[var(--border-light)] bg-[rgba(255,250,243,0.82)] px-4 py-3 shadow-[var(--shadow-small)] backdrop-blur sm:px-5">
          <div>
            <p className="accent-font text-lg text-[var(--text-secondary)]">A shelf for your story self</p>
            <Link href="/" className="display-font text-2xl text-[var(--text-primary)] sm:text-3xl">
              AgentStory
            </Link>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <nav className="flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[rgba(255,255,255,0.5)] p-1">
              {desktopNavItems.map((item) => {
                const isActive =
                  (item.href === "/" && activeTab === "home") ||
                  (item.href === "/story" && activeTab === "story") ||
                  (item.href === "/discover" && activeTab === "discover") ||
                  (item.href === "/me" && activeTab === "me");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-[var(--accent-moss)] text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
                        : "text-[var(--text-secondary)] hover:bg-[rgba(95,127,98,0.08)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {viewer ? (
              <div className="flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[rgba(255,255,255,0.62)] px-3 py-2 shadow-[var(--shadow-small)]">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--apricot-light)] text-sm font-semibold text-[var(--apricot)]">
                  {viewer.persona.animalName}
                </div>
                <div className="max-w-[10rem]">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{viewer.displayName}</p>
                  <p className="truncate text-xs text-[var(--text-muted)]">已连接 SecondMe</p>
                </div>
                <Link
                  href="/api/auth/logout"
                  className="rounded-full border border-[var(--border-default)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent-moss)] hover:text-[var(--accent-moss)]"
                >
                  退出
                </Link>
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
      </div>

      <BottomNav activeTab={activeTab} />
    </div>
  );
}
