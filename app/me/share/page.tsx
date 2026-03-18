import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PersonaCard } from "@/components/persona-card";
import { PersonaSharePoster } from "@/components/persona-share-poster";
import { ShareActions } from "@/components/share-actions";
import { getAuthenticatedAppContext } from "@/lib/demo-app";

export const dynamic = "force-dynamic";

export default async function PersonaSharePage() {
  const currentContext = await getAuthenticatedAppContext();

  return (
    <AppShell activeTab="me">
      {!currentContext ? (
        <section className="mx-auto max-w-3xl rounded-[32px] border border-dashed border-[var(--border-default)] bg-[rgba(255,255,255,0.66)] p-8 shadow-[var(--shadow-medium)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">分享前提示</p>
          <h1 className="display-font mt-3 text-4xl text-[var(--text-primary)]">先连接 SecondMe，再生成你的分享卡</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
            动物人格分享页只对已登录用户开放。连接成功后，这里会展示属于你的动物人格卡和可分享链接。
          </p>
          <Link
            href="/api/auth/login"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
          >
            连接 SecondMe
          </Link>
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <PersonaCard persona={currentContext.persona} />

          <div className="grid gap-6">
            <PersonaSharePoster persona={currentContext.persona} />

            <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.84)] p-6 shadow-[var(--shadow-medium)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">分享资产</p>
              <h1 className="display-font mt-3 text-3xl text-[var(--text-primary)]">把你的动物人格分享出去</h1>
              <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
                这张结果页现在已经改成“徽章 + 头像”的双层方案。首版先支持分享页面链接，后面可以继续接静态导出图和故事卡。
              </p>

              <div className="mt-6 rounded-[24px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.7)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">分享文案</p>
                <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">
                  我的动物人格是{currentContext.persona.animalName}。在 AgentTale 里，我的分身会带着这种视角走进童话世界。
                </p>
              </div>

              <div className="mt-6">
                <ShareActions
                  shareUrl="/me/share"
                  shareTitle={`AgentTale · ${currentContext.persona.animalName}动物人格`}
                  shareText={`我的动物人格是${currentContext.persona.animalName}，它会带着我的分身走进故事里。`}
                />
              </div>

              <div className="mt-6">
                <Link
                  href="/me"
                  className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-default)] bg-[rgba(255,255,255,0.74)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)]"
                >
                  返回我的页
                </Link>
              </div>
            </section>
          </div>
        </div>
      )}
    </AppShell>
  );
}
