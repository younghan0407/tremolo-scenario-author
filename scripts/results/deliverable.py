#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
deliverable.py — 누적 산출물(TC 워크북 _자동화.xlsx) 빌더. 양식은 references/deliverable-format.md 에 고정.

  python scripts/results/deliverable.py [--project <이름|경로>] build

- 산출물이 없으면 project.json 의 tc.source(원본 TC 워크북)를 복사해 시작, 있으면 그 파일을 누적 갱신한다.
- 하네스가 소유하는 부분만 다시 그린다: TC 시트 오른쪽 끝 '[자동화] …' 열 + '자동화_*' 시트.
  원본 열·원본 시트는 건드리지 않으며, 저장 후 원본 데이터 지문을 다시 계산해 바뀌었으면 백업으로 되돌린다.
- 사람이 쓰는 칸은 '자동화_판정필요' 시트의 판정 열뿐이다. 빌드 전에 수확해 results/verdicts.json 에 보존하고 다시 그린다.
- 저장: .work/backups 에 직전 파일 백업(최근 10개) → 임시 파일 저장 → 교체. 엑셀에서 열려 있으면 중단.
"""
import collections
import copy
import datetime
import glob
import hashlib
import json
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from project.proj import HARNESS, load_project, pop_project_arg, utf8_stdio, write_json  # noqa: E402
from results.ledger import (VERDICT_CHOICES, latest_by_tc, load_runs, load_verdicts,  # noqa: E402
                            pending_reviews, vkey)
from results.tc_workbook import find_header_row, pick_sheet, resolve_columns  # noqa: E402

TOOL_PREFIX = "[자동화]"
LEGACY_TC_COLS = {"자동화 스크립트", "자동화", "포함 스크립트"}  # 이전 양식(build_design.py / log_results.py)
TC_COLS = [("[자동화] 대상", 12), ("[자동화] 스크립트", 52), ("[자동화] 실측 상태", 24),
           ("[자동화] 최근 결과", 28), ("[자동화] 실행일시", 22), ("[자동화] 증적", 40)]
SHEETS = ["자동화_요약", "자동화_시나리오설계", "자동화_사전데이터", "자동화_제외TC", "자동화_실행이력", "자동화_판정필요"]
LEGACY_SHEETS = {"녹화_사전데이터"}
HUMAN_COLS = ["판정(담당자)", "판정 메모", "판정자", "판정일"]
PRIO = {"P1": 1, "P2": 2, "P3": 3, "P4": 4}
NL = "\n"
KEEP_BACKUPS = 10


class BuildError(Exception):
    pass


def _load_wb(path):
    """파일 핸들을 남기지 않도록 메모리에서 연다(openpyxl 이 zip 핸들을 쥐고 있어 Windows 에서 교체가 막히는 문제)."""
    import io
    import openpyxl
    with open(path, "rb") as f:
        return openpyxl.load_workbook(io.BytesIO(f.read()))


def workbook_locked(path):
    """엑셀에서 열려 있으면 사유 문자열, 아니면 None."""
    if not path:
        return None
    lock = os.path.join(os.path.dirname(path), "~$" + os.path.basename(path))
    if os.path.exists(path):
        try:
            with open(path, "r+b"):
                pass
        except PermissionError:
            return "파일이 다른 프로그램(엑셀)에서 열려 있습니다"
    if os.path.exists(lock):
        return f"엑셀 잠금 파일이 있습니다({os.path.basename(lock)}) — 엑셀에서 닫은 뒤 다시 실행(엑셀이 이미 닫혀 있으면 잠금 파일을 지우세요)"
    return None


def _styles():
    from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
    thin = Side(style="thin", color="BFBFBF")
    return {
        "hfont": Font(bold=True, color="FFFFFF", name="Arial"),
        "hfill": PatternFill("solid", fgColor="305496"),
        "hfill_human": PatternFill("solid", fgColor="548235"),
        "font": Font(name="Arial", size=9),
        "wrap": Alignment(wrap_text=True, vertical="top"),
        "center": Alignment(horizontal="center", vertical="center", wrap_text=True),
        "border": Border(top=thin, bottom=thin, left=thin, right=thin),
        "Pass": PatternFill("solid", fgColor="E2EFDA"),
        "Fail": PatternFill("solid", fgColor="F8CBAD"),
        "N-T": PatternFill("solid", fgColor="EDEDED"),
        "common": PatternFill("solid", fgColor="FFF2CC"),
    }


def _fingerprint(wb, tc_sheet, tc_last_col):
    """원본 데이터 지문(시트별): 하네스 소유가 아닌 시트의 비어있지 않은 셀 전부 + TC 시트는 원본 열까지만."""
    out = {}
    for name in wb.sheetnames:
        if name in SHEETS or name in LEGACY_SHEETS:
            continue
        h = hashlib.sha1()
        ws = wb[name]
        for r, row in enumerate(ws.iter_rows(values_only=True), 1):
            for c, v in enumerate(row, 1):
                if v is None or (name == tc_sheet and c > tc_last_col):
                    continue
                h.update(f"{r},{c},{v!r};".encode("utf-8"))
        out[name] = h.hexdigest()
    return out


def _local(iso):
    """ISO(UTC) → 'YYYY-MM-DD HH:MM'(이 PC 시간대)."""
    if not iso:
        return ""
    try:
        d = datetime.datetime.fromisoformat(iso.replace("Z", "+00:00"))
        return d.astimezone().strftime("%Y-%m-%d %H:%M")
    except ValueError:
        return iso[:16]


class Ctx:
    """빌드 입력 일체(설계·레지스트리·원장·판정)."""

    def __init__(self, P):
        self.P = P
        self.areas = []
        for p in sorted(glob.glob(os.path.join(P.design_dir, "areas", "*.json"))):
            with open(p, encoding="utf-8") as f:
                self.areas.append(json.load(f))
        cp = os.path.join(P.design_dir, "common_setup.json")
        self.common = json.load(open(cp, encoding="utf-8")) if os.path.exists(cp) else []
        self.registry = P.registry()
        self.reg = {r["name"]: r for r in self.registry}
        self.runs = load_runs(P)
        self.verdicts = load_verdicts(P)
        self.scen = [s for a in self.areas for s in a.get("scenarios", [])]
        self.excluded = {e["id"]: e for a in self.areas for e in a.get("excluded", [])}
        self.tc_auto = {}
        for s in self.scen:
            for t in s.get("tc_ids", []):
                self.tc_auto.setdefault(t, s.get("automation") or "auto")
        self.tc_scripts = collections.defaultdict(list)
        for r in self.registry:
            for t in r.get("tc_ids", []):
                self.tc_scripts[t].append(r)
        self.latest = latest_by_tc(self.runs)
        # 시나리오별 최근 실행(기록된 매핑 정상분)
        self.scen_last = {}
        for run in self.runs:
            for sc in run.get("scenarios", []):
                if sc.get("mapping") == "ok":
                    self.scen_last[sc["name"]] = (run, sc)


def harvest_verdicts(wb, P, verdicts):
    """워크북의 판정 열 → verdicts.json. 워크북에 있는 행은 워크북이 이긴다(지운 것도 반영)."""
    if "자동화_판정필요" not in wb.sheetnames:
        return 0
    ws = wb["자동화_판정필요"]
    hdr = {ws.cell(1, c).value: c for c in range(1, ws.max_column + 1) if ws.cell(1, c).value}
    need = ["Run ID", "TC ID", "시나리오"]
    if not all(k in hdr for k in need):
        return 0
    n = 0
    for r in range(2, ws.max_row + 1):
        run_id, tc, sc = (ws.cell(r, hdr[k]).value for k in need)
        if not run_id or not tc:
            continue
        key = vkey(run_id, tc, sc)
        vals = {h: ws.cell(r, hdr[h]).value for h in HUMAN_COLS if h in hdr}
        vals = {k: (v.isoformat()[:10] if isinstance(v, (datetime.date, datetime.datetime)) else v)
                for k, v in vals.items() if v not in (None, "")}
        if vals:
            if verdicts.get(key) != vals:
                n += 1
            verdicts[key] = vals
        elif key in verdicts:
            del verdicts[key]
            n += 1
    return n


def result_text(ctx, tc):
    """TC 시트 '[자동화] 최근 결과' 문자열과 색 키."""
    lt = ctx.latest.get(tc)
    if not lt:
        return None, None
    res, run, info = lt["result"], lt["run"], lt["info"]
    txt = res
    if res == "Fail":
        v = ctx.verdicts.get(vkey(run["runId"], tc, info["scenario"]), {})
        txt = f"Fail → {v['판정(담당자)']}" if v.get("판정(담당자)") else "Fail (판정 대기)"
    elif res == "N-T" and info.get("reason"):
        txt = f"N-T ({info['reason']})"
    run_day = (run.get("startedAt") or "")[:10]
    if any((r.get("date") or "") > run_day for r in ctx.tc_scripts.get(tc, [])):
        txt += " · 스크립트 갱신 후 미실행"
    return txt, res


def _sheet(wb, name, index, headers, st, human=()):
    from openpyxl.utils import get_column_letter
    s = wb.create_sheet(name, index)
    for i, (t, w) in enumerate(headers, 1):
        c = s.cell(1, i, t)
        c.font, c.alignment = st["hfont"], st["center"]
        c.fill = st["hfill_human"] if t in human else st["hfill"]
        s.column_dimensions[get_column_letter(i)].width = w
    s.freeze_panes = "C2"
    return s


def _put(s, r, vals, st):
    for i, v in enumerate(vals, 1):
        c = s.cell(r, i, v)
        c.font, c.alignment, c.border = st["font"], st["wrap"], st["border"]


def _link(cell, path):
    if path and os.path.exists(path):
        cell.hyperlink = path
        cell.style = "Hyperlink"


def tc_bounds(ws):
    """(헤더 행, 원본 마지막 열, 컬럼맵). 하네스 열은 항상 원본 열의 오른쪽 끝에만 있어야 한다."""
    from openpyxl.utils import get_column_letter
    hr = find_header_row(ws)
    cols = resolve_columns(ws)
    if "id" not in cols:
        raise BuildError(f"TC 시트 '{ws.title}' 에서 '기능테스트 ID' 헤더를 못 찾았습니다")
    first_tool, last_orig = None, 0
    for c in range(1, ws.max_column + 1):
        v = ws.cell(hr, c).value
        name = str(v).strip() if v is not None else ""
        if name.startswith(TOOL_PREFIX) or name in LEGACY_TC_COLS:
            first_tool = first_tool or c
        elif name:
            if first_tool:
                raise BuildError(f"TC 시트에서 하네스 열({get_column_letter(first_tool)}) 오른쪽에 원본 열 '{name}' 이 있습니다 "
                                 "— 하네스 열은 항상 맨 오른쪽이어야 합니다. 열 순서를 확인하세요")
            last_orig = c
    return hr, last_orig, cols


def render_tc_columns(ws, ctx, st, bounds):
    """TC 시트 오른쪽 끝 [자동화] 열을 다시 그린다."""
    from openpyxl.styles import Alignment
    from openpyxl.utils import get_column_letter
    hr, last_orig, cols = bounds
    start = last_orig + 1
    # 기존 하네스 영역 비우기
    for c in range(start, ws.max_column + 1):
        for r in range(hr, ws.max_row + 1):
            cell = ws.cell(r, c)
            if cell.value is not None or cell.hyperlink:
                cell.value, cell.hyperlink = None, None
                cell.style = "Normal"
    ref = ws.cell(hr, last_orig)
    for i, (title, width) in enumerate(TC_COLS):
        h = ws.cell(hr, start + i, title)
        h.font, h.fill, h.border = copy.copy(ref.font), copy.copy(ref.fill), copy.copy(ref.border)
        h.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        ws.column_dimensions[get_column_letter(start + i)].width = width
    idc = cols["id"]
    for r in range(hr + 1, ws.max_row + 1):
        tc = ws.cell(r, idc).value
        tc = str(tc).strip() if tc is not None else ""
        if not tc:
            continue
        ex = ctx.excluded.get(tc)
        target = f"제외:{ex['tag']}" if ex else ctx.tc_auto.get(tc)
        scripts = ctx.tc_scripts.get(tc, [])
        rtxt, rkey = result_text(ctx, tc)
        lt = ctx.latest.get(tc)
        vals = [target,
                NL.join(f"{s['name']} ({s['date']})" for s in scripts) or None,
                NL.join(s.get("status", "") for s in scripts) or None,
                rtxt,
                f"{_local(lt['run'].get('startedAt'))} · {lt['run'].get('runSetName', '')}" if lt else None,
                None]
        for i, v in enumerate(vals):
            if v is None:
                continue
            c = ws.cell(r, start + i, v)
            c.alignment = st["wrap"]
        if rkey:
            ws.cell(r, start + 3).fill = st[rkey]
        if lt:
            ev = lt["info"].get("evidence") or lt["run"].get("report")
            if ev:
                c = ws.cell(r, start + 5, os.path.basename(ev))
                _link(c, ev)
    if ws.auto_filter.ref:
        first = ws.auto_filter.ref.split(":")[0]
        ws.auto_filter.ref = f"{first}:{get_column_letter(start + len(TC_COLS) - 1)}{ws.max_row}"


def render_sheets(wb, tc_ws, ctx, st, tc_meta):
    for name in list(wb.sheetnames):
        if name in SHEETS or name in LEGACY_SHEETS:
            del wb[name]
    base = wb.sheetnames.index(tc_ws.title) + 1
    P = ctx.P
    hr, cols = tc_meta
    tc_pri, tc_depth = {}, {}
    for r in range(hr + 1, tc_ws.max_row + 1):
        t = tc_ws.cell(r, cols["id"]).value
        if not t:
            continue
        t = str(t).strip()
        tc_pri[t] = tc_ws.cell(r, cols["priority"]).value if "priority" in cols else None
        tc_depth[t] = " > ".join(str(tc_ws.cell(r, cols[k]).value) for k in ("depth1", "depth2", "depth3")
                                 if k in cols and tc_ws.cell(r, cols[k]).value)

    scen = sorted(ctx.scen, key=lambda s: (PRIO.get(s.get("priority"), 9), s.get("menu", "")))
    known = {s["name"] for s in scen}
    adhoc = [{"name": r["name"], "menu": "", "priority": "", "tc_ids": r.get("tc_ids", []), "notes": "설계(areas) 밖 스크립트"}
             for r in ctx.registry if r["name"] not in known]

    # ── 요약 ─────────────────────────────────────────────
    s0 = _sheet(wb, SHEETS[0], base, [("항목", 34), ("값", 90)], st)
    s0.freeze_panes = None
    pri_targets = set(P.tc.get("priorities") or ["P1", "P2"])
    in_scope = [t for t, p in tc_pri.items() if p in pri_targets]
    placed = set(ctx.tc_auto) | set(ctx.excluded)
    exc = collections.Counter(e["tag"] for e in ctx.excluded.values())
    st_cnt = collections.Counter((r.get("status") or "").split("(")[0] for r in ctx.registry)
    res = collections.Counter(v["result"] for v in ctx.latest.values())
    reviews = pending_reviews(ctx.runs, ctx.verdicts)
    waiting = sum(1 for x in reviews if not x["verdict"].get("판정(담당자)"))
    env_key, env = P.env_info()
    pc = collections.Counter(tc_pri.get(t) for s in scen for t in s.get("tc_ids", []))
    pkg = json.load(open(os.path.join(HARNESS, "package.json"), encoding="utf-8")).get("version", "")
    rows = [
        ("▣ 기준", None),
        ("프로젝트", f"{P.name}  ({P.solution} {P.version})"),
        ("대상 환경", f"{env_key}  {env.get('baseUrl', '')}"),
        ("기준 TC 워크북", os.path.basename(P.tc_source or "")),
        ("TC 시트", tc_ws.title),
        ("갱신 시각", datetime.datetime.now().strftime("%Y-%m-%d %H:%M")),
        ("하네스", f"tremolo-scenario-author {pkg}"),
        ("▣ 설계", None),
        ("시나리오", f"{len(scen)}개"),
        ("포함 TC", f"{sum(pc.values())}건 (P1 {pc['P1']} · P2 {pc['P2']} · P3+P4 {pc['P3'] + pc['P4']})"),
        ("자동화 제외 TC", f"{len(ctx.excluded)}건  " + ", ".join(f"{k} {v}" for k, v in exc.most_common())),
        (f"설계 대상({'/'.join(sorted(pri_targets))}) 배치 누락", f"{len([t for t in in_scope if t not in placed])}건"),
        ("▣ 스크립트", None),
        ("생성 스크립트", f"{len(ctx.registry)}개  " + ", ".join(f"{k} {v}" for k, v in st_cnt.most_common())),
        ("스크립트가 있는 TC", f"{len(ctx.tc_scripts)}건"),
        ("▣ 실행 결과 (Tremolo 실행 → tremolo.cmd record 로 기록)", None),
        ("기록된 실행", f"{len(ctx.runs)}회" + (f"  (최근 {_local(ctx.runs[-1].get('startedAt'))})" if ctx.runs else "")),
        ("TC 최근 결과", f"Pass {res['Pass']} · Fail {res['Fail']} · N-T {res['N-T']}"),
        ("판정 대기(Fail, 담당자 판정 전)", f"{waiting}건  → '자동화_판정필요' 시트의 판정 열을 채운 뒤 build"),
        ("▣ 이 파일에 대해", None),
        ("자동 생성 영역", "TC 시트 오른쪽 '[자동화] …' 열과 '자동화_*' 시트는 build/record 때마다 다시 그려집니다(직접 수정 금지)."),
        ("사람이 쓰는 칸", "'자동화_판정필요' 시트의 초록 헤더 열(판정·메모·판정자·판정일)만 보존됩니다."),
        ("원본 보호", "원본 열·원본 시트는 수정하지 않으며, 저장 후 지문 검사로 확인합니다. 원본 '테스트 결과' 열은 사람이 채웁니다."),
    ]
    from openpyxl.styles import Font
    for i, (k, v) in enumerate(rows, 2):
        if v is None:
            c = s0.cell(i, 1, k)
            c.font = Font(bold=True, name="Arial", size=10)
        else:
            _put(s0, i, [k, v], st)

    # ── 시나리오 설계 ────────────────────────────────────
    s1 = _sheet(wb, SHEETS[1], base + 1,
                [("No", 5), ("시나리오(스크립트)명", 48), ("메뉴", 22), ("우선순위", 7), ("화면(Depth3)", 30), ("흐름", 60),
                 ("TC 수", 6), ("P1", 5), ("P2", 5), ("P3+P4", 6), ("자동화", 8), ("자원 변경", 7), ("참고 샘플", 34),
                 ("스크립트 상태", 22), ("실측 스텝", 9), ("TC 불일치(확인 필요)", 40), ("최근 실행 결과", 26),
                 ("최근 실행일시", 17), ("포함 TC ID", 50), ("비고", 40)], st)
    for i, s in enumerate(scen + adhoc, 1):
        p = collections.Counter(tc_pri.get(t) for t in s.get("tc_ids", []))
        r = ctx.reg.get(s["name"])
        last = ctx.scen_last.get(s["name"])
        lres = ""
        if last:
            c = collections.Counter(v["result"] for v in last[1].get("tcs", {}).values())
            lres = f"{last[1].get('status', '')} — TC Pass {c['Pass']} · Fail {c['Fail']} · N-T {c['N-T']}"
        _put(s1, i + 1, [i, s["name"], s.get("menu", ""), s.get("priority", ""), ", ".join(s.get("screens", [])),
                         s.get("flow", ""), len(s.get("tc_ids", [])), p["P1"], p["P2"], p["P3"] + p["P4"],
                         s.get("automation", ""), ("Y" if s.get("mutating") else "N") if "mutating" in s else "",
                         s.get("sample") or "", f"{r['status']} ({r['date']})" if r else "설계",
                         r.get("grounded", "") if r else "", NL.join(r.get("mismatch", [])) if r else "",
                         lres, _local(last[0].get("startedAt")) if last else "", ", ".join(s.get("tc_ids", [])),
                         s.get("notes", "")], st)
    s1.auto_filter.ref = f"A1:T{len(scen) + len(adhoc) + 1}"

    # ── 사전 데이터 ──────────────────────────────────────
    s2 = _sheet(wb, SHEETS[2], base + 2, [("No", 5), ("시나리오(스크립트)명", 48), ("메뉴", 22), ("우선순위", 7),
                                          ("사전 데이터(실행 전 준비)", 80), ("설정/계정/환경", 60)], st)
    for j, c in enumerate(ctx.common, 2):
        _put(s2, j, ["공통", c["title"], "전체", "-", NL.join("• " + x for x in c.get("predata", [])),
                     NL.join("• " + x for x in c.get("settings", []))], st)
        for k in range(1, 7):
            s2.cell(j, k).fill = st["common"]
    off = len(ctx.common)
    for i, s in enumerate(scen, 1):
        _put(s2, i + 1 + off, [i, s["name"], s.get("menu", ""), s.get("priority", ""),
                               NL.join("• " + x for x in s.get("predata", [])),
                               NL.join("• " + x for x in s.get("settings", []))], st)
    s2.auto_filter.ref = f"A1:F{len(scen) + 1 + off}"

    # ── 제외 TC ──────────────────────────────────────────
    s3 = _sheet(wb, SHEETS[3], base + 3, [("기능테스트 ID", 14), ("우선순위", 7), ("메뉴(Depth1>2>3)", 40), ("태그", 18),
                                          ("사유", 70)], st)
    for r, e in enumerate(ctx.excluded.values(), 2):
        _put(s3, r, [e["id"], tc_pri.get(e["id"]), tc_depth.get(e["id"], ""), e["tag"], e["reason"]], st)
    s3.auto_filter.ref = f"A1:E{len(ctx.excluded) + 1}"

    # ── 실행 이력 ────────────────────────────────────────
    s4 = _sheet(wb, SHEETS[4], base + 4,
                [("실행 시작", 17), ("Run ID", 22), ("런셋", 16), ("환경", 30), ("브라우저", 20), ("실행 상태", 10),
                 ("시나리오", 48), ("시나리오 결과", 11), ("스텝 성공/실패/미실행", 16), ("TC Pass/Fail/N-T", 16),
                 ("기록", 34), ("기록 시각", 17), ("리포트", 30)], st)
    r = 2
    for run in reversed(ctx.runs):
        for sc in run.get("scenarios", []) + [dict(x, mapping="skip") for x in run.get("skipped", [])]:
            sc_ok = sc.get("mapping") == "ok"
            sn = sc.get("stepCounts", {})
            tcn = collections.Counter(v["result"] for v in sc.get("tcs", {}).values())
            _put(s4, r, [_local(run.get("startedAt")), run["runId"], run.get("runSetName", ""), run.get("environment", ""),
                         run.get("browser", ""), run.get("status", ""), sc["name"], sc.get("status", "") if sc_ok else "",
                         f"{sn.get('pass', 0)}/{sn.get('fail', 0)}/{sn.get('notRun', 0)}" if sc_ok else "",
                         f"{tcn['Pass']}/{tcn['Fail']}/{tcn['N-T']}" if sc_ok else "",
                         ("기록됨 — " + sc.get("metaSource", "")) if sc_ok else f"건너뜀: {sc.get('reason', '')}",
                         _local(run.get("recordedAt")), os.path.basename(run.get("report") or "")], st)
            _link(s4.cell(r, 13), run.get("report"))
            if sc_ok:
                s4.cell(r, 8).fill = st[{"failed": "Fail", "미실행(중지)": "N-T"}.get(sc.get("status"), "Pass")]
            r += 1
    s4.auto_filter.ref = f"A1:M{max(r - 1, 1)}"

    # ── 판정 필요 ────────────────────────────────────────
    from openpyxl.worksheet.datavalidation import DataValidation
    s5 = _sheet(wb, SHEETS[5], base + 5,
                [("Run ID", 22), ("실행 시작", 17), ("TC ID", 14), ("우선순위", 7), ("메뉴(Depth1>2>3)", 30), ("시나리오", 44),
                 ("실패 스텝", 36), ("구분", 16), ("오류 요약", 50), ("증적", 30)] + [(h, w) for h, w in zip(HUMAN_COLS, (20, 40, 12, 12))],
                st, human=HUMAN_COLS)
    dv = DataValidation(type="list", formula1='"' + ",".join(VERDICT_CHOICES) + '"', allow_blank=True)
    s5.add_data_validation(dv)
    rows5 = sorted(reviews, key=lambda x: (x["run"].get("startedAt") or "", x["tc"]), reverse=True)
    for r, x in enumerate(rows5, 2):
        v, run = x["v"], x["run"]
        steps = v.get("failSteps", [])
        _put(s5, r, [run["runId"], _local(run.get("startedAt")), x["tc"], tc_pri.get(x["tc"]), tc_depth.get(x["tc"], ""),
                     x["scenario"]["name"], NL.join(f"#{s['stepNo']} {s['title']}" for s in steps),
                     "사전 확인된 TC 불일치" if v.get("known") else "신규 실패",
                     NL.join(s.get("error", "") for s in steps)[:500],
                     os.path.basename(steps[0].get("screenshot") or "") if steps and steps[0].get("screenshot") else ""]
             + [x["verdict"].get(h) for h in HUMAN_COLS], st)
        if steps and steps[0].get("screenshot"):
            _link(s5.cell(r, 10), steps[0]["screenshot"])
        if not v.get("known"):
            s5.cell(r, 8).fill = st["Fail"]
    if rows5:
        dv.add(f"K2:K{len(rows5) + 1}")
    s5.auto_filter.ref = f"A1:N{len(rows5) + 1}"
    return {"reviews": len(rows5), "waiting": waiting, "results": dict(res)}


def write_design_md(P, ctx, tc_pri):
    tot = collections.Counter()
    for s in ctx.scen:
        tot.update(tc_pri.get(t) for t in s.get("tc_ids", []))
    exc = collections.Counter(e["tag"] for e in ctx.excluded.values())
    md = [f"# {P.solution} {P.version} 자동화 시나리오 설계\n",
          f"- 시나리오 {len(ctx.scen)}개 / 포함 TC {sum(tot.values())}건 (P1 {tot['P1']} · P2 {tot['P2']} · P3+P4 {tot['P3'] + tot['P4']})",
          f"- 자동화 제외(태그) {sum(exc.values())}건: " + ", ".join(f"{k} {v}" for k, v in exc.most_common()),
          f"- 생성 스크립트 {len(ctx.registry)}개 / 기록된 실행 {len(ctx.runs)}회\n"]
    for a in ctx.areas:
        md.append(f"\n## {a.get('scope', a.get('key', ''))}\n")
        md.append("| 우선 | 시나리오 | TC(P1/P2/기타) | 자동화 | 상태 | 최근 실행 |\n|---|---|---|---|---|---|")
        for s in sorted(a.get("scenarios", []), key=lambda x: PRIO.get(x.get("priority"), 9)):
            pc = collections.Counter(tc_pri.get(t) for t in s.get("tc_ids", []))
            r = ctx.reg.get(s["name"])
            last = ctx.scen_last.get(s["name"])
            md.append(f"| {s.get('priority', '')} | {s['name']} | {len(s.get('tc_ids', []))} ({pc['P1']}/{pc['P2']}/{pc['P3'] + pc['P4']}) "
                      f"| {s.get('automation', '')} | {r['status'] if r else '설계'} | "
                      f"{(last[1].get('status', '') + ' ' + _local(last[0].get('startedAt'))) if last else ''} |")
    out = os.path.join(os.path.dirname(P.deliverable), "시나리오_설계.md")
    with open(out, "w", encoding="utf-8") as f:
        f.write("\n".join(md) + "\n")
    return out


def _backup(P, path):
    d = os.path.join(P.work_dir, "backups")
    os.makedirs(d, exist_ok=True)
    stem, ext = os.path.splitext(os.path.basename(path))
    dst = os.path.join(d, f"{stem}_{datetime.datetime.now().strftime('%Y%m%d-%H%M%S')}{ext}")
    shutil.copy2(path, dst)
    olds = sorted(glob.glob(os.path.join(d, f"{glob.escape(stem)}_*{ext}")))
    for o in olds[:-KEEP_BACKUPS]:
        os.remove(o)
    return dst


def _replace(src, dst, tries=10):
    """Windows 백신·인덱서가 잠깐 핸들을 잡는 경우가 있어 짧게 재시도."""
    import time
    for i in range(tries):
        try:
            os.replace(src, dst)
            return
        except PermissionError:
            if i == tries - 1:
                why = workbook_locked(dst)
                raise BuildError(f"저장 실패(파일 사용 중){': ' + why if why else ''} — 기존 파일은 그대로입니다")
            time.sleep(0.5)


def build(P, log=print):
    out = P.deliverable
    if not out:
        raise BuildError("project.json 에 deliverable 경로가 없습니다")
    why = workbook_locked(out)
    if why:
        raise BuildError(f"{why}: {out}")
    src = out if os.path.exists(out) else P.tc_source
    if not src or not os.path.exists(src):
        raise BuildError(f"산출물도 원본 TC 워크북도 없습니다(tc.source 확인): {P.tc_source}")
    if os.path.abspath(src) == os.path.abspath(P.tc_source or "") and os.path.abspath(out) == os.path.abspath(src):
        raise BuildError("deliverable 과 tc.source 가 같은 파일입니다 — 원본을 덮어쓰지 않도록 다른 경로로 지정하세요")
    log(f"[build] {'누적 갱신' if src == out else '원본에서 새로 생성'}: {os.path.basename(out)}")

    ctx = Ctx(P)
    wb = _load_wb(src)
    tc_ws = wb[P.tc["sheet"]] if P.tc.get("sheet") in wb.sheetnames else pick_sheet(wb)[0]
    changed = harvest_verdicts(wb, P, ctx.verdicts)
    if changed:
        write_json(P.verdicts_path, ctx.verdicts)
        log(f"[build] 담당자 판정 {changed}건 수확 → results/verdicts.json")

    st = _styles()
    hr, last_orig, cols = tc_bounds(tc_ws)
    before = _fingerprint(wb, tc_ws.title, last_orig)  # 렌더 전 원본 지문
    render_tc_columns(tc_ws, ctx, st, (hr, last_orig, cols))
    stats = render_sheets(wb, tc_ws, ctx, st, (hr, cols))

    os.makedirs(os.path.dirname(out), exist_ok=True)
    tmp = os.path.join(os.path.dirname(out), "_building_" + os.path.basename(out))
    try:
        wb.save(tmp)
        wb.close()
        chk = _load_wb(tmp)
        after = _fingerprint(chk, tc_ws.title, last_orig)
        chk.close()
        if after != before:
            bad = [k for k in before if before.get(k) != after.get(k)]
            raise BuildError(f"원본 데이터 지문 불일치(저장 취소, 기존 파일 유지): {bad}")
        bk = _backup(P, out) if os.path.exists(out) else None
        _replace(tmp, out)
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)

    tc_pri = {}
    for r in range(hr + 1, tc_ws.max_row + 1):
        t = tc_ws.cell(r, cols["id"]).value
        if t:
            tc_pri[str(t).strip()] = tc_ws.cell(r, cols["priority"]).value if "priority" in cols else None
    md = write_design_md(P, ctx, tc_pri)
    res = stats["results"]
    log(f"[build] 저장: {out}")
    log(f"        원본 데이터 지문 일치({len(before)}개 시트) · 백업: {os.path.relpath(bk, P.root) if bk else '없음(신규)'}")
    log(f"        스크립트 {len(ctx.registry)} · 실행 {len(ctx.runs)}회 · TC 최근 결과 Pass {res.get('Pass', 0)} / Fail {res.get('Fail', 0)} / "
        f"N-T {res.get('N-T', 0)} · 판정 대기 {stats['waiting']}건")
    log(f"        설계 요약: {md}")
    return stats


def main():
    utf8_stdio()
    argv = sys.argv[1:]
    proj = pop_project_arg(argv)
    if argv[:1] != ["build"]:
        print(__doc__)
        sys.exit(2)
    try:
        build(load_project(proj))
    except BuildError as e:
        print(f"[build] 중단: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
