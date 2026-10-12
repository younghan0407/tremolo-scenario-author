// Bundle Tremolo's OWN codegen into a single CJS file we can require().
//
// Why: `.meta.json` (a Step[] IR) is Tremolo's source of truth — the app regenerates
// `.spec.ts` from it via generateSpecFromSteps() on save/run. By reusing that exact
// function (rather than reimplementing it) our specs are byte-identical to the app's and
// stay correct even if Tremolo's codegen evolves — just rebuild the bundle.
//
// scenarioService.ts depends only on `fs`, `path`, and pure `src/shared/*` modules
// (no electron/playwright at module top level), so it bundles cleanly for Node.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { tremoloRoot, resolveEsbuildDir, cacheDir } from './tremolo_paths.mjs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Pre-bundled codegen shipped WITH the skill (so it works with only Node — no Tremolo source,
// no esbuild, no pnpm). This is the default path for users who have the built app (exe/dmg) but
// not the repo source. Rebuild it (build_codegen --force, needs source+esbuild) only when Tremolo's
// codegen changes.
export function vendorCodegenPath() { return path.join(__dirname, '..', 'vendor', 'codegen.cjs'); }

export async function buildCodegen({ force = false } = {}) {
  // Standalone default: if the skill ships a vendored codegen, use it (no Tremolo source / esbuild needed).
  const vendor = vendorCodegenPath();
  if (!force && fs.existsSync(vendor)) return vendor;
  const out = path.join(cacheDir(), 'codegen.cjs');
  const root = tremoloRoot();
  const scenarioService = path.join(root, 'src', 'main', 'services', 'scenarioService.ts');
  const scenarioIdentity = path.join(root, 'src', 'shared', 'scenarioIdentity.ts');

  if (!force && fs.existsSync(out)) {
    // Rebuild if the source is newer than the cached bundle.
    const srcMtime = Math.max(fs.statSync(scenarioService).mtimeMs, fs.statSync(scenarioIdentity).mtimeMs);
    if (fs.statSync(out).mtimeMs >= srcMtime) return out;
  }

  const esbuild = require(resolveEsbuildDir());
  const entry = path.join(cacheDir(), 'entry.ts');
  fs.writeFileSync(
    entry,
    [
      `export { generateSpecFromSteps, parseSpecToSteps } from ${JSON.stringify(scenarioService)};`,
      `export { makeScenarioStableId } from ${JSON.stringify(scenarioIdentity)};`,
      '',
    ].join('\n'),
    'utf-8',
  );

  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: out,
    // These are never exercised by generateSpecFromSteps/parseSpecToSteps but may appear
    // in the import graph of sibling modules; keep them external so the bundle stays lean.
    external: ['electron', 'playwright', 'playwright-core'],
    logLevel: 'warning',
  });
  // --force(최신화)는 로더가 실제로 쓰는 vendor 번들을 교체해야 의미가 있다 — 캐시에만 만들면 loadCodegen 이 계속 옛 vendor 를 쓴다.
  // 이전 vendor 는 codegen.cjs.bak 로 남긴다. 새 번들이 필요한 함수를 내보내는지 먼저 확인한 뒤 교체.
  if (force) {
    const mod = require(out);
    if (typeof mod.generateSpecFromSteps !== 'function' || typeof mod.parseSpecToSteps !== 'function') {
      throw new Error(`새 번들에 generateSpecFromSteps/parseSpecToSteps 가 없음 — vendor 교체 안 함 (${out})`);
    }
    fs.mkdirSync(path.dirname(vendor), { recursive: true });
    if (fs.existsSync(vendor)) fs.copyFileSync(vendor, vendor + '.bak');
    fs.copyFileSync(out, vendor);
    delete require.cache[require.resolve(vendor)];
    return vendor;
  }
  return out;
}

export function loadCodegen() {
  const vendor = vendorCodegenPath();
  if (fs.existsSync(vendor)) return require(vendor);
  const out = path.join(cacheDir(), 'codegen.cjs');
  if (!fs.existsSync(out)) throw new Error('codegen bundle missing; ship vendor/codegen.cjs or run buildCodegen() with Tremolo source + esbuild');
  return require(out);
}

// CLI: `node build_codegen.mjs [--force]`
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('build_codegen.mjs')) {
  buildCodegen({ force: process.argv.includes('--force') })
    .then((p) => console.log('[build_codegen] bundle ready:', p))
    .catch((e) => { console.error('[build_codegen] FAILED:', e.message); process.exit(1); });
}
