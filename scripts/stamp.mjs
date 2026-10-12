#!/usr/bin/env node
// stamp.mjs — 실측 후 사람이 판정한 결과를 note 에 표기한다(meta + steps 파일 동시, 이후 generate 시 보존됨).
//
//   mismatch : TC 기대 요소/상태가 실제 화면과 다름(예: TC '비활성' ↔ 실측 '미노출'). assert 는 TC 기대 그대로 둔다
//              (onFailure 는 fail 유지 — continue/pass 처리 금지). 보고서의 'TC 불일치' 목록이 된다.
//   data     : --subst 대체 자원의 값/상태 차이로 판정 불가 → [예측](미판정)으로 되돌린다.
//
// Usage:
//   node scripts/stamp.mjs mismatch "<spec.ts|meta.json>" s20,s38 ["실측 내용(예: 항목 숨김)"] [--steps <name>.steps.json]
//   node scripts/stamp.mjs data     "<spec.ts|meta.json>" s26,s29 ["대체 자원명"]          [--steps <name>.steps.json]
// 끝나면 generate 로 재생성(스탬프 보존) → verify.
import fs from 'fs';

const [mode, target, idsArg, reason = ''] = process.argv.slice(2).filter((a, i, arr) => !a.startsWith('--') && arr[i - 1] !== '--steps');
const si = process.argv.indexOf('--steps');
const stepsFile = si >= 0 ? process.argv[si + 1] : null;
if (!['mismatch', 'data'].includes(mode) || !target || !idsArg) {
  console.error('usage: node scripts/stamp.mjs <mismatch|data> "<spec.ts|meta.json>" s1,s2 ["사유"] [--steps <file>]');
  process.exit(2);
}
const metaPath = target.endsWith('.meta.json') ? target : target + '.meta.json';
const ids = new Set(idsArg.split(',').map((s) => s.trim()).filter(Boolean));
const day = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10); // 로컬 날짜
const tcs = (n) => [...new Set(String(n || '').match(/UNT-[A-Z]+-\d+|TC[-_ ]?\d+/g) || [])];

function apply(file, indent) {
  const doc = JSON.parse(fs.readFileSync(file, 'utf-8'));
  let n = 0;
  for (const s of doc.steps) {
    if (!ids.has(s.id)) continue;
    const tc = tcs(s.note);
    const tcPart = tc.length ? `; TC ${tc.join(',')}` : '';
    if (mode === 'mismatch') {
      s.note = `[실측] ${day} 화면 확인, 상태 불일치(TC 기대 ≠ 실측${reason ? ': ' + reason : ''}) — TC 기대 그대로 유지(실패로 보고)${tcPart}`;
      if (s.onFailure === 'continue') s.onFailure = 'fail';
    } else {
      s.note = `[예측] 대체 리소스${reason ? '(' + reason + ')' : ''} 값/상태 차이로 판정 불가 ${day} — 시나리오 자원으로 1회 실행 확인${tcPart}`;
    }
    n++;
  }
  fs.writeFileSync(file, JSON.stringify(doc, null, indent), 'utf-8');
  return n;
}

const n = apply(metaPath, 2);
if (stepsFile) apply(stepsFile, 1);
console.log(`[stamp] ${mode}: ${n}개 스텝 표기 (${[...ids].join(', ')}) → ${metaPath}${stepsFile ? ' + ' + stepsFile : ''}`);
if (n !== ids.size) console.warn('[stamp] 일부 id 를 찾지 못함 — id 확인');
