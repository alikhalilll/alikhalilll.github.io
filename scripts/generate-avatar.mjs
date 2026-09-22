import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, '..', 'public');
const srcPath = resolve(publicDir, 'myImage.jpg');
const outPath = resolve(publicDir, 'avatar.jpg');

const src = await readFile(srcPath);
const meta = await sharp(src).metadata();
console.log(`source: ${meta.width}×${meta.height}`);

// Portrait is a full/half body shot 1062×2301. The face sits in the upper-
// middle third — the shoulders start ~ y=1400. Take a square around the face:
// centered horizontally, with the top of the square just above the hairline.
const size = Math.min(meta.width, Math.round(meta.width * 1.15));
const left = Math.max(0, Math.round((meta.width - size) / 2));
const top = Math.max(0, Math.round(meta.height * 0.18));
const crop = { left, top, width: size, height: size };
console.log(`crop: ${JSON.stringify(crop)}`);

// Crop → resize to a generous retina-friendly 640² → mild sharpen + modest
// saturation bump for a portrait feel → JPEG mozjpeg quality 90.
const buf = await sharp(src)
  .extract(crop)
  .resize(640, 640, { fit: 'cover' })
  .modulate({ saturation: 1.08 })
  .sharpen({ sigma: 0.6 })
  .jpeg({ quality: 90, mozjpeg: true })
  .toBuffer();

await writeFile(outPath, buf);
console.log(`✓ avatar.jpg (${buf.length} bytes, 640×640)`);
