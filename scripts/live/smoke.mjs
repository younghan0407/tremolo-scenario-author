// smoke.mjs — run generated spec(s) LIVE via the repo's own Playwright and record pass/fail,
// producing a results.json that log_results.py folds into the TC workbook (closes #1 → #2).
//
// Safety: 변경 판정은 ground·walk 와 같은 공통 정책(mutation.mjs)으로 meta 스텝을 본다. 변경 동작이거나 이름으로 판정할 수
// 없는 클릭(아이콘 css 버튼·행 메뉴 등)이 하나라도 있으면 --allow-mutating 없이는 실행하지 않는다(smoke 는 화면 단 차단이 없다).
// 실행 대상은 data/scenarios/<sol>/<ver>/<file> **전체 경로**로 한정하고, Pass 는 종료 코드 0 + 전역 오류 0 + 대상 파일의
// 모든 테스트 passed 일 때만이다. 결과는 매 실행 상태(Pass/Fail/skipped/error)로 덮어쓰고, 상세 이력은 <out>.runs.jsonl 에 쌓는다.
//
// Requirements: the spec must sit under data/scenarios/** (Playwright testMatch). Use
// `generate.mjs --install` first, or pass --install here to copy before running. Login/MFA are
// performed by the spec's own preamble (from assets/envs.json) (the script logs in, not a human).
//
// Usage:
//   node scripts/live/smoke.mjs <spec.ts ...>|--all [--headed] [--allow-mutating] [--install] [--out results.json]
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { tremoloRoot } from '../tremolo_paths.mjs';
import { mutatingSteps } from './mutation.mjs';

// Playwright CLI를 npx.cmd 대신 `node cli.js` 로 직접 호출하기 위한 경로 해석(루트 기준).
// 왜: Windows에서 npx.cmd 는 인자의 정규식 특수문자([]$^ 등)를 cmd.exe 가 재해석해 깨진다.
function resolvePwCli(root) {
  try {
    const req = createRequire(path.join(root, 'package.json'));
    return path.join(path.dirname(req.resolve('playwright/package.json')), 'cli.js');
  } catch { return null; }
}

const argv = process.argv.slice(2);
const flag = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d; };

function relUnderData(root, spec) {
  const rel = path.relative(root, spec).split(path.sep).join('/');
  return rel.startsWith('data/scenarios/') ? rel : null;
}

function installUnderData(root, spec) {
  // mirror output/scenarios/<sol>/<ver>/<name> -> data/scenarios/<sol>/<ver>/<name>
  const m = spec.replace(/\\/g, '/').match(/scenarios\/([^/]+)\/([^/]+)\/(.+\.spec\.ts)$/);
  if (!m) throw new Error('cannot infer data/scenarios path for ' + spec);
  const dest = path.join(root, 'data', 'scenarios', m[1], m[2], m[3]);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(spec, dest);
  if (fs.existsSync(spec + '.meta.json')) fs.copyFileSync(spec + '.meta.json', dest + '.meta.json');
  return dest;
}

function runOne(root, spec, { headed, allowMutating, install }) {
  const name = path.basename(spec, '.spec.ts');
  let steps = null;
  try { steps = JSON.parse(fs.readFileSync(spec + '.meta.json', 'utf-8')).steps; } catch { /* meta 없음 */ }
  if (!allowMutating) {
    if (!steps) return { name, status: 'skipped', reason: 'meta 없음 — 변경 여부를 판정할 수 없어 실행 안 함(--allow-mutating 으로만)' };
    const muts = mutatingSteps(steps);
    if (muts.length) {
      return { name, status: 'skipped', reason: `변경(또는 판정 불가) 스텝 ${muts.length}개: ${muts.slice(0, 3).map(({ s, c }) => `${s.id} ${c.label || c.why}`).join(', ')} — --allow-mutating 으로만 실행` };
    }
  }
  let target = spec;
  if (install || !relUnderData(root, spec)) target = installUnderData(root, spec);
  const rel = relUnderData(root, target);
  if (!rel) return { name, status: 'error', reason: 'spec not under data/scenarios; use --install' };

  // 시나리오가 exportRuntimeValue/resolveRuntimeValue({{alias}})를 쓰면 별칭이 컨텍스트 파일에 저장돼야
  // 스텝 간 유지된다(파일 없으면 매 호출 빈 컨텍스트→"별칭 값을 찾을 수 없습니다"). 미설정 시 임시 파일 제공.
  const ctxFile = process.env.TREMOLO_RUNTIME_CONTEXT
    || path.join(os.tmpdir(), `tremolo-runtime-${Date.now()}-${process.pid}.json`);
  const env = { ...process.env, TREMOLO_HEADLESS: headed ? 'false' : 'true', TREMOLO_RUNTIME_CONTEXT: ctxFile };
  // Playwright 는 위치 인자를 파일 경로에 대한 REGEX 로 본다. 다른 솔루션·버전 폴더의 같은 파일명까지 잡히지 않도록
  // **data/scenarios/<sol>/<ver>/<file> 전체**를 세그먼트별로 이스케이프하고 구분자는 [\\/] 로, 끝은 $ 로 고정한다.
  const escRe = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pathFilter = rel.split('/').map(escRe).join('[\\\\/]') + '$';
  const pwCli = resolvePwCli(root);
  // Windows 의 npx.cmd 는 Node 보안 정책상 execFileSync 로 호출할 수 없다(EINVAL) → Playwright 패키지의 cli.js 를 node 로 직접 실행.
  if (!pwCli) return { name, status: 'error', reason: 'Tremolo 폴더에서 playwright 패키지를 찾지 못함(npm install 필요)' };
  // config엔 per-test timeout이 없어 기본 30초 → 로그인+생성+삭제 전체 흐름엔 태부족(앱은 크게 잡음).
  // 실제 라이브 시나리오용으로 넉넉히(10분). 필요 시 TREMOLO_TEST_TIMEOUT(ms)로 조정.
  const testTimeout = String(process.env.TREMOLO_TEST_TIMEOUT || 600000);
  const pwArgs = ['test', pathFilter, '--reporter=json', '--project=chromium', `--timeout=${testTimeout}`];
  let out = '', exitCode = 0;
  try {
    out = execFileSync(process.execPath, [pwCli, ...pwArgs],
      { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 }).toString();
  } catch (e) {
    exitCode = typeof e.status === 'number' ? e.status : 1;
    out = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
  }
  // Playwright JSON 보고서로 판정. 보고서를 못 읽으면 Pass 로 추정하지 않는다(error).
  let rep;
  try { rep = JSON.parse(out.slice(out.indexOf('{'))); } catch {
    return { name, rel, status: 'error', exitCode, reason: '실행 보고서를 읽지 못함: ' + out.split('\n').filter(Boolean).slice(-2).join(' / ').slice(0, 200) };
  }
  const tests = [], files = new Set();
  const walk = (suite) => {
    if (suite.file) files.add(String(suite.file).split('\\').join('/'));
    (suite.suites || []).forEach(walk);
    (suite.specs || []).forEach((sp) => sp.tests?.forEach((t) => tests.push({ ok: t.results?.length > 0 && t.results.every((r) => r.status === 'passed'), r: t.results?.[t.results.length - 1] })));
  };
  (rep.suites || []).forEach(walk);
  const globalErrors = (rep.errors || []).map((e) => (e.message || String(e)).split('\n')[0]).slice(0, 3);
  const failures = tests.flatMap((x) => (x.r?.errors || []).map((e) => (e.message || '').split('\n')[0])).slice(0, 5);
  const relName = rel.split('/').slice(2).join('/'); // <sol>/<ver>/<file> — 보고서의 file 은 testDir 기준 경로
  const strayFiles = [...files].filter((f) => !f.endsWith(relName));
  const allOk = tests.length > 0 && tests.every((x) => x.ok);
  let status, reason = '';
  if (!tests.length) { status = 'error'; reason = '테스트를 찾지 못함(경로 필터 확인)'; }
  else if (strayFiles.length) { status = 'error'; reason = `요청하지 않은 파일까지 실행됨: ${strayFiles.join(', ')}`; }
  else if (!allOk) status = 'Fail';
  else if (exitCode !== 0 || globalErrors.length) { status = 'error'; reason = `테스트는 통과했지만 실행 전체 오류(종료 코드 ${exitCode}${globalErrors.length ? ', ' + globalErrors.join(' / ') : ''})`; }
  else status = 'Pass';
  return { name, rel, status, exitCode, globalErrors, failures, reason };
}

function main() {
  const root = tremoloRoot({ optional: true }); // standalone (no Tremolo source) supported
  const base = root ? path.join(root, 'workspace_claude', 'output') : process.cwd();
  let specs = argv.filter((a) => a.endsWith('.spec.ts'));
  if (flag('--all')) {
    const dir = path.join(base, 'scenarios');
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : (e.name.endsWith('.spec.ts') ? [path.join(d, e.name)] : []));
    specs = fs.existsSync(dir) ? walk(dir) : [];
  }
  if (!specs.length) { console.error('usage: node smoke.mjs <spec.ts ...>|--all [--headed] [--allow-mutating] [--install] [--out results.json]'); process.exit(2); }
  if (!root) {
    console.error('[smoke] 전체 실행(1회 검증)은 Tremolo 리포/앱 환경이 필요합니다 — 스펙이 import하는 `data/scenarios/_helpers/*`와 playwright config가 있어야 합니다.');
    console.error('        standalone(소스 없음)에서는 실측 게이트로 `node scripts/live/ground.mjs "<spec>" --write`를 쓰고, 1회 실행은 Tremolo 앱에서 수행하세요.');
    process.exit(2);
  }
  const opts = { headed: flag('--headed'), allowMutating: flag('--allow-mutating'), install: flag('--install') };
  const outFile = val('--out', path.join(base, 'results', 'results.json'));

  const results = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf-8')) : {};
  const rows = [];
  const runAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  for (const spec of specs) {
    const r = runOne(root, spec, opts);
    rows.push(r);
    // 이번 실행 상태로 항상 덮어쓴다(건너뜀·오류가 예전 Pass 를 남기지 않게). log_results 는 Pass/Fail 외를 N-T 로 본다.
    results[r.name] = r.status;
    fs.appendFileSync(outFile.replace(/\.json$/i, '') + '.runs.jsonl', JSON.stringify({ runAt, spec: r.rel || spec, ...r }) + '\n', 'utf-8');
    console.log(`  ${r.status === 'Pass' ? '✅' : r.status === 'Fail' ? '❌' : r.status === 'error' ? '⚠️ ' : '⏭️ '} ${r.name}${r.reason ? '  — ' + r.reason : ''}${r.failures?.length ? '\n      ' + r.failures.join('\n      ') : ''}`);
  }
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2), 'utf-8');
  const p = rows.filter((r) => r.status === 'Pass').length, f = rows.filter((r) => r.status === 'Fail').length, s = rows.filter((r) => r.status === 'skipped').length;
  const er = rows.filter((r) => r.status === 'error').length;
  console.log(`[smoke] Pass ${p} / Fail ${f} / error ${er} / skipped ${s}  → results: ${outFile}`);
  console.log('[smoke] 다음: python scripts/results/log_results.py --results ' + outFile + '  (워크북 사본에 Pass/Fail 기입)');
  process.exitCode = f || er ? 1 : 0; // 실패·실행 오류는 호출자(자동화)에 종료 코드로 전달
}

main();
