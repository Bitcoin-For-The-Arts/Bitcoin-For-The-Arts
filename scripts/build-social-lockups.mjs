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

// "post" lockups fill ~70% of the canvas — strong presence as a 1:1 feed
// post, still safe inside platform caption-gradient overlays.
//
// "profile" lockups fill ~55% of the canvas — small enough that the type
// stays comfortably inside the *circular* crop every platform applies to
// profile avatars (IG, X, FB, LinkedIn).
const FRACTIONS = {
  post: 0.7,
  profile: 0.55,
};

const SIZES = [2160, 1080];

// Profile variants: a curated subset for avatar use. Generates both the
// main lockup AND the inline (wide) lockup on the same square canvas so
// you can A/B which reads better as your green profile picture.
const profileVariants = [
  {
    label: 'green-main',
    input: 'BFTA-main-lockup-green.png',
    background: LIME,
  },
  {
    label: 'green-inline',
    input: 'BFTA-bug-inline-green-1.png',
    background: LIME,
  },
];

async function buildOne({ input, label, background, mode }, size) {
  const inputPath = path.join(publicDir, input);
  const fraction = FRACTIONS[mode];
  const filename = `BFTA-social-${mode}-${label}-${size}.png`;
  const outputPath = path.join(outDir, filename);

  const targetLockupSize = Math.round(size * fraction);

  // Resize the source lockup so its longer edge equals targetLockupSize.
  // For wide ("inline") lockups this naturally produces a much shorter
  // height, which is the desired effect — extra vertical breathing room
  // around the type.
  const resized = await sharp(inputPath)
    .resize({
      width: targetLockupSize,
      height: targetLockupSize,
      fit: 'inside',
      kernel: 'lanczos3',
    })
    .png()
    .toBuffer();

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

  console.log(`[social] wrote ${path.relative(projectRoot, outputPath)} (${size}x${size})`);
}

async function main() {
  await mkdir(outDir, { recursive: true });

  // 1:1 feed-post variants for every brand color.
  for (const variant of variants) {
    for (const size of SIZES) {
      await buildOne({ ...variant, mode: 'post' }, size);
    }
  }

  // Profile-avatar variants (extra padding so circle crops don't clip
  // the type). Currently green main + green inline; add more to this
  // list as needed.
  for (const variant of profileVariants) {
    for (const size of SIZES) {
      await buildOne({ ...variant, mode: 'profile' }, size);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
