import React from "react";
import { animalPersonas, type AnimalPersona } from "@/lib/animal-personas";

type PersonaBadgeProps = {
  animalType: AnimalPersona["animalType"];
  size?: "sm" | "md" | "lg";
  variant?: "soft" | "paper";
};

const sizeMap = {
  sm: "h-14 w-14 rounded-[18px]",
  md: "h-20 w-20 rounded-[24px]",
  lg: "h-24 w-24 rounded-[28px]"
} as const;

function iconStroke(animalType: AnimalPersona["animalType"]) {
  switch (animalType) {
    case "bear":
      return (
        <>
          <circle cx="42" cy="34" r="9" />
          <circle cx="86" cy="34" r="9" />
          <circle cx="64" cy="58" r="30" />
          <circle cx="64" cy="66" r="10" />
          <path d="M56 74c4 4 12 4 16 0" />
        </>
      );
    case "deer":
      return (
        <>
          <ellipse cx="64" cy="62" rx="26" ry="29" />
          <path d="M47 36l-8-14m8 14l-14-6m46 6l8-14m-8 14l14-6" />
          <path d="M51 67c4 4 22 4 26 0" />
        </>
      );
    case "fox":
      return (
        <>
          <path d="M40 52l14-22 10 12 10-12 14 22-6 34H46L40 52z" />
          <path d="M56 67c3 4 13 4 16 0" />
          <path d="M64 58l-5 8h10l-5-8z" />
        </>
      );
    case "owl":
      return (
        <>
          <path d="M46 36l8-8m28 8l-8-8" />
          <path d="M40 56c0-16 10-24 24-24s24 8 24 24v22c0 6-5 10-11 10H51c-6 0-11-4-11-10V56z" />
          <circle cx="54" cy="58" r="9" />
          <circle cx="74" cy="58" r="9" />
          <path d="M64 60l-5 8h10l-5-8z" />
        </>
      );
    case "wolf":
      return (
        <>
          <path d="M42 54l10-24 12 12 12-12 10 24-8 34H50l-8-34z" />
          <path d="M52 72c7 2 21 2 24 0" />
          <path d="M64 58l-4 8h8l-4-8z" />
        </>
      );
    case "cat":
      return (
        <>
          <path d="M44 38l10-12 6 16m28-4l-10-12-6 16" />
          <path d="M40 58c0-18 11-28 24-28s24 10 24 28v18c0 8-7 14-15 14H55c-8 0-15-6-15-14V58z" />
          <path d="M50 68h-9m9 8H38m40-8h10m-10 8h12" />
        </>
      );
    case "rabbit":
      return (
        <>
          <path d="M48 46V24c0-8 4-12 10-12s10 4 10 12v18" />
          <path d="M60 42V20c0-8 4-12 10-12s10 4 10 12v26" />
          <circle cx="64" cy="64" r="28" />
          <path d="M54 76c4 4 16 4 20 0" />
        </>
      );
    case "raven":
      return (
        <>
          <path d="M34 72c4-22 18-38 42-38 18 0 28 8 32 16-12-1-22 2-28 8l18 4-18 8c-6 9-18 14-36 14-4 0-8-5-10-12z" />
          <circle cx="70" cy="50" r="3" fill="currentColor" stroke="none" />
        </>
      );
    case "lion":
      return (
        <>
          <circle cx="64" cy="58" r="30" />
          <path d="M36 48c4-16 20-24 28-24s24 8 28 24M36 48c-4 6-5 14-4 20m60-20c4 6 5 14 4 20M42 80c8 10 18 16 22 16s14-6 22-16" />
          <path d="M56 68c4 4 12 4 16 0" />
        </>
      );
    case "dog":
      return (
        <>
          <path d="M44 46c-8 2-12 10-10 18 2 8 9 14 18 16M84 46c8 2 12 10 10 18-2 8-9 14-18 16" />
          <circle cx="64" cy="62" r="28" />
          <circle cx="64" cy="70" r="8" />
          <path d="M56 80c4 4 12 4 16 0" />
        </>
      );
    case "dolphin":
      return (
        <>
          <path d="M30 70c14-18 34-28 50-28 10 0 16 4 22 10-8 0-13 2-16 6 6 1 10 4 12 8-8 2-14 6-18 12-8 10-18 16-34 16-8 0-14-4-16-24z" />
          <path d="M72 44l8-10m-2 14l14-6" />
        </>
      );
    case "swan":
      return (
        <>
          <path d="M74 30c10 0 16 8 16 18 0 8-4 14-10 18 10 2 18 8 20 18H54c4-16 14-22 24-24-6-4-10-10-10-18 0-6 2-12 6-12z" />
          <path d="M74 30c-4 0-8 4-8 10 0 8 6 14 14 16" />
        </>
      );
    case "otter":
      return (
        <>
          <ellipse cx="64" cy="64" rx="28" ry="24" />
          <circle cx="46" cy="46" r="8" />
          <circle cx="82" cy="46" r="8" />
          <path d="M46 72h-10m10 8H34m46-8h12m-12 8h14M56 76c4 4 12 4 16 0" />
        </>
      );
    case "squirrel":
      return (
        <>
          <path d="M82 36c18 4 22 20 16 32-4 8-12 12-20 12" />
          <circle cx="58" cy="64" r="24" />
          <path d="M46 44l8-12 6 14m16-2l8-12 6 14" />
          <path d="M52 76c4 4 10 4 14 0" />
        </>
      );
    case "horse":
      return (
        <>
          <path d="M44 48l16-20 8 16m12-2l16-14 6 18" />
          <path d="M40 60c0-16 12-28 28-28 14 0 24 8 24 24v26c0 8-6 14-14 14H58c-10 0-18-8-18-18V60z" />
          <path d="M58 78c6 3 16 3 22 0" />
        </>
      );
    case "hedgehog":
      return (
        <>
          <path d="M34 68l10-18 8 10 6-14 8 12 8-14 8 14 8-10 10 18" />
          <path d="M38 72c2 14 12 24 26 24s24-10 26-24H38z" />
          <path d="M56 82c4 4 12 4 16 0" />
        </>
      );
    case "elephant":
      return (
        <>
          <circle cx="42" cy="58" r="14" />
          <circle cx="86" cy="58" r="14" />
          <path d="M40 66c0-20 10-32 24-32s24 12 24 32v12c0 10-8 18-18 18H58c-10 0-18-8-18-18V66z" />
          <path d="M64 64v16c0 8 4 12 10 12" />
        </>
      );
    case "crane":
      return (
        <>
          <path d="M70 30c8 0 14 8 14 18 0 10-6 16-10 22l10 24H54l12-28c-4-4-8-10-8-18 0-10 6-18 12-18z" />
          <path d="M84 36l20-4-10 10" />
        </>
      );
    case "whale":
      return (
        <>
          <path d="M30 68c10-18 28-28 48-28 16 0 30 8 38 20-6 0-12 4-14 8 4 4 6 8 6 14-10 0-18 4-24 10H48c-10 0-18-8-18-24z" />
          <path d="M88 88l12 10m-2-14l16 6" />
        </>
      );
    case "falcon":
      return (
        <>
          <path d="M40 76c4-20 16-34 34-40 8-2 16 0 24 4-8 2-14 6-18 12l14 2-14 8c-4 10-14 18-30 24z" />
          <path d="M74 44l14-14m-6 18l16-4" />
        </>
      );
  }
}

export function PersonaBadge({ animalType, size = "md", variant = "soft" }: PersonaBadgeProps) {
  const persona = animalPersonas[animalType];

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-[rgba(255,255,255,0.72)] shadow-[var(--shadow-small)] ${sizeMap[size]}`}
      style={{
        background:
          variant === "paper"
            ? "linear-gradient(180deg, rgba(252,251,250,0.98) 0%, rgba(247,241,232,0.94) 100%)"
            : "linear-gradient(180deg, rgba(252,251,250,0.92) 0%, rgba(255,245,236,0.8) 100%)"
      }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-[10%] rounded-[24px] opacity-20"
        style={{ background: `radial-gradient(circle at 30% 25%, ${persona.accentColor}, transparent 70%)` }}
      />
      <svg
        viewBox="0 0 128 128"
        className="relative z-10 h-[72%] w-[72%]"
        fill="none"
        stroke={persona.accentColor}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {iconStroke(animalType)}
      </svg>
    </div>
  );
}
