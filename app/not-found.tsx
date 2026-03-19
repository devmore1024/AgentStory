import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <div className="mx-auto grid max-w-3xl gap-6">
        <section className="rounded-[36px] border border-[var(--border-light)] bg-[rgba(255,250,243,0.86)] p-8 text-center shadow-[var(--shadow-large)]">
          <p className="accent-font text-3xl text-[var(--text-secondary)]">This page fell out of the book</p>
          <h1 className="display-font mt-3 text-5xl text-[var(--text-primary)]">没有找到这本故事</h1>
          <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
            可能是这页还没上架，也可能是路径写错了。先回到首页书架，再从那里挑一本书。
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex min-h-11 items-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)]"
          >
            回到首页
          </Link>
        </section>
      </div>
    </>
  );
}
