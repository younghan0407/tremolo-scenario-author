// Generate a Tremolo-ready scenario (.spec.ts + .spec.ts.meta.json) from an authored
// "steps file". The steps file is the ONLY thing an author writes; everything Tremolo
// needs (scenarioPath, scenarioId, the spec text, updatedAt) is derived here.
//
// Steps file shape (JSON):
//   {
//     "name": "[컴퓨트]-[인스턴스]-[작업-콘솔접속]",   // becomes <name>.spec.ts
//     "solution": "CONTRABASS",                          // 생략 시 현재 환경(envs.json) 값
//     "version": "V4.0",                                 // 생략 시 현재 환경(envs.json) 값
//     "preamble": "login",                               // 기본값. 로그인 6스텝(s1~s6)을 현재 환경 값으로 자동 삽입
//                                                        //   false = 삽입 안 함(steps 에 직접 넣은 경우)
//     "steps": [ ...Step[]... ]                          // 로그인 이후 스텝만 작성 (s7 부터)
//   }
// 첫 스텝이 이미 goto 면 프리앰블을 넣지 않는다(기존 steps 파일 호환).
//
// Usage:
//   node generate.mjs <steps.json> [--env <key>] [--out <dir>] [--install]
//     --out      output root (default: <repo>/workspace_claude/output/scenarios)
//     --install  also copy the generated pair into <repo>/data/scenarios/<sol>/<ver>/
//     --no-carry 기존 meta 의 실측 스탬프를 이어받지 않음(기본은 같은 type+title(+순번) 스텝의 [실측]/[예측] note 보존 — 스텝 추가로 id 가 밀려도 유지)
import fs from 'fs';
import path from 'path';
import {
  tremoloRoot, makeScenarioStableId, tremoloScenarioPath, SPEC_SUFFIX, META_SUFFIX,
} from './tremolo_paths.mjs';
import { buildCodegen, loadCodegen } from './build_codegen.mjs';
import { loadFixtures, buildLoginPreamble } from './env.mjs';

function arg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? (process.argv[i + 1] ?? true) : def;
}

const ALLOWED_TYPES = new Set([
  'goto', 'fill', 'type', 'press', 'click', 'select', 'upload',
  'check', 'uncheck', 'scroll', 'assert', 'antdSelect', 'antdTableSelect',
]);

/** Minimal structural validation — catches the mistakes that make a scenario un-runnable. */
export function validateSteps(steps) {
  const errors = [];
  if (!Array.isArray(steps) || steps.length === 0) { errors.push('steps must be a non-empty array'); return errors; }
  const ids = new Set();
  steps.forEach((s, i) => {
    const at = `step[${i}] (${s?.id ?? '?'})`;
    if (!s || typeof s !== 'object') { errors.push(`${at}: not an object`); return; }
    if (!s.id) errors.push(`${at}: missing id`);
    else if (ids.has(s.id)) errors.push(`${at}: duplicate id "${s.id}"`);
    else ids.add(s.id);
    if (!ALLOWED_TYPES.has(s.type)) errors.push(`${at}: invalid type "${s.type}"`);
    if (typeof s.title !== 'string' || !s.title.trim()) errors.push(`${at}: missing title`);
    if (s.type === 'assert' && !(s.assertion && s.assertion.enabled)) {
      errors.push(`${at}: assert step must have assertion.enabled=true`);
    }
    if (s.type === 'antdTableSelect' && !(s.antdTable && Array.isArray(s.antdTable.match) && s.antdTable.match.length)) {
      errors.push(`${at}: antdTableSelect needs a non-empty antdTable.match`);
    }
    if ((s.type === 'goto' || s.type === 'fill' || s.type === 'press' || s.type === 'type') && (s.value == null)) {
      errors.push(`${at}: ${s.type} needs a value`);
    }
  });
  return errors;
}

export async function generate(stepsFile, { outDir, install = false, env, carry = true } = {}) {
  const root = tremoloRoot({ optional: true }); // standalone (built app, no source) supported
  const doc = JSON.parse(fs.readFileSync(stepsFile, 'utf-8'));
  const name = doc.name || path.basename(stepsFile).replace(/\.steps\.json$/i, '');
  let fx = null;
  try { fx = loadFixtures({ env }); } catch (e) { if (env) throw e; }
  const solution = doc.solution || fx?.env.solution || 'CONTRABASS';
  const version = doc.version || fx?.env.version || 'V3.0.6';
  let steps = doc.steps || [];
  const wantPreamble = doc.preamble !== false && steps[0]?.type !== 'goto';
  if (wantPreamble) {
    if (!fx) throw new Error('로그인 프리앰블 자동 삽입에 assets/envs.json 이 필요합니다 (또는 steps.json 에 "preamble": false).');
    steps = [...buildLoginPreamble(fx), ...steps];
  }

  const errors = validateSteps(steps);
  if (errors.length) {
    throw new Error(`Invalid steps in ${path.basename(stepsFile)}:\n  - ${errors.join('\n  - ')}`);
  }

  const scenarioPath = tremoloScenarioPath(root, solution, version, name); // in-repo canonical path
  const scenarioId = makeScenarioStableId(solution, version, name);
  const meta = { scenarioPath, scenarioId, steps, updatedAt: new Date().toISOString() };

  const outRoot = outDir
    || (root ? path.join(root, 'workspace_claude', 'output', 'scenarios') : path.join(process.cwd(), 'tremolo-scenarios'));
  const destDir = path.join(outRoot, solution, version);
  fs.mkdirSync(destDir, { recursive: true });
  const specOut = path.join(destDir, `${name}${SPEC_SUFFIX}`);
  const metaOut = path.join(destDir, `${name}${META_SUFFIX}`);

  // 재생성 시 실측 스탬프 보존: 기존 meta 에서 같은 type+title(+같은 제목 중 순번) 스텝의 note([실측]/[예측]…)를 이어받는다.
  // (steps 파일에는 스탬프가 없어서, 그대로 재생성하면 ground 결과가 지워지던 문제 방지. --no-carry 로 끔)
  let carried = 0, invalidated = 0;
  if (carry && fs.existsSync(metaOut)) {
    // id 가 아니라 '제목 + 같은 제목의 몇 번째' 로 맞춘다 → 중간에 스텝을 넣거나 빼서 id 가 밀려도 스탬프가 따라감
    const stamped = (n) => /^\s*\[(실측|예측)\][^—]*\d{4}-\d{2}-\d{2}/.test(n || ''); // ground 가 찍은 날짜 스탬프
    const key = (s, k) => `${s.type}|${s.title}|${k}`;
    const occ = new Map(); const old = new Map();
    for (const s of JSON.parse(fs.readFileSync(metaOut, 'utf-8')).steps) {
      const k = (occ.get(s.title) || 0) + 1; occ.set(s.title, k); old.set(key(s, k), s);
    }
    occ.clear();
    for (const s of steps) {
      const k = (occ.get(s.title) || 0) + 1; occ.set(s.title, k);
      const o = old.get(key(s, k));
      // 실행 의미(대상·입력값·검증 조건·선택 설정)가 바뀐 스텝은 예전 실측 증거를 이어받지 않는다 → [예측] 으로 돌아가 재실측 대상이 된다.
      if (o && stamped(o.note) && !stamped(s.note) && stepSemantics(o) !== stepSemantics(s)) { invalidated++; continue; }
      // finalize 처럼 meta 의 스탬프를 steps 로 복사한 뒤 재생성하는 경로도 같은 규칙: 복사된 스탬프인데 내용이 바뀌었으면 무효화.
      if (o && stamped(s.note) && stamped(o.note) && s.note.split('—')[0] === o.note.split('—')[0] && stepSemantics(o) !== stepSemantics(s)) {
        s.note = `[예측] 내용 변경 ${new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)} — 이전 실측 무효(대상·값·검증 조건 변경), 재실측 필요; ${s.note.replace(/^\s*\[(실측|예측)\][^—]*—?\s*/, '')}`;
        invalidated++; continue;
      }
      if (o && stamped(o.note) && !stamped(s.note)) {
        // 스탬프는 이어받되 끝의 'TC <id,...>' 매핑은 새 steps 기준으로 교체(매핑 수정이 묻히지 않게)
        const tcRe = /\s*TC (?:[A-Z]+-[A-Z]+-\d+,?)+\s*$/;
        const newTc = (s.note || '').match(tcRe);
        s.note = o.note.replace(tcRe, '') + (newTc ? newTc[0] : '');
        carried++;
      }
    }
  }

  await buildCodegen();
  const { generateSpecFromSteps } = loadCodegen();
  const specText = generateSpecFromSteps(steps, name);
  fs.writeFileSync(specOut, specText, 'utf-8');
  fs.writeFileSync(metaOut, JSON.stringify({ ...meta, steps }, null, 2), 'utf-8');

  let installed = null;
  if (install) {
    const dir = path.dirname(scenarioPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(specOut, scenarioPath);
    fs.copyFileSync(metaOut, scenarioPath + '.meta.json');
    installed = scenarioPath;
  }
  return { name, solution, version, specOut, metaOut, installed, stepCount: steps.length, carried, invalidated };
}

/** 스텝의 실행 의미(실측 증거가 유효한 범위). note·title·id·timeout 등 표기·운영 값은 제외. 키 순서 무관. */
export function stepSemantics(s) {
  const pick = { type: s.type, target: s.target, value: s.value, assertion: s.assertion, antd: s.antd,
    antdTable: s.antdTable, upload: s.upload, runtime: s.runtime?.saveAs ? { saveAs: s.runtime.saveAs } : undefined,
    locator: s.target ? undefined : s.locator };
  const norm = (v) => (Array.isArray(v) ? v.map(norm) : v && typeof v === 'object'
    ? Object.fromEntries(Object.keys(v).sort().filter((k) => v[k] !== undefined && v[k] !== null).map((k) => [k, norm(v[k])])) : v);
  return JSON.stringify(norm(pick));
}

// CLI
if (process.argv[1]?.endsWith('generate.mjs')) {
  const stepsFile = process.argv[2];
  if (!stepsFile || stepsFile.startsWith('--')) {
    console.error('usage: node generate.mjs <steps.json> [--env <key>] [--out <dir>] [--install]');
    process.exit(2);
  }
  const outDir = arg('--out', undefined);
  const install = process.argv.includes('--install');
  const env = arg('--env', undefined);
  generate(stepsFile, { outDir: typeof outDir === 'string' ? outDir : undefined, install, env: typeof env === 'string' ? env : undefined, carry: !process.argv.includes('--no-carry') })
    .then((r) => {
      console.log(`[generate] ${r.name}  (${r.stepCount} steps${r.carried ? `, 실측 스탬프 ${r.carried}개 보존` : ''}${r.invalidated ? `, 내용이 바뀐 스텝 ${r.invalidated}개는 실측 무효화(재실측 필요)` : ''})`);
      console.log(`  spec: ${r.specOut}`);
      console.log(`  meta: ${r.metaOut}`);
      if (r.installed) console.log(`  installed -> ${r.installed}`);
      if (fs.readFileSync(r.metaOut, 'utf-8').includes('__OTP__'))
        console.warn('  ⚠ 랜덤 OTP 환경: 로그인 MFA 값이 자리표시자(__OTP__) — Tremolo 에서 그대로 실행 불가(실행 시마다 OTP 수동 입력 필요)');
    })
    .catch((e) => { console.error('[generate] FAILED:', e.message); process.exit(1); });
}
