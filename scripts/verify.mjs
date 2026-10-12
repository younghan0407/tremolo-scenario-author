// Static verification for a generated Tremolo scenario. NO live browser run — safe on the
// staging env (real accounts/resources). Pass a .spec.ts OR its .spec.ts.meta.json.
//
// Hard checks (exit 1 on failure):
//   1. meta<->spec sync    : on-disk .spec.ts equals generateSpecFromSteps(meta.steps)
//   2. round-trip stable   : regen(parseSpecToSteps(spec)) === spec  (Tremolo parses it back identically)
//   3. syntax              : esbuild parses the spec as TypeScript without error
//   4. helper imports       : every ../../_helpers/<h> import resolves to a real helper file
//   5. env match (soft)    : login goto/id match assets/envs.json (현재 환경) — 다른 환경용이면 경고만; no leaked placeholders
//   6. structure           : unique ids; asserts enabled+targeted; antdTableSelect.match non-empty
//   6b. no-continue        : assert 의 onFailure:"continue" 금지(TC 불일치를 pass 처리하지 않는다)
// Soft check (reported): `--compile` runs `playwright test --list` (transpile only, no browser).
// Completion gate: `--require-grounded` hard-fails if any body step is still predicted (not `[실측]`).
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { tremoloRoot, resolveEsbuildDir, META_SUFFIX, helpersDir } from './tremolo_paths.mjs';
import { buildCodegen, loadCodegen } from './build_codegen.mjs';
import { loadFixtures as loadEnvFixtures } from './env.mjs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PLACEHOLDER_RE = /\b(TODO|FIXME|CHANGE_?ME|PLACEHOLDER|XXX)\b|example\.com|<[A-Z][A-Z0-9_]{2,}>/;

function loadFixtures() {
  // 접속 정보: assets/envs.json (scripts/env.mjs). 없거나 잘못되면 null → 환경 대조만 건너뜀.
  try { return loadEnvFixtures(); } catch { return null; }
}

function resolveTarget(target) {
  // Accept spec path or meta path; return { specPath, metaPath }.
  if (target.endsWith(META_SUFFIX)) return { metaPath: target, specPath: target.slice(0, -'.meta.json'.length) };
  if (target.endsWith('.spec.ts')) return { specPath: target, metaPath: target + '.meta.json' };
  throw new Error(`unsupported target (expected .spec.ts or ${META_SUFFIX}): ${target}`);
}

export async function verify(target, { compile = false, requireGrounded = false } = {}) {
  const root = tremoloRoot({ optional: true }); // standalone (built app, no source) supported
  const { specPath, metaPath } = resolveTarget(target);
  const results = []; // {name, ok, detail, soft}
  const add = (name, ok, detail = '', soft = false) => results.push({ name, ok, detail, soft });

  if (!fs.existsSync(metaPath)) throw new Error(`meta not found: ${metaPath}`);
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  const steps = meta.steps || [];
  const name = path.basename(specPath, '.spec.ts');

  await buildCodegen();
  const { generateSpecFromSteps, parseSpecToSteps } = loadCodegen();

  // 1. meta <-> spec sync
  const regen = generateSpecFromSteps(steps, name);
  if (fs.existsSync(specPath)) {
    const onDisk = fs.readFileSync(specPath, 'utf-8');
    add('meta<->spec sync', onDisk === regen,
      onDisk === regen ? '' : 'on-disk spec.ts differs from generate(meta.steps) — regenerate it');
  } else {
    add('meta<->spec sync', false, `spec file missing: ${specPath}`);
  }

  // 2. round-trip note (SOFT). Tremolo treats meta.json as the source of truth and regenerates
  // the spec from it, so parser idempotency is not required for correctness — it's only an
  // informational signal about how cleanly Tremolo's fallback parser reads the spec back.
  let stable = false, stableDetail = '';
  try {
    const reparsed = parseSpecToSteps(regen);
    const regen2 = generateSpecFromSteps(reparsed, name);
    stable = regen2 === regen;
    stableDetail = stable ? 'parser reads spec back identically' : 'parser not idempotent (normal for modal/xpath/antd steps; meta.json remains source of truth)';
  } catch (e) { stableDetail = 'parseSpecToSteps threw: ' + e.message; }
  add('round-trip note', stable, stableDetail, true);

  // 3. syntax (esbuild parses TS). A genuine esbuild diagnostic (e.errors[]) is a hard failure;
  // esbuild being unavailable / wrong-platform is a soft skip (generate already ran Tremolo's
  // codegen, whose output is well-formed by construction).
  try {
    const esbuild = require(resolveEsbuildDir());
    await esbuild.transform(regen, { loader: 'ts' });
    add('syntax (esbuild)', true, '');
  } catch (e) {
    if (e && Array.isArray(e.errors) && e.errors.length) {
      add('syntax (esbuild)', false, e.errors[0].text || 'syntax error');
    } else {
      add('syntax (esbuild)', true, 'skipped: esbuild unavailable here (' + (e.message || e) + ')', true);
    }
  }

  // 4. helper imports resolve
  const helperImports = [...regen.matchAll(/from '\.\.\/\.\.\/_helpers\/([A-Za-z0-9_]+)'/g)].map((m) => m[1]);
  const hdir = helpersDir(root);
  if (!hdir) {
    add('helper imports', true, `${helperImports.length} import(s); _helpers dir unknown (standalone) — confirm they exist in Tremolo`, true);
  } else {
    const missing = helperImports.filter((h) => !fs.existsSync(path.join(hdir, `${h}.ts`)));
    add('helper imports', missing.length === 0,
      missing.length ? `missing helper(s): ${missing.join(', ')}` : `${helperImports.length} helper import(s) OK`);
  }

  // 5. fixed info + no placeholders
  const fx = loadFixtures();
  const values = steps.map((s) => (typeof s.value === 'string' ? s.value : '')).join('\n');
  if (fx) {
    // 공개 tst 계정 정책: 비밀번호 대조/보안 검사는 하지 않는다. 현재 환경과 다른 환경용 시나리오일 수 있어 경고(soft)만.
    const hasGotoUrl = steps.some((s) => s.type === 'goto' && (s.value || '').startsWith(fx.env.baseUrl));
    const hasId = steps.some((s) => s.type === 'fill' && s.value === fx.account.id);
    add(`env match (${fx.env.key})`, true,
      hasGotoUrl && hasId ? '' : `현재 환경과 다름: goto=${hasGotoUrl} id=${hasId} — 다른 환경용이면 무시, 아니면 재생성`, !(hasGotoUrl && hasId));
  } else {
    add('env match', true, 'assets/envs.json 없음 — 환경 대조 건너뜀', true);
  }
  const placeholderHit = PLACEHOLDER_RE.exec(values) || PLACEHOLDER_RE.exec(regen);
  add('no leaked placeholders', !placeholderHit, placeholderHit ? `found "${placeholderHit[0]}"` : '');

  // 6. structure
  const structErrors = [];
  const ids = new Set();
  for (const s of steps) {
    if (ids.has(s.id)) structErrors.push(`dup id ${s.id}`); else ids.add(s.id);
    if (s.type === 'assert' && !(s.assertion && s.assertion.enabled)) structErrors.push(`${s.id}: assert not enabled`);
    if (s.type === 'assert' && !(s.target || (s.locator && s.locator !== '-'))) structErrors.push(`${s.id}: assert has no target/locator`);
    if (s.type === 'antdTableSelect' && !(s.antdTable?.match?.length)) structErrors.push(`${s.id}: empty antdTable.match`);
  }
  add('structure', structErrors.length === 0, structErrors.join('; '));

  // 6b. NO CONTINUE ON ASSERT. 목적은 '끝까지 도는 스크립트'가 아니라 TC 기대 결과 검증이다.
  // TC 기대와 실제가 다르면 그 assert 에서 실패해야 한다 — onFailure:"continue"(=사실상 pass 처리)는 금지.
  const contAsserts = steps.filter((s) => s.type === 'assert' && s.onFailure === 'continue');
  add('assert continue 금지 (TC 불일치는 실패로 남긴다)', contAsserts.length === 0,
    contAsserts.length ? `onFailure=continue 인 assert: ${contAsserts.slice(0, 8).map((s) => s.id).join(', ')} → "fail" 로 되돌릴 것` : '');

  // 6c. 자원 이름 규칙(2026-10-06): 스크립트가 만드는 자원은 'qa-trml-{yymmdd}' 를 포함해야 한다(실행일 기준 — 'qa-trml-{YYMMDD_HHMMSS}-<용도>'
  // + runtime.saveAs 별칭, 이후 스텝은 '{{별칭}}'). 구 규칙 이름(qa-auto-/pqa-auto-)·날짜 없는 qa-trml- 은 경고(soft).
  const vals = steps.filter((s) => (s.type === 'fill' || s.type === 'type') && typeof s.value === 'string');
  const oldNames = vals.filter((s) => /\bp?qa-auto-/i.test(s.value));
  const undated = vals.filter((s) => /qa-trml-/i.test(s.value) && !/qa-trml-(\{YYMMDD_HHMMSS\}|\d{6})/.test(s.value));
  if (oldNames.length || undated.length) {
    add('자원 이름 규칙 (qa-trml-{yymmdd})', true,
      [oldNames.length ? `구 규칙 이름(qa-auto-/pqa-auto-): ${oldNames.slice(0, 6).map((s) => s.id).join(', ')}` : '',
       undated.length ? `날짜 없는 qa-trml-: ${undated.slice(0, 6).map((s) => s.id).join(', ')}` : '']
        .filter(Boolean).join(' / ') + " → 'qa-trml-{YYMMDD_HHMMSS}-<용도>' + runtime.saveAs 별칭으로 교체", true);
  }

  // 7. GROUNDING GUARDRAIL. Selector-bearing steps must be LIVE-confirmed, because the same
  // "생성" form can differ by entry point (fields/steps change). We treat a step as grounded ONLY
  // if its note is stamped `[실측]` (set after a real live check, e.g. by scripts/live/ground.mjs).
  // Everything else — copied from a sample/pattern by prediction — is "predicted (미실측)" and must
  // be grounded before the scenario is considered done. Login-preamble + goto steps are exempt.
  const LOGIN_FIELD_NAMES = new Set(['아이디를 입력해 주세요', '비밀번호를 입력해 주세요', '인증 코드를 입력해 주세요']);
  // 대상이 있는 스텝 = target / locator 문자열 / 헬퍼 설정(antdTableSelect 의 antdTable.match, antdSelect 의 antd)으로 화면 요소를 찾는 스텝.
  // (antdTableSelect 는 locator "-" + antdTable.match 가 정상 형태 — 이것을 빼면 미실측 표 선택이 "전부 실측됨"으로 통과한다)
  const hasTarget = (s) => !!(s.target || (s.locator && s.locator !== '-')
    || (s.type === 'antdTableSelect' && s.antdTable?.match?.length) || (s.type === 'antdSelect' && s.antd));
  const isExempt = (s) => s.type === 'goto' || LOGIN_FIELD_NAMES.has(s.target?.name || '') || /^\s*\[실측\]\s*로그인/.test(s.note || '');
  const bodyTargets = steps.filter((s) => hasTarget(s) && !isExempt(s));
  const isGrounded = (s) => /^\s*\[실측\]/.test(s.note || '');
  const predicted = bodyTargets.filter((s) => !isGrounded(s));
  const groundedN = bodyTargets.length - predicted.length;
  const predList = predicted.slice(0, 8).map((s) => `${s.id}(${(s.title || s.type).slice(0, 22)})`).join(', ');
  add('grounding (실측 상태)',
    predicted.length === 0 || !requireGrounded,
    `${groundedN} 실측 / ${predicted.length} 예측(미실측)` +
      (predicted.length ? ` — 라이브 그라운딩 필요(ground.mjs): ${predList}${predicted.length > 8 ? ' …' : ''}` : ' — 전부 실측됨'),
    /* soft = */ !requireGrounded);

  // 8. LOCATOR RISK (strict-mode). Tremolo stamps exact:true on every step. Always-present landmark
  // roles (document/dialog/main/...) exist even when "hidden", so getByRole matches MANY → strict-mode
  // violation. Prefer getByText (content) or css for these. Flag them so the author switches locator.
  const RISKY_ROLES = new Set(['document', 'dialog', 'alertdialog', 'alert', 'main', 'banner',
    'navigation', 'contentinfo', 'region', 'article', 'list', 'group', 'paragraph', 'generic']);
  const risky = steps.filter((s) => s.target?.kind === 'role' && RISKY_ROLES.has(s.target.role));
  if (risky.length) {
    add('locator risk (role strict-mode)', true,
      `role=[${[...new Set(risky.map((s) => s.target.role))].join(', ')}]는 항상 존재하는 랜드마크 → getByRole 시 ` +
      `strict-mode 위반 위험. getByText(내용)/css 로 교체 권장: ${risky.slice(0, 6).map((s) => s.id).join(', ')}`, true);
  }

  // SOFT: Playwright-native compile check. `playwright test --list` transpiles the spec against
  // the repo's real config/imports and lists tests WITHOUT launching a browser — safe on staging.
  // Requires the file to be installed under data/scenarios (so testMatch picks it up).
  if (compile) {
    if (!root) {
      add('compile (playwright --list)', true, 'skipped: no Tremolo repo (standalone)', true);
    } else try {
      const { execFileSync } = await import('node:child_process');
      const rel = path.relative(root, specPath).split(path.sep).join('/');
      const underTestDir = rel.startsWith('data/scenarios/');
      if (!underTestDir) {
        add('compile (playwright --list)', true, 'skipped: run with generate.mjs --install so the spec sits under data/scenarios', true);
      } else {
        const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        execFileSync(npx, ['playwright', 'test', '--list', rel], { cwd: root, stdio: 'pipe' });
        add('compile (playwright --list)', true, 'transpiles & lists cleanly', true);
      }
    } catch (e) {
      const out = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
      add('compile (playwright --list)', false, out.split('\n').filter(Boolean).slice(0, 6).join('\n') || e.message, true);
    }
  }

  const hardFail = results.some((r) => !r.ok && !r.soft);
  return { name, results, ok: !hardFail };
}

// CLI: node verify.mjs <target...> [--compile]
if (process.argv[1]?.endsWith('verify.mjs')) {
  const targets = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const compile = process.argv.includes('--compile');
  const requireGrounded = process.argv.includes('--require-grounded');
  if (!targets.length) { console.error('usage: node verify.mjs <spec.ts|meta.json> [...] [--compile] [--require-grounded]'); process.exit(2); }
  let anyFail = false;
  for (const t of targets) {
    try {
      const { name, results, ok } = await verify(t, { compile, requireGrounded });
      console.log(`\n=== ${name} : ${ok ? 'PASS ✅' : 'FAIL ❌'} ===`);
      for (const r of results) {
        const icon = r.soft ? 'ℹ️ ' : (r.ok ? '✅' : '❌');
        console.log(`  ${icon} ${r.name}${r.detail ? '  — ' + r.detail : ''}`);
      }
      anyFail = anyFail || !ok;
    } catch (e) { console.error(`\n=== ${t} : ERROR — ${e.message}`); anyFail = true; }
  }
  process.exit(anyFail ? 1 : 0);
}
