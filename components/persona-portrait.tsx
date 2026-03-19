import React, { useId } from "react";
import { animalPersonas, type AnimalPersona } from "@/lib/animal-personas";
import {
  PERSONA_PORTRAIT_VIEWBOX,
  personaPortraitMotionStyles,
  renderPersonaPortraitArt
} from "@/components/persona-portrait-art";

type PersonaPortraitProps = {
  animalType: AnimalPersona["animalType"];
  background?: "auto" | "soft" | "contrast";
  mood?: "calm" | "bright";
  className?: string;
};

const backgroundMap: Record<AnimalPersona["bgStyleKey"], { from: string; to: string; glow: string }> = {
  warm_dawn: { from: "#fff8ef", to: "#f3dfc8", glow: "#f2b98f" },
  forest_mist: { from: "#f3f7ef", to: "#dfe8dc", glow: "#a7c2a3" },
  moon_glow: { from: "#f4f1f8", to: "#dce0f0", glow: "#b7bfd9" },
  story_sky: { from: "#f2f6fb", to: "#dce7f2", glow: "#a8bfd6" }
};

export function PersonaPortrait({
  animalType,
  background = "auto",
  mood = "calm",
  className = ""
}: PersonaPortraitProps) {
  const persona = animalPersonas[animalType];
  const bg = backgroundMap[persona.bgStyleKey];
  const from = background === "contrast" ? "#fffaf3" : bg.from;
  const to = bg.to;
  const opacity = mood === "bright" ? 0.28 : 0.2;
  const baseId = useId().replace(/:/g, "");

  const ids = {
    primary: `persona-portrait-primary-${baseId}`,
    secondary: `persona-portrait-secondary-${baseId}`,
    tertiary: `persona-portrait-tertiary-${baseId}`,
    glow: `persona-portrait-glow-${baseId}`,
    shadow: `persona-portrait-shadow-${baseId}`,
    accent: `persona-portrait-accent-${baseId}`
  };

  return (
    <div
      className={`paper-grain relative overflow-hidden rounded-[30px] border border-[rgba(255,255,255,0.72)] bg-[rgba(255,255,255,0.52)] p-4 shadow-[var(--shadow-medium)] ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`
        }}
      />
      <div
        className="absolute left-[8%] top-[10%] h-28 w-28 rounded-full blur-2xl"
        style={{ backgroundColor: bg.glow, opacity }}
      />
      <div
        className="absolute bottom-[8%] right-[10%] h-32 w-32 rounded-full blur-2xl"
        style={{ backgroundColor: persona.accentColor, opacity: 0.12 }}
      />
      <svg
        viewBox={PERSONA_PORTRAIT_VIEWBOX}
        className="relative z-10 mx-auto aspect-square w-full max-w-[18rem]"
        role="img"
        aria-label={`${persona.animalName}动物人格头像`}
      >
        <style>{personaPortraitMotionStyles}</style>
        <circle cx="64" cy="64" r="50" fill="#fffaf3" fillOpacity="0.34" />
        {renderPersonaPortraitArt(animalType, ids)}
      </svg>
    </div>
  );
}
