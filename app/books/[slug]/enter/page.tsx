import Link from "next/link";
import { notFound } from "next/navigation";
import { startOrOpenPersonalLineAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { SubmitButton } from "@/components/submit-button";
import { getAuthenticatedAppContext, getPersonalLineForBookSlug } from "@/lib/story-experience";
import { getBookBySlug } from "@/lib/story-data";

export const dynamic = "force-dynamic";

const ENTER_COPY = {
  headingPrefix: "准备回到",
  headingSuffix: "里冒险",
  pendingLabel: "正在回到故事里冒险...",
  memoryActionLabel: "去冒险列表"
} as const;

export default async function EnterStoryPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [book, currentContext, personalLine] = await Promise.all([
    getBookBySlug(slug),
    getAuthenticatedAppContext(),
    getPersonalLineForBookSlug(slug)
  ]);

  if (!book) {
    notFound();
  }

  return (
    <AppShell activeTab="home">
      <div className="mx-auto grid max-w-4xl gap-6">
        <section className="rounded-[36px] border border-[rgba(255,255,255,0.48)] bg-[linear-gradient(135deg,rgba(95,127,98,0.98),rgba(134,169,201,0.96))] p-7 text-[var(--text-on-accent)] shadow-[var(--shadow-large)] sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgba(255,253,248,0.72)]">走进童话</p>
          <h1 className="display-font mt-3 text-4xl leading-tight sm:text-5xl">
            {ENTER_COPY.headingPrefix}《{book.title}》{ENTER_COPY.headingSuffix}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[rgba(255,253,248,0.9)]">
            {currentContext
              ? personalLine
                ? `你已经在这本童话里留下一条只属于自己的冒险线了。接下来点击后，会直接回到这本书今天的故事位置，继续往前冒险。`
                : `系统会根据你当前的动物人格“${currentContext.persona.animalName}”写下这本童话的第一段 personal 冒险线。`
              : "登录 SecondMe 后，系统才会生成你的分身，并按你的视角把你带回真正属于你的童话里。"}
          </p>

          <div className="mt-8 grid gap-4 rounded-[28px] bg-[rgba(252,251,250,0.14)] p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold">这次会由你的分身先进去</span>
              <span className="rounded-full bg-[rgba(255,255,255,0.16)] px-3 py-1 text-xs font-semibold">
                {currentContext ? currentContext.persona.displayLabel : "等待连接"}
              </span>
            </div>
            <p className="text-sm leading-7 text-[rgba(255,253,248,0.86)]">
              {currentContext
                ? currentContext.persona.mappingReason
                : "未登录时不再展示默认人格。请先连接 SecondMe，再开始真正属于你的童话重逢。"}
            </p>
            {currentContext ? (
              <form action={startOrOpenPersonalLineAction} className="pt-2">
                <input type="hidden" name="slug" value={book.slug} />
                <SubmitButton
                  idleLabel={personalLine ? "继续冒险" : "现在走进童话"}
                  pendingLabel={ENTER_COPY.pendingLabel}
                />
              </form>
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
              href="/memory"
              className="inline-flex min-h-11 items-center rounded-full bg-[rgba(255,255,255,0.16)] px-5 py-3 text-sm font-semibold"
            >
              {ENTER_COPY.memoryActionLabel}
            </Link>
            <Link
              href={`/books/${book.slug}`}
              className="inline-flex min-h-11 items-center rounded-full border border-[rgba(255,255,255,0.28)] px-5 py-3 text-sm font-semibold"
            >
              返回这本童话
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
