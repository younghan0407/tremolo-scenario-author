// mutation.mjs — 라이브 도구(ground·walk·smoke) 공통 "변경 정책".
//
// 두 겹으로 막는다.
//  ① 화면 단 판정(classify): 스텝/액션이 자원을 바꿀 수 있는 동작인지 판단 → 보고·건너뛰기용.
//     클릭(role/text/css/xpath/제목 라벨)·Enter·행 메뉴(menuitem)·clickText 를 모두 같은 규칙으로 본다.
//  ② 네트워크 단 차단(installWriteGuard): GET/HEAD/OPTIONS 가 아닌 요청은 **명시적으로 열어 준 때만** 통과.
//     ①이 놓친 경로(이름 없는 css 버튼, 즉시 실행 메뉴, 입력란 Enter 등)도 실제 변경으로 이어지지 않게 하는 최종 안전장치.
//     열어 주는 경우: ground --mutate 에서 대상이 qa-trml-{yymmdd} 로 확인된 스텝 / walk 액션의 "writeOk": true /
//     세션 연장([연장]) / envs.json 의 envs.<키>.live.allowRequests(정규식, "METHOD /path") — 로그인은 차단 설치 전에 끝낸다.
import fs from 'fs';

// 자원을 바꾸는 버튼·메뉴 단어(정확 일치). '…해제/해지' 로 끝나는 메뉴는 즉시 실행형일 수 있어 별도로 본다.
export const MUT_WORDS = /^(생성|저장|삭제|수정|적용|등록|확인|연결|해제|추가|변경|복원|실행|시작|종료|재시작|중지|정지|재부팅|일시정지|재개|활성화|비활성화|잠금|잠금 해제|업로드|교체|이동|복사|백업|마이그레이션|초기화|조치|무시|전송|불러오기|연동|해지|분리|할당|반납|제출|승인|반려|취소 요청|폐기|만료|갱신|재설정|동기화|배포|롤백)$/;
// 변경이 아닌 것으로 확정된 동작(열기·닫기·이동). 정확 일치. — 화면 단 판정에서만 쓰고, 네트워크 단은 항상 적용된다.
export const SAFE_WORDS = /^(add 생성|delete 삭제|취소|닫기|close|다음|이전|검색|search|search 검색|more_horiz|필터|refresh|새로고침|목록|상세|세부 정보|펼치기|접기)$/;
// Enter 로 검색만 하는 입력란(목록 검색칩 등)
export const SEARCH_FIELD = /검색|search|항목 이름 또는 값을 입력해 주세요/i;
export const EXPLICIT_SAFE = /\[(검증클릭|비변경)\]/; // 실측으로 '서버에 아무것도 안 보냄'을 확인한 스텝만 note 로 표시

const trim = (v) => String(v ?? '').trim();

/** 스텝(meta step) 이 가리키는 라벨 후보들. */
function labels(s) {
  const t = s.target || {};
  const c = [t.name, t.text, t.label, t.title];
  const sel = String(t.selector || '');
  for (const m of sel.matchAll(/(?:normalize-space\([^)]*\)|text\(\)|\.)\s*=\s*'([^']+)'/g)) c.push(m[1]);
  for (const m of sel.matchAll(/:has-text\(["']([^"']+)["']\)|text=["']?([^"'\]]+)/g)) c.push(m[1] || m[2]);
  for (const m of String(s.title || '').matchAll(/\[([^\]]+)\]/g)) c.push(m[1]);
  const tm = /^(.+?)\s*클릭$/.exec(s.title || '');
  if (tm) c.push(tm[1]);
  return c.map(trim).filter(Boolean);
}

/**
 * 화면 단 판정. 반환: { mutating: true|false, unknown?: true, label, why }
 *  - mutating=true  : 변경 동작(제출·즉시 실행 메뉴·폼 Enter)
 *  - unknown=true   : 변경 여부를 이름으로 확정할 수 없는 클릭(이름 없는 css/xpath 버튼, 메뉴 등) — 네트워크 단이 최종 판단
 */
export function classifyStep(s) {
  if (EXPLICIT_SAFE.test(s.note || '')) return { mutating: false, why: 'note 로 비변경 명시' };
  const t = s.target || {};
  if (s.type === 'press') {
    const key = trim(s.value || 'Enter');
    if (key !== 'Enter') return { mutating: false, why: `키 ${key}` };
    const field = [t.placeholder, t.name, t.label, t.selector, s.title].join(' ');
    if (SEARCH_FIELD.test(field)) return { mutating: false, why: '검색 입력란 Enter' };
    return { mutating: true, label: 'Enter', why: '입력란 Enter(폼 제출)' };
  }
  if (s.type !== 'click') return { mutating: false, why: s.type };
  const ls = labels(s);
  // 행 메뉴 항목: role 대상이든 xpath/css 로 menuitem 을 가리키든 같은 규칙.
  const menuXp = (t.kind === 'xpath' || t.kind === 'css') && /@role\s*=\s*['"]menuitem['"]|\[role=["']?menuitem/.test(String(t.selector || ''));
  if ((t.kind === 'role' && t.role === 'menuitem') || menuXp) {
    // '…해제/시작/중지' 등은 팝업 없이 즉시 실행될 수 있어 변경으로 본다. '수정'·'삭제' 등은 보통 팝업을 연다 →
    // 판정 불가로 실행하고 네트워크 단이 실제 변경 요청을 막는다(즉시 실행이었다면 '변경 요청 차단'으로 보고됨).
    const name = t.kind === 'role' ? trim(t.name) : (ls[0] || '');
    if (/(해제|해지|시작|중지|정지|재시작|재부팅|활성화|비활성화)$/.test(name)) return { mutating: true, label: name, why: '즉시 실행형 메뉴' };
    return { mutating: false, unknown: true, label: name, why: '메뉴(팝업 열기 추정)' };
  }
  if (t.kind === 'role' && t.role && t.role !== 'button') {
    return { mutating: false, unknown: !['tab', 'link', 'checkbox', 'radio', 'option', 'treeitem', 'row', 'cell', 'columnheader', 'combobox', 'textbox'].includes(t.role), why: `role=${t.role}` };
  }
  const mut = ls.find((w) => MUT_WORDS.test(w));
  if (mut) return { mutating: true, label: mut, why: '제출 단어' };
  if (ls.some((w) => SAFE_WORDS.test(w))) return { mutating: false, why: '열기/닫기/이동' };
  return { mutating: false, unknown: true, label: ls[0] || t.selector || t.role || '', why: '이름으로 판정 불가' };
}

/** walk 액션 판정(같은 규칙). */
export function classifyWalkAction(a) {
  if (a.writeOk) return { mutating: false, why: 'writeOk' };
  if (a.clickText != null) return classifyStep({ type: 'click', target: { kind: 'text', text: a.clickText }, note: a.note });
  if (a.click) {
    const c = a.click;
    const target = c.css ? { kind: 'css', selector: c.css } : c.xpath ? { kind: 'xpath', selector: c.xpath }
      : c.text ? { kind: 'text', text: c.text } : c.label ? { kind: 'label', label: c.label } : { kind: 'role', role: c.role || 'button', name: c.name };
    return classifyStep({ type: 'click', target, note: a.note });
  }
  if (a.press) return classifyStep({ type: 'press', value: a.press, target: a.pressTarget || {}, note: a.note });
  return { mutating: false, why: 'non-click' };
}

/** 정적 실행(smoke) 게이트: 변경 가능성이 있는 스텝 목록(확정 + 판정 불가). */
export function mutatingSteps(steps) {
  return (steps || []).map((s) => ({ s, c: classifyStep(s) })).filter(({ c }) => c.mutating || c.unknown);
}

/** envs.json 의 envs.<키>.live.allowRequests (비변경으로 확인된 비-GET 요청 정규식 — 예: "^POST /api/v1/token/refresh"). */
export function allowRequestsFor(envKey) {
  try {
    const p = new URL('../../assets/envs.json', import.meta.url);
    const doc = JSON.parse(fs.readFileSync(p, 'utf-8'));
    return [...(doc.live?.allowRequests || []), ...(doc.envs?.[envKey]?.live?.allowRequests || [])]; // 전역 + 환경별
  } catch { return []; }
}

/**
 * 네트워크 단 차단. context 에 설치하면 GET/HEAD/OPTIONS 외 요청을 막는다.
 * 반환: { open(reason), close(), take() → 이번 구간에 막힌 요청 목록, blockedAll }
 */
export async function installWriteGuard(context, { allow = [] } = {}) {
  const allowRe = allow.map((p) => (p instanceof RegExp ? p : new RegExp(p)));
  let openReason = null;
  let pending = [];
  const blockedAll = [];
  await context.route('**/*', (route) => {
    const req = route.request();
    const m = req.method().toUpperCase();
    if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return route.continue();
    let pathq = req.url();
    try { const u = new URL(req.url()); pathq = u.pathname + u.search; } catch { /* keep */ }
    const sig = `${m} ${pathq}`;
    if (openReason || allowRe.some((re) => re.test(sig))) return route.continue();
    pending.push(sig.slice(0, 160)); blockedAll.push(sig.slice(0, 160));
    return route.abort('blockedbyclient');
  });
  return {
    open(reason = 'allowed') { openReason = reason; },
    close() { openReason = null; },
    take() { const p = pending; pending = []; return p; },
    blockedAll,
  };
}
