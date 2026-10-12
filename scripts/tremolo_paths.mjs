// Shared path/tool resolution for the Tremolo scenario harness.
// Cross-platform (Windows/macOS/Linux). No external deps.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Marker files that unambiguously identify the Tremolo repo root. */
const ROOT_MARKERS = [
  'src/main/services/scenarioService.ts',
  'playwright.config.ts',
];

function looksLikeRoot(dir) {
  return ROOT_MARKERS.every((m) => fs.existsSync(path.join(dir, m)));
}

/**
 * Resolve the Tremolo repo root.
 * Priority: env TREMOLO_ROOT -> ascend from this script -> ascend from cwd.
 * The skill normally lives at <root>/workspace_claude/output/tremolo-scenario-author/scripts,
 * so ascending finds the root reliably; env override keeps it portable if moved.
 */
export function tremoloRoot(opts = {}) {
  const env = process.env.TREMOLO_ROOT;
  if (env && looksLikeRoot(env)) return path.resolve(env);
  for (const start of [__dirname, process.cwd()]) {
    let dir = path.resolve(start);
    for (let i = 0; i < 12; i += 1) {
      if (looksLikeRoot(dir)) return dir;
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  // Standalone mode: users with the built app (exe/dmg) have no source repo. Callers pass
  // { optional: true } to get null instead of throwing, and fall back to env/cwd-based paths.
  if (opts.optional) return null;
  throw new Error(
    'Tremolo repo root not found. Set TREMOLO_ROOT to the folder that contains ' +
      'src/main/services/scenarioService.ts and playwright.config.ts.',
  );
}

/** Where generated scenarios' meta.scenarioPath should point (the app's data/scenarios). */
export function scenarioDataRoot(root) {
  if (process.env.TREMOLO_DATA_SCENARIOS) return path.resolve(process.env.TREMOLO_DATA_SCENARIOS);
  if (root) return path.join(root, 'data', 'scenarios');
  return path.join('data', 'scenarios'); // standalone placeholder (Tremolo re-derives from the real file location)
}

/** The _helpers dir (for verify's import check); null if unknown (standalone). */
export function helpersDir(root) {
  if (process.env.TREMOLO_HELPERS) return path.resolve(process.env.TREMOLO_HELPERS);
  if (root) return path.join(root, 'data', 'scenarios', '_helpers');
  return null;
}

function firstExistingDir(candidates) {
  for (const c of candidates) {
    try { if (c && fs.existsSync(c) && fs.statSync(c).isDirectory()) return c; } catch { /* ignore */ }
  }
  return null;
}

function scanPnpm(root, pkgPrefix) {
  const pnpm = path.join(root, 'node_modules', '.pnpm');
  if (!fs.existsSync(pnpm)) return null;
  const hit = fs.readdirSync(pnpm).find((d) => d.startsWith(pkgPrefix));
  if (!hit) return null;
  // pnpm layout: .pnpm/<pkg@ver>/node_modules/<pkg>
  const pkg = pkgPrefix.replace(/[@+].*$/, '').replace(/\+/g, '/');
  const dir = path.join(pnpm, hit, 'node_modules', pkg);
  return fs.existsSync(dir) ? dir : null;
}

/**
 * Resolve the esbuild package directory (its package.json "main" is the JS API).
 * Priority: env TREMOLO_ESBUILD -> repo node_modules/esbuild -> repo pnpm store.
 * On the user's machine the repo already ships esbuild (a vite dependency), so this
 * is auto-found; env override lets a different platform binary be pointed at for testing.
 */
export function resolveEsbuildDir() {
  const root = tremoloRoot();
  const dir = firstExistingDir([
    process.env.TREMOLO_ESBUILD,
    path.join(root, 'node_modules', 'esbuild'),
    scanPnpm(root, 'esbuild@'),
  ]);
  if (!dir) {
    throw new Error(
      'esbuild not found. It ships with the Tremolo repo (a vite dependency). ' +
        'If missing, run `pnpm install` in the repo, or set TREMOLO_ESBUILD to an esbuild package dir.',
    );
  }
  return dir;
}

/** Optional: locate the TypeScript compiler entry (for the soft type-check). */
export function resolveTscEntry() {
  const root = tremoloRoot();
  const candidates = [
    path.join(root, 'node_modules', 'typescript', 'lib', 'tsc.js'),
    (() => { const d = scanPnpm(root, 'typescript@'); return d ? path.join(d, 'lib', 'tsc.js') : null; })(),
  ];
  return firstExistingDir(candidates.map((c) => (c ? path.dirname(c) : null)))
    ? candidates.find((c) => c && fs.existsSync(c)) || null
    : (candidates.find((c) => c && fs.existsSync(c)) || null);
}

/** Stable cache dir for the bundled codegen (skill dir may be read-only when installed). */
export function cacheDir() {
  const dir = path.join(os.tmpdir(), 'tremolo-codegen-cache');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export const SPEC_SUFFIX = '.spec.ts';
export const META_SUFFIX = '.spec.ts.meta.json';

/** Tremolo scenario id: encodeURIComponent each of [solution, version, name] joined by "::". */
export function makeScenarioStableId(solution, version, name) {
  return [solution, version ?? '', name].map((p) => encodeURIComponent(p)).join('::');
}

/** Canonical scenario path (where Tremolo expects the file to live). Works standalone. */
export function tremoloScenarioPath(root, solution, version, name) {
  const base = scenarioDataRoot(root);
  return path.join(base, solution, version, `${name}${SPEC_SUFFIX}`);
}
