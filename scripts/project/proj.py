#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
proj.py — 프로젝트(솔루션×버전 작업 단위) 공용 헬퍼. 모든 project/results 스크립트가 이 모듈로 경로를 푼다.

프로젝트 폴더 (고정 뼈대 — references/project-layout.md):
  <projects>/<SOL>-<VER>/
    project.json      솔루션·버전·환경·TC 워크북·산출물 경로 (이 파일만 솔루션별로 다르다)
    design/           areas/*.json, common_setup.json  (시나리오 설계)
    src/              (선택) 저작 소스 — DSL *.py 등. 방식은 자유
    steps/            *.steps.json  (generate 입력)
    registry.json     생성 스크립트 레지스트리 (finalize 가 갱신)
    results/runs/     Tremolo 실행 결과 원장(run 1건 = json 1개, record 가 작성) ← 결과의 원본(SoT)
    results/verdicts.json  담당자 판정(판정필요 시트에서 수확)
    deliverables/     누적 산출물(TC 워크북 _자동화.xlsx, 시나리오_설계.md)  ← 보관
    .work/            walk/walks/explore/로그/미리보기/백업  ← 폐기 가능(공유·커밋 제외)

프로젝트 찾기 순서: --project <이름|경로>  >  TREMOLO_PROJECT  >  <projects>/.current  >  프로젝트가 1개면 그것.
<projects> = TREMOLO_PROJECTS  또는  <하네스 상위>/projects.
"""
import hashlib
import json
import os
import re
import sys

HARNESS = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))


def _json(p, default=None):
    if not os.path.exists(p):
        return default
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def write_json(p, data, indent=1):
    """임시 파일에 쓴 뒤 교체(중간에 죽어도 원본이 깨지지 않게)."""
    os.makedirs(os.path.dirname(p), exist_ok=True)
    tmp = p + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=indent)
    os.replace(tmp, p)


def projects_root():
    return os.path.normpath(os.environ.get("TREMOLO_PROJECTS") or os.path.join(HARNESS, "..", "projects"))


def list_projects():
    root = projects_root()
    if not os.path.isdir(root):
        return []
    return sorted(d for d in os.listdir(root) if os.path.exists(os.path.join(root, d, "project.json")))


def find_tremolo_root():
    """Tremolo 앱/리포 루트(data/scenarios, result/report 를 가진 폴더)."""
    if os.environ.get("TREMOLO_ROOT"):
        return os.path.normpath(os.environ["TREMOLO_ROOT"])
    if os.environ.get("TREMOLO_DATA_SCENARIOS"):  # <앱>/data/scenarios
        return os.path.normpath(os.path.join(os.environ["TREMOLO_DATA_SCENARIOS"], "..", ".."))
    d = HARNESS
    for _ in range(12):
        if os.path.isdir(os.path.join(d, "data", "scenarios")) and (
                os.path.isdir(os.path.join(d, "result")) or os.path.exists(os.path.join(d, "playwright.config.ts"))):
            return d
        p = os.path.dirname(d)
        if p == d:
            break
        d = p
    return None


class ProjectError(Exception):
    pass


class Project:
    def __init__(self, root):
        self.root = os.path.normpath(os.path.abspath(root))
        self.cfg = _json(os.path.join(self.root, "project.json"))
        if not self.cfg:
            raise ProjectError(f"project.json 없음: {self.root}")
        self.name = self.cfg.get("name") or os.path.basename(self.root)
        self.solution = self.cfg["solution"]
        self.version = self.cfg["version"]
        self.env = self.cfg.get("env")

    # ── 경로 ──────────────────────────────────────────────
    def p(self, *parts):
        return os.path.normpath(os.path.join(self.root, *parts))

    def _cfg_path(self, key, default):
        v = self.cfg.get(key)
        return os.path.normpath(os.path.join(self.root, v)) if v else default

    @property
    def steps_dir(self):
        return self.p("steps")

    @property
    def design_dir(self):
        return self.p("design")

    @property
    def work_dir(self):
        return self.p(".work")

    @property
    def runs_dir(self):
        return self.p("results", "runs")

    @property
    def verdicts_path(self):
        return self.p("results", "verdicts.json")

    @property
    def registry_path(self):
        return self.p("registry.json")

    @property
    def scenarios_dir(self):
        """generate.mjs 출력 위치(.spec.ts + .meta.json)."""
        return self._cfg_path("scenariosDir", os.path.normpath(
            os.path.join(HARNESS, "..", "scenarios", self.solution, self.version)))

    @property
    def tremolo_root(self):
        return self._cfg_path("tremoloRoot", None) or find_tremolo_root()

    @property
    def installed_dir(self):
        """Tremolo 가 실행하는 위치(data/scenarios/<sol>/<ver>)."""
        if os.environ.get("TREMOLO_DATA_SCENARIOS"):
            return os.path.join(os.environ["TREMOLO_DATA_SCENARIOS"], self.solution, self.version)
        r = self.tremolo_root
        return os.path.join(r, "data", "scenarios", self.solution, self.version) if r else None

    @property
    def report_dir(self):
        """Tremolo 실행 결과 루트(result/report)."""
        v = self._cfg_path("reportDir", None)
        if v:
            return v
        r = self.tremolo_root
        return os.path.join(r, "result", "report") if r else None

    @property
    def testfiles_dir(self):
        v = self._cfg_path("testfilesDir", None)
        if v:
            return v
        r = self.tremolo_root
        return os.path.join(r, "data", "testfiles") if r else self.p("testfiles")

    @property
    def tc(self):
        return self.cfg.get("tc", {})

    @property
    def tc_source(self):
        return self._cfg_path_in(self.tc.get("source"))

    @property
    def deliverable(self):
        return self._cfg_path_in(self.cfg.get("deliverable"))

    def _cfg_path_in(self, v):
        return os.path.normpath(os.path.join(self.root, v)) if v else None

    @property
    def tc_id_re(self):
        return re.compile(self.tc.get("idPattern") or r"[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-\d+")

    # ── 환경(하네스 assets/envs.json) ─────────────────────
    def env_info(self):
        envs = _json(os.path.join(HARNESS, "assets", "envs.json"), {}) or {}
        key = self.env or envs.get("active")
        return key, (envs.get("envs") or {}).get(key, {})

    @property
    def base_url(self):
        return (self.env_info()[1].get("baseUrl") or "").rstrip("/")

    # ── 레지스트리 ────────────────────────────────────────
    def registry(self):
        return _json(self.registry_path, []) or []

    def save_registry(self, reg):
        write_json(self.registry_path, reg)

    def meta_path(self, name, installed=False):
        d = self.installed_dir if installed else self.scenarios_dir
        return os.path.join(d, f"{name}.spec.ts.meta.json") if d else None

    def spec_path(self, name):
        return os.path.join(self.scenarios_dir, f"{name}.spec.ts")

    def steps_path(self, name):
        return os.path.join(self.steps_dir, f"{name}.steps.json")

    # ── 설치 스냅샷(실행 당시 스크립트 내용 보존 — record 가 실행 결과를 그때의 TC 연결로 매핑) ──
    @property
    def snapshots_dir(self):
        return self.p("results", "snapshots")

    def snapshot_path(self, name, fp):
        safe = re.sub(r'[<>:"/\\|?*]', "_", name)
        return os.path.join(self.snapshots_dir, f"{safe}@{fp}.meta.json")


def load_project(arg=None):
    """--project 값(이름/경로) 또는 규칙에 따라 프로젝트를 고른다. 못 고르면 ProjectError(선택지 안내)."""
    root = projects_root()
    cand = arg or os.environ.get("TREMOLO_PROJECT")
    if not cand:
        cur = os.path.join(root, ".current")
        if os.path.exists(cur):
            cand = open(cur, encoding="utf-8").read().strip()
    if not cand:
        here = os.path.abspath(os.getcwd())  # 프로젝트 폴더 안에서 실행 중이면 그것
        for _ in range(6):
            if os.path.exists(os.path.join(here, "project.json")):
                return Project(here)
            here = os.path.dirname(here)
        names = list_projects()
        if len(names) == 1:
            cand = names[0]
        else:
            raise ProjectError("프로젝트를 정할 수 없습니다. `project use <이름>` 또는 --project 로 지정하세요. "
                               f"(있는 프로젝트: {', '.join(names) or '없음'} / 위치: {root})")
    path = cand if os.path.isabs(cand) or os.path.exists(os.path.join(cand, "project.json")) else os.path.join(root, cand)
    return Project(path)


def pop_project_arg(argv):
    """argv 에서 --project <값> 을 꺼낸다(나머지 인자 해석과 분리)."""
    if "--project" in argv:
        i = argv.index("--project")
        val = argv[i + 1] if i + 1 < len(argv) else None
        del argv[i:i + 2]
        return val
    return None


def norm_title(s):
    """Tremolo formatStepDisplayTitle 의 공백 정규화와 동일."""
    return re.sub(r"\s+", " ", str(s or "")).strip()


def steps_fingerprint(steps):
    """스텝 **전체 내용**(대상·입력값·검증 조건·TC 가 들어 있는 note 포함)의 지문. 제목만 같고 내용이 바뀐 스크립트를 구분한다."""
    canon = json.dumps(steps, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha1(canon.encode("utf-8")).hexdigest()[:12]


def file_sha(path):
    with open(path, "rb") as f:
        return hashlib.sha1(f.read()).hexdigest()[:12]


def parse_time(s):
    """ISO 시각 → 시간대 있는 datetime(시간대 없는 예전 값은 이 PC 시간대로 본다). 실패 시 None."""
    import datetime
    if not s:
        return None
    try:
        d = datetime.datetime.fromisoformat(str(s).replace("Z", "+00:00"))
    except ValueError:
        return None
    return d if d.tzinfo else d.astimezone()


def utf8_stdio():
    for s in (sys.stdout, sys.stderr):
        try:
            s.reconfigure(encoding="utf-8")
        except Exception:
            pass
