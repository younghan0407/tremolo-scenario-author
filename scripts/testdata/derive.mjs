// derive.mjs — read a TestData catalog and DERIVE EP/BVA scenarios (steps.json), then optionally
// generate + statically verify each. No login/browser needed to derive/generate/verify; the login
// preamble (assets/envs.json) only runs when the scenario is later executed.
//
// Only cases with a concrete, live-grounded expectation are emitted:
//   - reject case: needs `assertText` (the exact validation message) — assert it is VISIBLE.
//   - pass case  : assert every known validation message for that option is HIDDEN (deterministic,
//                  no submit). Requires option.messages.
// Cases whose assertText is still "TBD…" are skipped (not yet grounded) and reported.
//
// Usage:
//   node scripts/testdata/derive.mjs <catalog.json> [--option <id>] [--generate] [--verify]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { tremoloRoot } from '../tremolo_paths.mjs';
import { generate } from '../generate.mjs';
import { verify } from '../verify.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { buildLoginPreamble } from '../env.mjs';
const PRE = buildLoginPreamble(); // 현재 환경(envs.json) 값으로 만든 로그인 프리앰블
const arg = (f, d) => { const i = process.argv.indexOf(f); return i >= 0 ? (process.argv[i + 1] ?? true) : d; };
const isTBD = (s) => typeof s === 'string' && /TBD/i.test(s);

const clickText = (id, t, title) => ({ id, type: 'click', title: title || `${t} 클릭`, locator: `text="${t}"`, value: '-',
  timeout: 15000, waitCondition: 'visible', screenshot: 'on_failure', onFailure: 'fail', retry: { enabled: false, count: 3 },
  assertion: { enabled: false, inputValue: '', expected: '', componentType: 'text', state: '' }, note: '', target: { kind: 'text', text: t, exact: true } });
const clickBtn = (id, t) => ({ id, type: 'click', title: `${t} 클릭`, locator: `role=button[name="${t}"]`, value: '-',
  timeout: 15000, waitCondition: 'visible', screenshot: 'on_failure', onFailure: 'fail', retry: { enabled: false, count: 3 },
  assertion: { enabled: false, inputValue: '', expected: '', componentType: 'button', state: '' }, note: '', target: { kind: 'role', role: 'button', name: t, exact: true } });
const fillField = (id, field, val) => ({ id, type: 'fill', title: `${field.name} 입력`, locator: `role=${field.type}[name="${field.name}"]`, value: val,
  timeout: 15000, waitCondition: 'visible', screenshot: 'on_failure', onFailure: 'fail', retry: { enabled: false, count: 3 },
  assertion: { enabled: false, inputValue: '', expected: '', componentType: field.type, state: '' }, note: '',
  target: { kind: 'role', role: field.type, name: field.name, exact: true } });
const assertVisible = (id, t, note) => ({ id, type: 'assert', title: `검증 메시지 노출`, locator: `text="${t}"`, value: 'toBeVisible()',
  timeout: 15000, waitCondition: 'visible', screenshot: 'on_failure', onFailure: 'fail', retry: { enabled: false, count: 3 },
  assertion: { enabled: true, kind: 'visible', inputValue: '', expected: '', componentType: 'text', state: 'visible' }, note, target: { kind: 'text', text: t, exact: true } });
const assertHidden = (id, t, note) => ({ id, type: 'assert', title: `검증 메시지 미노출`, locator: `text="${t}"`, value: 'toBeHidden()',
  timeout: 15000, waitCondition: 'hidden', screenshot: 'on_failure', onFailure: 'fail', retry: { enabled: false, count: 3 },
  assertion: { enabled: true, kind: 'hidden', inputValue: '', expected: '', componentType: 'text', state: 'hidden' }, note, target: { kind: 'text', text: t, exact: true } });

function sanitize(s) { return s.replace(/[\\/:*?"<>|]/g, '_').trim(); }

function casesForOption(opt) {
  const out = [];
  for (const e of opt.equivalence || []) {
    if (e.expect === 'reject' && !isTBD(e.assertText) && e.assertText) out.push({ label: `${opt.id}-${e.class}`, value: e.example, reject: e.assertText });
    else if (e.expect === 'pass') out.push({ label: `${opt.id}-${e.class}`, value: e.example, pass: true });
  }
  for (const b of opt.boundary || []) {
    if (b.expect === 'reject' && !isTBD(b.assertText) && b.assertText) out.push({ label: `${opt.id}-${b.name}`, value: b.value, reject: b.assertText });
    else if (b.expect === 'pass') out.push({ label: `${opt.id}-${b.name}`, value: b.value, pass: true });
  }
  return out;
}

async function main() {
  const catalogPath = process.argv[2];
  if (!catalogPath || catalogPath.startsWith('--')) { console.error('usage: node derive.mjs <catalog.json> [--option id] [--generate] [--verify]'); process.exit(2); }
  const cat = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  const onlyOpt = arg('--option', null);
  const doGen = process.argv.includes('--generate');
  const doVerify = process.argv.includes('--verify');
  const navParts = String(cat.nav || '').split('>').map((s) => s.trim()).filter(Boolean);
  const prefix = `[${navParts.join(']-[')}]`; // e.g. [컴퓨트]-[인스턴스]

  const root = tremoloRoot({ optional: true }); // standalone (no Tremolo source) supported
  const derivedDir = root
    ? path.join(root, 'workspace_claude', 'output', 'testdata', 'derived')
    : path.join(process.cwd(), 'tremolo-scenarios', 'testdata', 'derived');
  fs.mkdirSync(derivedDir, { recursive: true });

  const opts = (cat.options || []).filter((o) => (!onlyOpt || o.id === onlyOpt)
    && o.field && (o.field.type === 'textbox' || o.field.type === 'spinbutton')
    && ((o.equivalence || []).length || (o.boundary || []).length));

  const summary = { emitted: [], skipped: [], verified: [], failed: [] };
  for (const opt of opts) {
    for (const c of casesForOption(opt)) {
      const scenarioName = sanitize(`${prefix}-[생성-${c.label}]`);
      let sid = 8;
      const steps = [...PRE];
      for (const p of navParts) steps.push(clickText(`s${sid++}`, p));
      if (cat.openAction) steps.push(clickBtn(`s${sid++}`, cat.openAction));
      steps.push(fillField(`s${sid++}`, opt.field, c.value));
      if (c.reject) {
        steps.push(assertVisible(`s${sid++}`, c.reject, `derived:invalid ${opt.id}; live-grounded msg`));
      } else if (c.pass) {
        const msgs = Object.values(opt.messages || {});
        if (!msgs.length) { summary.skipped.push(`${scenarioName} (pass 케이스지만 messages 없음 → 결정적 assert 불가)`); continue; }
        for (const m of msgs) steps.push(assertHidden(`s${sid++}`, m, `derived:valid ${opt.id}; 에러 미노출 확인`));
      }
      const stepsFile = path.join(derivedDir, `${scenarioName}.steps.json`);
      fs.writeFileSync(stepsFile, JSON.stringify({ name: scenarioName, solution: cat.solution || 'CONTRABASS', version: cat.version || 'V3.0.6', steps }, null, 2), 'utf-8');
      summary.emitted.push(scenarioName);
      if (doGen) {
        const r = await generate(stepsFile, {});
        if (doVerify) {
          const v = await verify(r.specOut, {});
          (v.ok ? summary.verified : summary.failed).push(scenarioName);
        }
      }
    }
  }
  console.log(`[derive] emitted ${summary.emitted.length} case(s)` + (doVerify ? `, verified ${summary.verified.length}, failed ${summary.failed.length}` : ''));
  summary.emitted.forEach((n) => console.log('  •', n));
  if (summary.skipped.length) { console.log('[derive] skipped (미실측/불가):'); summary.skipped.forEach((s) => console.log('  -', s)); }
  if (summary.failed.length) { console.log('[derive] FAILED verify:'); summary.failed.forEach((s) => console.log('  ✗', s)); process.exitCode = 1; }
}
main().catch((e) => { console.error('[derive] FAILED:', e.message); process.exit(1); });
