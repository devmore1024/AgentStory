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
  }
}

export function PersonaBadge({ animalType, size = "md", variant = "soft" }: PersonaBadgeProps) {
  const persona = animalPersonas[animalType];

  return (
    <div
      className={`relative flex items-center justify-center border border-[rgba(255,255,255,0.72)] shadow-[var(--shadow-small)] ${sizeMap[size]}`}
      style={{
        background:
          variant === "paper"
            ? "linear-gradient(180deg, rgba(255,250,243,0.98) 0%, rgba(247,241,232,0.94) 100%)"
            : "linear-gradient(180deg, rgba(255,250,243,0.92) 0%, rgba(255,245,236,0.8) 100%)"
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
