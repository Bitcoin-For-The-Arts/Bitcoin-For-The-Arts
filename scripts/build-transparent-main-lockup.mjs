// One-shot helper: produce two transparent-background variants of the BFTA
// main lockup so the lockup can sit directly on either the cream light-mode
// background or the ember dark-mode background with no visible card edge
// in either mode.
//
//   Source                                              -> Output                                          Use
//   brand-kit/main-lockups/main-cream-orange.png        -> brand-kit/derived/main-transparent-light.png   light mode
//   brand-kit/main-lockups/main-black-cream.png         -> brand-kit/derived/main-transparent-dark.png    dark mode
//
// The "light" output keeps the original black wordmark + orange "Arts"
// script; the cream rectangle is knocked out.
// The "dark" output keeps the cream wordmark + cream "Arts" script (the
// version designed to sit on black); the black rectangle is knocked out.
//
// Run: `node scripts/build-transparent-main-lockup.mjs`

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

// Each job knocks pixels close to `bgColor` out to fully transparent and
// fades antialiased edges back to opaque between MIN_DIST and MAX_DIST
// (Euclidean RGB distance).
const jobs = [
  {
    label: 'light',
    input: path.join('brand-kit', 'main-lockups', 'main-cream-orange.png'),
    output: path.join('brand-kit', 'derived', 'main-transparent-light.png'),
    bgColor: { r: 255, g: 250, b: 240 }, // brand cream #FFFAF0
    minDist: 24,
    maxDist: 80,
  },
  {
    label: 'dark',
    input: path.join('brand-kit', 'main-lockups', 'main-black-cream.png'),
    output: path.join('brand-kit', 'derived', 'main-transparent-dark.png'),
    bgColor: { r: 0, g: 0, b: 0 }, // brand black #000000
    minDist: 28,
    maxDist: 90,
  },
];

async function makeTransparent({ input, output, bgColor, minDist, maxDist, label }) {
  const inPath = path.join(publicDir, input);
  const outPath = path.join(publicDir, output);

  const img = sharp(inPath).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  if (channels !== 4) {
    throw new Error(`expected RGBA, got ${channels} channels for ${input}`);
  }

  const minSq = minDist * minDist;
  const maxSq = maxDist * maxDist;
  const range = maxSq - minSq;

  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - bgColor.r;
    const dg = data[i + 1] - bgColor.g;
    const db = data[i + 2] - bgColor.b;
    const distSq = dr * dr + dg * dg + db * db;

    let alpha;
    if (distSq <= minSq) {
      alpha = 0;
    } else if (distSq >= maxSq) {
      alpha = 255;
    } else {
      alpha = Math.round(((distSq - minSq) / range) * 255);
    }
    data[i + 3] = alpha;
  }

  await sharp(data, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log(
    `[lockup:${label}] wrote ${path.relative(projectRoot, outPath)} (${width}x${height})`,
  );
}

async function main() {
  for (const job of jobs) {
    await makeTransparent(job);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
