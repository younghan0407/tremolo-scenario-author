# examples — 실측 녹화본 (참고용, 새니타이즈됨)

이 폴더는 **CONTRABASS / 306tst 환경에서 Tremolo가 실제로 녹화·생성한** 시나리오 3종입니다.
각 항목은 `.spec.ts`(Playwright 코드) + `.spec.ts.meta.json`(**Step IR — 정본/교보재**) 쌍입니다.

## 용도 (왜 넣었나)
- Step IR의 정확한 형태와 핵심 레시피의 **가장 신뢰도 높은 예시**입니다. 새 시나리오를 저작할 때
  산문 설명(`references/*`)과 함께 이 실측 예시로 패턴을 대조하세요. 담긴 패턴:
  - **antdTableSelect** — 표에서 행 텍스트로 선택(이미지/flavor/세그먼트/키페어)
  - **antdSelect `by:'auto'` + css `#id` root** — 라벨 없는 Select(`#networkId`/`#subnetId`)
  - **`role="switch"` 라벨-근접 xpath** — 토글 스위치
  - **생성 → 검증(토스트/상태) → teardown(삭제)** 자기완결 흐름

## 반드시 지킬 것
1. **셀렉터·리소스 값은 CONTRABASS/306tst 전용**입니다. 다른 솔루션(CMP/VIOLA)·다른 환경에서는
   필드 라벨·`add 생성`·`#id`·리소스명이 다를 수 있습니다. **그대로 베끼지 말고 대상 솔루션에서 재실측**하세요
   (`references/authoring-patterns.md` §4b, §5). 이 파일들은 *방법(IR/레시피)* 참고용이지 *셀렉터의 정답*이 아닙니다.
2. 계정정보는 `<PASSWORD>` / `<MFA_CODE>` / `<ID>` 로 **치환(redacted)** 돼 있어 그대로는 실행되지 않습니다.
   실행하려면 본인 환경 값으로 채우세요(로그인은 `assets/preamble.login.json` 사용 권장).

## 포함 목록
| 파일 | 대표 패턴 |
|---|---|
| `instance_create` | antdTableSelect(이미지·flavor·세그먼트·키페어) + antdSelect + 생성/teardown 종합 |
| `[컴퓨트]-[인스턴스]-[작업-유동IP추가및해제]` | antdSelect `by:'auto'` + `#networkId`/`#subnetId` (라벨 없는 Select) |
| `[컴퓨트]-[인스턴스]-[작업-무중단사양변경]` | `role="switch"` 라벨-근접 xpath 토글 |

> ⚠ **`instance_create`의 로그인 블록은 구버전 7스텝 녹화**(별도 `로그인` 버튼 클릭 포함)입니다. 현재 규칙은
> **6스텝·비밀번호 Enter 제출**(별도 로그인 클릭 없음)이니 **로그인 부분은 복사하지 말고** `assets/preamble.login.json`
> 을 쓰세요. 이 예시의 가치는 로그인이 아니라 **본문의 antdTableSelect/antdSelect/switch 패턴**입니다.
