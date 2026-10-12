# 프로젝트 폴더 (솔루션 × 버전 작업 단위)

TC 워크북 하나를 스크립트로 옮기는 작업은 **프로젝트 폴더 하나**에서 한다. 뼈대(폴더 이름·파일 위치)만 고정하고,
저작 방식(DSL `*.py` / steps.json 직접 작성)은 자유다. 솔루션마다 다른 값은 `project.json` 한 곳에만 둔다.

```
<projects>/<SOL>-<VER>/            예: projects/CONTRABASS-V4.0   (tremolo.cmd project init 으로 생성)
  project.json        솔루션·버전·환경 키·TC 워크북·산출물 경로 (아래 스키마)
  README.md           (선택) 작업 개요·합의 사항
  source/             원본 TC 워크북 사본 (init 이 복사 — 원본은 절대 수정하지 않음)
  design/             areas/*.json (영역별 시나리오 ↔ TC ↔ 사전데이터), common_setup.json
  src/                (선택) 저작 소스 — DSL *.py 등
  steps/              *.steps.json (generate 입력)
  tools/              (선택) 이 프로젝트 전용 보조 스크립트 (예: 병렬 실측 배치)
  registry.json       생성 스크립트 레지스트리 (finalize/install 이 갱신)
  results/runs/       Tremolo 실행 결과 원장 — 실행 1건 = json 1개 (record 가 작성) ← 결과의 원본(SoT)
  results/verdicts.json  담당자 판정 (산출물 '자동화_판정필요' 시트에서 build 가 수확)
  results/snapshots/  설치할 때마다 보관한 meta 스냅샷(<이름>@<지문>) — record 가 실행 당시 내용으로 TC 를 매핑할 때 사용(지우지 말 것)
  deliverables/       누적 산출물: <TC>_자동화.xlsx, 시나리오_설계.md, 사전준비_*.md  ← 보관·공유
  .work/              walk 덤프, walks, 로그, 미리보기, 백업  ← 폐기 가능 (공유·커밋 제외)
```

생성된 `.spec.ts` + `.meta.json` 은 `scenariosDir`(기본 `<하네스 상위>/scenarios/<SOL>/<VER>`)에 생기고,
`author.py install` 이 Tremolo `data/scenarios/<SOL>/<VER>` 로 복사한다.

## project.json
```json
{
 "name": "CONTRABASS-V4.0",
 "solution": "CONTRABASS",
 "version": "V4.0",
 "env": "400tst",                       // assets/envs.json 의 환경 키
 "tc": {
  "source": "source/<TC 워크북>.xlsx",
  "sheet": "CONTRABASS v4.0 full_auto",  // 없으면 자동 감지
  "idPattern": "UNT-CON-\\d+",           // TC ID 정규식
  "priorities": ["P1", "P2"]             // 설계 대상 우선순위
 },
 "deliverable": "deliverables/<TC>_자동화.xlsx",
 "scenariosDir": "../../scenarios/CONTRABASS/V4.0"   // (선택)
}
```
선택 키: `tremoloRoot`(Tremolo 앱/리포 루트), `reportDir`(실행 결과 루트, 기본 `<tremoloRoot>/result/report`),
`testfilesDir`(업로드용 파일, 기본 `<tremoloRoot>/data/testfiles`). 경로는 모두 이 폴더 기준 상대경로.

## 프로젝트 찾기
`--project <이름|경로>` > `TREMOLO_PROJECT` > `<projects>/.current`(`project use`) > 현재 폴더가 프로젝트 안 > 프로젝트가 1개면 그것.
`<projects>` = `TREMOLO_PROJECTS` 또는 `<하네스 상위>/projects`.

## 명령
| 명령 | 하는 일 |
|---|---|
| `tremolo.cmd project` | 현재 프로젝트 점검(경로·파일 존재·스크립트/실행 수) |
| `tremolo.cmd project list` / `use <이름>` | 목록 / 기본 프로젝트 지정 |
| `tremolo.cmd project init <SOL> <VER> --tc <xlsx> [--env <키>] [--sheet <시트>]` | 새 프로젝트 뼈대 + project.json 자동 작성(시트·ID 패턴 추정) |
| `tremolo.cmd author gen <src.py> [이름일부…]` | 저작 소스 실행 → steps.json → generate |
| `tremolo.cmd author wk <name>` | `.work/walks/<name>.py` 의 ACTIONS 로 비변경 화면 덤프(walk.mjs) |
| `tremolo.cmd author finalize <name…>` | meta 실측 스탬프를 steps 로 회수 → 재생성 → 정적 검증 → registry 등록 |
| `tremolo.cmd author carry / mark / restamp …` | 스탬프 이관 / TC 불일치 표기 / 대체자원 차이 표기 |
| `tremolo.cmd author install <name…>` | finalize 된 스크립트를 Tremolo data/scenarios 로 설치(설치 지문 기록) |
| `tremolo.cmd build` | 산출물 워크북 다시 그리기 — 양식: `deliverable-format.md` |
| `tremolo.cmd runs` / `record …` | Tremolo 실행 결과 → TC 기록 — 절차: `results-recording.md` |

(Python 3 + `openpyxl` 필요. AI 가 사용자 PC 셸에서 직접 돌 때는 `python scripts/project/author.py …` 등으로 바로 실행해도 된다.)

## 규칙
- 원본 TC 워크북은 `source/` 사본만 읽는다. 산출물은 `deliverables/` 에 **누적 파일 1개**로 갱신(실행마다 사본을 만들지 않음).
- `.work/` 아래는 언제 지워도 되는 것만 둔다. 보관할 보고서는 `deliverables/` 로.
- 솔루션 고유 값(시트명·ID 패턴·환경·경로)을 스크립트에 하드코딩하지 않는다 — `project.json` 에서 읽는다.
