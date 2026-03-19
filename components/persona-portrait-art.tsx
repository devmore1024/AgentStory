import React from "react";
import type { AnimalPersona } from "@/lib/animal-personas";

export const PERSONA_PORTRAIT_VIEWBOX = "0 0 128 128";

export type PersonaPortraitArtIds = {
  primary: string;
  secondary: string;
  tertiary: string;
  glow: string;
  shadow: string;
  accent: string;
};

type Palette = {
  primaryFrom: string;
  primaryTo: string;
  secondaryFrom: string;
  secondaryTo: string;
  tertiaryFrom: string;
  tertiaryTo: string;
  accent: string;
  line: string;
  light: string;
  shadow: string;
};

const palettes: Record<AnimalPersona["animalType"], Palette> = {
  bear: {
    primaryFrom: "#B98463",
    primaryTo: "#8C573F",
    secondaryFrom: "#F9E8D7",
    secondaryTo: "#EBC7AE",
    tertiaryFrom: "#D9A688",
    tertiaryTo: "#C28767",
    accent: "#F2C1A2",
    line: "#6F4331",
    light: "#FFF9F2",
    shadow: "#B36E4F"
  },
  deer: {
    primaryFrom: "#CAA072",
    primaryTo: "#A77452",
    secondaryFrom: "#F8E9DA",
    secondaryTo: "#EDD0B3",
    tertiaryFrom: "#E0B996",
    tertiaryTo: "#C9976D",
    accent: "#F2D2B7",
    line: "#7A5339",
    light: "#FFF9F1",
    shadow: "#C48A61"
  },
  fox: {
    primaryFrom: "#FF9A6C",
    primaryTo: "#D17B4C",
    secondaryFrom: "#FFF9F5",
    secondaryTo: "#F7DDCB",
    tertiaryFrom: "#FFD1BA",
    tertiaryTo: "#F3AE84",
    accent: "#FFD8C2",
    line: "#B36136",
    light: "#FFF9F5",
    shadow: "#E08754"
  },
  owl: {
    primaryFrom: "#8FA8C0",
    primaryTo: "#5C7089",
    secondaryFrom: "#F7F0E6",
    secondaryTo: "#E4D4BF",
    tertiaryFrom: "#CAD7E6",
    tertiaryTo: "#99AEC8",
    accent: "#D5BA95",
    line: "#445669",
    light: "#FFF9F2",
    shadow: "#6E8198"
  },
  wolf: {
    primaryFrom: "#A2A8BA",
    primaryTo: "#6C7287",
    secondaryFrom: "#F5F1EE",
    secondaryTo: "#DAD2CE",
    tertiaryFrom: "#C7CBD8",
    tertiaryTo: "#9DA3B6",
    accent: "#D6C0B2",
    line: "#4B515F",
    light: "#FAF7F4",
    shadow: "#7A8092"
  },
  cat: {
    primaryFrom: "#B89983",
    primaryTo: "#8C6C5F",
    secondaryFrom: "#F8EDE3",
    secondaryTo: "#EAD1BF",
    tertiaryFrom: "#DABAA6",
    tertiaryTo: "#BF997F",
    accent: "#F0C6B6",
    line: "#5D473F",
    light: "#FFF9F4",
    shadow: "#A47D68"
  },
  rabbit: {
    primaryFrom: "#D8ABB5",
    primaryTo: "#B88395",
    secondaryFrom: "#FFF2F5",
    secondaryTo: "#F0D8DF",
    tertiaryFrom: "#E8C1CB",
    tertiaryTo: "#D59DAC",
    accent: "#F6D5DD",
    line: "#845C68",
    light: "#FFF7FA",
    shadow: "#C58C9A"
  },
  raven: {
    primaryFrom: "#758093",
    primaryTo: "#424B59",
    secondaryFrom: "#EFF2F5",
    secondaryTo: "#CDD3DB",
    tertiaryFrom: "#AAB3C1",
    tertiaryTo: "#7A8596",
    accent: "#D5DBE5",
    line: "#232A35",
    light: "#F8FAFC",
    shadow: "#566171"
  },
  lion: {
    primaryFrom: "#D8A153",
    primaryTo: "#B1702F",
    secondaryFrom: "#FFF2DF",
    secondaryTo: "#F2D2A7",
    tertiaryFrom: "#E9BC79",
    tertiaryTo: "#CC8D4E",
    accent: "#FFDDA9",
    line: "#7A4B22",
    light: "#FFF9F1",
    shadow: "#B67A40"
  },
  dog: {
    primaryFrom: "#C28E6B",
    primaryTo: "#996646",
    secondaryFrom: "#FFF3E8",
    secondaryTo: "#EFD2BC",
    tertiaryFrom: "#D7AE91",
    tertiaryTo: "#BE8768",
    accent: "#FFD2B8",
    line: "#6B4A38",
    light: "#FFF9F5",
    shadow: "#AD7858"
  },
  dolphin: {
    primaryFrom: "#7ABED7",
    primaryTo: "#4C89B0",
    secondaryFrom: "#EFFBFF",
    secondaryTo: "#CEEAF6",
    tertiaryFrom: "#A8D7E8",
    tertiaryTo: "#73B4D1",
    accent: "#D1F1FA",
    line: "#3D6F8B",
    light: "#F8FDFF",
    shadow: "#5B98B7"
  },
  swan: {
    primaryFrom: "#D8B8CC",
    primaryTo: "#BA91AE",
    secondaryFrom: "#FFF8FC",
    secondaryTo: "#ECD7E4",
    tertiaryFrom: "#F1D2DF",
    tertiaryTo: "#D6A9BE",
    accent: "#FCE4EF",
    line: "#805C74",
    light: "#FFF9FD",
    shadow: "#C493A9"
  },
  otter: {
    primaryFrom: "#B48B66",
    primaryTo: "#856245",
    secondaryFrom: "#FFF4EA",
    secondaryTo: "#E7D0BB",
    tertiaryFrom: "#D6AF8A",
    tertiaryTo: "#B98561",
    accent: "#F7D8BC",
    line: "#624733",
    light: "#FFF8F2",
    shadow: "#9F7455"
  },
  squirrel: {
    primaryFrom: "#C68A4C",
    primaryTo: "#9F6230",
    secondaryFrom: "#FFF1DF",
    secondaryTo: "#F0D0AA",
    tertiaryFrom: "#E6B577",
    tertiaryTo: "#C98448",
    accent: "#FFD9A4",
    line: "#734723",
    light: "#FFF9F0",
    shadow: "#AE7442"
  },
  horse: {
    primaryFrom: "#B48063",
    primaryTo: "#8A5C43",
    secondaryFrom: "#FFF3EA",
    secondaryTo: "#E7CFBF",
    tertiaryFrom: "#D7A88A",
    tertiaryTo: "#BC8162",
    accent: "#F2D2C0",
    line: "#613F33",
    light: "#FFF8F3",
    shadow: "#9D7058"
  },
  hedgehog: {
    primaryFrom: "#A58B7D",
    primaryTo: "#7A655A",
    secondaryFrom: "#FFF6F0",
    secondaryTo: "#E8D7CB",
    tertiaryFrom: "#C5AF9E",
    tertiaryTo: "#A78E7D",
    accent: "#F0E1D7",
    line: "#594B43",
    light: "#FFF9F5",
    shadow: "#8E786C"
  },
  elephant: {
    primaryFrom: "#A9B5C2",
    primaryTo: "#7D8A99",
    secondaryFrom: "#F6FAFD",
    secondaryTo: "#DCE4EC",
    tertiaryFrom: "#C7D1DB",
    tertiaryTo: "#9FACBA",
    accent: "#E5ECF4",
    line: "#566270",
    light: "#FBFDFF",
    shadow: "#8B98A7"
  },
  crane: {
    primaryFrom: "#B1C0C4",
    primaryTo: "#7B9198",
    secondaryFrom: "#F8FBFB",
    secondaryTo: "#DEE8E8",
    tertiaryFrom: "#D2DBDC",
    tertiaryTo: "#A5B2B6",
    accent: "#EDF4F2",
    line: "#586B71",
    light: "#FCFEFD",
    shadow: "#8DA1A6"
  },
  whale: {
    primaryFrom: "#6D97B4",
    primaryTo: "#496D90",
    secondaryFrom: "#F2F8FC",
    secondaryTo: "#D7E6F0",
    tertiaryFrom: "#9FC1D7",
    tertiaryTo: "#759DBA",
    accent: "#DDEFFC",
    line: "#39576F",
    light: "#FAFDFF",
    shadow: "#5B7E9D"
  },
  falcon: {
    primaryFrom: "#8D9AB2",
    primaryTo: "#667287",
    secondaryFrom: "#F4F7FB",
    secondaryTo: "#D7DEE8",
    tertiaryFrom: "#BBC5D7",
    tertiaryTo: "#8C99B2",
    accent: "#E4EAF4",
    line: "#475160",
    light: "#FAFCFE",
    shadow: "#758198"
  }
};

export const personaPortraitMotionStyles = `
  .persona-float {
    animation: persona-portrait-float 6s ease-in-out infinite;
  }

  .persona-breathe {
    animation: persona-portrait-breathe 5s ease-in-out infinite;
  }

  .persona-blink {
    animation: persona-portrait-blink 4.4s infinite;
  }

  .persona-sway {
    animation: persona-portrait-sway 5.8s ease-in-out infinite;
  }

  .persona-drift {
    animation: persona-portrait-drift 7s ease-in-out infinite;
  }

  .persona-glint {
    animation: persona-portrait-glint 3.6s ease-in-out infinite;
  }

  @keyframes persona-portrait-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  @keyframes persona-portrait-breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  }

  @keyframes persona-portrait-blink {
    0%, 95%, 100% { transform: scaleY(1); }
    97% { transform: scaleY(0.12); }
  }

  @keyframes persona-portrait-sway {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(2.2deg); }
  }

  @keyframes persona-portrait-drift {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(2px); }
  }

  @keyframes persona-portrait-glint {
    0%, 100% { opacity: 0.85; }
    50% { opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .persona-float,
    .persona-breathe,
    .persona-blink,
    .persona-sway,
    .persona-drift,
    .persona-glint {
      animation: none !important;
    }
  }
`;

function origin(x: number, y: number) {
  return {
    transformOrigin: `${x}px ${y}px`,
    transformBox: "view-box" as const
  };
}

function gradient(id: string, from: string, to: string) {
  return (
    <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor={from} />
      <stop offset="100%" stopColor={to} />
    </linearGradient>
  );
}

function radialGlow(id: string, inner: string, outer: string) {
  return (
    <radialGradient id={id} cx="50%" cy="40%" r="70%">
      <stop offset="0%" stopColor={inner} stopOpacity="0.9" />
      <stop offset="100%" stopColor={outer} stopOpacity="0" />
    </radialGradient>
  );
}

function shadowGradient(id: string, color: string) {
  return (
    <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor={color} stopOpacity="0.16" />
      <stop offset="50%" stopColor={color} stopOpacity="0.28" />
      <stop offset="100%" stopColor={color} stopOpacity="0.12" />
    </linearGradient>
  );
}

function bearPortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.bear;

  return (
    <>
      <defs>
        {gradient(ids.primary, palette.primaryFrom, palette.primaryTo)}
        {gradient(ids.secondary, palette.secondaryFrom, palette.secondaryTo)}
        {gradient(ids.tertiary, palette.tertiaryFrom, palette.tertiaryTo)}
        {radialGlow(ids.glow, palette.light, palette.accent)}
        {shadowGradient(ids.shadow, palette.shadow)}
      </defs>
      <ellipse cx="64" cy="106" rx="24" ry="8" fill={`url(#${ids.shadow})`} className="persona-drift" style={origin(64, 106)} />
      <g className="persona-float" style={origin(64, 68)}>
        <ellipse cx="64" cy="68" rx="34" ry="31" fill={`url(#${ids.glow})`} opacity="0.4" />
        <circle cx="43" cy="38" r="13" fill={`url(#${ids.primary})`} stroke={palette.line} strokeWidth="2.5" />
        <circle cx="85" cy="38" r="13" fill={`url(#${ids.primary})`} stroke={palette.line} strokeWidth="2.5" />
        <circle cx="43" cy="38" r="5.8" fill={palette.accent} opacity="0.82" />
        <circle cx="85" cy="38" r="5.8" fill={palette.accent} opacity="0.82" />
        <circle cx="64" cy="68" r="34" fill={`url(#${ids.primary})`} stroke={palette.line} strokeWidth="3" />
        <ellipse cx="64" cy="84" rx="18" ry="14" fill={`url(#${ids.secondary})`} stroke={palette.line} strokeWidth="2.4" className="persona-breathe" style={origin(64, 84)} />
        <ellipse cx="52" cy="66" rx="3.8" ry="4.8" fill={palette.line} className="persona-blink" style={origin(52, 66)} />
        <ellipse cx="76" cy="66" rx="3.8" ry="4.8" fill={palette.line} className="persona-blink" style={origin(76, 66)} />
        <circle cx="50" cy="76" r="3.6" fill={palette.accent} opacity="0.45" />
        <circle cx="78" cy="76" r="3.6" fill={palette.accent} opacity="0.45" />
        <path d="M64 74l-6 7h12l-6-7z" fill={palette.line} />
        <path d="M56 85c3 4 13 4 16 0" fill="none" stroke={palette.line} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M48 94c4 6 10 11 16 11s12-5 16-11" fill="none" stroke={palette.line} strokeWidth="2.2" strokeLinecap="round" opacity="0.4" />
      </g>
    </>
  );
}

function deerPortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.deer;

  return (
    <>
      <defs>
        {gradient(ids.primary, palette.primaryFrom, palette.primaryTo)}
        {gradient(ids.secondary, palette.secondaryFrom, palette.secondaryTo)}
        {gradient(ids.tertiary, palette.tertiaryFrom, palette.tertiaryTo)}
        {radialGlow(ids.glow, palette.light, palette.accent)}
        {shadowGradient(ids.shadow, palette.shadow)}
      </defs>
      <ellipse cx="64" cy="108" rx="23" ry="7" fill={`url(#${ids.shadow})`} />
      <g className="persona-float" style={origin(64, 66)}>
        <g className="persona-sway" style={origin(64, 34)}>
          <path d="M48 44l-9-20m9 20l-15-7m15 7l-6-10m38 10l9-20m-9 20l15-7m-15 7l6-10" fill="none" stroke={palette.line} strokeWidth="3" strokeLinecap="round" />
        </g>
        <path d="M42 52l11-14 6 16m22-2 11-14 6 16" fill={`url(#${ids.tertiary})`} stroke={palette.line} strokeWidth="2.5" strokeLinejoin="round" />
        <ellipse cx="64" cy="72" rx="28" ry="33" fill={`url(#${ids.primary})`} stroke={palette.line} strokeWidth="3" />
        <ellipse cx="64" cy="86" rx="14" ry="11" fill={`url(#${ids.secondary})`} stroke={palette.line} strokeWidth="2.2" className="persona-breathe" style={origin(64, 86)} />
        <ellipse cx="52" cy="69" rx="3.3" ry="4.8" fill={palette.line} className="persona-blink" style={origin(52, 69)} />
        <ellipse cx="76" cy="69" rx="3.3" ry="4.8" fill={palette.line} className="persona-blink" style={origin(76, 69)} />
        <path d="M64 78l-4 5h8l-4-5z" fill={palette.line} />
        <path d="M58 90c2.8 3.5 9.2 3.5 12 0" fill="none" stroke={palette.line} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M48 98c4 6 9 9 16 9s12-3 16-9" fill="none" stroke={palette.line} strokeWidth="2.2" strokeLinecap="round" opacity="0.36" />
        <ellipse cx="64" cy="71" rx="34" ry="30" fill={`url(#${ids.glow})`} opacity="0.28" />
      </g>
    </>
  );
}

function foxPortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.fox;

  return (
    <>
      <defs>
        {gradient(ids.primary, palette.primaryFrom, palette.primaryTo)}
        {gradient(ids.secondary, palette.secondaryFrom, palette.secondaryTo)}
        {gradient(ids.tertiary, palette.tertiaryFrom, palette.tertiaryTo)}
        {radialGlow(ids.glow, palette.light, palette.accent)}
        {shadowGradient(ids.shadow, palette.shadow)}
      </defs>
      <ellipse cx="64" cy="107" rx="24" ry="7" fill={`url(#${ids.shadow})`} />
      <g className="persona-float" style={origin(64, 58)}>
        <ellipse cx="64" cy="64" rx="33" ry="30" fill={`url(#${ids.glow})`} opacity="0.24" />
        <path
          d="M40 52 L54 30 L64 42 L74 30 L88 52 L82 86 H46 Z"
          fill={`url(#${ids.primary})`}
          stroke={palette.line}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M40 52 Q64 72 88 52 L82 86 Q64 88 46 86 Z" fill={`url(#${ids.secondary})`} />
        <polygon points="46,46 54,34 59,44" fill={`url(#${ids.tertiary})`} />
        <polygon points="82,46 74,34 69,44" fill={`url(#${ids.tertiary})`} />
        <ellipse cx="52" cy="53" rx="3.5" ry="4.5" fill="#3D2314" className="persona-blink" style={origin(52, 53)} />
        <ellipse cx="76" cy="53" rx="3.5" ry="4.5" fill="#3D2314" className="persona-blink" style={origin(76, 53)} />
        <polygon points="64,58 59,66 69,66" fill="#3D2314" stroke="#3D2314" strokeWidth="1" strokeLinejoin="round" />
        <path d="M56 67 C59 71 69 71 72 67" fill="none" stroke="#3D2314" strokeWidth="3" strokeLinecap="round" />
        <g stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
          <path d="M42 62 L30 59" />
          <path d="M44 68 L32 68" />
          <path d="M86 62 L98 59" />
          <path d="M84 68 L96 68" />
        </g>
      </g>
    </>
  );
}

function owlPortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.owl;

  return (
    <>
      <defs>
        {gradient(ids.primary, palette.primaryFrom, palette.primaryTo)}
        {gradient(ids.secondary, palette.secondaryFrom, palette.secondaryTo)}
        {gradient(ids.tertiary, palette.tertiaryFrom, palette.tertiaryTo)}
        {radialGlow(ids.glow, palette.light, palette.accent)}
        {shadowGradient(ids.shadow, palette.shadow)}
      </defs>
      <ellipse cx="64" cy="108" rx="22" ry="7" fill={`url(#${ids.shadow})`} />
      <g className="persona-float" style={origin(64, 66)}>
        <path d="M44 46l9-10m22 10 9-10" fill="none" stroke={palette.line} strokeWidth="3" strokeLinecap="round" />
        <path
          d="M36 73c0-24 13-38 28-38s28 14 28 38v16c0 13-10 24-23 24H59c-13 0-23-11-23-24V73z"
          fill={`url(#${ids.primary})`}
          stroke={palette.line}
          strokeWidth="3"
        />
        <path d="M42 81c4 13 12 19 22 19s18-6 22-19" fill={`url(#${ids.tertiary})`} opacity="0.42" />
        <circle cx="52" cy="69" r="13" fill={`url(#${ids.secondary})`} stroke={palette.line} strokeWidth="2.3" />
        <circle cx="76" cy="69" r="13" fill={`url(#${ids.secondary})`} stroke={palette.line} strokeWidth="2.3" />
        <ellipse cx="52" cy="70" rx="3.5" ry="5.4" fill={palette.line} className="persona-blink" style={origin(52, 70)} />
        <ellipse cx="76" cy="70" rx="3.5" ry="5.4" fill={palette.line} className="persona-blink" style={origin(76, 70)} />
        <circle cx="54" cy="67" r="1.2" fill={palette.light} className="persona-glint" />
        <circle cx="78" cy="67" r="1.2" fill={palette.light} className="persona-glint" />
        <path d="M64 75l-6 9h12l-6-9z" fill={palette.accent} stroke={palette.line} strokeWidth="2" strokeLinejoin="round" />
        <path d="M52 91c4 3 8 5 12 5s8-2 12-5" fill="none" stroke={palette.line} strokeWidth="2.3" strokeLinecap="round" opacity="0.5" />
      </g>
    </>
  );
}

function wolfPortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.wolf;

  return (
    <>
      <defs>
        {gradient(ids.primary, palette.primaryFrom, palette.primaryTo)}
        {gradient(ids.secondary, palette.secondaryFrom, palette.secondaryTo)}
        {gradient(ids.tertiary, palette.tertiaryFrom, palette.tertiaryTo)}
        {radialGlow(ids.glow, palette.light, palette.accent)}
        {shadowGradient(ids.shadow, palette.shadow)}
      </defs>
      <ellipse cx="64" cy="107" rx="24" ry="7" fill={`url(#${ids.shadow})`} />
      <g className="persona-float" style={origin(64, 66)}>
        <path
          d="M41 52l14-21 9 14 9-14 14 21-6 34c-4 9-11 16-17 16s-13-7-17-16l-6-34z"
          fill={`url(#${ids.primary})`}
          stroke={palette.line}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M47 61c7 7 13 10 17 10s10-3 17-10l-4 25c-4 7-8 12-13 12s-9-5-13-12l-4-25z" fill={`url(#${ids.secondary})`} />
        <path d="M50 48l8-11 4 11m28 0-8-11-4 11" fill={`url(#${ids.tertiary})`} stroke={palette.line} strokeWidth="2.1" strokeLinejoin="round" />
        <path d="M53 58h7m15 0h-7" fill="none" stroke={palette.line} strokeWidth="2.3" strokeLinecap="round" />
        <ellipse cx="54" cy="62" rx="2.8" ry="4" fill={palette.line} className="persona-blink" style={origin(54, 62)} />
        <ellipse cx="74" cy="62" rx="2.8" ry="4" fill={palette.line} className="persona-blink" style={origin(74, 62)} />
        <path d="M64 66l-5 7h10l-5-7z" fill={palette.line} />
        <path d="M56 78c4 3 12 3 16 0" fill="none" stroke={palette.line} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M47 87c5 8 11 12 17 12s12-4 17-12" fill="none" stroke={palette.line} strokeWidth="2.2" strokeLinecap="round" opacity="0.34" />
      </g>
    </>
  );
}

function catPortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.cat;

  return (
    <>
      <defs>
        {gradient(ids.primary, palette.primaryFrom, palette.primaryTo)}
        {gradient(ids.secondary, palette.secondaryFrom, palette.secondaryTo)}
        {gradient(ids.tertiary, palette.tertiaryFrom, palette.tertiaryTo)}
        {radialGlow(ids.glow, palette.light, palette.accent)}
        {shadowGradient(ids.shadow, palette.shadow)}
      </defs>
      <ellipse cx="64" cy="107" rx="22" ry="7" fill={`url(#${ids.shadow})`} className="persona-drift" style={origin(64, 107)} />
      <g className="persona-float" style={origin(64, 65)}>
        <path d="M43 49l12-15 6 20m22-5 12-15 6 20" fill={`url(#${ids.tertiary})`} stroke={palette.line} strokeWidth="2.4" strokeLinejoin="round" />
        <path
          d="M38 69c0-20 13-32 26-32s26 12 26 32v14c0 14-11 25-26 25S38 97 38 83V69z"
          fill={`url(#${ids.primary})`}
          stroke={palette.line}
          strokeWidth="3"
        />
        <ellipse cx="64" cy="84" rx="16" ry="12" fill={`url(#${ids.secondary})`} stroke={palette.line} strokeWidth="2.1" className="persona-breathe" style={origin(64, 84)} />
        <path d="M51 67c3-3 7-3 10 0m7 0c3-3 7-3 10 0" fill="none" stroke={palette.line} strokeWidth="2.3" strokeLinecap="round" />
        <ellipse cx="54" cy="70" rx="3" ry="4.6" fill={palette.line} className="persona-blink" style={origin(54, 70)} />
        <ellipse cx="74" cy="70" rx="3" ry="4.6" fill={palette.line} className="persona-blink" style={origin(74, 70)} />
        <path d="M64 76l-4 5h8l-4-5z" fill={palette.accent} stroke={palette.line} strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M58 86c2.5 3 9.5 3 12 0" fill="none" stroke={palette.line} strokeWidth="2.3" strokeLinecap="round" />
        <g stroke={palette.line} strokeWidth="2" strokeLinecap="round" opacity="0.82">
          <path d="M46 82 33 78" />
          <path d="M47 88 33 88" />
          <path d="M82 82 95 78" />
          <path d="M81 88 95 88" />
        </g>
      </g>
    </>
  );
}

function rabbitPortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.rabbit;

  return (
    <>
      <defs>
        {gradient(ids.primary, palette.primaryFrom, palette.primaryTo)}
        {gradient(ids.secondary, palette.secondaryFrom, palette.secondaryTo)}
        {gradient(ids.tertiary, palette.tertiaryFrom, palette.tertiaryTo)}
        {radialGlow(ids.glow, palette.light, palette.accent)}
        {shadowGradient(ids.shadow, palette.shadow)}
      </defs>
      <ellipse cx="64" cy="108" rx="22" ry="7" fill={`url(#${ids.shadow})`} />
      <g className="persona-float" style={origin(64, 66)}>
        <g className="persona-sway" style={origin(56, 36)}>
          <path d="M49 69V29c0-11 5-16 12-16s12 5 12 16v26" fill={`url(#${ids.primary})`} stroke={palette.line} strokeWidth="2.7" />
          <path d="M57 64V29c0-7-2-10-7-10s-7 3-7 10v35" fill={`url(#${ids.tertiary})`} opacity="0.74" />
        </g>
        <g className="persona-sway" style={origin(80, 34)}>
          <path d="M71 69V24c0-12 5-18 13-18s13 6 13 18v45" fill={`url(#${ids.primary})`} stroke={palette.line} strokeWidth="2.7" />
          <path d="M79 63V25c0-8-2-11-7-11s-7 3-7 11v38" fill={`url(#${ids.tertiary})`} opacity="0.7" />
        </g>
        <circle cx="64" cy="83" r="24" fill={`url(#${ids.primary})`} stroke={palette.line} strokeWidth="3" />
        <ellipse cx="64" cy="91" rx="14" ry="10.5" fill={`url(#${ids.secondary})`} stroke={palette.line} strokeWidth="2.1" className="persona-breathe" style={origin(64, 91)} />
        <ellipse cx="55" cy="81" rx="3.2" ry="4.8" fill={palette.line} className="persona-blink" style={origin(55, 81)} />
        <ellipse cx="73" cy="81" rx="3.2" ry="4.8" fill={palette.line} className="persona-blink" style={origin(73, 81)} />
        <path d="M64 85l-4 5h8l-4-5z" fill={palette.accent} stroke={palette.line} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M58 95c2.5 3 9.5 3 12 0" fill="none" stroke={palette.line} strokeWidth="2.3" strokeLinecap="round" />
      </g>
    </>
  );
}

function ravenPortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.raven;

  return (
    <>
      <defs>
        {gradient(ids.primary, palette.primaryFrom, palette.primaryTo)}
        {gradient(ids.secondary, palette.secondaryFrom, palette.secondaryTo)}
        {gradient(ids.tertiary, palette.tertiaryFrom, palette.tertiaryTo)}
        {radialGlow(ids.glow, palette.light, palette.accent)}
        {shadowGradient(ids.shadow, palette.shadow)}
      </defs>
      <ellipse cx="64" cy="109" rx="23" ry="7" fill={`url(#${ids.shadow})`} />
      <g className="persona-float" style={origin(65, 70)}>
        <path
          d="M38 87c3-24 20-42 43-42 18 0 31 9 39 24-10-2-19 0-27 6l16 4-17 12c-5 12-17 20-34 23-11 2-20-7-20-27z"
          fill={`url(#${ids.primary})`}
          stroke={palette.line}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M60 48c15 2 26 10 32 23-8-2-15 0-22 5 0-10-4-19-10-28z" fill={`url(#${ids.tertiary})`} opacity="0.58" />
        <path d="M83 76l22 4-20 12" fill={`url(#${ids.secondary})`} stroke={palette.line} strokeWidth="2.2" strokeLinejoin="round" className="persona-drift" style={origin(93, 82)} />
        <circle cx="74" cy="70" r="4" fill={palette.light} />
        <circle cx="75" cy="70" r="2.4" fill={palette.line} className="persona-glint" />
        <path d="M52 95c7 5 21 4 31-2" fill="none" stroke={palette.accent} strokeWidth="2.2" strokeLinecap="round" opacity="0.82" />
        <path d="M47 101c8 6 18 8 28 6" fill="none" stroke={palette.line} strokeWidth="2" strokeLinecap="round" opacity="0.36" />
      </g>
    </>
  );
}

function simplePortrait(
  ids: PersonaPortraitArtIds,
  palette: Palette,
  content: React.ReactNode,
  motionClass = "persona-float"
) {
  return (
    <>
      <defs>
        {gradient(ids.primary, palette.primaryFrom, palette.primaryTo)}
        {gradient(ids.secondary, palette.secondaryFrom, palette.secondaryTo)}
        {gradient(ids.tertiary, palette.tertiaryFrom, palette.tertiaryTo)}
        {radialGlow(ids.glow, palette.light, palette.accent)}
        {shadowGradient(ids.shadow, palette.shadow)}
      </defs>
      <ellipse cx="64" cy="108" rx="23" ry="7" fill={`url(#${ids.shadow})`} />
      <g className={motionClass} style={origin(64, 68)}>
        <ellipse cx="64" cy="67" rx="34" ry="30" fill={`url(#${ids.glow})`} opacity="0.24" />
        {content}
      </g>
    </>
  );
}

function lionPortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.lion;

  return simplePortrait(
    ids,
    palette,
    <>
      <circle cx="64" cy="70" r="28" fill={`url(#${ids.tertiary})`} stroke={palette.line} strokeWidth="3" />
      <circle cx="64" cy="72" r="21" fill={`url(#${ids.primary})`} stroke={palette.line} strokeWidth="2.5" />
      <ellipse cx="64" cy="82" rx="12" ry="9" fill={`url(#${ids.secondary})`} stroke={palette.line} strokeWidth="2" className="persona-breathe" style={origin(64, 82)} />
      <ellipse cx="54" cy="69" rx="3.2" ry="4.6" fill={palette.line} className="persona-blink" style={origin(54, 69)} />
      <ellipse cx="74" cy="69" rx="3.2" ry="4.6" fill={palette.line} className="persona-blink" style={origin(74, 69)} />
      <path d="M64 74l-4 5h8l-4-5z" fill={palette.line} />
      <path d="M57 84c3 3 11 3 14 0" fill="none" stroke={palette.line} strokeWidth="2.4" strokeLinecap="round" />
    </>
  );
}

function dogPortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.dog;

  return simplePortrait(
    ids,
    palette,
    <>
      <path d="M38 60c-8 2-12 10-10 18 2 10 10 16 20 18M90 60c8 2 12 10 10 18-2 10-10 16-20 18" fill={`url(#${ids.tertiary})`} stroke={palette.line} strokeWidth="2.6" />
      <circle cx="64" cy="72" r="25" fill={`url(#${ids.primary})`} stroke={palette.line} strokeWidth="3" />
      <ellipse cx="64" cy="84" rx="13" ry="10" fill={`url(#${ids.secondary})`} stroke={palette.line} strokeWidth="2.1" className="persona-breathe" style={origin(64, 84)} />
      <ellipse cx="54" cy="72" rx="3.2" ry="4.6" fill={palette.line} className="persona-blink" style={origin(54, 72)} />
      <ellipse cx="74" cy="72" rx="3.2" ry="4.6" fill={palette.line} className="persona-blink" style={origin(74, 72)} />
      <path d="M64 78l-4 4h8l-4-4z" fill={palette.line} />
      <path d="M58 88c2.6 3 9.4 3 12 0" fill="none" stroke={palette.line} strokeWidth="2.3" strokeLinecap="round" />
    </>
  );
}

function dolphinPortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.dolphin;

  return simplePortrait(
    ids,
    palette,
    <>
      <path
        d="M32 78c10-20 28-30 46-30 14 0 24 6 32 15-7 0-12 2-16 6 6 1 10 4 12 8-8 2-14 6-18 12-8 10-18 15-34 15-10 0-18-6-22-26z"
        fill={`url(#${ids.primary})`}
        stroke={palette.line}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M72 50l9-12m-2 16l16-6" fill="none" stroke={palette.line} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="72" cy="69" r="3" fill={palette.light} />
      <circle cx="73" cy="69" r="1.8" fill={palette.line} className="persona-glint" />
      <path d="M48 90c8 5 18 5 26 0" fill="none" stroke={palette.accent} strokeWidth="2.2" strokeLinecap="round" />
    </>,
    "persona-drift"
  );
}

function swanPortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.swan;

  return simplePortrait(
    ids,
    palette,
    <>
      <path d="M63 42c8 0 13 7 13 17 0 8-4 14-9 18 8 2 15 8 18 18H47c4-16 13-22 23-24-5-4-9-10-9-17 0-8 3-12 9-12z" fill={`url(#${ids.primary})`} stroke={palette.line} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M63 42c-4 0-7 4-7 9 0 8 6 13 13 16" fill="none" stroke={palette.line} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M75 47l15-4-8 10" fill="none" stroke={palette.line} strokeWidth="2.2" strokeLinecap="round" />
    </>,
    "persona-sway"
  );
}

function otterPortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.otter;

  return simplePortrait(
    ids,
    palette,
    <>
      <circle cx="64" cy="72" r="24" fill={`url(#${ids.primary})`} stroke={palette.line} strokeWidth="3" />
      <circle cx="46" cy="56" r="8" fill={`url(#${ids.tertiary})`} stroke={palette.line} strokeWidth="2" />
      <circle cx="82" cy="56" r="8" fill={`url(#${ids.tertiary})`} stroke={palette.line} strokeWidth="2" />
      <ellipse cx="64" cy="83" rx="12" ry="9" fill={`url(#${ids.secondary})`} stroke={palette.line} strokeWidth="2" />
      <path d="M48 82H38m10 6H34m42-6h10m-10 6h14" fill="none" stroke={palette.line} strokeWidth="2" strokeLinecap="round" />
      <path d="M58 88c2.5 3 9.5 3 12 0" fill="none" stroke={palette.line} strokeWidth="2.2" strokeLinecap="round" />
    </>
  );
}

function squirrelPortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.squirrel;

  return simplePortrait(
    ids,
    palette,
    <>
      <path d="M92 42c18 4 22 18 16 30-4 7-10 12-18 13" fill="none" stroke={palette.line} strokeWidth="5" strokeLinecap="round" />
      <circle cx="58" cy="74" r="22" fill={`url(#${ids.primary})`} stroke={palette.line} strokeWidth="3" />
      <path d="M42 59l8-12 6 13m16 0l8-12 6 13" fill={`url(#${ids.tertiary})`} stroke={palette.line} strokeWidth="2.2" strokeLinejoin="round" />
      <ellipse cx="57" cy="76" rx="3" ry="4.2" fill={palette.line} className="persona-blink" style={origin(57, 76)} />
      <ellipse cx="71" cy="76" rx="3" ry="4.2" fill={palette.line} className="persona-blink" style={origin(71, 76)} />
      <path d="M58 86c3 3 8 3 11 0" fill="none" stroke={palette.line} strokeWidth="2.1" strokeLinecap="round" />
    </>
  );
}

function horsePortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.horse;

  return simplePortrait(
    ids,
    palette,
    <>
      <path d="M42 58l10-14 6 14m20-4 12-10 6 16" fill={`url(#${ids.tertiary})`} stroke={palette.line} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M40 73c0-18 12-28 24-28s24 10 24 28v14c0 11-8 20-19 20H59c-11 0-19-9-19-20V73z" fill={`url(#${ids.primary})`} stroke={palette.line} strokeWidth="3" />
      <path d="M52 87c6 3 18 3 24 0" fill="none" stroke={palette.line} strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="54" cy="70" rx="2.8" ry="4.4" fill={palette.line} className="persona-blink" style={origin(54, 70)} />
      <ellipse cx="74" cy="70" rx="2.8" ry="4.4" fill={palette.line} className="persona-blink" style={origin(74, 70)} />
    </>
  );
}

function hedgehogPortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.hedgehog;

  return simplePortrait(
    ids,
    palette,
    <>
      <path d="M36 72l10-14 8 8 6-12 8 10 8-12 8 12 6-10 8 12 8-8 10 14" fill={`url(#${ids.tertiary})`} stroke={palette.line} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M40 74c2 18 12 29 24 29s22-11 24-29H40z" fill={`url(#${ids.primary})`} stroke={palette.line} strokeWidth="3" />
      <path d="M54 90c4 4 16 4 20 0" fill="none" stroke={palette.line} strokeWidth="2.2" strokeLinecap="round" />
    </>
  );
}

function elephantPortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.elephant;

  return simplePortrait(
    ids,
    palette,
    <>
      <circle cx="44" cy="72" r="13" fill={`url(#${ids.tertiary})`} stroke={palette.line} strokeWidth="2.4" />
      <circle cx="84" cy="72" r="13" fill={`url(#${ids.tertiary})`} stroke={palette.line} strokeWidth="2.4" />
      <path d="M38 76c0-18 10-29 26-29s26 11 26 29v10c0 12-8 21-19 21H57c-11 0-19-9-19-21V76z" fill={`url(#${ids.primary})`} stroke={palette.line} strokeWidth="3" />
      <path d="M64 74v14c0 8 4 13 9 13" fill="none" stroke={palette.line} strokeWidth="4" strokeLinecap="round" />
    </>
  );
}

function cranePortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.crane;

  return simplePortrait(
    ids,
    palette,
    <>
      <path d="M64 42c8 0 13 8 13 19 0 10-5 18-9 24l9 19H51l11-24c-5-4-8-11-8-19 0-11 4-19 10-19z" fill={`url(#${ids.primary})`} stroke={palette.line} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M77 49l18-5-10 11" fill="none" stroke={palette.line} strokeWidth="2.3" strokeLinecap="round" />
    </>,
    "persona-sway"
  );
}

function whalePortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.whale;

  return simplePortrait(
    ids,
    palette,
    <>
      <path
        d="M28 77c12-18 30-27 50-27 16 0 28 7 36 18-8 0-15 4-18 8 6 3 9 8 9 14-10 0-18 4-24 10H54c-14 0-26-9-26-23z"
        fill={`url(#${ids.primary})`}
        stroke={palette.line}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M88 98l10 10m-2-12l14 6" fill="none" stroke={palette.line} strokeWidth="2.2" strokeLinecap="round" />
    </>,
    "persona-drift"
  );
}

function falconPortrait(ids: PersonaPortraitArtIds) {
  const palette = palettes.falcon;

  return simplePortrait(
    ids,
    palette,
    <>
      <path
        d="M38 92c4-22 16-38 34-44 10-3 18-1 28 5-8 2-14 8-18 14l14 3-14 8c-4 10-13 18-28 26z"
        fill={`url(#${ids.primary})`}
        stroke={palette.line}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M73 52l12-12m-4 16l18-5" fill="none" stroke={palette.line} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="72" cy="68" r="2.6" fill={palette.line} />
    </>,
    "persona-drift"
  );
}

export function renderPersonaPortraitArt(
  animalType: AnimalPersona["animalType"],
  ids: PersonaPortraitArtIds
) {
  switch (animalType) {
    case "bear":
      return bearPortrait(ids);
    case "deer":
      return deerPortrait(ids);
    case "fox":
      return foxPortrait(ids);
    case "owl":
      return owlPortrait(ids);
    case "wolf":
      return wolfPortrait(ids);
    case "cat":
      return catPortrait(ids);
    case "rabbit":
      return rabbitPortrait(ids);
    case "raven":
      return ravenPortrait(ids);
    case "lion":
      return lionPortrait(ids);
    case "dog":
      return dogPortrait(ids);
    case "dolphin":
      return dolphinPortrait(ids);
    case "swan":
      return swanPortrait(ids);
    case "otter":
      return otterPortrait(ids);
    case "squirrel":
      return squirrelPortrait(ids);
    case "horse":
      return horsePortrait(ids);
    case "hedgehog":
      return hedgehogPortrait(ids);
    case "elephant":
      return elephantPortrait(ids);
    case "crane":
      return cranePortrait(ids);
    case "whale":
      return whalePortrait(ids);
    case "falcon":
      return falconPortrait(ids);
  }
}
