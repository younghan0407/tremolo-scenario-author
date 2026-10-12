# SETUP & 다른 PC/환경에서 사용 시 유의점

> ⚠ **이 문서는 개발자(Tremolo 소스 보유) 심화 경로**입니다. **대부분의 사용자는 standalone** — `vendor/codegen.cjs`
> 덕분에 **소스 없이 Node.js만으로** generate/verify가 동작합니다(이식 절차: `GUIDE.md`). 신규 스크립트의 라이브
> 실측/실행엔 Playwright+chromium이 필요합니다. 아래 '소스 필요' 전제는 **vendor 코드젠을 소스에서 재빌드**하거나
> 개발 리포와 함께 쓸 때만 해당합니다.

이 하네스는 Tremolo의 코드젠을 재사용하되, 그 코드젠은 이미 `vendor/codegen.cjs`로 번들돼 있어 **평소엔 소스가
필요 없다**. 아래는 소스에서 **재빌드**하거나 개발 리포와 연동할 때의 전제다.

## 1. (개발자) vendor 재빌드/개발 리포 연동 시 필요한 것
1. **Tremolo 리포지토리(소스 포함)** — `node scripts/build_codegen.mjs --force`로 vendor를 재생성할 때만 필요
   (`src/main/services/scenarioService.ts`의 `generateSpecFromSteps`/`parseSpecToSteps`를 esbuild 번들).
   **standalone은 `vendor/codegen.cjs`를 쓰므로 소스 불필요** — 이 항목은 건너뛴다.
2. **Node.js 18+** (권장 20/22). 하네스 스크립트는 `.mjs`(ESM).
3. **esbuild** — `build_codegen.mjs`가 사용. Tremolo 리포에 vite 의존으로 이미 포함되나, **플랫폼 바이너리는
   OS별**이다. → 대상 PC에서 `pnpm install`(또는 `npm install`)을 반드시 한 번 실행해 그 OS용 esbuild
   바이너리를 받는다. (Windows 클론을 Linux에서 그대로 쓰면 esbuild가 안 돈다 — 반대도 마찬가지.)
4. **Playwright + 브라우저** — 라이브 계층(`live/*`)과 스펙 실행에 필요.
   `npx playwright install chromium` (또는 리포의 `pnpm run playwright:install-browsers`).
5. **Python 3 + openpyxl** — 결과 로거(`results/log_results.py`)와 TC 워크북 파싱용.
   `pip install openpyxl`.
6. **TC 워크북** 파일 접근 경로(예: `내부솔루션_Contrabass_기능 TC(v3.0.6).xlsx`).

## 2. 환경마다 반드시 바꿀 것 (env-specific)
- **`assets/envs.json`** — 환경(URL·솔루션·버전) + 공용 계정 `YOUR_ACCOUNT_ID`. `node scripts/env.mjs` 로 확인/전환/변경. 공유·커밋 가능.
  `commonResources`는 **선택적 힌트**(코드가 읽지 않음).
- **`assets/preamble.login.json`** — 로그인 스텝 '모양' 템플릿. 값은 envs.json 에서 자동 주입되므로 고칠 필요 없음.
- **MFA 코드**는 개발/검증 환경 전용(6자리 자동제출). 운영/다른 환경에선 통하지 않으니 그 환경 값으로 바꾼다.
- **솔루션 차이(CMP/CONTRABASS/VIOLA)** — AntD 구현이 조금씩 다르다. 다른 솔루션/영역이면 셀렉터를
  가정하지 말고 그 솔루션의 **녹화본 + 라이브 DOM**으로 실측할 것(`references/authoring-patterns.md` §4b 참고).

## 3. 경로/실행 관련
- **`TREMOLO_ROOT`** — 스킬이 리포 안(`workspace_claude/output/...`)에 있으면 상위 탐색으로 자동 인식.
  밖에 두면 환경변수로 지정: `TREMOLO_ROOT=<리포 경로>`.
- **meta.json의 `scenarioPath`** 는 생성 시점의 리포 루트 기준으로 계산된다. **다른 PC에서 생성/설치**하면
  올바른 경로가 박힌다. 이미 만든 산출물을 옮길 땐 리포의 `data/scenarios/<solution>/<version>/`에 그대로 두고
  경로만 맞추면 된다.
- **Tremolo 실행 조건**: 스펙 쌍(`.spec.ts` + `.spec.ts.meta.json`)이 `data/scenarios/<sol>/<ver>/` 아래 있어야
  실행된다(`generate.mjs --install`로 복사 가능). 스펙이 import하는 `data/scenarios/_helpers/*`가 있어야 한다.
- (선택) 오버라이드: `TREMOLO_DATA_SCENARIOS`(스펙 설치 위치=meta scenarioPath 기준), `TREMOLO_HELPERS`(_helpers 경로),
  `TREMOLO_ESBUILD`(esbuild 패키지 경로), `TREMOLO_PLAYWRIGHT`(playwright 모듈 경로), `TREMOLO_CHROMIUM_EXECUTABLE`(크로미움 실행 파일).

## 4. 사람용 셋업 절차 (요약)
```
1) Tremolo 리포 준비(소스 포함) → cd <repo>
2) pnpm install            # esbuild 등 OS별 바이너리 확보
3) npx playwright install chromium
4) pip install openpyxl
5) 스킬 폴더(tremolo-scenario-author)를 리포 안(예: workspace_claude/output/)에 두거나 .skill 설치
6) node scripts/env.mjs 로 대상 환경 확인(필요 시 use/add/set) → tremolo.cmd check
7) 동작 확인:
   node <skill>/scripts/live/__selftest__/run.mjs          # 브라우저 메커니즘 자가검증(로그인 불필요)
   node <skill>/scripts/generate.mjs <name>.steps.json     # 생성
   node <skill>/scripts/verify.mjs  <생성된 .spec.ts>       # 정적 검증
```

## 5. AI에게 시킬 때(환경 구축 지시 프롬프트 예시)
> "이 PC에 Tremolo 시나리오 하네스를 셋업해줘. (1) `<repo>`에서 `pnpm install` 후 `npx playwright install
> chromium` 실행, `pip install openpyxl`. (2) `node scripts/env.mjs` 로 이 환경(URL/계정/MFA/로그인 라벨)을
> 확인·전환하고 `tremolo.cmd check` 로 로그인 확인. (3) `TREMOLO_ROOT`를 리포
> 경로로 잡고 `scripts/live/__selftest__/run.mjs`가 PASS인지, `scripts/generate.mjs`→`verify.mjs`가 도는지
> 확인. (4) 실제 스테이징 접속은 자체 서명 인증서 경고를 한 번 통과해야 하고, 로그인(비번·MFA) 입력은
> 사람이 하거나 스크립트가 envs.json으로 자동 처리한다는 점을 유의. (5) 새 솔루션/영역이면 셀렉터는 녹화본과
> 라이브 DOM으로 실측(가정 금지)."

## 6. 자주 나는 문제 (트러블슈팅)
- `build_codegen ... esbuild ... not found / 실행 안 됨` → 대상 OS에서 `pnpm install` 안 함(플랫폼 바이너리 없음).
- `Tremolo repo root not found` → 스킬이 리포 밖. `TREMOLO_ROOT` 지정.
- 스펙 실행 시 `getByRole(name:'생성') timeout` → 목록 생성 버튼은 아이콘 리거처 **`add 생성`**(§4b).
- `selectAntdOption(auto): host not found` → antdSelect는 `by:'label'` 또는 `by:'auto'+#id root`로(폼별 실측).
- 로그인 후 바로 `/login`으로 튐 → 세션 짧게 만료. 라이브 작업은 로그인 직후 몰아서.
- 정적 verify는 PASS인데 실행 실패 → verify는 정적이라 **셀렉터 이름 오류를 못 잡는다**. 라이브/Tremolo 실행으로 확정.
