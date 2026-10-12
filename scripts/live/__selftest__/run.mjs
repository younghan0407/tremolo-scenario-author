// Live-layer mechanics self-test. Runs entirely offline against a local AntD-like fixture — no
// staging, no login. Proves the core claims of the live layer:
//   1. Full-page ARIA snapshot CAPTURES a body-level portal dropdown (nova / js-type).
//   2. A container-scoped snapshot MISSES it — i.e. scoping to a container would be wrong here.
//   3. interactableIndex() yields the expected role+name pick-list.
//
// Run on any machine that has a browser installed:
//   npx playwright install chromium   (once)
//   node scripts/live/__selftest__/run.mjs         # headless
// Exit 0 = all checks pass.
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { launch, ariaSnapshotFull, interactableIndex } from '../lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = pathToFileURL(path.join(__dirname, 'antd-like.html')).href;

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); };

console.log('[selftest] headless 메커니즘 자가검증 (로컬 HTML) — Chrome 창이 안 떠도 정상입니다. 실제 화면 실측은 probe.mjs/explore.mjs(headed) 사용.');
const { browser, context, page } = await launch({ headless: true });
try {
  await page.goto(fixture, { timeout: 15000 });
  const full = await ariaSnapshotFull(page);
  const container = await page.locator('#app-container').ariaSnapshot();
  const idx = interactableIndex(full);
  const hasIdx = (role, name) => idx.some((e) => e.role === role && e.name === name);

  // 1. full-page captures the body-portal options
  check('full-page snapshot captures portal options (nova, js-type)',
    full.includes('nova') && full.includes('js-type'),
    'options rendered outside #app-container must still appear');
  // 2. container scope MISSES them (this is why we snapshot full page)
  check('container-scoped snapshot MISSES portal (proves full-page is required)',
    !container.includes('nova'),
    container.includes('nova') ? 'unexpected: container saw the portal' : 'container correctly lacks nova');
  // 3. interactable index shape
  check('index has button 다음 & 생성', hasIdx('button', '다음') && hasIdx('button', '생성'));
  check('index has option nova (from portal)', hasIdx('option', 'nova'));
  check('index has textbox 이름을 입력해 주세요', hasIdx('textbox', '이름을 입력해 주세요'));
  check('index has a tab (인스턴스 스냅샷)', hasIdx('tab', '인스턴스 스냅샷'));

  const pass = results.every((r) => r.ok);
  console.log(`\n=== live selftest : ${pass ? 'PASS ✅' : 'FAIL ❌'} ===`);
  for (const r of results) console.log(`  ${r.ok ? '✅' : '❌'} ${r.name}${r.detail ? '  — ' + r.detail : ''}`);
  console.log(`\n  (full-page aria: ${full.split('\n').length} lines, ${idx.length} interactable elements)`);
  process.exitCode = pass ? 0 : 1;
} finally {
  await context.close().catch(() => {});
  await browser.close().catch(() => {});
}
