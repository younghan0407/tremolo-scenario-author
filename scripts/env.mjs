#!/usr/bin/env node
// env.mjs — 접속 정보(assets/envs.json) 로더 + 편집 CLI.
//
// 계정 정책(2026-10-06): 환경(URL·솔루션)별 QA 공용 테스트 계정 풀(envs.<키>.account + accounts[])을 쓴다 — 배포본 포함이 의도.
//   (같은 계정 중복 로그인 불가 솔루션이 있어 여러 개를 두고 라이브 실행마다 빈 계정을 배정) 그 환경에 계정이 없거나
//   풀이 모두 사용 중일 때만 사용자에게 1회 받아 저장한다. 공통 account 는 하위 호환용 기본값일 뿐.
//   envs.json 은 공개 tst 환경 정보 전용(공유/커밋 가능).
// 모든 스크립트는 loadFixtures() 하나로 접속 정보를 읽는다(구 fixtures.json 형태로 반환 → 기존 코드 호환).
//
// 환경 선택 우선순위: --env <key> 인자 > TREMOLO_ENV 환경변수 > envs.json 의 active
//
// CLI:
//   node scripts/env.mjs                       현재 환경 요약
//   node scripts/env.mjs list                  등록된 환경 목록
//   node scripts/env.mjs use 306tst            기본 환경 전환
//   node scripts/env.mjs add 500tst https://500tst.console.bf.okestro.cloud --version V5.0 [--solution CONTRABASS] [--name "..."]
//   node scripts/env.mjs set id <값>           현재 환경 전용 계정 저장 (id | password | mfa) — --env <키> 로 대상 지정, --global 은 공통 기본값
//   node scripts/env.mjs set mfa off           MFA 미사용(로그인에 MFA 스텝 없음)
//   node scripts/env.mjs set mfa <고정코드>    MFA On + 고정 코드(자동화 작성·실행 가능)
//   node scripts/env.mjs set mfa random        MFA On + 매번 랜덤 OTP(이메일 등) — 실측 시 TREMOLO_OTP=<코드> 로 사용자 입력, Tremolo 실행은 어려움
//   node scripts/env.mjs set version V4.0.0    현재 환경 값 변경 (version | baseUrl | solution | name | idLabel | passwordLabel | mfaLabel)
//   node scripts/env.mjs account add <id> <pw>  병렬 실측용 계정 풀에 추가 (account list | remove <id>)
//   node scripts/env.mjs set maxParallel 3      동시 라이브 세션 수(계정 풀 크기 이하) — PC 성능에 맞게
//   node scripts/env.mjs check [--headed]      현재 환경으로 실제 로그인 시도(Playwright 필요)
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, '..', 'assets');
export const ENVS_FILE = path.join(ASSETS, 'envs.json');
const LEGACY_FILE = path.join(ASSETS, 'fixtures.json');
const PREAMBLE_FILE = path.join(ASSETS, 'preamble.login.json');

const DEFAULT_LOGIN = {
  path: '/login',
  idLabel: '아이디를 입력해 주세요',
  passwordLabel: '비밀번호를 입력해 주세요',
  mfaLabel: '인증 코드를 입력해 주세요',
  mfa: true,
};

function argEnv() {
  const i = process.argv.indexOf('--env');
  return i >= 0 ? process.argv[i + 1] : undefined;
}

export function readEnvsFile() {
  return JSON.parse(fs.readFileSync(ENVS_FILE, 'utf-8'));
}
function writeEnvsFile(doc) {
  fs.writeFileSync(ENVS_FILE, JSON.stringify(doc, null, 2) + '\n', 'utf-8');
}

/**
 * 접속 정보를 구 fixtures.json 형태로 반환:
 *   { env:{key,name,url,baseUrl,solution,version}, account:{id,password,mfaCode}, login:{...}, commonResources, naming }
 * envs.json 이 없으면 구 assets/fixtures.json 을 그대로 읽는다(하위 호환). 둘 다 없으면 null.
 */
export function loadFixtures({ env } = {}) {
  if (!fs.existsSync(ENVS_FILE)) {
    if (!fs.existsSync(LEGACY_FILE)) return null;
    const fx = JSON.parse(fs.readFileSync(LEGACY_FILE, 'utf-8'));
    return { ...fx, login: { ...DEFAULT_LOGIN, mfa: !!fx.account?.mfaCode } };
  }
  const doc = readEnvsFile();
  const key = env || argEnv() || process.env.TREMOLO_ENV || doc.active;
  const e = doc.envs?.[key];
  if (!e) throw new Error(`[env] 환경 "${key}" 이 envs.json 에 없습니다. 등록된 환경: ${Object.keys(doc.envs || {}).join(', ')}`);
  const baseUrl = String(e.baseUrl).replace(/\/+$/, '');
  const login = { ...DEFAULT_LOGIN, ...doc.login, ...e.login };
  const primary = { ...doc.account, ...e.account };
  // 계정 풀(병렬 실측용): 대표 계정 + envs.<키>.accounts[]. 라이브 실행은 lib.mjs 가 빈 계정을 골라 TREMOLO_ACCOUNT 로 지정.
  const accountPool = [primary, ...(e.accounts || []).map((a) => ({ mfaCode: primary.mfaCode, ...a }))];
  const want = process.env.TREMOLO_ACCOUNT;
  const account = want ? accountPool.find((a) => a.id === want) : primary;
  if (!account) throw new Error(`[env] TREMOLO_ACCOUNT="${want}" 가 ${key} 계정 풀에 없음: ${accountPool.map((a) => a.id).join(', ')}`);
  const accountSource = e.account?.id ? 'env' : 'global'; // global = 이 환경 전용 계정 미등록(공통 기본값 사용 중)
  return {
    accountSource,
    accountPool,
    maxParallel: Math.max(1, Math.min(Number(e.maxParallel || 1), accountPool.length)),
    env: {
      key,
      name: e.name || key,
      baseUrl,
      url: e.url || baseUrl + login.path,
      solution: e.solution || 'CONTRABASS',
      version: e.version,
    },
    account,
    login,
    commonResources: doc.commonResources || {},
    naming: doc.naming || {},
  };
}

/**
 * 로그인 프리앰블(s1..s6, MFA 미사용이면 s1..s5)을 현재 환경 값으로 만들어 반환.
 * 스텝 모양은 assets/preamble.login.json(Tremolo 녹화본 형태)을 템플릿으로 복제해 값만 바꾼다.
 */
export function buildLoginPreamble(fx = loadFixtures()) {
  const tpl = JSON.parse(fs.readFileSync(PREAMBLE_FILE, 'utf-8')).steps;
  const L = fx.login;
  const role = (label) => ({ kind: 'role', role: 'textbox', name: label, exact: true });
  const loc = (label) => `role=textbox[name="${label}"]`;
  const patch = (i, label, type, value) => {
    const s = structuredClone(tpl[i]);
    s.value = value;
    s.locator = loc(label);
    s.target = role(label);
    s.title = type === 'fill' ? `${label} 입력` : `${label} 키 누르기`;
    return s;
  };
  const steps = [
    { ...structuredClone(tpl[0]), value: fx.env.url, title: `${fx.env.url} 이동` },
    patch(1, L.idLabel, 'fill', fx.account.id),
    patch(2, L.idLabel, 'press', 'Tab'),
    patch(3, L.passwordLabel, 'fill', fx.account.password),
    patch(4, L.passwordLabel, 'press', 'Enter'),
  ];
  // 랜덤 OTP 환경: 고정 값이 없으므로 자리표시자(__OTP__) — Tremolo 에서 그대로 실행 불가(generate 가 경고)
  if (L.mfa) steps.push(patch(5, L.mfaLabel, 'fill', L.mfaMode === 'random' ? '__OTP__' : fx.account.mfaCode));
  return steps;
}

/** 실행 전에 막아야 할 '설정 누락'만 점검(보안 검사 아님). 문제 목록 반환. */
export function missingSettings(fx = loadFixtures()) {
  if (!fx) return ['assets/envs.json 없음'];
  const out = [];
  if (!fx.env.baseUrl) out.push('baseUrl 비어 있음');
  if (!fx.env.version) out.push(`환경 "${fx.env.key}" 의 version 비어 있음`);
  if (!fx.account.id) out.push('account.id 비어 있음');
  if (!fx.account.password) out.push('account.password 비어 있음 → node scripts/env.mjs set password <값>');
  if (fx.login.mfa && fx.login.mfaMode !== 'random' && !fx.account.mfaCode) out.push('MFA 사용인데 고정 코드 비어 있음 → env.mjs set mfa <코드> | random | off');
  return out;
}

// ───────────────────────── CLI ─────────────────────────
function summary(fx) {
  const lines = [
    `환경     : ${fx.env.key}  (${fx.env.name})`,
    `URL      : ${fx.env.url}`,
    `솔루션   : ${fx.env.solution} ${fx.env.version}`,
    `계정     : ${fx.account.id} / 비밀번호 ${fx.account.password ? '설정됨' : '(비어 있음)'}  ${fx.accountSource === 'env' ? '(이 환경 전용)' : '(⚠ 공통 기본값 — 이 환경 전용 계정 미등록: 사용자에게 1회 받아 env.mjs set id/password 로 저장)'}`,
    `MFA      : ${!fx.login.mfa ? 'Off (로그인에 MFA 스텝 없음)' : fx.login.mfaMode === 'random' ? 'On + 랜덤 OTP (실측 시 TREMOLO_OTP 로 입력, Tremolo 실행 어려움)' : `On + 고정 코드 ${fx.account.mfaCode || '(비어 있음)'}`}`,
  ];
  lines.push(`병렬     : 최대 ${fx.maxParallel} 세션 / 계정 풀 ${fx.accountPool.length}개 (${fx.accountPool.map((a) => a.id).join(', ')})`);
  const miss = missingSettings(fx);
  lines.push(miss.length ? `⚠️  설정 누락: ${miss.join(' · ')}` : '✅ 설정 완료');
  return lines.join('\n');
}

function opt(args, flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

async function cli(args) {
  const [cmd, a1, a2] = args.filter((x, i, arr) => !(x.startsWith('--') || arr[i - 1]?.startsWith('--')) );
  if (!cmd || cmd === 'show') { console.log(summary(loadFixtures())); return; }
  const doc = readEnvsFile();

  if (cmd === 'list') {
    for (const [k, e] of Object.entries(doc.envs)) console.log(`${k === doc.active ? '*' : ' '} ${k.padEnd(10)} ${e.baseUrl}  ${e.solution || 'CONTRABASS'} ${e.version || ''}`);
    return;
  }
  if (cmd === 'use') {
    if (!doc.envs[a1]) throw new Error(`"${a1}" 없음. 등록: ${Object.keys(doc.envs).join(', ')}`);
    doc.active = a1; writeEnvsFile(doc); console.log(summary(loadFixtures({ env: a1 }))); return;
  }
  if (cmd === 'add') {
    if (!a1 || !/^https?:\/\//.test(a2 || '')) throw new Error('usage: env.mjs add <key> <baseUrl> --version <V> [--solution S] [--name N]');
    doc.envs[a1] = {
      name: opt(args, '--name') || a1,
      baseUrl: a2.replace(/\/+$/, '').replace(/\/login$/, ''),
      solution: opt(args, '--solution') || 'CONTRABASS',
      version: opt(args, '--version') || '',
    };
    writeEnvsFile(doc); console.log(`추가: ${a1}  (전환하려면: node scripts/env.mjs use ${a1})`); return;
  }
  if (cmd === 'set') {
    const field = a1; const value = a2;
    if (value === undefined) throw new Error('usage: env.mjs set <id|password|mfa|version|baseUrl|solution|name|idLabel|passwordLabel|mfaLabel> <값>');
    const ekey = opt(args, '--env') || process.env.TREMOLO_ENV || doc.active;
    // 계정은 기본적으로 '현재 환경 전용'으로 저장(--global 이면 공통 기본값)
    const acct = args.includes('--global') ? doc.account : (doc.envs[ekey].account ||= {});
    const lg = args.includes('--global') ? doc.login : (doc.envs[ekey].login ||= {});
    if (field === 'id') acct.id = value;
    else if (field === 'password') acct.password = value;
    else if (field === 'mfa') {
      if (value === 'off') { lg.mfa = false; delete lg.mfaMode; }
      else if (value === 'on') lg.mfa = true;
      else if (value === 'random') { lg.mfa = true; lg.mfaMode = 'random'; }
      else { acct.mfaCode = value; lg.mfa = true; lg.mfaMode = 'fixed'; }
    } else if (['version', 'baseUrl', 'solution', 'name', 'maxParallel'].includes(field)) {
      const key = opt(args, '--env') || process.env.TREMOLO_ENV || doc.active;
      doc.envs[key][field] = field === 'baseUrl' ? value.replace(/\/+$/, '') : field === 'maxParallel' ? Number(value) : value;
    } else if (['idLabel', 'passwordLabel', 'mfaLabel'].includes(field)) {
      // 로그인 라벨은 환경(버전)마다 다를 수 있어 현재 환경에만 덮어쓴다.
      const key = opt(args, '--env') || process.env.TREMOLO_ENV || doc.active;
      doc.envs[key].login = { ...(doc.envs[key].login || {}), [field]: value };
    } else throw new Error(`알 수 없는 항목: ${field}`);
    writeEnvsFile(doc); console.log(summary(loadFixtures())); return;
  }
  if (cmd === 'account') {
    // account add <id> <pw> [--env k] | account remove <id> | account list — 병렬 실측용 계정 풀(대표 계정 외 추가분)
    const ekey = opt(args, '--env') || process.env.TREMOLO_ENV || doc.active;
    const e = doc.envs[ekey]; e.accounts ||= [];
    if (a1 === 'add') {
      const [, , id, pw] = args.filter((x, i, arr) => !(x.startsWith('--') || arr[i - 1]?.startsWith('--')));
      if (!id || !pw) throw new Error('usage: env.mjs account add <id> <password> [--env <키>]');
      e.accounts = e.accounts.filter((x) => x.id !== id).concat([{ id, password: pw }]);
    } else if (a1 === 'remove') e.accounts = e.accounts.filter((x) => x.id !== a2);
    if (a1 !== 'list') writeEnvsFile(doc);
    console.log(summary(loadFixtures({ env: ekey }))); return;
  }
  if (cmd === 'check') {
    const fx = loadFixtures();
    const miss = missingSettings(fx);
    if (miss.length) throw new Error('설정 누락: ' + miss.join(' · '));
    const { launch, login, dumpLoginDiagnostics } = await import('./live/lib.mjs');
    const { browser, page } = await launch({ headless: !args.includes('--headed') });
    try {
      try { await login(page, fx); } catch (e) {
        const dir = path.join(__dirname, '..', 'runlogs', 'check-diag');
        const info = await dumpLoginDiagnostics(page, dir);
        console.error(`❌ 로그인 단계 실패: ${String(e.message).split('\n')[0]}`);
        console.error(`   현재 화면: ${info.url}  (${info.title})`);
        console.error('   보이는 입력칸/버튼:');
        info.inputs.forEach((i) => console.error(`   - ${i.tag}[type=${i.type}] placeholder="${i.placeholder || ''}" aria="${i.aria || ''}" name="${i.name || ''}" ${i.text ? 'text="' + i.text + '"' : ''}`));
        console.error(`   진단 파일: ${dir}\\login-fail.png / login-fail.json`);
        process.exitCode = 1; return;
      }
      const url = page.url();
      const ok = !/\/login(\b|\?|$)/.test(new URL(url).pathname);
      // 로그인 칸을 라벨로 못 찾아 폴백했으면 실제 라벨을 이 환경에 자동 저장(사용자가 envs.json 을 고칠 필요 없음)
      if (ok && page.__loginHints?.length) {
        const d = readEnvsFile();
        d.envs[fx.env.key].login = { ...(d.envs[fx.env.key].login || {}), ...Object.fromEntries(page.__loginHints.map((h) => [h.field, h.value])) };
        writeEnvsFile(d);
        console.log(`ℹ️  로그인 라벨 자동 저장(${fx.env.key}): ${page.__loginHints.map((h) => `${h.field}="${h.value}"`).join(', ')}`);
      }
      console.log(ok ? `✅ 로그인 성공 (${fx.env.key}) → ${url}` : `❌ 로그인 후에도 로그인 화면에 머묾 → 계정/MFA 확인 (${url})`);
      process.exitCode = ok ? 0 : 1;
    } finally { await browser.close().catch(() => {}); }
    return;
  }
  throw new Error(`알 수 없는 명령: ${cmd}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  cli(process.argv.slice(2)).catch((e) => { console.error('[env]', e.message); process.exit(1); });
}
