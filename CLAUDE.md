# CLAUDE.md — Tremolo 시나리오 하네스 (init / starter)

이 폴더는 **Tremolo(Contrabass 등) 기능 TC를 실행 가능한 Tremolo 시나리오(`.spec.ts` + `.spec.ts.meta.json`)로
만드는 스킬 + 하네스**다. AI(너)가 이 폴더에서 작업을 시작할 때 아래를 따른다.

## 0. 첫 실행 셋업 / 접속 정보 (최초 1회 · 환경 바뀔 때)
접속 정보는 `assets/envs.json` 하나(공개 tst 환경 정보 · 공유/커밋 가능). 손으로 JSON을 고치지 말고
**`node scripts/env.mjs`** 를 쓴다. **사용자가 fixture·preamble·envs.json 을 직접 작성/수정하는 일이 없게** AI가 명령으로 채운다
(로그인 프리앰블은 generate 가 자동 삽입, 로그인 라벨은 `env.mjs check` 가 실제 화면 라벨을 자동 저장).

**계정 정책(2026-10-06): 환경별 QA 공용 테스트 계정 풀을 먼저 쓴다. 풀을 쓸 수 없을 때만 사용자 계정을 1회 받는다.**
`envs.json` 의 `envs.<키>.account` + `accounts[]`(예: 400tst 의 `YOUR_ACCOUNT_ID`, `YOUR_ACCOUNT_ID2~5`)는 QA 검증 환경용으로 만든
**공용 테스트 계정**이며 하네스 배포본에 포함하는 것이 의도다. 같은 계정 **중복 로그인이 불가한 솔루션**이 있어(두 번째 로그인이
첫 세션을 끊음) 여러 개를 만들어 두었고, 라이브 실행마다 `lib.mjs` 가 **빈 계정을 자동 배정**한다(잠금·`maxParallel`).
→ 다음 경우에만 **작업 시작 전 AskUserQuestion 으로 아이디·비밀번호(·MFA)를 1회 받아** `env.mjs set id/password --env <키>`
(또는 `account add`)로 저장한다: (1) 대상 환경에 계정이 없다(새로 구축된 환경 — `env.mjs` 가 `⚠ 공통 기본값` 표시),
(2) 풀 계정이 모두 사용 중이거나 로그인되지 않는다(다른 사람이 쓰는 중·잠김). 이때 "중복 로그인 금지 환경이면 다른 사람이 쓰지 않는
독자 계정을 권장" 안내 후 입력을 기다린다. 저장한 뒤로는 다시 묻지 않는다. 공통 `account` 는 하위 호환 기본값일 뿐이다.

1. **점검(질문 없이, bash)**: `node -v`(18+) · `node scripts/env.mjs`(현재 환경·계정 출처·누락 값 표시). Playwright/chromium·
   `data\scenarios\_helpers` 가 없으면 사용자 PC에서 **`tremolo.cmd setup`** 실행을 안내(§2-c).
2. **누락 값만 채운다**: 대상 환경에 쓸 수 있는 계정이 없으면 위 정책대로 1회 받아 저장. 사용자가 알려준 값은 AI가 바로 넣는다.
3. **환경 선택/추가**: `env.mjs use 306tst` · `env.mjs add <키> <baseUrl> --version <V>`. 일회성은 각 스크립트에 `--env <키>`
   (또는 `TREMOLO_ENV`). 대상 환경이 요청과 다르면 작업 전에 전환한다.
4. **로그인 확인**: 사용자 PC에서 `tremolo.cmd check` — 실제 로그인 1회 시도(§2-c, AI가 runlogs로 결과 확인). 실패하면 계정/MFA/라벨부터 고친다.
   로그인 폼 라벨이 다른 솔루션이면 `envs.json` 의 `envs.<키>.login.{idLabel,passwordLabel,mfaLabel,mfa}` 로 덮어쓴다(라이브 실측으로 확정).
5. **설치 경로 연결 안내**: `setx TREMOLO_DATA_SCENARIOS "<앱 data\scenarios 경로>"` 1회(생성물이 앱에 인식되게). `_helpers` 없으면 앱 실행 불가.
6. **고지**: 예측 거버넌스(TC 없으면 개발화면 기반 → “사람이 Pass/Fail 판정”) / 실행 위치(신규는 `ground` 실측 필수,
   1회·최종 실행은 Tremolo 앱) / 새 솔루션은 셀렉터 가정 금지·라이브 실측. → 원래 요청을 §2로 진행.

## 배경 · 소스 없이 단독 동작 (중요)
`vendor/codegen.cjs` 에 **Tremolo의 코드젠이 미리 번들**되어 있다. 따라서 **Tremolo 소스 리포지토리 없이
Node.js만 있으면** `scripts/generate.mjs` / `scripts/verify.mjs` 가 동작한다(빌드된 exe/dmg만 있는 사용자 대상).
- Tremolo **소스 리포가 있으면**(개발자) `node scripts/build_codegen.mjs --force` 로 vendor를 최신화할 수 있다(esbuild 필요).
- 소스가 없으면 그냥 vendor를 쓴다. `pnpm install`·esbuild 불필요.

## 1. 환경 항목 상세 (참고 — 첫 셋업은 §0을 따른다)
> 첫 실행 셋업은 **§0**(`env.mjs` + `setup.mjs`)이 담당한다. 아래는 각 항목의 배경·재확인용.
1. **Node.js 18+** 있는지 확인(`node -v`). 없으면 사용자에게 설치 요청.
2. **환경 값 확인** — `node scripts/env.mjs` 로 현재 환경(URL·버전·계정)이 **이번 대상**인지 확인, 다르면 `env.mjs use <키>`.
   로그인 프리앰블은 `generate.mjs` 가 현재 환경 값으로 **자동 삽입**하므로 steps.json 에 복사하지 않는다.
   → **URL/계정/MFA가 틀리면 실행이 전부 실패**하니 가장 먼저 확인(`tremolo.cmd check`).
3. **출력/설치 위치** — 생성물은 기본 `./tremolo-scenarios/` (또는 `--out`)에 만들어진다. Tremolo에서 실행하려면
   `<Tremolo 데이터>/scenarios/<solution>/<version>/` 아래에 `.spec.ts` + `.meta.json` **쌍**을 둬야 한다.
   그 경로를 알면 `TREMOLO_DATA_SCENARIOS` 환경변수로 지정하면 meta의 `scenarioPath`가 맞게 박힌다.
4. (선택) 결과 로거/워크북 파싱을 쓸 거면 **Python3 + openpyxl**(`pip install openpyxl`).
5. **Playwright + chromium**(`npx playwright install chromium`) — **신규 스크립트의 실측(ground.mjs)·1회 실행(smoke.mjs)에 필수.**
   generate/verify(정적)만은 Node만으로 되지만, **완료 게이트인 실측은 라이브**라 반드시 준비한다(미설치 시 명확한 안내가 뜬다).

## 2. 핵심 작업 순서 (매번)
**원칙: 목적은 품질 향상을 위한 테스트 스크립트다. TC 기대 결과와 다른 실제 결과를 '끝까지 돌리기 위해' continue/pass
처리하지 않는다**(assert 는 TC 기대 그대로, 실패로 남겨 보고 — `verify.mjs` 가 assert continue 를 FAIL). 그리고
**예측 작성 후 사용자가 멈추라고 하지 않았으면 실측·수정·재실측까지 바로 이어서 끝내 즉시 실행 가능한 스크립트**를 낸다.
**실측 자원 제한·CUD 허용(필수, 2026-10-06 개정)**: 생성·수정·삭제·대체(`--subst`) 대상과 생성 폼에서 고르는 기존 자원은 **이름에 `qa-trml-{yymmdd}` 가 들어간 자원만**
(단, 자원을 바꾸지 않는 조회 화면의 필터·트리 선택은 기존 자원 허용)
(구 규칙 `pqa-`/`qa-` 접두·생성자 계정 허용·`--owner-ok` 는 폐기). 이 자원에 한해 실측 중 제출을 실제로 수행(`ground --mutate`)하고,
사전데이터도 AI가 `qa-trml-{yymmdd}-<용도>` 이름으로 직접 만든다. 스크립트가 만드는 자원은 `qa-trml-{YYMMDD_HHMMSS}-<용도>` + `runtime.saveAs`
별칭(이후 `{{별칭}}`)으로 실행일 기준 이름을 쓴다. 타 자원에 영향을 줄 수 있는 동작은 영향 범위를 모두 `qa-trml-*` 로 구성한 뒤 수행하며,
그 구성은 스크립트에 넣지 않고 **실행 전 사전 준비 항목으로 보고**한다. (`references/grounding-policy.md` '실측 자원 제한')

0. **요청 접수 → 질문지(필요한 것만, 1회)** — 템플릿: `references/grounding-policy.md` '질문지 템플릿'. 이미 알 수 있는 건 묻지 않는다.
   (a) TC/기획 근거 유무(워크북이 주어졌으면 생략)
   (b) **계정**: `envs.json` 공용 계정 풀이 있으면 묻지 않는다. 대상 환경에 계정이 없거나 풀이 모두 사용 중·로그인 불가일 때만 "중복 로그인을 금지하는 환경이면 다른 사람이 쓰지 않는 독자 계정을 권장" 안내 후 **ID·비밀번호 입력을 기다린다** → `env.mjs set id/password --env <키>`
   (c) **MFA**: On+고정 코드(작성·실행 가능 → `set mfa <코드>`) / On+랜덤 코드(작성은 사용자 OTP 입력으로 가능, **Tremolo 실행은 어려움** 안내 → `set mfa random`, 실측 시 `TREMOLO_OTP`) / Off(MFA 스텝 미포함 → `set mfa off`)
   (d) **병렬**: 풀 계정 수와 PC가 감당할 동시 세션 수(→ `set maxParallel`). 풀이 부족하면 추가 계정이 있는지(→ `account add`)
   (e) **1회 실행 검증(smoke)을 할지(예/아니요)**. **실측은 묻지 않고 항상 한다**(`qa-trml-{yymmdd}` 자원만 변경).
   답변을 받은 뒤 아래 절차로 진행한다. (거버넌스·질문 상세: `references/grounding-policy.md`)
1. **TC 먼저**(TC-first, SoT). 기능 TC(기획서/워크북)가 검증 대상의 근거다. **개발 화면에서 규칙을 역추적해 assert
   기대값(검증 문구 등)을 지어내지 말 것** — TC에 있으면 TC에서 가져온다. TC 없는 예측은 **예외로만** 허용하고 note에
   `[예측] TC 근거 없음(개발화면 기반)`, 보고 시 **최상단 고지**(사람이 Pass/Fail 판정). (`references/tc-mapping.md`)
2. **steps 파일 작성** `<name>.steps.json = { name, solution, version, steps:[...] }`. 로그인 프리앰블은 generate가
   자동 삽입(steps는 s7부터) → 메뉴 네비 → 레시피(`references/authoring-patterns.md`). 스텝 스키마는
   `references/step-ir-schema.md`.
   ★ **예측 표기**: 샘플/패턴에서 '추정'한 셀렉터 스텝은 note를 **`[예측]`** 로 시작(예 `"[예측] instance_create 참고,
   진입점 다르면 상이 가능 — 실측 필요"`). 라이브로 확인한 것만 **`[실측]`**. (규약: `references/grounding-policy.md`)
3. **생성**: `node scripts/generate.mjs <name>.steps.json` → `.spec.ts` + `.meta.json` 두 벌.
4. **정적 검증**: `node scripts/verify.mjs <생성된 .spec.ts>` — 구조 PASS + **grounding 요약**(예측 스텝 목록) 확인.
5. **★ 라이브 실측(신규 스크립트는 무조건, 생성 직후 바로)**: 작성 전 `live/walk.mjs` 로 화면을 덤프해 셀렉터를 먼저 확정하면
   예측이 거의 없다. 생성 후 `node scripts/live/ground.mjs "<spec>" --write --continue --skip-missing --mutate [--subst 시나리오자원=qa-trml-…]`
   → 재생으로 target 존재·상태 점검(대상이 `qa-trml-{yymmdd}` 로 확인되는 제출만 실제 수행), note 를 `[실측]`/`[예측]` 스탬프. MISSING/AMBIGUOUS 는 고쳐 **해당 범위만**
   재실측(`--range sA:sB`). 재생성해도 실측 스탬프는 보존된다. **완료 판정**: 셀렉터 문제 0건 + 남은 `[예측]`은 사전데이터 부재·
   변경 후 결과·대체자원 차이뿐(보고서에 목록·필요 사전데이터 명시). 사전데이터 준비 후 `verify --require-grounded`.
   TC 와 다른 실제 결과는 `scripts/stamp.mjs mismatch` 로 표기하고 **보고**(스크립트를 실측에 맞추지 않음).
6. **[질문지='예'] 1회 실행 검증**: `node scripts/live/smoke.mjs "<spec>"` 로 **한 번** 실행 후 결과 확인. Fail이면 —
   **TC에 있는데 Fail → 실제 버그 가능 → 수정 말고 사용자에게 보고** / **TC에 없는데 Fail → 메뉴 성격·통념 내면 수정 허용** 후 재검증.
   '아니요'면 실측까지만 완료하고 **'실행 미확인'** 으로 보고. (변경 시나리오 1회 실행은 `--allow-mutating`+teardown, 모든 대상이 `qa-trml-*` 인지 먼저 확인)
7. **커버리지 기록·설치**: 프로젝트 폴더(§2-d)에서 `author finalize <name>` → registry 등록, `author install <name>` →
   Tremolo `data/scenarios` 설치, `tremolo.cmd build` → 산출물 워크북(`[자동화]` 열·`자동화_*` 시트, 고정 양식)과 `시나리오_설계.md` 갱신.
   (구 `log_results.py` 는 프로젝트 없이 쓰던 단발 기록기 — 프로젝트가 있으면 쓰지 않는다)

## 2-d. 프로젝트 폴더 · 산출물 · 실행 결과 기록
TC 워크북 1개(솔루션×버전) = **프로젝트 폴더 1개**: `<하네스 상위>/projects/<SOL>-<VER>/`. 뼈대만 고정하고 저작 방식은 자유.
솔루션마다 다른 값(TC 시트·ID 패턴·환경 키·경로)은 **`project.json` 에만** 둔다(스크립트 하드코딩 금지).
- **입력 자료는 하네스 `data/` 폴더**: 사용자가 TC 워크북·기획서·화면 캡처 등 AI 에게 줄 자료를 여기에 넣는다(`data/README.md`).
  요청에 파일명이 없으면 먼저 `data/` 를 확인한다. 이 폴더의 자료는 배포본에 넣지 않는다(README 만).
- **시작**: `tremolo.cmd project list` → 있으면 `project use <이름>`, 없으면 `project init <SOL> <VER> --tc data\<TC.xlsx> --env <키>`.
  walk 덤프·로그·미리보기 같은 폐기 가능 작업물은 `.work/` 에, 보관할 보고서(사전 준비 등)는 `deliverables/` 에 둔다.
  폴더 구조·명령: `references/project-layout.md`.
- **산출물**: `deliverables/<TC>_자동화.xlsx` **누적 파일 1개**를 `build` 로 갱신. 원본 열·시트는 건드리지 않고 하네스 소유 영역만 다시 그린다
  (지문 검사·백업·엑셀 열림 차단). 양식: `references/deliverable-format.md`.
- **Tremolo 실행 결과 → TC**: `tremolo.cmd runs` → `record <대상>`(미리보기, 쓰지 않음) → 사용자 확인 후 `--apply`.
  스텝 결과를 meta note 의 TC ID 로 옮겨 `[자동화] 최근 결과` 열에만 쓴다(원본 `테스트 결과` 열은 사람이). Fail 건은 `자동화_판정필요`
  시트에서 **사람이 판정**(AI 가 채우지 않음) → `build` 가 수확·보존. 환경 불일치·실행 후 스크립트 수정·엑셀 열림 등은 차단된다.
  `--force`/`--allow-env-mismatch` 는 사용자가 명시했을 때만. 규칙·가드레일: `references/results-recording.md`.

## 2-b. TC가 조건을 다 안 준 복잡 폼 → 탐색·제안·확인 (멈추지 말 것)
다단계 마법사(예: 로드밸런서 5단계)나 조건부 규칙이 사전조건에 없는 폼은 `확인 필요`로만 방치하지 말고:
1. **탐색** `node scripts/live/explore.mjs --url <생성 URL> --name <fn> [--open-selects]` — CUD 없이(‘다음’만) 각
   단계 요소(필수/선택·타입·옵션·제약)를 수집 → `output/testdata/explore/<fn>.explore.json`.
2. **제안** `node scripts/testdata/propose.mjs <fn>.explore.json` — 일반 QA 후보(필수값 누락·옵션 동등분할·경계값분석·정상 생성) 생성.
3. **확인** 후보를 사용자에게 제시하고 만들 케이스를 **고르게 한다**(AskUserQuestion). 선택분만 steps.json→generate→verify.
- 조건부 규칙(예: "특정 프로토콜에서 특정 세션 유형 비활성")이 TC에 없으면 '비활성' 단정 대신 **현 상태 그대로 assert**하고
  전제를 `note`에 `확인 필요`. 자세히: `references/explore-propose.md`.

## 2-c. 실행 위치 규칙 — 라이브 작업은 사용자 PC에서 (반드시)
대상 서비스(306tst·400tst 등)는 **대부분 사내망 전용**이다. AI의 클라우드/원격 셸(Cowork의 `device_bash` VM 포함)은
사내망에 닿지 않는다(2026-10-01 확인: 프록시 403). 따라서 **브라우저가 필요한 작업은 전부 사용자 PC(Windows)에서** 한다.

| 작업 | 어디서 | 방법 |
|---|---|---|
| 작업 | 어디서 | 방법 |
|---|---|---|
| 화면 보기·셀렉터 실측·메뉴 탐색 | 사용자 Chrome | **Claude in Chrome 확장**으로 AI가 직접 조작(아래 규칙) |
| Playwright 스크립트 (`check`·`probe`·`explore`·`ground`·`smoke`·호환성 실행) | 사용자 PC | **`tremolo.cmd <작업> ...`** (하네스 루트) |
| 정적 작업 (`generate`·`verify`·steps 작성·로그 분석) | 어디서나 | AI 셸에서 바로 실행 가능 |

**Playwright 실행 절차**
1. AI는 실행할 **정확한 한 줄**을 제시한다. 예: `tremolo.cmd ground "tremolo-scenarios\CONTRABASS\V4.0\<name>.spec.ts" --write`
   (경로는 하네스 루트 기준 상대경로, 공백·대괄호가 있으면 큰따옴표).
2. 사용자가 PC에서 실행 → 출력이 `runlogs\<시각>-<작업>.log` 와 `runlogs\latest.log` 에 UTF-8로 남는다.
   산출물(probe의 aria.yaml·page.png, ground의 note 스탬프, smoke의 results.json 등)은 각 스크립트의 기본 폴더에 남는다.
3. 하네스 폴더가 연결돼 있으면 **AI가 `runlogs/latest.log`와 산출물을 직접 읽어** 다음 단계로 진행한다
   (사용자에게 로그 복사·붙여넣기를 요청하지 말 것). 연결이 없으면 로그 파일 첨부를 요청한다.
4. AI의 클라우드/원격 셸에서 `probe/explore/ground/smoke/env check` 를 실행하지 말 것 — 사내망 접근 불가 + 리눅스 렌더링이라
   결과가 무의미하다. (AI가 사용자 PC에서 직접 도는 환경 — 예: 그 PC의 Claude Code CLI/데스크톱 — 이면 `tremolo.cmd` 대신 바로 실행해도 된다.
   이 경우 `walk.mjs`/`ground.mjs --headless` 로 AI가 직접 조사·실측하는 것이 가장 빠르다 — 2026-10 V4.0 작업은 전부 이 방식.)

**단일 세션 규칙(중복 로그인 불가 대비)**: **계정 1개 = 동시 1세션**. `lib.mjs` 가 env+계정 잠금
(`runlogs/.live-<env>-<id>.lock`)으로 뒤 실행을 대기시킨다. **병렬 실측**은 계정 풀로: `env.mjs account add <id> <pw>` 로 계정을 추가하고
`env.mjs set maxParallel <N>`(PC 성능에 맞게, 예: 3)으로 동시 세션 수를 제한하면, 각 라이브 실행이 **빈 계정을 자동 배정**받는다.
컨텍스트 전환처럼 계정 상태를 이어 쓰는 연속 작업(전환 → 실측 → 원복)은 `TREMOLO_ACCOUNT=<id>` 로 **한 계정에 고정**해 한 체인으로 돌린다
(테넌트 컨텍스트는 계정별 서버 저장 — 계정마다 따로 원복). 사용자 Chrome(확장)·Tremolo 앱이 **같은 계정**으로 로그인 중이면
세션이 서로 끊기므로 작업 중엔 피하거나 다른 계정을 쓴다. 백그라운드로 여러 실측을 걸 땐 한 명령 안에서 순차로 묶는다.

**테넌트 컨텍스트(프로젝트 선택)는 계정 단위로 서버에 저장**된다. 실측/실행 중 '전체 프로젝트' 등으로 바꿨다면 끝에 반드시
원래 프로젝트로 되돌리고 확인한다(다른 실행·사용자 화면에 영향). 전환하면 대시보드로 이동하므로 목록은 `goto` 로 재진입.

**브라우저 선택** (모든 Playwright 작업 공통, `--browser <값>` 또는 `TREMOLO_BROWSER`)
- 기본 `bundled` = Tremolo 번들 Chromium(`<Tremolo>/build/playwright-browsers`, 앱 실행과 동일). 하네스가 Tremolo 폴더 안에 있으면
  자동 탐색 → `npx playwright install` 불필요. 실패 시 설치된 Chrome으로 자동 폴백.
- `chrome` / `msedge` = 이 PC에 설치된 브라우저, `chrome-131`·`edge-131` 등 = `<Tremolo>/build/browsers/<이름>` 의 버전 고정 브라우저(호환성 검증).

**Claude in Chrome 규칙** (AI가 Playwright 를 직접 못 돌리는 환경에서 화면을 볼 때)
- AI가 사용자 PC에서 Playwright(`walk`/`ground`)를 직접 돌릴 수 있으면 그것을 우선한다(덤프·재현이 빠르고 로그인 자동).
  확장 Chrome 과 Playwright 를 **같은 계정으로 동시에** 쓰지 말 것(단일 세션 규칙).
- 확장을 쓸 때는 **반드시 "Claude in Chrome"(브라우저 확장)을 사용**한다. **앱 내 pane 브라우저(Claude Browser)는 쓰지 말 것** —
  pane은 별도 프로필이라 대상 환경 **로그인 세션이 없어 실측이 안 된다.** 사용자가 로그인한 실제 Chrome을 확장으로 조작해야 한다.
- **탭은 AI가 직접 연다.** 사용자에게 "확장 탭을 열고 그 URL로 이동해 달라"고 요청하지 말 것 — AI가 Chrome 확장 도구로
  **새 탭을 만들고 대상 URL로 navigate** 한다.
- 확장 Chrome이 대상 환경에 로그인돼 있지 않으면, 공용 계정(`envs.json`)으로 AI가 로그인 화면에서 직접 로그인해도 된다
  (공개 tst 계정 정책). Playwright 스크립트는 `lib.mjs` 가 envs.json으로 자동 로그인한다(`--env <키>`).
- 확장 자체가 연결 안 됨(`Claude in Chrome not connected`)이면, 사용자에게 **확장 사이드패널을 열어 (Claude 계정으로) 연결**해
  달라고만 요청하고, 연결되면 **AI가 탭 열기부터 이어서** 진행한다.

## 3. 자주 틀리는 셀렉터 (실패 예방 — 반드시 지킬 것)
- 목록의 **＋생성** 버튼은 아이콘 리거처라 이름이 **`add 생성`**(plain `생성` 아님). 폼 하단 제출만 `생성`.
- 행 `⋯` = **`more_horiz`**. AntD Select는 **폼에 라벨 텍스트 있으면 `by:'label'`**, 라벨이 비고 **안정 `#id`**
  (예: 유동 IP `#networkId`)면 **`by:'auto'`+css `#id` root**. `by:'auto'` 단독(root 없음)은 실패.
- 로그인은 **Enter가 제출**(별도 `로그인` 클릭 금지). 스위치는 "라벨-근접 switch xpath"(녹화본 패턴).
- **문구/내용 검증은 `getByText`(kind:text)로.** Tremolo가 `exact:true` 기본이라, 상시 존재하는 랜드마크 role
  (`document`/`dialog`/`main`…)을 `getByRole`로 잡으면 **strict-mode violation**(대표: `role=document`). 검증 메시지·토스트는 텍스트로.
  (`verify.mjs`가 `locator risk` 경고 → getByText/css 교체. 자세히 `references/authoring-patterns.md` §4c)
- **정적 verify는 셀렉터 이름 오류를 못 잡는다**(정적). 새 화면/솔루션이면 녹화본 + **라이브 DOM 실측**으로 확정.
  (CMP/CONTRABASS/VIOLA는 AntD지만 구현이 조금씩 다름 — 가정 금지. `references/authoring-patterns.md` §4b)
- **기존 자원 선택은 `qa-trml-*` 만**: 이미지/flavor/세그먼트/서브넷/키페어 등 스크립트가 고르는 기존 자원도 이름에
  `qa-trml-{yymmdd}` 가 들어간 것만 쓴다(없으면 먼저 만든다 — 사전데이터). 타 팀·공용 자원은 고르지 않는다. `envs.json` 의 `commonResources`는
  선택적 힌트일 뿐 코드가 읽지 않음(비워도 됨). 자세히 `references/authoring-patterns.md` §5.

- **CONTRABASS 4.0 화면 사실·자주 막힌 곳·TC와 자주 다른 패턴은 `references/lessons-learned.md`** — 새 화면 작업 전에 훑어볼 것
  (예: 폼 라벨=h1, 라벨 연결 input 의 접근성 이름=라벨, 상세 첫 탭='세부 정보', 검색 칩 누적, 모달 Escape 불가, '미사용'은 숨김 등).
- **제출 차단 단어 확인**: 새 화면의 제출 버튼 이름이 ground/walk 차단 목록(`MUT_WORDS`)에 없으면 먼저 추가한다
  (실측 중 '연동'·'해지'·'제출'이 누락돼 실제 변경될 뻔한 사례). `…해제/해지` 메뉴는 즉시 실행형일 수 있어 차단된다.
  목록에 없는 버튼이 서버에 변경 요청을 보내도 네트워크 단에서 막히지만(`변경 요청 차단`으로 보고), 화면 단에서 미리 '미수행'으로 잡아야
  팝업 정리·결과 판정이 정확하다. 변경 정책은 `scripts/live/mutation.mjs` 한 곳(ground·walk·smoke 공통) — `references/grounding-policy.md` 6.
- **walk 에서 의도된 쓰기**(프로젝트 컨텍스트 전환 [확인] 등)는 그 액션에 `"writeOk": true` 를 명시해야만 통과한다(없으면 차단).
- **조회인데 POST 인 화면**(집계 [검색]·차트·CSV 등)은 실측 중 '변경 요청 차단'으로 결과가 안 나온다 → walk 로 조회 전용임을 확인한 경로만
  `envs.json` `live.allowRequests` 에 좁혀 추가한다. 계정·화면 설정 저장([필터 저장] 등)은 추가하지 않고 `[예측]` 으로 보고.
- **보이는 요소만 집기**: 닫힌 드롭다운·행 메뉴, 비활성 탭의 표·문구도 DOM 에 남는 화면이 많다(xpath `[1]` 이 숨은 요소를 집음).
  행 메뉴는 `role=menuitem`, 그 밖은 css `… >> visible=true >> nth=0` 로 한정. 읽기 전용 달력은 칸 클릭(`f_common.cal_range` 참고).
  자세한 사례: `references/lessons-learned.md` 2026-10-06·07 항목.
- **실행 세트 별칭으로 값 넘기기**: Tremolo 에는 실행 세트에 값을 직접 입력하는 기능이 **없다** — `{{별칭}}`은 같은 실행 세트에서 앞선
  시나리오의 `runtime.saveAs`(scope 기본 runSet) 스텝이 저장한 값만 참조된다(없으면 실행 오류). 그래서 사전데이터·계정 같은 외부 값은
  실행 세트 맨 앞의 **`[준비]` 시나리오**가 만들거나(사전데이터 생성 → `PRE_*` 별칭) 입력칸에 넣어(계정 등, 실행 전 사용자가 값 수정) 저장하고,
  본 시나리오는 `{{PRE_…}}`·`{{OPERATOR_ID}}` 로 참조한다. ground 로 실측할 때는 `--alias PRE_X=qa-trml-…` 로 값을 미리 준다
  (`PRE_*` 는 qa-trml-{yymmdd} 이름만 허용). 사전데이터를 `pqa-…` 같은 고정 이름으로 박지 않는다(2026-10-07 결정).
  qa-trml 로 만들 수 없는 기존 인프라(외부 세그먼트·이동 대상 호스트)는 **선택만** 허용 — `[준비]-[실행 변수]-[인프라]` 의 `EXT_*`·`MIG_HOST`
  별칭으로 받는다. OS 이미지는 `[준비]` 가 `data/testfiles` 의 부팅 이미지를 qa-trml 이름으로 업로드한다.
- **역할 계정 시나리오**(operator/user 등): 공용 계정 프리앰블 대신 자체 로그인 스텝 + `[준비]` 시나리오가 넘긴 `{{OPERATOR_ID}}` 등으로 작성하고,
  계정이 준비될 때까지 `[예측]` 유지(ground 는 공용 계정으로 로그인하므로 실측 불가).
- **설치는 `author install`**: finalize 때 검증한 파일과 지금 파일의 지문이 같고 다시 검증해도 PASS 일 때만 설치하며, 설치마다 meta 스냅샷을
  `results/snapshots/` 에 남긴다(record 가 실행 당시 내용으로 TC 매핑). 이 버전부터 지문이 스텝 전체 기준이라 **이전에 finalize 한 스크립트는
  다시 finalize 해야 설치된다.**

## 4. 더 읽을 것
- `SKILL.md`(개요/워크플로우), `GUIDE.md`(다른 PC/솔루션 이식), `SETUP.md`(전제·트러블슈팅),
  `references/`(step-ir-schema · authoring-patterns · tc-mapping · testdata-ep-bva · explore-propose · **grounding-policy** ·
  **project-layout · deliverable-format · results-recording** · lessons-learned).
- **`examples/`** — CONTRABASS 실측 녹화본 3종(새니타이즈). Step IR·레시피의 정본 예시. **셀렉터는 솔루션 전용이니
  방법 참고용으로만 보고 대상 솔루션에서 재실측**(examples/README.md 참고).
