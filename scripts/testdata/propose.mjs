// propose.mjs — explore.json(탐색 catalog)을 읽어 **일반 QA 관점**의 후보 테스트 케이스를 뽑는다.
// TC가 조건을 다 정의하지 않는 폼에서도, 화면에서 수집한 필수/선택·옵션·제약을 조합해
// "이런 케이스들을 스크립트로 만들까요?"를 사용자에게 제안하기 위한 목록을 만든다(= 묻는 로직의 입력).
//
// 만드는 후보(일반 QA 원칙):
//   1) 필수값 누락      — 필수 필드별 1건 (omit → '필수 입력/선택 값입니다.' 검증)         [안전·비변경]
//   2) 옵션 동등분할     — radio/select 옵션별 1건 (선택 + 노출/활성 확인)                    [비변경, 옵션 수집돼야]
//   3) 경계값분석        — number/길이제약 필드별 min/max/±1                                  [비변경·검증]
//   4) 정상 생성(해피)  — 모든 필수 유효 → 제출(CUD 변경) — opt-in, teardown 필요           [변경 ⚠]
//
// 각 후보에는 mutating(변경 여부)·confidence·why(근거)·need(추가 실측 필요)를 붙여 정직하게 제시한다.
//
// Usage:
//   node scripts/testdata/propose.mjs <explore.json> [--json]      # 사람이 볼 요약(기본) / --json은 기계용
import fs from 'fs';

const file = process.argv[2];
const asJson = process.argv.includes('--json');
if (!file || !fs.existsSync(file)) {
  console.error('usage: node propose.mjs <explore.json> [--json]');
  process.exit(1);
}
const cat = JSON.parse(fs.readFileSync(file, 'utf-8'));
const fn = cat.function || 'function';
const steps = cat.steps || [];
const cand = [];
const push = (c) => cand.push({ mutating: false, confidence: 'med', need: null, ...c });

for (const st of steps) {
  const stepTag = steps.length > 1 ? `[${st.index}.${(st.stepName || '').replace(/\s+/g, '') || '단계'}] ` : '';
  for (const f of st.fields || []) {
    const L = f.label || '(무라벨)';
    // 1) 필수값 누락
    if (f.required && ['textbox', 'textarea', 'select', 'radio'].includes(f.type)) {
      const msg = (f.type === 'select' || f.type === 'radio') ? '필수 선택 값입니다.' : '필수 입력 값입니다.';
      push({ kind: 'required-missing', name: `${fn}-${L}-필수값 누락`,
        covers: `${stepTag}${L} 미입력 → '${msg}'`, why: `필수 필드`, confidence: 'high' });
    }
    // 2) 옵션 EP (옵션이 수집된 radio/select만; select는 --open-selects 필요)
    const opts = (f.options || []).map((o) => (typeof o === 'string' ? { text: o, disabled: false } : o)).filter((o) => o.text);
    if (['radio', 'select', 'checkbox'].includes(f.type) && opts.length) {
      for (const o of opts) {
        push({ kind: 'option-ep', name: `${fn}-${L}-${o.text}`,
          covers: `${stepTag}${L}=${o.text} 선택 (노출/활성 확인)${o.disabled ? ' [현재 비활성]' : ''}`,
          why: `동등분할`, mutating: false, confidence: o.disabled ? 'low' : 'med' });
      }
    } else if (['radio', 'select'].includes(f.type)) {
      push({ kind: 'option-ep', name: `${fn}-${L}-옵션 동등분할`, covers: `${stepTag}${L} 옵션별 선택`,
        why: `동등분할`, confidence: 'low', need: 'explore --open-selects 로 옵션 수집 필요' });
    }
    // 3) BVA (number 제약 or 길이 maxLength)
    if (f.type === 'number') {
      const { min, max } = f.constraints || {};
      const b = [];
      if (min != null) { b.push(`${min}`, `${Number(min) - 1}`); }
      if (max != null) { b.push(`${max}`, `${Number(max) + 1}`); }
      push({ kind: 'bva', name: `${fn}-${L}-경계값`, covers: `${stepTag}${L} 경계값${b.length ? ' ' + b.join('/') : ''} (정수/범위 검증)`,
        why: `경계값분석`, confidence: b.length ? 'med' : 'low', need: b.length ? null : 'min/max 미상 — 실측 필요' });
    }
    if ((f.constraints || {}).maxLength) {
      const m = f.constraints.maxLength;
      push({ kind: 'bva', name: `${fn}-${L}-길이 경계값`, covers: `${stepTag}${L} 길이 ${m}/${m + 1} (maxLength=${m})`, why: `길이 경계값분석`, confidence: 'med' });
    }
  }
}
// 4) 정상 생성(해피패스) — 변경(CUD). 모든 필수가 텍스트/단순이면 자동, 아니면 실측 필요 표시.
const allReq = steps.flatMap((s) => (s.fields || []).filter((f) => f.required).map((f) => ({ ...f, step: s.index })));
push({ kind: 'happy', name: `${fn}-정상 생성`, mutating: true, confidence: 'med',
  covers: `모든 필수(${allReq.map((f) => f.label).filter(Boolean).join(', ') || '?'}) 유효 입력 → 생성 → 성공 토스트 → teardown(삭제)`,
  why: `정상 흐름 E2E`, need: `⚠ 실제 자원 생성/삭제. qa-trml-{YYMMDD_HHMMSS}- 이름(+runtime.saveAs 별칭) + teardown 필수. 세그먼트/서브넷 등 선택형은 값 지정 필요` });

// 요약 통계
const byKind = cand.reduce((m, c) => ((m[c.kind] = (m[c.kind] || 0) + 1), m), {});
if (asJson) {
  console.log(JSON.stringify({ function: fn, source: file, counts: byKind, candidates: cand }, null, 2));
} else {
  const icon = { high: '●', med: '◐', low: '○' };
  const mut = (c) => (c.mutating ? ' ⚠변경' : '');
  console.log(`\n[propose] ${fn} — 후보 ${cand.length}건 (필수값 누락 ${byKind['required-missing'] || 0} · 옵션 동등분할 ${byKind['option-ep'] || 0} · 경계값분석 ${byKind.bva || 0} · 정상 생성 ${byKind.happy || 0})`);
  console.log(`source: ${file}\n`);
  const kLabel = { 'required-missing': '필수값 누락', bva: '경계값분석', 'option-ep': '옵션 동등분할', happy: '정상 생성' };
  const order = ['required-missing', 'bva', 'option-ep', 'happy'];
  for (const k of order) {
    const rows = cand.filter((c) => c.kind === k);
    if (!rows.length) continue;
    console.log(`── ${kLabel[k] || k} ──`);
    for (const c of rows) {
      console.log(`  ${icon[c.confidence] || '?'}${mut(c)}  ${c.name}`);
      console.log(`       ${c.covers}`);
      if (c.need) console.log(`       └ 필요: ${c.need}`);
    }
    console.log('');
  }
  console.log('범례: ● 높음 / ◐ 보통 / ○ 낮음(추가 실측) · ⚠변경=실자원 생성(opt-in, teardown 필요)');
  console.log('다음: 이 중 만들 케이스를 사용자에게 확인 → 선택분만 steps.json 작성 → generate → verify.\n');
}
