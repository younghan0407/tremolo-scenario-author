// walk.mjs — 비변경 화면 탐색용 보조 도구 (실측). 로그인(세션 재사용) 후 액션 목록을 순서대로 수행하고
// 'snap' 지점마다 ARIA 스냅샷을 저장한다. 변경 정책(mutation.mjs)을 ground 와 똑같이 적용한다:
//   ① click·clickText·press(Enter) 를 같은 규칙으로 판정해 변경 동작은 실행하지 않고(FAIL 로 기록)
//   ② 로그인 이후 비-GET 요청은 모두 네트워크 단에서 차단(BLOCK 로 기록). 의도된 쓰기(예: 프로젝트 컨텍스트 전환 확인)는
//      그 액션에 "writeOk": true 를 명시해야만 허용된다. 세션 연장([연장])은 자동 허용.
//
// Usage: node scripts/live/walk.mjs <actions.json> [--out <dir>] [--headless]
//   actions.json = [ {"nav":"기본 설정>키페어"}, {"click":{"role":"button","name":"add 생성"}},
//                    {"clickText":"키페어"}, {"fill":{"role":"textbox","name":"..."},"value":"x"},
//                    {"press":"Escape"}, {"wait":1000}, {"snap":"name"}, {"goto":"/contrabass/..."} ]
//   {"eval":"<js>","save":"name"} → 결과 전체를 <out>/name.json 으로 저장(로그에는 4000자까지만)
import fs from 'fs';
import path from 'path';
import { launch, login, navigateMenu, ariaSnapshotFull, loadFixtures, acquireLiveLock } from './lib.mjs';
import { classifyWalkAction, installWriteGuard, allowRequestsFor } from './mutation.mjs';

const argv = process.argv.slice(2);
const arg = (f, d) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d; };
const file = argv.find((a) => !a.startsWith('--') && a !== arg('--out'));
const outDir = path.resolve(arg('--out', path.join(path.dirname(file), 'walk-out')));
fs.mkdirSync(outDir, { recursive: true });
await acquireLiveLock(); // 계정 배정 후 세션 파일을 계정별로(다른 계정 세션 재사용 방지)
const stateFile = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), `.walk-state-${process.env.TREMOLO_ACCOUNT || 'default'}.json`);
const actions = JSON.parse(fs.readFileSync(file, 'utf-8'));
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const anchored = (s) => new RegExp('^\\s*' + esc(s).replace(/\s+/g, '\\s+') + '\\.?\\s*$');

function loc(page, t) {
  if (t.css) return page.locator(t.css);
  if (t.xpath) return page.locator('xpath=' + t.xpath.replace(/^xpath=/, ''));
  if (t.text) return page.getByText(t.exact === false ? t.text : anchored(t.text));
  if (t.label) return page.getByLabel(anchored(t.label));
  return page.getByRole(t.role, { name: t.exact === false ? t.name : anchored(t.name) });
}

/** 로그인 만료 예고 팝업(알림: N분 후 로그인 시간이 만료됩니다) → [연장] (세션 연장, 자원 비변경) */
async function keepAlive(page, guard) {
  const ext = page.getByRole('dialog').filter({ hasText: '로그인 시간이 만료됩니다' }).getByRole('button', { name: /^\s*연장\s*$/ });
  if (await ext.count().catch(() => 0)) {
    guard?.open('session-extend');
    await ext.first().click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(800);
    guard?.close();
  }
}

const fx = loadFixtures();
const { browser, context, page } = await launch({ headless: argv.includes('--headless'), stateFile: fs.existsSync(stateFile) ? stateFile : undefined });
const log = [];
try {
  await page.goto(fx.env.url, { timeout: 30000 });
  // 세션 유효 확인: LNB(대시보드 메뉴)가 안 뜨면(로그인 화면/접속 정보 확인 중 정체) 새로 로그인
  const lnb = page.getByRole('menuitem', { name: /대시보드/ });
  const ok = await lnb.first().waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
  if (!ok) { await context.clearCookies(); await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }).catch(() => {}); await login(page); await context.storageState({ path: stateFile }); }
  const guard = await installWriteGuard(context, { allow: allowRequestsFor(fx.env.key) });
  for (const a of actions) {
    const t0 = Date.now();
    await keepAlive(page, guard);
    const cls = classifyWalkAction(a);
    if (a.writeOk) guard.open('writeOk');
    try {
      if (cls.mutating) throw new Error(`mutating action blocked: ${cls.label} (${cls.why}) — 의도된 쓰기면 "writeOk": true`);
      if (a.goto) await page.goto(new URL(a.goto, fx.env.url).href, { timeout: 30000 });
      else if (a.nav) await navigateMenu(page, a.nav);
      else if (a.clickText) await page.getByText(anchored(a.clickText)).nth(a.nth ?? 0).click();
      else if (a.click) {
        const l = loc(page, a.click); const n = await l.count();
        log.push(`  count=${n}`);
        await (a.nth != null ? l.nth(a.nth) : a.last ? l.last() : l.first()).click();
      } else if (a.fill) await loc(page, a.fill).first().fill(String(a.value));
      else if (a.upload) await loc(page, a.upload).first().setInputFiles(a.file);
      else if (a.press) await page.keyboard.press(a.press);
      else if (a.hover) await loc(page, a.hover).first().hover();
      else if (a.wait) await page.waitForTimeout(a.wait);
      else if (a.count) { const n = await loc(page, a.count).count(); log.push(`COUNT ${JSON.stringify(a.count)} = ${n}`); }
      else if (a.eval) { const r = await page.evaluate(a.eval); if (a.save) fs.writeFileSync(path.join(outDir, a.save + '.json'), JSON.stringify(r, null, 1), 'utf-8'); log.push('EVAL ' + (a.save ? `(saved ${a.save}.json) ` : '') + JSON.stringify(r).slice(0, 4000)); }
      else if (a.snap) {
        await page.waitForTimeout(a.settle ?? 800);
        fs.writeFileSync(path.join(outDir, a.snap + '.aria.yaml'), await ariaSnapshotFull(page), 'utf-8');
        await page.screenshot({ path: path.join(outDir, a.snap + '.png'), fullPage: false }).catch(() => {});
      }
      if (!a.snap && !a.wait) await page.waitForTimeout(a.after ?? 700);
      log.push(`OK   ${JSON.stringify(a)} (${Date.now() - t0}ms) url=${page.url()}`);
    } catch (e) {
      log.push(`FAIL ${JSON.stringify(a)} :: ${String(e.message).split('\n')[0]}`);
      if (cls.mutating) continue; // 차단은 실패가 아니라 정책 — 다음 액션 진행
      if (!a.optional) {
        fs.writeFileSync(path.join(outDir, '_fail.aria.yaml'), await ariaSnapshotFull(page).catch(() => ''), 'utf-8');
        await page.screenshot({ path: path.join(outDir, '_fail.png') }).catch(() => {});
        break;
      }
    } finally {
      guard.close();
      for (const b of guard.take()) log.push(`BLOCK 변경 요청 차단: ${b}  (액션 ${JSON.stringify(a).slice(0, 120)})`);
    }
  }
  await context.storageState({ path: stateFile }).catch(() => {});
} finally {
  fs.writeFileSync(path.join(outDir, '_log.txt'), log.join('\n'), 'utf-8');
  console.log(log.join('\n'));
  await browser.close().catch(() => {});
}
