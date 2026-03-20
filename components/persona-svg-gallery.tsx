import React from "react";
import { animalPersonas } from "@/lib/animal-personas";
import { PersonaBadge } from "@/components/persona-badge";
import { PersonaPortrait } from "@/components/persona-portrait";

const personaCards = Object.values(animalPersonas);

export function PersonaSvgGallery() {
  return (
    <div className="grid gap-6">
      <section className="rounded-[32px] border border-[rgba(255,244,234,0.74)] bg-[linear-gradient(135deg,rgba(255,250,245,0.96),rgba(245,232,220,0.88))] p-6 shadow-[var(--shadow-large)] sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">人格 SVG 图谱</p>
        <h1 className="display-font mt-3 text-4xl leading-tight text-[var(--text-primary)] sm:text-5xl">简略徽章和详细头像，现在可以放在同一页对照看了</h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-[var(--text-secondary)]">
          这一页把 20 种动物人格的两层视觉资产放在一起展示。左侧的小尺寸徽章已经统一升级到增强版细节，
          在保留纸感线描气质的同时补进更多结构线和少量同色块面；右侧继续保留更完整的详细 SVG，用于人物卡、分享页和后续视觉延展。
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.66)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">简略 SVG</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">用于小尺寸徽章、悬浮卡片和需要更强识别度的入口位。</p>
          </div>
          <div className="rounded-[24px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.66)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">详细 SVG</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">保留同一人格特征，但补足面部结构、材质层次和轻动画。</p>
          </div>
          <div className="rounded-[24px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.66)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">动画策略</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">统一使用轻微浮动、眨眼和局部摆动，并对 `prefers-reduced-motion` 做了兜底。</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {personaCards.map((persona) => (
          <article
            key={persona.animalType}
            data-testid={`persona-svg-card-${persona.animalType}`}
            className="paper-grain relative overflow-hidden rounded-[32px] border border-[var(--border-light)] bg-[rgba(252,251,250,0.88)] p-5 shadow-[var(--shadow-medium)] sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{persona.displayLabel}</p>
                <h2 className="display-font mt-2 text-3xl text-[var(--text-primary)]">{persona.animalName}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{persona.summary}</p>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                {persona.shapeKeywords.map((item) => (
                  <span
                    key={`${persona.animalType}-${item}`}
                    className="rounded-full bg-[rgba(255,255,255,0.82)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[12rem_minmax(0,1fr)]">
              <section
                data-testid={`persona-badge-panel-${persona.animalType}`}
                className="rounded-[26px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.74)] p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">简略 SVG</p>
                <div className="mt-4 flex min-h-[11rem] items-center justify-center rounded-[20px] bg-[linear-gradient(180deg,rgba(255,252,249,0.92),rgba(246,238,230,0.88))]">
                  <PersonaBadge animalType={persona.animalType} size="lg" variant="paper" />
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">保持原有纸感和线描气质，但每只都补了更完整的物种结构和少量同色细节块面。</p>
                <div className="mt-4 rounded-[18px] border border-[rgba(216,196,176,0.58)] bg-[rgba(255,250,245,0.9)] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">识别特征</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {persona.recognitionFeatures.map((item) => (
                      <span
                        key={`${persona.animalType}-${item}`}
                        className="rounded-full bg-[rgba(255,255,255,0.82)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              <section
                data-testid={`persona-portrait-panel-${persona.animalType}`}
                className="rounded-[26px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.74)] p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">详细 SVG</p>
                <PersonaPortrait animalType={persona.animalType} mood="bright" className="mt-4 min-h-[18rem]" />
                <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{persona.portraitStyle}</p>
              </section>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
