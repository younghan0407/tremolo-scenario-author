# 탐색 → 제안 → 확인 (explore → propose → ask)

TC가 조건을 **다 정의하지 않는** 복잡·다단계 폼(예: 로드밸런서 5단계 마법사, 세션 유지 유형의 활성/비활성
조건이 사전조건에 없음)에서 **멈추지 않고** 커버리지를 넓히기 위한 절차. 이 하네스의 목적은
"AI로 자동화 커버리지를 확장"하는 것이므로, `확인 필요`로만 방치하지 말고 아래를 수행한다.

## 원칙
- **CUD를 끝까지 실행하지 않는다.** 탐색은 화면 요소를 **수집만** 한다(생성/저장/삭제 금지). 변경이 필요한
  케이스(정상 생성)는 **opt-in + teardown**으로 따로 뽑고 사용자 확인을 받는다.
- **지어내지 않는다.** 화면에서 실제로 수집한 요소만 testdata로 쓴다. 못 본 것(닫힌 select 옵션 등)은
  `need: 실측 필요`로 표시한다. TC에서 온 값(예: 세션 유지 유형 옵션명)은 그대로 쓰되 라이브로 재확인한다.
- **결정은 사용자에게 묻는다.** 후보를 자동 생성하되, 무엇을 실제 스크립트로 만들지는 **사용자가 고른다**.

## 절차
1. **탐색(explore)** — `scripts/live/explore.mjs`
   - `--url <생성 URL>` 또는 `--nav "메뉴>서브" --open "add 생성"` 로 생성 폼/마법사 진입.
   - 각 단계의 `.ant-form-item`을 수집: 라벨 · 필수(*) · 타입(textbox/textarea/number/select/radio/checkbox/switch/table)
     · 옵션(radio/checkbox 인라인, select는 `--open-selects` 시 열어서) · 제약(min/max/maxLength).
   - **'다음'만 눌러** 단계를 넘기고 마지막에서 멈춘다. **'생성/저장/삭제/확인'은 절대 클릭하지 않는다.**
   - 산출물: `output/testdata/explore/<name>.explore.json` (단계별 필드 카탈로그 = testdata).
2. **제안(propose)** — `scripts/testdata/propose.mjs <name>.explore.json`
   - 일반 QA 관점 후보를 생성:
     - **필수값 누락**: 필수 필드별 1건(omit → `필수 입력/선택 값입니다.`). 안전·비변경. 신뢰도 높음.
     - **옵션 EP**: radio/select 옵션별 1건(선택 + 노출/활성 확인). 옵션 수집돼야(없으면 `--open-selects` 필요).
     - **경계값 BVA**: number(min/max/±1), 길이 제약(maxLength/+1). 검증 메시지 assert.
     - **정상 생성(해피)**: 모든 필수 유효 → 제출. **⚠ 변경(CUD)** — opt-in + teardown 필수.
   - 각 후보에 `confidence(●◐○)` · `mutating(⚠)` · `need(추가 실측)` 표기. `--json`으로 기계용 출력.
3. **확인(ask)** — AI가 후보 목록을 사용자에게 제시하고 **만들 케이스를 고르게 한다**(AskUserQuestion 등).
   - 기본 추천: 필수값 누락 + 옵션 EP(수집된 것) + BVA(비변경, 안전). 정상 생성은 사용자가 명시적으로 선택할 때만.
4. **작성** — 선택된 후보만 `<name>.steps.json`으로 옮겨 `generate.mjs` → `verify.mjs`.
   - 옵션 EP에서 "특정 프로토콜일 때 특정 세션 유형이 비활성" 같은 **조건부 규칙이 TC/기획서에 없으면**,
     '비활성' 단정 대신 **현재 활성/비활성 상태를 그대로 assert**하고 그 전제를 `note`에 `확인 필요`로 남긴다.

## 신뢰도 표기(정직성)
- `●` 높음(결정적, 필수 검증 메시지 등) · `◐` 보통(라이브 확인 권장) · `○` 낮음(옵션 미수집 등 실측 필요).
- `⚠변경`은 실제 자원을 만들므로 자원 이름은 `qa-trml-{YYMMDD_HHMMSS}-<용도>`(+`runtime.saveAs` 별칭) + 삭제 teardown을 반드시 포함(`grounding-policy.md` '실측 자원 제한').

> 요약: **explore(수집·무변경) → propose(일반 QA 후보) → ask(사용자 선택) → 작성**.
> "TC에 없어서 못 만든다"가 아니라, "화면에서 이만큼 가능하니 무엇을 만들까요"로 커버리지를 넓힌다.
