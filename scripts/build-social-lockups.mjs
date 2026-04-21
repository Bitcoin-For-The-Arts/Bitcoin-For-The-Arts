// Generate social-media-ready square versions of every BFTA main lockup.
//
// Each source lockup is full-bleed (the type touches the edges of the
// canvas), which is correct for the website hero but cramped on social
// platforms — Instagram/X/LinkedIn crop the corners and the type bumps the
// safe area. This script puts the same artwork on a larger square canvas
// with breathing room around the type.
//
// Output:
//   public/social/<name>-2160.png   2160x2160 — high-res, works everywhere
//   public/social/<name>-1080.png   1080x1080 — IG profile/post native
//
// Each output's padding fills with the source's own background color so
// the result looks like a single piece of artwork (not a logo dropped on
// a different background).
//
// Run:
//   node scripts/build-social-lockups.mjs

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const outDir = path.join(publicDir, 'social');

// Brand palette
const CREAM = { r: 255, g: 250, b: 240 }; // #FFFAF0
const BLACK = { r: 0, g: 0, b: 0 };       // #000000
const ORANGE = { r: 255, g: 79, b: 20 };  // #FF4F14
const LIME = { r: 179, g: 255, b: 72 };   // #B3FF48

// Each entry pairs a source lockup with the background color the social
// canvas should fill with around it.
const variants = [
  {
    label: 'cream-orange',
    input: 'BFTA-main-lockup-cream-orange-2.png',
    background: CREAM,
  },
  {
    label: 'cream-black',
    input: 'BFTA-main-lockup-cream-black.png',
    background: CREAM,
  },
  {
    label: 'black-cream',
    input: 'BFTA-main-lockup-black-cream.png',
    background: BLACK,
  },
  {
    label: 'black-orange',
    input: 'BFTA-main-lockup-black-orange.png',
    background: BLACK,
  },
  {
    label: 'orange',
    input: 'BFTA-main-lockup-orange.png',
    background: ORANGE,
  },
  {
    label: 'green',
    input: 'BFTA-main-lockup-green.png',
    background: LIME,
  },
];

// How wide the lockup should be inside the square canvas, as a fraction of
// the canvas width. 0.70 leaves a clean ~15% margin on each side, which
// reads well as both an avatar (circle crops won't clip type) and as a
// 1:1 feed post (safe inside platform caption gradients).
const LOCKUP_FRACTION = 0.7;

const SIZES = [2160, 1080];

async function buildOne({ input, label, background }, size) {
  const inputPath = path.join(publicDir, input);
  const outputPath = path.join(outDir, `BFTA-social-${label}-${size}.png`);

  const targetLockupSize = Math.round(size * LOCKUP_FRACTION);

  // Resize the source lockup so its longer edge equals targetLockupSize.
  const resized = await sharp(inputPath)
    .resize({
      width: targetLockupSize,
      height: targetLockupSize,
      fit: 'inside',
      kernel: 'lanczos3',
    })
    .png()
    .toBuffer();

  // Composite onto a solid square canvas of the brand color.
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: background.r, g: background.g, b: background.b, alpha: 1 },
    },
  })
    .composite([{ input: resized, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(
    `[social] wrote ${path.relative(projectRoot, outputPath)} (${size}x${size})`,
  );
}

async function main() {
  await mkdir(outDir, { recursive: true });
  for (const variant of variants) {
    for (const size of SIZES) {
      await buildOne(variant, size);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
