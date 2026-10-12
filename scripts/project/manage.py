#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
manage.py — 프로젝트(솔루션×버전 작업 폴더) 관리.

  tremolo.cmd project                       현재 프로젝트 상태 점검(경로·파일 존재·스크립트/실행 수)
  tremolo.cmd project list                  프로젝트 목록
  tremolo.cmd project use <이름>            기본 프로젝트 지정(projects/.current)
  tremolo.cmd project init <솔루션> <버전> --tc <TC 워크북.xlsx> [--env <envs.json 키>] [--sheet <시트>]
                                            새 프로젝트 뼈대 생성(원본 TC 는 source/ 로 복사, project.json 자동 작성)
폴더 뼈대: references/project-layout.md
"""
import json
import os
import re
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from project.proj import (HARNESS, ProjectError, list_projects, load_project, pop_project_arg,  # noqa: E402
                          projects_root, utf8_stdio, write_json)

DIRS = ["design/areas", "src", "steps", "results/runs", "deliverables", "source", "tools", ".work"]
GITIGNORE = "# 폐기 가능한 작업물(walk 덤프·로그·미리보기·백업)\n.work/\n~$*\n"


def _ok(b):
    return "✓" if b else "✗"


def cmd_show(P):
    reg = P.registry()
    runs = os.listdir(P.runs_dir) if os.path.isdir(P.runs_dir) else []
    env_key, env = P.env_info()
    print(f"[project] {P.name}  ({P.solution} {P.version})   {P.root}")
    rows = [
        ("환경", f"{env_key}  {env.get('baseUrl', '(envs.json 에 없음)')}", bool(env.get("baseUrl"))),
        ("원본 TC 워크북", P.tc_source, P.tc_source and os.path.exists(P.tc_source)),
        ("산출물(누적)", P.deliverable, P.deliverable and os.path.exists(P.deliverable)),
        ("생성 스크립트 위치", P.scenarios_dir, os.path.isdir(P.scenarios_dir)),
        ("Tremolo 설치 위치", P.installed_dir, P.installed_dir and os.path.isdir(P.installed_dir)),
        ("Tremolo 실행 결과", P.report_dir, P.report_dir and os.path.isdir(P.report_dir)),
    ]
    for k, v, ok in rows:
        print(f"  {_ok(ok)} {k:14} {v}")
    print(f"    스크립트(registry) {len(reg)}개 · 기록된 실행 {len(runs)}회 · steps {len(os.listdir(P.steps_dir)) if os.path.isdir(P.steps_dir) else 0}개")
    missing = [k for k, _, ok in rows if not ok]
    if missing:
        print(f"  ⚠ 확인 필요: {', '.join(missing)}  (산출물은 첫 build 때 원본에서 생성됨)")


def cmd_list():
    root = projects_root()
    cur = open(os.path.join(root, ".current"), encoding="utf-8").read().strip() if os.path.exists(os.path.join(root, ".current")) else ""
    names = list_projects()
    print(f"[project] {root}")
    for n in names:
        print(f"  {'*' if n == cur else ' '} {n}")
    if not names:
        print("  (없음) → tremolo.cmd project init <솔루션> <버전> --tc <TC 워크북.xlsx>")


def cmd_use(name):
    if name not in list_projects():
        raise ProjectError(f"프로젝트 없음: {name} (있는 것: {', '.join(list_projects())})")
    with open(os.path.join(projects_root(), ".current"), "w", encoding="utf-8") as f:
        f.write(name)
    print(f"[project] 기본 프로젝트 → {name}")


def _guess_id_pattern(ids):
    """샘플 TC ID 들에서 접두사 패턴 추정: UNT-CON-001 → UNT-CON-\\d+ (여러 접두사면 OR)."""
    prefixes = sorted({re.sub(r"\d+$", "", i) for i in ids if re.search(r"\d+$", i)})
    if not prefixes:
        return None
    alt = "|".join(re.escape(p) for p in prefixes)
    return f"(?:{alt})\\d+" if len(prefixes) > 1 else f"{re.escape(prefixes[0])}\\d+"


def cmd_init(argv):
    def opt(k):
        return argv[argv.index(k) + 1] if k in argv else None
    pos = [a for i, a in enumerate(argv) if not a.startswith("--") and (i == 0 or not argv[i - 1].startswith("--"))]
    if len(pos) < 2 or not opt("--tc"):
        raise ProjectError("사용법: project init <솔루션> <버전> --tc <TC 워크북.xlsx> [--env <키>] [--sheet <시트>]")
    sol, ver, tc = pos[0], pos[1], opt("--tc")
    if not os.path.exists(tc):
        raise ProjectError(f"TC 워크북 없음: {tc}")
    name = f"{sol}-{ver}"
    root = os.path.join(projects_root(), name)
    if os.path.exists(os.path.join(root, "project.json")):
        raise ProjectError(f"이미 있는 프로젝트입니다: {root}")

    import openpyxl
    sys.path.insert(0, os.path.join(HARNESS, "scripts"))
    from results.tc_workbook import find_header_row, pick_sheet, resolve_columns
    wb = openpyxl.load_workbook(tc, read_only=True)
    ws, cands = (wb[opt("--sheet")], [opt("--sheet")]) if opt("--sheet") else pick_sheet(wb)
    cols, hr = resolve_columns(ws), find_header_row(ws)
    ids = []
    for row in ws.iter_rows(min_row=hr + 1, max_row=hr + 400, values_only=True):
        v = row[cols["id"] - 1] if len(row) >= cols["id"] else None
        if v:
            ids.append(str(v).strip())
    wb.close()
    pat = _guess_id_pattern(ids)

    for d in DIRS:
        os.makedirs(os.path.join(root, d), exist_ok=True)
    dst = os.path.join(root, "source", os.path.basename(tc))
    shutil.copy2(tc, dst)
    stem = os.path.splitext(os.path.basename(tc))[0]
    cfg = {"_comment": "프로젝트 설정 — 솔루션별로 다른 값은 이 파일에만 둔다. 형식: tremolo-scenario-author/references/project-layout.md",
           "name": name, "solution": sol, "version": ver, "env": opt("--env") or "",
           "harness": os.path.relpath(HARNESS, root).replace("\\", "/"),
           "tc": {"source": f"source/{os.path.basename(tc)}", "sheet": ws.title, "idPattern": pat or "",
                  "priorities": ["P1", "P2"]},
           "deliverable": f"deliverables/{stem}_자동화.xlsx"}
    write_json(os.path.join(root, "project.json"), cfg)
    with open(os.path.join(root, ".gitignore"), "w", encoding="utf-8") as f:
        f.write(GITIGNORE)
    write_json(os.path.join(root, "registry.json"), [])
    print(f"[project] 생성: {root}")
    print(f"  TC 시트 '{ws.title}' (후보 {', '.join(cands)}) · 헤더 {hr}행 · TC ID 패턴 {pat}  (샘플 {ids[:3]})")
    print("  ⚠ 위 시트·ID 패턴이 맞는지 확인하고, 다르면 project.json 을 고치세요.")
    if not cfg["env"]:
        print("  ⚠ env 미지정 — node scripts/env.mjs add <키> <URL> 후 project.json 의 env 에 키를 넣으세요.")
    cmd_use(name)


def main():
    utf8_stdio()
    argv = sys.argv[1:]
    proj = pop_project_arg(argv)
    try:
        if not argv or argv[0] in ("show", "check"):
            cmd_show(load_project(proj))
        elif argv[0] == "list":
            cmd_list()
        elif argv[0] == "use" and len(argv) > 1:
            cmd_use(argv[1])
        elif argv[0] == "init":
            cmd_init(argv[1:])
        else:
            print(__doc__)
            sys.exit(2)
    except ProjectError as e:
        print(f"[project] {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
