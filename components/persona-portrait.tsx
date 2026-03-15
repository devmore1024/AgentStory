import { animalPersonas, type AnimalPersona } from "@/lib/animal-personas";

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

function portraitShapes(animalType: AnimalPersona["animalType"], accent: string) {
  switch (animalType) {
    case "bear":
      return (
        <>
          <circle cx="115" cy="108" r="24" fill={accent} fillOpacity="0.12" />
          <circle cx="90" cy="108" r="24" fill={accent} fillOpacity="0.12" />
          <circle cx="102" cy="122" r="48" fill="#fffaf3" />
          <circle cx="102" cy="122" r="46" stroke={accent} strokeWidth="4" fill="none" />
          <circle cx="72" cy="88" r="16" stroke={accent} strokeWidth="4" fill="#fffaf3" />
          <circle cx="132" cy="88" r="16" stroke={accent} strokeWidth="4" fill="#fffaf3" />
          <ellipse cx="102" cy="130" rx="18" ry="13" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="4" />
          <path d="M91 142c5 5 17 5 22 0" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case "deer":
      return (
        <>
          <path d="M78 80l-12-22m12 22l-20-8m48 8l12-22m-12 22l20-8" stroke={accent} strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="102" cy="122" rx="38" ry="48" fill="#fffaf3" stroke={accent} strokeWidth="4" />
          <path d="M88 138c8 6 20 6 28 0" stroke={accent} strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="82" cy="92" rx="12" ry="18" fill={accent} fillOpacity="0.1" />
          <ellipse cx="122" cy="92" rx="12" ry="18" fill={accent} fillOpacity="0.1" />
        </>
      );
    case "fox":
      return (
        <>
          <path d="M62 88l20-30 20 18 20-18 20 30-10 58H72L62 88z" fill="#fffaf3" stroke={accent} strokeWidth="4" strokeLinejoin="round" />
          <path d="M102 96l-14 22h28l-14-22z" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="4" strokeLinejoin="round" />
          <path d="M88 132c8 6 20 6 28 0" stroke={accent} strokeWidth="4" strokeLinecap="round" />
          <path d="M64 154c14-8 24-12 38-12 16 0 28 5 40 14" stroke={accent} strokeOpacity="0.28" strokeWidth="6" strokeLinecap="round" />
        </>
      );
    case "owl":
      return (
        <>
          <path d="M78 82l10-10m28 10l-10-10" stroke={accent} strokeWidth="4" strokeLinecap="round" />
          <path d="M64 102c0-28 16-42 38-42s38 14 38 42v34c0 10-8 18-18 18H82c-10 0-18-8-18-18v-34z" fill="#fffaf3" stroke={accent} strokeWidth="4" />
          <circle cx="86" cy="108" r="14" fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="4" />
          <circle cx="118" cy="108" r="14" fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="4" />
          <path d="M102 114l-6 12h12l-6-12z" fill={accent} fillOpacity="0.18" stroke={accent} strokeWidth="4" strokeLinejoin="round" />
        </>
      );
    case "wolf":
      return (
        <>
          <path d="M66 94l16-34 20 18 20-18 16 34-10 58H76L66 94z" fill="#fffaf3" stroke={accent} strokeWidth="4" strokeLinejoin="round" />
          <path d="M102 98l-10 18h20l-10-18z" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="4" strokeLinejoin="round" />
          <path d="M86 134c10 5 22 5 32 0" stroke={accent} strokeWidth="4" strokeLinecap="round" />
          <path d="M56 156c18-10 31-14 46-14 18 0 32 5 46 16" stroke={accent} strokeOpacity="0.26" strokeWidth="6" strokeLinecap="round" />
        </>
      );
    case "cat":
      return (
        <>
          <path d="M68 88l16-20 8 24m20-4l16-20 8 24" stroke={accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M64 108c0-26 16-40 38-40s38 14 38 40v28c0 12-9 20-20 20H84c-11 0-20-8-20-20v-28z" fill="#fffaf3" stroke={accent} strokeWidth="4" />
          <path d="M82 124H64m18 10H60m62-10h18m-18 10h22" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case "rabbit":
      return (
        <>
          <path d="M76 90V48c0-14 7-20 16-20s16 6 16 20v32" fill="#fffaf3" stroke={accent} strokeWidth="4" />
          <path d="M102 80V38c0-14 7-20 16-20s16 6 16 20v52" fill="#fffaf3" stroke={accent} strokeWidth="4" />
          <circle cx="102" cy="128" r="40" fill="#fffaf3" stroke={accent} strokeWidth="4" />
          <path d="M88 142c8 6 20 6 28 0" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case "raven":
      return (
        <>
          <path d="M60 138c8-40 32-66 68-66 28 0 42 12 48 28-18-4-34 1-44 10l28 6-28 14c-10 14-28 22-56 22-8 0-14-5-16-14z" fill="#fffaf3" stroke={accent} strokeWidth="4" strokeLinejoin="round" />
          <circle cx="124" cy="104" r="4" fill={accent} />
          <path d="M60 158c22-6 40-8 60-8 16 0 28 3 42 8" stroke={accent} strokeOpacity="0.26" strokeWidth="6" strokeLinecap="round" />
        </>
      );
  }
}

export function PersonaPortrait({
  animalType,
  background = "auto",
  mood = "calm",
  className = ""
}: PersonaPortraitProps) {
  const persona = animalPersonas[animalType];
  const bg = backgroundMap[persona.bgStyleKey];
  const from = background === "contrast" ? "#fffaf3" : bg.from;
  const to = background === "contrast" ? bg.to : bg.to;
  const opacity = mood === "bright" ? 0.28 : 0.2;

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
      <svg viewBox="0 0 204 204" className="relative z-10 mx-auto aspect-square w-full max-w-[18rem]" role="img" aria-label={`${persona.animalName}动物人格头像`}>
        <circle cx="102" cy="102" r="82" fill="#fffaf3" fillOpacity="0.36" />
        {portraitShapes(animalType, persona.accentColor)}
      </svg>
    </div>
  );
}
