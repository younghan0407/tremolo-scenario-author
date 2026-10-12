// Shared library for the live (Chrome-driven) layer. Launches real Chrome with Tremolo's exact
// config, replays the fixed login, and captures grounding artifacts (full-page ARIA snapshot +
// flat interactable index) and the session storageState. No hard-coded selectors are invented:
// login uses assets/envs.json (scripts/env.mjs), and grounding reads the REAL DOM.
//
// Runs on the user's Windows machine against the live staging (headed by default). In a CI/Linux
// box you can point TREMOLO_PLAYWRIGHT at a locally-installed playwright and run --headless.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function loadPlaywright() {
  // Priority: explicit override -> repo's playwright -> playwright-core.
  // 하네스 옆(형제 폴더)에 Tremolo 리포가 있으면 그 node_modules 의 playwright 도 찾는다(standalone 하네스용).
  const sib = ['Tremolo', 'tremolo'].map((d) => path.join(__dirname, '..', '..', '..', d, 'node_modules', 'playwright'));
  const tries = [process.env.TREMOLO_PLAYWRIGHT, 'playwright', 'playwright-core', ...sib].filter(Boolean);
  for (const t of tries) {
    try { return require(t); } catch { /* next */ }
  }
  throw new Error(
    'playwright not found. On the Tremolo repo it is already a dependency (run `pnpm install` + ' +
    '`npx playwright install chromium`). To point elsewhere, set TREMOLO_PLAYWRIGHT to a playwright module dir.',
  );
}

// 접속 정보는 assets/envs.json 하나에서 읽는다(scripts/env.mjs). --env / TREMOLO_ENV 로 환경 선택.
export { loadFixtures } from '../env.mjs';
import { loadFixtures as _loadFixtures } from '../env.mjs';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Tremolo 코드젠과 같은 관대함: 내부 공백 \s+, 끝 마침표 optional (예: 306 '…주세요' vs 400 '…주세요.')
const anchored = (s) => new RegExp('^\\s*' + escapeRegex(String(s).replace(/\.\s*$/, '')).replace(/\s+/g, '\\s+') + '\\.?\\s*$');

// ───────────────────────── 브라우저 해석 (Tremolo 앱과 같은 규칙) ─────────────────────────
// Tremolo 는 Playwright 브라우저를 ~/AppData/Local/ms-playwright 가 아니라 자체 폴더에 둔다:
//   개발 리포 : <Tremolo>/build/playwright-browsers/chromium-<rev>   (번들 Chromium)
//   설치 앱   : <앱>/resources/playwright-browsers/chromium-<rev>
//   버전 고정 : <Tremolo>/build/browsers/<chrome|edge>-<버전>/...     (예: chrome-131 — 호환성 검증용)
// 그래서 PLAYWRIGHT_BROWSERS_PATH 를 그 폴더로 맞춰야 `npx playwright install` 없이 바로 뜬다.
const TREMOLO_ROOT_MARKERS = ['src/main/services/scenarioService.ts', 'playwright.config.ts'];
function findTremoloRoot() {
  const env = process.env.TREMOLO_ROOT;
  if (env && TREMOLO_ROOT_MARKERS.every((m) => fs.existsSync(path.join(env, m)))) return env;
  let dir = __dirname;
  for (let i = 0; i < 12; i += 1) {
    if (TREMOLO_ROOT_MARKERS.every((m) => fs.existsSync(path.join(dir, m)))) return dir;
    const up = path.dirname(dir); if (up === dir) break; dir = up;
  }
  return null;
}
const hasChromium = (d) => { try { return fs.readdirSync(d).some((n) => /^chromium-\d+$/.test(n)); } catch { return false; } };

/** 번들 Chromium 폴더 후보 (Tremolo 리포 → 설치 앱 순). 있는 첫 폴더. */
export function resolveBrowsersPath() {
  const root = findTremoloRoot();
  const la = process.env.LOCALAPPDATA || '';
  const cands = [
    root && path.join(root, 'build', 'playwright-browsers'),
    la && path.join(la, 'Programs', 'Tremolo', 'resources', 'playwright-browsers'),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Tremolo', 'resources', 'playwright-browsers'),
  ].filter(Boolean);
  return cands.find(hasChromium);
}

/** build/browsers/<이름> 폴더(또는 절대 경로)에서 chrome.exe / msedge.exe 를 찾는다. */
function resolveProfileExe(name) {
  if (fs.existsSync(name) && fs.statSync(name).isFile()) return name;
  const root = findTremoloRoot();
  const dir = root && path.join(root, 'build', 'browsers', name);
  if (!dir || !fs.existsSync(dir)) return null;
  const exeNames = /^(edge|msedge)/i.test(name) ? ['msedge.exe', 'msedge'] : ['chrome.exe', 'chrome'];
  for (const sub of ['', ...fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)]) {
    for (const n of exeNames) { const p = path.join(dir, sub, n); if (fs.existsSync(p)) return p; }
  }
  return null;
}

function argBrowser() {
  const i = process.argv.indexOf('--browser');
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/**
 * Launch a browser. Headed by default.
 * 선택: --browser <값> 인자 > TREMOLO_BROWSER 환경변수 > 기본(bundled)
 *   bundled            Tremolo 번들 Chromium (앱 기본 실행과 동일)  ← 기본
 *   chrome | msedge    이 PC에 설치된 Chrome / Edge
 *   chrome-131 등      <Tremolo>/build/browsers/<이름> 의 버전 고정 브라우저 (호환성 검증)
 *   <절대경로.exe>     임의 실행 파일
 * TREMOLO_CHROMIUM_EXECUTABLE 이 있으면 그것을 최우선(Tremolo 앱이 넘겨주는 값과 동일 규칙).
 */
/**
 * 라이브 세션 잠금 + 계정 풀 배정. 중복 로그인이 막힌 솔루션은 같은 계정 두 번째 로그인이 첫 세션을 끊어 실측이 오염된다
 * (2026-10 400tst 확인) → **계정 1개 = 동시 1세션**. envs.<키>.accounts 로 계정 풀을 두면 빈 계정을 골라 병렬 실행하고,
 * 동시 세션 수는 envs.<키>.maxParallel(PC 성능에 맞게)로 제한한다. 고른 계정은 TREMOLO_ACCOUNT 로 이 프로세스에 고정된다.
 * TREMOLO_ACCOUNT 를 미리 주면 그 계정만 기다린다(컨텍스트 전환 등 계정 상태를 이어 쓰는 연속 작업은 계정 고정).
 * TREMOLO_NO_LOCK=1 이면 생략.
 */
let heldLock = null;
export async function acquireLiveLock() {
  if (process.env.TREMOLO_NO_LOCK || heldLock) return;
  let fx; try { fx = _loadFixtures(); } catch { return; }
  const dir = path.join(__dirname, '..', '..', 'runlogs'); fs.mkdirSync(dir, { recursive: true });
  const fileOf = (id) => path.join(dir, `.live-${fx.env.key}-${String(id).replace(/[^\w.-]/g, '_')}.lock`);
  const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
  const holder = (f) => { try { const c = JSON.parse(fs.readFileSync(f, 'utf-8')); return alive(c.pid) ? c : null; } catch { return null; } };
  const pinned = process.env.TREMOLO_ACCOUNT;
  const cands = pinned ? [pinned] : fx.accountPool.map((a) => a.id);
  const max = fx.maxParallel || 1;
  const t0 = Date.now(); let warned = 0;
  for (;;) {
    const busy = fs.readdirSync(dir).filter((n) => n.startsWith(`.live-${fx.env.key}-`) && n.endsWith('.lock'))
      .filter((n) => holder(path.join(dir, n))).length;
    if (busy < max) {
      for (const id of cands) {
        const f = fileOf(id);
        if (fs.existsSync(f) && !holder(f)) { try { fs.unlinkSync(f); } catch { /* raced */ } } // 죽은 프로세스의 잠금 정리
        try {
          fs.writeFileSync(f, JSON.stringify({ pid: process.pid, cmd: process.argv.slice(1).join(' ').slice(0, 200), at: new Date().toISOString() }), { flag: 'wx' });
        } catch { continue; } // 사용 중
        heldLock = f; process.env.TREMOLO_ACCOUNT = id;
        const release = () => { try { if (JSON.parse(fs.readFileSync(f, 'utf-8')).pid === process.pid) fs.unlinkSync(f); } catch { /* ignore */ } };
        process.on('exit', release);
        for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { release(); process.exit(130); });
        if (fx.accountPool.length > 1) console.log(`[lock] 계정 ${id}@${fx.env.key} 사용 (동시 ${busy + 1}/${max})`);
        return;
      }
    }
    if (Date.now() - t0 > 60 * 60 * 1000) throw new Error(`[lock] 1시간 대기 초과 — 사용 가능한 계정 없음(${cands.join(', ')}, 동시 ${busy}/${max})`);
    if (Date.now() - warned > 60000) { console.warn(`[lock] ${pinned ? '계정 ' + pinned + ' 사용 중' : `빈 계정 없음/동시 ${busy}/${max}`} — 대기`); warned = Date.now(); }
    await new Promise((r) => setTimeout(r, 3000 + Math.random() * 2000));
  }
}

export async function launch({ headless = false, stateFile, browser: want } = {}) {
  await acquireLiveLock();
  if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
    const bp = resolveBrowsersPath();
    if (bp) process.env.PLAYWRIGHT_BROWSERS_PATH = bp; // playwright 를 처음 require 하기 전에 지정해야 반영됨
  }
  const { chromium } = loadPlaywright();
  const baseOpts = { headless, args: ['--lang=ko-KR', '--window-size=1920,945'] };
  const sel = want || argBrowser() || process.env.TREMOLO_BROWSER || 'bundled';
  const tries = [];
  if (process.env.TREMOLO_CHROMIUM_EXECUTABLE) tries.push(['TREMOLO_CHROMIUM_EXECUTABLE', { executablePath: process.env.TREMOLO_CHROMIUM_EXECUTABLE }]);
  else if (sel === 'chrome' || sel === 'msedge') tries.push([`설치된 ${sel}`, { channel: sel }]);
  else if (sel !== 'bundled') {
    const exe = resolveProfileExe(sel);
    if (!exe) throw new Error(`[launch] 브라우저 "${sel}" 를 찾을 수 없음 — <Tremolo>/build/browsers/${sel} 폴더 또는 exe 경로 확인`);
    tries.push([sel, { executablePath: exe }]);
  } else {
    tries.push([`번들 Chromium (${process.env.PLAYWRIGHT_BROWSERS_PATH || '기본 위치'})`, {}]);
    tries.push(['설치된 Chrome (폴백)', { channel: 'chrome' }]);
  }
  let browser; let lastErr;
  for (const [label, o] of tries) {
    try {
      browser = await chromium.launch({ ...baseOpts, ...o });
      console.log(`[launch] ${label} → ${browser.version()}`);
      break;
    } catch (e) {
      lastErr = e;
      console.warn(`[launch] ${label} 실패: ${String(e && e.message || e).split('\n')[0]}`);
    }
  }
  if (!browser) {
    throw new Error('브라우저를 띄우지 못했습니다. (1) Tremolo 폴더 안에서 실행 중인지(번들 Chromium 자동 탐색), ' +
      '(2) 또는 PLAYWRIGHT_BROWSERS_PATH 지정, (3) 또는 --browser chrome 으로 설치된 Chrome 사용. 원인: ' + String(lastErr?.message || lastErr).split('\n')[0]);
  }
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,               // internal self-signed certs
    locale: 'ko-KR', timezoneId: 'Asia/Seoul',
    viewport: { width: 1920, height: 945 },
    storageState: stateFile && fs.existsSync(stateFile) ? stateFile : undefined,
  });
  context.setDefaultTimeout(15000);
  context.setDefaultNavigationTimeout(30000);
  const page = await context.newPage();
  return { browser, context, page };
}

/** Replay the fixed login using the current env in assets/envs.json (same values as the generated preamble). */
/**
 * 로그인 입력칸 찾기: ① envs.json 라벨(placeholder/접근성 이름) → ② 실패 시 CSS 폴백.
 * 폴백으로 찾았으면 실제 라벨을 알려 envs.json 을 맞추도록 안내한다(다음부터는 ①로 바로 잡힘).
 */
async function pickField(page, label, fallbackCss, what, hints) {
  const byLabel = page.getByRole('textbox', { name: anchored(label) }).first();
  try { await byLabel.waitFor({ state: 'visible', timeout: 6000 }); return byLabel; } catch { /* fallback */ }
  const fb = page.locator(fallbackCss).first();
  await fb.waitFor({ state: 'visible', timeout: 9000 });
  const actual = (await fb.getAttribute('placeholder').catch(() => null)) || (await fb.getAttribute('aria-label').catch(() => null)) || '';
  console.warn(`[login] ${what} 칸을 라벨 "${label}"(으)로 못 찾아 폴백 사용. 실제 라벨: "${actual}"`);
  if (actual) hints.push({ field: `${what}Label`, value: actual, cmd: `node scripts/env.mjs set ${what}Label "${actual}"` });
  return fb;
}

export async function login(page, fx = _loadFixtures()) {
  const a = fx.account;
  // 로그인 필드 라벨은 envs.json 의 login.* (솔루션/버전별로 다르면 envs.<key>.login 으로 덮어쓰기 — env.mjs set idLabel ...)
  const { idLabel: idL, passwordLabel: pwL, mfaLabel: mfaL } = fx.login;
  const hints = [];
  await page.goto(fx.env.url, { timeout: 30000 });
  const id = await pickField(page, idL, 'input:not([type=password]):not([type=hidden]):not([type=checkbox]):visible', 'id', hints);
  await id.fill(a.id);
  await id.press('Tab');
  const pw = await pickField(page, pwL, 'input[type=password]:visible', 'password', hints);
  await pw.fill(a.password);
  await pw.press('Enter'); // Enter submits login — do NOT click a separate 로그인 button (redundant)
  if (fx.login.mfa) {
    // MFA (tst 환경은 6자리 입력 시 자동 제출). 칸이 안 나오면(MFA 미적용 계정 등) 그냥 진행.
    try {
      const mfa = await pickField(page, mfaL,
        'input[autocomplete="one-time-code"]:visible, input[maxlength="6"]:visible, input[inputmode="numeric"]:visible', 'mfa', hints);
      let code = a.mfaCode;
      if (fx.login.mfaMode === 'random') {
        // 매번 랜덤 OTP(이메일 등): 실행 시점에 사용자에게 받은 코드를 TREMOLO_OTP 로 넘긴다.
        code = process.env.TREMOLO_OTP;
        if (!code) throw new Error('[login] 랜덤 OTP 환경 — 사용자에게 지금 받은 OTP 를 TREMOLO_OTP=<코드> 로 지정해 다시 실행');
      }
      await mfa.fill(code);
    } catch (e) { if (String(e.message).includes('랜덤 OTP')) throw e; console.warn('[login] MFA 입력칸이 나타나지 않음 — MFA 없이 진행 (MFA 미사용이면: node scripts/env.mjs set mfa off)'); }
  }
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  if (hints.length) console.warn('[login] 라벨을 맞추려면(env.mjs check 는 자동 저장):\n  ' + hints.map((h) => h.cmd).join('\n  '));
  page.__loginHints = hints;
  return page;
}

/** 로그인 실패 진단: 스크린샷 + 화면의 입력칸 목록을 dir 에 남긴다. */
export async function dumpLoginDiagnostics(page, dir) {
  fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, 'login-fail.png'), fullPage: true }).catch(() => {});
  const inputs = await page.evaluate(() => [...document.querySelectorAll('input,button')].filter((e) => e.getClientRects().length)
    .map((e) => ({ tag: e.tagName.toLowerCase(), type: e.type, placeholder: e.placeholder, name: e.name, id: e.id,
      aria: e.getAttribute('aria-label'), text: (e.innerText || '').trim().slice(0, 40) }))).catch(() => []);
  const info = { url: page.url(), title: await page.title().catch(() => ''), inputs };
  fs.writeFileSync(path.join(dir, 'login-fail.json'), JSON.stringify(info, null, 2), 'utf-8');
  return info;
}

/** Click a menu path like "컴퓨트>인스턴스" by visible text (Tremolo's nav pattern). */
export async function navigateMenu(page, pathStr) {
  for (const part of String(pathStr).split('>').map((s) => s.trim()).filter(Boolean)) {
    await page.getByText(anchored(part)).first().click({ timeout: 15000 });
    await page.waitForTimeout(500);
  }
}

/**
 * Full-page compact ARIA snapshot. Playwright's ariaSnapshot returns the accessibility tree
 * (role + accessible name, hidden nodes excluded) — far smaller than raw HTML. FULL PAGE, not a
 * container: AntD renders dropdowns/modals/tooltips as body-level portals, so scoping to a
 * container would silently drop exactly the elements we need to target.
 */
export async function ariaSnapshotFull(page) {
  return await page.locator('body').ariaSnapshot();
}

const INTERACTIVE_ROLES = new Set([
  'button', 'link', 'textbox', 'combobox', 'checkbox', 'radio', 'tab', 'menuitem',
  'menuitemcheckbox', 'menuitemradio', 'option', 'spinbutton', 'switch', 'searchbox',
  'slider', 'treeitem', 'columnheader', 'cell', 'gridcell',
]);

/**
 * Flat, de-duplicated index of interactive elements derived FROM the ARIA snapshot (so names are
 * Playwright's computed accessible names, not guesses). Each entry: {role, name, count}. count>1
 * flags ambiguity → the author must add order/nth. This is the pick-list the LLM chooses targets from.
 */
export function interactableIndex(ariaYaml) {
  const map = new Map();
  const re = /^\s*-\s+([a-z]+)(?:\s+"((?:[^"\\]|\\.)*)")?/;
  for (const line of ariaYaml.split('\n')) {
    const m = re.exec(line);
    if (!m) continue;
    const role = m[1];
    if (!INTERACTIVE_ROLES.has(role)) continue;
    const name = (m[2] || '').replace(/\\"/g, '"');
    const key = role + '\u0000' + name;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .map(([k, count]) => ({ role: k.split('\u0000')[0], name: k.split('\u0000')[1], count }))
    .sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));
}

/** Save storageState and a human-readable summary (cookies, localStorage keys, JWT expiries). */
export async function dumpStorageState(context, file) {
  const state = await context.storageState();
  fs.writeFileSync(file, JSON.stringify(state, null, 2), 'utf-8');
  const now = Date.now();
  const decodeExp = (v) => {
    const m = /^[\w-]+\.([\w-]+)\.[\w-]+$/.exec(String(v || ''));
    if (!m) return null;
    try {
      const payload = JSON.parse(Buffer.from(m[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8'));
      return typeof payload.exp === 'number' ? payload.exp : null;
    } catch { return null; }
  };
  const summary = {
    cookies: (state.cookies || []).map((c) => ({
      name: c.name, domain: c.domain, expires: c.expires,
      expiresISO: c.expires > 0 ? new Date(c.expires * 1000).toISOString() : 'session',
      httpOnly: c.httpOnly, secure: c.secure,
    })),
    origins: (state.origins || []).map((o) => ({
      origin: o.origin,
      localStorage: (o.localStorage || []).map((kv) => {
        const exp = decodeExp(kv.value);
        return { name: kv.name, bytes: (kv.value || '').length, jwtExpISO: exp ? new Date(exp * 1000).toISOString() : null,
                 jwtExpired: exp ? exp * 1000 < now : null };
      }),
    })),
  };
  fs.writeFileSync(file.replace(/\.json$/, '') + '.summary.json', JSON.stringify(summary, null, 2), 'utf-8');
  return { state, summary };
}
