// probe.mjs — Phase 0 entry. Launch Chrome, (optionally) log in, navigate to a target screen,
// and dump the grounding artifacts the author uses to pick REAL selectors:
//   - aria.yaml            : full-page compact ARIA snapshot (role + accessible name)
//   - interactable.json    : flat de-duped index of interactive elements (role, name, count)
//   - storageState.json    : session (+ .summary.json: cookies / localStorage / JWT expiries)
//   - page.png             : screenshot for eyeballing
//
// Usage (Windows, headed against staging):
//   node scripts/live/probe.mjs --nav "컴퓨트>인스턴스" --name instance-list
//   node scripts/live/probe.mjs --url https://example.invalid/env-1/... --name detail
// Flags: --nav "A>B"  --url <u>  --no-login  --headless  --state <file>  --out <dir>  --name <label>
import fs from 'fs';
import path from 'path';
import { tremoloRoot } from '../tremolo_paths.mjs';
import { launch, login, navigateMenu, ariaSnapshotFull, interactableIndex, dumpStorageState } from './lib.mjs';

function arg(flag, def) { const i = process.argv.indexOf(flag); return i >= 0 ? (process.argv[i + 1] ?? true) : def; }
const has = (flag) => process.argv.includes(flag);

async function main() {
  const name = arg('--name', 'probe-' + new Date().toISOString().replace(/[:.]/g, '-'));
  const root = tremoloRoot({ optional: true }); // standalone (built app, no Tremolo source) supported
  const defaultOut = root
    ? path.join(root, 'workspace_claude', 'output', 'live-probe', name)
    : path.join(process.cwd(), 'live-probe', name);
  const outDir = path.resolve(String(arg('--out', defaultOut)));
  fs.mkdirSync(outDir, { recursive: true });
  const headless = has('--headless');
  const stateFile = arg('--state', undefined);
  const url = arg('--url', undefined);
  const nav = arg('--nav', undefined);
  const doLogin = !has('--no-login') && !url; // an explicit --url self-test skips login by default

  console.log(`[probe] Chrome 실행 (headless=${headless}). 창이 안 뜨면: (1) chromium 미설치 → 'npx playwright install chromium', (2) --headless 안 붙였는지 확인.`);
  const { browser, context, page } = await launch({ headless, stateFile: typeof stateFile === 'string' ? stateFile : undefined });
  try {
    if (doLogin) { console.log('[probe] logging in…'); await login(page); }
    if (url) { console.log('[probe] goto', url); await page.goto(String(url), { timeout: 30000 }).catch((e) => console.warn('goto:', e.message)); }
    if (nav) { console.log('[probe] navigate', nav); await navigateMenu(page, nav); }
    await page.waitForTimeout(800);

    const aria = await ariaSnapshotFull(page);
    fs.writeFileSync(path.join(outDir, 'aria.yaml'), aria, 'utf-8');
    const index = interactableIndex(aria);
    fs.writeFileSync(path.join(outDir, 'interactable.json'), JSON.stringify(index, null, 2), 'utf-8');
    await dumpStorageState(context, path.join(outDir, 'storageState.json'));
    await page.screenshot({ path: path.join(outDir, 'page.png'), fullPage: true }).catch(() => {});

    const ambiguous = index.filter((e) => e.count > 1);
    console.log(`[probe] ${name}: aria ${aria.split('\n').length} lines, ${index.length} interactable (${ambiguous.length} ambiguous)`);
    console.log('[probe] artifacts ->', outDir);
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

main().catch((e) => { console.error('[probe] FAILED:', e.message); process.exit(1); });
