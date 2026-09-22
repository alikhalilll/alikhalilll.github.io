import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import matter from 'gray-matter';

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = resolve(here, '..', 'content', 'blog');
const outDir = resolve(here, '..', 'public', 'blog-covers');

const W = 720;
const H = 960;

// Palettes aligned to the site's brand tokens (blue → cyan → violet) plus
// two neutral "editorial" variants. Deep, muted, restrained — the card
// title overlay stays readable against every option.
const palettes = [
  ['#0b1220', '#1e3a8a', '#38bdf8'], // ink → navy → sky (primary brand)
  ['#0f172a', '#164e63', '#22d3ee'], // slate → teal → cyan
  ['#1e1b4b', '#4338ca', '#a78bfa'], // indigo → violet (accent)
  ['#0c0a09', '#312e81', '#818cf8'], // charcoal → indigo → lavender
  ['#0a0e1a', '#1e40af', '#67e8f9'], // midnight → royal → aqua
  ['#111827', '#334155', '#94a3b8'], // graphite (neutral)
];

const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const rng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), 2246822507);
    s = Math.imul(s ^ (s >>> 13), 3266489909);
    s ^= s >>> 16;
    return (s >>> 0) / 4294967295;
  };
};

// --- Motifs. Every motif is composed so its focal weight sits in the top
// 55% of the canvas; the bottom 45% is left calm for the card title. ---

const motifWaves = (r) => {
  const layers = [];
  for (let i = 0; i < 4; i++) {
    const y = 140 + i * 90;
    const amp = 30 + r() * 50;
    const op = 0.09 + r() * 0.09;
    const cx1 = W * 0.28 + r() * 40;
    const cx2 = W * 0.72 + r() * 40;
    layers.push(
      `<path d="M -80 ${y} C ${cx1} ${y - amp}, ${cx2} ${y + amp}, ${W + 80} ${y}" stroke="#fff" stroke-opacity="${op}" stroke-width="1.5" fill="none" />`
    );
  }
  return layers.join('');
};

const motifSoftOrbs = (r) => {
  const bands = [];
  for (let i = 0; i < 3; i++) {
    const cx = W * (0.25 + r() * 0.5);
    const cy = 100 + r() * 260;
    const rad = 140 + r() * 100;
    const op = 0.09 + r() * 0.06;
    bands.push(
      `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="#fff" fill-opacity="${op}" filter="url(#blur)" />`
    );
  }
  return bands.join('');
};

const motifConstellation = (r) => {
  const nodes = [];
  const stars = [];
  const count = 14;
  for (let i = 0; i < count; i++) {
    const x = 60 + r() * (W - 120);
    const y = 60 + r() * 480;
    nodes.push([x, y]);
    const rad = 1 + r() * 3;
    stars.push(
      `<circle cx="${x}" cy="${y}" r="${rad}" fill="#fff" fill-opacity="${0.6 + r() * 0.4}" />`
    );
  }
  const lines = [];
  // Connect each node to its nearest neighbor for a graph-like feel.
  for (let i = 0; i < nodes.length; i++) {
    let bestJ = -1;
    let bestD = Infinity;
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const d = Math.hypot(nodes[i][0] - nodes[j][0], nodes[i][1] - nodes[j][1]);
      if (d < bestD) {
        bestD = d;
        bestJ = j;
      }
    }
    if (bestJ >= 0 && bestD < 220) {
      lines.push(
        `<line x1="${nodes[i][0]}" y1="${nodes[i][1]}" x2="${nodes[bestJ][0]}" y2="${nodes[bestJ][1]}" stroke="#fff" stroke-opacity="0.16" stroke-width="1" />`
      );
    }
  }
  return lines.join('') + stars.join('');
};

const motifDotGrid = () => {
  const dots = [];
  const cols = 14;
  const rows = 10;
  const gapX = W / cols;
  const gapY = H / rows / 1.4;
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const cx = gapX * x + gapX / 2;
      const cy = gapY * y + gapY / 2;
      const dist = Math.hypot(cx - W * 0.7, cy - H * 0.25);
      const t = Math.min(1, dist / 480);
      const rad = (1 - t) * 5 + 0.8;
      const op = 0.4 * (1 - t) + 0.05;
      dots.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="#fff" fill-opacity="${op}" />`);
    }
  }
  return dots.join('');
};

const motifTerminalGrid = (r) => {
  const cell = 48;
  const lines = [];
  for (let x = cell; x < W; x += cell) {
    lines.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${H * 0.7}" stroke="#fff" stroke-opacity="0.05" stroke-width="1" />`
    );
  }
  for (let y = cell; y < H * 0.7; y += cell) {
    lines.push(
      `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#fff" stroke-opacity="0.05" stroke-width="1" />`
    );
  }
  // A few highlighted rectangles suggesting active cells / cursor blocks.
  for (let i = 0; i < 5; i++) {
    const gx = Math.floor(r() * (W / cell));
    const gy = Math.floor(r() * ((H * 0.55) / cell));
    const w = 1 + Math.floor(r() * 3);
    const h = 1;
    lines.push(
      `<rect x="${gx * cell + 2}" y="${gy * cell + 2}" width="${w * cell - 4}" height="${h * cell - 4}" rx="4" fill="#fff" fill-opacity="${0.08 + r() * 0.08}" />`
    );
  }
  return lines.join('');
};

const motifRibbon = (r) => {
  const paths = [];
  for (let i = 0; i < 3; i++) {
    const y = 200 + i * 80;
    const c1x = 100 + r() * 200;
    const c2x = W - 100 - r() * 200;
    const c1y = y + (r() - 0.5) * 200;
    const c2y = y + (r() - 0.5) * 200;
    const op = 0.14 + r() * 0.1;
    paths.push(
      `<path d="M -40 ${y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${W + 40} ${y - 60}" stroke="#fff" stroke-opacity="${op}" stroke-width="${28 + r() * 20}" stroke-linecap="round" fill="none" />`
    );
  }
  return paths.join('');
};

const motifArcs = (r) => {
  const arcs = [];
  const originX = r() > 0.5 ? W + 60 : -60;
  const originY = 60;
  for (let i = 0; i < 7; i++) {
    const rad = 120 + i * 80;
    const op = 0.06 + r() * 0.05;
    arcs.push(
      `<circle cx="${originX}" cy="${originY}" r="${rad}" fill="none" stroke="#fff" stroke-opacity="${op}" stroke-width="1.5" />`
    );
  }
  return arcs.join('');
};

const motifs = [
  motifWaves,
  motifSoftOrbs,
  motifConstellation,
  motifDotGrid,
  motifTerminalGrid,
  motifRibbon,
  motifArcs,
];

const svgFor = (slug) => {
  const seed = hash(slug);
  const paletteIndex = seed % palettes.length;
  const motifIndex = (seed >>> 3) % motifs.length;
  const [c1, c2, c3] = palettes[paletteIndex];
  const motif = motifs[motifIndex](rng(seed));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0.7" y2="1">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="55%" stop-color="${c2}" />
        <stop offset="100%" stop-color="${c3}" />
      </linearGradient>
      <radialGradient id="topGlow" cx="0.75" cy="0.15" r="0.7">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="bottomCalm" cx="0.5" cy="0.95" r="0.75">
        <stop offset="0%" stop-color="${c1}" stop-opacity="0.55" />
        <stop offset="100%" stop-color="${c1}" stop-opacity="0" />
      </radialGradient>
      <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="18" />
      </filter>
      <linearGradient id="grain" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000" stop-opacity="0" />
        <stop offset="100%" stop-color="#000" stop-opacity="0.15" />
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)" />
    <g>${motif}</g>
    <rect width="${W}" height="${H}" fill="url(#topGlow)" />
    <rect width="${W}" height="${H}" fill="url(#bottomCalm)" />
    <rect width="${W}" height="${H}" fill="url(#grain)" />
  </svg>`;
};

await mkdir(outDir, { recursive: true });

const files = (await readdir(contentDir)).filter((f) => f.endsWith('.md'));

for (const file of files) {
  const slug = basename(file, '.md');
  const raw = await readFile(resolve(contentDir, file), 'utf8');
  matter(raw); // still validate frontmatter parses cleanly
  const svg = svgFor(slug);
  const png = await sharp(Buffer.from(svg)).resize(W, H).png({ compressionLevel: 9 }).toBuffer();

  const outPath = resolve(outDir, `${slug}.png`);
  await writeFile(outPath, png);
  console.log(`✓ blog-covers/${slug}.png (${png.length} bytes)`);
}
