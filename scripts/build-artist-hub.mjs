import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const hubDir = path.join(root, 'artist-hub');
const hubPkg = path.join(hubDir, 'package.json');
const buildDir = path.join(hubDir, 'build');
const outDir = path.join(root, 'public', 'artist-hub');

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const from = path.join(src, e.name);
    const to = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(from, to);
    else if (e.isSymbolicLink()) {
      const link = fs.readlinkSync(from);
      fs.symlinkSync(link, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

function run(cmd, cwd, env) {
  execSync(cmd, {
    cwd,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  });
}

if (!exists(hubPkg)) {
  console.log('[artist-hub] Skipping (no artist-hub/package.json found).');
  process.exit(0);
}

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const lock = path.join(hubDir, 'package-lock.json');

console.log('[artist-hub] Installing dependencies…');
run(exists(lock) ? `${npmCmd} ci` : `${npmCmd} install`, hubDir);

console.log('[artist-hub] Building static bundle…');
// Bridge common hosting env var naming conventions into the SvelteKit bundle.
// The hub reads PUBLIC_* variables at build time.
const bridgedEnv = {
  BASE_PATH: '/artist-hub',
  PUBLIC_BFTA_ADMIN_NPUB:
    process.env.PUBLIC_BFTA_ADMIN_NPUB || process.env.NEXT_PUBLIC_BFTA_ADMIN_NPUB || '',
  PUBLIC_BFTA_RELAYS:
    process.env.PUBLIC_BFTA_RELAYS || process.env.NEXT_PUBLIC_BFTA_RELAYS || '',
};
run(`${npmCmd} run build`, hubDir, bridgedEnv);

if (!exists(buildDir)) {
  console.error('[artist-hub] Build output not found at artist-hub/build');
  process.exit(1);
}

console.log('[artist-hub] Syncing to public/artist-hub…');
fs.rmSync(outDir, { recursive: true, force: true });
copyDir(buildDir, outDir);

console.log('[artist-hub] Done.');

