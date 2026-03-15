type EpisodePreview = {
  title: string;
  bookTitle: string;
  excerpt: string;
  statusLabel: string;
};

export function SerialPreview({ episode }: { episode: EpisodePreview }) {
  return (
    <section className="rounded-[28px] border border-[var(--border-light)] bg-[linear-gradient(135deg,rgba(95,127,98,0.18),rgba(134,169,201,0.18))] p-5 shadow-[var(--shadow-medium)] sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{episode.statusLabel}</p>
          <h2 className="display-font mt-2 text-2xl leading-tight text-[var(--text-primary)] sm:text-3xl">
            正在进入《{episode.bookTitle}》
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{episode.title}</p>
        </div>
        <div className="rounded-[24px] bg-[rgba(255,255,255,0.72)] p-4 shadow-[var(--shadow-small)]">
          <p className="text-sm leading-7 text-[var(--text-secondary)]">{episode.excerpt}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-moss)]">
            Agent 正在改写这本书
          </p>
        </div>
      </div>
    </section>
  );
}
