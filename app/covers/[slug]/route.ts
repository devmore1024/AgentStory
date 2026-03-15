import { getBookBySlug } from "@/lib/story-data";

export const dynamic = "force-dynamic";

const palette = {
  fairy_tale: {
    backgroundA: "#F7D7AE",
    backgroundB: "#F9EEE2",
    backgroundC: "#F4C9B8",
    paper: "#FFF9F0",
    frame: "#E0C7A2",
    ink: "#5E3F2E",
    accent: "#C9785E",
    accentSoft: "#FCE7DC",
    accentDeep: "#A65746",
    label: "童话"
  },
  fable: {
    backgroundA: "#D3E3C5",
    backgroundB: "#F4F3D9",
    backgroundC: "#BFD1A7",
    paper: "#FBF9EE",
    frame: "#CAD2B0",
    ink: "#39503A",
    accent: "#739261",
    accentSoft: "#E8F0DE",
    accentDeep: "#4E6D46",
    label: "寓言"
  },
  mythology: {
    backgroundA: "#C7D8EC",
    backgroundB: "#EEF2FA",
    backgroundC: "#DCCFE9",
    paper: "#F8FAFF",
    frame: "#C7D4E5",
    ink: "#334A68",
    accent: "#6487B0",
    accentSoft: "#E3ECF7",
    accentDeep: "#4D6E91",
    label: "神话"
  }
} as const;

type CategoryKey = keyof typeof palette;
type MotifKey =
  | "forest"
  | "castle"
  | "sea"
  | "moonbird"
  | "shoe"
  | "mirror"
  | "tower"
  | "swan"
  | "fox"
  | "lion"
  | "hare"
  | "grapes"
  | "ant"
  | "tortoise"
  | "crow"
  | "donkey"
  | "fire"
  | "lightning"
  | "maze"
  | "wings"
  | "trident"
  | "owl"
  | "lyre";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function hashString(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function splitTitle(title: string) {
  if (title.length <= 6) {
    return [title];
  }

  if (title.length <= 12) {
    const midpoint = Math.ceil(title.length / 2);
    return [title.slice(0, midpoint), title.slice(midpoint)];
  }

  const first = Math.ceil(title.length / 3);
  const second = Math.ceil((title.length - first) / 2);
  return [title.slice(0, first), title.slice(first, first + second), title.slice(first + second)];
}

function inferMotif(categoryKey: CategoryKey, title: string, slug: string, synopsis: string | null) {
  const signals = `${title} ${slug} ${synopsis ?? ""}`.toLowerCase();

  if (categoryKey === "fairy_tale") {
    if (/red|hood|wolf|forest|woods|小红帽|狼|森林/.test(signals)) return "forest";
    if (/snow|queen|princess|castle|白雪|公主|王子|城堡/.test(signals)) return "castle";
    if (/mermaid|sea|ocean|海|人鱼|海的女儿/.test(signals)) return "sea";
    if (/nightingale|rose|moon|bird|夜莺|玫瑰|月/.test(signals)) return "moonbird";
    if (/cinderella|shoe|灰姑娘|水晶鞋/.test(signals)) return "shoe";
    if (/mirror|queen|镜|魔镜/.test(signals)) return "mirror";
    if (/tower|sleeping|thorn|长发|睡美人|塔/.test(signals)) return "tower";
    if (/swan|goose|天鹅|鹅/.test(signals)) return "swan";
    return "forest";
  }

  if (categoryKey === "fable") {
    if (/fox|狐狸/.test(signals)) return "fox";
    if (/lion|狮/.test(signals)) return "lion";
    if (/hare|rabbit|兔/.test(signals)) return "hare";
    if (/grape|葡萄/.test(signals)) return "grapes";
    if (/ant|蚂蚁|grasshopper|蝉/.test(signals)) return "ant";
    if (/tortoise|turtle|龟/.test(signals)) return "tortoise";
    if (/crow|raven|乌鸦/.test(signals)) return "crow";
    if (/donkey|驴/.test(signals)) return "donkey";
    return "fox";
  }

  if (/prometheus|fire|火|普罗米修斯/.test(signals)) return "fire";
  if (/zeus|lightning|宙斯|雷/.test(signals)) return "lightning";
  if (/labyrinth|maze|迷宫/.test(signals)) return "maze";
  if (/icarus|wings|飞翼|伊卡洛斯/.test(signals)) return "wings";
  if (/poseidon|trident|海神|三叉戟/.test(signals)) return "trident";
  if (/athena|owl|雅典娜|猫头鹰/.test(signals)) return "owl";
  if (/apollo|lyre|阿波罗|琴/.test(signals)) return "lyre";

  return "lightning";
}

function renderDecorations(colors: (typeof palette)[CategoryKey], seed: number) {
  const circles = Array.from({ length: 5 }, (_, index) => {
    const x = 110 + ((seed + index * 97) % 520);
    const y = 110 + ((seed + index * 131) % 180);
    const radius = 16 + ((seed + index * 17) % 26);
    const opacity = 0.08 + (((seed + index * 11) % 12) / 100);
    return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${colors.accent}" opacity="${opacity.toFixed(2)}"/>`;
  }).join("");

  const stars = Array.from({ length: 7 }, (_, index) => {
    const x = 124 + ((seed + index * 83) % 540);
    const y = 128 + ((seed + index * 53) % 220);
    const size = 4 + ((seed + index * 7) % 6);
    return `<path d="M${x} ${y - size}L${x + size * 0.35} ${y - size * 0.35}L${x + size} ${y}L${x + size * 0.35} ${y + size * 0.35}L${x} ${y + size}L${x - size * 0.35} ${y + size * 0.35}L${x - size} ${y}L${x - size * 0.35} ${y - size * 0.35}Z" fill="white" opacity="0.55"/>`;
  }).join("");

  return `${circles}${stars}`;
}

function renderMotif(motif: MotifKey, colors: (typeof palette)[CategoryKey], seed: number) {
  const offset = (seed % 18) - 9;

  switch (motif) {
    case "forest":
      return `
        <path d="M208 606C256 492 322 410 408 362C490 408 556 492 604 606H208Z" fill="${colors.accentSoft}"/>
        <path d="M278 606L338 470L398 606H278Z" fill="${colors.accentDeep}" opacity="0.88"/>
        <path d="M392 606L458 424L524 606H392Z" fill="${colors.accent}" opacity="0.88"/>
        <path d="M242 606L296 506L350 606H242Z" fill="${colors.accent}" opacity="0.72"/>
        <path d="M482 606L536 504L590 606H482Z" fill="${colors.accentDeep}" opacity="0.74"/>
        <path d="M352 636C390 604 434 604 466 636" stroke="${colors.ink}" stroke-width="12" stroke-linecap="round"/>
      `;
    case "castle":
      return `
        <rect x="286" y="406" width="244" height="220" rx="28" fill="${colors.accentSoft}" stroke="${colors.accentDeep}" stroke-width="10"/>
        <rect x="316" y="364" width="44" height="88" rx="12" fill="${colors.accent}"/>
        <rect x="420" y="334" width="44" height="118" rx="12" fill="${colors.accentDeep}"/>
        <rect x="474" y="378" width="38" height="74" rx="12" fill="${colors.accent}"/>
        <path d="M380 626V534C380 500 396 482 420 482C444 482 460 500 460 534V626" fill="${colors.accent}" opacity="0.8"/>
        <path d="M304 394l34-40 34 40M420 364l34-42 34 42M472 406l28-34 28 34" fill="${colors.accentDeep}"/>
      `;
    case "sea":
      return `
        <circle cx="516" cy="360" r="52" fill="${colors.accentSoft}" opacity="0.9"/>
        <path d="M224 588C280 536 334 512 396 512C454 512 522 536 596 588" stroke="${colors.accent}" stroke-width="14" stroke-linecap="round"/>
        <path d="M220 628C292 574 356 548 420 548C488 548 550 576 606 628" stroke="${colors.accentDeep}" stroke-width="14" stroke-linecap="round" opacity="0.78"/>
        <path d="M402 414C450 444 470 488 462 548C454 602 428 632 400 656C372 632 346 602 338 548C330 488 350 444 402 414Z" fill="${colors.accentSoft}" stroke="${colors.accentDeep}" stroke-width="10"/>
        <path d="M400 662C358 638 326 638 300 676C338 688 374 694 400 694C426 694 462 688 500 676C474 638 442 638 400 662Z" fill="${colors.accent}"/>
      `;
    case "moonbird":
      return `
        <circle cx="520" cy="348" r="68" fill="${colors.accentSoft}"/>
        <circle cx="548" cy="332" r="68" fill="${colors.paper}"/>
        <path d="M278 576C328 524 374 504 418 504C474 504 516 532 560 584" stroke="${colors.accentDeep}" stroke-width="12" stroke-linecap="round"/>
        <path d="M362 566C388 518 430 490 488 484C458 534 430 566 362 566Z" fill="${colors.accent}" opacity="0.82"/>
        <path d="M448 548C462 510 488 490 536 486C514 522 490 548 448 548Z" fill="${colors.accentSoft}" stroke="${colors.accentDeep}" stroke-width="8"/>
        <circle cx="480" cy="516" r="8" fill="${colors.ink}"/>
      `;
    case "shoe":
      return `
        <path d="M278 586C332 586 392 580 452 552C474 542 500 534 528 534C552 534 574 540 594 554C602 610 556 642 472 648H298C268 648 246 632 246 610C246 594 258 586 278 586Z" fill="${colors.accentSoft}" stroke="${colors.accentDeep}" stroke-width="10"/>
        <path d="M484 534C500 490 522 456 550 430" stroke="${colors.accent}" stroke-width="10" stroke-linecap="round"/>
        <circle cx="562" cy="416" r="18" fill="${colors.accent}"/>
        <path d="M292 554C324 536 354 504 386 458" stroke="${colors.accent}" stroke-width="10" stroke-linecap="round" opacity="0.58"/>
      `;
    case "mirror":
      return `
        <rect x="280" y="316" width="240" height="288" rx="120" fill="${colors.accentSoft}" stroke="${colors.accentDeep}" stroke-width="12"/>
        <rect x="316" y="352" width="168" height="216" rx="84" fill="${colors.paper}" stroke="${colors.accent}" stroke-width="8"/>
        <path d="M382 606H418V666H382z" fill="${colors.accent}"/>
        <ellipse cx="400" cy="700" rx="86" ry="26" fill="${colors.accent}" opacity="0.32"/>
        <path d="M400 388C434 388 462 414 462 446C462 488 430 510 400 534C370 510 338 488 338 446C338 414 366 388 400 388Z" fill="${colors.accentSoft}" stroke="${colors.accentDeep}" stroke-width="8"/>
      `;
    case "tower":
      return `
        <rect x="334" y="320" width="132" height="316" rx="30" fill="${colors.accentSoft}" stroke="${colors.accentDeep}" stroke-width="10"/>
        <path d="M320 346L356 302L392 346M408 346L444 302L480 346" fill="${colors.accent}"/>
        <path d="M400 456C432 456 456 480 456 514V636H344V514C344 480 368 456 400 456Z" fill="${colors.paper}" stroke="${colors.accent}" stroke-width="8"/>
        <path d="M470 356C520 356 552 378 566 420C532 430 504 428 470 410Z" fill="${colors.accent}" opacity="0.74"/>
      `;
    case "swan":
      return `
        <ellipse cx="406" cy="650" rx="182" ry="34" fill="${colors.accentSoft}"/>
        <path d="M324 594C352 542 404 510 452 510C488 510 520 530 546 564C498 576 462 592 434 618C402 612 366 604 324 594Z" fill="${colors.accent}" opacity="0.84"/>
        <path d="M434 618C434 548 454 488 490 444C516 412 550 392 582 392C576 430 560 466 532 494C504 522 472 548 434 618Z" fill="${colors.accentSoft}" stroke="${colors.accentDeep}" stroke-width="10"/>
        <circle cx="548" cy="422" r="6" fill="${colors.ink}"/>
      `;
    case "fox":
      return `
        <path d="M278 610L338 448L402 512L468 448L532 610H278Z" fill="${colors.accentSoft}" stroke="${colors.accentDeep}" stroke-width="10"/>
        <path d="M338 448L396 388L458 448" fill="${colors.accent}" opacity="0.82"/>
        <ellipse cx="404" cy="592" rx="42" ry="30" fill="${colors.paper}"/>
        <path d="M378 596C388 604 420 604 430 596" stroke="${colors.ink}" stroke-width="8" stroke-linecap="round"/>
      `;
    case "lion":
      return `
        <circle cx="402" cy="500" r="118" fill="${colors.accentSoft}" stroke="${colors.accent}" stroke-width="12"/>
        <circle cx="402" cy="520" r="82" fill="${colors.paper}" stroke="${colors.accentDeep}" stroke-width="10"/>
        <circle cx="370" cy="504" r="10" fill="${colors.ink}"/>
        <circle cx="434" cy="504" r="10" fill="${colors.ink}"/>
        <path d="M388 544C394 552 410 552 416 544" stroke="${colors.ink}" stroke-width="8" stroke-linecap="round"/>
      `;
    case "hare":
      return `
        <path d="M352 424V286C352 252 368 232 392 232C414 232 430 252 430 286V424" fill="${colors.accentSoft}" stroke="${colors.accentDeep}" stroke-width="10"/>
        <path d="M426 432V262C426 228 442 208 466 208C490 208 506 228 506 262V454" fill="${colors.accent}" opacity="0.82"/>
        <circle cx="406" cy="534" r="104" fill="${colors.paper}" stroke="${colors.accentDeep}" stroke-width="10"/>
        <path d="M372 558C382 566 430 566 442 558" stroke="${colors.ink}" stroke-width="8" stroke-linecap="round"/>
      `;
    case "grapes":
      return `
        ${Array.from({ length: 11 }, (_, index) => {
          const x = 356 + (index % 3) * 46 + (index % 2 ? 16 : 0);
          const y = 448 + Math.floor(index / 3) * 46;
          return `<circle cx="${x}" cy="${y}" r="22" fill="${index % 2 ? colors.accent : colors.accentDeep}" opacity="0.88"/>`;
        }).join("")}
        <path d="M410 408C420 370 450 338 500 322" stroke="${colors.ink}" stroke-width="10" stroke-linecap="round"/>
        <path d="M486 322C514 324 536 334 556 356C530 364 504 364 480 348Z" fill="${colors.accentSoft}"/>
      `;
    case "ant":
      return `
        <path d="M322 596C356 566 392 552 430 552C478 552 526 572 576 614" stroke="${colors.accentDeep}" stroke-width="12" stroke-linecap="round"/>
        <circle cx="330" cy="598" r="18" fill="${colors.accentDeep}"/>
        <circle cx="370" cy="588" r="22" fill="${colors.accent}"/>
        <circle cx="416" cy="578" r="26" fill="${colors.accentDeep}"/>
        <path d="M498 470C514 442 548 422 588 420" stroke="${colors.accent}" stroke-width="10" stroke-linecap="round"/>
        <path d="M534 470C560 454 590 454 616 470" stroke="${colors.accent}" stroke-width="10" stroke-linecap="round"/>
      `;
    case "tortoise":
      return `
        <path d="M264 592C286 518 348 470 426 470C500 470 560 512 586 592" fill="${colors.accentSoft}" stroke="${colors.accentDeep}" stroke-width="10"/>
        <path d="M324 592C346 540 384 514 430 514C476 514 514 540 536 592" stroke="${colors.accent}" stroke-width="8" stroke-linecap="round"/>
        <circle cx="596" cy="566" r="24" fill="${colors.paper}" stroke="${colors.accentDeep}" stroke-width="8"/>
        <path d="M278 610h42M500 610h42" stroke="${colors.accentDeep}" stroke-width="10" stroke-linecap="round"/>
      `;
    case "crow":
      return `
        <path d="M284 590C304 514 354 458 420 442C480 426 544 446 590 496C548 504 512 524 484 556C450 570 384 582 284 590Z" fill="${colors.accentDeep}" opacity="0.92"/>
        <path d="M472 520L554 538L478 564" fill="${colors.accent}" opacity="0.84"/>
        <circle cx="432" cy="492" r="8" fill="${colors.paper}"/>
      `;
    case "donkey":
      return `
        <path d="M318 610V394L356 324L386 392H476L512 330L542 394V610H318Z" fill="${colors.accentSoft}" stroke="${colors.accentDeep}" stroke-width="10"/>
        <path d="M356 324L336 256M512 330L534 260" stroke="${colors.accentDeep}" stroke-width="10" stroke-linecap="round"/>
        <path d="M390 566C402 574 458 574 470 566" stroke="${colors.ink}" stroke-width="8" stroke-linecap="round"/>
      `;
    case "fire":
      return `
        <path d="M410 332C450 394 482 438 482 500C482 582 430 648 400 692C364 648 316 582 316 506C316 456 338 414 382 362C388 410 402 438 422 468C430 430 428 386 410 332Z" fill="${colors.accent}" opacity="0.94"/>
        <path d="M398 442C424 474 438 504 438 546C438 590 418 622 400 646C378 622 358 590 358 548C358 514 372 486 398 442Z" fill="${colors.accentSoft}"/>
      `;
    case "lightning":
      return `
        <circle cx="402" cy="468" r="124" fill="${colors.accentSoft}" opacity="0.72"/>
        <path d="M438 304L350 476H424L366 656L514 454H434L438 304Z" fill="${colors.accent}" stroke="${colors.accentDeep}" stroke-width="10" stroke-linejoin="round"/>
      `;
    case "maze":
      return `
        <rect x="280" y="354" width="248" height="248" rx="28" fill="${colors.accentSoft}" stroke="${colors.accentDeep}" stroke-width="10"/>
        <path d="M326 402H482V446H372V494H456V540H324V588H486" stroke="${colors.accentDeep}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="494" cy="588" r="12" fill="${colors.accent}"/>
      `;
    case "wings":
      return `
        <path d="M404 428C454 362 526 342 600 366C566 426 514 482 434 516" fill="${colors.accentSoft}" stroke="${colors.accentDeep}" stroke-width="10"/>
        <path d="M396 438C346 372 274 352 200 376C234 436 286 492 366 526" fill="${colors.accent}" opacity="0.84" stroke="${colors.accentDeep}" stroke-width="10"/>
        <path d="M400 420V644" stroke="${colors.ink}" stroke-width="10" stroke-linecap="round"/>
      `;
    case "trident":
      return `
        <path d="M400 304V682" stroke="${colors.accentDeep}" stroke-width="12" stroke-linecap="round"/>
        <path d="M400 304C386 348 352 378 308 392V334C346 320 378 286 392 244" fill="${colors.accent}" opacity="0.84"/>
        <path d="M400 304C414 348 448 378 492 392V334C454 320 422 286 408 244" fill="${colors.accent}" opacity="0.84"/>
        <path d="M400 276C400 338 424 382 466 412V354C432 326 416 292 410 244" fill="${colors.accentSoft}"/>
        <path d="M400 276C400 338 376 382 334 412V354C368 326 384 292 390 244" fill="${colors.accentSoft}"/>
      `;
    case "owl":
      return `
        <path d="M286 492C286 392 342 336 402 336C462 336 518 392 518 492V566C518 622 474 664 422 664H382C330 664 286 622 286 566V492Z" fill="${colors.accentSoft}" stroke="${colors.accentDeep}" stroke-width="10"/>
        <circle cx="362" cy="486" r="34" fill="${colors.paper}" stroke="${colors.accentDeep}" stroke-width="8"/>
        <circle cx="442" cy="486" r="34" fill="${colors.paper}" stroke="${colors.accentDeep}" stroke-width="8"/>
        <circle cx="362" cy="486" r="10" fill="${colors.ink}"/>
        <circle cx="442" cy="486" r="10" fill="${colors.ink}"/>
        <path d="M402 510L384 538H420L402 510Z" fill="${colors.accentDeep}"/>
      `;
    case "lyre":
      return `
        <path d="M338 324C332 404 322 474 308 538C300 576 304 614 328 642C352 670 388 678 424 668C460 678 496 670 520 642C544 614 548 576 540 538C526 474 516 404 510 324" fill="${colors.accentSoft}" stroke="${colors.accentDeep}" stroke-width="10"/>
        <path d="M362 352H486" stroke="${colors.accent}" stroke-width="10" stroke-linecap="round"/>
        <path d="M364 378V618M392 378V632M420 378V638M448 378V632M476 378V618" stroke="${colors.accentDeep}" stroke-width="6" stroke-linecap="round"/>
      `;
  }
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    return new Response("Not found", { status: 404 });
  }

  const colors = palette[book.categoryKey];
  const motif = inferMotif(book.categoryKey, book.title, book.slug, book.originalSynopsis);
  const seed = hashString(book.slug);
  const lines = splitTitle(book.title).map(escapeXml);
  const summary = escapeXml(book.summary);
  const decorations = renderDecorations(colors, seed);
  const illustration = renderMotif(motif, colors, seed + 17);
  const titleY = lines.length === 1 ? 726 : lines.length === 2 ? 692 : 672;

  const svg = `
    <svg width="800" height="1000" viewBox="0 0 800 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="coverBg" x1="64" y1="56" x2="732" y2="944" gradientUnits="userSpaceOnUse">
          <stop stop-color="${colors.backgroundA}"/>
          <stop offset="0.56" stop-color="${colors.backgroundB}"/>
          <stop offset="1" stop-color="${colors.backgroundC}"/>
        </linearGradient>
        <linearGradient id="panelBg" x1="154" y1="154" x2="648" y2="858" gradientUnits="userSpaceOnUse">
          <stop stop-color="${colors.paper}" stop-opacity="0.98"/>
          <stop offset="1" stop-color="#FFFDF8" stop-opacity="0.92"/>
        </linearGradient>
        <filter id="softShadow" x="118" y="122" width="564" height="756" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="18" stdDeviation="26" flood-color="#7A5B42" flood-opacity="0.16"/>
        </filter>
      </defs>

      <rect x="18" y="18" width="764" height="964" rx="56" fill="url(#coverBg)"/>
      <rect x="34" y="34" width="732" height="932" rx="44" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.42)" stroke-width="3"/>
      <rect x="118" y="128" width="564" height="744" rx="44" fill="url(#panelBg)" stroke="${colors.frame}" stroke-width="3" filter="url(#softShadow)"/>

      ${decorations}

      <rect x="156" y="164" width="132" height="42" rx="21" fill="${colors.accent}" fill-opacity="0.16"/>
      <text x="222" y="191" text-anchor="middle" fill="${colors.accentDeep}" font-size="21" font-family="'Noto Serif SC', serif" font-weight="700" letter-spacing="2">${colors.label}</text>

      <rect x="164" y="232" width="472" height="378" rx="34" fill="${colors.accentSoft}" fill-opacity="0.48" stroke="rgba(255,255,255,0.56)" stroke-width="3"/>
      <path d="M188 566C258 518 328 494 404 494C486 494 556 520 612 566V586H188V566Z" fill="rgba(255,255,255,0.34)"/>
      ${illustration}

      <path d="M176 636H624" stroke="${colors.frame}" stroke-opacity="0.5" stroke-width="3"/>

      ${lines
        .map(
          (line, index) => `
            <text
              x="400"
              y="${titleY + index * 74}"
              text-anchor="middle"
              fill="${colors.ink}"
              font-size="${lines.length === 3 ? 54 : 60}"
              font-family="'Noto Serif SC', serif"
              font-weight="800"
              letter-spacing="1.5"
            >${line}</text>
          `
        )
        .join("")}

      <foreignObject x="164" y="778" width="472" height="116">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:'Noto Sans SC',sans-serif;font-size:23px;line-height:1.7;color:${colors.ink};opacity:0.74;text-align:center;">
          ${summary}
        </div>
      </foreignObject>

      <rect x="304" y="906" width="192" height="38" rx="19" fill="#FFFFFF" fill-opacity="0.64"/>
      <text x="400" y="931" text-anchor="middle" fill="${colors.accentDeep}" font-size="20" font-family="'Noto Sans SC', sans-serif" font-weight="700" letter-spacing="1">AgentStory</text>
    </svg>
  `.trim();

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  });
}
