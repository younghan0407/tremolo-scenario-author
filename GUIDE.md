# GUIDE — 다른 PC / 다른 솔루션 이식 가이드

이 스킬(`tremolo-scenario-author`)은 **기능 TC → 실행 가능한 Tremolo 시나리오(`.spec.ts` + `.spec.ts.meta.json`)** 를
만드는 하네스입니다. Tremolo 코드젠이 `vendor/codegen.cjs` 에 미리 번들돼 있어 **Tremolo 소스 없이 Node.js만으로**
생성·검증이 됩니다(빌드된 exe/dmg 사용자 대상). 이 문서는 *다른 PC* 설치와 *다른 솔루션(CMP/CONTRABASS/VIOLA)* 적용에 집중합니다.

---

## 1. 최소 요구사항
- **Node.js 18+** (필수) — 시나리오 생성/정적 검증. 스크립트는 `.mjs`(ESM).
- **Python 3 + openpyxl** (`pip install openpyxl`) — 프로젝트 폴더·산출물 워크북·Tremolo 실행 결과 기록
  (`tremolo.cmd project | author | build | runs | record`, `references/project-layout.md`).
- **Playwright + chromium** (`npx playwright install chromium`) — **신규 스크립트 필수.** generate/verify(정적)는
  Node만으로 되지만, **완료 게이트인 라이브 실측(`ground.mjs`)·(선택) 1회 실행(`smoke.mjs`)에 필요**.
- ※ `vendor/codegen.cjs` 덕분에 `pnpm install`·esbuild·Tremolo 소스는 **불필요**.

## 2. 설치 (다른 PC)
1. 압축을 풀어 `tremolo-scenario-author/` 를 작업 폴더에 둡니다. (**Node.js 18+** 만 미리 필요)
2. **원커맨드 셋업 — 이것만 실행:**
   ```
   node setup.mjs          # 또는  npm run setup
   ```
   자동 수행: `npm install`(Playwright) → `npx playwright install chromium`(브라우저 1회 다운로드) →
   접속 정보(`assets/envs.json`) 점검 → (선택)openpyxl → headless 자가검증. 끝에 **남은 수동작업**을 안내합니다.
   ※ chromium(~150MB, OS별)만은 zip에 넣을 수 없어 이 단계에서 받습니다(사내망은 프록시 필요할 수 있음).
2-1. **사용자 PC에서 실행**: 대상 서비스가 사내망이라 브라우저 작업은 전부 이 PC에서 `tremolo.cmd <작업>` 으로 실행합니다
   (`check`·`probe`·`explore`·`ground`·`smoke`·`setup`). 로그는 `runlogs\` 에 남고 AI가 읽어 이어갑니다.
3. **접속 정보 확인(가장 먼저)**: `node scripts/env.mjs` (전환 `use <키>` · 추가 `add <키> <baseUrl> --version <V>` ·
   값 변경 `set password <값>` · 로그인 확인 `check`).
4. (선택) 동작 확인:
   ```
   node scripts/generate.mjs <name>.steps.json # 시나리오 생성 (.spec.ts + .meta.json) — Node만 필요
   node scripts/verify.mjs  "<생성된 .spec.ts>" # 정적 검증(PASS 확인) — Node만 필요
   node scripts/live/__selftest__/run.mjs       # (Playwright 필요) 메커니즘 자가검증
   ```
   ⚠ `__selftest__/run.mjs` 는 **의도적으로 headless**(로컬 HTML로 메커니즘만 확인) — **창이 안 떠도 정상**입니다.
   **실제 화면에 Chrome을 띄우는 건 `probe.mjs`/`explore.mjs`(기본 headed)** 입니다:
   ```
   node scripts/live/probe.mjs --url https://<HOST>/... --name check   # 창이 떠야 정상(로그인은 envs.json으로 자동)
   ```
5. Tremolo에서 실행하려면 생성된 쌍을 `<Tremolo 데이터>/scenarios/<solution>/<version>/` 아래에 두거나
   `TREMOLO_DATA_SCENARIOS` 환경변수로 위치를 지정합니다(그러면 meta의 `scenarioPath`가 맞게 박힘).

## 3. 다른 솔루션(CMP / CONTRABASS / VIOLA)에서 쓸 때 — 핵심
세 솔루션 모두 AntD 기반이지만 **구현이 조금씩 다릅니다.** 아래만 지키면 됩니다.

1. **환경 추가** — `node scripts/env.mjs add <키> <baseUrl> --solution <S> --version <V>` → `env.mjs use <키>`.
2. **로그인 라벨** — 솔루션마다 로그인 폼 placeholder가 다를 수 있음. 라이브로 확인해 `envs.json` 의
   `envs.<키>.login.{idLabel,passwordLabel,mfaLabel}` 에 넣고, MFA가 없으면 `mfa:false`. 확인: `tremolo.cmd check`.
   비밀번호 필드 **Enter가 로그인 제출**이라 별도 '로그인' 버튼 클릭은 넣지 않습니다(프리앰블 자동 생성).
3. **셀렉터를 가정하지 말 것** — 아래는 *CONTRABASS 306tst 실측값*이라 다른 솔루션에선 다를 수 있습니다.
   반드시 그 솔루션의 **녹화본 + 라이브 DOM**으로 재실측하세요(`references/authoring-patterns.md` §4b):
   - 목록 생성 버튼 = 아이콘 리거처 **`add 생성`**(plain `생성` 아님), 행 메뉴 = **`more_horiz`**/작업(...)
   - AntD Select 는 **폼에 라벨 있으면 `by:'label'`**, 라벨 없고 **ASCII `#id`** 있으면 `by:'auto'`+css `#id` root,
     한글 id 뿐이면 헬퍼 대신 **click(열기)+click(옵션 텍스트)** 로 우회
   - 라디오 카드('사용/미사용' 등)·스위치·테이블 행 선택(`antdTableSelect`) 패턴
4. **코드젠(`vendor/codegen.cjs`)은 솔루션 무관**(스펙 생성기) — 그대로 사용. 개발자(소스 보유)면
   `node scripts/build_codegen.mjs --force` 로 최신화 가능(esbuild 필요).

## 4. TC가 조건을 다 안 준 복잡 폼 → 탐색·제안·확인
멈추지 말고: `explore.mjs`(제출 없이 폼 요소 수집) → `propose.mjs`(일반 QA 후보: 필수값 누락·옵션 동등분할·경계값분석·정상 생성)
→ 사용자 확인 → 선택분만 작성. 상세: `references/explore-propose.md`.

## 5. AI에게 맡길 때(권장)
이 폴더에 두면 **`CLAUDE.md`** 가 init/starter 역할을 합니다. 예시 프롬프트:
> "이 스킬로 **<솔루션>** 기능 TC를 Tremolo 시나리오로 만들어줘. (1) `node scripts/env.mjs` 로 대상 환경을 이
> 환경 값으로 먼저 세팅. (2) 새 솔루션이니 셀렉터는 가정하지 말고 녹화본/라이브 DOM으로 실측해 확정. (3) TC에 없는
> 항목은 지어내지 말고 비고에 '확인 필요'로(예측 선택자는 `[예측]`). (4) 생성 후 `verify.mjs`(정적) → **`ground.mjs --write`로
> 라이브 실측(필수)** → `verify --require-grounded` PASS라야 완료. (5) [원하면] `smoke.mjs`로 1회 실행 검증.
> TC 근거 없는 예측 스크립트는 보고 최상단에 '개발 화면 기반, 사람이 Pass/Fail 판정' 고지."

## 6. 보안 (중요)
- `assets/envs.json` 은 공개 tst 환경 정보(공용 계정 `YOUR_ACCOUNT_ID`)라 공유·커밋 가능. 운영 환경 계정은 넣지 않습니다.

## 7. 트러블슈팅
- `build_codegen ... esbuild not found` → vendor를 쓰므로 보통 무시 가능. 소스 최신화할 때만 그 OS에서 `pnpm install`.
- `Tremolo repo root not found` → 소스 없이 쓰는 정상 상황(standalone). 필요 시 `TREMOLO_DATA_SCENARIOS` 만 지정.
- **라이브 probe/explore가 Chrome을 안 띄운다** (다른 PC 최다 이슈):
  1. **Playwright + chromium 설치 필수**: `node setup.mjs`(권장) 또는 `npm install` 후 `npx playwright install chromium`.
     미설치 시 `[probe] FAILED: playwright not found …` 또는 `channel 'chromium' 불가 …` 로그가 뜬다.
  2. probe/explore는 **기본 headed**(창이 보임). 실행 시 `[probe] Chrome 실행 (headless=false)` 로그 확인 —
     `--headless` 를 붙이면 창이 안 뜨니 확인.
  3. 소스 없는 PC에서 `tremoloRoot` 예외로 죽던 문제는 수정됨(현재 standalone에서 정상 진행).
  4. `channel:'chromium'`(Chrome for Testing)이 없으면 **번들 chromium로 자동 폴백**한다. 그래도 안 되면
     `TREMOLO_CHROMIUM_EXECUTABLE=<크로미움/크롬 실행파일 경로>` 로 직접 지정.
- 스펙 실행 시 `getByRole(name:'생성') timeout` → 목록 생성 버튼은 **`add 생성`**(§3).
- `selectAntdOption(auto): host not found` → antdSelect root 누락. `by:'label'` 또는 `by:'auto'`+ASCII `#id`, 아니면 click+옵션.
- **정적 verify는 PASS인데 실행 실패** → verify는 정적이라 **셀렉터 이름 오류를 못 잡음**. 새 솔루션/화면은 라이브 실행으로 확정.
- 자세한 전제/오버라이드 환경변수는 `SETUP.md` 참조.

## 8. 폴더 구성
```
tremolo-scenario-author/
├─ README.md             ★ 팀 배포용 시작점(먼저 읽기)
├─ setup.mjs             ★ 원커맨드 셋업: `node setup.mjs`
├─ package.json          Playwright 의존 + npm 스크립트(setup/verify/ground/…)
├─ SKILL.md              스킬 개요/워크플로우
├─ CLAUDE.md             AI init/starter (이 폴더에서 작업 시작 시 규칙)
├─ SETUP.md              전제/트러블슈팅(상세)
├─ GUIDE.md              (이 문서) 다른 PC/솔루션 이식 가이드
├─ assets/
│  ├─ envs.json                      ← 환경·공용 계정 (node scripts/env.mjs 로 편집)
│  └─ preamble.login.json            ← 로그인 스텝 모양 템플릿(값은 자동 주입)
├─ scripts/
│  ├─ generate.mjs / verify.mjs      생성 / 정적 검증
│  ├─ build_codegen.mjs / tremolo_paths.mjs
│  ├─ live/    ground.mjs(필수 실측) · smoke.mjs(1회 실행) · explore.mjs · probe.mjs · lib.mjs · __selftest__/
│  ├─ testdata/ derive.mjs(동등분할/경계값) · propose.mjs(후보 제안)
│  └─ results/ log_results.py (워크북 커버리지/결과 기입)
├─ vendor/codegen.cjs    Tremolo 코드젠 번들(standalone 핵심)
└─ references/           step-ir-schema · authoring-patterns · tc-mapping · testdata-ep-bva · explore-propose · grounding-policy
```

> 요약: **압축 해제 → `env.mjs` 로 환경 확인 → generate → verify(정적) → `ground.mjs` 실측(필수) →
> `verify --require-grounded` PASS → [원하면] `smoke.mjs` 1회 실행.** 정적은 Node만, 실측/실행은 Playwright+chromium.
