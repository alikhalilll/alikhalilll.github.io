// Generate narration MP3s + per-block cue timings for every content/blog/*.md.
// Kokoro (ONNX) → Float32 PCM → lamejs MP3. Cues are block-indexed so the UI
// can highlight the matching rendered element while audio plays.
//
// Output per post:
//   public/audio/<slug>.mp3
//   public/audio/<slug>.cues.json  →  [{ index, startSec, endSec }]
//
// Index rules (must match the DOM-side traversal):
//   ✓ paragraph, heading, list, blockquote   → assigned an index, synthesized
//   ✗ fenced code, table, hr, image-only     → skipped entirely (no index)
//
// Run: pnpm audio

import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import lamejs from '@breezystack/lamejs';
import matter from 'gray-matter';
import { KokoroTTS } from 'kokoro-js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const blogDir = resolve(root, 'content/blog');
const audioDir = resolve(root, 'public/audio');
const manifestPath = resolve(audioDir, 'manifest.json');

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const VOICE = 'af_heart';
const DTYPE = 'q8';
const MP3_KBPS = 96;

// Markdown → ordered list of top-level blocks with type.
// Blocks whose type is in SKIP produce no audio and no index.
const SKIP = new Set(['code', 'table', 'hr', 'image']);

function splitBlocks(md) {
  const blocks = [];
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // fenced code
    const fence = line.match(/^(`{3,}|~{3,})/);
    if (fence) {
      const fenceMark = fence[1];
      const start = i;
      i++;
      while (i < lines.length && !lines[i].startsWith(fenceMark)) i++;
      if (i < lines.length) i++;
      blocks.push({ type: 'code', text: lines.slice(start, i).join('\n') });
      continue;
    }
    // horizontal rule
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      blocks.push({ type: 'hr', text: line });
      i++;
      continue;
    }
    // blank → skip
    if (!line.trim()) {
      i++;
      continue;
    }
    // collect until next blank line
    const start = i;
    while (i < lines.length && lines[i].trim() && !/^(`{3,}|~{3,})/.test(lines[i])) i++;
    const chunk = lines.slice(start, i).join('\n');
    const first = lines[start];
    let type = 'paragraph';
    if (/^#{1,6}\s/.test(first)) type = 'heading';
    else if (/^\s*[-*+]\s+/.test(first) || /^\s*\d+\.\s+/.test(first)) type = 'list';
    else if (/^\s{0,3}>\s?/.test(first)) type = 'blockquote';
    // table: every non-empty line contains a pipe, and one looks like |---|
    else if (chunk.split('\n').every((l) => l.includes('|')) && /\|\s*:?-+:?\s*\|/.test(chunk))
      type = 'table';
    // image-only paragraph
    else if (/^!\[[^\]]*\]\([^)]+\)\s*$/.test(first) && !lines[start + 1]?.trim()) type = 'image';
    blocks.push({ type, text: chunk });
  }
  return blocks;
}

// Strip inline markdown so Kokoro reads clean prose.
function stripInline(text) {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

// Keep a single TTS call under Kokoro's ~510-token window.
function subChunk(text, maxChars = 1500) {
  if (text.length <= maxChars) return [text];
  const sentences = text.split(/(?<=[.!?])\s+/);
  const out = [];
  let cur = '';
  for (const s of sentences) {
    if ((cur + ' ' + s).length > maxChars) {
      if (cur) out.push(cur);
      cur = s;
    } else {
      cur = cur ? cur + ' ' + s : s;
    }
  }
  if (cur) out.push(cur);
  return out;
}

function encodeMp3(float32, sampleRate) {
  const samples = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    samples[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const encoder = new lamejs.Mp3Encoder(1, sampleRate, MP3_KBPS);
  const blockSize = 1152;
  const out = [];
  for (let i = 0; i < samples.length; i += blockSize) {
    const block = samples.subarray(i, i + blockSize);
    const buf = encoder.encodeBuffer(block);
    if (buf.length) out.push(buf);
  }
  const tail = encoder.flush();
  if (tail.length) out.push(tail);
  let total = 0;
  for (const b of out) total += b.length;
  const merged = new Uint8Array(total);
  let off = 0;
  for (const b of out) {
    merged.set(b, off);
    off += b.length;
  }
  return merged;
}

function hashInput(blocks) {
  const payload = blocks.map((b) => `${b.type}::${b.text}`).join('\n||\n');
  return createHash('sha256')
    .update(`${MODEL_ID}|${VOICE}|${DTYPE}|${MP3_KBPS}|v2|${payload}`)
    .digest('hex')
    .slice(0, 16);
}

async function loadManifest() {
  if (!existsSync(manifestPath)) return {};
  try {
    return JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch {
    return {};
  }
}

async function main() {
  await mkdir(audioDir, { recursive: true });
  const manifest = await loadManifest();
  const files = (await readdir(blogDir)).filter((f) => f.endsWith('.md'));

  const plan = [];
  for (const file of files) {
    const slug = basename(file, extname(file));
    const raw = await readFile(resolve(blogDir, file), 'utf8');
    const { content, data } = matter(raw);
    if (data.draft) continue;
    const blocks = splitBlocks(content);
    if (!blocks.some((b) => !SKIP.has(b.type))) continue;
    const hash = hashInput(blocks);
    const mp3Path = resolve(audioDir, `${slug}.mp3`);
    const cuesPath = resolve(audioDir, `${slug}.cues.json`);
    if (manifest[slug]?.hash === hash && existsSync(mp3Path) && existsSync(cuesPath)) {
      console.log(`· ${slug} up-to-date`);
      continue;
    }
    const textWeight = blocks.reduce(
      (n, b) => (SKIP.has(b.type) ? n : n + stripInline(b.text).length),
      0
    );
    plan.push({ slug, blocks, hash, mp3Path, cuesPath, textWeight });
  }
  // Shortest first — user can validate end-to-end while longer posts finish.
  plan.sort((a, b) => a.textWeight - b.textWeight);

  if (plan.length === 0) {
    console.log('All audio up-to-date.');
    return;
  }

  console.log(`Loading Kokoro (${MODEL_ID}, dtype=${DTYPE})…`);
  const tts = await KokoroTTS.from_pretrained(MODEL_ID, { dtype: DTYPE });

  for (const item of plan) {
    console.log(`→ ${item.slug}: ${item.blocks.length} raw blocks`);
    const cues = [];
    const pcmParts = [];
    let totalSamples = 0;
    let sampleRate = 24000;
    let audioIndex = 0; // only increments for non-skipped blocks with real text

    for (const block of item.blocks) {
      if (SKIP.has(block.type)) continue;
      const prose = stripInline(block.text);
      if (!prose) continue;
      const startSamples = totalSamples;
      const subs = subChunk(prose);
      for (const sub of subs) {
        const audio = await tts.generate(sub, { voice: VOICE });
        sampleRate = audio.sampling_rate ?? sampleRate;
        pcmParts.push(audio.audio);
        totalSamples += audio.audio.length;
      }
      cues.push({
        index: audioIndex,
        startSec: +(startSamples / sampleRate).toFixed(3),
        endSec: +(totalSamples / sampleRate).toFixed(3),
      });
      audioIndex++;
      process.stdout.write(`  block ${audioIndex}/? (${cues[cues.length - 1].endSec}s)\r`);
    }

    const pcm = new Float32Array(totalSamples);
    let off = 0;
    for (const p of pcmParts) {
      pcm.set(p, off);
      off += p.length;
    }
    const mp3 = encodeMp3(pcm, sampleRate);
    await writeFile(item.mp3Path, mp3);
    await writeFile(item.cuesPath, JSON.stringify({ sampleRate, cues }, null, 2) + '\n');
    const durationSec = totalSamples / sampleRate;
    manifest[item.slug] = {
      hash: item.hash,
      bytes: mp3.length,
      blocks: cues.length,
      durationSec: Math.round(durationSec),
      generatedAt: new Date().toISOString(),
    };
    console.log(
      `  ✓ ${item.slug} — ${(mp3.length / 1024 / 1024).toFixed(2)} MB, ${Math.round(durationSec)}s, ${cues.length} cues`
    );
  }

  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\nWrote ${plan.length} file set(s) to ${audioDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
