import type { AnimalPersona } from "@/lib/animal-personas";
import { PersonaBadge } from "@/components/persona-badge";
import { PersonaPortrait } from "@/components/persona-portrait";

export function PersonaSharePoster({ persona }: { persona: AnimalPersona }) {
  return (
    <section className="paper-grain relative overflow-hidden rounded-[32px] border border-[var(--border-light)] bg-[linear-gradient(180deg,#fff9f1_0%,#f3e7d8_48%,#edf2ea_100%)] p-6 shadow-[var(--shadow-large)]">
      <div className="absolute right-5 top-5">
        <PersonaBadge animalType={persona.animalType} size="sm" variant="paper" />
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">可分享的人格结果</p>
      <h2 className="display-font mt-3 text-3xl text-[var(--text-primary)]">我的动物人格是 {persona.animalName}</h2>
      <p className="mt-3 max-w-xl text-base leading-8 text-[var(--text-secondary)]">
        它会带着我的分身进入故事世界，用属于我的方式靠近角色、理解剧情，也改变故事原本的走向。
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
        <PersonaPortrait animalType={persona.animalType} mood="bright" />

        <div className="grid gap-4">
          <div className="rounded-[24px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.68)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">人格关键词</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {persona.tendencies.map((item) => (
                <span key={item} className="rounded-full bg-[rgba(255,255,255,0.85)] px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)]">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--border-light)] bg-[rgba(255,255,255,0.68)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">视觉风格</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{persona.portraitStyle}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
