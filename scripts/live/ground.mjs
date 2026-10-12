// ground.mjs — 라이브 실측 점검(grounding). 생성된 시나리오(meta)의 스텝을 실제 화면에서 재생하며
// 각 target 이 라이브 DOM에 실재하는지 점검하고, note 를 `[실측]`/`[예측]`(미발견/중복)로 스탬프한다.
//
// 왜: 같은 메뉴의 '생성'이라도 진입 포인트에 따라 입력 필드·스텝이 달라질 수 있다. 샘플을 보고 '예측'으로
// 작성한 스텝은 반드시 실측으로 확인해야 한다. 이 도구가 그 흔적([실측]/[예측])을 남기고 verify가 게이트한다.
//
// 안전: 변경 정책은 mutation.mjs(공통). 화면 단에서 제출·Enter·즉시 실행 메뉴는 **수행하지 않고 존재만 확인**하고,
//   로그인 이후 GET 이 아닌 요청은 네트워크 단에서 모두 차단한다(이름으로 못 잡은 변경 → '변경 요청 차단'으로 보고).
//   기본: 그 지점 이후 스텝은 UNREACHED. --continue: 제출을 건너뛰고(Escape로 팝업 닫음) 계속 점검한다.
//   이때 변경 결과에 의존하는 assert(토스트·목록 반영 등)는 POSTMUT(변경 후 결과 — 1회 실행으로 확인)로 남긴다.
//   --subst A=B : 시나리오가 만드는 자원명 A 대신 이미 존재하는 자원 B로 화면을 따라가며 점검(행 메뉴/수정 팝업 등).
//     B 는 이름에 'qa-trml-{yymmdd}' 가 들어간 자원만(아니면 중단).
//   --mutate : 제출(생성·수정·삭제 등)을 **실제로 수행**한다. 단, 누르는 순간 작업 대상이 'qa-trml-{yymmdd}' 자원임이 화면에서
//     확인될 때만(열린 행 메뉴의 행 / 팝업 내용·선택 행 / 폼 입력값·제목). 확인 안 되면 기존처럼 미수행. (2026-10-06 지침)
//   동적 값: '{YYMMDD_HHMMSS}'·'{HHMMSS}'·'{RUN_ID}' 토큰과 runtime.saveAs 별칭('{{별칭}}')을 Tremolo 와 같은 방식으로 풀어 재생한다.
//   assert 는 존재 + 상태(visible/hidden/disabled/enabled/checked/text/value)까지 평가한다(비변경).
//
//   ※ 대체 자원으로 본 assert 실패는 '[예측] 대체자원 값/상태 차이'로 남는다(TC 불일치로 단정 금지).
//   ※ TC 불일치(실제 ≠ TC 기대)는 스크립트를 고쳐 통과시키지 않는다 — assert 는 TC 기대 그대로 두고(onFailure 기본 fail)
//     note 에 '상태 불일치(TC … / 실측 …)' 를 남겨 보고한다. continue/pass 처리 금지(references/grounding-policy.md).
//
// Usage (로그인은 envs.json 자동로그인, --env <키>):
//   node scripts/live/ground.mjs "<...>.spec.ts | .meta.json" [--write] [--headless] [--no-login]
//        [--continue] [--subst A=B ...] [--allow "추가,확인"] [--mutate]
//        [--skip-missing]        클릭/입력 대상이 없어도(사전데이터 부재 등) 이후 스텝 점검 계속
//        [--range sA:sB]         이 범위 스텝만 스탬프(부분 재실측 — 나머지 스탬프 보존)
//        [--from sN --nav "A>B"] sN 부터 재생(시작 화면은 LNB 경로로 이동)
//        [--debug]               MISSING 시 스크린샷+ARIA 스냅샷을 _ground-debug/ 에 저장
//        [--alias K=V ...]       다른 시나리오(실행 세트의 [준비] 시나리오)가 저장하는 별칭 {{K}} 의 값을 미리 지정.
//                                PRE_* (사전데이터 자원) 값은 이름에 qa-trml-{yymmdd} 가 있어야 한다.
//   --subst 는 주어진 순서대로 치환한다 → 긴 이름을 먼저(예: qa-trml-lb-upd=X 다음 qa-trml-lb=X).
//   제출 허용: [검증클릭]/[비변경] note, --allow "라벨", 또는 --mutate(누르는 요소 기준 대상이 qa-trml 로 확인될 때)만.
import fs from 'fs';
import path from 'path';
import { launch, login, loadFixtures } from './lib.mjs';
import { classifyStep, installWriteGuard, allowRequestsFor } from './mutation.mjs';

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const multi = (f) => argv.flatMap((a, i) => (a === f && argv[i + 1] ? [argv[i + 1]] : []));
const target = argv.find((a, i) => !a.startsWith('--') && !['--subst', '--owner-ok', '--allow', '--env', '--browser', '--range', '--from', '--nav', '--alias'].includes(argv[i - 1]));
if (!target) { console.error('usage: node ground.mjs "<spec.ts|meta.json>" [--write] [--headless] [--no-login] [--continue] [--subst A=B] [--allow "추가"] [--mutate]'); process.exit(2); }
const metaPath = target.endsWith('.meta.json') ? target : target + '.meta.json';
if (!fs.existsSync(metaPath)) { console.error('meta not found:', metaPath); process.exit(2); }
const CONTINUE = has('--continue');
const SUBST = multi('--subst').map((kv) => kv.split('=')).filter((p) => p.length === 2);
// 실측 자원 제한(2026-10-06 개정 지침): 조회·선택·대체·변경(CUD) 대상은 이름에 'qa-trml-{yymmdd}' 가 들어간 자원만.
// (구 규칙 'pqa-'/'qa-' 접두·생성자 계정 허용(--owner-ok)은 폐기)
const QA_NAME = /qa-trml-\d{6}/i;
if (has('--owner-ok')) { console.error("[ground] --owner-ok 는 폐기되었습니다 — 실측 자원은 이름에 'qa-trml-{yymmdd}' 가 들어간 자원만 쓸 수 있습니다."); process.exit(2); }
const badSubst = SUBST.filter(([, b]) => !QA_NAME.test(b.trim()));
if (badSubst.length) {
  console.error('[ground] 허용되지 않은 대체 자원: ' + badSubst.map(([a, b]) => `${a}=${b}`).join(', ') +
    "\n  → 실측 자원은 이름에 'qa-trml-{yymmdd}'(예: qa-trml-261006-vol) 가 들어간 자원만 쓸 수 있습니다.");
  process.exit(2);
}
const MUTATE = has('--mutate');
const FROM = multi('--from')[0]; // 예: s96 — 그 이전 스텝은 건너뜀(--nav 로 시작 화면 지정)
const NAV = multi('--nav')[0];
const RANGE = (multi('--range')[0] || '').split(':'); // 예: s56:s94 — 이 범위 스텝만 스탬프
if (RANGE[0] && !RANGE.every((r) => /^s\d+$/.test(r))) { console.error(`[ground] --range 형식 오류: '${multi('--range')[0]}' → 예: s56:s94`); process.exit(2); }
const ALLOW = new Set(multi('--allow').flatMap((s) => s.split(',')).map((s) => s.trim()).filter(Boolean));

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Tremolo 코드젠과 동일한 관대함: 내부 공백은 \s+, 끝 마침표는 optional(meta에 '.' 유무가 스텝마다 달라 오탐 방지).
const anchored = (s) => new RegExp('^\\s*' + esc(s).replace(/\s+/g, '\\s+') + '\\.?\\s*$');
// Tremolo _helpers/dynamicValue 와 같은 토큰 해석(KST). 실측 1회 안에서는 같은 값으로 고정(생성→검색→삭제가 같은 이름을 보도록).
const KST = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()).match(/\d+/g); // [yyyy,mm,dd,HH,MM,SS]
const TOKENS = { YYMMDD_HHMMSS: `${KST[0].slice(2)}${KST[1]}${KST[2]}_${KST[3]}${KST[4]}${KST[5]}`, HHMMSS: `${KST[3]}${KST[4]}${KST[5]}`,
  RUN_ID: Math.random().toString(36).slice(2, 10) };
const ALIASES = new Map(); // runtime.saveAs → 실측 중 입력한 값 (+ --alias 로 미리 준 실행 세트 별칭)
for (const kv of multi('--alias')) {
  const i = kv.indexOf('=');
  const k = kv.slice(0, i).trim(); const v = kv.slice(i + 1).trim();
  if (i < 1 || !v) { console.error(`[ground] --alias 형식 오류: ${kv} (K=V)`); process.exit(2); }
  if (/^PRE_/.test(k) && !/qa-trml-\d{6}/i.test(v)) {
    console.error(`[ground] --alias ${k}: 사전데이터 자원은 이름에 'qa-trml-{yymmdd}' 가 있어야 합니다 (${v})`); process.exit(2);
  }
  ALIASES.set(k, v);
}
const rt = (v) => v.replace(/\{([A-Z][A-Z0-9_]*)\}/g, (raw, k) => TOKENS[k] ?? raw)
  .replace(/\{\{\s*([A-Za-z][A-Za-z0-9_-]{1,31})\s*\}\}/g, (raw, a) => (ALIASES.has(a) ? ALIASES.get(a) : raw));
const sub = (v) => (typeof v === 'string' ? rt(SUBST.reduce((acc, [a, b]) => acc.split(a).join(b), v)) : v);
const CREATED = new Set(); // --mutate 로 실제 생성했을 수 있는 qa-trml 이름(정리 확인용)
// 변경 판정은 공통 정책(mutation.mjs)을 쓴다 — ground·walk·smoke 동일 규칙. --allow "단어" 로 특정 라벨만 예외.
function mutLabel(s) {
  const c = classifyStep(s);
  if (!c.mutating) return null;
  return ALLOW.has(c.label) ? null : c.label;
}

/** step.target → Playwright Locator (없으면 null). */
function toLocator(page, s) {
  const t = s.target;
  if (t) {
    // 생성 코드(Tremolo codegen)와 같은 규칙: order/nth 는 모든 대상 종류에 적용한다.
    const ord = (l) => (t.order === 'first' ? l.first() : t.order === 'last' ? l.last() : t.order === 'nth' ? l.nth(Math.max(0, Math.floor(t.nth || 0))) : l);
    const txt = (v) => (t.exact ? anchored(sub(v)) : sub(v));
    if (t.kind === 'role' && t.role) return ord(page.getByRole(t.role, { name: txt(t.name) }));
    if (t.kind === 'text') return ord(page.getByText(txt(t.text)));
    if (t.kind === 'label') return ord(page.getByLabel(txt(t.label)));
    if (t.kind === 'placeholder') return ord(page.getByPlaceholder(txt(t.placeholder)));
    if (t.kind === 'title') return ord(page.getByTitle(txt(t.title)));
    if (t.kind === 'altText') return ord(page.getByAltText(txt(t.alt)));
    if (t.kind === 'testId') return ord(page.getByTestId(sub(t.testId)));
    if (t.kind === 'css') return ord(page.locator(sub(t.selector)));
    if (t.kind === 'xpath') return ord(page.locator('xpath=' + sub(t.selector).replace(/^xpath=/, '')));
    if (t.kind === 'chain' && Array.isArray(t.chain)) return null; // 체인 대상은 실측 미지원 → MISSING 으로 남겨 사람이 확인
  }
  if (s.type === 'antdTableSelect' && s.antdTable?.match?.length) {
    let rows = page.locator('tr.ant-table-row, [role=row]');
    for (const m of s.antdTable.match) rows = rows.filter({ hasText: sub(m) });
    return rows;
  }
  if (s.type === 'antdSelect' && s.antd?.by === 'label' && s.antd.label) return page.getByText(s.antd.label, { exact: false });
  if (s.locator && s.locator !== '-') { const m = /^role=(\w+)\[name="(.*)"\]$/.exec(s.locator); if (m) return page.getByRole(m[1], { name: anchored(sub(m[2])) }); }
  return null;
}
const LOGIN = new Set(['아이디를 입력해 주세요', '비밀번호를 입력해 주세요', '인증 코드를 입력해 주세요',
  '아이디를 입력해 주세요.', '비밀번호를 입력해 주세요.', '인증 코드를 입력해 주세요.']);
const isResult = (s) => /\[결과\]/.test(s.note || '') || (s.timeout || 0) >= 150000;
// 로그인 프리앰블(맨 앞의 goto·로그인 입력 묶음)만 면제. 본문의 같은 placeholder(예: 장비 IPMI '비밀번호를 입력해 주세요.')는
// 일반 스텝으로 실행·판정한다(2026-10-07: 면제로 건너뛰어 서버 등록이 필수값 누락으로 실패한 사례).
let PREAMBLE = new Set();
const isExempt = (s) => s.type === 'goto' || PREAMBLE.has(s);

/** assert 평가(비변경). true/false, 또는 null(평가 불가). */
async function evalAssert(loc, s) {
  const a = s.assertion || {};
  const kind = a.kind || 'visible';
  const first = loc.first();
  try {
    if (kind === 'hidden') return (await loc.count()) === 0 || !(await first.isVisible());
    await first.waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});
    if (kind === 'visible') return await first.isVisible();
    if (kind === 'disabled') return await first.isDisabled();
    if (kind === 'enabled') return await first.isEnabled();
    if (kind === 'checked') return await first.isChecked();
    const exp = sub(a.expected ?? a.inputValue ?? '');
    if (kind === 'text') { const tx = (await first.innerText()).replace(/\s+/g, ' '); return a.match === 'equals' ? tx.trim() === exp : tx.includes(exp); }
    if (kind === 'value') { const v = await first.inputValue(); return a.match === 'contains' ? v.includes(exp) : v === exp; }
  } catch { return false; }
  return null;
}

async function closeOverlays(page) {
  for (let i = 0; i < 3; i += 1) {
    const wrap = page.locator('.ant-modal-wrap:visible, .ant-drawer-content-wrapper:visible, [role=dialog]:visible').last();
    if (!(await wrap.count())) {
      // 모달이 아닌 페이지 폼(생성 페이지 등): 하단 [취소]로 목록 복귀
      const pageCancel = page.getByRole('button', { name: /^\s*취소\s*$/ }).last();
      if (i === 0 && await pageCancel.count() && await pageCancel.isVisible().catch(() => false)) await pageCancel.click({ timeout: 3000 }).catch(() => {});
      break;
    }
    const cancel = wrap.getByRole('button', { name: /^\s*(취소|닫기|close)\s*$/ }).last();
    const x = wrap.locator('.ant-modal-close, .ant-drawer-close, button[aria-label="Close"]').first();
    if (await cancel.count()) await cancel.click({ timeout: 3000 }).catch(() => {});
    else if (await x.count()) await x.click({ timeout: 3000 }).catch(() => {});
    else await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(500);
  }
}

/**
 * --mutate 제출 허용 판정: 지금 제출이 작용할 대상이 'qa-trml-{yymmdd}' 자원인지 화면에서 확인한다(하나라도 아니면 거부).
 *  ① 열린 행 메뉴(⋯)가 있으면 그 행  ② 선택된 표 행(팝업 안 포함)은 전부  ③ 열린 팝업/드로어 내용(입력값 포함)  ④ 페이지 폼 입력값·제목
 */
async function qaTarget(page, el) {
  const fn = (node, src) => {
    const re = new RegExp(src, 'i');
    const vis = (e) => !!e && e.getClientRects().length > 0;
    const textOf = (e) => `${e.innerText || ''} ${[...e.querySelectorAll('input,textarea')].map((i) => i.value).join(' ')}`;
    // 누르는 요소 기준으로 대상을 좁힌다: 표 행 안 버튼 → 그 행 / 행 메뉴 항목 → 메뉴를 연 행 / 팝업 안 → 그 팝업.
    const row = node && node.closest('tbody tr');
    if (row) { const t = textOf(row); return { ok: re.test(t), where: '버튼이 있는 행', sample: t.replace(/\s+/g, ' ').slice(0, 80) }; }
    const trig = [...document.querySelectorAll('.ant-dropdown-open')].find(vis);
    if (trig) { const t = textOf(trig.closest('tr') || trig.parentElement || trig); return { ok: re.test(t), where: '행 메뉴의 행', sample: t.replace(/\s+/g, ' ').slice(0, 80) }; }
    if (node && node.closest('[role=menuitem]')) return { ok: false, where: '메뉴', sample: '메뉴를 연 행을 확인할 수 없음' };
    const inModal = node && node.closest('.ant-modal-wrap, .ant-drawer-content-wrapper, [role=dialog]');
    // '선택 행' = 표의 선택 열(ant-table-selection-column)로 고른 행. 행 안의 일반 체크박스(예: 서버 등록 CPU 행의 'Hyper Thread 활성화')는
    // 입력값이지 선택이 아니다(2026-10-07: 이를 선택 행으로 오인해 qa-trml 서버 등록을 막은 사례).
    const sel = [...document.querySelectorAll('tbody tr.ant-table-row-selected, tbody tr:has(td.ant-table-selection-column input:checked)')].filter(vis);
    const badSel = sel.find((r) => !re.test(textOf(r)));
    if (badSel) return { ok: false, where: '선택 행', sample: textOf(badSel).slice(0, 80) };
    if (inModal) {
      // 이번 실측에서 바로 이 팝업에 qa-trml 이름을 직접 입력했으면(생성 마법사) 허용 — 앞 단계 입력란이 사라지는 팝업 대응
      if (node.closest('[data-tremolo-qa]')) return { ok: true, where: '팝업(직접 입력한 qa-trml 이름)', sample: '' };
      // 팝업이 자원 이름을 보여 주거나(수정·삭제 확인 등), 팝업 밖에서 고른 행(일괄 처리)이 모두 qa-trml 이면 허용
      const t = textOf(inModal);
      return { ok: re.test(t) || sel.length > 0, where: !re.test(t) && sel.length > 0 ? '팝업(선택 행)' : '팝업', sample: t.replace(/\s+/g, ' ').slice(0, 80) };
    }
    const modal = [...document.querySelectorAll('.ant-modal-wrap, .ant-drawer-content-wrapper, [role=dialog]')].filter(vis).pop();
    if (modal) { const t = textOf(modal); return { ok: re.test(t) || sel.length > 0, where: '팝업', sample: t.replace(/\s+/g, ' ').slice(0, 80) }; }
    if (sel.length) return { ok: true, where: '선택 행', sample: '' };
    const main = document.querySelector('main') || document.body;
    const t = `${[...main.querySelectorAll('input,textarea')].map((i) => i.value).join(' ')} ${[...main.querySelectorAll('h1,h2,.ant-breadcrumb')].map((h) => h.innerText).join(' ')}`;
    return { ok: re.test(t), where: '폼', sample: t.replace(/\s+/g, ' ').slice(0, 80) };
  };
  return (el || page.locator('body')).evaluate(fn, QA_NAME.source);
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

async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(400);
}

async function main() {
  const doc = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  const steps = doc.steps || [];
  PREAMBLE = new Set();
  for (const s of steps) {
    if (s.type === 'goto' || LOGIN.has(s.target?.name || '') || (s.type === 'press' && LOGIN.has(s.target?.name || ''))) PREAMBLE.add(s);
    else break;
  }
  const { browser, context, page } = await launch({ headless: has('--headless') });
  const report = [];
  const stamp = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10); // 로컬 날짜
  let reached = true;
  let mutSkipped = false;
  let mutDone = false;
  let debugShots = 0;
  let sessionLost = null;
  let guard = null;
  try {
    if (!has('--no-login')) {
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        console.log(`[ground] 로그인… (${attempt})`);
        await login(page).catch((e) => console.warn('login:', e.message));
        const ok = await page.getByRole('menuitem', { name: /대시보드/ }).first().waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false);
        if (ok) break;
        await context.clearCookies(); await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }).catch(() => {});
      }
    }
    // 로그인 이후 모든 비-GET 요청은 명시적으로 열어 준 때만 통과(mutation.mjs). 화면 단 판정이 놓친 변경도 여기서 막힌다.
    let envKey = null; try { envKey = loadFixtures().env.key; } catch { /* --no-login 등 */ }
    guard = await installWriteGuard(context, { allow: allowRequestsFor(envKey) });
    let skipping = !!FROM;
    if (NAV) {
      for (const part of NAV.split('>').map((x) => x.trim())) {
        const mi = page.getByRole('menuitem', { name: anchored(part) });
        if (await mi.count()) await mi.first().click().catch(() => {}); else await page.getByText(anchored(part)).first().click().catch(() => {});
        await settle(page);
      }
    }
    for (const s of steps) {
      if (skipping) { if (s.id === FROM) skipping = false; else continue; }
      await keepAlive(page, guard);
      // 세션이 끊겨 로그인 화면으로 튕기면 이후 스텝은 전부 의미 없는 MISSING 이 된다 → 즉시 미도달로 끊고 원인을 보고.
      if (!has('--no-login') && reached && !sessionLost && /\/login(\/|$)/.test(new URL(page.url()).pathname)) {
        sessionLost = s.id; reached = false;
      }
      // 열려 있는 팝업에 qa-trml 이름이 보이면(수정 팝업 1단계의 기존 이름 등) 그 팝업 인스턴스에 표시를 남긴다 —
      // 앞 단계 내용이 사라지는 단계형 팝업의 마지막 제출도 '이 팝업은 qa-trml 자원 대상'으로 판정하기 위해.
      if (MUTATE && reached) {
        await page.evaluate((src) => {
          const re = new RegExp(src, 'i');
          for (const m of document.querySelectorAll('.ant-modal-wrap, .ant-drawer-content-wrapper')) {
            if (!m.getClientRects().length || m.hasAttribute('data-tremolo-qa')) continue;
            const t = `${m.innerText || ''} ${[...m.querySelectorAll('input,textarea')].map((i) => i.value).join(' ')}`;
            if (re.test(t)) m.setAttribute('data-tremolo-qa', '1');
          }
        }, QA_NAME.source).catch(() => {});
      }
      if (isExempt(s)) { // 로그인/goto: 수행만(존재 판정 제외)
        try {
          if (s.type === 'goto') {
            await page.goto(String(s.value), { timeout: 30000 });
            // SPA(로그인/콘솔)는 goto('load') 직후 아직 렌더 전일 수 있음 → 정착 대기 후 다음 스텝 점검
            await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
            await page.waitForTimeout(1200);
          }
        } catch { /* ignore */ }
        continue;
      }
      const loc = toLocator(page, s);
      const hasTgt = !!(s.target || (s.locator && s.locator !== '-') || s.antdTable || s.antd);
      if (!hasTgt) {
        if (s.type === 'press' && reached) { await page.keyboard.press(String(s.value || 'Escape')).catch(() => {}); await settle(page); }
        continue; // press-only 등 타깃 없는 스텝
      }

      if (!reached) { report.push({ s, status: 'UNREACHED' }); continue; }

      // 1) 존재 점검 (SPA 전환 직후 렌더 지연 대비: 0이면 잠깐 대기 후 재확인)
      let count = 0;
      try {
        count = await (loc ? loc.count() : Promise.resolve(0));
        if (count === 0 && loc) {
          // 실제로 제출한 뒤의 결과 확인(목록 반영 등)은 백엔드 처리 시간을 기다린다(스텝 timeout, 최대 3분).
          const wait = mutDone && isResult(s) ? Math.min(s.timeout || 60000, 180000) : s.type === 'assert' ? 6000 : 4000;
          await loc.first().waitFor({ state: 'visible', timeout: wait }).catch(() => {});
          count = await loc.count();
        }
      } catch (e) { count = -1; s.__err = String(e.message).split(String.fromCharCode(10))[0]; }
      let status = count === 1 ? 'FOUND' : count === 0 ? 'MISSING' : count > 1 ? `AMBIGUOUS(${count})` : 'ERROR';
      // order 지정 스텝은 locator 에 order 가 이미 적용돼 1개로 센다. antdTableSelect 는 헬퍼가 첫 일치 행을 고른다.
      // assert 다중 매칭은 생성 코드(expect strict)에서 실패하므로 AMBIGUOUS 그대로 둔다(첫 요소만 보고 통과시키지 않음).
      if (count > 1 && s.type === 'antdTableSelect') status = 'FOUND';
      let detail = '';

      // assert: 상태까지 평가
      if (s.type === 'assert' && count === 1) {
        const ok = await evalAssert(loc, s);
        if (ok === false) { status = mutSkipped && isResult(s) ? 'POSTMUT' : 'ASSERT_FAIL'; detail = `${s.assertion?.kind || 'visible'} 불일치`; }
      } else if (s.type === 'assert' && count === 0 && s.assertion?.kind === 'hidden') {
        status = 'FOUND';
      } else if (s.type === 'assert' && count === 0 && mutSkipped && isResult(s)) {
        status = 'POSTMUT';
      }
      report.push({ s, status, detail: detail || s.__err || '' }); delete s.__err;

      // runtime.saveAs: 이 스텝이 입력하는 값을 별칭으로 보관(이후 '{{별칭}}' 스텝이 같은 이름을 찾도록)
      if (s.runtime?.saveAs && s.value != null) {
        const v = String(sub(s.value));
        ALIASES.set(String(s.runtime.saveAs).trim(), v);
        if (MUTATE && QA_NAME.test(v)) CREATED.add(v);
      }

      // 2) 진행. 제출/삭제 클릭은 기본 미수행 — --mutate 이고 대상이 qa-trml 자원으로 확인될 때만 수행.
      const mut = mutLabel(s);
      if (mut && MUTATE && count >= 1) {
        const q = await qaTarget(page, loc.first()).catch((e) => ({ ok: false, where: '판정 실패', sample: String(e.message).slice(0, 60) }));
        if (q.ok) {
          const el = loc.first();
          guard.open('mutate');
          try {
            if (s.type === 'press') await el.press(String(s.value || 'Enter'), { timeout: 8000 });
            else await el.click({ timeout: 8000 });
            report[report.length - 1].detail = `제출(${mut}) 수행 — qa-trml 대상(${q.where})`;
            report[report.length - 1].mutated = true;
            mutDone = true;
          } catch (e) { report[report.length - 1].detail = `제출(${mut}) 클릭 실패: ${String(e.message).split('\n')[0]}`; }
          await settle(page); await page.waitForTimeout(1500);
          guard.close(); guard.take();
          continue;
        }
        report[report.length - 1].detail = `제출(${mut}) 미수행 — 대상이 qa-trml-{yymmdd} 자원으로 확인 안 됨(${q.where}: ${q.sample})`;
      }
      if (mut) {
        if (!report[report.length - 1].detail) report[report.length - 1].detail = `제출(${mut}) 미수행`;
        if (!CONTINUE) { reached = false; continue; }
        mutSkipped = true;
        // 팝업/드로어 닫기 → 다음 스텝 진행 (이 앱 모달은 Escape로 안 닫힘 → 취소/닫기 버튼 우선)
        await closeOverlays(page);
        await settle(page);
        guard.take();
        continue;
      }
      if (count >= 1) {
        const el = loc.first();
        // --mutate: 이름으로 변경 여부를 확정할 수 없는 클릭/Enter 도 대상이 qa-trml 로 확인되면 쓰기를 열어 준다(아니면 네트워크 단에서 차단).
        let opened = false;
        if (MUTATE && (s.type === 'click' || s.type === 'press')) {
          const q = await qaTarget(page, el).catch(() => ({ ok: false }));
          if (q.ok) { guard.open('mutate'); opened = true; }
        }
        try {
          if (s.type === 'fill') {
            const v = String(sub(s.value) ?? '');
            await el.fill(v, { timeout: 8000 });
            // 이 팝업에 qa-trml 이름을 직접 입력했다는 표시 — 단계형 팝업(앞 단계 입력란이 사라짐)의 마지막 제출도 대상 판정이 되게.
            if (QA_NAME.test(v)) await el.evaluate((n) => { const m = n.closest('.ant-modal-wrap, .ant-drawer-content-wrapper'); if (m) m.setAttribute('data-tremolo-qa', '1'); }).catch(() => {});
          }
          else if (s.type === 'type') await el.pressSequentially(String(sub(s.value) ?? ''), { timeout: 8000 });
          else if (s.type === 'press') await el.press(String(s.value ?? 'Enter'), { timeout: 8000 });
          else if (s.type === 'check') await el.check({ timeout: 8000, force: true }).catch(() => el.click({ timeout: 5000 }));
          else if (s.type === 'uncheck') await el.uncheck({ timeout: 8000, force: true }).catch(() => el.click({ timeout: 5000 }));
          else if (s.type === 'click') await el.click({ timeout: 8000 }).catch(() => {});
          else if (s.type === 'upload') {
            const file = String(s.value || '');
            if (fs.existsSync(file)) {
              if (s.upload?.mode === 'chooser') {
                const fc = page.waitForEvent('filechooser', { timeout: 8000 });
                await el.click({ timeout: 8000 });
                await (await fc).setFiles(file);
              } else await el.setInputFiles(file, { timeout: 8000 });
            } else detail = `파일 없음: ${file}`;
          } else if (s.type === 'antdTableSelect') {
            const ctl = el.locator('input[type=checkbox], input[type=radio]').first();
            if (await ctl.count()) await ctl.check({ force: true, timeout: 5000 }).catch(() => {});
          } else if (s.type === 'antdSelect') {
            // 열기 → 옵션 텍스트 클릭(옵션 선택은 화면 상태만 바꿈; 비변경)
            // 검색 input(opacity 0)이 root 면 보이는 selector 를 클릭해야 드롭다운이 열림
            const box = el.locator('xpath=ancestor-or-self::div[contains(concat(" ",normalize-space(@class)," ")," ant-select ")][1]//div[contains(@class,"ant-select-selector")]').first();
            if (await box.count()) await box.click({ timeout: 5000 }).catch(() => {});
            else await el.click({ timeout: 5000 }).catch(() => {});
            const v = String(sub(s.value) || '');
            if (v && v !== '__DEFAULT__') {
              const opt = page.locator('.ant-select-dropdown:visible .ant-select-item-option').filter({ hasText: anchored(v) }).first();
              await opt.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {});
              if (await opt.count()) { await page.waitForTimeout(300); await opt.click({ timeout: 5000 }).catch(() => {}); }
              else { detail = `옵션 미발견: ${v}`; await page.keyboard.press('Escape').catch(() => {}); }
            } else await page.keyboard.press('Escape').catch(() => {});
          }
          await settle(page);
          if (opened) await page.waitForTimeout(1500);
        } catch (e) { detail = detail || String(e.message).split('\n')[0]; }
        guard.close();
        const blocked = guard.take();
        if (blocked.length) {
          // 이름으로는 변경이 아니라고 봤지만 실제로 서버 변경 요청이 나간 스텝 — 차단했고, 이후 결과 확인은 '변경 후 결과'로 본다.
          detail = `변경 요청 차단(${blocked.length}건: ${blocked[0]})${detail ? '; ' + detail : ''}`;
          report[report.length - 1].blockedWrite = true;
          mutSkipped = true;
          if (CONTINUE) { await closeOverlays(page); await settle(page); } else reached = false;
        } else if (opened) { report[report.length - 1].mutated = true; mutDone = true; }
        if (detail) report[report.length - 1].detail = detail;
      } else if (s.type !== 'assert' && has('--skip-missing')) {
        // --debug: 계속 진행하더라도 처음 MISSING 3건은 화면을 남긴다(원인 파악용) → _ground-debug/<시나리오>/
        if (has('--debug') && (debugShots += 1) <= 3) {
          const dd = path.join(path.dirname(metaPath), '_ground-debug', path.basename(metaPath).replace(/\.spec\.ts\.meta\.json$/, '').replace(/[^\w가-힣-]+/g, '_').slice(0, 60));
          fs.mkdirSync(dd, { recursive: true });
          await page.screenshot({ path: path.join(dd, `${s.id}.png`) }).catch(() => {});
          fs.writeFileSync(path.join(dd, `${s.id}.txt`), `${page.url()}\n` + (await page.locator('body').ariaSnapshot().catch(() => '')), 'utf-8');
        }
        // 사전데이터 미존재 등: 이후 스텝 점검을 계속(이 스텝은 MISSING 유지)
      } else if (s.type !== 'assert') {
        if (has('--debug')) {
          const dd = path.join(path.dirname(metaPath), '_ground-debug'); fs.mkdirSync(dd, { recursive: true });
          await page.screenshot({ path: path.join(dd, `${s.id}.png`) }).catch(() => {});
          fs.writeFileSync(path.join(dd, `${s.id}.aria.yaml`), await page.locator('body').ariaSnapshot().catch(() => ''), 'utf-8');
        }
        reached = false; // 진행에 필요한 요소가 없으면 이후 도달 불가
      }
    }
  } finally {
    await context.close().catch(() => {}); await browser.close().catch(() => {});
  }

  // 리포트
  const n = (st) => report.filter((r) => r.status.startsWith(st)).length;
  console.log(`\n[ground] ${doc.scenarioId || path.basename(metaPath)}${SUBST.length ? '  subst=' + SUBST.map((p) => p.join('→')).join(',') : ''}`);
  for (const r of report) console.log(`  ${r.status.padEnd(12)} ${r.s.id}  ${(r.s.title || r.s.type).slice(0, 46)}${r.detail ? '  — ' + r.detail : ''}`);
  if (sessionLost) {
    console.log(`\n[ground] ⚠ ${sessionLost} 부터 세션 종료(로그인 화면) — 이후 스텝은 미도달. 같은 계정의 다른 로그인(중복 로그인) 또는`
      + ' 차단된 세션 유지 요청을 확인하세요(아래 차단 목록 → envs.json live.allowRequests).');
  }
  const blockedUniq = [...new Set((guard?.blockedAll || []).map((b) => b.replace(/\?.*$/, '')))];
  if (blockedUniq.length) {
    console.log(`\n[ground] 네트워크 단에서 막은 변경 요청 ${guard.blockedAll.length}건(고유 ${blockedUniq.length}): ${blockedUniq.slice(0, 8).join(' | ')}`);
  }
  if (CREATED.size) {
    console.log(`\n[ground] --mutate 로 생성했을 수 있는 qa-trml 자원: ${[...CREATED].join(', ')}`);
    console.log('  → 시나리오 정리(teardown) 스텝이 수행되지 않았으면 남아 있을 수 있음 — 확인 후 정리');
  }
  console.log(`\n요약: FOUND ${n('FOUND')} / ASSERT_FAIL ${n('ASSERT_FAIL')} / POSTMUT ${n('POSTMUT')} / MISSING ${n('MISSING')} / AMBIGUOUS ${n('AMBIGUOUS')} / UNREACHED ${n('UNREACHED')} / ERROR ${n('ERROR')}`);

  const idn = (id) => Number(String(id).replace(/\D/g, ''));
  const inRange = (s) => !RANGE[0] || (idn(s.id) >= idn(RANGE[0]) && idn(s.id) <= idn(RANGE[1] || RANGE[0]));
  if (has('--write')) {
    for (const r of report) {
      if (!inRange(r.s)) continue;
      // 확정된 TC 불일치(stamp.mjs mismatch 의 'TC 기대 그대로 유지', 구 mark 의 '[실측] … 상태 불일치')는, 여전히 실패
      // (MISSING/ASSERT_FAIL)면 판정 스탬프를 유지(재실측이 덮어쓰지 않게). 통과(FOUND)로 바뀌면 화면이 바뀐 것이니 새로 스탬프한다.
      const confirmedMismatch = /TC 기대 그대로 유지\(실패로 보고\)|^\s*\[실측\][^—\n]*상태 불일치/.test(r.s.note || '');
      if (confirmedMismatch && (r.status === 'MISSING' || r.status === 'ASSERT_FAIL')) continue;
      const prev = (r.s.note || '').replace(/^\s*\[(실측|예측)\][^\n—]*(?:—\s*)?/, '').trim(); // 기존 스탬프(태그+머신텍스트) 제거
      const via = SUBST.length ? ` (대체자원 ${SUBST.map((p) => p[1]).join(',')})` : '';
      if (r.status === 'FOUND') r.s.note = `[실측] ${stamp}${r.mutated ? ' (변경 수행)' : r.blockedWrite ? ' (변경 요청 차단)' : ''}${via}${prev ? ' — ' + prev : ''}`;
      // 대체 자원(--subst)으로 본 assert 실패는 '그 자원의 값/상태' 차이일 수 있어 TC 불일치로 단정하지 않는다(미판정 = [예측]).
      else if (r.status === 'ASSERT_FAIL' && SUBST.length) r.s.note = `[예측] 대체자원 값/상태 차이(${r.detail}) ${stamp}${via} — TC 불일치 미판정, 시나리오 자원으로 1회 실행 확인${prev ? '; ' + prev : ''}`;
      else if (r.status === 'ASSERT_FAIL') r.s.note = `[실측] ${stamp}${via} 요소 확인, 상태 불일치(${r.detail}) — TC 대비 확인 필요${prev ? '; ' + prev : ''}`;
      else if (r.status === 'POSTMUT') r.s.note = `[예측] 변경 후 결과 ${stamp} — 비변경 실측 불가, Tremolo 1회 실행으로 확인${prev ? '; ' + prev : ''}`;
      else if (r.status.startsWith('AMBIGUOUS')) r.s.note = `[예측] 중복 ${r.status} ${stamp} — 순서(order/nth) 지정 필요${prev ? '; ' + prev : ''}`;
      else if (r.status === 'MISSING') r.s.note = `[예측] 미발견 ${stamp} — 진입점/셀렉터 확인 필요${prev ? '; ' + prev : ''}`;
      else if (r.status === 'UNREACHED') r.s.note = `[예측] 미도달 ${stamp} — 앞 스텝 확인 후 재실측${prev ? '; ' + prev : ''}`;
    }
    fs.writeFileSync(metaPath, JSON.stringify(doc, null, 2), 'utf-8');
    console.log(`\n[ground] --write: note 스탬프 갱신됨 → ${metaPath}`);
    console.log('  (스펙 재생성: node scripts/generate.mjs <steps.json>  또는 Tremolo가 meta로부터 자동 재생성)');
  } else {
    console.log('\n(--write 를 주면 각 스텝 note 를 [실측]/[예측](미발견 등)로 스탬프합니다.)');
  }
  const bad = n('MISSING') + n('AMBIGUOUS') + n('ERROR');
  process.exit(bad > 0 ? 1 : 0);
}
main().catch((e) => { console.error('[ground] FAILED:', e.message); process.exit(1); });
