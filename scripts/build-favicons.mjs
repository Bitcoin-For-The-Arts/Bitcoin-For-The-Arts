// Regenerate the site favicon + app-icon set from the BFTA bug.
//
// Source:
//   public/BFTA-bug-square-cream-orange-2.png
//   (black BTA + orange 'Arts' on cream — same colorway as the main
//   lockup used on the home and about pages, so the tab icon, app icon,
//   and the chrome bug all match.)
//
// Outputs (sizes match the existing references in the codebase):
//   public/favicon-16.png        16x16   browser tab fallback
//   public/favicon-32.png        32x32   browser tab
//   public/favicon-48.png        48x48   higher-DPI browser tab
//   app/icon.png                 512x512 Next.js app icon (auto-served at /icon.png)
//   app/apple-icon.png           180x180 iOS home-screen icon
//   app/favicon.ico              32x32   classic /favicon.ico (PNG payload; modern browsers accept this)
//
// Each output adds a small (~6%) cream margin around the source so the
// type isn't pushed to the very edge of the canvas — important at small
// sizes where the browser's tab area trims a few pixels.
//
// Run:  node scripts/build-favicons.mjs

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const appDir = path.join(projectRoot, 'app');

const SOURCE = path.join(publicDir, 'BFTA-bug-square-cream-orange-2.png');
const CREAM = { r: 255, g: 250, b: 240, alpha: 1 }; // #FFFAF0

// Each target: { out: absolute path, size: pixel dim }.
// Add ~8% breathing room around the bug for tiny sizes.
const targets = [
  { out: path.join(publicDir, 'favicon-16.png'), size: 16 },
  { out: path.join(publicDir, 'favicon-32.png'), size: 32 },
  { out: path.join(publicDir, 'favicon-48.png'), size: 48 },
  { out: path.join(appDir, 'icon.png'), size: 512 },
  { out: path.join(appDir, 'apple-icon.png'), size: 180 },
  // app/favicon.ico — modern browsers accept PNG content under the .ico
  // extension, and Next.js serves whatever is at app/favicon.ico as the
  // /favicon.ico route. Use 32px (the most common favicon resolution).
  { out: path.join(appDir, 'favicon.ico'), size: 32 },
];

const PADDING_FRACTION = 0.08;

async function buildOne({ out, size }) {
  const innerSize = Math.max(1, Math.round(size * (1 - PADDING_FRACTION * 2)));

  // Resize the bug into the inner area, then composite it centered onto a
  // cream square at the requested final size.
  const bug = await sharp(SOURCE)
    .resize({
      width: innerSize,
      height: innerSize,
      fit: 'inside',
      kernel: 'lanczos3',
    })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: CREAM },
  })
    .composite([{ input: bug, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(out);

  console.log(`[favicon] wrote ${path.relative(projectRoot, out)} (${size}x${size})`);
}

async function main() {
  for (const t of targets) {
    await buildOne(t);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
