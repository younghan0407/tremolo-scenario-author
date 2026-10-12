# Tremolo Step IR (`.meta.json`) — authoritative schema

Tremolo stores every scenario as a `<name>.spec.ts.meta.json` sidecar whose `steps` array is
the **source of truth**. The runnable `<name>.spec.ts` is generated from it by Tremolo's own
`generateSpecFromSteps()` (which our harness reuses). You author the `steps`; the harness writes
the meta + spec. So: **get the steps right and the spec is correct by construction.**

The authoring input you write is a *steps file* (`<name>.steps.json`); the harness turns it into
the full meta. See `authoring-patterns.md` for the steps-file wrapper and `generate.mjs` usage.

## Contents
- Meta envelope (what the harness writes)
- Common step fields
- Step types (with real examples)
- Locator `target` kinds
- Assertion object

---

## Meta envelope (harness output — you don't hand-write this)
```json
{
  "scenarioPath": "C:\\...\\Tremolo\\data\\scenarios\\CONTRABASS\\V3.0.6\\<name>.spec.ts",
  "scenarioId": "CONTRABASS::V3.0.6::<name>",
  "steps": [ /* Step[] — the part you author */ ],
  "updatedAt": "<ISO timestamp>"
}
```

## Common step fields
Every step object shares these. Copy the defaults verbatim unless a recipe says otherwise.
```json
{
  "id": "s8",                    // unique within the scenario; used for screenshot filenames
  "type": "click",              // see step types below
  "title": "다음 클릭",          // human label; also becomes the `// comment` + [TMLO:n] step marker
  "locator": "role=button[name=\"다음\"]",  // legacy string form; keep in sync with target
  "value": "-",                 // action payload ("-" = none)
  "timeout": 15000,             // ms; assertions on async UI use 150000
  "waitCondition": "visible",
  "screenshot": "on_failure",   // on_failure | always | never
  "onFailure": "fail",          // fail | continue
  "retry": { "enabled": false, "count": 3 },
  "assertion": { "enabled": false, "inputValue": "", "expected": "", "componentType": "", "state": "" },
  "note": "",
  "target": { /* structured locator — 1st-class; see below */ }
}
```
Notes:
- `target` is preferred by codegen; `locator` is the legacy fallback. Keep both consistent — the
  recipes in `authoring-patterns.md` give matching pairs so you never diverge.
- `id`s must be unique but need not be sequential. Login preamble uses `s1..s6`; continue at `s7`.
- For flaky async confirmations, set `retry: { "enabled": true, "count": 3 }` (esp. on asserts).

---

## Step types

### goto — navigate
```json
{ "id":"s1","type":"goto","title":"... 이동","locator":"-",
  "value":"https://example.invalid/env-1/login",
  "timeout":15000,"waitCondition":"visible","screenshot":"on_failure","onFailure":"fail",
  "retry":{"enabled":false,"count":3},
  "assertion":{"enabled":false,"inputValue":"","expected":"","componentType":"","state":""},"note":"" }
```

### fill — set an input's value (clears first)
`value` is the text to enter. `target` is usually a role=textbox/spinbutton by placeholder name.
```json
{ "id":"s2","type":"fill","title":"아이디를 입력해 주세요 입력",
  "locator":"role=textbox[name=\"아이디를 입력해 주세요\"]","value":"h.jee",
  "timeout":15000,"waitCondition":"visible","screenshot":"on_failure","onFailure":"fail",
  "retry":{"enabled":false,"count":3},
  "assertion":{"enabled":false,"inputValue":"","expected":"","componentType":"textbox","state":""},"note":"",
  "target":{"kind":"role","role":"textbox","name":"아이디를 입력해 주세요","exact":true} }
```

### press — a keyboard key on the focused/target element
`value` is a key name: `Enter`, `Tab`, `Escape`, `ArrowDown`, etc.
```json
{ "id":"s3","type":"press","title":"... 키 누르기",
  "locator":"role=textbox[name=\"항목 이름 또는 값을 입력해 주세요\"]","value":"Enter",
  "timeout":15000,"waitCondition":"visible","screenshot":"on_failure","onFailure":"fail",
  "retry":{"enabled":false,"count":3},
  "assertion":{"enabled":false,"inputValue":"","expected":"","componentType":"textbox","state":""},"note":"",
  "target":{"kind":"role","role":"textbox","name":"항목 이름 또는 값을 입력해 주세요","exact":true} }
```

### click — buttons, menu items, options, table icons
`value` is `"-"`. Target is a role=button, a text= menu label, or an xpath for modal-scoped controls.
```json
{ "id":"s17","type":"click","title":"다음 클릭","locator":"role=button[name=\"다음\"]","value":"-",
  "timeout":15000,"waitCondition":"visible","screenshot":"on_failure","onFailure":"fail",
  "retry":{"enabled":false,"count":3},
  "assertion":{"enabled":false,"inputValue":"","expected":"","componentType":"button","state":""},"note":"",
  "target":{"kind":"role","role":"button","name":"다음","exact":true} }
```

### check / uncheck — checkboxes (also used for "확인했습니다" confirmations)
```json
{ "id":"s55","type":"check","title":"확인했습니다 체크","locator":"role=checkbox[name=\"확인했습니다\"]","value":"-",
  "timeout":15000,"waitCondition":"visible","screenshot":"on_failure","onFailure":"fail",
  "retry":{"enabled":false,"count":3},
  "assertion":{"enabled":false,"inputValue":"","expected":"","componentType":"checkbox","state":""},"note":"",
  "target":{"kind":"role","role":"checkbox","name":"확인했습니다","exact":true} }
```

### assert — verification (this is where 예상 결과 becomes a check)
`assertion.enabled` MUST be `true`. `value` mirrors the Playwright call for readability.
Async state changes (BUILD→ACTIVE, deletion toasts) use `timeout: 150000` and `retry.enabled: true`.

Visible check (`kind: "visible"`):
```json
{ "id":"s45","type":"assert","title":"ACTIVE 표시 검증","locator":"text=\"ACTIVE\"","value":"toBeVisible()",
  "timeout":150000,"waitCondition":"visible","screenshot":"on_failure","onFailure":"fail",
  "retry":{"enabled":true,"count":3},
  "assertion":{"enabled":true,"kind":"visible","inputValue":"","expected":"","componentType":"text","state":"visible"},"note":"",
  "target":{"kind":"text","text":"ACTIVE","exact":true} }
```
Text-contains check (`kind: "text"`, `match: "contains"`):
```json
{ "id":"s32","type":"assert","title":"vue-app 텍스트 포함 검증","locator":"#vue-app","value":"toContainText('auto')",
  "timeout":15000,"waitCondition":"visible","screenshot":"on_failure","onFailure":"fail",
  "retry":{"enabled":false,"count":3},
  "assertion":{"enabled":true,"kind":"text","inputValue":"auto","expected":"auto","componentType":"vue-app","state":"text","match":"contains"},"note":"",
  "target":{"kind":"css","selector":"#vue-app"} }
```
Other `assertion.kind` values (from Tremolo types): `hidden`, `value`, `checked`, `enabled`,
`disabled`. `match` is `contains` (default for text) or `equals`.

### antdSelect — AntD `<Select>` dropdown (portal/virtual-scroll safe)
`value` = option text to pick (`__DEFAULT__` = keep the pre-selected default). The `by` mode is the
hard part — pick it from the live DOM (see `authoring-patterns.md` §3 "Pick a dropdown option"):
`by:'label'` when the Form.Item has visible label text (default); `by:'auto'` **with a css `#id` root**
(`target:{kind:'css',selector:'#networkId'}`) when there's no label but a stable id (e.g. 유동 IP form).
Note: `by:'auto'` with only a label/text target and no root FAILS ("host not found").
```json
{ "id":"s14","type":"antdSelect","title":"복구 방식: auto 선택","locator":"label=\"복구 방식\"","value":"auto",
  "timeout":15000,"waitCondition":"visible","screenshot":"on_failure","onFailure":"fail",
  "retry":{"enabled":false,"count":3},
  "assertion":{"enabled":false,"inputValue":"","expected":"","componentType":"","state":""},"note":"",
  "target":{"kind":"label","label":"복구 방식","exact":true},
  "antd":{"by":"auto"} }
```

### antdTableSelect — pick a row in an AntD `<Table>` by its cell text
`antdTable.match` is an AND-list of texts that uniquely identify the row (leave `target`/`locator`
as `"-"`). `control` = `radio` | `checkbox` | `auto`; `action` = `check` | `uncheck` | `click`.
```json
{ "id":"s21","type":"antdTableSelect","title":"AntD 표 행 선택: hh-ca-image ACTIVE","locator":"-","value":"-",
  "timeout":15000,"waitCondition":"visible","screenshot":"on_failure","onFailure":"fail",
  "retry":{"enabled":false,"count":3},
  "assertion":{"enabled":false,"inputValue":"","expected":"","componentType":"","state":""},"note":"",
  "antdTable":{"match":["hh-ca-image ACTIVE"],"control":"radio","action":"check"} }
```

### Rarely needed (supported by Tremolo, not used in the current corpus)
`type` (types char-by-char), `select` (native `<select>`), `upload` (file input / chooser),
`scroll`. Prefer `fill` over `type`, and `antdSelect` over `select` for this AntD app. Only reach
for these if a TC genuinely needs them.

---

## Locator `target` kinds
Prefer **role** and **text** (stable, human-readable). Fall back to xpath/css only for
modal-scoped or id-less controls, mirroring how Tremolo recorded similar steps.

| kind | fields | example |
|---|---|---|
| `role` | `role`, `name`, `exact` | `{"kind":"role","role":"button","name":"다음","exact":true}` |
| `text` | `text`, `exact` | `{"kind":"text","text":"컴퓨트","exact":true}` |
| `label` | `label`, `exact` | `{"kind":"label","label":"복구 방식","exact":true}` |
| `placeholder` | `placeholder`, `exact` | `{"kind":"placeholder","placeholder":"검색","exact":true}` |
| `title` | `title`, `exact` | `{"kind":"title","title":"닫기","exact":true}` |
| `altText` | `alt`, `exact` | `{"kind":"altText","alt":"logo","exact":true}` |
| `testId` | `testId` | `{"kind":"testId","testId":"submit"}` |
| `css` | `selector` | `{"kind":"css","selector":"#vue-app"}` |
| `xpath` | `selector` | `{"kind":"xpath","selector":"xpath=(//...)[last()]"}` |

Disambiguation when a locator matches several elements — add to any single target:
```json
"order": "first"           // first match
"order": "nth", "nth": 1   // 0-based index
```
Roles observed in this app: `textbox` (most inputs), `button`, `spinbutton` (numeric inputs),
`checkbox`, `dialog`, `tab`, `cell`.
