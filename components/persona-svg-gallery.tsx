import React from "react";
import { animalPersonas, type AnimalPersona } from "@/lib/animal-personas";
import { PersonaBadge } from "@/components/persona-badge";
import { PersonaPortrait } from "@/components/persona-portrait";

const personaCards = Object.values(animalPersonas);

const badgeRecognitionNotes: Partial<Record<AnimalPersona["animalType"], string>> = {
  lion: "识别特征：鬃毛轮廓、猫科嘴鼻、圆耳位置",
  hedgehog: "识别特征：前伸尖鼻、背部连续刺弧、低矮体态",
  horse: "识别特征：长脸鼻梁、鬃毛走势、马耳位置",
  elephant: "识别特征：大扇形耳朵、长鼻、厚额头体块",
  swan: "识别特征：S 形长颈、贴头喙线、天鹅体态",
  crane: "识别特征：细直长颈、长直喙、清瘦站姿"
};

export function PersonaSvgGallery() {
  return (
    <div className="grid gap-6">
      <section className="rounded-[32px] border border-[rgba(255,244,234,0.74)] bg-[linear-gradient(135deg,rgba(255,250,245,0.96),rgba(245,232,220,0.88))] p-6 shadow-[var(--shadow-large)] sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">人格 SVG 图谱</p>
        <h1 className="display-font mt-3 text-4xl leading-tight text-[var(--text-primary)] sm:text-5xl">简略徽章和详细头像，现在可以放在同一页对照看了</h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-[var(--text-secondary)]">
          这一页把 20 种动物人格的两层视觉资产放在一起展示。左侧保留小尺寸下更稳定的简略 SVG，
          右侧换成更完整的详细 SVG，用于人物卡、分享页和后续视觉延展。本轮优先补强了狮子、刺猬、马、大象、天鹅和鹤的小徽章识别度。
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
                <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">沿用当前徽章轮廓，优先保证小尺寸识别和入口统一性。</p>
                {badgeRecognitionNotes[persona.animalType] ? (
                  <div className="mt-4 rounded-[18px] border border-[rgba(216,196,176,0.58)] bg-[rgba(255,250,245,0.9)] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">识别特征</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{badgeRecognitionNotes[persona.animalType]}</p>
                  </div>
                ) : null}
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
