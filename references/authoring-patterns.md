# Authoring patterns — writing a scenario that runs like Tremolo recorded it

This is the practical playbook. Pair it with `step-ir-schema.md` (field reference) and
`tc-mapping.md` (turning TC rows into steps).

## The steps file you write
Author one JSON file per scenario, `<name>.steps.json`:
```json
{
  "name": "[컴퓨트]-[인스턴스]-[작업-콘솔 접속]",
  "solution": "CONTRABASS",
  "version": "V3.0.6",
  "steps": [ /* s7 부터: 로그인 이후 스텝만 (프리앰블은 generate가 자동 삽입) */ ]
}
```
Then generate + verify:
```
node scripts/generate.mjs <name>.steps.json          # → <out>/scenarios/<sol>/<ver>/  (repo: workspace_claude/output/…, standalone: ./tremolo-scenarios/…)
node scripts/verify.mjs   "<위 경로>/<name>.spec.ts"
```
`--install` on generate also drops the pair into the repo's `data/scenarios/...` so it shows up
in the Tremolo app. Keep it out of `data/` until verified — staging is a live environment.

## 1. Login preamble is automatic
`generate.mjs` prepends the login steps `s1..s6` built from the current env in `assets/envs.json`
(`--env <key>` to target another env). Write your steps starting at `s7`. To manage login yourself, put
`"preamble": false` in the steps file (or start `steps` with a `goto`). Never invent a URL/account.
Note: pressing **Enter** on the password field submits login — do NOT add a separate `로그인` button
click (redundant; it lands on a transitioning page and can fail). The preamble already ends with Enter + MFA.

## 2. Navigate via the left menu (Depth1 → Depth2)
Menu items are plain text nodes — click them by text. Example (컴퓨트 → 인스턴스):
```json
{ "id":"s8","type":"click","title":"컴퓨트 클릭","locator":"text=\"컴퓨트\"","value":"-",
  "timeout":15000,"waitCondition":"visible","screenshot":"on_failure","onFailure":"fail",
  "retry":{"enabled":false,"count":3},
  "assertion":{"enabled":false,"inputValue":"","expected":"","componentType":"text","state":""},"note":"",
  "target":{"kind":"text","text":"컴퓨트","exact":true} }
```
Then the same shape with `"인스턴스"`. Use the TC's Depth1–4 as the click path (see `tc-mapping.md`).

## 3. Recipe cards (copy, then adjust title/value/name)

**Click a button** (role=button, exact name):
```json
{ "type":"click","title":"<라벨> 클릭","locator":"role=button[name=\"<라벨>\"]","value":"-",
  "target":{"kind":"role","role":"button","name":"<라벨>","exact":true},
  "timeout":15000,"waitCondition":"visible","screenshot":"on_failure","onFailure":"fail",
  "retry":{"enabled":false,"count":3},
  "assertion":{"enabled":false,"inputValue":"","expected":"","componentType":"button","state":""},"note":"" }
```
Common button labels seen in this app: `add 생성`, `다음`, `생성`, `수정`, `삭제`, `추가`, `확인`,
`고정 IP 추가`.

**Fill a text/number field** (role=textbox or spinbutton, name = placeholder):
```json
{ "type":"fill","title":"이름을 입력해 주세요 입력","locator":"role=textbox[name=\"이름을 입력해 주세요\"]","value":"qa-trml-{YYMMDD_HHMMSS}-console",
  "target":{"kind":"role","role":"textbox","name":"이름을 입력해 주세요","exact":true},
  "timeout":15000,"waitCondition":"visible","screenshot":"on_failure","onFailure":"fail",
  "retry":{"enabled":false,"count":3},
  "assertion":{"enabled":false,"inputValue":"","expected":"","componentType":"textbox","state":""},"note":"" }
```
Numeric inputs use `"role":"spinbutton"`.

**Pick a dropdown option** (AntD Select) — the trickiest widget; choose the `by` mode from the DOM, don't guess:

Default (Form.Item has visible label text, e.g. 가용성 존 / 호스트 / 복구 방식) → **`by:'label'`**:
```json
{ "type":"antdSelect","title":"<라벨>: <옵션> 선택","locator":"label=\"<라벨>\"","value":"<옵션>",
  "target":{"kind":"label","label":"<라벨>","exact":true},"antd":{"by":"label","label":"<라벨>"},
  "timeout":15000,"waitCondition":"visible","screenshot":"on_failure","onFailure":"fail",
  "retry":{"enabled":false,"count":3},
  "assertion":{"enabled":false,"inputValue":"","expected":"","componentType":"","state":""},"note":"" }
```
No label text but the select input has a stable `#id` (e.g. 유동 IP form: `#networkId` / `#subnetId` /
`#tenantId`) → **`by:'auto'` WITH a css root** (codegen passes `root: page.locator('#id')`):
```json
{ "type":"antdSelect","title":"networkId: <옵션> 선택","locator":"#networkId","value":"<옵션>",
  "target":{"kind":"css","selector":"#networkId"},"antd":{"by":"auto"},
  "timeout":15000,"waitCondition":"visible","screenshot":"on_failure","onFailure":"fail",
  "retry":{"enabled":false,"count":3},
  "assertion":{"enabled":false,"inputValue":"","expected":"","componentType":"","state":""},"note":"" }
```
Rules for `by` (this caused repeated real failures — read carefully):
- **`by:'auto'` with NO root and NO open dropdown does NOT work** (`selectAntdOption(auto): stable root/open/focused
  AntD Select host not found`). `auto` needs a `root` (css `#id`) or an already-open dropdown.
- **`by:'label'` needs the text to be in `.ant-form-item-label`.** Some forms (유동 IP 생성) render the label
  outside it → `.ant-form-item-label` is empty → `by:'label'` fails. Check the DOM first.
- **Decide by inspecting the Select's Form.Item live** (`probe.mjs` / DOM): label text present → `by:'label'`;
  else stable `#id` → `by:'auto'`+css root (or `by:'root'`); neither → `by:'rank'` + `expectedLabel` (last resort).
- **Copy the recorded scenario for the same form** when one exists (유동 IP → `#networkId`, matching
  `[작업-유동IP추가및해제]`). `verify.mjs` is static and cannot catch a wrong Select mode — only a live run does.

**Select a table row** by its unique cell text(s):
```json
{ "type":"antdTableSelect","title":"AntD 표 행 선택: <행텍스트>","locator":"-","value":"-",
  "antdTable":{"match":["<행을 특정하는 텍스트>"],"control":"radio","action":"check"},
  "timeout":15000,"waitCondition":"visible","screenshot":"on_failure","onFailure":"fail",
  "retry":{"enabled":false,"count":3},
  "assertion":{"enabled":false,"inputValue":"","expected":"","componentType":"","state":""},"note":"" }
```
Use `control:"checkbox"` for multi-select tables (e.g., keypair/security-group pickers).

**Row action menu** (the `more_horiz` "⋯" per-row button, then a popup action). This needs a
row-scoped xpath because the icon repeats per row — mirror Tremolo's template, substituting the
row's identifying text (e.g., the resource name):
```json
{ "type":"click","title":"more_horiz 클릭","value":"-","timeout":15000,"waitCondition":"visible",
  "screenshot":"on_failure","onFailure":"fail","retry":{"enabled":false,"count":3},
  "assertion":{"enabled":false,"inputValue":"","expected":"","componentType":"button","state":""},"note":"",
  "locator":"xpath=(//*[self::tr or @role=\"row\" or @data-row-key or contains(concat(\" \", normalize-space(@class), \" \"), \" ant-table-row \")][contains(translate(normalize-space(.), ' ', ''), '<행이름>')]//*[self::button or @role=\"button\"][translate(normalize-space(.), ' ', '')='more_horiz' or translate(normalize-space(@aria-label), ' ', '')='more_horiz' or translate(normalize-space(@title), ' ', '')='more_horiz'])[1]",
  "target":{"kind":"xpath","selector":"<same as locator>"} }
```

**Confirm inside a modal** ("알림" 등) when a bare button name is ambiguous — scope by the dialog's
text so you click the button in the right modal (mirror Tremolo's template):
```json
{ "type":"click","title":"삭제 클릭","value":"-","timeout":15000,"waitCondition":"visible",
  "screenshot":"on_failure","onFailure":"fail","retry":{"enabled":false,"count":3},
  "assertion":{"enabled":false,"inputValue":"","expected":"","componentType":"button","state":""},"note":"",
  "locator":"xpath=(//*[@role=\"dialog\" or @aria-modal=\"true\" or contains(concat(\" \", normalize-space(@class), \" \"), \" ant-modal-content \")][contains(translate(normalize-space(.), ' ', ''), '알림')]//button[translate(normalize-space(.), ' ', '')='삭제'])[last()]",
  "target":{"kind":"xpath","selector":"<same as locator>"} }
```
If only one button with that label is on screen, a plain `role=button[name="삭제"]` is fine — codegen
already adds a strict-mode `.last()` fallback for role/text clicks, so you don't hand-write that.

**Assert a result** (예상 결과 → check). Status/toast text that appears after async work:
```json
{ "type":"assert","title":"<텍스트> 표시 검증","locator":"text=\"<텍스트>\"","value":"toBeVisible()",
  "target":{"kind":"text","text":"<텍스트>","exact":true},
  "timeout":150000,"waitCondition":"visible","screenshot":"on_failure","onFailure":"fail",
  "retry":{"enabled":true,"count":3},
  "assertion":{"enabled":true,"kind":"visible","inputValue":"","expected":"","componentType":"text","state":"visible"},"note":"" }
```

## 4. Selector stability rules (why scripts break, and how to avoid it)
- **Use exact, human-visible text**: role names and menu/button labels exactly as shown in the UI.
  Codegen wraps names as anchored regexes (`/^\s*라벨\s*$/`), so trailing punctuation is tolerated.
- **Never target dynamic ids or hover classes** (`#rc_select_3`, `.ant-table-cell-row-hover`,
  `.ant-radio-input`). That's exactly what `antdSelect`/`antdTableSelect` exist to avoid — use them.
- **Disambiguate with `order`/`nth`** only when a label genuinely repeats, and keep the index small
  and meaningful.
- **Scope modal/row controls** with the xpath templates above when the same label appears elsewhere.

## 4b. Solution/area-specific implementations — the recorded scripts are the selector authority
CMP · CONTRABASS · VIOLA all use AntD but implement components **slightly differently**, and even
within one solution different areas differ. A locator proven in one area may NOT work in another. This
is exactly why the recorded scripts are given as context — imitate them, don't assume.

- **Recorded scripts win.** Before authoring for an area, open the recorded scenario(s) for the SAME
  solution/area and copy their exact locators/patterns.
- **Icon-ligature buttons (the #1 gotcha).** CONTRABASS renders many buttons as
  `<span class="material-icon">ICON</span><span>LABEL</span>`, so the **accessible name is `ICON LABEL`,
  not `LABEL`**. Confirmed on 306tst:
  - list **"＋ 생성"** (open create form) → name **`add 생성`** — `role=button[name="add 생성"]` (NOT `생성`).
  - row **"⋯"** → name **`more_horiz`**; next-page **"›"** → `keyboard_arrow_right`.
  - the FORM footer submit is plain `<span>생성</span>` → name **`생성`**. So **list-create (`add 생성`)
    ≠ form-submit (`생성`)** — don't use one for the other.
  Using a bare `getByRole('button',{name:'생성'})` on the list button matches nothing → 15s timeout → fail.
- **Login: Enter submits.** After the password `Enter`, do NOT click a `로그인` button (redundant → fail).
- **AI가 직접 실측할 땐 "Claude in Chrome" 확장으로 — AI가 새 탭을 열어 대상 URL로 이동한다** (앱 pane 브라우저 금지,
  사용자에게 탭 열어달라 요청 금지; 로그인은 스크립트가 envs.json으로 자동 처리). 상세: `CLAUDE.md` §2-c.
- **New area with no recording → LIVE-GROUND first.** Use `scripts/live/probe.mjs` (or inspect the DOM:
  read the `<button>`'s child spans / accessible name) before writing the locator. `verify.mjs` is static
  and CANNOT catch a wrong-name locator — only a live run/grounding does. When a `role=name` locator times
  out on a clearly-visible control, suspect an icon ligature or non-standard element and check the DOM.

## 4c. role vs text — Tremolo의 `exact` 기본값과 strict-mode (실패 다발 지점)
Tremolo는 **모든 스텝에 `exact:true`**를 넣는다. 그런데 화면에는 **눈에 안 보여도 상시 존재하는** 랜드마크
role(`document`, `dialog`/`alertdialog`, `alert`, `main`, `navigation`, `region`, `list`, `group`,
`paragraph` …)과 항상 떠 있는 modal/drawer/popup이 많다. 그래서 **`getByRole`로 잡으면 여러 개가 매칭돼
strict-mode violation**이 나기 쉽다. 대표 사례: **`role=document`** (문서 전체가 여러 컨텍스트에 존재).
- **문구/내용 검증은 `getByText`(`kind:"text"`)로.** 검증 메시지·상태·토스트 등 '내용'은 role이 아니라 텍스트로.
  예: `role=document` 에 `toContainText('삭제하시겠습니까?')` → document 다중매칭으로 깨짐 → **`getByText('삭제하시겠습니까?')`**.
- **role은 '접근가능 이름이 유일한 컨트롤'에만**(버튼/입력 등). 랜드마크 role은 피한다.
- role이 꼭 필요한데 중복되면 `order/nth` 또는 상위 스코프 css/xpath로 좁힌다.
- `verify.mjs`가 위험 role(document/dialog/…)을 **`locator risk`** 로 경고한다 — 뜨면 getByText/css로 교체.
- 실측 단계 `ground.mjs`에서 **AMBIGUOUS(count>1)** 로 잡히는 대부분이 이 케이스다.

## 5. Values, naming, and cleanup (future-risk aware)
- URL/account come from `assets/envs.json` (scripts/env.mjs). verify.mjs only soft-checks that the login goto/id match the current env.
- **Existing-resource 선택은 동적으로.** 생성 폼이 기존 자원(이미지/flavor/세그먼트/서브넷/키페어/AZ/볼륨타입 등)
  중 하나를 골라야 할 때, **고정 이름을 박지 말고 라이브에서 현재 존재하는 행/옵션을 집어** 쓴다
  (`antdTableSelect`/`antdSelect`/열기+옵션 클릭). 그래야 솔루션·환경이 달라도, 자원이 지워져도 안 깨진다.
  - **선택 대상 규칙(2026-10-06 개정): 이름에 `qa-trml-{yymmdd}` 가 들어간 항목만 고른다.** 다른 항목(타 팀·공용·`pqa-*`·`qa-*` 등)으로
    폴백하지 않는다 — 없으면 사전데이터로 `qa-trml-{yymmdd}-<용도>` 자원을 먼저 만든다(`grounding-policy.md` '실측 자원 제한').
    예: 세그먼트 선택 → `qa-trml-261006-seg` 행. 고정 이름 대신 `contains 'qa-trml-'` 로 고르면 날짜가 달라도 동작한다.
  - `envs.json` 의 `commonResources` 는 **선택적 힌트일 뿐**(코드가 읽지 않음). 특정 이름을 쓰기 전 라이브로 존재를
    반드시 확인한다. 비워둬도 무방하다.
- **Name resources you create `qa-trml-{YYMMDD_HHMMSS}-<용도>`** (`envs.json naming.resourcePrefix`) and put
  `"runtime": { "saveAs": "<별칭>" }` on that fill step; later steps reference it as `{{<별칭>}}`. Tremolo expands the
  token at run time (KST, 실행일 기준) and keeps the alias for the run set — so reruns never collide and leftovers show
  their date. Aliases are shared across the run set: make them unique per scenario (e.g. `vg14_vol`).
  ```json
  { "type":"fill","title":"이름 입력","target":{"kind":"placeholder","placeholder":"이름을 입력해 주세요."},
    "value":"qa-trml-{YYMMDD_HHMMSS}-vol","runtime":{"saveAs":"vg14_vol"} }
  { "type":"click","title":"생성 행 열기","target":{"kind":"text","text":"{{vg14_vol}}","exact":true} }
  ```
- **사전데이터는 `[준비]` 시나리오 + `PRE_*` 별칭으로 (2026-10-07 결정).** 스크립트가 "이미 있다고 가정하고 고르는" 자원(볼륨·세그먼트·
  보안 그룹 등)은 고정 이름으로 박지 않는다. 실행 세트 맨 앞의 `[준비]-[사전데이터]-[<영역>]` 시나리오가
  `qa-trml-{YYMMDD_HHMMSS}-<용도>` 로 만들면서 `"runtime":{"saveAs":"PRE_VOLUME","scope":"runSet"}` 로 저장하고, 본 시나리오는
  `{{PRE_VOLUME}}` 으로 참조한다. 실행 세트 끝의 `[정리]-[사전데이터]-[<영역>]` 이 지운다. Tremolo 는 실행 세트에 값을 직접 입력하는
  기능이 없으므로(별칭은 앞선 시나리오의 saveAs 만 참조), 사람이 줘야 하는 값(역할 계정·CLI 로 만든 자원명)은 `[준비]-[실행 변수]`
  시나리오가 입력칸에 넣어 저장하고 사용자가 실행 전에 그 값을 고친다. 단독 실행하면 `{{PRE_…}}` 값을 찾지 못해 실패하므로
  **반드시 실행 세트로** 돌린다. 실측은 `ground --alias PRE_VOLUME=qa-trml-261007_101500-vol` 처럼 값을 미리 준다.
- **A feature-flow scenario that creates a resource should also delete it** at the end (the existing
  `생성-수정-삭제` scripts do this). Leaving orphans on shared staging is a real cost.

## 6. Timeouts, retries, onFailure
- Default action `timeout` 15000. For state transitions / toasts, use `150000` + `retry.enabled:true`.
- `onFailure:"continue"` swallows a step's error and keeps going (codegen logs a warning + emits a
  `step:warning`). Use it only for genuinely optional steps; default is `fail`.

## 7. Blocks (optional grouping)
Give a run of related steps the same `"blockId"` (+ optional `"blockName"`) and codegen emits
`// @block-start`/`// @block-end` markers. Purely organizational — omit unless it aids readability.
