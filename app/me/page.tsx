import { AppShell } from "@/components/app-shell";
import { PersonaCard } from "@/components/persona-card";
import { StateCard } from "@/components/state-card";
import Link from "next/link";
import { getAuthenticatedAppContext, getSerialEpisodes, getShortStories, getTimelineItems } from "@/lib/demo-app";

export const dynamic = "force-dynamic";

export default async function MePage({
  searchParams
}: {
  searchParams: Promise<{ auth?: string }>;
}) {
  const { auth } = await searchParams;
  const [timelineItems, serialEpisodes, shortStories, currentContext] = await Promise.all([
    getTimelineItems(),
    getSerialEpisodes(),
    getShortStories(),
    getAuthenticatedAppContext()
  ]);

  return (
    <AppShell activeTab="me">
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          {!currentContext ? (
            <section className="rounded-[28px] border border-dashed border-[var(--border-default)] bg-[rgba(255,255,255,0.6)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">连接真实身份</p>
              <h2 className="display-font mt-2 text-2xl text-[var(--text-primary)]">未登录时不会直接展示动物人格</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                连接 SecondMe 后，系统会读取你的用户资料、兴趣标签和软记忆，再映射成真正属于你的动物人格。
              </p>
              <Link
                href="/api/auth/login"
                className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
              >
                连接 SecondMe
              </Link>
            </section>
          ) : (
            <PersonaCard persona={currentContext.persona} />
          )}

          {auth === "connected" ? (
            <section className="rounded-[28px] border border-[rgba(95,127,98,0.22)] bg-[rgba(231,239,230,0.86)] p-5">
              <p className="text-sm font-semibold text-[var(--accent-moss)]">已连接 SecondMe，动物人格已经刷新为你的真实画像。</p>
            </section>
          ) : null}

          {auth === "refreshed" ? (
            <section className="rounded-[28px] border border-[rgba(95,127,98,0.22)] bg-[rgba(231,239,230,0.86)] p-5">
              <p className="text-sm font-semibold text-[var(--accent-moss)]">SecondMe 会话已恢复，可以继续使用你的真实动物人格。</p>
            </section>
          ) : null}

          {auth === "expired" || auth === "failed" || auth === "invalid_state" || auth === "denied" ? (
            <section className="rounded-[28px] border border-[rgba(200,128,92,0.22)] bg-[rgba(255,245,238,0.86)] p-5">
              <p className="text-sm font-semibold text-[var(--apricot)]">
                {auth === "expired"
                  ? "SecondMe 会话已失效，请重新连接。"
                  : auth === "denied"
                    ? "你取消了 SecondMe 授权，当前已回退到体验人格。"
                    : auth === "invalid_state"
                      ? "授权状态校验失败，请重新发起连接。"
                      : "SecondMe 连接失败，当前已回退到体验人格。"}
              </p>
            </section>
          ) : null}

          {auth === "required" ? (
            <section className="rounded-[28px] border border-[rgba(200,128,92,0.22)] bg-[rgba(255,245,238,0.86)] p-5">
              <p className="text-sm font-semibold text-[var(--apricot)]">请先连接 SecondMe，再生成故事或继续连载。</p>
            </section>
          ) : null}

          <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.84)] p-6 shadow-[var(--shadow-medium)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">故事时间线</p>
            <h2 className="display-font mt-3 text-3xl text-[var(--text-primary)]">我的故事档案馆</h2>
            {timelineItems.length > 0 ? (
              <div className="mt-5 space-y-3">
                {timelineItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[22px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.68)] p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      {item.sourceType === "episode" ? "连载" : "短篇"}
                      {item.bookTitle ? ` · ${item.bookTitle}` : ""}
                    </p>
                    <p className="mt-2 text-base leading-7 text-[var(--text-secondary)]">{item.title}</p>
                    {item.excerpt ? <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{item.excerpt}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[22px] border border-dashed border-[var(--border-default)] bg-[rgba(255,255,255,0.56)] p-5">
                <p className="text-sm leading-7 text-[var(--text-secondary)]">你的档案馆还没有记录，先从首页进入一本书，或者去故事页继续推进连载。</p>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <StateCard
            eyebrow={currentContext ? "我的分身档案" : "等待连接"}
            title={currentContext ? "这里会继续长出你的连载记录和短篇记录" : "连接后这里会变成你的专属故事档案馆"}
            description={
              currentContext
                ? "现在这页展示的是当前登录用户的真实动物人格、时间线和故事统计。后续接入更多生成链路后，页面结构不需要再重做。"
                : "现在不会再展示默认体验人格。登录成功后，这里会出现你的动物人格、时间线和故事统计。"
            }
          />

          <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.84)] p-6 shadow-[var(--shadow-medium)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">我的记录</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[22px] bg-[rgba(255,255,255,0.68)] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">连载章节</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--accent-moss)]">{serialEpisodes.length}</p>
              </div>
              <div className="rounded-[22px] bg-[rgba(255,255,255,0.68)] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">短篇次数</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--apricot)]">{shortStories.length}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.84)] p-6 shadow-[var(--shadow-medium)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">分享资产</p>
            <h2 className="display-font mt-3 text-3xl text-[var(--text-primary)]">动物人格可以被分享出去</h2>
            <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">
              前端文案已经统一成“动物人格”。这轮已经接入了可打开的分享页，后续还可以继续扩展静态导出图和故事卡。
            </p>
            <div className="mt-5">
              <Link
                href="/me/share"
                className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
              >
                打开分享卡
              </Link>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
