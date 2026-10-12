# TestData catalog + 동등분할(EP) / 경계값(BVA) 파생

기능 TC 워크북의 `테스트 데이터` 컬럼은 사실상 비어 있다(634건 중 1건). 따라서 옵션 도메인은 **실제 폼을
실측(live grounding)해 우리가 정의**하고, 거기서 EP/BVA 케이스를 파생해 Tremolo 시나리오로 만든다.

## 1) 카탈로그 파일 — `output/testdata/<function>.json`
기능 1개당 1파일. 스키마:
```jsonc
{
  "function": "인스턴스 생성",
  "nav": "컴퓨트>인스턴스",          // 진입 경로 (생성 버튼 클릭 포함)
  "openAction": "생성",              // 폼/마법사를 여는 버튼 라벨
  "options": [
    {
      "id": "name",
      "label": "이름",
      "field": { "type": "textbox", "name": "이름을 입력해 주세요" },  // Step target 근거
      "valueType": "string",
      "constraints": { "minLen": 1, "maxLen": "TBD", "charset": "TBD" }, // ← live 확인 전 TBD
      "nominal": "qa-trml-{YYMMDD_HHMMSS}-ep",                                          // 다른 옵션 고정용 유효값
      "equivalence": [
        { "class": "valid",           "example": "qa-trml-{YYMMDD_HHMMSS}-ep01",  "expect": "pass" },
        { "class": "invalid-empty",   "example": "",               "expect": "reject" },
        { "class": "invalid-charset", "example": "이름@#!",        "expect": "reject", "note": "특수문자/한글 허용여부 live 확인" }
      ],
      "boundary": [
        { "name": "min(1)",     "value": "a",              "expect": "pass" },
        { "name": "maxLen",     "value": "<maxLen chars>", "expect": "pass",   "note": "maxLen live 확인" },
        { "name": "maxLen+1",   "value": "<maxLen+1>",     "expect": "reject", "note": "초과 시 검증 메시지" }
      ]
    }
  ]
}
```
- `constraints`에서 모르면 **`"TBD"`로 두고 절대 추측하지 않는다**. `probe.mjs`(또는 라이브)로 폼을
  열어 실측한 뒤 채운다(필드 placeholder, maxlength, 도움말, 실제 검증 메시지 텍스트).
- `field`는 `authoring-patterns.md`의 recipe로 그대로 Step target이 된다(textbox/spinbutton/antdSelect/antdTableSelect).

## 2) 케이스 파생 (one option at a time)
한 번에 **한 옵션만** EP 클래스 + BVA 포인트로 변화시키고, 나머지 옵션은 `nominal`(유효값)로 고정한다.
- **유효 케이스** → 성공을 **결정적 텍스트**로 assert: 상태어(BUILD→ACTIVE), 완료 토스트
  (`인스턴스(<name>) ... 완료`). 실제 자원을 만들므로 **mutating = opt-in** + `qa-trml-{YYMMDD_HHMMSS}-` 이름 + 종료 시 정리.
- **무효 케이스** → 폼이 거부해야 함: **검증/에러 메시지(결정적)** 가 보이고 제출이 막히는지 assert.
  메시지 텍스트는 **반드시 live로 실측 후** 기입(추측 금지). 제출 버튼 비활성/차단도 확인 대상.
- 로그인+네비 프리앰블은 공통, 케이스마다 **대상 필드 값만** 바뀐다.

## 3) BVA / EP 규칙
- BVA 포인트: `min, min-1, max, max+1` + 문자열은 `empty, maxLen, maxLen+1`.
- EP 클래스: 유효 1개 + 무효 사유별 1개(대표값 1개씩).
- **결정적 assert만**(검증 메시지는 결정적; 생성된 자원의 동적값은 아님 → 상태어/토스트만). 동적값은 `deferred:dynamic`.

## 4) 산출 & 커버리지
- 카탈로그 → 케이스 매트릭스 → 케이스별 `<name>.steps.json` → `generate.mjs` → `verify.mjs`.
- 시나리오 이름: `[Depth1]-[Depth2]-[기능-옵션-클래스]`, 예: `[컴퓨트]-[인스턴스]-[생성-이름-경계 maxLen+1]`.
- `coverage.md`에 각 케이스의 커버 TC ID(없으면 `derived:EP` / `derived:BVA`) 기록.

## 5) 자동화 스크립트 `derive.mjs`
`node scripts/testdata/derive.mjs <catalog.json> [--option <id>] [--generate] [--verify]` — 카탈로그를 읽어
케이스별 `steps.json`을 파생하고, `--generate`면 spec+meta까지, `--verify`면 정적 검증까지 일괄 수행한다.
- **필수 필드(안 그러면 파생 스킵)**: 무효(reject) 케이스는 각 `equivalence[]`/`boundary[]` 항목에 **`assertText`**
  (예: `정수만 입력 가능 합니다.`)가 있어야 하고, 유효(pass) 케이스는 옵션에 **`messages`**(성공/토스트 문구)가 있어야 한다.
- 검증 문구(`assertText`/`messages`)는 **라이브 실측으로** 채운다(예측 금지 — 실제와 다르면 반드시 실패). standalone에서도 동작.
