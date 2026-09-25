/**
 * Generates ORIGINAL illustrated sample images for demo listings (no third-party or
 * competitor imagery). Each image carries a visible "Sample image" label.
 * Output: public/demo/<scene>-<n>.webp
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import path from "node:path";

const W = 1200;
const H = 900;
const OUT = path.join(process.cwd(), "public", "demo");

type Pal = { sky1: string; sky2: string; wall: string; wall2: string; accent: string; trim: string; ground: string; tree: string };
const PALETTES: Pal[] = [
  { sky1: "#cfe3f5", sky2: "#f5efe6", wall: "#f3ede3", wall2: "#d9cbb5", accent: "#b8481f", trim: "#2b2b2b", ground: "#8fb07a", tree: "#4f7d4a" },
  { sky1: "#f7d9c4", sky2: "#fdf3ea", wall: "#ffffff", wall2: "#c9c3bb", accent: "#213859", trim: "#3a3a3a", ground: "#9dbb86", tree: "#3f6e45" },
  { sky1: "#d7e6ee", sky2: "#eef4f7", wall: "#e8e2da", wall2: "#a77b5a", accent: "#7c2e12", trim: "#222", ground: "#86a877", tree: "#56804e" },
  { sky1: "#e4dcf2", sky2: "#f8f5fb", wall: "#f6f3ee", wall2: "#5a6b7d", accent: "#d0592a", trim: "#1d2733", ground: "#94b384", tree: "#4a7a55" },
  { sky1: "#fde7c8", sky2: "#fff8ee", wall: "#efe6d8", wall2: "#8c6f53", accent: "#30496d", trim: "#2e2a26", ground: "#a4bf8c", tree: "#5b8a4f" },
  { sky1: "#cde8e2", sky2: "#f1f8f6", wall: "#fbfaf7", wall2: "#9aa5ad", accent: "#9a3a17", trim: "#27313a", ground: "#8cb383", tree: "#437253" },
];

const label = `<g><rect x="${W - 238}" y="${H - 58}" width="218" height="38" rx="19" fill="rgba(15,29,49,.72)"/><text x="${W - 129}" y="${H - 33}" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#fff" text-anchor="middle">Sample image</text></g>`;

function sky(p: Pal) {
  return `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky1}"/><stop offset="1" stop-color="${p.sky2}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#s)"/>`;
}
function tree(x: number, y: number, s: number, p: Pal) {
  return `<rect x="${x - 6 * s}" y="${y}" width="${12 * s}" height="${70 * s}" fill="#6b4f3a"/><circle cx="${x}" cy="${y - 10 * s}" r="${48 * s}" fill="${p.tree}"/><circle cx="${x - 30 * s}" cy="${y + 12 * s}" r="${32 * s}" fill="${p.tree}" opacity=".9"/><circle cx="${x + 32 * s}" cy="${y + 8 * s}" r="${34 * s}" fill="${p.tree}" opacity=".85"/>`;
}
function windows(x: number, y: number, cols: number, rows: number, w: number, h: number, gx: number, gy: number, fill: string, frame: string) {
  let s = "";
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      s += `<rect x="${x + c * (w + gx)}" y="${y + r * (h + gy)}" width="${w}" height="${h}" fill="${fill}" stroke="${frame}" stroke-width="4"/>`;
  return s;
}

const scenes: Record<string, (p: Pal, v: number) => string> = {
  house: (p, v) => `${sky(p)}
    <rect y="700" width="${W}" height="200" fill="${p.ground}"/>
    <rect y="690" width="${W}" height="18" fill="#cfc6b8"/>
    ${tree(130, 520, 1.3, p)}${tree(1080, 540, 1.1, p)}
    <rect x="260" y="330" width="${380 + v * 20}" height="370" fill="${p.wall}"/>
    <rect x="${640 + v * 20}" y="${250 - v * 10}" width="300" height="${450 + v * 10}" fill="${p.wall2}"/>
    <rect x="240" y="310" width="${420 + v * 20}" height="26" fill="${p.trim}"/>
    <rect x="${622 + v * 20}" y="${232 - v * 10}" width="336" height="24" fill="${p.trim}"/>
    ${windows(300, 380, 3, 1, 90, 110, 26, 0, "#bcd6e8", p.trim)}
    ${windows(300, 540, 2, 1, 90, 110, 26, 0, "#bcd6e8", p.trim)}
    <rect x="${690 + v * 20}" y="${310 - v * 10}" width="200" height="150" fill="#9fc3dc" stroke="${p.trim}" stroke-width="6"/>
    <rect x="${705 + v * 20}" y="540" width="80" height="160" fill="${p.accent}"/>
    <circle cx="${770 + v * 20}" cy="625" r="5" fill="#f2d18b"/>
    <rect x="${800 + v * 20}" y="560" width="120" height="140" fill="#6e7780" opacity=".85"/>
    ${label}`,
  apartment: (p, v) => `${sky(p)}
    <rect y="760" width="${W}" height="140" fill="${p.ground}"/>
    <rect x="${160 + v * 10}" y="300" width="260" height="470" fill="${p.wall2}" opacity=".6"/>
    <rect x="420" y="120" width="360" height="650" fill="${p.wall}" stroke="${p.trim}" stroke-width="4"/>
    ${windows(450, 160, 4, 8, 56, 50, 22, 24, "#a9cbe3", p.trim)}
    <rect x="560" y="690" width="80" height="80" fill="${p.accent}"/>
    <rect x="${800 - v * 5}" y="260" width="240" height="510" fill="${p.wall2}"/>
    ${windows(830 - v * 5, 290, 3, 7, 46, 44, 24, 22, "#c3dbeb", p.trim)}
    ${tree(120, 640, 1, p)}${tree(1110, 650, 0.9, p)}
    ${label}`,
  living: (p, v) => `
    <rect width="${W}" height="${H}" fill="${p.wall}"/>
    <rect y="640" width="${W}" height="260" fill="${p.wall2}"/>
    <rect x="${120 + v * 20}" y="140" width="360" height="330" fill="${p.sky1}" stroke="${p.trim}" stroke-width="10"/>
    <line x1="${300 + v * 20}" y1="140" x2="${300 + v * 20}" y2="470" stroke="${p.trim}" stroke-width="8"/>
    <rect x="620" y="200" width="200" height="140" fill="${p.accent}" opacity=".85"/>
    <rect x="860" y="230" width="120" height="110" fill="${p.tree}" opacity=".7"/>
    <ellipse cx="640" cy="780" rx="420" ry="70" fill="${p.sky2}" opacity=".85"/>
    <rect x="420" y="480" width="520" height="140" rx="30" fill="${p.accent}"/>
    <rect x="400" y="560" width="560" height="110" rx="28" fill="${p.accent}" opacity=".85"/>
    <rect x="430" y="668" width="20" height="40" fill="${p.trim}"/><rect x="910" y="668" width="20" height="40" fill="${p.trim}"/>
    <rect x="520" y="720" width="240" height="24" rx="8" fill="${p.trim}"/>
    <rect x="1030" y="360" width="10" height="300" fill="${p.trim}"/><path d="M985 360h100l-30-80h-40z" fill="#f2d18b"/>
    ${label}`,
  bedroom: (p, v) => `
    <rect width="${W}" height="${H}" fill="${p.sky2}"/>
    <rect y="660" width="${W}" height="240" fill="${p.wall2}" opacity=".8"/>
    <rect x="${780 - v * 20}" y="150" width="280" height="300" fill="${p.sky1}" stroke="${p.trim}" stroke-width="10"/>
    <rect x="260" y="360" width="440" height="140" rx="16" fill="${p.trim}" opacity=".85"/>
    <rect x="240" y="480" width="480" height="200" rx="18" fill="#ffffff"/>
    <rect x="240" y="560" width="480" height="120" rx="18" fill="${p.accent}" opacity=".9"/>
    <rect x="290" y="440" width="150" height="70" rx="20" fill="${p.wall}"/><rect x="520" y="440" width="150" height="70" rx="20" fill="${p.wall}"/>
    <rect x="110" y="560" width="110" height="120" fill="${p.wall2}"/><rect x="740" y="560" width="110" height="120" fill="${p.wall2}"/>
    <path d="M140 560h50l-10-50h-30z" fill="#f2d18b"/>
    ${label}`,
  kitchen: (p, v) => `
    <rect width="${W}" height="${H}" fill="${p.wall}"/>
    <rect y="700" width="${W}" height="200" fill="${p.wall2}" opacity=".7"/>
    ${windows(100, 110, 5, 1, 170, 190, 30, 0, p.accent, p.trim)}
    <rect x="80" y="420" width="${1040 - v * 10}" height="40" fill="${p.trim}"/>
    ${windows(100, 470, 5, 1, 170, 230, 30, 0, "#ffffff", p.trim)}
    <rect x="${500 + v * 10}" y="330" width="200" height="90" fill="${p.sky1}" stroke="${p.trim}" stroke-width="6"/>
    <circle cx="340" cy="400" r="14" fill="${p.tree}"/><rect x="330" y="400" width="20" height="20" fill="${p.accent}"/>
    ${label}`,
  office: (p, v) => `
    <rect width="${W}" height="${H}" fill="${p.sky2}"/>
    <rect y="620" width="${W}" height="280" fill="${p.wall2}" opacity=".55"/>
    ${windows(60, 80, 5, 1, 200, 360, 20, 0, p.sky1, p.trim)}
    <rect x="140" y="560" width="400" height="24" fill="${p.trim}"/><rect x="660" y="560" width="400" height="24" fill="${p.trim}"/>
    <rect x="160" y="584" width="14" height="140" fill="${p.trim}"/><rect x="506" y="584" width="14" height="140" fill="${p.trim}"/>
    <rect x="680" y="584" width="14" height="140" fill="${p.trim}"/><rect x="1026" y="584" width="14" height="140" fill="${p.trim}"/>
    <rect x="230" y="470" width="130" height="86" fill="#24313f"/><rect x="${760 + v * 10}" y="470" width="130" height="86" fill="#24313f"/>
    <rect x="280" y="556" width="30" height="8" fill="#24313f"/><rect x="${810 + v * 10}" y="556" width="30" height="8" fill="#24313f"/>
    <rect x="300" y="640" width="90" height="120" rx="18" fill="${p.accent}"/><rect x="820" y="640" width="90" height="120" rx="18" fill="${p.accent}"/>
    ${tree(1120, 560, 0.6, p)}
    ${label}`,
  shop: (p, v) => `${sky(p)}
    <rect y="760" width="${W}" height="140" fill="#b9b3aa"/>
    <rect x="120" y="180" width="960" height="580" fill="${p.wall}"/>
    <rect x="120" y="160" width="960" height="40" fill="${p.trim}"/>
    <rect x="200" y="230" width="800" height="80" fill="${p.accent}"/>
    <text x="600" y="285" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="#fff" text-anchor="middle">SHOP ${v + 1}</text>
    <path d="M160 330h880l-40 70H200z" fill="${p.accent}" opacity=".85"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${200 + i * 110}" y="330" width="55" height="70" fill="#fff" opacity=".35"/>`).join("")}
    <rect x="200" y="420" width="360" height="330" fill="#a9cbe3" stroke="${p.trim}" stroke-width="8"/>
    <rect x="640" y="420" width="360" height="330" fill="#8d959c"/>
    ${Array.from({ length: 16 }, (_, i) => `<line x1="640" y1="${430 + i * 20}" x2="1000" y2="${430 + i * 20}" stroke="#6d757c" stroke-width="4"/>`).join("")}
    ${label}`,
  warehouse: (p, v) => `${sky(p)}
    <rect y="700" width="${W}" height="200" fill="#bdb6aa"/>
    <path d="M100 360 600 200l500 160v340H100z" fill="${p.wall2}"/>
    <path d="M100 360 600 200l500 160" fill="none" stroke="${p.trim}" stroke-width="12"/>
    ${[0, 1, 2].map((i) => `<rect x="${190 + i * 300}" y="440" width="220" height="260" fill="#8a9299"/>${Array.from({ length: 12 }, (_, j) => `<line x1="${190 + i * 300}" y1="${450 + j * 21}" x2="${410 + i * 300}" y2="${450 + j * 21}" stroke="#6f777e" stroke-width="4"/>`).join("")}`).join("")}
    <rect x="${820 - v * 30}" y="600" width="230" height="110" rx="10" fill="${p.accent}"/><rect x="${1050 - v * 30}" y="630" width="80" height="80" rx="8" fill="${p.trim}"/>
    <circle cx="${880 - v * 30}" cy="715" r="24" fill="#222"/><circle cx="${1080 - v * 30}" cy="715" r="24" fill="#222"/>
    ${label}`,
  farmhouse: (p, v) => `${sky(p)}
    <rect y="620" width="${W}" height="280" fill="${p.ground}"/>
    ${tree(120, 480, 1.4, p)}${tree(300, 500, 1.1, p)}${tree(1060, 470, 1.5, p)}
    <rect x="360" y="420" width="560" height="220" fill="${p.wall}"/>
    <path d="M330 430 640 300l310 130z" fill="${p.accent}"/>
    ${windows(400, 480, 4, 1, 80, 90, 44, 0, "#bcd6e8", p.trim)}
    <rect x="${600 + v * 5}" y="540" width="80" height="100" fill="${p.trim}"/>
    <ellipse cx="640" cy="760" rx="300" ry="40" fill="#7fb2d6" opacity=".8"/>
    ${label}`,
};

async function main() {
  mkdirSync(OUT, { recursive: true });
  let n = 0;
  for (const [scene, fn] of Object.entries(scenes)) {
    for (let i = 0; i < PALETTES.length; i++) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${fn(PALETTES[i], i % 3)}</svg>`;
      await sharp(Buffer.from(svg)).webp({ quality: 78 }).toFile(path.join(OUT, `${scene}-${i + 1}.webp`));
      n++;
    }
  }
  console.log(`Generated ${n} sample images in public/demo`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
