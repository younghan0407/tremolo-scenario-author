# 실측 교훈 — CONTRABASS 4.0 (400tst, 2026-09~10, 54 시나리오 작성 중 축적)

새 화면/솔루션 작업 전에 훑어볼 것. **화면 사실은 4.0 기준** — 다른 버전·솔루션은 같은 방식으로 재실측해 확정한다.

## 1. 자주 막힌 곳 → 단축 방법

| 막힌 곳 | 원인 | 단축/해결 |
|---|---|---|
| 실측 결과가 갑자기 전부 MISSING | **같은 계정 중복 로그인 불가** — 두 번째 로그인이 첫 세션을 끊음(배치 겹침, 확장 Chrome·Tremolo 앱 동시 로그인) | 계정 1개당 동시 1세션(lib.mjs 잠금). 병렬은 **계정 풀**(`env.mjs account add`, `set maxParallel N`) — 빈 계정 자동 배정. 계정은 **환경별 전용 계정**(사용자에게 1회 받기, `env.mjs set id/password`). 작업 중 사용자 Chrome/앱 로그인 자제 요청 |
| 재생성하면 실측 스탬프가 사라짐 | steps 파일엔 스탬프가 없음 | `generate.mjs` 가 같은 id+title 의 스탬프를 자동 보존(기본). 스텝을 고친 경우만 그 스텝 재실측(`ground --range sA:sB`) |
| 셀렉터 조사에 시간이 많이 듦 | 스크린샷/ARIA 를 사람이 읽는 방식 | `live/walk.mjs` 로 한 번에 **eval 덤프**: `main h1`(필드 라벨), `input id/placeholder/value/disabled`, `.ant-select` 텍스트·disabled, 표 `th`/행, 버튼 텍스트, 열린 모달 텍스트. 1회 walk 로 화면 1개를 거의 확정 |
| 사전데이터가 없어 대부분 미실측 | 시나리오 전제 자원(인스턴스·LB·포트 등) 부재 | **사전데이터를 먼저 만든다**(가장 큰 단축). 임시로는 `--subst 생성자원=기존자원`. 단 대체 자원의 값 차이는 TC 불일치가 아님(ground 가 `[예측] 대체자원 값/상태 차이`로 표기) |
| 대체 자원이 목록에 안 보임 | 다른 프로젝트 자원은 **전체 프로젝트 컨텍스트**에서만 보임 | 실측 전 컨텍스트 전환 → 실측 → **반드시 원복**(아래 §3) |
| 한글 경로·이름 깨짐 | Windows 셸 cp949, CRLF | 시나리오명(한글·대괄호·공백)은 셸 반복문 대신 Python/Node 로 처리, `PYTHONIOENCODING=utf-8`, 줄 끝 `\r` 제거 |
| 같은 버튼이 두 개(AMBIGUOUS) | 브레드크럼 'VPC', 검색 칩, 숨은 모달 | 재진입은 `goto <목록 URL>`, 행 클릭은 표 셀로 한정, 모달은 `ant-modal-wrap[not(display:none)]`로 한정 |
| 드롭다운 선택이 반영 안 됨(실측) | AntD 검색 input(opacity 0) 클릭 → 안 열림 / 열리는 애니메이션 중 클릭 | ground 가 `.ant-select-selector` 를 클릭하고 옵션 가시화 대기 후 **정확 일치** 클릭(수정됨) |
| 폼 페이지에서 제출 이후 스텝이 모두 사라짐 | `--continue` 는 제출 건너뛴 뒤 '취소'로 닫음 → 페이지 폼에선 이탈 | 검증용 제출(빈값 [수정] 등)은 **그 폼의 마지막 스텝**으로 배치 |
| 병렬 실행 중 컨텍스트 전환이 안 됨(전부 MISSING) | **잠금 대기 시간이 호출자 타임아웃에 포함** — 래퍼(예: 280s)가 잠금 대기 중 프로세스를 죽여 전환 단계가 빠짐 | 라이브 호출을 감싸는 스크립트 타임아웃은 잠금 대기를 고려해 넉넉히(수십 분). 컨텍스트 전환 실패 시 이어지는 실측을 중단 |
| 메뉴 클릭 간헐 Timeout | 드롭다운 애니메이션 | 재시도로 해결되는 경우 다수 — 셀렉터를 바꾸기 전에 1회 재실측 |
| 로그인 만료 팝업 | 장시간 탐색 | `[연장]` 클릭(walk/ground 자동) |

## 2. 예상과 다른 동작·화면 사실 (4.0)

**공통 AntD/레이아웃**
- 목록 생성 버튼 `add 생성`, 행 메뉴 `more_horiz`, 메뉴 항목 `role=menuitem`(정확 이름). 상세 상단 `수정`/`delete 삭제`/`arrow_back`.
- **폼 라벨은 `main h1`**(필드 오류 = 라벨 h1 다음의 `.ant-form-item-explain-error`). 필수 문구는 화면마다 다름:
  `필수 입력 값입니다.` / `필수 선택 값입니다.` / `이름을 입력해 주세요.` / `CIDR를 입력해 주세요.` — **TC 문구와 대조**.
- **라벨이 연결된 input 은 접근성 이름 = 라벨**(placeholder 아님). 예: 서브넷 게이트웨이 → `게이트웨이 IP`. 한글 id(`#이름`, `[id='할당 방식']`) 화면은 css id 로 지정.
- Select: 열기는 `.ant-select-selector` 클릭. 옵션 `title` 이 null 인 화면 있음 → **옵션 텍스트 정확 일치**로 선택. 선택값 확인은 `ancestor ' ant-select '`(정확한 클래스 토큰 — `ant-select-selection-search` 오매칭 주의) 의 텍스트.
- 탭 선택 `[role=tab][aria-selected=true]`, 숨은 탭패널 `[aria-hidden=true]` 제외. **상세 첫 탭 이름은 '세부 정보'**(TC '상세').
- Segmented(유동 IP 할당 자원 타입 등) `label.ant-segmented-item(-selected)`. 라디오/체크 선택 상태 `ant-radio-wrapper-checked`/`ant-checkbox-wrapper-checked`.
- 마법사 단계: 현재 단계 `.ant-steps-item-active`(끝맺음 일치로 '풀' vs '풀 멤버' 구분).
- 상세 정보 박스: `li.ant-list-item > .key-area(라벨) / .value-area(값)`.
- 검색 칩은 **누적(AND)** → 시나리오 내 검색은 공통 접두사로 1회. 모달은 **Escape 로 닫히지 않음**(취소/close). 닫힌 모달이 DOM 에 `display:none` 으로 남음.
- 삭제 확인 팝업: `확인했습니다.` 체크 → `[삭제]`(TC 는 대개 [확인]). 쿼터 팝업: 제목=프로젝트명, `[확인]`으로 닫음.
- 전체 프로젝트 컨텍스트: `쿼터 확인` 비활성, 프로젝트 드롭다운 활성. 전환하면 대시보드로 이동(목록은 `goto` 로 재진입).

**TC 와 자주 다른 패턴(보고 대상)**
- '사용 안 함/미사용' 선택 시 하위 항목이 **비활성 아님 → 미노출**(LB 마법사 전 단계, 서브넷 게이트웨이, 포트 보안 그룹, 포트 타입).
- 목록/탭의 **일괄 [삭제] 버튼 없음**(행 메뉴·행 아이콘으로만 삭제) — 서브넷·포트·정적 경로·보안 규칙.
- '화면 이동'으로 적힌 수정/생성이 **팝업**(세그먼트·라우터 수정, 정적 경로 생성).
- 버튼/메뉴/라벨 명칭 차이: `+ Add New`→`필드 추가`, `[확인]`→`[수정]/[추가]/[삭제]`, `[제출]`↔`[저장]`, `사용 안함`→`미사용`, `프로토콜`→`타입`(헬스 체크), `할당 풀`→`DHCP 풀`, `사용 가능 IP`→`미사용 IP`, `Thanos(Prometheus)`→`PROMETHEUS`.
- 자동 보정이 아니라 **검증 메시지**(LB 임계치 최소/최대), 토글 off→on 시 **값 유지**(초기화 아님).

## 3. 안전 (실측은 `qa-trml-{yymmdd}` 자원만 변경 — 2026-10-06 개정, 그 전까지는 비변경)
- 제출 차단 단어: `생성 저장 삭제 수정 적용 등록 확인 연결 해제 추가 변경 복원 실행 시작 종료 재시작 업로드 교체 이동 복사 백업
  마이그레이션 초기화 조치 무시 전송 불러오기 연동 해지 분리 할당 반납 제출`(ground·walk 공통). **새 화면의 제출 버튼 이름이 목록에 없으면 먼저 추가**.
- `…해제/해지` 로 끝나는 행 메뉴는 팝업 없이 즉시 실행될 수 있어 제출로 간주.
- 검증용 빈값 제출은 `[검증클릭]` 태그로만 허용 — **클라이언트 검증으로 막히는 것을 walk 로 확인한 경우만**. 대체 자원이 타 팀/타 프로젝트 자원이면 붙이지 않는다(검증이 안 막으면 실제 변경).
- 컨텍스트(테넌트 내비게이터)는 **계정 단위로 서버 저장** → 전환했으면 작업 끝에 원복하고 확인(다른 실행·사용자에게 영향).
- walk 에서 `force` 클릭 금지(빈 폼 [생성]이 실제 눌린 사례 — 변경은 없었음).

## 4. 작성 요령
- 같은 화면 TC 를 한 시나리오로 묶고, **화면 1개 = walk 1~2회**로 확정 후 작성 → 생성 → 실측을 **한 턴에 연속**(멈추지 않음).
- 반복 xpath 는 작은 헬퍼로(정보 박스 항목, 탭 선택 검증, 모달 한정 버튼, 행 라디오/선택 검증, 필드 오류).
- 자원명은 `qa-trml-{YYMMDD_HHMMSS}-<용도>`(시나리오가 생성, 별칭으로 재사용) / `qa-trml-{yymmdd}-<용도>`(사전데이터)로 쓴다
  (2026-10-06 개정 — 그 전 스크립트의 `qa-auto-*`/`pqa-auto-*` 는 구 규칙, 일괄 전환 예정). `--subst` 치환은 **긴 이름 먼저**.
- 생성 시나리오는 teardown(삭제) 포함. 상태 대기형 assert(ACTIVE 등)는 timeout 150s.

## ⚠ 사고(2026-10-02): 비변경 실측 중 실제 변경 발생 — xpath 제출 버튼 차단 누락
- **원인**: `ground.mjs` 의 제출 차단(MUT_WORDS)이 role 버튼 이름·특정 translate xpath 만 검사. 팝업 제출을 xpath 로 잡은 스텝
  (`//div[ant-modal-wrap]//button[normalize-space(.)='삭제']`, 제목 "팝업 [삭제] 클릭")은 차단되지 않고 **실제로 클릭**됨.
  `--subst` 로 생성 자원을 **타인 기존 자원**으로 바꾼 상태라 그 자원이 삭제·수정·복원됨(VG 삭제, 스냅샷 삭제, 볼륨 수정·상태 ERROR, 볼륨 타입 설명/메타데이터 변경, 백업 복원·삭제 등).
- **조치**: ground/walk 모두 xpath·css 셀렉터 안의 모든 텍스트 비교값 + 제목의 `[라벨]` 까지 MUT_WORDS **전체 일치** 검사(아이콘 버튼 'add 생성'·'delete 삭제'는 폼/팝업 열기라 허용).
  walk 는 `note:'[검증클릭]'` 인 빈 폼 검증 클릭만 예외.
- **규칙**: (1) 새 클릭 헬퍼를 만들면 **실측 전에** mutLabel 이 그 스텝을 차단하는지 확인. (2) `--subst` 대상은 **QA 전용 자원만**(타 팀 자원 금지).
  (3) 실측 결과에 팝업 제출 스텝이 `[실측]`(FOUND)으로 찍혔으면 즉시 중단·점검 — 비변경 실측에서 제출 스텝은 항상 '제출 미수행'이어야 한다.

## 2026-10-06 스토리지 작업에서 추가로 고친 것
- **LNB 진입**: 그룹 제목 텍스트는 아이콘 리거처 포함('Storage스토리지') → `clickText` 가 대시보드 위젯과 AMBIGUOUS.
  DSL `nav()` 는 `menu-wrap` 안 `ant-menu-submenu-title` 의 `span.ellipsis-text` 정확 일치로 클릭.
- **재생성 carry**: 실측 스탬프를 이어받을 때 note 끝 `TC <id>` 매핑은 새 steps 기준으로 교체(매핑 수정이 묻히던 문제).
- **재실측이 TC 불일치 판정을 덮어씀**: ground `--write` 는 `stamp.mjs mismatch` 로 확정된 스텝이 여전히 실패면 판정 유지(통과로 바뀌면 재스탬프).
- **`--range` 는 `sA:sB`** — 형식이 틀리면 이전엔 아무 것도 스탬프 안 하고 조용히 끝났음 → 이제 오류로 중단.
- **생성 화면은 페이지일 수 있음**: 공유 파일·버킷 생성은 팝업이 아니라 `/create` 페이지(h1 제목). 버킷 이름 placeholder 는 '이름을 입력해주세요'(띄어쓰기 없음),
  공유 파일 용량은 number input(`#size`, role spinbutton → textbox 이름으로 못 찾음).
- **필드 검증 문구는 필드마다 다름**: 같은 폼에서도 '필수 입력 값입니다.'/'필수 선택 값입니다.'/'이름을 입력해 주세요.' 혼재 → 항목별 실측 후 매핑(TC id 를 필드에 정확히 대응).

## 2026-10-06 하네스 리뷰 반영(11건)
- **변경 차단을 이름 추정에만 맡기지 않는다**: 입력란 Enter·이름 없는 css 버튼·'재시작' 메뉴·walk `clickText` 가 제출 판정을 빠져나가
  실제로 눌린 사례(로컬 재현). → 공통 정책 `live/mutation.mjs` + 로그인 이후 비-GET 요청 네트워크 차단. 화면 단이 놓쳐도 서버 변경은 안 일어난다.
- `--mutate` 의 qa-trml 판정은 **누르는 요소 기준**(그 행 / 메뉴를 연 행 / 그 팝업 / 선택 행 / 폼). 페이지 어딘가에 qa-trml 이름이 있다고 통과시키지 않는다.
- 실측과 생성 코드의 판정을 맞춘다: order/nth 는 모든 대상 종류에 적용, assert 다중 매칭은 AMBIGUOUS(생성 코드는 strict 로 실패).
- 재생성 시 대상·값·검증 조건이 바뀐 스텝은 실측 무효화. 표 선택 스텝도 완료 검사 대상.
- finalize 는 생성 실패 시 중단, install 은 지문 대조 + 재검증 후 설치·스냅샷, record 는 실행 당시 스냅샷으로 매핑(TC 범위 포함).
- smoke 는 전체 경로로 대상 한정, 종료 코드·전역 오류까지 Pass 조건, 결과는 항상 이번 상태로 덮어씀.

## 2026-10-06 F 영역(랙 구성도) 작업에서
- **qa-trml 이름 길이**: `qa-trml-{YYMMDD_HHMMSS}-` 가 22자. 랙 이름은 2~30자 제한 → 용도 부분은 **8자 이내**(예: `-rack`, `-f7st`).
  길이 초과면 1단계에서 '2 ~ 30자 사이 길이만 사용 가능합니다.' 로 멈춘다(제출 전 클라이언트 검증).
- **숫자 입력란은 role=spinbutton**: 랙 크기·층처럼 −/+ 가 붙은 AntD InputNumber 는 `getByRole('textbox')` 로 안 잡힌다.
- **시나리오 자체 셋업/정리**: 사전데이터(데이터 센터·랙)도 시나리오 앞에서 qa-trml 로 만들고 끝에서 지운다(rack_setup/rack_teardown).
  단 중간 실패로 teardown 이 안 돌면 자원이 남는다 → ground 끝의 "생성했을 수 있는 qa-trml 자원" 목록을 반드시 확인·정리.
- 상세 팝업 [확인] 처럼 닫기만 하는 버튼은 note `[비변경]` 으로 명시(화면 단 판정이 '확인'을 제출로 본다).
- **네트워크 차단이 세션 유지까지 막은 사례(2026-10-06)**: 10~15분 넘는 실측이 중간에 로그인 화면으로 튕겨 뒤 스텝이 전부 MISSING·teardown 미수행.
  원인은 콘솔이 주기적으로 보내는 토큰 갱신(`POST /v1/bootfactory/api/token/extend|verify/refresh|expired/refresh`)이 차단된 것.
  → `envs.json` 전역 `live.allowRequests` 에 세션 유지 요청만 허용. ground 는 이제 로그인 화면 이탈을 감지해 즉시 '세션 종료'로 보고하고,
  끝에 막은 요청 목록을 출력한다. 조회만으로 짧게 점검하면 이런 주기 요청이 안 드러나므로, 새 환경은 15분 이상 실측 1회로 확인할 것.
- **단계형 팝업의 마지막 제출**: 장비 등록 마법사는 앞 단계 입력란을 DOM 에서 제거한다 → 마지막 [등록] 시점에 팝업 안에 이름이 없다.
  ground 는 qa-trml 이름을 직접 입력한 팝업에 표시(data-tremolo-qa)를 남겨 그 팝업의 제출을 허용한다.
- **수정 마법사의 마지막 버튼은 '수정'**: 랙·장비 등록 마법사는 마지막 단계가 [등록]이지만, 같은 마법사의 수정 모드는 [수정]이다
  (2026-10-06 walk 실측). '등록'으로 쓰면 MISSING → 뒤의 '변경 후 값' 검증이 줄줄이 실패한다.
- **닫힌 AntD 드롭다운의 옵션도 DOM 에 남는다**: `ant-select-dropdown` 이 숨김 클래스(`ant-select-dropdown-hidden`)로만 가려져
  `[1]` 첫 옵션이 다른(이전에 연) 드롭다운의 항목을 집는다. 옵션 xpath 는 `not(contains(@class,'ant-select-dropdown-hidden'))` 로 한정
  (`st_common.DD_OPT`). 모델명처럼 **선행 선택(제조사)에 따라 옵션이 채워지는 드롭다운**은 앞 선택 없이 열면 비어 있다.
- **장비(서버) 수동 등록 필수값**: 관리 IP·하이퍼바이저명/ID 외에 NIC명, 포트 행마다 MAC, IPMI IP·포트·ID·비밀번호가 필수.
  MAC 은 **대시 형식만 통과**(`00-00-5E-00-53-01`; 콜론 형식은 '유효한 Mac Address를 입력해 주세요.'). 더미 값은 문서용 대역
  (IP 192.0.2.x, MAC 00-00-5E-00-53-xx)으로 — 실 장비에 닿지 않게.
- **스위치 운영 방식은 모델에 종속**: Cisco default·WS-C2960S → SNMP 만, N9K 계열 → NX-OS / NX-OS(ACI). 입력란은 NX-OS = NX-API IP·아이디·비밀번호,
  NX-OS(ACI) = APIC·APIC-IP(+[APIC-IP 추가])·APIC 관리 아이디·비밀번호. SNMP 필드는 모든 방식에 있다.
- **같은 랙에 장비 2대**: U 지정이 겹치면 다음 단계로 못 간다 → 시나리오 안에서 만드는 장비마다 다른 유닛을 준다.
- **닫힌 행 메뉴(⋯)도 DOM 에 남는다(랙 구성도)**: `ant-dropdown` 이 숨김 클래스 없이 남아 xpath `[1]` 이 이전에 연 행의 메뉴를 집는다
  (클릭은 '성공'인데 아무 일도 안 일어남 → 뒤 스텝 줄줄이 MISSING). 행 메뉴 항목은 **role=menuitem**(보이는 것만 매칭)으로 누른다.
- **ground 의 로그인 면제는 프리앰블만**(2026-10-07 수정): 본문의 '비밀번호를 입력해 주세요.'(장비 IPMI 등)가 로그인 입력으로 오인돼
  건너뛰어지고, 그 결과 필수값 누락으로 등록이 실패했다. 이제 맨 앞 goto·로그인 묶음만 면제한다. 또 type=password 입력은 textbox role 이
  없으므로 본문에서는 css(placeholder)로 채운다.
- **svg 안 글자는 텍스트 검증이 못 읽는다**: 구성도의 `<text>`('인스턴스: N')는 innerText 가 없어 toContainText 가 불일치로 나온다 →
  `[contains(.,'…')]` 조건 xpath + 표시 검증.
- **같은 LNB 그룹 안에서 메뉴 이동은 메뉴 항목만**: 이미 펼쳐진 그룹 제목을 다시 누르면 접혀서 다음 menuitem 이 안 보인다 → `S.menu()` 또는 URL(goto).
- **실측 스탬프 날짜는 로컬 날짜**(이전엔 UTC 라 자정~09시 작업이 전날로 찍혔다, 2026-10-07 수정).
- **장비 수정 마법사의 단계 표시**: 기본 정보 → [다음] 후 장비 정보 화면인데 단계 표시는 '장비 유형✓ / 기본 정보(활성) / 장비 정보'로
  한 칸 늦게 보인다(2026-10-07 walk). 단계 표시 검증은 실패로 남겨 보고.

## 2026-10-07 F 영역(구성도·집계) 작업에서
- **조회인데 POST 인 API**: 집계 화면의 [검색]·차트·CSV 는 `POST …/aggregation/<화면>/(search|chart|export)` 다. 쓰기 차단에 막혀 결과가 안 나오므로
  `envs.json` 전역 `live.allowRequests` 에 이 경로만 허용했다(조회 전용임을 walk 로 확인). 새 화면에서 BLOCK 이 조회 요청이면 경로를 좁혀 같은 방식으로 추가.
  **[필터 저장]**(`PUT …/search-filters/…`)은 공용 계정 설정을 바꾸므로 허용하지 않는다 → [예측] 으로 보고.
- **읽기 전용 달력**: 집계 기간 입력란은 `readonly` 라 fill 이 안 된다 → 달력 칸 클릭(`td.ant-picker-cell-in-view`[1] = 이번 달 1일,
  `td.ant-picker-cell-today` = 오늘). 시각이 있는 달력은 패널의 [확인]까지 눌러야 반영(note `[비변경]`). `f_common.cal_range`.
- **탭 안의 탭**: 성능 집계 보고서는 호스트/인스턴스 탭과 지표 그룹 탭(CPU/디스크/…)이 겹쳐 있고 비활성 탭의 표·문구·카드도 DOM 에 남는다
  → 같은 문구·STEP 버튼이 2개씩 걸려 AMBIGUOUS/엉뚱한 요소 검증. 활성 패널 `[@role='tabpanel'][not(@aria-hidden='true')]` 를 두 겹으로 한정.
- **STEP·기간 프리셋은 ant-segmented**(라디오 아님): 선택 상태는 `label.ant-segmented-item-selected`.
- **다중 선택 드롭다운의 '전체'**: 맨 위 `div.multiple-content`(목록 `multiple-list` 밖). 체크박스 label 은 `pointer-events:none` 이라 div 를 누른다.
- **svg 안 카드/스위치**: 물리 네트워크 구성도의 스위치 현황 카드는 svg `g.switch-header` — `className` 이 문자열이 아니므로 eval 에서는 `getAttribute('class')`.

## 2026-10-07 VIOLA(쿠버네티스) 작업에서
- **제품 전환**: 공용 계정 기본 화면은 CONTRABASS. 좌측 상단 로고 드롭다운(`h1.logo-wrap`) → `span.solution-menu-item-label` 'VIOLA' 로 전환(→ `/viola`). 이후 `/viola/...` URL 로 goto.
- **목록·통계 조회가 POST**(`/v1/viola/kubernetes/api/v1/k8s/**/list|stats`, 모니터링 조회, `provider-navigator`) → `envs.400tst.live.allowRequests` 에 조회 경로만 허용. `provider-navigator/<id>/selection`(컨텍스트 저장)은 허용하지 않음.
- **자원 이름(예외)**: 쿠버네티스 이름은 소문자·숫자·하이픈만(DNS-1123) → `qa-trml-{YYMMDD_HHMMSS}`(밑줄) 사용 불가. VIOLA 는 사용자 결정으로 **`qa-trml-{HHMMSS}-<용도>`** 를 쓴다(실행 시 `qa-trml-153000-gwc`, ground 의 qa-trml 판정 `qa-trml-\d{6}` 통과, verify 허용).
- 이름 셀은 `a` 가 아니라 `[data-testid=adm-name-cell]` 버튼. 표 testid `adm-<자원>-fetch-table-table`, 행 `…-row`, 페이지네이션 `…-pagination-(total|first|prev|next|last|page-size)`.

### 2026-10-08 VIOLA ground 1차 결과에서
- VIOLA 는 화면 진입·이동마다 `POST /v1/viola/kubernetes/api/v2/provider-navigator/<id>/selection`(계정 자신의 현재 클러스터 선택 저장)을 호출한다. 차단하면 '오류 발생' 알림·권한 없음 팝업이 뜨고 진입/생성 화면 이동이 '변경 요청 차단'으로 깨져 MISSING 이 연쇄된다 → envs.json live.allowRequests 에 허용(공용 자원 변경 아님).
- antd 테이블 `//tbody//tr[1]` 은 숨은 측정 행(ant-table-measure-row)을 잡는다 → 항상 `tr[contains(@class,"ant-table-row")][1]`.
- 상세 상단 삭제 버튼 텍스트는 화면마다 `delete 삭제`/`삭제` 로 다르다 → `contains(.,"삭제")`. 수정·삭제가 같은 testid(adm-detail-button-groups-button)를 공유하는 화면이 있어 testid 단독은 AMBIGUOUS.
- YOUR_ACCOUNT_ID 는 biz1·biz2 2개 클러스터 권한 → 클러스터 선택 팝오버(.navigator-wrap)에 `멀티 클러스터` 항목이 있다. 멀티 선택 시나리오는 끝에서 biz1 원복 필수.
- 클립보드 복사 toast 는 headless 에서 권한 문제로 안 뜰 수 있다(ground MISSING) → 스모크(headed)에서 재확인.
