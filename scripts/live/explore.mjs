// explore.mjs — 화면 탐색기. 다단계 폼/마법사를 **제출(생성/저장/삭제) 없이** 순회하며 각 단계의
// 요소(필수/선택 · 타입 · 옵션 · 제약)를 수집해 testdata 카탈로그(<name>.explore.json)로 만든다.
// TC가 조건을 다 정의하지 않는 복잡 폼(예: 로드밸런서 5단계)에서, "무엇이 입력 가능한지"를 먼저 파악해
// propose.mjs로 일반 QA 관점 후보 케이스를 뽑기 위한 입력이다.
//
// 안전: '다음/Next' 만 눌러 단계를 넘기고, '생성/저장/삭제/확인' 류(CUD 확정)는 **절대 누르지 않는다**.
//
// Usage (Windows, 로그인 후):
//   node scripts/live/explore.mjs --url <create URL> --name load-balancer [--max-steps 6] [--open-selects]
//   node scripts/live/explore.mjs --nav "VPC>로드밸런서" --open "add 생성" --name load-balancer
import fs from 'fs';
import path from 'path';
import { tremoloRoot } from '../tremolo_paths.mjs';
import { launch, login, navigateMenu } from './lib.mjs';

const arg = (f, d) => { const i = process.argv.indexOf(f); return i >= 0 ? (process.argv[i + 1] ?? true) : d; };
const has = (f) => process.argv.includes(f);
const NEXT = ['다음', 'Next', '다음 단계'];
const SUBMIT = ['생성', '저장', '삭제', '확인', '수정', '적용', 'add 생성']; // 절대 클릭 금지

// 페이지 안에서 현재 화면의 form-item 필드를 수집 (필수/선택·타입·옵션·제약)
async function captureFields(page, openSelects) {
  const fields = await page.evaluate(() => {
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
    return [...document.querySelectorAll('.ant-form-item')].map((fi) => {
      let label = norm(fi.querySelector('.ant-form-item-label')?.innerText);
      const required = !!fi.querySelector('.ant-form-item-required, [class*="required"]') || /\*\s*$/.test(label);
      label = label.replace(/\s*\*\s*$/, '');
      const sel = fi.querySelector('.ant-select');
      const sw = fi.querySelector('[role="switch"]');
      const radios = [...fi.querySelectorAll('input[type=radio]')];
      const cbs = [...fi.querySelectorAll('input[type=checkbox]')];
      const num = fi.querySelector('input[type=number],[role="spinbutton"]');
      const txt = fi.querySelector('input[type=text],input:not([type])');
      const ta = fi.querySelector('textarea');
      const table = fi.querySelector('.ant-table');
      let type = '', id = '', options = [], constraints = {}, placeholder = '';
      if (sel) { type = 'select'; id = (sel.querySelector('input') || {}).id || ''; }
      else if (sw) { type = 'switch'; constraints.checked = sw.getAttribute('aria-checked'); }
      else if (radios.length) { type = 'radio'; options = radios.map((r) => norm(r.closest('label')?.innerText)).filter(Boolean); }
      else if (cbs.length) { type = 'checkbox'; options = cbs.map((r) => norm(r.closest('label')?.innerText)).filter(Boolean); }
      else if (num) { type = 'number'; placeholder = num.placeholder || ''; constraints = { min: num.getAttribute('aria-valuemin'), max: num.getAttribute('aria-valuemax') }; }
      else if (txt) { type = 'textbox'; placeholder = txt.placeholder || ''; if (txt.maxLength > 0) constraints.maxLength = txt.maxLength; }
      else if (ta) { type = 'textarea'; placeholder = ta.placeholder || ''; }
      else if (table) { type = 'table'; }
      if (!label && !type) return null;
      return { label, required, type, id, placeholder, options, constraints };
    }).filter(Boolean);
  });
  // 선택형(select)은 옵션이 열어야 보인다. --open-selects면 각 select를 열어 옵션 수집.
  if (openSelects) {
    for (const f of fields.filter((x) => x.type === 'select' && x.id)) {
      try {
        await page.locator(`#${f.id}`).click({ timeout: 4000 });
        await page.waitForTimeout(300);
        f.options = await page.evaluate(() => [...document.querySelectorAll('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')]
          .map((e) => ({ text: (e.textContent || '').trim(), disabled: e.getAttribute('aria-disabled') === 'true' || /disabled/.test(e.className) })));
        await page.keyboard.press('Escape').catch(() => {});
      } catch { /* leave options empty */ }
    }
  }
  return fields;
}

async function main() {
  const name = String(arg('--name', 'explore-' + Date.now()));
  const url = arg('--url', undefined);
  const nav = arg('--nav', undefined);
  const openBtn = arg('--open', undefined);
  const maxSteps = Number(arg('--max-steps', 8));
  const openSelects = has('--open-selects');
  const { browser, context, page } = await launch({ headless: has('--headless') });
  const steps = [];
  try {
    if (!has('--no-login') && !url) await login(page);
    if (url) await page.goto(String(url), { timeout: 30000 });
    if (nav) await navigateMenu(page, nav);
    if (openBtn) { await page.getByRole('button', { name: new RegExp(`^\\s*${openBtn}\\s*$`) }).first().click({ timeout: 15000 }); await page.waitForTimeout(1000); }

    for (let i = 0; i < maxSteps; i += 1) {
      await page.waitForTimeout(600);
      const stepName = await page.evaluate(() => {
        const active = document.querySelector('.ant-steps-item-active, .ant-steps-item-process');
        return (active?.innerText || document.querySelector('h1,h2,.ant-modal-title')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      });
      const fields = await captureFields(page, openSelects);
      steps.push({ index: i + 1, stepName, fields });
      // 다음 버튼(활성)만 클릭해 진행. 없으면 마지막 단계 → 여기서 멈춘다(생성 금지).
      const next = page.getByRole('button', { name: new RegExp(`^\\s*(${NEXT.join('|')})\\s*$`) });
      const canNext = await next.first().isEnabled().catch(() => false);
      if (!canNext) break;
      await next.first().click({ timeout: 10000 }).catch(() => {});
    }

    const out = { function: name, url: page.url(), capturedAt: new Date().toISOString(),
      note: '제출(CUD) 없이 탐색만 수행. select 옵션은 --open-selects 시에만 채워짐.',
      steps };
    const root = tremoloRoot({ optional: true });
    const dir = path.join(root || process.cwd(), root ? 'workspace_claude/output/testdata/explore' : 'testdata/explore');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${name}.explore.json`);
    fs.writeFileSync(file, JSON.stringify(out, null, 2), 'utf-8');
    console.log(`[explore] ${name}: ${steps.length} step(s), ${steps.reduce((n, s) => n + s.fields.length, 0)} field(s) → ${file}`);
    for (const s of steps) console.log(`  [${s.index}] ${s.stepName}: ` + s.fields.map((f) => `${f.label}${f.required ? '*' : ''}(${f.type})`).join(', '));
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}
main().catch((e) => { console.error('[explore] FAILED:', e.message); process.exit(1); });
