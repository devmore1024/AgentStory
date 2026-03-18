import React from "react";
import Link from "next/link";
import type { AnimalPersona } from "@/lib/animal-personas";
import { PersonaRadar } from "@/components/persona-radar";
import { PersonaBadge } from "@/components/persona-badge";
import { PersonaPortrait } from "@/components/persona-portrait";

export function PersonaCard({
  persona,
  compact = false,
  showArchiveButton = true
}: {
  persona: AnimalPersona;
  compact?: boolean;
  showArchiveButton?: boolean;
}) {
  return (
    <section className="paper-grain relative overflow-hidden rounded-[32px] border border-[var(--border-light)] bg-[linear-gradient(180deg,#fff8ef_0%,#f5eadb_48%,#e7efe6_100%)] p-5 shadow-[var(--shadow-large)] sm:p-6">
      <div className={`relative z-10 grid gap-6 ${compact ? "lg:grid-cols-[1.02fr_0.98fr]" : "lg:grid-cols-[1.08fr_0.92fr]"}`}>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="accent-font text-2xl text-[var(--text-secondary)]">{persona.displayLabel}</p>
              <h2 className="display-font mt-1 text-3xl text-[var(--text-primary)] sm:text-4xl">{persona.animalName}</h2>
            </div>
            <PersonaBadge animalType={persona.animalType} size={compact ? "sm" : "md"} variant="paper" />
          </div>

          <p className="max-w-xl text-base leading-7 text-[var(--text-secondary)]">{persona.summary}</p>

          <div className="rounded-[22px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.58)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">人格图像语言</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{persona.badgeStyle}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {persona.shapeKeywords.map((item) => (
                <span key={item} className="rounded-full bg-[rgba(255,255,255,0.76)] px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)]">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.55)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">倾向</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {persona.tendencies.map((item) => (
                  <span key={item} className="rounded-full bg-[var(--berry-light)] px-3 py-1.5 text-sm font-semibold text-[var(--berry)]">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.55)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">价值观</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {persona.values.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-[var(--accent-moss-light)] px-3 py-1.5 text-sm font-semibold text-[var(--accent-moss)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {!compact ? (
            <div className="rounded-[22px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.58)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">推荐逻辑</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{persona.mappingReason}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {persona.recommendedCategories.map((item) => (
                  <span key={item} className="rounded-full bg-[var(--apricot-light)] px-3 py-1.5 text-sm font-semibold text-[var(--apricot)]">
                    {item}
                  </span>
                ))}
                {persona.recommendedStyles.map((item) => (
                  <span key={item} className="rounded-full border border-[var(--border-default)] px-3 py-1.5 text-sm text-[var(--text-secondary)]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex h-full flex-col gap-4">
          <PersonaPortrait animalType={persona.animalType} mood={compact ? "calm" : "bright"} />
          <PersonaRadar values={persona.dimensionScores} />
          <div className="rounded-[22px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.58)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">表达风格</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{persona.expressionStyle}</p>
          </div>
          {!compact ? (
            <div className="rounded-[22px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.58)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">避免方向</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {persona.doNotUse.map((item) => (
                  <span key={item} className="rounded-full bg-[rgba(255,245,238,0.92)] px-3 py-1.5 text-sm font-semibold text-[var(--apricot)]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {!compact && showArchiveButton ? (
            <Link
              href="/me"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent-moss)] px-5 py-3 text-sm font-semibold text-[var(--text-on-accent)] shadow-[var(--shadow-small)] transition hover:bg-[var(--accent-moss-hover)]"
            >
              打开我的档案馆
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
