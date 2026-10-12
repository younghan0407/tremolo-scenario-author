#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
author.py — 프로젝트 단위 저작 보조 도구(구 v4-design 의 gen/wk/finalize/carry/mark/restamp/publish 를 범용화).
경로·환경은 모두 project.json 에서 읽는다(하드코딩 금지).

  python scripts/project/author.py [--project <이름|경로>] <명령> ...

  gen <src.py> [이름일부 ...]     저작 소스(.py)를 실행해 steps.json 을 쓰고 generate (이름일부를 주면 그것만)
  wk <name>                       .work/walks/<name>.py 의 ACTIONS → walk.mjs 실행(비변경 화면 덤프)
  finalize <name> ...             meta 의 실측 스탬프를 steps 로 회수 → 재생성 → 정적 검증 → registry 등록
  carry <name> [--except s1,s2]   소스 재실행 후 기존 meta 스탬프를 id+title 같은 스텝에 이관하고 재생성
  mark <name> s20 s38 ...         실측 결과 'TC 기대 요소 미노출'을 TC 불일치로 표기
  restamp <name> "<대체자원>" s.. 대체자원 값 차이로 실측 불가한 스텝을 [예측](데이터 의존)으로 되돌림
  install <name> ...              finalize 된 스크립트를 Tremolo data/scenarios 로 설치(+ registry 에 설치 지문 기록)
"""
import datetime
import json
import os
import runpy
import shutil
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from project.proj import HARNESS, file_sha, load_project, pop_project_arg, steps_fingerprint, utf8_stdio  # noqa: E402

utf8_stdio()
TODAY = datetime.date.today().isoformat()


def _load(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def _dump(p, doc, indent):
    with open(p, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=indent)


def generate(P, steps_p):
    """generate.mjs 호출. 출력 루트는 scenariosDir 의 <sol>/<ver> 상위."""
    sd = P.scenarios_dir
    if os.path.basename(sd) != P.version or os.path.basename(os.path.dirname(sd)) != P.solution:
        sys.exit(f"[author] scenariosDir 는 .../{P.solution}/{P.version} 이어야 합니다: {sd}")
    args = ["node", "scripts/generate.mjs", steps_p, "--out", os.path.dirname(os.path.dirname(sd))]
    if P.env:
        args += ["--env", P.env]
    return subprocess.run(args, cwd=HARNESS, capture_output=True, text=True, encoding="utf-8")


def cmd_gen(P, argv):
    src, keys = argv[0], argv[1:]
    env = {**os.environ, "PYTHONIOENCODING": "utf-8", "TREMOLO_PROJECT": P.root}
    out = subprocess.run([sys.executable, src], cwd=P.root, capture_output=True, text=True, encoding="utf-8",
                         env=env, check=True).stdout.splitlines()
    for p in [line for line in out if line.endswith(".steps.json") and (not keys or any(k in line for k in keys))]:
        r = generate(P, p)
        print(os.path.basename(p), "->", (r.stdout + r.stderr).strip().splitlines()[-1][:200])


def cmd_wk(P, argv):
    name = argv[0]
    acts = runpy.run_path(os.path.join(P.work_dir, "walks", name + ".py"))["ACTIONS"]
    jp = os.path.join(P.work_dir, "walk", name + ".json")
    os.makedirs(os.path.dirname(jp), exist_ok=True)
    _dump(jp, acts, None)
    args = ["node", "scripts/live/walk.mjs", jp, "--out", os.path.join(P.work_dir, "walk", name), "--headless"]
    if P.env:
        args += ["--env", P.env]
    r = subprocess.run(args, cwd=HARNESS, capture_output=True, text=True, encoding="utf-8", timeout=4000)  # 계정 잠금 대기 포함
    for line in (r.stdout + r.stderr).splitlines():
        if line.startswith(("EVAL", "FAIL", "COUNT", "BLOCK")):
            print(line[:3000])


def _keyed(steps):
    """제목+순번으로 매칭(스텝 추가로 id 가 밀려도 안전 — generate.mjs carry 와 동일 규칙)."""
    occ, out = {}, {}
    for s in steps:
        occ[s["title"]] = occ.get(s["title"], 0) + 1
        out[(s["type"], s["title"], occ[s["title"]])] = s
    return out


def finalize_one(P, name):
    steps_p, meta_p = P.steps_path(name), P.meta_path(name)
    doc, meta = _load(steps_p), _load(meta_p)
    mk = _keyed(meta["steps"])
    occ = {}
    tc_re = P.tc_id_re
    mismatch, postmut, grounded, body = [], [], 0, 0
    for s in doc["steps"]:
        occ[s["title"]] = occ.get(s["title"], 0) + 1
        m = mk.get((s["type"], s["title"], occ[s["title"]]))
        n = m.get("note", "") if m else None
        if n is None:
            continue
        s["note"] = n
        if not (s.get("target") or s.get("type") in ("antdTableSelect",)):
            continue
        body += 1
        if n.startswith("[실측]"):
            grounded += 1
        if s.get("onFailure") == "continue":
            s["onFailure"] = "fail"  # TC 불일치를 pass 처리하지 않는다 — 실패로 남겨 보고
        s["note"] = s["note"].replace(" — onFailure=continue", "")
        if "상태 불일치" in n and "사전데이터" not in n:
            if "확인 필요(TC 불일치 의심)" not in s["note"]:
                s["note"] += " / 확인 필요(TC 불일치 의심)"
            mismatch.append(f"{s['id']} {s['title']} [{','.join(tc_re.findall(n))}]")
        if n.startswith("[예측] 변경 후 결과"):
            postmut.append(f"{s['id']} {s['title']}")
    _dump(steps_p, doc, 1)

    g = generate(P, steps_p)
    if g.returncode != 0:
        # 생성 실패 시 남아 있는 이전 spec 을 검증해 '완료'로 등록하면 안 된다 → 중단, registry 그대로.
        print(f"{name}: 생성 실패 — registry 갱신 안 함\n  {(g.stdout + g.stderr).strip()[-600:]}")
        return False
    v = subprocess.run(["node", "scripts/verify.mjs", P.spec_path(name)], cwd=HARNESS, capture_output=True, text=True,
                       encoding="utf-8")
    ok = v.returncode == 0 and ": PASS" in v.stdout
    print("static verify:", "PASS" if ok else "FAIL " + v.stdout + v.stderr)

    pending = body - grounded
    status = "실측완료" if pending == 0 else (
        "실측완료(변경결과 1회실행 확인)" if pending == len(postmut) else f"부분실측({grounded}/{body})")
    reg = [r for r in P.registry() if r["name"] != name]
    prev = next((r for r in P.registry() if r["name"] == name), {})
    entry = {"name": name, "date": TODAY, "tc_ids": doc.get("_tcs", []), "status": status,
             "grounded": f"{grounded}/{body}", "static_verify": "PASS" if ok else "FAIL",
             "mismatch": mismatch, "postmut": postmut,
             "fingerprint": steps_fingerprint(_load(meta_p)["steps"]), "spec_sha": file_sha(P.spec_path(name))}
    for k in ("installed_at", "installed_fingerprint", "installs"):  # 설치 이력은 install 만 갱신
        if k in prev:
            entry[k] = prev[k]
    reg.append(entry)
    P.save_registry(reg)
    print(f"{name}: {status} grounded {grounded}/{body} mismatch {len(mismatch)} postmut {len(postmut)}")
    for m in mismatch:
        print("  ! TC 불일치:", m)
    return ok


def cmd_finalize(P, argv):
    bad = [name for name in argv if not finalize_one(P, name)]
    if bad:
        print(f"[author] finalize 실패·검증 FAIL {len(bad)}개: {', '.join(bad)}")
        sys.exit(1)


def cmd_carry(P, argv):
    name = argv[0]
    exc = set(argv[argv.index("--except") + 1].split(",")) if "--except" in argv else set()
    mp, sp = P.meta_path(name), P.steps_path(name)
    d = _load(sp)
    n = 0
    if os.path.exists(mp):
        old = {s["id"]: s for s in _load(mp)["steps"]}
        for s in d["steps"]:
            o = old.get(s["id"])
            if o and o["title"] == s["title"] and s["id"] not in exc and o.get("note", "").startswith("["):
                s["note"] = o["note"]
                n += 1
    _dump(sp, d, 1)
    generate(P, sp)
    print(f"carried {n} stamps → regenerated {name}")


def _restamp_files(P, name, fn):
    for p, indent in ((P.steps_path(name), 1), (P.meta_path(name), 2)):
        doc = _load(p)
        for s in doc["steps"]:
            fn(s)
        _dump(p, doc, indent)


def cmd_mark(P, argv):
    name, ids = argv[0], set(argv[1:])

    def fn(s):
        if s["id"] in ids and "상태 불일치" not in s["note"]:
            rest = s["note"].split("—", 1)[-1].strip() if s["note"].startswith("[") else s["note"]
            s["note"] = f"[실측] {TODAY} 화면 확인, 상태 불일치(TC 기대 요소 미노출) — {rest}"
    _restamp_files(P, name, fn)
    print("marked", sorted(ids))


def cmd_restamp(P, argv):
    name, alt, ids = argv[0], argv[1], set(argv[2:])
    tc_re = P.tc_id_re

    def fn(s):
        if s["id"] in ids:
            tcs = sorted(set(tc_re.findall(s.get("note", ""))))
            s["note"] = (f"[예측] 대체 리소스({alt}) 값 차이로 실측 불가 — 시나리오 생성 자원 기준(실행 시 확인)"
                         + (f"; TC {','.join(tcs)}" if tcs else ""))
            s.pop("onFailure", None)
    _restamp_files(P, name, fn)
    print("restamped", sorted(ids))


def cmd_install(P, argv):
    dst = P.installed_dir
    if not dst:
        sys.exit("[author] Tremolo data/scenarios 위치를 못 찾았습니다. TREMOLO_DATA_SCENARIOS 또는 project.json tremoloRoot 지정.")
    reg = P.registry()
    by = {r["name"]: r for r in reg}
    os.makedirs(dst, exist_ok=True)
    skipped = 0
    for name in argv:
        r = by.get(name)
        if not r:
            print(f"  SKIP {name}: registry 미등록 — 먼저 finalize"); skipped += 1; continue
        if r.get("static_verify") != "PASS":
            print(f"  SKIP {name}: 정적 검증 FAIL 상태 — 고친 뒤 finalize"); skipped += 1; continue
        # 저장된 PASS 를 믿지 않는다: finalize 때 검증한 바로 그 파일인지(지문) + 지금 다시 검증해도 PASS 인지 확인.
        fp = steps_fingerprint(_load(P.meta_path(name))["steps"])
        if fp != r.get("fingerprint") or file_sha(P.spec_path(name)) != r.get("spec_sha"):
            print(f"  SKIP {name}: finalize 이후 meta/spec 이 바뀜(지문 불일치) — 다시 finalize"); skipped += 1; continue
        v = subprocess.run(["node", "scripts/verify.mjs", P.spec_path(name)], cwd=HARNESS, capture_output=True, text=True, encoding="utf-8")
        if v.returncode != 0 or ": PASS" not in v.stdout:
            print(f"  SKIP {name}: 설치 직전 재검증 FAIL\n{v.stdout[-800:]}"); skipped += 1; continue
        for f in (P.spec_path(name), P.meta_path(name)):
            shutil.copy2(f, dst)
        # 설치 스냅샷·이력: Tremolo 실행 결과를 '그때 설치돼 있던 내용'의 TC 연결로 기록하기 위해(record)
        os.makedirs(P.snapshots_dir, exist_ok=True)
        snap = P.snapshot_path(name, fp)
        if not os.path.exists(snap):
            shutil.copy2(P.meta_path(name), snap)
        now = datetime.datetime.now().astimezone().isoformat(timespec="seconds")
        r["installed_at"], r["installed_fingerprint"] = now, fp
        r.setdefault("installs", []).append({"at": now, "fingerprint": fp})
        print(f"  installed {name} → {dst}")
    P.save_registry(reg)
    if skipped:
        sys.exit(1)


CMDS = {"gen": cmd_gen, "wk": cmd_wk, "finalize": cmd_finalize, "carry": cmd_carry, "mark": cmd_mark,
        "restamp": cmd_restamp, "install": cmd_install}


def main():
    argv = sys.argv[1:]
    proj = pop_project_arg(argv)
    if not argv or argv[0] not in CMDS:
        print(__doc__)
        sys.exit(2)
    P = load_project(proj)
    CMDS[argv[0]](P, argv[1:])


if __name__ == "__main__":
    main()
