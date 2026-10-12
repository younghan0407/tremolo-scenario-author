---
name: tremolo-scenario-author
description: >-
  Author new Tremolo test scenarios (Playwright .spec.ts + .meta.json) for the Contrabass cloud
  console by turning functional test cases into runnable, coverage-expanding flows. Use this
  skill WHENEVER the task involves Tremolo scenarios/scripts, expanding test coverage from a TC
  workbook, generating or editing `.spec.ts`/`.meta.json` under `data/scenarios`, converting
  functional/UI test cases into browser automation, or writing new E2E flows for the Contrabass
  (306tst.console.bf.okestro.cloud) app — even if the user just says "make Tremolo scripts",
  "cover these TCs", "add scenarios", or names a feature area (컴퓨트/인스턴스, VPC, 관리, HA, 스토리지…).
  Do NOT hand-write spec.ts; author the step IR and let the bundled harness generate it.
---

# Tremolo scenario author

Generate scenarios that are **byte-identical to what Tremolo itself produces** and runnable in the
app. The trick: Tremolo keeps each scenario as a `.meta.json` "step" list (the source of truth) and
regenerates the `.spec.ts` from it via its own `generateSpecFromSteps()`. This skill authors the
step IR and drives that same generator through a bundled harness — so you never reimplement (and
never drift from) Tremolo's codegen.

> **다른 PC/솔루션 이식은 먼저 `GUIDE.md`를 볼 것** — 코드젠은 `vendor/codegen.cjs`에 번들돼 **Node만으로 단독
> 동작**(Tremolo 소스 불필요). 신규 스크립트의 라이브 실측/실행(`ground.mjs`/`smoke.mjs`)엔 **Playwright+chromium 필요**,
> 프로젝트·산출물·결과 기록엔 Python3+openpyxl. 접속 정보는 `assets/envs.json`(환경별 QA 공용 테스트 계정 풀 — 풀을 쓸 수 없을 때만 사용자 계정을 1회 받아 저장) — `node scripts/env.mjs` 로 확인·전환한다. (개발자 심화·트러블슈팅: `SETUP.md`)

## Tremolo 실행 규칙 (필수 — 즉시 실행 가능하려면)
1. **항상 두 벌**: 모든 시나리오는 `<name>.spec.ts` + `<name>.spec.ts.meta.json` 쌍으로 존재해야 한다
   (편집=meta, 실행=spec). `generate.mjs`가 항상 둘 다 쓴다. **spec.ts만 손으로 쓰지 말 것** — meta가
   원본이고 Tremolo가 meta에서 spec을 재생성하므로 손편집한 spec은 다음 저장/실행에서 덮어써진다.
2. **실행 위치**: Tremolo가 실행하려면 파일이 `data/scenarios/<solution>/<version>/` 아래 있어야 한다
   (`playwright.config.ts`의 `testMatch: data/scenarios/**`). `generate.mjs --install`로 복사하거나 수동 복사.
   meta의 `scenarioPath`는 그 실제 위치(리포 루트 기준)를 가리켜야 한다 — `generate.mjs`가 리포 루트에서
   자동 계산하므로 **반드시 사용자의 리포에서 생성/설치**할 것(다른 머신에서 만든 meta의 scenarioPath는 교정 필요).
3. **meta ↔ spec 동기**: 항상 `generate.mjs`로 함께 만들고 `verify.mjs`로 `meta<->spec sync`를 확인한다(불일치 시 재생성).
4. **헬퍼 존재**: spec이 import하는 `../../_helpers/<h>`(antdSelect/antdTableRow/codeMirror 등)가
   `data/scenarios/_helpers/`에 있어야 한다(`verify.mjs`가 확인). 없으면 실행 시 import 에러.
5. **고정 정보**: URL·계정은 `assets/envs.json`(현재 환경)에서만 가져온다. 로그인 프리앰블은 `generate.mjs`가 자동 삽입.
6. **재실행 안전(충돌 방지)**: 이름이 고정된 생성 시나리오는 재실행 시 이름 충돌 → **teardown(생성→검증→삭제)**
   을 포함해 스스로 정리하게 한다. (자동 할당 자원, 예: 유동 IP는 매 실행 새 값이라 create-only도 안전.)

## Inputs (all under the Tremolo repo / workspace)
- **TC workbook** `내부솔루션_Contrabass_기능 TC(v3.0.6).xlsx`, sheet `3.0.6` (634 cases) — what to cover.
- **Existing scenarios** in `workspace_claude/scenarios/` (and `data/scenarios/CONTRABASS/V3.0.6/`)
  — the style/patterns to imitate.
- **Project folder** `<하네스 상위>/projects/<SOL>-<VER>/` — `project.json`(TC 워크북·시트·ID 패턴·환경 키), 설계, steps, registry,
  실행 결과 원장, 누적 산출물. `references/project-layout.md`.
- **`assets/envs.json`** — env profiles (306tst/400tst…) + **환경별 계정 풀**(QA 공용 테스트 계정 — 배포본 포함이 의도. 없거나 모두 사용 중일 때만 사용자에게 1회 받음 — 절대 지어내지 말 것; 편집은 `node scripts/env.mjs set id/password` · `account add`). `commonResources`는 **선택적 힌트**
  (코드가 읽지 않음) — 고르는 기존 자원도 이름에 `qa-trml-{yymmdd}` 가 들어간 것만(없으면 사전데이터로 생성, §5).
- **`assets/preamble.login.json`** — shape template of the 6-step login; `generate.mjs` fills it from envs.json and prepends it automatically (author steps from `s7`).

## Workflow
0. **Ask first (질문지 — 필요한 것만 1회).** (a) TC/기획 근거 유무(워크북이 주어졌으면 생략), (b) **1회 실행
   검증(smoke)을 할지(예/아니요)**, (c) 대상 환경(URL·솔루션)에 **쓸 수 있는 계정이 없을 때만**(풀 없음·모두 사용 중) **아이디·비밀번호 1회**
   (중복 로그인 불가 솔루션 대비 — `env.mjs set id/password` 로 그 환경에 저장, 이후 재질문 없음 — "중복 로그인 금지 환경이면 독자 계정 권장" 안내 후 입력 대기),
   (d) **MFA 방식**: On+고정 코드(작성·실행 가능) / On+랜덤 코드(작성은 사용자 OTP로 가능, Tremolo 실행 어려움) / Off(MFA 스텝 없음)
   → `env.mjs set mfa <코드>|random|off`. **실측은 묻지 않고 항상 수행(`qa-trml-{yymmdd}` 자원만 변경).** 질문지 템플릿: `references/grounding-policy.md`.
   ★ **목적은 품질 향상용 테스트 스크립트**: TC 기대와 다른 실제 결과를 끝까지 돌리려고 continue/pass 처리하지 않는다(실패로 남겨 보고).
1. **Understand the target.** Read the TC rows for the requested area from the workbook, and read
   1–2 existing scenarios in the same/adjacent area to match conventions. See `references/tc-mapping.md`.
2. **Group into feature-flows.** Combine related TCs into one lifecycle scenario (create → verify →
   act → verify → delete → verify), absorbing atomic TCs as `assert` steps. Naming + grouping rules
   in `references/tc-mapping.md`.
3. **Author the steps file** `<name>.steps.json` = `{ name, solution:"CONTRABASS", version:"V3.0.6",
   steps:[...] }`. Start from the login preamble, then navigate by menu text, then the recipes in
   `references/authoring-patterns.md`. Field-level schema is in `references/step-ir-schema.md`.
4. **Generate**: `node scripts/generate.mjs <name>.steps.json` → writes `<name>.spec.ts` + `<name>.spec.ts.meta.json`
   into the output dir — **Tremolo 리포면** `workspace_claude/output/scenarios/<sol>/<ver>/`, **standalone이면** `./tremolo-scenarios/<sol>/<ver>/` (또는 `--out <dir>`).
   ★ Mark any **predicted** selector (copied/inferred from a sample or pattern, not yet live-confirmed)
   with a `[예측]` note prefix; only live-confirmed selectors get `[실측]`. See `references/grounding-policy.md`.
5. **Verify (static, always)**: `node scripts/verify.mjs <path-to>.spec.ts`. Hard checks (meta↔spec
   sync, syntax, helpers, fixed info, structure) + a **grounding summary** listing predicted steps.
6. **★ Live-ground (REQUIRED, 생성 직후 같은 흐름에서 바로 — 예측본에서 멈추지 않는다)**: 작성 전 `live/walk.mjs` 로 화면을
   덤프해 셀렉터를 먼저 확정하고, 생성 후 `node scripts/live/ground.mjs "<spec.ts>" --write --continue --skip-missing --mutate [--subst A=qa-trml-…]`
   로 재생 → `[실측]`/`[예측]` 스탬프. **조회·선택·대체·CUD 대상은 이름에 `qa-trml-{yymmdd}` 가 들어간 자원만**(2026-10-06 개정 — 구 `pqa-`/`qa-` 규칙 폐기):
   `--mutate` 는 대상이 qa-trml 로 확인되는 제출만 실제 수행, 다른 `--subst` 는 ground 가 중단. 스크립트가 만드는 자원은
   `qa-trml-{YYMMDD_HHMMSS}-<용도>` + `runtime.saveAs` 별칭(`{{별칭}}`), 사전데이터는 AI가 `qa-trml-{yymmdd}-<용도>` 로 직접 생성.
   타 자원 영향 동작은 영향 범위를 `qa-trml-*` 로 사전 구성 → 사전 준비로 보고. MISSING/AMBIGUOUS 는 고쳐 `--range` 로 그 부분만 재실측(재생성해도 스탬프 보존).
   **Done:** 셀렉터 문제 0 + 남은 `[예측]`은 사전데이터 부재·변경 후 결과·대체자원 차이뿐(보고서에 명시) →
   사전데이터 준비 후 `verify --require-grounded` PASS. TC 와 다른 실제 결과 → `scripts/stamp.mjs mismatch` 로 표기·보고
   (assert 를 실측에 맞추거나 continue 하지 않음). 정책: `references/grounding-policy.md`, 교훈: `references/lessons-learned.md`.
6b. **[질문지='예'] Run-once verification**: `node scripts/live/smoke.mjs "<spec>"` 로 한 번 실행. Fail이면 —
   **TC에 있는데 Fail → 실제 버그 가능 → 수정 말고 사용자에게 보고**; **TC에 없는데 Fail → 메뉴 성격·통념 내면 수정 허용** 후 재검증.
   '아니요'면 실측까지만 완료하고 **'실행 미확인'** 으로 보고. (변경 시나리오는 `--allow-mutating`+teardown, 대상이 모두 `qa-trml-*` 인지 먼저 확인)
7. **Track coverage**: record covered TC IDs and anything flagged/skipped (see `references/tc-mapping.md`) —
   in a project: `author finalize <name>` (registry) → `tremolo.cmd build` (deliverable workbook, fixed format: `references/deliverable-format.md`).
8. Only once verified, grounded, and reviewed, `author install <name>` (or `generate --install`) into `data/scenarios/...` to run in Tremolo.
9. **After a Tremolo run**: `tremolo.cmd runs` → `record <target>` (preview, writes nothing) → user confirms → `--apply`.
   Step results map to TCs via meta notes into `[자동화] 최근 결과`; Fail rows go to `자동화_판정필요` for a **human** verdict.
   Rules + guardrails: `references/results-recording.md`.

## The harness (bundled `scripts/`)
- `build_codegen.mjs` — bundles Tremolo's own `generateSpecFromSteps`/`parseSpecToSteps` via the
  repo's esbuild. Normal runs use the shipped `vendor/codegen.cjs`; `--force` (developers, needs Tremolo source)
  rebuilds and **replaces `vendor/codegen.cjs`** (old one kept as `.bak`) so the loader really uses the new codegen.
  Build only from the source of the Tremolo version your team runs.
- `generate.mjs <steps.json> [--out <dir>] [--install]` — steps file → `.spec.ts` + `.meta.json`.
- `verify.mjs <spec|meta> [--compile] [--require-grounded]` — static checks (hard) + soft notes(grounding·locator-risk).
  `--require-grounded`는 예측(미실측) 스텝이 있으면 **FAIL**(완료 게이트). `--compile` runs
  `playwright test --list` (transpile only, no browser) when the file is installed under `data/scenarios`.
- `stamp.mjs mismatch|data "<spec>" s1,s2 ["사유"]` — 실측 후 판정 표기: TC 불일치(assert 유지·실패로 보고) / 대체자원 값 차이(미판정).
- `env.mjs` — 환경·**환경별 계정** 관리(`set id/password` 는 현재 환경에 저장), `check` 는 로그인 라벨 자동 저장.
- `project/manage.py` (`tremolo.cmd project …`) — project list/use/init/status. `project/author.py` (`tremolo.cmd author …`) —
  gen / wk / finalize / carry / mark / restamp / install, all paths from `project.json`.
- `results/record.py` (`tremolo.cmd runs|record`) + `results/deliverable.py` (`tremolo.cmd build`) — run results → TC ledger → deliverable workbook.
- `tremolo_paths.mjs` — locates the repo root + esbuild. Override with `TREMOLO_ROOT` /
  `TREMOLO_ESBUILD` env vars if auto-detection ever fails.

## Non-negotiables (why they matter)
- **Fixed info only.** URL, account, MFA come from `assets/envs.json`; the login preamble is generated
  verbatim. Inventing endpoints/credentials makes a script that can't run and can leak wrong data.
- **Author IR, not spec text.** Hand-written `.spec.ts` drifts from Tremolo and breaks on next
  save (the app regenerates from meta). Author steps; let the harness emit the spec.
- **정적 검증 → 필수 실측 → (선택) 1회 실행, 순서로.** `verify.mjs`는 브라우저를 안 띄우는 정적 체크(안전).
  신규 스크립트는 그 다음 **`ground.mjs`(실측, `qa-trml-*` 대상만 변경)로 셀렉터를 라이브 확인해야 완료**(gate: `verify --require-grounded`).
  **전체 실행(`smoke.mjs`)은 사용자가 '1회 검증'에 동의했을 때만**(변경 시나리오는 `--allow-mutating`+teardown).
- **TC = SoT, 예측은 예외.** assert 기대값(검증 문구 등)은 TC에서 가져온다. TC 근거 없는 예측은 예외로만 허용하고
  `[예측]`로 표기 + **보고 최상단에 고지(사람이 Pass/Fail 판정, 개발화면이 정답 아님)**. `references/grounding-policy.md`.
- **로케이터: 내용은 `getByText`.** Tremolo `exact:true` 기본 + 상시 랜드마크 role(document/dialog/…) → `getByRole`는
  strict-mode 위험(대표 `role=document`). 검증 문구는 텍스트로. `antdSelect`/`antdTableSelect` 사용, 동적 id·hover class 금지. §4c.
- **Be honest about gaps.** Flag TCs you can't automate cleanly (visual-only, unreachable state)
  with their TC ID instead of writing brittle asserts. A silently-skipped hard case is worse than a
  recorded gap.

## References (read as needed)
- `references/step-ir-schema.md` — every step type + locator/assertion shapes, with real examples.
- `references/authoring-patterns.md` — login/nav preamble, copy-paste recipes, selector-stability rules.
- `references/tc-mapping.md` — TC columns → steps, feature-flow grouping, **deterministic-assert rule +
  defer/exclude tagging** (dynamic values are deferred to a future LLM-judge layer), coverage tracking.
- `references/testdata-ep-bva.md` — define a TestData option catalog (the TC workbook's data column is
  empty) and derive 동등분할(EP)/경계값(BVA) scenarios from it.
- `references/grounding-policy.md` — **예측 금지·실측 필수 가드레일**: `[실측]`/`[예측]` note 태그, `verify --require-grounded`
  게이트, `ground.mjs` 절차. 신규 스크립트는 이 정책을 따라 실측 완료해야 done.
- `references/explore-propose.md` — TC가 조건을 다 안 준 복잡 폼: explore(수집)→propose(후보)→ask(선택).
- `references/lessons-learned.md` — **실측 교훈**: 자주 막힌 곳·단축법, 4.0 화면 사실, TC와 자주 다른 패턴, 안전 규칙.
- `references/project-layout.md` — 프로젝트 폴더 뼈대·`project.json`·명령.
- `references/deliverable-format.md` — 산출물 워크북 고정 양식(`[자동화]` 열·`자동화_*` 시트)·보호 장치.
- `references/results-recording.md` — Tremolo 실행 결과 → TC 판정 규칙·가드레일·담당자 판정.

## Live grounding & pipeline (REQUIRED for new scenarios)
Static authoring **predicts** selectors; the live layer confirms them on the real DOM (Playwright, run on
the user's machine — it auto-logs-in from `assets/envs.json`, `--env <key>` to pick an env). New scenarios MUST be grounded (see policy). In `scripts/`:
- `live/ground.mjs "<spec.ts>" [--write] [--mutate]` — **grounding 점검**: 재생으로 각 target 존재 확인, note를 `[실측]`/`[예측]` 스탬프.
  기본은 제출 미수행, `--mutate` 면 대상이 `qa-trml-{yymmdd}` 자원으로 확인되는 제출만 수행. `{YYMMDD_HHMMSS}`·`{{별칭}}` 값은 Tremolo 처럼 풀어 재생.
- `live/explore.mjs` — 제출 없이 폼 요소 수집(탐색). `testdata/propose.mjs`로 후보 케이스 제안.
- `live/probe.mjs` — open a screen, dump full-page ARIA snapshot + interactable index (pick real targets).
- `live/mutation.mjs` — **공통 변경 정책**(화면 단 판정 + 로그인 이후 비-GET 요청 네트워크 차단). ground·walk·smoke 가 모두 쓴다.
- `live/walk.mjs <actions.json> [--headless]` — 비변경 화면 탐색: nav/goto/click/fill/press/eval/count/snap 액션을 순서대로 수행.
  의도된 쓰기(컨텍스트 전환 [확인] 등)는 액션에 `"writeOk": true` 가 있어야만 통과(나머지 쓰기 요청은 BLOCK 으로 기록)
  (제출 단어 버튼 클릭 차단, 세션 재사용·만료 [연장]). `eval` 로 라벨·input·select·표·모달을 덤프해 셀렉터를 작성 전에 확정.
- 라이브 실행은 env+계정 **잠금으로 순차**(중복 로그인 불가 대비, `TREMOLO_NO_LOCK=1` 로 해제).
- `live/smoke.mjs` — run generated spec(s) live (target limited to its full `data/scenarios/<sol>/<ver>/<file>` path; Pass only if
  exit code 0 + no global errors + all tests passed; statuses Pass/Fail/error/skipped always overwrite, history in `*.runs.jsonl`;
  any mutating or unclassifiable click in meta → needs `--allow-mutating`), record → `results.json` (read-only scenarios
  are safe; create/delete gated behind `--allow-mutating`).
- `testdata/derive.mjs` — a TestData catalog (e.g. `output/testdata/instance-create.json`) → EP/BVA
  case scenarios → generate + verify.
- `results/log_results.py` — (legacy, no project) fold `results.json` + covered-TC notes into a dated **copy** of the TC
  workbook. With a project, use `build` / `record` instead. (needs `pip install openpyxl`)
