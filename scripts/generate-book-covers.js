const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const sharp = require("sharp");
const { Client } = require("pg");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const source = fs.readFileSync(filePath, "utf8");

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();

    if (!key || process.env[key]) {
      continue;
    }

    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));

const palette = {
  fairy_tale: {
    label: "童话",
    backgroundA: "#F5D4AE",
    backgroundB: "#F7EBDD",
    backgroundC: "#EBC3AF",
    paper: "#FFF8EF",
    frame: "#DFC09A",
    ink: "#543A2B",
    accent: "#C76C5A",
    accentSoft: "#F8DED4",
    accentDeep: "#A15445",
    glow: "#F9F1D2"
  },
  fable: {
    label: "寓言",
    backgroundA: "#CADAB8",
    backgroundB: "#F0F2DD",
    backgroundC: "#B6CCAB",
    paper: "#FAF9ED",
    frame: "#C7D0AF",
    ink: "#374B36",
    accent: "#6F8D60",
    accentSoft: "#E4EEDB",
    accentDeep: "#4E6C46",
    glow: "#EEF0D1"
  },
  mythology: {
    label: "神话",
    backgroundA: "#C8D8EB",
    backgroundB: "#EFF3FA",
    backgroundC: "#D8CBE9",
    paper: "#F9FBFF",
    frame: "#C6D3E4",
    ink: "#314865",
    accent: "#6A86B0",
    accentSoft: "#E3EBF8",
    accentDeep: "#4C6A91",
    glow: "#E9E1F6"
  }
};

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function hashString(input) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function splitTitle(title) {
  const plain = title.replace(/\s+/g, "");

  if (plain.length <= 6) {
    return [title];
  }

  if (plain.length <= 12) {
    const midpoint = Math.ceil(title.length / 2);
    return [title.slice(0, midpoint), title.slice(midpoint)];
  }

  const first = Math.ceil(title.length / 3);
  const second = Math.ceil((title.length - first) / 2);
  return [
    title.slice(0, first),
    title.slice(first, first + second),
    title.slice(first + second)
  ];
}

function splitSummary(summary) {
  const normalized = summary.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [];
  }

  if (normalized.length <= 24) {
    return [normalized];
  }

  if (normalized.length <= 48) {
    const midpoint = Math.ceil(normalized.length / 2);
    return [normalized.slice(0, midpoint), normalized.slice(midpoint)];
  }

  return [normalized.slice(0, 24), normalized.slice(24, 48)];
}

function normalizeScenes(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string");
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
    } catch {
      return [];
    }
  }

  return [];
}

function inferMotif(book) {
  const signals = [
    book.title,
    book.slug,
    book.summary,
    book.original_synopsis,
    ...normalizeScenes(book.key_scenes)
  ]
    .join(" ")
    .toLowerCase();

  if (book.category_key === "fairy_tale") {
    if (/狼|wolf|forest|woods|red riding hood|小红帽/.test(signals)) return "forest";
    if (/snow|queen|princess|castle|白雪|公主|王子|城堡/.test(signals)) return "castle";
    if (/mermaid|sea|ocean|海|人鱼|海的女儿/.test(signals)) return "sea";
    if (/moon|rose|nightingale|夜莺|月|玫瑰/.test(signals)) return "moonbird";
    if (/shoe|cinderella|灰姑娘|水晶鞋/.test(signals)) return "shoe";
    if (/mirror|queen|镜|魔镜/.test(signals)) return "mirror";
    if (/tower|sleeping|thorn|塔|睡美人|长发/.test(signals)) return "tower";
    if (/swan|goose|天鹅|鹅/.test(signals)) return "swan";
    return "forest";
  }

  if (book.category_key === "fable") {
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

function renderDecorations(colors, seed) {
  const circles = Array.from({ length: 6 }, (_, index) => {
    const x = 150 + ((seed + index * 97) % 900);
    const y = 130 + ((seed + index * 157) % 260);
    const radius = 18 + ((seed + index * 13) % 32);
    const opacity = 0.08 + (((seed + index * 11) % 8) / 100);
    return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${colors.accent}" opacity="${opacity.toFixed(2)}"/>`;
  }).join("");

  const sparkles = Array.from({ length: 9 }, (_, index) => {
    const x = 164 + ((seed + index * 67) % 890);
    const y = 120 + ((seed + index * 41) % 360);
    const size = 5 + ((seed + index * 5) % 8);
    return `<path d="M${x} ${y - size}L${x + size * 0.35} ${y - size * 0.35}L${x + size} ${y}L${x + size * 0.35} ${y + size * 0.35}L${x} ${y + size}L${x - size * 0.35} ${y + size * 0.35}L${x - size} ${y}L${x - size * 0.35} ${y - size * 0.35}Z" fill="#FFFFFF" opacity="0.62"/>`;
  }).join("");

  return `${circles}${sparkles}`;
}

function renderLayout(layout, colors) {
  if (layout === 0) {
    return `
      <path d="M250 240C250 176 302 124 366 124H834C898 124 950 176 950 240V650H250V240Z" fill="${colors.accentSoft}" fill-opacity="0.62" stroke="rgba(255,255,255,0.72)" stroke-width="6"/>
      <rect x="278" y="170" width="644" height="520" rx="48" fill="rgba(255,255,255,0.18)"/>
    `;
  }

  if (layout === 1) {
    return `
      <ellipse cx="600" cy="406" rx="310" ry="250" fill="${colors.accentSoft}" fill-opacity="0.62" stroke="rgba(255,255,255,0.74)" stroke-width="6"/>
      <ellipse cx="600" cy="406" rx="270" ry="212" fill="rgba(255,255,255,0.14)"/>
    `;
  }

  return `
    <rect x="248" y="150" width="704" height="540" rx="64" fill="${colors.accentSoft}" fill-opacity="0.58" stroke="rgba(255,255,255,0.72)" stroke-width="6"/>
    <rect x="290" y="192" width="620" height="456" rx="42" fill="rgba(255,255,255,0.16)"/>
  `;
}

function renderMotif(motif, colors) {
  switch (motif) {
    case "forest":
      return `
        <path d="M354 666C422 508 514 392 634 322C748 386 840 506 906 666H354Z" fill="${colors.glow}" opacity="0.88"/>
        <path d="M446 666L526 486L604 666H446Z" fill="${colors.accentDeep}" opacity="0.88"/>
        <path d="M596 666L684 430L772 666H596Z" fill="${colors.accent}" opacity="0.86"/>
        <path d="M388 666L456 536L524 666H388Z" fill="${colors.accent}" opacity="0.7"/>
        <path d="M700 666L768 532L836 666H700Z" fill="${colors.accentDeep}" opacity="0.72"/>
        <path d="M548 706C598 666 656 666 698 706" stroke="${colors.ink}" stroke-width="16" stroke-linecap="round"/>
      `;
    case "castle":
      return `
        <rect x="424" y="366" width="352" height="318" rx="34" fill="${colors.glow}" stroke="${colors.accentDeep}" stroke-width="12"/>
        <rect x="464" y="312" width="58" height="118" rx="12" fill="${colors.accent}"/>
        <rect x="618" y="270" width="58" height="160" rx="12" fill="${colors.accentDeep}"/>
        <rect x="694" y="330" width="48" height="100" rx="12" fill="${colors.accent}"/>
        <path d="M562 684V556C562 514 586 490 620 490C654 490 678 514 678 556V684" fill="${colors.accent}" opacity="0.82"/>
        <path d="M448 350l42-52 42 52M618 308l44-56 44 56M694 348l34-44 34 44" fill="${colors.accentDeep}"/>
      `;
    case "sea":
      return `
        <circle cx="780" cy="276" r="74" fill="${colors.glow}" opacity="0.92"/>
        <path d="M370 640C448 574 526 542 612 542C692 542 788 576 896 640" stroke="${colors.accent}" stroke-width="18" stroke-linecap="round"/>
        <path d="M366 694C464 628 554 592 642 592C734 592 820 630 906 696" stroke="${colors.accentDeep}" stroke-width="18" stroke-linecap="round" opacity="0.8"/>
        <path d="M618 410C684 452 710 510 700 592C690 664 654 708 616 742C576 708 540 664 530 592C520 510 548 452 618 410Z" fill="${colors.glow}" stroke="${colors.accentDeep}" stroke-width="12"/>
        <path d="M616 748C560 714 516 714 482 764C532 780 578 788 616 788C654 788 700 780 750 764C716 714 672 714 616 748Z" fill="${colors.accent}"/>
      `;
    case "moonbird":
      return `
        <circle cx="792" cy="286" r="88" fill="${colors.glow}" opacity="0.92"/>
        <circle cx="832" cy="266" r="88" fill="${colors.paper}" opacity="0.96"/>
        <path d="M408 632C478 560 544 532 608 532C688 532 748 570 810 642" stroke="${colors.accentDeep}" stroke-width="16" stroke-linecap="round"/>
        <path d="M528 616C566 548 626 510 710 500C666 568 626 616 528 616Z" fill="${colors.accent}" opacity="0.82"/>
        <path d="M648 592C668 534 706 504 776 500C744 554 710 592 648 592Z" fill="${colors.glow}" stroke="${colors.accentDeep}" stroke-width="10"/>
      `;
    case "shoe":
      return `
        <path d="M418 656C494 656 578 648 660 610C692 596 726 586 766 586C800 586 832 594 860 612C870 690 806 738 692 746H446C402 746 370 724 370 692C370 668 386 656 418 656Z" fill="${colors.glow}" stroke="${colors.accentDeep}" stroke-width="12"/>
        <path d="M704 584C726 522 756 474 794 438" stroke="${colors.accent}" stroke-width="12" stroke-linecap="round"/>
        <circle cx="810" cy="420" r="22" fill="${colors.accent}"/>
        <path d="M436 612C478 586 520 540 566 474" stroke="${colors.accent}" stroke-width="12" stroke-linecap="round" opacity="0.56"/>
      `;
    case "mirror":
      return `
        <rect x="420" y="246" width="356" height="420" rx="178" fill="${colors.glow}" stroke="${colors.accentDeep}" stroke-width="12"/>
        <rect x="470" y="300" width="258" height="320" rx="128" fill="${colors.paper}" stroke="${colors.accent}" stroke-width="10"/>
        <path d="M590 664H610V748H590z" fill="${colors.accent}"/>
        <ellipse cx="600" cy="786" rx="124" ry="34" fill="${colors.accent}" opacity="0.28"/>
      `;
    case "tower":
      return `
        <rect x="504" y="242" width="192" height="454" rx="36" fill="${colors.glow}" stroke="${colors.accentDeep}" stroke-width="12"/>
        <path d="M484 280L538 220L592 280M608 280L662 220L716 280" fill="${colors.accent}"/>
        <path d="M600 438C646 438 680 472 680 520V696H520V520C520 472 554 438 600 438Z" fill="${colors.paper}" stroke="${colors.accent}" stroke-width="10"/>
        <path d="M702 294C776 294 826 328 846 390C794 404 754 402 702 376Z" fill="${colors.accent}" opacity="0.72"/>
      `;
    case "swan":
      return `
        <ellipse cx="618" cy="760" rx="250" ry="42" fill="${colors.glow}"/>
        <path d="M476 682C514 608 590 560 664 560C718 560 766 588 804 636C732 654 678 676 638 714C592 704 542 694 476 682Z" fill="${colors.accent}" opacity="0.86"/>
        <path d="M638 714C638 614 666 530 718 468C756 420 802 392 846 392C838 446 814 498 774 540C734 580 688 616 638 714Z" fill="${colors.glow}" stroke="${colors.accentDeep}" stroke-width="12"/>
      `;
    case "fox":
      return `
        <path d="M418 704L504 476L596 566L686 476L776 704H418Z" fill="${colors.glow}" stroke="${colors.accentDeep}" stroke-width="12"/>
        <path d="M504 476L586 392L672 476" fill="${colors.accent}" opacity="0.82"/>
        <ellipse cx="598" cy="678" rx="58" ry="40" fill="${colors.paper}"/>
      `;
    case "lion":
      return `
        <circle cx="600" cy="552" r="172" fill="${colors.glow}" stroke="${colors.accent}" stroke-width="14"/>
        <circle cx="600" cy="582" r="116" fill="${colors.paper}" stroke="${colors.accentDeep}" stroke-width="12"/>
        <circle cx="554" cy="560" r="12" fill="${colors.ink}"/>
        <circle cx="646" cy="560" r="12" fill="${colors.ink}"/>
        <path d="M580 620C590 632 610 632 620 620" stroke="${colors.ink}" stroke-width="10" stroke-linecap="round"/>
      `;
    case "hare":
      return `
        <path d="M530 470V250C530 204 552 176 586 176C618 176 640 204 640 250V470" fill="${colors.glow}" stroke="${colors.accentDeep}" stroke-width="12"/>
        <path d="M636 480V220C636 174 658 146 692 146C726 146 748 174 748 220V514" fill="${colors.accent}" opacity="0.82"/>
        <circle cx="596" cy="628" r="152" fill="${colors.paper}" stroke="${colors.accentDeep}" stroke-width="12"/>
      `;
    case "grapes":
      return `
        ${Array.from({ length: 11 }, (_, index) => {
          const x = 522 + (index % 3) * 64 + (index % 2 ? 18 : 0);
          const y = 448 + Math.floor(index / 3) * 64;
          const fill = index % 2 ? colors.accent : colors.accentDeep;
          return `<circle cx="${x}" cy="${y}" r="30" fill="${fill}" opacity="0.9"/>`;
        }).join("")}
        <path d="M598 396C612 344 654 298 720 276" stroke="${colors.ink}" stroke-width="12" stroke-linecap="round"/>
      `;
    case "ant":
      return `
        <path d="M432 700C478 658 528 638 582 638C650 638 716 664 786 722" stroke="${colors.accentDeep}" stroke-width="16" stroke-linecap="round"/>
        <circle cx="442" cy="704" r="22" fill="${colors.accentDeep}"/>
        <circle cx="498" cy="690" r="28" fill="${colors.accent}"/>
        <circle cx="564" cy="676" r="34" fill="${colors.accentDeep}"/>
      `;
    case "tortoise":
      return `
        <path d="M398 692C428 584 518 514 630 514C734 514 816 574 854 692" fill="${colors.glow}" stroke="${colors.accentDeep}" stroke-width="12"/>
        <path d="M480 692C512 620 566 582 632 582C698 582 752 620 784 692" stroke="${colors.accent}" stroke-width="10" stroke-linecap="round"/>
        <circle cx="872" cy="654" r="30" fill="${colors.paper}" stroke="${colors.accentDeep}" stroke-width="10"/>
      `;
    case "crow":
      return `
        <path d="M430 684C458 574 530 494 624 472C710 450 800 476 864 548C804 560 752 590 712 636C662 654 570 672 430 684Z" fill="${colors.accentDeep}" opacity="0.92"/>
        <path d="M696 582L814 608L706 644" fill="${colors.accent}" opacity="0.84"/>
      `;
    case "donkey":
      return `
        <path d="M474 706V394L526 298L566 390H692L740 306L782 394V706H474Z" fill="${colors.glow}" stroke="${colors.accentDeep}" stroke-width="12"/>
        <path d="M526 298L498 206M740 306L770 212" stroke="${colors.accentDeep}" stroke-width="12" stroke-linecap="round"/>
      `;
    case "fire":
      return `
        <path d="M612 264C668 348 710 408 710 492C710 604 640 692 598 750C548 692 484 604 484 500C484 430 514 372 576 304C584 370 604 408 632 450C642 398 638 338 612 264Z" fill="${colors.accent}" opacity="0.96"/>
        <path d="M594 410C630 454 648 498 648 556C648 616 620 662 596 694C566 662 538 616 538 558C538 512 556 474 594 410Z" fill="${colors.glow}"/>
      `;
    case "lightning":
      return `
        <circle cx="614" cy="500" r="176" fill="${colors.glow}" opacity="0.72"/>
        <path d="M662 264L538 506H642L562 758L770 474H656L662 264Z" fill="${colors.accent}" stroke="${colors.accentDeep}" stroke-width="12" stroke-linejoin="round"/>
      `;
    case "maze":
      return `
        <rect x="438" y="362" width="344" height="344" rx="34" fill="${colors.glow}" stroke="${colors.accentDeep}" stroke-width="12"/>
        <path d="M500 426H720V488H562V554H676V620H498V686H726" stroke="${colors.accentDeep}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="738" cy="686" r="16" fill="${colors.accent}"/>
      `;
    case "wings":
      return `
        <path d="M602 430C674 336 776 308 880 340C834 426 760 506 650 556" fill="${colors.glow}" stroke="${colors.accentDeep}" stroke-width="12"/>
        <path d="M590 446C520 352 418 324 314 356C360 442 434 522 544 572" fill="${colors.accent}" opacity="0.84" stroke="${colors.accentDeep}" stroke-width="12"/>
        <path d="M598 418V744" stroke="${colors.ink}" stroke-width="12" stroke-linecap="round"/>
      `;
    case "trident":
      return `
        <path d="M600 250V790" stroke="${colors.accentDeep}" stroke-width="14" stroke-linecap="round"/>
        <path d="M600 250C580 314 532 356 468 376V292C522 272 568 222 588 160" fill="${colors.accent}" opacity="0.84"/>
        <path d="M600 250C620 314 668 356 732 376V292C678 272 632 222 612 160" fill="${colors.accent}" opacity="0.84"/>
        <path d="M600 212C600 302 632 364 694 408V324C646 286 622 236 614 166" fill="${colors.glow}"/>
        <path d="M600 212C600 302 568 364 506 408V324C554 286 578 236 586 166" fill="${colors.glow}"/>
      `;
    case "owl":
      return `
        <path d="M442 536C442 394 522 316 608 316C692 316 772 394 772 536V640C772 720 710 782 636 782H580C504 782 442 720 442 640V536Z" fill="${colors.glow}" stroke="${colors.accentDeep}" stroke-width="12"/>
        <circle cx="550" cy="526" r="48" fill="${colors.paper}" stroke="${colors.accentDeep}" stroke-width="10"/>
        <circle cx="666" cy="526" r="48" fill="${colors.paper}" stroke="${colors.accentDeep}" stroke-width="10"/>
        <circle cx="550" cy="526" r="14" fill="${colors.ink}"/>
        <circle cx="666" cy="526" r="14" fill="${colors.ink}"/>
        <path d="M608 564L584 602H632L608 564Z" fill="${colors.accentDeep}"/>
      `;
    case "lyre":
      return `
        <path d="M506 284C498 396 482 494 462 584C452 638 456 692 490 730C524 770 576 782 624 770C672 782 724 770 758 730C792 692 796 638 786 584C766 494 750 396 742 284" fill="${colors.glow}" stroke="${colors.accentDeep}" stroke-width="12"/>
        <path d="M540 324H710" stroke="${colors.accent}" stroke-width="12" stroke-linecap="round"/>
        <path d="M544 364V700M586 364V718M628 364V724M670 364V718M712 364V700" stroke="${colors.accentDeep}" stroke-width="8" stroke-linecap="round"/>
      `;
    default:
      return "";
  }
}

function renderBookCoverSvg(book) {
  const colors = palette[book.category_key];
  const titleLines = splitTitle(book.title).map(escapeXml);
  const summaryLines = splitSummary(book.summary || book.original_synopsis || "").map(escapeXml);
  const motif = inferMotif(book);
  const seed = hashString(book.slug);
  const layout = seed % 3;
  const titleY = titleLines.length === 1 ? 1048 : titleLines.length === 2 ? 1018 : 994;

  return `
    <svg width="1200" height="1500" viewBox="0 0 1200 1500" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="coverBg" x1="80" y1="60" x2="1110" y2="1430" gradientUnits="userSpaceOnUse">
          <stop stop-color="${colors.backgroundA}"/>
          <stop offset="0.55" stop-color="${colors.backgroundB}"/>
          <stop offset="1" stop-color="${colors.backgroundC}"/>
        </linearGradient>
        <linearGradient id="pageBg" x1="190" y1="160" x2="1012" y2="1310" gradientUnits="userSpaceOnUse">
          <stop stop-color="${colors.paper}" stop-opacity="0.98"/>
          <stop offset="1" stop-color="#FFFDF8" stop-opacity="0.94"/>
        </linearGradient>
        <filter id="shadow" x="150" y="126" width="900" height="1230" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="20" stdDeviation="32" flood-color="#5F4531" flood-opacity="0.16"/>
        </filter>
      </defs>

      <rect x="24" y="24" width="1152" height="1452" rx="72" fill="url(#coverBg)"/>
      <rect x="44" y="44" width="1112" height="1412" rx="58" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.42)" stroke-width="4"/>
      <rect x="158" y="136" width="884" height="1218" rx="58" fill="url(#pageBg)" stroke="${colors.frame}" stroke-width="4" filter="url(#shadow)"/>

      ${renderDecorations(colors, seed)}

      <rect x="204" y="186" width="172" height="54" rx="27" fill="${colors.accent}" fill-opacity="0.18"/>
      <text x="290" y="221" text-anchor="middle" fill="${colors.accentDeep}" font-size="28" font-family="'PingFang SC','Noto Sans SC','Microsoft YaHei',sans-serif" font-weight="700" letter-spacing="2">${colors.label}</text>

      ${renderLayout(layout, colors)}
      ${renderMotif(motif, colors)}

      <path d="M224 896H976" stroke="${colors.frame}" stroke-opacity="0.58" stroke-width="4"/>

      ${titleLines
        .map(
          (line, index) => `
            <text
              x="600"
              y="${titleY + index * 84}"
              text-anchor="middle"
              fill="${colors.ink}"
              font-size="${titleLines.length === 3 ? 66 : 76}"
              font-family="'Songti SC','Noto Serif SC','STSong',serif"
              font-weight="800"
              letter-spacing="2"
            >${line}</text>
          `
        )
        .join("")}

      ${summaryLines
        .map(
          (line, index) => `
            <text
              x="600"
              y="${1220 + index * 44}"
              text-anchor="middle"
              fill="${colors.ink}"
              fill-opacity="0.74"
              font-size="28"
              font-family="'PingFang SC','Noto Sans SC','Microsoft YaHei',sans-serif"
              font-weight="500"
              letter-spacing="0.5"
            >${line}</text>
          `
        )
        .join("")}

      <rect x="446" y="1284" width="308" height="52" rx="26" fill="#FFFFFF" fill-opacity="0.68"/>
      <text x="600" y="1318" text-anchor="middle" fill="${colors.accentDeep}" font-size="26" font-family="'PingFang SC','Noto Sans SC','Microsoft YaHei',sans-serif" font-weight="700" letter-spacing="2">AgentStory</text>
    </svg>
  `.trim();
}

const BOOK_QUERY = `
  SELECT
    b.slug,
    b.title,
    b.summary,
    b.original_synopsis,
    b.key_scenes,
    c.key AS category_key,
    c.name AS category_name
  FROM story_books b
  JOIN story_categories c ON c.id = b.category_id
  WHERE b.is_active = TRUE
  ORDER BY c.sort_order ASC, b.title COLLATE "C" ASC
`;

async function loadBooksWithPg() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();

  try {
    const result = await client.query(BOOK_QUERY);
    return result.rows;
  } finally {
    await client.end();
  }
}

function loadBooksWithPsql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const databaseUrl = new URL(process.env.DATABASE_URL);
  const host = databaseUrl.hostname || "127.0.0.1";
  const port = databaseUrl.port || "5432";
  const user = decodeURIComponent(databaseUrl.username);
  const database = databaseUrl.pathname.replace(/^\//, "");
  const password = decodeURIComponent(databaseUrl.password || "");

  const jsonQuery = `
    SELECT COALESCE(json_agg(t), '[]'::json)::text
    FROM (
      ${BOOK_QUERY}
    ) AS t;
  `.trim();

  const stdout = execFileSync(
    "psql",
    ["-h", host, "-p", port, "-U", user, "-d", database, "-At", "-c", jsonQuery],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        PGPASSWORD: password
      }
    }
  );

  return JSON.parse(stdout.trim() || "[]");
}

async function loadBooks() {
  const inputFlagIndex = process.argv.indexOf("--input");

  if (inputFlagIndex !== -1) {
    const inputPath = process.argv[inputFlagIndex + 1];

    if (!inputPath) {
      throw new Error("--input requires a file path.");
    }

    const source = fs.readFileSync(path.resolve(inputPath), "utf8");
    return JSON.parse(source);
  }

  try {
    return await loadBooksWithPg();
  } catch (error) {
    console.warn("[cover] pg client failed, falling back to psql");
    console.warn(String(error));
    return loadBooksWithPsql();
  }
}

async function main() {
  const books = await loadBooks();
  const outputDir = path.join(process.cwd(), "images", "covers");
  fs.mkdirSync(outputDir, { recursive: true });

  let generated = 0;

  for (const row of books) {
    const svg = renderBookCoverSvg(row);
    const outputPath = path.join(outputDir, `${row.slug}.png`);

    if (fs.existsSync(outputPath)) {
      console.log(`[cover] skip ${row.slug}.png`);
      continue;
    }

    await sharp(Buffer.from(svg), { density: 160 })
      .png({
        compressionLevel: 7,
        adaptiveFiltering: true,
        effort: 4
      })
      .toFile(outputPath);

    generated += 1;
    console.log(`[cover] generated ${row.slug}.png`);
  }

  console.log(`[cover] done: ${generated} covers written to images/covers`);
}

main().catch((error) => {
  console.error("[cover] generation failed");
  console.error(error);
  process.exit(1);
});
