# TC → scenario mapping — expanding coverage from the functional TC workbook

Goal: read functional test cases + the already-recorded scenarios as context, then author **new**
feature-flow scenarios that broaden coverage — in Tremolo's own IR, runnable in Tremolo.

## Principle: the TC is the source of truth (do NOT reverse-engineer from the screen)
The correct order is **spec → TC → script**. The TC (from 기획서) defines *what* to verify; the live
app only tells you *how* to click/assert (selectors). Never flip this:
- **Author only what the TC defines.** Do NOT invent cases by poking the dev UI (e.g. discovering a
  validation message or an option list and manufacturing EP/BVA the TC never asked for). The TC's 예상
  결과 is the assertion source; the 절차 is the step source.
- **Don't fabricate values/assertions.** If the TC doesn't specify it, don't assert it.
- **Undefined / unverified → leave a trace, don't guess an assertion.** A *behavior / conditional rule*
  the TC references but leaves undefined → note `확인 필요: …`. A **selector you couldn't live-verify → `[예측]`**
  (grounding 대상 — `ground.mjs`로 실측; see `grounding-policy.md`). A value that varies at runtime → also tag `deferred:dynamic`.
- Live grounding is for **selectors only** (how to reach/assert the TC's item), not for deciding *what*
  to test. Use the recorded scripts + live DOM to implement the TC's steps, not to expand scope.

## The TC workbook — 컬럼은 **헤더 이름**으로 인식(위치 인덱스 하드코딩 금지)
워크북마다 앞쪽 빈 컬럼 유무·시트명·부가 컬럼(`기능 ID`/`화면 ID`/`포탈`/`솔루션` 등)이 달라 컬럼의
**위치(index)가 흔들린다**. 예: `내부솔루션_..._(v3.0.6).xlsx`(시트 `3.0.6`, 634 cases)는 맨 앞 빈 컬럼 때문에
`기능테스트 ID`가 index 2지만, `CONTRABASS V4.0 Full ...xlsx`(시트 `CONTRABASS v4.0 full`)는 빈 컬럼이 없어
같은 필드가 index 1이다(전 필드 -1 시프트). **헤더 '이름'은 두 파일이 동일**하므로, 위치가 아니라 **행1 헤더를
읽어 이름으로 컬럼을 해석**한다. 시트도 이름을 가정하지 말고 헤더 기준으로 자동 감지한다.

작성 시 참고하는 필드(정규 이름 → 헤더):

| 정규 필드 | 워크북 헤더 | use when authoring |
|---|---|---|
| `id` | 기능테스트 ID (e.g. `UNT-CON-034`) | track which TCs a scenario covers |
| `priority` | 우선순위 (P1..P4) | prioritize (P1 first within a target area) |
| `depth1`..`depth4` | Depth1..Depth4 | the menu/navigation path + feature grouping key |
| `area` | 영역 | sub-area (screen/panel/modal) |
| `precond` | 사전조건 | setup: login + nav + any state to create first |
| `testdata` | 테스트 데이터 | concrete values to fill/select (combine with `envs.json`) |
| `steps` | 절차 | the action steps (numbered `1. 2. ...`) |
| `expected` | 예상 결과 | the assertion(s) |

**읽는 법**: 공용 헬퍼 `scripts/results/tc_workbook.py`를 쓴다(헤더 이름 기반 해석 + 시트 자동 감지 + 공백/대소문자
무시). 인덱스를 직접 세지 말 것.
```python
import sys; sys.path.insert(0, "scripts/results")   # 리포 루트 기준(위치는 상황에 맞게)
from tc_workbook import load_tcs
# path 미지정 시 workspace_claude/data 등에서 자동 탐색, sheet 미지정 시 헤더 기준 자동 감지
tcs = load_tcs("<TC 워크북.xlsx>")         # 예: 인입된 CONTRABASS V4.0 파일 경로
for tc in tcs:                              # 각 tc: id/priority/depth1..4/area/precond/testdata/steps/expected ...
    if tc["priority"] == "P1":
        ...  # tc["depth1"], tc["steps"], tc["expected"] 로 접근
```
새 헤더 이름 변형이 있으면 `tc_workbook.py`의 `FIELD_ALIASES`에 별칭만 추가하면 된다(위치 코드 수정 불필요).
빠른 확인: `python scripts/results/tc_workbook.py "<워크북.xlsx>"` → 감지된 시트·행수·필드 출력.

## Mapping rules (TC fields → Step IR)
1. **사전조건 (col 13)** → setup steps. Always the login preamble first, then navigate (Depth1→Depth2…).
   If the precondition requires an existing object (e.g., "인스턴스가 ACTIVE 상태"), create it as part
   of the flow (so the scenario is self-contained) or select an existing row via `antdTableSelect`.
2. **Depth1–4 (cols 8–11) + 영역 (col 12)** → navigation clicks and which screen/modal to open.
3. **절차 (col 15)** → action steps, one UI action per numbered line. Map verbs to recipes in
   `authoring-patterns.md`: 클릭→click, 입력→fill, 선택→antdSelect/antdTableSelect/check, 이동→goto.
4. **테스트 데이터 (col 14)** → the `value`s for fill/select. Fixed connection data comes from
   `envs.json`; case-specific data comes from this column. If a needed datum isn't given, prefer
   selecting an **existing** row/option live over inventing a value — but only items whose name contains
   `qa-trml-{yymmdd}` (create them as pre-data if missing). `envs.json` commonResources is only an optional hint
   (not read by code); confirm existence before reuse. (See `authoring-patterns.md` §5.)
5. **예상 결과 (col 16)** → one `assert` step per verifiable outcome. Visible text/toast/status →
   `kind:"visible"`; substring on a container → `kind:"text"` + `match:"contains"`. Async results
   (status change, deletion toast) → `timeout:150000` + `retry.enabled:true`. **Assert only
   deterministic text — see the next section.**

## Assert only deterministic text — defer dynamic values
Tremolo asserts against the recorded screen and **fails on any mismatch**, and there is (for now) no
runtime judge. So assert ONLY text that is identical on every run:
- section/column headers, field labels (e.g. `인스턴스 유형`, `vCore`, `보안 그룹`, `스냅샷 생성 방식`),
- static status words (`ACTIVE`, `RUNNING`, `BUILD`, `SHUTOFF`), fixed button/menu labels,
- deterministic completion toasts (e.g. `인스턴스(<name>) 삭제가 완료되었습니다`).

**Never assert values that vary per run** — timestamps (the *value* under `생성 일시`), usage %/metrics,
counts, IP/UUIDs, graph numbers, or anything load-dependent. Assert the *label* `생성 일시`, not the time
value. Such runtime-varying checks are **deferred** to the future Local-LLM / AI-API judgment layer
(ROADMAP §#4) — tag them `deferred:dynamic`, don't force a brittle assert now.

Watch exact wording **including spaces**: Tremolo anchors names exactly (`/^\s*생성 일시\s*$/`), so
`생성일시` ≠ `생성 일시`. When unsure of the real text, ground it with the live layer
(`scripts/live/probe.mjs` → `aria.yaml`/`interactable.json`) instead of guessing.

## Grouping: feature-flow (the chosen unit)
Many TCs are atomic UI checks on the same object/lifecycle. Group them into ONE scenario keyed by
**Depth1 (+ Depth2)** that walks the object's lifecycle and absorbs the atomic TCs as asserts along
the way. Prefer create → verify → (act/modify → verify) → delete → verify, mirroring the existing
`[컴퓨트]-[인스턴스]-[생성-수정-삭제]` script. One flow can cover a dozen related TCs.

Naming: keep the bracketed convention `[Depth1]-[Depth2]-[flow summary]`, e.g.
`[컴퓨트]-[인스턴스]-[작업-콘솔 접속]`. This is the `name` in the steps file.

### Worked sketch (compute, uncovered)
TCs like "인스턴스 행의 ⋯ 메뉴 클릭 시 작업 목록 노출", "콘솔 접속 클릭 시 콘솔 화면 노출":
1. login preamble (s1–s6)
2. nav: click `컴퓨트`, click `인스턴스`
3. select the target instance row: `antdTableSelect` match `["<instance name>"]` (or create one first)
4. open row action menu: `more_horiz` row-scoped xpath (see recipe)
5. assert the action list item is visible: `assert kind:visible text:"콘솔 접속"`  ← covers a TC
6. click `콘솔 접속`; assert the console view/element visible  ← covers a TC
7. teardown if the flow created anything

## What to skip, flag, or defer (don't force a bad script)
Never silently drop a TC — tag it so the coverage picture stays honest (a green suite that quietly
skipped the hard cases is worse than an honest gap). Standard tags:
- `deferred:dynamic` — outcome depends on runtime-varying values (metrics, usage %, graph numbers,
  live counts, timestamps). Tremolo can't judge these yet → revisit with the LLM-judgment layer (ROADMAP §#4).
- `deferred:load` — needs Host/VM load or CLI to produce the state (e.g. a dashboard *under load*).
- `deferred:external` — needs an external system (Grafana tab, another solution) or special backend state.
- `flag:manual` — pure visual/layout with no assertable text/DOM signal.
- `flag:data` — needs data not in the workbook or envs.json (specific IPs, serials) — don't invent.

Note: a monitoring/dashboard TC that only checks a **panel/label is present** is `deterministic` and
CAN be automated — it's the *value inside* that is `deferred:dynamic`. Record every skipped/deferred TC
with its TC ID + tag + one-line reason in `coverage.md`.

## Coverage tracking
- Record covered TC IDs for each generated scenario. Simplest: a `coverage.md` (or `coverage.json`)
  in the output folder mapping `scenario name → [TC IDs]`, plus a running list of skipped/flagged TCs.
- Optionally note the TC ID in the relevant assert step's `note` field (it's preserved in meta.json).
- Report per batch: # TCs covered, # scenarios, # flagged, and which Depth areas advanced.
