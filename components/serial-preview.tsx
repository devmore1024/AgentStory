type EpisodePreview = {
  title: string;
  bookTitle: string;
  excerpt: string;
  statusLabel: string;
};

export function SerialPreview({ episode }: { episode: EpisodePreview }) {
  return (
    <section className="rounded-[32px] border border-[rgba(255,255,255,0.45)] bg-[linear-gradient(135deg,rgba(95,127,98,0.98),rgba(134,169,201,0.96))] p-6 text-[var(--text-on-accent)] shadow-[var(--shadow-large)] sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgba(255,253,248,0.72)]">今日自动推荐</p>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="accent-font text-2xl text-[rgba(255,253,248,0.82)]">{episode.statusLabel}</p>
          <h2 className="display-font mt-2 text-3xl leading-tight sm:text-4xl">{episode.title}</h2>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-[rgba(255,253,248,0.72)]">
            正在穿越 · {episode.bookTitle}
          </p>
        </div>
        <div className="rounded-[26px] bg-[rgba(255,250,243,0.14)] p-4 shadow-[var(--shadow-small)] backdrop-blur">
          <p className="text-sm leading-7 text-[rgba(255,253,248,0.92)]">{episode.excerpt}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-[rgba(255,255,255,0.16)] px-3 py-1.5 text-xs font-semibold">连续更新</span>
            <span className="rounded-full bg-[rgba(255,255,255,0.16)] px-3 py-1.5 text-xs font-semibold">跨书推进</span>
            <span className="rounded-full bg-[rgba(255,255,255,0.16)] px-3 py-1.5 text-xs font-semibold">分身自动行动</span>
          </div>
        </div>
      </div>
    </section>
  );
}
