import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, '..', 'public');

async function renderSvgToPng(svgPath, pngPath, width, height) {
  const svg = await readFile(svgPath);
  const out = await sharp(svg, { density: 384 })
    .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(pngPath, out);
  console.log(
    `✓ ${pngPath.replace(publicDir + '/', '')} (${width}×${height}, ${out.length} bytes)`
  );
}

const ogSvg = resolve(publicDir, 'og.svg');
const iconSvg = resolve(publicDir, 'icon.svg');

await renderSvgToPng(ogSvg, resolve(publicDir, 'og-image.png'), 1200, 630);
await renderSvgToPng(iconSvg, resolve(publicDir, 'apple-touch-icon.png'), 180, 180);
await renderSvgToPng(iconSvg, resolve(publicDir, 'favicon-32.png'), 32, 32);
