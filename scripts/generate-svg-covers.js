const fs = require('fs');
const path = require('path');

const books = [
    {
        title: '小红帽',
        slug: 'fairy-little-red-riding-hood',
        color: '#4a0404', // Deep Red
        icon: '🌲' // Simple text icon or path
    },
    {
        title: '白雪公主',
        slug: 'fairy-snow-white',
        color: '#1a237e', // Deep Blue
        icon: '🍎'
    },
    {
        title: '灰姑娘',
        slug: 'fairy-cinderella',
        color: '#006064', // Deep Cyan/Teal
        icon: '👠'
    }
];

const template = (title, color, icon) => `
<svg width="800" height="1200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="paper" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise"/>
      <feDiffuseLighting in="noise" lighting-color="#fdfbf7" surfaceScale="2">
        <feDistantLight azimuth="45" elevation="60"/>
      </feDiffuseLighting>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="${color}" />
  <rect width="100%" height="100%" fill="#000" opacity="0.3" />
  
  <!-- Texture Overlay -->
  <rect width="100%" height="100%" filter="url(#paper)" opacity="0.2" style="mix-blend-mode: overlay"/>
  
  <!-- Gold Border -->
  <rect x="40" y="40" width="720" height="1120" fill="none" stroke="#d4af37" stroke-width="4" />
  <rect x="60" y="60" width="680" height="1080" fill="none" stroke="#d4af37" stroke-width="1" />
  
  <!-- Ornate Corners (Simplified Circles) -->
  <circle cx="40" cy="40" r="8" fill="#d4af37" />
  <circle cx="760" cy="40" r="8" fill="#d4af37" />
  <circle cx="40" cy="1160" r="8" fill="#d4af37" />
  <circle cx="760" cy="1160" r="8" fill="#d4af37" />
  
  <!-- Central Circle Frame -->
  <circle cx="400" cy="450" r="180" fill="none" stroke="#d4af37" stroke-width="2" opacity="0.6"/>
  <circle cx="400" cy="450" r="160" fill="none" stroke="#d4af37" stroke-width="1" opacity="0.4"/>
  
  <!-- Icon/Emoji -->
  <text x="400" y="490" font-family="serif" font-size="100" text-anchor="middle" fill="#d4af37" opacity="0.9">${icon}</text>
  
  <!-- Title -->
  <text x="400" y="750" font-family="'Times New Roman', serif" font-weight="bold" font-size="72" text-anchor="middle" fill="#f5e6d3" letter-spacing="4">
    ${title}
  </text>
  
  <!-- Subtitle/Author -->
  <text x="400" y="820" font-family="'Times New Roman', serif" font-size="24" text-anchor="middle" fill="#d4af37" letter-spacing="4" opacity="0.8">
    FAIRY TALE COLLECTION
  </text>
  
  <!-- Bottom Decoration -->
  <text x="400" y="1050" font-family="serif" font-size="40" text-anchor="middle" fill="#d4af37" opacity="0.6">❦</text>
  
</svg>
`;

async function main() {
    const dir = path.resolve(__dirname, '../public/covers');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    for (const book of books) {
        const svgContent = template(book.title, book.color, book.icon);
        const outputPath = path.join(dir, `${book.slug}.svg`); // Save as SVG
        fs.writeFileSync(outputPath, svgContent);
        console.log(`Generated cover for ${book.title}: ${outputPath}`);
    }
}

main();
