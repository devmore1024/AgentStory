import React from "react";
import Link from "next/link";
import { PersonaCard } from "@/components/persona-card";
import { StateCard } from "@/components/state-card";
import { StoryFootprintTabs } from "@/components/story-footprint-tabs";
import { getStoryFootprintView } from "@/lib/me-page-presentation";
import {
  getAdventureThreads,
  getAuthenticatedAppContext,
  getPersonalLineBooks,
  getStoryExperienceSchemaStatus,
  getStoryTimelineItems
} from "@/lib/story-experience";
import { getStoryTimelineSourceLabel } from "@/lib/story-experience-helpers";

export const dynamic = "force-dynamic";

const SHOW_SHARE_ASSETS = false;

export default async function MePage({
  searchParams
}: {
  searchParams: Promise<{ auth?: string; setup?: string }>;
}) {
  const { auth, setup } = await searchParams;
  const currentContext = await getAuthenticatedAppContext();
  const schemaStatus = await getStoryExperienceSchemaStatus();

  const [timelineItems, personalLineBooks, threads] = currentContext
    ? await Promise.all([
        getStoryTimelineItems(),
        getPersonalLineBooks(),
        getAdventureThreads()
      ])
    : [[], [], []];

  const footprintView = getStoryFootprintView({
    personalLineBooks,
    adventureThreads: threads
  });

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          {!currentContext ? (
            <section className="rounded-[28px] border border-dashed border-[var(--border-default)] bg-[rgba(255,255,255,0.6)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">连接真实身份</p>
              <h2 className="display-font mt-2 text-2xl text-[var(--text-primary)]">先让分身出现，再回到童话里</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                连接 SecondMe 后，系统会读取你的用户资料、兴趣标签和软记忆，并缓存 24 小时，供之后走进童话和同行时稳定复用。
              </p>
              <Link
                href="/api/auth/login"
                className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)]"
              >
                连接 SecondMe
              </Link>
            </section>
          ) : (
            <PersonaCard persona={currentContext.persona} showArchiveButton={false} />
          )}

          <StoryFootprintTabs
            ownedCount={footprintView.ownedCount}
            joinedCount={footprintView.joinedCount}
            ownedItems={footprintView.ownedItems}
            joinedItems={footprintView.joinedItems}
          />

          {auth === "connected" ? (
            <section className="rounded-[28px] border border-[rgba(95,127,98,0.22)] bg-[rgba(231,239,230,0.86)] p-5">
              <p className="text-sm font-semibold text-[var(--accent-moss)]">已连接 SecondMe，缓存画像与动物人格都已经准备好，可以继续走进童话。</p>
            </section>
          ) : null}

          {auth === "refreshed" ? (
            <section className="rounded-[28px] border border-[rgba(95,127,98,0.22)] bg-[rgba(231,239,230,0.86)] p-5">
              <p className="text-sm font-semibold text-[var(--accent-moss)]">SecondMe 会话已恢复，可以继续使用你的缓存画像回到童话里。</p>
            </section>
          ) : null}

          {auth === "expired" || auth === "failed" || auth === "invalid_state" || auth === "denied" ? (
            <section className="rounded-[28px] border border-[rgba(200,128,92,0.22)] bg-[rgba(255,245,238,0.86)] p-5">
              <p className="text-sm font-semibold text-[var(--apricot)]">
                {auth === "expired"
                  ? "SecondMe 会话已失效，请重新连接。"
                  : auth === "denied"
                    ? "你取消了 SecondMe 授权，当前已回退到未连接状态。"
                    : auth === "invalid_state"
                      ? "授权状态校验失败，请重新发起连接。"
                      : "SecondMe 连接失败，当前未能刷新缓存画像。"}
              </p>
            </section>
          ) : null}

          {auth === "required" ? (
            <section className="rounded-[28px] border border-[rgba(200,128,92,0.22)] bg-[rgba(255,245,238,0.86)] p-5">
              <p className="text-sm font-semibold text-[var(--apricot)]">请先连接 SecondMe，再走进童话。</p>
            </section>
          ) : null}

          {setup === "story_schema_required" || !schemaStatus.ready ? (
            <section className="rounded-[28px] border border-[rgba(200,128,92,0.22)] bg-[rgba(255,245,238,0.86)] p-5">
              <p className="text-sm font-semibold text-[var(--apricot)]">
                同行体验的数据表还没迁移完成，请先执行 `db/008_adventure_memory_refactor.sql`，然后刷新页面。
              </p>
            </section>
          ) : null}
        </div>

        <div className="space-y-6">
          <StateCard
            eyebrow={currentContext ? "我的分身档案" : "等待连接"}
            title={currentContext ? "这里会继续长出你的重逢记录" : "连接后这里会变成你的专属童话档案馆"}
            description={
              currentContext
                ? "现在这页会把你的分身、你冒险过的童话，以及你和别人同行过的故事放在同一个档案馆里。"
                : "登录成功后，这里会出现你的动物人格、故事时间线和同行记录。"
            }
          />

          {SHOW_SHARE_ASSETS ? (
            <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.84)] p-6 shadow-[var(--shadow-medium)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">分享资产</p>
              <h2 className="display-font mt-3 text-3xl text-[var(--text-primary)]">动物人格可以被分享出去</h2>
              <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">
                当前分享页仍然沿用动物人格主视图。后面如果同行体验继续稳定下来，这里还可以再扩展你冒险过的童话与同行摘要。
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
          ) : null}

          <section className="rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.84)] p-6 shadow-[var(--shadow-medium)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">重逢记录</p>
            <h2 className="display-font mt-3 text-3xl text-[var(--text-primary)]">我的童话档案馆</h2>
            {timelineItems.length > 0 ? (
              <div className="mt-5 space-y-3">
                {timelineItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[22px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.68)] p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      {getStoryTimelineSourceLabel(item.sourceType)}
                      {item.bookTitle ? ` · 《${item.bookTitle}》` : ""}
                    </p>
                    <p className="mt-2 text-base leading-7 text-[var(--text-secondary)]">{item.title}</p>
                    {item.excerpt ? <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{item.excerpt}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[22px] border border-dashed border-[var(--border-default)] bg-[rgba(255,255,255,0.56)] p-5">
                <p className="text-sm leading-7 text-[var(--text-secondary)]">你的档案馆还没有记录，先从首页挑一本到想回到故事里继续冒险的童话，让第一段同行先落下来。</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
