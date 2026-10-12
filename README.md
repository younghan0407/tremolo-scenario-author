# Tremolo 시나리오 하네스 (tremolo-scenario-author)

기능 **TC(기획서)** 를 **Tremolo에서 바로 실행 가능한 시나리오**(`.spec.ts` + `.spec.ts.meta.json`)로 만드는 스킬/하네스입니다.
Tremolo의 코드젠이 `vendor/codegen.cjs`에 번들돼 있어 **Tremolo 소스 없이 Node.js만으로** 생성·검증이 됩니다.

---

## 빠른 시작 (3단계)

> 💡 **이 폴더를 Claude 프로젝트로 열고 첫 요청을 하면**, AI가 아래 셋업을 **질문지로 자동 안내**합니다
> (솔루션·MFA·경로 확인 → `setup.mjs` 실행 → `env.mjs` 로 환경 확인 → 로그인 라벨 라이브 실측). 수동으로 하려면:

1. **Node.js 18+** 설치 확인 (`node -v`).
2. **원커맨드 셋업** — 압축 푼 폴더에서:
   ```
   node setup.mjs
   ```
   → Playwright 설치 · chromium 브라우저 다운로드(1회) · 접속 정보(`assets/envs.json`) 점검 · 자가검증까지 자동.
   (chromium ~150MB는 OS별이라 이 단계에서 받습니다. 사내망은 프록시가 필요할 수 있음.)
2-1. **실행은 이 PC에서**: 사내망 서비스라 Playwright/Chrome은 `tremolo.cmd <작업>`(check·probe·explore·ground·smoke·setup)으로 실행. 로그는 `runlogs\`.
3. **접속 정보 확인(가장 먼저)**: `node scripts/env.mjs` — 공용 계정 `YOUR_ACCOUNT_ID`, 환경 전환 `env.mjs use <키>`,
   값 변경 `env.mjs set password <값>`, 로그인 확인 `tremolo.cmd check`.
4. **자료 넣기**: TC 워크북·기획서·화면 캡처 등 AI 에게 줄 자료는 **`data\` 폴더**에 넣고 요청할 때 파일 이름을 알려 주세요(`data\README.md`).

이후 한 시나리오 만들기:
```
node scripts/generate.mjs <name>.steps.json          # steps → spec + meta (Node만)
node scripts/verify.mjs   "<생성된 .spec.ts>"          # 정적 검증 (Node만)
node scripts/live/ground.mjs "<생성된 .spec.ts>" --write   # ★ 라이브 실측(신규는 필수)
node scripts/verify.mjs   "<생성된 .spec.ts>" --require-grounded   # 완료 게이트(PASS라야 done)
```

## 이 하네스가 지키는 원칙 (요약)

- **TC = 정본(SoT).** 검증 문구·기대값은 TC(기획서)에서 가져옵니다. **눈대중·예측으로 지어내지 않습니다.**
  TC가 없는 탐색적/커버리지 작성은 **예외**로만 허용하고, 결과 보고 시 *"개발 화면 기반 — 실제 Pass/Fail은 사람이 판정"* 을 최상단에 고지합니다.
- **실측 필수.** 같은 '생성'이라도 진입 포인트에 따라 화면이 달라지므로, 셀렉터는 반드시 라이브로 확인합니다.
  각 스텝 `note`에 상태를 남깁니다:
  - **`[실측]`** — 라이브 화면에서 확인함(검증 완료).
  - **`[예측]`** — 샘플/패턴에서 추정, 아직 미확인(→ `ground.mjs`로 실측해 `[실측]`으로 승격).
  - 태그 없음 = 예측으로 간주(안전 기본값). `verify --require-grounded`는 예측이 하나라도 있으면 **FAIL**.
- **로케이터.** 내용(검증 문구·토스트)은 `getByText`로. `role=document`/`dialog` 같은 상시 랜드마크는 strict-mode 위반 위험 → 피합니다.
- **정적은 안전, 실행은 신중.** `verify`는 브라우저를 안 띄웁니다. 실제 자원을 바꾸는 전체 실행(`smoke.mjs`)은 원할 때만(변경 시나리오는 `--allow-mutating`+teardown). 실측(`ground --mutate`)은 이름에 `qa-trml-{yymmdd}` 가 들어간 자원만 변경합니다.

## 워크플로우 (스크립트 생성 요청 시)

요청 → **질문지**(① TC 근거 유무 ② 생성 후 1회 실행 검증할지) → 작성 → `generate` → `verify`(정적) →
`ground.mjs`(라이브 실측·필수) → [예: 1회 실행 검증] → 커버리지 기록 → 보고.
(1회 실행 `smoke.mjs`는 **Tremolo 리포/앱 환경 필요**; standalone은 `ground.mjs` 실측까지만, 실행은 Tremolo 앱에서.)
1회 실행 Fail 시: **TC에 있으면** 실제 버그 가능 → 수정 말고 보고 / **TC에 없으면** 통념 내 수정 허용.

## 보안

`assets/envs.json` 은 공개 tst 환경 정보만 담으므로 공유·커밋해도 됩니다(운영 환경 계정은 넣지 말 것).

## 더 읽을 것

- **`GUIDE.md`** — 다른 PC/솔루션 이식(가장 실용적).
- **`CLAUDE.md`** — 이 폴더에서 AI가 따르는 작업 규칙(init/starter).
- **`references/grounding-policy.md`** — `[실측]`/`[예측]` 규약·완료 게이트·예측 거버넌스.
- `references/authoring-patterns.md`(레시피·로케이터), `tc-mapping.md`(TC→스텝), `step-ir-schema.md`(스텝 스키마),
  `explore-propose.md`(복잡 폼 탐색), `testdata-ep-bva.md`(동등분할/경계값).
- `SETUP.md` — 개발자(소스 보유) 심화·트러블슈팅.  `examples/` — 실측 녹화본 예시(참고용, 셀렉터는 재실측).
