import { getBookBySlug } from "@/lib/story-data";

export const dynamic = "force-dynamic";

const palette = {
  fairy_tale: {
    backgroundA: "#d9925b",
    backgroundB: "#f7e3e1",
    accent: "#b85c5c",
    accentSoft: "#fff5ec",
    ink: "#5b3428",
    label: "童话"
  },
  fable: {
    backgroundA: "#5f7f62",
    backgroundB: "#e7efe6",
    accent: "#36543b",
    accentSoft: "#f3f8f0",
    ink: "#24412c",
    label: "寓言"
  },
  mythology: {
    backgroundA: "#86a9c9",
    backgroundB: "#e9f1f8",
    accent: "#496c8a",
    accentSoft: "#f4f8fc",
    ink: "#274863",
    label: "神话"
  }
} as const;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function splitTitle(title: string) {
  if (title.length <= 7) {
    return [title];
  }

  const midpoint = Math.ceil(title.length / 2);
  return [title.slice(0, midpoint), title.slice(midpoint)];
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    return new Response("Not found", { status: 404 });
  }

  const colors = palette[book.categoryKey];
  const [lineOne, lineTwo] = splitTitle(book.title).map(escapeXml);
  const summary = escapeXml(book.summary);

  const svg = `
    <svg width="800" height="1000" viewBox="0 0 800 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="88" y1="68" x2="712" y2="932" gradientUnits="userSpaceOnUse">
          <stop stop-color="${colors.backgroundA}"/>
          <stop offset="1" stop-color="${colors.backgroundB}"/>
        </linearGradient>
        <linearGradient id="paper" x1="156" y1="184" x2="644" y2="824" gradientUnits="userSpaceOnUse">
          <stop stop-color="${colors.accentSoft}" stop-opacity="0.96"/>
          <stop offset="1" stop-color="#FFF9F1" stop-opacity="0.82"/>
        </linearGradient>
      </defs>

      <rect x="18" y="18" width="764" height="964" rx="54" fill="url(#bg)"/>
      <rect x="36" y="36" width="728" height="928" rx="42" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.45)" stroke-width="3"/>
      <circle cx="674" cy="140" r="84" fill="${colors.accent}" fill-opacity="0.18"/>
      <circle cx="156" cy="844" r="112" fill="${colors.accent}" fill-opacity="0.1"/>
      <path d="M132 272C220 188 334 156 468 172C562 183 631 225 684 300" stroke="rgba(255,255,255,0.4)" stroke-width="8" stroke-linecap="round"/>
      <path d="M118 732C206 804 310 836 430 828C542 822 624 785 684 714" stroke="rgba(255,255,255,0.34)" stroke-width="8" stroke-linecap="round"/>

      <rect x="118" y="138" width="564" height="724" rx="42" fill="url(#paper)" stroke="rgba(255,255,255,0.5)" stroke-width="3"/>

      <rect x="154" y="176" width="132" height="44" rx="22" fill="${colors.accent}" fill-opacity="0.15"/>
      <text x="220" y="205" text-anchor="middle" fill="${colors.accent}" font-size="22" font-family="'Noto Serif SC', serif" font-weight="700" letter-spacing="2">${colors.label}</text>

      <text x="160" y="320" fill="${colors.ink}" font-size="66" font-family="'Noto Serif SC', serif" font-weight="800">${lineOne}</text>
      ${
        lineTwo
          ? `<text x="160" y="400" fill="${colors.ink}" font-size="66" font-family="'Noto Serif SC', serif" font-weight="800">${lineTwo}</text>`
          : ""
      }

      <path d="M160 470H640" stroke="${colors.accent}" stroke-opacity="0.22" stroke-width="3"/>

      <text x="160" y="546" fill="${colors.ink}" fill-opacity="0.72" font-size="28" font-family="'Noto Serif SC', serif">A story you can step into</text>

      <foreignObject x="160" y="590" width="480" height="140">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:'Noto Sans SC',sans-serif;font-size:24px;line-height:1.7;color:${colors.ink};opacity:0.72;">
          ${summary}
        </div>
      </foreignObject>

      <rect x="160" y="786" width="208" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.54"/>
      <text x="264" y="815" text-anchor="middle" fill="${colors.accent}" font-size="22" font-family="'Noto Sans SC', sans-serif" font-weight="700">AgentStory</text>
    </svg>
  `.trim();

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  });
}
