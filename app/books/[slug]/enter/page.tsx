import Link from "next/link";
import { notFound } from "next/navigation";
import { continueAdventureAction, createAdventureAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { SubmitButton } from "@/components/submit-button";
import { getAuthenticatedAppContext, getOwnedAdventureForBookSlug } from "@/lib/story-experience";
import { getBookBySlug } from "@/lib/story-data";

export const dynamic = "force-dynamic";

export default async function EnterStoryPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [book, currentContext, ownedAdventure] = await Promise.all([
    getBookBySlug(slug),
    getAuthenticatedAppContext(),
    getOwnedAdventureForBookSlug(slug)
  ]);

  if (!book) {
    notFound();
  }

  return (
    <AppShell activeTab="adventure">
      <div className="mx-auto grid max-w-4xl gap-6">
        <section className="rounded-[36px] border border-[rgba(255,255,255,0.48)] bg-[linear-gradient(135deg,rgba(95,127,98,0.98),rgba(134,169,201,0.96))] p-7 text-[var(--text-on-accent)] shadow-[var(--shadow-large)] sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgba(255,253,248,0.72)]">进入冒险</p>
          <h1 className="display-font mt-3 text-4xl leading-tight sm:text-5xl">准备在《{book.title}》里打开新的副本</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[rgba(255,253,248,0.9)]">
            {currentContext
              ? ownedAdventure && !ownedAdventure.isCompleted
                ? `你已经是这本书里某条冒险线的创建者了。接下来点击后，会沿着已经锁定的风格继续往下冒险。`
                : `系统会根据你当前的动物人格“${currentContext.persona.animalName}”生成这条冒险副本的第一篇，并自动锁定整条副本的写作风格。`
              : "登录 SecondMe 后，系统才会生成你的动物人格，并按你的视角打开真正属于你的冒险副本。"}
          </p>

          <div className="mt-8 grid gap-4 rounded-[28px] bg-[rgba(252,251,250,0.14)] p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold">已锁定本次进入方式</span>
              <span className="rounded-full bg-[rgba(255,255,255,0.16)] px-3 py-1 text-xs font-semibold">
                {currentContext ? currentContext.persona.displayLabel : "等待连接"}
              </span>
            </div>
            <p className="text-sm leading-7 text-[rgba(255,253,248,0.86)]">
              {currentContext
                ? currentContext.persona.mappingReason
                : "未登录时不再展示默认人格。请先连接 SecondMe，再开始真正属于你的冒险进入。"}
            </p>
            {currentContext ? (
              ownedAdventure && !ownedAdventure.isCompleted ? (
                <form action={continueAdventureAction} className="pt-2">
                  <input type="hidden" name="threadId" value={ownedAdventure.id} />
                  <SubmitButton idleLabel="继续冒险" pendingLabel="正在续写冒险..." />
                </form>
              ) : (
                <form action={createAdventureAction} className="pt-2">
                  <input type="hidden" name="slug" value={book.slug} />
                  <SubmitButton idleLabel="现在开始进入冒险" pendingLabel="正在打开冒险副本..." />
                </form>
              )
            ) : (
              <Link
                href="/me?auth=required"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white/20 px-5 py-3 text-sm font-semibold"
              >
                先连接 SecondMe
              </Link>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/adventure"
              className="inline-flex min-h-11 items-center rounded-full bg-[rgba(255,255,255,0.16)] px-5 py-3 text-sm font-semibold"
            >
              去冒险页查看公开副本
            </Link>
            <Link
              href={`/books/${book.slug}`}
              className="inline-flex min-h-11 items-center rounded-full border border-[rgba(255,255,255,0.28)] px-5 py-3 text-sm font-semibold"
            >
              返回详情
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
