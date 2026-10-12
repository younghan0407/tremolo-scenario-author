#!/usr/bin/env node
// setup.mjs — 팀 배포용 원커맨드 셋업. 처음 받은 사람이 이것만 실행하면 준비가 끝나도록 자동화한다.
//   node setup.mjs            (권장)  또는  npm run setup
//
// 하는 일(각 단계는 실패해도 다음으로 진행하고, 끝에 요약 + 남은 수동 작업을 안내):
//   1) Node 18+ 확인
//   2) npm install            → Playwright(npm 패키지) 설치  ※ 코드젠은 vendor에 번들돼 별도 빌드 불필요
//   3) npx playwright install chromium  → 브라우저 1회 다운로드(~150MB, OS별이라 zip에 못 넣음)
//   4) 접속 정보(assets/envs.json) 상태 점검 — 공용 계정 YOUR_ACCOUNT_ID, 편집은 `node scripts/env.mjs`
//   5) (선택) pip install openpyxl  → 결과 로거용(실패해도 무시)
//   6) 자가검증(headless) 시도 → 메커니즘 OK 확인
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const ok = []; const warn = []; const todo = [];
const run = (cmd, opts = {}) => spawnSync(cmd, { cwd: dir, stdio: 'inherit', shell: true, ...opts });
const line = (s) => console.log(s);

line('\n=== Tremolo 시나리오 하네스 · 셋업 ===\n');

// 1) Node 18+
const major = Number(process.versions.node.split('.')[0]);
if (major >= 18) ok.push(`Node ${process.versions.node}`);
else { warn.push(`Node ${process.versions.node} — 18+ 필요`); todo.push('Node.js 18+ 설치 후 다시 실행: https://nodejs.org'); }

// 2) npm install (Playwright)
line('[1/5] npm install (Playwright 설치)…');
if (run('npm install').status === 0) ok.push('npm install (Playwright 패키지)');
else { warn.push('npm install 실패'); todo.push('인터넷/프록시 확인 후 `npm install` 재시도'); }

// 3) chromium 브라우저(1회 다운로드)
line('\n[2/5] npx playwright install chromium (브라우저 1회 다운로드, ~150MB)…');
if (run('npx playwright install chromium').status === 0) ok.push('chromium 브라우저');
else { warn.push('chromium 설치 실패'); todo.push('`npx playwright install chromium` 재시도(사내망은 프록시 필요할 수 있음)'); }

// 4) 접속 정보(assets/envs.json) — 배포본에 포함됨. 비어 있는 값만 안내.
line('\n[3/5] 접속 정보(assets/envs.json) 점검…');
try {
  const { loadFixtures, missingSettings } = await import('./scripts/env.mjs');
  const fx = loadFixtures();
  const miss = missingSettings(fx);
  if (miss.length) { warn.push('envs.json 설정 누락'); miss.forEach((m) => todo.push(m)); }
  else ok.push(`envs.json (${fx.env.key} · ${fx.account.id})`);
} catch (e) { warn.push('envs.json 읽기 실패: ' + e.message); todo.push('assets/envs.json 확인 (node scripts/env.mjs)'); }

// 5) (선택) openpyxl
line('\n[4/5] (선택) Python openpyxl (결과 로거용)…');
const py = ['python3', 'python'].find((p) => spawnSync(p, ['--version'], { shell: true }).status === 0);
if (py && run(`${py} -m pip install --quiet openpyxl`).status === 0) ok.push('openpyxl');
else warn.push('openpyxl 미설치(선택) — 워크북 커버리지 로거만 영향');

// 6) 자가검증(headless)
line('\n[5/5] 브라우저 메커니즘 자가검증(headless)…');
const st = run('node scripts/live/__selftest__/run.mjs');
if (st.status === 0) ok.push('자가검증(브라우저 메커니즘)');
else warn.push('자가검증 실패 — chromium 설치/네트워크 확인 후 `npm run selftest`');

// 요약
line('\n──────── 셋업 요약 ────────');
line('✅ 완료: ' + (ok.join(' · ') || '없음'));
if (warn.length) line('⚠️  경고: ' + warn.join(' · '));
line('\n📌 남은 수동 작업:');
if (todo.length) todo.forEach((t, i) => line(`  ${i + 1}. ${t}`));
else line('  없음 — 바로 사용 가능');
line('\n다음: `node scripts/env.mjs` 로 환경 확인(전환: env.mjs use <키>) → `node scripts/generate.mjs <name>.steps.json` → `node scripts/verify.mjs <spec>`');
line('신규 스크립트는 라이브 실측 필수: `node scripts/live/ground.mjs "<spec>" --write` → `verify --require-grounded`\n');
process.exit(warn.some((w) => /Node .* 18/.test(w)) ? 1 : 0);
