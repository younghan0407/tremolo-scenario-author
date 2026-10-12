#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
record.py — Tremolo 실행 결과(result/report/<날짜>/<런셋>/summary.json)를 TC 결과로 기록한다.

  tremolo.cmd runs  [--all] [--limit N]          이 프로젝트 시나리오가 들어있는 최근 실행 목록(기록 여부 표시)
  tremolo.cmd record <대상>                       미리보기만(아무것도 쓰지 않음) — 기본 동작
  tremolo.cmd record <Run ID> --apply             원장(results/runs) 기록 + 산출물 워크북 갱신
     <대상> = latest | runs 목록 번호 | Run ID | 실행 폴더 경로
     --force               이미 기록된 실행을 다시 기록(결과가 달라졌을 때만 필요)
     --allow-env-mismatch  실행 환경 URL 이 프로젝트 환경과 달라도 기록(기본은 차단)
  (직접 실행: python scripts/results/record.py [--project <이름>] runs|record ...)

판정 규칙·가드레일: references/results-recording.md
"""
import datetime
import getpass
import glob
import json
import os
import re
import sys
from urllib.parse import urlparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from project.proj import HARNESS, load_project, norm_title, parse_time, pop_project_arg, steps_fingerprint, utf8_stdio, write_json  # noqa: E402
from results.deliverable import BuildError, build, workbook_locked  # noqa: E402
from results.ledger import latest_by_tc, load_runs, run_file  # noqa: E402

ANSI = re.compile(r"\x1b\[[0-9;]*m")
STEP_STATE = {"success": "pass", "warning": "fail", "failed": "fail"}  # 그 외(pending/running) = notRun
# Tremolo executionService.forceFailRemainingScenarios 가 남은 스텝에 넣는 고정 사유(실제 실패 아님)
FORCED_ERRORS = {"사용자에 의해 실행이 중지되었습니다.", "실행 중 예기치 않은 오류가 발생했습니다."}


def _load(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def _local(iso):
    try:
        return datetime.datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone().strftime("%Y-%m-%d %H:%M")
    except (AttributeError, ValueError):
        return iso or "?"


def _host(url):
    try:
        return (urlparse(url).netloc or url or "").lower().rstrip("/")
    except ValueError:
        return url


def _path_key(path):
    """report-data 의 'CONTRABASS / V4.0' → ('CONTRABASS', 'V4.0')."""
    parts = [x.strip() for x in str(path or "").split("/") if x.strip()]
    return tuple(parts[:2]) if len(parts) >= 2 else None


# ── 실행 목록 ─────────────────────────────────────────────
def read_run(P, d):
    """실행 폴더 1개 → 정보 dict (summary.json 이 없거나 깨졌으면 None)."""
    try:
        summ = _load(os.path.join(d, "summary.json"))
    except (OSError, ValueError):
        return None
    rd_p = os.path.join(d, "report-data.json")
    rd = _load(rd_p) if os.path.exists(rd_p) else {}
    paths, envs = {}, set()
    for run in rd.get("runs", []):
        for ts in run.get("testSets", []):
            if ts.get("environment"):
                envs.add(ts["environment"])
            for sc in ts.get("scenarios", []):
                paths[sc.get("id")] = sc.get("path")
    mine = sum(1 for sc in summ.get("scenarios", []) if _path_key(paths.get(sc.get("id"))) == (P.solution, P.version))
    return {"dir": d, "summary": summ, "paths": paths, "envs": sorted(envs), "mine": mine,
            "runId": summ.get("id") or os.path.basename(d), "startedAt": summ.get("startedAt") or ""}


def scan_runs(P):
    root = P.report_dir
    if not root or not os.path.isdir(root):
        raise SystemExit(f"[record] Tremolo 결과 폴더를 찾지 못했습니다: {root} "
                         "(project.json 에 reportDir 를 지정하거나 TREMOLO_ROOT 설정)")
    runs = [r for r in (read_run(P, os.path.dirname(s))
                        for s in glob.glob(os.path.join(root, "*", "*", "summary.json"))) if r]
    runs.sort(key=lambda r: r["startedAt"], reverse=True)
    return runs


def recorded_ids(P):
    return {r["runId"] for r in load_runs(P)}


def cmd_runs(P, argv):
    show_all = "--all" in argv
    limit = int(argv[argv.index("--limit") + 1]) if "--limit" in argv else 15
    runs = [r for r in scan_runs(P) if show_all or r["mine"]]
    done = recorded_ids(P)
    print(f"[runs] {P.name} ({P.solution} {P.version}) — Tremolo 결과: {P.report_dir}")
    if not runs:
        print("  이 프로젝트 시나리오가 들어간 실행이 없습니다. (--all 로 전체 보기)")
        return
    print(f"  {'#':>2}  {'실행 시작':16}  {'런셋':14} {'상태':9} {'시나리오(이 프로젝트/전체)':>14}  {'통과/실패':>7}  기록   Run ID")
    for i, r in enumerate(runs[:limit], 1):
        s = r["summary"]
        print(f"  {i:>2}  {_local(r['startedAt']):16}  {str(s.get('runSetName', ''))[:14]:14} {str(s.get('status', '')):9} "
              f"{r['mine']:>6}/{s.get('totalScenarios', len(s.get('scenarios', []))):<7}  "
              f"{s.get('passedScenarios', 0):>3}/{s.get('failedScenarios', 0):<3}  {'✓' if r['runId'] in done else '-':4} {r['runId']}")
    print("\n  미리보기: tremolo.cmd record <# 또는 Run ID>   (아무것도 쓰지 않음)")


def resolve(P, sel):
    if sel and os.path.exists(sel):
        d = os.path.dirname(sel) if os.path.isfile(sel) else sel
        if not os.path.exists(os.path.join(d, "summary.json")):
            raise SystemExit(f"[record] summary.json 이 없는 폴더입니다: {d}")
        return read_run(P, d)
    runs = scan_runs(P)
    mine = [r for r in runs if r["mine"]]
    if sel in (None, "", "latest"):
        if not mine:
            raise SystemExit("[record] 이 프로젝트 시나리오가 들어간 실행이 없습니다.")
        return mine[0]
    if sel.isdigit() and len(sel) <= 3:
        i = int(sel)
        if not 1 <= i <= len(mine):
            raise SystemExit(f"[record] 목록 번호 {i} 없음 — tremolo.cmd runs 로 확인")
        return mine[i - 1]
    hit = [r for r in runs if r["runId"] == sel or os.path.basename(r["dir"]) == sel]
    if not hit:
        raise SystemExit(f"[record] 실행을 찾지 못했습니다: {sel} — tremolo.cmd runs 로 확인")
    return hit[0]


# ── 분석 ─────────────────────────────────────────────────
def _meta_candidates(P, name, reg_entry, started_at):
    """실행 당시의 스크립트 내용 후보. (실행 뒤에 바뀐 파일로 매핑하면 바뀐 기대값·TC 연결에 과거 결과가 붙는다.)
    ① 실행 시각에 설치돼 있던 설치 스냅샷(install 이 results/snapshots 에 보관)
    ② 지금 설치본·생성본 — 단, 실행 시작보다 **먼저** 수정된 경우만(Tremolo 앱에서 직접 고친 뒤 실행한 경우 포함)
    반환: (후보 목록, 실행 뒤에 수정돼 제외한 파일 라벨 목록)"""
    run_t = parse_time(started_at)
    out, late = [], []
    hist = [h for h in (reg_entry or {}).get("installs", []) if parse_time(h.get("at"))]
    hist.sort(key=lambda h: parse_time(h["at"]))
    eff = [h for h in hist if run_t and parse_time(h["at"]) <= run_t]
    if eff:
        sp = P.snapshot_path(name, eff[-1]["fingerprint"])
        if os.path.exists(sp):
            out.append((f"설치 스냅샷({eff[-1]['at'][:16]})", sp, _load(sp)["steps"]))
    for label, installed in (("설치본(data/scenarios)", True), ("생성본(scenarios)", False)):
        p = P.meta_path(name, installed=installed)
        if p and os.path.exists(p):
            mtime = datetime.datetime.fromtimestamp(os.path.getmtime(p)).astimezone()
            if run_t is None or mtime <= run_t:
                out.append((label, p, _load(p)["steps"]))
            else:
                late.append(label)
    return out, late


def _screenshot(run_dir, art_dir, step_no):
    if not art_dir:
        return None
    hits = glob.glob(os.path.join(glob.escape(os.path.join(run_dir, art_dir, "screenshots")), f"*-step{step_no}-*.png"))
    return sorted(hits)[-1] if hits else None


def _err(e):
    lines = [x.strip() for x in ANSI.sub("", e or "").splitlines() if x.strip()]
    return " / ".join(lines[:2])[:300]


def analyze(P, run):
    summ, d = run["summary"], run["dir"]
    reg = {r["name"]: r for r in P.registry()}
    tc_re = P.tc_id_re
    errors, warns, scenarios, skipped, others = [], [], [], [], 0

    status = summ.get("status")
    if status == "running" or not summ.get("completedAt"):
        errors.append("실행이 아직 끝나지 않았습니다(running) — 끝난 뒤 기록하세요")
    elif status == "stopped":
        warns.append("중지된 실행입니다 — 실행되지 않은 스텝의 TC 는 N-T 로 기록됩니다")
    if (summ.get("completedCycles") or 1) > 1:
        warns.append(f"반복 실행({summ.get('completedCycles')}회) — Tremolo 집계 규칙 '{summ.get('aggregation', '')}' 기준 결과를 기록합니다")

    env_key, env = P.env_info()
    want = _host(env.get("baseUrl"))
    got = {_host(e) for e in run["envs"]}
    env_ok = None
    if want and got:
        env_ok = want in got and len(got) == 1
        if not env_ok:
            errors.append(f"실행 환경({', '.join(sorted(got))})이 프로젝트 환경({env_key}: {want})과 다릅니다 "
                          "— 다른 환경 결과를 섞지 않도록 차단(의도한 것이면 --allow-env-mismatch)")
    elif want:
        warns.append("실행 환경 정보를 결과에서 찾지 못했습니다(report-data.json 없음) — 환경 일치 여부 미확인")

    for sc in summ.get("scenarios", []):
        name = sc.get("name", "")
        key = _path_key(run["paths"].get(sc.get("id")))
        if key and key != (P.solution, P.version):
            others += 1
            continue
        r = reg.get(name)
        if not r:
            skipped.append({"name": name, "reason": "registry 미등록(하네스로 만든 스크립트가 아님 또는 이름 변경)"})
            continue
        steps = sc.get("steps", [])
        run_titles = [norm_title(s.get("stepInfo")) for s in steps]
        meta, src = None, None
        cands, late = _meta_candidates(P, name, r, summ.get("startedAt"))
        for label, p, msteps in cands:
            if [norm_title(s.get("title")) for s in msteps] == run_titles:
                meta, src = msteps, label
                break
        if meta is None:
            if not cands:
                why = ("실행 이후 스크립트가 수정돼(" + ", ".join(late) + ") 실행 당시 내용을 확인할 수 없음 — 현재 스크립트로 다시 실행해 기록하세요"
                       if late else "meta 파일 없음")
            else:
                m = [norm_title(s.get("title")) for s in cands[0][2]]
                i = next((k for k, (a, b) in enumerate(zip(run_titles, m)) if a != b), min(len(run_titles), len(m)))
                why = (f"스텝 구성 불일치 — 실행본 {len(run_titles)}스텝 vs 현재 {len(m)}스텝, #{i + 1}부터 다름"
                       f"(실행본 '{run_titles[i] if i < len(run_titles) else '-'}' / 현재 '{m[i] if i < len(m) else '-'}') "
                       "→ 실행 후 스크립트가 수정됨. 현재 스크립트로 다시 실행해 기록하세요")
            skipped.append({"name": name, "reason": why})
            continue
        # TC 범위: 매핑에 쓴 meta 가 지금 registry 와 같은 버전이면 registry 의 TC 목록, 아니면(실행 당시 스냅샷 등)
        # **그 meta 의 note 에 적힌 TC** — 실행 뒤에 바뀐 TC 연결에 과거 결과가 붙지 않게.
        if r.get("fingerprint") == steps_fingerprint(meta):
            tcs_scope = list(r.get("tc_ids") or [])
        else:
            tcs_scope = sorted({t for ms in meta for t in tc_re.findall(ms.get("note", "") or "")})
        step_rows, counts = [], {"pass": 0, "fail": 0, "notRun": 0}
        hard_failed, forced = False, 0
        for st, ms in zip(steps, meta):
            state = STEP_STATE.get(st.get("result"), "notRun")
            if st.get("result") == "failed":
                # Tremolo: 정상 실패는 첫 failed 스텝만 failed, 나머지는 pending. 중지/중단 시에는 남은 스텝 전부를
                # failed(사유 고정 문구)로 강제 마킹한다 → 두 번째 이후 failed·중지 문구 스텝은 '미실행'으로 본다.
                if hard_failed or ANSI.sub("", st.get("error") or "").strip() in FORCED_ERRORS:
                    state = "notRun"
                    forced += 1
                hard_failed = True
            counts[state] += 1
            note = ms.get("note", "") or ""
            tcs = [t for t in dict.fromkeys(tc_re.findall(note)) if not tcs_scope or t in tcs_scope]
            step_rows.append({"stepNo": st.get("stepNo"), "id": ms.get("id"), "title": norm_title(ms.get("title")),
                              "state": state, "tcs": tcs, "known": ("상태 불일치" in note or "TC 불일치" in note),
                              "error": _err(st.get("error")) if state == "fail" else ""})
        if forced:
            warns.append(f"{name}: 중지/중단으로 Tremolo 가 실패 표시한 스텝 {forced}개 → 미실행(N-T)으로 처리")
        tcs = {}
        all_pass = counts["fail"] == 0 and counts["notRun"] == 0
        for tc in (tcs_scope or sorted({t for s in step_rows for t in s["tcs"]})):
            mine = [s for s in step_rows if tc in s["tcs"]]
            if not mine:
                res = {"result": "Pass" if all_pass else "N-T",
                       "reason": "스텝 매핑 없음 — 시나리오 전체 통과로 판정" if all_pass else "스텝 매핑 없음"}
            elif any(s["state"] == "fail" for s in mine):
                fails = [s for s in mine if s["state"] == "fail"]
                res = {"result": "Fail", "known": all(s["known"] for s in fails),
                       "failSteps": [{"stepNo": s["stepNo"], "title": s["title"], "error": s["error"],
                                      "screenshot": _screenshot(d, sc.get("artifactDir"), s["stepNo"])} for s in fails]}
                res["evidence"] = res["failSteps"][0]["screenshot"]
            elif all(s["state"] == "pass" for s in mine):
                res = {"result": "Pass"}
            else:
                res = {"result": "N-T", "reason": "미실행 스텝 포함"}
            tcs[tc] = res
        st_label = sc.get("status")
        if counts["notRun"] == len(step_rows) and step_rows:
            st_label = "미실행(중지)"
        scenarios.append({"name": name, "mapping": "ok", "metaSource": src, "fingerprint": steps_fingerprint(meta),
                          "status": st_label, "artifactDir": sc.get("artifactDir"), "stepCounts": counts,
                          "steps": step_rows, "tcs": tcs})

    if not scenarios:
        errors.append("기록할 시나리오가 없습니다(이 프로젝트 시나리오 0개 또는 전부 건너뜀)")
    pkg = _load(os.path.join(HARNESS, "package.json")).get("version", "")
    rec = {"runId": run["runId"], "runSetName": summ.get("runSetName"), "startedAt": summ.get("startedAt"),
           "completedAt": summ.get("completedAt"), "status": status, "environment": ", ".join(run["envs"]),
           "browser": summ.get("browserLabel") or summ.get("browser"), "cycles": summ.get("completedCycles"),
           "aggregation": summ.get("aggregation"), "reportDir": d,
           "report": os.path.join(d, "report.html") if os.path.exists(os.path.join(d, "report.html")) else None,
           "recordedAt": datetime.datetime.now().astimezone().isoformat(timespec="seconds"),
           "recordedBy": _user(), "harness": pkg, "scenarios": scenarios, "skipped": skipped}
    return rec, errors, warns, others, env_ok


def _user():
    try:
        return getpass.getuser()
    except Exception:
        return ""


def _same_result(a, b):
    def core(rec):
        return [(s["name"], {k: v["result"] for k, v in s["tcs"].items()}) for s in rec.get("scenarios", [])]
    return core(a) == core(b)


# ── 미리보기/적용 ─────────────────────────────────────────
def render_preview(P, rec, errors, warns, others, env_ok, existing):
    out = []
    w = out.append
    env_key, _ = P.env_info()
    w(f"[record] {P.name} ← 실행 {_local(rec['startedAt'])} · 런셋 {rec['runSetName']} · 상태 {rec['status']}")
    w(f"         Run ID {rec['runId']} · 환경 {rec['environment'] or '?'} "
      f"{'(✓ ' + env_key + ')' if env_ok else ''} · {rec['browser'] or ''}")
    w(f"         리포트 {rec['report'] or rec['reportDir']}")
    if existing:
        w(f"  · 이미 기록된 실행입니다(기록 {_local(existing.get('recordedAt'))}) — "
          + ("결과 동일, 다시 쓸 필요 없음" if _same_result(existing, rec) else "결과가 달라졌습니다 → 다시 쓰려면 --force"))
    for e in errors:
        w(f"  ✖ 차단: {e}")
    for x in warns:
        w(f"  ⚠ {x}")
    n_sc = len(rec["scenarios"]) + len(rec["skipped"])
    w(f"\n시나리오 {n_sc + others}개 중 기록 {len(rec['scenarios'])} · 건너뜀 {len(rec['skipped'])}"
      + (f" · 다른 프로젝트 {others}" if others else ""))
    for s in rec["scenarios"]:
        c = s["stepCounts"]
        t = [v["result"] for v in s["tcs"].values()]
        w(f"  ✓ {s['name']}")
        w(f"      스텝 {sum(c.values())}: 통과 {c['pass']} · 실패 {c['fail']} · 미실행 {c['notRun']}  →  "
          f"TC {len(t)}: Pass {t.count('Pass')} · Fail {t.count('Fail')} · N-T {t.count('N-T')}   [meta: {s['metaSource']}]")
    for s in rec["skipped"]:
        w(f"  ✗ {s['name']}")
        w(f"      건너뜀: {s['reason']}")

    runs = [r for r in load_runs(P) if r["runId"] != rec["runId"]]
    before = latest_by_tc(runs)
    after = latest_by_tc(sorted(runs + [rec], key=lambda r: r.get("startedAt") or ""))
    trans = {}
    for tc, a in after.items():
        if not any(tc in sc["tcs"] for sc in rec["scenarios"]):
            continue
        b = before.get(tc)
        if a["run"] is not rec:
            k = "이전 결과 유지(이번 실행이 더 오래됐거나 N-T)"
        elif not b:
            k = "신규"
        elif b["result"] == a["result"]:
            k = "변화 없음"
        else:
            k = f"{b['result']}→{a['result']}"
        trans[k] = trans.get(k, 0) + 1
    w("\nTC '[자동화] 최근 결과' 변화: " + (" · ".join(f"{k} {v}" for k, v in trans.items()) or "없음"))
    fails = [(s, tc, v) for s in rec["scenarios"] for tc, v in s["tcs"].items() if v["result"] == "Fail"]
    if fails:
        w(f"\n판정 필요(Fail) {len(fails)}건 — 기록 후 '자동화_판정필요' 시트에서 담당자가 판정:")
        for s, tc, v in fails:
            st0 = v["failSteps"][0]
            w(f"  {tc}  #{st0['stepNo']} {st0['title']}  [{'사전 확인된 TC 불일치' if v.get('known') else '신규 실패'}]  {st0['error'][:90]}")
    return "\n".join(out)


def cmd_record(P, argv):
    apply_ = "--apply" in argv
    force = "--force" in argv
    allow_env = "--allow-env-mismatch" in argv
    pos = [a for a in argv if not a.startswith("--")]
    run = resolve(P, pos[0] if pos else "latest")
    if not run:
        raise SystemExit("[record] 실행을 찾지 못했습니다.")
    rec, errors, warns, others, env_ok = analyze(P, run)
    if allow_env:
        errors = [e for e in errors if "--allow-env-mismatch" not in e]
    path = run_file(P, rec["runId"], rec["startedAt"])
    existing = _load(path) if os.path.exists(path) else None
    lock = workbook_locked(P.deliverable)
    if lock:
        errors.append(f"산출물 워크북: {lock} ({os.path.basename(P.deliverable)})")
    text = render_preview(P, rec, errors, warns, others, env_ok, existing)
    print(text)

    os.makedirs(os.path.join(P.work_dir, "record"), exist_ok=True)
    pv = os.path.join(P.work_dir, "record", f"{rec['runId']}.preview.txt")
    with open(pv, "w", encoding="utf-8") as f:
        f.write(text + "\n")

    if not apply_:
        print("\n— 미리보기입니다. 아무것도 쓰지 않았습니다.")
        if errors:
            print("  차단 사유를 해결한 뒤 다시 미리보기 하세요.")
        elif existing and _same_result(existing, rec):
            print("  이미 같은 결과로 기록돼 있습니다.")
        else:
            print(f"  적용하려면:  tremolo.cmd record {rec['runId']} --apply" + (" --force" if existing else ""))
        return 0 if not errors else 1
    if errors:
        print("\n[record] 차단되어 기록하지 않았습니다.")
        return 1
    if existing:
        if _same_result(existing, rec) and not force:
            print("\n[record] 이미 같은 결과로 기록돼 있어 건너뜁니다.")
            return 0
        if not force:
            print("\n[record] 이미 기록된 실행입니다. 다시 쓰려면 --force.")
            return 1

    write_json(path, rec)
    print(f"\n[record] 원장 기록: {os.path.relpath(path, P.root)}")
    try:
        build(P)
    except (BuildError, Exception) as e:  # 저장 오류(디스크·권한·라이브러리 예외 포함) 전부 — 원장과 워크북이 어긋나지 않게 되돌린다
        try:
            if existing:
                write_json(path, existing)
            elif os.path.exists(path):
                os.remove(path)
            print(f"[record] 워크북 갱신 실패 → 원장 기록을 되돌렸습니다: {type(e).__name__}: {e}", file=sys.stderr)
        except Exception as e2:  # 되돌리기마저 실패하면 어긋난 상태를 숨기지 않는다
            print(f"[record] 워크북 갱신 실패({e}) 후 원장 되돌리기도 실패({e2}) — {path} 를 확인·삭제하세요", file=sys.stderr)
        return 1
    print("[record] 완료. 다음: 산출물의 '자동화_판정필요' 시트에서 Fail 건 판정 → (판정 반영) tremolo.cmd build")
    return 0


def main():
    utf8_stdio()
    argv = sys.argv[1:]
    proj = pop_project_arg(argv)
    if not argv or argv[0] not in ("runs", "record"):
        print(__doc__)
        sys.exit(2)
    P = load_project(proj)
    if argv[0] == "runs":
        cmd_runs(P, argv[1:])
        sys.exit(0)
    sys.exit(cmd_record(P, argv[1:]))


if __name__ == "__main__":
    main()
